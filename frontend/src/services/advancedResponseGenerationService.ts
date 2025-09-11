import { QuestionUnderstandingResult } from './advancedQuestionUnderstandingEngine';
import { ConversationMemory } from './advancedConversationMemoryService';
import { LearningExperience } from './personalizedLearningExperienceService';

export interface ResponseGenerationRequest {
    user_input: string;
    user_id: string;
    session_id: string;
    conversation_memory: ConversationMemory;
    learning_experience: LearningExperience;
    understanding_result: QuestionUnderstandingResult;
    context: any;
}

export interface ResponseGenerationResult {
    content: string;
    response_type: 'informative' | 'educational' | 'problem_solving' | 'conversational' | 'analytical';
    confidence_score: number;
    processing_time: number;
    personalized_content: boolean;
    memory_integrated: boolean;
    learning_insights: LearningInsights;
    metadata: ResponseMetadata;
    alternatives: string[];
    follow_up_questions: string[];
}

export interface LearningInsights {
    current_progress?: number;
    module_id?: string;
    performance_score?: number;
    skill_gaps?: SkillGap[];
    next_recommendation?: string;
    learning_path_suggestion?: string;
    difficulty_adjustment?: number;
}

export interface SkillGap {
    skill_name: string;
    description: string;
    impact_level: 'low' | 'medium' | 'high' | 'critical';
    suggested_resources: string[];
}

export interface ResponseMetadata {
    model_used: string;
    response_strategy: string;
    content_adaptation: ContentAdaptation;
    user_preference_match: number;
    complexity_level: number;
    response_length: 'short' | 'medium' | 'long';
    includes_examples: boolean;
    includes_code: boolean;
    includes_visual_aids: boolean;
}

export interface ContentAdaptation {
    learning_style_adapted: boolean;
    expertise_level_adapted: boolean;
    communication_style_adapted: boolean;
    response_length_adapted: boolean;
    example_type_adapted: boolean;
}

class AdvancedResponseGenerationService {
    private responseTemplates: Map<string, string[]> = new Map();
    private codeExamples: Map<string, string[]> = new Map();
    private visualAids: Map<string, string[]> = new Map();
    private followUpQuestions: Map<string, string[]> = new Map();

    constructor() {
        this.initializeResponseTemplates();
        this.initializeCodeExamples();
        this.initializeVisualAids();
        this.initializeFollowUpQuestions();
    }

    // 메인 응답 생성 메서드
    async generateResponse(request: ResponseGenerationRequest): Promise<ResponseGenerationResult> {
        const startTime = Date.now();

        try {
            // 1. 응답 전략 결정
            const responseStrategy = this.determineResponseStrategy(request);

            // 2. 기본 응답 생성
            const baseResponse = await this.generateBaseResponse(request, responseStrategy);

            // 3. 개인화 적용
            const personalizedResponse = await this.applyPersonalization(baseResponse, request);

            // 4. 학습 인사이트 생성
            const learningInsights = await this.generateLearningInsights(request);

            // 5. 대안 응답 생성
            const alternatives = await this.generateAlternativeResponses(request, responseStrategy);

            // 6. 후속 질문 생성
            const followUpQuestions = await this.generateFollowUpQuestions(request, personalizedResponse);

            const processingTime = Date.now() - startTime;

            return {
                content: personalizedResponse,
                response_type: responseStrategy.type,
                confidence_score: this.calculateConfidenceScore(request, responseStrategy),
                processing_time: processingTime,
                personalized_content: true,
                memory_integrated: true,
                learning_insights: learningInsights,
                metadata: this.generateMetadata(request, responseStrategy, personalizedResponse),
                alternatives: alternatives,
                follow_up_questions: followUpQuestions
            };

        } catch (error) {
            console.error('Response generation error:', error);
            return this.generateFallbackResponse(request, Date.now() - startTime);
        }
    }

    // 응답 전략 결정
    private determineResponseStrategy(request: ResponseGenerationRequest): any {
        const understanding = request.understanding_result;
        const intent = understanding.intent_clarification.primary_intent;
        const complexity = understanding.semantic_analysis.complexity_assessment.overall_complexity;
        const domain = understanding.semantic_analysis.domain_classification.primary_domain;
        const userProfile = request.conversation_memory.user_profile;

        let strategy = {
            type: 'informative' as const,
            approach: 'direct',
            detail_level: 'moderate',
            include_examples: false,
            include_code: false,
            include_visual_aids: false,
            tone: 'professional'
        };

        // 의도 기반 전략
        switch (intent) {
            case 'learning':
                strategy.type = 'informative';
                strategy.include_examples = true;
                strategy.detail_level = 'detailed';
                break;
            case 'problem_solving':
                strategy.type = 'informative';
                strategy.include_code = true;
                strategy.approach = 'step_by_step';
                break;
            case 'analysis':
                strategy.type = 'informative';
                strategy.include_visual_aids = true;
                strategy.detail_level = 'detailed';
                break;
            case 'conversation':
                strategy.type = 'informative';
                strategy.tone = 'casual';
                strategy.detail_level = 'concise';
                break;
        }

        // 복잡도 기반 조정
        if (complexity > 8) {
            strategy.detail_level = 'detailed';
            strategy.include_examples = true;
        } else if (complexity < 4) {
            strategy.detail_level = 'concise';
        }

        // 도메인 기반 조정
        if (domain === 'programming' || domain === 'web_development') {
            strategy.include_code = true;
        }

        // 사용자 프로필 기반 조정
        if (userProfile.learning_style === 'visual') {
            strategy.include_visual_aids = true;
        }

        if (userProfile.response_length_preference === 'detailed') {
            strategy.detail_level = 'detailed';
        } else if (userProfile.response_length_preference === 'concise') {
            strategy.detail_level = 'concise';
        }

        return strategy;
    }

    // 기본 응답 생성
    private async generateBaseResponse(request: ResponseGenerationRequest, strategy: any): Promise<string> {
        const understanding = request.understanding_result;
        const coreConcepts = understanding.semantic_analysis.core_concepts;
        const domain = understanding.semantic_analysis.domain_classification.primary_domain;

        let response = '';

        // 도메인별 기본 응답 생성
        switch (domain) {
            case 'programming':
                response = this.generateProgrammingResponse(request, strategy);
                break;
            case 'web_development':
                response = this.generateWebDevelopmentResponse(request, strategy);
                break;
            case 'database':
                response = this.generateDatabaseResponse(request, strategy);
                break;
            case 'ai_ml':
                response = this.generateAIMLResponse(request, strategy);
                break;
            default:
                response = this.generateGeneralResponse(request, strategy);
        }

        // 전략에 따른 응답 조정
        response = this.adjustResponseByStrategy(response, strategy);

        return response;
    }

    // 프로그래밍 응답 생성
    private generateProgrammingResponse(request: ResponseGenerationRequest, strategy: any): string {
        const concepts = request.understanding_result.semantic_analysis.core_concepts;
        const programmingConcepts = concepts.filter(c =>
            c.type === 'entity' && ['function', 'class', 'variable', 'algorithm'].includes(c.concept.toLowerCase())
        );

        let response = '';

        if (programmingConcepts.length > 0) {
            const mainConcept = programmingConcepts[0];
            response = `${mainConcept.concept}에 대해 설명드리겠습니다.\n\n`;

            if (strategy.include_code) {
                const codeExample = this.getCodeExample(mainConcept.concept);
                if (codeExample) {
                    response += `**코드 예시:**\n\`\`\`javascript\n${codeExample}\n\`\`\`\n\n`;
                }
            }

            response += this.getConceptExplanation(mainConcept.concept);
        } else {
            response = '프로그래밍 관련 질문에 답변드리겠습니다.\n\n';
            response += this.getGeneralProgrammingAdvice();
        }

        return response;
    }

    // 웹 개발 응답 생성
    private generateWebDevelopmentResponse(request: ResponseGenerationRequest, strategy: any): string {
        const concepts = request.understanding_result.semantic_analysis.core_concepts;
        const webConcepts = concepts.filter(c =>
            ['html', 'css', 'javascript', 'react', 'api', 'frontend', 'backend'].includes(c.concept.toLowerCase())
        );

        let response = '';

        if (webConcepts.length > 0) {
            const mainConcept = webConcepts[0];
            response = `${mainConcept.concept}에 대해 설명드리겠습니다.\n\n`;

            if (strategy.include_code) {
                const codeExample = this.getCodeExample(mainConcept.concept);
                if (codeExample) {
                    response += `**코드 예시:**\n\`\`\`javascript\n${codeExample}\n\`\`\`\n\n`;
                }
            }

            response += this.getWebDevelopmentExplanation(mainConcept.concept);
        } else {
            response = '웹 개발 관련 질문에 답변드리겠습니다.\n\n';
            response += this.getGeneralWebDevelopmentAdvice();
        }

        return response;
    }

    // 데이터베이스 응답 생성
    private generateDatabaseResponse(request: ResponseGenerationRequest, strategy: any): string {
        const concepts = request.understanding_result.semantic_analysis.core_concepts;
        const dbConcepts = concepts.filter(c =>
            ['database', 'sql', 'query', 'table', 'index'].includes(c.concept.toLowerCase())
        );

        let response = '';

        if (dbConcepts.length > 0) {
            const mainConcept = dbConcepts[0];
            response = `${mainConcept.concept}에 대해 설명드리겠습니다.\n\n`;

            if (strategy.include_code) {
                const codeExample = this.getCodeExample(mainConcept.concept);
                if (codeExample) {
                    response += `**SQL 예시:**\n\`\`\`sql\n${codeExample}\n\`\`\`\n\n`;
                }
            }

            response += this.getDatabaseExplanation(mainConcept.concept);
        } else {
            response = '데이터베이스 관련 질문에 답변드리겠습니다.\n\n';
            response += this.getGeneralDatabaseAdvice();
        }

        return response;
    }

    // AI/ML 응답 생성
    private generateAIMLResponse(request: ResponseGenerationRequest, strategy: any): string {
        const concepts = request.understanding_result.semantic_analysis.core_concepts;
        const aiConcepts = concepts.filter(c =>
            ['ai', 'machine learning', 'neural network', 'algorithm', 'model'].includes(c.concept.toLowerCase())
        );

        let response = '';

        if (aiConcepts.length > 0) {
            const mainConcept = aiConcepts[0];
            response = `${mainConcept.concept}에 대해 설명드리겠습니다.\n\n`;

            if (strategy.include_code) {
                const codeExample = this.getCodeExample(mainConcept.concept);
                if (codeExample) {
                    response += `**Python 예시:**\n\`\`\`python\n${codeExample}\n\`\`\`\n\n`;
                }
            }

            response += this.getAIMLExplanation(mainConcept.concept);
        } else {
            response = 'AI/ML 관련 질문에 답변드리겠습니다.\n\n';
            response += this.getGeneralAIMLAdvice();
        }

        return response;
    }

    // 일반 응답 생성
    private generateGeneralResponse(request: ResponseGenerationRequest, strategy: any): string {
        const concepts = request.understanding_result.semantic_analysis.core_concepts;

        if (concepts.length > 0) {
            const mainConcept = concepts[0];
            return `${mainConcept.concept}에 대해 답변드리겠습니다.\n\n${this.getGeneralExplanation(mainConcept.concept)}`;
        } else {
            return '질문에 대해 답변드리겠습니다.\n\n' + this.getGeneralAdvice();
        }
    }

    // 전략에 따른 응답 조정
    private adjustResponseByStrategy(response: string, strategy: any): string {
        let adjustedResponse = response;

        // 상세도 조정
        if (strategy.detail_level === 'concise') {
            adjustedResponse = this.makeResponseConcise(adjustedResponse);
        } else if (strategy.detail_level === 'detailed') {
            adjustedResponse = this.makeResponseDetailed(adjustedResponse);
        }

        // 톤 조정
        if (strategy.tone === 'casual') {
            adjustedResponse = this.makeResponseCasual(adjustedResponse);
        }

        return adjustedResponse;
    }

    // 개인화 적용
    private async applyPersonalization(baseResponse: string, request: ResponseGenerationRequest): Promise<string> {
        const userProfile = request.conversation_memory.user_profile;
        const learningExperience = request.learning_experience;
        let personalizedResponse = baseResponse;

        // 학습 스타일 기반 개인화
        if (userProfile.learning_style === 'visual') {
            personalizedResponse = this.addVisualElements(personalizedResponse);
        }

        if (userProfile.learning_style === 'kinesthetic') {
            personalizedResponse = this.addPracticalExamples(personalizedResponse);
        }

        // 전문성 수준 기반 조정
        if (userProfile.expertise_level === 'beginner') {
            personalizedResponse = this.simplifyForBeginner(personalizedResponse);
        } else if (userProfile.expertise_level === 'expert') {
            personalizedResponse = this.addAdvancedContent(personalizedResponse);
        }

        // 학습 경험 기반 개인화
        if (learningExperience) {
            personalizedResponse = this.addLearningContext(personalizedResponse, learningExperience);
        }

        // 대화 히스토리 기반 개인화
        const conversationHistory = request.conversation_memory.conversation_history;
        if (conversationHistory.length > 0) {
            personalizedResponse = this.addConversationContext(personalizedResponse, conversationHistory);
        }

        return personalizedResponse;
    }

    // 학습 인사이트 생성
    private async generateLearningInsights(request: ResponseGenerationRequest): Promise<LearningInsights> {
        const learningExperience = request.learning_experience;
        const understanding = request.understanding_result;
        const userProfile = request.conversation_memory.user_profile;

        const insights: LearningInsights = {};

        // 현재 진행률 계산
        if (learningExperience?.current_learning_path) {
            insights.current_progress = learningExperience.current_learning_path.completion_percentage;
            insights.module_id = learningExperience.current_learning_path.modules[learningExperience.current_learning_path.current_module_index]?.module_id;
        }

        // 성능 점수 추정
        const complexity = understanding.semantic_analysis.complexity_assessment.overall_complexity;
        const expertiseLevel = this.getExpertiseLevelNumber(userProfile.expertise_level);
        insights.performance_score = Math.max(0, Math.min(100,
            (expertiseLevel / complexity) * 100
        ));

        // 지식 격차 식별
        insights.skill_gaps = this.identifySkillGaps(understanding, userProfile);

        // 다음 추천 생성
        insights.next_recommendation = this.generateNextRecommendation(learningExperience, understanding);

        // 난이도 조정 제안
        insights.difficulty_adjustment = this.suggestDifficultyAdjustment(complexity, expertiseLevel);

        return insights;
    }

    // 대안 응답 생성
    private async generateAlternativeResponses(request: ResponseGenerationRequest, strategy: any): Promise<string[]> {
        const alternatives: string[] = [];
        const baseResponse = await this.generateBaseResponse(request, strategy);

        // 다른 접근 방식으로 응답 생성
        const alternativeStrategies = [
            { ...strategy, detail_level: 'concise' },
            { ...strategy, detail_level: 'detailed' },
            { ...strategy, include_examples: !strategy.include_examples },
            { ...strategy, include_code: !strategy.include_code }
        ];

        for (const altStrategy of alternativeStrategies.slice(0, 2)) {
            const altResponse = await this.generateBaseResponse(request, altStrategy);
            if (altResponse !== baseResponse) {
                alternatives.push(altResponse);
            }
        }

        return alternatives;
    }

    // 후속 질문 생성
    private async generateFollowUpQuestions(request: ResponseGenerationRequest, response: string): Promise<string[]> {
        const understanding = request.understanding_result;
        const domain = understanding.semantic_analysis.domain_classification.primary_domain;
        const concepts = understanding.semantic_analysis.core_concepts;

        const questions: string[] = [];

        // 도메인별 후속 질문
        switch (domain) {
            case 'programming':
                questions.push('이 개념을 실제 프로젝트에 어떻게 적용할 수 있을까요?');
                questions.push('더 심화된 내용을 알고 싶으시나요?');
                break;
            case 'web_development':
                questions.push('이 기술의 최신 트렌드는 무엇인가요?');
                questions.push('실무에서 자주 사용되는 패턴이 있나요?');
                break;
            case 'database':
                questions.push('성능 최적화 방법에 대해 알고 싶으시나요?');
                questions.push('다른 데이터베이스와의 차이점이 궁금하시나요?');
                break;
            default:
                questions.push('이 주제에 대해 더 자세히 알고 싶은 부분이 있나요?');
                questions.push('실제 예시를 통해 설명해드릴까요?');
        }

        // 복잡도 기반 후속 질문
        const complexity = understanding.semantic_analysis.complexity_assessment.overall_complexity;
        if (complexity > 7) {
            questions.push('기본 개념부터 차근차근 설명해드릴까요?');
        } else if (complexity < 4) {
            questions.push('더 고급 주제로 넘어가볼까요?');
        }

        return questions.slice(0, 3);
    }

    // 신뢰도 점수 계산
    private calculateConfidenceScore(request: ResponseGenerationRequest, strategy: any): number {
        const understanding = request.understanding_result;
        let score = 0.8; // 기본 점수

        // 이해 결과 기반 조정
        score += understanding.confidence_score * 0.1;

        // 복잡도 기반 조정
        const complexity = understanding.semantic_analysis.complexity_assessment.overall_complexity;
        if (complexity > 8) {
            score -= 0.1; // 복잡한 질문은 신뢰도 감소
        }

        // 도메인 기반 조정
        const domain = understanding.semantic_analysis.domain_classification.primary_domain;
        if (domain !== 'general') {
            score += 0.05; // 특정 도메인은 신뢰도 증가
        }

        return Math.max(0.1, Math.min(1.0, score));
    }

    // 메타데이터 생성
    private generateMetadata(request: ResponseGenerationRequest, strategy: any, response: string): ResponseMetadata {
        const userProfile = request.conversation_memory.user_profile;

        return {
            model_used: 'advanced-response-generator',
            response_strategy: strategy.type,
            content_adaptation: {
                learning_style_adapted: true,
                expertise_level_adapted: true,
                communication_style_adapted: true,
                response_length_adapted: strategy.detail_level !== 'moderate',
                example_type_adapted: strategy.include_examples || strategy.include_code
            },
            user_preference_match: this.calculateUserPreferenceMatch(response, userProfile),
            complexity_level: request.understanding_result.semantic_analysis.complexity_assessment.overall_complexity,
            response_length: this.determineResponseLength(response),
            includes_examples: strategy.include_examples,
            includes_code: strategy.include_code,
            includes_visual_aids: strategy.include_visual_aids
        };
    }

    // 폴백 응답 생성
    private generateFallbackResponse(request: ResponseGenerationRequest, processingTime: number): ResponseGenerationResult {
        return {
            content: '죄송합니다. 응답을 생성하는 중에 오류가 발생했습니다. 다시 시도해주시거나 다른 방식으로 질문해주세요.',
            response_type: 'informative',
            confidence_score: 0.1,
            processing_time: processingTime,
            personalized_content: false,
            memory_integrated: false,
            learning_insights: {},
            metadata: {
                model_used: 'fallback-generator',
                response_strategy: 'error-handling',
                content_adaptation: {
                    learning_style_adapted: false,
                    expertise_level_adapted: false,
                    communication_style_adapted: false,
                    response_length_adapted: false,
                    example_type_adapted: false
                },
                user_preference_match: 0,
                complexity_level: 1,
                response_length: 'short',
                includes_examples: false,
                includes_code: false,
                includes_visual_aids: false
            },
            alternatives: [],
            follow_up_questions: ['다시 시도해보시겠어요?', '다른 방식으로 질문해주세요.']
        };
    }

    // 헬퍼 메서드들
    private getCodeExample(concept: string): string {
        const examples = this.codeExamples.get(concept.toLowerCase()) || [];
        return examples[0] || '';
    }

    private getConceptExplanation(concept: string): string {
        const explanations: { [key: string]: string } = {
            'function': '함수는 특정 작업을 수행하는 코드 블록입니다. 재사용 가능하고 모듈화된 코드를 작성할 수 있게 해줍니다.',
            'class': '클래스는 객체 지향 프로그래밍의 기본 단위입니다. 데이터와 그 데이터를 조작하는 메서드를 함께 캡슐화합니다.',
            'variable': '변수는 데이터를 저장하는 컨테이너입니다. 프로그램 실행 중에 값이 변경될 수 있습니다.',
            'algorithm': '알고리즘은 문제를 해결하기 위한 단계별 절차입니다. 효율성과 정확성이 중요합니다.'
        };

        return explanations[concept.toLowerCase()] || `${concept}에 대한 설명입니다.`;
    }

    private getWebDevelopmentExplanation(concept: string): string {
        const explanations: { [key: string]: string } = {
            'html': 'HTML은 웹 페이지의 구조를 정의하는 마크업 언어입니다. 시맨틱 태그를 사용하여 의미있는 구조를 만듭니다.',
            'css': 'CSS는 웹 페이지의 스타일과 레이아웃을 정의합니다. 반응형 디자인과 애니메이션을 구현할 수 있습니다.',
            'javascript': 'JavaScript는 웹 페이지에 동적 기능을 추가하는 프로그래밍 언어입니다. 사용자 상호작용을 처리합니다.',
            'react': 'React는 사용자 인터페이스를 구축하기 위한 JavaScript 라이브러리입니다. 컴포넌트 기반 아키텍처를 제공합니다.'
        };

        return explanations[concept.toLowerCase()] || `${concept}에 대한 웹 개발 설명입니다.`;
    }

    private getDatabaseExplanation(concept: string): string {
        const explanations: { [key: string]: string } = {
            'database': '데이터베이스는 구조화된 데이터를 저장하고 관리하는 시스템입니다. 효율적인 데이터 검색과 수정을 지원합니다.',
            'sql': 'SQL은 관계형 데이터베이스에서 데이터를 조작하는 표준 언어입니다. 쿼리를 통해 데이터를 검색, 삽입, 수정, 삭제할 수 있습니다.',
            'query': '쿼리는 데이터베이스에서 특정 정보를 검색하기 위한 명령입니다. 조건과 정렬을 지정할 수 있습니다.',
            'table': '테이블은 데이터베이스에서 데이터를 저장하는 기본 구조입니다. 행과 열로 구성되어 있습니다.'
        };

        return explanations[concept.toLowerCase()] || `${concept}에 대한 데이터베이스 설명입니다.`;
    }

    private getAIMLExplanation(concept: string): string {
        const explanations: { [key: string]: string } = {
            'ai': '인공지능은 인간의 지능을 모방하는 컴퓨터 시스템입니다. 학습, 추론, 문제 해결 능력을 가집니다.',
            'machine learning': '머신러닝은 데이터로부터 패턴을 학습하여 예측이나 결정을 내리는 기술입니다.',
            'neural network': '신경망은 인간의 뇌를 모방한 알고리즘입니다. 복잡한 패턴을 인식하고 학습할 수 있습니다.',
            'algorithm': '알고리즘은 AI/ML에서 사용되는 수학적 절차입니다. 데이터 처리와 패턴 인식에 활용됩니다.'
        };

        return explanations[concept.toLowerCase()] || `${concept}에 대한 AI/ML 설명입니다.`;
    }

    private getGeneralExplanation(concept: string): string {
        return `${concept}에 대한 일반적인 설명입니다. 이 개념은 다양한 분야에서 활용될 수 있습니다.`;
    }

    private getGeneralProgrammingAdvice(): string {
        return '프로그래밍을 배울 때는 기본 개념부터 차근차근 학습하는 것이 중요합니다. 실습을 통해 개념을 익히고, 작은 프로젝트부터 시작해보세요.';
    }

    private getGeneralWebDevelopmentAdvice(): string {
        return '웹 개발은 HTML, CSS, JavaScript의 기본기를 탄탄히 하는 것이 중요합니다. 최신 프레임워크와 도구들도 함께 학습해보세요.';
    }

    private getGeneralDatabaseAdvice(): string {
        return '데이터베이스 설계는 정규화와 성능 최적화를 고려해야 합니다. SQL 기본 문법부터 시작하여 고급 쿼리까지 단계적으로 학습하세요.';
    }

    private getGeneralAIMLAdvice(): string {
        return 'AI/ML을 학습할 때는 수학적 기초가 중요합니다. 선형대수, 확률통계, 미적분학을 먼저 학습한 후 알고리즘을 이해해보세요.';
    }

    private getGeneralAdvice(): string {
        return '학습할 때는 기본 개념부터 차근차근 접근하는 것이 중요합니다. 실습과 이론을 병행하여 효과적으로 학습해보세요.';
    }

    private makeResponseConcise(response: string): string {
        const sentences = response.split('.');
        return sentences.slice(0, Math.min(3, sentences.length)).join('.') + '.';
    }

    private makeResponseDetailed(response: string): string {
        return response + '\n\n추가 설명: 이 개념은 실제 프로젝트에서 매우 중요하며, 다양한 상황에서 활용될 수 있습니다.';
    }

    private makeResponseCasual(response: string): string {
        return response.replace(/입니다\./g, '이에요.').replace(/합니다\./g, '해요.');
    }

    private addVisualElements(response: string): string {
        return response + '\n\n📊 시각적 다이어그램이나 차트를 통해 이 개념을 더 쉽게 이해할 수 있습니다.';
    }

    private addPracticalExamples(response: string): string {
        return response + '\n\n🔧 실제 프로젝트에서 이 개념을 어떻게 활용하는지 실습해보시는 것을 추천합니다.';
    }

    private simplifyForBeginner(response: string): string {
        return '기초부터 설명드리겠습니다.\n\n' + response + '\n\n💡 처음에는 이 정도만 이해하셔도 충분합니다.';
    }

    private addAdvancedContent(response: string): string {
        return response + '\n\n🚀 고급 팁: 실제 프로덕션 환경에서는 다음과 같은 고려사항들이 중요합니다.';
    }

    private addLearningContext(response: string, learningExperience: LearningExperience): string {
        const currentPath = learningExperience.current_learning_path;
        return response + `\n\n📚 현재 "${currentPath.path_name}" 학습 경로를 진행 중이시니, 이 개념이 다음 모듈과 연결됩니다.`;
    }

    private addConversationContext(response: string, conversationHistory: any[]): string {
        if (conversationHistory.length > 0) {
            const recentTopics = conversationHistory.slice(-3).map(entry => entry.context?.current_topic).filter(Boolean);
            if (recentTopics.length > 0) {
                return response + `\n\n💬 이전에 ${recentTopics[0]}에 대해 이야기했는데, 이번 주제와 연관이 있습니다.`;
            }
        }
        return response;
    }

    private getExpertiseLevelNumber(level: string): number {
        const levelMap: { [key: string]: number } = {
            'beginner': 3,
            'intermediate': 5,
            'advanced': 7,
            'expert': 9
        };
        return levelMap[level] || 5;
    }

    private identifySkillGaps(understanding: QuestionUnderstandingResult, userProfile: any): SkillGap[] {
        const gaps: SkillGap[] = [];
        const complexity = understanding.semantic_analysis.complexity_assessment.overall_complexity;
        const expertiseLevel = this.getExpertiseLevelNumber(userProfile.expertise_level);

        if (complexity > expertiseLevel + 2) {
            gaps.push({
                skill_name: '기본 개념',
                description: '이 주제의 기본 개념에 대한 이해가 부족합니다.',
                impact_level: 'high',
                suggested_resources: ['기초 튜토리얼', '개념 설명 문서']
            });
        }

        return gaps;
    }

    private generateNextRecommendation(learningExperience: LearningExperience, understanding: QuestionUnderstandingResult): string {
        if (learningExperience?.learning_recommendations?.length > 0) {
            return learningExperience.learning_recommendations[0].title;
        }
        return '다음 단계로 넘어가보세요.';
    }

    private suggestDifficultyAdjustment(complexity: number, expertiseLevel: number): number {
        const diff = complexity - expertiseLevel;
        if (diff > 2) return -1; // 난이도 감소
        if (diff < -2) return 1; // 난이도 증가
        return 0; // 유지
    }

    private calculateUserPreferenceMatch(response: string, userProfile: any): number {
        let match = 50; // 기본 점수

        // 응답 길이 매칭
        const responseLength = response.length;
        if (userProfile.response_length_preference === 'concise' && responseLength < 200) {
            match += 20;
        } else if (userProfile.response_length_preference === 'detailed' && responseLength > 500) {
            match += 20;
        }

        // 예시 포함 매칭
        if (userProfile.example_preference === 'code' && response.includes('```')) {
            match += 15;
        }

        return Math.min(100, match);
    }

    private determineResponseLength(response: string): 'short' | 'medium' | 'long' {
        const length = response.length;
        if (length < 200) return 'short';
        if (length < 500) return 'medium';
        return 'long';
    }

    // 초기화 메서드들
    private initializeResponseTemplates(): void {
        this.responseTemplates.set('programming', [
            '프로그래밍 개념에 대해 설명드리겠습니다.',
            '코드 예시와 함께 설명해드리겠습니다.',
            '실무에서 활용하는 방법을 알려드리겠습니다.'
        ]);
    }

    private initializeCodeExamples(): void {
        this.codeExamples.set('function', [
            'function greet(name) {\n  return `Hello, ${name}!`;\n}\n\ngreet("World"); // "Hello, World!"'
        ]);
        this.codeExamples.set('class', [
            'class Person {\n  constructor(name) {\n    this.name = name;\n  }\n  \n  greet() {\n    return `Hello, I\'m ${this.name}`;\n  }\n}'
        ]);
        this.codeExamples.set('react', [
            'function Welcome(props) {\n  return <h1>Hello, {props.name}</h1>;\n}\n\n<Welcome name="React" />'
        ]);
    }

    private initializeVisualAids(): void {
        this.visualAids.set('architecture', [
            '시스템 아키텍처 다이어그램',
            '데이터 플로우 차트',
            '컴포넌트 관계도'
        ]);
    }

    private initializeFollowUpQuestions(): void {
        this.followUpQuestions.set('programming', [
            '실제 프로젝트에 어떻게 적용할 수 있을까요?',
            '성능 최적화 방법은 무엇인가요?',
            '다른 언어에서는 어떻게 구현하나요?'
        ]);
    }
}

const advancedResponseGenerationService = new AdvancedResponseGenerationService();
export default advancedResponseGenerationService;
