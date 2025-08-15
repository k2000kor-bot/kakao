import React, { useState } from 'react';
import './MessageReplySystem.css';

interface ReplyMessage {
    id: string;
    content: string;
    sender: string;
    timestamp: string;
    type?: 'text' | 'image' | 'file' | 'voice';
    replyTo?: {
        id: string;
        content: string;
        sender: string;
    };
}

interface MessageReplySystemProps {
    originalMessage: ReplyMessage;
    replyToMessage?: ReplyMessage;
    onReply: (messageId: string) => void;
    onCancelReply: () => void;
    isReplying: boolean;
}

const MessageReplySystem: React.FC<MessageReplySystemProps> = ({
    originalMessage,
    replyToMessage,
    onReply,
    onCancelReply,
    isReplying
}) => {
    const [replyText, setReplyText] = useState('');

    const handleReplySubmit = () => {
        if (replyText.trim()) {
            onReply(originalMessage.id);
            setReplyText('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleReplySubmit();
        } else if (e.key === 'Escape') {
            onCancelReply();
        }
    };

    const formatReplyPreview = (message: ReplyMessage) => {
        let preview = message.content;
        if (message.type === 'image') {
            preview = '📷 이미지';
        } else if (message.type === 'file') {
            preview = '📎 파일';
        } else if (message.type === 'voice') {
            preview = '🎤 음성 메시지';
        }

        if (preview.length > 50) {
            preview = preview.substring(0, 50) + '...';
        }

        return preview;
    };

    return (
        <div className="message-reply-system">
            {/* 답장 미리보기 */}
            {replyToMessage && (
                <div className="reply-preview-container">
                    <div className="reply-preview">
                        <div className="reply-indicator">
                            <span className="reply-icon">↩️</span>
                            <span className="reply-sender">{replyToMessage.sender}</span>
                        </div>
                        <div className="reply-content">
                            {formatReplyPreview(replyToMessage)}
                        </div>
                        <button
                            className="cancel-reply-btn"
                            onClick={onCancelReply}
                            title="답장 취소"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* 답장 입력 영역 */}
            {isReplying && (
                <div className="reply-input-container">
                    <div className="reply-input-wrapper">
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder={`${originalMessage.sender}님에게 답장...`}
                            className="reply-input"
                            rows={1}
                            autoFocus
                        />
                        <div className="reply-actions">
                            <button
                                onClick={handleReplySubmit}
                                disabled={!replyText.trim()}
                                className="send-reply-btn"
                            >
                                전송
                            </button>
                            <button
                                onClick={onCancelReply}
                                className="cancel-reply-btn"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 답장 체인 표시 */}
            {originalMessage.replyTo && (
                <div className="reply-chain">
                    <div className="reply-chain-item">
                        <span className="chain-sender">{originalMessage.replyTo.sender}</span>
                        <span className="chain-content">
                            {formatReplyPreview({
                                id: originalMessage.replyTo.id,
                                content: originalMessage.replyTo.content,
                                sender: originalMessage.replyTo.sender,
                                timestamp: new Date().toISOString()
                            })}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessageReplySystem; 