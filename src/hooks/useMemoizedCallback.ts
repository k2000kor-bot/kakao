import { useCallback, useRef } from 'react';

export function useMemoizedCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps: React.DependencyList
): T {
    const ref = useRef<T>(callback);

    // 최신 콜백을 ref에 저장
    ref.current = callback;

    // 메모이제이션된 콜백 반환
    return useCallback((...args: Parameters<T>) => {
        return ref.current(...args);
    }, deps) as T;
}
