import React from 'react';
import ReactDOM from 'react-dom/client';

// 최소한의 테스트 - React가 작동하는지 확인
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found!');
  document.body.innerHTML = '<div style="padding: 40px; font-family: Arial; background: #1a1a1a; color: #fff; min-height: 100vh;"><h1 style="color: #ff4444;">❌ Root element not found!</h1><p>index.html에 &lt;div id="root"&gt;&lt;/div&gt;가 있는지 확인하세요.</p></div>';
} else {
  console.log('✅ Root element found');
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <div style={{
      padding: '40px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ color: '#19c37d', fontSize: '48px', marginBottom: '20px' }}>
        ✅ React가 정상적으로 작동합니다!
      </h1>
      <p style={{ fontSize: '18px' }}>
        이 메시지가 보이면 React 렌더링은 완벽합니다.
      </p>
      <p style={{ fontSize: '14px', color: '#999', marginTop: '20px' }}>
        현재 시간: {new Date().toLocaleString('ko-KR')}
      </p>
    </div>
  );
  console.log('✅ React render completed');
}

