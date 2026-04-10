import { NEWS_API_KEY_STORAGE_KEY } from '../newsStorageKeys';
import { NEWS_API_KEY_STORAGE_KEY as K_SVC } from '../newsService';

describe('newsStorageKeys', () => {
  it('localStorage 키 문자열 계약', () => {
    expect(NEWS_API_KEY_STORAGE_KEY).toBe('news_api_key');
  });

  it('newsService 재보내기와 동일', () => {
    expect(K_SVC).toBe(NEWS_API_KEY_STORAGE_KEY);
  });
});
