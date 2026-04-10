/**
 * @jest-environment jsdom
 */
import {
  ONBOARDING_COMPLETED_STORAGE_KEY,
  USER_PREFERENCES_JSON_STORAGE_KEY,
} from '../userPreferencesUiStorageKeys';

describe('userPreferencesUiStorageKeys', () => {
  it('localStorage 키 문자열 계약', () => {
    expect(USER_PREFERENCES_JSON_STORAGE_KEY).toBe('userPreferences');
    expect(ONBOARDING_COMPLETED_STORAGE_KEY).toBe('onboardingCompleted');
  });
});
