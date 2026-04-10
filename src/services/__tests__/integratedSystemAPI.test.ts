/* eslint-disable jest/no-conditional-expect */

import axios from 'axios';
import {
  API_BASE_URL,
  API_HEALTH_PATH,
  API_PROJECTS_LIST_PATH,
  COMPREHENSIVE_ANALYSIS_PATH,
  DATA_ANALYTICS_SOURCES_PATH,
  EMOTION_RECOGNITION_ANALYZE_PATH,
  FALLBACK_API_ORIGIN,
  FILES_COLLECTION_PATH,
  getChatPostUrlsForConfigBase,
  INTEGRATED_FILE_UPLOAD_PATH,
  PERFORMANCE_OPTIMIZATION_HEALTH_PATH,
  PERFORMANCE_OPTIMIZATION_METRICS_PATH,
  QUALITY_ASSURANCE_AUTOMATED_EXECUTION_PATH,
  QUALITY_ASSURANCE_TEST_SUITES_PATH,
  QUALITY_ASSURANCE_TESTS_PATH,
  REAL_TIME_METRICS_PATH,
  resolveAxiosHttpOriginBaseUrl,
  SYSTEM_CONFIG_PATH,
} from '../../config/api';
import {
  AGENTS_QUERY_PARAM_ID,
  AGENTS_QUERY_PARAM_TYPE,
  GENSPARK_AGENTS_TYPE_SUPER_AGENT,
} from '../../config/routes';
import { GENSPARK_REFERENCE_AGENT_ID } from '../gensparkReferenceAgentPreset';
import type { Message } from '../../types';
import {
  buildModernChatPipelineContext,
  scenarioInheritMergeOptionsFromPipelineLikeMessages,
} from '../modernChatContextBuilder';
import multiLayerStyleAnalysisSystem, {
  CHAT_MULTILAYER_STYLE_HINT_MAX_INPUT_CHARS,
} from '../multiLayerStyleAnalysisSystem';
import integratedSystemAPI, { IntegratedSystemAPI } from '../integratedSystemAPI';

/** `IntegratedSystemAPI`의 `this.baseURL`과 동일 기준 — `API_BASE_URL`만 쓰면 빈 문자열일 때 폴백 오리진과 어긋날 수 있음 */
const INTEGRATED_CHAT_URLS = getChatPostUrlsForConfigBase(
  resolveAxiosHttpOriginBaseUrl((API_BASE_URL || FALLBACK_API_ORIGIN).trim())
);

const CHAT_POST_MOCK_AXIOS_CONFIG = expect.objectContaining({
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// axios 모킹: `create`/`get`만 대체하고 `isAxiosError` 등은 실제 구현 유지(apiClient·postChatAxiosWithFallback 폴백)
jest.mock('axios', () => {
  const actual = jest.requireActual<typeof import('axios')>('axios');
  return {
    __esModule: true,
    default: {
      ...actual.default,
      create: jest.fn(() => ({
        post: jest.fn(),
        get: jest.fn(),
        put: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      })),
      get: jest.fn(),
    },
  };
});

const mockedAxios = jest.mocked(axios);
const mockedAxiosCreate: jest.MockedFunction<typeof axios.create> = jest.mocked(axios.create);
const mockedAxiosGet = mockedAxios.get as jest.MockedFunction<typeof axios.get>;

describe('IntegratedSystemAPI', () => {
  let api: IntegratedSystemAPI;
  let mockApiInstance: { get: jest.Mock; post: jest.Mock; put: jest.Mock; delete: jest.Mock; interceptors: { request: { use: jest.Mock }; response: { use: jest.Mock } } };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // axios.create 모킹
    mockApiInstance = {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    };

    mockedAxiosCreate.mockReturnValue(mockApiInstance as never);
    api = new IntegratedSystemAPI();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(integratedSystemAPI).toBeDefined();
      expect(integratedSystemAPI).toBeInstanceOf(IntegratedSystemAPI);
    });

    it('새 인스턴스 생성', () => {
      expect(api).toBeInstanceOf(IntegratedSystemAPI);
    });

    it('인터셉터가 설정되어야 함', () => {
      expect(mockApiInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockApiInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('checkSystemHealth', () => {
    it('모든 서비스가 정상일 때 healthy 상태를 반환해야 함', async () => {
      mockedAxiosGet.mockResolvedValue({ status: 200 } as never);

      const result = await api.checkSystemHealth();

      expect(result.status).toBe('healthy');
      expect(result.services).toBeDefined();
      expect(result.version).toBe('1.0.0');
      expect(result.uptime).toBeGreaterThan(0);
    });

    it('일부 서비스가 실패하면 degraded 상태를 반환해야 함', async () => {
      mockedAxiosGet
        .mockResolvedValueOnce({ status: 200 } as never)
        .mockRejectedValueOnce(new Error('Service down'))
        .mockResolvedValueOnce({ status: 200 } as never)
        .mockResolvedValueOnce({ status: 200 } as never);

      const result = await api.checkSystemHealth();

      expect(result.status).toBe('degraded');
      expect(Object.values(result.services).some(s => s.status === 'down')).toBe(true);
    });

    it('서비스 상태 정보를 포함해야 함', async () => {
      mockedAxiosGet.mockResolvedValue({ status: 200 } as never);

      const result = await api.checkSystemHealth();

      expect(result.services.main).toBeDefined();
      expect(result.services.ai).toBeDefined();
      expect(result.services.unified).toBeDefined();
      expect(result.services.ultimate).toBeDefined();
    });
  });

  describe('sendMessage', () => {
    it('메시지를 성공적으로 전송해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { message: '응답' },
        },
      };

      mockApiInstance.post.mockResolvedValue(mockResponse);

      const result = await api.sendMessage('테스트 메시지');

      expect(mockApiInstance.post).toHaveBeenCalledWith(
        INTEGRATED_CHAT_URLS[0],
        expect.objectContaining({
          message: '테스트 메시지',
          quality: 'enhanced',
        }),
        CHAT_POST_MOCK_AXIOS_CONFIG
      );
      const posted = mockApiInstance.post.mock.calls[0][1] as Record<string, unknown>;
      expect(posted.context).toMatchObject({ original_user_message: '테스트 메시지' });
      expect(result.success).toBe(true);
    });

    it('컨텍스트를 포함하여 메시지를 전송해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { message: '응답' },
        },
      };

      mockApiInstance.post.mockResolvedValue(mockResponse);

      const context = { project_id: 'test' };
      await api.sendMessage('테스트 메시지', context);

      expect(mockApiInstance.post).toHaveBeenCalledWith(
        INTEGRATED_CHAT_URLS[0],
        expect.objectContaining({
          message: '테스트 메시지',
          quality: 'enhanced',
        }),
        CHAT_POST_MOCK_AXIOS_CONFIG
      );
      const posted = mockApiInstance.post.mock.calls[0][1] as Record<string, unknown>;
      expect(posted.context).toMatchObject({
        project_id: 'test',
        original_user_message: '테스트 메시지',
      });
    });

    it('REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT=1이면 URL에 id가 있어도 빈 context에 genspark_*를 넣지 않는다', async () => {
      const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
      mockApiInstance.post.mockResolvedValue({
        data: { success: true, data: { message: 'ok' } },
      });
      try {
        window.history.replaceState(
          {},
          '',
          `/?${AGENTS_QUERY_PARAM_ID}=7c36051a-2b94-4e9e-bd36-05dfabfe3e07`,
        );
        await api.sendMessage('안녕', {});
        const posted = mockApiInstance.post.mock.calls[0][1] as Record<string, unknown>;
        const ctx = posted.context as Record<string, unknown> | undefined;
        expect(ctx?.genspark_route_agent_id).toBeUndefined();
        expect(ctx?.genspark_reference_agent_id).toBeUndefined();
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
      }
    });

    it('URL type=super_agent만 있으면 sendMessage context에 참조 Super Agent id가 실린다', async () => {
      const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      if (prevDisable !== undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      mockApiInstance.post.mockResolvedValue({
        data: { success: true, data: { message: 'ok' } },
      });
      try {
        window.history.replaceState(
          {},
          '',
          `/?${AGENTS_QUERY_PARAM_TYPE}=${encodeURIComponent(GENSPARK_AGENTS_TYPE_SUPER_AGENT)}`,
        );
        await api.sendMessage('안녕', {});
        const posted = mockApiInstance.post.mock.calls[0][1] as Record<string, unknown>;
        const ctx = posted.context as Record<string, unknown> | undefined;
        expect(ctx?.genspark_reference_agent_id).toBe(GENSPARK_REFERENCE_AGENT_ID);
        expect(ctx?.genspark_route_agent_id).toBe(GENSPARK_REFERENCE_AGENT_ID);
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
      }
    });

    it('GENSPARK_DISABLE이면 type=super_agent만 있어도 sendMessage context에 genspark_*를 넣지 않는다', async () => {
      const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
      mockApiInstance.post.mockResolvedValue({
        data: { success: true, data: { message: 'ok' } },
      });
      try {
        window.history.replaceState(
          {},
          '',
          `/?${AGENTS_QUERY_PARAM_TYPE}=${encodeURIComponent(GENSPARK_AGENTS_TYPE_SUPER_AGENT)}`,
        );
        await api.sendMessage('안녕', {});
        const posted = mockApiInstance.post.mock.calls[0][1] as Record<string, unknown>;
        const ctx = posted.context as Record<string, unknown> | undefined;
        expect(ctx?.genspark_route_agent_id).toBeUndefined();
        expect(ctx?.genspark_reference_agent_id).toBeUndefined();
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
      }
    });

    it('ModernChat 파이프라인 context로 sendMessage 시 GENSPARK_DISABLE이면 URL id가 context에 끼지 않는다', async () => {
      delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
      const windowUuid = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';
      const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
      mockApiInstance.post.mockResolvedValue({
        data: { success: true, data: { message: 'ok' } },
      });
      try {
        window.history.replaceState({}, '', `/?${AGENTS_QUERY_PARAM_ID}=${windowUuid}`);
        const recent: Message[] = [
          { id: 1, sender: 'user', text: '이전', timestamp: 't', analysis: null },
        ];
        const unifiedCtx = buildModernChatPipelineContext('질문: a\n요구사항: b', recent);
        expect(unifiedCtx).toBeDefined();
        const mergeOpts = scenarioInheritMergeOptionsFromPipelineLikeMessages(recent);
        await api.sendMessage('질문: a\n요구사항: b', unifiedCtx as Record<string, unknown>, {
          ...(mergeOpts != null ? { mergeApiChatContextOptions: mergeOpts } : {}),
        });
        const posted = mockApiInstance.post.mock.calls[0][1] as Record<string, unknown>;
        const ctx = posted.context as Record<string, unknown> | undefined;
        expect(ctx?.genspark_route_agent_id).not.toBe(windowUuid);
        expect(ctx?.genspark_reference_agent_id).not.toBe(windowUuid);
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
      }
    });

    it('ModernChat 파이프라인 옵션(gensparkRouteAgentId)으로 sendMessage 시 context에 해당 에이전트 id가 실린다', async () => {
      delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
      const routeId = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';
      mockApiInstance.post.mockResolvedValue({
        data: { success: true, data: { message: 'ok' } },
      });
      const unifiedCtx = buildModernChatPipelineContext('질문: a\n요구사항: b', [], {
        gensparkRouteAgentId: routeId,
      });
      expect(unifiedCtx).toBeDefined();
      await api.sendMessage('질문: a\n요구사항: b', unifiedCtx as Record<string, unknown>);
      const posted = mockApiInstance.post.mock.calls[0][1] as Record<string, unknown>;
      const ctx = posted.context as Record<string, unknown> | undefined;
      expect(ctx?.genspark_reference_agent_id).toBe(routeId);
      expect(String(ctx?.genspark_external_agent_profile ?? '')).toContain(routeId);
    });

    it('멀티레이어 힌트 env 활성화 시 초장문은 surface 분석 입력이 상한으로 잘린다', async () => {
      const prev = process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT;
      process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT = 'true';
      const spy = jest
        .spyOn(multiLayerStyleAnalysisSystem, 'performMultiLayerAnalysis')
        .mockRejectedValue(new Error('short-circuit'));
      mockApiInstance.post.mockResolvedValue({
        data: { success: true, data: { message: 'ok' } },
      });
      try {
        const longMsg = 'i'.repeat(CHAT_MULTILAYER_STYLE_HINT_MAX_INPUT_CHARS + 50);
        await api.sendMessage(longMsg);
        expect(spy).toHaveBeenCalledWith(
          'i'.repeat(CHAT_MULTILAYER_STYLE_HINT_MAX_INPUT_CHARS),
          'surface'
        );
      } finally {
        spy.mockRestore();
        if (prev === undefined) delete process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT;
        else process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT = prev;
      }
    });

    it('conversationHistory의 pipelineExtras만으로(merge 옵션 없이) 상속 env 시 client_generation_scenario를 넣는다', async () => {
      const prev = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
      mockApiInstance.post.mockResolvedValueOnce({
        data: { success: true, data: { message: 'ok' } },
      });
      try {
        await api.sendMessage('질문: A\n요구사항: B', undefined, {
          conversationHistory: [
            {
              role: 'assistant',
              content: '이전',
              pipelineExtras: { generationScenarioMarkdown: '## intSysHist\n시나리오' },
            },
          ],
        });
        const posted = mockApiInstance.post.mock.calls[0][1] as Record<string, unknown>;
        const ctx = posted.context as Record<string, unknown>;
        expect(String(ctx?.client_generation_scenario)).toContain('intSysHist');
      } finally {
        if (prev === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
        else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prev;
      }
    });

    it('mergeApiChatContextOptions+상속 env 시 client_generation_scenario를 넣는다', async () => {
      const prev = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
      mockApiInstance.post.mockResolvedValue({
        data: { success: true, data: { message: 'ok' } },
      });
      try {
        await api.sendMessage('질문: A\n요구사항: B', undefined, {
          mergeApiChatContextOptions: {
            recentMessagesForScenarioInherit: [
              {
                role: 'assistant',
                pipelineExtras: { generationScenarioMarkdown: '## integratedSystem\n시나리오' },
              },
            ],
          },
        });
        const posted = mockApiInstance.post.mock.calls[0][1] as Record<string, unknown>;
        const ctx = posted.context as Record<string, unknown>;
        expect(String(ctx?.client_generation_scenario)).toContain('integratedSystem');
      } finally {
        if (prev === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
        else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prev;
      }
    });

    it('첫 /api/chat이 404면 /api/unified/chat으로 재시도한다', async () => {
      const err404 = Object.assign(new Error('Not Found'), { response: { status: 404 } });
      mockApiInstance.post
        .mockRejectedValueOnce(err404)
        .mockResolvedValueOnce({
          data: { success: true, data: { message: 'unified ok' } },
        });

      const result = await api.sendMessage('테스트 메시지');

      expect(mockApiInstance.post).toHaveBeenCalledTimes(2);
      expect(mockApiInstance.post.mock.calls[0][0]).toBe(INTEGRATED_CHAT_URLS[0]);
      expect(mockApiInstance.post.mock.calls[1][0]).toBe(INTEGRATED_CHAT_URLS[1]);
      expect(result.success).toBe(true);
    });

    it('전송 실패 시 에러를 반환해야 함', async () => {
      mockApiInstance.post.mockRejectedValue(new Error('Network error'));

      const result = await api.sendMessage('테스트 메시지');

      expect(result.success).toBe(false);
      expect(result.error).toBe('메시지 전송에 실패했습니다.');
    });
  });

  describe('analyzeEmotion', () => {
    it('감정 분석을 성공적으로 수행해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { emotion: 'happy' },
        },
      };

      mockApiInstance.post.mockResolvedValue(mockResponse);

      const result = await api.analyzeEmotion('기쁜 내용');

      expect(mockApiInstance.post).toHaveBeenCalledWith(EMOTION_RECOGNITION_ANALYZE_PATH, {
        content: '기쁜 내용',
        type: 'text',
      });
      expect(result.success).toBe(true);
    });

    it('타입을 지정하여 감정 분석을 수행해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { emotion: 'sad' },
        },
      };

      mockApiInstance.post.mockResolvedValue(mockResponse);

      await api.analyzeEmotion('슬픈 내용', 'audio');

      expect(mockApiInstance.post).toHaveBeenCalledWith(EMOTION_RECOGNITION_ANALYZE_PATH, {
        content: '슬픈 내용',
        type: 'audio',
      });
    });

    it('분석 실패 시 에러를 반환해야 함', async () => {
      mockApiInstance.post.mockRejectedValue(new Error('Analysis error'));

      const result = await api.analyzeEmotion('내용');

      expect(result.success).toBe(false);
      expect(result.error).toBe('감정 분석에 실패했습니다.');
    });
  });

  describe('데이터 소스 관리', () => {
    it('데이터 소스 목록을 조회해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [{ id: '1', name: 'Source 1' }],
        },
      };

      mockApiInstance.get.mockResolvedValue(mockResponse);

      const result = await api.getDataSources();

      expect(mockApiInstance.get).toHaveBeenCalledWith(DATA_ANALYTICS_SOURCES_PATH);
      expect(result.success).toBe(true);
    });

    it('데이터 소스를 생성해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { id: '1', name: 'New Source' },
        },
      };

      mockApiInstance.post.mockResolvedValue(mockResponse);

      const sourceData = { name: 'New Source', type: 'database' };
      const result = await api.createDataSource(sourceData);

      expect(mockApiInstance.post).toHaveBeenCalledWith(DATA_ANALYTICS_SOURCES_PATH, sourceData);
      expect(result.success).toBe(true);
    });

    it('데이터 소스 조회 실패 시 에러를 반환해야 함', async () => {
      mockApiInstance.get.mockRejectedValue(new Error('Fetch error'));

      const result = await api.getDataSources();

      expect(result.success).toBe(false);
      expect(result.error).toBe('데이터 소스 조회에 실패했습니다.');
    });
  });

  describe('품질 보증', () => {
    it('품질 테스트 목록을 조회해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [{ id: '1', name: 'Test 1' }],
        },
      };

      mockApiInstance.get.mockResolvedValue(mockResponse);

      const result = await api.getQualityTests();

      expect(mockApiInstance.get).toHaveBeenCalledWith(QUALITY_ASSURANCE_TESTS_PATH);
      expect(result.success).toBe(true);
    });

    it('테스트 스위트 목록을 조회해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [{ id: '1', name: 'Suite 1' }],
        },
      };

      mockApiInstance.get.mockResolvedValue(mockResponse);

      const result = await api.getQualityTestSuites();

      expect(mockApiInstance.get).toHaveBeenCalledWith(QUALITY_ASSURANCE_TEST_SUITES_PATH);
      expect(result.success).toBe(true);
    });

    it('품질 테스트를 시작해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { test_id: '123' },
        },
      };

      mockApiInstance.post.mockResolvedValue(mockResponse);

      const result = await api.startQualityTest('suite-1');

      expect(mockApiInstance.post).toHaveBeenCalledWith(QUALITY_ASSURANCE_AUTOMATED_EXECUTION_PATH, {
        test_suite_id: 'suite-1',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('성능 최적화', () => {
    it('성능 메트릭을 조회해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { cpu: 50, memory: 60 },
        },
      };

      mockApiInstance.get.mockResolvedValue(mockResponse);

      const result = await api.getPerformanceMetrics();

      expect(mockApiInstance.get).toHaveBeenCalledWith(PERFORMANCE_OPTIMIZATION_METRICS_PATH);
      expect(result.success).toBe(true);
    });

    it('시스템 상태를 조회해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { status: 'healthy' },
        },
      };

      mockApiInstance.get.mockResolvedValue(mockResponse);

      const result = await api.getSystemHealth();

      expect(mockApiInstance.get).toHaveBeenCalledWith(PERFORMANCE_OPTIMIZATION_HEALTH_PATH);
      expect(result.success).toBe(true);
    });
  });

  describe('종합 분석', () => {
    it('종합 분석을 수행해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { analysis: 'result' },
        },
      };

      mockApiInstance.post.mockResolvedValue(mockResponse);

      const data = { content: '분석할 데이터' };
      const result = await api.performComprehensiveAnalysis(data);

      expect(mockApiInstance.post).toHaveBeenCalledWith(COMPREHENSIVE_ANALYSIS_PATH, data);
      expect(result.success).toBe(true);
    });

    it('분석 실패 시 에러를 반환해야 함', async () => {
      mockApiInstance.post.mockRejectedValue(new Error('Analysis error'));

      const result = await api.performComprehensiveAnalysis({});

      expect(result.success).toBe(false);
      expect(result.error).toBe('종합 분석에 실패했습니다.');
    });
  });

  describe('파일 처리', () => {
    it('파일을 업로드해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { file_id: '123' },
        },
      };

      mockApiInstance.post.mockResolvedValue(mockResponse);

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const result = await api.uploadFile(file);

      expect(mockApiInstance.post).toHaveBeenCalledWith(
        INTEGRATED_FILE_UPLOAD_PATH,
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      expect(result.success).toBe(true);
    });

    it('프로젝트 ID를 포함하여 파일을 업로드해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { file_id: '123' },
        },
      };

      mockApiInstance.post.mockResolvedValue(mockResponse);

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      await api.uploadFile(file, 'project-1');

      expect(mockApiInstance.post).toHaveBeenCalled();
    });

    it('파일 목록을 조회해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [{ id: '1', name: 'file1.txt' }],
        },
      };

      mockApiInstance.get.mockResolvedValue(mockResponse);

      const result = await api.getFileList();

      expect(mockApiInstance.get).toHaveBeenCalledWith(FILES_COLLECTION_PATH);
      expect(result.success).toBe(true);
    });
  });

  describe('프로젝트 관리', () => {
    it('프로젝트 목록을 조회해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [{ id: '1', name: 'Project 1' }],
        },
      };

      mockApiInstance.get.mockResolvedValue(mockResponse);

      const result = await api.getProjects();

      expect(mockApiInstance.get).toHaveBeenCalledWith(API_PROJECTS_LIST_PATH);
      expect(result.success).toBe(true);
    });

    it('프로젝트를 생성해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { id: '1', name: 'New Project' },
        },
      };

      mockApiInstance.post.mockResolvedValue(mockResponse);

      const projectData = { name: 'New Project', description: 'Description' };
      const result = await api.createProject(projectData);

      expect(mockApiInstance.post).toHaveBeenCalledWith(API_PROJECTS_LIST_PATH, projectData);
      expect(result.success).toBe(true);
    });
  });

  describe('실시간 모니터링', () => {
    it('실시간 메트릭을 조회해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { metrics: {} },
        },
      };

      mockApiInstance.get.mockResolvedValue(mockResponse);

      const result = await api.getRealTimeMetrics();

      expect(mockApiInstance.get).toHaveBeenCalledWith(REAL_TIME_METRICS_PATH);
      expect(result.success).toBe(true);
    });
  });

  describe('시스템 설정', () => {
    it('시스템 설정을 조회해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { config: {} },
        },
      };

      mockApiInstance.get.mockResolvedValue(mockResponse);

      const result = await api.getSystemConfig();

      expect(mockApiInstance.get).toHaveBeenCalledWith(SYSTEM_CONFIG_PATH);
      expect(result.success).toBe(true);
    });

    it('시스템 설정을 업데이트해야 함', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { config: {} },
        },
      };

      mockApiInstance.put.mockResolvedValue(mockResponse);

      const config = { setting: 'value' };
      const result = await api.updateSystemConfig(config);

      expect(mockApiInstance.put).toHaveBeenCalledWith(SYSTEM_CONFIG_PATH, config);
      expect(result.success).toBe(true);
    });
  });

  describe('유틸리티 메서드', () => {
    it('서비스 상태를 조회해야 함', () => {
      const status = api.getServiceStatus('main');

      expect(status).toBeDefined();
      expect(status.status).toBeDefined();
      expect(status.lastCheck).toBeDefined();
    });

    it('존재하지 않는 서비스 상태 조회 시 unknown을 반환해야 함', () => {
      const status = api.getServiceStatus('nonexistent');

      expect(status.status).toBe('unknown');
      expect(status.lastCheck).toBe(0);
    });

    it('모든 서비스 상태를 조회해야 함', () => {
      const services = api.getAllServices();

      expect(services).toBeDefined();
      expect(services.main).toBeDefined();
      expect(services.ai).toBeDefined();
      expect(services.unified).toBeDefined();
      expect(services.ultimate).toBeDefined();
    });
  });

  describe('testConnection', () => {
    it('연결 테스트가 성공하면 true를 반환해야 함', async () => {
      mockApiInstance.get.mockResolvedValue({ status: 200 });

      const result = await api.testConnection();

      expect(mockApiInstance.get).toHaveBeenCalledWith(API_HEALTH_PATH);
      expect(result).toBe(true);
    });

    it('연결 테스트가 실패하면 false를 반환해야 함', async () => {
      mockApiInstance.get.mockRejectedValue(new Error('Connection failed'));

      const result = await api.testConnection();

      expect(result).toBe(false);
    });
  });
});

