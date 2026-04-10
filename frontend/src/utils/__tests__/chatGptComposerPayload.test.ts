import { API_QUERY_PARAM_PROJECT_ID } from '../../config/api';
import {
  AGENTS_QUERY_PARAM_ID,
  AGENTS_QUERY_PARAM_TYPE,
  GENSPARK_AGENTS_TYPE_SUPER_AGENT,
} from '../../config/routes';
import { GENSPARK_REFERENCE_AGENT_ID } from '../../services/gensparkReferenceAgentPreset';
import { buildGensparkRouteAgentContext } from '../../services/gensparkAgentRegistry';
import {
  buildModernChatPipelineContext,
  scenarioInheritMergeOptionsFromPipelineLikeMessages,
} from '../../services/modernChatContextBuilder';
import type { Message } from '../../types';
import {
  COMPOSER_CHAT_CREATIVITY_BODY,
  buildChatGptNonStreamPostPayload,
  buildComposerNonStreamChatExtras,
  buildComposerStreamChatRequestBody,
} from '../chatGptComposerPayload';
import { DEFAULT_CHAT_PERSPECTIVE, DEFAULT_CHAT_RESPONSE_STYLE } from '../modernChatUrlStyle';

describe('chatGptComposerPayload', () => {
  it('COMPOSER_CHAT_CREATIVITY_BODY에 max_tokens·창의성 플래그가 있다', () => {
    expect(COMPOSER_CHAT_CREATIVITY_BODY.max_tokens).toBe(16384);
    expect(COMPOSER_CHAT_CREATIVITY_BODY.enable_creative_variations).toBe(true);
    expect(COMPOSER_CHAT_CREATIVITY_BODY.auto_format_detection).toBe(true);
  });

  describe('buildComposerNonStreamChatExtras', () => {
    it('perspective가 null이면 DEFAULT_CHAT_PERSPECTIVE를 쓴다', () => {
      const ex = buildComposerNonStreamChatExtras({
        conversationId: 'c1',
        requestId: 'r1',
        responseStyle: 'concise',
        perspective: null,
        diversityLevel: 'varied',
        temperature: 0.9,
      });
      expect(ex.perspective).toBe(DEFAULT_CHAT_PERSPECTIVE);
      expect(ex.response_style).toBe('concise');
      expect(ex.conversation_id).toBe('c1');
      expect(ex.diversity_level).toBe('varied');
      expect(ex.max_tokens).toBe(16384);
    });

    it('projectId가 있으면 API_QUERY_PARAM_PROJECT_ID 키를 넣는다', () => {
      const ex = buildComposerNonStreamChatExtras({
        conversationId: 'c1',
        requestId: 'r1',
        responseStyle: 'balanced',
        perspective: 'creative',
        diversityLevel: 'stable',
        temperature: 1,
        projectId: 'proj-99',
      });
      expect(ex[API_QUERY_PARAM_PROJECT_ID]).toBe('proj-99');
    });
  });

  describe('buildComposerStreamChatRequestBody', () => {
    it('handleMultipleQuestions가 true일 때만 handle_multiple_questions를 넣는다', () => {
      const baseArgs = {
        quality: 'enhanced',
        conversationId: 'c2',
        context: { foo: 1 },
        requestId: 'r2',
        responseStyle: 'detailed' as const,
        perspective: 'empathetic' as const,
        diversityLevel: 'exploratory' as const,
        temperature: 0.7,
      };
      const without = buildComposerStreamChatRequestBody(baseArgs);
      expect(without.handle_multiple_questions).toBeUndefined();

      const withMulti = buildComposerStreamChatRequestBody({
        ...baseArgs,
        handleMultipleQuestions: true,
      });
      expect(withMulti.handle_multiple_questions).toBe(true);
      expect(withMulti.context).toEqual({ foo: 1 });
    });
  });

  describe('buildChatGptNonStreamPostPayload', () => {
    it('extra가 기본 response_style·perspective를 덮어쓸 수 있다', () => {
      const payload = buildChatGptNonStreamPostPayload(
        'hello',
        'basic',
        {},
        {
          conversation_id: 'c3',
          response_style: 'comprehensive',
          perspective: 'critical',
        }
      );
      expect(payload.message).toBe('hello');
      expect(payload.quality).toBeDefined();
      expect(payload.response_style).toBe('comprehensive');
      expect(payload.perspective).toBe('critical');
    });

    it('extra가 없으면 merge 결과 위에 기본 스타일·관점이 깔린 뒤 빈 extra만 병합된다', () => {
      const payload = buildChatGptNonStreamPostPayload('x', 'basic', {}, {});
      expect(payload.response_style).toBe(DEFAULT_CHAT_RESPONSE_STYLE);
      expect(payload.perspective).toBe(DEFAULT_CHAT_PERSPECTIVE);
    });

    it('짧은 인사 + Genspark 라우트 context면 merge 후 파이프라인·참조 id가 context에 포함된다', () => {
      const id = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';
      const ctx = { ...buildGensparkRouteAgentContext(id) };
      const payload = buildChatGptNonStreamPostPayload('안녕', 'enhanced', ctx, {});
      const body = payload.context as Record<string, unknown>;
      expect(body.use_pipeline_v2).toBe(true);
      expect(body.agentic_genspark_style).toBe(true);
      expect(body.genspark_reference_agent_id).toBe(id);
      expect(String(body.genspark_external_agent_profile)).toContain(id);
    });

    // ChatGPTInterface 등 비스트리밍 Composer도 동일 빌더·merge 경로를 씀
    it('REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT=1이면 URL에 id가 있어도 빈 context merge 시 genspark_*를 넣지 않는다', () => {
      const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
      try {
        window.history.replaceState(
          {},
          '',
          `/?${AGENTS_QUERY_PARAM_ID}=7c36051a-2b94-4e9e-bd36-05dfabfe3e07`,
        );
        const payload = buildChatGptNonStreamPostPayload('안녕', 'basic', {}, {});
        const body = payload.context as Record<string, unknown> | undefined;
        expect(body?.genspark_route_agent_id).toBeUndefined();
        expect(body?.genspark_reference_agent_id).toBeUndefined();
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
      }
    });

    it('buildChatGptNonStreamPostPayload: URL type=super_agent만 있으면 context에 참조 Super Agent id가 실린다', () => {
      const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      if (prevDisable !== undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      try {
        window.history.replaceState(
          {},
          '',
          `/?${AGENTS_QUERY_PARAM_TYPE}=${encodeURIComponent(GENSPARK_AGENTS_TYPE_SUPER_AGENT)}`,
        );
        const payload = buildChatGptNonStreamPostPayload('안녕', 'basic', {}, {});
        const body = payload.context as Record<string, unknown> | undefined;
        expect(body?.genspark_reference_agent_id).toBe(GENSPARK_REFERENCE_AGENT_ID);
        expect(body?.genspark_route_agent_id).toBe(GENSPARK_REFERENCE_AGENT_ID);
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
      }
    });

    it('buildChatGptNonStreamPostPayload: GENSPARK_DISABLE이면 type=super_agent만 있어도 genspark_*를 넣지 않는다', () => {
      const prevDisable = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      const prevPath = `${window.location.pathname}${window.location.search}`;
      process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
      try {
        window.history.replaceState(
          {},
          '',
          `/?${AGENTS_QUERY_PARAM_TYPE}=${encodeURIComponent(GENSPARK_AGENTS_TYPE_SUPER_AGENT)}`,
        );
        const payload = buildChatGptNonStreamPostPayload('안녕', 'basic', {}, {});
        const body = payload.context as Record<string, unknown> | undefined;
        expect(body?.genspark_route_agent_id).toBeUndefined();
        expect(body?.genspark_reference_agent_id).toBeUndefined();
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
      }
    });

    it('ModernChat 파이프라인 context를 넣으면 GENSPARK_DISABLE 시 URL id가 merge에 끼지 않는다', () => {
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
        const pipe = buildModernChatPipelineContext('질문: a\n요구사항: b', recent);
        expect(pipe).toBeDefined();
        const mergeOpts = scenarioInheritMergeOptionsFromPipelineLikeMessages(recent);
        const payload = buildChatGptNonStreamPostPayload(
          '질문: a\n요구사항: b',
          'enhanced',
          pipe as Record<string, unknown>,
          {},
          mergeOpts
        );
        const body = payload.context as Record<string, unknown>;
        expect(body?.genspark_route_agent_id).not.toBe(windowUuid);
        expect(body?.genspark_reference_agent_id).not.toBe(windowUuid);
      } finally {
        window.history.replaceState({}, '', prevPath);
        if (prevDisable === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
        else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevDisable;
      }
    });

    it('ModernChat 파이프라인 옵션(gensparkRouteAgentId)을 context로 넣으면 Composer 비스트리밍 본문이 해당 에이전트로 맞춰진다', () => {
      delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
      const routeId = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';
      const pipe = buildModernChatPipelineContext('질문: a\n요구사항: b', [], {
        gensparkRouteAgentId: routeId,
      });
      expect(pipe).toBeDefined();
      const payload = buildChatGptNonStreamPostPayload(
        '질문: a\n요구사항: b',
        'enhanced',
        pipe as Record<string, unknown>,
        {}
      );
      const body = payload.context as Record<string, unknown>;
      expect(body?.genspark_reference_agent_id).toBe(routeId);
      expect(String(body?.genspark_external_agent_profile ?? '')).toContain(routeId);
    });
  });
});
