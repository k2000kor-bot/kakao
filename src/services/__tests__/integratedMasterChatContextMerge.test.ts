/// <reference types="jest" />
/**
 * `IntegratedMasterInterface` 비스트리밍 전송과 동일한 merge 전 단계(enrich 시드 + `mergeApiChatContextPayload`).
 */
import {
  AGENTS_QUERY_PARAM_ID,
  AGENTS_QUERY_PARAM_TYPE,
  GENSPARK_AGENTS_TYPE_SUPER_AGENT,
} from '../../config/routes';
import { GENSPARK_REFERENCE_AGENT_ID } from '../gensparkReferenceAgentPreset';
import {
  buildGensparkRouteAgentContext,
  resolveGensparkAgentIdFromWindowSearch,
} from '../gensparkAgentRegistry';
import {
  mergeApiChatContextPayload,
  resolveMergeOptionsFromHistoryAndExplicit,
  type ChatTurn,
} from '../modernChatContextBuilder';
import { enrichChatContextRecordWithOptionalMultilayerStyleHint } from '../multiLayerStyleAnalysisSystem';

async function integratedMasterStyleMerge(trimmed: string): Promise<
  ReturnType<typeof mergeApiChatContextPayload>
> {
  const agentRouteId = resolveGensparkAgentIdFromWindowSearch();
  const ctxSeed: Record<string, unknown> = {
    user_id: 'master_interface',
    ...(agentRouteId ? buildGensparkRouteAgentContext(agentRouteId) : {}),
  };
  const masterCtx = await enrichChatContextRecordWithOptionalMultilayerStyleHint(trimmed, ctxSeed);
  const historyNorm: ChatTurn[] = [];
  const mergeOpts = resolveMergeOptionsFromHistoryAndExplicit(historyNorm, undefined);
  return mergeApiChatContextPayload(trimmed, masterCtx, undefined, mergeOpts);
}

describe('IntegratedMasterInterface-style context merge (Genspark)', () => {
  const WINDOW_UUID = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';

  it('GENSPARK_DISABLE_WINDOW=1이면 URL ?id=가 있어도 merge 결과에 해당 UUID가 route/reference로 끼지 않는다', async () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const prevEnv = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    const prevPath = `${window.location.pathname}${window.location.search}`;
    process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
    try {
      window.history.replaceState({}, '', `/?${AGENTS_QUERY_PARAM_ID}=${WINDOW_UUID}`);
      expect(resolveGensparkAgentIdFromWindowSearch()).toBeNull();
      const out = await integratedMasterStyleMerge('질문: a\n요구사항: b');
      expect(out.contextForBody?.genspark_route_agent_id).not.toBe(WINDOW_UUID);
      expect(out.contextForBody?.genspark_reference_agent_id).not.toBe(WINDOW_UUID);
    } finally {
      window.history.replaceState({}, '', prevPath);
      if (prevEnv === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevEnv;
    }
  });

  it('창 URL ?id=가 있고 disable가 꺼져 있으면 Master와 같이 시드에 Genspark 라우트 context가 실린다', async () => {
    delete process.env.REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT;
    const prevEnv = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    const prevPath = `${window.location.pathname}${window.location.search}`;
    if (prevEnv !== undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    try {
      window.history.replaceState({}, '', `/?${AGENTS_QUERY_PARAM_ID}=${WINDOW_UUID}`);
      expect(resolveGensparkAgentIdFromWindowSearch()).toBe(WINDOW_UUID);
      const out = await integratedMasterStyleMerge('질문: a\n요구사항: b');
      expect(out.contextForBody?.genspark_reference_agent_id).toBe(WINDOW_UUID);
      expect(String(out.contextForBody?.genspark_external_agent_profile ?? '')).toContain(WINDOW_UUID);
    } finally {
      window.history.replaceState({}, '', prevPath);
      if (prevEnv === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevEnv;
    }
  });

  it('URL type=super_agent만 있으면 Master 시드·merge에 참조 Super Agent id가 반영된다', async () => {
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
      expect(resolveGensparkAgentIdFromWindowSearch()).toBe(GENSPARK_REFERENCE_AGENT_ID);
      const out = await integratedMasterStyleMerge('질문: a\n요구사항: b');
      expect(out.contextForBody?.genspark_reference_agent_id).toBe(GENSPARK_REFERENCE_AGENT_ID);
      expect(out.contextForBody?.genspark_route_agent_id).toBe(GENSPARK_REFERENCE_AGENT_ID);
    } finally {
      window.history.replaceState({}, '', prevPath);
      if (prevEnv === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevEnv;
    }
  });

  it('GENSPARK_DISABLE이면 type=super_agent만 있어도 Master 시드에 Genspark 라우트를 넣지 않는다', async () => {
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
      expect(resolveGensparkAgentIdFromWindowSearch()).toBeNull();
      const out = await integratedMasterStyleMerge('안녕');
      expect(out.contextForBody?.genspark_route_agent_id).toBeUndefined();
      expect(out.contextForBody?.genspark_reference_agent_id).toBeUndefined();
    } finally {
      window.history.replaceState({}, '', prevPath);
      if (prevEnv === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevEnv;
    }
  });
});
