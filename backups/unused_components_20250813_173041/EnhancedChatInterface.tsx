import React, { useState, useEffect } from 'react';
import {
    PaperAirplaneIcon,
    SparklesIcon,
    CheckCircleIcon,
    XMarkIcon,
    UserIcon,
    ComputerDesktopIcon
} from '@heroicons/react/24/outline';

interface ChatMessage {
    id: string;
    sender: 'user' | 'ai';
    content: string;
    timestamp: string;
    type: 'text' | 'code' | 'suggestion';
    metadata?: {
        format?: string;
        confidence?: number;
        reasoning?: string;
    };
}

const EnhancedChatInterface: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            sender: 'ai',
            content: '안녕하세요! AI 메시지 생성 시스템입니다. 어떤 메시지를 생성하고 싶으신가요?',
            timestamp: new Date().toISOString(),
            type: 'text',
            metadata: {
                format: '친절한 안내',
                confidence: 95
            }
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // 메시지 전송 핸들러
    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isGenerating) return;

        // 사용자 메시지 추가
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            content: inputMessage,
            timestamp: new Date().toISOString(),
            type: 'text'
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsGenerating(true);

        // AI 응답 시뮬레이션
        setTimeout(() => {
            const aiResponse: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                content: generateAIResponse(inputMessage),
                timestamp: new Date().toISOString(),
                type: 'suggestion',
                metadata: {
                    format: '맞춤형 응답',
                    confidence: 88 + Math.random() * 10,
                    reasoning: '입력된 내용을 바탕으로 최적의 응답을 생성했습니다.'
                }
            };

            setMessages(prev => [...prev, aiResponse]);
            setIsGenerating(false);
        }, 1500);
    };

    // AI 응답 생성 로직
    const generateAIResponse = (input: string): string => {
        const responses = [
            `"${input}"에 대해 다음과 같이 응답하는 것이 좋겠습니다:\n\n안녕하세요! 말씀해주신 내용을 잘 이해했습니다. 구체적인 상황을 더 자세히 알려주시면 더욱 정확한 안내를 드릴 수 있습니다.`,
            `"${input}"에 대한 전문적인 응답을 제안합니다:\n\n감사합니다. 해당 사안에 대해 신중히 검토한 결과, 다음과 같은 방향으로 진행하는 것이 바람직할 것 같습니다.`,
            `"${input}"에 대해 친근하면서도 명확한 응답을 추천합니다:\n\n네, 말씀하신 부분 충분히 이해했습니다! 이런 상황에서는 보통 이렇게 접근하는 것이 효과적입니다.`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    };

    // 엔터키 처리
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            {/* 헤더 */}
            <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                        <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900">AI 메시지 생성</h1>
                        <p className="text-sm text-gray-500">상황에 맞는 최적의 메시지를 생성해드립니다</p>
                    </div>
                </div>
            </div>

            {/* 메시지 영역 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-start space-x-3 max-w-3xl ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            {/* 아바타 */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === 'user'
                                    ? 'bg-gray-200'
                                    : 'bg-gradient-to-r from-purple-600 to-blue-600'
                                }`}>
                                {message.sender === 'user' ? (
                                    <UserIcon className="w-5 h-5 text-gray-600" />
                                ) : (
                                    <ComputerDesktopIcon className="w-5 h-5 text-white" />
                                )}
                            </div>

                            {/* 메시지 내용 */}
                            <div className={`rounded-2xl px-4 py-3 ${message.sender === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-900'
                                }`}>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                                {/* AI 메타데이터 */}
                                {message.sender === 'ai' && message.metadata && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span className="flex items-center space-x-2">
                                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                                    {message.metadata.format}
                                                </span>
                                                {message.metadata.confidence && (
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                                        신뢰도 {Math.round(message.metadata.confidence)}%
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                        {message.metadata.reasoning && (
                                            <p className="mt-2 text-xs text-gray-500 italic">
                                                💡 {message.metadata.reasoning}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* 타임스탬프 */}
                                <div className={`mt-2 text-xs ${message.sender === 'user' ? 'text-blue-200' : 'text-gray-400'
                                    }`}>
                                    {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* 로딩 표시 */}
                {isGenerating && (
                    <div className="flex justify-start">
                        <div className="flex items-start space-x-3 max-w-3xl">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                                <ComputerDesktopIcon className="w-5 h-5 text-white" />
                            </div>
                            <div className="bg-gray-100 rounded-2xl px-4 py-3">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">AI가 응답을 생성하고 있습니다...</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 입력 영역 */}
            <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-end space-x-3">
                    <div className="flex-1">
                        <textarea
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                            rows={3}
                            disabled={isGenerating}
                        />
                        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                            <span>{inputMessage.length}자</span>
                            <span>Shift+Enter: 줄바꿈 | Enter: 전송</span>
                        </div>
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={isGenerating || !inputMessage.trim()}
                        className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* 빠른 제안 */}
                <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
                        {[
                            '회의 일정 변경 안내',
                            '프로젝트 진행 상황 공유',
                            '질문에 대한 정중한 응답',
                            '제안서 검토 의견'
                        ].map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => setInputMessage(suggestion)}
                                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                                disabled={isGenerating}
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnhancedChatInterface; 