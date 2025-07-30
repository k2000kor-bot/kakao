import React, { useState, useEffect } from 'react';
import {
  StarIcon, 
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  ClockIcon,
  ArrowPathIcon,
  AcademicCapIcon,
  CogIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  HeartIcon,
  ScaleIcon,
  ShieldCheckIcon,
  HandThumbUpIcon,
  HandThumbDownIcon
} from '@heroicons/react/24/outline';

interface MessageSuggestion {
  id: string;
  content: string;
  type: 'response' | 'follow_up' | 'clarification' | 'encouragement' | 'solution';
  confidence: number;
  reasoning: string;
  tone: string;
  length: 'short' | 'medium' | 'long';
  tags: string[];
  isSelected: boolean;
}

interface ConversationContext {
  messages: Array<{
    sender: string;
    content: string;
    timestamp: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
  }>;
  currentTopic: string;
  participants: string[];
  urgency: 'low' | 'medium' | 'high';
  mood: 'positive' | 'negative' | 'neutral' | 'mixed';
}

interface SuggestionFilter {
  type: string[];
  tone: string[];
  length: string[];
  minConfidence: number;
}

const IntelligentMessageSuggester: React.FC = () => {
  const [conversationContext, setConversationContext] = useState<ConversationContext>({
    messages: [],
    currentTopic: '',
    participants: [],
    urgency: 'medium',
    mood: 'neutral'
  });
  const [suggestions, setSuggestions] = useState<MessageSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<MessageSuggestion | null>(null);
  const [filters, setFilters] = useState<SuggestionFilter>({
    type: [],
    tone: [],
    length: [],
    minConfidence: 0.7
  });
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // 샘플 대화 컨텍스트
  const sampleContext: ConversationContext = {
    messages: [
      {
        sender: '김조합원',
        content: '급여 체불 문제가 해결되지 않고 있습니다. 언제까지 기다려야 하나요?',
        timestamp: '2024-01-24T10:30:00Z',
        sentiment: 'negative'
      },
      {
        sender: '이조합원',
        content: '저도 같은 문제입니다. 시공사가 계속 미루고 있어요.',
        timestamp: '2024-01-24T10:32:00Z',
        sentiment: 'negative'
      },
      {
        sender: '박조합원',
        content: '조합에서 도움을 받을 수 있나요?',
        timestamp: '2024-01-24T10:35:00Z',
        sentiment: 'neutral'
      }
    ],
    currentTopic: '급여 체불 문제',
    participants: ['김조합원', '이조합원', '박조합원', '조합장'],
    urgency: 'high',
    mood: 'negative'
  };

  // 샘플 제안 메시지들
  const sampleSuggestions: MessageSuggestion[] = [
    {
      id: '1',
      content: '급여 체불 문제로 고민이 많으시군요. 조합에서 시공사와 긴급 협의를 진행하고 있습니다. 최대한 빠른 시일 내에 해결하도록 하겠습니다. 조금만 더 기다려주세요.',
      type: 'solution',
      confidence: 0.92,
      reasoning: '급여 체불 문제에 대한 구체적인 해결 방안과 진행 상황을 안내하여 조합원들의 불안을 해소',
      tone: '공감적',
      length: 'medium',
      tags: ['급여', '체불', '해결', '협의'],
      isSelected: false
    },
    {
      id: '2',
      content: '조합원 여러분의 어려움을 잘 알고 있습니다. 함께 해결해보겠습니다.',
      type: 'encouragement',
      confidence: 0.88,
      reasoning: '조합원들의 감정에 공감하고 함께 해결하겠다는 의지를 표현',
      tone: '공감적',
      length: 'short',
      tags: ['공감', '지지', '함께'],
      isSelected: false
    },
    {
      id: '3',
      content: '현재 시공사와의 협의 상황을 상세히 안내드리겠습니다. [구체적인 진행 상황과 일정]',
      type: 'clarification',
      confidence: 0.85,
      reasoning: '구체적인 정보 제공으로 투명성을 확보하고 신뢰를 구축',
      tone: '전문적',
      length: 'long',
      tags: ['상황', '안내', '투명성'],
      isSelected: false
    },
    {
      id: '4',
      content: '네, 조합에서 도움을 드리겠습니다. 급여 체불 문제는 우리 모두의 문제입니다.',
      type: 'response',
      confidence: 0.90,
      reasoning: '조합원의 요청에 즉시 응답하고 조합의 역할을 명확히 제시',
      tone: '협력적',
      length: 'short',
      tags: ['도움', '조합', '즉시'],
      isSelected: false
    },
    {
      id: '5',
      content: '다음 주 월요일 오후 2시에 급여 체불 문제 해결을 위한 긴급 회의를 개최하겠습니다. 모든 관련자들이 참석하여 해결책을 찾아보겠습니다.',
      type: 'follow_up',
      confidence: 0.87,
      reasoning: '구체적인 행동 계획을 제시하여 문제 해결에 대한 의지를 보임',
      tone: '결정적',
      length: 'long',
      tags: ['회의', '긴급', '해결책'],
      isSelected: false
    }
  ];

  useEffect(() => {
    setConversationContext(sampleContext);
    setSuggestions(sampleSuggestions);
  }, []);

  useEffect(() => {
    if (conversationContext.messages.length > 0) {
      analyzeConversation();
    }
  }, [conversationContext]);

  const analyzeConversation = async () => {
    setIsAnalyzing(true);
    
    // 대화 분석 시뮬레이션
    setTimeout(() => {
      const analysis = {
        sentiment: conversationContext.mood,
        urgency: conversationContext.urgency,
        keyTopics: ['급여', '체불', '해결'],
        suggestedTone: conversationContext.mood === 'negative' ? '공감적' : '전문적',
        priorityActions: ['즉시 응답', '구체적 해결책 제시', '진행 상황 안내']
      };
      
      setAnalysisResult(analysis);
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleSuggestionSelect = (suggestion: MessageSuggestion) => {
    setSuggestions(prev => prev.map(s => ({
      ...s,
      isSelected: s.id === suggestion.id
    })));
    setSelectedSuggestion(suggestion);
  };

  const handleSuggestionFeedback = (suggestionId: string, feedback: 'positive' | 'negative') => {
    console.log('제안 피드백:', suggestionId, feedback);
    // 피드백 처리 로직
  };

  const handleUseSuggestion = (suggestion: MessageSuggestion) => {
    console.log('제안 사용:', suggestion);
    // 제안 사용 로직
  };

  const handleCustomizeSuggestion = (suggestion: MessageSuggestion) => {
    console.log('제안 커스터마이징:', suggestion);
    // 커스터마이징 로직
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.8) return 'text-blue-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'response': return <ChatBubbleLeftRightIcon className="w-4 h-4" />;
      case 'follow_up': return <ArrowPathIcon className="w-4 h-4" />;
      case 'clarification': return <InformationCircleIcon className="w-4 h-4" />;
      case 'encouragement': return <HeartIcon className="w-4 h-4" />;
      case 'solution': return <CheckCircleIcon className="w-4 h-4" />;
      default: return <LightBulbIcon className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'response': return 'bg-blue-100 text-blue-800';
      case 'follow_up': return 'bg-green-100 text-green-800';
      case 'clarification': return 'bg-purple-100 text-purple-800';
      case 'encouragement': return 'bg-pink-100 text-pink-800';
      case 'solution': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSuggestions = suggestions.filter(suggestion => {
    if (filters.type.length > 0 && !filters.type.includes(suggestion.type)) return false;
    if (filters.tone.length > 0 && !filters.tone.includes(suggestion.tone)) return false;
    if (filters.length.length > 0 && !filters.length.includes(suggestion.length)) return false;
    if (suggestion.confidence < filters.minConfidence) return false;
    return true;
  });

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <LightBulbIcon className="w-6 h-6 mr-2 text-yellow-600" />
          지능형 메시지 제안
        </h2>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <CogIcon className="w-4 h-4" />
          <span>{showAdvanced ? '기본 설정' : '고급 설정'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 대화 컨텍스트 */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-blue-600" />
              대화 컨텍스트
            </h3>

            {/* 분석 결과 */}
            {analysisResult && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AcademicCapIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">AI 분석 결과</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">감정:</span>
                    <span className="font-medium">{analysisResult.sentiment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">긴급도:</span>
                    <span className="font-medium">{analysisResult.urgency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">권장 톤:</span>
                    <span className="font-medium">{analysisResult.suggestedTone}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 대화 내용 */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">최근 메시지</h4>
              {conversationContext.messages.map((message, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{message.sender}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{message.content}</p>
                  {message.sentiment && (
                    <div className="mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        message.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                        message.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {message.sentiment === 'positive' ? '긍정' :
                         message.sentiment === 'negative' ? '부정' : '중립'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 참여자 정보 */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">참여자</h4>
              <div className="flex flex-wrap gap-2">
                {conversationContext.participants.map((participant, index) => (
                  <span
                    key={index}
                    className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    <UserIcon className="w-3 h-3" />
                    <span>{participant}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 메시지 제안 */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {/* 필터 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">필터</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">유형</label>
                  <select
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value ? [e.target.value] : [] }))}
                  >
                    <option value="">전체</option>
                    <option value="response">응답</option>
                    <option value="follow_up">후속</option>
                    <option value="clarification">명확화</option>
                    <option value="encouragement">격려</option>
                    <option value="solution">해결책</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">톤</label>
                  <select
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    onChange={(e) => setFilters(prev => ({ ...prev, tone: e.target.value ? [e.target.value] : [] }))}
                  >
                    <option value="">전체</option>
                    <option value="공감적">공감적</option>
                    <option value="전문적">전문적</option>
                    <option value="협력적">협력적</option>
                    <option value="결정적">결정적</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">길이</label>
                  <select
                    className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    onChange={(e) => setFilters(prev => ({ ...prev, length: e.target.value ? [e.target.value] : [] }))}
                  >
                    <option value="">전체</option>
                    <option value="short">짧음</option>
                    <option value="medium">보통</option>
                    <option value="long">길음</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">최소 신뢰도</label>
                  <input
                    type="range"
                    min="0.5"
                    max="1"
                    step="0.1"
                    value={filters.minConfidence}
                    onChange={(e) => setFilters(prev => ({ ...prev, minConfidence: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">{Math.round(filters.minConfidence * 100)}%</span>
                </div>
              </div>
            </div>

            {/* 제안 목록 */}
            <div className="space-y-3">
              {isAnalyzing ? (
                <div className="text-center py-8">
                  <ArrowPathIcon className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
                  <p className="text-gray-600">대화를 분석하고 있습니다...</p>
                </div>
              ) : (
                filteredSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className={`border rounded-lg p-4 transition-all ${
                      suggestion.isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(suggestion.type)}
                        <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(suggestion.type)}`}>
                          {suggestion.type === 'response' ? '응답' :
                           suggestion.type === 'follow_up' ? '후속' :
                           suggestion.type === 'clarification' ? '명확화' :
                           suggestion.type === 'encouragement' ? '격려' : '해결책'}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{suggestion.tone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                          {Math.round(suggestion.confidence * 100)}%
                        </span>
                        <button
                          onClick={() => handleSuggestionSelect(suggestion)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3">{suggestion.content}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {suggestion.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleSuggestionFeedback(suggestion.id, 'positive')}
                          className="text-green-600 hover:text-green-800"
                        >
                          <HandThumbUpIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSuggestionFeedback(suggestion.id, 'negative')}
                          className="text-red-600 hover:text-red-800"
                        >
                          <HandThumbDownIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUseSuggestion(suggestion)}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                        >
                          사용
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {filteredSuggestions.length === 0 && !isAnalyzing && (
              <div className="text-center py-8 text-gray-500">
                <LightBulbIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>조건에 맞는 제안이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 선택된 제안 상세 */}
      {selectedSuggestion && (
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">선택된 제안</h3>
            <button
              onClick={() => setSelectedSuggestion(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">메시지 내용</h4>
              <div className="bg-white rounded-lg p-3 text-gray-700">
                {selectedSuggestion.content}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">AI 추론</h4>
                <p className="text-sm text-gray-600">{selectedSuggestion.reasoning}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">특성</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">신뢰도:</span>
                    <span className="font-medium">{Math.round(selectedSuggestion.confidence * 100)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">톤:</span>
                    <span className="font-medium">{selectedSuggestion.tone}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">길이:</span>
                    <span className="font-medium">
                      {selectedSuggestion.length === 'short' ? '짧음' :
                       selectedSuggestion.length === 'medium' ? '보통' : '길음'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => handleUseSuggestion(selectedSuggestion)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <CheckCircleIcon className="w-4 h-4" />
                <span>이 제안 사용</span>
              </button>
              <button
                onClick={() => handleCustomizeSuggestion(selectedSuggestion)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <PencilIcon className="w-4 h-4" />
                <span>커스터마이징</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntelligentMessageSuggester; 