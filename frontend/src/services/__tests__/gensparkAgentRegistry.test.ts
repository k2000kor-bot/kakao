import {
  AGENTS_QUERY_PARAM_ID,
  AGENTS_QUERY_PARAM_TYPE,
  GENSPARK_AGENTS_TYPE_SUPER_AGENT,
} from '../../config/routes';
import { PUBLIC_GENSPARK_AGENTS_ORIGIN } from '../../config/api';
import { GENSPARK_REFERENCE_AGENT_ID } from '../gensparkReferenceAgentPreset';
import {
  PUBLIC_GENSPARK_AGENTS_SUPER_AGENT_TYPE_URL,
  applyGensparkRouteContextFromWindowIfMissing,
  buildGensparkRouteAgentContext,
  buildPublicGensparkAgentUrl,
  isGensparkSuperAgentTypeParam,
  isGensparkWindowRouteContextMergeDisabled,
  listRegisteredGensparkAgents,
  mergeGensparkRouteContextIntoRecordIfMissing,
  resolveAgentIdFromGensparkAgentsQuery,
  resolveGensparkAgentForRoute,
  resolveGensparkAgentIdFromSearchParamsIfEnabled,
  resolveGensparkAgentIdFromWindowSearch,
} from '../gensparkAgentRegistry';

describe('gensparkAgentRegistry', () => {
  it('isGensparkWindowRouteContextMergeDisabled는 env가 없거나 1·true가 아니면 false, 1·true 문자열만 true', () => {
    const prevEnv = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    try {
      delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      expect(isGensparkWindowRouteContextMergeDisabled()).toBe(false);

      process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
      expect(isGensparkWindowRouteContextMergeDisabled()).toBe(true);

      process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = 'true';
      expect(isGensparkWindowRouteContextMergeDisabled()).toBe(true);

      process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = 'false';
      expect(isGensparkWindowRouteContextMergeDisabled()).toBe(false);

      process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = 'TRUE';
      expect(isGensparkWindowRouteContextMergeDisabled()).toBe(false);
    } finally {
      if (prevEnv === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevEnv;
    }
  });

  it('buildPublicGensparkAgentUrl에 id를 쿼리로 넣는다', () => {
    const id = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';
    expect(buildPublicGensparkAgentUrl(id)).toBe(
      `${PUBLIC_GENSPARK_AGENTS_ORIGIN}?${AGENTS_QUERY_PARAM_ID}=${encodeURIComponent(id)}`,
    );
  });

  it('listRegisteredGensparkAgents에 알려진 id가 포함된다', () => {
    const ids = listRegisteredGensparkAgents().map((a) => a.id);
    expect(ids).toContain('eb7747f5-0399-48ff-b436-68a0a23365c9');
    expect(ids).toContain('7c36051a-2b94-4e9e-bd36-05dfabfe3e07');
    expect(ids).toContain('f423fb3c-b28b-458d-9fe5-3b9063c8a6b4');
  });

  it('resolveGensparkAgentForRoute는 미등록 id에도 기본 폼을 반환한다', () => {
    const id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    const r = resolveGensparkAgentForRoute(id);
    expect(r).not.toBeNull();
    expect(r?.id).toBe(id);
    expect(r?.registered).toBe(false);
    expect(r?.url).toContain(encodeURIComponent(id));
  });

  it('buildGensparkRouteAgentContext는 id·url·프로필·라우트 키를 채운다', () => {
    const id = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';
    const ctx = buildGensparkRouteAgentContext(id);
    expect(ctx.genspark_reference_agent_id).toBe(id);
    expect(ctx.genspark_route_agent_id).toBe(id);
    expect(ctx.gensparkRouteAgentId).toBe(id);
    expect(ctx.genspark_reference_agent_url).toContain(id);
    expect(ctx.genspark_external_agent_profile).toContain(id);
  });

  it('isGensparkSuperAgentTypeParam은 super_agent만 true', () => {
    expect(isGensparkSuperAgentTypeParam(GENSPARK_AGENTS_TYPE_SUPER_AGENT)).toBe(true);
    expect(isGensparkSuperAgentTypeParam('SUPER_AGENT')).toBe(true);
    expect(isGensparkSuperAgentTypeParam('other')).toBe(false);
  });

  it('resolveGensparkAgentIdFromWindowSearch는 빈 search면 null', () => {
    expect(resolveGensparkAgentIdFromWindowSearch()).toBeNull();
  });

  it('REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT=1이면 resolveGensparkAgentIdFromWindowSearch는 쿼리가 있어도 null', () => {
    const prevEnv = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    const prevPath = `${window.location.pathname}${window.location.search}`;
    process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
    try {
      window.history.replaceState(
        {},
        '',
        `/?${AGENTS_QUERY_PARAM_ID}=7c36051a-2b94-4e9e-bd36-05dfabfe3e07`,
      );
      expect(resolveGensparkAgentIdFromWindowSearch()).toBeNull();
    } finally {
      window.history.replaceState({}, '', prevPath);
      if (prevEnv === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevEnv;
    }
  });

  it('REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT=true이면 resolveGensparkAgentIdFromWindowSearch는 쿼리가 있어도 null', () => {
    const prevEnv = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    const prevPath = `${window.location.pathname}${window.location.search}`;
    process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = 'true';
    try {
      window.history.replaceState(
        {},
        '',
        `/?${AGENTS_QUERY_PARAM_ID}=7c36051a-2b94-4e9e-bd36-05dfabfe3e07`,
      );
      expect(resolveGensparkAgentIdFromWindowSearch()).toBeNull();
    } finally {
      window.history.replaceState({}, '', prevPath);
      if (prevEnv === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevEnv;
    }
  });

  it('mergeGensparkRouteContextIntoRecordIfMissing는 agent id가 없으면 원본을 반환한다', () => {
    const ctx = { a: 1 };
    expect(mergeGensparkRouteContextIntoRecordIfMissing(ctx, null)).toEqual(ctx);
  });

  it('REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT=1이면 applyGensparkRouteContextFromWindowIfMissing는 ctx를 그대로 둔다', () => {
    const prev = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
    try {
      expect(applyGensparkRouteContextFromWindowIfMissing({ foo: 'bar' })).toEqual({ foo: 'bar' });
    } finally {
      if (prev === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prev;
    }
  });

  it('mergeGensparkRouteContextIntoRecordIfMissing는 비어 있지 않은 키는 덮어쓰지 않는다', () => {
    const id = '7c36051a-2b94-4e9e-bd36-05dfabfe3e07';
    const prev = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    const out = mergeGensparkRouteContextIntoRecordIfMissing(
      { genspark_route_agent_id: prev },
      id
    );
    expect(out.genspark_route_agent_id).toBe(prev);
    expect(out.genspark_reference_agent_id).toBe(id);
  });

  it('resolveGensparkAgentIdFromSearchParamsIfEnabled는 비활성화 env면 id가 있어도 null', () => {
    const prevEnv = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = '1';
    try {
      const params = new URLSearchParams(
        `${AGENTS_QUERY_PARAM_ID}=7c36051a-2b94-4e9e-bd36-05dfabfe3e07`,
      );
      expect(resolveGensparkAgentIdFromSearchParamsIfEnabled(params)).toBeNull();
    } finally {
      if (prevEnv === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevEnv;
    }
  });

  it('resolveGensparkAgentIdFromSearchParamsIfEnabled는 env 꺼짐이면 resolveAgentId와 동일', () => {
    const prevEnv = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    try {
      const params = new URLSearchParams(
        `${AGENTS_QUERY_PARAM_ID}=7c36051a-2b94-4e9e-bd36-05dfabfe3e07`,
      );
      expect(resolveGensparkAgentIdFromSearchParamsIfEnabled(params)).toBe(
        resolveAgentIdFromGensparkAgentsQuery(params),
      );
    } finally {
      if (prevEnv !== undefined) process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevEnv;
    }
  });

  it('resolveAgentIdFromGensparkAgentsQuery: id 우선, type=super_agent는 참조 Super Agent id', () => {
    const params = new URLSearchParams(
      `${AGENTS_QUERY_PARAM_TYPE}=${GENSPARK_AGENTS_TYPE_SUPER_AGENT}`,
    );
    expect(resolveAgentIdFromGensparkAgentsQuery(params)).toBe(GENSPARK_REFERENCE_AGENT_ID);
    const both = new URLSearchParams(
      `${AGENTS_QUERY_PARAM_TYPE}=${GENSPARK_AGENTS_TYPE_SUPER_AGENT}&${AGENTS_QUERY_PARAM_ID}=7c36051a-2b94-4e9e-bd36-05dfabfe3e07`,
    );
    expect(resolveAgentIdFromGensparkAgentsQuery(both)).toBe('7c36051a-2b94-4e9e-bd36-05dfabfe3e07');
    expect(resolveAgentIdFromGensparkAgentsQuery(new URLSearchParams())).toBeNull();
  });

  it('PUBLIC_GENSPARK_AGENTS_SUPER_AGENT_TYPE_URL은 공개 origin에 type=super_agent 쿼리를 붙인다', () => {
    expect(PUBLIC_GENSPARK_AGENTS_SUPER_AGENT_TYPE_URL).toBe(
      `${PUBLIC_GENSPARK_AGENTS_ORIGIN}?${AGENTS_QUERY_PARAM_TYPE}=${GENSPARK_AGENTS_TYPE_SUPER_AGENT}`,
    );
  });

  it('resolveGensparkAgentIdFromWindowSearch는 disable가 꺼져 있고 URL에 type=super_agent만 있으면 참조 Super Agent id를 반환한다', () => {
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
    } finally {
      window.history.replaceState({}, '', prevPath);
      if (prevEnv === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevEnv;
    }
  });

  it('applyGensparkRouteContextFromWindowIfMissing는 genspark_*가 비어 있고 URL이 type=super_agent면 라우트 블록을 채운다', () => {
    const prevEnv = process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    const prevPath = `${window.location.pathname}${window.location.search}`;
    if (prevEnv !== undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
    try {
      window.history.replaceState(
        {},
        '',
        `/?${AGENTS_QUERY_PARAM_TYPE}=${encodeURIComponent(GENSPARK_AGENTS_TYPE_SUPER_AGENT)}`,
      );
      const out = applyGensparkRouteContextFromWindowIfMissing({});
      expect(out.genspark_reference_agent_id).toBe(GENSPARK_REFERENCE_AGENT_ID);
      expect(out.genspark_route_agent_id).toBe(GENSPARK_REFERENCE_AGENT_ID);
      expect(String(out.genspark_external_agent_profile ?? '')).toContain(GENSPARK_REFERENCE_AGENT_ID);
    } finally {
      window.history.replaceState({}, '', prevPath);
      if (prevEnv === undefined) delete process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT;
      else process.env.REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT = prevEnv;
    }
  });
});
