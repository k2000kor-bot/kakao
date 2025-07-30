import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CpuChipIcon,
  LightBulbIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Message } from '../types/conversation';

interface DeepLearningAnalyzerProps {
  messages: Message[];
  selectedMessage?: Message;
  onAnalysisComplete?: (analysis: any) => void;
}

interface AnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  topics: string[];
  urgency: 'high' | 'medium' | 'low';
  engagement: number;
  keyInsights: string[];
  recommendations: string[];
}

const DeepLearningAnalyzer: React.FC<DeepLearningAnalyzerProps> = ({
  messages,
  selectedMessage
}) => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>({
    sentiment: 'neutral',
    topics: [],
    urgency: 'medium',
    engagement: 0,
    keyInsights: [],
    recommendations: []
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 딥러닝 분석 시뮬레이션
  const performAnalysis = async () => {
    if (!messages.length) return;

    setIsAnalyzing(true);

    // 실제로는 AI 모델을 호출하여 분석
    setTimeout(() => {
      const recentMessages = messages.slice(-20);

      // 감정 분석
      const positiveWords = ['좋다', '감사', '해결', '성공', '만족'];
      const negativeWords = ['문제', '불만', '체불', '어려움', '화남'];

      let positiveCount = 0;
      let negativeCount = 0;

      recentMessages.forEach(message => {
        positiveWords.forEach(word => {
          if (message.content?.includes(word)) positiveCount++;
        });
        negativeWords.forEach(word => {
          if (message.content?.includes(word)) negativeCount++;
        });
      });

      const sentiment = positiveCount > negativeCount ? 'positive' :
        negativeCount > positiveCount ? 'negative' : 'neutral';

      // 주제 추출
      const topicKeywords = ['급여', '체불', '조합', '복지', '안전', '교육', '사업'];
      const topics = topicKeywords.filter(keyword =>
        recentMessages.some(message => message.content?.includes(keyword))
      );

      // 긴급도 분석
      const urgentKeywords = ['긴급', '즉시', '체불', '문제'];
      const hasUrgent = urgentKeywords.some(keyword =>
        recentMessages.some(message => message.content?.includes(keyword))
      );
      const urgency = hasUrgent ? 'high' : recentMessages.length > 10 ? 'medium' : 'low';

      // 참여도 계산
      const uniqueParticipants = new Set(recentMessages.map(m => m.sender)).size;
      const engagement = Math.min(10, uniqueParticipants * 2);

      // 주요 인사이트 생성
      const keyInsights = [];
      if (sentiment === 'negative') {
        keyInsights.push('부정적인 감정이 감지되어 즉각적인 대응이 필요합니다.');
      }
      if (topics.includes('체불')) {
        keyInsights.push('급여 체불 관련 문의가 지속되고 있습니다.');
      }
      if (engagement < 5) {
        keyInsights.push('참여도가 낮아 활발한 소통이 필요합니다.');
      }

      // 추천사항 생성
      const recommendations = [];
      if (sentiment === 'negative') {
        recommendations.push('공감을 표현하고 구체적인 해결책을 제시하세요.');
      }
      if (topics.includes('체불')) {
        recommendations.push('급여 체불 문제에 대한 명확한 일정과 조치사항을 안내하세요.');
      }
      if (engagement < 5) {
        recommendations.push('조합원들의 참여를 유도하는 질문을 던져보세요.');
      }

      setAnalysisResult({
        sentiment,
        topics,
        urgency,
        engagement,
        keyInsights,
        recommendations
      });

      setIsAnalyzing(false);
    }, 2000);
  };

  useEffect(() => {
    if (messages.length > 0) {
      performAnalysis();
    }
  }, [messages]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">21</span>
          <CpuChipIcon className="w-5 h-5 mr-2 text-purple-600" />
          딥러닝 분석
        </h3>
        <button
          onClick={performAnalysis}
          disabled={isAnalyzing}
          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium disabled:opacity-50"
        >
          {isAnalyzing ? (
            <div className="flex items-center">
              <ClockIcon className="w-4 h-4 animate-spin mr-1" />
              분석 중...
            </div>
          ) : (
            '재분석'
          )}
        </button>
      </div>

      {/* 분석 결과 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-2">
            <ChartBarIcon className="w-4 h-4 text-gray-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">감정</span>
          </div>
          <span className={`text-lg font-bold ${getSentimentColor(analysisResult.sentiment)}`}>
            {analysisResult.sentiment === 'positive' ? '긍정' :
              analysisResult.sentiment === 'negative' ? '부정' : '중립'}
          </span>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-gray-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">긴급도</span>
          </div>
          <span className={`text-lg font-bold ${getUrgencyColor(analysisResult.urgency)}`}>
            {analysisResult.urgency === 'high' ? '높음' :
              analysisResult.urgency === 'medium' ? '보통' : '낮음'}
          </span>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-2">
            <CheckCircleIcon className="w-4 h-4 text-gray-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">참여도</span>
          </div>
          <span className="text-lg font-bold text-blue-600">
            {analysisResult.engagement}/10
          </span>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-2">
            <LightBulbIcon className="w-4 h-4 text-gray-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">주제</span>
          </div>
          <span className="text-lg font-bold text-purple-600">
            {analysisResult.topics.length}개
          </span>
        </div>
      </div>

      {/* 주요 인사이트 */}
      {analysisResult.keyInsights.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center">
            <LightBulbIcon className="w-4 h-4 mr-2 text-yellow-600" />
            주요 인사이트
          </h4>
          <div className="space-y-2">
            {analysisResult.keyInsights.map((insight, index) => (
              <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 추천사항 */}
      {analysisResult.recommendations.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center">
            <CheckCircleIcon className="w-4 h-4 mr-2 text-green-600" />
            추천사항
          </h4>
          <div className="space-y-2">
            {analysisResult.recommendations.map((recommendation, index) => (
              <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 주제 태그 */}
      {analysisResult.topics.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm text-gray-700 mb-3">발견된 주제</h4>
          <div className="flex flex-wrap gap-2">
            {analysisResult.topics.map((topic, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {messages.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <CpuChipIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>분석할 메시지가 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default DeepLearningAnalyzer; 