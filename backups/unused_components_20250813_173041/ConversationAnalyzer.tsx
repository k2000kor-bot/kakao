import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
  StarIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  HeartIcon,
  LightBulbIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { Message } from '../types/conversation';

interface ConversationAnalyzerProps {
  messages: Message[];
  selectedPeriod: string;
  onAnalysisComplete?: (analysis: any) => void;
}

const ConversationAnalyzer: React.FC<ConversationAnalyzerProps> = ({
  messages,
  selectedPeriod
}) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 대화 분석 함수
  const analyzeConversation = (messages: Message[]) => {
    if (!messages.length) return null;

    const analysis = {
      // 기본 통계
      totalMessages: messages.length,
      uniqueParticipants: new Set(messages.map(m => m.sender)).size,
      dateRange: {
        start: null as Date | null,
        end: null as Date | null
      },

      // 참여자 분석
      topParticipants: [] as { sender: string; count: number; percentage: number }[],
      participantActivity: {} as Record<string, number>,

      // 시간대 분석
      hourlyActivity: {} as Record<number, number>,
      dailyActivity: {} as Record<string, number>,

      // 키워드 및 주제 분석
      keywords: [] as string[],
      sentiment: 'neutral' as string,
      mainTopics: [] as string[],

      // 대화 품질 지표
      averageMessageLength: 0,
      responseTime: 0,
      engagementScore: 0
    };

    // 날짜 범위 계산
    const timestamps = messages.map(m => new Date(m.timestamp)).filter(d => !isNaN(d.getTime()));
    if (timestamps.length > 0) {
      analysis.dateRange.start = new Date(Math.min(...timestamps.map(d => d.getTime())));
      analysis.dateRange.end = new Date(Math.max(...timestamps.map(d => d.getTime())));
    }

    // 참여자별 메시지 수 계산
    const participantCounts: Record<string, number> = {};
    messages.forEach(m => {
      participantCounts[m.sender] = (participantCounts[m.sender] || 0) + 1;
    });

    analysis.topParticipants = Object.entries(participantCounts)
      .map(([sender, count]) => ({
        sender,
        count,
        percentage: Math.round((count / messages.length) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 시간대별 활동 분석
    messages.forEach(m => {
      const date = new Date(m.timestamp);
      const hour = date.getHours();
      const day = date.toLocaleDateString('ko-KR');

      analysis.hourlyActivity[hour] = (analysis.hourlyActivity[hour] || 0) + 1;
      analysis.dailyActivity[day] = (analysis.dailyActivity[day] || 0) + 1;
    });

    // 키워드 및 주제 추출
    const content = messages.map(m => m.content).join(' ');
    const commonKeywords = [
      '조합', '아파트', '건설', '협의', '회의', '안건', '투표', '결의',
      '환급', '분양', '시공사', '대우', '삼성', '건설사', '조합원',
      '회의록', '공지', '안내', '문의', '확인', '검토', '검토'
    ];
    analysis.keywords = commonKeywords.filter(word => content.includes(word));

    // 감정 분석 (간단한 키워드 기반)
    const positiveWords = ['좋다', '만족', '동의', '찬성', '성공', '감사', '좋은', '훌륭'];
    const negativeWords = ['문제', '불만', '반대', '우려', '실패', '어려움', '불편', '부족'];

    const positiveCount = positiveWords.filter(word => content.includes(word)).length;
    const negativeCount = negativeWords.filter(word => content.includes(word)).length;

    if (positiveCount > negativeCount) analysis.sentiment = 'positive';
    else if (negativeCount > positiveCount) analysis.sentiment = 'negative';
    else analysis.sentiment = 'neutral';

    // 메시지 길이 분석
    const totalLength = messages.reduce((sum, m) => sum + m.content.length, 0);
    analysis.averageMessageLength = Math.round(totalLength / messages.length);

    // 참여도 점수 계산
    const uniqueParticipants = new Set(messages.map(m => m.sender)).size;
    analysis.engagementScore = Math.round((uniqueParticipants / messages.length) * 100);

    return analysis;
  };

  useEffect(() => {
    if (messages.length > 0) {
      setIsAnalyzing(true);

      // 분석 시뮬레이션
      setTimeout(() => {
        const result = analyzeConversation(messages);
        setAnalysis(result);
        setIsAnalyzing(false);
      }, 1000);
    } else {
      setAnalysis(null);
    }
  }, [messages, selectedPeriod]);

  if (!analysis) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-left flex items-center">
          <span className="bg-teal-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">23</span>
          <ChartBarIcon className="w-5 h-5 mr-2 text-blue-600" />
          대화 분석
        </h3>
        <div className="text-center py-8 text-gray-500">
          <ChartBarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>분석할 메시지가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {isAnalyzing && (
        <div className="mb-4 flex items-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-blue-600">분석 중...</span>
        </div>
      )}

      <div className="space-y-4">
        {/* 기본 통계 */}
        <div className="space-y-3">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <DocumentTextIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-xs text-blue-700 whitespace-nowrap">총 메시지</span>
            </div>
            <p className="text-lg font-bold text-blue-900">{analysis.totalMessages}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <UserGroupIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-xs text-green-700 whitespace-nowrap">참여자</span>
            </div>
            <p className="text-lg font-bold text-green-900">{analysis.uniqueParticipants}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <StarIcon className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span className="text-xs text-purple-700 whitespace-nowrap">평균 길이</span>
            </div>
            <p className="text-lg font-bold text-purple-900">{analysis.averageMessageLength}자</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <ArrowTrendingUpIcon className="w-4 h-4 text-orange-600 flex-shrink-0" />
              <span className="text-xs text-orange-700 whitespace-nowrap">참여도</span>
            </div>
            <p className="text-lg font-bold text-orange-900">{analysis.engagementScore}%</p>
          </div>
        </div>

        {/* 감정 분석 */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
            <HeartIcon className="w-4 h-4 mr-1 text-red-500 flex-shrink-0" />
            <span className="whitespace-nowrap">감정 분석</span>
          </h4>
          <div className="flex items-center space-x-2">
            <div className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${analysis.sentiment === 'positive'
              ? 'bg-green-100 text-green-700'
              : analysis.sentiment === 'negative'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700'
              }`}>
              {analysis.sentiment === 'positive' ? '긍정적' :
                analysis.sentiment === 'negative' ? '부정적' : '중립'}
            </div>
            <span className="text-xs text-gray-600 whitespace-nowrap">
              {analysis.keywords.length}개 키워드 감지
            </span>
          </div>
        </div>

        {/* 주요 참여자 */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
            <UserGroupIcon className="w-4 h-4 mr-1 text-blue-500 flex-shrink-0" />
            <span className="whitespace-nowrap">주요 참여자 (상위 5명)</span>
          </h4>
          <div className="space-y-2">
            {analysis.topParticipants.slice(0, 5).map((participant: any, index: number) => (
              <div key={participant.sender} className="flex items-center justify-between">
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="text-xs text-gray-500 flex-shrink-0">#{index + 1}</span>
                  <span className="text-sm font-medium text-gray-900 truncate">{participant.sender}</span>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className="text-xs text-gray-600 whitespace-nowrap">{participant.count}개</span>
                  <span className="text-xs text-blue-600 whitespace-nowrap">({participant.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 키워드 분석 */}
        {analysis.keywords.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
              <LightBulbIcon className="w-4 h-4 mr-1 text-yellow-500 flex-shrink-0" />
              <span className="whitespace-nowrap">주요 키워드</span>
            </h4>
            <div className="flex flex-wrap gap-1">
              {analysis.keywords.map((keyword: string) => (
                <span
                  key={keyword}
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full whitespace-nowrap"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 날짜 범위 */}
        {analysis.dateRange.start && analysis.dateRange.end && (
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1 text-purple-500 flex-shrink-0" />
              <span className="whitespace-nowrap">분석 기간</span>
            </h4>
            <div className="text-xs text-gray-600 whitespace-nowrap">
              {analysis.dateRange.start.toLocaleDateString('ko-KR')} ~ {analysis.dateRange.end.toLocaleDateString('ko-KR')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationAnalyzer; 