# 컴포넌트 아키텍처

개발 연속성을 위한 컴포넌트·뷰·서비스 매핑. 새 기능 추가 시 참조.

**개발 연속성 전체 가이드**: [DEVELOPMENT_CONTINUITY.md](./DEVELOPMENT_CONTINUITY.md)

## 0. 통합 레이아웃 (AppUnified)

| 항목 | 위치 | 설명 |
|------|------|------|
| **진입점** | `src/index.tsx` | `import App from './AppUnified'` — 앱 루트는 AppUnified |
| **레이아웃** | `src/AppUnified.tsx` | 2단: 좌측 사이드바 + `<main>`(Outlet). `Layout` 내 라우트·테마·토스트·ErrorBoundary |
| **사이드바** | 동일 파일 | 상단: 로고·토글(접기/펼침)·더보기 드롭다운. 본문: 새 대화·대화 검색·프로젝트 섹션(새 프로젝트·목록·더 보기)·도구(목소리 생성)·내 대화. 접힘 시 `sidebar--collapsed`, 상태 `localStorage` |
| **아이콘** | `src/components/Icons/BrainwaveIcons.tsx` | Figma 스타일 24×24. IconLogo, IconEdit, IconSearch, IconFolder, IconVolume, IconMessage, IconChevronLeft/Right, IconMoreVertical, IconPlus 등 |
| **반응형** | `App.css`, `src/styles/responsive.css` | `@media (max-width: var(--breakpoint-md))`: 사이드바 숨김·모바일 메뉴 버튼·오버레이·`sidebar.mobile-open`. 터치 타겟·focus-visible |
| **에러 UI** | `src/components/ErrorBoundary.tsx` | 홈으로 돌아가기·다시 시도·페이지 새로고침. `AppUnified`의 Suspense fallback. E2E: `data-testid={TEST_IDS.ERROR_BOUNDARY}` (error-boundary) |

사이드바 대화 목록: `localStorage` `chatgpt-conversations` + `sidebar-chats-updated` 이벤트. 프로젝트 목록: `projectService.getProjects()`.

## 1. 라우트 → 뷰

| 경로 | 뷰/컴포넌트 | 비고 |
|------|-------------|------|
| `/` | ChatGPTInterface | 메인 대화 (일반 대화) |
| `/projects` | ProjectsPage | ProjectHub + ProjectEditModal |
| `/projects/:id` | ChatGPTInterface (initialProjectId) | 프로젝트 · 대화 |
| `/voice-generation` | VoiceGenerationView | AdvancedFeaturesPanel(defaultTab=voiceGen) |

경로 상수: `src/config/routes.ts` (VOICE_GENERATION_PATH, allAppPaths), `e2e/paths.ts` (PATHS). 뷰 상세: `src/views/README.md`.

**빠른 Jest(선택·백엔드 불필요)**: `npm run test:routes` · `npm run test:app-unified` · `npm run test:sidebar-context` — [TESTING_GUIDE.md](../TESTING_GUIDE.md). 원격 `git push` 막힘: [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

## 2. 메시지 UI (대화 메시지 렌더링)

두 가지 스택이 공존합니다.

| 스택 | 컴포넌트 | 사용처 |
|------|----------|--------|
| **A** | MessageItem + components/MessageActions | ModernChatInterface |
| **B** | Chat/ChatMessage + Chat/MessageContent + Chat/MessageActions | ChatView |

ChatGPTInterface는 자체 메시지 렌더링 사용(MessageItem·ChatMessage 미사용). Chat/ 상세: `src/components/Chat/README.md`.

## 3. 프로젝트 관리

| 컴포넌트 | 상태 | 사용처 |
|----------|------|--------|
| ProjectEditModal | ✅ 활성 | ProjectsPage, ChatGPTInterface(편집) |
| ProjectHub | ✅ 활성 | ProjectsPage (목록·생성·편집·삭제) |
| ProjectCreationModal | ⚪ 비활성 | backup/UnifiedProjectInterface.tsx.disabled |
| ProjectList | ⚪ 비활성 | backup/UnifiedProjectInterface.tsx.disabled |

현재 프로젝트 생성·편집 흐름: ProjectsPage → ProjectHub(생성 버튼) → projectService.createProject → ProjectEditModal(편집).

## 4. 목소리 생성 (TTS)

- VoiceGenerationView → AdvancedFeaturesPanel(defaultTab="voiceGen")
- AdvancedFeaturesPanel: 음성 인식·이미지 분석·예측·목소리 생성 탭

## 5. 주요 서비스

| 영역 | 서비스 | 용도 |
|------|--------|------|
| 대화 | projectService, streamingClient | 프로젝트·세션·메시지, 스트리밍 |
| 대화 | chatService, messageService | 메시지 CRUD |
| API | apiClient, unifiedAPI | /api/chat, /api/unified/chat |
| TTS | qwenTtsService | 목소리 생성 |

**API 경로**: `src/config/api.ts` — API_ENDPOINTS (HEALTH, STATUS, CHAT, UNIFIED_CHAT, PROJECTS 등). config/api.test 12 tests.

## 6. 개발 연속성 체크리스트 (기능 추가 시)

- [ ] `config/routes.ts`에 경로·getPageTitle 반영
- [ ] `e2e/paths.ts`에 경로 추가 (공개 페이지인 경우)
- [ ] BACKLOG·COMPLETION_CHECKLIST·AGENTS.md 해당 항목 추가/체크
- [ ] E2E data-testid 추가 시 src/constants/testIds.ts·e2e/README.md 테이블 갱신

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
