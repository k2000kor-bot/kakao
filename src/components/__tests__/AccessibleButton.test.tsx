/**
 * AccessibleButton 컴포넌트 테스트
 * 접근성 버튼 기능 확인
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AccessibleButton from '../AccessibleButton';

describe('AccessibleButton', () => {
  const defaultProps = {
    onClick: jest.fn(),
    children: '버튼 텍스트',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('기본 렌더링이 올바르게 작동해야 함', () => {
    render(<AccessibleButton {...defaultProps} />);
    expect(screen.getByText('버튼 텍스트')).toBeInTheDocument();
  });

  it('클릭 시 onClick이 호출되어야 함', () => {
    render(<AccessibleButton {...defaultProps} />);
    
    const button = screen.getByText('버튼 텍스트').closest('button');
    if (button) {
      fireEvent.click(button);
      expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
    }
  });

  it('Enter 키로 클릭할 수 있어야 함', () => {
    render(<AccessibleButton {...defaultProps} />);
    
    const button = screen.getByText('버튼 텍스트').closest('button');
    if (button) {
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
    }
  });

  it('Space 키로 클릭할 수 있어야 함', () => {
    render(<AccessibleButton {...defaultProps} />);
    
    const button = screen.getByText('버튼 텍스트').closest('button');
    if (button) {
      fireEvent.keyDown(button, { key: ' ' });
      expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
    }
  });

  it('disabled 상태일 때 클릭이 작동하지 않아야 함', () => {
    render(<AccessibleButton {...defaultProps} disabled={true} />);
    
    const button = screen.getByText('버튼 텍스트').closest('button') as HTMLButtonElement;
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(defaultProps.onClick).not.toHaveBeenCalled();
  });

  it('disabled 상태일 때 키보드 이벤트가 작동하지 않아야 함', () => {
    render(<AccessibleButton {...defaultProps} disabled={true} />);
    
    const button = screen.getByText('버튼 텍스트').closest('button');
    if (button) {
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(defaultProps.onClick).not.toHaveBeenCalled();
    }
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
    
    const button = screen.getByText('버튼 텍스트').closest('button');
    expect(button).toHaveAttribute('aria-describedby', 'description');
  });

  it('type prop이 올바르게 적용되어야 함', () => {
    render(<AccessibleButton {...defaultProps} type="submit" />);
    
    const button = screen.getByText('버튼 텍스트').closest('button') as HTMLButtonElement;
    expect(button.type).toBe('submit');
  });

  it('variant prop이 올바르게 적용되어야 함', () => {
    const { container } = render(<AccessibleButton {...defaultProps} variant="danger" />);
    
    const button = container.querySelector('.btn-danger');
    expect(button).toBeInTheDocument();
  });

  it('size prop이 올바르게 적용되어야 함', () => {
    const { container } = render(<AccessibleButton {...defaultProps} size="lg" />);
    
    const button = container.querySelector('.btn-lg');
    expect(button).toBeInTheDocument();
  });

  it('className이 올바르게 적용되어야 함', () => {
    const { container } = render(<AccessibleButton {...defaultProps} className="custom-class" />);
    
    const button = container.querySelector('.custom-class');
    expect(button).toBeInTheDocument();
  });

  it('아이콘이 왼쪽에 표시되어야 함', () => {
    const icon = <span data-testid="icon">🔍</span>;
    render(<AccessibleButton {...defaultProps} icon={icon} iconPosition="left" />);
    
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    const iconContainer = screen.getByTestId('icon').parentElement;
    expect(iconContainer?.className).toContain('btn-icon-left');
  });

  it('아이콘이 오른쪽에 표시되어야 함', () => {
    const icon = <span data-testid="icon">🔍</span>;
    render(<AccessibleButton {...defaultProps} icon={icon} iconPosition="right" />);
    
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    const iconContainer = screen.getByTestId('icon').parentElement;
    expect(iconContainer?.className).toContain('btn-icon-right');
  });

  it('disabled 상태일 때 tabIndex가 -1이어야 함', () => {
    const { container } = render(<AccessibleButton {...defaultProps} disabled={true} />);
    
    const button = container.querySelector('button');
    expect(button).toHaveAttribute('tabIndex', '-1');
  });

  it('활성 상태일 때 tabIndex가 0이어야 함', () => {
    const { container } = render(<AccessibleButton {...defaultProps} />);
    
    const button = container.querySelector('button');
    expect(button).toHaveAttribute('tabIndex', '0');
  });

  it('aria-disabled 속성이 올바르게 설정되어야 함', () => {
    render(<AccessibleButton {...defaultProps} disabled={true} />);
    
    const button = screen.getByText('버튼 텍스트').closest('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });
});

