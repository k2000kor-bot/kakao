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
    Divider,
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
    InputLabel
} from '@mui/material';
import {
    CheckCircle,
    Error,
    Warning,
    Info,
    Refresh,
    PlayArrow,
    Stop,
    Settings,
    Assessment,
    Security,
    Speed,
    Memory,
    Storage,
    NetworkCheck,
    Timeline,
    TrendingUp,
    TrendingDown,
    AutoFixHigh,
    Verified,
    BugReport,
    Psychology,
    Balance,
    Gavel,
    Shield,
    Monitor,
    Analytics,
    DataUsage,
    PrecisionManufacturing,
    Science,
    Biotech,
    HealthAndSafety,
    VerifiedUser,
    FactCheck,
    Rule,
    Policy,
    Compliance,
    Audit,
    Report,
    Dashboard,
    ViewList,
    ExpandMore,
    Add,
    Remove,
    Edit,
    Delete,
    Save,
    Cancel,
    Download,
    Upload,
    CloudUpload,
    CloudDownload,
    Sync,
    AutoAwesome,
    Star,
    StarBorder,
    ThumbUp,
    ThumbDown,
    Flag,
    ReportProblem,
    PriorityHigh,
    LowPriority,
    Block,
    Check,
    Close,
    ExpandLess,
    FilterList,
    Sort,
    Search,
    Visibility,
    VisibilityOff,
    Lock,
    LockOpen,
    Key,
    VpnKey,
    Fingerprint,
    Face,
    Accessibility,
    Hearing,
    Visibility as VisibilityIcon,
    Hearing as HearingIcon,
    Accessibility as AccessibilityIcon
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

interface QualityMetric {
    id: string;
    name: string;
    value: number;
    target: number;
    status: 'excellent' | 'good' | 'warning' | 'critical';
    trend: 'up' | 'down' | 'stable';
    lastUpdated: string;
    description: string;
}

interface BiasTest {
    id: string;
    name: string;
    category: string;
    result: number;
    threshold: number;
    status: 'pass' | 'fail' | 'warning';
    details: string;
}

interface SafetyTest {
    id: string;
    name: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    score: number;
    description: string;
    recommendations: string[];
}

interface AccuracyTest {
    id: string;
    name: string;
    dataset: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    confusionMatrix: number[][];
}

const AIQualityAssuranceDashboard: React.FC = () => {
    const [qualityMetrics, setQualityMetrics] = useState<QualityMetric[]>([
        {
            id: 'overall-quality',
            name: '전체 품질 점수',
            value: 94.2,
            target: 95,
            status: 'good',
            trend: 'up',
            lastUpdated: '2024-01-15 14:30',
            description: 'AI 시스템의 전반적인 품질 지표'
        },
        {
            id: 'accuracy',
            name: '정확도',
            value: 96.8,
            target: 95,
            status: 'excellent',
            trend: 'up',
            lastUpdated: '2024-01-15 14:30',
            description: 'AI 모델의 예측 정확도'
        },
        {
            id: 'bias-score',
            name: '편향성 점수',
            value: 87.5,
            target: 90,
            status: 'warning',
            trend: 'down',
            lastUpdated: '2024-01-15 14:30',
            description: 'AI 모델의 편향성 평가'
        },
        {
            id: 'safety-score',
            name: '안전성 점수',
            value: 92.1,
            target: 95,
            status: 'good',
            trend: 'stable',
            lastUpdated: '2024-01-15 14:30',
            description: 'AI 시스템의 안전성 평가'
        },
        {
            id: 'performance',
            name: '성능 점수',
            value: 89.3,
            target: 90,
            status: 'good',
            trend: 'up',
            lastUpdated: '2024-01-15 14:30',
            description: 'AI 시스템의 성능 지표'
        },
        {
            id: 'reliability',
            name: '신뢰성 점수',
            value: 95.7,
            target: 95,
            status: 'excellent',
            trend: 'up',
            lastUpdated: '2024-01-15 14:30',
            description: 'AI 시스템의 신뢰성 평가'
        }
    ]);

    const [biasTests, setBiasTests] = useState<BiasTest[]>([
        {
            id: 'gender-bias',
            name: '성별 편향성 테스트',
            category: 'Demographic',
            result: 0.85,
            threshold: 0.9,
            status: 'warning',
            details: '여성 사용자에 대한 응답에서 약간의 편향성 발견'
        },
        {
            id: 'age-bias',
            name: '연령 편향성 테스트',
            category: 'Demographic',
            result: 0.92,
            threshold: 0.9,
            status: 'pass',
            details: '연령별 편향성 없음'
        },
        {
            id: 'racial-bias',
            name: '인종 편향성 테스트',
            category: 'Demographic',
            result: 0.88,
            threshold: 0.9,
            status: 'warning',
            details: '특정 인종 그룹에 대한 미세한 편향성'
        },
        {
            id: 'socioeconomic-bias',
            name: '사회경제적 편향성 테스트',
            category: 'Economic',
            result: 0.94,
            threshold: 0.9,
            status: 'pass',
            details: '사회경제적 편향성 없음'
        },
        {
            id: 'geographic-bias',
            name: '지역 편향성 테스트',
            category: 'Geographic',
            result: 0.91,
            threshold: 0.9,
            status: 'pass',
            details: '지역별 편향성 없음'
        }
    ]);

    const [safetyTests, setSafetyTests] = useState<SafetyTest[]>([
        {
            id: 'adversarial-attack',
            name: '적대적 공격 테스트',
            riskLevel: 'low',
            score: 0.92,
            description: '적대적 입력에 대한 저항성 평가',
            recommendations: ['입력 검증 강화', '적대적 훈련 데이터 추가']
        },
        {
            id: 'privacy-leak',
            name: '개인정보 유출 테스트',
            riskLevel: 'low',
            score: 0.95,
            description: '개인정보 보호 능력 평가',
            recommendations: ['데이터 암호화 강화', '접근 제어 정책 검토']
        },
        {
            id: 'misuse-potential',
            name: '오용 가능성 테스트',
            riskLevel: 'medium',
            score: 0.87,
            description: '악의적 사용 가능성 평가',
            recommendations: ['사용 제한 정책 강화', '모니터링 시스템 구축']
        },
        {
            id: 'hallucination',
            name: '환각 현상 테스트',
            riskLevel: 'medium',
            score: 0.89,
            description: '허위 정보 생성 가능성 평가',
            recommendations: ['사실 검증 시스템 구축', '신뢰도 임계값 조정']
        }
    ]);

    const [accuracyTests, setAccuracyTests] = useState<AccuracyTest[]>([
        {
            id: 'general-qa',
            name: '일반 질의응답',
            dataset: 'SQuAD 2.0',
            accuracy: 0.92,
            precision: 0.91,
            recall: 0.93,
            f1Score: 0.92,
            confusionMatrix: [[850, 50], [30, 70]]
        },
        {
            id: 'sentiment-analysis',
            name: '감정 분석',
            dataset: 'IMDB',
            accuracy: 0.89,
            precision: 0.88,
            recall: 0.90,
            f1Score: 0.89,
            confusionMatrix: [[445, 55], [45, 455]]
        },
        {
            id: 'text-classification',
            name: '텍스트 분류',
            dataset: 'AG News',
            accuracy: 0.94,
            precision: 0.93,
            recall: 0.95,
            f1Score: 0.94,
            confusionMatrix: [[950, 25], [25, 950]]
        }
    ]);

    const [isRunning, setIsRunning] = useState(false);
    const [selectedTest, setSelectedTest] = useState<string | null>(null);
    const [testDialogOpen, setTestDialogOpen] = useState(false);

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

    const getRiskColor = (riskLevel: string) => {
        switch (riskLevel) {
            case 'low': return 'success';
            case 'medium': return 'warning';
            case 'high': return 'error';
            case 'critical': return 'error';
            default: return 'default';
        }
    };

    const qualityChartData = {
        labels: qualityMetrics.map(metric => metric.name),
        datasets: [
            {
                label: '현재 값',
                data: qualityMetrics.map(metric => metric.value),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1
            },
            {
                label: '목표 값',
                data: qualityMetrics.map(metric => metric.target),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderDash: [5, 5],
                tension: 0.1
            }
        ]
    };

    const biasChartData = {
        labels: biasTests.map(test => test.name),
        datasets: [
            {
                label: '테스트 결과',
                data: biasTests.map(test => test.result * 100),
                backgroundColor: biasTests.map(test =>
                    test.status === 'pass' ? 'rgba(76, 175, 80, 0.8)' :
                        test.status === 'warning' ? 'rgba(255, 152, 0, 0.8)' :
                            'rgba(244, 67, 54, 0.8)'
                ),
                borderColor: biasTests.map(test =>
                    test.status === 'pass' ? 'rgb(76, 175, 80)' :
                        test.status === 'warning' ? 'rgb(255, 152, 0)' :
                            'rgb(244, 67, 54)'
                ),
                borderWidth: 1
            }
        ]
    };

    const safetyChartData = {
        labels: ['낮음', '보통', '높음', '위험'],
        datasets: [
            {
                data: [
                    safetyTests.filter(test => test.riskLevel === 'low').length,
                    safetyTests.filter(test => test.riskLevel === 'medium').length,
                    safetyTests.filter(test => test.riskLevel === 'high').length,
                    safetyTests.filter(test => test.riskLevel === 'critical').length
                ],
                backgroundColor: [
                    'rgba(76, 175, 80, 0.8)',
                    'rgba(255, 152, 0, 0.8)',
                    'rgba(255, 87, 34, 0.8)',
                    'rgba(244, 67, 54, 0.8)'
                ],
                borderColor: [
                    'rgb(76, 175, 80)',
                    'rgb(255, 152, 0)',
                    'rgb(255, 87, 34)',
                    'rgb(244, 67, 54)'
                ],
                borderWidth: 1
            }
        ]
    };

    const handleRunQualityTest = () => {
        setIsRunning(true);
        // 시뮬레이션된 테스트 실행
        setTimeout(() => {
            setQualityMetrics(prev => prev.map(metric => ({
                ...metric,
                value: Math.min(100, Math.max(0, metric.value + (Math.random() - 0.5) * 5)),
                lastUpdated: new Date().toLocaleString()
            })));
            setIsRunning(false);
        }, 3000);
    };

    const handleTestDetails = (testId: string) => {
        setSelectedTest(testId);
        setTestDialogOpen(true);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Verified color="primary" />
                AI 품질 보증 시스템
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                AI 시스템의 품질, 정확성, 편향성, 안전성을 종합적으로 평가하고 관리하는 시스템입니다.
            </Typography>

            {/* 제어 패널 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">품질 보증 제어</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="contained"
                                startIcon={isRunning ? <Stop /> : <PlayArrow />}
                                onClick={handleRunQualityTest}
                                disabled={isRunning}
                                color={isRunning ? 'error' : 'primary'}
                            >
                                {isRunning ? '테스트 중...' : '품질 테스트 실행'}
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
                                품질 테스트를 실행 중입니다...
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* 품질 지표 */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                {qualityMetrics.map((metric) => (
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
                            <Typography variant="h6" gutterBottom>품질 지표 추이</Typography>
                            <Line
                                data={qualityChartData}
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
                            <Typography variant="h6" gutterBottom>편향성 테스트 결과</Typography>
                            <Bar
                                data={biasChartData}
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

            {/* 편향성 테스트 테이블 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>편향성 테스트 상세</Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>테스트명</TableCell>
                                    <TableCell>카테고리</TableCell>
                                    <TableCell>결과</TableCell>
                                    <TableCell>임계값</TableCell>
                                    <TableCell>상태</TableCell>
                                    <TableCell>상세</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {biasTests.map((test) => (
                                    <TableRow key={test.id}>
                                        <TableCell>{test.name}</TableCell>
                                        <TableCell>{test.category}</TableCell>
                                        <TableCell>{(test.result * 100).toFixed(1)}%</TableCell>
                                        <TableCell>{(test.threshold * 100).toFixed(1)}%</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={test.status.toUpperCase()}
                                                color={test.status === 'pass' ? 'success' : test.status === 'warning' ? 'warning' : 'error'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                onClick={() => handleTestDetails(test.id)}
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

            {/* 안전성 테스트 */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>안전성 테스트 결과</Typography>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>테스트명</TableCell>
                                            <TableCell>위험도</TableCell>
                                            <TableCell>점수</TableCell>
                                            <TableCell>설명</TableCell>
                                            <TableCell>권장사항</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {safetyTests.map((test) => (
                                            <TableRow key={test.id}>
                                                <TableCell>{test.name}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={test.riskLevel.toUpperCase()}
                                                        color={getRiskColor(test.riskLevel) as any}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>{(test.score * 100).toFixed(1)}%</TableCell>
                                                <TableCell>{test.description}</TableCell>
                                                <TableCell>
                                                    <Tooltip title={test.recommendations.join(', ')}>
                                                        <IconButton size="small">
                                                            <Info />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
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
                            <Typography variant="h6" gutterBottom>위험도 분포</Typography>
                            <Doughnut
                                data={safetyChartData}
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

            {/* 정확도 테스트 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>정확도 테스트 결과</Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>테스트명</TableCell>
                                    <TableCell>데이터셋</TableCell>
                                    <TableCell>정확도</TableCell>
                                    <TableCell>정밀도</TableCell>
                                    <TableCell>재현율</TableCell>
                                    <TableCell>F1 점수</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {accuracyTests.map((test) => (
                                    <TableRow key={test.id}>
                                        <TableCell>{test.name}</TableCell>
                                        <TableCell>{test.dataset}</TableCell>
                                        <TableCell>{(test.accuracy * 100).toFixed(1)}%</TableCell>
                                        <TableCell>{(test.precision * 100).toFixed(1)}%</TableCell>
                                        <TableCell>{(test.recall * 100).toFixed(1)}%</TableCell>
                                        <TableCell>{(test.f1Score * 100).toFixed(1)}%</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* 테스트 상세 다이얼로그 */}
            <Dialog
                open={testDialogOpen}
                onClose={() => setTestDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    테스트 상세 정보
                </DialogTitle>
                <DialogContent>
                    {selectedTest && (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                {biasTests.find(test => test.id === selectedTest)?.name}
                            </Typography>
                            <Typography variant="body1" paragraph>
                                {biasTests.find(test => test.id === selectedTest)?.details}
                            </Typography>

                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Typography>권장 개선사항</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <List>
                                        <ListItem>
                                            <ListItemIcon>
                                                <AutoFixHigh color="primary" />
                                            </ListItemIcon>
                                            <ListItemText primary="데이터셋 다양성 향상" />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <Balance color="primary" />
                                            </ListItemIcon>
                                            <ListItemText primary="편향성 보정 알고리즘 적용" />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <Monitor color="primary" />
                                            </ListItemIcon>
                                            <ListItemText primary="지속적인 모니터링 강화" />
                                        </ListItem>
                                    </List>
                                </AccordionDetails>
                            </Accordion>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTestDialogOpen(false)}>닫기</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AIQualityAssuranceDashboard;
