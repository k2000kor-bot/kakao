/**
 * 쓰로틀 훅
 */
import { useRef, useCallback } from 'react';

/**
 * delay ms 동안 최대 1회만 콜백 실행. 스크롤/리사이즈 등 고빈도 이벤트에 적합.
 * @param callback - 스로틀할 콜백
 * @param delay - 최소 호출 간격 (ms)
 * @returns 스로틀된 콜백
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- HOF requires permissive typing for any callback
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastRun.current >= delay) {
        lastRun.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          lastRun.current = Date.now();
          callback(...args);
        }, delay - (now - lastRun.current));
      }
    }) as T,
    [callback, delay]
  );
}

export default useThrottle;

