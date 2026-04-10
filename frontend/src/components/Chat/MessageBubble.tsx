import React from 'react';
import { User, Bot, Copy, ThumbsUp, ThumbsDown, MoreVertical, Bookmark } from 'lucide-react';
import { AssistantGensparkBody } from '../genspark/AssistantGensparkBody';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { toggleMessageBookmark } from '../../store/slices/sessionsSlice';
import { errorLogger } from '../../utils/errorLogger';
import { ASSISTANT_GENSPARK_QA_BADGE_QUESTION, ASSISTANT_GENSPARK_QA_BADGE_ANSWER } from '../../utils/chatInputUtils';

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
                <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                    style={isUser ? { background: 'var(--accent-info)', color: 'white' } : { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                >
                    {isUser ? (
                        <User size={16} className="text-white" />
                    ) : (
                        <Bot size={16} />
                    )}
                </div>

                {/* 메시지 내용 */}
                <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
                    <div
                        className={`inline-block px-4 py-3 rounded-2xl max-w-full ${!isUser ? 'bw-card-secondary bw-text-primary' : ''}`}
                        style={isUser ? { background: 'var(--accent-info)', color: 'white' } : undefined}
                    >
                        {!isUser ? (
                            <>
                                <div
                                    className="genspark-qa-role-row"
                                    style={{
                                        display: 'flex',
                                        width: '100%',
                                        justifyContent: 'flex-start',
                                        marginBottom: 6,
                                    }}
                                >
                                    <span className="genspark-qa-badge genspark-qa-badge--answer">{ASSISTANT_GENSPARK_QA_BADGE_ANSWER}</span>
                                </div>
                                <div>
                                    <AssistantGensparkBody
                                        text={message.content}
                                        embedded
                                        enhancedCodeBlocks
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div
                                    className="genspark-qa-role-row"
                                    style={{
                                        display: 'flex',
                                        width: '100%',
                                        justifyContent: 'flex-end',
                                        marginBottom: 6,
                                    }}
                                >
                                    <span className="genspark-qa-badge genspark-qa-badge--question">{ASSISTANT_GENSPARK_QA_BADGE_QUESTION}</span>
                                </div>
                                <div className="text-sm whitespace-pre-wrap break-words leading-relaxed text-white">
                                    {message.content}
                                </div>
                            </>
                        )}
                    </div>

                    {/* 메시지 메타데이터 */}
                    <div className={`flex items-center space-x-2 mt-2 text-xs bw-text-muted ${isUser ? 'justify-end' : 'justify-start'
                        }`}>
                        <span>{new Date(message.timestamp).toLocaleTimeString()}</span>

                        {!isUser && message.metadata && (
                            <>
                                {message.metadata.model && (
                                    <span className="bw-badge px-2 py-1 rounded-full">
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
                        <div className="flex items-center space-x-1 mt-2" role="group" aria-label="메시지 액션">
                            <button type="button" onClick={handleCopy} className="bw-btn-ghost p-1 rounded" title="복사" aria-label="메시지 복사">
                                <Copy size={14} className="bw-text-muted" aria-hidden="true" />
                            </button>
                            <button type="button" onClick={() => handleFeedback('positive')} className="bw-btn-ghost p-1 rounded" title="좋아요" aria-label="응답에 좋아요">
                                <ThumbsUp size={14} className="bw-text-success" aria-hidden="true" />
                            </button>
                            <button type="button" onClick={() => handleFeedback('negative')} className="bw-btn-ghost p-1 rounded" title="싫어요" aria-label="응답에 싫어요">
                                <ThumbsDown size={14} className="bw-text-error" aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                onClick={handleBookmark}
                                className={`bw-btn-ghost p-1 rounded ${(message.isBookmarked || false) ? 'bw-text-warning' : 'bw-text-muted'}`}
                                title={(message.isBookmarked || false) ? '북마크 해제' : '북마크'}
                                aria-label={(message.isBookmarked || false) ? '북마크 해제' : '북마크'}
                            >
                                <Bookmark size={14} fill={(message.isBookmarked || false) ? 'currentColor' : 'none'} aria-hidden="true" />
                            </button>
                            <button type="button" className="bw-btn-ghost p-1 rounded" title="더보기" aria-label="더보기 메뉴">
                                <MoreVertical size={14} className="bw-text-muted" aria-hidden="true" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default MessageBubble;
