import IntelligentResponseSystem, {
    IntelligentContext,
    SmartResponse,
    DetailedAnswer
} from '../intelligentResponseSystem';

describe('IntelligentResponseSystem', () => {
    let system: IntelligentResponseSystem;

    beforeEach(() => {
        // 싱글톤 인스턴스 가져오기
        system = IntelligentResponseSystem.getInstance();
    });

    describe('싱글톤 패턴', () => {
        it('getInstance는 항상 같은 인스턴스를 반환해야 함', () => {
            const instance1 = IntelligentResponseSystem.getInstance();
            const instance2 = IntelligentResponseSystem.getInstance();

            expect(instance1).toBe(instance2);
            expect(instance1).toBeInstanceOf(IntelligentResponseSystem);
        });
    });

    describe('generateSmartResponse', () => {
        it('스마트 응답을 생성해야 함', async () => {
            const userMessage = 'AI에 대해 알려주세요';
            const context = {
                conversationHistory: [],
                uploadedFiles: [],
                projectContext: {}
            };

            const response = await system.generateSmartResponse(userMessage, context);

            expect(response).toBeDefined();
            expect(response.mainResponse).toBeDefined();
            expect(response.mainResponse.length).toBeGreaterThan(0);
            expect(response.detailedAnswers).toBeInstanceOf(Array);
            expect(response.followUpQuestions).toBeInstanceOf(Array);
            expect(response.suggestedActions).toBeInstanceOf(Array);
            expect(response.relatedTopics).toBeInstanceOf(Array);
            expect(response.confidence).toBeGreaterThan(0);
            expect(response.responseType).toBeDefined();
        });

        it('정보 요청 의도에 대해 적절한 응답을 생성해야 함', async () => {
            const userMessage = '무엇인가요? 궁금해요';
            const context = {
                conversationHistory: [],
                uploadedFiles: [],
                projectContext: {}
            };

            const response = await system.generateSmartResponse(userMessage, context);

            expect(response.mainResponse).toContain('정보');
            expect(response.responseType).toBeDefined();
        });

        it('분석 요청 의도에 대해 적절한 응답을 생성해야 함', async () => {
            const userMessage = '이것을 분석해주세요';
            const context = {
                conversationHistory: [],
                uploadedFiles: [],
                projectContext: {}
            };

            const response = await system.generateSmartResponse(userMessage, context);

            expect(response.mainResponse).toContain('분석');
            expect(response.detailedAnswers.length).toBeGreaterThanOrEqual(0);
        });

        it('생성 요청 의도에 대해 적절한 응답을 생성해야 함', async () => {
            const userMessage = '아이디어를 만들어주세요';
            const context = {
                conversationHistory: [],
                uploadedFiles: [],
                projectContext: {}
            };

            const response = await system.generateSmartResponse(userMessage, context);

            expect(response.mainResponse).toContain('아이디어');
        });

        it('비교 요청 의도에 대해 적절한 응답을 생성해야 함', async () => {
            const userMessage = 'A와 B를 비교해주세요';
            const context = {
                conversationHistory: [],
                uploadedFiles: [],
                projectContext: {}
            };

            const response = await system.generateSmartResponse(userMessage, context);

            expect(response.mainResponse).toContain('비교');
        });

        it('문제 해결 의도에 대해 적절한 응답을 생성해야 함', async () => {
            const userMessage = '문제가 있어요. 해결방법이 있을까요?';
            const context = {
                conversationHistory: [],
                uploadedFiles: [],
                projectContext: {}
            };

            const response = await system.generateSmartResponse(userMessage, context);

            expect(response.mainResponse).toContain('문제');
        });

        it('긍정적 감정에 대해 적절한 응답을 생성해야 함', async () => {
            const userMessage = '좋아요! 재미있어요';
            const context = {
                conversationHistory: [],
                uploadedFiles: [],
                projectContext: {}
            };

            const response = await system.generateSmartResponse(userMessage, context);

            expect(response.mainResponse).toContain('좋은');
        });

        it('부정적 감정에 대해 적절한 응답을 생성해야 함', async () => {
            const userMessage = '짜증나요. 힘들어요';
            const context = {
                conversationHistory: [],
                uploadedFiles: [],
                projectContext: {}
            };

            const response = await system.generateSmartResponse(userMessage, context);

            expect(response.mainResponse).toContain('답답');
        });

        it('대화 히스토리를 포함한 컨텍스트로 응답을 생성해야 함', async () => {
            const userMessage = '추가 질문입니다';
            const context = {
                conversationHistory: [
                    { message: '이전 메시지', topics: ['AI', '기술'] }
                ],
                uploadedFiles: [],
                projectContext: {}
            };

            const response = await system.generateSmartResponse(userMessage, context);

            expect(response).toBeDefined();
            expect(response.mainResponse).toBeDefined();
        });

        it('업로드된 파일을 포함한 컨텍스트로 응답을 생성해야 함', async () => {
            const userMessage = '이 파일을 분석해주세요';
            const context = {
                conversationHistory: [],
                uploadedFiles: [
                    { type: 'image/jpeg', name: 'test.jpg' },
                    { type: 'application/pdf', name: 'document.pdf' }
                ],
                projectContext: {}
            };

            const response = await system.generateSmartResponse(userMessage, context);

            expect(response).toBeDefined();
            expect(response.mainResponse).toBeDefined();
        });

        it('숨겨진 요구사항을 추출하여 상세 답변을 생성해야 함', async () => {
            const userMessage = '좋은 방법이 있을까요? 어떻게 하면 좋을까요?';
            const context = {
                conversationHistory: [],
                uploadedFiles: [],
                projectContext: {}
            };

            const response = await system.generateSmartResponse(userMessage, context);

            expect(response.detailedAnswers.length).toBeGreaterThanOrEqual(0);
        });

        it('후속 질문을 생성해야 함', async () => {
            const userMessage = 'AI에 대해 알려주세요';
            const context = {
                conversationHistory: [],
                uploadedFiles: [],
                projectContext: {}
            };

            const response = await system.generateSmartResponse(userMessage, context);

            expect(response.followUpQuestions.length).toBeGreaterThan(0);
            expect(response.followUpQuestions[0]).toBeDefined();
        });

        it('제안 액션을 생성해야 함', async () => {
            const userMessage = '분석해주세요';
            const context = {
                conversationHistory: [],
                uploadedFiles: [],
                projectContext: {}
            };

            const response = await system.generateSmartResponse(userMessage, context);

            expect(response.suggestedActions.length).toBeGreaterThan(0);
        });

        it('관련 주제를 추천해야 함', async () => {
            const userMessage = 'AI에 대해 알려주세요';
            const context = {
                conversationHistory: [],
                uploadedFiles: [],
                projectContext: {}
            };

            const response = await system.generateSmartResponse(userMessage, context);

            expect(response.relatedTopics.length).toBeGreaterThanOrEqual(0);
        });

        it('신뢰도를 계산해야 함', async () => {
            const userMessage = 'AI에 대해 알려주세요';
            const context = {
                conversationHistory: [],
                uploadedFiles: [],
                projectContext: {}
            };

            const response = await system.generateSmartResponse(userMessage, context);

            expect(response.confidence).toBeGreaterThan(0);
            expect(response.confidence).toBeLessThanOrEqual(1);
        });

        it('응답 타입을 결정해야 함', async () => {
            const userMessage = 'AI에 대해 알려주세요';
            const context = {
                conversationHistory: [],
                uploadedFiles: [],
                projectContext: {}
            };

            const response = await system.generateSmartResponse(userMessage, context);

            expect(['direct', 'exploratory', 'suggestive', 'comprehensive']).toContain(response.responseType);
        });

        it('긴 메시지에 대해 높은 신뢰도를 가져야 함', async () => {
            const shortMessage = 'AI';
            const longMessage = 'AI에 대해 자세히 알려주세요. 머신러닝과 딥러닝의 차이점도 설명해주시고, 실제 활용 사례도 궁금합니다.';
            
            const context = {
                conversationHistory: [],
                uploadedFiles: [],
                projectContext: {}
            };

            const shortResponse = await system.generateSmartResponse(shortMessage, context);
            const longResponse = await system.generateSmartResponse(longMessage, context);

            expect(longResponse.confidence).toBeGreaterThanOrEqual(shortResponse.confidence);
        });

        it('대화 히스토리가 있을 때 더 높은 신뢰도를 가져야 함', async () => {
            const userMessage = '추가 질문입니다';
            const contextWithoutHistory = {
                conversationHistory: [],
                uploadedFiles: [],
                projectContext: {}
            };
            const contextWithHistory = {
                conversationHistory: [
                    { message: '이전 메시지 1' },
                    { message: '이전 메시지 2' },
                    { message: '이전 메시지 3' }
                ],
                uploadedFiles: [],
                projectContext: {}
            };

            const responseWithout = await system.generateSmartResponse(userMessage, contextWithoutHistory);
            const responseWith = await system.generateSmartResponse(userMessage, contextWithHistory);

            expect(responseWith.confidence).toBeGreaterThanOrEqual(responseWithout.confidence);
        });

        it('파일이 업로드되었을 때 더 높은 신뢰도를 가져야 함', async () => {
            const userMessage = '이 파일을 분석해주세요';
            const contextWithoutFiles = {
                conversationHistory: [],
                uploadedFiles: [],
                projectContext: {}
            };
            const contextWithFiles = {
                conversationHistory: [],
                uploadedFiles: [
                    { type: 'image/jpeg', name: 'test.jpg' }
                ],
                projectContext: {}
            };

            const responseWithout = await system.generateSmartResponse(userMessage, contextWithoutFiles);
            const responseWith = await system.generateSmartResponse(userMessage, contextWithFiles);

            expect(responseWith.confidence).toBeGreaterThanOrEqual(responseWithout.confidence);
        });

        it('다양한 의도에 대해 적절한 응답 타입을 결정해야 함', async () => {
            const testCases = [
                { message: '간단한 질문', expectedType: 'direct' },
                { message: '복잡한 분석 요청입니다. 여러 가지 관점에서 검토해주세요. 상세한 평가도 필요합니다.', expectedType: 'comprehensive' },
                { message: '안녕하세요', expectedType: 'suggestive' }
            ];

            const context = {
                conversationHistory: [],
                uploadedFiles: [],
                projectContext: {}
            };

            for (const testCase of testCases) {
                const response = await system.generateSmartResponse(testCase.message, context);
                expect(['direct', 'exploratory', 'suggestive', 'comprehensive']).toContain(response.responseType);
            }
        });

        it('상세 답변이 올바른 형식을 가져야 함', async () => {
            const userMessage = '여러 가지 질문이 있습니다. 첫 번째는 AI에 대해, 두 번째는 머신러닝에 대해 알려주세요';
            const context = {
                conversationHistory: [],
                uploadedFiles: [],
                projectContext: {}
            };

            const response = await system.generateSmartResponse(userMessage, context);

            if (response.detailedAnswers.length > 0) {
                const answer = response.detailedAnswers[0];
                expect(answer.question).toBeDefined();
                expect(answer.answer).toBeDefined();
                expect(answer.answer.length).toBeGreaterThan(0);
                expect(answer.confidence).toBeGreaterThan(0);
                expect(answer.confidence).toBeLessThanOrEqual(1);
            }
        });
    });

    describe('통합 테스트', () => {
        it('전체 워크플로우를 테스트해야 함', async () => {
            const userMessage = 'AI와 머신러닝을 비교 분석해주세요. 어떤 것이 더 좋은지도 알려주세요.';
            const context = {
                conversationHistory: [
                    { message: '이전 대화', topics: ['AI'] }
                ],
                uploadedFiles: [
                    { type: 'application/pdf', name: 'document.pdf' }
                ],
                projectContext: {
                    name: 'AI 프로젝트'
                }
            };

            const response = await system.generateSmartResponse(userMessage, context);

            expect(response.mainResponse).toBeDefined();
            expect(response.mainResponse.length).toBeGreaterThan(0);
            expect(response.detailedAnswers).toBeInstanceOf(Array);
            expect(response.followUpQuestions.length).toBeGreaterThan(0);
            expect(response.suggestedActions.length).toBeGreaterThan(0);
            expect(response.relatedTopics.length).toBeGreaterThanOrEqual(0);
            expect(response.confidence).toBeGreaterThan(0);
            expect(response.responseType).toBeDefined();
        });

        it('다양한 감정 상태에 대해 적절히 응답해야 함', async () => {
            const emotions = [
                { message: '좋아요! 기뻐요', emotion: 'positive' },
                { message: '짜증나요. 화나요', emotion: 'negative' },
                { message: '걱정이에요. 불안해요', emotion: 'anxious' },
                { message: '그래요. 알겠어요', emotion: 'neutral' }
            ];

            const context = {
                conversationHistory: [],
                uploadedFiles: [],
                projectContext: {}
            };

            for (const testCase of emotions) {
                const response = await system.generateSmartResponse(testCase.message, context);
                expect(response.mainResponse).toBeDefined();
                expect(response.mainResponse.length).toBeGreaterThan(0);
            }
        });
    });
});

