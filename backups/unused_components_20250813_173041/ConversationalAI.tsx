import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface ConversationMessage {
    id: string;
    type: 'user' | 'ai';
    content: string;
    timestamp: string;
    suggestions?: string[];
    actions?: string[];
    data?: any;
}

interface ConversationalAIProps {
    roomId?: string;
    onSendMessage?: (message: string) => void;
}

const ConversationalAI: React.FC<ConversationalAIProps> = ({ roomId, onSendMessage }) => {
    const [messages, setMessages] = useState<ConversationMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (content: string) => {
        if (!content.trim()) return;

        const userMessage: ConversationMessage = {
            id: Date.now().toString(),
            type: 'user',
            content,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:8003/api/v7/conversation', {
                user_input: content,
                context: { roomId },
                session_id: roomId || 'default'
            });

            if (response.data.success) {
                const aiMessage: ConversationMessage = {
                    id: (Date.now() + 1).toString(),
                    type: 'ai',
                    content: response.data.message,
                    timestamp: new Date().toISOString(),
                    suggestions: response.data.suggestions,
                    actions: response.data.actions,
                    data: response.data.data
                };

                setMessages(prev => [...prev, aiMessage]);

                // 제안이 있으면 표시
                if (response.data.suggestions && response.data.suggestions.length > 0) {
                    setCurrentSuggestions(response.data.suggestions);
                    setShowSuggestions(true);
                } else {
                    setShowSuggestions(false);
                }
            }
        } catch (error) {
            console.error('대화 처리 오류:', error);
            const errorMessage: ConversationMessage = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: '죄송합니다. 대화 처리 중 오류가 발생했습니다.',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = () => {
        if (inputValue.trim() && !isLoading) {
            sendMessage(inputValue);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        sendMessage(suggestion);
        setShowSuggestions(false);
    };

    const handleActionClick = (action: string) => {
        // 액션 처리
        console.log('액션 실행:', action);
        if (onSendMessage) {
            onSendMessage(`액션: ${action}`);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 rounded-lg">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-t-lg">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">개포우성7차 AI 어시스턴트</h3>
                        <p className="text-sm text-blue-100">프로젝트 관련 모든 것을 도와드립니다</p>
                    </div>
                </div>
            </div>

            {/* 메시지 영역 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <p className="text-lg font-medium mb-2">안녕하세요!</p>
                        <p className="text-sm">개포우성7차 프로젝트에 대해 무엇이든 물어보세요.</p>
                        <div className="mt-4 space-y-2">
                            <button
                                onClick={() => sendMessage("메시지 생성해줘")}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                            >
                                메시지 생성
                            </button>
                            <button
                                onClick={() => sendMessage("프로젝트 분석해줘")}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors ml-2"
                            >
                                프로젝트 분석
                            </button>
                            <button
                                onClick={() => sendMessage("일정 확인해줘")}
                                className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition-colors ml-2"
                            >
                                일정 확인
                            </button>
                        </div>
                    </div>
                )}

                {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.type === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-800 shadow-sm'
                            }`}>
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                                {new Date(message.timestamp).toLocaleTimeString()}
                            </p>

                            {/* AI 메시지의 제안 및 액션 */}
                            {message.type === 'ai' && message.suggestions && message.suggestions.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    <p className="text-xs font-medium text-gray-600">제안:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {message.suggestions.map((suggestion, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 transition-colors"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {message.type === 'ai' && message.actions && message.actions.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-xs font-medium text-gray-600">액션:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {message.actions.map((action, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleActionClick(action)}
                                                className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200 transition-colors"
                                            >
                                                {action}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white text-gray-800 shadow-sm px-4 py-2 rounded-lg">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* 입력 영역 */}
            <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex space-x-2">
                    <div className="flex-1 relative">
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="메시지를 입력하세요..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={1}
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isLoading}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        전송
                    </button>
                </div>

                {/* 빠른 제안 */}
                {showSuggestions && currentSuggestions.length > 0 && (
                    <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-2">빠른 제안:</p>
                        <div className="flex flex-wrap gap-2">
                            {currentSuggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConversationalAI; 