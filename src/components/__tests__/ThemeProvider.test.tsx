/**
 * ThemeProvider 컴포넌트 테스트
 * 테마 제공자 기능 확인
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeProvider, { useTheme } from '../ThemeProvider';

// useDarkMode 훅 모킹
const mockEnableDarkMode = jest.fn();
const mockDisableDarkMode = jest.fn();
const mockUseDarkMode = {
  isDarkMode: false,
  enableDarkMode: mockEnableDarkMode,
  disableDarkMode: mockDisableDarkMode,
  toggleDarkMode: jest.fn(),
};

jest.mock('../../hooks/useDarkMode', () => ({
  useDarkMode: () => mockUseDarkMode,
}));

// localStorage 모킹
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// window.matchMedia 모킹
const createMatchMedia = (matches: boolean) => ({
  matches,
  media: '',
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
});

// 테스트용 컴포넌트
const TestComponent: React.FC = () => {
  const { mode, isDarkMode, setMode, toggleMode } = useTheme();
  return (
    <div>
      <div data-testid="mode">{mode}</div>
      <div data-testid="is-dark-mode">{isDarkMode ? 'true' : 'false'}</div>
      <button data-testid="set-light" onClick={() => setMode('light')}>Light</button>
      <button data-testid="set-dark" onClick={() => setMode('dark')}>Dark</button>
      <button data-testid="set-auto" onClick={() => setMode('auto')}>Auto</button>
      <button data-testid="toggle" onClick={toggleMode}>Toggle</button>
    </div>
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // window.matchMedia 모킹
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => 
        createMatchMedia(query === '(prefers-color-scheme: dark)')
      ),
    });
  });

  it('기본 렌더링이 올바르게 작동해야 함', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('mode')).toBeInTheDocument();
  });

  it('기본 모드가 auto여야 함', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('auto');
  });

  it('defaultMode prop이 설정되면 해당 모드를 사용해야 함', () => {
    render(
      <ThemeProvider defaultMode="dark">
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('localStorage에 저장된 모드를 사용해야 함', () => {
    localStorageMock.setItem('themeMode', 'light');
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
  });

  it('setMode로 모드를 변경할 수 있어야 함', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    const setDarkButton = screen.getByTestId('set-dark');
    fireEvent.click(setDarkButton);
    
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('toggleMode로 모드를 순환할 수 있어야 함', () => {
    render(
      <ThemeProvider defaultMode="light">
        <TestComponent />
      </ThemeProvider>
    );
    
    const toggleButton = screen.getByTestId('toggle');
    
    // light -> dark
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    
    // dark -> auto
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('mode')).toHaveTextContent('auto');
    
    // auto -> light
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
  });

  it('dark 모드로 설정하면 enableDarkMode가 호출되어야 함', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    const setDarkButton = screen.getByTestId('set-dark');
    fireEvent.click(setDarkButton);
    
    expect(mockEnableDarkMode).toHaveBeenCalled();
  });

  it('light 모드로 설정하면 disableDarkMode가 호출되어야 함', () => {
    mockUseDarkMode.isDarkMode = true;
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    const setLightButton = screen.getByTestId('set-light');
    fireEvent.click(setLightButton);
    
    expect(mockDisableDarkMode).toHaveBeenCalled();
  });

  it('useTheme이 ThemeProvider 외부에서 사용되면 에러가 발생해야 함', () => {
    // 에러 콘솔 출력 방지
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // React의 에러 경계를 우회하여 에러를 캐치
    const TestComponentWithoutProvider = () => {
      try {
        useTheme();
        return <div>No Error</div>;
      } catch (error) {
        return <div>Error: {(error as Error).message}</div>;
      }
    };
    
    render(<TestComponentWithoutProvider />);
    expect(screen.getByText(/useTheme must be used within ThemeProvider/)).toBeInTheDocument();
    
    consoleError.mockRestore();
  });
});

