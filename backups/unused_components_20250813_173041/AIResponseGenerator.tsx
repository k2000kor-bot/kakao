import React, { useState, useEffect } from 'react';
import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { Message } from '../types/chat';

interface AIResponseGeneratorProps {
  messages: Message[];
  selectedStrategy: string;
  authorCharacteristic: string;
  audiencePreference: string;
  desiredContent: string;
  selectedMessage?: Message;
}

interface GeneratedResponse {
  id: string;
  content: string;
  strategy: string;
  confidence: number;
  reasoning: string;
  timestamp: string;
}

const AIResponseGenerator: React.FC<AIResponseGeneratorProps> = ({
  messages,
  selectedStrategy,
  authorCharacteristic,
  audiencePreference,
  desiredContent,
  selectedMessage
}) => {
  const [generatedResponses, setGeneratedResponses] = useState<GeneratedResponse[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<GeneratedResponse | null>(null);

  const generateResponse = async () => {
    if (!messages.length) return;

    setIsGenerating(true);

    // 실제로는 AI API를 호출하여 응답 생성
    setTimeout(() => {
      const recentMessages = messages.slice(-5);
      const context = recentMessages.map(m => m.content).join(' ');

      // 시뮬레이션된 응답 생성
      const responses: GeneratedResponse[] = [];

      // 전략별 응답 생성
      if (selectedStrategy === 'empathetic') {
        responses.push({
          id: Date.now().toString(),
          content: '현재 상황을 충분히 이해하고 있습니다. 조합원 여러분의 우려사항에 대해 공감하며, 구체적인 해결 방안을 제시하겠습니다.',
          strategy: '공감적',
          confidence: 0.85,
          reasoning: '부정적인 감정이 감지되어 공감과 해결책이 필요합니다.',
          timestamp: new Date().toLocaleTimeString()
        });
      }

      if (selectedStrategy === 'informative') {
        responses.push({
          id: (Date.now() + 1).toString(),
          content: '현재 진행 상황과 향후 일정에 대해 상세히 안내드리겠습니다. 모든 조합원이 명확히 이해할 수 있도록 구체적인 정보를 제공하겠습니다.',
          strategy: '정보 제공',
          confidence: 0.9,
          reasoning: '정보 전달이 필요한 상황으로 판단됩니다.',
          timestamp: new Date().toLocaleTimeString()
        });
      }

      if (selectedStrategy === 'action-oriented') {
        responses.push({
          id: (Date.now() + 2).toString(),
          content: '즉시 조치 가능한 구체적인 행동 계획을 수립하여 실행하겠습니다. 각 단계별로 명확한 일정과 담당자를 지정하겠습니다.',
          strategy: '행동 지향',
          confidence: 0.95,
          reasoning: '긴급한 상황이 감지되어 즉각적인 행동이 필요합니다.',
          timestamp: new Date().toLocaleTimeString()
        });
      }

      // 기본 응답
      if (responses.length === 0) {
        responses.push({
          id: (Date.now() + 3).toString(),
          content: '조합원 여러분의 의견을 경청하고 있습니다. 건설적인 대화를 통해 함께 해결책을 찾아보겠습니다.',
          strategy: '기본',
          confidence: 0.8,
          reasoning: '일반적인 상황에 적합한 응답입니다.',
          timestamp: new Date().toLocaleTimeString()
        });
      }

      setGeneratedResponses(prev => [...responses, ...prev].slice(-5));
      setIsGenerating(false);
    }, 2000);
  };

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case '공감적': return 'text-blue-600 bg-blue-50';
      case '정보 제공': return 'text-green-600 bg-green-50';
      case '행동 지향': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case '공감적': return <ChatBubbleLeftRightIcon className="w-4 h-4" />;
      case '정보 제공': return <CheckCircleIcon className="w-4 h-4" />;
      case '행동 지향': return <ExclamationTriangleIcon className="w-4 h-4" />;
      default: return <StarIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <StarIcon className="w-5 h-5 mr-2 text-green-600" />
          AI 응답 생성
        </h3>
        <button
          onClick={generateResponse}
          disabled={isGenerating}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
        >
          {isGenerating ? (
            <div className="flex items-center">
              <ClockIcon className="w-4 h-4 animate-spin mr-2" />
              생성 중...
            </div>
          ) : (
            '응답 생성'
          )}
        </button>
      </div>

      {/* 생성된 응답 목록 */}
      <div className="space-y-4">
        <h4 className="font-semibold text-sm text-gray-700 mb-3">생성된 응답</h4>
        {generatedResponses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <StarIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>응답을 생성해보세요.</p>
          </div>
        ) : (
          generatedResponses.map((response) => (
            <div
              key={response.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedResponse?.id === response.id
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
                }`}
              onClick={() => setSelectedResponse(response)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getStrategyIcon(response.strategy)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStrategyColor(response.strategy)}`}>
                    {response.strategy}
                  </span>
                  <span className="text-sm font-bold text-green-600">
                    {Math.round(response.confidence * 100)}%
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {response.timestamp}
                </span>
              </div>

              <p className="text-sm text-gray-800 mb-3 leading-relaxed">
                {response.content}
              </p>

              <div className="text-xs text-gray-600">
                <span>근거: {response.reasoning}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 선택된 응답 상세 정보 */}
      {selectedResponse && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h4 className="font-semibold text-sm text-gray-700 mb-2">선택된 응답</h4>
          <div className="space-y-2">
            <div>
              <span className="text-xs text-gray-500">전략:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStrategyColor(selectedResponse.strategy)}`}>
                {selectedResponse.strategy}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500">신뢰도:</span>
              <span className="ml-2 text-sm font-bold text-green-600">
                {Math.round(selectedResponse.confidence * 100)}%
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500">생성 시간:</span>
              <span className="ml-2 text-sm text-gray-600">
                {selectedResponse.timestamp}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 사용 설정 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-sm text-gray-700 mb-3">생성 설정</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">선택된 전략:</span>
            <span className="ml-2 font-medium text-gray-700">
              {selectedStrategy || '기본'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">작성자 특성:</span>
            <span className="ml-2 font-medium text-gray-700">
              {authorCharacteristic || '미설정'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">대상자 선호도:</span>
            <span className="ml-2 font-medium text-gray-700">
              {audiencePreference || '미설정'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">원하는 내용:</span>
            <span className="ml-2 font-medium text-gray-700">
              {desiredContent || '미설정'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIResponseGenerator; 