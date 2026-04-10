/**
 * 진입점: store + App 동기 로딩. 에러 시 화면에 표시.
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import ThemeProvider from './components/ThemeProvider';
import App from './AppUnified';
import './styles/theme.css';
import './styles/GensparkQALayout.css';
import './styles/brainwave-global.css';
import './styles/responsive.css';
import './index.css';

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; message: string }> {
  state = { hasError: false, message: '' };
  static getDerivedStateFromError(e: Error) {
    return { hasError: true, message: e.message || String(e) };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="bw-error-fallback" role="alert" aria-live="assertive" aria-atomic>
          <h1>화면 로딩 오류</h1>
          <p style={{ wordBreak: 'break-all' }}>{this.state.message}</p>
          <p className="bw-text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>F12 → Console 탭에서 자세한 오류를 확인하세요.</p>
          <div className="bw-error-fallback-actions" role="group" aria-label="복구 액션">
            <button type="button" className="bw-btn-primary" onClick={() => window.location.assign('/')} aria-label="홈으로 이동">홈으로</button>
            <button type="button" className="bw-btn-secondary" onClick={() => window.location.reload()} aria-label="페이지 새로고침">새로고침</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootEl = document.getElementById('root');
if (!rootEl) {
  document.body.innerHTML = '<div class="brainwave-unified" style="padding:var(--spacing-2xl);font-family:var(--font-family-base);color:var(--text-primary);background:var(--bg-primary);min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;"><h1 style="color:var(--accent-error);">오류</h1><p>#root를 찾을 수 없습니다.</p><button onclick="location.reload()" style="padding:var(--spacing-sm) var(--spacing-xl);cursor:pointer;background:var(--accent-info);color:var(--on-accent);border:none;border-radius:var(--radius-md);">새로고침</button></div>';
  throw new Error('Root element not found');
}

// 크래시(코드 5) 완화: 미처리 예외·프로미스 거부 시 로깅 후 복구 유도 (탭 크래시 방지에 도움)
function onUnhandledError(event: ErrorEvent): void {
  console.error('[CORBU.AI] Unhandled error:', event.message, event.filename, event.lineno, event.colno, event.error);
  // return true 시 기본 동작(에러 표시) 유지. false 시 기본 동작 억제(일부 환경에서 탭 크래시 완화).
  if (typeof event.error?.message === 'string' && /ResizeObserver|Script error\.?/i.test(event.error.message)) {
    event.preventDefault();
    return;
  }
}
function onUnhandledRejection(event: PromiseRejectionEvent): void {
  console.error('[CORBU.AI] Unhandled rejection:', event.reason);
  event.preventDefault(); // 기본 동작(콘솔 에러)만 막고, 앱은 계속 동작하도록
}
if (typeof window !== 'undefined') {
  window.addEventListener('error', onUnhandledError);
  window.addEventListener('unhandledrejection', onUnhandledRejection);
}

try {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <Provider store={store}>
          <ThemeProvider defaultMode="light">
            <App />
          </ThemeProvider>
        </Provider>
      </ErrorBoundary>
    </React.StrictMode>
  );
  // React가 그린 뒤 첫 화면 오버레이 제거 (root에 내용 있을 때만 제거해 빈 화면 방지, 2초 후에는 무조건 제거)
  const removeFirstPaint = () => {
    const fp = document.getElementById('first-paint');
    const root = document.getElementById('root');
    if (!fp) return;
    if (root && root.children.length > 0) fp.remove();
  };
  const removeFirstPaintForced = () => {
    const fp = document.getElementById('first-paint');
    if (fp) fp.remove();
  };
  const rAF = typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame : (f: () => void) => setTimeout(f, 0);
  rAF(removeFirstPaint);
  setTimeout(removeFirstPaint, 200);
  setTimeout(removeFirstPaint, 600);
  setTimeout(removeFirstPaintForced, 2500);
  import('./reportWebVitals').then((m) => { if (typeof m.default === 'function') m.default(); }).catch(() => {});
} catch (err) {
  rootEl.innerHTML = '<div class="brainwave-unified" style="padding:var(--spacing-2xl);font-family:var(--font-family-base);max-width:560px;margin:40px auto;background:var(--bg-primary);border-radius:var(--radius-lg);color:var(--text-primary);"><h1 style="color:var(--accent-error);">시작 오류</h1><p>' + (err instanceof Error ? err.message : String(err)) + '</p><button onclick="location.reload()" style="padding:var(--spacing-sm) var(--spacing-xl);cursor:pointer;background:var(--accent-info);color:var(--on-accent);border:none;border-radius:var(--radius-md);">새로고침</button></div>';
}
