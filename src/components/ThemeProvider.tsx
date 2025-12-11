/**
 * 테마 프로바이더 컴포넌트
 * 테마 설정 관리 및 전역 적용
 * 
 * Task-E1: 퍼블리싱·테마 일관화
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';
import { useDarkMode } from '../hooks/useDarkMode';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextValue {
  mode: ThemeMode;
  isDarkMode: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = 'auto',
}) => {
  const darkMode = useDarkMode();
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
      const saved = globalThis.localStorage.getItem('themeMode');
      return (saved as ThemeMode) || defaultMode;
    }
    return defaultMode;
  });

  useEffect(() => {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
      globalThis.localStorage.setItem('themeMode', mode);
    }
    
    if (mode === 'auto') {
      // 시스템 테마 따르기
      if (typeof globalThis !== 'undefined' && 'matchMedia' in globalThis.window) {
        const systemPrefersDark = globalThis.window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (systemPrefersDark !== darkMode.isDarkMode) {
          if (systemPrefersDark) {
            darkMode.enableDarkMode();
          } else {
            darkMode.disableDarkMode();
          }
        }
      }
    } else if (mode === 'dark' && !darkMode.isDarkMode) {
      darkMode.enableDarkMode();
    } else if (mode === 'light' && darkMode.isDarkMode) {
      darkMode.disableDarkMode();
    }
  }, [mode, darkMode.isDarkMode, darkMode.enableDarkMode, darkMode.disableDarkMode]);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((currentMode) => {
      if (currentMode === 'light') {
        return 'dark';
      } else if (currentMode === 'dark') {
        return 'auto';
      } else {
        return 'light';
      }
    });
  }, []);

  const contextValue = useMemo(() => ({
    mode,
    isDarkMode: darkMode.isDarkMode,
    setMode,
    toggleMode,
  }), [mode, darkMode.isDarkMode, setMode, toggleMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export default ThemeProvider;

