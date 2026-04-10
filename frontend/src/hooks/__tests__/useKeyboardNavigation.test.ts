/**
 * useKeyboardNavigation 훅 테스트
 * Task-C1: 테스트 커버리지 개선
 */

import { renderHook } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { useKeyboardNavigation } from '../useKeyboardNavigation';

describe('useKeyboardNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('기본적으로 활성화되어 있습니다', () => {
    const onArrowUp = jest.fn();
    renderHook(() =>
      useKeyboardNavigation({
        onArrowUp,
      })
    );

    fireEvent.keyDown(window, { key: 'ArrowUp' });
    expect(onArrowUp).toHaveBeenCalled();
  });

  it('비활성화 시 키보드 이벤트를 처리하지 않습니다', () => {
    const onArrowUp = jest.fn();
    renderHook(() =>
      useKeyboardNavigation({
        enabled: false,
        onArrowUp,
      })
    );

    fireEvent.keyDown(window, { key: 'ArrowUp' });
    expect(onArrowUp).not.toHaveBeenCalled();
  });

  it('화살표 키 이벤트를 올바르게 처리합니다', () => {
    const onArrowUp = jest.fn();
    const onArrowDown = jest.fn();
    
    renderHook(() =>
      useKeyboardNavigation({
        onArrowUp,
        onArrowDown,
      })
    );

    fireEvent.keyDown(window, { key: 'ArrowUp' });
    expect(onArrowUp).toHaveBeenCalled();

    fireEvent.keyDown(window, { key: 'ArrowDown' });
    expect(onArrowDown).toHaveBeenCalled();
  });

  it('Ctrl+Home과 Ctrl+End를 처리합니다', () => {
    const onHome = jest.fn();
    const onEnd = jest.fn();
    
    renderHook(() =>
      useKeyboardNavigation({
        onHome,
        onEnd,
      })
    );

    fireEvent.keyDown(window, { key: 'Home', ctrlKey: true });
    expect(onHome).toHaveBeenCalled();

    fireEvent.keyDown(window, { key: 'End', ctrlKey: true });
    expect(onEnd).toHaveBeenCalled();
  });

  it('Escape 키를 처리합니다', () => {
    const onEscape = jest.fn();
    
    renderHook(() =>
      useKeyboardNavigation({
        onEscape,
      })
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onEscape).toHaveBeenCalled();
  });
});

