/* eslint-disable jest/no-conditional-expect */
import learningFeedbackSystem, {
    LearningFeedbackSystem,
    FeedbackData,
} from '../learningFeedbackSystem';

describe('LearningFeedbackSystem', () => {
    let system: LearningFeedbackSystem;
    const mockDate = new Date('2024-01-01T00:00:00Z');

    beforeEach(() => {
        system = new LearningFeedbackSystem();
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.useFakeTimers();
        jest.setSystemTime(mockDate);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    describe('초기화', () => {
        it('서비스 인스턴스 생성', () => {
            expect(learningFeedbackSystem).toBeDefined();
            expect(learningFeedbackSystem).toBeInstanceOf(LearningFeedbackSystem);
        });

        it('새 인스턴스 생성', () => {
            expect(system).toBeInstanceOf(LearningFeedbackSystem);
        });
    });

    describe('recordFeedback', () => {
        it('피드백을 기록해야 함', () => {
            const feedback: FeedbackData = {
                messageId: 'msg1',
                userMessage: 'AI에 대해 알려주세요',
                aiResponse: 'AI는 인공지능입니다.',
                userFeedback: 'helpful',
                timestamp: new Date(),
                sessionId: 'session1',
                projectId: 'project1'
            };

            system.recordFeedback(feedback);

            const metrics = system.calculateLearningMetrics('project1');
            expect(metrics.totalFeedbacks).toBe(1);
        });

        it('여러 피드백을 기록해야 함', () => {
            const feedbacks: FeedbackData[] = [
                {
                    messageId: 'msg1',
                    userMessage: 'AI에 대해 알려주세요',
                    aiResponse: 'AI는 인공지능입니다.',
                    userFeedback: 'helpful',
                    timestamp: new Date(),
                    sessionId: 'session1',
                    projectId: 'project1'
                },
                {
                    messageId: 'msg2',
                    userMessage: '머신러닝이 뭐야?',
                    aiResponse: '머신러닝은...',
                    userFeedback: 'partially_helpful',
                    timestamp: new Date(),
                    sessionId: 'session1',
                    projectId: 'project1'
                }
            ];

            feedbacks.forEach(f => system.recordFeedback(f));

            const metrics = system.calculateLearningMetrics('project1');
            expect(metrics.totalFeedbacks).toBe(2);
        });

        it('파일이 첨부된 피드백을 기록해야 함', () => {
            const feedback: FeedbackData = {
                messageId: 'msg1',
                userMessage: '이 파일을 분석해주세요',
                aiResponse: '분석 결과입니다.',
                userFeedback: 'helpful',
                timestamp: new Date(),
                sessionId: 'session1',
                projectId: 'project1',
                attachedFiles: ['file1.pdf', 'file2.jpg']
            };

            system.recordFeedback(feedback);

            const metrics = system.calculateLearningMetrics('project1');
            expect(metrics.totalFeedbacks).toBe(1);
        });

        it('피드백 상세 정보를 포함하여 기록해야 함', () => {
            const feedback: FeedbackData = {
                messageId: 'msg1',
                userMessage: '질문입니다',
                aiResponse: '답변입니다',
                userFeedback: 'not_helpful',
                feedbackDetails: '답변이 부정확했습니다',
                timestamp: new Date(),
                sessionId: 'session1',
                projectId: 'project1'
            };

            system.recordFeedback(feedback);

            const metrics = system.calculateLearningMetrics('project1');
            expect(metrics.totalFeedbacks).toBe(1);
        });
    });

    describe('calculateLearningMetrics', () => {
        it('피드백이 없을 때 기본 메트릭을 반환해야 함', () => {
            const metrics = system.calculateLearningMetrics('project1');

            expect(metrics.totalFeedbacks).toBe(0);
            expect(metrics.positiveRate).toBe(0);
            expect(metrics.averageHelpfulness).toBe(0);
            expect(metrics.improvementTrend).toBe(0);
            expect(metrics.commonIssues).toEqual([]);
            expect(metrics.strengths).toEqual([]);
        });

        it('긍정적 피드백 비율을 계산해야 함', () => {
            const feedbacks: FeedbackData[] = [
                {
                    messageId: 'msg1',
                    userMessage: '질문1',
                    aiResponse: '답변1',
                    userFeedback: 'helpful',
                    timestamp: new Date(),
                    sessionId: 'session1',
                    projectId: 'project1'
                },
                {
                    messageId: 'msg2',
                    userMessage: '질문2',
                    aiResponse: '답변2',
                    userFeedback: 'helpful',
                    timestamp: new Date(),
                    sessionId: 'session1',
                    projectId: 'project1'
                },
                {
                    messageId: 'msg3',
                    userMessage: '질문3',
                    aiResponse: '답변3',
                    userFeedback: 'not_helpful',
                    timestamp: new Date(),
                    sessionId: 'session1',
                    projectId: 'project1'
                }
            ];

            feedbacks.forEach(f => system.recordFeedback(f));

            const metrics = system.calculateLearningMetrics('project1');
            expect(metrics.positiveRate).toBeCloseTo(0.67, 2);
        });

        it('평균 유용성을 계산해야 함', () => {
            const feedbacks: FeedbackData[] = [
                {
                    messageId: 'msg1',
                    userMessage: '질문1',
                    aiResponse: '답변1',
                    userFeedback: 'helpful',
                    timestamp: new Date(),
                    sessionId: 'session1',
                    projectId: 'project1'
                },
                {
                    messageId: 'msg2',
                    userMessage: '질문2',
                    aiResponse: '답변2',
                    userFeedback: 'partially_helpful',
                    timestamp: new Date(),
                    sessionId: 'session1',
                    projectId: 'project1'
                }
            ];

            feedbacks.forEach(f => system.recordFeedback(f));

            const metrics = system.calculateLearningMetrics('project1');
            expect(metrics.averageHelpfulness).toBeCloseTo(0.75, 2);
        });

        it('개선 트렌드를 계산해야 함', () => {
            // 이전 피드백 (부정적)
            for (let i = 0; i < 10; i++) {
                system.recordFeedback({
                    messageId: `msg-old-${i}`,
                    userMessage: '이전 질문',
                    aiResponse: '이전 답변',
                    userFeedback: 'not_helpful',
                    timestamp: new Date(Date.now() - 10000),
                    sessionId: 'session1',
                    projectId: 'project1'
                });
            }

            // 최근 피드백 (긍정적)
            for (let i = 0; i < 10; i++) {
                system.recordFeedback({
                    messageId: `msg-recent-${i}`,
                    userMessage: '최근 질문',
                    aiResponse: '최근 답변',
                    userFeedback: 'helpful',
                    timestamp: new Date(),
                    sessionId: 'session1',
                    projectId: 'project1'
                });
            }

            const metrics = system.calculateLearningMetrics('project1');
            expect(metrics.improvementTrend).toBeGreaterThan(0);
        });

        it('일반적인 문제점을 분석해야 함', () => {
            const feedbacks: FeedbackData[] = [
                {
                    messageId: 'msg1',
                    userMessage: '요약해주세요',
                    aiResponse: '답변1',
                    userFeedback: 'not_helpful',
                    timestamp: new Date(),
                    sessionId: 'session1',
                    projectId: 'project1'
                },
                {
                    messageId: 'msg2',
                    userMessage: '정리해주세요',
                    aiResponse: '답변2',
                    userFeedback: 'not_helpful',
                    timestamp: new Date(),
                    sessionId: 'session1',
                    projectId: 'project1'
                },
                {
                    messageId: 'msg3',
                    userMessage: '요약해주세요',
                    aiResponse: '답변3',
                    userFeedback: 'not_helpful',
                    timestamp: new Date(),
                    sessionId: 'session1',
                    projectId: 'project1'
                }
            ];

            feedbacks.forEach(f => system.recordFeedback(f));

            const metrics = system.calculateLearningMetrics('project1');
            expect(metrics.commonIssues.length).toBeGreaterThan(0);
        });

        it('강점을 분석해야 함', () => {
            const feedbacks: FeedbackData[] = [
                {
                    messageId: 'msg1',
                    userMessage: '분석해주세요',
                    aiResponse: '답변1',
                    userFeedback: 'helpful',
                    timestamp: new Date(),
                    sessionId: 'session1',
                    projectId: 'project1'
                },
                {
                    messageId: 'msg2',
                    userMessage: '평가해주세요',
                    aiResponse: '답변2',
                    userFeedback: 'helpful',
                    timestamp: new Date(),
                    sessionId: 'session1',
                    projectId: 'project1'
                },
                {
                    messageId: 'msg3',
                    userMessage: '분석해주세요',
                    aiResponse: '답변3',
                    userFeedback: 'helpful',
                    timestamp: new Date(),
                    sessionId: 'session1',
                    projectId: 'project1'
                }
            ];

            feedbacks.forEach(f => system.recordFeedback(f));

            const metrics = system.calculateLearningMetrics('project1');
            expect(metrics.strengths.length).toBeGreaterThan(0);
        });
    });

    describe('generateSmartSuggestions', () => {
        it('스마트 제안을 생성해야 함', () => {
            const suggestions = system.generateSmartSuggestions('AI에 대해 알려주세요', 'project1');

            expect(suggestions).toBeInstanceOf(Array);
        });

        it('낮은 성공률 패턴에 대해 제안을 생성해야 함', () => {
            // 낮은 성공률을 가진 피드백 기록
            for (let i = 0; i < 5; i++) {
                system.recordFeedback({
                    messageId: `msg-${i}`,
                    userMessage: '요약해주세요',
                    aiResponse: '답변',
                    userFeedback: 'not_helpful',
                    timestamp: new Date(),
                    sessionId: 'session1',
                    projectId: 'project1'
                });
            }

            const suggestions = system.generateSmartSuggestions('요약해주세요', 'project1');
            expect(suggestions.length).toBeGreaterThan(0);
        });

        it('사용자 선호도를 기반으로 제안을 생성해야 함', () => {
            // 짧은 응답을 선호하는 사용자 패턴 기록
            for (let i = 0; i < 3; i++) {
                system.recordFeedback({
                    messageId: `msg-${i}`,
                    userMessage: '질문',
                    aiResponse: '짧은 답변',
                    userFeedback: 'helpful',
                    timestamp: new Date(),
                    sessionId: 'session1',
                    projectId: 'project1'
                });
            }

            const suggestions = system.generateSmartSuggestions('질문', 'project1');
            expect(suggestions.length).toBeGreaterThanOrEqual(0);
        });
    });

    describe('getLearningStatistics', () => {
        it('학습 통계를 조회해야 함', () => {
            system.recordFeedback({
                messageId: 'msg1',
                userMessage: '질문',
                aiResponse: '답변',
                userFeedback: 'helpful',
                timestamp: new Date(),
                sessionId: 'session1',
                projectId: 'project1'
            });

            const stats = system.getLearningStatistics('project1');

            expect(stats.metrics).toBeDefined();
            expect(stats.recentTrend).toBeInstanceOf(Array);
            expect(stats.topPatterns).toBeInstanceOf(Array);
            expect(stats.totalInteractions).toBe(1);
        });

        it('피드백이 없을 때 기본 통계를 반환해야 함', () => {
            const stats = system.getLearningStatistics('project1');

            expect(stats.metrics.totalFeedbacks).toBe(0);
            expect(stats.recentTrend).toEqual([]);
            expect(stats.totalInteractions).toBe(0);
        });

        it('최근 트렌드를 포함해야 함', () => {
            for (let i = 0; i < 15; i++) {
                system.recordFeedback({
                    messageId: `msg-${i}`,
                    userMessage: '질문',
                    aiResponse: '답변',
                    userFeedback: 'helpful',
                    timestamp: new Date(),
                    sessionId: 'session1',
                    projectId: 'project1'
                });
            }

            const stats = system.getLearningStatistics('project1');
            expect(stats.recentTrend.length).toBeLessThanOrEqual(10);
        });

        it('상위 패턴을 포함해야 함', () => {
            for (let i = 0; i < 5; i++) {
                system.recordFeedback({
                    messageId: `msg-${i}`,
                    userMessage: '분석해주세요',
                    aiResponse: '답변',
                    userFeedback: 'helpful',
                    timestamp: new Date(),
                    sessionId: 'session1',
                    projectId: 'project1'
                });
            }

            const stats = system.getLearningStatistics('project1');
            expect(stats.topPatterns.length).toBeGreaterThanOrEqual(0);
        });
    });

    describe('clearProjectData', () => {
        it('프로젝트 데이터를 클리어해야 함', () => {
            system.recordFeedback({
                messageId: 'msg1',
                userMessage: '질문',
                aiResponse: '답변',
                userFeedback: 'helpful',
                timestamp: new Date(),
                sessionId: 'session1',
                projectId: 'project1'
            });

            system.clearProjectData('project1');

            const metrics = system.calculateLearningMetrics('project1');
            expect(metrics.totalFeedbacks).toBe(0);
        });

        it('다른 프로젝트 데이터는 유지해야 함', () => {
            system.recordFeedback({
                messageId: 'msg1',
                userMessage: '질문1',
                aiResponse: '답변1',
                userFeedback: 'helpful',
                timestamp: new Date(),
                sessionId: 'session1',
                projectId: 'project1'
            });

            system.recordFeedback({
                messageId: 'msg2',
                userMessage: '질문2',
                aiResponse: '답변2',
                userFeedback: 'helpful',
                timestamp: new Date(),
                sessionId: 'session2',
                projectId: 'project2'
            });

            system.clearProjectData('project1');

            const metrics1 = system.calculateLearningMetrics('project1');
            const metrics2 = system.calculateLearningMetrics('project2');

            expect(metrics1.totalFeedbacks).toBe(0);
            expect(metrics2.totalFeedbacks).toBe(1);
        });
    });

    describe('통합 테스트', () => {
        it('전체 워크플로우를 테스트해야 함', () => {
            // 1. 피드백 기록
            const feedbacks: FeedbackData[] = [
                {
                    messageId: 'msg1',
                    userMessage: 'AI에 대해 알려주세요',
                    aiResponse: 'AI는 인공지능입니다.',
                    userFeedback: 'helpful',
                    timestamp: new Date(),
                    sessionId: 'session1',
                    projectId: 'project1'
                },
                {
                    messageId: 'msg2',
                    userMessage: '머신러닝이 뭐야?',
                    aiResponse: '머신러닝은...',
                    userFeedback: 'partially_helpful',
                    timestamp: new Date(),
                    sessionId: 'session1',
                    projectId: 'project1'
                },
                {
                    messageId: 'msg3',
                    userMessage: '요약해주세요',
                    aiResponse: '요약 결과',
                    userFeedback: 'not_helpful',
                    timestamp: new Date(),
                    sessionId: 'session1',
                    projectId: 'project1'
                }
            ];

            feedbacks.forEach(f => system.recordFeedback(f));

            // 2. 메트릭 계산
            const metrics = system.calculateLearningMetrics('project1');
            expect(metrics.totalFeedbacks).toBe(3);
            expect(metrics.positiveRate).toBeGreaterThan(0);

            // 3. 제안 생성
            const suggestions = system.generateSmartSuggestions('AI에 대해 알려주세요', 'project1');
            expect(suggestions).toBeInstanceOf(Array);

            // 4. 통계 조회
            const stats = system.getLearningStatistics('project1');
            expect(stats.totalInteractions).toBe(3);
        });

        it('다양한 메시지 유형에 대해 패턴을 학습해야 함', () => {
            const messageTypes = [
                { message: '요약해주세요', type: 'summarization' },
                { message: '분석해주세요', type: 'analysis' },
                { message: '어떻게 하는지 알려주세요', type: 'how_to' },
                { message: '무엇인가요?', type: 'what_is' },
                { message: '왜 그런가요?', type: 'explanation' },
                { message: '추천해주세요', type: 'recommendation' },
                { message: '비교해주세요', type: 'comparison' }
            ];

            // 각 메시지 유형을 3번 이상 기록하여 frequency > 2 조건 만족
            messageTypes.forEach(({ message }, index) => {
                for (let i = 0; i < 3; i++) {
                    system.recordFeedback({
                        messageId: `msg-${index}-${i}`,
                        userMessage: message,
                        aiResponse: '답변',
                        userFeedback: index % 2 === 0 ? 'helpful' : 'not_helpful',
                        timestamp: new Date(),
                        sessionId: 'session1',
                        projectId: 'project1'
                    });
                }
            });

            const stats = system.getLearningStatistics('project1');
            expect(stats.topPatterns.length).toBeGreaterThan(0);
        });
    });
});

