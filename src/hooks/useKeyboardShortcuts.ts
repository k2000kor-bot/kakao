import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onNewProject?: () => void;
  onSearch?: () => void;
  onSettings?: () => void;
  onExport?: () => void;
  onHelp?: () => void;
  onEscape?: () => void;
  onToggleDarkMode?: () => void;
  onCollaboration?: () => void;
}

export const useKeyboardShortcuts = ({
  onNewProject,
  onSearch,
  onSettings,
  onExport,
  onHelp,
  onEscape,
  onToggleDarkMode,
  onCollaboration
}: KeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + 키 조합만 처리
      if (!event.ctrlKey && !event.metaKey) {
        // Escape 키 처리
        if (event.key === 'Escape') {
          event.preventDefault();
          onEscape?.();
          return;
        }
        return;
      }

      event.preventDefault();

      switch (event.key.toLowerCase()) {
        case 'n':
          onNewProject?.();
          break;
        case 'f':
          onSearch?.();
          break;
        case 's':
          onSettings?.();
          break;
        case 'e':
          onExport?.();
          break;
        case 'h':
          onHelp?.();
          break;
        case 'd':
          onToggleDarkMode?.();
          break;
        case 'c':
          onCollaboration?.();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onNewProject, onSearch, onSettings, onExport, onHelp, onEscape, onToggleDarkMode, onCollaboration]);
};
