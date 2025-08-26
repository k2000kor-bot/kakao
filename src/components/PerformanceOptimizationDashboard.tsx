import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardHeader,
    IconButton,
    Chip,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Tooltip,
    Switch,
    FormControlLabel,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    Speed,
    Memory,
    Storage,
    NetworkCheck,
    Cpu,
    Timeline,
    Settings,
    PlayArrow,
    Pause,
    Refresh,
    Warning,
    CheckCircle,
    Error,
    Info,
    ExpandMore,
    Analytics,
    Optimization,
    AutoFixHigh,
    Monitor,
    Assessment,
    TrendingUp,
    TrendingDown,
    Equalizer,
    Dashboard,
    Code,
    Build,
    Security,
    Cloud,
    Storage as StorageIcon,
    Memory as MemoryIcon,
    NetworkCheck as NetworkIcon
} from '@mui/icons-material';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
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
    Title,
    Tooltip,
    Legend,
    Filler
);

interface PerformanceMetric {
    id: string;
    name: string;
    value: number;
    unit: string;
    status: 'optimal' | 'warning' | 'critical';
    trend: 'up' | 'down' | 'stable';
    threshold: number;
}

interface OptimizationRule {
    id: string;
    name: string;
    description: string;
    category: string;
    enabled: boolean;
    priority: 'low' | 'medium' | 'high' | 'critical';
    lastExecuted: string;
    impact: 'positive' | 'negative' | 'neutral';
}

interface SystemResource {
    name: string;
    current: number;
    max: number;
    unit: string;
    usage: number;
    status: 'normal' | 'warning' | 'critical';
}

const PerformanceOptimizationDashboard: React.FC = () => {
    const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([
        {
            id: 'cpu',
            name: 'CPU 사용률',
            value: 45,
            unit: '%',
            status: 'optimal',
            trend: 'stable',
            threshold: 80
        },
        {
            id: 'memory',
            name: '메모리 사용률',
            value: 62,
            unit: '%',
            status: 'warning',
            trend: 'up',
            threshold: 70
        },
        {
            id: 'disk',
            name: '디스크 사용률',
            value: 78,
            unit: '%',
            status: 'warning',
            trend: 'up',
            threshold: 80
        },
        {
            id: 'network',
            name: '네트워크 대역폭',
            value: 35,
            unit: 'Mbps',
            status: 'optimal',
            trend: 'stable',
            threshold: 100
        },
        {
            id: 'response',
            name: '응답 시간',
            value: 120,
            unit: 'ms',
            status: 'optimal',
            trend: 'down',
            threshold: 200
        },
        {
            id: 'throughput',
            name: '처리량',
            value: 850,
            unit: 'req/s',
            status: 'optimal',
            trend: 'up',
            threshold: 1000
        }
    ]);

    const [optimizationRules, setOptimizationRules] = useState<OptimizationRule[]>([
        {
            id: 'cache_optimization',
            name: '캐시 최적화',
            description: '자주 사용되는 데이터를 메모리 캐시에 저장하여 응답 시간 단축',
            category: 'Performance',
            enabled: true,
            priority: 'high',
            lastExecuted: '2024-01-15 14:30:00',
            impact: 'positive'
        },
        {
            id: 'database_optimization',
            name: '데이터베이스 쿼리 최적화',
            description: '느린 쿼리를 식별하고 인덱스를 자동으로 최적화',
            category: 'Database',
            enabled: true,
            priority: 'critical',
            lastExecuted: '2024-01-15 13:45:00',
            impact: 'positive'
        },
        {
            id: 'memory_cleanup',
            name: '메모리 정리',
            description: '사용하지 않는 메모리를 자동으로 해제하여 메모리 누수 방지',
            category: 'Memory',
            enabled: true,
            priority: 'medium',
            lastExecuted: '2024-01-15 14:15:00',
            impact: 'positive'
        },
        {
            id: 'load_balancing',
            name: '로드 밸런싱',
            description: '서버 부하를 분산하여 전체적인 성능 향상',
            category: 'Network',
            enabled: false,
            priority: 'high',
            lastExecuted: '2024-01-14 16:20:00',
            impact: 'positive'
        },
        {
            id: 'compression',
            name: '데이터 압축',
            description: '전송 데이터를 압축하여 네트워크 대역폭 절약',
            category: 'Network',
            enabled: true,
            priority: 'low',
            lastExecuted: '2024-01-15 12:00:00',
            impact: 'positive'
        }
    ]);

    const [systemResources, setSystemResources] = useState<SystemResource[]>([
        { name: 'CPU', current: 4.5, max: 8, unit: 'cores', usage: 56, status: 'normal' },
        { name: '메모리', current: 6.2, max: 16, unit: 'GB', usage: 39, status: 'normal' },
        { name: '디스크', current: 156, max: 500, unit: 'GB', usage: 31, status: 'normal' },
        { name: '네트워크', current: 35, max: 100, unit: 'Mbps', usage: 35, status: 'normal' }
    ]);

    const [autoOptimization, setAutoOptimization] = useState(true);
    const [optimizationDialog, setOptimizationDialog] = useState(false);
    const [selectedRule, setSelectedRule] = useState<OptimizationRule | null>(null);
    const [performanceHistory, setPerformanceHistory] = useState<any>({
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
        datasets: [
            {
                label: 'CPU 사용률',
                data: [30, 35, 45, 55, 50, 45],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.1)',
                fill: true
            },
            {
                label: '메모리 사용률',
                data: [45, 50, 55, 65, 62, 58],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.1)',
                fill: true
            }
        ]
    });

    const [resourceUsage, setResourceUsage] = useState<any>({
        labels: ['CPU', '메모리', '디스크', '네트워크'],
        datasets: [
            {
                data: [56, 39, 31, 35],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(54, 162, 235, 0.8)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(54, 162, 235, 1)'
                ],
                borderWidth: 2
            }
        ]
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'optimal': return 'success';
            case 'warning': return 'warning';
            case 'critical': return 'error';
            default: return 'default';
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return <TrendingUp color="success" />;
            case 'down': return <TrendingDown color="error" />;
            case 'stable': return <Equalizer color="info" />;
            default: return <Equalizer color="info" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'error';
            case 'high': return 'warning';
            case 'medium': return 'info';
            case 'low': return 'default';
            default: return 'default';
        }
    };

    const handleOptimizationToggle = (ruleId: string) => {
        setOptimizationRules(prev =>
            prev.map(rule =>
                rule.id === ruleId
                    ? { ...rule, enabled: !rule.enabled }
                    : rule
            )
        );
    };

    const handleOptimizationDialog = (rule: OptimizationRule) => {
        setSelectedRule(rule);
        setOptimizationDialog(true);
    };

    const executeOptimization = () => {
        // 실제 최적화 실행 로직
        console.log('최적화 실행:', selectedRule?.name);
        setOptimizationDialog(false);
    };

    const runAutoOptimization = () => {
        // 자동 최적화 실행
        console.log('자동 최적화 실행');
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Speed sx={{ mr: 2, color: 'primary.main' }} />
                성능 최적화 시스템
            </Typography>

            {/* 시스템 상태 개요 */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardHeader
                            title="실시간 성능 모니터링"
                            action={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={autoOptimization}
                                                onChange={(e) => setAutoOptimization(e.target.checked)}
                                            />
                                        }
                                        label="자동 최적화"
                                    />
                                    <Button
                                        variant="contained"
                                        startIcon={<PlayArrow />}
                                        onClick={runAutoOptimization}
                                        size="small"
                                    >
                                        최적화 실행
                                    </Button>
                                </Box>
                            }
                        />
                        <CardContent>
                            <Line
                                data={performanceHistory}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: { position: 'top' },
                                        title: { display: false }
                                    },
                                    scales: {
                                        y: { beginAtZero: true, max: 100 }
                                    }
                                }}
                                height={300}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card>
                        <CardHeader title="리소스 사용률" />
                        <CardContent>
                            <Doughnut
                                data={resourceUsage}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: { position: 'bottom' }
                                    }
                                }}
                                height={300}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 성능 지표 */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {performanceMetrics.map((metric) => (
                    <Grid item xs={12} sm={6} md={4} key={metric.id}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" component="div">
                                        {metric.name}
                                    </Typography>
                                    <Tooltip title={`임계값: ${metric.threshold}${metric.unit}`}>
                                        {getTrendIcon(metric.trend)}
                                    </Tooltip>
                                </Box>
                                <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                                    {metric.value}{metric.unit}
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={(metric.value / metric.threshold) * 100}
                                    color={getStatusColor(metric.status) as any}
                                    sx={{ mb: 1 }}
                                />
                                <Chip
                                    label={metric.status === 'optimal' ? '최적' : metric.status === 'warning' ? '주의' : '위험'}
                                    color={getStatusColor(metric.status) as any}
                                    size="small"
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* 최적화 규칙 */}
            <Card sx={{ mb: 4 }}>
                <CardHeader
                    title="최적화 규칙 관리"
                    action={
                        <Button
                            variant="outlined"
                            startIcon={<Settings />}
                            onClick={() => console.log('설정 열기')}
                        >
                            설정
                        </Button>
                    }
                />
                <CardContent>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>규칙명</TableCell>
                                    <TableCell>설명</TableCell>
                                    <TableCell>카테고리</TableCell>
                                    <TableCell>우선순위</TableCell>
                                    <TableCell>상태</TableCell>
                                    <TableCell>마지막 실행</TableCell>
                                    <TableCell>작업</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {optimizationRules.map((rule) => (
                                    <TableRow key={rule.id}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <AutoFixHigh color="primary" />
                                                {rule.name}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{rule.description}</TableCell>
                                        <TableCell>
                                            <Chip label={rule.category} size="small" />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={rule.priority}
                                                color={getPriorityColor(rule.priority) as any}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={rule.enabled}
                                                onChange={() => handleOptimizationToggle(rule.id)}
                                            />
                                        </TableCell>
                                        <TableCell>{rule.lastExecuted}</TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                onClick={() => handleOptimizationDialog(rule)}
                                                disabled={!rule.enabled}
                                            >
                                                실행
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* 시스템 리소스 상세 */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardHeader title="시스템 리소스 상세" />
                        <CardContent>
                            <List>
                                {systemResources.map((resource) => (
                                    <ListItem key={resource.name}>
                                        <ListItemIcon>
                                            {resource.name === 'CPU' && <Cpu />}
                                            {resource.name === '메모리' && <Memory />}
                                            {resource.name === '디스크' && <Storage />}
                                            {resource.name === '네트워크' && <NetworkCheck />}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={resource.name}
                                            secondary={`${resource.current}/${resource.max} ${resource.unit} (${resource.usage}%)`}
                                        />
                                        <LinearProgress
                                            variant="determinate"
                                            value={resource.usage}
                                            color={resource.status === 'normal' ? 'success' : resource.status === 'warning' ? 'warning' : 'error'}
                                            sx={{ width: 100 }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardHeader title="성능 권장사항" />
                        <CardContent>
                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Typography variant="h6">메모리 최적화</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography>
                                        메모리 사용률이 62%로 임계값에 근접하고 있습니다.
                                        불필요한 프로세스를 종료하거나 메모리 정리 규칙을 활성화하는 것을 권장합니다.
                                    </Typography>
                                </AccordionDetails>
                            </Accordion>

                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Typography variant="h6">디스크 공간 관리</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography>
                                        디스크 사용률이 78%로 높습니다.
                                        로그 파일 정리 및 임시 파일 삭제를 통해 공간을 확보하세요.
                                    </Typography>
                                </AccordionDetails>
                            </Accordion>

                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Typography variant="h6">네트워크 최적화</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography>
                                        네트워크 성능이 양호합니다.
                                        로드 밸런싱 규칙을 활성화하여 더 나은 성능을 얻을 수 있습니다.
                                    </Typography>
                                </AccordionDetails>
                            </Accordion>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 최적화 실행 다이얼로그 */}
            <Dialog open={optimizationDialog} onClose={() => setOptimizationDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    최적화 실행: {selectedRule?.name}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        {selectedRule?.description}
                    </Typography>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        이 최적화는 시스템 성능에 긍정적인 영향을 미칠 것으로 예상됩니다.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOptimizationDialog(false)}>취소</Button>
                    <Button onClick={executeOptimization} variant="contained">
                        실행
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PerformanceOptimizationDashboard;
