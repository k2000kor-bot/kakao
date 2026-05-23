import { CHATGPT_CONVERSATIONS_STORAGE_KEY } from '../chatGptUiStorageKeys';
import {
  CORBU_AUTOMATION_WORKFLOWS_KEY,
  CORBU_ANALYTICS_WEEKLY_GOAL_KEY,
  CORBU_COMMUNITY_POSTS_KEY,
  CORBU_COMMUNITY_REPLIES_KEY,
  CORBU_LEARN_COMPLETED_AT_KEY,
  CORBU_HOME_GOALS_KEY,
  CORBU_HOME_MOOD_KEY,
  CORBU_TEAM_MEMBERS_KEY,
  CORBU_HOME_STORAGE_UPDATED_EVENT,
  dispatchCorbuHomeStorageUpdated,
  isCorbuHomeSyncStorageKey,
} from '../corbuHomeStorageEvents';

describe('corbuHomeStorageEvents', () => {
  it('isCorbuHomeSyncStorageKey는 대화·자동화·팀 등 홈 연동 키를 인식한다', () => {
    expect(isCorbuHomeSyncStorageKey(null)).toBe(true);
    expect(isCorbuHomeSyncStorageKey(CHATGPT_CONVERSATIONS_STORAGE_KEY)).toBe(true);
    expect(isCorbuHomeSyncStorageKey(CORBU_AUTOMATION_WORKFLOWS_KEY)).toBe(true);
    expect(isCorbuHomeSyncStorageKey(CORBU_COMMUNITY_POSTS_KEY)).toBe(true);
    expect(isCorbuHomeSyncStorageKey(CORBU_COMMUNITY_REPLIES_KEY)).toBe(true);
    expect(isCorbuHomeSyncStorageKey(CORBU_ANALYTICS_WEEKLY_GOAL_KEY)).toBe(true);
    expect(isCorbuHomeSyncStorageKey(CORBU_LEARN_COMPLETED_AT_KEY)).toBe(true);
    expect(isCorbuHomeSyncStorageKey(CORBU_TEAM_MEMBERS_KEY)).toBe(true);
    expect(isCorbuHomeSyncStorageKey(CORBU_HOME_GOALS_KEY)).toBe(true);
    expect(isCorbuHomeSyncStorageKey(CORBU_HOME_MOOD_KEY)).toBe(true);
    expect(isCorbuHomeSyncStorageKey('unrelated-key')).toBe(false);
  });

  it('dispatchCorbuHomeStorageUpdated는 커스텀 이벤트를 발행한다', () => {
    const fn = jest.fn();
    window.addEventListener(CORBU_HOME_STORAGE_UPDATED_EVENT, fn);
    dispatchCorbuHomeStorageUpdated();
    expect(fn).toHaveBeenCalledTimes(1);
    window.removeEventListener(CORBU_HOME_STORAGE_UPDATED_EVENT, fn);
  });
});
