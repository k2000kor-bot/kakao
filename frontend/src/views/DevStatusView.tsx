/**
 * 개발 현황 뷰 — 지금까지 개발·반영된 기능을 프론트에서 확인
 * docs/FRONTEND_CHANGES.md, docs/WHAT_IS_THIS.md 내용을 화면에 출력
 */
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ChatInterface, ChatView, type ChatInterfaceProps } from '../components/LazyComponents';
import ErrorBoundary from '../components/ErrorBoundary';
import { createMinimalChatViewProps } from '../components/Chat/chatViewDemoProps';
import { UPDATE_NOTICE } from '../constants/updateNotice';

const SUMMARY = {
  title: '이걸 뭐 하려는 거야?',
  oneLiner: 'CORBU.AI는 ChatGPT처럼 대화하고, 프로젝트별로 정리하고, 목소리 생성 같은 도구까지 쓰는 AI 어시스턴트 웹앱입니다.',
  features: [
    { name: '일반 대화', desc: '홈(/)에서 프로젝트와 분리된 질문·답변. 여러 대화 생성, 사이드바에서 이전 대화로 이동.' },
    { name: 'AI 에이전트', desc: '홈 입력창의 "✨ 에이전트" 버튼 또는 사이드바 도구 → 에이전트로 전문 AI 에이전트와 대화 시작.' },
    { name: '프로젝트', desc: '주제별로 대화를 묶음. 프로젝트를 선택하면 프로젝트 대화(/projects/:id)에서 대화·소스·자료를 관리합니다.' },
    { name: '목소리 생성', desc: '텍스트를 음성으로 변환(TTS). 사이드바 도구 → 목소리 생성.' },
    { name: '시스템 대시보드', desc: 'CPU·메모리·네트워크 실시간 상태와 AI 엔진 모니터링. 홈 탭 또는 /dashboard 라우트.' },
    { name: '홈 포털 탭', desc: '루트(/) 홈이 탭 기반 포털로 재구성. 시스템 대시보드·AI 에이전트·분석·자동화·템플릿·검색·커뮤니티·팀·학습·설정 10개 탭. Ctrl+1~0 단축키, localStorage 탭 위치 유지.' },
    { name: '설정·분석·도움말', desc: '홈 탭 또는 사이드바 "더 보기"로 설정·분석·도움말 접근.' },
  ],
  layout: '왼쪽 사이드바: 로고, 새 대화, 대화 검색, 프로젝트 목록, 도구(에이전트·목소리 생성·대시보드), 대화 목록. 접기/펼치기·모바일에서는 메뉴 버튼으로 열기. 가운데 메인: 홈 포털(/) — 입력창 + 10탭(대시보드·에이전트·분석·자동화·템플릿·검색·커뮤니티·팀·학습·설정). AI 에이전트(/agents)·프로젝트(/projects)·프로젝트 대화(/projects/:id)·목소리 생성·대시보드·설정 등.',
};

const CHANGES: { category: string; items: { file: string; desc: string }[] }[] = [
  {
    category: '통합 레이아웃 (AppUnified)',
    items: [
      { file: 'src/index.tsx', desc: '앱 진입점을 AppUnified로 사용 (2단: 사이드바 + 메인)' },
      { file: 'src/AppUnified.tsx', desc: '좌측 사이드바 + 메인. 로고·토글·더보기·새 대화·대화 검색·프로젝트·도구·대화 목록' },
      { file: 'src/App.css', desc: '사이드바 스타일, 모바일 .mobile-open, 브레이크포인트 var(--breakpoint-md)' },
      {
        file: 'src/components/LazyComponents.tsx',
        desc: 'ChatInterface·ChatView·패널 전부: LazyChunk·(Lazy) 래퍼·LazyProps(하단 export type·ModernChatInterface 브레드크럼·알림·검색·글쓰기·고급기능·세션 등 satisfies·패널 props useMemo·콜백 useCallback)·withLazyLoading(…)·SuspenseWrapper LazyComponentsSuspenseWrapper·displayName 규칙(파일 주석). realTimeSyncJestMock·ChatView.test·/dev-status·projectHasFiles·첨부 힌트 OR',
      },
      {
        file: 'src/ModernChatInterface.tsx',
        desc: 'LazyComponents 지연 패널 + type LazyProps — satisfies 스프레드·성능 대시보드·브레드크럼·알림·검색·고급검색·세션·설정·단축키 도움말 등 props useMemo·고급기능·글쓰기(onGenerate) 패널은 콜백 useCallback+useMemo(파일 주석·LazyComponents.tsx와 대응)',
      },
      {
        file: 'src/components/Chat/chatViewDemoProps.ts',
        desc: 'ChatView 최소 props 팩토리 — ChatView.test와 /dev-status Lazy ChatView 데모가 공유',
      },
      {
        file: 'src/test-utils/realTimeSyncJestMock.ts',
        desc: 'Jest용 realTimeSync 모듈 팩토리 — LazyComponents.test에서 ChatView+Suspense 시 WebSocket 로그 방지',
      },
      {
        file: 'src/components/__tests__/LazyComponents.test.tsx',
        desc: 'ChatInterface·ChatView lazy 스모크·LazyProps re-export 런타임 샘플(onGenerate 포함)·SuspenseWrapper export·동기 자식 렌더 스모크·Lazy 청크·패널(Lazy) displayName 일괄 단언·displayName LazyComponentsSuspenseWrapper·withLazyLoading·realTimeSync mock·11 tests',
      },
    ],
  },
  {
    category: '사이드바 동작',
    items: [
      { file: 'src/AppUnified.tsx', desc: '대화 목록에서 항목 선택 시 해당 항목만 active 표시 (conversationId 기준)' },
      { file: 'src/utils/chatInputUtils.ts', desc: '대화 목록 제목: conversationListTitleFromUserMessage, 첫 답변 후 resolveListTitleAfterAssistantReply(명시 제목·API 생성·빈 답 시 유지)' },
      { file: 'src/utils/buildUnifiedQaGensparkPipelineContextMerge.ts', desc: 'Q→A·Genspark context 병합; pipelineMerge에 항상 input_intent_hint(parseInputIntent)' },
      { file: 'src/services/modernChatContextBuilder.ts', desc: 'mergeApiChatContextPayload: 통합 context 시 input_intent_hint 없으면 parseInputIntent(원문)으로 보강' },
      { file: 'src/components/ChatGPTInterface.tsx', desc: '사이드바 ↔ 대화 동기화·목록 제목(첫 사용자 턴·기본 제목 시)·홈 질의 자동전송(marketingComposerAutoSend). 스트림·비스트림·재생성·편집, location.state 동기화' },
    ],
  },
  {
    category: '아이콘',
    items: [
      { file: 'src/components/Icons/BrainwaveIcons.tsx', desc: 'Figma 스타일 24×24 아이콘 (로고·편집·검색·폴더·목소리·메시지 등)' },
      { file: 'src/AppUnified.tsx', desc: '새 대화(IconEdit), 대화 검색, 프로젝트(IconFolder+Plus), 목소리(IconVolume), 대화(IconMessage)' },
    ],
  },
  {
    category: '반응형·접근성',
    items: [
      { file: 'src/App.css', desc: '모바일 미디어 쿼리 var(--breakpoint-md) 통일' },
      { file: 'src/styles/responsive.css', desc: '모바일 메뉴 버튼 터치 타겟, :focus-visible 포커스 링' },
      {
        file: 'src/components/ChatGPTInterface.css',
        desc: 'prefers-reduced-motion: 루트 .chatgpt-interface 하위 전역으로 전환·애니메이션 최소화(다단계 컴포저·툴바 포함); 컴포저 전용 중복 미디어쿼리 제거',
      },
    ],
  },
  {
    category: '에러 처리',
    items: [
      { file: 'src/components/ErrorBoundary.tsx', desc: '홈으로 돌아가기 버튼 추가 (다시 시도·새로고침과 함께)' },
      { file: 'src/components/ErrorBoundary.css', desc: '에러 액션 영역 flex-wrap' },
    ],
  },
  {
    category: '린트·테스트',
    items: [
      { file: '.eslintrc.js', desc: 'setupTests·*.test·__tests__에서 import/first off (jest.mock·installJestFetchMock·소스맵 순서)' },
      { file: 'src/services/websocket.ts', desc: 'import 순서 정리(errorLogger를 상단으로)' },
      { file: 'package.json', desc: 'Jest는 CRA 허용 옵션만 유지(watchPathIgnorePatterns·moduleNameMapper·testMatch); react-scripts가 setupTests 자동 로드' },
      { file: 'src/utils/__tests__/streamingClient.test.ts', desc: 'streamChatMessage: 빈 context여도 merge 후 input_intent_hint 포함 검증' },
      { file: 'src/utils/__tests__/apiClient.test.ts', desc: 'sendChatMessage: 빈 context여도 merge 후 input_intent_hint 포함 검증' },
      { file: 'src/services/__tests__/unifiedAPI.test.ts', desc: 'buildUnifiedApiChatRequestBody: 빈 context 시 input_intent_hint·통합 context=0 비포함' },
      { file: 'src/services/__tests__/fileAnalysisChatContextMerge.test.ts', desc: 'FileAnalysis merge 결과에 input_intent_hint 포함' },
      { file: 'src/services/__tests__/ultimateChatContextMerge.test.ts', desc: 'Ultimate merge 결과에 input_intent_hint 포함' },
      { file: 'src/services/__tests__/integratedMessageService.test.ts', desc: 'IntegratedMessageService CHAT_POST: 빈 chatContext 시 input_intent_hint·통합 context=0 비포함' },
      { file: 'src/services/__tests__/integratedSystemAPI.test.ts', desc: 'IntegratedSystemAPI sendMessage: 빈 context 시 input_intent_hint·통합 context=0 비포함' },
      {
        file: 'src/components/__tests__/ChatGPTInterface.test.tsx',
        desc: 'ChatGPTInterface 통합 테스트 — ChatGPTInterface가 LazyComponents를 쓰지 않으므로 불필요 jest.mock 제거',
      },
      { file: 'src/services/__tests__/unifiedMessageService.test.ts', desc: 'unifiedMessageService processMessage(chat): 빈 context 시 input_intent_hint·통합 context=0 비포함' },
      { file: 'src/services/__tests__/chatService.test.ts', desc: 'ChatService sendMessage(unifiedAPI): 빈 context 시 input_intent_hint·통합 context=0 비포함' },
      {
        file: 'src/hooks/useChatEnhancements.ts',
        desc: 'ChatView·LazyComponents 경로: 언마운트 후 setState 방지(isMountedRef)·스마트 제안 800ms 타이머 정리. hooks/__tests__/useChatEnhancements.test 언마운트 취소 단언',
      },
    ],
  },
  {
    category: '파이프라인 튜닝·내부 보안 (관리)',
    items: [
      { file: 'src/views/PipelineTuningView.tsx', desc: '/pipeline-tuning — GET /api/pipeline-tuning·/api/llm-internal-security 조회 UI' },
      { file: 'src/services/pipelineTuningService.ts', desc: '튜닝 설정·LLM 내부 보안 상태 fetch 헬퍼' },
      { file: 'src/AppUnified.tsx', desc: 'PIPELINE_TUNING_PATH 라우트·lazy 로드' },
    ],
  },
  {
    category: '문서·배포',
    items: [
      { file: 'docs/WHAT_IS_THIS.md', desc: '이걸 뭐 하려는 거야? 한눈에 보기' },
      { file: 'docs/FRONTEND_CHANGES.md', desc: '프론트엔드 변경 사항 요약' },
      { file: 'docs/guides/CHAT_ANSWER_FLOW_VERIFICATION.md', desc: '대화 입력→질문 표시→답변 생성·품질 흐름 검증' },
      { file: 'docs/guides/CHAT_UI_TEST_SCENARIOS.md', desc: '대화 UI·접근성·품질 수동 확인 시나리오' },
      { file: 'docs/guides/ANSWER_QUALITY_AND_SEARCH.md', desc: '답변 품질·검색·자료 활용·생성 능력 최대 활용' },
      { file: 'docs/DEEPSEEK_SETUP.md', desc: '딥시크 설치형/API·동작 체크리스트' },
      { file: 'docs/DEEPSEEK_INSTALL_RUN_DEVELOP_LEARN.md', desc: '딥시크 설치→구동→개발→학습 한 흐름' },
      { file: 'package.json', desc: 'deploy:server 스크립트 (deploy:check + deploy:dev)' },
      { file: 'src/views/DevStatusView.tsx', desc: '/dev-status 검증·배포 섹션 data-testid(dev-status-verify-section)·verify:final·FINAL_CHECKLIST·SKIP/FAIL 안내, test:views 22·142' },
      { file: 'src/views/DevStatusView.test.tsx', desc: 'verify:final·SKIP 안내·검증 section within(restart:backend·§8)·CHANGES 단언(LazyChunk·LazyProps satisfies·useMemo·useCallback·글쓰기onGenerate·ModernChat·displayName·LazyComponentsSuspenseWrapper 2곳)·LazyComponents.test·ChatGPTInterface.test·Lazy Chat 데모, test:views 수치 등 13 tests' },
    ],
  },
  {
    category: '시스템 대시보드 통합',
    items: [
      { file: 'src/components/IntegratedDashboard.tsx', desc: '실시간 CPU·메모리·네트워크·AI 엔진 모니터링. 메트릭 임계값 기반 알림(warning/error/info)·자동새로고침·알림 토글·갱신 간격 선택. FAB→메모리 최적화 실행 + toast 피드백.' },
      { file: 'src/config/routes.ts', desc: 'DASHBOARD_PATH = "/dashboard" 추가, allAppPaths 포함.' },
      { file: 'src/components/Icons/BrainwaveIcons.tsx', desc: 'IconDashboard SVG 컴포넌트 추가.' },
      { file: 'src/AppUnified.tsx', desc: 'IntegratedDashboard lazy import·/dashboard 라우트·사이드바 도구 섹션에 대시보드 NavLink(IconDashboard) 추가.' },
      { file: 'src/components/WelcomeWorkspacePanel.tsx', desc: '워크스페이스 도구 스트립에 대시보드(/dashboard) 항목 추가.' },
    ],
  },
  {
    category: 'AI 에이전트 홈 통합',
    items: [
      { file: 'src/views/GensparkMarketingHomeView.tsx', desc: '홈 입력창 하단 불필요 요소(음성 배너·도구 스트립) 제거. "✨ 에이전트" CTA 버튼 추가 — Super Agent 경로로 입력 초안 자동전송.' },
      { file: 'src/config/uiPreferences.ts', desc: 'isMarketingDraftEligiblePath — 독립 대화 및 에이전트 경로 모두 초안 자동전송 허용.' },
      { file: 'src/components/ChatGPTInterface.tsx', desc: 'isMarketingDraftEligiblePath 사용으로 에이전트 뷰에서도 초안 자동전송 지원.' },
      { file: 'src/components/WorkspaceQueryComposer.tsx', desc: '툴바 왼쪽 "✨" 에이전트 목록 버튼 추가. 중복 버튼 제거.' },
    ],
  },
  {
    category: '대화 제목 자동 생성 개선',
    items: [
      { file: 'src/utils/chatInputUtils.ts', desc: 'extractMeaningfulTitleFromInput 추가 — URL+지시문 패턴 입력 시 URL 이후 의미있는 한국어 텍스트 추출, 대괄호 지시문 자동 제거. URL만 있을 경우 도메인으로 간결화.' },
      { file: 'src/components/ChatGPTInterface.tsx', desc: 'generateConversationTitle: 백엔드 CHAT_TITLE API 반환값도 30자 상한 강제. localStorage 로딩 시 60자 초과 제목 자동 정규화. saveConversationsToStorage에서 저장 시 30자 초과 제목 절단 보장.' },
    ],
  },
  {
    category: '대시보드 UX 개선',
    items: [
      { file: 'src/components/IntegratedDashboard.tsx', desc: '알림 개별 닫기(X) 버튼·"모두 지우기" 버튼 추가. 디스크 사용률을 이력 추이 차트(LineChart)에 추가(녹색 점선). dismissAlert·clearAllAlerts 콜백 구현.' },
      { file: 'src/components/__tests__/IntegratedDashboard.test.tsx', desc: '알림 관리 기능 테스트(모두 지우기 버튼 표시, 닫기 버튼 존재) 추가. Close·DeleteSweep 아이콘 mock 추가. 25 tests.' },
    ],
  },
  {
    category: '사이드바 대화 날짜 그룹화',
    items: [
      { file: 'src/AppUnified.tsx', desc: 'getSidebarDateGroup 함수 추가 — 오늘·어제·이번 주·이전으로 대화 분류. 검색 중에는 평면 목록, 기본 상태에서는 DATE_GROUP_ORDER 순 헤더+항목 렌더링. flatMap으로 그룹별 헤더(sidebar-date-group-header) + 행 조합 출력.' },
      { file: 'src/App.css', desc: '.sidebar-date-group-header 스타일 추가 — 소문자 대문자·letter-spacing·접힌 사이드바에서 숨김.' },
    ],
  },
  {
    category: '사이드바 핀 고정 대화',
    items: [
      { file: 'src/AppUnified.tsx', desc: 'SidebarChatItem에 pinned?: boolean 필드 추가. loadSidebarChats에서 localStorage pinned 값 로드. 정렬 시 핀된 항목 맨 앞 배치. 사이드바 그룹 렌더링에 "고정됨" 섹션 추가 — 핀된 대화 분리 표시. SidebarConversationRow에 📌 아이콘 표시 (pinned=true 시).' },
      { file: 'src/App.css', desc: '.sidebar-chat-pin-icon 스타일 추가 — 작은 크기·반투명·인라인 표시.' },
    ],
  },
  {
    category: '에이전트 허브 카테고리 필터',
    items: [
      { file: 'src/services/gensparkAgentRegistry.ts', desc: 'GensparkAgentCategory 타입 추가(전체·과업·연동·분석·글쓰기). RegisteredEntry에 category 필드 추가. listRegisteredGensparkAgents 반환값에 category 포함. 각 등록 에이전트에 카테고리 부여.' },
      { file: 'src/views/GensparkAgentsHubView.tsx', desc: 'ALL_CATEGORIES 상수 추가. activeCategory state 추가. availableCategories — 에이전트가 있는 카테고리만 동적 표시. agents useMemo에 카테고리·검색 AND 필터 적용. 카테고리 탭 UI(role=tablist) 추가 — 각 탭 개수 뱃지 표시. 카드에 카테고리 색상 뱃지(.genspark-home-card-pill--cat) 표시.' },
      { file: 'src/views/GensparkAgentsHubView.css', desc: '카테고리 탭(.genspark-home-category-tab) 스타일 — 라운드 필·호버·활성 상태. 카드 뱃지 색상(과업:보라, 연동:파랑, 분석:초록, 글쓰기:노랑). 다크모드 대응.' },
    ],
  },
  {
    category: '대시보드 CSV 내보내기 · 네트워크 차트 · 임계값 설정',
    items: [
      { file: 'src/components/IntegratedDashboard.tsx', desc: 'AlertThresholds 인터페이스 추가(CPU·메모리·응답시간 경고/위험). MetricHistoryPoint에 network 필드 추가. exportMetricsCSV 함수 — 이력 CSV 파일 다운로드(UTF-8 BOM). 차트에 네트워크 % 파란 점선 라인 추가. 설정 다이얼로그에 임계값 슬라이더 UI 추가. fetchData·WebSocket 핸들러에서 network 기록. fetchData 알림 생성 및 응답시간 카드가 사용자 정의 임계값 참조.' },
    ],
  },
  {
    category: 'AnalyticsView 로컬 대화 통계',
    items: [
      { file: 'src/views/AnalyticsView.tsx', desc: 'computeLocalConvStats — localStorage 기반 전체·오늘·핀 대화 수와 7일 추이 계산(백엔드 불필요). LocalConvStats 인터페이스. 통계 카드 4개(전체·전체 메시지·오늘·핀) + 7일 LineChart. StorageEvent로 다른 탭 변경 시 자동 갱신. LineChart import 추가.' },
      { file: 'src/App.css', desc: '.bw-analytics-stat-cards·.bw-analytics-stat-card·.bw-analytics-stat-card--highlight(보라 강조)·다크모드 대응 스타일 추가.' },
    ],
  },
  {
    category: '글로벌 키보드 단축키',
    items: [
      { file: 'src/AppUnified.tsx', desc: 'shortcutsOpen state 추가. 글로벌 keydown useEffect — Ctrl+K(대화 검색 포커스·사이드바 펼치기), Ctrl+/(단축키 모달 토글), Esc(모달 닫기). 단축키 도움말 <dialog> 모달 추가(kbd 테이블·Mac 안내). 사이드바 푸터에 ⌨️ 단축키 버튼 추가.' },
      { file: 'src/App.css', desc: '.shortcuts-dialog·.shortcuts-table·.shortcuts-table kbd·.shortcuts-dialog-hint·.sidebar-shortcuts-btn 스타일 추가. 다크모드 대응.' },
    ],
  },
  {
    category: 'SettingsView 화면 설정·데이터 관리·단축키',
    items: [
      { file: 'src/views/SettingsView.tsx', desc: '화면 설정 섹션 — 글꼴 크기 4단계(작게~매우 크게) 토글, --app-font-size-base CSS 변수 즉시 적용·localStorage 저장. 대화 데이터 관리 섹션 — 대화/전체 localStorage 사용량(KB) 표시, "모든 대화 삭제" 2단계 확인 후 실행·sidebar-chats-updated 이벤트 디스패치·toast 피드백. 키보드 단축키 섹션 — 주요 단축키 표(kbd 태그).' },
      { file: 'src/App.css', desc: '.bw-settings-storage-info·.bw-btn-danger·.bw-settings-shortcuts-list·.bw-settings-shortcut-row·.bw-settings-font-size-group 스타일 추가.' },
    ],
  },
  {
    category: 'AutomationView 인터랙티브 워크플로우 관리',
    items: [
      { file: 'src/views/AutomationView.tsx', desc: 'WorkflowItem·RunItem 인터페이스 정의. localStorage(corbu.automation.workflows·runs)로 워크플로우 및 실행 이력 지속. toggleStatus(활성/일시정지), manualRun(1.2초 시뮬레이션·성공/실패 기록), addWorkflow(모달), deleteWorkflow. "새 워크플로우" <dialog> 모달(이름·트리거 선택·Enter 제출). 실행 이력 자동 갱신(최대 20개). 상태 배지: bw-badge-soft--success·error 적용.' },
      { file: 'src/App.css', desc: '.bw-badge-soft--success·.bw-badge-soft--error 다크모드 포함. dialog.modal-overlay·.modal-dialog·.modal-header·.modal-title·.modal-close-btn 공통 모달 스타일 추가.' },
    ],
  },
  {
    category: 'BillingView 인터랙티브 플랜·결제 수단·사용량',
    items: [
      { file: 'src/views/BillingView.tsx', desc: 'SavedCard 인터페이스·localStorage(corbu.billing.currentPlan·cards)로 선택 플랜·결제 수단 지속. selectPlan — 플랜 선택 시 state+localStorage 업데이트·toast 피드백. addCard·removeCard — 카드 이름·끝4자리·만료일 입력 모달, 삭제 버튼. 사용량 바: 70% 이상 노란색(--warn), 90% 이상 빨간색(--danger). 청구 내역 상태 배지 성공 녹색 처리.' },
      { file: 'src/styles/brainwave-global.css', desc: '.bw-tool-plan-card--active(초록 테두리), .bw-progress-fill--warn(노란색), .bw-progress-fill--danger(빨간색) 추가.' },
    ],
  },
  {
    category: 'CommunityView 인터랙티브 포럼',
    items: [
      { file: 'src/views/CommunityView.tsx', desc: 'LocalPost 인터페이스·localStorage(corbu.community.posts·likes). DEFAULT_POSTS 3개 기본 게시글. 글쓰기 <dialog> 모달(제목·분류·작성자·내용). 카테고리 필터 탭(전체·질문·팁·아이디어·공지). 게시글 좋아요 토글(localStorage 개인화). 게시글 삭제. 지식공유 버튼 toast 피드백. 새 게시글은 목록 상단 추가.' },
      { file: 'src/App.css', desc: '.community-cat-tabs·.community-cat-tab(--active)·.community-cat-count·.community-post-row·.community-post-meta·.community-like-btn(--active)·.community-delete-btn·카테고리별 배지 색상(질문/팁/아이디어/공지)·다크모드 대응 추가.' },
    ],
  },
  {
    category: 'TeamView 인터랙티브 멤버 관리',
    items: [
      { file: 'src/views/TeamView.tsx', desc: 'LocalMember 인터페이스·localStorage(corbu.team.members). DEFAULT_MEMBERS 3명. 팀원 초대 <dialog> 모달(이름·이메일·역할·Enter 제출). 역할 변경 select(뷰어/편집자/관리자). 활성/비활성 토글. 멤버 삭제 🗑 버튼. bw-badge-soft--success(활성)·--error(비활성) 배지 적용.' },
      { file: 'src/App.css', desc: '.team-role-select 스타일(다크모드 포함) 추가.' },
    ],
  },
  {
    category: 'DocsView 인터랙티브 문서·FAQ·단축키',
    items: [
      { file: 'src/views/DocsView.tsx', desc: '빠른 시작 CTA(대화 시작·에이전트·대시보드 버튼). 가이드 카드 그리드(6개 문서·아이콘). FAQ 아코디언 10개 항목(검색 필터·useMemo). 단축키 표(kbd 태그). FaqItem 서브컴포넌트(useState 토글·aria-expanded). useNavigate로 빠른 시작 CTA 연결.' },
      { file: 'src/App.css', desc: '.docs-guide-grid·.docs-guide-card·.docs-quickstart-card·.docs-faq-list·.docs-faq-item(--open)·.docs-faq-q·.docs-faq-a·.docs-kbd·다크모드 대응 추가.' },
    ],
  },
  {
    category: 'FeaturesMapView 전체 기능 목록 업데이트',
    items: [
      { file: 'src/views/FeaturesMapView.tsx', desc: '도구(대시보드·TTS·대화관계도), 커뮤니티·팀(포럼·팀관리), 콘텐츠·자동화(워크플로우·템플릿·학습), 분석·결제(통계·검색·구독), 설정(화면·데이터·단축키) 5개 섹션 추가. quickLinks에 대시보드·자동화 추가.' },
    ],
  },
  {
    category: '홈 포털 탭 기반 재구성',
    items: [
      {
        file: 'src/views/GensparkMarketingHomeView.tsx',
        desc: '루트(/) 홈을 탭 기반 포털로 재구성. 13개 탭(🏠홈요약·🖥️대시보드·✨에이전트·📈분석·⚡자동화·📋템플릿·🔍검색·💬커뮤니티·👥팀·🎓학습·💳구독·📖도움말·⚙️설정). 각 탭은 해당 서브페이지 컴포넌트를 그대로 렌더. Ctrl+1~0 단축키·Ctrl+Tab 순환·화살키 네비. localStorage(corbu.home.activeTab) 탭 위치 유지. 입력영역·탭바 sticky 고정, 탭 전환 페이드 애니메이션.',
      },
      {
        file: 'src/views/GensparkMarketingHomeView.css',
        desc: '.gs-home__input-zone sticky(z-index 5)·.gs-home__tabs sticky(z-index 4). .gs-embed — 서브페이지 외부 박스 padding/bg/border/shadow 제거. 탭 페이드 @keyframes gs-tab-fade-in. 다크모드 완벽 대응.',
      },
      {
        file: 'src/views/HomeOverviewTab.tsx',
        desc: '홈 요약 탭. localStorage에서 대화수·활성워크플로우·팀원수·커뮤니티글·완료강의·구독플랜 6개 통계 카드 표시. 최근 활동 목록(대화·포스트·자동화 실행). 9개 빠른 이동 버튼. 항목 클릭 → 해당 페이지 navigate.',
      },
      {
        file: 'src/components/IntegratedDashboard.tsx',
        desc: '홈 탭 임베드. CPU·메모리·디스크·네트워크 실시간 차트, 트렌드 지표(▲▼), 세션 업타임 카운터, localStorage 사용량 카드(KB+퍼센트 바), 보안 알림, AI 엔진 상태, CSV 내보내기, 임계값 커스터마이징.',
      },
    ],
  },
  {
    category: '글로벌 커맨드 팔레트 (Ctrl+K)',
    items: [
      {
        file: 'src/components/CommandPalette.tsx',
        desc: 'Ctrl+K(Cmd+K) 전역 단축키로 열리는 팔레트. 페이지·기능 이름/설명/경로/키워드 검색, 검색어 하이라이트, ↑↓ 이동·Enter 네비게이트·Esc 닫기. 20+개 라우트 등록(기본+확장+특수 명령). 하단 힌트바(결과 수). 다크모드 대응.',
      },
      {
        file: 'src/AppUnified.tsx',
        desc: 'CommandPalette 전역 마운트(Layout 안). Ctrl+K 전역 keydown 핸들러. 사이드바 footer에 ⌘K 힌트 버튼 추가. 단축키 도움말 테이블에 Ctrl+K·Ctrl+Tab 항목 추가.',
      },
    ],
  },
  {
    category: '대시보드 헬스 스코어·권장사항·빠른 조치',
    items: [
      {
        file: 'src/components/IntegratedDashboard.tsx',
        desc: '① 시스템 헬스 스코어(0~100): CPU·메모리·디스크·응답시간·오류율 5개 지표 감점 합산 역산, 우수/양호/주의/위험 4단계 컬러·라벨 원형 링 게이지. ② 성능 권장사항 패널: 지표별 🔴🟡🟢 심각도 권장사항 자동생성(모두 정상이면 안내 문구). ③ 빠른 조치 패널: 메트릭 CSV 내보내기(기존 차트 버튼과 별개), localStorage 스냅샷 JSON 다운로드, 30일 이상 오래된 대화 정리, 메트릭 즉시 새로고침.',
      },
    ],
  },
  {
    category: '커맨드 팔레트 최근 사용 내역 + 홈 대화 검색',
    items: [
      {
        file: 'src/components/CommandPalette.tsx',
        desc: '최근 사용 내역 localStorage 유지(corbu.cmdpalette.recent). 팔레트 열 때 최근 사용 섹션 상단 표시, 🕐 아이콘 강조. 검색어 없을 때 "모든 기능" 구분 섹션.',
      },
      {
        file: 'src/views/HomeOverviewTab.tsx',
        desc: '① 대화 빠른 검색 위젯: 저장된 대화 전체에서 제목·본문·메시지 내용으로 검색, 스니펫 표시, 클릭시 해당 대화로 이동. ② 고정된 대화(pinned:true) 섹션: 노란 pill 버튼으로 즉시 이동. ③ allConvs 상태로 검색 기반 제공.',
      },
    ],
  },
  {
    category: '사이드바 네비 배지',
    items: [
      {
        file: 'src/AppUnified.tsx',
        desc: 'navBadges 상태: localStorage에서 커뮤니티 새 글 수(마지막 방문 이후), 자동화 실패 건수를 실시간 계산. 사이드바 footer-right에 💬(커뮤니티) / ⚡(자동화 실패) 배지 버튼 표시. 커뮤니티 클릭 시 lastVisit 갱신 + 배지 초기화.',
      },
      {
        file: 'src/App.css',
        desc: '.sidebar-badge-btn, .sidebar-badge-dot, .sidebar-badge-dot--warn: 우측 상단 숫자 dot 배지 스타일. 사이드바 다크모드 연동.',
      },
    ],
  },
  {
    category: '[v2026.04.25-A] SearchView 통합 검색 + CommunityView 답글 + BillingView 차트 + SettingsView 프라이버시',
    items: [
      { file: 'src/views/SearchView.tsx', desc: '통합 검색 UnifiedResult 인터페이스 추가. 대화/템플릿/커뮤니티 3개 소스 동시 검색. 타입 필터 탭(전체·대화·템플릿·커뮤니티). 결과 클릭 시 해당 경로 이동.' },
      { file: 'src/views/CommunityView.tsx', desc: 'Reply 인터페이스 + COMMUNITY_REPLIES_KEY. 게시글 답글 토글, 답글 입력창, 답글 localStorage 영속. 커뮤니티 답글 CSS(.community-replies, .community-reply-*)' },
      { file: 'src/views/BillingView.tsx', desc: '월별 사용량 듀얼 Y축 BarChart(대화수+토큰). DEMO_INVOICES 인보이스 테이블. ⬇TXT 다운로드. Recharts import 추가.' },
      { file: 'src/views/SettingsView.tsx', desc: '데이터 프라이버시 섹션 추가: 전체 JSON 내보내기, 대화 기록 삭제, 캐시 정리, 전체 초기화(2중확인+1.8초 후 reload). privacy-action-grid CSS.' },
    ],
  },
  {
    category: '[v2026.04.25-B] IntegratedDashboard 로그 + AutomationView 편집기 + LearnView 체크리스트 + TeamView 초대링크',
    items: [
      { file: 'src/components/IntegratedDashboard.tsx', desc: '실시간 이벤트 로그 패널(최대 50건 localStorage 영속). pushLog 콜백 메트릭 임계값 초과 시 자동 기록. 로그 지우기/테스트 버튼.' },
      { file: 'src/views/AutomationView.tsx', desc: 'WorkflowCondition/WorkflowAction 인터페이스 추가. 워크플로우 ✏️ 편집 버튼. 조건(필드+연산자+값)+액션(타입+파라미터) 동적 행 추가/삭제 모달 편집기. localStorage 저장.' },
      { file: 'src/views/LearnView.tsx', desc: 'CheckItem 인터페이스, COURSE_CHECKLIST(4코스 11항목). 학습 체크리스트 섹션: 그라디언트 진행 바, 코스별 그룹, 완료 취소선, localStorage 영속, 초기화 버튼.' },
      { file: 'src/views/TeamView.tsx', desc: '초대 링크 생성 버튼 추가. btoa 토큰 기반 URL 생성, navigator.clipboard 자동 복사, 링크 박스 UI 표시+복사+닫기 버튼.' },
    ],
  },
  {
    category: '[v2026.04.25-C] DocsView 인앱문서 + HomeOverviewTab 퀵액션 + AppUnified 브레드크럼 + WorkspaceQueryComposer 파일첨부',
    items: [
      { file: 'src/views/DocsView.tsx', desc: 'DOC_ARTICLES(10개) + DOC_CATEGORIES(6개). 카테고리 탭필터 + 제목/본문/태그 전문검색. 아코디언 펼치기, 인라인 테이블 자동 렌더링, 태그 뱃지.' },
      { file: 'src/views/HomeOverviewTab.tsx', desc: '퀵 액션 타일 패널 추가(8개 타일). ho-quick-grid CSS. hover lift 애니메이션. 새 대화 타일 Primary 강조.' },
      { file: 'src/AppUnified.tsx', desc: 'buildBreadcrumbs + Breadcrumb 컴포넌트. BREADCRUMB_MAP 14개 경로. <main> 최상단 position:sticky 브레드크럼 바. 다크모드 지원.' },
      { file: 'src/components/WorkspaceQueryComposer.tsx', desc: 'dragOver/attachedFiles 상태. form onDragOver/onDrop 핸들러. 📎 파일 선택 버튼. 드롭 오버레이 + 첨부 파일 목록(타입 이모지·파일명·크기·삭제). 최대 5개 중복 차단.' },
    ],
  },
  {
    category: '[v2026.04.25-D] WhatsNew배너 + AnalyticsView 도넛차트 + HomeOverviewTab 애니숫자 + ChatGPT TXT내보내기',
    items: [
      { file: 'src/AppUnified.tsx', desc: 'WhatsNewBanner 컴포넌트. WHATS_NEW_VERSION 기반 localStorage dismissed 판정. 자세히 토글(pill 목록) + ✕ 닫기. 슬라이드인 애니메이션.' },
      { file: 'src/views/AnalyticsView.tsx', desc: 'TOPIC_KEYWORDS 5개 카테고리 키워드 분류. computeTopicDistribution. Recharts PieChart(innerRadius 도넛)+Cell 색상+Legend. 오른쪽 범례 리스트.' },
      { file: 'src/views/HomeOverviewTab.tsx', desc: 'useAnimatedNumber hook(easeOut cubic, rAF, 700ms). AnimatedStatValue 컴포넌트. rawValue 필드 추가 → 0에서 목표값까지 카운트업.' },
      { file: 'src/components/ChatGPTInterface.tsx', desc: 'exportConversation에 txt 포맷 추가. [사용자/AI HH:MM] 형식 평문. "보내기" 드롭다운에 "텍스트(.txt)" 버튼.' },
    ],
  },
  {
    category: '[v2026.04.25-E] IntegratedDashboard 스파크라인 + CommunityView 검색 + 사이드바 색상도트 + 이 변경이력',
    items: [
      { file: 'src/components/IntegratedDashboard.tsx', desc: 'MetricCard에 sparkData/sparkColor prop. useMemo로 SVG path 계산(easeOut). 우측 80×28 스파크라인 SVG + 마지막 점 강조 circle. CPU/메모리/디스크/네트워크 각각 고유 색상.' },
      { file: 'src/views/CommunityView.tsx', desc: 'postSearch/sortOrder 상태. filteredPosts에 텍스트 검색(제목·내용·작성자) + 정렬(최신/좋아요/댓글순). 검색바 + select 드롭다운 UI.' },
      { file: 'src/AppUnified.tsx', desc: 'CONV_CATEGORIES 키워드 배열 + getConvColor 함수. SidebarConversationRow 내 색상 dot(.sidebar-conv-dot) 조건부 표시. 코드/요약/분석/AI 4카테고리.' },
      { file: 'src/views/DevStatusView.tsx', desc: '이 항목 포함 v2026.04.25 시리즈 5개 변경 그룹 추가.' },
    ],
  },
  {
    category: '[v2026.04.25-F] 포커스모드 + AnalyticsCSV + AI추천프롬프트 + 탭배지',
    items: [
      { file: 'src/AppUnified.tsx', desc: 'focusMode 상태 추가. Ctrl+Shift+F 단축키로 사이드바 완전 숨김 토글. .sidebar--focus-hidden + .brainwave-main--focus 클래스. focus-mode-bar 배너 + 나가기 버튼. 단축키 도움말 업데이트.' },
      { file: 'src/views/AnalyticsView.tsx', desc: 'buildAnalyticsCsv / downloadCsv 유틸 함수 추가. 내보내기 섹션을 4-버튼 그리드(.analytics-export-grid)로 교체 — 전체/일별추이/주간비교/주제분포 각각 별도 CSV 다운로드.' },
      { file: 'src/views/HomeOverviewTab.tsx', desc: 'AI_PROMPT_POOL(12개), pickDailyPrompts(시드 기반 매일 6개 교체). AiSuggestedPrompts 컴포넌트 — ho-suggest-grid, 복사/시작 버튼, sessionStorage 프롬프트 전달.' },
      { file: 'src/views/GensparkMarketingHomeView.tsx', desc: 'tabBadges 상태 + recomputeBadges(community 미읽, automation 실패). 30초 interval + storage 이벤트 재계산. 탭 버튼 내 .gs-tab-badge(pop 애니메이션) 조건부 렌더.' },
    ],
  },
  {
    category: '[v2026.04.25-G] 음성입력 + 최근방문히스토리 + 임계값패널 + 변경이력',
    items: [
      { file: 'src/components/WorkspaceQueryComposer.tsx', desc: 'Web Speech API 내장 음성 입력. SpeechRecognition/webkitSpeechRecognition 탐지, ko-KR 설정. isListening 상태로 마이크 아이콘 ↔ 🎙 펄스 애니메이션 전환. wq-listening-hint 힌트 표시.' },
      { file: 'src/AppUnified.tsx', desc: 'RecentPagesDropdown 컴포넌트 + pushRecentPage 함수. 라우트 변경 시 BREADCRUMB_MAP 기반 페이지 기록(최대 8개). recent-pages-list 드롭다운 — 방문 시각, 기록 지우기 버튼.' },
      { file: 'src/components/IntegratedDashboard.tsx', desc: 'thresholds localStorage 영속화(corbu.dash.thresholds). thresholdPanelOpen 인라인 패널 — CPU/메모리/응답시간 경고·위험 슬라이더 6개, 현재값 뱃지 요약, 기본값 복원 Chip.' },
      { file: 'src/views/DevStatusView.tsx', desc: 'v2026.04.25-G 변경 이력 4항목 추가.' },
    ],
  },
  {
    category: '[v2026.04.25-H] pendingPrompt연동 + AccentColor + 커뮤니티공유 + 알림센터',
    items: [
      { file: 'src/views/GensparkMarketingHomeView.tsx', desc: 'sessionStorage "corbu.pendingPrompt" 마운트+window.focus 이벤트 감지. pendingPrompt 있을 때 overview 탭 전환 + textarea 자동 포커스. 홈 입력창으로 추천 프롬프트 원클릭 채우기 완성.' },
      { file: 'src/views/SettingsView.tsx', desc: 'ACCENT_COLOR_KEY(corbu.settings.accentColor). ACCENT_PRESETS 8종 + color picker. applyAccentColor()로 --accent-primary CSS 변수 즉시 적용. AppUnified 초기화 시 저장값 자동 적용.' },
      { file: 'src/views/CommunityView.tsx', desc: '게시글 카드에 🔗 공유 버튼 추가(navigator.clipboard). textarea에 Ctrl+Enter 단축키로 게시. 글자 수 카운터(0/1000) 및 단축키 안내 표시.' },
      { file: 'src/AppUnified.tsx', desc: 'NotificationCenter 컴포넌트. NOTIF_STORE_KEY 기반 localStorage 알림 목록. 읽지 않은 수 뱃지, 대시보드 alertLog storage 이벤트 연동. 모두 읽음·전체 삭제·개별 닫기·대시보드 이동 기능.' },
    ],
  },
  {
    category: '[v2026.04.25-I] 검색하이라이트 + 템플릿태그 + 자동화통계 + 수료증',
    items: [
      { file: 'src/views/SearchView.tsx', desc: 'Highlight 컴포넌트(RegExp 분할 → <mark> 감쌈). dateFrom/dateTo 날짜 범위 필터. filteredLocalResults/filteredUnifiedResults useMemo. 하이라이트 CSS(.search-highlight).' },
      { file: 'src/views/TemplatesView.tsx', desc: 'RECENT_TEMPLATES_KEY(최대 5개) + pushRecentTemplate. tagFilter 상태로 카테고리 태그 탭 필터. 최근 사용 chip 행. applyTemplate에 id 파라미터 추가.' },
      { file: 'src/views/AutomationView.tsx', desc: 'runs 기반 실행 통계 요약 — total/success/fail/rate. .auto-stats-grid 4카드 레이아웃. 성공률 progress bar. 최근 실행 한 줄 요약.' },
      { file: 'src/views/LearnView.tsx', desc: 'allChecklistDone 감지. learn-completion-banner(그라디언트). downloadCertificate — TXT 형식 수료증 Blob 다운로드. 50% 이상 완료 시 진행 힌트 배너.' },
    ],
  },
  {
    category: '[v2026.04.25-J] 사이드바검색개선 + 에이전트즐겨찾기 + 팀활동타임라인 + 문서북마크',
    items: [
      { file: 'src/AppUnified.tsx', desc: '사이드바 검색 결과 카운트(N건 + 지우기 버튼). 카테고리 빠른 필터(전체/코드/요약/분석/AI) 컬러 도트 칩. .sidebar-cat-filters / .sidebar-search-count CSS.' },
      { file: 'src/views/GensparkAgentsHubView.tsx', desc: 'AGENT_FAVS_KEY localStorage. toggleFav useCallback. favoriteAgents useMemo. ⭐ 즐겨찾기 섹션(.agent-favs-section) 칩 목록. 카드 헤더에 ☆/⭐ 즐겨찾기 버튼 추가.' },
      { file: 'src/views/TeamView.tsx', desc: 'TEAM_ACTIVITY_KEY + ActivityItem. pushActivity(초대/역할변경/제거 시 자동 기록). 타임라인 UI(.team-activity-timeline) + 유형별 필터 버튼. timeAgo 표시.' },
      { file: 'src/views/DocsView.tsx', desc: 'DOC_BOOKMARKS_KEY + toggleBookmark. showBookmarksOnly 필터. 툴바에 🔖 버튼(북마크만 보기). 아티클 헤더에 ☆/🔖 북마크 버튼. 북마크 아티클 좌측 노란 테두리.' },
    ],
  },
  {
    category: '[v2026.04.25-K] 빌링요약카드+비교표 + 즐겨찾기내보내기 + 프로필편집 + 저장검색어',
    items: [
      { file: 'src/views/BillingView.tsx', desc: 'PLAN_COMPARE 10행 비교표(✓/—/값). thisMonthUsage useMemo. billing-summary-grid 4카드(대화/토큰/누적/플랜). 플랜 기능 상세 비교 테이블 섹션.' },
      { file: 'src/components/ChatGPTInterface.tsx', desc: 'exportBookmarkedMessages useCallback — bookmarkedMessages → TXT Blob 다운로드. 북마크 배지 옆 📥 내보내기 버튼 추가.' },
      { file: 'src/views/SettingsView.tsx', desc: 'PROFILE_KEY + UserProfile 인터페이스. 12개 아바타 이모지 피커. 이름/소개 입력. settings-profile-view(조회)/settings-profile-edit(편집) 토글. localStorage 영구 저장.' },
      { file: 'src/views/SearchView.tsx', desc: 'savedSearches state + addSavedSearch/removeSavedSearch/clearAllSavedSearches. 저장 검색어 패널(.saved-search-panel). 입력+저장 버튼. 칩 클릭으로 재검색. 전체 삭제.' },
    ],
  },
  {
    category: '[v2026.04.25-L] 대시보드예측+커뮤니티필터+목표트래커+즐겨찾기바',
    items: [
      { file: 'src/components/IntegratedDashboard.tsx', desc: 'metricPredictions useMemo — 선형회귀(최근 10포인트). CPU/메모리/디스크/응답시간 예측값. 임계값 대비 색상(🟢🟡🔴). 트렌드 차트 아래 Paper 위젯.' },
      { file: 'src/views/CommunityView.tsx', desc: 'yearFilter useState + availableYears useMemo. 연도 필터 셀렉트. monthlyPostStats(최근 6개월) useMemo. community-monthly-stats 미니 막대차트.' },
      { file: 'src/views/HomeOverviewTab.tsx', desc: 'GOALS_KEY + Goal 인터페이스. goals/goalEditId/goalEditVal 상태. goalOverallPct useMemo. 진행도 링(conic-gradient). 목표별 progress bar + 인라인 값 편집(클릭). updateGoalCurrent.' },
      { file: 'src/AppUnified.tsx', desc: 'NAV_FAVS_KEY + NavFavoritesBar 컴포넌트. CustomEvent corbu:toggleNavFav. Ctrl+D 단축키(현재 페이지 즐겨찾기 토글). 브레드크럼 아래 즐겨찾기 칩 바 렌더링.' },
    ],
  },
  {
    category: '[v2026.04.25-M] 스트릭+주간목표 + 테마토글+아바타 + 예약실행 + 리더보드',
    items: [
      { file: 'src/views/AnalyticsView.tsx', desc: 'computeStreak() — 날짜 Set 기반 연속 사용 일수/최장기록/weeklyUsed 계산. STREAK_KEY/WEEKLY_GOAL_KEY. 히트맵 7칸 + 연속 사용 카드 + 주간 목표 progress bar + 인라인 편집.' },
      { file: 'src/AppUnified.tsx', desc: '사용자 아바타 버튼(corbu.settings.profile 읽기, 이모지+이름). ☀️/🌙 테마 빠른 토글 버튼. Ctrl+Shift+L 단축키(테마 즉시 전환). 단축키 도움말 2행 추가.' },
      { file: 'src/views/AutomationView.tsx', desc: 'WorkflowItem에 scheduledAt/scheduleRepeat 필드. scheduleEditId 인라인 패널. datetime-local + 반복 셀렉트(없음/매일/매주/매월). saveSchedule/clearSchedule. auto-schedule-badge 표시.' },
      { file: 'src/views/LearnView.tsx', desc: 'MOCK_PEERS + calcMyScore(체크리스트×50+진도×2). leaderboard useMemo(점수순 정렬). corbu.settings.profile에서 내 이름 읽기. 순위/배지/이름/바/점수 리더보드 목록. 나 행 그린 하이라이트.' },
    ],
  },
  {
    category: '[v2026.04.25-N] 프로젝트 색상라벨 + 음성이력 + 대화요약 + 팔레트 그룹화',
    items: [
      { file: 'src/components/ProjectHub.tsx', desc: 'COLOR_LABEL_KEY localStorage 색상라벨 저장. COLOR_PRESETS 8색 팔레트. Popover 색상 선택기. 리스트뷰 왼쪽 컬러 보더 / 그리드뷰 상단 컬러 보더. 색상 원형 필터 버튼 (8색 + 라벨없음). filterLabel 필터 useMemo 통합.' },
      { file: 'src/views/VoiceGenerationView.tsx', desc: 'VOICE_HISTORY_KEY 음성 생성 이력(최대 30개) localStorage 저장. MutationObserver로 audio 요소 출현 감지 → 대본 자동 기록. 이력 패널(vg-history-panel) 토글 UI. 항목별 재실행/삭제 + 전체 삭제. corbu:voiceReplay CustomEvent 발행.' },
      { file: 'src/components/ChatGPTInterface.tsx', desc: 'summarizeConversation() — 최근 40개 메시지 분석 → 메시지 수/주요질문/마지막AI응답 요약 로컬 생성. showSummaryModal 상태 + 모달 렌더링. copySummary 클립보드 복사. 헤더에 📝 요약 버튼 추가(메시지 있을 때만 표시).' },
      { file: 'src/components/CommandPalette.tsx', desc: 'CommandCategory 타입(ai/page/tool/setting/other). inferCategory() 경로 기반 자동 분류. groupedResults useMemo — 검색 시 카테고리별 섹션 헤더+아이콘+카운트 표시. 초기 목록은 최근사용→전체 기존 방식 유지.' },
    ],
  },
  {
    category: '[v2026.04.25-O] 검색필터저장 + 타임라인필터 + 오버유즈경고 + 온보딩',
    items: [
      { file: 'src/views/SearchView.tsx', desc: 'FILTER_STATE_KEY localStorage 필터 영구 저장(범위/날짜/정렬). SearchFilterState 타입. updateFilter() 통합 업데이트. search-sort-select 정렬 셀렉트(관련도/최신/제목). search-active-filters 배지 + 전체 초기화 버튼. filteredLocalResults 정렬 로직 통합.' },
      { file: 'src/views/HomeOverviewTab.tsx', desc: 'timelineCategoryFilter 상태. timelineCategories useMemo(Set 기반 동적 생성). filteredTimeline useMemo. ho-timeline-filters 카테고리 필터 버튼 그룹. 타임라인에 팀 활동(team.activity)·학습 완료 이벤트 추가. ho-timeline-header + 건수 배지.' },
      { file: 'src/views/BillingView.tsx', desc: 'PLAN_LIMITS 플랜별 대화/토큰 한도. overuseWarning useMemo — 80%경고/100%초과 판별. billing-overuse-banner (warn/error 2단계). 게이지 바(대화·토큰). billing-summary-card에 미니 progress bar 추가.' },
      { file: 'src/AppUnified.tsx', desc: 'ONBOARDING_KEY. OnboardingTour 컴포넌트(6단계 슬라이드). 진행 도트 + 아이콘 + 제목 + 설명 + prev/next/skip/완료 버튼. showOnboarding state(첫 방문 자동 표시, localStorage에 완료 저장). onboarding-overlay 애니메이션.' },
    ],
  },
  {
    category: '[v2026.04.25-P] 임계값UI강화 + 템플릿즐겨찾기 + 이모지반응 + CSV확장',
    items: [
      { file: 'src/components/IntegratedDashboard.tsx', desc: 'AlertThresholds에 diskWarning/diskError 추가. DEFAULT_THRESHOLDS 상수화. checkThresholdBreaches() — 메트릭 임계값 초과 시 notificationService.notify() 호출. updateTrends()에 통합. healthScore의 diskPenalty를 threshold 기반으로 수정. 임계값 패널 4열 그리드에 디스크 슬라이더 추가. 요약 배지에 디스크 경고/위험 표시.' },
      { file: 'src/views/TemplatesView.tsx', desc: 'FAV_TEMPLATES_KEY localStorage 즐겨찾기 저장. loadFavTemplateIds/saveFavTemplateIds 유틸. favIds/showFavsOnly state. toggleFav() 콜백. filteredItems에 즐겨찾기 필터 통합. favLibItems useMemo. 카테고리 필터 행에 ⭐즐겨찾기 토글 칩 추가. 테이블 즐겨찾기 열 실제 토글 버튼(☆/★)으로 교체. 즐겨찾기 전용 카드 그리드 섹션(tmpl-fav-grid, tmpl-fav-card) 추가.' },
      { file: 'src/views/CommunityView.tsx', desc: 'COMMUNITY_REACTIONS_KEY/MY_REACTIONS_KEY 로컬 저장. REACTION_EMOJIS 5종(👍🔥💡😮🎉). loadReactions/saveReactions/loadMyReactions/saveMyReactions 유틸. reactions/myReactions/reactionPopover state. toggleReaction() — 이전 반응 취소+신규 반응 카운트. 반응 팝오버 버튼(community-reaction-trigger). 5종 이모지 선택 팝오버(community-reaction-popover, pop-in 애니메이션). 반응 카운터 요약 배지(community-reaction-summary).' },
      { file: 'src/views/AnalyticsView.tsx', desc: 'StreakData에 activeDays:string[] 필드 추가. computeStreak() 반환에 sorted 배열 포함. 🔥 스트릭&목표 CSV — 스트릭/최장/주간목표/달성률/최근7일 사용여부. 🌐 커뮤니티 활동 CSV — 게시글·좋아요·댓글 수 내보내기. analytics-export-grid에 버튼 2개 추가.' },
    ],
  },
  {
    category: '[v2026.04.25-Q] 사이드바필터탭 + 내보내기옵션모달 + 프로젝트메모 + 검색미리보기',
    items: [
      { file: 'src/AppUnified.tsx + src/App.css', desc: 'sidebarChatFilter state(all/pinned/today/week). sidebar-quick-filter-tabs 4종 탭 UI. quickFiltered — pinned:고정만, today:오늘, week:이번주7일 필터. menuSearch 검색과 AND 조합. sidebar-qf-tab/--active CSS(다크모드).' },
      { file: 'src/components/ChatGPTInterface.tsx', desc: 'showExportModal/exportFormat/exportIncludeMeta/exportBookmarkedOnly/exportDateFrom/exportDateTo state. runExportWithOptions() — 형식(md/txt/html/json) × 메타데이터 포함 여부 × 북마크만 × 날짜 범위 필터 조합 내보내기. ⚙️ 내보내기 옵션… 버튼 메뉴에 추가. 내보내기 옵션 모달(형식 선택/체크박스/날짜 필터/메시지 수 미리보기).' },
      { file: 'src/components/ProjectHub.tsx + src/App.css', desc: 'PROJECT_NOTES_KEY localStorage 메모 저장. loadProjectNotes/saveProjectNotes 유틸. projectNotes/notePanelProjectId/noteDraft state. openNotePanel/saveNote/deleteNote 콜백. 리스트 뷰 카드에 📝 메모 버튼 추가(메모 있으면 노란 배경). ph-note-overlay/ph-note-panel(스티키 노트 스타일, ph-note-in 애니메이션) 모달 추가.' },
      { file: 'src/views/SearchView.tsx + src/App.css', desc: 'previewResult state. 결과 테이블 행 클릭 → 미리보기 토글. 선택된 행 강조(search-result-row--selected). search-preview-panel — 대화 제목/업데이트일/메시지 수, localStorage에서 최근 6개 메시지 렌더링, Highlight 키워드 강조, "대화 열기" 버튼. preview-in 슬라이드 애니메이션.' },
    ],
  },
  {
    category: '[v2026.04.25-R] 학습링차트 + 실행로그모달 + 알림필터탭 + 아바타강화',
    items: [
      { file: 'src/views/LearnView.tsx + src/App.css', desc: 'ProgressRing SVG 컴포넌트(크기/굵기/색상/label 파라미터). useId() 사용. 학습 경로 섹션에 learn-overview-row — 대형 80px 종합 링(코스 수/체크리스트). 각 코스 행(learn-course-row--enhanced)에 미니 44px 링 + 진행률 바 + 레이블 통합. 완료 시 초록, 진행 중 보라, 시작 전 회색 색상 적용.' },
      { file: 'src/views/AutomationView.tsx + src/App.css', desc: 'RunLogStep 인터페이스(step/status/message/durationMs). RunItem에 workflowId/durationMs/steps 추가. generateRunLog() — 트리거→조건→액션→완료 단계별 로그 생성. 실행 완료 시 durationMs 측정 및 steps 포함. 기록 테이블에 소요시간 열 + 📋 로그 버튼. logModalRun 상태 + 실행 로그 모달(auto-log-steps, ok/warn/error 색상 코딩).' },
      { file: 'src/components/NotificationCenter.tsx + NotificationCenter.css', desc: 'onMarkAllRead prop 추가. FILTER_TABS 상수(6종). 기존 select 드롭다운 → 탭 버튼 그룹으로 교체(notif-filter-tabs). 읽지 않은 수 배지(notif-unread-badge). ✓ 모두 읽음 버튼(notif-mark-all-btn). 탭에 해당 유형 알림 수 배지 표시. IntegratedDashboard.tsx에 onMarkAllRead={markAllAsRead} 전달.' },
      { file: 'src/views/SettingsView.tsx', desc: 'AVATAR_EMOJI_CATEGORIES 3종(사람/동물/기호, 각 12개). AVATAR_RECENT_KEY localStorage. avatarCategory/avatarCustomInput/recentAvatars state. pickAvatar() — 선택 시 recentAvatars 업데이트. 카테고리 필터 탭 버튼. 최근 사용 이모지 행. 이모지 직접 입력(최대 2글자) + 적용 버튼. displayEmojis 카테고리 필터.' },
    ],
  },
  {
    category: '[v2026.04.25-S] 스니펫저장 + 팀통계 + 레이아웃토글 + 빌링CTA',
    items: [
      { file: 'src/components/WorkspaceQueryComposer.tsx + WorkspaceQueryComposer.css', desc: 'WqSnippet 인터페이스(id/title/text/createdAt). WQ_SNIPPETS_KEY localStorage (최대 20개). 📌 버튼으로 스니펫 패널 토글. saveCurrentAsSnippet — 현재 입력을 스니펫으로 저장. insertSnippet — 선택 시 textarea에 삽입 후 포커스. deleteSnippet — 항목 삭제. filteredSnippets — 검색어 기반 필터링. 패널 외부 클릭 시 닫기(useEffect+mousedown). 스니펫 검색창(3개 이상일 때 표시). 빈 상태 안내 문구.' },
      { file: 'src/views/TeamView.tsx + src/App.css', desc: 'roleStats useMemo — 역할별(관리자/편집자/뷰어) 및 상태별(활성/초대중/비활성) 카운트. team-role-stats-grid 7칸 통계 카드(전체/역할3종/상태3종, 색상 코딩). activityMemberFilter — 특정 멤버 이름으로 타임라인 필터. activityDays — 7/30/90/365일 기간 필터. filteredActivity에 날짜 컷오프·타입·멤버 복합 필터 적용. team-activity-count 배지. team-activity-filter-row 레이아웃 — 타입 탭 + 메타 필터(select 2개).' },
      { file: 'src/views/HomeOverviewTab.tsx + src/App.css', desc: 'HO_LAYOUT_KEY localStorage 영속 저장. isCompact state + toggleCompact callback. ⊟ 콤팩트 / ⊞ 일반 보기 토글 버튼(우상단). 콤팩트 모드: ho-stat-compact-list — 아이콘+레이블+값 가로 한 줄. 일반 모드: 기존 ho-stat-grid 카드 유지. 콤팩트 모드: ho-quick-compact-row — pill 형태 버튼 6개. 일반 모드: 기존 ho-quick-grid 타일 유지. ho-root--compact에 섹션 간격/타이틀 폰트 축소 스타일.' },
      { file: 'src/views/BillingView.tsx + src/App.css', desc: 'BILLING_ANNUAL_KEY localStorage. isAnnual toggle — 연간/월간 결제 전환, 20% 할인 가격 자동 계산. ctaBannerDismissed — 배너 닫기 상태. billing-upgrade-cta-banner — 그라디언트 보라 배너(무료 플랜 시 표시), PRO 업그레이드 버튼, 닫기 버튼, 진입 애니메이션. billing-billing-toggle-row — 월간/연간 토글 버튼. billing-plan-popular-badge — 추천 플랜 뱃지. billing-plan-annual-note — 연간 결제 2개월 무료 안내. 추천 플랜 버튼 레이블 🚀 업그레이드로 강조.' },
    ],
  },
  {
    category: '[v2026.04.25-GG] LearnBadge + BreadcrumbDark + NotifColor + AgentPreview',
    items: [
      { file: 'src/views/LearnView.tsx + src/App.css', desc: 'COMPLETED_COURSES_KEY, completedCourseIds 상태, markCourseComplete 콜백(localStorage, streakDates push, showToast). learnStreak useMemo(연속 날짜 계산). 전체 진행률 링 아래에 🔥 스트릭 배지, 🎓 수료 배지 row 추가. 코스 행에 100% 달성 시 "🎓 수료 인정" 버튼, 수료 후 "🎓 수료" 칩 표시.' },
      { file: 'src/AppUnified.tsx + src/App.css', desc: 'Breadcrumb 컴포넌트에 quickToggleDark 콜백(data-theme 토글, corbu.theme 저장, StorageEvent 디스패치). themeBtn JSX(☀️/🌙). nav-only 버전과 일반 버전 모두에 themeBtn 추가(마진 left: auto). breadcrumb-theme-btn 스타일.' },
      { file: 'src/AppUnified.tsx + src/App.css', desc: 'NOTIF_LEVEL_ICON 기반 notif-level-badge 컴포넌트. 알림 아이템 제목 옆에 레벨 배지(정보/성공/경고/오류) 표시. 헤더에 notif-level-legend: 레벨별 아이콘+개수 요약. 4가지 레벨 색상(info=파랑, success=초록, warn=노랑, error=빨강).' },
      { file: 'src/views/GensparkAgentsHubView.tsx + src/App.css', desc: 'hoveredAgentId 상태. 각 카드에 onMouseEnter/Leave. hoveredAgentId === a.id 시 agent-card-preview-pop 절대 위치 팝오버(bottom: 100%+6px): 에이전트 설명/지시문 최대 200자, 카테고리 칩. pointer-events: none. preview-in 애니메이션.' },
    ],
  },
  {
    category: '[v2026.04.25-FF] ProjProgress + CommBookmark + MoodBanner + AutoLogCopy',
    items: [
      { file: 'src/components/ProjectHub.tsx + src/App.css', desc: 'Project 인터페이스에 progress?: number 추가. ProjectProgressBar 컴포넌트: 5px track + 색상 분기 fill(완료=초록, ≥60%=인디고, ≥30%=노랑, else=회색). 클릭 시 number input 인라인 편집(Enter/blur 확정, Esc 취소). PROJ_PROGRESS_KEY로 localStorage 영속. progressMap 상태(Record<id,number>). 리스트 뷰와 카드 뷰 각각 DDayBadge 아래/Divider 위에 삽입.' },
      { file: 'src/views/CommunityView.tsx + src/App.css', desc: 'COMM_BOOKMARK_KEY, bookmarkIds 상태(string[]), showBookmarksOnly 상태. toggleBookmark 콜백(localStorage 동기화). filteredPosts useMemo에 showBookmarksOnly 필터 추가(bookmarkIds 의존). 카테고리 탭 끝에 "🔖 북마크" 탭 버튼 추가(count 배지). 각 게시글 카드 액션 영역에 community-bookmark-btn 추가(active 시 🔖, inactive 시 🏷).' },
      { file: 'src/views/HomeOverviewTab.tsx + src/App.css', desc: 'MOOD_KEY, MoodEntry 인터페이스(emoji/label/savedDate), MOOD_PRESETS(6종). mood 상태(오늘 날짜 일치 시만 복원), showMoodPicker 상태. selectMood 콜백. return 최상단에 ho-mood-banner 추가: mood 미선택시 "✨ 오늘 기분이 어때요?" + 선택 버튼, 선택 후 emoji + label + 변경 버튼. showMoodPicker 시 이모지 6종 팝오버 표시.' },
      { file: 'src/views/AutomationView.tsx + src/App.css', desc: '실행 로그 모달 하단에 "📋 로그 복사" 버튼 추가: 전체 로그(워크플로우명/시각/결과/스텝별 상태+메시지)를 텍스트로 clipboard.writeText. 각 RunLogStep 행 헤더 우측에 auto-log-step-copy 버튼 추가(호버 시 표시): 개별 스텝 로그 복사. showToast 성공 알림.' },
    ],
  },
  {
    category: '[v2026.04.25-EE] AnalyticsHeatmap + ChatCopy + SearchAC + TmplSort',
    items: [
      { file: 'src/views/AnalyticsView.tsx + src/App.css', desc: 'computeHourDowHeatmap(): chatgpt_conversations에서 요일(0~6)×시간대(0~23) 집계 행렬 반환. hourDowMatrix useMemo. 내보내기 섹션 위에 "⏰ 시간대 × 요일별 사용 히트맵" 섹션 추가. CSS Grid(1 corner + 24 hour + 7 dow rows). av-hour-cell--0~4 강도 단계별 색상(indigo 계열). 피크 시간/요일 메타 표시. 범례 바 하단 표시.' },
      { file: 'src/components/ChatGPTInterface.tsx + src/App.css', desc: '대화 헤더 actions 영역에 "📋 복사" 버튼 추가. 클릭 시 "Markdown으로 복사" / "텍스트로 복사" 드롭다운 표시. 각 항목은 exportConversation("clipboard"|"txt") 호출 후 copyDone 상태로 2초 "✓ 복사됨" 표시. chat-copy-wrap/menu/menu-item 스타일.' },
      { file: 'src/views/SearchView.tsx + src/App.css', desc: 'acOpen/acIdx/localSearchInputRef/acSuggestions(recentQueries 필터, 최대 6개) 상태 추가. 로컬 검색 input에 onFocus/onBlur(150ms 딜레이)/onKeyDown(↑↓ 탐색, Enter 선택, Esc 닫기) 핸들러. 인라인 ul.search-ac-dropdown 드롭다운 렌더링. search-ac-item--active 키보드 선택 하이라이트.' },
      { file: 'src/views/TemplatesView.tsx + src/App.css', desc: 'tmplSort 상태(newest/oldest/alpha). 카테고리 필터 아래 "최신순/오래된순/이름순" 정렬 버튼 행 추가. 커스텀 템플릿 테이블에 "작성일" 컬럼 추가(createdAt toLocaleDateString). .slice().sort() 로 정렬 적용.' },
    ],
  },
  {
    category: '[v2026.04.25-DD] 사이드바하이라이트 + BillingDaily + IntegPing + PTPreset',
    items: [
      { file: 'src/AppUnified.tsx + src/App.css', desc: 'highlightMatch(text, query) 헬퍼 — 쿼리 매칭 구간을 <mark class="sidebar-search-hl"> 태그로 감쌈. SidebarConversationRow.displayTitle 타입을 string→ReactNode로 변경. renderRow의 displayTitle에 highlightMatch(chat.title, q) 적용(general/agent 양쪽). .sidebar-search-hl: 노란 반투명 배경(rgba(245,158,11,0.35)), 다크모드 변형.' },
      { file: 'src/views/BillingView.tsx + src/App.css', desc: 'buildDailyUsage() — chatgpt_conversations에서 이번달 일별 대화수 집계, 빈 날은 0. dailyUsage useMemo. 월별 차트 섹션 하단에 "📅 이번 달 일별 대화 수" 섹션 추가(IIFE 패턴). billing-daily-bars: flex, height 80px, 일별 바(height %는 maxQ 기준). 오늘 날짜 바 강조(--today), 1/5의 배수/오늘에 날짜 레이블. 메타 헤더(총 건수 + 오늘 건수).' },
      { file: 'src/views/IntegrationsView.tsx + src/App.css', desc: 'pingState / pingTime 상태(Record<id, idle|testing|ok|fail>). runPingTest(id): 400~1200ms 랜덤 딜레이 후 80% 확률 성공 시뮬레이션, elapsed 기록, showToast 알림. 연결된 타일에만 "🔌 핑 테스트" 버튼 표시. 결과를 "✓ NNNms" 또는 "✕ 응답 없음" 배지로 표시. integ-ping-btn/integ-ping-result 스타일.' },
      { file: 'src/views/PipelineTuningView.tsx + src/App.css', desc: 'PtPreset 인터페이스(id/name/config/savedAt), PT_PRESETS_KEY. loadPtPresets/savePtPresets. presets/presetName/showPresetSave/previewPresetId 상태. savePreset: 현재 tuning.config를 이름과 함께 저장(max 10). deletePreset. previewConfig useMemo. 파이프라인 설정 카드 하단에 "💾 현재 설정 프리셋으로 저장" 버튼 + 인라인 폼. 별도 "저장된 파라미터 프리셋" 섹션: 목록(이름/날짜/삭제), 클릭 시 JSON 미리보기.' },
    ],
  },
  {
    category: '[v2026.04.25-CC] Docs읽기시간 + Automation성공률 + 다크스케줄 + 팀태그',
    items: [
      { file: 'src/views/DocsView.tsx + src/App.css', desc: 'calcReadTimeMin(body) — 공백 제거 글자수 ÷ 200 (최소 1분). filteredArticles.map에서 isRead(recentDocIds.has), readMin 계산. 카드 헤더에 "✓" 읽음 배지(초록), "⏱ N분" 읽기 시간 배지 추가. 읽은 문서는 제목 색상을 흐리게(#64748b). 필터 바 위에 docs-read-progress-bar-wrap: 라벨 + 초록 게이지 바(읽은/전체) + 카운트. 진행 바 transition 0.4s.' },
      { file: 'src/views/AutomationView.tsx + src/App.css', desc: '실행 통계 섹션 하단에 워크플로우별 성공률 테이블 추가(IIFE 패턴). runs에서 Map<wfName, {total, success}> 집계. 테이블: 이름/실행수/성공수/성공률(색상 분기)/바 차트 열. auto-wf-stat-bar-track(80px, 6px, 둥근 모서리) + 색상별 fill. auto-wf-stat-table 전체 스타일.' },
      { file: 'src/views/SettingsView.tsx + src/App.css', desc: 'DARK_SCHEDULE_KEY. DarkSchedule 인터페이스(enabled/darkFrom/darkTo). loadDarkSchedule/saveDarkSchedule. isInDarkSchedule — 자정 걸침 케이스 처리. darkSchedule 상태. updateDarkSchedule useCallback. useEffect: enabled && !autoDark일 때 1분 간격 setInterval로 테마 전환. UI: 시스템 감지 토글 다음에 "🌙 시간 기반 다크모드 스케줄" 토글 추가. 활성화 시 settings-dark-schedule-times 패널(시작/종료 time input, 현재 구간 힌트). autoDark와 충돌 시 경고 메시지.' },
      { file: 'src/views/TeamView.tsx + src/App.css', desc: 'LocalMember에 tags?: string[] 추가. memberTagInput/memberTagOpen/memberTagFilter 상태. allMemberTags useMemo. addMemberTag/removeMemberTag useCallback. filteredMembers useMemo(태그 필터). 테이블 위 team-tag-filter-row: 태그 필터 칩 + 초기화. 각 멤버 이름 아래 team-member-tags 행: #태그 칩(✕ 삭제) + "+태그" 버튼(클릭 시 인라인 input, Enter 추가, Escape 취소). 최대 6개. localStorage 자동 저장.' },
    ],
  },
  {
    category: '[v2026.04.25-BB] WQ입력히스토리 + 연간히트맵 + 커뮤니티내글/수정 + Learn검색필터',
    items: [
      { file: 'src/components/WorkspaceQueryComposer.tsx', desc: 'WQ_INPUT_HISTORY_KEY(corbu.wq.inputHistory), MAX_INPUT_HISTORY=50. loadInputHistory/saveInputHistory 함수. historyIdxRef(-1 초기값)/historyDraftRef. onFormSubmit에 commit 시 히스토리 선두 삽입(중복 제거, 최대 50). onKeyDown: ArrowUp — 커서가 첫 위치거나 값이 비어있을 때 히스토리 탐색(draft 저장 후 prev 불러오기). ArrowDown — 히스토리 앞으로 탐색(인덱스 -1이면 draft 복원). Escape — 히스토리 모드 취소(draft 복원).' },
      { file: 'src/views/AnalyticsView.tsx + src/App.css', desc: 'computeYearlyHeatmap() — localStorage에서 updatedAt 날짜별 Map<string, number> 생성. 주간 히트맵 다음에 연간 히트맵 렌더링(IIFE 패턴). 오늘 기준 364일, 일요일 시작 정렬. monthLabels(7칸 간격으로 월 표시). analytics-yearly-grid(gridAutoFlow: column, 7행×N열). analytics-yearly-cell--0~4(연도색상 스케일). 범례(적음~많음). 활동일/총 대화 수 헤더 표시. GitHub 다크/라이트 배색. CSS: analytics-yearly-heatmap-card + 셀/도우라벨/범례.' },
      { file: 'src/views/CommunityView.tsx + src/App.css', desc: 'myPostsOnly 상태. editPostId/editTitle/editContent 상태. openEditPost/submitEditPost useCallback. filteredPosts useMemo에 myPostsOnly(author===\'나\') 필터 추가, 의존성 배열 포함. 카테고리 탭 마지막에 "✍️ 내 글" 탭 추가(dashed border, 카운트 표시). 내 게시글(author===\'나\')에만 ✏️ 수정 버튼 표시. 클릭 시 인라인 수정 폼(제목 input + 내용 textarea + 저장/취소). CSS: community-edit-btn/form/form-actions, community-my-posts-tab.' },
      { file: 'src/views/LearnView.tsx + src/App.css', desc: 'courseSearch/courseCatFilter/courseLevelFilter/showOnlyWithNotes 상태. allCategories/allLevels useMemo(전체+유니크 값). filteredCourses useMemo — cat/level/노트유무/검색어 복합 필터. 코스 목록 위에 learn-search-bar 추가: 검색 input, 카테고리/난이도 select, "📝 노트 있는 것만" 토글 버튼, ✕ 초기화 버튼, N/M개 카운트. mergedCourses.map → filteredCourses.map. CSS: learn-search-* 세트 + 다크모드.' },
    ],
  },
  {
    category: '[v2026.04.25-AA] 메시지핀 + 프로젝트아카이브 + 빠른메모 + 필터프리셋',
    items: [
      { file: 'src/components/ChatGPTInterface.tsx + src/App.css', desc: 'Message 인터페이스에 pinned?: boolean 추가. pinnedMessages useMemo. showPinnedPanel 상태. togglePinMessage useCallback — messages map으로 토글, setConversations/setCurrentConversation 동기 업데이트, showToast. 핀 버튼(📌) 북마크 버튼 옆에 추가. conv-tags-row 다음에 msg-pinned-banner 렌더링: 배너 토글 버튼, 펼치면 ul 목록(역할/미리보기/✕ 해제). CSS: msg-pinned-banner/list/item/role/preview/unpin + 다크모드.' },
      { file: 'src/components/ProjectHub.tsx', desc: 'hideArchived 상태(localStorage 영구저장, 기본 true). archivedCount useMemo. filteredProjects useMemo에 hideArchived && statusFilter===\'all\' 조건 추가, 의존성에 hideArchived 포함. 정렬 버튼 옆 "📦 보관 N개 숨김/표시 중" 토글 버튼 추가(archivedCount>0, statusFilter===\'all\'일 때만). 리스트 뷰 메뉴 버튼 앞 📦/📤 인라인 아카이브 토글 버튼 추가.' },
      { file: 'src/views/HomeOverviewTab.tsx + src/App.css', desc: 'QUICK_MEMO_KEY(corbu.home.quickMemo). quickMemo/memoEditing/memoDraft 상태. memoTextareaRef. openMemoEditor/saveMemo/clearMemo useCallback. 대화 검색 섹션 바로 앞에 ho-memo-section 렌더링: 헤더(✏️ 편집 / 🗑 삭제), 편집 모드(textarea + 저장/취소), 뷰 모드(클릭 시 편집, 줄바꿈 보존). Ctrl+Enter로 저장, Escape로 취소. CSS: ho-memo-* 전체 세트 + 다크모드.' },
      { file: 'src/views/SearchView.tsx + src/App.css', desc: 'FilterPreset 인터페이스(id/name/filter/createdAt). FILTER_PRESETS_KEY. loadFilterPresets/saveFilterPresets. filterPresets/presetNameInput/showPresetSave 상태. savePreset(이름+현재 filterState → 프리셋 저장)/loadPreset(적용+toast)/deletePreset useCallback. 적용된 필터 초기화 버튼 다음에 search-preset-row UI: 저장된 프리셋 칩 목록(클릭→적용, ✕→삭제) + "+ 현재 필터 저장" 버튼 → 이름 입력 인라인 폼(Enter 저장, Escape 취소). CSS: search-preset-* 세트.' },
    ],
  },
  {
    category: '[v2026.04.25-Z] WQ단어수카운터 + 뒤로앞으로버튼 + 설정내보내기 + 워크플로우복제',
    items: [
      { file: 'src/components/WorkspaceQueryComposer.tsx + WorkspaceQueryComposer.css', desc: 'wordCount(trim().split(/\\s+/).length), lineCount(split(\\n).length) 파생 상태. 기존 wq-char-counter에 단어수(.wq-word-count)와 줄수(.wq-line-count) 인라인 추가(charCount > 0일 때). title tooltip에 글자수/단어수/줄수 모두 표시. CSS: wq-char-sep(구분자), wq-word-count/wq-line-count 추가. display: inline-flex, align-items: center.' },
      { file: 'src/AppUnified.tsx + src/App.css', desc: 'Breadcrumb 컴포넌트에 app-nav-hist-btn(뒤로 ‹, 앞으로 ›) 추가. crumbs.length<=1일 때도 nav-only 모드로 렌더링. histLen 상태(window.history.length 추적). Alt+ArrowLeft/Right 전역 keydown 단축키 — INPUT/TEXTAREA/contentEditable 제외. 단축키 도움말 모달에 Alt+←/→ 항목 추가. CSS: app-nav-hist-btn 스타일 + app-breadcrumb에 display:flex 적용.' },
      { file: 'src/views/SettingsView.tsx', desc: '개인정보·데이터 섹션에 "⚙️ 설정 내보내기/가져오기" 카드 추가. SETTINGS_KEYS 배열(theme/accent/autoDark/font/sidebar 등 13개 키). 내보내기: _version/_exported 메타 포함 JSON 생성 → corbu_settings_YYYY-MM-DD.json 다운로드. 가져오기: <input type="file"> accept .json → FileReader → JSON.parse → _version 유효성 검사 → localStorage 일괄 저장 → storage 이벤트 → 1.8초 후 reload.' },
      { file: 'src/views/AutomationView.tsx', desc: 'duplicateWorkflow useCallback — 원본 WorkflowItem 복사, id=wf_timestamp, name+=\' (복사본)\', status=\'일시정지\', scheduledAt/scheduleRepeat 초기화. 원본 바로 뒤(splice idx+1)에 삽입. showToast 성공 알림. UI: 편집-삭제 버튼 사이에 "📋 복제" 버튼 추가(동일한 bw-btn-secondary 스타일).' },
    ],
  },
  {
    category: '[v2026.04.25-Y] Docs태그정렬 + Analytics날짜필터 + 알림그룹 + Learn카테고리차트',
    items: [
      { file: 'src/views/DocsView.tsx + src/App.css', desc: 'docSortBy(default|title|bookmarked) 상태. docTagFilter 상태. allDocTags useMemo(전체 태그 Set). filteredArticles에 tagFilter + sortBy 로직 추가. docs-filter-btn-group에 docs-sort-select 추가. docs-tag-filter-row — 전체 태그 칩 행(#태그, 클릭 토글, 초기화). docs-tag-chip/docs-tag-chip--active CSS.' },
      { file: 'src/views/AnalyticsView.tsx + src/App.css', desc: 'dateRangeFrom/dateRangeTo/dateRangeApplied 상태. applyDateFilter/clearDateFilter 함수. filteredLocalStats useMemo — 기간 내 대화 수와 일평균 계산. UI: analytics-date-range-row(배경 패널) + 시작일/종료일 date input + 적용 버튼. 적용 시 뱃지 표시. 통계 카드 값 조건부 전환(기간 내 대화 / 일평균 대화).' },
      { file: 'src/components/NotificationCenter.tsx + NotificationCenter.css', desc: 'collapsedTypes Set 상태. toggleTypeCollapse useCallback. filter==="all"일 때 typeOrder(error→warning→success→info→writing→collaboration) 순서로 그룹화 렌더링. 각 그룹: notif-group-header li + notif-group-toggle button(타입명/미읽음배지/전체수/▶▾). 접힌 그룹은 아이템 배열 제외. filter!="all" 이면 기존 플랫 리스트 유지.' },
      { file: 'src/views/LearnView.tsx + src/App.css', desc: 'categoryProgress useMemo — mergedCourses를 category별 Map으로 집계(평균진도, 코스수, 완료수). learn-cat-chart 섹션 — 코스 목록 위에 배치. learn-cat-bar-row: 카테고리명(80px), 진도 바(flex:1), %, 완료/전체. 색상 분기: 100%=초록, 60%↑=보라, 30%↑=노랑, 그 외=회색. transition 0.4s ease.' },
    ],
  },
  {
    category: '[v2026.04.25-X] 사이드바그룹접기 + ProjectDDay + 자동화필터 + 대화태그',
    items: [
      { file: 'src/AppUnified.tsx + src/App.css', desc: 'collapsedGroups Set 상태(localStorage 영구 저장, key: corbu.sidebar.collapsedGroups). toggleGroupCollapse useCallback. 날짜 그룹 헤더를 div→button으로 변경(sidebar-date-group-header--btn). aria-expanded, aria-label. sidebar-date-group-chevron(▶/▾). 접힌 그룹은 항목 배열에서 제외(isCollapsed ? [] : rows.map). 고정됨 그룹도 동일하게 적용.' },
      { file: 'src/components/ProjectHub.tsx + src/components/ProjectHub.css', desc: 'Project 인터페이스에 dueDate?: string 추가. getDDay(dueDate): 오늘 기준 잔여일 계산(86400000ms 단위). DDayBadge 컴포넌트: days<0→D+N(빨강), days=0→D-Day(주황), <=3→노랑, <=7→파랑, 그 외 회색. CSS var --dday-bg 활용. 리스트 뷰와 그리드 뷰 양쪽에 배지 렌더링.' },
      { file: 'src/views/AutomationView.tsx + src/App.css', desc: 'runStatusFilter(all|success|fail), runWorkflowFilter(all|워크플로우명) 상태 추가. allWorkflowNames useMemo. filteredRuns useMemo(status+workflow 복합 필터). 실행 이력 섹션 헤더에 filteredRuns.length/runs.length 표시. auto-run-filter-row UI: 결과 필터 버튼 그룹(전체/성공/실패) + 워크플로우 select + ✕ 초기화 버튼. 빈 결과시 "필터 조건에 맞는 결과 없음" 메시지.' },
      { file: 'src/components/ChatGPTInterface.tsx + src/App.css', desc: 'Conversation 인터페이스에 tags?: string[] 추가. convTagsOpen/convTagInput/convTagFilter 상태. addTagToCurrentConv — 중복/최대8개 방어, localStorage 동기 저장. removeTagFromCurrentConv. 대화 헤더 아래 conv-tags-row 렌더링: conv-tag-chip(#태그 + 삭제✕). conv-tag-add-btn — 클릭 시 인라인 입력창(Enter로 추가, Escape로 닫기) 전환.' },
    ],
  },
  {
    category: '[v2026.04.25-W] 검색어개선 + 커뮤니티태그 + 템플릿미리보기 + 타임라인날짜',
    items: [
      { file: 'src/views/SearchView.tsx + src/App.css', desc: '최근 검색어 칩 UI 전면 개편: search-recent-section(배경 패널). search-recent-chip-wrap(칩+삭제 버튼 합체). search-recent-chip-del(개별 삭제, 호버 시 빨강). 전체 삭제 버튼. 검색창 우측에 📌 저장 버튼(현재 쿼리 바로 저장). 기존 Highlight 컴포넌트는 로컬+통합 결과 양쪽 유지.' },
      { file: 'src/views/CommunityView.tsx + src/App.css', desc: 'LocalPost에 tags?: string[] 추가. newTags 상태 + submitPost에서 쉼표 분리 파싱(최대 5개). tagFilter/allPostTags 상태. filteredPosts에 태그 필터 적용(검색어도 태그 포함). community-tag-filter-row — 전체 태그 칩 행. community-post-tags — 게시글 카드 내 태그 칩. 글쓰기 모달에 태그 입력 필드. 태그 클릭 시 필터 토글.' },
      { file: 'src/views/TemplatesView.tsx + src/App.css', desc: 'previewTemplate 상태(PreviewItem). 제목 셀 → tmpl-preview-title-btn(클릭 시 펼침, ▼/▲ chevron). React.Fragment로 각 행 감쌈. isPreviewing일 때 colSpan=5 td 안에 tmpl-preview-panel 표시. 패널: 제목/▶ 적용/📋 복사/✕ 닫기. tmpl-preview-panel-body — pre 스타일(pre-wrap, max-height 240, overflow-y auto). preview-in 애니메이션.' },
      { file: 'src/views/HomeOverviewTab.tsx + src/App.css', desc: '활동 타임라인에 날짜 그룹 구분선 추가. lastDateLabel 누적 변수로 날짜가 바뀔 때만 ho-timeline-date-divider 삽입. 오늘/어제/MM월 DD일 레이블. CSS: 양쪽에 1px 수평선(::before/::after flex 1h), ho-timeline-date-label 중앙 표시.' },
    ],
  },
  {
    category: '[v2026.04.25-V] 대시보드카드숨김 + 프로필레벨배지 + TTS프리셋 + 학습노트',
    items: [
      { file: 'src/components/IntegratedDashboard.tsx', desc: 'METRIC_CARDS_KEY(localStorage). MetricCardId 타입(cpu/memory/disk/network). hiddenCards Set 상태. cardCustomizeOpen 토글 패널. toggleCardVisibility(). "실시간 메트릭" 헤더 우측 ⚙️ 버튼. 커스터마이징 패널 — pill 버튼(선택 시 밑줄 취소 + 파란 테두리, 미선택 시 line-through). 숨긴 카드 렌더링 건너뜀. 모두 숨긴 경우 안내 메시지. 숨긴 카드 수 배지.' },
      { file: 'src/views/SettingsView.tsx + src/App.css', desc: 'ProfileLevel 인터페이스(6단계: 새싹/탐험가/숙련자/전문가/마스터/레전드). computeProfileLevel(convCount). getConvCount(). 프로필 보기에 레벨 배지(절대 위치 원형, --badge-color CSS var). settings-profile-level-chip(배지+칩 병렬). settings-level-bar-wrap/fill — 경험치 진행 바(transition width 0.5s). "다음 레벨까지 N개" 텍스트.' },
      { file: 'src/views/VoiceGenerationView.tsx + src/App.css', desc: 'VoicePreset 인터페이스(id/name/script/savedAt). VOICE_PRESETS_KEY, MAX_PRESETS=10. loadPresets/savePresetsToStorage. presets/showPresets/presetNameDraft/addingPreset 상태. saveAsPreset() — 현재 textarea 내용 자동 읽기. deletePreset(). 📌 프리셋 버튼(토글, --active 강조). 프리셋 패널: 헤더 + "+ 현재 대본 저장" + 이름 입력(Enter/Esc). 프리셋 목록 — 이름+대본미리보기+저장시간. ▶ 적용 버튼으로 재실행.' },
      { file: 'src/views/LearnView.tsx + src/App.css', desc: 'LEARN_NOTES_KEY. loadLearnNotes/saveLearnNotes. learnNotes/noteOpenId/noteDraft 상태. openNote/saveNote/deleteNote 콜백. 코스 행에 📋/📝 노트 버튼(노트 있으면 --has-note 강조). noteOpenId === c.id일 때 learn-note-panel 인라인 표시. learn-note-textarea(resize:vertical, focus border). 저장/취소/삭제 버튼. ph-note-in 진입 애니메이션 재사용.' },
    ],
  },
  {
    category: '[v2026.04.25-U] 차트유형토글 + 문서최근읽기 + ProjectHub태그필터 + 이모지반응',
    items: [
      { file: 'src/views/AnalyticsView.tsx + src/App.css', desc: 'localChartType/dashChartType/weeklyChartType 상태 추가. analytics-chart-toggle — pill 버튼 그룹(막대/선/파이). 로컬 7일 대화 추이: 막대↔선 전환. 주간 비교: 막대↔선 전환(선 모드에서 Legend 표시). 대시보드 감정·의도 차트: 막대/선/파이 전환(파이는 PieChart+Cell+Legend). analytics-chart-header flex 레이아웃.' },
      { file: 'src/views/DocsView.tsx + src/App.css', desc: 'RecentDocEntry 인터페이스(id/readAt). pushRecentDoc() — 최근 8개 유지. recentDocs/showRecentOnly 상태. openDoc() — 문서 열 때 읽음 기록. filteredArticles에 showRecentOnly 필터 추가. docs-recent-row — 최근 읽은 칩 배너(조건부 표시). docs-filter-btn-group — 북마크+최근 필터 버튼 묶음. 상호 배타적 토글(하나 켜면 다른 꺼짐). docs-recent-chip 스타일(호버 시 보라).' },
      { file: 'src/components/ProjectHub.tsx', desc: 'tagFilter 상태 + allTags useMemo(최대 12개). filteredProjects에 태그 필터 적용. 검색 TextField에 초기화(✕) endAdornment. 활성 필터 Chip 배지 행 — 검색어/상태/카테고리/라벨 각각 삭제 가능. "전체 초기화" 버튼. 태그 빠른필터 Chip 행 — 클릭 시 토글, 선택 시 filled/primary 강조.' },
      { file: 'src/components/ChatGPTInterface.tsx + src/App.css', desc: 'MSG_EMOJI_REACTIONS 상수(❤️😂😮🔥💯👏🎉😢). MsgEmojiReaction 타입. Message에 emojiReactions?: Partial<Record<MsgEmojiReaction,boolean>> 필드. toggleEmojiReaction() useCallback. emojiPickerMsgId 상태 + useEffect로 외부 클릭 시 닫기. 🙂+ 버튼 → msg-emoji-picker 팝업(절대 위치, emoji-picker-in 애니메이션). 활성 이모지 chip 표시(msg-emoji-reaction-chip). msg-emoji-picker-btn--active 강조.' },
    ],
  },
  {
    category: '[v2026.04.25-T] 검색정렬탭 + 커뮤니티에디터 + 자동화템플릿 + 사이드바그룹헤더',
    items: [
      { file: 'src/views/SearchView.tsx + src/App.css', desc: '정렬 select → search-sort-tabs 버튼 그룹(🎯 관련도 / 📅 최신순 / 🔤 제목순). filteredUnifiedResults에도 정렬 적용(title/date). 통합 검색 결과 헤더에 search-result-count-badge(건수) + search-sort-active-badge(현재 정렬 표시). 탭 버튼 활성 상태 강조.' },
      { file: 'src/views/CommunityView.tsx + src/App.css', desc: 'MAX_POST_CONTENT = 1000. simpleMarkdown() — 외부 라이브러리 없이 h1~h3/bold/italic/code/li 변환. editorPreview 상태. comm-editor-tabs — ✏️ 작성 / 👁 미리보기 탭. comm-editor-toolbar — B/I/`/H2/- 서식 버튼(클릭 시 마크다운 스니펫 삽입). comm-editor-preview — dangerouslySetInnerHTML로 HTML 렌더링. 글자 수 한도 초과 시 빨간 경고.' },
      { file: 'src/views/AutomationView.tsx + src/App.css', desc: 'WfTemplate 인터페이스(6종 빠른시작 템플릿). WF_QUICK_TEMPLATES — 파일요약/야간배치/키워드알림/대화저장/웹훅/오류모니터링. selectedTemplate state. applyTemplate() — 클릭 시 이름·트리거 자동입력. addWorkflow() — selectedTemplate의 conditions/actions 포함. auto-tpl-grid(3컬럼 그리드). auto-tpl-card(호버/선택 강조). auto-tpl-selected-info — 선택 확인 및 해제 버튼. 취소 시 selectedTemplate 초기화.' },
      { file: 'src/AppUnified.tsx + src/App.css', desc: 'DATE_GROUP_ICONS Record(오늘🌅/어제🕐/이번주📅/이전📂). sidebar-date-group-header--with-count 변형 클래스 — flex 레이아웃으로 그룹명+카운트 배지 나란히 표시. 핀 고정 섹션도 동일 스타일. sidebar-date-group-count — 반투명 배경 pill 배지.' },
    ],
  },
];

function DevStatusLazyChatViewDemo() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const props = useMemo(
    () =>
      createMinimalChatViewProps({
        scrollContainerRef,
        messagesEndRef,
        inputRef,
        loading: false,
        currentChat: {
          id: 'dev-chatview-demo',
          title: 'ChatView 지연 로드 데모',
          summary: 'LazyComponents.ChatView · API 없음',
          date: new Date().toISOString(),
          messages: [],
        },
        messages: [
          {
            id: 'dev-cv-u1',
            role: 'user',
            content: 'Main 번들에서 Chat/ChatView 청크가 분리되어 로드되는지 확인합니다.',
            timestamp: new Date().toISOString(),
          },
          {
            id: 'dev-cv-a1',
            role: 'assistant',
            content: '데모용 응답입니다. Genspark 본문 렌더는 제품과 동일 컴포넌트 경로를 탑니다.',
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    [scrollContainerRef, messagesEndRef, inputRef],
  );

  return (
    <ErrorBoundary>
      <div
        className="bw-dev-status-embed-chatview"
        data-testid="dev-status-embed-chatview"
        style={{
          maxHeight: 520,
          overflow: 'auto',
          border: '1px solid var(--border-color, #ddd)',
          borderRadius: 8,
        }}
      >
        <ChatView {...props} />
      </div>
    </ErrorBoundary>
  );
}

function DevStatusEmbedChatDemo() {
  const [messages, setMessages] = useState<ChatInterfaceProps['messages']>(() => [
    {
      id: 'demo-u1',
      type: 'user',
      content: '임베드 패널에서 LazyComponents.ChatInterface 지연 로드가 동작하는지 확인하는 데모입니다.',
      timestamp: new Date(),
    },
    {
      id: 'demo-a1',
      type: 'ai',
      content: '연결되었습니다. 아래 입력창에 입력해 전송하면 이 영역에만 반영됩니다.',
      timestamp: new Date(),
    },
  ]);

  const onSendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const now = new Date();
    const ts = now.getTime();
    setMessages((prev) => [
      ...prev,
      { id: `demo-u-${ts}`, type: 'user', content: trimmed, timestamp: now },
      {
        id: `demo-a-${ts}`,
        type: 'ai',
        content: '데모 응답: 메시지를 수신했습니다.',
        timestamp: now,
      },
    ]);
  }, []);

  return (
    <ErrorBoundary>
      <div
        className="bw-dev-status-embed-chat"
        data-testid="dev-status-embed-chat"
        style={{
          maxHeight: 560,
          overflow: 'auto',
          border: '1px solid var(--border-color, #ddd)',
          borderRadius: 8,
        }}
      >
        <ChatInterface messages={messages} onSendMessage={onSendMessage} isConnected />
      </div>
    </ErrorBoundary>
  );
}

function DevStatusView() {
  return (
    <div className="main-content bw-detail-root bw-detail-root--centered bw-tool-view" role="main" aria-label="개발 상태" data-testid="dev-status-view">
      <header className="bw-detail-header-left">
        <p className="bw-detail-desc">지금까지 프론트엔드에 반영된 기능과 변경 사항을 확인할 수 있습니다.</p>
      </header>
      <div className="bw-tool-view-body">
        <section className="bw-detail-section" aria-labelledby="dev-summary-heading">
          <h2 id="dev-summary-heading" className="bw-detail-section-title">{SUMMARY.title}</h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="bw-features-card-desc" style={{ fontWeight: 600, marginBottom: '1rem' }}>
              {SUMMARY.oneLiner}
            </p>
            <ul className="bw-detail-list bw-list-unstyled">
              {SUMMARY.features.map((f) => (
                <li key={f.name} className="bw-list-item-spaced">
                  <strong>{f.name}</strong>
                  <p className="bw-detail-desc bw-desc-tight">{f.desc}</p>
                </li>
              ))}
            </ul>
            <p className="bw-detail-desc bw-desc-tight" style={{ marginTop: '1rem' }}>
              <strong>화면 구성:</strong> {SUMMARY.layout}
            </p>
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="dev-update-notice-heading" data-testid="dev-status-update-notice-section">
          <h2 id="dev-update-notice-heading" className="bw-detail-section-title">{UPDATE_NOTICE.title} ({UPDATE_NOTICE.version})</h2>
          <div className="bw-features-card bw-detail-scroll">
            <ul className="bw-detail-list bw-list-unstyled">
              {UPDATE_NOTICE.items.map((item) => (
                <li key={item} className="bw-list-item-spaced">{item}</li>
              ))}
            </ul>
            <p className="bw-detail-desc bw-desc-tight" style={{ marginTop: '0.75rem' }}>
              액션 버튼 권장 문구: <strong>{UPDATE_NOTICE.actions.primary}</strong> · <strong>{UPDATE_NOTICE.actions.secondary}</strong>
            </p>
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="dev-changes-heading">
          <h2 id="dev-changes-heading" className="bw-detail-section-title">프론트엔드 변경 사항</h2>
          <div className="bw-features-card bw-detail-scroll">
            {CHANGES.map((group) => (
              <div key={group.category} style={{ marginBottom: '1.5rem' }}>
                <h3 className="bw-detail-section-title" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                  {group.category}
                </h3>
                <ul className="bw-detail-list bw-list-unstyled">
                  {group.items.map((item, idx) => (
                    <li key={`${group.category}-${item.file}-${idx}`} className="bw-list-item-spaced" style={{ marginBottom: '0.5rem' }}>
                      <code style={{ fontSize: '0.85em', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4 }}>
                        {item.file}
                      </code>
                      <span style={{ marginLeft: '0.5rem' }}>{item.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="dev-embed-chat-heading">
          <h2 id="dev-embed-chat-heading" className="bw-detail-section-title">
            임베드 대화 UI (LazyComponents.ChatInterface)
          </h2>
          <p className="bw-detail-desc bw-desc-tight" style={{ marginBottom: '0.75rem' }}>
            프로젝트·보조 패널에서 쓰는 경량 대화 컴포넌트를 <code>components/LazyComponents</code>에서 지연 로드합니다. 이 데모는 API를 호출하지 않습니다.
          </p>
          <DevStatusEmbedChatDemo />
        </section>

        <section className="bw-detail-section" aria-labelledby="dev-embed-chatview-heading">
          <h2 id="dev-embed-chatview-heading" className="bw-detail-section-title">
            대화 메시지 목록 (LazyComponents.ChatView)
          </h2>
          <p className="bw-detail-desc bw-desc-tight" style={{ marginBottom: '0.75rem' }}>
            <code>Chat/ChatView</code>는 메시지·타이핑·멀티 인텐트 패널을 묶은 영역입니다. 아래는 지연 로드 래퍼만 거친 정적 데모(API 없음)입니다.
          </p>
          <DevStatusLazyChatViewDemo />
        </section>

        <section className="bw-detail-section" aria-labelledby="dev-verify-heading" data-testid="dev-status-verify-section">
          <h2 id="dev-verify-heading" className="bw-detail-section-title">검증·배포</h2>
          <div className="bw-features-card bw-detail-scroll">
            <ul className="bw-features-card-desc">
              <li><code>npm run verify:completion</code> — 타입·린트·P4 170 tests</li>
              <li><code>npm run test:views</code> — 뷰·라우트 22 suites, 142 tests</li>
              <li><code>npm run deploy:check</code> — 검증 + 빌드 → build/ 생성</li>
              <li>
                <code>npm run verify:final</code> — 최종 검증(<code>docs/FINAL_CHECKLIST.md</code>). 프론트·백엔드 미기동이면 접속·API·통합은 SKIP/FAIL 로그만 남기고, import·빌드·대화 Jest·UI 스모크가 통과하면 exit 0.
              </li>
              <li><code>npm run restart:backend</code> — 백엔드 재시작 (기본 포트 5002, 프록시와 동일)</li>
              <li><code>npm run deploy:server</code> — .env에 DEPLOY_DEV_HOST, DEPLOY_DEV_PATH 설정 후 서버 반영</li>
              <li>
                상세 표: <code>docs/guides/ANSWER_QUALITY_AND_SEARCH.md</code> §8 검증·배포(로컬)
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

export default DevStatusView;
