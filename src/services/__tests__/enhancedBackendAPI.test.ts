/**
 * EnhancedBackendAPI 테스트
 */

// fetch 모킹
global.fetch = jest.fn();

// unifiedAPI 모킹
jest.mock('../unifiedAPI', () => ({
  sendChatMessage: jest.fn(async (request) => ({
    success: true,
    message: {
      content: '모킹된 응답',
    },
  })),
}));

import {
  EnhancedBackendAPI,
  enhancedBackendAPI,
  BackendAPIRequest,
} from '../enhancedBackendAPI';
import { sendChatMessage } from '../unifiedAPI';

describe('EnhancedBackendAPI', () => {
  let service: EnhancedBackendAPI;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    service = new EnhancedBackendAPI();
    mockFetch = global.fetch as jest.Mock;
    jest.clearAllMocks();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(EnhancedBackendAPI);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(enhancedBackendAPI).toBeDefined();
    });
  });

  describe('고품질 응답 생성', () => {
    it('기본 응답 생성 - standard', async () => {
      (sendChatMessage as jest.Mock).mockResolvedValue({
        success: true,
        message: {
          content: '테스트 응답입니다.',
        },
      });

      const request: BackendAPIRequest = {
        userInput: '테스트 입력',
        options: {
          quality: 'standard',
          style: 'conversational',
          detailLevel: 'balanced',
          tone: 'friendly',
        },
      };

      const result = await service.generateHighQualityResponse(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.content).toBeDefined();
      expect(typeof result.confidence).toBe('number');
      expect(typeof result.processingTime).toBe('number');
      expect(result.metadata).toBeDefined();
    });

    it('enhanced 품질 응답 생성', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: {
            content: '고급 응답입니다.',
          },
          metadata: {
            confidence: 0.85,
            model: 'enhanced-ai',
            tokens: 150,
          },
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request: BackendAPIRequest = {
        userInput: '고급 질문',
        options: {
          quality: 'enhanced',
          style: 'technical',
          detailLevel: 'detailed',
          tone: 'professional',
        },
      };

      const result = await service.generateHighQualityResponse(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.content).toBeDefined();
      expect(result.metadata.model).toBe('enhanced-ai');
    });

    it('ultimate 품질 응답 생성', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          result: {
            content: '궁극 응답입니다.',
            confidence: 0.95,
            tokens: 200,
            quality_score: 0.98,
            improvements: ['최적화된 처리'],
            limitations: ['처리 시간 증가'],
          },
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request: BackendAPIRequest = {
        userInput: '궁극 질문',
        options: {
          quality: 'ultimate',
          style: 'creative',
          detailLevel: 'detailed',
          tone: 'friendly',
        },
      };

      const result = await service.generateHighQualityResponse(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.content).toBeDefined();
      expect(result.metadata.model).toBe('ultimate-integrated-system');
      expect(result.metadata.qualityScore).toBeGreaterThan(0.9);
    });

    it('API 실패 시 폴백 응답', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const request: BackendAPIRequest = {
        userInput: '테스트 입력',
        options: {
          quality: 'standard',
        },
      };

      const result = await service.generateHighQualityResponse(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.content).toBeDefined();
    });

    it('컨텍스트 포함 요청', async () => {
      (sendChatMessage as jest.Mock).mockResolvedValue({
        success: true,
        message: {
          content: '컨텍스트 기반 응답',
        },
      });

      const request: BackendAPIRequest = {
        userInput: '컨텍스트 질문',
        context: {
          projectId: 'project-123',
          userId: 'user-456',
        },
        options: {
          quality: 'standard',
        },
      };

      const result = await service.generateHighQualityResponse(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(sendChatMessage).toHaveBeenCalled();
    });
  });

  describe('다중 백엔드 응답 생성', () => {
    it('여러 백엔드에서 응답 생성', async () => {
      const mockResponse1 = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          response: '첫 번째 응답',
          confidence: 0.8,
        }),
      };

      const mockResponse2 = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: {
            content: '두 번째 응답',
          },
          metadata: {
            confidence: 0.85,
          },
        }),
      };

      mockFetch
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);

      const request: BackendAPIRequest = {
        userInput: '다중 응답 테스트',
        options: {
          quality: 'standard',
        },
      };

      const results = await service.generateMultiBackendResponse(request);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      results.forEach((result) => {
        expect(result).toBeDefined();
        expect(result.success).toBeDefined();
        expect(result.content).toBeDefined();
      });
    });

    it('일부 백엔드 실패 시 처리', async () => {
      const mockResponse1 = {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          response: '성공한 응답',
        }),
      };

      mockFetch
        .mockResolvedValueOnce(mockResponse1)
        .mockRejectedValueOnce(new Error('Network error'));

      const request: BackendAPIRequest = {
        userInput: '부분 실패 테스트',
        options: {
          quality: 'standard',
        },
      };

      const results = await service.generateMultiBackendResponse(request);

      expect(Array.isArray(results)).toBe(true);
      // 일부는 성공, 일부는 실패할 수 있음
    });
  });

  describe('백엔드 상태 확인', () => {
    it('백엔드 상태 확인', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          status: 'healthy',
          version: '1.0.0',
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const status = await service.checkBackendStatus();

      expect(status).toBeDefined();
      expect(typeof status.ultimate).toBe('boolean');
      expect(typeof status.enhanced).toBe('boolean');
      expect(typeof status.standard).toBe('boolean');
    });

    it('백엔드 상태 확인 실패 처리', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const status = await service.checkBackendStatus();

      expect(status).toBeDefined();
      expect(typeof status.ultimate).toBe('boolean');
      expect(typeof status.enhanced).toBe('boolean');
      expect(typeof status.standard).toBe('boolean');
    });
  });

  describe('채팅 메시지 전송', () => {
    it('기본 채팅 메시지 전송', async () => {
      (sendChatMessage as jest.Mock).mockResolvedValue({
        success: true,
        message: {
          content: '메시지 전송 성공',
        },
      });

      const request = {
        message: '테스트 메시지',
        quality: 'standard' as const,
        context: {
          conversationHistory: [],
          projectContext: {},
          userPreferences: {
            responseStyle: 'conversational',
            detailLevel: 'balanced',
            language: 'ko',
            tone: 'friendly',
          },
        },
      };

      const result = await service.sendChatMessage(request);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('컨텍스트 포함 메시지 전송', async () => {
      (sendChatMessage as jest.Mock).mockResolvedValue({
        success: true,
        message: {
          content: '컨텍스트 메시지 전송 성공',
        },
      });

      const request = {
        message: '컨텍스트 메시지',
        quality: 'enhanced' as const,
        context: {
          conversationHistory: [],
          projectContext: {
            projectId: 'project-123',
          },
          userPreferences: {
            responseStyle: 'formal',
            detailLevel: 'detailed',
            language: 'ko',
            tone: 'professional',
          },
        },
      };

      const result = await service.sendChatMessage(request);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('메시지 전송 실패 처리', async () => {
      (sendChatMessage as jest.Mock).mockRejectedValue(new Error('Network error'));

      const request = {
        message: '실패 테스트 메시지',
        quality: 'standard' as const,
        context: {
          conversationHistory: [],
          projectContext: {},
          userPreferences: {
            responseStyle: 'conversational',
            detailLevel: 'balanced',
            language: 'ko',
            tone: 'friendly',
          },
        },
      };

      const result = await service.sendChatMessage(request);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });
  });

  describe('다양한 옵션 조합', () => {
    it('다양한 스타일 옵션', async () => {
      const styles: Array<'conversational' | 'formal' | 'technical' | 'creative'> = [
        'conversational',
        'formal',
        'technical',
        'creative',
      ];

      for (const style of styles) {
        (sendChatMessage as jest.Mock).mockResolvedValue({
          success: true,
          message: {
            content: `${style} 스타일 응답`,
          },
        });

        const request: BackendAPIRequest = {
          userInput: '스타일 테스트',
          options: {
            quality: 'standard',
            style,
          },
        };

        const result = await service.generateHighQualityResponse(request);

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
      }
    });

    it('다양한 톤 옵션', async () => {
      const tones: Array<'friendly' | 'professional' | 'neutral'> = [
        'friendly',
        'professional',
        'neutral',
      ];

      for (const tone of tones) {
        (sendChatMessage as jest.Mock).mockResolvedValue({
          success: true,
          message: {
            content: `${tone} 톤 응답`,
          },
        });

        const request: BackendAPIRequest = {
          userInput: '톤 테스트',
          options: {
            quality: 'standard',
            tone,
          },
        };

        const result = await service.generateHighQualityResponse(request);

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
      }
    });

    it('다양한 상세 수준 옵션', async () => {
      const detailLevels: Array<'simple' | 'balanced' | 'detailed'> = [
        'simple',
        'balanced',
        'detailed',
      ];

      for (const detailLevel of detailLevels) {
        (sendChatMessage as jest.Mock).mockResolvedValue({
          success: true,
          message: {
            content: `${detailLevel} 상세 수준 응답`,
          },
        });

        const request: BackendAPIRequest = {
          userInput: '상세 수준 테스트',
          options: {
            quality: 'standard',
            detailLevel,
          },
        };

        const result = await service.generateHighQualityResponse(request);

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
      }
    });
  });
});

