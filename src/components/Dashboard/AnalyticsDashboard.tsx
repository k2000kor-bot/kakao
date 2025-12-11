import React, { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import { errorLogger } from '../../utils/errorLogger';

// Helper function to safely convert unknown error types to Error objects
const toError = (err: unknown): Error => {
    if (err instanceof Error) {
        return err as Error;
    }
    // Error 생성자를 명시적으로 사용
    const ErrorConstructor = globalThis.Error;
    return new ErrorConstructor(String(err)) as Error;
};

import {
    TrendingUp,
    MessageSquare,
    Users,
    Clock,
    Activity,
    Calendar,
    Target,
    Zap
} from 'lucide-react';

interface AnalyticsData {
    totalMessages: number;
    totalSessions: number;
    totalProjects: number;
    avgResponseTime: number;
    messagesByDay: Array<{
        date: string;
        messages: number;
        responses: number;
    }>;
    topProjects: Array<{
        id: string;
        name: string;
        messageCount: number;
        lastActivity: string;
    }>;
    userActivity: {
        activeUsers: number;
        totalSessions: number;
        avgSessionDuration: string;
        peakHours: string[];
    };
}

const AnalyticsDashboard: React.FC = () => {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [timeRange, setTimeRange] = useState('7d');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/analytics?timeRange=${timeRange}`);
            if (response.ok) {
                const data = await response.json();
                setAnalyticsData(data.data);
            }
        } catch (error) {
            const err = toError(error);
            errorLogger.error('Failed to fetch analytics', err, {
                component: 'AnalyticsDashboard',
                action: 'fetchAnalytics',
            });
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!analyticsData) {
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
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">분석 대시보드</h2>
                    <p className="text-gray-600">시스템 사용 현황 및 통계</p>
                </div>
                <div className="flex items-center space-x-2">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="1d">오늘</option>
                        <option value="7d">지난 7일</option>
                        <option value="30d">지난 30일</option>
                    </select>
                </div>
            </div>

            {/* 주요 지표 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">총 메시지</p>
                            <p className="text-2xl font-bold text-gray-900">{analyticsData.totalMessages}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <MessageSquare className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-600">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>+12%</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">총 세션</p>
                            <p className="text-2xl font-bold text-gray-900">{analyticsData.totalSessions}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Activity className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-600">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>+8%</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">총 프로젝트</p>
                            <p className="text-2xl font-bold text-gray-900">{analyticsData.totalProjects}</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Target className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-600">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>+15%</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">평균 응답시간</p>
                            <p className="text-2xl font-bold text-gray-900">{analyticsData.avgResponseTime}s</p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <Zap className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-red-600">
                        <TrendingUp className="h-4 w-4 mr-1 rotate-180" />
                        <span>-5%</span>
                    </div>
                </div>
            </div>

            {/* 차트 영역 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 메시지 트렌드 차트 */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">메시지 트렌드</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={analyticsData.messagesByDay}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(value) => new Date(value).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                            />
                            <YAxis />
                            <Tooltip
                                labelFormatter={(value) => new Date(value).toLocaleDateString('ko-KR')}
                                formatter={(value, name) => [value, name === 'messages' ? '메시지' : '응답']}
                            />
                            <Area
                                type="monotone"
                                dataKey="messages"
                                stackId="1"
                                stroke="#8884d8"
                                fill="#8884d8"
                                fillOpacity={0.6}
                            />
                            <Area
                                type="monotone"
                                dataKey="responses"
                                stackId="1"
                                stroke="#82ca9d"
                                fill="#82ca9d"
                                fillOpacity={0.6}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* 인기 프로젝트 차트 */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">인기 프로젝트</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analyticsData.topProjects}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => [value, '메시지 수']} />
                            <Bar dataKey="messageCount" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 사용자 활동 정보 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">사용자 활동</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{analyticsData.userActivity.activeUsers}</div>
                        <div className="text-sm text-gray-600">활성 사용자</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{analyticsData.userActivity.totalSessions}</div>
                        <div className="text-sm text-gray-600">총 세션</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{analyticsData.userActivity.avgSessionDuration}</div>
                        <div className="text-sm text-gray-600">평균 세션 시간</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{analyticsData.userActivity.peakHours.length}</div>
                        <div className="text-sm text-gray-600">피크 시간대</div>
                    </div>
                </div>

                {analyticsData.userActivity.peakHours.length > 0 && (
                    <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">피크 시간대:</p>
                        <div className="flex flex-wrap gap-2">
                            {analyticsData.userActivity.peakHours.map((hour, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                >
                                    {hour}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
