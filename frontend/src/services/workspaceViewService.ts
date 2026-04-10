/** 워크스페이스 뷰용 API 응답. GET /api/workspace/summary */
export interface WorkspaceRow {
  id: string;
  name: string;
  isCurrent: boolean;
  members: number;
}

export interface WorkspaceSummary {
  workspaceCount: number;
  currentName: string;
  workspaces: WorkspaceRow[];
}

const WORKSPACE_FALLBACK: WorkspaceSummary = {
  workspaceCount: 2,
  currentName: '기본',
  workspaces: [
    { id: 'w1', name: '기본', isCurrent: true, members: 4 },
    { id: 'w2', name: '도시정비 TF', isCurrent: false, members: 8 },
  ],
};

export function normalizeWorkspaceSummary(partial: Partial<WorkspaceSummary> | null): WorkspaceSummary {
  const base = WORKSPACE_FALLBACK;
  if (!partial) return { ...base };
  const ws = partial.workspaces?.length
    ? partial.workspaces
    : base.workspaces.slice(0, Math.max(1, partial.workspaceCount ?? base.workspaceCount));
  return {
    ...base,
    ...partial,
    workspaces: ws,
    workspaceCount: ws.length,
    currentName:
      partial.currentName ?? ws.find((w) => w.isCurrent)?.name ?? ws[0]?.name ?? base.currentName,
  };
}

/**
 * 워크스페이스 요약 조회 — GET /api/workspace/summary.
 * 실패 시 목데이터 반환.
 */
export async function fetchWorkspaceSummary(): Promise<WorkspaceSummary> {
  try {
    const { API_BASE_URL, API_WORKSPACE_SUMMARY_PATH, joinApiHealthCheckUrl } = await import('../config/api');
    const res = await fetch(joinApiHealthCheckUrl(API_BASE_URL, API_WORKSPACE_SUMMARY_PATH), {
      headers: { Accept: 'application/json' },
    });
    const json = (await res.json()) as { success?: boolean; data?: Partial<WorkspaceSummary> };
    if (json.success && json.data) return normalizeWorkspaceSummary(json.data);
  } catch {
    /* fallback */
  }
  return normalizeWorkspaceSummary(null);
}
