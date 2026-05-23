/**
 * 제품 UI 토글 (런타임에 `process.env`를 읽음 — Jest에서 env 조작 가능)
 *
 * 기본: 프로젝트 UI 끔 → 루트(/)는 에이전트 허브, 독립 대화는 `/chat`(젠스파이크형). 끄려면 `REACT_APP_UI_GENSPARK_PRIMARY=false`.
 * 레거시 프로젝트 CRUD·프로젝트 대화를 다시 쓰려면 `REACT_APP_UI_PROJECTS_ENABLED=true`
 *
 * 주소창 `?id=` 해석·merge 보강·Modern Chat 쿼리 파이프라인을 끄려면 `REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT=true`. `/agents` 전용 진입(`ChatGPTInterface` props)은 유지.
 */
import { AGENTS_PATH } from './routes';

/** Genspark 우선 모드에서 독립 대화(프로젝트 밖 스레드) 전용 경로 */
export const STANDALONE_CHAT_PATH = '/chat';

export function isUiProjectsEnabled(): boolean {
  if (typeof process === 'undefined') return false;
  return process.env.REACT_APP_UI_PROJECTS_ENABLED === 'true';
}

/**
 * 루트(/)를 에이전트 허브로 두고 `/chat`에 독립 대화를 두는 젠스파이크형 내비.
 * `REACT_APP_UI_GENSPARK_PRIMARY=false` 로 끄고, `true`로 강제 켤 수 있음.
 * 기본값: 프로젝트 UI가 꺼져 있으면 true.
 */
export function isGensparkPrimaryExperience(): boolean {
  if (typeof process === 'undefined') return true;
  const v = process.env.REACT_APP_UI_GENSPARK_PRIMARY;
  if (v === 'false' || v === '0') return false;
  if (v === 'true' || v === '1') return true;
  return !isUiProjectsEnabled();
}

function normalizePathTail(pathname: string): string {
  const raw = pathname || '/';
  if (raw === '/') return '/';
  return raw.replace(/\/+$/, '') || '/';
}

/** 독립 일반 대화 화면 경로 — 젠스파이크 우선이면 `/chat`, 아니면 `/` */
export function getStandaloneChatPath(): string {
  return isGensparkPrimaryExperience() ? STANDALONE_CHAT_PATH : '/';
}

export function isStandaloneChatPath(pathname: string): boolean {
  const p = normalizePathTail(pathname);
  const primary = getStandaloneChatPath();
  if (p === primary) return true;
  /** 레거시(주 경로 `/`)에서도 `/chat` 라우트를 열어두므로 동일 화면으로 취급 */
  if (primary === '/' && p === STANDALONE_CHAT_PATH) return true;
  return false;
}

/** 앱 첫 화면(로고·404·Esc) — 젠스파이크 우선이면 에이전트 허브 */
export function getAppEntryPath(): string {
  return isGensparkPrimaryExperience() ? AGENTS_PATH : '/';
}

/** 레거시 프로젝트 CRUD·사이드바·`/projects` 라우트 노출 여부 (LEGACY + ENABLED) */
export function isUiProjectsLegacySurfaceEnabled(): boolean {
  if (typeof process === 'undefined') return false;
  return process.env.REACT_APP_UI_PROJECTS_LEGACY === 'true' && isUiProjectsEnabled();
}

/**
 * 마케팅 홈·관계도 handoff 초안/자동전송을 ChatGPTInterface에 반영할 경로.
 * 독립 대화(`/chat` 등)와 에이전트(`/agents`)에서만 적용합니다.
 */
export function isMarketingDraftEligiblePath(pathname: string): boolean {
  const p = normalizePathTail(pathname);
  if (isStandaloneChatPath(p)) return true;
  return p === AGENTS_PATH;
}
