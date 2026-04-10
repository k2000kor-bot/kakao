/**
 * WebSearchService 테스트
 */

import {
  webSearchService,
  WebSearchService,
  SearchResult,
  SearchOptions,
} from '../webSearchService';

describe('WebSearchService', () => {
  let service: WebSearchService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.spyOn(Date, 'now').mockReturnValue(1000000000000);
    service = new WebSearchService();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(WebSearchService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(webSearchService).toBeDefined();
      expect(webSearchService).toBeInstanceOf(WebSearchService);
    });
  });

  describe('웹 검색', () => {
    it('기본 웹 검색', async () => {
      const results = await service.searchWeb('테스트 검색');
      expect(Array.isArray(results)).toBe(true);
    });

    it('검색 결과 구조 확인', async () => {
      const results = await service.searchWeb('도시정비법');
      expect(Array.isArray(results)).toBe(true);
      /* eslint-disable jest/no-conditional-expect -- structure when non-empty */
      if (results.length > 0) {
        const result = results[0];
        expect(result).toHaveProperty('title');
        expect(result).toHaveProperty('url');
        expect(result).toHaveProperty('snippet');
        expect(result).toHaveProperty('source');
        expect(result).toHaveProperty('relevanceScore');
      }
      /* eslint-enable jest/no-conditional-expect */
    });

    it('도시정비법 검색', async () => {
      const results = await service.searchWeb('도시정비법');
      expect(results.length).toBeGreaterThan(0);
      
      const result = results.find(r => r.title.includes('도시 및 주거환경정비법'));
      expect(result).toBeDefined();
      /* eslint-disable jest/no-conditional-expect -- result may be undefined */
      if (result) {
        expect(result.relevanceScore).toBeGreaterThan(0);
      }
      /* eslint-enable jest/no-conditional-expect */
    });

    it('재건축 검색', async () => {
      const results = await service.searchWeb('재건축');
      expect(results.length).toBeGreaterThan(0);
    });

    it('시공사 검색', async () => {
      const results = await service.searchWeb('시공사');
      expect(results.length).toBeGreaterThan(0);
    });

    it('아파트 가격 검색', async () => {
      const results = await service.searchWeb('아파트 가격');
      expect(results.length).toBeGreaterThan(0);
    });

    it('최대 결과 수 제한', async () => {
      const options: SearchOptions = {
        maxResults: 5,
      };
      const results = await service.searchWeb('테스트', options);
      expect(results.length).toBeLessThanOrEqual(5);
    });

    it('검색 실패 시 빈 배열 반환', async () => {
      // 에러가 발생해도 빈 배열 반환
      const results = await service.searchWeb('');
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('네이버 검색', () => {
    it('네이버 검색 실행', async () => {
      const results = await service.searchNaver('테스트');
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    it('네이버 검색 결과 구조', async () => {
      const results = await service.searchNaver('테스트');
      /* eslint-disable jest/no-conditional-expect -- structure when non-empty */
      if (results.length > 0) {
        const result = results[0];
        expect(result.source).toBe('Naver');
        expect(result.title).toContain('네이버');
      }
      /* eslint-enable jest/no-conditional-expect */
    });

    it('네이버 검색 옵션 적용', async () => {
      const options: SearchOptions = {
        maxResults: 3,
      };
      const results = await service.searchNaver('테스트', options);
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('다음 검색', () => {
    it('다음 검색 실행', async () => {
      const results = await service.searchDaum('테스트');
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    it('다음 검색 결과 구조', async () => {
      const results = await service.searchDaum('테스트');
      /* eslint-disable jest/no-conditional-expect -- structure when non-empty */
      if (results.length > 0) {
        const result = results[0];
        expect(result.source).toBe('Daum');
        expect(result.title).toContain('다음');
      }
      /* eslint-enable jest/no-conditional-expect */
    });
  });

  describe('부동산 사이트 검색', () => {
    it('부동산 사이트 검색 실행', async () => {
      const results = await service.searchRealEstateSites('아파트');
      expect(Array.isArray(results)).toBe(true);
    });

    it('검색 결과 정렬 확인', async () => {
      const results = await service.searchRealEstateSites('아파트');
      /* eslint-disable jest/no-conditional-expect -- ordering when multiple */
      if (results.length > 1) {
        for (let i = 0; i < results.length - 1; i++) {
          expect(results[i].relevanceScore).toBeGreaterThanOrEqual(results[i + 1].relevanceScore);
        }
      }
      /* eslint-enable jest/no-conditional-expect */
    });
  });

  describe('법령 정보 검색', () => {
    it('법령 정보 검색 실행', async () => {
      const results = await service.searchLegalInfo('도시정비법');
      expect(Array.isArray(results)).toBe(true);
    });

    it('법령 검색 결과 확인', async () => {
      const results = await service.searchLegalInfo('건축법');
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('검색 결과 필터링', () => {
    it('기본 필터링', () => {
      const results: SearchResult[] = [
        {
          title: '테스트 1',
          url: 'https://example.com/1',
          snippet: '테스트',
          source: 'Source1',
          relevanceScore: 0.9,
        },
        {
          title: '테스트 2',
          url: 'https://example.com/2',
          snippet: '테스트',
          source: 'Source2',
          relevanceScore: 0.5,
        },
      ];

      const filtered = service.filterResults(results, {});
      expect(filtered.length).toBe(2);
    });

    it('최소 관련도 점수 필터링', () => {
      const results: SearchResult[] = [
        {
          title: '테스트 1',
          url: 'https://example.com/1',
          snippet: '테스트',
          source: 'Source1',
          relevanceScore: 0.9,
        },
        {
          title: '테스트 2',
          url: 'https://example.com/2',
          snippet: '테스트',
          source: 'Source2',
          relevanceScore: 0.5,
        },
      ];

      const filtered = service.filterResults(results, {
        minRelevanceScore: 0.7,
      });
      expect(filtered.length).toBe(1);
      expect(filtered[0].relevanceScore).toBe(0.9);
    });

    it('소스 필터링', () => {
      const results: SearchResult[] = [
        {
          title: '테스트 1',
          url: 'https://example.com/1',
          snippet: '테스트',
          source: 'Source1',
          relevanceScore: 0.9,
        },
        {
          title: '테스트 2',
          url: 'https://example.com/2',
          snippet: '테스트',
          source: 'Source2',
          relevanceScore: 0.8,
        },
      ];

      const filtered = service.filterResults(results, {
        sources: ['Source1'],
      });
      expect(filtered.length).toBe(1);
      expect(filtered[0].source).toBe('Source1');
    });

    it('날짜 범위 필터링', () => {
      const results: SearchResult[] = [
        {
          title: '테스트 1',
          url: 'https://example.com/1',
          snippet: '테스트',
          source: 'Source1',
          relevanceScore: 0.9,
          publishedDate: new Date('2024-01-15'),
        },
        {
          title: '테스트 2',
          url: 'https://example.com/2',
          snippet: '테스트',
          source: 'Source2',
          relevanceScore: 0.8,
          publishedDate: new Date('2024-02-15'),
        },
      ];

      const filtered = service.filterResults(results, {
        dateRange: {
          from: new Date('2024-01-01'),
          to: new Date('2024-01-31'),
        },
      });
      expect(filtered.length).toBe(1);
      expect(filtered[0].title).toBe('테스트 1');
    });

    it('복합 필터링', () => {
      const results: SearchResult[] = [
        {
          title: '테스트 1',
          url: 'https://example.com/1',
          snippet: '테스트',
          source: 'Source1',
          relevanceScore: 0.9,
          publishedDate: new Date('2024-01-15'),
        },
        {
          title: '테스트 2',
          url: 'https://example.com/2',
          snippet: '테스트',
          source: 'Source2',
          relevanceScore: 0.8,
          publishedDate: new Date('2024-02-15'),
        },
      ];

      const filtered = service.filterResults(results, {
        minRelevanceScore: 0.85,
        sources: ['Source1'],
        dateRange: {
          from: new Date('2024-01-01'),
          to: new Date('2024-01-31'),
        },
      });
      expect(filtered.length).toBe(1);
    });
  });

  describe('검색 결과 요약', () => {
    it('기본 요약', () => {
      const results: SearchResult[] = [
        {
          title: '테스트 1',
          url: 'https://example.com/1',
          snippet: '테스트',
          source: 'Source1',
          relevanceScore: 0.9,
        },
        {
          title: '테스트 2',
          url: 'https://example.com/2',
          snippet: '테스트',
          source: 'Source2',
          relevanceScore: 0.8,
        },
      ];

      const summary = service.summarizeResults(results);
      expect(summary).toHaveProperty('totalResults');
      expect(summary).toHaveProperty('averageRelevance');
      expect(summary).toHaveProperty('topSources');
      expect(summary).toHaveProperty('dateRange');
    });

    it('총 결과 수 계산', () => {
      const results: SearchResult[] = Array.from({ length: 5 }, (_, i) => ({
        title: `테스트 ${i}`,
        url: `https://example.com/${i}`,
        snippet: '테스트',
        source: 'Source1',
        relevanceScore: 0.8,
      }));

      const summary = service.summarizeResults(results);
      expect(summary.totalResults).toBe(5);
    });

    it('평균 관련도 계산', () => {
      const results: SearchResult[] = [
        {
          title: '테스트 1',
          url: 'https://example.com/1',
          snippet: '테스트',
          source: 'Source1',
          relevanceScore: 0.9,
        },
        {
          title: '테스트 2',
          url: 'https://example.com/2',
          snippet: '테스트',
          source: 'Source2',
          relevanceScore: 0.7,
        },
      ];

      const summary = service.summarizeResults(results);
      expect(summary.averageRelevance).toBe(0.8);
    });

    it('상위 소스 추출', () => {
      const results: SearchResult[] = [
        {
          title: '테스트 1',
          url: 'https://example.com/1',
          snippet: '테스트',
          source: 'Source1',
          relevanceScore: 0.9,
        },
        {
          title: '테스트 2',
          url: 'https://example.com/2',
          snippet: '테스트',
          source: 'Source1',
          relevanceScore: 0.8,
        },
        {
          title: '테스트 3',
          url: 'https://example.com/3',
          snippet: '테스트',
          source: 'Source2',
          relevanceScore: 0.7,
        },
      ];

      const summary = service.summarizeResults(results);
      expect(summary.topSources).toContain('Source1');
      expect(summary.topSources.length).toBeLessThanOrEqual(5);
    });

    it('날짜 범위 계산', () => {
      const results: SearchResult[] = [
        {
          title: '테스트 1',
          url: 'https://example.com/1',
          snippet: '테스트',
          source: 'Source1',
          relevanceScore: 0.9,
          publishedDate: new Date('2024-01-15'),
        },
        {
          title: '테스트 2',
          url: 'https://example.com/2',
          snippet: '테스트',
          source: 'Source2',
          relevanceScore: 0.8,
          publishedDate: new Date('2024-02-15'),
        },
      ];

      const summary = service.summarizeResults(results);
      expect(summary.dateRange.earliest).toBeDefined();
      expect(summary.dateRange.latest).toBeDefined();
    });

    it('날짜 없는 결과 요약', () => {
      const results: SearchResult[] = [
        {
          title: '테스트 1',
          url: 'https://example.com/1',
          snippet: '테스트',
          source: 'Source1',
          relevanceScore: 0.9,
        },
      ];

      const summary = service.summarizeResults(results);
      expect(summary.dateRange.earliest).toBeNull();
      expect(summary.dateRange.latest).toBeNull();
    });

    it('빈 결과 요약', () => {
      const summary = service.summarizeResults([]);
      expect(summary.totalResults).toBe(0);
      expect(isNaN(summary.averageRelevance)).toBe(true);
      expect(summary.topSources.length).toBe(0);
    });
  });

  describe('에지 케이스', () => {
    it('빈 쿼리 검색', async () => {
      const results = await service.searchWeb('');
      expect(Array.isArray(results)).toBe(true);
    });

    it('특수 문자 포함 쿼리', async () => {
      const results = await service.searchWeb('테스트 #해시태그 @멘션');
      expect(Array.isArray(results)).toBe(true);
    });

    it('긴 쿼리 검색', async () => {
      const longQuery = '테스트 '.repeat(50);
      const results = await service.searchWeb(longQuery);
      expect(Array.isArray(results)).toBe(true);
    });

    it('여러 필터 조건 적용', () => {
      const results: SearchResult[] = [
        {
          title: '테스트 1',
          url: 'https://example.com/1',
          snippet: '테스트',
          source: 'Source1',
          relevanceScore: 0.9,
          publishedDate: new Date('2024-01-15'),
        },
        {
          title: '테스트 2',
          url: 'https://example.com/2',
          snippet: '테스트',
          source: 'Source2',
          relevanceScore: 0.5,
          publishedDate: new Date('2024-02-15'),
        },
      ];

      const filtered = service.filterResults(results, {
        minRelevanceScore: 0.7,
        sources: ['Source1'],
        dateRange: {
          from: new Date('2024-01-01'),
          to: new Date('2024-01-31'),
        },
      });
      expect(filtered.length).toBe(1);
    });
  });
});

