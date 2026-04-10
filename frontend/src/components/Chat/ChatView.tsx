/* cspell:ignore mindmap Mindmap unstar HOBUM */
import React, { useMemo, memo, useCallback } from 'react';
import ChatMessage from './ChatMessage';
import type { ChatMessageProps } from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import MultiIntentResponseView from './MultiIntentResponseView';
import QuickReplies from './QuickReplies';
import SmartRecommendations from './SmartRecommendations';
import { useAccessibility } from '../../hooks/useAccessibility';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import useChatEnhancements from '../../hooks/useChatEnhancements';
import type { MultiIntentResponse } from '../../types/multiIntent';
import './ChatView.css';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    isStreaming?: boolean;
    streamingStage?: 'thinking' | 'analyzing' | 'generating' | 'typing';
    questionType?: string; // 질문 유형 (피드백용)
}

interface Chat {
    id: string;
    title: string;
    summary: string;
    date: string;
    projectId?: string;
    messages: Message[];
    updatedAt?: string;
}

interface ParsedRequest {
    index: number;
    type: string;
    content: string;
}

type ApiConnectionStatus = 'online' | 'offline' | 'checking';
type ActiveTopTab = 'chat' | 'mindmap';

interface ChatViewProps {
    // 대화 정보
    currentChat: Chat | null;
    messages: Message[];
    loading: boolean;

    // 스크롤 관리
    scrollContainerRef: React.RefObject<HTMLDivElement>;
    messagesEndRef: React.RefObject<HTMLDivElement>;

    // 검색 및 하이라이트
    messageSearchTerm: string;
    onMessageSearchChange: (term: string) => void;
    highlightedMessageIds: Set<string>;

    // 멀티 요청
    detectedRequests: ParsedRequest[];

    // 메시지 편집
    editingMessageId: string | null;
    editingMessageContent: string;
    onEditMessage: (id: string, content: string) => void;
    onCancelEdit: () => void;
    onSaveEdit: (id: string) => void;
    onRegenerateMessage: (id: string) => void;
    onCopyMessage: (content: string, format?: 'text' | 'markdown' | 'html') => () => Promise<void>;
    onLoadToInput: (content: string) => void;
    onDeleteMessage?: (messageId: string) => void;
    adjustTextareaHeight: (textarea: HTMLTextAreaElement | null) => void;
    inputRef: React.RefObject<HTMLTextAreaElement>;

    // 멀티 인텐트
    multiIntentState: {
        id: string;
        summary?: string;
        responses: Array<{
            index: number;
            type: string;
            prompt: string;
            response: string;
            qualityScore?: number;
            confidence?: number;
            processingTime?: number;
        }>;
    } | null;
    aggregateMetrics?: {
        totalResponses: number;
        averageQuality?: number;
        averageConfidence?: number;
        totalProcessing?: number;
    };
    actionStatus: { key: string; message: string } | null;
    onCopyResponse: (entry: { response: string; index: number }) => Promise<void>;
    onUseAsPrompt: (entry: { response: string; index: number }) => void;
    onFollowUpAction: (entry: { response: string; index: number }, action: string) => void;
    pinnedIds: string[];
    starredIds: string[];

    // 히스토리 패널
    showHistoryPanel: boolean;
    multiIntentHistory: MultiIntentResponse[];
    pinnedResults: { id: string; title: string; timestamp?: string; requests?: ParsedRequest[]; summary?: string; }[];
    recentHistory: { id: string; title: string; timestamp: string; requests?: ParsedRequest[]; summary?: string; }[];
    onTogglePin: (id: string) => void;
    onToggleStar: (id: string) => void;
    onLoadHistoryToInput: (entry: { id: string; title: string; content?: string; }) => void;
    onResetHistory: () => void;
    onCloseHistoryPanel: () => void;

    // 프로젝트
    onSelectProject: (projectId: string) => void;

    // API 상태
    apiConnectionStatus: ApiConnectionStatus;
    getApiStatusTitle: (status: ApiConnectionStatus) => string;
    getApiStatusText: (status: ApiConnectionStatus) => string;
    chatUpdatedLabel: string | null;

    // 탭
    activeTopTab: ActiveTopTab;
}

/**
 * ChatView 컴포넌트
 * PureChatGPTInterface의 대화 뷰 영역을 분리한 컴포넌트
 * Task-C1: PureChatGPTInterface 최적화 - 메시지 영역 컴포넌트 분리
 */
export const ChatView: React.FC<ChatViewProps> = ({
    currentChat,
    messages,
    loading,
    scrollContainerRef,
    messagesEndRef,
    messageSearchTerm,
    onMessageSearchChange,
    highlightedMessageIds,
    detectedRequests,
    editingMessageId,
    editingMessageContent,
    onEditMessage,
    onCancelEdit,
    onSaveEdit,
    onRegenerateMessage,
    onCopyMessage,
    onLoadToInput,
    onDeleteMessage,
    adjustTextareaHeight,
    inputRef,
    multiIntentState,
    aggregateMetrics,
    actionStatus,
    onCopyResponse,
    onUseAsPrompt,
    onFollowUpAction,
    pinnedIds,
    starredIds,
    showHistoryPanel,
    multiIntentHistory,
    pinnedResults,
    recentHistory,
    onTogglePin,
    onToggleStar,
    onLoadHistoryToInput,
    onResetHistory,
    onCloseHistoryPanel,
    onSelectProject,
    apiConnectionStatus,
    getApiStatusTitle,
    getApiStatusText,
    chatUpdatedLabel,
    activeTopTab,
}) => {
    // 대화 경험 향상 훅
    const chatEnhancements = useChatEnhancements({
        enableSmartSuggestions: true,
        enableRealTimeSync: true,
        enableTypingIndicators: true,
        enableReadReceipts: false, // 1:1 대화에서는 불필요
        enableReactions: true,
        enableQuickReplies: true,
    });

    // 빠른 답장 핸들러
    const handleQuickReply = useCallback((reply: { text: string; id: string }) => {
        onLoadToInput(reply.text);
        if (inputRef.current) {
            inputRef.current.focus();
            adjustTextareaHeight(inputRef.current);
        }
    }, [onLoadToInput, inputRef, adjustTextareaHeight]);

    // 메시지 반응 핸들러
    const handleReactionClick = useCallback((messageId: string, reaction: string) => {
        chatEnhancements.sendReaction(messageId, reaction);
    }, [chatEnhancements]);    // 접근성 훅 (Task-C1: 접근성 개선)
    const { announce, focusElement } = useAccessibility({ announceChanges: true });

    // 메시지가 변경될 때 스크린 리더에 알림
    React.useEffect(() => {
        if (messages.length > 0 && !loading) {
            const lastMessage = messages.at(-1);
            if (lastMessage?.role === 'assistant' && lastMessage.content) {
                announce(`새 AI 응답이 도착했습니다. ${lastMessage.content}`);
            }
        }
    }, [messages, loading, announce]);

    // 키보드 네비게이션 (Task-C1: 접근성 개선)
    useKeyboardNavigation({
        enabled: true,
        onArrowUp: () => {
            // 위쪽 화살표: 이전 메시지로 포커스 이동
            const messageElements = scrollContainerRef.current?.querySelectorAll('[data-message-id]');
            if (messageElements && messageElements.length > 0) {
                const currentIndex = Array.from(messageElements).findIndex(
                    (el) => el === document.activeElement || el.contains(document.activeElement)
                );
                if (currentIndex > 0) {
                    const prevElement = messageElements[currentIndex - 1] as HTMLElement;
                    focusElement(prevElement);
                } else if (currentIndex === -1 && messageElements.length > 0) {
                    // 포커스가 없으면 마지막 메시지로 이동
                    const lastElement = messageElements[messageElements.length - 1] as HTMLElement;
                    focusElement(lastElement);
                }
            }
        },
        onArrowDown: () => {
            // 아래쪽 화살표: 다음 메시지로 포커스 이동
            const messageElements = scrollContainerRef.current?.querySelectorAll('[data-message-id]');
            if (messageElements && messageElements.length > 0) {
                const currentIndex = Array.from(messageElements).findIndex(
                    (el) => el === document.activeElement || el.contains(document.activeElement)
                );
                if (currentIndex >= 0 && currentIndex < messageElements.length - 1) {
                    const nextElement = messageElements[currentIndex + 1] as HTMLElement;
                    focusElement(nextElement);
                } else if (currentIndex === -1 && messageElements.length > 0) {
                    // 포커스가 없으면 첫 메시지로 이동
                    const firstElement = messageElements[0] as HTMLElement;
                    focusElement(firstElement);
                }
            }
        },
        onHome: () => {
            // Ctrl/Cmd + Home: 첫 메시지로 스크롤
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = 0;
                const messageElements = scrollContainerRef.current?.querySelectorAll('[data-message-id]');
                if (messageElements && messageElements.length > 0) {
                    const firstElement = messageElements[0] as HTMLElement;
                    focusElement(firstElement);
                }
            }
        },
        onEnd: () => {
            // Ctrl/Cmd + End: 마지막 메시지로 스크롤
            if (scrollContainerRef.current && messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
                const messageElements = scrollContainerRef.current?.querySelectorAll('[data-message-id]');
                if (messageElements && messageElements.length > 0) {
                    const lastElement = messageElements[messageElements.length - 1] as HTMLElement;
                    focusElement(lastElement);
                }
            }
        },
        onEscape: () => {
            // Escape: 편집 모드 취소 또는 포커스 해제
            if (editingMessageId) {
                onCancelEdit();
                announce('편집이 취소되었습니다.');
            } else if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
        },
        preventDefault: true,
    });

    // 성능 최적화: 메시지가 많을 때 지연 로딩 활성화 여부 결정
    const ENABLE_LAZY_LOADING_THRESHOLD = 30; // 30개 이상일 때 지연 로딩 활성화
    const shouldEnableLazyLoading = messages.length >= ENABLE_LAZY_LOADING_THRESHOLD;

    // 메시지 메모이제이션 (Task-C1: 성능 개선)
    const memoizedMessages = useMemo(() => {
        return messages.map((msg, index) => {
            const isLastMessage = index === messages.length - 1;
            const isEmptyAssistant = msg.role === 'assistant' && !msg.content;
            // 빈 assistant 메시지이거나 스트리밍 중인 경우 타이핑 인디케이터 표시
            const showTyping = isEmptyAssistant && (loading || isLastMessage) && msg.isStreaming;
            const isEditing = editingMessageId === msg.id;
            const isHighlighted = highlightedMessageIds.has(msg.id);
            // 스트리밍 중인지 확인: 마지막 assistant 메시지이고, 내용이 있고, 로딩 중이면 스트리밍 중
            const isStreaming = isLastMessage && msg.role === 'assistant' && msg.content && loading;
            const streamingStage = msg.streamingStage;
            const questionType = msg.questionType; // 질문 유형 추출

            return {
                ...msg,
                isLastMessage,
                isEmptyAssistant,
                showTyping,
                isEditing,
                isHighlighted,
                isStreaming,
                streamingStage,
                questionType, // 질문 유형 포함
                shouldLazyLoad: shouldEnableLazyLoading && index < messages.length - 10, // 마지막 10개는 항상 로드
            };
        });
    }, [messages, loading, editingMessageId, highlightedMessageIds, shouldEnableLazyLoading]);

    return (
        <div
            className="chat-view"
            ref={scrollContainerRef}
            role="log"
            aria-label="대화 메시지 목록"
            aria-live="polite"
            aria-atomic="false"
        >
            {currentChat ? (
                <header className="chat-session-header">
                    <div className="chat-session-info">
                        <h2 className="chat-session-title" id="chat-title">
                            {currentChat.title || '새 대화'}
                        </h2>
                        {currentChat.summary && (
                            <p className="chat-session-summary" aria-describedby="chat-title">
                                {currentChat.summary}
                            </p>
                        )}
                    </div>
                    <div className="chat-session-meta" aria-live="polite">
                        <span aria-label={`총 ${messages.length}개의 메시지`}>
                            {messages.length}개의 메시지
                        </span>
                        {chatUpdatedLabel && (
                            <span aria-label={`최근 업데이트: ${chatUpdatedLabel}`}>
                                최근 {chatUpdatedLabel}
                            </span>
                        )}
                        {/* API 연결 상태 표시 */}
                        <span
                            className={`api-status ${apiConnectionStatus}`}
                            title={getApiStatusTitle(apiConnectionStatus)}
                            aria-label={getApiStatusTitle(apiConnectionStatus)}
                            aria-live="polite"
                        >
                            {getApiStatusText(apiConnectionStatus)}
                        </span>
                        {currentChat.projectId && (
                            <button
                                type="button"
                                className="chat-session-action"
                                onClick={() => currentChat.projectId && onSelectProject(currentChat.projectId)}
                                aria-label="연결된 프로젝트 보기"
                            >
                                연결된 프로젝트 보기
                            </button>
                        )}
                    </div>
                </header>
            ) : (
                <div className="chat-session-placeholder" aria-live="polite">
                    원하는 프로젝트를 선택하거나 새 대화를 시작하면 대화가 여기에 표시됩니다.
                </div>
            )}
            {detectedRequests.length > 1 && (
                <section className="multi-request-indicator" aria-label="감지된 요청 목록">
                    <div className="indicator-title" aria-label={`감지된 요청 ${detectedRequests.length}개`}>
                        감지된 요청 {detectedRequests.length}개
                    </div>
                    <ul className="indicator-tags">
                        {detectedRequests.map((req) => (
                            <li
                                key={req.index}
                                className={`indicator-tag ${req.type}`}
                                aria-label={`요청 ${req.index + 1}: ${req.type}`}
                            >
                                {req.index + 1}. {req.type}
                            </li>
                        ))}
                    </ul>
                </section>
            )}
            {/* 메시지 검색 바 */}
            {messages.length > 0 && (
                <div className="message-search-bar" role="search">
                    <label htmlFor="message-search-input" className="sr-only">
                        메시지 검색
                    </label>
                    <input
                        id="message-search-input"
                        type="text"
                        className="chat-search-input"
                        placeholder="메시지 검색... (Ctrl+K)"
                        value={messageSearchTerm}
                        onChange={(e) => onMessageSearchChange(e.target.value)}
                        aria-label="메시지 검색"
                        aria-describedby="search-results-count"
                    />
                    {messageSearchTerm && (
                        <span
                            id="search-results-count"
                            className="search-results-count"
                            aria-live="polite"
                        >
                            {highlightedMessageIds.size}개 결과
                        </span>
                    )}
                </div>
            )}

            {messages.length === 0 && !loading ? (
                <div className="chat-session-placeholder" aria-live="polite">
                    메시지를 입력하면 대화가 여기에 표시됩니다.
                </div>
            ) : (
                <ol aria-label={`${messages.length}개의 메시지`} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {memoizedMessages.map((msgData) => {
                        const { id, role, content, timestamp, showTyping, isEditing, isHighlighted, isStreaming, streamingStage, questionType, shouldLazyLoad } = msgData;

                        // 타이핑 중이면 TypingIndicator 표시 (처리 단계 포함)
                        if (showTyping) {
                            return (
                                <li key={`typing-${id}`} style={{ listStyle: 'none' }}>
                                    <TypingIndicator />
                                </li>
                            );
                        }

                        return (
                            <li key={id} style={{ listStyle: 'none' }}>
                                <MemoizedChatMessage
                                    id={id}
                                    role={role}
                                    content={content}
                                    timestamp={new Date(timestamp).toLocaleString('ko-KR', {
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                    editing={isEditing}
                                    editingContent={editingMessageContent}
                                    onEdit={onEditMessage}
                                    onEditCancel={onCancelEdit}
                                    onEditSave={(msgId, _msgContent) => {
                                        onSaveEdit(msgId);
                                    }}
                                    onRegenerate={onRegenerateMessage}
                                    onCopy={onCopyMessage}
                                    onLoadToInput={(msgContent) => {
                                        onLoadToInput(msgContent);
                                        if (inputRef.current) {
                                            inputRef.current.focus();
                                            adjustTextareaHeight(inputRef.current);
                                        }
                                    }}
                                    onDelete={onDeleteMessage}
                                    searchTerm={messageSearchTerm}
                                    highlighted={isHighlighted}
                                    isStreaming={!!isStreaming}
                                    streamingStage={streamingStage || undefined}
                                    questionType={questionType}
                                    shouldLazyLoad={shouldLazyLoad}
                                    reactions={chatEnhancements.getMessageReactions(id)}
                                    currentUserId="current-user"
                                    onReactionClick={(reaction) => handleReactionClick(id, reaction)}
                                />
                            </li>
                        );
                    })}
                </ol>
            )}
            {/* 추가 로딩 인디케이터 (메시지가 없거나 마지막 메시지가 user일 때) */}
            {loading && (messages.length === 0 || messages.at(-1)?.role === 'user') && (
                <TypingIndicator />
            )}
            {/* 실시간 타이핑 인디케이터 */}
            {chatEnhancements.typingUsers.length > 0 && (
                <div className="typing-users-indicator">
                    {chatEnhancements.typingUsers.map((user) => (
                        <div key={user.userId} className="typing-user">
                            <span className="typing-user-name">{user.userName}</span>
                            <span className="typing-user-text">입력 중...</span>
                        </div>
                    ))}
                </div>
            )}
            {/* 빠른 답장 */}
            {chatEnhancements.quickReplies.length > 0 && (
                <QuickReplies
                    replies={chatEnhancements.quickReplies}
                    onReplyClick={handleQuickReply}
                    showCategory={false}
                />
            )}
            {/* 스마트 추천 */}
            {!loading && messages.length > 0 && (
                <div className="smart-recommendations-container" style={{ marginTop: '16px', marginBottom: '16px' }}>
                    <SmartRecommendations
                        currentMessage={messages.at(-1)?.content || ''}
                        onRecommendationClick={(recommendation) => {
                            onLoadToInput(recommendation.title);
                            if (inputRef.current) {
                                inputRef.current.focus();
                                adjustTextareaHeight(inputRef.current);
                            }
                        }}
                        showPersonalized={true}
                        showContextual={true}
                    />
                </div>
            )}
            {!loading && multiIntentState && multiIntentState.responses.length > 0 && (
                <MultiIntentResponseView
                    summary={multiIntentState.summary || undefined}
                    responses={multiIntentState.responses.map((res: MultiIntentResponse) => ({
                        index: res.index,
                        type: res.type,
                        prompt: res.prompt,
                        response: res.response,
                        qualityScore: res.qualityScore,
                        confidence: res.confidence,
                        processingTime: res.processingTime,
                    }))}
                    totalResponses={aggregateMetrics?.totalResponses || multiIntentState.responses.length}
                    averageQuality={aggregateMetrics?.averageQuality}
                    averageConfidence={aggregateMetrics?.averageConfidence}
                    totalProcessing={aggregateMetrics?.totalProcessing}
                    actionStatus={actionStatus}
                    onCopyResponse={onCopyResponse}
                    onUseAsPrompt={onUseAsPrompt}
                    onFollowUpAction={onFollowUpAction}
                    onPin={(_index) => {
                        const resultId = multiIntentState.id;
                        onTogglePin(resultId);
                    }}
                    onStar={(_index) => {
                        const resultId = multiIntentState.id;
                        onToggleStar(resultId);
                    }}
                    pinnedIndices={new Set(pinnedIds.includes(multiIntentState.id) ? [0] : [])}
                    starredIndices={new Set(starredIds.includes(multiIntentState.id) ? [0] : [])}
                />
            )}
            {showHistoryPanel && activeTopTab !== 'mindmap' && (
                <aside className="history-panel" aria-label="멀티 인텐트 히스토리">
                    <div className="history-header">
                        <div>
                            <strong>멀티 인텐트 히스토리</strong>
                            <span className="history-count" aria-label={`총 ${multiIntentHistory.length}건`}>
                                총 {multiIntentHistory.length}건
                            </span>
                        </div>
                        <div className="history-header-actions">
                            <button
                                type="button"
                                className="history-action-btn"
                                onClick={onResetHistory}
                                aria-label="전체 히스토리 초기화"
                            >
                                전체 초기화
                            </button>
                            <button
                                type="button"
                                className="history-action-btn secondary"
                                onClick={onCloseHistoryPanel}
                                aria-label="히스토리 패널 닫기"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                    {pinnedResults.length > 0 && (
                        <section className="history-section" aria-label="고정된 결과">
                            <div className="history-section-title" aria-label={`고정된 결과 ${pinnedResults.length}개`}>
                                📌 고정됨
                            </div>
                            <ul className="history-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {pinnedResults.map((entry) => (
                                    <li key={entry.id} style={{ listStyle: 'none' }}>
                                        <article className="history-card">
                                            <header className="history-card-header">
                                                {entry.timestamp && (
                                                    <span className="history-timestamp" aria-label={`작성 시간: ${new Date(entry.timestamp).toLocaleString()}`}>
                                                        {new Date(entry.timestamp).toLocaleString()}
                                                    </span>
                                                )}
                                                <div className="history-card-actions">
                                                    <button
                                                        type="button"
                                                        onClick={() => onTogglePin(entry.id)}
                                                        className="history-icon-btn active"
                                                        aria-label="고정 해제"
                                                        aria-pressed="true"
                                                    >
                                                        📌
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => onToggleStar(entry.id)}
                                                        className={`history-icon-btn ${starredIds.includes(entry.id) ? 'active' : ''}`}
                                                        aria-label={starredIds.includes(entry.id) ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                                                        aria-pressed={starredIds.includes(entry.id)}
                                                    >
                                                        ⭐
                                                    </button>
                                                </div>
                                            </header>
                                            <div className="history-card-body">
                                                <div className="history-requests">
                                                    {entry.requests?.map((req: ParsedRequest) => (
                                                        <div key={req.index} className="history-request-item">
                                                            {req.index + 1}. [{req.type}] {req.content}
                                                        </div>
                                                    ))}
                                                </div>
                                                {entry.summary && (
                                                    <div className="history-summary">
                                                        <strong>요약:</strong> {entry.summary}
                                                    </div>
                                                )}
                                            </div>
                                            <footer className="history-card-footer">
                                                <button
                                                    type="button"
                                                    className="history-action-btn"
                                                    onClick={() => onLoadHistoryToInput(entry)}
                                                >
                                                    입력창으로 불러오기
                                                </button>
                                            </footer>
                                        </article>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                    <section className="history-section" aria-label="최근 결과">
                        <div className="history-section-title" aria-label={`최근 결과 ${recentHistory.length}개`}>
                            🗂️ 최근 결과
                        </div>
                        {recentHistory.length === 0 ? (
                            <div className="history-empty" aria-live="polite">
                                최근 결과가 없습니다.
                            </div>
                        ) : (
                            <ul className="history-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {recentHistory.map((entry) => (
                                    <li key={entry.id} style={{ listStyle: 'none' }}>
                                        <article className="history-card">
                                            <header className="history-card-header">
                                                {entry.timestamp && (
                                                    <span className="history-timestamp" aria-label={`작성 시간: ${new Date(entry.timestamp).toLocaleString()}`}>
                                                        {new Date(entry.timestamp).toLocaleString()}
                                                    </span>
                                                )}
                                                <div className="history-card-actions">
                                                    <button
                                                        type="button"
                                                        onClick={() => onTogglePin(entry.id)}
                                                        className={`history-icon-btn ${pinnedIds.includes(entry.id) ? 'active' : ''}`}
                                                        aria-label={pinnedIds.includes(entry.id) ? '고정 해제' : '고정'}
                                                        aria-pressed={pinnedIds.includes(entry.id)}
                                                    >
                                                        📌
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => onToggleStar(entry.id)}
                                                        className={`history-icon-btn ${starredIds.includes(entry.id) ? 'active' : ''}`}
                                                        aria-label={starredIds.includes(entry.id) ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                                                        aria-pressed={starredIds.includes(entry.id)}
                                                    >
                                                        ⭐
                                                    </button>
                                                </div>
                                            </header>
                                            <div className="history-card-body">
                                                <div className="history-requests">
                                                    {entry.requests?.map((req: ParsedRequest) => (
                                                        <div key={req.index} className="history-request-item">
                                                            {req.index + 1}. [{req.type}] {req.content}
                                                        </div>
                                                    ))}
                                                </div>
                                                {entry.summary && (
                                                    <div className="history-summary">
                                                        <strong>요약:</strong> {entry.summary}
                                                    </div>
                                                )}
                                            </div>
                                            <footer className="history-card-footer">
                                                <button
                                                    type="button"
                                                    className="history-action-btn"
                                                    onClick={() => onLoadHistoryToInput(entry)}
                                                    aria-label="히스토리 항목을 입력창으로 불러오기"
                                                >
                                                    입력창으로 불러오기
                                                </button>
                                            </footer>
                                        </article>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                    {starredIds.length > 0 && (
                        <div className="history-footer" aria-live="polite">
                            <span aria-label={`즐겨찾기 ${starredIds.length}건`}>
                                ⭐ 즐겨찾기: {starredIds.length}건
                            </span>
                        </div>
                    )}
                </aside>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};

// 메모이제이션된 ChatMessage 컴포넌트 (Task-C1: 성능 개선)
const MemoizedChatMessage = memo<ChatMessageProps>(ChatMessage, (prevProps, nextProps) => {
    // props가 변경되지 않으면 리렌더링 방지
    return (
        prevProps.id === nextProps.id &&
        prevProps.content === nextProps.content &&
        prevProps.editing === nextProps.editing &&
        prevProps.editingContent === nextProps.editingContent &&
        prevProps.highlighted === nextProps.highlighted &&
        prevProps.searchTerm === nextProps.searchTerm &&
        prevProps.isStreaming === nextProps.isStreaming &&
        prevProps.streamingStage === nextProps.streamingStage &&
        prevProps.questionType === nextProps.questionType
    );
});

MemoizedChatMessage.displayName = 'MemoizedChatMessage';

export default ChatView;
