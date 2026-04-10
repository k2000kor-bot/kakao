/**
 * useResponsive 훅 테스트
 * 반응형 정보 훅의 정상 작동 확인
 * @jest-environment jsdom
*/

import { renderHook } from '@testing-library/react';
import { useResponsive } from '../useResponsive';
import { ThemeProvider } from '@mui/material/styles';
import { createMuiTestTheme } from '../../test-utils/muiTestTheme';
import * as React from 'react';
import { setupCommonMocks } from '../../test-utils/testHelpers';

// 공통 모킹 설정
setupCommonMocks();

// Material-UI 테마 제공자로 래핑
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(ThemeProvider, { theme: createMuiTestTheme() }, children);

describe('useResponsive', () => {
  let originalMatchMedia: typeof window.matchMedia;
  
  beforeEach(() => {
    // window 크기 모킹
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
    
    // matchMedia 모킹 개선 (MUI useMediaQuery 호환)
    // setupCommonMocks에서 이미 정의되어 있으므로 덮어쓰기
    originalMatchMedia = window.matchMedia;
    
    // MUI breakpoints에 맞춰 matches 반환
    // md (900px) < 1024 < lg (1200px) 이므로 md가 true
    window.matchMedia = jest.fn().mockImplementation((query: string) => {
      // MUI breakpoints: xs: 0px, sm: 600px, md: 900px, lg: 1200px, xl: 1536px
      // 현재 window.innerWidth = 1024px이므로 md 범위

      // theme.breakpoints.only('md') -> (min-width:900px) and (max-width:1199.95px)
      if (query.includes('min-width:900px') && query.includes('max-width:1199.95px')) {
        return { matches: true, media: query, onchange: null, addListener: jest.fn(), removeListener: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn(), dispatchEvent: jest.fn() };
      }
      // theme.breakpoints.down('md') -> (max-width:899.95px)
      if (query.includes('max-width:899.95px')) {
        return { matches: false, media: query, onchange: null, addListener: jest.fn(), removeListener: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn(), dispatchEvent: jest.fn() };
      }
      // theme.breakpoints.up('lg') -> (min-width:1200px)
      if (query.includes('min-width:1200px')) {
        return { matches: false, media: query, onchange: null, addListener: jest.fn(), removeListener: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn(), dispatchEvent: jest.fn() };
      }
      // theme.breakpoints.between('sm', 'md') -> (min-width:600px) and (max-width:899.95px)
      if (query.includes('min-width:600px') && query.includes('max-width:899.95px')) {
        return { matches: false, media: query, onchange: null, addListener: jest.fn(), removeListener: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn(), dispatchEvent: jest.fn() };
      }
      // theme.breakpoints.only('xs') -> (min-width:0px) and (max-width:599.95px)
      if (query.includes('min-width:0px') && query.includes('max-width:599.95px')) {
        return { matches: false, media: query, onchange: null, addListener: jest.fn(), removeListener: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn(), dispatchEvent: jest.fn() };
      }
      // theme.breakpoints.only('sm') -> (min-width:600px) and (max-width:899.95px)
      if (query.includes('min-width:600px') && query.includes('max-width:899.95px')) {
        return { matches: false, media: query, onchange: null, addListener: jest.fn(), removeListener: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn(), dispatchEvent: jest.fn() };
      }
      // theme.breakpoints.only('lg') -> (min-width:1200px) and (max-width:1535.95px)
      if (query.includes('min-width:1200px') && query.includes('max-width:1535.95px')) {
        return { matches: false, media: query, onchange: null, addListener: jest.fn(), removeListener: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn(), dispatchEvent: jest.fn() };
      }
      // theme.breakpoints.only('xl') -> (min-width:1536px)
      if (query.includes('min-width:1536px') && !query.includes('max-width')) {
        return { matches: false, media: query, onchange: null, addListener: jest.fn(), removeListener: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn(), dispatchEvent: jest.fn() };
      }
      
      // 기본값
      return { matches: false, media: query, onchange: null, addListener: jest.fn(), removeListener: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn(), dispatchEvent: jest.fn() };
    }) as unknown as typeof window.matchMedia;
  });
  
  afterEach(() => {
    // 원래 matchMedia 복원
    if (originalMatchMedia) {
      window.matchMedia = originalMatchMedia;
    }
  });

  it('기본 반응형 정보를 반환해야 함', () => {
    const { result } = renderHook(() => useResponsive(), { wrapper });

    expect(result.current).toHaveProperty('isMobile');
    expect(result.current).toHaveProperty('isTablet');
    expect(result.current).toHaveProperty('isDesktop');
    expect(result.current).toHaveProperty('screenSize');
    expect(result.current).toHaveProperty('orientation');
    expect(result.current).toHaveProperty('deviceType');
    expect(result.current).toHaveProperty('breakpoints');
  });

  it('breakpoints 정보를 올바르게 반환해야 함', () => {
    const { result } = renderHook(() => useResponsive(), { wrapper });

    expect(result.current.breakpoints).toHaveProperty('xs');
    expect(result.current.breakpoints).toHaveProperty('sm');
    expect(result.current.breakpoints).toHaveProperty('md');
    expect(result.current.breakpoints).toHaveProperty('lg');
    expect(result.current.breakpoints).toHaveProperty('xl');
  });

  it('screenSize를 올바르게 반환해야 함', () => {
    const { result } = renderHook(() => useResponsive(), { wrapper });

    expect(['xs', 'sm', 'md', 'lg', 'xl']).toContain(result.current.screenSize);
  });

  it('deviceType을 올바르게 반환해야 함', () => {
    const { result } = renderHook(() => useResponsive(), { wrapper });

    expect(['mobile', 'tablet', 'desktop']).toContain(result.current.deviceType);
  });

  it('orientation을 올바르게 반환해야 함', () => {
    const { result } = renderHook(() => useResponsive(), { wrapper });

    expect(['portrait', 'landscape']).toContain(result.current.orientation);
  });
});

