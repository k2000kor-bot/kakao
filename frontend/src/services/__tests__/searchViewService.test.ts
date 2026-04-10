/**
 * searchViewService 테스트
 * fetchSearchSummary API 호출·폴백 검증
 */
import { fetchSearchSummary } from '../searchViewService';
import { installJestFetchMock, restoreGlobalFetch } from '../../test-utils/installJestFetchMock';

const originalFetch = globalThis.fetch;

beforeEach(() => {
  installJestFetchMock();
});

afterEach(() => {
  restoreGlobalFetch(originalFetch);
  jest.clearAllMocks();
});

describe('searchViewService', () => {
  describe('fetchSearchSummary', () => {
    it('성공 시 API 데이터를 반환해야 함', async () => {
      const mockData = {
        searchTarget: '대화·프로젝트',
        recentQueries: ['검색1', '검색2'],
      };
      jest.mocked(global.fetch).mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, data: mockData }),
      });

      const result = await fetchSearchSummary();

      expect(result).toMatchObject(mockData);
      expect(result.filterScopes.length).toBeGreaterThan(0);
      expect(result.spotlight.length).toBeGreaterThan(0);
    });

    it('success가 false이면 목데이터를 반환해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        json: () => Promise.resolve({ success: false }),
      });

      const result = await fetchSearchSummary();

      expect(result).toMatchObject({ searchTarget: '대화·프로젝트·문서', recentQueries: [] });
      expect(result.spotlight.length).toBeGreaterThan(0);
    });

    it('네트워크 에러 시 목데이터를 반환해야 함', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchSearchSummary();

      expect(result).toMatchObject({ searchTarget: '대화·프로젝트·문서', recentQueries: [] });
      expect(result.popularTemplates.length).toBeGreaterThan(0);
    });

    it('success가 true이지만 data가 없으면 목데이터를 반환해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true }),
      });

      const result = await fetchSearchSummary();

      expect(result).toMatchObject({ searchTarget: '대화·프로젝트·문서', recentQueries: [] });
      expect(result.filterScopes.length).toBeGreaterThan(0);
    });
  });
});
