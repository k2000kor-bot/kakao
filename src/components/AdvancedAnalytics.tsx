import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  LightBulbIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { AILearningService } from '../services/aiLearningService';

interface AdvancedAnalyticsProps {
  projectId: string;
}

interface AnalyticsData {
  totalFiles: number;
  totalKnowledge: number;
  averageConfidence: number;
  mostAnalyzedFiles: string[];
  topKeywords: string[];
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  knowledgeGrowthRate: number;
  modelPerformance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  recommendations: string[];
  recentActivity: Array<{
    id: string;
    type: 'file_upload' | 'analysis' | 'learning' | 'knowledge_add';
    description: string;
    timestamp: string;
    status: 'success' | 'warning' | 'error';
  }>;
}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ projectId }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'trends' | 'insights'>('overview');

  const aiLearningService = AILearningService.getInstance();

  useEffect(() => {
    loadAnalyticsData();
  }, [projectId]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const data = await aiLearningService.getAdvancedAnalytics(projectId);
      setAnalyticsData(data);
    } catch (error) {
      console.error('분석 데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
      default:
        return <InformationCircleIcon className="w-4 h-4 text-blue-500" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'file_upload':
        return <DocumentTextIcon className="w-4 h-4" />;
      case 'analysis':
        return <ChartBarIcon className="w-4 h-4" />;
      case 'learning':
        return <LightBulbIcon className="w-4 h-4" />;
      case 'knowledge_add':
        return <InformationCircleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">분석 데이터를 로드하는 중...</span>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <ChartBarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">분석 데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: '개요', icon: ChartBarIcon },
            { id: 'performance', name: '성능', icon: ArrowTrendingUpIcon },
            { id: 'trends', name: '트렌드', icon: ArrowTrendingUpIcon },
            { id: 'insights', name: '인사이트', icon: LightBulbIcon }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 개요 탭 */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 주요 지표 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">총 파일</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.totalFiles}</p>
                </div>
                <DocumentTextIcon className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">지식 베이스</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.totalKnowledge}</p>
                </div>
                <LightBulbIcon className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">평균 신뢰도</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(analyticsData.averageConfidence * 100).toFixed(1)}%
                  </p>
                </div>
                <CheckCircleIcon className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">지식 성장률</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(analyticsData.knowledgeGrowthRate * 100).toFixed(1)}%
                  </p>
                </div>
                <ArrowTrendingUpIcon className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* 감정 분포 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">감정 분석 분포</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">긍정적</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${analyticsData.sentimentDistribution.positive * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {(analyticsData.sentimentDistribution.positive * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">중립적</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${analyticsData.sentimentDistribution.neutral * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {(analyticsData.sentimentDistribution.neutral * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">부정적</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${analyticsData.sentimentDistribution.negative * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {(analyticsData.sentimentDistribution.negative * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 최근 활동 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h3>
            <div className="space-y-3">
              {analyticsData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  {getStatusIcon(activity.status)}
                  <div className="flex items-center space-x-2">
                    {getActivityIcon(activity.type)}
                    <span className="text-sm text-gray-900">{activity.description}</span>
                  </div>
                  <span className="text-xs text-gray-500 ml-auto">
                    {new Date(activity.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 성능 탭 */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">모델 성능</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {(analyticsData.modelPerformance.accuracy * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">정확도</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {(analyticsData.modelPerformance.precision * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">정밀도</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {(analyticsData.modelPerformance.recall * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">재현율</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {(analyticsData.modelPerformance.f1Score * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">F1 점수</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 트렌드 탭 */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">주요 키워드</h3>
            <div className="flex flex-wrap gap-2">
              {analyticsData.topKeywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">가장 많이 분석된 파일</h3>
            <div className="space-y-2">
              {analyticsData.mostAnalyzedFiles.map((file, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                  <DocumentTextIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-900">{file}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 인사이트 탭 */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI 추천사항</h3>
            <div className="space-y-3">
              {analyticsData.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <LightBulbIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                  <span className="text-sm text-blue-800">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAnalytics; 