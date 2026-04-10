/**
 * billingViewService 테스트
 * fetchBillingSummary API 호출·폴백 검증
 */
import { fetchBillingSummary } from '../billingViewService';
import { API_BASE_URL, API_BILLING_SUMMARY_PATH, joinApiHealthCheckUrl } from '../../config/api';
import { installJestFetchMock, restoreGlobalFetch } from '../../test-utils/installJestFetchMock';

const originalFetch = globalThis.fetch;

function partialJsonResponse(init: {
  ok?: boolean;
  json: () => Promise<unknown>;
}): Response {
  return init as unknown as Response;
}

beforeEach(() => {
  installJestFetchMock();
});

afterEach(() => {
  restoreGlobalFetch(originalFetch);
  jest.clearAllMocks();
});

describe('billingViewService', () => {
  describe('fetchBillingSummary', () => {
    it('성공 시 BillingSummary를 반환해야 함', async () => {
      const mockData = { currentPlan: 'PRO', nextBillingDate: '2025-03-01' };
      jest.mocked(global.fetch).mockResolvedValueOnce(
        partialJsonResponse({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockData }),
        })
      );

      const result = await fetchBillingSummary();

      expect(result).toMatchObject(mockData);
      expect(result.planOptions.length).toBeGreaterThan(0);
      expect(global.fetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(API_BASE_URL, API_BILLING_SUMMARY_PATH),
        expect.objectContaining({ headers: { Accept: 'application/json' } })
      );
    });

    it('success가 false이면 목데이터를 반환해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce(
        partialJsonResponse({
          ok: true,
          json: () => Promise.resolve({ success: false }),
        })
      );

      const result = await fetchBillingSummary();

      expect(result).toMatchObject({ currentPlan: '무료', nextBillingDate: null });
      expect(result.usage.length).toBeGreaterThan(0);
    });

    it('네트워크 에러 시 목데이터를 반환해야 함', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchBillingSummary();

      expect(result).toMatchObject({ currentPlan: '무료', nextBillingDate: null });
      expect(result.planOptions.length).toBeGreaterThanOrEqual(3);
    });

    it('success가 true이지만 data가 없으면 목데이터를 반환해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce(
        partialJsonResponse({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })
      );

      const result = await fetchBillingSummary();

      expect(result).toMatchObject({ currentPlan: '무료', nextBillingDate: null });
      expect(result.invoices.length).toBeGreaterThan(0);
    });
  });
});
