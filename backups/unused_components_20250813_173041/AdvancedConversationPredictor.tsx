import React, { useState, useEffect } from 'react';
import {
  StarIcon,
  LightBulbIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  AcademicCapIcon,
  PlayIcon,
  PauseIcon,
  CogIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface Prediction {
  id: string;
  type: 'topic' | 'sentiment' | 'participant' | 'conflict' | 'resolution';
  title: string;
  description: string;
  confidence: number;
  probability: number;
  timeframe: string;
  impact: 'high' | 'medium' | 'low';
  status: 'active' | 'resolved' | 'expired';
  timestamp: string;
  suggestedActions: string[];
}

interface PredictionModel {
  id: string;
  name: string;
  accuracy: number;
  lastUpdated: string;
  status: 'active' | 'training' | 'inactive';
  predictions: number;
}

interface AdvancedConversationPredictorProps {
  chatRoomId?: string;
  isActive?: boolean;
}

const AdvancedConversationPredictor: React.FC<AdvancedConversationPredictorProps> = ({
  chatRoomId = 'default',
  isActive = true
}) => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [models, setModels] = useState<PredictionModel[]>([]);
  const [isPredicting, setIsPredicting] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  const [filter, setFilter] = useState<'all' | 'topic' | 'sentiment' | 'participant' | 'conflict' | 'resolution'>('all');
  const [showResolved, setShowResolved] = useState(false);

  // 샘플 예측 데이터
  const samplePredictions: Prediction[] = [
    {
      id: '1',
      type: 'conflict',
      title: '급여 체불 관련 갈등 예상',
      description: '급여 체불 문제가 다른 조합원들에게 확산되어 갈등이 발생할 가능성이 높습니다.',
      confidence: 87,
      probability: 0.75,
      timeframe: '24시간 내',
      impact: 'high',
      status: 'active',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      suggestedActions: [
        '즉시 급여 지급 현황 확인',
        '조합원 대표와 긴급 협의',
        '시공사와 긴급 면담'
      ]
    },
    {
      id: '2',
      type: 'topic',
      title: '복지 혜택 개선 요구 증가',
      description: '복지 혜택 관련 문의가 지속적으로 증가하여 주요 논의 주제로 부상할 것으로 예상됩니다.',
      confidence: 92,
      probability: 0.85,
      timeframe: '48시간 내',
      impact: 'medium',
      status: 'active',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      suggestedActions: [
        '복지 혜택 현황 조사',
        '개선안 마련',
        '조합원 의견 수렴'
      ]
    },
    {
      id: '3',
      type: 'sentiment',
      title: '조합원 만족도 하락 예상',
      description: '최근 대화 분석 결과 조합원들의 전반적인 만족도가 하락할 것으로 예측됩니다.',
      confidence: 78,
      probability: 0.65,
      timeframe: '72시간 내',
      impact: 'medium',
      status: 'active',
      timestamp: new Date(Date.now() - 5400000).toISOString(),
      suggestedActions: [
        '만족도 조사 실시',
        '개선점 파악',
        '소통 강화 방안 마련'
      ]
    },
    {
      id: '4',
      type: 'resolution',
      title: '안전 규정 개선 합의 예상',
      description: '안전 규정 개선에 대한 합의가 이루어질 것으로 예상됩니다.',
      confidence: 85,
      probability: 0.70,
      timeframe: '1주일 내',
      impact: 'low',
      status: 'active',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      suggestedActions: [
        '안전 규정 개선안 준비',
        '조합원 의견 수렴',
        '시공사와 협의'
      ]
    }
  ];

  const sampleModels: PredictionModel[] = [
    {
      id: '1',
      name: '갈등 예측 모델',
      accuracy: 89.5,
      lastUpdated: '2024-01-15T10:30:00Z',
      status: 'active',
      predictions: 156
    },
    {
      id: '2',
      name: '주제 예측 모델',
      accuracy: 92.3,
      lastUpdated: '2024-01-15T09:15:00Z',
      status: 'active',
      predictions: 234
    },
    {
      id: '3',
      name: '감정 예측 모델',
      accuracy: 87.1,
      lastUpdated: '2024-01-15T08:45:00Z',
      status: 'training',
      predictions: 189
    },
    {
      id: '4',
      name: '참여자 행동 예측 모델',
      accuracy: 94.2,
      lastUpdated: '2024-01-15T07:30:00Z',
      status: 'active',
      predictions: 312
    }
  ];

  useEffect(() => {
    if (!isActive) return;

    // 예측 데이터 로드
    setPredictions(samplePredictions);
    setModels(sampleModels);

    // 실시간 예측 시뮬레이션
    if (isPredicting) {
      const interval = setInterval(() => {
        // 새로운 예측 생성 (가끔)
        if (Math.random() < 0.15) {
          const predictionTypes: Prediction['type'][] = ['topic', 'sentiment', 'participant', 'conflict', 'resolution'];
          const impacts: Prediction['impact'][] = ['high', 'medium', 'low'];

          const newPrediction: Prediction = {
            id: Date.now().toString(),
            type: predictionTypes[Math.floor(Math.random() * predictionTypes.length)],
            title: `새로운 ${predictionTypes[Math.floor(Math.random() * predictionTypes.length)]} 예측`,
            description: '실시간 대화 분석을 통해 새로운 패턴이 예측되었습니다.',
            confidence: Math.floor(Math.random() * 20) + 75,
            probability: Math.random() * 0.3 + 0.5,
            timeframe: '24시간 내',
            impact: impacts[Math.floor(Math.random() * impacts.length)],
            status: 'active',
            timestamp: new Date().toISOString(),
            suggestedActions: ['관련 부서에 문의', '조합원 대표와 협의']
          };

          setPredictions(prev => [newPrediction, ...prev]);
        }
      }, 45000); // 45초마다

      return () => clearInterval(interval);
    }
  }, [isActive, isPredicting]);

  const getPredictionTypeColor = (type: string) => {
    switch (type) {
      case 'conflict': return 'text-red-600 bg-red-100';
      case 'topic': return 'text-blue-600 bg-blue-100';
      case 'sentiment': return 'text-purple-600 bg-purple-100';
      case 'participant': return 'text-green-600 bg-green-100';
      case 'resolution': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPredictionTypeIcon = (type: string) => {
    switch (type) {
      case 'conflict': return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />;
      case 'topic': return <DocumentTextIcon className="w-4 h-4 text-blue-600" />;
      case 'sentiment': return <ChartBarIcon className="w-4 h-4 text-purple-600" />;
      case 'participant': return <UserGroupIcon className="w-4 h-4 text-green-600" />;
      case 'resolution': return <CheckCircleIcon className="w-4 h-4 text-orange-600" />;
      default: return <LightBulbIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const handlePredictionClick = (prediction: Prediction) => {
    setSelectedPrediction(prediction);
  };

  const handleTogglePrediction = () => {
    setIsPredicting(!isPredicting);
  };

  const filteredPredictions = predictions.filter(prediction => {
    if (filter !== 'all' && prediction.type !== filter) return false;
    if (!showResolved && prediction.status === 'resolved') return false;
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
            <AcademicCapIcon className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">22</span>
                고급 대화 예측 시스템
              </h3>
              <p className="text-sm text-gray-500">AI 기반 실시간 대화 패턴 분석 및 미래 예측</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleTogglePrediction}
              className={`p-2 rounded-md ${isPredicting
                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                  : 'bg-red-100 text-red-600 hover:bg-red-200'
                }`}
            >
              {isPredicting ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
            </button>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1"
            >
              <option value="all">전체</option>
              <option value="topic">주제</option>
              <option value="sentiment">감정</option>
              <option value="participant">참여자</option>
              <option value="conflict">갈등</option>
              <option value="resolution">해결</option>
            </select>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showResolved}
                onChange={(e) => setShowResolved(e.target.checked)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-600">해결된 예측 표시</span>
            </label>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 예측 목록 */}
          <div className="lg:col-span-2">
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
              <ArrowTrendingUpIcon className="w-5 h-5 mr-2 text-purple-600" />
              실시간 예측 ({filteredPredictions.length})
            </h4>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredPredictions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AcademicCapIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>예측이 없습니다.</p>
                </div>
              ) : (
                filteredPredictions.map((prediction) => (
                  <div
                    key={prediction.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedPrediction?.id === prediction.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                    onClick={() => handlePredictionClick(prediction)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getPredictionTypeIcon(prediction.type)}
                        <span className={`px-2 py-1 rounded-full text-xs ${getPredictionTypeColor(prediction.type)}`}>
                          {prediction.type === 'conflict' ? '갈등' :
                            prediction.type === 'topic' ? '주제' :
                              prediction.type === 'sentiment' ? '감정' :
                                prediction.type === 'participant' ? '참여자' : '해결'}
                        </span>
                        <span className={`text-xs font-medium ${getImpactColor(prediction.impact)}`}>
                          {prediction.impact === 'high' ? '높음' :
                            prediction.impact === 'medium' ? '보통' : '낮음'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {formatTime(prediction.timestamp)}
                        </span>
                        <span className="text-xs font-medium text-purple-600">
                          {prediction.confidence}%
                        </span>
                      </div>
                    </div>

                    <h5 className="font-medium text-gray-900 mb-1">{prediction.title}</h5>
                    <p className="text-sm text-gray-600 mb-3">{prediction.description}</p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <ClockIcon className="w-3 h-3" />
                        <span>{prediction.timeframe}</span>
                      </span>

                      <div className="flex items-center space-x-2">
                        <span className="text-purple-600 font-medium">
                          {(prediction.probability * 100).toFixed(1)}% 확률
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 예측 모델 */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
              <CogIcon className="w-5 h-5 mr-2 text-blue-600" />
              예측 모델
            </h4>

            <div className="space-y-3">
              {models.map((model) => (
                <div key={model.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-gray-900">{model.name}</h5>
                    <span className={`px-2 py-1 rounded text-xs ${model.status === 'active' ? 'bg-green-100 text-green-600' :
                        model.status === 'training' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-gray-100 text-gray-600'
                      }`}>
                      {model.status === 'active' ? '활성' :
                        model.status === 'training' ? '학습 중' : '비활성'}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">정확도:</span>
                      <span className="font-medium text-green-600">{model.accuracy}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">예측 수:</span>
                      <span className="font-medium text-blue-600">{model.predictions}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      마지막 업데이트: {new Date(model.lastUpdated).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 예측 상세 정보 */}
        {selectedPrediction && (
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
              <StarIcon className="w-5 h-5 mr-2 text-purple-600" />
              예측 상세 정보
            </h4>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getPredictionTypeIcon(selectedPrediction.type)}
                  <div>
                    <h5 className="font-medium text-gray-900">{selectedPrediction.title}</h5>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedPrediction.timestamp).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${getPredictionTypeColor(selectedPrediction.type)}`}>
                    {selectedPrediction.type === 'conflict' ? '갈등' :
                      selectedPrediction.type === 'topic' ? '주제' :
                        selectedPrediction.type === 'sentiment' ? '감정' :
                          selectedPrediction.type === 'participant' ? '참여자' : '해결'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getImpactColor(selectedPrediction.impact)}`}>
                    {selectedPrediction.impact === 'high' ? '높음' :
                      selectedPrediction.impact === 'medium' ? '보통' : '낮음'}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{selectedPrediction.description}</p>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-600">신뢰도:</span>
                  <p className="text-gray-900">{selectedPrediction.confidence}%</p>
                </div>
                <div>
                  <span className="text-gray-600">발생 확률:</span>
                  <p className="text-gray-900">{(selectedPrediction.probability * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <span className="text-gray-600">예상 시간:</span>
                  <p className="text-gray-900">{selectedPrediction.timeframe}</p>
                </div>
                <div>
                  <span className="text-gray-600">상태:</span>
                  <p className="text-gray-900">
                    {selectedPrediction.status === 'active' ? '활성' :
                      selectedPrediction.status === 'resolved' ? '해결됨' : '만료됨'}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <h6 className="font-medium text-gray-900 mb-2">제안 액션</h6>
                <div className="space-y-2">
                  {selectedPrediction.suggestedActions.map((action, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <ArrowTrendingUpIcon className="w-4 h-4 text-purple-600" />
                      <span className="text-gray-700">{action}</span>
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
            <ChartBarIcon className="w-5 h-5 mr-2 text-green-600" />
            예측 시스템 통계
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <AcademicCapIcon className="w-8 h-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-600">활성 예측</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {predictions.filter(p => p.status === 'active').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <ArrowTrendingUpIcon className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">평균 정확도</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {Math.round(models.reduce((acc, m) => acc + m.accuracy, 0) / models.length)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">해결된 예측</p>
                  <p className="text-2xl font-bold text-green-900">
                    {predictions.filter(p => p.status === 'resolved').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-8 h-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-orange-600">높은 영향</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {predictions.filter(p => p.impact === 'high').length}
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

export default AdvancedConversationPredictor; 