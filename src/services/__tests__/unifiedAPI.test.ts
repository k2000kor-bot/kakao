/// <reference types="jest" />
/**
 * unifiedAPI 테스트
 */
import { File as NodeBufferFile } from 'buffer';
import {
  API_BASE_URL,
  FALLBACK_API_ORIGIN,
  getChatPostUrlsForConfigBase,
  joinApiHealthCheckUrl,
} from '../../config/api';
import {
  AGENTS_QUERY_PARAM_ID,
  AGENTS_QUERY_PARAM_TYPE,
  GENSPARK_AGENTS_TYPE_SUPER_AGENT,
} from '../../config/routes';
import { GENSPARK_REFERENCE_AGENT_ID } from '../gensparkReferenceAgentPreset';
import { restoreGlobalFetch } from '../../test-utils/installJestFetchMock';

/** `npx jest 단일 파일` 실행 시 `setupTests.ts`가 없을 수 있음 */
if (typeof globalThis.File === 'undefined') {
  (globalThis as unknown as { File: typeof NodeBufferFile }).File = NodeBufferFile;
}
if (typeof globalThis.FormData === 'undefined') {
  (globalThis as unknown as { FormData: typeof FormData }).FormData = class FormDataPolyfill {
    append(): void {}
  } as unknown as typeof FormData;
}

/** `unifiedAPI.ts` 모듈의 `API_BASE_URL` 상수와 동일 (CONFIG || FALLBACK) */
const UNIFIED_API_DEFAULT_BASE = API_BASE_URL || FALLBACK_API_ORIGIN;

/** `postUnifiedChat`의 `resolveChatApiBase(API_BASE_URL)`와 동일 */
function unifiedApiResolveChatBase(): string {
  const t = (API_BASE_URL ?? '').trim().replace(/\/$/, '');
  return t.length > 0 ? t : FALLBACK_API_ORIGIN.replace(/\/$/, '');
}

const unifiedSendChatPostUrls = () => getChatPostUrlsForConfigBase(unifiedApiResolveChatBase());
import multiLayerStyleAnalysisSystem, {
  CHAT_MULTILAYER_STYLE_HINT_MAX_INPUT_CHARS,
} from '../multiLayerStyleAnalysisSystem';
import unifiedAPI, {
  UnifiedAPIService,
  sendChatMessage,
  uploadFile,
  buildUnifiedApiChatRequestBody,
  resolveGensparkAgentIdFromWindowSearch,
  resolveGensparkAgentIdFromSearchParamsIfEnabled,
  isGensparkWindowRouteContextMergeDisabled,
  resolveAgentIdFromGensparkAgentsQuery,
  buildGensparkRouteAgentContext,
} from '../unifiedAPI';
import {
  buildModernChatPipelineContext,
  scenarioInheritMergeOptionsFromPipelineLikeMessages,
  type ChatTurn,
} from '../modernChatContextBuilder';
import type { Message } from '../../types';
import { DEFAULT_CHAT_PERSPECTIVE, DEFAULT_CHAT_RESPONSE_STYLE } from '../../utils/modernChatUrlStyle';

const mockFetch = jest.fn();
const originalFetch = globalThis.fetch;

describe('unifiedAPI', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    globalThis.fetch = mockFetch as typeof fetch;
    if (typeof window !== 'undefined') {
      window.fetch = globalThis.fetch;
    }
  });

  afterEach(() => {
    restoreGlobalFetch(originalFetch);
  });

  describe('UnifiedAPIService instance', () => {
    it('getHealth 호출 시 상태 반환', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, status: 'healthy' })
      });

      const result = await unifiedAPI.getHealth();

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(UNIFIED_API_DEFAULT_BASE),
        expect.any(Object)
      );
    });

    it('getProjects 호출 시 프로젝트 목록 반환', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            projects: [{ id: '1', name: 'test' }],
            total: 1
          })
      });

      const result = await unifiedAPI.getProjects();

      expect(result.success).toBe(true);
    });

    it('sendMessage 호출 시 응답 반환', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              success: true,
              message: { content: '안녕하세요', timestamp: new Date().toISOString() },
            })
          ),
      });

      const result = await unifiedAPI.sendMessage({ message: 'hello' });

      expect(result.success).toBe(true);
      expect(result.message?.content).toBeDefined();
    });

    it('sendMessage가 context.conversation_history의 pipelineExtras로 상속 env 시 시나리오를 보낸다', async () => {
      const prevInherit = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
      mockFetch.mockResolvedValue({
        ok: true,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              success: true,
              message: { content: 'ok', timestamp: new Date().toISOString() },
            })
          ),
      });
      try {
        await unifiedAPI.sendMessage({
          message: '질문: x\n요구사항: y',
          context: {
            conversation_history: [
              {
                role: 'assistant',
                content: '이전',
                pipelineExtras: { generationScenarioMarkdown: '## InstanceSend\n시나리오' },
              },
            ],
          },
        });
        const callOpts = mockFetch.mock.calls[0][1] as { body: string };
        const parsed = JSON.parse(callOpts.body);
        expect(String(parsed.context?.client_generation_scenario)).toContain('InstanceSend');
      } finally {
        if (prevInherit === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
        else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prevInherit;
      }
    });

    it('advancedAnalysis 호출', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            analysis: {
              success: true,
              analysis_type: 'comprehensive',
              basic_analysis: {},
              detailed_analysis: {},
              performance: { response_time: 100, confidence_score: 0.9 }
            },
            ai_analysis: {
              sentiment: {},
              intent: 'question',
              complexity: 'medium',
              urgency: 'low',
              confidence: 0.9
            },
            timestamp: new Date().toISOString()
          })
      });

      const result = await unifiedAPI.advancedAnalysis({ content: '테스트' });

      expect(result.success).toBe(true);
      expect(result.analysis).toBeDefined();
    });
  });

  describe('UnifiedAPIService class', () => {
    it('생성 시 baseURL 설정', async () => {
      const service = new UnifiedAPIService('https://custom.api');
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      await service.getHealth();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://custom.api'),
        expect.any(Object)
      );
    });
  });

  describe('buildUnifiedApiChatRequestBody', () => {
    it('기본 response_style·perspective를 넣고 요청에 있으면 그 값을 쓴다', () => {
      const bodyDefault = buildUnifiedApiChatRequestBody({ message: 'hi' });
      expect(bodyDefault.response_style).toBe(DEFAULT_CHAT_RESPONSE_STYLE);
      expect(bodyDefault.perspective).toBe(DEFAULT_CHAT_PERSPECTIVE);
      const bodyOverride = buildUnifiedApiChatRequestBody({
        message: 'hi',
        response_style: 'creative',
        perspective: 'analytical',
      });
      expect(bodyOverride.response_style).toBe('creative');
      expect(bodyOverride.perspective).toBe('analytical');
    });

    it('mergeApiChatContextOptions는 본문 최상위에 노출되지 않는다', () => {
      const body = buildUnifiedApiChatRequestBody({
        message: '질문: a\n요구사항: b',
        mergeApiChatContextOptions: {
          recentMessagesForScenarioInherit: [{ role: 'assistant' }],
        },
      });
      expect(body.mergeApiChatContextOptions).toBeUndefined();
      expect(body.message).toBe('질문: a\n요구사항: b');
    });

    it('mergeApiChatContextOptions+상속 env 시 context에 client_generation_scenario를 넣을 수 있다', () => {
      const prevInherit = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
      try {
        const body = buildUnifiedApiChatRequestBody({
          message: '질문: x\n요구사항: y',
          mergeApiChatContextOptions: {
            recentMessagesForScenarioInherit: [
              {
                role: 'assistant',
                pipelineExtras: { generationScenarioMarkdown: '## 통합 API\n시나리오' },
              },
            ],
          },
        });
        expect(String((body.context as Record<string, unknown>)?.client_generation_scenario)).toContain(
          '통합 API'
        );
      } finally {
        if (prevInherit === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
        else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prevInherit;
      }
    });

    it('conversation_history의 pipelineExtras만으로 상속 env 시 merge 옵션을 유도한다', () => {
      const prevInherit = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
      try {
        const body = buildUnifiedApiChatRequestBody({
          message: '질문: x\n요구사항: y',
          conversation_history: [
            {
              role: 'assistant',
              content: '이전',
              pipelineExtras: { generationScenarioMarkdown: '## 히스토리만\n시나리오' },
            },
          ] as ChatTurn[],
        });
        expect(String((body.context as Record<string, unknown>)?.client_generation_scenario)).toContain(
          '히스토리만'
        );
      } finally {
        if (prevInherit === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
        else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prevInherit;
      }
    });

    it('context.conversation_history만 있고 최상위 conversation_history는 없을 때도 pipelineExtras로 상속한다', () => {
      const prevInherit = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
      try {
        const body = buildUnifiedApiChatRequestBody({
          message: '질문: x\n요구사항: y',
          context: {
            conversation_history: [
              {
                role: 'assistant',
                content: '이전',
                pipelineExtras: { generationScenarioMarkdown: '## 컨텍스트전용\n시나리오' },
              },
            ],
          },
        });
        expect(String((body.context as Record<string, unknown>)?.client_generation_scenario)).toContain(
          '컨텍스트전용'
        );
      } finally {
        if (prevInherit === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
        else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prevInherit;
      }
    });

    it('context.conversationHistory(camelCase)만 있어도 pipelineExtras로 상속한다', () => {
      const prevInherit = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
      try {
        const body = buildUnifiedApiChatRequestBody({
          message: '질문: x\n요구사항: y',
          context: {
            conversationHistory: [
              {
                role: 'assistant',
                content: '이전',
                pipelineExtras: { generationScenarioMarkdown: '## unifiedCamel\n시나리오' },
              },
            ],
          },
        });
        expect(String((body.context as Record<string, unknown>)?.client_generation_scenario)).toContain(
          'unifiedCamel'
        );
      } finally {
        if (prevInherit === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
        else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prevInherit;
      }
    });

    it('context.messages만 있어도 pipelineExtras로 상속한다', () => {
      const prevInherit = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
      try {
        const body = buildUnifiedApiChatRequestBody({
          message: '질문: x\n요구사항: y',
          context: {
            messages: [
              {
                role: 'assistant',
                content: '이전',
                pipelineExtras: { generationScenarioMarkdown: '## unifiedMessages\n시나리오' },
              },
            ],
          },
        });
        expect(String((body.context as Record<string, unknown>)?.client_generation_scenario)).toContain(
          'unifiedMessages'
        );
      } finally {
        if (prevInherit === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
        else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prevInherit;
      }
    });

    it('최상위 conversation_history의 pipelineExtras가 context.conversation_history에도 실린다', () => {
      const prevInherit = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
      try {
        const markdown = '## 히스토리유지\n본문';
        const body = buildUnifiedApiChatRequestBody({
          message: '질문: x\n요구사항: y',
          conversation_history: [
            {
              role: 'assistant',
              content: '이전',
              pipelineExtras: { generationScenarioMarkdown: markdown },
            },
          ] as ChatTurn[],
        });
        const hist = (body.context as Record<string, unknown>)?.conversation_history as Array<
          Record<string, unknown>
        >;
        expect(Array.isArray(hist)).toBe(true);
        expect(String(hist[0]?.pipelineExtras && (hist[0].pipelineExtras as { generationScenarioMarkdown?: string }).generationScenarioMarkdown)).toContain(
          '히스토리유지'
        );
      } finally {
        if (prevInherit === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
        else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prevInherit;
      }
    });

    it('REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT=1이면 URL에 id가 있어도 빈 context에 genspark_*를 넣지 않는다', () => {
      const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
      try {
        window.history.replaceState(
          {},
          '',
          `/?${AGENTS_QUERY_PARAM_ID}=7c36051a-2b94-4e9e-bd36-05dfabfe3e07`,
        );
        const body = buildUnifiedApiChatRequestBody({ message: '안녕', context: {} });
        const ctx = body.context as Record<string, unknown> | undefined;
        expect(ctx?.genspark_route_agent_id).toBeUndefined();
        expect(ctx?.genspark_reference_agent_id).toBeUndefined();
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
      }
    });

    it('ModernChat 파이프라인 context로 buildUnifiedApiChatRequestBody 시 GENSPARK_DISABLE이면 URL id가 context에 끼지 않는다', () => {
      delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
      const windowUuid = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';
      const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
      try {
        window.history.replaceState({}, '', `/?${AGENTS_QUERY_PARAM_ID}=${windowUuid}`);
        const recent: Message[] = [
          { id: 1, sender: 'user', text: '이전', timestamp: 't', analysis: null },
        ];
        const unifiedCtx = buildModernChatPipelineContext('질문: a\n요구사항: b', recent);
        expect(unifiedCtx).toBeDefined();
        const mergeOpts = scenarioInheritMergeOptionsFromPipelineLikeMessages(recent);
        const body = buildUnifiedApiChatRequestBody({
          message: '질문: a\n요구사항: b',
          context: unifiedCtx as Record<string, unknown>,
          ...(mergeOpts != null ? { mergeApiChatContextOptions: mergeOpts } : {}),
        });
        const ctx = body.context as Record<string, unknown> | undefined;
        expect(ctx?.genspark_route_agent_id).not.toBe(windowUuid);
        expect(ctx?.genspark_reference_agent_id).not.toBe(windowUuid);
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
      }
    });

    it('ModernChat 파이프라인 옵션으로 buildUnifiedApiChatRequestBody 시 context에 해당 에이전트 id가 실린다', () => {
      delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
      const routeId = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';
      const unifiedCtx = buildModernChatPipelineContext('질문: a\n요구사항: b', [], {
        gensparkRouteAgentId: routeId,
      });
      expect(unifiedCtx).toBeDefined();
      const body = buildUnifiedApiChatRequestBody({
        message: '질문: a\n요구사항: b',
        context: unifiedCtx as Record<string, unknown>,
      });
      const ctx = body.context as Record<string, unknown> | undefined;
      expect(ctx?.genspark_reference_agent_id).toBe(routeId);
      expect(String(ctx?.genspark_external_agent_profile ?? '')).toContain(routeId);
    });

    it('buildUnifiedApiChatRequestBody: URL에 type=super_agent만 있으면 참조 Super Agent id가 context에 실린다', () => {
      delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
      const prevEnv = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      if (prevEnv !== undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      try {
        window.history.replaceState(
          {},
          '',
          `/?${AGENTS_QUERY_PARAM_TYPE}=${encodeURIComponent(GENSPARK_AGENTS_TYPE_SUPER_AGENT)}`,
        );
        const body = buildUnifiedApiChatRequestBody({ message: '안녕', context: {} });
        const ctx = body.context as Record<string, unknown> | undefined;
        expect(ctx?.genspark_reference_agent_id).toBe(GENSPARK_REFERENCE_AGENT_ID);
        expect(ctx?.genspark_route_agent_id).toBe(GENSPARK_REFERENCE_AGENT_ID);
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevEnv === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevEnv;
      }
    });

    it('buildUnifiedApiChatRequestBody: GENSPARK_DISABLE이면 type=super_agent만 있어도 genspark_*를 넣지 않는다', () => {
      delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
      const prevEnv = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
      try {
        window.history.replaceState(
          {},
          '',
          `/?${AGENTS_QUERY_PARAM_TYPE}=${encodeURIComponent(GENSPARK_AGENTS_TYPE_SUPER_AGENT)}`,
        );
        const body = buildUnifiedApiChatRequestBody({ message: '안녕', context: {} });
        const ctx = body.context as Record<string, unknown> | undefined;
        expect(ctx?.genspark_route_agent_id).toBeUndefined();
        expect(ctx?.genspark_reference_agent_id).toBeUndefined();
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevEnv === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevEnv;
      }
    });
  });

  describe('sendChatMessage', () => {
    it('대화 메시지 전송', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              success: true,
              message: { content: '응답', timestamp: new Date().toISOString() },
            })
          ),
      });

      const request = { message: '테스트 메시지' };
      const result = await sendChatMessage(request);

      expect(result.success).toBe(true);
      const callOpts = mockFetch.mock.calls[0][1] as { body: string };
      const parsed = JSON.parse(callOpts.body);
      expect(parsed).toMatchObject({ message: '테스트 메시지', quality: 'enhanced' });
      expect(parsed.context).toMatchObject({ original_user_message: '테스트 메시지' });
    });

    it('REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT=1이면 URL에 id가 있어도 fetch 본문 context에 genspark_*를 넣지 않는다', async () => {
      const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
      mockFetch.mockResolvedValue({
        ok: true,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              success: true,
              message: { content: 'ok', timestamp: new Date().toISOString() },
            })
          ),
      });
      try {
        window.history.replaceState(
          {},
          '',
          `/?${AGENTS_QUERY_PARAM_ID}=7c36051a-2b94-4e9e-bd36-05dfabfe3e07`,
        );
        await sendChatMessage({ message: '안녕', context: {} });
        const callOpts = mockFetch.mock.calls[0][1] as { body: string };
        const parsed = JSON.parse(callOpts.body);
        expect(parsed.context?.genspark_route_agent_id).toBeUndefined();
        expect(parsed.context?.genspark_reference_agent_id).toBeUndefined();
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
      }
    });

    it('sendChatMessage: URL type=super_agent만 있으면 fetch 본문에 참조 Super Agent id가 실린다', async () => {
      const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      if (prevDisable !== undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      mockFetch.mockResolvedValue({
        ok: true,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              success: true,
              message: { content: 'ok', timestamp: new Date().toISOString() },
            })
          ),
      });
      try {
        window.history.replaceState(
          {},
          '',
          `/?${AGENTS_QUERY_PARAM_TYPE}=${encodeURIComponent(GENSPARK_AGENTS_TYPE_SUPER_AGENT)}`,
        );
        await sendChatMessage({ message: '안녕', context: {} });
        const parsed = JSON.parse((mockFetch.mock.calls[0][1] as { body: string }).body);
        expect(parsed.context?.genspark_reference_agent_id).toBe(GENSPARK_REFERENCE_AGENT_ID);
        expect(parsed.context?.genspark_route_agent_id).toBe(GENSPARK_REFERENCE_AGENT_ID);
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
      }
    });

    it('sendChatMessage: GENSPARK_DISABLE이면 type=super_agent만 있어도 fetch 본문에 genspark_*를 넣지 않는다', async () => {
      const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
      mockFetch.mockResolvedValue({
        ok: true,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              success: true,
              message: { content: 'ok', timestamp: new Date().toISOString() },
            })
          ),
      });
      try {
        window.history.replaceState(
          {},
          '',
          `/?${AGENTS_QUERY_PARAM_TYPE}=${encodeURIComponent(GENSPARK_AGENTS_TYPE_SUPER_AGENT)}`,
        );
        await sendChatMessage({ message: '안녕', context: {} });
        const parsed = JSON.parse((mockFetch.mock.calls[0][1] as { body: string }).body);
        expect(parsed.context?.genspark_route_agent_id).toBeUndefined();
        expect(parsed.context?.genspark_reference_agent_id).toBeUndefined();
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
      }
    });

    it('ModernChat 파이프라인 context로 sendChatMessage 시 GENSPARK_DISABLE이면 URL id가 fetch 본문에 끼지 않는다', async () => {
      delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
      const windowUuid = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';
      const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
      mockFetch.mockResolvedValue({
        ok: true,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              success: true,
              message: { content: 'ok', timestamp: new Date().toISOString() },
            })
          ),
      });
      try {
        window.history.replaceState({}, '', `/?${AGENTS_QUERY_PARAM_ID}=${windowUuid}`);
        const recent: Message[] = [
          { id: 1, sender: 'user', text: '이전', timestamp: 't', analysis: null },
        ];
        const unifiedCtx = buildModernChatPipelineContext('질문: a\n요구사항: b', recent);
        expect(unifiedCtx).toBeDefined();
        const mergeOpts = scenarioInheritMergeOptionsFromPipelineLikeMessages(recent);
        await sendChatMessage({
          message: '질문: a\n요구사항: b',
          context: unifiedCtx as Record<string, unknown>,
          ...(mergeOpts != null ? { mergeApiChatContextOptions: mergeOpts } : {}),
        });
        const parsed = JSON.parse((mockFetch.mock.calls[0][1] as { body: string }).body);
        expect(parsed.context?.genspark_route_agent_id).not.toBe(windowUuid);
        expect(parsed.context?.genspark_reference_agent_id).not.toBe(windowUuid);
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
      }
    });

    it('ModernChat 파이프라인 옵션(gensparkRouteAgentId)으로 sendChatMessage 시 fetch 본문이 해당 에이전트로 맞춰진다', async () => {
      delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
      const routeId = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';
      mockFetch.mockResolvedValue({
        ok: true,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              success: true,
              message: { content: 'ok', timestamp: new Date().toISOString() },
            })
          ),
      });
      const unifiedCtx = buildModernChatPipelineContext('질문: a\n요구사항: b', [], {
        gensparkRouteAgentId: routeId,
      });
      expect(unifiedCtx).toBeDefined();
      await sendChatMessage({
        message: '질문: a\n요구사항: b',
        context: unifiedCtx as Record<string, unknown>,
      });
      const parsed = JSON.parse((mockFetch.mock.calls[0][1] as { body: string }).body);
      expect(parsed.context?.genspark_reference_agent_id).toBe(routeId);
      expect(String(parsed.context?.genspark_external_agent_profile ?? '')).toContain(routeId);
    });

    it('멀티레이어 힌트 env 활성화 시 초장문은 surface 분석 입력이 상한으로 잘린다', async () => {
      const prev = process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT;
      process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT = 'true';
      const spy = jest
        .spyOn(multiLayerStyleAnalysisSystem, 'performMultiLayerAnalysis')
        .mockRejectedValue(new Error('short-circuit'));
      mockFetch.mockResolvedValue({
        ok: true,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              success: true,
              message: { content: 'ok', timestamp: new Date().toISOString() },
            })
          ),
      });
      try {
        const longMsg = 'u'.repeat(CHAT_MULTILAYER_STYLE_HINT_MAX_INPUT_CHARS + 80);
        await sendChatMessage({ message: longMsg });
        expect(spy).toHaveBeenCalledWith(
          'u'.repeat(CHAT_MULTILAYER_STYLE_HINT_MAX_INPUT_CHARS),
          'surface'
        );
      } finally {
        spy.mockRestore();
        if (prev === undefined) delete process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT;
        else process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT = prev;
      }
    });

    it('멀티레이어 힌트 활성화여도 trim 후 8자 미만이면 multilayer_style_hint 없이 호출한다', async () => {
      const prev = process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT;
      process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT = 'true';
      const spy = jest.spyOn(multiLayerStyleAnalysisSystem, 'performMultiLayerAnalysis');
      mockFetch.mockResolvedValue({
        ok: true,
        text: () =>
          Promise.resolve(
            JSON.stringify({
              success: true,
              message: { content: 'ok', timestamp: new Date().toISOString() },
            })
          ),
      });
      try {
        await sendChatMessage({ message: '    \n  ' });
        const callOpts = mockFetch.mock.calls[0][1] as { body: string };
        const parsed = JSON.parse(callOpts.body);
        expect(parsed.context?.multilayer_style_hint).toBeUndefined();
        expect(spy).not.toHaveBeenCalled();
      } finally {
        spy.mockRestore();
        if (prev === undefined) delete process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT;
        else process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT = prev;
      }
    });

    it('질문+요구 메시지면 파이프라인 context가 병합된다', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ success: true, response: 'ok' })),
      });

      await sendChatMessage({
        message: '질문: A\n요구사항: B',
      });

      const callOpts = mockFetch.mock.calls[0][1] as { body: string };
      const parsed = JSON.parse(callOpts.body);
      expect(parsed.context?.use_pipeline_v2).toBe(true);
      expect(parsed.context?.agentic_genspark_style).toBe(true);
    });

    it('백엔드가 top-level `response` 문자열을 주면 message.content로 정규화한다', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () =>
          Promise.resolve(JSON.stringify({ success: true, response: '본문입니다' })),
      });

      const result = await sendChatMessage({ message: 'hi' });
      expect(result.success).toBe(true);
      expect(result.message?.content).toBe('본문입니다');
      expect(result.rawResponse).toEqual({
        success: true,
        response: '본문입니다',
      });
    });

    it('첫 엔드포인트 404면 unified/chat으로 재시도한다', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          text: () => Promise.resolve('{}'),
        })
        .mockResolvedValueOnce({
          ok: true,
          text: () =>
            Promise.resolve(JSON.stringify({ success: true, response: '두번째' })),
        });

      const result = await sendChatMessage({ message: 'x' });
      expect(mockFetch).toHaveBeenCalledTimes(2);
      const [firstChatUrl, secondChatUrl] = unifiedSendChatPostUrls();
      expect(mockFetch.mock.calls[0][0]).toBe(firstChatUrl);
      expect(mockFetch.mock.calls[1][0]).toBe(secondChatUrl);
      expect(result.message?.content).toBe('두번째');
    });
  });

  describe('Genspark URL helpers (re-export from gensparkAgentRegistry)', () => {
    it('named export로 동일 계약의 함수를 제공한다', () => {
      expect(typeof resolveGensparkAgentIdFromWindowSearch).toBe('function');
      expect(typeof resolveGensparkAgentIdFromSearchParamsIfEnabled).toBe('function');
      expect(typeof isGensparkWindowRouteContextMergeDisabled).toBe('function');
      expect(typeof resolveAgentIdFromGensparkAgentsQuery).toBe('function');
      expect(typeof buildGensparkRouteAgentContext).toBe('function');
    });
  });

  describe('uploadFile', () => {
    it('파일 업로드', async () => {
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            file_id: 'f-1',
            file_name: 'test.txt'
          })
      });

      const result = await uploadFile({ file: mockFile });

      expect(result.success).toBe(true);
      expect(result.file_id).toBe('f-1');
    });
  });
});
