import React, { useState, useEffect } from 'react';
import {
    StarIcon,
    BoltIcon,
    FireIcon,
    HeartIcon,
    EyeIcon,
    CogIcon,
    MagnifyingGlassIcon,
    UserIcon,
    UsersIcon,
    ChatBubbleLeftRightIcon,
    ArrowPathIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    LightBulbIcon,
    AcademicCapIcon,
    BeakerIcon,
    TrophyIcon,
    ShieldCheckIcon,
    HandRaisedIcon,
    FaceSmileIcon,
    BookOpenIcon,
    InformationCircleIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    Bars3Icon,
    PlusIcon,
    MinusIcon,
    PlayIcon,
    PauseIcon,
    StopIcon,
    DocumentTextIcon,
    ChartBarIcon,
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

interface PsychologicalProfile {
    personality: 'extrovert' | 'introvert' | 'ambivert';
    decisionStyle: 'logical' | 'emotional' | 'intuitive' | 'analytical';
    communicationStyle: 'direct' | 'indirect' | 'supportive' | 'challenging';
    motivationType: 'achievement' | 'affiliation' | 'power' | 'security';
    cognitiveLoad: 'low' | 'medium' | 'high';
    emotionalState: 'positive' | 'negative' | 'neutral' | 'mixed';
    trustLevel: 'high' | 'medium' | 'low';
    susceptibility: 'high' | 'medium' | 'low';
}

interface MessageStrategy {
    id: string;
    name: string;
    description: string;
    psychologicalApproach: string;
    manipulationTechnique: string;
    emotionalTrigger: string;
    cognitiveBias: string;
    persuasionMethod: string;
    successRate: number;
    riskLevel: 'low' | 'medium' | 'high';
}

interface MessageGenerationConfig {
    model: 'neural' | 'quantum' | 'extreme' | 'personalized' | 'hybrid' | 'psychological' | 'manipulative';
    personality: string;
    writingStyle: string;
    intent: string;
    targetAudience: string;
    emotionalTone: string;
    persuasionLevel: number;
    safetyLevel: number;
    creativityLevel: number;
    psychologicalProfile: PsychologicalProfile;
    selectedStrategies: string[];
}

interface GeneratedMessage {
    id: string;
    content: string;
    strategy: MessageStrategy;
    psychologicalMetrics: {
        persuasionPotential: number;
        emotionalImpact: number;
        cognitiveLoad: number;
        neuralActivation: number;
        manipulationScore: number;
        trustBuilding: number;
        urgencyCreation: number;
        socialProof: number;
    };
    safetyScore: number;
    generationTime: number;
    tokensUsed: number;
    qualityScore: number;
    targetAudience: string;
    emotionalTone: string;
    intent: string;
    timestamp: string;
}

interface AdvancedMessageGenerationEngineProps {
    onMessageGenerated: (message: GeneratedMessage) => void;
    isActive: boolean;
    onToggle: () => void;
}

const AdvancedMessageGenerationEngine: React.FC<AdvancedMessageGenerationEngineProps> = ({
    onMessageGenerated,
    isActive,
    onToggle
}) => {
    const [config, setConfig] = useState<MessageGenerationConfig>({
        model: 'psychological',
        personality: '중립',
        writingStyle: '친근함',
        intent: '',
        targetAudience: '조합원',
        emotionalTone: '신뢰감',
        persuasionLevel: 0.7,
        safetyLevel: 0.8,
        creativityLevel: 0.6,
        psychologicalProfile: {
            personality: 'ambivert',
            decisionStyle: 'logical',
            communicationStyle: 'supportive',
            motivationType: 'security',
            cognitiveLoad: 'medium',
            emotionalState: 'neutral',
            trustLevel: 'medium',
            susceptibility: 'medium'
        },
        selectedStrategies: []
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [generatedMessages, setGeneratedMessages] = useState<GeneratedMessage[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>('psychological');
    const [activeTab, setActiveTab] = useState<'generator' | 'strategies' | 'analysis' | 'insights' | 'settings'>('generator');

    const models = [
        {
            id: 'neural',
            name: '신경망 AI',
            description: '딥러닝 기반 자연스러운 대화',
            icon: CpuChipIcon,
            color: 'blue'
        },
        {
            id: 'quantum',
            name: '양자 AI',
            description: '양자 컴퓨팅 기반 초고속 처리',
            color: 'purple'
        },
        {
            id: 'extreme',
            name: '극한 AI',
            description: '극한 성능 최적화',
            icon: FireIcon,
            color: 'red'
        },
        {
            id: 'personalized',
            name: '개인화 AI',
            description: '개인 맞춤형 메시지',
            icon: UserIcon,
            color: 'green'
        },
        {
            id: 'hybrid',
            name: '하이브리드 AI',
            description: '다중 모델 융합',
            icon: BoltIcon,
            color: 'yellow'
        },
        {
            id: 'psychological',
            name: '심리학 AI',
            description: '심리학 기반 메시지',
            icon: AcademicCapIcon,
            color: 'indigo'
        },
        {
            id: 'manipulative',
            name: '조작 AI',
            description: '고급 조작 기술',
            icon: EyeIcon,
            color: 'pink'
        }
    ];

    const strategies: MessageStrategy[] = [
        {
            id: 'social-proof',
            name: '사회적 증명',
            description: '다른 사람들의 행동을 참고하도록 유도',
            psychologicalApproach: 'Bandwagon Effect',
            manipulationTechnique: 'Peer Pressure',
            emotionalTrigger: 'FOMO (Fear of Missing Out)',
            cognitiveBias: 'Conformity Bias',
            persuasionMethod: 'Social Validation',
            successRate: 0.85,
            riskLevel: 'low'
        },
        {
            id: 'scarcity',
            name: '희소성',
            description: '제한된 기회를 강조',
            psychologicalApproach: 'Loss Aversion',
            manipulationTechnique: 'Urgency Creation',
            emotionalTrigger: 'Anxiety',
            cognitiveBias: 'Scarcity Bias',
            persuasionMethod: 'Time Pressure',
            successRate: 0.78,
            riskLevel: 'medium'
        },
        {
            id: 'authority',
            name: '권위',
            description: '전문성과 신뢰성을 강조',
            psychologicalApproach: 'Authority Principle',
            manipulationTechnique: 'Expertise Display',
            emotionalTrigger: 'Respect',
            cognitiveBias: 'Authority Bias',
            persuasionMethod: 'Credibility Building',
            successRate: 0.92,
            riskLevel: 'low'
        },
        {
            id: 'reciprocity',
            name: '상호성',
            description: '은혜를 베푸는 것으로 보답 유도',
            psychologicalApproach: 'Reciprocity Principle',
            manipulationTechnique: 'Favor Exchange',
            emotionalTrigger: 'Gratitude',
            cognitiveBias: 'Reciprocity Bias',
            persuasionMethod: 'Gift Giving',
            successRate: 0.88,
            riskLevel: 'low'
        },
        {
            id: 'commitment',
            name: '약속',
            description: '작은 약속부터 큰 약속으로 확대',
            psychologicalApproach: 'Foot-in-the-Door',
            manipulationTechnique: 'Escalation',
            emotionalTrigger: 'Consistency',
            cognitiveBias: 'Commitment Bias',
            persuasionMethod: 'Progressive Commitment',
            successRate: 0.82,
            riskLevel: 'medium'
        },
        {
            id: 'liking',
            name: '호감',
            description: '유사성과 친근감을 활용',
            psychologicalApproach: 'Similarity Principle',
            manipulationTechnique: 'Mirroring',
            emotionalTrigger: 'Connection',
            cognitiveBias: 'Similarity Bias',
            persuasionMethod: 'Relationship Building',
            successRate: 0.90,
            riskLevel: 'low'
        },
        {
            id: 'emotional-manipulation',
            name: '감정 조작',
            description: '감정적 반응을 유발하여 판단력 저하',
            psychologicalApproach: 'Emotional Hijacking',
            manipulationTechnique: 'Emotional Triggers',
            emotionalTrigger: 'Strong Emotions',
            cognitiveBias: 'Emotional Bias',
            persuasionMethod: 'Emotional Appeal',
            successRate: 0.95,
            riskLevel: 'high'
        },
        {
            id: 'cognitive-overload',
            name: '인지 과부하',
            description: '복잡한 정보로 판단력 마비',
            psychologicalApproach: 'Cognitive Overload',
            manipulationTechnique: 'Information Overload',
            emotionalTrigger: 'Confusion',
            cognitiveBias: 'Decision Fatigue',
            persuasionMethod: 'Complexity Creation',
            successRate: 0.87,
            riskLevel: 'high'
        }
    ];

    const generateMessage = async () => {
        setIsGenerating(true);
        setGenerationProgress(0);

        // 진행률 시뮬레이션
        const progressInterval = setInterval(() => {
            setGenerationProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + Math.random() * 15;
            });
        }, 200);

        try {
            // 실제 메시지 생성 로직
            const message = await generateAdvancedMessage();

            setGeneratedMessages(prev => [message, ...prev]);
            onMessageGenerated(message);

            setTimeout(() => {
                setIsGenerating(false);
                setGenerationProgress(0);
            }, 1000);

        } catch (error) {
            console.error('메시지 생성 실패:', error);
            setIsGenerating(false);
            setGenerationProgress(0);
        }
    };

    const generateAdvancedMessage = async (): Promise<GeneratedMessage> => {
        const selectedStrategy = strategies.find(s => s.id === config.selectedStrategies[0]) || strategies[0];

        const baseContent = generateContentByStrategy(selectedStrategy, config);
        const psychologicalMetrics = calculatePsychologicalMetrics(selectedStrategy, config);

        return {
            id: `msg-${Date.now()}`,
            content: baseContent,
            strategy: selectedStrategy,
            psychologicalMetrics,
            safetyScore: calculateSafetyScore(selectedStrategy, psychologicalMetrics),
            generationTime: Math.random() * 2000 + 500,
            tokensUsed: Math.floor(Math.random() * 500) + 100,
            qualityScore: psychologicalMetrics.persuasionPotential * 0.4 + psychologicalMetrics.trustBuilding * 0.3 + psychologicalMetrics.emotionalImpact * 0.3,
            targetAudience: config.targetAudience,
            emotionalTone: config.emotionalTone,
            intent: config.intent,
            timestamp: new Date().toISOString()
        };
    };

    const generateContentByStrategy = (strategy: MessageStrategy, config: MessageGenerationConfig): string => {
        const templates = {
            'social-proof': [
                "다른 조합원들도 이미 이 방향으로 결정하셨습니다. 특히 {target}님도 같은 생각을 가지고 계시더군요.",
                "이미 많은 분들이 이 선택을 하셨고, 결과도 매우 만족스러우시다고 합니다.",
                "우리 조합에서 가장 신뢰받는 분들도 이 방향을 추천하고 계십니다."
            ],
            'scarcity': [
                "이 기회는 정말 한 번뿐입니다. 내일이면 이미 늦을 수 있어요.",
                "지금 결정하지 않으시면 나중에 후회하실 수 있습니다.",
                "이런 조건은 다시 오지 않을 것 같습니다."
            ],
            'authority': [
                "전문가들의 분석에 따르면, 이 방향이 가장 안전하고 유리합니다.",
                "법무법인에서 검토한 결과, 이 방법이 가장 확실합니다.",
                "경제 전문가들이 추천하는 방법입니다."
            ],
            'reciprocity': [
                "저희가 이렇게 도와드릴 수 있는 것은 조합원님들의 신뢰 덕분입니다.",
                "조합원님들을 위해 최선을 다하고 있으니, 저희도 믿어주시면 감사하겠습니다.",
                "저희가 먼저 도움을 드렸으니, 이번 기회에 함께해주시면 어떨까요?"
            ],
            'commitment': [
                "작은 것부터 시작해서 점진적으로 나아가면 됩니다.",
                "일단 한 번 시도해보시고, 마음에 드시면 계속 진행하시면 됩니다.",
                "첫 단계만 해보시고 결정하시면 됩니다."
            ],
            'liking': [
                "저희도 조합원님들과 같은 입장에서 생각하고 있습니다.",
                "조합원님들의 마음을 저희가 잘 알고 있습니다.",
                "저희도 같은 고민을 하고 있었습니다."
            ],
            'emotional-manipulation': [
                "이 결정이 조합원님들의 미래를 좌우할 수 있습니다.",
                "지금 이 순간이 정말 중요한 시점입니다.",
                "이 기회를 놓치면 정말 후회하실 수 있습니다."
            ],
            'cognitive-overload': [
                "복잡한 상황이지만, 저희가 모든 것을 정리해서 드리겠습니다.",
                "여러 가지 옵션이 있지만, 가장 좋은 방법을 찾아드렸습니다.",
                "이해하기 어려운 부분들이 있지만, 저희가 도와드리겠습니다."
            ]
        };

        const template = templates[strategy.id as keyof typeof templates] || templates['social-proof'];
        const randomTemplate = template[Math.floor(Math.random() * template.length)];

        return randomTemplate.replace('{target}', config.targetAudience);
    };

    const calculatePsychologicalMetrics = (strategy: MessageStrategy, config: MessageGenerationConfig) => {
        const baseMetrics = {
            persuasionPotential: 0.7,
            emotionalImpact: 0.6,
            cognitiveLoad: 0.5,
            neuralActivation: 0.6,
            manipulationScore: 0.5,
            trustBuilding: 0.7,
            urgencyCreation: 0.4,
            socialProof: 0.6
        };

        // 전략별 메트릭 조정
        switch (strategy.id) {
            case 'social-proof':
                baseMetrics.socialProof = 0.9;
                baseMetrics.persuasionPotential = 0.8;
                break;
            case 'scarcity':
                baseMetrics.urgencyCreation = 0.9;
                baseMetrics.emotionalImpact = 0.8;
                break;
            case 'authority':
                baseMetrics.trustBuilding = 0.9;
                baseMetrics.persuasionPotential = 0.9;
                break;
            case 'reciprocity':
                baseMetrics.trustBuilding = 0.8;
                baseMetrics.persuasionPotential = 0.8;
                break;
            case 'commitment':
                baseMetrics.manipulationScore = 0.8;
                baseMetrics.persuasionPotential = 0.7;
                break;
            case 'liking':
                baseMetrics.trustBuilding = 0.9;
                baseMetrics.emotionalImpact = 0.7;
                break;
            case 'emotional-manipulation':
                baseMetrics.emotionalImpact = 0.95;
                baseMetrics.manipulationScore = 0.9;
                baseMetrics.neuralActivation = 0.8;
                break;
            case 'cognitive-overload':
                baseMetrics.cognitiveLoad = 0.9;
                baseMetrics.manipulationScore = 0.8;
                break;
        }

        // 설정에 따른 조정
        baseMetrics.persuasionPotential *= config.persuasionLevel;
        baseMetrics.manipulationScore *= (1 - config.safetyLevel);
        baseMetrics.trustBuilding *= config.psychologicalProfile.trustLevel === 'high' ? 1.2 : 0.8;

        return baseMetrics;
    };

    const calculateSafetyScore = (strategy: MessageStrategy, metrics: any): number => {
        const riskMultiplier = strategy.riskLevel === 'high' ? 0.6 : strategy.riskLevel === 'medium' ? 0.8 : 1.0;
        const manipulationPenalty = metrics.manipulationScore * 0.3;
        const safetyScore = (1 - manipulationPenalty) * riskMultiplier;
        return Math.max(0.1, Math.min(1.0, safetyScore));
    };

    const getModelIcon = (modelId: string) => {
        const model = models.find(m => m.id === modelId);
        return model ? model.icon : CpuChipIcon;
    };

    const getModelColor = (modelId: string) => {
        const model = models.find(m => m.id === modelId);
        return model ? model.color : 'gray';
    };

    const getStrategyColor = (riskLevel: string) => {
        switch (riskLevel) {
            case 'high': return 'red';
            case 'medium': return 'yellow';
            case 'low': return 'green';
            default: return 'gray';
        }
    };

    if (!isActive) {
        return (
            <div className="absolute bottom-4 right-4 z-50">
                <button
                    onClick={onToggle}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2"
                >
                    <CpuChipIcon className="w-5 h-5" />
                    <span>고급 AI 메시지 생성</span>
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
                                <h3 className="font-semibold text-lg">고도화된 AI 심리학 메시지 생성 시스템</h3>
                                <p className="text-gray-400 text-sm">심리학 기반 고급 메시지 생성</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-sm">{generatedMessages.length}개 메시지 생성</span>
                            </div>
                            <button
                                onClick={onToggle}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                                aria-label="메시지 생성기 닫기"
                            >
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 탭 네비게이션 */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                    {[
                        { id: 'generator', label: '생성기', icon: StarIcon },
                        { id: 'strategies', label: '전략', icon: LightBulbIcon },
                        { id: 'analysis', label: '분석', icon: ChartBarIcon },
                        { id: 'insights', label: '인사이트', icon: EyeIcon },
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
                    {activeTab === 'generator' && (
                        <div className="space-y-6">
                            {/* 모델 선택 */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">AI 모델 선택</h4>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {models.map(model => {
                                        const Icon = model.icon;
                                        return (
                                            <button
                                                key={model.id}
                                                onClick={() => setSelectedModel(model.id)}
                                                className={`p-4 rounded-lg border transition-all duration-200 flex items-center space-x-3 ${selectedModel === model.id
                                                    ? 'bg-gray-900 text-white border-gray-900'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                                    }`}
                                            >
                                                {model.icon && <model.icon className="w-5 h-5" />}
                                                <div className="text-left">
                                                    <div className="font-medium">{model.name}</div>
                                                    <div className="text-xs opacity-75">{model.description}</div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 설정 */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">메시지 설정</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">대상</label>
                                            <input
                                                type="text"
                                                value={config.targetAudience}
                                                onChange={(e) => setConfig(prev => ({ ...prev, targetAudience: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                                placeholder="대상 입력"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">의도</label>
                                            <input
                                                type="text"
                                                value={config.intent}
                                                onChange={(e) => setConfig(prev => ({ ...prev, intent: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                                placeholder="메시지 의도 입력"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">감정 톤</label>
                                            <select
                                                value={config.emotionalTone}
                                                onChange={(e) => setConfig(prev => ({ ...prev, emotionalTone: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                                aria-label="감정 톤 선택"
                                            >
                                                <option value="신뢰감">신뢰감</option>
                                                <option value="친근함">친근함</option>
                                                <option value="긴급함">긴급함</option>
                                                <option value="설득력">설득력</option>
                                                <option value="전문성">전문성</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">설득 수준: {config.persuasionLevel}</label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.1"
                                                value={config.persuasionLevel}
                                                onChange={(e) => setConfig(prev => ({ ...prev, persuasionLevel: parseFloat(e.target.value) }))}
                                                className="w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">안전 수준: {config.safetyLevel}</label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.1"
                                                value={config.safetyLevel}
                                                onChange={(e) => setConfig(prev => ({ ...prev, safetyLevel: parseFloat(e.target.value) }))}
                                                className="w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">창의성 수준: {config.creativityLevel}</label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.1"
                                                value={config.creativityLevel}
                                                onChange={(e) => setConfig(prev => ({ ...prev, creativityLevel: parseFloat(e.target.value) }))}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 생성 버튼 */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <button
                                    onClick={generateMessage}
                                    disabled={isGenerating}
                                    className="w-full bg-gray-900 text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    {isGenerating ? (
                                        <>
                                            <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                            <span>생성 중... {Math.round(generationProgress)}%</span>
                                        </>
                                    ) : (
                                        <>
                                            <StarIcon className="w-5 h-5" />
                                            <span>고급 메시지 생성</span>
                                        </>
                                    )}
                                </button>
                                {isGenerating && (
                                    <div className="mt-4">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-gray-900 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${generationProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'strategies' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">심리학 전략</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {strategies.map(strategy => (
                                        <div key={strategy.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h5 className="font-semibold text-gray-900">{strategy.name}</h5>
                                                    <p className="text-sm text-gray-600 mt-1">{strategy.description}</p>
                                                </div>
                                                <div className={`px-2 py-1 rounded-full text-xs font-medium bg-${getStrategyColor(strategy.riskLevel)}-100 text-${getStrategyColor(strategy.riskLevel)}-800`}>
                                                    {strategy.riskLevel}
                                                </div>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <div><strong>심리학적 접근:</strong> {strategy.psychologicalApproach}</div>
                                                <div><strong>조작 기법:</strong> {strategy.manipulationTechnique}</div>
                                                <div><strong>감정 트리거:</strong> {strategy.emotionalTrigger}</div>
                                                <div><strong>인지 편향:</strong> {strategy.cognitiveBias}</div>
                                                <div><strong>설득 방법:</strong> {strategy.persuasionMethod}</div>
                                                <div><strong>성공률:</strong> {strategy.successRate * 100}%</div>
                                            </div>
                                            <div className="mt-3">
                                                <button
                                                    onClick={() => setConfig(prev => ({
                                                        ...prev,
                                                        selectedStrategies: prev.selectedStrategies.includes(strategy.id)
                                                            ? prev.selectedStrategies.filter(id => id !== strategy.id)
                                                            : [...prev.selectedStrategies, strategy.id]
                                                    }))}
                                                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${config.selectedStrategies.includes(strategy.id)
                                                        ? 'bg-gray-900 text-white'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                        }`}
                                                >
                                                    {config.selectedStrategies.includes(strategy.id) ? '선택됨' : '선택'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'analysis' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">생성된 메시지 분석</h4>
                                <div className="space-y-4">
                                    {generatedMessages.map(message => (
                                        <div key={message.id} className="p-4 border border-gray-200 rounded-lg">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h5 className="font-semibold text-gray-900">메시지 #{message.id}</h5>
                                                    <p className="text-sm text-gray-600 mt-1">{message.content}</p>
                                                </div>
                                                <div className="text-right text-sm text-gray-500">
                                                    <div>품질: {Math.round(message.qualityScore * 100)}%</div>
                                                    <div>안전도: {Math.round(message.safetyScore * 100)}%</div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <div className="font-medium text-gray-700">설득 잠재력</div>
                                                    <div className="text-lg font-bold text-blue-600">{Math.round(message.psychologicalMetrics.persuasionPotential * 100)}%</div>
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-700">감정적 영향</div>
                                                    <div className="text-lg font-bold text-red-600">{Math.round(message.psychologicalMetrics.emotionalImpact * 100)}%</div>
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-700">조작 점수</div>
                                                    <div className="text-lg font-bold text-purple-600">{Math.round(message.psychologicalMetrics.manipulationScore * 100)}%</div>
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-700">신뢰 구축</div>
                                                    <div className="text-lg font-bold text-green-600">{Math.round(message.psychologicalMetrics.trustBuilding * 100)}%</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'insights' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">심리학적 인사이트</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h5 className="font-medium text-gray-900">대상 심리 프로필</h5>
                                        <div className="space-y-2 text-sm">
                                            <div><strong>성격:</strong> {config.psychologicalProfile.personality}</div>
                                            <div><strong>의사결정 스타일:</strong> {config.psychologicalProfile.decisionStyle}</div>
                                            <div><strong>의사소통 스타일:</strong> {config.psychologicalProfile.communicationStyle}</div>
                                            <div><strong>동기 유형:</strong> {config.psychologicalProfile.motivationType}</div>
                                            <div><strong>인지 부하:</strong> {config.psychologicalProfile.cognitiveLoad}</div>
                                            <div><strong>감정 상태:</strong> {config.psychologicalProfile.emotionalState}</div>
                                            <div><strong>신뢰 수준:</strong> {config.psychologicalProfile.trustLevel}</div>
                                            <div><strong>감수성:</strong> {config.psychologicalProfile.susceptibility}</div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h5 className="font-medium text-gray-900">최적화 권장사항</h5>
                                        <div className="space-y-2 text-sm">
                                            <div className="p-2 bg-blue-50 rounded">
                                                <strong>설득 전략:</strong> {config.psychologicalProfile.susceptibility === 'high' ? '직접적 접근' : '간접적 접근'}
                                            </div>
                                            <div className="p-2 bg-green-50 rounded">
                                                <strong>감정적 접근:</strong> {config.psychologicalProfile.emotionalState === 'positive' ? '긍정적 강화' : '부정적 회피'}
                                            </div>
                                            <div className="p-2 bg-yellow-50 rounded">
                                                <strong>정보 제공:</strong> {config.psychologicalProfile.cognitiveLoad === 'low' ? '상세 정보' : '간단 요약'}
                                            </div>
                                            <div className="p-2 bg-purple-50 rounded">
                                                <strong>신뢰 구축:</strong> {config.psychologicalProfile.trustLevel === 'low' ? '증거 기반' : '관계 중심'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">고급 설정</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h5 className="font-medium text-gray-900">심리학 프로필 설정</h5>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">성격</label>
                                                <select
                                                    value={config.psychologicalProfile.personality}
                                                    onChange={(e) => setConfig(prev => ({
                                                        ...prev,
                                                        psychologicalProfile: {
                                                            ...prev.psychologicalProfile,
                                                            personality: e.target.value as any
                                                        }
                                                    }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                                    aria-label="성격 선택"
                                                >
                                                    <option value="extrovert">외향적</option>
                                                    <option value="introvert">내향적</option>
                                                    <option value="ambivert">중간적</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">의사결정 스타일</label>
                                                <select
                                                    value={config.psychologicalProfile.decisionStyle}
                                                    onChange={(e) => setConfig(prev => ({
                                                        ...prev,
                                                        psychologicalProfile: {
                                                            ...prev.psychologicalProfile,
                                                            decisionStyle: e.target.value as any
                                                        }
                                                    }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                                    aria-label="의사결정 스타일 선택"
                                                >
                                                    <option value="logical">논리적</option>
                                                    <option value="emotional">감정적</option>
                                                    <option value="intuitive">직관적</option>
                                                    <option value="analytical">분석적</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h5 className="font-medium text-gray-900">시스템 설정</h5>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">신뢰 수준</label>
                                                <select
                                                    value={config.psychologicalProfile.trustLevel}
                                                    onChange={(e) => setConfig(prev => ({
                                                        ...prev,
                                                        psychologicalProfile: {
                                                            ...prev.psychologicalProfile,
                                                            trustLevel: e.target.value as any
                                                        }
                                                    }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                                    aria-label="신뢰 수준 선택"
                                                >
                                                    <option value="high">높음</option>
                                                    <option value="medium">중간</option>
                                                    <option value="low">낮음</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">감수성</label>
                                                <select
                                                    value={config.psychologicalProfile.susceptibility}
                                                    onChange={(e) => setConfig(prev => ({
                                                        ...prev,
                                                        psychologicalProfile: {
                                                            ...prev.psychologicalProfile,
                                                            susceptibility: e.target.value as any
                                                        }
                                                    }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                                    aria-label="감수성 선택"
                                                >
                                                    <option value="high">높음</option>
                                                    <option value="medium">중간</option>
                                                    <option value="low">낮음</option>
                                                </select>
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

export default AdvancedMessageGenerationEngine; 