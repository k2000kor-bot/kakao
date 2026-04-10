/**
 * useTranslation 훅 테스트
 */

import { renderHook, act } from '@testing-library/react';
import { useTranslation } from '../useTranslation';

const mockSetLanguage = jest.fn();
const mockGetLanguage = jest.fn(() => 'ko' as const);
const mockT = jest.fn((key: string) => key);
const mockGetAvailableLanguages = jest.fn(() => [
  { code: 'ko' as const, name: '한국어' },
  { code: 'en' as const, name: 'English' },
]);

jest.mock('../../i18n/i18n', () => ({
  i18n: {
    getLanguage: () => mockGetLanguage(),
    setLanguage: (lang: string) => mockSetLanguage(lang),
    t: (key: string, params?: Record<string, string | number>) => mockT(key, params),
    getAvailableLanguages: () => mockGetAvailableLanguages(),
  },
}));

describe('useTranslation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLanguage.mockReturnValue('ko');
    mockT.mockImplementation((key: string) => key);
    mockGetAvailableLanguages.mockReturnValue([
      { code: 'ko', name: '한국어' },
      { code: 'en', name: 'English' },
    ]);
  });

  it('초기 언어 및 번역 함수 반환', () => {
    const { result } = renderHook(() => useTranslation());

    expect(result.current.language).toBe('ko');
    expect(result.current.t).toBeDefined();
    expect(typeof result.current.t).toBe('function');
    expect(result.current.changeLanguage).toBeDefined();
    expect(typeof result.current.changeLanguage).toBe('function');
    expect(result.current.availableLanguages).toHaveLength(2);
  });

  it('t() 호출 시 i18n.t에 위임', () => {
    mockT.mockReturnValue('번역된 텍스트');

    const { result } = renderHook(() => useTranslation());

    const translated = result.current.t('common.loading');

    expect(mockT).toHaveBeenCalledWith('common.loading', undefined);
    expect(translated).toBe('번역된 텍스트');
  });

  it('t() 파라미터 전달', () => {
    mockT.mockReturnValue('Hello, John');

    const { result } = renderHook(() => useTranslation());

    result.current.t('greeting', { name: 'John' });

    expect(mockT).toHaveBeenCalledWith('greeting', { name: 'John' });
  });

  it('changeLanguage 호출 시 i18n.setLanguage 호출', () => {
    const { result } = renderHook(() => useTranslation());

    act(() => {
      result.current.changeLanguage('en');
    });

    expect(mockSetLanguage).toHaveBeenCalledWith('en');
  });

  it('availableLanguages 구조 검증', () => {
    const { result } = renderHook(() => useTranslation());

    expect(result.current.availableLanguages).toEqual([
      { code: 'ko', name: '한국어' },
      { code: 'en', name: 'English' },
    ]);
  });

  it('languageChanged 이벤트 수신 시 상태 업데이트', () => {
    mockGetLanguage.mockReturnValue('ko');

    const { result } = renderHook(() => useTranslation());

    expect(result.current.language).toBe('ko');

    act(() => {
      window.dispatchEvent(
        new CustomEvent('languageChanged', { detail: 'en' })
      );
    });

    expect(result.current.language).toBe('en');
  });
});
