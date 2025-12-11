/**
 * 검색 통계 및 분석 서비스
 * 검색 패턴 분석, 통계 수집, 인사이트 제공
 * 
 * Task-D3: 검색 고도화
 */

import searchHistoryService, { SearchHistoryItem } from './searchHistoryService';

export interface SearchStatistics {
  totalSearches: number;
  uniqueQueries: number;
  averageResultsPerSearch: number;
  mostSearchedTerms: Array<{ query: string; count: number }>;
  searchTrends: Array<{ date: string; count: number }>;
  searchTypes: Record<string, number>;
  timeDistribution: Record<string, number>;
}

export interface SearchInsight {
  type: 'trend' | 'pattern' | 'recommendation';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

class SearchAnalyticsService {
  private storageKey = 'corbu_search_analytics';

  /**
   * 검색 통계 조회
   */
  getStatistics(): SearchStatistics {
    const history = searchHistoryService.getRecentSearches(1000); // 최근 1000개 검색
    const totalSearches = history.length;

    if (totalSearches === 0) {
      return {
        totalSearches: 0,
        uniqueQueries: 0,
        averageResultsPerSearch: 0,
        mostSearchedTerms: [],
        searchTrends: [],
        searchTypes: {},
        timeDistribution: {},
      };
    }

    // 고유 검색어 수
    const uniqueQueries = new Set(history.map(item => item.query.toLowerCase())).size;

    // 평균 결과 수
    const totalResults = history.reduce((sum, item) => sum + (item.resultCount || 0), 0);
    const averageResultsPerSearch = totalResults / totalSearches;

    // 가장 많이 검색된 용어
    const queryCounts = new Map<string, number>();
    history.forEach(item => {
      const lowerQuery = item.query.toLowerCase();
      queryCounts.set(lowerQuery, (queryCounts.get(lowerQuery) || 0) + 1);
    });

    const mostSearchedTerms = Array.from(queryCounts.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 검색 트렌드 (날짜별)
    const trends = new Map<string, number>();
    history.forEach(item => {
      const date = new Date(item.timestamp).toISOString().split('T')[0];
      trends.set(date, (trends.get(date) || 0) + 1);
    });

    const searchTrends = Array.from(trends.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // 최근 30일

    // 검색 타입별 통계
    const searchTypes: Record<string, number> = {};
    history.forEach(item => {
      const type = item.searchType || 'all';
      searchTypes[type] = (searchTypes[type] || 0) + 1;
    });

    // 시간대별 분포
    const timeDistribution: Record<string, number> = {};
    history.forEach(item => {
      const hour = new Date(item.timestamp).getHours();
      const timeSlot = this.getTimeSlot(hour);
      timeDistribution[timeSlot] = (timeDistribution[timeSlot] || 0) + 1;
    });

    return {
      totalSearches,
      uniqueQueries,
      averageResultsPerSearch: Math.round(averageResultsPerSearch * 10) / 10,
      mostSearchedTerms,
      searchTrends,
      searchTypes,
      timeDistribution,
    };
  }

  /**
   * 시간대 슬롯 반환
   */
  private getTimeSlot(hour: number): string {
    if (hour >= 6 && hour < 12) return '오전 (6-12시)';
    if (hour >= 12 && hour < 18) return '오후 (12-18시)';
    if (hour >= 18 && hour < 24) return '저녁 (18-24시)';
    return '새벽 (0-6시)';
  }

  /**
   * 검색 인사이트 생성
   */
  getInsights(): SearchInsight[] {
    const stats = this.getStatistics();
    const insights: SearchInsight[] = [];

    // 검색 트렌드 분석
    if (stats.searchTrends.length >= 7) {
      const recentTrends = stats.searchTrends.slice(-7);
      const trendDirection = this.analyzeTrend(recentTrends);
      
      if (trendDirection === 'increasing') {
        insights.push({
          type: 'trend',
          title: '검색 활동 증가',
          description: '최근 7일간 검색 활동이 증가하고 있습니다.',
          priority: 'medium',
        });
      } else if (trendDirection === 'decreasing') {
        insights.push({
          type: 'trend',
          title: '검색 활동 감소',
          description: '최근 7일간 검색 활동이 감소하고 있습니다.',
          priority: 'low',
        });
      }
    }

    // 검색 패턴 분석
    if (stats.mostSearchedTerms.length > 0) {
      const topTerm = stats.mostSearchedTerms[0];
      if (topTerm.count >= 5) {
        insights.push({
          type: 'pattern',
          title: '자주 검색하는 용어',
          description: `"${topTerm.query}"를 ${topTerm.count}회 검색했습니다. 저장된 검색으로 추가하면 더 빠르게 접근할 수 있습니다.`,
          priority: 'high',
        });
      }
    }

    // 검색 효율성 분석
    if (stats.averageResultsPerSearch < 1) {
      insights.push({
        type: 'recommendation',
        title: '검색 결과 개선 제안',
        description: '검색 결과가 적습니다. 검색어를 더 구체적으로 입력하거나 필터를 조정해보세요.',
        priority: 'medium',
      });
    }

    // 시간대 패턴 분석
    const timeSlots = Object.entries(stats.timeDistribution);
    if (timeSlots.length > 0) {
      const mostActiveSlot = timeSlots.sort((a, b) => b[1] - a[1])[0];
      insights.push({
        type: 'pattern',
        title: '활발한 검색 시간대',
        description: `${mostActiveSlot[0]}에 가장 많이 검색합니다.`,
        priority: 'low',
      });
    }

    return insights;
  }

  /**
   * 트렌드 방향 분석
   */
  private analyzeTrend(trends: Array<{ date: string; count: number }>): 'increasing' | 'decreasing' | 'stable' {
    if (trends.length < 2) return 'stable';

    const firstHalf = trends.slice(0, Math.floor(trends.length / 2));
    const secondHalf = trends.slice(Math.floor(trends.length / 2));

    const firstAvg = firstHalf.reduce((sum, t) => sum + t.count, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, t) => sum + t.count, 0) / secondHalf.length;

    const diff = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (diff > 10) return 'increasing';
    if (diff < -10) return 'decreasing';
    return 'stable';
  }

  /**
   * 검색 성공률 계산
   */
  getSuccessRate(): number {
    const history = searchHistoryService.getRecentSearches(100);
    if (history.length === 0) return 0;

    const successfulSearches = history.filter(item => (item.resultCount || 0) > 0).length;
    return Math.round((successfulSearches / history.length) * 100);
  }

  /**
   * 검색어 추천
   */
  getRecommendations(currentQuery: string): string[] {
    const history = searchHistoryService.getRecentSearches(50);
    const popular = searchHistoryService.getPopularSearches(10);
    
    const recommendations: string[] = [];
    const lowerQuery = currentQuery.toLowerCase();

    // 인기 검색어에서 유사한 것 찾기
    popular.forEach(term => {
      if (term.query.toLowerCase().includes(lowerQuery) && term.query.toLowerCase() !== lowerQuery) {
        recommendations.push(term.query);
      }
    });

    // 최근 검색어에서 유사한 것 찾기
    history.forEach(item => {
      const lowerItemQuery = item.query.toLowerCase();
      if (lowerItemQuery.includes(lowerQuery) && 
          lowerItemQuery !== lowerQuery && 
          !recommendations.includes(item.query)) {
        recommendations.push(item.query);
      }
    });

    return recommendations.slice(0, 5);
  }
}

// 싱글톤 인스턴스
const searchAnalyticsService = new SearchAnalyticsService();

export default searchAnalyticsService;

