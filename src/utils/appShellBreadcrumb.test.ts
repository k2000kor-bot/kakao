import { shouldHideAppShellBreadcrumb } from './appShellBreadcrumb';
import { STANDALONE_CHAT_PATH } from '../config/uiPreferences';
import { AGENTS_PATH, CONVERSATION_GRAPH_PATH, SETTINGS_PATH } from '../config/routes';

describe('shouldHideAppShellBreadcrumb', () => {
  it('독립 대화·홈·에이전트·프로젝트·관계도에서는 숨긴다', () => {
    expect(shouldHideAppShellBreadcrumb('/')).toBe(true);
    expect(shouldHideAppShellBreadcrumb(STANDALONE_CHAT_PATH)).toBe(true);
    expect(shouldHideAppShellBreadcrumb(AGENTS_PATH)).toBe(true);
    expect(shouldHideAppShellBreadcrumb(`${AGENTS_PATH}?id=x`)).toBe(true);
    expect(shouldHideAppShellBreadcrumb('/projects')).toBe(true);
    expect(shouldHideAppShellBreadcrumb('/projects/p1')).toBe(true);
    expect(shouldHideAppShellBreadcrumb(CONVERSATION_GRAPH_PATH)).toBe(true);
  });

  it('설정 등 도구 페이지에서는 표시한다', () => {
    expect(shouldHideAppShellBreadcrumb(SETTINGS_PATH)).toBe(false);
  });
});
