/** 구독 뷰용 API 응답. GET /api/billing/summary */
export interface BillingPlanCard {
  id: string;
  name: string;
  priceLabel: string;
  features: string[];
  recommended?: boolean;
}

export interface BillingUsageRow {
  label: string;
  used: number;
  limit: number;
}

export interface BillingInvoiceRow {
  date: string;
  amount: string;
  status: string;
}

export interface BillingSummary {
  currentPlan: string;
  nextBillingDate: string | null;
  planOptions: BillingPlanCard[];
  usage: BillingUsageRow[];
  invoices: BillingInvoiceRow[];
}

const BILLING_FALLBACK: BillingSummary = {
  currentPlan: '무료',
  nextBillingDate: null,
  planOptions: [
    {
      id: 'free',
      name: '무료',
      priceLabel: '₩0 / 월',
      features: ['기본 대화', '프로젝트 3개', '커뮤니티 읽기'],
    },
    {
      id: 'pro',
      name: 'PRO',
      priceLabel: '₩29,000 / 월',
      features: ['무제한 프로젝트', '노트북 LLM 우선', '보내기·API'],
      recommended: true,
    },
    {
      id: 'team',
      name: '팀',
      priceLabel: '별도 문의',
      features: ['워크스페이스 분리', 'SSO·감사 로그', '전담 지원'],
    },
  ],
  usage: [
    { label: '월간 요청', used: 120, limit: 500 },
    { label: '스토리지', used: 2, limit: 5 },
  ],
  invoices: [
    { date: '2026-02-01', amount: '₩0', status: '무료 플랜' },
  ],
};

export function normalizeBillingSummary(partial: Partial<BillingSummary> | null): BillingSummary {
  if (!partial) return { ...BILLING_FALLBACK };
  return {
    ...BILLING_FALLBACK,
    ...partial,
    planOptions: partial.planOptions?.length ? partial.planOptions : BILLING_FALLBACK.planOptions,
    usage: partial.usage?.length ? partial.usage : BILLING_FALLBACK.usage,
    invoices: partial.invoices?.length ? partial.invoices : BILLING_FALLBACK.invoices,
  };
}

/**
 * 구독 요약 조회 — GET /api/billing/summary.
 * 실패 시 목데이터 반환.
 */
export async function fetchBillingSummary(): Promise<BillingSummary> {
  try {
    const { API_BASE_URL, API_BILLING_SUMMARY_PATH, joinApiHealthCheckUrl } = await import('../config/api');
    const res = await fetch(joinApiHealthCheckUrl(API_BASE_URL, API_BILLING_SUMMARY_PATH), {
      headers: { Accept: 'application/json' },
    });
    const json = (await res.json()) as { success?: boolean; data?: Partial<BillingSummary> };
    if (json.success && json.data) return normalizeBillingSummary(json.data);
  } catch {
    /* fallback */
  }
  return normalizeBillingSummary(null);
}
