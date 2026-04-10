# Router: Intent / Domain Routing (Step B)
# 규칙 기반 + (선택) LLM. route_decision 산출.

import re
import logging
from typing import Any, Dict, List

from .schemas import RouteDecision

logger = logging.getLogger(__name__)

# 근거 필수 키워드
GROUNDING_KEYWORDS = [
    "사실",
    "확인",
    "검증",
    "팩트",
    "최신",
    "수치",
    "법령",
    "법률",
    "일정",
    "비교",
    "근거",
    "출처",
    "규정",
    "정관",
    "조례",
    "시행령",
    "기준",
    "날짜",
    "금액",
    "비율",
    "기간",
    "출시일",
    "버전",
    "공식",
    "원문",
    "명확히",
    "입증",
]

# 위험 도메인 키워드 → risk_level 상향
RISK_KEYWORDS = {
    "high": ["법률 자문", "의료", "투자 권유", "명예훼손", "진단", "처방"],
    "medium": ["계약", "소송", "규제", "승인", "인가"],
}

# 내부 문서/규정 언급 → internal RAG 우선
INTERNAL_DOC_KEYWORDS = ["내부 문서", "정관", "규정", "사규", "업무 규정", "프로젝트 문서"]


def route(normalized_query: str, context_pack: Dict[str, Any]) -> RouteDecision:
    """
    Router 계약: context_pack, query -> route_decision.
    규칙 기반으로 task_type, grounding_required, risk_level, sources, answer_schema 결정.
    korean_understanding가 있으면 키워드·화행 힌트를 추가로 반영 (초기 기준선).
    """
    q = (normalized_query or "").strip().lower()
    stop_conditions: List[str] = []

    ko = context_pack.get("korean_understanding")
    ko_speech = (ko.get("speech_act") if isinstance(ko, dict) else None) or ""
    ko_genre = (ko.get("genre") if isinstance(ko, dict) else None) or ""

    # 1) grounding_required
    grounding_required = "none"
    if any(kw in normalized_query for kw in GROUNDING_KEYWORDS):
        grounding_required = "required"
    elif any(
        phrase in q
        for phrase in (
            "fact check",
            "fact-check",
            "verify this",
            "is it true",
            "sources for",
            "citation needed",
            "show sources",
            "primary source",
            "peer review",
        )
    ):
        grounding_required = "required"
    elif len(q) > 80 or "?" in normalized_query or "알려" in normalized_query or "설명" in normalized_query:
        grounding_required = "preferred"

    # 1b) 프론트 answer_mode / response_style — 근거 선호 상향 (로드맵 단계 5, 파이프라인 내)
    if grounding_required == "none":
        am = (context_pack.get("answer_mode") or "").strip().lower()
        if am in ("expert", "guided"):
            grounding_required = "preferred"
        else:
            rs_ctx = (context_pack.get("response_style") or "").strip().lower()
            if rs_ctx in ("detailed", "comprehensive"):
                grounding_required = "preferred"

    # 2) risk_level
    risk_level = "low"
    for level, keywords in RISK_KEYWORDS.items():
        if any(kw in normalized_query for kw in keywords):
            risk_level = level
            break
    if risk_level == "high":
        stop_conditions.append("refuse")  # 고정 템플릿/거절 정책 적용

    # 3) sources
    sources: List[str] = ["internal_rag"]
    if any(kw in normalized_query for kw in INTERNAL_DOC_KEYWORDS):
        sources = ["internal_rag"]  # 우선
    if "웹" in normalized_query or "검색" in normalized_query or "최신" in normalized_query:
        sources.append("web")
    # SQL은 도메인/프로젝트 설정에 따라 나중에 확장
    if context_pack.get("project_id") or context_pack.get("projectId"):
        sources.append("internal_rag")

    # 4) task_type
    task_type = "generate"
    if "비교" in normalized_query or "차이" in normalized_query:
        task_type = "compare"
    elif "요약" in normalized_query or "정리" in normalized_query:
        task_type = "summarize"
    elif "어떻게" in q or "방법" in normalized_query or "절차" in normalized_query:
        task_type = "how_to"
    elif any(w in normalized_query for w in ["사실", "확인", "맞아", "아니야"]):
        task_type = "fact_check"
    elif any(
        w in normalized_query
        for w in (
            "기획안",
            "실행안",
            "전략안",
            "로드맵",
            "제안서",
            "운영 계획",
            "사업계획",
        )
    ):
        task_type = "planning"
    elif any(
        phrase in q
        for phrase in (
            "roadmap",
            "strategic plan",
            "action plan",
            "project plan",
            "business case",
            "implementation plan",
        )
    ):
        task_type = "planning"

    # 한국어 프로필 화행 (텍스트 키워드보다 우선하지는 않고 보강)
    if ko_speech == "fact_check_neutral":
        task_type = "fact_check"
    elif ko_speech == "summarize":
        task_type = "summarize"
    elif ko_speech in ("rebuttal_request", "persuade", "rewrite"):
        task_type = "generate"

    # 5) domain (간단 휴리스틱)
    domain: List[str] = []
    if re.search(r"법|규정|조례|소송|계약", normalized_query):
        domain.append("law")
    if re.search(r"부동산|아파트|재건축|정비", normalized_query):
        domain.append("real_estate")
    if re.search(r"개발|코드|API|배포", normalized_query):
        domain.append("dev")
    if not domain:
        domain = ["general"]

    # 6) answer_schema
    answer_schema = "narrative"
    if task_type == "how_to":
        answer_schema = "steps"
    elif task_type == "compare":
        answer_schema = "table"
    if "체크리스트" in normalized_query or "확인" in normalized_query:
        answer_schema = "checklist"

    # need_more_data: 근거 필수인데 아직 검색 전이면 나중에 Retrieval 후 설정 가능
    if grounding_required == "required" and not context_pack.get("evidence_available"):
        pass  # Orchestrator에서 evidence 부족 시 stop_conditions에 추가

    # 법률/행정 장르는 근거 선호 상향
    if ko_genre in ("legal_memo", "administrative") and grounding_required == "none":
        grounding_required = "preferred"

    decision = RouteDecision(
        task_type=task_type,
        domain=domain,
        grounding_required=grounding_required,
        sources=sources,
        risk_level=risk_level,
        answer_schema=answer_schema,
        stop_conditions=stop_conditions,
    )
    logger.info("route_decision: %s", decision.to_dict())
    return decision
