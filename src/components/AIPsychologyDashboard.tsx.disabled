import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Chip,
    LinearProgress,
    Avatar,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Tabs,
    Tab,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    AlertTitle,
    CircularProgress,
    Tooltip
} from '@mui/material';
import {
    Psychology as PsychologyIcon,
    SentimentSatisfied as HappyIcon,
    SentimentDissatisfied as SadIcon,
    SentimentVeryDissatisfied as AngryIcon,
    SentimentNeutral as NeutralIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    TrendingFlat as TrendingFlatIcon,
    Brain as BrainIcon,
    School as SchoolIcon,
    Stress as StressIcon,
    Person as PersonIcon,
    Refresh as RefreshIcon,
    Fullscreen as FullscreenIcon,
    FullscreenExit as FullscreenExitIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    EmojiEmotions as EmotionIcon,
    PsychologyAlt as CognitiveIcon,
    AutoAwesome as MotivationIcon,
    HealthAndSafety as StressIcon2,
    Face as PersonalityIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import advancedAIPsychologyEngine, {
    EmotionalState,
    CognitiveLoad,
    LearningMotivation,
    StressLevel,
    PersonalityInsights,
    AIPsychologyRecommendation
} from '../services/advancedAIPsychologyEngine';

interface AIPsychologyDashboardProps {
    userId: string;
    sessionId: string;
}

// 스타일드 컴포넌트
const DashboardContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
    minHeight: '100vh'
}));

const MetricCard = styled(Card)<{ $health?: string }>(({ theme, $health }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    border: `2px solid ${$health === 'excellent' ? theme.palette.success.main :
        $health === 'good' ? theme.palette.success.light :
            $health === 'fair' ? theme.palette.warning.main :
                $health === 'poor' ? theme.palette.error.light :
                    theme.palette.error.main
        }`,
    background: `linear-gradient(135deg, ${$health === 'excellent' ? theme.palette.success.main + '15' :
        $health === 'good' ? theme.palette.success.light + '15' :
            $health === 'fair' ? theme.palette.warning.main + '15' :
                $health === 'poor' ? theme.palette.error.light + '15' :
                    theme.palette.error.main + '15'
        }, ${theme.palette.background.paper})`
}));

const RecommendationCard = styled(Card)<{ $priority: string }>(({ theme, $priority }) => ({
    marginBottom: theme.spacing(2),
    border: `2px solid ${$priority === 'critical' ? theme.palette.error.main :
        $priority === 'high' ? theme.palette.error.light :
            $priority === 'medium' ? theme.palette.warning.main :
                theme.palette.info.main
        }`,
    background: `linear-gradient(135deg, ${$priority === 'critical' ? theme.palette.error.main + '20' :
        $priority === 'high' ? theme.palette.error.light + '20' :
            $priority === 'medium' ? theme.palette.warning.main + '20' :
                theme.palette.info.main + '20'
        }, ${theme.palette.background.paper})`
}));

const AIPsychologyDashboard: React.FC<AIPsychologyDashboardProps> = ({ userId, sessionId }) => {
    const [currentTab, setCurrentTab] = useState(0);
    const [psychologyData, setPsychologyData] = useState<any>(null);
    const [recommendations, setRecommendations] = useState<AIPsychologyRecommendation[]>([]);
    const [statistics, setStatistics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [fullscreen, setFullscreen] = useState(false);
    const [selectedRecommendation, setSelectedRecommendation] = useState<AIPsychologyRecommendation | null>(null);
    const [recommendationDialog, setRecommendationDialog] = useState(false);

    // 데이터 로드
    const loadData = async () => {
        try {
            setLoading(true);
            
            // 심리학 데이터 가져오기
            const userData = advancedAIPsychologyEngine.getUserPsychologyData(userId, sessionId);
            setPsychologyData(userData);
            
            // 권장사항 가져오기
            const userRecommendations = advancedAIPsychologyEngine.getPsychologyRecommendations(userId);
            setRecommendations(userRecommendations);
            
            // 통계 정보 가져오기
            const stats = advancedAIPsychologyEngine.getPsychologyStatistics();
            setStatistics(stats);
            
        } catch (error) {
            console.error('심리학 데이터 로드 오류:', error);
        } finally {
            setLoading(false);
        }
    };

    // 자동 새로고침
    useEffect(() => {
        loadData();
        
        const interval = setInterval(loadData, 10000); // 10초마다 새로고침
        
        return () => clearInterval(interval);
    }, [userId, sessionId]);

    // 감정 아이콘 가져오기
    const getEmotionIcon = (emotion: string) => {
        switch (emotion) {
            case 'joy': return <HappyIcon />;
            case 'sadness': return <SadIcon />;
            case 'anger': return <AngryIcon />;
            case 'fear': return <WarningIcon />;
            case 'surprise': return <InfoIcon />;
            case 'disgust': return <ErrorIcon />;
            default: return <NeutralIcon />;
        }
    };

    // 감정 색상 가져오기
    const getEmotionColor = (emotion: string) => {
        switch (emotion) {
            case 'joy': return 'success';
            case 'sadness': return 'info';
            case 'anger': return 'error';
            case 'fear': return 'warning';
            case 'surprise': return 'primary';
            case 'disgust': return 'error';
            default: return 'default';
        }
    };

    // 트렌드 아이콘 가져오기
    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'increasing': return <TrendingUpIcon color="success" />;
            case 'decreasing': return <TrendingDownIcon color="error" />;
            default: return <TrendingFlatIcon color="action" />;
        }
    };

    // 스트레스 레벨 색상 가져오기
    const getStressColor = (level: number) => {
        if (level <= 3) return 'success';
        if (level <= 6) return 'warning';
        return 'error';
    };

    // 인지 부하 색상 가져오기
    const getCognitiveLoadColor = (load: number) => {
        if (load <= 4) return 'success';
        if (load <= 7) return 'warning';
        return 'error';
    };

    // 동기 수준 색상 가져오기
    const getMotivationColor = (level: number) => {
        if (level >= 7) return 'success';
        if (level >= 4) return 'warning';
        return 'error';
    };

    // 탭 변경 핸들러
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    // 권장사항 상세 보기
    const handleRecommendationClick = (recommendation: AIPsychologyRecommendation) => {
        setSelectedRecommendation(recommendation);
        setRecommendationDialog(true);
    };

    if (loading) {
        return (
            <DashboardContainer>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <CircularProgress size={60} />
                    <Typography variant="h6" ml={2}>심리학 데이터를 분석 중...</Typography>
                </Box>
            </DashboardContainer>
        );
    }

    return (
        <DashboardContainer>
            {/* 헤더 */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <PsychologyIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="h4">AI 심리학 분석</Typography>
                        <Typography variant="body2" color="text.secondary">
                            실시간 감정 상태, 인지 부하, 학습 동기 분석
                        </Typography>
                    </Box>
                </Box>
                <Box>
                    <Tooltip title="새로고침">
                        <IconButton onClick={loadData}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={fullscreen ? "전체화면 종료" : "전체화면"}>
                        <IconButton onClick={() => setFullscreen(!fullscreen)}>
                            {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* 주요 메트릭 */}
            <Grid container spacing={3} mb={3}>
                {/* 감정 상태 */}
                <Grid item xs={12} md={3}>
                    <MetricCard $health={psychologyData?.emotional_state?.intensity > 7 ? 'poor' : 
                        psychologyData?.emotional_state?.intensity > 5 ? 'fair' : 'good'}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                                    <EmotionIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6">감정 상태</Typography>
                                    <Chip
                                        label={psychologyData?.emotional_state?.primary_emotion || 'neutral'}
                                        color={getEmotionColor(psychologyData?.emotional_state?.primary_emotion || 'neutral')}
                                        size="small"
                                    />
                                </Box>
                            </Box>
                            <Typography variant="h4" color="primary">
                                {psychologyData?.emotional_state?.intensity?.toFixed(1) || '5.0'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                강도: {psychologyData?.emotional_state?.intensity || 5}/10
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={(psychologyData?.emotional_state?.intensity || 5) * 10}
                                color={psychologyData?.emotional_state?.intensity > 7 ? 'error' : 
                                    psychologyData?.emotional_state?.intensity > 5 ? 'warning' : 'success'}
                                sx={{ mt: 1 }}
                            />
                        </CardContent>
                    </MetricCard>
                </Grid>

                {/* 인지 부하 */}
                <Grid item xs={12} md={3}>
                    <MetricCard $health={psychologyData?.cognitive_load?.overall_load > 8 ? 'poor' : 
                        psychologyData?.cognitive_load?.overall_load > 6 ? 'fair' : 'good'}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                                    <CognitiveIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6">인지 부하</Typography>
                                    <Chip
                                        label={psychologyData?.cognitive_load?.overall_load > 8 ? '높음' :
                                            psychologyData?.cognitive_load?.overall_load > 6 ? '보통' : '낮음'}
                                        color={getCognitiveLoadColor(psychologyData?.cognitive_load?.overall_load || 5)}
                                        size="small"
                                    />
                                </Box>
                            </Box>
                            <Typography variant="h4" color="secondary">
                                {psychologyData?.cognitive_load?.overall_load?.toFixed(1) || '5.0'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                전체 부하: {psychologyData?.cognitive_load?.overall_load || 5}/10
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={(psychologyData?.cognitive_load?.overall_load || 5) * 10}
                                color={getCognitiveLoadColor(psychologyData?.cognitive_load?.overall_load || 5)}
                                sx={{ mt: 1 }}
                            />
                        </CardContent>
                    </MetricCard>
                </Grid>

                {/* 학습 동기 */}
                <Grid item xs={12} md={3}>
                    <MetricCard $health={psychologyData?.learning_motivation?.motivation_level > 7 ? 'good' : 
                        psychologyData?.learning_motivation?.motivation_level > 4 ? 'fair' : 'poor'}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                                    <MotivationIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6">학습 동기</Typography>
                                    <Box display="flex" alignItems="center">
                                        <Chip
                                            label={psychologyData?.learning_motivation?.motivation_type || 'mixed'}
                                            color="primary"
                                            size="small"
                                            sx={{ mr: 1 }}
                                        />
                                        {getTrendIcon(psychologyData?.learning_motivation?.trend || 'stable')}
                                    </Box>
                                </Box>
                            </Box>
                            <Typography variant="h4" color="success.main">
                                {psychologyData?.learning_motivation?.motivation_level?.toFixed(1) || '5.0'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                동기 수준: {psychologyData?.learning_motivation?.motivation_level || 5}/10
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={(psychologyData?.learning_motivation?.motivation_level || 5) * 10}
                                color={getMotivationColor(psychologyData?.learning_motivation?.motivation_level || 5)}
                                sx={{ mt: 1 }}
                            />
                        </CardContent>
                    </MetricCard>
                </Grid>

                {/* 스트레스 레벨 */}
                <Grid item xs={12} md={3}>
                    <MetricCard $health={psychologyData?.stress_level?.stress_level > 7 ? 'poor' : 
                        psychologyData?.stress_level?.stress_level > 4 ? 'fair' : 'good'}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                                    <StressIcon2 />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6">스트레스</Typography>
                                    <Chip
                                        label={psychologyData?.stress_level?.stress_type || 'none'}
                                        color={getStressColor(psychologyData?.stress_level?.stress_level || 3)}
                                        size="small"
                                    />
                                </Box>
                            </Box>
                            <Typography variant="h4" color="warning.main">
                                {psychologyData?.stress_level?.stress_level?.toFixed(1) || '3.0'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                스트레스: {psychologyData?.stress_level?.stress_level || 3}/10
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={(psychologyData?.stress_level?.stress_level || 3) * 10}
                                color={getStressColor(psychologyData?.stress_level?.stress_level || 3)}
                                sx={{ mt: 1 }}
                            />
                        </CardContent>
                    </MetricCard>
                </Grid>
            </Grid>

            {/* 탭 네비게이션 */}
            <Paper sx={{ mb: 3 }}>
                <Tabs value={currentTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                    <Tab label="감정 분석" icon={<EmotionIcon />} />
                    <Tab label="인지 부하" icon={<CognitiveIcon />} />
                    <Tab label="학습 동기" icon={<MotivationIcon />} />
                    <Tab label="스트레스 관리" icon={<StressIcon2 />} />
                    <Tab label="성격 인사이트" icon={<PersonalityIcon />} />
                    <Tab label="권장사항" icon={<CheckCircleIcon />} />
                </Tabs>
            </Paper>

            {/* 탭 콘텐츠 */}
            <Box>
                {/* 감정 분석 탭 */}
                {currentTab === 0 && psychologyData?.emotional_state && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" mb={2}>감정 상태 상세</Typography>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                                            {getEmotionIcon(psychologyData.emotional_state.primary_emotion)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle1">
                                                주요 감정: {psychologyData.emotional_state.primary_emotion}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                신뢰도: {Math.round(psychologyData.emotional_state.confidence * 100)}%
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">강도</Typography>
                                            <Typography variant="h6">{psychologyData.emotional_state.intensity}/10</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">가치감</Typography>
                                            <Typography variant="h6">{psychologyData.emotional_state.valence}/5</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">각성도</Typography>
                                            <Typography variant="h6">{psychologyData.emotional_state.arousal}/10</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">지속시간</Typography>
                                            <Typography variant="h6">{Math.round(psychologyData.emotional_state.duration)}초</Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" mb={2}>감정 트리거</Typography>
                                    {psychologyData.emotional_state.triggers.length > 0 ? (
                                        <List dense>
                                            {psychologyData.emotional_state.triggers.map((trigger: string, index: number) => (
                                                <ListItem key={index}>
                                                    <ListItemIcon>
                                                        <InfoIcon color="primary" />
                                                    </ListItemIcon>
                                                    <ListItemText primary={trigger} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            감지된 트리거가 없습니다.
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {/* 인지 부하 탭 */}
                {currentTab === 1 && psychologyData?.cognitive_load && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" mb={2}>인지 부하 구성 요소</Typography>
                                    <Box mb={2}>
                                        <Typography variant="body2">내재적 부하 (작업 복잡성)</Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={psychologyData.cognitive_load.components.intrinsic_load * 10}
                                            color="primary"
                                            sx={{ height: 8, borderRadius: 4, mb: 1 }}
                                        />
                                        <Typography variant="body2" color="text.secondary">
                                            {psychologyData.cognitive_load.components.intrinsic_load}/10
                                        </Typography>
                                    </Box>
                                    <Box mb={2}>
                                        <Typography variant="body2">외재적 부하 (불필요한 정보)</Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={psychologyData.cognitive_load.components.extraneous_load * 10}
                                            color="warning"
                                            sx={{ height: 8, borderRadius: 4, mb: 1 }}
                                        />
                                        <Typography variant="body2" color="text.secondary">
                                            {psychologyData.cognitive_load.components.extraneous_load}/10
                                        </Typography>
                                    </Box>
                                    <Box mb={2}>
                                        <Typography variant="body2">관련 부하 (학습에 도움이 되는 정보)</Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={psychologyData.cognitive_load.components.germane_load * 10}
                                            color="success"
                                            sx={{ height: 8, borderRadius: 4, mb: 1 }}
                                        />
                                        <Typography variant="body2" color="text.secondary">
                                            {psychologyData.cognitive_load.components.germane_load}/10
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" mb={2}>인지 부하 지표</Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">응답 시간 가변성</Typography>
                                            <Typography variant="h6">
                                                {psychologyData.cognitive_load.indicators.response_time_variability.toFixed(1)}ms
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">오류 빈도</Typography>
                                            <Typography variant="h6">
                                                {psychologyData.cognitive_load.indicators.error_frequency}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">반복 요청</Typography>
                                            <Typography variant="h6">
                                                {psychologyData.cognitive_load.indicators.repetition_requests}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">주제 전환</Typography>
                                            <Typography variant="h6">
                                                {psychologyData.cognitive_load.indicators.topic_switching}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">좌절 신호</Typography>
                                            <Typography variant="h6">
                                                {psychologyData.cognitive_load.indicators.frustration_signals}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                        {psychologyData.cognitive_load.recommendations.length > 0 && (
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" mb={2}>인지 부하 권장사항</Typography>
                                        <List>
                                            {psychologyData.cognitive_load.recommendations.map((rec: string, index: number) => (
                                                <ListItem key={index}>
                                                    <ListItemIcon>
                                                        <CheckCircleIcon color="primary" />
                                                    </ListItemIcon>
                                                    <ListItemText primary={rec} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}
                    </Grid>
                )}

                {/* 학습 동기 탭 */}
                {currentTab === 2 && psychologyData?.learning_motivation && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" mb={2}>동기 요인 분석</Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">호기심</Typography>
                                            <LinearProgress
                                                variant="determinate"
                                                value={psychologyData.learning_motivation.factors.curiosity * 10}
                                                color="primary"
                                                sx={{ height: 8, borderRadius: 4, mb: 1 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                {psychologyData.learning_motivation.factors.curiosity}/10
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">숙달 목표</Typography>
                                            <LinearProgress
                                                variant="determinate"
                                                value={psychologyData.learning_motivation.factors.mastery_goal * 10}
                                                color="success"
                                                sx={{ height: 8, borderRadius: 4, mb: 1 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                {psychologyData.learning_motivation.factors.mastery_goal}/10
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">성과 목표</Typography>
                                            <LinearProgress
                                                variant="determinate"
                                                value={psychologyData.learning_motivation.factors.performance_goal * 10}
                                                color="warning"
                                                sx={{ height: 8, borderRadius: 4, mb: 1 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                {psychologyData.learning_motivation.factors.performance_goal}/10
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">자기 효능감</Typography>
                                            <LinearProgress
                                                variant="determinate"
                                                value={psychologyData.learning_motivation.factors.self_efficacy * 10}
                                                color="info"
                                                sx={{ height: 8, borderRadius: 4, mb: 1 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                {psychologyData.learning_motivation.factors.self_efficacy}/10
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" mb={2}>동기 장벽 및 강화 요소</Typography>
                                    <Box mb={2}>
                                        <Typography variant="subtitle2" color="error">장벽</Typography>
                                        {psychologyData.learning_motivation.barriers.length > 0 ? (
                                            <List dense>
                                                {psychologyData.learning_motivation.barriers.map((barrier: string, index: number) => (
                                                    <ListItem key={index}>
                                                        <ListItemIcon>
                                                            <ErrorIcon color="error" />
                                                        </ListItemIcon>
                                                        <ListItemText primary={barrier} />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                감지된 장벽이 없습니다.
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="success">강화 요소</Typography>
                                        {psychologyData.learning_motivation.enhancers.length > 0 ? (
                                            <List dense>
                                                {psychologyData.learning_motivation.enhancers.map((enhancer: string, index: number) => (
                                                    <ListItem key={index}>
                                                        <ListItemIcon>
                                                            <CheckCircleIcon color="success" />
                                                        </ListItemIcon>
                                                        <ListItemText primary={enhancer} />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                감지된 강화 요소가 없습니다.
                                            </Typography>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {/* 스트레스 관리 탭 */}
                {currentTab === 3 && psychologyData?.stress_level && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" mb={2}>스트레스 지표</Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">빠른 타이핑</Typography>
                                            <Chip
                                                label={psychologyData.stress_level.indicators.rapid_typing ? '감지됨' : '없음'}
                                                color={psychologyData.stress_level.indicators.rapid_typing ? 'error' : 'default'}
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">짧은 응답</Typography>
                                            <Chip
                                                label={psychologyData.stress_level.indicators.short_responses ? '감지됨' : '없음'}
                                                color={psychologyData.stress_level.indicators.short_responses ? 'error' : 'default'}
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">주제 회피</Typography>
                                            <Chip
                                                label={psychologyData.stress_level.indicators.topic_avoidance ? '감지됨' : '없음'}
                                                color={psychologyData.stress_level.indicators.topic_avoidance ? 'error' : 'default'}
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">반복 질문</Typography>
                                            <Chip
                                                label={psychologyData.stress_level.indicators.repeated_questions ? '감지됨' : '없음'}
                                                color={psychologyData.stress_level.indicators.repeated_questions ? 'error' : 'default'}
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">부정적 언어</Typography>
                                            <Chip
                                                label={psychologyData.stress_level.indicators.negative_language ? '감지됨' : '없음'}
                                                color={psychologyData.stress_level.indicators.negative_language ? 'error' : 'default'}
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">시간 압박</Typography>
                                            <Chip
                                                label={psychologyData.stress_level.indicators.time_pressure ? '감지됨' : '없음'}
                                                color={psychologyData.stress_level.indicators.time_pressure ? 'error' : 'default'}
                                                size="small"
                                            />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" mb={2}>대처 전략</Typography>
                                    {psychologyData.stress_level.coping_strategies.length > 0 ? (
                                        <List>
                                            {psychologyData.stress_level.coping_strategies.map((strategy: string, index: number) => (
                                                <ListItem key={index}>
                                                    <ListItemIcon>
                                                        <CheckCircleIcon color="primary" />
                                                    </ListItemIcon>
                                                    <ListItemText primary={strategy} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            현재 스트레스 수준이 낮아 대처 전략이 필요하지 않습니다.
                                        </Typography>
                                    )}
                                    {psychologyData.stress_level.intervention_needed && (
                                        <Alert severity="warning" sx={{ mt: 2 }}>
                                            <AlertTitle>개입 필요</AlertTitle>
                                            스트레스 수준이 높아 즉시 개입이 필요합니다.
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {/* 성격 인사이트 탭 */}
                {currentTab === 4 && psychologyData?.personality_insights && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" mb={2}>학습 및 의사소통 스타일</Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">학습 스타일</Typography>
                                            <Chip
                                                label={psychologyData.personality_insights.learning_style}
                                                color="primary"
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">의사소통 선호도</Typography>
                                            <Chip
                                                label={psychologyData.personality_insights.communication_preference}
                                                color="secondary"
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">의사결정 스타일</Typography>
                                            <Chip
                                                label={psychologyData.personality_insights.decision_making_style}
                                                color="info"
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">위험 감수 성향</Typography>
                                            <Chip
                                                label={psychologyData.personality_insights.risk_tolerance}
                                                color="warning"
                                                size="small"
                                            />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" mb={2}>성격 특성</Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">신뢰도</Typography>
                                            <LinearProgress
                                                variant="determinate"
                                                value={psychologyData.personality_insights.confidence_level * 10}
                                                color="primary"
                                                sx={{ height: 8, borderRadius: 4, mb: 1 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                {psychologyData.personality_insights.confidence_level}/10
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">적응성</Typography>
                                            <LinearProgress
                                                variant="determinate"
                                                value={psychologyData.personality_insights.adaptability * 10}
                                                color="success"
                                                sx={{ height: 8, borderRadius: 4, mb: 1 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                {psychologyData.personality_insights.adaptability}/10
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">지속성</Typography>
                                            <LinearProgress
                                                variant="determinate"
                                                value={psychologyData.personality_insights.persistence * 10}
                                                color="warning"
                                                sx={{ height: 8, borderRadius: 4, mb: 1 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                {psychologyData.personality_insights.persistence}/10
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {/* 권장사항 탭 */}
                {currentTab === 5 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            {recommendations.length > 0 ? (
                                recommendations.map((recommendation) => (
                                    <RecommendationCard key={recommendation.recommendation_id} $priority={recommendation.priority}>
                                        <CardContent>
                                            <Box display="flex" alignItems="center" mb={2}>
                                                <Avatar sx={{
                                                    bgcolor: recommendation.priority === 'critical' ? 'error.main' :
                                                        recommendation.priority === 'high' ? 'error.light' :
                                                            recommendation.priority === 'medium' ? 'warning.main' : 'info.main',
                                                    width: 40, height: 40, mr: 2
                                                }}>
                                                    <CheckCircleIcon />
                                                </Avatar>
                                                <Box flex={1}>
                                                    <Typography variant="subtitle1">{recommendation.title}</Typography>
                                                    <Chip
                                                        label={recommendation.priority}
                                                        size="small"
                                                        color={recommendation.priority === 'critical' ? 'error' :
                                                            recommendation.priority === 'high' ? 'error' :
                                                                recommendation.priority === 'medium' ? 'warning' : 'default'}
                                                    />
                                                </Box>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRecommendationClick(recommendation)}
                                                >
                                                    <InfoIcon />
                                                </IconButton>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" mb={2}>
                                                {recommendation.description}
                                            </Typography>
                                            <Box display="flex" gap={1} flexWrap="wrap">
                                                {recommendation.action_items.slice(0, 3).map((action, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={action}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                ))}
                                            </Box>
                                        </CardContent>
                                    </RecommendationCard>
                                ))
                            ) : (
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" textAlign="center" color="text.secondary">
                                            현재 권장사항이 없습니다.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            )}
                        </Grid>
                    </Grid>
                )}
            </Box>

            {/* 권장사항 상세 다이얼로그 */}
            <Dialog open={recommendationDialog} onClose={() => setRecommendationDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <AlertTitle severity={selectedRecommendation?.priority === 'critical' ? 'error' :
                        selectedRecommendation?.priority === 'high' ? 'warning' : 'info'}>
                        {selectedRecommendation?.title}
                    </AlertTitle>
                </DialogTitle>
                <DialogContent>
                    {selectedRecommendation && (
                        <>
                            <Typography variant="body1" mb={2}>
                                {selectedRecommendation.description}
                            </Typography>
                            <Typography variant="h6" mb={1}>실행 항목</Typography>
                            <List dense>
                                {selectedRecommendation.action_items.map((action, index) => (
                                    <ListItem key={index}>
                                        <ListItemIcon>
                                            <CheckCircleIcon color="primary" />
                                        </ListItemIcon>
                                        <ListItemText primary={action} />
                                    </ListItem>
                                ))}
                            </List>
                            <Typography variant="h6" mb={1}>예상 영향</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2">감정적 안녕</Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={selectedRecommendation.expected_impact.emotional_wellbeing * 100}
                                        color="primary"
                                        sx={{ height: 8, borderRadius: 4 }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">학습 효과성</Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={selectedRecommendation.expected_impact.learning_effectiveness * 100}
                                        color="success"
                                        sx={{ height: 8, borderRadius: 4 }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">참여도</Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={selectedRecommendation.expected_impact.engagement * 100}
                                        color="warning"
                                        sx={{ height: 8, borderRadius: 4 }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">만족도</Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={selectedRecommendation.expected_impact.satisfaction * 100}
                                        color="info"
                                        sx={{ height: 8, borderRadius: 4 }}
                                    />
                                </Grid>
                            </Grid>
                            <Typography variant="h6" mb={1} mt={2}>구현 전략</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {selectedRecommendation.implementation_strategy}
                            </Typography>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRecommendationDialog(false)}>닫기</Button>
                </DialogActions>
            </Dialog>
        </DashboardContainer>
    );
};

export default AIPsychologyDashboard;
