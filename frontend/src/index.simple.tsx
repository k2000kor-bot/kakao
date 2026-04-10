import React from 'react';
import ReactDOM from 'react-dom/client';
import { errorLogger } from './utils/errorLogger';

// 최소한의 테스트 - React가 작동하는지 확인
const rootElement = document.getElementById('root');
if (!rootElement) {
  errorLogger.error('Root element not found', new Error('Root element not found'), { component: 'index.simple', action: 'bootstrap' });
  document.body.innerHTML = '<div role="alert" aria-live="assertive" aria-label="앱 초기화 오류" style="padding: 40px; font-family: Arial; background: var(--bg-primary); color: var(--text-primary); min-height: 100vh;"><h1 style="color: var(--accent-error);">❌ Root element not found!</h1><p>index.html에 &lt;div id="root"&gt;&lt;/div&gt;가 있는지 확인하세요.</p></div>';
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <div style={{
      padding: '40px',
      fontFamily: 'var(--font-family-base), Arial, sans-serif',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      minHeight: 'var(--app-vh-min)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ color: 'var(--accent-success)', fontSize: '48px', marginBottom: '20px' }}>
        ✅ React가 정상적으로 작동합니다!
      </h1>
      <p style={{ fontSize: '18px' }}>
        이 메시지가 보이면 React 렌더링은 완벽합니다.
      </p>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '20px' }}>
        현재 시간: {new Date().toLocaleString('ko-KR')}
      </p>
    </div>
  );
}

