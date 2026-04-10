"""
웹 연구(web-research) API — 프론트 WebResearchModal·DeepResearchModal 연동
main_server(5002)에서 POST /api/analysis/web-research 제공
"""

import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


class WebResearchContext(BaseModel):
    """웹 연구 요청 컨텍스트"""

    project_id: Optional[str] = None
    user_id: Optional[str] = None
    conversation_history: Optional[list] = None
    uploaded_files: Optional[list] = None


class WebResearchRequest(BaseModel):
    """웹 연구 요청"""

    question: str
    context: Optional[WebResearchContext] = None


def _extract_keywords(question: str) -> list:
    """질문에서 핵심 키워드 추출 (범용)"""
    # 간단한 키워드 추출: 2글자 이상 연속 조합
    import re

    words = re.findall(r"[\w가-힣]{2,}", question)
    return list(set(words))[:5] if words else [question[:20]]


def _simulate_web_research(question: str) -> dict:
    """웹 연구 시뮬레이션 (실제 DuckDuckGo/외부 API 미연동)"""
    keywords = _extract_keywords(question)
    q_preview = question[:30] + "..." if len(question) > 30 else question

    sources = [
        {
            "url": "https://example.com/research",
            "title": f"검색 결과: {q_preview}",
            "domain": "example.com",
            "credibility_score": 0.8,
            "source_type": "news",
        },
        {
            "url": "https://duckduckgo.com/?q=" + question.replace(" ", "+"),
            "title": f"DuckDuckGo: {q_preview}",
            "domain": "duckduckgo.com",
            "credibility_score": 0.7,
            "source_type": "web",
        },
        {
            "url": "https://example.com/analysis",
            "title": f"분석 자료: {q_preview}",
            "domain": "example.com",
            "credibility_score": 0.6,
            "source_type": "community",
        },
    ]

    avg_cred = sum(s["credibility_score"] for s in sources) / len(sources)
    high = len([s for s in sources if s["credibility_score"] >= 0.8])
    medium = len([s for s in sources if 0.5 <= s["credibility_score"] < 0.8])
    low = len([s for s in sources if s["credibility_score"] < 0.5])

    return {
        "original_question": question,
        "research_results": {
            "query": question,
            "sources": sources,
            "key_findings": [
                f"{kw} 관련 정보가 {len(sources)}개 소스에서 발견되었습니다."
                for kw in keywords[:3]
            ],
            "consensus_points": [
                f"{kw}에 대한 정보가 여러 소스에서 확인되었습니다."
                for kw in keywords[:2]
            ]
            if keywords
            else ["다양한 관점에서 정보가 수집되었습니다."],
            "credibility_assessment": {
                "high_credibility_sources": high,
                "medium_credibility_sources": medium,
                "low_credibility_sources": low,
                "average_credibility": avg_cred,
            },
            "research_summary": f"총 {len(sources)}개 소스를 분석한 결과, "
            f"{len(keywords)}개의 주요 키워드가 발견되었습니다. "
            "(실제 웹 검색 API 연동 시 더 풍부한 결과가 제공됩니다.)",
        },
        "logical_refutations": [],
        "methodology_assessment": {
            "sample_size": len(sources),
            "source_diversity": len({s["domain"] for s in sources}),
            "methodology_strength": "moderate",
        },
        "conclusion": f"웹 연구 시뮬레이션 결과: '{question}'에 대한 "
        "추가 검증이 필요합니다. 실제 검색 연동은 WEB_SEARCH_AND_RESEARCH.md를 참고하세요.",
        "recommendations": [
            "고신뢰도 소스에서 추가 정보를 수집하세요.",
            "다양한 관점에서 검증을 거치세요.",
        ],
        "confidence_score": avg_cred,
    }


@router.post("/web-research")
async def web_research_analysis(req: WebResearchRequest):
    """웹 연구 기반 분석 (시뮬레이션) — WebResearchModal·DeepResearchModal 연동"""
    if not req.question or not req.question.strip():
        raise HTTPException(status_code=400, detail="분석할 질문이 필요합니다.")

    try:
        result = _simulate_web_research(req.question.strip())
        return {
            "success": True,
            "analysis_type": "web_research",
            "result": result,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        logger.exception("웹 연구 분석 오류: %s", e)
        raise HTTPException(status_code=500, detail=str(e)) from e
