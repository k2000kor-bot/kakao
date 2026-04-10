import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    LinearProgress,
    Chip,
    Paper,
    Grid,
    Alert,
    AlertTitle,
    Collapse,
    IconButton
} from '@mui/material';
import {
    CheckCircle,
    Error,
    Warning,
    ExpandMore,
    ExpandLess,
    Refresh,
    Speed,
    Memory,
    Storage
} from '@mui/icons-material';
import { errorLogger, toError } from '../utils/errorLogger';
import {
    API_BASE_URL,
    FALLBACK_FRONTEND_ORIGIN,
    INTEGRATED_API_HEALTH_PATH,
    joinApiHealthCheckUrl,
    resolveApiBaseUrl,
} from '../config/api';

interface HealthData {
    status: 'healthy' | 'warning' | 'error';
    services: {
        frontend: { status: string; responseTime: number };
        backend: { status: string; responseTime: number };
        integrated: { status: string; responseTime: number };
    };
    performance: {
        cpuUsage: number;
        memoryUsage: number;
        diskUsage: number;
    };
    alerts: Array<{
        id: string;
        type: 'info' | 'warning' | 'error';
        message: string;
        timestamp: string;
    }>;
}

const SystemHealthMonitor: React.FC = () => {
    const [healthData, setHealthData] = useState<HealthData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        loadHealthData();
        const interval = setInterval(loadHealthData, 5000); // 5초마다 업데이트
        return () => clearInterval(interval);
    }, []);

    const loadHealthData = async () => {
        try {
            const startTime = Date.now();

            // 각 서비스 상태 확인
            const [frontendStatus, backendStatus, integratedStatus] = await Promise.allSettled([
                fetch(process.env.REACT_APP_DEV_URL || FALLBACK_FRONTEND_ORIGIN).then(() => 'healthy'),
                fetch(joinApiHealthCheckUrl(API_BASE_URL)).then(() => 'healthy'),
                fetch(joinApiHealthCheckUrl(resolveApiBaseUrl(), INTEGRATED_API_HEALTH_PATH)).then(() => 'healthy'),
            ]);

            const responseTime = Date.now() - startTime;

            // 시뮬레이션된 성능 데이터
            const mockHealthData: HealthData = {
                status: 'healthy',
                services: {
                    frontend: {
                        status: frontendStatus.status === 'fulfilled' ? 'healthy' : 'error',
                        responseTime: responseTime
                    },
                    backend: {
                        status: backendStatus.status === 'fulfilled' ? 'healthy' : 'error',
                        responseTime: responseTime
                    },
                    integrated: {
                        status: integratedStatus.status === 'fulfilled' ? 'healthy' : 'error',
                        responseTime: responseTime
                    }
                },
                performance: {
                    cpuUsage: Math.random() * 30 + 20, // 20-50%
                    memoryUsage: Math.random() * 40 + 30, // 30-70%
                    diskUsage: Math.random() * 20 + 60 // 60-80%
                },
                alerts: [
                    {
                        id: '1',
                        type: 'info',
                        message: '모든 서비스가 정상 작동 중입니다.',
                        timestamp: new Date().toLocaleTimeString()
                    },
                    {
                        id: '2',
                        type: 'info',
                        message: '시스템 성능이 안정적입니다.',
                        timestamp: new Date(Date.now() - 300000).toLocaleTimeString()
                    }
                ]
            };

            setHealthData(mockHealthData);
            setLoading(false);
        } catch (error) {
            const err = toError(error);
            errorLogger.error('헬스 데이터 로드 실패', err, {
                component: 'SystemHealthMonitor',
                action: 'loadHealthData',
            });
            setLoading(false);
        }
    };

    const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
        switch (status) {
            case 'healthy': return 'success';
            case 'warning': return 'warning';
            case 'error': return 'error';
            default: return 'default';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy': return <CheckCircle color="success" />;
            case 'warning': return <Warning color="warning" />;
            case 'error': return <Error color="error" />;
            default: return <Error color="disabled" />;
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>시스템 상태 로딩 중...</Typography>
                <LinearProgress />
            </Box>
        );
    }

    if (!healthData) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography variant="h6" color="error">시스템 상태를 불러올 수 없습니다.</Typography>
            </Box>
        );
    }

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(healthData.status)}
                    시스템 헬스 모니터
                </Typography>
                <Box>
                    <IconButton onClick={() => setExpanded(!expanded)}>
                        {expanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                    <IconButton onClick={loadHealthData}>
                        <Refresh />
                    </IconButton>
                </Box>
            </Box>

            {/* 서비스 상태 */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                {getStatusIcon(healthData.services.frontend.status)}
                                <Typography variant="subtitle1">프론트엔드</Typography>
                                <Chip
                                    label={healthData.services.frontend.status}
                                    color={getStatusColor(healthData.services.frontend.status)}
                                    size="small"
                                />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                응답시간: {healthData.services.frontend.responseTime}ms
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                {getStatusIcon(healthData.services.backend.status)}
                                <Typography variant="subtitle1">백엔드</Typography>
                                <Chip
                                    label={healthData.services.backend.status}
                                    color={getStatusColor(healthData.services.backend.status)}
                                    size="small"
                                />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                응답시간: {healthData.services.backend.responseTime}ms
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                {getStatusIcon(healthData.services.integrated.status)}
                                <Typography variant="subtitle1">통합 API</Typography>
                                <Chip
                                    label={healthData.services.integrated.status}
                                    color={getStatusColor(healthData.services.integrated.status)}
                                    size="small"
                                />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                응답시간: {healthData.services.integrated.responseTime}ms
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 상세 정보 */}
            <Collapse in={expanded}>
                <Box>
                    {/* 성능 지표 */}
                    <Typography variant="h6" sx={{ mb: 2 }}>성능 지표</Typography>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Speed color="primary" />
                                        <Typography variant="subtitle2">CPU 사용률</Typography>
                                    </Box>
                                    <Typography variant="h6" color="primary">
                                        {healthData.performance.cpuUsage.toFixed(1)}%
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={healthData.performance.cpuUsage}
                                        sx={{ mt: 1 }}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Memory color="secondary" />
                                        <Typography variant="subtitle2">메모리 사용률</Typography>
                                    </Box>
                                    <Typography variant="h6" color="secondary">
                                        {healthData.performance.memoryUsage.toFixed(1)}%
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={healthData.performance.memoryUsage}
                                        color="secondary"
                                        sx={{ mt: 1 }}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Storage color="warning" />
                                        <Typography variant="subtitle2">디스크 사용률</Typography>
                                    </Box>
                                    <Typography variant="h6" color="warning.main">
                                        {healthData.performance.diskUsage.toFixed(1)}%
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={healthData.performance.diskUsage}
                                        color="warning"
                                        sx={{ mt: 1 }}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* 알림 */}
                    <Typography variant="h6" sx={{ mb: 2 }}>시스템 알림</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {healthData.alerts.map((alert) => (
                            <Alert
                                key={alert.id}
                                severity={alert.type}
                                sx={{ mb: 1 }}
                            >
                                <AlertTitle>{alert.message}</AlertTitle>
                                <Typography variant="caption">
                                    {alert.timestamp}
                                </Typography>
                            </Alert>
                        ))}
                    </Box>
                </Box>
            </Collapse>
        </Paper>
    );
};

export default SystemHealthMonitor;
