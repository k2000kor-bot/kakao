# Scripts

## Python 통합·레거시 API 테스트

- **[scripts/test/README.md](test/README.md)** — `CORBU_*` 환경 변수, 기본 포트(5002 vs 레거시 8001 등) 정리

## 개발·검증

| 스크립트 | 용도 |
|----------|------|
| **dev-check.sh** | 백엔드 핵심 pytest + 타입 + lint. `lib-backend-python.sh`로 `venv`/`.venv` 중 `import pytest` 성공 Python (`DEV_CHECK_SKIP_BACKEND=1` 시 백엔드 스킵) |
| **run-backend-pytest.sh** | `npm run test:backend` — 인자 없으면 `tests/` 전체 `-v --tb=short`. 인자 있으면 그대로 전달: `npm run test:backend -- tests/foo.py -q` |
| **verify-completion.sh** | 마무리 검증 (타입·린트·P4 148) |
| **lib-backend-python.sh** | `backend_python_resolve` — `venv`/`.venv`/시스템 `python3` 중 지정 `import` 스니펫이 되는 인터프리터 선택. 사용처: `dev-check.sh`, `run-backend-pipeline-*.sh`, **`start-api-5002.sh`**, **`restart-backend.sh`**, 루트 **`start_all.sh`** |
| **lib-activate-backend-venv.sh** | `backend_venv_activate <REPO_ROOT>` — `source` 순서: `backend/venv` → `backend/.venv` → 루트 `venv` → 루트 `.venv`. 사용처: **`deploy/start_*.sh`**, **`setup/install_dependencies.sh`**, **`setup/install_advanced_nlp.sh`**, **`performance_optimizer.sh`** — 요약 문서: [docs/setup/PYTHON_VENV.md](../docs/setup/PYTHON_VENV.md) |
| **restart-backend.sh** | `npm run restart:backend` — 포트 정리 후 uvicorn; 위와 동일한 Python 우선순위(`import uvicorn`), 없으면 `backend/.venv` 재생성(`requirements-core.txt`) |
| **run-backend-pipeline-tuning.sh** | `npm run test:backend:pipeline-tuning` — pipeline_tuning API + 노트북 context(5), `import pytest, fastapi` |
| **run-backend-pipeline-smoke.sh** | `npm run test:backend:pipeline-smoke` — Q→A 스모크, `import pytest` |
| **run-p2-check.sh** | P2 1·2·3단계 (verify + test:views + test:views:services). 4~6: PERFORMANCE.md §2.6 |
| **run-e2e-with-server.sh** | 서버 기동 후 E2E 실행 |
| **check-system.sh** | 시스템 상태 확인 |
| **../start_servers.sh** (루트) | 레거시 병렬 기동: `lib-backend-python.sh` + `main_server` 5002 + `npm start` (권장은 터미널 분리) |
| **../deploy.sh** | `lib-activate-backend-venv.sh` + `ensure_python_venv` (없으면 `backend/.venv` 생성 시도), `python3` |
| **../install-plugins.sh** | 선택 패키지 설치·요약 시 동일 venv 우선순위 |
| **../start_all_systems.sh** / **../start_real_estate_ai_system.sh** / **../start_dev_tools.sh** | 저장소 루트 자동 `cd` + `lib-activate` (하드코딩 경로 제거) |
| **../start_ultimate_system.sh** / **../stop_ultimate_system.sh** | 루트에서 `lib-activate` + `python3` + `frontend/` 또는 루트 CRA; 중지 시 **5002** 포트 정리 포함 |
| **../start_simple_server.sh** | 프론트만 백그라운드 (`logs/dev-server.log`); 하드코딩 경로 제거 |
| **check-access.sh** | 접속 확인 |
| **final-verify.sh** | 빌드 + 접속 + API + 통합 테스트 + **`npm run test:frontend:chat-pipeline`** (대화 Jest 실패 시 exit 1). [docs/FINAL_CHECKLIST.md](../docs/FINAL_CHECKLIST.md) |

## setup (macOS)

| 스크립트 | 용도 |
|----------|------|
| **setup/setup_macos_dev.sh** | Homebrew·Node·**`backend/.venv`**·`requirements_macos.txt`·`.vscode`(인터프리터 `backend/.venv`)·래퍼 `start_*.sh`. **루트 `DEVELOPMENT.md`는 덮어쓰지 않음** — 요약은 **`docs/setup/MACOS_DEV_QUICKSTART.md`** |

## 보조 `frontend/` 트리 (미러 CRA)

| 파일 | 용도 |
|------|------|
| **`frontend/src/config/apiOrigin.ts`** | 기본 API **`http://localhost:5002`**, `REACT_APP_API_URL` / `REACT_APP_API_BASE_URL` 반영. `API_ROOT` = 오리진 + `/api` |
| **`frontend/package.json`** | `"proxy": "http://localhost:5002"` (메인 루트와 동일 포트 정책) |

## npm 보조 (`package.json`)

| 명령 | 용도 |
|------|------|
| **`npm run sync:frontend-chat-input-utils`** | 루트 `src/utils/chatInputUtils.ts` → `frontend/src/utils/chatInputUtils.ts` 복사(보조 트리 미러). 유틸 편집 후 실행 권장 |
| **`npm run test:frontend:chat-pipeline`** | `chatInputUtils`·`streamingClient`·`generationPromptBuilder`·GensparkPipelineExtrasPanel Jest |

## 배포

| 경로 | 용도 |
|------|------|
| **deploy/start_main_server.sh** | **main_server** — `uvicorn` 기본 **5002**, `lib-activate-backend-venv.sh`, 포트 점유 시 정리 |
| **deploy/start_system.sh** / **deploy/start_integrated_system.sh** | 백그라운드 **main_server** (**5002**) + (통합 스크립트는) 모니터 루프·프론트 `npm start`. 환경변수 **`BACKEND_PORT`** 로 포트 변경 가능 |
| **deploy/start_frontend.sh** | 프론트 dev 서버 |
| **deploy/start_unified_system.sh** | **레거시**: `ultimate_integrated_server` + WebSocket(8001). HTTP 포트는 **`ULTIMATE_HTTP_PORT`** (기본 8000, Python에 export). 일상 개발은 **`npm run restart:backend`** 권장 |
| **deploy/start_ultimate_media_system.sh** | **`ULTIMATE_MEDIA_PORT`** (기본 8001) export 후 기동 |
| **deploy/start_unified_conversation_server.sh** | **`UNIFIED_CONV_PORT`** (기본 8001), `backend/unified_conversation_api.py` 절대 경로 실행 |
| 기타 **deploy/start_*.sh** | 다중 마이크로서버·레거시 엔트리; `REPO_ROOT` 자동 탐지(`scripts/deploy` 기준 `../..`) |

[docs/DEVELOPMENT.md](../DEVELOPMENT.md) §2.4, [docs/DEVELOPMENT_CONTINUITY.md](../docs/DEVELOPMENT_CONTINUITY.md)
