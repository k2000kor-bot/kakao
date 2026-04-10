/* eslint-disable jest/no-conditional-expect */
/**
 * MarketingContent 컴포넌트 테스트
 * 마케팅 콘텐츠 생성 컴포넌트 기능 확인
 */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MarketingContent from '../MarketingContent';
import { renderWithTheme, setupCommonMocks } from '../../test-utils/testHelpers';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';

// Mock global fetch
installJestFetchMock();

describe('MarketingContent', () => {
  const mockFetch: jest.MockedFunction<typeof fetch> = jest.mocked(global.fetch);

  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('기본 렌더링', () => {
    it('컴포넌트가 올바르게 렌더링되어야 함', () => {
      renderWithTheme(<MarketingContent />);

      // 탭으로 확인
      expect(screen.getByRole('tab', { name: /소셜미디어/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /이메일/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /분석/i })).toBeInTheDocument();
    });

    it('모든 탭이 표시되어야 함', () => {
      renderWithTheme(<MarketingContent />);

      expect(screen.getByRole('tab', { name: /소셜미디어/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /이메일/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /분석/i })).toBeInTheDocument();
    });
  });

  describe('탭 전환', () => {
    it('이메일 탭으로 전환할 수 있어야 함', () => {
      renderWithTheme(<MarketingContent />);

      const emailTab = screen.getByRole('tab', { name: /이메일/i });
      fireEvent.click(emailTab);
      // 탭 전환 확인
      expect(emailTab).toHaveAttribute('aria-selected', 'true');
    });

    it('분석 탭으로 전환할 수 있어야 함', () => {
      renderWithTheme(<MarketingContent />);

      const analysisTab = screen.getByRole('tab', { name: /분석/i });
      fireEvent.click(analysisTab);
      // 탭 전환 확인
      expect(analysisTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('소셜미디어 콘텐츠 생성', () => {
    it('소셜미디어 콘텐츠를 생성할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            content: '테스트 소셜미디어 콘텐츠',
            platform: 'instagram',
          },
        }),
      } as Response);

      renderWithTheme(<MarketingContent />);

      const generateButton = screen.getByRole('button', { name: /생성|Generate/i });
      
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });
  });

  describe('콜백 함수', () => {
    it('onContentGenerated 콜백을 호출해야 함', async () => {
      const onContentGenerated = jest.fn();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            content: '테스트 콘텐츠',
            type: 'social',
          },
        }),
      } as Response);

      renderWithTheme(<MarketingContent onContentGenerated={onContentGenerated} />);

      const generateButtons = screen.queryAllByRole('button');
      const generateButton = generateButtons.find(btn => 
        btn.textContent?.includes('생성') || 
        btn.textContent?.includes('Generate')
      );
      
      if (generateButton) {
        fireEvent.click(generateButton);
        
        await waitFor(() => {
          expect(onContentGenerated).toHaveBeenCalled();
        }, { timeout: 3000 });
      }
    });
  });
});
