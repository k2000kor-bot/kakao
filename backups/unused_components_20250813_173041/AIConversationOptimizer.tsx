import React, { useState, useEffect } from 'react';
import {
    LightBulbIcon,
    ChartBarIcon,
    UserGroupIcon,
    CogIcon,
    SparklesIcon,
    ArrowTrendingUpIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    UsersIcon
} from '@heroicons/react/24/outline';

interface OptimizationAnalysis {
    [key: string]: any;
}

interface Recommendation {
    type: string;
    priority: string;
    title: string;
    description: string;
    suggestions: string[];
}

interface OptimizationType {
    id: string;
    name: string;
    description: string;
    type: string;
}

interface OptimizationResponse {
    success: boolean;
    optimization_type: string;
    analysis: OptimizationAnalysis;
    recommendations: Recommendation[];
    improvement_score: number;
    metadata: {
        analysis_period: string;
        timestamp: string;
    };
}

const AIConversationOptimizer: React.FC = () => {
    const [selectedRoom, setSelectedRoom] = useState('');
    const [selectedOptimization, setSelectedOptimization] = useState('');
    const [analysisPeriod, setAnalysisPeriod] = useState('7d');
    const [optimizationResult, setOptimizationResult] = useState<OptimizationResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [chatRooms, setChatRooms] = useState<any[]>([]);
    const [optimizationTypes, setOptimizationTypes] = useState<OptimizationType[]>([]);

    useEffect(() => {
        loadChatRooms();
        loadOptimizationTypes();
    }, []);

    const loadChatRooms = async () => {
        try {
            const response = await fetch('http://localhost:8011/api/chat-rooms');
            const data = await response.json();
            if (data.success && data.chat_rooms.length > 0) {
                setChatRooms(data.chat_rooms);
                setSelectedRoom(data.chat_rooms[0].id);
            }
        } catch (error) {
            console.error('채팅방 목록 로드 오류:', error);
        }
    };

    const loadOptimizationTypes = async () => {
        try {
            const response = await fetch('http://localhost:8011/api/optimization-types');
            const data = await response.json();
            setOptimizationTypes(data.optimization_types);
            if (data.optimization_types.length > 0) {
                setSelectedOptimization(data.optimization_types[0].id);
            }
        } catch (error) {
            console.error('최적화 타입 로드 오류:', error);
        }
    };

    const runOptimization = async () => {
        if (!selectedRoom || !selectedOptimization) return;

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8011/api/optimize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_room_id: selectedRoom,
                    optimization_type: selectedOptimization,
                    analysis_period: analysisPeriod
                })
            });

            const data: OptimizationResponse = await response.json();

            if (data.success) {
                setOptimizationResult(data);
            }
        } catch (error) {
            console.error('최적화 오류:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getOptimizationIcon = (type: string) => {
        switch (type) {
            case 'quality': return ChartBarIcon;
            case 'participation': return UserGroupIcon;
            case 'efficiency': return CogIcon;
            case 'conflict': return ExclamationTriangleIcon;
            default: return LightBulbIcon;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'low': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const renderQualityAnalysis = () => {
        if (!optimizationResult) return null;

        const analysis = optimizationResult.analysis;

        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">대화 품질 분석</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className={`text-2xl font-bold ${getScoreColor(analysis.quality_score)}`}>
                                {analysis.quality_score}/100
                            </div>
                            <div className="text-sm text-gray-600">품질 점수</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {analysis.statistics?.total_messages || 0}
                            </div>
                            <div className="text-sm text-gray-600">총 메시지</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                                {analysis.statistics?.unique_participants || 0}
                            </div>
                            <div className="text-sm text-gray-600">참여자 수</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">
                                {analysis.statistics?.avg_message_length || 0}자
                            </div>
                            <div className="text-sm text-gray-600">평균 길이</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">감정 분석</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {analysis.sentiment_analysis?.positive_ratio || 0}%
                            </div>
                            <div className="text-sm text-gray-600">긍정</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-600">
                                {analysis.sentiment_analysis?.neutral_ratio || 0}%
                            </div>
                            <div className="text-sm text-gray-600">중립</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">
                                {analysis.sentiment_analysis?.negative_ratio || 0}%
                            </div>
                            <div className="text-sm text-gray-600">부정</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderParticipationAnalysis = () => {
        if (!optimizationResult) return null;

        const analysis = optimizationResult.analysis;

        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">참여도 분석</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className={`text-2xl font-bold ${getScoreColor(analysis.participation_score)}`}>
                                {analysis.participation_score}/100
                            </div>
                            <div className="text-sm text-gray-600">참여도 점수</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {analysis.activity_distribution?.total || 0}
                            </div>
                            <div className="text-sm text-gray-600">총 참여자</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">활동 수준 분포</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {analysis.activity_distribution?.high || 0}
                            </div>
                            <div className="text-sm text-gray-600">높음</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">
                                {analysis.activity_distribution?.medium || 0}
                            </div>
                            <div className="text-sm text-gray-600">보통</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">
                                {analysis.activity_distribution?.low || 0}
                            </div>
                            <div className="text-sm text-gray-600">낮음</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderEfficiencyAnalysis = () => {
        if (!optimizationResult) return null;

        const analysis = optimizationResult.analysis;

        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">효율성 분석</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className={`text-2xl font-bold ${getScoreColor(analysis.efficiency_score)}`}>
                                {analysis.efficiency_score}/100
                            </div>
                            <div className="text-sm text-gray-600">효율성 점수</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {analysis.message_length_analysis?.average_length || 0}자
                            </div>
                            <div className="text-sm text-gray-600">평균 길이</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">메시지 길이 분포</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                                {analysis.message_length_analysis?.short_messages || 0}
                            </div>
                            <div className="text-sm text-gray-600">짧음</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {analysis.message_length_analysis?.medium_messages || 0}
                            </div>
                            <div className="text-sm text-gray-600">보통</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">
                                {analysis.message_length_analysis?.long_messages || 0}
                            </div>
                            <div className="text-sm text-gray-600">길음</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderConflictAnalysis = () => {
        if (!optimizationResult) return null;

        const analysis = optimizationResult.analysis;

        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">갈등 해결 분석</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className={`text-2xl font-bold ${getScoreColor(analysis.conflict_resolution_score)}`}>
                                {analysis.conflict_resolution_score}/100
                            </div>
                            <div className="text-sm text-gray-600">해결 점수</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {analysis.conflict_analysis?.total_messages || 0}
                            </div>
                            <div className="text-sm text-gray-600">총 메시지</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">갈등 분석</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">
                                {analysis.conflict_analysis?.conflict_ratio || 0}%
                            </div>
                            <div className="text-sm text-gray-600">갈등 비율</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {analysis.conflict_analysis?.resolution_ratio || 0}%
                            </div>
                            <div className="text-sm text-gray-600">해결 비율</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderAnalysis = () => {
        if (!optimizationResult) return null;

        switch (optimizationResult.optimization_type) {
            case 'quality':
                return renderQualityAnalysis();
            case 'participation':
                return renderParticipationAnalysis();
            case 'efficiency':
                return renderEfficiencyAnalysis();
            case 'conflict':
                return renderConflictAnalysis();
            default:
                return null;
        }
    };

    const renderRecommendations = () => {
        if (!optimizationResult) return null;

        return (
            <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">개선 방안</h3>
                <div className="space-y-4">
                    {optimizationResult.recommendations.map((recommendation, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
                                    {recommendation.priority === 'high' ? '높음' : recommendation.priority === 'medium' ? '보통' : '낮음'}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 mb-2">{recommendation.title}</h4>
                                    <p className="text-gray-600 mb-3">{recommendation.description}</p>
                                    <div className="space-y-2">
                                        {recommendation.suggestions.map((suggestion, idx) => (
                                            <div key={idx} className="flex items-start space-x-2">
                                                <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm text-gray-700">{suggestion}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">AI 대화 최적화</h1>
                <p className="text-gray-600">대화 품질을 분석하고 개선 방안을 제안합니다.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 설정 패널 */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">최적화 설정</h2>

                        <div className="space-y-4">
                            {/* 채팅방 선택 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    채팅방 선택
                                </label>
                                <select
                                    value={selectedRoom}
                                    onChange={(e) => setSelectedRoom(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {chatRooms.map((room) => (
                                        <option key={room.id} value={room.id}>
                                            {room.id} ({room.message_count}개)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 최적화 타입 선택 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    최적화 타입
                                </label>
                                <select
                                    value={selectedOptimization}
                                    onChange={(e) => setSelectedOptimization(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {optimizationTypes.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 분석 기간 선택 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    분석 기간
                                </label>
                                <select
                                    value={analysisPeriod}
                                    onChange={(e) => setAnalysisPeriod(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="1d">최근 1일</option>
                                    <option value="7d">최근 7일</option>
                                    <option value="30d">최근 30일</option>
                                    <option value="all">전체 기간</option>
                                </select>
                            </div>

                            {/* 최적화 실행 버튼 */}
                            <button
                                onClick={runOptimization}
                                disabled={isLoading || !selectedRoom || !selectedOptimization}
                                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <>
                                        <SparklesIcon className="w-5 h-5 mr-2 animate-spin" />
                                        분석 중...
                                    </>
                                ) : (
                                    <>
                                        <ArrowTrendingUpIcon className="w-5 h-5 mr-2" />
                                        최적화 실행
                                    </>
                                )}
                            </button>
                        </div>

                        {/* 최적화 타입 설명 */}
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-3">최적화 타입 설명</h3>
                            <div className="space-y-3">
                                {optimizationTypes.map((type) => {
                                    const Icon = getOptimizationIcon(type.id);
                                    return (
                                        <div key={type.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                            <Icon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="font-medium">{type.name}</div>
                                                <div className="text-sm text-gray-600">{type.description}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 결과 패널 */}
                <div className="lg:col-span-2">
                    {optimizationResult ? (
                        <div className="space-y-6">
                            {/* 개선 점수 */}
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h2 className="text-xl font-semibold mb-4">개선 가능성</h2>
                                <div className="text-center">
                                    <div className={`text-4xl font-bold ${getScoreColor(optimizationResult.improvement_score)}`}>
                                        {optimizationResult.improvement_score}%
                                    </div>
                                    <div className="text-gray-600 mt-2">개선 가능한 점수</div>
                                </div>
                            </div>

                            {/* 분석 결과 */}
                            {renderAnalysis()}

                            {/* 개선 방안 */}
                            {renderRecommendations()}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <h2 className="text-xl font-semibold mb-4">최적화 결과</h2>
                            <div className="text-center py-12 text-gray-500">
                                <ArrowTrendingUpIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <div className="text-lg font-medium mb-2">최적화를 실행해주세요</div>
                                <div className="text-sm">채팅방과 최적화 타입을 선택한 후 최적화를 실행하세요.</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIConversationOptimizer; 