import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, Grid, Card, CardContent, LinearProgress, Chip, Avatar, IconButton, Button, Divider, List, ListItem, ListItemText, ListItemAvatar, ListItemSecondaryAction, Badge, Tooltip, CircularProgress, Alert, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Slider, Switch, FormControlLabel, Accordion, AccordionSummary, AccordionDetails, AlertTitle
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon, Speed as SpeedIcon, Assessment as AssessmentIcon, Warning as WarningIcon, Error as ErrorIcon, CheckCircle as CheckCircleIcon, Info as InfoIcon, Refresh as RefreshIcon, Settings as SettingsIcon, Fullscreen as FullscreenIcon, FullscreenExit as FullscreenExitIcon, Monitor as MonitorIcon, Psychology as PsychologyIcon, Memory as MemoryIcon, School as SchoolIcon, AutoAwesome as AutoAwesomeIcon, Timeline as TimelineIcon, BarChart as BarChartIcon, PieChart as PieChartIcon, Target as TargetIcon, Star as StarIcon, EmojiEvents as TrophyIcon, Lightbulb as LightbulbIcon, Bookmark as BookmarkIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, CalendarToday as CalendarIcon, AccessTime as TimeIcon, Person as PersonIcon, PriorityHigh as PriorityHighIcon, TrendingFlat as TrendingFlatIcon, Psychology as PsychologyIcon2, School as SchoolIcon2, AutoAwesome as AutoAwesomeIcon2, Memory as MemoryIcon2, Assessment as AssessmentIcon2, Warning as WarningIcon2, Error as ErrorIcon2, CheckCircle as CheckCircleIcon2, Info as InfoIcon2, Monitor as MonitorIcon2, Speed as SpeedIcon2, Target as TargetIcon2, Star as StarIcon2, EmojiEvents as TrophyIcon2, Lightbulb as LightbulbIcon2, Bookmark as BookmarkIcon2, ExpandMore as ExpandMoreIcon2, ExpandLess as ExpandLessIcon2, CalendarToday as CalendarIcon2, AccessTime as TimeIcon2, Person as PersonIcon2, PriorityHigh as PriorityHighIcon2, TrendingFlat as TrendingFlatIcon2
} from '@mui/icons-material';
import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
    TimelineOppositeContent
} from '@mui/lab';
import { styled } from '@mui/material/styles';
import realTimeAIPerformanceMonitor, { SystemHealth, PerformanceAlert, PerformanceMetric } from '../services/realTimeAIPerformanceMonitor';
import advancedUserExperienceAnalytics, { UserExperienceInsight, UXOptimizationRecommendation } from '../services/advancedUserExperienceAnalytics';

// 스타일드 컴포넌트
const DashboardContainer = styled(Box)(({ theme }) => ({
    height: '100vh',
    overflow: 'auto',
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(2)
}));

const MetricCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[8]
    }
}));

const HealthCard = styled(Card)<{ health: string }>(({ theme, health }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    border: `2px solid ${health === 'excellent' ? theme.palette.success.main :
        health === 'good' ? theme.palette.success.light :
            health === 'fair' ? theme.palette.warning.main :
                health === 'poor' ? theme.palette.error.light :
                    theme.palette.error.main
        }`,
    background: `linear-gradient(135deg, ${health === 'excellent' ? theme.palette.success.main + '15' :
        health === 'good' ? theme.palette.success.light + '15' :
            health === 'fair' ? theme.palette.warning.main + '15' :
                health === 'poor' ? theme.palette.error.light + '15' :
                    theme.palette.error.main + '15'
        }, ${theme.palette.background.paper})`
}));

const AlertCard = styled(Card)<{ severity: string }>(({ theme, severity }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    border: `2px solid ${severity === 'critical' ? theme.palette.error.main :
        severity === 'high' ? theme.palette.error.light :
            severity === 'medium' ? theme.palette.warning.main :
                theme.palette.info.main
        }`,
    background: `linear-gradient(135deg, ${severity === 'critical' ? theme.palette.error.main + '20' :
        severity === 'high' ? theme.palette.error.light + '20' :
            severity === 'medium' ? theme.palette.warning.main + '20' :
                theme.palette.info.main + '20'
        }, ${theme.palette.background.paper})`
}));

const InsightCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    border: `1px solid ${theme.palette.divider}`,
    '&:hover': {
        borderColor: theme.palette.primary.main
    }
}));

// 인터페이스 정의
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

interface RealTimePerformanceDashboardProps {
    userId?: string;
    sessionId?: string;
}

interface DashboardData {
    system_health: SystemHealth;
    performance_metrics: PerformanceMetric[];
    active_alerts: PerformanceAlert[];
    user_experience_insights: UserExperienceInsight[];
    optimization_recommendations: UXOptimizationRecommendation[];
    statistics: any;
}

// 탭 패널 컴포넌트
function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`performance-tabpanel-${index}`}
            aria-labelledby={`performance-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const RealTimePerformanceDashboard: React.FC<RealTimePerformanceDashboardProps> = ({
    userId = 'user-1',
    sessionId = 'session-1'
}) => {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tabValue, setTabValue] = useState(0);
    const [refreshInterval, setRefreshInterval] = useState(5000); // 5초
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [fullscreen, setFullscreen] = useState(false);
    const [settingsDialog, setSettingsDialog] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState<PerformanceAlert | null>(null);
    const [alertDialog, setAlertDialog] = useState(false);
    const [selectedInsight, setSelectedInsight] = useState<UserExperienceInsight | null>(null);
    const [insightDialog, setInsightDialog] = useState(false);

    useEffect(() => {
        loadDashboardData();
        const interval = setInterval(() => {
            if (autoRefresh) {
                loadDashboardData();
            }
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [userId, sessionId, autoRefresh, refreshInterval]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. 시스템 헬스 가져오기
            const systemHealth = realTimeAIPerformanceMonitor.getSystemHealth();

            // 2. 성능 메트릭 가져오기
            const performanceMetrics = realTimeAIPerformanceMonitor.getCurrentMetrics();

            // 3. 활성 알림 가져오기
            const activeAlerts = realTimeAIPerformanceMonitor.getActiveAlerts();

            // 4. 사용자 경험 인사이트 가져오기
            const userExperienceInsights = advancedUserExperienceAnalytics.getInsights();

            // 5. 최적화 권장사항 가져오기
            const optimizationRecommendations = advancedUserExperienceAnalytics.getOptimizationRecommendations();

            // 6. 통계 정보 가져오기
            const statistics = realTimeAIPerformanceMonitor.getStatistics();

            const dashboardData: DashboardData = {
                system_health: systemHealth,
                performance_metrics: performanceMetrics,
                active_alerts: activeAlerts,
                user_experience_insights: userExperienceInsights,
                optimization_recommendations: optimizationRecommendations,
                statistics: statistics
            };

            setDashboardData(dashboardData);
            setLoading(false);

        } catch (error) {
            console.error('Dashboard data loading error:', error);
            setError('대시보드 데이터를 불러오는 중 오류가 발생했습니다.');
            setLoading(false);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const renderMetricCard = (title: string, value: string | number, subtitle: string, icon: React.ReactNode, color: string, trend?: number) => (
        <MetricCard>
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Avatar sx={{ bgcolor: `${color}.main`, width: 48, height: 48 }}>
                        {icon}
                    </Avatar>
                    {trend !== undefined && (
                        <Box display="flex" alignItems="center">
                            {trend > 0 ? <TrendingUpIcon color="success" /> : <TrendingDownIcon color="error" />}
                            <Typography variant="caption" color={trend > 0 ? 'success.main' : 'error.main'}>
                                {Math.abs(trend)}%
                            </Typography>
                        </Box>
                    )}
                </Box>
                <Typography variant="h4" component="div" gutterBottom>
                    {value}
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {subtitle}
                </Typography>
            </CardContent>
        </MetricCard>
    );

    const renderHealthCard = (health: SystemHealth) => (
        <HealthCard health={health.overall_health}>
            <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{
                        bgcolor: health.overall_health === 'excellent' ? 'success.main' :
                            health.overall_health === 'good' ? 'success.light' :
                                health.overall_health === 'fair' ? 'warning.main' :
                                    health.overall_health === 'poor' ? 'error.light' : 'error.main',
                        width: 48, height: 48, mr: 2
                    }}>
                        {health.overall_health === 'excellent' ? <CheckCircleIcon /> :
                            health.overall_health === 'good' ? <CheckCircleIcon /> :
                                health.overall_health === 'fair' ? <WarningIcon /> :
                                    health.overall_health === 'poor' ? <ErrorIcon /> : <ErrorIcon />}
                    </Avatar>
                    <Box>
                        <Typography variant="h6">시스템 헬스</Typography>
                        <Chip
                            label={health.overall_health}
                            color={health.overall_health === 'excellent' ? 'success' :
                                health.overall_health === 'good' ? 'success' :
                                    health.overall_health === 'fair' ? 'warning' :
                                        health.overall_health === 'poor' ? 'error' : 'error'}
                            size="small"
                        />
                    </Box>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">CPU</Typography>
                        <LinearProgress
                            variant="determinate"
                            value={health.cpu_usage}
                            color={health.cpu_usage > 80 ? 'error' : health.cpu_usage > 60 ? 'warning' : 'success'}
                            sx={{ height: 8, borderRadius: 4, mb: 1 }}
                        />
                        <Typography variant="caption">{Math.round(health.cpu_usage)}%</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">메모리</Typography>
                        <LinearProgress
                            variant="determinate"
                            value={health.memory_usage}
                            color={health.memory_usage > 80 ? 'error' : health.memory_usage > 60 ? 'warning' : 'success'}
                            sx={{ height: 8, borderRadius: 4, mb: 1 }}
                        />
                        <Typography variant="caption">{Math.round(health.memory_usage)}%</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">디스크</Typography>
                        <LinearProgress
                            variant="determinate"
                            value={health.disk_usage}
                            color={health.disk_usage > 80 ? 'error' : health.disk_usage > 60 ? 'warning' : 'success'}
                            sx={{ height: 8, borderRadius: 4, mb: 1 }}
                        />
                        <Typography variant="caption">{Math.round(health.disk_usage)}%</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">네트워크</Typography>
                        <Typography variant="caption">{Math.round(health.network_latency)}ms</Typography>
                    </Grid>
                </Grid>
                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                    마지막 업데이트: {health.last_updated.toLocaleTimeString()}
                </Typography>
            </CardContent>
        </HealthCard>
    );

    const renderAlertCard = (alert: PerformanceAlert) => (
        <AlertCard severity={alert.severity}>
            <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{
                        bgcolor: alert.severity === 'critical' ? 'error.main' :
                            alert.severity === 'high' ? 'error.light' :
                                alert.severity === 'medium' ? 'warning.main' : 'info.main',
                        width: 40, height: 40, mr: 2
                    }}>
                        {alert.severity === 'critical' ? <ErrorIcon /> :
                            alert.severity === 'high' ? <WarningIcon /> :
                                alert.severity === 'medium' ? <WarningIcon /> : <InfoIcon />}
                    </Avatar>
                    <Box flex={1}>
                        <Typography variant="subtitle1">{alert.alert_type.toUpperCase()}</Typography>
                        <Chip
                            label={alert.severity}
                            size="small"
                            color={alert.severity === 'critical' ? 'error' :
                                alert.severity === 'high' ? 'error' :
                                    alert.severity === 'medium' ? 'warning' : 'default'}
                        />
                    </Box>
                    <IconButton
                        size="small"
                        onClick={() => {
                            setSelectedAlert(alert);
                            setAlertDialog(true);
                        }}
                    >
                        <InfoIcon />
                    </IconButton>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={1}>
                    {alert.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {alert.timestamp.toLocaleTimeString()}
                </Typography>
            </CardContent>
        </AlertCard>
    );

    const renderInsightCard = (insight: UserExperienceInsight) => (
        <InsightCard>
            <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{
                        bgcolor: insight.priority === 'critical' ? 'error.main' :
                            insight.priority === 'high' ? 'warning.main' :
                                insight.priority === 'medium' ? 'info.main' : 'default',
                        width: 40, height: 40, mr: 2
                    }}>
                        <LightbulbIcon />
                    </Avatar>
                    <Box flex={1}>
                        <Typography variant="subtitle1">{insight.title}</Typography>
                        <Chip
                            label={insight.priority}
                            size="small"
                            color={insight.priority === 'critical' ? 'error' :
                                insight.priority === 'high' ? 'warning' : 'default'}
                        />
                    </Box>
                    <IconButton
                        size="small"
                        onClick={() => {
                            setSelectedInsight(insight);
                            setInsightDialog(true);
                        }}
                    >
                        <InfoIcon />
                    </IconButton>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={1}>
                    {insight.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    신뢰도: {Math.round(insight.confidence * 100)}%
                </Typography>
            </CardContent>
        </InsightCard>
    );

    if (loading) {
        return (
            <DashboardContainer>
                <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ ml: 2 }}>
                        성능 대시보드를 불러오는 중...
                    </Typography>
                </Box>
            </DashboardContainer>
        );
    }

    if (error) {
        return (
            <DashboardContainer>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button variant="contained" onClick={loadDashboardData}>
                    다시 시도
                </Button>
            </DashboardContainer>
        );
    }

    if (!dashboardData) {
        return (
            <DashboardContainer>
                <Typography variant="h6" textAlign="center">
                    대시보드 데이터가 없습니다.
                </Typography>
            </DashboardContainer>
        );
    }

    const { system_health, performance_metrics, active_alerts, user_experience_insights, optimization_recommendations, statistics } = dashboardData;

    return (
        <DashboardContainer>
            {/* 헤더 */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4" gutterBottom>
                        🔍 실시간 성능 모니터링
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        AI 시스템 성능 및 사용자 경험 실시간 추적
                    </Typography>
                </Box>
                <Box display="flex" gap={1}>
                    <Tooltip title="새로고침">
                        <IconButton onClick={loadDashboardData}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="설정">
                        <IconButton onClick={() => setSettingsDialog(true)}>
                            <SettingsIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={fullscreen ? "전체화면 종료" : "전체화면"}>
                        <IconButton onClick={() => setFullscreen(!fullscreen)}>
                            {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* 주요 지표 */}
            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} sm={6} md={3}>
                    {renderMetricCard(
                        '전체 요청',
                        statistics.total_metrics,
                        '총 처리된 요청 수',
                        <AssessmentIcon />,
                        'primary'
                    )}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    {renderMetricCard(
                        '평균 응답 시간',
                        `${Math.round(statistics.average_response_time)}ms`,
                        'AI 응답 처리 시간',
                        <SpeedIcon />,
                        'success',
                        statistics.average_response_time < 1000 ? 5 : -3
                    )}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    {renderMetricCard(
                        '활성 알림',
                        active_alerts.length,
                        '현재 활성화된 알림',
                        <WarningIcon />,
                        'warning',
                        active_alerts.length > 5 ? -10 : 2
                    )}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    {renderMetricCard(
                        '평균 만족도',
                        `${statistics.average_satisfaction.toFixed(1)}/5`,
                        '사용자 만족도 점수',
                        <StarIcon />,
                        'info',
                        statistics.average_satisfaction > 4.0 ? 8 : -5
                    )}
                </Grid>
            </Grid>

            {/* 시스템 헬스 */}
            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={6}>
                    {renderHealthCard(system_health)}
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                실시간 통계
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>최근 1시간 요청</TableCell>
                                            <TableCell>{statistics.metrics_last_hour}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>최근 24시간 요청</TableCell>
                                            <TableCell>{statistics.metrics_last_day}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>에러율</TableCell>
                                            <TableCell>{(statistics.error_rate * 100).toFixed(2)}%</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>시스템 헬스</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={statistics.system_health}
                                                    color={statistics.system_health === 'excellent' ? 'success' :
                                                        statistics.system_health === 'good' ? 'success' :
                                                            statistics.system_health === 'fair' ? 'warning' :
                                                                statistics.system_health === 'poor' ? 'error' : 'error'}
                                                    size="small"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 탭 네비게이션 */}
            <Paper sx={{ mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                    <Tab label="성능 알림" icon={<WarningIcon />} />
                    <Tab label="사용자 경험" icon={<PsychologyIcon />} />
                    <Tab label="최적화 권장" icon={<LightbulbIcon />} />
                    <Tab label="성능 메트릭" icon={<BarChartIcon />} />
                    <Tab label="시스템 로그" icon={<TimelineIcon />} />
                </Tabs>
            </Paper>

            {/* 탭 콘텐츠 */}
            <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            활성 성능 알림 ({active_alerts.length})
                        </Typography>
                        {active_alerts.length === 0 ? (
                            <Alert severity="success">
                                현재 활성화된 알림이 없습니다. 시스템이 정상적으로 작동하고 있습니다.
                            </Alert>
                        ) : (
                            <Grid container spacing={2}>
                                {active_alerts.map((alert) => (
                                    <Grid item xs={12} md={6} key={alert.id}>
                                        {renderAlertCard(alert)}
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Grid>
                </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            사용자 경험 인사이트 ({user_experience_insights.length})
                        </Typography>
                        {user_experience_insights.length === 0 ? (
                            <Alert severity="info">
                                아직 사용자 경험 인사이트가 생성되지 않았습니다.
                            </Alert>
                        ) : (
                            <Grid container spacing={2}>
                                {user_experience_insights.slice(0, 6).map((insight) => (
                                    <Grid item xs={12} md={6} key={insight.insight_id}>
                                        {renderInsightCard(insight)}
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Grid>
                </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            최적화 권장사항 ({optimization_recommendations.length})
                        </Typography>
                        {optimization_recommendations.length === 0 ? (
                            <Alert severity="info">
                                현재 최적화 권장사항이 없습니다.
                            </Alert>
                        ) : (
                            <Grid container spacing={2}>
                                {optimization_recommendations.map((recommendation) => (
                                    <Grid item xs={12} md={6} key={recommendation.recommendation_id}>
                                        <Card>
                                            <CardContent>
                                                <Box display="flex" alignItems="center" mb={2}>
                                                    <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40, mr: 2 }}>
                                                        <LightbulbIcon />
                                                    </Avatar>
                                                    <Box flex={1}>
                                                        <Typography variant="subtitle1">{recommendation.title}</Typography>
                                                        <Chip
                                                            label={recommendation.category}
                                                            size="small"
                                                            color="primary"
                                                        />
                                                    </Box>
                                                </Box>
                                                <Typography variant="body2" color="text.secondary" mb={2}>
                                                    {recommendation.description}
                                                </Typography>
                                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                                    <Typography variant="caption">
                                                        영향도: {Math.round(recommendation.impact_score * 100)}%
                                                    </Typography>
                                                    <Typography variant="caption">
                                                        구현 난이도: {recommendation.implementation_effort}
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Grid>
                </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    실시간 성능 메트릭
                                </Typography>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>서비스</TableCell>
                                                <TableCell>메트릭 타입</TableCell>
                                                <TableCell>값</TableCell>
                                                <TableCell>단위</TableCell>
                                                <TableCell>시간</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {performance_metrics.slice(0, 20).map((metric, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{metric.context.service}</TableCell>
                                                    <TableCell>{metric.metric_type}</TableCell>
                                                    <TableCell>{metric.value}</TableCell>
                                                    <TableCell>{metric.unit}</TableCell>
                                                    <TableCell>{metric.timestamp.toLocaleTimeString()}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={4}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    시스템 활동 타임라인
                                </Typography>
                                <Timeline>
                                    {performance_metrics.slice(0, 10).map((metric, index) => (
                                        <TimelineItem key={index}>
                                            <TimelineOppositeContent>
                                                <Typography variant="caption" color="text.secondary">
                                                    {metric.timestamp.toLocaleTimeString()}
                                                </Typography>
                                            </TimelineOppositeContent>
                                            <TimelineSeparator>
                                                <TimelineDot color="primary">
                                                    <MonitorIcon />
                                                </TimelineDot>
                                                <TimelineConnector />
                                            </TimelineSeparator>
                                            <TimelineContent>
                                                <Typography variant="subtitle2">
                                                    {metric.context.service} - {metric.metric_type}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {metric.value} {metric.unit}
                                                </Typography>
                                            </TimelineContent>
                                        </TimelineItem>
                                    ))}
                                </Timeline>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </TabPanel>

            {/* 설정 다이얼로그 */}
            <Dialog open={settingsDialog} onClose={() => setSettingsDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>대시보드 설정</DialogTitle>
                <DialogContent>
                    <Box mb={3}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={autoRefresh}
                                    onChange={(e) => setAutoRefresh(e.target.checked)}
                                />
                            }
                            label="자동 새로고침"
                        />
                    </Box>
                    <Box mb={3}>
                        <Typography gutterBottom>새로고침 간격 (초)</Typography>
                        <Slider
                            value={refreshInterval / 1000}
                            onChange={(e, value) => setRefreshInterval(value as number * 1000)}
                            min={1}
                            max={60}
                            step={1}
                            marks
                            valueLabelDisplay="auto"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSettingsDialog(false)}>닫기</Button>
                </DialogActions>
            </Dialog>

            {/* 알림 상세 다이얼로그 */}
            <Dialog open={alertDialog} onClose={() => setAlertDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <AlertTitle severity={selectedAlert?.severity === 'critical' ? 'error' :
                        selectedAlert?.severity === 'high' ? 'warning' : 'info'}>
                        {selectedAlert?.alert_type.toUpperCase()} 알림
                    </AlertTitle>
                </DialogTitle>
                <DialogContent>
                    {selectedAlert && (
                        <Box>
                            <Typography variant="body1" paragraph>
                                {selectedAlert.message}
                            </Typography>
                            <Typography variant="subtitle2" gutterBottom>
                                세부 정보:
                            </Typography>
                            <List dense>
                                <ListItem>
                                    <ListItemText
                                        primary="서비스"
                                        secondary={selectedAlert.metric.context.service}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="메트릭 타입"
                                        secondary={selectedAlert.metric.metric_type}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="현재 값"
                                        secondary={`${selectedAlert.metric.value} ${selectedAlert.metric.unit}`}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="임계값"
                                        secondary={selectedAlert.threshold}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="심각도"
                                        secondary={selectedAlert.severity}
                                    />
                                </ListItem>
                            </List>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAlertDialog(false)}>닫기</Button>
                    {selectedAlert && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                realTimeAIPerformanceMonitor.resolveAlert(selectedAlert.id);
                                setAlertDialog(false);
                                loadDashboardData();
                            }}
                        >
                            알림 해결
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* 인사이트 상세 다이얼로그 */}
            <Dialog open={insightDialog} onClose={() => setInsightDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {selectedInsight?.title}
                </DialogTitle>
                <DialogContent>
                    {selectedInsight && (
                        <Box>
                            <Typography variant="body1" paragraph>
                                {selectedInsight.description}
                            </Typography>
                            <Typography variant="subtitle2" gutterBottom>
                                권장사항:
                            </Typography>
                            <List>
                                {selectedInsight.recommendations.map((recommendation, index) => (
                                    <ListItem key={index}>
                                        <ListItemText primary={recommendation} />
                                    </ListItem>
                                ))}
                            </List>
                            <Box mt={2}>
                                <Typography variant="caption" color="text.secondary">
                                    신뢰도: {Math.round(selectedInsight.confidence * 100)}% |
                                    우선순위: {selectedInsight.priority} |
                                    실행 가능: {selectedInsight.actionable ? '예' : '아니오'}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setInsightDialog(false)}>닫기</Button>
                </DialogActions>
            </Dialog>
        </DashboardContainer>
    );
};

export default RealTimePerformanceDashboard;
