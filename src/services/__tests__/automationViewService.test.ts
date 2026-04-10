/**
 * automationViewService 테스트
 * fetchAutomationSummary API 호출 검증
 */
import { fetchAutomationSummary } from '../automationViewService';
import { installJestFetchMock, restoreGlobalFetch } from '../../test-utils/installJestFetchMock';

const originalFetch = globalThis.fetch;

beforeEach(() => {
  installJestFetchMock();
});

afterEach(() => {
  restoreGlobalFetch(originalFetch);
  jest.clearAllMocks();
});

describe('automationViewService', () => {
  describe('fetchAutomationSummary', () => {
    it('status와 workflows 둘 다 성공 시 workflowCount와 lastRunAt을 반환해야 함', async () => {
      jest.mocked(global.fetch)
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              success: true,
              data: { total_workflows: 3 },
            }),
        })
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                total_count: 3,
                workflows: [
                  { last_run: '2025-02-20T10:00:00Z' },
                  { last_run: '2025-02-20T12:00:00Z' },
                ],
              },
            }),
        });

      const result = await fetchAutomationSummary();

      expect(result).toEqual({
        workflowCount: 3,
        lastRunAt: '2025-02-20 12:00:00',
      });
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('workflows에서 total_count가 있으면 workflowCount를 덮어써야 함', async () => {
      jest.mocked(global.fetch)
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              success: true,
              data: { total_workflows: 1 },
            }),
        })
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                total_count: 5,
                workflows: [{ last_run: '2025-02-20T10:00:00Z' }],
              },
            }),
        });

      const result = await fetchAutomationSummary();

      expect(result.workflowCount).toBe(5);
    });

    it('status 실패·workflows 빈 배열이면 기본값을 반환해야 함', async () => {
      jest.mocked(global.fetch)
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ success: false }),
        })
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              success: true,
              data: { workflows: [] },
            }),
        });

      const result = await fetchAutomationSummary();

      expect(result).toEqual({
        workflowCount: 0,
        lastRunAt: null,
      });
    });

    it('네트워크 에러 시 기본값을 반환해야 함', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchAutomationSummary();

      expect(result).toEqual({
        workflowCount: 0,
        lastRunAt: null,
      });
    });

    it('workflows가 있지만 last_run이 모두 null이면 lastRunAt이 null이어야 함', async () => {
      jest.mocked(global.fetch)
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              success: true,
              data: { total_workflows: 2 },
            }),
        })
        .mockResolvedValueOnce({
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                total_count: 2,
                workflows: [{ last_run: null }, { last_run: null }],
              },
            }),
        });

      const result = await fetchAutomationSummary();

      expect(result.workflowCount).toBe(2);
      expect(result.lastRunAt).toBeNull();
    });
  });
});
