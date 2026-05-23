/**
 * 테스트 유틸리티 함수들
 * 공통 테스트 헬퍼 및 모킹 유틸리티
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { API_HEALTH_PATH } from '../config/api';
import { createMuiTestTheme } from './muiTestTheme';

type ProcessEnvPatch = Record<string, string | undefined>;

function applyProcessEnvPatch(patch: ProcessEnvPatch): ProcessEnvPatch {
  const prev: ProcessEnvPatch = {};
  for (const k of Object.keys(patch)) {
    prev[k] = process.env[k];
    const v = patch[k];
    if (v === undefined) {
      delete process.env[k];
    } else {
      process.env[k] = v;
    }
  }
  return prev;
}

function restoreProcessEnvFromPatch(keys: string[], prev: ProcessEnvPatch) {
  for (const k of keys) {
    const was = prev[k];
    if (was === undefined) {
      delete process.env[k];
    } else {
      process.env[k] = was;
    }
  }
}

/** process.env 일부만 임시 변경 후 복구 */
export function withProcessEnv<T>(patch: ProcessEnvPatch, fn: () => T): T {
  const keys = Object.keys(patch);
  const prev = applyProcessEnvPatch(patch);
  try {
    return fn();
  } finally {
    restoreProcessEnvFromPatch(keys, prev);
  }
}

export async function withProcessEnvAsync<T>(
  patch: ProcessEnvPatch,
  fn: () => Promise<T>,
): Promise<T> {
  const keys = Object.keys(patch);
  const prev = applyProcessEnvPatch(patch);
  try {
    return await fn();
  } finally {
    restoreProcessEnvFromPatch(keys, prev);
  }
}

/** fetch health/llm-status 호출이 jsdom 네트워크로 나가는 노이즈를 줄이는 스텁 */
export function installJestFetchHealthLlmStub(options?: { label?: string }): () => void {
  const label = options?.label ?? 'jest';
  const underlying =
    typeof globalThis.fetch === 'function' ? globalThis.fetch.bind(globalThis) : undefined;
  const stub: typeof fetch = (input, init) => {
    const u = typeof input === 'string' ? input : input.toString();
    if (u.includes(API_HEALTH_PATH) || u.includes('llm-status')) {
      const forLlm = u.includes('llm-status');
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(forLlm ? { success: true, summary: '' } : {}),
        text: () => Promise.resolve(''),
      } as Response);
    }
    if (underlying) {
      return underlying(input as RequestInfo, init);
    }
    return Promise.reject(new Error(`${label}: unmocked fetch (${u.slice(0, 160)})`));
  };
  globalThis.fetch = stub as typeof fetch;
  if (typeof window !== 'undefined') {
    window.fetch = globalThis.fetch;
  }
  return () => {
    if (underlying) {
      globalThis.fetch = underlying;
      if (typeof window !== 'undefined') {
        window.fetch = underlying as typeof fetch;
      }
    }
  };
}

/** axios XHR AggregateError·React act·DOM nesting 경고 로그 선별 억제 */
export function installJsdomXhrAggregateErrorConsoleFilter(): () => void {
  const orig = console.error.bind(console);
  const spy = jest.spyOn(console, 'error').mockImplementation((first: unknown, ...rest: unknown[]) => {
    const argToText = (x: unknown): string => {
      if (x instanceof Error) return `${x.name}: ${x.message}\n${x.stack ?? ''}`;
      if (typeof x === 'string') return x;
      if (typeof x === 'number' || typeof x === 'boolean' || typeof x === 'bigint') return String(x);
      if (x == null) return '';
      try {
        return String(x);
      } catch {
        return '';
      }
    };
    const text = [first, ...rest].map(argToText).join('\n');
    if (/AggregateError/i.test(text) && /xhr-utils|XMLHttpRequest-impl|helpers\/http-request/i.test(text)) {
      return;
    }
    if (
      /not wrapped in act/i.test(text) &&
      (/wrap-tests-with-act|react\.dev\/link\/wrap-tests-with-act/i.test(text) ||
        /When testing, code that causes React state updates should be wrapped/i.test(text))
    ) {
      return;
    }
    if (
      /In HTML, .*cannot be a descendant of/i.test(text) ||
      /cannot contain a nested/i.test(text) ||
      /validateDOMNesting/i.test(text)
    ) {
      return;
    }
    orig(first as never, ...rest as never[]);
  });
  return () => {
    spy.mockRestore();
  };
}

/** fetch health 스텁 + 콘솔 필터를 한 번에 설치·해제 */
export function installJestDomQuietNetworkForTests(options?: {
  label?: string;
  fetchStub?: boolean;
}): () => void {
  const useFetchStub = options?.fetchStub !== false;
  const teardownFetch = useFetchStub ? installJestFetchHealthLlmStub(options) : () => {};
  const teardownConsole = installJsdomXhrAggregateErrorConsoleFilter();
  return () => {
    teardownConsole();
    teardownFetch();
  };
}

/**
 * 테마를 포함한 렌더링 헬퍼
 */
export const renderWithTheme = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const theme = createMuiTestTheme();
  
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
  } as unknown as typeof ResizeObserver;

  // IntersectionObserver 모킹 — `new` 호환(plain jest.fn 반환형은 React 19 등에서 생성자로 불안정)
  global.IntersectionObserver = class MockIntersectionObserver {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
  } as unknown as typeof IntersectionObserver;

  // HTMLCanvasElement.getContext 모킹 (jsdom 미구현 대응, ImageAnalysisService 등)
  const origCreateElement = document.createElement.bind(document);
  document.createElement = function (
    this: Document,
    tagName: string,
    options?: ElementCreationOptions
  ): HTMLElement {
    if (tagName.toLowerCase() === 'canvas') {
      const mockCtx = {
        getImageData: jest.fn(() => ({
          data: new Uint8ClampedArray(0),
          width: 0,
          height: 0,
        })),
        putImageData: jest.fn(),
        drawImage: jest.fn(),
        fillRect: jest.fn(),
        clearRect: jest.fn(),
        canvas: { width: 0, height: 0, toBlob: jest.fn((cb: (b: Blob | null) => void) => setTimeout(() => cb(new Blob()), 0)) },
      };
      return {
        getContext: jest.fn((contextType: string) =>
          contextType === '2d' ? (mockCtx as unknown as CanvasRenderingContext2D) : null
        ),
        width: 0,
        height: 0,
        toBlob: jest.fn((cb: (b: Blob | null) => void) => setTimeout(() => cb(new Blob()), 0)),
      } as unknown as HTMLCanvasElement;
    }
    return origCreateElement.call(this, tagName, options);
  };
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
export const mockCreateObjectURL = (_blob: Blob | File): string => {
  return `blob:${Math.random().toString(36).substring(7)}`;
};

/**
 * URL.createObjectURL 모킹 설정
 */
export const setupBlobURLMock = () => {
  global.URL.createObjectURL = jest.fn(mockCreateObjectURL);
  global.URL.revokeObjectURL = jest.fn();
};

