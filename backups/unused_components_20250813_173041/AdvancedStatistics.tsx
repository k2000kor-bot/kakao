import React, { useState, useEffect } from 'react';
import {
  StarIcon,
    ChartBarIcon,
    ClockIcon,
    UserGroupIcon,
    ChatBubbleLeftRightIcon,
    ArrowTrendingUpIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface StatisticsData {
    totalMessages: number;
    activeUsers: number;
    averageResponseTime: number;
    sentimentScore: number;
    topKeywords: string[];
    conversationTrends: {
        date: string;
        messages: number;
        sentiment: number;
    }[];
}

const AdvancedStatistics: React.FC = () => {
    const [stats, setStats] = useState<StatisticsData>({
        totalMessages: 0,
        activeUsers: 0,
        averageResponseTime: 0,
        sentimentScore: 0,
        topKeywords: [],
        conversationTrends: []
    });
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('7d');

    useEffect(() => {
        // 시뮬레이션된 데이터 로드
        const loadStatistics = async () => {
            setLoading(true);

            // 실제 환경에서는 API 호출
            await new Promise(resolve => setTimeout(resolve, 1000));

            setStats({
                totalMessages: 1247,
                activeUsers: 23,
                averageResponseTime: 2.3,
                sentimentScore: 0.78,
                topKeywords: ['개포우성7차', '재개발', '조합', '입찰', '설계', '비용', '일정'],
                conversationTrends: [
                    { date: '2024-01-01', messages: 45, sentiment: 0.7 },
                    { date: '2024-01-02', messages: 52, sentiment: 0.8 },
                    { date: '2024-01-03', messages: 38, sentiment: 0.6 },
                    { date: '2024-01-04', messages: 67, sentiment: 0.9 },
                    { date: '2024-01-05', messages: 89, sentiment: 0.85 },
                    { date: '2024-01-06', messages: 76, sentiment: 0.75 },
                    { date: '2024-01-07', messages: 94, sentiment: 0.8 }
                ]
            });

            setLoading(false);
        };

        loadStatistics();
    }, [selectedPeriod]);

    const getSentimentColor = (score: number) => {
        if (score >= 0.8) return 'text-green-600';
        if (score >= 0.6) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getSentimentIcon = (score: number) => {
        if (score >= 0.8) return '😊';
        if (score >= 0.6) return '😐';
        return '😞';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <ChartBarIcon className="w-8 h-8 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">고급 통계 분석</h2>
                </div>

                <div className="flex items-center space-x-4">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="1d">최근 1일</option>
                        <option value="7d">최근 7일</option>
                        <option value="30d">최근 30일</option>
                        <option value="90d">최근 90일</option>
                    </select>
                </div>
            </div>

            {/* 주요 지표 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">총 메시지</p>
                            <p className="text-3xl font-bold">{stats.totalMessages.toLocaleString()}</p>
                        </div>
                        <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">활성 사용자</p>
                            <p className="text-3xl font-bold">{stats.activeUsers}</p>
                        </div>
                        <UserGroupIcon className="w-8 h-8 text-green-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">평균 응답시간</p>
                            <p className="text-3xl font-bold">{stats.averageResponseTime}분</p>
                        </div>
                        <ClockIcon className="w-8 h-8 text-purple-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm font-medium">감정 점수</p>
                            <div className="flex items-center space-x-2">
                                <p className="text-3xl font-bold">{stats.sentimentScore}</p>
                                <span className="text-2xl">{getSentimentIcon(stats.sentimentScore)}</span>
                            </div>
                        </div>
                        <ArrowTrendingUpIcon className="w-8 h-8 text-orange-200" />
                    </div>
                </div>
            </div>

            {/* 상세 분석 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 키워드 분석 */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2" />
                        주요 키워드
                    </h3>
                    <div className="space-y-3">
                        {stats.topKeywords.map((keyword, index) => (
                            <div key={keyword} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                                    <span className="font-medium text-gray-900">{keyword}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${85 - (index * 10)}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm text-gray-500">{85 - (index * 10)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 트렌드 분석 */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">대화 트렌드</h3>
                    <div className="space-y-3">
                        {stats.conversationTrends.slice(-5).map((trend, index) => (
                            <div key={trend.date} className="flex items-center justify-between p-3 bg-white rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm text-gray-500">{trend.date}</span>
                                    <span className="font-medium">{trend.messages}개 메시지</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className={`text-sm font-medium ${getSentimentColor(trend.sentiment)}`}>
                                        {getSentimentIcon(trend.sentiment)}
                                    </span>
                                    <span className="text-sm text-gray-500">{trend.sentiment.toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 인사이트 */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">AI 인사이트</h3>
                <div className="space-y-2 text-blue-800">
                    <p>• <strong>긍정적 트렌드:</strong> 최근 7일간 감정 점수가 0.78로 높은 수준을 유지하고 있습니다.</p>
                    <p>• <strong>활성도 증가:</strong> 일일 평균 메시지 수가 67개로 증가 추세를 보입니다.</p>
                    <p>• <strong>주요 관심사:</strong> "개포우성7차"와 "재개발"이 가장 많이 언급되는 키워드입니다.</p>
                    <p>• <strong>응답 시간:</strong> 평균 2.3분의 응답 시간으로 효율적인 소통이 이루어지고 있습니다.</p>
                </div>
            </div>
        </div>
    );
};

export default AdvancedStatistics; 