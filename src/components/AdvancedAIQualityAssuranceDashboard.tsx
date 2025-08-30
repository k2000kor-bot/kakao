import React, { useState, useEffect } from 'react';
import useRealTimeData from '../hooks/useRealTimeData';
import RealTimeNotificationCenter from './RealTimeNotificationCenter';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    LinearProgress,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Alert,
    IconButton,
    Tooltip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Switch,
    FormControlLabel,
    Slider,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Divider,
    Fab,
    Badge,
    Avatar,
    AppBar,
    Toolbar,
    Drawer,
    ListItemButton,
    useTheme,
    alpha
} from '@mui/material';
import {
    Assessment,
    Speed,
    Analytics,
    Notifications,
    Code,
    Schedule,
    Article,
    Settings,
    PlayArrow,
    Stop,
    Refresh,
    Add,
    Edit,
    Delete,
    Download,
    Upload,
    Visibility,
    TrendingUp,
    TrendingDown,
    Warning,
    Error,
    CheckCircle,
    Info,
    ExpandMore,
    Menu,
    Dashboard,
    BugReport,
    Security,

    BarChart,
    PieChart,
    ShowChart,
    FilterList,
    Search,
    Sort,
    MoreVert,
    Fullscreen,
    FullscreenExit,
    AutoAwesome,
    Psychology,
    Science,
    Biotech,
    Memory,
    Storage,
    NetworkCheck,
    Speed as SpeedIcon,
    Memory as MemoryIcon,
    Storage as StorageIcon,
    NetworkCheck as NetworkIcon,
    Science as QualityControl,
    Biotech as TestTube,
    TrendingUp as Prediction
} from '@mui/icons-material';

// 새로운 컴포넌트들 import
import QualityMetricsChart from './QualityMetricsChart';
import QualityNotificationSystem from './QualityNotificationSystem';
import TestExecutionLog from './TestExecutionLog';
import AIQualityPrediction from './AIQualityPrediction';
import AutomatedTestScheduler from './AutomatedTestScheduler';

// 인터페이스 정의
interface QualityTestCase {
    id: string;
    name: string;
    description: string;
    test_type: 'functional' | 'performance' | 'security' | 'unit' | 'integration' | 'e2e';
    status: 'passed' | 'failed' | 'running' | 'pending' | 'skipped';
    priority: 'low' | 'medium' | 'high' | 'critical';
    duration: number;
    last_run: string;
    success_rate: number;
    failure_count: number;
    tags: string[];
}

interface TestSuite {
    id: string;
    name: string;
    description: string;
    test_cases: QualityTestCase[];
    total_tests: number;
    passed_tests: number;
    failed_tests: number;
    running_tests: number;
    status: 'active' | 'inactive' | 'maintenance';
    last_execution: string;
    average_duration: number;
    success_rate: number;
}

interface PerformanceMetric {
    id: string;
    name: string;
    value: number;
    unit: string;
    threshold: number;
    status: 'normal' | 'warning' | 'critical';
    trend: 'up' | 'down' | 'stable';
    last_updated: string;
}

interface QualityMetric {
    id: string;
    name: string;
    value: number;
    target: number;
    status: 'excellent' | 'good' | 'warning' | 'critical';
    trend: 'up' | 'down' | 'stable';
    last_updated: string;
    description: string;
}

const AdvancedAIQualityAssuranceDashboard: React.FC = () => {
    const theme = useTheme();
    const [selectedTab, setSelectedTab] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(15);
    const [selectedTestSuite, setSelectedTestSuite] = useState<TestSuite | null>(null);
    const [testExecutionDialog, setTestExecutionDialog] = useState(false);

    // 실시간 데이터 훅 사용
    const { metrics, alerts, runningTests, isConnected, lastUpdate, acknowledgeAlert, resolveAlert, deleteAlert, startTest, stopTest } = useRealTimeData();

    // 실시간 데이터 상태
    const [qualityMetrics, setQualityMetrics] = useState<QualityMetric[]>([
        {
            id: 'overall-quality',
            name: '전체 품질 점수',
            value: 94.2,
            target: 95,
            status: 'good',
            trend: 'up',
            last_updated: '2024-01-15 14:30',
            description: 'AI 시스템의 전반적인 품질 지표'
        },
        {
            id: 'test-coverage',
            name: '테스트 커버리지',
            value: 87.5,
            target: 90,
            status: 'warning',
            trend: 'up',
            last_updated: '2024-01-15 14:30',
            description: '코드 커버리지 및 테스트 범위'
        },
        {
            id: 'automation-rate',
            name: '자동화율',
            value: 92.8,
            target: 95,
            status: 'good',
            trend: 'up',
            last_updated: '2024-01-15 14:30',
            description: '자동화된 테스트 비율'
        },
        {
            id: 'defect-density',
            name: '결함 밀도',
            value: 2.1,
            target: 1.5,
            status: 'warning',
            trend: 'down',
            last_updated: '2024-01-15 14:30',
            description: '1000줄당 결함 수'
        }
    ]);

    const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([
        {
            id: 'response-time',
            name: '응답 시간',
            value: 245,
            unit: 'ms',
            threshold: 300,
            status: 'normal',
            trend: 'stable',
            last_updated: '2024-01-15 14:30'
        },
        {
            id: 'throughput',
            name: '처리량',
            value: 1250,
            unit: 'req/s',
            threshold: 1000,
            status: 'normal',
            trend: 'up',
            last_updated: '2024-01-15 14:30'
        },
        {
            id: 'cpu-usage',
            name: 'CPU 사용률',
            value: 68,
            unit: '%',
            threshold: 80,
            status: 'normal',
            trend: 'stable',
            last_updated: '2024-01-15 14:30'
        },
        {
            id: 'memory-usage',
            name: '메모리 사용률',
            value: 72,
            unit: '%',
            threshold: 85,
            status: 'normal',
            trend: 'up',
            last_updated: '2024-01-15 14:30'
        }
    ]);

    const [testSuites, setTestSuites] = useState<TestSuite[]>([
        {
            id: 'functional-tests',
            name: '기능 테스트 스위트',
            description: '핵심 비즈니스 로직 기능 테스트',
            test_cases: [],
            total_tests: 156,
            passed_tests: 148,
            failed_tests: 3,
            running_tests: 5,
            status: 'active',
            last_execution: '2024-01-15 14:25',
            average_duration: 45,
            success_rate: 94.9
        },
        {
            id: 'performance-tests',
            name: '성능 테스트 스위트',
            description: '부하 테스트 및 성능 검증',
            test_cases: [],
            total_tests: 23,
            passed_tests: 21,
            failed_tests: 1,
            running_tests: 1,
            status: 'active',
            last_execution: '2024-01-15 14:20',
            average_duration: 180,
            success_rate: 91.3
        },
        {
            id: 'security-tests',
            name: '보안 테스트 스위트',
            description: '보안 취약점 검사 및 인증 테스트',
            test_cases: [],
            total_tests: 34,
            passed_tests: 32,
            failed_tests: 2,
            running_tests: 0,
            status: 'active',
            last_execution: '2024-01-15 14:15',
            average_duration: 120,
            success_rate: 94.1
        }
    ]);



    // 탭 정의
    const tabs = [
        { label: '품질 개요', icon: <QualityControl /> },
        { label: '테스트 스위트', icon: <TestTube /> },
        { label: '실행 결과', icon: <Assessment /> },
        { label: '성능 분석', icon: <Speed /> },
        { label: '실시간 차트', icon: <Analytics /> },
        { label: '알림 시스템', icon: <Notifications /> },
        { label: '실행 로그', icon: <Code /> },
        { label: 'AI 예측', icon: <Prediction /> },
        { label: '스케줄러', icon: <Schedule /> },
        { label: '품질 보고서', icon: <Article /> },
        { label: '설정', icon: <Settings /> }
    ];

    // 실시간 데이터 업데이트
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            // 품질 메트릭 업데이트 (더 현실적인 변화)
            setQualityMetrics(prev => prev.map(metric => {
                const change = (Math.random() - 0.5) * 1.5; // 더 부드러운 변화
                const newValue = Math.max(0, Math.min(100, metric.value + change));

                // 트렌드 업데이트
                let newTrend = metric.trend;
                if (change > 0.5) newTrend = 'up';
                else if (change < -0.5) newTrend = 'down';

                // 상태 업데이트
                let newStatus = metric.status;
                if (newValue >= 95) newStatus = 'excellent';
                else if (newValue >= 85) newStatus = 'good';
                else if (newValue >= 70) newStatus = 'warning';
                else newStatus = 'critical';

                return {
                    ...metric,
                    value: newValue,
                    trend: newTrend,
                    status: newStatus,
                    last_updated: new Date().toLocaleString('ko-KR')
                };
            }));

            // 성능 메트릭 업데이트 (더 현실적인 변화)
            setPerformanceMetrics(prev => prev.map(metric => {
                const change = (Math.random() - 0.5) * 8; // 더 부드러운 변화
                const newValue = Math.max(0, metric.value + change);

                // 트렌드 업데이트
                let newTrend = metric.trend;
                if (change > 2) newTrend = 'up';
                else if (change < -2) newTrend = 'down';

                // 상태 업데이트
                let newStatus = metric.status;
                const thresholdRatio = newValue / metric.threshold;
                if (thresholdRatio <= 0.7) newStatus = 'normal';
                else if (thresholdRatio <= 0.9) newStatus = 'warning';
                else newStatus = 'critical';

                return {
                    ...metric,
                    value: newValue,
                    trend: newTrend,
                    status: newStatus,
                    last_updated: new Date().toLocaleString('ko-KR')
                };
            }));





        }, refreshInterval * 1000);

        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval]);

    // 상태 색상 함수
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'excellent':
            case 'passed':
            case 'normal':
                return 'success';
            case 'good':
                return 'primary';
            case 'warning':
                return 'warning';
            case 'critical':
            case 'failed':
                return 'error';
            default:
                return 'default';
        }
    };

    // 트렌드 아이콘
    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up':
                return <TrendingUp color="success" />;
            case 'down':
                return <TrendingDown color="error" />;
            default:
                return <TrendingUp color="action" />;
        }
    };

    // 품질 개요 렌더링
    const renderQualityOverview = () => (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
                {/* 실시간 품질 메트릭 */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})` }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <AutoAwesome sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="h6" component="h2">
                                    실시간 품질 메트릭
                                </Typography>
                                <Box sx={{ ml: 'auto' }}>
                                    <Chip
                                        label="실시간"
                                        color="success"
                                        size="small"
                                        icon={<TrendingUp />}
                                    />
                                </Box>
                            </Box>
                            <Grid container spacing={2}>
                                {qualityMetrics.map((metric) => (
                                    <Grid item xs={12} sm={6} key={metric.id}>
                                        <Card variant="outlined" sx={{ p: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    {metric.name}
                                                </Typography>
                                                {getTrendIcon(metric.trend)}
                                            </Box>
                                            <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                                                {metric.value.toFixed(1)}
                                                <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                                    / {metric.target}
                                                </Typography>
                                            </Typography>
                                            <LinearProgress
                                                variant="determinate"
                                                value={(metric.value / metric.target) * 100}
                                                color={getStatusColor(metric.status) as any}
                                                sx={{ mb: 1 }}
                                            />
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Chip
                                                    label={metric.status}
                                                    color={getStatusColor(metric.status) as any}
                                                    size="small"
                                                />
                                                <Typography variant="caption" color="text.secondary">
                                                    {metric.last_updated}
                                                </Typography>
                                            </Box>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 실행 중인 테스트 */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.info.main, 0.1)})` }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <PlayArrow sx={{ mr: 1, color: 'warning.main' }} />
                                <Typography variant="h6" component="h2">
                                    실행 중인 테스트
                                </Typography>
                                <Badge badgeContent={runningTests.length} color="warning" sx={{ ml: 'auto' }} />
                            </Box>
                            <List dense>
                                {runningTests.map((test) => (
                                    <ListItem key={test.id} sx={{ px: 0 }}>
                                        <ListItemIcon>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'warning.main' }}>
                                                <PlayArrow fontSize="small" />
                                            </Avatar>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={test.name}
                                            secondary={`${test.duration}s • ${test.test_type}`}
                                        />
                                        <Chip
                                            label={test.status}
                                            color="warning"
                                            size="small"
                                        />
                                    </ListItem>
                                ))}
                            </List>
                            <Button
                                variant="outlined"
                                fullWidth
                                startIcon={<Add />}
                                sx={{ mt: 2 }}
                                onClick={() => setTestExecutionDialog(true)}
                            >
                                새 테스트 실행
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 성능 메트릭 */}
                <Grid item xs={12}>
                    <Card sx={{ background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.1)})` }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <SpeedIcon sx={{ mr: 1, color: 'success.main' }} />
                                <Typography variant="h6" component="h2">
                                    성능 모니터링
                                </Typography>
                            </Box>
                            <Grid container spacing={3}>
                                {performanceMetrics.map((metric) => (
                                    <Grid item xs={12} sm={6} md={3} key={metric.id}>
                                        <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                                                {metric.id === 'response-time' && <SpeedIcon color="primary" />}
                                                {metric.id === 'throughput' && <NetworkIcon color="success" />}
                                                {metric.id === 'cpu-usage' && <MemoryIcon color="warning" />}
                                                {metric.id === 'memory-usage' && <StorageIcon color="info" />}
                                            </Box>
                                            <Typography variant="h5" component="div" sx={{ mb: 1 }}>
                                                {metric.value.toFixed(1)}
                                                <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                                    {metric.unit}
                                                </Typography>
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                {metric.name}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {getTrendIcon(metric.trend)}
                                                <Chip
                                                    label={metric.status}
                                                    color={getStatusColor(metric.status) as any}
                                                    size="small"
                                                    sx={{ ml: 1 }}
                                                />
                                            </Box>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );

    // 테스트 스위트 렌더링
    const renderTestSuites = () => (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TestTube sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" component="h2">
                    테스트 스위트 관리
                </Typography>
                <Box sx={{ ml: 'auto' }}>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setTestExecutionDialog(true)}
                    >
                        새 스위트 생성
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {testSuites.map((suite) => (
                    <Grid item xs={12} md={6} lg={4} key={suite.id}>
                        <Card
                            sx={{
                                height: '100%',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: theme.shadows[8]
                                }
                            }}
                            onClick={() => setSelectedTestSuite(suite)}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                                        <TestTube />
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="h6" component="h3">
                                            {suite.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {suite.description}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={suite.status}
                                        color={suite.status === 'active' ? 'success' : 'default'}
                                        size="small"
                                    />
                                </Box>

                                <Grid container spacing={2} sx={{ mb: 2 }}>
                                    <Grid item xs={6}>
                                        <Typography variant="h4" color="success.main">
                                            {suite.passed_tests}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            통과
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="h4" color="error.main">
                                            {suite.failed_tests}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            실패
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <LinearProgress
                                    variant="determinate"
                                    value={suite.success_rate}
                                    color={suite.success_rate >= 95 ? 'success' : suite.success_rate >= 80 ? 'warning' : 'error'}
                                    sx={{ mb: 1 }}
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        성공률: {suite.success_rate.toFixed(1)}%
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {suite.last_execution}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );

    // 실행 결과 렌더링
    const renderExecutionResults = () => (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Assessment sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" component="h2">
                    테스트 실행 결과
                </Typography>
                <Box sx={{ ml: 'auto' }}>
                    <Button
                        variant="outlined"
                        startIcon={<Download />}
                        sx={{ mr: 1 }}
                    >
                        결과 내보내기
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Refresh />}
                    >
                        새로고침
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper} sx={{ boxShadow: theme.shadows[2] }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                            <TableCell>테스트 이름</TableCell>
                            <TableCell>유형</TableCell>
                            <TableCell>상태</TableCell>
                            <TableCell>우선순위</TableCell>
                            <TableCell>지속시간</TableCell>
                            <TableCell>성공률</TableCell>
                            <TableCell>마지막 실행</TableCell>
                            <TableCell>작업</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {runningTests.map((test) => (
                            <TableRow key={test.id} hover>
                                <TableCell>
                                    <Box>
                                        <Typography variant="body2" fontWeight="medium">
                                            {test.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {test.description}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={test.test_type}
                                        size="small"
                                        color={test.test_type === 'functional' ? 'primary' :
                                            test.test_type === 'performance' ? 'warning' : 'error'}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={test.status}
                                        color={getStatusColor(test.status) as any}
                                        size="small"
                                        icon={test.status === 'running' ? <PlayArrow /> : undefined}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={test.priority}
                                        color={test.priority === 'critical' ? 'error' :
                                            test.priority === 'high' ? 'warning' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{test.duration}s</TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body2" sx={{ mr: 1 }}>
                                            {test.success_rate.toFixed(1)}%
                                        </Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={test.success_rate}
                                            sx={{ width: 60, height: 6, borderRadius: 3 }}
                                            color={test.success_rate >= 95 ? 'success' : 'warning'}
                                        />
                                    </Box>
                                </TableCell>
                                <TableCell>{test.last_run}</TableCell>
                                <TableCell>
                                    <IconButton size="small" color="primary">
                                        <Visibility />
                                    </IconButton>
                                    <IconButton size="small" color="secondary">
                                        <Edit />
                                    </IconButton>
                                    <IconButton size="small" color="error">
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );

    // 성능 분석 렌더링
    const renderPerformanceAnalysis = () => (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Speed sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" component="h2">
                    성능 분석 및 최적화
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {performanceMetrics.map((metric) => (
                    <Grid item xs={12} sm={6} md={3} key={metric.id}>
                        <Card sx={{
                            height: '100%',
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{
                                        bgcolor: getStatusColor(metric.status) === 'success' ? 'success.main' :
                                            getStatusColor(metric.status) === 'warning' ? 'warning.main' : 'error.main',
                                        mr: 2
                                    }}>
                                        {metric.id === 'response-time' && <SpeedIcon />}
                                        {metric.id === 'throughput' && <NetworkIcon />}
                                        {metric.id === 'cpu-usage' && <MemoryIcon />}
                                        {metric.id === 'memory-usage' && <StorageIcon />}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="h6" component="h3">
                                            {metric.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            임계값: {metric.threshold} {metric.unit}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Typography variant="h4" component="div" sx={{ mb: 2, textAlign: 'center' }}>
                                    {metric.value.toFixed(1)}
                                    <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                        {metric.unit}
                                    </Typography>
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                    {getTrendIcon(metric.trend)}
                                    <Chip
                                        label={metric.status}
                                        color={getStatusColor(metric.status) as any}
                                        size="small"
                                    />
                                </Box>

                                <LinearProgress
                                    variant="determinate"
                                    value={(metric.value / metric.threshold) * 100}
                                    color={getStatusColor(metric.status) as any}
                                    sx={{ mb: 1 }}
                                />

                                <Typography variant="caption" color="text.secondary" align="center" display="block">
                                    {metric.last_updated}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );

    // 실시간 차트 렌더링
    const renderRealTimeCharts = () => (
        <Box sx={{ p: 3 }}>
            <QualityMetricsChart />
        </Box>
    );

    // 알림 시스템 렌더링
    const renderNotificationSystem = () => (
        <Box sx={{ p: 3 }}>
            <QualityNotificationSystem />
        </Box>
    );

    // 실행 로그 렌더링
    const renderExecutionLog = () => (
        <Box sx={{ p: 3 }}>
            <TestExecutionLog />
        </Box>
    );

    // AI 예측 렌더링
    const renderAIPrediction = () => (
        <Box sx={{ p: 3 }}>
            <AIQualityPrediction />
        </Box>
    );

    // 스케줄러 렌더링
    const renderScheduler = () => (
        <Box sx={{ p: 3 }}>
            <AutomatedTestScheduler />
        </Box>
    );

    // 품질 보고서 렌더링
    const renderQualityReports = () => (
        <Box sx={{ p: 3 }}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.1)})` }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Article sx={{ mr: 1, color: 'info.main' }} />
                        <Typography variant="h5" component="h2">
                            품질 보고서 생성
                        </Typography>
                        <Box sx={{ ml: 'auto' }}>
                            <Button
                                variant="contained"
                                startIcon={<Download />}
                                sx={{ mr: 1 }}
                            >
                                PDF 다운로드
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Download />}
                            >
                                Excel 내보내기
                            </Button>
                        </Box>
                    </Box>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        일일 품질 요약
                                    </Typography>
                                    <List dense>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckCircle color="success" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="전체 테스트 통과율: 94.2%"
                                                secondary="목표 대비 +2.1%"
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <Warning color="warning" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="성능 저하 감지: 3건"
                                                secondary="응답 시간 증가"
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <Error color="error" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="중요 결함: 1건"
                                                secondary="보안 취약점 발견"
                                            />
                                        </ListItem>
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        주간 트렌드
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <TrendingUp color="success" sx={{ mr: 1 }} />
                                        <Typography variant="body1">
                                            품질 점수 개선 추세
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <TrendingDown color="warning" sx={{ mr: 1 }} />
                                        <Typography variant="body1">
                                            테스트 실행 시간 증가
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <TrendingUp color="info" sx={{ mr: 1 }} />
                                        <Typography variant="body1">
                                            자동화율 안정적 유지
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );

    // 설정 렌더링
    const renderSettings = () => (
        <Box sx={{ p: 3 }}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.1)})` }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Settings sx={{ mr: 1, color: 'secondary.main' }} />
                        <Typography variant="h5" component="h2">
                            시스템 설정
                        </Typography>
                    </Box>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        자동화 설정
                                    </Typography>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={autoRefresh}
                                                onChange={(e) => setAutoRefresh(e.target.checked)}
                                            />
                                        }
                                        label="실시간 데이터 자동 새로고침"
                                    />
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2" gutterBottom>
                                            새로고침 간격: {refreshInterval}초
                                        </Typography>
                                        <Slider
                                            value={refreshInterval}
                                            onChange={(_, value) => setRefreshInterval(value as number)}
                                            min={5}
                                            max={60}
                                            step={5}
                                            marks
                                            valueLabelDisplay="auto"
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        알림 설정
                                    </Typography>
                                    <FormControlLabel
                                        control={<Switch defaultChecked />}
                                        label="이메일 알림"
                                    />
                                    <FormControlLabel
                                        control={<Switch defaultChecked />}
                                        label="브라우저 알림"
                                    />
                                    <FormControlLabel
                                        control={<Switch />}
                                        label="음성 알림"
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );

    // 콘텐츠 렌더링
    const renderContent = () => {
        switch (selectedTab) {
            case 0: return renderQualityOverview();
            case 1: return renderTestSuites();
            case 2: return renderExecutionResults();
            case 3: return renderPerformanceAnalysis();
            case 4: return renderRealTimeCharts();
            case 5: return renderNotificationSystem();
            case 6: return renderExecutionLog();
            case 7: return renderAIPrediction();
            case 8: return renderScheduler();
            case 9: return renderQualityReports();
            case 10: return renderSettings();
            default: return renderQualityOverview();
        }
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            {/* 사이드바 */}
            <Drawer
                variant="permanent"
                sx={{
                    width: 280,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: 280,
                        boxSizing: 'border-box',
                        background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
                        borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                    }
                }}
            >
                <Toolbar sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    color: 'white'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Science sx={{ mr: 1 }} />
                        <Typography variant="h6" noWrap component="div">
                            AI 품질 보증
                        </Typography>
                    </Box>
                    <IconButton
                        color="inherit"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                    >
                        {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                    </IconButton>
                </Toolbar>

                <Box sx={{ overflow: 'auto', mt: 2 }}>
                    <List>
                        {tabs.map((tab, index) => (
                            <ListItem key={index} disablePadding>
                                <ListItemButton
                                    selected={selectedTab === index}
                                    onClick={() => setSelectedTab(index)}
                                    sx={{
                                        mx: 1,
                                        borderRadius: 1,
                                        '&.Mui-selected': {
                                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.secondary.main, 0.2)})`,
                                            '&:hover': {
                                                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.3)}, ${alpha(theme.palette.secondary.main, 0.3)})`
                                            }
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{ color: selectedTab === index ? 'primary.main' : 'inherit' }}>
                                        {tab.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={tab.label} />
                                    {index === 5 && notificationCount > 0 && (
                                        <Badge badgeContent={notificationCount} color="error" />
                                    )}
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>

            {/* 메인 콘텐츠 */}
            <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {/* 상단 앱바 */}
                <AppBar
                    position="static"
                    elevation={0}
                    sx={{
                        background: 'transparent',
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                    }}
                >
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                            onClick={() => setDrawerOpen(!drawerOpen)}
                        >
                            <Menu />
                        </IconButton>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            {tabs[selectedTab]?.label}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                                label={autoRefresh ? '실시간' : '수동'}
                                color={autoRefresh ? 'success' : 'default'}
                                size="small"
                            />
                            <IconButton color="inherit">
                                <Refresh />
                            </IconButton>
                            <IconButton color="inherit">
                                <MoreVert />
                            </IconButton>
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* 콘텐츠 영역 */}
                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                    {renderContent()}
                </Box>
            </Box>

            {/* 테스트 실행 다이얼로그 */}
            <Dialog
                open={testExecutionDialog}
                onClose={() => setTestExecutionDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PlayArrow sx={{ mr: 1, color: 'primary.main' }} />
                        새 테스트 실행
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>테스트 스위트 선택</InputLabel>
                                <Select label="테스트 스위트 선택">
                                    {testSuites.map((suite) => (
                                        <MenuItem key={suite.id} value={suite.id}>
                                            {suite.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>우선순위</InputLabel>
                                <Select label="우선순위">
                                    <MenuItem value="low">낮음</MenuItem>
                                    <MenuItem value="medium">보통</MenuItem>
                                    <MenuItem value="high">높음</MenuItem>
                                    <MenuItem value="critical">긴급</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="실행 메모"
                                placeholder="테스트 실행에 대한 추가 정보를 입력하세요..."
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTestExecutionDialog(false)}>
                        취소
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<PlayArrow />}
                        onClick={() => setTestExecutionDialog(false)}
                    >
                        실행 시작
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 플로팅 액션 버튼 */}
            <Fab
                color="primary"
                aria-label="add"
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
                onClick={() => setTestExecutionDialog(true)}
            >
                <Add />
            </Fab>
        </Box>
    );
};

export default AdvancedAIQualityAssuranceDashboard;
