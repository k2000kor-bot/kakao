import { dispatchCorbuHomeStorageUpdated } from './corbuHomeStorageEvents';
import { SIDEBAR_CHATS_UPDATED_EVENT } from './chatGptUiStorageKeys';

/** `chatgpt-conversations` 등 대화 목록을 localStorage에서 바꾼 뒤, 같은 탭에서 사이드바·홈 요약 등이 반영되도록 알립니다. */
export function notifyLocalChatConversationsMutated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(SIDEBAR_CHATS_UPDATED_EVENT));
  dispatchCorbuHomeStorageUpdated();
}
