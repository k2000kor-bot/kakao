/* eslint-disable jest/no-conditional-expect */
/**
 * AccessibleButton 컴포넌트 테스트
 * 접근성 버튼 기능 확인
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { setupCommonMocks } from '../../test-utils/testHelpers';
import AccessibleButton from '../AccessibleButton';

describe('AccessibleButton', () => {
  const defaultProps = {
    onClick: jest.fn(),
    children: '버튼 텍스트',
  };

  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
  });

  it('기본 렌더링이 올바르게 작동해야 함', () => {
    render(<AccessibleButton {...defaultProps} />);
    expect(screen.getByText('버튼 텍스트')).toBeInTheDocument();
  });

  it('클릭 시 onClick이 호출되어야 함', () => {
    render(<AccessibleButton {...defaultProps} />);
    const button = screen.getByRole('button', { name: '버튼 텍스트' });
    fireEvent.click(button);
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it('Enter 키로 클릭할 수 있어야 함', () => {
    render(<AccessibleButton {...defaultProps} />);
    const button = screen.getByRole('button', { name: '버튼 텍스트' });
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it('Space 키로 클릭할 수 있어야 함', () => {
    render(<AccessibleButton {...defaultProps} />);
    const button = screen.getByRole('button', { name: '버튼 텍스트' });
    fireEvent.keyDown(button, { key: ' ' });
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 상태일 때 클릭이 작동하지 않아야 함', () => {
    render(<AccessibleButton {...defaultProps} disabled={true} />);
    const button = screen.getByRole('button', { name: '버튼 텍스트' });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(defaultProps.onClick).not.toHaveBeenCalled();
  });

  it('disabled 상태일 때 키보드 이벤트가 작동하지 않아야 함', () => {
    render(<AccessibleButton {...defaultProps} disabled={true} />);
    const button = screen.getByRole('button', { name: '버튼 텍스트' });
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(defaultProps.onClick).not.toHaveBeenCalled();
  });

  it('aria-label이 올바르게 설정되어야 함', () => {
    render(<AccessibleButton {...defaultProps} ariaLabel="접근성 레이블" />);
    
    const button = screen.getByLabelText('접근성 레이블');
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });

  it('aria-describedby가 올바르게 설정되어야 함', () => {
    render(
      <>
        <AccessibleButton {...defaultProps} ariaDescribedBy="description" />
        <div id="description">설명 텍스트</div>
      </>
    );
    
    const button = screen.getByRole('button', { name: '버튼 텍스트' });
    expect(button).toHaveAttribute('aria-describedby', 'description');
  });

  it('type prop이 올바르게 적용되어야 함', () => {
    render(<AccessibleButton {...defaultProps} type="submit" />);
    
    const button = screen.getByRole('button', { name: '버튼 텍스트' });
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('variant prop이 올바르게 적용되어야 함', () => {
    render(<AccessibleButton {...defaultProps} variant="danger" />);
    const button = screen.getByRole('button', { name: '버튼 텍스트' });
    expect(button).toHaveClass('btn-danger');
  });

  it('size prop이 올바르게 적용되어야 함', () => {
    render(<AccessibleButton {...defaultProps} size="lg" />);
    const button = screen.getByRole('button', { name: '버튼 텍스트' });
    expect(button).toHaveClass('btn-lg');
  });

  it('className이 올바르게 적용되어야 함', () => {
    render(<AccessibleButton {...defaultProps} className="custom-class" />);
    const button = screen.getByRole('button', { name: '버튼 텍스트' });
    expect(button).toHaveClass('custom-class');
  });

  it('아이콘이 왼쪽에 표시되어야 함', () => {
    const icon = <span data-testid="icon">🔍</span>;
    render(<AccessibleButton {...defaultProps} icon={icon} iconPosition="left" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByTestId('icon-wrapper-left')).toContainElement(screen.getByTestId('icon'));
  });

  it('아이콘이 오른쪽에 표시되어야 함', () => {
    const icon = <span data-testid="icon">🔍</span>;
    render(<AccessibleButton {...defaultProps} icon={icon} iconPosition="right" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByTestId('icon-wrapper-right')).toContainElement(screen.getByTestId('icon'));
  });

  it('disabled 상태일 때 tabIndex가 -1이어야 함', () => {
    render(<AccessibleButton {...defaultProps} disabled={true} />);
    const button = screen.getByRole('button', { name: '버튼 텍스트' });
    expect(button).toHaveAttribute('tabIndex', '-1');
  });

  it('활성 상태일 때 tabIndex가 0이어야 함', () => {
    render(<AccessibleButton {...defaultProps} />);
    const button = screen.getByRole('button', { name: '버튼 텍스트' });
    expect(button).toHaveAttribute('tabIndex', '0');
  });

  it('aria-disabled 속성이 올바르게 설정되어야 함', () => {
    render(<AccessibleButton {...defaultProps} disabled={true} />);
    
    const button = screen.getByRole('button', { name: '버튼 텍스트' });
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });
});

