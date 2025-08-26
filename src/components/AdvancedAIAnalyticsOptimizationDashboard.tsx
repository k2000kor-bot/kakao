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
    Alert
} from '@mui/material';
import {
    Analytics,
    TrendingUp,
    TrendingDown,
    TrendingFlat,
    Speed,
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
    Add,
    Delete,
    Edit,
    PlayArrow,
    Stop,
    Pause
} from '@mui/icons-material';

interface PerformanceTrend {
    metric: string;
    values: Array<{ timestamp: Date; value: number }>;
    trend: 'improving' | 'stable' | 'declining';
    change_rate: number;
    prediction: {
        next_value: number;
        confidence: number;
        timeframe: number;
    };
}

interface OptimizationRecommendation {
    id: string;
    type: 'performance' | 'accuracy' | 'resource' | 'user_experience' | 'security';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    impact_score: number;
    effort_score: number;
    roi_score: number;
    implementation_steps: string[];
    expected_improvement: any;
    status: 'pending' | 'approved' | 'implemented' | 'rejected';
    created_at: Date;
    implemented_at?: Date;
}

interface AIServiceOptimization {
    service_name: string;
    current_performance: {
        response_time_avg: number;
        accuracy_avg: number;
        throughput_avg: number;
        error_rate_avg: number;
        user_satisfaction_avg: number;
    };
    optimization_history: OptimizationRecommendation[];
    active_optimizations: OptimizationRecommendation[];
    performance_trends: PerformanceTrend[];
    optimization_score: number;
    last_optimized: Date;
}

const AdvancedAIAnalyticsOptimizationDashboard: React.FC = () => {
    const [services, setServices] = useState<AIServiceOptimization[]>([]);
    const [selectedTab, setSelectedTab] = useState(0);
    const [fullscreen, setFullscreen] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [selectedOptimization, setSelectedOptimization] = useState<OptimizationRecommendation | null>(null);
    const [optimizationDialogOpen, setOptimizationDialogOpen] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    // 탭 정의
    const tabs = [
        { label: 'AI 서비스 개요', icon: <Analytics /> },
        { label: '성능 트렌드', icon: <TrendingUp /> },
        { label: '최적화 권장사항', icon: <Build /> },
        { label: '최적화 이력', icon: <Timeline /> },
        { label: '성능 분석', icon: <Assessment /> },
        { label: '설정', icon: <Settings /> }
    ];

    // 데이터 새로고침
    const refreshData = async () => {
        try {
            // 실제로는 API 호출
            const mockServices: AIServiceOptimization[] = [
                {
                    service_name: 'integrated-ai-service',
                    current_performance: {
                        response_time_avg: 245,
                        accuracy_avg: 0.92,
                        throughput_avg: 150,
                        error_rate_avg: 0.03,
                        user_satisfaction_avg: 0.88
                    },
                    optimization_history: [
                        {
                            id: 'opt-1',
                            type: 'performance',
                            priority: 'high',
                            title: '응답 시간 최적화',
                            description: '캐싱 전략 개선으로 응답 시간 단축',
                            impact_score: 85,
                            effort_score: 60,
                            roi_score: 75,
                            implementation_steps: ['캐시 히트율 분석', '알고리즘 최적화'],
                            expected_improvement: { response_time: 30 },
                            status: 'implemented',
                            created_at: new Date(Date.now() - 86400000),
                            implemented_at: new Date(Date.now() - 43200000)
                        }
                    ],
                    active_optimizations: [
                        {
                            id: 'opt-2',
                            type: 'accuracy',
                            priority: 'medium',
                            title: 'AI 모델 정확도 개선',
                            description: '모델 재훈련을 통한 정확도 향상',
                            impact_score: 90,
                            effort_score: 80,
                            roi_score: 85,
                            implementation_steps: ['모델 성능 분석', '데이터 품질 검증'],
                            expected_improvement: { accuracy: 20 },
                            status: 'approved',
                            created_at: new Date(Date.now() - 3600000)
                        }
                    ],
                    performance_trends: [
                        {
                            metric: 'response_time',
                            values: Array.from({ length: 20 }, (_, i) => ({
                                timestamp: new Date(Date.now() - (20 - i) * 3600000),
                                value: 200 + Math.random() * 100
                            })),
                            trend: 'improving',
                            change_rate: 15.5,
                            prediction: {
                                next_value: 180,
                                confidence: 0.85,
                                timeframe: 24
                            }
                        },
                        {
                            metric: 'accuracy',
                            values: Array.from({ length: 20 }, (_, i) => ({
                                timestamp: new Date(Date.now() - (20 - i) * 3600000),
                                value: 0.85 + Math.random() * 0.1
                            })),
                            trend: 'stable',
                            change_rate: 2.3,
                            prediction: {
                                next_value: 0.91,
                                confidence: 0.78,
                                timeframe: 24
                            }
                        }
                    ],
                    optimization_score: 87,
                    last_optimized: new Date(Date.now() - 43200000)
                },
                {
                    service_name: 'ai-psychology-engine',
                    current_performance: {
                        response_time_avg: 180,
                        accuracy_avg: 0.89,
                        throughput_avg: 120,
                        error_rate_avg: 0.02,
                        user_satisfaction_avg: 0.92
                    },
                    optimization_history: [],
                    active_optimizations: [],
                    performance_trends: [
                        {
                            metric: 'response_time',
                            values: Array.from({ length: 20 }, (_, i) => ({
                                timestamp: new Date(Date.now() - (20 - i) * 3600000),
                                value: 150 + Math.random() * 80
                            })),
                            trend: 'declining',
                            change_rate: 8.7,
                            prediction: {
                                next_value: 220,
                                confidence: 0.72,
                                timeframe: 24
                            }
                        }
                    ],
                    optimization_score: 65,
                    last_optimized: new Date(0)
                }
            ];

            setServices(mockServices);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('AI 분석 데이터 새로고침 오류:', error);
        }
    };

    // 자동 새로고침
    useEffect(() => {
        refreshData();

        if (autoRefresh) {
            const interval = setInterval(refreshData, 20000); // 20초마다
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    // 트렌드 아이콘
    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'improving': return <TrendingUp color="success" />;
            case 'declining': return <TrendingDown color="error" />;
            case 'stable': return <TrendingFlat color="info" />;
            default: return <TrendingFlat />;
        }
    };

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

    // 최적화 타입 색상
    const getOptimizationTypeColor = (type: string) => {
        switch (type) {
            case 'performance': return 'primary';
            case 'accuracy': return 'success';
            case 'resource': return 'warning';
            case 'user_experience': return 'info';
            case 'security': return 'error';
            default: return 'default';
        }
    };

    // 상태 색상
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'implemented': return 'success';
            case 'approved': return 'info';
            case 'pending': return 'warning';
            case 'rejected': return 'error';
            default: return 'default';
        }
    };

    const renderServicesOverview = () => (
        <Grid container spacing={3}>
            {/* 전체 최적화 점수 */}
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Analytics color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">전체 최적화 점수</Typography>
                        </Box>
                        <Box textAlign="center">
                            <Typography variant="h3" color="primary">
                                {services.length > 0 ?
                                    Math.round(services.reduce((sum, s) => sum + s.optimization_score, 0) / services.length) : 0
                                }
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                / 100
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={services.length > 0 ?
                                services.reduce((sum, s) => sum + s.optimization_score, 0) / services.length : 0
                            }
                            sx={{ mt: 2 }}
                        />
                    </CardContent>
                </Card>
            </Grid>

            {/* 활성 최적화 */}
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Build color="info" sx={{ mr: 1 }} />
                            <Typography variant="h6">활성 최적화</Typography>
                        </Box>
                        <Typography variant="h4" color="info.main">
                            {services.reduce((sum, s) => sum + s.active_optimizations.length, 0)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            진행 중인 최적화 작업
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            {/* AI 서비스 목록 */}
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">AI 서비스 최적화 상태</Typography>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<Add />}
                            >
                                새 분석 시작
                            </Button>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>서비스명</TableCell>
                                        <TableCell>최적화 점수</TableCell>
                                        <TableCell>응답 시간</TableCell>
                                        <TableCell>정확도</TableCell>
                                        <TableCell>사용자 만족도</TableCell>
                                        <TableCell>활성 최적화</TableCell>
                                        <TableCell>마지막 최적화</TableCell>
                                        <TableCell>작업</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {services.map((service) => (
                                        <TableRow key={service.service_name}>
                                            <TableCell>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {service.service_name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center">
                                                    <Typography variant="body2" sx={{ mr: 1 }}>
                                                        {service.optimization_score}
                                                    </Typography>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={service.optimization_score}
                                                        sx={{ width: 60, height: 6 }}
                                                        color={service.optimization_score > 80 ? 'success' : service.optimization_score > 60 ? 'warning' : 'error'}
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {service.current_performance.response_time_avg.toFixed(0)}ms
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {(service.current_performance.accuracy_avg * 100).toFixed(1)}%
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {(service.current_performance.user_satisfaction_avg * 100).toFixed(1)}%
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Badge badgeContent={service.active_optimizations.length} color="primary">
                                                    <Chip
                                                        label={service.active_optimizations.length > 0 ? '진행 중' : '없음'}
                                                        size="small"
                                                        color={service.active_optimizations.length > 0 ? 'primary' : 'default'}
                                                    />
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {service.last_optimized.getTime() > 0 ?
                                                        service.last_optimized.toLocaleDateString() : '없음'
                                                    }
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title="상세 보기">
                                                    <IconButton size="small">
                                                        <Visibility />
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
        </Grid>
    );

    const renderPerformanceTrends = () => (
        <Grid container spacing={3}>
            {services.map((service) => (
                <Grid item xs={12} key={service.service_name}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" mb={2}>{service.service_name} - 성능 트렌드</Typography>
                            <Grid container spacing={2}>
                                {service.performance_trends.map((trend) => (
                                    <Grid item xs={12} md={6} key={trend.metric}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                                    <Typography variant="subtitle1" fontWeight="medium">
                                                        {trend.metric === 'response_time' ? '응답 시간' :
                                                            trend.metric === 'accuracy' ? '정확도' :
                                                                trend.metric === 'throughput' ? '처리량' :
                                                                    trend.metric === 'error_rate' ? '오류율' :
                                                                        '사용자 만족도'}
                                                    </Typography>
                                                    {getTrendIcon(trend.trend)}
                                                </Box>
                                                <Typography variant="body2" color="textSecondary" mb={2}>
                                                    변화율: {trend.change_rate.toFixed(1)}%
                                                </Typography>
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Typography variant="body2">
                                                        예측값: {trend.prediction.next_value.toFixed(2)}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        신뢰도: {(trend.prediction.confidence * 100).toFixed(0)}%
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );

    const renderOptimizationRecommendations = () => (
        <Grid container spacing={3}>
            {services.map((service) => (
                <Grid item xs={12} key={service.service_name}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" mb={2}>{service.service_name} - 최적화 권장사항</Typography>
                            {service.active_optimizations.length > 0 ? (
                                service.active_optimizations.map((optimization) => (
                                    <Accordion key={optimization.id} sx={{ mb: 1 }}>
                                        <AccordionSummary expandIcon={<ExpandMore />}>
                                            <Box display="flex" alignItems="center" width="100%">
                                                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                                    {optimization.title}
                                                </Typography>
                                                <Chip
                                                    label={optimization.priority}
                                                    size="small"
                                                    color={getPriorityColor(optimization.priority) as any}
                                                    sx={{ mr: 1 }}
                                                />
                                                <Chip
                                                    label={optimization.type}
                                                    size="small"
                                                    color={getOptimizationTypeColor(optimization.type) as any}
                                                    sx={{ mr: 1 }}
                                                />
                                                <Chip
                                                    label={optimization.status}
                                                    size="small"
                                                    color={getStatusColor(optimization.status) as any}
                                                />
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <Typography variant="body1" mb={2}>
                                                        {optimization.description}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Typography variant="subtitle2" mb={1}>점수</Typography>
                                                    <List dense>
                                                        <ListItem>
                                                            <ListItemText
                                                                primary="영향도"
                                                                secondary={`${optimization.impact_score}/100`}
                                                            />
                                                        </ListItem>
                                                        <ListItem>
                                                            <ListItemText
                                                                primary="노력도"
                                                                secondary={`${optimization.effort_score}/100`}
                                                            />
                                                        </ListItem>
                                                        <ListItem>
                                                            <ListItemText
                                                                primary="ROI"
                                                                secondary={`${optimization.roi_score}/100`}
                                                            />
                                                        </ListItem>
                                                    </List>
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Typography variant="subtitle2" mb={1}>구현 단계</Typography>
                                                    <List dense>
                                                        {optimization.implementation_steps.map((step, index) => (
                                                            <ListItem key={index}>
                                                                <ListItemText
                                                                    primary={`${index + 1}. ${step}`}
                                                                />
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Box display="flex" gap={1}>
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            size="small"
                                                            startIcon={<PlayArrow />}
                                                            onClick={() => {
                                                                setSelectedOptimization(optimization);
                                                                setOptimizationDialogOpen(true);
                                                            }}
                                                        >
                                                            승인
                                                        </Button>
                                                        <Button
                                                            variant="outlined"
                                                            color="error"
                                                            size="small"
                                                            startIcon={<Stop />}
                                                        >
                                                            거부
                                                        </Button>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </AccordionDetails>
                                    </Accordion>
                                ))
                            ) : (
                                <Alert severity="info">
                                    현재 활성화된 최적화 권장사항이 없습니다.
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );

    const renderOptimizationHistory = () => (
        <Grid container spacing={3}>
            {services.map((service) => (
                <Grid item xs={12} key={service.service_name}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" mb={2}>{service.service_name} - 최적화 이력</Typography>
                            {service.optimization_history.length > 0 ? (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>최적화명</TableCell>
                                                <TableCell>타입</TableCell>
                                                <TableCell>우선순위</TableCell>
                                                <TableCell>영향도</TableCell>
                                                <TableCell>구현일</TableCell>
                                                <TableCell>상태</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {service.optimization_history.map((optimization) => (
                                                <TableRow key={optimization.id}>
                                                    <TableCell>
                                                        <Typography variant="body1" fontWeight="medium">
                                                            {optimization.title}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={optimization.type}
                                                            size="small"
                                                            color={getOptimizationTypeColor(optimization.type) as any}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={optimization.priority}
                                                            size="small"
                                                            color={getPriorityColor(optimization.priority) as any}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {optimization.impact_score}/100
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {optimization.implemented_at?.toLocaleDateString()}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={optimization.status}
                                                            size="small"
                                                            color={getStatusColor(optimization.status) as any}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Alert severity="info">
                                    최적화 이력이 없습니다.
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );

    const renderPerformanceAnalysis = () => (
        <Grid container spacing={3}>
            {services.map((service) => (
                <Grid item xs={12} md={6} key={service.service_name}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" mb={2}>{service.service_name} - 성능 분석</Typography>
                            <List>
                                <ListItem>
                                    <ListItemIcon><Speed /></ListItemIcon>
                                    <ListItemText
                                        primary="평균 응답 시간"
                                        secondary={`${service.current_performance.response_time_avg.toFixed(0)}ms`}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><CheckCircle /></ListItemIcon>
                                    <ListItemText
                                        primary="평균 정확도"
                                        secondary={`${(service.current_performance.accuracy_avg * 100).toFixed(1)}%`}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><Timeline /></ListItemIcon>
                                    <ListItemText
                                        primary="평균 처리량"
                                        secondary={`${service.current_performance.throughput_avg.toFixed(0)} req/s`}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><Error /></ListItemIcon>
                                    <ListItemText
                                        primary="평균 오류율"
                                        secondary={`${(service.current_performance.error_rate_avg * 100).toFixed(2)}%`}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><Assessment /></ListItemIcon>
                                    <ListItemText
                                        primary="사용자 만족도"
                                        secondary={`${(service.current_performance.user_satisfaction_avg * 100).toFixed(1)}%`}
                                    />
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );

    const renderSettings = () => (
        <Card>
            <CardContent>
                <Typography variant="h6" mb={2}>AI 분석 및 최적화 설정</Typography>
                <List>
                    <ListItem>
                        <ListItemIcon><Refresh /></ListItemIcon>
                        <ListItemText
                            primary="자동 새로고침"
                            secondary="20초마다 데이터 자동 업데이트"
                        />
                        <Switch
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><Analytics /></ListItemIcon>
                        <ListItemText
                            primary="자동 성능 분석"
                            secondary="5분마다 성능 트렌드 분석"
                        />
                        <Switch defaultChecked />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><Build /></ListItemIcon>
                        <ListItemText
                            primary="자동 최적화 권장"
                            secondary="15분마다 최적화 권장사항 생성"
                        />
                        <Switch defaultChecked />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><PlayArrow /></ListItemIcon>
                        <ListItemText
                            primary="자동 최적화 실행"
                            secondary="승인된 최적화 자동 구현"
                        />
                        <Switch defaultChecked />
                    </ListItem>
                </List>
            </CardContent>
        </Card>
    );

    const renderContent = () => {
        switch (selectedTab) {
            case 0: return renderServicesOverview();
            case 1: return renderPerformanceTrends();
            case 2: return renderOptimizationRecommendations();
            case 3: return renderOptimizationHistory();
            case 4: return renderPerformanceAnalysis();
            case 5: return renderSettings();
            default: return renderServicesOverview();
        }
    };

    return (
        <Box sx={{ p: 3, height: '100vh', overflow: 'auto' }}>
            {/* 헤더 */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                    <Analytics sx={{ mr: 1, fontSize: 32 }} color="primary" />
                    <Typography variant="h4">고급 AI 분석 및 최적화 대시보드</Typography>
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

            {/* 최적화 상세 다이얼로그 */}
            <Dialog
                open={optimizationDialogOpen}
                onClose={() => setOptimizationDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center">
                        <Build />
                        <Typography variant="h6" sx={{ ml: 1 }}>
                            최적화 상세 정보
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedOptimization && (
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="h6">{selectedOptimization.title}</Typography>
                                <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                                    {selectedOptimization.description}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="textSecondary">타입</Typography>
                                <Chip
                                    label={selectedOptimization.type}
                                    color={getOptimizationTypeColor(selectedOptimization.type) as any}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="textSecondary">우선순위</Typography>
                                <Chip
                                    label={selectedOptimization.priority}
                                    color={getPriorityColor(selectedOptimization.priority) as any}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">점수</Typography>
                                <Grid container spacing={1}>
                                    <Grid item xs={4}>
                                        <Typography variant="body2">영향도: {selectedOptimization.impact_score}/100</Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography variant="body2">노력도: {selectedOptimization.effort_score}/100</Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography variant="body2">ROI: {selectedOptimization.roi_score}/100</Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">구현 단계</Typography>
                                <List dense>
                                    {selectedOptimization.implementation_steps.map((step, index) => (
                                        <ListItem key={index}>
                                            <ListItemText primary={`${index + 1}. ${step}`} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOptimizationDialogOpen(false)}>닫기</Button>
                    <Button variant="contained" color="primary">
                        최적화 승인
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdvancedAIAnalyticsOptimizationDashboard;
