/**
 * NotebookLLMService 테스트
 * @jest-environment jsdom
 */
/* eslint-disable jest/no-conditional-expect */

import {
  NOTEBOOK_LLM_CONFIGS_STORAGE_KEY,
  NOTEBOOK_LLM_DEFAULT_CONFIG_STORAGE_KEY,
  NotebookLLMService,
  notebookLLMService,
  NotebookLLMConfig,
  NotebookLLMResponse,
  NotebookLLMStatus,
  searchDomainKnowledge,
  getDomainDetail,
  getDomainStatistics,
  getTermDefinition,
  getDomainFAQs,
  getDomainExamples,
  getDomainRelationGraph,
  getDomainPromptTemplates,
  generateDomainInsights,
  validateDomainKnowledge,
  recordDomainUsage,
  getDomainUsageStats,
  addKnowledgeHistory,
  getKnowledgeHistory,
  setExpertModeConfig,
  getExpertModeConfig,
  buildExpertContext,
  detectRelevantDomains,
  buildIntelligentContext,
  buildResponseFormatInstructions,
} from '../notebookLLMService';
import {
  API_PROJECTS_LIST_PATH,
  API_V7_NOTEBOOK_LLM_GENERATE_PATH,
  API_V7_NOTEBOOK_LLM_STATUS_PATH,
  PROJECT_NOTEBOOK_LLM_SEGMENT,
  joinApiHealthCheckUrl,
  resolveApiBaseUrl,
} from '../../config/api';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';
import { errorReportingService } from '../errorReportingService';

const notebookLLMFetchMock = installJestFetchMock();

// errorReportingService 모킹
jest.mock('../errorReportingService', () => ({
  errorReportingService: {
    reportError: jest.fn().mockResolvedValue(undefined),
  },
}));

// errorLogger 모킹 (에러 처리 테스트 시 console.error 방지)
jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
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

/** `NotebookLLMService` 생성자의 `this.baseUrl`과 동일한 우선순위(테스트에서 fetch URL 기대값용) */
function notebookLlmServiceConfigBaseForTest(): string {
  return (
    process.env.REACT_APP_NOTEBOOK_LLM_URL ||
    process.env.REACT_APP_API_URL ||
    resolveApiBaseUrl()
  );
}

describe('NotebookLLMService', () => {
  let service: NotebookLLMService;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    localStorageStore = {};
    jest.clearAllMocks();
    mockFetch = jest.mocked(notebookLLMFetchMock);
    
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
        joinApiHealthCheckUrl(notebookLlmServiceConfigBaseForTest(), API_V7_NOTEBOOK_LLM_STATUS_PATH),
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
        joinApiHealthCheckUrl(
          notebookLlmServiceConfigBaseForTest(),
          `${API_PROJECTS_LIST_PATH}/${encodeURIComponent(projectId)}${PROJECT_NOTEBOOK_LLM_SEGMENT}/status`,
        ),
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
        joinApiHealthCheckUrl(notebookLlmServiceConfigBaseForTest(), API_V7_NOTEBOOK_LLM_GENERATE_PATH),
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
        joinApiHealthCheckUrl(
          notebookLlmServiceConfigBaseForTest(),
          `${API_PROJECTS_LIST_PATH}/${encodeURIComponent(projectId)}${PROJECT_NOTEBOOK_LLM_SEGMENT}/generate`,
        ),
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

      const stored = localStorage.getItem(NOTEBOOK_LLM_CONFIGS_STORAGE_KEY);
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
      localStorage.setItem(NOTEBOOK_LLM_CONFIGS_STORAGE_KEY, JSON.stringify({ [projectId]: config }));

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

      const stored = localStorage.getItem(NOTEBOOK_LLM_DEFAULT_CONFIG_STORAGE_KEY);
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

      localStorage.setItem(NOTEBOOK_LLM_DEFAULT_CONFIG_STORAGE_KEY, JSON.stringify(config));

      const loaded = service.loadDefaultConfig();

      expect(loaded.temperature).toBe(0.75);
      expect(loaded.maxTokens).toBe(1800);
    });

    it('기본 설정 로드 실패 시 기본값 반환', () => {
      // 잘못된 JSON 저장
      localStorage.setItem(NOTEBOOK_LLM_DEFAULT_CONFIG_STORAGE_KEY, 'invalid json');

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

  describe('searchDomainKnowledge', () => {
    it('쿼리와 일치하는 도메인 지식을 반환해야 함', () => {
      const results = searchDomainKnowledge('재개발');
      expect(results.length).toBeGreaterThan(0);
      const hasMatch = results.some(r => r.matches.length > 0);
      expect(hasMatch).toBe(true);
      const match = results.find(r => r.matches.some(m => m.content.includes('재개발')));
      expect(match).toBeDefined();
      expect(match!.domain).toBeDefined();
      expect(match!.totalMatches).toBeGreaterThan(0);
    });

    it('일치하는 내용이 없으면 빈 매치 배열을 가진 결과를 반환할 수 있음', () => {
      const results = searchDomainKnowledge('xyznonexistent123');
      expect(Array.isArray(results)).toBe(true);
    });

    it('domainFilter가 주어지면 해당 도메인만 검색해야 함', () => {
      const results = searchDomainKnowledge('재개발', ['도시정비']);
      expect(results.length).toBeLessThanOrEqual(1);
      if (results.length > 0) {
        expect(results[0].domain).toBe('도시정비');
      }
    });
  });

  describe('getDomainDetail', () => {
    it('존재하는 도메인 키로 상세 정보를 반환해야 함', () => {
      const detail = getDomainDetail('도시정비');
      expect(detail).not.toBeNull();
      expect(detail!.domain).toBe('도시정비');
      expect(detail!.summary).toContain('도시정비');
      expect(Array.isArray(detail!.laws)).toBe(true);
      expect(Array.isArray(detail!.concepts)).toBe(true);
      expect(detail!.laws).toContain('도시 및 주거환경정비법');
      expect(detail!.concepts).toContain('재개발');
    });

    it('존재하지 않는 도메인 키는 null을 반환해야 함', () => {
      expect(getDomainDetail('nonexistent')).toBeNull();
    });
  });

  describe('getDomainStatistics', () => {
    it('전체 도메인 통계를 반환해야 함', () => {
      const stats = getDomainStatistics();
      expect(stats.totalDomains).toBeGreaterThan(0);
      expect(stats.totalLaws).toBeGreaterThanOrEqual(0);
      expect(stats.totalConcepts).toBeGreaterThan(0);
      expect(Array.isArray(stats.domainBreakdown)).toBe(true);
      expect(stats.domainBreakdown.length).toBe(stats.totalDomains);
    });
  });

  describe('getTermDefinition', () => {
    it('용어로 정의 목록을 반환해야 함', () => {
      const results = getTermDefinition('재개발');
      expect(Array.isArray(results)).toBe(true);
      if (results.length > 0) {
        expect(results[0]).toHaveProperty('term');
        expect(results[0]).toHaveProperty('domain');
        expect(results[0]).toHaveProperty('definition');
      }
    });

    it('일치하는 용어가 없으면 빈 배열을 반환해야 함', () => {
      const results = getTermDefinition('xyznonexistent123');
      expect(results).toEqual([]);
    });
  });

  describe('getDomainFAQs', () => {
    it('존재하는 도메인의 FAQ 배열을 반환해야 함', () => {
      const faqs = getDomainFAQs('도시정비');
      expect(Array.isArray(faqs)).toBe(true);
    });

    it('존재하지 않는 도메인은 빈 배열을 반환해야 함', () => {
      expect(getDomainFAQs('nonexistent')).toEqual([]);
    });
  });

  describe('getDomainExamples', () => {
    it('존재하는 도메인의 예시 배열을 반환해야 함', () => {
      const examples = getDomainExamples('도시정비');
      expect(Array.isArray(examples)).toBe(true);
    });

    it('존재하지 않는 도메인은 빈 배열을 반환해야 함', () => {
      expect(getDomainExamples('nonexistent')).toEqual([]);
    });
  });

  describe('getDomainRelationGraph', () => {
    it('노드와 링크를 가진 관계 그래프를 반환해야 함', () => {
      const graph = getDomainRelationGraph();
      expect(graph).toHaveProperty('nodes');
      expect(graph).toHaveProperty('links');
      expect(Array.isArray(graph.nodes)).toBe(true);
      expect(Array.isArray(graph.links)).toBe(true);
      expect(graph.nodes.length).toBeGreaterThan(0);
    });
  });

  describe('getDomainPromptTemplates', () => {
    it('존재하는 도메인의 프롬프트 템플릿 배열을 반환해야 함', () => {
      const templates = getDomainPromptTemplates('도시정비');
      expect(Array.isArray(templates)).toBe(true);
      if (templates.length > 0) {
        expect(templates[0]).toHaveProperty('id');
        expect(templates[0]).toHaveProperty('template');
      }
    });

    it('존재하지 않는 도메인은 빈 배열을 반환해야 함', () => {
      expect(getDomainPromptTemplates('nonexistent')).toEqual([]);
    });

    it('국토부·부동산정책 도메인 템플릿을 반환해야 함', () => {
      const molit = getDomainPromptTemplates('국토부');
      const policy = getDomainPromptTemplates('부동산정책');
      expect(molit.length).toBeGreaterThan(0);
      expect(policy.length).toBeGreaterThan(0);
    });
  });

  describe('generateDomainInsights', () => {
    it('선택된 도메인 조합에 따라 인사이트를 반환해야 함', () => {
      const insights = generateDomainInsights(['도시정비', '세무']);
      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);
      expect(insights[0]).toHaveProperty('type');
      expect(insights[0]).toHaveProperty('title');
      expect(insights[0]).toHaveProperty('relatedDomains');
    });

    it('관련 없는 도메인만 있으면 빈 배열을 반환할 수 있음', () => {
      const insights = generateDomainInsights(['도시정비']);
      expect(Array.isArray(insights)).toBe(true);
    });

    it('세무+회계 조합 시 세무·회계 연계 인사이트를 반환해야 함', () => {
      const insights = generateDomainInsights(['세무', '회계']);
      const hasTaxAccounting = insights.some(i => i.relatedDomains.includes('세무') && i.relatedDomains.includes('회계'));
      expect(hasTaxAccounting).toBe(true);
    });

    it('법무+계약 조합 시 계약서 법적 검토 인사이트를 반환해야 함', () => {
      const insights = generateDomainInsights(['법무', '계약']);
      const hasContractLegal = insights.some(i => i.title?.includes('계약서'));
      expect(hasContractLegal).toBe(true);
    });
  });

  describe('validateDomainKnowledge', () => {
    it('존재하는 도메인의 품질 정보를 반환해야 함', () => {
      const quality = validateDomainKnowledge('도시정비');
      expect(quality.domain).toBe('도시정비');
      expect(typeof quality.completeness).toBe('number');
      expect(typeof quality.accuracy).toBe('number');
      expect(Array.isArray(quality.issues)).toBe(true);
    });

    it('존재하지 않는 도메인은 이슈를 포함한 품질 정보를 반환해야 함', () => {
      const quality = validateDomainKnowledge('nonexistent');
      expect(quality.domain).toBe('nonexistent');
      expect(quality.completeness).toBe(0);
      expect(quality.issues).toContain('도메인을 찾을 수 없습니다');
    });
  });

  describe('recordDomainUsage and getDomainUsageStats', () => {
    it('recordDomainUsage 후 getDomainUsageStats로 해당 도메인 통계를 조회할 수 있어야 함', () => {
      recordDomainUsage('도시정비', true);
      const stats = getDomainUsageStats('도시정비');
      expect(Array.isArray(stats)).toBe(true);
      if (stats.length > 0) {
        expect(stats[0].domain).toBe('도시정비');
        expect(stats[0].usageCount).toBeGreaterThanOrEqual(1);
      }
    });

    it('getDomainUsageStats()는 전체 통계 배열을 반환해야 함', () => {
      const stats = getDomainUsageStats();
      expect(Array.isArray(stats)).toBe(true);
    });

    it('존재하지 않는 도메인 통계는 빈 배열을 반환해야 함', () => {
      const stats = getDomainUsageStats('nonexistent-domain-xyz');
      expect(stats).toEqual([]);
    });
  });

  describe('addKnowledgeHistory and getKnowledgeHistory', () => {
    it('addKnowledgeHistory 후 getKnowledgeHistory로 해당 도메인 히스토리를 조회할 수 있어야 함', () => {
      addKnowledgeHistory('도시정비', 'added', '테스트 추가');
      const history = getKnowledgeHistory('도시정비');
      expect(Array.isArray(history)).toBe(true);
      const added = history.find(h => h.details === '테스트 추가');
      if (added) {
        expect(added.action).toBe('added');
        expect(added.domain).toBe('도시정비');
      }
    });

    it('getKnowledgeHistory()는 전체 히스토리 배열을 반환해야 함', () => {
      const history = getKnowledgeHistory();
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('setExpertModeConfig and getExpertModeConfig', () => {
    it('setExpertModeConfig로 설정 후 getExpertModeConfig로 조회할 수 있어야 함', () => {
      const config = {
        domain: '도시정비',
        enabled: true,
        depth: 'expert' as const,
        includeCaseStudies: true,
        includeCalculations: true,
        includeLatestPolicies: true,
      };
      setExpertModeConfig(config);
      const retrieved = getExpertModeConfig('도시정비');
      expect(retrieved).not.toBeNull();
      expect(retrieved?.domain).toBe('도시정비');
      expect(retrieved?.enabled).toBe(true);
      expect(retrieved?.depth).toBe('expert');
    });

    it('존재하지 않는 도메인은 null을 반환해야 함', () => {
      expect(getExpertModeConfig('nonexistent-xyz')).toBeNull();
    });
  });

  describe('buildExpertContext', () => {
    it('전문가 설정이 있으면 컨텍스트 문자열을 반환해야 함', () => {
      setExpertModeConfig({
        domain: '도시정비',
        enabled: true,
        depth: 'expert',
        includeCaseStudies: true,
        includeCalculations: true,
        includeLatestPolicies: true,
      });
      const context = buildExpertContext('재건축 조합 설립', ['도시정비'], [
        {
          domain: '도시정비',
          enabled: true,
          depth: 'expert',
          includeCaseStudies: true,
          includeCalculations: true,
          includeLatestPolicies: true,
        },
      ]);
      expect(typeof context).toBe('string');
      expect(context.length).toBeGreaterThan(0);
      expect(context).toContain('도메인 전문 지식');
    });

    it('enabled false인 설정은 컨텍스트에 전문가 모드 정보를 덜 포함할 수 있음', () => {
      const context = buildExpertContext('질문', ['도시정비'], [
        {
          domain: '도시정비',
          enabled: false,
          depth: 'basic',
          includeCaseStudies: false,
          includeCalculations: false,
          includeLatestPolicies: false,
        },
      ]);
      expect(typeof context).toBe('string');
    });
  });

  describe('detectRelevantDomains', () => {
    it('프롬프트에 법령/개념 키워드가 있으면 해당 도메인을 추천해야 함', () => {
      const recommendations = detectRelevantDomains('도시정비법 재건축 조합 설립');
      expect(Array.isArray(recommendations)).toBe(true);
      const hasCity = recommendations.some(r => r.domain === '도시정비');
      expect(hasCity).toBe(true);
      if (recommendations.length > 0) {
        expect(recommendations[0]).toHaveProperty('domain');
        expect(recommendations[0]).toHaveProperty('confidence');
        expect(recommendations[0]).toHaveProperty('reason');
        expect(recommendations[0]).toHaveProperty('relevantConcepts');
      }
    });

    it('관련 키워드가 없으면 빈 배열 또는 낮은 신뢰도만 반환할 수 있음', () => {
      const recommendations = detectRelevantDomains('날씨가 좋네요');
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  describe('buildIntelligentContext', () => {
    it('선택 도메인과 프롬프트 기반으로 컨텍스트 문자열을 반환해야 함', () => {
      const context = buildIntelligentContext('재건축 단지', ['도시정비'], true);
      expect(typeof context).toBe('string');
      expect(context).toContain('도메인 전문 지식');
    });

    it('includeRelated false여도 컨텍스트를 반환해야 함', () => {
      const context = buildIntelligentContext('질문', ['세무'], false);
      expect(typeof context).toBe('string');
    });
  });

  describe('buildResponseFormatInstructions', () => {
    it('요약 키워드가 있으면 요약 형식 지시를 반환해야 함', () => {
      const result = buildResponseFormatInstructions('재개발 절차를 요약해주세요');
      expect(result).toContain('요약');
      expect(result).toContain('간결히');
    });

    it('계약서 키워드가 있으면 계약서 형식 지시를 반환해야 함', () => {
      const result = buildResponseFormatInstructions('매매계약서 초안 작성해줘');
      expect(result).toContain('계약서');
    });

    it('댓글용·댓글 형식 키워드가 있으면 댓글 형식 지시를 반환해야 함', () => {
      const result = buildResponseFormatInstructions('이걸 댓글용으로 써줘');
      expect(result).toContain('댓글');
      expect(result).toContain('간결');
    });

    it('댓글 형식 지시에 길이·톤 디테일(50~150자 등)이 포함되어야 함', () => {
      const result = buildResponseFormatInstructions('댓글 달아줘');
      expect(result).toContain('댓글');
      expect(result).toMatch(/50|150|50~150/);
    });

    it('댓글 형식 지시에 여러 사람이 쓴 느낌(다양한 작성자) 지시가 포함되어야 함', () => {
      const result = buildResponseFormatInstructions('댓글용으로 써줘');
      expect(result).toContain('댓글');
      expect(result).toMatch(/여러 사람|다른 작성자|서로 다른/);
    });

    it('댓글 학습·댓글 생성 능력 키워드 시 프로젝트 소스(댓글) 참고 지시가 포함되어야 함', () => {
      const result = buildResponseFormatInstructions('올린 댓글 학습해서 댓글 생성 능력 키워줘');
      expect(result).toContain('댓글');
      expect(result).toMatch(/프로젝트|올린|학습|스타일|톤|말투/);
    });

    it('기사로·기사 작성 키워드가 있으면 기사 형식 지시를 반환해야 함', () => {
      const result = buildResponseFormatInstructions('올린 글을 기사로 만들어줘');
      expect(result).toContain('기사');
      expect(result).toContain('제목');
      expect(result).toContain('5W1H');
    });

    it('기사 형식 지시에 제목·리드 디테일(15~25자·50~80자)이 포함되어야 함', () => {
      const result = buildResponseFormatInstructions('기사로 변환해줘');
      expect(result).toContain('기사');
      expect(result).toMatch(/15|25|15~25|50~80/);
    });

    it('해당 키워드가 없으면 빈 문자열을 반환해야 함', () => {
      const result = buildResponseFormatInstructions('날씨가 어때요');
      expect(result).toBe('');
    });

    it('근거·인용 키워드가 있으면 인용 형식 지시를 반환해야 함', () => {
      const result = buildResponseFormatInstructions('재개발 시 세무 근거를 들어서 설명해줘');
      expect(result).toContain('근거');
      expect(result).toContain('인용');
    });

    it('전문가 관점과 형식을 함께 반환할 수 있음', () => {
      const result = buildResponseFormatInstructions('변호사 관점에서 계약서 검토 요약해줘');
      expect(result.length).toBeGreaterThan(0);
    });

    it('정책 모니터링·시기별 정책 키워드 시 시기별 정책 지시를 반환해야 함', () => {
      const result = buildResponseFormatInstructions('최근 시기별 부동산정책 7.10 대책 확인해줘');
      expect(result).toContain('시기별');
      expect(result).toContain('비주기');
    });
  });
});

