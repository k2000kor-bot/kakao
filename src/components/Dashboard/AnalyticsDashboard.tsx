import React, { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import {
    TrendingUp,
    MessageSquare,
    Activity,
    Target,
    Zap
} from 'lucide-react';
import { API_BASE_URL, INTEGRATED_API_ANALYTICS_PATH, joinApiHealthCheckUrl } from '../../config/api';
import { errorLogger, toError } from '../../utils/errorLogger';

function numField(x: unknown): number {
    return typeof x === 'number' && !Number.isNaN(x) ? x : 0;
}

/** `GET /api/integrated/analytics` 응답 `data` → Recharts 대시보드용 형태 */
function mapIntegratedAnalyticsPayload(raw: Record<string, unknown>): AnalyticsData {
    if (typeof raw.totalMessages === 'number') {
        return raw as unknown as AnalyticsData;
    }
    const totalReq = numField(raw.total_requests);
    const successful = numField(raw.successful_requests);
    const failed = numField(raw.failed_requests);
    return {
        totalMessages: totalReq,
        totalSessions: successful > 0 ? successful : Math.max(0, totalReq - failed),
        totalProjects: 1,
        avgResponseTime: numField(raw.average_response_time),
        messagesByDay: [],
        topProjects: [],
        userActivity: {
            activeUsers: 1,
            totalSessions: totalReq,
            avgSessionDuration: '—',
            peakHours: [],
        },
    };
}

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                joinApiHealthCheckUrl(
                    API_BASE_URL,
                    `${INTEGRATED_API_ANALYTICS_PATH}?timeRange=${encodeURIComponent(timeRange)}`,
                ),
            );
            const payload = await response.json().catch(() => null);
            if (response.ok && payload && payload.success === true && payload.data && typeof payload.data === 'object') {
                setAnalyticsData(mapIntegratedAnalyticsPayload(payload.data as Record<string, unknown>));
            } else {
                setAnalyticsData(null);
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

    const _COLORS = ['var(--accent-info)', 'var(--accent-success)', 'var(--accent-warning)', 'var(--accent-orange)', 'var(--accent-secondary)'];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="bw-spinner" />
            </div>
        );
    }

    if (!analyticsData) {
        return (
            <div className="bw-empty py-8">
                분석 데이터를 불러올 수 없습니다.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="bw-heading-1 mb-1">분석 대시보드</h2>
                    <p className="bw-text-secondary">시스템 사용 현황 및 통계</p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="bw-input"
                    >
                        <option value="1d">오늘</option>
                        <option value="7d">지난 7일</option>
                        <option value="30d">지난 30일</option>
                    </select>
                </div>
            </div>

            {/* 주요 지표 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bw-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium bw-text-secondary">총 메시지</p>
                            <p className="text-2xl font-bold bw-text-primary">{analyticsData.totalMessages}</p>
                        </div>
                        <div className="p-3 rounded-lg shrink-0" style={{ background: 'var(--accent-info-muted)' }}>
                            <MessageSquare className="h-6 w-6 bw-text-info" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm bw-text-success">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>+12%</span>
                    </div>
                </div>

                <div className="bw-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium bw-text-secondary">총 세션</p>
                            <p className="text-2xl font-bold bw-text-primary">{analyticsData.totalSessions}</p>
                        </div>
                        <div className="p-3 rounded-lg shrink-0" style={{ background: 'var(--accent-success-muted)' }}>
                            <Activity className="h-6 w-6 bw-text-success" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm bw-text-success">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>+8%</span>
                    </div>
                </div>

                <div className="bw-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium bw-text-secondary">총 프로젝트</p>
                            <p className="text-2xl font-bold bw-text-primary">{analyticsData.totalProjects}</p>
                        </div>
                        <div className="p-3 rounded-lg shrink-0" style={{ background: 'var(--accent-secondary-muted)' }}>
                            <Target className="h-6 w-6" style={{ color: 'var(--accent-secondary)' }} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm bw-text-success">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>+15%</span>
                    </div>
                </div>

                <div className="bw-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium bw-text-secondary">평균 응답시간</p>
                            <p className="text-2xl font-bold bw-text-primary">{analyticsData.avgResponseTime}s</p>
                        </div>
                        <div className="p-3 rounded-lg shrink-0" style={{ background: 'var(--accent-warning-muted)' }}>
                            <Zap className="h-6 w-6 bw-text-warning" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm bw-text-error">
                        <TrendingUp className="h-4 w-4 mr-1 rotate-180" />
                        <span>-5%</span>
                    </div>
                </div>
            </div>

            {/* 차트 영역 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 메시지 트렌드 차트 */}
                <div className="bw-card p-6">
                    <h3 className="bw-heading-2 mb-4">메시지 트렌드</h3>
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
                                stroke="var(--accent-info)"
                                fill="var(--accent-info)"
                                fillOpacity={0.6}
                            />
                            <Area
                                type="monotone"
                                dataKey="responses"
                                stackId="1"
                                stroke="var(--accent-success)"
                                fill="var(--accent-success)"
                                fillOpacity={0.6}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* 인기 프로젝트 차트 */}
                <div className="bw-card p-6">
                    <h3 className="bw-heading-2 mb-4">인기 프로젝트</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analyticsData.topProjects}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => [value, '메시지 수']} />
                            <Bar dataKey="messageCount" fill="var(--accent-info)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 사용자 활동 정보 */}
            <div className="bw-card p-6">
                <h3 className="bw-heading-2 mb-4">사용자 활동</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold bw-text-info">{analyticsData.userActivity.activeUsers}</div>
                        <div className="text-sm bw-text-secondary">활성 사용자</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold bw-text-success">{analyticsData.userActivity.totalSessions}</div>
                        <div className="text-sm bw-text-secondary">총 세션</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold" style={{ color: 'var(--accent-secondary)' }}>{analyticsData.userActivity.avgSessionDuration}</div>
                        <div className="text-sm bw-text-secondary">평균 세션 시간</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold bw-text-warning">{analyticsData.userActivity.peakHours.length}</div>
                        <div className="text-sm bw-text-secondary">피크 시간대</div>
                    </div>
                </div>

                {analyticsData.userActivity.peakHours.length > 0 && (
                    <div className="mt-4">
                        <p className="text-sm bw-text-secondary mb-2">피크 시간대:</p>
                        <div className="flex flex-wrap gap-2">
                            {analyticsData.userActivity.peakHours.map((hour, index) => (
                                <span
                                    key={index}
                                    className="bw-badge px-3 py-1 rounded-full text-sm"
                                    style={{ background: 'var(--accent-info-muted)', color: 'var(--accent-info)' }}
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
