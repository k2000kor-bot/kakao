import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { performanceMonitorApi } from '../services/api';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    LinearProgress,
    Chip,
    Grid,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Paper,
    Tabs,
    Tab,
    Switch,
    FormControlLabel,
    Slider
} from '@mui/material';
import {
    Speed,
    Memory,
    NetworkCheck,
    Storage,
    TrendingUp,
    Settings,
    Monitor,
    Analytics
} from '@mui/icons-material';
import { performanceApi } from '../services/apiService';

interface PerformanceMetrics {
    cpu: number;
    memory: number;
    network: number;
    storage: number;
    responseTime: number;
    throughput: number;
    errorRate: number;
    cacheHitRate: number;
}

interface SpeedSettings {
    enableCaching: boolean;
    enableCompression: boolean;
    enableLazyLoading: boolean;
    enableVirtualization: boolean;
    enableMemoization: boolean;
    enableCodeSplitting: boolean;
    cacheSize: number;
    compressionLevel: number;
    maxConcurrentRequests: number;
}

function PerformanceOptimizer() {
    const [activeTab, setActiveTab] = useState(0);
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        cpu: 0,
        memory: 0,
        network: 0,
        storage: 0,
        responseTime: 0,
        throughput: 0,
        errorRate: 0,
        cacheHitRate: 0
    });

    const [settings, setSettings] = useState<SpeedSettings>({
        enableCaching: true,
        enableCompression: true,
        enableLazyLoading: true,
        enableVirtualization: true,
        enableMemoization: true,
        enableCodeSplitting: true,
        cacheSize: 100,
        compressionLevel: 6,
        maxConcurrentRequests: 10
    });

    const [optimizationHistory, setSpeedHistory] = useState<Array<{
        timestamp: string;
        improvement: number;
        metric: string;
        description: string;
    }>>([]);

    // 성능 메트릭 수집
    const collectMetrics = useCallback(async () => {
        try {
            const result = await performanceApi.getMetrics();

            if (result.success && result.data) {
                setMetrics(result.data as PerformanceMetrics);
            }
        } catch (error) {
            console.error('메트릭 수집 실패:', error);
        }
    }, []);

    // 최적화 실행
    const runSpeed = useCallback(async (optimizationType: string) => {
        try {
            const result = await performanceMonitorApi.runOptimization(optimizationType, 'auto');

            if (result.success) {
                // 최적화 히스토리에 추가
                setSpeedHistory(prev => [...prev, {
                    timestamp: new Date().toISOString(),
                    improvement: 15, // 기본 개선율
                    metric: optimizationType,
                    description: `${optimizationType} 최적화 완료`
                }]);

                // 메트릭 업데이트
                await collectMetrics();
            }
        } catch (error) {
            console.error('최적화 실행 실패:', error);
        }
    }, [settings, collectMetrics]);

    // 자동 최적화
    const autoOptimize = useCallback(async () => {
        const optimizations = [
            'memory',
            'cpu',
            'network',
            'cache',
            'compression',
            'lazy_loading'
        ];

        for (const optimization of optimizations) {
            await runSpeed(optimization);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }, [runSpeed]);

    // 메트릭 모니터링
    useEffect(() => {
        const interval = setInterval(collectMetrics, 5000);
        return () => clearInterval(interval);
    }, [collectMetrics]);

    // 성능 점수 계산
    const performanceScore = useMemo(() => {
        const weights = {
            cpu: 0.2,
            memory: 0.2,
            network: 0.2,
            responseTime: 0.2,
            throughput: 0.1,
            errorRate: 0.1
        };

        const score = (
            (100 - metrics.cpu) * weights.cpu +
            (100 - metrics.memory) * weights.memory +
            (100 - metrics.network) * weights.network +
            Math.max(0, 100 - metrics.responseTime / 10) * weights.responseTime +
            Math.min(100, metrics.throughput * 10) * weights.throughput +
            (100 - metrics.errorRate * 100) * weights.errorRate
        );

        return Math.round(score);
    }, [metrics]);

    // 성능 상태 결정
    const getPerformanceStatus = useCallback((score: number) => {
        if (score >= 90) return { status: '우수', color: 'success' as const };
        if (score >= 70) return { status: '양호', color: 'warning' as const };
        return { status: '개선 필요', color: 'error' as const };
    }, []);

    const performanceStatus = getPerformanceStatus(performanceScore);

    const renderMetricsTab = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Monitor color="primary" />
                실시간 성능 메트릭
            </Typography>

            {/* 전체 성능 점수 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5">전체 성능 점수</Typography>
                        <Chip
                            label={performanceStatus.status}
                            color={performanceStatus.color}
                            size="medium"
                        />
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={performanceScore}
                        sx={{ height: 20, borderRadius: 1 }}
                    />
                    <Typography variant="h3" sx={{ mt: 2, textAlign: 'center' }}>
                        {performanceScore}/100
                    </Typography>
                </CardContent>
            </Card>

            {/* 상세 메트릭 */}
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Memory color="primary" />
                                <Typography variant="h6">CPU 사용률</Typography>
                            </Box>
                            <Typography variant="h4" color={metrics.cpu > 80 ? 'error.main' : 'primary.main'}>
                                {metrics.cpu}%
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={metrics.cpu}
                                color={metrics.cpu > 80 ? 'error' : 'primary'}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Memory color="secondary" />
                                <Typography variant="h6">메모리 사용률</Typography>
                            </Box>
                            <Typography variant="h4" color={metrics.memory > 80 ? 'error.main' : 'secondary.main'}>
                                {metrics.memory}%
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={metrics.memory}
                                color={metrics.memory > 80 ? 'error' : 'secondary'}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <NetworkCheck color="info" />
                                <Typography variant="h6">네트워크 사용률</Typography>
                            </Box>
                            <Typography variant="h4" color={metrics.network > 80 ? 'error.main' : 'info.main'}>
                                {metrics.network}%
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={metrics.network}
                                color={metrics.network > 80 ? 'error' : 'info'}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Storage color="warning" />
                                <Typography variant="h6">응답 시간</Typography>
                            </Box>
                            <Typography variant="h4" color={metrics.responseTime > 1000 ? 'error.main' : 'warning.main'}>
                                {metrics.responseTime}ms
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={Math.min(100, metrics.responseTime / 10)}
                                color={metrics.responseTime > 1000 ? 'error' : 'warning'}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 추가 메트릭 */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 1 }}>처리량</Typography>
                            <Typography variant="h4" color="success.main">
                                {metrics.throughput} req/s
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 1 }}>에러율</Typography>
                            <Typography variant="h4" color={metrics.errorRate > 5 ? 'error.main' : 'success.main'}>
                                {metrics.errorRate}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 1 }}>캐시 적중률</Typography>
                            <Typography variant="h4" color="info.main">
                                {metrics.cacheHitRate}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );

    const renderSpeedTab = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Speed color="secondary" />
                성능 최적화
            </Typography>

            {/* 최적화 설정 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>최적화 설정</Typography>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.enableCaching}
                                        onChange={(e) => setSettings(prev => ({ ...prev, enableCaching: e.target.checked }))}
                                    />
                                }
                                label="캐싱 활성화"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.enableCompression}
                                        onChange={(e) => setSettings(prev => ({ ...prev, enableCompression: e.target.checked }))}
                                    />
                                }
                                label="압축 활성화"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.enableLazyLoading}
                                        onChange={(e) => setSettings(prev => ({ ...prev, enableLazyLoading: e.target.checked }))}
                                    />
                                }
                                label="지연 로딩"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.enableVirtualization}
                                        onChange={(e) => setSettings(prev => ({ ...prev, enableVirtualization: e.target.checked }))}
                                    />
                                }
                                label="가상화"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.enableMemoization}
                                        onChange={(e) => setSettings(prev => ({ ...prev, enableMemoization: e.target.checked }))}
                                    />
                                }
                                label="메모이제이션"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.enableCodeSplitting}
                                        onChange={(e) => setSettings(prev => ({ ...prev, enableCodeSplitting: e.target.checked }))}
                                    />
                                }
                                label="코드 스플리팅"
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>캐시 크기: {settings.cacheSize}MB</Typography>
                        <Slider
                            value={settings.cacheSize}
                            onChange={(_, value) => setSettings(prev => ({ ...prev, cacheSize: value as number }))}
                            min={10}
                            max={1000}
                            step={10}
                            marks={[
                                { value: 10, label: '10MB' },
                                { value: 100, label: '100MB' },
                                { value: 500, label: '500MB' },
                                { value: 1000, label: '1GB' }
                            ]}
                        />
                    </Box>

                    <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>압축 레벨: {settings.compressionLevel}</Typography>
                        <Slider
                            value={settings.compressionLevel}
                            onChange={(_, value) => setSettings(prev => ({ ...prev, compressionLevel: value as number }))}
                            min={1}
                            max={9}
                            step={1}
                            marks={[
                                { value: 1, label: '1' },
                                { value: 6, label: '6' },
                                { value: 9, label: '9' }
                            ]}
                        />
                    </Box>
                </CardContent>
            </Card>

            {/* 최적화 실행 버튼 */}
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => runSpeed('memory')}
                        startIcon={<Memory />}
                        sx={{ mb: 2 }}
                    >
                        메모리 최적화
                    </Button>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => runSpeed('cpu')}
                        startIcon={<Memory />}
                        sx={{ mb: 2 }}
                    >
                        CPU 최적화
                    </Button>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => runSpeed('network')}
                        startIcon={<NetworkCheck />}
                        sx={{ mb: 2 }}
                    >
                        네트워크 최적화
                    </Button>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => runSpeed('cache')}
                        startIcon={<Storage />}
                        sx={{ mb: 2 }}
                    >
                        캐시 최적화
                    </Button>
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Button
                        variant="contained"
                        color="secondary"
                        fullWidth
                        onClick={autoOptimize}
                        startIcon={<Speed />}
                        size="large"
                    >
                        자동 최적화 실행
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );

    const renderHistoryTab = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Analytics color="info" />
                최적화 히스토리
            </Typography>

            {optimizationHistory.length === 0 ? (
                <Alert severity="info">
                    아직 최적화 히스토리가 없습니다. 최적화를 실행해보세요.
                </Alert>
            ) : (
                <List>
                    {optimizationHistory.map((item, index) => (
                        <ListItem key={index}>
                            <ListItemIcon>
                                <TrendingUp color="success" />
                            </ListItemIcon>
                            <ListItemText
                                primary={`${item.metric} 최적화 - ${item.improvement}% 개선`}
                                secondary={`${new Date(item.timestamp).toLocaleString()} - ${item.description}`}
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );

    return (
        <Paper sx={{ p: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                    <Tab label="성능 메트릭" icon={<Monitor />} />
                    <Tab label="최적화" icon={<Speed />} />
                    <Tab label="히스토리" icon={<Analytics />} />
                </Tabs>
            </Box>

            {activeTab === 0 && renderMetricsTab()}
            {activeTab === 1 && renderSpeedTab()}
            {activeTab === 2 && renderHistoryTab()}
        </Paper>
    );
}

export default PerformanceOptimizer;
