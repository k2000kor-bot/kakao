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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    LinearProgress,
    IconButton,
    Tooltip,
    Badge,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Switch,
    FormControlLabel,
    Slider,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Fab
} from '@mui/material';
import {
    Visibility,
    Timeline,
    TrendingUp,
    AutoAwesome,
    Psychology,
    Analytics,
    Science,
    Gavel,
    Lightbulb,
    Security,
    Speed,
    CloudSync,
    Assessment,
    Build,
    Code,
    DataUsage,
    Memory,
    Storage,
    NetworkCheck,
    ExpandMore,
    Add,
    PlayArrow,
    Stop,
    Refresh,
    CheckCircle,
    Error,
    Warning,
    Info,
    Hub,
    Settings,
    TrendingDown,
    ShowChart,
    AccountTree,
    Group,
    School,
    Work,
    Home,
    Business,
    EmojiEmotions
} from '@mui/icons-material';
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
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';

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

interface FutureScenario {
    id: string;
    name: string;
    description: string;
    probability: number;
    impact: 'high' | 'medium' | 'low';
    timeframe: string;
    keyTechnologies: string[];
    risks: string[];
    opportunities: string[];
    status: 'active' | 'monitoring' | 'completed';
    lastUpdated: string;
}

interface TechnologyRoadmap {
    id: string;
    technology: string;
    currentStage: string;
    nextStage: string;
    progress: number;
    estimatedCompletion: string;
    dependencies: string[];
    impact: number;
    investment: number;
    priority: 'critical' | 'high' | 'medium' | 'low';
}

interface VisionMetric {
    totalScenarios: number;
    activeScenarios: number;
    averageProbability: number;
    visionClarity: number;
    innovationIndex: number;
    riskAssessment: number;
    opportunityIndex: number;
    strategicAlignment: number;
}

interface StrategicInitiative {
    id: string;
    name: string;
    description: string;
    category: 'research' | 'development' | 'deployment' | 'governance';
    priority: number;
    status: 'planning' | 'active' | 'completed' | 'paused';
    budget: number;
    timeline: string;
    successMetrics: string[];
    stakeholders: string[];
}

const AIFutureVisionSystem: React.FC = () => {
    const [scenarios, setScenarios] = useState<FutureScenario[]>([
        {
            id: 'scenario-agi',
            name: 'AGI 달성',
            description: '일반 인공지능(AGI)의 실현으로 인간 수준의 지능을 가진 AI 시스템 등장',
            probability: 35,
            impact: 'high',
            timeframe: '2030-2040',
            keyTechnologies: ['양자 컴퓨팅', '신경망 진화', '자기 학습 시스템'],
            risks: ['인간 직업 대체', 'AI 통제 문제', '윤리적 딜레마'],
            opportunities: ['과학적 발견 가속화', '복잡한 문제 해결', '인간 능력 증강'],
            status: 'active',
            lastUpdated: '2024-01-15 14:30:00'
        },
        {
            id: 'scenario-quantum-ai',
            name: '양자 AI 혁명',
            description: '양자 컴퓨팅과 AI의 결합으로 기존 컴퓨팅의 한계를 뛰어넘는 성능 달성',
            probability: 65,
            impact: 'high',
            timeframe: '2025-2035',
            keyTechnologies: ['양자 알고리즘', '양자 머신러닝', '양자 암호화'],
            risks: ['기존 암호화 체계 붕괴', '양자 우위 경쟁', '기술 격차 확대'],
            opportunities: ['의약품 개발 혁신', '기후 변화 모델링', '금융 최적화'],
            status: 'active',
            lastUpdated: '2024-01-15 14:29:00'
        },
        {
            id: 'scenario-brain-computer',
            name: '뇌-컴퓨터 인터페이스',
            description: '인간의 뇌와 컴퓨터를 직접 연결하여 사고와 정보를 실시간 교환',
            probability: 45,
            impact: 'high',
            timeframe: '2035-2045',
            keyTechnologies: ['신경 임플란트', '뇌 신호 해독', '양방향 통신'],
            risks: ['개인정보 침해', '뇌 손상 위험', '사회적 불평등'],
            opportunities: ['장애인 재활', '교육 혁신', '의료 진단 혁신'],
            status: 'monitoring',
            lastUpdated: '2024-01-15 14:28:00'
        },
        {
            id: 'scenario-autonomous-society',
            name: '자율 사회',
            description: 'AI가 사회의 모든 영역에서 자율적으로 운영되는 완전 자동화 사회',
            probability: 55,
            impact: 'medium',
            timeframe: '2040-2050',
            keyTechnologies: ['자율 시스템', 'IoT 네트워크', '스마트 시티'],
            risks: ['인간 의존성 증가', '시스템 오류 위험', '감시 사회'],
            opportunities: ['효율성 극대화', '환경 보호', '편의성 증대'],
            status: 'active',
            lastUpdated: '2024-01-15 14:27:00'
        },
        {
            id: 'scenario-ai-governance',
            name: 'AI 거버넌스 체계',
            description: 'AI 기술의 발전에 따른 글로벌 거버넌스 체계의 확립',
            probability: 75,
            impact: 'medium',
            timeframe: '2025-2035',
            keyTechnologies: ['정책 AI', '규제 자동화', '윤리적 AI 프레임워크'],
            risks: ['규제 과잉', '국가 간 갈등', '혁신 저해'],
            opportunities: ['AI 안전성 확보', '국제 협력', '지속가능한 발전'],
            status: 'active',
            lastUpdated: '2024-01-15 14:26:00'
        }
    ]);

    const [roadmap, setRoadmap] = useState<TechnologyRoadmap[]>([
        {
            id: 'roadmap-1',
            technology: '양자 AI',
            currentStage: '연구 단계',
            nextStage: '프로토타입',
            progress: 45,
            estimatedCompletion: '2026',
            dependencies: ['양자 컴퓨팅 하드웨어', '양자 알고리즘'],
            impact: 95,
            investment: 85,
            priority: 'critical'
        },
        {
            id: 'roadmap-2',
            technology: 'AGI 개발',
            currentStage: '기초 연구',
            nextStage: '좁은 AI 통합',
            progress: 25,
            estimatedCompletion: '2035',
            dependencies: ['신경망 진화', '자기 학습', '의식 모델링'],
            impact: 100,
            investment: 90,
            priority: 'critical'
        },
        {
            id: 'roadmap-3',
            technology: '뇌-컴퓨터 인터페이스',
            currentStage: '실험 단계',
            nextStage: '임상 시험',
            progress: 35,
            estimatedCompletion: '2030',
            dependencies: ['신경 임플란트 기술', '뇌 신호 해독'],
            impact: 85,
            investment: 70,
            priority: 'high'
        },
        {
            id: 'roadmap-4',
            technology: 'AI 거버넌스',
            currentStage: '정책 수립',
            nextStage: '국제 협약',
            progress: 60,
            estimatedCompletion: '2027',
            dependencies: ['국제 협력', '정책 프레임워크'],
            impact: 80,
            investment: 60,
            priority: 'high'
        },
        {
            id: 'roadmap-5',
            technology: '자율 시스템',
            currentStage: '개발 단계',
            nextStage: '시범 운영',
            progress: 70,
            estimatedCompletion: '2028',
            dependencies: ['IoT 인프라', '자율 알고리즘'],
            impact: 75,
            investment: 65,
            priority: 'medium'
        }
    ]);

    const [initiatives, setInitiatives] = useState<StrategicInitiative[]>([
        {
            id: 'initiative-1',
            name: 'AGI 안전성 연구',
            description: 'AGI 개발 과정에서의 안전성과 윤리적 문제 해결을 위한 연구',
            category: 'research',
            priority: 1,
            status: 'active',
            budget: 50000000,
            timeline: '2024-2030',
            successMetrics: ['안전성 프레임워크 수립', '윤리적 가이드라인 개발'],
            stakeholders: ['연구기관', '정부', '기업', '시민사회']
        },
        {
            id: 'initiative-2',
            name: '양자 AI 인프라 구축',
            description: '양자 컴퓨팅과 AI를 결합한 인프라 구축 및 개발 환경 조성',
            category: 'development',
            priority: 2,
            status: 'planning',
            budget: 100000000,
            timeline: '2024-2028',
            successMetrics: ['양자 AI 플랫폼 구축', '개발자 생태계 조성'],
            stakeholders: ['기술 기업', '대학', '정부', '투자자']
        },
        {
            id: 'initiative-3',
            name: 'AI 거버넌스 체계 구축',
            description: 'AI 기술 발전에 대응하는 글로벌 거버넌스 체계 수립',
            category: 'governance',
            priority: 1,
            status: 'active',
            budget: 30000000,
            timeline: '2024-2027',
            successMetrics: ['국제 협약 체결', '규제 프레임워크 수립'],
            stakeholders: ['국제기구', '정부', '기업', '시민사회']
        },
        {
            id: 'initiative-4',
            name: 'AI 교육 혁신',
            description: 'AI 시대에 대응하는 교육 시스템 혁신 및 인재 양성',
            category: 'deployment',
            priority: 3,
            status: 'active',
            budget: 20000000,
            timeline: '2024-2026',
            successMetrics: ['AI 교육 커리큘럼 개발', '인재 양성 프로그램 운영'],
            stakeholders: ['교육기관', '기업', '정부', '학생']
        }
    ]);

    const [visionMetrics, setVisionMetrics] = useState<VisionMetric>({
        totalScenarios: 5,
        activeScenarios: 4,
        averageProbability: 55,
        visionClarity: 85,
        innovationIndex: 78,
        riskAssessment: 72,
        opportunityIndex: 82,
        strategicAlignment: 88
    });

    const [selectedScenario, setSelectedScenario] = useState<FutureScenario | null>(null);
    const [scenarioDetailOpen, setScenarioDetailOpen] = useState(false);
    const [visionDialogOpen, setVisionDialogOpen] = useState(false);

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'success';
            default: return 'default';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'success';
            case 'monitoring': return 'info';
            case 'completed': return 'default';
            default: return 'default';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'error';
            case 'high': return 'warning';
            case 'medium': return 'info';
            case 'low': return 'success';
            default: return 'default';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'research': return 'primary';
            case 'development': return 'secondary';
            case 'deployment': return 'success';
            case 'governance': return 'warning';
            default: return 'default';
        }
    };

    const scenarioData = {
        labels: scenarios.map(s => s.name),
        datasets: [
            {
                label: '발생 확률 (%)',
                data: scenarios.map(s => s.probability),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1
            }
        ]
    };

    const roadmapData = {
        labels: roadmap.map(r => r.technology),
        datasets: [
            {
                label: '진행률 (%)',
                data: roadmap.map(r => r.progress),
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 1
            }
        ]
    };

    const visionRadarData = {
        labels: ['시나리오 확률', '비전 명확성', '혁신 지수', '리스크 평가', '기회 지수', '전략 정렬'],
        datasets: [
            {
                label: '미래 비전 지표',
                data: [
                    visionMetrics.averageProbability,
                    visionMetrics.visionClarity,
                    visionMetrics.innovationIndex,
                    visionMetrics.riskAssessment,
                    visionMetrics.opportunityIndex,
                    visionMetrics.strategicAlignment
                ],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgb(255, 99, 132)',
                borderWidth: 2,
                pointBackgroundColor: 'rgb(255, 99, 132)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(255, 99, 132)'
            }
        ]
    };

    const handleScenarioClick = (scenario: FutureScenario) => {
        setSelectedScenario(scenario);
        setScenarioDetailOpen(true);
    };

    const handleVisionAction = (action: string) => {
        console.log(`Vision action: ${action}`);
        // 실제 구현에서는 백엔드 API 호출
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Visibility sx={{ fontSize: 40, color: 'primary.main' }} />
                AI 미래 비전 시스템
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                AI 기술의 장기적 발전 방향 및 비전 제시
            </Typography>

            {/* 비전 메트릭스 */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={2}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary">
                                {visionMetrics.totalScenarios}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                총 시나리오
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="success.main">
                                {visionMetrics.activeScenarios}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                활성 시나리오
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="info.main">
                                {visionMetrics.averageProbability}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                평균 확률
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="success.main">
                                {visionMetrics.visionClarity}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                비전 명확성
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="warning.main">
                                {visionMetrics.innovationIndex}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                혁신 지수
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary.main">
                                {visionMetrics.strategicAlignment}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                전략 정렬
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 미래 시나리오 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Timeline />
                        미래 시나리오 분석
                    </Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>시나리오</TableCell>
                                    <TableCell>확률</TableCell>
                                    <TableCell>영향도</TableCell>
                                    <TableCell>타임라인</TableCell>
                                    <TableCell>상태</TableCell>
                                    <TableCell>마지막 업데이트</TableCell>
                                    <TableCell>작업</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {scenarios.map((scenario) => (
                                    <TableRow key={scenario.id} hover>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="subtitle2">{scenario.name}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {scenario.description}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={scenario.probability}
                                                    sx={{ width: 60, height: 8, borderRadius: 4 }}
                                                />
                                                <Typography variant="body2">{scenario.probability}%</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={scenario.impact}
                                                color={getImpactColor(scenario.impact) as any}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{scenario.timeframe}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={scenario.status}
                                                color={getStatusColor(scenario.status) as any}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{scenario.lastUpdated}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                onClick={() => handleScenarioClick(scenario)}
                                                startIcon={<Info />}
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

            {/* 차트 섹션 */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>시나리오 발생 확률</Typography>
                            <Bar data={scenarioData} options={{ responsive: true }} />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>미래 비전 레이더</Typography>
                            <Radar data={visionRadarData} options={{ responsive: true }} />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 기술 로드맵 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ShowChart />
                        기술 로드맵
                    </Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>기술</TableCell>
                                    <TableCell>현재 단계</TableCell>
                                    <TableCell>진행률</TableCell>
                                    <TableCell>예상 완료</TableCell>
                                    <TableCell>영향도</TableCell>
                                    <TableCell>투자</TableCell>
                                    <TableCell>우선순위</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {roadmap.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <Typography variant="subtitle2">{item.technology}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {item.currentStage} → {item.nextStage}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{item.currentStage}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={item.progress}
                                                    sx={{ width: 60, height: 8, borderRadius: 4 }}
                                                />
                                                <Typography variant="body2">{item.progress}%</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{item.estimatedCompletion}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={item.impact}
                                                    sx={{ width: 60, height: 8, borderRadius: 4 }}
                                                />
                                                <Typography variant="body2">{item.impact}%</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={item.investment}
                                                    sx={{ width: 60, height: 8, borderRadius: 4 }}
                                                />
                                                <Typography variant="body2">{item.investment}%</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={item.priority}
                                                color={getPriorityColor(item.priority) as any}
                                                size="small"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* 전략 이니셔티브 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Business />
                            전략 이니셔티브
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => setVisionDialogOpen(true)}
                            startIcon={<AutoAwesome />}
                        >
                            비전 실행
                        </Button>
                    </Box>
                    <Grid container spacing={2}>
                        {initiatives.map((initiative) => (
                            <Grid item xs={12} md={6} key={initiative.id}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                            <Typography variant="subtitle2">{initiative.name}</Typography>
                                            <Chip
                                                label={initiative.category}
                                                color={getCategoryColor(initiative.category) as any}
                                                size="small"
                                            />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            {initiative.description}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                            <Chip label={`우선순위: ${initiative.priority}`} size="small" variant="outlined" />
                                            <Chip label={initiative.status} size="small" variant="outlined" />
                                            <Chip label={`예산: $${(initiative.budget / 1000000).toFixed(1)}M`} size="small" variant="outlined" />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            타임라인: {initiative.timeline}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>

            {/* 로드맵 진행률 차트 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>기술 로드맵 진행률</Typography>
                    <Bar data={roadmapData} options={{ responsive: true }} />
                </CardContent>
            </Card>

            {/* 시나리오 상세 정보 다이얼로그 */}
            <Dialog
                open={scenarioDetailOpen}
                onClose={() => setScenarioDetailOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {selectedScenario?.name} 상세 정보
                </DialogTitle>
                <DialogContent>
                    {selectedScenario && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>기본 정보</Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>설명:</strong> {selectedScenario.description}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>확률:</strong> {selectedScenario.probability}%
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>영향도:</strong> {selectedScenario.impact}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>타임라인:</strong> {selectedScenario.timeframe}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>상태:</strong> {selectedScenario.status}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>핵심 기술</Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {selectedScenario.keyTechnologies.map((tech, index) => (
                                        <Chip key={index} label={tech} color="primary" />
                                    ))}
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>리스크</Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {selectedScenario.risks.map((risk, index) => (
                                        <Chip key={index} label={risk} color="error" variant="outlined" />
                                    ))}
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>기회</Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {selectedScenario.opportunities.map((opportunity, index) => (
                                        <Chip key={index} label={opportunity} color="success" variant="outlined" />
                                    ))}
                                </Box>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setScenarioDetailOpen(false)}>닫기</Button>
                </DialogActions>
            </Dialog>

            {/* 비전 실행 다이얼로그 */}
            <Dialog
                open={visionDialogOpen}
                onClose={() => setVisionDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>AI 미래 비전 실행</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                        AI 미래 비전 시스템의 실행 및 전략 수립을 진행하시겠습니까?
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                onClick={() => handleVisionAction('vision_execution')}
                                startIcon={<AutoAwesome />}
                            >
                                비전 실행
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => handleVisionAction('scenario_analysis')}
                                startIcon={<Timeline />}
                            >
                                시나리오 분석
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => handleVisionAction('roadmap_optimization')}
                                startIcon={<ShowChart />}
                            >
                                로드맵 최적화
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => handleVisionAction('strategic_planning')}
                                startIcon={<Business />}
                            >
                                전략 계획 수립
                            </Button>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setVisionDialogOpen(false)}>취소</Button>
                </DialogActions>
            </Dialog>

            {/* 플로팅 액션 버튼 */}
            <Fab
                color="primary"
                aria-label="새 시나리오 추가"
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                }}
            >
                <Add />
            </Fab>
        </Box>
    );
};

export default AIFutureVisionSystem;
