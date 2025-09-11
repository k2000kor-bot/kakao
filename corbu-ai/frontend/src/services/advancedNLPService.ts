/**
 * 고급 NLP 질문 이해 및 문맥 분석 서비스
 * 질문의 의도, 문맥, 논리적 구조를 분석하여 더 정확한 답변 생성을 지원
 */

export interface QuestionAnalysis {
    // 질문 이해
    questionType: 'factual' | 'analytical' | 'comparative' | 'explanatory' | 'procedural' | 'opinion';
    complexity: 'simple' | 'moderate' | 'complex' | 'multi-layered';

    // 문맥 분석
    context: {
        domain: string[];
        timeframe: string | null;
        scope: 'specific' | 'general' | 'comprehensive';
        background: string[];
    };

    // 의도 분석
    intent: {
        primary: string;
        secondary: string[];
        implicitNeeds: string[];
        expectedDepth: 'surface' | 'detailed' | 'comprehensive' | 'expert';
    };

    // 논리적 구조
    logicalStructure: {
        premises: string[];
        conclusions: string[];
        relationships: string[];
        gaps: string[];
    };

    // 요구사항 분석
    requirements: {
        informationTypes: string[];
        evidenceNeeded: string[];
        formatPreferences: string[];
        constraints: string[];
    };
}

export interface EnhancedResponse {
    content: string;
    reasoning: string[];
    evidence: string[];
    sources: string[];
    confidence: number;
    completeness: number;
    logicalFlow: string[];
}

class AdvancedNLPService {
    private questionPatterns: Map<string, RegExp[]> = new Map();
    private contextClues: Map<string, string[]> = new Map();
    private intentMarkers: Map<string, string[]> = new Map();

    constructor() {
        this.initializePatterns();
    }

    private initializePatterns(): void {
        // 질문 유형 패턴
        this.questionPatterns.set('factual', [
            /무엇인가|뭔가|어떤 것|정의|의미/,
            /언제|어디서|누가|얼마나/,
            /사실|정보|데이터|통계/
        ]);

        this.questionPatterns.set('analytical', [
            /분석|해석|평가|검토/,
            /원인|이유|결과|영향/,
            /왜|어떻게|방법|과정/
        ]);

        this.questionPatterns.set('comparative', [
            /비교|대비|차이|유사|같은|다른/,
            /보다|더|덜|반면|한편/,
            /장단점|pros and cons/
        ]);

        this.questionPatterns.set('explanatory', [
            /설명|해설|이해|파악/,
            /어떻게|왜|방식|메커니즘/,
            /원리|구조|시스템/
        ]);

        // 문맥 단서
        this.contextClues.set('business', ['비즈니스', '사업', '경영', '마케팅', '전략', '수익']);
        this.contextClues.set('technology', ['기술', '시스템', '소프트웨어', '개발', 'AI', 'IT']);
        this.contextClues.set('finance', ['금융', '투자', '주식', '경제', '재정', '자금']);
        this.contextClues.set('real_estate', ['부동산', '아파트', '주택', '건설', '하자', '원베일리']);
        this.contextClues.set('news', ['뉴스', '기사', '언론', '보도', '미디어', '취재']);

        // 의도 마커
        this.intentMarkers.set('deep_analysis', ['자세히', '상세히', '깊이', '종합적으로', '전문적으로']);
        this.intentMarkers.set('quick_summary', ['간단히', '요약', '핵심만', '빠르게', '개요']);
        this.intentMarkers.set('comparison', ['비교', '대조', '차이점', '공통점', '장단점']);
        this.intentMarkers.set('solution', ['해결', '방법', '대안', '개선', '조치']);
    }

    /**
     * 질문을 종합적으로 분석하여 의도와 문맥을 파악
     */
    async analyzeQuestion(question: string, conversationHistory: string[] = []): Promise<QuestionAnalysis> {
        const questionType = this.identifyQuestionType(question);
        const complexity = this.assessComplexity(question);
        const context = this.analyzeContext(question, conversationHistory);
        const intent = this.analyzeIntent(question);
        const logicalStructure = this.analyzeLogicalStructure(question);
        const requirements = this.extractRequirements(question);

        return {
            questionType,
            complexity,
            context,
            intent,
            logicalStructure,
            requirements
        };
    }

    private identifyQuestionType(question: string): QuestionAnalysis['questionType'] {
        const lowerQuestion = question.toLowerCase();

        for (const [type, patterns] of Array.from(this.questionPatterns.entries())) {
            const matches = patterns.some(pattern => pattern.test(lowerQuestion));
            if (matches) {
                return type as QuestionAnalysis['questionType'];
            }
        }

        return 'explanatory'; // 기본값
    }

    private assessComplexity(question: string): QuestionAnalysis['complexity'] {
        const sentences = question.split(/[.!?]/).filter(s => s.trim().length > 0);
        const words = question.split(/\s+/).length;
        const conjunctions = (question.match(/그리고|또한|하지만|그러나|따라서|왜냐하면/g) || []).length;

        if (sentences.length > 3 || words > 50 || conjunctions > 2) {
            return 'multi-layered';
        } else if (sentences.length > 2 || words > 30 || conjunctions > 1) {
            return 'complex';
        } else if (words > 15) {
            return 'moderate';
        } else {
            return 'simple';
        }
    }

    private analyzeContext(question: string, history: string[]): QuestionAnalysis['context'] {
        const lowerQuestion = question.toLowerCase();
        const domains: string[] = [];

        // 도메인 식별
        for (const [domain, keywords] of Array.from(this.contextClues.entries())) {
            if (keywords.some((keyword: string) => lowerQuestion.includes(keyword))) {
                domains.push(domain);
            }
        }

        // 시간 프레임 추출
        const timeframe = this.extractTimeframe(question);

        // 범위 결정
        const scope = this.determineScope(question);

        // 배경 정보 추출
        const background = this.extractBackground(question, history);

        return {
            domain: domains,
            timeframe,
            scope,
            background
        };
    }

    private analyzeIntent(question: string): QuestionAnalysis['intent'] {
        const lowerQuestion = question.toLowerCase();

        // 주요 의도 파악
        let primary = 'information_seeking';
        const secondary: string[] = [];
        const implicitNeeds: string[] = [];

        for (const [intent, markers] of Array.from(this.intentMarkers.entries())) {
            if (markers.some((marker: string) => lowerQuestion.includes(marker))) {
                if (primary === 'information_seeking') {
                    primary = intent;
                } else {
                    secondary.push(intent);
                }
            }
        }

        // 암시적 요구사항 파악
        if (lowerQuestion.includes('원베일리')) {
            implicitNeeds.push('news_search', 'market_analysis', 'legal_implications');
        }

        if (lowerQuestion.includes('분석') || lowerQuestion.includes('평가')) {
            implicitNeeds.push('data_analysis', 'expert_opinion', 'evidence_based_reasoning');
        }

        // 기대 깊이 결정
        const expectedDepth = this.determineExpectedDepth(question);

        return {
            primary,
            secondary,
            implicitNeeds,
            expectedDepth
        };
    }

    private analyzeLogicalStructure(question: string): QuestionAnalysis['logicalStructure'] {
        const sentences = question.split(/[.!?]/).filter(s => s.trim().length > 0);

        const premises: string[] = [];
        const conclusions: string[] = [];
        const relationships: string[] = [];
        const gaps: string[] = [];

        sentences.forEach((sentence, index) => {
            const trimmed = sentence.trim();

            // 전제 식별
            if (trimmed.includes('때문에') || trimmed.includes('이유로') || trimmed.includes('근거로')) {
                premises.push(trimmed);
            }

            // 결론 식별
            if (trimmed.includes('따라서') || trimmed.includes('그러므로') || trimmed.includes('결국')) {
                conclusions.push(trimmed);
            }

            // 관계 식별
            if (trimmed.includes('그리고') || trimmed.includes('또한') || trimmed.includes('하지만')) {
                relationships.push(`문장 ${index + 1}: 연결 관계`);
            }
        });

        // 논리적 공백 식별
        if (premises.length > 0 && conclusions.length === 0) {
            gaps.push('결론이 명시되지 않음');
        }
        if (question.includes('왜') && premises.length === 0) {
            gaps.push('근거나 전제가 부족함');
        }

        return {
            premises,
            conclusions,
            relationships,
            gaps
        };
    }

    private extractRequirements(question: string): QuestionAnalysis['requirements'] {
        const lowerQuestion = question.toLowerCase();

        const informationTypes: string[] = [];
        const evidenceNeeded: string[] = [];
        const formatPreferences: string[] = [];
        const constraints: string[] = [];

        // 정보 유형 식별
        if (lowerQuestion.includes('통계') || lowerQuestion.includes('데이터')) {
            informationTypes.push('statistical_data');
        }
        if (lowerQuestion.includes('예시') || lowerQuestion.includes('사례')) {
            informationTypes.push('examples');
        }
        if (lowerQuestion.includes('전문가') || lowerQuestion.includes('의견')) {
            informationTypes.push('expert_opinions');
        }

        // 증거 요구사항
        if (lowerQuestion.includes('근거') || lowerQuestion.includes('증명')) {
            evidenceNeeded.push('factual_evidence');
        }
        if (lowerQuestion.includes('출처') || lowerQuestion.includes('참고')) {
            evidenceNeeded.push('sources');
        }

        // 형식 선호도
        if (lowerQuestion.includes('목록') || lowerQuestion.includes('리스트')) {
            formatPreferences.push('list_format');
        }
        if (lowerQuestion.includes('단계') || lowerQuestion.includes('순서')) {
            formatPreferences.push('step_by_step');
        }

        return {
            informationTypes,
            evidenceNeeded,
            formatPreferences,
            constraints
        };
    }

    private extractTimeframe(question: string): string | null {
        const timePatterns = [
            { pattern: /최근|요즘|지금|현재/, value: 'recent' },
            { pattern: /과거|예전|이전/, value: 'past' },
            { pattern: /미래|앞으로|향후/, value: 'future' },
            { pattern: /\d{4}년/, value: 'specific_year' }
        ];

        for (const { pattern, value } of timePatterns) {
            if (pattern.test(question)) {
                return value;
            }
        }

        return null;
    }

    private determineScope(question: string): 'specific' | 'general' | 'comprehensive' {
        if (question.includes('전체적으로') || question.includes('종합적으로') || question.includes('모든')) {
            return 'comprehensive';
        } else if (question.includes('구체적으로') || question.includes('특정') || question.includes('정확히')) {
            return 'specific';
        } else {
            return 'general';
        }
    }

    private extractBackground(question: string, history: string[]): string[] {
        const background: string[] = [];

        // 대화 히스토리에서 배경 정보 추출
        history.forEach(msg => {
            if (msg.includes('앞서') || msg.includes('이전에') || msg.includes('말씀드린')) {
                background.push('previous_context');
            }
        });

        // 질문에서 배경 정보 추출
        if (question.includes('관련해서') || question.includes('대해서')) {
            background.push('topic_related');
        }

        return background;
    }

    private determineExpectedDepth(question: string): QuestionAnalysis['intent']['expectedDepth'] {
        const lowerQuestion = question.toLowerCase();

        if (lowerQuestion.includes('전문적으로') || lowerQuestion.includes('깊이') || lowerQuestion.includes('상세히')) {
            return 'expert';
        } else if (lowerQuestion.includes('자세히') || lowerQuestion.includes('종합적으로')) {
            return 'comprehensive';
        } else if (lowerQuestion.includes('구체적으로') || lowerQuestion.includes('설명')) {
            return 'detailed';
        } else {
            return 'surface';
        }
    }

    /**
     * 분석 결과를 바탕으로 향상된 답변 생성을 위한 가이드라인 제공
     */
    generateResponseGuidelines(analysis: QuestionAnalysis, webSearchResults?: any[]): {
        structure: string[];
        requiredElements: string[];
        tone: string;
        depth: string;
        evidenceRequirements: string[];
    } {
        const guidelines = {
            structure: this.generateStructureGuidelines(analysis),
            requiredElements: this.generateRequiredElements(analysis),
            tone: this.determineTone(analysis),
            depth: this.determineDepthGuidelines(analysis),
            evidenceRequirements: this.generateEvidenceRequirements(analysis, webSearchResults)
        };

        return guidelines;
    }

    private generateStructureGuidelines(analysis: QuestionAnalysis): string[] {
        const structure: string[] = [];

        switch (analysis.questionType) {
            case 'analytical':
                structure.push('문제 정의', '분석 방법론', '핵심 발견사항', '결론 및 시사점');
                break;
            case 'comparative':
                structure.push('비교 기준 설정', '각 항목별 분석', '차이점 및 공통점', '종합 평가');
                break;
            case 'explanatory':
                structure.push('개념 정의', '배경 설명', '단계별 과정', '실제 적용 예시');
                break;
            default:
                structure.push('핵심 정보', '상세 설명', '관련 맥락', '결론');
        }

        if (analysis.complexity === 'multi-layered') {
            structure.unshift('전체 개요');
            structure.push('종합 정리');
        }

        return structure;
    }

    private generateRequiredElements(analysis: QuestionAnalysis): string[] {
        const elements: string[] = [];

        // 의도에 따른 필수 요소
        if (analysis.intent.implicitNeeds.includes('news_search')) {
            elements.push('최신 뉴스 정보', '관련 기사 링크', '시장 동향');
        }

        if (analysis.intent.implicitNeeds.includes('data_analysis')) {
            elements.push('통계 데이터', '트렌드 분석', '수치적 근거');
        }

        // 요구사항에 따른 필수 요소
        if (analysis.requirements.informationTypes.includes('examples')) {
            elements.push('구체적 사례', '실제 예시');
        }

        if (analysis.requirements.evidenceNeeded.includes('sources')) {
            elements.push('신뢰할 수 있는 출처', '참고 자료');
        }

        return elements;
    }

    private determineTone(analysis: QuestionAnalysis): string {
        if (analysis.context.domain.includes('business') || analysis.context.domain.includes('finance')) {
            return 'professional';
        } else if (analysis.intent.expectedDepth === 'expert') {
            return 'technical';
        } else if (analysis.complexity === 'simple') {
            return 'conversational';
        } else {
            return 'informative';
        }
    }

    private determineDepthGuidelines(analysis: QuestionAnalysis): string {
        switch (analysis.intent.expectedDepth) {
            case 'expert':
                return '전문적 수준의 상세한 분석과 기술적 세부사항 포함';
            case 'comprehensive':
                return '종합적이고 다각적인 관점에서 포괄적 설명';
            case 'detailed':
                return '구체적 예시와 단계별 설명을 포함한 상세 답변';
            default:
                return '핵심 내용을 명확하고 간결하게 전달';
        }
    }

    private generateEvidenceRequirements(analysis: QuestionAnalysis, webSearchResults?: any[]): string[] {
        const requirements: string[] = [];

        if (analysis.requirements.evidenceNeeded.includes('factual_evidence')) {
            requirements.push('검증 가능한 사실 정보');
        }

        if (analysis.requirements.evidenceNeeded.includes('sources')) {
            requirements.push('신뢰할 수 있는 출처 명시');
        }

        if (webSearchResults && webSearchResults.length > 0) {
            requirements.push('웹 검색 결과를 활용한 최신 정보');
        }

        if (analysis.context.domain.includes('real_estate')) {
            requirements.push('부동산 관련 법적, 기술적 근거');
        }

        return requirements;
    }
}

export const advancedNLPService = new AdvancedNLPService();