import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Plus,
  Mic,
  Search,
  Download,
  Share2,
  X,
  Square,
  Image,
  BookOpen,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { AppDispatch, RootState } from '../../store';
import { sendMessage, addMessageToSession } from '../../store/slices/sessionsSlice';
import { addNotification, setSelectedAIModel } from '../../store/slices/uiSlice';
import { setSharing } from '../../store/slices/collaborationSlice';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import StreamingMessage from './StreamingMessage';
import AdvancedFileUpload from './AdvancedFileUpload';
import VoiceRecognition from './VoiceRecognition';
import SmartRecommendations from './SmartRecommendations';
import MessageAnalytics from '../Analytics/MessageAnalytics';
import ConversationSummary from '../Analytics/ConversationSummary';
import SentimentAnalysis from '../Analytics/SentimentAnalysis';
import { aiService, AIModel } from '../../services/aiService';
import { recommendationService } from '../../services/recommendationService';

interface ChatInterfaceProps {
  sessionId: string;
  projectId: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ sessionId, projectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { sessions } = useSelector((state: RootState) => state.sessions);
  const { isInitializing, selectedAIModel } = useSelector((state: RootState) => state.ui);
  const { isSharing } = useSelector((state: RootState) => state.collaboration);

  // 상태 관리
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'analytics' | 'summary' | 'sentiment'>('chat');
  const [isStreaming, setIsStreaming] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [inputError, setInputError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const [autoCompleteOptions, setAutoCompleteOptions] = useState<string[]>([]);
  const [inputStats, setInputStats] = useState({
    wordCount: 0,
    charCount: 0,
    readingTime: 0
  });
  const [inputQuality, setInputQuality] = useState({
    score: 0,
    suggestions: [] as string[]
  });
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [inputMode, setInputMode] = useState<'normal' | 'command' | 'search'>('normal');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 현재 세션 찾기
  const currentSession = sessions.find(session => session.id === sessionId);
  const messages = currentSession?.messages || [];

  // 필터링된 메시지 (메모이제이션)
  const filteredMessages = useMemo(() =>
    searchQuery.trim()
      ? messages.filter(message =>
        message.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
      : messages,
    [messages, searchQuery]
  );

  // 제안사항 (메모이제이션)
  const suggestions = useMemo(() => [
    '코드 리뷰를 도와주세요',
    '알고리즘을 설명해주세요',
    '최신 기술 트렌드를 알려주세요',
    '프로젝트 계획을 세워주세요',
    '성능 최적화 방법을 알려주세요',
    '보안 관련 조언을 해주세요',
    '아키텍처 설계를 도와주세요',
    '테스트 코드 작성법을 알려주세요',
    '디버깅 방법을 알려주세요',
    '코드 리팩토링을 도와주세요'
  ], []);

  // 명령어 목록 (메모이제이션)
  const commands = useMemo(() => [
    { cmd: 'help', description: '사용 가능한 명령어 목록 보기' },
    { cmd: 'clear', description: '대화 기록 초기화' },
    { cmd: 'export', description: '대화 내용 내보내기' },
    { cmd: 'settings', description: '설정 메뉴 열기' },
    { cmd: 'search', description: '대화 내용 검색' },
    { cmd: 'theme', description: '테마 변경' },
    { cmd: 'voice', description: '음성 입력 모드' },
    { cmd: 'file', description: '파일 업로드' }
  ], []);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 입력창 자동 크기 조절
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [inputMessage]);

  // 전역 키보드 이벤트
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K로 입력창 포커스 (전역)
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // 드래그 앤 드롭 핸들러 (메모이제이션)
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      // 파일 업로드 처리
      setUploadedFiles(prev => [...prev, ...files]);
      setShowFileUpload(true);
    }
  }, []);

  // 메시지 전송 (메모이제이션)
  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isSending) return;

    // 명령어 모드 처리
    if (inputMode === 'command') {
      const command = inputMessage.trim().substring(1); // '/' 제거
      handleCommand(command);
      return;
    }

    // 입력 검증
    if (inputMessage.trim().length < 2) {
      setInputError('메시지는 최소 2자 이상 입력해주세요.');
      return;
    }

    if (inputMessage.trim().length > 4000) {
      setInputError('메시지는 최대 4000자까지 입력 가능합니다.');
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setInputError('');
    setIsTyping(false);

    // 입력 히스토리에 추가
    setInputHistory(prev => [userMessage, ...prev.slice(0, 9)]);
    setHistoryIndex(-1);

    // 입력창 높이 초기화
    if (inputRef.current) {
      inputRef.current.style.height = '24px';
    }

    setIsSending(true);

    try {
      // 사용자 메시지 추가
      dispatch(addMessageToSession({
        sessionId,
        message: {
          id: Date.now().toString(),
          role: 'user',
          content: userMessage,
          timestamp: new Date().toISOString(),
          isBookmarked: false
        }
      }));

      // AI 응답 생성
      const aiResponse = await aiService.generateResponse(userMessage, selectedAIModel);

      // AI 응답 추가
      dispatch(addMessageToSession({
        sessionId,
        message: {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse.content,
          timestamp: new Date().toISOString(),
          isBookmarked: false
        }
      }));

      // 사용자 행동 기록
      recommendationService.recordUserBehavior({
        messageContent: userMessage,
        timestamp: new Date().toISOString(),
        sessionId,
        modelUsed: selectedAIModel,
        responseTime: aiResponse.responseTime
      });

    } catch (error) {
      console.error('메시지 전송 실패:', error);
      dispatch(addNotification({
        type: 'error',
        message: '메시지 전송에 실패했습니다.',
        duration: 5000
      }));
    } finally {
      setIsSending(false);
    }
  }, [inputMessage, isSending, dispatch, sessionId, selectedAIModel]);

  // 키보드 이벤트 (메모이제이션)
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }

    // Ctrl+K로 입력창 포커스
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      inputRef.current?.focus();
    }

    // / 키로 명령어 모드 시작
    if (e.key === '/' && inputMessage.length === 0) {
      e.preventDefault();
      setInputMode('command');
      setInputMessage('/');
    }

    // 명령어 모드에서 Escape로 일반 모드로 복귀
    if (e.key === 'Escape' && inputMode === 'command') {
      setInputMode('normal');
      setInputMessage('');
    }

    // Escape로 입력창 초기화
    if (e.key === 'Escape') {
      setInputMessage('');
      setInputError('');
      setIsTyping(false);
      setShowAutoComplete(false);
      setShowSuggestions(false);
      if (inputRef.current) {
        inputRef.current.style.height = '24px';
      }
    }

    // Tab 키로 자동 완성 네비게이션
    if (e.key === 'Tab' && showAutoComplete && autoCompleteOptions.length > 0) {
      e.preventDefault();
      setInputMessage(autoCompleteOptions[0]);
      setShowAutoComplete(false);
      inputRef.current?.focus();
    }

    // 화살표 키로 히스토리 네비게이션
    if (e.key === 'ArrowUp' && e.ctrlKey && inputHistory.length > 0) {
      e.preventDefault();
      const newIndex = Math.min(historyIndex + 1, inputHistory.length - 1);
      setHistoryIndex(newIndex);
      setInputMessage(inputHistory[newIndex]);
    }

    if (e.key === 'ArrowDown' && e.ctrlKey && historyIndex >= 0) {
      e.preventDefault();
      const newIndex = historyIndex - 1;
      if (newIndex >= 0) {
        setHistoryIndex(newIndex);
        setInputMessage(inputHistory[newIndex]);
      } else {
        setHistoryIndex(-1);
        setInputMessage('');
      }
    }
  }, [handleSendMessage, showAutoComplete, autoCompleteOptions, inputHistory, historyIndex]);

  // 파일 업로드 핸들러 (메모이제이션)
  const handleFileUpload = useCallback(() => {
    setShowFileUpload(!showFileUpload);
  }, [showFileUpload]);

  const handleFilesUploaded = useCallback((files: any[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
  }, []);

  const handleFileRemove = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  }, []);

  // 음성 인식 핸들러 (메모이제이션)
  const handleVoiceTranscript = useCallback((transcript: string) => {
    setInputMessage(transcript);
    setVoiceTranscript('');
  }, []);

  const handleVoiceError = useCallback((error: string) => {
    dispatch(addNotification({
      type: 'error',
      message: `음성 인식 오류: ${error}`,
      duration: 5000,
    }));
  }, [dispatch]);

  // 추천 시스템 핸들러
  const handleRecommendationClick = useCallback((recommendation: any) => {
    setInputMessage(recommendation.title);
    setShowRecommendations(false);
  }, []);

  const handleAutoCompleteClick = useCallback((option: string) => {
    setInputMessage(option);
    setShowAutoComplete(false);
    inputRef.current?.focus();
  }, []);

  // 명령어 처리
  const handleCommand = useCallback((command: string) => {
    const cmd = command.toLowerCase().trim();

    switch (cmd) {
      case 'help':
        dispatch(addNotification({
          type: 'info',
          message: '사용 가능한 명령어: /help, /clear, /export, /settings, /search, /theme, /voice, /file',
          duration: 5000
        }));
        break;
      case 'clear':
        // 대화 기록 초기화 로직
        dispatch(addNotification({
          type: 'warning',
          message: '대화 기록을 초기화하시겠습니까?',
          duration: 3000
        }));
        break;
      case 'export':
        // 대화 내용 내보내기 로직
        dispatch(addNotification({
          type: 'info',
          message: '대화 내용 내보내기 기능이 곧 추가됩니다.',
          duration: 3000
        }));
        break;
      case 'settings':
        // 설정 메뉴 열기
        dispatch(addNotification({
          type: 'info',
          message: '설정 메뉴가 곧 추가됩니다.',
          duration: 3000
        }));
        break;
      case 'search':
        setInputMode('search');
        setInputMessage('');
        break;
      case 'theme':
        // 테마 변경 로직
        dispatch(addNotification({
          type: 'info',
          message: '테마 변경 기능이 곧 추가됩니다.',
          duration: 3000
        }));
        break;
      case 'voice':
        // 음성 입력 모드
        dispatch(addNotification({
          type: 'info',
          message: '음성 입력 모드가 활성화되었습니다.',
          duration: 3000
        }));
        break;
      case 'file':
        setShowFileUpload(true);
        break;
      default:
        dispatch(addNotification({
          type: 'error',
          message: `알 수 없는 명령어: ${cmd}`,
          duration: 3000
        }));
    }

    setInputMode('normal');
    setInputMessage('');
  }, [dispatch]);

  // 입력 품질 분석 (메모이제이션)
  const analyzeInputQuality = useCallback((text: string) => {
    const suggestions: string[] = [];
    let score = 100;

    // 길이 검사
    if (text.length < 10) {
      score -= 20;
      suggestions.push('더 구체적인 질문을 해주세요');
    }

    // 문장 부호 검사
    if (!text.includes('?') && !text.includes('!') && !text.includes('.')) {
      score -= 10;
      suggestions.push('문장 부호를 사용해주세요');
    }

    // 대문자 사용 검사
    if (text === text.toLowerCase()) {
      score -= 5;
      suggestions.push('적절한 대문자 사용을 권장합니다');
    }

    // 키워드 검사
    const commonKeywords = ['어떻게', '무엇', '왜', '언제', '어디서', '누가'];
    const hasKeyword = commonKeywords.some(keyword => text.includes(keyword));
    if (!hasKeyword && text.length > 20) {
      score -= 15;
      suggestions.push('질문 키워드를 포함해주세요');
    }

    setInputQuality({ score: Math.max(0, score), suggestions });
  }, []);

  // 기타 핸들러들
  const handleVoiceInput = () => {
    dispatch(addNotification({
      type: 'info',
      message: '음성 입력 기능이 곧 추가됩니다.',
      duration: 3000,
    }));
  };

  const handleDeepResearch = () => {
    dispatch(addNotification({
      type: 'info',
      message: 'Deep Research 기능이 활성화되었습니다.',
      duration: 3000,
    }));
  };

  const handleCanvas = () => {
    dispatch(addNotification({
      type: 'info',
      message: 'Canvas 기능이 활성화되었습니다.',
      duration: 3000,
    }));
  };

  const handleImageUpload = () => {
    dispatch(addNotification({
      type: 'info',
      message: '이미지 업로드 기능이 활성화되었습니다.',
      duration: 3000,
    }));
  };

  const handleGuidedLearning = () => {
    dispatch(addNotification({
      type: 'info',
      message: '가이드 학습 기능이 활성화되었습니다.',
      duration: 3000,
    }));
  };

  const handleExportChat = () => {
    if (!currentSession) return;

    const exportData = {
      sessionName: currentSession.name,
      createdAt: currentSession.createdAt,
      messages: currentSession.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSession.name}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    dispatch(addNotification({
      type: 'success',
      message: '대화가 성공적으로 내보내졌습니다.',
      duration: 3000,
    }));
  };

  const handleModelChange = (model: 'gemini-pro' | 'gpt-4' | 'claude-3' | 'custom') => {
    dispatch(setSelectedAIModel(model));
    dispatch(addNotification({
      type: 'info',
      message: `AI 모델이 ${model}로 변경되었습니다.`,
      duration: 3000,
    }));
  };

  const handleShareSession = () => {
    const newSharingState = !isSharing;
    dispatch(setSharing({
      isSharing: newSharingState,
      sessionId: newSharingState ? sessionId : undefined
    }));

    dispatch(addNotification({
      type: newSharingState ? 'success' : 'info',
      message: newSharingState
        ? '세션이 공유되었습니다. 다른 사용자들이 참여할 수 있습니다.'
        : '세션 공유가 중지되었습니다.',
      duration: 3000,
    }));
  };

  const handlePlusClick = () => {
    dispatch(addNotification({
      type: 'info',
      message: '추가 옵션 메뉴가 곧 추가됩니다.',
      duration: 3000,
    }));
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleInputFocus = useCallback(() => {
    setInputFocused(true);
    setInputError('');

    if (inputMessage.length === 0) {
      setShowSuggestions(true);
    }

    // 입력창이 포커스되면 자동으로 높이 조절
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputMessage.length]);

  const handleInputBlur = useCallback(() => {
    setInputFocused(false);
    setTimeout(() => setShowSuggestions(false), 200);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputMessage(value);
    setInputError('');

    // 타이핑 상태 관리
    if (value.length > 0 && !isTyping) {
      setIsTyping(true);
    } else if (value.length === 0 && isTyping) {
      setIsTyping(false);
    }

    // 자동 완성 기능
    if (value.length > 2) {
      const filteredOptions = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      if (filteredOptions.length > 0) {
        setAutoCompleteOptions(filteredOptions);
        setShowAutoComplete(true);
      } else {
        setShowAutoComplete(false);
      }
    } else {
      setShowAutoComplete(false);
    }

    // 입력 통계 계산
    const words = value.trim().split(/\s+/).filter(word => word.length > 0);
    const readingTime = Math.ceil(words.length / 200); // 평균 읽기 속도 200단어/분
    setInputStats({
      wordCount: words.length,
      charCount: value.length,
      readingTime: readingTime
    });

    // 입력 품질 분석
    if (value.length > 5) {
      analyzeInputQuality(value);
    } else {
      setInputQuality({ score: 0, suggestions: [] });
    }

    // 자동 높이 조절
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }, [isTyping, suggestions, analyzeInputQuality]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 검색 헤더 */}
      {showSearch && (
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center space-x-2">
            <Search size={16} className="text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="메시지 검색..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => {
                setShowSearch(false);
                setSearchQuery('');
              }}
              className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              닫기
            </button>
          </div>
          {searchQuery.trim() && (
            <div className="mt-2 text-sm text-gray-600">
              {filteredMessages.length}개의 메시지에서 "{searchQuery}" 검색 결과
            </div>
          )}
        </div>
      )}

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8 px-4">
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'chat'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            채팅
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'analytics'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            분석
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'summary'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            요약
          </button>
          <button
            onClick={() => setActiveTab('sentiment')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'sentiment'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            감정
          </button>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 메시지 헤더 (채팅 탭에서만 표시) */}
        {activeTab === 'chat' && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {currentSession?.name || '채팅'}
            </h3>
            <div className="flex items-center space-x-2">
              {/* AI 모델 선택 */}
              <select
                value={selectedAIModel}
                onChange={(e) => handleModelChange(e.target.value as any)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="gemini-pro">Gemini Pro</option>
                <option value="gpt-4">GPT-4</option>
                <option value="claude-3">Claude 3</option>
                <option value="custom">Custom</option>
              </select>

              <button
                onClick={handleShareSession}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${isSharing
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                  }`}
                title={isSharing ? '공유 중지' : '세션 공유'}
              >
                <Share2 size={16} />
                <span className="text-sm">{isSharing ? '공유 중' : '공유'}</span>
              </button>
              <button
                onClick={handleExportChat}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                title="대화 내보내기"
              >
                <Download size={16} />
                <span className="text-sm">내보내기</span>
              </button>
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Search size={16} />
                <span className="text-sm">검색</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredMessages.map((message, index) => (
                <motion.div
                  key={message.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <MessageBubble message={message} sessionId={sessionId} />
                </motion.div>
              ))}
            </AnimatePresence>

            {isSending && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}

        {activeTab === 'analytics' && (
          <MessageAnalytics sessionId={sessionId} />
        )}

        {activeTab === 'summary' && (
          <ConversationSummary sessionId={sessionId} />
        )}

        {activeTab === 'sentiment' && (
          <SentimentAnalysis sessionId={sessionId} />
        )}
      </div>

      {/* 입력 영역 - ChatGPT 스타일 (채팅 탭에서만 표시) */}
      {activeTab === 'chat' && (
        <div className="chatgpt-input-container">
          <div className="chatgpt-input-wrapper">
            {/* 메인 입력창 */}
            <div
              className={`chatgpt-input-box ${inputError ? 'error' : ''} ${inputFocused ? 'focused' : ''} ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* 스마트 제안 */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg border border-gray-200 shadow-lg p-2 z-10"
                  >
                    <div className="text-xs text-gray-500 mb-2 px-2">💡 제안사항</div>
                    <div className="space-y-1">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 자동 완성 */}
              <AnimatePresence>
                {showAutoComplete && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg border border-gray-200 shadow-lg p-2 z-10"
                  >
                    <div className="text-xs text-gray-500 mb-2 px-2">🔍 자동 완성</div>
                    <div className="space-y-1 chatgpt-autocomplete">
                      {autoCompleteOptions.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleAutoCompleteClick(option)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 메인 입력 라인 */}
              <div
                className="chatgpt-input-main"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {/* 플러스 버튼 */}
                <button
                  onClick={handleFileUpload}
                  className="chatgpt-plus-button"
                  title="파일 첨부 (드래그 앤 드롭도 지원)"
                >
                  <Plus size={20} />
                </button>

                {/* 메시지 입력 */}
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder="무엇이든 물어보세요"
                    className={`chatgpt-input-textarea ${isTyping ? 'typing' : ''}`}
                    rows={1}
                    maxLength={4000}
                    aria-label="메시지 입력"
                    aria-describedby="input-hint"
                    role="textbox"
                    aria-multiline="true"
                    data-history={historyIndex >= 0}
                  />

                  {/* 입력 통계 표시 */}
                  {inputMessage.length > 0 && (
                    <div className="absolute bottom-1 right-2 text-xs pointer-events-none flex items-center space-x-2 chatgpt-input-stats px-2 py-1 rounded">
                      <span className={`${inputMessage.length > 3500 ? 'text-red-500' :
                        inputMessage.length > 3000 ? 'text-yellow-500' :
                          'text-gray-400'
                        }`}>
                        {inputMessage.length}/4000
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-400">{inputStats.wordCount}단어</span>
                      {inputStats.readingTime > 0 && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-400">{inputStats.readingTime}분 읽기</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* 고급 음성 인식 */}
                <div className="flex-shrink-0 ml-3">
                  <VoiceRecognition
                    onTranscript={handleVoiceTranscript}
                    onError={handleVoiceError}
                    autoSend={false}
                    showSettings={false}
                  />
                </div>

                {/* 전송 버튼 */}
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isSending}
                  className={`chatgpt-send-button ${isSending ? 'sending' : ''}`}
                  title={isSending ? "전송 중..." : "메시지 전송"}
                >
                  {isSending ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>

              {/* 하단 도구 버튼들 */}
              <div className="chatgpt-tool-buttons">
                <div className="flex items-center space-x-2">
                  {/* Deep Research */}
                  <button
                    onClick={handleDeepResearch}
                    className="chatgpt-tool-button"
                    title="심층 연구"
                  >
                    <Search size={14} />
                    <span>Deep Research</span>
                  </button>

                  {/* Canvas */}
                  <button
                    onClick={handleCanvas}
                    className="chatgpt-tool-button"
                    title="캔버스"
                  >
                    <Square size={14} />
                    <span>Canvas</span>
                  </button>

                  {/* 이미지 */}
                  <button
                    onClick={handleImageUpload}
                    className="chatgpt-tool-button"
                    title="이미지 업로드"
                  >
                    <Image size={14} />
                    <span>이미지</span>
                  </button>

                  {/* 가이드 학습 */}
                  <button
                    onClick={handleGuidedLearning}
                    className="chatgpt-tool-button"
                    title="가이드 학습"
                  >
                    <BookOpen size={14} />
                    <span>가이드 학습</span>
                  </button>

                  {/* AI 추천 */}
                  <button
                    onClick={() => setShowRecommendations(!showRecommendations)}
                    className="chatgpt-tool-button"
                    title="AI 추천"
                  >
                    <Sparkles size={14} />
                    <span>AI 추천</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 입력 힌트 (채팅 탭에서만 표시) */}
            {activeTab === 'chat' && inputMessage.length > 0 && !inputError && (
              <div id="input-hint" className="chatgpt-input-hint">
                Enter로 전송, Shift+Enter로 줄바꿈 • Ctrl+K로 포커스 • Esc로 초기화 • Ctrl+↑/↓로 히스토리
              </div>
            )}

            {/* 에러 메시지 */}
            {activeTab === 'chat' && inputError && (
              <div className="mt-2 text-xs text-red-500 text-center chatgpt-error-message">
                {inputError}
              </div>
            )}

            {/* 입력 품질 표시 */}
            {activeTab === 'chat' && inputMessage.length > 5 && inputQuality.score > 0 && (
              <div className="mt-2 flex items-center justify-center space-x-2">
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">품질:</span>
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden chatgpt-quality-bar">
                    <div
                      className={`h-full transition-all duration-300 ${inputQuality.score >= 80 ? 'bg-green-500' :
                        inputQuality.score >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                      style={{ width: `${inputQuality.score}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{inputQuality.score}%</span>
                </div>
                {inputQuality.suggestions.length > 0 && (
                  <button
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="text-xs text-blue-500 hover:text-blue-700"
                    title="개선 제안 보기"
                  >
                    💡
                  </button>
                )}
              </div>
            )}

            {/* 하단 안내 문구 */}
            <div className="chatgpt-disclaimer">
              ChatGPT는 실수를 할 수 있습니다. 중요한 정보는 재차 확인하세요.
              <br />
              <span className="text-xs text-gray-400">
                💡 팁: Ctrl+↑/↓로 이전 메시지를 불러올 수 있습니다
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 파일 업로드 모달 */}
      {showFileUpload && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowFileUpload(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">파일 업로드</h3>
              <button
                onClick={() => setShowFileUpload(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <AdvancedFileUpload
              onFilesUploaded={handleFilesUploaded}
              onFileRemove={handleFileRemove}
              maxFiles={10}
              maxSize={50}
            />
          </motion.div>
        </motion.div>
      )}

      {/* AI 추천 모달 */}
      {showRecommendations && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowRecommendations(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">AI 추천 시스템</h3>
              <button
                onClick={() => setShowRecommendations(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <SmartRecommendations
              currentMessage={inputMessage}
              onRecommendationClick={handleRecommendationClick}
              showPersonalized={true}
              showContextual={true}
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ChatInterface;
