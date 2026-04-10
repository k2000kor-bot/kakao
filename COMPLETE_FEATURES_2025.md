# 완전한 기능 목록 (2025년 1월 27일)

**CORBU.AI 시스템의 모든 기능**

### 최근 업데이트 (2026년 2월)
- **CORBU.AI 레이아웃 적용** (Brainwave Figma, 무제 폴더·Figma node 7-3): 3단 그리드(다크 좌측 사이드바 + 메인 + 우측 대화 히스토리), 좌측 Chats/Search/Manage subscription/Updates & FAQ/Settings, Chat list(Welcome·UI8 Production·Favorites·Archived·+ New list), 사용자 카드·Upgrade Pro·Light/Dark 토글, 우측 Chat history 26/100·+ New chat, theme.css --sidebar-dark-*·--accent-info-figma·--layout-right-sidebar-width 토큰
- **CORBU.AI 메인 대화 적용**: ChatGPTInterface 사이드바 brainwave-unified 시 숨김, 환영 화면 CORBU.AI 제목·캡빌리티 칩(Photo edition·Video generation·Photo generation·Code generation·Audio generation), 대화 헤더 Share 버튼(accent-info-figma), 입력 placeholder "Type '/' for commands"
- **입력창 Figma 스타일**: + 아이콘(왼쪽), 마이크 아이콘(오른쪽), `.input-icon-btn` 스타일 추가
- **PWAInstallPrompt CORBU.AI 정렬**: "CORBU.AI 설치" 브랜딩, `--accent-info-figma`·`--on-accent` 토큰 사용, 업데이트 다이얼로그 문구 통일
- **CORBU.AI 브랜딩 통일**: index.html title·meta·first-paint·root-loading, manifest.json name/short_name, AppUnified·ChatGPTInterface·App document.title → CORBU.AI
- **SimpleChatView·pwaService CORBU.AI 정렬**: 환영 메시지·헤더·placeholder·타이핑 문구, PWA 업데이트 알림 제목
- **테스트 업데이트**: AppUnified.test (ThemeProvider mock, CORBU.AI 기대값), SimpleChatView.test (CORBU.AI 기대값, 빠른 액션 버튼 정규식 매칭)
- **CORBU.AI 색상·브랜딩 추가**: MobileNavigation "CORBU.AI", index.html·manifest theme-color #3478F6 (Figma Primary Blue)
- **CORBU.AI 토큰 통일 (34~35차)**: DeepResearchModal margin 1em/0.5em → var(--spacing-lg/sm); NotebookLLM studio-view h1~h3 margin 토큰화; App.css letter-spacing/padding 토큰화; QuickReplies·ChatView letter-spacing → var(--letter-spacing-tight/wide)
- **CORBU.AI 디자인 문서 정리**: BRAINWAVE_DESIGN.md transform 오프셋·animation-duration-pulse·쉬머 섹션 추가
- **CORBU.AI 토큰 통일 (33차)**: QuickReplies translateX(2px), PredictionChart·WritingHistory width/height 200px/28px/18px, BreadcrumbNavigation·WritingHistory·WritingEditor border 토큰화
- **CORBU.AI 토큰 통일 (32차)**: FileUploadZone border/width/height/max-width 토큰화
- **CORBU.AI 토큰 통일 (31차)**: theme.css --sr-only-size/--sr-only-offset 추가, ChatGPT5CompleteInterface·ChatView·LazyImage·FileUploadZone sr-only 1px/-1px 토큰화
- **CORBU.AI 토큰 통일 (30차)**: WritingAISuggestions·WritingStatisticsDashboard border/grid 토큰화, NotebookLLM analysis-skeleton height/width 토큰화
- **CORBU.AI 토큰 통일 (29차)**: theme.css --blur-lg, --letter-spacing-subtle 추가, ModernChatInterface·NotebookLLM border/transform/backdrop-filter 토큰화, TypingIndicator width/height/min-width/transform 토큰화, App backdrop-filter, ChatGPT5CompleteInterface·MessageActions·ProjectHub·MessageEditor·WritingAssistant·WritingStatisticsDashboard·WritingAISuggestions transform translateY 토큰화
- **CORBU.AI 토큰 통일 (28차)**: theme.css --transform-lift-xs/sm, --shimmer-size/step 활용, AdvancedSearchPanel right·margin·width·transform 토큰화, AdvancedFeaturesPanel grid·min-width·margin·animation 토큰화, LazyImage·LoadingSkeleton 쉬머 200px/40px/80px→var(--shimmer-*), transform translateY(-1px/-2px)→var(--transform-lift-*), animation duration 0.8s/1s/1.4s/1.5s/2s→var(--animation-duration-*)
- **CORBU.AI 토큰 통일 (27차)**: theme.css animation-duration·blur 토큰 추가, KeyboardShortcutsHelp·PerformanceMonitoringDashboard·RealEstateDataPanel·ErrorRecovery·AdvancedFeaturesPanel·LoadingSkeleton·LoadingStateIndicator·UserSettings·ProjectLLMSettings·SessionManager·SearchPanel·WritingStyleSelector·WritingTemplatePreview·AdvancedSearchPanel border·width·grid·outline 토큰화, DeepResearchModal·WebResearchModal·AdvancedFeaturesPanel backdrop-filter 토큰화, animation duration 0.2s/0.3s/0.8s/1s/1.5s→var(--transition-*/animation-duration-*)
- **CORBU.AI 토큰 통일 (26차)**: 전역 border 1px/2px/3px/4px → var(--border-width*), box-shadow 2px/3px → var(--border-width-md/lg), 40+ 파일 brainwave-global·ChatGPTInterface·App·NotebookLLM·AdvancedSearchPanel·AdvancedFeaturesPanel·NotificationCenter·SessionManager·ProjectLLMSettings·UserSettings·SearchPanel·WritingStyleSelector·ChatView·ErrorBoundary·ErrorRecovery·RealEstateDataPanel 등 일괄 토큰화
- **CORBU.AI 토큰 통일 (25차)**: theme.css z-index 토큰 확장(--z-base, --z-panel, --z-settings, --z-popover), 12개 파일 z-index 하드코딩→토큰 교체, App·WritingAssistant·NotificationCenter·MessageReply outline/box-shadow/border-left 토큰화, animation duration 0.2s/0.3s→var(--transition-*), BRAINWAVE_DESIGN.md z-index 안내 추가
- **CORBU.AI 토큰 통일 (24차)**: theme.css border-width·button-min·dropdown-min·panel·modal·layout-sidebar-width-sm 토큰 추가, NotificationCenter·WritingAssistant·ModernChatInterface·App·ChatGPTInterface·LoadingSkeleton·MessageReply width/height/min-width 토큰화, BRAINWAVE_DESIGN.md 기타 토큰 안내 확장
- **CORBU.AI 토큰 통일 (23차)**: theme.css 세로 높이·간격·그리드 토큰 대폭 확장(--content-height-*, --content-max-height-*, --spacing-2xs, --icon-size-2xs, --grid-min-xs-sm), NotebookLLM·AdvancedFeaturesPanel·AdvancedSearchPanel·ChatGPTInterface·ModernChatInterface·WritingAssistant·WritingTemplatePreview·ErrorBoundary·LoadingSkeleton·MessageEditor·LazyImage·NotificationCenter·ProjectTemplateSelector·ProjectShareDialog·MessageReply·App 등 20+ 파일 min-height/max-height/padding/margin/grid 토큰화
- **CORBU.AI 토큰 통일 (22차)**: theme.css 아이콘·콘텐츠·그리드·레이아웃 토큰 대폭 확장(--icon-size-*, --content-max-*, --grid-min-*, --touch-target, --scrollbar-width, --label-min-width), ChatGPTInterface·App·AdvancedFeaturesPanel·AdvancedSearchPanel·ChatView·SearchPanel·LoadingStateIndicator·NotebookLLM·SessionManager 등 15+ 파일 max-width/min-width/width/height/margin 토큰화, BRAINWAVE_DESIGN.md 안내 보강
- **CORBU.AI 토큰 통일 (21차)**: theme.css --breakpoint-tablet(960px)·--breakpoint-tablet-sm(900px)·--touch-target-min(44px) 추가, ChatGPT5CompleteInterface·AdvancedFeaturesPanel media query 토큰화, ChatGPTInterface textarea min-height 토큰화, BRAINWAVE_DESIGN.md 터치 타겟 안내 추가
- **CORBU.AI 토큰 통일 (20차)**: theme.css --breakpoint-mobile 640px 추가, 5개 파일 media query 640px→var(--breakpoint-mobile), ChatGPT5CompleteInterface·WritingTemplatePreview transition→var(--transition-base/slow), BRAINWAVE_DESIGN.md 반응형 전체 브레이크포인트 정리
- **CORBU.AI 토큰 통일 (19차)**: border-radius 10px/999px 토큰화, media query 768px/480px → var(--breakpoint-md/sm), BRAINWAVE_DESIGN.md 반응형 안내 추가
- **CORBU.AI 토큰 통일 (18차)**: ChatGPTInterface·AdvancedSearchPanel·AdvancedFeaturesPanel 남은 px 토큰화, transition 0.2s/0.3s → var(--transition-base/slow)
- **CORBU.AI 토큰 통일 (17차)**: ChatGPT5CompleteInterface·AdvancedSearchPanel·ChatGPTInterface padding/gap/font-size/radius/margin 토큰화
- **CORBU.AI 토큰 통일 (16차)**: NotebookLLM·ChatView·RealEstateDataPanel·AdvancedFeaturesPanel padding/gap/font-size 토큰화
- **CORBU.AI 토큰 통일 (15차)**: ProjectLLMSettings·PredictionChart·MessageReactions·ErrorBoundary·MessageActions·ReadReceipts 나머지 padding/gap/font-size 토큰화, focus-visible 추가
- **CORBU.AI 토큰 통일 (14차)**: MultiIntentResponseView·PerformanceMonitoringDashboard·ProjectLLMSettings·ErrorRecovery·BreadcrumbNavigation·WritingStyleSelector padding/gap/font-size/radius 토큰화, focus-visible 추가
- **CORBU.AI 토큰 통일 (13차)**: WritingAISuggestions·WritingStatisticsDashboard·WritingQualityPanel·WritingTemplatesFavorites·LanguageSelector padding/gap/font-size/radius 토큰화, focus-visible 추가
- **CORBU.AI 토큰 통일 (12차)**: AdvancedSearchPanel(결과/푸터), WritingTemplatePreview, WritingHistory padding/gap/font-size/radius 토큰화, focus-visible 추가, NotebookLLM status-indicator 토큰화
- **CORBU.AI 토큰 통일 (11차)**: ModernChatInterface(메시지/입력/웰컴/에러폴백), KeyboardShortcutsHelp, AdvancedSearchPanel padding/gap/font-size/radius 토큰화, focus-visible 추가, ProgressIndicator height 버그 수정
- **CORBU.AI 토큰 통일 (10차)**: ModernChatInterface·WritingEditor·WritingAssistant·SearchPanel·UserSettings·NotificationCenter·ChatView CSS — color:white→--on-accent, padding/gap/font-size/spacing/transition→토큰, focus-visible 추가, --accent-primary-light→--accent-success-muted
- **CORBU.AI 토큰 통일 (9차)**: ProgressIndicator·ErrorRecovery·BreadcrumbNavigation CSS CORBU.AI 토큰 적용, transition·padding·gap·font-size 통일, ErrorRecovery btn focus-visible
- **CORBU.AI 토큰 통일 (8차)**: theme.css(--spacing-4xl·--font-size-4xl·브레이크포인트), brainwave-global(bw-select·bw-error-fallback), index ErrorBoundary bw- 클래스, WebResearchModal·DeepResearchModal z-index·backdrop, NotebookLLM·WritingStyleSelector·RealEstateDataPanel focus-visible, BRAINWAVE_DESIGN.md 추가
- **CORBU.AI 토큰 통일 (7차)**: PerformanceMonitoringDashboard box-shadow, brainwave-global(bw-btn-danger focus-visible·bw-link·prefers-reduced-motion), theme.css Figma 링크, NotebookLLM 인라인 스타일→bw-btn 클래스·on-accent
- **CORBU.AI 토큰 통일 (6차)**: WritingTemplatesFavorites·ProjectShareDialog·ProjectTemplateSelector·ProjectHub·WritingQualityPanel·ReadReceipts·MultiIntentResponseView·WritingHistory·WritingAISuggestions·WritingStatisticsDashboard·LanguageSelector·PerformanceMonitoringDashboard·PredictionChart — var fallback·hex·rgba 제거, CORBU.AI 토큰 적용
- **CORBU.AI 토큰 통일 (5차)**: MessageReactions.css·QuickReplies.css·ChatView.css·WritingStyleSelector.css·RealEstateDataPanel.css·ProjectLLMSettings.css — var fallback 제거, accent-primary→accent-info, accent-danger→accent-error, spacing·radius 토큰 적용
- **CORBU.AI 토큰 통일 (4차)**: WritingTemplatePreview.css(tone/style 배지·category-badge), AdvancedSearchPanel.css(var fallback 전면 제거), ChatGPT5CompleteInterface.css(fallback 제거), ModernChatInterface.css(spacing-xs)
- **CORBU.AI 토큰 통일 (3차)**: AdvancedFeaturesPanel.css(fallback 제거), ModernChatInterface.css(emotion/intent 태그·모달·스크롤바), AdvancedSearchPanel.css(저장 다이얼로그·선택 강조·검색 하이라이트), WritingTemplatePreview.css(overlay·모달·선택 버튼) CORBU.AI 토큰 적용
- **CORBU.AI 토큰 통일 (2차)**: DeepResearchModal.css·WebResearchModal.css·KeyboardShortcutsHelp.css·SearchPanel.css·UserSettings.css — overlay(rgba→var(--bg-overlay)), box-shadow→var(--shadow-modal), accent(rgba/#hex)→var(--accent-info-muted)·var(--accent-secondary)·var(--accent-success), spacing·radius·font-size 토큰 적용, focus-visible 추가
- **CORBU.AI 토큰 통일**: NotebookLLM.css·SessionManager.css 하드코딩 색상(rgba, #hex) → var(--accent-info-muted), var(--bg-overlay), var(--shadow-modal), var(--accent-error-hover) 등 CORBU.AI 토큰으로 교체
- **CORBU.AI UI Kit 정렬**: brainwave-global.css Figma 링크(node-id=323-168775) 추가, NotebookLLM focus-visible(생성·입력·템플릿·중지·복사) 접근성 보강
- **에러 로깅 개선 (3차)**: index.simple.tsx Root 없음 시 errorLogger·role="alert"·aria-live, notificationService·voiceService console.warn → errorLogger.warn
- **에러 로깅 개선 (2차)**: integratedAPIService(헬스체크·메트릭·서버연결), chatSessionService(세션·메시지·삭제·제목·프로젝트·로컬스토리지), fileService(파일목록·업로드·삭제) console.error → errorLogger
- **에러 로깅 개선**: api.ts·integratedAPIService.ts의 console.error → errorLogger.error로 교체, 컴포넌트·액션 컨텍스트 추가
- **추가 접근성 개선 (4차)**: ChatGPT5CompleteInterface 모바일·입력 영역 IconButton(새 프로젝트·첨부·음성·출력), TextField aria-label, 새 대화·프로젝트 Button, ChatGPTStyleInterface IconButton(파일·콘텐츠·음성)·Button·TextField, ProjectShareDialog IconButton type
- **추가 접근성 개선 (3차)**: ProjectHub 빈 상태 Button type="button", 메뉴 MenuListProps aria-label·role, MenuItem role·aria-label, ChatGPTInterface textarea aria-label, ProgressIndicator prefers-reduced-motion, SearchPanel search input type="search"·aria-label, IntegratedAIChat Button type="button"
- **추가 접근성 개선 (2차)**: ProjectLLMSettings close-btn type="button", ProjectShareDialog(취소·닫기·삭제·생성·링크복사 IconButton) type="button" aria-label, ConstructionCompanyDashboard·ApartmentCommunityAnalysisDashboard 다이얼로그 닫기·복사 버튼, ChatGPTStyleInterface·ChatGPT5CompleteInterface IconButton·Button(메모리·프로젝트·취소·생성·템플릿선택), SecurityAutomationPanel 규칙 편집·삭제 확인 버튼, UltimateChatGPTInterface 사이드바·메인 프롬프트 제안 버튼 aria-label
- **추가 접근성 개선**: MessageBubble(복사·좋아요·싫어요·북마크·더보기 aria-label, role="group"), AdvancedSearchPanel 검색 기록 전체 삭제 type="button" aria-label, FileUpload 미리보기·다운로드·삭제·오류 닫기 aria-label, UltimateChatGPTInterface 테마·설정·사이드바·파일패널·파일첨부 aria-label, NotificationSystem 소리·닫기·읽음·삭제·개별 알림 닫기 aria-label, NotebookLLM 소스 전체 선택/해제 aria-label, SmartRecommendations AI 추천 aria-label, SearchPanel·WritingHistory·ProjectLLMSettings·ErrorToast·ConversationSummary·WritingTemplatesFavorites·WritingTemplatePreview·WritingEditor 버튼 type="button" aria-label
- **파일 업로드 접근성**: FileAnalysisChatSystem input·토글 버튼 aria-label, FileUpload input aria-label, AdvancedFileUpload input·제거 버튼 aria-label
- **ESLint react-hooks/exhaustive-deps 해결**: ChatGPTInterface useEffect·useCallback, NotebookLLM useMemo·useCallback·useEffect 의존성 배열 보완, STUDIO_TYPE_LABELS 컴포넌트 외부 상수로 이동
- **ProjectHub·UltimateChatGPTInterface 접근성**: ProjectHub TextField·IconButton·Button aria-label type="button", UltimateChatGPTInterface 전송·음성 버튼 aria-label
- **ProjectTemplateSelector·RealEstateDataPanel 접근성**: ProjectTemplateSelector Dialog·TextField·IconButton·Button aria-label, RealEstateDataPanel select·조회 버튼 aria-label, aria-busy
- **ErrorRecovery·errorHandler 접근성**: ErrorRecovery role="alert" aria-live, 버튼 type="button" aria-label, 재시도 스피너 role="status", ErrorRecovery.css prefers-reduced-motion, DefaultErrorFallback role="alert" type="button" aria-label
- **select·input 접근성**: WritingAssistant(어투·글종류·필드 select), ProjectList(필터·검색), AdvancedSearch(타입 select·검색 input·버튼), AdvancedSearchPanel(정렬·필터 select) aria-label
- **WritingAssistant·MessageEditor·Layout/Sidebar**: WritingAssistant placeholder 중국어→한국어(입력하세요), MessageEditor·Sidebar 모든 버튼 type="button"
- **Layout·사이드바 접근성**: 스킵 링크 aria-label, 라우트 변경 시 main 포커스, 사이드바 role="navigation" aria-label, NavLink·새 대화 aria-label, nav-item-icon aria-hidden
- **NotificationCenter**: Escape로 알림 패널 닫기
- **BreadcrumbNavigation**: 브레드크럼 버튼 type="button"
- **FeaturesMapView 접근성**: 섹션 aria-labelledby, h2 id로 접근성 보강
- **IntegratedAPIDemo·offline.html alert 제거**: IntegratedAPIDemo alert→MUI Snackbar, offline.html alert→인라인 메시지(role="alert", aria-live)
- **index.tsx·SimpleChatView 접근성**: index.tsx ErrorBoundary role="alert" aria-live, 버튼 type="button" aria-label, SimpleChatView 버튼·textarea aria-label
- **index.css·대화 접근성**: index.css slideIn/slideOut/pulse prefers-reduced-motion, UltimateChatGPTInterface·ChatInterface textarea·버튼 aria-label
- **빈 상태·로딩 접근성**: ProjectList·ProjectHub·ProjectTemplateSelector 빈 상태 role="status" aria-live, 버튼 type="button" aria-label, LoadingStateIndicator prefers-reduced-motion
- **SecurityAutomationPanel·LoadingSkeleton**: 규칙 삭제 window.confirm→확인 모달(Escape·접근성), LoadingSkeleton prefers-reduced-motion
- **NotFoundPage 접근성**: 이전 페이지·홈 버튼 aria-label
- **로딩·토스트 보강**: index.html first-paint·root-loading role="status" aria-live aria-label, App Suspense fallback role="status" aria-label, Layout/Sidebar alert→토스트(showToast), 전역 토스트 유틸(utils/toast) 및 GlobalToastListener
- **alert→토스트 전면 교체**: WritingAssistant(필드 검증·생성 오류·복사), AdvancedSearchPanel(검색 링크 복사), ProjectLLMSettings(프로바이더·모델 선택), RealEstateDataPanel(실거래·등기 조회 실패), FileUploadZone(파일 개수·검증), errorHandler(심각 오류), writingExport(DOCX·PDF 안내), ConstructionCompanyDashboard(시공사 선택·향후 구현 안내)
- **NotebookLLM prefers-reduced-motion**: .notebook-llm 애니메이션·트랜지션 최소화
- **접근성 추가**: NotebookLLM 오류 "다시 시도" 버튼 aria-label, prefers-reduced-motion 대응(애니메이션·트랜지션 최소화)
- **접근성·문서 제목 보강**: 토스트 role="status" aria-live="polite" aria-atomic aria-label, 스킵 링크(본문으로 건너뛰기), 사이드바 role="navigation" aria-label, main 랜드마크(id="chat-main-content" tabIndex -1), 문서 제목 동적 업데이트(대화·노트북 제목 반영)
- **키보드 단축키·포커스 보강**: Ctrl/⌘+L 입력창 포커스, 모달 열림 시 단축키 차단(삭제·공유·설정 등), 단축키 도움말 모달 포커스 관리(열기 시 닫기 버튼 포커스, 닫기 시 이전 포커스 복원)
- **모달·연구 모달 접근성 보강**: ProjectEditModal 닫기·태그·가이드라인·저장 버튼 aria-label, input aria-label, ProjectShareDialog 닫기 aria-label, 대화·메시지·전체삭제 확인 모달 type="button"·aria-label, WebResearch·Deep Research 실행·소스추가 버튼 aria-label, NotebookLLM 분석 URL추가·스튜디오 생성 aria-label
- **프로젝트·사이드바·메시지 버튼 접근성**: 프로젝트 생성·삭제 모달 type="button"·aria-label, 프로젝트 생성 input aria-label·Escape 닫기, 새 대화·가져오기·프로젝트·노트북 토글·대화로 이동 type="button"·aria-label, 메시지 액션(복사·편집·재생성·좋아요·싫어요·북마크·TTS·삭제)·편집 취소·저장·접기·코드 복사 type="button"·aria-label
- **전송·웰컴 버튼 접근성**: 전송·스트리밍 중지 type="button", 스트리밍 체크박스 aria-label, 웰컴 예시 질문 type="button"·aria-label
- **모달 접근성 보강**: PRO·단축키 도움말 role="dialog" aria-labelledby, Drive 연동·스튜디오 삭제 확인 버튼 aria-label
- **사이드바 빈 상태 개선**: 프로젝트 없을 때 "프로젝트 만들기" 버튼, 대화 없을 때 "새 대화 시작" 버튼, role="status" aria-live
- **응답 스타일·관점 선택 접근성**: type="button", aria-label, aria-pressed, 관점 해제 버튼 aria-label
- **대화 검색 입력**: type="search", aria-describedby로 힌트 연결
- **접근성 개선 (2차)**: 타임스탬프·자동 스크롤 토글 type="button", aria-label, 테마 토글 aria-label, 단축키 닫기 버튼 aria-label
- **NotebookLLM 버튼 접근성**: 생성 버튼 type="button", 템플릿·글쓰기 스타일·어투·도메인·마인드맵·부동산 버튼 aria-label
- **대화 메시지 내 검색어 하이라이트**: 대화 검색 시 사용자/AI 메시지 내 검색어를 노란색으로 하이라이트, rehype 플러그인 적용
- **복제·가져오기·검색 버튼 접근성**: type="button", aria-label, 비활성 시 툴팁 (복제: "대화 내용이 있을 때 복제 가능")
- **검색 결과 이전/다음 버튼**: aria-label, type="button" 추가, 검색 입력 aria-label
- **북마크·대화 고정 토스트**: 메시지 북마크/해제, 대화 고정/해제 시 토스트 피드백
- **대화 입력 maxLength**: textarea 10,000자 제한, aria-label에 최대 글자 수 안내
- **노트북 LLM 생성 버튼**: 소스 없을 때 툴팁 "먼저 소스를 추가하고 분석하세요"
- **접근성**: ⌨️ 단축키 버튼 aria-label, 전체 삭제·사이드바 토글·정렬 select aria-label
- **메시지 삭제·전체 삭제 확인 모달**: window.confirm 대신 모달로 통일, Escape로 취소, 삭제 후 토스트
- **전송 버튼 툴팁·aria-label**: "메시지 전송 (Enter)", 접근성 개선
- **새 대화 버튼 툴팁**: "새 대화 (Ctrl+N)" 툴팁 및 aria-label 추가
- **프로젝트 삭제 실패 토스트**: 삭제 실패 시 alert 대신 토스트로 통일
- **알림·에러 토스트 통일**: alert 대신 토스트로 통일 (입력 검증·내보내기·가져오기·복사 실패 등)
- **스튜디오 보기 모달 다운로드 토스트**: MD/TXT 다운로드 시 "다운로드되었습니다" 표시
- **프로젝트 설정 저장 토스트**: 설정 모달에서 저장 시 "설정이 저장되었습니다" 표시
- **스튜디오 보기 모달 삭제 버튼**: 보기 모달에서 출력 삭제 가능 (확인 모달 경유)
- **분석 모달 소스 추가 토스트**: URL로 소스 추가 성공 시 "소스가 추가되었습니다" 표시
- **대화 제목 저장 토스트**: 제목 편집 저장 시 "제목이 저장되었습니다" 표시
- **스튜디오 출력 삭제 확인 모달**: 삭제 전 "이 출력을 삭제하시겠습니까?" 확인, Escape로 취소, 삭제 후 토스트
- **프로젝트·대화 토스트 피드백**: 프로젝트 생성/삭제, 대화 삭제 시 토스트 메시지 표시
- **대화 대화 가져오기 로딩 표시**: 파일 선택 후 파싱·저장 중 "가져오는 중…" 표시, 버튼 비활성화, 단축키 무시
- **노트북 LLM 응답 완료 토스트**: 응답 생성 완료 시 "응답 생성이 완료되었습니다" 토스트 표시
- **공통 토스트 루트 레벨**: 복사·노트북 완료 토스트를 루트에 배치해 대화/노트북 모드 모두에서 표시
- **노트북 LLM 입력 지우기 버튼**: 프롬프트·주제 입력 시 "지우기" 버튼 표시로 새 질문 빠르게 시작
- **대화 맨 위로 스크롤**: 스크롤 다운 시 "맨 위로" 버튼 표시 (맨 아래로와 대칭)
- **대화 에러 메시지 재시도**: 오류 발생 시 재생성 버튼이 "재시도"로 표시
- **대화 제목 편집 유효성**: 2자 이상 필수, placeholder "대화 제목 (2자 이상)"
- **단축키 복제·가져오기**: Ctrl/⌘+Shift+D 대화 복제, Ctrl/⌘+Shift+I 대화 가져오기, 단축키 도움말에 항목 추가
- **대화 가져오기 HTML 형식**: JSON·MD 외에 HTML(.html) 파일 가져오기 지원 (내보내기 형식 호환)
- **ProjectShareDialog 공유 링크 생성 폼 Escape**: 생성 폼 열림 시 Escape로 폼만 취소, 다이얼로그는 유지
- **대화 가져오기 MD 형식**: JSON 외에 Markdown(.md) 파일 가져오기 지원 (내보내기 형식 호환)
- **프로젝트 생성 유효성 검사**: 이름 2자 이상 필수 (ChatGPTInterface·사이드바)
- **대화 검색 결과 없음 안내**: 검색어 입력 후 결과 없을 때 "검색 결과가 없습니다. 다른 검색어를 입력해보세요."
- **사이드바 새 프로젝트 모달 Escape**: Escape로 모달 닫기
- **대화 입력 9,000자 근접 경고**: 9,000자 이상 시 경고색·"거의 최대치입니다" 안내
- **노트북 LLM 스튜디오 생성 버튼 툴팁**: 소스 없을 때 안내 메시지
- **ProjectShareDialog 링크 복사 토스트**: 링크 복사 시 "링크가 클립보드에 복사되었습니다" Snackbar
- **대화 스트리밍 경과 시간**: 스트리밍 중 입력 푸터에 "(N초)" 및 Esc 안내
- **노트북 LLM 스트리밍 경과 시간**: 스트리밍 인디케이터에 "(N초)" 표시
- **대화 헤더 대화 복제**: 대화 헤더에 "복제" 버튼으로 현재 대화 복사본 생성
- **웹/Deep Research 로딩 경과 시간**: 연구·보고서 생성 중 "(N초)" 표시
- **노트북 LLM 생성 경과 시간**: 프롬프트 응답 생성 중 버튼·로딩에 "(N초)" 표시
- **프로젝트 설정 모달 Escape**: ProjectEditModal Escape로 닫기
- **Deep Research 소스 없음 안내**: 보고서는 있으나 참고 소스 없을 때 안내 메시지
- **스튜디오 생성 경과 시간**: 스튜디오 출력 생성 중 "생성 중... (N초)" 표시
- **단축키 도움말 Escape**: Escape 설명에 "단축키 닫기" 추가
- **웹 연구 소스 없음 안내**: 연구 결과는 있으나 발견된 소스가 없을 때 안내 메시지
- **프로젝트 미선택 시 웰컴 안내**: 웰컴 화면에서 프로젝트 없을 때 배너·프로젝트 만들기 버튼
- **대화 헤더 가져오기 버튼**: 대화 헤더에 JSON 가져오기 버튼 추가
- **단축키 도움말 Escape 닫기**: ? 키로 연 단축키 모달 Escape로 닫기
- **스튜디오 보기 모달 Escape 닫기**: 출력 보기 모달 Escape로 닫기 (음성 중지 포함)
- **스튜디오 출력 인쇄**: 보기 모달에서 🖨️ 인쇄 버튼
- **웰컴 화면 예시 질문 클릭 즉시 전송**: 카테고리별 예시 질문 클릭 시 바로 메시지 전송
- **대화 내보내기 HTML**: 대화 헤더에 HTML(.html) 형식 내보내기 버튼 추가
- **분석 모달 로딩 스켈레톤**: 소스 분석 로딩 시 스켈레톤 UI 표시
- **스튜디오 출력 빈 상태 개선**: 생성 이력 없을 때 안내 문구·아이콘 개선
- **빠른 질문 클릭 즉시 전송**: 응답 기반 빠른 질문 칩 클릭 시 바로 전송 (추천 질문과 동일)
- **스튜디오 출력 목록 복사**: 생성 이력 각 항목에 복사 버튼 (모달 열지 않고 클립보드 복사)
- **분석 모달 소스 검색**: 소스 6개 이상일 때 제목·유형으로 검색
- **노트북 LLM·대화 placeholder**: ↑/↓ 이전 입력/프롬프트 히스토리 안내
- **오프라인 시 전송 비활성화**: 오프라인일 때 전송 버튼·입력창 비활성화, 툴팁·안내 문구
- **PRO 배지 클릭 시 안내 모달**: PRO 구독 예정 기능 미리보기, Escape로 닫기
- **입력 히스토리**: 대화·노트북 LLM 입력창에서 ↑/↓ 화살표로 이전 입력 탐색
- **노트북 LLM 입력창 자동 높이**: 내용에 따라 높이 자동 조절 (최대 280px)
- **오프라인 안내 배너**: 오프라인 시 상단에 연결 안내 표시
- **노트북 검색**: 사이드바 전체 탭에서 노트북 이름으로 검색
- **스튜디오 출력 정렬**: 생성 이력 최신순/오래된순/유형별 정렬
- **Drive 연동 모달 개선**: 예정 기능 미리보기, Escape로 닫기
- **토스트 메시지 확장**: 복사/복제/다운로드/가져오기별 적절한 안내
- **프로젝트 삭제 확인**: 사이드바 프로젝트 삭제 버튼, 확인 모달로 실수 방지
- **대화 맨 아래로 스크롤**: 긴 대화에서 위로 스크롤 시 "맨 아래로" 버튼 표시
- **NotebookLLM 에러 닫기**: 에러 메시지에 ✕ 버튼으로 닫기
- **스튜디오 출력 MD/TXT 다운로드**: 마크다운(.md)과 일반 텍스트(.txt) 선택 저장
- **대화 빈 대화 안내**: 추천 질문 있을 때 "클릭하거나 직접 입력" 안내
- **분석 모달 URL 소스 추가**: 분석 모달에서 웹페이지/문서 URL 직접 입력으로 소스 추가, Escape로 모달 닫기
- **노트북 LLM placeholder 개선**: 소스 없을 때 "먼저 소스 추가" 안내, 글쓰기 스타일 힌트
- **노트북 LLM 응답 복사**: 응답 영역에 복사 버튼, 클립보드 복사 + 토스트 알림
- **대화 클립보드 복사**: 대화 헤더에 "복사" 버튼, 마크다운 형식으로 클립보드에 복사
- **추천 질문 클릭 즉시 전송**: 소스 기반 추천 질문 칩 클릭 시 바로 메시지 전송
- **노트북 LLM 스트리밍 중지**: 스트리밍 중 "중지" 버튼·Escape로 취소, AbortController 연동
- **스튜디오 출력 다운로드**: 보기 모달에서 마크다운(.md) 파일로 저장
- **소스 선택 필터링 (백엔드)**: `source_ids`로 선택 소스만 컨텍스트에 반영 (대화·노트북 LLM 스트리밍)
- **키보드 단축키**: 웹/Deep Research 모달 Escape 닫기, 모달 열림 시 입력창 자동 포커스
- **접근성**: aria-label, aria-keyshortcuts, 모달 포커스 관리
- **NotebookLM 기능 확장**: 스튜디오 메모·소스 선택·설정·공유·추천 노트북 템플릿
- `make setup/start/stop/check` - Makefile 편의 명령
- `./setup.sh` - 한 번에 의존성 설치
- `./install-plugins.sh` - OCR, yt-dlp, Ollama 등 추가 기능
- `./stop_all.sh` - 5001, 5002 포트 정리
- `npm run check:system` - 시스템 상태 확인
- Node.js 20, .nvmrc, 포트 충돌 해결

---

## ✅ 완료된 기능

### 1. ChatGPT 스타일 인터페이스 ✅
- ✅ 사이드바 (대화 목록)
- ✅ 메시지 전송/수신
- ✅ 마크다운 렌더링
- ✅ 메시지 복사 기능
- ✅ 로컬 스토리지 저장
- ✅ 자동 스크롤
- ✅ 타이핑 인디케이터
- ✅ 반응형 디자인
- ✅ 에러 처리
- ✅ 입력 검증

### 2. 프로젝트 관리 시스템 ✅
- ✅ 프로젝트 생성
- ✅ 프로젝트 선택
- ✅ 프로젝트별 대화 필터링
- ✅ 프로젝트 목록 표시
- ✅ 프로젝트 모달 UI
- ✅ 로컬 스토리지 저장
- ✅ 프로젝트 컨텍스트 전달

### 3. LLM 연동 시스템 ✅
- ✅ OpenAI (GPT-3.5, GPT-4)
- ✅ Anthropic (Claude 3.5 Sonnet)
- ✅ Ollama (로컬 LLM)
- ✅ 노트북 LLM (하이브리드 모드)
- ✅ 폴백 모드
- ✅ 대화 히스토리 관리
- ✅ 지식 베이스 통합
- ✅ 컨텍스트 윈도우
- ✅ **긴 글 자동 생성** 🆕

### 4. 긴 글 생성 기능 🆕
- ✅ 키워드 기반 자동 감지
- ✅ 질문/요구 자동 인식
- ✅ 구조화된 글 생성 (서론, 본론, 결론)
- ✅ 마크다운 형식 지원
- ✅ 최소 길이 보장 (300-500자)
- ✅ 모든 LLM 제공자 지원

### 5. 백엔드 API (34개 엔드포인트) ✅
- ✅ 인증 시스템 (7개)
- ✅ 대화 API (1개)
- ✅ 보안 시스템 (5개)
- ✅ 사용자 관리 (4개)
- ✅ 프로젝트 관리 (5개)
- ✅ 시스템 모니터링 (6개)
- ✅ 테스트 및 유틸리티 (6개)

### 6. NotebookLM 스타일 기능 (2026년 2월) 🆕
- ✅ 스튜디오 출력 (보고서·퀴즈·플래시카드·요약 등 10종)
- ✅ 스튜디오 출력 저장·생성 이력·보기/삭제
- ✅ 스튜디오 메모 (프로젝트별 로컬 저장)
- ✅ AI 오디오 (Web Speech API 음성으로 듣기)
- ✅ 노트북 소스 분석 (키워드·미리보기·소스 목록)
- ✅ 소스 선택 체크박스 (대화 반영용, 분석 모달)
- ✅ 추천 질문 (소스 기반 추천 질문 칩)
- ✅ 노트북 설정 모달 (이름·설명·태그·가이드라인)
- ✅ 노트북 공유 (ProjectShareDialog 링크 생성)
- ✅ 전체/추천 탭 (추천: 학습·연구·업무 노트 템플릿)
- ✅ 웹/Fast Research (WebResearchModal, web-research API, 소스 추가)
- ✅ Deep Research (DeepResearchModal·web-research API·소스 추가)
- ✅ Drive 연동 스텁 (준비 중 모달)
- ✅ 소스 선택 → source_ids API 전달 (노트북 LLM·대화, 백엔드 필터링)
- ✅ 프로젝트 정렬 (최신순·이름순·소스순)
- ✅ 소스 추가 후 프로젝트 목록 갱신 (source_count 반영)
- ✅ PRO 배지 (사이드바, 준비 중 스텁)

### 7. 문서화 ✅
- ✅ README
- ✅ 설정 가이드
- ✅ 개발 가이드
- ✅ LLM 가이드
- ✅ 프로젝트 가이드
- ✅ 사용 가이드
- ✅ 긴 글 생성 기능 가이드 🆕
- ✅ 완료 보고서

---

## 📊 통계

- **총 API 엔드포인트**: 34개
- **프론트엔드 컴포넌트**: 1개 (ChatGPTInterface)
- **지원 LLM**: 4개 (OpenAI, Anthropic, Ollama, 노트북 LLM)
- **프로젝트 기능**: 완전 구현
- **문서 파일**: 25+ 개
- **테스트 스크립트**: 4개
- **실행 스크립트**: setup.sh, start_all.sh, stop_all.sh, install-plugins.sh

---

## 🎯 주요 특징

### 1. ChatGPT 스타일 인터페이스
- 직관적이고 아름다운 UI
- 실시간 대화
- 마크다운 지원
- 대화 관리

### 2. 프로젝트 관리
- 프로젝트별 대화 분리
- 프로젝트 컨텍스트 활용
- 직관적인 UI

### 3. 다중 LLM 지원
- OpenAI, Anthropic, Ollama
- 노트북 LLM (하이브리드 모드)
- 폴백 모드

### 4. 지식 베이스
- 기본 지식 저장
- 주제별 분류
- FAQ 지원

### 5. 긴 글 자동 생성 🆕
- 자동 키워드 감지
- 구조화된 글 생성
- 마크다운 형식
- 모든 LLM 지원

---

## 🚀 실행 방법

### 빠른 시작

```bash
# 1. 의존성 설치 (한 번에)
./setup.sh

# 2. 시스템 실행
./start_all.sh

# 종료
./stop_all.sh
```

### 접속

- **프론트엔드**: http://localhost:3000
- **백엔드·통합 API (기본 5002)**: http://localhost:5002/api/docs

### 유틸리티

```bash
npm run check:system    # 시스템 상태 확인
./install-plugins.sh    # OCR, yt-dlp, Ollama 등 추가 기능
```

---

## 📚 문서 목록

### 기본 가이드
1. [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - 명령어·접속 한눈에
2. [START_HERE.md](./START_HERE.md) - 빠른 시작
3. [README.md](./README.md) - 프로젝트 개요
4. [USAGE_GUIDE.md](./USAGE_GUIDE.md) - 사용 가이드

### 기능 가이드
5. [LONG_FORM_WRITING_FEATURE.md](./LONG_FORM_WRITING_FEATURE.md) - 긴 글 생성 기능 🆕
6. [backend/LONG_FORM_WRITING_IMPLEMENTATION.md](./backend/LONG_FORM_WRITING_IMPLEMENTATION.md) - 구현 상세 🆕

### 설정 가이드
7. [COMPLETE_SETUP.md](./COMPLETE_SETUP.md) - 완전한 설정
8. [SETUP_GUIDE.md](./SETUP_GUIDE.md) - 상세 설정
9. [PLUGINS_SETUP.md](./PLUGINS_SETUP.md) - 플러그인 설치 (OCR, yt-dlp, Ollama)
10. [RUN_GUIDE.md](./RUN_GUIDE.md) - 실행 가이드

### LLM 가이드
11. [README_LLM.md](./README_LLM.md) - LLM 빠른 시작
12. [backend/LLM_SETUP_GUIDE.md](./backend/LLM_SETUP_GUIDE.md) - LLM 설정

### 개발 가이드
13. [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) - 개발 로드맵
14. [DEVELOPMENT_SUMMARY.md](./DEVELOPMENT_SUMMARY.md) - 개발 요약
15. [COMPLETE_SYSTEM_SUMMARY.md](./COMPLETE_SYSTEM_SUMMARY.md) - 시스템 요약

### 완료 보고서
16. [PROJECT_AND_NOTEBOOK_LLM_COMPLETE.md](./PROJECT_AND_NOTEBOOK_LLM_COMPLETE.md) - 프로젝트 및 노트북 LLM
17. [FINAL_PROJECT_LLM_STATUS.md](./FINAL_PROJECT_LLM_STATUS.md) - 최종 상태
18. [COMPLETE_FEATURES_SUMMARY.md](./COMPLETE_FEATURES_SUMMARY.md) - 기능 요약
19. [FINAL_COMPLETE_REPORT.md](./FINAL_COMPLETE_REPORT.md) - 최종 완료 보고서
20. [UPDATE_LOG.md](./UPDATE_LOG.md) - 업데이트 로그 🆕
21. [COMPLETE_FEATURES_2025.md](./COMPLETE_FEATURES_2025.md) - 완전한 기능 목록 (이 문서) 🆕

---

## ✅ 최종 체크리스트

### 개발
- [x] 프론트엔드 구현
- [x] 백엔드 API 구현
- [x] 프로젝트 기능
- [x] LLM 연동
- [x] 노트북 LLM 통합
- [x] 지식 베이스 구축
- [x] 긴 글 자동 생성 🆕
- [x] 에러 처리
- [x] 입력 검증

### 테스트
- [x] 통합 테스트
- [x] LLM 테스트
- [x] 프로젝트 테스트
- [x] 긴 글 생성 테스트 🆕
- [x] 에러 시나리오 테스트

### 문서화
- [x] README 작성
- [x] 설정 가이드
- [x] 개발 가이드
- [x] LLM 가이드
- [x] 사용 가이드
- [x] 긴 글 생성 가이드 🆕
- [x] 완료 보고서
- [x] 업데이트 로그 🆕

---

## 🎉 결론

**CORBU.AI 시스템이 완전히 구축되었습니다!**

**주요 성과**:
- ✅ ChatGPT 스타일 인터페이스
- ✅ 프로젝트 관리 시스템
- ✅ 다중 LLM 지원 (OpenAI, Anthropic, Ollama, 노트북 LLM)
- ✅ 지식 베이스 시스템
- ✅ 대화 컨텍스트 관리
- ✅ 프로젝트별 대화 분리
- ✅ **긴 글 자동 생성** 🆕
- ✅ 완전한 문서화
- ✅ 포괄적인 테스트 도구

**시스템 상태**: 🟢 **완전히 구동 가능**

**다음 단계**:
```bash
./stop_all.sh   # 기존 프로세스 종료 (필요시)
./start_all.sh  # 서버 실행
npm run check:system  # 상태 확인
```

---

**개발 완료! 🎉**

**시스템이 완전히 준비되었습니다!**

