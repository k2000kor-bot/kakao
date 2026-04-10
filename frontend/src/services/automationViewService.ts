/** 자동화 뷰용 API 응답 */
export interface AutomationSummary {
  workflowCount: number;
  lastRunAt: string | null;
}

/** GET /automation/status 또는 /automation/workflows 응답 */
interface AutomationStatusResponse {
  success: boolean;
  data?: {
    total_workflows?: number;
    total_count?: number;
    workflows?: Array<{ last_run?: string | null }>;
  };
}

/**
 * 자동화 요약 조회 — GET /automation/status (또는 /automation/workflows).
 * 실패 시 { workflowCount: 0, lastRunAt: null } 반환.
 */
export async function fetchAutomationSummary(): Promise<AutomationSummary> {
  try {
    const { API_AUTOMATION_STATUS_PATH, API_AUTOMATION_WORKFLOWS_PATH, API_BASE_URL, joinApiHealthCheckUrl } =
      await import('../config/api');
    const [statusRes, workflowsRes] = await Promise.all([
      fetch(joinApiHealthCheckUrl(API_BASE_URL, API_AUTOMATION_STATUS_PATH), { headers: { Accept: 'application/json' } }),
      fetch(joinApiHealthCheckUrl(API_BASE_URL, API_AUTOMATION_WORKFLOWS_PATH), {
        headers: { Accept: 'application/json' },
      }),
    ]);
    let workflowCount = 0;
    let lastRunAt: string | null = null;

    const statusJson = (await statusRes.json()) as AutomationStatusResponse;
    if (statusJson.success && statusJson.data?.total_workflows != null) {
      workflowCount = statusJson.data.total_workflows;
    }

    const workflowsJson = (await workflowsRes.json()) as AutomationStatusResponse;
    if (workflowsJson.success && workflowsJson.data?.workflows?.length) {
      if (workflowsJson.data.total_count != null) workflowCount = workflowsJson.data.total_count;
      const dates = workflowsJson.data.workflows
        .map((w) => (w.last_run ? new Date(w.last_run).getTime() : 0))
        .filter((t) => t > 0);
      if (dates.length > 0) {
        const latest = new Date(Math.max(...dates));
        lastRunAt = latest.toISOString().slice(0, 19).replace('T', ' ');
      }
    }

    return { workflowCount, lastRunAt };
  } catch {
    return { workflowCount: 0, lastRunAt: null };
  }
}
