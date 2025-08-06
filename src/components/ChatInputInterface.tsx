import React, { useState, useRef, useEffect } from 'react';
import {
  PaperAirplaneIcon,
  PlusIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  CogIcon,
  FaceSmileIcon,
  PhotoIcon,
  DocumentIcon,
  VideoCameraIcon,
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface ChatInputInterfaceProps {
  onSendMessage: (message: string) => void;
  onFileUpload: (files: FileList) => void;
  onVoiceInput: () => void;
  isProcessing?: boolean;
  placeholder?: string;
  className?: string;
}

const ChatInputInterface: React.FC<ChatInputInterfaceProps> = ({
  onSendMessage,
  onFileUpload,
  onVoiceInput,
  isProcessing = false,
  placeholder = "무엇이든 물어보세요...",
  className = ""
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 자동 높이 조절
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputMessage]);

  const handleSendMessage = () => {
    if (inputMessage.trim() && !isProcessing) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
      setIsExpanded(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFileUpload(files);
      setShowFileUpload(false);
    }
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    onVoiceInput();
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputMessage(prev => prev + emoji);
    setShowEmoji(false);
  };

  const quickEmojis = ['😊', '👍', '❤️', '🎉', '🔥', '💡', '📝', '✅', '❌', '🤔'];

  const toolOptions = [
    {
      id: 'photo',
      icon: <PhotoIcon className="w-5 h-5" />,
      label: '사진',
      action: () => {
        fileInputRef.current?.click();
        setShowTools(false);
      }
    },
    {
      id: 'document',
      icon: <DocumentIcon className="w-5 h-5" />,
      label: '문서',
      action: () => {
        fileInputRef.current?.click();
        setShowTools(false);
      }
    },
    {
      id: 'video',
      icon: <VideoCameraIcon className="w-5 h-5" />,
      label: '동영상',
      action: () => {
        fileInputRef.current?.click();
        setShowTools(false);
      }
    },
    {
      id: 'settings',
      icon: <CogIcon className="w-5 h-5" />,
      label: '설정',
      action: () => {
        setShowTools(false);
        // 설정 모달 열기 로직
      }
    }
  ];

  return (
    <div className={`bg-white border-t ${className}`}>
      {/* 확장된 입력 영역 */}
      {isExpanded && (
        <div className="p-3 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">추가 옵션</span>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <XMarkIcon className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          
          {/* 도구 버튼들 */}
          <div className="grid grid-cols-4 gap-2">
            {toolOptions.map(tool => (
              <button
                key={tool.id}
                onClick={tool.action}
                className="flex flex-col items-center p-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-gray-600 mb-1">{tool.icon}</div>
                <span className="text-xs text-gray-600">{tool.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 메인 입력 영역 */}
      <div className="p-3">
        <div className="flex items-end space-x-2">
          {/* 파일 업로드 버튼 */}
          <div className="relative">
            <button
              onClick={() => setShowFileUpload(!showFileUpload)}
              className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="파일 첨부"
            >
              <PlusIcon className="w-5 h-5 text-gray-600" />
            </button>
            
            {/* 파일 업로드 드롭다운 */}
            {showFileUpload && (
              <div className="absolute bottom-full left-0 mb-2 bg-white border rounded-lg shadow-lg p-2 min-w-48">
                <div className="text-xs text-gray-500 mb-2 px-2">파일 선택</div>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowFileUpload(false);
                    }}
                    className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded flex items-center space-x-2"
                  >
                    <PhotoIcon className="w-4 h-4 text-gray-500" />
                    <span>사진/이미지</span>
                  </button>
                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowFileUpload(false);
                    }}
                    className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded flex items-center space-x-2"
                  >
                    <DocumentIcon className="w-4 h-4 text-gray-500" />
                    <span>문서</span>
                  </button>
                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowFileUpload(false);
                    }}
                    className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded flex items-center space-x-2"
                  >
                    <VideoCameraIcon className="w-4 h-4 text-gray-500" />
                    <span>동영상</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 도구 버튼 */}
          <button
            onClick={() => setShowTools(!showTools)}
            className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="도구"
          >
            <CogIcon className="w-5 h-5 text-gray-600" />
          </button>

          {/* 메인 입력 필드 */}
          <div className="flex-1 relative">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none max-h-32 overflow-y-auto text-sm"
                disabled={isProcessing}
                rows={1}
              />
              
              {/* 입력 필드 내부 버튼들 */}
              <div className="absolute right-2 top-2 flex items-center space-x-1">
                {/* 이모티콘 버튼 */}
                <button
                  onClick={() => setShowEmoji(!showEmoji)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="이모티콘"
                >
                  <FaceSmileIcon className="w-4 h-4 text-gray-500" />
                </button>
                
                {/* 음성 입력 버튼 */}
                <button
                  onClick={handleVoiceInput}
                  className={`p-1 rounded transition-colors ${
                    isRecording 
                      ? 'bg-red-100 text-red-600' 
                      : 'hover:bg-gray-100 text-gray-500'
                  }`}
                  title="음성 입력"
                >
                  <MicrophoneIcon className="w-4 h-4" />
                </button>
                
                {/* 음성 출력 버튼 */}
                <button
                  className="p-1 hover:bg-gray-100 rounded"
                  title="음성 출력"
                >
                  <SpeakerWaveIcon className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* 이모티콘 선택 패널 */}
            {showEmoji && (
              <div className="absolute bottom-full right-0 mb-2 bg-white border rounded-lg shadow-lg p-2">
                <div className="grid grid-cols-5 gap-1">
                  {quickEmojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => handleEmojiSelect(emoji)}
                      className="p-1 hover:bg-gray-100 rounded text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 도구 패널 */}
            {showTools && (
              <div className="absolute bottom-full left-0 mb-2 bg-white border rounded-lg shadow-lg p-2 min-w-48">
                <div className="text-xs text-gray-500 mb-2 px-2">도구</div>
                <div className="space-y-1">
                  <button className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded">
                    분석 모드
                  </button>
                  <button className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded">
                    가이드 모드
                  </button>
                  <button className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded">
                    프로젝트 모드
                  </button>
                  <button className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded">
                    설정
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 확장 버튼 */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="추가 옵션"
          >
            {isExpanded ? (
              <ChevronDownIcon className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronUpIcon className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* 전송 버튼 */}
          <button
            onClick={handleSendMessage}
            disabled={isProcessing || !inputMessage.trim()}
            className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            title="전송"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>

        {/* 상태 표시 */}
        {isRecording && (
          <div className="mt-2 flex items-center space-x-2 text-sm text-red-600">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
            <span>음성 녹음 중...</span>
          </div>
        )}

        {isProcessing && (
          <div className="mt-2 flex items-center space-x-2 text-sm text-blue-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span>AI가 응답을 생성하고 있습니다...</span>
          </div>
        )}
      </div>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.mp4,.mov"
      />
    </div>
  );
};

export default ChatInputInterface; 