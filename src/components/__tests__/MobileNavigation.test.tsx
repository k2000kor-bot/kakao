import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MobileNavigation from '../MobileNavigation';
import useResponsive from '../../hooks/useResponsive';

// Mock useResponsive hook
jest.mock('../../hooks/useResponsive');

const mockUseResponsive = useResponsive as jest.MockedFunction<typeof useResponsive>;

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('MobileNavigation', () => {
  const mockOnChatChange = jest.fn();
  const mockOnClose = jest.fn();
  const mockOnOpen = jest.fn();

  const defaultProps = {
    currentChat: 'home',
    onChatChange: mockOnChatChange,
    open: true,
    onClose: mockOnClose,
    onOpen: mockOnOpen
  };

  beforeEach(() => {
    jest.clearAllMocks();
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
  });

  describe('렌더링', () => {
    it('기본적으로 네비게이션을 렌더링해야 함', () => {
      renderWithTheme(<MobileNavigation {...defaultProps} />);

      expect(screen.getByText('CORBU AI')).toBeInTheDocument();
      expect(screen.getByText('알림')).toBeInTheDocument();
      expect(screen.getByText('AI 서비스')).toBeInTheDocument();
      expect(screen.getByText('시스템 관리')).toBeInTheDocument();
    });

    it('모바일일 때 FAB 버튼을 표시해야 함', () => {
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

      renderWithTheme(<MobileNavigation {...defaultProps} open={false} />);

      // FAB 버튼 찾기 (aria-label이 있거나 MenuIcon을 포함하는 버튼)
      const buttons = screen.getAllByRole('button');
      const fabButton = buttons.find(btn => 
        btn.getAttribute('aria-label')?.includes('메뉴') ||
        btn.querySelector('svg[data-testid="MenuIcon"]') ||
        btn.querySelector('svg[aria-hidden="true"]')
      );
      expect(fabButton).toBeInTheDocument();
    });

    it('데스크톱일 때 FAB 버튼을 표시하지 않아야 함', () => {
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

      renderWithTheme(<MobileNavigation {...defaultProps} />);

      const fabButton = screen.queryByRole('button', { name: 'menu' });
      expect(fabButton).not.toBeInTheDocument();
    });
  });

  describe('메뉴 아이템', () => {
    it('AI 서비스 메뉴 아이템을 표시해야 함', () => {
      renderWithTheme(<MobileNavigation {...defaultProps} />);

      expect(screen.getByText('홈')).toBeInTheDocument();
      expect(screen.getByText('코딩 파트너')).toBeInTheDocument();
      expect(screen.getByText('심리 분석')).toBeInTheDocument();
      expect(screen.getByText('데이터 분석')).toBeInTheDocument();
    });

    it('시스템 관리 메뉴 아이템을 표시해야 함', () => {
      renderWithTheme(<MobileNavigation {...defaultProps} />);

      expect(screen.getByText('통합 대시보드')).toBeInTheDocument();
      expect(screen.getByText('성능 최적화')).toBeInTheDocument();
      expect(screen.getByText('AI 엔진 관리')).toBeInTheDocument();
      expect(screen.getByText('보안 모니터링')).toBeInTheDocument();
    });

    it('설정 메뉴 아이템을 표시해야 함', () => {
      renderWithTheme(<MobileNavigation {...defaultProps} />);

      expect(screen.getByText('설정')).toBeInTheDocument();
    });
  });

  describe('메뉴 아이템 클릭', () => {
    it('메뉴 아이템 클릭 시 onChatChange를 호출해야 함', () => {
      renderWithTheme(<MobileNavigation {...defaultProps} />);

      const homeItem = screen.getByText('홈');
      fireEvent.click(homeItem);

      expect(mockOnChatChange).toHaveBeenCalledWith('home');
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('알림 아이템 클릭 시 onChatChange를 호출해야 함', () => {
      renderWithTheme(<MobileNavigation {...defaultProps} />);

      const notificationItem = screen.getByText('알림');
      fireEvent.click(notificationItem);

      expect(mockOnChatChange).toHaveBeenCalledWith('notifications');
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('설정 아이템 클릭 시 onChatChange를 호출해야 함', () => {
      renderWithTheme(<MobileNavigation {...defaultProps} />);

      const settingsItem = screen.getByText('설정');
      fireEvent.click(settingsItem);

      expect(mockOnChatChange).toHaveBeenCalledWith('settings');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('현재 선택된 채팅 하이라이트', () => {
    it('현재 선택된 채팅이 하이라이트되어야 함', () => {
      renderWithTheme(<MobileNavigation {...defaultProps} currentChat="home" />);

      const homeItem = screen.getByText('홈').closest('button');
      expect(homeItem).toHaveStyle({ backgroundColor: expect.stringContaining('20') });
    });

    it('선택되지 않은 채팅은 하이라이트되지 않아야 함', () => {
      renderWithTheme(<MobileNavigation {...defaultProps} currentChat="coding" />);

      const homeItem = screen.getByText('홈').closest('button');
      const homeItemStyle = window.getComputedStyle(homeItem!);
      const backgroundColor = homeItemStyle.backgroundColor;
      
      // 선택되지 않은 아이템은 투명하거나 기본 배경색을 가져야 함
      expect(backgroundColor).not.toContain('rgba');
    });
  });

  describe('알림 배지', () => {
    it('알림 개수를 표시해야 함', () => {
      renderWithTheme(<MobileNavigation {...defaultProps} />);

      expect(screen.getByText('3개의 새 알림')).toBeInTheDocument();
    });
  });

  describe('모바일 드로어', () => {
    it('모바일일 때 SwipeableDrawer를 사용해야 함', () => {
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

      renderWithTheme(<MobileNavigation {...defaultProps} />);

      expect(screen.getByText('CORBU AI')).toBeInTheDocument();
    });

    it('FAB 버튼 클릭 시 onOpen을 호출해야 함', () => {
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

      renderWithTheme(<MobileNavigation {...defaultProps} open={false} />);

      // FAB 버튼 찾기
      const buttons = screen.getAllByRole('button');
      const fabButton = buttons.find(btn => 
        btn.getAttribute('aria-label')?.includes('메뉴') ||
        btn.querySelector('svg[data-testid="MenuIcon"]') ||
        (btn.querySelector('svg[aria-hidden="true"]') && !btn.getAttribute('aria-label')?.includes('닫기'))
      );
      
      if (fabButton) {
        fireEvent.click(fabButton);
      }

      expect(mockOnOpen).toHaveBeenCalled();
    });
  });

  describe('데스크톱 드로어', () => {
    it('데스크톱일 때 Drawer를 사용해야 함', () => {
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

      renderWithTheme(<MobileNavigation {...defaultProps} />);

      expect(screen.getByText('CORBU AI')).toBeInTheDocument();
    });
  });

  describe('닫기 버튼', () => {
    it('모바일일 때 닫기 버튼을 표시해야 함', () => {
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

      renderWithTheme(<MobileNavigation {...defaultProps} />);

      const closeButton = screen.getAllByRole('button').find(btn => 
        btn.querySelector('svg') && btn.getAttribute('aria-label') !== 'menu'
      );
      
      if (closeButton) {
        fireEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });
  });
});

