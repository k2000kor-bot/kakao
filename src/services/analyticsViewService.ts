/**
 * 분석 뷰용 API — GET /api/integrated/analytics
 * 도구 뷰용 분석 API (AnalyticsView)
 */
import {
  API_BASE_URL,
  API_PROJECTS_LIST_PATH,
  API_PROJECT_ANALYTICS_SEGMENT,
  INTEGRATED_API_ANALYTICS_PATH,
  joinApiHealthCheckUrl,
} from '../config/api';

export interface AnalyticsData {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  average_response_time: number;
  emotion_distribution?: { positive: number; negative: number; neutral: number };
  intent_distribution?: Record<string, number>;
  recent_analyses?: Array<{ message: string; emotion: string; intent: string; confidence: number; timestamp: string }>;
}

interface AnalyticsApiResponse {
  success: boolean;
  data?: AnalyticsData;
  error?: string;
}

/** 프로젝트별 사용 통계 (GET /api/projects/{id}/analytics) */
export interface ProjectAnalyticsData {
  project_id: string;
  project_name: string;
  session_count: number;
  total_messages: number;
  source_count: number;
}

interface ProjectAnalyticsApiResponse {
  success: boolean;
  data?: ProjectAnalyticsData;
  error?: string;
}

/**
 * 백엔드 GET /api/integrated/analytics 호출.
 * 실패 시 null 반환 (네트워크/백엔드 미기동 시 플레이스홀더 유지).
 */
export async function fetchAnalytics(): Promise<AnalyticsData | null> {
  try {
    const res = await fetch(joinApiHealthCheckUrl(API_BASE_URL, INTEGRATED_API_ANALYTICS_PATH), {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    const json = (await res.json()) as AnalyticsApiResponse;
    if (json.success && json.data) return json.data;
    return null;
  } catch {
    return null;
  }
}

/**
 * 프로젝트별 사용 통계 조회 (GET /api/projects/{id}/analytics).
 * 세션 수, 메시지 수, 노트북 소스 수 반환.
 */
export async function fetchProjectAnalytics(projectId: string): Promise<ProjectAnalyticsData | null> {
  try {
    const res = await fetch(
      joinApiHealthCheckUrl(
        API_BASE_URL,
        `${API_PROJECTS_LIST_PATH}/${encodeURIComponent(projectId)}${API_PROJECT_ANALYTICS_SEGMENT}`,
      ),
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
      },
    );
    const json = (await res.json()) as ProjectAnalyticsApiResponse;
    if (json.success && json.data) return json.data;
    return null;
  } catch {
    return null;
  }
}
