/**
 * useOfflineStatus 훅 테스트
 */

import { renderHook, act } from '@testing-library/react';
import { useOfflineStatus } from '../useOfflineStatus';

// errorLogger 모킹
jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('useOfflineStatus', () => {
  const { errorLogger } = require('../../utils/errorLogger');

  beforeEach(() => {
    jest.clearAllMocks();
    // navigator.onLine 모킹
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  it('초기 온라인 상태를 반환해야 함', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    const { result } = renderHook(() => useOfflineStatus());

    expect(result.current.isOffline).toBe(false);
    expect(result.current.isOnline).toBe(true);
  });

  it('초기 오프라인 상태를 반환해야 함', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const { result } = renderHook(() => useOfflineStatus());

    expect(result.current.isOffline).toBe(true);
    expect(result.current.isOnline).toBe(false);
  });

  it('온라인 이벤트를 처리해야 함', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const { result } = renderHook(() => useOfflineStatus());

    expect(result.current.isOffline).toBe(true);

    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.isOffline).toBe(false);
    expect(result.current.isOnline).toBe(true);
    expect(errorLogger.info).toHaveBeenCalledWith('[Network] 온라인 상태로 복구되었습니다.', expect.any(Object));
  });

  it('오프라인 이벤트를 처리해야 함', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    const { result } = renderHook(() => useOfflineStatus());

    expect(result.current.isOffline).toBe(false);

    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOffline).toBe(true);
    expect(result.current.isOnline).toBe(false);
    expect(errorLogger.warn).toHaveBeenCalledWith('[Network] 오프라인 상태입니다. 일부 기능이 제한될 수 있습니다.', expect.any(Object));
  });

  it('언마운트 시 이벤트 리스너를 제거해야 함', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useOfflineStatus());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });
});

