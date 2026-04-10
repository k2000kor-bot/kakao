/**
 * 다크 모드 훅
 * 시스템 테마 감지 및 다크 모드 관리
 */

import { useState, useEffect, useCallback } from 'react';
import { DARK_MODE_STORAGE_KEY } from '../services/themeUiStorageKeys';

export const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = localStorage.getItem(DARK_MODE_STORAGE_KEY);
      if (saved !== null) {
        return JSON.parse(saved) === true;
      }
      if (window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    } catch (_) {}
    return false;
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    try {
      localStorage.setItem(DARK_MODE_STORAGE_KEY, JSON.stringify(isDarkMode));
    } catch (_) {}
  }, [isDarkMode]);

  // 시스템 테마 변경 감지
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      try {
        if (localStorage.getItem(DARK_MODE_STORAGE_KEY) === null) {
          setIsDarkMode(e.matches);
        }
      } catch (_) {}
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const enableDarkMode = useCallback(() => {
    setIsDarkMode(true);
  }, []);

  const disableDarkMode = useCallback(() => {
    setIsDarkMode(false);
  }, []);

  return {
    isDarkMode,
    toggleDarkMode,
    enableDarkMode,
    disableDarkMode,
  };
};

export default useDarkMode;

