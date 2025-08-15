import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CpuChipIcon,
  ArrowTrendingUpIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BoltIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
  responseTime: number;
  bundleSize: number;
  renderTime: number;
  cacheHitRate: number;
  errorRate: number;
}

interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'performance' | 'memory' | 'network' | 'bundle';
  status: 'pending' | 'applied' | 'ignored';
  estimatedImprovement: number;
}

interface AdvancedPerformanceOptimizerProps {
  onOptimizationApply?: (suggestion: OptimizationSuggestion) => void;
}

const AdvancedPerformanceOptimizer: React.FC<AdvancedPerformanceOptimizerProps> = ({
  onOptimizationApply
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cpuUsage: 0,
    memoryUsage: 0,
    networkLatency: 0,
    responseTime: 0,
    bundleSize: 0,
    renderTime: 0,
    cacheHitRate: 0,
    errorRate: 0
  });

  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'suggestions' | 'history'>('overview');

  // 시뮬레이션된 성능 메트릭
  useEffect(() => {
    const updateMetrics = () => {
      setMetrics({
        cpuUsage: Math.random() * 30 + 10, // 10-40%
        memoryUsage: Math.random() * 20 + 15, // 15-35%
        networkLatency: Math.random() * 50 + 20, // 20-70ms
        responseTime: Math.random() * 100 + 50, // 50-150ms
        bundleSize: Math.random() * 500 + 1000, // 1000-1500KB
        renderTime: Math.random() * 20 + 10, // 10-30ms
        cacheHitRate: Math.random() * 20 + 70, // 70-90%
        errorRate: Math.random() * 2 + 0.1 // 0.1-2.1%
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  // 최적화 제안 생성
  useEffect(() => {
    const mockSuggestions: OptimizationSuggestion[] = [
      {
        id: '1',
        title: '이미지 최적화',
        description: 'WebP 형식으로 이미지를 변환하여 30% 크기 감소',
        impact: 'high',
        category: 'bundle',
        status: 'pending',
        estimatedImprovement: 30
      },
      {
        id: '2',
        title: '코드 스플리팅',
        description: 'React.lazy를 사용하여 초기 번들 크기 감소',
        impact: 'high',
        category: 'performance',
        status: 'pending',
        estimatedImprovement: 25
      },
      {
        id: '3',
        title: '메모이제이션 적용',
        description: 'React.memo와 useMemo를 사용하여 불필요한 리렌더링 방지',
        impact: 'medium',
        category: 'performance',
        status: 'applied',
        estimatedImprovement: 15
      },
      {
        id: '4',
        title: 'CDN 캐싱',
        description: '정적 자산에 대한 CDN 캐싱 설정',
        impact: 'medium',
        category: 'network',
        status: 'pending',
        estimatedImprovement: 20
      },
      {
        id: '5',
        title: '가비지 컬렉션 최적화',
        description: '메모리 누수 방지를 위한 객체 참조 정리',
        impact: 'low',
        category: 'memory',
        status: 'ignored',
        estimatedImprovement: 10
      }
    ];

    setSuggestions(mockSuggestions);
  }, []);

  const handleApplyOptimization = (suggestion: OptimizationSuggestion) => {
    setIsOptimizing(true);

    // 시뮬레이션된 최적화 적용
    setTimeout(() => {
      setSuggestions(prev =>
        prev.map(s =>
          s.id === suggestion.id
            ? { ...s, status: 'applied' as const }
            : s
        )
      );
      setIsOptimizing(false);
      onOptimizationApply?.(suggestion);
    }, 2000);
  };

  const getPerformanceColor = (value: number, threshold: number) => {
    if (value <= threshold * 0.7) return 'text-green-600';
    if (value <= threshold) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-blue-600 bg-blue-50';
      case 'ignored': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 실시간 메트릭 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CPU 사용률</p>
              <p className={`text-2xl font-bold ${getPerformanceColor(metrics.cpuUsage, 80)}`}>
                {metrics.cpuUsage.toFixed(1)}%
              </p>
            </div>
            <CpuChipIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">메모리 사용률</p>
              <p className={`text-2xl font-bold ${getPerformanceColor(metrics.memoryUsage, 70)}`}>
                {metrics.memoryUsage.toFixed(1)}%
              </p>
            </div>
            <CpuChipIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">응답 시간</p>
              <p className={`text-2xl font-bold ${getPerformanceColor(metrics.responseTime, 200)}`}>
                {metrics.responseTime.toFixed(0)}ms
              </p>
            </div>
            <ClockIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">번들 크기</p>
              <p className={`text-2xl font-bold ${getPerformanceColor(metrics.bundleSize, 1500)}`}>
                {(metrics.bundleSize / 1024).toFixed(1)}MB
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* 성능 차트 */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">성능 트렌드</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">네트워크 지연시간</h4>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (metrics.networkLatency / 100) * 100)}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600">{metrics.networkLatency.toFixed(0)}ms</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">캐시 적중률</h4>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.cacheHitRate}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600">{metrics.cacheHitRate.toFixed(1)}%</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">렌더링 시간</h4>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (metrics.renderTime / 50) * 100)}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600">{metrics.renderTime.toFixed(1)}ms</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">오류율</h4>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (metrics.errorRate / 5) * 100)}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600">{metrics.errorRate.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 최적화 */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">빠른 최적화</h3>
          <button
            onClick={() => setActiveTab('suggestions')}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            모든 제안 보기
          </button>
        </div>

        <div className="space-y-3">
          {suggestions.slice(0, 3).map((suggestion) => (
            <div key={suggestion.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{suggestion.title}</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(suggestion.impact)}`}>
                    {suggestion.impact === 'high' ? '높음' : suggestion.impact === 'medium' ? '보통' : '낮음'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {suggestion.estimatedImprovement}% 개선
                </span>
                {suggestion.status === 'pending' && (
                  <button
                    onClick={() => handleApplyOptimization(suggestion)}
                    disabled={isOptimizing}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isOptimizing ? '적용 중...' : '적용'}
                  </button>
                )}
                {suggestion.status === 'applied' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-50">
                    <CheckCircleIcon className="w-3 h-3 mr-1" />
                    적용됨
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSuggestions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">최적화 제안</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setSuggestions(prev => prev.filter(s => s.status === 'pending'))}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            대기 중만 보기
          </button>
          <button
            onClick={() => setSuggestions(prev => prev.filter(s => s.impact === 'high'))}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          >
            높은 영향도만
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="bg-white rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg font-medium text-gray-900">{suggestion.title}</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(suggestion.impact)}`}>
                    {suggestion.impact === 'high' ? '높음' : suggestion.impact === 'medium' ? '보통' : '낮음'}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(suggestion.status)}`}>
                    {suggestion.status === 'applied' ? '적용됨' : suggestion.status === 'pending' ? '대기 중' : '무시됨'}
                  </span>
                </div>

                <p className="text-gray-600 mb-3">{suggestion.description}</p>

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>예상 개선: {suggestion.estimatedImprovement}%</span>
                  <span>카테고리: {suggestion.category}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                {suggestion.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApplyOptimization(suggestion)}
                      disabled={isOptimizing}
                      className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      {isOptimizing ? '적용 중...' : '적용'}
                    </button>
                    <button
                      onClick={() => setSuggestions(prev =>
                        prev.map(s => s.id === suggestion.id ? { ...s, status: 'ignored' } : s)
                      )}
                      className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      무시
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">최적화 히스토리</h3>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h4 className="font-medium text-gray-900">최근 적용된 최적화</h4>
        </div>

        <div className="divide-y">
          {suggestions.filter(s => s.status === 'applied').map((suggestion) => (
            <div key={suggestion.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900">{suggestion.title}</h5>
                  <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                  <p className="text-xs text-gray-500 mt-2">적용 시간: {new Date().toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-50">
                    <CheckCircleIcon className="w-3 h-3 mr-1" />
                    적용됨
                  </span>
                  <p className="text-sm text-gray-600 mt-1">{suggestion.estimatedImprovement}% 개선</p>
                </div>
              </div>
            </div>
          ))}
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
            <BoltIcon className="w-6 h-6 text-yellow-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">성능 최적화</h3>
              <p className="text-sm text-gray-500">실시간 성능 모니터링 및 최적화</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
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
            { id: 'suggestions', name: '제안', icon: WrenchScrewdriverIcon },
            { id: 'history', name: '히스토리', icon: ClockIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
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
        {activeTab === 'suggestions' && renderSuggestions()}
        {activeTab === 'history' && renderHistory()}
      </div>
    </div>
  );
};

export default AdvancedPerformanceOptimizer;
