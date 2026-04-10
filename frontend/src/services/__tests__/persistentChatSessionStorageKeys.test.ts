import {
  PERSISTENT_CHAT_SESSIONS_STORAGE_KEY,
} from '../persistentChatSessionStorageKeys';
import { PERSISTENT_CHAT_SESSIONS_STORAGE_KEY as KEY_FROM_SERVICE } from '../persistentChatSessionService';

describe('persistentChatSessionStorageKeys', () => {
  it('localStorage 키 문자열 계약(기존 사용자 데이터와 호환)', () => {
    expect(PERSISTENT_CHAT_SESSIONS_STORAGE_KEY).toBe('persistent_chat_sessions');
  });

  it('persistentChatSessionService 재보내기가 키 전용 모듈과 동일하다', () => {
    expect(KEY_FROM_SERVICE).toBe(PERSISTENT_CHAT_SESSIONS_STORAGE_KEY);
  });
});
