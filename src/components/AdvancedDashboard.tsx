import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    LinearProgress,
    Chip,
    Avatar,
    IconButton,
    Button,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    ListItemSecondaryAction,
    Badge,
    Tooltip,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Slider,
    Switch,
    FormControlLabel
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    School as SchoolIcon,
    Psychology as PsychologyIcon,
    Memory as MemoryIcon,
    Assessment as AssessmentIcon,
    Timeline as TimelineIcon,
    BarChart as BarChartIcon,
    PieChart as PieChartIcon,
    Speed as SpeedIcon,
    Target as TargetIcon,
    Star as StarIcon,
    EmojiEvents as TrophyIcon,
    Lightbulb as LightbulbIcon,
    Bookmark as BookmarkIcon,
    Refresh as RefreshIcon,
    Settings as SettingsIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    CalendarToday as CalendarIcon,
    AccessTime as TimeIcon,
    Person as PersonIcon,
    AutoAwesome as AutoAwesomeIcon,
    TrendingDown as TrendingDownIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    PlayArrow as PlayIcon,
    Pause as PauseIcon,
    Stop as StopIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    FilterList as FilterIcon,
    Search as SearchIcon,
    Download as DownloadIcon,
    Share as ShareIcon,
    Print as PrintIcon,
    Fullscreen as FullscreenIcon,
    FullscreenExit as FullscreenExitIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import advancedConversationMemoryService from '../services/advancedConversationMemoryService';
import personalizedLearningExperienceService from '../services/personalizedLearningExperienceService';

// 고급 대시보드 스타일
const DashboardContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    minHeight: '100vh'
}));

const DashboardHeader = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: theme.spacing(2),
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
}));

const MetricCard = styled(Card)(({ theme }) => ({
    height: '100%',
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
    }
}));

const ProgressCard = styled(Card)(({ theme }) => ({
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: theme.spacing(2)
}));

const InsightCard = styled(Card)(({ theme }) => ({
    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    borderRadius: theme.spacing(2),
    border: '1px solid rgba(255, 255, 255, 0.3)'
}));

const ActivityCard = styled(Card)(({ theme }) => ({
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: theme.spacing(2),
    maxHeight: '400px',
    overflow: 'auto'
}));

// 인터페이스 정의
interface DashboardData {
    userProfile: any;
    learningProgress: any;
    conversationStats: any;
    performanceMetrics: any;
    recentActivities: any[];
    insights: any[];
    goals: any[];
    recommendations: any[];
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => (
    <div
        role="tabpanel"
        hidden={value !== index}
        id={`dashboard-tabpanel-${index}`}
        aria-labelledby={`dashboard-tab-${index}`}
        {...other}
    >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
);

interface AdvancedDashboardProps {
    userId?: string;
    sessionId?: string;
}

const AdvancedDashboard: React.FC<AdvancedDashboardProps> = ({
    userId = 'user-1',
    sessionId = 'session-1'
}) => {
    // 상태 관리
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tabValue, setTabValue] = useState(0);
    const [refreshInterval, setRefreshInterval] = useState(30000); // 30초
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [fullscreen, setFullscreen] = useState(false);
    const [settingsDialog, setSettingsDialog] = useState(false);

    // 데이터 로드
    useEffect(() => {
        loadDashboardData();

        if (autoRefresh) {
            const interval = setInterval(loadDashboardData, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [userId, sessionId, autoRefresh, refreshInterval]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // 병렬로 모든 데이터 로드
            const [
                memory,
                learningExperience,
                globalStats
            ] = await Promise.all([
                advancedConversationMemoryService.getUserMemory(userId, sessionId),
                personalizedLearningExperienceService.getLearningExperience(userId, sessionId),
                advancedConversationMemoryService.getGlobalStats()
            ]);

            // 대시보드 데이터 구성
            const data: DashboardData = {
                userProfile: memory.user_profile,
                learningProgress: learningExperience,
                conversationStats: memory.interaction_stats,
                performanceMetrics: {
                    averageResponseTime: memory.interaction_stats.average_response_time,
                    satisfactionScore: memory.interaction_stats.average_satisfaction,
                    engagementLevel: memory.interaction_stats.engagement_level,
                    learningEfficiency: calculateLearningEfficiency(learningExperience, memory)
                },
                recentActivities: generateRecentActivities(memory, learningExperience),
                insights: generateInsights(memory, learningExperience),
                goals: generateGoals(learningExperience),
                recommendations: generateRecommendations(memory, learningExperience)
            };

            setDashboardData(data);
        } catch (err) {
            console.error('Dashboard data loading error:', err);
            setError('대시보드 데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 학습 효율성 계산
    const calculateLearningEfficiency = (learningExperience: any, memory: any): number => {
        const progress = learningExperience?.current_learning_path?.completion_percentage || 0;
        const satisfaction = memory.interaction_stats.average_satisfaction || 3;
        const engagement = memory.interaction_stats.engagement_level || 'medium';

        const engagementScore = engagement === 'high' ? 1 : engagement === 'medium' ? 0.7 : 0.4;

        return Math.round((progress * 0.4 + satisfaction * 20 + engagementScore * 100 * 0.4));
    };

    // 최근 활동 생성
    const generateRecentActivities = (memory: any, learningExperience: any): any[] => {
        const activities: any[] = [];

        // 최근 대화 활동
        const recentConversations = memory.conversation_history.slice(-5);
        recentConversations.forEach((entry: any, index: number) => {
            activities.push({
                id: `conv-${index}`,
                type: 'conversation',
                title: 'AI와 대화',
                description: entry.user_input.substring(0, 50) + '...',
                timestamp: new Date(entry.timestamp),
                icon: <PsychologyIcon />,
                color: '#667eea'
            });
        });

        // 학습 진행 활동
        if (learningExperience?.current_learning_path) {
            activities.push({
                id: 'learning-progress',
                type: 'learning',
                title: '학습 진행',
                description: `${learningExperience.current_learning_path.path_name} - ${learningExperience.current_learning_path.completion_percentage}% 완료`,
                timestamp: new Date(),
                icon: <SchoolIcon />,
                color: '#74b9ff'
            });
        }

        return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    };

    // 인사이트 생성
    const generateInsights = (memory: any, learningExperience: any): any[] => {
        const insights: any[] = [];

        // 학습 패턴 인사이트
        const learningPatterns = memory.learning_patterns;
        if (learningPatterns && learningPatterns.length > 0) {
            const topPattern = learningPatterns.sort((a: any, b: any) => b.frequency - a.frequency)[0];
            insights.push({
                id: 'learning-pattern',
                type: 'pattern',
                title: '학습 패턴 발견',
                description: `가장 자주 사용하는 학습 방식: ${topPattern.pattern_type}`,
                icon: <LightbulbIcon />,
                color: '#fd79a8',
                priority: 'high'
            });
        }

        // 성과 인사이트
        const satisfaction = memory.interaction_stats.average_satisfaction;
        if (satisfaction > 4) {
            insights.push({
                id: 'high-satisfaction',
                type: 'performance',
                title: '높은 만족도',
                description: '평균 만족도가 4점을 넘어서고 있습니다!',
                icon: <StarIcon />,
                color: '#fdcb6e',
                priority: 'medium'
            });
        }

        // 학습 목표 인사이트
        if (learningExperience?.learning_goals) {
            const completedGoals = learningExperience.learning_goals.filter((goal: any) => goal.status === 'completed');
            if (completedGoals.length > 0) {
                insights.push({
                    id: 'goal-completion',
                    type: 'achievement',
                    title: '목표 달성',
                    description: `${completedGoals.length}개의 학습 목표를 달성했습니다!`,
                    icon: <TrophyIcon />,
                    color: '#00b894',
                    priority: 'high'
                });
            }
        }

        return insights;
    };

    // 목표 생성
    const generateGoals = (learningExperience: any): any[] => {
        const goals: any[] = [];

        if (learningExperience?.learning_goals) {
            learningExperience.learning_goals.forEach((goal: any) => {
                goals.push({
                    id: goal.goal_id,
                    title: goal.title,
                    description: goal.description,
                    target_date: new Date(goal.target_date),
                    progress: goal.progress || 0,
                    status: goal.status,
                    priority: goal.priority
                });
            });
        }

        // 기본 목표 추가
        if (goals.length === 0) {
            goals.push({
                id: 'default-goal-1',
                title: '기본 개념 마스터',
                description: '웹 개발의 기본 개념들을 완전히 이해하기',
                target_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1주일 후
                progress: 0,
                status: 'in_progress',
                priority: 'high'
            });
        }

        return goals;
    };

    // 추천사항 생성
    const generateRecommendations = (memory: any, learningExperience: any): any[] => {
        const recommendations: any[] = [];

        // 학습 스타일 기반 추천
        const userProfile = memory.user_profile;
        if (userProfile.learning_style === 'visual') {
            recommendations.push({
                id: 'visual-learning',
                type: 'learning_style',
                title: '시각적 학습 강화',
                description: '다이어그램과 차트를 활용한 학습을 추천합니다.',
                icon: <BarChartIcon />,
                priority: 'medium'
            });
        }

        // 성과 기반 추천
        const satisfaction = memory.interaction_stats.average_satisfaction;
        if (satisfaction < 3) {
            recommendations.push({
                id: 'improve-satisfaction',
                type: 'performance',
                title: '만족도 개선',
                description: '더 자세한 설명이나 예시를 요청해보세요.',
                icon: <InfoIcon />,
                priority: 'high'
            });
        }

        // 학습 진행 기반 추천
        if (learningExperience?.current_learning_path) {
            const progress = learningExperience.current_learning_path.completion_percentage;
            if (progress > 80) {
                recommendations.push({
                    id: 'next-level',
                    type: 'progression',
                    title: '다음 단계 준비',
                    description: '현재 과정을 완료하고 고급 과정으로 넘어갈 준비가 되었습니다.',
                    icon: <TrendingUpIcon />,
                    priority: 'medium'
                });
            }
        }

        return recommendations;
    };

    // 탭 변경 핸들러
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    // 메트릭 카드 렌더링
    const renderMetricCard = (title: string, value: string | number, subtitle: string, icon: React.ReactNode, color: string, trend?: number) => (
        <MetricCard>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" color={color}>
                            {value}
                        </Typography>
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {subtitle}
                        </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
                        {icon}
                    </Avatar>
                </Box>

                {trend !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {trend > 0 ? (
                            <TrendingUpIcon color="success" fontSize="small" />
                        ) : (
                            <TrendingDownIcon color="error" fontSize="small" />
                        )}
                        <Typography variant="caption" color={trend > 0 ? 'success.main' : 'error.main'}>
                            {Math.abs(trend)}% {trend > 0 ? '증가' : '감소'}
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </MetricCard>
    );

    // 진행률 카드 렌더링
    const renderProgressCard = (title: string, progress: number, target: number, description: string) => (
        <ProgressCard>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {title}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                        진행률
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                        {progress}% / {target}%
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={(progress / target) * 100}
                    sx={{ height: 8, borderRadius: 4, mb: 2 }}
                />
                <Typography variant="body2" color="textSecondary">
                    {description}
                </Typography>
            </CardContent>
        </ProgressCard>
    );

    // 인사이트 카드 렌더링
    const renderInsightCard = (insight: any) => (
        <InsightCard key={insight.id}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: insight.color, width: 40, height: 40 }}>
                        {insight.icon}
                    </Avatar>
                    <Box>
                        <Typography variant="h6" fontWeight="bold">
                            {insight.title}
                        </Typography>
                        <Chip
                            label={insight.priority}
                            size="small"
                            color={insight.priority === 'high' ? 'error' : 'primary'}
                        />
                    </Box>
                </Box>
                <Typography variant="body2" color="textSecondary">
                    {insight.description}
                </Typography>
            </CardContent>
        </InsightCard>
    );

    if (loading) {
        return (
            <DashboardContainer>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress size={60} />
                </Box>
            </DashboardContainer>
        );
    }

    if (error) {
        return (
            <DashboardContainer>
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
                <Button variant="contained" onClick={loadDashboardData}>
                    다시 시도
                </Button>
            </DashboardContainer>
        );
    }

    if (!dashboardData) {
        return (
            <DashboardContainer>
                <Alert severity="info">
                    대시보드 데이터를 불러올 수 없습니다.
                </Alert>
            </DashboardContainer>
        );
    }

    return (
        <DashboardContainer>
            {/* 헤더 */}
            <DashboardHeader>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            CORBU AI 대시보드
                        </Typography>
                        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                            {dashboardData.userProfile.name || '사용자'}님의 학습 현황
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="새로고침">
                            <IconButton onClick={loadDashboardData} sx={{ color: 'white' }}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="설정">
                            <IconButton onClick={() => setSettingsDialog(true)} sx={{ color: 'white' }}>
                                <SettingsIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={fullscreen ? '전체화면 해제' : '전체화면'}>
                            <IconButton onClick={() => setFullscreen(!fullscreen)} sx={{ color: 'white' }}>
                                {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </DashboardHeader>

            {/* 메트릭 카드들 */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    {renderMetricCard(
                        '학습 진행률',
                        `${dashboardData.learningProgress?.current_learning_path?.completion_percentage || 0}%`,
                        '현재 학습 경로',
                        <SchoolIcon />,
                        '#667eea'
                    )}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    {renderMetricCard(
                        '만족도',
                        `${dashboardData.conversationStats.average_satisfaction?.toFixed(1) || 0}/5`,
                        '평균 만족도',
                        <StarIcon />,
                        '#fdcb6e'
                    )}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    {renderMetricCard(
                        '학습 효율성',
                        `${dashboardData.performanceMetrics.learningEfficiency}%`,
                        '종합 성과 지수',
                        <SpeedIcon />,
                        '#00b894'
                    )}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    {renderMetricCard(
                        '총 대화 수',
                        dashboardData.conversationStats.total_messages || 0,
                        '누적 대화',
                        <PsychologyIcon />,
                        '#fd79a8'
                    )}
                </Grid>
            </Grid>

            {/* 탭 네비게이션 */}
            <Paper sx={{ mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                    <Tab label="개요" />
                    <Tab label="학습 진행" />
                    <Tab label="성과 분석" />
                    <Tab label="활동 내역" />
                    <Tab label="인사이트" />
                </Tabs>
            </Paper>

            {/* 탭 콘텐츠 */}
            <TabPanel value={tabValue} index={0}>
                {/* 개요 탭 */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <ProgressCard>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    현재 학습 경로
                                </Typography>
                                {dashboardData.learningProgress?.current_learning_path ? (
                                    <Box>
                                        <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
                                            {dashboardData.learningProgress.current_learning_path.path_name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Typography variant="body2" color="textSecondary">
                                                진행률
                                            </Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                                {dashboardData.learningProgress.current_learning_path.completion_percentage}%
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={dashboardData.learningProgress.current_learning_path.completion_percentage}
                                            sx={{ height: 10, borderRadius: 5, mb: 2 }}
                                        />
                                        <Typography variant="body2" color="textSecondary">
                                            {dashboardData.learningProgress.current_learning_path.description}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="textSecondary">
                                        현재 진행 중인 학습 경로가 없습니다.
                                    </Typography>
                                )}
                            </CardContent>
                        </ProgressCard>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <ActivityCard>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    최근 활동
                                </Typography>
                                <List dense>
                                    {dashboardData.recentActivities.slice(0, 5).map((activity) => (
                                        <ListItem key={activity.id}>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: activity.color, width: 32, height: 32 }}>
                                                    {activity.icon}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={activity.title}
                                                secondary={
                                                    <Box>
                                                        <Typography variant="caption" display="block">
                                                            {activity.description}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {activity.timestamp.toLocaleString()}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </ActivityCard>
                    </Grid>
                </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                {/* 학습 진행 탭 */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <ProgressCard>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    학습 목표
                                </Typography>
                                <List>
                                    {dashboardData.goals.map((goal) => (
                                        <ListItem key={goal.id}>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: goal.status === 'completed' ? 'success.main' : 'primary.main' }}>
                                                    {goal.status === 'completed' ? <CheckCircleIcon /> : <TargetIcon />}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={goal.title}
                                                secondary={
                                                    <Box>
                                                        <Typography variant="body2" color="textSecondary">
                                                            {goal.description}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={goal.progress}
                                                                sx={{ flex: 1, height: 6 }}
                                                            />
                                                            <Typography variant="caption">
                                                                {goal.progress}%
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                }
                                            />
                                            <ListItemSecondaryAction>
                                                <Chip
                                                    label={goal.priority}
                                                    size="small"
                                                    color={goal.priority === 'high' ? 'error' : 'primary'}
                                                />
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </ProgressCard>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <ProgressCard>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    학습 추천사항
                                </Typography>
                                <List>
                                    {dashboardData.recommendations.map((rec) => (
                                        <ListItem key={rec.id}>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: rec.priority === 'high' ? 'error.main' : 'primary.main' }}>
                                                    {rec.icon}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={rec.title}
                                                secondary={rec.description}
                                            />
                                            <ListItemSecondaryAction>
                                                <Chip
                                                    label={rec.priority}
                                                    size="small"
                                                    color={rec.priority === 'high' ? 'error' : 'primary'}
                                                />
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </ProgressCard>
                    </Grid>
                </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
                {/* 성과 분석 탭 */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <ProgressCard>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    성과 지표
                                </Typography>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>지표</TableCell>
                                                <TableCell align="right">값</TableCell>
                                                <TableCell align="right">상태</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell>평균 응답 시간</TableCell>
                                                <TableCell align="right">
                                                    {dashboardData.performanceMetrics.averageResponseTime?.toFixed(2) || 0}초
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Chip
                                                        label="양호"
                                                        size="small"
                                                        color="success"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>평균 만족도</TableCell>
                                                <TableCell align="right">
                                                    {dashboardData.performanceMetrics.satisfactionScore?.toFixed(1) || 0}/5
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Chip
                                                        label="좋음"
                                                        size="small"
                                                        color="success"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>참여도</TableCell>
                                                <TableCell align="right">
                                                    {dashboardData.performanceMetrics.engagementLevel}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Chip
                                                        label="높음"
                                                        size="small"
                                                        color="success"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>학습 효율성</TableCell>
                                                <TableCell align="right">
                                                    {dashboardData.performanceMetrics.learningEfficiency}%
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Chip
                                                        label="우수"
                                                        size="small"
                                                        color="success"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </ProgressCard>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <ProgressCard>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    사용자 프로필
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            전문성 수준
                                        </Typography>
                                        <Chip
                                            label={dashboardData.userProfile.expertise_level}
                                            color="primary"
                                        />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            학습 스타일
                                        </Typography>
                                        <Chip
                                            label={dashboardData.userProfile.learning_style}
                                            color="secondary"
                                        />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            응답 길이 선호도
                                        </Typography>
                                        <Chip
                                            label={dashboardData.userProfile.response_length_preference}
                                            color="info"
                                        />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            예시 선호도
                                        </Typography>
                                        <Chip
                                            label={dashboardData.userProfile.example_preference}
                                            color="warning"
                                        />
                                    </Box>
                                </Box>
                            </CardContent>
                        </ProgressCard>
                    </Grid>
                </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
                {/* 활동 내역 탭 */}
                <ActivityCard>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            상세 활동 내역
                        </Typography>
                        <List>
                            {dashboardData.recentActivities.map((activity) => (
                                <ListItem key={activity.id}>
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: activity.color }}>
                                            {activity.icon}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={activity.title}
                                        secondary={
                                            <Box>
                                                <Typography variant="body2" color="textSecondary">
                                                    {activity.description}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {activity.timestamp.toLocaleString()}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </CardContent>
                </ActivityCard>
            </TabPanel>

            <TabPanel value={tabValue} index={4}>
                {/* 인사이트 탭 */}
                <Grid container spacing={3}>
                    {dashboardData.insights.map((insight) => (
                        <Grid item xs={12} md={6} key={insight.id}>
                            {renderInsightCard(insight)}
                        </Grid>
                    ))}
                </Grid>
            </TabPanel>

            {/* 설정 다이얼로그 */}
            <Dialog open={settingsDialog} onClose={() => setSettingsDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>대시보드 설정</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={autoRefresh}
                                    onChange={(e) => setAutoRefresh(e.target.checked)}
                                />
                            }
                            label="자동 새로고침"
                        />

                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                새로고침 간격 (초)
                            </Typography>
                            <Slider
                                value={refreshInterval / 1000}
                                onChange={(_, value) => setRefreshInterval(value as number * 1000)}
                                min={10}
                                max={120}
                                step={10}
                                marks
                                valueLabelDisplay="auto"
                                disabled={!autoRefresh}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSettingsDialog(false)}>
                        닫기
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardContainer>
    );
};

export default AdvancedDashboard;
