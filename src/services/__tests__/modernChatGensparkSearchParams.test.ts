/// <reference types="jest" />
/**
 * `ModernChatInterface`의 URL 쿼리 → `buildModernChatPipelineContext` 옵션 계약
 * (`resolveGensparkAgentIdFromSearchParamsIfEnabled` — disable 시 창 쿼리 무시).
 */
import {
  AGENTS_QUERY_PARAM_ID,
  AGENTS_QUERY_PARAM_TYPE,
  GENSPARK_AGENTS_TYPE_SUPER_AGENT,
} from '../../config/routes';
import { GENSPARK_REFERENCE_AGENT_ID } from '../gensparkReferenceAgentPreset';
import { buildModernChatPipelineContext } from '../modernChatContextBuilder';
import { resolveGensparkAgentIdFromSearchParamsIfEnabled } from '../gensparkAgentRegistry';

/** 컴포넌트 `useMemo`와 동일 */
function modernChatPipelineOptionsFromSearchParams(searchParams: URLSearchParams) {
  const agentId = resolveGensparkAgentIdFromSearchParamsIfEnabled(searchParams);
  return agentId ? { gensparkRouteAgentId: agentId } : undefined;
}

describe('ModernChat URL 쿼리 → 파이프라인 gensparkRouteAgentId', () => {
  const WINDOW_UUID = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';

  it('type=super_agent만 있으면 옵션에 참조 Super Agent id가 들어간다', () => {
    const prev = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    if (prev !== undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    try {
      const params = new URLSearchParams(
        `${AGENTS_QUERY_PARAM_TYPE}=${encodeURIComponent(GENSPARK_AGENTS_TYPE_SUPER_AGENT)}`,
      );
      const opts = modernChatPipelineOptionsFromSearchParams(params);
      expect(opts?.gensparkRouteAgentId).toBe(GENSPARK_REFERENCE_AGENT_ID);
      const ctx = buildModernChatPipelineContext('질문: a\n요구사항: b', [], opts);
      expect(ctx?.genspark_reference_agent_id).toBe(GENSPARK_REFERENCE_AGENT_ID);
    } finally {
      if (prev === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prev;
    }
  });

  it('GENSPARK_DISABLE이면 type=super_agent만 있어도 옵션은 비어 있다', () => {
    const prev = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
    try {
      const params = new URLSearchParams(
        `${AGENTS_QUERY_PARAM_TYPE}=${encodeURIComponent(GENSPARK_AGENTS_TYPE_SUPER_AGENT)}`,
      );
      expect(modernChatPipelineOptionsFromSearchParams(params)).toBeUndefined();
    } finally {
      if (prev === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prev;
    }
  });

  it('id가 있으면 해당 uuid가 옵션에 실린다', () => {
    const prev = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    if (prev !== undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    try {
      const params = new URLSearchParams(`${AGENTS_QUERY_PARAM_ID}=${WINDOW_UUID}`);
      expect(modernChatPipelineOptionsFromSearchParams(params)?.gensparkRouteAgentId).toBe(
        WINDOW_UUID,
      );
    } finally {
      if (prev === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prev;
    }
  });

  it('id와 type=super_agent가 함께 있으면 id가 옵션에 우선한다(AppUnified·레지스트리와 동일)', () => {
    const prev = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    if (prev !== undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    try {
      const params = new URLSearchParams(
        `${AGENTS_QUERY_PARAM_TYPE}=${encodeURIComponent(GENSPARK_AGENTS_TYPE_SUPER_AGENT)}&${AGENTS_QUERY_PARAM_ID}=${WINDOW_UUID}`,
      );
      expect(modernChatPipelineOptionsFromSearchParams(params)?.gensparkRouteAgentId).toBe(
        WINDOW_UUID,
      );
    } finally {
      if (prev === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prev;
    }
  });
});
