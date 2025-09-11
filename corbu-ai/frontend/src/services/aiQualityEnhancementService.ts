/**
 * AI 응답 품질 향상 서비스
 * 응답의 정확도, 관련성, 창의성을 평가하고 개선합니다.
 */

interface QualityMetrics {
    accuracy: number;      // 정확도 (0-1)
    relevance: number;     // 관련성 (0-1)
    creativity: number;    // 창의성 (0-1)
    completeness: number;  // 완성도 (0-1)
    clarity: number;       // 명확성 (0-1)
    engagement: number;    // 흥미도 (0-1)
    overall: number;       // 전체 점수 (0-1)
}

interface ResponseAnalysis {
    metrics: QualityMetrics;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    confidence: number;
    timestamp: Date;
}

interface EnhancementRule {
    id: string;
    name: string;
    description: string;
    condition: (text: string, context: any) => boolean;
    enhancement: (text: string, context: any) => string;
    priority: number;
    category: 'grammar' | 'style' | 'content' | 'structure' | 'engagement';
}

interface LearningData {
    userQuery: string;
    aiResponse: string;
    userFeedback: 'positive' | 'negative' | 'neutral';
    qualityScore: number;
    improvementSuggestions: string[];
    timestamp: Date;
}

class AIQualityEnhancementService {
    private enhancementRules: EnhancementRule[] = [];
    private learningHistory: LearningData[] = [];
    private qualityThresholds = {
        excellent: 0.9,
        good: 0.7,
        average: 0.5,
        poor: 0.3
    };

    constructor() {
        this.initializeEnhancementRules();
        this.loadLearningHistory();
    }

    /**
     * 향상 규칙 초기화
     */
    private initializeEnhancementRules(): void {
        this.enhancementRules = [
            // 문법 및 스타일 규칙
            {
                id: 'korean-politeness',
                name: '한국어 존댓말 적용',
                description: '한국어 응답에 적절한 존댓말을 적용합니다',
                condition: (text: string) => /[가-힣]/.test(text) && !/습니다|습니까|세요|시겠|하십/.test(text),
                enhancement: (text: string) => this.applyKoreanPoliteness(text),
                priority: 9,
                category: 'style'
            },
            {
                id: 'professional-tone',
                name: '전문적 어조 적용',
                description: '비즈니스 및 전문적 맥락에서 적절한 어조를 사용합니다',
                condition: (text: string, context: any) => context?.professional && !this.hasProfessionalTone(text),
                enhancement: (text: string) => this.applyProfessionalTone(text),
                priority: 8,
                category: 'style'
            },
            {
                id: 'add-examples',
                name: '구체적 예시 추가',
                description: '추상적인 설명에 구체적인 예시를 추가합니다',
                condition: (text: string) => this.needsExamples(text),
                enhancement: (text: string, context: any) => this.addRelevantExamples(text, context),
                priority: 7,
                category: 'content'
            },
            {
                id: 'improve-structure',
                name: '구조 개선',
                description: '텍스트의 논리적 구조를 개선합니다',
                condition: (text: string) => this.hasStructuralIssues(text),
                enhancement: (text: string) => this.improveTextStructure(text),
                priority: 8,
                category: 'structure'
            },
            {
                id: 'enhance-engagement',
                name: '흥미도 향상',
                description: '독자의 흥미를 끌 수 있는 요소를 추가합니다',
                condition: (text: string) => this.isLowEngagement(text),
                enhancement: (text: string) => this.enhanceEngagement(text),
                priority: 6,
                category: 'engagement'
            },
            {
                id: 'fact-verification',
                name: '사실 확인 강화',
                description: '주장에 대한 근거나 출처를 명시합니다',
                condition: (text: string) => this.needsFactVerification(text),
                enhancement: (text: string) => this.addFactualSupport(text),
                priority: 9,
                category: 'content'
            },
            {
                id: 'personalization',
                name: '개인화 적용',
                description: '사용자의 선호도와 맥락에 맞게 응답을 조정합니다',
                condition: (text: string, context: any) => context?.user && this.canPersonalize(text, context),
                enhancement: (text: string, context: any) => this.personalizeResponse(text, context),
                priority: 7,
                category: 'content'
            }
        ];
    }

    /**
     * 응답 품질 분석
     */
    public analyzeResponseQuality(
        response: string,
        query: string,
        context?: any
    ): ResponseAnalysis {
        const metrics = this.calculateQualityMetrics(response, query, context);
        const analysis = this.generateQualityAnalysis(response, metrics, context);

        return {
            metrics,
            strengths: analysis.strengths,
            weaknesses: analysis.weaknesses,
            suggestions: analysis.suggestions,
            confidence: analysis.confidence,
            timestamp: new Date()
        };
    }

    /**
     * 품질 메트릭 계산
     */
    private calculateQualityMetrics(
        response: string,
        query: string,
        context?: any
    ): QualityMetrics {
        const accuracy = this.measureAccuracy(response, query, context);
        const relevance = this.measureRelevance(response, query);
        const creativity = this.measureCreativity(response);
        const completeness = this.measureCompleteness(response, query);
        const clarity = this.measureClarity(response);
        const engagement = this.measureEngagement(response);

        const overall = (accuracy * 0.25) + (relevance * 0.2) + (creativity * 0.15) +
            (completeness * 0.2) + (clarity * 0.1) + (engagement * 0.1);

        return {
            accuracy,
            relevance,
            creativity,
            completeness,
            clarity,
            engagement,
            overall
        };
    }

    /**
     * 정확도 측정
     */
    private measureAccuracy(response: string, query: string, context?: any): number {
        let score = 0.7; // 기본 점수

        // 키워드 매칭
        const queryKeywords = this.extractKeywords(query);
        const responseKeywords = this.extractKeywords(response);
        const keywordMatch = this.calculateKeywordOverlap(queryKeywords, responseKeywords);
        score += keywordMatch * 0.2;

        // 사실적 일관성 검사
        if (this.hasFactualConsistency(response)) {
            score += 0.1;
        }

        // 맥락 적합성
        if (context && this.isContextAppropriate(response, context)) {
            score += 0.1;
        }

        return Math.min(1.0, score);
    }

    /**
     * 관련성 측정
     */
    private measureRelevance(response: string, query: string): number {
        const queryTopics = this.identifyTopics(query);
        const responseTopics = this.identifyTopics(response);

        const topicOverlap = this.calculateTopicOverlap(queryTopics, responseTopics);
        const intentMatch = this.measureIntentMatch(query, response);

        return (topicOverlap * 0.6) + (intentMatch * 0.4);
    }

    /**
     * 창의성 측정
     */
    private measureCreativity(response: string): number {
        let score = 0.5; // 기본 점수

        // 독창적 표현 사용
        if (this.hasCreativeExpressions(response)) {
            score += 0.2;
        }

        // 다양한 관점 제시
        if (this.hasMultiplePerspectives(response)) {
            score += 0.2;
        }

        // 비유나 예시의 창의성
        if (this.hasCreativeExamples(response)) {
            score += 0.1;
        }

        return Math.min(1.0, score);
    }

    /**
     * 완성도 측정
     */
    private measureCompleteness(response: string, query: string): number {
        const queryAspects = this.identifyQueryAspects(query);
        const addressedAspects = this.identifyAddressedAspects(response, queryAspects);

        const completenessRatio = addressedAspects.length / queryAspects.length;

        // 적절한 길이 확인
        const lengthScore = this.evaluateResponseLength(response, query);

        return (completenessRatio * 0.7) + (lengthScore * 0.3);
    }

    /**
     * 명확성 측정
     */
    private measureClarity(response: string): number {
        let score = 0.7; // 기본 점수

        // 문장 구조의 복잡성
        const sentenceComplexity = this.analyzeSentenceComplexity(response);
        if (sentenceComplexity < 0.7) { // 적절한 복잡성
            score += 0.1;
        }

        // 전문용어의 설명
        if (this.explainsTechnicalTerms(response)) {
            score += 0.1;
        }

        // 논리적 흐름
        if (this.hasLogicalFlow(response)) {
            score += 0.1;
        }

        return Math.min(1.0, score);
    }

    /**
     * 흥미도 측정
     */
    private measureEngagement(response: string): number {
        let score = 0.5; // 기본 점수

        // 질문이나 상호작용 요소
        if (this.hasInteractiveElements(response)) {
            score += 0.2;
        }

        // 개인적 연결성
        if (this.hasPersonalConnection(response)) {
            score += 0.2;
        }

        // 호기심 유발 요소
        if (this.hasCuriosityTriggers(response)) {
            score += 0.1;
        }

        return Math.min(1.0, score);
    }

    /**
     * 응답 향상 적용
     */
    public enhanceResponse(
        response: string,
        query: string,
        context?: any
    ): {
        enhancedResponse: string;
        appliedRules: string[];
        improvements: string[];
    } {
        let enhancedResponse = response;
        const appliedRules: string[] = [];
        const improvements: string[] = [];

        // 우선순위 순으로 규칙 정렬
        const sortedRules = this.enhancementRules.sort((a, b) => b.priority - a.priority);

        for (const rule of sortedRules) {
            if (rule.condition(enhancedResponse, context)) {
                const previousResponse = enhancedResponse;
                enhancedResponse = rule.enhancement(enhancedResponse, context);

                if (enhancedResponse !== previousResponse) {
                    appliedRules.push(rule.name);
                    improvements.push(`${rule.name}: ${rule.description}`);
                }
            }
        }

        return {
            enhancedResponse,
            appliedRules,
            improvements
        };
    }

    /**
     * 사용자 피드백 학습
     */
    public learnFromFeedback(
        query: string,
        response: string,
        feedback: 'positive' | 'negative' | 'neutral',
        qualityScore?: number
    ): void {
        const learningData: LearningData = {
            userQuery: query,
            aiResponse: response,
            userFeedback: feedback,
            qualityScore: qualityScore || this.calculateQualityMetrics(response, query).overall,
            improvementSuggestions: this.generateImprovementSuggestions(response, feedback),
            timestamp: new Date()
        };

        this.learningHistory.push(learningData);
        this.updateEnhancementRules(learningData);
        this.saveLearningHistory();
    }

    /**
     * 개선 제안 생성
     */
    private generateImprovementSuggestions(response: string, feedback: string): string[] {
        const suggestions: string[] = [];

        if (feedback === 'negative') {
            if (this.isLowAccuracy(response)) {
                suggestions.push('더 정확한 정보 제공');
            }
            if (this.isLowRelevance(response)) {
                suggestions.push('질문에 더 직접적으로 답변');
            }
            if (this.isLowClarity(response)) {
                suggestions.push('더 명확하고 이해하기 쉬운 설명');
            }
        }

        return suggestions;
    }

    // ===== 유틸리티 메서드들 =====

    private extractKeywords(text: string): string[] {
        // 간단한 키워드 추출 로직
        return text.toLowerCase()
            .replace(/[^\w\s가-힣]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2);
    }

    private calculateKeywordOverlap(keywords1: string[], keywords2: string[]): number {
        const intersection = keywords1.filter(k => keywords2.includes(k));
        const unionSet = new Set([...keywords1, ...keywords2]);
        const union = Array.from(unionSet);
        return union.length > 0 ? intersection.length / union.length : 0;
    }

    private identifyTopics(text: string): string[] {
        // 토픽 식별 로직 (실제로는 더 복잡한 NLP 알고리즘 사용)
        const topics: string[] = [];

        if (/부동산|재개발|건설/.test(text)) topics.push('부동산');
        if (/정치|정책|정부/.test(text)) topics.push('정치');
        if (/경제|투자|금융/.test(text)) topics.push('경제');
        if (/기술|AI|인공지능/.test(text)) topics.push('기술');

        return topics;
    }

    private calculateTopicOverlap(topics1: string[], topics2: string[]): number {
        if (topics1.length === 0 || topics2.length === 0) return 0;
        const intersection = topics1.filter(t => topics2.includes(t));
        return intersection.length / Math.max(topics1.length, topics2.length);
    }

    private applyKoreanPoliteness(text: string): string {
        return text
            .replace(/이다\./g, '입니다.')
            .replace(/한다\./g, '합니다.')
            .replace(/해라\./g, '해주세요.')
            .replace(/이야\./g, '이에요.');
    }

    private applyProfessionalTone(text: string): string {
        return text
            .replace(/아니다/g, '그렇지 않습니다')
            .replace(/그냥/g, '단순히')
            .replace(/엄청/g, '상당히');
    }

    private needsExamples(text: string): boolean {
        return text.length > 200 &&
            !/예를 들어|예시|사례|구체적으로|실제로/.test(text) &&
            /개념|이론|방법|전략/.test(text);
    }

    private addRelevantExamples(text: string, context: any): string {
        // 맥락에 따른 예시 추가 로직
        if (text.includes('부동산')) {
            return text + '\n\n예를 들어, 강남지역의 재개발 사업의 경우...';
        }
        return text + '\n\n구체적인 예시로 설명하면...';
    }

    private hasStructuralIssues(text: string): boolean {
        const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);
        return sentences.length > 5 &&
            !text.includes('\n') &&
            !/첫째|둘째|셋째|먼저|다음으로|마지막으로/.test(text);
    }

    private improveTextStructure(text: string): string {
        const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);
        if (sentences.length <= 3) return text;

        let structured = sentences[0] + '.\n\n';

        for (let i = 1; i < sentences.length - 1; i++) {
            if (i === 1) structured += '먼저, ';
            else if (i === sentences.length - 2) structured += '마지막으로, ';
            else structured += '또한, ';

            structured += sentences[i].trim() + '.\n\n';
        }

        if (sentences.length > 1) {
            structured += sentences[sentences.length - 1].trim() + '.';
        }

        return structured;
    }

    private isLowEngagement(text: string): boolean {
        return !text.includes('?') &&
            !/흥미롭게도|놀랍게도|주목할 점은|특히|실제로/.test(text) &&
            text.length > 300;
    }

    private enhanceEngagement(text: string): string {
        if (!text.includes('?')) {
            text += '\n\n이와 관련해서 더 궁금한 점이 있으시다면 언제든 물어보세요!';
        }
        return text.replace(/입니다\./g, (match, offset) => {
            if (offset > text.length * 0.3 && offset < text.length * 0.7) {
                return '입니다. 흥미롭게도, ';
            }
            return match;
        });
    }

    // 기타 유틸리티 메서드들...
    private hasFactualConsistency(text: string): boolean { return true; }
    private isContextAppropriate(text: string, context: any): boolean { return true; }
    private measureIntentMatch(query: string, response: string): number { return 0.8; }
    private hasCreativeExpressions(text: string): boolean { return /비유|마치|것처럼/.test(text); }
    private hasMultiplePerspectives(text: string): boolean { return /반면|한편|다른 관점/.test(text); }
    private hasCreativeExamples(text: string): boolean { return /상상해보세요|생각해보면/.test(text); }
    private identifyQueryAspects(query: string): string[] { return []; }
    private identifyAddressedAspects(response: string, aspects: string[]): string[] { return aspects; }
    private evaluateResponseLength(response: string, query: string): number { return 0.8; }
    private analyzeSentenceComplexity(text: string): number { return 0.6; }
    private explainsTechnicalTerms(text: string): boolean { return /즉|다시 말해|\(.*\)/.test(text); }
    private hasLogicalFlow(text: string): boolean { return /따라서|그러므로|결론적으로/.test(text); }
    private hasInteractiveElements(text: string): boolean { return text.includes('?'); }
    private hasPersonalConnection(text: string): boolean { return /여러분|당신|우리/.test(text); }
    private hasCuriosityTriggers(text: string): boolean { return /놀랍게도|신기하게도|알고 계셨나요/.test(text); }
    private hasProfessionalTone(text: string): boolean { return /다고 할 수 있습니다|것으로 판단됩니다/.test(text); }
    private needsFactVerification(text: string): boolean { return /통계|연구|조사/.test(text) && !/출처|자료/.test(text); }
    private addFactualSupport(text: string): string { return text + '\n\n* 관련 통계나 연구 자료는 공신력 있는 기관의 데이터를 참고하시기 바랍니다.'; }
    private canPersonalize(text: string, context: any): boolean { return context?.user?.preferences; }
    private personalizeResponse(text: string, context: any): string { return text; }
    private isLowAccuracy(text: string): boolean { return false; }
    private isLowRelevance(text: string): boolean { return false; }
    private isLowClarity(text: string): boolean { return false; }
    private updateEnhancementRules(data: LearningData): void { }
    private loadLearningHistory(): void { }
    private saveLearningHistory(): void { }

    /**
     * 품질 분석 생성
     */
    private generateQualityAnalysis(
        response: string,
        metrics: QualityMetrics,
        context?: any
    ): {
        strengths: string[];
        weaknesses: string[];
        suggestions: string[];
        confidence: number;
    } {
        const strengths: string[] = [];
        const weaknesses: string[] = [];
        const suggestions: string[] = [];

        // 강점 분석
        if (metrics.accuracy > 0.8) strengths.push('높은 정확도');
        if (metrics.relevance > 0.8) strengths.push('높은 관련성');
        if (metrics.creativity > 0.7) strengths.push('창의적 접근');
        if (metrics.clarity > 0.8) strengths.push('명확한 설명');

        // 약점 분석
        if (metrics.accuracy < 0.6) weaknesses.push('정확도 부족');
        if (metrics.relevance < 0.6) weaknesses.push('관련성 부족');
        if (metrics.completeness < 0.6) weaknesses.push('완성도 부족');
        if (metrics.engagement < 0.5) weaknesses.push('흥미도 부족');

        // 개선 제안
        if (metrics.accuracy < 0.7) suggestions.push('더 정확한 정보 제공 필요');
        if (metrics.creativity < 0.6) suggestions.push('더 창의적인 접근 방법 시도');
        if (metrics.engagement < 0.6) suggestions.push('독자의 흥미를 끌 수 있는 요소 추가');

        const confidence = metrics.overall;

        return { strengths, weaknesses, suggestions, confidence };
    }
}

// 싱글톤 인스턴스
export const aiQualityEnhancementService = new AIQualityEnhancementService();

export default aiQualityEnhancementService;
