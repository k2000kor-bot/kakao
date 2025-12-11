/**
 * MessageReply 컴포넌트 테스트
 * 메시지 인용/답장 기능 확인
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MessageReply, { QuotedMessage } from '../MessageReply';

describe('MessageReply', () => {
  const mockQuotedMessage: QuotedMessage = {
    id: 1,
    sender: 'user',
    text: '인용된 메시지 텍스트입니다.',
    timestamp: '2025-01-27 12:00:00',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('기본 렌더링이 올바르게 작동해야 함', () => {
    render(<MessageReply quotedMessage={mockQuotedMessage} />);
    expect(screen.getByText('인용된 메시지 텍스트입니다.')).toBeInTheDocument();
  });

  it('인용된 메시지 정보가 올바르게 표시되어야 함', () => {
    render(<MessageReply quotedMessage={mockQuotedMessage} />);
    expect(screen.getByText(/👤 사용자/)).toBeInTheDocument();
    expect(screen.getByText('2025-01-27 12:00:00')).toBeInTheDocument();
  });

  it('AI 메시지가 올바르게 표시되어야 함', () => {
    const aiMessage: QuotedMessage = {
      ...mockQuotedMessage,
      sender: 'ai',
    };
    render(<MessageReply quotedMessage={aiMessage} />);
    expect(screen.getByText(/🤖 AI/)).toBeInTheDocument();
  });

  it('onClose가 제공되면 닫기 버튼이 표시되어야 함', () => {
    const mockOnClose = jest.fn();
    render(<MessageReply quotedMessage={mockQuotedMessage} onClose={mockOnClose} />);
    
    const closeButton = screen.getByLabelText('인용 닫기');
    expect(closeButton).toBeInTheDocument();
  });

  it('onClose가 없으면 닫기 버튼이 표시되지 않아야 함', () => {
    render(<MessageReply quotedMessage={mockQuotedMessage} />);
    expect(screen.queryByLabelText('인용 닫기')).not.toBeInTheDocument();
  });

  it('닫기 버튼 클릭 시 onClose가 호출되어야 함', () => {
    const mockOnClose = jest.fn();
    render(<MessageReply quotedMessage={mockQuotedMessage} onClose={mockOnClose} />);
    
    const closeButton = screen.getByLabelText('인용 닫기');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('compact 모드에서 텍스트가 잘려서 표시되어야 함', () => {
    const longText = 'a'.repeat(150);
    const longMessage: QuotedMessage = {
      ...mockQuotedMessage,
      text: longText,
    };
    
    render(<MessageReply quotedMessage={longMessage} compact={true} />);
    
    const displayedText = screen.getByText(/a{100}.../);
    expect(displayedText).toBeInTheDocument();
  });

  it('compact 모드가 아닐 때 전체 텍스트가 표시되어야 함', () => {
    const longText = 'a'.repeat(150);
    const longMessage: QuotedMessage = {
      ...mockQuotedMessage,
      text: longText,
    };
    
    render(<MessageReply quotedMessage={longMessage} compact={false} />);
    
    expect(screen.getByText(longText)).toBeInTheDocument();
  });

  it('짧은 텍스트는 compact 모드에서도 잘리지 않아야 함', () => {
    render(<MessageReply quotedMessage={mockQuotedMessage} compact={true} />);
    expect(screen.getByText('인용된 메시지 텍스트입니다.')).toBeInTheDocument();
  });

  it('여러 줄 텍스트가 올바르게 표시되어야 함', () => {
    const multiLineText = '첫 번째 줄\n두 번째 줄\n세 번째 줄';
    const multiLineMessage: QuotedMessage = {
      ...mockQuotedMessage,
      text: multiLineText,
    };
    
    render(<MessageReply quotedMessage={multiLineMessage} />);
    // whiteSpace: 'pre-line'으로 인해 여러 줄로 표시되므로 각 줄을 개별적으로 확인
    expect(screen.getByText(/첫 번째 줄/)).toBeInTheDocument();
    expect(screen.getByText(/두 번째 줄/)).toBeInTheDocument();
    expect(screen.getByText(/세 번째 줄/)).toBeInTheDocument();
  });

  it('접근성 속성이 올바르게 설정되어야 함', () => {
    render(<MessageReply quotedMessage={mockQuotedMessage} />);
    
    const replyElement = screen.getByLabelText('인용된 메시지');
    expect(replyElement).toBeInTheDocument();
    expect(replyElement).toHaveAttribute('role', 'region');
  });
});

