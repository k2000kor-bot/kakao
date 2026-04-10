/**
 * UI 토글·젠스파이크 경로 헬퍼
 */
import {
  getAppEntryPath,
  getStandaloneChatPath,
  isGensparkPrimaryExperience,
  isStandaloneChatPath,
  isUiProjectsEnabled,
  STANDALONE_CHAT_PATH,
} from '../uiPreferences';
import { AGENTS_PATH } from '../routes';

describe('uiPreferences', () => {
  const save = {
    projects: process.env.REACT_APP_UI_PROJECTS_ENABLED,
    genspark: process.env.REACT_APP_UI_GENSPARK_PRIMARY,
  };

  afterEach(() => {
    process.env.REACT_APP_UI_PROJECTS_ENABLED = save.projects;
    process.env.REACT_APP_UI_GENSPARK_PRIMARY = save.genspark;
  });

  it('기본: 프로젝트 UI 끔 → 젠스파이크 우선·독립 대화는 /chat', () => {
    delete process.env.REACT_APP_UI_PROJECTS_ENABLED;
    delete process.env.REACT_APP_UI_GENSPARK_PRIMARY;
    expect(isUiProjectsEnabled()).toBe(false);
    expect(isGensparkPrimaryExperience()).toBe(true);
    expect(getStandaloneChatPath()).toBe(STANDALONE_CHAT_PATH);
    expect(getAppEntryPath()).toBe(AGENTS_PATH);
    expect(isStandaloneChatPath('/chat')).toBe(true);
    expect(isStandaloneChatPath('/chat/')).toBe(true);
  });

  it('REACT_APP_UI_GENSPARK_PRIMARY=false 이면 루트가 독립 대화·앱 진입도 /', () => {
    delete process.env.REACT_APP_UI_PROJECTS_ENABLED;
    process.env.REACT_APP_UI_GENSPARK_PRIMARY = 'false';
    expect(isGensparkPrimaryExperience()).toBe(false);
    expect(getStandaloneChatPath()).toBe('/');
    expect(getAppEntryPath()).toBe('/');
    expect(isStandaloneChatPath('/')).toBe(true);
    expect(isStandaloneChatPath(STANDALONE_CHAT_PATH)).toBe(true);
  });

  it('프로젝트 UI 켬이면 기본 젠스파이크 우선은 끔(명시 true 전까지)', () => {
    process.env.REACT_APP_UI_PROJECTS_ENABLED = 'true';
    delete process.env.REACT_APP_UI_GENSPARK_PRIMARY;
    expect(isUiProjectsEnabled()).toBe(true);
    expect(isGensparkPrimaryExperience()).toBe(false);
    expect(getStandaloneChatPath()).toBe('/');
  });
});
