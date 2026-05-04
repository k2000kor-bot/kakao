/**
 * 통합 앱: 2단 레이아웃 (사이드바 + 메인)
 * 워크스페이스 우선(기본·`REACT_APP_UI_GENSPARK_PRIMARY`): 루트(/)→워크스페이스 홈(다단계 UI형 랜딩), 에이전트는 `/agents`, 독립 대화는 `/chat`. 레거시는 `/`가 대화.
 * (선택·레거시)프로젝트 — `REACT_APP_UI_PROJECTS_LEGACY=true` 이고 `REACT_APP_UI_PROJECTS_ENABLED=true` 일 때만 /projects 노출.
 */
import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Outlet, useLocation, useNavigate, useParams, Navigate } from 'react-router-dom';
import { useTheme } from './components/ThemeProvider';
import {
  routeCategories as _routeCategories,
  getPageTitle,
  normalizeRouterPathname,
  isDocumentTitleOwnedByChatGPTInterface,
  shouldUseNotFoundDocumentTitle,
  NOT_FOUND_PAGE_HEADING,
  NOT_FOUND_DOCUMENT_TITLE,
  navigationConfig,
  extendedRoutes,
  VOICE_GENERATION_PATH,
  AGENTS_PATH,
  AGENTS_QUERY_PARAM_ID,
  SETTINGS_PATH,
  ANALYTICS_PATH,
  DOCS_PATH,
  TEMPLATES_PATH,
  SEARCH_PATH,
  INTEGRATIONS_PATH,
  TEAM_PATH,
  LEARN_PATH,
  BILLING_PATH,
  WORKSPACE_PATH,
  AUTOMATION_PATH,
  COMMUNITY_PATH,
  PIPELINE_TUNING_PATH,
  CONVERSATION_GRAPH_PATH,
  BACKUP_PATH,
  DASHBOARD_PATH,
  DEV_STATUS_PATH,
  GOOGLE_DRIVE_OAUTH_CALLBACK_PATH,
} from './config/routes';
import { IconLogo, IconSun, IconMoon, IconMenu, IconX, IconSearch, IconFolder, IconMoreVertical, IconVolume, IconMessage, IconChevronLeft, IconChevronRight, IconPlus, IconEdit, IconTrash, IconDashboard } from './components/Icons/BrainwaveIcons';
import './App.css';
import './styles/theme.css';
import './styles/brainwave-global.css';
import './styles/responsive.css';
import './components/NotebookLLM.css';
import LoadingSkeleton from './components/LoadingSkeleton';
import ErrorBoundary from './components/ErrorBoundary';
import CommandPalette from './components/CommandPalette';
import { onToast, showToast } from './utils/toast';
import { projectService } from './services/projectService';
import { resolveAgentIdFromGensparkAgentsQuery } from './services/gensparkAgentRegistry';
import { coerceTrimmedString } from './utils/chatInputUtils';
import { FIGMA_BRAINWAVE_AI_UI_KIT_APP_URL } from './config/api';
import {
  getAppEntryPath,
  getStandaloneChatPath,
  isGensparkPrimaryExperience,
  isStandaloneChatPath,
  isUiProjectsEnabled,
} from './config/uiPreferences';
import { CHATGPT_CONVERSATION_REMOVED_EVENT, CHATGPT_CONVERSATIONS_STORAGE_KEY } from './services/chatGptUiStorageKeys';
import { TEST_IDS } from './constants/testIds';
import { removeConversationFromLocalStorage } from './utils/removeConversationFromLocalStorage';

const ChatGPTInterface = lazy(() => import('./components/ChatGPTInterface'));
const ProjectsPage = lazy(() => import('./views/ProjectsPage'));
const VoiceGenerationView = lazy(() => import('./views/VoiceGenerationView'));
const SettingsView = lazy(() => import('./views/SettingsView'));
const AnalyticsView = lazy(() => import('./views/AnalyticsView'));
const DocsView = lazy(() => import('./views/DocsView'));
const TemplatesView = lazy(() => import('./views/TemplatesView'));
const SearchView = lazy(() => import('./views/SearchView'));
const IntegrationsView = lazy(() => import('./views/IntegrationsView'));
const TeamView = lazy(() => import('./views/TeamView'));
const LearnView = lazy(() => import('./views/LearnView'));
const BillingView = lazy(() => import('./views/BillingView'));
const WorkspaceView = lazy(() => import('./views/WorkspaceView'));
const AutomationView = lazy(() => import('./views/AutomationView'));
const CommunityView = lazy(() => import('./views/CommunityView'));
const ConversationGraphView = lazy(() => import('./views/ConversationGraphView'));
const BackupRecoveryView = lazy(() => import('./components/BackupRecoveryManager').then((m) => ({ default: m.default })));
const DevStatusView = lazy(() => import('./views/DevStatusView'));
const GoogleDriveOAuthCallbackView = lazy(() => import('./views/GoogleDriveOAuthCallbackView'));
const PipelineTuningView = lazy(() => import('./views/PipelineTuningView'));
const GensparkAgentsHubView = lazy(() => import('./views/GensparkAgentsHubView'));
const GensparkMarketingHomeView = lazy(() => import('./views/GensparkMarketingHomeView'));
const UltimateChatGPTInterface = lazy(() => import('./components/UltimateChatGPTInterface'));
const IntegratedMasterInterface = lazy(() => import('./components/IntegratedMasterInterface'));
const IntegratedDashboard = lazy(() => import('./components/IntegratedDashboard'));

/** 워크스페이스 우선 시 루트(/) — 참조 워크스페이스 랜딩과 유사한 전면 홈 */
function GensparkMarketingHomeRouteView() {
  return (
    <div className="brainwave-chat-route-shell brainwave-chat-route-shell--agents brainwave-chat-route-shell--agents-hub-home brainwave-chat-route-shell--genspark-marketing-home">
      <div className="brainwave-chat-route-body">
        <Suspense fallback={<Fallback />}>
          <GensparkMarketingHomeView />
        </Suspense>
      </div>
    </div>
  );
}

/** 독립 일반 대화 — 다단계 UI형: 상단 브레드크럼 없이 본문만(허브와 동일 셀 패턴) */
function GeneralChatRouteView() {
  return (
    <div className="brainwave-chat-route-shell brainwave-chat-route-shell--general brainwave-chat-route-shell--minimal">
      <h1 className="sr-only">대화</h1>
      <div className="brainwave-chat-route-body">
        <Suspense fallback={<Fallback />}>
          <ChatGPTInterface />
        </Suspense>
      </div>
    </div>
  );
}

/** /projects/:id — 프로젝트 하위 작업 영역(대화는 프로젝트에 종속) */
function ProjectChatView() {
  const { id } = useParams<{ id: string }>();
  const [projectLabel, setProjectLabel] = useState('');
  useEffect(() => {
    if (!id) {
      setProjectLabel('');
      return;
    }
    let cancelled = false;
    projectService
      .getProject(id)
      .then((p) => {
        if (!cancelled) setProjectLabel((p?.name && String(p.name).trim()) || id);
      })
      .catch(() => {
        if (!cancelled) setProjectLabel(id);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="brainwave-chat-route-shell brainwave-chat-route-shell--general brainwave-chat-route-shell--minimal">
      <h1 className="sr-only">
        {projectLabel ? `${projectLabel} · 대화` : '프로젝트 대화'}
      </h1>
      <div className="brainwave-chat-route-body">
        <Suspense fallback={<Fallback />}>
          <ChatGPTInterface initialProjectId={id ?? undefined} />
        </Suspense>
      </div>
    </div>
  );
}

/** 에이전트 라우트 `/agents?id=<uuid>` · `/agents?type=super_agent` — 에이전트 없으면 허브 */
function GensparkAgentRouteView() {
  /** `location.search`로 쿼리를 읽음 — RR7에서 `useSearchParams` 초기 렌더 타이밍 이슈로 id가 비는 경우를 피함 */
  const { search } = useLocation();
  const agentId = resolveAgentIdFromGensparkAgentsQuery(new URLSearchParams(search));
  if (!agentId) {
    /* 허브만: 워크스페이스 홈형 전면 레이아웃(브레드크럼 없음) */
    return (
      <div className="brainwave-chat-route-shell brainwave-chat-route-shell--agents brainwave-chat-route-shell--agents-hub-home">
        <div className="brainwave-chat-route-body">
          <Suspense fallback={<Fallback />}>
            <GensparkAgentsHubView />
          </Suspense>
        </div>
      </div>
    );
  }
  return (
    <div className="brainwave-chat-route-shell brainwave-chat-route-shell--agents brainwave-chat-route-shell--agents-detail">
      <h1 className="sr-only">에이전트 대화</h1>
      <div className="brainwave-chat-route-body">
        <Suspense fallback={<Fallback />}>
          <ChatGPTInterface gensparkRouteAgentId={agentId} />
        </Suspense>
      </div>
    </div>
  );
}

/** `extendedRoutes`에 없는 도구 경로 메타 */
const TOOL_PAGE_META_EXTRA: Record<string, { title: string; hint: string }> = {
  [VOICE_GENERATION_PATH]: { title: '목소리 생성', hint: '텍스트를 음성(TTS)으로 변환합니다.' },
  [DASHBOARD_PATH]: { title: '시스템 대시보드', hint: 'CPU·메모리·네트워크 실시간 상태와 AI 엔진 모니터링.' },
  [DEV_STATUS_PATH]: { title: '개발 현황', hint: '지금까지 반영된 기능·변경 사항을 확인합니다.' },
  '/ultimate': {
    title: 'Ultimate 대화',
    hint: '실험용 확장 대화 UI(모델·사이드바·파일 패널)입니다. 일상 사용은 단독 일반 대화(/) 화면을 권장합니다.',
  },
  '/integrated': {
    title: '통합 마스터',
    hint: '시스템 상태·탭·대화를 한 화면에서 다루는 통합 콘솔입니다.',
  },
};

function getToolPageMeta(fullPath: string): { title: string; hint: string } {
  const path = normalizeRouterPathname(fullPath);
  const extra = TOOL_PAGE_META_EXTRA[path];
  if (extra) return extra;
  const r = extendedRoutes.find((x) => x.path === path);
  if (r) return { title: r.name, hint: r.description };
  return { title: getPageTitle(path), hint: '' };
}

/** 설정·분석 등 — 다단계 UI형: 한 줄 타이틀만(브레드크럼·긴 힌트 제거) */
function ToolPageShell({ path, children }: { path: string; children: React.ReactNode }) {
  const { title, hint } = getToolPageMeta(path);
  return (
    <div className="brainwave-chat-route-shell brainwave-chat-route-shell--tool brainwave-chat-route-shell--minimal">
      <header className="bw-tool-page-strip" aria-label={title}>
        <h1 className="bw-tool-page-strip__title">{title}</h1>
        {hint ? <p className="bw-tool-page-strip__hint">{hint}</p> : null}
      </header>
      <div className="brainwave-chat-route-body brainwave-tool-route-body">{children}</div>
    </div>
  );
}

const Fallback = () => (
  <div className="brainwave-fallback">
    <LoadingSkeleton type="card" lines={5} />
  </div>
);

/**
 * 브라우저 탭 제목. 앱은 `BrowserRouter`만 사용하므로 `useMatches` 등 데이터 라우터 전용 훅을 쓰면
 * "useMatches must be used within a data router" 가 발생합니다. 404 타이틀은 `shouldUseNotFoundDocumentTitle`로 맞춥니다.
 */
function DocumentTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (isDocumentTitleOwnedByChatGPTInterface(pathname)) {
      return;
    }
    if (shouldUseNotFoundDocumentTitle(pathname)) {
      document.title = NOT_FOUND_DOCUMENT_TITLE;
      return;
    }
    const sub = getPageTitle(pathname);
    document.title = `${sub} - ${navigationConfig.title}`;
  }, [pathname]);
  return null;
}

function GlobalToastListener() {
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const unsub = onToast(({ message, type = 'error' }) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setToast({ message, type });
      timeoutRef.current = setTimeout(() => {
        setToast(null);
        timeoutRef.current = null;
      }, 2500);
    });
    return () => {
      unsub();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
  // 오류 토스트 표시 시 포커스 이동 (키보드·스크린 리더 사용자)
  useEffect(() => {
    if (toast?.type === 'error' && toastRef.current) {
      const t = setTimeout(() => toastRef.current?.focus({ preventScroll: true }), 100);
      return () => clearTimeout(t);
    }
  }, [toast?.message, toast?.type]);
  if (!toast) return null;
  return (
    <div
      ref={toastRef}
      className={`brainwave-toast brainwave-toast-${toast.type}`}
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      aria-atomic
      aria-label={toast.message}
      tabIndex={-1}
      data-testid="global-toast"
    >
      {toast.type === 'error' ? '⚠️ ' : toast.type === 'info' ? 'ℹ️ ' : '✅ '}{toast.message}
    </div>
  );
}

const MOBILE_BREAKPOINT = 768;
const SIDEBAR_COLLAPSED_KEY = 'sidebarCollapsed';

// 앱 시작 시 저장된 강조색 적용
try {
  const savedAccent = localStorage.getItem('corbu.settings.accentColor');
  if (savedAccent) {
    document.documentElement.style.setProperty('--accent-primary', savedAccent);
    document.documentElement.style.setProperty('--accent-primary-muted', savedAccent + '22');
  }
} catch { /* ignore */ }

type SidebarChatItem = { id: string; title: string; updatedAt: string; projectId?: string; gensparkAgentId?: string; pinned?: boolean };

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase().trim());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="sidebar-search-hl">{text.slice(idx, idx + query.trim().length)}</mark>
      {text.slice(idx + query.trim().length)}
    </>
  );
}

function SidebarConversationRow(props: {
  chat: SidebarChatItem;
  displayTitle: React.ReactNode;
  linkTitle: string;
  isActive: boolean;
  collapsed: boolean;
  to: string;
  navState: { conversationId: string };
  navClassName: string;
  titlePrefix?: React.ReactNode;
  onRequestDelete: (chat: SidebarChatItem) => void;
}) {
  const {
    chat,
    displayTitle,
    linkTitle,
    isActive,
    collapsed,
    to,
    navState,
    navClassName,
    titlePrefix,
    onRequestDelete,
  } = props;
  return (
    <div
      className={`sidebar-chat-item-row${isActive ? ' sidebar-chat-item-row--active' : ''}`}
      role="listitem"
    >
      <NavLink to={to} state={navState} className={navClassName} title={linkTitle}>
        {!collapsed && (
          <span className="sidebar-chat-title">
            {chat.pinned && (
              <span className="sidebar-chat-pin-icon" aria-label="고정된 대화" title="고정된 대화">
                📌
              </span>
            )}
            {titlePrefix}
            {(() => {
              const color = getConvColor(chat.title);
              return color ? (
                <span
                  className="sidebar-conv-dot"
                  style={{ background: color }}
                  aria-hidden
                />
              ) : null;
            })()}
            {displayTitle}
          </span>
        )}
        {collapsed && <IconMessage size={18} aria-hidden className="sidebar-chat-item-icon" />}
      </NavLink>
      <button
        type="button"
        className={`sidebar-chat-delete-btn${collapsed ? ' sidebar-chat-delete-btn--collapsed' : ''}`}
        aria-label={`대화 삭제: ${chat.title}`}
        title="대화 삭제"
        data-testid={TEST_IDS.SIDEBAR_CONVERSATION_DELETE}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRequestDelete(chat);
        }}
      >
        <IconTrash size={collapsed ? 12 : 14} aria-hidden />
      </button>
    </div>
  );
}

/* ── 대화 카테고리 색상 태그 ── */
const CONV_CATEGORIES: { keywords: string[]; color: string; dot: string }[] = [
  { keywords: ['코드', 'code', '프로그램', 'bug', 'error', 'react', 'typescript', '함수', 'python', 'javascript'], color: '#6366f1', dot: '🟣' },
  { keywords: ['요약', 'summary', '번역', 'translate', '문서', '작성', '글쓰기'], color: '#22d3ee', dot: '🔵' },
  { keywords: ['분석', 'analysis', 'data', '데이터', '통계', '차트'], color: '#f59e0b', dot: '🟡' },
  { keywords: ['에이전트', 'agent', 'ai', '질문', 'help'], color: '#10b981', dot: '🟢' },
];

function getConvColor(title: string): string | null {
  const lower = title.toLowerCase();
  for (const cat of CONV_CATEGORIES) {
    if (cat.keywords.some((kw) => lower.includes(kw))) return cat.color;
  }
  return null;
}

/** 대화 날짜를 오늘/어제/이번 주/이전 중 하나로 분류 */
function getSidebarDateGroup(updatedAt: string): '오늘' | '어제' | '이번 주' | '이전' {
  if (!updatedAt) return '이전';
  const d = new Date(updatedAt);
  if (isNaN(d.getTime())) return '이전';
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 86400000);
  const startOfWeek = new Date(startOfToday.getTime() - startOfToday.getDay() * 86400000);
  if (d >= startOfToday) return '오늘';
  if (d >= startOfYesterday) return '어제';
  if (d >= startOfWeek) return '이번 주';
  return '이전';
}

const DATE_GROUP_ORDER: ReadonlyArray<'오늘' | '어제' | '이번 주' | '이전'> = ['오늘', '어제', '이번 주', '이전'];

function loadSidebarChats(): SidebarChatItem[] {
  try {
    const raw = localStorage.getItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<{
      id: string;
      title: string;
      updatedAt: string;
      projectId?: string;
      gensparkAgentId?: string;
      pinned?: boolean;
    }>;
    return (parsed || [])
      .filter((c) => c?.id && (c.title != null || c.updatedAt != null))
      .map((c) => {
        const gid =
          typeof c.gensparkAgentId === 'string' ? coerceTrimmedString(c.gensparkAgentId, '') : '';
        return {
          id: c.id,
          title: c.title || '새 대화',
          updatedAt: c.updatedAt || '',
          projectId: c.projectId,
          gensparkAgentId: gid || undefined,
          pinned: c.pinned === true,
        };
      })
      .sort((a, b) => {
        // 핀 고정 대화를 맨 앞에 배치
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return (b.updatedAt || '').localeCompare(a.updatedAt || '');
      });
  } catch {
    return [];
  }
}

/* ── 브레드크럼 경로 맵 ── */
const BREADCRUMB_MAP: Record<string, { label: string; icon: string }> = {
  '/': { label: '홈', icon: '🏠' },
  '/chat': { label: '대화', icon: '💬' },
  '/agents': { label: '에이전트 허브', icon: '🤖' },
  '/dashboard': { label: '대시보드', icon: '📊' },
  '/analytics': { label: '분석', icon: '📈' },
  '/automation': { label: '자동화', icon: '⚡' },
  '/templates': { label: '템플릿', icon: '📋' },
  '/community': { label: '커뮤니티', icon: '👥' },
  '/team': { label: '팀', icon: '🫂' },
  '/learn': { label: '학습', icon: '🎓' },
  '/search': { label: '검색', icon: '🔍' },
  '/settings': { label: '설정', icon: '⚙️' },
  '/billing': { label: '청구', icon: '💳' },
  '/docs': { label: '문서', icon: '📄' },
  '/devstatus': { label: '개발 현황', icon: '🛠' },
};

function buildBreadcrumbs(pathname: string): { label: string; icon: string; path: string }[] {
  const exact = BREADCRUMB_MAP[pathname];
  const crumbs: { label: string; icon: string; path: string }[] = [{ label: '홈', icon: '🏠', path: '/' }];
  if (pathname !== '/') {
    if (exact) {
      crumbs.push({ ...exact, path: pathname });
    } else {
      const segments = pathname.split('/').filter(Boolean);
      let acc = '';
      segments.forEach((seg) => {
        acc += `/${seg}`;
        const map = BREADCRUMB_MAP[acc];
        crumbs.push({ label: map?.label ?? seg, icon: map?.icon ?? '📂', path: acc });
      });
    }
  }
  return crumbs;
}

function Breadcrumb({ pathname }: { pathname: string }) {
  const navigate = useNavigate();
  const crumbs = buildBreadcrumbs(pathname);
  const [histLen, setHistLen] = React.useState(window.history.length);
  React.useEffect(() => { setHistLen(window.history.length); }, [pathname]);

  /* 헤더 인라인 다크모드 토글 */
  const [dark, setDark] = React.useState(() => document.documentElement.getAttribute('data-theme') === 'dark');
  const quickToggleDark = React.useCallback(() => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    try { localStorage.setItem('corbu.theme', next ? 'dark' : 'light'); } catch { /* noop */ }
    /* AppUnified의 isDarkMode 상태와 동기화 (storage 이벤트) */
    window.dispatchEvent(new StorageEvent('storage', { key: 'corbu.theme', newValue: next ? 'dark' : 'light' }));
  }, [dark]);

  const themeBtn = (
    <button
      type="button"
      className="breadcrumb-theme-btn"
      onClick={quickToggleDark}
      aria-label={dark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      title={`${dark ? '라이트' : '다크'} 모드 (Ctrl+Shift+L)`}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );

  if (crumbs.length <= 1) return (
    <div className="app-breadcrumb app-breadcrumb--nav-only" aria-label="페이지 이동">
      <button type="button" className="app-nav-hist-btn" onClick={() => navigate(-1)} aria-label="이전 페이지" title="뒤로 (Alt+←)" disabled={histLen <= 1}>‹</button>
      <button type="button" className="app-nav-hist-btn" onClick={() => navigate(1)} aria-label="다음 페이지" title="앞으로 (Alt+→)">›</button>
      {themeBtn}
    </div>
  );
  return (
    <nav className="app-breadcrumb" aria-label="현재 위치">
      <button type="button" className="app-nav-hist-btn" onClick={() => navigate(-1)} aria-label="이전 페이지" title="뒤로" disabled={histLen <= 1}>‹</button>
      <button type="button" className="app-nav-hist-btn" onClick={() => navigate(1)} aria-label="다음 페이지" title="앞으로">›</button>
      <ol className="app-breadcrumb-list">
        {crumbs.map((c, i) => (
          <li key={c.path} className="app-breadcrumb-item">
            {i < crumbs.length - 1 ? (
              <>
                <button
                  type="button"
                  className="app-breadcrumb-link"
                  onClick={() => navigate(c.path)}
                  aria-label={`${c.label}으로 이동`}
                >
                  <span aria-hidden>{c.icon}</span> {c.label}
                </button>
                <span className="app-breadcrumb-sep" aria-hidden>›</span>
              </>
            ) : (
              <span className="app-breadcrumb-current" aria-current="page">
                <span aria-hidden>{c.icon}</span> {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
      {themeBtn}
    </nav>
  );
}

/* ── 최근 방문 페이지 히스토리 ── */
const RECENT_PAGES_KEY = 'corbu.recentPages';
const MAX_RECENT_PAGES = 8;

interface RecentPage { path: string; label: string; icon: string; visitedAt: string; }

function pushRecentPage(pathname: string) {
  const info = BREADCRUMB_MAP[pathname];
  if (!info || pathname === '/') return;
  try {
    const prev: RecentPage[] = JSON.parse(localStorage.getItem(RECENT_PAGES_KEY) ?? '[]');
    const entry: RecentPage = { path: pathname, label: info.label, icon: info.icon, visitedAt: new Date().toISOString() };
    const filtered = prev.filter((p) => p.path !== pathname);
    localStorage.setItem(RECENT_PAGES_KEY, JSON.stringify([entry, ...filtered].slice(0, MAX_RECENT_PAGES)));
  } catch { /* ignore */ }
}

/* ── 온보딩 투어 ── */
const ONBOARDING_KEY = 'corbu.onboarding.done';

interface OnboardingStep {
  id: number;
  icon: string;
  title: string;
  desc: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: 1, icon: '👋', title: '환영합니다!', desc: 'Corbu AI에 오신 것을 환영합니다. 이 짧은 투어로 핵심 기능을 소개해 드릴게요.' },
  { id: 2, icon: '💬', title: 'AI 대화', desc: '왼쪽 사이드바에서 "새 대화"를 클릭하거나 Ctrl+N을 눌러 AI와 대화를 시작할 수 있습니다.' },
  { id: 3, icon: '🤖', title: 'AI 에이전트 허브', desc: '코딩, 번역, 요약 등 특화된 AI 에이전트를 에이전트 허브에서 선택해 사용해 보세요.' },
  { id: 4, icon: '⚡', title: '자동화 워크플로우', desc: '반복 작업을 자동화하세요. 예약 실행, 반복 실행 등 다양한 자동화 기능을 지원합니다.' },
  { id: 5, icon: '⌨️', title: '키보드 단축키', desc: 'Ctrl+K로 커맨드 팔레트, Ctrl+Shift+F로 포커스 모드를 빠르게 실행할 수 있습니다.' },
  { id: 6, icon: '🎉', title: '모든 준비 완료!', desc: '이제 Corbu AI를 자유롭게 탐색해 보세요. 언제든지 ? 키를 눌러 단축키 도움말을 볼 수 있습니다.' },
];

function OnboardingTour({ onClose }: { onClose: () => void }) {
  const [step, setStep] = React.useState(0);
  const current = ONBOARDING_STEPS[step];
  const isLast = step === ONBOARDING_STEPS.length - 1;

  const handleFinish = () => {
    try { localStorage.setItem(ONBOARDING_KEY, '1'); } catch { /* noop */ }
    onClose();
  };

  return (
    <div className="onboarding-overlay" role="dialog" aria-modal="true" aria-label="온보딩 투어">
      <div className="onboarding-panel">
        <div className="onboarding-progress">
          {ONBOARDING_STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`onboarding-dot${i === step ? ' onboarding-dot--active' : i < step ? ' onboarding-dot--done' : ''}`}
              aria-hidden
            />
          ))}
        </div>
        <div className="onboarding-icon" aria-hidden>{current.icon}</div>
        <h2 className="onboarding-title">{current.title}</h2>
        <p className="onboarding-desc">{current.desc}</p>
        <div className="onboarding-actions">
          <button
            type="button"
            className="onboarding-btn-skip"
            onClick={handleFinish}
            aria-label="투어 건너뛰기"
          >
            건너뛰기
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            {step > 0 && (
              <button
                type="button"
                className="onboarding-btn-prev"
                onClick={() => setStep(s => s - 1)}
                aria-label="이전 단계"
              >
                ← 이전
              </button>
            )}
            {isLast ? (
              <button
                type="button"
                className="onboarding-btn-next"
                onClick={handleFinish}
                aria-label="투어 완료"
              >
                🎉 시작하기
              </button>
            ) : (
              <button
                type="button"
                className="onboarding-btn-next"
                onClick={() => setStep(s => s + 1)}
                aria-label="다음 단계"
              >
                다음 →
              </button>
            )}
          </div>
        </div>
        <p className="onboarding-step-count">{step + 1} / {ONBOARDING_STEPS.length}</p>
      </div>
    </div>
  );
}

/* ── 바로가기 즐겨찾기 ── */
const NAV_FAVS_KEY = 'corbu.navFavorites';

function loadNavFavs(): string[] {
  try { return JSON.parse(localStorage.getItem(NAV_FAVS_KEY) ?? '[]'); } catch { return []; }
}
function saveNavFavs(favs: string[]): void {
  try { localStorage.setItem(NAV_FAVS_KEY, JSON.stringify(favs)); } catch { /* ignore */ }
}

function NavFavoritesBar({ pathname }: { pathname: string }) {
  const navigate = useNavigate();
  const [favs, setFavs] = useState<string[]>(() => loadNavFavs());
  const [showAll, setShowAll] = useState(false);

  // 외부에서 Ctrl+D 이벤트 수신
  useEffect(() => {
    const handler = (e: Event) => {
      const path = (e as CustomEvent<string>).detail;
      setFavs((prev) => {
        const next = prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path];
        saveNavFavs(next);
        return next;
      });
    };
    window.addEventListener('corbu:toggleNavFav', handler);
    return () => window.removeEventListener('corbu:toggleNavFav', handler);
  }, []);

  if (favs.length === 0) return null;

  const displayed = showAll ? favs : favs.slice(0, 6);

  return (
    <div className="nav-favs-bar" aria-label="바로가기 즐겨찾기">
      <span className="nav-favs-label">★</span>
      {displayed.map((path) => {
        const info = BREADCRUMB_MAP[path];
        if (!info) return null;
        const isActive = pathname === path;
        return (
          <button
            key={path}
            type="button"
            className={`nav-fav-chip${isActive ? ' nav-fav-chip--active' : ''}`}
            onClick={() => navigate(path)}
            title={info.label}
          >
            <span aria-hidden>{info.icon}</span> {info.label}
          </button>
        );
      })}
      {favs.length > 6 && (
        <button type="button" className="nav-fav-more" onClick={() => setShowAll((v) => !v)}>
          {showAll ? '접기' : `+${favs.length - 6}`}
        </button>
      )}
    </div>
  );
}

function RecentPagesDropdown() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pages, setPages] = useState<RecentPage[]>(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_PAGES_KEY) ?? '[]'); } catch { return []; }
  });
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === RECENT_PAGES_KEY) {
        try { setPages(JSON.parse(e.newValue ?? '[]')); } catch { /* ignore */ }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (pages.length === 0) return null;

  return (
    <div className="recent-pages-wrap" role="region" aria-label="최근 방문 페이지">
      <button
        ref={btnRef}
        type="button"
        className={`recent-pages-btn${open ? ' recent-pages-btn--open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="최근 방문 페이지"
        title="최근 방문 페이지"
      >
        🕓 <span className="recent-pages-btn-label">최근</span>
        <span className="recent-pages-caret" aria-hidden>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <ul
          className="recent-pages-list"
          role="listbox"
          aria-label="최근 방문 페이지 목록"
          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false); }}
        >
          {pages.map((p) => {
            const d = new Date(p.visitedAt);
            const isToday = d.toDateString() === new Date().toDateString();
            const timeStr = isToday
              ? d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
              : d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
            return (
              <li key={p.path} role="option" aria-selected={false}>
                <button
                  type="button"
                  className="recent-pages-item"
                  onClick={() => { navigate(p.path); setOpen(false); }}
                >
                  <span className="recent-pages-icon" aria-hidden>{p.icon}</span>
                  <span className="recent-pages-label">{p.label}</span>
                  <time className="recent-pages-time" dateTime={d.toISOString()}>{timeStr}</time>
                </button>
              </li>
            );
          })}
          <li role="option" aria-selected={false}>
            <button
              type="button"
              className="recent-pages-clear"
              onClick={() => { localStorage.removeItem(RECENT_PAGES_KEY); setPages([]); setOpen(false); }}
            >
              🗑 기록 지우기
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}

/* ── 알림 센터 ── */
const NOTIF_STORE_KEY = 'corbu.notifCenter';
interface NotifItem { id: string; title: string; body: string; level: 'info' | 'success' | 'warn' | 'error'; ts: string; read: boolean; }

function loadNotifs(): NotifItem[] {
  try { return JSON.parse(localStorage.getItem(NOTIF_STORE_KEY) ?? '[]') as NotifItem[]; } catch { return []; }
}
function saveNotifs(items: NotifItem[]) {
  try { localStorage.setItem(NOTIF_STORE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
}

const NOTIF_LEVEL_ICON: Record<NotifItem['level'], string> = {
  info: 'ℹ️', success: '✅', warn: '⚠️', error: '🔴',
};

function NotificationCenter() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotifItem[]>(() => loadNotifs());
  const unread = items.filter((n) => !n.read).length;

  // 시스템 이벤트 수집 (alert 로그 변경 시)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'corbu.dash.alertLog') {
        try {
          const logs: { ts: string; level: string; message: string }[] = JSON.parse(e.newValue ?? '[]');
          const current = loadNotifs();
          const existingTs = new Set(current.map((n) => n.ts));
          const newItems: NotifItem[] = logs
            .filter((l) => !existingTs.has(l.ts))
            .slice(0, 3)
            .map((l) => ({
              id: `dash-${l.ts}`,
              title: l.level === 'error' ? '시스템 오류' : l.level === 'warn' ? '경고' : '시스템 정보',
              body: l.message,
              level: (l.level as NotifItem['level']) || 'info',
              ts: l.ts,
              read: false,
            }));
          if (newItems.length > 0) {
            const updated = [...newItems, ...current].slice(0, 30);
            setItems(updated);
            saveNotifs(updated);
          }
        } catch { /* ignore */ }
      }
      if (e.key === NOTIF_STORE_KEY) {
        try { setItems(JSON.parse(e.newValue ?? '[]')); } catch { /* ignore */ }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const markAllRead = () => {
    const updated = items.map((n) => ({ ...n, read: true }));
    setItems(updated);
    saveNotifs(updated);
  };

  const clearAll = () => { setItems([]); saveNotifs([]); setOpen(false); };

  const dismiss = (id: string) => {
    const updated = items.filter((n) => n.id !== id);
    setItems(updated);
    saveNotifs(updated);
  };

  // 샘플 알림 추가 (비어있을 때)
  const addSample = () => {
    const sample: NotifItem[] = [
      { id: `s1-${Date.now()}`, title: '새 커뮤니티 글', body: 'AI 에이전트 활용 팁 모음 게시글이 올라왔습니다.', level: 'info', ts: new Date().toISOString(), read: false },
      { id: `s2-${Date.now()}`, title: '자동화 완료', body: '매일 리포트 워크플로우가 성공적으로 실행되었습니다.', level: 'success', ts: new Date(Date.now() - 60000).toISOString(), read: false },
    ];
    const updated = [...sample, ...items].slice(0, 30);
    setItems(updated);
    saveNotifs(updated);
  };

  return (
    <div className="notif-center-wrap" role="region" aria-label="알림 센터">
      <button
        type="button"
        className={`notif-center-btn${open ? ' notif-center-btn--open' : ''}`}
        onClick={() => {
          setOpen((v) => !v);
          if (!open && unread > 0) {
            setTimeout(markAllRead, 1200);
          }
        }}
        aria-expanded={open}
        aria-label={`알림 센터 ${unread > 0 ? `(읽지 않은 ${unread}개)` : ''}`}
        title="알림 센터"
      >
        🔔
        {unread > 0 && (
          <span className="notif-center-badge" aria-hidden>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>
      {open && (
        <div className="notif-center-panel" role="dialog" aria-label="알림 목록">
          <div className="notif-center-header">
            <span className="notif-center-title">🔔 알림 센터</span>
            {/* 레벨별 색상 범례 */}
            {items.length > 0 && (
              <div className="notif-level-legend">
                {(['info','success','warn','error'] as const).map(lv => {
                  const cnt = items.filter(n => n.level === lv).length;
                  if (cnt === 0) return null;
                  return (
                    <span key={lv} className={`notif-level-badge notif-level-badge--${lv}`} title={lv}>
                      {NOTIF_LEVEL_ICON[lv]} {cnt}
                    </span>
                  );
                })}
              </div>
            )}
            <div className="notif-center-header-actions">
              {items.length === 0 && (
                <button type="button" className="notif-center-action" onClick={addSample} title="샘플 추가">
                  + 샘플
                </button>
              )}
              {items.length > 0 && (
                <>
                  <button type="button" className="notif-center-action" onClick={markAllRead}>모두 읽음</button>
                  <button type="button" className="notif-center-action notif-center-action--danger" onClick={clearAll}>전체 삭제</button>
                </>
              )}
              <button type="button" className="notif-center-close" onClick={() => setOpen(false)} aria-label="닫기">✕</button>
            </div>
          </div>
          <ul className="notif-center-list" aria-label="알림 항목">
            {items.length === 0 ? (
              <li className="notif-center-empty">
                <span>📭</span>
                <span>새 알림이 없습니다</span>
              </li>
            ) : (
              items.map((n) => {
                const d = new Date(n.ts);
                const isToday = d.toDateString() === new Date().toDateString();
                const timeStr = isToday
                  ? d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
                  : d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
                return (
                  <li key={n.id} className={`notif-center-item notif-center-item--${n.level}${n.read ? ' notif-center-item--read' : ''}`}>
                    <span className="notif-center-item-icon" aria-hidden>{NOTIF_LEVEL_ICON[n.level]}</span>
                    <div className="notif-center-item-body">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="notif-center-item-title">{n.title}</span>
                        <span className={`notif-level-badge notif-level-badge--${n.level}`}>
                          {{ info: '정보', success: '성공', warn: '경고', error: '오류' }[n.level]}
                        </span>
                      </div>
                      <span className="notif-center-item-desc">{n.body}</span>
                      <time className="notif-center-item-time" dateTime={d.toISOString()}>{timeStr}</time>
                    </div>
                    <button
                      type="button"
                      className="notif-center-item-dismiss"
                      onClick={() => dismiss(n.id)}
                      aria-label="알림 닫기"
                    >✕</button>
                  </li>
                );
              })
            )}
          </ul>
          <div className="notif-center-footer">
            <button type="button" className="notif-center-footer-btn" onClick={() => { navigate('/dashboard'); setOpen(false); }}>
              📊 대시보드에서 전체 이벤트 보기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── What's New 배너 ── */
const WHATS_NEW_KEY = 'corbu.whatsNew.dismissed';
const WHATS_NEW_VERSION = 'v2026.04.25';

const WHATS_NEW_FEATURES = [
  '📎 입력창 파일 첨부 드래그&드롭',
  '🔍 통합 검색 (대화+템플릿+커뮤니티)',
  '📋 실시간 이벤트 로그 (대시보드)',
  '⚡ 워크플로우 조건/액션 편집기',
  '✅ 학습 진도 체크리스트',
  '🔒 데이터 프라이버시 관리',
  '🍞 전역 브레드크럼 네비게이션',
];

function WhatsNewBanner() {
  const [visible, setVisible] = useState(() => {
    try { return localStorage.getItem(WHATS_NEW_KEY) !== WHATS_NEW_VERSION; } catch { return true; }
  });
  const [expanded, setExpanded] = useState(false);

  const dismiss = useCallback(() => {
    try { localStorage.setItem(WHATS_NEW_KEY, WHATS_NEW_VERSION); } catch { /* ignore */ }
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div className="whats-new-banner" role="region" aria-label="새로운 기능 안내">
      <div className="whats-new-banner__header">
        <span className="whats-new-banner__title">
          🎉 새로운 기능이 추가되었습니다 <span className="whats-new-badge">{WHATS_NEW_VERSION}</span>
        </span>
        <div className="whats-new-banner__actions">
          <button
            type="button"
            className="whats-new-toggle"
            onClick={() => setExpanded((p) => !p)}
            aria-expanded={expanded}
          >
            {expanded ? '접기 ▲' : '자세히 ▼'}
          </button>
          <button
            type="button"
            className="whats-new-close"
            onClick={dismiss}
            aria-label="배너 닫기"
          >✕</button>
        </div>
      </div>
      {expanded && (
        <ul className="whats-new-list" aria-label="새 기능 목록">
          {WHATS_NEW_FEATURES.map((f) => (
            <li key={f} className="whats-new-item">{f}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Layout() {
  const navigate = useNavigate();
  const { pathname, search, state: locationState } = useLocation();
  const currentConversationId = (locationState as { conversationId?: string } | null)?.conversationId;
  const agentsSidebarQueryId =
    pathname === AGENTS_PATH
      ? resolveAgentIdFromGensparkAgentsQuery(new URLSearchParams(search)) ?? ''
      : '';
  const standaloneChatPath = getStandaloneChatPath();
  const appEntryPath = getAppEntryPath();
  const { isDarkMode, setMode } = useTheme();
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      return v === 'true';
    } catch {
      return false;
    }
  });
  const [focusMode, setFocusMode] = useState(false);
  const [brandMoreOpen, setBrandMoreOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');
  const [sidebarChatFilter, setSidebarChatFilter] = useState<'all' | 'pinned' | 'today' | 'week'>('all');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('corbu.sidebar.collapsedGroups') ?? '[]') as string[]); } catch { return new Set(); }
  });
  const toggleGroupCollapse = useCallback((g: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g); else next.add(g);
      try { localStorage.setItem('corbu.sidebar.collapsedGroups', JSON.stringify(Array.from(next))); } catch { /* ignore */ }
      return next;
    });
  }, []);
  const [sidebarProjects, setSidebarProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [sidebarChats, setSidebarChats] = useState<SidebarChatItem[]>(() => loadSidebarChats());
  const [deleteChatConfirm, setDeleteChatConfirm] = useState<SidebarChatItem | null>(null);
  const brandMoreRef = useRef<HTMLDivElement>(null);
  const brandMoreBtnRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sidebarDeleteCancelRef = useRef<HTMLButtonElement>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { return !localStorage.getItem(ONBOARDING_KEY); } catch { return false; }
  });

  /* 사이드바 네비 배지 카운트 */
  const [navBadges, setNavBadges] = useState<Record<string, number>>({});
  useEffect(() => {
    const calc = () => {
      try {
        const posts: { createdAt?: string }[] = JSON.parse(localStorage.getItem('corbu.community.posts') ?? '[]');
        const lastVisit = Number(localStorage.getItem('corbu.community.lastVisit') ?? '0');
        const newPosts = posts.filter((p) => new Date(p.createdAt ?? '').getTime() > lastVisit).length;

        const workflows: { status?: string }[] = JSON.parse(localStorage.getItem('corbu.automation.workflows') ?? '[]');
        const runs: { status?: string }[] = JSON.parse(localStorage.getItem('corbu.automation.runs') ?? '[]');
        const failedRuns = runs.filter((r) => r.status === 'failed').length;

        setNavBadges({
          '/community': newPosts,
          '/automation': failedRuns,
        });
      } catch { /* ignore */ }
    };
    calc();
    window.addEventListener('storage', calc);
    return () => window.removeEventListener('storage', calc);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* Ctrl+K / Cmd+K 전역 단축키로 커맨드 팔레트 열기 */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCmdPaletteOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  /* Ctrl+B / Cmd+B 전역 단축키 — 사이드바 토글 */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key !== 'b') return;
      const tag = (e.target as HTMLElement)?.tagName ?? '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;
      e.preventDefault();
      setSidebarCollapsed((v) => {
        const next = !v;
        try { localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next)); } catch { /* ignore */ }
        return next;
      });
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  /* Ctrl+Shift+F / Cmd+Shift+F 전역 단축키 — 포커스 모드 토글 */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || !e.shiftKey || e.key.toLowerCase() !== 'f') return;
      const tag = (e.target as HTMLElement)?.tagName ?? '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;
      e.preventDefault();
      setFocusMode((v) => !v);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  /* Ctrl+Shift+L — 테마 빠른 토글 */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || !e.shiftKey || e.key.toLowerCase() !== 'l') return;
      e.preventDefault();
      setMode(isDarkMode ? 'light' : 'dark');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isDarkMode, setMode]);

  /* Ctrl+D / Cmd+D 전역 단축키 — 현재 페이지 즐겨찾기 토글 */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'd') return;
      const tag = (e.target as HTMLElement)?.tagName ?? '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;
      if (!BREADCRUMB_MAP[pathname] || pathname === '/') return;
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('corbu:toggleNavFav', { detail: pathname }));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [pathname]);

  /* Alt+← / Alt+→ — 페이지 뒤로/앞으로 */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      const tag = (e.target as HTMLElement)?.tagName ?? '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); navigate(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); navigate(1); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);

  /* Ctrl+N / Cmd+N 전역 단축키 — 새 대화 */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key !== 'n') return;
      const tag = (e.target as HTMLElement)?.tagName ?? '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;
      e.preventDefault();
      navigate(standaloneChatPath);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate, standaloneChatPath]);

  // 라우트 변경 시 main에 포커스, 모바일·더보기 메뉴 닫기, 히스토리 기록
  useEffect(() => {
    const main = document.getElementById('main-content');
    if (main) main.focus({ preventScroll: true });
    setSidebarMobileOpen(false);
    setBrandMoreOpen(false);
    pushRecentPage(pathname);
  }, [pathname]);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed));
    } catch {
      /* ignore */
    }
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (sidebarCollapsed) setBrandMoreOpen(false);
  }, [sidebarCollapsed]);

  const refreshSidebarChats = useCallback(() => setSidebarChats(loadSidebarChats()), []);

  const confirmSidebarDeleteChat = useCallback(() => {
    if (!deleteChatConfirm) return;
    const id = deleteChatConfirm.id;
    const ok = removeConversationFromLocalStorage(id);
    setDeleteChatConfirm(null);
    if (!ok) {
      showToast('대화를 삭제하지 못했습니다.', 'error');
      return;
    }
    showToast('대화가 삭제되었습니다', 'success');
    window.dispatchEvent(new CustomEvent('sidebar-chats-updated'));
    window.dispatchEvent(new CustomEvent(CHATGPT_CONVERSATION_REMOVED_EVENT, { detail: { id } }));
    if (currentConversationId === id) {
      navigate({ pathname, search }, { replace: true, state: {} });
    }
  }, [deleteChatConfirm, currentConversationId, navigate, pathname, search]);

  useEffect(() => {
    if (!deleteChatConfirm) return;
    const id = window.requestAnimationFrame(() => sidebarDeleteCancelRef.current?.focus());
    return () => window.cancelAnimationFrame(id);
  }, [deleteChatConfirm]);

  useEffect(() => {
    refreshSidebarChats();
    const onChatsUpdated = () => refreshSidebarChats();
    window.addEventListener('sidebar-chats-updated', onChatsUpdated);
    return () => window.removeEventListener('sidebar-chats-updated', onChatsUpdated);
  }, [pathname, refreshSidebarChats]);

  // 사이드바 프로젝트 목록 — UI 프로젝트 모드일 때만 API 호출(기본 끔: 백엔드 오류·노이즈 방지)
  useEffect(() => {
    if (!isUiProjectsEnabled()) {
      setSidebarProjects([]);
      return;
    }
    let cancelled = false;
    projectService.getProjects().then((list) => {
      if (cancelled) return;
      setSidebarProjects(
        (list || []).filter((p) => p?.id && p?.name).map((p) => ({ id: p.id, name: p.name }))
      );
    }).catch(() => {
      if (!cancelled) setSidebarProjects([]);
    });
    return () => { cancelled = true; };
  }, [pathname]);

  useEffect(() => {
    if (!sidebarMobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sidebarMobileOpen]);

  // 글로벌 키보드 단축키
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      // 입력 필드·텍스트에리어에서는 단축키를 막지 않음 (Ctrl+/ 는 어디서도 동작)
      const inInput = document.activeElement instanceof HTMLInputElement ||
                      document.activeElement instanceof HTMLTextAreaElement;

      // Ctrl+K / Cmd+K : 사이드바 검색 포커스
      if (mod && e.key === 'k' && !inInput) {
        e.preventDefault();
        if (sidebarCollapsed) setSidebarCollapsed(false);
        requestAnimationFrame(() => searchInputRef.current?.focus());
        return;
      }
      // Ctrl+/ / Cmd+/ : 단축키 도움말 토글
      if (mod && e.key === '/') {
        e.preventDefault();
        setShortcutsOpen((v) => !v);
        return;
      }
      // Escape : 단축키 도움말 닫기
      if (e.key === 'Escape' && shortcutsOpen) {
        setShortcutsOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sidebarCollapsed, shortcutsOpen]);

  // 더보기 드롭다운: 외부 클릭·Escape 닫기, 열릴 때 첫 항목 포커스, ↑↓ 이동
  useEffect(() => {
    if (!brandMoreOpen) return;
    const container = brandMoreRef.current;
    const items = container?.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]') ?? [];
    const first = items[0];
    if (first) {
      requestAnimationFrame(() => first.focus());
    }
    const onPointerDown = (e: PointerEvent) => {
      if (container && !container.contains(e.target as Node)) setBrandMoreOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setBrandMoreOpen(false);
        requestAnimationFrame(() => brandMoreBtnRef.current?.focus());
        return;
      }
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      if (items.length === 0) return;
      e.preventDefault();
      const current = Array.from(items).indexOf(document.activeElement as HTMLAnchorElement);
      let next = current;
      if (e.key === 'ArrowDown') next = current < items.length - 1 ? current + 1 : 0;
      if (e.key === 'ArrowUp') next = current <= 0 ? items.length - 1 : current - 1;
      items[next]?.focus();
    };
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [brandMoreOpen]);

  return (
    <>
      <GlobalToastListener />
      {/* 키보드 단축키 도움말 모달 */}
      {shortcutsOpen && (
        <dialog
          className="modal-overlay"
          open
          aria-modal="true"
          aria-labelledby="shortcuts-dialog-title"
          onClick={(e) => { if (e.target === e.currentTarget) setShortcutsOpen(false); }}
          onKeyDown={(e) => { if (e.key === 'Escape') setShortcutsOpen(false); }}
        >
          <div className="modal-dialog shortcuts-dialog" role="document">
            <div className="modal-header">
              <h2 id="shortcuts-dialog-title" className="modal-title">⌨️ 키보드 단축키</h2>
              <button
                type="button"
                className="modal-close-btn"
                aria-label="단축키 도움말 닫기"
                onClick={() => setShortcutsOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="shortcuts-dialog-body">
              <table className="shortcuts-table">
                <thead>
                  <tr>
                    <th>단축키</th>
                    <th>기능</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><kbd>Ctrl</kbd>+<kbd>B</kbd></td><td>사이드바 접기 / 펼치기</td></tr>
                  <tr><td><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>F</kbd></td><td>포커스 모드 토글 (사이드바 완전 숨기기)</td></tr>
                  <tr><td><kbd>Ctrl</kbd>+<kbd>D</kbd></td><td>현재 페이지 바로가기 즐겨찾기 추가/해제</td></tr>
                  <tr><td><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>L</kbd></td><td>다크/라이트 테마 빠른 전환</td></tr>
                  <tr><td><kbd>Alt</kbd>+<kbd>←</kbd></td><td>이전 페이지로 이동</td></tr>
                  <tr><td><kbd>Alt</kbd>+<kbd>→</kbd></td><td>다음 페이지로 이동</td></tr>
                  <tr><td><kbd>Ctrl</kbd>+<kbd>N</kbd></td><td>새 대화 시작 (어디서나)</td></tr>
                  <tr><td><kbd>Ctrl</kbd>+<kbd>K</kbd></td><td>커맨드 팔레트 열기 (전체 페이지·기능 검색)</td></tr>
                  <tr><td><kbd>Ctrl</kbd>+<kbd>/</kbd></td><td>단축키 도움말 열기/닫기</td></tr>
                  <tr><td><kbd>Ctrl</kbd>+<kbd>1~0</kbd></td><td>홈 탭 전환 (홈 페이지에서)</td></tr>
                  <tr><td><kbd>Ctrl</kbd>+<kbd>Tab</kbd></td><td>다음 홈 탭으로 이동</td></tr>
                  <tr><td><kbd>Esc</kbd></td><td>모달·팔레트·메뉴 닫기</td></tr>
                  <tr><td><kbd>↑</kbd> <kbd>↓</kbd></td><td>드롭다운·팔레트 이동</td></tr>
                  <tr><td><kbd>Enter</kbd></td><td>메시지 전송 / 팔레트 선택</td></tr>
                  <tr><td><kbd>Shift</kbd>+<kbd>Enter</kbd></td><td>입력창 줄 바꿈</td></tr>
                </tbody>
              </table>
              <p className="shortcuts-dialog-hint">Mac에서는 <kbd>Ctrl</kbd> 대신 <kbd>⌘ Cmd</kbd>를 사용하세요.</p>
            </div>
          </div>
        </dialog>
      )}
      {deleteChatConfirm && (
        <dialog
          className="modal-overlay"
          open
          aria-modal="true"
          aria-label="대화 삭제 확인 모달"
          onCancel={(e) => {
            e.preventDefault();
            setDeleteChatConfirm(null);
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteChatConfirm(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setDeleteChatConfirm(null);
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontSize: '18px', fontWeight: 600 }}>
              대화 삭제
            </h2>
            <p style={{ margin: '0 0 8px', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
              다음 대화를 삭제하시겠습니까? 되돌릴 수 없습니다.
            </p>
            <p
              style={{
                margin: '0 0 20px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 500,
                padding: '12px',
                background: 'var(--sidebar-dark-hover)',
                borderRadius: '8px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              💬 {deleteChatConfirm.title}
            </p>
            <div className="modal-content-actions">
              <button
                ref={sidebarDeleteCancelRef}
                type="button"
                onClick={() => setDeleteChatConfirm(null)}
                aria-label="대화 삭제 취소"
                data-testid={TEST_IDS.SIDEBAR_DELETE_CONVERSATION_CANCEL}
                style={{
                  padding: '10px 20px',
                  border: '1px solid var(--sidebar-dark-border-strong)',
                  borderRadius: '6px',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                취소
              </button>
              <button
                type="button"
                onClick={confirmSidebarDeleteChat}
                aria-label="대화 삭제 확인"
                data-testid={TEST_IDS.SIDEBAR_DELETE_CONVERSATION_CONFIRM}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  background: 'var(--accent-error)',
                  color: 'var(--on-accent)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                삭제
              </button>
            </div>
          </div>
        </dialog>
      )}
    <div
      className="app-container brainwave-unified"
      data-testid="app-unified-root"
      data-brainwave-figma={FIGMA_BRAINWAVE_AI_UI_KIT_APP_URL}
    >
      <DocumentTitle />
      <a
        href="#main-content"
        className="skip-to-main"
        aria-label="본문으로 건너뛰기"
        onClick={(e) => {
          e.preventDefault();
          const el = document.getElementById('main-content');
          if (el) {
            el.focus({ preventScroll: false });
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      >
        본문으로 건너뛰기
      </a>
      {isMobile && sidebarMobileOpen && (
        <div
          className="brainwave-mobile-overlay"
          role="button"
          tabIndex={-1}
          aria-label="메뉴 닫기 (배경 클릭)"
          onClick={() => setSidebarMobileOpen(false)}
        />
      )}
      <aside
        className={`sidebar brainwave-sidebar-dark ${sidebarCollapsed ? 'sidebar--collapsed' : ''} ${isMobile && sidebarMobileOpen ? 'mobile-open' : ''} ${focusMode ? 'sidebar--focus-hidden' : ''}`}
        role="navigation"
        aria-label="주요 메뉴"
      >
        {isMobile && (
          <div className="sidebar-mobile-close-header">
            <button
              type="button"
              className="sidebar-mobile-close-btn"
              onClick={() => setSidebarMobileOpen(false)}
              aria-label="메뉴 닫기"
            >
              <IconX size={20} />
            </button>
          </div>
        )}
        <div className="sidebar-header sidebar-chatgpt-header">
          {/* 1. 로고 + 펼치기/접기 + 더보기 */}
          <div className="sidebar-brand-wrap" ref={brandMoreRef}>
            <NavLink to={appEntryPath} className="sidebar-brand-logo-link" aria-label="CORBU.AI 홈">
              <div className="sidebar-brand-row sidebar-brand-row--logo-only">
                <div className="sidebar-brand-title">
                  <div className="brainwave-logo-icon" aria-hidden="true">
                    <IconLogo size={24} />
                  </div>
                  {!sidebarCollapsed && <span className="brainwave-logo-text">CORBU.AI</span>}
                </div>
              </div>
            </NavLink>
            <button
              type="button"
              className="sidebar-toggle-btn"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              aria-label={sidebarCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
              title={sidebarCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
            >
              {sidebarCollapsed ? <IconChevronRight size={20} /> : <IconChevronLeft size={20} />}
            </button>
            {!sidebarCollapsed && (
            <button
              ref={brandMoreBtnRef}
              type="button"
              className="sidebar-brand-more-btn"
              aria-label="더 보기"
              aria-expanded={brandMoreOpen}
              aria-haspopup="true"
              onClick={() => setBrandMoreOpen((prev) => !prev)}
              data-testid="sidebar-brand-more-btn"
            >
              <IconMoreVertical size={20} />
            </button>
            )}
            {brandMoreOpen && (
            <div className="sidebar-brand-more-dropdown" role="menu">
              <NavLink to={standaloneChatPath} className="sidebar-brand-more-item" role="menuitem" onClick={() => setBrandMoreOpen(false)}>
                일반 대화
              </NavLink>
              {isUiProjectsEnabled() && (
              <NavLink to="/projects" className="sidebar-brand-more-item" role="menuitem" onClick={() => setBrandMoreOpen(false)}>
                프로젝트
              </NavLink>
              )}
              <NavLink to={VOICE_GENERATION_PATH} className="sidebar-brand-more-item" role="menuitem" onClick={() => setBrandMoreOpen(false)}>
                목소리 생성
              </NavLink>
              <NavLink to={AGENTS_PATH} className="sidebar-brand-more-item" role="menuitem" onClick={() => setBrandMoreOpen(false)}>
                에이전트
              </NavLink>
              <div className="sidebar-brand-more-separator" role="separator" aria-hidden />
              <NavLink to={SETTINGS_PATH} className="sidebar-brand-more-item" role="menuitem" onClick={() => setBrandMoreOpen(false)}>
                설정
              </NavLink>
              <NavLink to={ANALYTICS_PATH} className="sidebar-brand-more-item" role="menuitem" onClick={() => setBrandMoreOpen(false)}>
                분석
              </NavLink>
              <NavLink to={DOCS_PATH} className="sidebar-brand-more-item" role="menuitem" onClick={() => setBrandMoreOpen(false)}>
                도움말
              </NavLink>
              <NavLink to={SEARCH_PATH} className="sidebar-brand-more-item" role="menuitem" onClick={() => setBrandMoreOpen(false)}>
                검색
              </NavLink>
              <NavLink to={BACKUP_PATH} className="sidebar-brand-more-item" role="menuitem" onClick={() => setBrandMoreOpen(false)}>
                백업 및 복구
              </NavLink>
              <div className="sidebar-brand-more-separator" role="separator" aria-hidden />
              <NavLink to={DEV_STATUS_PATH} className="sidebar-brand-more-item" role="menuitem" onClick={() => setBrandMoreOpen(false)}>
                개발 현황
              </NavLink>
            </div>
            )}
          </div>
          {/* 2. 새 대화 (상단 고정 — Figma 펜 아이콘) */}
          <div className="sidebar-actions-row">
            <NavLink
              to={standaloneChatPath}
              className="sidebar-new-chat-btn sidebar-new-chat-btn--top"
              aria-label={isUiProjectsEnabled() ? '새 일반 대화 (프로젝트 없이)' : '새 대화'}
              title="새 대화"
            >
              <IconEdit size={18} aria-hidden className="sidebar-icon-new-chat" />
              {!sidebarCollapsed && <span>새 대화</span>}
            </NavLink>
          </div>
          {/* 3. 대화 검색 (Figma 검색 아이콘) */}
          <div
            className="sidebar-search-wrap"
            {...(sidebarCollapsed ? { role: 'button', tabIndex: 0, onClick: () => setSidebarCollapsed(false), onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSidebarCollapsed(false); } }, 'aria-label': '대화 검색 (클릭하여 사이드바 펼치기)' as const } : {})}
          >
            <IconSearch size={18} className="sidebar-search-icon" aria-hidden />
            {!sidebarCollapsed && (
            <input
              ref={searchInputRef}
              type="search"
              placeholder="대화 검색"
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuSearch('');
                }
              }}
              className="sidebar-search-input"
              aria-label="대화 검색"
              title="대화 검색 (Escape로 지우기)"
            />
            )}
            {!sidebarCollapsed && menuSearch.length > 0 && (
              <button
                type="button"
                className="sidebar-search-clear"
                onClick={() => {
                  setMenuSearch('');
                  searchInputRef.current?.focus();
                }}
                aria-label="검색어 지우기"
              >
                <IconX size={14} aria-hidden />
              </button>
            )}
          </div>
        </div>
        <div className="sidebar-body" aria-label="사이드바 리스트 영역">
          {/* 대화 날짜/유형 빠른 필터 탭 */}
          {!sidebarCollapsed && (
            <div className="sidebar-quick-filter-tabs" role="tablist" aria-label="대화 날짜 필터">
              {([
                { key: 'all',    label: '전체' },
                { key: 'pinned', label: '📌' },
                { key: 'today',  label: '오늘' },
                { key: 'week',   label: '이번 주' },
              ] as const).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={sidebarChatFilter === key}
                  className={`sidebar-qf-tab${sidebarChatFilter === key ? ' sidebar-qf-tab--active' : ''}`}
                  onClick={() => setSidebarChatFilter(key)}
                  title={label}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          {/* 카테고리 빠른 필터 (사이드바 펼침 상태에서만) */}
          {!sidebarCollapsed && (
            <div className="sidebar-cat-filters" aria-label="대화 카테고리 필터">
              {[
                { label: '전체', color: null },
                { label: '코드', color: '#6366f1' },
                { label: '요약', color: '#22d3ee' },
                { label: '분석', color: '#f59e0b' },
                { label: 'AI', color: '#10b981' },
              ].map(({ label, color }) => (
                <button
                  key={label}
                  type="button"
                  className={`sidebar-cat-filter-btn${(color ? menuSearch === label : menuSearch === '') ? ' sidebar-cat-filter-btn--active' : ''}`}
                  style={color ? { '--cat-color': color } as React.CSSProperties : undefined}
                  onClick={() => setMenuSearch(color ? (menuSearch === label ? '' : label) : '')}
                  aria-pressed={color ? menuSearch === label : menuSearch === ''}
                  title={`${label} 필터`}
                >
                  {color && <span className="sidebar-cat-dot" style={{ background: color }} aria-hidden />}
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* 대화 기록: 프로젝트 목록과 동일한 상단 슬롯(다단계 UI형 기본에서도 맨 위) */}
          <nav className="sidebar-nav sidebar-chatgpt-nav" aria-label="대화 기록">
            {!sidebarCollapsed && <h3 className="sidebar-project-section-title">채팅</h3>}
            <div className="sidebar-topic-list sidebar-chat-list" role="list">
              {(() => {
                const q = coerceTrimmedString(menuSearch, '').toLowerCase();
                const todayStr = new Date().toISOString().slice(0, 10);
                const weekAgo = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
                const quickFiltered = sidebarChats.filter(c => {
                  if (sidebarChatFilter === 'pinned') return !!c.pinned;
                  if (sidebarChatFilter === 'today') return (c.updatedAt ?? '').slice(0, 10) === todayStr;
                  if (sidebarChatFilter === 'week') return (c.updatedAt ?? '').slice(0, 10) >= weekAgo;
                  return true;
                });
                const filtered = q
                  ? quickFiltered.filter((c) => (c.title || '').toLowerCase().includes(q))
                  : quickFiltered;

                const uiProjects = isUiProjectsEnabled();

                type SidebarChatRow =
                  | { kind: 'general'; chat: SidebarChatItem }
                  | { kind: 'agent'; chat: SidebarChatItem }
                  | { kind: 'project'; chat: SidebarChatItem; pid: string; label: string };

                const rows: SidebarChatRow[] = [];
                for (const c of filtered) {
                  if (c.gensparkAgentId && !c.projectId) {
                    rows.push({ kind: 'agent', chat: c });
                  } else if (c.projectId && uiProjects) {
                    const pid = c.projectId;
                    const project = sidebarProjects.find((p) => p.id === pid);
                    const label =
                      project?.name || (pid.length > 10 ? `${pid.slice(0, 8)}…` : pid);
                    rows.push({ kind: 'project', chat: c, pid, label });
                  } else if (!c.gensparkAgentId && (!c.projectId || !uiProjects)) {
                    rows.push({ kind: 'general', chat: c });
                  }
                }
                rows.sort((a, b) =>
                  (b.chat.updatedAt || '').localeCompare(a.chat.updatedAt || '')
                );

                if (rows.length === 0) {
                  const isEmpty = sidebarChats.length === 0;
                  return (
                    <p
                      className="sidebar-topic-empty"
                      {...(q && !isEmpty ? { role: 'status' as const, 'aria-live': 'polite' as const } : {})}
                    >
                      {isEmpty ? '아직 생성된 대화가 없습니다' : `"${q}" — 결과 없음`}
                    </p>
                  );
                }

                /* 검색 결과 카운트 */
                const countLabel = q ? (
                  <p className="sidebar-search-count" role="status" aria-live="polite">
                    <span>{rows.length}건</span>
                    <button type="button" className="sidebar-search-count-clear" onClick={() => setMenuSearch('')} aria-label="검색 초기화">✕ 지우기</button>
                  </p>
                ) : null;

                /** 각 row를 JSX로 변환하는 헬퍼 */
                const renderRow = (row: SidebarChatRow) => {
                  const chat = row.chat;
                  if (row.kind === 'general') {
                    const isActiveChat = isStandaloneChatPath(pathname) && currentConversationId === chat.id;
                    return (
                      <SidebarConversationRow
                        key={chat.id}
                        chat={chat}
                        displayTitle={highlightMatch(chat.title, q)}
                        linkTitle={chat.title}
                        isActive={isActiveChat}
                        collapsed={sidebarCollapsed}
                        to={standaloneChatPath}
                        navState={{ conversationId: chat.id }}
                        navClassName={`sidebar-topic-item sidebar-chat-item ${isActiveChat ? 'active' : ''}`}
                        onRequestDelete={setDeleteChatConfirm}
                      />
                    );
                  }
                  if (row.kind === 'agent') {
                    const aid = chat.gensparkAgentId as string;
                    const isActiveChat =
                      pathname === AGENTS_PATH &&
                      agentsSidebarQueryId === aid &&
                      currentConversationId === chat.id;
                    return (
                      <SidebarConversationRow
                        key={chat.id}
                        chat={chat}
                        displayTitle={highlightMatch(chat.title, q)}
                        linkTitle={chat.title}
                        isActive={isActiveChat}
                        collapsed={sidebarCollapsed}
                        to={`${AGENTS_PATH}?${AGENTS_QUERY_PARAM_ID}=${encodeURIComponent(aid)}`}
                        navState={{ conversationId: chat.id }}
                        navClassName={`sidebar-topic-item sidebar-chat-item ${isActiveChat ? 'active' : ''}`}
                        onRequestDelete={setDeleteChatConfirm}
                      />
                    );
                  }
                  const { pid, label } = row;
                  const isActiveChat =
                    pathname.startsWith('/projects/') &&
                    pathname === `/projects/${chat.projectId}` &&
                    currentConversationId === chat.id;
                  const shortLabel = label.length > 10 ? `${label.slice(0, 10)}…` : label;
                  return (
                    <SidebarConversationRow
                      key={chat.id}
                      chat={chat}
                      displayTitle={
                        sidebarCollapsed ? chat.title : `${shortLabel} · ${chat.title}`
                      }
                      linkTitle={`${label} — ${chat.title}`}
                      isActive={isActiveChat}
                      collapsed={sidebarCollapsed}
                      to={`/projects/${pid}`}
                      navState={{ conversationId: chat.id }}
                      navClassName={`sidebar-topic-item sidebar-chat-item sidebar-chat-item--under-project ${isActiveChat ? 'active' : ''}`}
                      titlePrefix={
                        !sidebarCollapsed ? (
                          <IconFolder size={12} aria-hidden className="sidebar-chat-row-folder-icon" />
                        ) : undefined
                      }
                      onRequestDelete={setDeleteChatConfirm}
                    />
                  );
                };

                // 검색 중에는 그룹 없이 평면 목록으로 표시
                if (q) {
                  return <>{countLabel}{rows.map(renderRow)}</>;
                }

                // 핀 고정 대화 분리
                const pinnedRows = rows.filter((r) => r.chat.pinned);
                const unpinnedRows = rows.filter((r) => !r.chat.pinned);

                // 일반 대화는 날짜 그룹별로 묶어서 헤더와 함께 렌더링
                const grouped = new Map<string, SidebarChatRow[]>();
                for (const g of DATE_GROUP_ORDER) grouped.set(g, []);
                for (const row of unpinnedRows) {
                  const g = getSidebarDateGroup(row.chat.updatedAt);
                  grouped.get(g)!.push(row);
                }

                const DATE_GROUP_ICONS: Record<string, string> = { '오늘': '🌅', '어제': '🕐', '이번 주': '📅', '이전': '📂' };

                const pinnedGroupId = '__pinned__';
                return [
                  // 핀 고정 섹션
                  ...(pinnedRows.length > 0
                    ? [
                        <button
                          key="hdr-pinned"
                          type="button"
                          className="sidebar-date-group-header sidebar-date-group-header--with-count sidebar-date-group-header--btn"
                          onClick={() => toggleGroupCollapse(pinnedGroupId)}
                          aria-expanded={!collapsedGroups.has(pinnedGroupId)}
                          aria-label={`고정됨 그룹 ${collapsedGroups.has(pinnedGroupId) ? '펼치기' : '접기'}`}
                        >
                          <span>📌 고정됨</span>
                          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span className="sidebar-date-group-count">{pinnedRows.length}</span>
                            <span className="sidebar-date-group-chevron" aria-hidden>{collapsedGroups.has(pinnedGroupId) ? '▶' : '▾'}</span>
                          </span>
                        </button>,
                        ...(!collapsedGroups.has(pinnedGroupId) ? pinnedRows.map(renderRow) : []),
                      ]
                    : []),
                  // 날짜별 섹션
                  ...DATE_GROUP_ORDER.flatMap((groupName) => {
                    const groupRows = grouped.get(groupName)!;
                    if (groupRows.length === 0) return [];
                    const isCollapsed = collapsedGroups.has(groupName);
                    return [
                      <button
                        key={`hdr-${groupName}`}
                        type="button"
                        className="sidebar-date-group-header sidebar-date-group-header--with-count sidebar-date-group-header--btn"
                        onClick={() => toggleGroupCollapse(groupName)}
                        aria-expanded={!isCollapsed}
                        aria-label={`${groupName} 그룹 ${isCollapsed ? '펼치기' : '접기'}`}
                      >
                        <span>{DATE_GROUP_ICONS[groupName]} {groupName}</span>
                        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span className="sidebar-date-group-count">{groupRows.length}</span>
                          <span className="sidebar-date-group-chevron" aria-hidden>{isCollapsed ? '▶' : '▾'}</span>
                        </span>
                      </button>,
                      ...(!isCollapsed ? groupRows.map(renderRow) : []),
                    ];
                  }),
                ];
              })()}
            </div>
          </nav>
          {isUiProjectsEnabled() && (
          <>
          <div style={{ height: sidebarCollapsed ? 6 : 12 }} aria-hidden="true" />
          <div className="sidebar-project-section" aria-label="프로젝트">
            {!sidebarCollapsed && <h3 className="sidebar-project-section-title">프로젝트</h3>}
            <div className="sidebar-project-preview-list" role="list">
              <NavLink to="/projects" className="sidebar-project-create-row" aria-label="새 프로젝트" title="새 프로젝트">
                <span className="sidebar-icon-folder-plus" aria-hidden>
                  <IconFolder size={16} className="sidebar-project-icon" />
                  <IconPlus size={10} className="sidebar-project-plus" />
                </span>
                {!sidebarCollapsed && <span>새 프로젝트</span>}
              </NavLink>
              {(() => {
                const q = coerceTrimmedString(menuSearch, '').toLowerCase();
                const filtered = q
                  ? sidebarProjects.filter((p) => p.name.toLowerCase().includes(q))
                  : sidebarProjects;
                const maxVisible = 8;
                const visible = filtered.slice(0, maxVisible);
                const hasMore = filtered.length > maxVisible;
                if (visible.length === 0) {
                  const isEmpty = sidebarProjects.length === 0;
                  return (
                    <>
                      <p
                        className="sidebar-project-empty"
                        {...(q && !isEmpty ? { role: 'status' as const, 'aria-live': 'polite' as const } : {})}
                      >
                        {isEmpty ? '생성된 프로젝트가 없습니다' : '검색 결과 없음'}
                      </p>
                      {!isEmpty && !q && (
                        <NavLink to="/projects" className="sidebar-more-link">
                          {!sidebarCollapsed && '더 보기'}
                        </NavLink>
                      )}
                    </>
                  );
                }
                return (
                  <>
                    {visible.map((p) => (
                      <NavLink
                        key={p.id}
                        to={`/projects/${p.id}`}
                        className={({ isActive }) => `sidebar-project-preview-item ${isActive ? 'active' : ''}`}
                        role="listitem"
                        title={p.name}
                      >
                        <IconFolder size={18} aria-hidden className="sidebar-project-icon" />
                        {!sidebarCollapsed && <span className="sidebar-project-name">{p.name.length > 28 ? `${p.name.slice(0, 28)}...` : p.name}</span>}
                      </NavLink>
                    ))}
                    {hasMore && (
                      <NavLink to="/projects" className="sidebar-more-link" aria-label="프로젝트 더 보기">
                        {!sidebarCollapsed && '··· 더 보기'}
                      </NavLink>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
          </>
          )}
          {/* 도구: 목소리 생성 (Figma 볼륨 아이콘) */}
          <div className="sidebar-tools-section">
            {!sidebarCollapsed && <h3 className="sidebar-project-section-title">도구</h3>}
            <NavLink
              to={AGENTS_PATH}
              className={({ isActive }) => `sidebar-tool-item ${isActive ? 'active' : ''}`}
              end
              aria-label="에이전트"
              title="AI 에이전트 허브"
            >
              <IconMessage size={18} aria-hidden className="sidebar-icon-agent" />
              {!sidebarCollapsed && <span>에이전트</span>}
            </NavLink>
            <NavLink to={VOICE_GENERATION_PATH} className={({ isActive }) => `sidebar-tool-item ${isActive ? 'active' : ''}`} end aria-label="목소리 생성" title="목소리 생성">
              <IconVolume size={18} aria-hidden className="sidebar-icon-voice" />
              {!sidebarCollapsed && <span>목소리 생성</span>}
            </NavLink>
            <NavLink to={DASHBOARD_PATH} className={({ isActive }) => `sidebar-tool-item ${isActive ? 'active' : ''}`} end aria-label="시스템 대시보드" title="시스템 대시보드">
              <IconDashboard size={18} aria-hidden className="sidebar-icon-dashboard" />
              {!sidebarCollapsed && <span>대시보드</span>}
            </NavLink>
          </div>
        </div>
        <div className="sidebar-footer sidebar-chatgpt-footer">
          <div className="sidebar-chatgpt-footer-inner">
            <div className="theme-toggle">
              <button type="button" className={!isDarkMode ? 'active' : ''} onClick={() => setMode('light')} aria-label="라이트 모드">
                <IconSun size={14} />
                Light
              </button>
              <button type="button" className={isDarkMode ? 'active' : ''} onClick={() => setMode('dark')} aria-label="다크 모드">
                <IconMoon size={14} />
                Dark
              </button>
              {/* 대화 전체 내보내기 */}
              <button
                type="button"
                className="sidebar-export-btn"
                title="대화 전체 내보내기 (JSON)"
                aria-label="대화 전체 내보내기 (JSON)"
                onClick={() => {
                  try {
                    const key = 'chatgpt_conversations';
                    const data = localStorage.getItem(key) ?? '[]';
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `corbu-conversations-${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  } catch { /* ignore */ }
                }}
              >
                <span aria-hidden>⬇</span>
                {!sidebarCollapsed && <span>내보내기</span>}
              </button>
              {/* 대화 JSON 가져오기 */}
              <label
                className="sidebar-export-btn sidebar-import-btn"
                title="JSON 파일에서 대화 가져오기"
                aria-label="대화 가져오기 (JSON)"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') (e.currentTarget.querySelector('input') as HTMLInputElement)?.click(); }}
              >
                <span aria-hidden>⬆</span>
                {!sidebarCollapsed && <span>가져오기</span>}
                <input
                  type="file"
                  accept=".json"
                  className="sr-only"
                  aria-hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      try {
                        const imported: unknown[] = JSON.parse(ev.target?.result as string);
                        if (!Array.isArray(imported)) { alert('올바른 대화 JSON 파일이 아닙니다.'); return; }
                        const CONV_KEY = 'chatgpt_conversations';
                        const existing: { id?: string }[] = JSON.parse(localStorage.getItem(CONV_KEY) ?? '[]');
                        const existingIds = new Set(existing.map((c) => c.id));
                        const newOnes = (imported as { id?: string }[]).filter((c) => !existingIds.has(c.id));
                        const merged = [...newOnes, ...existing];
                        localStorage.setItem(CONV_KEY, JSON.stringify(merged));
                        setSidebarChats(loadSidebarChats());
                        alert(`${newOnes.length}개의 대화를 가져왔습니다.`);
                      } catch { alert('파일을 읽는 중 오류가 발생했습니다.'); }
                    };
                    reader.readAsText(file);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
            <div className="sidebar-footer-right">
              {/* 커뮤니티 배지 */}
              {(navBadges['/community'] ?? 0) > 0 && (
                <NavLink
                  to={COMMUNITY_PATH}
                  className="sidebar-badge-btn"
                  title={`커뮤니티 새 글 ${navBadges['/community']}개`}
                  aria-label={`커뮤니티 새 게시글 ${navBadges['/community']}개`}
                  onClick={() => {
                    try { localStorage.setItem('corbu.community.lastVisit', String(Date.now())); } catch { /* ignore */ }
                    setNavBadges((prev) => ({ ...prev, '/community': 0 }));
                  }}
                >
                  <span aria-hidden>💬</span>
                  <span className="sidebar-badge-dot" aria-hidden>{navBadges['/community']}</span>
                </NavLink>
              )}
              {/* 자동화 실패 배지 */}
              {(navBadges['/automation'] ?? 0) > 0 && (
                <NavLink
                  to="/automation"
                  className="sidebar-badge-btn sidebar-badge-btn--warn"
                  title={`자동화 실패 ${navBadges['/automation']}건`}
                  aria-label={`자동화 실패 ${navBadges['/automation']}건`}
                >
                  <span aria-hidden>⚡</span>
                  <span className="sidebar-badge-dot sidebar-badge-dot--warn" aria-hidden>{navBadges['/automation']}</span>
                </NavLink>
              )}
              {/* 사용자 아바타 + 이름 */}
              {!sidebarCollapsed && (() => {
                try {
                  const prof = JSON.parse(localStorage.getItem('corbu.settings.profile') || '{}');
                  const emoji = prof.avatarEmoji || '🧑';
                  const name = prof.name ? prof.name.slice(0, 6) : null;
                  return (
                    <button
                      type="button"
                      className="sidebar-user-avatar-btn"
                      title={prof.name ? `${prof.name} — 프로필 설정` : '프로필 설정 (설정 > 프로필)'}
                      onClick={() => { window.location.hash = ''; window.location.pathname !== '/settings' && (window.location.href = '/settings'); }}
                      aria-label={prof.name ?? '프로필'}
                    >
                      <span className="sidebar-user-emoji" aria-hidden>{emoji}</span>
                      {name && <span className="sidebar-user-name">{name}</span>}
                    </button>
                  );
                } catch { return null; }
              })()}
              {/* 테마 빠른 토글 */}
              <button
                type="button"
                className="sidebar-shortcuts-btn sidebar-theme-quick-btn"
                aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
                title={isDarkMode ? '라이트 모드 (Ctrl+Shift+L)' : '다크 모드 (Ctrl+Shift+L)'}
                onClick={() => setMode(isDarkMode ? 'light' : 'dark')}
              >
                <span aria-hidden>{isDarkMode ? '☀️' : '🌙'}</span>
              </button>
              {/* 알림 센터 */}
              <NotificationCenter />
              {/* ⌘K 커맨드 팔레트 힌트 버튼 */}
              <button
                type="button"
                className="sidebar-shortcuts-btn sidebar-cmd-palette-btn"
                aria-label="커맨드 팔레트 열기"
                title="커맨드 팔레트 (Ctrl+K)"
                onClick={() => setCmdPaletteOpen(true)}
              >
                <span aria-hidden>⌘</span>
                {!sidebarCollapsed && <span className="sidebar-shortcuts-label">⌘K</span>}
              </button>
              <button
                type="button"
                className="sidebar-shortcuts-btn"
                aria-label="키보드 단축키 도움말"
                title="키보드 단축키 (Ctrl+/)"
                onClick={() => setShortcutsOpen(true)}
              >
                <span aria-hidden>⌨️</span>
                {!sidebarCollapsed && <span className="sidebar-shortcuts-label">단축키</span>}
              </button>
              <NavLink
                to={BILLING_PATH}
                className={({ isActive }) => `sidebar-pro-link${isActive ? ' sidebar-pro-link--active' : ''}`}
                end
                aria-label="구독·PRO"
                title="구독·플랜·PRO 안내"
                data-testid={TEST_IDS.SIDEBAR_PRO_NAV_LINK}
              >
                <span className="sidebar-pro-badge">PRO</span>
              </NavLink>
            </div>
          </div>
        </div>
      </aside>
      <main id="main-content" className={`brainwave-main${focusMode ? ' brainwave-main--focus' : ''}`} tabIndex={-1} role="main">
        <WhatsNewBanner />
        {focusMode && (
          <div className="focus-mode-bar" role="status" aria-live="polite">
            <span>🎯 포커스 모드 활성 — 사이드바 숨김</span>
            <button
              type="button"
              className="focus-mode-exit"
              onClick={() => setFocusMode(false)}
              aria-label="포커스 모드 종료"
            >
              ✕ 나가기 <kbd>Ctrl+Shift+F</kbd>
            </button>
          </div>
        )}
        <div className="breadcrumb-history-row">
          <Breadcrumb pathname={pathname} />
          <RecentPagesDropdown />
        </div>
        <NavFavoritesBar pathname={pathname} />
        {isMobile && (
          <header className="brainwave-mobile-header">
            <button
              type="button"
              className="brainwave-mobile-menu-btn"
              onClick={() => setSidebarMobileOpen(true)}
              aria-label="메뉴 열기"
              aria-expanded={sidebarMobileOpen}
            >
              <IconMenu size={20} />
            </button>
            <span className="brainwave-mobile-title" data-testid="brainwave-mobile-title">
              {shouldUseNotFoundDocumentTitle(pathname) ? NOT_FOUND_PAGE_HEADING : getPageTitle(pathname)}
            </span>
          </header>
        )}
        <ErrorBoundary
          fallback={
            <div className="brainwave-error-fallback">
              <h2>문제가 발생했습니다</h2>
              <p>페이지를 새로고침하거나 홈으로 이동해 주세요.</p>
              <div className="brainwave-error-fallback-actions">
                <button type="button" onClick={() => window.location.reload()} className="brainwave-retry-btn">새로고침</button>
                <NavLink to={appEntryPath} className="brainwave-error-home-link" aria-label="홈으로 돌아가기">홈으로</NavLink>
              </div>
            </div>
          }
        >
          <Suspense fallback={<Fallback />}>
            <div key={pathname} className="brainwave-route-content">
              <Outlet />
            </div>
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
    <CommandPalette open={cmdPaletteOpen} onClose={() => setCmdPaletteOpen(false)} />
    {showOnboarding && <OnboardingTour onClose={() => setShowOnboarding(false)} />}
    </>
  );
}

function NotFoundPage() {
  const navigate = useNavigate();
  const homePath = getAppEntryPath();
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate(homePath, { replace: true });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate, homePath]);
  return (
    <div className="brainwave-error-fallback brainwave-404">
      <h2 className="brainwave-404-title">{NOT_FOUND_PAGE_HEADING}</h2>
      <p className="brainwave-404-desc">요청한 경로가 존재하지 않습니다.</p>
      <div className="brainwave-404-actions">
        <button type="button" onClick={() => navigate(-1)} aria-label="이전 페이지로 이동" className="brainwave-404-btn-secondary">
          이전 페이지
        </button>
        <NavLink to={homePath} aria-label="홈으로 돌아가기" className="brainwave-404-btn-primary">
          홈으로 돌아가기
        </NavLink>
      </div>
      <p className="brainwave-404-hint">Esc 키를 누르면 홈으로 이동합니다.</p>
    </div>
  );
}

/** 라우트 트리만 노출 (테스트에서 MemoryRouter 등으로 감쌀 때 사용) */
export function AppUnifiedRoutes() {
  return (
    <Routes>
      <Route
        path={GOOGLE_DRIVE_OAUTH_CALLBACK_PATH}
        element={
          <Suspense fallback={<Fallback />}>
            <GoogleDriveOAuthCallbackView />
          </Suspense>
        }
      />
      <Route path="/" element={<Layout />}>
        <Route path="chat" element={<GeneralChatRouteView />} />
        <Route
          index
          element={
            isGensparkPrimaryExperience() ? (
              <GensparkMarketingHomeRouteView />
            ) : (
              <GeneralChatRouteView />
            )
          }
        />
        {isUiProjectsEnabled() ? (
          <>
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:id" element={<ProjectChatView />} />
          </>
        ) : (
          <>
            <Route path="projects" element={<Navigate to={AGENTS_PATH} replace />} />
            <Route path="projects/:id" element={<Navigate to={getStandaloneChatPath()} replace />} />
          </>
        )}
        <Route path={AGENTS_PATH.slice(1)} element={<GensparkAgentRouteView />} />
        <Route
          path={VOICE_GENERATION_PATH.slice(1)}
          element={
            <ToolPageShell path={VOICE_GENERATION_PATH}>
              <VoiceGenerationView />
            </ToolPageShell>
          }
        />
        <Route
          path={SETTINGS_PATH.slice(1)}
          element={
            <ToolPageShell path={SETTINGS_PATH}>
              <SettingsView />
            </ToolPageShell>
          }
        />
        <Route
          path={ANALYTICS_PATH.slice(1)}
          element={
            <ToolPageShell path={ANALYTICS_PATH}>
              <AnalyticsView />
            </ToolPageShell>
          }
        />
        <Route
          path={DOCS_PATH.slice(1)}
          element={
            <ToolPageShell path={DOCS_PATH}>
              <DocsView />
            </ToolPageShell>
          }
        />
        <Route
          path={TEMPLATES_PATH.slice(1)}
          element={
            <ToolPageShell path={TEMPLATES_PATH}>
              <TemplatesView />
            </ToolPageShell>
          }
        />
        <Route
          path={SEARCH_PATH.slice(1)}
          element={
            <ToolPageShell path={SEARCH_PATH}>
              <SearchView />
            </ToolPageShell>
          }
        />
        <Route
          path={INTEGRATIONS_PATH.slice(1)}
          element={
            <ToolPageShell path={INTEGRATIONS_PATH}>
              <IntegrationsView />
            </ToolPageShell>
          }
        />
        <Route
          path={TEAM_PATH.slice(1)}
          element={
            <ToolPageShell path={TEAM_PATH}>
              <TeamView />
            </ToolPageShell>
          }
        />
        <Route
          path={LEARN_PATH.slice(1)}
          element={
            <ToolPageShell path={LEARN_PATH}>
              <LearnView />
            </ToolPageShell>
          }
        />
        <Route
          path={BILLING_PATH.slice(1)}
          element={
            <ToolPageShell path={BILLING_PATH}>
              <BillingView />
            </ToolPageShell>
          }
        />
        <Route
          path={WORKSPACE_PATH.slice(1)}
          element={
            <ToolPageShell path={WORKSPACE_PATH}>
              <WorkspaceView />
            </ToolPageShell>
          }
        />
        <Route
          path={AUTOMATION_PATH.slice(1)}
          element={
            <ToolPageShell path={AUTOMATION_PATH}>
              <AutomationView />
            </ToolPageShell>
          }
        />
        <Route
          path={COMMUNITY_PATH.slice(1)}
          element={
            <ToolPageShell path={COMMUNITY_PATH}>
              <CommunityView />
            </ToolPageShell>
          }
        />
        <Route
          path={PIPELINE_TUNING_PATH.slice(1)}
          element={
            <Suspense fallback={<Fallback />}>
              <ToolPageShell path={PIPELINE_TUNING_PATH}>
                <PipelineTuningView />
              </ToolPageShell>
            </Suspense>
          }
        />
        <Route
          path={CONVERSATION_GRAPH_PATH.slice(1)}
          element={
            <Suspense fallback={<Fallback />}>
              <ToolPageShell path={CONVERSATION_GRAPH_PATH}>
                <ConversationGraphView />
              </ToolPageShell>
            </Suspense>
          }
        />
        <Route
          path={BACKUP_PATH.slice(1)}
          element={
            <Suspense fallback={<Fallback />}>
              <ToolPageShell path={BACKUP_PATH}>
                <BackupRecoveryView />
              </ToolPageShell>
            </Suspense>
          }
        />
        <Route
          path={DEV_STATUS_PATH.slice(1)}
          element={
            <Suspense fallback={<Fallback />}>
              <ToolPageShell path={DEV_STATUS_PATH}>
                <DevStatusView />
              </ToolPageShell>
            </Suspense>
          }
        />
        {/* 구버전 경로 → 독립 대화 경로로 리다이렉트 (북마크 호환) */}
        <Route path="simple" element={<Navigate to={getStandaloneChatPath()} replace />} />
        <Route path="features" element={<Navigate to={getStandaloneChatPath()} replace />} />
        <Route path="features-map" element={<Navigate to={getStandaloneChatPath()} replace />} />
        <Route
          path="notebook"
          element={<Navigate to={isUiProjectsEnabled() ? '/projects' : getStandaloneChatPath()} replace />}
        />
        <Route
          path="file-analysis"
          element={<Navigate to={isUiProjectsEnabled() ? '/projects' : getStandaloneChatPath()} replace />}
        />
        <Route path="documents" element={<Navigate to={getStandaloneChatPath()} replace />} />
        <Route
          path="ultimate"
          element={
            <Suspense fallback={<Fallback />}>
              <ToolPageShell path="/ultimate">
                <UltimateChatGPTInterface />
              </ToolPageShell>
            </Suspense>
          }
        />
        <Route
          path="integrated"
          element={
            <Suspense fallback={<Fallback />}>
              <ToolPageShell path="/integrated">
                <IntegratedMasterInterface />
              </ToolPageShell>
            </Suspense>
          }
        />
        <Route
          path="dashboard"
          element={
            <Suspense fallback={<Fallback />}>
              <ToolPageShell path={DASHBOARD_PATH}>
                <IntegratedDashboard />
              </ToolPageShell>
            </Suspense>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default function AppUnified() {
  return (
    <BrowserRouter>
      <AppUnifiedRoutes />
    </BrowserRouter>
  );
}
