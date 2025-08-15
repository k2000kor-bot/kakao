import React, { useState, useEffect, useCallback } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UserIcon,
  CogIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface PredictionData {
  userActivity: {
    predictedAction: string;
    confidence: number;
    nextActionProbability: number;
    timestamp: string;
  };
  messageQuality: {
    score: number;
    clarity: number;
    relevance: number;
    toneAppropriateness: number;
    suggestions: string[];
    timestamp: string;
  };
  systemPerformance: {
    cpuUsage: number;
    memoryUsage: number;
    responseTime: number;
    throughput: number;
    predictionHorizon: string;
    alerts: string[];
    timestamp: string;
  };
}

interface AnalyticsSummary {
  totalPredictions: number;
  accuracyRate: number;
  activeModels: number;
  lastUpdated: string;
  predictionsByType: {
    userActivity: number;
    messageQuality: number;
    systemPerformance: number;
  };
}

const PredictiveAnalytics: React.FC = () => {
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  // 예측 데이터 가져오기
  const fetchPredictionData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 사용자 활동 예측
      const userActivityResponse = await fetch('/api/v7/predict/user-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'current_user' })
      });

      // 메시지 품질 예측
      const messageQualityResponse = await fetch('/api/v7/predict/message-quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_content: '샘플 메시지' })
      });

      // 시스템 성능 예측
      const systemPerformanceResponse = await fetch('/api/v7/predict/system-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time_horizon: '1h' })
      });

      // 예측 요약
      const summaryResponse = await fetch('/api/v7/predict/summary');

      if (userActivityResponse.ok && messageQualityResponse.ok &&
        systemPerformanceResponse.ok && summaryResponse.ok) {

        const userActivity = await userActivityResponse.json();
        const messageQuality = await messageQualityResponse.json();
        const systemPerformance = await systemPerformanceResponse.json();
        const summaryData = await summaryResponse.json();

        setPredictionData({
          userActivity: userActivity.prediction,
          messageQuality: messageQuality.quality_analysis,
          systemPerformance: systemPerformance.performance_prediction
        });

        setSummary(summaryData.summary);
      } else {
        throw new Error('예측 데이터를 가져오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('예측 데이터 가져오기 오류:', error);
      setError('예측 데이터를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 자동 새로고침 설정
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchPredictionData, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchPredictionData]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchPredictionData();
  }, [fetchPredictionData]);

  // 수동 새로고침
  const handleRefresh = useCallback(() => {
    fetchPredictionData();
  }, [fetchPredictionData]);

  // 자동 새로고침 토글
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
  }, []);

  // 신뢰도에 따른 색상 반환
  const getConfidenceColor = useCallback((confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  }, []);

  // 성능 상태에 따른 색상 반환
  const getPerformanceColor = useCallback((value: number, threshold: number) => {
    if (value <= threshold) return 'text-green-600 dark:text-green-400';
    if (value <= threshold * 1.5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <ChartBarIcon className="w-6 h-6 mr-2" />
          예측 분석 시스템
        </h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              자동 새로고침:
            </label>
            <button
              onClick={toggleAutoRefresh}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoRefresh
                ? 'bg-blue-600'
                : 'bg-gray-200 dark:bg-gray-700'
                }`}
              title={autoRefresh ? '자동 새로고침 비활성화' : '자동 새로고침 활성화'}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoRefresh ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            <ArrowTrendingUpIcon className="w-4 h-4 mr-2" />
            새로고침
          </button>
        </div>
      </div>

      {/* 요약 통계 */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <ChartBarIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {summary.totalPredictions.toLocaleString()}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  총 예측 수
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400 mr-3" />
              <div>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {(summary.accuracyRate * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  정확도
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <CogIcon className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" />
              <div>
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {summary.activeModels}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400">
                  활성 모델
                </div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <ClockIcon className="w-8 h-8 text-orange-600 dark:text-orange-400 mr-3" />
              <div>
                <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {new Date(summary.lastUpdated).toLocaleTimeString()}
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-400">
                  마지막 업데이트
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 예측 데이터 */}
      {predictionData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 사용자 활동 예측 */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <UserIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                사용자 활동 예측
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  예측된 행동
                </div>
                <div className="text-lg font-medium text-gray-900 dark:text-white">
                  {predictionData.userActivity.predictedAction}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  신뢰도
                </div>
                <div className={`text-lg font-medium ${getConfidenceColor(predictionData.userActivity.confidence)}`}>
                  {(predictionData.userActivity.confidence * 100).toFixed(1)}%
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  다음 행동 확률
                </div>
                <div className="text-lg font-medium text-gray-900 dark:text-white">
                  {(predictionData.userActivity.nextActionProbability * 100).toFixed(1)}%
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(predictionData.userActivity.timestamp).toLocaleString()}
              </div>
            </div>
          </div>

          {/* 메시지 품질 예측 */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <ArrowTrendingUpIcon className="w-6 h-6 text-green-600 dark:text-green-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                메시지 품질 예측
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  전체 점수
                </div>
                <div className={`text-lg font-medium ${getConfidenceColor(predictionData.messageQuality.score)}`}>
                  {(predictionData.messageQuality.score * 100).toFixed(1)}%
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">명확성</span>
                  <span className="text-gray-900 dark:text-white">
                    {(predictionData.messageQuality.clarity * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">관련성</span>
                  <span className="text-gray-900 dark:text-white">
                    {(predictionData.messageQuality.relevance * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">톤 적절성</span>
                  <span className="text-gray-900 dark:text-white">
                    {(predictionData.messageQuality.toneAppropriateness * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {predictionData.messageQuality.suggestions.length > 0 && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    개선 제안
                  </div>
                  <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                    {predictionData.messageQuality.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-1">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(predictionData.messageQuality.timestamp).toLocaleString()}
              </div>
            </div>
          </div>

          {/* 시스템 성능 예측 */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <CogIcon className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                시스템 성능 예측
              </h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">CPU 사용률</span>
                  <span className={getPerformanceColor(predictionData.systemPerformance.cpuUsage, 0.7)}>
                    {(predictionData.systemPerformance.cpuUsage * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">메모리 사용률</span>
                  <span className={getPerformanceColor(predictionData.systemPerformance.memoryUsage, 0.8)}>
                    {(predictionData.systemPerformance.memoryUsage * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">응답 시간</span>
                  <span className={getPerformanceColor(predictionData.systemPerformance.responseTime, 200)}>
                    {predictionData.systemPerformance.responseTime}ms
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">처리량</span>
                  <span className="text-gray-900 dark:text-white">
                    {predictionData.systemPerformance.throughput}/sec
                  </span>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  예측 기간
                </div>
                <div className="text-sm text-gray-900 dark:text-white">
                  {predictionData.systemPerformance.predictionHorizon}
                </div>
              </div>

              {predictionData.systemPerformance.alerts.length > 0 && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center">
                    <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500 mr-1" />
                    알림
                  </div>
                  <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                    {predictionData.systemPerformance.alerts.map((alert, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-yellow-500 mr-1">⚠</span>
                        {alert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(predictionData.systemPerformance.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 예측 유형별 통계 */}
      {summary && (
        <div className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            예측 유형별 통계
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {summary.predictionsByType.userActivity}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                사용자 활동 예측
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {summary.predictionsByType.messageQuality}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                메시지 품질 예측
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {summary.predictionsByType.systemPerformance}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                시스템 성능 예측
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            예측 데이터를 가져오는 중...
          </span>
        </div>
      )}

      {/* 오류 메시지 */}
      {error && (
        <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="text-red-800 dark:text-red-200">
            <strong>오류:</strong> {error}
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictiveAnalytics; 