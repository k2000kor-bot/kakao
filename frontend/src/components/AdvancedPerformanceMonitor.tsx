import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    LinearProgress,
    Chip,
    IconButton,
    Alert,
    Snackbar,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tab,
    Switch,
    FormControlLabel,
    Slider
} from '@mui/material';
import {
    NetworkCheck,
    Storage,
    PlayArrow,
    Pause,
    Download,
    Visibility,
    Memory as MemoryIcon,
    Storage as StorageIcon
} from '@mui/icons-material';
import axios from 'axios';
import { errorLogger, toError } from '../utils/errorLogger';
import {
    API_BASE_URL as CONFIG_API_ORIGIN,
    joinApiHealthCheckUrl,
    PERFORMANCE_MONITOR_METRICS_PATH,
    PERFORMANCE_MONITOR_START_MONITORING_PATH,
    PERFORMANCE_MONITOR_STOP_MONITORING_PATH,
    PERFORMANCE_MONITOR_ALERTS_PATH_PREFIX,
    PERFORMANCE_MONITOR_EXPORT_PATH,
} from '../config/api';

interface PerformanceMetrics {
    timestamp: string;
    cpu: {
        usage: number;
        cores: number;
        temperature: number;
        frequency: number;
    };
    memory: {
        used: number;
        total: number;
        available: number;
        swap: number;
    };
    disk: {
        used: number;
        total: number;
        readSpeed: number;
        writeSpeed: number;
    };
    network: {
        bytesIn: number;
        bytesOut: number;
        packetsIn: number;
        packetsOut: number;
        latency: number;
    };
    processes: {
        total: number;
        running: number;
        sleeping: number;
        zombie: number;
    };
}

interface PerformanceAlert {
    id: string;
    timestamp: string;
    type: 'cpu' | 'memory' | 'disk' | 'network';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    value: number;
    threshold: number;
    resolved: boolean;
}

interface PerformanceHistory {
    timestamp: string;
    metrics: PerformanceMetrics;
}

const AdvancedPerformanceMonitor: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState(0);
    const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics | null>(null);
    const [_performanceHistory, setPerformanceHistory] = useState<PerformanceHistory[]>([]);
    const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(2000);
    const [timeRange, _setTimeRange] = useState('1h');
    const [thresholds, setThresholds] = useState({
        cpu: 80,
        memory: 85,
        disk: 90,
        network: 1000
    });
    const [selectedAlert, setSelectedAlert] = useState<PerformanceAlert | null>(null);
    const [alertDialogOpen, setAlertDialogOpen] = useState(false);

    // 실시간 메트릭 수집
    const fetchPerformanceMetrics = useCallback(async () => {
        try {
            const response = await axios.get(joinApiHealthCheckUrl(CONFIG_API_ORIGIN, PERFORMANCE_MONITOR_METRICS_PATH));
            setCurrentMetrics(response.data);

            // 히스토리에 추가
            setPerformanceHistory(prev => [
                { timestamp: new Date().toISOString(), metrics: response.data },
                ...prev.slice(0, 100) // 최근 100개만 유지
            ]);

            // 임계값 체크 및 알림 생성
            checkThresholds(response.data);
        } catch (err) {
            const error = toError(err);
            errorLogger.error('성능 메트릭 수집 실패', error, {
                component: 'AdvancedPerformanceMonitor',
                action: 'collectPerformanceMetrics',
            });
            setError('성능 메트릭 수집 중 오류가 발생했습니다.');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- checkThresholds is defined below
    }, []);

    // 임계값 체크
    const checkThresholds = (metrics: PerformanceMetrics) => {
        const newAlerts: PerformanceAlert[] = [];

        if (metrics.cpu.usage > thresholds.cpu) {
            newAlerts.push({
                id: `cpu-${Date.now()}`,
                timestamp: new Date().toISOString(),
                type: 'cpu',
                severity: metrics.cpu.usage > 95 ? 'critical' : metrics.cpu.usage > 90 ? 'high' : 'medium',
                message: `CPU 사용률이 ${metrics.cpu.usage}%로 임계값 ${thresholds.cpu}%를 초과했습니다.`,
                value: metrics.cpu.usage,
                threshold: thresholds.cpu,
                resolved: false
            });
        }

        if (metrics.memory.used / metrics.memory.total * 100 > thresholds.memory) {
            newAlerts.push({
                id: `memory-${Date.now()}`,
                timestamp: new Date().toISOString(),
                type: 'memory',
                severity: metrics.memory.used / metrics.memory.total * 100 > 95 ? 'critical' : 'high',
                message: `메모리 사용률이 ${(metrics.memory.used / metrics.memory.total * 100).toFixed(1)}%로 임계값 ${thresholds.memory}%를 초과했습니다.`,
                value: metrics.memory.used / metrics.memory.total * 100,
                threshold: thresholds.memory,
                resolved: false
            });
        }

        if (metrics.disk.used / metrics.disk.total * 100 > thresholds.disk) {
            newAlerts.push({
                id: `disk-${Date.now()}`,
                timestamp: new Date().toISOString(),
                type: 'disk',
                severity: metrics.disk.used / metrics.disk.total * 100 > 95 ? 'critical' : 'high',
                message: `디스크 사용률이 ${(metrics.disk.used / metrics.disk.total * 100).toFixed(1)}%로 임계값 ${thresholds.disk}%를 초과했습니다.`,
                value: metrics.disk.used / metrics.disk.total * 100,
                threshold: thresholds.disk,
                resolved: false
            });
        }

        if (metrics.network.latency > thresholds.network) {
            newAlerts.push({
                id: `network-${Date.now()}`,
                timestamp: new Date().toISOString(),
                type: 'network',
                severity: metrics.network.latency > 2000 ? 'critical' : 'medium',
                message: `네트워크 지연시간이 ${metrics.network.latency}ms로 임계값 ${thresholds.network}ms를 초과했습니다.`,
                value: metrics.network.latency,
                threshold: thresholds.network,
                resolved: false
            });
        }

        if (newAlerts.length > 0) {
            setAlerts(prev => [...newAlerts, ...prev]);
        }
    };

    // 자동 새로고침
    useEffect(() => {
        if (autoRefresh && isMonitoring) {
            const interval = setInterval(fetchPerformanceMetrics, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [autoRefresh, refreshInterval, fetchPerformanceMetrics, isMonitoring]);

    // 모니터링 시작/중지
    const toggleMonitoring = async () => {
        setIsMonitoring(!isMonitoring);
        try {
            if (!isMonitoring) {
                await axios.post(joinApiHealthCheckUrl(CONFIG_API_ORIGIN, PERFORMANCE_MONITOR_START_MONITORING_PATH));
                fetchPerformanceMetrics(); // 즉시 데이터 수집
            } else {
                await axios.post(joinApiHealthCheckUrl(CONFIG_API_ORIGIN, PERFORMANCE_MONITOR_STOP_MONITORING_PATH));
            }
        } catch (err) {
            setError('모니터링 제어 중 오류가 발생했습니다.');
            setIsMonitoring(false);
        }
    };

    // 알림 해결
    const resolveAlert = async (alertId: string) => {
        try {
            await axios.post(
                joinApiHealthCheckUrl(
                    CONFIG_API_ORIGIN,
                    `${PERFORMANCE_MONITOR_ALERTS_PATH_PREFIX}/${encodeURIComponent(alertId)}/resolve`
                )
            );
            setAlerts(prev => prev.map(alert =>
                alert.id === alertId ? { ...alert, resolved: true } : alert
            ));
        } catch (err) {
            setError('알림 해결 중 오류가 발생했습니다.');
        }
    };

    // 알림 상세 보기
    const viewAlertDetail = (alert: PerformanceAlert) => {
        setSelectedAlert(alert);
        setAlertDialogOpen(true);
    };

    // 데이터 내보내기
    const exportData = async () => {
        try {
            const response = await axios.get(joinApiHealthCheckUrl(CONFIG_API_ORIGIN, PERFORMANCE_MONITOR_EXPORT_PATH), {
                params: { format: 'json', timeRange }
            });

            const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `performance-data-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError('데이터 내보내기 중 오류가 발생했습니다.');
        }
    };

    // 에러 닫기
    const handleErrorClose = () => {
        setError(null);
    };

    // 심각도별 색상
    const getSeverityColor = (severity: string): 'error' | 'warning' | 'info' | 'success' | 'default' => {
        switch (severity) {
            case 'critical': return 'error';
            case 'high': return 'warning';
            case 'medium': return 'info';
            case 'low': return 'success';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
                고급 성능 모니터링
            </Typography>

            {/* 실시간 메트릭 카드 */}
            {currentMetrics && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                    <Card sx={{ flex: '1 1 200px' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">CPU 사용률</Typography>
                                    <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                                        {currentMetrics.cpu.usage}%
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {currentMetrics.cpu.cores} 코어, {currentMetrics.cpu.temperature}°C
                                    </Typography>
                                </Box>
                                <MemoryIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={currentMetrics.cpu.usage}
                                sx={{ mt: 1, height: 8 }}
                            />
                        </CardContent>
                    </Card>

                    <Card sx={{ flex: '1 1 200px' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">메모리 사용률</Typography>
                                    <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                                        {((currentMetrics.memory.used / currentMetrics.memory.total) * 100).toFixed(1)}%
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {Math.round(currentMetrics.memory.used / 1024 / 1024 / 1024)}GB / {Math.round(currentMetrics.memory.total / 1024 / 1024 / 1024)}GB
                                    </Typography>
                                </Box>
                                <StorageIcon sx={{ fontSize: 40, color: 'info.main' }} />
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={(currentMetrics.memory.used / currentMetrics.memory.total) * 100}
                                sx={{ mt: 1, height: 8 }}
                            />
                        </CardContent>
                    </Card>

                    <Card sx={{ flex: '1 1 200px' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">디스크 사용률</Typography>
                                    <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                                        {((currentMetrics.disk.used / currentMetrics.disk.total) * 100).toFixed(1)}%
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        읽기: {currentMetrics.disk.readSpeed}MB/s, 쓰기: {currentMetrics.disk.writeSpeed}MB/s
                                    </Typography>
                                </Box>
                                <Storage sx={{ fontSize: 40, color: 'warning.main' }} />
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={(currentMetrics.disk.used / currentMetrics.disk.total) * 100}
                                sx={{ mt: 1, height: 8 }}
                            />
                        </CardContent>
                    </Card>

                    <Card sx={{ flex: '1 1 200px' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">네트워크 지연</Typography>
                                    <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                                        {currentMetrics.network.latency}ms
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        수신: {Math.round(currentMetrics.network.bytesIn / 1024)}KB, 송신: {Math.round(currentMetrics.network.bytesOut / 1024)}KB
                                    </Typography>
                                </Box>
                                <NetworkCheck sx={{ fontSize: 40, color: 'success.main' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            )}

            {/* 컨트롤 패널 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                            모니터링 제어
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={autoRefresh}
                                        onChange={(e) => setAutoRefresh(e.target.checked)}
                                        disabled={!isMonitoring}
                                    />
                                }
                                label="자동 새로고침"
                            />
                            <TextField
                                size="small"
                                label="새로고침 간격(ms)"
                                type="number"
                                value={refreshInterval}
                                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                                sx={{ width: 150 }}
                                disabled={!isMonitoring}
                            />
                            <Button
                                variant={isMonitoring ? "outlined" : "contained"}
                                onClick={toggleMonitoring}
                                startIcon={isMonitoring ? <Pause /> : <PlayArrow />}
                                color={isMonitoring ? "warning" : "primary"}
                            >
                                {isMonitoring ? '모니터링 중지' : '모니터링 시작'}
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={exportData}
                                startIcon={<Download />}
                            >
                                데이터 내보내기
                            </Button>
                        </Box>
                    </Box>

                    {/* 임계값 설정 */}
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>임계값 설정</Typography>
                    <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Box sx={{ minWidth: 200 }}>
                            <Typography variant="body2" color="text.secondary">CPU 임계값</Typography>
                            <Slider
                                value={thresholds.cpu}
                                onChange={(e, value) => setThresholds(prev => ({ ...prev, cpu: value as number }))}
                                min={50}
                                max={100}
                                step={5}
                                marks
                                valueLabelDisplay="auto"
                                valueLabelFormat={(value) => `${value}%`}
                            />
                        </Box>
                        <Box sx={{ minWidth: 200 }}>
                            <Typography variant="body2" color="text.secondary">메모리 임계값</Typography>
                            <Slider
                                value={thresholds.memory}
                                onChange={(e, value) => setThresholds(prev => ({ ...prev, memory: value as number }))}
                                min={50}
                                max={100}
                                step={5}
                                marks
                                valueLabelDisplay="auto"
                                valueLabelFormat={(value) => `${value}%`}
                            />
                        </Box>
                        <Box sx={{ minWidth: 200 }}>
                            <Typography variant="body2" color="text.secondary">디스크 임계값</Typography>
                            <Slider
                                value={thresholds.disk}
                                onChange={(e, value) => setThresholds(prev => ({ ...prev, disk: value as number }))}
                                min={50}
                                max={100}
                                step={5}
                                marks
                                valueLabelDisplay="auto"
                                valueLabelFormat={(value) => `${value}%`}
                            />
                        </Box>
                        <Box sx={{ minWidth: 200 }}>
                            <Typography variant="body2" color="text.secondary">네트워크 지연 임계값</Typography>
                            <Slider
                                value={thresholds.network}
                                onChange={(e, value) => setThresholds(prev => ({ ...prev, network: value as number }))}
                                min={100}
                                max={5000}
                                step={100}
                                marks
                                valueLabelDisplay="auto"
                                valueLabelFormat={(value) => `${value}ms`}
                            />
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* 탭 네비게이션 */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
                    <Tab label="실시간 메트릭" />
                    <Tab label="성능 히스토리" />
                    <Tab label="알림 관리" />
                    <Tab label="프로세스 분석" />
                </Tabs>
            </Box>

            {/* 실시간 메트릭 탭 */}
            {selectedTab === 0 && currentMetrics && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>실시간 시스템 상태</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                            <Box sx={{ flex: '1 1 300px' }}>
                                <Typography variant="subtitle1" sx={{ mb: 1 }}>프로세스 정보</Typography>
                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <Chip label={`총 ${currentMetrics.processes.total}개`} color="primary" />
                                    <Chip label={`실행 ${currentMetrics.processes.running}개`} color="success" />
                                    <Chip label={`대기 ${currentMetrics.processes.sleeping}개`} color="info" />
                                    <Chip label={`좀비 ${currentMetrics.processes.zombie}개`} color="warning" />
                                </Box>
                            </Box>

                            <Box sx={{ flex: '1 1 300px' }}>
                                <Typography variant="subtitle1" sx={{ mb: 1 }}>네트워크 통계</Typography>
                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <Chip label={`수신 패킷: ${currentMetrics.network.packetsIn}`} color="info" />
                                    <Chip label={`송신 패킷: ${currentMetrics.network.packetsOut}`} color="info" />
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* 알림 관리 탭 */}
            {selectedTab === 2 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>성능 알림</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>시간</TableCell>
                                        <TableCell>유형</TableCell>
                                        <TableCell>심각도</TableCell>
                                        <TableCell>메시지</TableCell>
                                        <TableCell>값</TableCell>
                                        <TableCell>상태</TableCell>
                                        <TableCell>액션</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {alerts.slice(0, 20).map((alert) => (
                                        <TableRow key={alert.id}>
                                            <TableCell>{new Date(alert.timestamp).toLocaleTimeString()}</TableCell>
                                            <TableCell>
                                                <Chip label={alert.type.toUpperCase()} size="small" />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={alert.severity}
                                                    size="small"
                                                    color={getSeverityColor(alert.severity)}
                                                />
                                            </TableCell>
                                            <TableCell>{alert.message}</TableCell>
                                            <TableCell>{alert.value}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={alert.resolved ? '해결됨' : '활성'}
                                                    size="small"
                                                    color={alert.resolved ? 'success' : 'warning'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {!alert.resolved && (
                                                    <Button
                                                        size="small"
                                                        onClick={() => resolveAlert(alert.id)}
                                                    >
                                                        해결
                                                    </Button>
                                                )}
                                                <IconButton
                                                    size="small"
                                                    onClick={() => viewAlertDetail(alert)}
                                                >
                                                    <Visibility />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {/* 알림 상세 다이얼로그 */}
            <Dialog
                open={alertDialogOpen}
                onClose={() => setAlertDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>알림 상세 정보</DialogTitle>
                <DialogContent>
                    {selectedAlert && (
                        <Box>
                            <Typography variant="h6" sx={{ mb: 2 }}>기본 정보</Typography>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">유형</Typography>
                                <Typography variant="body1">{selectedAlert.type.toUpperCase()}</Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">심각도</Typography>
                                <Chip
                                    label={selectedAlert.severity}
                                    color={getSeverityColor(selectedAlert.severity)}
                                />
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">메시지</Typography>
                                <Typography variant="body1">{selectedAlert.message}</Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">현재 값</Typography>
                                <Typography variant="body1">{selectedAlert.value}</Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">임계값</Typography>
                                <Typography variant="body1">{selectedAlert.threshold}</Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">발생 시간</Typography>
                                <Typography variant="body1">{new Date(selectedAlert.timestamp).toLocaleString()}</Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAlertDialogOpen(false)}>닫기</Button>
                    {selectedAlert && !selectedAlert.resolved && (
                        <Button
                            onClick={() => {
                                resolveAlert(selectedAlert.id);
                                setAlertDialogOpen(false);
                            }}
                            color="primary"
                        >
                            해결
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* 에러 알림 */}
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={handleErrorClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleErrorClose} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdvancedPerformanceMonitor;
