"""
레거시/보조 FastAPI 서버용 CORS allow_origins.

환경 변수 (둘 중 하나, 우선순위: CORS_ALLOW_ORIGINS):
  - CORS_ALLOW_ORIGINS: 쉼표로 구분한 Origin 목록. 단일 값 "*" 는 전체 허용.
  - CORS_ORIGINS: 동일 (별칭).

미설정 시 React 개발 서버 기본(3000/3001)을 사용합니다.

통합 **main_server** 는 `get_main_server_cors_allow_origins()` 사용:
  - `CORS_ALLOW_ORIGINS` / `CORS_ORIGINS` 가 비어 있으면 `["*"]` (기존 동작).
  - 값이 있으면 위와 동일 규칙으로 파싱.
"""

from __future__ import annotations

import os
from typing import List

_DEFAULT_DEV_ORIGINS: tuple[str, ...] = (
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
)


def get_cors_allow_origins() -> List[str]:
    raw = os.environ.get("CORS_ALLOW_ORIGINS")
    if raw is None or not str(raw).strip():
        raw = os.environ.get("CORS_ORIGINS", "")
    raw = str(raw).strip()
    if raw == "*":
        return ["*"]
    if raw:
        return [o.strip() for o in raw.split(",") if o.strip()]
    return list(_DEFAULT_DEV_ORIGINS)


def get_main_server_cors_allow_origins() -> List[str]:
    """
    통합 main_server: 환경 변수가 비어 있으면 개발 편의상 전체 허용(["*"]).
    프로덕션에서는 CORS_ALLOW_ORIGINS 로 특정 Origin만 지정할 것.
    """
    raw = os.environ.get("CORS_ALLOW_ORIGINS")
    if raw is None or not str(raw).strip():
        raw = os.environ.get("CORS_ORIGINS", "")
    if not str(raw).strip():
        return ["*"]
    return get_cors_allow_origins()
