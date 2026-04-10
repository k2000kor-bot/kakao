/// <reference types="jest" />
import {
  buildModernChatPipelineContext,
  buildChatPipelineContextFromHistory,
  coerceChatTurnsFromContextRecord,
  mergeApiChatContextPayload,
  normalizeChatTurnsForApiMerge,
  resolveMergeOptionsFromHistoryAndExplicit,
  scenarioInheritMergeOptionsFromMessages,
  scenarioInheritMergeOptionsFromPipelineLikeMessages,
  toChatTurnWithPipelineExtras,
} from '../modernChatContextBuilder';
import {
  AGENTS_QUERY_PARAM_ID,
  AGENTS_QUERY_PARAM_TYPE,
  GENSPARK_AGENTS_TYPE_SUPER_AGENT,
} from '../../config/routes';
import { GENSPARK_REFERENCE_AGENT_ID } from '../gensparkReferenceAgentPreset';
import type { Message } from '../../types';

const baseMsg = (text: string, sender: 'user' | 'ai' = 'user'): Message => ({
  id: 1,
  sender,
  text,
  timestamp: 't',
  analysis: null,
});

describe('toChatTurnWithPipelineExtras', () => {
  it('pipelineExtras를 ChatTurn에 실는다', () => {
    const t = toChatTurnWithPipelineExtras({
      role: 'assistant',
      content: '답',
      pipelineExtras: { qaPipelineTraceId: 'trace-1' },
    });
    expect(t.role).toBe('assistant');
    expect(t.content).toBe('답');
    expect(t.pipelineExtras?.qaPipelineTraceId).toBe('trace-1');
  });

  it('ai·Ai 역할을 assistant로 정규화한다', () => {
    expect(toChatTurnWithPipelineExtras({ role: 'ai', content: 'x' }).role).toBe('assistant');
    expect(toChatTurnWithPipelineExtras({ role: 'Ai', content: 'x' }).role).toBe('assistant');
  });
});

describe('buildModernChatPipelineContext', () => {
  const prev = process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;

  afterEach(() => {
    if (prev === undefined) {
      delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    } else {
      process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT = prev;
    }
  });

  it('비활성(=0)이면 undefined', () => {
    process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT = '0';
    const ctx = buildModernChatPipelineContext('질문: A\n요구사항: B', [baseMsg('x')]);
    expect(ctx).toBeUndefined();
  });

  it('일반 인사만 있으면 undefined', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const ctx = buildModernChatPipelineContext('안녕', [baseMsg('hi')]);
    expect(ctx).toBeUndefined();
  });

  it('일반 인사 + /agents?id 세션(gensparkRouteAgentId)이면 파이프라인·Genspark context 포함', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const id = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';
    const ctx = buildModernChatPipelineContext('안녕', [baseMsg('hi')], { gensparkRouteAgentId: id });
    expect(ctx).toBeDefined();
    expect(ctx?.use_pipeline_v2).toBe(true);
    expect(ctx?.agentic_genspark_style).toBe(true);
    expect(ctx?.genspark_reference_agent_id).toBe(id);
  });

  it('질문+요구 구조면 파이프라인·Genspark context 포함', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const ctx = buildModernChatPipelineContext(
      '질문: 무엇인가\n요구사항: 1페이지 요약',
      [baseMsg('이전')]
    );
    expect(ctx).toBeDefined();
    expect(ctx?.use_pipeline_v2).toBe(true);
    expect(ctx?.agentic_pipeline).toBe(true);
    expect(ctx?.agentic_genspark_style).toBe(true);
    expect(ctx?.qa_pipeline_allow_empty_project).toBe(true);
    expect(typeof ctx?.genspark_external_agent_profile).toBe('string');
  });

  it('Message.pipelineExtras가 conversation_history 턴에 포함된다', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const ai = baseMsg('어시스턴트 답', 'ai');
    ai.pipelineExtras = { qaPipelineTraceId: 'trace-from-modern-chat' };
    const ctx = buildModernChatPipelineContext('질문: x\n요구사항: y', [
      baseMsg('사용자'),
      ai,
    ]);
    const hist = ctx?.conversation_history as Array<{
      pipelineExtras?: { qaPipelineTraceId?: string };
    }>;
    expect(Array.isArray(hist)).toBe(true);
    expect(hist.some((t) => t.pipelineExtras?.qaPipelineTraceId === 'trace-from-modern-chat')).toBe(
      true
    );
  });

  it('/웹검색 의도면 파이프라인 context 포함', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const ctx = buildModernChatPipelineContext('/웹검색 오늘 날씨', []);
    expect(ctx).toBeDefined();
    expect(ctx?.use_pipeline_v2).toBe(true);
  });

  it('buildChatPipelineContextFromHistory는 턴 배열로 동일하게 동작', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const ctx = buildChatPipelineContextFromHistory('질문: x\n요구사항: y', [
      { role: 'user', content: '이전' },
      { role: 'assistant', content: '답' },
    ]);
    expect(ctx?.use_pipeline_v2).toBe(true);
    expect(Array.isArray(ctx?.conversation_history)).toBe(true);
  });

  it('conversationDeepseek로 검수 힌트 끔', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const ctx = buildChatPipelineContextFromHistory(
      '질문: x\n요구사항: y',
      [{ role: 'user', content: '이전' }],
      { conversationDeepseek: { deepseekReviewHints: false } }
    );
    expect(ctx?.deepseek_review_layer_hints).toBeUndefined();
  });

  it('buildChatPipelineContextFromHistory는 conversation_history에 pipelineExtras를 유지한다', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const ctx = buildChatPipelineContextFromHistory('질문: x\n요구사항: y', [
      {
        role: 'assistant',
        content: '답',
        pipelineExtras: { generationScenarioMarkdown: '## 파이프히스\n보존' },
      },
    ]);
    const hist = ctx?.conversation_history as Array<{ pipelineExtras?: { generationScenarioMarkdown?: string } }>;
    expect(Array.isArray(hist)).toBe(true);
    expect(String(hist[0]?.pipelineExtras?.generationScenarioMarkdown)).toContain('파이프히스');
  });

  it('buildChatPipelineContextFromHistory options.gensparkRouteAgentId를 반영한다', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const id = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';
    const ctx = buildChatPipelineContextFromHistory(
      '질문: x\n요구사항: y',
      [{ role: 'user', content: '이전' }],
      { gensparkRouteAgentId: id }
    );
    expect(ctx?.genspark_reference_agent_id).toBe(id);
    expect(String(ctx?.genspark_external_agent_profile)).toContain(id);
  });

  it('buildChatPipelineContextFromHistory는 REACT_APP_PIPELINE_VERIFIER_REWRITE 시 플래그를 넣는다', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const prev = process.env.REACT_APP_PIPELINE_VERIFIER_REWRITE;
    process.env.REACT_APP_PIPELINE_VERIFIER_REWRITE = 'true';
    try {
      const ctx = buildChatPipelineContextFromHistory('질문: x\n요구사항: y', []);
      expect(ctx?.pipeline_verifier_rewrite).toBe(true);
    } finally {
      if (prev === undefined) delete process.env.REACT_APP_PIPELINE_VERIFIER_REWRITE;
      else process.env.REACT_APP_PIPELINE_VERIFIER_REWRITE = prev;
    }
  });

  it('buildChatPipelineContextFromHistory는 REACT_APP_INCLUDE_QA_GENERATION_SCENARIO 시 옵트인을 넣는다', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const prev = process.env.REACT_APP_INCLUDE_QA_GENERATION_SCENARIO;
    process.env.REACT_APP_INCLUDE_QA_GENERATION_SCENARIO = 'true';
    try {
      const ctx = buildChatPipelineContextFromHistory('질문: x\n요구사항: y', []);
      expect(ctx?.include_generation_scenario_in_response).toBe(true);
    } finally {
      if (prev === undefined) delete process.env.REACT_APP_INCLUDE_QA_GENERATION_SCENARIO;
      else process.env.REACT_APP_INCLUDE_QA_GENERATION_SCENARIO = prev;
    }
  });

  it('mergeApiChatContextPayload가 context.genspark_route_agent_id로 Genspark 참조 id를 맞춘다', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const id = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';
    const out = mergeApiChatContextPayload(
      '질문: a\n요구사항: b',
      { genspark_route_agent_id: id },
      []
    );
    expect(out.contextForBody?.genspark_reference_agent_id).toBe(id);
    expect(String(out.contextForBody?.genspark_external_agent_profile)).toContain(id);
  });

  it('mergeApiChatContextPayload: 짧은 인사 + genspark_route_agent_id만 있어도 파이프라인·프로필을 넣는다', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const id = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';
    const out = mergeApiChatContextPayload('안녕', { genspark_route_agent_id: id }, []);
    expect(out.contextForBody?.use_pipeline_v2).toBe(true);
    expect(out.contextForBody?.agentic_genspark_style).toBe(true);
    expect(out.contextForBody?.genspark_reference_agent_id).toBe(id);
    expect(String(out.contextForBody?.genspark_external_agent_profile)).toContain(id);
  });

  it('mergeApiChatContextPayload: genspark_reference_agent_id만 있어도 라우트 세션으로 파이프라인을 맞춘다', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const id = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';
    const out = mergeApiChatContextPayload('hi', { genspark_reference_agent_id: id }, []);
    expect(out.contextForBody?.use_pipeline_v2).toBe(true);
    expect(out.contextForBody?.genspark_reference_agent_id).toBe(id);
  });

  it('mergeApiChatContextPayload: GENSPARK_DISABLE_WINDOW면 URL의 id가 있어도 빈 context에 genspark_*를 넣지 않는다', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const prevEnv = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    const prevPath = `${window.location.pathname}${window.location.search}`;
    process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
    try {
      window.history.replaceState(
        {},
        '',
        `/?${AGENTS_QUERY_PARAM_ID}=7c36051a-2b94-4e9e-bd36-05dfabfe3e07`,
      );
      const out = mergeApiChatContextPayload('안녕', {}, []);
      expect(out.contextForBody?.genspark_route_agent_id).toBeUndefined();
      expect(out.contextForBody?.genspark_reference_agent_id).toBeUndefined();
    } finally {
      window.history.replaceState({}, '', prevPath);
      if (prevEnv === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevEnv;
    }
  });

  it('mergeApiChatContextPayload: URL에 type=super_agent만 있으면 참조 Super Agent id로 window 보강한다', () => {
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
      const out = mergeApiChatContextPayload('안녕', {}, []);
      expect(out.contextForBody?.genspark_reference_agent_id).toBe(GENSPARK_REFERENCE_AGENT_ID);
      expect(out.contextForBody?.genspark_route_agent_id).toBe(GENSPARK_REFERENCE_AGENT_ID);
    } finally {
      window.history.replaceState({}, '', prevPath);
      if (prevEnv === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevEnv;
    }
  });

  it('mergeApiChatContextPayload: GENSPARK_DISABLE이면 URL의 type=super_agent만 있어도 genspark_*를 넣지 않는다', () => {
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
      const out = mergeApiChatContextPayload('안녕', {}, []);
      expect(out.contextForBody?.genspark_route_agent_id).toBeUndefined();
      expect(out.contextForBody?.genspark_reference_agent_id).toBeUndefined();
    } finally {
      window.history.replaceState({}, '', prevPath);
      if (prevEnv === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevEnv;
    }
  });

  it('mergeApiChatContextPayload: GENSPARK_DISABLE_WINDOW + buildModernChatPipelineContext여도 URL ?id=가 route/reference로 섞이지 않는다', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const windowUuid = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';
    const prevEnv = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    const prevPath = `${window.location.pathname}${window.location.search}`;
    process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
    try {
      window.history.replaceState({}, '', `/?${AGENTS_QUERY_PARAM_ID}=${windowUuid}`);
      const pipe = buildModernChatPipelineContext('질문: a\n요구사항: b', [baseMsg('u', 'user')]);
      expect(pipe).toBeDefined();
      const out = mergeApiChatContextPayload(
        '질문: a\n요구사항: b',
        pipe as Record<string, unknown>,
        []
      );
      expect(out.contextForBody?.genspark_route_agent_id).not.toBe(windowUuid);
      expect(out.contextForBody?.genspark_reference_agent_id).not.toBe(windowUuid);
    } finally {
      window.history.replaceState({}, '', prevPath);
      if (prevEnv === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevEnv;
    }
  });

  it('mergeApiChatContextPayload는 quality를 본문에서 분리한다', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const out = mergeApiChatContextPayload(
      '질문: z\n요구사항: w',
      { quality: 'ultimate', custom: true },
      []
    );
    expect(out.quality).toBe('ultimate');
    expect(out.contextForBody?.use_pipeline_v2).toBe(true);
    expect(out.contextForBody?.custom).toBe(true);
    expect(out.contextForBody?.quality).toBeUndefined();
  });

  it('context.conversation_history만 있어도 파이프라인 턴으로 병합한다', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const turns = [{ role: 'user' as const, content: '이전' }];
    expect(coerceChatTurnsFromContextRecord({ conversation_history: turns })).toEqual(turns);
    const out = mergeApiChatContextPayload(
      '질문: a\n요구사항: b',
      { conversation_history: turns, extra: 1 },
      []
    );
    expect(out.contextForBody?.use_pipeline_v2).toBe(true);
    expect(Array.isArray(out.contextForBody?.conversation_history)).toBe(true);
  });

  it('파이프라인이 비어도 번호 다중 요청이면 merge에 multi_request·적응 지시 포함', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const out = mergeApiChatContextPayload('1. 첫 항목\n2. 둘째 항목', {}, []);
    expect(out.contextForBody?.multi_request_mode).toBe(true);
    expect(Array.isArray(out.contextForBody?.multi_request_items)).toBe(true);
    expect(String(out.contextForBody?.multi_request_adaptation_instruction)).toContain(
      'multi_request_items'
    );
  });

  it('REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT=0이면 merge가 multi_request를 추가하지 않는다', () => {
    process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT = '0';
    const out = mergeApiChatContextPayload('1. a\n2. b', {}, []);
    expect(out.contextForBody?.multi_request_mode).toBeUndefined();
  });

  it('파이프라인 없이도 대화 턴·original_user_message를 context에 넣는다', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const hist = [
      { role: 'user' as const, content: '이전 질문' },
      { role: 'assistant' as const, content: '이전 답' },
    ];
    const out = mergeApiChatContextPayload('안녕', {}, hist);
    expect(out.contextForBody?.original_user_message).toBe('안녕');
    expect(out.contextForBody?.conversation_history).toEqual(hist);
  });

  it('REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO 시 merge가 직전 시나리오를 client_generation_scenario로 넣는다', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const prevInherit = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
    process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
    try {
      const out = mergeApiChatContextPayload(
        '질문: 후속\n요구사항: 이어서',
        {},
        [],
        {
          recentMessagesForScenarioInherit: [
            { role: 'user' },
            {
              role: 'assistant',
              pipelineExtras: { generationScenarioMarkdown: '## 이전 시나리오\n본문' },
            },
          ],
        }
      );
      expect(out.contextForBody?.client_generation_scenario).toContain('이전 시나리오');
    } finally {
      if (prevInherit === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prevInherit;
    }
  });

  it('coerceChatTurnsFromContextRecord가 context.messages 별칭과 pipelineExtras를 보존한다', () => {
    const turns = coerceChatTurnsFromContextRecord({
      messages: [
        {
          role: 'assistant',
          content: '답',
          pipelineExtras: { generationScenarioMarkdown: '## messages키\n별칭' },
        },
      ],
    });
    expect(turns).toHaveLength(1);
    expect(turns[0].role).toBe('assistant');
    expect(String(turns[0].pipelineExtras?.generationScenarioMarkdown)).toContain('messages키');
  });

  it('coerceChatTurnsFromContextRecord가 conversationHistory(camelCase)와 pipelineExtras를 보존한다', () => {
    const turns = coerceChatTurnsFromContextRecord({
      conversationHistory: [
        {
          role: 'assistant',
          content: '답',
          pipelineExtras: { generationScenarioMarkdown: '## camel\n히스토리' },
        },
      ],
    });
    expect(turns).toHaveLength(1);
    expect(turns[0].role).toBe('assistant');
    expect(String(turns[0].pipelineExtras?.generationScenarioMarkdown)).toContain('camel');
  });

  it('context.conversation_history의 pipelineExtras만으로(4번째 인자 없이) 상속 시 client_generation_scenario를 넣는다', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const prevInherit = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
    process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
    try {
      const out = mergeApiChatContextPayload('질문: 후속\n요구사항: 이어서', {
        conversation_history: [
          {
            role: 'assistant',
            content: '이전 답',
            pipelineExtras: { generationScenarioMarkdown: '## 컨텍스트만\n시나리오' },
          },
        ],
      });
      expect(String(out.contextForBody?.client_generation_scenario)).toContain('컨텍스트만');
    } finally {
      if (prevInherit === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prevInherit;
    }
  });

  it('context.messages의 pipelineExtras만으로(3·4번째 인자 없이) 상속 시 client_generation_scenario를 넣는다', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const prevInherit = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
    process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
    try {
      const out = mergeApiChatContextPayload('질문: 후속\n요구사항: 이어서', {
        messages: [
          {
            role: 'assistant',
            content: '이전 답',
            pipelineExtras: { generationScenarioMarkdown: '## mergeMessages키\n시나리오' },
          },
        ],
      });
      expect(String(out.contextForBody?.client_generation_scenario)).toContain('mergeMessages키');
    } finally {
      if (prevInherit === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prevInherit;
    }
  });

  it('context.conversationHistory(camelCase)의 pipelineExtras만으로(3·4번째 인자 없이) 상속 시 client_generation_scenario를 넣는다', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const prevInherit = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
    process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
    try {
      const out = mergeApiChatContextPayload('질문: 후속\n요구사항: 이어서', {
        conversationHistory: [
          {
            role: 'assistant',
            content: '이전 답',
            pipelineExtras: { generationScenarioMarkdown: '## camelCtx\n전용' },
          },
        ],
      });
      expect(String(out.contextForBody?.client_generation_scenario)).toContain('camelCtx');
    } finally {
      if (prevInherit === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prevInherit;
    }
  });

  it('context에 client_generation_scenario가 있으면 상속으로 덮어쓰지 않는다', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const prevInherit = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
    process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
    try {
      const out = mergeApiChatContextPayload(
        '질문: x\n요구사항: y',
        { client_generation_scenario: '명시 시나리오' },
        [],
        {
          recentMessagesForScenarioInherit: [
            {
              role: 'assistant',
              pipelineExtras: { generationScenarioMarkdown: '## 무시됨' },
            },
          ],
        }
      );
      expect(out.contextForBody?.client_generation_scenario).toBe('명시 시나리오');
    } finally {
      if (prevInherit === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prevInherit;
    }
  });

  it('recentMessagesForScenarioInherit가 빈 배열이면 embedded 시나리오가 있어도 client_generation_scenario를 채우지 않는다', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const prevInherit = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
    process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
    try {
      const out = mergeApiChatContextPayload(
        '질문: 후속\n요구사항: 이어서',
        {
          conversation_history: [
            {
              role: 'assistant',
              content: '답',
              pipelineExtras: { generationScenarioMarkdown: '## 막힘\n시나리오' },
            },
          ],
        },
        [],
        { recentMessagesForScenarioInherit: [] }
      );
      expect(out.contextForBody?.client_generation_scenario).toBeUndefined();
    } finally {
      if (prevInherit === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prevInherit;
    }
  });

  it('normalizeChatTurnsForApiMerge가 Assistant·ai 역할을 assistant로 맞춘다', () => {
    const out = normalizeChatTurnsForApiMerge([
      { role: 'Assistant', content: '답' },
      { role: 'AI', content: '둘' },
      { role: 'user', content: '질' },
    ]);
    expect(out[0].role).toBe('assistant');
    expect(out[1].role).toBe('assistant');
    expect(out[2].role).toBe('user');
  });

  it('resolveMergeOptionsFromHistoryAndExplicit는 explicit가 있으면 embedded 유도를 건너뛴다', () => {
    const prev = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
    process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
    try {
      const hist = normalizeChatTurnsForApiMerge([
        {
          role: 'assistant',
          content: 'x',
          pipelineExtras: { generationScenarioMarkdown: '## A' },
        },
      ]);
      const explicit = {
        recentMessagesForScenarioInherit: [{ role: 'user' as const }],
      };
      expect(resolveMergeOptionsFromHistoryAndExplicit(hist, explicit)).toBe(explicit);
    } finally {
      if (prev === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prev;
    }
  });

  it('role이 Assistant여도 상속 env 시 merge가 시나리오를 넣는다', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const prevInherit = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
    process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
    try {
      const history = normalizeChatTurnsForApiMerge([
        {
          role: 'Assistant',
          content: '이전',
          pipelineExtras: { generationScenarioMarkdown: '## 대소문자역할\n시나리오' },
        },
      ]);
      const mergeOpts = resolveMergeOptionsFromHistoryAndExplicit(history, undefined);
      const out = mergeApiChatContextPayload(
        '질문: 후속\n요구사항: 이어서',
        {},
        history,
        mergeOpts
      );
      expect(String(out.contextForBody?.client_generation_scenario)).toContain('대소문자역할');
    } finally {
      if (prevInherit === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prevInherit;
    }
  });

  it('scenarioInheritMergeOptionsFromPipelineLikeMessages가 role·sender·type 별칭을 정규화한다', () => {
    const prev = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
    process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
    try {
      const opt = scenarioInheritMergeOptionsFromPipelineLikeMessages([
        { role: 'Assistant', pipelineExtras: { generationScenarioMarkdown: '## 파이프라인UI\n시나리오' } },
        { sender: 'ai', pipelineExtras: null },
        { type: 'ai', pipelineExtras: { generationScenarioMarkdown: '## type필드' } },
      ]);
      expect(opt?.recentMessagesForScenarioInherit?.[0]?.role).toBe('assistant');
      expect(opt?.recentMessagesForScenarioInherit?.[1]?.role).toBe('assistant');
      expect(opt?.recentMessagesForScenarioInherit?.[2]?.role).toBe('assistant');
    } finally {
      if (prev === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prev;
    }
  });

  it('scenarioInheritMergeOptionsFromMessages는 env가 꺼져 있으면 undefined', () => {
    const prev = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
    delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
    try {
      expect(
        scenarioInheritMergeOptionsFromMessages([
          { role: 'assistant', pipelineExtras: { generationScenarioMarkdown: 'x' } },
        ])
      ).toBeUndefined();
    } finally {
      if (prev === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prev;
    }
  });

  it('scenarioInheritMergeOptionsFromMessages는 env 켜짐·비어 있지 않으면 옵션 객체를 반환한다', () => {
    const prev = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
    process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
    try {
      const out = scenarioInheritMergeOptionsFromMessages([
        { role: 'assistant', pipelineExtras: { generationScenarioMarkdown: '## A' } },
      ]);
      expect(out?.recentMessagesForScenarioInherit?.length).toBe(1);
    } finally {
      if (prev === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prev;
    }
  });

  it('REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO 시 Modern 메시지에서 시나리오를 context에 넣는다', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const prevInherit = process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
    process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = 'true';
    try {
      const aiMsg: Message = {
        ...baseMsg('답', 'ai'),
        pipelineExtras: { generationScenarioMarkdown: '## 모던 시나리오' },
      };
      const ctx = buildModernChatPipelineContext('질문: a\n요구사항: b', [baseMsg('u'), aiMsg]);
      expect(ctx?.client_generation_scenario).toContain('모던 시나리오');
    } finally {
      if (prevInherit === undefined) delete process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO;
      else process.env.REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO = prevInherit;
    }
  });
});
