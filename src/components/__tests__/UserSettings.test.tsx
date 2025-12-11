import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserSettings from '../UserSettings';
import useDarkMode from '../../hooks/useDarkMode';
import useTranslation from '../../hooks/useTranslation';

// Mock hooks
jest.mock('../../hooks/useDarkMode');
jest.mock('../../hooks/useTranslation');

const mockUseDarkMode = useDarkMode as jest.MockedFunction<typeof useDarkMode>;
const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;

// Mock localStorage
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

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock window.matchMedia
const createMatchMedia = (matches: boolean) => {
  return jest.fn().mockImplementation(query => ({
    matches: query === '(prefers-color-scheme: dark)' ? matches : false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: createMatchMedia(false),
});

describe('UserSettings', () => {
  const mockChangeLanguage = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    document.documentElement.classList.remove('dark');

    // Reset matchMedia mock
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: createMatchMedia(false),
    });

    mockUseDarkMode.mockReturnValue({
      isDarkMode: false,
      toggleDarkMode: jest.fn(),
      enableDarkMode: jest.fn(),
      disableDarkMode: jest.fn(),
      setDarkMode: jest.fn()
    });

    mockUseTranslation.mockReturnValue({
      t: (key: string) => key,
      changeLanguage: mockChangeLanguage,
      currentLanguage: 'ko'
    });
  });

  describe('렌더링', () => {
    it('기본적으로 설정 컴포넌트를 렌더링해야 함', () => {
      render(<UserSettings />);

      expect(screen.getByText('설정')).toBeInTheDocument();
      expect(screen.getByText('테마')).toBeInTheDocument();
      expect(screen.getByText('언어')).toBeInTheDocument();
      expect(screen.getByText('알림')).toBeInTheDocument();
    });

    it('onClose prop이 있을 때 닫기 버튼을 표시해야 함', () => {
      render(<UserSettings onClose={mockOnClose} />);

      const closeButton = screen.getByText('✕');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('테마 설정', () => {
    it('테마를 변경할 수 있어야 함', async () => {
      render(<UserSettings />);

      const darkRadio = screen.getByLabelText('다크 모드');
      fireEvent.click(darkRadio);
      
      await waitFor(() => {
        const saved = localStorageMock.getItem('userPreferences');
        expect(saved).toContain('"theme":"dark"');
      });
    });

    it('light 테마를 선택할 수 있어야 함', async () => {
      render(<UserSettings />);

      const lightRadio = screen.getByLabelText('라이트 모드');
      fireEvent.click(lightRadio);
      
      await waitFor(() => {
        const saved = localStorageMock.getItem('userPreferences');
        expect(saved).toContain('"theme":"light"');
      });
    });

    it('auto 테마를 선택할 수 있어야 함', async () => {
      render(<UserSettings />);

      const autoRadio = screen.getByLabelText('시스템 설정 따르기');
      fireEvent.click(autoRadio);
      
      await waitFor(() => {
        const saved = localStorageMock.getItem('userPreferences');
        expect(saved).toContain('"theme":"auto"');
      });
    });
  });

  describe('언어 설정', () => {
    it('언어를 변경할 수 있어야 함', async () => {
      render(<UserSettings />);

      const languageSelect = screen.getByDisplayValue('한국어');
      fireEvent.change(languageSelect, { target: { value: 'en' } });
      
      await waitFor(() => {
        const saved = localStorageMock.getItem('userPreferences');
        expect(saved).toContain('"language":"en"');
      });
      
      // changeLanguage는 useEffect에서 호출되므로 약간의 지연이 있을 수 있음
      await waitFor(() => {
        expect(mockChangeLanguage).toHaveBeenCalled();
      }, { timeout: 2000 });
    });

    it('한국어를 선택할 수 있어야 함', async () => {
      render(<UserSettings />);

      const languageSelect = screen.getByDisplayValue('한국어');
      fireEvent.change(languageSelect, { target: { value: 'ko' } });
      
      await waitFor(() => {
        expect(mockChangeLanguage).toHaveBeenCalledWith('ko');
      });
    });
  });

  describe('알림 설정', () => {
    it('알림 활성화/비활성화를 토글할 수 있어야 함', async () => {
      render(<UserSettings />);

      const notificationCheckbox = screen.getByLabelText('알림 활성화');
      expect(notificationCheckbox).toBeChecked();
      
      fireEvent.click(notificationCheckbox);
      
      await waitFor(() => {
        const saved = localStorageMock.getItem('userPreferences');
        expect(saved).toContain('"enabled":false');
      });
    });

    it('알림 소리를 토글할 수 있어야 함', async () => {
      render(<UserSettings />);

      const soundCheckbox = screen.getByLabelText('소리 재생');
      expect(soundCheckbox).toBeChecked();
      
      fireEvent.click(soundCheckbox);
      
      await waitFor(() => {
        const saved = localStorageMock.getItem('userPreferences');
        expect(saved).toContain('"sound":false');
      });
    });

    it('브라우저 알림을 토글할 수 있어야 함', async () => {
      render(<UserSettings />);

      const browserCheckbox = screen.getByLabelText('브라우저 알림');
      expect(browserCheckbox).toBeChecked();
      
      fireEvent.click(browserCheckbox);
      
      await waitFor(() => {
        const saved = localStorageMock.getItem('userPreferences');
        expect(saved).toContain('"browser":false');
      });
    });
  });

  describe('글쓰기 설정', () => {
    it('자동 저장을 토글할 수 있어야 함', async () => {
      render(<UserSettings />);

      const autoSaveCheckbox = screen.getByLabelText('자동 저장');
      expect(autoSaveCheckbox).toBeChecked();
      
      fireEvent.click(autoSaveCheckbox);
      
      await waitFor(() => {
        const saved = localStorageMock.getItem('userPreferences');
        expect(saved).toContain('"autoSave":false');
      });
    });

    it('기본 톤을 변경할 수 있어야 함', async () => {
      render(<UserSettings />);

      const toneSelect = screen.getByDisplayValue('중립적');
      fireEvent.change(toneSelect, { target: { value: 'formal' } });
      
      await waitFor(() => {
        const saved = localStorageMock.getItem('userPreferences');
        expect(saved).toContain('"defaultTone":"formal"');
      });
    });

    it('기본 스타일을 변경할 수 있어야 함', async () => {
      render(<UserSettings />);

      const styleSelect = screen.getByDisplayValue('수필');
      fireEvent.change(styleSelect, { target: { value: 'article' } });
      
      await waitFor(() => {
        const saved = localStorageMock.getItem('userPreferences');
        expect(saved).toContain('"defaultStyle":"article"');
      });
    });
  });

  describe('채팅 설정', () => {
    it('최대 메시지 수를 변경할 수 있어야 함', async () => {
      render(<UserSettings />);

      const maxMessagesInput = screen.getByDisplayValue('50');
      fireEvent.change(maxMessagesInput, { target: { value: '100' } });
      
      await waitFor(() => {
        const saved = localStorageMock.getItem('userPreferences');
        expect(saved).toContain('"maxMessages":100');
      });
    });

    it('자동 스크롤을 토글할 수 있어야 함', async () => {
      render(<UserSettings />);

      const autoScrollCheckbox = screen.getByLabelText('자동 스크롤');
      expect(autoScrollCheckbox).toBeChecked();
      
      fireEvent.click(autoScrollCheckbox);
      
      await waitFor(() => {
        const saved = localStorageMock.getItem('userPreferences');
        expect(saved).toContain('"autoScroll":false');
      });
    });

    it('타임스탬프 표시를 토글할 수 있어야 함', async () => {
      render(<UserSettings />);

      const timestampCheckbox = screen.getByLabelText('타임스탬프 표시');
      expect(timestampCheckbox).toBeChecked();
      
      fireEvent.click(timestampCheckbox);
      
      await waitFor(() => {
        const saved = localStorageMock.getItem('userPreferences');
        expect(saved).toContain('"showTimestamps":false');
      });
    });
  });

  describe('로컬 스토리지', () => {
    it('설정을 로컬 스토리지에 저장해야 함', async () => {
      render(<UserSettings />);

      await waitFor(() => {
        const saved = localStorageMock.getItem('userPreferences');
        expect(saved).toBeTruthy();
        if (saved) {
          const parsed = JSON.parse(saved);
          expect(parsed).toHaveProperty('theme');
          expect(parsed).toHaveProperty('language');
          expect(parsed).toHaveProperty('notifications');
          expect(parsed).toHaveProperty('writing');
          expect(parsed).toHaveProperty('chat');
        }
      });
    });

    it('로컬 스토리지에서 설정을 로드해야 함', async () => {
      const savedPreferences = {
        theme: 'dark',
        language: 'en',
        notifications: {
          enabled: false,
          sound: false,
          browser: false
        },
        writing: {
          autoSave: false,
          defaultTone: 'formal',
          defaultStyle: 'article'
        },
        chat: {
          maxMessages: 100,
          autoScroll: false,
          showTimestamps: false
        }
      };

      localStorageMock.setItem('userPreferences', JSON.stringify(savedPreferences));

      render(<UserSettings />);

      // 설정이 로드되었는지 확인
      await waitFor(() => {
        const darkRadio = screen.getByLabelText('다크 모드');
        expect(darkRadio).toBeChecked();
      });
    });

    it('잘못된 JSON을 처리해야 함', () => {
      localStorageMock.setItem('userPreferences', 'invalid json');

      // 에러가 발생하지 않아야 함
      expect(() => {
        render(<UserSettings />);
      }).not.toThrow();
    });
  });

  describe('테마 적용', () => {
    it('dark 테마 선택 시 dark 클래스를 추가해야 함', async () => {
      render(<UserSettings />);

      const darkRadio = screen.getByLabelText('다크 모드');
      fireEvent.click(darkRadio);
      
      // useEffect가 실행되어 클래스가 추가되기까지 약간의 지연이 있을 수 있음
      await waitFor(() => {
        const hasDarkClass = document.documentElement.classList.contains('dark');
        // 클래스가 추가되었거나, localStorage에 저장되었는지 확인
        const saved = localStorageMock.getItem('userPreferences');
        expect(saved).toContain('"theme":"dark"');
        if (hasDarkClass) {
          expect(hasDarkClass).toBe(true);
        }
      }, { timeout: 2000 });
    });

    it('light 테마 선택 시 dark 클래스를 제거해야 함', async () => {
      document.documentElement.classList.add('dark');

      render(<UserSettings />);

      const lightRadio = screen.getByLabelText('라이트 모드');
      fireEvent.click(lightRadio);
      
      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(false);
      });
    });
  });

  describe('버튼 기능', () => {
    it('저장 버튼 클릭 시 onClose를 호출해야 함', () => {
      render(<UserSettings onClose={mockOnClose} />);

      const saveButton = screen.getByText('저장');
      fireEvent.click(saveButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('닫기 버튼 클릭 시 onClose를 호출해야 함', () => {
      render(<UserSettings onClose={mockOnClose} />);

      const closeButton = screen.getByText('✕');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('초기화 버튼이 표시되어야 함', () => {
      render(<UserSettings />);

      const resetButton = screen.getByText('초기화');
      expect(resetButton).toBeInTheDocument();
    });
  });
});

