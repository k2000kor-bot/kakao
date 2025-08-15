import React, { useState, useEffect } from 'react';
import CORBULogo from './CORBULogo';

interface AnalyticsData {
  totalMessages: number;
  aiResponses: number;
  userMessages: number;
  averageResponseTime: number;
  popularTopics: string[];
  sentimentScore: number;
  activeUsers: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'error';
}

interface RealTimeAnalyticsProps {
  isVisible: boolean;
  onClose: () => void;
}

const RealTimeAnalytics: React.FC<RealTimeAnalyticsProps> = ({ isVisible, onClose }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalMessages: 1247,
    aiResponses: 892,
    userMessages: 355,
    averageResponseTime: 1.2,
    popularTopics: ['AI 대화', '코드 생성', '데이터 분석', '이미지 생성', '문서 요약'],
    sentimentScore: 0.85,
    activeUsers: 12,
    systemHealth: 'excellent'
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // 실시간 데이터 업데이트 시뮬레이션
      const interval = setInterval(() => {
        setAnalyticsData(prev => ({
          ...prev,
          totalMessages: prev.totalMessages + Math.floor(Math.random() * 3),
          aiResponses: prev.aiResponses + Math.floor(Math.random() * 2),
          userMessages: prev.userMessages + Math.floor(Math.random() * 1),
          activeUsers: Math.max(8, Math.min(20, prev.activeUsers + Math.floor(Math.random() * 3) - 1))
        }));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return '🟢';
      case 'good': return '🔵';
      case 'warning': return '🟡';
      case 'error': return '🔴';
      default: return '⚪';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <CORBULogo size="md" onClick={() => window.location.href = '/'} />
            <div>
              <h2 className="text-xl font-bold text-gray-900">실시간 분석 대시보드</h2>
              <p className="text-sm text-gray-500">시스템 현황 및 통계</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="대시보드 닫기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* 시스템 상태 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">총 메시지</p>
                  <p className="text-3xl font-bold">{analyticsData.totalMessages.toLocaleString()}</p>
                </div>
                <div className="text-3xl">💬</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">AI 응답</p>
                  <p className="text-3xl font-bold">{analyticsData.aiResponses.toLocaleString()}</p>
                </div>
                <div className="text-3xl">🤖</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">사용자 메시지</p>
                  <p className="text-3xl font-bold">{analyticsData.userMessages.toLocaleString()}</p>
                </div>
                <div className="text-3xl">👤</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">평균 응답 시간</p>
                  <p className="text-3xl font-bold">{analyticsData.averageResponseTime}s</p>
                </div>
                <div className="text-3xl">⚡</div>
              </div>
            </div>
          </div>

          {/* 상세 통계 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 시스템 상태 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">시스템 상태</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">시스템 건강도</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(analyticsData.systemHealth)}`}>
                    {getHealthIcon(analyticsData.systemHealth)} {analyticsData.systemHealth}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">활성 사용자</span>
                  <span className="text-lg font-semibold text-blue-600">{analyticsData.activeUsers}명</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">감정 점수</span>
                  <span className="text-lg font-semibold text-green-600">{(analyticsData.sentimentScore * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* 인기 토픽 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">인기 토픽</h3>
              <div className="space-y-3">
                {analyticsData.popularTopics.map((topic, index) => (
                  <div key={topic} className="flex items-center justify-between">
                    <span className="text-gray-600">{topic}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${85 - index * 10}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">{85 - index * 10}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 실시간 활동 */}
          <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">실시간 활동</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">새로운 AI 응답이 생성되었습니다</span>
                <span className="text-xs text-gray-400 ml-auto">방금 전</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">사용자가 이미지 생성 요청</span>
                <span className="text-xs text-gray-400 ml-auto">1분 전</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">코드 분석 완료</span>
                <span className="text-xs text-gray-400 ml-auto">2분 전</span>
              </div>
            </div>
          </div>

          {/* 성능 지표 */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">AI 응답 성공률</h4>
              <div className="flex items-center space-x-3">
                <div className="text-3xl font-bold text-green-600">98.5%</div>
                <div className="text-sm text-green-600">↑ 2.1%</div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">평균 처리 시간</h4>
              <div className="flex items-center space-x-3">
                <div className="text-3xl font-bold text-blue-600">1.2s</div>
                <div className="text-sm text-blue-600">↓ 0.3s</div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">사용자 만족도</h4>
              <div className="flex items-center space-x-3">
                <div className="text-3xl font-bold text-purple-600">4.8/5</div>
                <div className="text-sm text-purple-600">↑ 0.2</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeAnalytics; 