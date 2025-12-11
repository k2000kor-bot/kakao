/**
 * useLoadingState 훅 테스트
 */

import { renderHook, act } from '@testing-library/react';
import { useLoadingState } from '../useLoadingState';

describe('useLoadingState', () => {
  it('초기 상태는 idle이어야 함', () => {
    const { result } = renderHook(() => useLoadingState());

    expect(result.current.loadingState.type).toBe('idle');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isInitialLoading).toBe(false);
    expect(result.current.isUpdating).toBe(false);
    expect(result.current.isRefreshing).toBe(false);
  });

  it('초기 로딩을 시작할 수 있어야 함', () => {
    const { result } = renderHook(() => useLoadingState());

    act(() => {
      result.current.startInitialLoading('데이터 로딩 중...');
    });

    expect(result.current.loadingState.type).toBe('initial');
    expect(result.current.loadingState.message).toBe('데이터 로딩 중...');
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isInitialLoading).toBe(true);
    expect(result.current.isUpdating).toBe(false);
    expect(result.current.isRefreshing).toBe(false);
  });

  it('초기 로딩 메시지가 없으면 기본 메시지를 사용해야 함', () => {
    const { result } = renderHook(() => useLoadingState());

    act(() => {
      result.current.startInitialLoading();
    });

    expect(result.current.loadingState.message).toBe('로딩 중...');
  });

  it('업데이트 로딩을 시작할 수 있어야 함', () => {
    const { result } = renderHook(() => useLoadingState());

    act(() => {
      result.current.startUpdating('업데이트 중...');
    });

    expect(result.current.loadingState.type).toBe('updating');
    expect(result.current.loadingState.message).toBe('업데이트 중...');
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isInitialLoading).toBe(false);
    expect(result.current.isUpdating).toBe(true);
    expect(result.current.isRefreshing).toBe(false);
  });

  it('업데이트 로딩 메시지가 없으면 기본 메시지를 사용해야 함', () => {
    const { result } = renderHook(() => useLoadingState());

    act(() => {
      result.current.startUpdating();
    });

    expect(result.current.loadingState.message).toBe('업데이트 중...');
  });

  it('새로고침 로딩을 시작할 수 있어야 함', () => {
    const { result } = renderHook(() => useLoadingState());

    act(() => {
      result.current.startRefreshing('새로고침 중...');
    });

    expect(result.current.loadingState.type).toBe('refreshing');
    expect(result.current.loadingState.message).toBe('새로고침 중...');
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isInitialLoading).toBe(false);
    expect(result.current.isUpdating).toBe(false);
    expect(result.current.isRefreshing).toBe(true);
  });

  it('새로고침 로딩 메시지가 없으면 기본 메시지를 사용해야 함', () => {
    const { result } = renderHook(() => useLoadingState());

    act(() => {
      result.current.startRefreshing();
    });

    expect(result.current.loadingState.message).toBe('새로고침 중...');
  });

  it('로딩을 중지할 수 있어야 함', () => {
    const { result } = renderHook(() => useLoadingState());

    act(() => {
      result.current.startInitialLoading();
    });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.stopLoading();
    });

    expect(result.current.loadingState.type).toBe('idle');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isInitialLoading).toBe(false);
    expect(result.current.isUpdating).toBe(false);
    expect(result.current.isRefreshing).toBe(false);
  });

  it('로딩 상태를 전환할 수 있어야 함', () => {
    const { result } = renderHook(() => useLoadingState());

    act(() => {
      result.current.startInitialLoading();
    });

    expect(result.current.isInitialLoading).toBe(true);

    act(() => {
      result.current.startUpdating();
    });

    expect(result.current.isInitialLoading).toBe(false);
    expect(result.current.isUpdating).toBe(true);

    act(() => {
      result.current.startRefreshing();
    });

    expect(result.current.isUpdating).toBe(false);
    expect(result.current.isRefreshing).toBe(true);
  });
});

