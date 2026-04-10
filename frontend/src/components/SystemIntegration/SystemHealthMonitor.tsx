import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Chip,
    LinearProgress,
    IconButton,
    Alert,
    AlertTitle,
    Avatar,
    CircularProgress,
} from '@mui/material';
import {
    Refresh,
    CheckCircle,
    Error,
    Warning,
    Info,
    Speed,
    Timeline,
} from '@mui/icons-material';
import integratedSystemAPI, { SystemStatus } from '../../services/integratedSystemAPI';
import { getStatusColor } from '../../styles/themeColors';
import { errorLogger, toError } from '../../utils/errorLogger';

interface HealthMetric {
    name: string;
    value: number;
    max: number;
    unit: string;
    status: 'good' | 'warning' | 'critical';
    icon: React.ReactNode;
}

const SystemHealthMonitor: React.FC = () => {
    const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [autoRefresh, _setAutoRefresh] = useState(true);

    useEffect(() => {
        loadSystemStatus();

        if (autoRefresh) {
            const interval = setInterval(loadSystemStatus, 10000); // 10초마다 업데이트
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    const loadSystemStatus = async () => {
        setIsLoading(true);
        try {
            const status = await integratedSystemAPI.checkSystemHealth();
            setSystemStatus(status);
            setLastUpdate(new Date());
        } catch (error) {
            const err = toError(error);
            errorLogger.error('시스템 상태 로드 실패', err, {
                component: 'SystemHealthMonitor',
                action: 'loadSystemStatus',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'up':
            case 'healthy':
                return <CheckCircle color="success" />;
            case 'down':
            case 'unhealthy':
                return <Error color="error" />;
            case 'degraded':
                return <Warning color="warning" />;
            default:
                return <Info color="info" />;
        }
    };

    const getHealthMetrics = (): HealthMetric[] => {
        if (!systemStatus) return [];

        const metrics: HealthMetric[] = [];

        // 서비스 상태 메트릭
        const totalServices = Object.keys(systemStatus.services).length;
        const healthyServices = Object.values(systemStatus.services).filter(s => s.status === 'up').length;
        const healthPercentage = totalServices > 0 ? (healthyServices / totalServices) * 100 : 0;

        metrics.push({
            name: '서비스 가용성',
            value: healthPercentage,
            max: 100,
            unit: '%',
            status: healthPercentage >= 90 ? 'good' : healthPercentage >= 70 ? 'warning' : 'critical',
            icon: <CheckCircle />
        });

        // 평균 응답 시간
        const responseTimes = Object.values(systemStatus.services)
            .map(s => s.responseTime)
            .filter(rt => rt !== undefined) as number[];
        const avgResponseTime = responseTimes.length > 0
            ? responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length
            : 0;

        metrics.push({
            name: '평균 응답 시간',
            value: avgResponseTime,
            max: 1000,
            unit: 'ms',
            status: avgResponseTime <= 500 ? 'good' : avgResponseTime <= 1000 ? 'warning' : 'critical',
            icon: <Speed />
        });

        // 시스템 가동 시간
        const uptimeHours = systemStatus.uptime / (1000 * 60 * 60);
        metrics.push({
            name: '시스템 가동 시간',
            value: uptimeHours,
            max: 24,
            unit: '시간',
            status: 'good',
            icon: <Timeline />
        });

        return metrics;
    };

    const handleRefresh = () => {
        loadSystemStatus();
    };

    const getOverallStatus = () => {
        if (!systemStatus) return 'unknown';
        return systemStatus.status;
    };

    const getOverallStatusMessage = () => {
        const status = getOverallStatus();
        switch (status) {
            case 'healthy':
                return '모든 시스템이 정상적으로 작동하고 있습니다.';
            case 'degraded':
                return '일부 시스템에 문제가 있습니다. 모니터링이 필요합니다.';
            case 'unhealthy':
                return '시스템에 심각한 문제가 발생했습니다. 즉시 확인이 필요합니다.';
            default:
                return '시스템 상태를 확인하는 중입니다.';
        }
    };

    const getOverallStatusSeverity = () => {
        const status = getOverallStatus();
        switch (status) {
            case 'healthy':
                return 'success' as const;
            case 'degraded':
                return 'warning' as const;
            case 'unhealthy':
                return 'error' as const;
            default:
                return 'info' as const;
        }
    };

    const healthMetrics = getHealthMetrics();

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{
                background: 'linear-gradient(45deg, var(--accent-info) 0%, var(--accent-secondary) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold'
            }}>
                🏥 시스템 상태 모니터
            </Typography>

            {/* 전체 상태 알림 */}
            <Alert
                severity={getOverallStatusSeverity()}
                sx={{ mb: 3 }}
                action={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {isLoading && <CircularProgress size={20} />}
                        <IconButton onClick={handleRefresh} disabled={isLoading}>
                            <Refresh />
                        </IconButton>
                    </Box>
                }
            >
                <AlertTitle>시스템 상태: {getOverallStatus()}</AlertTitle>
                {getOverallStatusMessage()}
                {lastUpdate && (
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        마지막 업데이트: {lastUpdate.toLocaleTimeString()}
                    </Typography>
                )}
            </Alert>

            {/* 헬스 메트릭 */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                {healthMetrics.map((metric, index) => (
                    <Grid sx={{ xs: 12, sm: 6, md: 3 }} key={index}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{
                                        bgcolor: metric.status === 'good' ? 'var(--accent-success)' :
                                            metric.status === 'warning' ? 'var(--accent-warning)' : 'var(--accent-error)',
                                        mr: 2
                                    }}>
                                        {metric.icon}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" noWrap>
                                            {metric.value.toFixed(1)}{metric.unit}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {metric.name}
                                        </Typography>
                                    </Box>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={(metric.value / metric.max) * 100}
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        bgcolor: 'var(--bg-tertiary)',
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: metric.status === 'good' ? 'var(--accent-success)' :
                                                metric.status === 'warning' ? 'var(--accent-warning)' : 'var(--accent-error)'
                                        }
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* 서비스별 상태 */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        서비스별 상태
                    </Typography>
                    <Grid container spacing={2}>
                        {systemStatus && Object.entries(systemStatus.services).map(([serviceName, service]) => (
                            <Grid sx={{ xs: 12, sm: 6, md: 4 }} key={serviceName}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <Avatar sx={{
                                                bgcolor: getStatusColor(service.status),
                                                mr: 2,
                                                width: 32,
                                                height: 32
                                            }}>
                                                {getStatusIcon(service.status)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                                                    {serviceName}
                                                </Typography>
                                                <Chip
                                                    label={service.status}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: getStatusColor(service.status),
                                                        color: 'white',
                                                        fontSize: '0.7rem',
                                                        height: 20
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                        {service.responseTime && (
                                            <Typography variant="body2" color="text.secondary">
                                                응답 시간: {service.responseTime}ms
                                            </Typography>
                                        )}
                                        <Typography variant="body2" color="text.secondary">
                                            확인: {service.lastCheck ? new Date(service.lastCheck).toLocaleTimeString() : 'N/A'}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>

            {/* 시스템 정보 */}
            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        시스템 정보
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="primary">
                                    {systemStatus?.version || 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    버전
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="primary">
                                    {systemStatus ? Math.floor(systemStatus.uptime / (1000 * 60 * 60)) : 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    가동 시간 (시간)
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="primary">
                                    {systemStatus ? Object.keys(systemStatus.services).length : 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    총 서비스
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="primary">
                                    {systemStatus ? Object.values(systemStatus.services).filter(s => s.status === 'up').length : 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    활성 서비스
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );
};

export default SystemHealthMonitor;
