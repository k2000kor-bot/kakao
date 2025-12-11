import { errorLogger } from '../utils/errorLogger';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    timestamp: string;
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
        // 백엔드 API 엔드포인트는 /api로 시작하므로 중복 방지
        const url = endpoint.startsWith('/api') 
            ? `${API_BASE_URL}${endpoint}` 
            : `${API_BASE_URL}/api${endpoint}`;
        
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
    getMetrics: () => apiRequest('/performance/metrics'),
    getAnalysis: () => apiRequest('/performance/analysis'),
    runOptimization: (target: string, strategy: string) => apiRequest('/performance/optimize', {
        method: 'POST', body: JSON.stringify({ target, strategy })
    }),
    getOptimizationHistory: () => apiRequest('/performance/optimization/history'),
    getConfig: () => apiRequest('/performance/config'),
    updateConfig: (config: any) => apiRequest('/performance/config', {
        method: 'PUT', body: JSON.stringify(config)
    }),
    healthCheck: () => apiRequest('/performance/health'),
};

export const aiEngineApi = {
    getMetrics: () => apiRequest('/ai/engine/metrics'),
    getModelsStatus: () => apiRequest('/ai/models/status'),
    processText: (text: string, model: string, pipeline = true) => apiRequest('/ai/process', {
        method: 'POST', body: JSON.stringify({ text, model, pipeline })
    }),
    retrainModel: (modelId: string) => apiRequest(`/ai/models/${modelId}/retrain`, { method: 'POST' }),
    optimizeModel: (modelId: string) => apiRequest(`/ai/models/${modelId}/optimize`, { method: 'POST' }),
    getProcessingHistory: () => apiRequest('/ai/processing/history'),
    getTrainingHistory: () => apiRequest('/ai/training/history'),
    healthCheck: () => apiRequest('/ai/health'),
};

export const securityApi = {
    getMetrics: () => apiRequest('/security/metrics'),
    getEvents: () => apiRequest('/security/events'),
    getPolicies: () => apiRequest('/security/policies'),
    getAuditLogs: () => apiRequest('/security/audit'),
    runSecurityScan: (scanType = 'full', target?: string) => apiRequest('/security/scan', {
        method: 'POST', body: JSON.stringify({ scan_type: scanType, target })
    }),
    resolveThreat: (threatId: string) => apiRequest(`/security/threats/${threatId}/resolve`, { method: 'POST' }),
    updatePolicyStatus: (policyId: string, status: string) => apiRequest(`/security/policies/${policyId}`, {
        method: 'PUT', body: JSON.stringify({ status })
    }),
    getScanHistory: () => apiRequest('/security/scan/history'),
    healthCheck: () => apiRequest('/security/health'),
};

export const userExperienceApi = {
    getPreferences: (userId = 'default_user') => apiRequest(`/user/preferences?user_id=${userId}`),
    updatePreferences: (preferences: any, userId = 'default_user') => apiRequest('/user/preferences', {
        method: 'PUT', body: JSON.stringify({ ...preferences, user_id: userId })
    }),
    getStats: (userId = 'default_user') => apiRequest(`/user/stats?user_id=${userId}`),
    updateStats: (stats: any, userId = 'default_user') => apiRequest('/user/stats', {
        method: 'PUT', body: JSON.stringify({ ...stats, user_id: userId })
    }),
    submitFeedback: (feedback: any, userId = 'default_user') => apiRequest('/user/feedback', {
        method: 'POST', body: JSON.stringify({ ...feedback, user_id: userId })
    }),
    getNotifications: (userId = 'default_user') => apiRequest(`/user/notifications?user_id=${userId}`),
    markNotificationRead: (notificationId: string, userId = 'default_user') => apiRequest(`/user/notifications/${notificationId}/read`, {
        method: 'PUT', body: JSON.stringify({ user_id: userId })
    }),
    markAllNotificationsRead: (userId = 'default_user') => apiRequest('/user/notifications/read-all', {
        method: 'PUT', body: JSON.stringify({ user_id: userId })
    }),
    getActivities: (userId = 'default_user') => apiRequest(`/user/activities?user_id=${userId}`),
    healthCheck: () => apiRequest('/user/health'),
};

export const systemApi = {
    getStatus: () => apiRequest('/status'),
    getMetrics: () => apiRequest('/metrics'),
    healthCheck: () => apiRequest('/health'),
    restartSystem: () => apiRequest('/restart', { method: 'POST' }),
    backupSystem: () => apiRequest('/backup', { method: 'POST' }),
    getLogs: () => apiRequest('/logs'),
};

export const apiService = {
    performance: performanceApi,
    aiEngine: aiEngineApi,
    security: securityApi,
    userExperience: userExperienceApi,
    system: systemApi,
};

export default apiService;
