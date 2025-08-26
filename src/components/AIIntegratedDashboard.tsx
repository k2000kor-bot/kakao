import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Chip,
    LinearProgress,
    Avatar,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Tabs,
    Tab,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    AlertTitle,
    CircularProgress,
    Tooltip,
    Badge,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Switch,
    FormControlLabel
} from '@mui/material';
import {
    Hub as HubIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    Refresh as RefreshIcon,
    Fullscreen as FullscreenIcon,
    FullscreenExit as FullscreenExitIcon,
    PlayArrow as PlayArrowIcon,
    Stop as StopIcon,
    RestartAlt as RestartIcon,
    Timeline as TimelineIcon,
    Memory as MemoryIcon,
    Speed as SpeedIcon,
    Storage as StorageIcon,
    NetworkCheck as NetworkIcon,
    Computer as ComputerIcon,
    Cloud as CloudIcon,
    Security as SecurityIcon,
    Notifications as NotificationsIcon,
    Settings as SettingsIcon,
    ExpandMore as ExpandMoreIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Analytics as AnalyticsIcon,
    Psychology as PsychologyIcon,
    AutoAwesome as AutoAwesomeIcon,
    School as SchoolIcon,
    Assessment as AssessmentIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import aiOrchestrationService, {
    AIServiceStatus,
    AISystemOverview,
    AIAlert,
    AIWorkflow,
    AIResourceUsage
} from '../services/aiOrchestrationService';

interface AIIntegratedDashboardProps {
    userId: string;
    sessionId: string;
}

// 스타일드 컴포넌트
const DashboardContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
    minHeight: '100vh'
}));

const StatusCard = styled(Card)<{ $status?: string }>(({ theme, $status }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    border: `2px solid ${$status === 'active' ? theme.palette.success.main :
        $status === 'inactive' ? theme.palette.warning.main :
            $status === 'error' ? theme.palette.error.main :
                theme.palette.info.main
        }`,
    background: `linear-gradient(135deg, ${$status === 'active' ? theme.palette.success.main + '15' :
        $status === 'inactive' ? theme.palette.warning.main + '15' :
            $status === 'error' ? theme.palette.error.main + '15' :
                theme.palette.info.main + '15'
        }, ${theme.palette.background.paper})`
}));

const AlertCard = styled(Card)<{ $severity: string }>(({ theme, $severity }) => ({
    marginBottom: theme.spacing(2),
    border: `2px solid ${$severity === 'critical' ? theme.palette.error.main :
        $severity === 'high' ? theme.palette.error.light :
            $severity === 'medium' ? theme.palette.warning.main :
                theme.palette.info.main
        }`,
    background: `linear-gradient(135deg, ${$severity === 'critical' ? theme.palette.error.main + '20' :
        $severity === 'high' ? theme.palette.error.light + '20' :
            $severity === 'medium' ? theme.palette.warning.main + '20' :
                theme.palette.info.main + '20'
        }, ${theme.palette.background.paper})`
}));

const AIIntegratedDashboard: React.FC<AIIntegratedDashboardProps> = ({ userId, sessionId }) => {
    const [currentTab, setCurrentTab] = useState(0);
    const [systemOverview, setSystemOverview] = useState<AISystemOverview | null>(null);
    const [services, setServices] = useState<AIServiceStatus[]>([]);
    const [alerts, setAlerts] = useState<AIAlert[]>([]);
    const [workflows, setWorkflows] = useState<AIWorkflow[]>([]);
    const [statistics, setStatistics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [fullscreen, setFullscreen] = useState(false);
    const [selectedService, setSelectedService] = useState<AIServiceStatus | null>(null);
    const [selectedAlert, setSelectedAlert] = useState<AIAlert | null>(null);
    const [selectedWorkflow, setSelectedWorkflow] = useState<AIWorkflow | null>(null);
    const [serviceDialog, setServiceDialog] = useState(false);
    const [alertDialog, setAlertDialog] = useState(false);
    const [workflowDialog, setWorkflowDialog] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [isRestarting, setIsRestarting] = useState<string | null>(null);

    // 데이터 로드
    const loadData = async () => {
        try {
            setLoading(true);

            // 시스템 개요 가져오기
            const overview = aiOrchestrationService.getSystemOverview();
            setSystemOverview(overview);

            // 서비스 상태 가져오기
            const serviceStatuses = aiOrchestrationService.getServiceStatuses();
            setServices(serviceStatuses);

            // 활성 알림 가져오기
            const activeAlerts = aiOrchestrationService.getActiveAlerts();
            setAlerts(activeAlerts);

            // 워크플로우 가져오기
            const workflowList = aiOrchestrationService.getWorkflows();
            setWorkflows(workflowList);

            // 통계 정보 가져오기
            const stats = aiOrchestrationService.getStatistics();
            setStatistics(stats);

        } catch (error) {
            console.error('통합 대시보드 데이터 로드 오류:', error);
        } finally {
            setLoading(false);
        }
    };

    // 자동 새로고침
    useEffect(() => {
        loadData();

        let interval: NodeJS.Timeout | null = null;
        if (autoRefresh) {
            interval = setInterval(loadData, 5000); // 5초마다 새로고침
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [userId, sessionId, autoRefresh]);

    // 서비스 상태 색상 가져오기
    const getServiceStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'success';
            case 'inactive': return 'warning';
            case 'error': return 'error';
            default: return 'info';
        }
    };

    // 알림 심각도 색상 가져오기
    const getAlertSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'error';
            case 'high': return 'error';
            case 'medium': return 'warning';
            default: return 'info';
        }
    };

    // 서비스 아이콘 가져오기
    const getServiceIcon = (serviceId: string) => {
        switch (serviceId) {
            case 'integrated-ai': return <HubIcon />;
            case 'ai-psychology': return <PsychologyIcon />;
            case 'predictive-analytics': return <AnalyticsIcon />;
            case 'performance-monitor': return <SpeedIcon />;
            case 'user-experience': return <AssessmentIcon />;
            case 'conversation-memory': return <MemoryIcon />;
            case 'learning-experience': return <SchoolIcon />;
            case 'performance-analytics': return <TimelineIcon />;
            case 'learning-recommendation': return <AutoAwesomeIcon />;
            default: return <ComputerIcon />;
        }
    };

    // 탭 변경 핸들러
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    // 서비스 상세 보기
    const handleServiceClick = (service: AIServiceStatus) => {
        setSelectedService(service);
        setServiceDialog(true);
    };

    // 알림 상세 보기
    const handleAlertClick = (alert: AIAlert) => {
        setSelectedAlert(alert);
        setAlertDialog(true);
    };

    // 워크플로우 상세 보기
    const handleWorkflowClick = (workflow: AIWorkflow) => {
        setSelectedWorkflow(workflow);
        setWorkflowDialog(true);
    };

    // 서비스 재시작
    const handleServiceRestart = async (serviceId: string) => {
        try {
            setIsRestarting(serviceId);
            await aiOrchestrationService.restartService(serviceId);
            await loadData(); // 데이터 새로고침
        } catch (error) {
            console.error('서비스 재시작 오류:', error);
        } finally {
            setIsRestarting(null);
        }
    };

    // 알림 해결
    const handleAlertResolve = async (alertId: string) => {
        try {
            aiOrchestrationService.resolveAlert(alertId);
            await loadData(); // 데이터 새로고침
        } catch (error) {
            console.error('알림 해결 오류:', error);
        }
    };

    if (loading) {
        return (
            <DashboardContainer>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <CircularProgress size={60} />
                    <Typography variant="h6" ml={2}>AI 통합 시스템을 로드 중...</Typography>
                </Box>
            </DashboardContainer>
        );
    }

    return (
        <DashboardContainer>
            {/* 헤더 */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <HubIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="h4">AI 통합 대시보드</Typography>
                        <Typography variant="body2" color="text.secondary">
                            실시간 AI 시스템 모니터링 및 관리
                        </Typography>
                    </Box>
                </Box>
                <Box>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={autoRefresh}
                                onChange={(e) => setAutoRefresh(e.target.checked)}
                            />
                        }
                        label="자동 새로고침"
                    />
                    <Tooltip title="새로고침">
                        <IconButton onClick={loadData}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={fullscreen ? "전체화면 종료" : "전체화면"}>
                        <IconButton onClick={() => setFullscreen(!fullscreen)}>
                            {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* 시스템 개요 */}
            {systemOverview && (
                <Grid container spacing={3} mb={3}>
                    {/* 전체 헬스 */}
                    <Grid item xs={12} md={3}>
                        <StatusCard $status={systemOverview.overall_health > 80 ? 'active' :
                            systemOverview.overall_health > 60 ? 'inactive' : 'error'}>
                            <CardContent>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                                        <CloudIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6">시스템 헬스</Typography>
                                        <Chip
                                            label={systemOverview.overall_health > 80 ? '정상' :
                                                systemOverview.overall_health > 60 ? '주의' : '위험'}
                                            color={systemOverview.overall_health > 80 ? 'success' :
                                                systemOverview.overall_health > 60 ? 'warning' : 'error'}
                                            size="small"
                                        />
                                    </Box>
                                </Box>
                                <Typography variant="h4" color="primary">
                                    {Math.round(systemOverview.overall_health)}%
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    전체 시스템 헬스 스코어
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={systemOverview.overall_health}
                                    color={systemOverview.overall_health > 80 ? 'success' :
                                        systemOverview.overall_health > 60 ? 'warning' : 'error'}
                                    sx={{ mt: 1 }}
                                />
                            </CardContent>
                        </StatusCard>
                    </Grid>

                    {/* 활성 서비스 */}
                    <Grid item xs={12} md={3}>
                        <StatusCard $status="active">
                            <CardContent>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                                        <CheckCircleIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6">활성 서비스</Typography>
                                        <Chip
                                            label={`${systemOverview.active_services}/${systemOverview.total_services}`}
                                            color="success"
                                            size="small"
                                        />
                                    </Box>
                                </Box>
                                <Typography variant="h4" color="success.main">
                                    {systemOverview.active_services}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    정상 작동 중인 서비스
                                </Typography>
                            </CardContent>
                        </StatusCard>
                    </Grid>

                    {/* 활성 알림 */}
                    <Grid item xs={12} md={3}>
                        <StatusCard $status={alerts.length > 5 ? 'error' : alerts.length > 2 ? 'inactive' : 'active'}>
                            <CardContent>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                                        <Badge badgeContent={alerts.length} color="error">
                                            <NotificationsIcon />
                                        </Badge>
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6">활성 알림</Typography>
                                        <Chip
                                            label={`${alerts.length}개`}
                                            color={alerts.length > 5 ? 'error' : alerts.length > 2 ? 'warning' : 'success'}
                                            size="small"
                                        />
                                    </Box>
                                </Box>
                                <Typography variant="h4" color="warning.main">
                                    {alerts.length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    미해결 알림
                                </Typography>
                            </CardContent>
                        </StatusCard>
                    </Grid>

                    {/* 평균 응답 시간 */}
                    <Grid item xs={12} md={3}>
                        <StatusCard $status={systemOverview.average_response_time < 500 ? 'active' :
                            systemOverview.average_response_time < 1000 ? 'inactive' : 'error'}>
                            <CardContent>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                                        <SpeedIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6">응답 시간</Typography>
                                        <Chip
                                            label={systemOverview.average_response_time < 500 ? '빠름' :
                                                systemOverview.average_response_time < 1000 ? '보통' : '느림'}
                                            color={systemOverview.average_response_time < 500 ? 'success' :
                                                systemOverview.average_response_time < 1000 ? 'warning' : 'error'}
                                            size="small"
                                        />
                                    </Box>
                                </Box>
                                <Typography variant="h4" color="info.main">
                                    {Math.round(systemOverview.average_response_time)}ms
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    평균 응답 시간
                                </Typography>
                            </CardContent>
                        </StatusCard>
                    </Grid>
                </Grid>
            )}

            {/* 탭 네비게이션 */}
            <Paper sx={{ mb: 3 }}>
                <Tabs value={currentTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                    <Tab label="서비스 상태" icon={<ComputerIcon />} />
                    <Tab label="시스템 알림" icon={<NotificationsIcon />} />
                    <Tab label="워크플로우" icon={<TimelineIcon />} />
                    <Tab label="리소스 모니터링" icon={<MemoryIcon />} />
                    <Tab label="시스템 통계" icon={<AnalyticsIcon />} />
                </Tabs>
            </Paper>

            {/* 탭 콘텐츠 */}
            <Box>
                {/* 서비스 상태 탭 */}
                {currentTab === 0 && (
                    <Grid container spacing={3}>
                        {services.map((service) => (
                            <Grid item xs={12} md={6} lg={4} key={service.service_id}>
                                <StatusCard $status={service.status}>
                                    <CardContent>
                                        <Box display="flex" alignItems="center" mb={2}>
                                            <Avatar sx={{
                                                bgcolor: getServiceStatusColor(service.status) + '.main',
                                                mr: 2
                                            }}>
                                                {getServiceIcon(service.service_id)}
                                            </Avatar>
                                            <Box flex={1}>
                                                <Typography variant="subtitle1">{service.service_name}</Typography>
                                                <Chip
                                                    label={service.status}
                                                    size="small"
                                                    color={getServiceStatusColor(service.status)}
                                                />
                                            </Box>
                                            <Box>
                                                <Tooltip title="서비스 재시작">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleServiceRestart(service.service_id)}
                                                        disabled={isRestarting === service.service_id}
                                                    >
                                                        {isRestarting === service.service_id ?
                                                            <CircularProgress size={20} /> : <RestartIcon />}
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="상세 정보">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleServiceClick(service)}
                                                    >
                                                        <InfoIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography variant="body2">헬스</Typography>
                                                <Typography variant="h6">{Math.round(service.health_score)}%</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2">응답시간</Typography>
                                                <Typography variant="h6">{Math.round(service.response_time)}ms</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2">에러율</Typography>
                                                <Typography variant="h6">{Math.round(service.error_rate * 100)}%</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2">요청수</Typography>
                                                <Typography variant="h6">{service.processed_requests}</Typography>
                                            </Grid>
                                        </Grid>
                                        <LinearProgress
                                            variant="determinate"
                                            value={service.health_score}
                                            color={getServiceStatusColor(service.status)}
                                            sx={{ mt: 2 }}
                                        />
                                    </CardContent>
                                </StatusCard>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* 시스템 알림 탭 */}
                {currentTab === 1 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            {alerts.length > 0 ? (
                                alerts.map((alert) => (
                                    <AlertCard key={alert.alert_id} $severity={alert.severity}>
                                        <CardContent>
                                            <Box display="flex" alignItems="center" mb={2}>
                                                <Avatar sx={{
                                                    bgcolor: getAlertSeverityColor(alert.severity) + '.main',
                                                    width: 40, height: 40, mr: 2
                                                }}>
                                                    {alert.severity === 'critical' || alert.severity === 'high' ?
                                                        <ErrorIcon /> :
                                                        alert.severity === 'medium' ? <WarningIcon /> : <InfoIcon />}
                                                </Avatar>
                                                <Box flex={1}>
                                                    <Typography variant="subtitle1">{alert.title}</Typography>
                                                    <Box display="flex" gap={1} mt={1}>
                                                        <Chip
                                                            label={alert.severity}
                                                            size="small"
                                                            color={getAlertSeverityColor(alert.severity)}
                                                        />
                                                        <Chip
                                                            label={alert.alert_type}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </Box>
                                                </Box>
                                                <Box>
                                                    <Tooltip title="알림 해결">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleAlertResolve(alert.alert_id)}
                                                        >
                                                            <CheckCircleIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="상세 정보">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleAlertClick(alert)}
                                                        >
                                                            <InfoIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" mb={2}>
                                                {alert.description}
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2">영향받는 사용자</Typography>
                                                    <Typography variant="h6">{alert.affected_users}</Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2">발생 시간</Typography>
                                                    <Typography variant="h6">
                                                        {new Date(alert.timestamp).toLocaleTimeString()}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </AlertCard>
                                ))
                            ) : (
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" textAlign="center" color="text.secondary">
                                            현재 활성 알림이 없습니다.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            )}
                        </Grid>
                    </Grid>
                )}

                {/* 워크플로우 탭 */}
                {currentTab === 2 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            {workflows.length > 0 ? (
                                workflows.map((workflow) => (
                                    <Card key={workflow.workflow_id} sx={{ mb: 2 }}>
                                        <CardContent>
                                            <Box display="flex" alignItems="center" mb={2}>
                                                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                                                    <TimelineIcon />
                                                </Avatar>
                                                <Box flex={1}>
                                                    <Typography variant="subtitle1">{workflow.name}</Typography>
                                                    <Chip
                                                        label={workflow.status}
                                                        size="small"
                                                        color={workflow.status === 'completed' ? 'success' :
                                                            workflow.status === 'running' ? 'primary' :
                                                                workflow.status === 'failed' ? 'error' : 'warning'}
                                                    />
                                                </Box>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleWorkflowClick(workflow)}
                                                >
                                                    <InfoIcon />
                                                </IconButton>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" mb={2}>
                                                {workflow.description}
                                            </Typography>
                                            <Box mb={2}>
                                                <Typography variant="body2" mb={1}>
                                                    진행률: {Math.round(workflow.progress)}%
                                                </Typography>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={workflow.progress}
                                                    color={workflow.status === 'completed' ? 'success' :
                                                        workflow.status === 'running' ? 'primary' :
                                                            workflow.status === 'failed' ? 'error' : 'warning'}
                                                />
                                            </Box>
                                            <Grid container spacing={2}>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2">시작 시간</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {new Date(workflow.started_at).toLocaleString()}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2">우선순위</Typography>
                                                    <Chip
                                                        label={workflow.priority}
                                                        size="small"
                                                        color={workflow.priority === 'critical' ? 'error' :
                                                            workflow.priority === 'high' ? 'warning' : 'default'}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" textAlign="center" color="text.secondary">
                                            현재 실행 중인 워크플로우가 없습니다.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            )}
                        </Grid>
                    </Grid>
                )}

                {/* 리소스 모니터링 탭 */}
                {currentTab === 3 && systemOverview && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" mb={2}>시스템 리소스</Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Box display="flex" alignItems="center" mb={2}>
                                                <MemoryIcon sx={{ mr: 1 }} />
                                                <Typography variant="body2">메모리 사용량</Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={(systemOverview.memory_usage / 1024) * 100}
                                                color="primary"
                                                sx={{ height: 8, borderRadius: 4, mb: 1 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                {Math.round(systemOverview.memory_usage)} MB
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Box display="flex" alignItems="center" mb={2}>
                                                <ComputerIcon sx={{ mr: 1 }} />
                                                <Typography variant="body2">CPU 사용량</Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={systemOverview.cpu_usage}
                                                color="secondary"
                                                sx={{ height: 8, borderRadius: 4, mb: 1 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                {Math.round(systemOverview.cpu_usage)}%
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" mb={2}>네트워크 활동</Typography>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <NetworkIcon sx={{ mr: 1 }} />
                                        <Typography variant="body2">총 요청 수</Typography>
                                    </Box>
                                    <Typography variant="h4" color="primary" mb={2}>
                                        {systemOverview.total_requests.toLocaleString()}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        시스템 시작 이후 처리된 총 요청 수
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {/* 시스템 통계 탭 */}
                {currentTab === 4 && statistics && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" mb={2}>서비스 통계</Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">총 서비스</Typography>
                                            <Typography variant="h6">{statistics.services.total}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">활성 서비스</Typography>
                                            <Typography variant="h6" color="success.main">
                                                {statistics.services.active}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">평균 헬스</Typography>
                                            <Typography variant="h6">
                                                {Math.round(statistics.services.average_health)}%
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">평균 응답시간</Typography>
                                            <Typography variant="h6">
                                                {Math.round(statistics.services.average_response_time)}ms
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" mb={2}>알림 통계</Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">총 알림</Typography>
                                            <Typography variant="h6">{statistics.alerts.total}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">활성 알림</Typography>
                                            <Typography variant="h6" color="warning.main">
                                                {statistics.alerts.active}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">심각한 알림</Typography>
                                            <Typography variant="h6" color="error.main">
                                                {statistics.alerts.critical}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">해결된 알림</Typography>
                                            <Typography variant="h6" color="success.main">
                                                {statistics.alerts.resolved}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" mb={2}>시스템 정보</Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={3}>
                                            <Typography variant="body2">시스템 업타임</Typography>
                                            <Typography variant="h6">
                                                {Math.round(statistics.system.uptime / 3600)}시간
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <Typography variant="body2">총 메모리</Typography>
                                            <Typography variant="h6">
                                                {Math.round(statistics.system.total_memory)} MB
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <Typography variant="body2">평균 CPU</Typography>
                                            <Typography variant="h6">
                                                {Math.round(statistics.system.average_cpu)}%
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <Typography variant="body2">총 요청</Typography>
                                            <Typography variant="h6">
                                                {statistics.system.total_requests.toLocaleString()}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}
            </Box>

            {/* 서비스 상세 다이얼로그 */}
            <Dialog open={serviceDialog} onClose={() => setServiceDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>서비스 상세 정보</DialogTitle>
                <DialogContent>
                    {selectedService && (
                        <>
                            <Typography variant="h6" mb={2}>{selectedService.service_name}</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2">서비스 ID</Typography>
                                    <Typography variant="body1">{selectedService.service_id}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">상태</Typography>
                                    <Chip
                                        label={selectedService.status}
                                        color={getServiceStatusColor(selectedService.status)}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">헬스 스코어</Typography>
                                    <Typography variant="body1">{Math.round(selectedService.health_score)}%</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">응답 시간</Typography>
                                    <Typography variant="body1">{Math.round(selectedService.response_time)}ms</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">에러율</Typography>
                                    <Typography variant="body1">{Math.round(selectedService.error_rate * 100)}%</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">업타임</Typography>
                                    <Typography variant="body1">{Math.round(selectedService.uptime / 3600)}시간</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">메모리 사용량</Typography>
                                    <Typography variant="body1">{Math.round(selectedService.memory_usage)} MB</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">CPU 사용량</Typography>
                                    <Typography variant="body1">{Math.round(selectedService.cpu_usage)}%</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">활성 연결</Typography>
                                    <Typography variant="body1">{selectedService.active_connections}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">처리된 요청</Typography>
                                    <Typography variant="body1">{selectedService.processed_requests}</Typography>
                                </Grid>
                            </Grid>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setServiceDialog(false)}>닫기</Button>
                </DialogActions>
            </Dialog>

            {/* 알림 상세 다이얼로그 */}
            <Dialog open={alertDialog} onClose={() => setAlertDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <AlertTitle severity={selectedAlert?.severity === 'critical' ? 'error' :
                        selectedAlert?.severity === 'high' ? 'warning' : 'info'}>
                        알림 상세 정보
                    </AlertTitle>
                </DialogTitle>
                <DialogContent>
                    {selectedAlert && (
                        <>
                            <Typography variant="h6" mb={2}>{selectedAlert.title}</Typography>
                            <Typography variant="body1" mb={2}>
                                {selectedAlert.description}
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2">심각도</Typography>
                                    <Chip
                                        label={selectedAlert.severity}
                                        color={getAlertSeverityColor(selectedAlert.severity)}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">알림 타입</Typography>
                                    <Typography variant="body1">{selectedAlert.alert_type}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">영향받는 사용자</Typography>
                                    <Typography variant="body1">{selectedAlert.affected_users}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">발생 시간</Typography>
                                    <Typography variant="body1">
                                        {new Date(selectedAlert.timestamp).toLocaleString()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2">예상 영향</Typography>
                                    <Typography variant="body1">{selectedAlert.estimated_impact}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2">제안 액션</Typography>
                                    <List dense>
                                        {selectedAlert.suggested_actions.map((action, index) => (
                                            <ListItem key={index}>
                                                <ListItemIcon>
                                                    <CheckCircleIcon color="primary" />
                                                </ListItemIcon>
                                                <ListItemText primary={action} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Grid>
                            </Grid>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAlertDialog(false)}>닫기</Button>
                </DialogActions>
            </Dialog>

            {/* 워크플로우 상세 다이얼로그 */}
            <Dialog open={workflowDialog} onClose={() => setWorkflowDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>워크플로우 상세 정보</DialogTitle>
                <DialogContent>
                    {selectedWorkflow && (
                        <>
                            <Typography variant="h6" mb={2}>{selectedWorkflow.name}</Typography>
                            <Typography variant="body1" mb={2}>
                                {selectedWorkflow.description}
                            </Typography>
                            <Grid container spacing={2} mb={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2">상태</Typography>
                                    <Chip
                                        label={selectedWorkflow.status}
                                        color={selectedWorkflow.status === 'completed' ? 'success' :
                                            selectedWorkflow.status === 'running' ? 'primary' :
                                                selectedWorkflow.status === 'failed' ? 'error' : 'warning'}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">진행률</Typography>
                                    <Typography variant="body1">{Math.round(selectedWorkflow.progress)}%</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">우선순위</Typography>
                                    <Chip
                                        label={selectedWorkflow.priority}
                                        color={selectedWorkflow.priority === 'critical' ? 'error' :
                                            selectedWorkflow.priority === 'high' ? 'warning' : 'default'}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">시작 시간</Typography>
                                    <Typography variant="body1">
                                        {new Date(selectedWorkflow.started_at).toLocaleString()}
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Typography variant="h6" mb={1}>워크플로우 단계</Typography>
                            <List>
                                {selectedWorkflow.steps.map((step, index) => (
                                    <ListItem key={step.step_id}>
                                        <ListItemIcon>
                                            {step.status === 'completed' ? <CheckCircleIcon color="success" /> :
                                                step.status === 'running' ? <CircularProgress size={20} /> :
                                                    step.status === 'failed' ? <ErrorIcon color="error" /> :
                                                        <InfoIcon />}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={step.name}
                                            secondary={`상태: ${step.status} | 서비스: ${step.service_id}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setWorkflowDialog(false)}>닫기</Button>
                </DialogActions>
            </Dialog>
        </DashboardContainer>
    );
};

export default AIIntegratedDashboard;
