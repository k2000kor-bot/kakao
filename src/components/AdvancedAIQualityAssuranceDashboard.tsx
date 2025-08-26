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
    CircularProgress
} from '@mui/material';
import {
    BugReport,
    Speed,
    Security,
    AccountCircle as Usability,
    Verified,
    TrendingUp,
    TrendingDown,
    TrendingFlat,
    CheckCircle,
    Warning,
    Error,
    Refresh,
    Fullscreen,
    FullscreenExit,
    Settings,
    Timeline,
    Assessment,
    Build,
    Visibility,
    ExpandMore,
    PlayArrow,
    Stop,
    Pause,
    Undo,
    SmartToy,
    Analytics,
    ModelTraining,
    Book,
    Article,
    CodeOff,
    Code as CodeRounded,
    Science,
    Quiz,
    Science as TestTube,
    HighQuality as QualityControl,
    AutoFixHigh
} from '@mui/icons-material';

interface QualityTestSuite {
    id: string;
    name: string;
    description: string;
    category: 'functional' | 'performance' | 'security' | 'usability' | 'reliability' | 'compatibility';
    test_cases: QualityTestCase[];
    execution_schedule: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    created_date: Date;
    last_executed: Date;
    status: 'active' | 'inactive' | 'maintenance';
}

interface QualityTestCase {
    id: string;
    name: string;
    description: string;
    test_type: 'unit' | 'integration' | 'system' | 'acceptance' | 'regression' | 'stress';
    input_data: any;
    expected_output: any;
    validation_rules: ValidationRule[];
    timeout_ms: number;
    retry_count: number;
    tags: string[];
}

interface ValidationRule {
    id: string;
    name: string;
    rule_type: 'accuracy' | 'response_time' | 'format' | 'content' | 'security' | 'compliance';
    condition: string;
    threshold: number;
    operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'matches';
    severity: 'critical' | 'high' | 'medium' | 'low';
}

interface QualityTestResult {
    id: string;
    test_case_id: string;
    test_suite_id: string;
    execution_id: string;
    timestamp: Date;
    status: 'passed' | 'failed' | 'skipped' | 'error';
    execution_time_ms: number;
    actual_output: any;
    validation_results: ValidationResult[];
    error_message?: string;
    performance_metrics: PerformanceMetrics;
    quality_score: number;
}

interface ValidationResult {
    rule_id: string;
    rule_name: string;
    status: 'passed' | 'failed' | 'warning';
    actual_value: any;
    expected_value: any;
    deviation: number;
    message: string;
}

interface PerformanceMetrics {
    response_time_ms: number;
    memory_usage_mb: number;
    cpu_usage_percent: number;
    throughput_rps: number;
    error_rate: number;
    availability: number;
}

interface QualityReport {
    id: string;
    execution_id: string;
    generated_date: Date;
    test_suite_id: string;
    total_tests: number;
    passed_tests: number;
    failed_tests: number;
    skipped_tests: number;
    overall_quality_score: number;
    execution_time_ms: number;
    coverage_percentage: number;
    performance_summary: PerformanceMetrics;
    quality_trends: QualityTrend[];
    recommendations: string[];
}

interface QualityTrend {
    date: Date;
    quality_score: number;
    test_count: number;
    pass_rate: number;
    performance_score: number;
}

interface QualityMetrics {
    total_test_suites: number;
    active_test_suites: number;
    total_test_cases: number;
    last_execution_date: Date;
    overall_pass_rate: number;
    average_quality_score: number;
    critical_failures: number;
    performance_degradation: number;
    test_coverage: number;
    automation_rate: number;
}

interface AutomatedTestExecution {
    id: string;
    test_suite_id: string;
    start_time: Date;
    end_time?: Date;
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    progress_percentage: number;
    current_test_case?: string;
    results: QualityTestResult[];
    summary: ExecutionSummary;
}

interface ExecutionSummary {
    total_tests: number;
    completed_tests: number;
    passed_tests: number;
    failed_tests: number;
    average_execution_time: number;
    quality_score: number;
    performance_score: number;
}

const AdvancedAIQualityAssuranceDashboard: React.FC = () => {
    const [testSuites, setTestSuites] = useState<QualityTestSuite[]>([]);
    const [testResults, setTestResults] = useState<QualityTestResult[]>([]);
    const [qualityReports, setQualityReports] = useState<QualityReport[]>([]);
    const [activeExecutions, setActiveExecutions] = useState<AutomatedTestExecution[]>([]);
    const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);
    const [selectedTab, setSelectedTab] = useState(0);
    const [fullscreen, setFullscreen] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [selectedExecution, setSelectedExecution] = useState<AutomatedTestExecution | null>(null);
    const [executionDialogOpen, setExecutionDialogOpen] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    // 탭 정의
    const tabs = [
        { label: '품질 개요', icon: <QualityControl /> },
        { label: '테스트 스위트', icon: <TestTube /> },
        { label: '실행 결과', icon: <Assessment /> },
        { label: '성능 분석', icon: <Speed /> },
        { label: '품질 보고서', icon: <Article /> },
        { label: '설정', icon: <Settings /> }
    ];

    // 데이터 새로고침
    const refreshData = async () => {
        try {
            // 실제로는 API 호출
            const mockTestSuites: QualityTestSuite[] = [
                {
                    id: 'functional-test-suite',
                    name: 'AI 기능 테스트 스위트',
                    description: 'AI 서비스의 기능적 정확성을 검증하는 테스트',
                    category: 'functional',
                    test_cases: [
                        {
                            id: 'accuracy-test',
                            name: '응답 정확성 테스트',
                            description: 'AI 응답의 정확성을 검증',
                            test_type: 'functional',
                            input_data: { question: '오늘 날씨는 어떤가요?' },
                            expected_output: { accuracy: 0.9 },
                            validation_rules: [
                                {
                                    id: 'accuracy-rule',
                                    name: '정확성 기준',
                                    rule_type: 'accuracy',
                                    condition: 'accuracy >= 0.85',
                                    threshold: 0.85,
                                    operator: 'greater_than',
                                    severity: 'high'
                                }
                            ],
                            timeout_ms: 5000,
                            retry_count: 3,
                            tags: ['accuracy', 'functional']
                        }
                    ],
                    execution_schedule: '0 */6 * * *',
                    priority: 'critical',
                    created_date: new Date(),
                    last_executed: new Date(),
                    status: 'active'
                },
                {
                    id: 'performance-test-suite',
                    name: 'AI 성능 테스트 스위트',
                    description: 'AI 서비스의 성능을 검증하는 테스트',
                    category: 'performance',
                    test_cases: [
                        {
                            id: 'response-time-test',
                            name: '응답 시간 테스트',
                            description: 'AI 서비스의 응답 시간을 측정',
                            test_type: 'performance',
                            input_data: { question: '간단한 질문입니다.' },
                            expected_output: { response_time: 500 },
                            validation_rules: [
                                {
                                    id: 'response-time-rule',
                                    name: '응답 시간 기준',
                                    rule_type: 'response_time',
                                    condition: 'response_time <= 1000',
                                    threshold: 1000,
                                    operator: 'less_than',
                                    severity: 'high'
                                }
                            ],
                            timeout_ms: 2000,
                            retry_count: 3,
                            tags: ['performance', 'response-time']
                        }
                    ],
                    execution_schedule: '0 */12 * * *',
                    priority: 'high',
                    created_date: new Date(),
                    last_executed: new Date(),
                    status: 'active'
                },
                {
                    id: 'security-test-suite',
                    name: 'AI 보안 테스트 스위트',
                    description: 'AI 서비스의 보안을 검증하는 테스트',
                    category: 'security',
                    test_cases: [
                        {
                            id: 'injection-test',
                            name: '인젝션 공격 테스트',
                            description: 'SQL 인젝션 및 기타 인젝션 공격 방어 테스트',
                            test_type: 'security',
                            input_data: { malicious_input: "'; DROP TABLE users; --" },
                            expected_output: { vulnerability_score: 0 },
                            validation_rules: [
                                {
                                    id: 'injection-rule',
                                    name: '인젝션 방어 기준',
                                    rule_type: 'security',
                                    condition: 'vulnerability_score <= 0.1',
                                    threshold: 0.1,
                                    operator: 'less_than',
                                    severity: 'critical'
                                }
                            ],
                            timeout_ms: 5000,
                            retry_count: 2,
                            tags: ['security', 'injection']
                        }
                    ],
                    execution_schedule: '0 0 * * *',
                    priority: 'critical',
                    created_date: new Date(),
                    last_executed: new Date(),
                    status: 'active'
                }
            ];

            const mockTestResults: QualityTestResult[] = [
                {
                    id: 'result-1',
                    test_case_id: 'accuracy-test',
                    test_suite_id: 'functional-test-suite',
                    execution_id: 'exec-1',
                    timestamp: new Date(),
                    status: 'passed',
                    execution_time_ms: 1250,
                    actual_output: { accuracy: 0.92 },
                    validation_results: [
                        {
                            rule_id: 'accuracy-rule',
                            rule_name: '정확성 기준',
                            status: 'passed',
                            actual_value: 0.92,
                            expected_value: 0.85,
                            deviation: 0.07,
                            message: '정확도: 0.920 (기준: 0.85)'
                        }
                    ],
                    performance_metrics: {
                        response_time_ms: 245,
                        memory_usage_mb: 85,
                        cpu_usage_percent: 45,
                        throughput_rps: 95,
                        error_rate: 0.02,
                        availability: 0.99
                    },
                    quality_score: 0.94
                },
                {
                    id: 'result-2',
                    test_case_id: 'response-time-test',
                    test_suite_id: 'performance-test-suite',
                    execution_id: 'exec-2',
                    timestamp: new Date(Date.now() - 3600000),
                    status: 'failed',
                    execution_time_ms: 1850,
                    actual_output: { response_time: 1200 },
                    validation_results: [
                        {
                            rule_id: 'response-time-rule',
                            rule_name: '응답 시간 기준',
                            status: 'failed',
                            actual_value: 1200,
                            expected_value: 1000,
                            deviation: 200,
                            message: '응답 시간: 1200ms (기준: 1000ms 이하)'
                        }
                    ],
                    performance_metrics: {
                        response_time_ms: 1200,
                        memory_usage_mb: 120,
                        cpu_usage_percent: 75,
                        throughput_rps: 65,
                        error_rate: 0.08,
                        availability: 0.95
                    },
                    quality_score: 0.68
                }
            ];

            const mockActiveExecutions: AutomatedTestExecution[] = [
                {
                    id: 'exec-running-1',
                    test_suite_id: 'functional-test-suite',
                    start_time: new Date(Date.now() - 120000),
                    status: 'running',
                    progress_percentage: 65,
                    current_test_case: '응답 정확성 테스트',
                    results: [],
                    summary: {
                        total_tests: 5,
                        completed_tests: 3,
                        passed_tests: 2,
                        failed_tests: 1,
                        average_execution_time: 850,
                        quality_score: 0.82,
                        performance_score: 0.78
                    }
                }
            ];

            const mockQualityReports: QualityReport[] = [
                {
                    id: 'report-1',
                    execution_id: 'exec-1',
                    generated_date: new Date(),
                    test_suite_id: 'functional-test-suite',
                    total_tests: 5,
                    passed_tests: 4,
                    failed_tests: 1,
                    skipped_tests: 0,
                    overall_quality_score: 0.88,
                    execution_time_ms: 4250,
                    coverage_percentage: 92.5,
                    performance_summary: {
                        response_time_ms: 325,
                        memory_usage_mb: 95,
                        cpu_usage_percent: 55,
                        throughput_rps: 85,
                        error_rate: 0.04,
                        availability: 0.98
                    },
                    quality_trends: [
                        {
                            date: new Date(Date.now() - 6 * 86400000),
                            quality_score: 0.82,
                            test_count: 15,
                            pass_rate: 0.87,
                            performance_score: 0.75
                        },
                        {
                            date: new Date(Date.now() - 5 * 86400000),
                            quality_score: 0.85,
                            test_count: 15,
                            pass_rate: 0.90,
                            performance_score: 0.78
                        },
                        {
                            date: new Date(Date.now() - 4 * 86400000),
                            quality_score: 0.88,
                            test_count: 15,
                            pass_rate: 0.93,
                            performance_score: 0.82
                        }
                    ],
                    recommendations: [
                        '성능 테스트에서 응답 시간이 기준을 초과했습니다. 최적화가 필요합니다.',
                        '전체적인 품질 점수가 향상되고 있습니다. 현재 수준을 유지하세요.',
                        '테스트 커버리지가 92.5%입니다. 95% 목표 달성을 위해 추가 테스트가 필요합니다.'
                    ]
                }
            ];

            const mockQualityMetrics: QualityMetrics = {
                total_test_suites: 3,
                active_test_suites: 3,
                total_test_cases: 15,
                last_execution_date: new Date(),
                overall_pass_rate: 0.89,
                average_quality_score: 0.85,
                critical_failures: 1,
                performance_degradation: 0.05,
                test_coverage: 92.5,
                automation_rate: 98.5
            };

            setTestSuites(mockTestSuites);
            setTestResults(mockTestResults);
            setActiveExecutions(mockActiveExecutions);
            setQualityReports(mockQualityReports);
            setQualityMetrics(mockQualityMetrics);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('품질 보증 데이터 새로고침 오류:', error);
        }
    };

    // 자동 새로고침
    useEffect(() => {
        refreshData();

        if (autoRefresh) {
            const interval = setInterval(refreshData, 15000); // 15초마다
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    // 우선순위 색상
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'error';
            case 'high': return 'warning';
            case 'medium': return 'info';
            case 'low': return 'success';
            default: return 'default';
        }
    };

    // 카테고리 색상
    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'functional': return 'primary';
            case 'performance': return 'warning';
            case 'security': return 'error';
            case 'usability': return 'info';
            case 'reliability': return 'success';
            case 'compatibility': return 'secondary';
            default: return 'default';
        }
    };

    // 상태 색상
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'passed': return 'success';
            case 'failed': return 'error';
            case 'skipped': return 'warning';
            case 'error': return 'error';
            case 'running': return 'info';
            case 'completed': return 'success';
            case 'cancelled': return 'default';
            default: return 'default';
        }
    };

    const renderQualityOverview = () => (
        <Grid container spacing={3}>
            {/* 품질 메트릭 카드들 */}
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <TestTube color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">활성 테스트 스위트</Typography>
                        </Box>
                        <Typography variant="h4" color="primary">
                            {qualityMetrics?.active_test_suites || 0}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            총 {qualityMetrics?.total_test_suites || 0}개 스위트 중
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <CheckCircle color="success" sx={{ mr: 1 }} />
                            <Typography variant="h6">전체 통과율</Typography>
                        </Box>
                        <Typography variant="h4" color="success.main">
                            {((qualityMetrics?.overall_pass_rate || 0) * 100).toFixed(1)}%
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            테스트 통과 비율
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <QualityControl color="info" sx={{ mr: 1 }} />
                            <Typography variant="h6">평균 품질 점수</Typography>
                        </Box>
                        <Typography variant="h4" color="info.main">
                            {((qualityMetrics?.average_quality_score || 0) * 100).toFixed(0)}%
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            품질 평가 평균 점수
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Warning color="warning" sx={{ mr: 1 }} />
                            <Typography variant="h6">중요 실패</Typography>
                        </Box>
                        <Typography variant="h4" color="warning.main">
                            {qualityMetrics?.critical_failures || 0}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            중요도 높은 테스트 실패
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            {/* 실행 중인 테스트 */}
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>실행 중인 테스트</Typography>
                        {activeExecutions.length > 0 ? (
                            activeExecutions.map((execution) => (
                                <Box key={execution.id} mb={2}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                        <Typography variant="body1" fontWeight="medium">
                                            {testSuites.find(s => s.id === execution.test_suite_id)?.name || '알 수 없는 스위트'}
                                        </Typography>
                                        <Chip
                                            label={execution.status}
                                            size="small"
                                            color={getStatusColor(execution.status) as any}
                                        />
                                    </Box>
                                    <Box display="flex" alignItems="center" mb={1}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={execution.progress_percentage}
                                            sx={{ flexGrow: 1, mr: 2, height: 8 }}
                                        />
                                        <Typography variant="body2">
                                            {execution.progress_percentage.toFixed(0)}%
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="textSecondary">
                                        현재: {execution.current_test_case || '준비 중'}
                                    </Typography>
                                </Box>
                            ))
                        ) : (
                            <Alert severity="info">현재 실행 중인 테스트가 없습니다.</Alert>
                        )}
                    </CardContent>
                </Card>
            </Grid>

            {/* 최근 테스트 결과 */}
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>최근 테스트 결과</Typography>
                        <List dense>
                            {testResults.slice(0, 5).map((result) => (
                                <ListItem key={result.id} divider>
                                    <ListItemIcon>
                                        <Chip
                                            label={result.status}
                                            size="small"
                                            color={getStatusColor(result.status) as any}
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={testSuites.find(s => s.id === result.test_suite_id)?.name || '알 수 없는 스위트'}
                                        secondary={`품질 점수: ${(result.quality_score * 100).toFixed(0)}% • ${result.timestamp.toLocaleString()}`}
                                    />
                                    <Typography variant="body2" color="textSecondary">
                                        {result.execution_time_ms}ms
                                    </Typography>
                                </ListItem>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            </Grid>

            {/* 품질 트렌드 */}
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>품질 트렌드</Typography>
                        {qualityReports.length > 0 && qualityReports[0].quality_trends && (
                            <Box>
                                {qualityReports[0].quality_trends.map((trend, index) => (
                                    <Box key={index} mb={2}>
                                        <Box display="flex" justifyContent="space-between" mb={1}>
                                            <Typography variant="body2">
                                                {trend.date.toLocaleDateString()}
                                            </Typography>
                                            <Typography variant="body2" fontWeight="medium">
                                                품질: {(trend.quality_score * 100).toFixed(0)}% |
                                                통과율: {(trend.pass_rate * 100).toFixed(0)}%
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={trend.quality_score * 100}
                                            sx={{ height: 8, borderRadius: 4 }}
                                            color={trend.quality_score > 0.8 ? 'success' : trend.quality_score > 0.6 ? 'warning' : 'error'}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    const renderTestSuites = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>테스트 스위트 관리</Typography>
                        {testSuites.map((suite) => (
                            <Accordion key={suite.id} sx={{ mb: 2 }}>
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Box display="flex" alignItems="center" width="100%">
                                        <Chip
                                            label={suite.category}
                                            size="small"
                                            color={getCategoryColor(suite.category) as any}
                                            sx={{ mr: 1 }}
                                        />
                                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                            {suite.name}
                                        </Typography>
                                        <Box display="flex" gap={1}>
                                            <Chip
                                                label={suite.priority}
                                                size="small"
                                                color={getPriorityColor(suite.priority) as any}
                                            />
                                            <Chip
                                                label={suite.status}
                                                size="small"
                                                color={suite.status === 'active' ? 'success' : 'default'}
                                            />
                                        </Box>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <Typography variant="body1" mb={2}>
                                                {suite.description}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle2" mb={1}>테스트 케이스</Typography>
                                            <List dense>
                                                {suite.test_cases.map((testCase) => (
                                                    <ListItem key={testCase.id}>
                                                        <ListItemIcon>
                                                            <Chip
                                                                label={testCase.test_type}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            primary={testCase.name}
                                                            secondary={testCase.description}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle2" mb={1}>실행 정보</Typography>
                                            <Box>
                                                <Typography variant="body2" mb={1}>
                                                    스케줄: {suite.execution_schedule}
                                                </Typography>
                                                <Typography variant="body2" mb={1}>
                                                    마지막 실행: {suite.last_executed.toLocaleString()}
                                                </Typography>
                                                <Typography variant="body2">
                                                    테스트 케이스: {suite.test_cases.length}개
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Box display="flex" gap={1}>
                                                <Button variant="contained" size="small" startIcon={<PlayArrow />}>
                                                    실행
                                                </Button>
                                                <Button variant="outlined" size="small">
                                                    편집
                                                </Button>
                                                <Button variant="outlined" size="small">
                                                    복사
                                                </Button>
                                                <Button variant="outlined" size="small" color="error">
                                                    비활성화
                                                </Button>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    const renderExecutionResults = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>테스트 실행 결과</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>테스트 케이스</TableCell>
                                        <TableCell>스위트</TableCell>
                                        <TableCell>상태</TableCell>
                                        <TableCell>품질 점수</TableCell>
                                        <TableCell>실행 시간</TableCell>
                                        <TableCell>응답 시간</TableCell>
                                        <TableCell>실행 일시</TableCell>
                                        <TableCell>작업</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {testResults.map((result) => (
                                        <TableRow key={result.id}>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {result.test_case_id}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {testSuites.find(s => s.id === result.test_suite_id)?.name || '알 수 없음'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={result.status}
                                                    size="small"
                                                    color={getStatusColor(result.status) as any}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center">
                                                    <Typography variant="body2" sx={{ mr: 1 }}>
                                                        {(result.quality_score * 100).toFixed(0)}%
                                                    </Typography>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={result.quality_score * 100}
                                                        sx={{ width: 60, height: 6 }}
                                                        color={result.quality_score > 0.8 ? 'success' : result.quality_score > 0.6 ? 'warning' : 'error'}
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {result.execution_time_ms}ms
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {result.performance_metrics.response_time_ms}ms
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {result.timestamp.toLocaleString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="outlined" size="small">
                                                    상세 보기
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    const renderPerformanceAnalysis = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>성능 메트릭 요약</Typography>
                        {qualityReports.length > 0 && (
                            <Box>
                                <Box display="flex" justifyContent="space-between" mb={2}>
                                    <Typography variant="body1">평균 응답 시간</Typography>
                                    <Typography variant="h6" color="primary">
                                        {qualityReports[0].performance_summary.response_time_ms}ms
                                    </Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between" mb={2}>
                                    <Typography variant="body1">처리량</Typography>
                                    <Typography variant="h6" color="success.main">
                                        {qualityReports[0].performance_summary.throughput_rps} RPS
                                    </Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between" mb={2}>
                                    <Typography variant="body1">가용성</Typography>
                                    <Typography variant="h6" color="info.main">
                                        {(qualityReports[0].performance_summary.availability * 100).toFixed(1)}%
                                    </Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body1">오류율</Typography>
                                    <Typography variant="h6" color="error.main">
                                        {(qualityReports[0].performance_summary.error_rate * 100).toFixed(1)}%
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>리소스 사용률</Typography>
                        {qualityReports.length > 0 && (
                            <Box>
                                <Box mb={2}>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="body2">메모리 사용량</Typography>
                                        <Typography variant="body2" fontWeight="medium">
                                            {qualityReports[0].performance_summary.memory_usage_mb}MB
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={(qualityReports[0].performance_summary.memory_usage_mb / 200) * 100}
                                        sx={{ height: 8, borderRadius: 4 }}
                                        color="info"
                                    />
                                </Box>
                                <Box mb={2}>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="body2">CPU 사용률</Typography>
                                        <Typography variant="body2" fontWeight="medium">
                                            {qualityReports[0].performance_summary.cpu_usage_percent}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={qualityReports[0].performance_summary.cpu_usage_percent}
                                        sx={{ height: 8, borderRadius: 4 }}
                                        color={qualityReports[0].performance_summary.cpu_usage_percent > 80 ? 'error' : 'warning'}
                                    />
                                </Box>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>성능 저하 분석</Typography>
                        {qualityMetrics && (
                            <Box>
                                <Alert
                                    severity={qualityMetrics.performance_degradation > 0.1 ? 'error' : qualityMetrics.performance_degradation > 0.05 ? 'warning' : 'success'}
                                    sx={{ mb: 2 }}
                                >
                                    성능 저하율: {(qualityMetrics.performance_degradation * 100).toFixed(1)}%
                                    {qualityMetrics.performance_degradation > 0.1 && ' - 즉시 조치가 필요합니다.'}
                                    {qualityMetrics.performance_degradation > 0.05 && qualityMetrics.performance_degradation <= 0.1 && ' - 모니터링이 필요합니다.'}
                                    {qualityMetrics.performance_degradation <= 0.05 && ' - 정상 수준입니다.'}
                                </Alert>
                                <Typography variant="body2" color="textSecondary">
                                    최근 성능 데이터를 기반으로 한 분석 결과입니다.
                                    성능 저하가 지속되면 시스템 최적화를 검토하세요.
                                </Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    const renderQualityReports = () => (
        <Grid container spacing={3}>
            {qualityReports.map((report) => (
                <Grid item xs={12} key={report.id}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" mb={2}>
                                품질 보고서 - {testSuites.find(s => s.id === report.test_suite_id)?.name || '알 수 없는 스위트'}
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Box>
                                        <Typography variant="subtitle2" mb={1}>실행 요약</Typography>
                                        <Box display="flex" justifyContent="space-between" mb={1}>
                                            <Typography variant="body2">총 테스트</Typography>
                                            <Typography variant="body2" fontWeight="medium">
                                                {report.total_tests}개
                                            </Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between" mb={1}>
                                            <Typography variant="body2">통과</Typography>
                                            <Typography variant="body2" fontWeight="medium" color="success.main">
                                                {report.passed_tests}개
                                            </Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between" mb={1}>
                                            <Typography variant="body2">실패</Typography>
                                            <Typography variant="body2" fontWeight="medium" color="error.main">
                                                {report.failed_tests}개
                                            </Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between" mb={1}>
                                            <Typography variant="body2">건너뜀</Typography>
                                            <Typography variant="body2" fontWeight="medium" color="warning.main">
                                                {report.skipped_tests}개
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Box>
                                        <Typography variant="subtitle2" mb={1}>품질 지표</Typography>
                                        <Box display="flex" justifyContent="space-between" mb={1}>
                                            <Typography variant="body2">전체 품질 점수</Typography>
                                            <Typography variant="body2" fontWeight="medium" color="primary">
                                                {(report.overall_quality_score * 100).toFixed(1)}%
                                            </Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between" mb={1}>
                                            <Typography variant="body2">테스트 커버리지</Typography>
                                            <Typography variant="body2" fontWeight="medium" color="info.main">
                                                {report.coverage_percentage.toFixed(1)}%
                                            </Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between" mb={1}>
                                            <Typography variant="body2">실행 시간</Typography>
                                            <Typography variant="body2" fontWeight="medium">
                                                {(report.execution_time_ms / 1000).toFixed(1)}초
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" mb={1}>권장사항</Typography>
                                    <List dense>
                                        {report.recommendations.map((recommendation, index) => (
                                            <ListItem key={index}>
                                                <ListItemIcon>
                                                    <AutoFixHigh color="info" />
                                                </ListItemIcon>
                                                <ListItemText primary={recommendation} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );

    const renderSettings = () => (
        <Card>
            <CardContent>
                <Typography variant="h6" mb={2}>품질 보증 시스템 설정</Typography>
                <List>
                    <ListItem>
                        <ListItemIcon><Refresh /></ListItemIcon>
                        <ListItemText
                            primary="자동 새로고침"
                            secondary="15초마다 데이터 자동 업데이트"
                        />
                        <Switch
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><PlayArrow /></ListItemIcon>
                        <ListItemText
                            primary="자동 테스트 실행"
                            secondary="스케줄에 따른 자동 테스트 실행"
                        />
                        <Switch defaultChecked />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><Warning /></ListItemIcon>
                        <ListItemText
                            primary="실패 알림"
                            secondary="테스트 실패 시 즉시 알림"
                        />
                        <Switch defaultChecked />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><Assessment /></ListItemIcon>
                        <ListItemText
                            primary="성능 모니터링"
                            secondary="실시간 성능 메트릭 수집"
                        />
                        <Switch defaultChecked />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><Article /></ListItemIcon>
                        <ListItemText
                            primary="자동 보고서 생성"
                            secondary="테스트 완료 후 자동 보고서 생성"
                        />
                        <Switch defaultChecked />
                    </ListItem>
                </List>
            </CardContent>
        </Card>
    );

    const renderContent = () => {
        switch (selectedTab) {
            case 0: return renderQualityOverview();
            case 1: return renderTestSuites();
            case 2: return renderExecutionResults();
            case 3: return renderPerformanceAnalysis();
            case 4: return renderQualityReports();
            case 5: return renderSettings();
            default: return renderQualityOverview();
        }
    };

    return (
        <Box sx={{ p: 3, height: '100vh', overflow: 'auto' }}>
            {/* 헤더 */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                    <QualityControl sx={{ mr: 1, fontSize: 32 }} color="primary" />
                    <Typography variant="h4">고급 AI 품질 보증 및 테스트 자동화 대시보드</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" color="textSecondary">
                        마지막 업데이트: {lastUpdate.toLocaleTimeString()}
                    </Typography>
                    <Tooltip title="전체화면">
                        <IconButton onClick={() => setFullscreen(!fullscreen)}>
                            {fullscreen ? <FullscreenExit /> : <Fullscreen />}
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* 탭 네비게이션 */}
            <Paper sx={{ mb: 3 }}>
                <Box display="flex" overflow="auto">
                    {tabs.map((tab, index) => (
                        <Button
                            key={index}
                            variant={selectedTab === index ? "contained" : "text"}
                            startIcon={tab.icon}
                            onClick={() => setSelectedTab(index)}
                            sx={{
                                minWidth: 'auto',
                                px: 2,
                                py: 1.5,
                                borderRadius: 0,
                                borderBottom: selectedTab === index ? 2 : 0,
                                borderColor: 'primary.main'
                            }}
                        >
                            {tab.label}
                        </Button>
                    ))}
                </Box>
            </Paper>

            {/* 메인 콘텐츠 */}
            {renderContent()}
        </Box>
    );
};

export default AdvancedAIQualityAssuranceDashboard;
