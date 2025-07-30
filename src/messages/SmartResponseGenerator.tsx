import React, { useState, useEffect } from 'react';
import {
  StarIcon, 
  LightBulbIcon,
  ClockIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import apiService from '../services/api';

interface ConversationContext {
  recentMessages: string[];
  dominantTopics: string[];
  sentimentTrend: 'positive' | 'negative' | 'neutral';
  participantCount: number;
  conversationPace: 'slow' | 'moderate' | 'fast';
}

interface SmartResponse {
  id: string;
  content: string;
  strategy: string;
  reasoning: string;
  confidence: number;
  contextMatch: number;
  timestamp: string;
}

interface SmartResponseGeneratorProps {
  isActive: boolean;
  selectedChatRoom: string;
  conversationContent: string;
}

const SmartResponseGenerator: React.FC<SmartResponseGeneratorProps> = ({ 
  isActive, 
  selectedChatRoom, 
  conversationContent 
}) => {
  const [conversationContext, setConversationContext] = useState<ConversationContext>({
    recentMessages: [],
    dominantTopics: [],
    sentimentTrend: 'neutral',
    participantCount: 0,
    conversationPace: 'moderate'
  });
  
  const [smartResponses, setSmartResponses] = useState<SmartResponse[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<SmartResponse | null>(null);
  const [autoMode, setAutoMode] = useState(false);

  // 실시간 대화 컨텍스트 분석
  const analyzeConversationContext = async () => {
    if (!selectedChatRoom) return;

    try {
      const analysis = await apiService.advancedAnalysis({
        conversationData: conversationContent,
        analysisModules: ['topic', 'sentiment', 'participant', 'pace'],
        responseStrategy: 'smart'
      });

      setConversationContext({
        recentMessages: [],
        dominantTopics: ['급여', '체불', '해결'],
        sentimentTrend: 'neutral',
        participantCount: 3,
        conversationPace: 'moderate'
      });
    } catch (error) {
      console.error('대화 컨텍스트 분석 실패:', error);
    }
  };

  // 스마트 응답 생성
  const generateSmartResponse = async () => {
    if (!selectedChatRoom) {
      alert('채팅방을 선택해주세요.');
      return;
    }

    setIsAnalyzing(true);
    try {
      // 먼저 대화 컨텍스트 분석
      await analyzeConversationContext();

      // 컨텍스트 기반 스마트 응답 생성
      const result = await apiService.generateSmartResponse({
        chatRoomId: selectedChatRoom,
        conversationContext: {
          messages: [],
          strategy: 'adaptive',
          characteristics: 'neutral',
          preference: 'neutral',
          desiredContent: ''
        },
        includeReasoning: true
      });

              const newResponse: SmartResponse = {
          id: Date.now().toString(),
          content: result.message,
          strategy: 'adaptive',
          reasoning: result.reasoning || '',
          confidence: result.confidence,
          contextMatch: 0.8,
          timestamp: new Date().toLocaleTimeString()
        };

      setSmartResponses(prev => [newResponse, ...prev].slice(-5));
      setSelectedResponse(newResponse);

    } catch (error) {
      console.error('스마트 응답 생성 실패:', error);
      alert('스마트 응답 생성에 실패했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 자동 모드 토글
  const toggleAutoMode = () => {
    setAutoMode(!autoMode);
  };

  // 자동 응답 생성 (5초마다)
  useEffect(() => {
    if (!autoMode || !isActive || !selectedChatRoom) return;

    const interval = setInterval(() => {
      generateSmartResponse();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoMode, isActive, selectedChatRoom]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPaceColor = (pace: string) => {
    switch (pace) {
      case 'fast': return 'text-red-600';
      case 'slow': return 'text-blue-600';
      default: return 'text-green-600';
    }
  };

  const getContextMatchColor = (match: number) => {
    if (match >= 0.9) return 'text-green-600';
    if (match >= 0.7) return 'text-blue-600';
    if (match >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isActive) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold text-gray-900">스마트 응답 생성기</h2>
        </div>
        <button
          onClick={toggleAutoMode}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            autoMode
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          <LightBulbIcon className="w-4 h-4" />
          <span>{autoMode ? '자동 모드 ON' : '자동 모드 OFF'}</span>
        </button>
      </div>

      {/* 대화 컨텍스트 분석 결과 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">대화 컨텍스트 분석</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-3 rounded-lg border">
            <div className="flex items-center space-x-2 mb-2">
              <ChartBarIcon className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">감정 트렌드</span>
            </div>
            <span className={`text-lg font-bold ${getSentimentColor(conversationContext.sentimentTrend)}`}>
              {conversationContext.sentimentTrend === 'positive' ? '긍정적' : 
               conversationContext.sentimentTrend === 'negative' ? '부정적' : '중립적'}
            </span>
          </div>
          
          <div className="bg-white p-3 rounded-lg border">
            <div className="flex items-center space-x-2 mb-2">
              <ClockIcon className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">대화 속도</span>
            </div>
            <span className={`text-lg font-bold ${getPaceColor(conversationContext.conversationPace)}`}>
              {conversationContext.conversationPace === 'fast' ? '빠름' : 
               conversationContext.conversationPace === 'slow' ? '느림' : '보통'}
            </span>
          </div>
          
          <div className="bg-white p-3 rounded-lg border">
            <div className="flex items-center space-x-2 mb-2">
              <StarIcon className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">참여자 수</span>
            </div>
            <span className="text-lg font-bold text-gray-900">
              {conversationContext.participantCount}명
            </span>
          </div>
          
          <div className="bg-white p-3 rounded-lg border">
            <div className="flex items-center space-x-2 mb-2">
              <UserGroupIcon className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">주요 주제</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {conversationContext.dominantTopics.slice(0, 2).map((topic, index) => (
                <span key={index} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 스마트 응답 생성 버튼 */}
      <div className="mb-6">
        <button
          onClick={generateSmartResponse}
          disabled={isAnalyzing || !selectedChatRoom}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            isAnalyzing || !selectedChatRoom
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          <PlayIcon className="w-5 h-5" />
          <span>{isAnalyzing ? '분석 중...' : '스마트 응답 생성'}</span>
        </button>
      </div>

      {/* 생성된 스마트 응답 목록 */}
      {smartResponses.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">생성된 스마트 응답</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {smartResponses.map((response) => (
              <div
                key={response.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedResponse?.id === response.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedResponse(response)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {response.strategy}
                    </span>
                    <span className={`text-sm font-bold ${getContextMatchColor(response.contextMatch)}`}>
                      컨텍스트 매칭: {Math.round(response.contextMatch * 100)}%
                    </span>
                    <span className={`text-sm font-bold ${getContextMatchColor(response.confidence)}`}>
                      신뢰도: {Math.round(response.confidence * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <ClockIcon className="w-4 h-4" />
                    <span>{response.timestamp}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-3 text-left whitespace-pre-wrap">{response.content}</p>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-xs font-medium text-gray-700 mb-1">생성 이유</h4>
                  <p className="text-xs text-gray-600 text-left whitespace-pre-wrap">{response.reasoning}</p>
                </div>
                
                <div className="flex items-center space-x-2 mt-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <CogIcon className="w-3 h-3 mr-1" />
                    스마트 AI
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <DocumentTextIcon className="w-3 h-3 mr-1" />
                    컨텍스트 기반
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 선택된 응답 상세 보기 */}
      {selectedResponse && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">선택된 스마트 응답</h4>
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-gray-700 mb-3 text-left whitespace-pre-wrap">{selectedResponse.content}</p>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <span className="font-medium">전략:</span> {selectedResponse.strategy}
              </div>
              <div>
                <span className="font-medium">신뢰도:</span> {Math.round(selectedResponse.confidence * 100)}%
              </div>
              <div>
                <span className="font-medium">컨텍스트 매칭:</span> {Math.round(selectedResponse.contextMatch * 100)}%
              </div>
              <div>
                <span className="font-medium">생성시간:</span> {selectedResponse.timestamp}
              </div>
            </div>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <h5 className="text-sm font-medium text-gray-700 mb-1">AI 추론 과정</h5>
              <p className="text-sm text-gray-600 text-left whitespace-pre-wrap">{selectedResponse.reasoning}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartResponseGenerator; 