import React, { useState, useEffect } from 'react';
import {
  StarIcon,
    AcademicCapIcon,
    ChartBarIcon,
    ClockIcon,
    UserGroupIcon,
    ArrowTrendingUpIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    LightBulbIcon
} from '@heroicons/react/24/outline';

interface PredictionData {
    conversationTrend: {
        positive: number;
        negative: number;
        neutral: number;
        trend: 'up' | 'down' | 'stable';
    };
    userBehavior: {
        activeUsers: number;
        avgResponseTime: number;
        engagementRate: number;
        topTopics: string[];
    };
    aiPredictions: {
        nextMessageType: string;
        confidence: number;
        suggestedResponse: string;
        riskLevel: 'low' | 'medium' | 'high';
    };
    recommendations: Array<{
        id: string;
        type: 'strategy' | 'timing' | 'content';
        title: string;
        description: string;
        priority: 'high' | 'medium' | 'low';
        impact: number;
    }>;
}

const AdvancedAIPrediction: React.FC = () => {
    const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
    const [autoRefresh, setAutoRefresh] = useState(true);

    // 샘플 데이터 로드
    useEffect(() => {
        const loadPredictionData = () => {
            setTimeout(() => {
                setPredictionData({
                    conversationTrend: {
                        positive: 65,
                        negative: 15,
                        neutral: 20,
                        trend: 'up'
                    },
                    userBehavior: {
                        activeUsers: 23,
                        avgResponseTime: 2.3,
                        engagementRate: 78.5,
                        topTopics: ['프로젝트 진행', '기술 이슈', '일정 조율', '품질 관리']
                    },
                    aiPredictions: {
                        nextMessageType: '질문/요청',
                        confidence: 87.3,
                        suggestedResponse: '프로젝트 진행상황에 대해 더 자세히 설명드리겠습니다.',
                        riskLevel: 'low'
                    },
                    recommendations: [
                        {
                            id: '1',
                            type: 'strategy',
                            title: '긍정적 피드백 강화',
                            description: '현재 긍정적 분위기를 유지하기 위해 적극적인 피드백을 제공하세요.',
                            priority: 'high',
                            impact: 85
                        },
                        {
                            id: '2',
                            type: 'timing',
                            title: '즉시 응답 권장',
                            description: '사용자들의 평균 응답시간이 짧아 즉시 대응이 필요합니다.',
                            priority: 'medium',
                            impact: 72
                        },
                        {
                            id: '3',
                            type: 'content',
                            title: '기술적 세부사항 제공',
                            description: '현재 대화 주제에 맞춰 더 구체적인 기술 정보를 제공하세요.',
                            priority: 'medium',
                            impact: 68
                        }
                    ]
                });
                setIsLoading(false);
            }, 1500);
        };

        loadPredictionData();
    }, [selectedTimeframe]);

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up':
                return <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />;
            case 'down':
                return <ArrowTrendingUpIcon className="w-5 h-5 text-red-500 transform rotate-180" />;
            default:
                return <ChartBarIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'low':
                return 'text-green-600 bg-green-100';
            case 'medium':
                return 'text-yellow-600 bg-yellow-100';
            case 'high':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'border-red-500 bg-red-50';
            case 'medium':
                return 'border-yellow-500 bg-yellow-50';
            case 'low':
                return 'border-green-500 bg-green-50';
            default:
                return 'border-gray-300 bg-gray-50';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!predictionData) {
        return (
            <div className="text-center text-gray-500 py-8">
                예측 데이터를 불러올 수 없습니다.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <AcademicCapIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">고급 AI 예측</h1>
                        <p className="text-gray-600">대화 패턴 예측 및 지능형 권장사항</p>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <select
                        value={selectedTimeframe}
                        onChange={(e) => setSelectedTimeframe(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                        <option value="1h">1시간</option>
                        <option value="24h">24시간</option>
                        <option value="7d">7일</option>
                        <option value="30d">30일</option>
                    </select>

                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="rounded"
                        />
                        <span className="text-sm text-gray-600">자동 새로고침</span>
                    </label>
                </div>
            </div>

            {/* 주요 예측 지표 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">대화 트렌드</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {predictionData.conversationTrend.trend === 'up' ? '+' : '-'}
                                {predictionData.conversationTrend.positive}%
                            </p>
                        </div>
                        {getTrendIcon(predictionData.conversationTrend.trend)}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">활성 사용자</p>
                            <p className="text-2xl font-bold text-gray-900">{predictionData.userBehavior.activeUsers}</p>
                        </div>
                        <UserGroupIcon className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">평균 응답시간</p>
                            <p className="text-2xl font-bold text-gray-900">{predictionData.userBehavior.avgResponseTime}분</p>
                        </div>
                        <ClockIcon className="w-8 h-8 text-orange-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">참여율</p>
                            <p className="text-2xl font-bold text-gray-900">{predictionData.userBehavior.engagementRate}%</p>
                        </div>
                        <ChartBarIcon className="w-8 h-8 text-green-500" />
                    </div>
                </div>
            </div>

            {/* AI 예측 섹션 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI 예측</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium text-gray-900 mb-3">다음 메시지 예측</h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">예상 유형</span>
                                <span className="text-sm font-medium">{predictionData.aiPredictions.nextMessageType}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">신뢰도</span>
                                <span className="text-sm font-medium">{predictionData.aiPredictions.confidence}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">위험도</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${getRiskColor(predictionData.aiPredictions.riskLevel)}`}>
                                    {predictionData.aiPredictions.riskLevel === 'low' ? '낮음' :
                                        predictionData.aiPredictions.riskLevel === 'medium' ? '보통' : '높음'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-medium text-gray-900 mb-3">제안 응답</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-700 mb-3">
                                {predictionData.aiPredictions.suggestedResponse}
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">AI 생성</span>
                                <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
                                    사용
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 대화 트렌드 분석 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">대화 트렌드 분석</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-green-600 text-xl">😊</span>
                        </div>
                        <p className="text-sm text-gray-600">긍정</p>
                        <p className="text-2xl font-bold text-green-600">{predictionData.conversationTrend.positive}%</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-gray-600 text-xl">😐</span>
                        </div>
                        <p className="text-sm text-gray-600">중립</p>
                        <p className="text-2xl font-bold text-gray-600">{predictionData.conversationTrend.neutral}%</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-red-600 text-xl">😞</span>
                        </div>
                        <p className="text-sm text-gray-600">부정</p>
                        <p className="text-2xl font-bold text-red-600">{predictionData.conversationTrend.negative}%</p>
                    </div>
                </div>
            </div>

            {/* 상위 주제 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">상위 대화 주제</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {predictionData.userBehavior.topTopics.map((topic, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                                <span className="font-medium text-gray-900">{topic}</span>
                            </div>
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${100 - (index * 15)}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI 권장사항 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI 권장사항</h3>
                <div className="space-y-4">
                    {predictionData.recommendations.map((recommendation) => (
                        <div
                            key={recommendation.id}
                            className={`border rounded-lg p-4 ${getPriorityColor(recommendation.priority)}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                    <LightBulbIcon className="w-5 h-5 text-yellow-500 mt-1" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{recommendation.description}</p>
                                        <div className="flex items-center space-x-4 mt-2">
                                            <span className={`px-2 py-1 text-xs rounded-full ${recommendation.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                {recommendation.priority === 'high' ? '높음' :
                                                    recommendation.priority === 'medium' ? '보통' : '낮음'} 우선순위
                                            </span>
                                            <span className="text-xs text-gray-500">영향도: {recommendation.impact}%</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
                                    적용
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdvancedAIPrediction; 