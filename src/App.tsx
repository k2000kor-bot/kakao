import React from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import ThemeProvider from './components/ThemeProvider';
import ChatGPTInterface from './components/ChatGPTInterface';
import { errorLogger } from './utils/errorLogger';
import './components/ChatGPTInterface.css';
import './index.css';

// 디버깅 모드: 간단한 테스트 컴포넌트로 교체하려면 아래 주석을 해제하세요
// import DebugApp from './App.debug';
const USE_DEBUG_MODE = false; // 정상 모드로 전환

function App() {
  // 디버깅 모드 (필요시 활성화)
  // if (USE_DEBUG_MODE) {
  //   return <DebugApp />;
  // }

  // 정상 모드
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // 에러 리포팅
        errorLogger.error('App Error', error, {
          component: 'App',
          componentStack: errorInfo.componentStack,
        });
      }}
    >
      <ThemeProvider defaultMode="auto">
        <ChatGPTInterface />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;