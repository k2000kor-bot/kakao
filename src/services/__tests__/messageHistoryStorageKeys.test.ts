import { MESSAGE_HISTORY_STORAGE_KEY } from '../messageHistoryStorageKeys';

describe('messageHistoryStorageKeys', () => {
  it('localStorage 키 문자열 계약(기존 사용자 데이터와 호환)', () => {
    expect(MESSAGE_HISTORY_STORAGE_KEY).toBe('corbu_chat_history');
  });
});
