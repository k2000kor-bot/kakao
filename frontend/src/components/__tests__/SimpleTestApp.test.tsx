/**
 * SimpleTestApp 컴포넌트 테스트
 * 간단한 테스트 앱 컴포넌트 기능 확인
 */

import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SimpleTestApp from '../SimpleTestApp';
import { renderWithTheme, setupCommonMocks } from '../../test-utils/testHelpers';

describe('SimpleTestApp', () => {
  beforeEach(() => {
    setupCommonMocks();
  });

  describe('기본 렌더링', () => {
    it('컴포넌트가 올바르게 렌더링되어야 함', () => {
      renderWithTheme(<SimpleTestApp />);

      expect(screen.getByText(/프론트엔드 정상 작동/i)).toBeInTheDocument();
      expect(screen.getByText(/React가 정상적으로 작동하고 있습니다/i)).toBeInTheDocument();
    });
  });
});
