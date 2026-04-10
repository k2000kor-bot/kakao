"""
CORBU.AI Backend Package

이 패키지는 CORBU.AI 시스템의 백엔드 기능을 제공합니다.

주요 모듈:
- api.main: Flask 기반 통합 API 서버 (포트 5002)
  - /api/chat: 대화 메시지 분석 및 응답 생성
  - Intelligent Response Engine 통합
  - 캐싱 메커니즘 제공

- api.unified_chat_api: FastAPI 기반 통합 대화 API
  - /api/chat: 통합 대화 엔드포인트
  - /api/chat/stream: 스트리밍 대화 지원
  - 고급 응답 생성 기능

- api.intelligent_response_engine: 고급 AI 응답 생성 엔진
  - Chain-of-Thought 추론
  - 도메인 지식 주입
  - 대화 히스토리 지원

- api.project_session_api: 프로젝트 및 세션 관리 API
  - 프로젝트 CRUD 작업
  - 세션 관리 기능

버전 정보:
- Version: 1.0.0
- 최종 업데이트: 2026-01-22
- Python 버전: 3.8+
"""

__version__ = "1.0.0"
__author__ = "CORBU.AI Team"
__description__ = "CORBU.AI Backend Package"
__last_updated__ = "2026-01-22"

# Makes backend a package for imports in tests
