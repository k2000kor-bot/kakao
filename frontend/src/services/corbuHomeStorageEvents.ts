import { CHATGPT_CONVERSATIONS_STORAGE_KEY } from './chatGptUiStorageKeys';

/** 도구 뷰가 홈 요약에 쓰이는 localStorage를 갱신한 뒤 발행(같은 탭·리스너 공유) */
export const CORBU_HOME_STORAGE_UPDATED_EVENT = 'corbu-home-storage-updated' as const;

export const CORBU_AUTOMATION_WORKFLOWS_KEY = 'corbu.automation.workflows' as const;
export const CORBU_AUTOMATION_RUNS_KEY = 'corbu.automation.runs' as const;
export const CORBU_TEAM_MEMBERS_KEY = 'corbu.team.members' as const;
export const CORBU_TEAM_ACTIVITY_KEY = 'corbu.team.activity' as const;
export const CORBU_COMMUNITY_POSTS_KEY = 'corbu.community.posts' as const;
export const CORBU_COMMUNITY_REPLIES_KEY = 'corbu.community.replies' as const;
export const CORBU_LEARN_PROGRESS_KEY = 'corbu.learn.progress' as const;
export const CORBU_LEARN_CHECKLIST_KEY = 'corbu.learn.checklist' as const;
/** 코스 ID → 완료 시각(ISO). 홈 타임라인 등에서 사용 */
export const CORBU_LEARN_COMPLETED_AT_KEY = 'corbu.learn.completedAt' as const;
export const CORBU_BILLING_PLAN_KEY = 'corbu.billing.currentPlan' as const;
export const CORBU_BILLING_CARDS_KEY = 'corbu.billing.cards' as const;
/** 분석 뷰 주간 대화 목표(1–30) */
export const CORBU_ANALYTICS_WEEKLY_GOAL_KEY = 'corbu.analytics.weeklyGoal' as const;
/** 홈 요약 탭 목표 트래커 */
export const CORBU_HOME_GOALS_KEY = 'corbu.home.goals' as const;
export const CORBU_HOME_MOOD_KEY = 'corbu.home.mood' as const;
export const CORBU_HOME_QUICK_MEMO_KEY = 'corbu.home.quickMemo' as const;
export const CORBU_HOME_LAYOUT_COMPACT_KEY = 'corbu.home.layoutCompact' as const;
/** AI 추천 프롬프트 일일 시드 */
export const CORBU_HOME_SUGGEST_SEED_KEY = 'corbu.home.suggestSeed' as const;

const EXTRA_SYNC_KEYS = [
  CORBU_AUTOMATION_WORKFLOWS_KEY,
  CORBU_AUTOMATION_RUNS_KEY,
  CORBU_TEAM_MEMBERS_KEY,
  CORBU_TEAM_ACTIVITY_KEY,
  CORBU_COMMUNITY_POSTS_KEY,
  CORBU_COMMUNITY_REPLIES_KEY,
  CORBU_LEARN_PROGRESS_KEY,
  CORBU_LEARN_CHECKLIST_KEY,
  CORBU_LEARN_COMPLETED_AT_KEY,
  CORBU_BILLING_PLAN_KEY,
  CORBU_BILLING_CARDS_KEY,
  CORBU_ANALYTICS_WEEKLY_GOAL_KEY,
  CORBU_HOME_GOALS_KEY,
  CORBU_HOME_MOOD_KEY,
  CORBU_HOME_QUICK_MEMO_KEY,
  CORBU_HOME_LAYOUT_COMPACT_KEY,
  CORBU_HOME_SUGGEST_SEED_KEY,
] as const;

export function isCorbuHomeSyncStorageKey(key: string | null): boolean {
  if (key === null) return true;
  if (key === CHATGPT_CONVERSATIONS_STORAGE_KEY) return true;
  return (EXTRA_SYNC_KEYS as readonly string[]).includes(key);
}

export function dispatchCorbuHomeStorageUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(CORBU_HOME_STORAGE_UPDATED_EVENT));
}
