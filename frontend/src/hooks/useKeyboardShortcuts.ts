/**
 * 키보드 단축키 훅
 * 전역 키보드 단축키 관리
 */

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description?: string;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          shortcut.action();
        }
      });
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

// 일반적인 단축키 조합
export const commonShortcuts = {
  newChat: { key: 'n', ctrl: true, description: '새 대화 시작' },
  search: { key: 'k', ctrl: true, description: '검색' },
  settings: { key: ',', ctrl: true, description: '설정' },
  focusInput: { key: 'l', ctrl: true, description: '입력창 포커스' },
  sendMessage: { key: 'Enter', description: '메시지 전송' },
  newLine: { key: 'Enter', shift: true, description: '새 줄' },
};

export default useKeyboardShortcuts;

