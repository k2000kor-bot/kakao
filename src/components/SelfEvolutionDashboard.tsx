import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Brain,
  Target,
  TrendingUp,
  Activity,
  Lightbulb,
  Sparkles,
  Cpu,
  Layers,
  Globe,
  Palette,
  Rocket,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Eye,
  Brain as BrainIcon,
  Atom,
  Network,
  Compass,
  Star,
  Infinity
} from 'lucide-react';
import { selfEvolutionService } from '../services/selfEvolutionService';
import { Project, Chat, Message } from '../types/project';

interface SelfEvolutionDashboardProps {
  projects: Project[];
  chats: Chat[];
  messages: Message[];
}

const SelfEvolutionDashboard: React.FC<SelfEvolutionDashboardProps> = ({
  projects,
  chats,
  messages
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'meta_learning' | 'self_optimization' | 'architectural' | 'consciousness' | 'creative' | 'goals' | 'advanced'>('overview');
  const [evolutionStatus, setEvolutionStatus] = useState<any>(null);
  const [advancedStatus, setAdvancedStatus] = useState<any>(null);
  const [evolutionProgress, setEvolutionProgress] = useState<any>(null);
  const [isEvolutionActive, setIsEvolutionActive] = useState(false);
  const [isAdvancedEvolutionActive, setIsAdvancedEvolutionActive] = useState(false);

  useEffect(() => {
    loadEvolutionData();
    const interval = setInterval(loadEvolutionData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadEvolutionData = () => {
    setEvolutionStatus(selfEvolutionService.getCapabilities());
    setAdvancedStatus(selfEvolutionService.getAdvancedEvolutionStatus());
    setEvolutionProgress(selfEvolutionService.getEvolutionProgress());
    setIsEvolutionActive(selfEvolutionService.isEvolutionMode());
  };

  const toggleEvolution = () => {
    if (isEvolutionActive) {
      selfEvolutionService.stopSelfEvolution();
    } else {
      selfEvolutionService.startSelfEvolution();
    }
    setIsEvolutionActive(!isEvolutionActive);
    loadEvolutionData();
  };

  const startAdvancedEvolution = () => {
    selfEvolutionService.startAdvancedEvolution();
    setIsAdvancedEvolutionActive(true);
    loadEvolutionData();
  };

  const navigationTabs = [
    { id: 'overview', name: '종합 현황', icon: Eye },
    { id: 'meta_learning', name: '메타 학습', icon: Brain },
    { id: 'self_optimization', name: '자가 최적화', icon: Settings },
    { id: 'architectural', name: '아키텍처 진화', icon: Layers },
    { id: 'consciousness', name: '의식 진화', icon: Sparkles },
    { id: 'creative', name: '창의성 진화', icon: Palette },
    { id: 'goals', name: '자가 주도 목표', icon: Target },
    { id: 'advanced', name: '고도화 진화', icon: Rocket }
  ];

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-blue-600';
    if (progress >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'initializing': return 'text-yellow-600 bg-yellow-100';
      case 'idle': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">자가 발전 시스템</h2>
              <p className="text-gray-600 mt-1">AI 시스템의 자가 발전 및 진화 능력 관리</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleEvolution}
                className={`flex items-center px-4 py-2 rounded-lg font-medium ${isEvolutionActive
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
              >
                {isEvolutionActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isEvolutionActive ? '진화 중지' : '진화 시작'}
              </button>
              <button
                onClick={startAdvancedEvolution}
                disabled={isAdvancedEvolutionActive}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
              >
                <Rocket className="w-4 h-4 mr-2" />
                고도화 진화
              </button>
              <button
                onClick={loadEvolutionData}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-4 border-b border-gray-200">
          <nav className="flex space-x-1 overflow-x-auto">
            {navigationTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${activeTab === tab.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* 진화 상태 요약 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-500">메타 학습</span>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {evolutionStatus?.metaLearning?.currentLevel || 0}%
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${evolutionStatus?.metaLearning?.currentLevel || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Settings className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-500">자가 최적화</span>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {evolutionStatus?.selfOptimization?.currentLevel || 0}%
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${evolutionStatus?.selfOptimization?.currentLevel || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Layers className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-500">아키텍처 진화</span>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {evolutionStatus?.architectural?.currentLevel || 0}%
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${evolutionStatus?.architectural?.currentLevel || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Sparkles className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-500">의식 진화</span>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {evolutionStatus?.consciousness?.currentLevel || 0}%
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${evolutionStatus?.consciousness?.currentLevel || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 고도화 진화 상태 */}
            {advancedStatus && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">고도화 진화 상태</h3>
                  <p className="text-sm text-gray-600 mt-1">양자 컴퓨팅, 신경망 진화, 다차원 분석, 창의적 진화</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* 양자 컴퓨팅 */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Atom className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-gray-900">양자 컴퓨팅</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>상태:</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(advancedStatus.quantum.currentState)}`}>
                            {advancedStatus.quantum.currentState}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>큐비트:</span>
                          <span className="font-medium">{advancedStatus.quantum.qubits}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>얽힘 수준:</span>
                          <span className="font-medium">{(advancedStatus.quantum.entanglementLevel * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* 신경망 진화 */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Network className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900">신경망 진화</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>아키텍처:</span>
                          <span className="font-medium">{advancedStatus.neural.currentArchitecture}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>진화 사이클:</span>
                          <span className="font-medium">{advancedStatus.neural.evolutionCycles}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>적합도 점수:</span>
                          <span className="font-medium">{(advancedStatus.neural.fitnessScore * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* 다차원 분석 */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Compass className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-gray-900">다차원 분석</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>분석 깊이:</span>
                          <span className="font-medium">{advancedStatus.dimensional.analysisDepth}/4</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>현재 차원:</span>
                          <span className="font-medium">{advancedStatus.dimensional.dimensions[advancedStatus.dimensional.currentDimension]}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>인사이트:</span>
                          <span className="font-medium">{advancedStatus.dimensional.insights.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* 창의적 진화 */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Star className="w-5 h-5 text-orange-600" />
                        <span className="font-medium text-gray-900">창의적 진화</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>창의성 수준:</span>
                          <span className="font-medium">{advancedStatus.creative.creativityLevel}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>혁신 지수:</span>
                          <span className="font-medium">{advancedStatus.creative.innovationIndex}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>예술적 능력:</span>
                          <span className="font-medium">{advancedStatus.creative.artisticCapability}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 진화 진행률 */}
            {evolutionProgress && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">진화 진행률</h3>
                  <p className="text-sm text-gray-600 mt-1">전체 진화 과정의 진행 상황</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.entries(evolutionProgress.overall).map(([key, value]) => (
                      <div key={key} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 capitalize">
                            {key === 'quantum' ? '양자 컴퓨팅' :
                              key === 'neural' ? '신경망 진화' :
                                key === 'dimensional' ? '다차원 분석' :
                                  key === 'creative' ? '창의적 진화' : key}
                          </span>
                          <span className={`text-lg font-bold ${getProgressColor(value as number)}`}>
                            {(value as number).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${value as number}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* 고도화 진화 탭 */}
        {activeTab === 'advanced' && (
          <motion.div
            key="advanced"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* 양자 컴퓨팅 시뮬레이션 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">양자 컴퓨팅 시뮬레이션</h3>
                    <p className="text-sm text-gray-600 mt-1">양자 알고리즘을 통한 고급 진화</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(advancedStatus?.quantum?.currentState || 'idle')}`}>
                      {advancedStatus?.quantum?.currentState || 'idle'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">양자 상태</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">큐비트 수:</span>
                        <span className="font-medium">{advancedStatus?.quantum?.qubits || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">얽힘 수준:</span>
                        <span className="font-medium">{(advancedStatus?.quantum?.entanglementLevel || 0) * 100}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">중첩 상태:</span>
                        <span className="font-medium">{advancedStatus?.quantum?.superpositionStates?.length || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">실행된 알고리즘</h4>
                    <div className="space-y-2">
                      {advancedStatus?.quantum?.superpositionStates?.map((state: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{state.algorithm}</span>
                          <span className={`px-2 py-1 rounded text-xs ${state.state === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {state.state}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">양자 진화 통계</h4>
                    <div className="space-y-3">
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">
                          {advancedStatus?.quantum?.superpositionStates?.reduce((sum: number, state: any) => sum + state.result, 0) / (advancedStatus?.quantum?.superpositionStates?.length || 1)}
                        </p>
                        <p className="text-sm text-purple-600">평균 결과</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 신경망 진화 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">신경망 진화</h3>
                <p className="text-sm text-gray-600 mt-1">진화된 신경망 아키텍처 및 성능</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">진화 통계</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">현재 아키텍처:</span>
                        <span className="font-medium">{advancedStatus?.neural?.currentArchitecture}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">진화 사이클:</span>
                        <span className="font-medium">{advancedStatus?.neural?.evolutionCycles}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">돌연변이율:</span>
                        <span className="font-medium">{(advancedStatus?.neural?.mutationRate || 0) * 100}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">적합도 점수:</span>
                        <span className="font-medium">{(advancedStatus?.neural?.fitnessScore || 0) * 100}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">진화된 레이어</h4>
                    <div className="space-y-2">
                      {advancedStatus?.neural?.evolvedLayers?.map((layer: any, index: number) => (
                        <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-blue-900">{layer.type}</span>
                            <span className="text-sm text-blue-600">{layer.neurons} 뉴런</span>
                          </div>
                          <div className="text-sm text-blue-700">
                            활성화: {layer.activation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 다차원 분석 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">다차원 분석</h3>
                <p className="text-sm text-gray-600 mt-1">시공간, 인과관계, 확률적 차원 분석</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">분석 차원</h4>
                    <div className="space-y-3">
                      {advancedStatus?.dimensional?.dimensions?.map((dimension: string, index: number) => (
                        <div key={dimension} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${index === advancedStatus?.dimensional?.currentDimension ? 'bg-green-500' : 'bg-gray-300'
                              }`} />
                            <span className="font-medium text-gray-900 capitalize">{dimension}</span>
                          </div>
                          <span className="text-sm text-gray-600">
                            {index < advancedStatus?.dimensional?.analysisDepth ? '완료' : '대기'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">분석 인사이트</h4>
                    <div className="space-y-2">
                      {advancedStatus?.dimensional?.insights?.map((insight: any, index: number) => (
                        <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-green-900 capitalize">{insight.dimension}</span>
                            <span className="text-sm text-green-600">
                              {insight.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-sm text-green-700">
                            {Object.keys(insight.insights).length}개 인사이트 생성
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 창의적 진화 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">창의적 진화</h3>
                <p className="text-sm text-gray-600 mt-1">창의성, 혁신, 예술적 능력의 진화</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <Star className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-orange-600">
                      {advancedStatus?.creative?.creativityLevel || 0}%
                    </p>
                    <p className="text-sm text-orange-600">창의성 수준</p>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <Lightbulb className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">
                      {advancedStatus?.creative?.innovationIndex || 0}%
                    </p>
                    <p className="text-sm text-purple-600">혁신 지수</p>
                  </div>

                  <div className="text-center p-4 bg-pink-50 rounded-lg border border-pink-200">
                    <Palette className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-pink-600">
                      {advancedStatus?.creative?.artisticCapability || 0}%
                    </p>
                    <p className="text-sm text-pink-600">예술적 능력</p>
                  </div>

                  <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <Target className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-indigo-600">
                      {advancedStatus?.creative?.problemSolvingCreativity || 0}%
                    </p>
                    <p className="text-sm text-indigo-600">창의적 문제 해결</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 기존 탭들... */}
        {activeTab === 'meta_learning' && (
          <motion.div
            key="meta_learning"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">메타 학습 현황</h3>
                <p className="text-sm text-gray-600 mt-1">학습 방법을 학습하는 능력</p>
              </div>
              <div className="p-6">
                <p className="text-gray-600">메타 학습 기능이 구현되었습니다.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 나머지 탭들도 유사하게 구현... */}
      </AnimatePresence>
    </div>
  );
};

export default SelfEvolutionDashboard;
