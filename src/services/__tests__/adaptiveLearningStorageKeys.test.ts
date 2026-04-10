import { ADAPTIVE_LEARNING_STORAGE_KEYS } from '../adaptiveLearningStorageKeys';

describe('adaptiveLearningStorageKeys', () => {
  it('localStorage 키 문자열 계약(기존 사용자 데이터와 호환)', () => {
    expect(ADAPTIVE_LEARNING_STORAGE_KEYS).toEqual({
      patterns: 'adaptiveLearningPatterns',
      optimizationResults: 'optimizationResults',
      predictiveInsights: 'predictiveInsights',
    });
  });
});
