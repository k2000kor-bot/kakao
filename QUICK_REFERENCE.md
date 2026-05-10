# CORBU.AI - 빠른 참조

**NotebookLM·문서 허브·통합·로컬**: [docs/README.md](./docs/README.md) §NotebookLM·§개발 **통합·로컬**·[INTEGRATION_TEST_GUIDE.md](./INTEGRATION_TEST_GUIDE.md)·[docs/LOCAL_ACCESS_GUIDE.md](./docs/LOCAL_ACCESS_GUIDE.md)·[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)·[AGENTS.md](./AGENTS.md)·[scripts/README.md](./scripts/README.md) — [docs/FEATURE_LOGIC_AND_STRENGTHS.md](./docs/FEATURE_LOGIC_AND_STRENGTHS.md) §6 **검증·빠른 참조·QUICK_REFERENCE(루트)** 행 · §6 **Agent / AI 개발 가이드** 행 · §6 **config README·routes.ts(src/config)·프로젝트 대화** 행 · §6 **컴포넌트 아키텍처·COMPONENT_ARCHITECTURE(docs)·라우트→뷰** 행 · §6 **일상 개발·DEVELOPMENT(루트)** 행 · §6 **테스트 가이드·TESTING_GUIDE(루트)·API(docs)** 행 · [TESTING_GUIDE.md](./TESTING_GUIDE.md) 서두 **NotebookLM·문서 허브·통합·로컬** 교차 · §6 **E2E 가이드·e2e/README(루트)·경로 허브(docs)** 행 · [e2e/README.md](./e2e/README.md) 서두 **NotebookLM·문서 허브·통합·로컬** 교차 · §6 **완성 체크리스트·COMPLETION_CHECKLIST(docs)** 행 · [docs/NOTEBOOKLM_FEATURE_ROADMAP.md](./docs/NOTEBOOKLM_FEATURE_ROADMAP.md) §4 **에이전트 가이드** · §4 **config README(`routes.ts`)** · §4 **라우트·컴포넌트 매핑** · §4 **빠른 참조·QUICK_REFERENCE(루트)** · §4 **테스트 가이드·검증 허브(루트 TESTING_GUIDE)** · §4 **E2E 경로·가이드(루트)** · §4 **스크립트 허브(루트 scripts/README)** · §6 **스크립트 허브·scripts/README(루트)·dev/deploy(docs)** 행 · [scripts/README.md](./scripts/README.md) 서두 **NotebookLM·문서 허브·통합·로컬** 교차 · 동 허브 **NotebookLM·문서 허브·통합·로컬** 표 `QUICK_REFERENCE` 행 · [RUN_GUIDE.md](./RUN_GUIDE.md)·[CONNECT.md](./CONNECT.md) — [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)·[AGENTS.md](./AGENTS.md)·[scripts/README.md](./scripts/README.md)·[SYSTEM_READY.md](./SYSTEM_READY.md)·[DEVELOPMENT.md](./DEVELOPMENT.md) 서두 **일상 개발·실행·접속(루트)** · [src/config/README.md](./src/config/README.md)·[AGENTS.md](./AGENTS.md)·[TESTING_GUIDE.md](./TESTING_GUIDE.md) `routes.test` · [e2e/README.md](./e2e/README.md)·[docs/COMPLETION_CHECKLIST.md](./docs/COMPLETION_CHECKLIST.md) 서두 **NotebookLM·문서 허브·통합·로컬** 교차 · §6 **배포·풀 스택 체크리스트(docs)** 행 · [docs/FINAL_CHECKLIST.md](./docs/FINAL_CHECKLIST.md) 서두 **실행 가이드·접속 문제(루트)** · 표 행과 교차

**검증·실행·접속(루트)**: (명령·포트·검증·접속 URL은 아래 **명령어**·**접속**·**검증** 이하) · [RUN_GUIDE.md](./RUN_GUIDE.md)·[CONNECT.md](./CONNECT.md) — [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)·[AGENTS.md](./AGENTS.md)·[scripts/README.md](./scripts/README.md)·[SYSTEM_READY.md](./SYSTEM_READY.md)·[DEVELOPMENT.md](./DEVELOPMENT.md)·[docs/FEATURE_LOGIC_AND_STRENGTHS.md](./docs/FEATURE_LOGIC_AND_STRENGTHS.md) §6 · [docs/NOTEBOOKLM_FEATURE_ROADMAP.md](./docs/NOTEBOOKLM_FEATURE_ROADMAP.md) §4 · [USAGE_GUIDE.md](./USAGE_GUIDE.md) §11 · [docs/COMPONENT_ARCHITECTURE.md](./docs/COMPONENT_ARCHITECTURE.md) §1.1 · [QUICK_START.md](./QUICK_START.md)·[README_FIRST.md](./README_FIRST.md)·[START_HERE.md](./START_HERE.md)·[docs/DEVELOPMENT_CONTINUITY.md](./docs/DEVELOPMENT_CONTINUITY.md) §1·§2 · [README.md](./README.md)·[TESTING_GUIDE.md](./TESTING_GUIDE.md)·[e2e/README.md](./e2e/README.md)·[docs/COMPLETION_CHECKLIST.md](./docs/COMPLETION_CHECKLIST.md)(`verify:completion`) · [docs/FINAL_CHECKLIST.md](./docs/FINAL_CHECKLIST.md)(`verify:final`) · 표 행과 교차

**로컬 UI 스모크 체크리스트**: [docs/LOCAL_UI_SMOKE_CHECKLIST.md](./docs/LOCAL_UI_SMOKE_CHECKLIST.md)

## 명령어

| 명령어 | 설명 |
|--------|------|
| `make setup` / `./setup.sh` | 의존성 설치 (최초 1회) |
| `make start` / `./start_all.sh` | 시스템 시작 |
| `make stop` / `./stop_all.sh` | 시스템 종료 |
| `make check` / `npm run check:system` | 상태 확인 |
| `make plugins` / `./install-plugins.sh` | 추가 기능 설치 |

## 접속

| 서비스 | URL |
|--------|-----|
| 프론트엔드 | http://localhost:3000 |
| 통합 API 문서 | http://localhost:5002/api/docs |
| app.py 단독 (인증 등) | 기본 포트도 5002 — `API_PORT`로 분리 시 해당 포트 `/docs` |

## 포트

- 3000: React 프론트엔드
- **5002**: **main_server** + **app.py** 기본값 (대화·통합 API — `npm run restart:backend`). **동시에 둘 다 띄우지 말 것** (포트 충돌).
- 다른 포트: `API_PORT` / `BACKEND_PORT` / `GAEPO_ANALYSIS_PORT`(레거시 Flask 분석 기본 5001) 등

## 검증

| 목적 | 명령 |
|------|------|
| **마무리 검증** | `npm run verify:completion` (타입+린트+P4 170) |
| **배포 전 한 번에** | `npm run deploy:check` (verify:completion + build) |
| 빌드·접속·API·통합 + 대화 Jest + UI 스모크 | `npm run verify:final` (`scripts/final-verify.sh` — `check:test-imports` → 빌드 → … → `test:frontend:chat-pipeline` → `test:chat-ui-interfaces:smoke`, 실패 시 exit 1) |
| 위와 동일·UI 스모크만 순차 Jest | `npm run verify:final:sequential-smoke` (CI·로컬에서 combined tail 불안정 시) |
| 대화 파이프라인 메타 (Jest) | `npm run test:frontend:chat-pipeline` (`chatInputUtils`·스트리밍·프롬프트·Genspark 패널) · `npm test`/`pretest`: `check:src-frontend-parity`(동일 `make check-frontend-parity`) |
| ChatGPTInterface Jest | `npm run test:chatgpt-interface` (전 파일) · `test:chatgpt-interface:quick` (레이아웃·패널 접힘 등 일부) · `test:chatgpt-interface:genspark` (describe **에이전트 라우트 세션**만) — [TESTING_GUIDE.md](./TESTING_GUIDE.md) **ChatGPTInterface Jest 경로** |
| `routes.test`만 | `npm run test:routes` (**27** tests, `pretest` 포함) — [TESTING_GUIDE.md](./TESTING_GUIDE.md) |
| 활성 경로 md 허브 단락 | `npm run check:doc-verification-hub` (동일: `make check-doc-verification-hub`; `git ls-files`·노드만, Jest 미실행) — `DOC_HUB_STRICT=1`이면 누락 시 exit 1 — [TESTING_GUIDE.md](./TESTING_GUIDE.md)·[scripts/README.md](./scripts/README.md) |
| `AppUnified.test`만 | `npm run test:app-unified` (**115** tests, `pretest` 포함) — [TESTING_GUIDE.md](./TESTING_GUIDE.md) |
| 사이드바 컨텍스트 회귀 | `npm run test:sidebar-context` (동일: `make test-sidebar-context`; `AppUnified`·`SettingsView`·`ChatGPTInterface`·`sidebarContextFilterEvent`) — [docs/PUSH_BLOCK_HANDOFF.md](./docs/PUSH_BLOCK_HANDOFF.md) |
| 원격 `git push` 막힘 시 로컬 점검·이관 | `npm run maintain:push-block` (동일: `make maintain-push-block`; 아티팩트 검증·회귀·진단·상태 리포트) — [docs/PUSH_BLOCK_HANDOFF.md](./docs/PUSH_BLOCK_HANDOFF.md) |
| 루트 `src/` ↔ 보조 `frontend/src/` 미러·패리티 | `npm run sync:frontend-src`(동일: `make sync-frontend`) — `pretest`의 `check:test-imports`·`check:src-frontend-parity`(동일: `make check-frontend-parity`) 통과에 필요. `chatInputUtils`만 빠르게: `npm run sync:frontend-chat-input-utils`(동일: `make sync-frontend-chat-input`). 통합 대화(UI) 등 **부분** 미러: `npm run sync:frontend-unified-chat`(동일: `make sync-frontend-unified-chat`; scripts/README 표) — [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)·[AGENTS.md](./AGENTS.md)·[scripts/README.md](./scripts/README.md) |
| **LazyComponents.test `it` 변경** | `DevStatusView.tsx` CHANGES 끝 `·N tests` · `DevStatusView.test.tsx`의 `realTimeSync mock·N tests` 단언 동시 갱신 — [AGENTS.md](./AGENTS.md) 규칙 **6** · [TESTING_GUIDE.md](./TESTING_GUIDE.md) |
| dev:check | `npm run dev:check` (백엔드 144 + 타입 + lint) |
| 시스템 상태 | `npm run check:system` |
| **E2E (Playwright)** | `npm run test:e2e` (서버 자동) 또는 `npm run test:e2e:no-server` — [e2e/README.md](./e2e/README.md)·[e2e/paths.ts](./e2e/paths.ts)(`routes.ts` 동기) · [TESTING_GUIDE.md](./TESTING_GUIDE.md) `routes.test` |

```bash
./start_all.sh
# 20초 대기 후
npm run check:system
# 5001, 5002가 200이면 정상
```

마무리·배포 전: [docs/COMPLETION_CHECKLIST.md](docs/COMPLETION_CHECKLIST.md) §6 참고. `check:test-imports`·빌드·통합·대화 Jest·UI 스모크 한 번에: [docs/FINAL_CHECKLIST.md](docs/FINAL_CHECKLIST.md)·`npm run verify:final` · 순차 스모크는 `npm run verify:final:sequential-smoke`.  
NotebookLM·분야별 지식·글쓰기 스타일·딥러닝: [docs/NOTEBOOKLM_FEATURE_AND_KNOWLEDGE_CHECKLIST.md](docs/NOTEBOOKLM_FEATURE_AND_KNOWLEDGE_CHECKLIST.md) §2.4·§2.5.  
**NotebookLM·문서 허브·통합·로컬**: [docs/README.md](docs/README.md) §NotebookLM·§개발 **통합·로컬**·[INTEGRATION_TEST_GUIDE.md](./INTEGRATION_TEST_GUIDE.md)·[docs/LOCAL_ACCESS_GUIDE.md](docs/LOCAL_ACCESS_GUIDE.md)·[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)·[AGENTS.md](./AGENTS.md)·[scripts/README.md](./scripts/README.md) — [docs/FEATURE_LOGIC_AND_STRENGTHS.md](docs/FEATURE_LOGIC_AND_STRENGTHS.md)(서두·§6) · [docs/NOTEBOOKLM_FEATURE_ROADMAP.md](docs/NOTEBOOKLM_FEATURE_ROADMAP.md)·[docs/PROJECT_NOTEBOOK_LLM_USER_GUIDE.md](docs/PROJECT_NOTEBOOK_LLM_USER_GUIDE.md)·[docs/DEEPSEEK_SETUP.md](docs/DEEPSEEK_SETUP.md)·표 행과 교차.  
프로젝트 파일 업로드: COMPLETION_CHECKLIST §2 "프로젝트 파일 업로드" 행, [docs/API.md](docs/API.md) POST /api/projects/{id}/files.  
라우트·메뉴: `src/config/routes.ts` — `/agents`·`/`·`/chat` 등(`getStandaloneChatPath()`)·`/projects`·**`/projects/:id`**(`defaultRoutes[].name`·`getPageTitle` → **프로젝트 대화**)·`/voice-generation`. 구 URL(`/simple`·`/features`·`/notebook` 등)은 `AppUnified` 리다이렉트 — [USAGE_GUIDE.md](./USAGE_GUIDE.md) §1.2 · 요약: [src/config/README.md](./src/config/README.md)·[AGENTS.md](./AGENTS.md)·[TESTING_GUIDE.md](./TESTING_GUIDE.md) `routes.test` · [e2e/README.md](./e2e/README.md). [docs/BACKLOG.md](docs/BACKLOG.md) 102~117차(이력).  
풀스택 스크립트·로컬 접속·경로 동기: [INTEGRATION_TEST_GUIDE.md](./INTEGRATION_TEST_GUIDE.md)·[docs/LOCAL_ACCESS_GUIDE.md](docs/LOCAL_ACCESS_GUIDE.md) — 위 줄과 동일 링크 묶음 · [docs/README.md](docs/README.md) §NotebookLM(**통합·로컬**) · §개발 연속성 · 표 행과 교차.  
**실행 가이드·접속 문제(루트)**: [RUN_GUIDE.md](./RUN_GUIDE.md)·[CONNECT.md](./CONNECT.md) — [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)·[AGENTS.md](./AGENTS.md)·[scripts/README.md](./scripts/README.md)·[docs/setup/PYTHON_VENV.md](./docs/setup/PYTHON_VENV.md)·[docs/setup/MACOS_DEV_QUICKSTART.md](./docs/setup/MACOS_DEV_QUICKSTART.md)·[docs/FEATURE_LOGIC_AND_STRENGTHS.md](./docs/FEATURE_LOGIC_AND_STRENGTHS.md) §6 **실행 가이드·접속 문제(루트)** · [docs/NOTEBOOKLM_FEATURE_ROADMAP.md](./docs/NOTEBOOKLM_FEATURE_ROADMAP.md) §4 · 시작: [START_HERE.md](./START_HERE.md)·표 행과 교차.  
컴포넌트·라우트 매핑: [docs/COMPONENT_ARCHITECTURE.md](docs/COMPONENT_ARCHITECTURE.md) §1·§1.1(NotebookLM) — §1 동일 제목 문자열.  
**`/projects/:id`·NotebookLM 뷰 표**: [src/views/README.md](./src/views/README.md) 활성 뷰 표 및 NotebookLM 문단 · 표 행과 교차.  
**일상 개발·연속성**: [DEVELOPMENT.md](./DEVELOPMENT.md) §2.5·§7 TTS(주 진입 `/voice-generation`) · [START_HERE.md](./START_HERE.md) §개발 가이드 · [docs/DEVELOPMENT_CONTINUITY.md](./docs/DEVELOPMENT_CONTINUITY.md) §2 · [AGENTS.md](./AGENTS.md)(라우트·`CHATGPT_PROJECT_FEATURE_CHECKLIST`·**`name`·`getPageTitle` → 프로젝트 대화**·[src/config/README.md](./src/config/README.md)) · [TESTING_GUIDE.md](./TESTING_GUIDE.md) `routes.test` · [e2e/README.md](./e2e/README.md).  
대화 입력·문자열 정규화: [docs/guides/RESPONSE_CLEANING.md](docs/guides/RESPONSE_CLEANING.md) (`coerceTrimmedString`; 보조 트리는 `npm run sync:frontend-chat-input-utils` 한 파일·`make sync-frontend-chat-input`과 동일, 통합 대화(UI) 등 부분 `npm run sync:frontend-unified-chat`·`make sync-frontend-unified-chat`과 동일, 또는 `npm run sync:frontend-src` 전체·`make sync-frontend`와 동일; `npm test`/`pretest`: `check:src-frontend-parity`·동일 `make check-frontend-parity`) — [scripts/README.md](./scripts/README.md).

## 문제 해결

```bash
# 포트 충돌
./stop_all.sh && ./start_all.sh

# 플러그인 상태
./install-plugins.sh status
```

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](docs/COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](docs/FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

