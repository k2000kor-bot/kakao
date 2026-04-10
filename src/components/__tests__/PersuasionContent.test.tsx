/**
 * PersuasionContent 컴포넌트 테스트
 * 설득 콘텐츠 생성 컴포넌트 기능 확인
 */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PersuasionContent from '../PersuasionContent';
import { renderWithTheme, setupCommonMocks } from '../../test-utils/testHelpers';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';

// Mock global fetch
installJestFetchMock();

describe('PersuasionContent', () => {
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
      renderWithTheme(<PersuasionContent />);

      // 기본 UI 요소 확인
      const buttons = screen.queryAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('콘텐츠 생성', () => {
    it('설득 콘텐츠를 생성할 수 있어야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            content: '테스트 설득 콘텐츠',
          },
        }),
      } as Response);

      renderWithTheme(<PersuasionContent />);

      const generateButton = screen.getByRole('button', { name: /생성|Generate/i });
      
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });
});
