# Scripts

**NotebookLM·문서 허브·통합·로컬**: [README.md](../docs/README.md) §NotebookLM·§개발 **통합·로컬**·[INTEGRATION_TEST_GUIDE.md](../INTEGRATION_TEST_GUIDE.md)·[LOCAL_ACCESS_GUIDE.md](../docs/LOCAL_ACCESS_GUIDE.md)·[QUICK_REFERENCE.md](../QUICK_REFERENCE.md)·[AGENTS.md](../AGENTS.md)·[scripts/README.md](./README.md) — [FEATURE_LOGIC_AND_STRENGTHS.md](../docs/FEATURE_LOGIC_AND_STRENGTHS.md) §6 **통합 테스트·INTEGRATION_TEST_GUIDE(루트)·로컬 접속·LOCAL_ACCESS_GUIDE(docs)** 행 · §6 **개발 연속성·DEVELOPMENT_CONTINUITY(docs)·경로·뷰** 행 · §6 **개발 요약·개발자 체크리스트(docs)** 행 · §6 **컴포넌트·라우트 매핑(문서)·COMPONENT_ARCHITECTURE·CHAT_UI §14.5** 행 · §6 **config README·routes.ts(src/config)·프로젝트 대화** 행 · §6 **스크립트 허브·scripts/README(루트)·dev/deploy(docs)** 행 · §6 **테스트 가이드·TESTING_GUIDE(루트)·API(docs)** 행 · §6 **E2E 가이드·e2e/README(루트)·경로 허브(docs)** 행 · §6 **완성 체크리스트·COMPLETION_CHECKLIST(docs)** 행 · §6 **배포·풀 스택 체크리스트(docs)** 행 · §6 **검증·빠른 참조·QUICK_REFERENCE(루트)** 행 · [NOTEBOOKLM_FEATURE_ROADMAP.md](../docs/NOTEBOOKLM_FEATURE_ROADMAP.md) §4 **통합 테스트·로컬 접속** · §4 **스크립트 허브(루트 scripts/README)** · §4 **테스트 가이드·검증 허브(루트 TESTING_GUIDE)** · §4 **E2E 경로·가이드(루트)** · §4 **에이전트 가이드** · §4 **config README(`routes.ts`)** · §4 **라우트·컴포넌트 매핑** · §6 **Agent / AI 개발 가이드** 행 · §6 **일상 개발·DEVELOPMENT(루트)** 행 · §6 **검증·빠른 참조·QUICK_REFERENCE(루트)** 행 · §6 **컴포넌트·라우트 매핑(문서)·COMPONENT_ARCHITECTURE·CHAT_UI §14.5** 행 · 동 허브 **완성·검증** 표 `scripts/README` 행 · [TESTING_GUIDE.md](../TESTING_GUIDE.md) `routes.test` · [e2e/README.md](../e2e/README.md)·[docs/COMPLETION_CHECKLIST.md](../docs/COMPLETION_CHECKLIST.md)·[docs/FINAL_CHECKLIST.md](../docs/FINAL_CHECKLIST.md)·[src/config/README.md](../src/config/README.md)·표 행과 교차

**실행 가이드·접속 문제(루트)**: (본 문서 **개발·검증** 표·`dev-check`·`final-verify.sh`·`run-e2e-with-server`·`restart-backend`·deploy `start_*.sh`) · [INTEGRATION_TEST_GUIDE.md](../INTEGRATION_TEST_GUIDE.md)·[LOCAL_ACCESS_GUIDE.md](../docs/LOCAL_ACCESS_GUIDE.md)·[RUN_GUIDE.md](../RUN_GUIDE.md)·[CONNECT.md](../CONNECT.md) — [QUICK_REFERENCE.md](../QUICK_REFERENCE.md)·[AGENTS.md](../AGENTS.md)·[scripts/README.md](../scripts/README.md)·[FEATURE_LOGIC_AND_STRENGTHS.md](../docs/FEATURE_LOGIC_AND_STRENGTHS.md) §6 · [NOTEBOOKLM_FEATURE_ROADMAP.md](../docs/NOTEBOOKLM_FEATURE_ROADMAP.md) §4 **통합 테스트·로컬 접속** · §4 **스크립트 허브(루트 scripts/README)** · §4 **테스트 가이드·검증 허브(루트 TESTING_GUIDE)** · §4 **E2E 경로·가이드(루트)** · §4 **에이전트 가이드** · §4 **config README(`routes.ts`)** · §4 **라우트·컴포넌트 매핑** · §6 **Agent / AI 개발 가이드** 행 · §6 **일상 개발·DEVELOPMENT(루트)** 행 · §6 **검증·빠른 참조·QUICK_REFERENCE(루트)** 행 · [COMPONENT_ARCHITECTURE.md](../docs/COMPONENT_ARCHITECTURE.md) §1.1 · [USAGE_GUIDE.md](../USAGE_GUIDE.md) §11 · [QUICK_START.md](../QUICK_START.md)·[README_FIRST.md](../README_FIRST.md)·[START_HERE.md](../START_HERE.md)·[docs/DEVELOPMENT_CONTINUITY.md](../docs/DEVELOPMENT_CONTINUITY.md) §1·§2 · [DEVELOPMENT.md](../DEVELOPMENT.md) §2 · [SYSTEM_READY.md](../SYSTEM_READY.md) §빠른 참조 · [README.md](../README.md)·[TESTING_GUIDE.md](../TESTING_GUIDE.md)(`routes.test`·`verify:completion`) · [e2e/README.md](../e2e/README.md)(`paths.ts`·`run-e2e-with-server`) · [docs/COMPLETION_CHECKLIST.md](../docs/COMPLETION_CHECKLIST.md)(`verify:completion`) · [docs/FINAL_CHECKLIST.md](../docs/FINAL_CHECKLIST.md)(`verify:final`·`final-verify.sh`) · 표 행과 교차

---

## Python 통합·레거시 API 테스트

- **[scripts/test/README.md](test/README.md)** — `CORBU_*` 환경 변수, 기본 포트(5002 vs 레거시 8001 등) 정리

## 개발·검증

| 스크립트 | 용도 |
|----------|------|
| **dev-check.sh** | 백엔드 핵심 pytest + 타입 + lint. `lib-backend-python.sh`로 `venv`/`.venv` 중 `import pytest` 성공 Python (`DEV_CHECK_SKIP_BACKEND=1` 시 백엔드 스킵) |
| **run-backend-pytest.sh** | `npm run test:backend` — 인자 없으면 `tests/` 전체 `-v --tb=short`. 인자 있으면 그대로 전달: `npm run test:backend -- tests/foo.py -q` |
| **verify-completion.sh** | 마무리 검증 (타입·린트·`npm run test:p4:services`) |
| **verify-conversation-graph** | `npm run verify:conversation-graph:unit`(Jest·백엔드·`typecheck:views-tests`) · E2E 포함: `npm run verify:conversation-graph` · CI: `ci-cd.yml` `conversation-graph` · `make test-conversation-graph-unit` ([docs/CONVERSATION_GRAPH.md](../docs/CONVERSATION_GRAPH.md)) |
| **chat-handoff (유닛)** | `npm run test:conversation-graph:chat-handoff` — `/chat` context 병합·배너·navigate·전송·첨부 칩 제거·`ChatGPTInterface` handoff (10 tests) |
| **verify-project-sources** | `npm run verify:project-sources` — `projectService`·`ChatGPTInterface` 유닛 + 백엔드 `POST /api/projects/{id}/files` + E2E 소스 탭 업로드 (`E2E_SERVER_READY=1`) |
| **lib-backend-python.sh** | `backend_python_resolve` — `venv`/`.venv`/시스템 `python3` 중 지정 `import` 스니펫이 되는 인터프리터 선택. 사용처: `dev-check.sh`, `run-backend-pipeline-*.sh`, **`start-api-5002.sh`**, **`restart-backend.sh`**, 루트 **`start_all.sh`** |
| **lib-activate-backend-venv.sh** | `backend_venv_activate <REPO_ROOT>` — `source` 순서: `backend/venv` → `backend/.venv` → 루트 `venv` → 루트 `.venv`. 사용처: **`deploy/start_*.sh`**, **`setup/install_dependencies.sh`**, **`setup/install_advanced_nlp.sh`**, **`performance_optimizer.sh`** — 요약 문서: [docs/setup/PYTHON_VENV.md](../docs/setup/PYTHON_VENV.md) |
| **restart-backend.sh** | `npm run restart:backend` — 포트 정리 후 uvicorn; 위와 동일한 Python 우선순위(`import uvicorn`), 없으면 `backend/.venv` 재생성(`requirements-core.txt`) |
| **verify-conversation-graph-api.sh** | `npm run verify:conversation-graph-api` — `/api/conversations` 업로드·관계도 스모크 (`restart:backend` 후) |
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
| **final-verify.sh** | **`check:test-imports`** + 빌드 + 접속 + API + 통합 시도 + **`test:frontend:chat-pipeline`** + **`verify:composer-pipeline`**(실패 시 exit 1). UI·E2E 컴포저는 별도. [docs/FINAL_CHECKLIST.md](../docs/FINAL_CHECKLIST.md) |
| **test-composer-pipeline.sh** | `sync:frontend-src` + 컴포저 Jest 묶음 · `E2E_COMPOSER_PIPELINE=1` 시 E2E 포함 |
| **check-doc-verification-hub.mjs** | **`npm run check:doc-verification-hub`** — `git ls-files` 기준 `docs/`·`src/`·`frontend/src/`·`scripts/`·`e2e/`·`android_app/`·`backend/api/`·`corbu-ai/README.md` 추적 `*.md`에 **`저장소 루트 검증 허브`** 문단 존재 여부(백업·JDK 법적 문서 등 제외). 누락 시 목록만 stderr; **`DOC_HUB_STRICT=1`** 이면 exit 1. [TESTING_GUIDE.md](../TESTING_GUIDE.md) |
| *(일괄 편집 스크립트 작성 시)* | `frontend/` 등에 JDK 트리로 **`*.md`와 동명의 디렉터리**가 있을 수 있음 → `glob`/`rglob` 후 **파일만**(`fs.statSync`·`Dirent.isFile()` 등) 읽기 |

## 원격 push 막힘 · 이관 보조

| 스크립트 | 용도 |
|----------|------|
| **verify-push-block-artifacts.sh** | 로컬 `bundle` tip·`patch` 시리즈·핵심 2패치 SHA 검증 (`npm run verify:handoff-artifacts`) |
| **refresh-handoff-artifacts.sh** | bundle·`patches-dev-continue-*` 재생성 + manifest (`npm run refresh:handoff-artifacts`) |
| **test-sidebar-context.sh** | 미러 동기화 후 사이드바 컨텍스트 관련 Jest만 실행(루트 `cd`) |
| **run-push-block-local-workflow.sh** | 아티팩트 검증 + `test-sidebar-context` + `verify:composer-pipeline` |
| **retry-push-with-diagnostics.sh** | SSH·`git ls-remote`·진단 메시지·가능 시 `git push` |
| **generate-push-block-status-report.sh** | `docs/PUSH_BLOCK_STATUS.md` 갱신 |
| **generate-push-block-manifest.sh** | `docs/PUSH_BLOCK_MANIFEST.md` 갱신 |
| **run-push-block-maintenance.sh** | 위 항목을 한 번에(`npm run maintain:push-block` / `make maintain-push-block`) |

상세·번들 경로·재시도 조건: [docs/PUSH_BLOCK_HANDOFF.md](../docs/PUSH_BLOCK_HANDOFF.md)

## setup (macOS)

| 스크립트 | 용도 |
|----------|------|
| **setup/setup_macos_dev.sh** | Homebrew·Node·**`backend/.venv`**·`requirements_macos.txt`·`.vscode`(인터프리터 `backend/.venv`)·래퍼 `start_*.sh`. **루트 `DEVELOPMENT.md`는 덮어쓰지 않음** — 요약은 **`docs/setup/MACOS_DEV_QUICKSTART.md`** |

## 보조 `frontend/` 트리 (미러 CRA)

TypeScript **`frontend/tsconfig.json`은 `frontend/src`만** 포함합니다. 소스 캐논은 루트 **`src/`** — 전체 미러는 **`npm run sync:frontend-src`**(`scripts/sync-frontend-src.sh`; **`make sync-frontend`**와 동일). 통합 대화(UI) 등 **부분** 미러는 **`npm run sync:frontend-unified-chat`**(`scripts/sync-frontend-unified-chat.sh`; **`make sync-frontend-unified-chat`**와 동일; `frontend/src/config/apiOrigin.ts` 없으면 **copy_pair만**·apiOrigin 치환 생략; `pretest` 패리티는 전체 미러·아래 `check:src-frontend-parity` 참고). **`frontend/` 루트에 `src` 바깥 `components`·`services` 등을 두지 않음**(빌드 미포함).

| 파일 | 용도 |
|------|------|
| **`frontend/src/config/apiOrigin.ts`** | 기본 API **`http://localhost:5002`**, `REACT_APP_API_URL` / `REACT_APP_API_BASE_URL` 반영. `API_ROOT` = 오리진 + `/api` |
| **`frontend/package.json`** | `"proxy": "http://localhost:5002"` (메인 루트와 동일 포트 정책) |

## npm 보조 (`package.json`)

루트 **`package.json`**의 **`scripts`**는 JSON이라 줄 주석을 넣을 수 없다. **`npm run …` ↔ `make …`** 대응은 아래 표와 루트 **`Makefile`**(**`make help`** — `sync-frontend`·`sync-frontend-chat-input`·`sync-frontend-unified-chat`·`check-frontend-parity`·`test-sidebar-context`·`maintain-push-block` 등)로 확인한다.

| 명령 | 용도 |
|------|------|
| **`npm run sync:frontend-src`** | 루트 `src/` → `frontend/src/` 전체 rsync + `pretest`의 import·패리티 검사. 대량 프론트 수정 후 실행. **동일:** 루트 `make sync-frontend`(Makefile) |
| **`npm run sync:frontend-chat-input-utils`** | 루트 `src/utils/chatInputUtils.ts` → `frontend/src/utils/chatInputUtils.ts` 복사만(빠른 1파일 미러). **동일:** 루트 `make sync-frontend-chat-input`(Makefile) |
| **`npm run sync:frontend-unified-chat`** | `scripts/sync-frontend-unified-chat.sh` — 통합 대화(UI)·서비스·스토어 등 **부분** 미러(`apiOrigin.ts` 있을 때만 import 치환; 없으면 copy만). **동일:** 루트 **`make sync-frontend-unified-chat`**. 전체 트리·`pretest` 패리티는 위 **`sync:frontend-src`** / **`make sync-frontend`** · **`check:src-frontend-parity`** / **`make check-frontend-parity`** |
| **`npm run check:src-frontend-parity`** | `src/` ↔ `frontend/src/` 핵심 경로 바이트 일치(`scripts/check-src-frontend-parity.mjs`). `pretest`에 포함. **동일:** 루트 `make check-frontend-parity`(Makefile) |
| **`npm run test:frontend:chat-pipeline`** | `chatInputUtils`·`streamingClient`·`generationPromptBuilder`·GensparkPipelineExtrasPanel Jest · `npm test`/`pretest`: `check:src-frontend-parity`(동일 `make check-frontend-parity`); 미러는 위 표 |
| **`npm test -- --testPathPattern='ChatGPTInterface\\.test\\.tsx$' --watchAll=false`** | `ChatGPTInterface.test.tsx`만(정규식 끝 `$` 권장). `ChatGPTInterface.test`만 쓰면 `UltimateChatGPTInterface`까지 잡힐 수 있음 — [TESTING_GUIDE.md](../TESTING_GUIDE.md) |
| **`npm run test:routes`** | `src/config/__tests__/routes.test.ts`만 Jest (**27** tests, `pretest` 포함) — [TESTING_GUIDE.md](../TESTING_GUIDE.md) |
| **`npm run test:app-unified`** | `AppUnified.test.tsx`만 Jest (**122** tests, `pretest` 포함) — [TESTING_GUIDE.md](../TESTING_GUIDE.md) |
| **`npm run test:sidebar-context`** | 사이드바 컨텍스트 필터·설정·대화 이력 관련 Jest 묶음(`scripts/test-sidebar-context.sh`; 루트 `cd` 후 `sync:frontend-src` + 패턴 테스트). **동일:** 루트 `make test-sidebar-context` — [docs/PUSH_BLOCK_HANDOFF.md](../docs/PUSH_BLOCK_HANDOFF.md). **수동**(첨부·재생성·편집): [docs/guides/CHAT_UI_TEST_SCENARIOS.md](../docs/guides/CHAT_UI_TEST_SCENARIOS.md) §14.5 · [TESTING_GUIDE.md](../TESTING_GUIDE.md) |
| **`npm run verify:composer-pipeline`** | 컴포저 다중 요청·첨부·순차·다단계 Jest(`scripts/test-composer-pipeline.sh`). **동일:** `make test-composer-pipeline` · E2E: `test:e2e:composer-pipeline:all` / CI: `...:ci:all` · §14.7 [CHAT_UI_TEST_SCENARIOS](../docs/guides/CHAT_UI_TEST_SCENARIOS.md) |
| **`npm run verify:pre-deploy`** | `scripts/pre-deploy-verify.sh` — sidebar + composer + 관계도 unit (빌드 없음). 풀: `verify:final` |
| **`npm run maintain:push-block`** | 원격 `git push`가 막힐 때 아티팩트 검증·위 회귀·SSH/원격 진단·`docs/PUSH_BLOCK_STATUS.md`·`docs/PUSH_BLOCK_MANIFEST.md` 갱신(`scripts/run-push-block-maintenance.sh`). **동일:** 루트 `make maintain-push-block` — 동 문서 |
| **`LazyComponents.test` ↔ `/dev-status` CHANGES** | `LazyComponents.test.tsx`의 `it`를 추가·제거하면 `DevStatusView.tsx` CHANGES 끝 `·N tests`·`DevStatusView.test.tsx`의 `realTimeSync mock·N tests` 단언을 함께 갱신 — [AGENTS.md](../AGENTS.md) 규칙 **6** · [TESTING_GUIDE.md](../TESTING_GUIDE.md) · [docs/DEVELOPMENT_CONTINUITY.md](../docs/DEVELOPMENT_CONTINUITY.md) §3 |

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

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · `npm run test:views`(확장 뷰·라우트) · (권장) `npm run test:sidebar-context`(수동 §14.5 [CHAT_UI_TEST_SCENARIOS](../docs/guides/CHAT_UI_TEST_SCENARIOS.md)) · (선택) `npm run check:doc-verification-hub` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../docs/COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../docs/FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

