import React, { useState, useRef, useEffect, useCallback } from 'react';
import SmartFileUpload from './SmartFileUpload';
import { advancedMessageAPI } from '../services/advancedMessageAPI';

interface SmartChatInputProps {
  onSendMessage: (message: string, type?: 'text' | 'file' | 'voice') => void;
  onTyping?: () => void;
  placeholder?: string;
  disabled?: boolean;
  roomId?: string;
}

interface Suggestion {
  id: string;
  text: string;
  type: 'recent' | 'common' | 'smart' | 'command' | 'generated';
  confidence?: number;
  category?: string;
}

const SmartChatInput: React.FC<SmartChatInputProps> = ({
  onSendMessage,
  onTyping,
  placeholder = "메시지를 입력하세요...",
  disabled = false,
  roomId
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showCommands, setShowCommands] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMessageGenerator, setShowMessageGenerator] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // 자동 높이 조절
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  // 명령어 목록
  const commands = [
    { text: '/help', description: '도움말 보기' },
    { text: '/search', description: '메시지 검색' },
    { text: '/clear', description: '채팅 기록 지우기' },
    { text: '/export', description: '대화 내보내기' },
    { text: '/stats', description: '통계 보기' },
    { text: '/mute', description: '알림 끄기' },
    { text: '/unmute', description: '알림 켜기' },
    { text: '/generate', description: 'AI 메시지 생성' }
  ];

  // AI 메시지 생성 함수 (Updated)
  const generateAIMessage = async (context: string = '', topic: string = '', style: string = 'professional') => {
    setIsGenerating(true);
    try {
      const response = await advancedMessageAPI.generateMessage({
        context,
        topic,
        style: style as 'professional' | 'casual' | 'formal',
        roomId
      });

      if (response.success && response.messages) {
        const generatedSuggestions = response.messages.map((msg: any, index: number) => ({
          id: `generated-${index}`,
          text: msg.text,
          type: 'generated' as const,
          confidence: msg.confidence,
          category: msg.category
        }));

        setSuggestions(prev => [...generatedSuggestions, ...prev.slice(0, 2)]);
        setShowSuggestions(true);
        setSelectedSuggestionIndex(-1);

        // 성공 알림
        console.log('AI 메시지 생성 성공:', response.messages);
      } else {
        console.error('AI 메시지 생성 실패:', response.error);
      }
    } catch (error) {
      console.error('AI 메시지 생성 오류:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 스마트 제안 생성
  const generateSuggestions = useCallback((input: string) => {
    const suggestions: Suggestion[] = [];

    // 명령어 제안
    if (input.startsWith('/')) {
      const commandSuggestions = commands
        .filter(cmd => cmd.text.toLowerCase().includes(input.toLowerCase()))
        .map((cmd, index) => ({
          id: `command-${index}`,
          text: cmd.text,
          type: 'command' as const,
          confidence: 1.0,
          category: '명령어'
        }));
      suggestions.push(...commandSuggestions);
    }

    // 최근 메시지 기반 제안
    const recentSuggestions = [
      { id: 'recent-1', text: '안녕하세요!', type: 'recent' as const },
      { id: 'recent-2', text: '감사합니다.', type: 'recent' as const },
      { id: 'recent-3', text: '좋은 하루 되세요.', type: 'recent' as const },
      { id: 'recent-4', text: '네, 알겠습니다.', type: 'recent' as const }
    ];

    // 일반적인 표현 제안
    const commonSuggestions = [
      { id: 'common-1', text: '확인했습니다.', type: 'common' as const },
      { id: 'common-2', text: '잠시만요.', type: 'common' as const },
      { id: 'common-3', text: '좋은 아이디어네요!', type: 'common' as const },
      { id: 'common-4', text: '그렇군요.', type: 'common' as const },
      { id: 'common-5', text: '이해했습니다.', type: 'common' as const }
    ];

    // 개포우성7차 프로젝트 특화 제안
    const projectSuggestions = [
      { id: 'smart-1', text: '시공사 평가 기준에 대해 논의해보시죠.', type: 'smart' as const },
      { id: 'smart-2', text: '공사비 분담금 분석 결과를 공유해주세요.', type: 'smart' as const },
      { id: 'smart-3', text: '설계 품질 비교 자료를 확인해보겠습니다.', type: 'smart' as const },
      { id: 'smart-4', text: '홍보 전략에 대한 의견을 들려주세요.', type: 'smart' as const },
      { id: 'smart-5', text: '시공사별 비교 분석을 진행하겠습니다.', type: 'smart' as const },
      { id: 'smart-6', text: '평면도 설계 검토를 시작하겠습니다.', type: 'smart' as const }
    ];

    if (input.trim()) {
      // 입력된 텍스트와 유사한 제안 필터링
      const allSuggestions = [...recentSuggestions, ...commonSuggestions, ...projectSuggestions];
      const filtered = allSuggestions.filter(s =>
        s.text.toLowerCase().includes(input.toLowerCase())
      );
      suggestions.push(...filtered.slice(0, 5));
    } else {
      // 빈 입력일 때는 프로젝트 특화 제안 우선
      suggestions.push(...projectSuggestions.slice(0, 3));
      suggestions.push(...commonSuggestions.slice(0, 2));
    }

    return suggestions.map((s, index) => ({
      id: s.id || `suggestion-${index}`,
      text: s.text,
      type: s.type,
      confidence: s.confidence || (s.type === 'smart' ? 0.9 : s.type === 'recent' ? 0.7 : 0.5),
      category: s.category || (s.type === 'smart' ? 'AI 제안' : s.type === 'recent' ? '최근' : '일반')
    }));
  }, []);

  // 입력 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // 자동 높이 조절
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 432; // 18줄 * 24px
      const newHeight = Math.min(scrollHeight, maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }

    onTyping?.();
  };

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedSuggestionIndex(prev =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          if (e.shiftKey) {
            // Shift+Enter: 줄바꿈
            return;
          }
          e.preventDefault();
          if (selectedSuggestionIndex >= 0) {
            handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
          } else {
            handleSend();
          }
          break;
        case 'Escape':
          setShowSuggestions(false);
          setShowCommands(false);
          setSelectedSuggestionIndex(-1);
          break;
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'ArrowUp' && !inputValue && inputHistory.length > 0) {
      e.preventDefault();
      // 히스토리 탐색
      const newIndex = historyIndex < inputHistory.length - 1 ? historyIndex + 1 : historyIndex;
      setHistoryIndex(newIndex);
      setInputValue(inputHistory[inputHistory.length - 1 - newIndex] || '');
    } else if (e.key === 'ArrowDown' && historyIndex >= 0) {
      e.preventDefault();
      const newIndex = historyIndex > 0 ? historyIndex - 1 : -1;
      setHistoryIndex(newIndex);
      setInputValue(newIndex >= 0 ? inputHistory[inputHistory.length - 1 - newIndex] : '');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // 탭으로 제안 선택
      if (showSuggestions && suggestions.length > 0) {
        const nextIndex = selectedSuggestionIndex < suggestions.length - 1 ? selectedSuggestionIndex + 1 : 0;
        setSelectedSuggestionIndex(nextIndex);
      }
    }
  };

  // 제안 선택
  const handleSuggestionSelect = (suggestion: Suggestion) => {
    if (suggestion.type === 'command') {
      // 명령어 실행
      handleCommand(suggestion.text);
    } else {
      setInputValue(suggestion.text);
    }
    setShowSuggestions(false);
    setShowCommands(false);
    setSelectedSuggestionIndex(-1);
    textareaRef.current?.focus();
  };

  // 명령어 처리
  const handleCommand = (command: string) => {
    switch (command) {
      case '/help':
        onSendMessage('도움말: /search, /clear, /export, /stats, /mute, /unmute, /generate');
        break;
      case '/search':
        onSendMessage('검색 기능을 활성화했습니다.');
        break;
      case '/clear':
        onSendMessage('채팅 기록을 지웠습니다.');
        break;
      case '/export':
        onSendMessage('대화 내보내기를 시작합니다.');
        break;
      case '/stats':
        onSendMessage('통계 정보를 불러오는 중...');
        break;
      case '/mute':
        onSendMessage('알림을 끄겠습니다.');
        break;
      case '/unmute':
        onSendMessage('알림을 켜겠습니다.');
        break;
      case '/generate':
        setShowMessageGenerator(true);
        break;
      default:
        onSendMessage(`명령어 실행: ${command}`);
    }
  };

  // 메시지 전송
  const handleSend = () => {
    if (inputValue.trim() && !disabled) {
      // 히스토리에 추가
      if (inputValue.trim()) {
        setInputHistory(prev => [inputValue.trim(), ...prev.slice(0, 9)]); // 최대 10개
      }

      onSendMessage(inputValue.trim());
      setInputValue('');
      setShowSuggestions(false);
      setShowCommands(false);
      setSelectedSuggestionIndex(-1);
      setHistoryIndex(-1);
    }
  };

  // 이모지 선택
  const handleEmojiSelect = (emoji: string) => {
    setInputValue(prev => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  // 음성 입력 시작
  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsRecording(true);
      setIsListening(true);

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = 'ko-KR';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setInputValue(prev => prev + finalTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('음성 인식 오류:', event.error);
        setIsRecording(false);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
    }
  };

  // 음성 입력 중지
  const stopVoiceInput = () => {
    setIsRecording(false);
    setIsListening(false);
  };

  // 클릭 외부 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const emojis = ['😊', '👍', '❤️', '🎉', '🔥', '💡', '📝', '✅', '❌', '🤔', '👏', '🙏'];

  // 파일 업로드 처리
  const handleFileUpload = (file: File) => {
    // 파일을 메시지로 전송
    onSendMessage(`파일: ${file.name}`, 'file');
  };

  return (
    <div className="relative">
      {/* 스마트 제안 */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-50"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionSelect(suggestion)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${index === selectedSuggestionIndex ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-900">{suggestion.text}</span>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${suggestion.type === 'smart' ? 'bg-blue-100 text-blue-800' :
                    suggestion.type === 'recent' ? 'bg-green-100 text-green-800' :
                      suggestion.type === 'command' ? 'bg-purple-100 text-purple-800' :
                        suggestion.type === 'generated' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                    }`}>
                    {suggestion.category || suggestion.type}
                  </span>
                  {suggestion.confidence && (
                    <span className="text-xs text-gray-500">
                      {Math.round(suggestion.confidence * 100)}%
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 명령어 목록 */}
      {showCommands && (
        <div
          ref={suggestionsRef}
          className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-50"
        >
          {commands.map((command, index) => (
            <button
              key={command.text}
              onClick={() => handleSuggestionSelect({ id: command.text, text: command.text, type: 'command' })}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-900 font-medium">{command.text}</span>
                  <p className="text-xs text-gray-500">{command.description}</p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                  명령어
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 이모지 선택기 */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-50"
        >
          <div className="grid grid-cols-6 gap-1">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEmojiSelect(emoji)}
                className="w-8 h-8 text-lg hover:bg-gray-100 rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 파일 업로드 모달 */}
      {showFileUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">파일 첨부</h3>
              <button
                onClick={() => setShowFileUpload(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="닫기"
                title="닫기"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <SmartFileUpload
              onFileUpload={handleFileUpload}
              maxFileSize={10}
              allowedTypes={['image/*', '.pdf', '.doc', '.docx', '.txt', '.xlsx', '.pptx']}
              roomId={roomId}
            />
          </div>
        </div>
      )}

      {/* AI 메시지 생성 모달 (Enhanced) */}
      {showMessageGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">AI 메시지 생성</h3>
              <button
                onClick={() => setShowMessageGenerator(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="닫기"
                title="닫기"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">대화 컨텍스트</label>
                <textarea
                  placeholder="메시지 컨텍스트를 입력하세요... (예: 시공사 평가에 대해 논의해보고 싶습니다)"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">메시지 스타일</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="메시지 스타일 선택"
                  title="메시지 스타일 선택"
                  onChange={(e) => {
                    const style = e.target.value;
                    // 스타일 변경 시 즉시 미리보기 생성
                    if (inputValue.trim()) {
                      generateAIMessage(inputValue, '', style);
                    }
                  }}
                >
                  <option value="professional">전문적</option>
                  <option value="casual">친근한</option>
                  <option value="formal">공식적</option>
                </select>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 <strong>팁:</strong> 개포우성7차 프로젝트 관련 키워드(시공사, 공사비, 설계, 홍보, 투표, 계약, 일정, 품질)를 포함하면 더 정확한 메시지가 생성됩니다.
                </p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    if (inputValue.trim()) {
                      generateAIMessage(inputValue, '', 'professional');
                      setShowMessageGenerator(false);
                    }
                  }}
                  disabled={isGenerating || !inputValue.trim()}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isGenerating ? '생성 중...' : '메시지 생성'}
                </button>
                <button
                  onClick={() => setShowMessageGenerator(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 입력 영역 */}
      <div className="flex items-end space-x-3 p-4 bg-white border-t border-gray-100">
        <div className="flex-1 relative">
          <div className="relative bg-gray-50 hover:bg-white border border-gray-200 rounded-2xl transition-all duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
            {/* 입력창 */}
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="w-full p-4 pr-20 border-none bg-transparent resize-none disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-900 placeholder-gray-500 focus:outline-none"
              style={{
                minHeight: '52px',
                maxHeight: '432px', // 18줄 * 24px
                overflowY: 'auto'
              }}
            />

            {/* 입력 상태 표시 */}
            {isListening && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* AI 메시지 생성 버튼 */}
          <button
            onClick={() => setShowMessageGenerator(true)}
            className="p-3 text-gray-500 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200"
            aria-label="AI 메시지 생성"
            title="AI 메시지 생성"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </button>

          {/* 파일 업로드 버튼 */}
          <button
            onClick={() => setShowFileUpload(!showFileUpload)}
            className="p-3 text-gray-500 hover:text-green-600 rounded-xl hover:bg-green-50 transition-all duration-200"
            aria-label="파일 첨부"
            title="파일 첨부"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* 이모지 버튼 */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-3 text-gray-500 hover:text-yellow-600 rounded-xl hover:bg-yellow-50 transition-all duration-200"
            aria-label="이모지 선택"
            title="이모지 선택"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* 음성 입력 버튼 */}
          <button
            onClick={isRecording ? stopVoiceInput : startVoiceInput}
            className={`p-3 rounded-xl transition-all duration-200 ${isRecording
              ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg'
              : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50'
              }`}
            aria-label={isRecording ? '음성 입력 중지' : '음성 입력 시작'}
            title={isRecording ? '음성 입력 중지' : '음성 입력 시작'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          {/* 전송 버튼 */}
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || disabled}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-3 rounded-xl transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:shadow-none"
            aria-label="메시지 전송"
            title="메시지 전송"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartChatInput; 