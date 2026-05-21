/**
 * API 설정
 * 모든 API 호출의 기본 URL과 포트를 중앙에서 관리
 *
 * 포트 정책:
 * - 프론트엔드: 3000 (package.json PORT=3000, .env.local PORT=3000)
 * - 백엔드 API: 5002 (backend/api/main.py) — 대화·분석·통합 API
 */
import { errorLogger } from '../utils/errorLogger';

/** 프론트엔드 기본 포트 (개발 서버) */
export const FRONTEND_DEFAULT_PORT = 3000;

/** 개발 시 프론트 헬스 체크 등에 쓰는 폴백 오리진 */
export const FALLBACK_FRONTEND_ORIGIN = `http://localhost:${FRONTEND_DEFAULT_PORT}`;

/** 백엔드 통합 API 기본 포트 (`BACKEND_PORT` / `main_server` 와 맞출 것) */
export const DEFAULT_API_PORT = 5002;

/** `API_BASE_URL`이 빈 문자열일 때 절대 URL이 필요한 fetch/axios용 (예: 개발 프록시 밖 호출) */
export const FALLBACK_API_ORIGIN = `http://localhost:${DEFAULT_API_PORT}`;

/** WebSocket 폴백 (HTTP 폴백과 동일 포트) */
export const FALLBACK_WS_ORIGIN = `ws://localhost:${DEFAULT_API_PORT}`;

// API 기본 URL 설정
// 미설정 시 ''(같은 출처): 개발 시 CRA proxy( package.json "proxy" )로 /api/* 전달, 자체 서버 배포 시 같은 호스트의 /api/* 사용.
// 다른 호스트의 API 사용 시 REACT_APP_API_URL 설정 (예: REACT_APP_API_URL + 기본 포트는 docs/PORTS.md · FALLBACK_API_ORIGIN). docs/FRONTEND_DEPLOYMENT.md 참고.
const envApiUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL;
const hasInvalidPort =
  !!envApiUrl &&
  (envApiUrl.includes(':5001') ||
    envApiUrl.includes(':8000') ||
    envApiUrl.includes(':8001') ||
    envApiUrl.includes(':8003') ||
    envApiUrl.includes(':8004') ||
    envApiUrl.includes(':8005') ||
    envApiUrl.includes(':8007'));

const explicitApiUrl = hasInvalidPort ? `http://localhost:${DEFAULT_API_PORT}` : envApiUrl;
// 자체 서버 배포 시 프론트와 API가 같은 호스트에 있으면 REACT_APP_API_URL 없이 '' 사용 → /api/* 가 같은 출처로 전달됨
export const API_BASE_URL =
  typeof explicitApiUrl === 'string' && explicitApiUrl.length > 0
    ? explicitApiUrl
    : '';

// WebSocket URL 설정
const envWsUrl = process.env.REACT_APP_WS_URL || process.env.REACT_APP_WS_BASE_URL;
const wsHasInvalidPort =
  !!envWsUrl &&
  (envWsUrl.includes(':5001') ||
    envWsUrl.includes(':8000') ||
    envWsUrl.includes(':8001') ||
    envWsUrl.includes(':8003') ||
    envWsUrl.includes(':8004') ||
    envWsUrl.includes(':8005') ||
    envWsUrl.includes(':8007'));

export const WS_BASE_URL = wsHasInvalidPort
  ? FALLBACK_WS_ORIGIN
  : envWsUrl || FALLBACK_WS_ORIGIN;

/** 일반 클라이언트 WS 경로(모니터 UI 표시용). `WS_BASE_URL` 호스트·포트와 맞출 것. */
export const WS_CLIENT_GENERIC_PATH = '/ws';

/** 실시간 협업(`realTimeCollaborationService`) WebSocket 경로. */
export const WS_COLLABORATION_PATH = '/ws/collaboration';

/** 통합 대화 WebSocket 경로 접두사 (`UnifiedAPI.WebSocketManager`, `useWebSocket`). roomId는 `encodeURIComponent`로 이어붙인다. */
export const WS_CHAT_ROOM_PATH_PREFIX = '/ws/chat';

/** 향상 대화 WebSocket 경로 접두사 (`enhancedConversationalService`). conversationId는 `encodeURIComponent`로 이어붙인다. */
export const WS_ENHANCED_CONVERSATION_PATH_PREFIX = '/ws/v2/enhanced';

/** 보안 모니터링 WebSocket (`securityWebSocketService`). */
export const WS_SECURITY_PATH = '/ws/security';

/** 시스템 메트릭 WebSocket (`MetricsWebSocket`). */
export const WS_METRICS_PATH = '/ws/metrics';

/** 보안 알림 WebSocket (`AlertsWebSocket`). */
export const WS_ALERTS_PATH = '/ws/alerts';

/**
 * `API_BASE_URL` + 상대 경로 조합. 베이스가 비면 경로만 반환(CRA proxy·동일 출처 fetch).
 * 베이스·경로 끝/앞 슬래시 중복을 제거한다.
 */
export function joinApiBaseAndPath(configBase: string, path: string): string {
  const p = (path ?? '').trim();
  const normalizedPath = p.startsWith('/') ? p : `/${p}`;
  const b = (configBase ?? '').trim().replace(/\/$/, '');
  return b.length > 0 ? `${b}${normalizedPath}` : normalizedPath;
}

/** `REACT_APP_WS_URL` / 폴백과 동일 오리진 + `/ws` (레거시 5000 하드코딩 제거). */
export function resolveGenericWebSocketClientUrl(): string {
  return joinApiBaseAndPath(WS_BASE_URL || FALLBACK_WS_ORIGIN, WS_CLIENT_GENERIC_PATH);
}

/** 협업 WebSocket 전체 URL — HTTP API와 동일 포트(`DEFAULT_API_PORT`) 기준. */
export function resolveCollaborationWebSocketUrl(): string {
  return joinApiBaseAndPath(WS_BASE_URL || FALLBACK_WS_ORIGIN, WS_COLLABORATION_PATH);
}

/** 절대 API 오리진 (끝 슬래시 제거). `REACT_APP_API_URL` 등은 모듈 상단 로직이 반영된 `API_BASE_URL`을 우선 */
export function resolveApiBaseUrl(): string {
  const base = typeof API_BASE_URL === 'string' ? API_BASE_URL.trim() : '';
  if (base.length > 0) return base.replace(/\/$/, '');
  return FALLBACK_API_ORIGIN;
}

/**
 * 절대 URL에서 `http(s)://host[:port]` 오리진만 추출.
 * 스킴이 `http`/`https`가 아니거나 매치 실패 시 `resolveApiBaseUrl()` (예: UMKS `/api/v1` 베이스에서 공용 health).
 */
export function extractHttpOriginFromBaseUrl(baseUrl: string): string {
  const m = /^https?:\/\/[^/]+/.exec((baseUrl ?? '').trim());
  return m ? m[0] : resolveApiBaseUrl();
}

/**
 * `http(s)://host/.../api/v1` 같은 베이스에서 **호스트 오리진만** 떼어 `path`를 붙인다.
 * (`API_HEALTH_PATH` 등 서버 루트 기준 절대 경로용 — `joinApiBaseAndPath` + `extractHttpOriginFromBaseUrl` 합성.)
 */
export function joinApiPathAtHttpOrigin(configBase: string, path: string): string {
  return joinApiBaseAndPath(extractHttpOriginFromBaseUrl(configBase), path);
}

/**
 * axios 인스턴스 `baseURL`에 사용.
 * `http(s)://host/...` 베이스는 `/api/...` 절대 경로와 조합할 때 `…/api/v1/api/…` 중복을 막기 위해 호스트 오리진만 반환한다.
 * 빈 문자열·비-http(s) 베이스(CRA 프록시 등)는 그대로 둔다.
 */
export function resolveAxiosHttpOriginBaseUrl(configBase: string): string {
  const raw = (configBase ?? '').trim();
  if (!raw) return raw;
  if (/^https?:\/\//i.test(raw)) return extractHttpOriginFromBaseUrl(raw);
  return raw;
}

/**
 * 대화 POST·SSE용 API 오리진.
 * `API_BASE_URL`이 비어 있으면 `FALLBACK_API_ORIGIN` — `apiClient`·`unifiedAPI`(CONFIG||FALLBACK)와 동일.
 */
export function resolveChatApiOrigin(): string {
  const b = (typeof API_BASE_URL === 'string' ? API_BASE_URL : '').trim().replace(/\/$/, '');
  return b.length > 0 ? b : FALLBACK_API_ORIGIN.replace(/\/$/, '');
}

/** 비스트리밍 대화 POST 상대 경로. `getChatPostUrls` 폴백 순서와 동일. */
export const CHAT_POST_PATH = '/api/chat';
export const CHAT_POST_PATH_UNIFIED = '/api/unified/chat';

/** SSE 대화 스트림 상대 경로. `getChatStreamUrls` 순서와 동일. */
export const CHAT_STREAM_PATH = '/api/chat/stream';
export const CHAT_STREAM_PATH_UNIFIED = '/api/unified/chat/stream';

/** 리소스·내비게이션 URL에 백엔드 API 경로가 포함됐는지 검사할 때 사용 (`PerformanceResourceTiming` 등). */
export const API_PATH_IN_URL_MARKER = '/api/';

/** 호스트 오리진에 붙이는 API 루트 세그먼트 (`BackupRecoveryManager` 등 `joinApiHealthCheckUrl(origin, API_HTTP_PATH_PREFIX)`). */
export const API_HTTP_PATH_PREFIX = '/api';

/** 동기화 서버 대화방 목록 (`CHAT_POST_PATH` 대화 POST와 별도 리소스). */
export const CHAT_ROOMS_PATH = '/api/chat-rooms';
/** 대화 메시지 목록 베이스 — `${CHAT_MESSAGES_PATH}/${chatRoomId}` 로 요청. */
export const CHAT_MESSAGES_PATH = '/api/chat-messages';

/** 쿼리·Axios `params` 등에서 쓰는 공통 키(백엔드 스네이크 케이스). */
export const API_QUERY_PARAM_PROJECT_ID = 'project_id';
/** 레거시 분석 쿼리·`FILE_UPLOAD_PATH` FormData 등 — 스네이크 `project_id` 대신 camelCase. */
export const API_QUERY_PARAM_PROJECT_ID_CAMEL = 'projectId';
export const API_QUERY_PARAM_USER_ID = 'user_id';
export const API_QUERY_PARAM_COMPANY_ID = 'company_id';
export const API_QUERY_PARAM_COMPANY_IDS = 'company_ids';
/** 대화 ID (`advancedMessageAPI.getConversationAnalysis` 쿼리, 대화 본문 키 등). */
export const API_QUERY_PARAM_CONVERSATION_ID = 'conversation_id';
export const API_QUERY_PARAM_ISSUE_ID = 'issue_id';
export const API_QUERY_PARAM_LIMIT = 'limit';
export const API_QUERY_PARAM_OFFSET = 'offset';
/** 기간 슬롯·대시보드 구간 (`AdvancedAnalyticsDashboard` user-behavior 등). */
export const API_QUERY_PARAM_PERIOD = 'period';
export const API_QUERY_PARAM_CHAT_ROOM_ID = 'chat_room_id';
export const API_QUERY_PARAM_CHAT_ROOM_NAME = 'chat_room_name';
export const API_QUERY_PARAM_SENDER_ID = 'sender_id';
/** 보안 스캔 유형 (`advancedSecurityService.runSecurityScan`, `securityApi.runSecurityScan`). */
export const API_QUERY_PARAM_SCAN_TYPE = 'scan_type';
/** 음성 인식 결과 등 (`advancedAPIService.getVoiceRecognitionResults`). */
export const API_QUERY_PARAM_SESSION_ID = 'session_id';
export const API_QUERY_PARAM_SEVERITY = 'severity';
export const API_QUERY_PARAM_STATUS = 'status';
/** 기간 필터 (`conversationGraphService` 관계도 등). */
export const API_QUERY_PARAM_START_DATE = 'start_date';
export const API_QUERY_PARAM_END_DATE = 'end_date';
/** 관계도 분석 모드 (`conversationGraphService.fetchRelationshipGraph`). */
export const API_QUERY_PARAM_ANALYSIS_MODE = 'analysis_mode';
/** 알림 목록 필터 (`advancedMessageAPI.getNotifications`). */
export const API_QUERY_PARAM_UNREAD_ONLY = 'unread_only';

/** UMKS 지식 검색·보내기 쿼리 (`ultimateMediaKnowledgeService`). */
export const API_QUERY_PARAM_SEARCH_Q = 'q';
export const API_QUERY_PARAM_MIN_CONFIDENCE = 'min_confidence';
export const API_QUERY_PARAM_MEDIA_TYPE = 'media_type';
export const API_QUERY_PARAM_EXPORT_FORMAT = 'format';
export const API_QUERY_PARAM_RANGE_START = 'start';
export const API_QUERY_PARAM_RANGE_END = 'end';
export const API_QUERY_PARAM_SORT_ORDER = 'order';
/** UMKS 설득 생성 본문 (`ultimateMediaKnowledgeService.createPersuasionFromText`). */
export const API_QUERY_PARAM_SOURCE_TYPE = 'source_type';
/** 분석 등 기간 필터 쿼리 키 (`apiService.getAnalytics`). */
export const API_QUERY_PARAM_TIME_RANGE = 'timeRange';

/**
 * 실거래·등기 부동산 REST 쿼리 (`molitRealEstateService`, `realEstateRegistryService`).
 * 백엔드가 `start_date`가 아닌 camelCase `startDate`를 쓰는 계약과 구분됨.
 */
export const API_QUERY_PARAM_SIDO = 'sido';
export const API_QUERY_PARAM_SIGUNGU = 'sigungu';
export const API_QUERY_PARAM_DONG = 'dong';
export const API_QUERY_PARAM_START_DATE_CAMEL = 'startDate';
export const API_QUERY_PARAM_END_DATE_CAMEL = 'endDate';
export const API_QUERY_PARAM_TRANSACTION_TYPE = 'transactionType';
export const API_QUERY_PARAM_PROPERTY_TYPE_CAMEL = 'propertyType';
export const API_QUERY_PARAM_CHANGE_TYPE = 'changeType';

/** 범용 WS 클라이언트 식별 쿼리 키·값 (`IntegratedMasterInterface`). */
export const API_QUERY_PARAM_CLIENT_ID = 'client_id';
export const WS_CLIENT_ID_MASTER_INTERFACE = 'master_interface';

/** 실시간 협업 WebSocket URL (`realtimeCollaboration`) — REST용 `user_id`와 구분. */
export const API_QUERY_PARAM_USER_ID_CAMEL = 'userId';
export const API_QUERY_PARAM_USERNAME = 'username';

/** Google Generative Language 등 `?key=` 외부 API 키 쿼리. */
export const API_QUERY_PARAM_KEY = 'key';

/** 프로젝트 공유 딥링크 (`projectShareService.generateShareUrl`). */
export const API_QUERY_PARAM_SHARE = 'share';

/** NewsAPI.org REST v2 베이스·경로 (`newsService`). */
export const NEWSAPI_V2_BASE_URL = 'https://newsapi.org/v2';
export const NEWSAPI_PATH_EVERYTHING = 'everything';
export const NEWSAPI_PATH_TOP_HEADLINES = 'top-headlines';
export const API_QUERY_PARAM_NEWS_LANGUAGE = 'language';
export const API_QUERY_PARAM_NEWS_SORT_BY = 'sortBy';
/** NewsAPI는 Google과 달리 쿼리 키 `apiKey` 사용. */
export const API_QUERY_PARAM_NEWS_API_KEY = 'apiKey';
export const API_QUERY_PARAM_NEWS_COUNTRY = 'country';
export const API_QUERY_PARAM_NEWS_CATEGORY = 'category';
/** `getTrendingNews` 기본 국가 필터. */
export const NEWSAPI_DEFAULT_COUNTRY_KR = 'kr';

/** JSON·multipart 필드명 (의도 분석·대화 업로드·스크립트 스타일·홍보·시공 분석 등). */
export const API_JSON_FIELD_MESSAGE = 'message';
export const API_JSON_FIELD_TEXT = 'text';
export const API_JSON_FIELD_FILENAME = 'filename';
export const API_FORM_FIELD_FILE = 'file';
/** 다중 파일 업로드 multipart 키 (`advancedMessageAPI.uploadMediaFiles`). */
export const API_FORM_FIELD_FILES = 'files';
export const API_FORM_FIELD_NAME = 'name';
export const API_JSON_FIELD_SAMPLE_SCRIPT = 'sample_script';
export const API_JSON_FIELD_TOPIC_OR_OUTLINE = 'topic_or_outline';
export const API_JSON_FIELD_DOCUMENT_HINT = 'document_hint';
export const API_JSON_FIELD_SOURCE_FILENAME = 'source_filename';
export const API_FORM_FIELD_TEMPLATE_TYPE = 'template_type';
export const API_FORM_FIELD_VARIABLES = 'variables';
export const API_FORM_FIELD_PROJECT_TYPE = 'project_type';

/** 일반 파일 업로드(FormData) POST 상대 경로. */
export const FILE_UPLOAD_PATH = '/api/upload';
/** 파일 다운로드 베이스 — `${FILE_DOWNLOAD_PATH}/${fileId}` 형태. */
export const FILE_DOWNLOAD_PATH = '/api/download';

/** 파일 컬렉션 — 목록 `GET`, 삭제 `DELETE ${FILES_COLLECTION_PATH}/:name`. */
export const FILES_COLLECTION_PATH = '/api/files';

/** Axios·메트릭 등에서 공통으로 쓰는 상대 경로. */
export const API_HEALTH_PATH = '/api/health';

/**
 * Health·상태 등 **호스트 루트 기준** 절대 경로 URL.
 * - 베이스가 비어 있으면 `healthPath`만 반환(CRA proxy·동일 출처).
 * - `http(s)://` 베이스는 경로가 붙어 있어도 호스트 오리진에 `healthPath`를 붙인다.
 * - 그 외는 `joinApiBaseAndPath`와 동일.
 */
export function joinApiHealthCheckUrl(configBase: string, healthPath: string = API_HEALTH_PATH): string {
  const b = (configBase ?? '').trim();
  if (!b) {
    return joinApiBaseAndPath('', healthPath);
  }
  if (/^https?:\/\//i.test(b)) {
    return joinApiPathAtHttpOrigin(b, healthPath);
  }
  return joinApiBaseAndPath(b, healthPath);
}

export const API_STATUS_PATH = '/api/status';
export const API_PROJECTS_LIST_PATH = '/api/projects';
/** 프로젝트별 분석 뷰 — `.../projects/:id/analytics`. */
export const API_PROJECT_ANALYTICS_SEGMENT = '/analytics';
/** 프로젝트 보이스 소스 — `.../projects/:id/voice-sources`. */
export const API_PROJECT_VOICE_SOURCES_SEGMENT = '/voice-sources';
/**
 * `projectService` — `API_PROJECTS_LIST_PATH` + `/:projectId` 하위 노트북·스튜디오·파일.
 * 프로젝트·소스 ID는 호출부에서 `encodeURIComponent`.
 */
export const API_PROJECT_FILES_SEGMENT = '/files';
/** `mediaKnowledgeAPI` — `.../projects/:id/knowledge`. */
export const API_PROJECT_MEDIA_KNOWLEDGE_SEGMENT = '/knowledge';
/** `mediaKnowledgeAPI` — `.../projects/:id/popups`. */
export const API_PROJECT_POPUPS_SEGMENT = '/popups';
/** `promotionalContentAPI` — `.../projects/:id/materials`. */
export const API_PROJECT_PROMOTIONAL_MATERIALS_SEGMENT = '/materials';
/** `promotionalContentAPI` — `.../projects/:id/campaigns`. */
export const API_PROJECT_PROMOTIONAL_CAMPAIGNS_SEGMENT = '/campaigns';
/** 프로젝트별 대화 세션 목록 — `.../projects/:id/sessions`. */
export const API_PROJECT_SESSIONS_SEGMENT = '/sessions';
/** 프로젝트 AI 설정 — `.../projects/:id/ai-settings` (`ApiService`). */
export const API_PROJECT_AI_SETTINGS_SEGMENT = '/ai-settings';
export const API_PROJECT_NOTEBOOK_CONTEXT_SEGMENT = '/notebook-context';
export const API_PROJECT_NOTEBOOK_SOURCES_SEGMENT = '/notebook-sources';
export const API_PROJECT_NOTEBOOK_SOURCES_FROM_FILE_SEGMENT = '/notebook-sources/from-file';
export const API_PROJECT_NOTEBOOK_SOURCES_FROM_URL_SEGMENT = '/notebook-sources/from-url';
export const API_PROJECT_NOTEBOOK_SOURCES_FROM_YOUTUBE_SEARCH_SEGMENT =
  '/notebook-sources/from-youtube-search';
export const API_PROJECT_NOTEBOOK_STUDIO_GENERATE_SEGMENT = '/notebook-studio/generate';
export const API_PROJECT_NOTEBOOK_STUDIO_OUTPUTS_SEGMENT = '/notebook-studio/outputs';
export const API_PROJECT_NOTEBOOK_SUGGESTED_QUESTIONS_SEGMENT = '/notebook-suggested-questions';
export const API_SESSIONS_LIST_PATH = '/api/sessions';
/** `ApiService` — `API_SESSIONS_LIST_PATH` + `/:sessionId/messages`. */
export const API_SESSION_MESSAGES_SEGMENT = '/messages';
/** `fileUploadService` — `API_SESSIONS_LIST_PATH` + `/:sessionId/upload`. */
export const API_SESSION_UPLOAD_SEGMENT = '/upload';
/** `fileUploadService` — `…/sessions/:sessionId/files` (목록·`:fileId`·분석). */
export const API_SESSION_SCOPED_FILES_SEGMENT = '/files';
/** `fileUploadService` — `…/files/:fileId` + 분석 접미. */
export const API_SESSION_SCOPED_FILE_ANALYSIS_SEGMENT = '/analysis';
/** `advancedContextualWritingService` — `…/sessions/:sessionId/advanced-contextual-writing`. */
export const API_SESSION_ADVANCED_CONTEXTUAL_WRITING_SEGMENT = '/advanced-contextual-writing';
/** `advancedContextualWritingService` — `…/sessions/:sessionId/deep-context-analysis`. */
export const API_SESSION_DEEP_CONTEXT_ANALYSIS_SEGMENT = '/deep-context-analysis';
/** `enhancedWritingService` — `…/sessions/:sessionId/enhanced-writing`. */
export const API_SESSION_ENHANCED_WRITING_SEGMENT = '/enhanced-writing';

/** `integratedMessageService` 비대화 POST·보조 엔드포인트. */
export const INTEGRATED_POST_PATH_ANALYZE = '/api/analyze';
export const INTEGRATED_POST_PATH_GUIDANCE = '/api/guidance';
export const INTEGRATED_POST_PATH_PROJECT = '/api/project';
export const INTEGRATED_POST_PATH_FILE = '/api/file';
export const SYSTEMS_STATUS_PATH = '/api/systems/status';
export const GUIDANCE_GENERATE_PATH = '/api/guidance/generate';
export const LEARNING_FEEDBACK_PATH = '/api/learning/feedback';

/**
 * `fileLearningService` — 파일·세션 학습 REST.
 * 일부 백엔드 빌드에 라우트가 없을 수 있음.
 */
export const API_LEARNING_BASE = '/api/learning';
export const API_LEARNING_START_PATH = `${API_LEARNING_BASE}/start`;
export const API_LEARNING_PREDICT_PATH = `${API_LEARNING_BASE}/predict`;
export const API_LEARNING_MODELS_PATH = `${API_LEARNING_BASE}/models`;
export const API_LEARNING_SESSIONS_PATH = `${API_LEARNING_BASE}/sessions`;
export const API_LEARNING_STATUS_PREFIX = `${API_LEARNING_BASE}/status`;
export const API_LEARNING_STOP_PREFIX = `${API_LEARNING_BASE}/stop`;
export const API_LEARNING_METRICS_PREFIX = `${API_LEARNING_BASE}/metrics`;

/** `fileLearningService` 파일 리소스 (`…/classification` 등). */
export const API_FILES_BASE = '/api/files';
/** `API_FILES_BASE` + `/:fileId` 하위 — fileId는 호출부에서 `encodeURIComponent`. */
export const API_FILES_CLASSIFICATION_SEGMENT = '/classification';
export const API_FILES_INSIGHTS_SEGMENT = '/insights';
export const API_FILES_CONTENT_SEGMENT = '/content';
export const API_FILES_LEARNING_STATUS_SEGMENT = '/learning-status';

/** `unifiedMessageService` — 프로젝트·파일 본문 처리 POST. */
export const API_PROJECTS_PROCESS_PATH = '/api/projects/process';
export const API_FILE_PROCESS_PATH = '/api/file/process';

/** ApiService(axios) — 시스템·분석·성능 모니터. */
export const API_SYSTEM_STATUS_PATH = '/api/system/status';
export const API_SYSTEM_METRICS_PATH = '/api/system/metrics';
export const API_SYSTEM_RESTART_PATH = '/api/system/restart';
export const API_SYSTEM_BACKUP_PATH = '/api/system/backup';
/** `apiService.system` 등 레거시 루트(`/api/system/*` 아님). */
export const API_LEGACY_ROOT_METRICS_PATH = '/api/metrics';
export const API_LEGACY_ROOT_RESTART_PATH = '/api/restart';
export const API_LEGACY_ROOT_BACKUP_PATH = '/api/backup';
export const API_LEGACY_ROOT_LOGS_PATH = '/api/logs';
export const API_ANALYTICS_PATH = '/api/analytics';
export const API_USER_SETTINGS_PATH = '/api/user/settings';
export const API_PERFORMANCE_METRICS_PATH = '/api/performance/metrics';
export const API_PERFORMANCE_ANALYSIS_PATH = '/api/performance/analysis';
export const API_PERFORMANCE_OPTIMIZE_PATH = '/api/performance/optimize';
export const API_PERFORMANCE_OPTIMIZATION_HISTORY_PATH = '/api/performance/optimization/history';
export const API_PERFORMANCE_CONFIG_PATH = '/api/performance/config';
export const API_PERFORMANCE_HEALTH_PATH = '/api/performance/health';
export const API_PERFORMANCE_RECOMMENDATIONS_PATH = '/api/performance/recommendations';

/**
 * `performance_monitor_api` — `/api` 접두 없음 (`main_server`).
 * `API_PERFORMANCE_*`(`/api/performance/*`)와 별도.
 */
export const PERFORMANCE_MONITOR_HEALTH_PATH = '/performance/health';
export const PERFORMANCE_MONITOR_METRICS_PATH = '/performance/metrics';
export const PERFORMANCE_MONITOR_START_MONITORING_PATH = '/performance/start-monitoring';
export const PERFORMANCE_MONITOR_STOP_MONITORING_PATH = '/performance/stop-monitoring';
/** POST `{prefix}/{alertId}/resolve` (`performance_monitor_api`). */
export const PERFORMANCE_MONITOR_ALERTS_PATH_PREFIX = '/performance/alerts';
export const PERFORMANCE_MONITOR_EXPORT_PATH = '/performance/export';

/**
 * `analytics_api` — 접두 없음, 전체 경로 `/analytics/*` (`main_server`).
 */
export const ANALYTICS_ROUTER_OVERVIEW_PATH = '/analytics/overview';
export const ANALYTICS_ROUTER_USER_BEHAVIOR_PATH = '/analytics/user-behavior';
export const ANALYTICS_ROUTER_AI_PERFORMANCE_PATH = '/analytics/ai-performance';
export const ANALYTICS_ROUTER_BUSINESS_METRICS_PATH = '/analytics/business-metrics';
export const ANALYTICS_ROUTER_PREDICTIONS_PATH = '/analytics/predictions';
export const ANALYTICS_ROUTER_CUSTOM_REPORT_PATH = '/analytics/custom-report';
/** GET `{prefix}/{reportId}` — 쿼리 `format` 등은 호출부에서 붙임. */
export const ANALYTICS_ROUTER_EXPORT_PATH_PREFIX = '/analytics/export';

/**
 * `ai_analytics_api` — 라우터 접두 `/ai-analytics` (`main_server`).
 */
export const AI_ANALYTICS_ROUTER_BASE = '/ai-analytics';
export const AI_ANALYTICS_ROUTER_METRICS_PATH = `${AI_ANALYTICS_ROUTER_BASE}/metrics`;
export const AI_ANALYTICS_ROUTER_RECENT_PATH = `${AI_ANALYTICS_ROUTER_BASE}/recent`;
export const AI_ANALYTICS_ROUTER_PERFORMANCE_PATH = `${AI_ANALYTICS_ROUTER_BASE}/performance`;
export const AI_ANALYTICS_ROUTER_ANALYZE_PATH = `${AI_ANALYTICS_ROUTER_BASE}/analyze`;
export const AI_ANALYTICS_ROUTER_START_PATH = `${AI_ANALYTICS_ROUTER_BASE}/start`;
export const AI_ANALYTICS_ROUTER_STOP_PATH = `${AI_ANALYTICS_ROUTER_BASE}/stop`;
export const AI_ANALYTICS_ROUTER_EXPORT_PATH = `${AI_ANALYTICS_ROUTER_BASE}/export`;
export const AI_ANALYTICS_ROUTER_INSIGHTS_PATH = `${AI_ANALYTICS_ROUTER_BASE}/insights`;
export const AI_ANALYTICS_ROUTER_HEALTH_PATH = `${AI_ANALYTICS_ROUTER_BASE}/health`;

/**
 * `services/api.ts` ApiService — axios 오리진 베이스용 레거시 경로(`/api` 없음).
 * 실제 `ai_engine_api`는 `/api/ai/*` (`AI_ENGINE_METRICS_PATH` 등) — 엔드포인트별로 별도 대조.
 */
export const API_SERVICE_LEGACY_AI_INITIALIZE_PATH = '/ai/initialize';
export const API_SERVICE_LEGACY_AI_SWITCH_MODEL_PATH = '/ai/switch-model';
export const API_SERVICE_LEGACY_AI_REALTIME_ANALYSIS_START_PATH = '/ai/realtime-analysis/start';
export const API_SERVICE_LEGACY_AI_SENTIMENT_PATH = '/ai/sentiment-analysis';
export const API_SERVICE_LEGACY_AI_INTENT_PATH = '/ai/intent-detection';
export const API_SERVICE_LEGACY_AI_STATUS_PATH = '/ai/status';
export const API_SERVICE_LEGACY_AI_MODEL_PERFORMANCE_PATH = '/ai/model-performance';

/**
 * `advanced_security_api` — 라우트가 `/security/...` 전체 경로(`/api` 접두 없음).
 * `advancedSecurityService` axios `baseURL`은 HTTP 오리진만.
 */
export const ADVANCED_SECURITY_THREATS_PATH = '/security/threats';
export const ADVANCED_SECURITY_EVENTS_PATH = '/security/events';
export const ADVANCED_SECURITY_ENCRYPT_PATH = '/security/encrypt';
export const ADVANCED_SECURITY_DECRYPT_PATH = '/security/decrypt';
export const ADVANCED_SECURITY_KEYS_PATH = '/security/keys';
export const ADVANCED_SECURITY_HASH_PATH = '/security/hash';
export const ADVANCED_SECURITY_VERIFY_PASSWORD_PATH = '/security/verify-password';
export const ADVANCED_SECURITY_GENERATE_TOKEN_PATH = '/security/generate-token';
export const ADVANCED_SECURITY_VERIFY_TOKEN_PATH = '/security/verify-token';
export const ADVANCED_SECURITY_AUDIT_LOGS_PATH = '/security/audit-logs';
export const ADVANCED_SECURITY_STATUS_PATH = '/security/status';
export const ADVANCED_SECURITY_SCAN_PATH = '/security/scan';
export const ADVANCED_SECURITY_IP_BLOCK_PATH = '/security/ip/block';
export const ADVANCED_SECURITY_IP_BLOCKED_PATH = '/security/ip/blocked';
export const ADVANCED_SECURITY_IP_WHITELIST_PATH = '/security/ip/whitelist';
export const ADVANCED_SECURITY_RATE_LIMIT_PATH = '/security/rate-limit';
export const ADVANCED_SECURITY_POLICIES_PATH = '/security/policies';
export const ADVANCED_SECURITY_ALERTS_PATH = '/security/alerts';

/** 로컬 LLM(Ollama) — 호스트는 `LOCAL_LLM_BASE_URL` 등으로 별도. */
export const API_OLLAMA_TAGS_PATH = '/api/tags';

/** LM Studio 등 OpenAI 호환 로컬 API — 베이스는 `REACT_APP_LM_STUDIO_BASE_URL`. */
export const OPENAI_COMPAT_V1_MODELS_PATH = '/v1/models';
export const OPENAI_COMPAT_V1_CHAT_COMPLETIONS_PATH = '/v1/chat/completions';
export const OPENAI_COMPAT_V1_EMBEDDINGS_PATH = '/v1/embeddings';

/** 공식 OpenAI API 호스트 — `joinApiBaseAndPath(OPENAI_OFFICIAL_API_BASE_URL, OPENAI_COMPAT_V1_*_PATH)`. */
export const OPENAI_OFFICIAL_API_BASE_URL = 'https://api.openai.com';
/** 공식 OpenAI REST `/v1` 베이스 (`openAIService` env 미설정 시). */
export const OPENAI_OFFICIAL_API_V1_BASE_URL = 'https://api.openai.com/v1';

/** Anthropic Messages API (`externalAIService` 등). */
export const ANTHROPIC_API_BASE_URL = 'https://api.anthropic.com';
export const ANTHROPIC_API_V1_MESSAGES_PATH = '/v1/messages';

/** Google AI Generative Language API v1beta (`externalAIService`, `aiService`). */
export const GOOGLE_GENERATIVE_LANGUAGE_V1BETA_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
/** `aiService` 기본 프로 모델 — `models/{id}:generateContent` 조립용. */
export const GOOGLE_GEMINI_MODEL_ID_LEGACY_PRO = 'gemini-pro';

/** 공인 IP 조회 JSON 엔드포인트 (`securityService`). */
export const IPIFY_PUBLIC_IP_JSON_URL = 'https://api.ipify.org?format=json';

/** Genspark 공개 에이전트 디렉터리 (`gensparkAgentRegistry`, `gensparkReferenceAgentPreset`). */
export const PUBLIC_GENSPARK_AGENTS_ORIGIN = 'https://www.genspark.ai/agents';

/** 데모·폴백 플레이스홀더 이미지 (`aiResponseService`). */
export const DEMO_PLACEHOLDER_IMAGE_URL = 'https://via.placeholder.com/400x300';

/** 파일 업로드 시뮬레이션 URL 베이스 (`chatService.uploadFile`). */
export const DEMO_MOCK_UPLOAD_BASE_URL = 'https://example.com/uploads';

/** 샘플 데이터 소스용 Corbu 메트릭 API URL (`ultraAdvancedAIDataAnalyticsSystem`). */
export const DEMO_CORBU_API_METRICS_URL = 'https://api.corbu.ai/metrics';

/** 웹 검색 시뮬레이션 샘플 URL (`webSearchService`). */
export const DEMO_SIM_LAW_GO_KR_URL = 'https://law.go.kr/LSW/lsInfoP.do?lsiSeq=123456';
export const DEMO_SIM_EXAMPLE_RECONSTRUCTION_GUIDE_URL = 'https://example.com/reconstruction-guide';
export const DEMO_SIM_EXAMPLE_CONSTRUCTION_QUALITY_URL = 'https://example.com/construction-quality-report';
export const DEMO_SIM_G2B_SUBFRAME_URL =
  'https://www.g2b.go.kr/pt/menu/selectSubFrame.do?framesrc=/pt/menu/frameTgong.do';
export const DEMO_SIM_URBANDB_URL = 'https://urbandb.net';
export const DEMO_SIM_DATA_GO_KR_BID_OPENAPI_URL = 'https://www.data.go.kr/data/15023678/openapi.do';
export const DEMO_SIM_G2B_ROOT_URL = 'https://www.g2b.go.kr';
export const DEMO_SIM_EXAMPLE_APARTMENT_PRICE_URL = 'https://example.com/apartment-price-analysis';
export const DEMO_SIM_NAVER_SEARCH_URL = 'https://search.naver.com/search.naver';
export const DEMO_SIM_DAUM_SEARCH_URL = 'https://search.daum.net/search';

/** 울트라 분석 샘플 스트림 소스 (`ultraAdvancedAIDataAnalyticsSystem`). */
export const DEMO_SIM_KAFKA_EMOTION_ANALYSIS_URL = 'kafka://localhost:9092/emotion-analysis';

/** 웹검색 통합 모의 소스 베이스 (`webSearchIntegrationService.generateMockUrl`). */
export const DEMO_SIM_INTEGRATION_WEB_BASE_URL = 'https://example.com';
/** UI 플레이스홀더·도움말용 예시 문서 URL (`NotebookLLM`, `ProjectEditModal` 등). */
export const DEMO_SIM_EXAMPLE_ARTICLE_PAGE_URL = `${DEMO_SIM_INTEGRATION_WEB_BASE_URL}/article`;
/** 연동 웹훅 URL 입력 예시 (`IntegrationsView`). */
export const DEMO_SIM_WEBHOOK_CORBU_EXAMPLE_URL = `${DEMO_SIM_INTEGRATION_WEB_BASE_URL}/hooks/corbu`;

/** Figma Brainwave AI UI Kit — 대화 화면 노드 (`ChatGPTInterface` `data-brainwave-figma`). */
export const FIGMA_BRAINWAVE_AI_UI_KIT_CHAT_URL =
  'https://www.figma.com/design/9ZrEa3dcS8zb0O6Nr5lT8m/Brainwave-AI-UI-Kit?node-id=7-3&m=dev';
/** Figma Brainwave AI UI Kit — 통합 앱 노드 (`AppUnified` `data-brainwave-figma`). */
export const FIGMA_BRAINWAVE_AI_UI_KIT_APP_URL =
  'https://www.figma.com/design/9ZrEa3dcS8zb0O6Nr5lT8m/Brainwave-AI-UI-Kit-%F0%9F%9A%80?node-id=323-168775&m=dev';

/** 외부 영상(YouTube·TikTok) URL 입력 안내 플레이스홀더 (`AdvancedFeaturesPanel`). */
export const DEMO_PLACEHOLDER_YOUTUBE_OR_TIKTOK_URL_HINT =
  'https://www.youtube.com/... 또는 https://www.tiktok.com/...';

export const DEMO_SIM_STACKOVERFLOW_BASE_URL = 'https://stackoverflow.com';
export const DEMO_SIM_GITHUB_BASE_URL = 'https://github.com';
export const DEMO_SIM_DOCS_EXAMPLE_BASE_URL = 'https://docs.example.com';
export const DEMO_SIM_NEWS_EXAMPLE_BASE_URL = 'https://news.example.com';

/** 시공사 샘플 데이터 웹사이트 (`constructionCompanyService`). */
export const DEMO_SAMSUNG_CORP_WEBSITE_URL = 'https://www.samsung.com';
export const DEMO_HYUNDAI_CORP_WEBSITE_URL = 'https://www.hyundai.com';

/** 고급 콘텐츠 생성 웹검색 시뮬 (`advancedContentGenerationService`). */
export const DEMO_SIM_EXAMPLE_ARTICLE_1_URL = 'https://example.com/article1';
export const DEMO_SIM_EXAMPLE_ARTICLE_2_URL = 'https://example.com/article2';

/** 학습 추천 엔진 샘플 콘텐츠 (`advancedLearningRecommendationEngine`). */
export const DEMO_SIM_EXAMPLE_HTML_GUIDE_URL = 'https://example.com/html-guide';
export const DEMO_SIM_EXAMPLE_REACT_HOOKS_URL = 'https://example.com/react-hooks';

/**
 * Corbu 배포별 모델 예측 엔드포인트 (`advancedAIModelLifecycleSystem`).
 * `environment`가 비면 `prod`로 간주합니다.
 */
export function buildCorbuModelPredictUrl(environment: string, modelId: string): string {
  const e = String(environment ?? '').trim() || 'prod';
  const id = String(modelId ?? '').trim();
  return `https://api-${e}.corbu.ai/models/${encodeURIComponent(id)}/predict`;
}

/** 서울시 정비사업 정보몽땅(클린업시스템) 포털 베이스 (`notebookLLMService` 등). */
export const SEOUL_CLEANUP_INFO_PORTAL_BASE_URL = 'https://cleanup.seoul.go.kr';

/** 정비사업 현황 메인(절대 URL) (`webSearchService` 샘플 결과 등). */
export const SEOUL_CLEANUP_BSNSTTUS_MAIN_URL = `${SEOUL_CLEANUP_INFO_PORTAL_BASE_URL}/cleanup/bsnssttus/lscrMainIndx.do`;

/** 보안 WebSocket 클라이언트 경로 접두사. `clientId`는 `joinApiSecurityWebSocketClientPath`. */
export const API_SECURITY_WEBSOCKET_WS_PATH_PREFIX = '/api/security-websocket/ws';

export function joinApiSecurityWebSocketClientPath(clientId: string): string {
  return `${API_SECURITY_WEBSOCKET_WS_PATH_PREFIX}/${encodeURIComponent(clientId)}`;
}

/** 기본 클라이언트(`client1`) — `websocket.ts` 싱글톤. */
export const API_SECURITY_WEBSOCKET_CLIENT_WS_PATH = joinApiSecurityWebSocketClientPath('client1');

/** 문맥 이해 v1(`contextualUnderstandingService`). */
export const API_V1_CONTEXTUAL_ANALYSIS_PATH = '/api/v1/contextual-analysis';
export const API_V1_CONTEXTUAL_RESPONSE_PATH = '/api/v1/contextual-response';

/** Ultra 브레인워시(`advancedBrainwashAPI`). */
export const API_ULTRA_NEURAL_BRAINWASH_PATH = '/api/ultra/neural_brainwash';
export const API_ULTRA_EXTREME_PERSUASION_PATH = '/api/ultra/extreme_persuasion';
export const API_ULTRA_QUANTUM_CONVERSATION_PATH = '/api/ultra/quantum_conversation';
export const API_ULTRA_HYBRID_NEURAL_ASSERTIVE_PATH = '/api/ultra/hybrid_neural_assertive';
export const API_ULTRA_PSYCHOLOGICAL_PROFILING_PATH = '/api/ultra/psychological_profiling';

/** 백엔드 통합 시스템(`backendIntegrationSystem`) 엔드포인트. */
export const API_TEXT_ANALYZE_PATH = '/api/text/analyze';
export const API_SENTIMENT_ANALYZE_PATH = '/api/sentiment/analyze';
export const API_CODE_ANALYZE_PATH = '/api/code/analyze';
export const API_DATA_ANALYZE_SERVICE_PATH = '/api/data/analyze';
export const API_LEARNING_ANALYZE_PATH = '/api/learning/analyze';
/** `/api/performance/analysis`와 구분 — 통합 시스템용 analyze. */
export const API_PERFORMANCE_ANALYZE_SERVICE_PATH = '/api/performance/analyze';
export const API_DOCUMENT_PROCESS_PATH = '/api/document/process';
export const API_RECOMMENDATIONS_ROOT_PATH = '/api/recommendations';

/** v7 API 루트 접두사(`contextualAnalysisService` 등). */
export const API_V7_ROOT_PATH = '/api/v7';
export const API_V7_CONTEXTUAL_ANALYSIS_PATH = `${API_V7_ROOT_PATH}/contextual-analysis`;

/** 통합 시스템 API(`integratedSystemAPI`)·`apiOptimizationService` 메트릭. */
export const EMOTION_RECOGNITION_ANALYZE_PATH = '/api/emotion-recognition/analyze';
export const DATA_ANALYTICS_SOURCES_PATH = '/api/data-analytics/sources';
export const DATA_ANALYTICS_ANALYSES_PATH = '/api/data-analytics/analyses';
export const DATA_ANALYTICS_VISUALIZATIONS_PATH = '/api/data-analytics/visualizations';
export const DATA_ANALYTICS_INSIGHTS_PATH = '/api/data-analytics/insights';
export const DATA_ANALYTICS_METRICS_PATH = '/api/data-analytics/metrics';
export const QUALITY_ASSURANCE_TESTS_PATH = '/api/quality-assurance/tests';
export const QUALITY_ASSURANCE_TEST_SUITES_PATH = '/api/quality-assurance/test-suites';
export const QUALITY_ASSURANCE_AUTOMATED_EXECUTION_PATH = '/api/quality-assurance/automated-execution';
export const QUALITY_ASSURANCE_METRICS_PATH = '/api/quality-assurance/metrics';
export const QUALITY_ASSURANCE_REPORTS_PATH = '/api/quality-assurance/reports';
export const PERFORMANCE_OPTIMIZATION_METRICS_PATH = '/api/performance-optimization/metrics';
export const PERFORMANCE_OPTIMIZATION_HEALTH_PATH = '/api/performance-optimization/health';
export const PERFORMANCE_OPTIMIZATION_RULES_PATH = '/api/performance-optimization/rules';
export const PERFORMANCE_OPTIMIZATION_OPTIMIZE_PATH = '/api/performance-optimization/optimize';
export const PERFORMANCE_OPTIMIZATION_REPORT_PATH = '/api/performance-optimization/report';
export const COMPREHENSIVE_ANALYSIS_PATH = '/api/comprehensive-analysis';
/** 통합 시스템 전용 업로드(`FILE_UPLOAD_PATH` `/api/upload` 와 별도). */
export const INTEGRATED_FILE_UPLOAD_PATH = '/api/file/upload';
export const REAL_TIME_METRICS_PATH = '/api/real-time/metrics';
export const SYSTEM_CONFIG_PATH = '/api/system/config';

/** 지속 대화 세션(`persistentChatSessionService`). */
export const API_PERSISTENT_SESSIONS_PATH = '/api/persistent-sessions';
/** `GET` 목록 쿼리 — `chatGPTProjectService`·`persistentChatSessionService`. */
export const API_PERSISTENT_SESSIONS_LIST_QUERY_LIMIT_100 = API_QUERY_PARAM_LIMIT + '=100';
export const API_PERSISTENT_SESSIONS_LIST_QUERY_ACTIVE_LIMIT_100 =
  API_QUERY_PARAM_STATUS + '=active&' + API_QUERY_PARAM_LIMIT + '=100';
/** `…/persistent-sessions/:id/messages` — 세션·프로젝트 ID는 호출부에서 `encodeURIComponent`. */
export const API_PERSISTENT_SESSION_MESSAGES_SEGMENT = '/messages';
/** `…/persistent-sessions/:id/upload`. */
export const API_PERSISTENT_SESSION_UPLOAD_SEGMENT = '/upload';
/** `…/persistent-sessions/:id/files`. */
export const API_PERSISTENT_SESSION_FILES_SEGMENT = '/files';
/** `…/persistent-sessions/:id/archive`. */
export const API_PERSISTENT_SESSION_ARCHIVE_SEGMENT = '/archive';
/** `…/persistent-sessions/:id/restore`. */
export const API_PERSISTENT_SESSION_RESTORE_SEGMENT = '/restore';
/** `…/persistent-sessions/stats`. */
export const API_PERSISTENT_SESSION_STATS_SEGMENT = '/stats';
/** 대화 유형·생성(`dialogueAPI`). */
export const API_DIALOGUE_TYPES_PATH = '/api/dialogue-types';
export const API_GENERATE_DIALOGUE_PATH = '/api/generate-dialogue';
export const API_ANALYZE_CONTEXT_PATH = '/api/analyze-context';

export const AUTH_LOGIN_PATH = '/api/auth/login';
export const AUTH_LOGOUT_PATH = '/api/auth/logout';
export const AUTH_REFRESH_PATH = '/api/auth/refresh';
export const AUTH_REGISTER_PATH = '/api/auth/register';
export const AUTH_CHANGE_PASSWORD_PATH = '/api/auth/change-password';
export const AUTH_RESET_PASSWORD_PATH = '/api/auth/reset-password';
export const SECURITY_EVENTS_PATH = '/api/security/events';
export const SECURITY_METRICS_PATH = '/api/security/metrics';
export const SECURITY_CONFIG_PATH = '/api/security/config';
export const SECURITY_POLICIES_PATH = '/api/security/policies';
export const SECURITY_AUDIT_PATH = '/api/security/audit';
export const SECURITY_SCAN_PATH = '/api/security/scan';
export const SECURITY_SCAN_HISTORY_PATH = '/api/security/scan/history';
export const SECURITY_SERVICE_HEALTH_PATH = '/api/security/health';
export const SECURITY_THREATS_PATH_PREFIX = '/api/security/threats';
/** 문서화·데모용 보안 검증 샘플 경로(`advancedAIDocumentationAPISystem`). */
export const API_SECURITY_VALIDATE_PATH = '/api/security/validate';

/** 클라이언트 에러 리포트 수집(`errorHandlingService`). */
export const API_ERRORS_REPORT_PATH = '/api/errors';

/** 메시지·AI 래퍼 API 등에서 공통으로 쓰는 상대 경로. */
export const MESSAGE_FORMATS_PATH = '/api/message-formats';
/** 스모크·연결 테스트용 엔드포인트. */
export const API_SMOKE_TEST_PATH = '/api/test';
export const UPLOAD_MEDIA_PATH = '/api/upload-media';
export const API_FEATURES_PATH = '/api/features';
export const CONTENT_GENERATE_PATH = '/api/content/generate';
export const ANALYSIS_PERFORM_PATH = '/api/analysis/perform';

/** `messageResponseAPI` — 생성·분석·동기화 상대 경로. */
export const MESSAGE_RESPONSE_GENERATE_PATH = '/api/generate-message';
export const MESSAGE_RESPONSE_ANALYZE_CONVERSATION_PATH = '/api/analyze-conversation';
export const MESSAGE_RESPONSE_SIMULATE_PATH = '/api/simulate-response';
export const MEDIA_FILES_PREFIX_PATH = '/api/media-files';
export const MESSAGE_RESPONSE_SYNC_PATH = '/api/sync';
export const MESSAGE_RESPONSE_SYNC_STATUS_PATH = '/api/sync-status';

/** `EnhancedUserExperience` 등 사용자 UX API. */
export const USER_PREFERENCES_PATH = '/api/user/preferences';
export const USER_STATS_PATH = '/api/user/stats';
export const USER_FEEDBACK_PATH = '/api/user/feedback';
export const USER_NOTIFICATIONS_PATH = '/api/user/notifications';
export const USER_NOTIFICATIONS_READ_ALL_PATH = '/api/user/notifications/read-all';
export const USER_ACTIVITIES_PATH = '/api/user/activities';
export const USER_EXPERIENCE_HEALTH_PATH = '/api/user/health';

/** `AdvancedAIEngine` — 엔진·모델 관리. */
export const AI_ENGINE_METRICS_PATH = '/api/ai/engine/metrics';
export const AI_MODELS_STATUS_PATH = '/api/ai/models/status';
export const AI_PROCESS_PATH = '/api/ai/process';
export const AI_MODELS_BASE_PATH = '/api/ai/models';
export const AI_PROCESSING_HISTORY_PATH = '/api/ai/processing/history';
export const AI_TRAINING_HISTORY_PATH = '/api/ai/training/history';
export const AI_ENGINE_HEALTH_PATH = '/api/ai/health';
/** 문서화 샘플 — 심리·감정 API(`advancedAIDocumentationAPISystem`). */
export const API_PSYCHOLOGY_EMOTIONS_PATH = '/api/psychology/emotions';

/** v7 실시간 동기화 HTTP 폴백(`realTimeSync`). */
export const API_V7_SYNC_PATH = '/api/v7/sync';
/** v7 대화방·메시지 목록(`apiHelper`·`apiService`와 동일 경로). */
export const API_V7_CHAT_ROOMS_PATH = '/api/v7/chat-rooms';
export const API_V7_CHAT_MESSAGES_PATH_PREFIX = '/api/v7/chat-messages';
/** 레거시 대화 파일 업로드(`apiHelper`). v8 업로드는 `API_V8_BASE`/upload-chat. */
export const API_UPLOAD_CHAT_PATH = '/api/upload-chat';

/** `AIService` custom 모델 백엔드 생성 프록시. */
export const API_GENERATE_PATH = '/api/generate';

/** 홍보·전달 API(`promotionalContentAPI`). */
export const PROMOTIONAL_MATERIALS_PATH = '/api/promotional-materials';
export const DELIVERY_PLANS_PATH = '/api/delivery-plans';
export const MARKETING_CAMPAIGNS_PATH = '/api/marketing-campaigns';
export const CONTENT_TEMPLATES_PATH = '/api/content-templates';
export const PROMOTIONAL_GENERATE_CONTENT_PATH = '/api/generate-content';
export const MATERIALS_BASE_PATH = '/api/materials';

/** 궁극·향상·통합 메시지 API 공통. */
export const MESSAGE_STRATEGIES_PATH = '/api/strategies';
export const MESSAGE_TONES_PATH = '/api/tones';
export const GENERATE_ULTIMATE_MESSAGE_PATH = '/api/generate-ultimate-message';
export const UPDATE_USER_PROFILE_PATH = '/api/update-user-profile';
export const USER_PROFILE_PATH_PREFIX = '/api/user-profile';
export const MESSAGE_HISTORY_PATH_PREFIX = '/api/message-history';
export const GENERATE_ENHANCED_MESSAGE_PATH = '/api/generate-enhanced-message';
export const GENERATE_FORMATTED_MESSAGE_PATH = '/api/generate-formatted-message';
export const GENERATE_ADVANCED_MESSAGE_PATH = '/api/generate-advanced-message';
export const GENERATE_CONTEXTUAL_MESSAGE_PATH = '/api/generate-contextual-message';
export const GENERATE_KAKAO_MESSAGE_PATH = '/api/generate-kakao-message';
export const ANALYZE_MESSAGES_PATH = '/api/analyze-messages';
export const ANALYZE_EMOTION_PATH = '/api/analyze-emotion';
export const ANALYZE_PATTERNS_PATH = '/api/analyze-patterns';
export const PREDICT_BEHAVIOR_PATH = '/api/predict-behavior';
export const USER_PERFORMANCE_METRICS_PATH_PREFIX = '/api/performance-metrics';
export const GENERATE_QUANTUM_MESSAGE_PATH = '/api/generate-quantum-message';
export const QUANTUM_ANALYSIS_PATH = '/api/quantum-analysis';
export const QUANTUM_PREDICTION_PATH = '/api/quantum-prediction';
export const ANALYZE_FILE_PATH_PREFIX = '/api/analyze-file';

/** 통합 서비스 `/api/integrated/*` (`integratedAPIService`, 대시보드·마케팅 UI 등). */
export const INTEGRATED_API_BASE = '/api/integrated';
export const INTEGRATED_API_ANALYTICS_PATH = `${INTEGRATED_API_BASE}/analytics`;
export const INTEGRATED_API_ANALYZE_PATH = `${INTEGRATED_API_BASE}/analyze`;
export const INTEGRATED_API_STATUS_PATH = `${INTEGRATED_API_BASE}/status`;
export const INTEGRATED_API_HEALTH_PATH = `${INTEGRATED_API_BASE}/health`;
export const INTEGRATED_API_METRICS_PATH = `${INTEGRATED_API_BASE}/metrics`;
export const INTEGRATED_API_ANALYTICS_ADVANCED_PATH = `${INTEGRATED_API_BASE}/analytics/advanced`;
export const INTEGRATED_API_ANALYTICS_PREDICTIONS_PATH = `${INTEGRATED_API_BASE}/analytics/predictions`;
export const INTEGRATED_API_ANALYTICS_INSIGHTS_PATH = `${INTEGRATED_API_BASE}/analytics/insights`;
export const INTEGRATED_API_AI_OPTIMIZE_PATH = `${INTEGRATED_API_BASE}/ai/optimize`;
export const INTEGRATED_API_AI_BENCHMARK_PATH = `${INTEGRATED_API_BASE}/ai/benchmark`;
export const INTEGRATED_API_AI_FEEDBACK_PATH = `${INTEGRATED_API_BASE}/ai/feedback`;
export const INTEGRATED_API_CREATIVE_STORY_PATH = `${INTEGRATED_API_BASE}/creative/story`;
export const INTEGRATED_API_CREATIVE_POEM_PATH = `${INTEGRATED_API_BASE}/creative/poem`;
export const INTEGRATED_API_CREATIVE_ESSAY_PATH = `${INTEGRATED_API_BASE}/creative/essay`;
export const INTEGRATED_API_CREATIVE_ANALYZE_PATH = `${INTEGRATED_API_BASE}/creative/analyze`;
export const INTEGRATED_API_PERSUASION_CONSTRUCTION_PATH = `${INTEGRATED_API_BASE}/persuasion/construction`;
export const INTEGRATED_API_PERSUASION_CONTRACTOR_PATH = `${INTEGRATED_API_BASE}/persuasion/contractor`;
export const INTEGRATED_API_PERSUASION_ANALYZE_PATH = `${INTEGRATED_API_BASE}/persuasion/analyze`;
export const INTEGRATED_API_MARKETING_SOCIAL_PATH = `${INTEGRATED_API_BASE}/marketing/social`;
export const INTEGRATED_API_MARKETING_EMAIL_PATH = `${INTEGRATED_API_BASE}/marketing/email`;
export const INTEGRATED_API_MARKETING_ANALYZE_PATH = `${INTEGRATED_API_BASE}/marketing/analyze`;

/** 자동화 워크플로(`AutomationWorkflowManager`, `automationViewService`). */
export const API_AUTOMATION_BASE = '/api/automation';
export const API_AUTOMATION_STATUS_PATH = `${API_AUTOMATION_BASE}/status`;
export const API_AUTOMATION_WORKFLOWS_PATH = `${API_AUTOMATION_BASE}/workflows`;
export const API_AUTOMATION_EXECUTIONS_PATH = `${API_AUTOMATION_BASE}/executions`;

/**
 * 백업·복구 UI(`BackupRecoveryManager`) — 베이스가 `…/api`(또는 `REACT_APP_BACKUP_API_URL`)일 때 접미.
 * 예: `${backupApiBase}${API_BACKUP_JOBS_SUFFIX}` → `…/api/backup/jobs`
 */
export const API_BACKUP_JOBS_SUFFIX = '/backup/jobs';
export const API_BACKUP_RECORDS_SUFFIX = '/backup/records';
export const API_BACKUP_RECOVERY_JOBS_SUFFIX = '/backup/recovery-jobs';
export const API_BACKUP_SERVICE_STATUS_SUFFIX = '/backup/status';
export const API_BACKUP_STORAGE_USAGE_SUFFIX = '/backup/storage-usage';
export const API_BACKUP_CLEANUP_SUFFIX = '/backup/cleanup';

/** 대화 보조 — LLM 가용성(`API_ENDPOINTS.LLM_STATUS`). */
export const CHAT_LLM_STATUS_PATH = `${CHAT_POST_PATH}/llm-status`;

/** API v7 — 노트북 LLM, 보조 대화, 음성·이미지, 개포성(gaeposung) 등. */
export const API_V7_CHAT_PATH = '/api/v7/chat';
export const API_V7_WRITING_SUGGESTIONS_PATH = '/api/v7/writing/suggestions';
export const API_V7_NOTEBOOK_LLM_BASE = '/api/v7/notebook-llm';
export const API_V7_NOTEBOOK_LLM_STREAM_PATH = `${API_V7_NOTEBOOK_LLM_BASE}/stream`;
export const API_V7_NOTEBOOK_LLM_STATUS_PATH = `${API_V7_NOTEBOOK_LLM_BASE}/status`;
export const API_V7_NOTEBOOK_LLM_GENERATE_PATH = `${API_V7_NOTEBOOK_LLM_BASE}/generate`;
export const API_V7_ADVANCED_AI_PATH = '/api/v7/advanced-ai';
export const API_V7_GENERATE_MESSAGE_PATH = '/api/v7/generate-message';
export const API_V7_GAEPOSUNG_BASE = '/api/v7/gaeposung';
/** `advancedMessageAPI` 개포성 분석·프로젝트 하위 — 동적 ID는 호출부에서 `encodeURIComponent`. */
export const API_V7_GAEPOSUNG_ANALYSIS_PATH_PREFIX = `${API_V7_GAEPOSUNG_BASE}/analysis`;
export const API_V7_GAEPOSUNG_PROJECT_OVERVIEW_PATH_PREFIX = `${API_V7_GAEPOSUNG_BASE}/project/overview`;
export const API_V7_GAEPOSUNG_PROJECT_TASKS_PATH_PREFIX = `${API_V7_GAEPOSUNG_BASE}/project/tasks`;
export const API_V7_GAEPOSUNG_PROJECT_MILESTONES_PATH_PREFIX = `${API_V7_GAEPOSUNG_BASE}/project/milestones`;
export const API_V7_GAEPOSUNG_PROJECT_RECOMMENDATIONS_PATH_PREFIX = `${API_V7_GAEPOSUNG_BASE}/project/recommendations`;
export const API_V7_VOICE_START_RECOGNITION_PATH = '/api/v7/voice/start-recognition';
export const API_V7_VOICE_STOP_RECOGNITION_PATH = '/api/v7/voice/stop-recognition';
export const API_V7_VOICE_RESULTS_PATH = '/api/v7/voice/results';
export const API_V7_IMAGE_ANALYZE_BASE64_PATH = '/api/v7/image/analyze-base64';
export const API_V7_PREDICT_USER_ACTIVITY_PATH = '/api/v7/predict/user-activity';
export const API_V7_PREDICT_MESSAGE_QUALITY_PATH = '/api/v7/predict/message-quality';
export const API_V7_PREDICT_SYSTEM_PERFORMANCE_PATH = '/api/v7/predict/system-performance';
export const API_V7_PREDICT_SUMMARY_PATH = '/api/v7/predict/summary';

/** `/api/projects/:id/notebook-llm/...` 세그먼트. */
export const PROJECT_NOTEBOOK_LLM_SEGMENT = '/notebook-llm';

/** Qwen/TTS 프록시 (`/api/tts/...`). */
export const API_TTS_BASE = '/api/tts';
export const API_TTS_CONFIG_PATH = `${API_TTS_BASE}/config`;
export const API_TTS_VOICES_PATH = `${API_TTS_BASE}/voices`;
export const API_TTS_SITUATIONS_PATH = `${API_TTS_BASE}/situations`;
export const API_TTS_SPEECH_PATH = `${API_TTS_BASE}/speech`;
export const API_TTS_SPEECH_FROM_SOURCE_PATH = `${API_TTS_BASE}/speech-from-source`;
export const API_TTS_SPEECH_FROM_PROJECT_PATH = `${API_TTS_BASE}/speech-from-project`;

/** 의도·키워드 분석. */
export const INTENT_ANALYZE_PATH = '/api/intent/analyze';

/** `advancedMessageAPI` v8 레거시 베이스. */
export const API_V8_BASE = '/api/v8';
/** `AdvancedAIFeatures`·v8 고급 분석 하위. */
export const API_V8_ADVANCED_SENTIMENT_ANALYSIS_PATH = `${API_V8_BASE}/advanced/sentiment-analysis`;
export const API_V8_ADVANCED_TEXT_SUMMARIZATION_PATH = `${API_V8_BASE}/advanced/text-summarization`;
export const API_V8_ADVANCED_KEYWORD_EXTRACTION_PATH = `${API_V8_BASE}/advanced/keyword-extraction`;
export const API_V8_ADVANCED_SYSTEM_HEALTH_PATH = `${API_V8_BASE}/advanced/system-health`;

/**
 * `advancedMessageAPI` `_AdvancedMessageAPIClient` v8 REST 하위.
 * 동적 ID는 호출부에서 `encodeURIComponent`로 조합.
 */
export const API_V8_STATUS_PATH = `${API_V8_BASE}/status`;
export const API_V8_PROJECTS_PATH = `${API_V8_BASE}/projects`;
export const API_V8_CHAT_SESSIONS_PATH = `${API_V8_BASE}/chat-sessions`;
export const API_V8_UPLOAD_CHAT_PATH = `${API_V8_BASE}/upload-chat`;
export const API_V8_UPLOAD_MEDIA_PATH = `${API_V8_BASE}/upload-media`;
export const API_V8_SEARCH_PATH = `${API_V8_BASE}/search`;
export const API_V8_MESSAGES_PATH_PREFIX = `${API_V8_BASE}/messages`;
export const API_V8_AI_MESSAGE_PATH = `${API_V8_BASE}/ai-message`;
export const API_V8_AI_GENERATE_ADVANCED_MESSAGE_PATH = `${API_V8_BASE}/ai/generate-advanced-message`;
export const API_V8_DATABASE_STATISTICS_PATH = `${API_V8_BASE}/database/statistics`;
export const API_V8_CHAT_PATH = `${API_V8_BASE}/chat`;
export const API_V8_CHAT_SUMMARY_PATH = `${API_V8_BASE}/chat/summary`;
export const API_V8_CONVERSATION_SUMMARY_PATH = `${API_V8_BASE}/conversation/summary`;
export const API_V8_CHAT_HISTORY_PATH = `${API_V8_BASE}/chat/history`;
export const API_V8_NOTIFICATIONS_PATH = `${API_V8_BASE}/notifications`;
export const API_V8_NOTIFICATIONS_UNREAD_COUNT_PATH = `${API_V8_BASE}/notifications/unread-count`;
export const API_V8_NOTIFICATIONS_STATISTICS_PATH = `${API_V8_BASE}/notifications/statistics`;
export const API_V8_CONVERSATION_ANALYSIS_PATH = `${API_V8_BASE}/conversation/analysis`;
export const API_V8_CONVERSATION_STATISTICS_PATH_PREFIX = `${API_V8_BASE}/conversation/statistics`;
export const API_V8_CONVERSATION_ANALYZE_PATH = `${API_V8_BASE}/conversation/analyze`;
export const API_V8_CONVERSATION_USER_PROFILE_PATH_PREFIX = `${API_V8_BASE}/conversation/user-profile`;
export const API_V8_CONVERSATION_CLEAR_PATH = `${API_V8_BASE}/conversation/clear`;
export const API_V8_MONITORING_STATUS_PATH_PREFIX = `${API_V8_BASE}/monitoring/status`;
export const API_V8_MONITORING_EVENTS_PATH_PREFIX = `${API_V8_BASE}/monitoring/events`;
export const API_V8_MONITORING_PREDICTIONS_PATH_PREFIX = `${API_V8_BASE}/monitoring/predictions`;
export const API_V8_MONITORING_SYSTEM_STATS_PATH = `${API_V8_BASE}/monitoring/system-stats`;
export const API_V8_MONITORING_STOP_PATH_PREFIX = `${API_V8_BASE}/monitoring/stop`;
export const API_V8_ML_USER_PROFILE_PATH_PREFIX = `${API_V8_BASE}/ml/user-profile`;
export const API_V8_ML_USER_PROFILES_PATH = `${API_V8_BASE}/ml/user-profiles`;
export const API_V8_ML_PREDICT_ENGAGEMENT_PATH = `${API_V8_BASE}/ml/predict-engagement`;
export const API_V8_ML_PREDICT_RESPONSE_TIME_PATH = `${API_V8_BASE}/ml/predict-response-time`;
export const API_V8_ML_PERSONALIZED_RESPONSE_PATH = `${API_V8_BASE}/ml/personalized-response`;
export const API_V8_ML_USER_DATA_PATH_PREFIX = `${API_V8_BASE}/ml/user-data`;
export const API_V8_ML_SYSTEM_STATS_PATH = `${API_V8_BASE}/ml/system-stats`;
export const API_V8_AI_MODEL_PERFORMANCE_PATH = `${API_V8_BASE}/ai/model-performance`;
export const API_V8_AI_PERFORMANCE_ANALYSIS_PATH = `${API_V8_BASE}/ai/performance-analysis`;
export const API_V8_USER_PROFILE_PATH_PREFIX = `${API_V8_BASE}/user/profile`;
export const API_V8_AI_LEARNING_FEEDBACK_PATH = `${API_V8_BASE}/ai/learning-feedback`;

/** `unifiedAPI` 등 `/api/ai/*` 다중 엔드포인트. */
export const API_AI_BASE = '/api/ai';
export const API_AI_CAPABILITIES_PATH = `${API_AI_BASE}/capabilities`;
export const API_AI_ADVANCED_ANALYSIS_PATH = `${API_AI_BASE}/advanced-analysis`;
export const API_AI_KNOWLEDGE_PROCESSING_PATH = `${API_AI_BASE}/knowledge-processing`;
export const API_AI_FILE_ANALYSIS_PATH = `${API_AI_BASE}/file-analysis`;
export const API_AI_WRITING_GENERATION_PATH = `${API_AI_BASE}/writing-generation`;
export const API_AI_CONVERSATION_ANALYSIS_PATH = `${API_AI_BASE}/conversation-analysis`;
export const API_AI_REAL_ESTATE_ANALYSIS_PATH = `${API_AI_BASE}/real-estate-analysis`;
export const API_AI_VOICE_PROCESSING_PATH = `${API_AI_BASE}/voice-processing`;
export const API_AI_IMAGE_ANALYSIS_PATH = `${API_AI_BASE}/image-analysis`;
export const API_AI_WORKFLOW_EXECUTION_PATH = `${API_AI_BASE}/workflow-execution`;
export const API_AI_LEARNING_OPTIMIZATION_PATH = `${API_AI_BASE}/learning-optimization`;
export const API_AI_SYSTEM_METRICS_PATH = `${API_AI_BASE}/system-metrics`;
/** `/api/comprehensive-analysis`(`COMPREHENSIVE_ANALYSIS_PATH`)와 구분 — AI 서비스 하위. */
export const API_AI_COMPREHENSIVE_ANALYSIS_PATH = `${API_AI_BASE}/comprehensive-analysis`;
export const API_AI_PREDICTIVE_ANALYSIS_PATH = `${API_AI_BASE}/predictive-analysis`;
export const API_AI_RISK_ASSESSMENT_PATH = `${API_AI_BASE}/risk-assessment`;
export const API_AI_COMPETITOR_ANALYSIS_PATH = `${API_AI_BASE}/competitor-analysis`;
export const API_AI_FINANCIAL_ANALYSIS_PATH = `${API_AI_BASE}/financial-analysis`;
export const API_AI_SENTIMENT_ANALYSIS_ADVANCED_PATH = `${API_AI_BASE}/sentiment-analysis-advanced`;
export const API_AI_MACHINE_LEARNING_PREDICTION_PATH = `${API_AI_BASE}/machine-learning-prediction`;
export const API_AI_DEEP_LEARNING_ANALYSIS_PATH = `${API_AI_BASE}/deep-learning-analysis`;
export const API_AI_NATURAL_LANGUAGE_PROCESSING_PATH = `${API_AI_BASE}/natural-language-processing`;
export const API_AI_COGNITIVE_COMPUTING_PATH = `${API_AI_BASE}/cognitive-computing`;
export const API_AI_REAL_TIME_DATA_ANALYSIS_PATH = `${API_AI_BASE}/real-time-data-analysis`;
export const API_AI_ADVANCED_PREDICTIVE_MODELING_PATH = `${API_AI_BASE}/advanced-predictive-modeling`;
export const API_AI_ADAPTIVE_LEARNING_SYSTEM_PATH = `${API_AI_BASE}/adaptive-learning-system`;
export const API_AI_REAL_TIME_COLLABORATION_PATH = `${API_AI_BASE}/real-time-collaboration`;
export const API_AI_ADVANCED_VISUALIZATION_PATH = `${API_AI_BASE}/advanced-visualization`;
export const API_AI_INTEGRATED_ANALYSIS_PATH = `${API_AI_BASE}/ai-integrated-analysis`;
export const API_AI_REAL_TIME_DECISION_SUPPORT_PATH = `${API_AI_BASE}/real-time-decision-support`;
export const API_AI_AUTO_INSIGHTS_GENERATION_PATH = `${API_AI_BASE}/auto-insights-generation`;
export const API_AI_PERSONALIZED_DASHBOARD_PATH = `${API_AI_BASE}/personalized-dashboard`;
export const API_AI_MULTILINGUAL_SUPPORT_PATH = `${API_AI_BASE}/multilingual-support`;
export const API_AI_AR_VR_SUPPORT_PATH = `${API_AI_BASE}/ar-vr-support`;
export const API_AI_ADVANCED_INSIGHTS_GENERATION_PATH = `${API_AI_BASE}/advanced-insights-generation`;
export const API_AI_BLOCKCHAIN_SECURITY_PATH = `${API_AI_BASE}/blockchain-security`;
export const API_AI_AUTOMATED_WORKFLOW_ENGINE_PATH = `${API_AI_BASE}/automated-workflow-engine`;
export const API_AI_QUANTUM_COMPUTING_SUPPORT_PATH = `${API_AI_BASE}/quantum-computing-support`;
export const API_AI_EDGE_COMPUTING_SUPPORT_PATH = `${API_AI_BASE}/edge-computing-support`;
export const API_AI_RESEARCH_UNLIMITED_ANALYSIS_PATH = `${API_AI_BASE}/research-unlimited-analysis`;
export const API_AI_ADVANCED_RESEARCH_CONTROL_PATH = `${API_AI_BASE}/advanced-research-control`;
export const API_AI_EXPERIMENTAL_RESEARCH_SYSTEM_PATH = `${API_AI_BASE}/experimental-research-system`;
export const API_AI_INNOVATIVE_RESEARCH_PLATFORM_PATH = `${API_AI_BASE}/innovative-research-platform`;
export const API_AI_FUTURE_TECHNOLOGY_RESEARCH_PATH = `${API_AI_BASE}/future-technology-research`;
export const API_AI_INTEGRATED_RESEARCH_ECOSYSTEM_PATH = `${API_AI_BASE}/integrated-research-ecosystem`;
export const API_AI_NEXT_GENERATION_RESEARCH_INNOVATION_PATH = `${API_AI_BASE}/next-generation-research-innovation`;
export const API_AI_ULTIMATE_RESEARCH_SYSTEM_PATH = `${API_AI_BASE}/ultimate-research-system`;
export const API_AI_ULTIMATE_RESEARCH_INNOVATION_PLATFORM_PATH = `${API_AI_BASE}/ultimate-research-innovation-platform`;
export const API_AI_ULTIMATE_RESEARCH_ECOSYSTEM_PATH = `${API_AI_BASE}/ultimate-research-ecosystem`;
export const API_AI_COSMIC_AI_INTEGRATION_PATH = `${API_AI_BASE}/cosmic-ai-integration`;
export const API_AI_CONVERSATIONAL_QA_PATH = `${API_AI_BASE}/conversational-qa`;
export const API_AI_PROCESS_FILE_PATH = `${API_AI_BASE}/process-file`;
export const API_AI_ANALYZE_IMAGE_PATH = `${API_AI_BASE}/analyze-image`;

/** 통합 메시지 목록(페이징). */
export const API_MESSAGES_LIST_PATH = '/api/messages';

/** Ultimate 백엔드(`enhancedBackendAPI`). */
export const API_ULTIMATE_PROCESS_PATH = '/api/ultimate/process';
export const API_ULTIMATE_HEALTH_PATH = '/api/ultimate/health';
export const API_ULTIMATE_STATUS_PATH = '/api/ultimate/status';

/** 대시보드 뷰 요약(`*ViewService`). */
export const API_BILLING_SUMMARY_PATH = '/api/billing/summary';
export const API_TEMPLATES_SUMMARY_PATH = '/api/templates/summary';
export const API_COMMUNITY_SUMMARY_PATH = '/api/community/summary';
export const API_SEARCH_SUMMARY_PATH = '/api/search/summary';
export const API_WORKSPACE_SUMMARY_PATH = '/api/workspace/summary';
export const API_LEARN_SUMMARY_PATH = '/api/learn/summary';
export const API_TEAM_SUMMARY_PATH = '/api/team/summary';

/** `ultimateMediaKnowledgeService` 등 레거시 v1 베이스. */
export const API_V1_PATH = '/api/v1';

/** `conversationalAnalysisService` — v1 대화·분석. */
export const API_V1_KAKAO_TENDENCY_PATH = '/api/v1/kakao-tendency';
export const API_V1_CONSTRUCTION_BIAS_PATH = '/api/v1/construction-bias';
export const API_V1_OPINION_TREND_PATH = '/api/v1/opinion-trend';
export const API_V1_INTEGRATED_ANALYSIS_PATH = '/api/v1/integrated-analysis';
export const API_V1_ANALYSIS_STATUS_PATH_PREFIX = '/api/v1/analysis-status';

/** UMKS `ultimateMediaKnowledgeService` — `/api/v1` 미디어·지식 API. */
export const API_V1_UMKS_ANALYZE_MEDIA_PATH = `${API_V1_PATH}/analyze-media`;
export const API_V1_UMKS_SEARCH_KNOWLEDGE_PATH = `${API_V1_PATH}/search-knowledge`;
export const API_V1_UMKS_PERSUASION_PATH = `${API_V1_PATH}/persuasion`;
export const API_V1_UMKS_KNOWLEDGE_BASE_PREFIX = `${API_V1_PATH}/knowledge-base`;
export const API_V1_UMKS_LEARNING_HISTORY_PREFIX = `${API_V1_PATH}/learning-history`;
export const API_V1_UMKS_KNOWLEDGE_EXPORT_PREFIX = `${API_V1_PATH}/knowledge-export`;

/** `advancedMediaAnalysisAPI` 함수 export — `resolveApiBaseUrl()` 베이스 기준. */
export const API_ADVANCED_MEDIA_UPLOAD_MEDIA_PATH = '/upload-media';
export const API_ADVANCED_MEDIA_GENERATE_CONVERSATIONAL_PATH = '/generate-conversational-response';
export const API_ADVANCED_MEDIA_FILES_LIST_PATH = '/files';
export const API_ADVANCED_MEDIA_ANALYSIS_RESULTS_PATH = '/analysis-results';
export const API_ADVANCED_MEDIA_ANALYZE_MEDIA_PREFIX = '/analyze-media';
export const API_ADVANCED_MEDIA_ANALYSIS_STATUS_PREFIX = '/analysis-status';
export const API_ADVANCED_MEDIA_ADVANCED_ANALYSIS_PREFIX = '/advanced-analysis';

/** `AdvancedMediaAnalysisAPI` 클래스 — 글쓰기·분석 보조 서버 경로. */
export const API_MEDIA_WRITING_UPLOAD_PATH = '/upload';
export const API_MEDIA_WRITING_WRITING_THEORIES_PATH = '/writing-theories';
export const API_MEDIA_WRITING_CONVERSATION_PATH = '/conversation';
export const API_MEDIA_WRITING_FILES_PATH = '/files';
export const API_MEDIA_WRITING_ANALYZE_PREFIX = '/analyze';
export const API_MEDIA_WRITING_ANALYSIS_PREFIX = '/analysis';
export const API_MEDIA_WRITING_SERVER_ROOT_PATH = '/';

/** `enhancedConversationalService` — v2 enhanced. */
export const API_V2_ENHANCED_BASE = '/api/v2/enhanced';
export const API_V2_ENHANCED_HEALTH_PATH = `${API_V2_ENHANCED_BASE}/health`;
export const API_V2_ENHANCED_CHAT_PATH = `${API_V2_ENHANCED_BASE}/chat`;
export const API_V2_ENHANCED_CONTEXTUAL_PATH = `${API_V2_ENHANCED_BASE}/contextual`;
export const API_V2_ENHANCED_FEEDBACK_PATH = `${API_V2_ENHANCED_BASE}/feedback`;
export const API_V2_ENHANCED_ANALYZE_PATH = `${API_V2_ENHANCED_BASE}/analyze`;
export const API_V2_ENHANCED_INSIGHTS_PATH = `${API_V2_ENHANCED_BASE}/insights`;

/** `aiResponseService`. */
export const API_V7_AI_RESPONSE_PATH = '/api/v7/ai-response';

/** `chatgpt5LevelService`. */
export const API_V10_ROOT_PATH = '/api/v10';
export const API_V10_GENERATE_RESPONSE_PATH = `${API_V10_ROOT_PATH}/generate-response`;

/** `advancedDocumentService`. */
export const API_V9_ADVANCED_DOCUMENT_PATH = '/api/v9/advanced-document';
export const API_V9_STATS_PATH = '/api/v9/stats';

/** `webResearchService`. */
export const API_ANALYSIS_WEB_RESEARCH_PATH = '/api/analysis/web-research';

/** 부동산(`realEstateRegistryService`·`molitRealEstateService`). */
export const API_REAL_ESTATE_REGISTRY_CHANGES_PATH = '/api/real-estate/registry-changes';
export const API_REAL_ESTATE_TRANSACTIONS_PATH = '/api/real-estate/transactions';

/** `pipelineTuningService`. */
export const API_PIPELINE_TUNING_PATH = '/api/pipeline-tuning';
export const API_LLM_INTERNAL_SECURITY_PATH = '/api/llm-internal-security';

/** `conversationGraphService`. */
export const API_CONVERSATIONS_UPLOAD_PATH = '/api/conversations/upload';
export const API_CONVERSATIONS_LIST_PATH = '/api/conversations';
/** 대화 관계도 API 접미 (`conversationGraphService`). */
export const API_CONVERSATIONS_RELATIONSHIP_GRAPH_SEGMENT = '/relationship-graph';

/** TTS 대본 스타일(`scriptStyleAPI`). */
export const API_TTS_SCRIPT_STYLE_EXTRACT_DOCUMENT_PATH = '/api/tts/script-style/extract-document';
export const API_TTS_SCRIPT_STYLE_ANALYZE_PATH = '/api/tts/script-style/analyze';
export const API_TTS_SCRIPT_STYLE_GENERATE_PATH = '/api/tts/script-style/generate';

/** 시공사 비교 분석(`constructionAnalytics`). */
export const API_CONSTRUCTION_UPLOAD_COMPARISON_DATA_PATH = '/api/upload_comparison_data';
export const API_CONSTRUCTION_ANALYZE_COMPANIES_PATH = '/api/analyze_companies';
export const API_CONSTRUCTION_GENERATE_MESSAGE_PATH = '/api/generate_message';
export const API_CONSTRUCTION_EVALUATION_CRITERIA_PATH = '/api/evaluation_criteria';
export const API_CONSTRUCTION_KNOWLEDGE_BASE_PATH = '/api/knowledge_base';
export const API_CONSTRUCTION_SAVE_DECISION_PATH = '/api/save_decision';
export const API_CONSTRUCTION_DECISION_HISTORY_PATH = '/api/decision_history';
export const API_CONSTRUCTION_RESET_DATA_PATH = '/api/reset_data';

/**
 * `constructionCompanyService` 부동산 대시보드 REST.
 * `main_server`에 해당 라우트가 없으면 서비스가 샘플 데이터로 폴백한다.
 * (`construction_api.py` 업로드·분석 API와는 별계 — `API_CONSTRUCTION_UPLOAD_*` 등)
 */
export const API_CONSTRUCTION_DASHBOARD_BASE = '/api/construction';
export const API_CONSTRUCTION_COMPANIES_PATH = `${API_CONSTRUCTION_DASHBOARD_BASE}/companies`;
export const API_CONSTRUCTION_DEFECT_ISSUES_PATH = `${API_CONSTRUCTION_DASHBOARD_BASE}/defect-issues`;
export const API_CONSTRUCTION_RESPONSE_PLANS_PATH = `${API_CONSTRUCTION_DASHBOARD_BASE}/response-plans`;
export const API_CONSTRUCTION_SELECTION_ANALYSIS_PATH = `${API_CONSTRUCTION_DASHBOARD_BASE}/selection-analysis`;
export const API_CONSTRUCTION_COMPARE_PATH = `${API_CONSTRUCTION_DASHBOARD_BASE}/compare`;

/**
 * `apartmentCommunityAnalysisService` 커뮤니티 REST.
 * `main_server`에 미구현이면 샘플 폴백. (요약만 필요하면 `API_COMMUNITY_SUMMARY_PATH`)
 */
export const API_APARTMENT_COMMUNITY_BASE = '/api/apartment/community';
export const API_APARTMENT_COMMUNITY_RESIDENTS_PATH = `${API_APARTMENT_COMMUNITY_BASE}/residents`;
export const API_APARTMENT_COMMUNITY_COMMENTS_PATH = `${API_APARTMENT_COMMUNITY_BASE}/comments`;
export const API_APARTMENT_COMMUNITY_ANALYTICS_PATH = `${API_APARTMENT_COMMUNITY_BASE}/analytics`;
export const API_APARTMENT_COMMUNITY_ANALYZE_COMMENT_PATH = `${API_APARTMENT_COMMUNITY_BASE}/analyze-comment`;
export const API_APARTMENT_COMMUNITY_GENERATE_RESPONSE_PATH = `${API_APARTMENT_COMMUNITY_BASE}/generate-response`;

/** 비스트리밍 대화 POST 후보 URL (`CHAT_POST_PATH` → `CHAT_POST_PATH_UNIFIED` 순, 404·5xx 시 재시도). */
export function getChatPostUrls(): readonly [string, string] {
  const o = resolveChatApiOrigin();
  return [joinApiHealthCheckUrl(o, CHAT_POST_PATH), joinApiHealthCheckUrl(o, CHAT_POST_PATH_UNIFIED)];
}

/**
 * `API_BASE_URL` 등 설정 문자열 기준 대화 POST 후보(순서는 `getChatPostUrls`와 동일).
 * 비어 있으면 `getChatPostUrls()`와 동일 → `resolveChatApiOrigin` 폴백.
 */
export function getChatPostUrlsForConfigBase(configBase: string): readonly [string, string] {
  const b = (configBase ?? '').trim().replace(/\/$/, '');
  if (b.length > 0) {
    return [joinApiHealthCheckUrl(b, CHAT_POST_PATH), joinApiHealthCheckUrl(b, CHAT_POST_PATH_UNIFIED)] as const;
  }
  return getChatPostUrls();
}

/** SSE 대화 스트림 후보 URL. */
export function getChatStreamUrls(): readonly [string, string] {
  const o = resolveChatApiOrigin();
  return [joinApiHealthCheckUrl(o, CHAT_STREAM_PATH), joinApiHealthCheckUrl(o, CHAT_STREAM_PATH_UNIFIED)];
}

/**
 * 설정 문자열 기준 스트림 후보(순서는 `getChatStreamUrls`와 동일).
 * 비어 있으면 `getChatStreamUrls()`와 동일.
 */
export function getChatStreamUrlsForConfigBase(configBase: string): readonly [string, string] {
  const b = (configBase ?? '').trim().replace(/\/$/, '');
  if (b.length > 0) {
    return [joinApiHealthCheckUrl(b, CHAT_STREAM_PATH), joinApiHealthCheckUrl(b, CHAT_STREAM_PATH_UNIFIED)] as const;
  }
  return getChatStreamUrls();
}

// API 엔드포인트
export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  HEALTH: joinApiHealthCheckUrl(API_BASE_URL),
  STATUS: joinApiHealthCheckUrl(API_BASE_URL, API_STATUS_PATH),
  INTEGRATED_HEALTH: joinApiHealthCheckUrl(API_BASE_URL, INTEGRATED_API_HEALTH_PATH),
  INTEGRATED_STATUS: joinApiHealthCheckUrl(API_BASE_URL, INTEGRATED_API_STATUS_PATH),
  INTEGRATED_METRICS: joinApiHealthCheckUrl(API_BASE_URL, INTEGRATED_API_METRICS_PATH),
  /** 표시·단일 URL용. 대화 POST/SSE 폴백은 `getChatPostUrls*`·`getChatStreamUrls*`·`postChatJsonWithFallback`·unifiedAPI 등 사용. */
  CHAT: joinApiHealthCheckUrl(API_BASE_URL, CHAT_POST_PATH),
  CHAT_TITLE: joinApiHealthCheckUrl(API_BASE_URL, `${CHAT_POST_PATH}/title`),
  LLM_STATUS: joinApiHealthCheckUrl(API_BASE_URL, CHAT_LLM_STATUS_PATH),
} as const;

if (process.env.NODE_ENV === 'development') {
  try {
    errorLogger.info('API 설정 초기화', {
      component: 'apiConfig',
      action: 'initialize',
      API_BASE_URL,
      WS_BASE_URL,
      FRONTEND_PORT: FRONTEND_DEFAULT_PORT,
      API_PORT: DEFAULT_API_PORT,
      REACT_APP_API_URL: process.env.REACT_APP_API_URL || 'not set',
    });
  } catch (_) {}
}

