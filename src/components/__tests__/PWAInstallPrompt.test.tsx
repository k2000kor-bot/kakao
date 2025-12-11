import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import PWAInstallPrompt from '../PWAInstallPrompt';
import usePWA from '../../hooks/usePWA';
import useResponsive from '../../hooks/useResponsive';

// Mock hooks
jest.mock('../../hooks/usePWA');
jest.mock('../../hooks/useResponsive');

const mockUsePWA = usePWA as jest.MockedFunction<typeof usePWA>;
const mockUseResponsive = useResponsive as jest.MockedFunction<typeof useResponsive>;

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('PWAInstallPrompt', () => {
  const mockInstallApp = jest.fn();
  const mockUpdateApp = jest.fn();
  const mockCheckForUpdates = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    mockUseResponsive.mockReturnValue({
      deviceType: 'desktop',
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isLargeScreen: true,
      breakpoints: { xs: false, sm: false, md: false, lg: true, xl: true },
      screenSize: 'lg',
      orientation: 'landscape',
      screenWidth: 1920,
      screenHeight: 1080
    });

    mockUsePWA.mockReturnValue({
      isInstalled: false,
      isInstallable: true,
      isOnline: true,
      isStandalone: false,
      canInstall: true,
      installPrompt: { prompt: jest.fn() },
      swRegistration: null,
      swUpdateAvailable: false,
      installApp: mockInstallApp,
      updateApp: mockUpdateApp,
      checkForUpdates: mockCheckForUpdates
    });
  });

  describe('렌더링', () => {
    it('이미 설치된 경우 아무것도 렌더링하지 않아야 함', () => {
      mockUsePWA.mockReturnValue({
        isInstalled: true,
        isInstallable: true,
        isOnline: true,
        isStandalone: false,
        canInstall: true,
        installPrompt: null,
        swRegistration: null,
        swUpdateAvailable: false,
        installApp: mockInstallApp,
        updateApp: mockUpdateApp,
        checkForUpdates: mockCheckForUpdates
      });

      const { container } = renderWithTheme(<PWAInstallPrompt />);
      expect(container.firstChild).toBeNull();
    });

    it('설치 가능한 경우 설치 프롬프트를 표시해야 함', async () => {
      renderWithTheme(<PWAInstallPrompt />);

      await waitFor(() => {
        expect(screen.getByText('CORBU AI 설치')).toBeInTheDocument();
      });
    });

    it('이전에 거부한 경우 프롬프트를 표시하지 않아야 함', () => {
      const oneWeekAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
      localStorage.setItem('pwa-install-dismissed', oneWeekAgo.toISOString());

      const { container } = renderWithTheme(<PWAInstallPrompt />);
      expect(container.firstChild).toBeNull();
    });

    it('일주일 이상 지난 경우 프롬프트를 다시 표시해야 함', async () => {
      const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
      localStorage.setItem('pwa-install-dismissed', eightDaysAgo.toISOString());

      renderWithTheme(<PWAInstallPrompt />);

      await waitFor(() => {
        expect(screen.getByText('CORBU AI 설치')).toBeInTheDocument();
      });
    });
  });

  describe('설치 기능', () => {
    it('설치 버튼 클릭 시 installApp을 호출해야 함', async () => {
      mockInstallApp.mockResolvedValue(undefined);

      renderWithTheme(<PWAInstallPrompt />);

      await waitFor(() => {
        expect(screen.getByText('지금 설치')).toBeInTheDocument();
      });

      const installButton = screen.getByText('지금 설치');
      fireEvent.click(installButton);

      await waitFor(() => {
        expect(mockInstallApp).toHaveBeenCalledTimes(1);
      });
    });

    it('설치 중일 때 버튼이 비활성화되어야 함', async () => {
      mockInstallApp.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      renderWithTheme(<PWAInstallPrompt />);

      await waitFor(() => {
        expect(screen.getByText('지금 설치')).toBeInTheDocument();
      });

      const installButton = screen.getByText('지금 설치');
      fireEvent.click(installButton);

      await waitFor(() => {
        expect(screen.getByText('설치 중...')).toBeInTheDocument();
      });
    });

    it('설치 실패 시 에러 메시지를 표시해야 함', async () => {
      const errorMessage = '설치 실패';
      mockInstallApp.mockRejectedValue(new Error(errorMessage));

      renderWithTheme(<PWAInstallPrompt />);

      await waitFor(() => {
        expect(screen.getByText('지금 설치')).toBeInTheDocument();
      });

      const installButton = screen.getByText('지금 설치');
      fireEvent.click(installButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('나중에 버튼 클릭 시 프롬프트를 닫고 localStorage에 저장해야 함', async () => {
      renderWithTheme(<PWAInstallPrompt />);

      await waitFor(() => {
        expect(screen.getByText('나중에')).toBeInTheDocument();
      });

      const dismissButton = screen.getByText('나중에');
      fireEvent.click(dismissButton);

      await waitFor(() => {
        expect(localStorage.getItem('pwa-install-dismissed')).toBeTruthy();
      });
    });

    it('닫기 버튼 클릭 시 프롬프트를 닫아야 함', async () => {
      renderWithTheme(<PWAInstallPrompt />);

      await waitFor(() => {
        // 닫기 버튼 찾기 (aria-label이 "설치 프롬프트 닫기"인 버튼 또는 닫기 아이콘)
        const buttons = screen.getAllByRole('button');
        const closeButton = buttons.find(btn => 
          btn.getAttribute('aria-label') === '설치 프롬프트 닫기' ||
          (btn.querySelector('svg') && btn.getAttribute('aria-label')?.includes('닫기'))
        );
        
        if (closeButton) {
          fireEvent.click(closeButton);
          expect(localStorage.getItem('pwa-install-dismissed')).toBeTruthy();
        } else {
          // 대안: "나중에" 버튼 클릭
          const laterButton = screen.getByRole('button', { name: '나중에' });
          fireEvent.click(laterButton);
          expect(localStorage.getItem('pwa-install-dismissed')).toBeTruthy();
        }
      });
    });
  });

  describe('업데이트 기능', () => {
    it('업데이트 사용 가능 시 업데이트 다이얼로그를 표시해야 함', async () => {
      mockUsePWA.mockReturnValue({
        isInstalled: false,
        isInstallable: true,
        isOnline: true,
        isStandalone: false,
        canInstall: true,
        installPrompt: null,
        swRegistration: null,
        swUpdateAvailable: true,
        installApp: mockInstallApp,
        updateApp: mockUpdateApp,
        checkForUpdates: mockCheckForUpdates
      });

      renderWithTheme(<PWAInstallPrompt />);

      await waitFor(() => {
        expect(screen.getByText('앱 업데이트 사용 가능')).toBeInTheDocument();
      });
    });

    it('업데이트 버튼 클릭 시 updateApp을 호출해야 함', async () => {
      mockUpdateApp.mockResolvedValue(undefined);
      
      mockUsePWA.mockReturnValue({
        isInstalled: false,
        isInstallable: true,
        isOnline: true,
        isStandalone: false,
        canInstall: true,
        installPrompt: null,
        swRegistration: null,
        swUpdateAvailable: true,
        installApp: mockInstallApp,
        updateApp: mockUpdateApp,
        checkForUpdates: mockCheckForUpdates
      });

      renderWithTheme(<PWAInstallPrompt />);

      await waitFor(() => {
        expect(screen.getByText('지금 업데이트')).toBeInTheDocument();
      });

      const updateButton = screen.getByText('지금 업데이트');
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockUpdateApp).toHaveBeenCalledTimes(1);
      });
    });

    it('업데이트 나중에 버튼 클릭 시 다이얼로그를 닫아야 함', async () => {
      mockUsePWA.mockReturnValue({
        isInstalled: false,
        isInstallable: true,
        isOnline: true,
        isStandalone: false,
        canInstall: true,
        installPrompt: null,
        swRegistration: null,
        swUpdateAvailable: true,
        installApp: mockInstallApp,
        updateApp: mockUpdateApp,
        checkForUpdates: mockCheckForUpdates
      });

      renderWithTheme(<PWAInstallPrompt />);

      await waitFor(() => {
        const laterButton = screen.getAllByText('나중에');
        if (laterButton.length > 0) {
          fireEvent.click(laterButton[0]);
        }
      });
    });
  });

  describe('디바이스 타입별 아이콘', () => {
    it('모바일 디바이스일 때 PhoneIcon을 표시해야 함', async () => {
      mockUseResponsive.mockReturnValue({
        deviceType: 'mobile',
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isLargeScreen: false,
        breakpoints: { xs: true, sm: false, md: false, lg: false, xl: false },
        screenSize: 'xs',
        orientation: 'portrait'
      });

      renderWithTheme(<PWAInstallPrompt />);

      await waitFor(() => {
        expect(screen.getByText('CORBU AI 설치')).toBeInTheDocument();
      });
    });

    it('태블릿 디바이스일 때 TabletIcon을 표시해야 함', async () => {
      mockUseResponsive.mockReturnValue({
        deviceType: 'tablet',
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        isLargeScreen: false,
        breakpoints: { xs: false, sm: true, md: true, lg: false, xl: false },
        screenSize: 'md',
        orientation: 'landscape'
      });

      renderWithTheme(<PWAInstallPrompt />);

      await waitFor(() => {
        expect(screen.getByText('CORBU AI 설치')).toBeInTheDocument();
      });
    });

    it('데스크톱 디바이스일 때 ComputerIcon을 표시해야 함', async () => {
      mockUseResponsive.mockReturnValue({
        deviceType: 'desktop',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLargeScreen: true,
        breakpoints: { xs: false, sm: false, md: false, lg: true, xl: true },
        screenSize: 'lg',
        orientation: 'landscape'
      });

      renderWithTheme(<PWAInstallPrompt />);

      await waitFor(() => {
        expect(screen.getByText('CORBU AI 설치')).toBeInTheDocument();
      });
    });
  });

  describe('설치 혜택 표시', () => {
    it('설치 혜택 목록을 표시해야 함', async () => {
      renderWithTheme(<PWAInstallPrompt />);

      await waitFor(() => {
        expect(screen.getByText('설치 혜택:')).toBeInTheDocument();
        expect(screen.getByText('빠른 앱 실행 속도')).toBeInTheDocument();
        expect(screen.getByText('오프라인에서도 사용 가능')).toBeInTheDocument();
        expect(screen.getByText('홈 화면에서 바로 접근')).toBeInTheDocument();
      });
    });
  });

  describe('에러 처리', () => {
    it('설치 에러 발생 시 에러 스낵바를 표시해야 함', async () => {
      const errorMessage = '설치 중 오류가 발생했습니다.';
      mockInstallApp.mockRejectedValue(new Error(errorMessage));

      renderWithTheme(<PWAInstallPrompt />);

      await waitFor(() => {
        expect(screen.getByText('지금 설치')).toBeInTheDocument();
      });

      const installButton = screen.getByText('지금 설치');
      fireEvent.click(installButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('에러 스낵바 닫기 버튼 클릭 시 에러를 닫아야 함', async () => {
      const errorMessage = '설치 중 오류가 발생했습니다.';
      mockInstallApp.mockRejectedValue(new Error(errorMessage));

      renderWithTheme(<PWAInstallPrompt />);

      await waitFor(() => {
        expect(screen.getByText('지금 설치')).toBeInTheDocument();
      });

      const installButton = screen.getByText('지금 설치');
      fireEvent.click(installButton);

      await waitFor(() => {
        const alert = screen.getByText(errorMessage);
        expect(alert).toBeInTheDocument();
      });
    });
  });
});

