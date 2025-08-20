import React, { useState, useEffect, useRef } from 'react';
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

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 현재 세션 찾기
  const currentSession = sessions.find(session => session.id === sessionId);
  const messages = currentSession?.messages || [];

  // 필터링된 메시지
  const filteredMessages = searchQuery.trim()
    ? messages.filter(message =>
      message.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : messages;

  // 제안사항
  const [suggestions] = useState([
    '코드 리뷰를 도와주세요',
    '알고리즘을 설명해주세요',
    '최신 기술 트렌드를 알려주세요',
    '프로젝트 계획을 세워주세요'
  ]);

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

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
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
  };

  // 키보드 이벤트
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 파일 업로드 핸들러
  const handleFileUpload = () => {
    setShowFileUpload(!showFileUpload);
  };

  const handleFilesUploaded = (files: any[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleFileRemove = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // 음성 인식 핸들러
  const handleVoiceTranscript = (transcript: string) => {
    setInputMessage(transcript);
    setVoiceTranscript('');
  };

  const handleVoiceError = (error: string) => {
    dispatch(addNotification({
      type: 'error',
      message: `음성 인식 오류: ${error}`,
      duration: 5000,
    }));
  };

  // 추천 시스템 핸들러
  const handleRecommendationClick = (recommendation: any) => {
    setInputMessage(recommendation.title);
    setShowRecommendations(false);
  };

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

  const handleInputFocus = () => {
    if (inputMessage.length === 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
  };

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

      {/* 입력 영역 - Gemini 스타일 (채팅 탭에서만 표시) */}
      {activeTab === 'chat' && (
        <div className="border-t border-gray-200 p-6 bg-white">
          <div className="max-w-4xl mx-auto">
            {/* 메인 입력창 */}
            <div className="relative bg-gray-50 rounded-2xl border border-gray-200 hover:border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all duration-200">
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

              {/* 메인 입력 라인 */}
              <div className="flex items-center p-4">
                {/* 플러스 버튼 */}
                <button
                  onClick={handleFileUpload}
                  className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors mr-3"
                >
                  <Plus size={20} />
                </button>

                {/* 메시지 입력 */}
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder="Gemini에게 물어보기"
                    className="w-full bg-transparent border-none outline-none resize-none text-gray-900 placeholder-gray-500"
                    rows={1}
                    style={{ minHeight: '24px', maxHeight: '120px' }}
                  />
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
                  className={`flex-shrink-0 p-2 rounded-lg transition-colors ml-2 ${inputMessage.trim() && !isSending
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  {isSending ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>

              {/* 하단 도구 버튼들 */}
              <div className="flex items-center justify-between px-4 pb-3 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  {/* Deep Research */}
                  <button
                    onClick={handleDeepResearch}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Search size={16} />
                    <span>Deep Research</span>
                  </button>

                  {/* Canvas */}
                  <button
                    onClick={handleCanvas}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Square size={16} />
                    <span>Canvas</span>
                  </button>

                  {/* 이미지 */}
                  <button
                    onClick={handleImageUpload}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Image size={16} />
                    <span>이미지</span>
                  </button>

                  {/* 가이드 학습 */}
                  <button
                    onClick={handleGuidedLearning}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <BookOpen size={16} />
                    <span>가이드 학습</span>
                  </button>

                  {/* AI 추천 */}
                  <button
                    onClick={() => setShowRecommendations(!showRecommendations)}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Sparkles size={16} />
                    <span>AI 추천</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 입력 힌트 (채팅 탭에서만 표시) */}
            {activeTab === 'chat' && inputMessage.length > 0 && (
              <div className="mt-2 text-xs text-gray-500 text-center">
                Enter로 전송, Shift+Enter로 줄바꿈
              </div>
            )}
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
