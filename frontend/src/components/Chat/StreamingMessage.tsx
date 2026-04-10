import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { coerceTrimmedString, getAssistantGenerationPhase } from '../../utils/chatInputUtils';
import { AssistantGensparkBody } from '../genspark/AssistantGensparkBody';

interface StreamingMessageProps {
    content: string;
    isStreaming: boolean;
    onStreamComplete?: () => void;
}

/**
 * PureChatGPT / ChatMessage 스트리밍 본문 — 상위(ChatMessage)에 아바타가 있으므로 여기서는 본문만 표시.
 * Genspark형 마크다운(NotebookLLM 스트리밍과 동일 계열).
 */
const StreamingMessage: React.FC<StreamingMessageProps> = ({
    content,
    isStreaming,
    onStreamComplete
}) => {
    const [displayedContent, setDisplayedContent] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (isStreaming && currentIndex < content.length) {
            const timer = setTimeout(() => {
                setDisplayedContent(prev => prev + content[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, 50);

            return () => clearTimeout(timer);
        } else if (isStreaming && currentIndex >= content.length) {
            onStreamComplete?.();
        }
    }, [isStreaming, currentIndex, content, onStreamComplete]);

    useEffect(() => {
        if (!isStreaming) {
            setDisplayedContent(content);
            setCurrentIndex(content.length);
        }
    }, [isStreaming, content]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="streaming-message-genspark"
        >
            <AssistantGensparkBody
                text={displayedContent}
                embedded
                enhancedCodeBlocks
            />
            {isStreaming &&
                currentIndex < content.length &&
                coerceTrimmedString(displayedContent, '') &&
                getAssistantGenerationPhase(displayedContent) === null && (
                <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-2 h-4 ml-1 align-text-bottom streaming-typewriter-cursor"
                    style={{ background: 'var(--accent-info)' }}
                    aria-hidden
                />
            )}
        </motion.div>
    );
};

export default StreamingMessage;
