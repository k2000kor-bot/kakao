import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PaperAirplaneIcon, SparklesIcon, CheckCircleIcon,
  ExclamationTriangleIcon, LightBulbIcon, UserIcon
} from '@heroicons/react/24/outline';
import enhancedConversationalService from '../services/enhancedConversationalService';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: Date;
  type: 'text' | 'clarification' | 'answer' | 'error';
  metadata?: {
    confidence?: number;
    processingTime?: number;
    intent?: any;
    clarification_needed?: boolean;
  };
}

interface ContextualResponseInterfaceProps {
  onCommand?: (command: string) => void;
  onAnalysis?: (analysis: any) => void;
  onInsight?: (insight: any) => void;
}

const ContextualResponseInterface: React.FC<ContextualResponseInterfaceProps> = ({
  onCommand, onAnalysis, onInsight
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [contextHistory, setContextHistory] = useState<Array<{
    user_id: string;
    message: string;
    timestamp: string;
  }>>([]);
  const [showContextPanel, setShowContextPanel] = useState(false);
  const [responseQuality, setResponseQuality] = useState<'good' | 'bad' | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [responseMode, setResponseMode] = useState<'auto' | 'manual' | 'detailed'>('auto');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메시지 추가
  const addMessage = useCallback((content: string, sender: 'user' | 'ai' | 'system', type: 'text' | 'clarification' | 'answer' | 'error', metadata?: any) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender,
      timestamp: new Date(),
      type,
      metadata
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  // 메시지 전송 처리
  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = inputMessage.trim();

    // conversationId가 없으면 생성
    if (!conversationId) {
      const newConversationId = enhancedConversationalService.createConversationSession('user_1');
      setConversationId(newConversationId);
    }

    // 사용자 메시지 추가
    addMessage(userMessage, 'user', 'text');

    setInputMessage('');

    // 맥락 기반 응답 생성
    await generateContextualResponse(userMessage);
  }, [inputMessage, conversationId, addMessage]);

  // 맥락 기반 응답 생성
  const generateContextualResponse = useCallback(async (userMessage: string) => {
    setIsTyping(true);
    const startTime = Date.now();

    try {
      // 맥락 기반 정확한 답변 요청
      const response = await enhancedConversationalService.getContextualResponse({
        conversation_id: conversationId,
        user_id: 'user_1',
        message: userMessage,
        context_history: contextHistory
      });

      if (response.success) {
        const { data } = response;
        const processingTime = Date.now() - startTime;

        // 맥락 기반 응답 포맷팅
        const formattedResponse = enhancedConversationalService.formatContextualResponse(data);

        // 응답 타입 결정
        let responseType: 'text' | 'clarification' | 'answer' | 'error' = 'text';
        if (data.type === 'clarification') responseType = 'clarification';
        else if (data.type === 'answer') responseType = 'answer';
        else responseType = 'text';

        addMessage(formattedResponse, 'ai', responseType, {
          confidence: data.confidence || 0.8,
          processingTime: response.metadata.processing_time,
          intent: response.metadata.intent,
          clarification_needed: response.metadata.clarification_needed
        });

        // 맥락 히스토리 업데이트
        setContextHistory(prev => [...prev, {
          user_id: 'user_1',
          message: userMessage,
          timestamp: new Date().toISOString()
        }]);

        // 제안사항 설정
        if (data.suggestions) {
          setSuggestions(data.suggestions);
        }

      } else {
        throw new Error('맥락 기반 API 응답이 성공하지 않았습니다.');
      }

    } catch (error) {
      console.error('맥락 기반 응답 생성 실패:', error);
      const errorMessage = enhancedConversationalService.handleError(error);
      addMessage(errorMessage, 'system', 'error');
    } finally {
      setIsTyping(false);
    }
  }, [conversationId, contextHistory, addMessage]);

  // 응답 품질 평가
  const handleResponseQuality = useCallback(async (quality: 'good' | 'bad') => {
    setResponseQuality(quality);

    try {
      // 서버에 피드백 전송
      const feedbackResponse = await enhancedConversationalService.sendQualityFeedback({
        conversation_id: conversationId,
        user_id: 'user_1',
        message_id: messages[messages.length - 1]?.id || 'unknown',
        quality,
        feedback: quality === 'good' ? '답변이 도움이 됨' : '답변이 도움이 안됨'
      });

      if (feedbackResponse.success) {
        // 개선사항이 있으면 표시
        if (feedbackResponse.data.improvements.length > 0) {
          const improvementMessage = `🔧 개선사항:\n${feedbackResponse.data.improvements.map(imp => `• ${imp}`).join('\n')}`;
          addMessage(improvementMessage, 'system', 'text');
        }
      }
    } catch (error) {
      console.error('피드백 전송 실패:', error);
    }

    // 품질 피드백 메시지 추가
    const feedbackMessage = quality === 'good'
      ? '👍 답변이 도움이 되었다니 기쁩니다! 더 나은 서비스를 위해 노력하겠습니다.'
      : '😔 답변이 도움이 되지 않아 죄송합니다. 더 구체적으로 질문해주시면 정확한 답변을 드리겠습니다.';

    addMessage(feedbackMessage, 'system', 'text');

    // 3초 후 품질 상태 초기화
    setTimeout(() => setResponseQuality(null), 3000);
  }, [addMessage, conversationId, messages]);

  // 제안사항 클릭 처리
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInputMessage(suggestion);
    textareaRef.current?.focus();
  }, []);

  // 키보드 이벤트 처리
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // 서버 연결 및 초기화
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        // 서버 연결 확인
        const isConnected = await enhancedConversationalService.checkConnection();
        setIsConnected(isConnected);

        if (isConnected) {
          // 대화 세션 생성
          const newConversationId = enhancedConversationalService.createConversationSession('user_1');
          setConversationId(newConversationId);

          // 환영 메시지
          addMessage('안녕하세요! 저는 맥락을 파악하여 정확한 답변을 제공하는 CORBU.AI입니다. 🤖\n\n✨ 맥락 기반 기능:\n• 🧠 사용자 의도 분석\n• 🤔 확인 질문 생성\n• ✅ 정확한 답변 제공\n• 📚 참고 자료 제시\n• 🎯 신뢰도 표시\n\n무엇을 도와드릴까요?', 'ai', 'text', {
            confidence: 0.95,
            processingTime: 0,
            intent: { type: 'greeting', confidence: 0.95 }
          });
        } else {
          addMessage('⚠️ 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.', 'system', 'error');
        }
      } catch (error) {
        console.error('시스템 초기화 실패:', error);
        addMessage('시스템 초기화 중 오류가 발생했습니다.', 'system', 'error');
      }
    };

    initializeSystem();
  }, [addMessage]);

  // 메시지 아이콘 가져오기
  const getMessageIcon = useCallback((sender: string, type: string) => {
    switch (type) {
      case 'clarification':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'answer':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <SparklesIcon className="w-5 h-5 text-blue-500" />;
    }
  }, []);

  // 메시지 끝으로 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="w-6 h-6 text-blue-500" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                맥락 기반 정확한 답변
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                사용자 의도를 파악하여 정확한 답변을 제공합니다
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* 고급 옵션 토글 */}
            <button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
              title="고급 설정"
            >
              고급 설정
            </button>

            {/* 맥락 패널 토글 */}
            <button
              onClick={() => setShowContextPanel(!showContextPanel)}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
              title="맥락 정보 보기"
            >
              맥락 정보
            </button>

            {/* 서버 상태 */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? '연결됨' : '연결 안됨'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 고급 설정 패널 */}
      {showAdvancedOptions && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200 dark:border-purple-800 px-4 py-3">
          <div className="text-sm">
            <h3 className="font-medium text-purple-800 dark:text-purple-200 mb-3">고급 설정</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1">응답 모드</label>
                <select
                  value={responseMode}
                  onChange={(e) => setResponseMode(e.target.value as any)}
                  className="w-full px-2 py-1 text-xs border rounded bg-white dark:bg-gray-700"
                  title="응답 모드 선택"
                  aria-label="응답 모드 선택"
                >
                  <option value="auto">자동 (권장)</option>
                  <option value="manual">수동 확인</option>
                  <option value="detailed">상세 분석</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">신뢰도 임계값</label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{(confidenceThreshold * 100).toFixed(0)}%</span>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">현재 설정</label>
                <div className="text-xs text-gray-600">
                  모드: {responseMode === 'auto' ? '자동' : responseMode === 'manual' ? '수동' : '상세'}
                  <br />
                  임계값: {(confidenceThreshold * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 맥락 정보 패널 */}
      {showContextPanel && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-3">
          <div className="text-sm">
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">맥락 정보</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-medium">대화 길이:</span> {contextHistory.length}개 메시지
              </div>
              <div>
                <span className="font-medium">세션 ID:</span> {conversationId.slice(0, 8)}...
              </div>
              <div>
                <span className="font-medium">연결 상태:</span> {isConnected ? '정상' : '오프라인'}
              </div>
              <div>
                <span className="font-medium">제안사항:</span> {suggestions.length}개
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl ${message.sender === 'user'
              ? 'bg-blue-500 text-white'
              : message.type === 'clarification'
                ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
                : message.type === 'answer'
                  ? 'bg-green-100 border-green-300 text-green-800'
                  : message.type === 'error'
                    ? 'bg-red-100 border-red-300 text-red-800'
                    : 'bg-white border text-gray-900'
              } rounded-lg px-4 py-2 shadow-sm border`}>
              <div className="flex items-start space-x-2">
                {message.sender !== 'user' && (
                  <div className="flex-shrink-0 mt-1">
                    {getMessageIcon(message.sender, message.type)}
                  </div>
                )}
                <div className="flex-1">
                  <div
                    className="text-sm"
                    style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {message.content}
                  </div>
                  {message.metadata && (
                    <div className="mt-2 text-xs opacity-75">
                      {message.metadata.confidence && (
                        <div className="flex items-center space-x-1">
                          <span>신뢰도: {(message.metadata.confidence * 100).toFixed(1)}%</span>
                        </div>
                      )}
                      {message.metadata.processingTime && (
                        <div>처리시간: {message.metadata.processingTime}ms</div>
                      )}
                      {message.metadata.intent && (
                        <div>의도: {message.metadata.intent.type}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* 타이핑 표시기 */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border rounded-lg px-4 py-2 shadow-sm">
              <div className="flex items-center space-x-2">
                <SparklesIcon className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600">
                  맥락을 분석하고 정확한 답변을 생성하고 있습니다...
                </span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 제안사항 영역 */}
      {suggestions.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800 px-4 py-3">
          <div className="text-sm">
            <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">💡 제안사항</h3>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 응답 품질 평가 */}
      {responseQuality && (
        <div className="bg-green-50 dark:bg-green-900/20 border-t border-green-200 dark:border-green-800 px-4 py-3">
          <div className="text-sm text-green-800 dark:text-green-200">
            {responseQuality === 'good' ? '👍 답변이 도움이 되었나요?' : '😔 답변이 도움이 되지 않았나요?'}
          </div>
        </div>
      )}

      {/* 입력 영역 */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="맥락을 고려한 정확한 답변을 원하시면 메시지를 입력하세요..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            title="메시지 전송"
            aria-label="메시지 전송"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>

        {/* 응답 품질 평가 버튼 */}
        {messages.length > 1 && !isTyping && (
          <div className="flex justify-center mt-3 space-x-2">
            <button
              onClick={() => handleResponseQuality('good')}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
              title="답변이 도움이 됨"
            >
              👍 도움됨
            </button>
            <button
              onClick={() => handleResponseQuality('bad')}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
              title="답변이 도움이 안됨"
            >
              👎 도움 안됨
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContextualResponseInterface; 