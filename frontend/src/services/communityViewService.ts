/** 커뮤니티 뷰용 API 응답. GET /api/community/summary */
export interface CommunityThreadRow {
  id: string;
  title: string;
  category: string;
  replies: number;
  updatedAt: string;
}

export interface CommunitySummary {
  topicCount: number;
  recentPostLabel: string;
  threads: CommunityThreadRow[];
  topicLabels: string[];
}

const COMMUNITY_THREADS_DEMO: CommunityThreadRow[] = [
  {
    id: 't1',
    title: '재건축 조합 설립 체크리스트',
    category: '가이드',
    replies: 14,
    updatedAt: '2026-03-25',
  },
  {
    id: 't2',
    title: '토지보상 산정 질문',
    category: 'Q&A',
    replies: 7,
    updatedAt: '2026-03-24',
  },
  {
    id: 't3',
    title: 'hwp 요약 프롬프트 공유',
    category: '팁',
    replies: 22,
    updatedAt: '2026-03-23',
  },
];

const TOPIC_LABELS_DEFAULT = ['도시정비', '재건축', 'LLM', '템플릿'];

const COMMUNITY_RICH: CommunitySummary = {
  topicCount: 4,
  recentPostLabel: '재건축 조합 설립 체크리스트',
  threads: COMMUNITY_THREADS_DEMO,
  topicLabels: TOPIC_LABELS_DEFAULT,
};

/** API 미연결 시: 지표는 비어 있고 포럼 표는 데모 행으로 채움 */
const COMMUNITY_EMPTY: CommunitySummary = {
  topicCount: 0,
  recentPostLabel: '—',
  threads: COMMUNITY_THREADS_DEMO,
  topicLabels: TOPIC_LABELS_DEFAULT,
};

export function normalizeCommunitySummary(partial: Partial<CommunitySummary> | null): CommunitySummary {
  if (!partial) return { ...COMMUNITY_EMPTY };
  return {
    ...COMMUNITY_RICH,
    ...partial,
    threads: partial.threads?.length ? partial.threads : COMMUNITY_THREADS_DEMO,
    topicLabels: partial.topicLabels?.length ? partial.topicLabels : TOPIC_LABELS_DEFAULT,
  };
}

/**
 * 커뮤니티 요약 조회 — GET /api/community/summary.
 * 실패 시 목데이터 반환.
 */
export async function fetchCommunitySummary(): Promise<CommunitySummary> {
  try {
    const { API_BASE_URL, API_COMMUNITY_SUMMARY_PATH, joinApiHealthCheckUrl } = await import('../config/api');
    const res = await fetch(joinApiHealthCheckUrl(API_BASE_URL, API_COMMUNITY_SUMMARY_PATH), {
      headers: { Accept: 'application/json' },
    });
    const json = (await res.json()) as { success?: boolean; data?: Partial<CommunitySummary> };
    if (json.success && json.data) return normalizeCommunitySummary(json.data);
  } catch {
    /* fallback */
  }
  return normalizeCommunitySummary(null);
}
