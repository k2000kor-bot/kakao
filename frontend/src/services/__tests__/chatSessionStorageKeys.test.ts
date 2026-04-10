import {
  CHAT_SESSIONS_STORAGE_KEY,
  MODERN_CHAT_SESSION_ID_STORAGE_KEY,
} from '../chatSessionStorageKeys';
import { CHAT_SESSIONS_STORAGE_KEY as KEY_FROM_SERVICE } from '../chatSessionService';

describe('chatSessionStorageKeys', () => {
  it('localStorage 키 문자열 계약(기존 사용자 데이터와 호환)', () => {
    expect(CHAT_SESSIONS_STORAGE_KEY).toBe('corbu_chat_sessions');
    expect(MODERN_CHAT_SESSION_ID_STORAGE_KEY).toBe('chatSessionId');
  });

  it('chatSessionService 재보내기가 키 전용 모듈과 동일하다', () => {
    expect(KEY_FROM_SERVICE).toBe(CHAT_SESSIONS_STORAGE_KEY);
  });
});
