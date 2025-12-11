/**
 * unifiedMessageService 서비스 테스트
 * 통합 메시지 서비스 테스트
 */

import unifiedMessageService, { UnifiedMessageRequest } from '../unifiedMessageService';

// fetch 모킹
global.fetch = jest.fn();

// errorLogger 모킹
jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('unifiedMessageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('싱글톤 인스턴스', () => {
    it('내보낸 인스턴스가 정의되어 있어야 함', () => {
      expect(unifiedMessageService).toBeDefined();
    });
  });

  describe('processMessage', () => {
    it('채팅 메시지를 처리할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: {
            content: '테스트 응답',
            sender: 'ai',
            timestamp: new Date().toISOString(),
          },
          metadata: {
            confidence: 0.9,
            tokens: 100,
          },
        }),
      } as Response);

      const request: UnifiedMessageRequest = {
        type: 'chat',
        content: '테스트 메시지',
      };

      const response = await unifiedMessageService.processMessage(request);

      expect(response.success).toBe(true);
      expect(response.message).toBeDefined();
      expect(response.message.content).toBe('테스트 응답');
      expect(response.metadata).toBeDefined();
      expect(response.metadata?.usedServices).toContain('chat');
    });

    it('분석 메시지를 처리할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          analysis: '분석 결과',
          confidence: 0.85,
          tokens: 200,
        }),
      } as Response);

      const request: UnifiedMessageRequest = {
        type: 'analysis',
        content: '분석 요청',
      };

      const response = await unifiedMessageService.processMessage(request);

      expect(response.success).toBe(true);
      expect(response.message.content).toContain('분석 결과');
      expect(response.metadata?.usedServices).toContain('analysis');
    });

    it('가이드 메시지를 처리할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          generatedMessage: '가이드 내용',
          confidence: 0.9,
          tokens: 150,
        }),
      } as Response);

      const request: UnifiedMessageRequest = {
        type: 'guidance',
        content: '가이드 요청',
      };

      const response = await unifiedMessageService.processMessage(request);

      expect(response.success).toBe(true);
      expect(response.message.content).toContain('가이드');
      expect(response.metadata?.usedServices).toContain('guidance');
    });

    it('프로젝트 메시지를 처리할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: '프로젝트 정보',
          confidence: 0.8,
          tokens: 120,
        }),
      } as Response);

      const request: UnifiedMessageRequest = {
        type: 'project',
        content: '프로젝트 조회',
      };

      const response = await unifiedMessageService.processMessage(request);

      expect(response.success).toBe(true);
      expect(response.message.content).toContain('프로젝트');
      expect(response.metadata?.usedServices).toContain('project');
    });

    it('파일 메시지를 처리할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: '파일 정보',
          confidence: 0.85,
          tokens: 100,
        }),
      } as Response);

      const request: UnifiedMessageRequest = {
        type: 'file',
        content: '파일 조회',
      };

      const response = await unifiedMessageService.processMessage(request);

      expect(response.success).toBe(true);
      expect(response.message.content).toContain('파일');
      expect(response.metadata?.usedServices).toContain('file');
    });

    it('시스템 메시지를 처리할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: '시스템 상태',
          confidence: 0.95,
          tokens: 80,
        }),
      } as Response);

      const request: UnifiedMessageRequest = {
        type: 'system',
        content: '시스템 상태 조회',
      };

      const response = await unifiedMessageService.processMessage(request);

      expect(response.success).toBe(true);
      expect(response.message.content).toContain('시스템');
      expect(response.metadata?.usedServices).toContain('system');
    });

    it('API 호출 실패 시 폴백 응답을 반환해야 함', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const request: UnifiedMessageRequest = {
        type: 'chat',
        content: '테스트',
      };

      const response = await unifiedMessageService.processMessage(request);

      expect(response.success).toBe(false);
      expect(response.message).toBeDefined();
      expect(response.message.content).toBeDefined();
    });

    it('HTTP 에러 시 폴백 응답을 반환해야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      const request: UnifiedMessageRequest = {
        type: 'chat',
        content: '테스트',
      };

      const response = await unifiedMessageService.processMessage(request);

      expect(response.success).toBe(false);
    });

    it('알 수 없는 타입은 기본 채팅으로 처리해야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: {
            content: '응답',
            sender: 'ai',
            timestamp: new Date().toISOString(),
          },
        }),
      } as Response);

      const request = {
        type: 'unknown' as any,
        content: '테스트',
      };

      const response = await unifiedMessageService.processMessage(request);

      expect(response).toBeDefined();
    });

    it('메타데이터를 포함해야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: {
            content: '응답',
            sender: 'ai',
            timestamp: new Date().toISOString(),
          },
        }),
      } as Response);

      const request: UnifiedMessageRequest = {
        type: 'chat',
        content: '테스트',
      };

      const response = await unifiedMessageService.processMessage(request);

      expect(response.metadata).toBeDefined();
      expect(response.metadata?.processingTime).toBeGreaterThanOrEqual(0);
      expect(response.metadata?.confidence).toBeDefined();
      expect(response.metadata?.model).toBeDefined();
      expect(response.metadata?.tokens).toBeDefined();
      expect(response.metadata?.usedServices).toBeDefined();
    });
  });

  describe('processConversationCommand', () => {
    it('분석 명령을 처리할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          analysis: '분석 결과',
          confidence: 0.85,
          tokens: 200,
        }),
      } as Response);

      const response = await unifiedMessageService.processConversationCommand('이것을 분석해주세요');

      expect(response.metadata?.usedServices).toContain('analysis');
    });

    it('가이드 명령을 처리할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          generatedMessage: '가이드',
          confidence: 0.9,
          tokens: 150,
        }),
      } as Response);

      const response = await unifiedMessageService.processConversationCommand('가이드를 알려주세요');

      expect(response.metadata?.usedServices).toContain('guidance');
    });

    it('프로젝트 명령을 처리할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: '프로젝트 정보',
          confidence: 0.8,
          tokens: 120,
        }),
      } as Response);

      const response = await unifiedMessageService.processConversationCommand('프로젝트를 보여주세요');

      expect(response.metadata?.usedServices).toContain('project');
    });

    it('파일 명령을 처리할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: '파일 정보',
          confidence: 0.85,
          tokens: 100,
        }),
      } as Response);

      const response = await unifiedMessageService.processConversationCommand('파일 목록을 보여주세요');

      expect(response.metadata?.usedServices).toContain('file');
    });

    it('시스템 명령을 처리할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: '시스템 상태',
          confidence: 0.95,
          tokens: 80,
        }),
      } as Response);

      const response = await unifiedMessageService.processConversationCommand('시스템 상태를 확인해주세요');

      expect(response.metadata?.usedServices).toContain('system');
    });

    it('영어 명령도 처리할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          analysis: '분석',
          confidence: 0.85,
          tokens: 200,
        }),
      } as Response);

      const response = await unifiedMessageService.processConversationCommand('analyze this');

      expect(response.metadata?.usedServices).toContain('analysis');
    });

    it('명령이 없으면 기본 채팅으로 처리해야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: {
            content: '응답',
            sender: 'ai',
            timestamp: new Date().toISOString(),
          },
        }),
      } as Response);

      const response = await unifiedMessageService.processConversationCommand('일반 메시지');

      expect(response.metadata?.usedServices).toContain('chat');
    });
  });
});

