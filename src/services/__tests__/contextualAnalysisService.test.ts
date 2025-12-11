/**
 * ContextualAnalysisService 테스트
 */

import {
  ContextualAnalysisService,
  contextualAnalysisService,
} from '../contextualAnalysisService';
import { Message } from '../../types/chat';

// fetch 모킹
global.fetch = jest.fn();

describe('ContextualAnalysisService', () => {
  let service: ContextualAnalysisService;

  beforeEach(() => {
    service = new ContextualAnalysisService();
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(ContextualAnalysisService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(contextualAnalysisService).toBeDefined();
    });
  });

  describe('문맥 분석', () => {
    const mockRequest = {
      message: '시공사 선정에 대해 분석해줘',
      conversationHistory: [] as Message[],
    };

    it('백엔드 API 성공 시 분석 결과 반환', async () => {
      const mockResponse = {
        analysis: {
          intent: 'analysis_request',
          requirements: ['시공사 선정 분석'],
          topics: ['시공사', '선정'],
          entities: ['시공사'],
          sentiment: 'neutral' as const,
          urgency: 'medium' as const,
          actionItems: ['분석 수행'],
          followUpQuestions: ['어떤 기준으로 선정하시겠습니까?'],
          summary: '시공사 선정 분석 요청',
          confidence: 0.9,
        },
        response: '시공사 선정을 분석하겠습니다.',
        suggestions: ['시공사 비교', '선정 기준 검토'],
        related_topics: ['건설', '재개발'],
        next_actions: ['분석 시작'],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.analyzeContext(mockRequest);

      expect(result).toBeDefined();
      expect(result.analysis).toBeDefined();
      expect(result.analysis.intent).toBe('analysis_request');
      expect(result.response).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(Array.isArray(result.relatedTopics)).toBe(true);
      expect(Array.isArray(result.nextActions)).toBe(true);
    });

    it('백엔드 API 실패 시 로컬 폴백 분석 수행', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await service.analyzeContext(mockRequest);

      expect(result).toBeDefined();
      expect(result.analysis).toBeDefined();
      expect(result.analysis.intent).toBeDefined();
      expect(result.response).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('네트워크 오류 시 로컬 폴백 분석 수행', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await service.analyzeContext(mockRequest);

      expect(result).toBeDefined();
      expect(result.analysis).toBeDefined();
      expect(result.response).toBeDefined();
    });

    it('대화 이력이 있는 경우 문맥 분석', async () => {
      const requestWithHistory = {
        message: '그럼 어떤 시공사가 좋을까?',
        conversationHistory: [
          {
            id: '1',
            content: '시공사 선정에 대해 분석해줘',
            timestamp: new Date(),
            isUser: true,
          } as Message,
          {
            id: '2',
            content: '시공사 선정을 분석하겠습니다.',
            timestamp: new Date(),
            isUser: false,
          } as Message,
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await service.analyzeContext(requestWithHistory);

      expect(result).toBeDefined();
      expect(result.analysis).toBeDefined();
    });

    it('사용자 선호도 포함 분석', async () => {
      const requestWithPreferences = {
        ...mockRequest,
        userPreferences: {
          preferredStyle: 'detailed',
          language: 'ko',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          analysis: {
            intent: 'analysis_request',
            requirements: [],
            topics: [],
            entities: [],
            sentiment: 'neutral' as const,
            urgency: 'medium' as const,
            actionItems: [],
            followUpQuestions: [],
            summary: '분석',
            confidence: 0.8,
          },
          response: '응답',
          suggestions: [],
          related_topics: [],
          next_actions: [],
        }),
      });

      const result = await service.analyzeContext(requestWithPreferences);

      expect(result).toBeDefined();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('user_preferences'),
        })
      );
    });

    it('재개발 관련 문맥 분석', async () => {
      const redevelopmentRequest = {
        message: '재개발 프로젝트의 시공사를 선정하고 싶어요',
        conversationHistory: [] as Message[],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await service.analyzeContext(redevelopmentRequest);

      expect(result).toBeDefined();
      expect(result.analysis.topics).toContain('재개발/재건축');
    });

    it('긴급도 높은 요청 분석', async () => {
      const urgentRequest = {
        message: '급하게 시공사 선정이 필요합니다!',
        conversationHistory: [] as Message[],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await service.analyzeContext(urgentRequest);

      expect(result).toBeDefined();
      expect(['low', 'medium', 'high', 'critical']).toContain(result.analysis.urgency);
    });

    it('감정 분석 포함', async () => {
      const positiveRequest = {
        message: '좋은 시공사를 찾았어요!',
        conversationHistory: [] as Message[],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await service.analyzeContext(positiveRequest);

      expect(result).toBeDefined();
      expect(result.analysis.sentiment).toBeDefined();
    });

    it('액션 아이템 추출', async () => {
      const actionRequest = {
        message: '시공사를 비교하고 선정 기준을 검토해야 해요',
        conversationHistory: [] as Message[],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await service.analyzeContext(actionRequest);

      expect(result).toBeDefined();
      expect(Array.isArray(result.analysis.actionItems)).toBe(true);
    });

    it('후속 질문 생성', async () => {
      const questionRequest = {
        message: '시공사 선정 기준이 뭐야?',
        conversationHistory: [] as Message[],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await service.analyzeContext(questionRequest);

      expect(result).toBeDefined();
      expect(Array.isArray(result.analysis.followUpQuestions)).toBe(true);
    });

    it('신뢰도 계산', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await service.analyzeContext(mockRequest);

      expect(result).toBeDefined();
      expect(typeof result.analysis.confidence).toBe('number');
      expect(result.analysis.confidence).toBeGreaterThanOrEqual(0);
      expect(result.analysis.confidence).toBeLessThanOrEqual(1);
    });

    it('요약 생성', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await service.analyzeContext(mockRequest);

      expect(result).toBeDefined();
      expect(typeof result.analysis.summary).toBe('string');
      expect(result.analysis.summary.length).toBeGreaterThan(0);
    });
  });
});

