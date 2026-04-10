/**
 * TypingIndicator 컴포넌트 테스트
 * 실시간 타이핑 인디케이터 기능 확인
 */
/* eslint-disable testing-library/no-container, testing-library/no-node-access */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { setupCommonMocks } from '../../test-utils/testHelpers';
import TypingIndicator from '../TypingIndicator';

describe('TypingIndicator', () => {
  beforeEach(() => {
    setupCommonMocks();
  });

  it('기본 렌더링이 올바르게 작동해야 함', () => {
    const { container } = render(<TypingIndicator />);
    expect(container.querySelector('.typing-indicator')).toBeInTheDocument();
  });

  it('기본 점 3개를 렌더링해야 함', () => {
    const { container } = render(<TypingIndicator />);
    const dots = container.querySelectorAll('.typing-indicator-dot');
    expect(dots).toHaveLength(3);
  });

  it('커스텀 점 개수를 렌더링해야 함', () => {
    const { container } = render(<TypingIndicator dotCount={5} />);
    const dots = container.querySelectorAll('.typing-indicator-dot');
    expect(dots).toHaveLength(5);
  });

  it('사용자 이름이 제공되면 표시해야 함', () => {
    render(<TypingIndicator userName="Test User" />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('사용자 이름이 없으면 표시하지 않아야 함', () => {
    const { container } = render(<TypingIndicator />);
    const userNameElement = container.querySelector('.typing-indicator-label');
    expect(userNameElement).not.toBeInTheDocument();
  });

  it('small 크기를 적용해야 함', () => {
    const { container } = render(<TypingIndicator size="small" />);
    const indicator = container.querySelector('.typing-indicator');
    expect(indicator).toHaveClass('typing-indicator-small');
  });

  it('medium 크기를 적용해야 함', () => {
    const { container } = render(<TypingIndicator size="medium" />);
    const indicator = container.querySelector('.typing-indicator');
    expect(indicator).toHaveClass('typing-indicator-medium');
  });

  it('large 크기를 적용해야 함', () => {
    const { container } = render(<TypingIndicator size="large" />);
    const indicator = container.querySelector('.typing-indicator');
    expect(indicator).toHaveClass('typing-indicator-large');
  });

  it('default 테마를 적용해야 함', () => {
    const { container } = render(<TypingIndicator theme="default" />);
    const indicator = container.querySelector('.typing-indicator');
    expect(indicator).toHaveClass('typing-indicator-default');
  });

  it('primary 테마를 적용해야 함', () => {
    const { container } = render(<TypingIndicator theme="primary" />);
    const indicator = container.querySelector('.typing-indicator');
    expect(indicator).toHaveClass('typing-indicator-primary');
  });

  it('secondary 테마를 적용해야 함', () => {
    const { container } = render(<TypingIndicator theme="secondary" />);
    const indicator = container.querySelector('.typing-indicator');
    expect(indicator).toHaveClass('typing-indicator-secondary');
  });

  it('role="status" 속성을 가져야 함', () => {
    const { container } = render(<TypingIndicator />);
    const indicator = container.querySelector('.typing-indicator');
    expect(indicator).toHaveAttribute('role', 'status');
  });

  it('aria-label을 가져야 함', () => {
    const { container } = render(<TypingIndicator />);
    const indicator = container.querySelector('.typing-indicator');
    expect(indicator).toHaveAttribute('aria-label');
  });
});

