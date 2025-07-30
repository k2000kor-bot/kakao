import React, { useState, useRef, useEffect } from 'react';
import {
    PaperAirplaneIcon,
    UserIcon,
    ComputerDesktopIcon,
    ClipboardDocumentIcon,
    CheckIcon,
    DocumentIcon,
    SpeakerWaveIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

const ChatGPTInterface: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        // AI 응답 시뮬레이션
        setTimeout(() => {
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `안녕하세요! "${inputMessage}"에 대한 CORBU AI의 답변입니다. 고급 AI 시스템이 정상적으로 작동하고 있으며, 실시간으로 대화를 분석하고 있습니다.`,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
            setIsLoading(false);
        }, 1500);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleVoiceInput = () => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new (window as any).webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'ko-KR';

            recognition.onstart = () => {
                setIsRecording(true);
            };

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInputMessage(transcript);
                setIsRecording(false);
            };

            recognition.onerror = () => {
                setIsRecording(false);
            };

            recognition.start();
        } else {
            alert('음성 인식이 지원되지 않는 브라우저입니다.');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="chatgpt-interface">
            {/* 헤더 */}
            <div className="chatgpt-header">
                <h2>
                    <span className="header-icon">🤖</span>
                    CORBU AI 인터페이스
                </h2>
                <div className="ai-status">
                    <span className="status-indicator status-online"></span>
                    <span className="status-text">고급 AI 모델 연결됨</span>
                </div>
            </div>

            {/* 메시지 영역 */}
            <div className="chatgpt-messages">
                {messages.length === 0 && (
                    <div className="welcome-message-ai">
                        <div className="welcome-icon">🧠</div>
                        <h3>CORBU AI 인터페이스에 오신 것을 환영합니다</h3>
                        <p>고급 AI 모델과 대화를 시작하세요. 질문이나 요청사항을 입력해 주세요.</p>
                        <div className="ai-capabilities">
                            <div className="capability-item">
                                <span className="capability-icon">💬</span>
                                <span>실시간 대화 분석</span>
                            </div>
                            <div className="capability-item">
                                <span className="capability-icon">🎯</span>
                                <span>맥락 이해</span>
                            </div>
                            <div className="capability-item">
                                <span className="capability-icon">🚀</span>
                                <span>고급 AI 응답</span>
                            </div>
                        </div>
                    </div>
                )}

                {messages.map((message) => (
                    <div key={message.id} className={`message ${message.role}`}>
                        <div className="message-avatar">
                            {message.role === 'user' ? (
                                <UserIcon className="avatar-icon user" />
                            ) : (
                                <ComputerDesktopIcon className="avatar-icon assistant" />
                            )}
                        </div>
                        <div className="message-content-wrapper">
                            <div className="message-content">
                                {message.content}
                            </div>
                            <div className="message-actions">
                                <button
                                    className="action-btn copy-btn"
                                    onClick={() => copyToClipboard(message.content)}
                                    title="복사"
                                >
                                    <ClipboardDocumentIcon className="action-icon" />
                                </button>
                                <span className="message-time">
                                    {message.timestamp.toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="message assistant loading">
                        <div className="message-avatar">
                            <ComputerDesktopIcon className="avatar-icon assistant" />
                        </div>
                        <div className="message-content-wrapper">
                            <div className="message-content loading-indicator">
                                <span className="loading-dot"></span>
                                <span className="loading-dot"></span>
                                <span className="loading-dot"></span>
                                <span className="loading-text">CORBU AI가 응답을 생성하고 있습니다...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* 입력 영역 */}
            <div className="chatgpt-input">
                <div className="input-container">
                    <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="메시지를 입력하세요... (Enter로 전송, Shift+Enter로 줄바꿈)"
                        className="message-input"
                        rows={1}
                        disabled={isLoading}
                    />
                    <div className="input-actions">
                        <button
                            className={`action-btn voice-btn ${isRecording ? 'recording' : ''}`}
                            onClick={handleVoiceInput}
                            disabled={isLoading}
                            title="음성 입력"
                        >
                            <SpeakerWaveIcon className="action-icon" />
                        </button>
                        <button
                            className="send-btn"
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || isLoading}
                            title="메시지 전송"
                        >
                            <PaperAirplaneIcon className="send-icon" />
                        </button>
                    </div>
                </div>
                <div className="input-hint">
                    <span className="hint-text">💡 CORBU AI는 고급 자연어 처리 기술을 사용하여 정확하고 맥락에 맞는 응답을 제공합니다.</span>
                </div>
            </div>
        </div>
    );
};

export default ChatGPTInterface; 