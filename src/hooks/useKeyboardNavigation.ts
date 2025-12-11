/**
 * useKeyboardNavigation 훅
 * Task-C1: 키보드 네비게이션 개선
 * 
 * 채팅 인터페이스에서 키보드로 네비게이션할 수 있도록 지원합니다.
 */

import { useEffect, useCallback, useRef } from 'react';

interface UseKeyboardNavigationOptions {
  enabled?: boolean;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
  onEscape?: () => void;
  onEnter?: (e: KeyboardEvent) => void;
  onTab?: (e: KeyboardEvent) => void;
  preventDefault?: boolean;
}

export const useKeyboardNavigation = ({
  enabled = true,
  onArrowUp,
  onArrowDown,
  onHome,
  onEnd,
  onEscape,
  onEnter,
  onTab,
  preventDefault = true,
}: UseKeyboardNavigationOptions = {}) => {
  const handlersRef = useRef({
    onArrowUp,
    onArrowDown,
    onHome,
    onEnd,
    onEscape,
    onEnter,
    onTab,
  });

  // 핸들러 업데이트
  useEffect(() => {
    handlersRef.current = {
      onArrowUp,
      onArrowDown,
      onHome,
      onEnd,
      onEscape,
      onEnter,
      onTab,
    };
  }, [onArrowUp, onArrowDown, onHome, onEnd, onEscape, onEnter, onTab]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      const { key, ctrlKey, metaKey, shiftKey, altKey } = e;
      const isModifierPressed = ctrlKey || metaKey || shiftKey || altKey;

      switch (key) {
        case 'ArrowUp':
          if (!isModifierPressed && handlersRef.current.onArrowUp) {
            if (preventDefault) e.preventDefault();
            handlersRef.current.onArrowUp();
          }
          break;
        case 'ArrowDown':
          if (!isModifierPressed && handlersRef.current.onArrowDown) {
            if (preventDefault) e.preventDefault();
            handlersRef.current.onArrowDown();
          }
          break;
        case 'Home':
          if (ctrlKey || metaKey) {
            if (handlersRef.current.onHome) {
              if (preventDefault) e.preventDefault();
              handlersRef.current.onHome();
            }
          }
          break;
        case 'End':
          if (ctrlKey || metaKey) {
            if (handlersRef.current.onEnd) {
              if (preventDefault) e.preventDefault();
              handlersRef.current.onEnd();
            }
          }
          break;
        case 'Escape':
          if (!isModifierPressed && handlersRef.current.onEscape) {
            if (preventDefault) e.preventDefault();
            handlersRef.current.onEscape();
          }
          break;
        case 'Enter':
          if (handlersRef.current.onEnter) {
            handlersRef.current.onEnter(e);
          }
          break;
        case 'Tab':
          if (handlersRef.current.onTab) {
            handlersRef.current.onTab(e);
          }
          break;
      }
    },
    [enabled, preventDefault]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  return {
    handleKeyDown,
  };
};

