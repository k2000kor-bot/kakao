# 개발 가이드

프로젝트 개발·검증·테스트를 위한 요약 가이드입니다.

**NotebookLM·문서 허브·통합·로컬**: [README.md](./README.md) §NotebookLM·§개발 **통합·로컬**·[INTEGRATION_TEST_GUIDE.md](../INTEGRATION_TEST_GUIDE.md)·[LOCAL_ACCESS_GUIDE.md](./LOCAL_ACCESS_GUIDE.md)·[DEV_GUIDE.md](./DEV_GUIDE.md)·[QUICK_REFERENCE.md](../QUICK_REFERENCE.md)·[AGENTS.md](../AGENTS.md)·[scripts/README.md](../scripts/README.md) — [FEATURE_LOGIC_AND_STRENGTHS.md](./FEATURE_LOGIC_AND_STRENGTHS.md) §6 **개발 요약·개발자 체크리스트(docs)** 행 · §6 **개발 연속성·DEVELOPMENT_CONTINUITY(docs)·경로·뷰** 행 · §6 **통합 테스트·INTEGRATION_TEST_GUIDE(루트)·로컬 접속·LOCAL_ACCESS_GUIDE(docs)** 행 · §6 **테스트 가이드·TESTING_GUIDE(루트)·API(docs)** 행 · §6 **E2E 가이드·e2e/README(루트)·경로 허브(docs)** 행 · §6 **config README·routes.ts(src/config)·프로젝트 대화** 행 · §6 **컴포넌트 아키텍처·COMPONENT_ARCHITECTURE(docs)·라우트→뷰** 행 · [DEVELOPER_QUICK_CHECKLIST.md](./DEVELOPER_QUICK_CHECKLIST.md) 짝 문서 · [NOTEBOOKLM_FEATURE_ROADMAP.md](./NOTEBOOKLM_FEATURE_ROADMAP.md) §4 **config README(`routes.ts`)** · §4 **라우트·컴포넌트 매핑** · §4 **개발 요약·개발자 체크리스트(DEVELOPER_QUICK_CHECKLIST·docs)** · [**`name`·`getPageTitle` → 프로젝트 대화**](../src/config/README.md)·[AGENTS.md](../AGENTS.md)·[TESTING_GUIDE.md](../TESTING_GUIDE.md) `routes.test` · [e2e/README.md](../e2e/README.md)·[scripts/README.md](../scripts/README.md)·표 행과 교차

**실행 가이드·접속 문제(루트)**: [RUN_GUIDE.md](../RUN_GUIDE.md)·[CONNECT.md](../CONNECT.md) — [QUICK_REFERENCE.md](../QUICK_REFERENCE.md)·[AGENTS.md](../AGENTS.md)·[scripts/README.md](../scripts/README.md)·[FEATURE_LOGIC_AND_STRENGTHS.md](./FEATURE_LOGIC_AND_STRENGTHS.md) §6 · [NOTEBOOKLM_FEATURE_ROADMAP.md](./NOTEBOOKLM_FEATURE_ROADMAP.md) §4 · [COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md) §1.1 · [USAGE_GUIDE.md](../USAGE_GUIDE.md) §11 · [DEVELOPMENT_CONTINUITY.md](./DEVELOPMENT_CONTINUITY.md) §1·§2 · [QUICK_START.md](../QUICK_START.md)·[README_FIRST.md](../README_FIRST.md)·[START_HERE.md](../START_HERE.md)·[DEVELOPMENT.md](../DEVELOPMENT.md) §2 · [SYSTEM_READY.md](../SYSTEM_READY.md) §빠른 참조 · [README.md](../README.md)·[TESTING_GUIDE.md](../TESTING_GUIDE.md)·[e2e/README.md](../e2e/README.md)·[COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md)·[FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)·표 행과 교차

**로컬 UI 스모크 체크리스트**: [LOCAL_UI_SMOKE_CHECKLIST.md](./LOCAL_UI_SMOKE_CHECKLIST.md)

---

## 환경

- **프론트엔드**: Node.js **20** (`.nvmrc`·CI와 동일, `package.json` `engines`), React 19, 포트 **3000**
- **백엔드**: Python 3.8+, FastAPI, 통합 API 포트 **5002** (`main_server.py`, `npm run restart:backend`)

---

## 실행

| 목적 | 명령 |
|------|------|
| 프론트만 | `npm start` → http://localhost:3000 · 표 행과 교차 |
| 백엔드만 | `cd backend && python3 main_server.py` → http://localhost:5002 · 표 행과 교차 |
| 프론트 재시작 | `npm run restart` · 표 행과 교차 |
| 백엔드 재시작 | `npm run restart:backend` · 표 행과 교차 |

상세: [RUN_GUIDE.md](../RUN_GUIDE.md), [로컬 접속 가이드](./LOCAL_ACCESS_GUIDE.md).

---

## 검증·테스트

| 명령 | 설명 |
|------|------|
| `npm run check:access` | 프론트(3000)·백엔드(5002) 접속 가능 여부 확인 · 표 행과 교차 |
| `npm run verify:api` | GET /api/health, /api/status, /api/docs 응답 확인 · 표 행과 교차 |
| `npm run test:integration` | 대화 API·에러 시나리오(400/422)·스트리밍 통합 테스트 (백엔드 실행 중 필요) · 표 행과 교차 |
| `npm run test:frontend:chat-pipeline` | 프론트 Jest: `chatInputUtils`·`streamingClient`·`generationPromptBuilder`·Genspark 패널 (백엔드 불필요). 보조 트리: `npm run sync:frontend-src`(전체·동일 `make sync-frontend`)·`chatInputUtils`만 `npm run sync:frontend-chat-input-utils`(동일 `make sync-frontend-chat-input`)·통합 대화(UI) 등 부분 `npm run sync:frontend-unified-chat`(동일 `make sync-frontend-unified-chat`) · `npm test`/`pretest`: `check:src-frontend-parity`(동일 `make check-frontend-parity`) · 표 행과 교차 |
| `npm run test:routes` | 프론트 Jest: `config/__tests__/routes.test`만 — 라우트·제목·네비·Genspark 쿼리 등 계약 (백엔드 불필요). 상세·수치: [TESTING_GUIDE.md](../TESTING_GUIDE.md)·표 행과 교차 |
| `npm run test:app-unified` | 프론트 Jest: `AppUnified.test`만 — 앱 셸·라우팅 통합 유닛 (백엔드 불필요). 상세: [TESTING_GUIDE.md](../TESTING_GUIDE.md)·표 행과 교차 |
| `npm run test:sidebar-context` | 사이드바 컨텍스트·설정·대화 이력 관련 Jest 묶음 (`scripts/test-sidebar-context.sh`; 동일 `make test-sidebar-context`). 상세: [TESTING_GUIDE.md](../TESTING_GUIDE.md)·[PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md) · 표 행과 교차 |
| `npm run maintain:push-block` | 원격 `git push` 막힘 시 아티팩트 검증·회귀·진단·상태 문서 갱신 (`scripts/run-push-block-maintenance.sh`; 동일 `make maintain-push-block`). 상세: [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md) · 표 행과 교차 |
| `npm run build` | 프론트 프로덕션 빌드 · 표 행과 교차 |
| `cd backend && python3 -m pytest tests/test_main_server.py tests/test_unified_chat_api.py -v` | 백엔드 API 단위·통합 테스트 · 표 행과 교차 |
| `cd backend && python3 -m pytest tests/test_project_session_api.py::TestProjectNotebookContext -v` | 프로젝트별 NotebookLM·컨텍스트·소스·PATCH·스튜디오·`/api/chat` 등(통합 LLM 모킹·`httpx<0.27` 권장) · 표 행과 교차 |

---

## API 문서

- **Swagger**: http://localhost:5002/api/docs (백엔드 실행 후)
- **ReDoc**: http://localhost:5002/api/redoc

---

## NotebookLM·문서 허브·통합·로컬·pytest

- **NotebookLM·문서 허브·통합·로컬(기능 로직)**: [FEATURE_LOGIC_AND_STRENGTHS.md](./FEATURE_LOGIC_AND_STRENGTHS.md) — 서두 **NotebookLM·문서 허브·통합·로컬**, §5.5 `test_project_session_api`, §6 참고 표 · 표 행과 교차
- **화면·Phase·엔진**: [NOTEBOOKLM_FEATURE_ROADMAP.md](./NOTEBOOKLM_FEATURE_ROADMAP.md) §4·§4.1
- **사용자 가이드·Drive**: [PROJECT_NOTEBOOK_LLM_USER_GUIDE.md](./PROJECT_NOTEBOOK_LLM_USER_GUIDE.md)
- **DeepSeek·`NOTEBOOK_LLM_USE_DEEPSEEK`**: [DEEPSEEK_SETUP.md](./DEEPSEEK_SETUP.md)

### 라우팅 (앱·E2E)

- **앱**: `AppUnified` + `src/config/routes.ts` — `/agents`, `/`, `/chat` 등(독립 대화), `/projects`, **`/projects/:id`**(NotebookLM), `/voice-generation`. 구 URL(`/simple`·`/features`·`/notebook` 등)은 리다이렉트 — [USAGE_GUIDE.md](../USAGE_GUIDE.md) §1.2 · [DEVELOPMENT.md](../DEVELOPMENT.md) 앱 진입점 · 제목 규약(**`name`·`getPageTitle` → 프로젝트 대화**): [src/config/README.md](../src/config/README.md)·라우트: [AGENTS.md](../AGENTS.md)
- **E2E**: [e2e/paths.ts](../e2e/paths.ts) (`PATHS`, `LEGACY_REDIRECT_PATHS`), [e2e/README.md](../e2e/README.md) 경로 상수·스펙 요약 — 앱 `routes.ts`와 동기 · 점검: `npm run test:routes`·`npm run test:app-unified`·`npm run test:sidebar-context` — [TESTING_GUIDE.md](../TESTING_GUIDE.md) `routes.test` 등

---

## 최종 검증 (배포 전)

- **한 번에 실행**: `npm run verify:final` (= `./scripts/final-verify.sh`) — **`npm run check:test-imports`** + 빌드 + 접속 + API + 통합 테스트 + **`npm run test:frontend:chat-pipeline`** + **`npm run test:chat-ui-interfaces:smoke`**. UI 스모크 순차: **`npm run verify:final:sequential-smoke`** 또는 `VERIFY_FINAL_CHAT_UI_SMOKE=sequential`.
- **체크리스트**: [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)
- **마무리 검증(타입·린트·P4 등, 배포 전 단계)**: `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md). 선행(선택·빠름): 위 **`test:routes`**·**`test:app-unified`**·**`test:sidebar-context`**. 원격 push 막힘: [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(**`maintain:push-block`**)

---

## 클라이언트 저장 (localStorage)

대화 화면(`ChatGPTInterface`)에서 사용하는 주요 키:

| 키 | 용도 |
|----|------|
| `chatgpt-theme` | 테마 (light/dark) · 표 행과 교차 |
| `chatgpt-show-timestamps` | 메시지 시간 표시 여부 · 표 행과 교차 |
| `chatgpt-conversations` | 대화 목록·메시지 · 표 행과 교차 |
| `chatgpt-projects` | 프로젝트 목록(캐시) · 표 행과 교차 |
| `chatgpt-composer-response-mode` | 공동입력창 Auto 드롭다운 선택값 (`auto` / `concise` / `detailed`) — 새로고침 후 복원 · 표 행과 교차 |

프로젝트별: `notebook-selected-sources-${projectId}`, `chatgpt-output-preset-by-project` 등. 상세: [CHAT_UI_LAYOUT_SAMPLE.md](./CHAT_UI_LAYOUT_SAMPLE.md), [CHATGPT_PROJECT_FEATURE_CHECKLIST.md](./CHATGPT_PROJECT_FEATURE_CHECKLIST.md).

**입력 문자열**: 전송·검색 등은 `chatInputUtils.coerceTrimmedString` / `coerceTrimmedEnd` — [guides/RESPONSE_CLEANING.md](./guides/RESPONSE_CLEANING.md).

---

## 문제 해결

- 접속 안 됨: [LOCAL_ACCESS_GUIDE.md](./LOCAL_ACCESS_GUIDE.md) — 반드시 프로젝트 폴더에서 실행, test.html 확인 등
- 트러블슈팅: [TROUBLESHOOTING_GUIDE.md](./guides/TROUBLESHOOTING_GUIDE.md)
- 개발 단계 현황: [DEVELOPMENT_ROADMAP.md](../DEVELOPMENT_ROADMAP.md)

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
