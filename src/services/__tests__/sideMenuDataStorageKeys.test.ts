/**
 * @jest-environment jsdom
 */
import {
  CORBU_AI_CHAT_SESSIONS_STORAGE_KEY,
  CORBU_AI_PROJECTS_STORAGE_KEY,
  CORBU_AI_RECENT_FILES_STORAGE_KEY,
  CORBU_AI_STATISTICS_STORAGE_KEY,
  CORBU_AI_TEMPLATES_STORAGE_KEY,
  CORBU_AI_WORKFLOWS_STORAGE_KEY,
} from '../sideMenuDataStorageKeys';
import {
  CORBU_AI_CHAT_SESSIONS_STORAGE_KEY as K_CHAT,
  CORBU_AI_PROJECTS_STORAGE_KEY as K_PROJ,
  CORBU_AI_RECENT_FILES_STORAGE_KEY as K_FILES,
  CORBU_AI_STATISTICS_STORAGE_KEY as K_STATS,
  CORBU_AI_TEMPLATES_STORAGE_KEY as K_TPL,
  CORBU_AI_WORKFLOWS_STORAGE_KEY as K_WF,
} from '../sideMenuDataService';

describe('sideMenuDataStorageKeys', () => {
  it('localStorage 키 문자열 계약', () => {
    expect(CORBU_AI_PROJECTS_STORAGE_KEY).toBe('corbu_ai_projects');
    expect(CORBU_AI_CHAT_SESSIONS_STORAGE_KEY).toBe('corbu_ai_chat_sessions');
    expect(CORBU_AI_RECENT_FILES_STORAGE_KEY).toBe('corbu_ai_recent_files');
    expect(CORBU_AI_TEMPLATES_STORAGE_KEY).toBe('corbu_ai_templates');
    expect(CORBU_AI_WORKFLOWS_STORAGE_KEY).toBe('corbu_ai_workflows');
    expect(CORBU_AI_STATISTICS_STORAGE_KEY).toBe('corbu_ai_statistics');
  });

  it('sideMenuDataService 재보내기와 동일', () => {
    expect(K_PROJ).toBe(CORBU_AI_PROJECTS_STORAGE_KEY);
    expect(K_CHAT).toBe(CORBU_AI_CHAT_SESSIONS_STORAGE_KEY);
    expect(K_FILES).toBe(CORBU_AI_RECENT_FILES_STORAGE_KEY);
    expect(K_TPL).toBe(CORBU_AI_TEMPLATES_STORAGE_KEY);
    expect(K_WF).toBe(CORBU_AI_WORKFLOWS_STORAGE_KEY);
    expect(K_STATS).toBe(CORBU_AI_STATISTICS_STORAGE_KEY);
  });
});
