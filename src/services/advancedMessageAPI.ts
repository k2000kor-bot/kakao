import { API_ENDPOINTS, apiCall } from './api';

// 고도화된 메시지 생성 요청 인터페이스
export interface AdvancedMessageRequest {
    original_message: string;
    sender: string;
    chat_room_id: string;
    target_audience: string[];
    context_type: string;
    context_messages?: Array<{ role: string; content: string }>; // 이전 대화 내용
    urgency_level?: string;
    message_length?: string;
    include_data?: boolean;
    include_examples?: boolean;
    include_call_to_action?: boolean;
    personalization_level?: string;
    ai_model_preference?: string;
    emotion_context?: string;
    learning_enabled?: boolean;
}

// 고도화된 메시지 응답 인터페이스
export interface AdvancedGeneratedMessage {
    id: string;
    original_message: string;
    generated_message: string;
    ai_model_used: string;
    emotion_analysis: {
        primary_emotion: string;
        emotion_scores: Record<string, number>;
        intensity: number;
        confidence: number;
    };
    personalization_score: number;
    confidence_score: number;
    impact_prediction: number;
    learning_insights: string[];
    alternatives: string[];
    created_at: string;
}

// 사용자 프로필 인터페이스
export interface UserProfile {
    user_id: string;
    communication_style: string;
    preferred_tone: string;
    response_speed: string;
    formality_level: string;
    emotion_sensitivity: number;
}

// 학습 피드백 인터페이스
export interface LearningFeedback {
    message_id: string;
    user_feedback: number;
    success_indicator: boolean;
    improvement_suggestions?: string;
}

// 성능 분석 인터페이스
export interface PerformanceAnalysis {
    average_feedback: number;
    total_messages: number;
    success_rate: number;
    improvement_needed: boolean;
}

// AI 모델 성능 인터페이스
export interface AIModelPerformance {
    model_name: string;
    success_rate: number;
    average_impact: number;
    usage_count: number;
    last_updated: string;
}

// OpenGraph 메타데이터 인터페이스
export interface OpenGraphData {
    title: string;
    description: string;
    image: string;
    url: string;
    site_name: string;
    type: string;
    locale: string;
    favicon: string;
}

export interface OpenGraphResponse {
    success: boolean;
    data?: OpenGraphData;
    url?: string;
    extracted_at?: string;
    error?: string;
}

// 고도화된 메시지 생성 API 클래스
export class AdvancedMessageAPI {
    private baseURL: string;

    constructor() {
        this.baseURL = 'http://localhost:8002';
    }

    // 고도화된 메시지 생성
    async generateAdvancedMessage(request: AdvancedMessageRequest): Promise<AdvancedGeneratedMessage> {
        try {
            const response = await fetch(`${this.baseURL}/api/v7/generate-advanced-message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    target_message: request.original_message,
                    tone: '중립',
                    message_format: '동조',
                    intent: request.context_type,
                    strategy: '공감 전략',
                    chat_room_id: request.chat_room_id,
                    context_messages: request.context_messages || [], // 이전 대화 내용 추가
                    urgency_level: request.urgency_level || '보통',
                    message_length: request.message_length || '중간',
                    include_data: request.include_data || false,
                    include_examples: request.include_examples || false,
                    include_call_to_action: request.include_call_to_action || false
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return this.transformResponse(data, request);
        } catch (error) {
            console.error('고도화된 메시지 생성 오류:', error);
            return this.generateMockAdvancedMessage(request);
        }
    }

    // 개선된 메시지 생성 API
    async generateImprovedMessage(request: {
        target_message: string;
        context_messages?: Array<{ role: string; content: string }>;
        settings?: {
            formality?: 'formal' | 'casual' | 'empathetic' | 'professional';
            urgency_level?: string;
            message_length?: string;
            include_data?: boolean;
            include_examples?: boolean;
            include_call_to_action?: boolean;
        };
    }): Promise<{
        success: boolean;
        message?: {
            content: string;
            strategy: string;
            emotion: string;
            style: string;
            context_used: boolean;
        };
        analysis?: {
            context_analysis: any;
            emotion_analysis: any;
            personalized_style: any;
        };
        generation_time?: string;
        error?: string;
    }> {
        try {
            const response = await fetch(`${this.baseURL}/api/v7/generate-improved-message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('개선된 메시지 생성 오류:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
            };
        }
    }

    // GPT 메시지 생성 API
    async generateGptMessage(request: {
        target_message: string;
        context_messages?: Array<{ content: string; sender: string; timestamp?: string }>;
        settings?: {
            tone?: string;
            message_length?: string;
            intent?: string;
        };
    }): Promise<{
        success: boolean;
        message?: string;
        analysis?: any;
        generation_time?: string;
        error?: string;
    }> {
        try {
            const response = await fetch(`${this.baseURL}/api/v7/generate-gpt-message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('GPT 메시지 생성 오류:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
            };
        }
    }

    // GPT API 상태 확인
    async getGptStatus(): Promise<{
        success: boolean;
        status?: string;
        message?: string;
        model?: string;
        test_response?: string;
        error?: string;
    }> {
        try {
            const response = await fetch(`${this.baseURL}/api/v7/gpt-status`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('GPT 상태 확인 오류:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
            };
        }
    }

    // 서버 상태 확인
    async checkServerStatus(): Promise<{ status: string; version: string }> {
        try {
            const response = await fetch(`${this.baseURL}/api/v7/status`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return { status: data.status, version: data.system_version };
        } catch (error) {
            console.error('서버 상태 확인 오류:', error);
            return { status: 'offline', version: 'unknown' };
        }
    }

    // 사용자 프로필 업데이트
    async updateUserProfile(profile: UserProfile): Promise<{ success: boolean; message: string }> {
        try {
            const response = await fetch(`${this.baseURL}/api/update-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profile),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('프로필 업데이트 오류:', error);
            return { success: false, message: '프로필 업데이트 실패' };
        }
    }

    // 학습 피드백 제출
    async submitLearningFeedback(feedback: LearningFeedback): Promise<{ success: boolean; message: string }> {
        try {
            const response = await fetch(`${this.baseURL}/api/submit-feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(feedback),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('피드백 제출 오류:', error);
            return { success: false, message: '피드백 제출 실패' };
        }
    }

    // 성능 분석 조회
    async getPerformanceAnalysis(): Promise<PerformanceAnalysis> {
        try {
            const response = await fetch(`${this.baseURL}/api/performance-analysis`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('성능 분석 조회 오류:', error);
            return this.generateMockPerformanceAnalysis();
        }
    }

    // AI 모델 성능 조회
    async getAIModelPerformance(): Promise<AIModelPerformance[]> {
        try {
            const response = await fetch(`${this.baseURL}/api/model-performance`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('AI 모델 성능 조회 오류:', error);
            return this.generateMockAIModelPerformance();
        }
    }

    // 사용자 프로필 조회
    async getUserProfile(userId: string): Promise<UserProfile> {
        try {
            const response = await fetch(`${this.baseURL}/api/user-profile/${userId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('사용자 프로필 조회 오류:', error);
            return this.generateMockUserProfile(userId);
        }
    }

    // OpenGraph 메타데이터 가져오기
    async getOpenGraphMetadata(url: string): Promise<OpenGraphResponse> {
        try {
            const response = await fetch(`${this.baseURL}/api/v7/opengraph?url=${encodeURIComponent(url)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('OpenGraph 메타데이터 가져오기 오류:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
            };
        }
    }

    // 대화 데이터 분석/통계 API
    async analyzeConversationData(messages: Array<{ content: string; sender: string; timestamp?: string }>): Promise<{
        success: boolean;
        analysis?: any;
        insights?: string[];
        visualization?: any;
        analysis_time?: string;
        error?: string;
    }> {
        try {
            const response = await fetch(`${this.baseURL}/api/v7/analyze-conversation-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messages }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('대화 데이터 분석 오류:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
            };
        }
    }

    async getConversationStatistics(chatRoomId: string): Promise<{
        success: boolean;
        chat_room_id?: string;
        analysis?: any;
        insights?: string[];
        visualization?: any;
        analysis_time?: string;
        error?: string;
    }> {
        try {
            const response = await fetch(`${this.baseURL}/api/v7/conversation-statistics/${chatRoomId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('채팅방 통계 조회 오류:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
            };
        }
    }

    async getEmotionTrends(chatRoomId: string): Promise<{
        success: boolean;
        chat_room_id?: string;
        emotion_trends?: any;
        analysis_time?: string;
        error?: string;
    }> {
        try {
            const response = await fetch(`${this.baseURL}/api/v7/emotion-trends/${chatRoomId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('감정 트렌드 분석 오류:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
            };
        }
    }

    async getKeywordAnalysis(chatRoomId: string): Promise<{
        success: boolean;
        chat_room_id?: string;
        keyword_analysis?: any;
        analysis_time?: string;
        error?: string;
    }> {
        try {
            const response = await fetch(`${this.baseURL}/api/v7/keyword-analysis/${chatRoomId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('키워드 분석 오류:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
            };
        }
    }

    async getEngagementMetrics(chatRoomId: string): Promise<{
        success: boolean;
        chat_room_id?: string;
        engagement_metrics?: any;
        analysis_time?: string;
        error?: string;
    }> {
        try {
            const response = await fetch(`${this.baseURL}/api/v7/engagement-metrics/${chatRoomId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('참여도 지표 분석 오류:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
            };
        }
    }

    // 응답 변환
    private transformResponse(data: any, request: AdvancedMessageRequest): AdvancedGeneratedMessage {
        return {
            id: `msg_${Date.now()}`,
            original_message: request.original_message,
            generated_message: data.message || '응답을 생성할 수 없습니다.',
            ai_model_used: 'simple-server-v1',
            emotion_analysis: {
                primary_emotion: 'neutral',
                emotion_scores: { neutral: 0.8, positive: 0.1, negative: 0.1 },
                intensity: 0.5,
                confidence: 0.7
            },
            personalization_score: 0.6,
            confidence_score: 0.8,
            impact_prediction: 0.7,
            learning_insights: ['사용자 피드백을 통해 개선 중'],
            alternatives: [data.message || '대안 응답'],
            created_at: new Date().toISOString()
        };
    }

    // Mock 데이터 생성
    private generateMockAdvancedMessage(request: AdvancedMessageRequest): AdvancedGeneratedMessage {
        return {
            id: `mock_${Date.now()}`,
            original_message: request.original_message,
            generated_message: `안녕하세요! ${request.sender}님의 메시지를 확인했습니다. '${request.original_message}'에 대한 응답입니다.`,
            ai_model_used: 'mock-model',
            emotion_analysis: {
                primary_emotion: 'neutral',
                emotion_scores: { neutral: 0.8, positive: 0.1, negative: 0.1 },
                intensity: 0.5,
                confidence: 0.7
            },
            personalization_score: 0.6,
            confidence_score: 0.8,
            impact_prediction: 0.7,
            learning_insights: ['Mock 데이터입니다'],
            alternatives: ['대안 응답 1', '대안 응답 2'],
            created_at: new Date().toISOString()
        };
    }

    private generateMockPerformanceAnalysis(): PerformanceAnalysis {
        return {
            average_feedback: 4.2,
            total_messages: 150,
            success_rate: 0.85,
            improvement_needed: false
        };
    }

    private generateMockAIModelPerformance(): AIModelPerformance[] {
        return [
            {
                model_name: 'GPT-4',
                success_rate: 0.92,
                average_impact: 0.85,
                usage_count: 1000,
                last_updated: new Date().toISOString()
            },
            {
                model_name: 'Claude-3',
                success_rate: 0.89,
                average_impact: 0.82,
                usage_count: 800,
                last_updated: new Date().toISOString()
            }
        ];
    }

    private generateMockUserProfile(userId: string): UserProfile {
        return {
            user_id: userId,
            communication_style: 'friendly',
            preferred_tone: 'casual',
            response_speed: 'medium',
            formality_level: 'mixed',
            emotion_sensitivity: 0.7
        };
    }
}

// 전역 인스턴스
export const advancedMessageAPI = new AdvancedMessageAPI(); 