# 최종 체크리스트 (배포 전 점검)

**루트의 `FINAL_CHECKLIST.md`**: 저장소 루트(`package.json`과 같은 폴더, `docs/`의 **상위** 디렉터리)에 있는 동명 파일은 이 문서로 안내하는 **짧은 스텁**입니다. 절차·표·CI 설명은 **본 문서**를 기준으로 합니다.

배포 전 또는 개발 완료 시 확인하는 항목입니다. `./scripts/final-verify.sh`(`npm run verify:final`)는 먼저 **`npm run check:test-imports`**(실패 시 exit 1) 후 빌드·접속·API·통합 테스트에 더해 **`npm run test:frontend:chat-pipeline`** 및 **`npm run test:chat-ui-interfaces:smoke`** 까지 실행합니다. UI 스모크 마지막 구간을 순차 Jest로 돌리려면 **`npm run verify:final:sequential-smoke`** 또는 **`VERIFY_FINAL_CHAT_UI_SMOKE=sequential`** 를 사용합니다.

**NotebookLM·문서 허브·통합·로컬**: [README.md](./README.md) §NotebookLM·§개발 **통합·로컬**·[INTEGRATION_TEST_GUIDE.md](../INTEGRATION_TEST_GUIDE.md)·[LOCAL_ACCESS_GUIDE.md](./LOCAL_ACCESS_GUIDE.md)·[FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)·[QUICK_REFERENCE.md](../QUICK_REFERENCE.md)·[AGENTS.md](../AGENTS.md)·[scripts/README.md](../scripts/README.md) — [FEATURE_LOGIC_AND_STRENGTHS.md](./FEATURE_LOGIC_AND_STRENGTHS.md) §6 **통합 테스트·INTEGRATION_TEST_GUIDE(루트)·로컬 접속·LOCAL_ACCESS_GUIDE(docs)** 행 · §6 **개발 연속성·DEVELOPMENT_CONTINUITY(docs)·경로·뷰** 행 · §6 **개발 요약·개발자 체크리스트(docs)** 행 · §6 **컴포넌트 아키텍처·COMPONENT_ARCHITECTURE(docs)·라우트→뷰** 행 · §6 **config README·routes.ts(src/config)·프로젝트 대화** 행 · §6 **배포·풀 스택 체크리스트(docs)** 행 · §6 **완성 체크리스트·COMPLETION_CHECKLIST(docs)** 행 · §6 **테스트 가이드·TESTING_GUIDE(루트)·API(docs)** 행 · §6 **E2E 가이드·e2e/README(루트)·경로 허브(docs)** 행 · §6 **스크립트 허브·scripts/README(루트)·dev/deploy(docs)** 행 · §6 **검증·빠른 참조·QUICK_REFERENCE(루트)** 행 · [NOTEBOOKLM_FEATURE_ROADMAP.md](./NOTEBOOKLM_FEATURE_ROADMAP.md) §4 **통합 테스트·로컬 접속** · §4 **최종 체크리스트·풀 스택 검증(FINAL_CHECKLIST)** · §4 **테스트 가이드·검증 허브(루트 TESTING_GUIDE)** · §4 **E2E 경로·가이드(루트)** · §4 **스크립트 허브(루트 scripts/README)** · 동 허브 **완성·검증** 표 `FINAL_CHECKLIST` 행 · [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) 서두 **NotebookLM·문서 허브·통합·로컬** 교차 · [TESTING_GUIDE.md](../TESTING_GUIDE.md) 서두 **NotebookLM·문서 허브·통합·로컬**·`routes.test` · [e2e/README.md](../e2e/README.md) 서두 **NotebookLM·문서 허브·통합·로컬** · [src/config/README.md](../src/config/README.md)·표 행과 교차

**실행 가이드·접속 문제(루트)**: (본 문서 §1–§4 표·`verify:final`·루트 **스텁**은 위 안내) · [RUN_GUIDE.md](../RUN_GUIDE.md)·[CONNECT.md](../CONNECT.md) — [QUICK_REFERENCE.md](../QUICK_REFERENCE.md)·[AGENTS.md](../AGENTS.md)·[scripts/README.md](../scripts/README.md) — [FEATURE_LOGIC_AND_STRENGTHS.md](./FEATURE_LOGIC_AND_STRENGTHS.md) §6 · [NOTEBOOKLM_FEATURE_ROADMAP.md](./NOTEBOOKLM_FEATURE_ROADMAP.md) §4 · [COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md) §1.1 · [USAGE_GUIDE.md](../USAGE_GUIDE.md) §11 · [QUICK_START.md](../QUICK_START.md)·[README_FIRST.md](../README_FIRST.md)·[START_HERE.md](../START_HERE.md)·[DEVELOPMENT_CONTINUITY.md](./DEVELOPMENT_CONTINUITY.md) §1·§2 · [SYSTEM_READY.md](../SYSTEM_READY.md) §빠른 참조 · [DEVELOPMENT.md](../DEVELOPMENT.md) §2 · [README.md](../README.md)·[TESTING_GUIDE.md](../TESTING_GUIDE.md)(`routes.test`·`verify:completion`) · [e2e/README.md](../e2e/README.md)(`paths.ts`·`run-e2e-with-server`) · [docs/setup/PYTHON_VENV.md](./setup/PYTHON_VENV.md)·[docs/setup/MACOS_DEV_QUICKSTART.md](./setup/MACOS_DEV_QUICKSTART.md)·표 행과 교차

**로컬 UI 스모크 체크리스트**: [LOCAL_UI_SMOKE_CHECKLIST.md](./LOCAL_UI_SMOKE_CHECKLIST.md)

---

## 1. 빌드·실행

| 항목 | 명령 | 기대 결과 |
|------|------|-----------|
| 프론트 빌드 | `npm run build` | Compiled successfully · 표 행과 교차 |
| 프론트 실행 | `npm start` | http://localhost:3000 접속 가능 · 표 행과 교차 |
| 백엔드 실행 | `npm run restart:backend` (권장) 또는 `cd backend && python3 -m uvicorn main_server:app --port 5002` | http://localhost:5002 접속 가능 · 표 행과 교차 |

---

## 2. 검증·테스트

| 항목 | 명령 | 기대 결과 |
|------|------|-----------|
| Jest 테스트 import | `npm run check:test-imports` | 깨진 import 없음 (`verify:final` 0단계와 동일) · 표 행과 교차 |
| 라우트 설정 (Jest) | `npm run test:routes` | **27** tests (`pretest` 포함). `routes.test`·`paths.ts` 계약 점검 — [TESTING_GUIDE.md](../TESTING_GUIDE.md)·표 행과 교차 |
| 통합 앱 셸 (Jest) | `npm run test:app-unified` | **115** tests (`pretest` 포함, 수 초대). `AppUnified` 라우팅·리다이렉트 — [TESTING_GUIDE.md](../TESTING_GUIDE.md)·표 행과 교차 |
| 사이드바 컨텍스트 (Jest) | `npm run test:sidebar-context` | 사이드바·설정·대화 이력 묶음 (`pretest`·`sync:frontend-src` 포함; 동일 `make test-sidebar-context`) — [TESTING_GUIDE.md](../TESTING_GUIDE.md)·[PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md) |
| 원격 push 막힘 (로컬) | `npm run maintain:push-block` | 아티팩트·회귀·진단·문서 갱신 (동일 `make maintain-push-block`) — [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md) |
| 접속 확인 | `npm run check:access` | 프론트(3000)·백(5002) 200 또는 안내 메시지 · 표 행과 교차 |
| API 검증 | `npm run verify:api` | /api/health, /api/status, /api/docs → 200 · 표 행과 교차 |
| 통합 테스트 | `npm run test:integration` | 대화·에러 시나리오·스트리밍 모두 OK (백엔드 실행 중 필요). 수동·스크립트 흐름: [INTEGRATION_TEST_GUIDE.md](../INTEGRATION_TEST_GUIDE.md)·표 행과 교차 |
| 대화 파이프라인 (Jest) | `npm run test:frontend:chat-pipeline` | `chatInputUtils`·스트리밍·프롬프트·Genspark 패널 (백엔드 불필요). 보조 트리: `npm run sync:frontend-src`(전체·동일 `make sync-frontend`)·`chatInputUtils`만 `npm run sync:frontend-chat-input-utils`(동일 `make sync-frontend-chat-input`)·통합 대화(UI) 등 부분 `npm run sync:frontend-unified-chat`(동일 `make sync-frontend-unified-chat`) · `npm test`/`pretest`: `check:src-frontend-parity`(동일 `make check-frontend-parity`) · 표 행과 교차 |
| 대형 채팅 UI 스모크 (Jest) | `npm run test:chat-ui-interfaces:smoke` | `UltimateChatGPT` 전체 + `ChatGPTInterface` 퀵 패턴 + **마지막 4종 UI를 한 Jest(combined)**로 실행해 시간을 줄임 (백엔드 불필요). 전체 UI는 `npm run test:chat-ui-interfaces` · 표 행과 교차 |
| (옵션) 스모크 순차 | `npm run test:chat-ui-interfaces:smoke:sequential` | 스모크와 동일 범위; 마지막 4종만 파일별 Jest로 나눔(CI·메모리에 유리) · 표 행과 교차 |
| (참고) batch-b | `npm run test:chat-ui-interfaces:batch-b` / `…:batch-b:combined` | 4종 UI만 검증할 때: **순차** 4회 Jest vs **한 방** combined Jest · 표 행과 교차 |
| 백엔드 테스트 | `cd backend && python3 -m pytest tests/test_main_server.py tests/test_unified_chat_api.py -v` | passed (`httpx>=0.25,<0.27` 권장) · 표 행과 교차 |
| 프로젝트·NotebookLM API pytest | `cd backend && python3 -m pytest tests/test_project_session_api.py -q` | passed (통합 LLM은 `generate_chat_response` 모킹·`httpx>=0.25,<0.27` 권장) · 표 행과 교차 |

---

## 3. 한 번에 검증

```bash
./scripts/final-verify.sh
```

- **Jest 테스트 import 검사** (`check:test-imports`, 실패 시 exit 1)
- 빌드 필수 확인
- **대화 파이프라인 Jest** 포함 (`test:frontend:chat-pipeline`, 실패 시 exit 1)
- **대형 채팅 UI Jest 스모크** 포함 (`test:chat-ui-interfaces:smoke`, 실패 시 exit 1). combined tail이 CI에서 불안정하면 **`npm run verify:final:sequential-smoke`** 또는 **`VERIFY_FINAL_CHAT_UI_SMOKE=sequential`** 로 동일 스크립트 실행(내부에서 `test:chat-ui-interfaces:smoke:sequential`)
- 접속·API·통합 테스트는 백엔드가 켜져 있으면 모두 실행, 아니면 일부 스킵

---

## 4. 포트·문서

- **프론트**: 3000 (`package.json`, `.env.local`, 문서 일치)
- **백엔드**: **5002** (`main_server.py`, `restart:backend`, `package.json` `proxy`, `frontend/src/config/api.ts` 기본값; 레거시 8000 URL은 `api.ts`에서 **5002로 치환**)
- **문서**: [README.md](./README.md) §NotebookLM·§개발 **통합·로컬**·[INTEGRATION_TEST_GUIDE.md](../INTEGRATION_TEST_GUIDE.md)·[로컬 접속 가이드](./LOCAL_ACCESS_GUIDE.md)·[QUICK_REFERENCE.md](../QUICK_REFERENCE.md)·[AGENTS.md](../AGENTS.md)·[scripts/README.md](../scripts/README.md)·[개발 가이드](./DEV_GUIDE.md), [RUN_GUIDE.md](../RUN_GUIDE.md), [CONNECT.md](../CONNECT.md) §7, [입력·응답 문자열 정리](./guides/RESPONSE_CLEANING.md)
- **라우트·E2E·제목 문자열**: [README.md](./README.md) §NotebookLM·§개발 **통합·로컬**·[INTEGRATION_TEST_GUIDE.md](../INTEGRATION_TEST_GUIDE.md)·[e2e/README.md](../e2e/README.md)·[e2e/paths.ts](../e2e/paths.ts) — `src/config/routes.ts`와 동기 · [**`name`·`getPageTitle` → 프로젝트 대화**](../src/config/README.md)·[USAGE_GUIDE.md](../USAGE_GUIDE.md) §1.2 · [AGENTS.md](../AGENTS.md)·[TESTING_GUIDE.md](../TESTING_GUIDE.md) `routes.test`
- **구글 노트북 LM·노트북 기능·DeepSeek**: [README.md](./README.md) §NotebookLM·§개발 **통합·로컬**·[INTEGRATION_TEST_GUIDE.md](../INTEGRATION_TEST_GUIDE.md)·[기능 로직 및 NotebookLM·문서 허브·통합·로컬](./FEATURE_LOGIC_AND_STRENGTHS.md)(서두 **NotebookLM·문서 허브·통합·로컬**·§5.5·§6) · [기능 로드맵](./NOTEBOOKLM_FEATURE_ROADMAP.md)·[사용자 가이드](./PROJECT_NOTEBOOK_LLM_USER_GUIDE.md)·[수동 검증](./PROJECT_NOTEBOOK_LLM_VERIFICATION.md)·[DeepSeek 설정](./DEEPSEEK_SETUP.md)·표 행과 교차

---

## 5. 배포 스크립트 (선택)

- `scripts/deploy/start_main_server.sh` — 백엔드 (기본 **5002**, `PORT` 환경 변수로 변경 가능)
- `scripts/deploy/start_frontend.sh` — 프론트 (3000, 프로젝트 루트에서 npm start)

---

## 6. CI (GitHub Actions)

- **Node 버전**: 워크플로 **`setup-node`** ·루트 **`.nvmrc`** ·루트 **`package.json` `engines.node`** 모두 **>=20** 기준. 로컬은 `nvm use` / `fnm use` 권장.
- **수동 실행**: `ci-cd.yml`·`test-coverage.yml`·`e2e-tests.yml` 에 **`workflow_dispatch`** 가 있어 Actions 탭에서 브랜치를 골라 재실행할 수 있습니다. 실행 목록에는 **`run-name`**(`브랜치 / 이벤트`)으로 구분이 잘 됩니다.
- **Dependabot**: `.github/dependabot.yml` — **`github-actions`**(주간), 루트 **`npm`**(**월간**, PR 상한 5, `increase-if-necessary`), **`pip`** `/backend`(**월간**, PR 상한 5; `requirements.txt` 기준).
- **`ci-cd.yml` — jest-chat-pipeline-smoke**: `quality-check` 통과 후 **`npm run test:frontend:chat-pipeline`** · **`npm run test:chat-ui-interfaces:smoke:sequential`** (해당 잡 및 품질·빌드·E2E·Docker·CodeQL 등 주요 잡에 **타임아웃** 설정). `ci-cd`·`test-coverage`·`e2e-tests` 워크플로에 **`NODE_OPTIONS=--max-old-space-size=6144`** 를 두어 Jest·빌드 OOM을 완화합니다. **Docker 이미지 빌드**는 이 잡까지 성공한 뒤 진행됩니다.
- **`test-coverage.yml`**: `npm run test:ci`(전체 Jest+커버리지; 채팅 파이프라인·대형 UI 스위트 포함)로 별도 중복 단계 없이 커버리지를 수집합니다. Codecov는 **`codecov/codecov-action@v5`** + **`use_oidc: true`**(Codecov GitHub 앱·OIDC 권장; 불가 시 `secrets.CODECOV_TOKEN`), 업로드 실패·리포트 없음은 **`fail_ci_if_error: false`** / **`handle_no_reports_found`** 로 본 잡 실패를 막습니다. PR 코멘트는 **`marocchino/sticky-pull-request-comment@v3`**.
- **동시 실행 정리**: `ci-cd.yml`·`test-coverage.yml`·`e2e-tests.yml` 에 **`concurrency`** 가 있으며, **pull_request** 이벤트에서만 `cancel-in-progress` 로 이전 실행을 끊습니다(`main`/`develop` **직접 push**는 끊지 않아 Docker·배포 단계가 중간 취소되지 않음).
- **토큰 권한**: 위 워크플로에 **`permissions`** 를 두어 `GITHUB_TOKEN` 을 필요한 범위로 제한합니다(예: `ci-cd`는 아티팩트·GHCR·CodeQL, `test-coverage`는 PR 코멘트·Codecov OIDC(`id-token`), `e2e-tests`는 아티팩트 업로드).
- **포크 PR**: **docker-build**(GHCR 푸시)는 동일 저장소 PR·`push` 만 실행하고, 포크 PR은 건너뜁니다. 대신 **docker-build-fork-verify** 가 같은 아티팩트로 **`push: false`** Docker 빌드만 수행해 Dockerfile을 검증합니다.
