import React, { useState, useEffect } from 'react';
import {
    StarIcon,
    ChartBarIcon,
    FireIcon,
    BoltIcon,
    EyeIcon,
    HeartIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    UsersIcon,
    ChatBubbleLeftRightIcon,
    MagnifyingGlassIcon,
    CogIcon,
    RocketLaunchIcon,
    AcademicCapIcon,
    BeakerIcon,
    TrophyIcon,
    CalendarIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    Bars3Icon,
    ArrowPathIcon,
    LightBulbIcon,
    HandRaisedIcon,
    FaceSmileIcon,
    BookOpenIcon,
    InformationCircleIcon,
    PlayIcon,
    PauseIcon,
    ArrowsPointingOutIcon,
    ArrowsPointingInIcon,
    PlusIcon,
    MinusIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    Cog6ToothIcon,
    WrenchScrewdriverIcon,
    ComputerDesktopIcon,
    ServerIcon,
    CloudIcon,
    SignalIcon,
    WifiIcon,
    DevicePhoneMobileIcon,
    ChartPieIcon,
    PresentationChartLineIcon,
    TableCellsIcon,
    CubeIcon,
    CubeTransparentIcon,
    SwatchIcon,
    PaintBrushIcon,
    AdjustmentsHorizontalIcon,
    FunnelIcon,
    ViewColumnsIcon,
    Squares2X2Icon,
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
    CpuChipIcon
} from '@heroicons/react/24/outline';

interface PredictionModel {
    id: string;
    name: string;
    type: 'behavior' | 'response' | 'market' | 'sentiment' | 'trend';
    accuracy: number;
    confidence: number;
    lastUpdated: string;
    status: 'active' | 'training' | 'inactive';
    predictions: Prediction[];
}

interface Prediction {
    id: string;
    modelId: string;
    target: string;
    predictedValue: number;
    confidence: number;
    timeframe: string;
    factors: string[];
    impact: 'high' | 'medium' | 'low';
    timestamp: string;
}

interface AnalysisResult {
    id: string;
    type: 'user_behavior' | 'message_effectiveness' | 'market_trend' | 'sentiment_analysis';
    data: any;
    insights: string[];
    recommendations: string[];
    riskFactors: string[];
    opportunities: string[];
}

interface AdvancedAIPredictionSystemProps {
    isActive: boolean;
    onToggle: () => void;
}

const AdvancedAIPredictionSystem: React.FC<AdvancedAIPredictionSystemProps> = ({
    isActive,
    onToggle
}) => {
    const [predictionModels, setPredictionModels] = useState<PredictionModel[]>([
        {
            id: 'behavior-v1',
            name: '사용자 행동 예측 모델',
            type: 'behavior',
            accuracy: 94.2,
            confidence: 0.89,
            lastUpdated: '2시간 전',
            status: 'active',
            predictions: [
                {
                    id: 'pred-1',
                    modelId: 'behavior-v1',
                    target: '메시지 응답률',
                    predictedValue: 78.5,
                    confidence: 0.92,
                    timeframe: '24시간',
                    factors: ['시간대', '메시지 길이', '감정 톤'],
                    impact: 'high',
                    timestamp: new Date().toISOString()
                }
            ]
        },
        {
            id: 'response-v2',
            name: '응답 효과 예측 모델',
            type: 'response',
            accuracy: 91.8,
            confidence: 0.87,
            lastUpdated: '1시간 전',
            status: 'active',
            predictions: [
                {
                    id: 'pred-2',
                    modelId: 'response-v2',
                    target: '설득 성공률',
                    predictedValue: 82.3,
                    confidence: 0.89,
                    timeframe: '1주일',
                    factors: ['개인화 수준', '타이밍', '컨텍스트'],
                    impact: 'high',
                    timestamp: new Date().toISOString()
                }
            ]
        },
        {
            id: 'market-v1',
            name: '시장 트렌드 예측 모델',
            type: 'market',
            accuracy: 88.7,
            confidence: 0.84,
            lastUpdated: '30분 전',
            status: 'training',
            predictions: [
                {
                    id: 'pred-3',
                    modelId: 'market-v1',
                    target: '시장 반응도',
                    predictedValue: 65.2,
                    confidence: 0.76,
                    timeframe: '1개월',
                    factors: ['경제 지표', '경쟁사 활동', '소비자 선호도'],
                    impact: 'medium',
                    timestamp: new Date().toISOString()
                }
            ]
        },
        {
            id: 'sentiment-v1',
            name: '감정 분석 예측 모델',
            type: 'sentiment',
            accuracy: 96.1,
            confidence: 0.93,
            lastUpdated: '15분 전',
            status: 'active',
            predictions: [
                {
                    id: 'pred-4',
                    modelId: 'sentiment-v1',
                    target: '긍정적 반응률',
                    predictedValue: 71.8,
                    confidence: 0.91,
                    timeframe: '12시간',
                    factors: ['언어 패턴', '이모티콘 사용', '키워드'],
                    impact: 'medium',
                    timestamp: new Date().toISOString()
                }
            ]
        },
        {
            id: 'trend-v1',
            name: '트렌드 예측 모델',
            type: 'trend',
            accuracy: 89.4,
            confidence: 0.86,
            lastUpdated: '45분 전',
            status: 'active',
            predictions: [
                {
                    id: 'pred-5',
                    modelId: 'trend-v1',
                    target: '바이럴 확산률',
                    predictedValue: 34.7,
                    confidence: 0.78,
                    timeframe: '3일',
                    factors: ['네트워크 효과', '콘텐츠 품질', '타이밍'],
                    impact: 'high',
                    timestamp: new Date().toISOString()
                }
            ]
        }
    ]);

    const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([
        {
            id: 'analysis-1',
            type: 'user_behavior',
            data: {
                activeUsers: 1247,
                avgSessionTime: 23.5,
                conversionRate: 12.8,
                retentionRate: 78.3
            },
            insights: [
                '사용자들이 오후 2-4시에 가장 활발하게 활동',
                '개인화된 메시지의 응답률이 40% 더 높음',
                '이모티콘 사용 시 참여도 25% 증가'
            ],
            recommendations: [
                '오후 2-4시에 주요 메시지 전송',
                '개인화 알고리즘 강화',
                '이모티콘 사용 권장'
            ],
            riskFactors: [
                '경쟁사 메시지 빈도 증가',
                '사용자 피로도 상승',
                '개인정보 보호 규제 강화'
            ],
            opportunities: [
                'AI 기반 개인화 강화',
                '멀티채널 전략 확장',
                '실시간 피드백 시스템 구축'
            ]
        },
        {
            id: 'analysis-2',
            type: 'message_effectiveness',
            data: {
                avgResponseTime: 2.3,
                successRate: 89.2,
                engagementScore: 7.8,
                viralCoefficient: 1.2
            },
            insights: [
                '짧은 메시지(50자 이하)가 더 높은 응답률',
                '질문 형태의 메시지가 대화 지속에 효과적',
                '감정적 호소보다 논리적 설명이 더 설득력 있음'
            ],
            recommendations: [
                '메시지 길이 50자 이하로 제한',
                '질문 형태의 메시지 비율 증가',
                '논리적 근거 제시 강화'
            ],
            riskFactors: [
                '메시지 스팸으로 인식될 위험',
                '개인화 부족으로 인한 무시',
                '타이밍 부적절로 인한 실패'
            ],
            opportunities: [
                'AI 기반 최적 타이밍 분석',
                '개인화 알고리즘 고도화',
                'A/B 테스트 시스템 구축'
            ]
        }
    ]);

    const [activeTab, setActiveTab] = useState<'models' | 'predictions' | 'analysis' | 'insights' | 'trends'>('models');
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [isGeneratingPrediction, setIsGeneratingPrediction] = useState(false);

    useEffect(() => {
        // 실시간 예측 모델 업데이트 시뮬레이션
        const interval = setInterval(() => {
            setPredictionModels(prev => prev.map(model => ({
                ...model,
                accuracy: Math.max(80, Math.min(100, model.accuracy + (Math.random() - 0.5) * 2)),
                confidence: Math.max(0.7, Math.min(1, model.confidence + (Math.random() - 0.5) * 0.1)),
                predictions: model.predictions.map(pred => ({
                    ...pred,
                    predictedValue: Math.max(0, Math.min(100, pred.predictedValue + (Math.random() - 0.5) * 5)),
                    confidence: Math.max(0.5, Math.min(1, pred.confidence + (Math.random() - 0.5) * 0.1))
                }))
            })));
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const getModelIcon = (type: string) => {
        switch (type) {
            case 'behavior': return <UsersIcon className="w-4 h-4" />;
            case 'response': return <ChatBubbleLeftRightIcon className="w-4 h-4" />;
            case 'market': return <ArrowTrendingUpIcon className="w-4 h-4" />;
            case 'sentiment': return <HeartIcon className="w-4 h-4" />;
            case 'trend': return <StarIcon className="w-4 h-4" />;
            default: return <CpuChipIcon className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'training': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'inactive': return 'text-gray-600 bg-gray-50 border-gray-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high': return 'text-red-600 bg-red-50 border-red-200';
            case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const generatePrediction = async () => {
        if (!selectedModel) return;

        setIsGeneratingPrediction(true);

        // 시뮬레이션된 예측 생성
        setTimeout(() => {
            const model = predictionModels.find(m => m.id === selectedModel);
            if (model) {
                const newPrediction: Prediction = {
                    id: `pred-${Date.now()}`,
                    modelId: selectedModel,
                    target: '새로운 예측',
                    predictedValue: Math.random() * 100,
                    confidence: 0.7 + Math.random() * 0.3,
                    timeframe: '24시간',
                    factors: ['AI 분석', '히스토리 데이터', '실시간 패턴'],
                    impact: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as any,
                    timestamp: new Date().toISOString()
                };

                setPredictionModels(prev => prev.map(m =>
                    m.id === selectedModel
                        ? { ...m, predictions: [...m.predictions, newPrediction] }
                        : m
                ));
            }
            setIsGeneratingPrediction(false);
        }, 2000);
    };

    if (!isActive) {
        return (
            <div className="absolute bottom-4 right-4 z-50">
                <button
                    onClick={onToggle}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2"
                >
                    <CpuChipIcon className="w-5 h-5" />
                    <span>AI 예측 시스템</span>
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
                                <CpuChipIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">고도화된 AI 예측 및 분석 시스템</h3>
                                <p className="text-gray-400 text-sm">사용자 행동 예측 및 시장 트렌드 분석</p>
                            </div>
                        </div>
                        <button
                            onClick={onToggle}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <XCircleIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* 탭 네비게이션 */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                    {[
                        { id: 'models', label: '예측 모델', icon: CpuChipIcon },
                        { id: 'predictions', label: '예측 결과', icon: ChartBarIcon },
                        { id: 'analysis', label: '데이터 분석', icon: MagnifyingGlassIcon },
                        { id: 'insights', label: '인사이트', icon: LightBulbIcon },
                        { id: 'trends', label: '트렌드', icon: ArrowTrendingUpIcon }
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
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-semibold text-gray-900">예측 모델 관리</h4>
                                    <div className="flex items-center space-x-4">
                                        <select
                                            value={selectedModel}
                                            onChange={(e) => setSelectedModel(e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        >
                                            <option value="">모델 선택</option>
                                            {predictionModels.map(model => (
                                                <option key={model.id} value={model.id}>{model.name}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={generatePrediction}
                                            disabled={!selectedModel || isGeneratingPrediction}
                                            className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200"
                                        >
                                            {isGeneratingPrediction ? (
                                                <>
                                                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                                    <span>예측 생성 중...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <StarIcon className="w-4 h-4" />
                                                    <span>예측 실행</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {predictionModels.map(model => (
                                        <div key={model.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-gray-200 rounded-lg">
                                                        {getModelIcon(model.type)}
                                                    </div>
                                                    <div>
                                                        <h5 className="font-semibold text-gray-900">{model.name}</h5>
                                                        <p className="text-sm text-gray-500">{model.type}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(model.status)}`}>
                                                    {model.status}
                                                </span>
                                            </div>

                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">정확도:</span>
                                                    <span className="font-semibold text-gray-900">{model.accuracy.toFixed(1)}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">신뢰도:</span>
                                                    <span className="font-semibold text-gray-900">{(model.confidence * 100).toFixed(1)}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">예측 수:</span>
                                                    <span className="font-semibold text-gray-900">{model.predictions.length}개</span>
                                                </div>
                                            </div>

                                            <div className="mt-3 text-xs text-gray-500">
                                                마지막 업데이트: {model.lastUpdated}
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
                                    {predictionModels.flatMap(model => model.predictions).map(prediction => {
                                        const model = predictionModels.find(m => m.id === prediction.modelId);
                                        return (
                                            <div key={prediction.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="p-2 bg-gray-200 rounded-lg">
                                                            {getModelIcon(model?.type || '')}
                                                        </div>
                                                        <div>
                                                            <h5 className="font-semibold text-gray-900">{prediction.target}</h5>
                                                            <p className="text-sm text-gray-500">{model?.name}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getImpactColor(prediction.impact)}`}>
                                                        {prediction.impact} impact
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">예측값:</span>
                                                        <span className="font-semibold text-gray-900">{prediction.predictedValue.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">신뢰도:</span>
                                                        <span className="font-semibold text-gray-900">{(prediction.confidence * 100).toFixed(1)}%</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">기간:</span>
                                                        <span className="font-semibold text-gray-900">{prediction.timeframe}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">생성:</span>
                                                        <span className="font-semibold text-gray-900">
                                                            {new Date(prediction.timestamp).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-3">
                                                    <p className="text-xs text-gray-600 mb-2">주요 요인:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {prediction.factors.map((factor, index) => (
                                                            <span key={index} className="px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded">
                                                                {factor}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'analysis' && (
                        <div className="space-y-6">
                            {analysisResults.map(result => (
                                <div key={result.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        {result.type === 'user_behavior' ? '사용자 행동 분석' :
                                            result.type === 'message_effectiveness' ? '메시지 효과성 분석' :
                                                result.type === 'market_trend' ? '시장 트렌드 분석' :
                                                    '감정 분석'}
                                    </h4>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <h5 className="font-medium text-gray-900 mb-3">주요 지표</h5>
                                            <div className="space-y-2">
                                                {Object.entries(result.data).map(([key, value]) => (
                                                    <div key={key} className="flex justify-between text-sm">
                                                        <span className="text-gray-600">{key}:</span>
                                                        <span className="font-semibold text-gray-900">{String(value)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h5 className="font-medium text-gray-900 mb-3">인사이트</h5>
                                            <ul className="space-y-2 text-sm">
                                                {result.insights.map((insight, index) => (
                                                    <li key={index} className="flex items-start space-x-2">
                                                        <LightBulbIcon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                                        <span className="text-gray-700">{insight}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                                        <div>
                                            <h5 className="font-medium text-gray-900 mb-3">권장사항</h5>
                                            <ul className="space-y-2 text-sm">
                                                {result.recommendations.map((rec, index) => (
                                                    <li key={index} className="flex items-start space-x-2">
                                                        <CheckCircleIcon className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                        <span className="text-gray-700">{rec}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h5 className="font-medium text-gray-900 mb-3">위험 요인</h5>
                                            <ul className="space-y-2 text-sm">
                                                {result.riskFactors.map((risk, index) => (
                                                    <li key={index} className="flex items-start space-x-2">
                                                        <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                                        <span className="text-gray-700">{risk}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h5 className="font-medium text-gray-900 mb-3">기회 요소</h5>
                                            <ul className="space-y-2 text-sm">
                                                {result.opportunities.map((opp, index) => (
                                                    <li key={index} className="flex items-start space-x-2">
                                                        <StarIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <span className="text-gray-700">{opp}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'insights' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">AI 인사이트</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                                            <h5 className="font-medium text-emerald-900 mb-2">긍정적 트렌드</h5>
                                            <ul className="space-y-1 text-sm text-emerald-800">
                                                <li>• 개인화 메시지 응답률 40% 증가</li>
                                                <li>• 이모티콘 사용 시 참여도 25% 향상</li>
                                                <li>• 오후 2-4시 활동량 최고점</li>
                                            </ul>
                                        </div>
                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <h5 className="font-medium text-blue-900 mb-2">개선 기회</h5>
                                            <ul className="space-y-1 text-sm text-blue-800">
                                                <li>• 메시지 길이 최적화 필요</li>
                                                <li>• 질문 형태 메시지 비율 증가</li>
                                                <li>• 타이밍 최적화 알고리즘 강화</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                            <h5 className="font-medium text-amber-900 mb-2">주의 사항</h5>
                                            <ul className="space-y-1 text-sm text-amber-800">
                                                <li>• 스팸으로 인식될 위험 증가</li>
                                                <li>• 사용자 피로도 상승 추세</li>
                                                <li>• 개인정보 보호 규제 강화</li>
                                            </ul>
                                        </div>
                                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                            <h5 className="font-medium text-purple-900 mb-2">전략적 제안</h5>
                                            <ul className="space-y-1 text-sm text-purple-800">
                                                <li>• AI 기반 개인화 강화</li>
                                                <li>• 멀티채널 전략 확장</li>
                                                <li>• 실시간 피드백 시스템 구축</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'trends' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">트렌드 분석</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h5 className="font-medium text-gray-900 mb-3">사용자 행동 트렌드</h5>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">모바일 사용률:</span>
                                                <span className="font-semibold text-gray-900">78.5% ↗</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">평균 세션 시간:</span>
                                                <span className="font-semibold text-gray-900">23.5분 ↗</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">전환율:</span>
                                                <span className="font-semibold text-gray-900">12.8% ↗</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h5 className="font-medium text-gray-900 mb-3">메시지 효과 트렌드</h5>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">응답률:</span>
                                                <span className="font-semibold text-gray-900">89.2% ↗</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">참여도 점수:</span>
                                                <span className="font-semibold text-gray-900">7.8/10 ↗</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">바이럴 계수:</span>
                                                <span className="font-semibold text-gray-900">1.2 ↗</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h5 className="font-medium text-gray-900 mb-3">시장 트렌드</h5>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">경쟁 강도:</span>
                                                <span className="font-semibold text-gray-900">높음 ↗</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">시장 성장률:</span>
                                                <span className="font-semibold text-gray-900">15.3% ↗</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">기술 혁신:</span>
                                                <span className="font-semibold text-gray-900">빠름 ↗</span>
                                            </div>
                                        </div>
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

export default AdvancedAIPredictionSystem; 