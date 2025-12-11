/**
 * ChatGPTUnifiedAPI 테스트
 */

import { ChatGPTUnifiedAPI, chatgptUnifiedAPI } from '../chatgptUnifiedAPI';

// fetch 모킹
global.fetch = jest.fn();

describe('ChatGPTUnifiedAPI', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('시스템 상태 확인', () => {
    it('시스템 상태 조회', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          status: 'healthy',
          services: {
            api: 'running',
            database: 'connected',
          },
          timestamp: new Date().toISOString(),
        }),
      });

      const status = await ChatGPTUnifiedAPI.getStatus();

      expect(status).toBeDefined();
      expect(typeof status.status).toBe('string');
      expect(typeof status.services).toBe('object');
      expect(typeof status.timestamp).toBe('string');
    });
  });

  describe('지원 기능 조회', () => {
    it('지원 기능 목록 조회', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          features: {
            content_generation: ['text', 'code', 'image'],
            analysis: ['sentiment', 'summary', 'keywords'],
          },
        }),
      });

      const features = await ChatGPTUnifiedAPI.getSupportedFeatures();

      expect(features).toBeDefined();
      expect(features.success).toBe(true);
      expect(typeof features.features).toBe('object');
    });
  });

  describe('세션 관리', () => {
    it('새 세션 생성', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          session_id: 'session-123',
          message: '세션이 생성되었습니다.',
        }),
      });

      const result = await ChatGPTUnifiedAPI.createSession({
        session_name: '테스트 세션',
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(typeof result.session_id).toBe('string');
      expect(typeof result.message).toBe('string');
    });

    it('모든 세션 조회', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          sessions: [
            {
              id: 'session-1',
              session_name: '세션 1',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        }),
      });

      const result = await ChatGPTUnifiedAPI.getAllSessions();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.sessions)).toBe(true);
    });

    it('특정 세션 조회', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          session: {
            id: 'session-123',
            session_name: '테스트 세션',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            messages: [],
          },
        }),
      });

      const result = await ChatGPTUnifiedAPI.getSession('session-123');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      if (result.session) {
        expect(result.session.id).toBe('session-123');
        expect(typeof result.session.session_name).toBe('string');
      }
    });
  });

  describe('메시지 전송', () => {
    it('메시지 전송 및 응답', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          response: {
            content: '테스트 응답',
            message_type: 'text',
            metadata: {},
          },
        }),
      });

      const result = await ChatGPTUnifiedAPI.sendMessage('session-123', {
        session_id: 'session-123',
        role: 'user',
        content: '테스트 메시지',
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.response).toBeDefined();
      if (result.response) {
        expect(typeof result.response.content).toBe('string');
        expect(typeof result.response.message_type).toBe('string');
      }
    });
  });

  describe('콘텐츠 생성', () => {
    it('콘텐츠 생성', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          content: {
            id: 'content-123',
            session_id: 'session-123',
            content_type: 'text',
            title: '생성된 콘텐츠',
            content: '콘텐츠 내용',
            metadata: {},
            created_at: new Date().toISOString(),
          },
        }),
      });

      const result = await ChatGPTUnifiedAPI.generateContent({
        session_id: 'session-123',
        content_type: 'text',
        prompt: '콘텐츠 생성 요청',
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.content).toBeDefined();
      if (result.content) {
        expect(typeof result.content.id).toBe('string');
        expect(typeof result.content.content_type).toBe('string');
      }
    });
  });

  describe('분석 요청', () => {
    it('분석 수행', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          analysis: {
            id: 'analysis-123',
            session_id: 'session-123',
            analysis_type: 'sentiment',
            result_data: { sentiment: 'positive', score: 0.8 },
            summary: '긍정적 감정',
            created_at: new Date().toISOString(),
          },
        }),
      });

      const result = await ChatGPTUnifiedAPI.performAnalysis({
        session_id: 'session-123',
        analysis_type: 'sentiment',
        data: '분석할 텍스트',
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.analysis).toBeDefined();
      if (result.analysis) {
        expect(typeof result.analysis.id).toBe('string');
        expect(typeof result.analysis.analysis_type).toBe('string');
      }
    });
  });

  describe('에러 처리', () => {
    it('API 호출 실패 처리', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({}),
      });

      await expect(ChatGPTUnifiedAPI.getStatus()).rejects.toThrow();
    });

    it('네트워크 에러 처리', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(ChatGPTUnifiedAPI.getStatus()).rejects.toThrow();
    });
  });

  describe('싱글톤 인스턴스', () => {
    it('chatgptUnifiedAPI 객체 확인', () => {
      expect(chatgptUnifiedAPI).toBeDefined();
      expect(typeof chatgptUnifiedAPI).toBe('object');
    });
  });
});

