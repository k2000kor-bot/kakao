import { NLPAnalysisResult } from './advancedNLPEngine';

export interface QuestionUnderstandingResult {
    question_id: string;
    original_question: string;
    processed_question: string;
    understanding_level: 'basic' | 'intermediate' | 'advanced' | 'expert';
    semantic_analysis: SemanticAnalysis;
    contextual_understanding: ContextualUnderstanding;
    intent_clarification: IntentClarification;
    knowledge_gaps: KnowledgeGap[];
    suggested_approaches: SuggestedApproach[];
    confidence_score: number;
    processing_time: number;
    timestamp: Date;
}

export interface SemanticAnalysis {
    core_concepts: CoreConcept[];
    relationships: Relationship[];
    ambiguity_detection: AmbiguityDetection;
    complexity_assessment: ComplexityAssessment;
    domain_classification: DomainClassification;
}

export interface CoreConcept {
    concept: string;
    type: 'entity' | 'action' | 'property' | 'relationship' | 'constraint';
    importance: number; // 0-1
    definition?: string;
    synonyms: string[];
    related_concepts: string[];
}

export interface Relationship {
    source: string;
    target: string;
    relationship_type: 'is_a' | 'has_a' | 'does' | 'requires' | 'conflicts_with' | 'depends_on';
    strength: number; // 0-1
    bidirectional: boolean;
}

export interface AmbiguityDetection {
    ambiguous_terms: AmbiguousTerm[];
    clarification_questions: string[];
    confidence_impact: number; // 0-1
}

export interface AmbiguousTerm {
    term: string;
    possible_meanings: string[];
    context_hints: string[];
    clarification_strategy: 'ask_user' | 'use_context' | 'assume_common' | 'ignore';
}

export interface ComplexityAssessment {
    overall_complexity: number; // 0-10
    factors: ComplexityFactor[];
    decomposition_suggestions: string[];
    prerequisite_knowledge: string[];
}

export interface ComplexityFactor {
    factor: string;
    contribution: number; // 0-1
    mitigation: string;
}

export interface DomainClassification {
    primary_domain: string;
    secondary_domains: string[];
    domain_specific_terms: string[];
    cross_domain_connections: string[];
}

export interface ContextualUnderstanding {
    conversation_context: ConversationContext;
    user_context: UserContext;
    temporal_context: TemporalContext;
    situational_context: SituationalContext;
}

export interface ConversationContext {
    previous_questions: string[];
    established_topics: string[];
    user_preferences: string[];
    conversation_flow: 'new_topic' | 'continuation' | 'clarification' | 'digression';
}

export interface UserContext {
    expertise_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    background_knowledge: string[];
    learning_goals: string[];
    communication_style: 'formal' | 'casual' | 'technical' | 'educational';
}

export interface TemporalContext {
    urgency: 'low' | 'medium' | 'high' | 'critical';
    time_constraints: string[];
    seasonal_relevance: string[];
}

export interface SituationalContext {
    current_task: string;
    environment: string;
    constraints: string[];
    available_resources: string[];
}

export interface IntentClarification {
    primary_intent: string;
    secondary_intents: string[];
    hidden_intents: string[];
    clarification_needed: boolean;
    clarification_questions: string[];
}

export interface KnowledgeGap {
    gap_type: 'concept' | 'procedure' | 'context' | 'prerequisite';
    description: string;
    impact_level: 'low' | 'medium' | 'high' | 'critical';
    suggested_filling: string[];
}

export interface SuggestedApproach {
    approach_name: string;
    description: string;
    suitability_score: number; // 0-1
    prerequisites: string[];
    expected_outcome: string;
    alternative_approaches: string[];
}

class AdvancedQuestionUnderstandingEngine {
    private knowledgeBase: Map<string, any> = new Map();
    private domainModels: Map<string, any> = new Map();
    private ambiguityPatterns: Map<string, any> = new Map();
    private complexityMetrics: Map<string, any> = new Map();

    constructor() {
        this.initializeKnowledgeBase();
        this.initializeDomainModels();
        this.initializeAmbiguityPatterns();
        this.initializeComplexityMetrics();
    }

    // 메인 질문 이해 프로세스
    async understandQuestion(
        question: string,
        nlpAnalysis: NLPAnalysisResult,
        context?: any
    ): Promise<QuestionUnderstandingResult> {
        const startTime = Date.now();
        const questionId = `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        try {
            // 1. 의미 분석
            const semanticAnalysis = await this.performSemanticAnalysis(question, nlpAnalysis);

            // 2. 컨텍스트 이해
            const contextualUnderstanding = await this.analyzeContext(question, nlpAnalysis, context);

            // 3. 의도 명확화
            const intentClarification = await this.clarifyIntent(question, nlpAnalysis, semanticAnalysis);

            // 4. 지식 격차 식별
            const knowledgeGaps = await this.identifyKnowledgeGaps(question, semanticAnalysis, contextualUnderstanding);

            // 5. 접근 방법 제안
            const suggestedApproaches = await this.suggestApproaches(question, semanticAnalysis, contextualUnderstanding);

            // 6. 이해 수준 평가
            const understandingLevel = this.assessUnderstandingLevel(semanticAnalysis, contextualUnderstanding);

            // 7. 신뢰도 계산
            const confidenceScore = this.calculateConfidenceScore(
                semanticAnalysis, contextualUnderstanding, intentClarification
            );

            const processingTime = Date.now() - startTime;

            return {
                question_id: questionId,
                original_question: question,
                processed_question: this.processQuestion(question, semanticAnalysis),
                understanding_level: understandingLevel,
                semantic_analysis: semanticAnalysis,
                contextual_understanding: contextualUnderstanding,
                intent_clarification: intentClarification,
                knowledge_gaps: knowledgeGaps,
                suggested_approaches: suggestedApproaches,
                confidence_score: confidenceScore,
                processing_time: processingTime,
                timestamp: new Date()
            };

        } catch (error) {
            console.error('Question understanding error:', error);
            return this.generateFallbackResult(question, error as Error, Date.now() - startTime);
        }
    }

    // 의미 분석 수행
    private async performSemanticAnalysis(question: string, nlpAnalysis: NLPAnalysisResult): Promise<SemanticAnalysis> {
        return {
            core_concepts: await this.extractCoreConcepts(question, nlpAnalysis),
            relationships: await this.identifyRelationships(question, nlpAnalysis),
            ambiguity_detection: await this.detectAmbiguity(question, nlpAnalysis),
            complexity_assessment: await this.assessComplexity(question, nlpAnalysis),
            domain_classification: await this.classifyDomain(question, nlpAnalysis)
        };
    }

    // 핵심 개념 추출
    private async extractCoreConcepts(question: string, nlpAnalysis: NLPAnalysisResult): Promise<CoreConcept[]> {
        const concepts: CoreConcept[] = [];

        // 엔티티 기반 개념 추출
        nlpAnalysis.entities.forEach(entity => {
            const conceptType = this.determineConceptType(entity.label);
            concepts.push({
                concept: entity.text,
                type: conceptType,
                importance: entity.confidence,
                synonyms: this.findSynonyms(entity.text),
                related_concepts: this.findRelatedConcepts(entity.text, conceptType)
            });
        });

        // 키워드 기반 개념 추출
        nlpAnalysis.keywords.forEach(keyword => {
            if (!concepts.some(c => c.concept.toLowerCase() === keyword.toLowerCase())) {
                concepts.push({
                    concept: keyword,
                    type: 'entity',
                    importance: 0.7,
                    synonyms: this.findSynonyms(keyword),
                    related_concepts: this.findRelatedConcepts(keyword, 'entity')
                });
            }
        });

        // 동사/액션 개념 추출
        const actionVerbs = this.extractActionVerbs(question);
        actionVerbs.forEach(verb => {
            concepts.push({
                concept: verb,
                type: 'action',
                importance: 0.8,
                synonyms: this.findSynonyms(verb),
                related_concepts: this.findRelatedConcepts(verb, 'action')
            });
        });

        return concepts.sort((a, b) => b.importance - a.importance);
    }

    // 개념 타입 결정
    private determineConceptType(entityLabel: string): CoreConcept['type'] {
        const typeMapping: { [key: string]: CoreConcept['type'] } = {
            'programming_language': 'entity',
            'framework': 'entity',
            'tool': 'entity',
            'database': 'entity',
            'function': 'action',
            'method': 'action',
            'property': 'property',
            'relationship': 'relationship',
            'constraint': 'constraint'
        };

        return typeMapping[entityLabel] || 'entity';
    }

    // 동의어 찾기
    private findSynonyms(term: string): string[] {
        const synonymMap: { [key: string]: string[] } = {
            'optimize': ['improve', 'enhance', 'boost', 'maximize'],
            'performance': ['speed', 'efficiency', 'throughput'],
            'security': ['safety', 'protection', 'defense'],
            'database': ['db', 'storage', 'repository'],
            'function': ['method', 'procedure', 'routine'],
            'error': ['bug', 'issue', 'problem', 'fault'],
            'test': ['verify', 'validate', 'check'],
            'deploy': ['release', 'publish', 'launch'],
            'monitor': ['watch', 'track', 'observe'],
            'scale': ['expand', 'grow', 'increase']
        };

        return synonymMap[term.toLowerCase()] || [];
    }

    // 관련 개념 찾기
    private findRelatedConcepts(term: string, type: CoreConcept['type']): string[] {
        const relatedConceptsMap: { [key: string]: string[] } = {
            'react': ['component', 'state', 'props', 'hooks', 'jsx'],
            'javascript': ['es6', 'async', 'promise', 'closure', 'prototype'],
            'node.js': ['express', 'npm', 'package.json', 'server'],
            'database': ['sql', 'query', 'index', 'transaction', 'schema'],
            'api': ['endpoint', 'rest', 'http', 'json', 'authentication'],
            'testing': ['unit', 'integration', 'e2e', 'jest', 'cypress'],
            'deployment': ['ci/cd', 'docker', 'kubernetes', 'aws', 'heroku'],
            'performance': ['optimization', 'caching', 'lazy-loading', 'compression'],
            'security': ['authentication', 'authorization', 'encryption', 'https']
        };

        return relatedConceptsMap[term.toLowerCase()] || [];
    }

    // 액션 동사 추출
    private extractActionVerbs(question: string): string[] {
        const actionVerbs = [
            'optimize', 'improve', 'fix', 'debug', 'test', 'deploy', 'scale',
            'implement', 'create', 'build', 'design', 'analyze', 'monitor',
            'secure', 'configure', 'setup', 'install', 'update', 'upgrade',
            'migrate', 'refactor', 'document', 'review', 'validate'
        ];

        return actionVerbs.filter(verb =>
            question.toLowerCase().includes(verb.toLowerCase())
        );
    }

    // 관계 식별
    private async identifyRelationships(question: string, nlpAnalysis: NLPAnalysisResult): Promise<Relationship[]> {
        const relationships: Relationship[] = [];

        // 기술적 관계 패턴
        const techRelationships = [
            { pattern: /(\w+)\s+with\s+(\w+)/g, type: 'depends_on' as const },
            { pattern: /(\w+)\s+in\s+(\w+)/g, type: 'is_a' as const },
            { pattern: /(\w+)\s+for\s+(\w+)/g, type: 'requires' as const },
            { pattern: /(\w+)\s+vs\s+(\w+)/g, type: 'conflicts_with' as const }
        ];

        techRelationships.forEach(({ pattern, type }) => {
            let match;
            while ((match = pattern.exec(question)) !== null) {
                relationships.push({
                    source: match[1],
                    target: match[2],
                    relationship_type: type,
                    strength: 0.8,
                    bidirectional: false
                });
            }
        });

        return relationships;
    }

    // 모호성 감지
    private async detectAmbiguity(question: string, nlpAnalysis: NLPAnalysisResult): Promise<AmbiguityDetection> {
        const ambiguousTerms: AmbiguousTerm[] = [];

        // 모호한 용어 패턴
        const ambiguousPatterns = [
            { term: 'it', meanings: ['이전 문맥의 주어', '특정 시스템', '코드 블록'] },
            { term: 'this', meanings: ['현재 컨텍스트', '현재 객체', '현재 상황'] },
            { term: 'that', meanings: ['특정 항목', '이전에 언급된 것', '대안'] },
            { term: 'performance', meanings: ['성능', '실행', '공연'] },
            { term: 'model', meanings: ['데이터 모델', 'AI 모델', '비즈니스 모델'] },
            { term: 'service', meanings: ['웹 서비스', '서비스 레이어', '시스템 서비스'] }
        ];

        ambiguousPatterns.forEach(({ term, meanings }) => {
            if (question.toLowerCase().includes(term.toLowerCase())) {
                ambiguousTerms.push({
                    term,
                    possible_meanings: meanings,
                    context_hints: this.extractContextHints(question, term),
                    clarification_strategy: this.determineClarificationStrategy(term, nlpAnalysis)
                });
            }
        });

        const clarificationQuestions = this.generateClarificationQuestions(ambiguousTerms);
        const confidenceImpact = ambiguousTerms.length > 0 ? 0.2 * ambiguousTerms.length : 0;

        return {
            ambiguous_terms: ambiguousTerms,
            clarification_questions: clarificationQuestions,
            confidence_impact: Math.min(1, confidenceImpact)
        };
    }

    // 컨텍스트 힌트 추출
    private extractContextHints(question: string, term: string): string[] {
        const hints: string[] = [];
        const contextWords = question.split(' ').filter(word =>
            word !== term && word.length > 3
        );

        return contextWords.slice(0, 5);
    }

    // 명확화 전략 결정
    private determineClarificationStrategy(term: string, nlpAnalysis: NLPAnalysisResult): AmbiguousTerm['clarification_strategy'] {
        if (nlpAnalysis.context.domain !== 'general') {
            return 'use_context';
        }
        if (term === 'it' || term === 'this' || term === 'that') {
            return 'ask_user';
        }
        return 'assume_common';
    }

    // 명확화 질문 생성
    private generateClarificationQuestions(ambiguousTerms: AmbiguousTerm[]): string[] {
        const questions: string[] = [];

        ambiguousTerms.forEach(term => {
            if (term.clarification_strategy === 'ask_user') {
                questions.push(`${term.term}이 무엇을 의미하는지 명확히 해주시겠어요?`);
            }
        });

        return questions;
    }

    // 복잡도 평가
    private async assessComplexity(question: string, nlpAnalysis: NLPAnalysisResult): Promise<ComplexityAssessment> {
        const factors: ComplexityFactor[] = [];

        // 기술 용어 밀도
        const techTerms = nlpAnalysis.entities.filter(e =>
            ['programming_language', 'framework', 'tool'].includes(e.label)
        ).length;
        if (techTerms > 3) {
            factors.push({
                factor: '높은 기술 용어 밀도',
                contribution: 0.3,
                mitigation: '기본 개념부터 단계별 설명'
            });
        }

        // 문장 복잡도
        if (nlpAnalysis.complexity > 7) {
            factors.push({
                factor: '복잡한 문장 구조',
                contribution: 0.2,
                mitigation: '간단한 문장으로 분해'
            });
        }

        // 다중 주제
        if (nlpAnalysis.topics.length > 2) {
            factors.push({
                factor: '다중 주제 포함',
                contribution: 0.25,
                mitigation: '주제별로 분리하여 설명'
            });
        }

        const overallComplexity = Math.min(10,
            nlpAnalysis.complexity + factors.reduce((sum, f) => sum + f.contribution * 10, 0)
        );

        return {
            overall_complexity: overallComplexity,
            factors,
            decomposition_suggestions: this.generateDecompositionSuggestions(factors),
            prerequisite_knowledge: this.identifyPrerequisites(nlpAnalysis)
        };
    }

    // 분해 제안 생성
    private generateDecompositionSuggestions(factors: ComplexityFactor[]): string[] {
        const suggestions: string[] = [];

        if (factors.some(f => f.factor.includes('기술 용어'))) {
            suggestions.push('기본 개념부터 단계별로 설명');
        }
        if (factors.some(f => f.factor.includes('문장 구조'))) {
            suggestions.push('간단한 질문으로 분해');
        }
        if (factors.some(f => f.factor.includes('다중 주제'))) {
            suggestions.push('주제별로 나누어 설명');
        }

        return suggestions;
    }

    // 선수 지식 식별
    private identifyPrerequisites(nlpAnalysis: NLPAnalysisResult): string[] {
        const prerequisites: string[] = [];

        if (nlpAnalysis.topics.includes('programming')) {
            prerequisites.push('기본 프로그래밍 개념');
        }
        if (nlpAnalysis.topics.includes('web_development')) {
            prerequisites.push('HTML, CSS, JavaScript 기초');
        }
        if (nlpAnalysis.topics.includes('database')) {
            prerequisites.push('데이터베이스 기본 개념');
        }

        return prerequisites;
    }

    // 도메인 분류
    private async classifyDomain(question: string, nlpAnalysis: NLPAnalysisResult): Promise<DomainClassification> {
        const domainKeywords = {
            'software_engineering': ['code', 'programming', 'development', 'software'],
            'web_development': ['web', 'frontend', 'backend', 'browser'],
            'data_science': ['data', 'analysis', 'machine learning', 'ai'],
            'devops': ['deployment', 'server', 'infrastructure', 'ci/cd'],
            'database': ['database', 'sql', 'query', 'storage'],
            'security': ['security', 'authentication', 'encryption', 'vulnerability'],
            'mobile': ['mobile', 'app', 'ios', 'android'],
            'design': ['ui', 'ux', 'design', 'interface']
        };

        let primaryDomain = 'general';
        let maxScore = 0;

        for (const [domain, keywords] of Object.entries(domainKeywords)) {
            const score = keywords.filter(keyword =>
                question.toLowerCase().includes(keyword.toLowerCase())
            ).length;

            if (score > maxScore) {
                maxScore = score;
                primaryDomain = domain;
            }
        }

        const secondaryDomains = Object.keys(domainKeywords).filter(domain =>
            domain !== primaryDomain && domainKeywords[domain as keyof typeof domainKeywords].some(keyword =>
                question.toLowerCase().includes(keyword.toLowerCase())
            )
        );

        return {
            primary_domain: primaryDomain,
            secondary_domains: secondaryDomains,
            domain_specific_terms: this.extractDomainTerms(question, primaryDomain),
            cross_domain_connections: this.identifyCrossDomainConnections(primaryDomain, secondaryDomains)
        };
    }

    // 도메인 특화 용어 추출
    private extractDomainTerms(question: string, domain: string): string[] {
        const domainTerms: { [key: string]: string[] } = {
            'software_engineering': ['algorithm', 'data structure', 'complexity', 'optimization'],
            'web_development': ['http', 'api', 'json', 'cors', 'spa'],
            'data_science': ['pandas', 'numpy', 'matplotlib', 'scikit-learn'],
            'devops': ['docker', 'kubernetes', 'jenkins', 'terraform']
        };

        const terms = domainTerms[domain] || [];
        return terms.filter(term => question.toLowerCase().includes(term.toLowerCase()));
    }

    // 크로스 도메인 연결 식별
    private identifyCrossDomainConnections(primary: string, secondary: string[]): string[] {
        const connections: string[] = [];

        if (primary === 'web_development' && secondary.includes('database')) {
            connections.push('웹 애플리케이션과 데이터베이스 연동');
        }
        if (primary === 'software_engineering' && secondary.includes('security')) {
            connections.push('보안을 고려한 소프트웨어 설계');
        }

        return connections;
    }

    // 컨텍스트 분석
    private async analyzeContext(
        question: string,
        nlpAnalysis: NLPAnalysisResult,
        context?: any
    ): Promise<ContextualUnderstanding> {
        return {
            conversation_context: this.analyzeConversationContext(context),
            user_context: this.analyzeUserContext(nlpAnalysis, context),
            temporal_context: this.analyzeTemporalContext(question),
            situational_context: this.analyzeSituationalContext(context)
        };
    }

    // 대화 컨텍스트 분석
    private analyzeConversationContext(context?: any): ConversationContext {
        return {
            previous_questions: context?.conversation_history || [],
            established_topics: context?.recent_topics || [],
            user_preferences: context?.user_preferences || [],
            conversation_flow: this.determineConversationFlow(context)
        };
    }

    // 대화 흐름 결정
    private determineConversationFlow(context?: any): ConversationContext['conversation_flow'] {
        if (!context?.conversation_history || context.conversation_history.length === 0) {
            return 'new_topic';
        }

        const lastQuestion = context.conversation_history[context.conversation_history.length - 1];
        if (lastQuestion.includes('?')) {
            return 'clarification';
        }

        return 'continuation';
    }

    // 사용자 컨텍스트 분석
    private analyzeUserContext(nlpAnalysis: NLPAnalysisResult, context?: any): UserContext {
        return {
            expertise_level: nlpAnalysis.context.user_expertise_level,
            background_knowledge: this.inferBackgroundKnowledge(nlpAnalysis),
            learning_goals: this.inferLearningGoals(nlpAnalysis),
            communication_style: this.determineCommunicationStyle(nlpAnalysis)
        };
    }

    // 배경 지식 추론
    private inferBackgroundKnowledge(nlpAnalysis: NLPAnalysisResult): string[] {
        const knowledge: string[] = [];

        if (nlpAnalysis.complexity > 7) {
            knowledge.push('고급 기술 지식');
        }
        if (nlpAnalysis.entities.some(e => e.label === 'programming_language')) {
            knowledge.push('프로그래밍 언어 경험');
        }
        if (nlpAnalysis.topics.includes('web_development')) {
            knowledge.push('웹 개발 경험');
        }

        return knowledge;
    }

    // 학습 목표 추론
    private inferLearningGoals(nlpAnalysis: NLPAnalysisResult): string[] {
        const goals: string[] = [];

        if (nlpAnalysis.intent === 'learning') {
            goals.push('새로운 기술 습득');
        }
        if (nlpAnalysis.intent === 'problem_solving') {
            goals.push('실무 문제 해결');
        }
        if (nlpAnalysis.complexity > 7) {
            goals.push('심화 학습');
        }

        return goals;
    }

    // 커뮤니케이션 스타일 결정
    private determineCommunicationStyle(nlpAnalysis: NLPAnalysisResult): UserContext['communication_style'] {
        if (nlpAnalysis.context.formality === 'academic') {
            return 'technical';
        }
        if (nlpAnalysis.context.formality === 'casual') {
            return 'casual';
        }
        if (nlpAnalysis.intent === 'learning') {
            return 'educational';
        }
        return 'formal';
    }

    // 시간적 컨텍스트 분석
    private analyzeTemporalContext(question: string): TemporalContext {
        const urgency = this.determineUrgency(question);
        const timeConstraints = this.extractTimeConstraints(question);
        const seasonalRelevance = this.identifySeasonalRelevance(question);

        return {
            urgency,
            time_constraints: timeConstraints,
            seasonal_relevance: seasonalRelevance
        };
    }

    // 긴급도 결정
    private determineUrgency(question: string): TemporalContext['urgency'] {
        const urgentKeywords = ['urgent', 'asap', 'immediately', '긴급', '즉시', '당장'];
        const highKeywords = ['soon', 'quickly', '빨리', '서둘러'];

        if (urgentKeywords.some(keyword => question.toLowerCase().includes(keyword))) {
            return 'critical';
        }
        if (highKeywords.some(keyword => question.toLowerCase().includes(keyword))) {
            return 'high';
        }
        return 'medium';
    }

    // 시간 제약 추출
    private extractTimeConstraints(question: string): string[] {
        const constraints: string[] = [];
        const timePatterns = [
            /(\d+)\s*(hour|day|week|month)s?/gi,
            /by\s+(tomorrow|next week|end of month)/gi,
            /within\s+(\d+)\s*(hour|day|week)/gi
        ];

        timePatterns.forEach(pattern => {
            const matches = question.match(pattern);
            if (matches) {
                constraints.push(...matches);
            }
        });

        return constraints;
    }

    // 계절적 관련성 식별
    private identifySeasonalRelevance(question: string): string[] {
        const seasonalTerms = ['summer', 'winter', 'spring', 'fall', 'holiday', 'vacation'];
        return seasonalTerms.filter(term => question.toLowerCase().includes(term));
    }

    // 상황적 컨텍스트 분석
    private analyzeSituationalContext(context?: any): SituationalContext {
        return {
            current_task: context?.current_task || 'general_inquiry',
            environment: context?.environment || 'development',
            constraints: context?.constraints || [],
            available_resources: context?.available_resources || ['web_search', 'documentation']
        };
    }

    // 의도 명확화
    private async clarifyIntent(
        question: string,
        nlpAnalysis: NLPAnalysisResult,
        semanticAnalysis: SemanticAnalysis
    ): Promise<IntentClarification> {
        const primaryIntent = nlpAnalysis.intent;
        const secondaryIntents = this.identifySecondaryIntents(question, nlpAnalysis);
        const hiddenIntents = this.detectHiddenIntents(question, semanticAnalysis);
        const clarificationNeeded = this.needsClarification(question, semanticAnalysis);
        const clarificationQuestions = this.generateIntentClarificationQuestions(question, semanticAnalysis);

        return {
            primary_intent: primaryIntent,
            secondary_intents: secondaryIntents,
            hidden_intents: hiddenIntents,
            clarification_needed: clarificationNeeded,
            clarification_questions: clarificationQuestions
        };
    }

    // 보조 의도 식별
    private identifySecondaryIntents(question: string, nlpAnalysis: NLPAnalysisResult): string[] {
        const intents: string[] = [];

        if (question.includes('example') || question.includes('예시')) {
            intents.push('example_request');
        }
        if (question.includes('compare') || question.includes('비교')) {
            intents.push('comparison');
        }
        if (question.includes('best') || question.includes('최고')) {
            intents.push('recommendation');
        }

        return intents;
    }

    // 숨겨진 의도 감지
    private detectHiddenIntents(question: string, semanticAnalysis: SemanticAnalysis): string[] {
        const hiddenIntents: string[] = [];

        // 성능 최적화 관련 숨겨진 의도
        if (semanticAnalysis.core_concepts.some(c =>
            c.concept.toLowerCase().includes('slow') || c.concept.toLowerCase().includes('느린')
        )) {
            hiddenIntents.push('performance_concern');
        }

        // 보안 관련 숨겨진 의도
        if (semanticAnalysis.core_concepts.some(c =>
            c.concept.toLowerCase().includes('secure') || c.concept.toLowerCase().includes('안전')
        )) {
            hiddenIntents.push('security_concern');
        }

        return hiddenIntents;
    }

    // 명확화 필요성 판단
    private needsClarification(question: string, semanticAnalysis: SemanticAnalysis): boolean {
        return semanticAnalysis.ambiguity_detection.ambiguous_terms.length > 0 ||
            semanticAnalysis.complexity_assessment.overall_complexity > 8;
    }

    // 의도 명확화 질문 생성
    private generateIntentClarificationQuestions(question: string, semanticAnalysis: SemanticAnalysis): string[] {
        const questions: string[] = [];

        if (semanticAnalysis.ambiguity_detection.ambiguous_terms.length > 0) {
            questions.push('어떤 맥락에서 이 질문을 하시는 건가요?');
        }

        if (semanticAnalysis.complexity_assessment.overall_complexity > 8) {
            questions.push('어떤 수준의 설명을 원하시나요? (기초/중급/고급)');
        }

        return questions;
    }

    // 지식 격차 식별
    private async identifyKnowledgeGaps(
        question: string,
        semanticAnalysis: SemanticAnalysis,
        contextualUnderstanding: ContextualUnderstanding
    ): Promise<KnowledgeGap[]> {
        const gaps: KnowledgeGap[] = [];

        // 개념적 격차
        const complexConcepts = semanticAnalysis.core_concepts.filter(c => c.importance > 0.8);
        if (complexConcepts.length > 0 && contextualUnderstanding.user_context.expertise_level === 'beginner') {
            gaps.push({
                gap_type: 'concept',
                description: '고급 개념에 대한 이해 부족',
                impact_level: 'high',
                suggested_filling: ['기본 개념부터 단계별 학습', '실용적 예시 제공']
            });
        }

        // 절차적 격차
        if (semanticAnalysis.core_concepts.some(c => c.type === 'action') &&
            contextualUnderstanding.user_context.expertise_level === 'beginner') {
            gaps.push({
                gap_type: 'procedure',
                description: '실행 절차에 대한 경험 부족',
                impact_level: 'medium',
                suggested_filling: ['단계별 가이드 제공', '실습 환경 안내']
            });
        }

        return gaps;
    }

    // 접근 방법 제안
    private async suggestApproaches(
        question: string,
        semanticAnalysis: SemanticAnalysis,
        contextualUnderstanding: ContextualUnderstanding
    ): Promise<SuggestedApproach[]> {
        const approaches: SuggestedApproach[] = [];

        // 기본 접근법
        approaches.push({
            approach_name: '단계별 설명',
            description: '기본 개념부터 차근차근 설명하는 방식',
            suitability_score: 0.9,
            prerequisites: [],
            expected_outcome: '이해도 향상',
            alternative_approaches: ['예시 중심 설명', '비교 분석']
        });

        // 복잡도 기반 접근법
        if (semanticAnalysis.complexity_assessment.overall_complexity > 7) {
            approaches.push({
                approach_name: '분해 접근법',
                description: '복잡한 문제를 작은 단위로 나누어 설명',
                suitability_score: 0.8,
                prerequisites: ['기본 개념 이해'],
                expected_outcome: '체계적 이해',
                alternative_approaches: ['시각적 다이어그램', '실습 중심']
            });
        }

        // 도메인 기반 접근법
        if (semanticAnalysis.domain_classification.primary_domain !== 'general') {
            approaches.push({
                approach_name: '도메인 특화 설명',
                description: '해당 분야의 전문 용어와 개념을 활용한 설명',
                suitability_score: 0.7,
                prerequisites: ['도메인 기본 지식'],
                expected_outcome: '전문적 이해',
                alternative_approaches: ['실무 사례 중심', '최신 트렌드 반영']
            });
        }

        return approaches.sort((a, b) => b.suitability_score - a.suitability_score);
    }

    // 이해 수준 평가
    private assessUnderstandingLevel(
        semanticAnalysis: SemanticAnalysis,
        contextualUnderstanding: ContextualUnderstanding
    ): QuestionUnderstandingResult['understanding_level'] {
        const complexity = semanticAnalysis.complexity_assessment.overall_complexity;
        const expertise = contextualUnderstanding.user_context.expertise_level;
        const ambiguity = semanticAnalysis.ambiguity_detection.confidence_impact;

        if (complexity > 8 && ambiguity > 0.5) {
            return 'basic';
        } else if (complexity > 6 || ambiguity > 0.3) {
            return 'intermediate';
        } else if (expertise === 'expert' && complexity < 5) {
            return 'expert';
        } else {
            return 'advanced';
        }
    }

    // 신뢰도 계산
    private calculateConfidenceScore(
        semanticAnalysis: SemanticAnalysis,
        contextualUnderstanding: ContextualUnderstanding,
        intentClarification: IntentClarification
    ): number {
        let score = 0.8; // 기본 신뢰도

        // 모호성에 따른 감점
        score -= semanticAnalysis.ambiguity_detection.confidence_impact;

        // 복잡도에 따른 조정
        if (semanticAnalysis.complexity_assessment.overall_complexity > 8) {
            score -= 0.1;
        }

        // 컨텍스트 풍부도에 따른 가점
        if (contextualUnderstanding.conversation_context.previous_questions.length > 0) {
            score += 0.1;
        }

        // 명확화 필요성에 따른 감점
        if (intentClarification.clarification_needed) {
            score -= 0.2;
        }

        return Math.max(0.1, Math.min(1.0, score));
    }

    // 질문 처리
    private processQuestion(question: string, semanticAnalysis: SemanticAnalysis): string {
        let processed = question;

        // 모호한 용어 대체
        semanticAnalysis.ambiguity_detection.ambiguous_terms.forEach(term => {
            if (term.clarification_strategy === 'assume_common') {
                // 가장 일반적인 의미로 대체
                processed = processed.replace(
                    new RegExp(`\\b${term.term}\\b`, 'gi'),
                    term.possible_meanings[0]
                );
            }
        });

        return processed;
    }

    // 폴백 결과 생성
    private generateFallbackResult(question: string, error: Error, processingTime: number): QuestionUnderstandingResult {
        return {
            question_id: `fallback-${Date.now()}`,
            original_question: question,
            processed_question: question,
            understanding_level: 'basic',
            semantic_analysis: {
                core_concepts: [],
                relationships: [],
                ambiguity_detection: {
                    ambiguous_terms: [],
                    clarification_questions: [],
                    confidence_impact: 0
                },
                complexity_assessment: {
                    overall_complexity: 5,
                    factors: [],
                    decomposition_suggestions: [],
                    prerequisite_knowledge: []
                },
                domain_classification: {
                    primary_domain: 'general',
                    secondary_domains: [],
                    domain_specific_terms: [],
                    cross_domain_connections: []
                }
            },
            contextual_understanding: {
                conversation_context: {
                    previous_questions: [],
                    established_topics: [],
                    user_preferences: [],
                    conversation_flow: 'new_topic'
                },
                user_context: {
                    expertise_level: 'intermediate',
                    background_knowledge: [],
                    learning_goals: [],
                    communication_style: 'formal'
                },
                temporal_context: {
                    urgency: 'medium',
                    time_constraints: [],
                    seasonal_relevance: []
                },
                situational_context: {
                    current_task: 'general_inquiry',
                    environment: 'development',
                    constraints: [],
                    available_resources: []
                }
            },
            intent_clarification: {
                primary_intent: 'general',
                secondary_intents: [],
                hidden_intents: [],
                clarification_needed: false,
                clarification_questions: []
            },
            knowledge_gaps: [],
            suggested_approaches: [],
            confidence_score: 0.3,
            processing_time: processingTime,
            timestamp: new Date()
        };
    }

    // 초기화 메서드들
    private initializeKnowledgeBase(): void {
        // 기술 지식 베이스 초기화
        this.knowledgeBase.set('programming', {
            concepts: ['variable', 'function', 'class', 'object', 'array'],
            relationships: ['inheritance', 'composition', 'dependency'],
            complexity_factors: ['algorithm', 'data_structure', 'design_pattern']
        });
    }

    private initializeDomainModels(): void {
        // 도메인별 모델 초기화
        this.domainModels.set('web_development', {
            core_concepts: ['html', 'css', 'javascript', 'http', 'api'],
            patterns: ['mvc', 'mvvm', 'spa', 'ssr'],
            tools: ['react', 'vue', 'angular', 'node.js']
        });
    }

    private initializeAmbiguityPatterns(): void {
        // 모호성 패턴 초기화
        this.ambiguityPatterns.set('pronouns', ['it', 'this', 'that', 'they']);
        this.ambiguityPatterns.set('context_dependent', ['performance', 'model', 'service']);
    }

    private initializeComplexityMetrics(): void {
        // 복잡도 메트릭 초기화
        this.complexityMetrics.set('technical_terms', {
            weight: 0.3,
            threshold: 5
        });
        this.complexityMetrics.set('sentence_structure', {
            weight: 0.2,
            threshold: 20
        });
    }

    // 공개 메서드들
    async quickUnderstand(question: string): Promise<QuestionUnderstandingResult> {
        const mockNlpAnalysis: NLPAnalysisResult = {
            intent: 'question',
            entities: [],
            sentiment: { score: 0, label: 'neutral', confidence: 0.5 },
            language: 'ko',
            complexity: 5,
            topics: ['general'],
            keywords: [],
            context: {
                conversation_flow: 'new_conversation',
                user_expertise_level: 'intermediate',
                domain: 'general',
                urgency: 'medium',
                formality: 'professional'
            },
            response_strategy: {
                tone: 'professional',
                detail_level: 'moderate',
                examples_needed: false,
                code_examples: false,
                visual_aids: false
            }
        };

        return await this.understandQuestion(question, mockNlpAnalysis);
    }

    getUnderstandingCapabilities(): any {
        return {
            semantic_analysis: true,
            contextual_understanding: true,
            intent_clarification: true,
            knowledge_gap_detection: true,
            approach_suggestion: true,
            real_time_processing: true
        };
    }
}

const advancedQuestionUnderstandingEngine = new AdvancedQuestionUnderstandingEngine();
export default advancedQuestionUnderstandingEngine;
