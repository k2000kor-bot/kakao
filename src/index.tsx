import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import reportWebVitals from './reportWebVitals';
import errorReportingService from './services/errorReportingService';
import { errorLogger } from './utils/errorLogger';
// CSS 파일 import (존재하지 않으면 무시됨)
import './styles/theme.css';
import './styles/responsive.css';

// 전역 에러 핸들러 설정
window.addEventListener('error', (event) => {
  if (event.error) {
    errorLogger.error('전역 에러 발생', event.error, {
      component: 'global',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
    errorReportingService.reportError(event.error, {
      severity: 'high',
      additionalContext: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason instanceof Error
    ? event.reason
    : new Error(String(event.reason));
  errorLogger.error('처리되지 않은 Promise 거부', error, {
    component: 'global',
    type: 'unhandledrejection',
  });
  errorReportingService.reportError(error, {
    severity: 'medium',
    additionalContext: {
      type: 'unhandledrejection',
    },
  });
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
