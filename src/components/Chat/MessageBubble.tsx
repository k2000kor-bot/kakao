import React from 'react';
import { User, Bot, Copy, ThumbsUp, ThumbsDown, MoreVertical, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { toggleMessageBookmark } from '../../store/slices/sessionsSlice';
import { errorLogger } from '../../utils/errorLogger';

// sessionsSlice의 Message 타입을 사용
interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: string;
    isBookmarked?: boolean;
    metadata?: {
        model?: string;
        tokens?: number;
        responseTime?: number;
        confidence?: number;
    };
}

interface MessageBubbleProps {
    message: Message;
    sessionId: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, sessionId }) => {
    const isUser = message.role === 'user';
    const dispatch = useDispatch();

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            // 복사 성공 알림
        } catch (error) {
            errorLogger.error('메시지 복사 실패', error instanceof Error ? error : new Error(String(error)), { component: 'MessageBubble', action: 'handleCopy' });
        }
    };

    const handleFeedback = (type: 'positive' | 'negative') => {
        // 피드백 처리 로직
        errorLogger.info('메시지 피드백', { component: 'MessageBubble', action: 'handleFeedback', feedbackType: type, messageId: message.id });
    };

    const handleBookmark = () => {
        dispatch(toggleMessageBookmark({ sessionId, messageId: message.id }));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            <div className={`flex items-start space-x-3 max-w-3xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* 아바타 */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-500' : 'bg-gray-200'
                    }`}>
                    {isUser ? (
                        <User size={16} className="text-white" />
                    ) : (
                        <Bot size={16} className="text-gray-600" />
                    )}
                </div>

                {/* 메시지 내용 */}
                <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block px-4 py-3 rounded-2xl max-w-full ${isUser
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                        }`}>
                        <div className="whitespace-pre-wrap break-words">
                            {message.content}
                        </div>
                    </div>

                    {/* 메시지 메타데이터 */}
                    <div className={`flex items-center space-x-2 mt-2 text-xs text-gray-500 ${isUser ? 'justify-end' : 'justify-start'
                        }`}>
                        <span>{new Date(message.timestamp).toLocaleTimeString()}</span>

                        {!isUser && message.metadata && (
                            <>
                                {message.metadata.model && (
                                    <span className="px-2 py-1 bg-gray-200 rounded-full">
                                        {message.metadata.model}
                                    </span>
                                )}
                                {message.metadata.responseTime && (
                                    <span>{message.metadata.responseTime}ms</span>
                                )}
                                {message.metadata.confidence && (
                                    <span>{Math.round(message.metadata.confidence * 100)}%</span>
                                )}
                            </>
                        )}
                    </div>

                    {/* 액션 버튼들 */}
                    {!isUser && (
                        <div className="flex items-center space-x-1 mt-2">
                            <button
                                onClick={handleCopy}
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                                title="복사"
                            >
                                <Copy size={14} />
                            </button>
                            <button
                                onClick={() => handleFeedback('positive')}
                                className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="좋아요"
                            >
                                <ThumbsUp size={14} />
                            </button>
                            <button
                                onClick={() => handleFeedback('negative')}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="싫어요"
                            >
                                <ThumbsDown size={14} />
                            </button>
                            <button
                                onClick={handleBookmark}
                                className={`p-1 rounded transition-colors ${message.isBookmarked || false
                                    ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50'
                                    : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                                    }`}
                                title={(message.isBookmarked || false) ? '북마크 해제' : '북마크'}
                            >
                                <Bookmark size={14} fill={(message.isBookmarked || false) ? 'currentColor' : 'none'} />
                            </button>
                            <button
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                                title="더보기"
                            >
                                <MoreVertical size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default MessageBubble;
