/**
 * integrationsViewService 테스트
 * fetchIntegrationsHealth API 호출 검증
 */
import { fetchIntegrationsHealth } from '../integrationsViewService';
import { API_BASE_URL, INTEGRATED_API_HEALTH_PATH, joinApiHealthCheckUrl } from '../../config/api';
import { installJestFetchMock, restoreGlobalFetch } from '../../test-utils/installJestFetchMock';

const originalFetch = globalThis.fetch;

beforeEach(() => {
  installJestFetchMock();
});

afterEach(() => {
  restoreGlobalFetch(originalFetch);
  jest.clearAllMocks();
});

describe('integrationsViewService', () => {
  describe('fetchIntegrationsHealth', () => {
    it('성공 시 IntegrationsHealthData를 반환해야 함', async () => {
      const mockData = { status: 'healthy', service: 'api' };
      jest.mocked(global.fetch).mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, data: mockData }),
      });

      const result = await fetchIntegrationsHealth();

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(API_BASE_URL, INTEGRATED_API_HEALTH_PATH),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('success가 false이면 null을 반환해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        json: () => Promise.resolve({ success: false }),
      });

      const result = await fetchIntegrationsHealth();

      expect(result).toBeNull();
    });

    it('네트워크 에러 시 null을 반환해야 함', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchIntegrationsHealth();

      expect(result).toBeNull();
    });

    it('success가 true이지만 data가 없으면 null을 반환해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true }),
      });

      const result = await fetchIntegrationsHealth();

      expect(result).toBeNull();
    });
  });
});
