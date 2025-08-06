import React, { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon, MicrophoneIcon, StopIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { ChatMessage } from '../types/project';

interface RealTimeChatProps {
  projectId: string;
  onSendMessage: (message: string) => void;
  messages: ChatMessage[];
  isTyping: boolean;
}

const RealTimeChat: React.FC<RealTimeChatProps> = ({
  projectId,
  onSendMessage,
  messages,
  isTyping
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // 음성 인식 지원 여부 확인
    setIsVoiceSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }, []);

  useEffect(() => {
    // 새 메시지가 추가되면 자동 스크롤
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    onSendMessage(inputMessage.trim());
    setInputMessage('');
    
    // 입력창 높이 초기화
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    
    // 자동 높이 조절 (최대 6줄)
    const textarea = e.target;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 144); // 6줄 * 24px
    textarea.style.height = `${newHeight}px`;
  };

  const startVoiceRecording = () => {
    if (!isVoiceSupported) return;
    
    setIsRecording(true);
    // 실제 음성 인식 구현
    // 여기서는 시뮬레이션
    setTimeout(() => {
      const sampleText = "안녕하세요, 프로젝트에 대해 질문이 있습니다.";
      setInputMessage(sampleText);
      setIsRecording(false);
    }, 2000);
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageTypeIcon = (type: ChatMessage['type']) => {
    switch (type) {
      case 'question':
        return <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">Q</div>;
      case 'answer':
        return <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">A</div>;
      case 'system':
        return <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs">S</div>;
      case 'file':
        return <DocumentIcon className="w-5 h-5 text-blue-500" />;
      case 'image':
        return <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">I</div>;
      default:
        return <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">?</div>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border">
      {/* 채팅 헤더 */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">AI</span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">CORBU AI 어시스턴트</h3>
            <p className="text-xs text-gray-500">실시간 대화 및 프로젝트 지원</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isTyping && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          )}
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PaperAirplaneIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">대화를 시작해보세요</h3>
            <p className="text-gray-500">프로젝트에 대한 질문이나 도움이 필요한 내용을 말씀해주세요.</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[80%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {!message.isUser && getMessageTypeIcon(message.type)}
                <div className={`rounded-lg px-4 py-2 ${
                  message.isUser 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.isUser ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
                {message.isUser && getMessageTypeIcon(message.type)}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="border-t p-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요... (Shift + Enter로 줄바꿈)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '144px' }}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            {isVoiceSupported && (
              <button
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                className={`p-3 rounded-lg transition-colors ${
                  isRecording 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isRecording ? '음성 녹음 중지' : '음성 녹음 시작'}
              >
                {isRecording ? <StopIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />}
              </button>
            )}
            
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="메시지 전송"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* 음성 녹음 상태 표시 */}
        {isRecording && (
          <div className="mt-2 flex items-center space-x-2 text-sm text-red-600">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>음성을 녹음하고 있습니다...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeChat; 