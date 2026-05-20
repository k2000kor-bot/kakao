/**
 * data-testid 상수 (단일 소스)
 * E2E(e2e/testIds.ts)와 컴포넌트에서 공유.
 * 새 testid 추가 시 e2e/README.md 테이블과 동기화.
 */
export const TEST_IDS = {
  // 프로젝트 관리 (ProjectManagement, Sidebar)
  PROJECT_LIST: 'project-list',
  NEW_PROJECT_BUTTON: 'new-project-button',
  EDIT_PROJECT: 'edit-project',
  PROJECT_DETAIL_SETTINGS_BTN: 'project-detail-settings-btn',
  PROJECT_SOURCES_TAB: 'project-sources-tab',
  PROJECT_SOURCES_ADD_BTN: 'project-sources-add-btn',
  PROJECT_SOURCES_EMPTY_CTA: 'project-sources-empty-cta',
  PROJECT_SOURCES_LIST: 'project-sources-list',
  PROJECT_SOURCES_FILE_ITEM: 'project-sources-file-item',
  PROJECT_SOURCES_FILE_REMOVE: 'project-sources-file-remove',
  PROJECT_SOURCES_WEB_ITEM: 'project-sources-web-item',
  PROJECT_SOURCES_WEB_REMOVE: 'project-sources-web-remove',
  PROJECT_SOURCES_UPLOADING: 'project-sources-uploading',
  PROJECT_SOURCES_INPUT_HINT: 'project-sources-input-hint',
  PROJECT_SOURCES_GO_CHAT_TAB_BTN: 'project-sources-go-chat-tab-btn',
  ADD_SOURCE_MODAL: 'add-source-modal',
  ADD_SOURCE_MODAL_UPLOAD: 'add-source-modal-upload',
  ADD_SOURCE_MODAL_FILE_INPUT: 'add-source-modal-file-input',
  ADD_SOURCE_MODAL_URL_PANEL: 'add-source-modal-url-panel',
  ADD_SOURCE_MODAL_URL_INPUT: 'add-source-modal-url-input',
  ADD_SOURCE_MODAL_URL_SUBMIT: 'add-source-modal-url-submit',
  PROJECT_EDIT_MODAL: 'project-edit-modal',
  PROJECT_EDIT_FILE_ADD: 'project-edit-file-add',
  DELETE_PROJECT: 'delete-project',
  PROJECT_HUB_ROOT: 'project-hub-root',
  /** AppUnified 사이드바 대화 줄 휴지통 */
  SIDEBAR_CONVERSATION_DELETE: 'sidebar-conversation-delete',
  SIDEBAR_DELETE_CONVERSATION_CANCEL: 'sidebar-delete-conversation-cancel',
  SIDEBAR_DELETE_CONVERSATION_CONFIRM: 'sidebar-delete-conversation-confirm',
  /** AppUnified 사이드바 구독·PRO 안내 링크 */
  SIDEBAR_PRO_NAV_LINK: 'sidebar-pro-nav-link',

  /** ChatGPTInterface 헤더·대화 삭제 확인 모달 */
  CHAT_DELETE_CONVERSATION: 'chat-delete-conversation',
  CHAT_DELETE_CONVERSATION_CANCEL: 'chat-delete-conversation-cancel',
  CHAT_DELETE_CONVERSATION_CONFIRM: 'chat-delete-conversation-confirm',
  PROJECT_ITEM: 'project-item',
  PROJECT_DIALOG: 'project-dialog',

  // 대화 (ChatGPTInterface)
  CHAT_INPUT: 'chat-input',
  /** 웰컴·대화 입력 dock (WorkspaceQueryComposer 래퍼) */
  CHAT_INPUT_CONTAINER: 'input-container',
  /** ChatGPTInterface 헤더 PRO·구독 안내 버튼 */
  CHAT_HEADER_PRO_BTN: 'chat-header-pro-btn',
  COMPOSER_RESPONSE_MODE: 'composer-response-mode',
  SEND_BUTTON: 'send-button',
  SAMPLE_COLUMN_RESULT_BTN: 'sample-column-result-btn',
  API_UNREACHABLE_BANNER: 'api-unreachable-banner',
  THREAD_CONTEXT_PANEL: 'thread-context-panel',
  THREAD_CONTEXT_FILE_ADD: 'thread-context-file-add',
  CHAT_THREAD_CONTEXT_SETTINGS: 'chat-thread-context-settings',
  CHAT_HEADER_SEND_MENU: 'chat-header-send-menu',
  CHAT_HEADER_MANAGE_MENU: 'chat-header-manage-menu',
  CHAT_LAYOUT_GENSPARK_AGENT_SESSION: 'chat-layout-genspark-agent-session',
  GENSPARK_AGENT_SESSION_DETAIL: 'genspark-agent-session-detail',
  GENSPARK_AGENT_BANNER_HUB_LINK: 'genspark-agent-banner-hub-link',
  GENSPARK_AGENT_COPY_PUBLIC_LINK: 'genspark-agent-copy-public-link',
  GENSPARK_AGENT_COPY_APP_LINK: 'genspark-agent-copy-app-link',
  GENSPARK_AGENT_EMPTY_STATE: 'genspark-agent-empty-state',
  GENSPARK_MARKETING_HOME: 'genspark-marketing-home',
  GENSPARK_MARKETING_COMPOSER: 'genspark-marketing-composer',
  GENSPARK_AGENTS_HUB: 'genspark-agents-hub',
  GENSPARK_AGENTS_HUB_URL_STRIP: 'genspark-agents-hub-url-strip',
  GENSPARK_AGENTS_HUB_CARD_COPY_ID: 'genspark-agents-hub-card-copy-id',

  // 질문·요구 도우미 (structured input)
  STRUCTURED_INPUT_ASSIST_TOGGLE: 'structured-input-assist-toggle',
  STRUCTURED_INPUT_GUARD: 'structured-input-guard',
  STRUCTURED_INPUT_BADGE: 'structured-input-badge',
  STRUCTURED_INPUT_PREVIEW: 'structured-input-preview',
  STRUCTURED_INPUT_COPY: 'structured-input-copy',
  STRUCTURED_INPUT_SEND: 'structured-input-send',
  STRUCTURED_INPUT_CLOSE: 'structured-input-close',

  // 메시지·로딩
  MESSAGE_USER: 'message-user',
  MESSAGE_ASSISTANT: 'message-assistant',
  MESSAGE_ASSISTANT_STREAMING: 'message-assistant-streaming',
  MESSAGE: 'message',
  AI_RESPONSE: 'ai-response',
  LOADING_INDICATOR: 'loading-indicator',
  TYPING_INDICATOR: 'typing-indicator',
  STREAMING_INDICATOR: 'streaming-indicator',
  MESSAGES_CONTAINER: 'messages-container',
  SCROLL_TO_TOP: 'scroll-to-top',
  SCROLL_TO_BOTTOM: 'scroll-to-bottom',
  ERROR_MESSAGE: 'error-message',

  // 공통 UI
  LOADING_STATE_INITIAL: 'loading-state-initial',
  LOADING_STATE_UPDATING: 'loading-state-updating',
  ERROR_RECOVERY: 'error-recovery',
  ERROR_BOUNDARY: 'error-boundary',
  PROGRESS_INDICATOR: 'progress-indicator',

  // 페이지별
  PAGE_FILE_ANALYSIS: 'page-file-analysis',
  PAGE_DOCUMENTS: 'page-documents',
  PAGE_ANALYTICS: 'page-analytics',
  PAGE_NOTEBOOK: 'page-notebook',
  PAGE_INTEGRATED: 'page-integrated',
  VOICE_GEN_SECTION: 'voice-gen-section',

  // 기타 (검색·메뉴·성능·PWA·지연로딩)
  PROJECT_CREATION_DIALOG: 'project-creation-dialog',
  SEARCH_INPUT: 'search-input',
  SEARCH_RESULTS: 'search-results',
  NEW_CHAT_BUTTON: 'new-chat-button',
  MENU_BUTTON: 'menu-button',
  DRAWER: 'drawer',
  MENU: 'menu',
  LOADING: 'loading',
  OPTIMIZED_IMAGE: 'optimized-image',
  PERFORMANCE_MONITOR: 'performance-monitor',
  PERFORMANCE_DASHBOARD: 'performance-dashboard',
  GENERATE_PERFORMANCE_REPORT: 'generate-performance-report',
  PERFORMANCE_REPORT: 'performance-report',
  OFFLINE_INDICATOR: 'offline-indicator',
  UPDATE_NOTIFICATION: 'update-notification',
  LAZY_LOAD_ERROR: 'lazy-load-error',

  /** 대화 관계도 (ConversationGraphView·답변 패널) */
  CONVERSATION_GRAPH_VIEW: 'conversation-graph-view',
  CONVERSATION_GRAPH_ANSWER_PANEL: 'conversation-graph-answer-panel',
  CONVERSATION_GRAPH_ANSWER_GENERATE: 'conversation-graph-answer-generate',
  CONVERSATION_GRAPH_ANSWER_PIPELINE: 'conversation-graph-answer-pipeline',
  CONVERSATION_GRAPH_ANSWER_RESULT: 'conversation-graph-answer-result',
  CONVERSATION_GRAPH_ANSWER_OPEN_CHAT: 'conversation-graph-answer-open-chat',
  CONVERSATION_GRAPH_ANSWER_OPEN_CHAT_SEND: 'conversation-graph-answer-open-chat-send',
  CONVERSATION_GRAPH_ANSWER_STREAMING: 'conversation-graph-answer-streaming',
  CONVERSATION_GRAPH_ANSWER_TURNS: 'conversation-graph-answer-turns',
  CONVERSATION_GRAPH_ANSWER_TURN: 'conversation-graph-answer-turn',
  /** /chat → /conversation-graph handoff (ChatGPTInterface) */
  CONVERSATION_GRAPH_CHAT_ATTACHED_FILE: 'conversation-graph-chat-attached-file',
  CONVERSATION_GRAPH_CHAT_HANDOFF_BANNER: 'conversation-graph-chat-handoff-banner',
  CONVERSATION_GRAPH_CHAT_HANDOFF_OPEN: 'conversation-graph-chat-handoff-open',
  /** ChatGPTInterface 입력 도크 위 빠른/추천 질문 칩 */
  CHAT_INPUT_DOCK_SUGGESTIONS: 'chat-input-dock-suggestions',
  SUGGESTED_QUESTIONS_FROM_SOURCE: 'suggested-questions-from-source',
  GENSPARK_GENERATION_STATUS: 'genspark-generation-status',
  /** ChatGPTInterface 입력창 하단 5단계 생성 진행 */
  COMPOSER_GENSPARK_GENERATION_STATUS: 'composer-genspark-generation-status',
  /** WorkspaceQueryComposer 질문·요구·요청 삽입 칩 */
  CHAT_COMPOSER_STRUCTURE_CHIPS: 'chat-composer-structure-chips',
  /** 입력창 하단 — 다중 요청·질문+요구 미리보기 안내 */
  CHAT_COMPOSER_INPUT_HINT: 'chat-composer-input-hint',
  /** 입력창 하단 — 다중 요청 항목별 순차 처리 체크리스트 */
  COMPOSER_MULTI_REQUEST_CHECKLIST: 'composer-multi-request-checklist',
  /** GensparkPipelineExtrasPanel — 과업 메타 details */
  COMPOSER_PIPELINE_EXTRAS: 'composer-pipeline-extras',
  /** Council v2 섹션 (과업 메타 내부) */
  COMPOSER_OVERSIGHT_COUNCIL: 'composer-oversight-council',
  /** 어시스턴트 메시지 재생성 버튼 */
  COMPOSER_REGENERATE_MESSAGE: 'composer-regenerate-message',
} as const;
