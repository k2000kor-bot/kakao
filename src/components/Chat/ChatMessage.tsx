/**
 * ChatMessage 컴포넌트
 * PureChatGPTInterface에서 분리된 메시지 렌더링 컴포넌트
 * Task-C1: 접근성 개선 및 성능 최적화
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useLazyLoading } from '../../hooks/useLazyLoading';
import { MessageEditForm } from './MessageEditForm';
import { MessageActions } from './MessageActions';
import { MessageContent } from './MessageContent';
import MessageReactions from './MessageReactions';
// ReadReceipts는 1:1 대화에서는 불필요하므로 제거
import type { MessageReaction as MessageReactionType } from '../../hooks/useChatEnhancements';

export interface ChatMessageProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  editing?: boolean;
  editingContent?: string;
  onEdit?: (id: string, content: string) => void;
  onEditCancel?: () => void;
  onEditSave?: (id: string, content: string) => void;
  onRegenerate?: (id: string) => void;
  onCopy?: (content: string) => void;
  onLoadToInput?: (content: string) => void;
  onDelete?: (id: string) => void;
  searchTerm?: string;
  highlighted?: boolean;
  isStreaming?: boolean; // 스트리밍 중인지 여부
  streamingStage?: 'thinking' | 'analyzing' | 'generating' | 'typing'; // 스트리밍 단계
  questionType?: string; // 질문 유형 (피드백용)
  shouldLazyLoad?: boolean; // 지연 로딩 활성화 여부
    reactions?: MessageReactionType[]; // 메시지 반응 (피드백용)
    currentUserId?: string; // 현재 사용자 ID
    onReactionClick?: (reaction: string) => void; // 반응 클릭 핸들러
    // ReadReceipts는 1:1 대화에서는 불필요하므로 제거
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  id,
  role,
  content,
  timestamp,
  editing = false,
  editingContent = '',
  onEdit,
  onEditCancel,
  onEditSave,
  onRegenerate,
  onCopy,
  onLoadToInput,
  onDelete,
  searchTerm,
  highlighted = false,
  isStreaming = false,
  streamingStage,
  questionType,
  shouldLazyLoad = false,
  reactions = [],  currentUserId = 'current-user',
  onReactionClick
}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEdit = () => {
    onEdit?.(id, content);
  };

  const handleEditCancel = () => {
    onEditCancel?.();
  };

  const handleEditSave = () => {
    if (editingContent.trim()) {
      onEditSave?.(id, editingContent);
    }
  };

  // 복사 핸들러
  const handleCopy = useCallback(async () => {
    try {
      await onCopy?.(content);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
      }, 1500);
    } catch (error) {
      // 에러는 상위 컴포넌트에서 처리하도록 함
      setCopySuccess(false);
      throw error;
    }
  }, [onCopy, content]);

  // 삭제 핸들러
  const handleDeleteClick = useCallback(() => {
    if (showDeleteConfirm) {
      onDelete?.(id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => {
        setShowDeleteConfirm(false);
      }, 3000);
    }
  }, [showDeleteConfirm, onDelete, id]);

  // 재생성 핸들러
  const handleRegenerate = useCallback(() => {
    onRegenerate?.(id);
  }, [onRegenerate, id]);

  // 입력창으로 불러오기 핸들러
  const handleLoadToInput = useCallback(() => {
    onLoadToInput?.(content);
  }, [onLoadToInput, content]);

  // 지연 로딩 훅 (Task-C1: 성능 개선)
  // 메시지가 많을 때만 지연 로딩 활성화 (ChatView에서 제어)
  const { ref: lazyRef, isLoaded } = useLazyLoading({
    threshold: 0.1,
    rootMargin: '100px',
    enabled: shouldLazyLoad,
    once: true,
  });


  // 검색어 하이라이트 함수
  const highlightText = useCallback((text: string, searchTerm?: string) => {
    if (!searchTerm || !text) return text;

    // 정규식 특수문자 이스케이프 처리
    const escapedSearchTerm = searchTerm.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(String.raw`(${escapedSearchTerm})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => {
      // regex.test는 상태를 변경하므로 새로 생성
      const testRegex = new RegExp(String.raw`(${escapedSearchTerm})`, 'gi');
      return testRegex.test(part) ? (
        <mark key={`${part}-${index}`} style={{ backgroundColor: '#ffeb3b', padding: '0 2px' }}>
          {part}
        </mark>
      ) : (
        <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
      );
    });
  }, []);

  return (
    <article
      className={`message-row ${highlighted ? 'highlighted' : ''}`}
      data-message-id={id}
      ref={(node: HTMLDivElement | null) => {
        // lazyRef에 node 할당 (지연 로딩을 위해)
        if (node && lazyRef) {
          if ('current' in lazyRef) {
            (lazyRef as React.RefObject<HTMLDivElement>).current = node;
          }
        }      }}
      aria-label={`${role === 'user' ? '사용자' : 'AI'} 메시지, ${timestamp}`}
      aria-describedby={`message-${id}-content`}
    >
      <span
        className={`message-avatar ${role}`}
        aria-label={role === 'user' ? '사용자 아바타' : 'AI 아바타'}
        aria-hidden="true"
      >
        {role === 'user' ? '👤' : '🤖'}
      </span>
      <div className="message-content" id={`message-${id}-content`}>
        <div className="message-header">
          <span className="message-role" aria-label={`메시지 작성자: ${role === 'user' ? '사용자' : 'AI'}`}>
            {role === 'user' ? '사용자' : 'AI'}
          </span>
          <span className="message-timestamp" aria-label={`작성 시간: ${timestamp}`}>
            {timestamp}
          </span>
        </div>
        {editing ? (
          <MessageEditForm
            id={id}
            editingContent={editingContent}
            onEdit={onEdit || (() => { })}
            onEditSave={handleEditSave}
            onEditCancel={handleEditCancel}
          />
        ) : (
          <MessageContent
            role={role}
            content={content}
            searchTerm={searchTerm}
            isStreaming={isStreaming}
            highlightText={highlightText}
          />
        )}
        {!editing && (
          <>
            <MessageActions
              id={id}
              role={role}
              content={content}
              copySuccess={copySuccess}
              showDeleteConfirm={showDeleteConfirm}
              onCopy={handleCopy}
              onRegenerate={handleRegenerate}
              onLoadToInput={handleLoadToInput}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
            {/* 메시지 반응 */}
            {onReactionClick && reactions && (
              <MessageReactions
                messageId={id}
                reactions={reactions}
                currentUserId={currentUserId || 'current-user'}
                onReactionClick={onReactionClick}
                showReactionPicker={true}
              />
            )}
          </>
        )}
      </div>
    </article>
  );
};

const MemoizedChatMessage = React.memo(ChatMessage, (prevProps, nextProps) => {
  // props 비교 최적화
  return (
    prevProps.id === nextProps.id &&
    prevProps.content === nextProps.content &&
    prevProps.role === nextProps.role &&
    prevProps.timestamp === nextProps.timestamp &&
    prevProps.editing === nextProps.editing &&
    prevProps.editingContent === nextProps.editingContent &&
    prevProps.searchTerm === nextProps.searchTerm &&
    prevProps.highlighted === nextProps.highlighted &&
    prevProps.isStreaming === nextProps.isStreaming &&
    prevProps.streamingStage === nextProps.streamingStage &&
    prevProps.shouldLazyLoad === nextProps.shouldLazyLoad &&
    prevProps.reactions?.length === nextProps.reactions?.length &&
    prevProps.currentUserId === nextProps.currentUserId
  );
});

export default MemoizedChatMessage;

