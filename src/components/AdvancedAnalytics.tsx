import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsData {
  messageCount: number;
  activeUsers: number;
  responseTime: number;
  sentimentScore: number;
  topTopics: Array<{ topic: string; count: number }>;
  hourlyActivity: Array<{ hour: number; count: number }>;
  userEngagement: Array<{ user: string; messages: number }>;
  sentimentDistribution: Array<{ sentiment: string; percentage: number }>;
}

const AdvancedAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // 실제 API 호출로 대체
      const mockData: AnalyticsData = {
        messageCount: 1247,
        activeUsers: 23,
        responseTime: 2.3,
        sentimentScore: 0.75,
        topTopics: [
          { topic: '프로젝트 진행', count: 156 },
          { topic: '일정 조율', count: 134 },
          { topic: '기술 논의', count: 98 },
          { topic: '회의 준비', count: 87 },
          { topic: '리소스 할당', count: 76 }
        ],
        hourlyActivity: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          count: Math.floor(Math.random() * 50) + 10
        })),
        userEngagement: [
          { user: '김철수', messages: 234 },
          { user: '이영희', messages: 198 },
          { user: '박민수', messages: 156 },
          { user: '정수진', messages: 134 },
          { user: '최동욱', messages: 98 }
        ],
        sentimentDistribution: [
          { sentiment: '긍정', percentage: 65 },
          { sentiment: '중립', percentage: 25 },
          { sentiment: '부정', percentage: 10 }
        ]
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('분석 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMetricCard = (title: string, value: string | number, change?: number, unit?: string) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {value}{unit}
          </p>
        </div>
        {change !== undefined && (
          <div className={`text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
            {change > 0 ? '+' : ''}{change}%
          </div>
        )}
      </div>
    </div>
  );

  const hourlyActivityData = {
    labels: analyticsData?.hourlyActivity.map(h => `${h.hour}시`) || [],
    datasets: [{
      label: '메시지 수',
      data: analyticsData?.hourlyActivity.map(h => h.count) || [],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4
    }]
  };

  const topTopicsData = {
    labels: analyticsData?.topTopics.map(t => t.topic) || [],
    datasets: [{
      label: '대화 수',
      data: analyticsData?.topTopics.map(t => t.count) || [],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ]
    }]
  };

  const sentimentData = {
    labels: analyticsData?.sentimentDistribution.map(s => s.sentiment) || [],
    datasets: [{
      data: analyticsData?.sentimentDistribution.map(s => s.percentage) || [],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(156, 163, 175, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ]
    }]
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">고급 분석 대시보드</h2>
          <p className="text-gray-600">실시간 대화 분석 및 인사이트</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1h">최근 1시간</option>
            <option value="24h">최근 24시간</option>
            <option value="7d">최근 7일</option>
            <option value="30d">최근 30일</option>
          </select>
        </div>
      </div>

      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getMetricCard('총 메시지 수', analyticsData?.messageCount || 0, 12)}
        {getMetricCard('활성 사용자', analyticsData?.activeUsers || 0, 8)}
        {getMetricCard('평균 응답 시간', `${analyticsData?.responseTime || 0}`, -5, '초')}
        {getMetricCard('감정 점수', `${Math.round((analyticsData?.sentimentScore || 0) * 100)}`, 15, '%')}
      </div>

      {/* 차트 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 시간별 활동 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">시간별 활동</h3>
          <div className="h-64">
            <Line
              data={hourlyActivityData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </div>

        {/* 인기 토픽 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">인기 토픽</h3>
          <div className="h-64">
            <Bar
              data={topTopicsData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* 추가 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 감정 분포 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">감정 분포</h3>
          <div className="h-64">
            <Doughnut
              data={sentimentData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        </div>

        {/* 사용자 참여도 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">사용자 참여도</h3>
          <div className="space-y-4">
            {analyticsData?.userEngagement.map((user, index) => (
              <div key={user.user} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">{user.user}</span>
                </div>
                <span className="text-gray-600">{user.messages}개 메시지</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 실시간 알림 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">실시간 알림</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-700">
              새로운 사용자가 채팅방에 참여했습니다
            </span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-blue-700">
              긍정적인 감정 점수가 15% 증가했습니다
            </span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-yellow-700">
              평균 응답 시간이 개선되었습니다
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics; 