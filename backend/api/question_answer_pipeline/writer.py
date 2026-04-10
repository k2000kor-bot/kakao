# Writer: claim_graph + answer_schema -> draft_answer (Step F)
# 근거-바인딩 생성. 근거 없는 새 사실 추가 금지. LLM은 선택 호출.

import logging
import os
from typing import Any, Dict, List, Optional

from .schemas import ClaimGraph, EvidenceBundle, RouteDecision

logger = logging.getLogger(__name__)


def _prepend_answer_blueprint(body: str, context_pack: Dict[str, Any]) -> str:
    """expert/장문 등에서 주입된 개요를 본문 앞에 고정."""
    bp = (context_pack.get("_answer_blueprint_markdown") or "").strip()
    if bp:
        return bp + "\n\n---\n\n" + body
    return body


def write_draft(
    claim_graph: ClaimGraph,
    evidence_bundle: EvidenceBundle,
    route_decision: RouteDecision,
    query: str,
    context_pack: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Writer 계약: claim_graph, answer_schema -> draft_answer.
    MVP: claim 문장들을 answer_schema에 맞게 나열, citation은 claim_id 유지.
    LLM 호출 시에는 claim/evidence만 넘기고 "근거 없는 새 사실 추가 금지" 지시.
    """
    context_pack = context_pack or {}
    generation_mode = (context_pack.get("generation_mode") or "").strip()
    # 카톡 등 짧은 출력 선호 시 one_liner 모드(근거 나열은 유지, LLM 다듬기에서 압축)
    if (
        not generation_mode
        and context_pack.get("korean_output_brevity") == "prefer_short"
        and len(query or "") < 500
    ):
        generation_mode = "one_liner"

    if generation_mode in ("one_liner", "three_key_points", "action_checklist", "counter_argument"):
        from .creative_generation import apply_generation_mode
        mode_draft = apply_generation_mode(claim_graph, route_decision, generation_mode, context_pack)
        if mode_draft:
            bp_early = (context_pack.get("_answer_blueprint_markdown") or "").strip()
            if bp_early:
                return bp_early + "\n\n---\n\n" + mode_draft
            return mode_draft

    schema = route_decision.answer_schema or "narrative"
    ev_by_id = {e.evidence_id: e for e in evidence_bundle.items}

    lines: List[str] = []
    if schema == "steps":
        lines.append("**절차**")
        lines.append("")
        for i, c in enumerate(claim_graph.claims, 1):
            if c.claim_id == "c0" and not c.supporting:
                lines.append(f"{i}. {c.statement}")
            else:
                lines.append(f"{i}. {c.statement}")
                if c.supporting:
                    lines.append(f"   (근거: {', '.join(c.supporting)})")
        return _prepend_answer_blueprint("\n".join(lines), context_pack)

    if schema == "checklist":
        lines.append("**확인 항목**")
        lines.append("")
        for c in claim_graph.claims:
            lines.append(f"- [ ] {c.statement}")
        return _prepend_answer_blueprint("\n".join(lines), context_pack)

    if schema == "table":
        lines.append("| 항목 | 내용 | 근거 |")
        lines.append("|------|------|------|")
        for c in claim_graph.claims:
            refs = ", ".join(c.supporting) if c.supporting else "—"
            lines.append(f"| {c.claim_id} | {c.statement} | {refs} |")
        return _prepend_answer_blueprint("\n".join(lines), context_pack)

    # narrative (기본)
    lines.append("**답변**")
    lines.append("")
    for c in claim_graph.claims:
        lines.append(c.statement)
        if c.supporting:
            lines.append(f"*(근거: {', '.join(c.supporting)})*")
        lines.append("")
    draft = _prepend_answer_blueprint("\n".join(lines).strip(), context_pack)

    # 선택: LLM이 있으면 claim만 넘겨 재작성(문장 다듬기), 단 사실 변경 금지
    # 지연·비용 절감: PIPELINE_WRITER_SKIP_LLM_POLISH 또는 context.pipeline_skip_writer_llm_polish
    _skip_llm_polish = context_pack.get("pipeline_skip_writer_llm_polish") is True
    if not _skip_llm_polish:
        _env_skip = (os.getenv("PIPELINE_WRITER_SKIP_LLM_POLISH") or "").strip().lower()
        _skip_llm_polish = _env_skip in ("1", "true", "yes", "on")

    if _skip_llm_polish:
        logger.info("Writer: LLM 다듬기 생략(pipeline_skip 또는 PIPELINE_WRITER_SKIP_LLM_POLISH)")
        return draft

    try:
        from api.unified_chat_api import generate_chat_response
        import asyncio

        ko_bits: List[str] = []
        ami = (context_pack.get("_advanced_memory_instruction") or "").strip()
        if ami:
            ko_bits.append(ami)
        kli = (context_pack.get("korean_layer_instruction") or "").strip()
        if kli:
            ko_bits.append("[한국어 이해·출력 계층]\n" + kli)
        _mlh = context_pack.get("multilayer_style_hint")
        if _mlh and isinstance(_mlh, (dict, list)):
            try:
                import json as _json

                ko_bits.append(
                    "[다층 스타일 힌트]\n"
                    + _json.dumps(_mlh, ensure_ascii=False)
                )
            except (TypeError, ValueError):
                pass
        intent = (context_pack.get("_korean_writer_intent") or "").strip()
        if intent == "rebuttal_request":
            ko_bits.append("사용자는 반박·대응 문장을 원합니다. 근거 범위 안에서 논지를 명확히 하세요.")
        elif intent == "persuade":
            ko_bits.append("설득·호소 톤이 자연스럽게 드러나도록 다듬되, 새 사실은 추가하지 마세요.")
        if context_pack.get("korean_output_brevity") == "prefer_short":
            ko_bits.append("짧은 문장·카톡에 붙여넣기 좋은 호흡을 우선하세요.")
        mri = (context_pack.get("_multi_request_instruction") or "").strip()
        if mri:
            ko_bits.append(
                "[다중 질문·요구] 사용자가 여러 항목을 제시했습니다. "
                "초안이 모든 항목을 다루도록 문장만 다듬고, 항목을 합치거나 누락하지 마세요.\n"
                + mri
            )
        _conv_coh = (context_pack.get("_conversation_coherence_for_writer") or "").strip()
        if _conv_coh:
            ko_bits.append(_conv_coh)
        gs = (context_pack.get("_generation_scenario_markdown") or "").strip()
        if gs:
            ko_bits.append(
                "[생성 시나리오] 아래 순서·검증 포인트를 존중해 다듬으세요. "
                "근거 밖 새 사실·수치는 추가하지 마세요.\n" + gs
            )

        route_hint = (context_pack.get("_writer_route_hint") or "").strip()
        hint_block = (
            (route_hint + "\n\n") if route_hint else ""
        )
        v_issues = (context_pack.get("_verifier_issues_for_polish") or "").strip()
        v_fixes = (context_pack.get("_verifier_fix_actions_for_polish") or "").strip()
        if v_issues or v_fixes:
            hint_block += (
                "[검수 피드백] 아래를 반영해 초안을 고치세요. "
                "근거에 없는 새 사실·날짜·수치는 추가하지 마세요.\n"
                + (v_issues + "\n\n" if v_issues else "")
                + (v_fixes + "\n\n" if v_fixes else "")
            )
        prompt = (
            "다음은 근거로만 구성된 답변 초안입니다. 문장만 자연스럽게 다듬어 주세요. "
            "새 사실을 추가하거나 숫자/날짜를 바꾸지 마세요.\n\n"
            + hint_block
            + ("\n\n".join(ko_bits) + "\n\n" if ko_bits else "")
            + "초안:\n"
            + draft
        )
        # 파이프라인 재진입 방지(generate_chat_response가 다시 run_pipeline 타는 것 방지)
        polish_ctx = {
            k: v
            for k, v in (context_pack or {}).items()
            if k not in ("use_pipeline_v2", "agentic_pipeline")
        }
        polish_ctx["_skip_qa_pipeline"] = True

        try:
            rewritten = asyncio.run(
                generate_chat_response(prompt, "enhanced", polish_ctx)
            )
        except RuntimeError:
            loop = asyncio.get_event_loop()
            rewritten = loop.run_until_complete(
                generate_chat_response(prompt, "enhanced", polish_ctx)
            )
        if rewritten and len(rewritten.strip()) > 50:
            draft = rewritten.strip()
            logger.info("Writer: LLM으로 초안 다듬기 적용")
    except Exception as e:
        logger.warning("Writer LLM 미적용(기본 나열 사용): %s", e)

    return draft
