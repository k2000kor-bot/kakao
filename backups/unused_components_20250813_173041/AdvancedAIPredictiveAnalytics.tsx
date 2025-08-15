import React, { useState, useEffect } from 'react';
import {
    StarIcon,
    ChartBarIcon,
    ShieldCheckIcon,
    EyeIcon,
    FireIcon,
    BoltIcon,
    RocketLaunchIcon,
    AcademicCapIcon,
    MagnifyingGlassIcon,
    UserIcon,
    ServerIcon,
    CloudIcon,
    CogIcon,
    ArrowPathIcon,
    PlayIcon,
    PauseIcon,
    StopIcon,
    PlusIcon,
    MinusIcon,
    InformationCircleIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    UsersIcon,
    ChatBubbleLeftRightIcon,
    Bars3Icon,
    Squares2X2Icon,
    ViewColumnsIcon,
    ArrowsPointingOutIcon,
    ArrowsPointingInIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    Cog6ToothIcon,
    WrenchScrewdriverIcon,
    LightBulbIcon,
    BookOpenIcon,
    TrophyIcon,
    CalendarIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    SignalIcon,
    WifiIcon,
    DevicePhoneMobileIcon,
    ComputerDesktopIcon,
    ChartPieIcon,
    PresentationChartLineIcon,
    TableCellsIcon,
    CubeIcon,
    CubeTransparentIcon,
    SwatchIcon,
    PaintBrushIcon,
    AdjustmentsHorizontalIcon,
    FunnelIcon,
    RectangleStackIcon,
    CircleStackIcon,
    QueueListIcon,
    ListBulletIcon,
    Bars4Icon,
    Bars3BottomLeftIcon,
    Bars3BottomRightIcon,
    Bars3CenterLeftIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    UserGroupIcon,
    UserPlusIcon,
    UserMinusIcon,
    ChatBubbleBottomCenterTextIcon,
    ChatBubbleLeftEllipsisIcon,
    ChatBubbleOvalLeftEllipsisIcon,
    ChatBubbleOvalLeftIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';

interface PredictionModel {
    id: string;
    name: string;
    type: 'time-series' | 'regression' | 'classification' | 'clustering' | 'neural-network';
    accuracy: number;
    precision: number;
    recall: number;
    status: 'active' | 'training' | 'inactive';
    lastUpdated: string;
    usage: number;
    predictionHorizon: number;
}

interface PredictionResult {
    id: string;
    modelId: string;
    target: string;
    prediction: number;
    confidence: number;
    timestamp: string;
    horizon: number;
    actualValue?: number;
    error?: number;
    insights: PredictionInsight[];
}

interface PredictionInsight {
    id: string;
    type: 'trend' | 'pattern' | 'anomaly' | 'seasonality' | 'correlation' | 'forecast';
    title: string;
    description: string;
    confidence: number;
    value: any;
}

interface PredictionSettings {
    enableRealTime: boolean;
    enableAutoRetraining: boolean;
    confidenceThreshold: number;
    predictionHorizon: number;
    updateFrequency: number;
    enableAnomalyDetection: boolean;
}

interface AdvancedAIPredictiveAnalyticsProps {
    isActive: boolean;
    onToggle: () => void;
}

const AdvancedAIPredictiveAnalytics: React.FC<AdvancedAIPredictiveAnalyticsProps> = ({
    isActive,
    onToggle
}) => {
    const [predictionModels, setPredictionModels] = useState<PredictionModel[]>([
        {
            id: 'model-1',
            name: 'LSTM Time Series Predictor',
            type: 'neural-network',
            accuracy: 94.2,
            precision: 92.5,
            recall: 89.8,
            status: 'active',
            lastUpdated: '1일 전',
            usage: 1850,
            predictionHorizon: 30
        },
        {
            id: 'model-2',
            name: 'Random Forest Regressor',
            type: 'regression',
            accuracy: 87.3,
            precision: 85.1,
            recall: 82.7,
            status: 'active',
            lastUpdated: '2일 전',
            usage: 1200,
            predictionHorizon: 7
        },
        {
            id: 'model-3',
            name: 'Prophet Forecasting',
            type: 'time-series',
            accuracy: 91.7,
            precision: 89.2,
            recall: 86.5,
            status: 'active',
            lastUpdated: '1주일 전',
            usage: 1650,
            predictionHorizon: 90
        },
        {
            id: 'model-4',
            name: 'XGBoost Classifier',
            type: 'classification',
            accuracy: 96.1,
            precision: 94.8,
            recall: 92.3,
            status: 'training',
            lastUpdated: '3일 전',
            usage: 950,
            predictionHorizon: 1
        }
    ]);

    const [predictionResults, setPredictionResults] = useState<PredictionResult[]>([
        {
            id: 'pred-1',
            modelId: 'model-1',
            target: '시스템 성능 지수',
            prediction: 87.5,
            confidence: 94.2,
            timestamp: '5분 전',
            horizon: 30,
            actualValue: 86.8,
            error: 0.7,
            insights: [
                {
                    id: 'insight-1',
                    type: 'trend',
                    title: '상승 트렌드',
                    description: '시스템 성능이 지속적으로 향상되는 추세',
                    confidence: 89.3,
                    value: 'upward_trend'
                },
                {
                    id: 'insight-2',
                    type: 'seasonality',
                    title: '주간 패턴',
                    description: '주말에 성능이 약간 저하되는 패턴 감지',
                    confidence: 91.7,
                    value: 'weekly_pattern'
                }
            ]
        },
        {
            id: 'pred-2',
            modelId: 'model-2',
            target: '사용자 활동량',
            prediction: 1250,
            confidence: 87.5,
            timestamp: '15분 전',
            horizon: 7,
            actualValue: 1230,
            error: 20,
            insights: [
                {
                    id: 'insight-3',
                    type: 'correlation',
                    title: '시간대 상관관계',
                    description: '오후 2-4시에 활동량이 최고조를 보임',
                    confidence: 86.4,
                    value: 'time_correlation'
                }
            ]
        },
        {
            id: 'pred-3',
            modelId: 'model-3',
            target: 'AI 모델 정확도',
            prediction: 92.8,
            confidence: 91.8,
            timestamp: '1시간 전',
            horizon: 90,
            insights: [
                {
                    id: 'insight-4',
                    type: 'forecast',
                    title: '장기 예측',
                    description: '3개월 후 AI 모델 정확도가 95% 이상 예상',
                    confidence: 93.1,
                    value: 'long_term_forecast'
                }
            ]
        }
    ]);

    const [predictionSettings, setPredictionSettings] = useState<PredictionSettings>({
        enableRealTime: true,
        enableAutoRetraining: true,
        confidenceThreshold: 85,
        predictionHorizon: 30,
        updateFrequency: 5,
        enableAnomalyDetection: true
    });

    const [activeTab, setActiveTab] = useState<'models' | 'predictions' | 'insights' | 'analytics' | 'settings'>('models');

    useEffect(() => {
        // 실시간 예측 시뮬레이션
        const interval = setInterval(() => {
            const newPrediction: PredictionResult = {
                id: `pred-${Date.now()}`,
                modelId: predictionModels[Math.floor(Math.random() * predictionModels.length)].id,
                target: '실시간 예측 지표',
                prediction: Math.floor(Math.random() * 100) + 50,
                confidence: Math.floor(Math.random() * 20) + 80,
                timestamp: '방금 전',
                horizon: 7,
                insights: [
                    {
                        id: `insight-${Date.now()}`,
                        type: 'trend',
                        title: '실시간 트렌드',
                        description: '실시간 데이터 기반 트렌드 분석',
                        confidence: Math.floor(Math.random() * 20) + 80,
                        value: 'realtime_trend'
                    }
                ]
            };

            setPredictionResults(prev => [newPrediction, ...prev.slice(0, 9)]);
        }, 15000);

        return () => clearInterval(interval);
    }, [predictionModels]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'training': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'inactive': return 'text-gray-600 bg-gray-50 border-gray-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'time-series': return <ArrowTrendingUpIcon className="w-4 h-4" />;
            case 'regression': return <ChartBarIcon className="w-4 h-4" />;
            case 'classification': return <Squares2X2Icon className="w-4 h-4" />;
            case 'clustering': return <CircleStackIcon className="w-4 h-4" />;
            case 'neural-network': return <CpuChipIcon className="w-4 h-4" />;
            default: return <ChartBarIcon className="w-4 h-4" />;
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        if (confidence >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
        if (confidence >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    if (!isActive) {
        return (
            <div className="absolute bottom-4 right-4 z-50">
                <button
                    onClick={onToggle}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2"
                >
                    <ArrowTrendingUpIcon className="w-5 h-5" />
                    <span>예측 분석</span>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-7xl h-5/6 overflow-hidden">
                {/* 헤더 */}
                <div className="bg-gray-900 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-800 rounded-lg">
                                <ArrowTrendingUpIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">고도화된 AI 지능형 예측 분석 시스템</h3>
                                <p className="text-gray-400 text-sm">미래 트렌드 예측 및 분석</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-sm">{predictionResults.length}개 예측</span>
                            </div>
                            <button
                                onClick={onToggle}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 탭 네비게이션 */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                    {[
                        { id: 'models', label: '모델', icon: CpuChipIcon },
                        { id: 'predictions', label: '예측', icon: ArrowTrendingUpIcon },
                        { id: 'insights', label: '인사이트', icon: LightBulbIcon },
                        { id: 'analytics', label: '분석', icon: ChartPieIcon },
                        { id: 'settings', label: '설정', icon: CogIcon }
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id as any)}
                            className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${activeTab === id
                                ? 'text-gray-900 border-b-2 border-gray-900 bg-white'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>

                {/* 컨텐츠 영역 */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {activeTab === 'models' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">예측 모델</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {predictionModels.map(model => (
                                        <div key={model.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-2">
                                                    {getTypeIcon(model.type)}
                                                    <div>
                                                        <h5 className="font-semibold text-gray-900">{model.name}</h5>
                                                        <p className="text-sm text-gray-500">{model.type}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(model.status)}`}>
                                                    {model.status}
                                                </span>
                                            </div>
                                            <div className="space-y-2 text-sm mb-3">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">정확도:</span>
                                                    <span className="font-semibold text-gray-900">{model.accuracy}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">정밀도:</span>
                                                    <span className="font-semibold text-gray-900">{model.precision}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">재현율:</span>
                                                    <span className="font-semibold text-gray-900">{model.recall}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">예측 기간:</span>
                                                    <span className="font-semibold text-gray-900">{model.predictionHorizon}일</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">사용 횟수:</span>
                                                    <span className="font-semibold text-gray-900">{model.usage.toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button className="flex-1 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors">
                                                    사용
                                                </button>
                                                <button className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors">
                                                    설정
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'predictions' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">예측 결과</h4>
                                <div className="space-y-4">
                                    {predictionResults.map(prediction => {
                                        const model = predictionModels.find(m => m.id === prediction.modelId);
                                        return (
                                            <div key={prediction.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <h5 className="font-semibold text-gray-900">{prediction.target}</h5>
                                                        <p className="text-sm text-gray-500">{model?.name} • {prediction.timestamp}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getConfidenceColor(prediction.confidence)}`}>
                                                            {prediction.confidence}%
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                                                    <div className="text-center p-3 bg-white rounded border">
                                                        <div className="text-lg font-bold text-blue-600">{prediction.prediction}</div>
                                                        <div className="text-xs text-gray-600">예측값</div>
                                                    </div>
                                                    {prediction.actualValue && (
                                                        <div className="text-center p-3 bg-white rounded border">
                                                            <div className="text-lg font-bold text-green-600">{prediction.actualValue}</div>
                                                            <div className="text-xs text-gray-600">실제값</div>
                                                        </div>
                                                    )}
                                                    {prediction.error && (
                                                        <div className="text-center p-3 bg-white rounded border">
                                                            <div className="text-lg font-bold text-orange-600">{prediction.error}</div>
                                                            <div className="text-xs text-gray-600">오차</div>
                                                        </div>
                                                    )}
                                                    <div className="text-center p-3 bg-white rounded border">
                                                        <div className="text-lg font-bold text-purple-600">{prediction.horizon}일</div>
                                                        <div className="text-xs text-gray-600">예측 기간</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4 text-sm">
                                                        <span className="text-gray-600">모델: {model?.type}</span>
                                                        <span className="text-gray-600">신뢰도: {prediction.confidence}%</span>
                                                    </div>
                                                    <button className="text-blue-600 hover:text-blue-700 font-medium">
                                                        상세 보기
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'insights' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">예측 인사이트</h4>
                                <div className="space-y-4">
                                    {predictionResults.flatMap(pred => pred.insights).map(insight => (
                                        <div key={insight.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h5 className="font-semibold text-gray-900">{insight.title}</h5>
                                                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                                                </div>
                                                <span className="text-sm text-gray-500">{insight.confidence}%</span>
                                            </div>
                                            <div className="text-sm text-gray-700 bg-white p-3 rounded border">
                                                <strong>분석 결과:</strong> {insight.value}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">예측 분석</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-emerald-600">{predictionModels.length}</div>
                                        <div className="text-sm text-gray-600">활성 모델</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {(predictionResults.reduce((acc, pred) => acc + pred.confidence, 0) / predictionResults.length).toFixed(1)}%
                                        </div>
                                        <div className="text-sm text-gray-600">평균 신뢰도</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {predictionResults.filter(pred => pred.actualValue && pred.error && pred.error < 5).length}
                                        </div>
                                        <div className="text-sm text-gray-600">높은 정확도 예측</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-orange-600">
                                            {predictionResults.length}
                                        </div>
                                        <div className="text-sm text-gray-600">총 예측 수</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">예측 설정</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">실시간 예측</h5>
                                            <p className="text-sm text-gray-600">실시간 예측 업데이트 활성화</p>
                                        </div>
                                        <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${predictionSettings.enableRealTime
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-gray-300 text-gray-700'
                                            }`}>
                                            {predictionSettings.enableRealTime ? '활성화' : '비활성화'}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">자동 재학습</h5>
                                            <p className="text-sm text-gray-600">모델 자동 재학습 활성화</p>
                                        </div>
                                        <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${predictionSettings.enableAutoRetraining
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-gray-300 text-gray-700'
                                            }`}>
                                            {predictionSettings.enableAutoRetraining ? '활성화' : '비활성화'}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">예측 기간</h5>
                                            <p className="text-sm text-gray-600">기본 예측 기간 설정</p>
                                        </div>
                                        <select
                                            value={predictionSettings.predictionHorizon}
                                            onChange={(e) => setPredictionSettings(prev => ({ ...prev, predictionHorizon: parseInt(e.target.value) }))}
                                            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        >
                                            <option value={1}>1일</option>
                                            <option value={7}>7일</option>
                                            <option value={30}>30일</option>
                                            <option value={90}>90일</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdvancedAIPredictiveAnalytics; 