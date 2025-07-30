import React, { useState, useEffect } from 'react';
import {
  StarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  CalendarIcon,
  CogIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

interface ProjectAnalyticsProps {
  projectId?: string;
  documents?: any[];
  guidelines?: any[];
  messages?: any[];
}

interface AnalyticsData {
  totalDocuments: number;
  totalGuidelines: number;
  totalMessages: number;
  averageResponseTime: number;
  satisfactionScore: number;
  topCategories: Array<{ name: string; count: number }>;
  recentActivity: Array<{ type: string; description: string; timestamp: Date }>;
  trends: Array<{ period: string; value: number; change: number }>;
}

const ProjectAnalytics: React.FC<ProjectAnalyticsProps> = ({
  projectId,
  documents = [],
  guidelines = [],
  messages = []
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalDocuments: 0,
    totalGuidelines: 0,
    totalMessages: 0,
    averageResponseTime: 0,
    satisfactionScore: 0,
    topCategories: [],
    recentActivity: [],
    trends: []
  });
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, [projectId, selectedPeriod]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);

    // 샘플 데이터 생성
    const sampleData: AnalyticsData = {
      totalDocuments: documents.length,
      totalGuidelines: guidelines.length,
      totalMessages: messages.length,
      averageResponseTime: 2.3,
      satisfactionScore: 4.2,
      topCategories: [
        { name: '안전', count: 15 },
        { name: '시공', count: 12 },
        { name: '일정', count: 8 },
        { name: '품질', count: 6 },
        { name: '기타', count: 4 }
      ],
      recentActivity: [
        {
          type: 'document_upload',
          description: '새 문서 업로드: 안전 지침서.pdf',
          timestamp: new Date(Date.now() - 1000 * 60 * 30)
        },
        {
          type: 'guideline_created',
          description: '새 지침 생성: 응급 상황 대응 절차',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2)
        },
        {
          type: 'message_generated',
          description: 'AI 메시지 생성: 고객 문의 응답',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4)
        },
        {
          type: 'analysis_completed',
          description: '문서 분석 완료: 5개 문서 처리',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6)
        }
      ],
      trends: [
        { period: '1주 전', value: 85, change: 5 },
        { period: '2주 전', value: 80, change: -2 },
        { period: '3주 전', value: 82, change: 8 },
        { period: '4주 전', value: 74, change: 12 }
      ]
    };

    setAnalyticsData(sampleData);
    setIsLoading(false);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'document_upload':
        return <DocumentTextIcon className="w-4 h-4 text-blue-600" />;
      case 'guideline_created':
        return <InformationCircleIcon className="w-4 h-4 text-green-600" />;
      case 'message_generated':
        return <UserGroupIcon className="w-4 h-4 text-purple-600" />;
      case 'analysis_completed':
        return <ChartBarIcon className="w-4 h-4 text-yellow-600" />;
      default:
        return <InformationCircleIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) {
      return <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />;
    } else if (change < 0) {
      return <ArrowTrendingUpIcon className="w-4 h-4 text-red-600 transform rotate-180" />;
    }
    return <ArrowTrendingUpIcon className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <span className="bg-cyan-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">45</span>
                프로젝트 분석
              </h2>
              <p className="text-sm text-gray-600">프로젝트 성과 및 활동 분석</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              aria-label="분석 기간 선택"
            >
              <option value="week">1주</option>
              <option value="month">1개월</option>
              <option value="quarter">3개월</option>
            </select>

            <button
              onClick={loadAnalyticsData}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              <CogIcon className="w-4 h-4" />
              <span>{isLoading ? '로딩 중...' : '새로고침'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalDocuments}</p>
              <p className="text-sm text-gray-600">총 문서</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <InformationCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalGuidelines}</p>
              <p className="text-sm text-gray-600">총 지침</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalMessages}</p>
              <p className="text-sm text-gray-600">생성된 메시지</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.averageResponseTime}s</p>
              <p className="text-sm text-gray-600">평균 응답 시간</p>
            </div>
          </div>
        </div>
      </div>

      {/* 상세 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 카테고리별 분포 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">카테고리별 분포</h3>

          <div className="space-y-3">
            {analyticsData.topCategories.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{category.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(category.count / analyticsData.topCategories[0].count) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{category.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 트렌드 분석 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">트렌드 분석</h3>

          <div className="space-y-3">
            {analyticsData.trends.map((trend, index) => (
              <div key={trend.period} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">{trend.period}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{trend.value}%</span>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(trend.change)}
                    <span className={`text-xs ${trend.change > 0 ? 'text-green-600' : trend.change < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                      {trend.change > 0 ? '+' : ''}{trend.change}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h3>

        <div className="space-y-4">
          {analyticsData.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
              <div className="p-2 bg-gray-100 rounded-lg">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {activity.timestamp.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 성과 지표 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">성과 지표</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{analyticsData.satisfactionScore}/5.0</p>
            <p className="text-sm text-gray-600">고객 만족도</p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
              <ArrowTrendingUpIcon className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">+15%</p>
            <p className="text-sm text-gray-600">효율성 향상</p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">-30%</p>
            <p className="text-sm text-gray-600">응답 시간 단축</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectAnalytics; 