/**
 * IntegratedMessageService 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import axios from 'axios';
import * as apiClient from '../../utils/apiClient';
import {
  API_BASE_URL,
  API_HEALTH_PATH,
  CHAT_POST_PATH,
  FALLBACK_API_ORIGIN,
  FILE_UPLOAD_PATH,
  FILES_COLLECTION_PATH,
  GUIDANCE_GENERATE_PATH,
  INTEGRATED_POST_PATH_ANALYZE,
  INTEGRATED_POST_PATH_PROJECT,
  LEARNING_FEEDBACK_PATH,
  SYSTEMS_STATUS_PATH,
  getChatPostUrlsForConfigBase,
  joinApiHealthCheckUrl,
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
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';
import {
  IntegratedMessageService,
  integratedMessageService,
} from '../integratedMessageService';

const integratedMessageChatPostUrls = () =>
  getChatPostUrlsForConfigBase(API_BASE_URL || FALLBACK_API_ORIGIN);

/** 대화 POST는 `postChatAxiosWithFallback` → 전역 `axios.post` */
function mockIntegratedChatAxiosOnce(data: Record<string, unknown>) {
  return jest.spyOn(axios, 'post').mockResolvedValueOnce({ data } as Awaited<ReturnType<typeof axios.post>>);
}

// fetch 모킹
installJestFetchMock();
global.console.error = jest.fn();
global.console.log = jest.fn();

// AbortSignal.timeout 모킹
global.AbortSignal = {
  timeout: jest.fn((ms: number) => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    return controller.signal;
  }),
} as unknown as typeof globalThis.AbortSignal;

// FormData 모킹
class MockFormData {
  private data: Map<string, unknown> = new Map();
  
  append(key: string, value: unknown) {
    this.data.set(key, value);
  }
  
  get(key: string) {
    return this.data.get(key);
  }
  
  has(key: string) {
    return this.data.has(key);
  }
  
  delete(key: string) {
    this.data.delete(key);
  }
  
  getAll(key: string) {
    return this.data.has(key) ? [this.data.get(key)] : [];
  }
  
  entries() {
    return this.data.entries();
  }
  
  keys() {
    return this.data.keys();
  }
  
  values() {
    return this.data.values();
  }
}

global.FormData = MockFormData as unknown as typeof FormData;

describe('IntegratedMessageService', () => {
  let service: IntegratedMessageService;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(1000000);
    service = new IntegratedMessageService();
    mockFetch = jest.mocked(global.fetch);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(IntegratedMessageService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(integratedMessageService).toBeDefined();
      expect(integratedMessageService).toBeInstanceOf(IntegratedMessageService);
    });

    it('시스템 초기화 확인', async () => {
      const systems = await service.getSystemStatus();
      expect(systems.length).toBeGreaterThan(0);
      systems.forEach(system => {
        expect(system).toHaveProperty('id');
        expect(system).toHaveProperty('name');
        expect(system).toHaveProperty('isActive');
      });
    });
  });

  describe('메시지 전송', () => {
    it('기본 메시지 전송', async () => {
      const mockResponse = {
        response: '응답 내용',
        type: 'text',
        confidence: 0.9,
      };

      mockIntegratedChatAxiosOnce(mockResponse);

      const userText = '테스트 메시지';
      const result = await service.sendMessage({
        content: userText,
      });

      expect(axios.post).toHaveBeenCalled();
      const chatCall = jest.mocked(axios.post).mock.calls.find((c) => String(c[0]).includes(CHAT_POST_PATH));
      expect(chatCall).toBeDefined();
      const posted = chatCall![1] as Record<string, unknown>;
      expect(posted.message).toBe(userText);
      expect(posted).toHaveProperty('quality');

      expect(result).toHaveProperty('id');
      expect(result.content).toBe('응답 내용');
      expect(result.type).toBe('text');
      expect(result.confidence).toBe(0.9);
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
    });

    it('REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT=1이면 URL에 id가 있어도 chatContext에 genspark_*를 넣지 않는다', async () => {
      const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
      mockIntegratedChatAxiosOnce({ response: 'ok', type: 'text', confidence: 0.9 });
      try {
        window.history.replaceState(
          {},
          '',
          `/?${AGENTS_QUERY_PARAM_ID}=7c36051a-2b94-4e9e-bd36-05dfabfe3e07`,
        );
        await service.sendMessage({ content: '안녕', chatContext: {} });
        const chatCall = jest.mocked(axios.post).mock.calls.find((c) => String(c[0]).includes(CHAT_POST_PATH));
        expect(chatCall).toBeDefined();
        const posted = chatCall![1] as Record<string, unknown>;
        const ctx = posted.context as Record<string, unknown> | undefined;
        expect(ctx?.genspark_route_agent_id).toBeUndefined();
        expect(ctx?.genspark_reference_agent_id).toBeUndefined();
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
      }
    });

    it('URL type=super_agent만 있으면 chatContext에 참조 Super Agent id가 실린다', async () => {
      const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      if (prevDisable !== undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      mockIntegratedChatAxiosOnce({ response: 'ok', type: 'text', confidence: 0.9 });
      try {
        window.history.replaceState(
          {},
          '',
          `/?${AGENTS_QUERY_PARAM_TYPE}=${encodeURIComponent(GENSPARK_AGENTS_TYPE_SUPER_AGENT)}`,
        );
        await service.sendMessage({ content: '안녕', chatContext: {} });
        const chatCall = jest.mocked(axios.post).mock.calls.find((c) => String(c[0]).includes(CHAT_POST_PATH));
        expect(chatCall).toBeDefined();
        const posted = chatCall![1] as Record<string, unknown>;
        const ctx = posted.context as Record<string, unknown> | undefined;
        expect(ctx?.genspark_reference_agent_id).toBe(GENSPARK_REFERENCE_AGENT_ID);
        expect(ctx?.genspark_route_agent_id).toBe(GENSPARK_REFERENCE_AGENT_ID);
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
      }
    });

    it('GENSPARK_DISABLE이면 type=super_agent만 있어도 chatContext에 genspark_*를 넣지 않는다', async () => {
      const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
      mockIntegratedChatAxiosOnce({ response: 'ok', type: 'text', confidence: 0.9 });
      try {
        window.history.replaceState(
          {},
          '',
          `/?${AGENTS_QUERY_PARAM_TYPE}=${encodeURIComponent(GENSPARK_AGENTS_TYPE_SUPER_AGENT)}`,
        );
        await service.sendMessage({ content: '안녕', chatContext: {} });
        const chatCall = jest.mocked(axios.post).mock.calls.find((c) => String(c[0]).includes(CHAT_POST_PATH));
        expect(chatCall).toBeDefined();
        const posted = chatCall![1] as Record<string, unknown>;
        const ctx = posted.context as Record<string, unknown> | undefined;
        expect(ctx?.genspark_route_agent_id).toBeUndefined();
        expect(ctx?.genspark_reference_agent_id).toBeUndefined();
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
      }
    });

    it('ModernChat 파이프라인 chatContext로 sendMessage 시 GENSPARK_DISABLE이면 URL id가 context에 끼지 않는다', async () => {
      delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
      const windowUuid = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';
      const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
      mockIntegratedChatAxiosOnce({ response: 'ok', type: 'text', confidence: 0.9 });
      try {
        window.history.replaceState({}, '', `/?${AGENTS_QUERY_PARAM_ID}=${windowUuid}`);
        const recent: Message[] = [
          { id: 1, sender: 'user', text: '이전', timestamp: 't', analysis: null },
        ];
        const unifiedCtx = buildModernChatPipelineContext('질문: a\n요구사항: b', recent);
        expect(unifiedCtx).toBeDefined();
        const mergeOpts = scenarioInheritMergeOptionsFromPipelineLikeMessages(recent);
        await service.sendMessage({
          content: '질문: a\n요구사항: b',
          chatContext: unifiedCtx as Record<string, unknown>,
          ...(mergeOpts != null ? { mergeApiChatContextOptions: mergeOpts } : {}),
        });
        const chatCall = jest.mocked(axios.post).mock.calls.find((c) => String(c[0]).includes(CHAT_POST_PATH));
        expect(chatCall).toBeDefined();
        const posted = chatCall![1] as Record<string, unknown>;
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
      mockIntegratedChatAxiosOnce({ response: 'ok', type: 'text', confidence: 0.9 });
      const unifiedCtx = buildModernChatPipelineContext('질문: a\n요구사항: b', [], {
        gensparkRouteAgentId: routeId,
      });
      expect(unifiedCtx).toBeDefined();
      await service.sendMessage({
        content: '질문: a\n요구사항: b',
        chatContext: unifiedCtx as Record<string, unknown>,
      });
      const chatCall = jest.mocked(axios.post).mock.calls.find((c) => String(c[0]).includes(CHAT_POST_PATH));
      expect(chatCall).toBeDefined();
      const posted = chatCall![1] as Record<string, unknown>;
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
      mockIntegratedChatAxiosOnce({ response: 'ok', type: 'text', confidence: 0.9 });
      try {
        const longMsg = 'm'.repeat(CHAT_MULTILAYER_STYLE_HINT_MAX_INPUT_CHARS + 40);
        await service.sendMessage({ content: longMsg });
        expect(spy).toHaveBeenCalledWith(
          'm'.repeat(CHAT_MULTILAYER_STYLE_HINT_MAX_INPUT_CHARS),
          'surface'
        );
      } finally {
        spy.mockRestore();
        if (prev === undefined) delete process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT;
        else process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT = prev;
      }
    });

    it('첫 /api/chat이 404면 /api/unified/chat으로 재시도한다', async () => {
      const mockResponse = { response: 'unified 응답', type: 'text', confidence: 0.9 };
      const err404 = new axios.AxiosError('Not Found');
      err404.response = {
        status: 404,
        data: {},
        statusText: 'Not Found',
        headers: {},
        config: {} as import('axios').InternalAxiosRequestConfig,
      };
      jest
        .spyOn(axios, 'post')
        .mockRejectedValueOnce(err404)
        .mockResolvedValueOnce({ data: mockResponse } as Awaited<ReturnType<typeof axios.post>>);

      const userText = '안녕';
      const result = await service.sendMessage({ content: userText });

      expect(jest.mocked(axios.post).mock.calls.length).toBe(2);
      const [firstChatUrl, secondChatUrl] = integratedMessageChatPostUrls();
      expect(jest.mocked(axios.post).mock.calls[0][0]).toBe(firstChatUrl);
      expect(jest.mocked(axios.post).mock.calls[1][0]).toBe(secondChatUrl);
      expect(result.content).toBe('unified 응답');
    });

    it('분석 시스템 타입 자동 감지', async () => {
      const mockResponse = {
        response: '분석 결과',
        type: 'analysis',
        confidence: 0.85,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.sendMessage({
        content: '데이터를 분석해줘',
      });

      expect(result.metadata?.usedSystems).toContain('analysis');
      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(FALLBACK_API_ORIGIN, `${INTEGRATED_POST_PATH_ANALYZE}`),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('가이드 시스템 타입 자동 감지', async () => {
      const mockResponse = {
        response: '가이드 내용',
        type: 'text',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.sendMessage({
        content: '메시지 가이드를 제공해줘',
      });

      expect(result.metadata?.usedSystems).toContain('guidance');
    });

    it('프로젝트 시스템 타입 자동 감지', async () => {
      const mockResponse = {
        response: '프로젝트 정보',
        type: 'text',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.sendMessage({
        content: '프로젝트 상태를 알려줘',
      });

      expect(result.metadata?.usedSystems).toContain('project');
    });

    it('파일 시스템 타입 자동 감지', async () => {
      const mockResponse = {
        response: '파일 정보',
        type: 'text',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.sendMessage({
        content: '파일을 업로드해줘',
      });

      expect(result.metadata?.usedSystems).toContain('file');
    });

    it('컨텍스트 포함 메시지 전송', async () => {
      const mockResponse = {
        response: '컨텍스트 기반 응답',
        type: 'text',
      };

      mockIntegratedChatAxiosOnce(mockResponse);

      const result = await service.sendMessage({
        content: '테스트',
        context: '프로젝트 컨텍스트',
        projectId: 'project-1',
      });

      expect(result.content).toBe('컨텍스트 기반 응답');
    });

    it('사용자 선호도 포함 메시지 전송', async () => {
      const mockResponse = {
        response: '맞춤 응답',
        type: 'text',
      };

      mockIntegratedChatAxiosOnce(mockResponse);

      const result = await service.sendMessage({
        content: '테스트',
        userPreferences: {
          tone: 'formal',
          style: 'analytical',
          length: 'medium',
        },
      });

      expect(result.content).toBe('맞춤 응답');
    });

    it('에러 시 폴백 응답 반환', async () => {
      jest.spyOn(apiClient, 'postChatAxiosWithFallback').mockRejectedValueOnce(new Error('Network error'));

      const result = await service.sendMessage({
        content: '테스트',
      });

      expect(result.content).toContain('죄송합니다');
      expect(result.confidence).toBe(0.5);
      expect(result.metadata?.usedSystems).toContain('fallback');
      expect(result.metadata?.suggestions).toBeDefined();
    });

    it('HTTP 에러 시 폴백 응답 반환', async () => {
      const err500 = new axios.AxiosError('Server Error');
      err500.response = {
        status: 500,
        data: {},
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as import('axios').InternalAxiosRequestConfig,
      };
      jest.spyOn(apiClient, 'postChatAxiosWithFallback').mockRejectedValueOnce(err500);

      const result = await service.sendMessage({
        content: '테스트',
      });

      expect(result.content).toContain('죄송합니다');
      expect(result.metadata?.usedSystems).toContain('fallback');
    });

    it('chatContext.conversation_history의 pipelineExtras로 상속 env 시 client_generation_scenario를 넣는다', async () => {
      const prevInherit = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
      mockIntegratedChatAxiosOnce({ response: 'ok', type: 'text' });
      try {
        await service.sendMessage({
          content: '질문: 다음\n요구사항: 이어서',
          chatContext: {
            conversation_history: [
              {
                role: 'assistant',
                content: '이전',
                pipelineExtras: { generationScenarioMarkdown: '## 통합메시지\n상속' },
              },
            ],
          },
        });
        const chatCall = jest.mocked(axios.post).mock.calls.find((c) => String(c[0]).includes(CHAT_POST_PATH));
        expect(chatCall).toBeDefined();
        const posted = chatCall![1] as Record<string, unknown>;
        expect(String((posted.context as Record<string, unknown>)?.client_generation_scenario)).toContain(
          '통합메시지'
        );
      } finally {
        if (prevInherit === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
        else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prevInherit;
      }
    });

    it('conversationHistory 턴의 pipelineExtras로 상속 env 시 client_generation_scenario를 넣는다', async () => {
      const prevInherit = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
      mockIntegratedChatAxiosOnce({ response: 'ok', type: 'text' });
      try {
        await service.sendMessage({
          content: '질문: 다음\n요구사항: 이어서',
          conversationHistory: [
            {
              role: 'assistant',
              content: '이전',
              pipelineExtras: { generationScenarioMarkdown: '## 통합히스토리\n상속' },
            },
          ],
        });
        const chatCall = jest.mocked(axios.post).mock.calls.find((c) => String(c[0]).includes(CHAT_POST_PATH));
        expect(chatCall).toBeDefined();
        const posted = chatCall![1] as Record<string, unknown>;
        expect(String((posted.context as Record<string, unknown>)?.client_generation_scenario)).toContain(
          '통합히스토리'
        );
      } finally {
        if (prevInherit === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
        else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prevInherit;
      }
    });
  });

  describe('시스템 상태 조회', () => {
    it('시스템 상태 조회 성공', async () => {
      const mockSystems = [
        {
          id: 'test-system',
          name: '테스트 시스템',
          isActive: true,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ systems: mockSystems }),
      });

      const result = await service.getSystemStatus();

      expect(result).toEqual(mockSystems);
      expect(mockFetch).toHaveBeenCalledWith(joinApiHealthCheckUrl(FALLBACK_API_ORIGIN, `${SYSTEMS_STATUS_PATH}`));
    });

    it('시스템 상태 조회 실패 시 기본 시스템 반환', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      const result = await service.getSystemStatus();

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
    });

    it('네트워크 에러 시 기본 시스템 반환', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.getSystemStatus();

      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('파일 업로드', () => {
    it('파일 업로드 성공', async () => {
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      const mockResponse = {
        fileId: 'file-123',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.uploadFile(mockFile);

      expect(result.success).toBe(true);
      expect(result.fileId).toBe('file-123');
      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(FALLBACK_API_ORIGIN, `${FILE_UPLOAD_PATH}`),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('파일 업로드 실패 처리', async () => {
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });

      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      const result = await service.uploadFile(mockFile);

      expect(result.success).toBe(false);
      expect(result.error).toBe('파일 업로드 실패');
    });

    it('네트워크 에러 처리', async () => {
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.uploadFile(mockFile);

      expect(result.success).toBe(false);
      expect(result.error).toBe('네트워크 오류');
    });
  });

  describe('프로젝트 정보 조회', () => {
    it('프로젝트 정보 조회 성공', async () => {
      const mockProject = {
        id: 'project-1',
        name: '테스트 프로젝트',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProject,
      });

      const result = await service.getProjectInfo('project-1');

      expect(result).toEqual(mockProject);
      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(
          FALLBACK_API_ORIGIN,
          `${INTEGRATED_POST_PATH_PROJECT}/${encodeURIComponent('project-1')}`,
        ),
      );
    });

    it('프로젝트 정보 조회 실패 시 null 반환', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      const result = await service.getProjectInfo('project-1');

      expect(result).toBeNull();
    });

    it('네트워크 에러 시 null 반환', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.getProjectInfo('project-1');

      expect(result).toBeNull();
    });
  });

  describe('파일 목록 조회', () => {
    it('파일 목록 조회 성공', async () => {
      const mockFiles = [
        { id: 'file-1', name: 'file1.txt' },
        { id: 'file-2', name: 'file2.txt' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ files: mockFiles }),
      });

      const result = await service.getFileList();

      expect(result).toEqual(mockFiles);
      expect(mockFetch).toHaveBeenCalledWith(joinApiHealthCheckUrl(FALLBACK_API_ORIGIN, `${FILES_COLLECTION_PATH}`));
    });

    it('파일 목록 조회 실패 시 빈 배열 반환', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      const result = await service.getFileList();

      expect(result).toEqual([]);
    });

    it('네트워크 에러 시 빈 배열 반환', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.getFileList();

      expect(result).toEqual([]);
    });
  });

  describe('가이드 생성', () => {
    it('가이드 생성 성공', async () => {
      const mockGuidance = {
        id: 'guide-1',
        content: '가이드 내용',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockGuidance,
      });

      const result = await service.generateGuidance('컨텍스트', {
        tone: 'formal',
      });

      expect(result).toEqual(mockGuidance);
      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(FALLBACK_API_ORIGIN, `${GUIDANCE_GENERATE_PATH}`),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            context: '컨텍스트',
            preferences: { tone: 'formal' },
          }),
        })
      );
    });

    it('가이드 생성 실패 시 null 반환', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      const result = await service.generateGuidance('컨텍스트', {});

      expect(result).toBeNull();
    });

    it('네트워크 에러 시 null 반환', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.generateGuidance('컨텍스트', {});

      expect(result).toBeNull();
    });
  });

  describe('연결 확인', () => {
    it('연결 성공', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      const result = await service.checkConnection();

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(FALLBACK_API_ORIGIN, API_HEALTH_PATH),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('연결 실패', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      const result = await service.checkConnection();

      expect(result).toBe(false);
    });

    it('네트워크 에러 시 false 반환', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.checkConnection();

      expect(result).toBe(false);
    });
  });

  describe('학습 데이터 업데이트', () => {
    it('학습 데이터 업데이트 성공', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      await service.updateLearningData('message-1', 'positive');

      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(FALLBACK_API_ORIGIN, `${LEARNING_FEEDBACK_PATH}`),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messageId: 'message-1',
            feedback: 'positive',
          }),
        })
      );
    });

    it('네트워크 에러 처리', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await service.updateLearningData('message-1', 'negative');

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('에지 케이스', () => {
    it('빈 메시지 전송', async () => {
      const mockResponse = {
        response: '응답',
        type: 'text',
      };

      mockIntegratedChatAxiosOnce(mockResponse);

      const result = await service.sendMessage({
        content: '',
      });

      expect(result.content).toBe('응답');
    });

    it('긴 메시지 전송', async () => {
      const longMessage = 'a'.repeat(10000);
      const mockResponse = {
        response: '응답',
        type: 'text',
      };

      mockIntegratedChatAxiosOnce(mockResponse);

      const result = await service.sendMessage({
        content: longMessage,
      });

      expect(result.content).toBe('응답');
    });
  });
});

