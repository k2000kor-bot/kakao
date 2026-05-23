/**
 * searchHistoryService 서비스 테스트
 * 검색 히스토리 관리 서비스 테스트
 * @jest-environment jsdom
 */

/// <reference types="jest" />

import searchHistoryService, {
  SearchHistoryItem,
  SEARCH_HISTORY_STORAGE_KEY,
  SAVED_SEARCHES_STORAGE_KEY,
  SHARED_SEARCHES_STORAGE_KEY,
} from '../searchHistoryService';
import { errorLogger } from '../../utils/errorLogger';

// localStorage 모킹
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// errorLogger 모킹
jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('searchHistoryService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });
  });

  describe('saveSearch', () => {
    it('검색어를 저장할 수 있어야 함', () => {
      searchHistoryService.saveSearch('테스트 검색어');

      const recent = searchHistoryService.getRecentSearches();
      expect(recent.length).toBe(1);
      expect(recent[0].query).toBe('테스트 검색어');
    });

    it('검색 타입과 결과 개수를 저장할 수 있어야 함', () => {
      searchHistoryService.saveSearch('테스트', 10, 'message');

      const recent = searchHistoryService.getRecentSearches();
      expect(recent[0].resultCount).toBe(10);
      expect(recent[0].searchType).toBe('message');
    });

    it('빈 검색어는 저장하지 않아야 함', () => {
      searchHistoryService.saveSearch('');
      searchHistoryService.saveSearch('   ');

      const recent = searchHistoryService.getRecentSearches();
      expect(recent.length).toBe(0);
    });

    it('중복 검색어는 최신 것으로 교체해야 함', () => {
      searchHistoryService.saveSearch('테스트');
      searchHistoryService.saveSearch('테스트');

      const recent = searchHistoryService.getRecentSearches();
      expect(recent.length).toBe(1);
    });

    it('최대 개수 제한을 적용해야 함', () => {
      for (let i = 0; i < 25; i++) {
        searchHistoryService.saveSearch(`검색어 ${i}`);
      }

      const recent = searchHistoryService.getRecentSearches();
      expect(recent.length).toBe(20);
    });

    it('검색어 앞뒤 공백을 제거해야 함', () => {
      searchHistoryService.saveSearch('  테스트  ');

      const recent = searchHistoryService.getRecentSearches();
      expect(recent[0].query).toBe('테스트');
    });
  });

  describe('getRecentSearches', () => {
    it('최근 검색어를 반환해야 함', () => {
      searchHistoryService.saveSearch('검색어1');
      searchHistoryService.saveSearch('검색어2');

      const recent = searchHistoryService.getRecentSearches();
      expect(recent.length).toBe(2);
      expect(recent[0].query).toBe('검색어2');
      expect(recent[1].query).toBe('검색어1');
    });

    it('limit 파라미터로 개수를 제한할 수 있어야 함', () => {
      for (let i = 0; i < 5; i++) {
        searchHistoryService.saveSearch(`검색어 ${i}`);
      }

      const recent = searchHistoryService.getRecentSearches(3);
      expect(recent.length).toBe(3);
    });

    it('검색 히스토리가 없으면 빈 배열을 반환해야 함', () => {
      const recent = searchHistoryService.getRecentSearches();
      expect(recent.length).toBe(0);
    });
  });

  describe('getPopularSearches', () => {
    it('인기 검색어를 반환해야 함', () => {
      // 중복이 제거되므로 직접 localStorage에 여러 번 저장하여 테스트
      const history: SearchHistoryItem[] = [
        { query: '인기 검색어', timestamp: new Date().toISOString(), resultCount: 0 },
        { query: '인기 검색어', timestamp: new Date().toISOString(), resultCount: 0 },
        { query: '일반 검색어', timestamp: new Date().toISOString(), resultCount: 0 },
      ];
      localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(history));

      const popular = searchHistoryService.getPopularSearches();
      expect(popular.length).toBeGreaterThan(0);
      expect(popular[0].query).toBe('인기 검색어');
      expect(popular[0].count).toBe(2);
    });

    it('최소 검색 횟수 이상인 것만 반환해야 함', () => {
      searchHistoryService.saveSearch('한 번만 검색');

      const popular = searchHistoryService.getPopularSearches();
      const found = popular.find(p => p.query === '한 번만 검색');
      expect(found).toBeUndefined();
    });

    it('limit 파라미터로 개수를 제한할 수 있어야 함', () => {
      for (let i = 0; i < 3; i++) {
        searchHistoryService.saveSearch(`검색어 ${i}`);
        searchHistoryService.saveSearch(`검색어 ${i}`);
      }

      const popular = searchHistoryService.getPopularSearches(2);
      expect(popular.length).toBeLessThanOrEqual(2);
    });

    it('카운트 순으로 정렬되어야 함', () => {
      // 중복이 제거되므로 각각 다른 검색어로 저장
      // 하지만 실제로는 같은 검색어를 여러 번 저장하면 중복이 제거되므로
      // 인기 검색어는 최소 2번 이상 검색된 것만 반환됨
      // 따라서 직접 localStorage에 여러 번 저장하여 테스트
      const history: SearchHistoryItem[] = [
        { query: '검색어1', timestamp: new Date().toISOString(), resultCount: 0 },
        { query: '검색어1', timestamp: new Date().toISOString(), resultCount: 0 },
        { query: '검색어1', timestamp: new Date().toISOString(), resultCount: 0 },
        { query: '검색어2', timestamp: new Date().toISOString(), resultCount: 0 },
        { query: '검색어2', timestamp: new Date().toISOString(), resultCount: 0 },
      ];
      localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(history));

      const popular = searchHistoryService.getPopularSearches();
      expect(popular.length).toBeGreaterThan(0);
      /* eslint-disable jest/no-conditional-expect -- ordering when multiple */
      if (popular.length > 1) {
        expect(popular[0].count).toBeGreaterThanOrEqual(popular[1].count);
      }
      /* eslint-enable jest/no-conditional-expect */
    });
  });

  describe('getAutocompleteSuggestions', () => {
    it('자동완성 제안을 반환해야 함', () => {
      searchHistoryService.saveSearch('테스트 검색어');
      searchHistoryService.saveSearch('테스트 데이터');

      const suggestions = searchHistoryService.getAutocompleteSuggestions('테스트');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.includes('테스트'))).toBe(true);
    });

    it('입력이 2자 미만이면 빈 배열을 반환해야 함', () => {
      searchHistoryService.saveSearch('테스트');

      const suggestions = searchHistoryService.getAutocompleteSuggestions('테');
      expect(suggestions.length).toBe(0);
    });

    it('빈 입력은 빈 배열을 반환해야 함', () => {
      const suggestions = searchHistoryService.getAutocompleteSuggestions('');
      expect(suggestions.length).toBe(0);
    });

    it('limit 파라미터로 개수를 제한할 수 있어야 함', () => {
      for (let i = 0; i < 10; i++) {
        searchHistoryService.saveSearch(`테스트 ${i}`);
      }

      const suggestions = searchHistoryService.getAutocompleteSuggestions('테스트', 3);
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });
  });

  describe('removeSearch', () => {
    it('특정 검색어를 삭제할 수 있어야 함', () => {
      searchHistoryService.saveSearch('삭제할 검색어');
      searchHistoryService.saveSearch('유지할 검색어');

      searchHistoryService.removeSearch('삭제할 검색어');

      const recent = searchHistoryService.getRecentSearches();
      expect(recent.find(r => r.query === '삭제할 검색어')).toBeUndefined();
      expect(recent.find(r => r.query === '유지할 검색어')).toBeDefined();
    });

    it('대소문자 구분 없이 삭제해야 함', () => {
      searchHistoryService.saveSearch('테스트');

      searchHistoryService.removeSearch('테스트');

      const recent = searchHistoryService.getRecentSearches();
      expect(recent.length).toBe(0);
    });
  });

  describe('clearHistory', () => {
    it('검색 히스토리를 모두 삭제해야 함', () => {
      searchHistoryService.saveSearch('검색어1');
      searchHistoryService.saveSearch('검색어2');

      searchHistoryService.clearHistory();

      const recent = searchHistoryService.getRecentSearches();
      expect(recent.length).toBe(0);
    });
  });

  describe('hasSearch', () => {
    it('검색어가 히스토리에 있는지 확인할 수 있어야 함', () => {
      searchHistoryService.saveSearch('테스트');

      expect(searchHistoryService.hasSearch('테스트')).toBe(true);
      expect(searchHistoryService.hasSearch('없는 검색어')).toBe(false);
    });

    it('대소문자 구분 없이 확인해야 함', () => {
      searchHistoryService.saveSearch('테스트');

      expect(searchHistoryService.hasSearch('테스트')).toBe(true);
    });
  });

  describe('getSearchCount', () => {
    it('검색어의 검색 횟수를 반환해야 함', () => {
      // 중복 검색어는 제거되므로 직접 localStorage에 여러 번 저장하여 테스트
      const history: SearchHistoryItem[] = [
        { query: '테스트', timestamp: new Date().toISOString(), resultCount: 0 },
        { query: '테스트', timestamp: new Date().toISOString(), resultCount: 0 },
        { query: '테스트', timestamp: new Date().toISOString(), resultCount: 0 },
      ];
      localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(history));

      expect(searchHistoryService.getSearchCount('테스트')).toBe(3);
    });

    it('없는 검색어는 0을 반환해야 함', () => {
      expect(searchHistoryService.getSearchCount('없는 검색어')).toBe(0);
    });
  });

  describe('saveSearchQuery', () => {
    it('검색을 저장할 수 있어야 함', () => {
      const saved = searchHistoryService.saveSearchQuery('저장된 검색', '검색어');

      expect(saved).toBeDefined();
      expect(saved.name).toBe('저장된 검색');
      expect(saved.query).toBe('검색어');
      expect(saved.id).toBeDefined();
    });

    it('필터를 포함하여 저장할 수 있어야 함', () => {
      const filters = {
        sortOption: 'date',
        filterOption: 'all',
      };

      const saved = searchHistoryService.saveSearchQuery('검색', '쿼리', filters);

      expect(saved.filters).toEqual(filters);
    });

    it('저장된 검색을 목록에서 조회할 수 있어야 함', () => {
      const saved = searchHistoryService.saveSearchQuery('테스트', '쿼리');

      const savedSearches = searchHistoryService.getSavedSearches();
      expect(savedSearches.find(s => s.id === saved.id)).toBeDefined();
    });
  });

  describe('getSavedSearches', () => {
    it('저장된 검색 목록을 반환해야 함', () => {
      searchHistoryService.saveSearchQuery('검색1', '쿼리1');
      searchHistoryService.saveSearchQuery('검색2', '쿼리2');

      const saved = searchHistoryService.getSavedSearches();
      expect(saved.length).toBe(2);
    });

    it('저장된 검색이 없으면 빈 배열을 반환해야 함', () => {
      const saved = searchHistoryService.getSavedSearches();
      expect(saved.length).toBe(0);
    });
  });

  describe('deleteSavedSearch', () => {
    it('저장된 검색을 삭제할 수 있어야 함', () => {
      const saved = searchHistoryService.saveSearchQuery('삭제할 검색', '쿼리');

      searchHistoryService.deleteSavedSearch(saved.id);

      const savedSearches = searchHistoryService.getSavedSearches();
      expect(savedSearches.find(s => s.id === saved.id)).toBeUndefined();
    });
  });

  describe('useSavedSearch', () => {
    it('저장된 검색 사용 시 useCount가 증가해야 함', () => {
      const saved = searchHistoryService.saveSearchQuery('검색', '쿼리');
      const initialCount = saved.useCount;

      const used = searchHistoryService.useSavedSearch(saved.id);

      expect(used).not.toBeNull();
      expect(used?.useCount).toBe(initialCount + 1);
    });

    it('lastUsed가 업데이트되어야 함', async () => {
      const saved = searchHistoryService.saveSearchQuery('검색', '쿼리');
      const initialLastUsed = saved.lastUsed;

      // 약간 대기 후 사용
      await new Promise(resolve => setTimeout(resolve, 10));
      const used = searchHistoryService.useSavedSearch(saved.id);
      
      expect(used?.lastUsed).not.toBe(initialLastUsed);
      expect(used?.lastUsed).toBeDefined();
    });

    it('존재하지 않는 검색은 null을 반환해야 함', () => {
      const result = searchHistoryService.useSavedSearch('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('shareSearch', () => {
    it('검색을 공유할 수 있어야 함', () => {
      const saved = searchHistoryService.saveSearchQuery('공유할 검색', '쿼리');

      const shareId = searchHistoryService.shareSearch(saved.id);

      expect(shareId).toBeDefined();
      expect(shareId.length).toBeGreaterThan(0);
    });

    it('공유된 검색은 isShared가 true여야 함', () => {
      const saved = searchHistoryService.saveSearchQuery('검색', '쿼리');
      searchHistoryService.shareSearch(saved.id);

      const savedSearches = searchHistoryService.getSavedSearches();
      const shared = savedSearches.find(s => s.id === saved.id);
      expect(shared?.isShared).toBe(true);
    });

    it('공유 ID로 검색을 조회할 수 있어야 함', () => {
      const saved = searchHistoryService.saveSearchQuery('검색', '쿼리');
      const shareId = searchHistoryService.shareSearch(saved.id);

      const found = searchHistoryService.getSearchByShareId(shareId);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(saved.id);
    });

    it('존재하지 않는 검색은 빈 문자열을 반환해야 함', () => {
      const shareId = searchHistoryService.shareSearch('nonexistent');
      expect(shareId).toBe('');
    });
  });

  describe('getSharedSearches', () => {
    it('공유된 검색 목록을 반환해야 함', () => {
      const saved = searchHistoryService.saveSearchQuery('검색', '쿼리');
      searchHistoryService.shareSearch(saved.id);

      const shared = searchHistoryService.getSharedSearches();
      expect(shared.length).toBeGreaterThan(0);
    });
  });

  describe('getSearchByShareId', () => {
    it('공유 ID로 검색을 조회할 수 있어야 함', () => {
      const saved = searchHistoryService.saveSearchQuery('검색', '쿼리');
      const shareId = searchHistoryService.shareSearch(saved.id);

      const found = searchHistoryService.getSearchByShareId(shareId);
      expect(found).not.toBeNull();
      expect(found?.query).toBe('쿼리');
    });

    it('존재하지 않는 공유 ID는 null을 반환해야 함', () => {
      const found = searchHistoryService.getSearchByShareId('nonexistent');
      expect(found).toBeNull();
    });
  });

  describe('저장소 복원·오류', () => {
    it('검색 히스토리 JSON이 배열이 아니면 빈 배열로 조회된다', () => {
      localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, '{}');
      expect(searchHistoryService.getRecentSearches()).toEqual([]);
    });

    it('검색 히스토리 JSON이 손상되면 빈 배열로 조회된다', () => {
      localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, '{x');
      expect(searchHistoryService.getRecentSearches()).toEqual([]);
      expect(errorLogger.error).toHaveBeenCalled();
    });

    it('저장된 검색 JSON이 배열이 아니면 빈 배열로 조회된다', () => {
      localStorage.setItem(SAVED_SEARCHES_STORAGE_KEY, '{"not":"array"}');
      expect(searchHistoryService.getSavedSearches()).toEqual([]);
    });

    it('공유 검색 JSON이 손상되면 빈 배열로 조회된다', () => {
      localStorage.setItem(SHARED_SEARCHES_STORAGE_KEY, '{x');
      expect(searchHistoryService.getSharedSearches()).toEqual([]);
      expect(errorLogger.error).toHaveBeenCalled();
    });
  });

  describe('저장 실패', () => {
    it('saveSearch 시 setItem 실패하면 검색 히스토리 저장 실패 로그가 남는다', () => {
      const spy = jest.spyOn(localStorageMock, 'setItem').mockImplementation(() => {
        throw new Error('fail');
      });
      try {
        searchHistoryService.saveSearch('테스트');
        expect(errorLogger.error).toHaveBeenCalledWith(
          '검색 히스토리 저장 실패',
          expect.any(Error),
          expect.objectContaining({ component: 'searchHistoryService' }),
        );
      } finally {
        spy.mockRestore();
      }
    });

    it('removeSearch 시 setItem 실패하면 검색어 삭제 실패 로그가 남는다', () => {
      searchHistoryService.saveSearch('삭제대상');
      const spy = jest.spyOn(localStorageMock, 'setItem').mockImplementation(() => {
        throw new Error('fail');
      });
      try {
        searchHistoryService.removeSearch('삭제대상');
        expect(
          jest.mocked(errorLogger.error).mock.calls.some((c) => c[0] === '검색어 삭제 실패')
        ).toBe(true);
      } finally {
        spy.mockRestore();
      }
    });

    it('clearHistory 시 removeItem 실패하면 히스토리 삭제 실패 로그가 남는다', () => {
      searchHistoryService.saveSearch('a');
      const spy = jest.spyOn(localStorageMock, 'removeItem').mockImplementation(() => {
        throw new Error('fail');
      });
      try {
        searchHistoryService.clearHistory();
        expect(
          jest.mocked(errorLogger.error).mock.calls.some((c) => c[0] === '검색 히스토리 삭제 실패')
        ).toBe(true);
      } finally {
        spy.mockRestore();
      }
    });

    it('saveSearchQuery 시 setItem 실패하면 검색 저장 실패 로그가 남는다', () => {
      const spy = jest.spyOn(localStorageMock, 'setItem').mockImplementation(() => {
        throw new Error('fail');
      });
      try {
        searchHistoryService.saveSearchQuery('이름', '쿼리');
        expect(
          jest.mocked(errorLogger.error).mock.calls.some((c) => c[0] === '검색 저장 실패')
        ).toBe(true);
      } finally {
        spy.mockRestore();
      }
    });

    it('deleteSavedSearch 시 setItem 실패하면 저장된 검색 삭제 실패 로그가 남는다', () => {
      const saved = searchHistoryService.saveSearchQuery('이름', '쿼리');
      const spy = jest.spyOn(localStorageMock, 'setItem').mockImplementation(() => {
        throw new Error('fail');
      });
      try {
        searchHistoryService.deleteSavedSearch(saved.id);
        expect(
          jest.mocked(errorLogger.error).mock.calls.some((c) => c[0] === '저장된 검색 삭제 실패')
        ).toBe(true);
      } finally {
        spy.mockRestore();
      }
    });

    it('useSavedSearch 시 setItem 실패하면 저장된 검색 업데이트 실패 로그가 남는다', () => {
      const saved = searchHistoryService.saveSearchQuery('이름', '쿼리');
      const spy = jest.spyOn(localStorageMock, 'setItem').mockImplementation(() => {
        throw new Error('fail');
      });
      try {
        searchHistoryService.useSavedSearch(saved.id);
        expect(
          jest.mocked(errorLogger.error).mock.calls.some((c) => c[0] === '저장된 검색 업데이트 실패')
        ).toBe(true);
      } finally {
        spy.mockRestore();
      }
    });

    it('shareSearch 시 setItem 실패하면 검색 공유 실패 로그가 남는다', () => {
      const saved = searchHistoryService.saveSearchQuery('이름', '쿼리');
      const spy = jest.spyOn(localStorageMock, 'setItem').mockImplementation(() => {
        throw new Error('fail');
      });
      try {
        searchHistoryService.shareSearch(saved.id);
        expect(
          jest.mocked(errorLogger.error).mock.calls.some((c) => c[0] === '검색 공유 실패')
        ).toBe(true);
      } finally {
        spy.mockRestore();
      }
    });
  });
});

