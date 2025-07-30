import React, { useState, useEffect } from 'react';
import {
  StarIcon, 
  ChatBubbleLeftRightIcon, 
  DocumentTextIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import apiService from '../services/api';

interface ResponseTemplate {
  id: string;
  title: string;
  content: string;
  strategy: string;
  category: string;
  tags: string[];
}

interface GeneratedResponse {
  id: string;
  content: string;
  strategy: string;
  confidence: number;
  timestamp: string;
  isCustomized: boolean;
}

interface ResponseMessageGeneratorProps {
  isActive: boolean;
  selectedChatRoom: string;
  conversationContent: string;
}

const ResponseMessageGenerator: React.FC<ResponseMessageGeneratorProps> = ({ 
  isActive, 
  selectedChatRoom, 
  conversationContent 
}) => {
  const [responseStrategy, setResponseStrategy] = useState<string>('information_provision');
  const [speakerCharacteristics, setSpeakerCharacteristics] = useState<string>('neutral_harmonizer');
  const [speakerPreference, setSpeakerPreference] = useState<string>('neutral');
  const [desiredContent, setDesiredContent] = useState<string>('');
  const [generatedResponses, setGeneratedResponses] = useState<GeneratedResponse[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<GeneratedResponse | null>(null);

  const responseStrategies = [
    {
      id: 'logical_rebuttal',
      title: '논리적 반박',
      description: '사실과 논리를 바탕으로 한 객관적인 반박',
      color: 'bg-blue-500',
      icon: DocumentTextIcon
    },
    {
      id: 'emotional_softening',
      title: '감정 완화',
      description: '감정적 대립을 완화하고 공감을 표현하는 전략',
      color: 'bg-green-500',
      icon: UserIcon
    },
    {
      id: 'information_provision',
      title: '정보 제공',
      description: '정확한 정보를 제공하여 오해를 해소하는 전략',
      color: 'bg-purple-500',
      icon: DocumentTextIcon
    },
    {
      id: 'unity_emphasis',
      title: '단결 강조',
      description: '분열보다는 단결의 중요성을 강조하는 전략',
      color: 'bg-orange-500',
      icon: StarIcon
    }
  ];

  const speakerCharacteristicsOptions = [
    { id: 'neutral_harmonizer', name: '중립 조화자', description: '갈등을 중재하고 화합을 도모' },
    { id: 'logical_analyst', name: '논리 분석가', description: '사실과 데이터를 바탕으로 분석' },
    { id: 'empathetic_supporter', name: '공감 지지자', description: '감정적 공감과 지지를 표현' },
    { id: 'authoritative_leader', name: '권위적 리더', description: '명확한 방향 제시와 결단' }
  ];

  const speakerPreferenceOptions = [
    { id: 'neutral', name: '중립적', description: '객관적이고 균형잡힌 접근' },
    { id: 'supportive', name: '지지적', description: '적극적인 지지와 격려' },
    { id: 'critical', name: '비판적', description: '건설적인 비판과 제안' },
    { id: 'informative', name: '정보적', description: '사실 중심의 정보 제공' }
  ];

  const handleGenerateResponse = async () => {
    if (!selectedChatRoom) {
      alert('채팅방을 선택해주세요.');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await apiService.generateAIResponse({
        strategy: responseStrategy,
        characteristics: speakerCharacteristics,
        preference: speakerPreference,
        content: desiredContent,
        chatRoomId: selectedChatRoom
      });

      const newResponse: GeneratedResponse = {
        id: Date.now().toString(),
        content: result.message,
        strategy: responseStrategy,
        confidence: result.confidence,
        timestamp: new Date().toLocaleTimeString(),
        isCustomized: true
      };

      setGeneratedResponses(prev => [newResponse, ...prev].slice(-10));
      setSelectedResponse(newResponse);

      // WebSocket을 통해 실시간 결과 전송
      // WebSocket 서비스는 별도로 import하여 사용

    } catch (error) {
      console.error('AI 응답 생성 중 오류:', error);
      alert('AI 응답 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAdvancedResponse = async () => {
    if (!selectedChatRoom) {
      alert('채팅방을 선택해주세요.');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await apiService.advancedAnalysis({
        conversationData: conversationContent,
        analysisModules: ['emotion', 'topic', 'participant', 'trend'],
        responseStrategy
      });

      const newResponse: GeneratedResponse = {
        id: Date.now().toString(),
        content: result.recommendations.join(' ') || '고도화된 AI 응답이 생성되었습니다.',
        strategy: responseStrategy,
        confidence: result.confidence || 0.85,
        timestamp: new Date().toLocaleTimeString(),
        isCustomized: true
      };

      setGeneratedResponses(prev => [newResponse, ...prev].slice(-10));
      setSelectedResponse(newResponse);

      // WebSocket을 통해 실시간 결과 전송
      // WebSocket 서비스는 별도로 import하여 사용

    } catch (error) {
      console.error('고도화된 AI 응답 생성 중 오류:', error);
      alert('고도화된 AI 응답 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getStrategyName = (strategy: string) => {
    const found = responseStrategies.find(s => s.id === strategy);
    return found ? found.title : strategy;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.8) return 'text-blue-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isActive) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-2 mb-6">
        <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">AI 대응 메시지 생성</h2>
      </div>

      {/* 전략 선택 */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">대응 전략 선택</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {responseStrategies.map((strategy) => (
            <button
              key={strategy.id}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                responseStrategy === strategy.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setResponseStrategy(strategy.id)}
            >
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-8 h-8 ${strategy.color} rounded-lg flex items-center justify-center`}>
                  <strategy.icon className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-medium text-gray-900">{strategy.title}</h4>
              </div>
              <p className="text-xs text-gray-600">{strategy.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 화자 특성 및 선호도 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">화자 특성</h3>
          <select 
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={speakerCharacteristics}
            onChange={(e) => setSpeakerCharacteristics(e.target.value)}
          >
            {speakerCharacteristicsOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name} - {option.description}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">화자 선호도</h3>
          <select 
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={speakerPreference}
            onChange={(e) => setSpeakerPreference(e.target.value)}
          >
            {speakerPreferenceOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name} - {option.description}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 원하는 내용 입력 */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">원하는 내용</h3>
        <textarea
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="AI가 포함해야 할 특정 내용이나 메시지를 입력하세요..."
          value={desiredContent}
          onChange={(e) => setDesiredContent(e.target.value)}
        />
      </div>

      {/* 메시지 생성 버튼 */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={handleGenerateResponse}
          disabled={isGenerating || !selectedChatRoom}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            isGenerating || !selectedChatRoom
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <StarIcon className="w-5 h-5" />
          <span>{isGenerating ? '생성 중...' : 'AI 응답 생성'}</span>
        </button>
        
        <button
          onClick={handleAdvancedResponse}
          disabled={isGenerating || !selectedChatRoom}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            isGenerating || !selectedChatRoom
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          <StarIcon className="w-5 h-5" />
          <span>{isGenerating ? '생성 중...' : '고도화된 AI 응답'}</span>
        </button>
      </div>

      {/* 생성된 응답 목록 */}
      {generatedResponses.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">생성된 응답</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {generatedResponses.map((response) => (
              <div
                key={response.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedResponse?.id === response.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedResponse(response)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {getStrategyName(response.strategy)}
                    </span>
                    <span className={`text-sm font-bold ${getConfidenceColor(response.confidence)}`}>
                      {Math.round(response.confidence * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <ClockIcon className="w-4 h-4" />
                    <span>{response.timestamp}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-2 text-left whitespace-pre-wrap">{response.content}</p>
                <div className="flex items-center space-x-2">
                  {response.isCustomized && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircleIcon className="w-3 h-3 mr-1" />
                      맞춤형
                    </span>
                  )}
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    AI 생성
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
          <h4 className="font-medium text-gray-900 mb-2">선택된 응답</h4>
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-gray-700 mb-3 text-left whitespace-pre-wrap">{selectedResponse.content}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>전략: {getStrategyName(selectedResponse.strategy)}</span>
              <span>신뢰도: {Math.round(selectedResponse.confidence * 100)}%</span>
              <span>생성시간: {selectedResponse.timestamp}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponseMessageGenerator; 