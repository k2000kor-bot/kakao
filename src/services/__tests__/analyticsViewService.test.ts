/**
 * analyticsViewService 테스트
 * fetchAnalytics, fetchProjectAnalytics API 호출 검증
 */
import { fetchAnalytics, fetchProjectAnalytics } from '../analyticsViewService';
import { installJestFetchMock, restoreGlobalFetch } from '../../test-utils/installJestFetchMock';
import {
  API_BASE_URL,
  API_PROJECTS_LIST_PATH,
  API_PROJECT_ANALYTICS_SEGMENT,
  INTEGRATED_API_ANALYTICS_PATH,
  joinApiHealthCheckUrl,
} from '../../config/api';

const originalFetch = globalThis.fetch;

beforeEach(() => {
  installJestFetchMock();
});

afterEach(() => {
  restoreGlobalFetch(originalFetch);
  jest.clearAllMocks();
});

describe('analyticsViewService', () => {
  describe('fetchAnalytics', () => {
    it('성공 시 AnalyticsData를 반환해야 함', async () => {
      const mockData = {
        total_requests: 100,
        successful_requests: 95,
        failed_requests: 5,
        average_response_time: 250,
      };
      jest.mocked(global.fetch).mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, data: mockData }),
      });

      const result = await fetchAnalytics();

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(API_BASE_URL, INTEGRATED_API_ANALYTICS_PATH),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('success가 false이면 null을 반환해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        json: () => Promise.resolve({ success: false }),
      });

      const result = await fetchAnalytics();

      expect(result).toBeNull();
    });

    it('네트워크 에러 시 null을 반환해야 함', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchAnalytics();

      expect(result).toBeNull();
    });

    it('success가 true이지만 data가 없으면 null을 반환해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true }),
      });

      const result = await fetchAnalytics();

      expect(result).toBeNull();
    });
  });

  describe('fetchProjectAnalytics', () => {
    it('성공 시 ProjectAnalyticsData를 반환해야 함', async () => {
      const mockData = {
        project_id: 'proj-1',
        project_name: '테스트 프로젝트',
        session_count: 5,
        total_messages: 42,
        source_count: 3,
      };
      jest.mocked(global.fetch).mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, data: mockData }),
      });

      const result = await fetchProjectAnalytics('proj-1');

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(
          API_BASE_URL,
          `${API_PROJECTS_LIST_PATH}/proj-1${API_PROJECT_ANALYTICS_SEGMENT}`,
        ),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('projectId가 URL 인코딩되어야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        json: () => Promise.resolve({ success: false }),
      });

      await fetchProjectAnalytics('proj/a:b');

      const expectedProjectUrl = joinApiHealthCheckUrl(
        API_BASE_URL,
        `${API_PROJECTS_LIST_PATH}/${encodeURIComponent('proj/a:b')}${API_PROJECT_ANALYTICS_SEGMENT}`,
      );
      expect(global.fetch).toHaveBeenCalledWith(expectedProjectUrl, expect.any(Object));
    });

    it('success가 false이면 null을 반환해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        json: () => Promise.resolve({ success: false }),
      });

      const result = await fetchProjectAnalytics('proj-1');

      expect(result).toBeNull();
    });

    it('네트워크 에러 시 null을 반환해야 함', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchProjectAnalytics('proj-1');

      expect(result).toBeNull();
    });
  });
});
