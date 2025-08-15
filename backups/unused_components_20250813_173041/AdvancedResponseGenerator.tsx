import React, { useState, useEffect } from 'react';

interface SelectedMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
}

interface PersonalityType {
  id: string;
  name: string;
  description: string;
}

interface PowerLevel {
  id: string;
  name: string;
  description: string;
}

interface ResponseMessage {
  id: string;
  content: string;
  sender: string;
  style: string;
  confidence: number;
  type: 'response' | 'support' | 'opposition' | 'neutral' | 'discussion';
}

interface ConversationThread {
  id: string;
  messages: ResponseMessage[];
  purpose: string;
  participants: string[];
}

const AdvancedResponseGenerator: React.FC = () => {
  const [selectedMessage, setSelectedMessage] = useState<SelectedMessage | null>(null);
  const [selectedPersonality, setSelectedPersonality] = useState<string>('');
  const [selectedPowerLevel, setSelectedPowerLevel] = useState<string>('');
  const [responseMessages, setResponseMessages] = useState<ResponseMessage[]>([]);
  const [conversationThreads, setConversationThreads] = useState<ConversationThread[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMode, setGenerationMode] = useState<'single' | 'conversation'>('conversation');

  // 성향 옵션
  const personalityTypes: PersonalityType[] = [
    { id: 'conservative', name: '보수적', description: '안정적이고 신중한 접근' },
    { id: 'neutral', name: '중립적', description: '균형잡힌 관점' },
    { id: 'critical', name: '비판적', description: '문제점을 지적하는 접근' },
    { id: 'progressive', name: '진보적', description: '개선과 변화를 추구' }
  ];

  // 시공사 선호도 옵션
  const powerLevels: PowerLevel[] = [
    { id: 'strong', name: '강대우', description: '조합원 이익 우선' },
    { id: 'medium', name: '중대우', description: '균형잡힌 입장' },
    { id: 'weak', name: '약대우', description: '시공사 입장 고려' },
    { id: 'none', name: '선호없음', description: '객관적 판단' }
  ];

  // 샘플 메시지 목록
  const sampleMessages: SelectedMessage[] = [
    {
      id: '1',
      content: '급여 체불 문제가 심각합니다. 조합에서 즉시 대응해주세요.',
      sender: '조합원A',
      timestamp: '2024-01-15 10:30'
    },
    {
      id: '2',
      content: '안전 규정이 너무 엄격해서 작업이 어렵습니다.',
      sender: '조합원B',
      timestamp: '2024-01-15 11:15'
    },
    {
      id: '3',
      content: '복지 혜택을 더 늘려주시면 좋겠습니다.',
      sender: '조합원C',
      timestamp: '2024-01-15 12:00'
    },
    {
      id: '4',
      content: '시공사와의 협의가 제대로 이루어지지 않고 있습니다.',
      sender: '조합원D',
      timestamp: '2024-01-15 13:45'
    }
  ];

  const generateResponse = async () => {
    if (!selectedMessage || !selectedPersonality || !selectedPowerLevel) {
      alert('메시지, 성향, 시공사 선호를 모두 선택해주세요.');
      return;
    }

    setIsGenerating(true);
    try {
      // 시뮬레이션된 응답 생성
      const responseContent = generateSimulatedResponse(selectedMessage.content, selectedPersonality, selectedPowerLevel);

      const responseMessage: ResponseMessage = {
        id: `response_${Date.now()}`,
        content: responseContent,
        sender: '조합 대표',
        style: selectedPersonality,
        confidence: 0.85,
        type: 'response'
      };

      setResponseMessages([responseMessage]);

      // 여론 형성을 위한 추가 대화 생성
      if (generationMode === 'conversation') {
        const conversationThreads = await generateConversationThreads(selectedMessage, responseMessage);
        setConversationThreads(conversationThreads);
      }

    } catch (error) {
      console.error('응답 생성 실패:', error);
      alert('응답 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSimulatedResponse = (originalContent: string, personality: string, powerLevel: string): string => {
    const responses = {
      conservative: {
        strong: '신중하게 검토하여 적절한 조치를 취하도록 하겠습니다.',
        medium: '관련 부서와 협의하여 해결방안을 모색하겠습니다.',
        weak: '시공사와의 협의를 통해 해결해보겠습니다.',
        none: '객관적으로 검토하여 적절한 대응을 하겠습니다.'
      },
      neutral: {
        strong: '조합원 여러분의 의견을 잘 들었습니다. 적절한 조치를 취하겠습니다.',
        medium: '균형잡힌 관점에서 문제를 해결해보겠습니다.',
        weak: '모든 이해관계자의 입장을 고려하여 해결하겠습니다.',
        none: '객관적 사실에 기반하여 대응하겠습니다.'
      },
      critical: {
        strong: '이 문제의 근본 원인을 파악하여 근본적인 해결책을 제시하겠습니다.',
        medium: '현재 상황의 문제점을 정확히 분석하여 개선하겠습니다.',
        weak: '시공사 측의 문제점도 함께 지적하여 해결하겠습니다.',
        none: '문제의 원인을 정확히 파악하여 개선하겠습니다.'
      },
      progressive: {
        strong: '혁신적인 해결책을 통해 문제를 근본적으로 해결하겠습니다.',
        medium: '새로운 접근 방식을 통해 개선해보겠습니다.',
        weak: '모든 당사자와 함께 새로운 해결책을 모색하겠습니다.',
        none: '창의적인 방법으로 문제를 해결하겠습니다.'
      }
    };

    return responses[personality as keyof typeof responses]?.[powerLevel as keyof typeof responses.conservative] ||
      '적절한 조치를 취하도록 하겠습니다.';
  };

  const generateConversationThreads = async (originalMessage: SelectedMessage, responseMessage: ResponseMessage) => {
    const threads: ConversationThread[] = [];

    // 지지하는 입장의 대화
    const supportThread = await generateSupportConversation(originalMessage, responseMessage);
    threads.push(supportThread);

    // 비판하는 입장의 대화
    const oppositionThread = await generateOppositionConversation(originalMessage, responseMessage);
    threads.push(oppositionThread);

    // 중립적 토론 대화
    const discussionThread = await generateDiscussionConversation(originalMessage, responseMessage);
    threads.push(discussionThread);

    return threads;
  };

  const generateSupportConversation = async (originalMessage: SelectedMessage, responseMessage: ResponseMessage): Promise<ConversationThread> => {
    const messages: ResponseMessage[] = [
      {
        id: `support_1_${Date.now()}`,
        content: '조합에서 신속하게 대응해주시니 정말 감사합니다.',
        sender: '조합원E',
        style: 'supportive',
        confidence: 0.9,
        type: 'support'
      },
      {
        id: `support_2_${Date.now()}`,
        content: '이런 문제가 있을 때마다 조합이 있어서 다행입니다.',
        sender: '조합원F',
        style: 'supportive',
        confidence: 0.85,
        type: 'support'
      },
      {
        id: `support_3_${Date.now()}`,
        content: '다른 조합원들도 비슷한 문제가 있을 것 같은데, 함께 해결해보시죠.',
        sender: '조합원G',
        style: 'supportive',
        confidence: 0.8,
        type: 'support'
      }
    ];

    return {
      id: `thread_support_${Date.now()}`,
      messages,
      purpose: '지지 및 공감',
      participants: ['조합원E', '조합원F', '조합원G']
    };
  };

  const generateOppositionConversation = async (originalMessage: SelectedMessage, responseMessage: ResponseMessage): Promise<ConversationThread> => {
    const messages: ResponseMessage[] = [
      {
        id: `opposition_1_${Date.now()}`,
        content: '언제나 같은 말만 하시네요. 실제로는 아무것도 해결되지 않습니다.',
        sender: '조합원H',
        style: 'critical',
        confidence: 0.9,
        type: 'opposition'
      },
      {
        id: `opposition_2_${Date.now()}`,
        content: '조합이 제대로 된 역할을 못하고 있는 것 같습니다.',
        sender: '조합원I',
        style: 'critical',
        confidence: 0.85,
        type: 'opposition'
      },
      {
        id: `opposition_3_${Date.now()}`,
        content: '더 구체적인 해결책을 제시해주세요.',
        sender: '조합원J',
        style: 'critical',
        confidence: 0.8,
        type: 'opposition'
      }
    ];

    return {
      id: `thread_opposition_${Date.now()}`,
      messages,
      purpose: '비판 및 요구',
      participants: ['조합원H', '조합원I', '조합원J']
    };
  };

  const generateDiscussionConversation = async (originalMessage: SelectedMessage, responseMessage: ResponseMessage): Promise<ConversationThread> => {
    const messages: ResponseMessage[] = [
      {
        id: `discussion_1_${Date.now()}`,
        content: '이 문제의 근본 원인은 무엇일까요?',
        sender: '조합원K',
        style: 'neutral',
        confidence: 0.9,
        type: 'discussion'
      },
      {
        id: `discussion_2_${Date.now()}`,
        content: '시공사 입장에서도 생각해볼 필요가 있을 것 같습니다.',
        sender: '조합원L',
        style: 'neutral',
        confidence: 0.85,
        type: 'discussion'
      },
      {
        id: `discussion_3_${Date.now()}`,
        content: '장기적인 해결책을 함께 모색해보는 게 어떨까요?',
        sender: '조합원M',
        style: 'neutral',
        confidence: 0.8,
        type: 'discussion'
      }
    ];

    return {
      id: `thread_discussion_${Date.now()}`,
      messages,
      purpose: '토론 및 협의',
      participants: ['조합원K', '조합원L', '조합원M']
    };
  };



  const getStyleColor = (style: string) => {
    switch (style) {
      case 'conservative': return 'bg-blue-100 text-blue-800';
      case 'neutral': return 'bg-gray-100 text-gray-800';
      case 'critical': return 'bg-red-100 text-red-800';
      case 'progressive': return 'bg-green-100 text-green-800';
      case 'supportive': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'response': return 'border-l-4 border-blue-500 bg-blue-50';
      case 'support': return 'border-l-4 border-green-500 bg-green-50';
      case 'opposition': return 'border-l-4 border-red-500 bg-red-50';
      case 'discussion': return 'border-l-4 border-yellow-500 bg-yellow-50';
      default: return 'border-l-4 border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-900">고급 응답 생성기</h1>

      {/* 메시지 선택 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">📝 메시지 선택</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sampleMessages.map((message) => (
            <div
              key={message.id}
              onClick={() => setSelectedMessage(message)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedMessage?.id === message.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-gray-800">{message.sender}</span>
                <span className="text-xs text-gray-500">{message.timestamp}</span>
              </div>
              <p className="text-sm text-gray-700">{message.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 성향 및 시공사 선호 선택 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">🎭 성향 선택</h3>
          <div className="space-y-2">
            {personalityTypes.map((personality) => (
              <label key={personality.id} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="personality"
                  value={personality.id}
                  checked={selectedPersonality === personality.id}
                  onChange={(e) => setSelectedPersonality(e.target.value)}
                  className="text-blue-600"
                />
                <div>
                  <div className="font-medium text-gray-800">{personality.name}</div>
                  <div className="text-sm text-gray-600">{personality.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">⚖️ 시공사 선호</h3>
          <div className="space-y-2">
            {powerLevels.map((power) => (
              <label key={power.id} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="powerLevel"
                  value={power.id}
                  checked={selectedPowerLevel === power.id}
                  onChange={(e) => setSelectedPowerLevel(e.target.value)}
                  className="text-blue-600"
                />
                <div>
                  <div className="font-medium text-gray-800">{power.name}</div>
                  <div className="text-sm text-gray-600">{power.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 생성 모드 선택 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">🔄 생성 모드</h3>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="generationMode"
              value="single"
              checked={generationMode === 'single'}
              onChange={(e) => setGenerationMode(e.target.value as 'single' | 'conversation')}
              className="text-blue-600"
            />
            <span className="text-gray-800">단일 응답만</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="generationMode"
              value="conversation"
              checked={generationMode === 'conversation'}
              onChange={(e) => setGenerationMode(e.target.value as 'single' | 'conversation')}
              className="text-blue-600"
            />
            <span className="text-gray-800">대화 스레드 포함</span>
          </label>
        </div>
      </div>

      {/* 생성 버튼 */}
      <div className="mb-6">
        <button
          onClick={generateResponse}
          disabled={!selectedMessage || !selectedPersonality || !selectedPowerLevel || isGenerating}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {isGenerating ? '생성 중...' : '응답 생성'}
        </button>
      </div>

      {/* 생성된 응답 메시지 */}
      {responseMessages.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">💬 생성된 응답</h3>
          <div className="space-y-3">
            {responseMessages.map((message) => (
              <div key={message.id} className={`p-4 rounded-lg ${getTypeColor(message.type)}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800">{message.sender}</span>
                    <span className={`px-2 py-1 rounded text-xs ${getStyleColor(message.style)}`}>
                      {message.style}
                    </span>
                    <span className="text-xs text-gray-500">신뢰도: {(message.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <p className="text-gray-700">{message.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 대화 스레드 */}
      {conversationThreads.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">🗣️ 여론 형성 대화</h3>
          <div className="space-y-6">
            {conversationThreads.map((thread) => (
              <div key={thread.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-800">{thread.purpose}</h4>
                  <span className="text-sm text-gray-500">참여자: {thread.participants.join(', ')}</span>
                </div>
                <div className="space-y-2">
                  {thread.messages.map((message) => (
                    <div key={message.id} className={`p-3 rounded-lg ${getTypeColor(message.type)}`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-gray-800">{message.sender}</span>
                        <span className={`px-2 py-1 rounded text-xs ${getStyleColor(message.style)}`}>
                          {message.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{message.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedResponseGenerator;
