import React, { useState, useEffect } from 'react';
import {
    StarIcon,
    DocumentTextIcon,
    ChatBubbleLeftRightIcon,
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
    HeartIcon,
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
    ChartBarIcon,
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

interface NLPTask {
    id: string;
    type: 'tokenization' | 'pos-tagging' | 'ner' | 'sentiment' | 'summarization' | 'translation' | 'question-answering' | 'text-generation';
    input: string;
    output: any;
    confidence: number;
    processingTime: number;
    timestamp: string;
    insights: NLPInsight[];
}

interface NLPInsight {
    id: string;
    type: 'syntax' | 'semantics' | 'pragmatics' | 'discourse' | 'morphology' | 'phonology';
    title: string;
    description: string;
    confidence: number;
    value: any;
}

interface NLPModel {
    id: string;
    name: string;
    type: 'transformer' | 'lstm' | 'cnn' | 'bert' | 'gpt' | 't5';
    accuracy: number;
    speed: number;
    status: 'active' | 'training' | 'inactive';
    lastUpdated: string;
    usage: number;
    language: string;
}

interface NLPSettings {
    enableRealTime: boolean;
    enableBatchProcessing: boolean;
    enableContextAware: boolean;
    language: string;
    modelSize: 'small' | 'medium' | 'large';
    maxTokens: number;
}

interface AdvancedAINaturalLanguageProcessingProps {
    isActive: boolean;
    onToggle: () => void;
}

const AdvancedAINaturalLanguageProcessing: React.FC<AdvancedAINaturalLanguageProcessingProps> = ({
    isActive,
    onToggle
}) => {
    const [nlpTasks, setNlpTasks] = useState<NLPTask[]>([
        {
            id: 'task-1',
            type: 'sentiment',
            input: 'AI 시스템이 정말 훌륭하게 작동하고 있어요. 사용자 경험이 매우 만족스럽습니다.',
            output: {
                sentiment: 'positive',
                score: 0.92,
                confidence: 0.89
            },
            confidence: 89.2,
            processingTime: 0.8,
            timestamp: '5분 전',
            insights: [
                {
                    id: 'insight-1',
                    type: 'semantics',
                    title: '긍정적 감정 분석',
                    description: '강한 긍정적 감정이 표현된 텍스트',
                    confidence: 92.1,
                    value: 'strong_positive'
                },
                {
                    id: 'insight-2',
                    type: 'pragmatics',
                    title: '사용자 만족도',
                    description: '시스템 성능에 대한 높은 만족도 표현',
                    confidence: 87.5,
                    value: 'high_satisfaction'
                }
            ]
        },
        {
            id: 'task-2',
            type: 'ner',
            input: '마이크로소프트의 CEO인 사티아 나델라가 새로운 AI 기술을 발표했습니다.',
            output: {
                entities: [
                    { text: '마이크로소프트', type: 'ORGANIZATION', confidence: 0.95 },
                    { text: '사티아 나델라', type: 'PERSON', confidence: 0.92 },
                    { text: 'AI 기술', type: 'TECHNOLOGY', confidence: 0.88 }
                ]
            },
            confidence: 91.7,
            processingTime: 1.2,
            timestamp: '12분 전',
            insights: [
                {
                    id: 'insight-3',
                    type: 'syntax',
                    title: '명사구 분석',
                    description: '조직명, 인명, 기술명이 명확히 구분됨',
                    confidence: 94.3,
                    value: 'clear_entity_boundaries'
                }
            ]
        },
        {
            id: 'task-3',
            type: 'summarization',
            input: '인공지능 기술의 발전으로 다양한 분야에서 혁신이 일어나고 있습니다. 특히 자연어 처리 분야에서는 트랜스포머 모델의 등장으로 성능이 크게 향상되었습니다. 이는 기계 번역, 텍스트 생성, 질의응답 등 다양한 작업에서 혁신적인 결과를 가져왔습니다.',
            output: {
                summary: 'AI 기술 발전으로 자연어 처리 성능 향상, 트랜스포머 모델이 다양한 작업에서 혁신적 결과 도출',
                keyPoints: ['AI 기술 발전', '자연어 처리 성능 향상', '트랜스포머 모델', '다양한 작업에서 혁신']
            },
            confidence: 88.9,
            processingTime: 2.1,
            timestamp: '25분 전',
            insights: [
                {
                    id: 'insight-4',
                    type: 'discourse',
                    title: '텍스트 구조 분석',
                    description: '주제-개발-결과의 논리적 구조를 가진 텍스트',
                    confidence: 91.2,
                    value: 'logical_structure'
                }
            ]
        }
    ]);

    const [nlpModels, setNlpModels] = useState<NLPModel[]>([
        {
            id: 'model-1',
            name: 'BERT Korean',
            type: 'bert',
            accuracy: 94.2,
            speed: 0.8,
            status: 'active',
            lastUpdated: '1일 전',
            usage: 2150,
            language: 'ko'
        },
        {
            id: 'model-2',
            name: 'GPT-3.5',
            type: 'gpt',
            accuracy: 96.8,
            speed: 1.5,
            status: 'active',
            lastUpdated: '2일 전',
            usage: 1800,
            language: 'en'
        },
        {
            id: 'model-3',
            name: 'T5 Multilingual',
            type: 't5',
            accuracy: 89.7,
            speed: 1.2,
            status: 'active',
            lastUpdated: '1주일 전',
            usage: 1650,
            language: 'multilingual'
        },
        {
            id: 'model-4',
            name: 'LSTM Korean',
            type: 'lstm',
            accuracy: 87.3,
            speed: 0.6,
            status: 'training',
            lastUpdated: '3일 전',
            usage: 950,
            language: 'ko'
        }
    ]);

    const [nlpSettings, setNlpSettings] = useState<NLPSettings>({
        enableRealTime: true,
        enableBatchProcessing: true,
        enableContextAware: true,
        language: 'ko',
        modelSize: 'medium',
        maxTokens: 512
    });

    const [inputText, setInputText] = useState('');
    const [selectedTask, setSelectedTask] = useState<string>('sentiment');
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState<'process' | 'tasks' | 'models' | 'insights' | 'settings'>('process');

    const taskTypes = [
        { id: 'sentiment', label: '감정 분석', icon: HeartIcon },
        { id: 'ner', label: '개체명 인식', icon: UserIcon },
        { id: 'summarization', label: '요약', icon: DocumentTextIcon },
        { id: 'translation', label: '번역', icon: ChatBubbleLeftRightIcon },
        { id: 'question-answering', label: '질의응답', icon: MagnifyingGlassIcon },
        { id: 'text-generation', label: '텍스트 생성', icon: StarIcon }
    ];

    const processText = () => {
        if (!inputText.trim()) return;

        setIsProcessing(true);

        // NLP 처리 시뮬레이션
        setTimeout(() => {
            const sampleOutputs = {
                sentiment: {
                    sentiment: 'positive',
                    score: 0.85,
                    confidence: 0.87
                },
                ner: {
                    entities: [
                        { text: 'AI', type: 'TECHNOLOGY', confidence: 0.92 },
                        { text: '시스템', type: 'CONCEPT', confidence: 0.88 }
                    ]
                },
                summarization: {
                    summary: 'AI 시스템에 대한 긍정적인 평가',
                    keyPoints: ['AI', '시스템', '긍정적', '평가']
                }
            };

            const newTask: NLPTask = {
                id: `task-${Date.now()}`,
                type: selectedTask as any,
                input: inputText,
                output: sampleOutputs[selectedTask as keyof typeof sampleOutputs] || {},
                confidence: Math.floor(Math.random() * 20) + 80,
                processingTime: Math.random() * 2 + 0.5,
                timestamp: '방금 전',
                insights: [
                    {
                        id: `insight-${Date.now()}`,
                        type: 'semantics',
                        title: '의미 분석',
                        description: '텍스트의 의미적 특성 분석',
                        confidence: Math.floor(Math.random() * 20) + 80,
                        value: 'semantic_analysis'
                    }
                ]
            };

            setNlpTasks(prev => [newTask, ...prev]);
            setIsProcessing(false);
            setInputText('');
        }, 2000);
    };

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
            case 'sentiment': return <HeartIcon className="w-4 h-4" />;
            case 'ner': return <UserIcon className="w-4 h-4" />;
            case 'summarization': return <DocumentTextIcon className="w-4 h-4" />;
            case 'translation': return <ChatBubbleLeftRightIcon className="w-4 h-4" />;
            case 'question-answering': return <MagnifyingGlassIcon className="w-4 h-4" />;
            case 'text-generation': return <StarIcon className="w-4 h-4" />;
            default: return <DocumentTextIcon className="w-4 h-4" />;
        }
    };

    if (!isActive) {
        return (
            <div className="absolute bottom-4 right-4 z-50">
                <button
                    onClick={onToggle}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2"
                >
                    <DocumentTextIcon className="w-5 h-5" />
                    <span>NLP 시스템</span>
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
                                <DocumentTextIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">고도화된 AI 지능형 자연어 처리 시스템</h3>
                                <p className="text-gray-400 text-sm">텍스트 분석 및 자연어 처리</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-sm">{nlpTasks.length}개 작업</span>
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
                        { id: 'process', label: '처리', icon: CogIcon },
                        { id: 'tasks', label: '작업', icon: ClockIcon },
                        { id: 'models', label: '모델', icon: CpuChipIcon },
                        { id: 'insights', label: '인사이트', icon: LightBulbIcon },
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
                    {activeTab === 'process' && (
                        <div className="space-y-6">
                            {/* 텍스트 처리 인터페이스 */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">텍스트 처리</h4>

                                {/* 작업 유형 선택 */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">처리 유형</label>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                        {taskTypes.map(task => {
                                            const Icon = task.icon;
                                            return (
                                                <button
                                                    key={task.id}
                                                    onClick={() => setSelectedTask(task.id)}
                                                    className={`p-3 rounded-lg border transition-all duration-200 flex items-center space-x-2 ${selectedTask === task.id
                                                        ? 'bg-gray-900 text-white border-gray-900'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    <span className="text-sm">{task.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* 텍스트 입력/출력 */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">입력 텍스트</label>
                                        <textarea
                                            value={inputText}
                                            onChange={(e) => setInputText(e.target.value)}
                                            placeholder="분석할 텍스트를 입력하세요..."
                                            className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        />
                                        <div className="mt-4">
                                            <button
                                                onClick={processText}
                                                disabled={isProcessing || !inputText.trim()}
                                                className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center space-x-2"
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                                        <span>처리 중...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <CogIcon className="w-4 h-4" />
                                                        <span>텍스트 처리</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">처리 결과</label>
                                        <div className="h-48 p-4 border border-gray-300 rounded-lg bg-gray-50 overflow-y-auto">
                                            {isProcessing ? (
                                                <div className="flex items-center justify-center h-full">
                                                    <ArrowPathIcon className="w-6 h-6 animate-spin text-gray-400" />
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="text-center">
                                                        <p className="text-sm text-gray-600">텍스트를 입력하고 처리 버튼을 클릭하세요</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* NLP 성능 지표 */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">NLP 성능 지표</h4>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-emerald-600">94.2%</div>
                                        <div className="text-sm text-gray-600">평균 정확도</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">0.8초</div>
                                        <div className="text-sm text-gray-600">평균 처리 시간</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">4개</div>
                                        <div className="text-sm text-gray-600">활성 모델</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-orange-600">6개</div>
                                        <div className="text-sm text-gray-600">지원 작업</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tasks' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">NLP 작업</h4>
                                <div className="space-y-4">
                                    {nlpTasks.map(task => (
                                        <div key={task.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    {getTypeIcon(task.type)}
                                                    <div>
                                                        <h5 className="font-semibold text-gray-900 capitalize">{task.type}</h5>
                                                        <p className="text-sm text-gray-500">{task.timestamp}</p>
                                                    </div>
                                                </div>
                                                <span className="text-sm text-gray-500">{task.confidence}%</span>
                                            </div>
                                            <div className="mb-3">
                                                <p className="text-sm text-gray-700 line-clamp-2">{task.input}</p>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center space-x-4">
                                                    <span className="text-gray-600">처리시간: {task.processingTime.toFixed(1)}초</span>
                                                    <span className="text-gray-600">신뢰도: {task.confidence}%</span>
                                                </div>
                                                <button className="text-blue-600 hover:text-blue-700 font-medium">
                                                    상세 보기
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'models' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">NLP 모델</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {nlpModels.map(model => (
                                        <div key={model.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h5 className="font-semibold text-gray-900">{model.name}</h5>
                                                    <p className="text-sm text-gray-500">{model.type} • {model.language}</p>
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
                                                    <span className="text-gray-600">속도:</span>
                                                    <span className="font-semibold text-gray-900">{model.speed}초</span>
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

                    {activeTab === 'insights' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">NLP 인사이트</h4>
                                <div className="space-y-4">
                                    {nlpTasks.flatMap(task => task.insights).map(insight => (
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

                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">NLP 설정</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">실시간 처리</h5>
                                            <p className="text-sm text-gray-600">실시간 텍스트 처리 활성화</p>
                                        </div>
                                        <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${nlpSettings.enableRealTime
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-gray-300 text-gray-700'
                                            }`}>
                                            {nlpSettings.enableRealTime ? '활성화' : '비활성화'}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">배치 처리</h5>
                                            <p className="text-sm text-gray-600">대량 텍스트 배치 처리</p>
                                        </div>
                                        <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${nlpSettings.enableBatchProcessing
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-gray-300 text-gray-700'
                                            }`}>
                                            {nlpSettings.enableBatchProcessing ? '활성화' : '비활성화'}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">모델 크기</h5>
                                            <p className="text-sm text-gray-600">NLP 모델 크기 설정</p>
                                        </div>
                                        <select
                                            value={nlpSettings.modelSize}
                                            onChange={(e) => setNlpSettings(prev => ({ ...prev, modelSize: e.target.value as any }))}
                                            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        >
                                            <option value="small">작음</option>
                                            <option value="medium">보통</option>
                                            <option value="large">큼</option>
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

export default AdvancedAINaturalLanguageProcessing; 