/** advancedAnalytics / advancedAIAnalytics / conversationMemory 등 공유 localStorage 키(부작용 없음) */
export const ANALYTICS_USER_ID_STORAGE_KEY = 'userId' as const;
export const ANALYTICS_SESSION_START_STORAGE_KEY = 'sessionStart' as const;
export const ANALYTICS_USER_BEHAVIORS_STORAGE_KEY = 'userBehaviors' as const;
export const ANALYTICS_USER_PROFILES_STORAGE_KEY = 'userProfiles' as const;

export const ANALYTICS_PERSONALIZATION_KEY_PREFIX = 'personalization_' as const;

/** advancedAIAnalyticsService — 사용자별 개인화 프로필 키 */
export function analyticsPersonalizationProfileStorageKey(userId: string): string {
  return `${ANALYTICS_PERSONALIZATION_KEY_PREFIX}${userId}`;
}
