import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    LinearProgress,
    Chip,
    IconButton,
    Tooltip,
    Fab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Paper,
    Avatar
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Speed as SpeedIcon,
    Security as SecurityIcon,
    Psychology as PsychologyIcon,
    Refresh as RefreshIcon,
    Settings as SettingsIcon,
    TrendingUp as TrendingUpIcon,
    Memory as MemoryIcon,
    Storage as StorageIcon,
    NetworkCheck as NetworkIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import { performanceApi } from '../services/apiService';
import { websocketService, SystemMetrics as WSSystemMetrics, SecurityAlert, AIEngineStatus, PerformanceOptimization } from '../services/websocketService';
import { notificationService } from '../services/notificationService';
import NotificationCenter from './NotificationCenter';
import { useNotifications } from '../hooks/useNotifications';
import { errorLogger } from '../utils/errorLogger';

interface SystemMetrics {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
    responseTime: number;
    errorRate: number;
}

interface SystemStatus {
    overall: string;
    performance: string;
    security: string;
    ai: string;
    userExperience: string;
}

interface AlertData {
    id: string;
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
    timestamp: string;
}

const IntegratedDashboard: React.FC = () => {
    // 알림 관리
    const {
        notifications,
        markAsRead,
        dismiss,
        clearAll,
    } = useNotifications();

    const [metrics, setMetrics] = useState<SystemMetrics>({
        cpu: 0,
        memory: 0,
        disk: 0,
        network: 0,
        responseTime: 0,
        errorRate: 0
    });

    const [systemStatus, setSystemStatus] = useState<SystemStatus>({
        overall: 'healthy',
        performance: 'healthy',
        security: 'healthy',
        ai: 'healthy',
        userExperience: 'healthy'
    });

    const [alerts, setAlerts] = useState<AlertData[]>([]);
    const [loading, setLoading] = useState(true);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);

    // 실시간 데이터 업데이트
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 시스템 메트릭 수집
                const metricsResult = await performanceApi.getMetrics();
                if (metricsResult.success && metricsResult.data) {
                    const data = metricsResult.data as Record<string, number | undefined>;
                    setMetrics({
                        cpu: data.cpu || 0,
                        memory: data.memory || 0,
                        disk: data.disk || 0,
                        network: data.network || 0,
                        responseTime: data.responseTime || 0,
                        errorRate: data.errorRate || 0
                    });
                }

                // 시스템 상태 확인
                const healthResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5002'}/api/health`);
                const healthData = await healthResponse.json();
                if (healthData.success) {
                    setSystemStatus({
                        overall: healthData.status,
                        performance: healthData.modules?.performance || 'healthy',
                        security: healthData.modules?.security || 'healthy',
                        ai: healthData.modules?.ai_engine || 'healthy',
                        userExperience: healthData.modules?.user_experience || 'healthy'
                    });
                }

                // 새로운 알림 생성 (시뮬레이션)
                const newAlert: AlertData = {
                    id: Date.now().toString(),
                    type: Math.random() > 0.7 ? 'warning' : 'info',
                    title: '시스템 업데이트',
                    message: `시스템이 정상적으로 작동 중입니다. (${new Date().toLocaleTimeString()})`,
                    timestamp: new Date().toISOString()
                };

                setAlerts(prev => [newAlert, ...prev.slice(0, 9)]); // 최대 10개 알림 유지

            } catch (error) {
                errorLogger.error('데이터 수집 실패', error instanceof Error ? error : new Error(String(error)), {
                    component: 'IntegratedDashboard',
                    action: 'collectMetrics',
                });
                notificationService.error('데이터 수집 오류', '시스템 메트릭 수집 중 오류가 발생했습니다.');
                const errorAlert: AlertData = {
                    id: Date.now().toString(),
                    type: 'error',
                    title: '데이터 수집 오류',
                    message: '시스템 메트릭 수집 중 오류가 발생했습니다.',
                    timestamp: new Date().toISOString()
                };
                setAlerts(prev => [errorAlert, ...prev.slice(0, 9)]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000); // 5초마다 업데이트

        return () => clearInterval(interval);
    }, []);

    // WebSocket 실시간 데이터 수신
    useEffect(() => {
        const handleSystemMetrics = (data: WSSystemMetrics) => {
            setMetrics(prev => ({
                ...prev,
                cpu: data.cpu,
                memory: data.memory,
                disk: data.disk,
                network: data.network,
                responseTime: data.responseTime,
                errorRate: data.errorRate
            }));
        };

        const handleSecurityAlert = (data: SecurityAlert) => {
            notificationService.security(
                '보안 알림',
                `${data.message} - 심각도: ${data.severity}`,
                {
                    actions: [
                        {
                            label: '상세 보기',
                            action: () => {
                                errorLogger.info('보안 알림 상세', {
                                    component: 'IntegratedDashboard',
                                    action: 'securityAlertDetail',
                                    alertType: data.alert_type,
                                    severity: data.severity,
                                });
                            },
                            variant: 'primary',
                        },
                    ],
                }
            );
        };

        const handleAIEngineStatus = (data: AIEngineStatus) => {
            if (data.overall_performance < 90) {
                notificationService.ai(
                    'AI 엔진 성능 저하',
                    `AI 엔진 성능이 ${data.overall_performance.toFixed(1)}%로 저하되었습니다.`
                );
            }
        };

        const handlePerformanceOptimization = (data: PerformanceOptimization) => {
            if (data.status === 'completed') {
                notificationService.performance(
                    '성능 최적화 완료',
                    `${data.optimization_type} 최적화가 완료되었습니다. 성능 향상: ${data.performance_gain.toFixed(1)}%`
                );
            } else if (data.status === 'failed') {
                notificationService.error(
                    '성능 최적화 실패',
                    `${data.optimization_type} 최적화가 실패했습니다.`
                );
            }
        };

        // WebSocket 이벤트 리스너 등록
        websocketService.on('systemMetrics', handleSystemMetrics);
        websocketService.on('securityAlert', handleSecurityAlert);
        websocketService.on('aiEngineStatus', handleAIEngineStatus);
        websocketService.on('performanceOptimization', handlePerformanceOptimization);

        // 초기 데이터 요청
        websocketService.requestMetrics();
        websocketService.requestSecurityAlerts();
        websocketService.requestAIStatus();
        websocketService.requestPerformanceOptimization();

        return () => {
            websocketService.off('systemMetrics', handleSystemMetrics);
            websocketService.off('securityAlert', handleSecurityAlert);
            websocketService.off('aiEngineStatus', handleAIEngineStatus);
            websocketService.off('performanceOptimization', handlePerformanceOptimization);
        };
    }, []);

    const getStatusColor = useCallback((status: string): 'success' | 'warning' | 'error' | 'default' => {
        switch (status) {
            case 'healthy': return 'success';
            case 'warning': return 'warning';
            case 'error': return 'error';
            default: return 'default';
        }
    }, []);

    const getStatusIcon = useCallback((status: string) => {
        switch (status) {
            case 'healthy': return <CheckCircleIcon />;
            case 'warning': return <WarningIcon />;
            case 'error': return <ErrorIcon />;
            default: return <InfoIcon />;
        }
    }, []);

    const MetricCard: React.FC<{
        title: string;
        value: number;
        unit: string;
        icon: React.ReactNode;
        color: string;
        max?: number;
    }> = ({ title, value, unit, icon, color, max = 100 }) => (
        <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="h6" component="div">
                        {title}
                    </Typography>
                    <Avatar sx={{ bgcolor: color, width: 40, height: 40 }}>
                        {icon}
                    </Avatar>
                </Box>
                <Typography variant="h4" component="div" color={color}>
                    {value.toFixed(1)}{unit}
                </Typography>
                <LinearProgress
                    variant="determinate"
                    value={(value / max) * 100}
                    sx={{ mt: 1, height: 8, borderRadius: 4 }}
                    color={value > max * 0.8 ? 'error' : value > max * 0.6 ? 'warning' : 'primary'}
                />
            </CardContent>
        </Card>
    );

    const StatusCard: React.FC<{
        title: string;
        status: string;
        icon: React.ReactNode;
        description: string;
    }> = ({ title, status, icon, description }) => (
        <Card 
            sx={{ height: '100%' }}
            role="region"
            aria-label={`${title} 상태: ${status}`}
        >
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="h6" component="div">
                        {title}
                    </Typography>
                    <Chip
                        icon={getStatusIcon(status)}
                        label={status.toUpperCase()}
                        color={getStatusColor(status)}
                        size="small"
                        aria-label={`상태: ${status}`}
                    />
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                    <span aria-hidden="true">{icon}</span>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        {description}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
            {/* 헤더 */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                    <DashboardIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
                    <Typography variant="h4" component="h1" fontWeight="bold">
                        CORBU AI Ultimate Dashboard
                    </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                    <NotificationCenter
                        notifications={notifications}
                        onMarkAsRead={markAsRead}
                        onDismiss={dismiss}
                        onClearAll={clearAll}
                    />
                    <Tooltip title="새로고침">
                        <IconButton onClick={() => window.location.reload()}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="설정">
                        <IconButton onClick={() => setSettingsOpen(true)}>
                            <SettingsIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* 시스템 상태 개요 */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                    <StatusCard
                        title="전체 시스템"
                        status={systemStatus.overall}
                        icon={<DashboardIcon />}
                        description="모든 모듈이 정상 작동 중"
                    />
                </Box>
                <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                    <StatusCard
                        title="성능 최적화"
                        status={systemStatus.performance}
                        icon={<SpeedIcon />}
                        description="실시간 성능 모니터링"
                    />
                </Box>
                <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                    <StatusCard
                        title="AI 엔진"
                        status={systemStatus.ai}
                        icon={<PsychologyIcon />}
                        description="AI 모델 관리 시스템"
                    />
                </Box>
                <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                    <StatusCard
                        title="보안 모니터링"
                        status={systemStatus.security}
                        icon={<SecurityIcon />}
                        description="실시간 보안 스캔"
                    />
                </Box>
            </Box>

            {/* 실시간 메트릭 */}
            <Typography variant="h5" component="h2" mb={2} fontWeight="bold">
                실시간 시스템 메트릭
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                    <MetricCard
                        title="CPU 사용률"
                        value={metrics.cpu}
                        unit="%"
                        icon={<MemoryIcon />}
                        color="primary.main"
                    />
                </Box>
                <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                    <MetricCard
                        title="메모리 사용률"
                        value={metrics.memory}
                        unit="%"
                        icon={<StorageIcon />}
                        color="secondary.main"
                    />
                </Box>
                <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                    <MetricCard
                        title="디스크 사용률"
                        value={metrics.disk}
                        unit="%"
                        icon={<StorageIcon />}
                        color="warning.main"
                    />
                </Box>
                <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                    <MetricCard
                        title="네트워크 사용률"
                        value={metrics.network}
                        unit="%"
                        icon={<NetworkIcon />}
                        color="info.main"
                    />
                </Box>
            </Box>

            {/* 성능 지표 */}
            <Typography variant="h5" component="h2" mb={2} fontWeight="bold">
                성능 지표
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" mb={2}>
                                응답 시간
                            </Typography>
                            <Box display="flex" alignItems="center">
                                <Typography variant="h3" color="primary.main" mr={2}>
                                    {metrics.responseTime.toFixed(0)}ms
                                </Typography>
                                <TrendingUpIcon color="success" />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                평균 응답 시간이 우수한 수준입니다
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" mb={2}>
                                오류율
                            </Typography>
                            <Box display="flex" alignItems="center">
                                <Typography variant="h3" color={metrics.errorRate > 1 ? 'error.main' : 'success.main'} mr={2}>
                                    {metrics.errorRate.toFixed(2)}%
                                </Typography>
                                {metrics.errorRate > 1 ? <ErrorIcon color="error" /> : <CheckCircleIcon color="success" />}
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                {metrics.errorRate > 1 ? '오류율이 높습니다' : '오류율이 안정적입니다'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            {/* 최근 알림 */}
            <Typography variant="h5" component="h2" mb={2} fontWeight="bold">
                최근 알림
            </Typography>
            <Paper sx={{ maxHeight: 300, overflow: 'auto' }}>
                <List>
                    {alerts.map((alert, index) => (
                        <React.Fragment key={alert.id}>
                            <ListItem>
                                <ListItemIcon>
                                    {alert.type === 'success' && <CheckCircleIcon color="success" />}
                                    {alert.type === 'warning' && <WarningIcon color="warning" />}
                                    {alert.type === 'error' && <ErrorIcon color="error" />}
                                    {alert.type === 'info' && <InfoIcon color="info" />}
                                </ListItemIcon>
                                <ListItemText
                                    primary={alert.title}
                                    secondary={
                                        <Box>
                                            <Typography variant="body2">{alert.message}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(alert.timestamp).toLocaleString()}
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                            {index < alerts.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>
            </Paper>

            {/* 플로팅 액션 버튼 */}
            <Fab
                color="primary"
                aria-label="빠른 액션"
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
                onClick={() => {
                    // 빠른 최적화 실행
                    performanceApi.runOptimization('memory', 'auto');
                }}
            >
                <SpeedIcon />
            </Fab>

            {/* 알림 다이얼로그 */}
            <Dialog open={notificationOpen} onClose={() => setNotificationOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>시스템 알림</DialogTitle>
                <DialogContent>
                    <List>
                        {alerts.map((alert) => (
                            <ListItem key={alert.id}>
                                <ListItemIcon>
                                    {alert.type === 'success' && <CheckCircleIcon color="success" />}
                                    {alert.type === 'warning' && <WarningIcon color="warning" />}
                                    {alert.type === 'error' && <ErrorIcon color="error" />}
                                    {alert.type === 'info' && <InfoIcon color="info" />}
                                </ListItemIcon>
                                <ListItemText
                                    primary={alert.title}
                                    secondary={alert.message}
                                />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNotificationOpen(false)}>닫기</Button>
                </DialogActions>
            </Dialog>

            {/* 설정 다이얼로그 */}
            <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>대시보드 설정</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" mb={2}>
                        실시간 업데이트 간격: 5초
                    </Typography>
                    <Typography variant="body1" mb={2}>
                        알림 표시: 활성화
                    </Typography>
                    <Typography variant="body1">
                        자동 새로고침: 활성화
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSettingsOpen(false)} aria-label="설정 다이얼로그 닫기">닫기</Button>
                </DialogActions>
            </Dialog>

            {/* 로딩 상태 */}
            {loading && (
                <Box position="fixed" top={0} left={0} right={0}>
                    <LinearProgress />
                </Box>
            )}
        </Box>
    );
};

export default IntegratedDashboard;
