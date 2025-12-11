import { sendChatMessage, ChatRequest } from './unifiedAPI';

export interface BackendAPIResponse {
    success: boolean;
    content: string;
    confidence: number;
    processingTime: number;
    metadata: {
        model: string;
        tokens: number;
        qualityScore: number;
        improvements: string[];
        limitations: string[];
    };
}

export interface BackendAPIRequest {
    userInput: string;
    context?: Record<string, unknown>;
    options?: {
        quality: 'standard' | 'enhanced' | 'ultimate';
        style: 'conversational' | 'formal' | 'technical' | 'creative';
        detailLevel: 'simple' | 'balanced' | 'detailed';
        tone: 'friendly' | 'professional' | 'neutral';
    };
}

export class EnhancedBackendAPI {
    private baseURLs = {
        ultimate: 'http://localhost:8004',
        enhanced: 'http://localhost:8003',
        standard: 'http://localhost:8005'
    };

    /**
     * 백엔드 API를 통한 고품질 응답 생성
     */
    async generateHighQualityResponse(request: BackendAPIRequest): Promise<BackendAPIResponse> {
        const startTime = Date.now();

        try {
            let response: BackendAPIResponse;

            switch (request.options?.quality) {
                case 'ultimate':
                    response = await this.callUltimateAPI(request);
                    break;
                case 'enhanced':
                    response = await this.callEnhancedAPI(request);
                    break;
                default:
                    response = await this.callStandardAPI(request);
            }

            response.processingTime = Date.now() - startTime;
            return response;

        } catch (error) {
            console.error('백엔드 API 호출 실패:', error);
            return this.createFallbackResponse(request.userInput, Date.now() - startTime);
        }
    }

    /**
     * 궁극의 통합 응답 시스템 API 호출
     */
    private async callUltimateAPI(request: BackendAPIRequest): Promise<BackendAPIResponse> {
        const apiRequest = {
            user_input: request.userInput,
            conversation_history: [],
            project_context: request.context || {},
            user_preferences: {
                response_style: request.options?.style || 'conversational',
                detail_level: request.options?.detailLevel || 'balanced',
                tone: request.options?.tone || 'friendly'
            }
        };

        const response = await fetch(`${this.baseURLs.ultimate}/api/ultimate/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiRequest),
        });

        if (!response.ok) {
            throw new Error(`Ultimate API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.result) {
            return {
                success: true,
                content: data.result.content || data.result.response || '궁극 응답을 생성할 수 없습니다.',
                confidence: data.result.confidence || 0.9,
                processingTime: 0,
                metadata: {
                    model: 'ultimate-integrated-system',
                    tokens: data.result.tokens || 0,
                    qualityScore: data.result.quality_score || 0.95,
                    improvements: data.result.improvements || ['궁극 품질 시스템 사용'],
                    limitations: data.result.limitations || ['처리 시간 증가']
                }
            };
        } else {
            throw new Error(data.error || '궁극 API 응답 오류');
        }
    }

    /**
     * 고급 통합 API 호출
     */
    private async callEnhancedAPI(request: BackendAPIRequest): Promise<BackendAPIResponse> {
        const apiRequest = {
            message: request.userInput,
            context: request.context || {},
            options: {
                intent: 'enhanced_conversation',
                style: request.options?.style || 'conversational',
                tone: request.options?.tone || 'friendly',
                requireCitations: true
            }
        };

        const response = await fetch(`${this.baseURLs.enhanced}/api/v7/advanced-ai`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiRequest),
        });

        if (!response.ok) {
            throw new Error(`Enhanced API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.message) {
            return {
                success: true,
                content: data.message.content,
                confidence: data.metadata?.confidence || 0.85,
                processingTime: 0,
                metadata: {
                    model: data.metadata?.model || 'enhanced-ai',
                    tokens: data.metadata?.tokens || 0,
                    qualityScore: 0.85,
                    improvements: ['고급 분석 시스템 사용'],
                    limitations: ['제한된 컨텍스트 처리']
                }
            };
        } else {
            throw new Error('고급 API 응답 오류');
        }
    }

    /**
     * 기본 통합 API 호출
     */
    private async callStandardAPI(request: BackendAPIRequest): Promise<BackendAPIResponse> {
        const chatRequest: ChatRequest = {
            message: request.userInput,
            context: request.context || {},
            options: {
                intent: 'conversation',
                style: request.options?.style || 'conversational',
                tone: request.options?.tone || 'friendly',
                requireCitations: false
            }
        };

        const response = await sendChatMessage(chatRequest);

        if (response.success && response.message) {
            return {
                success: true,
                content: response.message.content,
                confidence: 0.7,
                processingTime: 0,
                metadata: {
                    model: 'standard-ai',
                    tokens: 0,
                    qualityScore: 0.7,
                    improvements: ['기본 응답 시스템'],
                    limitations: ['제한된 품질']
                }
            };
        } else {
            throw new Error('기본 API 응답 오류');
        }
    }

    /**
     * 다중 백엔드 API 병렬 호출
     */
    async generateMultiBackendResponse(request: BackendAPIRequest): Promise<BackendAPIResponse[]> {
        const promises = [
            this.callUltimateAPI(request).catch(error => {
                console.error('Ultimate API 실패:', error);
                return null;
            }),
            this.callEnhancedAPI(request).catch(error => {
                console.error('Enhanced API 실패:', error);
                return null;
            }),
            this.callStandardAPI(request).catch(error => {
                console.error('Standard API 실패:', error);
                return null;
            })
        ];

        const responses = await Promise.all(promises);
        return responses.filter(response => response !== null) as BackendAPIResponse[];
    }

    /**
     * 백엔드 시스템 상태 확인
     */
    async checkBackendStatus(): Promise<{
        ultimate: boolean;
        enhanced: boolean;
        standard: boolean;
    }> {
        const status = {
            ultimate: false,
            enhanced: false,
            standard: false
        };

        try {
            const ultimateResponse = await fetch(`${this.baseURLs.ultimate}/api/ultimate/health`);
            status.ultimate = ultimateResponse.ok;
        } catch (error) {
            console.error('Ultimate API 상태 확인 실패:', error);
        }

        try {
            const enhancedResponse = await fetch(`${this.baseURLs.enhanced}/health`);
            status.enhanced = enhancedResponse.ok;
        } catch (error) {
            console.error('Enhanced API 상태 확인 실패:', error);
        }

        try {
            const standardResponse = await fetch(`${this.baseURLs.standard}/health`);
            status.standard = standardResponse.ok;
        } catch (error) {
            console.error('Standard API 상태 확인 실패:', error);
        }

        return status;
    }

    /**
     * 채팅 메시지 전송 (기존 API와 호환성)
     */
    async sendChatMessage(request: {
        message: string;
        quality: 'standard' | 'enhanced' | 'ultimate';
        context: {
            conversationHistory: any[];
            projectContext: any;
            userPreferences: {
                responseStyle: string;
                detailLevel: string;
                language: string;
                tone: string;
            };
        };
    }): Promise<{
        content: string;
        quality_score?: number;
        confidence?: number;
        metadata?: any;
    }> {
        const backendRequest: BackendAPIRequest = {
            userInput: request.message,
            context: request.context.projectContext,
            options: {
                quality: request.quality,
                style: request.context.userPreferences.responseStyle as any,
                detailLevel: request.context.userPreferences.detailLevel as any,
                tone: request.context.userPreferences.tone as any
            }
        };

        const response = await this.generateHighQualityResponse(backendRequest);

        return {
            content: response.content,
            quality_score: response.metadata.qualityScore,
            confidence: response.confidence,
            metadata: response.metadata
        };
    }

    /**
     * 폴백 응답 생성
     */
    private createFallbackResponse(userInput: string, processingTime: number): BackendAPIResponse {
        return {
            success: false,
            content: `죄송합니다. "${userInput}"에 대한 백엔드 처리 중 오류가 발생했습니다. 다시 시도해주세요.`,
            confidence: 0.3,
            processingTime,
            metadata: {
                model: 'fallback',
                tokens: 0,
                qualityScore: 0.3,
                improvements: ['백엔드 연결 복구 필요'],
                limitations: ['백엔드 시스템 오류']
            }
        };
    }
}

// 싱글톤 인스턴스 생성
export const enhancedBackendAPI = new EnhancedBackendAPI();
export default enhancedBackendAPI;
