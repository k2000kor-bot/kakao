/**
 * 빠른 답장 컴포넌트 (ChatGPT 스타일)
 * 컨텍스트 기반 빠른 답장 제안
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';
import './QuickReplies.css';

export interface QuickReply {
  id: string;
  text: string;
  category: string;
}

interface QuickRepliesProps {
  replies: QuickReply[];
  onReplyClick: (reply: QuickReply) => void;
  showCategory?: boolean;
}

const QuickReplies: React.FC<QuickRepliesProps> = ({
  replies,
  onReplyClick,
  showCategory: _showCategory = false,
}) => {
  if (replies.length === 0) {
    return null;
  }

  return (
    <div className="quick-replies-container" role="region" aria-label="빠른 답장 제안">
      <div className="quick-replies-header">
        <Sparkles size={16} className="quick-replies-icon" />
        <span className="quick-replies-title">제안된 답변</span>
      </div>
      <div className="quick-replies-list">
        <AnimatePresence>
          {replies.map((reply, index) => (
            <motion.button
              key={reply.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onReplyClick(reply)}
              className="quick-reply-item"
              aria-label={`${reply.text} 제안 사용`}
            >
              <span className="quick-reply-text">{reply.text}</span>
              <ChevronRight size={14} className="quick-reply-chevron" />
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuickReplies;
