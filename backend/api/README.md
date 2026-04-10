# API 라우터 (backend/api/)

main_server.py에서 마운트되는 FastAPI 라우터.

## 핵심 (프론트 연동)

| 파일 | prefix | 주요 엔드포인트 |
|------|--------|-----------------|
| **unified_chat_api** | /api | /chat, /chat/stream, /unified/chat, /chat/title, /chat/variations |
| **project_session_api** | /api | /projects, /projects/{id}, /projects/{id}/analytics, /sessions, /projects/{id}/files, notebook-context |
| **tts_api** | /api/tts | /speech, /voices, /config, /situations, /script-style/* |
| **analysis_api** | /api/analysis | /web-research |
| **intent_api** | /api | /intent/analyze |

프론트(CRA)는 `/chat`·`/intent/analyze` 등의 `message`·질문 필드를 전송 전 **`coerceTrimmedString`** 으로 정규화합니다 — [docs/guides/RESPONSE_CLEANING.md](../../docs/guides/RESPONSE_CLEANING.md).

## 고급·통합

| 파일 | prefix | 용도 |
|------|--------|------|
| **integrated_api** | /api/integrated | /health, /status, /metrics, /analytics, creative/persuasion/marketing |
| **v7_api** | /api/v7 | /voice/*, /image/analyze-base64, /predict/* |

## 도구 뷰 Summary

| 파일 | prefix | 엔드포인트 |
|------|--------|------------|
| **extended_views_api** | /api | /search/summary, /templates/summary, /team/summary, /learn/summary, /workspace/summary, /community/summary, /billing/summary |

## 도구 뷰 (extended_views_api)

| prefix | 엔드포인트 | 뷰 |
|--------|------------|-----|
| /api | /search/summary, /templates/summary, /team/summary, /learn/summary, /workspace/summary, /community/summary, /billing/summary | Search·Templates·Team·Learn·Workspace·Community·Billing |

Workspace·Templates·Search는 프로젝트 데이터 기반 실 데이터. Team·Learn·Community·Billing은 목데이터. docs/API.md §도구 뷰 Summary API 참고.

## 기타

- **performance_api**, **security_api**, **ai_engine_api** — 성능·보안·AI 엔진
- **websocket_api** — /ws, /ws/metrics, /ws/alerts
- **analytics_api**, **automation_api**, **backup_recovery_api** — 분석·자동화·백업

[backend/README.md](../README.md), [docs/DEVELOPMENT_CONTINUITY.md](../../docs/DEVELOPMENT_CONTINUITY.md) §6
