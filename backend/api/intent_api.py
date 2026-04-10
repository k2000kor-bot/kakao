"""
의도·키워드 분석 API (FastAPI)
Flask main.py의 POST /api/intent/analyze와 동일한 응답 형식.
"""

import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from api.intent_analysis import analyze_intent_only

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["intent"])


class IntentAnalyzeRequest(BaseModel):
    """의도 분석 요청 본문"""

    message: str = Field(..., min_length=1, description="분석할 메시지")


@router.post(
    "/intent/analyze",
    summary="의도·키워드 분석",
    description="메시지의 의도(type, confidence)와 키워드 리스트만 반환. 대화 응답 생성 없음.",
)
def intent_analyze(body: IntentAnalyzeRequest):
    """의도·키워드 분석 전용 API."""
    try:
        message = (body.message or "").strip()
        if not message:
            raise HTTPException(status_code=400, detail="메시지가 비어있습니다.")
        result = analyze_intent_only(message)
        return {"success": True, "data": result, "timestamp": datetime.now().isoformat()}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("의도 분석 API 오류: %s", e)
        raise HTTPException(status_code=500, detail=f"서버 오류: {e!s}")
