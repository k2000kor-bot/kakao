/**
 * 타이핑 인디케이터 (ChatView)
 * AI 응답 대기 시 젠스파이크형 생성 단계 UI (`AssistantGensparkBody`) 사용
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import {
  ASSISTANT_GENSPARK_STATUS_HEADLINE_INITIAL_DEFAULT,
  ASSISTANT_GENSPARK_QA_BADGE_ANSWER,
} from '../../utils/chatInputUtils';
import { AssistantGensparkBody } from '../genspark/AssistantGensparkBody';

interface TypingIndicatorProps {
  message?: string;
  showAvatar?: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  message = ASSISTANT_GENSPARK_STATUS_HEADLINE_INITIAL_DEFAULT,
  showAvatar = true,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="typing-indicator-container"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={message}
    >
      {showAvatar && (
        <div className="typing-indicator-avatar">
          <Bot size={16} className="typing-indicator-avatar-icon" aria-hidden />
        </div>
      )}
      <div className="typing-indicator-content typing-indicator-content--genspark">
        <div className="genspark-qa-role-row" style={{ marginBottom: 6 }}>
          <span className="genspark-qa-badge genspark-qa-badge--answer">{ASSISTANT_GENSPARK_QA_BADGE_ANSWER}</span>
        </div>
        <AssistantGensparkBody text="" embedded enhancedCodeBlocks />
      </div>
    </motion.div>
  );
};

export default TypingIndicator;
