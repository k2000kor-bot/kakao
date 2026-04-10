/**
 * LocalLLMService 테스트
 * @jest-environment jsdom
 */
/* eslint-disable jest/no-conditional-expect */

import { installJestFetchMock } from '../../test-utils/installJestFetchMock';
import {
  LocalLLMService,
  localLLMService,
  LLMProvider,
  LLMModel,
} from '../localLLMService';

// fetch 모킹
installJestFetchMock();

// TextDecoder 모킹
global.TextDecoder = class TextDecoder {
  decode(_input?: Uint8Array, _options?: { stream?: boolean }): string {
    return '';
  }
} as unknown as typeof TextDecoder;

// localStorage 모킹
let localStorageStore: Record<string, string> = {};

const localStorageMock = {
  getItem: jest.fn().mockImplementation((key: string) => {
    return localStorageStore[key] || null;
  }),
  setItem: jest.fn().mockImplementation((key: string, value: string) => {
    localStorageStore[key] = value.toString();
  }),
  removeItem: jest.fn().mockImplementation((key: string) => {
    delete localStorageStore[key];
  }),
  clear: jest.fn().mockImplementation(() => {
    localStorageStore = {};
  }),
  get length() {
    return Object.keys(localStorageStore).length;
  },
  key: jest.fn().mockImplementation((index: number) => {
    const keys = Object.keys(localStorageStore);
    return keys[index] || null;
  }),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('LocalLLMService', () => {
  let service: LocalLLMService;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    localStorageStore = {};
    jest.clearAllMocks();
    mockFetch = jest.mocked(global.fetch);
    mockFetch.mockClear();
    service = new LocalLLMService();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(LocalLLMService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(localLLMService).toBeDefined();
    });

    it('기본 프로바이더 초기화', () => {
      const providers = service.getProviders();

      expect(Array.isArray(providers)).toBe(true);
      expect(providers.length).toBeGreaterThan(0);
    });
  });

  describe('프로바이더 관리', () => {
    it('프로바이더 추가', () => {
      const provider: LLMProvider = {
        id: 'test-provider',
        name: '테스트 프로바이더',
        type: 'custom',
        baseUrl: 'http://localhost:8080',
        enabled: true,
      };

      service.addProvider(provider);

      const providers = service.getProviders();
      expect(providers.some((p) => p.id === 'test-provider')).toBe(true);
    });

    it('프로바이더 제거', () => {
      const provider: LLMProvider = {
        id: 'temp-provider',
        name: '임시 프로바이더',
        type: 'custom',
        baseUrl: 'http://localhost:8080',
        enabled: true,
      };

      service.addProvider(provider);
      service.removeProvider('temp-provider');

      const providers = service.getProviders();
      expect(providers.some((p) => p.id === 'temp-provider')).toBe(false);
    });

    it('프로바이더 목록 조회', () => {
      const providers = service.getProviders();

      expect(Array.isArray(providers)).toBe(true);
      providers.forEach((provider) => {
        expect(provider.id).toBeDefined();
        expect(provider.name).toBeDefined();
        expect(provider.type).toBeDefined();
        expect(provider.baseUrl).toBeDefined();
        expect(typeof provider.enabled).toBe('boolean');
      });
    });
  });

  describe('프로젝트 LLM 설정', () => {
    const createTestProvider = (): LLMProvider => ({
      id: 'test-provider',
      name: '테스트 프로바이더',
      type: 'ollama',
      baseUrl: 'http://localhost:11434',
      enabled: true,
    });

    const createTestModel = (): LLMModel => ({
      id: 'test-model',
      name: '테스트 모델',
      provider: 'ollama',
      description: '테스트 모델 설명',
      contextLength: 4096,
      maxTokens: 2048,
    });

    it('프로젝트 LLM 설정', () => {
      const provider = createTestProvider();
      const model = createTestModel();

      service.setProjectLLM('project-1', '프로젝트 1', provider, model);

      const config = service.getProjectLLM('project-1');
      expect(config).toBeDefined();
      expect(config?.projectId).toBe('project-1');
      expect(config?.projectName).toBe('프로젝트 1');
      expect(config?.provider.id).toBe(provider.id);
      expect(config?.model.id).toBe(model.id);
    });

    it('프로젝트 LLM 설정 조회', () => {
      const provider = createTestProvider();
      const model = createTestModel();

      service.setProjectLLM('project-1', '프로젝트 1', provider, model);

      const config = service.getProjectLLM('project-1');
      expect(config).toBeDefined();
      expect(config?.projectId).toBe('project-1');
    });

    it('프로젝트 LLM 설정 목록 조회', () => {
      const provider = createTestProvider();
      const model = createTestModel();

      service.setProjectLLM('project-1', '프로젝트 1', provider, model);
      service.setProjectLLM('project-2', '프로젝트 2', provider, model);

      const configs = service.getProjectConfigs();
      expect(Array.isArray(configs)).toBe(true);
      expect(configs.length).toBeGreaterThanOrEqual(2);
    });

    it('프로젝트 LLM 설정 삭제', () => {
      const provider = createTestProvider();
      const model = createTestModel();

      service.setProjectLLM('project-1', '프로젝트 1', provider, model);
      service.removeProjectLLM('project-1');

      const config = service.getProjectLLM('project-1');
      expect(config).toBeUndefined();
    });

    it('커스텀 설정으로 프로젝트 LLM 설정', () => {
      const provider = createTestProvider();
      const model = createTestModel();

      service.setProjectLLM('project-1', '프로젝트 1', provider, model, {
        temperature: 0.5,
        maxTokens: 1000,
        topP: 0.8,
        stream: false,
      });

      const config = service.getProjectLLM('project-1');
      expect(config).toBeDefined();
      expect(config?.settings.temperature).toBe(0.5);
      expect(config?.settings.maxTokens).toBe(1000);
      expect(config?.settings.topP).toBe(0.8);
      expect(config?.settings.stream).toBe(false);
    });
  });

  describe('Ollama 모델 조회', () => {
    it('Ollama 모델 목록 조회 성공', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          models: [
            {
              name: 'llama2',
              size: 4096,
            },
            {
              name: 'mistral',
              size: 4096,
            },
          ],
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const models = await service.getOllamaModels('http://localhost:11434');

      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBe(2);
      expect(models[0].provider).toBe('ollama');
    });

    it('Ollama 모델 조회 실패 시 빈 배열 반환', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const models = await service.getOllamaModels('http://localhost:11434');

      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBe(0);
    });

    it('Ollama API 오류 처리', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      };

      mockFetch.mockResolvedValue(mockResponse);

      const models = await service.getOllamaModels('http://localhost:11434');

      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBe(0);
    });
  });

  describe('LM Studio 모델 조회', () => {
    it('LM Studio 모델 목록 조회 성공', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          data: [
            {
              id: 'gpt-3.5-turbo',
            },
            {
              id: 'gpt-4',
            },
          ],
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const models = await service.getLMStudioModels('http://localhost:1234');

      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBe(2);
      expect(models[0].provider).toBe('lmstudio');
    });

    it('LM Studio 모델 조회 실패 시 빈 배열 반환', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const models = await service.getLMStudioModels('http://localhost:1234');

      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBe(0);
    });
  });

  describe('Ollama 요청 전송', () => {
    it('Ollama 비스트리밍 요청', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          response: '테스트 응답',
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request = {
        messages: [
          { role: 'user' as const, content: '테스트 질문' },
        ],
        model: 'llama2',
        stream: false,
      };

      const response = await service.sendOllamaRequest(
        'http://localhost:11434',
        request
      );

      expect(response).toBeDefined();
      expect(response.content).toBe('테스트 응답');
      expect(response.model).toBe('llama2');
    });

    it('Ollama API 오류 처리', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request = {
        messages: [
          { role: 'user' as const, content: '테스트 질문' },
        ],
        model: 'llama2',
        stream: false,
      };

      await expect(
        service.sendOllamaRequest('http://localhost:11434', request)
      ).rejects.toThrow();
    });
  });

  describe('LM Studio 요청 전송', () => {
    it('LM Studio 비스트리밍 요청', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'LM Studio 응답',
              },
            },
          ],
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request = {
        messages: [
          { role: 'user' as const, content: '테스트 질문' },
        ],
        model: 'gpt-3.5-turbo',
        stream: false,
      };

      const response = await service.sendLMStudioRequest(
        'http://localhost:1234',
        request
      );

      expect(response).toBeDefined();
      expect(response.content).toBe('LM Studio 응답');
      expect(response.model).toBe('gpt-3.5-turbo');
    });

    it('LM Studio API 오류 처리', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      };

      mockFetch.mockResolvedValue(mockResponse);

      const request = {
        messages: [
          { role: 'user' as const, content: '테스트 질문' },
        ],
        model: 'gpt-3.5-turbo',
        stream: false,
      };

      await expect(
        service.sendLMStudioRequest('http://localhost:1234', request)
      ).rejects.toThrow();
    });
  });

  describe('프로젝트 요청 전송', () => {
    it('프로젝트 요청 전송 성공', async () => {
      const provider: LLMProvider = {
        id: 'test-provider',
        name: '테스트 프로바이더',
        type: 'ollama',
        baseUrl: 'http://localhost:11434',
        enabled: true,
      };

      const model: LLMModel = {
        id: 'test-model',
        name: '테스트 모델',
        provider: 'ollama',
        description: '테스트 모델 설명',
        contextLength: 4096,
        maxTokens: 2048,
      };

      service.setProjectLLM('project-1', '프로젝트 1', provider, model, {
        stream: false,
      });

      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          response: '프로젝트 응답',
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const messages = [
        { role: 'user' as const, content: '테스트 질문' },
      ];

      const response = await service.sendProjectRequest('project-1', messages);

      expect(response).toBeDefined();
      expect(response.content).toBe('프로젝트 응답');
    });

    it('설정이 없는 프로젝트 요청 시 에러', async () => {
      const messages = [
        { role: 'user' as const, content: '테스트 질문' },
      ];

      await expect(
        service.sendProjectRequest('nonexistent-project', messages)
      ).rejects.toThrow();
    });
  });

  describe('프로바이더 연결 테스트', () => {
    it('Ollama 프로바이더 연결 테스트 성공', async () => {
      const provider: LLMProvider = {
        id: 'test-ollama',
        name: '테스트 Ollama',
        type: 'ollama',
        baseUrl: 'http://localhost:11434',
        enabled: true,
      };

      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          models: [{ name: 'llama2', size: 4096 }],
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await service.testProviderConnection(provider);

      expect(result).toBe(true);
    });

    it('LM Studio 프로바이더 연결 테스트 성공', async () => {
      const provider: LLMProvider = {
        id: 'test-lmstudio',
        name: '테스트 LM Studio',
        type: 'lmstudio',
        baseUrl: 'http://localhost:1234',
        enabled: true,
      };

      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          data: [{ id: 'gpt-3.5-turbo' }],
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await service.testProviderConnection(provider);

      expect(result).toBe(true);
    });

    it('프로바이더 연결 테스트 실패', async () => {
      const provider: LLMProvider = {
        id: 'test-fail',
        name: '실패 프로바이더',
        type: 'ollama',
        baseUrl: 'http://localhost:11434',
        enabled: true,
      };

      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await service.testProviderConnection(provider);

      expect(result).toBe(false);
    });
  });
});

