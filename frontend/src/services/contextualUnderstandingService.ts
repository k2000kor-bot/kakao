/**
 * 문맥 이해 및 전체 텍스트 분석 서비스
 * 입력된 텍스트의 전체 문맥을 파악하고 의미를 이해한 후 적절한 답변을 생성
 */

export interface ContextualMessage {
    id: string;
    content: string;
    timestamp: Date;
    type: 'user' | 'assistant' | 'system';
    context?: any;
    formatting?: {
        fontSize?: number;
        lineBreaks?: boolean;
        preserveFormatting?: boolean;
        originalText?: string;
    };
}

export interface ContextualAnalysis {
    fullContext: string;
    mainTopics: string[];
    keyEntities: string[];
    sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
    intent: string;
    requirements: string[];
    followUpQuestions: string[];
    summary: string;
    preservedFormatting?: {
        originalText: string;
        lineBreaks: boolean;
        fontSize?: number;
        textStructure: string[];
    };
}

export interface ContextualResponse {
    understanding: ContextualAnalysis;
    response: string;
    suggestions: string[];
    relatedTopics: string[];
}

class ContextualUnderstandingService {
    private conversationHistory: ContextualMessage[] = [];
    private maxHistoryLength = 50;

    /**
     * 새로운 메시지 추가 및 문맥 업데이트
     */
    addMessage(message: ContextualMessage): void {
        this.conversationHistory.push(message);

        // 히스토리 길이 제한
        if (this.conversationHistory.length > this.maxHistoryLength) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
        }
    }

    /**
 * 전체 문맥 분석
 */
    async analyzeFullContext(newMessage: string): Promise<ContextualAnalysis> {
        // 전체 대화 히스토리와 새 메시지를 결합
        const fullContext = this.buildFullContext(newMessage);

        // 문맥 분석 수행
        const analysis = await this.performContextualAnalysis(fullContext);

        // 텍스트 포맷팅 보존
        const preservedFormatting = this.preserveTextFormatting(newMessage);
        analysis.preservedFormatting = preservedFormatting;

        return analysis;
    }

    /**
     * 전체 문맥 구성
     */
    private buildFullContext(newMessage: string): string {
        const historyText = this.conversationHistory
            .map(msg => `${msg.type === 'user' ? '사용자' : 'AI'}: ${msg.content}`)
            .join('\n\n');

        return `${historyText}\n\n사용자: ${newMessage}`;
    }

    /**
     * 문맥 분석 수행
     */
    private async performContextualAnalysis(fullContext: string): Promise<ContextualAnalysis> {
        try {
            // 백엔드 API 호출
            const response = await fetch('http://localhost:8006/api/v1/contextual-analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullContext,
                    conversationHistory: this.conversationHistory
                })
            });

            if (response.ok) {
                const result = await response.json();
                return result;
            } else {
                // API 실패 시 로컬 분석 수행
                return this.performLocalContextualAnalysis(fullContext);
            }
        } catch (error) {
            console.error('문맥 분석 API 호출 실패:', error);
            return this.performLocalContextualAnalysis(fullContext);
        }
    }

    /**
     * 로컬 문맥 분석 (API 실패 시 대체)
     */
    private async performLocalContextualAnalysis(fullContext: string): Promise<ContextualAnalysis> {
        // 주요 토픽 추출
        const mainTopics = this.extractMainTopics(fullContext);

        // 핵심 엔티티 추출
        const keyEntities = this.extractKeyEntities(fullContext);

        // 감정 분석
        const sentiment = this.analyzeSentiment(fullContext);

        // 의도 파악
        const intent = this.analyzeIntent(fullContext);

        // 요구사항 추출
        const requirements = this.extractRequirements(fullContext);

        // 후속 질문 생성
        const followUpQuestions = this.generateFollowUpQuestions(fullContext, mainTopics);

        // 요약 생성
        const summary = this.generateSummary(fullContext);

        return {
            fullContext,
            mainTopics,
            keyEntities,
            sentiment,
            intent,
            requirements,
            followUpQuestions,
            summary
        };
    }

    /**
     * 주요 토픽 추출
     */
    private extractMainTopics(context: string): string[] {
        const topics: string[] = [];

        // 키워드 기반 토픽 추출
        const keywordPatterns = [
            /(?:시공사|건설사|삼성|GS|대우|현대)/g,
            /(?:재개발|재건축|아파트|주택)/g,
            /(?:홍보|마케팅|광고)/g,
            /(?:조합원|주민|시민)/g,
            /(?:설계|계획|안건)/g,
            /(?:분석|검토|평가)/g,
            /(?:논란|문제|이슈)/g
        ];

        keywordPatterns.forEach(pattern => {
            const matches = context.match(pattern);
            if (matches) {
                topics.push(...matches);
            }
        });

        return Array.from(new Set(topics));
    }

    /**
     * 핵심 엔티티 추출
     */
    private extractKeyEntities(context: string): string[] {
        const entities: string[] = [];

        // 회사명, 인명, 장소명 등 추출
        const entityPatterns = [
            /(?:삼성물산|GS건설|대우건설|현대건설)/g,
            /(?:개포우성|잠실우성|강남|서울)/g,
            /(?:이재헌|박재우|박은진|정지혜)/g
        ];

        entityPatterns.forEach(pattern => {
            const matches = context.match(pattern);
            if (matches) {
                entities.push(...matches);
            }
        });

        return Array.from(new Set(entities));
    }

    /**
     * 감정 분석
     */
    private analyzeSentiment(context: string): 'positive' | 'negative' | 'neutral' | 'mixed' {
        const positiveWords = ['좋다', '긍정적', '유리', '성공', '개선', '해결'];
        const negativeWords = ['문제', '논란', '부정적', '불리', '실패', '어려움'];

        const positiveCount = positiveWords.filter(word => context.includes(word)).length;
        const negativeCount = negativeWords.filter(word => context.includes(word)).length;

        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        if (positiveCount === negativeCount && positiveCount > 0) return 'mixed';
        return 'neutral';
    }

    /**
     * 의도 분석
     */
    private analyzeIntent(context: string): string {
        if (context.includes('분석') || context.includes('검토')) return 'analysis_request';
        if (context.includes('요약') || context.includes('정리')) return 'summary_request';
        if (context.includes('글쓰기') || context.includes('작성')) return 'writing_request';
        if (context.includes('비교') || context.includes('대조')) return 'comparison_request';
        if (context.includes('예측') || context.includes('전망')) return 'prediction_request';
        return 'general_inquiry';
    }

    /**
     * 요구사항 추출
     */
    private extractRequirements(context: string): string[] {
        const requirements: string[] = [];

        // 요구사항 패턴 매칭
        const requirementPatterns = [
            /(?:카드뉴스|카드뉴스 형식)/g,
            /(?:극우적|극우적 댓글)/g,
            /(?:실명|실명방)/g,
            /(?:요약|정리)/g,
            /(?:분석|검토)/g,
            /(?:비교|대조)/g
        ];

        requirementPatterns.forEach(pattern => {
            const matches = context.match(pattern);
            if (matches) {
                requirements.push(...matches);
            }
        });

        return Array.from(new Set(requirements));
    }

    /**
     * 후속 질문 생성
     */
    private generateFollowUpQuestions(context: string, topics: string[]): string[] {
        const questions: string[] = [];

        if (topics.includes('시공사')) {
            questions.push('다른 시공사와의 비교 분석이 필요하신가요?');
        }

        if (topics.includes('재개발')) {
            questions.push('재개발 과정의 다른 단계에 대한 정보가 필요하신가요?');
        }

        if (context.includes('홍보')) {
            questions.push('홍보 활동의 구체적인 내용을 더 자세히 분석해드릴까요?');
        }

        return questions;
    }

    /**
 * 요약 생성
 */
    private generateSummary(context: string): string {
        const lines = context.split('\n');
        const recentLines = lines.slice(-10); // 최근 10줄만 사용

        return `현재 대화는 ${this.extractMainTopics(context).join(', ')}에 대한 논의로, 
                ${this.analyzeIntent(context)} 의도를 가지고 있으며, 
                ${this.analyzeSentiment(context)}적인 관점에서 진행되고 있습니다.`;
    }

    /**
     * 텍스트 포맷팅 보존
     */
    private preserveTextFormatting(text: string): {
        originalText: string;
        lineBreaks: boolean;
        fontSize?: number;
        textStructure: string[];
    } {
        // 원본 텍스트 보존
        const originalText = text;

        // 줄바꿈 확인
        const lineBreaks = text.includes('\n');

        // 텍스트 구조 분석 (줄별로 분리)
        const textStructure = text.split('\n').filter(line => line.trim() !== '');

        // 글자 크기 추정 (텍스트 길이에 따른 동적 크기)
        let fontSize: number | undefined;
        if (text.length > 1000) {
            fontSize = 14; // 긴 텍스트는 작은 글자
        } else if (text.length > 500) {
            fontSize = 16; // 중간 길이 텍스트
        } else {
            fontSize = 18; // 짧은 텍스트는 큰 글자
        }

        return {
            originalText,
            lineBreaks,
            fontSize,
            textStructure
        };
    }

    /**
     * 문맥 기반 응답 생성
     */
    async generateContextualResponse(newMessage: string): Promise<ContextualResponse> {
        // 전체 문맥 분석
        const understanding = await this.analyzeFullContext(newMessage);

        // 문맥을 고려한 응답 생성
        const response = await this.generateResponseBasedOnContext(understanding, newMessage);

        // 관련 토픽 및 제안사항 생성
        const suggestions = this.generateSuggestions(understanding);
        const relatedTopics = this.generateRelatedTopics(understanding);

        return {
            understanding,
            response,
            suggestions,
            relatedTopics
        };
    }

    /**
     * 문맥 기반 응답 생성
     */
    private async generateResponseBasedOnContext(understanding: ContextualAnalysis, newMessage: string): Promise<string> {
        try {
            const response = await fetch('http://localhost:8006/api/v1/contextual-response', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    understanding,
                    newMessage,
                    conversationHistory: this.conversationHistory
                })
            });

            if (response.ok) {
                const result = await response.json();
                return result.response;
            } else {
                return this.generateLocalResponse(understanding, newMessage);
            }
        } catch (error) {
            console.error('문맥 기반 응답 생성 API 호출 실패:', error);
            return this.generateLocalResponse(understanding, newMessage);
        }
    }

    /**
     * 로컬 응답 생성
     */
    private generateLocalResponse(understanding: ContextualAnalysis, newMessage: string): string {
        const { intent, requirements, mainTopics } = understanding;

        let response = `전체 문맥을 파악했습니다. `;

        if (intent === 'analysis_request') {
            response += `${mainTopics.join(', ')}에 대한 종합적인 분석을 제공하겠습니다. `;
        } else if (intent === 'summary_request') {
            response += `주요 내용을 요약하여 정리해드리겠습니다. `;
        } else if (intent === 'writing_request') {
            response += `요청하신 형식으로 글을 작성해드리겠습니다. `;
        }

        if (requirements.length > 0) {
            response += `특별히 ${requirements.join(', ')} 요구사항을 반영하여 처리하겠습니다.`;
        }

        return response;
    }

    /**
     * 제안사항 생성
     */
    private generateSuggestions(understanding: ContextualAnalysis): string[] {
        const suggestions: string[] = [];
        const { intent, mainTopics, requirements } = understanding;

        if (intent === 'analysis_request') {
            suggestions.push('더 상세한 분석이 필요하시면 말씀해주세요.');
            suggestions.push('다른 관점에서의 분석도 가능합니다.');
        }

        if (mainTopics.includes('시공사')) {
            suggestions.push('다른 시공사와의 비교 분석을 제공할 수 있습니다.');
        }

        if (requirements.includes('카드뉴스')) {
            suggestions.push('카드뉴스 외에도 다른 형식으로 제작 가능합니다.');
        }

        return suggestions;
    }

    /**
     * 관련 토픽 생성
     */
    private generateRelatedTopics(understanding: ContextualAnalysis): string[] {
        const { mainTopics } = understanding;
        const relatedTopics: string[] = [];

        if (mainTopics.includes('시공사')) {
            relatedTopics.push('시공사 선정 기준', '시공사 평가 방법', '시공사 비교 분석');
        }

        if (mainTopics.includes('재개발')) {
            relatedTopics.push('재개발 과정', '재개발 혜택', '재개발 문제점');
        }

        if (mainTopics.includes('홍보')) {
            relatedTopics.push('홍보 전략', '홍보 효과', '홍보 규제');
        }

        return relatedTopics;
    }

    /**
     * 대화 히스토리 초기화
     */
    clearHistory(): void {
        this.conversationHistory = [];
    }

    /**
     * 대화 히스토리 가져오기
     */
    getHistory(): ContextualMessage[] {
        return [...this.conversationHistory];
    }
}

export const contextualUnderstandingService = new ContextualUnderstandingService();
