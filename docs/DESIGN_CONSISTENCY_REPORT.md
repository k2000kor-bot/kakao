# 디자인 일관성 점검 보고서

**목적**: 입력 폼·세부 페이지 Brainwave/Figma 디자인 적용 상태 점검.

---

## 1. 입력 폼 통합 현황 (2026-02-20)

### Brainwave `.bw-input` 적용 완료

| 페이지/컴포넌트 | 경로 | 적용 내용 |
|----------------|------|----------|
| **ProjectList** | 프로젝트 목록 | `pl-input` → `bw-input` (검색, 필터 select) |
| **NotebookLLM** | 프로젝트 · 대화 화면 내 | `notebook-llm-prompt-input` + `bw-input` |
| **FileAnalysisChatSystem** | /file-analysis | `fac-input` + `bw-input` |
| **WritingAssistant** | 고급 기능 내 | `form-field` input/textarea/select + `bw-input` |
| **AdvancedSearch** | 검색 | `adv-search-input` + `bw-input` |
| **SimpleChatView** | 대화 내 통합 | `chat-input` + `bw-input` |
| **ModernChatInterface** | - | `chat-input` + `bw-input` |
| **App.js** | 레거시 | `chat-input` + `bw-input` |

### 포커스 스타일 통일

- **WritingAssistant** form-field: `accent-primary`(녹색) → `accent-info-figma`(파란 포커스 링) 적용.

---

## 2. 상세 페이지 레이아웃 통일 (2026-02-20)

### 공통 클래스 `.bw-detail-*` (brainwave-global.css)

파일 분석 메뉴를 기준으로 2차 메뉴·상세 페이지가 동일한 구성을 갖도록 공통 레이아웃 추가.

| 클래스 | 용도 |
|--------|------|
| `.bw-detail-root` | 메인 컨테이너 (카드형, flex column, overflow hidden) |
| `.bw-detail-root--centered` | 중앙 정렬·max-width 720px (FeaturesMapView 등) |
| `.bw-detail-header` | 헤더 영역 (padding, border-bottom) |
| `.bw-detail-header-inner` | 헤더 내부 (flex, space-between) |
| `.bw-detail-header-left` | 아이콘+제목+설명 묶음 (flex, gap) |
| `.bw-detail-header-actions` | 헤더 오른쪽 액션 영역 |
| `.bw-detail-header-icon` | 아이콘 (accent-info-muted 배경) |
| `.bw-detail-header-title` / `.bw-detail-header-title--xl` | 제목 |
| `.bw-detail-header-desc` | 설명 |
| `.bw-detail-tabs` | 탭 영역 (pill 스타일, header 내부) |
| `.bw-detail-tab` / `.bw-detail-tab.active` | 탭 버튼 |
| `.bw-detail-content` | 본문 영역 (flex 1, overflow, position relative) |
| `.bw-detail-tab-content` | 탭별 스크롤 가능 콘텐츠 |
| `.bw-features-grid` | 기능 맵 그리드 (repeat auto-fill 140px) |
| `.bw-features-card` / `.bw-features-card-title` / `.bw-features-card-desc` | 기능 카드 링크 스타일 |
| `.bw-features-section-item-name` | 섹션 내 링크 없는 항목명 (text-primary) |

### 적용 페이지

| 페이지 | 경로 | 적용 내용 |
|--------|------|----------|
| **FileAnalysisChatSystem** | 프로젝트 · 대화 화면 내 | `fac-*` + `bw-detail-*` (기준) |
| **AIDocumentGenerator** | 프로젝트 · 대화 화면 내 | `aidg-*` + `bw-detail-*`, accent-info 통일 |
| **AnalyticsDashboard** | 대화 내 | MUI Box → `bw-detail-root` + header + content |
| **NotebookLLM** | 프로젝트 · 대화 화면 내 | `bw-detail-root`, header에 아이콘·설명 추가 |
| **FeaturesMapView** | /features-map (도구) | `bw-detail-root--centered` + header + `bw-features-grid`·`bw-features-card` |
| **SimpleChatView** | 대화 내 통합 | `bw-detail-root` + header(아이콘·제목·설명) |
| **AdvancedFeaturesPanel** | 대화 내 통합 | `bw-detail-root` + header + `bw-detail-tabs`/`bw-detail-tab` (pill) + content |
| **IntegratedAIChat** | 대화 내 통합 | MUI Paper → `bw-detail-root` + header + content |

**참고**: 3분할 라우트(일반 대화 `/`·프로젝트 `/projects`·프로젝트 · 대화 `/projects/:id`). UltimateChatGPTInterface는 대화 내 통합, bw-detail 미적용 레이아웃 유지.

**추가 유틸리티**: `.bw-text-error`, `.bw-detail-header-icon svg`(20x20), `.connection-status-text`, `.confidence-value`.

**레이아웃 유틸리티** (2026-02-20, 인라인 스타일 제거용): `.bw-flex-between`, `.bw-flex-between.mb-sm/mb-md/mb-lg`, `.bw-flex-gap-8`, `.bw-text-muted-italic`, `.bw-details-summary`, `.bw-label-block`, `.bw-input-w-80`, `.bw-max-w-320`, `.bw-d-block`, `.bw-hidden`, `.bw-mt-xs/mt-sm/mt-md`, `.bw-mb-xs/mb-sm/mb-md`. AdvancedFeaturesPanel: `.voice-gen-helper`, `.voice-gen-helper--sm`, `.voice-gen-inline-row*`, `.voice-gen-inline-label*`, `.voice-gen-style-*`, `.voice-gen-preset-actions`, `.voice-gen-control-inline`, `.voice-gen-reading-row`, `.voice-gen-tone-tags`. AppUnified 사이드바: `sidebar-mobile-close-header`·`sidebar-mobile-close-btn`, `nav-item-hint`, `chat-list-dot--primary`·`chat-list-dot--secondary`, `user-info-name`·`user-info-email`. AppUnified 공통: `brainwave-mobile-header`·`brainwave-mobile-menu-btn`·`brainwave-mobile-title`, `brainwave-error-fallback-actions`·`brainwave-error-home-link`. Layout/Sidebar(ChatGPTInterface): `brainwave-sidebar-text-secondary`·`brainwave-sidebar-footer-border` 상속/클래스 적용.

**추가 정리 (2차)**: `AdvancedFeaturesPanel.tsx` 인라인 스타일 수를 **69 → 1**로 축소. 남은 1건은 품질 레벨(우수/양호/보통/개선 필요) 배지의 **동적 색상 스타일**로 유지.

**추가 정리 (3차)**: `AIDocumentGenerator` 설정 탭 토글 UI 인라인 스타일을 클래스(`aidg-settings-list`, `aidg-settings-label-medium`, `aidg-toggle-btn`, `aidg-toggle-thumb`)로 전환해 인라인 스타일 수를 **66 → 56**으로 축소.

**테스트**: 헤더에 탭명과 동일한 텍스트가 있으면 `getByText` 다중 매칭 가능. 탭 클릭 시 `getByRole('tab', { name: /.../ })` 사용 권장. (AdvancedFeaturesPanel·SimpleChatView 적용 완료)

---

## 8. 메뉴·라우트 통합 (2026-02-20)

### 단일 소스

- **config/routes.ts**: `defaultRoutes`(path·name·description·category)·`routeCategories`(대화·프로젝트)·`getPageTitle(pathname)`.
- **페이지 제목**: document title·모바일 헤더 제목은 `getPageTitle(pathname)` 사용.

### 사이드바 메뉴 그룹화 (3분할)

- **메인**: **일반 대화**(/)·**프로젝트**(/projects). 프로젝트 · 대화(/projects/:id)는 프로젝트 클릭 시 진입, 사이드바에 직접 노출하지 않음.
- **도구**: 검색(⌘F)·단축키(?)·전체 기능(/features-map).
- **도메인 방향 반영**: 노트북 LLM 헤더·기능맵 설명에 프로젝트별 학습/정리 기반 답변과 도시정비·재건축·재개발 특화 문구 반영. 고급 기능의 대본 입력→음성 생성(TTS) 흐름을 메뉴 설명에 명시.

---

## 9. 프로젝트 실사용 UX 강화 (2026-02-20)

- **프로젝트 홈 요약 카드**: ChatGPTInterface 빈 대화 화면에 현재 프로젝트 카드 추가(설명·지침 적용 여부·가이드라인/파일/태그/소스 수).
- **입력창 컨텍스트 바**: 메시지 입력 상단에 현재 프로젝트 컨텍스트 표시(지침/가이드라인/파일) + 프로젝트 설정 바로가기.
- **프로젝트 설정 동기화 강화**: ProjectEditModal 저장 후 ChatGPTInterface의 `currentProject`에 `instructions/tags/files/initialGuidelines/source_count` 즉시 반영.
- **프로젝트 대시보드**: 메시지 영역 상단에 최근 파일·다음 액션 버튼(지침 작성/가이드라인 정리/참고 파일 준비/도메인 실무 점검) 추가. 버튼 클릭 시 프롬프트가 입력창에 자동 채워져 바로 실행 가능.

---

## 3. 이미 bw-input 적용된 페이지

- ChatGPTInterface (message-input bw-input)
- GuidelinesManager, WorkflowAutomation, AIEngineMonitor
- RealTimeCollaboration, RBACSystem, AdvancedSettings
- ProjectCreationModal, NewsSearch, AnalyticsDashboard
- AdvancedDataInsights, ProjectAnalytics, VoiceRecognition
- ChatInterface, UltimateChatGPTInterface

---

## 4. 대화 입력 패턴 (input-wrapper)

대화 화면은 **input-wrapper** 안에 **chat-input**을 사용. wrapper가 테두리·패딩을 담당하고, 내부 textarea는 borderless.

- `chat-input bw-input`: bw-input 기반 타입·색상, chat-input이 border/background override.
- send-btn: accent-info 사용으로 시각적 일관성 유지 (아이콘 전용 버튼).

---

## 5. Figma 기준

- **브랜드 컬러**: [Brainwave AI UI Kit node 323-168775](https://www.figma.com/design/9ZrEa3dcS8zb0O6Nr5lT8m/Brainwave-AI-UI-Kit?node-id=323-168775)
- **입력 스타일**: `bw-input` (theme.css, brainwave-global.css)
- **포커스**: `--accent-info-figma`, `--shadow-input-figma`

---

## 6. UX 일관성 (로딩·에러·토스트) — 2026-02-20

### 토스트

| 패턴 | 사용처 | 비고 |
|------|--------|------|
| **showToast** + GlobalToastListener | ChatGPTInterface, WritingAssistant, ProjectEditModal, Sidebar, RealEstateDataPanel, SecurityAutomationPanel, ProjectLLMSettings, AdvancedSearchPanel, writingExport, errorHandler, FileUploadZone, ConstructionCompanyDashboard | `utils/toast.ts` → `corbu-toast` 이벤트 → AppUnified GlobalToastListener → `brainwave-toast brainwave-toast-{type}` (App.css). **2026-02-20**: ChatGPTInterface 로컬 토스트 전부 showToast로 통합 완료. |

**스타일**: App.css `.brainwave-toast`(슬라이드 인)·`.brainwave-toast-success`·`.brainwave-toast-error`·`.brainwave-toast-info`. brainwave-global.css `.bw-toast-*` (인라인 토스트용). theme 변수 사용.

### 로딩

- **LoadingStateIndicator**: ChatGPTInterface, NotebookLLM, IntegratedAIChat, AdvancedFeaturesPanel, PerformanceMonitoringDashboard 등 다수 적용.
- **data-testid**: `loading-state-initial`·`loading-state-updating`·`loading-state-refreshing` (E2E·테스트용).

### 에러

- **ErrorRecovery**: data-testid="error-recovery", 에러 복구 블록.
- **ErrorToast** (ErrorFeedback): success/warning/error/info 타입, theme 변수.
- **ChatGPTInterface**: getErrorMessage(401/404/429)·extractResponseContent, 에러 메시지 인라인 표시.

### 경고

- **alert()**: `backup/*.disabled` 파일에만 존재. 활성 코드에서는 사용 안 함.
- **테스트 픽스처**: XSS 검증용 `alert("xss")` 문자열만 사용.

### 접근성 (a11y)

- **AdvancedFeaturesPanel**: role="tablist"/"tab"/"tabpanel", aria-selected, aria-controls, aria-label. 키보드: ArrowLeft/Right/Up/Down·Home·End로 탭 이동. 목소리 생성 탭 내 입력·버튼 aria-label 적용. (테스트: AdvancedFeaturesPanel.test ArrowLeft·Home·End 검증)
- **manifest.json**: PWA theme_color #3478F6, start_url="/", display standalone.

### 단기 미진행 점검 (순차 진행 시)

| 항목 | 점검 방법 | 참고 |
|------|-----------|------|
| 로딩·토스트·에러 문구 일관성 | 대화·모달·API 실패 시 [UX_MESSAGING_GUIDE](guides/UX_MESSAGING_GUIDE.md) 준수 여부 확인 | "생각 중"·showToast·getUserFriendlyError |
| 온보딩·첫 방문 안내 | 첫 접속 시 짧은 안내 문구·도움말 링크 노출 여부 | 추후 추가 권장. START_HERE·MANUAL_QUICK_REFERENCE 링크 있음 |

---

## 7. 검증

```bash
npm run verify:completion
```

통과 시 타입·린트·P4 테스트 기준 디자인 변경 회귀 없음.
