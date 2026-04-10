/**
 * @jest-environment jsdom
 */
import {
  CHATGPT_CHATS_STORAGE_KEY,
  CHATGPT_COMPOSER_RESPONSE_MODE_STORAGE_KEY,
  CHATGPT_CONVERSATION_REMOVED_EVENT,
  CHATGPT_CONVERSATIONS_STORAGE_KEY,
  CHATGPT_LAST_CHAT_ID_STORAGE_KEY,
  CHATGPT_PROJECTS_STORAGE_KEY,
  CHATGPT_SHOW_TIMESTAMPS_STORAGE_KEY,
  CHATGPT_THEME_STORAGE_KEY,
} from '../chatGptUiStorageKeys';

describe('chatGptUiStorageKeys', () => {
  it('localStorage 키 문자열 계약', () => {
    expect(CHATGPT_THEME_STORAGE_KEY).toBe('chatgpt-theme');
    expect(CHATGPT_SHOW_TIMESTAMPS_STORAGE_KEY).toBe('chatgpt-show-timestamps');
    expect(CHATGPT_COMPOSER_RESPONSE_MODE_STORAGE_KEY).toBe('chatgpt-composer-response-mode');
    expect(CHATGPT_PROJECTS_STORAGE_KEY).toBe('chatgpt-projects');
    expect(CHATGPT_CONVERSATIONS_STORAGE_KEY).toBe('chatgpt-conversations');
    expect(CHATGPT_LAST_CHAT_ID_STORAGE_KEY).toBe('chatgpt_last_chat_id');
    expect(CHATGPT_CHATS_STORAGE_KEY).toBe('chatgpt_chats');
    expect(CHATGPT_CONVERSATION_REMOVED_EVENT).toBe('chatgpt-conversation-removed');
  });
});
