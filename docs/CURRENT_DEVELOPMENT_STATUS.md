# 현재 개발 반영 현황

지금까지 반영된 프론트엔드 기능·구조 요약. 문서 갱신일 기준으로 README·COMPONENT_ARCHITECTURE·DEVELOPMENT_CONTINUITY와 동기화됨.

## 통합 레이아웃 (AppUnified)

| 항목 | 내용 |
|------|------|
| **진입점** | `src/index.tsx` → `AppUnified` |
| **구조** | 2단: 좌측 사이드바 + 메인(`<main id="main-content">`). 라우트는 `Layout` 내부 `Outlet`. |
| **사이드바** | ChatGPT 스타일: 로고·펼치기/접기·더보기 → 새 대화·대화 검색 → 프로젝트(제목·새 프로젝트·목록·더 보기) → 도구(목소리 생성) → 내 대화. 접힘 시 56px·아이콘만, 상태 `localStorage`(`sidebarCollapsed`). |
| **데이터** | 프로젝트: `projectService.getProjects()`. 대화: `localStorage` `chatgpt-conversations` + `sidebar-chats-updated` 이벤트. |
| **웰컴·전환** | 메인(/) 접속 시 웰컴 유지. 내 대화 클릭 → 해당 대화·기존 내역 표시. 프로젝트 클릭 → 해당 프로젝트·가장 최근 대화 자동 선택. 새 대화/대화 메뉴 → 웰컴 복귀. [사용자 가이드 §3](guides/CORBU_AI_USER_GUIDE.md#3-웰컴대화프로젝트-전환) |

## UI·아이콘

| 항목 | 내용 |
|------|------|
| **아이콘** | `src/components/Icons/BrainwaveIcons.tsx` — Figma 스타일 24×24, stroke 2. 새 대화(IconEdit), 검색(IconSearch), 폴더(IconFolder), 목소리(IconVolume), 메시지(IconMessage), Chevron, 더보기(IconMoreVertical), Plus 등. |
| **스타일** | `App.css`: `.brainwave-sidebar-dark`, `.sidebar--collapsed`, `.sidebar-project-create-row`, `.sidebar-mobile-close-btn`, 모바일 `.mobile-open`·오버레이 등. |

## 반응형·접근성

| 항목 | 내용 |
|------|------|
| **브레이크포인트** | `theme.css` `--breakpoint-md`(768px) 사용. `App.css` 모바일 미디어 쿼리와 통일. |
| **모바일** | 768px 이하에서 사이드바 숨김, 상단 메뉴 버튼으로 열기, 오버레이·X·Esc로 닫기. |
| **터치·포커스** | `src/styles/responsive.css`: 모바일 메뉴 버튼 터치 타겟(`--touch-target-min`), `:focus-visible` 링. |

## 에러 처리

| 항목 | 내용 |
|------|------|
| **ErrorBoundary** | `src/components/ErrorBoundary.tsx` — 홈으로 돌아가기·다시 시도·페이지 새로고침. 에러 로깅·리포팅 연동. |
| **폴백** | `AppUnified`의 Suspense fallback: 간단 메시지 + 새로고침·홈 링크. |

## 개발 현황 화면 (앱에서 확인)

| 항목 | 내용 |
|------|------|
| **경로** | `/dev-status`. 사이드바 **더 보기(⋮)** → **개발 현황** |
| **내용** | "이걸 뭐 하려는 거야?" 요약, 프론트엔드 변경 사항(파일·설명), 검증·배포 명령 안내 |
| **뷰** | `src/views/DevStatusView.tsx` |

## 최근 개선 사항 (대화·접근성·답변 품질·타입 안정성)

- **타입 오류 수정 (2026-03-19)**: 테스트 파일 11개 타입 오류 수정 — isolatedModules(export {}), getter 반환 타입, mock 타입 단언, optional chaining, 인터페이스 완성 등. 린터 오류 0개 유지.

- **대화 UI**: 메시지 호버 시 틀어짐 방지(contain, transition 제거), 질문 오른쪽 정렬, 입력 하단 고정, 메시지 포커스 시 액션 버튼 표시.
- **포커스·접근성**: 대화 전환 시 메시지 컨테이너 포커스, API 오류 시 배너로 포커스·aria-live, 모달 닫은 뒤 입력창 포커스 복원, 전역 뷰 role="main"·aria-label, 토스트 role="alert"·aria-live·오류 시 포커스, 입력 글자 수 영역(aria-describedby·aria-live).
- **스트리밍 접근성**: 로딩 인디케이터 role="status"·aria-label="답변 생성 중"·aria-busy, 스트리밍 중 assistant 메시지 aria-live="polite"·aria-busy·aria-label 보강.
- **답변 품질·검색**: 질문/설명 패턴 시 prefer_informed_answer·enable_web_research, 입력 힌트 "검색·자료 활용해 답변" 표시, 백엔드 스트리밍 폴백 경로에서도 context(prefer_informed_answer 등) 전달하도록 수정.
- **생성 답변 능력 최대 활용**: 검색·자료 활용 시 품질 자동 상향(basic→enhanced, enhanced→ultimate), 기본 응답 모드 상세(ultimate), 요약·비교·분석 등 prefer_informed_answer 패턴 확대. 자세한 내용은 guides/ANSWER_QUALITY_AND_SEARCH §2.4.
- **문서·테스트**: CHAT_UI_TEST_SCENARIOS, ANSWER_QUALITY_AND_SEARCH 가이드, chatInputUtils 테스트·testIds 보강.
- **이어서 반영**: API 404 폴백 시 quality·response_style·perspective 전달(SimpleChatView, UltimateChatGPTInterface, FileAnalysisChatSystem). CHAT_ANSWER_FLOW_VERIFICATION §5.5 품질·컨텍스트 흐름. pipeline_tuning_config enhanced/ultimate max_tokens 상향(4096/8192). chatService·unifiedAPI·integratedSystemAPI·apiClient(utils)에 quality 전달. ChatRequest·ChatAPIRequest에 quality 타입 추가. IntegratedMasterInterface 테스트·COMPLETION_CHECKLIST·ANSWER_QUALITY_AND_SEARCH §5 보강. DEEPSEEK_DEVELOPMENT_ORDER 품질 프리셋·ANSWER_QUALITY 링크. DevStatusView 문서 목록에 CHAT_UI_TEST_SCENARIOS·ANSWER_QUALITY_AND_SEARCH 추가.
- **문서 연결**: CHAT_ANSWER_FLOW_VERIFICATION 끝에 참고 섹션 추가(ANSWER_QUALITY_AND_SEARCH·CHAT_UI_TEST_SCENARIOS 링크). DEVELOPMENT_CONTINUITY §5 관련 문서에 대화 흐름·답변 품질 가이드 링크 추가.
- **개발 현황·테스트**: DevStatusView 검증·배포 20 suites·105 tests(test:views). DevStatusView.test에 문서·배포 목록에 대화 흐름 검증 문서 포함 여부 검증 추가.
- **문서 수치 통일**: DEVELOPMENT.md §2.3·scripts/README·CONNECT.md §7·docs/README 가이드·PERFORMANCE.md §1·§2.6에 test:views 18·97·verify:completion·대화 흐름·답변 품질 가이드 링크 반영.
- **문서·테스트 연결 (2026-05-10)**: 라우트·앱 셸·사이드바 회귀는 **`npm run test:routes`**·**`npm run test:app-unified`**·**`npm run test:sidebar-context`** — [TESTING_GUIDE.md](../TESTING_GUIDE.md). 원격 `git push` 막힘은 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`maintain:push-block` 등).
- **딥시크(DeepSeek) 동작**: 백엔드 unified_chat_api 문법 수정(5002 기동). provider가 deepseek/deepseek-local일 때 대화에서 딥시크 우선 호출. llm_service가 context.conversation_history 우선 사용. DEEPSEEK_SETUP §4.1·DEEPSEEK_DEVELOPMENT_ORDER 5.1a·DEEPSEEK_INSTALL_RUN_DEVELOP_LEARN(한 흐름) 참고.

## 검증·배포

| 명령 | 내용 |
|------|------|
| `npm run verify:completion` | 타입·린트·P4 서비스 148 tests. 통과 시 배포 가능. |
| `npm run test:views` | 뷰·라우트 20 suites, 105 tests. (갱신: 2026-03) |
| `npm run test:sidebar-context` | 사이드바·앱 셸 컨텍스트 회귀 — [TESTING_GUIDE.md](../TESTING_GUIDE.md) |
| `npm run deploy:check` | verify:completion + build → `build/` 생성. |
| `npm run deploy:server` | deploy:check 후 개발 서버 동기화. `.env`에 `DEPLOY_DEV_HOST`, `DEPLOY_DEV_PATH` 필요. [DEPLOY_SERVER_CHECKLIST](./DEPLOY_SERVER_CHECKLIST.md) |

## 관련 문서

- [COMPLETION_CHECKLIST §4](COMPLETION_CHECKLIST.md#4-완성에-가까워지기-위한-다음-액션) — 개발 이어서 진행 시 다음 액션(단기·확장·중기)
- [README §주요 기능](../README.md#-주요-기능) — 통합 레이아웃 요약
- [COMPONENT_ARCHITECTURE §0](./COMPONENT_ARCHITECTURE.md#0-통합-레이아웃-appunified) — AppUnified·사이드바·아이콘·반응형·ErrorBoundary 매핑
- [DEVELOPMENT_CONTINUITY §0](./DEVELOPMENT_CONTINUITY.md#0-앱-진입레이아웃) — 진입점·레이아웃 참조
- [views/README](../../src/views/README.md) — 라우트별 뷰
- [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `test:routes`·`test:app-unified`·**`test:sidebar-context`**
- [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md) — 원격 `git push` 막힘 시 절차(`maintain:push-block` 등)
- [DEPLOY_SERVER_CHECKLIST](./DEPLOY_SERVER_CHECKLIST.md) — 서버 반영 체크리스트
- [guides/CHAT_ANSWER_FLOW_VERIFICATION](./guides/CHAT_ANSWER_FLOW_VERIFICATION.md) — 대화 입력 → 질문 표시 → 답변 생성·표시·품질·컨텍스트 흐름 검증
- [guides/CHAT_UI_TEST_SCENARIOS](./guides/CHAT_UI_TEST_SCENARIOS.md) — 대화 UI·접근성·품질 수동 확인 시나리오
- [guides/ANSWER_QUALITY_AND_SEARCH](./guides/ANSWER_QUALITY_AND_SEARCH.md) — 답변 품질·검색·자료 활용·생성 능력 최대 활용
- [guides/UX_MESSAGING_GUIDE](./guides/UX_MESSAGING_GUIDE.md) — 로딩·에러·토스트 문구 일관성 가이드
- [DEEPSEEK_SETUP](../DEEPSEEK_SETUP.md) — 딥시크 설치형/API·동작 체크리스트(§4.1)
- [DEEPSEEK_DEVELOPMENT_ORDER](../DEEPSEEK_DEVELOPMENT_ORDER.md) — 딥시크 개발 순서·우선 시도(5.1a)
- [DEEPSEEK_INSTALL_RUN_DEVELOP_LEARN](../DEEPSEEK_INSTALL_RUN_DEVELOP_LEARN.md) — 딥시크 설치→구동→개발→학습 한 흐름

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
