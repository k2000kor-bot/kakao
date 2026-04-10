import {
  SEARCH_HISTORY_STORAGE_KEY,
  SAVED_SEARCHES_STORAGE_KEY,
  SHARED_SEARCHES_STORAGE_KEY,
} from '../searchHistoryStorageKeys';
import {
  SEARCH_HISTORY_STORAGE_KEY as K_HIST,
  SAVED_SEARCHES_STORAGE_KEY as K_SAVED,
  SHARED_SEARCHES_STORAGE_KEY as K_SHARED,
} from '../searchHistoryService';

describe('searchHistoryStorageKeys', () => {
  it('localStorage 키 문자열 계약(기존 사용자 데이터와 호환)', () => {
    expect(SEARCH_HISTORY_STORAGE_KEY).toBe('corbu_search_history');
    expect(SAVED_SEARCHES_STORAGE_KEY).toBe('corbu_saved_searches');
    expect(SHARED_SEARCHES_STORAGE_KEY).toBe('corbu_shared_searches');
  });

  it('searchHistoryService 재보내기가 키 전용 모듈과 동일하다', () => {
    expect(K_HIST).toBe(SEARCH_HISTORY_STORAGE_KEY);
    expect(K_SAVED).toBe(SAVED_SEARCHES_STORAGE_KEY);
    expect(K_SHARED).toBe(SHARED_SEARCHES_STORAGE_KEY);
  });
});
