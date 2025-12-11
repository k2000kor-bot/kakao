/**
 * 메시지 반응 컴포넌트
 * 이모지 반응 및 빠른 반응 기능 제공
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, ThumbsUp, Heart, Zap, PartyPopper } from 'lucide-react';
import './MessageReactions.css';

export interface MessageReaction {
  messageId: string;
  userId: string;
  reaction: string;
  timestamp: Date;
}

interface MessageReactionsProps {
  messageId: string;
  reactions: MessageReaction[];
  currentUserId: string;
  onReactionClick: (reaction: string) => void;
  showReactionPicker?: boolean;
}

const REACTION_OPTIONS = [
  { emoji: '👍', label: '좋아요', value: 'thumbs_up' },
  { emoji: '❤️', label: '좋아요', value: 'heart' },
  { emoji: '👏', label: '박수', value: 'clap' },
  { emoji: '🔥', label: '불타오르네요', value: 'fire' },
  { emoji: '🎉', label: '축하해요', value: 'party' },
  { emoji: '😊', label: '미소', value: 'smile' },
];

const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  reactions,
  currentUserId,
  onReactionClick,
  showReactionPicker = true,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  // 반응 그룹화 (같은 반응끼리)
  const reactionGroups = REACTION_OPTIONS.map((option) => {
    const userReactions = reactions.filter((r) => r.reaction === option.value);
    const hasCurrentUser = userReactions.some((r) => r.userId === currentUserId);
    return {
      ...option,
      count: userReactions.length,
      hasCurrentUser,
      users: userReactions.map((r) => r.userId),
    };
  }).filter((group) => group.count > 0);

  const handleReactionClick = (reaction: string) => {
    onReactionClick(reaction);
    setShowPicker(false);
  };

  return (
    <div className="message-reactions-container">
      {/* 반응 표시 */}
      {reactionGroups.length > 0 && (
        <div className="message-reactions-list" role="group" aria-label="메시지 반응">
          {reactionGroups.map((group) => (
            <motion.button
              key={group.value}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleReactionClick(group.value)}
              className={`message-reaction-item ${group.hasCurrentUser ? 'active' : ''}`}
              title={`${group.label} (${group.count}명)`}
              aria-label={`${group.label} 반응 ${group.count}개`}
            >
              <span className="reaction-emoji">{group.emoji}</span>
              {group.count > 1 && <span className="reaction-count">{group.count}</span>}
            </motion.button>
          ))}
        </div>
      )}

      {/* 반응 추가 버튼 */}
      {showReactionPicker && (
        <div className="message-reaction-picker-wrapper">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowPicker(!showPicker)}
            className="message-reaction-add-btn"
            aria-label="반응 추가"
          >
            <Smile size={16} />
          </motion.button>

          {/* 반응 선택기 */}
          <AnimatePresence>
            {showPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                className="message-reaction-picker"
              >
                {REACTION_OPTIONS.map((option) => {
                  const hasReaction = reactions.some(
                    (r) => r.reaction === option.value && r.userId === currentUserId
                  );
                  return (
                    <motion.button
                      key={option.value}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleReactionClick(option.value)}
                      className={`reaction-option ${hasReaction ? 'selected' : ''}`}
                      title={option.label}
                    >
                      <span className="reaction-emoji-large">{option.emoji}</span>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default MessageReactions;

