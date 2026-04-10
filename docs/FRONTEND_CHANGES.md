# 프론트엔드 변경 사항 (최근 반영)

이 문서는 최근 프론트엔드에서 변경·추가된 부분을 한곳에서 볼 수 있게 정리한 것입니다.

---

## 1. 통합 레이아웃 (AppUnified)

| 파일 | 변경 내용 |
|------|-----------|
| `src/index.tsx` | 앱 진입점을 `AppUnified`로 사용 (2단: 사이드바 + 메인) |
| `src/AppUnified.tsx` | 좌측 사이드바 + 메인 영역 레이아웃. 로고·토글·더보기·새 대화·검색·프로젝트·도구·내 대화 구성 |
| `src/App.css` | 사이드바 스타일 (`.brainwave-sidebar-dark`, `.sidebar--collapsed`, 모바일 `.mobile-open`, 오버레이). 브레이크포인트 `var(--breakpoint-md)` 사용 |

## 2. 사이드바 동작

| 파일 | 변경 내용 |
|------|-----------|
| `src/AppUnified.tsx` | **내 대화 선택 표시**: `location.state.conversationId`와 비교해 선택된 대화만 `active` 클래스 적용. (이전에는 모두 `to="/"`라 전부 active로 보이던 문제 수정) |
| `src/components/ChatGPTInterface.tsx` | **사이드바 ↔ 대화 동기화**: 사이드바에서 대화 클릭 시 해당 대화 선택, "새 대화" 클릭 시 선택 해제. 대화 화면에서 대화를 바꾸면 `location.state` 동기화해 사이드바에서도 해당 대화이 active로 표시되도록 처리 |

## 3. 아이콘

| 파일 | 변경 내용 |
|------|-----------|
| `src/components/Icons/BrainwaveIcons.tsx` | Figma 스타일 24×24 아이콘 (로고·편집·검색·폴더·목소리·메시지·Chevron·더보기·Plus 등) |
| `src/AppUnified.tsx` | 새 대화(IconEdit), 검색(IconSearch), 프로젝트(IconFolder+IconPlus), 목소리(IconVolume), 내 대화(IconMessage) 등 BrainwaveIcons 사용 |

## 4. 반응형·접근성

| 파일 | 변경 내용 |
|------|-----------|
| `src/App.css` | 모바일 미디어 쿼리 `768px` → `var(--breakpoint-md)`로 통일 |
| `src/styles/responsive.css` | 모바일 메뉴 버튼 터치 타겟(`--touch-target-min`), `:focus-visible` 포커스 링 추가 |

## 5. 에러 처리

| 파일 | 변경 내용 |
|------|-----------|
| `src/components/ErrorBoundary.tsx` | **홈으로 돌아가기** 버튼 추가. (기존: 다시 시도·페이지 새로고침) |
| `src/components/ErrorBoundary.css` | 에러 액션 버튼 영역 `flex-wrap` 적용 |

## 6. 문서

| 파일 | 변경 내용 |
|------|-----------|
| `README.md` | "통합 레이아웃 (AppUnified)" 섹션 추가 |
| `docs/COMPONENT_ARCHITECTURE.md` | §0 통합 레이아웃 (AppUnified)·사이드바·아이콘·반응형·ErrorBoundary |
| `docs/DEVELOPMENT_CONTINUITY.md` | §0 앱 진입·레이아웃 |
| `docs/CURRENT_DEVELOPMENT_STATUS.md` | 검증·배포 명령 및 DEPLOY_SERVER_CHECKLIST 링크 |
| `docs/DEPLOY_SERVER_CHECKLIST.md` | 서버 반영 체크리스트 (신규) |
| `docs/FRONTEND_DEPLOYMENT.md` | §4.6 `deploy:server` 안내 |
| `package.json` | `deploy:server` 스크립트 추가 |

---

**변경된 소스 위치만 빠르게 보려면**:  
`src/AppUnified.tsx`, `src/App.css`, `src/components/ChatGPTInterface.tsx` (사이드바 연동), `src/components/ErrorBoundary.tsx`, `src/components/ErrorBoundary.css`, `src/styles/responsive.css`, `src/components/Icons/BrainwaveIcons.tsx`

---

## 7. 개발 현황 화면 (프론트에서 확인)

| 파일 | 변경 내용 |
|------|-----------|
| `src/config/routes.ts` | `DEV_STATUS_PATH = '/dev-status'`, `getPageTitle`, `allAppPaths`에 추가 |
| `src/views/DevStatusView.tsx` | **개발 현황** 페이지 — "이걸 뭐 하려는 거야?", 프론트엔드 변경 사항, 검증·배포 명령을 화면에 출력 |
| `src/AppUnified.tsx` | 사이드바 **더 보기** 메뉴에 "개발 현황" 링크 추가, 라우트 `/dev-status` 연결 |

**앱에서 보는 방법**: 사이드바 상단 **더 보기(⋮)** → **개발 현황** 클릭, 또는 URL `/dev-status` 로 접속.

---

## 8. 대화·대화 이력·유연한 생성·컨텍스트 일관성 (2026-03)

| 파일 | 변경 내용 |
|------|-----------|
| `src/components/ChatGPTInterface.tsx` | 대화 이력: 전송·재생성·편집 시 `conversations.find(c => c.id)`로 conversation_history 구성. adapt_answer_to_request는 generationPromptBuilder에서 import. 재생성·편집 context에 consistency_instruction·adapt_answer_to_request 포함. 편집 스트리밍 히스토리 20턴·editStreamContext에 adapt_answer_to_request. |
| `src/services/generationPromptBuilder.ts` | `ADAPT_ANSWER_TO_REQUEST_INSTRUCTION` 상수 추가(단일 소스). `buildUnifiedChatContext`에 `adapt_answer_to_request` 항목 추가 → SimpleChatView·UltimateChatGPTInterface·FileAnalysisChatSystem 일괄 적용. |
| `src/utils/chatInputUtils.ts` | 품질·구조화 패턴 확대(qualitySeekingPatterns, 질문:/요구사항: 시 prefer_informed_answer). |
| `docs/guides/CHAT_CONTEXT_CONTRACT.md` | **신규** — 대화 API context 계약(키·진입점·확장 규칙). |
| `docs/guides/CHAT_ANSWER_FLOW_VERIFICATION.md` | §5.6 대화 이력·재진입·재생성·편집. §8 수동 확인에 7번(재진입·이력), 8번(유연한 생성) 추가. |
| `docs/guides/ANSWER_QUALITY_AND_SEARCH.md` | §2.5 adapt_answer_to_request(단일 소스·전달·백엔드). |
| `docs/DEVELOPMENT_CONTINUITY.md` | §11 대화 컨텍스트 일관성·확장성, CHAT_CONTEXT_CONTRACT 링크. |
