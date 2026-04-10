import { CHATGPT_CONVERSATIONS_STORAGE_KEY } from '../services/chatGptUiStorageKeys';

/**
 * `chatgpt-conversations` 배열에서 id가 일치하는 대화만 제거합니다.
 * @returns 항목이 실제로 제거되었으면 true
 */
export function removeConversationFromLocalStorage(conversationId: string): boolean {
  try {
    const raw = localStorage.getItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
    if (!raw) return false;
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return false;
    const next = arr.filter((c: unknown) => {
      if (!c || typeof c !== 'object') return true;
      const id = (c as { id?: string }).id;
      return id !== conversationId;
    });
    if (next.length === arr.length) return false;
    localStorage.setItem(CHATGPT_CONVERSATIONS_STORAGE_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}
