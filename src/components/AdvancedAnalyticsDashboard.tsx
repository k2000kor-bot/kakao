import React, { useState, useEffect } from 'react';
import {
    ChartBarIcon,
    ArrowTrendingUpIcon,
    UserGroupIcon,
    ClockIcon,
    EyeIcon,
    CpuChipIcon,
    SparklesIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    DocumentTextIcon,
    ChatBubbleLeftRightIcon,
    CogIcon,
    LightBulbIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
    messageCount: number;
    participantCount: number;
    averageResponseTime: number;
    sentimentDistribution: {
        positive: number;
        negative: number;
        neutral: number;
    };
    topTopics: Array<{
        topic: string;
        frequency: number;
        trend: 'up' | 'down' | 'stable';
    }>;
    participantActivity: Array<{
        name: string;
        messageCount: number;
        avgSentiment: number;
        responseRate: number;
    }>;
    conversationFlow: Array<{
        time: string;
        messageCount: number;
        avgSentiment: number;
    }>;
    aiInsights: string[];
}

interface AdvancedAnalyticsDashboardProps {
    chatHistory?: any[];
    selectedTimeRange?: string;
}

const AdvancedAnalyticsDashboard: React.FC<AdvancedAnalyticsDashboardProps> = ({
    chatHistory = [],
    selectedTimeRange = '7d'
}) => {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState<string>('overview');
    const [realTimeUpdates, setRealTimeUpdates] = useState<boolean>(true);

    // 분석 데이터 생성 시뮬레이션
    const generateAnalyticsData = async () => {
        setIsLoading(true);

        // 실제 API 호출을 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 2000));

        const mockData: AnalyticsData = {
            messageCount: chatHistory.length,
            participantCount: Math.floor(Math.random() * 20) + 10,
            averageResponseTime: Math.floor(Math.random() * 30) + 5,
            sentimentDistribution: {
                positive: Math.floor(Math.random() * 40) + 30,
                negative: Math.floor(Math.random() * 20) + 10,
                neutral: Math.floor(Math.random() * 30) + 20
            },
            topTopics: [
                { topic: '프로젝트 진행', frequency: 45, trend: 'up' },
                { topic: '일정 조율', frequency: 32, trend: 'stable' },
                { topic: '기술 검토', frequency: 28, trend: 'up' },
                { topic: '예산 논의', frequency: 22, trend: 'down' },
                { topic: '팀 협업', frequency: 18, trend: 'up' }
            ],
            participantActivity: [
                { name: '김팀장', messageCount: 156, avgSentiment: 0.7, responseRate: 0.85 },
                { name: '이과장', messageCount: 134, avgSentiment: 0.6, responseRate: 0.78 },
                { name: '박대리', messageCount: 98, avgSentiment: 0.8, responseRate: 0.92 },
                { name: '최사원', messageCount: 87, avgSentiment: 0.5, responseRate: 0.65 },
                { name: '정인턴', messageCount: 45, avgSentiment: 0.9, responseRate: 0.95 }
            ],
            conversationFlow: Array.from({ length: 24 }, (_, i) => ({
                time: `${i.toString().padStart(2, '0')}:00`,
                messageCount: Math.floor(Math.random() * 20) + 5,
                avgSentiment: Math.random() * 0.8 + 0.2
            })),
            aiInsights: [
                '오후 2-4시에 대화 활성도가 가장 높습니다',
                '김팀장과 박대리의 참여도가 높아 팀 리더십이 잘 작동하고 있습니다',
                '기술 검토 관련 대화가 증가 추세를 보이고 있습니다',
                '평균 응답 시간이 8분으로 효율적인 소통이 이루어지고 있습니다',
                '긍정적 감정이 65%로 건강한 팀 분위기를 유지하고 있습니다'
            ]
        };

        setAnalyticsData(mockData);
        setIsLoading(false);
    };

    useEffect(() => {
        if (chatHistory.length > 0) {
            generateAnalyticsData();
        }
    }, [chatHistory, selectedTimeRange]);

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
            case 'down': return <ArrowTrendingUpIcon className="w-4 h-4 text-red-500 transform rotate-180" />;
            default: return <ChartBarIcon className="w-4 h-4 text-gray-500" />;
        }
    };

    const getSentimentColor = (sentiment: number) => {
        if (sentiment >= 0.7) return 'text-green-600';
        if (sentiment >= 0.5) return 'text-yellow-600';
        return 'text-red-600';
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-indigo-800 font-medium">고급 분석 데이터 생성 중...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!analyticsData) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="text-center py-8 text-gray-500">
                    <ChartBarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">채팅 데이터가 없습니다</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                        <ChartBarIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">고급 분석 대시보드</h2>
                        <p className="text-sm text-gray-600">AI 기반 대화 분석 및 인사이트</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setRealTimeUpdates(!realTimeUpdates)}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${realTimeUpdates
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                            }`}
                    >
                        {realTimeUpdates ? '실시간 ON' : '실시간 OFF'}
                    </button>
                </div>
            </div>

            {/* 메트릭 카드 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-blue-600 font-medium">총 메시지</p>
                            <p className="text-2xl font-bold text-blue-800">{analyticsData.messageCount.toLocaleString()}</p>
                        </div>
                        <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-green-600 font-medium">참여자</p>
                            <p className="text-2xl font-bold text-green-800">{analyticsData.participantCount}명</p>
                        </div>
                        <UserGroupIcon className="w-8 h-8 text-green-500" />
                    </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-yellow-600 font-medium">평균 응답</p>
                            <p className="text-2xl font-bold text-yellow-800">{analyticsData.averageResponseTime}분</p>
                        </div>
                        <ClockIcon className="w-8 h-8 text-yellow-500" />
                    </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-purple-600 font-medium">긍정도</p>
                            <p className="text-2xl font-bold text-purple-800">{analyticsData.sentimentDistribution.positive}%</p>
                        </div>
                        <ArrowTrendingUpIcon className="w-8 h-8 text-purple-500" />
                    </div>
                </div>
            </div>

            {/* 감정 분포 */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <CpuChipIcon className="w-4 h-4 mr-2" />
                    감정 분포
                </h3>
                <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-green-700">긍정적</span>
                            <span className="text-sm font-bold text-green-800">{analyticsData.sentimentDistribution.positive}%</span>
                        </div>
                        <div className="w-full bg-green-200 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${analyticsData.sentimentDistribution.positive}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-700">중립적</span>
                            <span className="text-sm font-bold text-gray-800">{analyticsData.sentimentDistribution.neutral}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-gray-500 h-2 rounded-full"
                                style={{ width: `${analyticsData.sentimentDistribution.neutral}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-red-700">부정적</span>
                            <span className="text-sm font-bold text-red-800">{analyticsData.sentimentDistribution.negative}%</span>
                        </div>
                        <div className="w-full bg-red-200 rounded-full h-2">
                            <div
                                className="bg-red-500 h-2 rounded-full"
                                style={{ width: `${analyticsData.sentimentDistribution.negative}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 주요 토픽 */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    주요 토픽
                </h3>
                <div className="space-y-2">
                    {analyticsData.topTopics.map((topic, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-gray-800">{topic.topic}</span>
                                {getTrendIcon(topic.trend)}
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-600">{topic.frequency}회</span>
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-indigo-500 h-2 rounded-full"
                                        style={{ width: `${(topic.frequency / 50) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 참여자 활동 */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <UserGroupIcon className="w-4 h-4 mr-2" />
                    참여자 활동
                </h3>
                <div className="space-y-2">
                    {analyticsData.participantActivity.map((participant, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {participant.name.charAt(0)}
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-800">{participant.name}</span>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs text-gray-600">{participant.messageCount}개 메시지</span>
                                        <span className={`text-xs font-medium ${getSentimentColor(participant.avgSentiment)}`}>
                                            {Math.round(participant.avgSentiment * 100)}% 긍정
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-gray-600">응답률</span>
                                <div className="text-sm font-bold text-indigo-600">
                                    {Math.round(participant.responseRate * 100)}%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI 인사이트 */}
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                <h3 className="text-sm font-semibold text-indigo-800 mb-3 flex items-center">
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    AI 인사이트
                </h3>
                <div className="space-y-2">
                    {analyticsData.aiInsights.map((insight, index) => (
                        <div key={index} className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 flex-shrink-0"></div>
                            <span className="text-xs text-indigo-700">{insight}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdvancedAnalyticsDashboard; 