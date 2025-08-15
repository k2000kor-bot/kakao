import React, { useState, useCallback, useEffect } from 'react';
import { PaperAirplaneIcon, DocumentIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import ConversationalFileManager from './ConversationalFileManager';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  fileAnalysisResults?: any;
}

interface ConversationalInterfaceProps {
  onSendMessage: (message: string) => void;
}

const ConversationalInterface: React.FC<ConversationalInterfaceProps> = ({
  onSendMessage
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: '안녕하세요! CORBU AI 파일 관리 시스템입니다. 어떤 도움이 필요하신가요?',
      timestamp: new Date()
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [showFileManager, setShowFileManager] = useState(false);
  const [fileAnalysisResults, setFileAnalysisResults] = useState<any[]>([]);

  // 메시지 전송
  const handleSendMessage = useCallback(() => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // 대화형 요청 처리
    handleConversationalRequest(inputMessage);
  }, [inputMessage]);

  // 대화형 요청 처리
  const handleConversationalRequest = useCallback((request: string) => {
    const lowerRequest = request.toLowerCase();

    // 파일 관리 관련 요청 처리
    if (lowerRequest.includes('파일') || lowerRequest.includes('file')) {
      if (lowerRequest.includes('관리') || lowerRequest.includes('manage')) {
        setShowFileManager(true);
        addAssistantMessage('파일 관리 시스템을 열었습니다. 파일을 선택하고 원하는 작업을 수행하세요.');
      } else if (lowerRequest.includes('분석') || lowerRequest.includes('analyze')) {
        addAssistantMessage('파일 분석을 시작합니다. 분석할 파일을 선택해주세요.');
        setShowFileManager(true);
      } else if (lowerRequest.includes('업로드') || lowerRequest.includes('upload')) {
        addAssistantMessage('파일 업로드 기능을 준비 중입니다. 곧 사용할 수 있습니다.');
      } else if (lowerRequest.includes('다운로드') || lowerRequest.includes('download')) {
        addAssistantMessage('파일 다운로드를 위해 파일 관리 시스템을 열겠습니다.');
        setShowFileManager(true);
      }
    }
    // AI 분석 관련 요청 처리
    else if (lowerRequest.includes('ai') || lowerRequest.includes('분석') || lowerRequest.includes('analyze')) {
      if (lowerRequest.includes('음성') || lowerRequest.includes('voice')) {
        addAssistantMessage('음성 인식 시스템을 활성화합니다. 마이크를 통해 음성으로 명령을 내릴 수 있습니다.');
        // 음성 인식 컴포넌트 활성화 이벤트 발생
        window.dispatchEvent(new CustomEvent('activate-voice-recognition'));
      } else if (lowerRequest.includes('이미지') || lowerRequest.includes('image')) {
        addAssistantMessage('이미지 분석 시스템을 활성화합니다. 분석할 이미지를 업로드해주세요.');
        // 이미지 분석 컴포넌트 활성화 이벤트 발생
        window.dispatchEvent(new CustomEvent('activate-image-analysis'));
      } else if (lowerRequest.includes('예측') || lowerRequest.includes('predict')) {
        addAssistantMessage('예측 분석 시스템을 활성화합니다. 시스템 성능과 사용자 활동을 예측합니다.');
        // 예측 분석 컴포넌트 활성화 이벤트 발생
        window.dispatchEvent(new CustomEvent('activate-predictive-analytics'));
      } else if (lowerRequest.includes('딥러닝') || lowerRequest.includes('deep learning')) {
        addAssistantMessage('고도화된 딥러닝 허브를 활성화합니다. 최신 AI 모델들을 관리하고 학습할 수 있습니다.');
        // 딥러닝 허브 활성화 이벤트 발생
        window.dispatchEvent(new CustomEvent('activate-deep-learning-hub'));
      } else if (lowerRequest.includes('양자') || lowerRequest.includes('quantum')) {
        addAssistantMessage('양자 AI 허브를 활성화합니다. 양자 컴퓨팅 기반 AI 알고리즘들을 실행할 수 있습니다.');
        // 양자 AI 허브 활성화 이벤트 발생
        window.dispatchEvent(new CustomEvent('activate-quantum-ai-hub'));
      } else if (lowerRequest.includes('생체') || lowerRequest.includes('biometric')) {
        addAssistantMessage('생체 인식 AI 허브를 활성화합니다. 고급 생체 인식 시스템들을 관리할 수 있습니다.');
        // 생체 인식 AI 허브 활성화 이벤트 발생
        window.dispatchEvent(new CustomEvent('activate-biometric-ai-hub'));
      } else if (lowerRequest.includes('파일') || lowerRequest.includes('file') || lowerRequest.includes('학습')) {
        addAssistantMessage('고도화된 파일 학습 허브를 활성화합니다. 업로드된 파일을 분석하고 학습할 수 있습니다.');
        // 파일 학습 허브 활성화 이벤트 발생
        window.dispatchEvent(new CustomEvent('activate-file-learning-hub'));
      }
    }
    // 일반적인 대화 처리
    else {
      // AI 응답 시뮬레이션
      setTimeout(() => {
        const responses = [
          '네, 도움이 필요하시면 언제든 말씀해주세요.',
          '좋은 질문입니다. 더 자세한 정보를 제공해드릴까요?',
          '이 기능에 대해 더 알고 싶으시면 파일 관리 시스템을 확인해보세요.',
          'AI 분석 기능을 사용해보시겠어요? 음성, 이미지, 예측 분석을 지원합니다.'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addAssistantMessage(randomResponse);
      }, 1000);
    }
  }, []);

  // 어시스턴트 메시지 추가
  const addAssistantMessage = useCallback((content: string, fileResults?: any) => {
    const assistantMessage: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content,
      timestamp: new Date(),
      fileAnalysisResults: fileResults
    };
    setMessages(prev => [...prev, assistantMessage]);
  }, []);

  // 파일 분석 완료 처리
  const handleFileAnalysisComplete = useCallback((fileId: string, results: any) => {
    setFileAnalysisResults(prev => [...prev, { fileId, results }]);
    addAssistantMessage(
      `파일 분석이 완료되었습니다!\n\n📊 분석 결과:\n• 키워드: ${results.keywords.join(', ')}\n• 감정: ${results.sentiment}\n• 신뢰도: ${(results.confidence * 100).toFixed(1)}%`,
      results
    );
  }, [addAssistantMessage]);

  // 사용자 요청 처리
  const handleUserRequest = useCallback((request: string) => {
    addAssistantMessage(`요청하신 작업을 처리했습니다: ${request}`);
  }, [addAssistantMessage]);

  // 키보드 이벤트 처리
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // 파일 관리 시스템 토글
  const toggleFileManager = useCallback(() => {
    setShowFileManager(prev => !prev);
  }, []);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          CORBU AI 대화형 인터페이스
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleFileManager}
            className={`px-4 py-2 rounded-lg font-medium flex items-center ${showFileManager
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
          >
            <DocumentIcon className="w-4 h-4 mr-2" />
            파일 관리
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* 메인 채팅 영역 */}
        <div className={`flex-1 flex flex-col ${showFileManager ? 'w-1/2' : 'w-full'}`}>
          {/* 메시지 목록 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>

                  {/* 파일 분석 결과 표시 */}
                  {message.fileAnalysisResults && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                      <div className="font-medium mb-1">📊 분석 결과:</div>
                      <div>• 키워드: {message.fileAnalysisResults.keywords?.join(', ')}</div>
                      <div>• 감정: {message.fileAnalysisResults.sentiment}</div>
                      <div>• 신뢰도: {(message.fileAnalysisResults.confidence * 100).toFixed(1)}%</div>
                    </div>
                  )}

                  <div className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 입력 영역 */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="메시지를 입력하세요... (예: 파일 분석해줘, AI 음성 인식 활성화)"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  rows={2}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                title="메시지 전송"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>

            {/* 빠른 명령어 버튼 */}
            {/* 사용자 요청에 따라 모든 빠른 명령어 버튼 제거 */}
          </div>
        </div>

        {/* 파일 관리 시스템 */}
        {showFileManager && (
          <div className="w-1/2 border-l border-gray-200 dark:border-gray-700">
            <ConversationalFileManager
              onFileAnalysisComplete={handleFileAnalysisComplete}
              onUserRequest={handleUserRequest}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationalInterface; 