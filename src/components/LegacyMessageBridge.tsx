import React, { useState, useEffect } from 'react';
import {
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  LightBulbIcon,
  DocumentTextIcon,
  CogIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  UserIcon,
  CalendarIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import KnowledgeBasedMessageGenerator from './KnowledgeBasedMessageGenerator';
import MessageGuidanceSystem from './MessageGuidanceSystem';
import knowledgeService from '../services/knowledgeService';
import { Message } from '../types/conversation';

interface LegacyMessageBridgeProps {
  selectedMessage?: any;
  messages?: Message[];
  onMessageGenerated?: (message: string) => void;
  onResponseGenerated?: (response: string) => void;
}

const LegacyMessageBridge: React.FC<LegacyMessageBridgeProps> = ({
  selectedMessage: initialSelectedMessage,
  messages: initialMessages = [],
  onMessageGenerated,
  onResponseGenerated
}) => {
  const [activeMode, setActiveMode] = useState<'legacy' | 'enhanced' | 'guidance'>('legacy');
  const [knowledgeBaseId, setKnowledgeBaseId] = useState<string>('kb_1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedResponse, setGeneratedResponse] = useState<string>('');
  const [responseQuality, setResponseQuality] = useState<{
    confidence: number;
    reasoning: string;
    suggestions: string;
  } | null>(null);

  // 대화 데이터 관리
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [selectedMessage, setSelectedMessage] = useState<any>(initialSelectedMessage);
  const [selectedChatRoom, setSelectedChatRoom] = useState<string>('우성7차_아파트_조합원');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'questions' | 'complaints' | 'suggestions'>('all');

  // 기존 시스템과의 호환성을 위한 상태
  const [legacyResponse, setLegacyResponse] = useState<string>('');
  const [enhancedResponse, setEnhancedResponse] = useState<string>('');

  // 대화방 목록
  const chatRooms = [
    '우성7차_아파트_조합원',
    '안전관리_팀',
    '시공_진행상황',
    '일반_문의사항'
  ];

  // 대화 데이터 로드
  useEffect(() => {
    loadChatDataFromService();
  }, [selectedChatRoom]);

  const loadChatData = async (chatRoomId: string): Promise<Message[]> => {
    // 샘플 데이터 반환
    return [
      {
        id: '1',
        timestamp: '2025년 6월 24일 오전 9:22',
        sender: '회원',
        content: '환급금 3억 받은걸로 알고 있습니다!',
        sentiment: 'neutral'
      },
      {
        id: '2',
        timestamp: '2025년 6월 24일 오전 9:25',
        sender: '우성',
        content: '개인당 2천만원 정도 받으신 것 같은데',
        sentiment: 'positive'
      }
    ];
  };

  const loadChatDataFromService = async () => {
    setIsLoadingMessages(true);
    try {
      const chatData = await loadChatData(selectedChatRoom);
      setMessages(chatData);
      console.log(`${selectedChatRoom}에서 ${chatData.length}개의 메시지를 로드했습니다.`);
    } catch (error) {
      console.error('대화 데이터 로드 실패:', error);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // 메시지 필터링
  const getFilteredMessages = () => {
    let filtered = messages;

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(msg =>
        msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.sender?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 타입별 필터링
    switch (filterType) {
      case 'questions':
        filtered = filtered.filter(msg =>
          /\?|언제|어떻게|왜|무엇|어디/.test(msg.content)
        );
        break;
      case 'complaints':
        filtered = filtered.filter(msg =>
          /불만|문제|어려움|체불|지연|실패|화남|짜증/.test(msg.content)
        );
        break;
      case 'suggestions':
        filtered = filtered.filter(msg =>
          /제안|제안사항|개선|바람|희망|좋은|좋겠/.test(msg.content)
        );
        break;
    }

    return filtered;
  };

  const handleMessageSelect = (message: Message) => {
    setSelectedMessage(message);
    // 이전 응답 초기화
    setLegacyResponse('');
    setEnhancedResponse('');
    setGeneratedResponse('');
    setResponseQuality(null);
  };

  const generateLegacyResponse = async () => {
    if (!selectedMessage) {
      alert('대응할 메시지를 선택해주세요.');
      return;
    }

    setIsProcessing(true);
    try {
      // 기존 로직 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1500));

      const content = selectedMessage.content.toLowerCase();
      const sender = selectedMessage.sender;
      let response = '';

      // 상황별 응답 생성
      if (/불만|문제|어려움|체불/.test(content)) {
        response = `말씀하신 내용 잘 이해했습니다. 빠르게 확인해서 해결방안을 마련하겠습니다. 구체적인 조치사항은 별도로 안내드리겠습니다.`;
      } else if (/\?|언제|어떻게|왜/.test(content)) {
        response = `궁금하신 점에 대해 자세히 안내드리겠습니다. 관련 부서와 확인 후 정확한 답변을 드리겠습니다.`;
      } else if (/안전|사고|위험/.test(content)) {
        response = `안전 관련해서는 항상 신경 쓰고 있습니다. 구체적으로 확인해보고 필요한 조치를 취하겠습니다.`;
      } else if (/일정|진행|완료/.test(content)) {
        response = `현재 진행 상황을 확인해서 정확한 일정을 안내드리겠습니다.`;
      } else if (/품질|검사|점검/.test(content)) {
        response = `품질 관리에 대해 엄격하게 점검하고 있습니다. 말씀하신 부분도 함께 확인하겠습니다.`;
      } else {
        response = `좋은 의견 감사합니다. 참고하여 개선하겠습니다. 추가로 궁금하신 점이 있으시면 언제든 말씀해 주세요.`;
      }

      setLegacyResponse(response);
      if (onResponseGenerated) {
        onResponseGenerated(response);
      }
    } catch (error) {
      console.error('기존 응답 생성 실패:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateEnhancedResponse = async () => {
    if (!selectedMessage) {
      alert('대응할 메시지를 선택해주세요.');
      return;
    }

    setIsProcessing(true);
    try {
      // 지식 베이스 기반 응답 생성
      const request = {
        context: selectedMessage.content,
        knowledgeBaseId,
        userPreferences: {
          tone: 'formal' as const,
          style: 'informative' as const,
          length: 'medium' as const
        }
      };

      const result = await knowledgeService.generateMessage(request);
      setEnhancedResponse(result.generatedMessage);
      setResponseQuality({
        confidence: result.confidence,
        reasoning: result.reasoning,
        suggestions: result.suggestions
      });

      if (onMessageGenerated) {
        onMessageGenerated(result.generatedMessage);
      }
    } catch (error) {
      console.error('향상된 응답 생성 실패:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleModeChange = (mode: 'legacy' | 'enhanced' | 'guidance') => {
    setActiveMode(mode);
    setGeneratedResponse('');
    setResponseQuality(null);
  };

  const filteredMessages = getFilteredMessages();

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <span className="bg-neutral-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">35</span>
                대응 메시지 생성
              </h2>
              <p className="text-sm text-gray-600">기존 대화를 분석하여 적절한 대응 메시지를 생성합니다</p>
            </div>
          </div>
        </div>

        {/* 대화방 선택 */}
        <div className="flex items-center space-x-4 mb-4">
          <label className="text-sm font-medium text-gray-700">대화방:</label>
          <select
            value={selectedChatRoom}
            onChange={(e) => setSelectedChatRoom(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            aria-label="대화방 선택"
          >
            {chatRooms.map(room => (
              <option key={room} value={room}>{room}</option>
            ))}
          </select>

          <button
            onClick={loadChatDataFromService}
            disabled={isLoadingMessages}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-300"
          >
            {isLoadingMessages ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowPathIcon className="w-4 h-4" />
            )}
            <span>새로고침</span>
          </button>
        </div>

        {/* 검색 및 필터 */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="메시지 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            aria-label="메시지 필터 선택"
          >
            <option value="all">전체</option>
            <option value="questions">질문</option>
            <option value="complaints">불만/문제</option>
            <option value="suggestions">제안</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 메시지 목록 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">대화 메시지</h3>
            <p className="text-sm text-gray-600">{filteredMessages.length}개의 메시지</p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoadingMessages ? (
              <div className="p-6 text-center">
                <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-gray-600">메시지 로딩 중...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-6 text-center">
                <DocumentTextIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">메시지가 없습니다.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredMessages.map((message, index) => (
                  <div
                    key={message.id || index}
                    onClick={() => handleMessageSelect(message)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedMessage?.id === message.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{message.sender}</span>
                          <span className="text-xs text-gray-500">
                            {message.timestamp?.toLocaleString() || '시간 없음'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 선택된 메시지 및 응답 생성 */}
        <div className="space-y-6">
          {/* 선택된 메시지 */}
          {selectedMessage && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">선택된 메시지</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {selectedMessage.sender?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">
                      {selectedMessage.sender} • {selectedMessage.timestamp?.toLocaleString()}
                    </p>
                    <p className="text-gray-900">{selectedMessage.content}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 응답 생성 */}
          {selectedMessage && (
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">대응 메시지 생성</h3>
                <button
                  onClick={activeMode === 'legacy' ? generateLegacyResponse : generateEnhancedResponse}
                  disabled={isProcessing}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isProcessing ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      <span>생성 중...</span>
                    </>
                  ) : (
                    <>
                      <StarIcon className="w-4 h-4" />
                      <span>응답 생성</span>
                    </>
                  )}
                </button>
              </div>

              {/* 생성된 응답 표시 */}
              {(legacyResponse || enhancedResponse) && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">생성된 응답</h4>
                  <p className="text-green-800">{legacyResponse || enhancedResponse}</p>

                  {responseQuality && (
                    <div className="mt-3 p-3 bg-blue-50 rounded">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-700">신뢰도:</span>
                        <span className="font-medium">{(responseQuality.confidence * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 모드 선택 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">생성 모드 선택</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleModeChange('legacy')}
            className={`p-4 rounded-lg border-2 transition-colors ${activeMode === 'legacy'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <div className="text-center">
              <DocumentTextIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">기존 시스템</h4>
              <p className="text-sm text-gray-600 mt-1">빠른 템플릿 기반 응답</p>
            </div>
          </button>

          <button
            onClick={() => handleModeChange('enhanced')}
            className={`p-4 rounded-lg border-2 transition-colors ${activeMode === 'enhanced'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <div className="text-center">
              <AcademicCapIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">AI 강화</h4>
              <p className="text-sm text-gray-600 mt-1">지식 베이스 기반 응답</p>
            </div>
          </button>

          <button
            onClick={() => handleModeChange('guidance')}
            className={`p-4 rounded-lg border-2 transition-colors ${activeMode === 'guidance'
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <div className="text-center">
              <LightBulbIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">가이드 시스템</h4>
              <p className="text-sm text-gray-600 mt-1">실시간 가이드 제공</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegacyMessageBridge; 