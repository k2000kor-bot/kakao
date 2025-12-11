/**
 * useMessageVirtualization 훅
 * Task-C1: 메시지 가상화를 통한 성능 최적화
 * 
 * 메시지가 많을 때 뷰포트에 보이는 메시지만 렌더링하여 성능을 개선합니다.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

interface UseMessageVirtualizationOptions {
  messages: Array<{ id: string }>;
  containerRef: React.RefObject<HTMLElement>;
  itemHeight?: number;
  overscan?: number;
  enabled?: boolean;
  threshold?: number; // 이 개수 이상일 때만 가상화 활성화
}

interface VirtualizedRange {
  startIndex: number;
  endIndex: number;
  visibleMessages: Array<{ id: string; index: number }>;
}

export const useMessageVirtualization = ({
  messages,
  containerRef,
  itemHeight = 100,
  overscan = 5,
  enabled = true,
  threshold = 50, // 50개 이상일 때만 가상화
}: UseMessageVirtualizationOptions): VirtualizedRange => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const shouldVirtualize = enabled && messages.length >= threshold;

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, [containerRef]);

  // 컨테이너 크기 감지
  useEffect(() => {
    if (!containerRef.current || !shouldVirtualize) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(containerRef.current);
    containerRef.current.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      resizeObserver.disconnect();
      containerRef.current?.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef, handleScroll, shouldVirtualize]);

  // 가상화 범위 계산
  const virtualizedRange = useMemo(() => {
    if (!shouldVirtualize || containerHeight === 0) {
      // 가상화 비활성화 시 모든 메시지 반환
      return {
        startIndex: 0,
        endIndex: messages.length - 1,
        visibleMessages: messages.map((msg, index) => ({ id: msg.id, index })),
      };
    }

    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      messages.length - 1,
      startIndex + visibleCount + overscan * 2
    );

    const visibleMessages = messages
      .slice(startIndex, endIndex + 1)
      .map((msg, relativeIndex) => ({
        id: msg.id,
        index: startIndex + relativeIndex,
      }));

    return {
      startIndex,
      endIndex,
      visibleMessages,
    };
  }, [messages, scrollTop, containerHeight, itemHeight, overscan, shouldVirtualize]);

  return virtualizedRange;
};

