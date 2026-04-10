/**
 * 프로젝트 목록 변경 알림 (사이드바 등에서 목록 갱신용)
 * projectService create/update/delete 성공 시 호출
 */
const PROJECTS_CHANGED_EVENT = 'corbu-projects-changed';

export function notifyProjectsChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(PROJECTS_CHANGED_EVENT));
}

export function onProjectsChanged(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => callback();
  window.addEventListener(PROJECTS_CHANGED_EVENT, handler);
  return () => window.removeEventListener(PROJECTS_CHANGED_EVENT, handler);
}
