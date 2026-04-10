/**
 * MessageActions 컴포넌트 테스트
 * 메시지 액션 기능 테스트
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { setupCommonMocks } from '../../test-utils/testHelpers';
import MessageActions from '../MessageActions';
import { errorLogger } from '../../utils/errorLogger';

// errorLogger 모킹
jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    error: jest.fn(),
  },
}));


describe('MessageActions', () => {
  const defaultProps = {
    messageId: 1,
    messageText: 'Test message',
    showActions: true,
  };

  beforeEach(() => {
    setupCommonMocks();
    jest.clearAllMocks();
    // navigator.clipboard 모킹 재설정
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    });
  });

  it('기본 렌더링이 올바르게 작동해야 함', () => {
    render(<MessageActions {...defaultProps} />);
    expect(screen.getByRole('button', { name: /복사/i })).toBeInTheDocument();
  });

  it('복사 버튼 클릭 시 클립보드에 복사해야 함', async () => {
    const onCopy = jest.fn();

    render(<MessageActions {...defaultProps} onCopy={onCopy} />);

    const copyButton = screen.getByRole('button', { name: /복사/i });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test message');
    });
    expect(onCopy).toHaveBeenCalledWith('Test message');
  });

  it('복사 성공 시 피드백을 표시해야 함', async () => {
    render(<MessageActions {...defaultProps} />);

    const copyButton = screen.getByRole('button', { name: /복사/i });
    fireEvent.click(copyButton);

    // 비동기 상태 업데이트 대기
    await waitFor(() => {
      expect(screen.getByText(/복사됨/i)).toBeInTheDocument();
    }, { timeout: 2000 });

    // 복사됨 상태 확인
    expect(screen.getByText(/복사됨/i)).toBeInTheDocument();
  });

  it('복사 실패 시 에러 로깅해야 함', async () => {
    const error = new Error('Clipboard write failed');
    jest.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(error);

    render(<MessageActions {...defaultProps} />);

    const copyButton = screen.getByRole('button', { name: /복사/i });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(errorLogger.error).toHaveBeenCalledWith('복사 실패', error);
    });
  });

  it('재생성 버튼 클릭 시 onRegenerate가 호출되어야 함', () => {
    const onRegenerate = jest.fn();

    render(<MessageActions {...defaultProps} onRegenerate={onRegenerate} isAssistant={true} />);

    const regenerateButton = screen.getByRole('button', { name: /재생성/i });
    fireEvent.click(regenerateButton);

    expect(onRegenerate).toHaveBeenCalledWith(1);
  });

  it('수정 요청 버튼 클릭 시 onModifyRequest가 호출되어야 함', () => {
    const onModifyRequest = jest.fn();

    render(<MessageActions {...defaultProps} onModifyRequest={onModifyRequest} isAssistant={true} />);

    const modifyButton = screen.getByRole('button', { name: /수정 요청/i });
    fireEvent.click(modifyButton);

    expect(onModifyRequest).toHaveBeenCalledWith(1);
  });

  it('좋아요 버튼 클릭 시 onLike가 호출되어야 함', () => {
    const onLike = jest.fn();

    render(<MessageActions {...defaultProps} onLike={onLike} isAssistant={true} />);

    const likeButton = screen.getByRole('button', { name: /좋아요/i });
    fireEvent.click(likeButton);

    expect(onLike).toHaveBeenCalledWith(1);
  });

  it('싫어요 버튼 클릭 시 onDislike가 호출되어야 함', () => {
    const onDislike = jest.fn();

    render(<MessageActions {...defaultProps} onDislike={onDislike} isAssistant={true} />);

    const dislikeButton = screen.getByRole('button', { name: /싫어요/i });
    fireEvent.click(dislikeButton);

    expect(onDislike).toHaveBeenCalledWith(1);
  });

  it('북마크 버튼 클릭 시 onBookmark가 호출되어야 함', () => {
    const onBookmark = jest.fn();

    render(<MessageActions {...defaultProps} onBookmark={onBookmark} />);

    const bookmarkButton = screen.getByRole('button', { name: /북마크|즐겨찾기/i });
    fireEvent.click(bookmarkButton);

    expect(onBookmark).toHaveBeenCalledWith(1);
  });

  it('좋아요 상태일 때 활성화된 스타일을 표시해야 함', () => {
    render(<MessageActions {...defaultProps} isLiked={true} isAssistant={true} onLike={jest.fn()} />);

    const likeButton = screen.getByRole('button', { name: /좋아요 취소/i });
    expect(likeButton).toHaveClass('liked');
  });

  it('싫어요 상태일 때 활성화된 스타일을 표시해야 함', () => {
    render(<MessageActions {...defaultProps} isDisliked={true} isAssistant={true} onDislike={jest.fn()} />);

    const dislikeButton = screen.getByRole('button', { name: /싫어요 취소/i });
    expect(dislikeButton).toHaveClass('disliked');
  });

  it('북마크 상태일 때 활성화된 스타일을 표시해야 함', () => {
    render(<MessageActions {...defaultProps} isBookmarked={true} onBookmark={jest.fn()} />);

    const bookmarkButton = screen.getByRole('button', { name: /즐겨찾기 제거/i });
    expect(bookmarkButton).toHaveClass('bookmarked');
  });

  it('showActions가 false일 때 액션 버튼을 숨겨야 함', () => {
    render(<MessageActions {...defaultProps} showActions={false} />);

    expect(screen.queryByRole('button', { name: /복사/i })).not.toBeInTheDocument();
  });

  it('편집 가능한 메시지일 때 편집 버튼을 표시해야 함', () => {
    render(<MessageActions {...defaultProps} canEdit={true} onEdit={jest.fn()} />);

    expect(screen.getByRole('button', { name: /편집/i })).toBeInTheDocument();
  });

  it('편집 불가능한 메시지일 때 편집 버튼을 숨겨야 함', () => {
    render(<MessageActions {...defaultProps} canEdit={false} />);

    expect(screen.queryByRole('button', { name: /편집/i })).not.toBeInTheDocument();
  });

  it('답장 버튼 클릭 시 onReply가 호출되어야 함', () => {
    const onReply = jest.fn();

    render(<MessageActions {...defaultProps} onReply={onReply} />);

    const replyButton = screen.getByRole('button', { name: /답장/i });
    fireEvent.click(replyButton);

    expect(onReply).toHaveBeenCalledWith(1);
  });
});

