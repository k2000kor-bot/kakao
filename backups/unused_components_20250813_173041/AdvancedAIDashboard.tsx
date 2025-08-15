import React, { useState, useEffect } from 'react';
import {
    ChartBarIcon,
    CpuChipIcon,
    HeartIcon,
    CogIcon,
    LightBulbIcon,
    UserIcon,
    ClockIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { advancedAIService } from '../services/advancedAIService';

interface AIDashboardData {
    emotionAnalysis: {
        primary: string;
        secondary: string[];
        intensity: number;
        confidence: number;
    };
    learningContext: {
        userPreferences: Record<string, any>;
        conversationHistory: any[];
        learningPatterns: string[];
        adaptationLevel: number;
    };
    styleProfiles: Map<string, any>;
    performanceMetrics: {
        responseTime: number;
        accuracy: number;
        userSatisfaction: number;
        learningProgress: number;
    };
}

const AdvancedAIDashboard: React.FC = () => {
    const [dashboardData, setDashboardData] = useState<AIDashboardData | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
        const interval = setInterval(loadDashboardData, 5000); // 5초마다 업데이트
        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = async () => {
        try {
            const learningContext = advancedAIService.getLearningContext();
            const styleProfiles = advancedAIService.getAllStyleProfiles();

            // 성능 메트릭 시뮬레이션
            const performanceMetrics = {
                responseTime: Math.random() * 1000 + 200,
                accuracy: Math.random() * 0.3 + 0.7,
                userSatisfaction: Math.random() * 0.4 + 0.6,
                learningProgress: Math.random() * 0.5 + 0.5
            };

            setDashboardData({
                emotionAnalysis: {
                    primary: 'neutral',
                    secondary: ['calm', 'focused'],
                    intensity: 0.6,
                    confidence: 0.8
                },
                learningContext,
                styleProfiles,
                performanceMetrics
            });
            setIsLoading(false);
        } catch (error) {
            console.error('대시보드 데이터 로드 실패:', error);
            setIsLoading(false);
        }
    };

    const resetLearningContext = () => {
        advancedAIService.resetLearningContext();
        loadDashboardData();
    };

    const clearEmotionCache = () => {
        advancedAIService.clearEmotionCache();
        loadDashboardData();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="text-center text-gray-500 py-8">
                대시보드 데이터를 불러올 수 없습니다.
            </div>
        );
    }

    const { emotionAnalysis, learningContext, styleProfiles, performanceMetrics } = dashboardData;

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <CpuChipIcon className="h-8 w-8 text-blue-600 mr-3" />
                    AI 고도화 대시보드
                </h2>
                <div className="flex space-x-2">
                    <button
                        onClick={resetLearningContext}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                        학습 초기화
                    </button>
                    <button
                        onClick={clearEmotionCache}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                        감정 캐시 초기화
                    </button>
                </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="flex space-x-1 mb-6">
                {[
                    { id: 'overview', name: '개요', icon: ChartBarIcon },
                    { id: 'emotion', name: '감정 분석', icon: HeartIcon },
                    { id: 'learning', name: '학습 컨텍스트', icon: CpuChipIcon },
                    { id: 'style', name: '스타일 프로필', icon: CogIcon },
                    { id: 'performance', name: '성능 메트릭', icon: SparklesIcon }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center px-4 py-2 rounded-lg transition-colors ${activeTab === tab.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <tab.icon className="h-5 w-5 mr-2" />
                        {tab.name}
                    </button>
                ))}
            </div>

            {/* 개요 탭 */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100">적응 수준</p>
                                <p className="text-3xl font-bold">
                                    {Math.round(learningContext.adaptationLevel * 100)}%
                                </p>
                            </div>
                            <UserIcon className="h-8 w-8 text-blue-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100">감정 신뢰도</p>
                                <p className="text-3xl font-bold">
                                    {Math.round(emotionAnalysis.confidence * 100)}%
                                </p>
                            </div>
                            <HeartIcon className="h-8 w-8 text-green-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100">응답 시간</p>
                                <p className="text-3xl font-bold">
                                    {Math.round(performanceMetrics.responseTime)}ms
                                </p>
                            </div>
                            <ClockIcon className="h-8 w-8 text-purple-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100">학습 패턴</p>
                                <p className="text-3xl font-bold">
                                    {learningContext.learningPatterns.length}
                                </p>
                            </div>
                            <LightBulbIcon className="h-8 w-8 text-orange-200" />
                        </div>
                    </div>
                </div>
            )}

            {/* 감정 분석 탭 */}
            {activeTab === 'emotion' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4">주요 감정</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">주 감정:</span>
                                    <span className="font-semibold capitalize">{emotionAnalysis.primary}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">강도:</span>
                                    <div className="flex items-center">
                                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${emotionAnalysis.intensity * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm">{Math.round(emotionAnalysis.intensity * 100)}%</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">신뢰도:</span>
                                    <div className="flex items-center">
                                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full"
                                                style={{ width: `${emotionAnalysis.confidence * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm">{Math.round(emotionAnalysis.confidence * 100)}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4">보조 감정</h3>
                            <div className="space-y-2">
                                {emotionAnalysis.secondary.map((emotion, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-gray-600 capitalize">{emotion}</span>
                                        <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                                            보조
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 학습 컨텍스트 탭 */}
            {activeTab === 'learning' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4">학습 통계</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">대화 수:</span>
                                    <span className="font-semibold">{learningContext.conversationHistory.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">적응 수준:</span>
                                    <div className="flex items-center">
                                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                            <div
                                                className="bg-purple-600 h-2 rounded-full"
                                                style={{ width: `${learningContext.adaptationLevel * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm">{Math.round(learningContext.adaptationLevel * 100)}%</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">학습 패턴:</span>
                                    <span className="font-semibold">{learningContext.learningPatterns.length}개</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4">사용자 선호도</h3>
                            <div className="space-y-2">
                                {Object.entries(learningContext.userPreferences).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between">
                                        <span className="text-gray-600 capitalize">{key}:</span>
                                        <span className="text-sm bg-blue-100 px-2 py-1 rounded">
                                            {String(value)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">학습 패턴</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {learningContext.learningPatterns.map((pattern, index) => (
                                <div key={index} className="bg-gray-100 px-3 py-2 rounded text-sm">
                                    {pattern}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 스타일 프로필 탭 */}
            {activeTab === 'style' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from(styleProfiles.entries()).map(([style, profile]) => (
                            <div key={style} className="bg-white border rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4 capitalize">{style}</h3>
                                <div className="space-y-3">
                                    {Object.entries(profile).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between">
                                            <span className="text-gray-600 capitalize">{key}:</span>
                                            <div className="flex items-center">
                                                <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{ width: `${(value as number) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm">{Math.round((value as number) * 100)}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 성능 메트릭 탭 */}
            {activeTab === 'performance' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4">응답 성능</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">평균 응답 시간:</span>
                                    <span className="font-semibold">{Math.round(performanceMetrics.responseTime)}ms</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">정확도:</span>
                                    <div className="flex items-center">
                                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full"
                                                style={{ width: `${performanceMetrics.accuracy * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm">{Math.round(performanceMetrics.accuracy * 100)}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4">사용자 만족도</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">만족도:</span>
                                    <div className="flex items-center">
                                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                            <div
                                                className="bg-yellow-600 h-2 rounded-full"
                                                style={{ width: `${performanceMetrics.userSatisfaction * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm">{Math.round(performanceMetrics.userSatisfaction * 100)}%</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">학습 진행률:</span>
                                    <div className="flex items-center">
                                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                            <div
                                                className="bg-purple-600 h-2 rounded-full"
                                                style={{ width: `${performanceMetrics.learningProgress * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm">{Math.round(performanceMetrics.learningProgress * 100)}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedAIDashboard;
