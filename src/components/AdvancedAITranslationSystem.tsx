import React, { useState, useEffect } from 'react';
import {
    StarIcon,
    GlobeAltIcon,
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
    HeartIcon,
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
    CpuChipIcon,
    LanguageIcon
} from '@heroicons/react/24/outline';

interface TranslationSession {
    id: string;
    sourceLanguage: string;
    targetLanguage: string;
    sourceText: string;
    translatedText: string;
    confidence: number;
    processingTime: number;
    timestamp: string;
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    insights: TranslationInsight[];
}

interface TranslationInsight {
    id: string;
    type: 'context' | 'tone' | 'formality' | 'idiom' | 'cultural' | 'technical';
    title: string;
    description: string;
    confidence: number;
    suggestion?: string;
}

interface LanguageModel {
    id: string;
    name: string;
    sourceLanguage: string;
    targetLanguage: string;
    accuracy: number;
    speed: number;
    status: 'active' | 'training' | 'inactive';
    lastUpdated: string;
    usage: number;
}

interface TranslationSettings {
    autoDetect: boolean;
    preserveFormatting: boolean;
    includeContext: boolean;
    qualityMode: 'fast' | 'balanced' | 'high';
    targetFormality: 'formal' | 'neutral' | 'informal';
}

interface AdvancedAITranslationSystemProps {
    isActive: boolean;
    onToggle: () => void;
}

const AdvancedAITranslationSystem: React.FC<AdvancedAITranslationSystemProps> = ({
    isActive,
    onToggle
}) => {
    const [translationSessions, setTranslationSessions] = useState<TranslationSession[]>([
        {
            id: 'session-1',
            sourceLanguage: 'ko',
            targetLanguage: 'en',
            sourceText: '안녕하세요. AI 번역 시스템을 테스트하고 있습니다. 이 시스템은 고도화된 자연어 처리 기술을 사용하여 정확한 번역을 제공합니다.',
            translatedText: 'Hello. I am testing the AI translation system. This system uses advanced natural language processing technology to provide accurate translations.',
            confidence: 94.2,
            processingTime: 1.8,
            timestamp: '5분 전',
            quality: 'excellent',
            insights: [
                {
                    id: 'insight-1',
                    type: 'context',
                    title: '컨텍스트 분석',
                    description: '기술적 설명과 시스템 소개가 포함된 텍스트',
                    confidence: 92.1
                },
                {
                    id: 'insight-2',
                    type: 'tone',
                    title: '톤 분석',
                    description: '전문적이고 설명적인 톤',
                    confidence: 89.5
                },
                {
                    id: 'insight-3',
                    type: 'technical',
                    title: '기술 용어',
                    description: 'AI, 자연어 처리 등 기술 용어 정확히 번역',
                    confidence: 95.8
                }
            ]
        },
        {
            id: 'session-2',
            sourceLanguage: 'en',
            targetLanguage: 'ko',
            sourceText: 'The advanced AI system provides real-time translation with high accuracy and natural language processing capabilities.',
            translatedText: '고도화된 AI 시스템은 높은 정확도와 자연어 처리 기능을 갖춘 실시간 번역을 제공합니다.',
            confidence: 91.7,
            processingTime: 2.1,
            timestamp: '12분 전',
            quality: 'good',
            insights: [
                {
                    id: 'insight-4',
                    type: 'technical',
                    title: '기술 용어',
                    description: 'AI, 실시간, 자연어 처리 등 전문 용어 번역',
                    confidence: 93.2
                },
                {
                    id: 'insight-5',
                    type: 'formality',
                    title: '격식 수준',
                    description: '전문적이고 격식 있는 표현으로 번역',
                    confidence: 87.8
                }
            ]
        }
    ]);

    const [languageModels, setLanguageModels] = useState<LanguageModel[]>([
        {
            id: 'model-1',
            name: 'Korean-English Neural MT',
            sourceLanguage: 'ko',
            targetLanguage: 'en',
            accuracy: 94.2,
            speed: 1.8,
            status: 'active',
            lastUpdated: '1일 전',
            usage: 1250
        },
        {
            id: 'model-2',
            name: 'English-Korean Neural MT',
            sourceLanguage: 'en',
            targetLanguage: 'ko',
            accuracy: 91.7,
            speed: 2.1,
            status: 'active',
            lastUpdated: '2일 전',
            usage: 980
        },
        {
            id: 'model-3',
            name: 'Japanese-English Neural MT',
            sourceLanguage: 'ja',
            targetLanguage: 'en',
            accuracy: 89.5,
            speed: 2.5,
            status: 'training',
            lastUpdated: '3일 전',
            usage: 450
        },
        {
            id: 'model-4',
            name: 'Chinese-Korean Neural MT',
            sourceLanguage: 'zh',
            targetLanguage: 'ko',
            accuracy: 92.8,
            speed: 1.9,
            status: 'active',
            lastUpdated: '1주일 전',
            usage: 720
        }
    ]);

    const [translationSettings, setTranslationSettings] = useState<TranslationSettings>({
        autoDetect: true,
        preserveFormatting: true,
        includeContext: true,
        qualityMode: 'balanced',
        targetFormality: 'neutral'
    });

    const [sourceText, setSourceText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [sourceLanguage, setSourceLanguage] = useState('ko');
    const [targetLanguage, setTargetLanguage] = useState('en');
    const [isTranslating, setIsTranslating] = useState(false);
    const [activeTab, setActiveTab] = useState<'translate' | 'sessions' | 'models' | 'insights' | 'settings'>('translate');

    const languages = [
        { code: 'ko', name: '한국어', flag: '🇰🇷' },
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'ja', name: '日本語', flag: '🇯🇵' },
        { code: 'zh', name: '中文', flag: '🇨🇳' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
        { code: 'ru', name: 'Русский', flag: '🇷🇺' }
    ];

    const translateText = () => {
        if (!sourceText.trim()) return;

        setIsTranslating(true);

        // 번역 시뮬레이션
        setTimeout(() => {
            const sampleTranslations = {
                'ko-en': 'Hello. I am testing the AI translation system. This system uses advanced natural language processing technology to provide accurate translations.',
                'en-ko': '안녕하세요. AI 번역 시스템을 테스트하고 있습니다. 이 시스템은 고도화된 자연어 처리 기술을 사용하여 정확한 번역을 제공합니다.',
                'ko-ja': 'こんにちは。AI翻訳システムをテストしています。このシステムは高度な自然言語処理技術を使用して正確な翻訳を提供します。',
                'ja-ko': '안녕하세요. AI 번역 시스템을 테스트하고 있습니다. 이 시스템은 고도화된 자연어 처리 기술을 사용하여 정확한 번역을 제공합니다.'
            };

            const key = `${sourceLanguage}-${targetLanguage}`;
            const translated = sampleTranslations[key as keyof typeof sampleTranslations] || sourceText;

            setTranslatedText(translated);
            setIsTranslating(false);

            // 세션에 추가
            const newSession: TranslationSession = {
                id: `session-${Date.now()}`,
                sourceLanguage,
                targetLanguage,
                sourceText,
                translatedText: translated,
                confidence: 94.2,
                processingTime: 1.8,
                timestamp: '방금 전',
                quality: 'excellent',
                insights: [
                    {
                        id: `insight-${Date.now()}`,
                        type: 'context',
                        title: '컨텍스트 분석',
                        description: '일반적인 대화 및 설명 텍스트',
                        confidence: 92.1
                    }
                ]
            };

            setTranslationSessions(prev => [newSession, ...prev]);
        }, 2000);
    };

    const getQualityColor = (quality: string) => {
        switch (quality) {
            case 'excellent': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'fair': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'poor': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
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

    if (!isActive) {
        return (
            <div className="absolute bottom-4 right-4 z-50">
                <button
                    onClick={onToggle}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2"
                >
                    <LanguageIcon className="w-5 h-5" />
                    <span>번역 시스템</span>
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
                                <LanguageIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">고도화된 AI 지능형 번역 시스템</h3>
                                <p className="text-gray-400 text-sm">다국어 번역 및 언어 분석</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-sm">{translationSessions.length}개 세션</span>
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
                        { id: 'translate', label: '번역', icon: LanguageIcon },
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
                    {activeTab === 'translate' && (
                        <div className="space-y-6">
                            {/* 번역 인터페이스 */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">실시간 번역</h4>

                                {/* 언어 선택 */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-gray-700">원본:</span>
                                            <select
                                                value={sourceLanguage}
                                                onChange={(e) => setSourceLanguage(e.target.value)}
                                                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                            >
                                                {languages.map(lang => (
                                                    <option key={lang.code} value={lang.code}>
                                                        {lang.flag} {lang.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                            <ArrowRightIcon className="w-4 h-4" />
                                        </button>

                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-gray-700">번역:</span>
                                            <select
                                                value={targetLanguage}
                                                onChange={(e) => setTargetLanguage(e.target.value)}
                                                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                            >
                                                {languages.map(lang => (
                                                    <option key={lang.code} value={lang.code}>
                                                        {lang.flag} {lang.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        onClick={translateText}
                                        disabled={isTranslating || !sourceText.trim()}
                                        className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center space-x-2"
                                    >
                                        {isTranslating ? (
                                            <>
                                                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                                <span>번역 중...</span>
                                            </>
                                        ) : (
                                            <>
                                                <LanguageIcon className="w-4 h-4" />
                                                <span>번역</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* 텍스트 입력/출력 */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">원본 텍스트</label>
                                        <textarea
                                            value={sourceText}
                                            onChange={(e) => setSourceText(e.target.value)}
                                            placeholder="번역할 텍스트를 입력하세요..."
                                            className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">번역 결과</label>
                                        <div className="w-full h-48 p-4 border border-gray-300 rounded-lg bg-gray-50 overflow-y-auto">
                                            {isTranslating ? (
                                                <div className="flex items-center justify-center h-full">
                                                    <ArrowPathIcon className="w-6 h-6 animate-spin text-gray-400" />
                                                </div>
                                            ) : (
                                                <p className="text-gray-700 leading-relaxed">
                                                    {translatedText || '번역 결과가 여기에 표시됩니다...'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 번역 품질 지표 */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">번역 품질 지표</h4>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-emerald-600">94.2%</div>
                                        <div className="text-sm text-gray-600">번역 정확도</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">1.8초</div>
                                        <div className="text-sm text-gray-600">평균 처리 시간</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">8개</div>
                                        <div className="text-sm text-gray-600">지원 언어</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-orange-600">4개</div>
                                        <div className="text-sm text-gray-600">활성 모델</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sessions' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">번역 세션</h4>
                                <div className="space-y-4">
                                    {translationSessions.map(session => (
                                        <div key={session.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h5 className="font-semibold text-gray-900">
                                                        {languages.find(l => l.code === session.sourceLanguage)?.name} → {languages.find(l => l.code === session.targetLanguage)?.name}
                                                    </h5>
                                                    <p className="text-sm text-gray-500">{session.timestamp}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getQualityColor(session.quality)}`}>
                                                    {session.quality}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-1">원본:</p>
                                                    <p className="text-sm text-gray-700 line-clamp-2">{session.sourceText}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-1">번역:</p>
                                                    <p className="text-sm text-gray-700 line-clamp-2">{session.translatedText}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center space-x-4">
                                                    <span className="text-gray-600">정확도: {session.confidence}%</span>
                                                    <span className="text-gray-600">처리시간: {session.processingTime}초</span>
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
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">번역 모델</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {languageModels.map(model => (
                                        <div key={model.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h5 className="font-semibold text-gray-900">{model.name}</h5>
                                                    <p className="text-sm text-gray-500">
                                                        {languages.find(l => l.code === model.sourceLanguage)?.name} → {languages.find(l => l.code === model.targetLanguage)?.name}
                                                    </p>
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
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">번역 분석 인사이트</h4>
                                <div className="space-y-4">
                                    {translationSessions.flatMap(session => session.insights).map(insight => (
                                        <div key={insight.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h5 className="font-semibold text-gray-900">{insight.title}</h5>
                                                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                                                </div>
                                                <span className="text-sm text-gray-500">{insight.confidence}%</span>
                                            </div>
                                            {insight.suggestion && (
                                                <div className="text-sm text-gray-700 bg-white p-3 rounded border">
                                                    <strong>제안:</strong> {insight.suggestion}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">번역 설정</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">자동 언어 감지</h5>
                                            <p className="text-sm text-gray-600">입력 텍스트의 언어 자동 감지</p>
                                        </div>
                                        <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${translationSettings.autoDetect
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-gray-300 text-gray-700'
                                            }`}>
                                            {translationSettings.autoDetect ? '활성화' : '비활성화'}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">형식 보존</h5>
                                            <p className="text-sm text-gray-600">원본 텍스트의 형식 유지</p>
                                        </div>
                                        <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${translationSettings.preserveFormatting
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-gray-300 text-gray-700'
                                            }`}>
                                            {translationSettings.preserveFormatting ? '활성화' : '비활성화'}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">품질 모드</h5>
                                            <p className="text-sm text-gray-600">번역 품질과 속도 조절</p>
                                        </div>
                                        <select
                                            value={translationSettings.qualityMode}
                                            onChange={(e) => setTranslationSettings(prev => ({ ...prev, qualityMode: e.target.value as any }))}
                                            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        >
                                            <option value="fast">빠름</option>
                                            <option value="balanced">균형</option>
                                            <option value="high">고품질</option>
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

export default AdvancedAITranslationSystem; 