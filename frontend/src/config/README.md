# Config (설정)

**NotebookLM·문서 허브·통합·로컬**: [docs/README.md](../../docs/README.md) §NotebookLM·§개발 **통합·로컬**·[INTEGRATION_TEST_GUIDE.md](../../INTEGRATION_TEST_GUIDE.md)·[docs/LOCAL_ACCESS_GUIDE.md](../../docs/LOCAL_ACCESS_GUIDE.md)·[QUICK_REFERENCE.md](../../QUICK_REFERENCE.md)·[AGENTS.md](../../AGENTS.md)·[scripts/README.md](../../scripts/README.md) — [docs/FEATURE_LOGIC_AND_STRENGTHS.md](../../docs/FEATURE_LOGIC_AND_STRENGTHS.md) §6 **config README·routes.ts(src/config)·프로젝트 대화** 행 · §6 **컴포넌트 아키텍처·COMPONENT_ARCHITECTURE(docs)·라우트→뷰** 행 · §6 **개발 연속성·DEVELOPMENT_CONTINUITY(docs)·경로·뷰** 행 · §6 **테스트 가이드·TESTING_GUIDE(루트)·API(docs)** 행 · §6 **E2E 가이드·e2e/README(루트)·경로 허브(docs)** 행 · [docs/NOTEBOOKLM_FEATURE_ROADMAP.md](../../docs/NOTEBOOKLM_FEATURE_ROADMAP.md) §4 **config README(`routes.ts`)** · §4 **라우트·컴포넌트 매핑** · [docs/COMPONENT_ARCHITECTURE.md](../../docs/COMPONENT_ARCHITECTURE.md)·표 행과 교차

**실행 가이드·접속 문제(루트)**: (본 폴더 **`routes.ts`**·`getPageTitle`·`allAppPaths`·`e2e/paths.ts` 동기) · [RUN_GUIDE.md](../../RUN_GUIDE.md)·[CONNECT.md](../../CONNECT.md) — [QUICK_REFERENCE.md](../../QUICK_REFERENCE.md)·[AGENTS.md](../../AGENTS.md)·[scripts/README.md](../../scripts/README.md)·[docs/FEATURE_LOGIC_AND_STRENGTHS.md](../../docs/FEATURE_LOGIC_AND_STRENGTHS.md) §6 · [docs/NOTEBOOKLM_FEATURE_ROADMAP.md](../../docs/NOTEBOOKLM_FEATURE_ROADMAP.md) §4 · [USAGE_GUIDE.md](../../USAGE_GUIDE.md) §1.2·§11 · [docs/COMPONENT_ARCHITECTURE.md](../../docs/COMPONENT_ARCHITECTURE.md) §1.1 · [docs/DEVELOPMENT_CONTINUITY.md](../../docs/DEVELOPMENT_CONTINUITY.md) §1·§2 · [docs/DEVELOPER_QUICK_CHECKLIST.md](../../docs/DEVELOPER_QUICK_CHECKLIST.md)·[TESTING_GUIDE.md](../../TESTING_GUIDE.md) `npm run test:routes`(`routes.test`, 27 tests) · [e2e/README.md](../../e2e/README.md)·[AGENTS.md](../../AGENTS.md)·표 행과 교차

## 파일

| 파일 | 용도 |
|------|------|
| **routes.ts** | 라우트 정의, getPageTitle, VOICE_GENERATION_PATH, allAppPaths — **`/projects/:id`** 항목 **`name`**·동적 `getPageTitle()` 반환은 **프로젝트 대화**([USAGE_GUIDE.md](../../USAGE_GUIDE.md) §1.2와 동일) |
| **api.ts** | API_BASE_URL, WS_BASE_URL, API_ENDPOINTS |

## 참조

- 라우트 Jest만: `npm run test:routes` — [TESTING_GUIDE.md](../../TESTING_GUIDE.md) 주요 검증 표
- 앱 셸·사이드바: `npm run test:app-unified` · `npm run test:sidebar-context` — 동일 [TESTING_GUIDE.md](../../TESTING_GUIDE.md). 원격 push 막힘: [docs/PUSH_BLOCK_HANDOFF.md](../../docs/PUSH_BLOCK_HANDOFF.md)
- 보조 CRA `frontend/src/`: 루트 `src/` 변경 후 **`npm run sync:frontend-src`**(동일 **`make sync-frontend`**; `pretest`·`check:src-frontend-parity`(동일: `make check-frontend-parity`)). `chatInputUtils.ts`만 **`npm run sync:frontend-chat-input-utils`**(동일 **`make sync-frontend-chat-input`**). 통합 대화(UI) 등 부분 **`npm run sync:frontend-unified-chat`**(동일 **`make sync-frontend-unified-chat`**) — [QUICK_REFERENCE.md](../../QUICK_REFERENCE.md)·[AGENTS.md](../../AGENTS.md)·[scripts/README.md](../../scripts/README.md)
- E2E 경로: `e2e/paths.ts` (routes와 동기화)
- [docs/DEVELOPMENT_CONTINUITY.md](../../docs/DEVELOPMENT_CONTINUITY.md)
- 대화 입력 문자열 정규화는 라우트가 아니라 UI·서비스에서 처리: `src/utils/chatInputUtils.ts`, [guides/RESPONSE_CLEANING.md](../../docs/guides/RESPONSE_CLEANING.md)
- **루트 풀 검증(선택)**: 라우트·경로 변경 후 `npm run verify:final` — [docs/FINAL_CHECKLIST.md](../../docs/FINAL_CHECKLIST.md)

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../../../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../../../docs/COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../../../docs/FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../../../docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

