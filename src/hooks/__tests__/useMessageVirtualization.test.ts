/**
 * useMessageVirtualization 훅 테스트
 */

import { renderHook } from '@testing-library/react';
import { useMessageVirtualization } from '../useMessageVirtualization';

describe('useMessageVirtualization', () => {
  it('가상화 비활성화 시(threshold 미만) 모든 메시지 반환', () => {
    const messages = [
      { id: '1' },
      { id: '2' },
      { id: '3' },
    ];
    const containerRef = { current: null } as React.RefObject<HTMLElement>;

    const { result } = renderHook(() =>
      useMessageVirtualization({
        messages,
        containerRef,
        threshold: 50,
      })
    );

    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBe(2);
    expect(result.current.visibleMessages).toHaveLength(3);
    expect(result.current.visibleMessages.map((v) => v.id)).toEqual(['1', '2', '3']);
    expect(result.current.visibleMessages[0].index).toBe(0);
    expect(result.current.visibleMessages[1].index).toBe(1);
    expect(result.current.visibleMessages[2].index).toBe(2);
  });

  it('enabled=false 시 모든 메시지 반환', () => {
    const messages = Array.from({ length: 100 }, (_, i) => ({ id: `msg-${i}` }));
    const containerRef = { current: null } as React.RefObject<HTMLElement>;

    const { result } = renderHook(() =>
      useMessageVirtualization({
        messages,
        containerRef,
        enabled: false,
        threshold: 50,
      })
    );

    expect(result.current.visibleMessages).toHaveLength(100);
    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBe(99);
  });

  it('빈 메시지 배열 처리', () => {
    const containerRef = { current: null } as React.RefObject<HTMLElement>;

    const { result } = renderHook(() =>
      useMessageVirtualization({
        messages: [],
        containerRef,
      })
    );

    expect(result.current.visibleMessages).toHaveLength(0);
    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBe(-1);
  });

  it('단일 메시지 처리', () => {
    const messages = [{ id: 'single' }];
    const containerRef = { current: null } as React.RefObject<HTMLElement>;

    const { result } = renderHook(() =>
      useMessageVirtualization({
        messages,
        containerRef,
      })
    );

    expect(result.current.visibleMessages).toHaveLength(1);
    expect(result.current.visibleMessages[0]).toEqual({ id: 'single', index: 0 });
    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBe(0);
  });
});
