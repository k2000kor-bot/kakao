"""
LLM·DeepSeek 내부 보안 정책 (데이터 외부 유출 방지)

환경 변수로 외부 전송·외부 정보 수집을 차단하고, 이후 정책을 이 모듈에만 추가하면 됩니다.

| 변수 | 효과 |
|------|------|
| LLM_INTERNAL_AIRGAP | DeepSeek 클라우드 차단 + 외부 웹/수집 차단 (원스톱 내부 전용) |
| DEEPSEEK_INTERNAL_ONLY | DeepSeek API(api.deepseek.com 등) 미사용. 기본적으로 외부 웹 연구도 차단. |
| DEEPSEEK_BLOCK_CLOUD | DeepSeek 클라우드만 차단 (웹 연구는 DEEPSEEK_ALLOW_WEB_WITH_LOCAL 로 허용 가능) |
| LLM_BLOCK_OUTBOUND_COLLECTION | 웹 연구·외부 수집(가져오기) 차단 |
| LLM_BLOCK_WEB_RESEARCH | LLM_BLOCK_OUTBOUND_COLLECTION 과 동일 의미 |

DEEPSEEK_INTERNAL_ONLY 일 때 웹 연구를 유지하려면: DEEPSEEK_ALLOW_WEB_WITH_LOCAL=1
"""

from __future__ import annotations

import os
import logging
from typing import Any, Dict

logger = logging.getLogger(__name__)


def _truthy(name: str) -> bool:
    v = os.getenv(name, "")
    if not v or not str(v).strip():
        return False
    return str(v).strip().lower() in ("1", "true", "yes", "on")


def is_airgap_mode() -> bool:
    """완전 내부 모드: 클라우드 DeepSeek + 외부 수집 모두 차단."""
    return _truthy("LLM_INTERNAL_AIRGAP") or _truthy("LLM_DATA_RESIDENCY_INTERNAL")


def is_deepseek_cloud_blocked() -> bool:
    """
    DeepSeek HTTP API(클라우드)로 사용자·프롬프트를 보내지 않음.
    설치형(Ollama 등)은 허용.
    """
    if is_airgap_mode():
        return True
    if _truthy("DEEPSEEK_INTERNAL_ONLY"):
        return True
    if _truthy("DEEPSEEK_BLOCK_CLOUD"):
        return True
    return False


def is_outbound_collection_blocked() -> bool:
    """
    외부로 나가서 정보를 가져오는 경로 차단(웹 연구 등).
    클라이언트가 enable_web_research=true여도 서버에서 무시됨.
    """
    if is_airgap_mode():
        return True
    if _truthy("LLM_BLOCK_OUTBOUND_COLLECTION") or _truthy("LLM_BLOCK_WEB_RESEARCH"):
        return True
    if _truthy("DEEPSEEK_INTERNAL_ONLY") and not _truthy("DEEPSEEK_ALLOW_WEB_WITH_LOCAL"):
        return True
    return False


def security_status_dict() -> Dict[str, Any]:
    """헬스/설정 조회용(민감값 없음)."""
    return {
        "airgap": is_airgap_mode(),
        "deepseek_cloud_blocked": is_deepseek_cloud_blocked(),
        "outbound_collection_blocked": is_outbound_collection_blocked(),
    }


_policy_logged = False


def log_policy_once() -> None:
    """서버 기동 시 한 번 로그."""
    global _policy_logged
    if _policy_logged:
        return
    _policy_logged = True
    if is_airgap_mode():
        logger.warning(
            "🔒 LLM_INTERNAL_AIRGAP: DeepSeek 클라우드·외부 웹 수집 차단 (내부 추론만)"
        )
    elif is_deepseek_cloud_blocked():
        logger.info("🔒 DeepSeek 클라우드 차단: 로컬·다른 provider만 사용")
    if is_outbound_collection_blocked():
        logger.info("🔒 외부 정보 수집(웹 연구) 차단: 서버 정책")
