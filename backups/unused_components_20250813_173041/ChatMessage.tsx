import React, { useState } from 'react';
import './ChatMessage.css';

interface ChatMessageProps {
    message: {
        id: string;
        content: string;
        sender: string;
        timestamp: string;
        isMe?: boolean;
        type?: 'text' | 'image' | 'file' | 'system' | 'voice' | 'media' | 'ai_response';
        fileUrl?: string;
        fileName?: string;
        fileSize?: number;
        status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
        reactions?: Array<{ emoji: string; users: string[] }>;
        replyTo?: {
            id: string;
            content: string;
            sender: string;
        };
    };
    showAvatar?: boolean;
    showTime?: boolean;
    showStatus?: boolean;
    isLastMessage?: boolean;
    onReaction?: (messageId: string, emoji: string) => void;
    onReply?: (messageId: string) => void;
    onCopy?: (content: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
    message,
    showAvatar = true,
    showTime = true,
    showStatus = true,
    isLastMessage = false,
    onReaction,
    onReply,
    onCopy
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    // 시간 포맷팅
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else if (diffInHours < 48) {
            return '어제';
        } else {
            return date.toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric'
            });
        }
    };

    // 파일 크기 포맷팅
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // 상태 아이콘
    const getStatusIcon = () => {
        switch (message.status) {
            case 'sending':
                return '⏳';
            case 'sent':
                return '✓';
            case 'delivered':
                return '✓✓';
            case 'read':
                return '✓✓';
            case 'failed':
                return '❌';
            default:
                return '';
        }
    };

    // 사용자 아바타 색상
    const getAvatarColor = (sender: string) => {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
        ];
        const index = sender.charCodeAt(0) % colors.length;
        return colors[index];
    };

    // 메시지 타입별 렌더링
    const renderContent = () => {
        switch (message.type) {
            case 'image':
                return (
                    <div className="message-image">
                        <img
                            src={message.fileUrl}
                            alt={message.fileName || '이미지'}
                            onLoad={() => setIsImageLoaded(true)}
                            className={isImageLoaded ? 'loaded' : ''}
                        />
                        {message.content && (
                            <div className="image-caption">{message.content}</div>
                        )}
                    </div>
                );

            case 'file':
                return (
                    <div className="message-file">
                        <div className="file-icon">📎</div>
                        <div className="file-info">
                            <div className="file-name">{message.fileName}</div>
                            <div className="file-size">{formatFileSize(message.fileSize || 0)}</div>
                        </div>
                        <button className="download-btn">⬇️</button>
                    </div>
                );

            case 'voice':
                return (
                    <div className="message-voice">
                        <button
                            className={`play-btn ${isPlaying ? 'playing' : ''}`}
                            onClick={() => setIsPlaying(!isPlaying)}
                        >
                            {isPlaying ? '⏸️' : '▶️'}
                        </button>
                        <div className="voice-waveform">
                            <div className="wave-bar"></div>
                            <div className="wave-bar"></div>
                            <div className="wave-bar"></div>
                            <div className="wave-bar"></div>
                            <div className="wave-bar"></div>
                        </div>
                        <span className="voice-duration">0:15</span>
                    </div>
                );

            case 'system':
                return (
                    <div className="message-system">
                        <span className="system-icon">ℹ️</span>
                        <span className="system-text">{message.content}</span>
                    </div>
                );

            default:
                return (
                    <div className="message-text">
                        {message.replyTo && (
                            <div className="reply-preview">
                                <span className="reply-sender">{message.replyTo.sender}</span>
                                <span className="reply-content">{message.replyTo.content}</span>
                            </div>
                        )}
                        <div className="text-content">{message.content}</div>
                    </div>
                );
        }
    };

    // 리액션 렌더링
    const renderReactions = () => {
        if (!message.reactions || message.reactions.length === 0) return null;

        return (
            <div className="message-reactions">
                {message.reactions.map((reaction, index) => (
                    <div key={index} className="reaction-item">
                        <span className="reaction-emoji">{reaction.emoji}</span>
                        <span className="reaction-count">{reaction.users.length}</span>
                    </div>
                ))}
            </div>
        );
    };

    // 메시지 옵션 메뉴
    const renderOptionsMenu = () => {
        if (!showOptions) return null;

        return (
            <div className="message-options">
                <button onClick={() => onReply?.(message.id)} className="option-btn">
                    💬 답장
                </button>
                <button onClick={() => onCopy?.(message.content)} className="option-btn">
                    📋 복사
                </button>
                <button className="option-btn">
                    ⭐ 즐겨찾기
                </button>
                <button className="option-btn">
                    🗑️ 삭제
                </button>
            </div>
        );
    };

    return (
        <div
            className={`chat-message ${message.isMe ? 'my-message' : 'other-message'} ${message.type || 'text'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* 답장 미리보기 */}
            {message.replyTo && (
                <div className="reply-indicator">
                    <span>답장:</span>
                    <span className="reply-sender">{message.replyTo.sender}</span>
                </div>
            )}

            <div className="message-container">
                {/* 아바타 */}
                {showAvatar && !message.isMe && (
                    <div className="message-avatar">
                        <div
                            className="avatar-circle"
                            style={{ backgroundColor: getAvatarColor(message.sender) }}
                        >
                            {message.sender.charAt(0).toUpperCase()}
                        </div>
                    </div>
                )}

                {/* 메시지 내용 */}
                <div className="message-content">
                    {/* 발신자 이름 */}
                    {!message.isMe && (
                        <div className="message-sender">{message.sender}</div>
                    )}

                    {/* 메시지 버블 */}
                    <div className="message-bubble">
                        {renderContent()}

                        {/* 리액션 */}
                        {renderReactions()}
                    </div>

                    {/* 메시지 메타 정보 */}
                    <div className="message-meta">
                        {showTime && (
                            <span className="message-time">{formatTime(message.timestamp)}</span>
                        )}

                        {message.isMe && showStatus && (
                            <span className="message-status">{getStatusIcon()}</span>
                        )}
                    </div>
                </div>

                {/* 내 메시지 아바타 */}
                {showAvatar && message.isMe && (
                    <div className="message-avatar">
                        <div
                            className="avatar-circle"
                            style={{ backgroundColor: getAvatarColor(message.sender) }}
                        >
                            {message.sender.charAt(0).toUpperCase()}
                        </div>
                    </div>
                )}
            </div>

            {/* 호버 시 옵션 버튼 */}
            {isHovered && (
                <div className="message-actions">
                    <button
                        onClick={() => setShowReactions(!showReactions)}
                        className="action-btn"
                        title="리액션"
                    >
                        😊
                    </button>
                    <button
                        onClick={() => setShowOptions(!showOptions)}
                        className="action-btn"
                        title="더보기"
                    >
                        ⋯
                    </button>
                </div>
            )}

            {/* 리액션 선택기 */}
            {showReactions && (
                <div className="reaction-picker">
                    {['👍', '❤️', '😂', '😮', '😢', '😡'].map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => {
                                onReaction?.(message.id, emoji);
                                setShowReactions(false);
                            }}
                            className="reaction-option"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}

            {/* 옵션 메뉴 */}
            {renderOptionsMenu()}
        </div>
    );
};

export default ChatMessage; 