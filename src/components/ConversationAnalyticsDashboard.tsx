import React, { useState, useEffect } from 'react';
import {
    ChartBarIcon,
    UserGroupIcon,
    HeartIcon,
    ChatBubbleLeftRightIcon,
    ClockIcon,
    ArrowTrendingUpIcon,
    EyeIcon,
    SparklesIcon,
    DocumentTextIcon,
    CalendarIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { AdvancedMessageAPI } from '../services/advancedMessageAPI';

interface AnalyticsData {
    total_messages: number;
    participants: string[];
    emotion_distribution: {
        counts: { [key: string]: number };
        percentages: { [key: string]: number };
        dominant_emotion: string;
    };
    keyword_frequency: {
        frequencies: { [key: string]: number };
        top_keywords: string[];
        total_keywords: number;
    };
    conversation_patterns: {
        average_message_length: number;
        interaction_distribution: { [key: string]: number };
        message_length_distribution: {
            short: number;
            medium: number;
            long: number;
        };
    };
    engagement_metrics: {
        total_participants: number;
        messages_per_participant: { [key: string]: number };
        response_rate: number;
        conversation_depth: number;
        most_active_participant: string;
    };
    time_analysis: {
        hourly_distribution: { [key: string]: number };
        daily_distribution: { [key: string]: number };
        response_times: any[];
    };
}

interface ConversationAnalyticsDashboardProps {
    chatRoomId?: string;
    messages?: Array<{ content: string; sender: string; timestamp?: string }>;
    onClose?: () => void;
}

const ConversationAnalyticsDashboard: React.FC<ConversationAnalyticsDashboardProps> = ({
    chatRoomId,
    messages,
    onClose
}) => {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [insights, setInsights] = useState<string[]>([]);
    const [visualization, setVisualization] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'emotions' | 'keywords' | 'engagement' | 'patterns'>('overview');

    const api = new AdvancedMessageAPI();

    useEffect(() => {
        if (chatRoomId) {
            loadChatRoomAnalytics();
        } else if (messages) {
            loadMessagesAnalytics();
        }
    }, [chatRoomId, messages]);

    const loadChatRoomAnalytics = async () => {
        if (!chatRoomId) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await api.getConversationStatistics(chatRoomId);
            if (response.success && response.analysis) {
                setAnalyticsData(response.analysis);
                setInsights(response.insights || []);
                setVisualization(response.visualization);
            } else {
                setError(response.error || '분석 데이터를 불러올 수 없습니다.');
            }
        } catch (err) {
            setError('분석 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const loadMessagesAnalytics = async () => {
        if (!messages) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await api.analyzeConversationData(messages);
            if (response.success && response.analysis) {
                setAnalyticsData(response.analysis);
                setInsights(response.insights || []);
                setVisualization(response.visualization);
            } else {
                setError(response.error || '분석 데이터를 불러올 수 없습니다.');
            }
        } catch (err) {
            setError('분석 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const getEmotionColor = (emotion: string) => {
        const colors = {
            '기쁨': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            '슬픔': 'bg-blue-100 text-blue-800 border-blue-200',
            '화남': 'bg-red-100 text-red-800 border-red-200',
            '걱정': 'bg-orange-100 text-orange-800 border-orange-200',
            '중립': 'bg-gray-100 text-gray-800 border-gray-200'
        };
        return colors[emotion as keyof typeof colors] || colors['중립'];
    };

    const getEmotionIcon = (emotion: string) => {
        const icons = {
            '기쁨': '😊',
            '슬픔': '😢',
            '화남': '😠',
            '걱정': '😰',
            '중립': '😐'
        };
        return icons[emotion as keyof typeof icons] || '😐';
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-700">대화 분석 중...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <div className="flex items-center mb-4">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">오류 발생</h3>
                    </div>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => setError(null)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                            다시 시도
                        </button>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                                닫기
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center">
                        <ChartBarIcon className="h-6 w-6 text-blue-600 mr-2" />
                        <h2 className="text-xl font-semibold text-gray-900">대화 분석 대시보드</h2>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    )}
                </div>

                {/* 탭 네비게이션 */}
                <div className="flex border-b border-gray-200">
                    {[
                        { id: 'overview', name: '개요', icon: EyeIcon },
                        { id: 'emotions', name: '감정 분석', icon: HeartIcon },
                        { id: 'keywords', name: '키워드', icon: DocumentTextIcon },
                        { id: 'engagement', name: '참여도', icon: UserGroupIcon },
                        { id: 'patterns', name: '패턴', icon: ArrowTrendingUpIcon }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Icon className="h-4 w-4 mr-2" />
                                {tab.name}
                            </button>
                        );
                    })}
                </div>

                {/* 컨텐츠 */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {activeTab === 'overview' && analyticsData && (
                        <div className="space-y-6">
                            {/* 주요 지표 */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="flex items-center">
                                        <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600" />
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-blue-600">총 메시지</p>
                                            <p className="text-2xl font-bold text-blue-900">{analyticsData.total_messages}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="flex items-center">
                                        <UserGroupIcon className="h-8 w-8 text-green-600" />
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-green-600">참여자</p>
                                            <p className="text-2xl font-bold text-green-900">{analyticsData.engagement_metrics.total_participants}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <div className="flex items-center">
                                        <HeartIcon className="h-8 w-8 text-purple-600" />
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-purple-600">주요 감정</p>
                                            <p className="text-2xl font-bold text-purple-900">{analyticsData.emotion_distribution.dominant_emotion}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-lg">
                                    <div className="flex items-center">
                                        <ClockIcon className="h-8 w-8 text-orange-600" />
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-orange-600">평균 길이</p>
                                            <p className="text-2xl font-bold text-orange-900">{Math.round(analyticsData.conversation_patterns.average_message_length)}자</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 인사이트 */}
                            {insights.length > 0 && (
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <div className="flex items-center mb-3">
                                        <SparklesIcon className="h-5 w-5 text-yellow-600 mr-2" />
                                        <h3 className="text-lg font-semibold text-yellow-800">분석 인사이트</h3>
                                    </div>
                                    <ul className="space-y-2">
                                        {insights.map((insight, index) => (
                                            <li key={index} className="flex items-start">
                                                <CheckCircleIcon className="h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                                                <span className="text-yellow-700">{insight}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* 감정 분포 차트 */}
                            {visualization?.emotion_chart && (
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">감정 분포</h3>
                                    <div className="space-y-3">
                                        {visualization.emotion_chart.labels.map((label: string, index: number) => (
                                            <div key={label} className="flex items-center">
                                                <span className="text-2xl mr-2">{getEmotionIcon(label)}</span>
                                                <span className="w-20 text-sm text-gray-600">{label}</span>
                                                <div className="flex-1 ml-3">
                                                    <div className="bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full ${getEmotionColor(label).split(' ')[0]}`}
                                                            style={{ width: `${visualization.emotion_chart.data[index]}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                <span className="ml-2 text-sm font-medium text-gray-900">
                                                    {visualization.emotion_chart.data[index].toFixed(1)}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'emotions' && analyticsData && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* 감정 분포 */}
                                <div className="bg-white p-6 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">감정 분포</h3>
                                    <div className="space-y-3">
                                        {Object.entries(analyticsData.emotion_distribution.counts).map(([emotion, count]) => (
                                            <div key={emotion} className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <span className="text-2xl mr-3">{getEmotionIcon(emotion)}</span>
                                                    <span className="font-medium text-gray-700">{emotion}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="text-sm text-gray-500 mr-2">{count}개</span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEmotionColor(emotion)}`}>
                                                        {analyticsData.emotion_distribution.percentages[emotion].toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 주요 감정 */}
                                <div className="bg-white p-6 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">주요 감정</h3>
                                    <div className="text-center">
                                        <div className="text-6xl mb-4">
                                            {getEmotionIcon(analyticsData.emotion_distribution.dominant_emotion)}
                                        </div>
                                        <h4 className="text-xl font-semibold text-gray-900 mb-2">
                                            {analyticsData.emotion_distribution.dominant_emotion}
                                        </h4>
                                        <p className="text-gray-600">
                                            가장 많이 나타난 감정입니다
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'keywords' && analyticsData && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* 키워드 빈도 */}
                                <div className="bg-white p-6 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">키워드 빈도</h3>
                                    <div className="space-y-3">
                                        {analyticsData.keyword_frequency.top_keywords.slice(0, 10).map((keyword, index) => (
                                            <div key={keyword} className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <span className="text-sm font-medium text-gray-500 mr-3">#{index + 1}</span>
                                                    <span className="font-medium text-gray-700">{keyword}</span>
                                                </div>
                                                <span className="text-sm font-medium text-blue-600">
                                                    {analyticsData.keyword_frequency.frequencies[keyword]}회
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 키워드 통계 */}
                                <div className="bg-white p-6 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">키워드 통계</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">총 키워드 수</span>
                                            <span className="font-semibold text-gray-900">{analyticsData.keyword_frequency.total_keywords}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">가장 많이 언급</span>
                                            <span className="font-semibold text-blue-600">
                                                {analyticsData.keyword_frequency.top_keywords[0] || '없음'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'engagement' && analyticsData && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* 참여자별 메시지 수 */}
                                <div className="bg-white p-6 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">참여자별 메시지</h3>
                                    <div className="space-y-3">
                                        {Object.entries(analyticsData.engagement_metrics.messages_per_participant)
                                            .sort(([, a], [, b]) => b - a)
                                            .map(([participant, count]) => (
                                                <div key={participant} className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                            <span className="text-sm font-medium text-blue-600">
                                                                {participant.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <span className="font-medium text-gray-700">{participant}</span>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">{count}개</span>
                                                </div>
                                            ))}
                                    </div>
                                </div>

                                {/* 참여도 지표 */}
                                <div className="bg-white p-6 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">참여도 지표</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">응답률</span>
                                            <span className="font-semibold text-green-600">
                                                {analyticsData.engagement_metrics.response_rate.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">대화 깊이</span>
                                            <span className="font-semibold text-blue-600">
                                                {analyticsData.engagement_metrics.conversation_depth}단계
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">가장 활발한 참여자</span>
                                            <span className="font-semibold text-purple-600">
                                                {analyticsData.engagement_metrics.most_active_participant || '없음'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'patterns' && analyticsData && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* 메시지 길이 분포 */}
                                <div className="bg-white p-6 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">메시지 길이 분포</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">짧은 메시지 (50자 미만)</span>
                                            <span className="font-semibold text-blue-600">
                                                {analyticsData.conversation_patterns.message_length_distribution.short}개
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">중간 메시지 (50-200자)</span>
                                            <span className="font-semibold text-green-600">
                                                {analyticsData.conversation_patterns.message_length_distribution.medium}개
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">긴 메시지 (200자 이상)</span>
                                            <span className="font-semibold text-orange-600">
                                                {analyticsData.conversation_patterns.message_length_distribution.long}개
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* 상호작용 유형 */}
                                <div className="bg-white p-6 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">상호작용 유형</h3>
                                    <div className="space-y-3">
                                        {Object.entries(analyticsData.conversation_patterns.interaction_distribution).map(([type, count]) => (
                                            <div key={type} className="flex items-center justify-between">
                                                <span className="font-medium text-gray-700">{type}</span>
                                                <span className="text-sm font-medium text-gray-900">{count}개</span>
                                            </div>
                                        ))}
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

export default ConversationAnalyticsDashboard; 