import React, { useState, useEffect } from 'react';
import {
  StarIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
  ServerIcon,
  WifiIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  CogIcon,
  PlayIcon,
  PauseIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

interface SystemStatus {
  backend: 'online' | 'offline' | 'warning';
  database: 'online' | 'offline' | 'warning';
  aiModels: 'online' | 'offline' | 'warning';
  websocket: 'online' | 'offline' | 'warning';
}

interface SystemMetrics {
  totalMessages: number;
  activeUsers: number;
  sentimentScore: number;
  processingTime: number;
  accuracy: number;
  dailyGrowth: number;
}

const MainDashboard: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    backend: 'online',
    database: 'online',
    aiModels: 'online',
    websocket: 'online'
  });

  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalMessages: 1247,
    activeUsers: 156,
    sentimentScore: 0.78,
    processingTime: 2.3,
    accuracy: 94.2,
    dailyGrowth: 12.5
  });

  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // 실시간 메트릭스 업데이트 시뮬레이션
      setMetrics(prev => ({
        ...prev,
        totalMessages: prev.totalMessages + Math.floor(Math.random() * 5),
        sentimentScore: Math.max(0.1, Math.min(1.0, prev.sentimentScore + (Math.random() - 0.5) * 0.1)),
        processingTime: Math.max(0.5, Math.min(5.0, prev.processingTime + (Math.random() - 0.5) * 0.5))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'offline': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircleIcon className="w-4 h-4" />;
      case 'warning': return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'offline': return <ExclamationTriangleIcon className="w-4 h-4" />;
      default: return <CogIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI 지원 시스템 대시보드</h1>
            <p className="text-gray-600 mt-2">실시간 시스템 현황 및 통계를 확인하세요</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600">
                {isMonitoring ? '실시간 모니터링 중' : '모니터링 중지됨'}
              </span>
            </div>
            <button
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isMonitoring
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                }`}
            >
              {isMonitoring ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* 시스템 상태 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">시스템 상태</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(systemStatus).map(([service, status]) => (
            <div key={service} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {service === 'backend' && <ServerIcon className="w-6 h-6 text-blue-500" />}
                  {service === 'database' && <CpuChipIcon className="w-6 h-6 text-purple-500" />}
                  {service === 'aiModels' && <CogIcon className="w-6 h-6 text-green-500" />}
                  {service === 'websocket' && <WifiIcon className="w-6 h-6 text-orange-500" />}
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{service}</p>
                    <p className="text-sm text-gray-500">서비스 상태</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                  {status === 'online' ? '정상' : status === 'warning' ? '주의' : '오프라인'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 주요 통계 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">주요 통계</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <ChartBarIcon className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">총 분석 건수</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.totalMessages.toLocaleString()}</p>
                </div>
              </div>
              <ArrowTrendingUpIcon className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="text-sm text-gray-600">
              일일 증가율: +{metrics.dailyGrowth}%
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <UserGroupIcon className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">등록된 시공사</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.activeUsers}</p>
                </div>
              </div>
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-sm text-gray-600">
              활성 사용자: {Math.floor(metrics.activeUsers * 0.8)}명
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <ClockIcon className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">평균 분석 시간</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.processingTime.toFixed(1)}초</p>
                </div>
              </div>
              <CogIcon className="w-6 h-6 text-purple-500" />
            </div>
            <div className="text-sm text-gray-600">
              정확도: {metrics.accuracy}%
            </div>
          </div>
        </div>
      </div>

      {/* 감정 분석 및 품질 지표 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">감정 분석 및 품질 지표</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">감정 점수</h3>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>부정적</span>
                  <span>긍정적</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${metrics.sentimentScore * 100}%` }}
                  ></div>
                </div>
                <div className="text-center mt-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {(metrics.sentimentScore * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">시스템 품질</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>AI 모델 정확도</span>
                  <span>{metrics.accuracy}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${metrics.accuracy}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>처리 속도</span>
                  <span>{metrics.processingTime.toFixed(1)}초</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(0, 100 - metrics.processingTime * 20)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">최근 활동</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">스마트시티 복합단지 분석 완료</p>
                  <p className="text-sm text-gray-600">5개 시공사 비교분석 • 정확도 94.2%</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">2분 전</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">아파트 단지 개발 프로젝트 등록</p>
                  <p className="text-sm text-gray-600">신규 프로젝트 등록 • AI 분석 시작</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">1시간 전</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">시공사 데이터베이스 업데이트</p>
                  <p className="text-sm text-gray-600">12개 업체 정보 갱신 • 품질 검증 완료</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">3시간 전</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">AI 모델 재훈련 완료</p>
                  <p className="text-sm text-gray-600">성능 향상 2.3% • 새로운 데이터 반영</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">5시간 전</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
