import { Message, ChatContext } from '../types/chat';

export interface AdvancedAIRequest {
    type: 'conversation' | 'analysis' | 'summary' | 'creative' | 'technical' | 'business';
    text: string;
    style?: 'friendly' | 'professional' | 'creative' | 'formal';
    length?: 'short' | 'medium' | 'long';
    context?: ChatContext;
}

export interface AdvancedAIResponse {
    success: boolean;
    message: Message;
    metadata?: {
        processingTime: number;
        confidence: number;
        model: string;
        tokens: number;
    };
}

class AdvancedAIService {
    private baseUrl = 'http://localhost:8002/api/v7';

    async generateAdvancedResponse(request: AdvancedAIRequest): Promise<AdvancedAIResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/advanced-ai`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request)
            });

            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                throw new Error('AI 응답 생성 실패');
            }
        } catch (error) {
            console.error('고급 AI 서비스 오류:', error);
            return this.createFallbackResponse(request);
        }
    }

    private createFallbackResponse(request: AdvancedAIRequest): AdvancedAIResponse {
        const responseContent = this.generateFallbackContent(request);

        return {
            success: false,
            message: {
                id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                content: responseContent,
                sender: 'CORBU.AI',
                timestamp: new Date().toISOString(),
                isMe: false,
                type: 'ai_response',
                aiResponse: {
                    type: request.type,
                    metadata: {
                        confidence: 0.7,
                        processingTime: 1000,
                        model: 'fallback',
                        tokens: 150
                    }
                }
            }
        };
    }

    private generateFallbackContent(request: AdvancedAIRequest): string {
        const { type, text, style = 'friendly' } = request;

        const responses = {
            conversation: {
                friendly: `안녕하세요! "${text}"에 대해 이야기해보겠습니다. CORBU.AI가 도와드릴게요!`,
                professional: `분석 결과: "${text}"에 대한 전문적인 답변을 제공합니다.`,
                creative: `창의적 관점에서 "${text}"를 바라보면 흥미로운 아이디어가 나올 것 같아요!`,
                formal: `공식적으로 "${text}"에 대한 답변을 드리겠습니다.`
            },
            analysis: {
                friendly: `"${text}"를 분석해보니 흥미로운 결과가 나왔어요!`,
                professional: `분석 결과: "${text}"에 대한 심층 분석을 완료했습니다.`,
                creative: `창의적 분석: "${text}"에서 새로운 관점을 발견했습니다!`,
                formal: `공식 분석 결과: "${text}"에 대한 상세한 분석을 제공합니다.`
            },
            summary: {
                friendly: `"${text}"의 핵심을 간단히 요약해드릴게요!`,
                professional: `요약 결과: "${text}"의 주요 내용을 정리했습니다.`,
                creative: `창의적 요약: "${text}"를 새로운 방식으로 정리해봤어요!`,
                formal: `공식 요약: "${text}"의 핵심 내용을 체계적으로 정리했습니다.`
            },
            creative: {
                friendly: `"${text}"에 대한 창의적인 아이디어를 떠올려봤어요!`,
                professional: `창작 분석: "${text}"에 대한 전문적인 창작 가이드를 제공합니다.`,
                creative: `창의적 영감: "${text}"에서 놀라운 아이디어가 떠올랐어요!`,
                formal: `공식 창작: "${text}"에 대한 체계적인 창작 방법을 제시합니다.`
            },
            technical: {
                friendly: `"${text}"에 대한 기술적 해결책을 찾아봤어요!`,
                professional: `기술 분석: "${text}"에 대한 전문적인 기술 솔루션을 제공합니다.`,
                creative: `창의적 기술: "${text}"에 대한 혁신적인 기술적 접근을 제안합니다!`,
                formal: '공식 기술: "${text}"에 대한 체계적인 기술적 해결책을 제시합니다.'
            },
            business: {
                friendly: `"${text}"에 대한 비즈니스 인사이트를 공유해드릴게요!`,
                professional: `비즈니스 분석: "${text}"에 대한 전문적인 시장 분석을 제공합니다.`,
                creative: `창의적 비즈니스: "${text}"에 대한 혁신적인 비즈니스 아이디어를 제안합니다!`,
                formal: `공식 비즈니스: "${text}"에 대한 체계적인 비즈니스 전략을 제시합니다.`
            }
        };

        return responses[type][style] || responses[type].friendly;
    }

    // 특정 AI 모드별 응답 생성
    async generateConversationResponse(text: string, context?: ChatContext): Promise<Message> {
        const response = await this.generateAdvancedResponse({
            type: 'conversation',
            text,
            style: 'friendly',
            context
        });
        return response.message;
    }

    async generateAnalysisResponse(text: string, context?: ChatContext): Promise<Message> {
        const response = await this.generateAdvancedResponse({
            type: 'analysis',
            text,
            style: 'professional',
            context
        });
        return response.message;
    }

    async generateSummaryResponse(text: string, context?: ChatContext): Promise<Message> {
        const response = await this.generateAdvancedResponse({
            type: 'summary',
            text,
            style: 'professional',
            context
        });
        return response.message;
    }

    async generateCreativeResponse(text: string, context?: ChatContext): Promise<Message> {
        const response = await this.generateAdvancedResponse({
            type: 'creative',
            text,
            style: 'creative',
            context
        });
        return response.message;
    }

    async generateTechnicalResponse(text: string, context?: ChatContext): Promise<Message> {
        const response = await this.generateAdvancedResponse({
            type: 'technical',
            text,
            style: 'professional',
            context
        });
        return response.message;
    }

    async generateBusinessResponse(text: string, context?: ChatContext): Promise<Message> {
        const response = await this.generateAdvancedResponse({
            type: 'business',
            text,
            style: 'professional',
            context
        });
        return response.message;
    }
}

export const advancedAIService = new AdvancedAIService(); 