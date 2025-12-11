/**
 * 최적화된 메시지 아이템 컴포넌트
 * React.memo를 사용하여 불필요한 리렌더링 방지
 * 
 * Task-F1: 성능 최적화
 */

import React, { memo, useMemo, useState } from 'react';
import MessageActions from './MessageActions';
import MessageEditor from './MessageEditor';
import type { Message, AnalysisData } from '../types';
import './MessageItem.css';

export interface MessageItemProps {
    id: number;
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
    analysis: AnalysisData | null;
    isLiked?: boolean;
    isDisliked?: boolean;
    isBookmarked?: boolean;
    sessionId?: string;
    searchTerm?: string;
    onCopy?: (text: string) => void;
    onRegenerate?: (id: number) => void;
    onEdit?: (id: number, newText: string) => void;
    onReply?: (id: number) => void;
    onLike?: (id: number) => void;
    onDislike?: (id: number) => void;
    onBookmark?: (id: number) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({
    id,
    sender,
    text,
    timestamp,
    analysis,
    isLiked = false,
    isDisliked = false,
    isBookmarked = false,
    sessionId,
    searchTerm,
    onCopy,
    onRegenerate,
    onEdit,
    onReply,
    onLike,
    onDislike,
    onBookmark,
}) => {
    const [isEditing, setIsEditing] = useState(false);

    // 검색어 하이라이트 함수
    const highlightText = useMemo(() => {
        if (!searchTerm || !text) {
            return null;
        }

        // 정규식 특수문자 이스케이프
        const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, index) => {
            // 대소문자 구분 없이 매칭 확인
            const testRegex = new RegExp(`^${escapedSearchTerm}$`, 'i');
            return testRegex.test(part) ? (
                <mark key={index} className="search-highlight" aria-label={`검색어: ${part}`}>
                    {part}
                </mark>
            ) : (
                <React.Fragment key={index}>{part}</React.Fragment>
            );
        });
    }, [text, searchTerm]);
    const getEmotionEmoji = (emotion: string) => {
        const emojiMap: Record<string, string> = {
            happy: '😊',
            sad: '😢',
            angry: '😠',
            neutral: '😐',
            excited: '🤩',
            calm: '😌',
        };
        return emojiMap[emotion] || '😐';
    };

    const getIntentEmoji = (intent: string) => {
        const emojiMap: Record<string, string> = {
            question: '❓',
            request: '🙏',
            greeting: '👋',
            feedback: '💬',
            command: '⚡',
        };
        return emojiMap[intent] || '💭';
    };

    // 마크다운 이미지 파싱 및 렌더링
    const renderMessageContent = useMemo(() => {
        // 마크다운 이미지 문법 감지: ![alt](src)
        const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        const parts: Array<{ type: 'text' | 'image'; content: string; alt?: string }> = [];
        let lastIndex = 0;
        let match;

        while ((match = imageRegex.exec(text)) !== null) {
            // 이미지 앞의 텍스트
            if (match.index > lastIndex) {
                parts.push({
                    type: 'text',
                    content: text.substring(lastIndex, match.index),
                });
            }
            // 이미지
            parts.push({
                type: 'image',
                content: match[2], // src
                alt: match[1] || '이미지', // alt text
            });
            lastIndex = imageRegex.lastIndex;
        }

        // 마지막 텍스트
        if (lastIndex < text.length) {
            parts.push({
                type: 'text',
                content: text.substring(lastIndex),
            });
        }

        // 이미지가 없으면 원본 텍스트 반환 (검색 하이라이트 포함)
        if (parts.length === 0 || (parts.length === 1 && parts[0].type === 'text')) {
            return (
                <div style={{ whiteSpace: 'pre-line' }}>
                    {highlightText || text}
                </div>
            );
        }

        // 이미지가 있으면 파싱된 내용 렌더링
        return (
            <div style={{ whiteSpace: 'pre-line' }}>
                {parts.map((part, index) => {
                    if (part.type === 'image') {
                        return (
                            <div key={index} className="message-image-container">
                                <img
                                    src={part.content}
                                    alt={part.alt}
                                    className="message-image"
                                    loading="lazy"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const errorDiv = document.createElement('div');
                                        errorDiv.className = 'image-error';
                                        errorDiv.textContent = `이미지를 불러올 수 없습니다: ${part.alt || '이미지'}`;
                                        target.parentNode?.appendChild(errorDiv);
                                    }}
                                />
                            </div>
                        );
                    }
                    // 텍스트 부분에 검색 하이라이트 적용
                    if (searchTerm && part.content) {
                        const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
                        const textParts = part.content.split(regex);
                        return (
                            <span key={index}>
                                {textParts.map((textPart, textIndex) => {
                                    const testRegex = new RegExp(`^${escapedSearchTerm}$`, 'i');
                                    return testRegex.test(textPart) ? (
                                        <mark key={textIndex} className="search-highlight">
                                            {textPart}
                                        </mark>
                                    ) : (
                                        <React.Fragment key={textIndex}>{textPart}</React.Fragment>
                                    );
                                })}
                            </span>
                        );
                    }
                    return <span key={index}>{part.content}</span>;
                })}
            </div>
        );
    }, [text]);

    return (
        <div
            className={`message ${sender}`}
            role="article"
            aria-label={`${sender === 'user' ? '사용자' : 'AI'} 메시지`}
        >
            <div className="message-avatar" aria-hidden="true">
                {sender === 'user' ? 'U' : 'AI'}
            </div>
            <div className="message-content">
                {isEditing ? (
                    <MessageEditor
                        initialText={text}
                        onSave={(newText) => {
                            if (onEdit) {
                                onEdit(id, newText);
                            }
                            setIsEditing(false);
                        }}
                        onCancel={() => setIsEditing(false)}
                        autoFocus={true}
                    />
                ) : (
                    <>
                        <div
                            role="text"
                            aria-label="메시지 내용"
                        >
                            {renderMessageContent}
                        </div>
                        <div className="message-time" aria-label={`메시지 시간: ${timestamp}`}>
                            {timestamp}
                        </div>

                        <MessageActions
                            messageId={id}
                            messageText={text}
                            sessionId={sessionId}
                            onCopy={onCopy}
                            onRegenerate={onRegenerate}
                            onEdit={sender === 'user' ? () => setIsEditing(true) : undefined}
                            onReply={onReply}
                            onLike={onLike}
                            onDislike={onDislike}
                            onBookmark={onBookmark}
                            isLiked={isLiked}
                            isDisliked={isDisliked}
                            isBookmarked={isBookmarked}
                            showActions={true}
                            canEdit={sender === 'user'}
                        />
                    </>
                )}

                {/* 분석 결과 */}
                {analysis && sender === 'ai' && analysis.emotion_analysis && (
                    <div
                        className="analysis-panel"
                        role="region"
                        aria-label="AI 분석 결과"
                    >
                        <div className="analysis-title">🧠 AI 분석 결과</div>
                        <div className="emotion-analysis">
                            <span
                                className={`emotion-tag emotion-${analysis.emotion_analysis.emotion}`}
                                aria-label={`감정: ${analysis.emotion_analysis.emotion}, 신뢰도: ${Math.round(analysis.emotion_analysis.confidence * 100)}%`}
                            >
                                {getEmotionEmoji(analysis.emotion_analysis.emotion)}{' '}
                                {analysis.emotion_analysis.emotion}
                            </span>
                            <div className="confidence-bar" role="progressbar" aria-valuenow={analysis.emotion_analysis.confidence * 100} aria-valuemin={0} aria-valuemax={100}>
                                <div
                                    className="confidence-fill"
                                    style={{ width: `${analysis.emotion_analysis.confidence * 100}%` }}
                                ></div>
                            </div>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                                {Math.round(analysis.emotion_analysis.confidence * 100)}%
                            </span>
                        </div>
                        <div className="intent-analysis">
                            <span
                                className={`intent-tag intent-${analysis.intent_analysis.intent}`}
                                aria-label={`의도: ${analysis.intent_analysis.intent}, 신뢰도: ${Math.round(analysis.intent_analysis.confidence * 100)}%`}
                            >
                                {getIntentEmoji(analysis.intent_analysis.intent)}{' '}
                                {analysis.intent_analysis.intent}
                            </span>
                            <div className="confidence-bar" role="progressbar" aria-valuenow={analysis.intent_analysis.confidence * 100} aria-valuemin={0} aria-valuemax={100}>
                                <div
                                    className="confidence-fill"
                                    style={{ width: `${analysis.intent_analysis.confidence * 100}%` }}
                                ></div>
                            </div>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                                {Math.round(analysis.intent_analysis.confidence * 100)}%
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// props 비교 함수로 불필요한 리렌더링 방지
const areEqual = (prevProps: MessageItemProps, nextProps: MessageItemProps) => {
    return (
        prevProps.id === nextProps.id &&
        prevProps.text === nextProps.text &&
        prevProps.timestamp === nextProps.timestamp &&
        prevProps.isLiked === nextProps.isLiked &&
        prevProps.isDisliked === nextProps.isDisliked &&
        prevProps.isBookmarked === nextProps.isBookmarked &&
        prevProps.analysis === nextProps.analysis &&
        prevProps.sender === nextProps.sender &&
        prevProps.searchTerm === nextProps.searchTerm
    );
};

export default memo(MessageItem, areEqual);

