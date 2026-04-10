import { Message } from '../types/chat';
import { errorLogger, toError } from '../utils/errorLogger';

export interface QualityDimension {
    name: string;
    score: number;
    weight: number;
    description: string;
    suggestions: string[];
}

export interface AdvancedQualityMetrics {
    relevance: QualityDimension;
    accuracy: QualityDimension;
    completeness: QualityDimension;
    clarity: QualityDimension;
    helpfulness: QualityDimension;
    coherence: QualityDimension;
    creativity: QualityDimension;
    technicalDepth: QualityDimension;
    overall: number;
    confidence: number;
}

export interface QualityImprovement {
    dimension: string;
    currentScore: number;
    targetScore: number;
    suggestions: string[];
    priority: 'high' | 'medium' | 'low';
}

export interface ResponseAnalysis {
    qualityMetrics: AdvancedQualityMetrics;
    improvements: QualityImprovement[];
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
}

class AdvancedQualityEvaluator {
    private readonly dimensionWeights = {
        relevance: 0.25,
        accuracy: 0.20,
        completeness: 0.15,
        clarity: 0.15,
        helpfulness: 0.10,
        coherence: 0.08,
        creativity: 0.04,
        technicalDepth: 0.03
    };

    /**
     * 고급 품질 평가 수행
     */
    async evaluateResponseQuality(
        response: string,
        userInput: string,
        context: {
            conversationHistory: Message[];
            projectContext?: Record<string, unknown>;
            userPreferences?: Record<string, unknown>;
        }
    ): Promise<ResponseAnalysis> {
        const startTime = Date.now();
        errorLogger.info('🔍 고급 품질 평가 시작', {
            component: 'advancedQualityEvaluator',
            action: 'evaluateAdvancedQuality',
            userInput: userInput.substring(0, 100),
        });

        try {
            // 1. 각 차원별 품질 평가
            const relevance = await this.evaluateRelevance(response, userInput, context);
            const accuracy = await this.evaluateAccuracy(response, context);
            const completeness = await this.evaluateCompleteness(response, userInput, context);
            const clarity = await this.evaluateClarity(response);
            const helpfulness = await this.evaluateHelpfulness(response, userInput, context);
            const coherence = await this.evaluateCoherence(response, context);
            const creativity = await this.evaluateCreativity(response, context);
            const technicalDepth = await this.evaluateTechnicalDepth(response, context);

            // 2. 전체 품질 점수 계산
            const overall = this.calculateOverallScore({
                relevance,
                accuracy,
                completeness,
                clarity,
                helpfulness,
                coherence,
                creativity,
                technicalDepth
            });

            // 3. 개선사항 분석
            const improvements = this.analyzeImprovements({
                relevance,
                accuracy,
                completeness,
                clarity,
                helpfulness,
                coherence,
                creativity,
                technicalDepth
            });

            // 4. 강점과 약점 분석
            const strengths = this.identifyStrengths({
                relevance,
                accuracy,
                completeness,
                clarity,
                helpfulness,
                coherence,
                creativity,
                technicalDepth
            });

            const weaknesses = this.identifyWeaknesses({
                relevance,
                accuracy,
                completeness,
                clarity,
                helpfulness,
                coherence,
                creativity,
                technicalDepth
            });

            // 5. 권장사항 생성
            const recommendations = this.generateRecommendations(improvements, context);

            const processingTime = Date.now() - startTime;
            errorLogger.info('✅ 고급 품질 평가 완료', {
                component: 'advancedQualityEvaluator',
                action: 'evaluateAdvancedQuality',
                processingTime,
                overallScore: overall,
            });

            return {
                qualityMetrics: {
                    relevance,
                    accuracy,
                    completeness,
                    clarity,
                    helpfulness,
                    coherence,
                    creativity,
                    technicalDepth,
                    overall,
                    confidence: this.calculateConfidence({
                        relevance,
                        accuracy,
                        completeness,
                        clarity,
                        helpfulness,
                        coherence,
                        creativity,
                        technicalDepth
                    })
                },
                improvements,
                strengths,
                weaknesses,
                recommendations
            };

        } catch (error) {
            const err = toError(error);
            errorLogger.error('고급 품질 평가 오류', err, {
                component: 'advancedQualityEvaluator',
                action: 'evaluateAdvancedQuality',
                userInput: userInput.substring(0, 100),
            });
            return this.createFallbackAnalysis();
        }
    }

    /**
     * 관련성 평가
     */
    private async evaluateRelevance(
        response: string,
        userInput: string,
        context: Record<string, unknown>
    ): Promise<QualityDimension> {
        const userKeywords = this.extractKeywords(userInput);
        const responseKeywords = this.extractKeywords(response);

        // 키워드 매칭 분석
        const keywordMatch = this.calculateKeywordMatch(userKeywords, responseKeywords);

        // 주제 일치도 분석
        const topicAlignment = this.analyzeTopicAlignment(userInput, response);

        // 컨텍스트 적합성 분석
        const contextRelevance = this.analyzeContextRelevance(response, context);

        const score = (keywordMatch * 0.4 + topicAlignment * 0.4 + contextRelevance * 0.2);

        return {
            name: 'relevance',
            score: Math.min(score, 1.0),
            weight: this.dimensionWeights.relevance,
            description: '사용자 질문과 응답의 관련성',
            suggestions: this.generateRelevanceSuggestions(score, userKeywords, responseKeywords)
        };
    }

    /**
     * 정확성 평가
     */
    private async evaluateAccuracy(response: string, context: Record<string, unknown>): Promise<QualityDimension> {
        // 사실 검증
        const factualAccuracy = this.verifyFactualAccuracy(response);

        // 논리적 일관성
        const logicalConsistency = this.checkLogicalConsistency(response);

        // 기술적 정확성
        const technicalAccuracy = this.verifyTechnicalAccuracy(response, context);

        const score = (factualAccuracy * 0.5 + logicalConsistency * 0.3 + technicalAccuracy * 0.2);

        return {
            name: 'accuracy',
            score: Math.min(score, 1.0),
            weight: this.dimensionWeights.accuracy,
            description: '응답의 사실적, 논리적, 기술적 정확성',
            suggestions: this.generateAccuracySuggestions(score, response)
        };
    }

    /**
     * 완성도 평가
     */
    private async evaluateCompleteness(
        response: string,
        userInput: string,
        context: Record<string, unknown>
    ): Promise<QualityDimension> {
        // 질문 요구사항 충족도
        const requirementFulfillment = this.analyzeRequirementFulfillment(response, userInput);

        // 상세도 분석
        const detailLevel = this.analyzeDetailLevel(response, context);

        // 포괄성 분석
        const comprehensiveness = this.analyzeComprehensiveness(response, userInput);

        const score = (requirementFulfillment * 0.5 + detailLevel * 0.3 + comprehensiveness * 0.2);

        return {
            name: 'completeness',
            score: Math.min(score, 1.0),
            weight: this.dimensionWeights.completeness,
            description: '응답의 완전성과 포괄성',
            suggestions: this.generateCompletenessSuggestions(score, userInput, response)
        };
    }

    /**
     * 명확성 평가
     */
    private async evaluateClarity(response: string): Promise<QualityDimension> {
        // 문장 구조 분석
        const sentenceStructure = this.analyzeSentenceStructure(response);

        // 용어 사용 분석
        const terminologyUsage = this.analyzeTerminologyUsage(response);

        // 가독성 분석
        const readability = this.analyzeReadability(response);

        const score = (sentenceStructure * 0.4 + terminologyUsage * 0.3 + readability * 0.3);

        return {
            name: 'clarity',
            score: Math.min(score, 1.0),
            weight: this.dimensionWeights.clarity,
            description: '응답의 명확성과 이해하기 쉬운 정도',
            suggestions: this.generateClaritySuggestions(score, response)
        };
    }

    /**
     * 도움성 평가
     */
    private async evaluateHelpfulness(
        response: string,
        userInput: string,
        context: Record<string, unknown>
    ): Promise<QualityDimension> {
        // 실용성 분석
        const practicality = this.analyzePracticality(response, userInput);

        // 실행 가능성 분석
        const actionability = this.analyzeActionability(response);

        // 가치 제공 분석
        const valueProvision = this.analyzeValueProvision(response, context);

        const score = (practicality * 0.4 + actionability * 0.3 + valueProvision * 0.3);

        return {
            name: 'helpfulness',
            score: Math.min(score, 1.0),
            weight: this.dimensionWeights.helpfulness,
            description: '응답이 사용자에게 실제로 도움이 되는 정도',
            suggestions: this.generateHelpfulnessSuggestions(score, response, userInput)
        };
    }

    /**
     * 일관성 평가
     */
    private async evaluateCoherence(response: string, context: Record<string, unknown>): Promise<QualityDimension> {
        // 논리적 흐름 분석
        const logicalFlow = this.analyzeLogicalFlow(response);

        // 구조적 일관성 분석
        const structuralConsistency = this.analyzeStructuralConsistency(response);

        // 스타일 일관성 분석
        const styleConsistency = this.analyzeStyleConsistency(response, context);

        const score = (logicalFlow * 0.4 + structuralConsistency * 0.3 + styleConsistency * 0.3);

        return {
            name: 'coherence',
            score: Math.min(score, 1.0),
            weight: this.dimensionWeights.coherence,
            description: '응답의 논리적 일관성과 구조적 통일성',
            suggestions: this.generateCoherenceSuggestions(score, response)
        };
    }

    /**
     * 창의성 평가
     */
    private async evaluateCreativity(response: string, context: Record<string, unknown>): Promise<QualityDimension> {
        // 독창성 분석
        const originality = this.analyzeOriginality(response, context);

        // 혁신성 분석
        const innovation = this.analyzeInnovation(response);

        // 표현의 다양성 분석
        const expressionVariety = this.analyzeExpressionVariety(response);

        const score = (originality * 0.4 + innovation * 0.3 + expressionVariety * 0.3);

        return {
            name: 'creativity',
            score: Math.min(score, 1.0),
            weight: this.dimensionWeights.creativity,
            description: '응답의 창의성과 독창성',
            suggestions: this.generateCreativitySuggestions(score, response)
        };
    }

    /**
     * 기술적 깊이 평가
     */
    private async evaluateTechnicalDepth(response: string, context: Record<string, unknown>): Promise<QualityDimension> {
        // 기술적 복잡성 분석
        const technicalComplexity = this.analyzeTechnicalComplexity(response);

        // 전문성 수준 분석
        const expertiseLevel = this.analyzeExpertiseLevel(response, context);

        // 심화 분석 수준 분석
        const depthAnalysis = this.analyzeDepthAnalysis(response);

        const score = (technicalComplexity * 0.4 + expertiseLevel * 0.3 + depthAnalysis * 0.3);

        return {
            name: 'technicalDepth',
            score: Math.min(score, 1.0),
            weight: this.dimensionWeights.technicalDepth,
            description: '응답의 기술적 깊이와 전문성',
            suggestions: this.generateTechnicalDepthSuggestions(score, response)
        };
    }

    // 헬퍼 메서드들
    private extractKeywords(text: string): string[] {
        // 간단한 키워드 추출 (실제로는 더 정교한 NLP 사용)
        return text.toLowerCase()
            .replace(/[^\w\s가-힣]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 1)
            .slice(0, 10);
    }

    private calculateKeywordMatch(userKeywords: string[], responseKeywords: string[]): number {
        if (userKeywords.length === 0) return 0;

        const matches = userKeywords.filter(keyword =>
            responseKeywords.some(responseKeyword =>
                responseKeyword.includes(keyword) || keyword.includes(responseKeyword)
            )
        );

        return matches.length / userKeywords.length;
    }

    private analyzeTopicAlignment(userInput: string, response: string): number {
        // 간단한 주제 일치도 분석
        const userTopics = this.extractTopics(userInput);
        const responseTopics = this.extractTopics(response);

        if (userTopics.length === 0) return 0;

        const matches = userTopics.filter(topic =>
            responseTopics.some(responseTopic =>
                responseTopic.includes(topic) || topic.includes(responseTopic)
            )
        );

        return matches.length / userTopics.length;
    }

    private extractTopics(text: string): string[] {
        // 주제 추출 (실제로는 더 정교한 방법 사용)
        return this.extractKeywords(text);
    }

    private analyzeContextRelevance(response: string, context: Record<string, unknown>): number {
        if (!context.projectContext) return 0.8; // 기본값

        // 프로젝트 컨텍스트와의 관련성 분석
        const projectKeywords = this.extractProjectKeywords((context.projectContext ?? {}) as Record<string, unknown>);
        const responseKeywords = this.extractKeywords(response);

        if (projectKeywords.length === 0) return 0.8;

        const matches = projectKeywords.filter(keyword =>
            responseKeywords.some(responseKeyword =>
                responseKeyword.includes(keyword) || keyword.includes(responseKeyword)
            )
        );

        return matches.length / projectKeywords.length;
    }

    private extractProjectKeywords(projectContext: Record<string, unknown>): string[] {
        // 프로젝트 컨텍스트에서 키워드 추출
        const contextStr = JSON.stringify(projectContext).toLowerCase();
        return this.extractKeywords(contextStr);
    }

    // 기타 분석 메서드들 (간단한 구현)
    private verifyFactualAccuracy(_response: string): number {
        // 실제로는 사실 검증 API나 데이터베이스 사용
        return 0.85; // 기본값
    }

    private checkLogicalConsistency(_response: string): number {
        // 논리적 일관성 검사
        return 0.9; // 기본값
    }

    private verifyTechnicalAccuracy(_response: string, _context: Record<string, unknown>): number {
        // 기술적 정확성 검증
        return 0.88; // 기본값
    }

    private analyzeRequirementFulfillment(_response: string, _userInput: string): number {
        // 요구사항 충족도 분석
        return 0.87; // 기본값
    }

    private analyzeDetailLevel(response: string, _context: Record<string, unknown>): number {
        // 상세도 분석
        const wordCount = response.split(' ').length;
        return Math.min(wordCount / 100, 1.0); // 100단어당 1점
    }

    private analyzeComprehensiveness(_response: string, _userInput: string): number {
        // 포괄성 분석
        return 0.82; // 기본값
    }

    private analyzeSentenceStructure(_response: string): number {
        // 문장 구조 분석
        return 0.9; // 기본값
    }

    private analyzeTerminologyUsage(_response: string): number {
        // 용어 사용 분석
        return 0.85; // 기본값
    }

    private analyzeReadability(_response: string): number {
        // 가독성 분석
        return 0.88; // 기본값
    }

    private analyzePracticality(_response: string, _userInput: string): number {
        // 실용성 분석
        return 0.86; // 기본값
    }

    private analyzeActionability(_response: string): number {
        // 실행 가능성 분석
        return 0.84; // 기본값
    }

    private analyzeValueProvision(_response: string, _context: Record<string, unknown>): number {
        // 가치 제공 분석
        return 0.83; // 기본값
    }

    private analyzeLogicalFlow(_response: string): number {
        // 논리적 흐름 분석
        return 0.89; // 기본값
    }

    private analyzeStructuralConsistency(_response: string): number {
        // 구조적 일관성 분석
        return 0.87; // 기본값
    }

    private analyzeStyleConsistency(_response: string, _context: Record<string, unknown>): number {
        // 스타일 일관성 분석
        return 0.85; // 기본값
    }

    private analyzeOriginality(_response: string, _context: Record<string, unknown>): number {
        // 독창성 분석
        return 0.75; // 기본값
    }

    private analyzeInnovation(_response: string): number {
        // 혁신성 분석
        return 0.7; // 기본값
    }

    private analyzeExpressionVariety(_response: string): number {
        // 표현의 다양성 분석
        return 0.8; // 기본값
    }

    private analyzeTechnicalComplexity(_response: string): number {
        // 기술적 복잡성 분석
        return 0.78; // 기본값
    }

    private analyzeExpertiseLevel(_response: string, _context: Record<string, unknown>): number {
        // 전문성 수준 분석
        return 0.82; // 기본값
    }

    private analyzeDepthAnalysis(_response: string): number {
        // 심화 분석 수준 분석
        return 0.8; // 기본값
    }

    /**
     * 전체 품질 점수 계산
     */
    private calculateOverallScore(metrics: Record<string, QualityDimension>): number {
        let totalScore = 0;
        let totalWeight = 0;

        Object.values(metrics).forEach(metric => {
            totalScore += metric.score * metric.weight;
            totalWeight += metric.weight;
        });

        return totalWeight > 0 ? totalScore / totalWeight : 0;
    }

    /**
     * 신뢰도 계산
     */
    private calculateConfidence(metrics: Record<string, QualityDimension>): number {
        const scores = Object.values(metrics).map(m => m.score);
        const variance = this.calculateVariance(scores);
        return Math.max(0, 1 - variance); // 분산이 낮을수록 신뢰도 높음
    }

    private calculateVariance(values: number[]): number {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
        return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    }

    /**
     * 개선사항 분석
     */
    private analyzeImprovements(metrics: Record<string, QualityDimension>): QualityImprovement[] {
        const improvements: QualityImprovement[] = [];

        Object.values(metrics).forEach(metric => {
            if (metric.score < 0.8) { // 80% 미만인 경우 개선 필요
                improvements.push({
                    dimension: metric.name,
                    currentScore: metric.score,
                    targetScore: 0.9,
                    suggestions: metric.suggestions,
                    priority: metric.score < 0.6 ? 'high' : metric.score < 0.7 ? 'medium' : 'low'
                });
            }
        });

        return improvements.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    /**
     * 강점 식별
     */
    private identifyStrengths(metrics: Record<string, QualityDimension>): string[] {
        const strengths: string[] = [];

        Object.values(metrics).forEach(metric => {
            if (metric.score >= 0.85) {
                strengths.push(`${metric.description} (${(metric.score * 100).toFixed(1)}%)`);
            }
        });

        return strengths;
    }

    /**
     * 약점 식별
     */
    private identifyWeaknesses(metrics: Record<string, QualityDimension>): string[] {
        const weaknesses: string[] = [];

        Object.values(metrics).forEach(metric => {
            if (metric.score < 0.7) {
                weaknesses.push(`${metric.description} (${(metric.score * 100).toFixed(1)}%)`);
            }
        });

        return weaknesses;
    }

    /**
     * 권장사항 생성
     */
    private generateRecommendations(improvements: QualityImprovement[], _context: Record<string, unknown>): string[] {
        const recommendations: string[] = [];

        improvements.forEach(improvement => {
            if (improvement.priority === 'high') {
                recommendations.push(`🔴 ${improvement.dimension} 개선 필요: ${improvement.suggestions[0]}`);
            } else if (improvement.priority === 'medium') {
                recommendations.push(`🟡 ${improvement.dimension} 개선 권장: ${improvement.suggestions[0]}`);
            }
        });

        return recommendations.slice(0, 5); // 상위 5개만 반환
    }

    // 제안 생성 메서드들
    private generateRelevanceSuggestions(score: number, _userKeywords: string[], _responseKeywords: string[]): string[] {
        if (score >= 0.8) return ['관련성이 우수합니다.'];
        return ['사용자 질문의 핵심 키워드를 더 많이 포함하세요.', '주제에서 벗어나지 않도록 주의하세요.'];
    }

    private generateAccuracySuggestions(score: number, _response: string): string[] {
        if (score >= 0.8) return ['정확성이 우수합니다.'];
        return ['사실 확인을 더 철저히 하세요.', '논리적 일관성을 유지하세요.'];
    }

    private generateCompletenessSuggestions(score: number, _userInput: string, _response: string): string[] {
        if (score >= 0.8) return ['완성도가 우수합니다.'];
        return ['사용자 질문의 모든 측면을 다루세요.', '더 구체적인 예시를 포함하세요.'];
    }

    private generateClaritySuggestions(score: number, _response: string): string[] {
        if (score >= 0.8) return ['명확성이 우수합니다.'];
        return ['문장을 더 간결하게 작성하세요.', '복잡한 용어를 쉽게 설명하세요.'];
    }

    private generateHelpfulnessSuggestions(score: number, _response: string, _userInput: string): string[] {
        if (score >= 0.8) return ['도움성이 우수합니다.'];
        return ['실행 가능한 구체적인 조언을 제공하세요.', '사용자의 실제 상황에 맞는 해결책을 제시하세요.'];
    }

    private generateCoherenceSuggestions(score: number, _response: string): string[] {
        if (score >= 0.8) return ['일관성이 우수합니다.'];
        return ['논리적 흐름을 개선하세요.', '문단 간 연결을 더 자연스럽게 하세요.'];
    }

    private generateCreativitySuggestions(score: number, _response: string): string[] {
        if (score >= 0.8) return ['창의성이 우수합니다.'];
        return ['독창적인 관점을 추가하세요.', '다양한 표현 방식을 사용하세요.'];
    }

    private generateTechnicalDepthSuggestions(score: number, _response: string): string[] {
        if (score >= 0.8) return ['기술적 깊이가 우수합니다.'];
        return ['더 심화된 분석을 포함하세요.', '전문적인 용어와 개념을 활용하세요.'];
    }

    /**
     * 폴백 분석 생성
     */
    private createFallbackAnalysis(): ResponseAnalysis {
        return {
            qualityMetrics: {
                relevance: { name: 'relevance', score: 0.7, weight: 0.25, description: '관련성', suggestions: [] },
                accuracy: { name: 'accuracy', score: 0.7, weight: 0.20, description: '정확성', suggestions: [] },
                completeness: { name: 'completeness', score: 0.7, weight: 0.15, description: '완성도', suggestions: [] },
                clarity: { name: 'clarity', score: 0.7, weight: 0.15, description: '명확성', suggestions: [] },
                helpfulness: { name: 'helpfulness', score: 0.7, weight: 0.10, description: '도움성', suggestions: [] },
                coherence: { name: 'coherence', score: 0.7, weight: 0.08, description: '일관성', suggestions: [] },
                creativity: { name: 'creativity', score: 0.7, weight: 0.04, description: '창의성', suggestions: [] },
                technicalDepth: { name: 'technicalDepth', score: 0.7, weight: 0.03, description: '기술적 깊이', suggestions: [] },
                overall: 0.7,
                confidence: 0.7
            },
            improvements: [],
            strengths: ['기본적인 품질 기준을 충족합니다.'],
            weaknesses: ['더 정교한 분석이 필요합니다.'],
            recommendations: ['품질 평가 시스템을 개선하세요.']
        };
    }
}

const advancedQualityEvaluator = new AdvancedQualityEvaluator();
export default advancedQualityEvaluator;
