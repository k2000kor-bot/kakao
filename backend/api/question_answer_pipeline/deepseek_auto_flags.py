# DeepSeek 파이프라인 옵트인 자동화 — 복잡도 휴리스틱 (v2 §11 비용 가드 보조)
# - deepseek_review_layer_hints + DEEPSEEK_API_KEY 전제
# - context에 pipeline_deepseek_reasoner / pipeline_deepseek_refine 키가 없을 때만 채움 (명시적 값이 있으면 존중)
# - 환경: PIPELINE_DEEPSEEK_REASONER_AUTO, PIPELINE_DEEPSEEK_REFINE_AUTO

from __future__ import annotations

import os
from typing import Any, Dict

from .schemas import RouteDecision


def _truthy_env(name: str) -> bool:
    return os.getenv(name, "").lower() in ("1", "true", "yes")


def _auto_thresholds() -> Dict[str, Any]:
    try:
        from pipeline_tuning import get_config

        da = get_config().get("deepseek_auto")
        if isinstance(da, dict):
            return da
    except Exception:
        pass
    return {}


def _wants_reasoner_heuristic(
    rd: RouteDecision, qlen: int, q: str, *, reasoner_min_len: int
) -> bool:
    if rd.risk_level == "high":
        return False
    if rd.task_type in ("compare", "how_to", "fact_check", "planning"):
        return True
    if rd.grounding_required == "required":
        return True
    if rd.answer_schema in ("table", "steps", "checklist"):
        return True
    if qlen >= reasoner_min_len:
        return True
    keywords = (
        "전략",
        "정책",
        "반박",
        "논증",
        "타당성",
        "리스크",
        "대안 비교",
        "실무 절차",
        "기획안",
        "보고서",
    )
    if any(k in q for k in keywords):
        return True
    return False


def _wants_refine_heuristic(
    rd: RouteDecision, qlen: int, q: str, *, refine_min_len: int
) -> bool:
    if qlen >= refine_min_len:
        return True
    if rd.task_type in ("compare", "how_to", "summarize", "fact_check", "planning"):
        return True
    if rd.answer_schema in ("table", "steps", "checklist"):
        return True
    if any(k in q for k in ("목차", "표로", "체크리스트", "단계별")):
        return True
    return False


def apply_auto_deepseek_pipeline_flags(
    context_pack: Dict[str, Any],
    route_decision: RouteDecision,
    normalized_query: str,
) -> None:
    """
    In-place: context_pack에 pipeline_deepseek_reasoner / pipeline_deepseek_refine 설정 가능.
    """
    if not context_pack.get("deepseek_review_layer_hints"):
        return
    if not (os.getenv("DEEPSEEK_API_KEY", "") or "").strip():
        return

    q = (normalized_query or "").strip()
    qlen = len(q)
    th = _auto_thresholds()
    try:
        reasoner_min = int(th.get("reasoner_min_query_len", 500))
    except (TypeError, ValueError):
        reasoner_min = 500
    try:
        refine_min = int(th.get("refine_min_query_len", 280))
    except (TypeError, ValueError):
        refine_min = 280
    try:
        reasoner_max = int(th.get("reasoner_max_query_len", 0) or 0)
    except (TypeError, ValueError):
        reasoner_max = 0
    try:
        refine_max = int(th.get("refine_max_query_len", 0) or 0)
    except (TypeError, ValueError):
        refine_max = 0
    prefer_single = bool(th.get("prefer_single_deepseek_stage"))

    auto_reasoner = False
    auto_refine = False

    if _truthy_env("PIPELINE_DEEPSEEK_REASONER_AUTO"):
        if "pipeline_deepseek_reasoner" not in context_pack:
            over_max = reasoner_max > 0 and qlen > reasoner_max
            if not over_max and _wants_reasoner_heuristic(
                route_decision, qlen, q, reasoner_min_len=reasoner_min
            ):
                context_pack["pipeline_deepseek_reasoner"] = True
                auto_reasoner = True

    if _truthy_env("PIPELINE_DEEPSEEK_REFINE_AUTO"):
        if "pipeline_deepseek_refine" not in context_pack:
            over_max = refine_max > 0 and qlen > refine_max
            if not over_max and _wants_refine_heuristic(
                route_decision, qlen, q, refine_min_len=refine_min
            ):
                context_pack["pipeline_deepseek_refine"] = True
                auto_refine = True

    if prefer_single and auto_reasoner and auto_refine:
        context_pack.pop("pipeline_deepseek_refine", None)
