/** 검색 뷰용 API 응답. GET /api/search/summary */
export interface SearchSpotlightItem {
  id: string;
  type: string;
  title: string;
  snippet: string;
  updatedAt: string;
}

export interface SearchPopularTemplate {
  title: string;
  uses: number;
}

export interface SearchSummary {
  searchTarget: string;
  recentQueries: string[];
  filterScopes: string[];
  spotlight: SearchSpotlightItem[];
  popularTemplates: SearchPopularTemplate[];
}

const SEARCH_FALLBACK: SearchSummary = {
  searchTarget: '대화·프로젝트·문서',
  recentQueries: [],
  filterScopes: ['전체', '대화', '프로젝트', '문서'],
  spotlight: [
    {
      id: 's1',
      type: '프로젝트',
      title: '강남구 재건축 협의체',
      snippet: '안건·hwp 요약과 일정이 정리된 프로젝트입니다.',
      updatedAt: '2026-03-22',
    },
    {
      id: 's2',
      type: '대화',
      title: '토지 보상 산정 질의',
      snippet: '보상 산정 시 참고할 법령·판례를 정리한 대화입니다.',
      updatedAt: '2026-03-21',
    },
    {
      id: 's3',
      type: '문서',
      title: '사업시행계획 첨부 PDF',
      snippet: '조합 설립·인가 일정이 포함된 첨부 문서입니다.',
      updatedAt: '2026-03-18',
    },
  ],
  popularTemplates: [
    { title: '회의록 요약', uses: 142 },
    { title: '요구사항 체크리스트', uses: 98 },
    { title: '공문 초안', uses: 76 },
  ],
};

/** 목데이터·부분 API 응답을 전체 요약 형태로 맞춤 */
export function normalizeSearchSummary(partial: Partial<SearchSummary> | null): SearchSummary {
  if (!partial) return { ...SEARCH_FALLBACK };
  return {
    ...SEARCH_FALLBACK,
    ...partial,
    recentQueries: partial.recentQueries ?? SEARCH_FALLBACK.recentQueries,
    filterScopes: partial.filterScopes?.length ? partial.filterScopes : SEARCH_FALLBACK.filterScopes,
    spotlight: partial.spotlight?.length ? partial.spotlight : SEARCH_FALLBACK.spotlight,
    popularTemplates: partial.popularTemplates?.length
      ? partial.popularTemplates
      : SEARCH_FALLBACK.popularTemplates,
  };
}

/**
 * 검색 요약 조회 — GET /api/search/summary.
 * 실패 시 목데이터 반환.
 */
export async function fetchSearchSummary(): Promise<SearchSummary> {
  try {
    const { API_BASE_URL, API_SEARCH_SUMMARY_PATH, joinApiHealthCheckUrl } = await import('../config/api');
    const res = await fetch(joinApiHealthCheckUrl(API_BASE_URL, API_SEARCH_SUMMARY_PATH), {
      headers: { Accept: 'application/json' },
    });
    const json = (await res.json()) as { success?: boolean; data?: Partial<SearchSummary> };
    if (json.success && json.data) return normalizeSearchSummary(json.data);
  } catch {
    /* fallback */
  }
  return normalizeSearchSummary(null);
}
