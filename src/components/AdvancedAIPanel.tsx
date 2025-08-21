import React from 'react';
import { X, Bot, BarChart3, Lightbulb, Target, User } from 'lucide-react';

import { SimpleAdvancedAIResponse } from '../services/simpleAdvancedAIService';

interface AdvancedAIPanelProps {
    isOpen: boolean;
    onClose: () => void;
    advancedAIResponse: SimpleAdvancedAIResponse | null;
    userProfile: any;
    learningProgress: {
        totalInteractions: number;
        learningScore: number;
        adaptationLevel: number;
        confidence: number;
    };
}

const AdvancedAIPanel: React.FC<AdvancedAIPanelProps> = ({
    isOpen,
    onClose,
    advancedAIResponse,
    userProfile,
    learningProgress
}) => {
    if (!isOpen || !advancedAIResponse) return null;

    return (
        <div className="absolute inset-0 bg-white z-50">
            <div className="flex flex-col h-full">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                        <h2 className="text-lg font-semibold text-gray-900">🤖 고급 AI 분석 결과</h2>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm text-gray-600">실시간 학습 중</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="text-sm text-gray-600">
                            신뢰도: {Math.round(advancedAIResponse.confidence * 100)}%
                        </div>
                    </div>
                </div>
                
                {/* 고급 AI 분석 결과 콘텐츠 */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* 학습 진행률 */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 학습 진행률</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600 mb-1">
                                        {learningProgress.totalInteractions}
                                    </div>
                                    <p className="text-sm text-gray-600">총 상호작용</p>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600 mb-1">
                                        {Math.round(learningProgress.learningScore * 100)}%
                                    </div>
                                    <p className="text-sm text-gray-600">학습 점수</p>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600 mb-1">
                                        {Math.round(learningProgress.adaptationLevel * 100)}%
                                    </div>
                                    <p className="text-sm text-gray-600">적응 수준</p>
                                </div>
                                <div className="text-center p-4 bg-orange-50 rounded-lg">
                                    <div className="text-2xl font-bold text-orange-600 mb-1">
                                        {Math.round(learningProgress.confidence * 100)}%
                                    </div>
                                    <p className="text-sm text-gray-600">신뢰도</p>
                                </div>
                            </div>
                        </div>

                        {/* 사용자 인사이트 */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 사용자 인사이트</h3>
                            <div className="space-y-4">
                                {advancedAIResponse.userInsights.preferences.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">🎯 선호도</h4>
                                        <div className="space-y-2">
                                            {advancedAIResponse.userInsights.preferences.map((pref, index) => (
                                                <div key={index} className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                                    <span className="text-sm text-gray-700">{pref}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {advancedAIResponse.userInsights.behaviorPatterns.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">📊 행동 패턴</h4>
                                        <div className="space-y-2">
                                            {advancedAIResponse.userInsights.behaviorPatterns.map((pattern, index) => (
                                                <div key={index} className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                                                    <span className="text-sm text-gray-700">{pattern}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {advancedAIResponse.userInsights.improvementAreas.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">💡 개선 영역</h4>
                                        <div className="space-y-2">
                                            {advancedAIResponse.userInsights.improvementAreas.map((area, index) => (
                                                <div key={index} className="flex items-center space-x-2 p-2 bg-yellow-50 rounded-lg">
                                                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                                                    <span className="text-sm text-gray-700">{area}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 추천사항 */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 AI 추천사항</h3>
                            <div className="space-y-3">
                                {advancedAIResponse.recommendations.map((rec, index) => (
                                    <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                                        <Lightbulb className="w-4 h-4 text-purple-500 mt-0.5" />
                                        <p className="text-gray-700">{rec}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 다음 액션 */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 다음 액션</h3>
                            <div className="space-y-3">
                                {advancedAIResponse.nextActions.map((action, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <Target className="w-4 h-4 text-orange-500" />
                                            <span className="text-gray-700">{action}</span>
                                        </div>
                                        <button className="px-3 py-1 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors">
                                            실행
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 사용자 프로필 */}
                        {userProfile && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 사용자 프로필</h3>
                                <div className="space-y-4">
                                    {userProfile.expertise && userProfile.expertise.length > 0 && (
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">전문 분야</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {userProfile.expertise.map((exp: string, index: number) => (
                                                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                                        {exp}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {userProfile.interests && userProfile.interests.length > 0 && (
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">관심사</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {userProfile.interests.slice(0, 8).map((interest: string, index: number) => (
                                                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                                        {interest}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">의사소통 스타일</h4>
                                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                                {userProfile.communicationStyle}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">응답 선호도</h4>
                                            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                                                {userProfile.responsePreference}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedAIPanel;
