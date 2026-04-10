/**
 * @jest-environment jsdom
 */
import { CORBU_LEARNING_EXPERIENCE_STORAGE_KEY } from '../personalizedLearningExperienceStorageKeys';
import personalizedLearningExperienceService, {
  CORBU_LEARNING_EXPERIENCE_STORAGE_KEY as K_SVC,
} from '../personalizedLearningExperienceService';

describe('personalizedLearningExperienceStorageKeys', () => {
  it('localStorage 키 문자열 계약', () => {
    expect(CORBU_LEARNING_EXPERIENCE_STORAGE_KEY).toBe('corbu_learning_experience');
  });

  it('personalizedLearningExperienceService 재보내기와 동일', () => {
    expect(K_SVC).toBe(CORBU_LEARNING_EXPERIENCE_STORAGE_KEY);
    expect(personalizedLearningExperienceService).toBeDefined();
  });
});
