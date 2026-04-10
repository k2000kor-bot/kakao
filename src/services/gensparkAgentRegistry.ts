/**
 * Genspark `PUBLIC_GENSPARK_AGENTS_ORIGIN?id=<uuid>` 와 동일한 쿼리로
 * 앱 내 `/agents?id=<uuid>` 세션을 열 때 사용하는 레지스트리.
 *
 * 새 에이전트: 아래 REGISTERED에 id(쿼리 값과 동일)와 폼을 추가하거나,
 * 미등록 id로 열면 기본 과업 완결형 지시가 적용된다.
 *
 * 주소창 `?id=`·`?type=super_agent`를 merge·`resolveGensparkAgentIdFromWindowSearch`·Modern Chat 파이프라인에 반영하는 동작은
 * `REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT=true`(또는 `1`)로 끈다. `/agents` 라우트의 `ChatGPTInterface` props는 그대로다.
 */

import { PUBLIC_GENSPARK_AGENTS_ORIGIN } from '../config/api';
import {
  AGENTS_QUERY_PARAM_ID,
  AGENTS_QUERY_PARAM_TYPE,
  GENSPARK_AGENTS_TYPE_SUPER_AGENT,
} from '../config/routes';
import { coerceTrimmedString } from '../utils/chatInputUtils';
import {
  DEFAULT_GENSPARK_AGENT_FORM,
  GENSPARK_REFERENCE_AGENT_ID,
  type GensparkAgentFormFields,
  buildExternalAgentProfileMarkdown,
} from './gensparkReferenceAgentPreset';

export { PUBLIC_GENSPARK_AGENTS_ORIGIN };

/** Genspark Super Agent 목록/진입 URL (`?type=super_agent`). */
export const PUBLIC_GENSPARK_AGENTS_SUPER_AGENT_TYPE_URL = `${PUBLIC_GENSPARK_AGENTS_ORIGIN}?${AGENTS_QUERY_PARAM_TYPE}=${GENSPARK_AGENTS_TYPE_SUPER_AGENT}`;

export function buildPublicGensparkAgentUrl(agentId: string): string {
  const id = coerceTrimmedString(agentId, '');
  return `${PUBLIC_GENSPARK_AGENTS_ORIGIN}?${AGENTS_QUERY_PARAM_ID}=${encodeURIComponent(id)}`;
}

/** Genspark `agents?type=super_agent` 와 동일한 type 값. */
export function isGensparkSuperAgentTypeParam(value: string | null | undefined): boolean {
  return (
    coerceTrimmedString(value ?? '', '').toLowerCase() === GENSPARK_AGENTS_TYPE_SUPER_AGENT.toLowerCase()
  );
}

/**
 * Genspark 에이전트 URL 쿼리를 앱 `agentId`로 해석.
 * - `?id=<uuid>` 우선
 * - `?type=super_agent` 는 레포 참조 Super Agent(`GENSPARK_REFERENCE_AGENT_ID`)와 동일 세션으로 연결
 */
export function resolveAgentIdFromGensparkAgentsQuery(searchParams: {
  get: (key: string) => string | null;
}): string | null {
  const id = coerceTrimmedString(searchParams.get(AGENTS_QUERY_PARAM_ID) ?? '', '');
  if (id) return id;
  if (isGensparkSuperAgentTypeParam(searchParams.get(AGENTS_QUERY_PARAM_TYPE))) {
    return GENSPARK_REFERENCE_AGENT_ID;
  }
  return null;
}

/** `mergeApiChatContextPayload`·`resolveGensparkAgentIdFromWindowSearch` — 주소창 에이전트 쿼리 해석을 끌 때 */
export function isGensparkWindowRouteContextMergeDisabled(): boolean {
  if (typeof process === 'undefined') return false;
  const v = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
  return v === '1' || v === 'true';
}

/**
 * `useSearchParams` 없이 전송 시점의 `window.location.search`를 읽음.
 * Ultimate·Integrated Master 등 라우터 래퍼가 없는 테스트(jsdom)에서도 안전하고, SPA 네비게이션 후에도 최신 쿼리를 반영한다.
 * `REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT`가 켜져 있으면 항상 `null`.
 */
export function resolveGensparkAgentIdFromWindowSearch(): string | null {
  if (isGensparkWindowRouteContextMergeDisabled()) return null;
  if (typeof window === 'undefined') return null;
  try {
    return resolveAgentIdFromGensparkAgentsQuery(new URLSearchParams(window.location.search));
  } catch {
    return null;
  }
}

/**
 * `useSearchParams()`와 동일한 쿼리 — URL 기반 에이전트 해석을 env로 끈 경우 `null`.
 * **`/agents?id=` 전용 화면**은 의도적 진입이므로 `resolveAgentIdFromGensparkAgentsQuery`를 직접 쓴다(`AppUnified`).
 */
export function resolveGensparkAgentIdFromSearchParamsIfEnabled(searchParams: {
  get: (key: string) => string | null;
}): string | null {
  if (isGensparkWindowRouteContextMergeDisabled()) return null;
  return resolveAgentIdFromGensparkAgentsQuery(searchParams);
}

const REGISTERED: Record<string, GensparkAgentFormFields> = {
  'eb7747f5-0399-48ff-b436-68a0a23365c9': {
    ...DEFAULT_GENSPARK_AGENT_FORM,
    displayName: '과업 완결형 Super Agent (Genspark 참조)',
  },
  '7c36051a-2b94-4e9e-bd36-05dfabfe3e07': {
    ...DEFAULT_GENSPARK_AGENT_FORM,
    displayName: 'Genspark 연동 에이전트',
    oneLineDescription:
      '요청하신 Genspark 에이전트 ID와 동일한 쿼리로 연 앱 세션입니다. 지시문을 Genspark UI에서 복사해 이 파일 REGISTERED 항목의 instructions에 넣으면 동작을 맞출 수 있습니다.',
  },
  /** @see https://www.genspark.ai/agents?id=07875e45-d0b1-41b2-b639-a10904faa6ac */
  '07875e45-d0b1-41b2-b639-a10904faa6ac': {
    ...DEFAULT_GENSPARK_AGENT_FORM,
    displayName: 'Genspark Agents (연동 ID)',
    oneLineDescription:
      'Genspark 공개 agents URL과 동일한 id 쿼리로 맞춘 세션입니다. 여러 차례 질문·답변이 이어질 때 이전 턴 맥락을 유지하도록 백엔드 파이프라인과 동작을 정렬했습니다. Genspark 폼의 지시문은 instructions에 붙여 넣으면 됩니다.',
  },
  /** @see https://www.genspark.ai/agents?id=f423fb3c-b28b-458d-9fe5-3b9063c8a6b4 */
  'f423fb3c-b28b-458d-9fe5-3b9063c8a6b4': {
    ...DEFAULT_GENSPARK_AGENT_FORM,
    displayName: 'Genspark Agents (공유 에이전트)',
    oneLineDescription:
      '공유하신 Genspark agents URL과 동일한 id로 연결됩니다. 이름·설명·지시·산출·품질 필드는 Genspark UI와 동일하게 맞추려면 이 항목의 instructions 등을 편집하세요.',
  },
};

export function listRegisteredGensparkAgents(): Array<{ id: string; displayName: string; url: string }> {
  return Object.entries(REGISTERED).map(([id, f]) => ({
    id,
    displayName: f.displayName,
    url: buildPublicGensparkAgentUrl(id),
  }));
}

export function resolveGensparkAgentForRoute(agentId: string): {
  id: string;
  url: string;
  form: GensparkAgentFormFields;
  registered: boolean;
} | null {
  const id = coerceTrimmedString(agentId, '');
  if (!id || id.length > 128 || /[\r\n<>]/.test(id)) return null;

  const hit = REGISTERED[id];
  if (hit) {
    return { id, url: buildPublicGensparkAgentUrl(id), form: hit, registered: true };
  }

  return {
    id,
    url: buildPublicGensparkAgentUrl(id),
    form: {
      ...DEFAULT_GENSPARK_AGENT_FORM,
      displayName: `Genspark 에이전트 (${id.slice(0, 8)}…)`,
      oneLineDescription:
        '레지스트리에 없는 ID입니다. 기본 과업 완결형 지시를 씁니다. `src/services/gensparkAgentRegistry.ts`에 id를 등록해 주세요.',
    },
    registered: false,
  };
}

/** `/agents?id=` 전용 — API context의 genspark_reference_* 필드에 대응 */
export function buildGensparkRouteAgentContext(agentId: string): Record<string, string> {
  const resolved = resolveGensparkAgentForRoute(agentId);
  if (!resolved) return {};

  const skip =
    typeof process !== 'undefined' && process.env.REACT_APP_GENSPARK_REFERENCE_AGENT_PROFILE === '0';

  /** `mergeApiChatContextPayload`·백엔드가 라우트 세션 id로 조회할 때 쓰는 키 (`genspark_reference_agent_id`와 동일 값) */
  const base: Record<string, string> = {
    genspark_reference_agent_id: resolved.id,
    genspark_reference_agent_url: resolved.url,
    genspark_route_agent_id: resolved.id,
    gensparkRouteAgentId: resolved.id,
  };
  if (skip) return base;

  return {
    ...base,
    genspark_external_agent_profile: buildExternalAgentProfileMarkdown(
      resolved.id,
      resolved.url,
      resolved.form
    ),
  };
}

/**
 * `genspark_*` 키는 이미 있으면 유지 — 호출부가 넣은 context·Composer 병합이 URL보다 우선.
 */
export function mergeGensparkRouteContextIntoRecordIfMissing(
  ctx: Record<string, unknown>,
  agentRouteId: string | null
): Record<string, unknown> {
  if (!agentRouteId) return ctx;
  const routeCtx = buildGensparkRouteAgentContext(agentRouteId);
  if (Object.keys(routeCtx).length === 0) return ctx;
  const out = { ...ctx };
  for (const [k, v] of Object.entries(routeCtx)) {
    if (out[k] === undefined) {
      out[k] = v;
    }
  }
  return out;
}

/**
 * `mergeApiChatContextPayload` 직전 — URL에 에이전트 쿼리가 있으면 context에 `genspark_*` 보강.
 * `REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT` 또는 호출부가 이미 채운 키가 있으면 생략.
 */
export function applyGensparkRouteContextFromWindowIfMissing(
  ctx: Record<string, unknown>
): Record<string, unknown> {
  if (isGensparkWindowRouteContextMergeDisabled()) return ctx;
  return mergeGensparkRouteContextIntoRecordIfMissing(ctx, resolveGensparkAgentIdFromWindowSearch());
}
