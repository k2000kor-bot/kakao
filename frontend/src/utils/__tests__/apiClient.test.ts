/**
 * apiClient 유틸리티 테스트
 * API 호출 기능 확인
 */

import axios from 'axios';
import { API_BASE_URL, getChatPostUrlsForConfigBase } from '../../config/api';
import {
  AGENTS_QUERY_PARAM_ID,
  AGENTS_QUERY_PARAM_TYPE,
  GENSPARK_AGENTS_TYPE_SUPER_AGENT,
} from '../../config/routes';
import { GENSPARK_REFERENCE_AGENT_ID } from '../../services/gensparkReferenceAgentPreset';
import multiLayerStyleAnalysisSystem, {
  CHAT_MULTILAYER_STYLE_HINT_MAX_INPUT_CHARS,
} from '../../services/multiLayerStyleAnalysisSystem';

const firstChatPostUrl = () => getChatPostUrlsForConfigBase(API_BASE_URL)[0];
const secondChatPostUrl = () => getChatPostUrlsForConfigBase(API_BASE_URL)[1];
import {
  DEFAULT_CHAT_POST_AXIOS_OPTIONS,
  DEFAULT_CHAT_POST_FALLBACK_OPTIONS,
  sendChatMessage,
  postChatJsonWithFallback,
  postChatAxiosWithFallback,
  isValidChatResponse,
} from '../apiClient';
import errorReportingService from '../../services/errorReportingService';
import { retryApiCall } from '../retryHandler';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';
import { DEFAULT_CHAT_PERSPECTIVE, DEFAULT_CHAT_RESPONSE_STYLE } from '../modernChatUrlStyle';
import {
  buildModernChatPipelineContext,
  scenarioInheritMergeOptionsFromPipelineLikeMessages,
} from '../../services/modernChatContextBuilder';
import type { Message } from '../../types';

jest.mock('../../services/errorReportingService', () => ({
  __esModule: true,
  default: {
    reportError: jest.fn(),
  },
}));

jest.mock('../retryHandler', () => ({
  retryApiCall: jest.fn(async (fn: () => Promise<unknown>) => {
    try {
      return await fn();
    } catch (error) {
      throw error;
    }
  }),
}));

jest.mock('../../services/localLLMService', () => ({
  localLLMService: {
    isAvailable: jest.fn(() => false),
  },
}));

installJestFetchMock();

describe('apiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(global.fetch).mockClear();
    jest.mocked(retryApiCall).mockImplementation(async (fn: () => Promise<unknown>) => {
      try {
        return await fn();
      } catch (error) {
        throw error;
      }
    });
  });

  describe('sendChatMessage', () => {
    it('대화 메시지를 성공적으로 전송해야 함', async () => {
      const mockResponse = {
        success: true,
        response: '응답 메시지',
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await sendChatMessage('테스트 메시지', 'session-123');

      expect(result.success).toBe(true);
      expect(result.response).toBe('응답 메시지');
      expect(global.fetch).toHaveBeenCalledWith(
        firstChatPostUrl(),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('테스트 메시지'),
        })
      );
      const body = JSON.parse(
        jest.mocked(global.fetch).mock.calls[0][1].body as string
      );
      expect(body.response_style).toBe(DEFAULT_CHAT_RESPONSE_STYLE);
      expect(body.perspective).toBe(DEFAULT_CHAT_PERSPECTIVE);
    });

    it('options.response_style·perspective가 있으면 본문에 반영한다', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, response: 'ok' }),
      });
      await sendChatMessage('hi', 's-opt', {
        response_style: 'creative',
        perspective: 'analytical',
      });
      const body = JSON.parse(jest.mocked(global.fetch).mock.calls[0][1].body as string);
      expect(body.response_style).toBe('creative');
      expect(body.perspective).toBe('analytical');
    });

    it('멀티레이어 힌트 env 활성화 시 초장문은 분석 입력이 상한으로 잘린다', async () => {
      const prev = process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT;
      process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT = 'true';
      const spy = jest
        .spyOn(multiLayerStyleAnalysisSystem, 'performMultiLayerAnalysis')
        .mockRejectedValue(new Error('short-circuit'));
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, response: 'ok' }),
      });
      try {
        const longMsg = 'z'.repeat(CHAT_MULTILAYER_STYLE_HINT_MAX_INPUT_CHARS + 100);
        await sendChatMessage(longMsg, 'session-ml-cap');
        expect(spy).toHaveBeenCalledWith(
          'z'.repeat(CHAT_MULTILAYER_STYLE_HINT_MAX_INPUT_CHARS),
          'surface'
        );
      } finally {
        spy.mockRestore();
        if (prev === undefined) delete process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT;
        else process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT = prev;
      }
    });

    it('멀티레이어 힌트 활성화여도 trim 후 8자 미만이면 힌트 없이 호출하고 performMultiLayerAnalysis는 부르지 않는다', async () => {
      const prev = process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT;
      process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT = 'true';
      const spy = jest.spyOn(multiLayerStyleAnalysisSystem, 'performMultiLayerAnalysis');
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, response: 'ok' }),
      });
      try {
        await sendChatMessage('    \n  ', 'session-api-short');
        const call = jest.mocked(global.fetch).mock.calls[0];
        const body = JSON.parse(call[1].body as string);
        expect(body.context?.multilayer_style_hint).toBeUndefined();
        expect(spy).not.toHaveBeenCalled();
      } finally {
        spy.mockRestore();
        if (prev === undefined) delete process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT;
        else process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT = prev;
      }
    });

    it('context 옵션이 있으면 요청 본문에 포함해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, response: 'ok' }),
      });

      await sendChatMessage('hi', 's1', {
        context: { agentic_genspark_style: true, use_pipeline_v2: true },
      });

      const call = jest.mocked(global.fetch).mock.calls[0];
      const body = JSON.parse(call[1].body as string);
      expect(body.context).toMatchObject({
        agentic_genspark_style: true,
        use_pipeline_v2: true,
      });
    });

    it('REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT=1이면 URL에 id가 있어도 비-Genspark context에 genspark_*를 넣지 않는다', async () => {
      const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, response: 'ok' }),
      });
      try {
        window.history.replaceState(
          {},
          '',
          `/?${AGENTS_QUERY_PARAM_ID}=7c36051a-2b94-4e9e-bd36-05dfabfe3e07`,
        );
        await sendChatMessage('안녕', 'session-genspark-api-off', { context: {} });
        const call = jest.mocked(global.fetch).mock.calls[0];
        const body = JSON.parse(call[1].body as string);
        expect(body.context?.genspark_route_agent_id).toBeUndefined();
        expect(body.context?.genspark_reference_agent_id).toBeUndefined();
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
      }
    });

    it('sendChatMessage: URL type=super_agent만 있으면 본문 context에 참조 Super Agent id가 실린다', async () => {
      const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      if (prevDisable !== undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, response: 'ok' }),
      });
      try {
        window.history.replaceState(
          {},
          '',
          `/?${AGENTS_QUERY_PARAM_TYPE}=${encodeURIComponent(GENSPARK_AGENTS_TYPE_SUPER_AGENT)}`,
        );
        await sendChatMessage('안녕', 'session-super-agent', { context: {} });
        const body = JSON.parse(jest.mocked(global.fetch).mock.calls[0][1].body as string);
        expect(body.context?.genspark_reference_agent_id).toBe(GENSPARK_REFERENCE_AGENT_ID);
        expect(body.context?.genspark_route_agent_id).toBe(GENSPARK_REFERENCE_AGENT_ID);
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
      }
    });

    it('sendChatMessage: GENSPARK_DISABLE이면 type=super_agent만 있어도 본문에 genspark_*를 넣지 않는다', async () => {
      const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, response: 'ok' }),
      });
      try {
        window.history.replaceState(
          {},
          '',
          `/?${AGENTS_QUERY_PARAM_TYPE}=${encodeURIComponent(GENSPARK_AGENTS_TYPE_SUPER_AGENT)}`,
        );
        await sendChatMessage('안녕', 'session-super-agent-off', { context: {} });
        const body = JSON.parse(jest.mocked(global.fetch).mock.calls[0][1].body as string);
        expect(body.context?.genspark_route_agent_id).toBeUndefined();
        expect(body.context?.genspark_reference_agent_id).toBeUndefined();
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
      }
    });

    it('ModernChat 비스트리밍과 동일(buildModernChatPipelineContext+sendChatMessage): GENSPARK_DISABLE이면 URL id가 context에 끼지 않는다', async () => {
      delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
      const windowUuid = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';
      const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, response: 'ok' }),
      });
      try {
        window.history.replaceState({}, '', `/?${AGENTS_QUERY_PARAM_ID}=${windowUuid}`);
        const recent: Message[] = [
          { id: 1, sender: 'user', text: '이전', timestamp: 't', analysis: null },
        ];
        const unifiedCtx = buildModernChatPipelineContext('질문: a\n요구사항: b', recent);
        expect(unifiedCtx).toBeDefined();
        const mergeOpts = scenarioInheritMergeOptionsFromPipelineLikeMessages(recent);
        await sendChatMessage('질문: a\n요구사항: b', 'session-modern-off', {
          context: unifiedCtx as Record<string, unknown>,
          ...(mergeOpts != null ? { mergeApiChatContextOptions: mergeOpts } : {}),
        });
        const body = JSON.parse(jest.mocked(global.fetch).mock.calls[0][1].body as string);
        expect(body.context?.genspark_route_agent_id).not.toBe(windowUuid);
        expect(body.context?.genspark_reference_agent_id).not.toBe(windowUuid);
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
      }
    });

    it('ModernChat 파이프라인 옵션(gensparkRouteAgentId)이 있으면 sendChatMessage 본문이 해당 에이전트로 맞춰진다', async () => {
      delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
      const routeId = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, response: 'ok' }),
      });
      const unifiedCtx = buildModernChatPipelineContext('질문: a\n요구사항: b', [], {
        gensparkRouteAgentId: routeId,
      });
      expect(unifiedCtx).toBeDefined();
      await sendChatMessage('질문: a\n요구사항: b', 'session-modern-route', {
        context: unifiedCtx as Record<string, unknown>,
      });
      const body = JSON.parse(jest.mocked(global.fetch).mock.calls[0][1].body as string);
      expect(body.context?.genspark_reference_agent_id).toBe(routeId);
      expect(String(body.context?.genspark_external_agent_profile ?? '')).toContain(routeId);
    });

    it('mergeApiChatContextOptions+상속 env 시 client_generation_scenario를 넣는다', async () => {
      const prev = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, response: 'ok' }),
      });
      try {
        await sendChatMessage('질문: A\n요구사항: B', 's1', {
          mergeApiChatContextOptions: {
            recentMessagesForScenarioInherit: [
              {
                role: 'assistant',
                pipelineExtras: { generationScenarioMarkdown: '## apiClient\n시나리오' },
              },
            ],
          },
        });
        const call = jest.mocked(global.fetch).mock.calls[0];
        const body = JSON.parse(call[1].body as string);
        expect(String(body.context?.client_generation_scenario)).toContain('apiClient');
      } finally {
        if (prev === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
        else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prev;
      }
    });

    it('conversation_history의 pipelineExtras만으로(merge 옵션 없이) 상속 env 시 client_generation_scenario를 넣는다', async () => {
      const prev = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, response: 'ok' }),
      });
      try {
        await sendChatMessage('질문: A\n요구사항: B', 's1', {
          conversation_history: [
            {
              role: 'assistant',
              content: '이전',
              pipelineExtras: { generationScenarioMarkdown: '## apiTopHist\n시나리오' },
            },
          ],
        });
        const call = jest.mocked(global.fetch).mock.calls[0];
        const body = JSON.parse(call[1].body as string);
        expect(String(body.context?.client_generation_scenario)).toContain('apiTopHist');
      } finally {
        if (prev === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
        else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prev;
      }
    });

    it('context.conversationHistory의 pipelineExtras만으로(merge 옵션 없이) 상속 env 시 client_generation_scenario를 넣는다', async () => {
      const prev = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, response: 'ok' }),
      });
      try {
        await sendChatMessage('질문: A\n요구사항: B', 's1', {
          context: {
            conversationHistory: [
              {
                role: 'assistant',
                content: '이전',
                pipelineExtras: { generationScenarioMarkdown: '## apiCtxCamel\n시나리오' },
              },
            ],
          },
        });
        const call = jest.mocked(global.fetch).mock.calls[0];
        const body = JSON.parse(call[1].body as string);
        expect(String(body.context?.client_generation_scenario)).toContain('apiCtxCamel');
      } finally {
        if (prev === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
        else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prev;
      }
    });

    it('API 호출 실패 시 에러를 리포팅해야 함', async () => {
      const error = new TypeError('Failed to fetch');
      jest.mocked(global.fetch).mockRejectedValueOnce(error);

      await expect(sendChatMessage('테스트 메시지', 'session-123')).rejects.toThrow();

      expect(errorReportingService.reportError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          severity: 'high',
          additionalContext: expect.objectContaining({
            action: 'sendChatMessage',
            sessionId: 'session-123',
          }),
        })
      );
    });

    it('HTTP 에러 응답을 처리해야 함', async () => {
      jest.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: async () => ({ error: 'Server error' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: async () => ({ error: 'Server error' }),
        });

      await expect(sendChatMessage('테스트 메시지', 'session-123')).rejects.toThrow();

      expect(errorReportingService.reportError).toHaveBeenCalled();
    });

    it('첫 /api/chat 404면 /api/unified/chat으로 재시도한다', async () => {
      jest.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, response: 'unified에서 온 답' }),
        });

      const result = await sendChatMessage('hi', 's1');
      expect(result.success).toBe(true);
      expect(result.response).toBe('unified에서 온 답');
      expect(jest.mocked(global.fetch).mock.calls[0][0]).toBe(firstChatPostUrl());
      expect(jest.mocked(global.fetch).mock.calls[1][0]).toBe(secondChatPostUrl());
    });
  });

  describe('postChatAxiosWithFallback', () => {
    it('DEFAULT_CHAT_POST_* 상수는 Composer 비스트리밍과 동일한 타임아웃·재시도를 노출한다', () => {
      expect(DEFAULT_CHAT_POST_AXIOS_OPTIONS).toEqual({ timeout: 60000 });
      expect(DEFAULT_CHAT_POST_FALLBACK_OPTIONS).toEqual({
        perUrlRetry: { maxRetries: 3, retryDelayMs: 1000 },
      });
    });

    it('첫 chat URL이 성공하면 axios 응답을 반환한다', async () => {
      const spy = jest
        .spyOn(axios, 'post')
        .mockResolvedValueOnce({ data: { success: true } } as Awaited<ReturnType<typeof axios.post>>);
      try {
        const r = await postChatAxiosWithFallback(API_BASE_URL, { message: 'x' }, { timeout: 5000 });
        expect(r.data).toEqual({ success: true });
        expect(spy).toHaveBeenCalledWith(
          firstChatPostUrl(),
          { message: 'x' },
          expect.objectContaining({ timeout: 5000, headers: { 'Content-Type': 'application/json' } })
        );
      } finally {
        spy.mockRestore();
      }
    });

    it('axiosInstance를 넘기면 전역 axios.post 대신 해당 인스턴스로 호출한다', async () => {
      const instancePost = jest
        .fn()
        .mockResolvedValue({ data: { fromInstance: true } } as Awaited<ReturnType<typeof axios.post>>);
      const fakeInstance = { post: instancePost } as unknown as import('axios').AxiosInstance;
      const spy = jest.spyOn(axios, 'post');
      try {
        const r = await postChatAxiosWithFallback(
          API_BASE_URL,
          { message: 'x' },
          { timeout: 5000 },
          { axiosInstance: fakeInstance }
        );
        expect(r.data).toEqual({ fromInstance: true });
        expect(instancePost).toHaveBeenCalledWith(
          firstChatPostUrl(),
          { message: 'x' },
          expect.objectContaining({ timeout: 5000, headers: { 'Content-Type': 'application/json' } })
        );
        expect(spy).not.toHaveBeenCalled();
      } finally {
        spy.mockRestore();
      }
    });
  });

  describe('postChatJsonWithFallback', () => {
    it('커스텀 본문으로 unified 엔드포인트까지 도달할 수 있다', async () => {
      jest.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, custom: 1 }),
        });

      const out = await postChatJsonWithFallback({ message: 'x', quality: 'basic' });
      expect(out.success).toBe(true);
      expect(out.custom).toBe(1);
    });
  });

  describe('isValidChatResponse', () => {
    it('유효한 ChatAPIResponse를 확인해야 함', () => {
      const validResponse = {
        success: true,
        message: '응답',
      };

      expect(isValidChatResponse(validResponse)).toBe(true);
    });

    it('success가 false인 응답도 유효해야 함', () => {
      const validResponse = {
        success: false,
        error: '에러',
      };

      expect(isValidChatResponse(validResponse)).toBe(true);
    });

    it('유효하지 않은 객체를 거부해야 함', () => {
      expect(isValidChatResponse(null)).toBe(false);
      expect(isValidChatResponse(undefined)).toBe(false);
      expect(isValidChatResponse({})).toBe(false);
      expect(isValidChatResponse({ message: 'test' })).toBe(false);
      expect(isValidChatResponse({ success: 'true' })).toBe(false);
      expect(isValidChatResponse('string')).toBe(false);
      expect(isValidChatResponse(123)).toBe(false);
    });
  });
});

