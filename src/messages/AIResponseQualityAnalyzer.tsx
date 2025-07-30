import React, { useState, useEffect } from 'react';
import {
  StarIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface QualityMetrics {
  relevance: number;
  accuracy: number;
  empathy: number;
  clarity: number;
  timeliness: number;
  overall: number;
}

interface ResponseAnalysis {
  id: string;
  content: string;
  strategy: string;
  quality: QualityMetrics;
  feedback: string[];
  timestamp: string;
}

interface AIResponseQualityAnalyzerProps {
  isActive: boolean;
}

const AIResponseQualityAnalyzer: React.FC<AIResponseQualityAnalyzerProps> = ({ isActive }) => {
  const [responses, setResponses] = useState<ResponseAnalysis[]>([]);
  const [currentResponse, setCurrentResponse] = useState<ResponseAnalysis | null>(null);
  const [averageQuality, setAverageQuality] = useState<QualityMetrics>({
    relevance: 0,
    accuracy: 0,
    empathy: 0,
    clarity: 0,
    timeliness: 0,
    overall: 0
  });

  useEffect(() => {
    if (isActive) {
      // AI 응답 품질 분석 시뮬레이션
      const interval = setInterval(() => {
        const strategies = ['logical_rebuttal', 'emotional_softening', 'information_provision', 'unity_emphasis'];
        const strategy = strategies[Math.floor(Math.random() * strategies.length)];
        
        const quality: QualityMetrics = {
          relevance: Math.random() * 100,
          accuracy: Math.random() * 100,
          empathy: Math.random() * 100,
          clarity: Math.random() * 100,
          timeliness: Math.random() * 100,
          overall: 0
        };
        
        quality.overall = (quality.relevance + quality.accuracy + quality.empathy + quality.clarity + quality.timeliness) / 5;

        const feedback: string[] = [];
        if (quality.relevance < 70) feedback.push('관련성이 낮습니다');
        if (quality.accuracy < 80) feedback.push('정확성을 개선해야 합니다');
        if (quality.empathy < 60) feedback.push('공감 표현이 부족합니다');
        if (quality.clarity < 75) feedback.push('명확성을 높여야 합니다');
        if (quality.timeliness < 90) feedback.push('응답 속도를 개선해야 합니다');

        const newResponse: ResponseAnalysis = {
          id: Date.now().toString(),
          content: `AI가 생성한 응답 메시지입니다. 전략: ${strategy}`,
          strategy,
          quality,
          feedback,
          timestamp: new Date().toLocaleTimeString()
        };

        setResponses(prev => [newResponse, ...prev].slice(-10));
        setCurrentResponse(newResponse);

        // 평균 품질 업데이트
        const allResponses = [newResponse, ...responses];
        if (allResponses.length > 0) {
          const avg = allResponses.reduce((acc, resp) => ({
            relevance: acc.relevance + resp.quality.relevance,
            accuracy: acc.accuracy + resp.quality.accuracy,
            empathy: acc.empathy + resp.quality.empathy,
            clarity: acc.clarity + resp.quality.clarity,
            timeliness: acc.timeliness + resp.quality.timeliness,
            overall: 0
          }), { relevance: 0, accuracy: 0, empathy: 0, clarity: 0, timeliness: 0, overall: 0 });

          const count = allResponses.length;
          avg.relevance /= count;
          avg.accuracy /= count;
          avg.empathy /= count;
          avg.clarity /= count;
          avg.timeliness /= count;
          avg.overall = (avg.relevance + avg.accuracy + avg.empathy + avg.clarity + avg.timeliness) / 5;

          setAverageQuality(avg);
        }
      }, 8000);

      return () => clearInterval(interval);
    }
  }, [isActive, responses]);

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityIcon = (score: number) => {
    if (score >= 90) return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    if (score >= 80) return <StarIcon className="w-5 h-5 text-blue-500" />;
    if (score >= 70) return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
    return <XCircleIcon className="w-5 h-5 text-red-500" />;
  };

  const getStrategyName = (strategy: string) => {
    switch (strategy) {
      case 'logical_rebuttal': return '논리적 반박';
      case 'emotional_softening': return '감정 완화';
      case 'information_provision': return '정보 제공';
      case 'unity_emphasis': return '단결 강조';
      default: return strategy;
    }
  };

  if (!isActive) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-2 mb-6">
        <ChatBubbleLeftRightIcon className="w-6 h-6 text-indigo-600" />
        <h2 className="text-xl font-semibold text-gray-900">AI 응답 품질 분석</h2>
      </div>

      {/* 현재 응답 분석 */}
      {currentResponse && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                최신 응답 품질
              </h3>
              <p className="text-sm text-gray-500">
                전략: {getStrategyName(currentResponse.strategy)} | 
                시간: {currentResponse.timestamp}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {getQualityIcon(currentResponse.quality.overall)}
              <span className={`text-lg font-bold ${getQualityColor(currentResponse.quality.overall)}`}>
                {currentResponse.quality.overall.toFixed(1)}
              </span>
            </div>
          </div>

          {/* 품질 메트릭스 */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="text-center">
              <div className={`text-lg font-bold ${getQualityColor(currentResponse.quality.relevance)}`}>
                {currentResponse.quality.relevance.toFixed(1)}
              </div>
              <div className="text-xs text-gray-600">관련성</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${getQualityColor(currentResponse.quality.accuracy)}`}>
                {currentResponse.quality.accuracy.toFixed(1)}
              </div>
              <div className="text-xs text-gray-600">정확성</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${getQualityColor(currentResponse.quality.empathy)}`}>
                {currentResponse.quality.empathy.toFixed(1)}
              </div>
              <div className="text-xs text-gray-600">공감</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${getQualityColor(currentResponse.quality.clarity)}`}>
                {currentResponse.quality.clarity.toFixed(1)}
              </div>
              <div className="text-xs text-gray-600">명확성</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${getQualityColor(currentResponse.quality.timeliness)}`}>
                {currentResponse.quality.timeliness.toFixed(1)}
              </div>
              <div className="text-xs text-gray-600">적시성</div>
            </div>
          </div>

          {/* 피드백 */}
          {currentResponse.feedback.length > 0 && (
            <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4">
              <h4 className="font-medium text-yellow-800 mb-2">개선 제안</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {currentResponse.feedback.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 평균 품질 */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">평균 품질 지표</h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="text-center">
            <div className={`text-lg font-bold ${getQualityColor(averageQuality.relevance)}`}>
              {averageQuality.relevance.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600">관련성</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${getQualityColor(averageQuality.accuracy)}`}>
              {averageQuality.accuracy.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600">정확성</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${getQualityColor(averageQuality.empathy)}`}>
              {averageQuality.empathy.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600">공감</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${getQualityColor(averageQuality.clarity)}`}>
              {averageQuality.clarity.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600">명확성</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${getQualityColor(averageQuality.timeliness)}`}>
              {averageQuality.timeliness.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600">적시성</div>
          </div>
        </div>
      </div>

      {/* 최근 응답 목록 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">최근 응답 기록</h3>
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {responses.map((response) => (
            <div key={response.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  {getQualityIcon(response.quality.overall)}
                  <span className="text-sm font-medium text-gray-900">
                    {getStrategyName(response.strategy)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {response.timestamp} | 품질: {response.quality.overall.toFixed(1)}
                </p>
              </div>
              <div className={`text-sm font-bold ${getQualityColor(response.quality.overall)}`}>
                {response.quality.overall.toFixed(1)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIResponseQualityAnalyzer; 