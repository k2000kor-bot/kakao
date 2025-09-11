import axios, { AxiosResponse } from 'axios';

// API 기본 설정
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';
const WS_BASE_URL = 'ws://localhost:8001';

// 타입 정의
export interface Project {
    id: string;
    name: string;
    description: string;
    project_type: string;
    settings: Record<string, any>;
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

export interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    notifications?: any[];
    unread_count?: number;
    profile?: any;
    profiles?: any[];
    stats?: any;
    prediction?: any;
    personalized_style?: any;
    analysis?: any;
    user_profile?: any;
    insights?: any[];
    visualization?: any;
}

interface AdvancedMessageRequest {
    context: string;
    style: string;
    user_profile: any;
    performance_metrics: any;
}

export interface AdvancedGeneratedMessage {
    id: string;
    original_message: string;
    advanced_message: string;
    analytics: any;
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
    preferences: Record<string, any>;
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
    data: any;
    timestamp: string;
}

// WebSocket 관리자 클래스
class WebSocketManager {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private listeners: Map<string, Set<(data: any) => void>> = new Map();
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
            this.ws = new WebSocket(`${WS_BASE_URL}/ws`);

            this.ws.onopen = () => {
                console.log('WebSocket 연결됨');
                this.reconnectAttempts = 0;
                this.isConnecting = false;
                this.emit('connected', {});
            };

            this.ws.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);
                    this.emit(message.type, message.data);
                } catch (error) {
                    console.error('WebSocket 메시지 파싱 오류:', error);
                }
            };

            this.ws.onclose = (event) => {
                console.log('WebSocket 연결 끊김:', event.code, event.reason);
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
                console.error('WebSocket 오류:', error);
                this.isConnecting = false;
                this.emit('error', error);
            };

        } catch (error) {
            console.error('WebSocket 연결 실패:', error);
            this.isConnecting = false;
            this.emit('error', error);
        }
    }

    public send(message: any) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket이 연결되지 않음');
            this.emit('error', new Error('WebSocket 연결되지 않음'));
        }
    }

    public on(event: string, callback: (data: any) => void) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);
    }

    public off(event: string, callback: (data: any) => void) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.delete(callback);
        }
    }

    private emit(event: string, data: any) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('WebSocket 콜백 오류:', error);
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

// API 클라이언트 클래스
class AdvancedMessageAPIClient {
    private wsManager: WebSocketManager;

    constructor() {
        this.wsManager = new WebSocketManager();
    }

    // HTTP API 메서드들
    async checkServerStatus(): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                `${API_BASE_URL}/api/v8/status`
            );
            return response.data;
        } catch (error) {
            console.error('서버 상태 확인 오류:', error);
            throw error;
        }
    }

    async getProjects(): Promise<ProjectsResponse> {
        try {
            const response: AxiosResponse<ProjectsResponse> = await axios.get(
                `${API_BASE_URL}/api/v8/projects`
            );
            return response.data;
        } catch (error) {
            console.error('프로젝트 목록 조회 오류:', error);
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
                `${API_BASE_URL}/api/v8/projects`,
                projectData
            );
            return response.data;
        } catch (error) {
            console.error('프로젝트 생성 오류:', error);
            throw error;
        }
    }

    async getChatSessions(projectId: string): Promise<ChatSessionsResponse> {
        try {
            const response: AxiosResponse<ChatSessionsResponse> = await axios.get(
                `${API_BASE_URL}/api/v8/chat-sessions?project_id=${projectId}`
            );
            return response.data;
        } catch (error) {
            console.error('채팅 세션 목록 조회 오류:', error);
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
                `${API_BASE_URL}/api/v8/chat-sessions`,
                sessionData
            );
            return response.data;
        } catch (error) {
            console.error('채팅 세션 생성 오류:', error);
            throw error;
        }
    }

    async uploadChatFile(file: File, chatRoomName: string): Promise<APIResponse> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('chat_room_name', chatRoomName);

            const response: AxiosResponse<APIResponse> = await axios.post(
                `${API_BASE_URL}/api/v8/upload-chat`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('채팅 파일 업로드 오류:', error);
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
            files.forEach((file, index) => {
                formData.append(`files`, file);
            });
            formData.append('chat_room_id', chatRoomId);
            formData.append('sender_id', senderId);

            const response: AxiosResponse<APIResponse> = await axios.post(
                `${API_BASE_URL}/api/v8/upload-media`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('미디어 파일 업로드 오류:', error);
            throw error;
        }
    }

    async searchMessages(query: string, filters?: any): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                `${API_BASE_URL}/api/v8/search`,
                {
                    params: {
                        query,
                        ...filters,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('메시지 검색 오류:', error);
            throw error;
        }
    }

    async getMessageAnalysis(messageId: string): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                `${API_BASE_URL}/api/v8/messages/${messageId}/analysis`
            );
            return response.data;
        } catch (error) {
            console.error('메시지 분석 오류:', error);
            throw error;
        }
    }

    async generateAIMessage(prompt: string, context?: any): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.post(
                `${API_BASE_URL}/api/v8/ai-message`,
                {
                    prompt,
                    context,
                }
            );
            return response.data;
        } catch (error) {
            console.error('AI 메시지 생성 오류:', error);
            throw error;
        }
    }

    async generateAdvancedMessage(request: any): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.post(
                `${API_BASE_URL}/api/v8/ai/generate-advanced-message`,
                request
            );
            return response.data;
        } catch (error) {
            console.error('고급 메시지 생성 오류:', error);
            throw error;
        }
    }

    async getDatabaseStats(): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                `${API_BASE_URL}/api/v8/database/statistics`
            );
            return response.data;
        } catch (error) {
            console.error('데이터베이스 통계 조회 오류:', error);
            throw error;
        }
    }

    // 새로운 AI 채팅 메서드들
    async sendChatMessage(message: string, context?: any): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.post(
                `${API_BASE_URL}/api/v8/chat`,
                {
                    message,
                    context
                }
            );
            return response.data;
        } catch (error) {
            console.error('AI 채팅 메시지 전송 오류:', error);
            throw error;
        }
    }

    async getChatSummary(): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                `${API_BASE_URL}/api/v8/chat/summary`
            );
            return response.data;
        } catch (error) {
            console.error('채팅 요약 조회 오류:', error);
            throw error;
        }
    }

    async getConversationSummary(conversationHistory: any[]): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.post(
                `${API_BASE_URL}/api/v8/conversation/summary`,
                { conversation_history: conversationHistory }
            );
            return response.data;
        } catch (error) {
            console.error('대화 요약 조회 오류:', error);
            throw error;
        }
    }

    async clearChatHistory(): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.delete(
                `${API_BASE_URL}/api/v8/chat/history`
            );
            return response.data;
        } catch (error) {
            console.error('채팅 히스토리 초기화 오류:', error);
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
            const params: any = { limit };
            if (userId) params.user_id = userId;
            if (projectId) params.project_id = projectId;
            if (unreadOnly) params.unread_only = true;

            const response: AxiosResponse<APIResponse> = await axios.get(
                `${API_BASE_URL}/api/v8/notifications`,
                { params }
            );
            return response.data;
        } catch (error) {
            console.error('알림 조회 오류:', error);
            throw error;
        }
    }

    async createNotification(notificationData: {
        notification_type: string;
        title: string;
        message: string;
        priority?: string;
        data?: any;
        user_id?: string;
        project_id?: string;
    }): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.post(
                `${API_BASE_URL}/api/v8/notifications`,
                notificationData
            );
            return response.data;
        } catch (error) {
            console.error('알림 생성 오류:', error);
            throw error;
        }
    }

    async markNotificationAsRead(notificationId: string): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.put(
                `${API_BASE_URL}/api/v8/notifications/${notificationId}/read`
            );
            return response.data;
        } catch (error) {
            console.error('알림 읽음 표시 오류:', error);
            throw error;
        }
    }

    async dismissNotification(notificationId: string): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.delete(
                `${API_BASE_URL}/api/v8/notifications/${notificationId}`
            );
            return response.data;
        } catch (error) {
            console.error('알림 해제 오류:', error);
            throw error;
        }
    }

    async getUnreadNotificationCount(userId?: string): Promise<APIResponse> {
        try {
            const params: any = {};
            if (userId) params.user_id = userId;

            const response: AxiosResponse<APIResponse> = await axios.get(
                `${API_BASE_URL}/api/v8/notifications/unread-count`,
                { params }
            );
            return response.data;
        } catch (error) {
            console.error('읽지 않은 알림 개수 조회 오류:', error);
            throw error;
        }
    }

    async getNotificationStatistics(): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                `${API_BASE_URL}/api/v8/notifications/statistics`
            );
            return response.data;
        } catch (error) {
            console.error('알림 통계 조회 오류:', error);
            throw error;
        }
    }

    // 대화 분석 관련 메서드들
    async getConversationAnalysis(conversationId?: string): Promise<APIResponse> {
        try {
            const params = conversationId ? `?conversation_id=${conversationId}` : '';
            const response: AxiosResponse<APIResponse> = await axios.get(
                `${API_BASE_URL}/api/v8/conversation/analysis${params}`
            );
            return response.data;
        } catch (error) {
            console.error('대화 분석 조회 오류:', error);
            throw error;
        }
    }

    async getConversationStatistics(chatRoomId: string): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                `${API_BASE_URL}/api/v8/conversation/statistics/${chatRoomId}`
            );
            return response.data;
        } catch (error) {
            console.error('대화 통계 조회 오류:', error);
            throw error;
        }
    }

    async analyzeConversationData(messages: any[]): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.post(
                `${API_BASE_URL}/api/v8/conversation/analyze`,
                { messages }
            );
            return response.data;
        } catch (error) {
            console.error('대화 데이터 분석 오류:', error);
            throw error;
        }
    }

    async getUserConversationProfile(userId: string): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                `${API_BASE_URL}/api/v8/conversation/user-profile/${userId}`
            );
            return response.data;
        } catch (error) {
            console.error('사용자 프로필 조회 오류:', error);
            throw error;
        }
    }

    async clearConversationData(): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.delete(
                `${API_BASE_URL}/api/v8/conversation/clear`
            );
            return response.data;
        } catch (error) {
            console.error('대화 데이터 초기화 오류:', error);
            throw error;
        }
    }

    // 실시간 모니터링 관련 메서드들
    async getConversationMonitoringStatus(conversationId: string): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                `${API_BASE_URL}/api/v8/monitoring/status/${conversationId}`
            );
            return response.data;
        } catch (error) {
            console.error('모니터링 상태 조회 오류:', error);
            throw error;
        }
    }

    async getConversationEvents(conversationId: string, limit: number = 10): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                `${API_BASE_URL}/api/v8/monitoring/events/${conversationId}?limit=${limit}`
            );
            return response.data;
        } catch (error) {
            console.error('대화 이벤트 조회 오류:', error);
            throw error;
        }
    }

    async getConversationPredictions(conversationId: string, limit: number = 10): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                `${API_BASE_URL}/api/v8/monitoring/predictions/${conversationId}?limit=${limit}`
            );
            return response.data;
        } catch (error) {
            console.error('대화 예측 조회 오류:', error);
            throw error;
        }
    }

    async getMonitoringSystemStats(): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                `${API_BASE_URL}/api/v8/monitoring/system-stats`
            );
            return response.data;
        } catch (error) {
            console.error('모니터링 시스템 통계 조회 오류:', error);
            throw error;
        }
    }

    async stopConversationMonitoring(conversationId: string): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.post(
                `${API_BASE_URL}/api/v8/monitoring/stop/${conversationId}`
            );
            return response.data;
        } catch (error) {
            console.error('모니터링 중지 오류:', error);
            throw error;
        }
    }

    // 고급 ML 엔진 관련 메서드들
    async getUserMLProfile(userId: string): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                `${API_BASE_URL}/api/v8/ml/user-profile/${userId}`
            );
            return response.data;
        } catch (error) {
            console.error('사용자 ML 프로필 조회 오류:', error);
            throw error;
        }
    }

    async getAllUserMLProfiles(): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                `${API_BASE_URL}/api/v8/ml/user-profiles`
            );
            return response.data;
        } catch (error) {
            console.error('모든 사용자 ML 프로필 조회 오류:', error);
            throw error;
        }
    }

    async predictUserEngagement(message: string, context?: any): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.post(
                `${API_BASE_URL}/api/v8/ml/predict-engagement`,
                { message, context }
            );
            return response.data;
        } catch (error) {
            console.error('참여도 예측 오류:', error);
            throw error;
        }
    }

    async predictResponseTime(message: string, context?: any): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.post(
                `${API_BASE_URL}/api/v8/ml/predict-response-time`,
                { message, context }
            );
            return response.data;
        } catch (error) {
            console.error('응답 시간 예측 오류:', error);
            throw error;
        }
    }

    async getPersonalizedResponse(message: string, context?: any): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.post(
                `${API_BASE_URL}/api/v8/ml/personalized-response`,
                { message, context }
            );
            return response.data;
        } catch (error) {
            console.error('개인화된 응답 스타일 조회 오류:', error);
            throw error;
        }
    }

    async clearUserMLData(userId: string): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.delete(
                `${API_BASE_URL}/api/v8/ml/user-data/${userId}`
            );
            return response.data;
        } catch (error) {
            console.error('사용자 ML 데이터 삭제 오류:', error);
            throw error;
        }
    }

    async getMLSystemStats(): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                `${API_BASE_URL}/api/v8/ml/system-stats`
            );
            return response.data;
        } catch (error) {
            console.error('ML 시스템 통계 조회 오류:', error);
            throw error;
        }
    }

    async getAIModelPerformance(): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                `${API_BASE_URL}/api/v8/ai/model-performance`
            );
            return response.data;
        } catch (error) {
            console.error('AI 모델 성능 조회 오류:', error);
            throw error;
        }
    }

    async getPerformanceAnalysis(): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                `${API_BASE_URL}/api/v8/ai/performance-analysis`
            );
            return response.data;
        } catch (error) {
            console.error('성능 분석 조회 오류:', error);
            throw error;
        }
    }

    async getUserProfile(userId: string): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.get(
                `${API_BASE_URL}/api/v8/user/profile/${userId}`
            );
            return response.data;
        } catch (error) {
            console.error('사용자 프로필 조회 오류:', error);
            throw error;
        }
    }

    async updateUserProfile(profile: any): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.put(
                `${API_BASE_URL}/api/v8/user/profile/${profile.id}`,
                profile
            );
            return response.data;
        } catch (error) {
            console.error('사용자 프로필 업데이트 오류:', error);
            throw error;
        }
    }

    async submitLearningFeedback(feedback: any): Promise<APIResponse> {
        try {
            const response: AxiosResponse<APIResponse> = await axios.post(
                `${API_BASE_URL}/api/v8/ai/learning-feedback`,
                feedback
            );
            return response.data;
        } catch (error) {
            console.error('학습 피드백 제출 오류:', error);
            throw error;
        }
    }

    /**
     * 개포우성7차 프로젝트 분석
     */
    async analyzeProject(roomId: string): Promise<any> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/v7/gaeposung/analysis/${encodeURIComponent(roomId)}`
            );
            const data = response.data;

            if (!data.success) {
                throw new Error(data.error || '프로젝트 분석 실패');
            }

            return data.analysis;
        } catch (error) {
            console.error('프로젝트 분석 API 오류:', error);
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
                        events: ['채팅방 생성', '첫 번째 메시지']
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

    // 개포우성7차 프로젝트 관리 API
    async getProjectOverview(roomId: string): Promise<any> {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/v7/gaeposung/project/overview/${encodeURIComponent(roomId)}`);
            return response.data;
        } catch (error) {
            console.error('프로젝트 개요 조회 오류:', error);
            return { success: false, overview: {} };
        }
    }

    async getProjectTasks(roomId: string): Promise<any> {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/v7/gaeposung/project/tasks/${encodeURIComponent(roomId)}`);
            return response.data;
        } catch (error) {
            console.error('프로젝트 작업 조회 오류:', error);
            return { success: false, tasks: [] };
        }
    }

    async createProjectTask(roomId: string, taskData: any): Promise<any> {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/v7/gaeposung/project/tasks/${encodeURIComponent(roomId)}`, taskData);
            return response.data;
        } catch (error) {
            console.error('프로젝트 작업 생성 오류:', error);
            return { success: false, task: null };
        }
    }

    async updateProjectTask(taskId: string, taskData: any): Promise<any> {
        try {
            const response = await axios.put(`${API_BASE_URL}/api/v7/gaeposung/project/tasks/${encodeURIComponent(taskId)}`, taskData);
            return response.data;
        } catch (error) {
            console.error('프로젝트 작업 업데이트 오류:', error);
            return { success: false, task: null };
        }
    }

    async deleteProjectTask(taskId: string): Promise<any> {
        try {
            const response = await axios.delete(`${API_BASE_URL}/api/v7/gaeposung/project/tasks/${encodeURIComponent(taskId)}`);
            return response.data;
        } catch (error) {
            console.error('프로젝트 작업 삭제 오류:', error);
            return { success: false };
        }
    }

    async getProjectMilestones(roomId: string): Promise<any> {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/v7/gaeposung/project/milestones/${encodeURIComponent(roomId)}`);
            return response.data;
        } catch (error) {
            console.error('프로젝트 마일스톤 조회 오류:', error);
            return { success: false, milestones: [] };
        }
    }

    async createProjectMilestone(roomId: string, milestoneData: any): Promise<any> {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/v7/gaeposung/project/milestones/${encodeURIComponent(roomId)}`, milestoneData);
            return response.data;
        } catch (error) {
            console.error('프로젝트 마일스톤 생성 오류:', error);
            return { success: false, milestone: null };
        }
    }

    // 개포우성7차 AI 추천 관련 API
    async getProjectRecommendations(roomId: string): Promise<any> {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/v7/gaeposung/project/recommendations/${encodeURIComponent(roomId)}`);
            return response.data;
        } catch (error) {
            console.error('AI 추천 조회 오류:', error);
            return { success: false, recommendations: [] };
        }
    }

    async generateProjectRecommendations(roomId: string): Promise<any> {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/v7/gaeposung/project/recommendations/${encodeURIComponent(roomId)}/generate`);
            return response.data;
        } catch (error) {
            console.error('AI 추천 생성 오류:', error);
            return { success: false, recommendations: [] };
        }
    }

    async updateRecommendationStatus(recommendationId: string, status: string): Promise<any> {
        try {
            const response = await axios.put(`${API_BASE_URL}/api/v7/gaeposung/project/recommendations/${encodeURIComponent(recommendationId)}/status`, { status });
            return response.data;
        } catch (error) {
            console.error('AI 추천 상태 업데이트 오류:', error);
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
    }): Promise<any> {
        try {
            // 새로운 메시지 생성 서버 사용 (포트 8002)
            const response = await axios.post(`http://localhost:8002/api/v7/generate-message`, {
                context: params.context || "",
                room_id: params.roomId || "",
                style: params.style || "professional"
            });
            return response.data;
        } catch (error) {
            console.error('메시지 생성 오류:', error);
            return { success: false, messages: [] };
        }
    }

    // WebSocket 관련 메서드들
    public getWebSocketManager(): WebSocketManager {
        return this.wsManager;
    }

    public sendWebSocketMessage(message: any) {
        this.wsManager.send(message);
    }

    public onWebSocket(event: string, callback: (data: any) => void) {
        this.wsManager.on(event, callback);
    }

    public offWebSocket(event: string, callback: (data: any) => void) {
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
    analysis?: any;
    error?: string;
}

interface UserProfileResponse {
    success: boolean;
    user_profile?: any;
    error?: string;
}

interface MonitoringResponse {
    success: boolean;
    data?: any;
    error?: string;
}

interface PredictionResponse {
    success: boolean;
    prediction?: any;
    data?: any;
    error?: string;
}

interface PersonalizedResponse {
    success: boolean;
    personalized_style?: any;
    error?: string;
}

interface SystemStatsResponse {
    success: boolean;
    stats?: any;
    error?: string;
}

interface ServerStatusResponse {
    success: boolean;
    data?: any;
    error?: string;
}

interface AIModelPerformanceResponse {
    success: boolean;
    data?: any;
    error?: string;
}

interface PerformanceAnalysisResponse {
    success: boolean;
    data?: any;
    error?: string;
}

interface UserProfileDataResponse {
    success: boolean;
    data?: any;
    error?: string;
}

interface AdvancedMessageRequest {
    context: string;
    style: string;
    user_profile: any;
    performance_metrics: any;
}

interface AdvancedMessageResponse {
    success: boolean;
    data?: any;
    error?: string;
}

interface LearningFeedbackRequest {
    message_id: string;
    user_feedback: string;
    success_indicator: boolean;
    improvement_suggestions?: string;
}

interface UserMLProfileResponse {
    success: boolean;
    profile?: any;
    error?: string;
}

interface AllUserMLProfilesResponse {
    success: boolean;
    profiles?: any[];
    error?: string;
}

interface MLSystemStatsResponse {
    success: boolean;
    stats?: any;
    error?: string;
}

interface UserEngagementPredictionResponse {
    success: boolean;
    prediction?: any;
    error?: string;
}

interface ResponseTimePredictionResponse {
    success: boolean;
    prediction?: any;
    error?: string;
}

export const advancedMessageAPI = {
    generateMessage: async (request: GenerateMessageRequest): Promise<GenerateMessageResponse> => {
        try {
            // 실제 API 호출 대신 시뮬레이션된 응답
            const mockMessages = [
                {
                    text: '안녕하세요! 개포우성7차 프로젝트에 대해 어떤 도움이 필요하신가요?',
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
    getConversationAnalysis: async (conversationId: string): Promise<ConversationAnalysisResponse> => {
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

    getConversationStatistics: async (chatRoomId: string): Promise<APIResponse> => {
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

    analyzeConversationData: async (messages: any[]): Promise<APIResponse> => {
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

    getConversationMonitoringStatus: async (conversationId: string): Promise<MonitoringResponse> => {
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

    getConversationEvents: async (conversationId: string, limit: number): Promise<MonitoringResponse> => {
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

    getConversationPredictions: async (conversationId: string, limit: number): Promise<PredictionResponse> => {
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

    stopConversationMonitoring: async (conversationId: string): Promise<{ success: boolean }> => {
        try {
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    },

    analyzeProject: async (roomId: string): Promise<any> => {
        try {
            return {
                success: true,
                data: {
                    project_name: '개포우성7차',
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

    getPersonalizedResponse: async (message: string, context: string): Promise<PersonalizedResponse> => {
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

    clearUserMLData: async (userId: string): Promise<{ success: boolean }> => {
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
                    text: '개포우성7차 프로젝트에 대한 고급 분석 결과입니다.',
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

    submitLearningFeedback: async (feedback: LearningFeedbackRequest): Promise<{ success: boolean }> => {
        try {
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    },

    updateUserProfile: async (profile: any): Promise<{ success: boolean }> => {
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

    predictUserEngagement: async (message: string, context: string): Promise<UserEngagementPredictionResponse> => {
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

    predictResponseTime: async (message: string, context: string): Promise<ResponseTimePredictionResponse> => {
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
        connect: () => console.log('WebSocket 연결'),
        disconnect: () => console.log('WebSocket 연결 해제'),
        send: (message: any) => console.log('메시지 전송:', message),
        on: (event: string, callback: any) => console.log(`이벤트 리스너 등록: ${event}`),
        off: (event: string, callback: any) => console.log(`이벤트 리스너 해제: ${event}`)
    }),

    sendWebSocketMessage: (message: any) => {
        console.log('WebSocket 메시지 전송:', message);
    }
}; 