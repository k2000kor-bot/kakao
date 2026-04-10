import { CORBU_CONVERSATION_MEMORY_STORAGE_KEY } from '../advancedConversationMemoryStorageKeys';
import { CORBU_CONVERSATION_MEMORY_STORAGE_KEY as K_SVC } from '../advancedConversationMemoryService';

describe('advancedConversationMemoryStorageKeys', () => {
  it('localStorage 키 문자열 계약', () => {
    expect(CORBU_CONVERSATION_MEMORY_STORAGE_KEY).toBe('corbu_conversation_memory');
  });

  it('advancedConversationMemoryService 재보내기와 동일', () => {
    expect(K_SVC).toBe(CORBU_CONVERSATION_MEMORY_STORAGE_KEY);
  });
});
