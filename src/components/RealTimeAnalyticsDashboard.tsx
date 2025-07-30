import React, { useState, useEffect } from 'react';
import {
    ChartBarIcon,
    ArrowTrendingUpIcon,
    UserGroupIcon,
    ClockIcon,
    HeartIcon,
    ChatBubbleLeftIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
    sentiment: {
        positive: number;
        neutral: number;
        negative: number;
    };
    patterns: {
        questionRate: number;
        responseTime: number;
        engagement: number;
        effectiveness: number;
    };
    realTimeMetrics: {
        activeUsers: number;
        messagesPerMinute: number;
        averageLength: number;
        qualityScore: number;
    };
    emotionAnalysis: {
        joy: number;
        anger: number;
        surprise: number;
        sadness: number;
        fear: number;
        trust: number;
    };
}

const RealTimeAnalyticsDashboard: React.FC = () => {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
        sentiment: { positive: 65, neutral: 25, negative: 10 },
        patterns: { questionRate: 42, responseTime: 1.8, engagement: 87, effectiveness: 92 },
        realTimeMetrics: { activeUsers: 1247, messagesPerMinute: 34, averageLength: 156, qualityScore: 89 },
        emotionAnalysis: { joy: 45, anger: 8, surprise: 15, sadness: 12, fear: 5, trust: 65 }
    });

    const [isLive, setIsLive] = useState(true);
    const [timeRange, setTimeRange] = useState('1h');

    // 실시간 데이터 업데이트 시뮬레이션
    useEffect(() => {
        if (!isLive) return;

        const interval = setInterval(() => {
            setAnalyticsData(prev => ({
                sentiment: {
                    positive: Math.max(0, Math.min(100, prev.sentiment.positive + (Math.random() - 0.5) * 10)),
                    neutral: Math.max(0, Math.min(100, prev.sentiment.neutral + (Math.random() - 0.5) * 8)),
                    negative: Math.max(0, Math.min(100, prev.sentiment.negative + (Math.random() - 0.5) * 6))
                },
                patterns: {
                    questionRate: Math.max(0, Math.min(100, prev.patterns.questionRate + (Math.random() - 0.5) * 8)),
                    responseTime: Math.max(0.1, prev.patterns.responseTime + (Math.random() - 0.5) * 0.3),
                    engagement: Math.max(0, Math.min(100, prev.patterns.engagement + (Math.random() - 0.5) * 6)),
                    effectiveness: Math.max(0, Math.min(100, prev.patterns.effectiveness + (Math.random() - 0.5) * 4))
                },
                realTimeMetrics: {
                    activeUsers: Math.max(0, prev.realTimeMetrics.activeUsers + Math.floor((Math.random() - 0.5) * 50)),
                    messagesPerMinute: Math.max(0, prev.realTimeMetrics.messagesPerMinute + Math.floor((Math.random() - 0.5) * 8)),
                    averageLength: Math.max(0, prev.realTimeMetrics.averageLength + Math.floor((Math.random() - 0.5) * 20)),
                    qualityScore: Math.max(0, Math.min(100, prev.realTimeMetrics.qualityScore + (Math.random() - 0.5) * 3))
                },
                emotionAnalysis: {
                    joy: Math.max(0, Math.min(100, prev.emotionAnalysis.joy + (Math.random() - 0.5) * 8)),
                    anger: Math.max(0, Math.min(100, prev.emotionAnalysis.anger + (Math.random() - 0.5) * 4)),
                    surprise: Math.max(0, Math.min(100, prev.emotionAnalysis.surprise + (Math.random() - 0.5) * 6)),
                    sadness: Math.max(0, Math.min(100, prev.emotionAnalysis.sadness + (Math.random() - 0.5) * 4)),
                    fear: Math.max(0, Math.min(100, prev.emotionAnalysis.fear + (Math.random() - 0.5) * 3)),
                    trust: Math.max(0, Math.min(100, prev.emotionAnalysis.trust + (Math.random() - 0.5) * 6))
                }
            }));
        }, 2000);

        return () => clearInterval(interval);
    }, [isLive]);

    const getStatusColor = (value: number) => {
        if (value >= 80) return 'text-green-600 bg-green-100';
        if (value >= 60) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getEmotionColor = (emotion: string) => {
        const colors: Record<string, string> = {
            joy: 'text-green-500',
            sadness: 'text-blue-500',
            anger: 'text-red-500',
            fear: 'text-purple-500',
            surprise: 'text-yellow-500',
            disgust: 'text-gray-500',
            neutral: 'text-gray-400'
        };
        return colors[emotion] || 'text-gray-400';
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* 헤더 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">실시간 대화 분석 대시보드</h1>
                        <p className="text-gray-600 mt-1">AI 대화 시스템의 실시간 성능 및 감정 분석</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="5m">최근 5분</option>
                            <option value="1h">최근 1시간</option>
                            <option value="24h">최근 24시간</option>
                            <option value="7d">최근 7일</option>
                        </select>
                        <button
                            onClick={() => setIsLive(!isLive)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${isLive
                                ? 'bg-green-100 text-green-700 border border-green-300'
                                : 'bg-gray-100 text-gray-700 border border-gray-300'
                                }`}
                        >
                            <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                <span>{isLive ? '실시간' : '일시정지'}</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* 실시간 메트릭스 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">활성 사용자</p>
                            <p className="text-3xl font-bold text-gray-900">{analyticsData.realTimeMetrics.activeUsers.toLocaleString()}</p>
                        </div>
                        <UserGroupIcon className="h-12 w-12 text-blue-500" />
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600">+12.5%</span>
                        <span className="text-gray-500 ml-2">vs 이전 시간</span>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">분당 메시지</p>
                            <p className="text-3xl font-bold text-gray-900">{analyticsData.realTimeMetrics.messagesPerMinute}</p>
                        </div>
                        <ChatBubbleLeftIcon className="h-12 w-12 text-green-500" />
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600">+8.2%</span>
                        <span className="text-gray-500 ml-2">vs 이전 시간</span>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">평균 응답 시간</p>
                            <p className="text-3xl font-bold text-gray-900">{analyticsData.patterns.responseTime.toFixed(1)}초</p>
                        </div>
                        <ClockIcon className="h-12 w-12 text-orange-500" />
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <ArrowTrendingUpIcon className="h-4 w-4 text-red-500 mr-1 transform rotate-180" />
                        <span className="text-red-600">-5.8%</span>
                        <span className="text-gray-500 ml-2">vs 이전 시간</span>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">품질 점수</p>
                            <p className="text-3xl font-bold text-gray-900">{analyticsData.realTimeMetrics.qualityScore}%</p>
                        </div>
                        <ExclamationTriangleIcon className="h-12 w-12 text-purple-500" />
                    </div>
                    <div className="mt-4">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(analyticsData.realTimeMetrics.qualityScore)}`}>
                            {analyticsData.realTimeMetrics.qualityScore >= 80 ? '우수' : analyticsData.realTimeMetrics.qualityScore >= 60 ? '보통' : '개선 필요'}
                        </div>
                    </div>
                </div>
            </div>

            {/* 감정 분석 및 패턴 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 감정 분석 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <HeartIcon className="h-6 w-6 text-pink-500" />
                            <h3 className="text-lg font-semibold text-gray-900">감정 분석</h3>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {Object.entries(analyticsData.emotionAnalysis).map(([emotion, value]) => (
                            <div key={emotion} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-3 h-3 rounded-full ${getEmotionColor(emotion)}`}></div>
                                    <span className="text-sm font-medium text-gray-700 capitalize">
                                        {emotion === 'joy' ? '기쁨' :
                                            emotion === 'anger' ? '분노' :
                                                emotion === 'surprise' ? '놀람' :
                                                    emotion === 'sadness' ? '슬픔' :
                                                        emotion === 'fear' ? '두려움' : '신뢰'}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-500 ${getEmotionColor(emotion)}`}
                                            style={{ width: `${value}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700 w-8">{Math.round(value)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 대화 패턴 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <ChartBarIcon className="h-6 w-6 text-blue-500" />
                            <h3 className="text-lg font-semibold text-gray-900">대화 패턴</h3>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">질문 비율</span>
                                <span className="text-sm font-semibold text-gray-900">{Math.round(analyticsData.patterns.questionRate)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${analyticsData.patterns.questionRate}%` }}
                                ></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">참여도</span>
                                <span className="text-sm font-semibold text-gray-900">{Math.round(analyticsData.patterns.engagement)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${analyticsData.patterns.engagement}%` }}
                                ></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">효과성</span>
                                <span className="text-sm font-semibold text-gray-900">{Math.round(analyticsData.patterns.effectiveness)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${analyticsData.patterns.effectiveness}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 감정 동향 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <ExclamationTriangleIcon className="h-6 w-6 text-orange-500" />
                        <h3 className="text-lg font-semibold text-gray-900">감정 동향</h3>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-2xl font-bold text-green-600">{Math.round(analyticsData.sentiment.positive)}%</div>
                        <div className="text-sm text-green-700 font-medium">긍정적</div>
                        <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${analyticsData.sentiment.positive}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-gray-600">{Math.round(analyticsData.sentiment.neutral)}%</div>
                        <div className="text-sm text-gray-700 font-medium">중립적</div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-gray-400 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${analyticsData.sentiment.neutral}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="text-2xl font-bold text-red-600">{Math.round(analyticsData.sentiment.negative)}%</div>
                        <div className="text-sm text-red-700 font-medium">부정적</div>
                        <div className="mt-2 w-full bg-red-200 rounded-full h-2">
                            <div
                                className="bg-red-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${analyticsData.sentiment.negative}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RealTimeAnalyticsDashboard; 