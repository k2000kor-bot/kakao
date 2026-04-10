/**
 * QuickReplies 컴포넌트 테스트
 * 빠른 답장 제안 기능 확인
 */
/* eslint-disable testing-library/no-node-access */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { setupCommonMocks } from '../../test-utils/testHelpers';
import QuickReplies, { QuickReply } from '../Chat/QuickReplies';

// Mock CSS
jest.mock('../Chat/QuickReplies.css', () => ({}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, onClick, ...props }: React.PropsWithChildren<{ onClick?: () => void; [key: string]: unknown }>) => (
      <button onClick={onClick} {...props}>
        {children}
      </button>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Sparkles: ({ size, className }: { size?: number; className?: string }) => (
    <svg data-testid="sparkles-icon" data-size={size} className={className} />
  ),
  ChevronRight: ({ size, className }: { size?: number; className?: string }) => (
    <svg data-testid="chevron-right-icon" data-size={size} className={className} />
  ),
}));

describe('QuickReplies', () => {
  const mockReplies: QuickReply[] = [
    { id: '1', text: '네, 알겠습니다', category: 'confirmation' },
    { id: '2', text: '고마워요!', category: 'gratitude' },
    { id: '3', text: '더 자세히 알려주세요', category: 'request' },
  ];

  const mockOnReplyClick = jest.fn();

  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('빠른 답장 목록이 없을 때 렌더링되지 않아야 함', () => {
      const { container } = render(
        <QuickReplies replies={[]} onReplyClick={mockOnReplyClick} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('빠른 답장 목록이 있을 때 컨테이너가 렌더링되어야 함', () => {
      render(<QuickReplies replies={mockReplies} onReplyClick={mockOnReplyClick} />);

      expect(screen.getByRole('region', { name: '빠른 답장 제안' })).toBeInTheDocument();
    });

    it('헤더와 아이콘이 표시되어야 함', () => {
      render(<QuickReplies replies={mockReplies} onReplyClick={mockOnReplyClick} />);

      expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument();
      expect(screen.getByText('제안된 답변')).toBeInTheDocument();
    });
  });

  describe('빠른 답장 목록', () => {
    it('모든 빠른 답장이 표시되어야 함', () => {
      render(<QuickReplies replies={mockReplies} onReplyClick={mockOnReplyClick} />);

      expect(screen.getByText('네, 알겠습니다')).toBeInTheDocument();
      expect(screen.getByText('고마워요!')).toBeInTheDocument();
      expect(screen.getByText('더 자세히 알려주세요')).toBeInTheDocument();
    });

    it('각 빠른 답장에 ChevronRight 아이콘이 표시되어야 함', () => {
      render(<QuickReplies replies={mockReplies} onReplyClick={mockOnReplyClick} />);

      const chevronIcons = screen.getAllByTestId('chevron-right-icon');
      expect(chevronIcons).toHaveLength(3);
    });

    it('빠른 답장 버튼이 올바른 aria-label을 가져야 함', () => {
      render(<QuickReplies replies={mockReplies} onReplyClick={mockOnReplyClick} />);

      expect(screen.getByLabelText('네, 알겠습니다 제안 사용')).toBeInTheDocument();
      expect(screen.getByLabelText('고마워요! 제안 사용')).toBeInTheDocument();
      expect(screen.getByLabelText('더 자세히 알려주세요 제안 사용')).toBeInTheDocument();
    });
  });

  describe('클릭 이벤트', () => {
    it('빠른 답장을 클릭하면 onReplyClick이 호출되어야 함', () => {
      render(<QuickReplies replies={mockReplies} onReplyClick={mockOnReplyClick} />);

      const firstReply = screen.getByText('네, 알겠습니다');
      fireEvent.click(firstReply);

      expect(mockOnReplyClick).toHaveBeenCalledTimes(1);
      expect(mockOnReplyClick).toHaveBeenCalledWith(mockReplies[0]);
    });

    it('여러 빠른 답장을 클릭하면 각각 onReplyClick이 호출되어야 함', () => {
      render(<QuickReplies replies={mockReplies} onReplyClick={mockOnReplyClick} />);

      fireEvent.click(screen.getByText('네, 알겠습니다'));
      fireEvent.click(screen.getByText('고마워요!'));
      fireEvent.click(screen.getByText('더 자세히 알려주세요'));

      expect(mockOnReplyClick).toHaveBeenCalledTimes(3);
      expect(mockOnReplyClick).toHaveBeenNthCalledWith(1, mockReplies[0]);
      expect(mockOnReplyClick).toHaveBeenNthCalledWith(2, mockReplies[1]);
      expect(mockOnReplyClick).toHaveBeenNthCalledWith(3, mockReplies[2]);
    });
  });

  describe('단일 빠른 답장', () => {
    it('빠른 답장이 하나만 있을 때도 올바르게 렌더링되어야 함', () => {
      const singleReply: QuickReply[] = [{ id: '1', text: '네', category: 'confirmation' }];

      render(<QuickReplies replies={singleReply} onReplyClick={mockOnReplyClick} />);

      expect(screen.getByText('네')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-right-icon')).toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('컨테이너가 올바른 role과 aria-label을 가져야 함', () => {
      render(<QuickReplies replies={mockReplies} onReplyClick={mockOnReplyClick} />);

      const container = screen.getByRole('region', { name: '빠른 답장 제안' });
      expect(container).toBeInTheDocument();
    });

    it('각 빠른 답장 버튼이 접근 가능해야 함', () => {
      render(<QuickReplies replies={mockReplies} onReplyClick={mockOnReplyClick} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(3);
    });
  });
});

