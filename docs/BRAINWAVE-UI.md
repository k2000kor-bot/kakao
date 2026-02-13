# CORBU AI UI Kit 적용 (Figma node-id=7-3, Brainwave AI UI Kit 디자인 기준)

**전체 디자인 레이아웃의 단일 소스**: 아래 Figma 디자인에 **그대로 맞추어** 적용합니다.

- **Figma (단일 소스, 레이아웃·디자인 기준)**:
  - [Brainwave AI UI Kit node 323-168775](https://www.figma.com/design/9ZrEa3dcS8zb0O6Nr5lT8m/Brainwave-AI-UI-Kit-%F0%9F%9A%80?node-id=323-168775&m=dev) (전체 UI)
  - [Brainwave AI UI Kit node 7-3](https://www.figma.com/design/9ZrEa3dcS8zb0O6Nr5lT8m/Brainwave-AI-UI-Kit-%F0%9F%9A%80?node-id=7-3&m=dev&t=x0PV9L8fLLkCZaAZ-1) (레이아웃 상세)
- **적용 원칙**: Figma **전체 파일**을 기준으로, **전체 디자인 레이아웃**을 위 링크와 동일하게 맞추고 그대로 적용. 메인 채팅·간단 채팅·사이드바·환영 화면·입력·버튼·모달·분석·고급 기능 등 **모든 기능이 이 Kit과 동일한 디자인 범위**에 들어가야 함. 새 기능 추가 시에도 `.bw-*`·`theme.css` 변수만 사용.

---

## 통합 버전 (Unified App)

- **진입점**: `src/index.tsx` → `AppUnified` (ThemeProvider + Redux Provider)
- **전체 기능**: 한 화면에서 사이드바로 이동
  - **고급 AI 채팅** (`/`) — ChatGPTInterface (Unlock the power of AI, 기능 필)
  - **간단 채팅** (`/simple`) — SimpleChatView
  - **고급 기능** (`/features`) — AdvancedFeaturesPanel (이미지·음성·예측·목소리 생성·TTS 등)
  - **전체 기능** (`/features-map`) — 개발된 모든 기능을 카테고리별로 표시·링크 안내
  - **노트북 LLM** (`/notebook`) — NotebookLLM
- **디자인 통일**: 루트 컨테이너에 `brainwave-unified` 클래스 및 `data-brainwave-figma` 속성(Figma 링크) 적용. 모든 화면은 `src/styles/theme.css` 토큰만 사용해 CORBU AI와 동일한 느낌 유지.
- **CSS 로드 순서**: theme.css → **brainwave-global.css** → responsive.css → ChatGPTInterface.css → AdvancedFeaturesPanel.css → NotebookLLM.css → App.css(통합 레이아웃) → index.css(글로벌)

---

## 적용 완료 항목

| 구분 | 파일 | 내용 |
|------|------|------|
| **토큰** | `src/styles/theme.css` | Figma 변수: Primary/01 `#0084FF`, Primary/02 `#3FDD78`, Accents/01~04 (`--accent-orange`, `--accent-blue-alt`, `#8E55EA` 등), Neutral 팔레트(01~07), Inter 폰트, 간격·모서리·전환 |
| **다크** | `theme.css` `.dark-mode` | Neutral/05·06·07 배경·텍스트 |
| **통합 앱** | `src/AppUnified.tsx` | 3단 레이아웃(다크 좌측 사이드바·메인·우측 채팅 히스토리), CORBU AI 네비(Chats·Search·Manage subscription·Updates & FAQ·Settings), Chat list, theme.css·ChatGPTInterface·AdvancedFeaturesPanel·NotebookLLM CSS 로드, `brainwave-unified`·`data-brainwave-figma` |
| **채팅** | `src/components/ChatGPTInterface.tsx` | `data-brainwave-figma`(디자인 링크), `brainwave-layout`, 사이드바·메인·환영·입력·모달. 입력 placeholder "Type '/' for commands", 캡빌리티 칩 colored background, 사이드바·모달 rgba → theme 토큰(`--sidebar-dark-*`, `--modal-overlay`, `--shadow-*`) 전환 완료 |
| **채팅 스타일** | `src/components/ChatGPTInterface.css` | CORBU AI 클래스, 입력 포커스 파란 링, 전송 호버, `.brainwave-layout.dark`(Figma 다크 Neutral) |
| **고급 패널** | `src/components/AdvancedFeaturesPanel.css` | theme.css 토큰만 사용 |
| **글로벌** | `src/index.css` | body 테마, CORBU AI 로딩·심플 화면 클래스, 스크롤바·포커스 |
| **에러/fallback** | `src/index.tsx` | ErrorBoundary·#root 없음·시작 오류 catch 시 theme 변수만 사용 (CORBU AI 통일) |
| **HTML** | `public/index.html` | Inter 폰트(Google Fonts), theme-color·msapplication-TileColor `#3478F6` (Figma Primary Blue) |
| **심플 모드** | `src/components/ChatGPTInterfaceSimple.tsx` | CORBU AI 테마 클래스 사용(인라인 제거) |
| **사이드바** | `src/components/Layout/Sidebar.tsx` | CORBU AI 유틸 클래스(`brainwave-layout-sidebar`, `brainwave-sidebar-btn-primary`, `brainwave-sidebar-item`, `brainwave-sidebar-item-selected`, `brainwave-sidebar-modal-*` 등) 사용. Tailwind gray/blue 클래스 제거, theme 토큰 전환 완료 |
| **사이드바 스타일** | `src/App.css` | Layout Sidebar용 `.brainwave-layout-sidebar`, `.brainwave-sidebar-*` (Figma node 7-3) |
| **노트북 LLM** | `src/components/NotebookLLM.css` | Primary 버튼 호버 `--accent-info-hover`, CTA `--on-accent` |
| **글로벌 포커스** | `src/index.css` | `.focus-ring` → `--focus-ring` / `--focus-ring-offset` 사용 |
| **전역 컴포넌트** | `src/styles/brainwave-global.css` | `.bw-card`, `.bw-btn-primary`, `.bw-btn-secondary`, `.bw-input`, `.bw-alert-error`, `.bw-empty`, `.bw-modal-*` 등 — 모든 기능이 동일 스타일로 사용 가능 |
| **음성 인식** | `src/components/Chat/VoiceRecognition.tsx` | `.bw-btn-primary`, `.bw-btn-danger`, `.bw-modal-*`, `.bw-progress-bar` 등 CORBU AI 클래스 사용 |
| **감정 분석** | `src/components/Analytics/SentimentAnalysis.tsx` | `.bw-empty`, `.bw-card`, `.bw-text-success/error/muted` 등 theme 토큰 사용 |
| **대화 요약** | `src/components/Analytics/ConversationSummary.tsx` | `.bw-btn-primary`, `.bw-card`, `.bw-badge`, `.bw-btn-ghost` 등 CORBU AI 클래스 사용 |
| **대화 분석** | `src/components/Analytics/MessageAnalytics.tsx` | `.bw-empty`, `.bw-card`, `.bw-card-secondary`, `.bw-heading-2`, `.bw-text-*`, theme 변수(accent-info/success/warning/error 등) 사용 |
| **프로젝트 분석** | `src/components/Analytics/ProjectAnalytics.tsx` | `.bw-heading-1/2`, `.bw-card`, `.bw-card-secondary`, `.bw-input`, `.bw-btn-primary`, `.bw-btn-ghost`, `.bw-badge`, `.bw-text-*`, theme 변수(accent-*-muted 등) 사용 |
| **고급 데이터 인사이트** | `src/components/Analytics/AdvancedDataInsights.tsx` | `.bw-heading-1/2`, `.bw-card`, `.bw-card-secondary`, `.bw-input`, `.bw-btn-primary`, `.bw-btn-secondary`, `.bw-btn-ghost`, `.bw-badge`, `.bw-progress-*`, `.bw-text-*`, theme 변수(accent-*-muted, border-color) 사용 |
| **분석 대시보드** | `src/components/Dashboard/AnalyticsDashboard.tsx` | `.bw-heading-1/2`, `.bw-card`, `.bw-input`, `.bw-empty`, `.bw-spinner`, `.bw-badge`, `.bw-text-*`, theme 변수(accent-*-muted), Recharts `var(--accent-*)` 유지 |
| **실시간 분석 대시보드** | `src/components/AI/RealtimeAnalyticsDashboard.tsx` | theme 변수 전반 사용, `.bw-btn-ghost`, `.bw-card-secondary`, `.bw-heading-2`, `.bw-text-muted` (Tailwind 잔여 제거) |
| **Ultimate 채팅** | `src/components/UltimateChatGPTInterface.tsx` | theme 변수·`.bw-*` 전반 (레이아웃·사이드바·버튼·카드·입력·메시지 버블·로딩·드래그 영역·진행바) |
| **CORBU AI 분석 대시보드 (MUI)** | `src/components/AnalyticsDashboard.tsx` | MUI 유지, `sx`로 theme 변수 적용 (배경·카드·텍스트·아이콘·LinearProgress·Chip·Divider) |
| **메시지 버블·스트리밍·토스트** | `MessageBubble.tsx`, `StreamingMessage.tsx`, `ErrorToast.tsx` | theme 변수·`.bw-*` (아바타·버블·메타·액션 버튼·토스트 배경/아이콘/버튼/진행바) |
| **고급 파일 업로드** | `src/components/Chat/AdvancedFileUpload.tsx` | `.bw-card-secondary`, `.bw-progress-bar`, `.bw-btn-ghost`, `.bw-text-*`, theme 변수 (드롭존·파일 목록·삭제) |
| **협업자 목록** | `src/components/Collaboration/CollaboratorsList.tsx` | `.bw-empty`, `.bw-text-*`, theme 변수 (아바타·온라인 표시) |
| **AI 채팅 인터페이스** | `src/components/Chat/ChatInterface.tsx` | theme 변수·`.bw-*` (헤더·프로젝트 컨텍스트·메시지·타이핑·첨부·입력·전송·드래그 영역) |
| **스마트 추천** | `src/components/Chat/SmartRecommendations.tsx` | `.bw-card`, `.bw-card-secondary`, `.bw-btn-primary`, `.bw-btn-ghost`, `.bw-badge`, `.bw-progress-*`, `.bw-text-*`, `.bw-empty` |
| **파일 업로드** | `src/components/FileManagement/FileUpload.tsx` | `.bw-card-secondary`, `.bw-btn-primary`, `.bw-alert-error`, `.bw-progress-bar`, `.bw-btn-ghost`, `.bw-text-*`, `.bw-spinner` |
| **알림 시스템** | `src/components/Notifications/NotificationSystem.tsx` | `.bw-btn-ghost`, `.bw-card`, `.bw-card-secondary`, `.bw-empty`, `.bw-text-*`, theme 변수(미읽음·배지) |
| **메인 영역** | `src/AppUnified.tsx` | `<main className="brainwave-main">` — 모든 라우트 콘텐츠가 theme 스코프 내 |
| **전체 기능 맵** | `src/views/FeaturesMapView.tsx` | 카테고리별 기능 목록·빠른 이동 카드(aria-label), theme·`.bw-card`. 테스트: `src/views/FeaturesMapView.test.tsx` |
| **간단 채팅** | `src/views/SimpleChatView.js` + `App.css` | `.main-content`, `.chat-container`, `.message`, `.analysis-panel`, `.send-btn`, `.quick-action-btn` 등 theme 변수 사용 (CORBU AI 동일). 테스트: `src/views/SimpleChatView.test.js` |

---

## Figma 스펙 → CSS 변수 (node-id=7-3 기준)

| Figma | CSS 변수 | 용도 |
|-------|----------|------|
| Primary/01 | `--accent-info` | 메인 CTA 배경 (#0084FF) |
| Primary/01 hover | `--accent-info-hover` | CTA 호버 (#0066cc) |
| Primary/02 | `--accent-primary` | 성공/강조 (#3FDD78) |
| Accent on Primary | `--on-accent` | CTA 위 텍스트 (#ffffff) |
| Error hover | `--accent-error-hover` | 위험 버튼 호버 (#dc2626) |
| Neutral/01~03 | `--bg-primary`, `--bg-secondary`, `--bg-tertiary` | 배경 |
| Neutral/04, 07 | `--text-primary`, `--text-secondary` | 텍스트 |
| Accents 01~04 | `--accent-orange`, `--accent-blue-alt`, `--accent-secondary` 등 | 보조 강조색 |
| 레이아웃(사이드바 등) | `--layout-sidebar-width` (260px), `--layout-main-padding` | Figma node 7-3 Dev Mode에서 수치 확인 후 `theme.css`에서만 조정 |
| 사이드바 다크 | `--sidebar-dark-border`, `--sidebar-dark-border-strong`, `--sidebar-dark-hover`, `--sidebar-dark-hover-strong`, `--sidebar-dark-input-bg`, `--sidebar-dark-bg-subtle`, `--sidebar-dark-bg-ghost` | 다크 사이드바 테두리·호버·입력·버튼·토글 배경 |
| 모달·그림자 | `--modal-overlay`, `--shadow-card`, `--shadow-modal`, `--shadow-dropdown` | 모달 오버레이·카드·모달·드롭다운 그림자 |

---

## 단일 소스

- **전체 디자인·레이아웃**: [Figma Brainwave AI UI Kit node-id=7-3](https://www.figma.com/design/9ZrEa3dcS8zb0O6Nr5lT8m/Brainwave-AI-UI-Kit-%F0%9F%9A%80?node-id=7-3&m=dev&t=x0PV9L8fLLkCZaAZ-1)을 기준으로 **그대로** 적용. 레이아웃(사이드바·메인·간격)·색·타이포는 모두 이 디자인과 일치하도록 유지.
- **색·타이포·간격**: `src/styles/theme.css`만 수정하면 앱 전반에 반영됩니다.
- **채팅 레이아웃 다크**: `html.dark-mode`(ThemeProvider) 또는 `.brainwave-layout.dark`(로컬 테마) 시 Figma Neutral/05·06·07 사용.

---

## 새 기능 추가 시 (모든 기능이 Kit 범위에 들어가도록)

- **버튼·카드·입력·알림**: `brainwave-global.css`의 `.bw-btn-primary`, `.bw-btn-secondary`, `.bw-card`, `.bw-input`, `.bw-alert-error`, `.bw-empty`, `.bw-modal-overlay`, `.bw-modal-panel` 등 사용.
- **색·타이포**: `theme.css`의 `var(--*)`만 사용. Tailwind 색상 클래스(`text-gray-*`, `bg-blue-*` 등) 대신 `.bw-text-primary`, `.bw-text-secondary`, `var(--accent-info)` 등 적용.
- Figma Dev Mode(node-id=7-3)에서 스펙 확인 후 `theme.css` 또는 `brainwave-global.css`에 필요한 클래스 추가.
- **통합 앱 라우트**(`/`, `/simple`, `/features`, `/features-map`, `/notebook`)에서 사용하는 화면은 모두 theme·`.bw-*` 기준으로 통일됨.
- 통합 앱에서 **현재 미사용**인 화면은 위 적용 완료 목록과 동일하게 theme·`.bw-*`(또는 MUI `sx`에 theme 변수) 사용 시 Kit 범위 유지.

---

## 검증 (새 기능이 Kit 범위에 들어가는지)

- **레이아웃**: 사이드바·메인 영역·간격·브레이크포인트는 [Figma node 7-3](https://www.figma.com/design/9ZrEa3dcS8zb0O6Nr5lT8m/Brainwave-AI-UI-Kit-%F0%9F%9A%80?node-id=7-3&m=dev&t=x0PV9L8fLLkCZaAZ-1) Dev Mode에서 스펙 확인 후 동일하게 적용.
- **CSS**: 해당 컴포넌트 CSS/클래스에서 `#hex`, `rgb(...)`(theme.css 정의 제외), `text-gray-*`, `bg-blue-*` 등 Tailwind 색상 없으면 OK.
- **TSX**: `className`에 `text-gray-*`, `bg-blue-*` 대신 `.bw-text-primary`, `.bw-btn-primary` 또는 `style={{ color: 'var(--text-primary)' }}` 사용.
- **버튼/카드**: `brainwave-global.css`의 `.bw-btn-primary`, `.bw-card` 등 사용 시 Kit과 동일.

---

## 디자인 참조 이미지 (무제 폴더)

`public/design-ref/`에 Figma·무제 폴더 PNG 참조용 이미지가 포함됩니다.

| 파일 | 출처 |
|------|------|
| `conversation.png` | 무제 폴더/Conversation (3단 레이아웃·메시지·입력) |
| `ai-thinking.png` | 무제 폴더/AI thinking (캡빌리티 칩·Pause·Copy·Regenerate) |
| `feature-suggestions.png` | 무제 폴더/Feature suggestions (캡빌리티 칩 색상) |
| `audio.png` | 무제 폴더/Audio (오디오 플레이어) |
| `edit-text.png` | 무제 폴더/Edit text (텍스트 편집 UI) |
| `export.png` | 무제 폴더/Export (Export 모달) |

해상도: 1440px 기준. 디자인 확인 시 `/design-ref/conversation.png` 등으로 접근 가능.

---

## 다음 권장 단계

- **새 라우트 추가 시**: 해당 화면 컴포넌트·CSS에서 `theme.css` 변수와 `.bw-*`만 사용하면 Figma Kit 범위 유지.
- **기존 미사용 컴포넌트를 라우트에 넣을 때**: 해당 파일에서 `text-gray-*`, `bg-blue-*` 등 Tailwind 색상을 `.bw-text-primary`, `.bw-btn-primary`, `var(--accent-info)` 등으로 교체 후 배포.