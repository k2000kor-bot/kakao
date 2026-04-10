import { errorLogger } from '../utils/errorLogger';
import {
    AI_ENGINE_HEALTH_PATH,
    AI_ENGINE_METRICS_PATH,
    AI_MODELS_BASE_PATH,
    AI_MODELS_STATUS_PATH,
    AI_PROCESSING_HISTORY_PATH,
    AI_PROCESS_PATH,
    AI_TRAINING_HISTORY_PATH,
    API_BASE_URL,
    API_HEALTH_PATH,
    API_LEGACY_ROOT_BACKUP_PATH,
    API_LEGACY_ROOT_LOGS_PATH,
    API_LEGACY_ROOT_METRICS_PATH,
    API_LEGACY_ROOT_RESTART_PATH,
    API_PERFORMANCE_ANALYSIS_PATH,
    API_PERFORMANCE_CONFIG_PATH,
    API_PERFORMANCE_HEALTH_PATH,
    API_PERFORMANCE_METRICS_PATH,
    API_PERFORMANCE_OPTIMIZATION_HISTORY_PATH,
    API_PERFORMANCE_OPTIMIZE_PATH,
    API_QUERY_PARAM_SCAN_TYPE,
    API_QUERY_PARAM_USER_ID,
    API_STATUS_PATH,
    joinApiHealthCheckUrl,
    SECURITY_AUDIT_PATH,
    SECURITY_EVENTS_PATH,
    SECURITY_METRICS_PATH,
    SECURITY_POLICIES_PATH,
    SECURITY_SCAN_HISTORY_PATH,
    SECURITY_SCAN_PATH,
    SECURITY_SERVICE_HEALTH_PATH,
    SECURITY_THREATS_PATH_PREFIX,
    USER_ACTIVITIES_PATH,
    USER_EXPERIENCE_HEALTH_PATH,
    USER_FEEDBACK_PATH,
    USER_NOTIFICATIONS_PATH,
    USER_NOTIFICATIONS_READ_ALL_PATH,
    USER_PREFERENCES_PATH,
    USER_STATS_PATH,
} from '../config/api';

interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    timestamp: string;
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
        // 백엔드 API 엔드포인트는 /api로 시작하므로 중복 방지
        const path = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
        const url = joinApiHealthCheckUrl(API_BASE_URL, path);

        const response = await fetch(url, {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options,
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        errorLogger.error(`API 요청 실패 (${endpoint})`, error instanceof Error ? error : new Error(String(error)), { component: 'apiService', action: 'apiRequest', endpoint });
        return {
            success: false,
            error: error instanceof Error ? error.message : '알 수 없는 오류',
            timestamp: new Date().toISOString(),
        };
    }
}

export const performanceApi = {
    getMetrics: () => apiRequest(API_PERFORMANCE_METRICS_PATH),
    getAnalysis: () => apiRequest(API_PERFORMANCE_ANALYSIS_PATH),
    runOptimization: (target: string, strategy: string) => apiRequest(API_PERFORMANCE_OPTIMIZE_PATH, {
        method: 'POST', body: JSON.stringify({ target, strategy })
    }),
    getOptimizationHistory: () => apiRequest(API_PERFORMANCE_OPTIMIZATION_HISTORY_PATH),
    getConfig: () => apiRequest(API_PERFORMANCE_CONFIG_PATH),
    updateConfig: (config: Record<string, unknown>) => apiRequest(API_PERFORMANCE_CONFIG_PATH, {
        method: 'PUT', body: JSON.stringify(config)
    }),
    healthCheck: () => apiRequest(API_PERFORMANCE_HEALTH_PATH),
};

export const aiEngineApi = {
    getMetrics: () => apiRequest(AI_ENGINE_METRICS_PATH),
    getModelsStatus: () => apiRequest(AI_MODELS_STATUS_PATH),
    processText: (text: string, model: string, pipeline = true) => apiRequest(AI_PROCESS_PATH, {
        method: 'POST', body: JSON.stringify({ text, model, pipeline })
    }),
    retrainModel: (modelId: string) => apiRequest(`${AI_MODELS_BASE_PATH}/${encodeURIComponent(modelId)}/retrain`, { method: 'POST' }),
    optimizeModel: (modelId: string) => apiRequest(`${AI_MODELS_BASE_PATH}/${encodeURIComponent(modelId)}/optimize`, { method: 'POST' }),
    getProcessingHistory: () => apiRequest(AI_PROCESSING_HISTORY_PATH),
    getTrainingHistory: () => apiRequest(AI_TRAINING_HISTORY_PATH),
    healthCheck: () => apiRequest(AI_ENGINE_HEALTH_PATH),
};

export const securityApi = {
    getMetrics: () => apiRequest(SECURITY_METRICS_PATH),
    getEvents: () => apiRequest(SECURITY_EVENTS_PATH),
    getPolicies: () => apiRequest(SECURITY_POLICIES_PATH),
    getAuditLogs: () => apiRequest(SECURITY_AUDIT_PATH),
    runSecurityScan: (scanType = 'full', target?: string) => apiRequest(SECURITY_SCAN_PATH, {
        method: 'POST',
        body: JSON.stringify({ [API_QUERY_PARAM_SCAN_TYPE]: scanType, target }),
    }),
    resolveThreat: (threatId: string) => apiRequest(`${SECURITY_THREATS_PATH_PREFIX}/${encodeURIComponent(threatId)}/resolve`, { method: 'POST' }),
    updatePolicyStatus: (policyId: string, status: string) => apiRequest(`${SECURITY_POLICIES_PATH}/${encodeURIComponent(policyId)}`, {
        method: 'PUT', body: JSON.stringify({ status })
    }),
    getScanHistory: () => apiRequest(SECURITY_SCAN_HISTORY_PATH),
    healthCheck: () => apiRequest(SECURITY_SERVICE_HEALTH_PATH),
};

export const userExperienceApi = {
    getPreferences: (userId = 'default_user') =>
        apiRequest(`${USER_PREFERENCES_PATH}?${new URLSearchParams({ [API_QUERY_PARAM_USER_ID]: userId }).toString()}`),
    updatePreferences: (preferences: Record<string, unknown>, userId = 'default_user') => apiRequest(USER_PREFERENCES_PATH, {
        method: 'PUT', body: JSON.stringify({ ...preferences, [API_QUERY_PARAM_USER_ID]: userId })
    }),
    getStats: (userId = 'default_user') =>
        apiRequest(`${USER_STATS_PATH}?${new URLSearchParams({ [API_QUERY_PARAM_USER_ID]: userId }).toString()}`),
    updateStats: (stats: Record<string, unknown>, userId = 'default_user') => apiRequest(USER_STATS_PATH, {
        method: 'PUT', body: JSON.stringify({ ...stats, [API_QUERY_PARAM_USER_ID]: userId })
    }),
    submitFeedback: (feedback: Record<string, unknown>, userId = 'default_user') => apiRequest(USER_FEEDBACK_PATH, {
        method: 'POST', body: JSON.stringify({ ...feedback, [API_QUERY_PARAM_USER_ID]: userId })
    }),
    getNotifications: (userId = 'default_user') =>
        apiRequest(`${USER_NOTIFICATIONS_PATH}?${new URLSearchParams({ [API_QUERY_PARAM_USER_ID]: userId }).toString()}`),
    markNotificationRead: (notificationId: string, userId = 'default_user') => apiRequest(`${USER_NOTIFICATIONS_PATH}/${encodeURIComponent(notificationId)}/read`, {
        method: 'PUT', body: JSON.stringify({ [API_QUERY_PARAM_USER_ID]: userId })
    }),
    markAllNotificationsRead: (userId = 'default_user') => apiRequest(USER_NOTIFICATIONS_READ_ALL_PATH, {
        method: 'PUT', body: JSON.stringify({ [API_QUERY_PARAM_USER_ID]: userId })
    }),
    getActivities: (userId = 'default_user') =>
        apiRequest(`${USER_ACTIVITIES_PATH}?${new URLSearchParams({ [API_QUERY_PARAM_USER_ID]: userId }).toString()}`),
    healthCheck: () => apiRequest(USER_EXPERIENCE_HEALTH_PATH),
};

export const systemApi = {
    getStatus: () => apiRequest(API_STATUS_PATH),
    getMetrics: () => apiRequest(API_LEGACY_ROOT_METRICS_PATH),
    healthCheck: () => apiRequest(API_HEALTH_PATH),
    restartSystem: () => apiRequest(API_LEGACY_ROOT_RESTART_PATH, { method: 'POST' }),
    backupSystem: () => apiRequest(API_LEGACY_ROOT_BACKUP_PATH, { method: 'POST' }),
    getLogs: () => apiRequest(API_LEGACY_ROOT_LOGS_PATH),
};

export const apiService = {
    performance: performanceApi,
    aiEngine: aiEngineApi,
    security: securityApi,
    userExperience: userExperienceApi,
    system: systemApi,
};

export default apiService;
