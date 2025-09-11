import { sendChatMessage, ChatRequest } from './unifiedAPI';

export interface ResponseStep {
    id: string;
    name: string;
    type: 'analysis' | 'research' | 'synthesis' | 'validation' | 'formatting';
    description: string;
    required: boolean;
    order: number;
}

export interface MultiStepResponse {
    steps: ResponseStep[];
    currentStep: number;
    results: Record<string, unknown>;
    finalResponse: string;
    isComplete: boolean;
    confidence: number;
}

export interface ResponseStrategy {
    id: string;
    name: string;
    description: string;
    complexity: 'simple' | 'moderate' | 'complex';
    steps: ResponseStep[];
    conditions: {
        minTokens: number;
        requiresAnalysis: boolean;
        requiresResearch: boolean;
        requiresValidation: boolean;
    };
}

// 응답 전략 정의
const RESPONSE_STRATEGIES: ResponseStrategy[] = [
    {
        id: 'simple-direct',
        name: '단순 직접 응답',
        description: '간단한 질문에 대한 직접적인 응답',
        complexity: 'simple',
        steps: [
            {
                id: 'direct-response',
                name: '직접 응답 생성',
                type: 'synthesis',
                description: '질문에 대한 직접적인 답변 생성',
                required: true,
                order: 1
            }
        ],
        conditions: {
            minTokens: 0,
            requiresAnalysis: false,
            requiresResearch: false,
            requiresValidation: false
        }
    },
    {
        id: 'moderate-analysis',
        name: '분석 기반 응답',
        description: '분석이 필요한 질문에 대한 체계적 응답',
        complexity: 'moderate',
        steps: [
            {
                id: 'question-analysis',
                name: '질문 분석',
                type: 'analysis',
                description: '질문의 핵심 요구사항과 맥락 분석',
                required: true,
                order: 1
            },
            {
                id: 'context-research',
                name: '컨텍스트 조사',
                type: 'research',
                description: '관련 정보 및 컨텍스트 수집',
                required: true,
                order: 2
            },
            {
                id: 'response-synthesis',
                name: '응답 합성',
                type: 'synthesis',
                description: '분석 결과를 바탕으로 응답 생성',
                required: true,
                order: 3
            },
            {
                id: 'basic-validation',
                name: '기본 검증',
                type: 'validation',
                description: '응답의 정확성 및 일관성 검증',
                required: false,
                order: 4
            }
        ],
        conditions: {
            minTokens: 50,
            requiresAnalysis: true,
            requiresResearch: true,
            requiresValidation: false
        }
    },
    {
        id: 'complex-multi-step',
        name: '복합 다단계 응답',
        description: '복잡한 질문에 대한 포괄적이고 정확한 응답',
        complexity: 'complex',
        steps: [
            {
                id: 'deep-analysis',
                name: '심층 분석',
                type: 'analysis',
                description: '질문의 복잡성과 요구사항 심층 분석',
                required: true,
                order: 1
            },
            {
                id: 'comprehensive-research',
                name: '포괄적 조사',
                type: 'research',
                description: '다양한 관점과 정보 수집',
                required: true,
                order: 2
            },
            {
                id: 'multi-perspective-synthesis',
                name: '다관점 합성',
                type: 'synthesis',
                description: '여러 관점을 종합한 응답 생성',
                required: true,
                order: 3
            },
            {
                id: 'rigorous-validation',
                name: '엄격한 검증',
                type: 'validation',
                description: '응답의 정확성, 일관성, 완전성 검증',
                required: true,
                order: 4
            },
            {
                id: 'response-formatting',
                name: '응답 포맷팅',
                type: 'formatting',
                description: '최종 응답의 구조화 및 가독성 개선',
                required: true,
                order: 5
            }
        ],
        conditions: {
            minTokens: 100,
            requiresAnalysis: true,
            requiresResearch: true,
            requiresValidation: true
        }
    }
];

// 질문 복잡도 분석
export const analyzeQuestionComplexity = (question: string, context: Record<string, unknown>): {
    complexity: 'simple' | 'moderate' | 'complex';
    score: number;
    factors: string[];
} => {
    const factors: string[] = [];
    let score = 0;

    // 질문 길이 분석
    const wordCount = question.split(/\s+/).length;
    if (wordCount > 50) {
        score += 3;
        factors.push('긴 질문');
    } else if (wordCount > 20) {
        score += 2;
        factors.push('중간 길이 질문');
    } else {
        score += 1;
        factors.push('짧은 질문');
    }

    // 복잡한 키워드 분석
    const complexKeywords = [
        '분석', '비교', '평가', '검토', '연구', '조사', '설명', '논의',
        'why', 'how', 'what if', 'compare', 'analyze', 'evaluate', 'review',
        'research', 'investigate', 'explain', 'discuss'
    ];

    const hasComplexKeywords = complexKeywords.some(keyword =>
        question.toLowerCase().includes(keyword.toLowerCase())
    );
    if (hasComplexKeywords) {
        score += 2;
        factors.push('복잡한 키워드 포함');
    }

    // 다중 질문 분석
    const questionMarks = (question.match(/\?/g) || []).length;
    if (questionMarks > 1) {
        score += 2;
        factors.push('다중 질문');
    }

    // 컨텍스트 복잡도 분석
    const contextKeys = Object.keys(context);
    if (contextKeys.length > 5) {
        score += 2;
        factors.push('풍부한 컨텍스트');
    } else if (contextKeys.length > 2) {
        score += 1;
        factors.push('일반적인 컨텍스트');
    }

    // 점수에 따른 복잡도 결정
    let complexity: 'simple' | 'moderate' | 'complex';
    if (score <= 3) {
        complexity = 'simple';
    } else if (score <= 6) {
        complexity = 'moderate';
    } else {
        complexity = 'complex';
    }

    return { complexity, score, factors };
};

// 적절한 응답 전략 선택
export const selectResponseStrategy = (
    question: string,
    context: Record<string, unknown>
): ResponseStrategy => {
    const analysis = analyzeQuestionComplexity(question, context);

    // 복잡도에 따른 전략 선택
    const strategies = RESPONSE_STRATEGIES.filter(strategy =>
        strategy.complexity === analysis.complexity
    );

    // 가장 적합한 전략 선택 (조건에 따라)
    if (strategies.length === 1) {
        return strategies[0];
    }

    // 여러 전략이 있는 경우 조건에 따라 선택
    const questionLength = question.length;
    const hasComplexKeywords = question.includes('분석') || question.includes('비교') || question.includes('평가');
    const hasMultipleQuestions = (question.match(/\?/g) || []).length > 1;

    if (questionLength > 200 || hasComplexKeywords || hasMultipleQuestions) {
        return strategies.find(s => s.complexity === 'complex') || strategies[0];
    } else if (questionLength > 100) {
        return strategies.find(s => s.complexity === 'moderate') || strategies[0];
    } else {
        return strategies.find(s => s.complexity === 'simple') || strategies[0];
    }
};

// 단계별 응답 생성
export const executeResponseStep = async (
    step: ResponseStep,
    question: string,
    context: Record<string, unknown>,
    previousResults: Record<string, unknown>
): Promise<unknown> => {
    const stepPrompts = {
        analysis: `다음 질문을 심층적으로 분석해주세요:

질문: ${question}
컨텍스트: ${JSON.stringify(context, null, 2)}

분석해야 할 요소:
1. 질문의 핵심 요구사항
2. 질문의 맥락과 배경
3. 필요한 정보 유형
4. 응답에 필요한 구조

분석 결과를 JSON 형태로 제공해주세요.`,

        research: `다음 질문에 대한 관련 정보를 조사해주세요:

질문: ${question}
컨텍스트: ${JSON.stringify(context, null, 2)}
이전 분석 결과: ${JSON.stringify(previousResults, null, 2)}

조사해야 할 정보:
1. 관련 사실과 데이터
2. 다양한 관점과 의견
3. 관련 예시와 사례
4. 추가 고려사항

조사 결과를 구조화된 형태로 제공해주세요.`,

        synthesis: `다음 정보를 바탕으로 종합적인 응답을 생성해주세요:

질문: ${question}
분석 결과: ${JSON.stringify(previousResults, null, 2)}
조사 결과: ${JSON.stringify(previousResults, null, 2)}

응답 요구사항:
1. 질문에 대한 직접적이고 명확한 답변
2. 논리적이고 구조화된 설명
3. 관련 예시나 근거 포함
4. 읽기 쉽고 이해하기 쉬운 형태

최종 응답을 생성해주세요.`,

        validation: `다음 응답의 품질을 검증해주세요:

질문: ${question}
생성된 응답: ${JSON.stringify(previousResults, null, 2)}

검증 항목:
1. 정확성: 사실과 정보의 정확성
2. 완전성: 질문에 대한 완전한 답변
3. 일관성: 논리적 일관성
4. 명확성: 표현의 명확성

검증 결과와 개선 제안을 제공해주세요.`,

        formatting: `다음 응답을 최종 형태로 포맷팅해주세요:

원본 응답: ${JSON.stringify(previousResults, null, 2)}

포맷팅 요구사항:
1. 마크다운 형식으로 구조화
2. 적절한 제목과 소제목 사용
3. 목록과 강조 효과 활용
4. 가독성과 이해도 향상

최종 포맷팅된 응답을 제공해주세요.`
    };

    const prompt = stepPrompts[step.type] || stepPrompts.synthesis;

    const chatRequest: ChatRequest = {
        message: prompt,
        context,
        options: {
            intent: step.type,
            style: 'detailed',
            tone: 'professional',
            requireCitations: true
        }
    };

    try {
        const response = await sendChatMessage(chatRequest);
        if (response.success && response.message) {
            return {
                stepId: step.id,
                stepName: step.name,
                result: response.message.content,
                metadata: {}
            };
        } else {
            throw new Error('API 응답 실패');
        }
    } catch (error) {
        console.error(`Step ${step.name} 실행 오류:`, error);
        return {
            stepId: step.id,
            stepName: step.name,
            result: `Step ${step.name} 실행 중 오류가 발생했습니다.`,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

// 다단계 응답 생성 메인 함수
export const generateMultiStepResponse = async (
    question: string,
    context: Record<string, unknown>
): Promise<MultiStepResponse> => {
    // 응답 전략 선택
    const strategy = selectResponseStrategy(question, context);

    // 응답 객체 초기화
    const response: MultiStepResponse = {
        steps: strategy.steps,
        currentStep: 0,
        results: {},
        finalResponse: '',
        isComplete: false,
        confidence: 0
    };

    console.log(`선택된 전략: ${strategy.name} (복잡도: ${strategy.complexity})`);

    // 각 단계 순차 실행
    for (let i = 0; i < strategy.steps.length; i++) {
        const step = strategy.steps[i];
        response.currentStep = i + 1;

        console.log(`단계 ${i + 1}/${strategy.steps.length}: ${step.name} 실행 중...`);

        try {
            const stepResult = await executeResponseStep(step, question, context, response.results);
            response.results[step.id] = stepResult;

            // 단계별 신뢰도 계산
            if (stepResult && typeof stepResult === 'object' && 'metadata' in stepResult) {
                const metadata = stepResult.metadata as any;
                if (metadata.confidence) {
                    response.confidence = (response.confidence + metadata.confidence) / 2;
                }
            }

        } catch (error) {
            console.error(`단계 ${step.name} 실행 실패:`, error);
            response.results[step.id] = {
                error: error instanceof Error ? error.message : 'Unknown error',
                stepId: step.id,
                stepName: step.name
            };
        }
    }

    // 최종 응답 생성
    const synthesisResult = response.results['response-synthesis'] || response.results['multi-perspective-synthesis'] || response.results['direct-response'];
    const formattingResult = response.results['response-formatting'];

    if (formattingResult && typeof formattingResult === 'object' && 'result' in formattingResult) {
        response.finalResponse = formattingResult.result as string;
    } else if (synthesisResult && typeof synthesisResult === 'object' && 'result' in synthesisResult) {
        response.finalResponse = synthesisResult.result as string;
    } else {
        response.finalResponse = '응답 생성 중 오류가 발생했습니다.';
    }

    response.isComplete = true;
    response.currentStep = strategy.steps.length;

    console.log(`다단계 응답 생성 완료. 최종 신뢰도: ${response.confidence}`);

    return response;
};

// 응답 품질 평가
export const evaluateResponseQuality = (response: MultiStepResponse): {
    score: number;
    feedback: string[];
    suggestions: string[];
} => {
    const feedback: string[] = [];
    const suggestions: string[] = [];
    let score = 0;

    // 단계 완성도 평가
    const completedSteps = Object.keys(response.results).length;
    const totalSteps = response.steps.length;
    const completionRate = completedSteps / totalSteps;

    if (completionRate >= 0.9) {
        score += 30;
        feedback.push('모든 단계가 완료되었습니다.');
    } else if (completionRate >= 0.7) {
        score += 20;
        feedback.push('대부분의 단계가 완료되었습니다.');
        suggestions.push('누락된 단계를 확인해보세요.');
    } else {
        score += 10;
        feedback.push('일부 단계가 누락되었습니다.');
        suggestions.push('모든 단계를 완료하도록 개선하세요.');
    }

    // 신뢰도 평가
    if (response.confidence >= 0.8) {
        score += 30;
        feedback.push('높은 신뢰도를 보입니다.');
    } else if (response.confidence >= 0.6) {
        score += 20;
        feedback.push('적절한 신뢰도를 보입니다.');
        suggestions.push('신뢰도를 높이기 위해 추가 검증을 고려하세요.');
    } else {
        score += 10;
        feedback.push('신뢰도가 낮습니다.');
        suggestions.push('응답의 정확성을 검증하고 개선하세요.');
    }

    // 오류 평가
    const errorCount = Object.values(response.results).filter(result =>
        result && typeof result === 'object' && 'error' in result
    ).length;

    if (errorCount === 0) {
        score += 40;
        feedback.push('오류 없이 완료되었습니다.');
    } else if (errorCount <= 2) {
        score += 20;
        feedback.push(`일부 오류가 발생했습니다 (${errorCount}개).`);
        suggestions.push('오류가 발생한 단계를 재실행해보세요.');
    } else {
        score += 0;
        feedback.push(`여러 오류가 발생했습니다 (${errorCount}개).`);
        suggestions.push('전체 프로세스를 재검토하고 개선하세요.');
    }

    return { score, feedback, suggestions };
};
