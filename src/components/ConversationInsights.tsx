import React, { useState, useEffect } from 'react';
import {
  StarIcon,
  LightBulbIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FireIcon,
  ClockIcon as ClockIconSolid
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  type?: string;
}

interface ConversationInsightsProps {
  messages: Message[];
  selectedChatRoom: string;
}

interface Insight {
  id: string;
  type: 'pattern' | 'trend' | 'alert' | 'recommendation';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  category: string;
  timestamp: Date;
  data?: any;
  isExpanded?: boolean;
}

interface TrendData {
  period: string;
  value: number;
  change: number;
}

const ConversationInsights: React.FC<ConversationInsightsProps> = ({
  messages,
  selectedChatRoom
}) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [filteredInsights, setFilteredInsights] = useState<Insight[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showExpanded, setShowExpanded] = useState(false);

  // 패턴 분석
  const analyzePatterns = (messages: Message[]): Insight[] => {
    const patterns: Insight[] = [];

    // 시간대별 활동 패턴
    const timePatterns: { [key: string]: number } = {};
    messages.forEach(message => {
      const hour = new Date(message.timestamp).getHours();
      const timeSlot = hour < 6 ? '새벽' : hour < 12 ? '오전' : hour < 18 ? '오후' : '저녁';
      timePatterns[timeSlot] = (timePatterns[timeSlot] || 0) + 1;
    });

    const mostActiveTime = Object.entries(timePatterns).sort((a, b) => b[1] - a[1])[0];
    if (mostActiveTime) {
      patterns.push({
        id: 'time-pattern',
        type: 'pattern',
        title: '활동 시간대 패턴',
        description: `가장 활발한 시간대는 ${mostActiveTime[0]}입니다. (${mostActiveTime[1]}개 메시지)`,
        severity: 'medium',
        category: '시간대',
        timestamp: new Date(),
        data: timePatterns
      });
    }

    // 참여자별 패턴
    const participantPatterns: { [key: string]: number } = {};
    messages.forEach(message => {
      participantPatterns[message.sender] = (participantPatterns[message.sender] || 0) + 1;
    });

    const topParticipant = Object.entries(participantPatterns).sort((a, b) => b[1] - a[1])[0];
    if (topParticipant && topParticipant[1] > messages.length * 0.3) {
      patterns.push({
        id: 'participant-pattern',
        type: 'pattern',
        title: '주도적 참여자',
        description: `${topParticipant[0]}님이 전체 대화의 ${Math.round((topParticipant[1] / messages.length) * 100)}%를 차지합니다.`,
        severity: 'medium',
        category: '참여자',
        timestamp: new Date(),
        data: participantPatterns
      });
    }

    return patterns;
  };

  // 트렌드 분석
  const analyzeTrends = (messages: Message[]): Insight[] => {
    const trends: Insight[] = [];

    // 메시지 길이 트렌드
    const recentMessages = messages.slice(-10);
    const avgLength = recentMessages.reduce((sum, msg) =>
      sum + (msg.type === 'text' ? msg.content.length : 0), 0) / recentMessages.length;

    if (avgLength > 100) {
      trends.push({
        id: 'length-trend',
        type: 'trend',
        title: '상세한 대화 트렌드',
        description: '최근 메시지들이 평균 ${Math.round(avgLength)}자로 상세한 내용을 담고 있습니다.',
        severity: 'low',
        category: '메시지',
        timestamp: new Date(),
        data: { avgLength }
      });
    }

    // 감정 트렌드
    const positiveWords = ['좋다', '감사', '훌륭', '최고', '만족', '성공', '진행', '확인', '동의'];
    const negativeWords = ['문제', '불만', '실패', '어려움', '걱정', '반대', '불가', '취소', '중단'];

    let positiveCount = 0;
    let negativeCount = 0;

    messages.forEach(message => {
      if (message.type === 'text') {
        const content = message.content.toLowerCase();
        positiveWords.forEach(word => { if (content.includes(word)) positiveCount++; });
        negativeWords.forEach(word => { if (content.includes(word)) negativeCount++; });
      }
    });

    const sentimentRatio = positiveCount / (positiveCount + negativeCount);
    if (sentimentRatio > 0.7) {
      trends.push({
        id: 'sentiment-trend',
        type: 'trend',
        title: '긍정적 대화 분위기',
        description: '전체적으로 긍정적인 분위기로 건설적인 논의가 이루어지고 있습니다.',
        severity: 'low',
        category: '감정',
        timestamp: new Date(),
        data: { sentimentRatio }
      });
    } else if (sentimentRatio < 0.3) {
      trends.push({
        id: 'sentiment-trend-negative',
        type: 'trend',
        title: '부정적 대화 분위기',
        description: '부정적인 요소가 많아 중재나 개선이 필요할 수 있습니다.',
        severity: 'high',
        category: '감정',
        timestamp: new Date(),
        data: { sentimentRatio }
      });
    }

    return trends;
  };

  // 알림 분석
  const analyzeAlerts = (messages: Message[]): Insight[] => {
    const alerts: Insight[] = [];

    // 긴급 키워드 감지
    const urgentKeywords = ['긴급', '즉시', '당장', '바로', '중요', '주의', '경고'];
    const urgentMessages = messages.filter(message =>
      message.type === 'text' &&
      urgentKeywords.some(keyword => message.content.includes(keyword))
    );

    if (urgentMessages.length > 0) {
      alerts.push({
        id: 'urgent-alert',
        type: 'alert',
        title: '긴급 키워드 감지',
        description: `${urgentMessages.length}개의 긴급 키워드가 포함된 메시지가 발견되었습니다.`,
        severity: 'high',
        category: '알림',
        timestamp: new Date(),
        data: { urgentMessages }
      });
    }

    // 긴 대화 감지
    if (messages.length > 50) {
      alerts.push({
        id: 'long-conversation',
        type: 'alert',
        title: '긴 대화 세션',
        description: `${messages.length}개의 메시지로 구성된 긴 대화입니다. 요약이 필요할 수 있습니다.`,
        severity: 'medium',
        category: '알림',
        timestamp: new Date(),
        data: { messageCount: messages.length }
      });
    }

    // 참여자 수 감지
    const uniqueParticipants = new Set(messages.map(m => m.sender)).size;
    if (uniqueParticipants > 5) {
      alerts.push({
        id: 'many-participants',
        type: 'alert',
        title: '다수 참여자',
        description: `${uniqueParticipants}명이 참여하는 복잡한 대화입니다. 조율이 필요할 수 있습니다.`,
        severity: 'medium',
        category: '알림',
        timestamp: new Date(),
        data: { participantCount: uniqueParticipants }
      });
    }

    return alerts;
  };

  // 추천사항 생성
  const generateRecommendations = (messages: Message[]): Insight[] => {
    const recommendations: Insight[] = [];

    // 참여도 개선 추천
    const uniqueParticipants = new Set(messages.map(m => m.sender)).size;
    const avgMessagesPerParticipant = messages.length / uniqueParticipants;

    if (avgMessagesPerParticipant < 3) {
      recommendations.push({
        id: 'engagement-recommendation',
        type: 'recommendation',
        title: '참여도 개선 필요',
        description: '참여자당 평균 메시지 수가 낮습니다. 더 활발한 논의를 유도해보세요.',
        severity: 'medium',
        category: '추천',
        timestamp: new Date(),
        data: { avgMessagesPerParticipant }
      });
    }

    // 응답 시간 개선 추천
    const responseTimes: number[] = [];
    for (let i = 1; i < messages.length; i++) {
      if (messages[i].sender !== messages[i - 1].sender) {
        responseTimes.push(5); // 예시 시간
      }
    }

    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    if (avgResponseTime > 10) {
      recommendations.push({
        id: 'response-time-recommendation',
        type: 'recommendation',
        title: '응답 시간 개선',
        description: '평균 응답 시간이 ${avgResponseTime}분으로 다소 느립니다. 신속한 응답을 권장합니다.',
        severity: 'medium',
        category: '추천',
        timestamp: new Date(),
        data: { avgResponseTime }
      });
    }

    return recommendations;
  };

  // 분석 실행
  useEffect(() => {
    if (messages.length > 0) {
      setIsAnalyzing(true);

      setTimeout(() => {
        const patterns = analyzePatterns(messages);
        const trends = analyzeTrends(messages);
        const alerts = analyzeAlerts(messages);
        const recommendations = generateRecommendations(messages);

        const allInsights = [...patterns, ...trends, ...alerts, ...recommendations];
        setInsights(allInsights);
        setFilteredInsights(allInsights);
        setIsAnalyzing(false);
      }, 1000);
    }
  }, [messages]);

  // 카테고리 필터링
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredInsights(insights);
    } else {
      setFilteredInsights(insights.filter(insight => insight.category === selectedCategory));
    }
  }, [selectedCategory, insights]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pattern': return <ChartBarIcon className="w-5 h-5" />;
      case 'trend': return <ClockIcon className="w-5 h-5" />;
      case 'alert': return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'recommendation': return <LightBulbIcon className="w-5 h-5" />;
      default: return <InformationCircleIcon className="w-5 h-5" />;
    }
  };

  const toggleInsightExpansion = (insightId: string) => {
    setInsights(prev => prev.map(insight =>
      insight.id === insightId
        ? { ...insight, isExpanded: !insight.isExpanded }
        : insight
    ));
  };

  const categories = ['all', '시간대', '참여자', '메시지', '감정', '알림', '추천'];

  if (isAnalyzing) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <LightBulbIcon className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">30</span>
              대화 인사이트
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowExpanded(!showExpanded)}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
            >
              {showExpanded ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              <span>{showExpanded ? '간소화' : '상세보기'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* 카테고리 필터 */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {category === 'all' ? '전체' : category}
            </button>
          ))}
        </div>

        {/* 인사이트 목록 */}
        <div className="space-y-3">
          {filteredInsights.map((insight) => (
            <div
              key={insight.id}
              className={`p-4 rounded-lg border ${getSeverityColor(insight.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getTypeIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900">{insight.title}</h4>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${insight.severity === 'high' ? 'bg-red-100 text-red-700' :
                        insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                        {insight.severity === 'high' ? '높음' :
                          insight.severity === 'medium' ? '보통' : '낮음'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{insight.description}</p>

                    {insight.isExpanded && insight.data && (
                      <div className="mt-3 p-3 bg-white rounded border">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">상세 데이터</h5>
                        <pre className="text-xs text-gray-600 overflow-x-auto">
                          {JSON.stringify(insight.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {insight.timestamp.toLocaleTimeString()}
                  </span>
                  <button
                    onClick={() => toggleInsightExpansion(insight.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {insight.isExpanded ?
                      <ChevronUpIcon className="w-4 h-4" /> :
                      <ChevronDownIcon className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredInsights.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <LightBulbIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>분석할 인사이트가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationInsights; 