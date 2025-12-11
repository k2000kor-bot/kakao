/**
 * 검색 히스토리 관리 서비스
 * 최근 검색어 저장, 인기 검색어 추적, 자동완성 기능 제공
 * 
 * Task-D2: 검색 히스토리 및 자동완성
 */

import { errorLogger } from '../utils/errorLogger';

export interface SearchHistoryItem {
  query: string;
  timestamp: string;
  resultCount: number;
  searchType?: 'message' | 'writing' | 'file' | 'template' | 'all';
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters?: {
    sortOption?: string;
    filterOption?: string;
    dateRange?: { from: string; to: string };
    useRegex?: boolean;
    caseSensitive?: boolean;
  };
  createdAt: string;
  lastUsed?: string;
  useCount: number;
  isShared?: boolean;
  shareId?: string;
}

export interface PopularSearchTerm {
  query: string;
  count: number;
  lastSearched: string;
}

interface SearchHistoryConfig {
  maxRecentSearches: number;
  maxPopularSearches: number;
  storageKey: string;
  popularSearchMinCount: number;
  savedSearchesKey: string;
}

class SearchHistoryService {
  private config: SearchHistoryConfig = {
    maxRecentSearches: 20,
    maxPopularSearches: 10,
    storageKey: 'corbu_search_history',
    popularSearchMinCount: 2,
    savedSearchesKey: 'corbu_saved_searches',
  };

  /**
   * 검색어 저장
   */
  saveSearch(query: string, resultCount: number = 0, searchType?: SearchHistoryItem['searchType']): void {
    if (!query || !query.trim()) return;

    const trimmedQuery = query.trim();
    const history = this.getHistory();
    const now = new Date().toISOString();

    // 중복 검색어 제거 후 새로 추가
    const filteredHistory = history.filter(item => item.query.toLowerCase() !== trimmedQuery.toLowerCase());

    const newItem: SearchHistoryItem = {
      query: trimmedQuery,
      timestamp: now,
      resultCount,
      searchType,
    };

    // 최신 검색어를 맨 앞에 추가
    filteredHistory.unshift(newItem);

    // 최대 개수 제한
    const limitedHistory = filteredHistory.slice(0, this.config.maxRecentSearches);

    // 로컬 스토리지에 저장
    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(limitedHistory));
    } catch (error) {
      errorLogger.error('검색 히스토리 저장 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'searchHistoryService',
        action: 'addSearchHistory',
        query: newItem.query,
      });
    }
  }

  /**
   * 최근 검색어 조회
   */
  getRecentSearches(limit?: number): SearchHistoryItem[] {
    const history = this.getHistory();
    const limitCount = limit || this.config.maxRecentSearches;
    return history.slice(0, limitCount);
  }

  /**
   * 인기 검색어 조회
   */
  getPopularSearches(limit?: number): PopularSearchTerm[] {
    const history = this.getHistory();
    const limitCount = limit || this.config.maxPopularSearches;

    // 검색어별 카운트 집계
    const queryCounts = new Map<string, { count: number; lastSearched: string }>();

    history.forEach(item => {
      const lowerQuery = item.query.toLowerCase();
      const existing = queryCounts.get(lowerQuery);

      if (existing) {
        existing.count++;
        // 더 최근 검색 시간으로 업데이트
        if (new Date(item.timestamp) > new Date(existing.lastSearched)) {
          existing.lastSearched = item.timestamp;
        }
      } else {
        queryCounts.set(lowerQuery, {
          count: 1,
          lastSearched: item.timestamp,
        });
      }
    });

    // 카운트가 최소값 이상인 것만 필터링하고 정렬
    const popular: PopularSearchTerm[] = Array.from(queryCounts.entries())
      .filter(([_, data]) => data.count >= this.config.popularSearchMinCount)
      .map(([query, data]) => ({
        query,
        count: data.count,
        lastSearched: data.lastSearched,
      }))
      .sort((a, b) => {
        // 먼저 카운트로 정렬, 같으면 최근 검색 시간으로 정렬
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        return new Date(b.lastSearched).getTime() - new Date(a.lastSearched).getTime();
      })
      .slice(0, limitCount);

    return popular;
  }

  /**
   * 검색어 자동완성 제안
   */
  getAutocompleteSuggestions(input: string, limit: number = 5): string[] {
    if (!input || input.trim().length < 2) return [];

    const trimmedInput = input.trim().toLowerCase();
    const history = this.getHistory();
    const suggestions = new Set<string>();

    // 최근 검색어에서 일치하는 것 찾기
    for (const item of history) {
      const lowerQuery = item.query.toLowerCase();

      // 정확히 일치하거나 시작하는 경우
      if (lowerQuery === trimmedInput || lowerQuery.startsWith(trimmedInput)) {
        suggestions.add(item.query);
        if (suggestions.size >= limit) break;
      }
    }

    // 인기 검색어에서도 찾기
    if (suggestions.size < limit) {
      const popular = this.getPopularSearches(limit * 2);
      for (const term of popular) {
        const lowerQuery = term.query.toLowerCase();
        if (lowerQuery.startsWith(trimmedInput) && !suggestions.has(term.query)) {
          suggestions.add(term.query);
          if (suggestions.size >= limit) break;
        }
      }
    }

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * 특정 검색어 삭제
   */
  removeSearch(query: string): void {
    const history = this.getHistory();
    const filtered = history.filter(item => item.query.toLowerCase() !== query.toLowerCase());

    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(filtered));
    } catch (error) {
      errorLogger.error('검색어 삭제 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'searchHistoryService',
        action: 'removeSearchHistory',
        query,
      });
    }
  }

  /**
   * 검색 히스토리 전체 삭제
   */
  clearHistory(): void {
    try {
      localStorage.removeItem(this.config.storageKey);
    } catch (error) {
      errorLogger.error('검색 히스토리 삭제 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'searchHistoryService',
        action: 'clearSearchHistory',
      });
    }
  }

  /**
   * 검색 히스토리 조회 (내부 메서드)
   */
  private getHistory(): SearchHistoryItem[] {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (!stored) return [];

      const history = JSON.parse(stored) as SearchHistoryItem[];
      return Array.isArray(history) ? history : [];
    } catch (error) {
      errorLogger.error('검색 히스토리 조회 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'searchHistoryService',
        action: 'getSearchHistory',
      });
      return [];
    }
  }

  /**
   * 검색어가 히스토리에 있는지 확인
   */
  hasSearch(query: string): boolean {
    const history = this.getHistory();
    return history.some(item => item.query.toLowerCase() === query.toLowerCase());
  }

  /**
   * 검색어 검색 횟수 조회
   */
  getSearchCount(query: string): number {
    const history = this.getHistory();
    const lowerQuery = query.toLowerCase();
    return history.filter(item => item.query.toLowerCase() === lowerQuery).length;
  }

  /**
   * 검색 저장
   */
  saveSearchQuery(name: string, query: string, filters?: SavedSearch['filters']): SavedSearch {
    const savedSearches = this.getSavedSearches();
    const newSearch: SavedSearch = {
      id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      query,
      filters,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      useCount: 1,
      isShared: false,
    };

    savedSearches.push(newSearch);

    try {
      localStorage.setItem(this.config.savedSearchesKey, JSON.stringify(savedSearches));
    } catch (error) {
      errorLogger.error('검색 저장 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'searchHistoryService',
        action: 'saveSearch',
        searchId: newSearch.id,
      });
    }

    return newSearch;
  }

  /**
   * 저장된 검색 목록 조회
   */
  getSavedSearches(): SavedSearch[] {
    try {
      const stored = localStorage.getItem(this.config.savedSearchesKey);
      if (!stored) return [];

      const searches = JSON.parse(stored) as SavedSearch[];
      return Array.isArray(searches) ? searches : [];
    } catch (error) {
      errorLogger.error('저장된 검색 조회 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'searchHistoryService',
        action: 'getSavedSearches',
      });
      return [];
    }
  }

  /**
   * 저장된 검색 삭제
   */
  deleteSavedSearch(id: string): void {
    const savedSearches = this.getSavedSearches();
    const filtered = savedSearches.filter(s => s.id !== id);

    try {
      localStorage.setItem(this.config.savedSearchesKey, JSON.stringify(filtered));
    } catch (error) {
      errorLogger.error('저장된 검색 삭제 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'searchHistoryService',
        action: 'deleteSavedSearch',
        searchId: id,
      });
    }
  }

  /**
   * 저장된 검색 사용 (사용 횟수 증가)
   */
  useSavedSearch(id: string): SavedSearch | null {
    const savedSearches = this.getSavedSearches();
    const search = savedSearches.find(s => s.id === id);

    if (search) {
      search.useCount = (search.useCount || 0) + 1;
      search.lastUsed = new Date().toISOString();

      try {
        localStorage.setItem(this.config.savedSearchesKey, JSON.stringify(savedSearches));
      } catch (error) {
        errorLogger.error('저장된 검색 업데이트 실패', error instanceof Error ? error : new Error(String(error)), {
          component: 'searchHistoryService',
          action: 'updateSavedSearch',
          searchId: search.id,
        });
      }
    }

    return search || null;
  }

  /**
   * 검색 공유 ID 생성
   */
  shareSearch(id: string): string {
    const savedSearches = this.getSavedSearches();
    const search = savedSearches.find(s => s.id === id);

    if (search) {
      const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      search.isShared = true;
      search.shareId = shareId;

      try {
        localStorage.setItem(this.config.savedSearchesKey, JSON.stringify(savedSearches));
        // 공유 검색 저장소에도 저장
        const sharedSearches = this.getSharedSearches();
        sharedSearches.push({
          ...search,
          shareId,
        });
        localStorage.setItem('corbu_shared_searches', JSON.stringify(sharedSearches));
      } catch (error) {
        errorLogger.error('검색 공유 실패', error instanceof Error ? error : new Error(String(error)), {
          component: 'searchHistoryService',
          action: 'shareSearch',
          searchId: search.id,
        });
      }

      return shareId;
    }

    return '';
  }

  /**
   * 공유된 검색 조회
   */
  getSharedSearches(): SavedSearch[] {
    try {
      const stored = localStorage.getItem('corbu_shared_searches');
      if (!stored) return [];

      const searches = JSON.parse(stored) as SavedSearch[];
      return Array.isArray(searches) ? searches : [];
    } catch (error) {
      errorLogger.error('공유된 검색 조회 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'searchHistoryService',
        action: 'getSharedSearches',
      });
      return [];
    }
  }

  /**
   * 공유 ID로 검색 조회
   */
  getSearchByShareId(shareId: string): SavedSearch | null {
    const sharedSearches = this.getSharedSearches();
    return sharedSearches.find(s => s.shareId === shareId) || null;
  }
}

// 싱글톤 인스턴스
const searchHistoryService = new SearchHistoryService();

export default searchHistoryService;

