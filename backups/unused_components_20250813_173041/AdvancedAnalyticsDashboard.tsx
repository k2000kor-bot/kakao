import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ChartPieIcon,
  ChartBarSquareIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  unit: string;
  trend: number[];
  category: 'performance' | 'engagement' | 'conversion' | 'technical';
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    fill?: boolean;
  }[];
}

interface AnalyticsFilter {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  category: string;
  groupBy: 'hour' | 'day' | 'week' | 'month';
}

interface AdvancedAnalyticsDashboardProps {
  onMetricClick?: (metric: AnalyticsMetric) => void;
}

const AdvancedAnalyticsDashboard: React.FC<AdvancedAnalyticsDashboardProps> = ({
  onMetricClick
}) => {
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [chartData, setChartData] = useState<ChartData>({ labels: [], datasets: [] });
  const [filter, setFilter] = useState<AnalyticsFilter>({
    period: 'month',
    category: 'all',
    groupBy: 'day'
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'engagement' | 'conversion'>('overview');
  const [isLoading, setIsLoading] = useState(false);

  // 시뮬레이션된 분석 데이터
  useEffect(() => {
    const mockMetrics: AnalyticsMetric[] = [
      {
        id: '1',
        name: '총 사용자',
        value: 15420,
        change: 12.5,
        changeType: 'increase',
        unit: '명',
        trend: [12000, 12500, 13200, 14100, 15420],
        category: 'engagement'
      },
      {
        id: '2',
        name: '활성 세션',
        value: 8920,
        change: -3.2,
        changeType: 'decrease',
        unit: '개',
        trend: [9200, 9100, 8950, 8900, 8920],
        category: 'performance'
      },
      {
        id: '3',
        name: '전환율',
        value: 23.4,
        change: 8.7,
        changeType: 'increase',
        unit: '%',
        trend: [18.5, 19.2, 20.1, 22.0, 23.4],
        category: 'conversion'
      },
      {
        id: '4',
        name: '평균 응답시간',
        value: 245,
        change: -15.3,
        changeType: 'decrease',
        unit: 'ms',
        trend: [320, 310, 290, 260, 245],
        category: 'technical'
      },
      {
        id: '5',
        name: '총 대화 수',
        value: 45680,
        change: 18.9,
        changeType: 'increase',
        unit: '개',
        trend: [35000, 38000, 41000, 43000, 45680],
        category: 'engagement'
      },
      {
        id: '6',
        name: 'AI 정확도',
        value: 94.2,
        change: 2.1,
        changeType: 'increase',
        unit: '%',
        trend: [89.5, 90.8, 92.1, 93.5, 94.2],
        category: 'performance'
      }
    ];

    setMetrics(mockMetrics);

    // 차트 데이터 설정
    const mockChartData: ChartData = {
      labels: ['1주', '2주', '3주', '4주', '현재'],
      datasets: [
        {
          label: '사용자 수',
          data: [12000, 12500, 13200, 14100, 15420],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true
        },
        {
          label: '활성 세션',
          data: [9200, 9100, 8950, 8900, 8920],
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true
        },
        {
          label: '전환율',
          data: [18.5, 19.2, 20.1, 22.0, 23.4],
          borderColor: 'rgb(245, 158, 11)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          fill: true
        }
      ]
    };

    setChartData(mockChartData);
  }, []);

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <ArrowUpIcon className="w-4 h-4 text-green-500" />;
      case 'decrease':
        return <ArrowDownIcon className="w-4 h-4 text-red-500" />;
      default:
        return <MinusIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'performance':
        return 'bg-blue-50 text-blue-600';
      case 'engagement':
        return 'bg-green-50 text-green-600';
      case 'conversion':
        return 'bg-yellow-50 text-yellow-600';
      case 'technical':
        return 'bg-purple-50 text-purple-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M ${unit}`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K ${unit}`;
    }
    return `${value.toLocaleString()} ${unit}`;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.slice(0, 6).map((metric) => (
          <div
            key={metric.id}
            onClick={() => onMetricClick?.(metric)}
            className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{metric.name}</span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(metric.category)}`}>
                {metric.category === 'performance' ? '성능' : 
                 metric.category === 'engagement' ? '참여' : 
                 metric.category === 'conversion' ? '전환' : '기술'}
              </span>
            </div>
            
            <div className="flex items-end space-x-2">
              <span className="text-2xl font-bold text-gray-900">
                {formatValue(metric.value, metric.unit)}
              </span>
              <div className={`flex items-center space-x-1 text-sm ${getChangeColor(metric.changeType)}`}>
                {getChangeIcon(metric.changeType)}
                <span>{Math.abs(metric.change)}%</span>
              </div>
            </div>
            
            <div className="mt-3 h-8 flex items-end space-x-1">
              {metric.trend.map((value, index) => (
                <div
                  key={index}
                  className="flex-1 bg-gray-200 rounded-sm"
                  style={{
                    height: `${(value / Math.max(...metric.trend)) * 100}%`,
                    backgroundColor: index === metric.trend.length - 1 ? '#3B82F6' : '#E5E7EB'
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 트렌드 차트 */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">주요 지표 트렌드</h3>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
              내보내기
            </button>
          </div>
        </div>
        
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">트렌드 차트가 여기에 표시됩니다</p>
            <p className="text-sm text-gray-400">Chart.js 또는 Recharts를 사용하여 구현</p>
          </div>
        </div>
      </div>

      {/* 카테고리별 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">성능 지표</h3>
          <div className="space-y-3">
            {metrics.filter(m => m.category === 'performance').map((metric) => (
              <div key={metric.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{metric.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{formatValue(metric.value, metric.unit)}</span>
                  <div className={`flex items-center space-x-1 text-xs ${getChangeColor(metric.changeType)}`}>
                    {getChangeIcon(metric.changeType)}
                    <span>{Math.abs(metric.change)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">참여 지표</h3>
          <div className="space-y-3">
            {metrics.filter(m => m.category === 'engagement').map((metric) => (
              <div key={metric.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{metric.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{formatValue(metric.value, metric.unit)}</span>
                  <div className={`flex items-center space-x-1 text-xs ${getChangeColor(metric.changeType)}`}>
                    {getChangeIcon(metric.changeType)}
                    <span>{Math.abs(metric.change)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">성능 분석</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <ClockIcon className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">평균 응답시간</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">245ms</p>
            <p className="text-sm text-blue-700">이전 대비 15.3% 개선</p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">처리량</span>
            </div>
            <p className="text-2xl font-bold text-green-900">1,250 req/s</p>
            <p className="text-sm text-green-700">이전 대비 8.7% 증가</p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CogIcon className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-900">가용성</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">99.9%</p>
            <p className="text-sm text-purple-700">지난 30일간</p>
          </div>
        </div>

        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <ChartBarSquareIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">성능 차트가 여기에 표시됩니다</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEngagement = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">사용자 참여 분석</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">사용자 활동</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">일일 활성 사용자</span>
                <span className="font-medium">8,920명</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">주간 활성 사용자</span>
                <span className="font-medium">12,450명</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">월간 활성 사용자</span>
                <span className="font-medium">15,420명</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">평균 세션 시간</span>
                <span className="font-medium">12분 34초</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">대화 활동</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">총 대화 수</span>
                <span className="font-medium">45,680개</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">평균 대화 길이</span>
                <span className="font-medium">8.5턴</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">완료율</span>
                <span className="font-medium">87.3%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">재방문율</span>
                <span className="font-medium">64.2%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">참여도 차트가 여기에 표시됩니다</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConversion = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">전환 분석</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-900">23.4%</p>
            <p className="text-sm text-yellow-700">전체 전환율</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-900">67.8%</p>
            <p className="text-sm text-green-700">목표 달성율</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-900">12.3</p>
            <p className="text-sm text-blue-700">평균 전환 시간(분)</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-900">3.2</p>
            <p className="text-sm text-purple-700">평균 터치포인트</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">전환 퍼널</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">방문자</span>
                <span className="font-medium">15,420명</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">대화 시작</span>
                <span className="font-medium">12,890명 (83.6%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">목표 달성</span>
                <span className="font-medium">3,608명 (23.4%)</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">전환 드라이버</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">AI 응답 품질</span>
                <span className="font-medium">+15.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">사용자 경험</span>
                <span className="font-medium">+8.7%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">페이지 로딩 속도</span>
                <span className="font-medium">+12.3%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">모바일 최적화</span>
                <span className="font-medium">+6.8%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <ArrowTrendingUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">전환 차트가 여기에 표시됩니다</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="w-6 h-6 text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">고급 분석 대시보드</h3>
              <p className="text-sm text-gray-500">실시간 데이터 분석 및 인사이트</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={filter.period}
              onChange={(e) => setFilter(prev => ({ ...prev, period: e.target.value as any }))}
              className="px-3 py-1 text-sm border rounded-lg"
            >
              <option value="day">오늘</option>
              <option value="week">이번 주</option>
              <option value="month">이번 달</option>
              <option value="quarter">이번 분기</option>
              <option value="year">올해</option>
            </select>
            <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200" title="설정">
              <CogIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b">
        <nav className="flex space-x-8 px-4">
          {[
            { id: 'overview', name: '개요', icon: ChartBarIcon },
            { id: 'performance', name: '성능', icon: ArrowTrendingUpIcon },
            { id: 'engagement', name: '참여', icon: UserGroupIcon },
            { id: 'conversion', name: '전환', icon: ArrowTrendingUpIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'performance' && renderPerformance()}
        {activeTab === 'engagement' && renderEngagement()}
        {activeTab === 'conversion' && renderConversion()}
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard; 