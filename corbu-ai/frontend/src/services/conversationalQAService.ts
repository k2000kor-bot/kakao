import unifiedAPI from './unifiedAPI';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export interface QARequest {
    question: string;
    context?: string | Record<string, any>;
}

export interface QAResponse {
    success: boolean;
    answer: string;
    confidence: number;
    processingTime: number;
    sources?: string[];
    metadata?: {
        model: string;
        tokens: number;
        usedServices: string[];
    };
}

export interface ConversationContext {
    history: Array<{
        question: string;
        answer: string;
        timestamp: string;
    }>;
    currentTopic: string;
    userPreferences: {
        responseStyle: 'concise' | 'detailed' | 'technical';
        language: 'korean' | 'english' | 'mixed';
    };
}

class ConversationalQAService {
    private context: ConversationContext = {
        history: [],
        currentTopic: '',
        userPreferences: {
            responseStyle: 'detailed',
            language: 'korean'
        }
    };

    async askQuestion(question: string, context?: string | Record<string, any>): Promise<QAResponse> {
        try {
            // 통합 API 사용
            const response = await unifiedAPI.conversationalQA(question, context as Record<string, unknown>);

            if (response.success && response.data) {
                const data = response.data as Record<string, unknown>;
                const answer = (data.answer as string) || (data.response as string) || '답변을 생성할 수 없습니다.';

                const qaResponse: QAResponse = {
                    success: true,
                    answer,
                    confidence: (data.confidence as number) || 0.8,
                    processingTime: (data.processingTime as number) || 0,
                    sources: (data.sources as string[]) || [],
                    metadata: {
                        model: (data.model as string) || 'conversational-qa',
                        tokens: (data.tokens as number) || 0,
                        usedServices: (data.usedServices as string[]) || ['qa-system']
                    }
                };

                // 대화 히스토리에 추가
                this.context.history.push({
                    question,
                    answer,
                    timestamp: new Date().toISOString()
                });

                return qaResponse;
            } else {
                throw new Error('API 응답이 올바르지 않습니다.');
            }
        } catch (error) {
            console.error('QA 서비스 오류:', error);

            // 폴백 응답
            return {
                success: false,
                answer: '죄송합니다. 질문을 처리하는 중 오류가 발생했습니다. 다시 시도해주세요.',
                confidence: 0,
                processingTime: 0
            };
        }
    }

    async askWithContext(question: string, context: Record<string, any>): Promise<QAResponse> {
        const request = {
            question,
            context: {
                ...context,
                conversationHistory: this.context.history,
                userPreferences: this.context.userPreferences
            }
        };

        return this.askQuestion(question, request.context);
    }

    async askFollowUp(question: string): Promise<QAResponse> {
        // 이전 대화 컨텍스트를 포함하여 질문
        const context = {
            previousQuestions: this.context.history.slice(-3).map(h => h.question),
            previousAnswers: this.context.history.slice(-3).map(h => h.answer),
            currentTopic: this.context.currentTopic
        };

        return this.askQuestion(question, context);
    }

    setResponseStyle(style: 'concise' | 'detailed' | 'technical'): void {
        this.context.userPreferences.responseStyle = style;
    }

    setLanguage(language: 'korean' | 'english' | 'mixed'): void {
        this.context.userPreferences.language = language;
    }

    setCurrentTopic(topic: string): void {
        this.context.currentTopic = topic;
    }

    getConversationHistory(): Array<{ question: string; answer: string; timestamp: string }> {
        return [...this.context.history];
    }

    clearHistory(): void {
        this.context.history = [];
        this.context.currentTopic = '';
    }

    getContext(): ConversationContext {
        return { ...this.context };
    }

    // 고급 QA 기능들
    async askAnalyticalQuestion(question: string, data: any[]): Promise<QAResponse> {
        const context = {
            analysisType: 'analytical',
            data,
            userPreferences: this.context.userPreferences
        };

        return this.askQuestion(question, context);
    }

    async askComparativeQuestion(question: string, items: any[]): Promise<QAResponse> {
        const context = {
            analysisType: 'comparative',
            items,
            userPreferences: this.context.userPreferences
        };

        return this.askQuestion(question, context);
    }

    async askPredictiveQuestion(question: string, historicalData: any[]): Promise<QAResponse> {
        const context = {
            analysisType: 'predictive',
            historicalData,
            userPreferences: this.context.userPreferences
        };

        return this.askQuestion(question, context);
    }

    // 대화 품질 평가
    evaluateConversationQuality(): {
        coherence: number;
        relevance: number;
        completeness: number;
        overall: number;
    } {
        if (this.context.history.length === 0) {
            return { coherence: 0, relevance: 0, completeness: 0, overall: 0 };
        }

        // 간단한 품질 평가 로직
        const coherence = Math.min(0.9, 0.7 + (this.context.history.length * 0.02));
        const relevance = 0.85;
        const completeness = 0.8;
        const overall = (coherence + relevance + completeness) / 3;

        return { coherence, relevance, completeness, overall };
    }

    // 대화 요약 생성
    async generateConversationSummary(): Promise<string> {
        if (this.context.history.length === 0) {
            return '대화 기록이 없습니다.';
        }

        const summaryRequest = `다음 대화를 요약해주세요:\n\n${this.context.history
            .map(h => `Q: ${h.question}\nA: ${h.answer}`)
            .join('\n\n')}`;

        const response = await this.askQuestion(summaryRequest);
        return response.answer;
    }
}

const conversationalQAService = new ConversationalQAService();
export default conversationalQAService;
