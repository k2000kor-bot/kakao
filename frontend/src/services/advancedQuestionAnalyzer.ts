/**
 * 고도화된 질문 분석기
 * 복합적이고 다층적인 질문을 분해하고 각각의 요구사항을 파악하는 시스템
 */

import { coerceTrimmedString } from '../utils/chatInputUtils';

export interface QuestionComponent {
    id: string;
    type: 'primary' | 'secondary' | 'implicit' | 'conditional' | 'contextual';
    content: string;
    intent: string;
    priority: number; // 1-10
    dependencies: string[]; // 다른 컴포넌트 ID들
    expectedResponseType: 'factual' | 'analytical' | 'procedural' | 'comparative' | 'creative';
    complexity: number; // 1-10
    domain: string[];
    timeframe?: string;
    scope: 'narrow' | 'broad' | 'comprehensive';
}

export interface QuestionDecomposition {
    originalQuestion: string;
    components: QuestionComponent[];
    overallComplexity: number;
    estimatedResponseLength: 'short' | 'medium' | 'long' | 'comprehensive';
    requiredCapabilities: string[];
    suggestedApproach: string[];
    potentialChallenges: string[];
    executionOrder: string[]; // 컴포넌트 ID 순서
}

export interface MultiLayerAnalysis {
    surfaceLevel: {
        directQuestions: string[];
        explicitRequests: string[];
        obviousIntent: string;
    };
    deepLevel: {
        implicitNeeds: string[];
        underlyingConcerns: string[];
        hiddenAssumptions: string[];
        emotionalContext: string;
    };
    metaLevel: {
        questioningStrategy: string;
        cognitiveLoad: number;
        informationGaps: string[];
        biasIndicators: string[];
    };
}

export interface ResponseStrategy {
    structure: {
        introduction: string;
        mainSections: Array<{
            title: string;
            content: string;
            supportingEvidence: string[];
            visualElements?: string[];
        }>;
        conclusion: string;
        followUpSuggestions: string[];
    };
    tone: 'formal' | 'conversational' | 'technical' | 'educational' | 'persuasive';
    depth: 'surface' | 'moderate' | 'deep' | 'expert';
    interactivity: {
        clarificationQuestions: string[];
        engagementPoints: string[];
        feedbackRequests: string[];
    };
}

class AdvancedQuestionAnalyzer {
    private questionPatterns: Map<string, RegExp[]> = new Map();
    private intentMarkers: Map<string, string[]> = new Map();
    private complexityIndicators: Map<string, number> = new Map();
    private domainKeywords: Map<string, string[]> = new Map();

    constructor() {
        this.initializePatterns();
    }

    private initializePatterns(): void {
        // 질문 패턴 정의
        this.questionPatterns.set('compound', [
            /그리고|또한|그런데|그러면|만약|하지만|그러나|반면/,
            /첫째|둘째|셋째|마지막으로/,
            /한편|동시에|아울러|더불어/
        ]);

        this.questionPatterns.set('conditional', [
            /만약|만일|가정하면|경우에|상황에서/,
            /~라면|~한다면|~일 때/
        ]);

        this.questionPatterns.set('comparative', [
            /비교|대비|차이|유사|같은|다른/,
            /보다|더|덜|반면|한편|vs/,
            /장단점|pros and cons|어떤 것이 좋은지/
        ]);

        this.questionPatterns.set('sequential', [
            /순서|단계|과정|절차|방법/,
            /어떻게|how to|step by step/,
            /먼저|다음|그 후|마지막/
        ]);

        // 의도 마커
        this.intentMarkers.set('analysis', ['분석', '평가', '검토', '조사', '연구']);
        this.intentMarkers.set('comparison', ['비교', '대조', '차이', '유사점', '장단점']);
        this.intentMarkers.set('explanation', ['설명', '이해', '파악', '알고 싶다', '궁금하다']);
        this.intentMarkers.set('solution', ['해결', '방법', '대안', '개선', '조치']);
        this.intentMarkers.set('prediction', ['예측', '전망', '미래', '앞으로', '향후']);
        this.intentMarkers.set('evaluation', ['평가', '판단', '의견', '생각', '어떻게 생각']);

        // 복잡도 지표
        this.complexityIndicators.set('multiple_subjects', 2);
        this.complexityIndicators.set('conditional_logic', 3);
        this.complexityIndicators.set('temporal_aspects', 2);
        this.complexityIndicators.set('causal_relationships', 3);
        this.complexityIndicators.set('abstract_concepts', 4);
        this.complexityIndicators.set('interdisciplinary', 3);

        // 도메인 키워드
        this.domainKeywords.set('business', ['비즈니스', '사업', '경영', '마케팅', '전략', '수익', '투자']);
        this.domainKeywords.set('technology', ['기술', '시스템', '소프트웨어', '개발', 'AI', 'IT', '디지털']);
        this.domainKeywords.set('finance', ['금융', '투자', '주식', '경제', '재정', '자금', '은행']);
        this.domainKeywords.set('real_estate', ['부동산', '아파트', '주택', '건설', '하자', '원베일리', '분양']);
        this.domainKeywords.set('legal', ['법률', '법적', '소송', '계약', '규정', '조례', '판례', '형사', '형사수사기법', '수사기법']);
        this.domainKeywords.set('social', ['사회', '정치', '문화', '교육', '복지', '환경']);
    }

    /**
     * 복합적인 질문을 분해하고 각 구성요소를 분석
     */
    async decomposeQuestion(question: string): Promise<QuestionDecomposition> {
        // 1. 문장 분할 및 기본 구조 분석
        const sentences = this.segmentQuestion(question);
        
        // 2. 각 구성요소 식별
        const components = await this.identifyComponents(sentences, question);
        
        // 3. 의존성 분석
        this.analyzeDependencies(components);
        
        // 4. 실행 순서 결정
        const executionOrder = this.determineExecutionOrder(components);
        
        // 5. 전체 복잡도 계산
        const overallComplexity = this.calculateOverallComplexity(components);
        
        // 6. 응답 길이 추정
        const estimatedResponseLength = this.estimateResponseLength(components);
        
        // 7. 필요 역량 및 접근법 결정
        const requiredCapabilities = this.identifyRequiredCapabilities(components);
        const suggestedApproach = this.generateSuggestedApproach(components);
        const potentialChallenges = this.identifyPotentialChallenges(components);

        return {
            originalQuestion: question,
            components,
            overallComplexity,
            estimatedResponseLength,
            requiredCapabilities,
            suggestedApproach,
            potentialChallenges,
            executionOrder
        };
    }

    /**
     * 다층적 분석 수행
     */
    async performMultiLayerAnalysis(question: string): Promise<MultiLayerAnalysis> {
        const surfaceLevel = this.analyzeSurfaceLevel(question);
        const deepLevel = await this.analyzeDeepLevel(question);
        const metaLevel = this.analyzeMetaLevel(question);

        return {
            surfaceLevel,
            deepLevel,
            metaLevel
        };
    }

    /**
     * 응답 전략 생성
     */
    async generateResponseStrategy(
        decomposition: QuestionDecomposition,
        multiLayerAnalysis: MultiLayerAnalysis
    ): Promise<ResponseStrategy> {
        
        const structure = await this.designResponseStructure(decomposition, multiLayerAnalysis);
        const tone = this.determineTone(multiLayerAnalysis);
        const depth = this.determineDepth(decomposition);
        const interactivity = this.designInteractivity(decomposition, multiLayerAnalysis);

        return {
            structure,
            tone,
            depth,
            interactivity
        };
    }

    private segmentQuestion(question: string): string[] {
        // 복합 문장 분할
        const segments: string[] = [];
        
        // 접속사 기반 분할
        const conjunctions = ['그리고', '또한', '그런데', '그러면', '하지만', '그러나', '반면', '한편'];
        let currentSegment = question;
        
        conjunctions.forEach(conj => {
            if (currentSegment.includes(conj)) {
                const parts = currentSegment.split(conj);
                segments.push(
                  ...parts.map((part) => coerceTrimmedString(part, '')).filter((part) => part.length > 0)
                );
                currentSegment = '';
            }
        });
        
        if (currentSegment) {
            segments.push(currentSegment);
        }
        
        // 문장 부호 기반 추가 분할
        if (segments.length === 0) {
            segments.push(
              ...question.split(/[.!?]/).filter((s) => coerceTrimmedString(s, '').length > 0)
            );
        }

        return segments.length > 0 ? segments : [question];
    }

    private async identifyComponents(segments: string[], originalQuestion: string): Promise<QuestionComponent[]> {
        const components: QuestionComponent[] = [];
        
        segments.forEach((segment, index) => {
            const component = this.analyzeSegment(segment, index, originalQuestion);
            if (component) {
                components.push(component);
            }
        });

        // 암시적 구성요소 식별
        const implicitComponents = this.identifyImplicitComponents(originalQuestion, components);
        components.push(...implicitComponents);

        return components;
    }

    private analyzeSegment(segment: string, index: number, originalQuestion: string): QuestionComponent | null {
        const trimmed = coerceTrimmedString(segment, '');
        if (trimmed.length < 5) return null;

        const id = `component_${index + 1}`;
        const type = this.determineComponentType(trimmed, originalQuestion);
        const intent = this.extractIntent(trimmed);
        const priority = this.calculatePriority(trimmed, type);
        const expectedResponseType = this.determineResponseType(trimmed);
        const complexity = this.calculateComponentComplexity(trimmed);
        const domain = this.identifyDomains(trimmed);
        const timeframe = this.extractTimeframe(trimmed);
        const scope = this.determineScope(trimmed);

        return {
            id,
            type,
            content: trimmed,
            intent,
            priority,
            dependencies: [], // 나중에 분석
            expectedResponseType,
            complexity,
            domain,
            timeframe,
            scope
        };
    }

    private determineComponentType(segment: string, originalQuestion: string): QuestionComponent['type'] {
        const lowerSegment = segment.toLowerCase();
        
        // 조건부 질문
        if (this.questionPatterns.get('conditional')?.some(pattern => pattern.test(lowerSegment))) {
            return 'conditional';
        }
        
        // 맥락적 정보
        if (lowerSegment.includes('배경') || lowerSegment.includes('맥락') || lowerSegment.includes('상황')) {
            return 'contextual';
        }
        
        // 암시적 요구사항
        if (lowerSegment.includes('또한') || lowerSegment.includes('아울러')) {
            return 'implicit';
        }
        
        // 주요 질문인지 판단
        const questionWords = ['무엇', '어떻게', '왜', '언제', '어디서', '누가'];
        const hasQuestionWord = questionWords.some(word => lowerSegment.includes(word));
        const isFirstSegment = originalQuestion.toLowerCase().indexOf(lowerSegment) < originalQuestion.length * 0.3;
        
        if (hasQuestionWord && isFirstSegment) {
            return 'primary';
        }
        
        return 'secondary';
    }

    private extractIntent(segment: string): string {
        const lowerSegment = segment.toLowerCase();
        
        for (const [intent, markers] of Array.from(this.intentMarkers.entries())) {
            if (markers.some((marker: string) => lowerSegment.includes(marker))) {
                return intent;
            }
        }
        
        // 기본 의도 추론
        if (lowerSegment.includes('?') || lowerSegment.includes('궁금')) {
            return 'information_seeking';
        }
        
        return 'general_inquiry';
    }

    private calculatePriority(segment: string, type: QuestionComponent['type']): number {
        let priority = 5; // 기본값
        
        // 타입별 우선순위
        switch (type) {
            case 'primary': priority = 9; break;
            case 'secondary': priority = 6; break;
            case 'conditional': priority = 4; break;
            case 'contextual': priority = 3; break;
            case 'implicit': priority = 7; break;
        }
        
        // 긴급성 키워드
        const urgencyWords = ['긴급', '즉시', '빨리', '당장', '지금'];
        if (urgencyWords.some(word => segment.includes(word))) {
            priority += 2;
        }
        
        // 중요성 키워드
        const importanceWords = ['중요', '핵심', '필수', '반드시', '꼭'];
        if (importanceWords.some(word => segment.includes(word))) {
            priority += 1;
        }
        
        return Math.min(priority, 10);
    }

    private determineResponseType(segment: string): QuestionComponent['expectedResponseType'] {
        const lowerSegment = segment.toLowerCase();
        
        if (lowerSegment.includes('분석') || lowerSegment.includes('평가')) {
            return 'analytical';
        }
        
        if (lowerSegment.includes('비교') || lowerSegment.includes('차이')) {
            return 'comparative';
        }
        
        if (lowerSegment.includes('방법') || lowerSegment.includes('어떻게')) {
            return 'procedural';
        }
        
        if (lowerSegment.includes('창의') || lowerSegment.includes('아이디어')) {
            return 'creative';
        }
        
        return 'factual';
    }

    private calculateComponentComplexity(segment: string): number {
        let complexity = 1;
        
        // 길이 기반
        if (segment.length > 100) complexity += 2;
        else if (segment.length > 50) complexity += 1;
        
        // 전문 용어
        const technicalTerms = ['시스템', '프로세스', '메커니즘', '알고리즘', '분석', '평가'];
        const techTermCount = technicalTerms.filter(term => segment.includes(term)).length;
        complexity += techTermCount;
        
        // 추상적 개념
        const abstractConcepts = ['개념', '이론', '철학', '가치', '의미', '본질'];
        const abstractCount = abstractConcepts.filter(concept => segment.includes(concept)).length;
        complexity += abstractCount * 2;
        
        return Math.min(complexity, 10);
    }

    private identifyDomains(segment: string): string[] {
        const domains: string[] = [];
        
        for (const [domain, keywords] of Array.from(this.domainKeywords.entries())) {
            if (keywords.some((keyword: string) => segment.toLowerCase().includes(keyword))) {
                domains.push(domain);
            }
        }
        
        return domains;
    }

    private extractTimeframe(segment: string): string | undefined {
        const timePatterns = [
            { pattern: /최근|요즘|지금|현재/, value: 'current' },
            { pattern: /과거|예전|이전/, value: 'past' },
            { pattern: /미래|앞으로|향후/, value: 'future' },
            { pattern: /\d{4}년/, value: 'specific_year' }
        ];

        for (const { pattern, value } of timePatterns) {
            if (pattern.test(segment)) {
                return value;
            }
        }
        
        return undefined;
    }

    private determineScope(segment: string): QuestionComponent['scope'] {
        if (segment.includes('전체') || segment.includes('모든') || segment.includes('종합')) {
            return 'comprehensive';
        } else if (segment.includes('구체적') || segment.includes('특정') || segment.includes('정확히')) {
            return 'narrow';
        } else {
            return 'broad';
        }
    }

    private identifyImplicitComponents(originalQuestion: string, explicitComponents: QuestionComponent[]): QuestionComponent[] {
        const implicit: QuestionComponent[] = [];
        
        // 원베일리 관련 암시적 요구사항
        if (originalQuestion.toLowerCase().includes('원베일리')) {
            implicit.push({
                id: 'implicit_news_search',
                type: 'implicit',
                content: '원베일리 관련 최신 뉴스 검색',
                intent: 'news_search',
                priority: 8,
                dependencies: [],
                expectedResponseType: 'factual',
                complexity: 3,
                domain: ['real_estate', 'news'],
                scope: 'broad'
            });
            
            implicit.push({
                id: 'implicit_market_analysis',
                type: 'implicit',
                content: '원베일리 시장 영향 분석',
                intent: 'analysis',
                priority: 7,
                dependencies: ['implicit_news_search'],
                expectedResponseType: 'analytical',
                complexity: 5,
                domain: ['real_estate', 'finance'],
                scope: 'comprehensive'
            });
        }
        
        // 분석 요청 시 데이터 수집 암시
        const hasAnalysisRequest = explicitComponents.some(c => c.intent === 'analysis');
        if (hasAnalysisRequest) {
            implicit.push({
                id: 'implicit_data_collection',
                type: 'implicit',
                content: '관련 데이터 및 통계 수집',
                intent: 'data_gathering',
                priority: 6,
                dependencies: [],
                expectedResponseType: 'factual',
                complexity: 4,
                domain: ['research'],
                scope: 'broad'
            });
        }
        
        return implicit;
    }

    private analyzeDependencies(components: QuestionComponent[]): void {
        components.forEach(component => {
            // 조건부 컴포넌트는 주요 컴포넌트에 의존
            if (component.type === 'conditional') {
                const primaryComponents = components.filter(c => c.type === 'primary');
                component.dependencies = primaryComponents.map(c => c.id);
            }
            
            // 암시적 컴포넌트는 명시적 컴포넌트에 의존
            if (component.type === 'implicit') {
                const explicitComponents = components.filter(c => c.type !== 'implicit');
                if (explicitComponents.length > 0) {
                    component.dependencies = [explicitComponents[0].id];
                }
            }
            
            // 분석 요청은 데이터 수집에 의존
            if (component.intent === 'analysis') {
                const dataComponents = components.filter(c => c.intent === 'data_gathering');
                component.dependencies.push(...dataComponents.map(c => c.id));
            }
        });
    }

    private determineExecutionOrder(components: QuestionComponent[]): string[] {
        // 의존성 그래프를 기반으로 토폴로지 정렬
        const order: string[] = [];
        const visited = new Set<string>();
        const visiting = new Set<string>();
        
        const visit = (componentId: string) => {
            if (visiting.has(componentId)) {
                // 순환 의존성 감지 - 우선순위로 해결
                return;
            }
            
            if (visited.has(componentId)) {
                return;
            }
            
            visiting.add(componentId);
            
            const component = components.find(c => c.id === componentId);
            if (component) {
                // 의존성 먼저 처리
                component.dependencies.forEach(depId => {
                    if (components.some(c => c.id === depId)) {
                        visit(depId);
                    }
                });
            }
            
            visiting.delete(componentId);
            visited.add(componentId);
            order.push(componentId);
        };
        
        // 우선순위 순으로 방문
        components
            .sort((a, b) => b.priority - a.priority)
            .forEach(component => visit(component.id));
        
        return order;
    }

    private calculateOverallComplexity(components: QuestionComponent[]): number {
        const avgComplexity = components.reduce((sum, c) => sum + c.complexity, 0) / components.length;
        const componentCount = components.length;
        const dependencyCount = components.reduce((sum, c) => sum + c.dependencies.length, 0);
        
        return Math.min(avgComplexity + (componentCount * 0.5) + (dependencyCount * 0.3), 10);
    }

    private estimateResponseLength(components: QuestionComponent[]): QuestionDecomposition['estimatedResponseLength'] {
        const totalComplexity = components.reduce((sum, c) => sum + c.complexity, 0);
        const componentCount = components.length;
        
        const score = totalComplexity + (componentCount * 2);
        
        if (score > 25) return 'comprehensive';
        if (score > 15) return 'long';
        if (score > 8) return 'medium';
        return 'short';
    }

    private identifyRequiredCapabilities(components: QuestionComponent[]): string[] {
        const capabilities = new Set<string>();
        
        components.forEach(component => {
            switch (component.expectedResponseType) {
                case 'analytical':
                    capabilities.add('data_analysis');
                    capabilities.add('critical_thinking');
                    break;
                case 'comparative':
                    capabilities.add('comparison_analysis');
                    capabilities.add('evaluation');
                    break;
                case 'procedural':
                    capabilities.add('step_by_step_guidance');
                    capabilities.add('process_knowledge');
                    break;
                case 'creative':
                    capabilities.add('creative_thinking');
                    capabilities.add('ideation');
                    break;
            }
            
            if (component.domain.includes('real_estate')) {
                capabilities.add('news_search');
                capabilities.add('market_analysis');
            }
            
            if (component.complexity > 7) {
                capabilities.add('expert_knowledge');
            }
        });
        
        return Array.from(capabilities);
    }

    private generateSuggestedApproach(components: QuestionComponent[]): string[] {
        const approaches: string[] = [];
        
        // 컴포넌트 수에 따른 접근법
        if (components.length > 5) {
            approaches.push('단계별 분해 접근법');
            approaches.push('우선순위 기반 처리');
        }
        
        // 복잡도에 따른 접근법
        const avgComplexity = components.reduce((sum, c) => sum + c.complexity, 0) / components.length;
        if (avgComplexity > 6) {
            approaches.push('전문가 수준 분석');
            approaches.push('다각적 관점 제시');
        }
        
        // 도메인에 따른 접근법
        const domains = new Set(components.flatMap(c => c.domain));
        if (domains.has('real_estate')) {
            approaches.push('실시간 뉴스 검색 활용');
        }
        if (domains.size > 2) {
            approaches.push('학제간 통합 접근');
        }
        
        return approaches;
    }

    private identifyPotentialChallenges(components: QuestionComponent[]): string[] {
        const challenges: string[] = [];
        
        // 복잡도 관련 도전
        const highComplexityCount = components.filter(c => c.complexity > 7).length;
        if (highComplexityCount > 0) {
            challenges.push('높은 복잡도로 인한 처리 시간 증가');
        }
        
        // 의존성 관련 도전
        const dependencyCount = components.reduce((sum, c) => sum + c.dependencies.length, 0);
        if (dependencyCount > components.length) {
            challenges.push('복잡한 의존성으로 인한 순서 조정 필요');
        }
        
        // 도메인 관련 도전
        const domains = new Set(components.flatMap(c => c.domain));
        if (domains.size > 3) {
            challenges.push('다양한 도메인 지식 통합의 어려움');
        }
        
        // 응답 타입 관련 도전
        const responseTypes = new Set(components.map(c => c.expectedResponseType));
        if (responseTypes.size > 2) {
            challenges.push('다양한 응답 형식 통합의 복잡성');
        }
        
        return challenges;
    }

    // 다층적 분석 메서드들
    private analyzeSurfaceLevel(question: string): MultiLayerAnalysis['surfaceLevel'] {
        const directQuestions = this.extractDirectQuestions(question);
        const explicitRequests = this.extractExplicitRequests(question);
        const obviousIntent = this.identifyObviousIntent(question);
        
        return {
            directQuestions,
            explicitRequests,
            obviousIntent
        };
    }

    private async analyzeDeepLevel(question: string): Promise<MultiLayerAnalysis['deepLevel']> {
        const implicitNeeds = this.identifyImplicitNeeds(question);
        const underlyingConcerns = this.identifyUnderlyingConcerns(question);
        const hiddenAssumptions = this.identifyHiddenAssumptions(question);
        const emotionalContext = this.analyzeEmotionalContext(question);
        
        return {
            implicitNeeds,
            underlyingConcerns,
            hiddenAssumptions,
            emotionalContext
        };
    }

    private analyzeMetaLevel(question: string): MultiLayerAnalysis['metaLevel'] {
        const questioningStrategy = this.analyzeQuestioningStrategy(question);
        const cognitiveLoad = this.calculateCognitiveLoad(question);
        const informationGaps = this.identifyInformationGaps(question);
        const biasIndicators = this.identifyBiasIndicators(question);
        
        return {
            questioningStrategy,
            cognitiveLoad,
            informationGaps,
            biasIndicators
        };
    }

    // 응답 전략 생성 메서드들
    private async designResponseStructure(
        decomposition: QuestionDecomposition,
        analysis: MultiLayerAnalysis
    ): Promise<ResponseStrategy['structure']> {
        
        const introduction = this.generateIntroduction(decomposition, analysis);
        const mainSections = await this.generateMainSections(decomposition);
        const conclusion = this.generateConclusion(decomposition, analysis);
        const followUpSuggestions = this.generateFollowUpSuggestions(decomposition, analysis);
        
        return {
            introduction,
            mainSections,
            conclusion,
            followUpSuggestions
        };
    }

    // 유틸리티 메서드들 (간소화된 구현)
    private extractDirectQuestions(question: string): string[] {
        return question
          .split('?')
          .filter((q) => coerceTrimmedString(q, '').length > 0)
          .map((q) => coerceTrimmedString(q, '') + '?');
    }

    private extractExplicitRequests(question: string): string[] {
        const requests: string[] = [];
        const requestPatterns = ['해줘', '알려줘', '설명해줘', '분석해줘', '비교해줘'];
        
        requestPatterns.forEach(pattern => {
            if (question.includes(pattern)) {
                requests.push(`${pattern} 요청 감지`);
            }
        });
        
        return requests;
    }

    private identifyObviousIntent(question: string): string {
        if (question.includes('분석')) return '분석 요청';
        if (question.includes('비교')) return '비교 요청';
        if (question.includes('설명')) return '설명 요청';
        if (question.includes('방법')) return '방법 문의';
        return '정보 요청';
    }

    private identifyImplicitNeeds(question: string): string[] {
        const needs: string[] = [];
        
        if (question.toLowerCase().includes('원베일리')) {
            needs.push('최신 뉴스 정보', '시장 동향', '법적 이슈');
        }
        
        if (question.includes('분석') || question.includes('평가')) {
            needs.push('객관적 데이터', '전문가 의견', '다각적 관점');
        }
        
        return needs;
    }

    private identifyUnderlyingConcerns(question: string): string[] {
        const concerns: string[] = [];
        
        if (question.includes('문제') || question.includes('이슈')) {
            concerns.push('문제 해결에 대한 우려');
        }
        
        if (question.includes('미래') || question.includes('앞으로')) {
            concerns.push('미래 불확실성에 대한 걱정');
        }
        
        return concerns;
    }

    private identifyHiddenAssumptions(question: string): string[] {
        const assumptions: string[] = [];
        
        if (question.includes('당연히') || question.includes('물론')) {
            assumptions.push('특정 사실을 기정사실로 가정');
        }
        
        return assumptions;
    }

    private analyzeEmotionalContext(question: string): string {
        const positiveWords = ['좋은', '훌륭한', '만족', '기대'];
        const negativeWords = ['문제', '걱정', '우려', '불안'];
        
        const positiveCount = positiveWords.filter(word => question.includes(word)).length;
        const negativeCount = negativeWords.filter(word => question.includes(word)).length;
        
        if (negativeCount > positiveCount) return 'negative';
        if (positiveCount > negativeCount) return 'positive';
        return 'neutral';
    }

    private analyzeQuestioningStrategy(question: string): string {
        if (question.includes('첫째') || question.includes('둘째')) {
            return 'systematic_inquiry';
        }
        if (question.includes('만약') || question.includes('가정')) {
            return 'hypothetical_reasoning';
        }
        return 'direct_inquiry';
    }

    private calculateCognitiveLoad(question: string): number {
        const words = question.split(/\s+/).length;
        const sentences = question.split(/[.!?]/).length;
        const conjunctions = (question.match(/그리고|또한|하지만|그러나/g) || []).length;
        
        return Math.min((words / 10) + sentences + (conjunctions * 2), 10);
    }

    private identifyInformationGaps(question: string): string[] {
        const gaps: string[] = [];
        
        if (question.includes('정확한') && !question.includes('데이터')) {
            gaps.push('구체적 데이터 부족');
        }
        
        if (question.includes('최신') && !question.includes('뉴스')) {
            gaps.push('최신 정보 부족');
        }
        
        return gaps;
    }

    private identifyBiasIndicators(question: string): string[] {
        const biases: string[] = [];
        
        if (question.includes('당연히') || question.includes('분명히')) {
            biases.push('확증 편향 가능성');
        }
        
        if (question.includes('모든') || question.includes('항상')) {
            biases.push('일반화 편향 가능성');
        }
        
        return biases;
    }

    private determineTone(analysis: MultiLayerAnalysis): ResponseStrategy['tone'] {
        if (analysis.deepLevel.emotionalContext === 'negative') {
            return 'conversational';
        }
        if (analysis.metaLevel.cognitiveLoad > 7) {
            return 'technical';
        }
        return 'educational';
    }

    private determineDepth(decomposition: QuestionDecomposition): ResponseStrategy['depth'] {
        if (decomposition.overallComplexity > 8) return 'expert';
        if (decomposition.overallComplexity > 6) return 'deep';
        if (decomposition.overallComplexity > 4) return 'moderate';
        return 'surface';
    }

    private designInteractivity(
        decomposition: QuestionDecomposition,
        analysis: MultiLayerAnalysis
    ): ResponseStrategy['interactivity'] {
        
        const clarificationQuestions = this.generateClarificationQuestions(decomposition);
        const engagementPoints = this.generateEngagementPoints(analysis);
        const feedbackRequests = this.generateFeedbackRequests(decomposition);
        
        return {
            clarificationQuestions,
            engagementPoints,
            feedbackRequests
        };
    }

    private generateIntroduction(
        decomposition: QuestionDecomposition,
        analysis: MultiLayerAnalysis
    ): string {
        return `귀하의 질문을 ${decomposition.components.length}개의 주요 구성요소로 분석했습니다. ${analysis.surfaceLevel.obviousIntent}에 대해 종합적으로 답변드리겠습니다.`;
    }

    private async generateMainSections(decomposition: QuestionDecomposition): Promise<ResponseStrategy['structure']['mainSections']> {
        return decomposition.components
            .filter(c => c.type === 'primary' || c.type === 'secondary')
            .map(component => ({
                title: `${component.intent} 분석`,
                content: component.content,
                supportingEvidence: [`${component.expectedResponseType} 응답 필요`],
                visualElements: component.complexity > 6 ? ['차트', '그래프'] : undefined
            }));
    }

    private generateConclusion(
        decomposition: QuestionDecomposition,
        _analysis: MultiLayerAnalysis
    ): string {
        return `종합적으로, ${decomposition.components.length}개 요소를 고려한 분석 결과를 제시했습니다. 추가 질문이 있으시면 언제든 말씀해 주세요.`;
    }

    private generateFollowUpSuggestions(
        decomposition: QuestionDecomposition,
        analysis: MultiLayerAnalysis
    ): string[] {
        const suggestions: string[] = [];
        
        if (analysis.metaLevel.informationGaps.length > 0) {
            suggestions.push('추가 정보가 필요한 부분에 대한 구체적 질문');
        }
        
        if (decomposition.potentialChallenges.length > 0) {
            suggestions.push('식별된 도전 과제에 대한 세부 논의');
        }
        
        suggestions.push('특정 측면에 대한 더 깊은 분석 요청');
        
        return suggestions;
    }

    private generateClarificationQuestions(decomposition: QuestionDecomposition): string[] {
        const questions: string[] = [];
        
        const ambiguousComponents = decomposition.components.filter(c => c.complexity > 7);
        if (ambiguousComponents.length > 0) {
            questions.push('어떤 측면에 더 집중하고 싶으신가요?');
        }
        
        if (decomposition.estimatedResponseLength === 'comprehensive') {
            questions.push('전체적인 개요를 원하시나요, 아니면 특정 부분에 집중하시나요?');
        }
        
        return questions;
    }

    private generateEngagementPoints(analysis: MultiLayerAnalysis): string[] {
        const points: string[] = [];
        
        if (analysis.deepLevel.implicitNeeds.length > 0) {
            points.push('암시적 요구사항에 대한 추가 설명');
        }
        
        if (analysis.metaLevel.biasIndicators.length > 0) {
            points.push('다양한 관점 제시를 통한 균형잡힌 시각');
        }
        
        return points;
    }

    private generateFeedbackRequests(_decomposition: QuestionDecomposition): string[] {
        return [
            '답변이 귀하의 기대에 부합하는지 확인',
            '추가로 알고 싶은 부분이 있는지 문의',
            '답변의 깊이나 범위 조정 필요성 확인'
        ];
    }
}

export const advancedQuestionAnalyzer = new AdvancedQuestionAnalyzer();
export default advancedQuestionAnalyzer;
