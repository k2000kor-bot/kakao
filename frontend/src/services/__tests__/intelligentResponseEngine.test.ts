/* eslint-disable jest/no-conditional-expect */
import intelligentResponseEngine, {
    IntelligentResponseEngine,
    QuestionContext,
    ResponseStrategy,
} from '../intelligentResponseEngine';

describe('IntelligentResponseEngine', () => {
    let engine: IntelligentResponseEngine;

    beforeEach(() => {
        engine = new IntelligentResponseEngine();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('초기화', () => {
        it('서비스 인스턴스 생성', () => {
            expect(intelligentResponseEngine).toBeDefined();
            expect(intelligentResponseEngine).toBeInstanceOf(IntelligentResponseEngine);
        });

        it('새 인스턴스 생성', () => {
            expect(engine).toBeInstanceOf(IntelligentResponseEngine);
        });
    });

    describe('analyzeQuestionContext', () => {
        it('사실 질문을 분석해야 함', async () => {
            const context = await engine.analyzeQuestionContext('무엇이 AI인가요?');

            expect(context.originalQuestion).toBe('무엇이 AI인가요?');
            expect(context.questionType).toBe('factual');
            expect(context.complexity).toBeGreaterThan(0);
            expect(context.domain.length).toBeGreaterThan(0);
        });

        it('분석 질문을 분석해야 함', async () => {
            const context = await engine.analyzeQuestionContext('AI와 머신러닝을 비교 분석해주세요');

            expect(context.questionType).toBe('analytical');
            expect(context.domain).toContain('technology');
        });

        it('절차 질문을 분석해야 함', async () => {
            const context = await engine.analyzeQuestionContext('AI 모델을 만드는 단계를 알려주세요');

            expect(context.questionType).toBe('procedural');
        });

        it('창의 질문을 분석해야 함', async () => {
            const context = await engine.analyzeQuestionContext('새로운 AI 아이디어를 제안해주세요');

            expect(context.questionType).toBe('creative');
        });

        it('비교 질문을 분석해야 함', async () => {
            const context = await engine.analyzeQuestionContext('AI vs 머신러닝 중 더 좋은 것은?');

            expect(context.questionType).toBe('comparative');
        });

        it('예측 질문을 분석해야 함', async () => {
            const context = await engine.analyzeQuestionContext('AI의 미래 전망을 예측해주세요');

            expect(context.questionType).toBe('predictive');
        });

        it('복잡도를 계산해야 함', async () => {
            const simpleContext = await engine.analyzeQuestionContext('AI란?');
            const complexContext = await engine.analyzeQuestionContext('AI와 머신러닝, 딥러닝의 차이점을 분석하고 비교하여 미래 전망을 예측해주세요');

            expect(complexContext.complexity).toBeGreaterThan(simpleContext.complexity);
        });

        it('도메인을 식별해야 함', async () => {
            const context = await engine.analyzeQuestionContext('부동산 투자에 대해 알려주세요');

            expect(context.domain).toContain('realestate');
        });

        it('의도를 분석해야 함', async () => {
            const context = await engine.analyzeQuestionContext('AI 모델을 만들어줘');

            expect(context.intent.actionRequired).toBe(true);
        });

        it('정보 탐색 의도를 식별해야 함', async () => {
            const context = await engine.analyzeQuestionContext('AI에 대한 정보를 알려줘');

            expect(context.intent.informationSeeking).toBe(true);
        });

        it('문제 해결 의도를 식별해야 함', async () => {
            const context = await engine.analyzeQuestionContext('AI 모델 오류를 해결해줘');

            expect(context.intent.problemSolving).toBe(true);
        });

        it('시간 컨텍스트를 분석해야 함', async () => {
            const pastContext = await engine.analyzeQuestionContext('과거 AI 기술은 어땠나요?');
            const futureContext = await engine.analyzeQuestionContext('미래 AI 기술은 어떻게 될까요?');

            expect(pastContext.context.temporal).toBe('past');
            expect(futureContext.context.temporal).toBe('future');
        });

        it('긴급도를 분석해야 함', async () => {
            const urgentContext = await engine.analyzeQuestionContext('급해 AI 모델을 만들어줘');

            expect(urgentContext.context.urgency).toBe('high');
        });

        it('필요 역량을 식별해야 함', async () => {
            const context = await engine.analyzeQuestionContext('코드를 작성해줘');

            expect(context.requiredCapabilities).toContain('programming');
        });

        it('응답 형식을 결정해야 함', async () => {
            const simpleContext = await engine.analyzeQuestionContext('AI란?');
            const complexContext = await engine.analyzeQuestionContext('AI와 머신러닝, 딥러닝의 차이점을 분석하고 비교하고 평가하고 검토하고 예측하고 전략을 수립하고 최적화하고 통합하는 방법을 알려주세요');

            expect(simpleContext.expectedResponseFormat).toBeDefined();
            expect(complexContext.expectedResponseFormat).toBe('structured');
        });
    });

    describe('generateResponseStrategy', () => {
        it('응답 전략을 생성해야 함', async () => {
            const context: QuestionContext = {
                originalQuestion: 'AI란?',
                processedQuestion: 'ai란?',
                questionType: 'factual',
                complexity: 3,
                domain: ['technology'],
                intent: {
                    primary: 'information_seeking',
                    secondary: [],
                    actionRequired: false,
                    informationSeeking: true,
                    problemSolving: false
                },
                context: {
                    temporal: 'present',
                    scope: 'specific',
                    urgency: 'medium'
                },
                requiredCapabilities: ['natural_language_understanding'],
                expectedResponseFormat: 'conversational'
            };

            const strategy = await engine.generateResponseStrategy(context);

            expect(strategy.approach).toBeDefined();
            expect(strategy.tone).toBeDefined();
            expect(strategy.structure).toBeDefined();
            expect(strategy.evidenceLevel).toBeDefined();
            expect(strategy.interactivity).toBeDefined();
        });

        it('분석 질문에 대해 분석적 접근법을 사용해야 함', async () => {
            const context: QuestionContext = {
                originalQuestion: '분석 요청',
                processedQuestion: '분석 요청',
                questionType: 'analytical',
                complexity: 5,
                domain: ['general'],
                intent: {
                    primary: 'information_seeking',
                    secondary: [],
                    actionRequired: false,
                    informationSeeking: true,
                    problemSolving: false
                },
                context: {
                    temporal: 'present',
                    scope: 'general',
                    urgency: 'medium'
                },
                requiredCapabilities: [],
                expectedResponseFormat: 'detailed'
            };

            const strategy = await engine.generateResponseStrategy(context);

            expect(strategy.approach).toBe('analytical');
        });

        it('절차 질문에 대해 단계별 접근법을 사용해야 함', async () => {
            const context: QuestionContext = {
                originalQuestion: '방법 알려줘',
                processedQuestion: '방법 알려줘',
                questionType: 'procedural',
                complexity: 4,
                domain: ['general'],
                intent: {
                    primary: 'information_seeking',
                    secondary: [],
                    actionRequired: false,
                    informationSeeking: true,
                    problemSolving: false
                },
                context: {
                    temporal: 'present',
                    scope: 'specific',
                    urgency: 'medium'
                },
                requiredCapabilities: [],
                expectedResponseFormat: 'detailed'
            };

            const strategy = await engine.generateResponseStrategy(context);

            expect(strategy.approach).toBe('step-by-step');
        });

        it('기술 도메인에 대해 기술적 톤을 사용해야 함', async () => {
            const context: QuestionContext = {
                originalQuestion: '기술 질문',
                processedQuestion: '기술 질문',
                questionType: 'factual',
                complexity: 3,
                domain: ['technology'],
                intent: {
                    primary: 'information_seeking',
                    secondary: [],
                    actionRequired: false,
                    informationSeeking: true,
                    problemSolving: false
                },
                context: {
                    temporal: 'present',
                    scope: 'specific',
                    urgency: 'medium'
                },
                requiredCapabilities: [],
                expectedResponseFormat: 'conversational'
            };

            const strategy = await engine.generateResponseStrategy(context);

            expect(strategy.tone).toBe('technical');
        });

        it('복잡한 질문에 대해 상세한 증거 수준을 사용해야 함', async () => {
            const context: QuestionContext = {
                originalQuestion: '복잡한 질문',
                processedQuestion: '복잡한 질문',
                questionType: 'analytical',
                complexity: 9,
                domain: ['general'],
                intent: {
                    primary: 'information_seeking',
                    secondary: [],
                    actionRequired: false,
                    informationSeeking: true,
                    problemSolving: false
                },
                context: {
                    temporal: 'present',
                    scope: 'comprehensive',
                    urgency: 'medium'
                },
                requiredCapabilities: [],
                expectedResponseFormat: 'structured'
            };

            const strategy = await engine.generateResponseStrategy(context);

            expect(strategy.evidenceLevel).toBe('comprehensive');
        });
    });

    describe('generateIntelligentResponse', () => {
        it('지능형 응답을 생성해야 함', async () => {
            const context: QuestionContext = {
                originalQuestion: 'AI란?',
                processedQuestion: 'ai란?',
                questionType: 'factual',
                complexity: 3,
                domain: ['technology'],
                intent: {
                    primary: 'information_seeking',
                    secondary: [],
                    actionRequired: false,
                    informationSeeking: true,
                    problemSolving: false
                },
                context: {
                    temporal: 'present',
                    scope: 'specific',
                    urgency: 'medium'
                },
                requiredCapabilities: ['natural_language_understanding'],
                expectedResponseFormat: 'conversational'
            };

            const strategy: ResponseStrategy = {
                approach: 'direct',
                tone: 'technical',
                structure: {
                    introduction: false,
                    mainContent: ['핵심 정보'],
                    examples: false,
                    conclusion: false,
                    actionItems: false
                },
                evidenceLevel: 'minimal',
                interactivity: {
                    followUpQuestions: [],
                    clarificationNeeded: false,
                    additionalResources: false
                }
            };

            const response = await engine.generateIntelligentResponse(context, strategy);

            expect(response.content).toBeDefined();
            expect(response.content.length).toBeGreaterThan(0);
            expect(response.confidence).toBeGreaterThan(0);
            expect(response.sources.length).toBeGreaterThan(0);
            expect(response.reasoning).toBeDefined();
            expect(response.followUpSuggestions).toBeDefined();
            expect(response.relatedTopics).toBeDefined();
            expect(response.qualityMetrics).toBeDefined();
        });

        it('원베일리 관련 질문에 대해 부동산 콘텐츠를 생성해야 함', async () => {
            const context: QuestionContext = {
                originalQuestion: '원베일리 아파트에 대해 알려주세요',
                processedQuestion: '원베일리 아파트에 대해 알려주세요',
                questionType: 'factual',
                complexity: 4,
                domain: ['realestate'],
                intent: {
                    primary: 'information_seeking',
                    secondary: [],
                    actionRequired: false,
                    informationSeeking: true,
                    problemSolving: false
                },
                context: {
                    temporal: 'present',
                    scope: 'general',
                    urgency: 'medium'
                },
                requiredCapabilities: [],
                expectedResponseFormat: 'detailed'
            };

            const strategy: ResponseStrategy = {
                approach: 'direct',
                tone: 'professional',
                structure: {
                    introduction: true,
                    mainContent: ['정보'],
                    examples: false,
                    conclusion: false,
                    actionItems: false
                },
                evidenceLevel: 'moderate',
                interactivity: {
                    followUpQuestions: [],
                    clarificationNeeded: false,
                    additionalResources: false
                }
            };

            const response = await engine.generateIntelligentResponse(context, strategy);

            expect(response.content).toContain('원베일리');
        });

        it('추가 데이터를 포함하여 응답을 생성해야 함', async () => {
            const context: QuestionContext = {
                originalQuestion: 'AI 뉴스',
                processedQuestion: 'ai 뉴스',
                questionType: 'factual',
                complexity: 3,
                domain: ['technology'],
                intent: {
                    primary: 'information_seeking',
                    secondary: [],
                    actionRequired: false,
                    informationSeeking: true,
                    problemSolving: false
                },
                context: {
                    temporal: 'present',
                    scope: 'specific',
                    urgency: 'medium'
                },
                requiredCapabilities: [],
                expectedResponseFormat: 'conversational'
            };

            const strategy: ResponseStrategy = {
                approach: 'direct',
                tone: 'technical',
                structure: {
                    introduction: false,
                    mainContent: ['정보'],
                    examples: false,
                    conclusion: false,
                    actionItems: false
                },
                evidenceLevel: 'minimal',
                interactivity: {
                    followUpQuestions: [],
                    clarificationNeeded: false,
                    additionalResources: false
                }
            };

            const additionalData = {
                newsResults: [
                    { title: 'AI 뉴스 1' },
                    { title: 'AI 뉴스 2' }
                ],
                webSearchResults: [
                    { title: '웹 결과 1' }
                ]
            };

            const response = await engine.generateIntelligentResponse(context, strategy, additionalData);

            expect(response.content).toContain('뉴스');
            expect(response.sources).toContain('뉴스 검색 결과');
            expect(response.sources).toContain('웹 검색 결과');
        });

        it('품질 메트릭을 계산해야 함', async () => {
            const context: QuestionContext = {
                originalQuestion: 'AI란?',
                processedQuestion: 'ai란?',
                questionType: 'factual',
                complexity: 3,
                domain: ['technology'],
                intent: {
                    primary: 'information_seeking',
                    secondary: [],
                    actionRequired: false,
                    informationSeeking: true,
                    problemSolving: false
                },
                context: {
                    temporal: 'present',
                    scope: 'specific',
                    urgency: 'medium'
                },
                requiredCapabilities: [],
                expectedResponseFormat: 'conversational'
            };

            const strategy: ResponseStrategy = {
                approach: 'direct',
                tone: 'technical',
                structure: {
                    introduction: false,
                    mainContent: ['정보'],
                    examples: false,
                    conclusion: false,
                    actionItems: false
                },
                evidenceLevel: 'minimal',
                interactivity: {
                    followUpQuestions: [],
                    clarificationNeeded: false,
                    additionalResources: false
                }
            };

            const response = await engine.generateIntelligentResponse(context, strategy);

            expect(response.qualityMetrics.relevance).toBeGreaterThanOrEqual(0);
            expect(response.qualityMetrics.completeness).toBeGreaterThanOrEqual(0);
            expect(response.qualityMetrics.accuracy).toBeGreaterThanOrEqual(0);
            expect(response.qualityMetrics.clarity).toBeGreaterThanOrEqual(0);
            expect(response.qualityMetrics.usefulness).toBeGreaterThanOrEqual(0);
        });

        it('에러 발생 시 폴백 응답을 생성해야 함', async () => {
            const context: QuestionContext = {
                originalQuestion: '테스트 질문',
                processedQuestion: '테스트 질문',
                questionType: 'factual',
                complexity: 3,
                domain: ['general'],
                intent: {
                    primary: 'information_seeking',
                    secondary: [],
                    actionRequired: false,
                    informationSeeking: true,
                    problemSolving: false
                },
                context: {
                    temporal: 'present',
                    scope: 'specific',
                    urgency: 'medium'
                },
                requiredCapabilities: [],
                expectedResponseFormat: 'conversational'
            };

            const strategy: ResponseStrategy = {
                approach: 'direct',
                tone: 'casual',
                structure: {
                    introduction: false,
                    mainContent: [],
                    examples: false,
                    conclusion: false,
                    actionItems: false
                },
                evidenceLevel: 'minimal',
                interactivity: {
                    followUpQuestions: [],
                    clarificationNeeded: false,
                    additionalResources: false
                }
            };

            // 에러를 강제로 발생시키기 위해 잘못된 메서드 호출 시뮬레이션
            jest.spyOn(engine as unknown as { generateBaseContent: () => Promise<unknown> }, 'generateBaseContent').mockRejectedValueOnce(new Error('Test error'));

            const response = await engine.generateIntelligentResponse(context, strategy);

            expect(response.content).toContain('죄송합니다');
            expect(response.confidence).toBeLessThan(0.5);
        });
    });

    describe('통합 테스트', () => {
        it('전체 워크플로우를 테스트해야 함', async () => {
            // 1. 질문 컨텍스트 분석
            const context = await engine.analyzeQuestionContext('AI와 머신러닝을 비교 분석해주세요');

            expect(context.questionType).toBe('analytical');
            expect(context.domain).toContain('technology');

            // 2. 응답 전략 생성
            const strategy = await engine.generateResponseStrategy(context);

            expect(strategy.approach).toBe('analytical');

            // 3. 지능형 응답 생성
            const response = await engine.generateIntelligentResponse(context, strategy);

            expect(response.content).toBeDefined();
            expect(response.confidence).toBeGreaterThan(0);
            expect(response.qualityMetrics).toBeDefined();
        });

        it('다양한 질문 유형에 대해 응답을 생성해야 함', async () => {
            const questionTypes: Array<QuestionContext['questionType']> = [
                'factual',
                'analytical',
                'creative',
                'procedural',
                'comparative',
                'predictive'
            ];

            for (const type of questionTypes) {
                const questions = {
                    factual: 'AI란 무엇인가요?',
                    analytical: 'AI를 분석해주세요',
                    creative: 'AI 아이디어를 제안해주세요',
                    procedural: 'AI 모델 만드는 방법',
                    comparative: 'AI와 머신러닝 비교',
                    predictive: 'AI 미래 전망'
                };

                const context = await engine.analyzeQuestionContext(questions[type]);
                const strategy = await engine.generateResponseStrategy(context);
                const response = await engine.generateIntelligentResponse(context, strategy);

                expect(response.content).toBeDefined();
                expect(response.content.length).toBeGreaterThan(0);
            }
        });
    });
});

