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
    CpuChipIcon
} from '@heroicons/react/24/outline';

interface AIModel {
    id: string;
    name: string;
    description: string;
    type: 'neural' | 'quantum' | 'extreme' | 'personalized' | 'hybrid' | 'experimental';
    power: number;
    accuracy: number;
    speed: number;
    cost: number;
    status: 'active' | 'training' | 'offline' | 'error';
    lastUsed: string;
    totalRequests: number;
    successRate: number;
}

interface ModelComparison {
    modelId: string;
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
    cost: number;
}

interface AdvancedAIModelIntegrationProps {
    isActive: boolean;
    onToggle: () => void;
}

const AdvancedAIModelIntegration: React.FC<AdvancedAIModelIntegrationProps> = ({
    isActive,
    onToggle
}) => {
    const [models, setModels] = useState<AIModel[]>([
        {
            id: 'neural-v1',
            name: '신경망 AI v1.0',
            description: '딥러닝 기반 자연스러운 대화',
            type: 'neural',
            power: 85,
            accuracy: 92,
            speed: 0.8,
            cost: 0.1,
            status: 'active',
            lastUsed: '2분 전',
            totalRequests: 15420,
            successRate: 94.5
        },
        {
            id: 'quantum-v2',
            name: '양자 AI v2.0',
            description: '양자 컴퓨팅 기반 고급 분석',
            type: 'quantum',
            power: 95,
            accuracy: 98,
            speed: 0.6,
            cost: 0.3,
            status: 'active',
            lastUsed: '1분 전',
            totalRequests: 8920,
            successRate: 97.2
        },
        {
            id: 'extreme-v3',
            name: '극한 설득 AI v3.0',
            description: '최대 설득력 집중',
            type: 'extreme',
            power: 100,
            accuracy: 89,
            speed: 0.7,
            cost: 0.5,
            status: 'training',
            lastUsed: '5분 전',
            totalRequests: 4560,
            successRate: 91.8
        },
        {
            id: 'personalized-v1',
            name: '개인화 AI v1.0',
            description: '개인별 맞춤 메시지',
            type: 'personalized',
            power: 90,
            accuracy: 95,
            speed: 0.9,
            cost: 0.2,
            status: 'active',
            lastUsed: '30초 전',
            totalRequests: 12340,
            successRate: 96.1
        },
        {
            id: 'hybrid-v2',
            name: '하이브리드 AI v2.0',
            description: '다중 모델 통합',
            type: 'hybrid',
            power: 98,
            accuracy: 96,
            speed: 0.5,
            cost: 0.4,
            status: 'active',
            lastUsed: '1분 전',
            totalRequests: 6780,
            successRate: 98.5
        },
        {
            id: 'experimental-v1',
            name: '실험적 AI v1.0',
            description: '최신 연구 기반 실험 모델',
            type: 'experimental',
            power: 88,
            accuracy: 87,
            speed: 0.4,
            cost: 0.6,
            status: 'error',
            lastUsed: '10분 전',
            totalRequests: 2340,
            successRate: 82.3
        }
    ]);

    const [selectedModels, setSelectedModels] = useState<string[]>(['neural-v1', 'quantum-v2']);
    const [comparisonResults, setComparisonResults] = useState<ModelComparison[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [inputPrompt, setInputPrompt] = useState('');
    const [activeTab, setActiveTab] = useState<'models' | 'comparison' | 'analytics'>('models');

    const getModelIcon = (type: string) => {
        switch (type) {
            case 'neural': return <CpuChipIcon className="w-5 h-5" />;
            case 'quantum': return <BoltIcon className="w-5 h-5" />;
            case 'extreme': return <FireIcon className="w-5 h-5" />;
            case 'personalized': return <UsersIcon className="w-5 h-5" />;
            case 'hybrid': return <RocketLaunchIcon className="w-5 h-5" />;
            case 'experimental': return <BeakerIcon className="w-5 h-5" />;
            default: return <CpuChipIcon className="w-5 h-5" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-100';
            case 'training': return 'text-yellow-600 bg-yellow-100';
            case 'offline': return 'text-gray-600 bg-gray-100';
            case 'error': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircleIcon className="w-4 h-4" />;
            case 'training': return <ArrowPathIcon className="w-4 h-4 animate-spin" />;
            case 'offline': return <XCircleIcon className="w-4 h-4" />;
            case 'error': return <ExclamationTriangleIcon className="w-4 h-4" />;
            default: return <XCircleIcon className="w-4 h-4" />;
        }
    };

    const generateComparison = async () => {
        if (!inputPrompt || selectedModels.length === 0) return;

        setIsGenerating(true);

        // 시뮬레이션된 생성
        await new Promise(resolve => setTimeout(resolve, 3000));

        const results: ModelComparison[] = selectedModels.map(modelId => {
            const model = models.find(m => m.id === modelId);
            if (!model) return null;

            return {
                modelId,
                content: `${model.name}가 생성한 응답: ${inputPrompt}에 대한 ${model.description}을 활용한 분석 결과입니다.`,
                confidence: Math.random() * 20 + 80,
                psychological_metrics: {
                    persuasion_potential: Math.random() * 0.3 + 0.7,
                    emotional_impact: Math.random() * 0.3 + 0.6,
                    cognitive_load: Math.random() * 0.4 + 0.3,
                    neural_activation: Math.random() * 0.3 + 0.7,
                    manipulation_score: Math.random() * 0.4 + 0.3
                },
                generation_time: Math.random() * 2 + 1,
                tokens_used: Math.floor(Math.random() * 500 + 200),
                quality_score: Math.random() * 20 + 80,
                cost: model.cost * (Math.random() * 0.5 + 0.75)
            };
        }).filter(Boolean) as ModelComparison[];

        setComparisonResults(results);
        setIsGenerating(false);
    };

    const toggleModelSelection = (modelId: string) => {
        setSelectedModels(prev =>
            prev.includes(modelId)
                ? prev.filter(id => id !== modelId)
                : [...prev, modelId]
        );
    };

    if (!isActive) {
        return (
            <div className="absolute bottom-4 right-4 z-50">
                <button
                    onClick={onToggle}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                >
                    <CpuChipIcon className="w-5 h-5" />
                    <span>AI 모델 통합</span>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-6xl h-4/5 overflow-hidden">
                {/* 헤더 */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <CpuChipIcon className="w-6 h-6" />
                            <h3 className="font-semibold text-lg">고도화된 AI 모델 통합 시스템</h3>
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
                        onClick={() => setActiveTab('models')}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'models'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        AI 모델 관리
                    </button>
                    <button
                        onClick={() => setActiveTab('comparison')}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'comparison'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        모델 비교
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'analytics'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        성능 분석
                    </button>
                </div>

                {/* 컨텐츠 영역 */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'models' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                {models.map(model => (
                                    <div key={model.id} className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center space-x-2">
                                                {getModelIcon(model.type)}
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">{model.name}</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{model.description}</p>
                                                </div>
                                            </div>
                                            <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(model.status)}`}>
                                                {getStatusIcon(model.status)}
                                                <span>{model.status}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">파워:</span>
                                                <span className="font-medium">{model.power}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">정확도:</span>
                                                <span className="font-medium">{model.accuracy}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">속도:</span>
                                                <span className="font-medium">{(model.speed * 100).toFixed(0)}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">비용:</span>
                                                <span className="font-medium">${model.cost.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>마지막 사용: {model.lastUsed}</span>
                                                <span>성공률: {model.successRate}%</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'comparison' && (
                        <div className="space-y-6">
                            {/* 입력 영역 */}
                            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">모델 비교 생성</h4>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            프롬프트 입력
                                        </label>
                                        <textarea
                                            value={inputPrompt}
                                            onChange={(e) => setInputPrompt(e.target.value)}
                                            placeholder="비교할 프롬프트를 입력하세요..."
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                                            rows={3}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            비교할 모델 선택
                                        </label>
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                            {models.filter(m => m.status === 'active').map(model => (
                                                <button
                                                    key={model.id}
                                                    onClick={() => toggleModelSelection(model.id)}
                                                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${selectedModels.includes(model.id)
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                                                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        {getModelIcon(model.type)}
                                                        <span className="text-sm font-medium">{model.name}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={generateComparison}
                                        disabled={isGenerating || !inputPrompt || selectedModels.length === 0}
                                        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${isGenerating || !inputPrompt || selectedModels.length === 0
                                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                                            }`}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                                <span>생성 중...</span>
                                            </>
                                        ) : (
                                            <>
                                                <StarIcon className="w-5 h-5" />
                                                <span>모델 비교 생성</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* 비교 결과 */}
                            {comparisonResults.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">비교 결과</h4>
                                    {comparisonResults.map((result, index) => {
                                        const model = models.find(m => m.id === result.modelId);
                                        return (
                                            <div key={result.modelId} className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center space-x-2">
                                                        {model && getModelIcon(model.type)}
                                                        <span className="font-semibold text-gray-900 dark:text-white">
                                                            {model?.name || result.modelId}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-4 text-sm">
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            신뢰도: {result.confidence.toFixed(1)}%
                                                        </span>
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            품질: {result.quality_score.toFixed(1)}%
                                                        </span>
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            비용: ${result.cost.toFixed(3)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <p className="text-gray-700 dark:text-gray-300 mb-3">
                                                    {result.content}
                                                </p>

                                                <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">설득력:</span>
                                                        <span className="font-medium">{(result.psychological_metrics.persuasion_potential * 100).toFixed(1)}%</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">감정적 영향:</span>
                                                        <span className="font-medium">{(result.psychological_metrics.emotional_impact * 100).toFixed(1)}%</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">인지 부하:</span>
                                                        <span className="font-medium">{(result.psychological_metrics.cognitive_load * 100).toFixed(1)}%</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">신경 활성화:</span>
                                                        <span className="font-medium">{(result.psychological_metrics.neural_activation * 100).toFixed(1)}%</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">조작도:</span>
                                                        <span className="font-medium">{(result.psychological_metrics.manipulation_score * 100).toFixed(1)}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* 모델 성능 통계 */}
                                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">모델 성능 통계</h4>
                                    <div className="space-y-4">
                                        {models.map(model => (
                                            <div key={model.id} className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    {getModelIcon(model.type)}
                                                    <span className="text-sm font-medium">{model.name}</span>
                                                </div>
                                                <div className="flex items-center space-x-4 text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {model.totalRequests.toLocaleString()} 요청
                                                    </span>
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {model.successRate}% 성공
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 비용 분석 */}
                                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">비용 분석</h4>
                                    <div className="space-y-4">
                                        {models.map(model => (
                                            <div key={model.id} className="flex items-center justify-between">
                                                <span className="text-sm font-medium">{model.name}</span>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        ${model.cost.toFixed(2)}/요청
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        총 ${(model.cost * model.totalRequests).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
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

export default AdvancedAIModelIntegration; 