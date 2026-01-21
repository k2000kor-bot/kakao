/**
 * API 설정
 * 모든 API 호출의 기본 URL과 포트를 중앙에서 관리
 */

import { errorLogger } from '../utils/errorLogger';

// 기본 API 포트 (백엔드 서버 포트)
// backend/main_server.py는 기본적으로 8000 사용
const DEFAULT_API_PORT = 8000;

// API 기본 URL 설정
// 환경 변수가 설정되어 있으면 사용하고, 없으면 기본 포트 사용
// 잘못된 포트(5001, 8005, 8007)가 포함되어 있으면 기본 포트(8000)로 강제 변경
const envApiUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL;
const hasInvalidPort =
  !!envApiUrl &&
  (envApiUrl.includes(':5001') ||
    envApiUrl.includes(':8005') ||
    envApiUrl.includes(':8007'));

export const API_BASE_URL = hasInvalidPort
  ? `http://localhost:${DEFAULT_API_PORT}`
  : envApiUrl || `http://localhost:${DEFAULT_API_PORT}`;

// WebSocket URL 설정
const envWsUrl = process.env.REACT_APP_WS_URL || process.env.REACT_APP_WS_BASE_URL;
const wsHasInvalidPort =
  !!envWsUrl &&
  (envWsUrl.includes(':5001') ||
    envWsUrl.includes(':8005') ||
    envWsUrl.includes(':8007'));

export const WS_BASE_URL = wsHasInvalidPort
  ? `ws://localhost:${DEFAULT_API_PORT}`
  : envWsUrl || `ws://localhost:${DEFAULT_API_PORT}`;

// API 엔드포인트
export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  HEALTH: `${API_BASE_URL}/api/health`,
  CHAT: `${API_BASE_URL}/api/chat`,
} as const;

if (process.env.NODE_ENV === 'development') {
  errorLogger.info('API 설정 초기화', {
    component: 'apiConfig',
    action: 'initialize',
    API_BASE_URL,
    WS_BASE_URL,
    DEFAULT_PORT: DEFAULT_API_PORT,
    REACT_APP_API_URL: process.env.REACT_APP_API_URL || 'not set',
  });
}

