# Backend

## 진입점·포트

| 서버 | 파일 | 포트 |
|------|------|------|
| **통합 API** (대화·프로젝트) | `main_server.py` | 5002 |
| **인증 등 (app.py)** | `app.py` | **5002** (기본, `API_PORT`/`BACKEND_PORT`로 변경) — **main_server와 동시 기동 금지** |

프론트 기본: 5002 (src/config/api.ts).

## API 라우터 (backend/api/)

상세: [backend/api/README.md](api/README.md)

| 파일 | 용도 |
|------|------|
| **project_session_api** | 프로젝트·세션 CRUD |
| **unified_chat_api** | 대화·스트리밍·사전 생성 파이프라인 |
| **main** | api.main 진입 (Flask) |

**프론트 `message`**: CRA 앱은 전송 전 `chatInputUtils.coerceTrimmedString`로 정규화 — [docs/guides/RESPONSE_CLEANING.md](../docs/guides/RESPONSE_CLEANING.md). 서버는 빈 문자열·최대 길이 등 기존 검증 유지.
| **tts_api** | 목소리 생성 |
| **analysis_api** | 웹 검색·분석 |

## 테스트

```bash
cd backend && python3 -m pytest tests/ -v
# 또는 npm run test:backend
```

주요: test_unified_chat_api, test_project_session_api, test_main_api, test_main_server.

[docs/DEVELOPMENT_CONTINUITY.md](../docs/DEVELOPMENT_CONTINUITY.md) §6. 상세: README_APP.md, API_DOCUMENTATION.md.
