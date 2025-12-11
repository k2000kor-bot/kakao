/**
 * 로딩 상태 관리 훅
 * 초기 로딩과 업데이트 로딩을 구분하여 관리
 */

import { useState, useCallback } from 'react';

export type LoadingType = 'idle' | 'initial' | 'updating' | 'refreshing';

export interface LoadingState {
  type: LoadingType;
  message?: string;
}

export interface UseLoadingStateReturn {
  loadingState: LoadingState;
  startInitialLoading: (message?: string) => void;
  startUpdating: (message?: string) => void;
  startRefreshing: (message?: string) => void;
  stopLoading: () => void;
  isLoading: boolean;
  isInitialLoading: boolean;
  isUpdating: boolean;
  isRefreshing: boolean;
}

/**
 * 로딩 상태를 관리하는 커스텀 훅
 * 
 * @example
 * const { loadingState, startInitialLoading, stopLoading, isInitialLoading } = useLoadingState();
 * 
 * useEffect(() => {
 *   startInitialLoading('데이터를 불러오는 중...');
 *   fetchData().then(() => stopLoading());
 * }, []);
 */
export const useLoadingState = (): UseLoadingStateReturn => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    type: 'idle',
  });

  const startInitialLoading = useCallback((message?: string) => {
    setLoadingState({
      type: 'initial',
      message: message || '로딩 중...',
    });
  }, []);

  const startUpdating = useCallback((message?: string) => {
    setLoadingState({
      type: 'updating',
      message: message || '업데이트 중...',
    });
  }, []);

  const startRefreshing = useCallback((message?: string) => {
    setLoadingState({
      type: 'refreshing',
      message: message || '새로고침 중...',
    });
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingState({
      type: 'idle',
    });
  }, []);

  return {
    loadingState,
    startInitialLoading,
    startUpdating,
    startRefreshing,
    stopLoading,
    isLoading: loadingState.type !== 'idle',
    isInitialLoading: loadingState.type === 'initial',
    isUpdating: loadingState.type === 'updating',
    isRefreshing: loadingState.type === 'refreshing',
  };
};

