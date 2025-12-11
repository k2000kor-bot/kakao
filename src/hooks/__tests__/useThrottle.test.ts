/**
 * useThrottle 훅 테스트
 */

import { renderHook, act } from '@testing-library/react';
import { useThrottle } from '../useThrottle';

describe('useThrottle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('함수를 스로틀해야 함', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useThrottle(callback, 100));

    act(() => {
      result.current();
      result.current();
      result.current();
    });

    // 첫 번째 호출만 실행되어야 함
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('지연 시간 후 다음 호출을 허용해야 함', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useThrottle(callback, 100));

    act(() => {
      result.current();
    });

    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(100);
      result.current();
    });

    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('인자를 올바르게 전달해야 함', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useThrottle(callback, 100));

    act(() => {
      result.current('arg1', 'arg2');
    });

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('연속 호출 시 마지막 호출을 지연 실행해야 함', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useThrottle(callback, 100));

    act(() => {
      result.current('first');
      jest.advanceTimersByTime(50);
      result.current('second');
      jest.advanceTimersByTime(30);
      result.current('third');
    });

    // 첫 번째 호출만 즉시 실행
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('first');

    // 나머지 시간 경과 후 마지막 호출 실행
    act(() => {
      jest.advanceTimersByTime(20);
    });

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith('third');
  });

  it('콜백 변경 시 새로운 콜백을 사용해야 함', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    const { result, rerender } = renderHook(
      ({ callback, delay }) => useThrottle(callback, delay),
      {
        initialProps: { callback: callback1, delay: 100 },
      }
    );

    act(() => {
      result.current();
    });

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).not.toHaveBeenCalled();

    rerender({ callback: callback2, delay: 100 });

    act(() => {
      jest.advanceTimersByTime(100);
      result.current();
    });

    expect(callback2).toHaveBeenCalledTimes(1);
  });
});

