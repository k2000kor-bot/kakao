/** 워크스페이스 `project_create` 도구 — 이미 프로젝트 대화 중일 때 중복 생성 방지 */

export type WorkspaceProjectCreateToolResult = {
  tool?: string;
  success?: boolean;
  data?: { project_id?: string };
  message?: string;
};

export function shouldSuppressWorkspaceProjectCreate(
  activeProjectId?: string | null,
  conversationProjectId?: string | null,
): boolean {
  return Boolean(coerceActiveProjectId(activeProjectId) || coerceActiveProjectId(conversationProjectId));
}

function coerceActiveProjectId(id: string | null | undefined): string | null {
  if (typeof id !== 'string') return null;
  const t = id.trim();
  return t.length > 0 ? t : null;
}
