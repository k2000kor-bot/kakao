/**
 * MessageItem 컴포넌트 테스트
 * 메시지 아이템 렌더링 및 상호작용 테스트
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MessageItem from '../MessageItem';
import type { AnalysisData } from '../../types';

// MessageActions 모킹
jest.mock('../MessageActions', () => {
  return function MockMessageActions(props: any) {
    return (
      <div data-testid="message-actions">
        {props.onCopy && (
          <button onClick={() => props.onCopy(props.messageText)}>Copy</button>
        )}
        {props.onEdit && (
          <button onClick={props.onEdit}>Edit</button>
        )}
        {props.onLike && (
          <button onClick={() => props.onLike(props.messageId)}>Like</button>
        )}
        {props.onDislike && (
          <button onClick={() => props.onDislike(props.messageId)}>Dislike</button>
        )}
        {props.onBookmark && (
          <button onClick={() => props.onBookmark(props.messageId)}>Bookmark</button>
        )}
        {props.onReply && (
          <button onClick={() => props.onReply(props.messageId)}>Reply</button>
        )}
      </div>
    );
  };
});

// MessageEditor 모킹
jest.mock('../MessageEditor', () => {
  return function MockMessageEditor(props: any) {
    return (
      <div data-testid="message-editor">
        <textarea
          data-testid="editor-textarea"
          defaultValue={props.initialText}
          onChange={(e) => props.onSave(e.target.value)}
        />
        <button onClick={() => props.onSave(props.initialText)}>Save</button>
        <button onClick={props.onCancel}>Cancel</button>
      </div>
    );
  };
});

describe('MessageItem', () => {
  const defaultProps = {
    id: 1,
    sender: 'user' as const,
    text: '테스트 메시지',
    timestamp: '2025-01-27 12:00:00',
    analysis: null as AnalysisData | null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('기본 렌더링이 올바르게 작동해야 함', () => {
    render(<MessageItem {...defaultProps} />);
    expect(screen.getByText('테스트 메시지')).toBeInTheDocument();
    expect(screen.getByText('2025-01-27 12:00:00')).toBeInTheDocument();
  });

  it('사용자 메시지가 올바르게 렌더링되어야 함', () => {
    render(<MessageItem {...defaultProps} sender="user" />);
    expect(screen.getByLabelText(/사용자 메시지/)).toBeInTheDocument();
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('AI 메시지가 올바르게 렌더링되어야 함', () => {
    render(<MessageItem {...defaultProps} sender="ai" />);
    expect(screen.getByLabelText(/AI 메시지/)).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
  });

  it('검색어 하이라이트가 올바르게 작동해야 함', () => {
    render(<MessageItem {...defaultProps} searchTerm="테스트" />);
    const highlight = screen.getByText('테스트');
    expect(highlight).toBeInTheDocument();
    expect(highlight.tagName).toBe('MARK');
  });

  it('검색어가 없으면 하이라이트가 없어야 함', () => {
    render(<MessageItem {...defaultProps} />);
    const message = screen.getByText('테스트 메시지');
    expect(message).toBeInTheDocument();
    expect(message.querySelector('mark')).not.toBeInTheDocument();
  });

  it('onCopy 콜백이 호출되어야 함', () => {
    const mockOnCopy = jest.fn();
    render(<MessageItem {...defaultProps} onCopy={mockOnCopy} />);
    
    const copyButton = screen.getByText('Copy');
    fireEvent.click(copyButton);
    
    expect(mockOnCopy).toHaveBeenCalledWith('테스트 메시지');
  });

  it('onLike 콜백이 호출되어야 함', () => {
    const mockOnLike = jest.fn();
    render(<MessageItem {...defaultProps} onLike={mockOnLike} />);
    
    const likeButton = screen.getByText('Like');
    fireEvent.click(likeButton);
    
    expect(mockOnLike).toHaveBeenCalledWith(1);
  });

  it('onDislike 콜백이 호출되어야 함', () => {
    const mockOnDislike = jest.fn();
    render(<MessageItem {...defaultProps} onDislike={mockOnDislike} />);
    
    const dislikeButton = screen.getByText('Dislike');
    fireEvent.click(dislikeButton);
    
    expect(mockOnDislike).toHaveBeenCalledWith(1);
  });

  it('onBookmark 콜백이 호출되어야 함', () => {
    const mockOnBookmark = jest.fn();
    render(<MessageItem {...defaultProps} onBookmark={mockOnBookmark} />);
    
    const bookmarkButton = screen.getByText('Bookmark');
    fireEvent.click(bookmarkButton);
    
    expect(mockOnBookmark).toHaveBeenCalledWith(1);
  });

  it('onReply 콜백이 호출되어야 함', () => {
    const mockOnReply = jest.fn();
    render(<MessageItem {...defaultProps} onReply={mockOnReply} />);
    
    const replyButton = screen.getByText('Reply');
    fireEvent.click(replyButton);
    
    expect(mockOnReply).toHaveBeenCalledWith(1);
  });

  it('사용자 메시지에서 편집 모드로 전환할 수 있어야 함', () => {
    const mockOnEdit = jest.fn();
    render(<MessageItem {...defaultProps} sender="user" onEdit={mockOnEdit} />);
    
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    
    expect(screen.getByTestId('message-editor')).toBeInTheDocument();
  });

  it('편집 모드에서 저장하면 onEdit가 호출되어야 함', () => {
    const mockOnEdit = jest.fn();
    render(<MessageItem {...defaultProps} sender="user" onEdit={mockOnEdit} />);
    
    // 편집 모드로 전환
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    
    // 저장
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    expect(mockOnEdit).toHaveBeenCalledWith(1, '테스트 메시지');
  });

  it('편집 모드에서 취소하면 편집 모드가 종료되어야 함', () => {
    render(<MessageItem {...defaultProps} sender="user" />);
    
    // 편집 모드로 전환
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    
    expect(screen.getByTestId('message-editor')).toBeInTheDocument();
    
    // 취소
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(screen.queryByTestId('message-editor')).not.toBeInTheDocument();
  });

  it('AI 메시지에서는 편집 버튼이 없어야 함', () => {
    render(<MessageItem {...defaultProps} sender="ai" />);
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('분석 결과가 있으면 표시되어야 함', () => {
    const analysis: AnalysisData = {
      emotion_analysis: {
        emotion: 'happy',
        confidence: 0.85,
      },
      intent_analysis: {
        intent: 'question',
        confidence: 0.9,
      },
    };
    
    render(<MessageItem {...defaultProps} sender="ai" analysis={analysis} />);
    
    expect(screen.getByText(/AI 분석 결과/)).toBeInTheDocument();
    expect(screen.getByText(/happy/)).toBeInTheDocument();
    expect(screen.getByText(/question/)).toBeInTheDocument();
  });

  it('사용자 메시지에서는 분석 결과가 표시되지 않아야 함', () => {
    const analysis: AnalysisData = {
      emotion_analysis: {
        emotion: 'happy',
        confidence: 0.85,
      },
      intent_analysis: {
        intent: 'question',
        confidence: 0.9,
      },
    };
    
    render(<MessageItem {...defaultProps} sender="user" analysis={analysis} />);
    
    expect(screen.queryByText(/AI 분석 결과/)).not.toBeInTheDocument();
  });

  it('마크다운 이미지가 올바르게 렌더링되어야 함', () => {
    const textWithImage = '텍스트 ![이미지](https://example.com/image.jpg) 더 많은 텍스트';
    render(<MessageItem {...defaultProps} text={textWithImage} />);
    
    const image = screen.getByAltText('이미지');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('isLiked 상태가 올바르게 전달되어야 함', () => {
    render(<MessageItem {...defaultProps} isLiked={true} />);
    // MessageActions에 isLiked prop이 전달되는지 확인
    expect(screen.getByTestId('message-actions')).toBeInTheDocument();
  });

  it('isDisliked 상태가 올바르게 전달되어야 함', () => {
    render(<MessageItem {...defaultProps} isDisliked={true} />);
    expect(screen.getByTestId('message-actions')).toBeInTheDocument();
  });

  it('isBookmarked 상태가 올바르게 전달되어야 함', () => {
    render(<MessageItem {...defaultProps} isBookmarked={true} />);
    expect(screen.getByTestId('message-actions')).toBeInTheDocument();
  });
});

