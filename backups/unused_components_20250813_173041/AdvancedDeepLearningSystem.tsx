import React, { useState, useEffect, useRef } from 'react';
import {
  CpuChipIcon,
  CogIcon,
  ChartBarIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  LightBulbIcon,
  SparklesIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  BeakerIcon,
  AcademicCapIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface DeepLearningModel {
  id: string;
  name: string;
  type: 'neural_network' | 'transformer' | 'cnn' | 'rnn' | 'lstm' | 'bert' | 'gpt';
  status: 'idle' | 'training' | 'evaluating' | 'deployed' | 'error';
  accuracy: number;
  loss: number;
  epochs: number;
  currentEpoch: number;
  learningRate: number;
  batchSize: number;
  datasetSize: number;
  lastUpdated: Date;
  performance: {
    precision: number;
    recall: number;
    f1Score: number;
    confusionMatrix: number[][];
  };
}

interface TrainingSession {
  id: string;
  modelId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  currentEpoch: number;
  totalEpochs: number;
  metrics: {
    trainLoss: number[];
    valLoss: number[];
    trainAccuracy: number[];
    valAccuracy: number[];
  };
  logs: string[];
}

interface AutoLearningConfig {
  enabled: boolean;
  autoRetrain: boolean;
  performanceThreshold: number;
  dataDriftDetection: boolean;
  adaptiveLearningRate: boolean;
  earlyStopping: boolean;
  modelEnsemble: boolean;
  hyperparameterOptimization: boolean;
}

interface AdvancedDeepLearningSystemProps {
  projectId: string;
  onModelUpdate?: (model: DeepLearningModel) => void;
  onTrainingComplete?: (session: TrainingSession) => void;
}

const AdvancedDeepLearningSystem: React.FC<AdvancedDeepLearningSystemProps> = ({
  projectId,
  onModelUpdate,
  onTrainingComplete
}) => {
  const [models, setModels] = useState<DeepLearningModel[]>([]);
  const [activeSessions, setActiveSessions] = useState<TrainingSession[]>([]);
  const [config, setConfig] = useState<AutoLearningConfig>({
    enabled: true,
    autoRetrain: true,
    performanceThreshold: 0.85,
    dataDriftDetection: true,
    adaptiveLearningRate: true,
    earlyStopping: true,
    modelEnsemble: false,
    hyperparameterOptimization: true
  });
  const [selectedModel, setSelectedModel] = useState<DeepLearningModel | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null);
  const [performanceHistory, setPerformanceHistory] = useState<any[]>([]);
  const [dataDriftAlerts, setDataDriftAlerts] = useState<any[]>([]);
  const [modelComparison, setModelComparison] = useState<any[]>([]);

  const trainingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeModels();
    startRealTimeMonitoring();
    return () => {
      if (trainingIntervalRef.current) clearInterval(trainingIntervalRef.current);
      if (metricsIntervalRef.current) clearInterval(metricsIntervalRef.current);
    };
  }, [projectId]);

  const initializeModels = () => {
    const initialModels: DeepLearningModel[] = [
      {
        id: 'model_1',
        name: 'BERT 기반 텍스트 분석 모델',
        type: 'bert',
        status: 'idle',
        accuracy: 0.92,
        loss: 0.08,
        epochs: 100,
        currentEpoch: 0,
        learningRate: 0.001,
        batchSize: 32,
        datasetSize: 10000,
        lastUpdated: new Date(),
        performance: {
          precision: 0.91,
          recall: 0.89,
          f1Score: 0.90,
          confusionMatrix: [[850, 50], [60, 1040]]
        }
      },
      {
        id: 'model_2',
        name: 'CNN 기반 이미지 분석 모델',
        type: 'cnn',
        status: 'training',
        accuracy: 0.88,
        loss: 0.12,
        epochs: 50,
        currentEpoch: 25,
        learningRate: 0.0001,
        batchSize: 64,
        datasetSize: 5000,
        lastUpdated: new Date(),
        performance: {
          precision: 0.87,
          recall: 0.85,
          f1Score: 0.86,
          confusionMatrix: [[420, 30], [45, 505]]
        }
      },
      {
        id: 'model_3',
        name: 'Transformer 기반 멀티모달 모델',
        type: 'transformer',
        status: 'deployed',
        accuracy: 0.95,
        loss: 0.05,
        epochs: 200,
        currentEpoch: 200,
        learningRate: 0.0005,
        batchSize: 16,
        datasetSize: 15000,
        lastUpdated: new Date(),
        performance: {
          precision: 0.94,
          recall: 0.93,
          f1Score: 0.935,
          confusionMatrix: [[1420, 30], [35, 1515]]
        }
      }
    ];
    setModels(initialModels);
  };

  const startRealTimeMonitoring = () => {
    // 실시간 메트릭 업데이트
    metricsIntervalRef.current = setInterval(() => {
      setRealTimeMetrics({
        gpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        trainingSpeed: Math.random() * 1000,
        inferenceLatency: Math.random() * 100
      });

      // 성능 히스토리 업데이트
      setPerformanceHistory(prev => [...prev.slice(-50), {
        timestamp: new Date(),
        accuracy: 0.85 + Math.random() * 0.1,
        loss: 0.05 + Math.random() * 0.1,
        learningRate: 0.001
      }]);
    }, 2000);

    // 데이터 드리프트 감지
    if (config.dataDriftDetection) {
      setInterval(() => {
        const driftScore = Math.random();
        if (driftScore > 0.8) {
          setDataDriftAlerts(prev => [...prev, {
            id: Date.now(),
            type: 'data_drift',
            severity: 'high',
            message: '데이터 분포 변화 감지됨',
            timestamp: new Date(),
            score: driftScore
          }]);
        }
      }, 10000);
    }
  };

  const startTraining = async (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    if (!model) return;

    setIsTraining(true);
    const session: TrainingSession = {
      id: `session_${Date.now()}`,
      modelId,
      startTime: new Date(),
      status: 'running',
      progress: 0,
      currentEpoch: 0,
      totalEpochs: model.epochs,
      metrics: {
        trainLoss: [],
        valLoss: [],
        trainAccuracy: [],
        valAccuracy: []
      },
      logs: []
    };

    setActiveSessions(prev => [...prev, session]);

    // 시뮬레이션된 학습 과정
    trainingIntervalRef.current = setInterval(() => {
      setActiveSessions(prev => prev.map(s => {
        if (s.id === session.id && s.status === 'running') {
          const newProgress = Math.min(s.progress + Math.random() * 5, 100);
          const newEpoch = Math.floor((newProgress / 100) * s.totalEpochs);
          
          const updatedSession = {
            ...s,
            progress: newProgress,
            currentEpoch: newEpoch,
            metrics: {
              ...s.metrics,
              trainLoss: [...s.metrics.trainLoss, 0.1 + Math.random() * 0.2],
              valLoss: [...s.metrics.valLoss, 0.12 + Math.random() * 0.2],
              trainAccuracy: [...s.metrics.trainAccuracy, 0.8 + Math.random() * 0.15],
              valAccuracy: [...s.metrics.valAccuracy, 0.78 + Math.random() * 0.15]
            },
            logs: [...s.logs, `Epoch ${newEpoch}: Loss=${(0.1 + Math.random() * 0.2).toFixed(4)}`]
          };

          if (newProgress >= 100) {
            updatedSession.status = 'completed';
            updatedSession.endTime = new Date();
            onTrainingComplete?.(updatedSession);
            setIsTraining(false);
          }

          return updatedSession;
        }
        return s;
      }));
    }, 1000);
  };

  const stopTraining = (sessionId: string) => {
    setActiveSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, status: 'paused' } : s
    ));
    setIsTraining(false);
  };

  const deployModel = (modelId: string) => {
    setModels(prev => prev.map(m => 
      m.id === modelId ? { ...m, status: 'deployed' } : m
    ));
  };

  const getModelTypeIcon = (type: string) => {
    switch (type) {
      case 'bert': return <CogIcon className="w-5 h-5" />;
      case 'cnn': return <CpuChipIcon className="w-5 h-5" />;
      case 'transformer': return <SparklesIcon className="w-5 h-5" />;
      default: return <CogIcon className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'training': return 'text-blue-600';
      case 'deployed': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">고도화된 딥러닝 시스템</h3>
          <p className="text-sm text-gray-600">자동화된 학습 및 모델 최적화</p>
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
            onClick={() => initializeModels()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>새로고침</span>
          </button>
        </div>
      </div>

      {/* 실시간 메트릭 */}
      {realTimeMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <CpuChipIcon className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-700">GPU 사용률</h4>
                <p className="text-2xl font-bold text-blue-600">{realTimeMetrics.gpuUsage.toFixed(1)}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <CogIcon className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-700">메모리 사용률</h4>
                <p className="text-2xl font-bold text-green-600">{realTimeMetrics.memoryUsage.toFixed(1)}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <ArrowTrendingUpIcon className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-700">학습 속도</h4>
                <p className="text-2xl font-bold text-purple-600">{realTimeMetrics.trainingSpeed.toFixed(0)} samples/s</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <ClockIcon className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-700">추론 지연시간</h4>
                <p className="text-2xl font-bold text-yellow-600">{realTimeMetrics.inferenceLatency.toFixed(1)}ms</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 모델 목록 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h4 className="text-lg font-semibold text-gray-900">딥러닝 모델</h4>
          <p className="text-sm text-gray-600">프로젝트별 최적화된 AI 모델</p>
        </div>
        <div className="divide-y">
          {models.map((model) => (
            <div key={model.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getModelTypeIcon(model.type)}
                  <div>
                    <h5 className="font-medium text-gray-900">{model.name}</h5>
                    <p className="text-sm text-gray-500">정확도: {(model.accuracy * 100).toFixed(1)}% | 손실: {model.loss.toFixed(4)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(model.status)} bg-gray-100`}>
                    {model.status}
                  </span>
                  {model.status === 'idle' && (
                    <button
                      onClick={() => startTraining(model.id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      <PlayIcon className="w-4 h-4" />
                      <span>학습</span>
                    </button>
                  )}
                  {model.status === 'training' && (
                    <button
                      onClick={() => stopTraining(model.id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      <StopIcon className="w-4 h-4" />
                      <span>중지</span>
                    </button>
                  )}
                  {model.status === 'idle' && (
                    <button
                      onClick={() => deployModel(model.id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>배포</span>
                    </button>
                  )}
                </div>
              </div>
              
              {/* 모델 상세 정보 */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">학습률</p>
                  <p className="font-medium">{model.learningRate}</p>
                </div>
                <div>
                  <p className="text-gray-500">배치 크기</p>
                  <p className="font-medium">{model.batchSize}</p>
                </div>
                <div>
                  <p className="text-gray-500">데이터셋 크기</p>
                  <p className="font-medium">{model.datasetSize.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">F1 점수</p>
                  <p className="font-medium">{(model.performance.f1Score * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 활성 학습 세션 */}
      {activeSessions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h4 className="text-lg font-semibold text-gray-900">활성 학습 세션</h4>
          </div>
          <div className="divide-y">
            {activeSessions.map((session) => (
              <div key={session.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h5 className="font-medium text-gray-900">세션 {session.id.slice(-8)}</h5>
                    <p className="text-sm text-gray-500">
                      Epoch {session.currentEpoch}/{session.totalEpochs}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    session.status === 'running' ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'
                  }`}>
                    {session.status}
                  </span>
                </div>
                
                {/* 진행률 바 */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>진행률</span>
                    <span>{session.progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${session.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* 실시간 메트릭 */}
                {session.metrics.trainLoss.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">최근 손실</p>
                      <p className="font-medium">{session.metrics.trainLoss[session.metrics.trainLoss.length - 1].toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">최근 정확도</p>
                      <p className="font-medium">{(session.metrics.trainAccuracy[session.metrics.trainAccuracy.length - 1] * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 자동화 설정 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">자동화 학습 설정</h4>
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
                checked={config.autoRetrain}
                onChange={(e) => setConfig(prev => ({ ...prev, autoRetrain: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm">자동 재학습</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.dataDriftDetection}
                onChange={(e) => setConfig(prev => ({ ...prev, dataDriftDetection: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm">데이터 드리프트 감지</span>
            </label>
          </div>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.adaptiveLearningRate}
                onChange={(e) => setConfig(prev => ({ ...prev, adaptiveLearningRate: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm">적응형 학습률</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.earlyStopping}
                onChange={(e) => setConfig(prev => ({ ...prev, earlyStopping: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm">조기 종료</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.hyperparameterOptimization}
                onChange={(e) => setConfig(prev => ({ ...prev, hyperparameterOptimization: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm">하이퍼파라미터 최적화</span>
            </label>
          </div>
        </div>
      </div>

      {/* 데이터 드리프트 알림 */}
      {dataDriftAlerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">데이터 드리프트 알림</h4>
          <div className="space-y-2">
            {dataDriftAlerts.slice(-5).map((alert) => (
              <div key={alert.id} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">{alert.message}</p>
                  <p className="text-xs text-yellow-600">{alert.timestamp.toLocaleTimeString()}</p>
                </div>
                <span className="text-xs text-yellow-600">{(alert.score * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedDeepLearningSystem;
