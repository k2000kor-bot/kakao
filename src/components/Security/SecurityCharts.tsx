// 보안 데이터 시각화 컴포넌트
// recharts를 사용하여 보안 데이터를 차트로 표시

import React, { useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Paper,
} from '@mui/material';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import {
    SecurityThreat,
    SecurityAlert,
    SecurityEvent,
    SecurityStatus,
} from '../../services/advancedSecurityService';

interface SecurityChartsProps {
    threats: SecurityThreat[];
    alerts: SecurityAlert[];
    events: SecurityEvent[];
    status: SecurityStatus | null;
}

const COLORS = {
    critical: '#d32f2f',
    high: '#f57c00',
    medium: '#fbc02d',
    low: '#388e3c',
};

const SecurityCharts: React.FC<SecurityChartsProps> = ({
    threats,
    alerts,
    events,
    status,
}) => {
    // 위협 심각도별 분포 데이터
    const threatSeverityData = useMemo(() => {
        const severityCounts = threats.reduce(
            (acc, threat) => {
                acc[threat.severity] = (acc[threat.severity] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        return [
            { name: 'Critical', value: severityCounts.critical || 0, color: COLORS.critical },
            { name: 'High', value: severityCounts.high || 0, color: COLORS.high },
            { name: 'Medium', value: severityCounts.medium || 0, color: COLORS.medium },
            { name: 'Low', value: severityCounts.low || 0, color: COLORS.low },
        ].filter((item) => item.value > 0);
    }, [threats]);

    // 시간별 위협 발생 추이 (최근 7일)
    const threatTrendData = useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return date.toISOString().split('T')[0];
        });

        return last7Days.map((date) => {
            const dayThreats = threats.filter((t) => t.timestamp.startsWith(date));
            return {
                date: new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
                critical: dayThreats.filter((t) => t.severity === 'critical').length,
                high: dayThreats.filter((t) => t.severity === 'high').length,
                medium: dayThreats.filter((t) => t.severity === 'medium').length,
                low: dayThreats.filter((t) => t.severity === 'low').length,
            };
        });
    }, [threats]);

    // 알림 타입별 분포
    const alertTypeData = useMemo(() => {
        const typeCounts = alerts.reduce(
            (acc, alert) => {
                acc[alert.alert_type] = (acc[alert.alert_type] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        return Object.entries(typeCounts).map(([name, value]) => ({
            name: name.replace('_', ' ').toUpperCase(),
            value,
        }));
    }, [alerts]);

    // 이벤트 위험 수준별 분포
    const eventRiskData = useMemo(() => {
        const riskCounts = events.reduce(
            (acc, event) => {
                acc[event.risk_level] = (acc[event.risk_level] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        return [
            { name: 'High', value: riskCounts.high || 0, color: COLORS.high },
            { name: 'Medium', value: riskCounts.medium || 0, color: COLORS.medium },
            { name: 'Low', value: riskCounts.low || 0, color: COLORS.low },
        ];
    }, [events]);

    // 보안 점수 추이 (시뮬레이션 - 실제로는 시간별 데이터 필요)
    const securityScoreData = useMemo(() => {
        if (!status) return [];

        // 최근 7일간의 보안 점수 추이 시뮬레이션
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            // 실제 점수 기준으로 변동 시뮬레이션
            const baseScore = status.security_score;
            const variation = (Math.random() - 0.5) * 10;
            return {
                date: new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
                score: Math.max(0, Math.min(100, baseScore + variation)),
            };
        });
    }, [status]);

    return (
        <Grid container spacing={3}>
            {/* 위협 심각도 분포 */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            위협 심각도 분포
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={threatSeverityData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry: any) =>
                                        `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`
                                    }
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {threatSeverityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </Grid>

            {/* 알림 타입별 분포 */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            알림 타입별 분포
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={alertTypeData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#667eea" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </Grid>

            {/* 위협 발생 추이 */}
            <Grid size={{ xs: 12 }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            위협 발생 추이 (최근 7일)
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={threatTrendData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="critical"
                                    stroke={COLORS.critical}
                                    strokeWidth={2}
                                    name="Critical"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="high"
                                    stroke={COLORS.high}
                                    strokeWidth={2}
                                    name="High"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="medium"
                                    stroke={COLORS.medium}
                                    strokeWidth={2}
                                    name="Medium"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="low"
                                    stroke={COLORS.low}
                                    strokeWidth={2}
                                    name="Low"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </Grid>

            {/* 이벤트 위험 수준 분포 */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            이벤트 위험 수준 분포
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={eventRiskData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8884d8">
                                    {eventRiskData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </Grid>

            {/* 보안 점수 추이 */}
            {securityScoreData.length > 0 && (
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                보안 점수 추이 (최근 7일)
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={securityScoreData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#667eea"
                                        strokeWidth={2}
                                        name="보안 점수"
                                        dot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            )}
        </Grid>
    );
};

export default SecurityCharts;
