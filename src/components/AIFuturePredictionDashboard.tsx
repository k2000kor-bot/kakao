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
    Timeline,
    TrendingUp,
    TrendingDown,
    TrendingFlat,
    AutoAwesome,
    Science,
    Psychology,
    Lightbulb,
    Innovation,
    Rocket,
    Star,
    Diamond,
    EmojiEvents,
    WorkspacePremium,
    PsychologyAlt,
    Brain,
    Cognitive,
    NeuralNetwork,
    Synapse,
    Dendrite,
    Axon,
    Neuron,
    AutoGraph,
    TrendingAuto,
    SelfImprovement,
    PsychologyIcon,
    AutoMode,
    SmartToy,
    SmartButton,
    SmartDisplay,
    SmartScreen,
    SmartToyIcon,
    Chat,
    Forum,
    Message,
    Send,
    Share,
    ConnectWithoutContact,
    People,
    PersonAdd,
    GroupAdd,
    Public,
    Language,
    Translate,
    Sync,
    CloudSync,
    CloudUpload,
    CloudDownload,
    SettingsVoice,
    Hearing,
    Visibility,
    VisibilityOff,
    Wifi,
    WifiOff,
    SignalCellular4Bar,
    SignalCellularConnectedNoInternet4Bar,
    SignalCellularNoSim,
    SignalCellularNull,
    Info,
    SignalCellularOff,
    AllInclusive,
    Infinity,
    Spa,
    SelfImprovement as SelfImprovementIcon,
    Psychology as PsychologyAltIcon,
    AutoAwesome as AutoAwesomeIcon,
    TrendingUp as TrendingUpIcon,
    TrendingAuto as TrendingAutoIcon,
    AutoGraph as AutoGraphIcon,
    TrendingDown as TrendingDownIcon,
    TrendingFlat as TrendingFlatIcon,
    Refresh,
    PlayArrow,
    Stop,
    Settings,
    Assessment,
    Monitor,
    Analytics,
    AutoFixHigh,
    Verified,
    BugReport,
    Balance,
    Gavel,
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
    Check,
    Close,
    FilterList,
    Sort,
    Search,
    Lock,
    Key,
    Fingerprint,
    Face,
    Accessibility,
    Hearing as HearingIcon,
    Visibility as VisibilityIcon,
    Accessibility as AccessibilityIcon,
    Rule,
    Book,
    School,
    Work,
    Business,
    AccountBalance,
    Group as GroupIcon,
    Person,
    Language as LanguageIcon,
    Translate as TranslateIcon,
    Cloud,
    Storage,
    Memory,
    Speed,
    NetworkCheck,
    Cpu,
    StorageIcon,
    MemoryIcon,
    NetworkIcon,
    Hub,
    TrendingUp as TrendingUpIcon2,
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
    Tooltip,
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
    Tooltip,
    Legend,
    Filler
);

interface PredictionMetric {
    id: string;
    name: string;
    value: number;
    confidence: number;
    timeframe: string;
    trend: 'up' | 'down' | 'stable';
    lastUpdated: string;
    description: string;
}

interface TechnologyTrend {
    id: string;
    name: string;
    category: string;
    adoptionRate: number;
    maturity: number;
    impact: 'high' | 'medium' | 'low';
    timeframe: string;
    description: string;
    implications: string[];
}

interface ScenarioAnalysis {
    id: string;
    name: string;
    probability: number;
    impact: 'positive' | 'negative' | 'neutral';
    timeframe: string;
    description: string;
    keyFactors: string[];
    recommendations: string[];
}

interface MarketForecast {
    id: string;
    name: string;
    marketSize: number;
    growthRate: number;
    year: number;
    region: string;
    description: string;
    drivers: string[];
}

const AIFuturePredictionDashboard: React.FC = () => {
    const [predictionMetrics, setPredictionMetrics] = useState<PredictionMetric[]>([
        {
            id: 'agi-timeline',
            name: 'AGI 도래 예측',
            value: 2035,
            confidence: 78,
            timeframe: '2030-2040',
            trend: 'down',
            lastUpdated: '2024-01-15 14:30',
            description: '일반 인공지능(AGI) 도래 시점 예측'
        },
        {
            id: 'quantum-ai',
            name: '양자 AI 상용화',
            value: 2028,
            confidence: 85,
            timeframe: '2025-2030',
            trend: 'up',
            lastUpdated: '2024-01-15 14:30',
            description: '양자 컴퓨팅 기반 AI 상용화 시점'
        },
        {
            id: 'brain-computer-interface',
            name: '뇌-컴퓨터 인터페이스',
            value: 2032,
            confidence: 72,
            timeframe: '2030-2035',
            trend: 'stable',
            lastUpdated: '2024-01-15 14:30',
            description: '뇌-컴퓨터 인터페이스 상용화'
        },
        {
            id: 'autonomous-vehicles',
            name: '완전 자율주행',
            value: 2026,
            confidence: 88,
            timeframe: '2025-2030',
            trend: 'up',
            lastUpdated: '2024-01-15 14:30',
            description: '완전 자율주행차 상용화'
        },
        {
            id: 'ai-regulation',
            name: 'AI 규제 체계',
            value: 2025,
            confidence: 92,
            timeframe: '2024-2026',
            trend: 'up',
            lastUpdated: '2024-01-15 14:30',
            description: '포괄적 AI 규제 체계 구축'
        },
        {
            id: 'ai-ethics',
            name: 'AI 윤리 표준',
            value: 2024,
            confidence: 95,
            timeframe: '2024-2025',
            trend: 'up',
            lastUpdated: '2024-01-15 14:30',
            description: '글로벌 AI 윤리 표준 확립'
        }
    ]);

    const [technologyTrends, setTechnologyTrends] = useState<TechnologyTrend[]>([
        {
            id: 'large-language-models',
            name: '대규모 언어 모델',
            category: 'NLP',
            adoptionRate: 95,
            maturity: 85,
            impact: 'high',
            timeframe: '2024-2026',
            description: 'GPT, Claude 등 대규모 언어 모델의 발전',
            implications: ['자연어 처리 혁신', '콘텐츠 생성 자동화', '교육 방식 변화']
        },
        {
            id: 'multimodal-ai',
            name: '멀티모달 AI',
            category: 'Integration',
            adoptionRate: 75,
            maturity: 60,
            impact: 'high',
            timeframe: '2025-2028',
            description: '텍스트, 이미지, 음성 통합 AI',
            implications: ['복합 정보 처리', '사용자 경험 향상', '새로운 인터페이스']
        },
        {
            id: 'quantum-machine-learning',
            name: '양자 머신러닝',
            category: 'Quantum',
            adoptionRate: 45,
            maturity: 30,
            impact: 'high',
            timeframe: '2028-2032',
            description: '양자 컴퓨팅 기반 머신러닝',
            implications: ['계산 성능 혁신', '복잡한 문제 해결', '새로운 알고리즘']
        },
        {
            id: 'edge-ai',
            name: '엣지 AI',
            category: 'Deployment',
            adoptionRate: 80,
            maturity: 70,
            impact: 'medium',
            timeframe: '2024-2027',
            description: '디바이스 내장 AI 처리',
            implications: ['실시간 처리', '개인정보 보호', '네트워크 효율성']
        },
        {
            id: 'neuromorphic-computing',
            name: '뉴로모픽 컴퓨팅',
            category: 'Hardware',
            adoptionRate: 35,
            maturity: 25,
            impact: 'medium',
            timeframe: '2030-2035',
            description: '뇌 구조 모방 컴퓨팅',
            implications: ['에너지 효율성', '학습 능력 향상', '새로운 아키텍처']
        }
    ]);

    const [scenarioAnalyses, setScenarioAnalyses] = useState<ScenarioAnalysis[]>([
        {
            id: 'optimistic-scenario',
            name: '낙관적 시나리오',
            probability: 25,
            impact: 'positive',
            timeframe: '2030-2040',
            description: 'AI가 인류의 삶을 크게 개선하는 시나리오',
            keyFactors: ['기술적 돌파구', '윤리적 AI 개발', '글로벌 협력'],
            recommendations: ['윤리적 AI 개발 투자', '국제 협력 강화', '교육 체계 혁신']
        },
        {
            id: 'realistic-scenario',
            name: '현실적 시나리오',
            probability: 60,
            impact: 'neutral',
            timeframe: '2030-2040',
            description: 'AI가 점진적으로 발전하며 혼재된 영향을 주는 시나리오',
            keyFactors: ['기술적 한계', '사회적 적응', '규제 발전'],
            recommendations: ['균형잡힌 접근', '사회적 대화 강화', '적응적 정책']
        },
        {
            id: 'pessimistic-scenario',
            name: '비관적 시나리오',
            probability: 15,
            impact: 'negative',
            timeframe: '2030-2040',
            description: 'AI가 사회적 문제를 야기하는 시나리오',
            keyFactors: ['기술적 위험', '사회적 불평등', '통제 실패'],
            recommendations: ['안전성 연구 강화', '사회적 안전망 구축', '긴급 대응 체계']
        }
    ]);

    const [marketForecasts, setMarketForecasts] = useState<MarketForecast[]>([
        {
            id: 'global-ai-market',
            name: '글로벌 AI 시장',
            marketSize: 1900,
            growthRate: 36.8,
            year: 2024,
            region: 'Global',
            description: '글로벌 AI 시장 규모 및 성장률',
            drivers: ['기업 디지털 전환', '자동화 수요 증가', '새로운 기술 혁신']
        },
        {
            id: 'north-america-ai',
            name: '북미 AI 시장',
            marketSize: 850,
            growthRate: 32.5,
            year: 2024,
            region: 'North America',
            description: '북미 지역 AI 시장 현황',
            drivers: ['기술 선도', '투자 환경', '인재 풀']
        },
        {
            id: 'asia-pacific-ai',
            name: '아시아태평양 AI 시장',
            marketSize: 650,
            growthRate: 42.3,
            year: 2024,
            region: 'Asia Pacific',
            description: '아시아태평양 지역 AI 시장 현황',
            drivers: ['디지털 경제 성장', '정부 지원', '스마트시티 구축']
        },
        {
            id: 'europe-ai',
            name: '유럽 AI 시장',
            marketSize: 400,
            growthRate: 28.7,
            year: 2024,
            region: 'Europe',
            description: '유럽 지역 AI 시장 현황',
            drivers: ['규제 프레임워크', '윤리적 AI', '산업 혁신']
        }
    ]);

    const [isRunning, setIsRunning] = useState(false);
    const [selectedTrend, setSelectedTrend] = useState<string | null>(null);
    const [trendDialogOpen, setTrendDialogOpen] = useState(false);

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'success';
            default: return 'default';
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return <TrendingUp color="success" />;
            case 'down': return <TrendingDown color="error" />;
            case 'stable': return <TrendingFlat color="info" />;
            default: return <Timeline />;
        }
    };

    const getScenarioColor = (impact: string) => {
        switch (impact) {
            case 'positive': return 'success';
            case 'negative': return 'error';
            case 'neutral': return 'info';
            default: return 'default';
        }
    };

    const predictionChartData = {
        labels: predictionMetrics.map(metric => metric.name),
        datasets: [
            {
                label: '예측 연도',
                data: predictionMetrics.map(metric => metric.value),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1
            },
            {
                label: '신뢰도',
                data: predictionMetrics.map(metric => metric.confidence),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderDash: [5, 5],
                tension: 0.1
            }
        ]
    };

    const trendChartData = {
        labels: technologyTrends.map(trend => trend.name),
        datasets: [
            {
                label: '도입률',
                data: technologyTrends.map(trend => trend.adoptionRate),
                backgroundColor: technologyTrends.map(trend =>
                    trend.impact === 'high' ? 'rgba(244, 67, 54, 0.8)' :
                        trend.impact === 'medium' ? 'rgba(255, 152, 0, 0.8)' :
                            'rgba(76, 175, 80, 0.8)'
                ),
                borderColor: technologyTrends.map(trend =>
                    trend.impact === 'high' ? 'rgb(244, 67, 54)' :
                        trend.impact === 'medium' ? 'rgb(255, 152, 0)' :
                            'rgb(76, 175, 80)'
                ),
                borderWidth: 1
            }
        ]
    };

    const scenarioChartData = {
        labels: scenarioAnalyses.map(scenario => scenario.name),
        datasets: [
            {
                label: '확률',
                data: scenarioAnalyses.map(scenario => scenario.probability),
                backgroundColor: scenarioAnalyses.map(scenario =>
                    scenario.impact === 'positive' ? 'rgba(76, 175, 80, 0.8)' :
                        scenario.impact === 'negative' ? 'rgba(244, 67, 54, 0.8)' :
                            'rgba(33, 150, 243, 0.8)'
                ),
                borderColor: scenarioAnalyses.map(scenario =>
                    scenario.impact === 'positive' ? 'rgb(76, 175, 80)' :
                        scenario.impact === 'negative' ? 'rgb(244, 67, 54)' :
                            'rgb(33, 150, 243)'
                ),
                borderWidth: 1
            }
        ]
    };

    const marketChartData = {
        labels: marketForecasts.map(forecast => forecast.region),
        datasets: [
            {
                label: '시장 규모 (십억 달러)',
                data: marketForecasts.map(forecast => forecast.marketSize),
                backgroundColor: [
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(54, 162, 235, 0.8)'
                ],
                borderColor: [
                    'rgb(75, 192, 192)',
                    'rgb(255, 99, 132)',
                    'rgb(255, 205, 86)',
                    'rgb(54, 162, 235)'
                ],
                borderWidth: 1
            }
        ]
    };

    const handleRunPrediction = () => {
        setIsRunning(true);
        setTimeout(() => {
            setPredictionMetrics(prev => prev.map(metric => ({
                ...metric,
                value: Math.max(2024, Math.min(2050, metric.value + Math.floor((Math.random() - 0.5) * 3))),
                confidence: Math.min(100, Math.max(0, metric.confidence + (Math.random() - 0.5) * 10)),
                lastUpdated: new Date().toLocaleString()
            })));
            setIsRunning(false);
        }, 3000);
    };

    const handleTrendDetails = (trendId: string) => {
        setSelectedTrend(trendId);
        setTrendDialogOpen(true);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Timeline color="primary" />
                AI 미래 예측 시스템
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                AI 기술의 미래 발전 방향, 트렌드, 시나리오를 예측하고 분석하는 시스템입니다.
            </Typography>

            {/* 제어 패널 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">미래 예측 제어</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="contained"
                                startIcon={isRunning ? <Stop /> : <PlayArrow />}
                                onClick={handleRunPrediction}
                                disabled={isRunning}
                                color={isRunning ? 'error' : 'primary'}
                            >
                                {isRunning ? '예측 중...' : '미래 예측 실행'}
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
                                미래 예측을 실행 중입니다...
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* 예측 지표 */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                {predictionMetrics.map((metric) => (
                    <Grid item xs={12} sm={6} md={4} key={metric.id}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6">{metric.name}</Typography>
                                    {getTrendIcon(metric.trend)}
                                </Box>

                                <Typography variant="h4" color="primary" sx={{ mb: 1 }}>
                                    {metric.value}
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Chip
                                        label={`${metric.confidence}% 신뢰도`}
                                        color="info"
                                        size="small"
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                        {metric.timeframe}
                                    </Typography>
                                </Box>

                                <LinearProgress
                                    variant="determinate"
                                    value={metric.confidence}
                                    color="info"
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
                            <Typography variant="h6" gutterBottom>기술 트렌드 도입률</Typography>
                            <Bar
                                data={trendChartData}
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

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>시나리오 확률</Typography>
                            <Doughnut
                                data={scenarioChartData}
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

            {/* 기술 트렌드 테이블 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>기술 트렌드 분석</Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>기술명</TableCell>
                                    <TableCell>카테고리</TableCell>
                                    <TableCell>도입률</TableCell>
                                    <TableCell>성숙도</TableCell>
                                    <TableCell>영향도</TableCell>
                                    <TableCell>타임프레임</TableCell>
                                    <TableCell>상세</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {technologyTrends.map((trend) => (
                                    <TableRow key={trend.id}>
                                        <TableCell>{trend.name}</TableCell>
                                        <TableCell>{trend.category}</TableCell>
                                        <TableCell>{trend.adoptionRate}%</TableCell>
                                        <TableCell>{trend.maturity}%</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={trend.impact.toUpperCase()}
                                                color={getImpactColor(trend.impact) as any}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{trend.timeframe}</TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                onClick={() => handleTrendDetails(trend.id)}
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

            {/* 시나리오 분석 */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>시나리오 분석</Typography>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>시나리오</TableCell>
                                            <TableCell>확률</TableCell>
                                            <TableCell>영향</TableCell>
                                            <TableCell>타임프레임</TableCell>
                                            <TableCell>설명</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {scenarioAnalyses.map((scenario) => (
                                            <TableRow key={scenario.id}>
                                                <TableCell>{scenario.name}</TableCell>
                                                <TableCell>{scenario.probability}%</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={scenario.impact.toUpperCase()}
                                                        color={getScenarioColor(scenario.impact) as any}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>{scenario.timeframe}</TableCell>
                                                <TableCell>{scenario.description}</TableCell>
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
                            <Typography variant="h6" gutterBottom>시장 예측</Typography>
                            <Bar
                                data={marketChartData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: { display: false },
                                        title: { display: false }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true
                                        }
                                    }
                                }}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 시장 예측 테이블 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>시장 예측 상세</Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>시장명</TableCell>
                                    <TableCell>시장 규모 (십억 달러)</TableCell>
                                    <TableCell>성장률</TableCell>
                                    <TableCell>연도</TableCell>
                                    <TableCell>지역</TableCell>
                                    <TableCell>주요 동인</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {marketForecasts.map((forecast) => (
                                    <TableRow key={forecast.id}>
                                        <TableCell>{forecast.name}</TableCell>
                                        <TableCell>{forecast.marketSize}</TableCell>
                                        <TableCell>{forecast.growthRate}%</TableCell>
                                        <TableCell>{forecast.year}</TableCell>
                                        <TableCell>{forecast.region}</TableCell>
                                        <TableCell>
                                            <Tooltip title={forecast.drivers.join(', ')}>
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

            {/* 트렌드 상세 다이얼로그 */}
            <Dialog
                open={trendDialogOpen}
                onClose={() => setTrendDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    기술 트렌드 상세 정보
                </DialogTitle>
                <DialogContent>
                    {selectedTrend && (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                {technologyTrends.find(trend => trend.id === selectedTrend)?.name}
                            </Typography>
                            <Typography variant="body1" paragraph>
                                {technologyTrends.find(trend => trend.id === selectedTrend)?.description}
                            </Typography>

                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Typography>주요 영향</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <List>
                                        {technologyTrends.find(trend => trend.id === selectedTrend)?.implications.map((impl, index) => (
                                            <ListItem key={index}>
                                                <ListItemIcon>
                                                    <AutoAwesome color="primary" />
                                                </ListItemIcon>
                                                <ListItemText primary={impl} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </AccordionDetails>
                            </Accordion>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTrendDialogOpen(false)}>닫기</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AIFuturePredictionDashboard;
