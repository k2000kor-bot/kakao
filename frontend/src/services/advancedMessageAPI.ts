/* eslint-disable no-unreachable */
import {
    API_FORM_FIELD_FILE,
    API_FORM_FIELD_FILES,
    API_QUERY_PARAM_CHAT_ROOM_ID,
    API_QUERY_PARAM_CHAT_ROOM_NAME,
    API_QUERY_PARAM_CONVERSATION_ID,
    API_QUERY_PARAM_LIMIT,
    API_QUERY_PARAM_PROJECT_ID,
    API_QUERY_PARAM_SENDER_ID,
    API_QUERY_PARAM_UNREAD_ONLY,
    API_QUERY_PARAM_USER_ID,
    API_V7_GAEPOSUNG_ANALYSIS_PATH_PREFIX,
    API_V7_GAEPOSUNG_PROJECT_MILESTONES_PATH_PREFIX,
    API_V7_GAEPOSUNG_PROJECT_OVERVIEW_PATH_PREFIX,
    API_V7_GAEPOSUNG_PROJECT_RECOMMENDATIONS_PATH_PREFIX,
    API_V7_GAEPOSUNG_PROJECT_TASKS_PATH_PREFIX,
    API_V7_GENERATE_MESSAGE_PATH,
    API_V8_AI_GENERATE_ADVANCED_MESSAGE_PATH,
    API_V8_AI_LEARNING_FEEDBACK_PATH,
    API_V8_AI_MESSAGE_PATH,
    API_V8_AI_MODEL_PERFORMANCE_PATH,
    API_V8_AI_PERFORMANCE_ANALYSIS_PATH,
    API_V8_CHAT_HISTORY_PATH,
    API_V8_CHAT_PATH,
    API_V8_CHAT_SESSIONS_PATH,
    API_V8_CHAT_SUMMARY_PATH,
    API_V8_CONVERSATION_ANALYSIS_PATH,
    API_V8_CONVERSATION_ANALYZE_PATH,
    API_V8_CONVERSATION_CLEAR_PATH,
    API_V8_CONVERSATION_STATISTICS_PATH_PREFIX,
    API_V8_CONVERSATION_SUMMARY_PATH,
    API_V8_CONVERSATION_USER_PROFILE_PATH_PREFIX,
    API_V8_DATABASE_STATISTICS_PATH,
    API_V8_MESSAGES_PATH_PREFIX,
    API_V8_ML_PERSONALIZED_RESPONSE_PATH,
    API_V8_ML_PREDICT_ENGAGEMENT_PATH,
    API_V8_ML_PREDICT_RESPONSE_TIME_PATH,
    API_V8_ML_SYSTEM_STATS_PATH,
    API_V8_ML_USER_DATA_PATH_PREFIX,
    API_V8_ML_USER_PROFILE_PATH_PREFIX,
    API_V8_ML_USER_PROFILES_PATH,
    API_V8_MONITORING_EVENTS_PATH_PREFIX,
    API_V8_MONITORING_PREDICTIONS_PATH_PREFIX,
    API_V8_MONITORING_STATUS_PATH_PREFIX,
    API_V8_MONITORING_STOP_PATH_PREFIX,
    API_V8_MONITORING_SYSTEM_STATS_PATH,
    API_V8_NOTIFICATIONS_PATH,
    API_V8_NOTIFICATIONS_STATISTICS_PATH,
    API_V8_NOTIFICATIONS_UNREAD_COUNT_PATH,
    API_V8_PROJECTS_PATH,
    API_V8_SEARCH_PATH,
    API_V8_STATUS_PATH,
    API_V8_UPLOAD_CHAT_PATH,
    API_V8_UPLOAD_MEDIA_PATH,
    API_V8_USER_PROFILE_PATH_PREFIX,
    joinApiBaseAndPath,
    joinApiHealthCheckUrl,
    resolveApiBaseUrl,
    WS_BASE_URL,
    WS_CLIENT_GENERIC_PATH,
} from '../config/api';
import axios, { AxiosResponse } from 'axios';
import { errorLogger, toError } from '../utils/errorLogger';

// API 기본 설정
const API_BASE_URL = resolveApiBaseUrl();

// 타입 정의
export interface Project {
    id: string;
    name: string;
    description: string;
    project_type: string;
    settings: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    status: string;
}

export interface ChatSession {
    id: string;
    project_id: string;
    title: string;
    created_at: string;
    updated_at: string;
    messages: Message[];
    status: string;
    initial_message?: string;
}

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

export interface APIResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    notifications?: NotificationData[];
    unread_count?: number;
    profile?: UserProfileData;
    profiles?: UserProfileData[];
    stats?: SystemStats;
    prediction?: PredictionData;
    personalized_style?: PersonalizedStyleData;
    analysis?: AnalysisData;
    user_profile?: UserProfileData;
    insights?: string[];
    visualization?: VisualizationData;
}

interface NotificationData {
    id: string;
    type: string;
    title: string;
    message: string;
    timestamp?: string;
    read?: boolean;
}

interface UserProfileData {
    id?: string;
    user_id?: string;
    name?: string;
    communication_style?: string;
    preferred_topics?: string[];
    engagement_level?: string;
    preferences?: Record<string, unknown>;
}

interface SystemStats {
    total_users?: number;
    active_models?: number;
    avg_accuracy?: number;
    total_predictions?: number;
    [key: string]: unknown;
}

interface PredictionData {
    engagement_score?: number;
    response_likelihood?: number;
    interaction_duration?: number;
    next_topic?: string;
    engagement_prediction?: number;
    response_time_prediction?: number;
    estimated_time?: number;
    confidence?: number;
    factors?: string[];
}

interface PersonalizedStyleData {
    tone?: string;
    formality_level?: string;
    response_length?: string;
}

interface AnalysisData {
    total_messages?: number;
    sentiment_score?: number;
    key_topics?: string[];
    engagement_rate?: number;
    active_users?: number;
    average_response_time?: number;
    popular_topics?: string[];
    message_count?: number;
    average_message_length?: number;
    sentiment_distribution?: {
        positive?: number;
        neutral?: number;
        negative?: number;
    };
    topic_analysis?: {
        primary_topics?: string[];
        topic_confidence?: number;
    };
}

interface VisualizationData {
    type?: string;
    data?: unknown;
    options?: Record<string, unknown>;
}

interface LearningFeedbackData {
    message_id: string;
    user_feedback: string;
    success_indicator: boolean;
    improvement_suggestions?: string;
}

interface ProjectAnalysisResult {
    totalMessages?: number;
    participants?: number;
    sentimentAnalysis?: {
        positive: number;
        neutral: number;
        negative: number;
    };
    keyTopics?: string[];
    topSpeakers?: Array<{ name: string; messageCount: number; influence: number }>;
    timeline?: Array<{ date: string; events: string[] }>;
    specializedAnalysis?: Record<string, unknown>;
}

interface ProjectOverviewResult {
    success: boolean;
    overview: Record<string, unknown>;
}

interface ProjectTasksResult {
    success: boolean;
    tasks: Array<{ id: string; title: string; status: string; [key: string]: unknown }>;
}

interface ProjectTaskResult {
    success: boolean;
    task: Record<string, unknown> | null;
}

interface ProjectMilestonesResult {
    success: boolean;
    milestones: Array<{ id: string; title: string; date: string; [key: string]: unknown }>;
}

interface ProjectMilestoneResult {
    success: boolean;
    milestone: Record<string, unknown> | null;
}

interface ProjectRecommendationsResult {
    success: boolean;
    recommendations: Array<{ id: string; text: string; priority: string; [key: string]: unknown }>;
}

interface GeneratedMessagesResult {
    success: boolean;
    messages: Array<{ text: string; confidence: number; category?: string }>;
}

interface AdvancedMessageRequestInternal {
    context: string;
    style: string;
    user_profile: UserProfileData;
    performance_metrics: PerformanceMetrics;
}

interface PerformanceMetrics {
    accuracy?: number;
    response_time?: number;
    user_satisfaction?: number;
}

interface MessageAnalytics {
    sentiment?: string;
    topics?: string[];
    readability?: number;
    complexity?: number;
}

export interface AdvancedGeneratedMessage {
    id: string;
    original_message: string;
    advanced_message: string;
    analytics: MessageAnalytics;
    timestamp: string;
    ai_model_used?: string;
    confidence_score?: number;
    personalization_score?: number;
    impact_prediction?: number;
    emotion_analysis?: {
        primary_emotion?: string;
        intensity?: number;
        confidence?: number;
    };
    learning_insights?: string[];
    alternatives?: string[];
}

export interface UserProfile {
    id: string;
    name: string;
    preferences: Record<string, unknown>;
}

export interface PerformanceAnalysis {
    accuracy: number;
    response_time: number;
    user_satisfaction: number;
    average_feedback?: number;
    total_messages?: number;
    success_rate?: number;
    improvement_needed?: boolean;
}

export interface AIModelPerformance {
    model_id: string;
    model_name: string;
    accuracy: number;
    response_time: number;
    throughput: number;
    error_rate: number;
    last_updated: string;
    success_rate: number;
}

export interface ProjectsResponse extends APIResponse {
    projects: Project[];
    count: number;
}

export interface ChatSessionsResponse extends APIResponse {
    sessions: ChatSession[];
    count: number;
}

export interface ProjectResponse extends APIResponse {
    project: Project;
}

export interface ChatSessionResponse extends APIResponse {
    session: ChatSession;
}

// WebSocket 메시지 타입
export interface WebSocketMessage {
    type: 'message' | 'file_upload' | 'analysis' | 'error' | 'status';
    data: unknown;
    timestamp: string;
}

type WebSocketCallback = (data: unknown) => void;

// WebSocket 관리자 클래스
class WebSocketManager {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private listeners: Map<string, Set<WebSocketCallback>> = new Map();
    private isConnecting = false;

    constructor() {
        this.connect();
    }

    private connect() {
        if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
            return;
        }

        this.isConnecting = true;

        try {
            const wsClientUrl = joinApiBaseAndPath(WS_BASE_URL, WS_CLIENT_GENERIC_PATH);
            this.ws = new WebSocket(wsClientUrl);

            this.ws.onopen = () => {
                errorLogger.info('WebSocket 연결됨', {
                    component: 'advancedMessageAPI',
                    action: 'connect',
                    websocketUrl: wsClientUrl,
                });
                this.reconnectAttempts = 0;
                this.isConnecting = false;
                this.emit('connected', {});
            };

            this.ws.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);
                    this.emit(message.type, message.data);
                } catch (error) {
                    const err = toError(error);
                    errorLogger.error('WebSocket 메시지 파싱 오류', err, {
                        component: 'advancedMessageAPI',
                        action: 'onmessage',
                    });
                }
            };

            this.ws.onclose = (event) => {
                errorLogger.info('WebSocket 연결 끊김', {
                    component: 'advancedMessageAPI',
                    action: 'onclose',
                    code: event.code,
                    reason: event.reason,
                });
                this.isConnecting = false;
                this.emit('disconnected', { code: event.code, reason: event.reason });

                // 자동 재연결
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    setTimeout(() => {
                        this.reconnectAttempts++;
                        this.connect();
                    }, this.reconnectDelay * this.reconnectAttempts);
                }
            };

            this.ws.onerror = (error) => {
                const err = toError(error);
                errorLogger.error('WebSocket 오류', err, {
                    component: 'advancedMessageAPI',
                    action: 'onerror',
                });
                this.isConnecting = false;
                this.emit('error', error);
            };

        } catch (error) {
            const err = toError(error);
            errorLogger.error('WebSocket 연결 실패', err, {
                component: 'advancedMessageAPI',
                action: 'connect',
                websocketUrl: joinApiBaseAndPath(WS_BASE_URL, WS_CLIENT_GENERIC_PATH),
            });
            this.isConnecting = false;
            this.emit('error', error);
        }
    }

    public send(message: unknown) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            errorLogger.warn('WebSocket이 연결되지 않음', {
                component: 'advancedMessageAPI',
                action: 'send',
                readyState: this.ws?.readyState,
            });
            this.emit('error', new Error('WebSocket 연결되지 않음'));
        }
    }

    public on(event: string, callback: WebSocketCallback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);
    }

    public off(event: string, callback: WebSocketCallback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.delete(callback);
        }
    }

    private emit(event: string, data: unknown) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    const err = toError(error);
                    errorLogger.error('WebSocket 콜백 오류', err, {
                        component: 'advancedMessageAPI',
                        action: 'emit',
                        event,
                    });
                }
            });
        }
    }

    public getStatus(): 'connecting' | 'connected' | 'disconnected' | 'error' {
        if (this.isConnecting) return 'connecting';
        if (this.ws?.readyState === WebSocket.OPEN) return 'connected';
        if (this.ws?.readyState === WebSocket.CLOSED) return 'disconnected';
        return 'error';
    }

    public disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    public reconnect() {
        this.disconnect();
        this.reconnectAttempts = 0;
        setTimeout(() => this.connect(), 100);
    }
}

// API 클라이언트 클래스 (미사용 스텁, 향후 확장용)
class _AdvancedMessageAPIClient {
    private wsManager: WebSocketManager;

    constructor() {
        this.wsManager = new WebSocketManager();
    }

    // HTTP API 메서드들
    async checkServerStatus(): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                joinApiHealthCheckUrl(API_BASE_URL, API_V8_STATUS_PATH),
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('서버 상태 확인 오류', err, {
                component: 'advancedMessageAPI',
                action: 'checkServerStatus',
            });
            throw error;
        }
    }

    async getProjects(): Promise<ProjectsResponse> {
        try {
            const response: AxiosResponse<ProjectsResponse> = await axios.get(
                joinApiHealthCheckUrl(API_BASE_URL, API_V8_PROJECTS_PATH),
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('프로젝트 목록 조회 오류', err, {
                component: 'advancedMessageAPI',
                action: 'getProjects',
            });
            throw error;
        }
    }

    async createProject(projectData: {
        name: string;
        description: string;
        project_type: string;
    }): Promise<ProjectResponse> {
        try {
            const response: AxiosResponse<ProjectResponse> = await axios.post(
                joinApiHealthCheckUrl(API_BASE_URL, API_V8_PROJECTS_PATH),
                projectData
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('프로젝트 생성 오류', err, {
                component: 'advancedMessageAPI',
                action: 'createProject',
                projectName: projectData.name,
            });
            throw error;
        }
    }

    async getChatSessions(projectId: string): Promise<ChatSessionsResponse> {
        try {
            const qs = new URLSearchParams({ [API_QUERY_PARAM_PROJECT_ID]: projectId }).toString();
            const response: AxiosResponse<ChatSessionsResponse> = await axios.get(
                joinApiHealthCheckUrl(API_BASE_URL, `${API_V8_CHAT_SESSIONS_PATH}?${qs}`),
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('대화 세션 목록 조회 오류', err, {
                component: 'advancedMessageAPI',
                action: 'getChatSessions',
                projectId,
            });
            throw error;
        }
    }

    async createChatSession(sessionData: {
        project_id: string;
        title: string;
        initial_message?: string;
    }): Promise<ChatSessionResponse> {
        try {
            const response: AxiosResponse<ChatSessionResponse> = await axios.post(
                joinApiHealthCheckUrl(API_BASE_URL, API_V8_CHAT_SESSIONS_PATH),
                sessionData
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('대화 세션 생성 오류', err, {
                component: 'advancedMessageAPI',
                action: 'createChatSession',
                projectId: sessionData.project_id,
                title: sessionData.title,
            });
            throw error;
        }
    }

    async uploadChatFile(file: File, chatRoomName: string): Promise<APIResponse> {
        try {
            const formData = new FormData();
            formData.append(API_FORM_FIELD_FILE, file);
            formData.append(API_QUERY_PARAM_CHAT_ROOM_NAME, chatRoomName);

            const response: AxiosResponse<APIResponse> = await axios.post(
                joinApiHealthCheckUrl(API_BASE_URL, API_V8_UPLOAD_CHAT_PATH),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('대화 파일 업로드 오류', err, {
                component: 'advancedMessageAPI',
                action: 'uploadChatFile',
                fileName: file.name,
                fileSize: file.size,
                chatRoomName,
            });
            throw error;
        }
    }

    async uploadMediaFiles(
        files: File[],
        chatRoomId: string,
        senderId: string
    ): Promise<APIResponse> {
        try {
            const formData = new FormData();
            files.forEach((file, _index) => {
                formData.append(API_FORM_FIELD_FILES, file);
            });
            formData.append(API_QUERY_PARAM_CHAT_ROOM_ID, chatRoomId);
            formData.append(API_QUERY_PARAM_SENDER_ID, senderId);

            const response: AxiosResponse<APIResponse> = await axios.post(
                joinApiHealthCheckUrl(API_BASE_URL, API_V8_UPLOAD_MEDIA_PATH),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('미디어 파일 업로드 오류', err, {
                component: 'advancedMessageAPI',
                action: 'uploadMediaFiles',
                filesCount: files.length,
                chatRoomId,
                senderId,
            });
            throw error;
        }
    }

    async searchMessages(query: string, filters?: Record<string, unknown>): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                joinApiHealthCheckUrl(API_BASE_URL, API_V8_SEARCH_PATH),
                {
                    params: {
                        query,
                        ...filters,
                    },
                }
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('메시지 검색 오류', err, {
                component: 'advancedMessageAPI',
                action: 'searchMessages',
                query: query,
            });
            throw error;
        }
    }

    async getMessageAnalysis(messageId: string): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_V8_MESSAGES_PATH_PREFIX}/${encodeURIComponent(messageId)}/analysis`,
                ),
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('메시지 분석 오류', err, {
                component: 'advancedMessageAPI',
                action: 'getMessageAnalysis',
                messageId,
            });
            throw error;
        }
    }

    async generateAIMessage(prompt: string, context?: Record<string, unknown>): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.post(
                joinApiHealthCheckUrl(API_BASE_URL, API_V8_AI_MESSAGE_PATH),
                {
                    prompt,
                    context,
                }
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('AI 메시지 생성 오류', err, {
                component: 'advancedMessageAPI',
                action: 'generateAIMessage',
                prompt: prompt,
            });
            throw error;
        }
    }

    async generateAdvancedMessage(request: AdvancedMessageRequestInternal): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.post(
                joinApiHealthCheckUrl(API_BASE_URL, API_V8_AI_GENERATE_ADVANCED_MESSAGE_PATH),
                request
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('고급 메시지 생성 오류', err, {
                component: 'advancedMessageAPI',
                action: 'generateAdvancedMessage',
            });
            throw error;
        }
    }

    async getDatabaseStats(): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                joinApiHealthCheckUrl(API_BASE_URL, API_V8_DATABASE_STATISTICS_PATH),
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('데이터베이스 통계 조회 오류', err, {
                component: 'advancedMessageAPI',
                action: 'getDatabaseStats',
            });
            throw error;
        }
    }

    // 새로운 AI 대화 메서드들
    async sendChatMessage(message: string, context?: Record<string, unknown>): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.post(
                joinApiHealthCheckUrl(API_BASE_URL, API_V8_CHAT_PATH),
                {
                    message,
                    context
                }
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('AI 대화 메시지 전송 오류', err, {
                component: 'advancedMessageAPI',
                action: 'sendChatMessage',
                message: message,
            });
            throw error;
        }
    }

    async getChatSummary(): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                joinApiHealthCheckUrl(API_BASE_URL, API_V8_CHAT_SUMMARY_PATH),
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('대화 요약 조회 오류', err, {
                component: 'advancedMessageAPI',
                action: 'getChatSummary',
            });
            throw error;
        }
    }

    async getConversationSummary(conversationHistory: Array<{ message: string; response: string; timestamp?: string }>): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.post(
                joinApiHealthCheckUrl(API_BASE_URL, API_V8_CONVERSATION_SUMMARY_PATH),
                { conversation_history: conversationHistory }
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('대화 요약 조회 오류', err, {
                component: 'advancedMessageAPI',
                action: 'getConversationSummary',
                conversationHistoryLength: conversationHistory.length,
            });
            throw error;
        }
    }

    async clearChatHistory(): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.delete(
                joinApiHealthCheckUrl(API_BASE_URL, API_V8_CHAT_HISTORY_PATH),
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('대화 히스토리 초기화 오류', err, {
                component: 'advancedMessageAPI',
                action: 'clearChatHistory',
            });
            throw error;
        }
    }

    // 알림 관련 메서드들
    async getNotifications(
        userId?: string,
        projectId?: string,
        unreadOnly: boolean = false,
        limit: number = 50
    ): Promise<APIResponse> {
        try {
            const params: Record<string, string | number | boolean> = { [API_QUERY_PARAM_LIMIT]: limit };
            if (userId) params[API_QUERY_PARAM_USER_ID] = userId;
            if (projectId) params[API_QUERY_PARAM_PROJECT_ID] = projectId;
            if (unreadOnly) params[API_QUERY_PARAM_UNREAD_ONLY] = true;

            const response: AxiosResponse<APIResponse> = await axios.get(
                joinApiHealthCheckUrl(API_BASE_URL, API_V8_NOTIFICATIONS_PATH),
                { params }
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('알림 조회 오류', err, {
                component: 'advancedMessageAPI',
                action: 'getNotifications',
                userId,
                projectId,
                unreadOnly,
                limit,
            });
            throw error;
        }
    }

    async createNotification(notificationData: {
        notification_type: string;
        title: string;
        message: string;
        priority?: string;
        data?: Record<string, unknown>;
        user_id?: string;
        project_id?: string;
    }): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.post(
                joinApiHealthCheckUrl(API_BASE_URL, API_V8_NOTIFICATIONS_PATH),
                notificationData
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('알림 생성 오류', err, {
                component: 'advancedMessageAPI',
                action: 'createNotification',
                notificationType: notificationData.notification_type,
                title: notificationData.title,
            });
            throw error;
        }
    }

    async markNotificationAsRead(notificationId: string): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.put(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_V8_NOTIFICATIONS_PATH}/${encodeURIComponent(notificationId)}/read`,
                ),
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('알림 읽음 표시 오류', err, {
                component: 'advancedMessageAPI',
                action: 'markNotificationAsRead',
                notificationId,
            });
            throw error;
        }
    }

    async dismissNotification(notificationId: string): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.delete(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_V8_NOTIFICATIONS_PATH}/${encodeURIComponent(notificationId)}`,
                ),
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('알림 해제 오류', err, {
                component: 'advancedMessageAPI',
                action: 'dismissNotification',
                notificationId,
            });
            throw error;
        }
    }

    async getUnreadNotificationCount(userId?: string): Promise<APIResponse> {
        try {
            const params: Record<string, string> = {};
            if (userId) params[API_QUERY_PARAM_USER_ID] = userId;

            const response: AxiosResponse<APIResponse> = await axios.get(
                joinApiHealthCheckUrl(API_BASE_URL, API_V8_NOTIFICATIONS_UNREAD_COUNT_PATH),
                { params }
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('읽지 않은 알림 개수 조회 오류', err, {
                component: 'advancedMessageAPI',
                action: 'getUnreadNotificationCount',
                userId,
            });
            throw error;
        }
    }

    async getNotificationStatistics(): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                joinApiHealthCheckUrl(API_BASE_URL, API_V8_NOTIFICATIONS_STATISTICS_PATH),
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('알림 통계 조회 오류', err, {
                component: 'advancedMessageAPI',
                action: 'getNotificationStatistics',
            });
            throw error;
        }
    }

    // 대화 분석 관련 메서드들
    async getConversationAnalysis(conversationId?: string): Promise<APIResponse> {
        try {
            const params = conversationId
                ? `?${API_QUERY_PARAM_CONVERSATION_ID}=${encodeURIComponent(conversationId)}`
                : '';
            const response: AxiosResponse<APIResponse> = await axios.get(
                joinApiHealthCheckUrl(API_BASE_URL, `${API_V8_CONVERSATION_ANALYSIS_PATH}${params}`),
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('대화 분석 조회 오류', err, {
                component: 'advancedMessageAPI',
                action: 'getConversationAnalysis',
                conversationId,
            });
            throw error;
        }
    }

    async getConversationStatistics(chatRoomId: string): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_V8_CONVERSATION_STATISTICS_PATH_PREFIX}/${encodeURIComponent(chatRoomId)}`,
                ),
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('대화 통계 조회 오류', err, {
                component: 'advancedMessageAPI',
                action: 'getConversationStatistics',
                chatRoomId,
            });
            throw error;
        }
    }

    async analyzeConversationData(messages: Array<{ content: string; role: string; timestamp?: string }>): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.post(
                joinApiHealthCheckUrl(API_BASE_URL, API_V8_CONVERSATION_ANALYZE_PATH),
                { messages }
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('대화 데이터 분석 오류', err, {
                component: 'advancedMessageAPI',
                action: 'analyzeConversationData',
                messagesCount: messages.length,
            });
            throw error;
        }
    }

    async getUserConversationProfile(userId: string): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_V8_CONVERSATION_USER_PROFILE_PATH_PREFIX}/${encodeURIComponent(userId)}`,
                ),
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('사용자 프로필 조회 오류', err, {
                component: 'advancedMessageAPI',
                action: 'getUserConversationProfile',
                userId,
            });
            throw error;
        }
    }

    async clearConversationData(): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.delete(
                joinApiHealthCheckUrl(API_BASE_URL, API_V8_CONVERSATION_CLEAR_PATH),
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('대화 데이터 초기화 오류', err, {
                component: 'advancedMessageAPI',
                action: 'clearConversationData',
            });
            throw error;
        }
    }

    // 실시간 모니터링 관련 메서드들
    async getConversationMonitoringStatus(conversationId: string): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_V8_MONITORING_STATUS_PATH_PREFIX}/${encodeURIComponent(conversationId)}`,
                ),
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('모니터링 상태 조회 오류', err, {
                component: 'advancedMessageAPI',
                action: 'getConversationMonitoringStatus',
                conversationId,
            });
            throw error;
        }
    }

    async getConversationEvents(conversationId: string, limit: number = 10): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_V8_MONITORING_EVENTS_PATH_PREFIX}/${encodeURIComponent(conversationId)}?${API_QUERY_PARAM_LIMIT}=${encodeURIComponent(String(limit))}`,
                ),
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('대화 이벤트 조회 오류', err, {
                component: 'advancedMessageAPI',
                action: 'getConversationEvents',
                conversationId,
                limit,
            });
            throw error;
        }
    }

    async getConversationPredictions(conversationId: string, limit: number = 10): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_V8_MONITORING_PREDICTIONS_PATH_PREFIX}/${encodeURIComponent(conversationId)}?${API_QUERY_PARAM_LIMIT}=${encodeURIComponent(String(limit))}`,
                ),
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('대화 예측 조회 오류', err, {
                component: 'advancedMessageAPI',
                action: 'getConversationPredictions',
                conversationId,
                limit,
            });
            throw error;
        }
    }

    async getMonitoringSystemStats(): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                joinApiHealthCheckUrl(API_BASE_URL, API_V8_MONITORING_SYSTEM_STATS_PATH),
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('모니터링 시스템 통계 조회 오류', err, {
                component: 'advancedMessageAPI',
                action: 'getMonitoringSystemStats',
            });
            throw error;
        }
    }

    async stopConversationMonitoring(conversationId: string): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.post(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_V8_MONITORING_STOP_PATH_PREFIX}/${encodeURIComponent(conversationId)}`,
                ),
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('모니터링 중지 오류', err, {
                component: 'advancedMessageAPI',
                action: 'stopConversationMonitoring',
                conversationId,
            });
            throw error;
        }
    }

    // 고급 ML 엔진 관련 메서드들
    async getUserMLProfile(userId: string): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_V8_ML_USER_PROFILE_PATH_PREFIX}/${encodeURIComponent(userId)}`,
                ),
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('사용자 ML 프로필 조회 오류', err, {
                component: 'advancedMessageAPI',
                action: 'getUserMLProfile',
                userId,
            });
            throw error;
        }
    }

    async getAllUserMLProfiles(): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                joinApiHealthCheckUrl(API_BASE_URL, API_V8_ML_USER_PROFILES_PATH),
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('모든 사용자 ML 프로필 조회 오류', err, {
                component: 'advancedMessageAPI',
                action: 'getAllUserMLProfiles',
            });
            throw error;
        }
    }

    async predictUserEngagement(message: string, context?: Record<string, unknown>): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.post(
                joinApiHealthCheckUrl(API_BASE_URL, API_V8_ML_PREDICT_ENGAGEMENT_PATH),
                { message, context }
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('참여도 예측 오류', err, {
                component: 'advancedMessageAPI',
                action: 'predictUserEngagement',
                message: message,
            });
            throw error;
        }
    }

    async predictResponseTime(message: string, context?: Record<string, unknown>): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.post(
                joinApiHealthCheckUrl(API_BASE_URL, API_V8_ML_PREDICT_RESPONSE_TIME_PATH),
                { message, context }
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('응답 시간 예측 오류', err, {
                component: 'advancedMessageAPI',
                action: 'predictResponseTime',
                message: message,
            });
            throw error;
        }
    }

    async getPersonalizedResponse(message: string, context?: Record<string, unknown>): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.post(
                joinApiHealthCheckUrl(API_BASE_URL, API_V8_ML_PERSONALIZED_RESPONSE_PATH),
                { message, context }
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('개인화된 응답 스타일 조회 오류', err, {
                component: 'advancedMessageAPI',
                action: 'getPersonalizedResponse',
                message: message,
            });
            throw error;
        }
    }

    async clearUserMLData(userId: string): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.delete(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_V8_ML_USER_DATA_PATH_PREFIX}/${encodeURIComponent(userId)}`,
                ),
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('사용자 ML 데이터 삭제 오류', err, {
                component: 'advancedMessageAPI',
                action: 'clearUserMLData',
                userId,
            });
            throw error;
        }
    }

    async getMLSystemStats(): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                joinApiHealthCheckUrl(API_BASE_URL, API_V8_ML_SYSTEM_STATS_PATH),
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('ML 시스템 통계 조회 오류', err, {
                component: 'advancedMessageAPI',
                action: 'getMLSystemStats',
            });
            throw error;
        }
    }

    async getAIModelPerformance(): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                joinApiHealthCheckUrl(API_BASE_URL, API_V8_AI_MODEL_PERFORMANCE_PATH),
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('AI 모델 성능 조회 오류', err, {
                component: 'advancedMessageAPI',
                action: 'getAIModelPerformance',
            });
            throw error;
        }
    }

    async getPerformanceAnalysis(): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                joinApiHealthCheckUrl(API_BASE_URL, API_V8_AI_PERFORMANCE_ANALYSIS_PATH),
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('성능 분석 조회 오류', err, {
                component: 'advancedMessageAPI',
                action: 'getPerformanceAnalysis',
            });
            throw error;
        }
    }

    async getUserProfile(userId: string): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_V8_USER_PROFILE_PATH_PREFIX}/${encodeURIComponent(userId)}`,
                ),
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('사용자 프로필 조회 오류', err, {
                component: 'advancedMessageAPI',
                action: 'getUserProfile',
                userId,
            });
            throw error;
        }
    }

    async updateUserProfile(profile: UserProfileData & { id: string }): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.put(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_V8_USER_PROFILE_PATH_PREFIX}/${encodeURIComponent(profile.id)}`,
                ),
                profile
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('사용자 프로필 업데이트 오류', err, {
                component: 'advancedMessageAPI',
                action: 'updateUserProfile',
                userId: profile.id,
            });
            throw error;
        }
    }

    async submitLearningFeedback(feedback: LearningFeedbackData): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.post(
                joinApiHealthCheckUrl(API_BASE_URL, API_V8_AI_LEARNING_FEEDBACK_PATH),
                feedback
            );
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('학습 피드백 제출 오류', err, {
                component: 'advancedMessageAPI',
                action: 'submitLearningFeedback',
                messageId: feedback.message_id,
            });
            throw error;
        }
    }

    /**
     * 프로젝트 분석 API
     */
    async analyzeProject(roomId: string): Promise<ProjectAnalysisResult> {
        try {
            const response = await axios.get(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_V7_GAEPOSUNG_ANALYSIS_PATH_PREFIX}/${encodeURIComponent(roomId)}`,
                ),
            );
            const data = response.data;

            if (!data.success) {
                throw new Error(data.error || '프로젝트 분석 실패');
            }

            return data.analysis;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('프로젝트 분석 API 오류', err, {
                component: 'advancedMessageAPI',
                action: 'analyzeProject',
                roomId,
            });
            // 기본 분석 데이터 반환
            return {
                totalMessages: 8504,
                participants: 15,
                sentimentAnalysis: {
                    positive: 13,
                    neutral: 60,
                    negative: 27
                },
                keyTopics: [
                    '시공사 평가 기준',
                    '공사비 및 분담금',
                    '홍보방식',
                    '평면·커뮤니티 비교',
                    '설계 품질'
                ],
                topSpeakers: [
                    { name: '0035_우성7차', messageCount: 245, influence: 85 },
                    { name: '0111', messageCount: 189, influence: 78 },
                    { name: '0045', messageCount: 156, influence: 72 },
                    { name: '0125', messageCount: 134, influence: 68 },
                    { name: '0114', messageCount: 98, influence: 65 }
                ],
                timeline: [
                    {
                        date: '2025-07-15',
                        events: ['대화방 생성', '첫 번째 메시지']
                    },
                    {
                        date: '2025-07-20',
                        events: ['시공사 평가 논의 시작']
                    },
                    {
                        date: '2025-07-25',
                        events: ['공사비 분담금 이슈']
                    },
                    {
                        date: '2025-08-01',
                        events: ['홍보방식 논의', '설계 품질 비교']
                    }
                ],
                specializedAnalysis: {
                    constructionCompany: {
                        messageCount: 156,
                        sentiment: { positive: 15, neutral: 65, negative: 20 }
                    },
                    constructionCost: {
                        messageCount: 234,
                        sentiment: { positive: 10, neutral: 55, negative: 35 }
                    },
                    designQuality: {
                        messageCount: 189,
                        sentiment: { positive: 25, neutral: 60, negative: 15 }
                    }
                }
            };
        }
    }

    // 프로젝트 관리 API
    async getProjectOverview(roomId: string): Promise<ProjectOverviewResult> {
        try {
            const response = await axios.get(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_V7_GAEPOSUNG_PROJECT_OVERVIEW_PATH_PREFIX}/${encodeURIComponent(roomId)}`,
                ),
            );
            return response.data as ProjectOverviewResult;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('프로젝트 개요 조회 오류', err, {
                component: 'advancedMessageAPI',
                action: 'getProjectOverview',
                roomId,
            });
            return { success: false, overview: {} };
        }
    }

    async getProjectTasks(roomId: string): Promise<ProjectTasksResult> {
        try {
            const response = await axios.get(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_V7_GAEPOSUNG_PROJECT_TASKS_PATH_PREFIX}/${encodeURIComponent(roomId)}`,
                ),
            );
            return response.data as ProjectTasksResult;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('프로젝트 작업 조회 오류', err, {
                component: 'advancedMessageAPI',
                action: 'getProjectTasks',
                roomId,
            });
            return { success: false, tasks: [] };
        }
    }

    async createProjectTask(roomId: string, taskData: Record<string, unknown>): Promise<ProjectTaskResult> {
        try {
            const response = await axios.post(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_V7_GAEPOSUNG_PROJECT_TASKS_PATH_PREFIX}/${encodeURIComponent(roomId)}`,
                ),
                taskData,
            );
            return response.data as ProjectTaskResult;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('프로젝트 작업 생성 오류', err, {
                component: 'advancedMessageAPI',
                action: 'createProjectTask',
                roomId,
            });
            return { success: false, task: null };
        }
    }

    async updateProjectTask(taskId: string, taskData: Record<string, unknown>): Promise<ProjectTaskResult> {
        try {
            const response = await axios.put(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_V7_GAEPOSUNG_PROJECT_TASKS_PATH_PREFIX}/${encodeURIComponent(taskId)}`,
                ),
                taskData,
            );
            return response.data as ProjectTaskResult;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('프로젝트 작업 업데이트 오류', err, {
                component: 'advancedMessageAPI',
                action: 'updateProjectTask',
                taskId,
            });
            return { success: false, task: null };
        }
    }

    async deleteProjectTask(taskId: string): Promise<{ success: boolean }> {
        try {
            const response = await axios.delete(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_V7_GAEPOSUNG_PROJECT_TASKS_PATH_PREFIX}/${encodeURIComponent(taskId)}`,
                ),
            );
            return response.data as { success: boolean };
        } catch (error) {
            const err = toError(error);
            errorLogger.error('프로젝트 작업 삭제 오류', err, {
                component: 'advancedMessageAPI',
                action: 'deleteProjectTask',
                taskId,
            });
            return { success: false };
        }
    }

    async getProjectMilestones(roomId: string): Promise<ProjectMilestonesResult> {
        try {
            const response = await axios.get(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_V7_GAEPOSUNG_PROJECT_MILESTONES_PATH_PREFIX}/${encodeURIComponent(roomId)}`,
                ),
            );
            return response.data as ProjectMilestonesResult;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('프로젝트 마일스톤 조회 오류', err, {
                component: 'advancedMessageAPI',
                action: 'getProjectMilestones',
                roomId,
            });
            return { success: false, milestones: [] };
        }
    }

    async createProjectMilestone(roomId: string, milestoneData: Record<string, unknown>): Promise<ProjectMilestoneResult> {
        try {
            const response = await axios.post(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_V7_GAEPOSUNG_PROJECT_MILESTONES_PATH_PREFIX}/${encodeURIComponent(roomId)}`,
                ),
                milestoneData,
            );
            return response.data as ProjectMilestoneResult;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('프로젝트 마일스톤 생성 오류', err, {
                component: 'advancedMessageAPI',
                action: 'createProjectMilestone',
                roomId,
            });
            return { success: false, milestone: null };
        }
    }

    // AI 추천 관련 API
    async getProjectRecommendations(roomId: string): Promise<ProjectRecommendationsResult> {
        try {
            const response = await axios.get(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_V7_GAEPOSUNG_PROJECT_RECOMMENDATIONS_PATH_PREFIX}/${encodeURIComponent(roomId)}`,
                ),
            );
            return response.data as ProjectRecommendationsResult;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('AI 추천 조회 오류', err, {
                component: 'advancedMessageAPI',
                action: 'getProjectRecommendations',
                roomId,
            });
            return { success: false, recommendations: [] };
        }
    }

    async generateProjectRecommendations(roomId: string): Promise<ProjectRecommendationsResult> {
        try {
            const response = await axios.post(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_V7_GAEPOSUNG_PROJECT_RECOMMENDATIONS_PATH_PREFIX}/${encodeURIComponent(roomId)}/generate`,
                ),
            );
            return response.data as ProjectRecommendationsResult;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('AI 추천 생성 오류', err, {
                component: 'advancedMessageAPI',
                action: 'generateProjectRecommendations',
                roomId,
            });
            return { success: false, recommendations: [] };
        }
    }

    async updateRecommendationStatus(recommendationId: string, status: string): Promise<{ success: boolean }> {
        try {
            const response = await axios.put(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${API_V7_GAEPOSUNG_PROJECT_RECOMMENDATIONS_PATH_PREFIX}/${encodeURIComponent(recommendationId)}/status`,
                ),
                { status },
            );
            return response.data as { success: boolean };
        } catch (error) {
            const err = toError(error);
            errorLogger.error('AI 추천 상태 업데이트 오류', err, {
                component: 'advancedMessageAPI',
                action: 'updateRecommendationStatus',
                recommendationId,
                status,
            });
            return { success: false };
        }
    }

    // 메시지 생성 API
    async generateMessage(params: {
        context?: string;
        topic?: string;
        style?: string;
        length?: string;
        roomId?: string;
    }): Promise<GeneratedMessagesResult> {
        try {
            const response = await axios.post(joinApiHealthCheckUrl(API_BASE_URL, API_V7_GENERATE_MESSAGE_PATH), {
                context: params.context || "",
                room_id: params.roomId || "",
                style: params.style || "professional"
            });
            return response.data;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('메시지 생성 오류', err, {
                component: 'advancedMessageAPI',
                action: 'generateMessage',
                context: params.context,
                roomId: params.roomId,
                style: params.style,
            });
            return { success: false, messages: [] };
        }
    }

    // WebSocket 관련 메서드들
    public getWebSocketManager(): WebSocketManager {
        return this.wsManager;
    }

    public sendWebSocketMessage(message: unknown) {
        this.wsManager.send(message);
    }

    public onWebSocket(event: string, callback: WebSocketCallback) {
        this.wsManager.on(event, callback);
    }

    public offWebSocket(event: string, callback: WebSocketCallback) {
        this.wsManager.off(event, callback);
    }

    public getWebSocketStatus() {
        return this.wsManager.getStatus();
    }

    public reconnectWebSocket() {
        this.wsManager.reconnect();
    }
}

interface GenerateMessageRequest {
    context: string;
    topic?: string;
    style: 'professional' | 'casual' | 'formal';
    roomId?: string;
}

interface GenerateMessageResponse {
    success: boolean;
    messages?: Array<{
        text: string;
        confidence: number;
        category: string;
    }>;
    error?: string;
}

interface ConversationAnalysisResponse {
    success: boolean;
    analysis?: AnalysisData;
    error?: string;
}

interface UserProfileResponse {
    success: boolean;
    user_profile?: UserProfileData;
    error?: string;
}

interface MonitoringResponse {
    success: boolean;
    data?: MonitoringData | MonitoringData[];
    error?: string;
}

interface MonitoringData {
    is_monitoring?: boolean;
    last_activity?: string;
    active_participants?: number;
    type?: string;
    timestamp?: string;
    user?: string;
}

interface PredictionResponse {
    success: boolean;
    prediction?: PredictionData;
    data?: Array<{ prediction: string; confidence: number }>;
    error?: string;
}

interface PersonalizedResponse {
    success: boolean;
    personalized_style?: PersonalizedStyleData;
    error?: string;
}

interface SystemStatsResponse {
    success: boolean;
    stats?: SystemStats;
    error?: string;
}

interface ServerStatusResponse {
    success: boolean;
    data?: ServerStatusData;
    error?: string;
}

interface ServerStatusData {
    status?: string;
    uptime?: string;
    response_time?: string;
    active_connections?: number;
}

interface AIModelPerformanceResponse {
    success: boolean;
    data?: AIModelPerformanceData;
    error?: string;
}

interface AIModelPerformanceData {
    models?: Array<{ name: string; accuracy: number; response_time: number }>;
}

interface PerformanceAnalysisResponse {
    success: boolean;
    data?: PerformanceAnalysisData;
    error?: string;
}

interface PerformanceAnalysisData {
    avg_response_time?: number;
    success_rate?: number;
    user_satisfaction?: number;
    total_requests?: number;
}

interface UserProfileDataResponse {
    success: boolean;
    data?: UserProfileFullData;
    error?: string;
}

interface UserProfileFullData {
    user_id?: string;
    preferences?: {
        language?: string;
        style?: string;
        topics?: string[];
    };
    history?: {
        total_messages?: number;
        avg_response_time?: number;
    };
}

interface AdvancedMessageRequest {
    context: string;
    style: string;
    user_profile: UserProfileData;
    performance_metrics: PerformanceMetrics;
}

interface AdvancedMessageResponse {
    success: boolean;
    data?: AdvancedMessageData;
    error?: string;
}

interface AdvancedMessageData {
    id?: string;
    text?: string;
    confidence?: number;
    style?: string;
    generated_at?: string;
}

interface LearningFeedbackRequest {
    message_id: string;
    user_feedback: string;
    success_indicator: boolean;
    improvement_suggestions?: string;
}

interface UserMLProfileResponse {
    success: boolean;
    profile?: UserMLProfile;
    error?: string;
}

interface UserMLProfile {
    user_id?: string;
    ml_preferences?: {
        model_type?: string;
        learning_rate?: number;
        batch_size?: number;
    };
    performance_metrics?: {
        accuracy?: number;
        precision?: number;
        recall?: number;
    };
}

interface AllUserMLProfilesResponse {
    success: boolean;
    profiles?: UserMLProfile[];
    error?: string;
}

interface MLSystemStatsResponse {
    success: boolean;
    stats?: SystemStats;
    error?: string;
}

interface UserEngagementPredictionResponse {
    success: boolean;
    prediction?: PredictionData;
    error?: string;
}

interface ResponseTimePredictionResponse {
    success: boolean;
    prediction?: ResponseTimePrediction;
    error?: string;
}

interface ResponseTimePrediction {
    estimated_time?: number;
    confidence?: number;
    factors?: string[];
}

export const advancedMessageAPI = {
    generateMessage: async (request: GenerateMessageRequest): Promise<GenerateMessageResponse> => {
        try {
            // 실제 API 호출 대신 시뮬레이션된 응답
            const mockMessages = [
                {
                    text: '안녕하세요! 프로젝트·문서·대화에 대해 어떤 도움이 필요하신가요?',
                    confidence: 0.95,
                    category: '인사'
                },
                {
                    text: '시공사 평가 기준이나 공사비 분담금에 대해 논의해보시겠어요?',
                    confidence: 0.88,
                    category: '프로젝트 관련'
                },
                {
                    text: '설계 품질 비교나 홍보 전략에 대한 의견을 들려주세요.',
                    confidence: 0.82,
                    category: '기술적 제안'
                }
            ];

            // 요청된 스타일에 따라 메시지 조정
            const styleAdjustedMessages = mockMessages.map(msg => ({
                ...msg,
                text: request.style === 'formal'
                    ? `${msg.text} (공식적인 톤으로)`
                    : request.style === 'casual'
                        ? `${msg.text} (친근한 톤으로)`
                        : msg.text
            }));

            return {
                success: true,
                messages: styleAdjustedMessages
            };
        } catch (error) {
            return {
                success: false,
                error: '메시지 생성 중 오류가 발생했습니다.'
            };
        }
    },

    // 누락된 메서드들 추가
    getConversationAnalysis: async (_conversationId: string): Promise<ConversationAnalysisResponse> => {
        try {
            // 시뮬레이션된 대화 분석 데이터
            return {
                success: true,
                analysis: {
                    total_messages: 150,
                    sentiment_score: 0.75,
                    key_topics: ['시공사', '공사비', '설계'],
                    engagement_rate: 0.85
                }
            };
        } catch (error) {
            return {
                success: false,
                error: '대화 분석 중 오류가 발생했습니다.'
            };
        }
    },

    getConversationStatistics: async (_chatRoomId: string): Promise<APIResponse> => {
        try {
            // 시뮬레이션된 대화 통계 데이터
            return {
                success: true,
                analysis: {
                    total_messages: 150,
                    active_users: 8,
                    average_response_time: 2.3,
                    popular_topics: ['프로젝트 관리', '기술 분석', '팀 협업'],
                    engagement_rate: 0.85
                },
                insights: [
                    '사용자 참여도가 높은 시간대는 오후 2-4시입니다.',
                    '프로젝트 관련 질문이 가장 많이 발생합니다.',
                    '평균 응답 시간이 점진적으로 개선되고 있습니다.'
                ]
            };
        } catch (error) {
            return {
                success: false,
                error: '대화 통계 조회 중 오류가 발생했습니다.'
            };
        }
    },

    analyzeConversationData: async (messages: Array<{ content?: string; role?: string; timestamp?: string }>): Promise<APIResponse> => {
        try {
            // 시뮬레이션된 대화 데이터 분석
            return {
                success: true,
                analysis: {
                    message_count: messages.length,
                    average_message_length: 45,
                    sentiment_distribution: {
                        positive: 0.6,
                        neutral: 0.3,
                        negative: 0.1
                    },
                    topic_analysis: {
                        primary_topics: ['프로젝트', '기술', '협업'],
                        topic_confidence: 0.85
                    }
                },
                insights: [
                    '대화의 전반적인 톤이 긍정적입니다.',
                    '프로젝트 관련 주제가 가장 많이 논의됩니다.',
                    '사용자 참여도가 높은 편입니다.'
                ]
            };
        } catch (error) {
            return {
                success: false,
                error: '대화 데이터 분석 중 오류가 발생했습니다.'
            };
        }
    },

    getUserConversationProfile: async (userId: string): Promise<UserProfileResponse> => {
        try {
            return {
                success: true,
                user_profile: {
                    user_id: userId,
                    communication_style: 'professional',
                    preferred_topics: ['기술', '비즈니스'],
                    engagement_level: 'high'
                }
            };
        } catch (error) {
            return {
                success: false,
                error: '사용자 프로필 로드 중 오류가 발생했습니다.'
            };
        }
    },

    clearConversationData: async (): Promise<{ success: boolean }> => {
        try {
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    },

    getConversationMonitoringStatus: async (_conversationId: string): Promise<MonitoringResponse> => {
        try {
            return {
                success: true,
                data: {
                    is_monitoring: true,
                    last_activity: new Date().toISOString(),
                    active_participants: 3
                }
            };
        } catch (error) {
            return {
                success: false,
                error: '모니터링 상태 조회 중 오류가 발생했습니다.'
            };
        }
    },

    getConversationEvents: async (_conversationId: string, _limit: number): Promise<MonitoringResponse> => {
        try {
            return {
                success: true,
                data: [
                    { type: 'message', timestamp: new Date().toISOString(), user: 'user1' },
                    { type: 'file_upload', timestamp: new Date().toISOString(), user: 'user2' }
                ]
            };
        } catch (error) {
            return {
                success: false,
                error: '이벤트 조회 중 오류가 발생했습니다.'
            };
        }
    },

    getConversationPredictions: async (_conversationId: string, _limit: number): Promise<PredictionResponse> => {
        try {
            return {
                success: true,
                prediction: {
                    next_topic: '시공사 평가',
                    engagement_prediction: 0.85,
                    response_time_prediction: 2.5
                },
                data: [
                    { prediction: '시공사 평가', confidence: 0.85 },
                    { prediction: '공사비 분석', confidence: 0.72 }
                ]
            };
        } catch (error) {
            return {
                success: false,
                error: '예측 조회 중 오류가 발생했습니다.'
            };
        }
    },

    getMonitoringSystemStats: async (): Promise<SystemStatsResponse> => {
        try {
            return {
                success: true,
                stats: {
                    total_conversations: 25,
                    active_monitors: 8,
                    avg_response_time: 2.3,
                    system_health: 'excellent'
                }
            };
        } catch (error) {
            return {
                success: false,
                error: '시스템 통계 조회 중 오류가 발생했습니다.'
            };
        }
    },

    stopConversationMonitoring: async (_conversationId: string): Promise<{ success: boolean }> => {
        try {
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    },

    analyzeProject: async (_roomId: string): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> => {
        try {
            return {
                success: true,
                data: {
                    project_name: '샘플 프로젝트',
                    total_files: 15,
                    total_messages: 150,
                    completion_rate: 75
                }
            };
        } catch (error) {
            return {
                success: false,
                error: '프로젝트 분석 중 오류가 발생했습니다.'
            };
        }
    },

    getPersonalizedResponse: async (_message: string, _context: string): Promise<PersonalizedResponse> => {
        try {
            return {
                success: true,
                personalized_style: {
                    tone: 'professional',
                    formality_level: 'high',
                    response_length: 'medium'
                }
            };
        } catch (error) {
            return {
                success: false,
                error: '개인화된 응답 생성 중 오류가 발생했습니다.'
            };
        }
    },

    clearUserMLData: async (_userId: string): Promise<{ success: boolean }> => {
        try {
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    },

    // 새로운 메서드들 추가
    checkServerStatus: async (): Promise<ServerStatusResponse> => {
        try {
            return {
                success: true,
                data: {
                    status: 'online',
                    uptime: '99.9%',
                    response_time: '120ms',
                    active_connections: 15
                }
            };
        } catch (error) {
            return {
                success: false,
                error: '서버 상태 확인 중 오류가 발생했습니다.'
            };
        }
    },

    getAIModelPerformance: async (): Promise<AIModelPerformanceResponse> => {
        try {
            return {
                success: true,
                data: {
                    models: [
                        { name: 'GPT-4', accuracy: 0.95, response_time: 1.2 },
                        { name: 'BERT', accuracy: 0.88, response_time: 0.8 },
                        { name: 'Custom Model', accuracy: 0.92, response_time: 1.0 }
                    ]
                }
            };
        } catch (error) {
            return {
                success: false,
                error: 'AI 모델 성능 조회 중 오류가 발생했습니다.'
            };
        }
    },

    getPerformanceAnalysis: async (): Promise<PerformanceAnalysisResponse> => {
        try {
            return {
                success: true,
                data: {
                    avg_response_time: 1.5,
                    success_rate: 0.95,
                    user_satisfaction: 4.2,
                    total_requests: 1250
                }
            };
        } catch (error) {
            return {
                success: false,
                error: '성능 분석 조회 중 오류가 발생했습니다.'
            };
        }
    },

    getUserProfile: async (userId: string): Promise<UserProfileDataResponse> => {
        try {
            return {
                success: true,
                data: {
                    user_id: userId,
                    preferences: {
                        language: 'ko',
                        style: 'professional',
                        topics: ['기술', '비즈니스']
                    },
                    history: {
                        total_messages: 150,
                        avg_response_time: 2.1
                    }
                }
            };
        } catch (error) {
            return {
                success: false,
                error: '사용자 프로필 조회 중 오류가 발생했습니다.'
            };
        }
    },

    generateAdvancedMessage: async (request: AdvancedMessageRequest): Promise<AdvancedMessageResponse> => {
        try {
            return {
                success: true,
                data: {
                    id: Date.now().toString(),
                    text: '선택한 프로젝트에 대한 고급 분석 결과입니다.',
                    confidence: 0.95,
                    style: request.style,
                    generated_at: new Date().toISOString()
                }
            };
        } catch (error) {
            return {
                success: false,
                error: '고급 메시지 생성 중 오류가 발생했습니다.'
            };
        }
    },

    submitLearningFeedback: async (_feedback: LearningFeedbackRequest): Promise<{ success: boolean }> => {
        try {
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    },

    updateUserProfile: async (_profile: UserProfileData): Promise<{ success: boolean }> => {
        try {
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    },

    getUserMLProfile: async (userId: string): Promise<UserMLProfileResponse> => {
        try {
            return {
                success: true,
                profile: {
                    user_id: userId,
                    ml_preferences: {
                        model_type: 'transformer',
                        learning_rate: 0.001,
                        batch_size: 32
                    },
                    performance_metrics: {
                        accuracy: 0.92,
                        precision: 0.89,
                        recall: 0.94
                    }
                }
            };
        } catch (error) {
            return {
                success: false,
                error: 'ML 사용자 프로필 조회 중 오류가 발생했습니다.'
            };
        }
    },

    getAllUserMLProfiles: async (): Promise<AllUserMLProfilesResponse> => {
        try {
            return {
                success: true,
                profiles: [
                    {
                        user_id: 'user1',
                        ml_preferences: { model_type: 'transformer' },
                        performance_metrics: { accuracy: 0.92 }
                    },
                    {
                        user_id: 'user2',
                        ml_preferences: { model_type: 'bert' },
                        performance_metrics: { accuracy: 0.88 }
                    }
                ]
            };
        } catch (error) {
            return {
                success: false,
                error: '모든 ML 사용자 프로필 조회 중 오류가 발생했습니다.'
            };
        }
    },

    getMLSystemStats: async (): Promise<MLSystemStatsResponse> => {
        try {
            return {
                success: true,
                stats: {
                    total_users: 25,
                    active_models: 3,
                    avg_accuracy: 0.91,
                    total_predictions: 1250
                }
            };
        } catch (error) {
            return {
                success: false,
                error: 'ML 시스템 통계 조회 중 오류가 발생했습니다.'
            };
        }
    },

    predictUserEngagement: async (_message: string, _context: string): Promise<UserEngagementPredictionResponse> => {
        try {
            return {
                success: true,
                prediction: {
                    engagement_score: 0.85,
                    response_likelihood: 0.92,
                    interaction_duration: 2.5
                }
            };
        } catch (error) {
            return {
                success: false,
                error: '사용자 참여도 예측 중 오류가 발생했습니다.'
            };
        }
    },

    predictResponseTime: async (_message: string, _context: string): Promise<ResponseTimePredictionResponse> => {
        try {
            return {
                success: true,
                prediction: {
                    estimated_time: 2.3,
                    confidence: 0.88,
                    factors: ['message_length', 'complexity', 'user_history']
                }
            };
        } catch (error) {
            return {
                success: false,
                error: '응답 시간 예측 중 오류가 발생했습니다.'
            };
        }
    },

    getWebSocketManager: () => ({
        connect: () => errorLogger.info('WebSocket 연결', {
            component: 'advancedMessageAPI',
            action: 'getWebSocketManager.connect',
        }),
        disconnect: () => errorLogger.info('WebSocket 연결 해제', {
            component: 'advancedMessageAPI',
            action: 'getWebSocketManager.disconnect',
        }),
        send: (message: unknown) => errorLogger.info('메시지 전송', {
            component: 'advancedMessageAPI',
            action: 'getWebSocketManager.send',
            messagePreview: typeof message === 'string' ? message : 'object',
        }),
        on: (event: string, _callback: WebSocketCallback) => errorLogger.info('이벤트 리스너 등록', {
            component: 'advancedMessageAPI',
            action: 'getWebSocketManager.on',
            event,
        }),
        off: (event: string, _callback: WebSocketCallback) => errorLogger.info('이벤트 리스너 해제', {
            component: 'advancedMessageAPI',
            action: 'getWebSocketManager.off',
            event,
        })
    }),

    sendWebSocketMessage: (message: unknown) => {
        errorLogger.info('WebSocket 메시지 전송', {
            component: 'advancedMessageAPI',
            action: 'sendWebSocketMessage',
            messagePreview: typeof message === 'string' ? message : 'object',
        });
    }
}; 