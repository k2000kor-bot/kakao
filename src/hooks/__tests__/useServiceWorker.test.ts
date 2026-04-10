/**
 * useServiceWorker 훅 테스트
 */

import { renderHook, act } from '@testing-library/react';
import { useServiceWorker } from '../useServiceWorker';

const mockRegister = jest.fn();

jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

describe('useServiceWorker', () => {
  const originalNavigator = global.navigator;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRegister.mockResolvedValue({
      installing: null,
      addEventListener: jest.fn(),
    });
    Object.defineProperty(global, 'navigator', {
      value: {
        ...originalNavigator,
        onLine: true,
        serviceWorker: {
          register: mockRegister,
          controller: null,
        },
      },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
    });
  });

  it('초기 상태 반환', () => {
    const { result } = renderHook(() => useServiceWorker());

    expect(result.current.registration).toBeNull();
    expect(typeof result.current.updateAvailable).toBe('boolean');
    expect(typeof result.current.offline).toBe('boolean');
    expect(typeof result.current.cacheSize).toBe('number');
    expect(typeof result.current.updateServiceWorker).toBe('function');
    expect(typeof result.current.clearCache).toBe('function');
    expect(typeof result.current.getCacheSize).toBe('function');
    expect(typeof result.current.skipWaiting).toBe('function');
  });

  it('updateServiceWorker는 registration 없을 때 에러 없이 실행', async () => {
    const { result } = renderHook(() => useServiceWorker());

    await expect(
      act(async () => {
        await result.current.updateServiceWorker();
      })
    ).resolves.not.toThrow();
  });

  it('getCacheSize는 controller 없을 때 0 반환', async () => {
    const { result } = renderHook(() => useServiceWorker());

    let size: number | undefined;
    await act(async () => {
      size = await result.current.getCacheSize();
    });

    expect(size).toBe(0);
  });

  it('online/offline 이벤트 시 offline 상태 변경', () => {
    Object.defineProperty(global.navigator, 'onLine', {
      value: false,
      writable: true,
    });

    const { result } = renderHook(() => useServiceWorker());

    expect(result.current.offline).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.offline).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.offline).toBe(true);
  });
});
