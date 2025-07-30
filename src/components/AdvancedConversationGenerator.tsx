import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import {
  StarIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  ScaleIcon,
  LightBulbIcon,
  DocumentTextIcon,
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface ConversationStyle {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
}

interface ResponseType {
  id: string;
  name: string;
  description: string;
}

interface GeneratedConversation {
  id: string;
  original_message: string;
  responses: string[];
  style: string;
  response_type: string;
  timestamp: string;
}

const AdvancedConversationGenerator: React.FC = () => {
  const [originalMessage, setOriginalMessage] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('professional');
  const [selectedResponseType, setSelectedResponseType] = useState<string>('informative');
  const [guidelines, setGuidelines] = useState<string[]>([]);
  const [references, setReferences] = useState<string[]>([]);
  const [targetAudience, setTargetAudience] = useState<string>('general');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedConversations, setGeneratedConversations] = useState<GeneratedConversation[]>([]);
  const [currentGuideline, setCurrentGuideline] = useState<string>('');
  const [currentReference, setCurrentReference] = useState<string>('');

  const conversationStyles: ConversationStyle[] = [
    {
      id: 'professional',
      name: '전문적',
      description: '조합원과의 공식적인 소통에 적합한 전문적인 톤',
      icon: DocumentTextIcon
    },
    {
      id: 'empathetic',
      name: '공감적',
      description: '조합원의 감정을 이해하고 공감하는 따뜻한 톤',
      icon: UserIcon
    },
    {
      id: 'collaborative',
      name: '협력적',
      description: '함께 해결책을 찾아가는 협력적인 톤',
      icon: ScaleIcon
    },
    {
      id: 'inspiring',
      name: '격려적',
      description: '조합원들을 격려하고 동기부여하는 톤',
      icon: LightBulbIcon
    }
  ];

  const responseTypes: ResponseType[] = [
    {
      id: 'informative',
      name: '정보 제공',
      description: '정확한 정보와 사실을 제공하는 응답'
    },
    {
      id: 'persuasive',
      name: '설득적',
      description: '논리적으로 설득하는 응답'
    },
    {
      id: 'supportive',
      name: '지지적',
      description: '조합원을 지지하고 지원하는 응답'
    },
    {
      id: 'problem_solving',
      name: '문제 해결',
      description: '구체적인 해결책을 제시하는 응답'
    }
  ];

  const sampleMessages = [
    "조합원 복지 혜택이 부족하다고 생각합니다.",
    "시공사와의 협의가 잘 진행되지 않고 있어요.",
    "회의 일정을 조정해주시면 좋겠습니다.",
    "새로운 규정에 대해 자세히 설명해주세요.",
    "조합원들의 의견을 더 잘 반영해주세요."
  ];

  const handleGenerateConversation = async () => {
    if (!originalMessage.trim()) {
      alert('원본 메시지를 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await apiService.generateSmartResponse({
        chatRoomId: 'sample',
        conversationContext: {
          messages: [{
            id: Date.now().toString(),
            sender: '조합원',
            content: originalMessage,
            timestamp: new Date().toISOString(),
            messageType: 'text',
            isDeleted: false,
            mediaFiles: []
          }],
          strategy: selectedResponseType,
          characteristics: selectedStyle,
          preference: 'neutral',
          desiredContent: guidelines.join(', ')
        },
        includeReasoning: true
      });

      const newConversation: GeneratedConversation = {
        id: Date.now().toString(),
        original_message: originalMessage,
        responses: [response.message || '응답이 생성되었습니다.'],
        style: selectedStyle,
        response_type: selectedResponseType,
        timestamp: new Date().toISOString()
      };

      setGeneratedConversations(prev => [newConversation, ...prev]);
      setOriginalMessage('');
    } catch (error) {
      console.error('대화 생성 실패:', error);
      alert('대화 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddGuideline = () => {
    if (currentGuideline.trim() && !guidelines.includes(currentGuideline.trim())) {
      setGuidelines(prev => [...prev, currentGuideline.trim()]);
      setCurrentGuideline('');
    }
  };

  const handleRemoveGuideline = (index: number) => {
    setGuidelines(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddReference = () => {
    if (currentReference.trim() && !references.includes(currentReference.trim())) {
      setReferences(prev => [...prev, currentReference.trim()]);
      setCurrentReference('');
    }
  };

  const handleRemoveReference = (index: number) => {
    setReferences(prev => prev.filter((_, i) => i !== index));
  };

  const handleSampleMessageClick = (message: string) => {
    setOriginalMessage(message);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
        <StarIcon className="w-6 h-6 mr-2 text-purple-600" />
        고급 대화 생성기
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 입력 섹션 */}
        <div className="space-y-6">
          {/* 원본 메시지 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              원본 메시지
            </label>
            <textarea
              value={originalMessage}
              onChange={(e) => setOriginalMessage(e.target.value)}
              placeholder="조합원이 보낸 메시지를 입력하세요..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
            />

            {/* 샘플 메시지 */}
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">샘플 메시지:</p>
              <div className="flex flex-wrap gap-2">
                {sampleMessages.map((message, index) => (
                  <button
                    key={index}
                    onClick={() => handleSampleMessageClick(message)}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {message}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 대화 스타일 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              대화 스타일
            </label>
            <div className="grid grid-cols-2 gap-3">
              {conversationStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${selectedStyle === style.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <style.icon className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-900">{style.name}</span>
                  </div>
                  <p className="text-xs text-gray-600">{style.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 응답 유형 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              응답 유형
            </label>
            <div className="grid grid-cols-2 gap-3">
              {responseTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedResponseType(type.id)}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${selectedResponseType === type.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="font-medium text-gray-900 mb-1">{type.name}</div>
                  <p className="text-xs text-gray-600">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 가이드라인 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              응답 가이드라인
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={currentGuideline}
                onChange={(e) => setCurrentGuideline(e.target.value)}
                placeholder="가이드라인 추가..."
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddGuideline()}
              />
              <button
                onClick={handleAddGuideline}
                className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                추가
              </button>
            </div>
            <div className="space-y-1">
              {guidelines.map((guideline, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">{guideline}</span>
                  <button
                    onClick={() => handleRemoveGuideline(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 참고 자료 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              참고 자료
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={currentReference}
                onChange={(e) => setCurrentReference(e.target.value)}
                placeholder="참고 자료 추가..."
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddReference()}
              />
              <button
                onClick={handleAddReference}
                className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                추가
              </button>
            </div>
            <div className="space-y-1">
              {references.map((reference, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm text-gray-700">{reference}</span>
                  <button
                    onClick={() => handleRemoveReference(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 생성 버튼 */}
          <button
            onClick={handleGenerateConversation}
            disabled={isGenerating || !originalMessage.trim()}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                <span>생성 중...</span>
              </>
            ) : (
              <>
                <StarIcon className="w-5 h-5" />
                <span>대화 생성</span>
              </>
            )}
          </button>
        </div>

        {/* 결과 섹션 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
            생성된 대화
          </h3>

          {generatedConversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>생성된 대화가 없습니다.</p>
              <p className="text-sm">원본 메시지를 입력하고 대화를 생성해보세요.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {generatedConversations.map((conversation) => (
                <div key={conversation.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {conversation.style}
                      </span>
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        {conversation.response_type}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(conversation.timestamp).toLocaleString('ko-KR')}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border-l-4 border-gray-400">
                      <p className="text-sm text-gray-600 mb-1">원본 메시지:</p>
                      <p className="text-gray-800">{conversation.original_message}</p>
                    </div>

                    {conversation.responses.map((response, index) => (
                      <div key={index} className="bg-white p-3 rounded border-l-4 border-blue-500">
                        <p className="text-sm text-gray-600 mb-1">AI 응답:</p>
                        <p className="text-gray-800 whitespace-pre-wrap">{response}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedConversationGenerator; 