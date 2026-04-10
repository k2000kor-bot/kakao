/**
 * streamingClient 유틸리티 테스트
 * 스트리밍 API 클라이언트 기능 확인
 */

import { API_BASE_URL, getChatStreamUrlsForConfigBase } from '../../config/api';
import {
  AGENTS_QUERY_PARAM_ID,
  AGENTS_QUERY_PARAM_TYPE,
  GENSPARK_AGENTS_TYPE_SUPER_AGENT,
} from '../../config/routes';
import { GENSPARK_REFERENCE_AGENT_ID } from '../../services/gensparkReferenceAgentPreset';

const firstChatStreamUrl = () => getChatStreamUrlsForConfigBase(API_BASE_URL)[0];
const secondChatStreamUrl = () => getChatStreamUrlsForConfigBase(API_BASE_URL)[1];
import multiLayerStyleAnalysisSystem, {
  CHAT_MULTILAYER_STYLE_HINT_MAX_INPUT_CHARS,
} from '../../services/multiLayerStyleAnalysisSystem';
import { DEFAULT_CHAT_RESPONSE_STYLE } from '../modernChatUrlStyle';
import {
  buildModernChatPipelineContext,
  scenarioInheritMergeOptionsFromPipelineLikeMessages,
} from '../../services/modernChatContextBuilder';
import type { Message } from '../../types';
import { streamChatMessage, isStreamingSupported } from '../streamingClient';
import errorReportingService from '../../services/errorReportingService';

jest.mock('../../services/errorReportingService', () => ({
  __esModule: true,
  default: {
    reportError: jest.fn(),
  },
}));

// fetch 모킹
globalThis.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// TextEncoder/TextDecoder 모킹
globalThis.TextEncoder = class {
  encode(str: string): Uint8Array {
    const utf8 = [];
    for (let i = 0; i < str.length; i++) {
      let charcode = str.charCodeAt(i);
      if (charcode < 0x80) utf8.push(charcode);
      else if (charcode < 0x800) {
        utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
      } else if (charcode < 0xd800 || charcode >= 0xe000) {
        utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
      } else {
        i++;
        charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
        utf8.push(0xf0 | (charcode >> 18), 0x80 | ((charcode >> 12) & 0x3f), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
      }
    }
    return new Uint8Array(utf8);
  }
} as unknown as typeof TextEncoder;

globalThis.TextDecoder = class {
  decode(bytes: Uint8Array): string {
    let result = '';
    let i = 0;
    while (i < bytes.length) {
      let c = bytes[i++];
      if (c > 127) {
        if (c > 191 && c < 224) {
          c = ((c & 31) << 6) | (bytes[i++] & 63);
        } else if (c > 223 && c < 240) {
          c = ((c & 15) << 12) | ((bytes[i++] & 63) << 6) | (bytes[i++] & 63);
        } else if (c > 239 && c < 248) {
          c = ((c & 7) << 18) | ((bytes[i++] & 63) << 12) | ((bytes[i++] & 63) << 6) | (bytes[i++] & 63);
        }
      }
      result += String.fromCharCode(c);
    }
    return result;
  }
} as unknown as typeof TextDecoder;

// ReadableStream 모킹
class MockReadableStream {
  private readonly chunks: Uint8Array[];
  private readonly controller: ReadableStreamDefaultController<Uint8Array> | null = null;
  private readonly delayMs: number;
  public cancelled = false;

  constructor(chunks: string[], delayMs = 0) {
    this.chunks = chunks.map(chunk => new TextEncoder().encode(chunk));
    this.delayMs = delayMs;
  }

  getReader() {
    let index = 0;
    const self = this;
    return {
      read: async () => {
        if (self.delayMs > 0) {
          await new Promise(resolve => setTimeout(resolve, self.delayMs));
        }
        if (index >= self.chunks.length) {
          return { done: true, value: undefined };
        }
        const chunk = self.chunks[index++];
        return { done: false, value: chunk };
      },
      cancel: () => {
        self.cancelled = true;
      },
    };
  }
}

/** 실제 fetch Response와 유사한 SSE 성공 mock (`streamChatMessage`가 content-type 분기함) */
function mockSseHeaders(contentType = 'text/event-stream; charset=utf-8') {
  return {
    get: (name: string) => (name.toLowerCase() === 'content-type' ? contentType : null),
  };
}

function mockSseOkResponse(
  body: ReadableStream<Uint8Array> | null,
  contentType?: string
) {
  return {
    ok: true as const,
    status: 200,
    statusText: 'OK',
    headers: mockSseHeaders(contentType),
    body,
  };
}

/** 스트림 대신 한 번에 오는 JSON 폴백 응답 mock */
function mockJsonOkFetchResponse(payload: Record<string, unknown>) {
  return {
    ok: true as const,
    status: 200,
    statusText: 'OK',
    headers: mockSseHeaders('application/json'),
    json: async () => payload,
  };
}

describe('streamingClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isStreamingSupported', () => {
    it('스트리밍 지원 여부를 확인해야 함', () => {
      const supported = isStreamingSupported();
      expect(typeof supported).toBe('boolean');
    });
  });

  describe('streamChatMessage', () => {
    it('스트리밍 메시지를 처리해야 함', async () => {
      const mockChunks = [
        'data: {"text":"Hello","done":false}\n\n',
        'data: {"text":" World","done":false}\n\n',
        'data: {"text":"!","done":true,"fullContent":"Hello World!"}\n\n',
      ];

      jest.mocked(globalThis.fetch).mockResolvedValueOnce(
        mockSseOkResponse(new MockReadableStream(mockChunks) as unknown as ReadableStream<Uint8Array>)
      );

      const onChunk = jest.fn();
      const onComplete = jest.fn();

      const result = await streamChatMessage('test', 'session123', {
        onChunk,
        onComplete,
      });

      expect(result).toBe('Hello World!');
      expect(onChunk).toHaveBeenCalledTimes(3);
      expect(onChunk).toHaveBeenNthCalledWith(1, 'Hello');
      expect(onChunk).toHaveBeenNthCalledWith(2, ' World');
      expect(onChunk).toHaveBeenNthCalledWith(3, '!');
      expect(onComplete).toHaveBeenCalledWith('Hello World!', undefined);
    });

    it('done 이벤트의 metadata를 onComplete에 전달한다', async () => {
      const mockChunks = [
        'data: {"text":"x","done":true,"fullContent":"x","metadata":{"answer_mode":"expert","response_style":"detailed"}}\n\n',
      ];
      jest.mocked(globalThis.fetch).mockResolvedValueOnce(
        mockSseOkResponse(new MockReadableStream(mockChunks) as unknown as ReadableStream<Uint8Array>)
      );
      const onComplete = jest.fn();
      await streamChatMessage('q', 's1', { onComplete });
      expect(onComplete).toHaveBeenCalledWith('x', {
        answer_mode: 'expert',
        response_style: 'detailed',
      });
    });

    it('SSE metadata를 누적해 done 시 onComplete에 전달한다', async () => {
      const mockChunks = [
        'data: {"text":"Hi","done":false,"metadata":{"task_plan":{"task_type":"fact_check"}}}\n\n',
        'data: {"text":"","done":true,"fullContent":"Hi"}\n\n',
      ];
      jest.mocked(globalThis.fetch).mockResolvedValueOnce(
        mockSseOkResponse(new MockReadableStream(mockChunks) as unknown as ReadableStream<Uint8Array>)
      );
      const onComplete = jest.fn();
      await streamChatMessage('q', 's1', { onComplete });
      expect(onComplete).toHaveBeenCalledWith('Hi', {
        task_plan: { task_type: 'fact_check' },
      });
    });

    it('여러 SSE 조각의 metadata를 얕게 병합해 done 시 onComplete에 전달한다', async () => {
      const mockChunks = [
        'data: {"text":"A","done":false,"metadata":{"follow_up_questions":["다음은?"]}}\n\n',
        'data: {"text":"B","done":false,"metadata":{"answer_mode":"guided"}}\n\n',
        `data: {"text":"","done":true,"fullContent":"AB","metadata":{"response_style":"${DEFAULT_CHAT_RESPONSE_STYLE}"}}\n\n`,
      ];
      jest.mocked(globalThis.fetch).mockResolvedValueOnce(
        mockSseOkResponse(new MockReadableStream(mockChunks) as unknown as ReadableStream<Uint8Array>)
      );
      const onComplete = jest.fn();
      await streamChatMessage('q', 's1', { onComplete });
      expect(onComplete).toHaveBeenCalledWith('AB', {
        follow_up_questions: ['다음은?'],
        answer_mode: 'guided',
        response_style: DEFAULT_CHAT_RESPONSE_STYLE,
      });
    });

    it('requestBody에 context(prefer_informed_answer 등)를 포함해 전송해야 함', async () => {
      const mockChunks = [
        'data: {"text":"OK","done":true,"fullContent":"OK"}\n\n',
      ];
      jest.mocked(globalThis.fetch).mockResolvedValueOnce(
        mockSseOkResponse(new MockReadableStream(mockChunks) as unknown as ReadableStream<Uint8Array>)
      );

      await streamChatMessage('test', 'session123', {
        requestBody: {
          context: { prefer_informed_answer: true, enable_web_research: false },
        },
      });

      const fetchCall = jest.mocked(globalThis.fetch).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.message).toBe('test');
      expect(body.session_id).toBe('session123');
      /* mergeApiChatContextPayload가 original_user_message·기능 플래그 등을 병합하므로 부분 일치만 검증 */
      expect(body.context).toMatchObject({
        prefer_informed_answer: true,
        enable_web_research: false,
      });
    });

    it('REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT=1이면 URL에 id가 있어도 스트림 context에 genspark_*를 넣지 않는다', async () => {
      const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      const mockChunks = ['data: {"text":"OK","done":true,"fullContent":"OK"}\n\n'];
      jest.mocked(globalThis.fetch).mockResolvedValueOnce(
        mockSseOkResponse(new MockReadableStream(mockChunks) as unknown as ReadableStream<Uint8Array>)
      );
      process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
      try {
        window.history.replaceState(
          {},
          '',
          `/?${AGENTS_QUERY_PARAM_ID}=7c36051a-2b94-4e9e-bd36-05dfabfe3e07`,
        );
        await streamChatMessage('안녕', 'session-genspark-off', { requestBody: {} });
        const fetchCall = jest.mocked(globalThis.fetch).mock.calls[0];
        const body = JSON.parse(fetchCall[1].body);
        expect(body.context?.genspark_route_agent_id).toBeUndefined();
        expect(body.context?.genspark_reference_agent_id).toBeUndefined();
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
      }
    });

    it('streamChatMessage: URL type=super_agent만 있으면 스트림 본문 context에 참조 Super Agent id가 실린다', async () => {
      const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      if (prevDisable !== undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const mockChunks = ['data: {"text":"OK","done":true,"fullContent":"OK"}\n\n'];
      jest.mocked(globalThis.fetch).mockResolvedValueOnce(
        mockSseOkResponse(new MockReadableStream(mockChunks) as unknown as ReadableStream<Uint8Array>)
      );
      try {
        window.history.replaceState(
          {},
          '',
          `/?${AGENTS_QUERY_PARAM_TYPE}=${encodeURIComponent(GENSPARK_AGENTS_TYPE_SUPER_AGENT)}`,
        );
        await streamChatMessage('안녕', 'session-stream-super-agent', { requestBody: {} });
        const body = JSON.parse(jest.mocked(globalThis.fetch).mock.calls[0][1].body as string);
        expect(body.context?.genspark_reference_agent_id).toBe(GENSPARK_REFERENCE_AGENT_ID);
        expect(body.context?.genspark_route_agent_id).toBe(GENSPARK_REFERENCE_AGENT_ID);
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
      }
    });

    it('streamChatMessage: GENSPARK_DISABLE이면 type=super_agent만 있어도 스트림 본문에 genspark_*를 넣지 않는다', async () => {
      const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      const mockChunks = ['data: {"text":"OK","done":true,"fullContent":"OK"}\n\n'];
      jest.mocked(globalThis.fetch).mockResolvedValueOnce(
        mockSseOkResponse(new MockReadableStream(mockChunks) as unknown as ReadableStream<Uint8Array>)
      );
      process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
      try {
        window.history.replaceState(
          {},
          '',
          `/?${AGENTS_QUERY_PARAM_TYPE}=${encodeURIComponent(GENSPARK_AGENTS_TYPE_SUPER_AGENT)}`,
        );
        await streamChatMessage('안녕', 'session-stream-super-agent-off', { requestBody: {} });
        const body = JSON.parse(jest.mocked(globalThis.fetch).mock.calls[0][1].body as string);
        expect(body.context?.genspark_route_agent_id).toBeUndefined();
        expect(body.context?.genspark_reference_agent_id).toBeUndefined();
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
      }
    });

    it('ModernChat 스트리밍과 동일(buildModernChatPipelineContext+streamChatMessage): GENSPARK_DISABLE이면 URL id가 context에 끼지 않는다', async () => {
      delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
      const windowUuid = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';
      const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      const mockChunks = ['data: {"text":"OK","done":true,"fullContent":"OK"}\n\n'];
      jest.mocked(globalThis.fetch).mockResolvedValueOnce(
        mockSseOkResponse(new MockReadableStream(mockChunks) as unknown as ReadableStream<Uint8Array>)
      );
      process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
      try {
        window.history.replaceState({}, '', `/?${AGENTS_QUERY_PARAM_ID}=${windowUuid}`);
        const recent: Message[] = [
          { id: 1, sender: 'user', text: '이전', timestamp: 't', analysis: null },
        ];
        const unifiedCtx = buildModernChatPipelineContext('질문: a\n요구사항: b', recent);
        expect(unifiedCtx).toBeDefined();
        const mergeOpts = scenarioInheritMergeOptionsFromPipelineLikeMessages(recent);
        await streamChatMessage('질문: a\n요구사항: b', 'session-modern-stream-off', {
          requestBody: { context: unifiedCtx as Record<string, unknown> },
          ...(mergeOpts != null ? { mergeApiChatContextOptions: mergeOpts } : {}),
        });
        const fetchCall = jest.mocked(globalThis.fetch).mock.calls[0];
        const body = JSON.parse(fetchCall[1].body as string);
        expect(body.context?.genspark_route_agent_id).not.toBe(windowUuid);
        expect(body.context?.genspark_reference_agent_id).not.toBe(windowUuid);
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
      }
    });

    it('ModernChat 스트리밍 파이프라인 옵션(gensparkRouteAgentId)이면 스트림 본문이 해당 에이전트로 맞춰진다', async () => {
      delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
      const routeId = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';
      const mockChunks = ['data: {"text":"OK","done":true,"fullContent":"OK"}\n\n'];
      jest.mocked(globalThis.fetch).mockResolvedValueOnce(
        mockSseOkResponse(new MockReadableStream(mockChunks) as unknown as ReadableStream<Uint8Array>)
      );
      const unifiedCtx = buildModernChatPipelineContext('질문: a\n요구사항: b', [], {
        gensparkRouteAgentId: routeId,
      });
      expect(unifiedCtx).toBeDefined();
      await streamChatMessage('질문: a\n요구사항: b', 'session-modern-stream-route', {
        requestBody: { context: unifiedCtx as Record<string, unknown> },
      });
      const fetchCall = jest.mocked(globalThis.fetch).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body as string);
      expect(body.context?.genspark_reference_agent_id).toBe(routeId);
      expect(String(body.context?.genspark_external_agent_profile ?? '')).toContain(routeId);
    });

    it('REACT_APP_CHAT_MULTILAYER_STYLE_HINT=true이고 메시지가 8자 이상이면 context에 multilayer_style_hint를 넣는다', async () => {
      const prev = process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT;
      process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT = 'true';
      const mockChunks = ['data: {"text":"OK","done":true,"fullContent":"OK"}\n\n'];
      jest.mocked(globalThis.fetch).mockResolvedValueOnce(
        mockSseOkResponse(new MockReadableStream(mockChunks) as unknown as ReadableStream<Uint8Array>)
      );
      try {
        await streamChatMessage('스트리밍용 충분히 긴 사용자 메시지', 'session123', {});
        const fetchCall = jest.mocked(globalThis.fetch).mock.calls[0];
        const body = JSON.parse(fetchCall[1].body);
        expect(body.context?.multilayer_style_hint).toBeDefined();
        expect(body.context.multilayer_style_hint.analysis_depth).toBe('surface');
      } finally {
        if (prev === undefined) delete process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT;
        else process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT = prev;
      }
    });

    it('멀티레이어 힌트 활성화 시 초장문은 surface 분석에 상한 길이만 전달된다', async () => {
      const prev = process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT;
      process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT = 'true';
      const spy = jest
        .spyOn(multiLayerStyleAnalysisSystem, 'performMultiLayerAnalysis')
        .mockRejectedValue(new Error('short-circuit'));
      const mockChunks = ['data: {"text":"OK","done":true,"fullContent":"OK"}\n\n'];
      jest.mocked(globalThis.fetch).mockResolvedValueOnce(
        mockSseOkResponse(new MockReadableStream(mockChunks) as unknown as ReadableStream<Uint8Array>)
      );
      try {
        const longMsg = '한'.repeat(CHAT_MULTILAYER_STYLE_HINT_MAX_INPUT_CHARS + 200);
        await streamChatMessage(longMsg, 'session-long-ml', {});
        expect(spy).toHaveBeenCalledWith(
          '한'.repeat(CHAT_MULTILAYER_STYLE_HINT_MAX_INPUT_CHARS),
          'surface'
        );
      } finally {
        spy.mockRestore();
        if (prev === undefined) delete process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT;
        else process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT = prev;
      }
    });

    it('context에 이미 multilayer_style_hint가 있으면 덮어쓰지 않는다', async () => {
      const prev = process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT;
      process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT = 'true';
      const mockChunks = ['data: {"text":"OK","done":true,"fullContent":"OK"}\n\n'];
      jest.mocked(globalThis.fetch).mockResolvedValueOnce(
        mockSseOkResponse(new MockReadableStream(mockChunks) as unknown as ReadableStream<Uint8Array>)
      );
      const existing = { analysis_depth: 'surface', preset_hint: true };
      try {
        await streamChatMessage('스트리밍용 충분히 긴 사용자 메시지', 'session123', {
          requestBody: { context: { multilayer_style_hint: existing } },
        });
        const fetchCall = jest.mocked(globalThis.fetch).mock.calls[0];
        const body = JSON.parse(fetchCall[1].body);
        expect(body.context?.multilayer_style_hint).toEqual(existing);
      } finally {
        if (prev === undefined) delete process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT;
        else process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT = prev;
      }
    });

    it('멀티레이어 힌트 활성화여도 trim 후 8자 미만이면 힌트를 넣지 않고 performMultiLayerAnalysis를 호출하지 않는다', async () => {
      const prev = process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT;
      process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT = 'true';
      const spy = jest.spyOn(multiLayerStyleAnalysisSystem, 'performMultiLayerAnalysis');
      const mockChunks = ['data: {"text":"OK","done":true,"fullContent":"OK"}\n\n'];
      jest.mocked(globalThis.fetch).mockResolvedValueOnce(
        mockSseOkResponse(new MockReadableStream(mockChunks) as unknown as ReadableStream<Uint8Array>)
      );
      try {
        await streamChatMessage('    \n  ', 'session-short-ml', {});
        const fetchCall = jest.mocked(globalThis.fetch).mock.calls[0];
        const body = JSON.parse(fetchCall[1].body);
        expect(body.context?.multilayer_style_hint).toBeUndefined();
        expect(spy).not.toHaveBeenCalled();
      } finally {
        spy.mockRestore();
        if (prev === undefined) delete process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT;
        else process.env.REACT_APP_CHAT_MULTILAYER_STYLE_HINT = prev;
      }
    });

    it('messagesForScenarioInherit + REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO 시 context에 client_generation_scenario를 넣는다', async () => {
      const prev = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
      const mockChunks = ['data: {"text":"OK","done":true,"fullContent":"OK"}\n\n'];
      jest.mocked(globalThis.fetch).mockResolvedValueOnce(
        mockSseOkResponse(new MockReadableStream(mockChunks) as unknown as ReadableStream<Uint8Array>)
      );

      try {
        await streamChatMessage('질문: x\n요구사항: y', 'session123', {
          messagesForScenarioInherit: [
            {
              role: 'assistant',
              pipelineExtras: { generationScenarioMarkdown: '## 직전\n시나리오' },
            },
          ],
        });
        const fetchCall = jest.mocked(globalThis.fetch).mock.calls[0];
        const body = JSON.parse(fetchCall[1].body);
        expect(String(body.context?.client_generation_scenario)).toContain('직전');
      } finally {
        if (prev === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
        else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prev;
      }
    });

    it('requestBody.conversation_history의 pipelineExtras만으로 상속 env 시 client_generation_scenario를 넣는다', async () => {
      const prev = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
      const mockChunks = ['data: {"text":"OK","done":true,"fullContent":"OK"}\n\n'];
      jest.mocked(globalThis.fetch).mockResolvedValueOnce(
        mockSseOkResponse(new MockReadableStream(mockChunks) as unknown as ReadableStream<Uint8Array>)
      );

      try {
        await streamChatMessage('질문: x\n요구사항: y', 'session123', {
          requestBody: {
            conversation_history: [
              {
                role: 'assistant',
                content: '이전',
                pipelineExtras: { generationScenarioMarkdown: '## 스트림히스토리\n시나리오' },
              },
            ],
          },
        });
        const fetchCall = jest.mocked(globalThis.fetch).mock.calls[0];
        const body = JSON.parse(fetchCall[1].body);
        expect(String(body.context?.client_generation_scenario)).toContain('스트림히스토리');
      } finally {
        if (prev === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
        else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prev;
      }
    });

    it('requestBody.context.conversation_history의 pipelineExtras만으로 상속 env 시 client_generation_scenario를 넣는다', async () => {
      const prev = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
      const mockChunks = ['data: {"text":"OK","done":true,"fullContent":"OK"}\n\n'];
      jest.mocked(globalThis.fetch).mockResolvedValueOnce(
        mockSseOkResponse(new MockReadableStream(mockChunks) as unknown as ReadableStream<Uint8Array>)
      );

      try {
        await streamChatMessage('질문: x\n요구사항: y', 'session123', {
          requestBody: {
            context: {
              conversation_history: [
                {
                  role: 'assistant',
                  content: '이전',
                  pipelineExtras: { generationScenarioMarkdown: '## 스트림컨텍스트\n시나리오' },
                },
              ],
            },
          },
        });
        const fetchCall = jest.mocked(globalThis.fetch).mock.calls[0];
        const body = JSON.parse(fetchCall[1].body);
        expect(String(body.context?.client_generation_scenario)).toContain('스트림컨텍스트');
      } finally {
        if (prev === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
        else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prev;
      }
    });

    it('requestBody.context.conversationHistory(camelCase)의 pipelineExtras만으로 상속 env 시 client_generation_scenario를 넣는다', async () => {
      const prev = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
      const mockChunks = ['data: {"text":"OK","done":true,"fullContent":"OK"}\n\n'];
      jest.mocked(globalThis.fetch).mockResolvedValueOnce(
        mockSseOkResponse(new MockReadableStream(mockChunks) as unknown as ReadableStream<Uint8Array>)
      );

      try {
        await streamChatMessage('질문: x\n요구사항: y', 'session123', {
          requestBody: {
            context: {
              conversationHistory: [
                {
                  role: 'assistant',
                  content: '이전',
                  pipelineExtras: { generationScenarioMarkdown: '## 스트림Camel\n시나리오' },
                },
              ],
            },
          },
        });
        const fetchCall = jest.mocked(globalThis.fetch).mock.calls[0];
        const body = JSON.parse(fetchCall[1].body);
        expect(String(body.context?.client_generation_scenario)).toContain('스트림Camel');
      } finally {
        if (prev === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
        else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prev;
      }
    });

    it('requestBody.context.messages의 pipelineExtras만으로 상속 env 시 client_generation_scenario를 넣는다', async () => {
      const prev = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
      const mockChunks = ['data: {"text":"OK","done":true,"fullContent":"OK"}\n\n'];
      jest.mocked(globalThis.fetch).mockResolvedValueOnce(
        mockSseOkResponse(new MockReadableStream(mockChunks) as unknown as ReadableStream<Uint8Array>)
      );

      try {
        await streamChatMessage('질문: x\n요구사항: y', 'session123', {
          requestBody: {
            context: {
              messages: [
                {
                  role: 'assistant',
                  content: '이전',
                  pipelineExtras: { generationScenarioMarkdown: '## 스트림Messages\n시나리오' },
                },
              ],
            },
          },
        });
        const fetchCall = jest.mocked(globalThis.fetch).mock.calls[0];
        const body = JSON.parse(fetchCall[1].body);
        expect(String(body.context?.client_generation_scenario)).toContain('스트림Messages');
      } finally {
        if (prev === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
        else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prev;
      }
    });

    it('에러가 포함된 메시지를 처리해야 함', async () => {
      const mockChunks = [
        'data: {"error":"Something went wrong","done":false}\n\n',
      ];

      jest.mocked(globalThis.fetch).mockResolvedValueOnce(
        mockSseOkResponse(new MockReadableStream(mockChunks) as unknown as ReadableStream<Uint8Array>)
      );

      const onError = jest.fn();

      await expect(
        streamChatMessage('test', 'session123', { onError })
      ).rejects.toThrow('Something went wrong');

      expect(onError).toHaveBeenCalled();
      expect((onError.mock.calls[0][0] as Error).message).toBe('Something went wrong');
    });

    it('HTTP 에러를 처리해야 함', async () => {
      jest.mocked(globalThis.fetch)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        });

      await expect(
        streamChatMessage('test', 'session123')
      ).rejects.toThrow('HTTP 500');

      expect(jest.mocked(globalThis.fetch).mock.calls.length).toBe(2);
      expect(errorReportingService.reportError).toHaveBeenCalled();
    });

    it('502이면 /api/unified/chat/stream 으로 폴백해야 함', async () => {
      const mockChunks = [
        'data: {"content":"Hi","done":false}\n\n',
        'data: {"content":"","done":true,"fullContent":"Hi"}\n\n',
      ];

      jest.mocked(globalThis.fetch)
        .mockResolvedValueOnce({
          ok: false,
          status: 502,
          statusText: 'Bad Gateway',
        })
        .mockResolvedValueOnce(
          mockSseOkResponse(new MockReadableStream(mockChunks) as unknown as ReadableStream<Uint8Array>)
        );

      const result = await streamChatMessage('test', 'session123');
      expect(result).toBe('Hi');
      expect(jest.mocked(globalThis.fetch).mock.calls.length).toBe(2);
      expect(jest.mocked(globalThis.fetch).mock.calls[0][0]).toBe(firstChatStreamUrl());
      expect(jest.mocked(globalThis.fetch).mock.calls[1][0]).toBe(secondChatStreamUrl());
    });

    it('404이면 /api/unified/chat/stream 으로 폴백해야 함', async () => {
      const mockChunks = [
        'data: {"content":"Hello","done":false}\n\n',
        'data: {"content":" World","done":false}\n\n',
        'data: {"content":"","done":true,"fullContent":"Hello World!"}\n\n',
      ];

      jest.mocked(globalThis.fetch)
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        })
        .mockResolvedValueOnce(
          mockSseOkResponse(new MockReadableStream(mockChunks) as unknown as ReadableStream<Uint8Array>)
        );

      const result = await streamChatMessage('test', 'session123');
      expect(result).toBe('Hello World!');
      expect(jest.mocked(globalThis.fetch).mock.calls.length).toBe(2);
      expect(jest.mocked(globalThis.fetch).mock.calls[0][0]).toBe(firstChatStreamUrl());
      expect(jest.mocked(globalThis.fetch).mock.calls[1][0]).toBe(secondChatStreamUrl());
    });

    it('response body가 null이면 에러를 던져야 함', async () => {
      jest.mocked(globalThis.fetch).mockResolvedValueOnce(mockSseOkResponse(null));

      await expect(
        streamChatMessage('test', 'session123')
      ).rejects.toThrow('Response body is null');
    });

    it('진행률 콜백을 호출해야 함', async () => {
      const mockChunks = [
        'data: {"text":"Hello","metadata":{"progress":50},"done":false}\n\n',
        'data: {"text":" World","metadata":{"progress":100},"done":true}\n\n',
      ];

      jest.mocked(globalThis.fetch).mockResolvedValueOnce(
        mockSseOkResponse(new MockReadableStream(mockChunks) as unknown as ReadableStream<Uint8Array>)
      );

      const onProgress = jest.fn();
      const onComplete = jest.fn();

      await streamChatMessage('test', 'session123', { onProgress, onComplete });

      expect(onProgress).toHaveBeenCalledWith(50);
      expect(onProgress).toHaveBeenCalledWith(100);
      expect(onComplete).toHaveBeenCalledWith('Hello World', { progress: 100 });
    });

    it('metadata가 오면 onMetadata로 누적본을 알려야 함', async () => {
      const mockChunks = [
        'data: {"text":"a","metadata":{"generation_phase":"draft"},"done":false}\n\n',
        'data: {"text":"b","metadata":{"trace_id":"t1"},"done":true}\n\n',
      ];

      jest.mocked(globalThis.fetch).mockResolvedValueOnce(
        mockSseOkResponse(new MockReadableStream(mockChunks) as unknown as ReadableStream<Uint8Array>)
      );

      const onMetadata = jest.fn();
      const onComplete = jest.fn();

      await streamChatMessage('test', 'session123', { onMetadata, onComplete });

      expect(onMetadata).toHaveBeenCalled();
      const lastMeta = onMetadata.mock.calls[onMetadata.mock.calls.length - 1][0] as Record<string, unknown>;
      expect(lastMeta.generation_phase).toBe('draft');
      expect(lastMeta.trace_id).toBe('t1');
      expect(onComplete).toHaveBeenCalledWith(
        'ab',
        expect.objectContaining({ generation_phase: 'draft', trace_id: 't1' })
      );
    });

    it('done 한 번에만 metadata가 오면 onComplete에 파이프라인 메타를 넘겨야 함', async () => {
      const mockChunks = [
        'data: {"content":"","done":true,"fullContent":"답변 본문","metadata":{"trace_id":"t99","task_plan":{"pipeline_status":"completed"}}}\n\n',
      ];

      jest.mocked(globalThis.fetch).mockResolvedValueOnce(
        mockSseOkResponse(new MockReadableStream(mockChunks) as unknown as ReadableStream<Uint8Array>)
      );

      const onComplete = jest.fn();
      await streamChatMessage('q', 'sess1', { onComplete });

      expect(onComplete).toHaveBeenCalledWith(
        '답변 본문',
        expect.objectContaining({
          trace_id: 't99',
          task_plan: { pipeline_status: 'completed' },
        })
      );
    });

    it('done 페이로드 최상위에 task_plan이 있어도 onComplete에 포함해야 함', async () => {
      const mockChunks = [
        'data: {"content":"","done":true,"fullContent":"x","task_plan":{"user_goal_preview":"요약"}}\n\n',
      ];

      jest.mocked(globalThis.fetch).mockResolvedValueOnce(
        mockSseOkResponse(new MockReadableStream(mockChunks) as unknown as ReadableStream<Uint8Array>)
      );

      const onComplete = jest.fn();
      await streamChatMessage('q', 'sess2', { onComplete });

      expect(onComplete).toHaveBeenCalledWith(
        'x',
        expect.objectContaining({
          task_plan: { user_goal_preview: '요약' },
        })
      );
    });

    it('JSON 파싱 오류를 무시하고 계속 진행해야 함', async () => {
      const mockChunks = [
        'data: {"text":"Hello","done":false}\n\n',
        'invalid json\n\n',
        'data: {"text":" World","done":true}\n\n',
      ];

      jest.mocked(globalThis.fetch).mockResolvedValueOnce(
        mockSseOkResponse(new MockReadableStream(mockChunks) as unknown as ReadableStream<Uint8Array>)
      );

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await streamChatMessage('test', 'session123');

      // JSON 파싱 오류가 있어도 계속 진행되어야 함
      expect(result).toContain('Hello');
      // console.warn이 호출되었는지 확인 (파싱 오류 시)
      // 실제로는 파싱 오류가 발생하지 않을 수 있음 (라인이 data:로 시작하지 않으면 무시됨)

      consoleWarnSpy.mockRestore();
    });

    it('AbortController로 스트리밍을 취소할 수 있어야 함', async () => {
      const mockChunks = [
        'data: {"text":"Hello","done":false}\n\n',
        'data: {"text":" World","done":false}\n\n',
        'data: {"text":"!","done":true,"fullContent":"Hello World!"}\n\n',
      ];

      const mockStream = new MockReadableStream(mockChunks, 50);

      jest.mocked(globalThis.fetch).mockResolvedValueOnce(
        mockSseOkResponse(mockStream as unknown as ReadableStream<Uint8Array>)
      );

      const abortController = new AbortController();
      const onChunk = jest.fn();
      const onComplete = jest.fn();

      // 첫 번째 청크 후 취소
      setTimeout(() => {
        abortController.abort();
      }, 60);

      const result = await streamChatMessage('test', 'session123', {
        signal: abortController.signal,
        onChunk,
        onComplete,
      });

      // 취소 시 지금까지 받은 텍스트를 반환
      expect(typeof result).toBe('string');
      // onComplete는 취소 시에도 호출됨
      expect(onComplete).toHaveBeenCalled();
    });

    it('취소된 요청은 에러를 보고하지 않아야 함', async () => {
      const abortController = new AbortController();
      abortController.abort(); // 즉시 취소

      jest.mocked(globalThis.fetch).mockRejectedValueOnce(
        Object.assign(new Error('Aborted'), { name: 'AbortError' })
      );

      const onError = jest.fn();
      const onComplete = jest.fn();

      await streamChatMessage('test', 'session123', {
        signal: abortController.signal,
        onError,
        onComplete,
      });

      // AbortError는 onError를 호출하지 않고 onComplete를 호출
      expect(onError).not.toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalled();
      // errorReportingService.reportError도 호출되지 않음
      expect(errorReportingService.reportError).not.toHaveBeenCalled();
    });

    it('application/json 폴백에서 본문과 파이프라인 메타를 onComplete에 전달한다', async () => {
      jest.mocked(globalThis.fetch).mockResolvedValueOnce(
        mockJsonOkFetchResponse({
          response: '한 번에 온 답변',
          answer_mode: 'guided',
          follow_up_questions: ['추가 질문?'],
        })
      );
      const onComplete = jest.fn();
      const out = await streamChatMessage('q', 's1', { onComplete });
      expect(out).toBe('한 번에 온 답변');
      expect(onComplete).toHaveBeenCalledWith('한 번에 온 답변', {
        answer_mode: 'guided',
        follow_up_questions: ['추가 질문?'],
      });
    });

    it('application/json 폴백에서 data.response·중첩 파이프라인 메타를 병합한다', async () => {
      jest.mocked(globalThis.fetch).mockResolvedValueOnce(
        mockJsonOkFetchResponse({
          data: {
            response: '중첩 본문',
            task_plan: { task_type: 'fact_check', answer_mode: 'expert' },
            evidence_coverage: 0.9,
          },
        })
      );
      const onComplete = jest.fn();
      const out = await streamChatMessage('q', 's1', { onComplete });
      expect(out).toBe('중첩 본문');
      expect(onComplete).toHaveBeenCalledWith('중첩 본문', {
        task_plan: { task_type: 'fact_check', answer_mode: 'expert' },
        evidence_coverage: 0.9,
      });
    });

    it('application/json에 error 문자열이 있으면 onError 후 throw', async () => {
      jest.mocked(globalThis.fetch).mockResolvedValueOnce(
        mockJsonOkFetchResponse({ error: '서버 거절' })
      );
      const onError = jest.fn();
      await expect(streamChatMessage('q', 's1', { onError })).rejects.toThrow('서버 거절');
      expect(onError).toHaveBeenCalled();
      const err = onError.mock.calls[0][0] as Error;
      expect(err.message).toBe('서버 거절');
    });
  });
});

