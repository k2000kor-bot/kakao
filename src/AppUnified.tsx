/**
 * 통합 앱: 메인 = 지금 개발된 고급 AI 채팅(ChatGPTInterface), 나머지 기능은 사이드바에서 이동
 * 메인 화면은 동기 로드(첫 페인트에서 청크 대기 없음), 나머지는 lazy.
 */
import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from './components/ThemeProvider';
import ChatGPTInterface from './components/ChatGPTInterface';
import SimpleChatView from './views/SimpleChatView';
import FeaturesMapView from './views/FeaturesMapView';
import { useApiStatus } from './hooks/useApiStatus';
import './App.css';
import './styles/theme.css';
import './styles/brainwave-global.css';
import './styles/responsive.css';
import './components/ChatGPTInterface.css';
import './components/AdvancedFeaturesPanel.css';
import './components/NotebookLLM.css';
import LoadingSkeleton from './components/LoadingSkeleton';
import { onToast } from './utils/toast';

const AdvancedFeaturesPanel = lazy(() => import('./components/AdvancedFeaturesPanel'));
const NotebookLLM = lazy(() => import('./components/NotebookLLM'));

const Fallback = () => (
  <div
    className="main-content"
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
    }}
  >
    <LoadingSkeleton type="card" lines={5} />
  </div>
);

const TITLES: Record<string, string> = {
  '/': '고급 AI 채팅',
  '/simple': '간단 채팅',
  '/features': '고급 기능',
  '/features-map': '전체 기능',
  '/notebook': '노트북 LLM',
};

function DocumentTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    const sub = TITLES[pathname] || 'CORBU AI';
    document.title = sub === '고급 AI 채팅' ? 'CORBU AI' : `${sub} - CORBU AI`;
  }, [pathname]);
  return null;
}

function GlobalToastListener() {
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
  if (!toast) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic
      aria-label={toast.message}
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        padding: '12px 20px',
        borderRadius: 8,
        boxShadow: 'var(--shadow-dropdown)',
        zIndex: 10000,
        background: toast.type === 'error' ? 'var(--accent-error, #dc3545)' : toast.type === 'success' ? 'var(--accent-success, #28a745)' : 'var(--accent-primary, #0084FF)',
        color: 'var(--on-accent, #fff)',
        fontSize: 14,
        fontFamily: 'var(--font-family-base)',
      }}
    >
      {toast.type === 'error' ? '⚠️ ' : toast.type === 'info' ? 'ℹ️ ' : '✅ '}{toast.message}
    </div>
  );
}

function Layout() {
  const { pathname } = useLocation();
  const { data: status, ttsSpeech, error: statusError, loading: statusLoading, refetch } = useApiStatus(0);
  const { isDarkMode, setMode } = useTheme();

  // 라우트 변경 시 main에 포커스 (스크린 리더 사용자용)
  useEffect(() => {
    const main = document.getElementById('main-content');
    if (main) main.focus({ preventScroll: true });
  }, [pathname]);

  useEffect(() => {
    if (!statusError) return;
    const onFocus = () => refetch();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [statusError, refetch]);

  return (
    <>
      <GlobalToastListener />
    <div
      className="app-container brainwave-unified"
      data-testid="app-unified-root"
      data-brainwave-figma="https://www.figma.com/design/9ZrEa3dcS8zb0O6Nr5lT8m/Brainwave-AI-UI-Kit-%F0%9F%9A%80?node-id=323-168775&m=dev"
    >
      <DocumentTitle />
      <a
        href="#main-content"
        className="skip-to-main"
        aria-label="본문으로 건너뛰기"
        style={{
          position: 'absolute',
          left: -9999,
          zIndex: 9999,
          padding: 'var(--spacing-sm) var(--spacing-lg)',
          background: 'var(--accent-info)',
          color: 'var(--on-accent)',
          borderRadius: 'var(--radius-sm)',
        }}
        onClick={(_e) => {
          const el = document.getElementById('main-content');
          if (el) {
            el.focus({ preventScroll: false });
          }
        }}
        onFocus={(e) => {
          e.currentTarget.style.left = '8px';
          e.currentTarget.style.top = '8px';
        }}
        onBlur={(e) => {
          e.currentTarget.style.left = '-9999px';
          e.currentTarget.style.top = '';
        }}
      >
        본문으로 건너뛰기
      </a>
      <aside className="sidebar brainwave-sidebar-dark" role="navigation" aria-label="주요 메뉴">
        <div className="sidebar-header">
          <div className="brainwave-logo-row">
            <div className="brainwave-logo-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 1 7.38 16.75 1 1 0 0 1-1.5-.75 8 8 0 1 0-11.76 0 1 1 0 0 1-1.5.75A10 10 0 0 1 12 2z"/></svg>
            </div>
            <span className="brainwave-logo-text">CORBU AI</span>
          </div>
          <NavLink to="/" className="new-chat-btn" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }} aria-label="새 채팅 시작">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
            새 채팅
          </NavLink>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} aria-label="채팅으로 이동">
            <div className="nav-item-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            Chats
          </NavLink>
          <button type="button" className="nav-item" onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', metaKey: true }))} aria-label="검색 (⌘F)">
            <div className="nav-item-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            Search <span style={{ marginLeft: 'auto', fontSize: 'var(--font-size-xs)', opacity: 0.7 }}>⌘F</span>
          </button>
          <NavLink to="/features" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} aria-label="구독 관리">
            <div className="nav-item-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>
            </div>
            Manage subscription
          </NavLink>
          <NavLink to="/features-map" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} aria-label="업데이트 및 FAQ">
            <div className="nav-item-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            Updates & FAQ
          </NavLink>
          <NavLink to="/features" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} aria-label="설정">
            <div className="nav-item-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </div>
            Settings
          </NavLink>
          <div className="nav-section" style={{ marginTop: 'var(--spacing-xl)' }}>
            <div className="nav-section-title">Chat list</div>
            <button type="button" className="chat-list-item">
              <span className="chat-list-dot" style={{ background: 'var(--accent-info-figma)' }} aria-hidden="true" />
              Welcome
              <span className="chat-list-count">48</span>
            </button>
            <NavLink to="/" className={({ isActive }) => `chat-list-item ${isActive ? 'active' : ''}`}>
              <span className="chat-list-dot" style={{ background: 'var(--sidebar-dark-active-bg)' }} aria-hidden="true" />
              UI8 Production
              <span className="chat-list-count">16</span>
            </NavLink>
            <button type="button" className="chat-list-item">
              <span className="chat-list-dot" style={{ background: 'var(--accent-orange)' }} aria-hidden="true" />
              Favorites
              <span className="chat-list-count">8</span>
            </button>
            <button type="button" className="chat-list-item">
              <span className="chat-list-dot" style={{ background: 'var(--accent-orange)' }} aria-hidden="true" />
              Archived
              <span className="chat-list-count">128</span>
            </button>
            <button type="button" className="chat-list-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
              New list
            </button>
          </div>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">U</div>
            <div>
              <div style={{ fontWeight: 500 }}>
                Tran Mau Tri Tam
                <span className="brainwave-free-badge">Free</span>
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--sidebar-dark-text-muted)' }}>tam@ui8.net</div>
              {statusLoading && (
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--sidebar-dark-text-muted)', marginTop: 4 }}>확인 중...</div>
              )}
              {!statusLoading && statusError && (
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent-error)', marginTop: 4 }} title={String(statusError)}>
                  API 연결 끊김
                  <button type="button" onClick={() => refetch()} aria-label="API 연결 상태 다시 확인" style={{ marginLeft: 6, padding: '2px 6px', fontSize: 'inherit', cursor: 'pointer', background: 'var(--sidebar-dark-input-bg)', color: 'inherit', border: '1px solid var(--sidebar-dark-border)', borderRadius: 'var(--radius-sm)' }}>다시 시도</button>
                </div>
              )}
              {!statusLoading && status?.ok && (
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--sidebar-dark-text-muted)', marginTop: 4 }}>{ttsSpeech ? 'TTS 사용 가능' : 'API 연결됨'}</div>
              )}
            </div>
          </div>
          <button type="button" className="upgrade-pro-btn">Upgraded to Pro</button>
          <div className="theme-toggle">
            <button type="button" className={!isDarkMode ? 'active' : ''} onClick={() => setMode('light')} aria-label="라이트 모드">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              Light
            </button>
            <button type="button" className={isDarkMode ? 'active' : ''} onClick={() => setMode('dark')} aria-label="다크 모드">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              Dark
            </button>
          </div>
        </div>
      </aside>
      <main id="main-content" className="brainwave-main" tabIndex={-1}>
        <Suspense fallback={<Fallback />}>
          <Outlet />
        </Suspense>
      </main>
      <aside className="brainwave-right-sidebar" aria-label="채팅 히스토리">
        <div className="right-sidebar-header">
          <span className="right-sidebar-title">Chat history 26/100</span>
          <button type="button" aria-label="히스토리 삭제" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-secondary)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M10 11v6M14 11v6"/></svg>
          </button>
        </div>
        <div className="chat-history-list">
          <div className="chat-history-item">
            <input type="checkbox" aria-label="Hello 선택" />
            <div className="chat-history-item-content">
              <div className="chat-history-item-title">Hello</div>
              <div className="chat-history-item-desc">Show me what you can do</div>
              <div className="chat-history-item-meta">Just now</div>
            </div>
          </div>
          <div className="chat-history-item">
            <input type="checkbox" aria-label="Welcome page with input 선택" />
            <div className="chat-history-item-content">
              <div className="chat-history-item-title">Welcome page with input</div>
              <div className="chat-history-item-desc">Write code (HTML, CSS and JS) for a simple...</div>
              <div className="chat-history-item-meta">Just now</div>
            </div>
          </div>
        </div>
        <div className="right-sidebar-footer">
          <NavLink to="/" className="new-chat-btn-right" style={{ textDecoration: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            New chat
          </NavLink>
        </div>
      </aside>
    </div>
    </>
  );
}

function NotFoundPage() {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = '페이지를 찾을 수 없습니다 - CORBU AI';
  }, []);
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate('/', { replace: true });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate]);
  return (
    <div
      className="main-content"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        gap: 16,
      }}
    >
      <h2 style={{ margin: 0, fontSize: 'var(--font-size-xl)' }}>페이지를 찾을 수 없습니다</h2>
      <p style={{ margin: 0, color: 'var(--text-secondary)' }}>요청한 경로가 존재하지 않습니다.</p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="이전 페이지로 이동"
          style={{
            padding: 'var(--spacing-sm) var(--spacing-lg)',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
          }}
        >
          이전 페이지
        </button>
        <NavLink
          to="/"
          aria-label="홈으로 돌아가기"
          style={{
            padding: 'var(--spacing-sm) var(--spacing-lg)',
            background: 'var(--accent-info)',
            color: 'var(--on-accent)',
            borderRadius: 'var(--radius-sm)',
            textDecoration: 'none',
          }}
        >
          홈으로 돌아가기
        </NavLink>
      </div>
      <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>Esc 키를 누르면 홈으로 이동합니다.</p>
    </div>
  );
}

/** 라우트 트리만 노출 (테스트에서 MemoryRouter 등으로 감쌀 때 사용) */
export function AppUnifiedRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<ChatGPTInterface />} />
        <Route path="simple" element={<SimpleChatView />} />
        <Route path="features" element={<AdvancedFeaturesPanel />} />
        <Route path="features-map" element={<FeaturesMapView />} />
        <Route path="notebook" element={<NotebookLLM />} />
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
