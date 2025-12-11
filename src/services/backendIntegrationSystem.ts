/**
 * 🔗 백엔드 통합 시스템
 * 백엔드의 모든 기능을 답변 생성에 활용하는 통합 시스템
 */

export interface BackendService {
    name: string;
    endpoint: string;
    description: string;
    inputFormat: any;
    outputFormat: any;
    capabilities: string[];
}

export interface IntegratedBackendResponse {
    serviceResults: Map<string, any>;
    combinedInsights: string[];
    dataAnalysis: any;
    recommendations: string[];
    confidence: number;
}

export class BackendIntegrationSystem {
    private availableServices: Map<string, BackendService> = new Map();
    private serviceEndpoints: Map<string, string> = new Map();
    private cacheResults: Map<string, any> = new Map();

    constructor() {
        this.initializeBackendServices();
    }

    /**
     * 🚀 백엔드 서비스 통합 호출
     */
    async integrateBackendServices(
        userQuery: string,
        context: any,
        requiredServices?: string[]
    ): Promise<IntegratedBackendResponse> {
        console.log('🔗 백엔드 서비스 통합 시작');

        const relevantServices = requiredServices || this.identifyRelevantServices(userQuery, context);
        const serviceResults = new Map<string, any>();
        const promises = [];

        // 병렬로 여러 백엔드 서비스 호출
        for (const serviceName of relevantServices) {
            const service = this.availableServices.get(serviceName);
            if (service) {
                promises.push(this.callBackendService(service, userQuery, context));
            }
        }

        try {
            const results = await Promise.allSettled(promises);

            results.forEach((result, index) => {
                const serviceName = relevantServices[index];
                if (result.status === 'fulfilled') {
                    serviceResults.set(serviceName, result.value);
                } else {
                    console.warn(`서비스 ${serviceName} 호출 실패:`, result.reason);
                    serviceResults.set(serviceName, { error: result.reason, fallback: true });
                }
            });

            // 결과 통합 및 분석
            const combinedInsights = await this.combineServiceInsights(serviceResults, userQuery);
            const dataAnalysis = await this.performCrossServiceAnalysis(serviceResults);
            const recommendations = await this.generateIntegratedRecommendations(serviceResults, context);

            return {
                serviceResults,
                combinedInsights,
                dataAnalysis,
                recommendations,
                confidence: this.calculateIntegrationConfidence(serviceResults)
            };

        } catch (error) {
            console.error('백엔드 통합 오류:', error);
            return {
                serviceResults: new Map(),
                combinedInsights: ['백엔드 서비스 연동 중 일부 문제가 발생했습니다.'],
                dataAnalysis: {},
                recommendations: ['기본 추천사항을 제공합니다.'],
                confidence: 0.3
            };
        }
    }

    /**
     * 🎯 관련 서비스 식별
     */
    private identifyRelevantServices(userQuery: string, context: any): string[] {
        const queryLower = userQuery.toLowerCase();
        const relevantServices = [];

        // 텍스트 분석이 필요한 경우
        if (queryLower.includes('분석') || queryLower.includes('요약') || queryLower.includes('감정')) {
            relevantServices.push('textAnalysis', 'sentimentAnalysis', 'summarization');
        }

        // 코드 관련 질문
        if (queryLower.includes('코드') || queryLower.includes('프로그래밍') || queryLower.includes('버그')) {
            relevantServices.push('codeAnalysis', 'codeReview', 'bugDetection');
        }

        // 데이터 분석 요청
        if (queryLower.includes('데이터') || queryLower.includes('통계') || queryLower.includes('차트')) {
            relevantServices.push('dataAnalytics', 'visualization', 'statisticalAnalysis');
        }

        // 문서 처리
        if (queryLower.includes('문서') || queryLower.includes('파일') || queryLower.includes('변환')) {
            relevantServices.push('documentProcessing', 'fileAnalysis', 'contentExtraction');
        }

        // 학습 및 추천
        if (queryLower.includes('학습') || queryLower.includes('추천') || queryLower.includes('제안')) {
            relevantServices.push('learningAnalytics', 'recommendationEngine', 'personalization');
        }

        // 성능 분석
        if (queryLower.includes('성능') || queryLower.includes('최적화') || queryLower.includes('속도')) {
            relevantServices.push('performanceAnalysis', 'optimization', 'monitoring');
        }

        // 기본 서비스들
        if (relevantServices.length === 0) {
            relevantServices.push('generalAnalysis', 'contextualUnderstanding');
        }

        return relevantServices.filter(service => this.availableServices.has(service));
    }

    /**
     * 📞 백엔드 서비스 호출
     */
    private async callBackendService(service: BackendService, query: string, context: any): Promise<any> {
        const cacheKey = `${service.name}_${this.generateCacheKey(query, context)}`;

        // 캐시 확인
        if (this.cacheResults.has(cacheKey)) {
            console.log(`캐시에서 ${service.name} 결과 반환`);
            return this.cacheResults.get(cacheKey);
        }

        const requestData = this.formatServiceRequest(service, query, context);

        try {
            const response = await fetch(service.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            // 결과 캐시
            this.cacheResults.set(cacheKey, result);

            return result;

        } catch (error) {
            console.error(`${service.name} 서비스 호출 오류:`, error);

            // 폴백 응답 생성
            return this.generateFallbackResponse(service, query, context);
        }
    }

    /**
     * 🧠 서비스 인사이트 통합
     */
    private async combineServiceInsights(serviceResults: Map<string, any>, userQuery: string): Promise<string[]> {
        const insights = [];

        for (const [serviceName, result] of serviceResults.entries()) {
            if (result.error) continue;

            switch (serviceName) {
                case 'textAnalysis':
                    if (result.keywords) {
                        insights.push(`핵심 키워드: ${result.keywords.slice(0, 5).join(', ')}`);
                    }
                    if (result.topics) {
                        insights.push(`주요 주제: ${result.topics.slice(0, 3).join(', ')}`);
                    }
                    break;

                case 'sentimentAnalysis':
                    if (result.sentiment) {
                        const sentimentMap: Record<string, string> = {
                            positive: '긍정적',
                            negative: '부정적',
                            neutral: '중립적'
                        };
                        const sentimentText = sentimentMap[result.sentiment] || result.sentiment;
                        insights.push(`감정 분석: ${sentimentText} (신뢰도: ${Math.round(result.confidence * 100)}%)`);
                    }
                    break;

                case 'codeAnalysis':
                    if (result.codeQuality) {
                        insights.push(`코드 품질 점수: ${result.codeQuality.overall}/100`);
                    }
                    if (result.suggestions && result.suggestions.length > 0) {
                        insights.push(`개선 제안: ${result.suggestions.length}개 항목`);
                    }
                    break;

                case 'dataAnalytics':
                    if (result.patterns) {
                        insights.push(`데이터 패턴: ${result.patterns.length}개 발견`);
                    }
                    if (result.trends) {
                        insights.push(`트렌드 분석: ${result.trends.direction} 추세`);
                    }
                    break;

                case 'learningAnalytics':
                    if (result.learningPath) {
                        insights.push(`추천 학습 경로: ${result.learningPath.length}단계`);
                    }
                    if (result.skillGaps) {
                        insights.push(`부족한 스킬: ${result.skillGaps.slice(0, 3).join(', ')}`);
                    }
                    break;
            }
        }

        return insights;
    }

    /**
     * 📊 교차 서비스 분석
     */
    private async performCrossServiceAnalysis(serviceResults: Map<string, any>): Promise<any> {
        const analysis: {
            correlations: any[];
            conflicts: any[];
            synergies: any[];
            overallInsights: string[];
        } = {
            correlations: [],
            conflicts: [],
            synergies: [],
            overallInsights: []
        };

        const resultArray = Array.from(serviceResults.entries());

        // 서비스 간 상관관계 분석
        for (let i = 0; i < resultArray.length; i++) {
            for (let j = i + 1; j < resultArray.length; j++) {
                const [service1, result1] = resultArray[i];
                const [service2, result2] = resultArray[j];

                const correlation = this.analyzeServiceCorrelation(service1, result1, service2, result2);
                if (correlation) {
                    (analysis.correlations as any[]).push(correlation);
                }
            }
        }

        // 전체적인 인사이트 도출
        if (serviceResults.has('textAnalysis') && serviceResults.has('sentimentAnalysis')) {
            const textResult = serviceResults.get('textAnalysis');
            const sentimentResult = serviceResults.get('sentimentAnalysis');

            analysis.overallInsights.push(
                `텍스트 분석과 감정 분석을 종합하면, ${sentimentResult.sentiment} 감정으로 ${textResult.topics?.[0] || '주제'}에 대해 논의하고 있습니다.`
            );
        }

        return analysis;
    }

    /**
     * 🎯 통합 추천사항 생성
     */
    private async generateIntegratedRecommendations(serviceResults: Map<string, any>, context: any): Promise<string[]> {
        const recommendations = [];

        // 코드 분석 결과 기반 추천
        if (serviceResults.has('codeAnalysis')) {
            const codeResult = serviceResults.get('codeAnalysis');
            if (codeResult.suggestions) {
                recommendations.push(...codeResult.suggestions.slice(0, 3).map((s: string) => `코드 개선: ${s}`));
            }
        }

        // 학습 분석 결과 기반 추천
        if (serviceResults.has('learningAnalytics')) {
            const learningResult = serviceResults.get('learningAnalytics');
            if (learningResult.recommendations) {
                recommendations.push(...learningResult.recommendations.slice(0, 2).map((r: string) => `학습 추천: ${r}`));
            }
        }

        // 성능 분석 결과 기반 추천
        if (serviceResults.has('performanceAnalysis')) {
            const perfResult = serviceResults.get('performanceAnalysis');
            if (perfResult.optimizations) {
                recommendations.push(...perfResult.optimizations.slice(0, 2).map((o: string) => `성능 최적화: ${o}`));
            }
        }

        // 일반적인 추천사항
        if (recommendations.length === 0) {
            recommendations.push(
                '더 구체적인 정보를 제공하시면 맞춤형 추천을 제공할 수 있습니다.',
                '관련 문서나 코드를 첨부하시면 더 정확한 분석이 가능합니다.'
            );
        }

        return recommendations;
    }

    /**
     * 🔧 유틸리티 메서드들
     */
    private formatServiceRequest(service: BackendService, query: string, context: any): any {
        const baseRequest = {
            query,
            timestamp: new Date().toISOString(),
            context: {
                userProfile: context.userProfile || {},
                conversationHistory: context.conversationHistory || [],
                projectInfo: context.projectContext || {}
            }
        };

        // 서비스별 특화 요청 형식
        switch (service.name) {
            case 'textAnalysis':
                return {
                    ...baseRequest,
                    text: query,
                    analysisType: ['keywords', 'topics', 'entities'],
                    language: 'ko'
                };

            case 'codeAnalysis':
                return {
                    ...baseRequest,
                    code: context.fileContent || '',
                    language: context.programmingLanguage || 'javascript',
                    analysisLevel: 'comprehensive'
                };

            case 'dataAnalytics':
                return {
                    ...baseRequest,
                    data: context.data || [],
                    analysisType: ['patterns', 'trends', 'anomalies']
                };

            default:
                return baseRequest;
        }
    }

    private generateCacheKey(query: string, context: any): string {
        const contextString = JSON.stringify({
            userProfile: context.userProfile?.expertise || 'unknown',
            hasFiles: !!context.fileContent,
            projectType: context.projectContext?.type || 'general'
        });

        return btoa(query.substring(0, 100) + contextString).substring(0, 32);
    }

    private analyzeServiceCorrelation(service1: string, result1: any, service2: string, result2: any): any {
        // 서비스 간 상관관계 분석 로직
        if (service1 === 'textAnalysis' && service2 === 'sentimentAnalysis') {
            if (result1.topics && result2.sentiment) {
                return {
                    services: [service1, service2],
                    correlation: '텍스트 주제와 감정이 일치하는 패턴',
                    strength: 0.8
                };
            }
        }

        if (service1 === 'codeAnalysis' && service2 === 'performanceAnalysis') {
            return {
                services: [service1, service2],
                correlation: '코드 품질과 성능 지표 연관성',
                strength: 0.7
            };
        }

        return null;
    }

    private calculateIntegrationConfidence(serviceResults: Map<string, any>): number {
        const totalServices = serviceResults.size;
        let successfulServices = 0;
        let totalConfidence = 0;

        for (const [serviceName, result] of serviceResults.entries()) {
            if (!result.error) {
                successfulServices++;
                totalConfidence += result.confidence || 0.7;
            }
        }

        if (successfulServices === 0) return 0.3;

        const avgConfidence = totalConfidence / successfulServices;
        const successRate = successfulServices / totalServices;

        return avgConfidence * successRate;
    }

    private generateFallbackResponse(service: BackendService, query: string, context: any): any {
        return {
            service: service.name,
            status: 'fallback',
            message: `${service.description} 서비스를 사용할 수 없어 기본 응답을 제공합니다.`,
            confidence: 0.3,
            suggestions: [`${service.name} 서비스를 다시 시도해보세요.`]
        };
    }

    /**
     * 🏗️ 백엔드 서비스 초기화
     */
    private initializeBackendServices(): void {
        // 텍스트 분석 서비스
        this.availableServices.set('textAnalysis', {
            name: 'textAnalysis',
            endpoint: 'http://localhost:8003/api/text/analyze',
            description: '텍스트 키워드, 주제, 엔티티 분석',
            inputFormat: { text: 'string', language: 'string' },
            outputFormat: { keywords: 'array', topics: 'array', entities: 'array' },
            capabilities: ['keyword_extraction', 'topic_modeling', 'entity_recognition']
        });

        // 감정 분석 서비스
        this.availableServices.set('sentimentAnalysis', {
            name: 'sentimentAnalysis',
            endpoint: 'http://localhost:8003/api/sentiment/analyze',
            description: '텍스트 감정 분석',
            inputFormat: { text: 'string' },
            outputFormat: { sentiment: 'string', confidence: 'number', emotions: 'array' },
            capabilities: ['sentiment_detection', 'emotion_analysis']
        });

        // 코드 분석 서비스
        this.availableServices.set('codeAnalysis', {
            name: 'codeAnalysis',
            endpoint: 'http://localhost:8003/api/code/analyze',
            description: '코드 품질 분석 및 리뷰',
            inputFormat: { code: 'string', language: 'string' },
            outputFormat: { quality: 'object', suggestions: 'array', metrics: 'object' },
            capabilities: ['quality_analysis', 'bug_detection', 'optimization_suggestions']
        });

        // 데이터 분석 서비스
        this.availableServices.set('dataAnalytics', {
            name: 'dataAnalytics',
            endpoint: 'http://localhost:8003/api/data/analyze',
            description: '데이터 패턴 및 트렌드 분석',
            inputFormat: { data: 'array', analysisType: 'array' },
            outputFormat: { patterns: 'array', trends: 'object', statistics: 'object' },
            capabilities: ['pattern_detection', 'trend_analysis', 'statistical_analysis']
        });

        // 학습 분석 서비스
        this.availableServices.set('learningAnalytics', {
            name: 'learningAnalytics',
            endpoint: 'http://localhost:8003/api/learning/analyze',
            description: '학습 패턴 분석 및 추천',
            inputFormat: { userProfile: 'object', learningHistory: 'array' },
            outputFormat: { recommendations: 'array', skillGaps: 'array', learningPath: 'array' },
            capabilities: ['skill_assessment', 'learning_path_recommendation', 'progress_tracking']
        });

        // 성능 분석 서비스
        this.availableServices.set('performanceAnalysis', {
            name: 'performanceAnalysis',
            endpoint: 'http://localhost:8003/api/performance/analyze',
            description: '시스템 성능 분석 및 최적화',
            inputFormat: { metrics: 'object', code: 'string' },
            outputFormat: { performance: 'object', bottlenecks: 'array', optimizations: 'array' },
            capabilities: ['performance_monitoring', 'bottleneck_detection', 'optimization_recommendations']
        });

        // 문서 처리 서비스
        this.availableServices.set('documentProcessing', {
            name: 'documentProcessing',
            endpoint: 'http://localhost:8003/api/document/process',
            description: '문서 내용 추출 및 분석',
            inputFormat: { document: 'file', extractionType: 'string' },
            outputFormat: { content: 'string', metadata: 'object', structure: 'object' },
            capabilities: ['content_extraction', 'document_analysis', 'structure_detection']
        });

        // 추천 엔진 서비스
        this.availableServices.set('recommendationEngine', {
            name: 'recommendationEngine',
            endpoint: 'http://localhost:8003/api/recommendations',
            description: '개인화된 추천 시스템',
            inputFormat: { userProfile: 'object', context: 'object' },
            outputFormat: { recommendations: 'array', reasoning: 'array', confidence: 'number' },
            capabilities: ['personalized_recommendations', 'collaborative_filtering', 'content_based_filtering']
        });

        console.log(`🔗 ${this.availableServices.size}개의 백엔드 서비스 초기화 완료`);
    }

    /**
     * 📋 사용 가능한 서비스 목록 반환
     */
    getAvailableServices(): BackendService[] {
        return Array.from(this.availableServices.values());
    }

    /**
     * 🧹 캐시 정리
     */
    clearCache(): void {
        this.cacheResults.clear();
        console.log('백엔드 서비스 캐시 정리 완료');
    }
}

export default BackendIntegrationSystem;
