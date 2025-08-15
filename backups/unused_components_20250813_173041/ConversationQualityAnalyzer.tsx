import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  HeartIcon,
  AcademicCapIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { Message } from '../types/conversation';

interface ConversationQualityAnalyzerProps {
  messages: Message[];
  selectedChatRoom: string;
}

interface QualityMetrics {
  engagement: number;
  constructiveness: number;
  responsiveness: number;
  clarity: number;
  overall: number;
}

interface ParticipantEngagement {
  name: string;
  messageCount: number;
  responseTime: number;
  interactionScore: number;
  sentimentScore: number;
}

interface ConversationInsight {
  type: 'positive' | 'negative' | 'neutral';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

const ConversationQualityAnalyzer: React.FC<ConversationQualityAnalyzerProps> = ({
  messages,
  selectedChatRoom
}) => {
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);
  const [participantEngagement, setParticipantEngagement] = useState<ParticipantEngagement[]>([]);
  const [insights, setInsights] = useState<ConversationInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 참여도 계산
  const calculateEngagement = (messages: Message[]): number => {
    if (messages.length === 0) return 0;

    const uniqueParticipants = new Set(messages.map(m => m.sender)).size;
    const totalMessages = messages.length;
    const avgMessagesPerParticipant = totalMessages / uniqueParticipants;

    // 참여도 점수 (0-100)
    const engagementScore = Math.min(100, (avgMessagesPerParticipant / 5) * 100);
    return Math.round(engagementScore);
  };

  // 건설성 계산
  const calculateConstructiveness = (messages: Message[]): number => {
    if (messages.length === 0) return 0;

    const constructiveKeywords = [
      '제안', '해결', '방안', '개선', '협력', '함께', '검토', '논의',
      '의견', '제안', '방법', '대안', '해결책', '개선안', '협의'
    ];

    const destructiveKeywords = [
      '반대', '불가', '취소', '중단', '문제', '실패', '어려움',
      '불만', '항의', '이의', '분쟁', '갈등', '대립'
    ];

    let constructiveCount = 0;
    let destructiveCount = 0;

    messages.forEach(message => {
      if (message.type === 'text' && !message.isDeleted) {
        const content = message.content.toLowerCase();

        constructiveKeywords.forEach(keyword => {
          if (content.includes(keyword)) constructiveCount++;
        });

        destructiveKeywords.forEach(keyword => {
          if (content.includes(keyword)) destructiveCount++;
        });
      }
    });

    const totalRelevant = constructiveCount + destructiveCount;
    if (totalRelevant === 0) return 50; // 중립

    const constructivenessScore = (constructiveCount / totalRelevant) * 100;
    return Math.round(constructivenessScore);
  };

  // 응답성 계산
  const calculateResponsiveness = (messages: Message[]): number => {
    if (messages.length < 2) return 0;

    let totalResponseTime = 0;
    let responseCount = 0;

    for (let i = 1; i < messages.length; i++) {
      const currentMessage = messages[i];
      const previousMessage = messages[i - 1];

      if (currentMessage.sender !== previousMessage.sender) {
        // 간단한 시간 차이 계산 (실제로는 타임스탬프 파싱 필요)
        const timeDiff = 5; // 예시: 5분
        totalResponseTime += timeDiff;
        responseCount++;
      }
    }

    if (responseCount === 0) return 0;

    const avgResponseTime = totalResponseTime / responseCount;
    // 응답성 점수 (빠를수록 높은 점수)
    const responsivenessScore = Math.max(0, 100 - (avgResponseTime * 2));
    return Math.round(responsivenessScore);
  };

  // 명확성 계산
  const calculateClarity = (messages: Message[]): number => {
    if (messages.length === 0) return 0;

    let clearMessages = 0;
    let totalMessages = 0;

    messages.forEach(message => {
      if (message.type === 'text' && !message.isDeleted) {
        totalMessages++;
        const content = message.content;

        // 명확성 판단 기준
        const hasClearStructure = content.length > 10 && content.length < 200;
        const hasSpecificInfo = /[0-9]/.test(content) || /[가-힣]{2,}/.test(content);
        const hasProperEnding = /[.!?]/.test(content) || content.endsWith('니다') || content.endsWith('습니다');

        if (hasClearStructure && hasSpecificInfo && hasProperEnding) {
          clearMessages++;
        }
      }
    });

    if (totalMessages === 0) return 0;

    const clarityScore = (clearMessages / totalMessages) * 100;
    return Math.round(clarityScore);
  };

  // 참여자별 참여도 분석
  const analyzeParticipantEngagement = (messages: Message[]): ParticipantEngagement[] => {
    const participantData: { [key: string]: { messages: Message[]; responseTimes: number[] } } = {};

    messages.forEach(message => {
      if (!participantData[message.sender]) {
        participantData[message.sender] = { messages: [], responseTimes: [] };
      }
      participantData[message.sender].messages.push(message);
    });

    // 응답 시간 계산 (간단한 예시)
    Object.keys(participantData).forEach(participant => {
      const messages = participantData[participant].messages;
      for (let i = 1; i < messages.length; i++) {
        const timeDiff = 5; // 예시
        participantData[participant].responseTimes.push(timeDiff);
      }
    });

    return Object.entries(participantData).map(([name, data]) => {
      const avgResponseTime = data.responseTimes.length > 0
        ? data.responseTimes.reduce((sum, time) => sum + time, 0) / data.responseTimes.length
        : 0;

      const interactionScore = Math.min(100, data.messages.length * 10);
      const sentimentScore = calculateSentimentScore(data.messages);

      return {
        name,
        messageCount: data.messages.length,
        responseTime: Math.round(avgResponseTime),
        interactionScore,
        sentimentScore
      };
    }).sort((a, b) => b.interactionScore - a.interactionScore);
  };

  // 감정 점수 계산
  const calculateSentimentScore = (messages: Message[]): number => {
    const positiveWords = ['좋다', '감사', '훌륭', '최고', '만족', '성공', '진행', '확인', '동의'];
    const negativeWords = ['문제', '불만', '실패', '어려움', '걱정', '반대', '불가', '취소', '중단'];

    let positiveCount = 0;
    let negativeCount = 0;

    messages.forEach(message => {
      if (message.type === 'text' && !message.isDeleted) {
        const content = message.content.toLowerCase();

        positiveWords.forEach(word => {
          if (content.includes(word)) positiveCount++;
        });

        negativeWords.forEach(word => {
          if (content.includes(word)) negativeCount++;
        });
      }
    });

    const total = positiveCount + negativeCount;
    if (total === 0) return 50;

    return Math.round((positiveCount / total) * 100);
  };

  // 인사이트 생성
  const generateInsights = (metrics: QualityMetrics, participants: ParticipantEngagement[]): ConversationInsight[] => {
    const insights: ConversationInsight[] = [];

    // 참여도 인사이트
    if (metrics.engagement > 80) {
      insights.push({
        type: 'positive',
        title: '높은 참여도',
        description: '대화에 적극적으로 참여하고 있어 건설적인 논의가 이루어지고 있습니다.',
        impact: 'high'
      });
    } else if (metrics.engagement < 40) {
      insights.push({
        type: 'negative',
        title: '낮은 참여도',
        description: '참여도가 낮아 활발한 논의가 필요합니다.',
        impact: 'medium'
      });
    }

    // 건설성 인사이트
    if (metrics.constructiveness > 70) {
      insights.push({
        type: 'positive',
        title: '건설적인 대화',
        description: '해결책 중심의 건설적인 논의가 이루어지고 있습니다.',
        impact: 'high'
      });
    } else if (metrics.constructiveness < 30) {
      insights.push({
        type: 'negative',
        title: '갈등 요소 발견',
        description: '부정적인 요소가 많아 중재가 필요할 수 있습니다.',
        impact: 'high'
      });
    }

    // 응답성 인사이트
    if (metrics.responsiveness > 80) {
      insights.push({
        type: 'positive',
        title: '빠른 응답',
        description: '신속한 응답으로 효율적인 소통이 이루어지고 있습니다.',
        impact: 'medium'
      });
    }

    // 참여자 인사이트
    const topParticipant = participants[0];
    if (topParticipant && topParticipant.interactionScore > 80) {
      insights.push({
        type: 'neutral',
        title: '주도적 참여자',
        description: `${topParticipant.name}님이 가장 활발하게 참여하고 있습니다.`,
        impact: 'medium'
      });
    }

    return insights;
  };

  // 분석 실행
  useEffect(() => {
    if (messages.length > 0) {
      setIsAnalyzing(true);

      setTimeout(() => {
        const engagement = calculateEngagement(messages);
        const constructiveness = calculateConstructiveness(messages);
        const responsiveness = calculateResponsiveness(messages);
        const clarity = calculateClarity(messages);
        const overall = Math.round((engagement + constructiveness + responsiveness + clarity) / 4);

        const metrics: QualityMetrics = {
          engagement,
          constructiveness,
          responsiveness,
          clarity,
          overall
        };

        const participants = analyzeParticipantEngagement(messages);
        const insights = generateInsights(metrics, participants);

        setQualityMetrics(metrics);
        setParticipantEngagement(participants);
        setInsights(insights);
        setIsAnalyzing(false);
      }, 1000);
    }
  }, [messages]);

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityLabel = (score: number) => {
    if (score >= 80) return '우수';
    if (score >= 60) return '양호';
    if (score >= 40) return '보통';
    return '개선 필요';
  };

  if (isAnalyzing) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!qualityMetrics) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          <ChartBarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>분석할 대화가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">39</span>
              대화 품질 분석
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <StarIcon className="w-5 h-5 text-yellow-500" />
            <span className={`text-lg font-bold ${getQualityColor(qualityMetrics.overall)}`}>
              {qualityMetrics.overall}점
            </span>
            <span className="text-sm text-gray-500">({getQualityLabel(qualityMetrics.overall)})</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 품질 지표 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <UserGroupIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">참여도</span>
            </div>
            <div className={`text-2xl font-bold ${getQualityColor(qualityMetrics.engagement)}`}>
              {qualityMetrics.engagement}%
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <LightBulbIcon className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">건설성</span>
            </div>
            <div className={`text-2xl font-bold ${getQualityColor(qualityMetrics.constructiveness)}`}>
              {qualityMetrics.constructiveness}%
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <ClockIcon className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">응답성</span>
            </div>
            <div className={`text-2xl font-bold ${getQualityColor(qualityMetrics.responsiveness)}`}>
              {qualityMetrics.responsiveness}%
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AcademicCapIcon className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">명확성</span>
            </div>
            <div className={`text-2xl font-bold ${getQualityColor(qualityMetrics.clarity)}`}>
              {qualityMetrics.clarity}%
            </div>
          </div>
        </div>

        {/* 참여자 분석 */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">참여자 분석</h4>
          <div className="space-y-2">
            {participantEngagement.slice(0, 5).map((participant, index) => (
              <div key={participant.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-900">{index + 1}.</span>
                  <span className="text-sm text-gray-700">{participant.name}</span>
                  <span className="text-xs text-gray-500">({participant.messageCount}개)</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-xs text-gray-500">
                    응답시간: {participant.responseTime}분
                  </div>
                  <div className="flex items-center space-x-1">
                    <ArrowTrendingUpIcon className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-gray-500">{participant.interactionScore}%</span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${participant.sentimentScore > 60 ? 'bg-green-500' :
                    participant.sentimentScore < 40 ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 인사이트 */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">분석 인사이트</h4>
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${insight.type === 'positive' ? 'border-green-500 bg-green-50' :
                  insight.type === 'negative' ? 'border-red-500 bg-red-50' :
                    'border-blue-500 bg-blue-50'
                  }`}
              >
                <div className="flex items-start space-x-2">
                  {insight.type === 'positive' ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5" />
                  ) : insight.type === 'negative' ? (
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mt-0.5" />
                  ) : (
                    <InformationCircleIcon className="w-4 h-4 text-blue-500 mt-0.5" />
                  )}
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">{insight.title}</h5>
                    <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationQualityAnalyzer; 