/** 팀 뷰용 API 응답. GET /api/team/summary */
export interface TeamMemberRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: '활성' | '초대중';
}

export interface TeamSummary {
  memberCount: number;
  role: string;
  members: TeamMemberRow[];
}

const TEAM_FALLBACK: TeamSummary = {
  memberCount: 3,
  role: '관리자',
  members: [
    { id: 'm1', name: '김철수', email: 'kim@example.com', role: '관리자', status: '활성' },
    { id: 'm2', name: '이영희', email: 'lee@example.com', role: '편집자', status: '활성' },
    { id: 'm3', name: '박민수', email: 'park@example.com', role: '뷰어', status: '초대중' },
  ],
};

export function normalizeTeamSummary(partial: Partial<TeamSummary> | null): TeamSummary {
  if (!partial) return { ...TEAM_FALLBACK };
  const base = TEAM_FALLBACK;
  const n = partial.memberCount ?? (partial.members?.length ?? base.members.length);
  const members = partial.members?.length
    ? partial.members
    : base.members.slice(0, Math.max(1, n));
  return {
    ...base,
    ...partial,
    members,
    memberCount: members.length,
  };
}

/**
 * 팀 요약 조회 — GET /api/team/summary.
 * 실패 시 목데이터 반환.
 */
export async function fetchTeamSummary(): Promise<TeamSummary> {
  try {
    const { API_BASE_URL, API_TEAM_SUMMARY_PATH, joinApiHealthCheckUrl } = await import('../config/api');
    const res = await fetch(joinApiHealthCheckUrl(API_BASE_URL, API_TEAM_SUMMARY_PATH), {
      headers: { Accept: 'application/json' },
    });
    const json = (await res.json()) as { success?: boolean; data?: Partial<TeamSummary> };
    if (json.success && json.data) return normalizeTeamSummary(json.data);
  } catch {
    /* fallback */
  }
  return normalizeTeamSummary(null);
}
