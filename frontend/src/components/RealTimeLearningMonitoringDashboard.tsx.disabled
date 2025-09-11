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
    CircularProgress
} from '@mui/material';
import {
    School,
    TrendingUp,
    TrendingDown,
    TrendingFlat,
    Psychology,
    AutoFixHigh,
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
    PlayArrow,
    Stop,
    Pause,
    Undo,
    SmartToy,
    Analytics,
    ModelTraining
} from '@mui/icons-material';

interface LearningPattern {
    pattern_id: string;
    pattern_type: 'user_preference' | 'interaction_style' | 'domain_expertise' | 'error_pattern' | 'success_pattern';
    description: string;
    confidence: number;
    frequency: number;
    impact_score: number;
    detected_at: Date;
    last_seen: Date;
    user_ids: string[];
    pattern_data: any;
}

interface ModelAdaptation {
    adaptation_id: string;
    model_component: string;
    adaptation_type: 'weight_update' | 'architecture_change' | 'hyperparameter_tuning' | 'feature_engineering';
    trigger_pattern: string;
    changes_made: any;
    performance_before: {
        accuracy: number;
        response_time: number;
        user_satisfaction: number;
    };
    performance_after: {
        accuracy: number;
        response_time: number;
        user_satisfaction: number;
    };
    improvement_score: number;
    applied_at: Date;
    rollback_available: boolean;
}

interface LearningMetrics {
    total_learning_events: number;
    successful_adaptations: number;
    failed_adaptations: number;
    average_improvement: number;
    learning_velocity: number;
    model_stability: number;
    user_satisfaction_trend: number;
    adaptation_success_rate: number;
}

const RealTimeLearningMonitoringDashboard: React.FC = () => {
    const [learningMetrics, setLearningMetrics] = useState<LearningMetrics | null>(null);
    const [detectedPatterns, setDetectedPatterns] = useState<LearningPattern[]>([]);
    const [modelAdaptations, setModelAdaptations] = useState<ModelAdaptation[]>([]);
    const [selectedTab, setSelectedTab] = useState(0);
    const [fullscreen, setFullscreen] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [selectedPattern, setSelectedPattern] = useState<LearningPattern | null>(null);
    const [selectedAdaptation, setSelectedAdaptation] = useState<ModelAdaptation | null>(null);
    const [patternDialogOpen, setPatternDialogOpen] = useState(false);
    const [adaptationDialogOpen, setAdaptationDialogOpen] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    // 탭 정의
    const tabs = [
        { label: '학습 개요', icon: <School /> },
        { label: '감지된 패턴', icon: <Psychology /> },
        { label: '모델 적응', icon: <AutoFixHigh /> },
        { label: '성능 트렌드', icon: <TrendingUp /> },
        { label: '학습 메트릭', icon: <Analytics /> },
        { label: '설정', icon: <Settings /> }
    ];

    // 데이터 새로고침
    const refreshData = async () => {
        try {
            // 실제로는 API 호출
            const mockMetrics: LearningMetrics = {
                total_learning_events: 1247,
                successful_adaptations: 23,
                failed_adaptations: 3,
                average_improvement: 15.7,
                learning_velocity: 2.3,
                model_stability: 0.92,
                user_satisfaction_trend: 8.5,
                adaptation_success_rate: 0.88
            };

            const mockPatterns: LearningPattern[] = [
                {
                    pattern_id: 'pref-user1-001',
                    pattern_type: 'user_preference',
                    description: '사용자가 기술 도메인의 상세한 응답을 선호함',
                    confidence: 0.92,
                    frequency: 15,
                    impact_score: 0.8,
                    detected_at: new Date(Date.now() - 3600000),
                    last_seen: new Date(),
                    user_ids: ['user-1', 'user-3'],
                    pattern_data: {
                        preferred_domain: 'technology',
                        preferred_response_length: 750,
                        satisfaction_scores: [0.9, 0.85, 0.92, 0.88]
                    }
                },
                {
                    pattern_id: 'style-user2-002',
                    pattern_type: 'interaction_style',
                    description: '사용자는 복잡한 질문을 선호하며 빠른 응답을 기대함',
                    confidence: 0.87,
                    frequency: 12,
                    impact_score: 0.7,
                    detected_at: new Date(Date.now() - 7200000),
                    last_seen: new Date(Date.now() - 1800000),
                    user_ids: ['user-2'],
                    pattern_data: {
                        avg_complexity: 0.85,
                        avg_response_time: 450,
                        interaction_count: 12
                    }
                },
                {
                    pattern_id: 'expertise-user1-tech-003',
                    pattern_type: 'domain_expertise',
                    description: '사용자는 technology 도메인에서 높은 전문성을 보임',
                    confidence: 0.95,
                    frequency: 18,
                    impact_score: 0.9,
                    detected_at: new Date(Date.now() - 10800000),
                    last_seen: new Date(Date.now() - 900000),
                    user_ids: ['user-1'],
                    pattern_data: {
                        domain: 'technology',
                        avg_accuracy: 0.93,
                        avg_complexity: 0.78,
                        expertise_level: 'high'
                    }
                }
            ];

            const mockAdaptations: ModelAdaptation[] = [
                {
                    adaptation_id: 'adapt-001',
                    model_component: 'response-generator',
                    adaptation_type: 'weight_update',
                    trigger_pattern: 'pref-user1-001',
                    changes_made: {
                        response_style_weights: { detailed: 0.8, concise: 0.2 },
                        personalization_factor: 0.92
                    },
                    performance_before: {
                        accuracy: 0.85,
                        response_time: 320,
                        user_satisfaction: 0.78
                    },
                    performance_after: {
                        accuracy: 0.89,
                        response_time: 295,
                        user_satisfaction: 0.85
                    },
                    improvement_score: 12.5,
                    applied_at: new Date(Date.now() - 1800000),
                    rollback_available: true
                },
                {
                    adaptation_id: 'adapt-002',
                    model_component: 'nlp-engine',
                    adaptation_type: 'hyperparameter_tuning',
                    trigger_pattern: 'style-user2-002',
                    changes_made: {
                        complexity_threshold: 0.85,
                        response_time_target: 450
                    },
                    performance_before: {
                        accuracy: 0.82,
                        response_time: 520,
                        user_satisfaction: 0.75
                    },
                    performance_after: {
                        accuracy: 0.86,
                        response_time: 445,
                        user_satisfaction: 0.82
                    },
                    improvement_score: 18.3,
                    applied_at: new Date(Date.now() - 3600000),
                    rollback_available: true
                }
            ];

            setLearningMetrics(mockMetrics);
            setDetectedPatterns(mockPatterns);
            setModelAdaptations(mockAdaptations);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('학습 데이터 새로고침 오류:', error);
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

    // 패턴 타입 색상
    const getPatternTypeColor = (type: string) => {
        switch (type) {
            case 'user_preference': return 'primary';
            case 'interaction_style': return 'secondary';
            case 'domain_expertise': return 'success';
            case 'error_pattern': return 'error';
            case 'success_pattern': return 'info';
            default: return 'default';
        }
    };

    // 적응 타입 색상
    const getAdaptationTypeColor = (type: string) => {
        switch (type) {
            case 'weight_update': return 'primary';
            case 'architecture_change': return 'error';
            case 'hyperparameter_tuning': return 'warning';
            case 'feature_engineering': return 'info';
            default: return 'default';
        }
    };

    // 트렌드 아이콘
    const getTrendIcon = (value: number) => {
        if (value > 5) return <TrendingUp color="success" />;
        if (value < -5) return <TrendingDown color="error" />;
        return <TrendingFlat color="info" />;
    };

    const renderLearningOverview = () => (
        <Grid container spacing={3}>
            {/* 학습 메트릭 카드들 */}
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <School color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">총 학습 이벤트</Typography>
                        </Box>
                        <Typography variant="h4" color="primary">
                            {learningMetrics?.total_learning_events.toLocaleString() || 0}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            누적 학습 데이터
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <AutoFixHigh color="success" sx={{ mr: 1 }} />
                            <Typography variant="h6">성공적 적응</Typography>
                        </Box>
                        <Typography variant="h4" color="success.main">
                            {learningMetrics?.successful_adaptations || 0}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            모델 개선 횟수
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <TrendingUp color="info" sx={{ mr: 1 }} />
                            <Typography variant="h6">평균 개선율</Typography>
                        </Box>
                        <Typography variant="h4" color="info.main">
                            {learningMetrics?.average_improvement.toFixed(1) || 0}%
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            성능 향상 정도
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Speed color="warning" sx={{ mr: 1 }} />
                            <Typography variant="h6">학습 속도</Typography>
                        </Box>
                        <Typography variant="h4" color="warning.main">
                            {learningMetrics?.learning_velocity.toFixed(1) || 0}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            적응/시간
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            {/* 상세 메트릭 */}
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>모델 안정성 및 성공률</Typography>
                        <Box mb={2}>
                            <Typography variant="body2" color="textSecondary" mb={1}>
                                모델 안정성: {((learningMetrics?.model_stability || 0) * 100).toFixed(1)}%
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={(learningMetrics?.model_stability || 0) * 100}
                                color="success"
                                sx={{ height: 8, borderRadius: 4 }}
                            />
                        </Box>
                        <Box>
                            <Typography variant="body2" color="textSecondary" mb={1}>
                                적응 성공률: {((learningMetrics?.adaptation_success_rate || 0) * 100).toFixed(1)}%
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={(learningMetrics?.adaptation_success_rate || 0) * 100}
                                color="primary"
                                sx={{ height: 8, borderRadius: 4 }}
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>사용자 만족도 트렌드</Typography>
                        <Box display="flex" alignItems="center" mb={2}>
                            {getTrendIcon(learningMetrics?.user_satisfaction_trend || 0)}
                            <Typography variant="h4" sx={{ ml: 1 }}>
                                {learningMetrics?.user_satisfaction_trend.toFixed(1) || 0}%
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="textSecondary">
                            최근 만족도 변화율
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            {/* 최근 활동 */}
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>최근 학습 활동</Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon><AutoFixHigh color="success" /></ListItemIcon>
                                <ListItemText
                                    primary="모델 적응 완료: response-generator"
                                    secondary="12.5% 성능 향상 달성 (2분 전)"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><Psychology color="primary" /></ListItemIcon>
                                <ListItemText
                                    primary="새로운 사용자 선호도 패턴 감지"
                                    secondary="기술 도메인 상세 응답 선호 (5분 전)"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><ModelTraining color="info" /></ListItemIcon>
                                <ListItemText
                                    primary="하이퍼파라미터 튜닝 실행"
                                    secondary="NLP 엔진 응답 시간 최적화 (8분 전)"
                                />
                            </ListItem>
                        </List>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    const renderDetectedPatterns = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">감지된 학습 패턴</Typography>
                            <Button variant="outlined" size="small" startIcon={<Refresh />}>
                                패턴 재분석
                            </Button>
                        </Box>
                        {detectedPatterns.length > 0 ? (
                            detectedPatterns.map((pattern) => (
                                <Accordion key={pattern.pattern_id} sx={{ mb: 1 }}>
                                    <AccordionSummary expandIcon={<ExpandMore />}>
                                        <Box display="flex" alignItems="center" width="100%">
                                            <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                                {pattern.description}
                                            </Typography>
                                            <Chip
                                                label={pattern.pattern_type}
                                                size="small"
                                                color={getPatternTypeColor(pattern.pattern_type) as any}
                                                sx={{ mr: 1 }}
                                            />
                                            <Chip
                                                label={`신뢰도: ${(pattern.confidence * 100).toFixed(0)}%`}
                                                size="small"
                                                color="info"
                                            />
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="subtitle2" mb={1}>패턴 정보</Typography>
                                                <List dense>
                                                    <ListItem>
                                                        <ListItemText
                                                            primary="빈도"
                                                            secondary={`${pattern.frequency}회`}
                                                        />
                                                    </ListItem>
                                                    <ListItem>
                                                        <ListItemText
                                                            primary="영향도"
                                                            secondary={`${(pattern.impact_score * 100).toFixed(0)}%`}
                                                        />
                                                    </ListItem>
                                                    <ListItem>
                                                        <ListItemText
                                                            primary="감지 시간"
                                                            secondary={pattern.detected_at.toLocaleString()}
                                                        />
                                                    </ListItem>
                                                    <ListItem>
                                                        <ListItemText
                                                            primary="마지막 관찰"
                                                            secondary={pattern.last_seen.toLocaleString()}
                                                        />
                                                    </ListItem>
                                                </List>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="subtitle2" mb={1}>관련 사용자</Typography>
                                                <Box display="flex" gap={1} flexWrap="wrap">
                                                    {pattern.user_ids.map(userId => (
                                                        <Chip key={userId} label={userId} size="small" />
                                                    ))}
                                                </Box>
                                                <Typography variant="subtitle2" mt={2} mb={1}>패턴 데이터</Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    {JSON.stringify(pattern.pattern_data, null, 2)}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Box display="flex" gap={1}>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        size="small"
                                                        startIcon={<AutoFixHigh />}
                                                        onClick={() => {
                                                            setSelectedPattern(pattern);
                                                            setPatternDialogOpen(true);
                                                        }}
                                                    >
                                                        적응 실행
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<Visibility />}
                                                    >
                                                        상세 보기
                                                    </Button>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                            ))
                        ) : (
                            <Alert severity="info">
                                현재 감지된 학습 패턴이 없습니다.
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    const renderModelAdaptations = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>모델 적응 이력</Typography>
                        {modelAdaptations.length > 0 ? (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>적응 ID</TableCell>
                                            <TableCell>컴포넌트</TableCell>
                                            <TableCell>타입</TableCell>
                                            <TableCell>개선율</TableCell>
                                            <TableCell>적용 시간</TableCell>
                                            <TableCell>상태</TableCell>
                                            <TableCell>작업</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {modelAdaptations.map((adaptation) => (
                                            <TableRow key={adaptation.adaptation_id}>
                                                <TableCell>
                                                    <Typography variant="body2" fontFamily="monospace">
                                                        {adaptation.adaptation_id}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body1" fontWeight="medium">
                                                        {adaptation.model_component}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={adaptation.adaptation_type}
                                                        size="small"
                                                        color={getAdaptationTypeColor(adaptation.adaptation_type) as any}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center">
                                                        {getTrendIcon(adaptation.improvement_score)}
                                                        <Typography variant="body2" sx={{ ml: 1 }}>
                                                            {adaptation.improvement_score.toFixed(1)}%
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {adaptation.applied_at.toLocaleString()}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={adaptation.rollback_available ? '활성' : '고정'}
                                                        size="small"
                                                        color={adaptation.rollback_available ? 'success' : 'default'}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Box display="flex" gap={1}>
                                                        <Tooltip title="상세 보기">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => {
                                                                    setSelectedAdaptation(adaptation);
                                                                    setAdaptationDialogOpen(true);
                                                                }}
                                                            >
                                                                <Visibility />
                                                            </IconButton>
                                                        </Tooltip>
                                                        {adaptation.rollback_available && (
                                                            <Tooltip title="롤백">
                                                                <IconButton size="small" color="warning">
                                                                    <Undo />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Alert severity="info">
                                모델 적응 이력이 없습니다.
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    const renderPerformanceTrends = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>정확도 트렌드</Typography>
                        <Box textAlign="center">
                            <CircularProgress
                                variant="determinate"
                                value={89}
                                size={80}
                                thickness={4}
                            />
                            <Typography variant="h5" mt={1}>89%</Typography>
                            <Typography variant="body2" color="success.main">
                                +4.2% 개선
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>응답 시간 트렌드</Typography>
                        <Box textAlign="center">
                            <CircularProgress
                                variant="determinate"
                                value={75}
                                size={80}
                                thickness={4}
                                color="warning"
                            />
                            <Typography variant="h5" mt={1}>295ms</Typography>
                            <Typography variant="body2" color="success.main">
                                -25ms 개선
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>사용자 만족도</Typography>
                        <Box textAlign="center">
                            <CircularProgress
                                variant="determinate"
                                value={85}
                                size={80}
                                thickness={4}
                                color="success"
                            />
                            <Typography variant="h5" mt={1}>85%</Typography>
                            <Typography variant="body2" color="success.main">
                                +7.1% 개선
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    const renderLearningMetrics = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>상세 학습 메트릭</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <List>
                                    <ListItem>
                                        <ListItemIcon><School /></ListItemIcon>
                                        <ListItemText
                                            primary="총 학습 이벤트"
                                            secondary={`${learningMetrics?.total_learning_events.toLocaleString()} 개`}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon><CheckCircle /></ListItemIcon>
                                        <ListItemText
                                            primary="성공적 적응"
                                            secondary={`${learningMetrics?.successful_adaptations} 회`}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon><Error /></ListItemIcon>
                                        <ListItemText
                                            primary="실패한 적응"
                                            secondary={`${learningMetrics?.failed_adaptations} 회`}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon><TrendingUp /></ListItemIcon>
                                        <ListItemText
                                            primary="평균 개선율"
                                            secondary={`${learningMetrics?.average_improvement.toFixed(1)}%`}
                                        />
                                    </ListItem>
                                </List>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <List>
                                    <ListItem>
                                        <ListItemIcon><Speed /></ListItemIcon>
                                        <ListItemText
                                            primary="학습 속도"
                                            secondary={`${learningMetrics?.learning_velocity.toFixed(1)} 적응/시간`}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon><Assessment /></ListItemIcon>
                                        <ListItemText
                                            primary="모델 안정성"
                                            secondary={`${((learningMetrics?.model_stability || 0) * 100).toFixed(1)}%`}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon><Psychology /></ListItemIcon>
                                        <ListItemText
                                            primary="만족도 트렌드"
                                            secondary={`${learningMetrics?.user_satisfaction_trend.toFixed(1)}%`}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon><AutoFixHigh /></ListItemIcon>
                                        <ListItemText
                                            primary="적응 성공률"
                                            secondary={`${((learningMetrics?.adaptation_success_rate || 0) * 100).toFixed(1)}%`}
                                        />
                                    </ListItem>
                                </List>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    const renderSettings = () => (
        <Card>
            <CardContent>
                <Typography variant="h6" mb={2}>학습 시스템 설정</Typography>
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
                        <ListItemIcon><Psychology /></ListItemIcon>
                        <ListItemText
                            primary="자동 패턴 감지"
                            secondary="5분마다 학습 패턴 자동 분석"
                        />
                        <Switch defaultChecked />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><AutoFixHigh /></ListItemIcon>
                        <ListItemText
                            primary="자동 모델 적응"
                            secondary="10분마다 모델 자동 적응 실행"
                        />
                        <Switch defaultChecked />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><SmartToy /></ListItemIcon>
                        <ListItemText
                            primary="지능형 학습"
                            secondary="사용자 피드백 기반 실시간 학습"
                        />
                        <Switch defaultChecked />
                    </ListItem>
                </List>
            </CardContent>
        </Card>
    );

    const renderContent = () => {
        switch (selectedTab) {
            case 0: return renderLearningOverview();
            case 1: return renderDetectedPatterns();
            case 2: return renderModelAdaptations();
            case 3: return renderPerformanceTrends();
            case 4: return renderLearningMetrics();
            case 5: return renderSettings();
            default: return renderLearningOverview();
        }
    };

    return (
        <Box sx={{ p: 3, height: '100vh', overflow: 'auto' }}>
            {/* 헤더 */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                    <School sx={{ mr: 1, fontSize: 32 }} color="primary" />
                    <Typography variant="h4">실시간 학습 모니터링 대시보드</Typography>
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

            {/* 패턴 상세 다이얼로그 */}
            <Dialog
                open={patternDialogOpen}
                onClose={() => setPatternDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center">
                        <Psychology />
                        <Typography variant="h6" sx={{ ml: 1 }}>
                            학습 패턴 상세 정보
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedPattern && (
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="h6">{selectedPattern.description}</Typography>
                                <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                                    패턴 타입: {selectedPattern.pattern_type}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="textSecondary">신뢰도</Typography>
                                <Typography variant="h5">{(selectedPattern.confidence * 100).toFixed(0)}%</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="textSecondary">빈도</Typography>
                                <Typography variant="h5">{selectedPattern.frequency}회</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">패턴 데이터</Typography>
                                <pre style={{ fontSize: '12px', background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                                    {JSON.stringify(selectedPattern.pattern_data, null, 2)}
                                </pre>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPatternDialogOpen(false)}>닫기</Button>
                    <Button variant="contained" color="primary" startIcon={<AutoFixHigh />}>
                        모델 적응 실행
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 적응 상세 다이얼로그 */}
            <Dialog
                open={adaptationDialogOpen}
                onClose={() => setAdaptationDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center">
                        <AutoFixHigh />
                        <Typography variant="h6" sx={{ ml: 1 }}>
                            모델 적응 상세 정보
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedAdaptation && (
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="h6">적응 ID: {selectedAdaptation.adaptation_id}</Typography>
                                <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                                    컴포넌트: {selectedAdaptation.model_component}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">성능 변화</Typography>
                                <Grid container spacing={1}>
                                    <Grid item xs={4}>
                                        <Typography variant="body2">
                                            정확도: {(selectedAdaptation.performance_before.accuracy * 100).toFixed(1)}% → {(selectedAdaptation.performance_after.accuracy * 100).toFixed(1)}%
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography variant="body2">
                                            응답시간: {selectedAdaptation.performance_before.response_time}ms → {selectedAdaptation.performance_after.response_time}ms
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography variant="body2">
                                            만족도: {(selectedAdaptation.performance_before.user_satisfaction * 100).toFixed(1)}% → {(selectedAdaptation.performance_after.user_satisfaction * 100).toFixed(1)}%
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">적용된 변경사항</Typography>
                                <pre style={{ fontSize: '12px', background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                                    {JSON.stringify(selectedAdaptation.changes_made, null, 2)}
                                </pre>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAdaptationDialogOpen(false)}>닫기</Button>
                    {selectedAdaptation?.rollback_available && (
                        <Button variant="outlined" color="warning" startIcon={<Undo />}>
                            적응 롤백
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RealTimeLearningMonitoringDashboard;
