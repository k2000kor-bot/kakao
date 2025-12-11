/**
 * ConversationalQAService 테스트
 */

import { ConversationalQAService } from '../conversationalQAService';
import unifiedAPI from '../unifiedAPI';

// unifiedAPI 모킹
jest.mock('../unifiedAPI', () => ({
    __esModule: true,
    default: {
        conversationalQA: jest.fn(),
    },
}));

describe('ConversationalQAService', () => {
    let service: ConversationalQAService;

    beforeEach(() => {
        service = new ConversationalQAService();
        jest.clearAllMocks();
    });

    describe('초기화', () => {
        it('서비스 인스턴스 생성', () => {
            expect(service).toBeInstanceOf(ConversationalQAService);
        });

        it('초기 컨텍스트 확인', () => {
            const context = service.getContext();

            expect(context).toBeDefined();
            expect(Array.isArray(context.history)).toBe(true);
            expect(context.userPreferences).toBeDefined();
            expect(context.userPreferences.responseStyle).toBe('detailed');
            expect(context.userPreferences.language).toBe('korean');
        });
    });

    describe('질문 처리', () => {
        it('기본 질문 처리', async () => {
            (unifiedAPI.conversationalQA as jest.Mock).mockResolvedValue({
                success: true,
                data: {
                    answer: '테스트 답변입니다.',
                    confidence: 0.9,
                    processingTime: 100,
                },
            });

            const response = await service.askQuestion('테스트 질문입니다.');

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.answer).toBe('테스트 답변입니다.');
            expect(typeof response.confidence).toBe('number');
            expect(typeof response.processingTime).toBe('number');
        });

        it('컨텍스트 포함 질문 처리', async () => {
            (unifiedAPI.conversationalQA as jest.Mock).mockResolvedValue({
                success: true,
                data: {
                    answer: '컨텍스트 기반 답변입니다.',
                    confidence: 0.85,
                    processingTime: 150,
                },
            });

            const context = {
                topic: '시공사',
                details: '선정 기준',
            };

            const response = await service.askWithContext('시공사 선정 기준이 뭐야?', context);

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
            expect(response.answer).toBeDefined();
        });

        it('후속 질문 처리', async () => {
            // 첫 번째 질문
            (unifiedAPI.conversationalQA as jest.Mock).mockResolvedValueOnce({
                success: true,
                data: {
                    answer: '첫 번째 답변',
                    confidence: 0.9,
                    processingTime: 100,
                },
            });

            await service.askQuestion('첫 번째 질문');

            // 후속 질문
            (unifiedAPI.conversationalQA as jest.Mock).mockResolvedValueOnce({
                success: true,
                data: {
                    answer: '후속 답변',
                    confidence: 0.85,
                    processingTime: 120,
                },
            });

            const response = await service.askFollowUp('그럼 다음은?');

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
        });

        it('API 실패 시 폴백 응답', async () => {
            (unifiedAPI.conversationalQA as jest.Mock).mockRejectedValue(new Error('API 오류'));

            const response = await service.askQuestion('테스트 질문');

            expect(response).toBeDefined();
            expect(response.success).toBe(false);
            expect(response.answer).toContain('오류');
            expect(response.confidence).toBe(0);
        });
    });

    describe('설정 관리', () => {
        it('응답 스타일 설정', () => {
            service.setResponseStyle('concise');
            const context = service.getContext();

            expect(context.userPreferences.responseStyle).toBe('concise');
        });

        it('언어 설정', () => {
            service.setLanguage('english');
            const context = service.getContext();

            expect(context.userPreferences.language).toBe('english');
        });

        it('현재 토픽 설정', () => {
            service.setCurrentTopic('시공사 선정');
            const context = service.getContext();

            expect(context.currentTopic).toBe('시공사 선정');
        });
    });

    describe('대화 히스토리', () => {
        it('대화 히스토리 조회', async () => {
            (unifiedAPI.conversationalQA as jest.Mock).mockResolvedValue({
                success: true,
                data: {
                    answer: '답변 1',
                    confidence: 0.9,
                    processingTime: 100,
                },
            });

            await service.askQuestion('질문 1');

            const history = service.getConversationHistory();

            expect(Array.isArray(history)).toBe(true);
            expect(history.length).toBeGreaterThan(0);
            expect(history[0].question).toBe('질문 1');
            expect(history[0].answer).toBe('답변 1');
        });

        it('대화 히스토리 초기화', async () => {
            (unifiedAPI.conversationalQA as jest.Mock).mockResolvedValue({
                success: true,
                data: {
                    answer: '답변',
                    confidence: 0.9,
                    processingTime: 100,
                },
            });

            await service.askQuestion('질문');
            service.clearHistory();

            const history = service.getConversationHistory();
            const context = service.getContext();

            expect(history.length).toBe(0);
            expect(context.currentTopic).toBe('');
        });
    });

    describe('고급 QA 기능', () => {
        it('분석 질문 처리', async () => {
            (unifiedAPI.conversationalQA as jest.Mock).mockResolvedValue({
                success: true,
                data: {
                    answer: '분석 결과입니다.',
                    confidence: 0.9,
                    processingTime: 200,
                },
            });

            const data = [{ value: 1 }, { value: 2 }];
            const response = await service.askAnalyticalQuestion('데이터를 분석해주세요', data);

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
        });

        it('비교 질문 처리', async () => {
            (unifiedAPI.conversationalQA as jest.Mock).mockResolvedValue({
                success: true,
                data: {
                    answer: '비교 결과입니다.',
                    confidence: 0.85,
                    processingTime: 180,
                },
            });

            const items = [{ name: 'A' }, { name: 'B' }];
            const response = await service.askComparativeQuestion('A와 B를 비교해주세요', items);

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
        });

        it('예측 질문 처리', async () => {
            (unifiedAPI.conversationalQA as jest.Mock).mockResolvedValue({
                success: true,
                data: {
                    answer: '예측 결과입니다.',
                    confidence: 0.8,
                    processingTime: 250,
                },
            });

            const historicalData = [{ date: '2024-01-01', value: 100 }];
            const response = await service.askPredictiveQuestion('앞으로 어떻게 될까요?', historicalData);

            expect(response).toBeDefined();
            expect(response.success).toBe(true);
        });
    });

    describe('대화 요약', () => {
        it('대화 요약 생성', async () => {
            (unifiedAPI.conversationalQA as jest.Mock).mockResolvedValue({
                success: true,
                data: {
                    answer: '답변',
                    confidence: 0.9,
                    processingTime: 100,
                },
            });

            await service.askQuestion('질문 1');
            await service.askQuestion('질문 2');

            const summary = await service.generateConversationSummary();

            expect(typeof summary).toBe('string');
            expect(summary.length).toBeGreaterThan(0);
        });
    });

    describe('메타데이터', () => {
        it('응답에 메타데이터 포함', async () => {
            (unifiedAPI.conversationalQA as jest.Mock).mockResolvedValue({
                success: true,
                data: {
                    answer: '답변',
                    confidence: 0.9,
                    processingTime: 100,
                    model: 'test-model',
                    tokens: 50,
                    usedServices: ['qa-system', 'nlp-service'],
                },
            });

            const response = await service.askQuestion('질문');

            expect(response.metadata).toBeDefined();
            if (response.metadata) {
                expect(response.metadata.model).toBeDefined();
                expect(typeof response.metadata.tokens).toBe('number');
                expect(Array.isArray(response.metadata.usedServices)).toBe(true);
            }
        });
    });
});

