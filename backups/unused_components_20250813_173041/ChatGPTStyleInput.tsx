import React, { useState, useRef, useEffect } from 'react';
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  CommandLineIcon,
  BoltIcon,
  StarIcon,
  HeartIcon,
  FireIcon,
  RocketLaunchIcon,
  PlusIcon,
  MinusIcon,
  XMarkIcon,
  DocumentIcon,
  PhotoIcon,
  FilmIcon,
  MusicalNoteIcon,
  SparklesIcon,
  LightBulbIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ChartBarIcon,
  CogIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import ExpertStyleResponse from './ExpertStyleResponse';

interface ChatGPTStyleInputProps {
  onSendMessage: (message: string, attachments?: File[]) => void;
  onFileUpload?: (files: File[]) => void;
  onVoiceInput?: () => void;
  onAdvancedFeatures?: () => void;
  onGenerateExpertResponse?: (style: string, message: string) => Promise<string>;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  maxLength?: number;
  className?: string;
  showAdvancedFeatures?: boolean;
  showExpertStyles?: boolean;
  projectContext?: {
    name: string;
    files: any[];
    knowledgeBase?: any;
  };
}

const ChatGPTStyleInput: React.FC<ChatGPTStyleInputProps> = ({
  onSendMessage,
  onFileUpload,
  onVoiceInput,
  onAdvancedFeatures,
  onGenerateExpertResponse,
  placeholder = "무엇이든 물어보세요 (최대 10,000자)",
  disabled = false,
  isLoading = false,
  maxLength = 10000,
  className = "",
  showAdvancedFeatures = true,
  showExpertStyles = true,
  projectContext
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);
  const [showExpertPanel, setShowExpertPanel] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 자동 높이 조절
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = isExpanded ? 400 : 200;
      const newHeight = Math.min(scrollHeight, maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [message, isExpanded]);

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSend();
      } else if (e.key === 'Escape') {
        setShowAdvancedPanel(false);
        setShowFileUpload(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [message, attachments]);

  // 제안사항 생성
  useEffect(() => {
    if (message.length > 0 && projectContext) {
      generateSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [message, projectContext]);

  const generateSuggestions = () => {
    const baseSuggestions = [
      "프로젝트 파일을 분석해주세요",
      "주요 내용을 요약해주세요",
      "개선 방안을 제시해주세요",
      "위험 요소를 분석해주세요",
      "다음 단계를 제안해주세요"
    ];

    // 긴 텍스트 입력 시 추가 제안
    if (message.length > 1000) {
      baseSuggestions.push(
        "위 내용을 블로그 포스트 형식으로 작성해주세요",
        "카드뉴스 형식으로 요약해주세요",
        "프레젠테이션 자료로 정리해주세요",
        "뉴스 기사 스타일로 작성해주세요",
        "SNS용 짧은 요약을 만들어주세요"
      );
    }

    if (projectContext?.files && projectContext.files.length > 0) {
      baseSuggestions.push("업로드된 파일들을 분석해주세요");
    }

    if (projectContext?.knowledgeBase) {
      baseSuggestions.push("지식베이스를 활용한 답변을 해주세요");
    }

    setSuggestions(baseSuggestions.slice(0, 5));
  };

  const handleSend = async () => {
    if (!message.trim() || disabled || isLoading) return;

    setIsProcessing(true);
    try {
      await onSendMessage(message.trim(), attachments);
      setMessage('');
      setAttachments([]);
      setIsExpanded(false);
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (files: FileList) => {
    const newFiles = Array.from(files);
    setAttachments(prev => [...prev, ...newFiles]);
    if (onFileUpload) {
      onFileUpload(newFiles);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleVoiceToggle = () => {
    if (isVoiceRecording) {
      setIsVoiceRecording(false);
      // 음성 녹음 중지 로직
    } else {
      setIsVoiceRecording(true);
      if (onVoiceInput) {
        onVoiceInput();
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    setSelectedSuggestion(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Enter' && e.shiftKey) {
      // Shift+Enter로 줄바꿈 허용
      return;
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      // Ctrl/Cmd+Enter로 강제 전송 (긴 텍스트용)
      e.preventDefault();
      handleSend();
    } else if (e.key === 'ArrowDown' && suggestions.length > 0) {
      e.preventDefault();
      setSelectedSuggestion(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp' && suggestions.length > 0) {
      e.preventDefault();
      setSelectedSuggestion(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Escape') {
      // ESC로 확장 모드 토글
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* 전문가 스타일 응답 패널 */}
      {showExpertPanel && onGenerateExpertResponse && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">전문가 스타일 응답</h3>
            <button
              onClick={() => setShowExpertPanel(false)}
              className="text-gray-400 hover:text-gray-600"
              title="패널 닫기"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <ExpertStyleResponse
            message={message}
            projectContext={projectContext}
            onGenerateResponse={onGenerateExpertResponse}
            className="w-full"
          />
        </div>
      )}

      {/* 고급 기능 패널 */}
      {showAdvancedPanel && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">고급 기능</h3>
            <button
              onClick={() => setShowAdvancedPanel(false)}
              className="text-gray-400 hover:text-gray-600"
              title="패널 닫기"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => {
                setMessage(prev => prev + "\n\n📊 분석 요청:\n");
                setShowAdvancedPanel(false);
              }}
              className="flex flex-col items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              title="분석 요청"
            >
              <ChartBarIcon className="w-6 h-6 text-blue-600 mb-1" />
              <span className="text-xs text-blue-700">분석</span>
            </button>

            <button
              onClick={() => {
                setMessage(prev => prev + "\n\n💡 아이디어 요청:\n");
                setShowAdvancedPanel(false);
              }}
              className="flex flex-col items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              title="아이디어 요청"
            >
              <LightBulbIcon className="w-6 h-6 text-green-600 mb-1" />
              <span className="text-xs text-green-700">아이디어</span>
            </button>

            <button
              onClick={() => {
                setMessage(prev => prev + "\n\n🎓 학습 요청:\n");
                setShowAdvancedPanel(false);
              }}
              className="flex flex-col items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              title="학습 요청"
            >
              <AcademicCapIcon className="w-6 h-6 text-purple-600 mb-1" />
              <span className="text-xs text-purple-700">학습</span>
            </button>

            <button
              onClick={() => {
                setMessage(prev => prev + "\n\n📚 지식 요청:\n");
                setShowAdvancedPanel(false);
              }}
              className="flex flex-col items-center p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
              title="지식 요청"
            >
              <BookOpenIcon className="w-6 h-6 text-orange-600 mb-1" />
              <span className="text-xs text-orange-700">지식</span>
            </button>

            <button
              onClick={() => {
                setMessage(prev => prev + "\n\n📝 긴 텍스트 분석:\n");
                setIsExpanded(true);
                setShowAdvancedPanel(false);
              }}
              className="flex flex-col items-center p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              title="긴 텍스트 분석"
            >
              <DocumentIcon className="w-6 h-6 text-red-600 mb-1" />
              <span className="text-xs text-red-700">긴 텍스트</span>
            </button>
          </div>

          {/* 전문가 스타일 섹션 */}
          {showExpertStyles && onGenerateExpertResponse && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">전문가 스타일 응답</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    setShowExpertPanel(true);
                    setShowAdvancedPanel(false);
                  }}
                  className="flex flex-col items-center p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                  title="전문가 스타일 응답"
                >
                  <UserGroupIcon className="w-6 h-6 text-indigo-600 mb-1" />
                  <span className="text-xs text-indigo-700">전문가</span>
                </button>

                <button
                  onClick={() => {
                    setMessage(prev => prev + "\n\n🔬 연구자 관점:\n");
                    setShowAdvancedPanel(false);
                  }}
                  className="flex flex-col items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  title="연구자 관점"
                >
                  <AcademicCapIcon className="w-6 h-6 text-blue-600 mb-1" />
                  <span className="text-xs text-blue-700">연구자</span>
                </button>

                <button
                  onClick={() => {
                    setMessage(prev => prev + "\n\n📈 분석가 관점:\n");
                    setShowAdvancedPanel(false);
                  }}
                  className="flex flex-col items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  title="분석가 관점"
                >
                  <ChartBarIcon className="w-6 h-6 text-green-600 mb-1" />
                  <span className="text-xs text-green-700">분석가</span>
                </button>

                <button
                  onClick={() => {
                    setMessage(prev => prev + "\n\n💭 평론가 관점:\n");
                    setShowAdvancedPanel(false);
                  }}
                  className="flex flex-col items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  title="평론가 관점"
                >
                  <LightBulbIcon className="w-6 h-6 text-purple-600 mb-1" />
                  <span className="text-xs text-purple-700">평론가</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 제안사항 */}
      {suggestions.length > 0 && message.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full text-left p-2 rounded text-sm hover:bg-gray-50 transition-colors ${selectedSuggestion === index ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* 긴 텍스트 입력 도움말 */}
      {message.length > 2000 && !isExpanded && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-sm text-blue-700">
            <LightBulbIcon className="w-4 h-4" />
            <span>긴 텍스트를 입력하고 계시네요! 확장 모드를 사용하면 더 편리합니다.</span>
            <button
              onClick={() => setIsExpanded(true)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              확장하기
            </button>
          </div>
        </div>
      )}

      {/* 첨부 파일 표시 */}
      {attachments.length > 0 && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border">
                <DocumentIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 truncate max-w-32">{file.name}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-gray-400 hover:text-red-500"
                  title="첨부 파일 제거"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 메인 입력창 */}
      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
        <div className="flex items-end p-6">
          {/* 왼쪽: 파일 첨부, 도구 */}
          <div className="flex items-center space-x-4 mr-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isLoading}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="파일 첨부"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-1 text-gray-500">
              <div className="w-4 h-4 bg-gray-600 rounded-sm"></div>
              <span className="text-sm font-medium">도구</span>
            </div>
          </div>

          {/* 텍스트 입력 영역 */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              maxLength={maxLength}
              className="w-full resize-none border-none outline-none bg-transparent text-gray-900 placeholder-gray-500 text-base leading-6 overflow-y-auto"
              rows={1}
              style={{
                minHeight: '24px',
                maxHeight: isExpanded ? '400px' : '200px',
                overflowY: 'auto'
              }}
            />

            {/* 상태 표시 */}
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <span className={`${message.length > maxLength * 0.8 ? 'text-orange-500' : message.length > maxLength * 0.9 ? 'text-red-500' : ''}`}>
                  {message.length.toLocaleString()}/{maxLength.toLocaleString()}
                </span>
                {message.length > 1000 && (
                  <span className="text-blue-500">
                    ({Math.round((message.length / maxLength) * 100)}%)
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {isProcessing && (
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>처리 중...</span>
                  </div>
                )}
                {isLoading && (
                  <div className="flex items-center space-x-1">
                    <SparklesIcon className="w-3 h-3 animate-pulse" />
                    <span>AI 응답 대기 중...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 우측: 음성 입력, 전송 */}
          <div className="flex items-center space-x-2 ml-4">
            {/* 음성 입력 */}
            <button
              onClick={handleVoiceToggle}
              disabled={disabled || isLoading}
              className={`p-2 rounded-lg transition-colors ${isVoiceRecording
                ? 'text-red-500 bg-red-50 hover:bg-red-100'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              title={isVoiceRecording ? '음성 녹음 중지' : '음성 입력'}
            >
              <MicrophoneIcon className="w-5 h-5" />
            </button>

            {/* 전송 버튼 */}
            <button
              onClick={handleSend}
              disabled={!message.trim() || disabled || isLoading || isProcessing}
              className={`p-2 rounded-lg transition-all duration-200 ${message.trim() && !disabled && !isLoading && !isProcessing
                ? 'bg-black text-white hover:bg-gray-800 shadow-md hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              title={message.length > 1000 ? "메시지 전송 (Ctrl+Enter) - 긴 텍스트 모드" : "메시지 전송 (Ctrl+Enter)"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>

        {/* 하단 도구 모음 */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <CommandLineIcon className="w-3 h-3" />
              <span>AI</span>
            </div>
            <div className="flex items-center space-x-1">
              <SparklesIcon className="w-3 h-3" />
              <span>고급</span>
            </div>
            {message.length > 500 && (
              <div className="flex items-center space-x-1 text-blue-500">
                <LightBulbIcon className="w-3 h-3" />
                <span>스마트 분석 모드</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
              title={isExpanded ? "입력창 축소" : "입력창 확장 (긴 텍스트 입력용)"}
            >
              {isExpanded ? (
                <>
                  <MinusIcon className="w-3 h-3" />
                  <span>축소</span>
                </>
              ) : (
                <>
                  <PlusIcon className="w-3 h-3" />
                  <span>확장</span>
                </>
              )}
            </button>
            {message.length > 2000 && (
              <span className="text-xs text-blue-500">
                긴 텍스트 모드
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        className="hidden"
        accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
        aria-label="파일 업로드"
        title="파일 업로드"
      />
    </div>
  );
};

export default ChatGPTStyleInput;
