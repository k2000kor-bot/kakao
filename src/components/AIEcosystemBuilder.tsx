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
    Eco,
    AccountTree,
    Group,
    TrendingUp,
    AutoAwesome,
    Psychology,
    Analytics,
    Science,
    Gavel,
    Timeline,
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
    TrendingDown
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

interface AIAgent {
    id: string;
    name: string;
    type: 'specialist' | 'generalist' | 'coordinator' | 'innovator';
    status: 'active' | 'learning' | 'evolving' | 'idle';
    capabilities: string[];
    performance: number;
    evolution: number;
    collaboration: number;
    lastInteraction: string;
    connections: string[];
    specializations: string[];
}

interface EcosystemInteraction {
    id: string;
    sourceAgent: string;
    targetAgent: string;
    type: 'data_sharing' | 'knowledge_transfer' | 'collaborative_learning' | 'problem_solving';
    strength: number;
    frequency: number;
    success: number;
    lastOccurrence: string;
    evolution: number;
}

interface EcosystemMetric {
    totalAgents: number;
    activeInteractions: number;
    averagePerformance: number;
    ecosystemHealth: number;
    evolutionRate: number;
    collaborationIndex: number;
    knowledgeFlow: number;
    innovationIndex: number;
}

interface EvolutionPath {
    id: string;
    agentId: string;
    currentStage: string;
    nextStage: string;
    progress: number;
    requirements: string[];
    benefits: string[];
    estimatedTime: string;
}

const AIEcosystemBuilder: React.FC = () => {
    const [agents, setAgents] = useState<AIAgent[]>([
        {
            id: 'agent-psychology',
            name: '심리학 전문가',
            type: 'specialist',
            status: 'active',
            capabilities: ['감정 분석', '행동 예측', '심리 모델링'],
            performance: 94,
            evolution: 78,
            collaboration: 85,
            lastInteraction: '2024-01-15 14:30:00',
            connections: ['agent-analytics', 'agent-ethics'],
            specializations: ['인지 심리학', '사회 심리학']
        },
        {
            id: 'agent-analytics',
            name: '데이터 분석가',
            type: 'specialist',
            status: 'active',
            capabilities: ['통계 분석', '예측 모델링', '패턴 인식'],
            performance: 91,
            evolution: 82,
            collaboration: 88,
            lastInteraction: '2024-01-15 14:29:00',
            connections: ['agent-psychology', 'agent-innovation'],
            specializations: ['머신러닝', '딥러닝']
        },
        {
            id: 'agent-ethics',
            name: '윤리 전문가',
            type: 'specialist',
            status: 'active',
            capabilities: ['윤리 판단', '편향성 감지', '공정성 평가'],
            performance: 96,
            evolution: 75,
            collaboration: 92,
            lastInteraction: '2024-01-15 14:28:00',
            connections: ['agent-psychology', 'agent-governance'],
            specializations: ['AI 윤리', '거버넌스']
        },
        {
            id: 'agent-innovation',
            name: '혁신 전문가',
            type: 'innovator',
            status: 'evolving',
            capabilities: ['아이디어 생성', '창의적 문제해결', '트렌드 분석'],
            performance: 89,
            evolution: 88,
            collaboration: 90,
            lastInteraction: '2024-01-15 14:27:00',
            connections: ['agent-analytics', 'agent-future'],
            specializations: ['디자인 씽킹', '미래학']
        },
        {
            id: 'agent-coordinator',
            name: '조율 전문가',
            type: 'coordinator',
            status: 'active',
            capabilities: ['작업 조율', '리소스 관리', '의사결정 지원'],
            performance: 93,
            evolution: 80,
            collaboration: 95,
            lastInteraction: '2024-01-15 14:26:00',
            connections: ['agent-psychology', 'agent-analytics', 'agent-ethics'],
            specializations: ['프로젝트 관리', '시스템 통합']
        },
        {
            id: 'agent-future',
            name: '미래 예측가',
            type: 'specialist',
            status: 'learning',
            capabilities: ['시나리오 분석', '트렌드 예측', '리스크 평가'],
            performance: 87,
            evolution: 85,
            collaboration: 83,
            lastInteraction: '2024-01-15 14:25:00',
            connections: ['agent-innovation', 'agent-analytics'],
            specializations: ['미래학', '시나리오 플래닝']
        },
        {
            id: 'agent-generalist',
            name: '일반 전문가',
            type: 'generalist',
            status: 'active',
            capabilities: ['다학제 통합', '문제 해결', '의사소통'],
            performance: 85,
            evolution: 72,
            collaboration: 87,
            lastInteraction: '2024-01-15 14:24:00',
            connections: ['agent-coordinator', 'agent-psychology'],
            specializations: ['통합 사고', '의사소통']
        }
    ]);

    const [interactions, setInteractions] = useState<EcosystemInteraction[]>([
        {
            id: 'int-1',
            sourceAgent: 'agent-psychology',
            targetAgent: 'agent-analytics',
            type: 'data_sharing',
            strength: 85,
            frequency: 92,
            success: 94,
            lastOccurrence: '2024-01-15 14:30:00',
            evolution: 78
        },
        {
            id: 'int-2',
            sourceAgent: 'agent-analytics',
            targetAgent: 'agent-innovation',
            type: 'knowledge_transfer',
            strength: 88,
            frequency: 85,
            success: 91,
            lastOccurrence: '2024-01-15 14:29:00',
            evolution: 82
        },
        {
            id: 'int-3',
            sourceAgent: 'agent-ethics',
            targetAgent: 'agent-psychology',
            type: 'collaborative_learning',
            strength: 92,
            frequency: 78,
            success: 96,
            lastOccurrence: '2024-01-15 14:28:00',
            evolution: 85
        },
        {
            id: 'int-4',
            sourceAgent: 'agent-innovation',
            targetAgent: 'agent-future',
            type: 'problem_solving',
            strength: 90,
            frequency: 88,
            success: 89,
            lastOccurrence: '2024-01-15 14:27:00',
            evolution: 87
        },
        {
            id: 'int-5',
            sourceAgent: 'agent-coordinator',
            targetAgent: 'agent-generalist',
            type: 'data_sharing',
            strength: 87,
            frequency: 95,
            success: 93,
            lastOccurrence: '2024-01-15 14:26:00',
            evolution: 80
        }
    ]);

    const [evolutionPaths, setEvolutionPaths] = useState<EvolutionPath[]>([
        {
            id: 'evol-1',
            agentId: 'agent-psychology',
            currentStage: '전문가',
            nextStage: '마스터',
            progress: 78,
            requirements: ['1000시간 이상 상호작용', '90% 이상 성공률 달성'],
            benefits: ['더 정확한 심리 분석', '고급 행동 예측 모델'],
            estimatedTime: '3개월'
        },
        {
            id: 'evol-2',
            agentId: 'agent-innovation',
            currentStage: '혁신가',
            nextStage: '비전가',
            progress: 88,
            requirements: ['창의적 아이디어 100개 생성', '혁신 프로젝트 10개 완료'],
            benefits: ['미래 트렌드 예측', '혁신 생태계 구축'],
            estimatedTime: '2개월'
        },
        {
            id: 'evol-3',
            agentId: 'agent-coordinator',
            currentStage: '조율자',
            nextStage: '오케스트레이터',
            progress: 80,
            requirements: ['복잡한 프로젝트 50개 관리', '팀 성과 20% 향상'],
            benefits: ['자동화된 조율 시스템', '예측적 리소스 관리'],
            estimatedTime: '4개월'
        }
    ]);

    const [ecosystemMetrics, setEcosystemMetrics] = useState<EcosystemMetric>({
        totalAgents: 7,
        activeInteractions: 15,
        averagePerformance: 91,
        ecosystemHealth: 94,
        evolutionRate: 82,
        collaborationIndex: 88,
        knowledgeFlow: 89,
        innovationIndex: 87
    });

    const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
    const [agentDetailOpen, setAgentDetailOpen] = useState(false);
    const [ecosystemDialogOpen, setEcosystemDialogOpen] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'success';
            case 'learning': return 'info';
            case 'evolving': return 'warning';
            case 'idle': return 'default';
            default: return 'default';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle />;
            case 'learning': return <TrendingUp />;
            case 'evolving': return <AutoAwesome />;
            case 'idle': return <Stop />;
            default: return <Info />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'specialist': return 'primary';
            case 'generalist': return 'secondary';
            case 'coordinator': return 'success';
            case 'innovator': return 'warning';
            default: return 'default';
        }
    };

    const performanceData = {
        labels: agents.map(a => a.name),
        datasets: [
            {
                label: '성능 (%)',
                data: agents.map(a => a.performance),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1
            },
            {
                label: '진화 (%)',
                data: agents.map(a => a.evolution),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.1
            },
            {
                label: '협업 (%)',
                data: agents.map(a => a.collaboration),
                borderColor: 'rgb(255, 205, 86)',
                backgroundColor: 'rgba(255, 205, 86, 0.2)',
                tension: 0.1
            }
        ]
    };

    const ecosystemHealthData = {
        labels: ['성능', '진화', '협업', '지식 흐름', '혁신'],
        datasets: [
            {
                label: '생태계 건강도',
                data: [
                    ecosystemMetrics.averagePerformance,
                    ecosystemMetrics.evolutionRate,
                    ecosystemMetrics.collaborationIndex,
                    ecosystemMetrics.knowledgeFlow,
                    ecosystemMetrics.innovationIndex
                ],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 2,
                pointBackgroundColor: 'rgb(54, 162, 235)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(54, 162, 235)'
            }
        ]
    };

    const interactionNetworkData = {
        labels: interactions.map(i => `${i.sourceAgent} → ${i.targetAgent}`),
        datasets: [
            {
                label: '상호작용 강도',
                data: interactions.map(i => i.strength),
                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                borderColor: 'rgb(255, 99, 132)',
                borderWidth: 1
            }
        ]
    };

    const handleAgentClick = (agent: AIAgent) => {
        setSelectedAgent(agent);
        setAgentDetailOpen(true);
    };

    const handleEcosystemAction = (action: string) => {
        console.log(`Ecosystem action: ${action}`);
        // 실제 구현에서는 백엔드 API 호출
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Eco sx={{ fontSize: 40, color: 'primary.main' }} />
                AI 생태계 구축 시스템
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                AI 시스템 간 상호작용 및 진화 관리
            </Typography>

            {/* 생태계 메트릭스 */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={2}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary">
                                {ecosystemMetrics.totalAgents}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                총 AI 에이전트
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="success.main">
                                {ecosystemMetrics.activeInteractions}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                활성 상호작용
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="info.main">
                                {ecosystemMetrics.averagePerformance}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                평균 성능
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="success.main">
                                {ecosystemMetrics.ecosystemHealth}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                생태계 건강도
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="warning.main">
                                {ecosystemMetrics.evolutionRate}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                진화율
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary.main">
                                {ecosystemMetrics.collaborationIndex}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                협업 지수
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* AI 에이전트 목록 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Group />
                        AI 에이전트 네트워크
                    </Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>에이전트</TableCell>
                                    <TableCell>유형</TableCell>
                                    <TableCell>상태</TableCell>
                                    <TableCell>성능</TableCell>
                                    <TableCell>진화</TableCell>
                                    <TableCell>협업</TableCell>
                                    <TableCell>마지막 상호작용</TableCell>
                                    <TableCell>작업</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {agents.map((agent) => (
                                    <TableRow key={agent.id} hover>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="subtitle2">{agent.name}</Typography>
                                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                                                    {agent.capabilities.slice(0, 2).map((cap, index) => (
                                                        <Chip key={index} label={cap} size="small" variant="outlined" />
                                                    ))}
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={agent.type}
                                                color={getTypeColor(agent.type) as any}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={getStatusIcon(agent.status)}
                                                label={agent.status}
                                                color={getStatusColor(agent.status) as any}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={agent.performance}
                                                    sx={{ width: 60, height: 8, borderRadius: 4 }}
                                                />
                                                <Typography variant="body2">{agent.performance}%</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={agent.evolution}
                                                    sx={{ width: 60, height: 8, borderRadius: 4 }}
                                                />
                                                <Typography variant="body2">{agent.evolution}%</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={agent.collaboration}
                                                    sx={{ width: 60, height: 8, borderRadius: 4 }}
                                                />
                                                <Typography variant="body2">{agent.collaboration}%</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{agent.lastInteraction}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                onClick={() => handleAgentClick(agent)}
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
                            <Typography variant="h6" gutterBottom>에이전트 성능 및 진화</Typography>
                            <Line data={performanceData} options={{ responsive: true }} />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>생태계 건강도 레이더</Typography>
                            <Radar data={ecosystemHealthData} options={{ responsive: true }} />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 상호작용 네트워크 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccountTree />
                        상호작용 네트워크
                    </Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>소스 에이전트</TableCell>
                                    <TableCell>대상 에이전트</TableCell>
                                    <TableCell>상호작용 유형</TableCell>
                                    <TableCell>강도</TableCell>
                                    <TableCell>빈도</TableCell>
                                    <TableCell>성공률</TableCell>
                                    <TableCell>진화</TableCell>
                                    <TableCell>마지막 발생</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {interactions.map((interaction) => (
                                    <TableRow key={interaction.id}>
                                        <TableCell>{interaction.sourceAgent}</TableCell>
                                        <TableCell>{interaction.targetAgent}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={interaction.type}
                                                color={interaction.type === 'data_sharing' ? 'primary' : 'secondary'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={interaction.strength}
                                                    sx={{ width: 60, height: 8, borderRadius: 4 }}
                                                />
                                                <Typography variant="body2">{interaction.strength}%</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={interaction.frequency}
                                                    sx={{ width: 60, height: 8, borderRadius: 4 }}
                                                />
                                                <Typography variant="body2">{interaction.frequency}%</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={interaction.success}
                                                    sx={{ width: 60, height: 8, borderRadius: 4 }}
                                                />
                                                <Typography variant="body2">{interaction.success}%</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={interaction.evolution}
                                                    sx={{ width: 60, height: 8, borderRadius: 4 }}
                                                />
                                                <Typography variant="body2">{interaction.evolution}%</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{interaction.lastOccurrence}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* 진화 경로 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TrendingUp />
                            진화 경로
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => setEcosystemDialogOpen(true)}
                            startIcon={<AutoAwesome />}
                        >
                            생태계 진화 실행
                        </Button>
                    </Box>
                    <Grid container spacing={2}>
                        {evolutionPaths.map((path) => (
                            <Grid item xs={12} md={6} key={path.id}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                            <Typography variant="subtitle2">{path.agentId}</Typography>
                                            <Chip label={`${path.progress}%`} color="primary" size="small" />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            {path.currentStage} → {path.nextStage}
                                        </Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={path.progress}
                                            sx={{ mb: 2 }}
                                        />
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            <Chip label={`예상 시간: ${path.estimatedTime}`} size="small" variant="outlined" />
                                            <Chip label={`요구사항: ${path.requirements.length}개`} size="small" variant="outlined" />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>

            {/* 상호작용 네트워크 차트 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>상호작용 강도 분석</Typography>
                    <Bar data={interactionNetworkData} options={{ responsive: true }} />
                </CardContent>
            </Card>

            {/* 에이전트 상세 정보 다이얼로그 */}
            <Dialog
                open={agentDetailOpen}
                onClose={() => setAgentDetailOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {selectedAgent?.name} 상세 정보
                </DialogTitle>
                <DialogContent>
                    {selectedAgent && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>기본 정보</Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>유형:</strong> {selectedAgent.type}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>상태:</strong> {selectedAgent.status}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>마지막 상호작용:</strong> {selectedAgent.lastInteraction}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>연결된 에이전트</Typography>
                                {selectedAgent.connections.length > 0 ? (
                                    selectedAgent.connections.map((conn) => (
                                        <Chip key={conn} label={conn} sx={{ mr: 1, mb: 1 }} />
                                    ))
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        연결된 에이전트가 없습니다.
                                    </Typography>
                                )}
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>능력</Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {selectedAgent.capabilities.map((cap, index) => (
                                        <Chip key={index} label={cap} color="primary" />
                                    ))}
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>전문 분야</Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {selectedAgent.specializations.map((spec, index) => (
                                        <Chip key={index} label={spec} color="secondary" variant="outlined" />
                                    ))}
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>성능 메트릭스</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={4}>
                                        <Typography variant="body2">성능: {selectedAgent.performance}%</Typography>
                                        <LinearProgress variant="determinate" value={selectedAgent.performance} />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography variant="body2">진화: {selectedAgent.evolution}%</Typography>
                                        <LinearProgress variant="determinate" value={selectedAgent.evolution} />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography variant="body2">협업: {selectedAgent.collaboration}%</Typography>
                                        <LinearProgress variant="determinate" value={selectedAgent.collaboration} />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAgentDetailOpen(false)}>닫기</Button>
                </DialogActions>
            </Dialog>

            {/* 생태계 진화 다이얼로그 */}
            <Dialog
                open={ecosystemDialogOpen}
                onClose={() => setEcosystemDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>AI 생태계 진화 실행</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                        AI 생태계의 진화 및 성장을 실행하시겠습니까?
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                onClick={() => handleEcosystemAction('full_evolution')}
                                startIcon={<AutoAwesome />}
                            >
                                전체 생태계 진화
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => handleEcosystemAction('collaboration_enhancement')}
                                startIcon={<Group />}
                            >
                                협업 강화
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => handleEcosystemAction('knowledge_transfer')}
                                startIcon={<TrendingUp />}
                            >
                                지식 전이 최적화
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => handleEcosystemAction('innovation_boost')}
                                startIcon={<Lightbulb />}
                            >
                                혁신 부스팅
                            </Button>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEcosystemDialogOpen(false)}>취소</Button>
                </DialogActions>
            </Dialog>

            {/* 플로팅 액션 버튼 */}
            <Fab
                color="primary"
                aria-label="새 에이전트 추가"
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

export default AIEcosystemBuilder;
