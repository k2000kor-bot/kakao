import { AGENTS_PATH, CONVERSATION_GRAPH_PATH } from '../config/routes';
import { isStandaloneChatPath } from '../config/uiPreferences';

/** 라우트 자체·입력 도크에 경로 크롬이 있을 때 앱 셸 상단 브레드크럼 숨김 */
export function shouldHideAppShellBreadcrumb(pathname: string): boolean {
  const p = pathname || '/';
  if (p === '/' || isStandaloneChatPath(p)) return true;
  if (p === AGENTS_PATH || p.startsWith(`${AGENTS_PATH}?`)) return true;
  if (p === '/projects' || p.startsWith('/projects/')) return true;
  if (p === CONVERSATION_GRAPH_PATH || p.startsWith(`${CONVERSATION_GRAPH_PATH}/`)) return true;
  return false;
}
