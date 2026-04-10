# Planner: Query Decomposition → Retrieval Spec (Step C)
# route_decision + query -> retrieval_spec (subquestions, source_plan)

import logging
from typing import Any, Dict, List, Optional

from .schemas import RouteDecision, RetrievalSpec, SubQuestion

logger = logging.getLogger(__name__)


def task_plan_user_goal_preview(query: str, context_pack: Optional[Dict[str, Any]]) -> str:
    """짧은 후속 질문 보강 시 query가 길어져도 UI 미리보기는 원문 사용자 메시지를 쓴다."""
    if context_pack and isinstance(context_pack.get("_pipeline_user_query_plain"), str):
        p = context_pack["_pipeline_user_query_plain"].strip()
        if p:
            return p
    return (query or "").strip()


def context_ui_mode_fields(context_pack: Optional[Dict[str, Any]]) -> Dict[str, str]:
    """프론트·로그용: 요청 context의 answer_mode / response_style."""
    out: Dict[str, str] = {}
    if not context_pack:
        return out
    for key in ("answer_mode", "response_style"):
        raw = context_pack.get(key)
        if isinstance(raw, str) and raw.strip():
            out[key] = raw.strip()
    return out


def build_minimal_task_plan(
    route_decision: RouteDecision,
    query: str,
    pipeline_status: str,
    context_pack: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """플래너 이전 중단(refuse 등) 시 라우팅만 담은 요약."""
    row: Dict[str, Any] = {
        "user_goal_preview": task_plan_user_goal_preview(query, context_pack),
        "task_type": route_decision.task_type,
        "answer_schema": route_decision.answer_schema,
        "grounding_required": route_decision.grounding_required,
        "risk_level": route_decision.risk_level,
        "domain": list(route_decision.domain or []),
        "subquestions": [],
        "pipeline_status": pipeline_status,
    }
    row.update(context_ui_mode_fields(context_pack))
    return row


def build_task_plan_snapshot(
    route_decision: RouteDecision,
    retrieval_spec: RetrievalSpec,
    query: str,
    context_pack: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """검색 스펙까지 반영한 과업 계획 스냅샷(프론트·로그·메타용)."""
    subs = []
    for sq in retrieval_spec.subquestions:
        subs.append(
            {
                "id": sq.id,
                "question_preview": (sq.question or "").strip(),
            }
        )
    row: Dict[str, Any] = {
        "user_goal_preview": task_plan_user_goal_preview(query, context_pack),
        "task_type": route_decision.task_type,
        "answer_schema": route_decision.answer_schema,
        "grounding_required": route_decision.grounding_required,
        "risk_level": route_decision.risk_level,
        "domain": list(route_decision.domain or []),
        "subquestion_count": len(subs),
        "subquestions": subs,
    }
    row.update(context_ui_mode_fields(context_pack))
    return row


def make_spec(route_decision: RouteDecision, context_pack: Dict[str, Any], query: str) -> RetrievalSpec:
    """
    Planner 계약: route_decision, context_pack, query -> retrieval_spec.
    MVP: 서브질문 1개(본 질의), internal_rag 1개 소스 플랜.
    """
    q = (query or "").strip()
    if not q:
        return RetrievalSpec(subquestions=[])

    # MVP: 단일 서브질문, internal_rag
    source_plan: List[Dict[str, Any]] = []
    if "internal_rag" in route_decision.sources:
        source_plan.append({"type": "internal_rag", "query": q, "top_k": 8})
    if "web" in route_decision.sources:
        source_plan.append({"type": "web", "query": q, "top_k": 5})
    if not source_plan:
        source_plan.append({"type": "internal_rag", "query": q, "top_k": 8})

    sq = SubQuestion(
        id="sq1",
        question=q,
        source_plan=source_plan,
        required_fields=[],
        freshness={"max_age_days": 365},
        confidence_min=0.7,
    )
    subquestions: List[SubQuestion] = [sq]

    # 장문·expert·고부하 task → 전제/리스크 보조 서브질문 (검색 스펙은 동일 소스 재사용)
    long_q = len(q) >= 400
    expert = (context_pack.get("answer_mode") or "").strip().lower() == "expert"
    heavy_task = route_decision.task_type in (
        "compare",
        "planning",
        "fact_check",
        "how_to",
    )
    if long_q or expert or heavy_task:
        follow_q = (
            "[보완 관점] 위 질의에 답할 때 빠질 수 있는 전제·예외·리스크를 짚기 위한 맥락: "
            + q
        )
        plan_copy = [dict(p) for p in source_plan]
        subquestions.append(
            SubQuestion(
                id="sq2",
                question=follow_q,
                source_plan=plan_copy,
                required_fields=[],
                freshness={"max_age_days": 365},
                confidence_min=0.65,
            )
        )

    return RetrievalSpec(subquestions=subquestions)
