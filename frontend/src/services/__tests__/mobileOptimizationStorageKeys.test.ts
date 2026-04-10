/**
 * @jest-environment jsdom
 */
import { MOBILE_OPTIMIZATION_SETTINGS_STORAGE_KEY } from '../mobileOptimizationStorageKeys';
import { MOBILE_OPTIMIZATION_SETTINGS_STORAGE_KEY as K_SVC } from '../mobileOptimizationService';

describe('mobileOptimizationStorageKeys', () => {
  it('localStorage 키 문자열 계약', () => {
    expect(MOBILE_OPTIMIZATION_SETTINGS_STORAGE_KEY).toBe('mobileOptimizationSettings');
  });

  it('mobileOptimizationService 재보내기와 동일', () => {
    expect(K_SVC).toBe(MOBILE_OPTIMIZATION_SETTINGS_STORAGE_KEY);
  });
});
