import React from 'react';

// 디버깅용 간단한 App 컴포넌트
function DebugApp() {
  return (
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
        ✅ React 앱이 정상적으로 작동합니다!
      </h1>
      <p style={{ fontSize: '18px', marginBottom: '10px' }}>
        이 메시지가 보이면 React 렌더링은 정상입니다.
      </p>
      <p style={{ fontSize: '16px', color: '#999' }}>
        현재 시간: {new Date().toLocaleString('ko-KR')}
      </p>
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
        <h2 style={{ color: '#667eea' }}>다음 단계:</h2>
        <ul style={{ textAlign: 'left', lineHeight: '1.8' }}>
          <li>이 화면이 보이면 → React는 정상 작동</li>
          <li>원래 컴포넌트에 문제가 있을 수 있음</li>
          <li>ChatGPTInterface 컴포넌트를 확인해야 함</li>
        </ul>
      </div>
    </div>
  );
}

export default DebugApp;

