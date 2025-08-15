import React, { useState, useEffect } from 'react';
import {
    StarIcon,
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
    HeartIcon,
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

interface Recommendation {
    id: string;
    type: 'content' | 'product' | 'service' | 'action' | 'connection';
    title: string;
    description: string;
    confidence: number;
    relevance: number;
    category: string;
    tags: string[];
    timestamp: string;
    insights: RecommendationInsight[];
    userFeedback?: {
        rating: number;
        feedback: string;
        timestamp: string;
    };
}

interface RecommendationInsight {
    id: string;
    type: 'preference' | 'behavior' | 'trend' | 'similarity' | 'context' | 'timing';
    title: string;
    description: string;
    confidence: number;
    value: any;
}

interface RecommendationModel {
    id: string;
    name: string;
    type: 'collaborative' | 'content-based' | 'hybrid' | 'deep-learning';
    accuracy: number;
    precision: number;
    recall: number;
    status: 'active' | 'training' | 'inactive';
    lastUpdated: string;
    usage: number;
}

interface RecommendationSettings {
    enablePersonalization: boolean;
    enableRealTime: boolean;
    enableContextAware: boolean;
    diversityLevel: 'low' | 'medium' | 'high';
    freshnessWeight: number;
    maxRecommendations: number;
}

interface AdvancedAIRecommendationSystemProps {
    isActive: boolean;
    onToggle: () => void;
}

const AdvancedAIRecommendationSystem: React.FC<AdvancedAIRecommendationSystemProps> = ({
    isActive,
    onToggle
}) => {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([
        {
            id: 'rec-1',
            type: 'content',
            title: 'AI 시스템 최적화 가이드',
            description: '현재 사용 패턴을 분석한 AI 시스템 성능 최적화 방법을 추천합니다.',
            confidence: 94.2,
            relevance: 92.5,
            category: 'AI/ML',
            tags: ['AI', '최적화', '성능', '가이드'],
            timestamp: '5분 전',
            insights: [
                {
                    id: 'insight-1',
                    type: 'preference',
                    title: '사용자 선호도 분석',
                    description: 'AI 시스템 관련 콘텐츠에 높은 관심을 보임',
                    confidence: 89.3,
                    value: 'ai_system_interest'
                },
                {
                    id: 'insight-2',
                    type: 'behavior',
                    title: '행동 패턴 분석',
                    description: '시스템 최적화 관련 검색 및 클릭 패턴 감지',
                    confidence: 91.7,
                    value: 'optimization_behavior'
                }
            ],
            userFeedback: {
                rating: 5,
                feedback: '매우 유용한 정보였습니다!',
                timestamp: '2분 전'
            }
        },
        {
            id: 'rec-2',
            type: 'product',
            title: '고급 데이터 분석 도구',
            description: '현재 프로젝트에 적합한 고급 데이터 시각화 및 분석 도구를 추천합니다.',
            confidence: 87.5,
            relevance: 85.2,
            category: 'Data Analytics',
            tags: ['데이터', '분석', '시각화', '도구'],
            timestamp: '15분 전',
            insights: [
                {
                    id: 'insight-3',
                    type: 'trend',
                    title: '트렌드 분석',
                    description: '데이터 분석 도구 사용 증가 트렌드 감지',
                    confidence: 86.4,
                    value: 'data_analytics_trend'
                }
            ]
        },
        {
            id: 'rec-3',
            type: 'service',
            title: 'AI 모델 학습 서비스',
            description: '현재 프로젝트 요구사항에 맞는 맞춤형 AI 모델 학습 서비스를 추천합니다.',
            confidence: 91.8,
            relevance: 88.7,
            category: 'AI Services',
            tags: ['AI', '모델', '학습', '서비스'],
            timestamp: '30분 전',
            insights: [
                {
                    id: 'insight-4',
                    type: 'similarity',
                    title: '유사 프로젝트 분석',
                    description: '유사한 프로젝트에서 높은 만족도를 보인 서비스',
                    confidence: 93.1,
                    value: 'similar_project_success'
                }
            ]
        }
    ]);

    const [recommendationModels, setRecommendationModels] = useState<RecommendationModel[]>([
        {
            id: 'model-1',
            name: 'Deep Learning Recommender',
            type: 'deep-learning',
            accuracy: 94.2,
            precision: 92.5,
            recall: 89.8,
            status: 'active',
            lastUpdated: '1일 전',
            usage: 2150
        },
        {
            id: 'model-2',
            name: 'Collaborative Filtering',
            type: 'collaborative',
            accuracy: 87.3,
            precision: 85.1,
            recall: 82.7,
            status: 'active',
            lastUpdated: '2일 전',
            usage: 1800
        },
        {
            id: 'model-3',
            name: 'Content-Based Filtering',
            type: 'content-based',
            accuracy: 89.7,
            precision: 88.2,
            recall: 86.5,
            status: 'active',
            lastUpdated: '1주일 전',
            usage: 1650
        },
        {
            id: 'model-4',
            name: 'Hybrid Recommender',
            type: 'hybrid',
            accuracy: 96.1,
            precision: 94.8,
            recall: 92.3,
            status: 'training',
            lastUpdated: '3일 전',
            usage: 950
        }
    ]);

    const [recommendationSettings, setRecommendationSettings] = useState<RecommendationSettings>({
        enablePersonalization: true,
        enableRealTime: true,
        enableContextAware: true,
        diversityLevel: 'medium',
        freshnessWeight: 0.7,
        maxRecommendations: 10
    });

    const [activeTab, setActiveTab] = useState<'recommendations' | 'models' | 'insights' | 'analytics' | 'settings'>('recommendations');

    useEffect(() => {
        // 실시간 추천 시뮬레이션
        const interval = setInterval(() => {
            const newRecommendation: Recommendation = {
                id: `rec-${Date.now()}`,
                type: ['content', 'product', 'service'][Math.floor(Math.random() * 3)] as any,
                title: `추천 항목 ${recommendations.length + 1}`,
                description: 'AI 기반 개인화 추천 시스템이 생성한 새로운 추천 항목입니다.',
                confidence: Math.floor(Math.random() * 20) + 80,
                relevance: Math.floor(Math.random() * 20) + 80,
                category: 'AI/ML',
                tags: ['AI', '추천', '개인화'],
                timestamp: '방금 전',
                insights: [
                    {
                        id: `insight-${Date.now()}`,
                        type: 'preference',
                        title: '실시간 선호도 분석',
                        description: '사용자 행동 패턴 기반 실시간 추천',
                        confidence: Math.floor(Math.random() * 20) + 80,
                        value: 'realtime_preference'
                    }
                ]
            };

            setRecommendations(prev => [newRecommendation, ...prev.slice(0, 9)]);
        }, 10000);

        return () => clearInterval(interval);
    }, [recommendations.length]);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'content': return <BookOpenIcon className="w-4 h-4" />;
            case 'product': return <CubeIcon className="w-4 h-4" />;
            case 'service': return <ServerIcon className="w-4 h-4" />;
            case 'action': return <BoltIcon className="w-4 h-4" />;
            case 'connection': return <UserGroupIcon className="w-4 h-4" />;
            default: return <StarIcon className="w-4 h-4" />;
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
                    <StarIcon className="w-5 h-5" />
                    <span>추천 시스템</span>
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
                                <StarIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">고도화된 AI 지능형 추천 시스템</h3>
                                <p className="text-gray-400 text-sm">개인화된 AI 기반 추천 서비스</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-sm">{recommendations.length}개 추천</span>
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
                        { id: 'recommendations', label: '추천', icon: StarIcon },
                        { id: 'models', label: '모델', icon: CpuChipIcon },
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
                    {activeTab === 'recommendations' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">개인화 추천</h4>
                                <div className="space-y-4">
                                    {recommendations.map(recommendation => (
                                        <div key={recommendation.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    {getTypeIcon(recommendation.type)}
                                                    <div>
                                                        <h5 className="font-semibold text-gray-900">{recommendation.title}</h5>
                                                        <p className="text-sm text-gray-600">{recommendation.category} • {recommendation.timestamp}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getConfidenceColor(recommendation.confidence)}`}>
                                                        {recommendation.confidence}%
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700 mb-3">{recommendation.description}</p>
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {recommendation.tags.map(tag => (
                                                    <span key={tag} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4 text-sm">
                                                    <span className="text-gray-600">관련도: {recommendation.relevance}%</span>
                                                    <span className="text-gray-600">유형: {recommendation.type}</span>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                                                        자세히 보기
                                                    </button>
                                                    <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300 transition-colors">
                                                        피드백
                                                    </button>
                                                </div>
                                            </div>
                                            {recommendation.userFeedback && (
                                                <div className="mt-3 p-3 bg-white rounded border">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <div className="flex">
                                                            {[...Array(5)].map((_, i) => (
                                                                <StarIcon key={i} className={`w-4 h-4 ${i < recommendation.userFeedback!.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                                                            ))}
                                                        </div>
                                                        <span className="text-sm text-gray-500">{recommendation.userFeedback.timestamp}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-700">{recommendation.userFeedback.feedback}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'models' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">추천 모델</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {recommendationModels.map(model => (
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
                                                    <span className="text-gray-600">정밀도:</span>
                                                    <span className="font-semibold text-gray-900">{model.precision}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">재현율:</span>
                                                    <span className="font-semibold text-gray-900">{model.recall}%</span>
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
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">추천 인사이트</h4>
                                <div className="space-y-4">
                                    {recommendations.flatMap(rec => rec.insights).map(insight => (
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
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">추천 분석</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-emerald-600">{recommendations.length}</div>
                                        <div className="text-sm text-gray-600">총 추천 수</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {(recommendations.reduce((acc, rec) => acc + rec.confidence, 0) / recommendations.length).toFixed(1)}%
                                        </div>
                                        <div className="text-sm text-gray-600">평균 정확도</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {(recommendations.reduce((acc, rec) => acc + rec.relevance, 0) / recommendations.length).toFixed(1)}%
                                        </div>
                                        <div className="text-sm text-gray-600">평균 관련도</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-orange-600">
                                            {recommendations.filter(rec => rec.userFeedback).length}
                                        </div>
                                        <div className="text-sm text-gray-600">피드백 수</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">추천 설정</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">개인화 활성화</h5>
                                            <p className="text-sm text-gray-600">사용자별 맞춤 추천 활성화</p>
                                        </div>
                                        <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${recommendationSettings.enablePersonalization
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-gray-300 text-gray-700'
                                            }`}>
                                            {recommendationSettings.enablePersonalization ? '활성화' : '비활성화'}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">실시간 추천</h5>
                                            <p className="text-sm text-gray-600">실시간 추천 업데이트</p>
                                        </div>
                                        <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${recommendationSettings.enableRealTime
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-gray-300 text-gray-700'
                                            }`}>
                                            {recommendationSettings.enableRealTime ? '활성화' : '비활성화'}
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">다양성 수준</h5>
                                            <p className="text-sm text-gray-600">추천 결과의 다양성 조절</p>
                                        </div>
                                        <select
                                            value={recommendationSettings.diversityLevel}
                                            onChange={(e) => setRecommendationSettings(prev => ({ ...prev, diversityLevel: e.target.value as any }))}
                                            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        >
                                            <option value="low">낮음</option>
                                            <option value="medium">보통</option>
                                            <option value="high">높음</option>
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

export default AdvancedAIRecommendationSystem; 