"""
파이프라인 튜닝 API — 설정 조회(GET) / 관리자 전용 저장(POST).
쓰기는 PIPELINE_TUNING_SECRET 환경 변수와 일치할 때만 허용. 누구도 함부로 넘볼 수 없음.
"""
import logging
import os
from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["pipeline-tuning"])


class PipelineTuningUpdate(BaseModel):
    """POST body: 시크릿 + 적용할 설정 일부."""
    secret: Optional[str] = None
    config: Optional[Dict[str, Any]] = None


@router.get("/llm-internal-security", summary="LLM 내부 보안 정책 상태(민감값 없음)")
async def get_llm_internal_security() -> Dict[str, Any]:
    """에어갭·DeepSeek 클라우드 차단·외부 수집 차단 여부. 운영 모니터링용."""
    try:
        from llm_internal_security import security_status_dict

        return {"success": True, **security_status_dict()}
    except ImportError:
        return {
            "success": False,
            "error": "llm_internal_security 모듈 없음",
        }


@router.get("/pipeline-tuning", summary="파이프라인 튜닝 설정 조회")
async def get_pipeline_tuning() -> Dict[str, Any]:
    """
    현재 파이프라인 튜닝 설정을 반환합니다.
    품질별 프리셋(basic/enhanced/ultimate), 파이프라인 단계, LLM timeout·temperature·max_tokens 등.
    """
    try:
        from pipeline_tuning import get_config
        config = get_config()
        return {
            "success": True,
            "config": config,
            "writable": bool(os.environ.get("PIPELINE_TUNING_SECRET", "").strip()),
        }
    except ImportError as e:
        logger.warning("pipeline_tuning 모듈 없음: %s", e)
        raise HTTPException(status_code=503, detail="파이프라인 튜닝 모듈을 사용할 수 없습니다.")


@router.post("/pipeline-tuning", summary="파이프라인 튜닝 설정 저장 (관리자 전용)")
async def post_pipeline_tuning(body: PipelineTuningUpdate) -> Dict[str, Any]:
    """
    파이프라인 튜닝 설정을 저장합니다.
    PIPELINE_TUNING_SECRET 환경 변수가 설정되어 있고, body.secret이 그 값과 일치할 때만 적용됩니다.
    """
    expected = os.environ.get("PIPELINE_TUNING_SECRET", "").strip()
    if not expected:
        raise HTTPException(
            status_code=403,
            detail="서버에 PIPELINE_TUNING_SECRET이 설정되어 있지 않아 쓰기가 비활성화되어 있습니다.",
        )
    if not body.secret or body.secret.strip() != expected:
        raise HTTPException(status_code=403, detail="시크릿이 일치하지 않습니다. 권한이 없습니다.")
    if not body.config or not isinstance(body.config, dict):
        raise HTTPException(status_code=400, detail="config 객체가 필요합니다.")

    try:
        from pipeline_tuning import apply_config, reload_config
        ok = apply_config(body.config, body.secret)
        if ok:
            reload_config()
        return {
            "success": ok,
            "message": "저장되었습니다." if ok else "저장에 실패했습니다.",
        }
    except ImportError as e:
        logger.warning("pipeline_tuning 모듈 없음: %s", e)
        raise HTTPException(status_code=503, detail="파이프라인 튜닝 모듈을 사용할 수 없습니다.")
