/**
 * useMemoizedCallback 훅 테스트
 * 메모이제이션된 콜백 기능 확인
 */

import { renderHook } from '@testing-library/react';
import { useMemoizedCallback } from '../useMemoizedCallback';

describe('useMemoizedCallback', () => {
  it('콜백을 메모이제이션해야 함', () => {
    const callback = jest.fn((x: number) => x * 2);
    const { result, rerender } = renderHook(
      ({ cb, deps }) => useMemoizedCallback(cb, deps),
      {
        initialProps: { cb: callback, deps: [1] },
      }
    );

    const firstCallback = result.current;

    // deps가 변경되지 않으면 같은 참조를 유지해야 함
    rerender({ cb: callback, deps: [1] });

    expect(result.current).toBe(firstCallback);
  });

  it('deps가 변경되면 새로운 콜백을 생성해야 함', () => {
    const callback = jest.fn((x: number) => x * 2);
    const { result, rerender } = renderHook(
      ({ cb, deps }) => useMemoizedCallback(cb, deps),
      {
        initialProps: { cb: callback, deps: [1] },
      }
    );

    const firstCallback = result.current;

    // deps 변경
    rerender({ cb: callback, deps: [2] });

    expect(result.current).not.toBe(firstCallback);
  });

  it('항상 최신 콜백을 실행해야 함', () => {
    const callback1 = jest.fn((x: number) => x * 2);
    const { result, rerender } = renderHook(
      ({ cb, deps }) => useMemoizedCallback(cb, deps),
      {
        initialProps: { cb: callback1, deps: [1] },
      }
    );

    result.current(5);
    expect(callback1).toHaveBeenCalledWith(5);

    // 콜백 변경 (deps는 동일)
    const callback2 = jest.fn((x: number) => x * 3);
    rerender({ cb: callback2, deps: [1] });

    // 같은 참조이지만 최신 콜백을 실행해야 함
    result.current(5);
    expect(callback2).toHaveBeenCalledWith(5);
  });

  it('인자를 올바르게 전달해야 함', () => {
    const callback = jest.fn((a: number, b: string) => `${a}-${b}`);
    const { result } = renderHook(() =>
      useMemoizedCallback(callback, [])
    );

    result.current(10, 'test');

    expect(callback).toHaveBeenCalledWith(10, 'test');
    expect(callback).toHaveReturnedWith('10-test');
  });

  it('반환값을 올바르게 반환해야 함', () => {
    const callback = jest.fn((x: number) => x * 2);
    const { result } = renderHook(() =>
      useMemoizedCallback(callback, [])
    );

    const returnValue = result.current(5);

    expect(returnValue).toBe(10);
  });

  it('여러 인자를 처리해야 함', () => {
    const callback = jest.fn((a: number, b: number, c: number) => a + b + c);
    const { result } = renderHook(() =>
      useMemoizedCallback(callback, [])
    );

    const returnValue = result.current(1, 2, 3);

    expect(returnValue).toBe(6);
    expect(callback).toHaveBeenCalledWith(1, 2, 3);
  });
});

