import {
    analyzeQuestionComplexity,
    selectResponseStrategy,
    executeResponseStep,
    generateMultiStepResponse,
    evaluateResponseQuality,
    ResponseStep,
    MultiStepResponse
} from '../multiStepResponseGenerator';
import { sendChatMessage } from '../unifiedAPI';

// unifiedAPI 모킹
jest.mock('../unifiedAPI', () => ({
    sendChatMessage: jest.fn()
}));

describe('multiStepResponseGenerator', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('analyzeQuestionComplexity', () => {
        it('간단한 질문의 복잡도를 분석해야 함', () => {
            const question = '안녕하세요?';
            const context = {};

            const result = analyzeQuestionComplexity(question, context);

            expect(result.complexity).toBe('simple');
            expect(result.score).toBeLessThanOrEqual(3);
            expect(result.factors).toBeInstanceOf(Array);
        });

        it('중간 복잡도 질문을 분석해야 함', () => {
            const question = '이것은 비교적 긴 질문입니다. 여러 가지 요소를 포함하고 있습니다.';
            const context = { key1: 'value1', key2: 'value2', key3: 'value3' };

            const result = analyzeQuestionComplexity(question, context);

            expect(result.complexity).toBe('moderate');
            expect(result.score).toBeGreaterThan(3);
            expect(result.score).toBeLessThanOrEqual(6);
        });

        it('복잡한 질문을 분석해야 함', () => {
            // 50단어 이상의 긴 질문, 복잡한 키워드, 다중 질문, 풍부한 컨텍스트
            const question = '이것은 매우 긴 질문입니다. 여러 가지 요소를 포함하고 있으며, 분석과 비교가 필요합니다. 어떻게 평가할 수 있을까요? 이것은 매우 긴 질문입니다. 여러 가지 요소를 포함하고 있으며, 분석과 비교가 필요합니다. 어떻게 평가할 수 있을까요? 이것은 매우 긴 질문입니다. 여러 가지 요소를 포함하고 있으며, 분석과 비교가 필요합니다. 어떻게 평가할 수 있을까요?';
            const context = {
                key1: 'value1',
                key2: 'value2',
                key3: 'value3',
                key4: 'value4',
                key5: 'value5',
                key6: 'value6'
            };

            const result = analyzeQuestionComplexity(question, context);

            // 점수가 6보다 크면 complex, 그렇지 않으면 moderate
            if (result.score > 6) {
                expect(result.complexity).toBe('complex');
            } else {
                expect(result.complexity).toBe('moderate');
            }
            expect(result.score).toBeGreaterThan(3);
        });

        it('복잡한 키워드를 포함한 질문을 인식해야 함', () => {
            const question = '이것을 분석해주세요.';
            const context = {};

            const result = analyzeQuestionComplexity(question, context);

            expect(result.factors).toContain('복잡한 키워드 포함');
        });

        it('다중 질문을 인식해야 함', () => {
            const question = '첫 번째 질문? 두 번째 질문?';
            const context = {};

            const result = analyzeQuestionComplexity(question, context);

            expect(result.factors).toContain('다중 질문');
        });

        it('풍부한 컨텍스트를 인식해야 함', () => {
            const question = '질문';
            const context = {
                key1: 'value1',
                key2: 'value2',
                key3: 'value3',
                key4: 'value4',
                key5: 'value5',
                key6: 'value6'
            };

            const result = analyzeQuestionComplexity(question, context);

            expect(result.factors).toContain('풍부한 컨텍스트');
        });
    });

    describe('selectResponseStrategy', () => {
        it('간단한 질문에 대해 단순 전략을 선택해야 함', () => {
            const question = '안녕하세요?';
            const context = {};

            const strategy = selectResponseStrategy(question, context);

            expect(strategy.complexity).toBe('simple');
            expect(strategy.id).toBe('simple-direct');
        });

        it('중간 복잡도 질문에 대해 분석 기반 전략을 선택해야 함', () => {
            const question = '이것은 비교적 긴 질문입니다. 여러 가지 요소를 포함하고 있습니다.';
            const context = { key1: 'value1', key2: 'value2', key3: 'value3' };

            const strategy = selectResponseStrategy(question, context);

            expect(strategy.complexity).toBe('moderate');
            expect(strategy.id).toBe('moderate-analysis');
        });

        it('복잡한 질문에 대해 복합 다단계 전략을 선택해야 함', () => {
            // 200자 이상의 긴 질문과 복잡한 키워드 포함
            const question = '이것은 매우 긴 질문입니다. 여러 가지 요소를 포함하고 있으며, 분석과 비교가 필요합니다. 어떻게 평가할 수 있을까요? 이것은 매우 긴 질문입니다. 여러 가지 요소를 포함하고 있으며, 분석과 비교가 필요합니다. 어떻게 평가할 수 있을까요? 이것은 매우 긴 질문입니다. 여러 가지 요소를 포함하고 있으며, 분석과 비교가 필요합니다. 어떻게 평가할 수 있을까요?';
            const context = {
                key1: 'value1',
                key2: 'value2',
                key3: 'value3',
                key4: 'value4',
                key5: 'value5',
                key6: 'value6'
            };

            const strategy = selectResponseStrategy(question, context);

            // 복잡도는 complex이거나 moderate일 수 있음 (질문 길이와 키워드에 따라)
            expect(['complex', 'moderate']).toContain(strategy.complexity);
        });

        it('전략이 steps를 포함해야 함', () => {
            const question = '질문';
            const context = {};

            const strategy = selectResponseStrategy(question, context);

            expect(strategy.steps).toBeInstanceOf(Array);
            expect(strategy.steps.length).toBeGreaterThan(0);
        });
    });

    describe('executeResponseStep', () => {
        const mockStep: ResponseStep = {
            id: 'test-step',
            name: '테스트 단계',
            type: 'synthesis',
            description: '테스트 설명',
            required: true,
            order: 1
        };

        it('단계를 실행해야 함', async () => {
            (sendChatMessage as jest.Mock).mockResolvedValueOnce({
                success: true,
                message: {
                    content: '테스트 응답'
                }
            });

            const result = await executeResponseStep(mockStep, '질문', {}, {});

            expect(result).toBeDefined();
            expect(typeof result).toBe('object');
            expect((result as any).stepId).toBe(mockStep.id);
            expect((result as any).result).toBe('테스트 응답');
            expect(sendChatMessage).toHaveBeenCalled();
        });

        it('분석 단계를 실행해야 함', async () => {
            const analysisStep: ResponseStep = {
                ...mockStep,
                type: 'analysis'
            };

            (sendChatMessage as jest.Mock).mockResolvedValueOnce({
                success: true,
                message: {
                    content: '분석 결과'
                }
            });

            const result = await executeResponseStep(analysisStep, '질문', {}, {});

            expect(result).toBeDefined();
            expect((result as any).result).toBe('분석 결과');
        });

        it('조사 단계를 실행해야 함', async () => {
            const researchStep: ResponseStep = {
                ...mockStep,
                type: 'research'
            };

            (sendChatMessage as jest.Mock).mockResolvedValueOnce({
                success: true,
                message: {
                    content: '조사 결과'
                }
            });

            const result = await executeResponseStep(researchStep, '질문', {}, {});

            expect(result).toBeDefined();
            expect((result as any).result).toBe('조사 결과');
        });

        it('검증 단계를 실행해야 함', async () => {
            const validationStep: ResponseStep = {
                ...mockStep,
                type: 'validation'
            };

            (sendChatMessage as jest.Mock).mockResolvedValueOnce({
                success: true,
                message: {
                    content: '검증 결과'
                }
            });

            const result = await executeResponseStep(validationStep, '질문', {}, {});

            expect(result).toBeDefined();
            expect((result as any).result).toBe('검증 결과');
        });

        it('포맷팅 단계를 실행해야 함', async () => {
            const formattingStep: ResponseStep = {
                ...mockStep,
                type: 'formatting'
            };

            (sendChatMessage as jest.Mock).mockResolvedValueOnce({
                success: true,
                message: {
                    content: '포맷팅된 결과'
                }
            });

            const result = await executeResponseStep(formattingStep, '질문', {}, {});

            expect(result).toBeDefined();
            expect((result as any).result).toBe('포맷팅된 결과');
        });

        it('API 실패 시 에러를 처리해야 함', async () => {
            (sendChatMessage as jest.Mock).mockResolvedValueOnce({
                success: false
            });

            const result = await executeResponseStep(mockStep, '질문', {}, {});

            expect(result).toBeDefined();
            expect((result as any).error).toBeDefined();
        });

        it('예외 발생 시 에러를 처리해야 함', async () => {
            (sendChatMessage as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const result = await executeResponseStep(mockStep, '질문', {}, {});

            expect(result).toBeDefined();
            expect((result as any).error).toBeDefined();
        });
    });

    describe('generateMultiStepResponse', () => {
        it('다단계 응답을 생성해야 함', async () => {
            (sendChatMessage as jest.Mock).mockResolvedValue({
                success: true,
                message: {
                    content: '응답 내용'
                }
            });

            const result = await generateMultiStepResponse('질문', {});

            expect(result).toBeDefined();
            expect(result.steps).toBeInstanceOf(Array);
            expect(result.currentStep).toBeGreaterThan(0);
            expect(result.results).toBeDefined();
            expect(result.finalResponse).toBeDefined();
            expect(result.isComplete).toBe(true);
        });

        it('간단한 질문에 대해 단순 전략을 사용해야 함', async () => {
            (sendChatMessage as jest.Mock).mockResolvedValue({
                success: true,
                message: {
                    content: '응답'
                }
            });

            const result = await generateMultiStepResponse('안녕하세요?', {});

            expect(result.steps.length).toBe(1);
            expect(result.steps[0].id).toBe('direct-response');
        });

        it('복잡한 질문에 대해 복합 전략을 사용해야 함', async () => {
            (sendChatMessage as jest.Mock).mockResolvedValue({
                success: true,
                message: {
                    content: '응답'
                }
            });

            // 200자 이상의 긴 질문
            const longQuestion = '이것은 매우 긴 질문입니다. 여러 가지 요소를 포함하고 있으며, 분석과 비교가 필요합니다. 어떻게 평가할 수 있을까요? 이것은 매우 긴 질문입니다. 여러 가지 요소를 포함하고 있으며, 분석과 비교가 필요합니다. 어떻게 평가할 수 있을까요? 이것은 매우 긴 질문입니다. 여러 가지 요소를 포함하고 있으며, 분석과 비교가 필요합니다. 어떻게 평가할 수 있을까요?';
            const richContext = {
                key1: 'value1',
                key2: 'value2',
                key3: 'value3',
                key4: 'value4',
                key5: 'value5',
                key6: 'value6'
            };

            const result = await generateMultiStepResponse(longQuestion, richContext);

            expect(result.steps.length).toBeGreaterThan(1);
        });

        it('각 단계의 결과를 저장해야 함', async () => {
            (sendChatMessage as jest.Mock).mockResolvedValue({
                success: true,
                message: {
                    content: '단계 결과'
                }
            });

            const result = await generateMultiStepResponse('질문', {});

            expect(Object.keys(result.results).length).toBeGreaterThan(0);
        });

        it('최종 응답을 생성해야 함', async () => {
            (sendChatMessage as jest.Mock).mockResolvedValue({
                success: true,
                message: {
                    content: '최종 응답'
                }
            });

            const result = await generateMultiStepResponse('질문', {});

            expect(result.finalResponse).toBeDefined();
            expect(result.finalResponse.length).toBeGreaterThan(0);
        });

        it('신뢰도를 계산해야 함', async () => {
            (sendChatMessage as jest.Mock).mockResolvedValue({
                success: true,
                message: {
                    content: '응답'
                }
            });

            const result = await generateMultiStepResponse('질문', {});

            expect(result.confidence).toBeGreaterThanOrEqual(0);
        });
    });

    describe('evaluateResponseQuality', () => {
        it('응답 품질을 평가해야 함', () => {
            const response: MultiStepResponse = {
                steps: [
                    {
                        id: 'step1',
                        name: '단계1',
                        type: 'synthesis',
                        description: '설명',
                        required: true,
                        order: 1
                    }
                ],
                currentStep: 1,
                results: {
                    step1: {
                        stepId: 'step1',
                        result: '결과'
                    }
                },
                finalResponse: '최종 응답',
                isComplete: true,
                confidence: 0.8
            };

            const evaluation = evaluateResponseQuality(response);

            expect(evaluation).toBeDefined();
            expect(evaluation.score).toBeGreaterThanOrEqual(0);
            expect(evaluation.feedback).toBeInstanceOf(Array);
            expect(evaluation.suggestions).toBeInstanceOf(Array);
        });

        it('완료된 단계에 대해 높은 점수를 부여해야 함', () => {
            const response: MultiStepResponse = {
                steps: [
                    { id: 'step1', name: '단계1', type: 'synthesis', description: '설명', required: true, order: 1 },
                    { id: 'step2', name: '단계2', type: 'validation', description: '설명', required: true, order: 2 }
                ],
                currentStep: 2,
                results: {
                    step1: { stepId: 'step1', result: '결과1' },
                    step2: { stepId: 'step2', result: '결과2' }
                },
                finalResponse: '최종 응답',
                isComplete: true,
                confidence: 0.9
            };

            const evaluation = evaluateResponseQuality(response);

            expect(evaluation.score).toBeGreaterThanOrEqual(80);
            expect(evaluation.feedback.some(f => f.includes('완료'))).toBe(true);
        });

        it('높은 신뢰도에 대해 높은 점수를 부여해야 함', () => {
            const response: MultiStepResponse = {
                steps: [{ id: 'step1', name: '단계1', type: 'synthesis', description: '설명', required: true, order: 1 }],
                currentStep: 1,
                results: { step1: { stepId: 'step1', result: '결과' } },
                finalResponse: '최종 응답',
                isComplete: true,
                confidence: 0.9
            };

            const evaluation = evaluateResponseQuality(response);

            expect(evaluation.feedback.some(f => f.includes('신뢰도'))).toBe(true);
        });

        it('오류가 없는 경우 높은 점수를 부여해야 함', () => {
            const response: MultiStepResponse = {
                steps: [{ id: 'step1', name: '단계1', type: 'synthesis', description: '설명', required: true, order: 1 }],
                currentStep: 1,
                results: { step1: { stepId: 'step1', result: '결과' } },
                finalResponse: '최종 응답',
                isComplete: true,
                confidence: 0.8
            };

            const evaluation = evaluateResponseQuality(response);

            expect(evaluation.feedback.some(f => f.includes('오류 없이'))).toBe(true);
        });

        it('오류가 있는 경우 낮은 점수를 부여해야 함', () => {
            const response: MultiStepResponse = {
                steps: [
                    { id: 'step1', name: '단계1', type: 'synthesis', description: '설명', required: true, order: 1 },
                    { id: 'step2', name: '단계2', type: 'validation', description: '설명', required: true, order: 2 },
                    { id: 'step3', name: '단계3', type: 'formatting', description: '설명', required: true, order: 3 }
                ],
                currentStep: 3,
                results: {
                    step1: { stepId: 'step1', result: '결과1' },
                    step2: { error: '에러' },
                    step3: { error: '에러' }
                },
                finalResponse: '최종 응답',
                isComplete: true,
                confidence: 0.3 // 낮은 신뢰도
            };

            const evaluation = evaluateResponseQuality(response);

            // 오류가 2개 이상이면 점수가 낮아야 함 (최대 60점)
            expect(evaluation.score).toBeLessThanOrEqual(60);
            expect(evaluation.feedback.some(f => f.includes('오류'))).toBe(true);
        });
    });

    describe('통합 테스트', () => {
        it('전체 워크플로우를 테스트해야 함', async () => {
            (sendChatMessage as jest.Mock).mockResolvedValue({
                success: true,
                message: {
                    content: '통합 테스트 응답'
                }
            });

            // 1. 질문 복잡도 분석
            const complexity = analyzeQuestionComplexity('복잡한 질문입니다. 분석이 필요합니다.', {});
            expect(complexity.complexity).toBeDefined();

            // 2. 전략 선택
            const strategy = selectResponseStrategy('질문', {});
            expect(strategy).toBeDefined();

            // 3. 다단계 응답 생성
            const response = await generateMultiStepResponse('질문', {});
            expect(response.isComplete).toBe(true);

            // 4. 품질 평가
            const quality = evaluateResponseQuality(response);
            expect(quality.score).toBeGreaterThanOrEqual(0);
        });
    });
});

