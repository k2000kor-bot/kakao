import React, { useState, useEffect } from 'react';
import {
  StarIcon,
    ChartBarIcon,
    UserGroupIcon,
    ClockIcon,
    MagnifyingGlassIcon,
    LightBulbIcon,
    CogIcon
} from '@heroicons/react/24/outline';

interface AnalysisData {
    totalMessages: number;
    activeUsers: number;
    averageResponseTime: number;
    sentimentDistribution: {
        positive: number;
        negative: number;
        neutral: number;
    };
    topTopics: Array<{
        topic: string;
        count: number;
        sentiment: string;
    }>;
    userEngagement: Array<{
        user: string;
        messages: number;
        avgSentiment: number;
        lastActivity: string;
    }>;
}

const AdvancedAIAnalysis: React.FC = () => {
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
    const [selectedMetric, setSelectedMetric] = useState('overview');

    // 샘플 데이터 로드
    useEffect(() => {
        const loadAnalysisData = () => {
            setTimeout(() => {
                setAnalysisData({
                    totalMessages: 1247,
                    activeUsers: 23,
                    averageResponseTime: 2.3,
                    sentimentDistribution: {
                        positive: 45,
                        negative: 12,
                        neutral: 43
                    },
                    topTopics: [
                        { topic: '프로젝트 진행상황', count: 156, sentiment: 'positive' },
                        { topic: '기술적 이슈', count: 89, sentiment: 'neutral' },
                        { topic: '일정 조율', count: 67, sentiment: 'positive' },
                        { topic: '리소스 할당', count: 45, sentiment: 'negative' },
                        { topic: '품질 관리', count: 34, sentiment: 'positive' }
                    ],
                    userEngagement: [
                        { user: '김개발', messages: 234, avgSentiment: 0.7, lastActivity: '2분 전' },
                        { user: '이디자인', messages: 189, avgSentiment: 0.3, lastActivity: '5분 전' },
                        { user: '박기획', messages: 156, avgSentiment: 0.5, lastActivity: '10분 전' },
                        { user: '최테스트', messages: 98, avgSentiment: -0.2, lastActivity: '15분 전' },
                        { user: '정운영', messages: 76, avgSentiment: 0.8, lastActivity: '20분 전' }
                    ]
                });
                setIsLoading(false);
            }, 1500);
        };

        loadAnalysisData();
    }, [selectedTimeRange]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!analysisData) {
        return (
            <div className="text-center text-gray-500 py-8">
                분석 데이터를 불러올 수 없습니다.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <LightBulbIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">고급 AI 분석</h1>
                        <p className="text-gray-600">실시간 대화 패턴 및 감정 분석</p>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <select
                        value={selectedTimeRange}
                        onChange={(e) => setSelectedTimeRange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                        <option value="1h">최근 1시간</option>
                        <option value="24h">최근 24시간</option>
                        <option value="7d">최근 7일</option>
                        <option value="30d">최근 30일</option>
                    </select>

                    <select
                        value={selectedMetric}
                        onChange={(e) => setSelectedMetric(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                        <option value="overview">전체 개요</option>
                        <option value="sentiment">감정 분석</option>
                        <option value="topics">주제 분석</option>
                        <option value="users">사용자 참여도</option>
                    </select>
                </div>
            </div>

            {/* 주요 지표 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">총 메시지</p>
                            <p className="text-2xl font-bold text-gray-900">{analysisData.totalMessages.toLocaleString()}</p>
                        </div>
                        <ChartBarIcon className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">활성 사용자</p>
                            <p className="text-2xl font-bold text-gray-900">{analysisData.activeUsers}</p>
                        </div>
                        <UserGroupIcon className="w-8 h-8 text-green-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">평균 응답시간</p>
                            <p className="text-2xl font-bold text-gray-900">{analysisData.averageResponseTime}분</p>
                        </div>
                        <ClockIcon className="w-8 h-8 text-orange-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">긍정 비율</p>
                            <p className="text-2xl font-bold text-gray-900">{analysisData.sentimentDistribution.positive}%</p>
                        </div>
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-sm">👍</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 감정 분포 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">감정 분포</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-green-600 text-xl">😊</span>
                        </div>
                        <p className="text-sm text-gray-600">긍정</p>
                        <p className="text-2xl font-bold text-green-600">{analysisData.sentimentDistribution.positive}%</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-gray-600 text-xl">😐</span>
                        </div>
                        <p className="text-sm text-gray-600">중립</p>
                        <p className="text-2xl font-bold text-gray-600">{analysisData.sentimentDistribution.neutral}%</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-red-600 text-xl">😞</span>
                        </div>
                        <p className="text-sm text-gray-600">부정</p>
                        <p className="text-2xl font-bold text-red-600">{analysisData.sentimentDistribution.negative}%</p>
                    </div>
                </div>
            </div>

            {/* 상위 주제 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">상위 주제</h3>
                <div className="space-y-3">
                    {analysisData.topTopics.map((topic, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                                <span className="font-medium text-gray-900">{topic.topic}</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${topic.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                                        topic.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                                            'bg-gray-100 text-gray-700'
                                    }`}>
                                    {topic.sentiment === 'positive' ? '긍정' :
                                        topic.sentiment === 'negative' ? '부정' : '중립'}
                                </span>
                            </div>
                            <span className="text-sm font-medium text-gray-600">{topic.count}회</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 사용자 참여도 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">사용자 참여도</h3>
                <div className="space-y-3">
                    {analysisData.userEngagement.map((user, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 text-sm font-medium">{user.user.charAt(0)}</span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{user.user}</p>
                                    <p className="text-xs text-gray-500">마지막 활동: {user.lastActivity}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">{user.messages}개 메시지</p>
                                    <p className={`text-xs ${user.avgSentiment > 0.5 ? 'text-green-600' :
                                            user.avgSentiment < -0.5 ? 'text-red-600' : 'text-gray-600'
                                        }`}>
                                        평균 감정: {user.avgSentiment > 0 ? '+' : ''}{user.avgSentiment.toFixed(1)}
                                    </p>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${user.avgSentiment > 0.5 ? 'bg-green-500' :
                                        user.avgSentiment < -0.5 ? 'bg-red-500' : 'bg-gray-500'
                                    }`}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdvancedAIAnalysis; 