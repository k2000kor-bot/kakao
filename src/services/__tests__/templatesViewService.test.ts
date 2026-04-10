/**
 * templatesViewService 테스트
 * fetchTemplatesSummary API 호출·폴백 검증
 */
import { fetchTemplatesSummary } from '../templatesViewService';
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

describe('templatesViewService', () => {
  describe('fetchTemplatesSummary', () => {
    it('성공 시 API 데이터를 반환해야 함', async () => {
      const mockData = {
        categories: ['카테고리A', '카테고리B'],
        favoritesCount: 5,
      };
      jest.mocked(global.fetch).mockResolvedValueOnce(
        partialJsonResponse({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockData }),
        })
      );

      const result = await fetchTemplatesSummary();

      expect(result).toMatchObject(mockData);
      expect(result.libraryItems.length).toBeGreaterThan(0);
    });

    it('success가 false이면 목데이터를 반환해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce(
        partialJsonResponse({
          ok: true,
          json: () => Promise.resolve({ success: false }),
        })
      );

      const result = await fetchTemplatesSummary();

      expect(result).toMatchObject({
        categories: ['도시정비·재개발', '일반 업무', '회의·문서'],
        favoritesCount: 0,
      });
      expect(result.libraryItems.length).toBeGreaterThan(0);
    });

    it('네트워크 에러 시 목데이터를 반환해야 함', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchTemplatesSummary();

      expect(result.categories).toContain('도시정비·재개발');
      expect(result.favoritesCount).toBe(0);
      expect(result.libraryItems.length).toBeGreaterThan(0);
    });

    it('success가 true이지만 data가 없으면 목데이터를 반환해야 함', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce(
        partialJsonResponse({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })
      );

      const result = await fetchTemplatesSummary();

      expect(result).toMatchObject({
        categories: ['도시정비·재개발', '일반 업무', '회의·문서'],
        favoritesCount: 0,
      });
      expect(result.libraryItems[0].title).toBeTruthy();
    });
  });
});
