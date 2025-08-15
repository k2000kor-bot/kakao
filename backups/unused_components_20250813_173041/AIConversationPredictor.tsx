import React, { useState, useEffect } from 'react';
import {
  StarIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface PredictionData {
  timestamp: string;
  predictedSentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  expectedResponse: string;
  recommendedAction: string;
  riskLevel: 'low' | 'medium' | 'high';
  participants: number;
  messageVolume: number;
}

interface ConversationTrend {
  period: string;
  sentiment: number;
  engagement: number;
  responseTime: number;
  satisfaction: number;
}

interface AIConversationPredictorProps {
  chatRoomId?: string;
  isActive?: boolean;
  onToggle?: () => void;
}

const AIConversationPredictor: React.FC<AIConversationPredictorProps> = ({
  chatRoomId = '1',
  isActive = true,
  onToggle
}) => {
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [trends, setTrends] = useState<ConversationTrend[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [isPredicting, setIsPredicting] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState<PredictionData | null>(null);

  useEffect(() => {
    // 시뮬레이션된 예측 데이터
    const generatePredictions = () => {
      const mockPredictions: PredictionData[] = [];
      const now = new Date();

      for (let i = 0; i < 12; i++) {
        const time = new Date(now.getTime() + i * 2 * 60 * 60 * 1000);
        const sentiment = Math.random() > 0.6 ? 'positive' : Math.random() > 0.3 ? 'neutral' : 'negative';

        mockPredictions.push({
          timestamp: time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          predictedSentiment: sentiment,
          confidence: Math.random() * 30 + 70,
          expectedResponse: sentiment === 'positive'
            ? '조합원들의 긍정적 반응이 예상됩니다.'
            : sentiment === 'negative'
              ? '부정적 반응에 대한 대비가 필요합니다.'
              : '중립적 반응이 예상됩니다.',
          recommendedAction: sentiment === 'positive'
            ? '긍정적 분위기를 유지하며 추가 정보 제공'
            : sentiment === 'negative'
              ? '우려사항 해소를 위한 적극적 소통 필요'
              : '중립적 입장에서 객관적 정보 제공',
          riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
          participants: Math.floor(Math.random() * 20) + 10,
          messageVolume: Math.floor(Math.random() * 50) + 20
        });
      }

      setPredictions(mockPredictions);
      setCurrentPrediction(mockPredictions[0]);
    };

    generatePredictions();

    // 트렌드 데이터 생성
    const mockTrends: ConversationTrend[] = [
      { period: '오전', sentiment: 0.75, engagement: 0.8, responseTime: 2.3, satisfaction: 0.7 },
      { period: '오후', sentiment: 0.65, engagement: 0.9, responseTime: 1.8, satisfaction: 0.8 },
      { period: '저녁', sentiment: 0.85, engagement: 0.7, responseTime: 3.1, satisfaction: 0.6 },
      { period: '새벽', sentiment: 0.45, engagement: 0.3, responseTime: 5.2, satisfaction: 0.4 }
    ];

    setTrends(mockTrends);
  }, []);

  const startPrediction = async () => {
    setIsPredicting(true);

    // 시뮬레이션된 예측 과정
    await new Promise(resolve => setTimeout(resolve, 3000));

    const newPrediction: PredictionData = {
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      predictedSentiment: Math.random() > 0.6 ? 'positive' : 'neutral',
      confidence: Math.random() * 30 + 70,
      expectedResponse: 'AI 분석을 통한 예측 응답입니다.',
      recommendedAction: '현재 상황에 맞는 최적의 대응 방안을 제시합니다.',
      riskLevel: 'medium',
      participants: Math.floor(Math.random() * 20) + 10,
      messageVolume: Math.floor(Math.random() * 50) + 20
    };

    setCurrentPrediction(newPrediction);
    setPredictions(prev => [newPrediction, ...prev.slice(0, 11)]);
    setIsPredicting(false);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      default: return '😐';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <AcademicCapIcon className="w-8 h-8 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">AI 대화 예측 시스템</h2>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="예측 시간 범위 선택"
          >
            <option value="1h">1시간 후</option>
            <option value="24h">24시간 후</option>
            <option value="7d">7일 후</option>
            <option value="30d">30일 후</option>
          </select>

          <button
            onClick={startPrediction}
            disabled={isPredicting}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isPredicting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>예측 중...</span>
              </>
            ) : (
              <>
                <AcademicCapIcon className="w-4 h-4" />
                <span>예측 시작</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 현재 예측 */}
      {currentPrediction && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
            <LightBulbIcon className="w-5 h-5 text-purple-600 mr-2" />
            현재 예측 결과
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">{getSentimentIcon(currentPrediction.predictedSentiment)}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${getSentimentColor(currentPrediction.predictedSentiment)}`}>
                  {currentPrediction.predictedSentiment === 'positive' ? '긍정' :
                    currentPrediction.predictedSentiment === 'negative' ? '부정' : '중립'}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{currentPrediction.confidence.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">신뢰도</div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <UserGroupIcon className="w-5 h-5 text-blue-600" />
                <span className={`px-2 py-1 text-xs rounded-full ${getRiskColor(currentPrediction.riskLevel)}`}>
                  {currentPrediction.riskLevel === 'high' ? '높음' :
                    currentPrediction.riskLevel === 'medium' ? '보통' : '낮음'}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{currentPrediction.participants}</div>
              <div className="text-sm text-gray-600">예상 참여자</div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{currentPrediction.messageVolume}</div>
              <div className="text-sm text-gray-600">예상 메시지</div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <ClockIcon className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{currentPrediction.timestamp}</div>
              <div className="text-sm text-gray-600">예측 시간</div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div>
              <h4 className="font-medium text-purple-900 mb-2">예상 응답</h4>
              <p className="text-gray-700 bg-white rounded-lg p-3">{currentPrediction.expectedResponse}</p>
            </div>

            <div>
              <h4 className="font-medium text-purple-900 mb-2">권장 조치</h4>
              <p className="text-gray-700 bg-white rounded-lg p-3">{currentPrediction.recommendedAction}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 예측 히스토리 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">예측 히스토리</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {predictions.map((prediction, index) => (
              <div key={index} className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getSentimentIcon(prediction.predictedSentiment)}</span>
                    <span className="font-medium">{prediction.timestamp}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getSentimentColor(prediction.predictedSentiment)}`}>
                      {prediction.predictedSentiment === 'positive' ? '긍정' :
                        prediction.predictedSentiment === 'negative' ? '부정' : '중립'}
                    </span>
                    <span className="text-sm font-medium">{prediction.confidence.toFixed(0)}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                  <div>참여자: {prediction.participants}명</div>
                  <div>메시지: {prediction.messageVolume}개</div>
                  <div>위험도: {prediction.riskLevel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 트렌드 분석 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">대화 트렌드 분석</h3>
          <div className="space-y-4">
            {trends.map((trend, index) => (
              <div key={index} className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{trend.period}</h4>
                  <div className="flex items-center space-x-1">
                    {trend.sentiment > 0.7 ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowTrendingUpIcon className="w-4 h-4 text-red-600 transform rotate-180" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">감정 점수</span>
                      <span className="font-medium">{(trend.sentiment * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${trend.sentiment * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">참여도</span>
                      <span className="font-medium">{(trend.engagement * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${trend.engagement * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">응답시간</span>
                      <span className="font-medium">{trend.responseTime}분</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full"
                        style={{ width: `${Math.min(trend.responseTime / 5 * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">만족도</span>
                      <span className="font-medium">{(trend.satisfaction * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${trend.satisfaction * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI 인사이트 */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <AcademicCapIcon className="w-5 h-5 text-blue-600 mr-2" />
          AI 예측 인사이트
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-blue-800">
          <div className="space-y-2">
            <p>• <strong>패턴 분석:</strong> 오후 시간대에 참여도가 가장 높습니다.</p>
            <p>• <strong>감정 트렌드:</strong> 긍정적 감정이 점진적으로 증가하는 추세입니다.</p>
            <p>• <strong>응답 시간:</strong> 평균 응답 시간이 2.3분으로 양호한 수준입니다.</p>
          </div>
          <div className="space-y-2">
            <p>• <strong>위험 요소:</strong> 새벽 시간대의 부정적 감정이 주목됩니다.</p>
            <p>• <strong>개선 방안:</strong> 즉시 응답 시스템 강화가 권장됩니다.</p>
            <p>• <strong>예측 정확도:</strong> 현재 모델의 예측 정확도는 87%입니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIConversationPredictor; 