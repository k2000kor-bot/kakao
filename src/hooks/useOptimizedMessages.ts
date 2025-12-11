/**
 * 최적화된 메시지 관리 훅
 * 성능 최적화를 위한 메시지 가상화 및 메모이제이션
 */

import { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import type { Message } from '../types';

interface UseOptimizedMessagesOptions {
  messages: Message[];
  maxVisible?: number;
  enableVirtualization?: boolean;
  threshold?: number;
}

interface VirtualizedMessages {
  visibleMessages: Message[];
  startIndex: number;
  endIndex: number;
  totalCount: number;
  hasMore: boolean;
}

export const useOptimizedMessages = ({
  messages,
  maxVisible = 50,
  enableVirtualization = true,
  threshold = 30,
}: UseOptimizedMessagesOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const shouldVirtualize = enableVirtualization && messages.length >= threshold;

  // 스크롤 이벤트 핸들러 (스로틀링)
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      requestAnimationFrame(() => {
        setScrollTop(containerRef.current?.scrollTop || 0);
      });
    }
  }, []);

  // 컨테이너 크기 감지
  useEffect(() => {
    if (!containerRef.current || !shouldVirtualize) return;

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
  }, [handleScroll, shouldVirtualize]);

  // 가상화된 메시지 계산
  const virtualizedMessages = useMemo((): VirtualizedMessages => {
    if (!shouldVirtualize || containerHeight === 0) {
      // 가상화 비활성화 시 최근 메시지만 반환
      const visible = messages.slice(-maxVisible);
      return {
        visibleMessages: visible as Message[],
        startIndex: Math.max(0, messages.length - maxVisible),
        endIndex: messages.length - 1,
        totalCount: messages.length,
        hasMore: messages.length > maxVisible,
      };
    }

    // 가상화 활성화
    const itemHeight = 120; // 평균 메시지 높이
    const overscan = 5; // 추가로 렌더링할 메시지 수
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / itemHeight) - overscan
    );
    const endIndex = Math.min(
      messages.length - 1,
      startIndex + visibleCount + overscan * 2
    );

    return {
      visibleMessages: messages.slice(startIndex, endIndex + 1) as Message[],
      startIndex,
      endIndex,
      totalCount: messages.length,
      hasMore: endIndex < messages.length - 1,
    };
  }, [messages, scrollTop, containerHeight, shouldVirtualize, maxVisible]);

  // 메시지 메모이제이션 (불필요한 리렌더링 방지)
  const memoizedMessages = useMemo(() => {
    return virtualizedMessages.visibleMessages.map((msg, index) => ({
      ...msg,
      virtualIndex: virtualizedMessages.startIndex + index,
      isLast: index === virtualizedMessages.visibleMessages.length - 1,
    }));
  }, [virtualizedMessages]);

  return {
    messages: memoizedMessages,
    containerRef,
    virtualizedInfo: {
      startIndex: virtualizedMessages.startIndex,
      endIndex: virtualizedMessages.endIndex,
      totalCount: virtualizedMessages.totalCount,
      hasMore: virtualizedMessages.hasMore,
    },
    shouldVirtualize,
  };
};

