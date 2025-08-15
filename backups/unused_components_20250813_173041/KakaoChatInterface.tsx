import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, FaceSmileIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import { Message } from '../types/conversation';

interface ChatMessage {
    id: string;
    content: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    isTyping?: boolean;
}

interface KakaoChatInterfaceProps {
    messages?: Message[];
}

const KakaoChatInterface: React.FC<KakaoChatInterfaceProps> = ({ messages: externalMessages }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            content: '안녕하세요! 카카오톡 채팅 대응 시스템입니다. 무엇을 도와드릴까요?',
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 외부 메시지가 있으면 초기 메시지로 설정
    useEffect(() => {
        if (externalMessages && externalMessages.length > 0) {
            const convertedMessages: ChatMessage[] = externalMessages.map(msg => ({
                id: msg.id,
                content: msg.content,
                sender: msg.sender === 'user' ? 'user' : 'ai',
                timestamp: new Date(msg.timestamp)
            }));
            setMessages(convertedMessages);
        }
    }, [externalMessages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            content: inputMessage,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);

        // AI 응답 생성
        try {
            const response = await fetch('http://localhost:8004/api/v1/conversation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_message: inputMessage,
                    context: {
                        conversationHistory: messages.slice(-5).map(m => ({
                            sender: m.sender,
                            content: m.content
                        }))
                    }
                })
            });

            const data = await response.json();

            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                content: data.response || data.ai_response || '죄송합니다. 응답을 생성하는 중에 오류가 발생했습니다.',
                sender: 'ai',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('메시지 생성 오류:', error);
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                content: '죄송합니다. 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="flex flex-col h-96 bg-gray-50">
            {/* 채팅 헤더 */}
            <div className="bg-white px-4 py-3 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">K</span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">실시간 카카오톡 대화</h3>
                        <p className="text-sm text-gray-500">AGI 시스템이 대화를 분석하고 응답합니다</p>
                    </div>
                </div>
            </div>

            {/* 메시지 영역 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender === 'user'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white text-gray-900 border border-gray-200'
                                }`}
                        >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                {formatTime(message.timestamp)}
                            </p>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white text-gray-900 border border-gray-200 rounded-lg px-4 py-2">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* 입력 영역 */}
            <div className="bg-white px-4 py-3 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                        <PaperClipIcon className="w-5 h-5" />
                    </button>
                    <div className="flex-1 relative">
                        <textarea
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="메시지를 입력하세요..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={1}
                            style={{ minHeight: '40px', maxHeight: '120px' }}
                        />
                    </div>
                    <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                        <FaceSmileIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={sendMessage}
                        disabled={!inputMessage.trim()}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KakaoChatInterface; 