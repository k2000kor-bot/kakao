import React, { useState, useEffect, useRef } from 'react';
import {
  CogIcon,
  CpuChipIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  LightBulbIcon,
  SparklesIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  BeakerIcon,
  DocumentTextIcon,
  EyeIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface LearningTask {
  id: string;
  name: string;
  type: 'text_analysis' | 'image_recognition' | 'document_processing' | 'knowledge_extraction' | 'pattern_detection';
  status: 'idle' | 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  startTime: Date;
  endTime?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: number; // minutes
  actualDuration?: number;
  accuracy: number;
  confidence: number;
  datasetSize: number;
  processedItems: number;
  errors: number;
  insights: string[];
  performance: {
    precision: number;
    recall: number;
    f1Score: number;
    processingSpeed: number;
  };
}

interface AutoLearningConfig {
  enabled: boolean;
  maxConcurrentTasks: number;
  autoRetrainThreshold: number;
  performanceMonitoring: boolean;
  adaptiveLearning: boolean;
  knowledgeTransfer: boolean;
  continuousImprovement: boolean;
  errorHandling: 'retry' | 'skip' | 'abort';
  dataValidation: boolean;
  modelVersioning: boolean;
}

interface LearningInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'trend' | 'correlation' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  timestamp: Date;
  relatedTasks: string[];
  actionable: boolean;
  recommendations: string[];
}

interface AutoLearningSystemProps {
  projectId: string;
  onTaskComplete?: (task: LearningTask) => void;
  onInsightGenerated?: (insight: LearningInsight) => void;
}

const AutoLearningSystem: React.FC<AutoLearningSystemProps> = ({
  projectId,
  onTaskComplete,
  onInsightGenerated
}) => {
  const [tasks, setTasks] = useState<LearningTask[]>([]);
  const [insights, setInsights] = useState<LearningInsight[]>([]);
  const [config, setConfig] = useState<AutoLearningConfig>({
    enabled: true,
    maxConcurrentTasks: 3,
    autoRetrainThreshold: 0.85,
    performanceMonitoring: true,
    adaptiveLearning: true,
    knowledgeTransfer: true,
    continuousImprovement: true,
    errorHandling: 'retry',
    dataValidation: true,
    modelVersioning: true
  });
  const [activeTasks, setActiveTasks] = useState<LearningTask[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<any>(null);
  const [learningProgress, setLearningProgress] = useState<any>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<LearningTask | null>(null);

  const taskIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeTasks();
    startAutoLearning();
    startMetricsMonitoring();
    return () => {
      if (taskIntervalRef.current) clearInterval(taskIntervalRef.current);
      if (metricsIntervalRef.current) clearInterval(metricsIntervalRef.current);
    };
  }, [projectId]);

  const initializeTasks = () => {
    const initialTasks: LearningTask[] = [
      {
        id: 'task_1',
        name: '문서 텍스트 분석 및 지식 추출',
        type: 'text_analysis',
        status: 'running',
        progress: 65,
        startTime: new Date(Date.now() - 30 * 60 * 1000),
        priority: 'high',
        estimatedDuration: 45,
        accuracy: 0.92,
        confidence: 0.88,
        datasetSize: 1500,
        processedItems: 975,
        errors: 3,
        insights: [
          '문서에서 주요 키워드 패턴 발견',
          '업계별 전문 용어 자동 인식',
          '문서 구조 분석 완료'
        ],
        performance: {
          precision: 0.91,
          recall: 0.89,
          f1Score: 0.90,
          processingSpeed: 25.5
        }
      },
      {
        id: 'task_2',
        name: '이미지 인식 및 객체 탐지',
        type: 'image_recognition',
        status: 'idle',
        progress: 0,
        startTime: new Date(),
        priority: 'medium',
        estimatedDuration: 30,
        accuracy: 0.0,
        confidence: 0.0,
        datasetSize: 800,
        processedItems: 0,
        errors: 0,
        insights: [],
        performance: {
          precision: 0.0,
          recall: 0.0,
          f1Score: 0.0,
          processingSpeed: 0.0
        }
      },
      {
        id: 'task_3',
        name: '패턴 감지 및 예측 모델링',
        type: 'pattern_detection',
        status: 'completed',
        progress: 100,
        startTime: new Date(Date.now() - 60 * 60 * 1000),
        endTime: new Date(Date.now() - 15 * 60 * 1000),
        priority: 'critical',
        estimatedDuration: 60,
        actualDuration: 45,
        accuracy: 0.95,
        confidence: 0.93,
        datasetSize: 2000,
        processedItems: 2000,
        errors: 1,
        insights: [
          '시계열 데이터에서 주기적 패턴 발견',
          '이상치 탐지 알고리즘 최적화',
          '예측 정확도 95% 달성'
        ],
        performance: {
          precision: 0.94,
          recall: 0.93,
          f1Score: 0.935,
          processingSpeed: 18.2
        }
      }
    ];
    setTasks(initialTasks);
    setActiveTasks(initialTasks.filter(t => t.status === 'running'));
  };

  const startAutoLearning = () => {
    if (!config.enabled) return;

    taskIntervalRef.current = setInterval(() => {
      setTasks(prev => prev.map(task => {
        if (task.status === 'running') {
          const newProgress = Math.min(task.progress + Math.random() * 3, 100);
          const newProcessedItems = Math.floor((newProgress / 100) * task.datasetSize);
          
          const updatedTask = {
            ...task,
            progress: newProgress,
            processedItems: newProcessedItems,
            accuracy: task.accuracy + (Math.random() - 0.5) * 0.02,
            confidence: task.confidence + (Math.random() - 0.5) * 0.01
          };

          if (newProgress >= 100) {
            updatedTask.status = 'completed';
            updatedTask.endTime = new Date();
            updatedTask.actualDuration = Math.floor((updatedTask.endTime.getTime() - updatedTask.startTime.getTime()) / (1000 * 60));
            onTaskComplete?.(updatedTask);
            
            // 인사이트 생성
            generateInsight(updatedTask);
          }

          return updatedTask;
        }
        return task;
      }));
    }, 2000);
  };

  const startMetricsMonitoring = () => {
    metricsIntervalRef.current = setInterval(() => {
      setSystemMetrics({
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        activeTasks: activeTasks.length,
        totalProcessed: tasks.reduce((sum, t) => sum + t.processedItems, 0),
        averageAccuracy: tasks.length > 0 ? tasks.reduce((sum, t) => sum + t.accuracy, 0) / tasks.length : 0,
        errorRate: tasks.length > 0 ? tasks.reduce((sum, t) => sum + t.errors, 0) / tasks.reduce((sum, t) => sum + t.processedItems, 1) : 0
      });

      setLearningProgress({
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        runningTasks: tasks.filter(t => t.status === 'running').length,
        averageProgress: tasks.length > 0 ? tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length : 0,
        totalInsights: insights.length,
        newInsightsToday: insights.filter(i => i.timestamp.getDate() === new Date().getDate()).length
      });
    }, 3000);
  };

  const generateInsight = (task: LearningTask) => {
    const insightTypes: Array<'pattern' | 'anomaly' | 'trend' | 'correlation' | 'prediction'> = [
      'pattern', 'anomaly', 'trend', 'correlation', 'prediction'
    ];
    
    const newInsight: LearningInsight = {
      id: `insight_${Date.now()}`,
      type: insightTypes[Math.floor(Math.random() * insightTypes.length)],
      title: `${task.name}에서 새로운 패턴 발견`,
      description: `학습 과정에서 ${task.processedItems}개 항목을 분석하여 새로운 인사이트를 발견했습니다.`,
      confidence: task.confidence,
      impact: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
      timestamp: new Date(),
      relatedTasks: [task.id],
      actionable: Math.random() > 0.3,
      recommendations: [
        '이 패턴을 활용하여 모델 성능을 향상시킬 수 있습니다.',
        '추가 데이터 수집을 통해 정확도를 높일 수 있습니다.',
        '이 인사이트를 다른 프로젝트에 적용해보세요.'
      ]
    };

    setInsights(prev => [...prev, newInsight]);
    onInsightGenerated?.(newInsight);
  };

  const startTask = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: 'running', startTime: new Date() } : t
    ));
    setActiveTasks(prev => [...prev, tasks.find(t => t.id === taskId)!]);
  };

  const pauseTask = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: 'paused' } : t
    ));
    setActiveTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const stopTask = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: 'failed', endTime: new Date() } : t
    ));
    setActiveTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'text_analysis': return <DocumentTextIcon className="w-5 h-5" />;
      case 'image_recognition': return <EyeIcon className="w-5 h-5" />;
      case 'document_processing': return <DocumentTextIcon className="w-5 h-5" />;
      case 'knowledge_extraction': return <CogIcon className="w-5 h-5" />;
      case 'pattern_detection': return <MagnifyingGlassIcon className="w-5 h-5" />;
      default: return <CogIcon className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'paused': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">자동화 학습 시스템</h3>
          <p className="text-sm text-gray-600">지능형 작업 스케줄링 및 자동 최적화</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <CogIcon className="w-4 h-4" />
            <span>설정</span>
          </button>
          <button
            onClick={() => initializeTasks()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>새로고침</span>
          </button>
        </div>
      </div>

      {/* 시스템 메트릭 */}
      {systemMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <CpuChipIcon className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-700">CPU 사용률</h4>
                <p className="text-2xl font-bold text-blue-600">{systemMetrics.cpuUsage.toFixed(1)}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <CogIcon className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-700">메모리 사용률</h4>
                <p className="text-2xl font-bold text-green-600">{systemMetrics.memoryUsage.toFixed(1)}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <ArrowTrendingUpIcon className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-700">평균 정확도</h4>
                <p className="text-2xl font-bold text-purple-600">{(systemMetrics.averageAccuracy * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <AcademicCapIcon className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-700">활성 작업</h4>
                <p className="text-2xl font-bold text-yellow-600">{systemMetrics.activeTasks}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 학습 진행 상황 */}
      {learningProgress && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">학습 진행 상황</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{learningProgress.totalTasks}</p>
              <p className="text-sm text-gray-600">총 작업</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{learningProgress.completedTasks}</p>
              <p className="text-sm text-gray-600">완료된 작업</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{learningProgress.runningTasks}</p>
              <p className="text-sm text-gray-600">실행 중</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{learningProgress.totalInsights}</p>
              <p className="text-sm text-gray-600">생성된 인사이트</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>전체 진행률</span>
              <span>{learningProgress.averageProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${learningProgress.averageProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* 학습 작업 목록 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h4 className="text-lg font-semibold text-gray-900">학습 작업</h4>
          <p className="text-sm text-gray-600">자동화된 AI 학습 작업 관리</p>
        </div>
        <div className="divide-y">
          {tasks.map((task) => (
            <div key={task.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getTaskTypeIcon(task.type)}
                  <div>
                    <h5 className="font-medium text-gray-900">{task.name}</h5>
                    <p className="text-sm text-gray-500">
                      정확도: {(task.accuracy * 100).toFixed(1)}% | 신뢰도: {(task.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)} bg-gray-100`}>
                    {task.status}
                  </span>
                  {task.status === 'idle' && (
                    <button
                      onClick={() => startTask(task.id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      <PlayIcon className="w-4 h-4" />
                      <span>시작</span>
                    </button>
                  )}
                  {task.status === 'running' && (
                    <button
                      onClick={() => pauseTask(task.id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                    >
                      <PauseIcon className="w-4 h-4" />
                      <span>일시정지</span>
                    </button>
                  )}
                  {task.status === 'running' && (
                    <button
                      onClick={() => stopTask(task.id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      <StopIcon className="w-4 h-4" />
                      <span>중지</span>
                    </button>
                  )}
                </div>
              </div>
              
              {/* 진행률 바 */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>진행률</span>
                  <span>{task.progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${task.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* 작업 상세 정보 */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">처리된 항목</p>
                  <p className="font-medium">{task.processedItems}/{task.datasetSize}</p>
                </div>
                <div>
                  <p className="text-gray-500">예상 시간</p>
                  <p className="font-medium">{task.estimatedDuration}분</p>
                </div>
                <div>
                  <p className="text-gray-500">오류 수</p>
                  <p className="font-medium">{task.errors}</p>
                </div>
                <div>
                  <p className="text-gray-500">F1 점수</p>
                  <p className="font-medium">{(task.performance.f1Score * 100).toFixed(1)}%</p>
                </div>
              </div>

              {/* 인사이트 표시 */}
              {task.insights.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">발견된 인사이트:</p>
                  <div className="space-y-1">
                    {task.insights.map((insight, index) => (
                      <p key={index} className="text-sm text-gray-600">• {insight}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 자동화 설정 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">자동화 설정</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm">자동화 학습 활성화</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.performanceMonitoring}
                onChange={(e) => setConfig(prev => ({ ...prev, performanceMonitoring: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm">성능 모니터링</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.adaptiveLearning}
                onChange={(e) => setConfig(prev => ({ ...prev, adaptiveLearning: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm">적응형 학습</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.knowledgeTransfer}
                onChange={(e) => setConfig(prev => ({ ...prev, knowledgeTransfer: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm">지식 전이</span>
            </label>
          </div>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.continuousImprovement}
                onChange={(e) => setConfig(prev => ({ ...prev, continuousImprovement: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm">지속적 개선</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.dataValidation}
                onChange={(e) => setConfig(prev => ({ ...prev, dataValidation: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm">데이터 검증</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.modelVersioning}
                onChange={(e) => setConfig(prev => ({ ...prev, modelVersioning: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm">모델 버전 관리</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">최대 동시 작업</label>
              <input
                type="number"
                value={config.maxConcurrentTasks}
                onChange={(e) => setConfig(prev => ({ ...prev, maxConcurrentTasks: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 생성된 인사이트 */}
      {insights.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">생성된 인사이트</h4>
          <div className="space-y-4">
            {insights.slice(-5).map((insight) => (
              <div key={insight.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900">{insight.title}</h5>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    insight.impact === 'high' ? 'text-red-600 bg-red-100' :
                    insight.impact === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                    'text-green-600 bg-green-100'
                  }`}>
                    {insight.impact} impact
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>신뢰도: {(insight.confidence * 100).toFixed(1)}%</span>
                  <span>{insight.timestamp.toLocaleString()}</span>
                </div>
                {insight.actionable && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">권장사항:</p>
                    <div className="space-y-1">
                      {insight.recommendations.map((rec, index) => (
                        <p key={index} className="text-sm text-gray-600">• {rec}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoLearningSystem;
