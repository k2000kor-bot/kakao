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
  PROJECT_SOURCES_INPUT_HINT: 'project-sources-input-hint',
  PROJECT_SOURCES_GO_CHAT_TAB_BTN: 'project-sources-go-chat-tab-btn',
  PROJECT_EDIT_MODAL: 'project-edit-modal',
  PROJECT_EDIT_FILE_ADD: 'project-edit-file-add',
  DELETE_PROJECT: 'delete-project',
  /** AppUnified 사이드바 대화 줄 휴지통 */
  SIDEBAR_CONVERSATION_DELETE: 'sidebar-conversation-delete',
  SIDEBAR_DELETE_CONVERSATION_CANCEL: 'sidebar-delete-conversation-cancel',
  SIDEBAR_DELETE_CONVERSATION_CONFIRM: 'sidebar-delete-conversation-confirm',

  /** ChatGPTInterface 헤더·대화 삭제 확인 모달 */
  CHAT_DELETE_CONVERSATION: 'chat-delete-conversation',
  CHAT_DELETE_CONVERSATION_CANCEL: 'chat-delete-conversation-cancel',
  CHAT_DELETE_CONVERSATION_CONFIRM: 'chat-delete-conversation-confirm',
  PROJECT_ITEM: 'project-item',
  PROJECT_DIALOG: 'project-dialog',

  // 대화 (ChatGPTInterface)
  CHAT_INPUT: 'chat-input',
  COMPOSER_RESPONSE_MODE: 'composer-response-mode',
  SEND_BUTTON: 'send-button',
  SAMPLE_COLUMN_RESULT_BTN: 'sample-column-result-btn',
  API_UNREACHABLE_BANNER: 'api-unreachable-banner',

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
} as const;
