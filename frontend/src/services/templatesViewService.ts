/** 템플릿 뷰용 API 응답. GET /api/templates/summary */
export interface TemplateLibraryItem {
  id: string;
  title: string;
  category: string;
  uses: number;
  favorited: boolean;
  /** 미리보기·채팅 전송용 본문(없으면 title 사용) */
  prompt?: string;
}

export interface TemplatesSummary {
  categories: string[];
  favoritesCount: number;
  libraryItems: TemplateLibraryItem[];
}

const TEMPLATES_FALLBACK: TemplatesSummary = {
  categories: ['도시정비·재개발', '일반 업무', '회의·문서'],
  favoritesCount: 0,
  libraryItems: [
    {
      id: 'tpl1',
      title: '사업시행 인허가 일정표',
      category: '도시정비·재개발',
      uses: 210,
      favorited: false,
    },
    {
      id: 'tpl2',
      title: '이해관계자 회의록 요약',
      category: '회의·문서',
      uses: 156,
      favorited: false,
    },
    {
      id: 'tpl3',
      title: '요구사항 수집 질문 세트',
      category: '일반 업무',
      uses: 89,
      favorited: false,
    },
  ],
};

export function normalizeTemplatesSummary(partial: Partial<TemplatesSummary> | null): TemplatesSummary {
  if (!partial) return { ...TEMPLATES_FALLBACK };
  return {
    ...TEMPLATES_FALLBACK,
    ...partial,
    categories: partial.categories?.length ? partial.categories : TEMPLATES_FALLBACK.categories,
    libraryItems: partial.libraryItems?.length ? partial.libraryItems : TEMPLATES_FALLBACK.libraryItems,
  };
}

/**
 * 템플릿 요약 조회 — GET /api/templates/summary.
 * 실패 시 목데이터 반환.
 */
export async function fetchTemplatesSummary(): Promise<TemplatesSummary> {
  try {
    const { API_BASE_URL, API_TEMPLATES_SUMMARY_PATH, joinApiHealthCheckUrl } = await import('../config/api');
    const res = await fetch(joinApiHealthCheckUrl(API_BASE_URL, API_TEMPLATES_SUMMARY_PATH), {
      headers: { Accept: 'application/json' },
    });
    const json = (await res.json()) as { success?: boolean; data?: Partial<TemplatesSummary> };
    if (json.success && json.data) return normalizeTemplatesSummary(json.data);
  } catch {
    /* fallback */
  }
  return normalizeTemplatesSummary(null);
}
