/**
 * 타이핑 인디케이터 컴포넌트
 * AI가 응답을 생성 중일 때 표시되는 인디케이터
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

interface TypingIndicatorProps {
  message?: string;
  showAvatar?: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  message = 'AI가 응답을 생성하고 있습니다...',
  showAvatar = true,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="typing-indicator-container"
    >
      {showAvatar && (
        <div className="typing-indicator-avatar">
          <Bot size={16} className="typing-indicator-avatar-icon" />
        </div>
      )}
      <div className="typing-indicator-content">
        <div className="typing-indicator-dots">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="typing-indicator-dot"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
        <span className="typing-indicator-text">{message}</span>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;
