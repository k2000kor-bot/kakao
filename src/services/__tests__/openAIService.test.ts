/**
 * OpenAIService 테스트
 */

import { OpenAIService, openAIService, OpenAIChatMessage, OpenAIChatOptions } from '../openAIService';

// fetch 모킹
global.fetch = jest.fn();

// process.env 모킹
const originalEnv = process.env;

describe('OpenAIService', () => {
  let mockFetch: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env = { ...originalEnv };
    mockFetch = global.fetch as jest.Mock;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('초기화', () => {
    it('서비스 인스턴스 확인', () => {
      expect(openAIService).toBe(OpenAIService);
    });
  });

  describe('설정 확인', () => {
    it('API 키가 설정되어 있으면 configured', () => {
      process.env.REACT_APP_OPENAI_API_KEY = 'test-api-key';
      expect(OpenAIService.isConfigured()).toBe(true);
    });

    it('API 키가 설정되지 않으면 not configured', () => {
      delete process.env.REACT_APP_OPENAI_API_KEY;
      expect(OpenAIService.isConfigured()).toBe(false);
    });
  });

  describe('채팅', () => {
    const mockMessages: OpenAIChatMessage[] = [
      { role: 'user', content: '안녕하세요' },
    ];

    it('기본 채팅 요청', async () => {
      process.env.REACT_APP_OPENAI_API_KEY = 'test-api-key';
      const mockResponse = {
        choices: [
          {
            message: {
              content: '안녕하세요! 무엇을 도와드릴까요?',
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await OpenAIService.chat(mockMessages);

      expect(result.content).toBe('안녕하세요! 무엇을 도와드릴까요?');
      expect(result.model).toBeDefined();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/chat/completions'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-api-key',
          }),
        })
      );
    });

    it('시스템 프롬프트 포함 채팅', async () => {
      process.env.REACT_APP_OPENAI_API_KEY = 'test-api-key';
      const mockResponse = {
        choices: [
          {
            message: {
              content: '응답',
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const options: OpenAIChatOptions = {
        systemPrompt: '당신은 친절한 AI 어시스턴트입니다.',
      };

      const result = await OpenAIService.chat(mockMessages, options);

      expect(result.content).toBe('응답');
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.messages[0].role).toBe('system');
      expect(callBody.messages[0].content).toBe('당신은 친절한 AI 어시스턴트입니다.');
    });

    it('모델 지정', async () => {
      process.env.REACT_APP_OPENAI_API_KEY = 'test-api-key';
      const mockResponse = {
        choices: [
          {
            message: {
              content: '응답',
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const options: OpenAIChatOptions = {
        model: 'gpt-4',
      };

      const result = await OpenAIService.chat(mockMessages, options);

      expect(result.model).toBe('gpt-4');
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.model).toBe('gpt-4');
    });

    it('온도 설정', async () => {
      process.env.REACT_APP_OPENAI_API_KEY = 'test-api-key';
      const mockResponse = {
        choices: [
          {
            message: {
              content: '응답',
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const options: OpenAIChatOptions = {
        temperature: 0.9,
      };

      await OpenAIService.chat(mockMessages, options);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.temperature).toBe(0.9);
    });

    it('max_tokens 설정', async () => {
      process.env.REACT_APP_OPENAI_API_KEY = 'test-api-key';
      const mockResponse = {
        choices: [
          {
            message: {
              content: '응답',
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const options: OpenAIChatOptions = {
        max_tokens: 1000,
      };

      await OpenAIService.chat(mockMessages, options);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.max_tokens).toBe(1000);
    });

    it('top_p 설정', async () => {
      process.env.REACT_APP_OPENAI_API_KEY = 'test-api-key';
      const mockResponse = {
        choices: [
          {
            message: {
              content: '응답',
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const options: OpenAIChatOptions = {
        top_p: 0.9,
      };

      await OpenAIService.chat(mockMessages, options);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.top_p).toBe(0.9);
    });

    it('chat/completions 실패 시 responses API로 폴백', async () => {
      process.env.REACT_APP_OPENAI_API_KEY = 'test-api-key';
      
      // 첫 번째 엔드포인트 실패
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Not Found',
      });

      // 두 번째 엔드포인트 성공
      const mockResponse = {
        output_text: '폴백 응답',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await OpenAIService.chat(mockMessages);

      expect(result.content).toBe('폴백 응답');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('다른 응답 형식 처리', async () => {
      process.env.REACT_APP_OPENAI_API_KEY = 'test-api-key';
      const mockResponse = {
        output: [
          {
            content: [
              {
                text: '다른 형식 응답',
              },
            ],
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await OpenAIService.chat(mockMessages);

      expect(result.content).toBe('다른 형식 응답');
    });

    it('모든 엔드포인트 실패 시 에러', async () => {
      process.env.REACT_APP_OPENAI_API_KEY = 'test-api-key';
      
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(OpenAIService.chat(mockMessages)).rejects.toThrow('OpenAI API: all endpoints failed');
    });

    it('HTTP 에러 처리', async () => {
      process.env.REACT_APP_OPENAI_API_KEY = 'test-api-key';
      
      // 모든 엔드포인트가 실패
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => 'Invalid API key',
      });

      await expect(OpenAIService.chat(mockMessages)).rejects.toThrow('OpenAI API: all endpoints failed');
    });

    it('API 키 없이 호출 시 에러', async () => {
      delete process.env.REACT_APP_OPENAI_API_KEY;

      // authHeader()에서 에러가 발생하지만, catch에서 잡혀서 모든 엔드포인트 실패로 처리됨
      await expect(OpenAIService.chat(mockMessages)).rejects.toThrow();
    });
  });

  describe('환경 변수 설정', () => {
    it('기본 URL 사용', async () => {
      process.env.REACT_APP_OPENAI_API_KEY = 'test-api-key';
      delete process.env.REACT_APP_OPENAI_BASE_URL;

      const mockResponse = {
        choices: [
          {
            message: {
              content: '응답',
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await OpenAIService.chat([{ role: 'user', content: 'test' }]);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.openai.com/v1'),
        expect.any(Object)
      );
    });

    it('커스텀 URL 사용', async () => {
      process.env.REACT_APP_OPENAI_API_KEY = 'test-api-key';
      process.env.REACT_APP_OPENAI_BASE_URL = 'https://custom-api.com/v1';

      const mockResponse = {
        choices: [
          {
            message: {
              content: '응답',
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await OpenAIService.chat([{ role: 'user', content: 'test' }]);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://custom-api.com/v1'),
        expect.any(Object)
      );
    });

    it('환경 변수 모델 사용', async () => {
      process.env.REACT_APP_OPENAI_API_KEY = 'test-api-key';
      process.env.REACT_APP_OPENAI_MODEL = 'gpt-3.5-turbo';

      const mockResponse = {
        choices: [
          {
            message: {
              content: '응답',
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await OpenAIService.chat([{ role: 'user', content: 'test' }]);

      expect(result.model).toBe('gpt-3.5-turbo');
    });
  });

  describe('응답 파싱', () => {
    it('JSON 문자열화 폴백', async () => {
      process.env.REACT_APP_OPENAI_API_KEY = 'test-api-key';
      const mockResponse = {
        unknownFormat: 'data',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await OpenAIService.chat([{ role: 'user', content: 'test' }]);

      expect(result.content).toBe(JSON.stringify(mockResponse));
    });
  });

  describe('에지 케이스', () => {
    it('빈 메시지 배열 처리', async () => {
      process.env.REACT_APP_OPENAI_API_KEY = 'test-api-key';
      const mockResponse = {
        choices: [
          {
            message: {
              content: '응답',
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await OpenAIService.chat([]);

      expect(result.content).toBe('응답');
    });

    it('여러 메시지 처리', async () => {
      process.env.REACT_APP_OPENAI_API_KEY = 'test-api-key';
      const messages: OpenAIChatMessage[] = [
        { role: 'user', content: '첫 번째 질문' },
        { role: 'assistant', content: '첫 번째 답변' },
        { role: 'user', content: '두 번째 질문' },
      ];

      const mockResponse = {
        choices: [
          {
            message: {
              content: '두 번째 답변',
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await OpenAIService.chat(messages);

      expect(result.content).toBe('두 번째 답변');
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.messages.length).toBe(3);
    });
  });
});

