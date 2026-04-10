# 개발 연속성 가이드

새 기능 추가·경로 변경·컴포넌트 수정 시 참조할 문서·위치 일람.

**README가 있는 폴더**: config, services, hooks, store, utils, styles, types, views, components/ProjectManagement, components/Chat, e2e, backend, backend/api, scripts. **docs 진입점**: [docs/README.md](./README.md)

## 0. 앱 진입·레이아웃

| 항목 | 위치 | 용도 |
|------|------|------|
| 앱 루트 | `src/index.tsx` | `import App from './AppUnified'` — 통합 2단 레이아웃 사용 |
| 통합 레이아웃 | `src/AppUnified.tsx` | 사이드바 + 메인(Outlet), 라우트·테마·토스트·ErrorBoundary. 상세: [COMPONENT_ARCHITECTURE.md §0](./COMPONENT_ARCHITECTURE.md#0-통합-레이아웃-appunified) |

## 1. 경로·라우트

| 항목 | 위치 | 용도 |
|------|------|------|
| 프론트 경로 | `src/config/routes.ts` | defaultRoutes, VOICE_GENERATION_PATH, allAppPaths, getPageTitle |
| E2E 경로 | `e2e/paths.ts` | PATHS, LEGACY_REDIRECT_PATHS, NOT_FOUND_PATH |
| E2E testid | `src/constants/testIds.ts` | TEST_IDS (단일 소스). `e2e/testIds.ts`가 re-export·byTestId·byTestIdPrefix |
| API 경로 | `src/config/api.ts` | API_ENDPOINTS, API_BASE_URL |

**경로 변경 시**: `routes.ts`와 `e2e/paths.ts` 동기화. getPageTitle 갱신.

## 2. 컴포넌트·뷰 매핑

| 문서 | 내용 |
|------|------|
| [COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md) | 라우트→뷰, 메시지 UI 스택, 프로젝트 관리(활성/비활성), 서비스, 체크리스트 |
| `src/views/README.md` | 라우트별 뷰 (ProjectsPage, VoiceGenerationView 등) |
| `src/components/ProjectManagement/README.md` | ProjectEditModal·ProjectHub(활성), ProjectCreationModal·ProjectList(비활성) |
| `src/components/Chat/README.md` | ChatMessage 스택, MessageContent·MessageActions 사용처 |

## 3. 기능 추가 시 체크리스트

- [ ] `config/routes.ts`에 경로·getPageTitle 반영
- [ ] `e2e/paths.ts`에 경로 추가 (공개 페이지인 경우)
- [ ] BACKLOG·COMPLETION_CHECKLIST·AGENTS.md 해당 항목 추가/체크
- [ ] E2E data-testid 추가 시 src/constants/testIds.ts·e2e/README.md 테이블 갱신
- [ ] `src/utils/chatInputUtils.ts` 수정 시 보조 트리와 맞추려면 **`npm run sync:frontend-chat-input-utils`** 실행 후(선택) **`npm run test:frontend:chat-pipeline`** 로 회귀 확인

## 4. 설정·서비스

| 폴더 | README | 내용 |
|------|--------|------|
| `src/config/` | [README](../../src/config/README.md) | routes.ts, api.ts |
| `src/constants/` | [README](../../src/constants/README.md) | testIds.ts (data-testid 단일 소스) |
| `src/services/` | [README](../../src/services/README.md) | projectService, chatService, streamingClient 등 |
| `src/hooks/` | [README](../../src/hooks/README.md) | useApiStatus, useChatManagement 등 |
| `src/store/` | [README](../../src/store/README.md) | projectsSlice, sessionsSlice, uiSlice 등 |
| `src/utils/` | [README](../../src/utils/README.md) | chatInputUtils, streamingClient, guidelineQuality 등 |
| `src/styles/` | [README](../../src/styles/README.md) | theme.css, brainwave-global.css, themeColors |
| `e2e/` | [README](../e2e/README.md) | paths.ts, data-testid, 스펙 목록 |
| `scripts/` | [README](../scripts/README.md) | dev-check, verify-completion, E2E 등 |
| `src/types/` | [README](../../src/types/README.md) | project, chat, conversation 등 |

## 5. 관련 문서

- [DEVELOPMENT.md](../DEVELOPMENT.md) §2.5 — 컴포넌트·화면 매핑
- [DEVELOPER_QUICK_CHECKLIST.md](./DEVELOPER_QUICK_CHECKLIST.md) §6 — 개발 연속성·경로 참조
- [AGENTS.md](../AGENTS.md) — 프로젝트 관리 UI, COMPONENT_ARCHITECTURE 참조
- [TESTING_GUIDE.md](../TESTING_GUIDE.md) — 단위·통합·E2E 구분, 검증 명령별 스코프
- [guides/CHAT_ANSWER_FLOW_VERIFICATION](./guides/CHAT_ANSWER_FLOW_VERIFICATION.md) — 대화 입력→질문 표시→답변 생성·품질·컨텍스트 흐름
- [guides/ANSWER_QUALITY_AND_SEARCH](./guides/ANSWER_QUALITY_AND_SEARCH.md) — 답변 품질·검색·자료 활용·API quality 일원화
- [guides/CHAT_CONTEXT_CONTRACT](./guides/CHAT_CONTEXT_CONTRACT.md) — **대화 API context 계약** (키 정의·진입점별 구성·단일 소스·확장 규칙)
- [DEEPSEEK_SETUP](./DEEPSEEK_SETUP.md) — 딥시크 설치형/API·동작 체크리스트(§4.1)
- [DEEPSEEK_INSTALL_RUN_DEVELOP_LEARN](./DEEPSEEK_INSTALL_RUN_DEVELOP_LEARN.md) — 딥시크 설치→구동→개발→학습 한 흐름

## 6. 백엔드

- **README**: [backend/README.md](../backend/README.md) — 진입점·API 라우터·테스트
- **API 상세**: [backend/api/README.md](../backend/api/README.md) — 라우터별 prefix·엔드포인트
- **진입점**: `backend/main_server.py` (5002), `app.py` (기본 5002, `API_PORT`로 분리)
- **API 라우터**: `backend/api/` (project_session_api, unified_chat_api 등)
- **테스트**: `backend/tests/`, `npm run test:backend`

## 7. 확장 완료 요약 (2026-02-20)

개발 연속성 범위 확장 1~24차: 라우트·경로 단일 소스화, E2E testIds·src/constants/testIds 단일 소스, COMPONENT_ARCHITECTURE, 14개 README, TESTING_GUIDE. BACKLOG 1~24차.

## 8. 다음 확장 제안 (선택)

- ~~backend/api/ README~~ ✅ 완료 (2026-02-20)
- ~~E2E 구버전 경로 PATHS 상수화~~ ✅ 완료 — LEGACY_REDIRECT_PATHS, NOT_FOUND_PATH
- ~~단위별 통합 테스트 문서화 (TESTING_GUIDE 보강)~~ ✅ 완료 — 단위·통합·E2E 구분, 검증 명령별 스코프, 통합 시나리오 요약

## 9. 다음 확장 제안 (23차 이후, 선택)

- ~~data-testid 상수화 (e2e/testIds.ts)~~ ✅ 완료 — TEST_IDS·byTestId·byTestIdPrefix, 전체 E2E 스펙 적용
- ~~data-testid 단일 소스 (src/constants/testIds.ts)~~ ✅ 완료 — e2e가 src 참조, ProjectEditModal·ChatGPTInterface 적용

## 10. 다음 확장 제안 (25차 이후, 선택)

- 나머지 컴포넌트 TEST_IDS 적용: FileAnalysisChatSystem(page-file-analysis), NotebookLLM(page-notebook), IntegratedAIChat(page-integrated), AdvancedFeaturesPanel(voice-gen-section) 등

## 11. 대화 컨텍스트 일관성·확장성

- **계약 문서**: [guides/CHAT_CONTEXT_CONTRACT.md](./guides/CHAT_CONTEXT_CONTRACT.md) — 대화 API 요청 시 `context` 필드의 키·의미·설정 위치·백엔드 사용을 정의. 새 대화 진입점 추가 시 이 계약에 맞춰 context 구성.
- **단일 소스**: `adapt_answer_to_request` 문구는 `src/services/generationPromptBuilder.ts`의 `ADAPT_ANSWER_TO_REQUEST_INSTRUCTION`만 사용. ChatGPTInterface는 여기서 import.
- **공통 context 빌더**: SimpleChatView·UltimateChatGPTInterface·FileAnalysisChatSystem은 `buildUnifiedChatContext(rawInput, { conversationHistory?, project? })` 사용 → `parsed_input`, `adapt_answer_to_request`, `conversation_history`, `consistency_instruction` 등 일괄 적용.
- **입력 문자열 정규화**: 전송·context 구성 전 사용자 텍스트는 **`chatInputUtils.coerceTrimmedString`**(필요 시 `coerceTrimmedEnd`). [CHAT_CONTEXT_CONTRACT.md](./guides/CHAT_CONTEXT_CONTRACT.md) §3.5, [RESPONSE_CLEANING.md](./guides/RESPONSE_CLEANING.md).
- **context 키 추가 시**: CHAT_CONTEXT_CONTRACT §1·§3 갱신, buildUnifiedChatContext 또는 ChatGPTInterface 해당 경로 반영, 백엔드 정규화·파이프라인 반영.
