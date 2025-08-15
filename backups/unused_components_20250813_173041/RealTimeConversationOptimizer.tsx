import React, { useState, useEffect } from 'react';
import {
  StarIcon,
  CogIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  LightBulbIcon,
  BoltIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

interface Optimization {
  id: string;
  type: 'response' | 'timing' | 'tone' | 'content' | 'strategy';
  title: string;
  description: string;
  currentScore: number;
  optimizedScore: number;
  improvement: number;
  status: 'pending' | 'applied' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  suggestions: string[];
}

interface OptimizationRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  isActive: boolean;
  priority: 'high' | 'medium' | 'low';
  successRate: number;
}

interface RealTimeConversationOptimizerProps {
  chatRoomId?: string;
  isActive?: boolean;
}

const RealTimeConversationOptimizer: React.FC<RealTimeConversationOptimizerProps> = ({
  chatRoomId = 'default',
  isActive = true
}) => {
  const [optimizations, setOptimizations] = useState<Optimization[]>([]);
  const [rules, setRules] = useState<OptimizationRule[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedOptimization, setSelectedOptimization] = useState<Optimization | null>(null);
  const [filter, setFilter] = useState<'all' | 'response' | 'timing' | 'tone' | 'content' | 'strategy'>('all');
  const [showApplied, setShowApplied] = useState(false);

  // 샘플 최적화 데이터
  const sampleOptimizations: Optimization[] = [
    {
      id: '1',
      type: 'response',
      title: '응답 속도 최적화',
      description: '현재 응답 시간이 평균보다 30% 느립니다. 즉시 응답을 개선할 수 있습니다.',
      currentScore: 65,
      optimizedScore: 92,
      improvement: 27,
      status: 'pending',
      priority: 'high',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      suggestions: [
        '자동 응답 템플릿 활용',
        '핵심 키워드 우선 처리',
        '응답 우선순위 설정'
      ]
    },
    {
      id: '2',
      type: 'tone',
      title: '톤 조정 최적화',
      description: '조합원들의 감정 상태에 맞춰 더 공감적인 톤으로 조정이 필요합니다.',
      currentScore: 72,
      optimizedScore: 88,
      improvement: 16,
      status: 'applied',
      priority: 'medium',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      suggestions: [
        '공감적 표현 추가',
        '부드러운 어조 사용',
        '이해와 동감 표현'
      ]
    },
    {
      id: '3',
      type: 'content',
      title: '내용 구체성 향상',
      description: '현재 응답이 너무 일반적입니다. 구체적인 정보와 해결책을 제시해야 합니다.',
      currentScore: 58,
      optimizedScore: 85,
      improvement: 27,
      status: 'pending',
      priority: 'high',
      timestamp: new Date(Date.now() - 5400000).toISOString(),
      suggestions: [
        '구체적인 데이터 제공',
        '단계별 해결책 제시',
        '관련 규정 명시'
      ]
    },
    {
      id: '4',
      type: 'strategy',
      title: '전략적 접근 최적화',
      description: '현재 상황에 맞는 전략적 접근이 필요합니다. 조합원 중심의 해결책을 제시하세요.',
      currentScore: 75,
      optimizedScore: 91,
      improvement: 16,
      status: 'applied',
      priority: 'medium',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      suggestions: [
        '조합원 이익 우선',
        '장기적 관점 고려',
        '협력적 해결책 모색'
      ]
    }
  ];

  const sampleRules: OptimizationRule[] = [
    {
      id: '1',
      name: '응답 속도 최적화',
      condition: '응답 시간이 5분을 초과하면',
      action: '자동 응답 템플릿 적용 및 우선순위 조정',
      isActive: true,
      priority: 'high',
      successRate: 94.2
    },
    {
      id: '2',
      name: '톤 조정 규칙',
      condition: '부정적 감정이 60% 이상 감지되면',
      action: '공감적이고 부드러운 톤으로 자동 조정',
      isActive: true,
      priority: 'medium',
      successRate: 87.5
    },
    {
      id: '3',
      name: '내용 구체성 규칙',
      condition: '일반적인 응답이 3회 연속 발생하면',
      action: '구체적인 데이터와 해결책 포함',
      isActive: true,
      priority: 'high',
      successRate: 91.8
    },
    {
      id: '4',
      name: '전략적 접근 규칙',
      condition: '갈등 상황이 감지되면',
      action: '조합원 중심의 협력적 해결책 제시',
      isActive: true,
      priority: 'high',
      successRate: 89.3
    }
  ];

  useEffect(() => {
    if (!isActive) return;

    // 최적화 데이터 로드
    setOptimizations(sampleOptimizations);
    setRules(sampleRules);

    // 실시간 최적화 시뮬레이션
    if (isOptimizing) {
      const interval = setInterval(() => {
        // 새로운 최적화 생성 (가끔)
        if (Math.random() < 0.2) {
          const optimizationTypes: Optimization['type'][] = ['response', 'timing', 'tone', 'content', 'strategy'];
          const priorities: Optimization['priority'][] = ['high', 'medium', 'low'];

          const newOptimization: Optimization = {
            id: Date.now().toString(),
            type: optimizationTypes[Math.floor(Math.random() * optimizationTypes.length)],
            title: `새로운 ${optimizationTypes[Math.floor(Math.random() * optimizationTypes.length)]} 최적화`,
            description: '실시간 대화 분석을 통해 새로운 최적화 기회가 발견되었습니다.',
            currentScore: Math.floor(Math.random() * 30) + 60,
            optimizedScore: Math.floor(Math.random() * 20) + 80,
            improvement: Math.floor(Math.random() * 25) + 10,
            status: 'pending',
            priority: priorities[Math.floor(Math.random() * priorities.length)],
            timestamp: new Date().toISOString(),
            suggestions: ['자동 최적화 적용', '수동 검토 필요']
          };

          setOptimizations(prev => [newOptimization, ...prev]);
        }
      }, 30000); // 30초마다

      return () => clearInterval(interval);
    }
  }, [isActive, isOptimizing]);

  const getOptimizationTypeColor = (type: string) => {
    switch (type) {
      case 'response': return 'text-blue-600 bg-blue-100';
      case 'timing': return 'text-green-600 bg-green-100';
      case 'tone': return 'text-purple-600 bg-purple-100';
      case 'content': return 'text-orange-600 bg-orange-100';
      case 'strategy': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getOptimizationTypeIcon = (type: string) => {
    switch (type) {
      case 'response': return <BoltIcon className="w-4 h-4 text-blue-600" />;
      case 'timing': return <ClockIcon className="w-4 h-4 text-green-600" />;
      case 'tone': return <DocumentTextIcon className="w-4 h-4 text-purple-600" />;
      case 'content': return <LightBulbIcon className="w-4 h-4 text-orange-600" />;
      case 'strategy': return <ShieldCheckIcon className="w-4 h-4 text-red-600" />;
      default: return <CogIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const handleOptimizationClick = (optimization: Optimization) => {
    setSelectedOptimization(optimization);
  };

  const handleToggleOptimization = () => {
    setIsOptimizing(!isOptimizing);
  };

  const handleApplyOptimization = (optimizationId: string) => {
    setOptimizations(prev => prev.map(opt =>
      opt.id === optimizationId ? { ...opt, status: 'applied' } : opt
    ));
  };

  const handleRejectOptimization = (optimizationId: string) => {
    setOptimizations(prev => prev.map(opt =>
      opt.id === optimizationId ? { ...opt, status: 'rejected' } : opt
    ));
  };

  const handleToggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule =>
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  const filteredOptimizations = optimizations.filter(optimization => {
    if (filter !== 'all' && optimization.type !== filter) return false;
    if (!showApplied && optimization.status === 'applied') return false;
    return true;
  });

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* 헤더 */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CogIcon className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <span className="bg-lime-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">46</span>
                실시간 대화 최적화 시스템
              </h3>
              <p className="text-sm text-gray-500">AI 기반 실시간 대화 품질 최적화 및 자동 개선</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleOptimization}
              className={`p-2 rounded-md ${isOptimizing
                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                  : 'bg-red-100 text-red-600 hover:bg-red-200'
                }`}
            >
              {isOptimizing ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
            </button>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1"
            >
              <option value="all">전체</option>
              <option value="response">응답</option>
              <option value="timing">타이밍</option>
              <option value="tone">톤</option>
              <option value="content">내용</option>
              <option value="strategy">전략</option>
            </select>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showApplied}
                onChange={(e) => setShowApplied(e.target.checked)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-600">적용된 최적화 표시</span>
            </label>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 최적화 목록 */}
          <div className="lg:col-span-2">
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
              <ArrowTrendingUpIcon className="w-5 h-5 mr-2 text-green-600" />
              실시간 최적화 ({filteredOptimizations.length})
            </h4>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredOptimizations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CogIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>최적화 항목이 없습니다.</p>
                </div>
              ) : (
                filteredOptimizations.map((optimization) => (
                  <div
                    key={optimization.id}
                    className={`border rounded-lg p-4 transition-colors ${selectedOptimization?.id === optimization.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getOptimizationTypeIcon(optimization.type)}
                        <span className={`px-2 py-1 rounded-full text-xs ${getOptimizationTypeColor(optimization.type)}`}>
                          {optimization.type === 'response' ? '응답' :
                            optimization.type === 'timing' ? '타이밍' :
                              optimization.type === 'tone' ? '톤' :
                                optimization.type === 'content' ? '내용' : '전략'}
                        </span>
                        <span className={`text-xs font-medium ${getPriorityColor(optimization.priority)}`}>
                          {optimization.priority === 'high' ? '높음' :
                            optimization.priority === 'medium' ? '보통' : '낮음'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {formatTime(optimization.timestamp)}
                        </span>
                        <span className="text-xs font-medium text-green-600">
                          +{optimization.improvement}%
                        </span>
                      </div>
                    </div>

                    <h5 className="font-medium text-gray-900 mb-1">{optimization.title}</h5>
                    <p className="text-sm text-gray-600 mb-3">{optimization.description}</p>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-600">현재: {optimization.currentScore}%</span>
                        <span className="text-green-600 font-medium">최적화: {optimization.optimizedScore}%</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {optimization.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApplyOptimization(optimization.id)}
                              className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded hover:bg-green-200"
                            >
                              적용
                            </button>
                            <button
                              onClick={() => handleRejectOptimization(optimization.id)}
                              className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                            >
                              거부
                            </button>
                          </>
                        )}
                        {optimization.status === 'applied' && (
                          <span className="text-xs text-green-600 font-medium">적용됨</span>
                        )}
                        {optimization.status === 'rejected' && (
                          <span className="text-xs text-red-600 font-medium">거부됨</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <WrenchScrewdriverIcon className="w-3 h-3" />
                      <span>자동 최적화</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 최적화 규칙 */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
              <StarIcon className="w-5 h-5 mr-2 text-purple-600" />
              최적화 규칙
            </h4>

            <div className="space-y-3">
              {rules.map((rule) => (
                <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-gray-900">{rule.name}</h5>
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`px-2 py-1 rounded text-xs ${rule.isActive
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                      {rule.isActive ? '활성' : '비활성'}
                    </button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">조건:</span>
                      <p className="text-gray-700">{rule.condition}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">동작:</span>
                      <p className="text-gray-700">{rule.action}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(rule.priority)}`}>
                      {rule.priority === 'high' ? '높음' :
                        rule.priority === 'medium' ? '보통' : '낮음'}
                    </span>
                    <span className="text-xs text-green-600 font-medium">
                      {rule.successRate}% 성공률
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 최적화 상세 정보 */}
        {selectedOptimization && (
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
              <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-600" />
              최적화 상세 정보
            </h4>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getOptimizationTypeIcon(selectedOptimization.type)}
                  <div>
                    <h5 className="font-medium text-gray-900">{selectedOptimization.title}</h5>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedOptimization.timestamp).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${getOptimizationTypeColor(selectedOptimization.type)}`}>
                    {selectedOptimization.type === 'response' ? '응답' :
                      selectedOptimization.type === 'timing' ? '타이밍' :
                        selectedOptimization.type === 'tone' ? '톤' :
                          selectedOptimization.type === 'content' ? '내용' : '전략'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(selectedOptimization.priority)}`}>
                    {selectedOptimization.priority === 'high' ? '높음' :
                      selectedOptimization.priority === 'medium' ? '보통' : '낮음'}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{selectedOptimization.description}</p>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-600">현재 점수:</span>
                  <p className="text-gray-900">{selectedOptimization.currentScore}%</p>
                </div>
                <div>
                  <span className="text-gray-600">최적화 점수:</span>
                  <p className="text-gray-900">{selectedOptimization.optimizedScore}%</p>
                </div>
                <div>
                  <span className="text-gray-600">개선도:</span>
                  <p className="text-green-600 font-medium">+{selectedOptimization.improvement}%</p>
                </div>
                <div>
                  <span className="text-gray-600">상태:</span>
                  <p className="text-gray-900">
                    {selectedOptimization.status === 'pending' ? '대기 중' :
                      selectedOptimization.status === 'applied' ? '적용됨' : '거부됨'}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <h6 className="font-medium text-gray-900 mb-2">제안 사항</h6>
                <div className="space-y-2">
                  {selectedOptimization.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 시스템 통계 */}
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2 text-blue-600" />
            최적화 시스템 통계
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <ArrowTrendingUpIcon className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">적용된 최적화</p>
                  <p className="text-2xl font-bold text-green-900">
                    {optimizations.filter(o => o.status === 'applied').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <CogIcon className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">평균 개선도</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {Math.round(optimizations.reduce((acc, o) => acc + o.improvement, 0) / optimizations.length)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <StarIcon className="w-8 h-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-600">활성 규칙</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {rules.filter(r => r.isActive).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center">
                <BoltIcon className="w-8 h-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-orange-600">대기 중</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {optimizations.filter(o => o.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeConversationOptimizer; 