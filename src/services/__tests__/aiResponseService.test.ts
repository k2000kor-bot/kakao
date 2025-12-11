/**
 * AIResponseService 테스트
 */

import { AIResponseService } from '../aiResponseService';
import { ChatContext } from '../types/chat';

// Mock fetch globally
global.fetch = jest.fn();

describe('AIResponseService', () => {
  let service: AIResponseService;

  beforeEach(() => {
    service = new AIResponseService();
    jest.clearAllMocks();
  });

  const mockChatContext: ChatContext = {
    chatId: 'chat-1',
    projectId: 'project-1',
    userId: 'user-1',
    conversationHistory: [],
    projectContext: {},
    userPreferences: {},
  };

  const mockMessage = {
    id: 'msg-1',
    content: '테스트 응답',
    sender: 'CORBU.AI',
    timestamp: new Date().toISOString(),
    isMe: false,
    type: 'ai_response' as const,
    aiResponse: {
      type: 'conversation' as const,
      metadata: {
        confidence: 0.9,
        processingTime: 100,
        model: 'test-model',
        tokens: 50,
      },
    },
    conversation: {
      style: 'friendly',
      tone: 'empathetic',
      language: 'korean',
    },
  };

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(AIResponseService);
    });
  });

  describe('응답 생성', () => {
    it('기본 응답 생성 성공', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: mockMessage }),
      });

      const result = await service.generateResponse({
        message: '테스트 메시지',
        context: mockChatContext,
        config: {
          responseType: 'conversation',
          style: 'friendly',
          format: 'text',
          language: 'korean',
        },
      });

      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
      expect(result.message.content).toBe('테스트 응답');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/ai-response'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('응답 생성 실패 시 fallback 메시지 반환', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await service.generateResponse({
        message: '테스트 메시지',
        context: mockChatContext,
        config: {
          responseType: 'conversation',
          style: 'friendly',
          format: 'text',
          language: 'korean',
        },
      });

      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
      expect(result.message.content).toContain('죄송합니다');
      expect(result.error).toBeDefined();
    });

    it('HTTP 에러 처리', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await service.generateResponse({
        message: '테스트 메시지',
        context: mockChatContext,
        config: {
          responseType: 'conversation',
          style: 'friendly',
          format: 'text',
          language: 'korean',
        },
      });

      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
      expect(result.error).toBeDefined();
    });
  });

  describe('대화 응답 생성', () => {
    it('대화 응답 생성', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: mockMessage }),
      });

      const message = await service.generateConversationResponse(
        '안녕하세요',
        mockChatContext
      );

      expect(message).toBeDefined();
      expect(message.content).toBeDefined();
      expect(global.fetch).toHaveBeenCalled();
    });

    it('대화 응답 생성 실패', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Error'));

      const message = await service.generateConversationResponse(
        '안녕하세요',
        mockChatContext
      );

      expect(message).toBeDefined();
      expect(message.content).toContain('죄송합니다');
    });
  });

  describe('요약 응답 생성', () => {
    it('요약 응답 생성', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: {
            ...mockMessage,
            content: '요약된 내용입니다.',
          },
        }),
      });

      const message = await service.generateSummaryResponse(
        '긴 내용입니다...',
        mockChatContext
      );

      expect(message).toBeDefined();
      expect(message.content).toBeDefined();
      expect(global.fetch).toHaveBeenCalled();
    });

    it('요약 응답 생성 실패', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Error'));

      const message = await service.generateSummaryResponse(
        '긴 내용입니다...',
        mockChatContext
      );

      expect(message).toBeDefined();
      expect(message.content).toContain('죄송합니다');
    });
  });

  describe('분석 응답 생성', () => {
    it('분석 응답 생성', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: {
            ...mockMessage,
            content: '분석 결과입니다.',
          },
        }),
      });

      const message = await service.generateAnalysisResponse(
        '분석할 내용',
        'sentiment',
        mockChatContext
      );

      expect(message).toBeDefined();
      expect(message.content).toBeDefined();
      expect(global.fetch).toHaveBeenCalled();
    });

    it('분석 응답 생성 실패', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Error'));

      const message = await service.generateAnalysisResponse(
        '분석할 내용',
        'sentiment',
        mockChatContext
      );

      expect(message).toBeDefined();
      expect(message.content).toContain('죄송합니다');
    });
  });

  describe('폼 응답 생성', () => {
    it('폼 응답 생성', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: {
            ...mockMessage,
            content: JSON.stringify({ form: 'data' }),
          },
        }),
      });

      const formConfig = { fields: ['field1', 'field2'] };
      const message = await service.generateFormResponse(
        formConfig,
        mockChatContext
      );

      expect(message).toBeDefined();
      expect(message.content).toBeDefined();
      expect(global.fetch).toHaveBeenCalled();
    });

    it('폼 응답 생성 실패', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Error'));

      const formConfig = { fields: ['field1'] };
      const message = await service.generateFormResponse(
        formConfig,
        mockChatContext
      );

      expect(message).toBeDefined();
      expect(message.content).toContain('죄송합니다');
    });
  });

  describe('차트 응답 생성', () => {
    it('차트 응답 생성', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: {
            ...mockMessage,
            content: JSON.stringify({ chart: 'data' }),
          },
        }),
      });

      const data = { x: [1, 2, 3], y: [4, 5, 6] };
      const message = await service.generateChartResponse(
        data,
        'line',
        mockChatContext
      );

      expect(message).toBeDefined();
      expect(message.content).toBeDefined();
      expect(global.fetch).toHaveBeenCalled();
    });

    it('차트 응답 생성 실패', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Error'));

      const data = { x: [1, 2], y: [3, 4] };
      const message = await service.generateChartResponse(
        data,
        'bar',
        mockChatContext
      );

      expect(message).toBeDefined();
      expect(message.content).toContain('죄송합니다');
    });
  });

  describe('Fallback 메시지', () => {
    it('fallback 메시지 구조 확인', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Error'));

      const result = await service.generateResponse({
        message: '테스트',
        context: mockChatContext,
        config: {
          responseType: 'conversation',
          style: 'friendly',
          format: 'text',
          language: 'korean',
        },
      });

      expect(result.message).toBeDefined();
      expect(result.message.id).toBeDefined();
      expect(result.message.sender).toBe('CORBU.AI');
      expect(result.message.type).toBe('ai_response');
      expect(result.message.aiResponse).toBeDefined();
      expect(result.message.conversation).toBeDefined();
    });
  });
});

