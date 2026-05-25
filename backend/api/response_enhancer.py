"""
unified_chat_api용 응답 후처리 훅.

기본 구현은 검증·정규화만 수행하는 패스스루입니다. 도메인별 보강이 필요하면
이 모듈의 메서드를 확장하세요.
"""
from __future__ import annotations

from typing import Any, Optional


class ResponseEnhancer:
    def validate_and_fix_response(
        self, response_text: Optional[str], domain: Optional[str] = None
    ) -> str:
        if response_text is None or not isinstance(response_text, str):
            return ""
        text = response_text.strip()
        return text

    def enhance_response(
        self,
        response_text: str,
        domain: Optional[str] = None,
        quality: Any = None,
        *,
        user_message: Optional[str] = None,
    ) -> str:
        del domain, quality, user_message  # 확장 시 사용
        if not response_text or not isinstance(response_text, str):
            return ""
        return response_text.strip()


response_enhancer = ResponseEnhancer()
