import { NLPAnalysisResult } from './advancedNLPEngine';

export interface SearchResult {
    id: string;
    title: string;
    url: string;
    snippet: string;
    content: string;
    relevance_score: number;
    source_type: 'web' | 'documentation' | 'stackoverflow' | 'github' | 'news' | 'academic';
    timestamp: Date;
    language: string;
    credibility_score: number;
    metadata: SearchMetadata;
}

export interface SearchMetadata {
    domain: string;
    author?: string;
    publish_date?: Date;
    last_updated?: Date;
    tags: string[];
    reading_time: number;
    complexity_level: number;
}

export interface SearchQuery {
    original_query: string;
    processed_query: string;
    search_type: 'general' | 'technical' | 'news' | 'academic' | 'code' | 'documentation';
    filters: SearchFilters;
    context: SearchContext;
}

export interface SearchFilters {
    language?: string;
    date_range?: {
        start: Date;
        end: Date;
    };
    source_types?: string[];
    domains?: string[];
    min_credibility?: number;
}

export interface SearchContext {
    user_intent: string;
    domain: string;
    expertise_level: string;
    previous_searches: string[];
    conversation_context: string[];
}

export interface IntegratedResponse {
    primary_answer: string;
    supporting_evidence: SearchResult[];
    related_topics: string[];
    follow_up_questions: string[];
    confidence_score: number;
    sources_used: number;
    synthesis_quality: number;
}

class WebSearchIntegrationService {
    private searchCache: Map<string, SearchResult[]> = new Map();
    private credibilityScores: Map<string, number> = new Map();
    private searchHistory: SearchQuery[] = [];

    constructor() {
        this.initializeCredibilityScores();
    }

    // 통합 검색 및 응답 생성
    async searchAndSynthesize(
        query: string,
        nlpAnalysis: NLPAnalysisResult,
        context?: any
    ): Promise<IntegratedResponse> {
        // 검색 쿼리 최적화
        const searchQuery = await this.optimizeSearchQuery(query, nlpAnalysis, context);

        // 다중 소스 검색
        const searchResults = await this.performMultiSourceSearch(searchQuery);

        // 결과 필터링 및 랭킹
        const rankedResults = await this.rankAndFilterResults(searchResults, searchQuery);

        // 정보 통합 및 합성
        const integratedResponse = await this.synthesizeResponse(
            rankedResults,
            searchQuery,
            nlpAnalysis
        );

        // 검색 기록 저장
        this.searchHistory.push(searchQuery);

        return integratedResponse;
    }

    // 검색 쿼리 최적화
    private async optimizeSearchQuery(
        query: string,
        nlpAnalysis: NLPAnalysisResult,
        context?: any
    ): Promise<SearchQuery> {
        let processedQuery = query;
        let searchType: SearchQuery['search_type'] = 'general';

        // 의도 기반 쿼리 최적화
        switch (nlpAnalysis.intent) {
            case 'question':
                processedQuery = this.optimizeQuestionQuery(query, nlpAnalysis);
                break;
            case 'problem_solving':
                processedQuery = this.optimizeProblemQuery(query, nlpAnalysis);
                searchType = 'technical';
                break;
            case 'learning':
                processedQuery = this.optimizeLearningQuery(query, nlpAnalysis);
                searchType = 'documentation';
                break;
            case 'analysis':
                searchType = 'academic';
                break;
        }

        // 도메인별 키워드 추가
        if (nlpAnalysis.context.domain !== 'general') {
            processedQuery = this.addDomainKeywords(processedQuery, nlpAnalysis.context.domain);
        }

        // 언어별 최적화
        if (nlpAnalysis.language === 'ko') {
            processedQuery = this.optimizeKoreanQuery(processedQuery);
        }

        const filters: SearchFilters = {
            language: nlpAnalysis.language,
            min_credibility: this.getMinCredibilityForExpertise(nlpAnalysis.context.user_expertise_level)
        };

        const searchContext: SearchContext = {
            user_intent: nlpAnalysis.intent,
            domain: nlpAnalysis.context.domain,
            expertise_level: nlpAnalysis.context.user_expertise_level,
            previous_searches: this.getRecentSearches(5),
            conversation_context: context?.conversation_history || []
        };

        return {
            original_query: query,
            processed_query: processedQuery,
            search_type: searchType,
            filters,
            context: searchContext
        };
    }

    // 질문 쿼리 최적화
    private optimizeQuestionQuery(query: string, nlpAnalysis: NLPAnalysisResult): string {
        let optimized = query;

        // "how to" 패턴 추가
        if (nlpAnalysis.language === 'ko') {
            if (!query.includes('방법') && !query.includes('어떻게')) {
                optimized = `${query} 방법`;
            }
        } else {
            if (!query.toLowerCase().includes('how to')) {
                optimized = `how to ${query}`;
            }
        }

        return optimized;
    }

    // 문제 해결 쿼리 최적화
    private optimizeProblemQuery(query: string, nlpAnalysis: NLPAnalysisResult): string {
        const errorKeywords = nlpAnalysis.entities
            .filter(entity => entity.label === 'programming_language' || entity.label === 'framework')
            .map(entity => entity.text);

        let optimized = query;

        if (errorKeywords.length > 0) {
            optimized = `${query} ${errorKeywords.join(' ')} solution fix`;
        }

        // Stack Overflow 검색에 최적화
        if (nlpAnalysis.language === 'en') {
            optimized += ' stackoverflow';
        }

        return optimized;
    }

    // 학습 쿼리 최적화
    private optimizeLearningQuery(query: string, nlpAnalysis: NLPAnalysisResult): string {
        let optimized = query;

        if (nlpAnalysis.language === 'ko') {
            optimized += ' 튜토리얼 가이드 설명';
        } else {
            optimized += ' tutorial guide documentation';
        }

        // 초보자를 위한 추가 키워드
        if (nlpAnalysis.context.user_expertise_level === 'beginner') {
            if (nlpAnalysis.language === 'ko') {
                optimized += ' 초보자 기초';
            } else {
                optimized += ' beginner basics';
            }
        }

        return optimized;
    }

    // 도메인 키워드 추가
    private addDomainKeywords(query: string, domain: string): string {
        const domainKeywords = {
            web_development: 'web development frontend backend',
            mobile_development: 'mobile app development iOS Android',
            data_science: 'data science machine learning AI',
            devops: 'devops deployment infrastructure cloud',
            database: 'database SQL NoSQL',
            security: 'cybersecurity security encryption',
            design: 'UI UX design interface'
        };

        const keywords = domainKeywords[domain as keyof typeof domainKeywords];
        return keywords ? `${query} ${keywords}` : query;
    }

    // 한국어 쿼리 최적화
    private optimizeKoreanQuery(query: string): string {
        // 한국어 검색에 최적화된 키워드 추가
        const koreanOptimizations = {
            '방법': 'how to',
            '오류': 'error fix',
            '설치': 'install setup',
            '사용법': 'usage tutorial',
            '예제': 'example sample'
        };

        let optimized = query;
        for (const [korean, english] of Object.entries(koreanOptimizations)) {
            if (query.includes(korean)) {
                optimized += ` ${english}`;
            }
        }

        return optimized;
    }

    // 다중 소스 검색
    private async performMultiSourceSearch(searchQuery: SearchQuery): Promise<SearchResult[]> {
        const results: SearchResult[] = [];

        // 캐시 확인
        const cacheKey = this.generateCacheKey(searchQuery);
        const cachedResults = this.searchCache.get(cacheKey);
        if (cachedResults) {
            return cachedResults;
        }

        try {
            // 병렬 검색 실행
            const searchPromises = [
                this.searchWeb(searchQuery),
                this.searchStackOverflow(searchQuery),
                this.searchGitHub(searchQuery),
                this.searchDocumentation(searchQuery),
                this.searchNews(searchQuery)
            ];

            const searchResultArrays = await Promise.allSettled(searchPromises);

            searchResultArrays.forEach(result => {
                if (result.status === 'fulfilled') {
                    results.push(...result.value);
                }
            });

            // 캐시 저장 (1시간)
            this.searchCache.set(cacheKey, results);
            setTimeout(() => this.searchCache.delete(cacheKey), 60 * 60 * 1000);

            return results;
        } catch (error) {
            console.error('Multi-source search error:', error);
            return this.getFallbackResults(searchQuery);
        }
    }

    // 웹 검색 (시뮬레이션)
    private async searchWeb(searchQuery: SearchQuery): Promise<SearchResult[]> {
        // 실제 구현에서는 Google Search API, Bing API 등을 사용
        return this.generateMockResults(searchQuery, 'web', 5);
    }

    // Stack Overflow 검색 (시뮬레이션)
    private async searchStackOverflow(searchQuery: SearchQuery): Promise<SearchResult[]> {
        if (searchQuery.search_type === 'technical' || searchQuery.context.domain.includes('development')) {
            return this.generateMockResults(searchQuery, 'stackoverflow', 3);
        }
        return [];
    }

    // GitHub 검색 (시뮬레이션)
    private async searchGitHub(searchQuery: SearchQuery): Promise<SearchResult[]> {
        if (searchQuery.search_type === 'code' || searchQuery.processed_query.includes('example')) {
            return this.generateMockResults(searchQuery, 'github', 2);
        }
        return [];
    }

    // 문서 검색 (시뮬레이션)
    private async searchDocumentation(searchQuery: SearchQuery): Promise<SearchResult[]> {
        if (searchQuery.search_type === 'documentation' || searchQuery.context.user_intent === 'learning') {
            return this.generateMockResults(searchQuery, 'documentation', 3);
        }
        return [];
    }

    // 뉴스 검색 (시뮬레이션)
    private async searchNews(searchQuery: SearchQuery): Promise<SearchResult[]> {
        if (searchQuery.search_type === 'news' || searchQuery.processed_query.includes('latest')) {
            return this.generateMockResults(searchQuery, 'news', 2);
        }
        return [];
    }

    // 모의 결과 생성
    private generateMockResults(
        searchQuery: SearchQuery,
        sourceType: SearchResult['source_type'],
        count: number
    ): SearchResult[] {
        const results: SearchResult[] = [];

        for (let i = 0; i < count; i++) {
            const result: SearchResult = {
                id: `${sourceType}-${Date.now()}-${i}`,
                title: this.generateMockTitle(searchQuery, sourceType),
                url: this.generateMockUrl(sourceType),
                snippet: this.generateMockSnippet(searchQuery, sourceType),
                content: this.generateMockContent(searchQuery, sourceType),
                relevance_score: 0.7 + Math.random() * 0.3,
                source_type: sourceType,
                timestamp: new Date(),
                language: searchQuery.filters.language || 'en',
                credibility_score: this.getCredibilityScore(sourceType),
                metadata: {
                    domain: this.getDomainForSourceType(sourceType),
                    tags: searchQuery.context.conversation_context.slice(0, 3),
                    reading_time: Math.floor(Math.random() * 10) + 2,
                    complexity_level: this.getComplexityForExpertise(searchQuery.context.expertise_level)
                }
            };

            results.push(result);
        }

        return results;
    }

    // 결과 랭킹 및 필터링
    private async rankAndFilterResults(
        results: SearchResult[],
        searchQuery: SearchQuery
    ): Promise<SearchResult[]> {
        // 신뢰도 필터링
        let filtered = results.filter(result =>
            result.credibility_score >= (searchQuery.filters.min_credibility || 0.5)
        );

        // 관련성 점수 계산
        filtered = filtered.map(result => ({
            ...result,
            relevance_score: this.calculateRelevanceScore(result, searchQuery)
        }));

        // 랭킹 정렬
        filtered.sort((a, b) => {
            const scoreA = (a.relevance_score * 0.7) + (a.credibility_score * 0.3);
            const scoreB = (b.relevance_score * 0.7) + (b.credibility_score * 0.3);
            return scoreB - scoreA;
        });

        // 상위 10개 결과만 반환
        return filtered.slice(0, 10);
    }

    // 관련성 점수 계산
    private calculateRelevanceScore(result: SearchResult, searchQuery: SearchQuery): number {
        let score = result.relevance_score;

        // 키워드 매칭
        const queryKeywords = searchQuery.processed_query.toLowerCase().split(' ');
        const contentKeywords = (result.title + ' ' + result.snippet).toLowerCase();

        const matchingKeywords = queryKeywords.filter(keyword =>
            contentKeywords.includes(keyword)
        ).length;

        score += (matchingKeywords / queryKeywords.length) * 0.3;

        // 소스 타입 보너스
        const sourceTypeBonus = {
            'stackoverflow': searchQuery.search_type === 'technical' ? 0.2 : 0,
            'documentation': searchQuery.search_type === 'documentation' ? 0.2 : 0,
            'github': searchQuery.search_type === 'code' ? 0.2 : 0,
            'academic': searchQuery.search_type === 'academic' ? 0.2 : 0,
            'news': searchQuery.search_type === 'news' ? 0.2 : 0,
            'web': 0.1
        };

        score += sourceTypeBonus[result.source_type] || 0;

        return Math.min(1.0, score);
    }

    // 응답 합성
    private async synthesizeResponse(
        results: SearchResult[],
        searchQuery: SearchQuery,
        nlpAnalysis: NLPAnalysisResult
    ): Promise<IntegratedResponse> {
        if (results.length === 0) {
            return this.generateFallbackResponse(searchQuery);
        }

        // 주요 답변 생성
        const primaryAnswer = await this.generatePrimaryAnswer(results, searchQuery, nlpAnalysis);

        // 지원 증거 선별
        const supportingEvidence = results.slice(0, 5);

        // 관련 주제 추출
        const relatedTopics = this.extractRelatedTopics(results);

        // 후속 질문 생성
        const followUpQuestions = this.generateFollowUpQuestions(searchQuery, nlpAnalysis);

        // 신뢰도 점수 계산
        const confidenceScore = this.calculateConfidenceScore(results, searchQuery);

        return {
            primary_answer: primaryAnswer,
            supporting_evidence: supportingEvidence,
            related_topics: relatedTopics,
            follow_up_questions: followUpQuestions,
            confidence_score: confidenceScore,
            sources_used: results.length,
            synthesis_quality: this.calculateSynthesisQuality(results, primaryAnswer)
        };
    }

    // 주요 답변 생성
    private async generatePrimaryAnswer(
        results: SearchResult[],
        searchQuery: SearchQuery,
        nlpAnalysis: NLPAnalysisResult
    ): Promise<string> {
        const topResults = results.slice(0, 3);
        const combinedContent = topResults.map(r => r.snippet).join(' ');

        // 응답 전략에 따른 답변 생성
        const strategy = nlpAnalysis.response_strategy;

        let answer = '';

        if (strategy.detail_level === 'brief') {
            answer = this.generateBriefAnswer(combinedContent, searchQuery);
        } else if (strategy.detail_level === 'detailed') {
            answer = this.generateDetailedAnswer(combinedContent, searchQuery, strategy);
        } else {
            answer = this.generateModerateAnswer(combinedContent, searchQuery);
        }

        // 코드 예제 추가
        if (strategy.code_examples) {
            const codeExample = this.extractCodeExample(results);
            if (codeExample) {
                answer += `\n\n예제 코드:\n\`\`\`\n${codeExample}\n\`\`\``;
            }
        }

        return answer;
    }

    // 간단한 답변 생성
    private generateBriefAnswer(content: string, searchQuery: SearchQuery): string {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const relevantSentences = sentences
            .filter(sentence => this.isRelevantSentence(sentence, searchQuery))
            .slice(0, 2);

        return relevantSentences.join('. ') + '.';
    }

    // 상세한 답변 생성
    private generateDetailedAnswer(
        content: string,
        searchQuery: SearchQuery,
        strategy: any
    ): string {
        let answer = this.generateModerateAnswer(content, searchQuery);

        if (strategy.examples_needed) {
            answer += '\n\n구체적인 예시와 단계별 설명이 포함된 상세한 가이드를 제공해드리겠습니다.';
        }

        return answer;
    }

    // 보통 수준 답변 생성
    private generateModerateAnswer(content: string, searchQuery: SearchQuery): string {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const relevantSentences = sentences
            .filter(sentence => this.isRelevantSentence(sentence, searchQuery))
            .slice(0, 4);

        return relevantSentences.join('. ') + '.';
    }

    // 문장 관련성 확인
    private isRelevantSentence(sentence: string, searchQuery: SearchQuery): boolean {
        const queryKeywords = searchQuery.processed_query.toLowerCase().split(' ');
        const sentenceLower = sentence.toLowerCase();

        return queryKeywords.some(keyword => sentenceLower.includes(keyword));
    }

    // 코드 예제 추출
    private extractCodeExample(results: SearchResult[]): string | null {
        for (const result of results) {
            if (result.source_type === 'github' || result.source_type === 'stackoverflow') {
                // 간단한 코드 예제 생성 (실제로는 결과에서 추출)
                return `// ${result.title} 예제\nfunction example() {\n    console.log("Hello World");\n}`;
            }
        }
        return null;
    }

    // 관련 주제 추출
    private extractRelatedTopics(results: SearchResult[]): string[] {
        const topics = new Set<string>();

        results.forEach(result => {
            result.metadata.tags.forEach(tag => topics.add(tag));
        });

        return Array.from(topics).slice(0, 5);
    }

    // 후속 질문 생성
    private generateFollowUpQuestions(
        searchQuery: SearchQuery,
        nlpAnalysis: NLPAnalysisResult
    ): string[] {
        const questions: string[] = [];

        if (nlpAnalysis.language === 'ko') {
            questions.push(`${searchQuery.original_query}와 관련된 더 자세한 정보가 필요하신가요?`);
            questions.push(`다른 접근 방법이나 대안에 대해 알고 싶으신가요?`);
            questions.push(`실제 구현 예제를 보고 싶으신가요?`);
        } else {
            questions.push(`Would you like more detailed information about ${searchQuery.original_query}?`);
            questions.push(`Are you interested in alternative approaches or solutions?`);
            questions.push(`Would you like to see practical implementation examples?`);
        }

        return questions.slice(0, 3);
    }

    // 신뢰도 점수 계산
    private calculateConfidenceScore(results: SearchResult[], searchQuery: SearchQuery): number {
        if (results.length === 0) return 0.1;

        const avgCredibility = results.reduce((sum, r) => sum + r.credibility_score, 0) / results.length;
        const avgRelevance = results.reduce((sum, r) => sum + r.relevance_score, 0) / results.length;
        const sourceVariety = new Set(results.map(r => r.source_type)).size / 5; // 최대 5개 소스 타입

        return (avgCredibility * 0.4) + (avgRelevance * 0.4) + (sourceVariety * 0.2);
    }

    // 합성 품질 계산
    private calculateSynthesisQuality(results: SearchResult[], answer: string): number {
        const answerLength = answer.length;
        const optimalLength = 500; // 최적 답변 길이

        const lengthScore = Math.min(1.0, answerLength / optimalLength);
        const sourceScore = Math.min(1.0, results.length / 5);

        return (lengthScore * 0.6) + (sourceScore * 0.4);
    }

    // 유틸리티 메서드들
    private generateCacheKey(searchQuery: SearchQuery): string {
        return `${searchQuery.processed_query}-${searchQuery.search_type}-${JSON.stringify(searchQuery.filters)}`;
    }

    private getMinCredibilityForExpertise(expertise: string): number {
        const levels = {
            'beginner': 0.6,
            'intermediate': 0.7,
            'advanced': 0.8,
            'expert': 0.9
        };
        return levels[expertise as keyof typeof levels] || 0.7;
    }

    private getRecentSearches(count: number): string[] {
        return this.searchHistory
            .slice(-count)
            .map(search => search.original_query);
    }

    private initializeCredibilityScores(): void {
        this.credibilityScores.set('stackoverflow', 0.9);
        this.credibilityScores.set('github', 0.85);
        this.credibilityScores.set('documentation', 0.95);
        this.credibilityScores.set('academic', 0.9);
        this.credibilityScores.set('news', 0.7);
        this.credibilityScores.set('web', 0.6);
    }

    private getCredibilityScore(sourceType: string): number {
        return this.credibilityScores.get(sourceType) || 0.5;
    }

    private generateMockTitle(searchQuery: SearchQuery, sourceType: string): string {
        const titles = {
            web: `${searchQuery.processed_query} - 완전 가이드`,
            stackoverflow: `${searchQuery.processed_query} 해결 방법`,
            github: `${searchQuery.processed_query} 예제 코드`,
            documentation: `${searchQuery.processed_query} 공식 문서`,
            news: `${searchQuery.processed_query} 최신 뉴스`
        };
        return titles[sourceType as keyof typeof titles] || searchQuery.processed_query;
    }

    private generateMockUrl(sourceType: string): string {
        const domains = {
            web: 'https://example.com',
            stackoverflow: 'https://stackoverflow.com',
            github: 'https://github.com',
            documentation: 'https://docs.example.com',
            news: 'https://news.example.com'
        };
        return `${domains[sourceType as keyof typeof domains]}/search-result`;
    }

    private generateMockSnippet(searchQuery: SearchQuery, sourceType: string): string {
        return `${searchQuery.processed_query}에 대한 상세한 설명과 해결 방법을 제공합니다. 이 ${sourceType} 소스에서 찾은 정보는 신뢰할 수 있으며 실용적인 접근 방법을 제시합니다.`;
    }

    private generateMockContent(searchQuery: SearchQuery, sourceType: string): string {
        return `${searchQuery.processed_query}에 대한 포괄적인 내용입니다. 이 문서는 ${sourceType}에서 제공하는 고품질 정보로, 단계별 가이드와 실제 예제를 포함하고 있습니다.`;
    }

    private getDomainForSourceType(sourceType: string): string {
        const domains = {
            web: 'general',
            stackoverflow: 'programming',
            github: 'development',
            documentation: 'technical',
            news: 'current_events'
        };
        return domains[sourceType as keyof typeof domains] || 'general';
    }

    private getComplexityForExpertise(expertise: string): number {
        const levels = {
            'beginner': 3,
            'intermediate': 5,
            'advanced': 7,
            'expert': 9
        };
        return levels[expertise as keyof typeof levels] || 5;
    }

    private getFallbackResults(searchQuery: SearchQuery): SearchResult[] {
        return [{
            id: 'fallback-1',
            title: '검색 결과를 찾을 수 없습니다',
            url: '',
            snippet: '죄송합니다. 요청하신 검색어에 대한 결과를 찾을 수 없습니다.',
            content: '',
            relevance_score: 0.1,
            source_type: 'web',
            timestamp: new Date(),
            language: searchQuery.filters.language || 'ko',
            credibility_score: 0.1,
            metadata: {
                domain: 'general',
                tags: [],
                reading_time: 1,
                complexity_level: 1
            }
        }];
    }

    private generateFallbackResponse(searchQuery: SearchQuery): IntegratedResponse {
        return {
            primary_answer: '죄송합니다. 요청하신 정보에 대한 검색 결과를 찾을 수 없습니다. 다른 검색어로 다시 시도해보시거나, 더 구체적인 질문을 해주시기 바랍니다.',
            supporting_evidence: [],
            related_topics: [],
            follow_up_questions: [
                '다른 검색어로 다시 시도해보시겠어요?',
                '더 구체적인 질문이 있으신가요?'
            ],
            confidence_score: 0.1,
            sources_used: 0,
            synthesis_quality: 0.1
        };
    }

    // 공개 메서드들
    getSearchHistory(): SearchQuery[] {
        return this.searchHistory.slice(-20); // 최근 20개
    }

    clearSearchHistory(): void {
        this.searchHistory = [];
    }

    getSearchAnalytics(): any {
        return {
            total_searches: this.searchHistory.length,
            search_types: this.getSearchTypeDistribution(),
            domains: this.getDomainDistribution(),
            cache_hit_rate: this.calculateCacheHitRate()
        };
    }

    private getSearchTypeDistribution(): any {
        const distribution: { [key: string]: number } = {};
        this.searchHistory.forEach(search => {
            distribution[search.search_type] = (distribution[search.search_type] || 0) + 1;
        });
        return distribution;
    }

    private getDomainDistribution(): any {
        const distribution: { [key: string]: number } = {};
        this.searchHistory.forEach(search => {
            distribution[search.context.domain] = (distribution[search.context.domain] || 0) + 1;
        });
        return distribution;
    }

    private calculateCacheHitRate(): number {
        // 캐시 히트율 계산 (실제 구현에서는 캐시 히트 카운터 필요)
        return 0.75; // 75% 가정
    }
}

const webSearchIntegrationService = new WebSearchIntegrationService();
export default webSearchIntegrationService;
