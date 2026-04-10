/**
 * LanguageSelector 컴포넌트 테스트
 * 언어 선택 기능 확인
 */
/* eslint-disable testing-library/no-node-access */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { setupCommonMocks } from '../../test-utils/testHelpers';
import LanguageSelector from '../LanguageSelector';

// useTranslation 훅 모킹
const mockChangeLanguage = jest.fn();
const mockAvailableLanguages = [
  { code: 'ko', name: '한국어' },
  { code: 'en', name: 'English' },
];

jest.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    language: 'ko',
    changeLanguage: mockChangeLanguage,
    availableLanguages: mockAvailableLanguages,
  }),
}));

describe('LanguageSelector', () => {
  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
  });

  it('기본 렌더링이 올바르게 작동해야 함', () => {
    render(<LanguageSelector />);
    // queryByRole은 요소를 찾지 못하면 null을 반환하므로 fallback이 작동함
    const select = screen.queryByRole('combobox', { name: /언어 선택/i }) || document.getElementById('language-select');
    expect(select).toBeInTheDocument();
  });

  it('사용 가능한 모든 언어 옵션이 표시되어야 함', () => {
    render(<LanguageSelector />);
    expect(screen.getByText('한국어')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('언어 선택 시 changeLanguage가 호출되어야 함', () => {
    render(<LanguageSelector />);
    // ID로 직접 선택
    const select = document.getElementById('language-select') as HTMLSelectElement;
    expect(select).toBeInTheDocument();

    fireEvent.change(select, { target: { value: 'en' } });

    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
  });

  it('현재 선택된 언어가 올바르게 표시되어야 함', () => {
    render(<LanguageSelector />);
    // ID로 직접 선택
    const select = document.getElementById('language-select') as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    expect(select.value).toBe('ko');
  });

  it('다른 언어로 변경할 수 있어야 함', () => {
    render(<LanguageSelector />);
    // ID로 직접 선택
    const select = document.getElementById('language-select') as HTMLSelectElement;
    expect(select).toBeInTheDocument();

    fireEvent.change(select, { target: { value: 'en' } });
    expect(mockChangeLanguage).toHaveBeenCalledTimes(1);
    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
  });
});

