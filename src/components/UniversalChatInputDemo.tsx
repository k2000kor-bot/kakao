import React, { useState } from 'react';
import UniversalChatInput from './UniversalChatInput';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
}

const UniversalChatInputDemo: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<'default' | 'dark' | 'minimal'>('default');
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showFileUpload, setShowFileUpload] = useState(true);
  const [showVoiceInput, setShowVoiceInput] = useState(true);
  const [showToolButton, setShowToolButton] = useState(true);

  const handleSendMessage = (message: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    // AI 응답 시뮬레이션
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: `"${message}"에 대한 AI 응답입니다. 이것은 UniversalChatInput 컴포넌트의 데모입니다.`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const handleFileUpload = (files: File[]) => {
    console.log('업로드된 파일들:', files);
    
    const fileMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: `파일 업로드: ${files.map(f => f.name).join(', ')}`,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, fileMessage]);
  };

  const handleVoiceInput = () => {
    console.log('음성 입력 시작');
    
    const voiceMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: '🎤 음성 입력 기능이 활성화되었습니다.',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, voiceMessage]);
  };

  const handleToolClick = () => {
    console.log('도구 클릭');
    
    const toolMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: '🔧 도구 메뉴가 열렸습니다.',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, toolMessage]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🚀 UniversalChatInput 데모
          </h1>
          <p className="text-gray-600 mb-6">
            다양한 설정으로 UniversalChatInput 컴포넌트를 테스트해보세요.
          </p>

          {/* 설정 패널 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 테마 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                테마
              </label>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="default">Default</option>
                <option value="dark">Dark</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>

            {/* 크기 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                크기
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            {/* 기능 토글 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                기능
              </label>
              <div className="space-y-1">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showFileUpload}
                    onChange={(e) => setShowFileUpload(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">파일 업로드</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showVoiceInput}
                    onChange={(e) => setShowVoiceInput(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">음성 입력</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showToolButton}
                    onChange={(e) => setShowToolButton(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">도구 버튼</span>
                </label>
              </div>
            </div>

            {/* 상태 표시 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상태
              </label>
              <div className="text-sm text-gray-600">
                <div>메시지: {messages.length}개</div>
                <div>로딩: {isLoading ? '예' : '아니오'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 채팅 영역 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* 메시지 목록 */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-4">💬</div>
                <p>메시지를 입력하여 대화를 시작하세요!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="text-sm">{message.content}</div>
                    <div className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* UniversalChatInput */}
          <div className="p-6 border-t border-gray-200">
            <UniversalChatInput
              onSendMessage={handleSendMessage}
              onFileUpload={handleFileUpload}
              onVoiceInput={handleVoiceInput}
              onToolClick={handleToolClick}
              placeholder="메시지를 입력하거나 기능을 테스트해보세요..."
              isLoading={isLoading}
              disabled={false}
              showFileUpload={showFileUpload}
              showVoiceInput={showVoiceInput}
              showToolButton={showToolButton}
              autoFocus={true}
              theme={selectedTheme}
              size={selectedSize}
              maxHeight={300}
              minHeight={24}
            />
          </div>
        </div>

        {/* 사용법 안내 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📖 사용법</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">키보드 단축키</h3>
              <ul className="space-y-1">
                <li>• <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Enter</kbd> - 메시지 전송</li>
                <li>• <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Shift + Enter</kbd> - 줄바꿈</li>
                <li>• <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Tab</kbd> - 버튼 간 이동</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">기능 테스트</h3>
              <ul className="space-y-1">
                <li>• 파일 업로드 버튼 클릭</li>
                <li>• 음성 입력 버튼 클릭</li>
                <li>• 도구 버튼 클릭</li>
                <li>• 다양한 테마와 크기 테스트</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalChatInputDemo; 