import React, { useState, useEffect } from 'react';
import {
    StarIcon,
    HeartIcon,
    FaceSmileIcon,
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
    ComputerDesktopIcon as MonitorIcon,
    CogIcon as SettingsIcon,
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

interface EmotionAnalysis {
    id: string;
    type: 'text' | 'voice' | 'image' | 'video';
    content: string;
    emotion: EmotionResult;
    confidence: number;
    timestamp: string;
    insights: EmotionInsight[];
}

interface EmotionResult {
    primary: string;
    secondary?: string;
    intensity: number;
    valence: number;
    arousal: number;
    dominance: number;
    emotions: {
        joy: number;
        sadness: number;
        anger: number;
        fear: number;
        surprise: number;
        disgust: number;
        neutral: number;
    };
}

interface EmotionInsight {
    id: string;
    type: 'pattern' | 'trend' | 'trigger' | 'context' | 'intensity' | 'duration';
    title: string;
    description: string;
    confidence: number;
    value: any;
}

interface EmotionModel {
    id: string;
    name: string;
    type: 'text' | 'voice' | 'image' | 'multimodal';
    accuracy: number;
    speed: number;
    status: 'active' | 'training' | 'inactive';
    lastUpdated: string;
    usage: number;
}

interface EmotionSettings {
    enableRealTime: boolean;
    enableMultimodal: boolean;
    sensitivity: number;
    analysisDepth: 'basic' | 'detailed' | 'comprehensive';
    emotionCategories: string[];
}

interface AdvancedAIEmotionAnalysisProps {
    isActive: boolean;
    onToggle: () => void;
}

const AdvancedAIEmotionAnalysis: React.FC<AdvancedAIEmotionAnalysisProps> = ({
    isActive,
    onToggle
}) => {
    const [emotionAnalyses, setEmotionAnalyses] = useState<EmotionAnalysis[]>([
        {
            id: 'emotion-1',
            type: 'text',
            content: '정말 기쁩니다! AI 시스템이 완벽하게 작동하고 있어요. 이제 모든 것이 순조롭게 진행될 것 같아요.',
            emotion: {
                primary: 'joy',
                secondary: 'excitement',
                intensity: 85,
                valence: 0.9,
                arousal: 0.7,
                dominance: 0.8,
                emotions: {
                    joy: 85,
                    sadness: 5,
                    anger: 2,
                    fear: 3,
                    surprise: 10,
                    disgust: 1,
                    neutral: 15
                }
            },
            confidence: 92.5,
            timestamp: '5분 전',
            insights: [
                {
                    id: 'insight-1',
                    type: 'pattern',
                    title: '긍정적 감정 패턴',
                    description: '기쁨과 흥미가 주도적인 감정 상태',
                    confidence: 89.3,
                    value: 'positive_excitement'
                },
                {
                    id: 'insight-2',
                    type: 'intensity',
                    title: '높은 감정 강도',
                    description: '85%의 높은 기쁨 강도로 매우 긍정적',
                    confidence: 91.7,
                    value: 85
                }
            ]
        },
        {
            id: 'emotion-2',
            type: 'voice',
            content: '음성 분석: "시스템에 문제가 있는 것 같아요. 좀 답답하네요."',
            emotion: {
                primary: 'frustration',
                secondary: 'concern',
                intensity: 65,
                valence: -0.3,
                arousal: 0.6,
                dominance: 0.4,
                emotions: {
                    joy: 10,
                    sadness: 25,
                    anger: 40,
                    fear: 15,
                    surprise: 5,
                    disgust: 8,
                    neutral: 20
                }
            },
            confidence: 87.2,
            timestamp: '12분 전',
            insights: [
                {
                    id: 'insight-3',
                    type: 'trigger',
                    title: '문제 상황 트리거',
                    description: '시스템 문제로 인한 답답함과 좌절감',
                    confidence: 84.5,
                    value: 'system_issue_frustration'
                }
            ]
        },
        {
            id: 'emotion-3',
            type: 'image',
            content: '이미지 분석: 사용자 인터페이스 스크린샷',
            emotion: {
                primary: 'neutral',
                secondary: 'satisfaction',
                intensity: 45,
                valence: 0.2,
                arousal: 0.3,
                dominance: 0.6,
                emotions: {
                    joy: 25,
                    sadness: 10,
                    anger: 5,
                    fear: 8,
                    surprise: 12,
                    disgust: 3,
                    neutral: 55
                }
            },
            confidence: 78.9,
            timestamp: '25분 전',
            insights: [
                {
                    id: 'insight-4',
                    type: 'context',
                    title: '중립적 만족 상태',
                    description: '기능적 만족과 중립적 감정 상태',
                    confidence: 82.1,
                    value: 'functional_satisfaction'
                }
            ]
        }
    ]);

    const [emotionModels, setEmotionModels] = useState<EmotionModel[]>([
        {
            id: 'model-1',
            name: 'BERT Emotion Classifier',
            type: 'text',
            accuracy: 92.5,
            speed: 0.8,
            status: 'active',
            lastUpdated: '1일 전',
            usage: 1850
        },
        {
            id: 'model-2',
            name: 'Voice Emotion Recognition',
            type: 'voice',
            accuracy: 89.3,
            speed: 1.2,
            status: 'active',
            lastUpdated: '2일 전',
            usage: 1200
        },
        {
            id: 'model-3',
            name: 'Facial Emotion Detection',
            type: 'image',
            accuracy: 94.7,
            speed: 0.6,
            status: 'active',
            lastUpdated: '1주일 전',
            usage: 2100
        },
        {
            id: 'model-4',
            name: 'Multimodal Emotion Fusion',
            type: 'multimodal',
            accuracy: 96.2,
            speed: 1.5,
            status: 'training',
            lastUpdated: '3일 전',
            usage: 450
        }
    ]);

    const [emotionSettings, setEmotionSettings] = useState<EmotionSettings>({
        enableRealTime: true,
        enableMultimodal: true,
        sensitivity: 75,
        analysisDepth: 'detailed',
        emotionCategories: ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'neutral']
    });

    const [inputText, setInputText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [activeTab, setActiveTab] = useState<'analyze' | 'sessions' | 'models' | 'insights' | 'settings'>('analyze');

    const emotions = [
        { name: 'joy', color: 'bg-yellow-500', icon: '😊' },
        { name: 'sadness', color: 'bg-blue-500', icon: '😢' },
        { name: 'anger', color: 'bg-red-500', icon: '😠' },
        { name: 'fear', color: 'bg-purple-500', icon: '😨' },
        { name: 'surprise', color: 'bg-orange-500', icon: '😲' },
        { name: 'disgust', color: 'bg-green-500', icon: '🤢' },
        { name: 'neutral', color: 'bg-gray-500', icon: '😐' }
    ];

    const analyzeEmotion = () => {
        if (!inputText.trim()) return;

        setIsAnalyzing(true);

        // 감정 분석 시뮬레이션
        setTimeout(() => {
            const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
            const intensity = Math.floor(Math.random() * 40) + 60;

            const newAnalysis: EmotionAnalysis = {
                id: `emotion-${Date.now()}`,
                type: 'text',
                content: inputText,
                emotion: {
                    primary: randomEmotion.name,
                    intensity: intensity,
                    valence: Math.random() * 2 - 1,
                    arousal: Math.random(),
                    dominance: Math.random(),
                    emotions: {
                        joy: Math.random() * 100,
                        sadness: Math.random() * 100,
                        anger: Math.random() * 100,
                        fear: Math.random() * 100,
                        surprise: Math.random() * 100,
                        disgust: Math.random() * 100,
                        neutral: Math.random() * 100
                    }
                },
                confidence: Math.floor(Math.random() * 20) + 80,
                timestamp: '방금 전',
                insights: [
                    {
                        id: `insight-${Date.now()}`,
                        type: 'pattern',
                        title: `${randomEmotion.name} 감정 패턴`,
                        description: `${randomEmotion.name}이 주도적인 감정 상태`,
                        confidence: Math.floor(Math.random() * 20) + 80,
                        value: `${randomEmotion.name}_pattern`
                    }
                ]
            };

            setEmotionAnalyses(prev => [newAnalysis, ...prev]);
            setIsAnalyzing(false);
            setInputText('');
        }, 2000);
    };

    const getEmotionColor = (emotion: string) => {
        const emotionData = emotions.find(e => e.name === emotion);
        return emotionData?.color || 'bg-gray-500';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'training': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'inactive': return 'text-gray-600 bg-gray-50 border-gray-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    if (!isActive) {
        return (
            <div className="absolute bottom-4 right-4 z-50">
                <button
                    onClick={onToggle}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2"
                >
                    <HeartIcon className="w-5 h-5" />
                    <span>감정 분석</span>
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
                                <HeartIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">고도화된 AI 지능형 감정 분석 시스템</h3>
                                <p className="text-gray-400 text-sm">텍스트, 음성, 이미지의 감정 분석</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-sm">{emotionAnalyses.length}개 분석</span>
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
                        { id: 'analyze', label: '분석', icon: MagnifyingGlassIcon },
                        { id: 'sessions', label: '세션', icon: ClockIcon },
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
                    {activeTab === 'analyze' && (
                        <div className="space-y-6">
                            {/* 감정 분석 인터페이스 */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">실시간 감정 분석</h4>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">분석할 텍스트</label>
                                        <textarea
                                            value={inputText}
                                            onChange={(e) => setInputText(e.target.value)}
                                            placeholder="감정을 분석할 텍스트를 입력하세요..."
                                            className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        />
                                        <div className="mt-4 flex space-x-2">
                                            <button
                                                onClick={analyzeEmotion}
                                                disabled={isAnalyzing || !inputText.trim()}
                                                className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center space-x-2"
                                            >
                                                {isAnalyzing ? (
                                                    <>
                                                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                                        <span>분석 중...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <HeartIcon className="w-4 h-4" />
                                                        <span>감정 분석</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">감정 분석 결과</label>
                                        <div className="h-48 p-4 border border-gray-300 rounded-lg bg-gray-50 overflow-y-auto">
                                            {isAnalyzing ? (
                                                <div className="flex items-center justify-center h-full">
                                                    <ArrowPathIcon className="w-6 h-6 animate-spin text-gray-400" />
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="text-center">
                                                        <p className="text-sm text-gray-600">텍스트를 입력하고 분석 버튼을 클릭하세요</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 감정 분포 차트 */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">감정 분포</h4>
                                <div className="grid grid-cols-2 lg:grid-cols-7 gap-4">
                                    {emotions.map(emotion => (
                                        <div key={emotion.name} className="text-center p-4 bg-gray-50 rounded-lg">
                                            <div className="text-2xl mb-2">{emotion.icon}</div>
                                            <div className="text-sm font-medium text-gray-900 capitalize">{emotion.name}</div>
                                            <div className="text-xs text-gray-500">0%</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sessions' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">감정 분석 세션</h4>
                                <div className="space-y-4">
                                    {emotionAnalyses.map(analysis => (
                                        <div key={analysis.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getEmotionColor(analysis.emotion.primary)}`}>
                                                        {emotions.find(e => e.name === analysis.emotion.primary)?.icon}
                                                    </div>
                                                    <div>
                                                        <h5 className="font-semibold text-gray-900 capitalize">{analysis.emotion.primary}</h5>
                                                        <p className="text-sm text-gray-500">{analysis.timestamp}</p>
                                                    </div>
                                                </div>
                                                <span className="text-sm text-gray-500">{analysis.confidence}%</span>
                                            </div>
                                            <div className="mb-3">
                                                <p className="text-sm text-gray-700 line-clamp-2">{analysis.content}</p>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center space-x-4">
                                                    <span className="text-gray-600">강도: {analysis.emotion.intensity}%</span>
                                                    <span className="text-gray-600">유형: {analysis.type}</span>
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
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">감정 분석 모델</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {emotionModels.map(model => (
                                        <div key={model.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h5 className="font-semibold text-gray-900">{model.name}</h5>
                                                    <p className="text-sm text-gray-500">{model.type}</p>
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
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">감정 분석 인사이트</h4>
                                <div className="space-y-4">
                                    {emotionAnalyses.flatMap(analysis => analysis.insights).map(insight => (
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
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">감정 분석 설정</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">실시간 분석</h5>
                                            <p className="text-sm text-gray-600">실시간 감정 분석 활성화</p>
                                        </div>
                                        <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${emotionSettings.enableRealTime
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-gray-300 text-gray-700'
                                            }`}>
                                            {emotionSettings.enableRealTime ? '활성화' : '비활성화'}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">다중 모달 분석</h5>
                                            <p className="text-sm text-gray-600">텍스트, 음성, 이미지 통합 분석</p>
                                        </div>
                                        <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${emotionSettings.enableMultimodal
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-gray-300 text-gray-700'
                                            }`}>
                                            {emotionSettings.enableMultimodal ? '활성화' : '비활성화'}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">분석 깊이</h5>
                                            <p className="text-sm text-gray-600">감정 분석의 상세도 설정</p>
                                        </div>
                                        <select
                                            value={emotionSettings.analysisDepth}
                                            onChange={(e) => setEmotionSettings(prev => ({ ...prev, analysisDepth: e.target.value as any }))}
                                            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        >
                                            <option value="basic">기본</option>
                                            <option value="detailed">상세</option>
                                            <option value="comprehensive">포괄적</option>
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

export default AdvancedAIEmotionAnalysis; 