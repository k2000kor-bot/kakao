/// <reference types="jest" />
/**
 * `FileAnalysisChatSystem` 비스트리밍 전송과 동일한 데이터 경로(창 URL 에이전트 id → unified context → merge) 계약.
 * `enrichChatContextRecordWithOptionalMultilayerStyleHint`는 네트워크/스타일 분석에 따라 달라질 수 있어 생략한다.
 */
import {
  AGENTS_QUERY_PARAM_ID,
  AGENTS_QUERY_PARAM_TYPE,
  GENSPARK_AGENTS_TYPE_SUPER_AGENT,
} from '../../config/routes';
import { GENSPARK_REFERENCE_AGENT_ID } from '../gensparkReferenceAgentPreset';
import { resolveDeepseekFlagsForConversation } from '../../config/deepseekUiDefaults';
import { buildUnifiedChatContext } from '../generationPromptBuilder';
import { mergeApiChatContextPayload } from '../modernChatContextBuilder';
import { resolveGensparkAgentIdFromWindowSearch } from '../gensparkAgentRegistry';

const WINDOW_AGENT_UUID = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';

function gensparkContextSlice(ctx: Record<string, unknown> | undefined) {
  return {
    route: ctx?.genspark_route_agent_id,
    ref: ctx?.genspark_reference_agent_id,
    profile: String(ctx?.genspark_external_agent_profile ?? ''),
  };
}

function buildFileAnalysisStyleContextRecord(promptInput: string): Record<string, unknown> {
  const ds = resolveDeepseekFlagsForConversation(undefined);
  const agentRouteId = resolveGensparkAgentIdFromWindowSearch();
  /** 질문+요구 프롬프트로 `FileAnalysisChatSystem`과 같이 파이프라인을 켠 상태를 가정 */
  const useQaPipeline = true;

  const context = buildUnifiedChatContext(promptInput, {
    conversationHistory: undefined,
    deepSeekReviewLayerHints: useQaPipeline && ds.review,
    pipelineDeepSeekRefine: useQaPipeline && ds.refine,
    pipelineDeepSeekReasoner: useQaPipeline && ds.reasoner,
    ...(useQaPipeline
      ? {
          useQuestionAnswerPipeline: true,
          agenticGensparkStyle: true,
          qaPipelineAllowEmptyProject: true,
          ...(agentRouteId ? { gensparkRouteAgentId: agentRouteId } : {}),
          skipWriterLlmPolish: process.env.REACT_APP_PIPELINE_SKIP_WRITER_POLISH === 'true',
          ...(process.env.REACT_APP_PIPELINE_VERIFIER_REWRITE === 'true'
            ? { pipelineVerifierRewrite: true }
            : {}),
          ...(process.env.REACT_APP_INCLUDE_QA_GENERATION_SCENARIO === 'true'
            ? { includeGenerationScenarioInResponse: true }
            : {}),
        }
      : {}),
  });

  return {
    ...context,
    project_files: [{ name: 'sample.txt', type: 'text/plain' }],
  };
}

describe('FileAnalysisChatSystem-style context merge (Genspark window 계약)', () => {
  const prevPath = () => `${window.location.pathname}${window.location.search}`;

  it('GENSPARK_DISABLE_WINDOW=1이면 URL ?id=가 있어도 merge 결과에 해당 UUID가 route/reference로 끼지 않는다', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const prevEnv = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    const path = prevPath();
    process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
    try {
      window.history.replaceState({}, '', `/?${AGENTS_QUERY_PARAM_ID}=${WINDOW_AGENT_UUID}`);
      expect(resolveGensparkAgentIdFromWindowSearch()).toBeNull();

      const promptInput = '질문: 요약\n요구사항: 한 문장';
      const seed = buildFileAnalysisStyleContextRecord(promptInput);
      const { contextForBody } = mergeApiChatContextPayload(promptInput, seed, []);

      expect(contextForBody?.genspark_route_agent_id).not.toBe(WINDOW_AGENT_UUID);
      expect(contextForBody?.genspark_reference_agent_id).not.toBe(WINDOW_AGENT_UUID);
      expect(Array.isArray(contextForBody?.project_files)).toBe(true);
    } finally {
      window.history.replaceState({}, '', path);
      if (prevEnv === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevEnv;
    }
  });

  it('창 URL ?id=가 있고 disable가 꺼져 있으면 FileAnalysis와 같이 해당 id로 Genspark 세션을 맞춘다', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const prevEnv = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    const path = prevPath();
    if (prevEnv !== undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    try {
      window.history.replaceState({}, '', `/?${AGENTS_QUERY_PARAM_ID}=${WINDOW_AGENT_UUID}`);
      expect(resolveGensparkAgentIdFromWindowSearch()).toBe(WINDOW_AGENT_UUID);

      const promptInput = '질문: 요약\n요구사항: 한 문장';
      const seed = buildFileAnalysisStyleContextRecord(promptInput);
      const { contextForBody } = mergeApiChatContextPayload(promptInput, seed, []);

      expect(contextForBody?.genspark_reference_agent_id).toBe(WINDOW_AGENT_UUID);
      expect(String(contextForBody?.genspark_external_agent_profile ?? '')).toContain(WINDOW_AGENT_UUID);
    } finally {
      window.history.replaceState({}, '', path);
      if (prevEnv === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevEnv;
    }
  });

  it('URL type=super_agent만 있으면 FileAnalysis 경로 merge에 참조 Super Agent id가 반영된다', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const prevEnv = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    const path = prevPath();
    if (prevEnv !== undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    try {
      window.history.replaceState(
        {},
        '',
        `/?${AGENTS_QUERY_PARAM_TYPE}=${encodeURIComponent(GENSPARK_AGENTS_TYPE_SUPER_AGENT)}`,
      );
      expect(resolveGensparkAgentIdFromWindowSearch()).toBe(GENSPARK_REFERENCE_AGENT_ID);

      const promptInput = '질문: 요약\n요구사항: 한 문장';
      const seed = buildFileAnalysisStyleContextRecord(promptInput);
      const { contextForBody } = mergeApiChatContextPayload(promptInput, seed, []);

      expect(contextForBody?.genspark_reference_agent_id).toBe(GENSPARK_REFERENCE_AGENT_ID);
      expect(contextForBody?.genspark_route_agent_id).toBe(GENSPARK_REFERENCE_AGENT_ID);
      expect(String(contextForBody?.genspark_external_agent_profile ?? '')).toContain(
        GENSPARK_REFERENCE_AGENT_ID,
      );
    } finally {
      window.history.replaceState({}, '', path);
      if (prevEnv === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevEnv;
    }
  });

  it('GENSPARK_DISABLE이면 type=super_agent URL은 merge 결과를 에이전트 없는 URL과 동일하게 만든다(창 라우트 미보강)', () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const prevEnv = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    const basePath = prevPath();
    process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
    const promptInput = '질문: 요약\n요구사항: 한 문장';
    try {
      window.history.replaceState(
        {},
        '',
        `/?${AGENTS_QUERY_PARAM_TYPE}=${encodeURIComponent(GENSPARK_AGENTS_TYPE_SUPER_AGENT)}`,
      );
      expect(resolveGensparkAgentIdFromWindowSearch()).toBeNull();
      const seedSa = buildFileAnalysisStyleContextRecord(promptInput);
      const a = mergeApiChatContextPayload(promptInput, seedSa, []).contextForBody;

      window.history.replaceState({}, '', '/');
      const seedPlain = buildFileAnalysisStyleContextRecord(promptInput);
      const b = mergeApiChatContextPayload(promptInput, seedPlain, []).contextForBody;

      expect(gensparkContextSlice(a)).toEqual(gensparkContextSlice(b));
    } finally {
      window.history.replaceState({}, '', basePath);
      if (prevEnv === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevEnv;
    }
  });
});
