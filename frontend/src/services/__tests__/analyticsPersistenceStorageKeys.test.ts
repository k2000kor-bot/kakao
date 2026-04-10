/**
 * @jest-environment jsdom
 */
import {
  ANALYTICS_PERSONALIZATION_KEY_PREFIX,
  ANALYTICS_SESSION_START_STORAGE_KEY,
  ANALYTICS_USER_BEHAVIORS_STORAGE_KEY,
  ANALYTICS_USER_ID_STORAGE_KEY,
  ANALYTICS_USER_PROFILES_STORAGE_KEY,
  analyticsPersonalizationProfileStorageKey,
} from '../analyticsPersistenceStorageKeys';
import {
  ANALYTICS_USER_BEHAVIORS_STORAGE_KEY as B_ADV,
  ANALYTICS_USER_ID_STORAGE_KEY as U_ADV,
  ANALYTICS_USER_PROFILES_STORAGE_KEY as P_ADV,
} from '../advancedAnalyticsService';
import {
  ANALYTICS_PERSONALIZATION_KEY_PREFIX as PREFIX_AI,
  ANALYTICS_SESSION_START_STORAGE_KEY as S_AI,
  ANALYTICS_USER_BEHAVIORS_STORAGE_KEY as B_AI,
  ANALYTICS_USER_ID_STORAGE_KEY as U_AI,
  analyticsPersonalizationProfileStorageKey as PROF_AI,
} from '../advancedAIAnalyticsService';
import { ANALYTICS_USER_PROFILES_STORAGE_KEY as P_CM } from '../conversationMemorySystem';

describe('analyticsPersistenceStorageKeys', () => {
  it('localStorage 키 문자열 계약', () => {
    expect(ANALYTICS_USER_ID_STORAGE_KEY).toBe('userId');
    expect(ANALYTICS_SESSION_START_STORAGE_KEY).toBe('sessionStart');
    expect(ANALYTICS_USER_BEHAVIORS_STORAGE_KEY).toBe('userBehaviors');
    expect(ANALYTICS_USER_PROFILES_STORAGE_KEY).toBe('userProfiles');
    expect(ANALYTICS_PERSONALIZATION_KEY_PREFIX).toBe('personalization_');
  });

  it('personalization 키 빌더', () => {
    expect(analyticsPersonalizationProfileStorageKey('u1')).toBe('personalization_u1');
  });

  it('advancedAnalyticsService 재보내기와 동일', () => {
    expect(U_ADV).toBe(ANALYTICS_USER_ID_STORAGE_KEY);
    expect(B_ADV).toBe(ANALYTICS_USER_BEHAVIORS_STORAGE_KEY);
    expect(P_ADV).toBe(ANALYTICS_USER_PROFILES_STORAGE_KEY);
  });

  it('advancedAIAnalyticsService 재보내기와 동일', () => {
    expect(U_AI).toBe(ANALYTICS_USER_ID_STORAGE_KEY);
    expect(S_AI).toBe(ANALYTICS_SESSION_START_STORAGE_KEY);
    expect(B_AI).toBe(ANALYTICS_USER_BEHAVIORS_STORAGE_KEY);
    expect(PREFIX_AI).toBe(ANALYTICS_PERSONALIZATION_KEY_PREFIX);
    expect(PROF_AI).toBe(analyticsPersonalizationProfileStorageKey);
  });

  it('conversationMemorySystem 재보내기와 동일', () => {
    expect(P_CM).toBe(ANALYTICS_USER_PROFILES_STORAGE_KEY);
  });
});
