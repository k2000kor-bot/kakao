/**
 * 테스트 유틸리티 함수들
 * 공통 테스트 헬퍼 및 모킹 유틸리티
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

/**
 * 테마를 포함한 렌더링 헬퍼
 */
export const renderWithTheme = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const theme = createTheme();
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

/**
 * 공통 모킹 설정
 */
export const setupCommonMocks = () => {
  // scrollIntoView 모킹
  Element.prototype.scrollIntoView = jest.fn();

  // localStorage 모킹 (실제 동작처럼)
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
      get length() {
        return Object.keys(store).length;
      },
      key: (index: number) => {
        const keys = Object.keys(store);
        return keys[index] || null;
      },
    };
  })();
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  // window.matchMedia 모킹
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // ResizeObserver 모킹 (MUI 호환)
  global.ResizeObserver = class ResizeObserver {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
    constructor(callback?: ResizeObserverCallback) {
      // MUI가 callback을 사용할 수 있도록
      if (callback) {
        // 초기 크기 정보 제공
        setTimeout(() => {
          callback([{
            borderBoxSize: [{ blockSize: 100, inlineSize: 100 }],
            contentBoxSize: [{ blockSize: 100, inlineSize: 100 }],
            contentRect: { width: 100, height: 100, top: 0, left: 0, bottom: 100, right: 100, x: 0, y: 0, toJSON: () => ({}) },
            devicePixelContentBoxSize: [],
            target: document.body,
          }], this);
        }, 0);
      }
    }
  } as any;

  // IntersectionObserver 모킹
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
};

/**
 * 공통 모킹 정리
 */
export const cleanupCommonMocks = () => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
};

/**
 * 에러 로거 모킹
 */
export const mockErrorLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

/**
 * 알림 훅 모킹
 */
export const mockUseNotifications = {
  notifications: [],
  markAsRead: jest.fn(),
  dismiss: jest.fn(),
  clearAll: jest.fn(),
  addNotification: jest.fn(),
};

/**
 * 확인 다이얼로그 훅 모킹
 */
export const mockUseConfirmDialog = {
  dialogState: { open: false },
  showConfirm: jest.fn(),
  closeDialog: jest.fn(),
  handleConfirm: jest.fn(),
  handleCancel: jest.fn(),
};

/**
 * 반응형 훅 모킹
 */
export const mockUseResponsive = {
  isMobile: false,
  isTablet: false,
  isDesktop: true,
};

/**
 * 다크 모드 훅 모킹
 */
export const mockUseDarkMode = {
  isDarkMode: false,
  toggleDarkMode: jest.fn(),
};

/**
 * 번역 훅 모킹
 */
export const mockUseTranslation = {
  language: 'ko',
  changeLanguage: jest.fn(),
  availableLanguages: [
    { code: 'ko', name: '한국어' },
    { code: 'en', name: 'English' },
  ],
};

/**
 * 테스트 전 공통 설정
 */
export const setupTests = () => {
  setupCommonMocks();
  
  // console.error 억제 (React 에러 바운더리 테스트용)
  jest.spyOn(console, 'error').mockImplementation(() => {});
  
  // console.warn 억제 (선택적)
  // jest.spyOn(console, 'warn').mockImplementation(() => {});
};

/**
 * 테스트 후 공통 정리
 */
export const teardownTests = () => {
  cleanupCommonMocks();
  jest.restoreAllMocks();
};

/**
 * 비동기 대기 헬퍼
 */
export const waitForAsync = (ms: number = 100) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * 파일 객체 생성 헬퍼
 */
export const createMockFile = (
  name: string,
  type: string,
  size: number = 1000
): File => {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', {
    value: size,
    writable: false,
  });
  return file;
};

/**
 * Blob URL 모킹
 */
export const mockCreateObjectURL = (blob: Blob | File): string => {
  return `blob:${Math.random().toString(36).substring(7)}`;
};

/**
 * URL.createObjectURL 모킹 설정
 */
export const setupBlobURLMock = () => {
  global.URL.createObjectURL = jest.fn(mockCreateObjectURL);
  global.URL.revokeObjectURL = jest.fn();
};

