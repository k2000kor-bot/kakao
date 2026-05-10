# 개발자 빠른 체크리스트

통합 API(main.py) 기준으로 로컬 실행·테스트·API 확인을 빠르게 할 때 참고하세요.

**NotebookLM·문서 허브·통합·로컬**: [README.md](./README.md) §NotebookLM·§개발 **통합·로컬**·[INTEGRATION_TEST_GUIDE.md](../INTEGRATION_TEST_GUIDE.md)·[LOCAL_ACCESS_GUIDE.md](./LOCAL_ACCESS_GUIDE.md)·[DEVELOPER_QUICK_CHECKLIST.md](./DEVELOPER_QUICK_CHECKLIST.md)·[QUICK_REFERENCE.md](../QUICK_REFERENCE.md)·[AGENTS.md](../AGENTS.md)·[scripts/README.md](../scripts/README.md) — [FEATURE_LOGIC_AND_STRENGTHS.md](./FEATURE_LOGIC_AND_STRENGTHS.md) §6 **개발 요약·개발자 체크리스트(docs)** 행 · §6 **개발 연속성·DEVELOPMENT_CONTINUITY(docs)·경로·뷰** 행 · §6 **config README·routes.ts(src/config)·프로젝트 대화** 행 · §6 **컴포넌트 아키텍처·COMPONENT_ARCHITECTURE(docs)·라우트→뷰** 행 · §6 **통합 테스트·INTEGRATION_TEST_GUIDE(루트)·로컬 접속·LOCAL_ACCESS_GUIDE(docs)** 행 · §6 **테스트 가이드·TESTING_GUIDE(루트)·API(docs)** 행 · §6 **E2E 가이드·e2e/README(루트)·경로 허브(docs)** 행 · §6 **스크립트 허브·scripts/README(루트)·dev/deploy(docs)** 행 · §6 **완성 체크리스트·COMPLETION_CHECKLIST(docs)** · §6 **배포·풀 스택 체크리스트(docs)** 행 · [DEV_GUIDE.md](./DEV_GUIDE.md) 교차 · [NOTEBOOKLM_FEATURE_ROADMAP.md](./NOTEBOOKLM_FEATURE_ROADMAP.md) §4 **config README(`routes.ts`)** · §4 **라우트·컴포넌트 매핑** · §4 **개발 요약·개발자 체크리스트(DEVELOPER_QUICK_CHECKLIST·docs)** · §4 **앱 기동·RUN_GUIDE(루트)** 연계 · 동 허브 **개발·개발 연속성** 표 `DEVELOPER_QUICK_CHECKLIST` 행 · 표 행과 교차

**`name`·`getPageTitle` → 프로젝트 대화** · [../src/config/README.md](../src/config/README.md)·[AGENTS.md](../AGENTS.md)·[TESTING_GUIDE.md](../TESTING_GUIDE.md) `routes.test` · [e2e/README.md](../e2e/README.md)·[scripts/README.md](../scripts/README.md)·[COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md)·[FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)

**실행 가이드·접속 문제(루트)**: (본 문서 **§6 E2E·라우트**·실행·테스트·API 표) · [RUN_GUIDE.md](../RUN_GUIDE.md)·[CONNECT.md](../CONNECT.md) — [QUICK_REFERENCE.md](../QUICK_REFERENCE.md)·[AGENTS.md](../AGENTS.md)·[scripts/README.md](../scripts/README.md)·[FEATURE_LOGIC_AND_STRENGTHS.md](./FEATURE_LOGIC_AND_STRENGTHS.md) §6 · [NOTEBOOKLM_FEATURE_ROADMAP.md](./NOTEBOOKLM_FEATURE_ROADMAP.md) §4 · [COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md) §1.1 · [USAGE_GUIDE.md](../USAGE_GUIDE.md) §11 · [DEVELOPMENT_CONTINUITY.md](./DEVELOPMENT_CONTINUITY.md) §1·§2 · [QUICK_START.md](../QUICK_START.md)·[README_FIRST.md](../README_FIRST.md)·[START_HERE.md](../START_HERE.md)·[DEVELOPMENT.md](../DEVELOPMENT.md) §2 · [SYSTEM_READY.md](../SYSTEM_READY.md) §빠른 참조 · [README.md](../README.md)·[TESTING_GUIDE.md](../TESTING_GUIDE.md)·[e2e/README.md](../e2e/README.md)·[scripts/README.md](../scripts/README.md)·[COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md)(`verify:completion`) · [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`verify:final`) · 표 행과 교차

**로컬 UI 스모크 체크리스트**: [LOCAL_UI_SMOKE_CHECKLIST.md](./LOCAL_UI_SMOKE_CHECKLIST.md)

---

## 1. 실행

| 서버 | 명령 | URL |
|------|------|-----|
| 백엔드 (통합 API) | **`npm run restart:backend`** (권장) 또는 `cd backend && python3 -m api.main` | http://localhost:5002 · 표 행과 교차 |
| 프론트엔드 | `npm start` | http://localhost:3000 · 표 행과 교차 |

접속 문제 시: [CONNECT.md](../CONNECT.md)

---

## 2. 테스트

| 대상 | 명령 | 기대 |
|------|------|------|
| 프론트 점검 (타입·린트) | `npm run dev:check:frontend` | pytest 없이 타입·ESLint만 검사 · 표 행과 교차 |
| 전체 dev:check | `npm run dev:check` | 백엔드 pytest + 타입 + 린트 (pytest 필요) · 표 행과 교차 |
| 마무리 검증 (한 번에) | `npm run verify:completion` | dev:check:frontend + P4 170 tests · 표 행과 교차 |
| 배포 직전 풀 스택 | `npm run verify:final` | `final-verify.sh`: import 검사·빌드·접속·API·통합·`test:frontend:chat-pipeline`·`test:chat-ui-interfaces:smoke` ([FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)) · 표 행과 교차 |
| 배포 직전(UI 스모크 순차) | `npm run verify:final:sequential-smoke` | combined 스모크 tail이 불안정할 때(동일 스크립트, 마지막만 파일별 Jest) · 표 행과 교차 |
| 라우트 설정만 | `npm run test:routes` | **27** tests (`pretest` 포함) — [TESTING_GUIDE.md](../TESTING_GUIDE.md)·표 행과 교차 |
| 통합 앱 셸만 | `npm run test:app-unified` | **115** tests (`pretest` 포함, 수 초대) — [TESTING_GUIDE.md](../TESTING_GUIDE.md)·표 행과 교차 |
| 사이드바 컨텍스트 회귀 | `npm run test:sidebar-context` | `AppUnified`·설정·대화 이력 등 묶음 (`pretest`·`sync:frontend-src` 포함; 동일 `make test-sidebar-context`) — [TESTING_GUIDE.md](../TESTING_GUIDE.md)·[PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md) |
| 원격 push 막힘 (로컬) | `npm run maintain:push-block` | 아티팩트·회귀·진단·`PUSH_BLOCK_*` 문서 갱신 (동일 `make maintain-push-block`) — [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md) |
| 뷰·라우트 (22 suites) | `npm run test:views` | 142 tests (선택, 배포 전 권장) · 표 행과 교차 |
| 백엔드 API (main.py) | `cd backend && python3 -m pytest tests/test_main_api.py -v` | 약 66개 통과 · 표 행과 교차 |
| P4 서비스 (8 suites) | `npm run test:p4:services` | 170 tests · 표 행과 교차 |
| 대화 파이프라인 메타 (Jest) | `npm run test:frontend:chat-pipeline` | `chatInputUtils`·스트리밍·프롬프트 빌더·Genspark 패널. 보조 트리: `npm run sync:frontend-src`(전체·동일 `make sync-frontend`)·`chatInputUtils`만 `npm run sync:frontend-chat-input-utils`(동일 `make sync-frontend-chat-input`)·통합 대화(UI) 등 부분 `npm run sync:frontend-unified-chat`(동일 `make sync-frontend-unified-chat`) · `npm test`/`pretest`: `check:src-frontend-parity`(동일 `make check-frontend-parity`) · 표 행과 교차 |
| E2E (Playwright) | `npm run test:e2e` (서버 자동 기동) 또는 `npm run test:e2e:no-server` (서버 선실행 후) | Chromium 기준 69 passed, 6 skipped (대화·프로젝트·스트리밍 등) · 표 행과 교차 |

**LazyComponents.test ↔ `/dev-status` CHANGES**: `LazyComponents.test.tsx`에서 `it`를 추가·제거하면 `DevStatusView.tsx` CHANGES(`LazyComponents.test.tsx` 항목 끝 `·N tests`)·`DevStatusView.test.tsx`의 `realTimeSync mock·N tests` 단언을 함께 갱신 — [AGENTS.md](../AGENTS.md) 규칙 **6** · [TESTING_GUIDE.md](../TESTING_GUIDE.md) · [DEVELOPMENT_CONTINUITY.md](./DEVELOPMENT_CONTINUITY.md) §3.

E2E에는 **`/agents`**·**`/chat`**·홈 **`/`**·**`/projects`**·**`/projects/:id`**·**`/voice-generation`** 및 **`LEGACY_REDIRECT_PATHS`**(구 경로 리다이렉트) 검증이 포함됩니다 — [e2e/README.md](../e2e/README.md)·[USAGE_GUIDE.md](../USAGE_GUIDE.md) §1.2 · [TESTING_GUIDE.md](../TESTING_GUIDE.md) `routes.test` · 유닛 선행: `npm run test:routes`·`npm run test:app-unified`·`npm run test:sidebar-context` · [AGENTS.md](../AGENTS.md). Playwright 브라우저 미설치 시 `npx playwright install` 실행 후 테스트.

**노트북·프로젝트 API·pytest**: `tests/test_project_session_api.py` — [FEATURE_LOGIC_AND_STRENGTHS.md](./FEATURE_LOGIC_AND_STRENGTHS.md) §5.5·§6, [NOTEBOOKLM_FEATURE_ROADMAP.md](./NOTEBOOKLM_FEATURE_ROADMAP.md) §4.1, [e2e/README.md](../e2e/README.md) NotebookLM UI 문구 · 표 행과 교차

상세: [CONNECT.md](../CONNECT.md) 7. 테스트 실행

---

## 3. API 확인 (curl)

백엔드(5002) 실행 후:

```bash
# 헬스
curl -s http://localhost:5002/api/health | head -c 200

# 기능 상태 (프론트 useApiStatus)
curl -s http://localhost:5002/api/status | head -c 200

# API 목록
curl -s http://localhost:5002/api | head -c 300

# 대화 (POST)
curl -s -X POST http://localhost:5002/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"안녕하세요"}' | head -c 300

# 프로젝트 목록 (GET)
curl -s http://localhost:5002/api/projects | head -c 300
```

OpenAPI 문서: http://localhost:5002/api/docs

---

## 4. 주요 엔드포인트 (main.py)

- `GET /`, `GET /api`, `GET /api/health`, `GET /api/status`
- `POST /api/chat` (message)
- `GET/POST /api/projects`, `GET/PUT/DELETE /api/projects/<id>`
- `GET /api/tts/config`, `GET /api/tts/voices`, `GET /api/tts/situations`
- `POST /api/tts/script-style/extract-document`, `analyze`, `generate`

요청 본문 최대 16MB. 초과 시 413.

---

## 5. 배포 전 체크 (요약)

- 백엔드·프론트 포트(5002, 3000) 및 환경 변수 확인
- **`npm run verify:final`** (또는 UI 스모크 순차 **`npm run verify:final:sequential-smoke`**) — [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md) §1~3

## 6. 개발 연속성·경로 참조

| 항목 | 위치 | 용도 |
|------|------|------|
| 라우트·경로 | `src/config/routes.ts` | `defaultRoutes`(**`name`**), **`AGENTS_PATH`**, `VOICE_GENERATION_PATH`, **`allAppPaths`**(`/chat` 등), **`getPageTitle`**(**`/projects/:id` → 프로젝트 대화**) — [../src/config/README.md](../src/config/README.md)·[../AGENTS.md](../AGENTS.md)·[../TESTING_GUIDE.md](../TESTING_GUIDE.md) `routes.test` · 표 행과 교차 |
| E2E 경로 | `e2e/paths.ts` | `PATHS.HOME`·`CHAT`·`AGENTS`·`PROJECTS`·`VOICE_GENERATION`, `LEGACY_REDIRECT_PATHS` — `routes.ts`와 동기화 · [../e2e/README.md](../e2e/README.md)·표 행과 교차 |
| 컴포넌트 매핑 | DEVELOPMENT.md §2.5 | 대화·프로젝트 관리·목소리 생성 컴포넌트 위치 · 표 행과 교차 |
| 대화 흐름 검증 | [guides/CHAT_ANSWER_FLOW_VERIFICATION.md](guides/CHAT_ANSWER_FLOW_VERIFICATION.md) | 입력→질문 표시→답변 생성·표시 검증 및 수동 체크리스트 · 표 행과 교차 |
| 입력·응답 문자열 정규화 | [guides/RESPONSE_CLEANING.md](guides/RESPONSE_CLEANING.md) | `coerceTrimmedString`·`coerceTrimmedEnd`·미러 동기화 · 표 행과 교차 |
| UX 메시징 | [guides/UX_MESSAGING_GUIDE.md](guides/UX_MESSAGING_GUIDE.md) | 로딩·에러·토스트 문구 규칙 (개발 시 참고) · 표 행과 교차 |
| 작업·우선순위 | docs/BACKLOG.md | 새 기능·버그 추가·완료 체크 · 표 행과 교차 |

경로 변경 시 `routes.ts`·`e2e/paths.ts` 함께 수정. **`name`·`getPageTitle`** 갱신 시 [TESTING_GUIDE.md](../TESTING_GUIDE.md) `routes.test`·[USAGE_GUIDE.md](../USAGE_GUIDE.md) §1.2·[src/config/README.md](../src/config/README.md) 표와 맞춥니다. 새 기능 시 BACKLOG·COMPLETION_CHECKLIST·AGENTS.md 동기화 권장.

**개발 연속성 전체**: [docs/DEVELOPMENT_CONTINUITY.md](DEVELOPMENT_CONTINUITY.md) — 경로·컴포넌트 매핑·체크리스트·관련 문서. **컴포넌트 아키텍처**: [docs/COMPONENT_ARCHITECTURE.md](COMPONENT_ARCHITECTURE.md).
- `npm run dev:check:frontend` 또는 `npm run dev:check` (프론트 타입·린트)
- `npm run build` 통과
- `cd backend && python3 -m pytest tests/test_main_api.py -q` 통과 (pytest 설치 시)
- (선택) E2E: `npm run test:e2e:no-server` 통과 (Playwright: `npx playwright install`)

---

## 7. 참고 문서

- [START_HERE.md](../START_HERE.md) - 빠른 시작
- [CONNECT.md](../CONNECT.md) - 접속·테스트
- [docs/DEV_GUIDE.md](./DEV_GUIDE.md) - 상세 개발 가이드 (다른 백엔드 포트 포함)

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
