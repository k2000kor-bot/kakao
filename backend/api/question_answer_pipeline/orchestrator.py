# Conversation Orchestrator: 상태머신 실행 (Step A→B→C→D→E→F→G→H)
# trace_id 단위 로그, Evidence 스냅샷, 최종 응답 반환

import logging
import os
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from .router import route
from .planner import (
    make_spec,
    build_minimal_task_plan,
    build_task_plan_snapshot,
    context_ui_mode_fields,
)
from .schemas import RouteDecision
from .korean_pipeline_bridge import (
    adjust_route_decision_for_korean,
    adjust_retrieval_spec_for_genre,
)
from .answer_blueprint import (
    build_answer_blueprint_markdown,
    wants_blueprint_first,
)
from .next_actions_hint import suggest_next_actions
from .generation_scenario import build_generation_scenario_markdown
from .retriever_adapter import retrieve
from .synthesis import synthesize
from .writer import write_draft
from .verifier import verify
from .style_dictionary import resolve_style_profile
from .style_renderer import render as style_render, extract_style_request_from_query
from .creative_generation import generate_alternatives, generate_follow_up_questions
from .korean_quality_scorer import score_korean_output
from .deepseek_optional_refine import maybe_refine_final_answer
from .deepseek_reasoner_critique import maybe_critique_final_answer
from .deepseek_auto_flags import apply_auto_deepseek_pipeline_flags
from .conversation_thread import (
    augment_short_followup_query_for_router,
    build_writer_transcript_coherence_block,
    merge_prior_conversation_turns_into_evidence,
)

try:
    from api.memory_context_hint import attach_advanced_memory_instruction
except ImportError:
    def attach_advanced_memory_instruction(_ctx):  # type: ignore
        pass

logger = logging.getLogger(__name__)


def _normalize_and_context_load(message: str, context: Dict[str, Any]):
    """Step A: 입력 정규화 + 컨텍스트 로드."""
    normalized_query = (message or "").strip()
    context_pack = dict(context or {})
    # multilayer_style_hint·korean_understanding 등 요청 context 키는 여기서 그대로 유지되어 Writer·DeepSeek 정리·통합 엔진으로 전달됨
    context_pack.setdefault("recent_summary", [])
    context_pack.setdefault("trace_time", datetime.utcnow().isoformat() + "Z")
    attach_advanced_memory_instruction(context_pack)
    # generate_chat_response를 거치지 않고 run_pipeline만 호출되는 경로(main 등)용
    if not context_pack.get("_multi_request_instruction"):
        try:
            from api.unified_chat_api import _compose_multi_request_instruction

            _mri = _compose_multi_request_instruction(context_pack)
            if _mri:
                context_pack["_multi_request_instruction"] = _mri
        except Exception as e:
            logger.debug("multi_request instruction compose skipped: %s", e)
    return normalized_query, context_pack


def run_pipeline(
    message: str,
    context: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    질문→답변 파이프라인 실행.
    Returns: { "success": bool, "response": str, "trace_id": str, "route_decision": {...}, ... }
    """
    trace_id = f"trace_{uuid.uuid4().hex[:12]}"
    context = context or {}
    try:
        # A. Normalize & Context Load
        normalized_query, context_pack = _normalize_and_context_load(message, context)
        if not normalized_query:
            _empty_rd = RouteDecision(
                task_type="generate",
                domain=[],
                grounding_required="preferred",
                sources=[],
                risk_level="low",
                answer_schema="narrative",
            )
            return {
                "success": False,
                "response": "입력된 질문이 비어 있습니다.",
                "trace_id": trace_id,
                "error": "empty_query",
                "route_decision": _empty_rd.to_dict(),
                "verification_summary": {
                    "skipped": True,
                    "reason": "empty_query",
                },
                "task_plan": {
                    "pipeline_status": "empty_query",
                    "user_goal_preview": "",
                    "task_type": _empty_rd.task_type,
                    "answer_schema": _empty_rd.answer_schema,
                    "grounding_required": _empty_rd.grounding_required,
                    "risk_level": _empty_rd.risk_level,
                    "domain": [],
                    "subquestions": [],
                    **context_ui_mode_fields(context_pack),
                },
                "next_actions": suggest_next_actions(
                    _empty_rd,
                    "",
                    verification_pass=False,
                    evidence_coverage=0.0,
                    korean_genre=None,
                ),
            }

        context_pack["_pipeline_user_query_plain"] = normalized_query.strip()
        _aug_q = augment_short_followup_query_for_router(normalized_query, context_pack)
        if _aug_q != normalized_query:
            logger.info(
                "pipeline: augmented short follow-up for route/retrieve (%d→%d chars)",
                len(normalized_query),
                len(_aug_q),
            )
            normalized_query = _aug_q
        _query_for_user_facing = (
            (context_pack.get("_pipeline_user_query_plain") or "").strip() or normalized_query
        )

        # 프로젝트 노트북 컨텍스트 로드 (기존 로직 활용)
        project_id = context.get("project_id") or context.get("projectId")
        if project_id:
            try:
                from api.project_session_api import load_project_notebook_context_filtered
                source_ids = context.get("source_ids")
                if source_ids is not None and not isinstance(source_ids, list):
                    source_ids = None
                project_context_text = load_project_notebook_context_filtered(
                    project_id, source_ids=source_ids
                )
                if project_context_text and project_context_text.strip():
                    context_pack["projectKnowledge"] = project_context_text.strip()
                    context_pack["evidence_available"] = True
            except Exception as e:
                logger.warning("프로젝트 컨텍스트 로드 실패: %s", e)
        context_pack.setdefault("evidence_available", bool(context_pack.get("projectKnowledge")))

        # B. Router (+ 한국어 프로필 보정, v3 초기 기준선)
        route_decision = route(normalized_query, context_pack)
        route_decision = adjust_route_decision_for_korean(route_decision, context_pack)
        apply_auto_deepseek_pipeline_flags(
            context_pack, route_decision, normalized_query
        )

        if wants_blueprint_first(context_pack, normalized_query):
            context_pack["_answer_blueprint_markdown"] = build_answer_blueprint_markdown(
                route_decision, normalized_query, context_pack
            )
            logger.info("[Blueprint] answer outline injected (expert/long/detail)")

        if "refuse" in route_decision.stop_conditions:
            ko_r = context_pack.get("korean_understanding")
            kg_r = ko_r.get("genre") if isinstance(ko_r, dict) else None
            context_pack.pop("_pipeline_user_query_plain", None)
            context_pack.pop("_answer_blueprint_markdown", None)
            return {
                "success": True,
                "response": "해당 유형의 질문은 정책상 상세 답변을 제공하기 어렵습니다. 전문가 상담을 권합니다.",
                "trace_id": trace_id,
                "route_decision": route_decision.to_dict(),
                "verification_summary": {
                    "skipped": True,
                    "reason": "policy_refusal",
                },
                "task_plan": build_minimal_task_plan(
                    route_decision,
                    normalized_query,
                    "refused_policy",
                    context_pack,
                ),
                "next_actions": suggest_next_actions(
                    route_decision,
                    _query_for_user_facing,
                    verification_pass=False,
                    evidence_coverage=0.0,
                    korean_genre=kg_r,
                ),
            }

        # C. Planner
        retrieval_spec = make_spec(route_decision, context_pack, normalized_query)
        retrieval_spec = adjust_retrieval_spec_for_genre(retrieval_spec, context_pack)

        _tp = build_task_plan_snapshot(
            route_decision,
            retrieval_spec,
            normalized_query,
            context_pack,
        )
        context_pack["_task_plan_for_response"] = _tp
        context_pack["_writer_route_hint"] = (
            f"[라우팅] task={route_decision.task_type}, "
            f"schema={route_decision.answer_schema}, "
            f"grounding={route_decision.grounding_required}, "
            f"subq={len(retrieval_spec.subquestions)}"
        )
        _base_gs = build_generation_scenario_markdown(
            normalized_query,
            route_decision,
            retrieval_spec,
            context_pack,
        )
        _cgr = context_pack.get("client_generation_scenario")
        _client_gs = (
            _cgr.strip()
            if isinstance(_cgr, str) and _cgr.strip()
            else ""
        )
        if _client_gs and _client_gs not in _base_gs:
            context_pack["_generation_scenario_markdown"] = (
                _base_gs + "\n\n### 클라이언트 추가 시나리오\n\n" + _client_gs
            )
        else:
            context_pack["_generation_scenario_markdown"] = _base_gs

        # D. Retrieval
        evidence_bundle = retrieve(retrieval_spec, context_pack)
        # 다턴 대화: Genspark agents처럼 이전 user/assistant 턴을 근거에 합쳐 후속 질의가 맥락을 잃지 않게 함
        evidence_bundle = merge_prior_conversation_turns_into_evidence(
            evidence_bundle, context_pack, normalized_query
        )
        _coh = build_writer_transcript_coherence_block(context_pack, normalized_query)
        if _coh:
            context_pack["_conversation_coherence_for_writer"] = _coh
        # 자료 근거 부족 시 스스로 영상 검색·자막 습득 후 재검색(별도 UI 없이 답변 생성 과정에 통합)
        if route_decision.grounding_required == "required" and evidence_bundle.coverage < 0.3:
            try:
                from api.video_knowledge import fetch_knowledge_for_query_sync
                video_knowledge = fetch_knowledge_for_query_sync(
                    normalized_query, max_videos=2, understand=True
                )
                if video_knowledge and video_knowledge.strip():
                    existing = (context_pack.get("projectKnowledge") or "").strip()
                    context_pack["projectKnowledge"] = (
                        (existing + "\n\n" + video_knowledge) if existing else video_knowledge
                    )
                    evidence_bundle = retrieve(retrieval_spec, context_pack)
                    evidence_bundle = merge_prior_conversation_turns_into_evidence(
                        evidence_bundle, context_pack, normalized_query
                    )
                    logger.info(
                        "근거 부족 시 영상 지식 습득 후 재검색: coverage %.2f -> %.2f",
                        0.3, evidence_bundle.coverage,
                    )
                    # 습득한 영상 지식을 프로젝트 노트북에 저장해 이후 대화에서도 사용
                    project_id = context_pack.get("project_id") or context_pack.get("projectId")
                    if project_id:
                        try:
                            from api.project_session_api import add_project_notebook_source
                            title = f"영상 검색: {normalized_query}"
                            add_project_notebook_source(
                                project_id, title=title, content=video_knowledge.strip(), source_type="youtube"
                            )
                            logger.info("습득한 영상 지식 프로젝트 노트북에 저장: project_id=%s", project_id)
                        except Exception as e_psa:
                            logger.debug("영상 지식 프로젝트 저장 실패: %s", e_psa)
            except Exception as e:
                logger.debug("영상 지식 자동 습득 단계 무시: %s", e)
        if route_decision.grounding_required == "required" and evidence_bundle.coverage < 0.3:
            ko0 = context_pack.get("korean_understanding")
            kg0 = ko0.get("genre") if isinstance(ko0, dict) else None
            _tp_fail = dict(context_pack.get("_task_plan_for_response") or {})
            _tp_fail["pipeline_status"] = "insufficient_evidence"
            _tp_fail["evidence_coverage"] = evidence_bundle.coverage
            context_pack.pop("_conversation_coherence_for_writer", None)
            context_pack.pop("_pipeline_user_query_plain", None)
            return {
                "success": True,
                "response": "관련 자료를 찾지 못해 확실한 답변을 드리기 어렵습니다. 프로젝트에 참고 자료를 올리거나 질문을 구체화해 주세요.",
                "trace_id": trace_id,
                "route_decision": route_decision.to_dict(),
                "evidence_coverage": evidence_bundle.coverage,
                "verification_summary": {
                    "skipped": True,
                    "reason": "insufficient_evidence",
                    "evidence_coverage": evidence_bundle.coverage,
                },
                "task_plan": _tp_fail,
                "next_actions": suggest_next_actions(
                    route_decision,
                    _query_for_user_facing,
                    verification_pass=False,
                    evidence_coverage=evidence_bundle.coverage,
                    korean_genre=kg0,
                ),
            }

        # E. Synthesis
        claim_graph = synthesize(evidence_bundle)

        # F. Writer
        draft_answer = write_draft(
            claim_graph,
            evidence_bundle,
            route_decision,
            normalized_query,
            context_pack,
        )

        # G. Verifier (+ 선택: 1회 Writer 재작성 — 검수 이슈를 LLM 다듬기 프롬프트에 주입)
        verifier_rewrite_attempted = False
        verification_report = verify(
            draft_answer,
            claim_graph,
            evidence_bundle,
            route_decision.grounding_required,
            context_pack=context_pack,
        )
        # 검수 실패 시 Writer 1회 재실행
        # - pipeline_verifier_rewrite 명시 False → expert/guided·환경변수보다 우선해 끔
        # - 명시 True → 항상 켬 / 미설정(None) → expert|guided 또는 PIPELINE_VERIFIER_REWRITE 환경변수
        # - answer_mode fast 등은 기본 재작성 없음(지연·비용)
        _rewrite_env = (os.getenv("PIPELINE_VERIFIER_REWRITE") or "").strip().lower()
        _am = (context_pack.get("answer_mode") or "").strip().lower()
        _pr_raw = context_pack.get("pipeline_verifier_rewrite")
        if isinstance(_pr_raw, str):
            _prs = _pr_raw.strip().lower()
            if _prs in ("0", "false", "no", "off"):
                _pr_flag = False
            elif _prs in ("1", "true", "yes", "on"):
                _pr_flag = True
            else:
                _pr_flag = None
        else:
            _pr_flag = _pr_raw
        if _pr_flag is False:
            _rewrite_on = False
        elif _pr_flag is True:
            _rewrite_on = True
        else:
            _rewrite_on = _am in ("expert", "guided") or _rewrite_env in (
                "1",
                "true",
                "yes",
                "on",
            )
        if not verification_report.pass_ and _rewrite_on:
            try:
                issues = list(verification_report.issues or [])
                fixes = list(verification_report.fix_actions or [])
                context_pack["_verifier_issues_for_polish"] = "\n".join(f"- {i}" for i in issues)
                if fixes:
                    context_pack["_verifier_fix_actions_for_polish"] = "\n".join(
                        f"- {f}" for f in fixes
                    )
                draft_answer = write_draft(
                    claim_graph,
                    evidence_bundle,
                    route_decision,
                    normalized_query,
                    context_pack,
                )
                verification_report = verify(
                    draft_answer,
                    claim_graph,
                    evidence_bundle,
                    route_decision.grounding_required,
                    context_pack=context_pack,
                )
                verifier_rewrite_attempted = True
                logger.info(
                    "verifier rewrite: re-ran writer+verify, pass=%s",
                    verification_report.pass_,
                )
            finally:
                context_pack.pop("_verifier_issues_for_polish", None)
                context_pack.pop("_verifier_fix_actions_for_polish", None)

        if not verification_report.pass_ and route_decision.grounding_required == "required":
            draft_answer = (
                draft_answer + "\n\n---\n*일부 항목은 검증 시 이슈가 있어 위 내용만 참고해 주시고, 필요 시 추가 자료를 요청해 주세요.*"
            )

        # H. Finalize + 스타일 렌더링 (내용 생성 후 마지막에만 스타일 적용, 사실 변경 금지)
        final_response = draft_answer.strip() or "답변을 생성할 수 없습니다. 다시 시도해 주세요."
        style_request = context.get("style_request") or extract_style_request_from_query(normalized_query)
        style_profile = resolve_style_profile(style_request)
        if style_profile:
            final_response = style_render(final_response, style_profile, context_pack)
            logger.info("style applied: %s", style_profile.style)

        korean_quality_scores = score_korean_output(final_response, context_pack)

        deepseek_critique = None
        deepseek_reasoner_meta = None
        critique, reasoner_meta = maybe_critique_final_answer(
            final_response, normalized_query, context_pack
        )
        if critique is not None:
            deepseek_critique = critique
            context_pack["deepseek_critique_for_refine"] = critique
        if reasoner_meta is not None:
            deepseek_reasoner_meta = reasoner_meta

        refined_text, deepseek_refine_meta = maybe_refine_final_answer(
            final_response, context_pack
        )
        context_pack.pop("deepseek_critique_for_refine", None)
        if deepseek_refine_meta and deepseek_refine_meta.get("refine_applied"):
            final_response = refined_text

        # 혁신적 생성: 대안 초안, 확장 질문 (선택)
        response_alternatives: list = []
        follow_up_questions: list = []
        if context.get("include_variants"):
            response_alternatives = generate_alternatives(final_response, context_pack, max_n=2)
        if context.get("include_follow_ups"):
            follow_up_questions = generate_follow_up_questions(
                final_response, normalized_query, context_pack, max_n=3
            )

        logger.info(
            "pipeline complete trace_id=%s grounding=%s coverage=%.2f verify_pass=%s",
            trace_id,
            route_decision.grounding_required,
            evidence_bundle.coverage,
            verification_report.pass_,
        )
        _issues = list(verification_report.issues or [])
        _fixes = list(verification_report.fix_actions or [])
        out = {
            "success": True,
            "response": final_response,
            "trace_id": trace_id,
            "route_decision": route_decision.to_dict(),
            "evidence_coverage": evidence_bundle.coverage,
            "verification_pass": verification_report.pass_,
            "verification_summary": {
                "pass": verification_report.pass_,
                "issue_count": len(_issues),
                "issues_preview": list(_issues),
                "fix_actions_preview": list(_fixes),
                "verifier_rewrite_attempted": verifier_rewrite_attempted,
            },
            "korean_quality_scores": korean_quality_scores,
            "analysis": {
                "response_time": 0,
                "intent": {"type": route_decision.task_type, "domain": route_decision.domain},
            },
        }
        if deepseek_refine_meta:
            out["deepseek_refine_meta"] = deepseek_refine_meta
        if deepseek_critique is not None:
            out["deepseek_critique"] = deepseek_critique
        if deepseek_reasoner_meta is not None:
            out["deepseek_reasoner_meta"] = deepseek_reasoner_meta
        if style_profile:
            out["style_applied"] = style_profile.to_dict()
        if response_alternatives:
            out["response_alternatives"] = response_alternatives
        if follow_up_questions:
            out["follow_up_questions"] = follow_up_questions

        ko_f = context_pack.get("korean_understanding")
        kg_f = ko_f.get("genre") if isinstance(ko_f, dict) else None
        out["next_actions"] = suggest_next_actions(
            route_decision,
            _query_for_user_facing,
            verification_pass=verification_report.pass_,
            evidence_coverage=evidence_bundle.coverage,
            korean_genre=kg_f,
        )
        bp_md = (context_pack.get("_answer_blueprint_markdown") or "").strip()
        if bp_md:
            out["answer_blueprint"] = bp_md

        _tp_out = dict(context_pack.get("_task_plan_for_response") or {})
        _tp_out.setdefault("pipeline_status", "completed")
        _tp_out["evidence_coverage"] = evidence_bundle.coverage
        _tp_out["evidence_item_count"] = len(evidence_bundle.items or [])
        _tp_out["evidence_nonempty_count"] = len(
            [e for e in (evidence_bundle.items or []) if (e.content or "").strip()]
        )
        out["task_plan"] = _tp_out
        _inc_gs = context_pack.get("include_generation_scenario_in_response")
        _inc_gs_on = _inc_gs is True or (
            isinstance(_inc_gs, str)
            and _inc_gs.strip().lower() in ("1", "true", "yes", "on")
        )
        _gs_md = (context_pack.get("_generation_scenario_markdown") or "").strip()
        if _inc_gs_on and _gs_md:
            out["generation_scenario"] = _gs_md

        context_pack.pop("_task_plan_for_response", None)
        context_pack.pop("_writer_route_hint", None)
        context_pack.pop("_generation_scenario_markdown", None)
        context_pack.pop("_conversation_coherence_for_writer", None)
        context_pack.pop("_pipeline_user_query_plain", None)

        if verification_report.korean_style_notes:
            out["korean_style_notes"] = verification_report.korean_style_notes

        return out
    except Exception as e:
        logger.exception("pipeline error trace_id=%s: %s", trace_id, e)
        _cp_err = locals().get("context_pack")
        if isinstance(_cp_err, dict):
            _cp_err.pop("_conversation_coherence_for_writer", None)
            _cp_err.pop("_pipeline_user_query_plain", None)
        return {
            "success": False,
            "response": "처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
            "trace_id": trace_id,
            "error": str(e),
            "verification_summary": {
                "skipped": True,
                "reason": "pipeline_error",
            },
            "task_plan": {
                "pipeline_status": "error",
                "user_goal_preview": (message or "").strip(),
                **context_ui_mode_fields(context or {}),
            },
        }
