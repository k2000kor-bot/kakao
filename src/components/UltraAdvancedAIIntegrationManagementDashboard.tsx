import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    Tooltip,
    LinearProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Switch,
    FormControlLabel,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Badge,
    Alert,
    TextField,
    InputAdornment,
    Tabs,
    Tab,
    Divider,
    CircularProgress,
    Slider,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    Link,
    PlayArrow,
    Pause,
    Stop,
    Refresh,
    Add,
    Delete,
    Edit,
    Visibility,
    Settings,
    Timeline,
    Assessment,
    Build,
    ExpandMore,
    CheckCircle,
    Warning,
    Error,
    Schedule,
    Speed,
    Memory,
    Storage,
    NetworkCheck,
    Cpu,
    TrendingUp,
    TrendingDown,
    TrendingFlat,
    AutoFixHigh,
    Tune,
    Optimization,
    Analytics,
    SmartToy,
    Psychology,
    Science,
    Code,
    DataUsage,
    Workflow,
    Task,
    Queue,
    PriorityHigh,
    PriorityMedium,
    PriorityLow,
    CriticalPriority,
    IntegrationInstructions,
    Hub,
    Api,
    CloudSync,
    Sync,
    SyncDisabled,
    RestartAlt,
    PowerSettingsNew
} from '@mui/icons-material';
import ultraAdvancedAIIntegrationManager, {
    AIIntegrationConfig,
    AIIntegrationMetrics,
    AIIntegrationEvent
} from '../services/ultraAdvancedAIIntegrationManager';

interface IntegrationDashboardState {
    integrations: AIIntegrationConfig[];
    metrics: AIIntegrationMetrics;
    events: AIIntegrationEvent[];
    selectedIntegration: AIIntegrationConfig | null;
    showIntegrationDetails: boolean;
    showCreateDialog: boolean;
    showEventLog: boolean;
    selectedEvents: AIIntegrationEvent[];
}

const UltraAdvancedAIIntegrationManagementDashboard: React.FC = () => {
    const [state, setState] = useState<IntegrationDashboardState>({
        integrations: [],
        metrics: ultraAdvancedAIIntegrationManager.getMetrics(),
        events: [],
        selectedIntegration: null,
        showIntegrationDetails: false,
        showCreateDialog: false,
        showEventLog: false,
        selectedEvents: []
    });

    const [activeTab, setActiveTab] = useState(0);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(3000);

    // 새 통합 생성 폼 상태
    const [createForm, setCreateForm] = useState({
        id: '',
        name: '',
        description: '',
        type: 'service' as AIIntegrationConfig['type'],
        priority: 'medium' as AIIntegrationConfig['priority'],
        dependencies: [] as string[],
        settings: {} as Record<string, any>,
        tags: [] as string[]
    });

    useEffect(() => {
        const updateData = () => {
            setState(prev => ({
                ...prev,
                integrations: ultraAdvancedAIIntegrationManager.getIntegrations(),
                metrics: ultraAdvancedAIIntegrationManager.getMetrics(),
                events: ultraAdvancedAIIntegrationManager.getEvents(100)
            }));
        };

        // 초기 데이터 로드
        updateData();

        // 이벤트 리스너 등록
        const handleIntegrationRegistered = (integration: AIIntegrationConfig) => {
            setState(prev => ({
                ...prev,
                integrations: [...prev.integrations, integration]
            }));
        };

        const handleIntegrationUpdated = (integration: AIIntegrationConfig) => {
            setState(prev => ({
                ...prev,
                integrations: prev.integrations.map(i => i.id === integration.id ? integration : i)
            }));
        };

        const handleEventLogged = (event: AIIntegrationEvent) => {
            setState(prev => ({
                ...prev,
                events: [...prev.events, event].slice(-100) // 최근 100개만 유지
            }));
        };

        const handleMetricsUpdated = (metrics: AIIntegrationMetrics) => {
            setState(prev => ({
                ...prev,
                metrics
            }));
        };

        ultraAdvancedAIIntegrationManager.on('integration_registered', handleIntegrationRegistered);
        ultraAdvancedAIIntegrationManager.on('integration_updated', handleIntegrationUpdated);
        ultraAdvancedAIIntegrationManager.on('event_logged', handleEventLogged);
        ultraAdvancedAIIntegrationManager.on('metrics_updated', handleMetricsUpdated);

        // 자동 새로고침
        if (autoRefresh) {
            const interval = setInterval(updateData, refreshInterval);
            return () => {
                clearInterval(interval);
                ultraAdvancedAIIntegrationManager.off('integration_registered', handleIntegrationRegistered);
                ultraAdvancedAIIntegrationManager.off('integration_updated', handleIntegrationUpdated);
                ultraAdvancedAIIntegrationManager.off('event_logged', handleEventLogged);
                ultraAdvancedAIIntegrationManager.off('metrics_updated', handleMetricsUpdated);
            };
        }

        return () => {
            ultraAdvancedAIIntegrationManager.off('integration_registered', handleIntegrationRegistered);
            ultraAdvancedAIIntegrationManager.off('integration_updated', handleIntegrationUpdated);
            ultraAdvancedAIIntegrationManager.off('event_logged', handleEventLogged);
            ultraAdvancedAIIntegrationManager.off('metrics_updated', handleMetricsUpdated);
        };
    }, [autoRefresh, refreshInterval]);

    const handleCreateIntegration = async () => {
        try {
            await ultraAdvancedAIIntegrationManager.registerIntegration({
                id: createForm.id,
                name: createForm.name,
                type: createForm.type,
                status: 'active',
                priority: createForm.priority,
                dependencies: createForm.dependencies,
                settings: createForm.settings,
                metadata: {
                    created_at: new Date(),
                    updated_at: new Date(),
                    version: '1.0.0',
                    description: createForm.description,
                    author: 'CORBU.AI',
                    tags: createForm.tags
                }
            });
            setCreateForm({
                id: '',
                name: '',
                description: '',
                type: 'service',
                priority: 'medium',
                dependencies: [],
                settings: {},
                tags: []
            });
            setState(prev => ({ ...prev, showCreateDialog: false }));
        } catch (error) {
            console.error('통합 생성 실패:', error);
        }
    };

    const handleIntegrationClick = (integration: AIIntegrationConfig) => {
        setState(prev => ({
            ...prev,
            selectedIntegration: integration,
            showIntegrationDetails: true
        }));
    };

    const handleActivateIntegration = async (integrationId: string) => {
        try {
            await ultraAdvancedAIIntegrationManager.activateIntegration(integrationId);
        } catch (error) {
            console.error('통합 활성화 실패:', error);
        }
    };

    const handleDeactivateIntegration = async (integrationId: string) => {
        try {
            await ultraAdvancedAIIntegrationManager.deactivateIntegration(integrationId);
        } catch (error) {
            console.error('통합 비활성화 실패:', error);
        }
    };

    const handleRestartIntegration = async (integrationId: string) => {
        try {
            await ultraAdvancedAIIntegrationManager.restartIntegration(integrationId);
        } catch (error) {
            console.error('통합 재시작 실패:', error);
        }
    };

    const handleRemoveIntegration = async (integrationId: string) => {
        try {
            await ultraAdvancedAIIntegrationManager.removeIntegration(integrationId);
        } catch (error) {
            console.error('통합 제거 실패:', error);
        }
    };

    const handleTriggerWorkflow = async (integrationId: string) => {
        try {
            const result = await ultraAdvancedAIIntegrationManager.triggerWorkflow(integrationId, {
                test: true,
                timestamp: new Date()
            });
            console.log('워크플로우 실행 결과:', result);
        } catch (error) {
            console.error('워크플로우 실행 실패:', error);
        }
    };

    const handlePerformAnalysis = async (integrationId: string) => {
        try {
            const result = await ultraAdvancedAIIntegrationManager.performAnalysis(integrationId, {
                text: '테스트 분석 데이터',
                timestamp: new Date()
            });
            console.log('분석 결과:', result);
        } catch (error) {
            console.error('분석 실패:', error);
        }
    };

    const handleOptimizePerformance = async (integrationId: string) => {
        try {
            const result = await ultraAdvancedAIIntegrationManager.optimizePerformance(integrationId, 'system');
            console.log('최적화 결과:', result);
        } catch (error) {
            console.error('최적화 실패:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'success';
            case 'inactive': return 'default';
            case 'error': return 'error';
            case 'maintenance': return 'warning';
            default: return 'default';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'service': return <Api />;
            case 'workflow': return <Workflow />;
            case 'analysis': return <Analytics />;
            case 'optimization': return <Optimization />;
            default: return <IntegrationInstructions />;
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'critical': return <CriticalPriority />;
            case 'high': return <PriorityHigh />;
            case 'medium': return <PriorityMedium />;
            case 'low': return <PriorityLow />;
            default: return <PriorityMedium />;
        }
    };

    const getHealthColor = (health: string) => {
        switch (health) {
            case 'excellent': return 'success';
            case 'good': return 'primary';
            case 'fair': return 'warning';
            case 'poor': return 'error';
            default: return 'default';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'info': return 'info';
            case 'warning': return 'warning';
            case 'error': return 'error';
            case 'critical': return 'error';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Link color="primary" />
                고도화된 AI 통합 관리 대시보드
            </Typography>

            {/* 제어 패널 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={autoRefresh}
                                        onChange={(e) => setAutoRefresh(e.target.checked)}
                                    />
                                }
                                label="자동 새로고침"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={ultraAdvancedAIIntegrationManager.isInitialized()}
                                        disabled
                                    />
                                }
                                label="통합 관리 시스템 활성"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={() => setState(prev => ({ ...prev, showCreateDialog: true }))}
                                >
                                    통합 추가
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<Timeline />}
                                    onClick={() => setState(prev => ({ ...prev, showEventLog: true }))}
                                >
                                    이벤트 로그
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<Refresh />}
                                    onClick={() => window.location.reload()}
                                >
                                    새로고침
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* 시스템 상태 */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                총 통합
                            </Typography>
                            <Typography variant="h4">
                                {state.metrics.total_integrations}
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={(state.metrics.total_integrations / 20) * 100}
                                sx={{ mt: 1 }}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                활성 통합
                            </Typography>
                            <Typography variant="h4">
                                {state.metrics.active_integrations}
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={state.metrics.total_integrations > 0 ? (state.metrics.active_integrations / state.metrics.total_integrations) * 100 : 0}
                                sx={{ mt: 1 }}
                                color="success"
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                성능 점수
                            </Typography>
                            <Typography variant="h4">
                                {(state.metrics.performance_score * 100).toFixed(1)}%
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={state.metrics.performance_score * 100}
                                sx={{ mt: 1 }}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                시스템 상태
                            </Typography>
                            <Typography variant="h4">
                                <Chip
                                    label={state.metrics.health_status}
                                    color={getHealthColor(state.metrics.health_status) as any}
                                    size="small"
                                />
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 탭 네비게이션 */}
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
                <Tab label="통합 관리" icon={<Hub />} />
                <Tab label="리소스 모니터링" icon={<DataUsage />} />
                <Tab label="성능 분석" icon={<Assessment />} />
                <Tab label="의존성 관리" icon={<AccountTree />} />
            </Tabs>

            {/* 통합 관리 탭 */}
            {activeTab === 0 && (
                <Grid container spacing={3}>
                    {state.integrations.map((integration) => (
                        <Grid item xs={12} md={6} key={integration.id}>
                            <Card
                                sx={{ cursor: 'pointer' }}
                                onClick={() => handleIntegrationClick(integration)}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {getTypeIcon(integration.type)}
                                            <Typography variant="h6">
                                                {integration.name}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={integration.status}
                                            color={getStatusColor(integration.status) as any}
                                            size="small"
                                        />
                                    </Box>
                                    <Typography color="textSecondary" gutterBottom>
                                        {integration.metadata.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {getPriorityIcon(integration.priority)}
                                            <Typography variant="body2">
                                                {integration.priority}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="textSecondary">
                                            v{integration.metadata.version}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {integration.metadata.tags.map((tag, index) => (
                                            <Chip key={index} label={tag} size="small" variant="outlined" />
                                        ))}
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                        {integration.status === 'active' ? (
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeactivateIntegration(integration.id);
                                                }}
                                            >
                                                <Pause />
                                            </IconButton>
                                        ) : (
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleActivateIntegration(integration.id);
                                                }}
                                            >
                                                <PlayArrow />
                                            </IconButton>
                                        )}
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRestartIntegration(integration.id);
                                            }}
                                        >
                                            <RestartAlt />
                                        </IconButton>
                                        {integration.type === 'workflow' && (
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTriggerWorkflow(integration.id);
                                                }}
                                            >
                                                <PlayArrow />
                                            </IconButton>
                                        )}
                                        {integration.type === 'analysis' && (
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePerformAnalysis(integration.id);
                                                }}
                                            >
                                                <Analytics />
                                            </IconButton>
                                        )}
                                        {integration.type === 'optimization' && (
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOptimizePerformance(integration.id);
                                                }}
                                            >
                                                <Optimization />
                                            </IconButton>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* 리소스 모니터링 탭 */}
            {activeTab === 1 && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    CPU 사용률
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Cpu color="primary" />
                                    <Typography variant="h4">
                                        {(state.metrics.resource_usage.cpu * 100).toFixed(1)}%
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={state.metrics.resource_usage.cpu * 100}
                                    sx={{ mt: 2 }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    메모리 사용률
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Memory color="primary" />
                                    <Typography variant="h4">
                                        {(state.metrics.resource_usage.memory * 100).toFixed(1)}%
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={state.metrics.resource_usage.memory * 100}
                                    sx={{ mt: 2 }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    네트워크 사용률
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <NetworkCheck color="primary" />
                                    <Typography variant="h4">
                                        {(state.metrics.resource_usage.network * 100).toFixed(1)}%
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={state.metrics.resource_usage.network * 100}
                                    sx={{ mt: 2 }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    스토리지 사용률
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Storage color="primary" />
                                    <Typography variant="h4">
                                        {(state.metrics.resource_usage.storage * 100).toFixed(1)}%
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={state.metrics.resource_usage.storage * 100}
                                    sx={{ mt: 2 }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* 성능 분석 탭 */}
            {activeTab === 2 && (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    성능 메트릭
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={3}>
                                        <Box>
                                            <Typography color="textSecondary">성공률</Typography>
                                            <Typography variant="h4">
                                                {(state.metrics.success_rate * 100).toFixed(1)}%
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <Box>
                                            <Typography color="textSecondary">오류 수</Typography>
                                            <Typography variant="h4">
                                                {state.metrics.error_count}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <Box>
                                            <Typography color="textSecondary">평균 응답 시간</Typography>
                                            <Typography variant="h4">
                                                {state.metrics.average_response_time.toFixed(0)}ms
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <Box>
                                            <Typography color="textSecondary">성능 점수</Typography>
                                            <Typography variant="h4">
                                                {(state.metrics.performance_score * 100).toFixed(1)}%
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* 의존성 관리 탭 */}
            {activeTab === 3 && (
                <Grid container spacing={3}>
                    {state.integrations.map((integration) => (
                        <Grid item xs={12} md={6} key={integration.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {integration.name}
                                    </Typography>
                                    <Typography color="textSecondary" gutterBottom>
                                        의존성: {integration.dependencies.length}개
                                    </Typography>
                                    {integration.dependencies.length > 0 && (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {integration.dependencies.map((depId) => {
                                                const dep = state.integrations.find(i => i.id === depId);
                                                return (
                                                    <Chip
                                                        key={depId}
                                                        label={dep ? dep.name : depId}
                                                        color={dep?.status === 'active' ? 'success' : 'error'}
                                                        size="small"
                                                    />
                                                );
                                            })}
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* 통합 상세 다이얼로그 */}
            <Dialog open={state.showIntegrationDetails} onClose={() => setState(prev => ({ ...prev, showIntegrationDetails: false }))} maxWidth="md" fullWidth>
                <DialogTitle>
                    통합 상세 정보
                </DialogTitle>
                <DialogContent>
                    {state.selectedIntegration && (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                {state.selectedIntegration.name}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                {state.selectedIntegration.metadata.description}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                버전: {state.selectedIntegration.metadata.version}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                작성자: {state.selectedIntegration.metadata.author}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                생성일: {state.selectedIntegration.metadata.created_at.toLocaleString()}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                수정일: {state.selectedIntegration.metadata.updated_at.toLocaleString()}
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    설정:
                                </Typography>
                                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                    <pre style={{ whiteSpace: 'pre-wrap' }}>
                                        {JSON.stringify(state.selectedIntegration.settings, null, 2)}
                                    </pre>
                                </Paper>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setState(prev => ({ ...prev, showIntegrationDetails: false }))}>
                        닫기
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 이벤트 로그 다이얼로그 */}
            <Dialog open={state.showEventLog} onClose={() => setState(prev => ({ ...prev, showEventLog: false }))} maxWidth="lg" fullWidth>
                <DialogTitle>
                    이벤트 로그
                </DialogTitle>
                <DialogContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>시간</TableCell>
                                    <TableCell>통합</TableCell>
                                    <TableCell>이벤트</TableCell>
                                    <TableCell>심각도</TableCell>
                                    <TableCell>데이터</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {state.events.map((event) => (
                                    <TableRow key={event.id}>
                                        <TableCell>
                                            {event.timestamp.toLocaleTimeString()}
                                        </TableCell>
                                        <TableCell>
                                            {event.integration_id}
                                        </TableCell>
                                        <TableCell>
                                            {event.type}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={event.severity}
                                                color={getSeverityColor(event.severity) as any}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" noWrap>
                                                {JSON.stringify(event.data).substring(0, 50)}...
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setState(prev => ({ ...prev, showEventLog: false }))}>
                        닫기
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 통합 생성 다이얼로그 */}
            <Dialog open={state.showCreateDialog} onClose={() => setState(prev => ({ ...prev, showCreateDialog: false }))} maxWidth="sm" fullWidth>
                <DialogTitle>
                    새 통합 생성
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="통합 ID"
                            value={createForm.id}
                            onChange={(e) => setCreateForm(prev => ({ ...prev, id: e.target.value }))}
                            fullWidth
                        />
                        <TextField
                            label="이름"
                            value={createForm.name}
                            onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                            fullWidth
                        />
                        <TextField
                            label="설명"
                            value={createForm.description}
                            onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                            fullWidth
                            multiline
                            rows={2}
                        />
                        <FormControl fullWidth>
                            <InputLabel>타입</InputLabel>
                            <Select
                                value={createForm.type}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, type: e.target.value as AIIntegrationConfig['type'] }))}
                            >
                                <MenuItem value="service">서비스</MenuItem>
                                <MenuItem value="workflow">워크플로우</MenuItem>
                                <MenuItem value="analysis">분석</MenuItem>
                                <MenuItem value="optimization">최적화</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>우선순위</InputLabel>
                            <Select
                                value={createForm.priority}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, priority: e.target.value as AIIntegrationConfig['priority'] }))}
                            >
                                <MenuItem value="low">낮음</MenuItem>
                                <MenuItem value="medium">보통</MenuItem>
                                <MenuItem value="high">높음</MenuItem>
                                <MenuItem value="critical">긴급</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setState(prev => ({ ...prev, showCreateDialog: false }))}>
                        취소
                    </Button>
                    <Button
                        onClick={handleCreateIntegration}
                        variant="contained"
                    >
                        생성
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UltraAdvancedAIIntegrationManagementDashboard;
