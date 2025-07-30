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
    AcademicCapIcon as GraduationCapIcon,
    FaceSmileIcon,
    BookOpenIcon,
    InformationCircleIcon,
    ExclamationTriangleIcon as AlertTriangleIcon,
    BoltIcon as LightningBoltIcon,
    PlayIcon,
    PauseIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
    timestamp: number;
    persuasion_potential: number;
    emotional_impact: number;
    cognitive_load: number;
    neural_activation: number;
    manipulation_score: number;
    safety_score: number;
    message_count: number;
    active_participants: number;
    sentiment_score: number;
}

interface GeneratedMessage {
    id: string;
    content: string;
    model: string;
    confidence: number;
    psychological_metrics: {
        persuasion_potential: number;
        emotional_impact: number;
        cognitive_load: number;
        neural_activation: number;
        manipulation_score: number;
    };
    safety_score: number;
    generation_time: number;
    tokens_used: number;
    quality_score: number;
}

interface IntegratedAnalyticsDashboardProps {
    isActive: boolean;
    onToggle: () => void;
}

const IntegratedAnalyticsDashboard: React.FC<IntegratedAnalyticsDashboardProps> = ({
    isActive,
    onToggle
}) => {
    const [currentData, setCurrentData] = useState<AnalyticsData>({
        timestamp: Date.now(),
        persuasion_potential: 0.75,
        emotional_impact: 0.68,
        cognitive_load: 0.45,
        neural_activation: 0.82,
        manipulation_score: 0.35,
        safety_score: 0.78,
        message_count: 156,
        active_participants: 12,
        sentiment_score: 0.72
    });

    const [generatedMessages, setGeneratedMessages] = useState<GeneratedMessage[]>([]);
    const [isSimulationRunning, setIsSimulationRunning] = useState(false);
    const [activeTab, setActiveTab] = useState<'analytics' | 'messages' | 'simulation'>('analytics');

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isSimulationRunning) {
            interval = setInterval(() => {
                setCurrentData(prev => ({
                    ...prev,
                    timestamp: Date.now(),
                    persuasion_potential: Math.max(0, Math.min(1, prev.persuasion_potential + (Math.random() - 0.5) * 0.1)),
                    emotional_impact: Math.max(0, Math.min(1, prev.emotional_impact + (Math.random() - 0.5) * 0.1)),
                    cognitive_load: Math.max(0, Math.min(1, prev.cognitive_load + (Math.random() - 0.5) * 0.1)),
                    neural_activation: Math.max(0, Math.min(1, prev.neural_activation + (Math.random() - 0.5) * 0.1)),
                    manipulation_score: Math.max(0, Math.min(1, prev.manipulation_score + (Math.random() - 0.5) * 0.1)),
                    safety_score: Math.max(0, Math.min(1, prev.safety_score + (Math.random() - 0.5) * 0.1)),
                    message_count: prev.message_count + Math.floor(Math.random() * 3),
                    active_participants: Math.max(1, prev.active_participants + Math.floor(Math.random() * 3) - 1),
                    sentiment_score: Math.max(0, Math.min(1, prev.sentiment_score + (Math.random() - 0.5) * 0.1))
                }));
            }, 2000);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isSimulationRunning]);

    const getMetricColor = (value: number, type: string) => {
        if (type === 'safety') {
            return value > 0.7 ? 'text-green-500' : value > 0.4 ? 'text-yellow-500' : 'text-red-500';
        }
        return value > 0.7 ? 'text-blue-500' : value > 0.4 ? 'text-yellow-500' : 'text-red-500';
    };

    const getMetricBarColor = (value: number) => {
        if (value >= 0.8) return 'bg-green-500';
        if (value >= 0.6) return 'bg-yellow-500';
        if (value >= 0.4) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const generateMessage = () => {
        const newMessage: GeneratedMessage = {
            id: Date.now().toString(),
            content: `AI가 생성한 메시지 ${generatedMessages.length + 1}: 현재 상황에 대한 분석과 함께 최적의 접근 방안을 제시합니다.`,
            model: 'neural',
            confidence: Math.random() * 20 + 80,
            psychological_metrics: {
                persuasion_potential: Math.random() * 0.3 + 0.7,
                emotional_impact: Math.random() * 0.3 + 0.6,
                cognitive_load: Math.random() * 0.4 + 0.3,
                neural_activation: Math.random() * 0.3 + 0.7,
                manipulation_score: Math.random() * 0.4 + 0.3
            },
            safety_score: Math.random() * 0.2 + 0.7,
            generation_time: Math.random() * 2 + 1,
            tokens_used: Math.floor(Math.random() * 500 + 200),
            quality_score: Math.random() * 20 + 80
        };

        setGeneratedMessages(prev => [newMessage, ...prev]);
    };

    if (!isActive) {
        return (
            <div className="fixed bottom-4 left-4 z-50">
                <button
                    onClick={onToggle}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                >
                    <ChartBarIcon className="w-5 h-5" />
                    <span>통합 분석</span>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-6xl h-5/6 overflow-hidden">
                {/* 헤더 */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <ChartBarIcon className="w-6 h-6" />
                            <h3 className="font-semibold text-lg">통합 분석 대시보드</h3>
                        </div>
                        <button
                            onClick={onToggle}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <XCircleIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* 탭 네비게이션 */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'analytics'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        실시간 분석
                    </button>
                    <button
                        onClick={() => setActiveTab('messages')}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'messages'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        메시지 생성
                    </button>
                    <button
                        onClick={() => setActiveTab('simulation')}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'simulation'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        시뮬레이션
                    </button>
                </div>

                {/* 컨텐츠 영역 */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'analytics' && (
                        <div className="space-y-6">
                            {/* 실시간 메트릭 */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <FireIcon className="w-5 h-5 text-blue-600" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">설득력</span>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <span className={`text-2xl font-bold ${getMetricColor(currentData.persuasion_potential, 'persuasion')}`}>
                                            {Math.round(currentData.persuasion_potential * 100)}%
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900 dark:to-pink-800 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <HeartIcon className="w-5 h-5 text-pink-600" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">감정적 영향</span>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <span className={`text-2xl font-bold ${getMetricColor(currentData.emotional_impact, 'emotional')}`}>
                                            {Math.round(currentData.emotional_impact * 100)}%
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <CpuChipIcon className="w-5 h-5 text-purple-600" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">신경 활성화</span>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <span className={`text-2xl font-bold ${getMetricColor(currentData.neural_activation, 'neural')}`}>
                                            {Math.round(currentData.neural_activation * 100)}%
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900 dark:to-emerald-800 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">안전도</span>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <span className={`text-2xl font-bold ${getMetricColor(currentData.safety_score, 'safety')}`}>
                                            {Math.round(currentData.safety_score * 100)}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 상세 메트릭 */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">심리적 지표</h4>
                                    <div className="space-y-4">
                                        {Object.entries({
                                            '인지 부하': currentData.cognitive_load,
                                            '조작도': currentData.manipulation_score,
                                            '감정 점수': currentData.sentiment_score
                                        }).map(([label, value]) => (
                                            <div key={label} className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">{label}</span>
                                                    <span className={`font-medium ${getMetricColor(value, 'default')}`}>
                                                        {(value * 100).toFixed(1)}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${getMetricBarColor(value)}`}
                                                        style={{ width: `${value * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">활동 지표</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">총 메시지 수</span>
                                            <span className="text-2xl font-bold text-blue-600">{currentData.message_count}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">활성 참여자</span>
                                            <span className="text-2xl font-bold text-green-600">{currentData.active_participants}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">마지막 업데이트</span>
                                            <span className="text-sm text-gray-500">
                                                {new Date(currentData.timestamp).toLocaleTimeString('ko-KR')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'messages' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">생성된 메시지</h4>
                                <button
                                    onClick={generateMessage}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
                                >
                                    <StarIcon className="w-4 h-4" />
                                    <span>새 메시지 생성</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {generatedMessages.map(message => (
                                    <div key={message.id} className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {message.model} AI
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {message.confidence.toFixed(1)}% 신뢰도
                                            </span>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 mb-3">
                                            {message.content}
                                        </p>
                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">품질 점수:</span>
                                                <span className="font-medium">{message.quality_score.toFixed(1)}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">안전도:</span>
                                                <span className="font-medium">{(message.safety_score * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">생성 시간:</span>
                                                <span className="font-medium">{message.generation_time.toFixed(1)}s</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">토큰 사용:</span>
                                                <span className="font-medium">{message.tokens_used}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'simulation' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">데이터 시뮬레이션</h4>
                                <button
                                    onClick={() => setIsSimulationRunning(!isSimulationRunning)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${isSimulationRunning
                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                        : 'bg-green-500 text-white hover:bg-green-600'
                                        }`}
                                >
                                    {isSimulationRunning ? (
                                        <>
                                            <PauseIcon className="w-4 h-4" />
                                            <span>시뮬레이션 정지</span>
                                        </>
                                    ) : (
                                        <>
                                            <PlayIcon className="w-4 h-4" />
                                            <span>시뮬레이션 시작</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                                <h5 className="text-md font-semibold text-gray-900 dark:text-white mb-4">시뮬레이션 상태</h5>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">상태:</span>
                                        <span className={isSimulationRunning ? 'text-green-600' : 'text-gray-500'}>
                                            {isSimulationRunning ? '실행 중' : '정지됨'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">업데이트 주기:</span>
                                        <span className="text-gray-700 dark:text-gray-300">2초</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">마지막 업데이트:</span>
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {new Date(currentData.timestamp).toLocaleTimeString('ko-KR')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">데이터 포인트:</span>
                                        <span className="text-gray-700 dark:text-gray-300">{currentData.message_count}</span>
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

export default IntegratedAnalyticsDashboard; 