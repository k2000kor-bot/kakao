import React, { useState, useEffect } from 'react';
import './MessageReactionSystem.css';

interface Reaction {
    emoji: string;
    users: string[];
    count: number;
}

interface MessageReactionSystemProps {
    messageId: string;
    reactions: Reaction[];
    currentUser: string;
    onReactionAdd: (messageId: string, emoji: string, userId: string) => void;
    onReactionRemove: (messageId: string, emoji: string, userId: string) => void;
}

const MessageReactionSystem: React.FC<MessageReactionSystemProps> = ({
    messageId,
    reactions,
    currentUser,
    onReactionAdd,
    onReactionRemove
}) => {
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [hoveredReaction, setHoveredReaction] = useState<string | null>(null);

    const commonEmojis = [
        '👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🎉', '🔥', '💯',
        '😍', '🤔', '😴', '🤯', '🥳', '😎', '🤝', '🙏', '💪', '✨'
    ];

    const handleReactionClick = (emoji: string) => {
        const existingReaction = reactions.find(r => r.emoji === emoji);
        const hasUserReacted = existingReaction?.users.includes(currentUser);

        if (hasUserReacted) {
            onReactionRemove(messageId, emoji, currentUser);
        } else {
            onReactionAdd(messageId, emoji, currentUser);
        }
    };

    const getReactionDisplay = (reaction: Reaction) => {
        const hasUserReacted = reaction.users.includes(currentUser);
        return (
            <div
                key={reaction.emoji}
                className={`reaction-item ${hasUserReacted ? 'user-reacted' : ''}`}
                onClick={() => handleReactionClick(reaction.emoji)}
                onMouseEnter={() => setHoveredReaction(reaction.emoji)}
                onMouseLeave={() => setHoveredReaction(null)}
            >
                <span className="reaction-emoji">{reaction.emoji}</span>
                <span className="reaction-count">{reaction.count}</span>

                {hoveredReaction === reaction.emoji && (
                    <div className="reaction-tooltip">
                        <div className="tooltip-users">
                            {reaction.users.slice(0, 3).join(', ')}
                            {reaction.users.length > 3 && ` +${reaction.users.length - 3}명`}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const handleQuickReaction = (emoji: string) => {
        handleReactionClick(emoji);
        setShowReactionPicker(false);
    };

    return (
        <div className="message-reaction-system">
            {/* 기존 리액션들 */}
            {reactions.length > 0 && (
                <div className="existing-reactions">
                    {reactions.map(getReactionDisplay)}
                </div>
            )}

            {/* 리액션 추가 버튼 */}
            <button
                className="add-reaction-btn"
                onClick={() => setShowReactionPicker(!showReactionPicker)}
                title="리액션 추가"
            >
                😊
            </button>

            {/* 리액션 선택기 */}
            {showReactionPicker && (
                <div className="reaction-picker-modal">
                    <div className="reaction-picker-content">
                        <div className="reaction-grid">
                            {commonEmojis.map((emoji) => (
                                <button
                                    key={emoji}
                                    className="reaction-option"
                                    onClick={() => handleQuickReaction(emoji)}
                                    title={`${emoji} 리액션 추가`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>

                        <div className="reaction-picker-footer">
                            <button
                                className="close-picker-btn"
                                onClick={() => setShowReactionPicker(false)}
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessageReactionSystem; 