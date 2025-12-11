/**
 * EnhancedConversationalService 테스트
 */

// fetch 모킹
global.fetch = jest.fn();

import {
  EnhancedConversationalService,
  enhancedConversationalService,
  MessageRequest,
  AnalysisRequest,
  InsightRequest,
  ContextualResponseRequest,
  QualityFeedbackRequest,
} from '../enhancedConversationalService';

describe('EnhancedConversationalService', () => {
  let service: EnhancedConversationalService;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    service = new EnhancedConversationalService();
    mockFetch = global.fetch as jest.Mock;
    jest.clearAllMocks();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(EnhancedConversationalService);
    });

    it('커스텀 baseUrl로 인스턴스 생성', () => {
      const customService = new EnhancedConversationalService('http://custom-url:8080');
      expect(customService).toBeInstanceOf(EnhancedConversationalService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(enhancedConversationalService).toBeDefined();
    });
  });

  describe('헬스 체크', () => {
    it('기본 헬스 체크', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          status: 'healthy',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          active_conversations: 5,
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await service.checkHealth();

      expect(result).toBeDefined();
      expect(result.status).toBe('healthy');
      expect(result.version).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(typeof result.active_conversations).toBe('number');
    });

    it('헬스 체크 실패 처리', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(service.checkHealth()).rejects.toThrow();
    });
  });

  describe('메시지 전송', () => {
    it('기본 메시지 전송', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            response: '테스트 응답입니다.',
            metadata: {
              emotion: 'positive',
              confidence: 0.9,
              processing_time: 100,
            },
          },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request: MessageRequest = {
        conversation_id: 'conv-123',
        user_id: 'user-456',
        message: '테스트 메시지',
      };

      const result = await service.sendMessage(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data.response).toBeDefined();
      expect(result.data.metadata).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('AI 성격 옵션 포함 메시지', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            response: '창의적 응답',
            metadata: {
              emotion: 'positive',
              confidence: 0.85,
              processing_time: 120,
            },
          },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request: MessageRequest = {
        conversation_id: 'conv-123',
        user_id: 'user-456',
        message: '창의적 질문',
        ai_personality: 'creative',
      };

      const result = await service.sendMessage(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('응답 스타일 옵션 포함 메시지', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            response: '상세한 응답',
            metadata: {
              emotion: 'neutral',
              confidence: 0.9,
              processing_time: 150,
            },
          },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request: MessageRequest = {
        conversation_id: 'conv-123',
        user_id: 'user-456',
        message: '상세 질문',
        response_style: 'detailed',
      };

      const result = await service.sendMessage(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('메시지 전송 실패 처리', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const request: MessageRequest = {
        conversation_id: 'conv-123',
        user_id: 'user-456',
        message: '실패 테스트',
      };

      await expect(service.sendMessage(request)).rejects.toThrow();
    });
  });

  describe('대화 분석', () => {
    it('기본 대화 분석', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            conversation_length: 10,
            average_message_length: 50,
            emotion_distribution: {
              positive: 0.6,
              negative: 0.2,
              neutral: 0.2,
            },
            top_keywords: {
              '테스트': 5,
              '질문': 3,
            },
            topics: ['테스트', '질문'],
            conversation_flow: 'smooth',
            user_satisfaction: 0.85,
          },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request: AnalysisRequest = {
        conversation_id: 'conv-123',
      };

      const result = await service.analyzeConversation(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data.conversation_length).toBeDefined();
      expect(result.data.average_message_length).toBeDefined();
      expect(result.data.emotion_distribution).toBeDefined();
      expect(Array.isArray(result.data.topics)).toBe(true);
      expect(result.timestamp).toBeDefined();
    });

    it('대화 분석 실패 처리', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const request: AnalysisRequest = {
        conversation_id: 'conv-123',
      };

      await expect(service.analyzeConversation(request)).rejects.toThrow();
    });
  });

  describe('인사이트 생성', () => {
    it('기본 인사이트 생성', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            patterns: ['반복적인 질문 패턴'],
            recommendations: ['더 구체적인 질문 권장'],
            predictions: ['향후 관심 주제 예측'],
            improvements: ['응답 속도 개선'],
          },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request: InsightRequest = {
        conversation_id: 'conv-123',
      };

      const result = await service.generateInsights(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data.patterns)).toBe(true);
      expect(Array.isArray(result.data.recommendations)).toBe(true);
      expect(Array.isArray(result.data.predictions)).toBe(true);
      expect(Array.isArray(result.data.improvements)).toBe(true);
      expect(result.timestamp).toBeDefined();
    });

    it('인사이트 생성 실패 처리', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const request: InsightRequest = {
        conversation_id: 'conv-123',
      };

      await expect(service.generateInsights(request)).rejects.toThrow();
    });
  });

  describe('컨텍스트 기반 응답', () => {
    it('기본 컨텍스트 기반 응답', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            type: 'answer',
            response: '컨텍스트 기반 응답',
            confidence: 0.9,
            sources: ['source1', 'source2'],
          },
          metadata: {
            processing_time: 200,
            intent: 'question',
            clarification_needed: false,
          },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request: ContextualResponseRequest = {
        conversation_id: 'conv-123',
        user_id: 'user-456',
        message: '컨텍스트 질문',
      };

      const result = await service.getContextualResponse(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data.type).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('명확화가 필요한 경우', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            type: 'clarification',
            question: '어떤 측면을 더 자세히 알고 싶으신가요?',
            suggestions: ['옵션 1', '옵션 2'],
          },
          metadata: {
            processing_time: 150,
            intent: 'unclear',
            clarification_needed: true,
          },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request: ContextualResponseRequest = {
        conversation_id: 'conv-123',
        user_id: 'user-456',
        message: '모호한 질문',
        clarification_needed: true,
      };

      const result = await service.getContextualResponse(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data.type).toBe('clarification');
      expect(result.data.question).toBeDefined();
      expect(Array.isArray(result.data.suggestions)).toBe(true);
    });

    it('컨텍스트 히스토리 포함', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            type: 'answer',
            response: '히스토리 기반 응답',
            confidence: 0.95,
          },
          metadata: {
            processing_time: 180,
            intent: 'follow-up',
            clarification_needed: false,
          },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request: ContextualResponseRequest = {
        conversation_id: 'conv-123',
        user_id: 'user-456',
        message: '후속 질문',
        context_history: [
          {
            user_id: 'user-456',
            message: '이전 메시지',
            timestamp: new Date().toISOString(),
          },
        ],
      };

      const result = await service.getContextualResponse(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('컨텍스트 기반 응답 실패 처리', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const request: ContextualResponseRequest = {
        conversation_id: 'conv-123',
        user_id: 'user-456',
        message: '실패 테스트',
      };

      await expect(service.getContextualResponse(request)).rejects.toThrow();
    });
  });

  describe('품질 피드백', () => {
    it('긍정적 피드백', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            message: '피드백 감사합니다',
            improvements: [],
          },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request: QualityFeedbackRequest = {
        conversation_id: 'conv-123',
        user_id: 'user-456',
        message_id: 'msg-789',
        quality: 'good',
        feedback: '좋은 응답이었습니다',
      };

      const result = await service.sendQualityFeedback(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data.message).toBeDefined();
      expect(Array.isArray(result.data.improvements)).toBe(true);
      expect(result.timestamp).toBeDefined();
    });

    it('부정적 피드백', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            message: '피드백 반영하겠습니다',
            improvements: ['응답 정확도 향상', '응답 속도 개선'],
          },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request: QualityFeedbackRequest = {
        conversation_id: 'conv-123',
        user_id: 'user-456',
        message_id: 'msg-789',
        quality: 'bad',
        feedback: '응답이 부정확했습니다',
      };

      const result = await service.sendQualityFeedback(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data.improvements.length).toBeGreaterThan(0);
    });

    it('품질 피드백 실패 처리', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const request: QualityFeedbackRequest = {
        conversation_id: 'conv-123',
        user_id: 'user-456',
        message_id: 'msg-789',
        quality: 'good',
      };

      await expect(service.sendQualityFeedback(request)).rejects.toThrow();
    });
  });

  describe('다양한 AI 성격 옵션', () => {
    it('helpful 성격', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            response: '도움이 되는 응답',
            metadata: {
              emotion: 'positive',
              confidence: 0.9,
              processing_time: 100,
            },
          },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request: MessageRequest = {
        conversation_id: 'conv-123',
        user_id: 'user-456',
        message: '도움 요청',
        ai_personality: 'helpful',
      };

      const result = await service.sendMessage(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('analytical 성격', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            response: '분석적 응답',
            metadata: {
              emotion: 'neutral',
              confidence: 0.95,
              processing_time: 150,
            },
          },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request: MessageRequest = {
        conversation_id: 'conv-123',
        user_id: 'user-456',
        message: '분석 요청',
        ai_personality: 'analytical',
      };

      const result = await service.sendMessage(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('empathetic 성격', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            response: '공감적 응답',
            metadata: {
              emotion: 'positive',
              confidence: 0.85,
              processing_time: 120,
            },
          },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request: MessageRequest = {
        conversation_id: 'conv-123',
        user_id: 'user-456',
        message: '감정적 질문',
        ai_personality: 'empathetic',
      };

      const result = await service.sendMessage(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('다양한 응답 스타일 옵션', () => {
    it('concise 스타일', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            response: '간결한 응답',
            metadata: {
              emotion: 'neutral',
              confidence: 0.9,
              processing_time: 80,
            },
          },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request: MessageRequest = {
        conversation_id: 'conv-123',
        user_id: 'user-456',
        message: '간결한 질문',
        response_style: 'concise',
      };

      const result = await service.sendMessage(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('technical 스타일', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            response: '기술적 응답',
            metadata: {
              emotion: 'neutral',
              confidence: 0.95,
              processing_time: 200,
            },
          },
          timestamp: new Date().toISOString(),
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request: MessageRequest = {
        conversation_id: 'conv-123',
        user_id: 'user-456',
        message: '기술 질문',
        response_style: 'technical',
      };

      const result = await service.sendMessage(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });
});

