import React, { useState, useEffect } from 'react';
import {
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import {
  MessageGenerationRequest,
  MessageGenerationResponse,
  Guideline
} from '../types/knowledge';
import knowledgeService from '../services/knowledgeService';

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  type: 'user' | 'assistant' | 'system';
}

interface MessageGuidanceSystemProps {
  projectId?: string;
  knowledgeBaseId?: string;
  onMessageGenerated?: (message: string) => void;
}

const MessageGuidanceSystem: React.FC<MessageGuidanceSystemProps> = ({
  projectId,
  knowledgeBaseId,
  onMessageGenerated
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedGuidelines, setSelectedGuidelines] = useState<Guideline[]>([]);
  const [availableGuidelines, setAvailableGuidelines] = useState<Guideline[]>([]);
  const [userPreferences, setUserPreferences] = useState({
    tone: 'formal' as const,
    style: 'informative' as const,
    length: 'medium' as const
  });
  const [generatedResponse, setGeneratedResponse] = useState<MessageGenerationResponse | null>(null);
  const [showGuidancePanel, setShowGuidancePanel] = useState(false);

  useEffect(() => {
    loadGuidelines();
  }, [knowledgeBaseId]);

  const loadGuidelines = async () => {
    try {
      // 샘플 지침 데이터
      const sampleGuidelines: Guideline[] = [
        {
          id: 'gl_1',
          title: '공식적 의사소통 지침',
          content: '모든 공식 문서와 메시지는 정중하고 전문적인 톤을 유지해야 합니다.',
          category: '의사소통',
          priority: 'high',
          context: ['공식 문서', '고객 응대'],
          examples: ['감사합니다.', '검토 후 회신드리겠습니다.'],
          createdAt: new Date()
        },
        {
          id: 'gl_2',
          title: '안전 관련 응대',
          content: '안전 관련 문의나 문제가 있을 때는 즉시 대응하고 전문가와 상담하세요.',
          category: '안전',
          priority: 'high',
          context: ['안전 사고', '위험 요소'],
          examples: ['즉시 조치하겠습니다.', '안전팀과 연락드리겠습니다.'],
          createdAt: new Date()
        },
        {
          id: 'gl_3',
          title: '기술적 문제 해결',
          content: '기술적 문제에 대해서는 단계별로 설명하고 해결 방안을 제시하세요.',
          category: '기술',
          priority: 'medium',
          context: ['기술 지원', '문제 해결'],
          examples: ['다음과 같은 단계로 해결할 수 있습니다.', '먼저 확인해보겠습니다.'],
          createdAt: new Date()
        }
      ];
      setAvailableGuidelines(sampleGuidelines);
    } catch (error) {
      console.error('지침 로드 실패:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      type: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsGenerating(true);

    try {
      // 메시지 생성 요청
      const request: MessageGenerationRequest = {
        context: inputMessage,
        knowledgeBaseId: knowledgeBaseId || 'kb_1',
        userPreferences,
        guidelines: selectedGuidelines.map(g => g.id)
      };

      const response = await knowledgeService.generateMessage(request);
      setGeneratedResponse(response);

      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        content: response.generatedMessage,
        sender: 'assistant',
        timestamp: new Date(),
        type: 'assistant'
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (onMessageGenerated) {
        onMessageGenerated(response.generatedMessage);
      }
    } catch (error) {
      console.error('메시지 생성 실패:', error);

      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        content: '메시지 생성에 실패했습니다. 다시 시도해주세요.',
        sender: 'system',
        timestamp: new Date(),
        type: 'system'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGuidelineToggle = (guideline: Guideline) => {
    setSelectedGuidelines(prev => {
      const isSelected = prev.find(g => g.id === guideline.id);
      if (isSelected) {
        return prev.filter(g => g.id !== guideline.id);
      } else {
        return [...prev, guideline];
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('클립보드에 복사되었습니다.');
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* 메인 채팅 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 헤더 */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center">
                  <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">20</span>
                  메시지 가이드 시스템
                </h1>
                <p className="text-sm text-gray-600">AI 기반 지식 베이스를 활용한 스마트 메시지 생성</p>
              </div>
            </div>

            <button
              onClick={() => setShowGuidancePanel(!showGuidancePanel)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <LightBulbIcon className="w-5 h-5" />
              <span>가이드 패널</span>
            </button>
          </div>
        </div>

        {/* 메시지 목록 */}
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md px-4 py-2 rounded-lg ${message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.type === 'assistant'
                    ? 'bg-white text-gray-900 shadow'
                    : 'bg-yellow-100 text-yellow-800'
                  }`}
              >
                <div className="flex items-start space-x-2">
                  {message.type === 'assistant' && (
                    <AcademicCapIcon className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {message.type === 'assistant' && (
                    <button
                      onClick={() => copyToClipboard(message.content)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <ClipboardDocumentIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isGenerating && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-900 shadow px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <ArrowPathIcon className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-sm">메시지 생성 중...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 입력 영역 */}
        <div className="bg-white border-t p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={isGenerating}
            />
            <button
              onClick={handleSendMessage}
              disabled={isGenerating || !inputMessage.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              전송
            </button>
          </div>
        </div>
      </div>

      {/* 가이드 패널 */}
      {showGuidancePanel && (
        <div className="w-80 bg-white shadow-lg border-l">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">메시지 가이드</h3>
          </div>

          <div className="p-4 space-y-6">
            {/* 사용자 선호도 설정 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">응답 스타일</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">톤</label>
                  <select
                    value={userPreferences.tone}
                    onChange={(e) => setUserPreferences(prev => ({ ...prev, tone: e.target.value as any }))}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="formal">공식적</option>
                    <option value="casual">친근한</option>
                    <option value="professional">전문적</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">스타일</label>
                  <select
                    value={userPreferences.style}
                    onChange={(e) => setUserPreferences(prev => ({ ...prev, style: e.target.value as any }))}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="informative">정보 제공</option>
                    <option value="persuasive">설득적</option>
                    <option value="empathetic">공감적</option>
                    <option value="analytical">분석적</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">길이</label>
                  <select
                    value={userPreferences.length}
                    onChange={(e) => setUserPreferences(prev => ({ ...prev, length: e.target.value as any }))}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="short">짧음</option>
                    <option value="medium">보통</option>
                    <option value="long">길음</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 지침 선택 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">적용할 지침</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableGuidelines.map(guideline => (
                  <label key={guideline.id} className="flex items-start space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedGuidelines.some(g => g.id === guideline.id)}
                      onChange={() => handleGuidelineToggle(guideline)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{guideline.title}</p>
                      <p className="text-xs text-gray-600">{guideline.content}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-1 py-0.5 text-xs rounded ${guideline.priority === 'high' ? 'bg-red-100 text-red-800' :
                          guideline.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                          {guideline.priority}
                        </span>
                        <span className="text-xs text-gray-500">{guideline.category}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 생성된 응답 분석 */}
            {generatedResponse && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">응답 분석</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">신뢰도</span>
                    <span className="text-sm font-medium">
                      {(generatedResponse.confidence * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">처리 시간</span>
                    <span className="text-sm font-medium">
                      {generatedResponse.metadata.processingTime}ms
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">사용된 지침</span>
                    <span className="text-sm font-medium">
                      {generatedResponse.usedGuidelines.length}개
                    </span>
                  </div>

                  {generatedResponse.suggestions && (
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm text-blue-800">
                        <span className="text-xs text-gray-600">신뢰도</span>
                        <span className="text-sm font-medium">
                          {(generatedResponse.confidence * 100).toFixed(1)}%
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageGuidanceSystem; 