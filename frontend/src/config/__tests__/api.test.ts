/**
 * config/api 테스트
 * API_BASE_URL, WS_BASE_URL, API_ENDPOINTS, FRONTEND_DEFAULT_PORT export 검증
 */
import {
  API_BASE_URL,
  WS_BASE_URL,
  API_ENDPOINTS,
  FRONTEND_DEFAULT_PORT,
  resolveChatApiOrigin,
  resolveApiBaseUrl,
  extractHttpOriginFromBaseUrl,
  joinApiPathAtHttpOrigin,
  joinApiHealthCheckUrl,
  joinApiBaseAndPath,
  buildCorbuModelPredictUrl,
  resolveAxiosHttpOriginBaseUrl,
  resolveCollaborationWebSocketUrl,
  resolveGenericWebSocketClientUrl,
  WS_COLLABORATION_PATH,
  WS_ALERTS_PATH,
  WS_CHAT_ROOM_PATH_PREFIX,
  WS_ENHANCED_CONVERSATION_PATH_PREFIX,
  WS_METRICS_PATH,
  WS_SECURITY_PATH,
  WS_CLIENT_GENERIC_PATH,
  WS_CLIENT_ID_MASTER_INTERFACE,
  getChatPostUrls,
  getChatPostUrlsForConfigBase,
  getChatStreamUrls,
  getChatStreamUrlsForConfigBase,
  CHAT_POST_PATH,
  CHAT_POST_PATH_UNIFIED,
  CHAT_STREAM_PATH,
  CHAT_STREAM_PATH_UNIFIED,
  DEMO_CORBU_API_METRICS_URL,
  DEMO_MOCK_UPLOAD_BASE_URL,
  DEMO_PLACEHOLDER_IMAGE_URL,
  DEMO_SIM_DAUM_SEARCH_URL,
  DEMO_SIM_DATA_GO_KR_BID_OPENAPI_URL,
  DEMO_SIM_EXAMPLE_APARTMENT_PRICE_URL,
  DEMO_SIM_EXAMPLE_CONSTRUCTION_QUALITY_URL,
  DEMO_SIM_EXAMPLE_RECONSTRUCTION_GUIDE_URL,
  DEMO_SIM_G2B_ROOT_URL,
  DEMO_SIM_G2B_SUBFRAME_URL,
  DEMO_SIM_KAFKA_EMOTION_ANALYSIS_URL,
  DEMO_SIM_LAW_GO_KR_URL,
  DEMO_SIM_NAVER_SEARCH_URL,
  DEMO_SIM_URBANDB_URL,
  DEMO_HYUNDAI_CORP_WEBSITE_URL,
  DEMO_SAMSUNG_CORP_WEBSITE_URL,
  DEMO_SIM_DOCS_EXAMPLE_BASE_URL,
  DEMO_SIM_EXAMPLE_ARTICLE_1_URL,
  DEMO_SIM_EXAMPLE_ARTICLE_2_URL,
  DEMO_SIM_EXAMPLE_HTML_GUIDE_URL,
  DEMO_SIM_EXAMPLE_REACT_HOOKS_URL,
  DEMO_SIM_GITHUB_BASE_URL,
  DEMO_SIM_INTEGRATION_WEB_BASE_URL,
  DEMO_SIM_EXAMPLE_ARTICLE_PAGE_URL,
  DEMO_SIM_WEBHOOK_CORBU_EXAMPLE_URL,
  DEMO_SIM_NEWS_EXAMPLE_BASE_URL,
  DEMO_SIM_STACKOVERFLOW_BASE_URL,
  FIGMA_BRAINWAVE_AI_UI_KIT_APP_URL,
  FIGMA_BRAINWAVE_AI_UI_KIT_CHAT_URL,
  DEMO_PLACEHOLDER_YOUTUBE_OR_TIKTOK_URL_HINT,
  SEOUL_CLEANUP_BSNSTTUS_MAIN_URL,
  SEOUL_CLEANUP_INFO_PORTAL_BASE_URL,
  API_QUERY_PARAM_CHAT_ROOM_ID,
  API_QUERY_PARAM_CHAT_ROOM_NAME,
  API_QUERY_PARAM_COMPANY_ID,
  API_QUERY_PARAM_COMPANY_IDS,
  API_QUERY_PARAM_CONVERSATION_ID,
  API_QUERY_PARAM_END_DATE,
  API_QUERY_PARAM_EXPORT_FORMAT,
  API_QUERY_PARAM_ISSUE_ID,
  API_QUERY_PARAM_KEY,
  API_QUERY_PARAM_LIMIT,
  API_QUERY_PARAM_MEDIA_TYPE,
  API_QUERY_PARAM_MIN_CONFIDENCE,
  API_QUERY_PARAM_NEWS_API_KEY,
  API_QUERY_PARAM_NEWS_CATEGORY,
  API_QUERY_PARAM_NEWS_COUNTRY,
  API_QUERY_PARAM_NEWS_LANGUAGE,
  API_QUERY_PARAM_NEWS_SORT_BY,
  API_QUERY_PARAM_OFFSET,
  API_QUERY_PARAM_PERIOD,
  API_QUERY_PARAM_PROJECT_ID,
  API_QUERY_PARAM_PROJECT_ID_CAMEL,
  API_QUERY_PARAM_RANGE_END,
  API_QUERY_PARAM_RANGE_START,
  API_QUERY_PARAM_SEARCH_Q,
  API_QUERY_PARAM_SENDER_ID,
  API_QUERY_PARAM_SCAN_TYPE,
  API_QUERY_PARAM_SESSION_ID,
  API_QUERY_PARAM_SEVERITY,
  API_QUERY_PARAM_SORT_ORDER,
  API_QUERY_PARAM_SOURCE_TYPE,
  API_QUERY_PARAM_SHARE,
  API_QUERY_PARAM_START_DATE,
  API_QUERY_PARAM_TIME_RANGE,
  API_QUERY_PARAM_CHANGE_TYPE,
  API_QUERY_PARAM_CLIENT_ID,
  API_QUERY_PARAM_DONG,
  API_QUERY_PARAM_END_DATE_CAMEL,
  API_QUERY_PARAM_PROPERTY_TYPE_CAMEL,
  API_QUERY_PARAM_SIDO,
  API_QUERY_PARAM_SIGUNGU,
  API_QUERY_PARAM_START_DATE_CAMEL,
  API_QUERY_PARAM_TRANSACTION_TYPE,
  API_QUERY_PARAM_STATUS,
  API_QUERY_PARAM_UNREAD_ONLY,
  API_QUERY_PARAM_USER_ID,
  API_QUERY_PARAM_USER_ID_CAMEL,
  API_QUERY_PARAM_USERNAME,
  API_FORM_FIELD_FILE,
  API_FORM_FIELD_FILES,
  API_FORM_FIELD_NAME,
  API_FORM_FIELD_PROJECT_TYPE,
  API_FORM_FIELD_TEMPLATE_TYPE,
  API_FORM_FIELD_VARIABLES,
  API_JSON_FIELD_DOCUMENT_HINT,
  API_JSON_FIELD_FILENAME,
  API_JSON_FIELD_MESSAGE,
  API_JSON_FIELD_SAMPLE_SCRIPT,
  API_JSON_FIELD_SOURCE_FILENAME,
  API_JSON_FIELD_TEXT,
  API_JSON_FIELD_TOPIC_OR_OUTLINE,
  CHAT_ROOMS_PATH,
  CHAT_MESSAGES_PATH,
  FILE_UPLOAD_PATH,
  FILE_DOWNLOAD_PATH,
  FILES_COLLECTION_PATH,
  API_HEALTH_PATH,
  API_PROJECT_FILES_SEGMENT,
  API_PROJECT_MEDIA_KNOWLEDGE_SEGMENT,
  API_PROJECT_POPUPS_SEGMENT,
  API_PROJECT_PROMOTIONAL_CAMPAIGNS_SEGMENT,
  API_PROJECT_PROMOTIONAL_MATERIALS_SEGMENT,
  API_PROJECT_AI_SETTINGS_SEGMENT,
  API_PROJECT_SESSIONS_SEGMENT,
  API_PROJECT_NOTEBOOK_CONTEXT_SEGMENT,
  API_PROJECT_NOTEBOOK_SOURCES_SEGMENT,
  API_PROJECT_NOTEBOOK_STUDIO_GENERATE_SEGMENT,
  API_PROJECTS_LIST_PATH,
  API_SESSION_MESSAGES_SEGMENT,
  API_SESSION_UPLOAD_SEGMENT,
  API_SESSION_SCOPED_FILES_SEGMENT,
  API_SESSION_SCOPED_FILE_ANALYSIS_SEGMENT,
  API_SESSION_ADVANCED_CONTEXTUAL_WRITING_SEGMENT,
  API_SESSION_DEEP_CONTEXT_ANALYSIS_SEGMENT,
  API_SESSION_ENHANCED_WRITING_SEGMENT,
  API_SESSIONS_LIST_PATH,
  INTEGRATED_POST_PATH_ANALYZE,
  API_SYSTEM_STATUS_PATH,
  EMOTION_RECOGNITION_ANALYZE_PATH,
  API_STATUS_PATH,
  AUTH_LOGIN_PATH,
  AUTH_LOGOUT_PATH,
  SECURITY_EVENTS_PATH,
  SECURITY_METRICS_PATH,
  SECURITY_POLICIES_PATH,
  SECURITY_AUDIT_PATH,
  SECURITY_SCAN_PATH,
  SECURITY_THREATS_PATH_PREFIX,
  SECURITY_SCAN_HISTORY_PATH,
  SECURITY_SERVICE_HEALTH_PATH,
  ADVANCED_SECURITY_THREATS_PATH,
  ADVANCED_SECURITY_STATUS_PATH,
  API_LEGACY_ROOT_METRICS_PATH,
  USER_NOTIFICATIONS_PATH,
  AI_ENGINE_HEALTH_PATH,
  API_ERRORS_REPORT_PATH,
  API_ANALYTICS_PATH,
  API_SYSTEM_METRICS_PATH,
  MESSAGE_FORMATS_PATH,
  API_SMOKE_TEST_PATH,
  MESSAGE_RESPONSE_GENERATE_PATH,
  USER_PREFERENCES_PATH,
  API_V7_SYNC_PATH,
  API_GENERATE_PATH,
  INTEGRATED_API_BASE,
  CHAT_LLM_STATUS_PATH,
  API_V7_NOTEBOOK_LLM_BASE,
  API_V7_NOTEBOOK_LLM_GENERATE_PATH,
  API_V7_NOTEBOOK_LLM_STATUS_PATH,
  API_V7_NOTEBOOK_LLM_STREAM_PATH,
  API_V7_GAEPOSUNG_ANALYSIS_PATH_PREFIX,
  API_V7_GAEPOSUNG_PROJECT_RECOMMENDATIONS_PATH_PREFIX,
  API_V8_BASE,
  API_AI_BASE,
  API_V1_PATH,
  API_V1_UMKS_ANALYZE_MEDIA_PATH,
  API_V1_UMKS_KNOWLEDGE_BASE_PREFIX,
  API_V1_UMKS_KNOWLEDGE_EXPORT_PREFIX,
  API_V1_UMKS_LEARNING_HISTORY_PREFIX,
  API_V1_UMKS_PERSUASION_PATH,
  API_V1_UMKS_SEARCH_KNOWLEDGE_PATH,
  NEWSAPI_DEFAULT_COUNTRY_KR,
  NEWSAPI_PATH_EVERYTHING,
  NEWSAPI_PATH_TOP_HEADLINES,
  NEWSAPI_V2_BASE_URL,
  API_BILLING_SUMMARY_PATH,
  API_ULTIMATE_STATUS_PATH,
  API_PERSISTENT_SESSION_ARCHIVE_SEGMENT,
  API_PERSISTENT_SESSION_FILES_SEGMENT,
  API_PERSISTENT_SESSION_MESSAGES_SEGMENT,
  API_PERSISTENT_SESSION_RESTORE_SEGMENT,
  API_PERSISTENT_SESSION_STATS_SEGMENT,
  API_PERSISTENT_SESSION_UPLOAD_SEGMENT,
  API_PERSISTENT_SESSIONS_LIST_QUERY_ACTIVE_LIMIT_100,
  API_PERSISTENT_SESSIONS_LIST_QUERY_LIMIT_100,
  API_PERSISTENT_SESSIONS_PATH,
  DATA_ANALYTICS_ANALYSES_PATH,
  API_DIALOGUE_TYPES_PATH,
  API_V7_CHAT_ROOMS_PATH,
  API_UPLOAD_CHAT_PATH,
  API_PERFORMANCE_HEALTH_PATH,
  API_PERFORMANCE_RECOMMENDATIONS_PATH,
  PERFORMANCE_MONITOR_HEALTH_PATH,
  PERFORMANCE_MONITOR_METRICS_PATH,
  PERFORMANCE_MONITOR_START_MONITORING_PATH,
  PERFORMANCE_MONITOR_STOP_MONITORING_PATH,
  PERFORMANCE_MONITOR_ALERTS_PATH_PREFIX,
  PERFORMANCE_MONITOR_EXPORT_PATH,
  PUBLIC_GENSPARK_AGENTS_ORIGIN,
  ANALYTICS_ROUTER_OVERVIEW_PATH,
  ANALYTICS_ROUTER_USER_BEHAVIOR_PATH,
  ANALYTICS_ROUTER_AI_PERFORMANCE_PATH,
  ANALYTICS_ROUTER_BUSINESS_METRICS_PATH,
  ANALYTICS_ROUTER_PREDICTIONS_PATH,
  ANALYTICS_ROUTER_CUSTOM_REPORT_PATH,
  ANALYTICS_ROUTER_EXPORT_PATH_PREFIX,
  AI_ANALYTICS_ROUTER_BASE,
  AI_ANALYTICS_ROUTER_METRICS_PATH,
  AI_ANALYTICS_ROUTER_EXPORT_PATH,
  API_SERVICE_LEGACY_AI_INITIALIZE_PATH,
  API_SERVICE_LEGACY_AI_STATUS_PATH,
  API_OLLAMA_TAGS_PATH,
  ANTHROPIC_API_BASE_URL,
  ANTHROPIC_API_V1_MESSAGES_PATH,
  GOOGLE_GENERATIVE_LANGUAGE_V1BETA_BASE_URL,
  GOOGLE_GEMINI_MODEL_ID_LEGACY_PRO,
  IPIFY_PUBLIC_IP_JSON_URL,
  OPENAI_COMPAT_V1_MODELS_PATH,
  OPENAI_COMPAT_V1_CHAT_COMPLETIONS_PATH,
  OPENAI_COMPAT_V1_EMBEDDINGS_PATH,
  OPENAI_OFFICIAL_API_BASE_URL,
  OPENAI_OFFICIAL_API_V1_BASE_URL,
  API_ADVANCED_MEDIA_UPLOAD_MEDIA_PATH,
  API_ADVANCED_MEDIA_GENERATE_CONVERSATIONAL_PATH,
  API_ADVANCED_MEDIA_FILES_LIST_PATH,
  API_ADVANCED_MEDIA_ANALYSIS_RESULTS_PATH,
  API_ADVANCED_MEDIA_ANALYZE_MEDIA_PREFIX,
  API_ADVANCED_MEDIA_ANALYSIS_STATUS_PREFIX,
  API_ADVANCED_MEDIA_ADVANCED_ANALYSIS_PREFIX,
  API_MEDIA_WRITING_UPLOAD_PATH,
  API_MEDIA_WRITING_WRITING_THEORIES_PATH,
  API_MEDIA_WRITING_CONVERSATION_PATH,
  API_MEDIA_WRITING_FILES_PATH,
  API_MEDIA_WRITING_ANALYZE_PREFIX,
  API_MEDIA_WRITING_ANALYSIS_PREFIX,
  API_MEDIA_WRITING_SERVER_ROOT_PATH,
  API_SECURITY_WEBSOCKET_CLIENT_WS_PATH,
  API_SECURITY_WEBSOCKET_WS_PATH_PREFIX,
  joinApiSecurityWebSocketClientPath,
  API_V1_CONTEXTUAL_ANALYSIS_PATH,
  API_ULTRA_NEURAL_BRAINWASH_PATH,
  API_TEXT_ANALYZE_PATH,
  API_V7_CONTEXTUAL_ANALYSIS_PATH,
  API_V2_ENHANCED_HEALTH_PATH,
  API_ANALYSIS_WEB_RESEARCH_PATH,
  API_CONVERSATIONS_LIST_PATH,
  API_CONVERSATIONS_RELATIONSHIP_GRAPH_SEGMENT,
  API_CONSTRUCTION_UPLOAD_COMPARISON_DATA_PATH,
  API_CONSTRUCTION_COMPANIES_PATH,
  API_CONSTRUCTION_COMPARE_PATH,
  API_CONSTRUCTION_DEFECT_ISSUES_PATH,
  API_CONSTRUCTION_RESPONSE_PLANS_PATH,
  API_CONSTRUCTION_SELECTION_ANALYSIS_PATH,
  API_APARTMENT_COMMUNITY_ANALYTICS_PATH,
  API_APARTMENT_COMMUNITY_ANALYZE_COMMENT_PATH,
  API_APARTMENT_COMMUNITY_COMMENTS_PATH,
  API_APARTMENT_COMMUNITY_GENERATE_RESPONSE_PATH,
  API_APARTMENT_COMMUNITY_RESIDENTS_PATH,
  API_LEARNING_START_PATH,
  API_LEARNING_PREDICT_PATH,
  API_LEARNING_MODELS_PATH,
  API_LEARNING_SESSIONS_PATH,
  API_LEARNING_STATUS_PREFIX,
  API_LEARNING_STOP_PREFIX,
  API_LEARNING_METRICS_PREFIX,
  API_FILES_BASE,
  API_FILES_CLASSIFICATION_SEGMENT,
  API_FILES_CONTENT_SEGMENT,
  API_FILES_INSIGHTS_SEGMENT,
  API_FILES_LEARNING_STATUS_SEGMENT,
  API_PROJECTS_PROCESS_PATH,
  API_FILE_PROCESS_PATH,
  API_V10_GENERATE_RESPONSE_PATH,
  API_TTS_SCRIPT_STYLE_ANALYZE_PATH,
  INTEGRATED_API_ANALYTICS_PATH,
  INTEGRATED_API_HEALTH_PATH,
  API_TTS_CONFIG_PATH,
  API_PROJECT_ANALYTICS_SEGMENT,
  API_AI_CAPABILITIES_PATH,
  API_AUTOMATION_WORKFLOWS_PATH,
  API_BACKUP_JOBS_SUFFIX,
  INTEGRATED_API_ANALYTICS_ADVANCED_PATH,
  INTEGRATED_API_AI_OPTIMIZE_PATH,
  INTEGRATED_API_CREATIVE_STORY_PATH,
  INTEGRATED_API_CREATIVE_POEM_PATH,
  INTEGRATED_API_CREATIVE_ESSAY_PATH,
  INTEGRATED_API_CREATIVE_ANALYZE_PATH,
  INTEGRATED_API_PERSUASION_CONSTRUCTION_PATH,
  INTEGRATED_API_PERSUASION_CONTRACTOR_PATH,
  INTEGRATED_API_PERSUASION_ANALYZE_PATH,
  INTEGRATED_API_MARKETING_SOCIAL_PATH,
  INTEGRATED_API_MARKETING_EMAIL_PATH,
  INTEGRATED_API_MARKETING_ANALYZE_PATH,
  API_AI_ADVANCED_ANALYSIS_PATH,
  API_AI_COMPREHENSIVE_ANALYSIS_PATH,
  API_AI_CONVERSATIONAL_QA_PATH,
  API_PATH_IN_URL_MARKER,
  API_HTTP_PATH_PREFIX,
  API_V8_ADVANCED_KEYWORD_EXTRACTION_PATH,
  API_V8_ADVANCED_SENTIMENT_ANALYSIS_PATH,
  API_V8_ADVANCED_SYSTEM_HEALTH_PATH,
  API_V8_ADVANCED_TEXT_SUMMARIZATION_PATH,
  API_V8_AI_GENERATE_ADVANCED_MESSAGE_PATH,
  API_V8_CHAT_SESSIONS_PATH,
  API_V8_CONVERSATION_ANALYSIS_PATH,
  API_V8_NOTIFICATIONS_PATH,
  API_V8_PROJECTS_PATH,
  API_V8_STATUS_PATH,
} from '../api';

describe('config/api', () => {
  it('FRONTEND_DEFAULT_PORT는 3000', () => {
    expect(FRONTEND_DEFAULT_PORT).toBe(3000);
  });

  describe('Corbu·서울 정비 포털 URL', () => {
    it('buildCorbuModelPredictUrl는 환경·모델 id로 예측 URL을 만든다', () => {
      expect(buildCorbuModelPredictUrl('staging', 'model-1')).toBe(
        'https://api-staging.corbu.ai/models/model-1/predict',
      );
      expect(buildCorbuModelPredictUrl('', 'x')).toBe('https://api-prod.corbu.ai/models/x/predict');
    });

    it('서울 정보몽땅 베이스·현황 URL 상수', () => {
      expect(SEOUL_CLEANUP_INFO_PORTAL_BASE_URL).toBe('https://cleanup.seoul.go.kr');
      expect(SEOUL_CLEANUP_BSNSTTUS_MAIN_URL).toBe(
        'https://cleanup.seoul.go.kr/cleanup/bsnssttus/lscrMainIndx.do',
      );
    });

    it('웹검색 시뮬·Kafka 샘플 URL (`webSearchService`, `ultraAdvancedAIDataAnalyticsSystem`)', () => {
      expect(DEMO_SIM_LAW_GO_KR_URL).toBe('https://law.go.kr/LSW/lsInfoP.do?lsiSeq=123456');
      expect(DEMO_SIM_EXAMPLE_RECONSTRUCTION_GUIDE_URL).toBe('https://example.com/reconstruction-guide');
      expect(DEMO_SIM_EXAMPLE_CONSTRUCTION_QUALITY_URL).toBe(
        'https://example.com/construction-quality-report',
      );
      expect(DEMO_SIM_G2B_SUBFRAME_URL).toBe(
        'https://www.g2b.go.kr/pt/menu/selectSubFrame.do?framesrc=/pt/menu/frameTgong.do',
      );
      expect(DEMO_SIM_URBANDB_URL).toBe('https://urbandb.net');
      expect(DEMO_SIM_DATA_GO_KR_BID_OPENAPI_URL).toBe(
        'https://www.data.go.kr/data/15023678/openapi.do',
      );
      expect(DEMO_SIM_G2B_ROOT_URL).toBe('https://www.g2b.go.kr');
      expect(DEMO_SIM_EXAMPLE_APARTMENT_PRICE_URL).toBe(
        'https://example.com/apartment-price-analysis',
      );
      expect(DEMO_SIM_NAVER_SEARCH_URL).toBe('https://search.naver.com/search.naver');
      expect(DEMO_SIM_DAUM_SEARCH_URL).toBe('https://search.daum.net/search');
      expect(DEMO_SIM_KAFKA_EMOTION_ANALYSIS_URL).toBe('kafka://localhost:9092/emotion-analysis');
    });

    it('웹검색 통합·시공사·콘텐츠·학습 추천 데모 URL', () => {
      expect(DEMO_SIM_INTEGRATION_WEB_BASE_URL).toBe('https://example.com');
      expect(DEMO_SIM_EXAMPLE_ARTICLE_PAGE_URL).toBe('https://example.com/article');
      expect(DEMO_SIM_WEBHOOK_CORBU_EXAMPLE_URL).toBe('https://example.com/hooks/corbu');
      expect(FIGMA_BRAINWAVE_AI_UI_KIT_CHAT_URL).toBe(
        'https://www.figma.com/design/9ZrEa3dcS8zb0O6Nr5lT8m/Brainwave-AI-UI-Kit?node-id=7-3&m=dev',
      );
      expect(FIGMA_BRAINWAVE_AI_UI_KIT_APP_URL).toBe(
        'https://www.figma.com/design/9ZrEa3dcS8zb0O6Nr5lT8m/Brainwave-AI-UI-Kit-%F0%9F%9A%80?node-id=323-168775&m=dev',
      );
      expect(DEMO_PLACEHOLDER_YOUTUBE_OR_TIKTOK_URL_HINT).toBe(
        'https://www.youtube.com/... 또는 https://www.tiktok.com/...',
      );
      expect(DEMO_SIM_STACKOVERFLOW_BASE_URL).toBe('https://stackoverflow.com');
      expect(DEMO_SIM_GITHUB_BASE_URL).toBe('https://github.com');
      expect(DEMO_SIM_DOCS_EXAMPLE_BASE_URL).toBe('https://docs.example.com');
      expect(DEMO_SIM_NEWS_EXAMPLE_BASE_URL).toBe('https://news.example.com');
      expect(DEMO_SAMSUNG_CORP_WEBSITE_URL).toBe('https://www.samsung.com');
      expect(DEMO_HYUNDAI_CORP_WEBSITE_URL).toBe('https://www.hyundai.com');
      expect(DEMO_SIM_EXAMPLE_ARTICLE_1_URL).toBe('https://example.com/article1');
      expect(DEMO_SIM_EXAMPLE_ARTICLE_2_URL).toBe('https://example.com/article2');
      expect(DEMO_SIM_EXAMPLE_HTML_GUIDE_URL).toBe('https://example.com/html-guide');
      expect(DEMO_SIM_EXAMPLE_REACT_HOOKS_URL).toBe('https://example.com/react-hooks');
    });
  });

  describe('JSON·폼 필드 키 상수', () => {
    it('의도 분석·대화 업로드·스크립트 스타일·홍보·시공 폼 키', () => {
      expect(API_JSON_FIELD_MESSAGE).toBe('message');
      expect(API_JSON_FIELD_TEXT).toBe('text');
      expect(API_JSON_FIELD_FILENAME).toBe('filename');
      expect(API_FORM_FIELD_FILE).toBe('file');
      expect(API_FORM_FIELD_FILES).toBe('files');
      expect(API_FORM_FIELD_NAME).toBe('name');
      expect(API_JSON_FIELD_SAMPLE_SCRIPT).toBe('sample_script');
      expect(API_JSON_FIELD_TOPIC_OR_OUTLINE).toBe('topic_or_outline');
      expect(API_JSON_FIELD_DOCUMENT_HINT).toBe('document_hint');
      expect(API_JSON_FIELD_SOURCE_FILENAME).toBe('source_filename');
      expect(API_FORM_FIELD_TEMPLATE_TYPE).toBe('template_type');
      expect(API_FORM_FIELD_VARIABLES).toBe('variables');
      expect(API_FORM_FIELD_PROJECT_TYPE).toBe('project_type');
    });
  });

  describe('API_BASE_URL', () => {
    it('정의되어 있음', () => {
      expect(API_BASE_URL).toBeDefined();
      expect(typeof API_BASE_URL).toBe('string');
    });

    it('유효한 URL 형식 또는 같은 출처(빈 문자열)', () => {
      expect(API_BASE_URL === '' || /^https?:\/\//.test(API_BASE_URL)).toBe(true);
    });

    it('문자열 타입', () => {
      expect(typeof API_BASE_URL).toBe('string');
    });
  });

  describe('WS_BASE_URL', () => {
    it('정의되어 있음', () => {
      expect(WS_BASE_URL).toBeDefined();
      expect(typeof WS_BASE_URL).toBe('string');
    });

    it('WebSocket URL 형식 (ws 또는 wss)', () => {
      expect(WS_BASE_URL).toMatch(/^wss?:\/\//);
    });

    it('resolveGenericWebSocketClientUrl은 WS_BASE_URL과 /ws 접미를 조합한다', () => {
      const u = resolveGenericWebSocketClientUrl();
      expect(u).toBe(joinApiBaseAndPath(WS_BASE_URL, WS_CLIENT_GENERIC_PATH));
    });

    it('resolveCollaborationWebSocketUrl은 협업 경로를 포함한다', () => {
      expect(resolveCollaborationWebSocketUrl()).toContain(WS_COLLABORATION_PATH);
      expect(resolveCollaborationWebSocketUrl()).toMatch(/^wss?:\/\//);
    });

    it('대화·향상 대화 WebSocket 경로 접두사가 export된다', () => {
      expect(WS_CHAT_ROOM_PATH_PREFIX).toBe('/ws/chat');
      expect(WS_ENHANCED_CONVERSATION_PATH_PREFIX).toBe('/ws/v2/enhanced');
    });

    it('보안·메트릭·알림 WebSocket 경로가 export된다', () => {
      expect(WS_SECURITY_PATH).toBe('/ws/security');
      expect(WS_METRICS_PATH).toBe('/ws/metrics');
      expect(WS_ALERTS_PATH).toBe('/ws/alerts');
    });
  });

  describe('joinApiBaseAndPath', () => {
    it('빈 베이스는 선행 슬래시가 있는 경로만 반환한다', () => {
      expect(joinApiBaseAndPath('', '/api/health')).toBe('/api/health');
    });

    it('빈 베이스일 때 경로에 선행 슬래시가 없으면 붙인다', () => {
      expect(joinApiBaseAndPath('', 'api/health')).toBe('/api/health');
    });

    it('절대 베이스와 경로를 이어 붙이고 베이스 끝 슬래시를 제거한다', () => {
      expect(joinApiBaseAndPath('http://example:5002', '/api/health')).toBe('http://example:5002/api/health');
      expect(joinApiBaseAndPath('http://example:5002/', '/api/health')).toBe('http://example:5002/api/health');
    });
  });

  describe('extractHttpOriginFromBaseUrl', () => {
    it('http(s) URL에서 호스트·포트 오리진만 반환', () => {
      expect(extractHttpOriginFromBaseUrl('https://api.example:5002/api/v1')).toBe('https://api.example:5002');
      expect(extractHttpOriginFromBaseUrl('http://localhost/api/foo')).toBe('http://localhost');
    });

    it('http(s)가 아니거나 빈 문자열이면 resolveApiBaseUrl과 동일', () => {
      expect(extractHttpOriginFromBaseUrl('ws://example')).toBe(resolveApiBaseUrl());
      expect(extractHttpOriginFromBaseUrl('')).toBe(resolveApiBaseUrl());
    });
  });

  describe('joinApiPathAtHttpOrigin', () => {
    it('베이스에 경로가 있어도 오리진 + path로 조합', () => {
      expect(joinApiPathAtHttpOrigin('https://api.example:5002/api/v1', API_HEALTH_PATH)).toBe(
        joinApiBaseAndPath('https://api.example:5002', API_HEALTH_PATH)
      );
    });
  });

  describe('resolveAxiosHttpOriginBaseUrl', () => {
    it('http(s) 베이스에 경로가 붙으면 호스트 오리진만 반환', () => {
      expect(resolveAxiosHttpOriginBaseUrl('https://api.example:5002/api/v1')).toBe('https://api.example:5002');
    });

    it('빈 문자열은 그대로', () => {
      expect(resolveAxiosHttpOriginBaseUrl('')).toBe('');
    });

    it('비-http(s) 베이스는 그대로', () => {
      expect(resolveAxiosHttpOriginBaseUrl('/api')).toBe('/api');
    });
  });

  describe('joinApiHealthCheckUrl', () => {
    it('http(s) 베이스에 /api/v1 등이 붙어 있어도 호스트 오리진 + 절대 API 경로로 조합', () => {
      const baseWithPath = 'https://api.example:5002/api/v1';
      expect(joinApiHealthCheckUrl(baseWithPath, CHAT_POST_PATH)).toBe(
        `https://api.example:5002${CHAT_POST_PATH}`,
      );
    });

    it('빈 베이스는 두 번째 인자(기본값 포함)만 반환', () => {
      expect(joinApiHealthCheckUrl('', API_HEALTH_PATH)).toBe(API_HEALTH_PATH);
    });
  });

  describe('API_ENDPOINTS', () => {
    it('BASE, HEALTH, CHAT 엔드포인트 존재', () => {
      expect(API_ENDPOINTS.BASE).toBeDefined();
      expect(API_ENDPOINTS.HEALTH).toBeDefined();
      expect(API_ENDPOINTS.CHAT).toBeDefined();
    });

    it('HEALTH 엔드포인트 경로', () => {
      expect(API_ENDPOINTS.HEALTH).toContain(API_HEALTH_PATH);
    });

    it('CHAT·CHAT_TITLE·LLM_STATUS는 joinApiHealthCheckUrl(BASE, …)', () => {
      expect(API_ENDPOINTS.CHAT).toBe(joinApiHealthCheckUrl(API_BASE_URL, CHAT_POST_PATH));
      expect(API_ENDPOINTS.CHAT_TITLE).toBe(joinApiHealthCheckUrl(API_BASE_URL, `${CHAT_POST_PATH}/title`));
      expect(API_ENDPOINTS.LLM_STATUS).toBe(joinApiHealthCheckUrl(API_BASE_URL, CHAT_LLM_STATUS_PATH));
    });

    it('HEALTH는 joinApiHealthCheckUrl(BASE)', () => {
      expect(API_ENDPOINTS.HEALTH).toBe(joinApiHealthCheckUrl(API_BASE_URL));
    });

    it('STATUS 엔드포인트 경로 포함', () => {
      expect(API_ENDPOINTS.STATUS).toBeDefined();
      expect(API_ENDPOINTS.STATUS).toContain(API_STATUS_PATH);
    });

    it('모든 엔드포인트 값이 문자열이며, BASE 제외하고 비어 있지 않음', () => {
      expect(typeof API_ENDPOINTS.BASE).toBe('string');
      const { BASE: _BASE, ...rest } = API_ENDPOINTS;
      Object.values(rest).forEach((value) => {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      });
    });
  });

  describe('대화 경로 상수', () => {
    it('POST·스트림 상대 경로가 getChatPostUrls·getChatStreamUrls와 일치', () => {
      const [p1, p2] = getChatPostUrls();
      expect(p1.endsWith(CHAT_POST_PATH)).toBe(true);
      expect(p2.endsWith(CHAT_POST_PATH_UNIFIED)).toBe(true);
      const [s1, s2] = getChatStreamUrls();
      expect(s1.endsWith(CHAT_STREAM_PATH)).toBe(true);
      expect(s2.endsWith(CHAT_STREAM_PATH_UNIFIED)).toBe(true);
    });

    it('resolveChatApiOrigin + joinApiHealthCheckUrl과 getChat*Urls 전체 URL이 일치', () => {
      const o = resolveChatApiOrigin();
      const [p1, p2] = getChatPostUrls();
      expect(p1).toBe(joinApiHealthCheckUrl(o, CHAT_POST_PATH));
      expect(p2).toBe(joinApiHealthCheckUrl(o, CHAT_POST_PATH_UNIFIED));
      const [s1, s2] = getChatStreamUrls();
      expect(s1).toBe(joinApiHealthCheckUrl(o, CHAT_STREAM_PATH));
      expect(s2).toBe(joinApiHealthCheckUrl(o, CHAT_STREAM_PATH_UNIFIED));
    });
  });

  describe('대화 URL 헬퍼', () => {
    it('resolveChatApiOrigin는 절대 http(s) 오리진', () => {
      expect(resolveChatApiOrigin()).toMatch(/^https?:\/\//);
    });

    it('getChatPostUrls는 resolveChatApiOrigin 기준 joinApiHealthCheckUrl 튜플', () => {
      const o = resolveChatApiOrigin();
      expect(getChatPostUrls()).toEqual([
        joinApiHealthCheckUrl(o, CHAT_POST_PATH),
        joinApiHealthCheckUrl(o, CHAT_POST_PATH_UNIFIED),
      ]);
    });

    it('getChatStreamUrls는 resolveChatApiOrigin 기준 joinApiHealthCheckUrl 튜플', () => {
      const o = resolveChatApiOrigin();
      expect(getChatStreamUrls()).toEqual([
        joinApiHealthCheckUrl(o, CHAT_STREAM_PATH),
        joinApiHealthCheckUrl(o, CHAT_STREAM_PATH_UNIFIED),
      ]);
    });

    it('getChatPostUrlsForConfigBase(빈 문자열)는 getChatPostUrls와 동일', () => {
      expect(getChatPostUrlsForConfigBase('')).toEqual(getChatPostUrls());
      expect(getChatPostUrlsForConfigBase('  ')).toEqual(getChatPostUrls());
    });

    it('getChatPostUrlsForConfigBase(오리진)는 joinApiHealthCheckUrl 기준 경로', () => {
      const base = 'https://api.example:5002';
      const [a, b] = getChatPostUrlsForConfigBase(base);
      expect(a).toBe(joinApiHealthCheckUrl(base, CHAT_POST_PATH));
      expect(b).toBe(joinApiHealthCheckUrl(base, CHAT_POST_PATH_UNIFIED));
    });

    it('getChatStreamUrlsForConfigBase(빈 문자열)는 getChatStreamUrls와 동일', () => {
      expect(getChatStreamUrlsForConfigBase('')).toEqual(getChatStreamUrls());
    });

    it('getChatStreamUrlsForConfigBase(오리진)는 joinApiHealthCheckUrl 스트림 경로', () => {
      const base = 'https://api.example:5002';
      const [a, b] = getChatStreamUrlsForConfigBase(base);
      expect(a).toBe(joinApiHealthCheckUrl(base, CHAT_STREAM_PATH));
      expect(b).toBe(joinApiHealthCheckUrl(base, CHAT_STREAM_PATH_UNIFIED));
    });

    it('CHAT_ROOMS_PATH·CHAT_MESSAGES_PATH는 대화 POST 경로와 구분된다', () => {
      expect(API_QUERY_PARAM_PROJECT_ID).toBe('project_id');
      expect(API_QUERY_PARAM_PROJECT_ID_CAMEL).toBe('projectId');
      expect(API_QUERY_PARAM_USER_ID).toBe('user_id');
      expect(API_QUERY_PARAM_COMPANY_ID).toBe('company_id');
      expect(API_QUERY_PARAM_COMPANY_IDS).toBe('company_ids');
      expect(API_QUERY_PARAM_CONVERSATION_ID).toBe('conversation_id');
      expect(API_QUERY_PARAM_ISSUE_ID).toBe('issue_id');
      expect(API_QUERY_PARAM_LIMIT).toBe('limit');
      expect(API_QUERY_PARAM_OFFSET).toBe('offset');
      expect(API_QUERY_PARAM_PERIOD).toBe('period');
      expect(API_QUERY_PARAM_CHAT_ROOM_ID).toBe('chat_room_id');
      expect(API_QUERY_PARAM_CHAT_ROOM_NAME).toBe('chat_room_name');
      expect(API_QUERY_PARAM_SENDER_ID).toBe('sender_id');
      expect(API_QUERY_PARAM_SCAN_TYPE).toBe('scan_type');
      expect(API_QUERY_PARAM_SESSION_ID).toBe('session_id');
      expect(API_QUERY_PARAM_SEVERITY).toBe('severity');
      expect(API_QUERY_PARAM_STATUS).toBe('status');
      expect(API_QUERY_PARAM_START_DATE).toBe('start_date');
      expect(API_QUERY_PARAM_END_DATE).toBe('end_date');
      expect(API_QUERY_PARAM_UNREAD_ONLY).toBe('unread_only');
      expect(API_QUERY_PARAM_SEARCH_Q).toBe('q');
      expect(API_QUERY_PARAM_MIN_CONFIDENCE).toBe('min_confidence');
      expect(API_QUERY_PARAM_MEDIA_TYPE).toBe('media_type');
      expect(API_QUERY_PARAM_EXPORT_FORMAT).toBe('format');
      expect(API_QUERY_PARAM_RANGE_START).toBe('start');
      expect(API_QUERY_PARAM_RANGE_END).toBe('end');
      expect(API_QUERY_PARAM_SORT_ORDER).toBe('order');
      expect(API_QUERY_PARAM_SOURCE_TYPE).toBe('source_type');
      expect(API_QUERY_PARAM_TIME_RANGE).toBe('timeRange');
      expect(API_QUERY_PARAM_SIDO).toBe('sido');
      expect(API_QUERY_PARAM_SIGUNGU).toBe('sigungu');
      expect(API_QUERY_PARAM_DONG).toBe('dong');
      expect(API_QUERY_PARAM_START_DATE_CAMEL).toBe('startDate');
      expect(API_QUERY_PARAM_END_DATE_CAMEL).toBe('endDate');
      expect(API_QUERY_PARAM_TRANSACTION_TYPE).toBe('transactionType');
      expect(API_QUERY_PARAM_PROPERTY_TYPE_CAMEL).toBe('propertyType');
      expect(API_QUERY_PARAM_CHANGE_TYPE).toBe('changeType');
      expect(API_QUERY_PARAM_CLIENT_ID).toBe('client_id');
      expect(WS_CLIENT_ID_MASTER_INTERFACE).toBe('master_interface');
      expect(API_QUERY_PARAM_USER_ID_CAMEL).toBe('userId');
      expect(API_QUERY_PARAM_USERNAME).toBe('username');
      expect(API_QUERY_PARAM_KEY).toBe('key');
      expect(API_QUERY_PARAM_SHARE).toBe('share');
      expect(CHAT_ROOMS_PATH).toBe('/api/chat-rooms');
      expect(CHAT_MESSAGES_PATH).toBe('/api/chat-messages');
      expect(CHAT_ROOMS_PATH).not.toBe(CHAT_POST_PATH);
      expect(FILE_UPLOAD_PATH).toBe('/api/upload');
      expect(FILE_DOWNLOAD_PATH).toBe('/api/download');
      expect(FILES_COLLECTION_PATH).toBe('/api/files');
      expect(API_HEALTH_PATH).toBe('/api/health');
      expect(API_HTTP_PATH_PREFIX).toBe('/api');
      expect(API_PROJECTS_LIST_PATH).toBe('/api/projects');
      expect(API_PROJECT_FILES_SEGMENT).toBe('/files');
      expect(API_PROJECT_MEDIA_KNOWLEDGE_SEGMENT).toBe('/knowledge');
      expect(API_PROJECT_POPUPS_SEGMENT).toBe('/popups');
      expect(API_PROJECT_PROMOTIONAL_MATERIALS_SEGMENT).toBe('/materials');
      expect(API_PROJECT_PROMOTIONAL_CAMPAIGNS_SEGMENT).toBe('/campaigns');
      expect(API_PROJECT_SESSIONS_SEGMENT).toBe('/sessions');
      expect(API_PROJECT_AI_SETTINGS_SEGMENT).toBe('/ai-settings');
      expect(API_PROJECT_NOTEBOOK_CONTEXT_SEGMENT).toBe('/notebook-context');
      expect(API_PROJECT_NOTEBOOK_SOURCES_SEGMENT).toBe('/notebook-sources');
      expect(API_PROJECT_NOTEBOOK_STUDIO_GENERATE_SEGMENT).toBe('/notebook-studio/generate');
      expect(API_SESSIONS_LIST_PATH).toBe('/api/sessions');
      expect(API_SESSION_MESSAGES_SEGMENT).toBe('/messages');
      expect(API_SESSION_UPLOAD_SEGMENT).toBe('/upload');
      expect(API_SESSION_SCOPED_FILES_SEGMENT).toBe('/files');
      expect(API_SESSION_SCOPED_FILE_ANALYSIS_SEGMENT).toBe('/analysis');
      expect(API_SESSION_ADVANCED_CONTEXTUAL_WRITING_SEGMENT).toBe('/advanced-contextual-writing');
      expect(API_SESSION_DEEP_CONTEXT_ANALYSIS_SEGMENT).toBe('/deep-context-analysis');
      expect(API_SESSION_ENHANCED_WRITING_SEGMENT).toBe('/enhanced-writing');
      expect(INTEGRATED_POST_PATH_ANALYZE).toBe('/api/analyze');
      expect(API_SYSTEM_STATUS_PATH).toBe('/api/system/status');
      expect(EMOTION_RECOGNITION_ANALYZE_PATH).toBe('/api/emotion-recognition/analyze');
      expect(API_STATUS_PATH).toBe('/api/status');
      expect(AUTH_LOGIN_PATH).toBe('/api/auth/login');
      expect(API_SYSTEM_METRICS_PATH).toBe('/api/system/metrics');
      expect(AUTH_LOGOUT_PATH).toBe('/api/auth/logout');
      expect(SECURITY_EVENTS_PATH).toBe('/api/security/events');
      expect(SECURITY_METRICS_PATH).toBe('/api/security/metrics');
      expect(SECURITY_POLICIES_PATH).toBe('/api/security/policies');
      expect(SECURITY_AUDIT_PATH).toBe('/api/security/audit');
      expect(SECURITY_SCAN_PATH).toBe('/api/security/scan');
      expect(SECURITY_SCAN_HISTORY_PATH).toBe('/api/security/scan/history');
      expect(SECURITY_SERVICE_HEALTH_PATH).toBe('/api/security/health');
      expect(SECURITY_THREATS_PATH_PREFIX).toBe('/api/security/threats');
      expect(ADVANCED_SECURITY_THREATS_PATH).toBe('/security/threats');
      expect(ADVANCED_SECURITY_STATUS_PATH).toBe('/security/status');
      expect(API_LEGACY_ROOT_METRICS_PATH).toBe('/api/metrics');
      expect(USER_NOTIFICATIONS_PATH).toBe('/api/user/notifications');
      expect(AI_ENGINE_HEALTH_PATH).toBe('/api/ai/health');
      expect(API_ERRORS_REPORT_PATH).toBe('/api/errors');
      expect(API_ANALYTICS_PATH).toBe('/api/analytics');
      expect(MESSAGE_FORMATS_PATH).toBe('/api/message-formats');
      expect(API_SMOKE_TEST_PATH).toBe('/api/test');
      expect(MESSAGE_RESPONSE_GENERATE_PATH).toBe('/api/generate-message');
      expect(USER_PREFERENCES_PATH).toBe('/api/user/preferences');
      expect(API_V7_SYNC_PATH).toBe('/api/v7/sync');
      expect(API_GENERATE_PATH).toBe('/api/generate');
      expect(INTEGRATED_API_BASE).toBe('/api/integrated');
      expect(CHAT_LLM_STATUS_PATH).toBe('/api/chat/llm-status');
      expect(API_V7_NOTEBOOK_LLM_BASE).toBe('/api/v7/notebook-llm');
      expect(API_V7_NOTEBOOK_LLM_STREAM_PATH).toBe('/api/v7/notebook-llm/stream');
      expect(API_V7_NOTEBOOK_LLM_STATUS_PATH).toBe('/api/v7/notebook-llm/status');
      expect(API_V7_NOTEBOOK_LLM_GENERATE_PATH).toBe('/api/v7/notebook-llm/generate');
      expect(API_V7_GAEPOSUNG_ANALYSIS_PATH_PREFIX).toBe('/api/v7/gaeposung/analysis');
      expect(API_V7_GAEPOSUNG_PROJECT_RECOMMENDATIONS_PATH_PREFIX).toBe(
        '/api/v7/gaeposung/project/recommendations',
      );
      expect(API_V8_BASE).toBe('/api/v8');
      expect(API_AI_BASE).toBe('/api/ai');
      expect(API_V1_PATH).toBe('/api/v1');
      expect(API_BILLING_SUMMARY_PATH).toBe('/api/billing/summary');
      expect(API_ULTIMATE_STATUS_PATH).toBe('/api/ultimate/status');
      expect(API_PERSISTENT_SESSIONS_PATH).toBe('/api/persistent-sessions');
      expect(API_PERSISTENT_SESSIONS_LIST_QUERY_LIMIT_100).toBe(`${API_QUERY_PARAM_LIMIT}=100`);
      expect(API_PERSISTENT_SESSIONS_LIST_QUERY_ACTIVE_LIMIT_100).toBe(
        `${API_QUERY_PARAM_STATUS}=active&${API_QUERY_PARAM_LIMIT}=100`,
      );
      expect(API_PERSISTENT_SESSION_MESSAGES_SEGMENT).toBe('/messages');
      expect(API_PERSISTENT_SESSION_UPLOAD_SEGMENT).toBe('/upload');
      expect(API_PERSISTENT_SESSION_FILES_SEGMENT).toBe('/files');
      expect(API_PERSISTENT_SESSION_ARCHIVE_SEGMENT).toBe('/archive');
      expect(API_PERSISTENT_SESSION_RESTORE_SEGMENT).toBe('/restore');
      expect(API_PERSISTENT_SESSION_STATS_SEGMENT).toBe('/stats');
      expect(DATA_ANALYTICS_ANALYSES_PATH).toBe('/api/data-analytics/analyses');
      expect(API_DIALOGUE_TYPES_PATH).toBe('/api/dialogue-types');
      expect(API_V7_CHAT_ROOMS_PATH).toBe('/api/v7/chat-rooms');
      expect(API_UPLOAD_CHAT_PATH).toBe('/api/upload-chat');
    });

    it('성능·Ollama·OpenAI 호환 로컬·보안 WS·v1 문맥·Ultra·통합 분석·v7 문맥 경로 상수', () => {
      expect(API_PERFORMANCE_HEALTH_PATH).toBe('/api/performance/health');
      expect(API_PERFORMANCE_RECOMMENDATIONS_PATH).toBe('/api/performance/recommendations');
      expect(PERFORMANCE_MONITOR_HEALTH_PATH).toBe('/performance/health');
      expect(PERFORMANCE_MONITOR_METRICS_PATH).toBe('/performance/metrics');
      expect(PERFORMANCE_MONITOR_START_MONITORING_PATH).toBe('/performance/start-monitoring');
      expect(PERFORMANCE_MONITOR_STOP_MONITORING_PATH).toBe('/performance/stop-monitoring');
      expect(PERFORMANCE_MONITOR_ALERTS_PATH_PREFIX).toBe('/performance/alerts');
      expect(PERFORMANCE_MONITOR_EXPORT_PATH).toBe('/performance/export');
      expect(ANALYTICS_ROUTER_OVERVIEW_PATH).toBe('/analytics/overview');
      expect(ANALYTICS_ROUTER_USER_BEHAVIOR_PATH).toBe('/analytics/user-behavior');
      expect(ANALYTICS_ROUTER_AI_PERFORMANCE_PATH).toBe('/analytics/ai-performance');
      expect(ANALYTICS_ROUTER_BUSINESS_METRICS_PATH).toBe('/analytics/business-metrics');
      expect(ANALYTICS_ROUTER_PREDICTIONS_PATH).toBe('/analytics/predictions');
      expect(ANALYTICS_ROUTER_CUSTOM_REPORT_PATH).toBe('/analytics/custom-report');
      expect(ANALYTICS_ROUTER_EXPORT_PATH_PREFIX).toBe('/analytics/export');
      expect(AI_ANALYTICS_ROUTER_BASE).toBe('/ai-analytics');
      expect(AI_ANALYTICS_ROUTER_METRICS_PATH).toBe('/ai-analytics/metrics');
      expect(AI_ANALYTICS_ROUTER_EXPORT_PATH).toBe('/ai-analytics/export');
      expect(API_SERVICE_LEGACY_AI_INITIALIZE_PATH).toBe('/ai/initialize');
      expect(API_SERVICE_LEGACY_AI_STATUS_PATH).toBe('/ai/status');
      expect(API_OLLAMA_TAGS_PATH).toBe('/api/tags');
      expect(OPENAI_COMPAT_V1_MODELS_PATH).toBe('/v1/models');
      expect(OPENAI_COMPAT_V1_CHAT_COMPLETIONS_PATH).toBe('/v1/chat/completions');
      expect(OPENAI_COMPAT_V1_EMBEDDINGS_PATH).toBe('/v1/embeddings');
      expect(OPENAI_OFFICIAL_API_BASE_URL).toBe('https://api.openai.com');
      expect(OPENAI_OFFICIAL_API_V1_BASE_URL).toBe('https://api.openai.com/v1');
      expect(GOOGLE_GENERATIVE_LANGUAGE_V1BETA_BASE_URL).toBe('https://generativelanguage.googleapis.com/v1beta');
      expect(GOOGLE_GEMINI_MODEL_ID_LEGACY_PRO).toBe('gemini-pro');
      expect(ANTHROPIC_API_BASE_URL).toBe('https://api.anthropic.com');
      expect(ANTHROPIC_API_V1_MESSAGES_PATH).toBe('/v1/messages');
      expect(IPIFY_PUBLIC_IP_JSON_URL).toBe('https://api.ipify.org?format=json');
      expect(PUBLIC_GENSPARK_AGENTS_ORIGIN).toBe('https://www.genspark.ai/agents');
      expect(DEMO_PLACEHOLDER_IMAGE_URL).toBe('https://via.placeholder.com/400x300');
      expect(DEMO_MOCK_UPLOAD_BASE_URL).toBe('https://example.com/uploads');
      expect(DEMO_CORBU_API_METRICS_URL).toBe('https://api.corbu.ai/metrics');
      expect(API_SECURITY_WEBSOCKET_WS_PATH_PREFIX).toBe('/api/security-websocket/ws');
      expect(API_SECURITY_WEBSOCKET_CLIENT_WS_PATH).toBe('/api/security-websocket/ws/client1');
      expect(joinApiSecurityWebSocketClientPath('a b')).toBe(
        '/api/security-websocket/ws/a%20b',
      );
      expect(API_V1_CONTEXTUAL_ANALYSIS_PATH).toBe('/api/v1/contextual-analysis');
      expect(API_ULTRA_NEURAL_BRAINWASH_PATH).toBe('/api/ultra/neural_brainwash');
      expect(API_TEXT_ANALYZE_PATH).toBe('/api/text/analyze');
      expect(API_V7_CONTEXTUAL_ANALYSIS_PATH).toBe('/api/v7/contextual-analysis');
    });

    it('v2 enhanced·웹연구·대화그래프·시공분석·v10·TTS 스크립트 경로 상수', () => {
      expect(API_V2_ENHANCED_HEALTH_PATH).toBe('/api/v2/enhanced/health');
      expect(API_ANALYSIS_WEB_RESEARCH_PATH).toBe('/api/analysis/web-research');
      expect(API_CONVERSATIONS_LIST_PATH).toBe('/api/conversations');
      expect(API_CONVERSATIONS_RELATIONSHIP_GRAPH_SEGMENT).toBe('/relationship-graph');
      expect(API_CONSTRUCTION_UPLOAD_COMPARISON_DATA_PATH).toBe('/api/upload_comparison_data');
      expect(API_V10_GENERATE_RESPONSE_PATH).toBe('/api/v10/generate-response');
      expect(API_TTS_SCRIPT_STYLE_ANALYZE_PATH).toBe('/api/tts/script-style/analyze');
    });

    it('시공 대시보드·아파트 커뮤니티 서비스 REST 경로 상수', () => {
      expect(API_CONSTRUCTION_COMPANIES_PATH).toBe('/api/construction/companies');
      expect(API_CONSTRUCTION_DEFECT_ISSUES_PATH).toBe('/api/construction/defect-issues');
      expect(API_CONSTRUCTION_RESPONSE_PLANS_PATH).toBe('/api/construction/response-plans');
      expect(API_CONSTRUCTION_SELECTION_ANALYSIS_PATH).toBe('/api/construction/selection-analysis');
      expect(API_CONSTRUCTION_COMPARE_PATH).toBe('/api/construction/compare');
      expect(API_APARTMENT_COMMUNITY_RESIDENTS_PATH).toBe('/api/apartment/community/residents');
      expect(API_APARTMENT_COMMUNITY_COMMENTS_PATH).toBe('/api/apartment/community/comments');
      expect(API_APARTMENT_COMMUNITY_ANALYTICS_PATH).toBe('/api/apartment/community/analytics');
      expect(API_APARTMENT_COMMUNITY_ANALYZE_COMMENT_PATH).toBe('/api/apartment/community/analyze-comment');
      expect(API_APARTMENT_COMMUNITY_GENERATE_RESPONSE_PATH).toBe('/api/apartment/community/generate-response');
    });

    it('UMKS(`ultimateMediaKnowledgeService`) v1 경로 상수', () => {
      expect(API_V1_UMKS_ANALYZE_MEDIA_PATH).toBe('/api/v1/analyze-media');
      expect(API_V1_UMKS_SEARCH_KNOWLEDGE_PATH).toBe('/api/v1/search-knowledge');
      expect(API_V1_UMKS_PERSUASION_PATH).toBe('/api/v1/persuasion');
      expect(API_V1_UMKS_KNOWLEDGE_BASE_PREFIX).toBe('/api/v1/knowledge-base');
      expect(API_V1_UMKS_LEARNING_HISTORY_PREFIX).toBe('/api/v1/learning-history');
      expect(API_V1_UMKS_KNOWLEDGE_EXPORT_PREFIX).toBe('/api/v1/knowledge-export');
    });

    it('NewsAPI.org v2 베이스·경로·쿼리 키(`newsService`)', () => {
      expect(NEWSAPI_V2_BASE_URL).toBe('https://newsapi.org/v2');
      expect(NEWSAPI_PATH_EVERYTHING).toBe('everything');
      expect(NEWSAPI_PATH_TOP_HEADLINES).toBe('top-headlines');
      expect(NEWSAPI_DEFAULT_COUNTRY_KR).toBe('kr');
      expect(API_QUERY_PARAM_NEWS_LANGUAGE).toBe('language');
      expect(API_QUERY_PARAM_NEWS_SORT_BY).toBe('sortBy');
      expect(API_QUERY_PARAM_NEWS_API_KEY).toBe('apiKey');
      expect(API_QUERY_PARAM_NEWS_COUNTRY).toBe('country');
      expect(API_QUERY_PARAM_NEWS_CATEGORY).toBe('category');
    });

    it('advancedMediaAnalysisAPI·글쓰기 보조 경로 상수', () => {
      expect(API_ADVANCED_MEDIA_UPLOAD_MEDIA_PATH).toBe('/upload-media');
      expect(API_ADVANCED_MEDIA_GENERATE_CONVERSATIONAL_PATH).toBe('/generate-conversational-response');
      expect(API_ADVANCED_MEDIA_FILES_LIST_PATH).toBe('/files');
      expect(API_ADVANCED_MEDIA_ANALYSIS_RESULTS_PATH).toBe('/analysis-results');
      expect(API_ADVANCED_MEDIA_ANALYZE_MEDIA_PREFIX).toBe('/analyze-media');
      expect(API_ADVANCED_MEDIA_ANALYSIS_STATUS_PREFIX).toBe('/analysis-status');
      expect(API_ADVANCED_MEDIA_ADVANCED_ANALYSIS_PREFIX).toBe('/advanced-analysis');
      expect(API_MEDIA_WRITING_UPLOAD_PATH).toBe('/upload');
      expect(API_MEDIA_WRITING_WRITING_THEORIES_PATH).toBe('/writing-theories');
      expect(API_MEDIA_WRITING_CONVERSATION_PATH).toBe('/conversation');
      expect(API_MEDIA_WRITING_FILES_PATH).toBe('/files');
      expect(API_MEDIA_WRITING_ANALYZE_PREFIX).toBe('/analyze');
      expect(API_MEDIA_WRITING_ANALYSIS_PREFIX).toBe('/analysis');
      expect(API_MEDIA_WRITING_SERVER_ROOT_PATH).toBe('/');
    });

    it('파일 학습·unifiedMessage 처리 경로 상수', () => {
      expect(API_LEARNING_START_PATH).toBe('/api/learning/start');
      expect(API_LEARNING_PREDICT_PATH).toBe('/api/learning/predict');
      expect(API_LEARNING_MODELS_PATH).toBe('/api/learning/models');
      expect(API_LEARNING_SESSIONS_PATH).toBe('/api/learning/sessions');
      expect(API_LEARNING_STATUS_PREFIX).toBe('/api/learning/status');
      expect(API_LEARNING_STOP_PREFIX).toBe('/api/learning/stop');
      expect(API_LEARNING_METRICS_PREFIX).toBe('/api/learning/metrics');
      expect(API_FILES_BASE).toBe('/api/files');
      expect(API_FILES_CLASSIFICATION_SEGMENT).toBe('/classification');
      expect(API_FILES_INSIGHTS_SEGMENT).toBe('/insights');
      expect(API_FILES_CONTENT_SEGMENT).toBe('/content');
      expect(API_FILES_LEARNING_STATUS_SEGMENT).toBe('/learning-status');
      expect(API_PROJECTS_PROCESS_PATH).toBe('/api/projects/process');
      expect(API_FILE_PROCESS_PATH).toBe('/api/file/process');
    });

    it('통합 API·TTS·프로젝트 세그먼트·AI capabilities 경로 상수', () => {
      expect(INTEGRATED_API_ANALYTICS_PATH).toBe('/api/integrated/analytics');
      expect(INTEGRATED_API_HEALTH_PATH).toBe('/api/integrated/health');
      expect(API_TTS_CONFIG_PATH).toBe('/api/tts/config');
      expect(API_PROJECT_ANALYTICS_SEGMENT).toBe('/analytics');
      expect(API_AI_CAPABILITIES_PATH).toBe('/api/ai/capabilities');
    });

    it('통합 고급 분석·AI·자동화·백업 접미 경로 상수', () => {
      expect(INTEGRATED_API_ANALYTICS_ADVANCED_PATH).toBe('/api/integrated/analytics/advanced');
      expect(INTEGRATED_API_AI_OPTIMIZE_PATH).toBe('/api/integrated/ai/optimize');
      expect(INTEGRATED_API_CREATIVE_STORY_PATH).toBe('/api/integrated/creative/story');
      expect(INTEGRATED_API_CREATIVE_POEM_PATH).toBe('/api/integrated/creative/poem');
      expect(INTEGRATED_API_CREATIVE_ESSAY_PATH).toBe('/api/integrated/creative/essay');
      expect(INTEGRATED_API_CREATIVE_ANALYZE_PATH).toBe('/api/integrated/creative/analyze');
      expect(INTEGRATED_API_PERSUASION_CONSTRUCTION_PATH).toBe('/api/integrated/persuasion/construction');
      expect(INTEGRATED_API_PERSUASION_CONTRACTOR_PATH).toBe('/api/integrated/persuasion/contractor');
      expect(INTEGRATED_API_PERSUASION_ANALYZE_PATH).toBe('/api/integrated/persuasion/analyze');
      expect(INTEGRATED_API_MARKETING_SOCIAL_PATH).toBe('/api/integrated/marketing/social');
      expect(INTEGRATED_API_MARKETING_EMAIL_PATH).toBe('/api/integrated/marketing/email');
      expect(INTEGRATED_API_MARKETING_ANALYZE_PATH).toBe('/api/integrated/marketing/analyze');
      expect(API_AUTOMATION_WORKFLOWS_PATH).toBe('/api/automation/workflows');
      expect(API_BACKUP_JOBS_SUFFIX).toBe('/backup/jobs');
    });

    it('unifiedAPI `/api/ai/*` 하위 경로 상수', () => {
      expect(API_AI_ADVANCED_ANALYSIS_PATH).toBe('/api/ai/advanced-analysis');
      expect(API_AI_COMPREHENSIVE_ANALYSIS_PATH).toBe('/api/ai/comprehensive-analysis');
      expect(API_AI_CONVERSATIONAL_QA_PATH).toBe('/api/ai/conversational-qa');
    });

    it('v8 advanced 경로 상수', () => {
      expect(API_V8_ADVANCED_SENTIMENT_ANALYSIS_PATH).toBe('/api/v8/advanced/sentiment-analysis');
      expect(API_V8_ADVANCED_TEXT_SUMMARIZATION_PATH).toBe('/api/v8/advanced/text-summarization');
      expect(API_V8_ADVANCED_KEYWORD_EXTRACTION_PATH).toBe('/api/v8/advanced/keyword-extraction');
      expect(API_V8_ADVANCED_SYSTEM_HEALTH_PATH).toBe('/api/v8/advanced/system-health');
    });

    it('v8 advancedMessageAPI 클라이언트 REST 경로 상수', () => {
      expect(API_V8_STATUS_PATH).toBe('/api/v8/status');
      expect(API_V8_PROJECTS_PATH).toBe('/api/v8/projects');
      expect(API_V8_CHAT_SESSIONS_PATH).toBe('/api/v8/chat-sessions');
      expect(API_V8_NOTIFICATIONS_PATH).toBe('/api/v8/notifications');
      expect(API_V8_CONVERSATION_ANALYSIS_PATH).toBe('/api/v8/conversation/analysis');
      expect(API_V8_AI_GENERATE_ADVANCED_MESSAGE_PATH).toBe(
        '/api/v8/ai/generate-advanced-message',
      );
    });

    it('API_PATH_IN_URL_MARKER', () => {
      expect(API_PATH_IN_URL_MARKER).toBe('/api/');
    });
  });
});
