import { CONVERSATION_HISTORY_STORAGE_KEY } from '../conversationHistoryStorageKeys';
import { CONVERSATION_HISTORY_STORAGE_KEY as KEY_FROM_SERVICE } from '../conversationHistoryService';

describe('conversationHistoryStorageKeys', () => {
  it('localStorage 키 문자열 계약(기존 사용자 데이터와 호환)', () => {
    expect(CONVERSATION_HISTORY_STORAGE_KEY).toBe('conversationHistory');
  });

  it('conversationHistoryService 재보내기가 키 전용 모듈과 동일하다', () => {
    expect(KEY_FROM_SERVICE).toBe(CONVERSATION_HISTORY_STORAGE_KEY);
  });
});
