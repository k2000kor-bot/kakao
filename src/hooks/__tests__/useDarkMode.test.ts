/**
 * useDarkMode 훅 테스트
 */

import { renderHook, act } from '@testing-library/react';
import { useDarkMode } from '../useDarkMode';

// localStorage 모킹
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
  };
})();

// matchMedia는 beforeEach에서 설정됨

describe('useDarkMode', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    
    // matchMedia 모킹 - 항상 유효한 MediaQueryList 반환
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => {
        const mediaQuery = {
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        } as MediaQueryList;
        return mediaQuery;
      },
    });
    
    document.documentElement.classList.remove('dark-mode');
  });

  it('로컬 스토리지에서 저장된 설정을 사용해야 함', () => {
    localStorageMock.setItem('darkMode', 'true');

    const { result } = renderHook(() => useDarkMode());

    expect(result.current.isDarkMode).toBe(true);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
  });

  it('시스템 테마를 감지해야 함', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => {
        return {
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        } as MediaQueryList;
      },
    });

    const { result } = renderHook(() => useDarkMode());

    expect(result.current.isDarkMode).toBe(true);
  });

  it('다크 모드를 토글할 수 있어야 함', () => {
    // 로컬 스토리지가 비어있고 시스템 테마가 라이트 모드인 경우
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => {
        return {
          matches: false, // 라이트 모드
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        } as MediaQueryList;
      },
    });

    const { result } = renderHook(() => useDarkMode());

    expect(result.current.isDarkMode).toBe(false);

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(result.current.isDarkMode).toBe(true);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
    expect(localStorageMock.getItem('darkMode')).toBe('true');
  });

  it('다크 모드를 활성화할 수 있어야 함', () => {
    const { result } = renderHook(() => useDarkMode());

    act(() => {
      result.current.enableDarkMode();
    });

    expect(result.current.isDarkMode).toBe(true);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
  });

  it('다크 모드를 비활성화할 수 있어야 함', () => {
    localStorageMock.setItem('darkMode', 'true');
    const { result } = renderHook(() => useDarkMode());

    act(() => {
      result.current.disableDarkMode();
    });

    expect(result.current.isDarkMode).toBe(false);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(false);
  });

  it('시스템 테마 변경을 감지해야 함', () => {
    const addEventListenerSpy = jest.fn();
    const removeEventListenerSpy = jest.fn();

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => {
        return {
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: addEventListenerSpy,
          removeEventListener: removeEventListenerSpy,
          dispatchEvent: jest.fn(),
        } as MediaQueryList;
      },
    });

    const { unmount } = renderHook(() => useDarkMode());

    expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('명시적 설정이 있으면 시스템 테마 변경을 무시해야 함', () => {
    localStorageMock.setItem('darkMode', 'false');

    const { result } = renderHook(() => useDarkMode());

    expect(result.current.isDarkMode).toBe(false);

    // 시스템 테마 변경 이벤트 시뮬레이션
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const changeEvent = new Event('change') as MediaQueryListEvent;
    Object.defineProperty(changeEvent, 'matches', { value: true });

    act(() => {
      (mediaQuery as any).dispatchEvent(changeEvent);
    });

    // 명시적 설정이 있으므로 변경되지 않아야 함
    expect(result.current.isDarkMode).toBe(false);
  });
});

