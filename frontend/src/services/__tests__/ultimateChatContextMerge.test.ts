/// <reference types="jest" />
/**
 * `UltimateChatGPTInterface` 비스트리밍 전송의 `buildUnifiedChatContext` + extras + `mergeApiChatContextPayload` 계약.
 * `multilayer_style_hint`·`postChatJsonWithFallback`는 생략한다.
 */
import { resolveDeepseekFlagsForConversation } from '../../config/deepseekUiDefaults';
import {
  AGENTS_QUERY_PARAM_ID,
  AGENTS_QUERY_PARAM_TYPE,
  GENSPARK_AGENTS_TYPE_SUPER_AGENT,
} from '../../config/routes';
import { GENSPARK_REFERENCE_AGENT_ID } from '../gensparkReferenceAgentPreset';
import {
  buildFeatureContextFromMessage,
  parseInputIntent,
  parseQuestionRequirementSections,
} from '../../utils/chatInputUtils';
import { buildUnifiedChatContext } from '../generationPromptBuilder';
import { resolveGensparkAgentIdFromWindowSearch } from '../gensparkAgentRegistry';
import {
  mergeApiChatContextPayload,
  normalizeChatTurnsForApiMerge,
  resolveMergeOptionsFromHistoryAndExplicit,
  scenarioInheritMergeOptionsFromPipelineLikeMessages,
  type ChatTurn,
} from '../modernChatContextBuilder';

function ultimateStyleMergeOutput(
  trimmed: string,
  conversationHistory: ChatTurn[],
  /** 시나리오 상속용 — Ultimate의 `messagesForContext`와 동일 역할 */
  pipelineLikeMessagesForScenario: readonly {
    role?: string;
    sender?: string;
    type?: string;
    pipelineExtras?: unknown;
  }[]
): ReturnType<typeof mergeApiChatContextPayload> {
  const hasProject = false;
  const agentRouteId = resolveGensparkAgentIdFromWindowSearch();
  const agentGensparkSession = Boolean(agentRouteId);
  const featureCtx = buildFeatureContextFromMessage(trimmed);
  const parsedSections = parseQuestionRequirementSections(trimmed);
  const inputIntent = parseInputIntent(trimmed);
  const parsedInput =
    parsedSections.hasBoth || inputIntent.type !== 'general'
      ? {
          question: parsedSections.question || inputIntent.question || undefined,
          requirements: parsedSections.requirements || inputIntent.requirements || undefined,
          intent_type: inputIntent.type,
          intent_confidence: inputIntent.confidence,
        }
      : undefined;
  const wantsPipelineWithoutProject =
    !hasProject &&
    (!!parsedInput ||
      !!(featureCtx as Record<string, unknown>).prefer_informed_answer ||
      !!(featureCtx as Record<string, unknown>).enable_web_research);
  const useQaPipeline = hasProject || wantsPipelineWithoutProject || agentGensparkSession;
  const ds = resolveDeepseekFlagsForConversation(undefined);
  const context = buildUnifiedChatContext(trimmed, {
    conversationHistory: conversationHistory.length > 0 ? conversationHistory : undefined,
    useQuestionAnswerPipeline: useQaPipeline,
    agenticGensparkStyle: useQaPipeline,
    qaPipelineAllowEmptyProject:
      !hasProject && (wantsPipelineWithoutProject || agentGensparkSession) ? true : undefined,
    ...(agentRouteId ? { gensparkRouteAgentId: agentRouteId } : {}),
    deepSeekReviewLayerHints: useQaPipeline && ds.review,
    pipelineDeepSeekRefine: useQaPipeline && ds.refine,
    pipelineDeepSeekReasoner: useQaPipeline && ds.reasoner,
    skipWriterLlmPolish:
      useQaPipeline && process.env.REACT_APP_PIPELINE_SKIP_WRITER_POLISH === 'true',
    ...(useQaPipeline && process.env.REACT_APP_PIPELINE_VERIFIER_REWRITE === 'true'
      ? { pipelineVerifierRewrite: true }
      : {}),
    ...(useQaPipeline && process.env.REACT_APP_INCLUDE_QA_GENERATION_SCENARIO === 'true'
      ? { includeGenerationScenarioInResponse: true }
      : {}),
    project: undefined,
  });
  const contextWithExtras: Record<string, unknown> = {
    ...context,
    project: undefined,
    files: [],
    model: 'gpt-4',
  };
  const scenarioMergeOpts = scenarioInheritMergeOptionsFromPipelineLikeMessages(
    pipelineLikeMessagesForScenario
  );
  const mergeOpts = resolveMergeOptionsFromHistoryAndExplicit(conversationHistory, scenarioMergeOpts);
  return mergeApiChatContextPayload(
    trimmed,
    contextWithExtras,
    conversationHistory.length > 0 ? conversationHistory : undefined,
    mergeOpts
  );
}

describe('UltimateChatGPTInterface-style context merge (Genspark)', () => {
  const WINDOW_UUID = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';
  const trimmed = '질문: a\n요구사항: b';
  const emptyHist: ChatTurn[] = [];

  it('GENSPARK_DISABLE_WINDOW=1이면 URL ?id=가 있어도 merge 결과에 해당 UUID가 route/reference로 끼지 않는다', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const prevEnv = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    const prevPath = `${window.location.pathname}${window.location.search}`;
    process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
    try {
      window.history.replaceState({}, '', `/?${AGENTS_QUERY_PARAM_ID}=${WINDOW_UUID}`);
      const out = ultimateStyleMergeOutput(trimmed, emptyHist, []);
      expect(out.contextForBody?.genspark_route_agent_id).not.toBe(WINDOW_UUID);
      expect(out.contextForBody?.genspark_reference_agent_id).not.toBe(WINDOW_UUID);
    } finally {
      window.history.replaceState({}, '', prevPath);
      if (prevEnv === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevEnv;
    }
  });

  it('창 URL ?id=가 있고 disable가 꺼져 있으면 Ultimate와 같이 해당 id로 Genspark 세션을 맞춘다', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const prevEnv = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    const prevPath = `${window.location.pathname}${window.location.search}`;
    if (prevEnv !== undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    try {
      window.history.replaceState({}, '', `/?${AGENTS_QUERY_PARAM_ID}=${WINDOW_UUID}`);
      const out = ultimateStyleMergeOutput(trimmed, emptyHist, []);
      expect(out.contextForBody?.genspark_reference_agent_id).toBe(WINDOW_UUID);
      expect(String(out.contextForBody?.genspark_external_agent_profile ?? '')).toContain(WINDOW_UUID);
    } finally {
      window.history.replaceState({}, '', prevPath);
      if (prevEnv === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevEnv;
    }
  });

  it('대화 턴이 있어도 Ultimate와 동일하게 normalize 후 merge한다', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const hist = normalizeChatTurnsForApiMerge([
      { role: 'user', content: '이전' },
      { role: 'assistant', content: '답' },
    ]);
    const scenarioMsgs = [{ role: 'user' }, { role: 'assistant', pipelineExtras: undefined }];
    const out = ultimateStyleMergeOutput(trimmed, hist, scenarioMsgs);
    expect(Array.isArray(out.contextForBody?.conversation_history)).toBe(true);
  });

  it('URL type=super_agent만 있으면 Ultimate와 같이 참조 Super Agent id로 Genspark 세션을 맞춘다', () => {
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
      const out = ultimateStyleMergeOutput('안녕', emptyHist, []);
      expect(out.contextForBody?.genspark_reference_agent_id).toBe(GENSPARK_REFERENCE_AGENT_ID);
      expect(out.contextForBody?.genspark_route_agent_id).toBe(GENSPARK_REFERENCE_AGENT_ID);
    } finally {
      window.history.replaceState({}, '', prevPath);
      if (prevEnv === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevEnv;
    }
  });

  it('GENSPARK_DISABLE이면 type=super_agent만 있어도 Ultimate merge에 Genspark 라우트가 끼지 않는다', () => {
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
      const out = ultimateStyleMergeOutput('안녕', emptyHist, []);
      expect(out.contextForBody?.genspark_route_agent_id).toBeUndefined();
      expect(out.contextForBody?.genspark_reference_agent_id).toBeUndefined();
    } finally {
      window.history.replaceState({}, '', prevPath);
      if (prevEnv === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevEnv;
    }
  });
});
