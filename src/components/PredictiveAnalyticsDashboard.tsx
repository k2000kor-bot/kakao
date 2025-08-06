import React, { useState, useCallback, useEffect } from 'react';
import {
    ChartBarIcon,
    UserIcon,
    ChatBubbleLeftRightIcon,
    CpuChipIcon,
    ArrowTrendingUpIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

interface UserData {
    id: string;
    name: string;
    activityLevel: number;
    messageCount: number;
    responseTime: number;
    lastActive: Date;
}

interface SystemMetrics {
    cpu: number;
    memory: number;
    network: number;
    responseTime: number;
    errorRate: number;
    timestamp: Date;
}

interface ActivityPrediction {
    activity: string;
    confidence: number;
    probability: number;
    nextAction: string;
    timeToNextAction: number;
}

interface QualityPrediction {
    quality: 'excellent' | 'good' | 'average' | 'poor';
    confidence: number;
    score: number;
    suggestions: string[];
}

interface PerformancePrediction {
    performance: 'optimal' | 'good' | 'warning' | 'critical';
    confidence: number;
    predictedLoad: number;
    recommendations: string[];
}

interface PredictiveAnalyticsProps {
    userData?: UserData;
    systemMetrics?: SystemMetrics;
    onPredictUserActivity?: (data: UserData) => Promise<ActivityPrediction>;
    onPredictMessageQuality?: (message: string) => Promise<QualityPrediction>;
    onPredictSystemPerformance?: (metrics: SystemMetrics) => Promise<PerformancePrediction>;
    className?: string;
}

const PredictiveAnalyticsDashboard: React.FC<PredictiveAnalyticsProps> = ({
    userData,
    systemMetrics,
    onPredictUserActivity,
    onPredictMessageQuality,
    onPredictSystemPerformance,
    className = ''
}) => {
    const [activityPrediction, setActivityPrediction] = useState<ActivityPrediction | null>(null);
    const [qualityPrediction, setQualityPrediction] = useState<QualityPrediction | null>(null);
    const [performancePrediction, setPerformancePrediction] = useState<PerformancePrediction | null>(null);
    const [isPredicting, setIsPredicting] = useState(false);
    const [predictionHistory, setPredictionHistory] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    // 샘플 데이터
    const sampleUserData: UserData = {
        id: 'user-001',
        name: '사용자',
        activityLevel: 0.85,
        messageCount: 127,
        responseTime: 2.3,
        lastActive: new Date()
    };

    const sampleSystemMetrics: SystemMetrics = {
        cpu: 45.2,
        memory: 67.8,
        network: 23.4,
        responseTime: 1.2,
        errorRate: 0.5,
        timestamp: new Date()
    };

    // 사용자 활동 예측
    const predictUserActivity = useCallback(async () => {
        setIsPredicting(true);
        setError(null);

        try {
            const data = userData || sampleUserData;
            const prediction = await onPredictUserActivity?.(data) || {
                activity: '메시지 작성',
                confidence: 0.92,
                probability: 0.85,
                nextAction: 'AI 응답 요청',
                timeToNextAction: 5
            };

            setActivityPrediction(prediction);

            // 히스토리에 추가
            setPredictionHistory(prev => [...prev, {
                type: 'user_activity',
                prediction,
                timestamp: new Date()
            }]);
        } catch (err) {
            setError('사용자 활동 예측 중 오류가 발생했습니다.');
        } finally {
            setIsPredicting(false);
        }
    }, [userData, onPredictUserActivity]);

    // 메시지 품질 예측
    const predictMessageQuality = useCallback(async (message: string = '안녕하세요, 도움이 필요합니다.') => {
        setIsPredicting(true);
        setError(null);

        try {
            const prediction = await onPredictMessageQuality?.(message) || {
                quality: 'good' as const,
                confidence: 0.88,
                score: 8.5,
                suggestions: ['더 구체적인 질문을 해보세요', '상황을 자세히 설명해보세요']
            };

            setQualityPrediction(prediction);

            // 히스토리에 추가
            setPredictionHistory(prev => [...prev, {
                type: 'message_quality',
                prediction,
                timestamp: new Date()
            }]);
        } catch (err) {
            setError('메시지 품질 예측 중 오류가 발생했습니다.');
        } finally {
            setIsPredicting(false);
        }
    }, [onPredictMessageQuality]);

    // 시스템 성능 예측
    const predictSystemPerformance = useCallback(async () => {
        setIsPredicting(true);
        setError(null);

        try {
            const metrics = systemMetrics || sampleSystemMetrics;
            const prediction = await onPredictSystemPerformance?.(metrics) || {
                performance: 'good' as const,
                confidence: 0.94,
                predictedLoad: 78.5,
                recommendations: ['캐시 최적화 고려', '메모리 사용량 모니터링']
            };

            setPerformancePrediction(prediction);

            // 히스토리에 추가
            setPredictionHistory(prev => [...prev, {
                type: 'system_performance',
                prediction,
                timestamp: new Date()
            }]);
        } catch (err) {
            setError('시스템 성능 예측 중 오류가 발생했습니다.');
        } finally {
            setIsPredicting(false);
        }
    }, [systemMetrics, onPredictSystemPerformance]);

    // 모든 예측 실행
    const runAllPredictions = useCallback(async () => {
        await Promise.all([
            predictUserActivity(),
            predictMessageQuality(),
            predictSystemPerformance()
        ]);
    }, [predictUserActivity, predictMessageQuality, predictSystemPerformance]);

    // 히스토리 삭제
    const clearHistory = useCallback(() => {
        setPredictionHistory([]);
        setActivityPrediction(null);
        setQualityPrediction(null);
        setPerformancePrediction(null);
    }, []);

    // 품질 점수에 따른 색상
    const getQualityColor = (quality: string) => {
        switch (quality) {
            case 'excellent': return 'text-green-600 bg-green-100';
            case 'good': return 'text-blue-600 bg-blue-100';
            case 'average': return 'text-yellow-600 bg-yellow-100';
            case 'poor': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    // 성능 상태에 따른 색상
    const getPerformanceColor = (performance: string) => {
        switch (performance) {
            case 'optimal': return 'text-green-600 bg-green-100';
            case 'good': return 'text-blue-600 bg-blue-100';
            case 'warning': return 'text-yellow-600 bg-yellow-100';
            case 'critical': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className={`predictive-analytics-dashboard ${className}`}>
            {/* 헤더 */}
            <div className="dashboard-header">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    🔮 예측 분석 대시보드
                </h3>
            </div>

            {/* 예측 컨트롤 */}
            <div className="prediction-controls mb-6">
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={predictUserActivity}
                        disabled={isPredicting}
                        className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                    >
                        <UserIcon className="w-5 h-5 mr-2" />
                        사용자 활동 예측
                    </button>
                    <button
                        onClick={() => predictMessageQuality()}
                        disabled={isPredicting}
                        className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                    >
                        <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                        메시지 품질 예측
                    </button>
                    <button
                        onClick={predictSystemPerformance}
                        disabled={isPredicting}
                        className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
                    >
                        <CpuChipIcon className="w-5 h-5 mr-2" />
                        시스템 성능 예측
                    </button>
                    <button
                        onClick={runAllPredictions}
                        disabled={isPredicting}
                        className="flex items-center px-4 py-2 bg-corbu-blue text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                        <ArrowTrendingUpIcon className="w-5 h-5 mr-2" />
                        모든 예측 실행
                    </button>
                </div>
            </div>

            {/* 로딩 상태 */}
            {isPredicting && (
                <div className="predicting-status mb-4">
                    <div className="flex items-center text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        <span className="text-sm font-medium">예측 분석 중...</span>
                    </div>
                </div>
            )}

            {/* 오류 메시지 */}
            {error && (
                <div className="error-message mb-4">
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                        ⚠️ {error}
                    </div>
                </div>
            )}

            {/* 예측 결과 카드 */}
            <div className="prediction-cards grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* 사용자 활동 예측 */}
                <div className="prediction-card bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                        <UserIcon className="w-5 h-5 text-blue-600 mr-2" />
                        <h4 className="font-medium text-gray-800">사용자 활동 예측</h4>
                    </div>

                    {activityPrediction ? (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">예상 활동:</span>
                                <span className="font-medium text-blue-600">{activityPrediction.activity}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">신뢰도:</span>
                                <span className="font-medium">{(activityPrediction.confidence * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">확률:</span>
                                <span className="font-medium">{(activityPrediction.probability * 100).toFixed(1)}%</span>
                            </div>
                            <div className="text-sm text-gray-600">
                                <p><strong>다음 행동:</strong> {activityPrediction.nextAction}</p>
                                <p><strong>예상 시간:</strong> {activityPrediction.timeToNextAction}분 후</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">예측을 실행해보세요</p>
                    )}
                </div>

                {/* 메시지 품질 예측 */}
                <div className="prediction-card bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                        <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-600 mr-2" />
                        <h4 className="font-medium text-gray-800">메시지 품질 예측</h4>
                    </div>

                    {qualityPrediction ? (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">품질:</span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getQualityColor(qualityPrediction.quality)}`}>
                                    {qualityPrediction.quality.toUpperCase()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">신뢰도:</span>
                                <span className="font-medium">{(qualityPrediction.confidence * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">점수:</span>
                                <span className="font-medium">{qualityPrediction.score}/10</span>
                            </div>
                            <div className="text-sm text-gray-600">
                                <p><strong>개선 제안:</strong></p>
                                <ul className="list-disc list-inside text-xs mt-1">
                                    {qualityPrediction.suggestions.map((suggestion, idx) => (
                                        <li key={idx}>{suggestion}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">예측을 실행해보세요</p>
                    )}
                </div>

                {/* 시스템 성능 예측 */}
                <div className="prediction-card bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                        <CpuChipIcon className="w-5 h-5 text-purple-600 mr-2" />
                        <h4 className="font-medium text-gray-800">시스템 성능 예측</h4>
                    </div>

                    {performancePrediction ? (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">상태:</span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getPerformanceColor(performancePrediction.performance)}`}>
                                    {performancePrediction.performance.toUpperCase()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">신뢰도:</span>
                                <span className="font-medium">{(performancePrediction.confidence * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">예상 부하:</span>
                                <span className="font-medium">{performancePrediction.predictedLoad}%</span>
                            </div>
                            <div className="text-sm text-gray-600">
                                <p><strong>권장사항:</strong></p>
                                <ul className="list-disc list-inside text-xs mt-1">
                                    {performancePrediction.recommendations.map((rec, idx) => (
                                        <li key={idx}>{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">예측을 실행해보세요</p>
                    )}
                </div>
            </div>

            {/* 예측 히스토리 */}
            {predictionHistory.length > 0 && (
                <div className="prediction-history">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-medium text-gray-700">
                            예측 히스토리 ({predictionHistory.length}개)
                        </h4>
                        <button
                            onClick={clearHistory}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            히스토리 삭제
                        </button>
                    </div>

                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        {predictionHistory.map((item, index) => (
                            <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-medium text-gray-800">
                                        {item.type === 'user_activity' && '👤 사용자 활동'}
                                        {item.type === 'message_quality' && '💬 메시지 품질'}
                                        {item.type === 'system_performance' && '⚙️ 시스템 성능'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {item.timestamp.toLocaleTimeString()}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-600">
                                    {item.type === 'user_activity' && (
                                        <p>예상 활동: {item.prediction.activity} ({(item.prediction.confidence * 100).toFixed(1)}%)</p>
                                    )}
                                    {item.type === 'message_quality' && (
                                        <p>품질: {item.prediction.quality} (점수: {item.prediction.score}/10)</p>
                                    )}
                                    {item.type === 'system_performance' && (
                                        <p>상태: {item.prediction.performance} (부하: {item.prediction.predictedLoad}%)</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 통계 */}
            {predictionHistory.length > 0 && (
                <div className="prediction-statistics mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">예측 통계</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500">총 예측:</span>
                            <span className="ml-2 font-medium">{predictionHistory.length}회</span>
                        </div>
                        <div>
                            <span className="text-gray-500">평균 신뢰도:</span>
                            <span className="ml-2 font-medium">
                                {(predictionHistory.reduce((acc, item) => acc + item.prediction.confidence, 0) / predictionHistory.length * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500">예측 유형:</span>
                            <span className="ml-2 font-medium">
                                {new Set(predictionHistory.map(item => item.type)).size}가지
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PredictiveAnalyticsDashboard; 