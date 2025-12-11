/**
 * NotebookLLMService 테스트
 */

// fetch 모킹
global.fetch = jest.fn();

// errorReportingService 모킹
jest.mock('../errorReportingService', () => ({
  errorReportingService: {
    reportError: jest.fn().mockResolvedValue(undefined),
  },
}));

// localStorage 모킹
let localStorageStore: Record<string, string> = {};

const localStorageMock = {
  getItem: (key: string) => {
    return localStorageStore[key] || null;
  },
  setItem: (key: string, value: string) => {
    localStorageStore[key] = value.toString();
  },
  removeItem: (key: string) => {
    delete localStorageStore[key];
  },
  clear: () => {
    localStorageStore = {};
  },
  get length() {
    return Object.keys(localStorageStore).length;
  },
  key: (index: number) => {
    const keys = Object.keys(localStorageStore);
    return keys[index] || null;
  },
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

import {
  NotebookLLMService,
  notebookLLMService,
  NotebookLLMConfig,
  NotebookLLMResponse,
  NotebookLLMStatus,
} from '../notebookLLMService';
import { errorReportingService } from '../errorReportingService';

describe('NotebookLLMService', () => {
  let service: NotebookLLMService;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    localStorageStore = {};
    jest.clearAllMocks();
    mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    
    // 싱글톤 인스턴스 리셋을 위해 새 인스턴스 생성
    service = NotebookLLMService.getInstance();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(NotebookLLMService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(notebookLLMService).toBeDefined();
      expect(notebookLLMService).toBeInstanceOf(NotebookLLMService);
    });

    it('getInstance는 같은 인스턴스 반환', () => {
      const instance1 = NotebookLLMService.getInstance();
      const instance2 = NotebookLLMService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('기본 노트북 상태 조회', () => {
    it('상태 조회 성공', async () => {
      const mockStatus: NotebookLLMStatus = {
        available: true,
        models: ['llama3.1:8b', 'qwen2.5:7b'],
        currentModel: 'llama3.1:8b',
        memoryUsage: 50,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus,
      } as Response);

      const status = await service.getDefaultNotebookStatus();

      expect(status).toEqual(mockStatus);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v7/notebook-llm/status'),
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('상태 조회 실패 시 기본값 반환', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const status = await service.getDefaultNotebookStatus();

      expect(status).toEqual({
        available: false,
        models: [],
      });
      expect(errorReportingService.reportError).toHaveBeenCalled();
    });

    it('상태 조회 HTTP 오류 시 기본값 반환', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      } as Response);

      const status = await service.getDefaultNotebookStatus();

      expect(status).toEqual({
        available: false,
        models: [],
      });
    });
  });

  describe('프로젝트 노트북 상태 조회', () => {
    it('프로젝트 상태 조회 성공', async () => {
      const projectId = 'project-1';
      const mockStatus: NotebookLLMStatus = {
        available: true,
        models: ['llama3.1:8b'],
        currentModel: 'llama3.1:8b',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus,
      } as Response);

      const status = await service.getProjectNotebookStatus(projectId);

      expect(status).toEqual(mockStatus);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/v7/notebook-llm/project/${projectId}/status`),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('프로젝트 상태 조회 실패 시 기본값 반환', async () => {
      const projectId = 'project-1';
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const status = await service.getProjectNotebookStatus(projectId);

      expect(status).toEqual({
        available: false,
        models: [],
      });
      expect(errorReportingService.reportError).toHaveBeenCalled();
    });
  });

  describe('기본 노트북 응답 생성', () => {
    it('응답 생성 성공', async () => {
      const prompt = '테스트 프롬프트';
      const mockResponse: NotebookLLMResponse = {
        content: '테스트 응답',
        modelUsed: 'llama3.1:8b',
        processingTime: 1.5,
        confidence: 0.9,
        tokensUsed: 100,
        mode: 'local',
        timestamp: new Date().toISOString(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const response = await service.generateWithDefaultNotebook(prompt);

      expect(response).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v7/notebook-llm/generate'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining(prompt),
        })
      );
    });

    it('컨텍스트와 함께 응답 생성', async () => {
      const prompt = '테스트 프롬프트';
      const context = { key: 'value' };
      const config: Partial<NotebookLLMConfig> = {
        temperature: 0.8,
      };

      const mockResponse: NotebookLLMResponse = {
        content: '응답',
        modelUsed: 'llama3.1:8b',
        processingTime: 1.0,
        confidence: 0.8,
        tokensUsed: 50,
        mode: 'local',
        timestamp: new Date().toISOString(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const response = await service.generateWithDefaultNotebook(prompt, context, config);

      expect(response).toEqual(mockResponse);
      const callBody = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
      expect(callBody.context).toEqual(context);
      expect(callBody.config).toMatchObject(config);
    });

    it('도메인과 함께 응답 생성', async () => {
      const prompt = '도시정비 관련 질문';
      const domains = ['도시정비', '세무'];

      const mockResponse: NotebookLLMResponse = {
        content: '응답',
        modelUsed: 'llama3.1:8b',
        processingTime: 1.0,
        confidence: 0.8,
        tokensUsed: 50,
        mode: 'local',
        timestamp: new Date().toISOString(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const response = await service.generateWithDefaultNotebook(prompt, undefined, undefined, domains);

      expect(response).toEqual(mockResponse);
    });

    it('응답 생성 실패 시 에러 발생', async () => {
      const prompt = '테스트 프롬프트';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        text: async () => JSON.stringify({ error: 'Invalid prompt' }),
      } as Response);

      await expect(service.generateWithDefaultNotebook(prompt)).rejects.toThrow();
      expect(errorReportingService.reportError).toHaveBeenCalled();
    });

    it('네트워크 오류 시 에러 발생', async () => {
      const prompt = '테스트 프롬프트';

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.generateWithDefaultNotebook(prompt)).rejects.toThrow();
      expect(errorReportingService.reportError).toHaveBeenCalled();
    });
  });

  describe('프로젝트 노트북 응답 생성', () => {
    it('프로젝트 응답 생성 성공', async () => {
      const projectId = 'project-1';
      const prompt = '테스트 프롬프트';
      const mockResponse: NotebookLLMResponse = {
        content: '프로젝트 응답',
        modelUsed: 'qwen2.5:7b',
        processingTime: 2.0,
        confidence: 0.85,
        tokensUsed: 150,
        mode: 'cloud',
        timestamp: new Date().toISOString(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const response = await service.generateWithProjectNotebook(projectId, prompt);

      expect(response).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/v7/notebook-llm/project/${projectId}/generate`),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('프로젝트 응답 생성 실패 시 에러 발생', async () => {
      const projectId = 'project-1';
      const prompt = '테스트 프롬프트';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
        text: async () => 'Server Error',
      } as Response);

      await expect(service.generateWithProjectNotebook(projectId, prompt)).rejects.toThrow();
      expect(errorReportingService.reportError).toHaveBeenCalled();
    });
  });

  describe('프로젝트 설정 관리', () => {
    it('프로젝트 설정 저장', () => {
      const projectId = 'project-1';
      const config: NotebookLLMConfig = {
        modelType: 'llama3.1:8b',
        processingMode: 'local_only',
        temperature: 0.7,
        maxTokens: 2000,
        contextSize: 4096,
      };

      service.setProjectNotebookConfig(projectId, config);

      const stored = localStorage.getItem('notebookLLMConfigs');
      expect(stored).toBeTruthy();
      const configs = JSON.parse(stored!);
      expect(configs[projectId]).toEqual(config);
    });

    it('프로젝트 설정 로드 - 메모리에서', () => {
      const projectId = 'project-1';
      const config: NotebookLLMConfig = {
        modelType: 'qwen2.5:7b',
        processingMode: 'auto',
        temperature: 0.8,
        maxTokens: 1500,
        contextSize: 2048,
      };

      service.setProjectNotebookConfig(projectId, config);
      const loaded = service.getProjectNotebookConfig(projectId);

      expect(loaded).toEqual({ ...config, projectId });
    });

    it('프로젝트 설정 로드 - localStorage에서', () => {
      const projectId = 'project-2';
      const config: NotebookLLMConfig = {
        modelType: 'gemma2:9b',
        processingMode: 'hybrid',
        temperature: 0.6,
        maxTokens: 3000,
        contextSize: 8192,
      };

      // 직접 localStorage에 저장
      localStorage.setItem('notebookLLMConfigs', JSON.stringify({ [projectId]: config }));

      // 새 인스턴스에서 로드
      const loaded = service.getProjectNotebookConfig(projectId);

      expect(loaded).toEqual(config);
    });

    it('존재하지 않는 프로젝트 설정 로드', () => {
      const loaded = service.getProjectNotebookConfig('nonexistent');
      expect(loaded).toBeNull();
    });
  });

  describe('기본 설정 관리', () => {
    it('기본 설정 업데이트', () => {
      const partialConfig: Partial<NotebookLLMConfig> = {
        temperature: 0.9,
        maxTokens: 2500,
      };

      service.setDefaultConfig(partialConfig);

      const stored = localStorage.getItem('defaultNotebookLLMConfig');
      expect(stored).toBeTruthy();
      const config = JSON.parse(stored!);
      expect(config.temperature).toBe(0.9);
      expect(config.maxTokens).toBe(2500);
    });

    it('기본 설정 로드', () => {
      const config: NotebookLLMConfig = {
        modelType: 'auto',
        processingMode: 'auto',
        temperature: 0.75,
        maxTokens: 1800,
        contextSize: 4096,
      };

      localStorage.setItem('defaultNotebookLLMConfig', JSON.stringify(config));

      const loaded = service.loadDefaultConfig();

      expect(loaded.temperature).toBe(0.75);
      expect(loaded.maxTokens).toBe(1800);
    });

    it('기본 설정 로드 실패 시 기본값 반환', () => {
      // 잘못된 JSON 저장
      localStorage.setItem('defaultNotebookLLMConfig', 'invalid json');

      const loaded = service.loadDefaultConfig();

      // 기본값이 반환되어야 함
      expect(loaded).toBeDefined();
      expect(loaded.modelType).toBe('auto');
    });
  });

  describe('재시도 로직', () => {
    it('재시도 가능한 오류 시 재시도', async () => {
      const prompt = '테스트 프롬프트';

      // 첫 번째 시도: 500 오류
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        } as Response)
        // 두 번째 시도: 성공
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            content: '응답',
            modelUsed: 'llama3.1:8b',
            processingTime: 1.0,
            confidence: 0.8,
            tokensUsed: 50,
            mode: 'local',
            timestamp: new Date().toISOString(),
          }),
        } as Response);

      // jest.useFakeTimers()를 사용하지 않고 실제 지연을 빠르게 처리
      const response = await service.generateWithDefaultNotebook(prompt);

      expect(response.content).toBe('응답');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('네트워크 오류 시 재시도', async () => {
      const prompt = '테스트 프롬프트';

      // 첫 번째 시도: 네트워크 오류
      mockFetch
        .mockRejectedValueOnce(new Error('Failed to fetch'))
        // 두 번째 시도: 성공
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            content: '응답',
            modelUsed: 'llama3.1:8b',
            processingTime: 1.0,
            confidence: 0.8,
            tokensUsed: 50,
            mode: 'local',
            timestamp: new Date().toISOString(),
          }),
        } as Response);

      const response = await service.generateWithDefaultNotebook(prompt);

      expect(response.content).toBe('응답');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('에러 처리', () => {
    it('JSON 파싱 오류 처리', async () => {
      const prompt = '테스트 프롬프트';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        text: async () => 'Invalid JSON',
      } as Response);

      await expect(service.generateWithDefaultNotebook(prompt)).rejects.toThrow();
    });

    it('에러 리포팅 서비스 호출 확인', async () => {
      const prompt = '테스트 프롬프트';

      mockFetch.mockRejectedValueOnce(new Error('Test error'));

      await expect(service.generateWithDefaultNotebook(prompt)).rejects.toThrow();
      expect(errorReportingService.reportError).toHaveBeenCalled();
    });
  });
});

