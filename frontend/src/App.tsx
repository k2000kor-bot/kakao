import React, { Suspense } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import ThemeProvider from './components/ThemeProvider';
import LoadingSkeleton from './components/LoadingSkeleton';
import ChatGPTInterfaceSimple from './components/ChatGPTInterfaceSimple'; // 테스트용
import { errorLogger } from './utils/errorLogger';
import './styles/theme.css';
import './components/ChatGPTInterface.css';
import './index.css';

// 메인 인터페이스를 lazy loading하여 초기 번들 크기 감소
const ChatGPTInterface = React.lazy(() => import('./components/ChatGPTInterface'));

// 디버깅 모드: 간단한 테스트 컴포넌트로 교체하려면 아래 주석을 해제하세요
// import DebugApp from './App.debug';
// import SimpleTestApp from './components/SimpleTestApp';
// 디버깅 시 DebugApp으로 전환용 (주석 해제 시 사용)
const USE_DEBUG_MODE = false; // eslint-disable-line @typescript-eslint/no-unused-vars
const USE_SIMPLE_MODE = false; // 간단한 모드 (문제 해결용) - 정상 모드로 복원

function App() {
  // 디버깅 모드 (필요시 활성화)
  // if (USE_DEBUG_MODE) {
  //   return <DebugApp />;
  // }

  // 간단한 모드 (문제 해결용)
  if (USE_SIMPLE_MODE) {
    return (
      <ErrorBoundary>
        <ChatGPTInterfaceSimple />
      </ErrorBoundary>
    );
  }

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
        <Suspense
          fallback={
            <div className="brainwave-app-loading" role="status" aria-live="polite" aria-label="앱 로딩 중">
              <span className="brainwave-app-loading-title">CORBU.AI</span>
              <LoadingSkeleton type="card" lines={5} />
            </div>
          }
        >
          <ChatGPTInterface />
        </Suspense>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;