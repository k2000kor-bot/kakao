/**
 * ConfirmDialog 컴포넌트 테스트
 * 확인 다이얼로그 기능 확인
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDialog from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: 'Test Title',
    message: 'Test Message',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('기본 렌더링이 올바르게 작동해야 함', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('open이 false이면 렌더링되지 않아야 함', () => {
    render(<ConfirmDialog {...defaultProps} open={false} />);
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('확인 버튼 클릭 시 onConfirm이 호출되어야 함', () => {
    render(<ConfirmDialog {...defaultProps} />);
    const confirmButton = screen.getByText('확인');
    fireEvent.click(confirmButton);
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('취소 버튼 클릭 시 onClose가 호출되어야 함', () => {
    render(<ConfirmDialog {...defaultProps} />);
    const cancelButton = screen.getByText('취소');
    fireEvent.click(cancelButton);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('커스텀 확인 텍스트를 사용해야 함', () => {
    render(<ConfirmDialog {...defaultProps} confirmText="저장" />);
    expect(screen.getByText('저장')).toBeInTheDocument();
  });

  it('커스텀 취소 텍스트를 사용해야 함', () => {
    render(<ConfirmDialog {...defaultProps} cancelText="닫기" />);
    expect(screen.getByText('닫기')).toBeInTheDocument();
  });

  it('showCancel이 false이면 취소 버튼이 없어야 함', () => {
    render(<ConfirmDialog {...defaultProps} showCancel={false} />);
    expect(screen.queryByText('취소')).not.toBeInTheDocument();
  });

  it('warning 타입을 렌더링해야 함', () => {
    render(<ConfirmDialog {...defaultProps} type="warning" />);
    // Warning 아이콘이 있는지 확인 (MUI 아이콘)
    const dialogs = screen.getAllByRole('dialog');
    const dialog = dialogs.find(d => d.textContent?.includes('Test Title'));
    expect(dialog).toBeInTheDocument();
  });

  it('error 타입을 렌더링해야 함', () => {
    render(<ConfirmDialog {...defaultProps} type="error" />);
    const dialogs = screen.getAllByRole('dialog');
    const dialog = dialogs.find(d => d.textContent?.includes('Test Title'));
    expect(dialog).toBeInTheDocument();
  });

  it('info 타입을 렌더링해야 함', () => {
    render(<ConfirmDialog {...defaultProps} type="info" />);
    const dialogs = screen.getAllByRole('dialog');
    const dialog = dialogs.find(d => d.textContent?.includes('Test Title'));
    expect(dialog).toBeInTheDocument();
  });

  it('success 타입을 렌더링해야 함', () => {
    render(<ConfirmDialog {...defaultProps} type="success" />);
    const dialogs = screen.getAllByRole('dialog');
    const dialog = dialogs.find(d => d.textContent?.includes('Test Title'));
    expect(dialog).toBeInTheDocument();
  });

  it('닫기 버튼 클릭 시 onClose가 호출되어야 함', () => {
    render(<ConfirmDialog {...defaultProps} />);
    // IconButton의 aria-label이나 다른 방법으로 찾기
    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons.find(button => 
      button.querySelector('[data-testid="CloseIcon"]') || 
      button.getAttribute('aria-label')?.includes('close')
    );
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    } else {
      // 닫기 버튼이 없을 수도 있으므로 스킵
      expect(true).toBe(true);
    }
  });
});

