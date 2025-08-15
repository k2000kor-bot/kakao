import React, { useState, useEffect } from 'react';
import {
  CpuChipIcon,
  AcademicCapIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChartBarIcon,
  LightBulbIcon,
  DocumentTextIcon,
  CogIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { ProjectFile } from '../types/project';

interface DeepLearningModel {
  id: string;
  name: string;
  type: 'text-classification' | 'sentiment-analysis' | 'entity-extraction' | 'summarization' | 'custom';
  status: 'idle' | 'training' | 'completed' | 'failed';
  progress: number;
  accuracy: number;
  loss: number;
  epochs: number;
  currentEpoch: number;
  trainingFiles: string[];
  createdAt: string;
  updatedAt: string;
  modelPath?: string;
  config: {
    learningRate: number;
    batchSize: number;
    maxEpochs: number;
    validationSplit: number;
  };
}

interface TrainingSession {
  id: string;
  modelId: string;
  status: 'preparing' | 'training' | 'validating' | 'completed' | 'failed';
  progress: number;
  currentEpoch: number;
  totalEpochs: number;
  accuracy: number;
  loss: number;
  validationAccuracy: number;
  validationLoss: number;
  startTime: string;
  endTime?: string;
  logs: Array<{
    timestamp: string;
    level: 'info' | 'warning' | 'error';
    message: string;
  }>;
}

interface DeepLearningManagerProps {
  projectId: string;
  files: ProjectFile[];
}

const DeepLearningManager: React.FC<DeepLearningManagerProps> = ({
  projectId,
  files
}) => {
  const [models, setModels] = useState<DeepLearningModel[]>([]);
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [selectedModel, setSelectedModel] = useState<DeepLearningModel | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'models' | 'training' | 'deployment'>('models');

  // 새 모델 생성 상태
  const [newModel, setNewModel] = useState({
    name: '',
    type: 'text-classification' as const,
    learningRate: 0.001,
    batchSize: 32,
    maxEpochs: 100,
    validationSplit: 0.2
  });

  // 시뮬레이션된 모델 데이터
  useEffect(() => {
    const mockModels: DeepLearningModel[] = [
      {
        id: 'model_1',
        name: '텍스트 분류 모델',
        type: 'text-classification',
        status: 'completed',
        progress: 100,
        accuracy: 0.94,
        loss: 0.12,
        epochs: 50,
        currentEpoch: 50,
        trainingFiles: ['document1.pdf', 'document2.pdf'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        updatedAt: new Date().toISOString(),
        config: {
          learningRate: 0.001,
          batchSize: 32,
          maxEpochs: 50,
          validationSplit: 0.2
        }
      },
      {
        id: 'model_2',
        name: '감정 분석 모델',
        type: 'sentiment-analysis',
        status: 'training',
        progress: 65,
        accuracy: 0.87,
        loss: 0.23,
        epochs: 100,
        currentEpoch: 65,
        trainingFiles: ['presentation.pptx', 'data.xlsx'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        updatedAt: new Date().toISOString(),
        config: {
          learningRate: 0.0005,
          batchSize: 16,
          maxEpochs: 100,
          validationSplit: 0.3
        }
      }
    ];
    setModels(mockModels);
  }, []);

  const getModelTypeLabel = (type: string) => {
    const labels = {
      'text-classification': '텍스트 분류',
      'sentiment-analysis': '감정 분석',
      'entity-extraction': '개체 추출',
      'summarization': '요약 생성',
      'custom': '커스텀 모델'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'training':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'training':
        return <CpuChipIcon className="w-4 h-4 animate-pulse" />;
      case 'failed':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const handleCreateModel = () => {
    const model: DeepLearningModel = {
      id: `model_${Date.now()}`,
      name: newModel.name,
      type: newModel.type,
      status: 'idle',
      progress: 0,
      accuracy: 0,
      loss: 0,
      epochs: newModel.maxEpochs,
      currentEpoch: 0,
      trainingFiles: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      config: {
        learningRate: newModel.learningRate,
        batchSize: newModel.batchSize,
        maxEpochs: newModel.maxEpochs,
        validationSplit: newModel.validationSplit
      }
    };

    setModels(prev => [...prev, model]);
    setShowCreateModal(false);
    setNewModel({
      name: '',
      type: 'text-classification',
      learningRate: 0.001,
      batchSize: 32,
      maxEpochs: 100,
      validationSplit: 0.2
    });
  };

  const handleStartTraining = (modelId: string) => {
    const session: TrainingSession = {
      id: `session_${Date.now()}`,
      modelId,
      status: 'preparing',
      progress: 0,
      currentEpoch: 0,
      totalEpochs: models.find(m => m.id === modelId)?.config.maxEpochs || 100,
      accuracy: 0,
      loss: 0,
      validationAccuracy: 0,
      validationLoss: 0,
      startTime: new Date().toISOString(),
      logs: []
    };

    setTrainingSessions(prev => [...prev, session]);
    setShowTrainingModal(true);

    // 시뮬레이션된 훈련 진행
    simulateTraining(session.id);
  };

  const simulateTraining = (sessionId: string) => {
    const interval = setInterval(() => {
      setTrainingSessions(prev => {
        const session = prev.find(s => s.id === sessionId);
        if (!session) return prev;

        const updatedSession = { ...session };

        if (updatedSession.status === 'preparing') {
          updatedSession.status = 'training';
          updatedSession.progress = 10;
        } else if (updatedSession.status === 'training') {
          updatedSession.currentEpoch += 1;
          updatedSession.progress = (updatedSession.currentEpoch / updatedSession.totalEpochs) * 100;
          updatedSession.accuracy = Math.min(0.95, 0.5 + (updatedSession.currentEpoch / updatedSession.totalEpochs) * 0.45);
          updatedSession.loss = Math.max(0.05, 1.0 - (updatedSession.currentEpoch / updatedSession.totalEpochs) * 0.95);

          if (updatedSession.currentEpoch >= updatedSession.totalEpochs) {
            updatedSession.status = 'completed';
            updatedSession.progress = 100;
            updatedSession.endTime = new Date().toISOString();
          }
        }

        return prev.map(s => s.id === sessionId ? updatedSession : s);
      });

      setModels(prev => {
        return prev.map(model => {
          const session = trainingSessions.find(s => s.modelId === model.id);
          if (session) {
            return {
              ...model,
              status: session.status === 'completed' ? 'completed' : 'training',
              progress: session.progress,
              accuracy: session.accuracy,
              loss: session.loss,
              currentEpoch: session.currentEpoch
            };
          }
          return model;
        });
      });
    }, 1000);

    // 10초 후 정리
    setTimeout(() => {
      clearInterval(interval);
    }, 10000);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">딥러닝 모델 관리</h3>
          <p className="text-sm text-gray-500">AI 모델 훈련 및 배포</p>
        </div>
                 <button
           onClick={() => setShowCreateModal(true)}
           className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
         >
           <AcademicCapIcon className="w-4 h-4" />
           <span>새 모델 생성</span>
         </button>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
                     {[
             { id: 'models', name: '모델', icon: AcademicCapIcon },
             { id: 'training', name: '훈련', icon: CpuChipIcon },
             { id: 'deployment', name: '배포', icon: CogIcon }
           ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
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

      {/* 모델 탭 */}
      {activeTab === 'models' && (
        <div className="space-y-4">
          {models.map((model) => (
            <div key={model.id} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                               <div className="flex items-center space-x-3">
                 <AcademicCapIcon className="w-8 h-8 text-blue-500" />
                 <div>
                   <h4 className="text-lg font-semibold text-gray-900">{model.name}</h4>
                   <p className="text-sm text-gray-500">{getModelTypeLabel(model.type)}</p>
                 </div>
               </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(model.status)}`}>
                    {model.status === 'completed' ? '완료' :
                      model.status === 'training' ? '훈련 중' :
                        model.status === 'failed' ? '실패' : '대기'}
                  </span>
                  {getStatusIcon(model.status)}
                </div>
              </div>

              {model.status === 'training' && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">훈련 진행률</span>
                    <span className="text-sm font-medium text-gray-900">{model.progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${model.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                    <span>Epoch: {model.currentEpoch}/{model.epochs}</span>
                    <span>정확도: {(model.accuracy * 100).toFixed(1)}%</span>
                    <span>손실: {model.loss.toFixed(3)}</span>
                  </div>
                </div>
              )}

              {model.status === 'completed' && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{(model.accuracy * 100).toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">정확도</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{model.epochs}</p>
                    <p className="text-sm text-gray-600">Epochs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{model.loss.toFixed(3)}</p>
                    <p className="text-sm text-gray-600">손실</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  생성: {new Date(model.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center space-x-2">
                  {model.status === 'idle' && (
                    <button
                      onClick={() => handleStartTraining(model.id)}
                      className="flex items-center space-x-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                    >
                      <PlayIcon className="w-4 h-4" />
                      <span>훈련 시작</span>
                    </button>
                  )}
                  <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
                    배포
                  </button>
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                    상세보기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 훈련 탭 */}
      {activeTab === 'training' && (
        <div className="space-y-4">
          {trainingSessions.map((session) => (
            <div key={session.id} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    훈련 세션 {session.id.slice(-8)}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {new Date(session.startTime).toLocaleString()}
                  </p>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(session.status)}`}>
                  {session.status === 'completed' ? '완료' :
                    session.status === 'training' ? '훈련 중' :
                      session.status === 'preparing' ? '준비 중' : '실패'}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">진행률</span>
                  <span className="text-sm font-medium text-gray-900">{session.progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${session.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Epoch</p>
                  <p className="font-medium">{session.currentEpoch}/{session.totalEpochs}</p>
                </div>
                <div>
                  <p className="text-gray-600">정확도</p>
                  <p className="font-medium">{(session.accuracy * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-gray-600">손실</p>
                  <p className="font-medium">{session.loss.toFixed(3)}</p>
                </div>
                <div>
                  <p className="text-gray-600">검증 정확도</p>
                  <p className="font-medium">{(session.validationAccuracy * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 배포 탭 */}
      {activeTab === 'deployment' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">배포된 모델</h4>
            <div className="text-center py-8 text-gray-500">
              <CogIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>배포된 모델이 없습니다</p>
            </div>
          </div>
        </div>
      )}

      {/* 새 모델 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">새 모델 생성</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">모델 이름</label>
                <input
                  type="text"
                  value={newModel.name}
                  onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="모델 이름을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">모델 타입</label>
                <select
                  value={newModel.type}
                  onChange={(e) => setNewModel({ ...newModel, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="text-classification">텍스트 분류</option>
                  <option value="sentiment-analysis">감정 분석</option>
                  <option value="entity-extraction">개체 추출</option>
                  <option value="summarization">요약 생성</option>
                  <option value="custom">커스텀 모델</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">학습률</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newModel.learningRate}
                    onChange={(e) => setNewModel({ ...newModel, learningRate: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">배치 크기</label>
                  <input
                    type="number"
                    value={newModel.batchSize}
                    onChange={(e) => setNewModel({ ...newModel, batchSize: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">최대 Epochs</label>
                  <input
                    type="number"
                    value={newModel.maxEpochs}
                    onChange={(e) => setNewModel({ ...newModel, maxEpochs: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">검증 분할</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newModel.validationSplit}
                    onChange={(e) => setNewModel({ ...newModel, validationSplit: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  취소
                </button>
                <button
                  onClick={handleCreateModel}
                  disabled={!newModel.name.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  생성
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeepLearningManager;
