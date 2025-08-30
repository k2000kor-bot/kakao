import React, { useState, useEffect } from 'react';
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
    Divider
} from '@mui/material';
import {
    Gavel,
    Balance,
    Policy,
    Security,
    Verified,
    Warning,
    Error,
    CheckCircle,
    Info,
    Refresh,
    Settings,
    Assessment,
    Monitor,
    Analytics,
    Timeline,
    TrendingUp,
    TrendingDown,
    AutoFixHigh,
    Psychology,
    Shield,
    Compliance,
    Audit,
    Report,
    Dashboard,
    ExpandMore,
    Add,
    Edit,
    Delete,
    Save,
    Cancel,
    Download,
    Upload,
    Sync,
    AutoAwesome,
    Star,
    ThumbUp,
    ThumbDown,
    Flag,
    ReportProblem,
    PriorityHigh,
    LowPriority,
    Block,
    Check,
    Close,
    FilterList,
    Sort,
    Search,
    Visibility,
    Lock,
    Key,
    Fingerprint,
    Face,
    Accessibility,
    Hearing,
    Visibility as VisibilityIcon,
    Hearing as HearingIcon,
    Accessibility as AccessibilityIcon,
    Rule,
    Book,
    School,
    Work,
    Business,
    AccountBalance,
    People,
    Group,
    Person,
    Public,
    Language,
    Translate,
    Cloud,
    Storage,
    Memory,
    Speed,
    NetworkCheck,
    Cpu,
    StorageIcon,
    MemoryIcon,
    NetworkIcon,
    Science,
    Hub,
    AutoAwesome as AutoAwesomeIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    TrendingFlat as TrendingFlatIcon,
    AutoGraph,
    TrendingAuto,
    SelfImprovement,
    PsychologyAlt,
    AutoMode,
    SmartToy,
    Chat,
    Forum,
    Message,
    Send,
    Share,
    ConnectWithoutContact,
    People as PeopleIcon,
    PersonAdd,
    GroupAdd,
    Public as PublicIcon,
    Language as LanguageIcon,
    Translate as TranslateIcon,
    Sync as SyncIcon,
    CloudSync,
    CloudUpload,
    CloudDownload,
    SettingsVoice,
    Hearing as HearingIcon2,
    Visibility as VisibilityIcon2,
    VisibilityOff,
    Wifi,
    WifiOff,
    SignalCellular4Bar,
    SignalCellularConnectedNoInternet4Bar,
    SignalCellularNoSim,
    SignalCellularNull,
    SignalCellularOff,
    AllInclusive,
    Infinity,
    Spa,
    SelfImprovement as SelfImprovementIcon,
    Psychology as PsychologyAltIcon,
    AutoAwesome as AutoAwesomeIcon2,
    TrendingUp as TrendingUpIcon2,
    TrendingAuto as TrendingAutoIcon,
    AutoGraph as AutoGraphIcon,
    TrendingDown as TrendingDownIcon2,
    TrendingFlat as TrendingFlatIcon2
} from '@mui/icons-material';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip as ChartTooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
    Title,
    ChartTooltip,
    Legend,
    Filler
);

interface EthicsMetric {
    id: string;
    name: string;
    value: number;
    target: number;
    status: 'excellent' | 'good' | 'warning' | 'critical';
    trend: 'up' | 'down' | 'stable';
    lastUpdated: string;
    description: string;
}

interface GovernancePolicy {
    id: string;
    name: string;
    category: string;
    status: 'active' | 'draft' | 'review' | 'archived';
    compliance: number;
    lastReview: string;
    description: string;
    requirements: string[];
}

interface TransparencyReport {
    id: string;
    name: string;
    transparency: number;
    explainability: number;
    auditability: number;
    lastUpdated: string;
    details: string;
}

interface AccountabilityFramework {
    id: string;
    name: string;
    responsibility: string;
    accountability: number;
    traceability: number;
    lastUpdated: string;
    description: string;
}

const AIEthicsGovernanceDashboard: React.FC = () => {
    const [ethicsMetrics, setEthicsMetrics] = useState<EthicsMetric[]>([
        {
            id: 'overall-ethics',
            name: '전체 윤리 점수',
            value: 91.5,
            target: 95,
            status: 'good',
            trend: 'up',
            lastUpdated: '2024-01-15 14:30',
            description: 'AI 시스템의 전반적인 윤리적 준수도'
        },
        {
            id: 'fairness',
            name: '공정성 점수',
            value: 88.2,
            target: 90,
            status: 'warning',
            trend: 'down',
            lastUpdated: '2024-01-15 14:30',
            description: 'AI 시스템의 공정성 및 편향성 제거'
        },
        {
            id: 'transparency',
            name: '투명성 점수',
            value: 94.7,
            target: 95,
            status: 'excellent',
            trend: 'up',
            lastUpdated: '2024-01-15 14:30',
            description: 'AI 의사결정 과정의 투명성'
        },
        {
            id: 'accountability',
            name: '책임성 점수',
            value: 89.8,
            target: 90,
            status: 'good',
            trend: 'stable',
            lastUpdated: '2024-01-15 14:30',
            description: 'AI 시스템의 책임성 및 추적 가능성'
        },
        {
            id: 'privacy',
            name: '개인정보 보호',
            value: 96.3,
            target: 95,
            status: 'excellent',
            trend: 'up',
            lastUpdated: '2024-01-15 14:30',
            description: '개인정보 보호 및 데이터 프라이버시'
        },
        {
            id: 'safety',
            name: '안전성 점수',
            value: 92.1,
            target: 95,
            status: 'good',
            trend: 'up',
            lastUpdated: '2024-01-15 14:30',
            description: 'AI 시스템의 안전성 및 위험 관리'
        }
    ]);

    const [governancePolicies, setGovernancePolicies] = useState<GovernancePolicy[]>([
        {
            id: 'ai-ethics-policy',
            name: 'AI 윤리 정책',
            category: 'Ethics',
            status: 'active',
            compliance: 94,
            lastReview: '2024-01-10',
            description: 'AI 시스템 개발 및 운영에 대한 윤리적 가이드라인',
            requirements: ['편향성 검토', '투명성 확보', '책임성 명시']
        },
        {
            id: 'data-privacy-policy',
            name: '데이터 개인정보 보호 정책',
            category: 'Privacy',
            status: 'active',
            compliance: 97,
            lastReview: '2024-01-12',
            description: '개인정보 수집, 사용, 보호에 대한 정책',
            requirements: ['동의 획득', '암호화', '접근 제어']
        },
        {
            id: 'ai-safety-policy',
            name: 'AI 안전성 정책',
            category: 'Safety',
            status: 'active',
            compliance: 91,
            lastReview: '2024-01-08',
            description: 'AI 시스템의 안전성 확보를 위한 정책',
            requirements: ['위험 평가', '안전장치', '모니터링']
        },
        {
            id: 'transparency-policy',
            name: '투명성 정책',
            category: 'Transparency',
            status: 'review',
            compliance: 88,
            lastReview: '2024-01-05',
            description: 'AI 의사결정 과정의 투명성 확보 정책',
            requirements: ['설명 가능성', '감사 추적', '공개 보고']
        },
        {
            id: 'accountability-policy',
            name: '책임성 정책',
            category: 'Accountability',
            status: 'draft',
            compliance: 85,
            lastReview: '2024-01-03',
            description: 'AI 시스템의 책임성 및 책임 소재 명시',
            requirements: ['책임자 지정', '보상 체계', '감독 체계']
        }
    ]);

    const [transparencyReports, setTransparencyReports] = useState<TransparencyReport[]>([
        {
            id: 'decision-transparency',
            name: '의사결정 투명성',
            transparency: 94,
            explainability: 91,
            auditability: 89,
            lastUpdated: '2024-01-15',
            details: 'AI 의사결정 과정의 투명성 및 설명 가능성 평가'
        },
        {
            id: 'data-transparency',
            name: '데이터 투명성',
            transparency: 96,
            explainability: 88,
            auditability: 92,
            lastUpdated: '2024-01-15',
            details: '데이터 사용 및 처리 과정의 투명성 평가'
        },
        {
            id: 'algorithm-transparency',
            name: '알고리즘 투명성',
            transparency: 87,
            explainability: 85,
            auditability: 90,
            lastUpdated: '2024-01-15',
            details: '알고리즘 로직 및 모델의 투명성 평가'
        }
    ]);

    const [accountabilityFrameworks, setAccountabilityFrameworks] = useState<AccountabilityFramework[]>([
        {
            id: 'human-oversight',
            name: '인간 감독 체계',
            responsibility: 'AI 시스템의 인간 감독 및 개입',
            accountability: 92,
            traceability: 88,
            lastUpdated: '2024-01-15',
            description: 'AI 시스템에 대한 인간의 감독 및 개입 체계'
        },
        {
            id: 'decision-traceability',
            name: '의사결정 추적성',
            responsibility: 'AI 의사결정 과정의 완전한 추적',
            accountability: 89,
            traceability: 94,
            lastUpdated: '2024-01-15',
            description: 'AI 의사결정 과정의 완전한 추적 및 기록'
        },
        {
            id: 'liability-framework',
            name: '책임 소재 체계',
            responsibility: 'AI 시스템 책임의 명확한 소재',
            accountability: 87,
            traceability: 91,
            lastUpdated: '2024-01-15',
            description: 'AI 시스템 관련 책임의 명확한 소재 및 분배'
        }
    ]);

    const [isRunning, setIsRunning] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);
    const [policyDialogOpen, setPolicyDialogOpen] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'excellent': return 'success';
            case 'good': return 'primary';
            case 'warning': return 'warning';
            case 'critical': return 'error';
            default: return 'default';
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return <TrendingUp color="success" />;
            case 'down': return <TrendingDown color="error" />;
            case 'stable': return <Timeline color="info" />;
            default: return <Timeline />;
        }
    };

    const getPolicyStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'success';
            case 'draft': return 'warning';
            case 'review': return 'info';
            case 'archived': return 'default';
            default: return 'default';
        }
    };

    const ethicsChartData = {
        labels: ethicsMetrics.map(metric => metric.name),
        datasets: [
            {
                label: '현재 값',
                data: ethicsMetrics.map(metric => metric.value),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1
            },
            {
                label: '목표 값',
                data: ethicsMetrics.map(metric => metric.target),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderDash: [5, 5],
                tension: 0.1
            }
        ]
    };

    const policyChartData = {
        labels: governancePolicies.map(policy => policy.name),
        datasets: [
            {
                label: '준수도',
                data: governancePolicies.map(policy => policy.compliance),
                backgroundColor: governancePolicies.map(policy =>
                    policy.status === 'active' ? 'rgba(76, 175, 80, 0.8)' :
                        policy.status === 'review' ? 'rgba(33, 150, 243, 0.8)' :
                            policy.status === 'draft' ? 'rgba(255, 152, 0, 0.8)' :
                                'rgba(158, 158, 158, 0.8)'
                ),
                borderColor: governancePolicies.map(policy =>
                    policy.status === 'active' ? 'rgb(76, 175, 80)' :
                        policy.status === 'review' ? 'rgb(33, 150, 243)' :
                            policy.status === 'draft' ? 'rgb(255, 152, 0)' :
                                'rgb(158, 158, 158)'
                ),
                borderWidth: 1
            }
        ]
    };

    const transparencyChartData = {
        labels: ['투명성', '설명 가능성', '감사 가능성'],
        datasets: [
            {
                label: '평균 점수',
                data: [
                    transparencyReports.reduce((sum, report) => sum + report.transparency, 0) / transparencyReports.length,
                    transparencyReports.reduce((sum, report) => sum + report.explainability, 0) / transparencyReports.length,
                    transparencyReports.reduce((sum, report) => sum + report.auditability, 0) / transparencyReports.length
                ],
                backgroundColor: [
                    'rgba(76, 175, 80, 0.8)',
                    'rgba(33, 150, 243, 0.8)',
                    'rgba(255, 152, 0, 0.8)'
                ],
                borderColor: [
                    'rgb(76, 175, 80)',
                    'rgb(33, 150, 243)',
                    'rgb(255, 152, 0)'
                ],
                borderWidth: 1
            }
        ]
    };

    const handleRunEthicsAudit = () => {
        setIsRunning(true);
        setTimeout(() => {
            setEthicsMetrics(prev => prev.map(metric => ({
                ...metric,
                value: Math.min(100, Math.max(0, metric.value + (Math.random() - 0.5) * 3)),
                lastUpdated: new Date().toLocaleString()
            })));
            setIsRunning(false);
        }, 3000);
    };

    const handlePolicyDetails = (policyId: string) => {
        setSelectedPolicy(policyId);
        setPolicyDialogOpen(true);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Gavel color="primary" />
                AI 윤리 및 거버넌스 시스템
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                AI의 윤리적 사용, 투명성, 책임성, 공정성을 관리하고 보장하는 시스템입니다.
            </Typography>

            {/* 제어 패널 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">윤리 및 거버넌스 제어</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="contained"
                                startIcon={isRunning ? <Sync /> : <Assessment />}
                                onClick={handleRunEthicsAudit}
                                disabled={isRunning}
                                color={isRunning ? 'error' : 'primary'}
                            >
                                {isRunning ? '감사 중...' : '윤리 감사 실행'}
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Refresh />}
                                onClick={() => window.location.reload()}
                            >
                                새로고침
                            </Button>
                        </Box>
                    </Box>

                    {isRunning && (
                        <Box sx={{ width: '100%', mt: 2 }}>
                            <LinearProgress />
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                윤리 감사를 실행 중입니다...
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* 윤리 지표 */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                {ethicsMetrics.map((metric) => (
                    <Grid item xs={12} sm={6} md={4} key={metric.id}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6">{metric.name}</Typography>
                                    {getTrendIcon(metric.trend)}
                                </Box>

                                <Typography variant="h4" color="primary" sx={{ mb: 1 }}>
                                    {metric.value.toFixed(1)}%
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Chip
                                        label={metric.status.toUpperCase()}
                                        color={getStatusColor(metric.status) as any}
                                        size="small"
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                        목표: {metric.target}%
                                    </Typography>
                                </Box>

                                <LinearProgress
                                    variant="determinate"
                                    value={(metric.value / metric.target) * 100}
                                    color={getStatusColor(metric.status) as any}
                                    sx={{ mb: 1 }}
                                />

                                <Typography variant="body2" color="text.secondary">
                                    {metric.description}
                                </Typography>

                                <Typography variant="caption" color="text.secondary">
                                    마지막 업데이트: {metric.lastUpdated}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* 차트 섹션 */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>윤리 지표 추이</Typography>
                            <Line
                                data={ethicsChartData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: { position: 'top' as const },
                                        title: { display: false }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            max: 100
                                        }
                                    }
                                }}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>정책 준수도</Typography>
                            <Bar
                                data={policyChartData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: { display: false },
                                        title: { display: false }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            max: 100
                                        }
                                    }
                                }}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 거버넌스 정책 테이블 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>거버넌스 정책 관리</Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>정책명</TableCell>
                                    <TableCell>카테고리</TableCell>
                                    <TableCell>상태</TableCell>
                                    <TableCell>준수도</TableCell>
                                    <TableCell>마지막 검토</TableCell>
                                    <TableCell>상세</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {governancePolicies.map((policy) => (
                                    <TableRow key={policy.id}>
                                        <TableCell>{policy.name}</TableCell>
                                        <TableCell>{policy.category}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={policy.status.toUpperCase()}
                                                color={getPolicyStatusColor(policy.status) as any}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{policy.compliance}%</TableCell>
                                        <TableCell>{policy.lastReview}</TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                onClick={() => handlePolicyDetails(policy.id)}
                                            >
                                                상세보기
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* 투명성 보고서 */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>투명성 보고서</Typography>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>보고서명</TableCell>
                                            <TableCell>투명성</TableCell>
                                            <TableCell>설명 가능성</TableCell>
                                            <TableCell>감사 가능성</TableCell>
                                            <TableCell>마지막 업데이트</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {transparencyReports.map((report) => (
                                            <TableRow key={report.id}>
                                                <TableCell>{report.name}</TableCell>
                                                <TableCell>{report.transparency}%</TableCell>
                                                <TableCell>{report.explainability}%</TableCell>
                                                <TableCell>{report.auditability}%</TableCell>
                                                <TableCell>{report.lastUpdated}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>투명성 지표</Typography>
                            <Doughnut
                                data={transparencyChartData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: { position: 'bottom' as const },
                                        title: { display: false }
                                    }
                                }}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 책임성 체계 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>책임성 체계</Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>체계명</TableCell>
                                    <TableCell>책임</TableCell>
                                    <TableCell>책임성</TableCell>
                                    <TableCell>추적성</TableCell>
                                    <TableCell>마지막 업데이트</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {accountabilityFrameworks.map((framework) => (
                                    <TableRow key={framework.id}>
                                        <TableCell>{framework.name}</TableCell>
                                        <TableCell>{framework.responsibility}</TableCell>
                                        <TableCell>{framework.accountability}%</TableCell>
                                        <TableCell>{framework.traceability}%</TableCell>
                                        <TableCell>{framework.lastUpdated}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* 정책 상세 다이얼로그 */}
            <Dialog
                open={policyDialogOpen}
                onClose={() => setPolicyDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    정책 상세 정보
                </DialogTitle>
                <DialogContent>
                    {selectedPolicy && (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                {governancePolicies.find(policy => policy.id === selectedPolicy)?.name}
                            </Typography>
                            <Typography variant="body1" paragraph>
                                {governancePolicies.find(policy => policy.id === selectedPolicy)?.description}
                            </Typography>

                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Typography>요구사항</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <List>
                                        {governancePolicies.find(policy => policy.id === selectedPolicy)?.requirements.map((req, index) => (
                                            <ListItem key={index}>
                                                <ListItemIcon>
                                                    <Check color="primary" />
                                                </ListItemIcon>
                                                <ListItemText primary={req} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </AccordionDetails>
                            </Accordion>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPolicyDialogOpen(false)}>닫기</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AIEthicsGovernanceDashboard;
