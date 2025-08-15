import React, { useState, useEffect } from 'react';
import {
  StarIcon,
  LightBulbIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

interface Insight {
  id: string;
  type: 'trend' | 'pattern' | 'recommendation' | 'warning' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  category: string;
  createdAt: Date;
  data?: any;
}

interface AIInsightGeneratorProps {
  projectId?: string;
  documents?: any[];
  guidelines?: any[];
  onInsightGenerated?: (insight: Insight) => void;
}

const AIInsightGenerator: React.FC<AIInsightGeneratorProps> = ({
  projectId,
  documents = [],
  guidelines = [],
  onInsightGenerated
}) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all']);
  const [selectedImpact, setSelectedImpact] = useState<string>('all');
  const [generationProgress, setGenerationProgress] = useState(0);

  useEffect(() => {
    loadSampleInsights();
  }, []);

  const loadSampleInsights = () => {
    const sampleInsights: Insight[] = [
      {
        id: 'insight_1',
        type: 'trend',
        title: '안전 관련 문의 증가',
        description: '최근 2주간 안전 관련 문의가 30% 증가했습니다. 추가 안전 지침이 필요할 수 있습니다.',
        confidence: 0.85,
        impact: 'high',
        category: '안전',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        data: { trend: 'up', percentage: 30, timeframe: '2주' }
      },
      {
        id: 'insight_2',
        type: 'pattern',
        title: '반복되는 질문 패턴 발견',
        description: '시공 일정과 관련된 질문이 주로 월요일과 금요일에 집중되어 있습니다.',
        confidence: 0.78,
        impact: 'medium',
        category: '의사소통',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
        data: { pattern: 'weekly', days: ['월요일', '금요일'] }
      },
      {
        id: 'insight_3',
        type: 'recommendation',
        title: '자동 응답 템플릿 제안',
        description: '자주 묻는 질문에 대한 자동 응답 템플릿을 생성하여 응답 시간을 단축할 수 있습니다.',
        confidence: 0.92,
        impact: 'high',
        category: '효율성',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
        data: { templates: 5, estimatedTime: '50% 단축' }
      },
      {
        id: 'insight_4',
        type: 'warning',
        title: '응답 지연 위험',
        description: '복잡한 기술 문의에 대한 응답 시간이 평균 24시간을 초과하고 있습니다.',
        confidence: 0.88,
        impact: 'high',
        category: '성능',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
        data: { averageTime: '24시간', threshold: '12시간' }
      },
      {
        id: 'insight_5',
        type: 'opportunity',
        title: '고객 만족도 향상 기회',
        description: '개인화된 응답을 통해 고객 만족도를 25% 향상시킬 수 있습니다.',
        confidence: 0.76,
        impact: 'medium',
        category: '고객 서비스',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
        data: { improvement: '25%', method: '개인화' }
      }
    ];
    setInsights(sampleInsights);
  };

  const generateInsights = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    // AI 인사이트 생성 시뮬레이션
    const steps = [
      '데이터 분석 중...',
      '패턴 탐지 중...',
      '트렌드 분석 중...',
      '권장사항 생성 중...',
      '인사이트 정리 중...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setGenerationProgress(((i + 1) / steps.length) * 100);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 새로운 인사이트 생성
    const newInsight: Insight = {
      id: `insight_${Date.now()}`,
      type: 'recommendation',
      title: '실시간 분석 기반 인사이트',
      description: '프로젝트 데이터를 분석한 결과, 새로운 인사이트가 생성되었습니다.',
      confidence: 0.82,
      impact: 'medium',
      category: '분석',
      createdAt: new Date(),
      data: { source: 'AI 분석', confidence: 0.82 }
    };

    setInsights(prev => [newInsight, ...prev]);
    if (onInsightGenerated) {
      onInsightGenerated(newInsight);
    }

    setIsGenerating(false);
    setGenerationProgress(0);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return <ArrowTrendingUpIcon className="w-5 h-5 text-blue-600" />;
      case 'pattern':
        return <ChartBarIcon className="w-5 h-5 text-green-600" />;
      case 'recommendation':
        return <LightBulbIcon className="w-5 h-5 text-yellow-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      case 'opportunity':
        return <StarIcon className="w-5 h-5 text-purple-600" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInsights = insights.filter(insight => {
    const categoryMatch = selectedCategories.includes('all') || selectedCategories.includes(insight.category);
    const impactMatch = selectedImpact === 'all' || selectedImpact === insight.impact;
    return categoryMatch && impactMatch;
  });

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <LightBulbIcon className="w-8 h-8 text-yellow-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <span className="bg-teal-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">44</span>
                AI 인사이트 생성기
              </h2>
              <p className="text-sm text-gray-600">프로젝트 데이터를 분석하여 지능적인 인사이트를 생성합니다</p>
            </div>
          </div>

          <button
            onClick={generateInsights}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isGenerating ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                <span>생성 중...</span>
              </>
            ) : (
              <>
                <StarIcon className="w-4 h-4" />
                <span>인사이트 생성</span>
              </>
            )}
          </button>
        </div>

        {/* 생성 진행률 */}
        {isGenerating && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>AI 분석 진행률</span>
              <span>{Math.round(generationProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${generationProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* 필터 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">필터</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
            <div className="space-y-2">
              {['all', '안전', '의사소통', '효율성', '성능', '고객 서비스', '분석'].map(category => (
                <label key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={(e) => {
                      if (category === 'all') {
                        setSelectedCategories(e.target.checked ? ['all'] : []);
                      } else {
                        setSelectedCategories(prev => {
                          const newCategories = prev.filter(c => c !== 'all');
                          if (e.target.checked) {
                            return [...newCategories, category];
                          } else {
                            return newCategories.filter(c => c !== category);
                          }
                        });
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">영향도</label>
            <select
              value={selectedImpact}
              onChange={(e) => setSelectedImpact(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              aria-label="영향도 선택"
            >
              <option value="all">모든 영향도</option>
              <option value="high">높음</option>
              <option value="medium">보통</option>
              <option value="low">낮음</option>
            </select>
          </div>
        </div>
      </div>

      {/* 인사이트 목록 */}
      <div className="space-y-4">
        {filteredInsights.map(insight => (
          <div key={insight.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium text-gray-900">{insight.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getImpactColor(insight.impact)}`}>
                      {insight.impact === 'high' ? '높음' : insight.impact === 'medium' ? '보통' : '낮음'}
                    </span>
                    <span className="text-xs text-gray-500">
                      신뢰도: {(insight.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  <p className="text-gray-600 mb-3">{insight.description}</p>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>{insight.createdAt.toLocaleDateString()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <DocumentTextIcon className="w-4 h-4" />
                      <span>{insight.category}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  className="p-2 text-gray-400 hover:text-gray-600"
                  aria-label="상세 정보 보기"
                >
                  <InformationCircleIcon className="w-4 h-4" />
                </button>
                <button
                  className="p-2 text-gray-400 hover:text-gray-600"
                  aria-label="인사이트 적용"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 추가 데이터 표시 */}
            {insight.data && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">상세 데이터</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {Object.entries(insight.data).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-gray-600">{key}:</span>
                      <span className="ml-2 font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 통계 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">인사이트 통계</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{insights.length}</p>
            <p className="text-sm text-gray-600">총 인사이트</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {insights.filter(i => i.type === 'trend').length}
            </p>
            <p className="text-sm text-gray-600">트렌드</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {insights.filter(i => i.type === 'recommendation').length}
            </p>
            <p className="text-sm text-gray-600">권장사항</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {insights.filter(i => i.type === 'warning').length}
            </p>
            <p className="text-sm text-gray-600">경고</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsightGenerator; 