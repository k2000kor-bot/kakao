import React, { useState, useEffect } from 'react';
import { useBackendAPI } from '../services/backendAPI';
import { useNotifications } from '../context/AppContext';

interface AnalyticsData {
  usage: {
    totalMessages: number;
    totalUsers: number;
    activeUsers: number;
    averageResponseTime: number;
  };
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    networkLatency: number;
    errorRate: number;
  };
  errors: {
    totalErrors: number;
    errorTypes: Array<{ type: string; count: number }>;
    recentErrors: Array<{ timestamp: string; message: string; severity: string }>;
  };
}

interface AnalyticsDashboardProps {
  className?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className = '' }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState<'usage' | 'performance' | 'errors'>('usage');

  const { getAnalytics } = useBackendAPI();
  const { addNotification } = useNotifications();

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod, selectedMetric]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const response = await getAnalytics(selectedMetric, selectedPeriod);
      
      if (response.success && response.data) {
        setAnalyticsData(response.data as AnalyticsData);
      } else {
        // 모의 데이터 (실제 백엔드가 없을 때)
        setAnalyticsData({
          usage: {
            totalMessages: 1247,
            totalUsers: 89,
            activeUsers: 23,
            averageResponseTime: 1.2
          },
          performance: {
            cpuUsage: 45.2,
            memoryUsage: 67.8,
            networkLatency: 120,
            errorRate: 0.5
          },
          errors: {
            totalErrors: 12,
            errorTypes: [
              { type: '네트워크 오류', count: 5 },
              { type: '인증 오류', count: 3 },
              { type: '서버 오류', count: 2 },
              { type: '클라이언트 오류', count: 2 }
            ],
            recentErrors: [
              { timestamp: '2024-01-15 14:30:22', message: '네트워크 연결 실패', severity: 'medium' },
              { timestamp: '2024-01-15 14:25:15', message: '토큰 만료', severity: 'low' },
              { timestamp: '2024-01-15 14:20:08', message: '서버 응답 지연', severity: 'high' }
            ]
          }
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: '분석 데이터 로드 실패',
        message: '분석 데이터를 불러오는데 실패했습니다.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMetricColor = (value: number, threshold: number, type: 'good' | 'bad' = 'good') => {
    if (type === 'good') {
      return value >= threshold ? 'text-green-600' : 'text-red-600';
    } else {
      return value <= threshold ? 'text-green-600' : 'text-red-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className={`analytics-dashboard ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">분석 데이터를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`analytics-dashboard bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">분석 대시보드</h2>
        <div className="flex space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="분석 기간 선택"
          >
            <option value="1d">오늘</option>
            <option value="7d">7일</option>
            <option value="30d">30일</option>
            <option value="90d">90일</option>
          </select>
        </div>
      </div>

      {/* 메트릭 탭 */}
      <div className="flex space-x-1 mb-6">
        {(['usage', 'performance', 'errors'] as const).map((metric) => (
          <button
            key={metric}
            onClick={() => setSelectedMetric(metric)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedMetric === metric
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {metric === 'usage' && '사용량'}
            {metric === 'performance' && '성능'}
            {metric === 'errors' && '오류'}
          </button>
        ))}
      </div>

      {/* 사용량 메트릭 */}
      {selectedMetric === 'usage' && analyticsData?.usage && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 메시지</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.usage.totalMessages.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-green-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 사용자</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.usage.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">활성 사용자</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.usage.activeUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-orange-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">평균 응답 시간</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.usage.averageResponseTime}s</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 성능 메트릭 */}
      {selectedMetric === 'performance' && analyticsData?.performance && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CPU 사용률</p>
                <p className={`text-2xl font-bold ${getMetricColor(analyticsData.performance.cpuUsage, 80, 'bad')}`}>
                  {analyticsData.performance.cpuUsage}%
                </p>
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={analyticsData.performance.cpuUsage > 80 ? '#ef4444' : '#3b82f6'}
                    strokeWidth="2"
                    strokeDasharray={`${analyticsData.performance.cpuUsage}, 100`}
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">메모리 사용률</p>
                <p className={`text-2xl font-bold ${getMetricColor(analyticsData.performance.memoryUsage, 80, 'bad')}`}>
                  {analyticsData.performance.memoryUsage}%
                </p>
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={analyticsData.performance.memoryUsage > 80 ? '#ef4444' : '#10b981'}
                    strokeWidth="2"
                    strokeDasharray={`${analyticsData.performance.memoryUsage}, 100`}
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">네트워크 지연</p>
                <p className={`text-2xl font-bold ${getMetricColor(analyticsData.performance.networkLatency, 200, 'bad')}`}>
                  {analyticsData.performance.networkLatency}ms
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-red-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">오류율</p>
                <p className={`text-2xl font-bold ${getMetricColor(analyticsData.performance.errorRate, 1, 'bad')}`}>
                  {analyticsData.performance.errorRate}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 오류 메트릭 */}
      {selectedMetric === 'errors' && analyticsData?.errors && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 오류 타입 분포 */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">오류 타입 분포</h3>
              <div className="space-y-3">
                {analyticsData.errors.errorTypes.map((errorType, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{errorType.type}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${(errorType.count / analyticsData.errors.totalErrors) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{errorType.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 최근 오류 */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 오류</h3>
              <div className="space-y-3">
                {analyticsData.errors.recentErrors.map((error, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full mt-1 ${getSeverityColor(error.severity)}`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{error.message}</p>
                      <p className="text-xs text-gray-500">{error.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 총 오류 수 */}
          <div className="bg-red-50 p-6 rounded-lg">
            <div className="flex items-center">
              <div className="p-3 bg-red-500 rounded-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 오류 수</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.errors.totalErrors}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard; 