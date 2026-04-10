/**
 * ChatGPTInterfaceSimple 컴포넌트 테스트
 * 간단한 ChatGPT 인터페이스 컴포넌트 기능 확인
 */

import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatGPTInterfaceSimple from '../ChatGPTInterfaceSimple';
import { renderWithTheme, setupCommonMocks } from '../../test-utils/testHelpers';

describe('ChatGPTInterfaceSimple', () => {
  beforeEach(() => {
    setupCommonMocks();
  });

  describe('기본 렌더링', () => {
    it('컴포넌트가 올바르게 렌더링되어야 함', () => {
      renderWithTheme(<ChatGPTInterfaceSimple />);

      expect(screen.getByText(/프론트엔드 정상 작동/i)).toBeInTheDocument();
      expect(screen.getByText(/React가 정상적으로 렌더링되고 있습니다/i)).toBeInTheDocument();
    });

    it('다음 단계 안내가 표시되어야 함', () => {
      renderWithTheme(<ChatGPTInterfaceSimple />);

      expect(screen.getByText(/다음 단계/i)).toBeInTheDocument();
      expect(screen.getByText(/브라우저 개발자 도구/i)).toBeInTheDocument();
    });
  });
});
