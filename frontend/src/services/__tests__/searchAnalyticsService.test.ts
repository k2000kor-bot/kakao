/**
 * searchAnalyticsService 서비스 테스트
 * 검색 통계 및 분석 서비스 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import searchAnalyticsService from '../searchAnalyticsService';
import searchHistoryService from '../searchHistoryService';

// searchHistoryService 모킹
jest.mock('../searchHistoryService', () => ({
  __esModule: true,
  default: {
    getRecentSearches: jest.fn(),
    getPopularSearches: jest.fn(),
  },
}));

const mockSearchHistoryService: jest.Mocked<typeof searchHistoryService> = jest.mocked(searchHistoryService);

describe('searchAnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('싱글톤 인스턴스', () => {
    it('내보낸 인스턴스가 정의되어 있어야 함', () => {
      expect(searchAnalyticsService).toBeDefined();
    });
  });

  describe('getStatistics', () => {
    it('검색 통계를 조회할 수 있어야 함', () => {
      mockSearchHistoryService.getRecentSearches.mockReturnValue([
        {
          query: '테스트 검색',
          timestamp: new Date().toISOString(),
          resultCount: 5,
          searchType: 'message',
        },
        {
          query: '또 다른 검색',
          timestamp: new Date().toISOString(),
          resultCount: 3,
          searchType: 'file',
        },
      ]);

      const stats = searchAnalyticsService.getStatistics();

      expect(stats).toBeDefined();
      expect(stats.totalSearches).toBe(2);
      expect(stats.uniqueQueries).toBe(2);
    });

    it('검색 히스토리가 없으면 빈 통계를 반환해야 함', () => {
      mockSearchHistoryService.getRecentSearches.mockReturnValue([]);

      const stats = searchAnalyticsService.getStatistics();

      expect(stats.totalSearches).toBe(0);
      expect(stats.uniqueQueries).toBe(0);
      expect(stats.averageResultsPerSearch).toBe(0);
      expect(stats.mostSearchedTerms).toEqual([]);
      expect(stats.searchTrends).toEqual([]);
      expect(stats.searchTypes).toEqual({});
      expect(stats.timeDistribution).toEqual({});
    });

    it('고유 검색어 수를 계산해야 함', () => {
      mockSearchHistoryService.getRecentSearches.mockReturnValue([
        {
          query: '테스트',
          timestamp: new Date().toISOString(),
          resultCount: 5,
        },
        {
          query: '테스트',
          timestamp: new Date().toISOString(),
          resultCount: 3,
        },
        {
          query: '다른 검색',
          timestamp: new Date().toISOString(),
          resultCount: 2,
        },
      ]);

      const stats = searchAnalyticsService.getStatistics();

      expect(stats.uniqueQueries).toBe(2);
    });

    it('평균 결과 수를 계산해야 함', () => {
      mockSearchHistoryService.getRecentSearches.mockReturnValue([
        {
          query: '검색1',
          timestamp: new Date().toISOString(),
          resultCount: 10,
        },
        {
          query: '검색2',
          timestamp: new Date().toISOString(),
          resultCount: 5,
        },
        {
          query: '검색3',
          timestamp: new Date().toISOString(),
          resultCount: 0,
        },
      ]);

      const stats = searchAnalyticsService.getStatistics();

      expect(stats.averageResultsPerSearch).toBe(5);
    });

    it('가장 많이 검색된 용어를 반환해야 함', () => {
      mockSearchHistoryService.getRecentSearches.mockReturnValue([
        {
          query: '인기 검색',
          timestamp: new Date().toISOString(),
          resultCount: 5,
        },
        {
          query: '인기 검색',
          timestamp: new Date().toISOString(),
          resultCount: 3,
        },
        {
          query: '인기 검색',
          timestamp: new Date().toISOString(),
          resultCount: 2,
        },
        {
          query: '일반 검색',
          timestamp: new Date().toISOString(),
          resultCount: 1,
        },
      ]);

      const stats = searchAnalyticsService.getStatistics();

      expect(stats.mostSearchedTerms.length).toBeGreaterThan(0);
      expect(stats.mostSearchedTerms[0].query).toBe('인기 검색');
      expect(stats.mostSearchedTerms[0].count).toBe(3);
    });

    it('검색 트렌드를 계산해야 함', () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      mockSearchHistoryService.getRecentSearches.mockReturnValue([
        {
          query: '검색1',
          timestamp: now.toISOString(),
          resultCount: 5,
        },
        {
          query: '검색2',
          timestamp: yesterday.toISOString(),
          resultCount: 3,
        },
      ]);

      const stats = searchAnalyticsService.getStatistics();

      expect(stats.searchTrends).toBeDefined();
      expect(Array.isArray(stats.searchTrends)).toBe(true);
    });

    it('검색 타입별 통계를 계산해야 함', () => {
      mockSearchHistoryService.getRecentSearches.mockReturnValue([
        {
          query: '검색1',
          timestamp: new Date().toISOString(),
          resultCount: 5,
          searchType: 'message',
        },
        {
          query: '검색2',
          timestamp: new Date().toISOString(),
          resultCount: 3,
          searchType: 'file',
        },
        {
          query: '검색3',
          timestamp: new Date().toISOString(),
          resultCount: 2,
          searchType: 'message',
        },
      ]);

      const stats = searchAnalyticsService.getStatistics();

      expect(stats.searchTypes['message']).toBe(2);
      expect(stats.searchTypes['file']).toBe(1);
    });

    it('시간대별 분포를 계산해야 함', () => {
      const now = new Date();
      now.setHours(14); // 오후 2시

      mockSearchHistoryService.getRecentSearches.mockReturnValue([
        {
          query: '오후 검색',
          timestamp: now.toISOString(),
          resultCount: 5,
        },
      ]);

      const stats = searchAnalyticsService.getStatistics();

      expect(stats.timeDistribution).toBeDefined();
      expect(Object.keys(stats.timeDistribution).length).toBeGreaterThan(0);
    });
  });

  describe('getInsights', () => {
    it('검색 인사이트를 생성할 수 있어야 함', () => {
      mockSearchHistoryService.getRecentSearches.mockReturnValue([
        {
          query: '테스트',
          timestamp: new Date().toISOString(),
          resultCount: 5,
        },
      ]);

      const insights = searchAnalyticsService.getInsights();

      expect(Array.isArray(insights)).toBe(true);
    });

    it('검색 활동 증가 시 증가 인사이트를 생성해야 함', () => {
      const now = new Date();
      const dates = [];
      // 최근 7일간 증가하는 패턴 생성
      for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (6 - i));
        // 날짜별로 검색 수를 증가시키기 위해 여러 검색 추가
        for (let j = 0; j < i + 1; j++) {
          dates.push({
            query: `검색${i}-${j}`,
            timestamp: date.toISOString(),
            resultCount: 5,
          });
        }
      }

      mockSearchHistoryService.getRecentSearches.mockReturnValue(dates);

      const insights = searchAnalyticsService.getInsights();

      // 트렌드 인사이트가 생성되거나, 최소한 인사이트가 생성되어야 함
      expect(insights.length).toBeGreaterThan(0);
    });

    it('자주 검색하는 용어가 있으면 패턴 인사이트를 생성해야 함', () => {
      const searches = [];
      for (let i = 0; i < 5; i++) {
        searches.push({
          query: '인기 검색어',
          timestamp: new Date().toISOString(),
          resultCount: 5,
        });
      }

      mockSearchHistoryService.getRecentSearches.mockReturnValue(searches);

      const insights = searchAnalyticsService.getInsights();

      expect(insights.some(i => i.type === 'pattern' && i.title.includes('자주 검색'))).toBe(true);
    });

    it('검색 결과가 적으면 개선 제안 인사이트를 생성해야 함', () => {
      mockSearchHistoryService.getRecentSearches.mockReturnValue([
        {
          query: '검색1',
          timestamp: new Date().toISOString(),
          resultCount: 0,
        },
        {
          query: '검색2',
          timestamp: new Date().toISOString(),
          resultCount: 0,
        },
      ]);

      const insights = searchAnalyticsService.getInsights();

      expect(insights.some(i => i.type === 'recommendation' && i.title.includes('개선'))).toBe(true);
    });

    it('활발한 검색 시간대 인사이트를 생성해야 함', () => {
      const now = new Date();
      now.setHours(14); // 오후 2시

      mockSearchHistoryService.getRecentSearches.mockReturnValue([
        {
          query: '검색',
          timestamp: now.toISOString(),
          resultCount: 5,
        },
      ]);

      const insights = searchAnalyticsService.getInsights();

      expect(insights.some(i => i.type === 'pattern' && i.title.includes('시간대'))).toBe(true);
    });
  });

  describe('getSuccessRate', () => {
    it('검색 성공률을 계산할 수 있어야 함', () => {
      mockSearchHistoryService.getRecentSearches.mockReturnValue([
        {
          query: '검색1',
          timestamp: new Date().toISOString(),
          resultCount: 5,
        },
        {
          query: '검색2',
          timestamp: new Date().toISOString(),
          resultCount: 3,
        },
        {
          query: '검색3',
          timestamp: new Date().toISOString(),
          resultCount: 0,
        },
      ]);

      const successRate = searchAnalyticsService.getSuccessRate();

      expect(typeof successRate).toBe('number');
      expect(successRate).toBeGreaterThanOrEqual(0);
      expect(successRate).toBeLessThanOrEqual(100);
    });

    it('검색 히스토리가 없으면 0을 반환해야 함', () => {
      mockSearchHistoryService.getRecentSearches.mockReturnValue([]);

      const successRate = searchAnalyticsService.getSuccessRate();

      expect(successRate).toBe(0);
    });

    it('모든 검색이 성공하면 100을 반환해야 함', () => {
      mockSearchHistoryService.getRecentSearches.mockReturnValue([
        {
          query: '검색1',
          timestamp: new Date().toISOString(),
          resultCount: 5,
        },
        {
          query: '검색2',
          timestamp: new Date().toISOString(),
          resultCount: 3,
        },
      ]);

      const successRate = searchAnalyticsService.getSuccessRate();

      expect(successRate).toBe(100);
    });

    it('모든 검색이 실패하면 0을 반환해야 함', () => {
      mockSearchHistoryService.getRecentSearches.mockReturnValue([
        {
          query: '검색1',
          timestamp: new Date().toISOString(),
          resultCount: 0,
        },
        {
          query: '검색2',
          timestamp: new Date().toISOString(),
          resultCount: 0,
        },
      ]);

      const successRate = searchAnalyticsService.getSuccessRate();

      expect(successRate).toBe(0);
    });
  });

  describe('getRecommendations', () => {
    it('검색어 추천을 반환할 수 있어야 함', () => {
      mockSearchHistoryService.getRecentSearches.mockReturnValue([
        {
          query: '테스트 검색어',
          timestamp: new Date().toISOString(),
          resultCount: 5,
        },
      ]);

      mockSearchHistoryService.getPopularSearches.mockReturnValue([
        {
          query: '테스트 검색어 확장',
          count: 5,
          lastSearched: new Date().toISOString(),
        },
      ]);

      const recommendations = searchAnalyticsService.getRecommendations('테스트');

      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('현재 검색어와 일치하는 추천은 제외해야 함', () => {
      mockSearchHistoryService.getRecentSearches.mockReturnValue([
        {
          query: '테스트',
          timestamp: new Date().toISOString(),
          resultCount: 5,
        },
      ]);

      mockSearchHistoryService.getPopularSearches.mockReturnValue([
        {
          query: '테스트',
          count: 5,
          lastSearched: new Date().toISOString(),
        },
      ]);

      const recommendations = searchAnalyticsService.getRecommendations('테스트');

      expect(recommendations).not.toContain('테스트');
    });

    it('최대 5개의 추천을 반환해야 함', () => {
      const searches = [];
      for (let i = 0; i < 10; i++) {
        searches.push({
          query: `테스트 검색어 ${i}`,
          timestamp: new Date().toISOString(),
          resultCount: 5,
        });
      }

      mockSearchHistoryService.getRecentSearches.mockReturnValue(searches);
      mockSearchHistoryService.getPopularSearches.mockReturnValue([]);

      const recommendations = searchAnalyticsService.getRecommendations('테스트');

      expect(recommendations.length).toBeLessThanOrEqual(5);
    });

    it('인기 검색어에서 추천을 찾을 수 있어야 함', () => {
      mockSearchHistoryService.getRecentSearches.mockReturnValue([]);

      mockSearchHistoryService.getPopularSearches.mockReturnValue([
        {
          query: '테스트 검색어',
          count: 5,
          lastSearched: new Date().toISOString(),
        },
        {
          query: '테스트 데이터',
          count: 3,
          lastSearched: new Date().toISOString(),
        },
      ]);

      const recommendations = searchAnalyticsService.getRecommendations('테스트');

      expect(recommendations.length).toBeGreaterThan(0);
    });
  });
});

