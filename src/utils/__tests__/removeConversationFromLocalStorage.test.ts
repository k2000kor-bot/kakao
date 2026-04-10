/**
 * @jest-environment jsdom
 */
import { CHATGPT_CONVERSATIONS_STORAGE_KEY } from '../../services/chatGptUiStorageKeys';
import { removeConversationFromLocalStorage } from '../removeConversationFromLocalStorage';

describe('removeConversationFromLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('해당 id 대화를 제거하고 true를 반환한다', () => {
    const now = new Date().toISOString();
    localStorage.setItem(
      CHATGPT_CONVERSATIONS_STORAGE_KEY,
      JSON.stringify([
        { id: 'a', title: 'A', messages: [], createdAt: now, updatedAt: now },
        { id: 'b', title: 'B', messages: [], createdAt: now, updatedAt: now },
      ])
    );
    expect(removeConversationFromLocalStorage('a')).toBe(true);
    const left = JSON.parse(localStorage.getItem(CHATGPT_CONVERSATIONS_STORAGE_KEY) || '[]') as Array<{ id: string }>;
    expect(left).toHaveLength(1);
    expect(left[0].id).toBe('b');
  });

  it('id가 없으면 false이고 스토리지는 그대로다', () => {
    const now = new Date().toISOString();
    const raw = JSON.stringify([{ id: 'x', title: 'X', messages: [], createdAt: now, updatedAt: now }]);
    localStorage.setItem(CHATGPT_CONVERSATIONS_STORAGE_KEY, raw);
    expect(removeConversationFromLocalStorage('missing')).toBe(false);
    expect(localStorage.getItem(CHATGPT_CONVERSATIONS_STORAGE_KEY)).toBe(raw);
  });

  it('스토리지가 비어 있으면 false', () => {
    expect(removeConversationFromLocalStorage('any')).toBe(false);
  });
});
