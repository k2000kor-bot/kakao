import React, { useState, useEffect, useCallback } from 'react';
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
  XMarkIcon,
  BeakerIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  MicrophoneIcon,
  PhotoIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';

interface DeepLearningModel {
  id: string;
  name: string;
  type: 'vision_transformer' | 'swin_transformer' | 'efficientnet' | 'kobert' | 'kogpt' | 't5' | 'whisper' | 'wav2vec' | 'clip' | 'dalle' | 'gan' | 'vae' | 'ppo' | 'sac' | 'ensemble' | 'meta_learning';
  category: 'computer_vision' | 'nlp' | 'speech' | 'multimodal' | 'generative' | 'reinforcement' | 'advanced';
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
  features: string[];
  description: string;
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

const AdvancedDeepLearningHub: React.FC = () => {
  const [models, setModels] = useState<DeepLearningModel[]>([]);
  const [activeSessions, setActiveSessions] = useState<TrainingSession[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedModel, setSelectedModel] = useState<DeepLearningModel | null>(null);
  const [showModelDetails, setShowModelDetails] = useState(false);
  const [isTraining, setIsTraining] = useState(false);

  // 고도화된 딥러닝 모델 초기화
  const initializeAdvancedModels = useCallback(() => {
    const advancedModels: DeepLearningModel[] = [
      // Computer Vision Models
      {
        id: 'vit-001',
        name: 'Vision Transformer (ViT)',
        type: 'vision_transformer',
        category: 'computer_vision',
        status: 'idle',
        accuracy: 0.0,
        loss: 1.0,
        epochs: 100,
        currentEpoch: 0,
        learningRate: 0.001,
        batchSize: 32,
        datasetSize: 0,
        lastUpdated: new Date(),
        performance: { precision: 0, recall: 0, f1Score: 0, confusionMatrix: [] },
        features: ['고해상도 이미지 처리', '어텐션 시각화', '효율적 추론', '4K 이미지 지원'],
        description: 'Transformer 기반 고급 이미지 분류 모델'
      },
      {
        id: 'swin-001',
        name: 'Swin Transformer',
        type: 'swin_transformer',
        category: 'computer_vision',
        status: 'idle',
        accuracy: 0.0,
        loss: 1.0,
        epochs: 100,
        currentEpoch: 0,
        learningRate: 0.001,
        batchSize: 32,
        datasetSize: 0,
        lastUpdated: new Date(),
        performance: { precision: 0, recall: 0, f1Score: 0, confusionMatrix: [] },
        features: ['계층적 특징 추출', '윈도우 어텐션', '이동 윈도우', '점진적 다운샘플링'],
        description: '계층적 윈도우 기반 Transformer 모델'
      },
      {
        id: 'efficientnet-001',
        name: 'EfficientNet V2',
        type: 'efficientnet',
        category: 'computer_vision',
        status: 'idle',
        accuracy: 0.0,
        loss: 1.0,
        epochs: 100,
        currentEpoch: 0,
        learningRate: 0.001,
        batchSize: 32,
        datasetSize: 0,
        lastUpdated: new Date(),
        performance: { precision: 0, recall: 0, f1Score: 0, confusionMatrix: [] },
        features: ['퓨전 MBConv', '프로그레시브 학습', '자동화된 아키텍처 검색', '적응형 정규화'],
        description: '효율적인 CNN 아키텍처'
      },

      // NLP Models
      {
        id: 'kobert-001',
        name: 'KoBERT (Korean BERT)',
        type: 'kobert',
        category: 'nlp',
        status: 'idle',
        accuracy: 0.0,
        loss: 1.0,
        epochs: 100,
        currentEpoch: 0,
        learningRate: 0.0001,
        batchSize: 16,
        datasetSize: 0,
        lastUpdated: new Date(),
        performance: { precision: 0, recall: 0, f1Score: 0, confusionMatrix: [] },
        features: ['한국어 특화 토크나이저', '도메인 적응', '다중 태스크 학습', '지식 증류'],
        description: '한국어 특화 BERT 모델'
      },
      {
        id: 'kogpt-001',
        name: 'KoGPT (Korean GPT)',
        type: 'kogpt',
        category: 'nlp',
        status: 'idle',
        accuracy: 0.0,
        loss: 1.0,
        epochs: 100,
        currentEpoch: 0,
        learningRate: 0.0001,
        batchSize: 16,
        datasetSize: 0,
        lastUpdated: new Date(),
        performance: { precision: 0, recall: 0, f1Score: 0, confusionMatrix: [] },
        features: ['한국어 텍스트 생성', '대화형 AI', '창의적 텍스트 생성', '맥락 이해'],
        description: '한국어 특화 GPT 모델'
      },
      {
        id: 't5-001',
        name: 'T5 (Text-to-Text)',
        type: 't5',
        category: 'nlp',
        status: 'idle',
        accuracy: 0.0,
        loss: 1.0,
        epochs: 100,
        currentEpoch: 0,
        learningRate: 0.0001,
        batchSize: 16,
        datasetSize: 0,
        lastUpdated: new Date(),
        performance: { precision: 0, recall: 0, f1Score: 0, confusionMatrix: [] },
        features: ['통합 텍스트 처리', '다국어 지원', '제로샷 학습', '효율적 추론'],
        description: '통합 텍스트 처리 모델'
      },

      // Speech Models
      {
        id: 'whisper-001',
        name: 'Whisper (Speech Recognition)',
        type: 'whisper',
        category: 'speech',
        status: 'idle',
        accuracy: 0.0,
        loss: 1.0,
        epochs: 100,
        currentEpoch: 0,
        learningRate: 0.0001,
        batchSize: 16,
        datasetSize: 0,
        lastUpdated: new Date(),
        performance: { precision: 0, recall: 0, f1Score: 0, confusionMatrix: [] },
        features: ['다국어 음성 인식', '노이즈 제거', '화자 분리', '감정 음성 분석'],
        description: '고급 음성 인식 모델'
      },
      {
        id: 'wav2vec-001',
        name: 'Wav2Vec 2.0',
        type: 'wav2vec',
        category: 'speech',
        status: 'idle',
        accuracy: 0.0,
        loss: 1.0,
        epochs: 100,
        currentEpoch: 0,
        learningRate: 0.0001,
        batchSize: 16,
        datasetSize: 0,
        lastUpdated: new Date(),
        performance: { precision: 0, recall: 0, f1Score: 0, confusionMatrix: [] },
        features: ['자기지도 학습', '마스킹 예측', '양자화', '적응형 미세조정'],
        description: '자기지도 음성 학습 모델'
      },

      // Multimodal Models
      {
        id: 'clip-001',
        name: 'CLIP (Contrastive Learning)',
        type: 'clip',
        category: 'multimodal',
        status: 'idle',
        accuracy: 0.0,
        loss: 1.0,
        epochs: 100,
        currentEpoch: 0,
        learningRate: 0.0001,
        batchSize: 32,
        datasetSize: 0,
        lastUpdated: new Date(),
        performance: { precision: 0, recall: 0, f1Score: 0, confusionMatrix: [] },
        features: ['대조 학습', '제로샷 분류', '크로스모달 검색', '다국어 지원'],
        description: '이미지-텍스트 대조 학습 모델'
      },
      {
        id: 'dalle-001',
        name: 'DALL-E 2 (Image Generation)',
        type: 'dalle',
        category: 'multimodal',
        status: 'idle',
        accuracy: 0.0,
        loss: 1.0,
        epochs: 100,
        currentEpoch: 0,
        learningRate: 0.0001,
        batchSize: 16,
        datasetSize: 0,
        lastUpdated: new Date(),
        performance: { precision: 0, recall: 0, f1Score: 0, confusionMatrix: [] },
        features: ['고해상도 생성', '스타일 제어', '편집 기능', '다양성 제어'],
        description: '텍스트 기반 이미지 생성 모델'
      },

      // Generative Models
      {
        id: 'gan-001',
        name: 'StyleGAN2 (Generative)',
        type: 'gan',
        category: 'generative',
        status: 'idle',
        accuracy: 0.0,
        loss: 1.0,
        epochs: 100,
        currentEpoch: 0,
        learningRate: 0.0002,
        batchSize: 16,
        datasetSize: 0,
        lastUpdated: new Date(),
        performance: { precision: 0, recall: 0, f1Score: 0, confusionMatrix: [] },
        features: ['고품질 이미지 생성', 'Progressive Growing', '스타일 제어', '학습 안정성'],
        description: '고품질 이미지 생성 GAN'
      },
      {
        id: 'vae-001',
        name: 'β-VAE (Variational)',
        type: 'vae',
        category: 'generative',
        status: 'idle',
        accuracy: 0.0,
        loss: 1.0,
        epochs: 100,
        currentEpoch: 0,
        learningRate: 0.001,
        batchSize: 32,
        datasetSize: 0,
        lastUpdated: new Date(),
        performance: { precision: 0, recall: 0, f1Score: 0, confusionMatrix: [] },
        features: ['분해 가능한 잠재 표현', '조건부 생성', '분리된 특징 학습', '계층적 잠재 변수'],
        description: '분해 가능한 변분 오토인코더'
      },

      // Reinforcement Learning Models
      {
        id: 'ppo-001',
        name: 'PPO (Proximal Policy)',
        type: 'ppo',
        category: 'reinforcement',
        status: 'idle',
        accuracy: 0.0,
        loss: 1.0,
        epochs: 100,
        currentEpoch: 0,
        learningRate: 0.0003,
        batchSize: 64,
        datasetSize: 0,
        lastUpdated: new Date(),
        performance: { precision: 0, recall: 0, f1Score: 0, confusionMatrix: [] },
        features: ['안정적 학습', '효율적 샘플링', '적응형 하이퍼파라미터', '멀티 에이전트 학습'],
        description: '근위 정책 최적화 알고리즘'
      },
      {
        id: 'sac-001',
        name: 'SAC (Soft Actor-Critic)',
        type: 'sac',
        category: 'reinforcement',
        status: 'idle',
        accuracy: 0.0,
        loss: 1.0,
        epochs: 100,
        currentEpoch: 0,
        learningRate: 0.0003,
        batchSize: 64,
        datasetSize: 0,
        lastUpdated: new Date(),
        performance: { precision: 0, recall: 0, f1Score: 0, confusionMatrix: [] },
        features: ['최대 엔트로피 학습', '이중 Q-러닝', '자동 온도 조정', '연속 액션 공간'],
        description: '소프트 액터-크리틱 알고리즘'
      },

      // Advanced Models
      {
        id: 'ensemble-001',
        name: 'Dynamic Ensemble',
        type: 'ensemble',
        category: 'advanced',
        status: 'idle',
        accuracy: 0.0,
        loss: 1.0,
        epochs: 100,
        currentEpoch: 0,
        learningRate: 0.001,
        batchSize: 32,
        datasetSize: 0,
        lastUpdated: new Date(),
        performance: { precision: 0, recall: 0, f1Score: 0, confusionMatrix: [] },
        features: ['동적 앙상블', '다양성 보장', '메타러닝', '적응형 앙상블'],
        description: '동적 앙상블 학습 시스템'
      },
      {
        id: 'meta-001',
        name: 'MAML (Meta-Learning)',
        type: 'meta_learning',
        category: 'advanced',
        status: 'idle',
        accuracy: 0.0,
        loss: 1.0,
        epochs: 100,
        currentEpoch: 0,
        learningRate: 0.001,
        batchSize: 32,
        datasetSize: 0,
        lastUpdated: new Date(),
        performance: { precision: 0, recall: 0, f1Score: 0, confusionMatrix: [] },
        features: ['Few-shot Learning', 'Task Adaptation', 'Meta-optimization', 'Cross-domain Transfer'],
        description: '모델 불가지식 메타러닝'
      }
    ];

    setModels(advancedModels);
  }, []);

  useEffect(() => {
    initializeAdvancedModels();
  }, [initializeAdvancedModels]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'computer_vision':
        return <EyeIcon className="w-5 h-5" />;
      case 'nlp':
        return <DocumentTextIcon className="w-5 h-5" />;
      case 'speech':
        return <MicrophoneIcon className="w-5 h-5" />;
      case 'multimodal':
        return <PhotoIcon className="w-5 h-5" />;
      case 'generative':
        return <SparklesIcon className="w-5 h-5" />;
      case 'reinforcement':
        return <LightBulbIcon className="w-5 h-5" />;
      case 'advanced':
        return <BeakerIcon className="w-5 h-5" />;
      default:
        return <CpuChipIcon className="w-5 h-5" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'computer_vision':
        return '컴퓨터 비전';
      case 'nlp':
        return '자연어 처리';
      case 'speech':
        return '음성 처리';
      case 'multimodal':
        return '멀티모달';
      case 'generative':
        return '생성 모델';
      case 'reinforcement':
        return '강화학습';
      case 'advanced':
        return '고급 AI';
      default:
        return '전체';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle':
        return 'text-gray-500 bg-gray-100';
      case 'training':
        return 'text-blue-600 bg-blue-100';
      case 'evaluating':
        return 'text-yellow-600 bg-yellow-100';
      case 'deployed':
        return 'text-green-600 bg-green-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  const filteredModels = selectedCategory === 'all' 
    ? models 
    : models.filter(model => model.category === selectedCategory);

  const startTraining = async (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    if (!model) return;

    setIsTraining(true);
    
    // 모델 상태를 training으로 변경
    setModels(prev => prev.map(m => 
      m.id === modelId ? { ...m, status: 'training' } : m
    ));

    // 새로운 트레이닝 세션 생성
    const newSession: TrainingSession = {
      id: `session-${Date.now()}`,
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
      logs: [`${model.name} 학습 시작`]
    };

    setActiveSessions(prev => [...prev, newSession]);

    // 학습 시뮬레이션
    const trainingInterval = setInterval(() => {
      setActiveSessions(prev => prev.map(session => {
        if (session.modelId === modelId && session.status === 'running') {
          const newProgress = Math.min(session.progress + 1, 100);
          const newEpoch = Math.floor((newProgress / 100) * model.epochs);
          
          // 메트릭 시뮬레이션
          const trainLoss = 1.0 - (newProgress / 100) * 0.8;
          const valLoss = trainLoss + 0.1;
          const trainAccuracy = (newProgress / 100) * 0.95;
          const valAccuracy = trainAccuracy - 0.05;

          const updatedMetrics = {
            trainLoss: [...session.metrics.trainLoss, trainLoss],
            valLoss: [...session.metrics.valLoss, valLoss],
            trainAccuracy: [...session.metrics.trainAccuracy, trainAccuracy],
            valAccuracy: [...session.metrics.valAccuracy, valAccuracy]
          };

          if (newProgress === 100) {
            // 학습 완료
            setModels(prev => prev.map(m => 
              m.id === modelId ? { 
                ...m, 
                status: 'deployed', 
                accuracy: trainAccuracy,
                loss: trainLoss,
                currentEpoch: model.epochs,
                lastUpdated: new Date()
              } : m
            ));
            clearInterval(trainingInterval);
            setIsTraining(false);
            return { ...session, status: 'completed', progress: 100, currentEpoch: model.epochs, metrics: updatedMetrics };
          }

          return { 
            ...session, 
            progress: newProgress, 
            currentEpoch: newEpoch,
            metrics: updatedMetrics,
            logs: [...session.logs, `에포크 ${newEpoch}: 정확도 ${(trainAccuracy * 100).toFixed(1)}%`]
          };
        }
        return session;
      }));
    }, 100);
  };

  const stopTraining = (modelId: string) => {
    setModels(prev => prev.map(m => 
      m.id === modelId ? { ...m, status: 'idle' } : m
    ));
    setActiveSessions(prev => prev.map(session => 
      session.modelId === modelId ? { ...session, status: 'paused' } : session
    ));
    setIsTraining(false);
  };

  const deployModel = (modelId: string) => {
    setModels(prev => prev.map(m => 
      m.id === modelId ? { ...m, status: 'deployed' } : m
    ));
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <CpuChipIcon className="w-6 h-6 mr-2" />
          고도화된 딥러닝 허브
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          총 {models.length}개 모델 | {activeSessions.filter(s => s.status === 'running').length}개 학습 중
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {['all', 'computer_vision', 'nlp', 'speech', 'multimodal', 'generative', 'reinforcement', 'advanced'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium flex items-center ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {getCategoryIcon(category)}
              <span className="ml-2">{getCategoryName(category)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 모델 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModels.map(model => (
          <div
            key={model.id}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                {getCategoryIcon(model.category)}
                <h3 className="ml-2 font-semibold text-gray-900 dark:text-white">
                  {model.name}
                </h3>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(model.status)}`}>
                {model.status === 'idle' && '대기'}
                {model.status === 'training' && '학습중'}
                {model.status === 'evaluating' && '평가중'}
                {model.status === 'deployed' && '배포됨'}
                {model.status === 'error' && '오류'}
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {model.description}
            </p>

            <div className="space-y-2 mb-4">
              {model.features.slice(0, 2).map((feature, index) => (
                <div key={index} className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <CheckCircleIcon className="w-3 h-3 mr-1 text-green-500" />
                  {feature}
                </div>
              ))}
              {model.features.length > 2 && (
                <div className="text-xs text-gray-400">
                  +{model.features.length - 2}개 기능 더...
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
              <span>정확도: {(model.accuracy * 100).toFixed(1)}%</span>
              <span>손실: {model.loss.toFixed(3)}</span>
            </div>

            <div className="flex space-x-2">
              {model.status === 'idle' && (
                <button
                  onClick={() => startTraining(model.id)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center justify-center"
                >
                  <PlayIcon className="w-4 h-4 mr-1" />
                  학습 시작
                </button>
              )}
              {model.status === 'training' && (
                <button
                  onClick={() => stopTraining(model.id)}
                  className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 flex items-center justify-center"
                >
                  <StopIcon className="w-4 h-4 mr-1" />
                  중지
                </button>
              )}
              {model.status === 'deployed' && (
                <button
                  onClick={() => setSelectedModel(model)}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center justify-center"
                >
                  <EyeIcon className="w-4 h-4 mr-1" />
                  상세보기
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 활성 학습 세션 */}
      {activeSessions.filter(s => s.status === 'running').length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            활성 학습 세션
          </h3>
          <div className="space-y-4">
            {activeSessions.filter(s => s.status === 'running').map(session => {
              const model = models.find(m => m.id === session.modelId);
              return (
                <div key={session.id} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      {model?.name} 학습 중
                    </span>
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      {session.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${session.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    에포크 {session.currentEpoch}/{session.totalEpochs} | 
                    정확도: {(session.metrics.trainAccuracy[session.metrics.trainAccuracy.length - 1] * 100).toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 모델 상세 정보 모달 */}
      {selectedModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedModel.name}
                </h3>
                                 <button
                   onClick={() => setSelectedModel(null)}
                   className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                   title="닫기"
                 >
                   <XMarkIcon className="w-6 h-6" />
                 </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">모델 설명</h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedModel.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">주요 기능</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedModel.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">성능 지표</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="text-2xl font-bold text-blue-600">{(selectedModel.accuracy * 100).toFixed(1)}%</div>
                      <div className="text-sm text-gray-500">정확도</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="text-2xl font-bold text-green-600">{selectedModel.performance.f1Score.toFixed(3)}</div>
                      <div className="text-sm text-gray-500">F1 점수</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">학습 설정</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>학습률: {selectedModel.learningRate}</div>
                    <div>배치 크기: {selectedModel.batchSize}</div>
                    <div>에포크: {selectedModel.epochs}</div>
                    <div>데이터셋: {selectedModel.datasetSize.toLocaleString()}개</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedDeepLearningHub;
