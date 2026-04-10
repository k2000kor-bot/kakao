/**
 * useOptimizedMessages 훅 테스트
 */

import { renderHook } from '@testing-library/react';
import { useOptimizedMessages } from '../useOptimizedMessages';
import type { Message } from '../../types';

const createMessage = (id: number, text: string): Message => ({
  id,
  sender: 'user',
  text,
  timestamp: '2025-01-01T00:00:00Z',
  analysis: null,
});

describe('useOptimizedMessages', () => {
  it('가상화 비활성화 시(threshold 미만) 메시지 반환', () => {
    const messages: Message[] = [
      createMessage(1, 'msg1'),
      createMessage(2, 'msg2'),
      createMessage(3, 'msg3'),
    ];

    const { result } = renderHook(() =>
      useOptimizedMessages({
        messages,
        threshold: 30,
      })
    );

    expect(result.current.messages).toHaveLength(3);
    expect(result.current.virtualizedInfo.totalCount).toBe(3);
    expect(result.current.virtualizedInfo.hasMore).toBe(false);
    expect(result.current.shouldVirtualize).toBe(false);
  });

  it('enableVirtualization=false 시 가상화 비활성화', () => {
    const messages: Message[] = Array.from({ length: 50 }, (_, i) =>
      createMessage(i + 1, `msg${i}`)
    );

    const { result } = renderHook(() =>
      useOptimizedMessages({
        messages,
        enableVirtualization: false,
        threshold: 30,
      })
    );

    expect(result.current.shouldVirtualize).toBe(false);
    expect(result.current.virtualizedInfo.totalCount).toBe(50);
  });

  it('빈 메시지 배열 처리', () => {
    const { result } = renderHook(() =>
      useOptimizedMessages({
        messages: [],
      })
    );

    expect(result.current.messages).toHaveLength(0);
    expect(result.current.virtualizedInfo.totalCount).toBe(0);
    expect(result.current.virtualizedInfo.startIndex).toBe(0);
    expect(result.current.virtualizedInfo.endIndex).toBe(-1);
  });

  it('containerRef 반환', () => {
    const messages = [createMessage(1, 'test')];

    const { result } = renderHook(() =>
      useOptimizedMessages({ messages })
    );

    expect(result.current.containerRef).toBeDefined();
    expect(result.current.containerRef.current).toBeNull();
  });

  it('maxVisible 초과 시 hasMore true', () => {
    const messages: Message[] = Array.from({ length: 60 }, (_, i) =>
      createMessage(i + 1, `msg${i}`)
    );

    const { result } = renderHook(() =>
      useOptimizedMessages({
        messages,
        maxVisible: 50,
        threshold: 30,
      })
    );

    expect(result.current.shouldVirtualize).toBe(true);
    expect(result.current.virtualizedInfo.hasMore).toBe(true);
    expect(result.current.virtualizedInfo.totalCount).toBe(60);
  });
});
