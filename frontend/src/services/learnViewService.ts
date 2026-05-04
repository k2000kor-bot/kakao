/** 학습 뷰용 API 응답. GET /api/learn/summary */
export interface LearnCourseRow {
  id: string;
  title: string;
  progressPercent: number;
  minutes: number;
  category?: string;
  level?: string;
}

export interface LearnTutorialRow {
  title: string;
  minutes: number;
}

export interface LearnSummary {
  progressPercent: number;
  completedCourses: number;
  courses: LearnCourseRow[];
  tutorials: LearnTutorialRow[];
}

const LEARN_FALLBACK: LearnSummary = {
  progressPercent: 0,
  completedCourses: 0,
  courses: [
    { id: 'c1', title: '대화·프로젝트 시작하기', progressPercent: 40, minutes: 15 },
    { id: 'c2', title: '구글 노트북 LM·소스 관리', progressPercent: 10, minutes: 25 },
    { id: 'c3', title: '도시정비 문서 워크플로', progressPercent: 0, minutes: 30 },
  ],
  tutorials: [
    { title: '첫 프로젝트 만들기', minutes: 5 },
    { title: 'hwp·PDF 요약 파이프라인', minutes: 8 },
    { title: '팀 권한·워크스페이스 전환', minutes: 6 },
  ],
};

export function normalizeLearnSummary(partial: Partial<LearnSummary> | null): LearnSummary {
  if (!partial) return { ...LEARN_FALLBACK };
  return {
    ...LEARN_FALLBACK,
    ...partial,
    courses: partial.courses?.length ? partial.courses : LEARN_FALLBACK.courses,
    tutorials: partial.tutorials?.length ? partial.tutorials : LEARN_FALLBACK.tutorials,
  };
}

/**
 * 학습 요약 조회 — GET /api/learn/summary.
 * 실패 시 목데이터 반환.
 */
export async function fetchLearnSummary(): Promise<LearnSummary> {
  try {
    const { API_BASE_URL, API_LEARN_SUMMARY_PATH, joinApiHealthCheckUrl } = await import('../config/api');
    const res = await fetch(joinApiHealthCheckUrl(API_BASE_URL, API_LEARN_SUMMARY_PATH), {
      headers: { Accept: 'application/json' },
    });
    const json = (await res.json()) as { success?: boolean; data?: Partial<LearnSummary> };
    if (json.success && json.data) return normalizeLearnSummary(json.data);
  } catch {
    /* fallback */
  }
  return normalizeLearnSummary(null);
}
