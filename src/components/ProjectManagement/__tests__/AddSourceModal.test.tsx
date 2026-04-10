/**
 * AddSourceModal 컴포넌트 테스트
 * 소스 추가 모달 렌더링·제목·닫기·업로드/텍스트/드라이브/Slack 버튼 확인
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddSourceModal from '../AddSourceModal';

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => React.createElement('div', props, children),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  };
});

describe('AddSourceModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('isOpen이 false일 때 아무것도 렌더하지 않음', () => {
    render(<AddSourceModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('소스 추가')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('isOpen이 true일 때 제목 "소스 추가"와 드래그 안내 문구가 보여야 함', () => {
    render(<AddSourceModal {...defaultProps} />);
    expect(screen.getByRole('dialog', { name: /소스 추가/i })).toBeInTheDocument();
    expect(screen.getByText('소스 추가')).toBeInTheDocument();
    expect(screen.getByText('여기에 소스를 드래그하세요')).toBeInTheDocument();
  });

  it('닫기 버튼 클릭 시 onClose가 호출되어야 함', async () => {
    const onClose = jest.fn();
    render(<AddSourceModal {...defaultProps} onClose={onClose} />);
    const closeBtn = screen.getByRole('button', { name: '닫기' });
    await userEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('업로드·텍스트 입력·Google 드라이브·Slack 버튼이 있어야 함', () => {
    render(<AddSourceModal {...defaultProps} />);
    expect(screen.getByRole('button', { name: '파일 업로드' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '텍스트 입력' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Google 드라이브' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Slack' })).toBeInTheDocument();
  });

  it('텍스트 입력 클릭 시 onTextInputClick 호출 후 onClose 호출', async () => {
    const onClose = jest.fn();
    const onTextInputClick = jest.fn();
    render(<AddSourceModal {...defaultProps} onClose={onClose} onTextInputClick={onTextInputClick} />);
    await userEvent.click(screen.getByRole('button', { name: '텍스트 입력' }));
    expect(onTextInputClick).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('onUploadClick만 있을 때 업로드 클릭 시 onClose 후 onUploadClick 호출', async () => {
    const onClose = jest.fn();
    const onUploadClick = jest.fn();
    render(<AddSourceModal {...defaultProps} onClose={onClose} onUploadClick={onUploadClick} />);
    await userEvent.click(screen.getByRole('button', { name: '파일 업로드' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onUploadClick).toHaveBeenCalledTimes(1);
  });

  it('Google 드라이브 클릭 시 onGoogleDriveClick이 있으면 호출하고 onClose는 호출하지 않음', async () => {
    const onClose = jest.fn();
    const onGoogleDriveClick = jest.fn();
    render(<AddSourceModal {...defaultProps} onClose={onClose} onGoogleDriveClick={onGoogleDriveClick} />);
    await userEvent.click(screen.getByRole('button', { name: 'Google 드라이브' }));
    expect(onGoogleDriveClick).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('Slack 클릭 시 onSlackClick이 있으면 호출하고 onClose는 호출하지 않음', async () => {
    const onClose = jest.fn();
    const onSlackClick = jest.fn();
    render(<AddSourceModal {...defaultProps} onClose={onClose} onSlackClick={onSlackClick} />);
    await userEvent.click(screen.getByRole('button', { name: 'Slack' }));
    expect(onSlackClick).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });
});
