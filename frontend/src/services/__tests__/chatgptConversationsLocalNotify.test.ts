/**
 * @jest-environment jsdom
 */
import { CORBU_HOME_STORAGE_UPDATED_EVENT } from '../corbuHomeStorageEvents';
import { SIDEBAR_CHATS_UPDATED_EVENT } from '../chatGptUiStorageKeys';
import { notifyLocalChatConversationsMutated } from '../chatgptConversationsLocalNotify';

describe('chatgptConversationsLocalNotify', () => {
  it('사이드바·홈 갱신 이벤트를 모두 발행한다', () => {
    const sidebar = jest.fn();
    const home = jest.fn();
    window.addEventListener(SIDEBAR_CHATS_UPDATED_EVENT, sidebar);
    window.addEventListener(CORBU_HOME_STORAGE_UPDATED_EVENT, home);
    notifyLocalChatConversationsMutated();
    expect(sidebar).toHaveBeenCalledTimes(1);
    expect(home).toHaveBeenCalledTimes(1);
    window.removeEventListener(SIDEBAR_CHATS_UPDATED_EVENT, sidebar);
    window.removeEventListener(CORBU_HOME_STORAGE_UPDATED_EVENT, home);
  });
});
