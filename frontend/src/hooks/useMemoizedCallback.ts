/**
 * 메모이제이션된 콜백 훅
 */
import { useCallback, useRef } from 'react';

/**
 * deps가 바뀌기 전까지 동일한 함수 참조를 유지해 자식 리렌더 방지.
 * @param callback - 메모이제이션할 콜백
 * @param deps - 의존성 배열 (useCallback과 동일)
 * @returns 안정된 콜백 참조
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- HOF requires permissive typing for any callback
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  const callbackRef = useRef(callback);

  // 항상 최신 콜백 참조 유지
  callbackRef.current = callback;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    ((...args: Parameters<T>) => {
      return callbackRef.current(...args);
    }) as T,
    deps
  );
}

export default useMemoizedCallback;

