/**
 * ReadReceipts 컴포넌트 테스트
 * 읽음 확인 기능 확인
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { setupCommonMocks } from '../../test-utils/testHelpers';
import ReadReceipts, { ReadReceipt } from '../Chat/ReadReceipts';

// Mock CSS
jest.mock('../Chat/ReadReceipts.css', () => ({}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Check: ({ size, className }: { size?: number; className?: string }) => (
    <svg data-testid="check-icon" data-size={size} className={className} />
  ),
  CheckCheck: ({ size, className }: { size?: number; className?: string }) => (
    <svg data-testid="check-check-icon" data-size={size} className={className} />
  ),
}));

describe('ReadReceipts', () => {
  const currentUserId = 'user1';
  const messageId = 'msg1';

  beforeEach(() => {
    setupCommonMocks();
  });

  describe('기본 렌더링', () => {
    it('읽음 확인이 없을 때 단일 체크 아이콘을 표시해야 함', () => {
      render(
        <ReadReceipts
          messageId={messageId}
          receipts={[]}
          currentUserId={currentUserId}
        />
      );

      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
      expect(screen.getByLabelText('전송됨')).toBeInTheDocument();
      expect(screen.queryByTestId('check-check-icon')).not.toBeInTheDocument();
    });

    it('현재 사용자의 읽음 확인만 있을 때 단일 체크 아이콘을 표시해야 함', () => {
      const receipts: ReadReceipt[] = [
        {
          messageId,
          userId: currentUserId,
          readAt: new Date(),
        },
      ];

      render(
        <ReadReceipts
          messageId={messageId}
          receipts={receipts}
          currentUserId={currentUserId}
        />
      );

      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('check-check-icon')).not.toBeInTheDocument();
    });
  });

  describe('읽음 확인 표시', () => {
    it('다른 사용자가 읽었을 때 이중 체크 아이콘을 표시해야 함', () => {
      const receipts: ReadReceipt[] = [
        {
          messageId,
          userId: 'user2',
          readAt: new Date('2024-01-01T10:00:00'),
        },
      ];

      render(
        <ReadReceipts
          messageId={messageId}
          receipts={receipts}
          currentUserId={currentUserId}
        />
      );

      expect(screen.getByTestId('check-check-icon')).toBeInTheDocument();
      expect(screen.getByLabelText(/1명이 읽음/)).toBeInTheDocument();
      expect(screen.queryByTestId('check-icon')).not.toBeInTheDocument();
    });

    it('여러 사용자가 읽었을 때 읽은 사용자 수를 표시해야 함', () => {
      const receipts: ReadReceipt[] = [
        {
          messageId,
          userId: 'user2',
          readAt: new Date('2024-01-01T10:00:00'),
        },
        {
          messageId,
          userId: 'user3',
          readAt: new Date('2024-01-01T10:05:00'),
        },
        {
          messageId,
          userId: currentUserId,
          readAt: new Date('2024-01-01T10:10:00'),
        },
      ];

      render(
        <ReadReceipts
          messageId={messageId}
          receipts={receipts}
          currentUserId={currentUserId}
        />
      );

      expect(screen.getByTestId('check-check-icon')).toBeInTheDocument();
      expect(screen.getByLabelText(/2명이 읽음/)).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('한 명만 읽었을 때는 읽은 사용자 수를 표시하지 않아야 함', () => {
      const receipts: ReadReceipt[] = [
        {
          messageId,
          userId: 'user2',
          readAt: new Date('2024-01-01T10:00:00'),
        },
      ];

      render(
        <ReadReceipts
          messageId={messageId}
          receipts={receipts}
          currentUserId={currentUserId}
        />
      );

      expect(screen.getByTestId('check-check-icon')).toBeInTheDocument();
      expect(screen.queryByText('1')).not.toBeInTheDocument();
    });
  });

  describe('툴팁', () => {
    it('showTooltip이 true일 때 툴팁을 표시해야 함', () => {
      const readAt = new Date('2024-01-01T10:00:00');
      const receipts: ReadReceipt[] = [
        {
          messageId,
          userId: 'user2',
          readAt,
        },
      ];

      render(
        <ReadReceipts
          messageId={messageId}
          receipts={receipts}
          currentUserId={currentUserId}
          showTooltip={true}
        />
      );

      const element = screen.getByLabelText(/1명이 읽음/);
      expect(element).toHaveAttribute('title');
      expect(element.getAttribute('title')).toContain('읽음');
    });

    it('showTooltip이 false일 때 툴팁을 표시하지 않아야 함', () => {
      const receipts: ReadReceipt[] = [
        {
          messageId,
          userId: 'user2',
          readAt: new Date('2024-01-01T10:00:00'),
        },
      ];

      render(
        <ReadReceipts
          messageId={messageId}
          receipts={receipts}
          currentUserId={currentUserId}
          showTooltip={false}
        />
      );

      const element = screen.getByLabelText(/1명이 읽음/);
      expect(element).not.toHaveAttribute('title');
    });
  });

  describe('최신 읽음 시간', () => {
    it('여러 읽음 확인 중 가장 최신 시간을 툴팁에 표시해야 함', () => {
      const receipts: ReadReceipt[] = [
        {
          messageId,
          userId: 'user2',
          readAt: new Date('2024-01-01T10:00:00'),
        },
        {
          messageId,
          userId: 'user3',
          readAt: new Date('2024-01-01T10:05:00'),
        },
      ];

      render(
        <ReadReceipts
          messageId={messageId}
          receipts={receipts}
          currentUserId={currentUserId}
          showTooltip={true}
        />
      );

      const element = screen.getByLabelText(/2명이 읽음/);
      const title = element.getAttribute('title');
      expect(title).toBeTruthy();
      // 최신 시간(10:05:00)이 포함되어야 함
    });
  });
});

