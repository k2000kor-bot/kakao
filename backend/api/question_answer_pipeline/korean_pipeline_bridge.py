# 한국어 이해 프로필 ↔ Q→A 파이프라인 브리지 (초기 기준선)
# @see docs/architecture/GENSPARK_DEEPSEEK_KOREAN_ENGINE_V3.md
# @see docs/architecture/KOREAN_LAYER_IMPLEMENTATION_ROADMAP.md §3

from __future__ import annotations

import logging
from copy import deepcopy
from dataclasses import replace
from typing import Any, Dict, Optional

from .schemas import RouteDecision, RetrievalSpec, SubQuestion

logger = logging.getLogger(__name__)


def _ko_profile(context_pack: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    raw = context_pack.get("korean_understanding")
    return raw if isinstance(raw, dict) else None


def adjust_route_decision_for_korean(
    decision: RouteDecision,
    context_pack: Dict[str, Any],
) -> RouteDecision:
    """
    프론트(또는 추후 서버)에서 받은 korean_understanding으로 라우팅을 보정.
    - speech_act → task_type / grounding
    - genre → context_pack에 generation_mode·플래너 힌트 (Writer·스타일 후속 단계용)
    """
    ko = _ko_profile(context_pack)
    if not ko:
        return decision

    speech = (ko.get("speech_act") or "").strip()
    genre = (ko.get("genre") or "").strip()

    task_type = decision.task_type
    answer_schema = decision.answer_schema
    grounding = decision.grounding_required

    if speech == "fact_check_neutral":
        task_type = "fact_check"
        if grounding == "none":
            grounding = "preferred"
    elif speech == "summarize":
        task_type = "summarize"
    elif speech in ("rebuttal_request", "persuade", "rewrite"):
        # 반박·설득·재작성은 구조화 서술 유지, Writer에서 generation_mode로 조정 가능
        task_type = "generate"
        context_pack.setdefault("_korean_writer_intent", speech)

    if genre == "kakao_message":
        # 강제 one_liner는 장문 카톡 요청을 망가뜨릴 수 있음 → 선호 플래그만
        context_pack.setdefault("korean_output_brevity", "prefer_short")
    elif genre in ("news_article", "press_release"):
        answer_schema = "narrative"
    elif genre in ("legal_memo", "administrative"):
        if grounding == "none":
            grounding = "preferred"
        answer_schema = "narrative"

    if speech or genre:
        logger.info(
            "[Korean Bridge] route adjust: speech_act=%s genre=%s -> task_type=%s grounding=%s",
            speech or "-",
            genre or "-",
            task_type,
            grounding,
        )

    return replace(
        decision,
        task_type=task_type,
        grounding_required=grounding,
        answer_schema=answer_schema,
    )


def adjust_retrieval_spec_for_genre(
    spec: RetrievalSpec,
    context_pack: Dict[str, Any],
) -> RetrievalSpec:
    """장르에 따라 검색 깊이·폭을 완만하게 조정 (초기 휴리스틱)."""
    ko = _ko_profile(context_pack)
    genre = (ko.get("genre") or "").strip() if ko else ""

    if not genre or not spec.subquestions:
        return spec

    new_subs = []
    for sq in spec.subquestions:
        plans = deepcopy(sq.source_plan) if sq.source_plan else []
        for p in plans:
            if not isinstance(p, dict):
                continue
            if genre == "kakao_message":
                p["top_k"] = min(int(p.get("top_k", 8)), 4)
            elif genre in ("legal_memo", "administrative", "business_plan"):
                p["top_k"] = max(int(p.get("top_k", 8)), 10)
        new_subs.append(
            SubQuestion(
                id=sq.id,
                question=sq.question,
                source_plan=plans,
                required_fields=list(sq.required_fields),
                freshness=sq.freshness,
                confidence_min=sq.confidence_min,
            )
        )
    return RetrievalSpec(subquestions=new_subs)


def apply_korean_router_overrides(
    normalized_query: str,
    context_pack: Dict[str, Any],
    base_decision: RouteDecision,
) -> RouteDecision:
    """
    Router 결과에 한국어 프로필 보정을 합성.
    (router.route가 context_pack을 아직 쓰지 않을 때를 대비해 오케스트레이터에서 호출)
    """
    _ = normalized_query  # 향후 쿼리+normalized_input 병합 분류용
    return adjust_route_decision_for_korean(base_decision, context_pack)
