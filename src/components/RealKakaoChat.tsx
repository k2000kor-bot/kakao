import React, { useState, useEffect } from 'react';

interface RealKakaoChatProps {
    selectedRoomId: string;
    onNotification: (type: string, message: string) => void;
}

const RealKakaoChat: React.FC<RealKakaoChatProps> = ({ selectedRoomId, onNotification }) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const sendMessage = async () => {
        if (!inputMessage.trim()) return;

        const newMessage = {
            id: Date.now(),
            content: inputMessage,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
        setInputMessage('');
        setIsTyping(true);

        try {
            // 백엔드 API로 메시지 전송
            const response = await fetch('http://localhost:8000/api/v7/generate-gpt-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    target_message: inputMessage,
                    context: '일반 대화'
                })
            });

            if (response.ok) {
                const data = await response.json();
                const aiResponse = {
                    id: Date.now() + 1,
                    content: data.generated_message || 'AI 응답을 생성했습니다.',
                    sender: 'ai',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiResponse]);
                onNotification('success', 'AI 응답이 생성되었습니다.');
            } else {
                throw new Error('API 요청 실패');
            }
        } catch (error) {
            console.error('메시지 전송 실패:', error);
            // 폴백 응답
            const aiResponse = {
                id: Date.now() + 1,
                content: '네, 이해했습니다. CORBU AI가 도움을 드리겠습니다. 추가로 필요한 정보가 있으시면 언제든 말씀해 주세요.',
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiResponse]);
            onNotification('error', 'AI 응답 생성 중 오류가 발생했습니다.');
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

    return (
        <div className="real-kakao-chat">
            <div className="chat-header">
                <h2>
                    <span className="header-icon">💬</span>
                    실시간 채팅 - {selectedRoomId}
                </h2>
                <div className="chat-status">
                    <span className="status-indicator status-online"></span>
                    <span className="status-text">CORBU AI 연결됨</span>
                </div>
            </div>

            <div className="chat-messages">
                {messages.length === 0 && (
                    <div className="welcome-message-chat">
                        <div className="welcome-icon">🧠</div>
                        <h3>CORBU AI 채팅에 오신 것을 환영합니다</h3>
                        <p>메시지를 입력하여 대화를 시작하세요.</p>
                    </div>
                )}

                {messages.map((message) => (
                    <div key={message.id} className={`message ${message.sender}`}>
                        <div className="message-content">
                            {message.content}
                        </div>
                        <div className="message-time">
                            {message.timestamp.toLocaleTimeString()}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="message ai typing">
                        <div className="message-content typing-indicator">
                            <span className="typing-dot"></span>
                            <span className="typing-dot"></span>
                            <span className="typing-dot"></span>
                            <span className="typing-text">CORBU AI가 응답을 생성하고 있습니다...</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="chat-input">
                <div className="input-container">
                    <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="메시지를 입력하세요... (Enter로 전송, Shift+Enter로 줄바꿈)"
                        className="message-input"
                        rows={1}
                        disabled={isTyping}
                    />
                    <button
                        onClick={sendMessage}
                        className="send-button"
                        disabled={!inputMessage.trim() || isTyping}
                    >
                        <span className="send-icon">📤</span>
                        <span className="send-text">전송</span>
                    </button>
                </div>
                <div className="input-hint">
                    <span className="hint-text">💡 CORBU AI가 실시간으로 대화를 분석하고 최적의 응답을 제공합니다.</span>
                </div>
            </div>
        </div>
    );
};

export default RealKakaoChat; 