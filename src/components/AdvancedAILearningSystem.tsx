import React, { useState, useEffect } from 'react';
import {
  StarIcon,
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
    ChartBarIcon,
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
    CpuChipIcon
} from '@heroicons/react/24/outline';

interface AIModel {
    id: string;
    name: string;
    type: 'neural' | 'quantum' | 'extreme' | 'personalized' | 'hybrid' | 'experimental';
    version: string;
    status: 'online' | 'training' | 'offline' | 'error';
    performance: {
        accuracy: number;
        speed: number;
        efficiency: number;
        learning_rate: number;
    };
    training_data: {
        total_samples: number;
        processed_samples: number;
        success_rate: number;
        error_rate: number;
    };
    last_updated: string;
    next_training: string;
}

interface LearningSession {
    id: string;
    model_id: string;
    start_time: string;
    duration: number;
    samples_processed: number;
    accuracy_improvement: number;
    status: 'running' | 'completed' | 'failed';
    errors: string[];
}

interface ModelComparison {
    model_id: string;
    content: string;
    confidence: number;
    psychological_metrics: {
        persuasion_potential: number;
        emotional_impact: number;
        cognitive_load: number;
        neural_activation: number;
        manipulation_score: number;
    };
    generation_time: number;
    tokens_used: number;
    quality_score: number;
}

interface AdvancedAILearningSystemProps {
    isActive: boolean;
    onToggle: () => void;
}

const AdvancedAILearningSystem: React.FC<AdvancedAILearningSystemProps> = ({
    isActive,
    onToggle
}) => {
    const [models, setModels] = useState<AIModel[]>([
        {
            id: 'neural-v1',
            name: 'Neural Network v1.0',
            type: 'neural',
            version: '1.0.0',
            status: 'online',
            performance: {
                accuracy: 94.2,
                speed: 0.8,
                efficiency: 87.5,
                learning_rate: 0.001
            },
            training_data: {
                total_samples: 15420,
                processed_samples: 12350,
                success_rate: 92.3,
                error_rate: 7.7
            },
            last_updated: '2시간 전',
            next_training: '6시간 후'
        },
        {
            id: 'quantum-v2',
            name: 'Quantum AI v2.0',
            type: 'quantum',
            version: '2.0.1',
            status: 'training',
            performance: {
                accuracy: 96.8,
                speed: 0.9,
                efficiency: 92.1,
                learning_rate: 0.002
            },
            training_data: {
                total_samples: 8920,
                processed_samples: 6540,
                success_rate: 95.7,
                error_rate: 4.3
            },
            last_updated: '30분 전',
            next_training: '진행 중'
        },
        {
            id: 'extreme-v3',
            name: 'Extreme Persuasion v3.0',
            type: 'extreme',
            version: '3.0.0',
            status: 'online',
            performance: {
                accuracy: 98.5,
                speed: 0.7,
                efficiency: 89.3,
                learning_rate: 0.003
            },
            training_data: {
                total_samples: 6780,
                processed_samples: 6780,
                success_rate: 97.2,
                error_rate: 2.8
            },
            last_updated: '1시간 전',
            next_training: '12시간 후'
        },
        {
            id: 'personalized-v1',
            name: 'Personalized AI v1.0',
            type: 'personalized',
            version: '1.0.0',
            status: 'offline',
            performance: {
                accuracy: 91.3,
                speed: 0.6,
                efficiency: 85.7,
                learning_rate: 0.0015
            },
            training_data: {
                total_samples: 4320,
                processed_samples: 3200,
                success_rate: 88.9,
                error_rate: 11.1
            },
            last_updated: '4시간 전',
            next_training: '8시간 후'
        },
        {
            id: 'hybrid-v2',
            name: 'Hybrid Model v2.0',
            type: 'hybrid',
            version: '2.0.0',
            status: 'online',
            performance: {
                accuracy: 97.1,
                speed: 0.85,
                efficiency: 90.2,
                learning_rate: 0.0025
            },
            training_data: {
                total_samples: 11200,
                processed_samples: 9800,
                success_rate: 94.8,
                error_rate: 5.2
            },
            last_updated: '1시간 전',
            next_training: '10시간 후'
        },
        {
            id: 'experimental-v1',
            name: 'Experimental AI v1.0',
            type: 'experimental',
            version: '1.0.0-alpha',
            status: 'error',
            performance: {
                accuracy: 89.7,
                speed: 0.5,
                efficiency: 78.4,
                learning_rate: 0.004
            },
            training_data: {
                total_samples: 2100,
                processed_samples: 1800,
                success_rate: 82.3,
                error_rate: 17.7
            },
            last_updated: '6시간 전',
            next_training: '24시간 후'
        }
    ]);

    const [learningSessions, setLearningSessions] = useState<LearningSession[]>([
        {
            id: 'session-1',
            model_id: 'quantum-v2',
            start_time: '30분 전',
            duration: 1800,
            samples_processed: 6540,
            accuracy_improvement: 2.3,
            status: 'running',
            errors: []
        },
        {
            id: 'session-2',
            model_id: 'neural-v1',
            start_time: '2시간 전',
            duration: 3600,
            samples_processed: 12350,
            accuracy_improvement: 1.8,
            status: 'completed',
            errors: []
        },
        {
            id: 'session-3',
            model_id: 'experimental-v1',
            start_time: '6시간 전',
            duration: 1200,
            samples_processed: 1800,
            accuracy_improvement: -0.5,
            status: 'failed',
            errors: ['메모리 부족', '학습률 불안정']
        }
    ]);

    const [modelComparisons, setModelComparisons] = useState<ModelComparison[]>([]);
    const [selectedModels, setSelectedModels] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'training' | 'comparison' | 'analytics'>('overview');
    const [isComparing, setIsComparing] = useState(false);

    useEffect(() => {
        // 실시간 모델 성능 업데이트 시뮬레이션
        const interval = setInterval(() => {
            setModels(prev => prev.map(model => ({
                ...model,
                performance: {
                    ...model.performance,
                    accuracy: Math.max(80, Math.min(100, model.performance.accuracy + (Math.random() - 0.5) * 0.5)),
                    speed: Math.max(0.1, Math.min(1, model.performance.speed + (Math.random() - 0.5) * 0.1)),
                    efficiency: Math.max(70, Math.min(100, model.performance.efficiency + (Math.random() - 0.5) * 1))
                },
                training_data: {
                    ...model.training_data,
                    processed_samples: model.training_data.processed_samples + Math.floor(Math.random() * 10),
                    success_rate: Math.max(70, Math.min(100, model.training_data.success_rate + (Math.random() - 0.5) * 0.5))
                }
            })));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const getModelIcon = (type: string) => {
        switch (type) {
            case 'neural': return <CpuChipIcon className="w-4 h-4" />;
            case 'quantum': return <StarIcon className="w-4 h-4" />;
            case 'extreme': return <FireIcon className="w-4 h-4" />;
            case 'personalized': return <HeartIcon className="w-4 h-4" />;
            case 'hybrid': return <RocketLaunchIcon className="w-4 h-4" />;
            case 'experimental': return <BeakerIcon className="w-4 h-4" />;
            default: return <CpuChipIcon className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'training': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'offline': return 'text-gray-600 bg-gray-50 border-gray-200';
            case 'error': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getPerformanceColor = (value: number, threshold: number) => {
        if (value >= threshold * 0.9) return 'text-emerald-600';
        if (value >= threshold * 0.7) return 'text-amber-600';
        return 'text-red-600';
    };

    const toggleModelSelection = (modelId: string) => {
        setSelectedModels(prev =>
            prev.includes(modelId)
                ? prev.filter(id => id !== modelId)
                : [...prev, modelId]
        );
    };

    const generateComparison = async () => {
        if (selectedModels.length < 2) return;

        setIsComparing(true);

        // 시뮬레이션된 비교 생성
        const testContent = "안녕하세요, 오늘 날씨가 정말 좋네요. 혹시 시간이 되시면 함께 커피 한 잔 어떠세요?";

        const comparisons: ModelComparison[] = selectedModels.map(modelId => {
            const model = models.find(m => m.id === modelId);
            return {
                model_id: modelId,
                content: testContent,
                confidence: Math.random() * 20 + 80,
                psychological_metrics: {
                    persuasion_potential: Math.random() * 30 + 70,
                    emotional_impact: Math.random() * 25 + 75,
                    cognitive_load: Math.random() * 20 + 30,
                    neural_activation: Math.random() * 30 + 70,
                    manipulation_score: Math.random() * 15 + 20
                },
                generation_time: Math.random() * 200 + 100,
                tokens_used: Math.floor(Math.random() * 50) + 20,
                quality_score: Math.random() * 20 + 80
            };
        });

        setModelComparisons(comparisons);
        setIsComparing(false);
    };

    if (!isActive) {
        return (
            <div className="absolute bottom-4 left-4 z-50">
                <button
                    onClick={onToggle}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2"
                >
                    <CpuChipIcon className="w-5 h-5" />
                    <span>AI 학습 시스템</span>
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
                                <h3 className="font-semibold text-lg">AI 모델 통합 및 학습 시스템</h3>
                                <p className="text-gray-400 text-sm">고도화된 AI 모델 관리 및 성능 분석</p>
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
                        { id: 'overview', label: '시스템 개요', icon: ChartBarIcon },
                        { id: 'models', label: 'AI 모델 관리', icon: CpuChipIcon },
                        { id: 'training', label: '학습 세션', icon: AcademicCapIcon },
                        { id: 'comparison', label: '모델 비교', icon: MagnifyingGlassIcon },
                        { id: 'analytics', label: '성능 분석', icon: ChartBarIcon }
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
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* 시스템 상태 */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <CpuChipIcon className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <span className="text-2xl font-bold text-gray-900">{models.length}</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">총 모델</p>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-emerald-100 rounded-lg">
                                            <PlayIcon className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <span className="text-2xl font-bold text-gray-900">
                                            {models.filter(m => m.status === 'online').length}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">온라인</p>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <ArrowPathIcon className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <span className="text-2xl font-bold text-gray-900">
                                            {models.filter(m => m.status === 'training').length}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">학습 중</p>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-red-100 rounded-lg">
                                            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                                        </div>
                                        <span className="text-2xl font-bold text-gray-900">
                                            {models.filter(m => m.status === 'error').length}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">오류</p>
                                </div>
                            </div>

                            {/* 성능 요약 */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">평균 성능</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">정확도</span>
                                            <span className="font-semibold text-gray-900">
                                                {(models.reduce((sum, m) => sum + m.performance.accuracy, 0) / models.length).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">속도</span>
                                            <span className="font-semibold text-gray-900">
                                                {(models.reduce((sum, m) => sum + m.performance.speed, 0) / models.length).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">효율성</span>
                                            <span className="font-semibold text-gray-900">
                                                {(models.reduce((sum, m) => sum + m.performance.efficiency, 0) / models.length).toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">학습 통계</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">총 샘플</span>
                                            <span className="font-semibold text-gray-900">
                                                {models.reduce((sum, m) => sum + m.training_data.total_samples, 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">처리된 샘플</span>
                                            <span className="font-semibold text-gray-900">
                                                {models.reduce((sum, m) => sum + m.training_data.processed_samples, 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">평균 성공률</span>
                                            <span className="font-semibold text-gray-900">
                                                {(models.reduce((sum, m) => sum + m.training_data.success_rate, 0) / models.length).toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'models' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                {models.map(model => (
                                    <div key={model.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-gray-100 rounded-lg">
                                                    {getModelIcon(model.type)}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{model.name}</h4>
                                                    <p className="text-sm text-gray-500">v{model.version}</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(model.status)}`}>
                                                {model.status}
                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">정확도:</span>
                                                    <span className={`font-semibold ${getPerformanceColor(model.performance.accuracy, 100)}`}>
                                                        {model.performance.accuracy.toFixed(1)}%
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">속도:</span>
                                                    <span className={`font-semibold ${getPerformanceColor(model.performance.speed, 1)}`}>
                                                        {(model.performance.speed * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">효율성:</span>
                                                    <span className={`font-semibold ${getPerformanceColor(model.performance.efficiency, 100)}`}>
                                                        {model.performance.efficiency.toFixed(1)}%
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">학습률:</span>
                                                    <span className="font-semibold text-gray-900">
                                                        {model.performance.learning_rate.toFixed(4)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                                                마지막 업데이트: {model.last_updated}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'training' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">학습 세션</h4>
                                <div className="space-y-4">
                                    {learningSessions.map(session => (
                                        <div key={session.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                                    <span className="font-semibold text-gray-900">
                                                        {models.find(m => m.id === session.model_id)?.name}
                                                    </span>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
                                                    {session.status}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">시작 시간:</span>
                                                    <span className="text-gray-900">{session.start_time}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">지속 시간:</span>
                                                    <span className="text-gray-900">{Math.floor(session.duration / 60)}분</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">처리된 샘플:</span>
                                                    <span className="text-gray-900">{session.samples_processed.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">정확도 향상:</span>
                                                    <span className={`font-semibold ${session.accuracy_improvement >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                        {session.accuracy_improvement > 0 ? '+' : ''}{session.accuracy_improvement.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>

                                            {session.errors.length > 0 && (
                                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                    <div className="text-sm text-red-800">
                                                        오류: {session.errors.join(', ')}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'comparison' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">모델 비교</h4>

                                <div className="mb-6">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <span className="text-sm font-medium text-gray-700">비교할 모델 선택:</span>
                                        <div className="flex flex-wrap gap-2">
                                            {models.map(model => (
                                                <button
                                                    key={model.id}
                                                    onClick={() => toggleModelSelection(model.id)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${selectedModels.includes(model.id)
                                                        ? 'bg-gray-900 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {model.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={generateComparison}
                                        disabled={selectedModels.length < 2 || isComparing}
                                        className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200"
                                    >
                                        {isComparing ? (
                                            <>
                                                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                                <span>비교 생성 중...</span>
                                            </>
                                        ) : (
                                            <>
                                                <StarIcon className="w-4 h-4" />
                                                <span>비교 실행</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {modelComparisons.length > 0 && (
                                    <div className="space-y-4">
                                        {modelComparisons.map(comparison => {
                                            const model = models.find(m => m.id === comparison.model_id);
                                            return (
                                                <div key={comparison.model_id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h5 className="font-semibold text-gray-900">{model?.name}</h5>
                                                        <span className="text-sm text-gray-600">
                                                            신뢰도: {comparison.confidence.toFixed(1)}%
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">설득력:</span>
                                                            <span className="font-semibold text-gray-900">
                                                                {comparison.psychological_metrics.persuasion_potential.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">감정적 영향:</span>
                                                            <span className="font-semibold text-gray-900">
                                                                {comparison.psychological_metrics.emotional_impact.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">생성 시간:</span>
                                                            <span className="font-semibold text-gray-900">
                                                                {comparison.generation_time.toFixed(0)}ms
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">품질 점수:</span>
                                                            <span className="font-semibold text-gray-900">
                                                                {comparison.quality_score.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                                        <p className="text-sm text-gray-700">
                                                            "{comparison.content}"
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">성능 분석</h4>
                                <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center">
                                    <div className="text-center">
                                        <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-500">성능 차트가 여기에 표시됩니다</p>
                                        <p className="text-sm text-gray-400">실시간 성능 모니터링</p>
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

export default AdvancedAILearningSystem; 