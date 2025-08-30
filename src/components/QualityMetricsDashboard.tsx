import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    LinearProgress,
    Chip,
    IconButton,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Badge,
    Tooltip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import {
    TrendingUp,
    TrendingDown,
    TrendingFlat,
    CheckCircle,
    Warning,
    Error,
    Info,
    Refresh,
    Notifications,
    Speed,
    Memory,
    Storage,
    NetworkCheck,
    Assessment,
    Security,
    AutoFixHigh,
    Timeline,
    Analytics,
    BugReport,
    Visibility,
    Close
} from '@mui/icons-material';

interface QualityMetric {
    id: string;
    name: string;
    value: number;
    unit: string;
    status: 'success' | 'warning' | 'error' | 'info';
    trend: 'up' | 'down' | 'stable';
    description: string;
    threshold: {
        warning: number;
        error: number;
    };
    history: Array<{
        timestamp: string;
        value: number;
    }>;
}

interface TestSuite {
    id: string;
    name: string;
    category: string;
    status: 'active' | 'inactive' | 'running' | 'failed';
    lastExecuted: string;
    passRate: number;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    duration: number;
    priority: 'high' | 'medium' | 'low';
}

interface Alert {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
}

const QualityMetricsDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<QualityMetric[]>([
        {
            id: 'pass-rate',
            name: '전체 통과율',
            value: 89.5,
            unit: '%',
            status: 'success',
            trend: 'up',
            description: '모든 테스트의 통과 비율',
            threshold: { warning: 85, error: 75 },
            history: [
                { timestamp: '2024-01-15 10:00', value: 87.2 },
                { timestamp: '2024-01-15 11:00', value: 88.1 },
                { timestamp: '2024-01-15 12:00', value: 88.9 },
                { timestamp: '2024-01-15 13:00', value: 89.5 }
            ]
        },
        {
            id: 'response-time',
            name: '평균 응답 시간',
            value: 245,
            unit: 'ms',
            status: 'success',
            trend: 'stable',
            description: 'API 응답 시간 평균',
            threshold: { warning: 300, error: 500 },
            history: [
                { timestamp: '2024-01-15 10:00', value: 238 },
                { timestamp: '2024-01-15 11:00', value: 242 },
                { timestamp: '2024-01-15 12:00', value: 244 },
                { timestamp: '2024-01-15 13:00', value: 245 }
            ]
        },
        {
            id: 'memory-usage',
            name: '메모리 사용률',
            value: 75.2,
            unit: '%',
            status: 'warning',
            trend: 'up',
            description: '시스템 메모리 사용률',
            threshold: { warning: 70, error: 85 },
            history: [
                { timestamp: '2024-01-15 10:00', value: 72.1 },
                { timestamp: '2024-01-15 11:00', value: 73.8 },
                { timestamp: '2024-01-15 12:00', value: 74.5 },
                { timestamp: '2024-01-15 13:00', value: 75.2 }
            ]
        },
        {
            id: 'cpu-usage',
            name: 'CPU 사용률',
            value: 45.8,
            unit: '%',
            status: 'success',
            trend: 'stable',
            description: '시스템 CPU 사용률',
            threshold: { warning: 60, error: 80 },
            history: [
                { timestamp: '2024-01-15 10:00', value: 44.2 },
                { timestamp: '2024-01-15 11:00', value: 45.1 },
                { timestamp: '2024-01-15 12:00', value: 45.6 },
                { timestamp: '2024-01-15 13:00', value: 45.8 }
            ]
        },
        {
            id: 'error-rate',
            name: '오류율',
            value: 2.1,
            unit: '%',
            status: 'warning',
            trend: 'down',
            description: '시스템 오류 발생률',
            threshold: { warning: 2, error: 5 },
            history: [
                { timestamp: '2024-01-15 10:00', value: 2.8 },
                { timestamp: '2024-01-15 11:00', value: 2.5 },
                { timestamp: '2024-01-15 12:00', value: 2.3 },
                { timestamp: '2024-01-15 13:00', value: 2.1 }
            ]
        },
        {
            id: 'availability',
            name: '가용성',
            value: 98.0,
            unit: '%',
            status: 'success',
            trend: 'stable',
            description: '시스템 가용성',
            threshold: { warning: 95, error: 90 },
            history: [
                { timestamp: '2024-01-15 10:00', value: 98.1 },
                { timestamp: '2024-01-15 11:00', value: 98.0 },
                { timestamp: '2024-01-15 12:00', value: 98.0 },
                { timestamp: '2024-01-15 13:00', value: 98.0 }
            ]
        }
    ]);

    const [testSuites, setTestSuites] = useState<TestSuite[]>([
        {
            id: 'functional-test-suite',
            name: 'AI 기능 테스트 스위트',
            category: 'functional',
            status: 'active',
            lastExecuted: '2024-01-15 14:30:00',
            passRate: 92.5,
            totalTests: 15,
            passedTests: 14,
            failedTests: 1,
            duration: 245,
            priority: 'high'
        },
        {
            id: 'performance-test-suite',
            name: 'AI 성능 테스트 스위트',
            category: 'performance',
            status: 'running',
            lastExecuted: '2024-01-15 15:00:00',
            passRate: 88.0,
            totalTests: 12,
            passedTests: 10,
            failedTests: 2,
            duration: 180,
            priority: 'high'
        },
        {
            id: 'security-test-suite',
            name: 'AI 보안 테스트 스위트',
            category: 'security',
            status: 'active',
            lastExecuted: '2024-01-15 13:45:00',
            passRate: 95.0,
            totalTests: 8,
            passedTests: 8,
            failedTests: 0,
            duration: 120,
            priority: 'medium'
        },
        {
            id: 'integration-test-suite',
            name: '통합 테스트 스위트',
            category: 'integration',
            status: 'failed',
            lastExecuted: '2024-01-15 12:15:00',
            passRate: 65.0,
            totalTests: 20,
            passedTests: 13,
            failedTests: 7,
            duration: 300,
            priority: 'high'
        }
    ]);

    const [alerts, setAlerts] = useState<Alert[]>([
        {
            id: '1',
            type: 'warning',
            title: '메모리 사용률 증가',
            message: '메모리 사용률이 75%를 초과했습니다. 모니터링이 필요합니다.',
            timestamp: '2024-01-15 13:00:00',
            read: false
        },
        {
            id: '2',
            type: 'error',
            title: '통합 테스트 실패',
            message: '통합 테스트 스위트에서 7개의 테스트가 실패했습니다.',
            timestamp: '2024-01-15 12:15:00',
            read: false
        },
        {
            id: '3',
            type: 'info',
            title: '성능 테스트 시작',
            message: 'AI 성능 테스트 스위트가 실행을 시작했습니다.',
            timestamp: '2024-01-15 15:00:00',
            read: true
        }
    ]);

    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setLastUpdated(new Date());
            // 실시간 데이터 업데이트 시뮬레이션
            setMetrics(prev => prev.map(metric => ({
                ...metric,
                value: metric.value + (Math.random() - 0.5) * 2,
                history: [...metric.history.slice(-3), {
                    timestamp: new Date().toISOString(),
                    value: metric.value + (Math.random() - 0.5) * 2
                }]
            })));
        }, 30000); // 30초마다 업데이트

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'success';
            case 'warning': return 'warning';
            case 'error': return 'error';
            default: return 'info';
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return <TrendingUp color="success" />;
            case 'down': return <TrendingDown color="error" />;
            default: return <TrendingFlat color="info" />;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success': return <CheckCircle color="success" />;
            case 'warning': return <Warning color="warning" />;
            case 'error': return <Error color="error" />;
            default: return <Info color="info" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'success';
            default: return 'default';
        }
    };

    const getTestSuiteIcon = (category: string) => {
        switch (category) {
            case 'functional': return <Assessment />;
            case 'performance': return <Speed />;
            case 'security': return <Security />;
            case 'integration': return <AutoFixHigh />;
            default: return <Assessment />;
        }
    };

    const unreadAlerts = alerts.filter(alert => !alert.read).length;

    return (
        <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
            {/* 헤더 */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        품질 메트릭 대시보드
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        마지막 업데이트: {lastUpdated.toLocaleTimeString()}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton>
                        <Refresh />
                    </IconButton>
                    <Badge badgeContent={unreadAlerts} color="error">
                        <IconButton>
                            <Notifications />
                        </IconButton>
                    </Badge>
                </Box>
            </Box>

            {/* 알림 섹션 */}
            {alerts.filter(alert => !alert.read).length > 0 && (
                <Box sx={{ mb: 3 }}>
                    {alerts.filter(alert => !alert.read).map(alert => (
                        <Alert
                            key={alert.id}
                            severity={alert.type}
                            sx={{ mb: 1 }}
                            action={
                                <IconButton
                                    color="inherit"
                                    size="small"
                                    onClick={() => setAlerts(prev =>
                                        prev.map(a => a.id === alert.id ? { ...a, read: true } : a)
                                    )}
                                >
                                    <Close fontSize="inherit" />
                                </IconButton>
                            }
                        >
                            <Typography variant="subtitle2">{alert.title}</Typography>
                            <Typography variant="body2">{alert.message}</Typography>
                        </Alert>
                    ))}
                </Box>
            )}

            {/* 메트릭 카드들 */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {metrics.map(metric => (
                    <Grid item xs={12} sm={6} md={4} key={metric.id}>
                        <Card elevation={2}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Box>
                                        <Typography variant="h6" fontWeight="bold">
                                            {metric.value}{metric.unit}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {metric.name}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {getTrendIcon(metric.trend)}
                                        {getStatusIcon(metric.status)}
                                    </Box>
                                </Box>

                                <LinearProgress
                                    variant="determinate"
                                    value={metric.value}
                                    color={getStatusColor(metric.status)}
                                    sx={{ mb: 1 }}
                                />

                                <Typography variant="caption" color="text.secondary">
                                    {metric.description}
                                </Typography>

                                <Box sx={{ mt: 1 }}>
                                    <Chip
                                        label={metric.status}
                                        size="small"
                                        color={getStatusColor(metric.status)}
                                        variant="outlined"
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* 테스트 스위트 테이블 */}
            <Card elevation={2} sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        테스트 스위트 현황
                    </Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>이름</TableCell>
                                    <TableCell>카테고리</TableCell>
                                    <TableCell>상태</TableCell>
                                    <TableCell>통과율</TableCell>
                                    <TableCell>테스트 수</TableCell>
                                    <TableCell>실행 시간</TableCell>
                                    <TableCell>우선순위</TableCell>
                                    <TableCell>마지막 실행</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {testSuites.map(suite => (
                                    <TableRow key={suite.id}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {getTestSuiteIcon(suite.category)}
                                                <Typography variant="body2" fontWeight="medium">
                                                    {suite.name}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={suite.category} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={suite.status}
                                                size="small"
                                                color={getStatusColor(suite.status)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body2">
                                                    {suite.passRate}%
                                                </Typography>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={suite.passRate}
                                                    sx={{ width: 60, height: 6 }}
                                                    color={suite.passRate >= 90 ? 'success' : suite.passRate >= 75 ? 'warning' : 'error'}
                                                />
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {suite.passedTests}/{suite.totalTests}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {suite.duration}s
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={suite.priority}
                                                size="small"
                                                color={getPriorityColor(suite.priority)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {suite.lastExecuted}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* 요약 통계 */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                전체 요약
                            </Typography>
                            <List>
                                <ListItem>
                                    <ListItemIcon>
                                        <Assessment color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="총 테스트 스위트"
                                        secondary={`${testSuites.length}개`}
                                    />
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircle color="success" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="활성 스위트"
                                        secondary={`${testSuites.filter(s => s.status === 'active').length}개`}
                                    />
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemIcon>
                                        <Warning color="warning" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="실행 중"
                                        secondary={`${testSuites.filter(s => s.status === 'running').length}개`}
                                    />
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemIcon>
                                        <Error color="error" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="실패"
                                        secondary={`${testSuites.filter(s => s.status === 'failed').length}개`}
                                    />
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                시스템 상태
                            </Typography>
                            <List>
                                <ListItem>
                                    <ListItemIcon>
                                        <Speed color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="평균 응답 시간"
                                        secondary={`${metrics.find(m => m.id === 'response-time')?.value}ms`}
                                    />
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemIcon>
                                        <Memory color="warning" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="메모리 사용률"
                                        secondary={`${metrics.find(m => m.id === 'memory-usage')?.value}%`}
                                    />
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemIcon>
                                        <Storage color="info" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="CPU 사용률"
                                        secondary={`${metrics.find(m => m.id === 'cpu-usage')?.value}%`}
                                    />
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemIcon>
                                        <NetworkCheck color="success" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="시스템 가용성"
                                        secondary={`${metrics.find(m => m.id === 'availability')?.value}%`}
                                    />
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default QualityMetricsDashboard;
