// 보안 통계 및 분석 패널
// securityAnalyticsService를 사용하여 종합 보안 통계 및 인사이트 제공

import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Button,
    CircularProgress,
    Alert,
    List,
    ListItem,
    ListItemText,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
} from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import securityAnalyticsService, { SecurityStatistics } from '../../services/securityAnalyticsService';
import { errorLogger } from '../../utils/errorLogger';

const SecurityAnalyticsPanel: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [statistics, setStatistics] = useState<SecurityStatistics | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<Date>(() => {
        const date = new Date();
        date.setDate(date.getDate() - 7); // 기본값: 최근 7일
        return date;
    });
    const [endDate, setEndDate] = useState<Date>(new Date());

    // 통계 로드
    const loadStatistics = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const stats = await securityAnalyticsService.generateStatistics(startDate, endDate);
            setStatistics(stats);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '통계를 불러오는 중 오류가 발생했습니다.';
            setError(errorMessage);
            errorLogger.error('보안 통계 로드 실패', err as Error, {
                component: 'SecurityAnalyticsPanel',
                action: 'loadStatistics',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadStatistics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, endDate]);

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        );
    }

    if (!statistics) {
        return (
            <Alert severity="info">통계 데이터가 없습니다.</Alert>
        );
    }

    return (
        <Box>
            {/* 날짜 선택 및 새로고침 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Box>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    시작 날짜
                                </Typography>
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date: Date | null) => date && setStartDate(date)}
                                    dateFormat="yyyy-MM-dd"
                                    className="react-datepicker-wrapper"
                                    customInput={
                                        <TextField
                                            fullWidth
                                            size="small"
                                            InputProps={{ readOnly: true }}
                                        />
                                    }
                                />
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Box>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    종료 날짜
                                </Typography>
                                <DatePicker
                                    selected={endDate}
                                    onChange={(date: Date | null) => date && setEndDate(date)}
                                    dateFormat="yyyy-MM-dd"
                                    className="react-datepicker-wrapper"
                                    customInput={
                                        <TextField
                                            fullWidth
                                            size="small"
                                            InputProps={{ readOnly: true }}
                                        />
                                    }
                                />
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={loadStatistics}
                                disabled={isLoading}
                                sx={{ mt: 3 }}
                            >
                                새로고침
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* 인사이트 */}
            {statistics.insights.length > 0 && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            보안 인사이트
                        </Typography>
                        <List>
                            {statistics.insights.map((insight, index) => (
                                <ListItem key={`insight-${index}-${insight.substring(0, 20)}`}>
                                    <ListItemText primary={insight} />
                                </ListItem>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            )}

            {/* 위협 통계 */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                위협 심각도 분포
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={Object.entries(statistics.threats.bySeverity).map(([name, value]) => ({
                                        name: name.toUpperCase(),
                                        value,
                                    }))}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="var(--accent-info)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                위협 발생 추이
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={statistics.threats.trend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="var(--accent-info)"
                                        strokeWidth={2}
                                        name="위협 수"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 상위 위협 소스 */}
            {statistics.threats.topSources.length > 0 && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            상위 위협 소스 IP
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>IP 주소</TableCell>
                                        <TableCell align="right">위협 수</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {statistics.threats.topSources.map((source) => (
                                        <TableRow key={`source-${source.ip}`}>
                                            <TableCell>{source.ip}</TableCell>
                                            <TableCell align="right">{source.count}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {/* 이벤트 통계 */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                이벤트 위험 수준 분포
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={Object.entries(statistics.events.byRiskLevel).map(([name, value]) => ({
                                        name: name.toUpperCase(),
                                        value,
                                    }))}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="var(--accent-warning)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                이벤트 발생 추이
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={statistics.trends.eventFrequency}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="var(--accent-warning)"
                                        strokeWidth={2}
                                        name="이벤트 수"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 알림 통계 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        알림 통계
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                                총 알림 수
                            </Typography>
                            <Typography variant="h4">{statistics.alerts.total}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                                미확인 알림
                            </Typography>
                            <Typography variant="h4" color="error">
                                {statistics.alerts.unacknowledged}
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                                심각도별 분포
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                                {Object.entries(statistics.alerts.bySeverity).map(([severity, count]) => {
                                    let chipColor: 'error' | 'warning' | 'default' = 'default';
                                    if (severity === 'critical') {
                                        chipColor = 'error';
                                    } else if (severity === 'high') {
                                        chipColor = 'warning';
                                    }
                                    return (
                                        <Chip
                                            key={severity}
                                            label={`${severity}: ${count}`}
                                            size="small"
                                            sx={{ mr: 1, mb: 1 }}
                                            color={chipColor}
                                        />
                                    );
                                })}
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* 감사 로그 통계 */}
            {statistics.audit.topUsers.length > 0 && (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    상위 사용자 활동
                                </Typography>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>사용자 ID</TableCell>
                                                <TableCell align="right">활동 수</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {statistics.audit.topUsers.map((user) => (
                                                <TableRow key={`user-${user.user_id}`}>
                                                    <TableCell>{user.user_id}</TableCell>
                                                    <TableCell align="right">{user.action_count}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    상위 접근 리소스
                                </Typography>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>리소스</TableCell>
                                                <TableCell align="right">접근 수</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {statistics.audit.topResources.map((resource) => (
                                                <TableRow key={`resource-${resource.resource}`}>
                                                    <TableCell>{resource.resource}</TableCell>
                                                    <TableCell align="right">{resource.access_count}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* 보안 점수 추이 */}
            {statistics.trends.securityScoreTrend.length > 0 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            보안 점수 추이
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={statistics.trends.securityScoreTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="var(--accent-success)"
                                    strokeWidth={2}
                                    name="보안 점수"
                                    dot={{ r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default SecurityAnalyticsPanel;
