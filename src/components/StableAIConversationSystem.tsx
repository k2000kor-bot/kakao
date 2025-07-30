import React, { useState } from 'react';

interface StableAIConversationSystemProps {
    selectedChatRoom?: string;
}

const StableAIConversationSystem: React.FC<StableAIConversationSystemProps> = ({
    selectedChatRoom = '기본 채팅방'
}) => {
    const [messages, setMessages] = useState([
        {
            id: '1',
            content: '안녕하세요! AI 대화분석 시스템입니다.',
            sender: 'AI',
            timestamp: new Date().toLocaleString(),
            type: 'text'
        },
        {
            id: '2',
            content: '실시간 분석이 진행 중입니다.',
            sender: 'System',
            timestamp: new Date().toLocaleString(),
            type: 'text'
        }
    ]);

    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            const message = {
                id: Date.now().toString(),
                content: newMessage,
                sender: 'User',
                timestamp: new Date().toLocaleString(),
                type: 'text'
            };
            setMessages(prev => [...prev, message]);
            setNewMessage('');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* 헤더 */}
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-900">AI 대화분석 시스템</h1>
                    <p className="text-gray-600 mt-2">맥락 기반 메시지 자동 생성 및 분석</p>
                </div>

                {/* 메시지 영역 */}
                <div className="p-6">
                    <div className="space-y-4 mb-6">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.sender === 'User' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender === 'User'
                                            ? 'bg-blue-500 text-white'
                                            : message.sender === 'AI'
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-200 text-gray-800'
                                        }`}
                                >
                                    <div className="text-sm font-medium mb-1">{message.sender}</div>
                                    <div className="text-sm">{message.content}</div>
                                    <div className="text-xs opacity-75 mt-1">{message.timestamp}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 입력 영역 */}
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="메시지를 입력하세요..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleSendMessage}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            전송
                        </button>
                    </div>
                </div>

                {/* 상태 정보 */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{messages.length}</div>
                            <div className="text-gray-600">총 메시지</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {messages.filter(m => m.sender === 'AI').length}
                            </div>
                            <div className="text-gray-600">AI 응답</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                                {messages.filter(m => m.sender === 'User').length}
                            </div>
                            <div className="text-gray-600">사용자 메시지</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StableAIConversationSystem; 