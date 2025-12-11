/**
 * useDebounce 훅 테스트
 */

import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('초기값을 반환해야 함', () => {
    const { result } = renderHook(() => useDebounce('initial', 100));

    expect(result.current).toBe('initial');
  });

  it('값 변경 후 지연 시간 후에 업데이트되어야 함', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 100 },
      }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 100 });

    // 아직 업데이트되지 않아야 함
    expect(result.current).toBe('initial');

    // 지연 시간 경과
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toBe('updated');
  });

  it('빠른 연속 변경 시 마지막 값만 반영되어야 함', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 100 },
      }
    );

    rerender({ value: 'first', delay: 100 });
    act(() => {
      jest.advanceTimersByTime(50);
    });

    rerender({ value: 'second', delay: 100 });
    act(() => {
      jest.advanceTimersByTime(50);
    });

    rerender({ value: 'third', delay: 100 });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toBe('third');
  });

  it('지연 시간 변경 시 새로운 지연 시간을 사용해야 함', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 100 },
      }
    );

    rerender({ value: 'updated', delay: 200 });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // 아직 업데이트되지 않아야 함
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toBe('updated');
  });
});

