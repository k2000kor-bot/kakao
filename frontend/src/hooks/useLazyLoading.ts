/**
 * 지연 로딩 훅
 * Intersection Observer를 사용하여 요소가 뷰포트에 들어올 때만 렌더링
 * 
 * Task-H2: 성능 최적화
 */

import { useEffect, useRef, useState, RefObject } from 'react';

export interface UseLazyLoadingOptions {
  /**
   * 뷰포트 진입 임계값 (0.0 ~ 1.0)
   * 0.0: 요소가 조금이라도 보이면 로드
   * 1.0: 요소가 완전히 보여야 로드
   */
  threshold?: number;

  /**
   * 루트 마진 (CSS margin 형식)
   * 예: '100px' - 요소가 뷰포트에서 100px 떨어져 있을 때 미리 로드
   */
  rootMargin?: string;

  /**
   * 지연 로딩 활성화 여부
   */
  enabled?: boolean;

  /**
   * 한 번 로드되면 계속 유지할지 여부
   */
  once?: boolean;
}

export interface UseLazyLoadingReturn {
  /**
   * 요소에 연결할 ref
   */
  ref: RefObject<HTMLDivElement | null>;

  /**
   * 로드 여부
   */
  isLoaded: boolean;

  /**
   * 뷰포트에 들어왔는지 여부
   */
  isIntersecting: boolean;

  /**
   * 수동으로 로드 트리거
   */
  load: () => void;
}

/**
 * 지연 로딩 훅
 */
export const useLazyLoading = (
  options: UseLazyLoadingOptions = {}
): UseLazyLoadingReturn => {
  const {
    threshold = 0.1,
    rootMargin = '100px',
    enabled = true,
    once = true,
  } = options;

  const elementRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  /**
   * 수동으로 로드 트리거
   */
  const load = () => {
    setIsLoaded(true);
    setIsIntersecting(true);
  };

  useEffect(() => {
    if (!enabled || !elementRef.current) {
      // 지연 로딩이 비활성화되어 있으면 즉시 로드
      if (!enabled) {
        setIsLoaded(true);
        setIsIntersecting(true);
      }
      return;
    }

    // 이미 로드되었고 once 옵션이 활성화되어 있으면 관찰 중지
    if (isLoaded && once) {
      return;
    }

    // Intersection Observer 생성
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsIntersecting(entry.isIntersecting);

          if (entry.isIntersecting) {
            setIsLoaded(true);

            // once 옵션이 활성화되어 있으면 관찰 중지
            if (once && observerRef.current) {
              observerRef.current.disconnect();
              observerRef.current = null;
            }
          } else if (!once) {
            // once가 false이면 뷰포트를 벗어나면 언로드
            setIsLoaded(false);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    // 요소 관찰 시작
    if (elementRef.current) {
      observerRef.current.observe(elementRef.current);
    }

    // 정리 함수
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [enabled, threshold, rootMargin, once, isLoaded]);

  return {
    ref: elementRef,
    isLoaded,
    isIntersecting,
    load,
  };
};

