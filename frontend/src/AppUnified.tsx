/**
 * 통합 앱: 2단 레이아웃 (사이드바 + 메인)
 * 젠스파이크 우선(기본): 루트(/)→에이전트 허브, 독립 대화는 `/chat`. 레거시는 `/`가 대화.
 * (선택)프로젝트 — `REACT_APP_UI_PROJECTS_ENABLED=true` 일 때만 /projects 노출.
 */
import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Outlet, useLocation, useNavigate, useParams, Navigate, useSearchParams } from 'react-router-dom';
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
  DEV_STATUS_PATH,
} from './config/routes';
import { IconLogo, IconSun, IconMoon, IconMenu, IconX, IconSearch, IconFolder, IconMoreVertical, IconVolume, IconMessage, IconChevronLeft, IconChevronRight, IconPlus, IconEdit, IconTrash } from './components/Icons/BrainwaveIcons';
import './App.css';
import './styles/theme.css';
import './styles/brainwave-global.css';
import './styles/responsive.css';
import './components/NotebookLLM.css';
import LoadingSkeleton from './components/LoadingSkeleton';
import ErrorBoundary from './components/ErrorBoundary';
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
const PipelineTuningView = lazy(() => import('./views/PipelineTuningView'));
const GensparkAgentsHubView = lazy(() => import('./views/GensparkAgentsHubView'));
const UltimateChatGPTInterface = lazy(() => import('./components/UltimateChatGPTInterface'));
const IntegratedMasterInterface = lazy(() => import('./components/IntegratedMasterInterface'));

/** 독립 일반 대화 — `/` 또는 젠스파이크 우선 시 `/chat`; 목록·상세와 동일 상단 크롬 폭 */
function GeneralChatRouteView() {
  return (
    <div className="brainwave-chat-route-shell brainwave-chat-route-shell--general">
      <div className="bw-page-root bw-page-root--route-chrome">
        <h1 className="sr-only">일반 대화</h1>
        <nav className="brainwave-chat-route-breadcrumb brainwave-chat-route-breadcrumb--page-aligned" aria-label="현재 위치">
          <span className="brainwave-chat-route-breadcrumb__leaf" aria-current="page">
            일반 대화
          </span>
          <span className="brainwave-chat-route-breadcrumb__sep" aria-hidden>
            /
          </span>
          <span className="brainwave-chat-route-breadcrumb__leaf">채팅</span>
          <span className="brainwave-chat-route-breadcrumb__hint">
            {isUiProjectsEnabled()
              ? '프로젝트와 분리된 독립 대화입니다. 프로젝트 맥락이 필요하면 사이드바에서 프로젝트를 연 뒤 이용하세요.'
              : '젠스파이크형 파이프라인·딥시크 검수 힌트가 기본 적용됩니다. 에이전트 허브에서 세션을 열 수 있습니다.'}
          </span>
        </nav>
      </div>
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
    <div className="brainwave-chat-route-shell brainwave-chat-route-shell--project">
      <div className="bw-page-root bw-page-root--route-chrome">
        <h1 className="sr-only">
          {projectLabel ? `${projectLabel} · 대화` : '프로젝트 · 대화'}
        </h1>
        <nav
          className="brainwave-chat-route-breadcrumb brainwave-chat-route-breadcrumb--page-aligned"
          aria-label="현재 위치"
        >
          <NavLink to={getStandaloneChatPath()} className="brainwave-chat-route-breadcrumb__link">
            일반 대화
          </NavLink>
          <span className="brainwave-chat-route-breadcrumb__sep" aria-hidden>
            /
          </span>
          <NavLink to="/projects" className="brainwave-chat-route-breadcrumb__link">
            프로젝트
          </NavLink>
          <span className="brainwave-chat-route-breadcrumb__sep" aria-hidden>
            /
          </span>
          {id ? (
            <NavLink to={`/projects/${id}`} className="brainwave-chat-route-breadcrumb__link">
              {projectLabel || '…'}
            </NavLink>
          ) : (
            <span className="brainwave-chat-route-breadcrumb__leaf">…</span>
          )}
          <span className="brainwave-chat-route-breadcrumb__sep" aria-hidden>
            /
          </span>
          <span className="brainwave-chat-route-breadcrumb__leaf">대화</span>
          <span className="brainwave-chat-route-breadcrumb__hint">
            이 화면의 대화·소스·노트북은 위 프로젝트에만 귀속됩니다.
          </span>
        </nav>
      </div>
      <div className="brainwave-chat-route-body">
        <Suspense fallback={<Fallback />}>
          <ChatGPTInterface initialProjectId={id ?? undefined} />
        </Suspense>
      </div>
    </div>
  );
}

/** Genspark식 `/agents?id=<uuid>` · `/agents?type=super_agent` — 에이전트 없으면 허브 */
function GensparkAgentRouteView() {
  const [searchParams] = useSearchParams();
  const agentId = resolveAgentIdFromGensparkAgentsQuery(searchParams);
  if (!agentId) {
    return (
      <div className="brainwave-chat-route-shell brainwave-chat-route-shell--agents">
        <div className="bw-page-root bw-page-root--route-chrome">
          <h1 className="sr-only">에이전트</h1>
          <nav className="brainwave-chat-route-breadcrumb brainwave-chat-route-breadcrumb--page-aligned" aria-label="현재 위치">
            <NavLink to={getStandaloneChatPath()} className="brainwave-chat-route-breadcrumb__link">
              일반 대화
            </NavLink>
            <span className="brainwave-chat-route-breadcrumb__sep" aria-hidden>
              /
            </span>
            <span className="brainwave-chat-route-breadcrumb__leaf">에이전트</span>
            <span className="brainwave-chat-route-breadcrumb__hint">에이전트를 선택하면 해당 에이전트와의 대화 화면으로 이동합니다.</span>
          </nav>
        </div>
        <div className="brainwave-chat-route-body">
          <Suspense fallback={<Fallback />}>
            <GensparkAgentsHubView />
          </Suspense>
        </div>
      </div>
    );
  }
  return (
    <div className="brainwave-chat-route-shell brainwave-chat-route-shell--agents">
      <div className="bw-page-root bw-page-root--route-chrome">
        <h1 className="sr-only">에이전트</h1>
        <nav className="brainwave-chat-route-breadcrumb brainwave-chat-route-breadcrumb--page-aligned" aria-label="현재 위치">
          <NavLink to={getStandaloneChatPath()} className="brainwave-chat-route-breadcrumb__link">
            일반 대화
          </NavLink>
          <span className="brainwave-chat-route-breadcrumb__sep" aria-hidden>
            /
          </span>
          <NavLink to={AGENTS_PATH} className="brainwave-chat-route-breadcrumb__link">
            에이전트
          </NavLink>
          <span className="brainwave-chat-route-breadcrumb__sep" aria-hidden>
            /
          </span>
          <span className="brainwave-chat-route-breadcrumb__leaf">대화</span>
          <span className="brainwave-chat-route-breadcrumb__hint">선택한 에이전트와의 대화입니다.</span>
        </nav>
      </div>
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

/** 설정·분석·도움말 등 — 홈·프로젝트와 동일 상단 크롬 */
function ToolPageShell({ path, children }: { path: string; children: React.ReactNode }) {
  const { title, hint } = getToolPageMeta(path);
  return (
    <div className="brainwave-chat-route-shell brainwave-chat-route-shell--tool">
      <div className="bw-page-root bw-page-root--route-chrome">
        <h1 className="sr-only">{title}</h1>
        <nav className="brainwave-chat-route-breadcrumb brainwave-chat-route-breadcrumb--page-aligned" aria-label="현재 위치">
          <NavLink to={getStandaloneChatPath()} className="brainwave-chat-route-breadcrumb__link">
            일반 대화
          </NavLink>
          <span className="brainwave-chat-route-breadcrumb__sep" aria-hidden>
            /
          </span>
          <span className="brainwave-chat-route-breadcrumb__leaf">{title}</span>
          {hint ? <span className="brainwave-chat-route-breadcrumb__hint">{hint}</span> : null}
        </nav>
      </div>
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

type SidebarChatItem = { id: string; title: string; updatedAt: string; projectId?: string; gensparkAgentId?: string };

function SidebarConversationRow(props: {
  chat: SidebarChatItem;
  displayTitle: string;
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
  const shortTitle = displayTitle.length > 28 ? `${displayTitle.slice(0, 28)}...` : displayTitle;
  return (
    <div
      className={`sidebar-chat-item-row${isActive ? ' sidebar-chat-item-row--active' : ''}`}
      role="listitem"
    >
      <NavLink to={to} state={navState} className={navClassName} title={linkTitle}>
        {!collapsed && (
          <span className="sidebar-chat-title">
            {titlePrefix}
            {shortTitle}
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
        };
      })
      .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  } catch {
    return [];
  }
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
  const [brandMoreOpen, setBrandMoreOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');
  const [sidebarProjects, setSidebarProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [sidebarChats, setSidebarChats] = useState<SidebarChatItem[]>(() => loadSidebarChats());
  const [deleteChatConfirm, setDeleteChatConfirm] = useState<SidebarChatItem | null>(null);
  const brandMoreRef = useRef<HTMLDivElement>(null);
  const brandMoreBtnRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sidebarDeleteCancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // 라우트 변경 시 main에 포커스, 모바일·더보기 메뉴 닫기
  useEffect(() => {
    const main = document.getElementById('main-content');
    if (main) main.focus({ preventScroll: true });
    setSidebarMobileOpen(false);
    setBrandMoreOpen(false);
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
      {deleteChatConfirm && (
        <dialog
          className="modal-overlay"
          open
          aria-modal="true"
          aria-label="대화 삭제 확인 모달"
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
        className={`sidebar brainwave-sidebar-dark ${sidebarCollapsed ? 'sidebar--collapsed' : ''} ${isMobile && sidebarMobileOpen ? 'mobile-open' : ''}`}
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
          {/* 대화 기록: 프로젝트 목록과 동일한 상단 슬롯(젠스파이크형 기본에서도 맨 위) */}
          <nav className="sidebar-nav sidebar-chatgpt-nav" aria-label="대화 기록">
            {!sidebarCollapsed && <h3 className="sidebar-project-section-title">대화</h3>}
            <div className="sidebar-topic-list sidebar-chat-list" role="list">
              {(() => {
                const q = coerceTrimmedString(menuSearch, '').toLowerCase();
                const filtered = q
                  ? sidebarChats.filter((c) => (c.title || '').toLowerCase().includes(q))
                  : sidebarChats;

                const uiProjects = isUiProjectsEnabled();
                const generalChats = filtered.filter(
                  (c) => !c.gensparkAgentId && (!c.projectId || !uiProjects)
                );
                const agentChats = filtered.filter((c) => !c.projectId && c.gensparkAgentId);
                const projectChats = filtered.filter((c) => c.projectId && uiProjects);

                if (filtered.length === 0) {
                  const isEmpty = sidebarChats.length === 0;
                  return (
                    <p
                      className="sidebar-topic-empty"
                      {...(q && !isEmpty ? { role: 'status' as const, 'aria-live': 'polite' as const } : {})}
                    >
                      {isEmpty ? '아직 생성된 대화가 없습니다' : '검색 결과 없음'}
                    </p>
                  );
                }

                return (
                  <>
                    {generalChats.length > 0 && (
                      <>
                        {!sidebarCollapsed && (
                          <div
                            className="sidebar-chat-section-header"
                            style={{
                              padding: '8px 12px',
                              fontSize: '11px',
                              fontWeight: 600,
                              color: 'var(--sidebar-dark-text-muted)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                            }}
                          >
                            {uiProjects ? '일반 (프로젝트 밖)' : '홈 대화'}
                          </div>
                        )}
                        {generalChats.map((chat) => {
                          const isActiveChat = isStandaloneChatPath(pathname) && currentConversationId === chat.id;
                          return (
                            <SidebarConversationRow
                              key={chat.id}
                              chat={chat}
                              displayTitle={chat.title}
                              linkTitle={chat.title}
                              isActive={isActiveChat}
                              collapsed={sidebarCollapsed}
                              to={standaloneChatPath}
                              navState={{ conversationId: chat.id }}
                              navClassName={`sidebar-topic-item sidebar-chat-item ${isActiveChat ? 'active' : ''}`}
                              onRequestDelete={setDeleteChatConfirm}
                            />
                          );
                        })}
                      </>
                    )}

                    {agentChats.length > 0 && (
                      <>
                        {!sidebarCollapsed && generalChats.length > 0 && (
                          <div style={{ height: '8px' }} aria-hidden="true" />
                        )}
                        {!sidebarCollapsed && (
                          <div
                            className="sidebar-chat-section-header"
                            style={{
                              padding: '8px 12px',
                              fontSize: '11px',
                              fontWeight: 600,
                              color: 'var(--sidebar-dark-text-muted)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                            }}
                          >
                            에이전트 대화
                          </div>
                        )}
                        {agentChats.map((chat) => {
                          const aid = chat.gensparkAgentId as string;
                          const isActiveChat =
                            pathname === AGENTS_PATH &&
                            agentsSidebarQueryId === aid &&
                            currentConversationId === chat.id;
                          return (
                            <SidebarConversationRow
                              key={chat.id}
                              chat={chat}
                              displayTitle={chat.title}
                              linkTitle={chat.title}
                              isActive={isActiveChat}
                              collapsed={sidebarCollapsed}
                              to={`${AGENTS_PATH}?${AGENTS_QUERY_PARAM_ID}=${encodeURIComponent(aid)}`}
                              navState={{ conversationId: chat.id }}
                              navClassName={`sidebar-topic-item sidebar-chat-item ${isActiveChat ? 'active' : ''}`}
                              titlePrefix={
                                <span style={{ fontSize: '10px', opacity: 0.6, marginRight: '4px' }} aria-hidden>
                                  ✨
                                </span>
                              }
                              onRequestDelete={setDeleteChatConfirm}
                            />
                          );
                        })}
                      </>
                    )}

                    {projectChats.length > 0 && (
                      <>
                        {!sidebarCollapsed && (generalChats.length > 0 || agentChats.length > 0) && (
                          <div style={{ height: '8px' }} aria-hidden="true" />
                        )}
                        {!sidebarCollapsed && (
                          <div
                            className="sidebar-chat-section-header"
                            style={{
                              padding: '8px 12px',
                              fontSize: '11px',
                              fontWeight: 600,
                              color: 'var(--sidebar-dark-text-muted)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                            }}
                          >
                            프로젝트 안의 대화
                          </div>
                        )}
                        {(() => {
                          const byPid = new Map<string, typeof projectChats>();
                          for (const c of projectChats) {
                            const pid = c.projectId as string;
                            if (!byPid.has(pid)) byPid.set(pid, []);
                            byPid.get(pid)!.push(c);
                          }
                          const order: string[] = [];
                          for (const p of sidebarProjects) {
                            if (byPid.has(p.id)) order.push(p.id);
                          }
                          for (const pid of byPid.keys()) {
                            if (!order.includes(pid)) order.push(pid);
                          }
                          return order.map((pid) => {
                            const chats = byPid.get(pid) ?? [];
                            const project = sidebarProjects.find((p) => p.id === pid);
                            const label =
                              project?.name ||
                              (pid.length > 10 ? `${pid.slice(0, 8)}…` : pid);
                            return (
                              <div key={pid} className="sidebar-chat-project-group" role="group" aria-label={`프로젝트 ${label} 대화`}>
                                {!sidebarCollapsed && (
                                  <div className="sidebar-chat-project-group__head">
                                    <NavLink
                                      to={`/projects/${pid}`}
                                      className="sidebar-chat-project-group__project"
                                      title={`${label} 작업 영역으로 이동`}
                                    >
                                      <IconFolder size={14} aria-hidden className="sidebar-project-icon" />
                                      <span className="sidebar-chat-project-group__name">{label.length > 22 ? `${label.slice(0, 22)}…` : label}</span>
                                    </NavLink>
                                    <span className="sidebar-chat-project-group__sub" aria-hidden>
                                      하위 대화
                                    </span>
                                  </div>
                                )}
                                {chats.map((chat) => {
                                  const isActiveChat =
                                    pathname.startsWith('/projects/') &&
                                    pathname === `/projects/${chat.projectId}` &&
                                    currentConversationId === chat.id;
                                  return (
                                    <SidebarConversationRow
                                      key={chat.id}
                                      chat={chat}
                                      displayTitle={chat.title}
                                      linkTitle={`${label} — ${chat.title}`}
                                      isActive={isActiveChat}
                                      collapsed={sidebarCollapsed}
                                      to={`/projects/${pid}`}
                                      navState={{ conversationId: chat.id }}
                                      navClassName={`sidebar-topic-item sidebar-chat-item sidebar-chat-item--under-project ${isActiveChat ? 'active' : ''}`}
                                      onRequestDelete={setDeleteChatConfirm}
                                    />
                                  );
                                })}
                              </div>
                            );
                          });
                        })()}
                      </>
                    )}
                  </>
                );
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
              title="Genspark식 agents?id= 링크"
            >
              <IconMessage size={18} aria-hidden className="sidebar-icon-agent" />
              {!sidebarCollapsed && <span>에이전트</span>}
            </NavLink>
            <NavLink to={VOICE_GENERATION_PATH} className={({ isActive }) => `sidebar-tool-item ${isActive ? 'active' : ''}`} end aria-label="목소리 생성" title="목소리 생성">
              <IconVolume size={18} aria-hidden className="sidebar-icon-voice" />
              {!sidebarCollapsed && <span>목소리 생성</span>}
            </NavLink>
          </div>
        </div>
        <div className="sidebar-footer sidebar-chatgpt-footer">
          <div className="theme-toggle">
            <button type="button" className={!isDarkMode ? 'active' : ''} onClick={() => setMode('light')} aria-label="라이트 모드">
              <IconSun size={14} />
              Light
            </button>
            <button type="button" className={isDarkMode ? 'active' : ''} onClick={() => setMode('dark')} aria-label="다크 모드">
              <IconMoon size={14} />
              Dark
            </button>
          </div>
        </div>
      </aside>
      <main id="main-content" className="brainwave-main" tabIndex={-1} role="main">
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
            <span className="brainwave-mobile-title">
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
      <Route path="/" element={<Layout />}>
        <Route path="chat" element={<GeneralChatRouteView />} />
        <Route
          index
          element={
            isGensparkPrimaryExperience() ? (
              <Navigate to={AGENTS_PATH} replace />
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
