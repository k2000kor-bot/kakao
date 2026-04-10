import { AI_LEARNING_DATA_STORAGE_KEY } from '../aiLearningDataStorageKeys';
import { AI_LEARNING_DATA_STORAGE_KEY as K_SVC } from '../advancedAIFunctions';

describe('aiLearningDataStorageKeys', () => {
  it('localStorage 키 문자열 계약', () => {
    expect(AI_LEARNING_DATA_STORAGE_KEY).toBe('ai_learning_data');
  });

  it('advancedAIFunctions 재보내기와 동일', () => {
    expect(K_SVC).toBe(AI_LEARNING_DATA_STORAGE_KEY);
  });
});
