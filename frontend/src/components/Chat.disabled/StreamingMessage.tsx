import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

interface StreamingMessageProps {
    content: string;
    isStreaming: boolean;
    onStreamComplete?: () => void;
}

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
            }, 50); // 50ms마다 한 글자씩 표시

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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start space-x-3"
        >
            {/* AI 아바타 */}
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Bot size={16} className="text-white" />
            </div>

            {/* 메시지 내용 */}
            <div className="flex-1 bg-gray-100 px-4 py-3 rounded-2xl">
                <div className="text-gray-900 whitespace-pre-wrap">
                    {displayedContent}
                    {isStreaming && currentIndex < content.length && (
                        <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="inline-block w-2 h-4 bg-blue-500 ml-1"
                        />
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default StreamingMessage;
