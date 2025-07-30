import React, { useState, useEffect } from 'react';
import {
  StarIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface MessageRecommendation {
  id: string;
  content: string;
  type: 'suggestion' | 'response' | 'question' | 'action';
  confidence: number;
  reasoning: string;
  context: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  tags: string[];
}

interface AnalysisContext {
  sentiment: 'positive' | 'negative' | 'neutral';
  topics: string[];
  participants: string[];
  urgency: 'high' | 'medium' | 'low';
  engagement: number;
}

interface IntelligentMessageRecommenderProps {
  messages: any[];
  selectedMessage?: any;
  isActive?: boolean;
}

const IntelligentMessageRecommender: React.FC<IntelligentMessageRecommenderProps> = ({
  messages,
  selectedMessage,
  isActive = false
}) => {
  const [recommendations, setRecommendations] = useState<MessageRecommendation[]>([]);
  const [analysisContext, setAnalysisContext] = useState<AnalysisContext>({
    sentiment: 'neutral',
    topics: [],
    participants: [],
    urgency: 'medium',
    engagement: 0
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<MessageRecommendation | null>(null);
  const [autoMode, setAutoMode] = useState(false);

  // 대화 컨텍스트 분석
  const analyzeConversationContext = async () => {
    if (!messages.length) return;

    setIsAnalyzing(true);
    try {
      // 실제 분석 로직 (현재는 시뮬레이션)
      const recentMessages = messages.slice(-10);
      const topics = extractTopics(recentMessages);
      const sentiment = analyzeSentiment(recentMessages);
      const participants = extractParticipants(recentMessages);
      const urgency = determineUrgency(recentMessages);
      const engagement = calculateEngagement(recentMessages);

      setAnalysisContext({
        sentiment,
        topics,
        participants,
        urgency,
        engagement
      });

      // 컨텍스트 기반 메시지 추천 생성
      generateRecommendations({
        sentiment,
        topics,
        participants,
        urgency,
        engagement
      });

    } catch (error) {
      console.error('대화 컨텍스트 분석 실패:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 주제 추출
  const extractTopics = (messages: any[]): string[] => {
    const topicKeywords = [
      '급여', '체불', '해결', '조합', '복지', '안전', '규정', '협의', '일정',
      '교육', '훈련', '사업', '계약', '조건', '비교', '제안', '입찰'
    ];

    const foundTopics = new Set<string>();
    messages.forEach(message => {
      topicKeywords.forEach(keyword => {
        if (message.content?.includes(keyword)) {
          foundTopics.add(keyword);
        }
      });
    });

    return Array.from(foundTopics);
  };

  // 감정 분석
  const analyzeSentiment = (messages: any[]): 'positive' | 'negative' | 'neutral' => {
    const positiveWords = ['좋다', '감사', '해결', '성공', '만족', '긍정'];
    const negativeWords = ['문제', '불만', '체불', '어려움', '부정', '화남'];

    let positiveCount = 0;
    let negativeCount = 0;

    messages.forEach(message => {
      positiveWords.forEach(word => {
        if (message.content?.includes(word)) positiveCount++;
      });
      negativeWords.forEach(word => {
        if (message.content?.includes(word)) negativeCount++;
      });
    });

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  };

  // 참여자 추출
  const extractParticipants = (messages: any[]): string[] => {
    const participants = new Set<string>();
    messages.forEach(message => {
      if (message.author) {
        participants.add(message.author);
      }
    });
    return Array.from(participants);
  };

  // 긴급도 판단
  const determineUrgency = (messages: any[]): 'high' | 'medium' | 'low' => {
    const urgentKeywords = ['긴급', '즉시', '당장', '체불', '문제'];
    const hasUrgent = urgentKeywords.some(keyword =>
      messages.some(message => message.content?.includes(keyword))
    );

    if (hasUrgent) return 'high';
    if (messages.length > 5) return 'medium';
    return 'low';
  };

  // 참여도 계산
  const calculateEngagement = (messages: any[]): number => {
    if (messages.length === 0) return 0;
    const recentMessages = messages.slice(-5);
    const responseCount = recentMessages.length;
    const uniqueParticipants = new Set(recentMessages.map(m => m.author)).size;

    return Math.min(10, (responseCount * uniqueParticipants * 10));
  };

  // 메시지 추천 생성
  const generateRecommendations = (context: AnalysisContext) => {
    const newRecommendations: MessageRecommendation[] = [];

    // 감정 기반 추천
    if (context.sentiment === 'negative') {
      newRecommendations.push({
        id: Date.now().toString(),
        content: '현재 상황에 대해 공감을 표현하고 해결책을 제시하는 메시지를 작성해보세요.',
        type: 'suggestion',
        confidence: 0.85,
        reasoning: '부정적인 감정이 감지되어 공감과 해결책이 필요합니다.',
        context: '감정 기반',
        priority: 'high',
        timestamp: new Date().toLocaleTimeString(),
        tags: ['공감', '해결책', '부정적 감정']
      });
    }

    // 주제 기반 추천
    if (context.topics.includes('체불')) {
      newRecommendations.push({
        id: (Date.now() + 1).toString(),
        content: '급여 체불 문제에 대해 구체적인 해결 일정과 조치사항을 안내하는 메시지를 작성하세요.',
        type: 'action',
        confidence: 0.9,
        reasoning: '급여 체불 관련 문의가 지속되고 있어 구체적인 해결 방안이 필요합니다.',
        context: '주제 기반',
        priority: 'high',
        timestamp: new Date().toLocaleTimeString(),
        tags: ['급여', '체불', '해결방안']
      });
    }

    // 참여도 기반 추천
    if (context.engagement < 50) {
      newRecommendations.push({
        id: (Date.now() + 2).toString(),
        content: '조합원들의 참여를 유도하는 질문이나 토론 주제를 제시하는 메시지를 작성해보세요.',
        type: 'question',
        confidence: 0.75,
        reasoning: '참여도가 낮아 활발한 대화를 유도하는 것이 필요합니다.',
        context: '참여도 기반',
        priority: 'medium',
        timestamp: new Date().toLocaleTimeString(),
        tags: ['참여 유도', '질문', '토론']
      });
    }

    // 긴급도 기반 추천
    if (context.urgency === 'high') {
      newRecommendations.push({
        id: (Date.now() + 3).toString(),
        content: '긴급한 상황에 대한 즉각적인 대응과 다음 단계를 안내하는 메시지를 작성하세요.',
        type: 'response',
        confidence: 0.95,
        reasoning: '긴급한 상황이 감지되어 즉각적인 대응이 필요합니다.',
        context: '긴급도 기반',
        priority: 'high',
        timestamp: new Date().toLocaleTimeString(),
        tags: ['긴급', '즉시 대응', '안내']
      });
    }

    setRecommendations(prev => [...newRecommendations, ...prev].slice(-10));
  };

  // 자동 분석 모드
  useEffect(() => {
    if (!autoMode || !isActive || !messages.length) return;

    const interval = setInterval(() => {
      analyzeConversationContext();
    }, 15000); // 15초마다 분석

    return () => clearInterval(interval);
  }, [autoMode, isActive, messages]);

  // 수동 분석
  useEffect(() => {
    if (messages.length > 0 && isActive) {
      analyzeConversationContext();
    }
  }, [messages, isActive]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'suggestion': return <LightBulbIcon className="w-4 h-4" />;
      case 'response': return <ChatBubbleLeftRightIcon className="w-4 h-4" />;
      case 'question': return <StarIcon className="w-4 h-4" />;
      case 'action': return <CheckCircleIcon className="w-4 h-4" />;
      default: return <StarIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="bg-cyan-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">25</span>
          <StarIcon className="w-5 h-5 mr-2 text-blue-600" />
          지능형 메시지 추천
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoMode(!autoMode)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${autoMode
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
              }`}
          >
            {autoMode ? '자동 모드' : '수동 모드'}
          </button>
          <button
            onClick={analyzeConversationContext}
            disabled={isAnalyzing}
            className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium disabled:opacity-50"
          >
            {isAnalyzing ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
            ) : (
              '분석'
            )}
          </button>
        </div>
      </div>

      {/* 분석 컨텍스트 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-sm text-gray-700 mb-2">분석 결과</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">감정:</span>
            <span className={`ml-1 font-medium ${analysisContext.sentiment === 'positive' ? 'text-green-600' :
                analysisContext.sentiment === 'negative' ? 'text-red-600' : 'text-gray-600'
              }`}>
              {analysisContext.sentiment === 'positive' ? '긍정' :
                analysisContext.sentiment === 'negative' ? '부정' : '중립'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">긴급도:</span>
            <span className={`ml-1 font-medium ${getPriorityColor(analysisContext.urgency)}`}>
              {analysisContext.urgency === 'high' ? '높음' :
                analysisContext.urgency === 'medium' ? '보통' : '낮음'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">참여도:</span>
            <span className="ml-1 font-medium text-blue-600">
              {analysisContext.engagement}/10
            </span>
          </div>
          <div>
            <span className="text-gray-500">주제:</span>
            <span className="ml-1 font-medium text-purple-600">
              {analysisContext.topics.length}개
            </span>
          </div>
        </div>
      </div>

      {/* 추천 메시지 목록 */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-gray-700 mb-3">추천 메시지</h4>
        {recommendations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <StarIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>메시지를 분석하여 추천을 생성합니다.</p>
          </div>
        ) : (
          recommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedRecommendation?.id === recommendation.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
                }`}
              onClick={() => setSelectedRecommendation(recommendation)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(recommendation.type)}
                  <span className="text-sm font-medium text-gray-700">
                    {recommendation.type === 'suggestion' ? '제안' :
                      recommendation.type === 'response' ? '응답' :
                        recommendation.type === 'question' ? '질문' : '행동'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
                    {recommendation.priority === 'high' ? '높음' :
                      recommendation.priority === 'medium' ? '보통' : '낮음'}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {recommendation.timestamp}
                </span>
              </div>

              <p className="text-sm text-gray-800 mb-2">
                {recommendation.content}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center space-x-1">
                  <span>신뢰도: {Math.round(recommendation.confidence * 100)}%</span>
                </div>
                <div className="flex space-x-1">
                  {recommendation.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 선택된 추천 상세 정보 */}
      {selectedRecommendation && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-sm text-gray-700 mb-2">추천 근거</h4>
          <p className="text-sm text-gray-800 mb-2">
            {selectedRecommendation.reasoning}
          </p>
          <div className="text-xs text-gray-600">
            <span>컨텍스트: {selectedRecommendation.context}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntelligentMessageRecommender; 