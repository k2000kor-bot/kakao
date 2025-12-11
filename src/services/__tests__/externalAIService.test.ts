/**
 * ExternalAIService 테스트
 */

// fetch 모킹
global.fetch = jest.fn();

import {
  ExternalAIService,
  externalAIService,
  AIConfig,
} from '../externalAIService';
import { ChatSession } from '../../types/chat';
import { Project } from '../../types/project';

describe('ExternalAIService', () => {
  let service: ExternalAIService;
  let mockFetch: jest.Mock;

  const createTestSession = (): ChatSession => ({
    id: 'session-123',
    title: '테스트 세션',
    messages: [
      {
        id: 'msg-1',
        content: '이전 메시지',
        sender: 'user',
        timestamp: new Date(),
        isUser: true,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const createTestProject = (): Project => ({
    id: 'project-123',
    name: '테스트 프로젝트',
    description: '테스트 설명',
    status: 'active',
    priority: 'high',
    files: [],
    guidelines: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(() => {
    service = new ExternalAIService();
    mockFetch = global.fetch as jest.Mock;
    jest.clearAllMocks();

    // 환경 변수 모킹
    process.env.REACT_APP_OPENAI_API_KEY = 'test-openai-key';
    process.env.REACT_APP_CLAUDE_API_KEY = 'test-claude-key';
    process.env.REACT_APP_GEMINI_API_KEY = 'test-gemini-key';
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(ExternalAIService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(externalAIService).toBeDefined();
    });
  });

  describe('AI 제공자 조회', () => {
    it('지원되는 제공자 목록 조회', async () => {
      const providers = await service.getProviders();

      expect(Array.isArray(providers)).toBe(true);
      expect(providers.length).toBeGreaterThan(0);
      providers.forEach((provider) => {
        expect(provider.id).toBeDefined();
        expect(provider.name).toBeDefined();
        expect(Array.isArray(provider.models)).toBe(true);
        expect(provider.supported).toBe(true);
      });
    });

    it('제공자 정보 구조 확인', async () => {
      const providers = await service.getProviders();

      if (providers.length > 0) {
        const provider = providers[0];
        expect(typeof provider.id).toBe('string');
        expect(typeof provider.name).toBe('string');
        expect(typeof provider.defaultModel).toBe('string');
        expect(typeof provider.supported).toBe('boolean');
        expect(typeof provider.costPerToken).toBe('number');
        expect(typeof provider.maxTokens).toBe('number');
      }
    });
  });

  describe('기본 설정', () => {
    it('기본 설정 조회', () => {
      const config = service.getDefaultConfig();

      expect(config).toBeDefined();
      expect(config.provider).toBeDefined();
      expect(config.model).toBeDefined();
      expect(typeof config.temperature).toBe('number');
      expect(typeof config.maxTokens).toBe('number');
      expect(typeof config.autoSpeak).toBe('boolean');
    });

    it('기본 설정이 독립적인 객체인지 확인', () => {
      const config1 = service.getDefaultConfig();
      const config2 = service.getDefaultConfig();

      expect(config1).not.toBe(config2);
    });
  });

  describe('AI 응답 생성', () => {
    it('로컬 AI 응답 생성', async () => {
      const session = createTestSession();
      const config: AIConfig = {
        provider: 'local',
        model: 'local-model',
        temperature: 0.7,
        maxTokens: 1000,
        autoSpeak: false,
      };

      const result = await service.generateResponse(
        '안녕하세요',
        session,
        null,
        config
      );

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.provider).toBe('local');
      expect(result.model).toBeDefined();
      expect(typeof result.tokens).toBe('number');
      expect(typeof result.cost).toBe('number');
      expect(typeof result.latency).toBe('number');
    });

    it('프로젝트 컨텍스트 포함 응답 생성', async () => {
      const session = createTestSession();
      const project = createTestProject();
      const config: AIConfig = {
        provider: 'local',
        model: 'local-model',
        temperature: 0.7,
        maxTokens: 1000,
        autoSpeak: false,
      };

      const result = await service.generateResponse(
        '프로젝트에 대해 알려주세요',
        session,
        project,
        config
      );

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('OpenAI 응답 생성', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'OpenAI 응답입니다.',
              },
            },
          ],
          usage: {
            total_tokens: 100,
          },
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const session = createTestSession();
      const config: AIConfig = {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000,
        autoSpeak: false,
      };

      const result = await service.generateResponse(
        '테스트 질문',
        session,
        null,
        config
      );

      expect(result).toBeDefined();
      expect(result.provider).toBe('openai');
      expect(result.content).toBeDefined();
      expect(typeof result.tokens).toBe('number');
      expect(typeof result.cost).toBe('number');
    });

    it('Claude 응답 생성', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          content: [
            {
              text: 'Claude 응답입니다.',
            },
          ],
          usage: {
            input_tokens: 50,
            output_tokens: 50,
          },
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const session = createTestSession();
      const config: AIConfig = {
        provider: 'claude',
        model: 'claude-3-sonnet',
        temperature: 0.7,
        maxTokens: 1000,
        autoSpeak: false,
      };

      const result = await service.generateResponse(
        '테스트 질문',
        session,
        null,
        config
      );

      expect(result).toBeDefined();
      expect(result.provider).toBe('claude');
      expect(result.content).toBeDefined();
    });

    it('Gemini 응답 생성', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: 'Gemini 응답입니다.',
                  },
                ],
              },
            },
          ],
          usageMetadata: {
            totalTokenCount: 100,
          },
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const session = createTestSession();
      const config: AIConfig = {
        provider: 'gemini',
        model: 'gemini-pro',
        temperature: 0.7,
        maxTokens: 1000,
        autoSpeak: false,
      };

      const result = await service.generateResponse(
        '테스트 질문',
        session,
        null,
        config
      );

      expect(result).toBeDefined();
      expect(result.provider).toBe('gemini');
      expect(result.content).toBeDefined();
    });

    it('API 실패 시 로컬 AI 폴백', async () => {
      mockFetch.mockRejectedValue(new Error('API error'));

      const session = createTestSession();
      const config: AIConfig = {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000,
        autoSpeak: false,
      };

      const result = await service.generateResponse(
        '테스트 질문',
        session,
        null,
        config
      );

      expect(result).toBeDefined();
      expect(result.provider).toBe('local');
      expect(result.content).toBeDefined();
    });

    it('지원하지 않는 제공자 에러 처리', async () => {
      const session = createTestSession();
      const config: AIConfig = {
        provider: 'unsupported',
        model: 'test-model',
        temperature: 0.7,
        maxTokens: 1000,
        autoSpeak: false,
      };

      const result = await service.generateResponse(
        '테스트 질문',
        session,
        null,
        config
      );

      expect(result).toBeDefined();
      // 에러 발생 시 로컬 AI로 폴백
      expect(result.provider).toBe('local');
    });
  });

  describe('모델 비교', () => {
    it('기본 모델 비교', async () => {
      // 모든 제공자가 실패하더라도 로컬 AI는 작동해야 함
      mockFetch.mockRejectedValue(new Error('API error'));

      const session = createTestSession();
      const result = await service.compareModels('비교 테스트', session, null);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      // 최소한 로컬 AI는 응답해야 함
      expect(result.local).toBeDefined();
    });
  });

  describe('비용 계산', () => {
    it('기본 비용 계산', () => {
      const cost = service.calculateCost('openai', 1000);

      expect(typeof cost).toBe('number');
      expect(cost).toBeGreaterThanOrEqual(0);
    });

    it('다양한 제공자 비용 계산', () => {
      const providers = ['openai', 'claude', 'gemini', 'local'];
      const tokens = 1000;

      providers.forEach((provider) => {
        const cost = service.calculateCost(provider, tokens);
        expect(typeof cost).toBe('number');
        expect(cost).toBeGreaterThanOrEqual(0);
      });
    });

    it('존재하지 않는 제공자 비용 계산', () => {
      const cost = service.calculateCost('nonexistent', 1000);

      expect(cost).toBe(0);
    });
  });

  describe('사용 통계', () => {
    it('기본 사용 통계 조회', async () => {
      const stats = await service.getUsageStats();

      expect(stats).toBeDefined();
      expect(typeof stats.totalRequests).toBe('number');
      expect(typeof stats.totalTokens).toBe('number');
      expect(typeof stats.totalCost).toBe('number');
      expect(typeof stats.providerBreakdown).toBe('object');
    });
  });

  describe('로컬 AI 응답 패턴', () => {
    it('인사 메시지 처리', async () => {
      const session = createTestSession();
      const config: AIConfig = {
        provider: 'local',
        model: 'local-model',
        temperature: 0.7,
        maxTokens: 1000,
        autoSpeak: false,
      };

      const result = await service.generateResponse(
        '안녕하세요',
        session,
        null,
        config
      );

      expect(result.content).toContain('안녕하세요');
    });

    it('프로젝트 관련 질문 처리', async () => {
      const session = createTestSession();
      const project = createTestProject();
      const config: AIConfig = {
        provider: 'local',
        model: 'local-model',
        temperature: 0.7,
        maxTokens: 1000,
        autoSpeak: false,
      };

      const result = await service.generateResponse(
        '프로젝트에 대해 알려주세요',
        session,
        project,
        config
      );

      expect(result.content).toBeDefined();
      expect(result.content.length).toBeGreaterThan(0);
    });

    it('도움 요청 처리', async () => {
      const session = createTestSession();
      const config: AIConfig = {
        provider: 'local',
        model: 'local-model',
        temperature: 0.7,
        maxTokens: 1000,
        autoSpeak: false,
      };

      const result = await service.generateResponse(
        '도움말을 보여주세요',
        session,
        null,
        config
      );

      expect(result.content).toBeDefined();
    });
  });

  describe('다양한 설정 옵션', () => {
    it('다양한 temperature 설정', async () => {
      const temperatures = [0.0, 0.5, 0.7, 1.0];

      for (const temperature of temperatures) {
        const session = createTestSession();
        const config: AIConfig = {
          provider: 'local',
          model: 'local-model',
          temperature,
          maxTokens: 1000,
          autoSpeak: false,
        };

        const result = await service.generateResponse(
          '테스트',
          session,
          null,
          config
        );

        expect(result).toBeDefined();
      }
    });

    it('다양한 maxTokens 설정', async () => {
      const maxTokensList = [500, 1000, 2000, 4000];

      for (const maxTokens of maxTokensList) {
        const session = createTestSession();
        const config: AIConfig = {
          provider: 'local',
          model: 'local-model',
          temperature: 0.7,
          maxTokens,
          autoSpeak: false,
        };

        const result = await service.generateResponse(
          '테스트',
          session,
          null,
          config
        );

        expect(result).toBeDefined();
      }
    });
  });
});

