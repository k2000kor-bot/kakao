/**
 * EnhancedBackendAPI 테스트
 */
/* eslint-disable jest/no-conditional-expect */

/// <reference types="jest" />

import {
  EnhancedBackendAPI,
  enhancedBackendAPI,
  BackendAPIRequest,
  mapConversationHistoryToChatTurns,
} from '../enhancedBackendAPI';
import { sendChatMessage } from '../unifiedAPI';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';

const MOCK_MSG_TS = '2024-01-01T00:00:00.000Z';

function partialJsonResponse(init: {
  ok?: boolean;
  status?: number;
  json: () => Promise<unknown>;
}): Response {
  return init as unknown as Response;
}

// fetch 모킹
installJestFetchMock();

// unifiedAPI 모킹
jest.mock('../unifiedAPI', () => ({
  sendChatMessage: jest.fn(async (_request) => ({
    success: true,
    message: {
      content: '모킹된 응답',
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })),
}));

describe('mapConversationHistoryToChatTurns', () => {
  it('role·content를 ChatTurn으로 변환', () => {
    const out = mapConversationHistoryToChatTurns([
      { role: 'user', content: 'a' },
      { role: 'assistant', content: 'b' },
    ]);
    expect(out).toEqual([
      { role: 'user', content: 'a' },
      { role: 'assistant', content: 'b' },
    ]);
  });

  it('sender·ai 별칭을 처리', () => {
    const out = mapConversationHistoryToChatTurns([
      { sender: 'user', message: 'x' },
      { sender: 'ai', text: 'y' },
    ]);
    expect(out).toEqual([
      { role: 'user', content: 'x' },
      { role: 'assistant', content: 'y' },
    ]);
  });

  it('pipelineExtras를 보존해 merge 시나리오 상속에 쓸 수 있다', () => {
    const out = mapConversationHistoryToChatTurns([
      {
        role: 'assistant',
        content: '답',
        pipelineExtras: { generationScenarioMarkdown: '## EBB\n시나리오' },
      },
    ]);
    expect(out).toBeDefined();
    expect(out).toHaveLength(1);
    const first = out![0];
    const md = first.pipelineExtras?.generationScenarioMarkdown;
    expect(String(md)).toContain('EBB');
  });
});

describe('EnhancedBackendAPI', () => {
  let service: EnhancedBackendAPI;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    service = new EnhancedBackendAPI();
    mockFetch = jest.mocked(global.fetch);
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
      jest.mocked(sendChatMessage).mockResolvedValue({
        success: true,
        message: {
          content: '테스트 응답입니다.',
          timestamp: MOCK_MSG_TS,
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

    it('standard 경로가 unified rawResponse에서 pipelineExtras를 채운다', async () => {
      jest.mocked(sendChatMessage).mockResolvedValue({
        success: true,
        message: {
          content: '답',
          timestamp: new Date().toISOString(),
        },
        rawResponse: {
          success: true,
          response: '답',
          metadata: { generation_phase: 'verify' },
        },
      });

      const result = await service.generateHighQualityResponse({
        userInput: 'q',
        options: { quality: 'standard' },
      });

      expect(result.success).toBe(true);
      expect(result.pipelineExtras?.pipelineGenerationPhase).toBe('verify');
    });

    it('enhanced 품질 응답 생성', async () => {
      const mockResponse = partialJsonResponse({
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
            generation_phase: 'draft',
          },
        }),
      });

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
      expect(result.pipelineExtras?.pipelineGenerationPhase).toBe('draft');
    });

    it('ultimate 품질 응답 생성', async () => {
      const mockResponse = partialJsonResponse({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          pipeline_phase: 'final',
          result: {
            content: '궁극 응답입니다.',
            confidence: 0.95,
            tokens: 200,
            quality_score: 0.98,
            improvements: ['최적화된 처리'],
            limitations: ['처리 시간 증가'],
          },
        }),
      });

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
      expect(result.pipelineExtras?.pipelineGenerationPhase).toBe('final');
    });

    it('API 실패 시 폴백 응답', async () => {
      jest.mocked(sendChatMessage).mockRejectedValueOnce(new Error('Network error'));

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
      jest.mocked(sendChatMessage).mockResolvedValue({
        success: true,
        message: {
          content: '컨텍스트 기반 응답',
          timestamp: MOCK_MSG_TS,
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
      const mockResponse1 = partialJsonResponse({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          response: '첫 번째 응답',
          confidence: 0.8,
        }),
      });

      const mockResponse2 = partialJsonResponse({
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
      });

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
      const mockResponse1 = partialJsonResponse({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          response: '성공한 응답',
        }),
      });

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
      const mockResponse = partialJsonResponse({
        ok: true,
        status: 200,
        json: async () => ({
          status: 'healthy',
          version: '1.0.0',
        }),
      });

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

  describe('대화 메시지 전송', () => {
    it('기본 대화 메시지 전송', async () => {
      jest.mocked(sendChatMessage).mockResolvedValue({
        success: true,
        message: {
          content: '메시지 전송 성공',
          timestamp: MOCK_MSG_TS,
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

    it('sendChatMessage가 standard 응답의 pipelineExtras를 노출한다', async () => {
      jest.mocked(sendChatMessage).mockResolvedValue({
        success: true,
        message: { content: 'ok', timestamp: new Date().toISOString() },
        rawResponse: {
          success: true,
          response: 'ok',
          metadata: { generation_phase: 'analyze' },
        },
      });

      const result = await service.sendChatMessage({
        message: 'm',
        quality: 'standard',
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
      });

      expect(result.pipelineExtras?.pipelineGenerationPhase).toBe('analyze');
    });

    it('conversationHistory를 sendChatMessage에 conversation_history로 전달', async () => {
      await service.sendChatMessage({
        message: '질문: x\n요구사항: y',
        quality: 'standard',
        context: {
          conversationHistory: [
            { role: 'user', content: 'hello' },
            { role: 'assistant', content: 'hi' },
          ],
          projectContext: {},
          userPreferences: {
            responseStyle: 'conversational',
            detailLevel: 'balanced',
            language: 'ko',
            tone: 'friendly',
          },
        },
      });

      expect(sendChatMessage).toHaveBeenCalled();
      const arg = jest.mocked(sendChatMessage).mock.calls[0][0];
      expect(arg.conversation_history).toEqual([
        { role: 'user', content: 'hello' },
        { role: 'assistant', content: 'hi' },
      ]);
    });

    it('컨텍스트 포함 메시지 전송', async () => {
      jest.mocked(sendChatMessage).mockResolvedValue({
        success: true,
        message: {
          content: '컨텍스트 메시지 전송 성공',
          timestamp: MOCK_MSG_TS,
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
      jest.mocked(sendChatMessage).mockRejectedValue(new Error('Network error'));

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
        jest.mocked(sendChatMessage).mockResolvedValue({
          success: true,
          message: {
            content: `${style} 스타일 응답`,
            timestamp: MOCK_MSG_TS,
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
        jest.mocked(sendChatMessage).mockResolvedValue({
          success: true,
          message: {
            content: `${tone} 톤 응답`,
            timestamp: MOCK_MSG_TS,
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
        jest.mocked(sendChatMessage).mockResolvedValue({
          success: true,
          message: {
            content: `${detailLevel} 상세 수준 응답`,
            timestamp: MOCK_MSG_TS,
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

