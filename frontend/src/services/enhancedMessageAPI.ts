// 향상된 메시지 시스템 API 서비스
const ENHANCED_MESSAGE_API_BASE = 'http://localhost:8001';

export interface EnhancedMessageFormatRequest {
    format_type: string;
    original_message: string;
    context?: string;
    recent_messages?: Array<{ content: string; sender: string; timestamp: string }>;
    user_id?: string;
}

export interface UserProfileRequest {
    user_id: string;
    preferred_formats: string[];
    communication_style: string;
}

export interface MessageAnalytics {
    emotion_score: number;
    sentiment_score: number;
    complexity_score: number;
    impact_prediction: number;
    keywords: string[];
    tone: string;
    formality_level: string;
}

export interface EnhancedGeneratedMessage {
    id: string;
    original_message: string;
    format_type: string;
    generated_message: string;
    analytics: MessageAnalytics;
    user_profile: {
        preferred_formats: string[];
        communication_style: string;
    };
    context_analysis: {
        total_messages: number;
        context_length: number;
        overall_sentiment: string;
        positive_count: number;
        negative_count: number;
    };
    timestamp: string;
}

export interface UserProfile {
    user_id: string;
    preferred_formats: string[];
    communication_style: string;
    created_at: string;
    updated_at: string;
}

export interface MessageHistoryItem {
    message_id: string;
    format_type: string;
    original_message: string;
    generated_message: string;
    timestamp: string;
    success: boolean;
}

export interface MessageAnalyticsResult {
    emotion_score: number;
    sentiment_score: number;
    complexity_score: number;
    impact_prediction: number;
    timestamp: string;
}

// API 호출 헬퍼 함수
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
        const response = await fetch(`${ENHANCED_MESSAGE_API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API 호출 오류:', error);
        throw error;
    }
};

// 향상된 메시지 시스템 API 클래스
export class EnhancedMessageAPI {
    // 시스템 상태 확인
    static async getStatus() {
        return apiCall('/api/status');
    }

    // 헬스 체크
    static async healthCheck() {
        return apiCall('/api/health');
    }

    // 메시지 형식 목록 조회
    static async getMessageFormats(): Promise<{ success: boolean; formats: Record<string, string> }> {
        return apiCall('/api/message-formats');
    }

    // 향상된 메시지 생성
    static async generateEnhancedMessage(request: EnhancedMessageFormatRequest): Promise<{ success: boolean; message: EnhancedGeneratedMessage }> {
        return apiCall('/api/generate-enhanced-message', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    // 사용자 프로필 업데이트
    static async updateUserProfile(request: UserProfileRequest): Promise<{ success: boolean; message: string }> {
        return apiCall('/api/update-user-profile', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    // 사용자 프로필 조회
    static async getUserProfile(userId: string): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
        return apiCall(`/api/user-profile/${userId}`);
    }

    // 메시지 히스토리 조회
    static async getMessageHistory(userId: string, limit: number = 10): Promise<{ success: boolean; history?: MessageHistoryItem[]; error?: string }> {
        return apiCall(`/api/message-history/${userId}?limit=${limit}`);
    }

    // 메시지 분석 결과 조회
    static async getMessageAnalytics(messageId: string): Promise<{ success: boolean; analytics?: MessageAnalyticsResult; error?: string }> {
        return apiCall(`/api/analytics/${messageId}`);
    }

    // 서버 연결 테스트
    static async testConnection(): Promise<boolean> {
        try {
            await this.healthCheck();
            return true;
        } catch (error) {
            console.error('서버 연결 실패:', error);
            return false;
        }
    }
}

// 편의 함수들
export const enhancedMessageAPI = {
    // 메시지 형식 가져오기
    getFormats: async () => {
        try {
            const response = await EnhancedMessageAPI.getMessageFormats();
            return response.formats;
        } catch (error) {
            console.error('메시지 형식 조회 실패:', error);
            return {};
        }
    },

    // 향상된 메시지 생성
    generateEnhanced: async (formatType: string, originalMessage: string, context: string = '', recentMessages: any[] = [], userId: string = 'default') => {
        try {
            const request: EnhancedMessageFormatRequest = {
                format_type: formatType,
                original_message: originalMessage,
                context,
                recent_messages: recentMessages,
                user_id: userId,
            };

            const response = await EnhancedMessageAPI.generateEnhancedMessage(request);
            return response.message;
        } catch (error) {
            console.error('향상된 메시지 생성 실패:', error);
            throw error;
        }
    },

    // 사용자 프로필 업데이트
    updateProfile: async (request: UserProfileRequest) => {
        try {
            const response = await EnhancedMessageAPI.updateUserProfile(request);
            return response.message;
        } catch (error) {
            console.error('프로필 업데이트 실패:', error);
            throw error;
        }
    },

    // 사용자 프로필 조회
    getProfile: async (userId: string) => {
        try {
            const response = await EnhancedMessageAPI.getUserProfile(userId);
            return response.profile;
        } catch (error) {
            console.error('프로필 조회 실패:', error);
            throw error;
        }
    },

    // 메시지 히스토리 조회
    getHistory: async (userId: string, limit: number = 10) => {
        try {
            const response = await EnhancedMessageAPI.getMessageHistory(userId, limit);
            return response.history;
        } catch (error) {
            console.error('히스토리 조회 실패:', error);
            throw error;
        }
    },

    // 메시지 분석 결과 조회
    getAnalytics: async (messageId: string) => {
        try {
            const response = await EnhancedMessageAPI.getMessageAnalytics(messageId);
            return response.analytics;
        } catch (error) {
            console.error('분석 결과 조회 실패:', error);
            throw error;
        }
    },

    // 서버 상태 확인
    checkStatus: async () => {
        try {
            const response = await EnhancedMessageAPI.getStatus();
            return response.status === 'healthy';
        } catch (error) {
            console.error('서버 상태 확인 실패:', error);
            return false;
        }
    },

    // 테스트 엔드포인트
    testEndpoint: async () => {
        try {
            const response = await apiCall('/api/test');
            return response;
        } catch (error) {
            console.error('테스트 엔드포인트 실패:', error);
            throw error;
        }
    },
};

export default EnhancedMessageAPI; 