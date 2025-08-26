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
    TextField,
    InputAdornment,
    Tabs,
    Tab,
    Divider,
    CircularProgress,
    Slider,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    Analytics,
    TrendingUp,
    TrendingDown,
    TrendingFlat,
    CheckCircle,
    Warning,
    Error,
    Refresh,
    Fullscreen,
    FullscreenExit,
    Settings,
    Assessment,
    Build,
    Visibility,
    ExpandMore,
    PlayArrow,
    Stop,
    Pause,
    Undo,
    SmartToy,
    Book,
    Article,
    Science,
    Quiz,
    AutoFixHigh,
    Tune,
    Optimization,
    Timeline,
    Speed,
    Memory,
    Storage,
    NetworkCheck,
    Cpu,
    Psychology,
    SentimentSatisfied,
    SentimentDissatisfied,
    SentimentNeutral,
    Timeline as TimelineIcon,
    Assessment as AssessmentIcon,
    Build as BuildIcon,
    Visibility as VisibilityIcon,
    ExpandMore as ExpandMoreIcon,
    PlayArrow as PlayArrowIcon,
    Stop as StopIcon,
    Pause as PauseIcon,
    Undo as UndoIcon,
    SmartToy as SmartToyIcon,
    Analytics as AnalyticsIcon,
    ModelTraining,
    Book as BookIcon,
    Article as ArticleIcon,
    Science as ScienceIcon,
    Quiz as QuizIcon,
    AutoFixHigh as AutoFixHighIcon,
    Tune as TuneIcon,
    Optimization as OptimizationIcon,
    Timeline as TimelineIcon2,
    Assessment as AssessmentIcon2,
    Build as BuildIcon2,
    Visibility as VisibilityIcon2
} from '@mui/icons-material';
import ultraAdvancedAIService, { UltraAIMessage, UltraAIAnalysis, UltraAIPerformanceMetrics } from '../services/ultraAdvancedAIService';

interface ConversationMetrics {
    totalMessages: number;
    userMessages: number;
    aiMessages: number;
    averageResponseTime: number;
    sentimentDistribution: {
        positive: number;
        negative: number;
        neutral: number;
    };
    topicDistribution: Record<string, number>;
    intentDistribution: Record<string, number>;
    userEngagement: number;
    conversationFlow: string[];
    qualityScore: number;
    satisfactionTrend: number[];
}

interface ConversationInsight {
    id: string;
    type: 'sentiment' | 'topic' | 'intent' | 'performance' | 'engagement';
    title: string;
    description: string;
    value: number;
    trend: 'up' | 'down' | 'stable';
    recommendations: string[];
    severity: 'low' | 'medium' | 'high';
    timestamp: Date;
}

const UltraAdvancedAIConversationAnalyticsDashboard: React.FC = () => {
    const [messages, setMessages] = useState<UltraAIMessage[]>([]);
    const [analysis, setAnalysis] = useState<UltraAIAnalysis | null>(null);
    const [performanceMetrics, setPerformanceMetrics] = useState<UltraAIPerformanceMetrics>(ultraAdvancedAIService.getPerformanceMetrics());
    const [conversationMetrics, setConversationMetrics] = useState<ConversationMetrics>({
        totalMessages: 0,
        userMessages: 0,
        aiMessages: 0,
        averageResponseTime: 0,
        sentimentDistribution: { positive: 0, negative: 0, neutral: 0 },
        topicDistribution: {},
        intentDistribution: {},
        userEngagement: 0,
        conversationFlow: [],
        qualityScore: 0,
        satisfactionTrend: []
    });
    const [insights, setInsights] = useState<ConversationInsight[]>([]);
    const [activeTab, setActiveTab] = useState(0);
    const [isRealTimeMode, setIsRealTimeMode] = useState(true);
    const [showDetails, setShowDetails] = useState(false);
    const [selectedInsight, setSelectedInsight] = useState<ConversationInsight | null>(null);
    const [autoOptimize, setAutoOptimize] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(5000);

    useEffect(() => {
        const updateMetrics = () => {
            const currentMessages = ultraAdvancedAIService.getMessages();
            const currentAnalysis = ultraAdvancedAIService.getAnalysis();
            const currentPerformance = ultraAdvancedAIService.getPerformanceMetrics();

            setMessages(currentMessages);
            setAnalysis(currentAnalysis);
            setPerformanceMetrics(currentPerformance);

            // 대화 메트릭 계산
            const metrics = calculateConversationMetrics(currentMessages);
            setConversationMetrics(metrics);

            // 인사이트 생성
            const newInsights = generateInsights(metrics, currentAnalysis, currentPerformance);
            setInsights(newInsights);
        };

        // 초기 로드
        updateMetrics();

        // 실시간 업데이트
        if (isRealTimeMode) {
            const interval = setInterval(updateMetrics, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [isRealTimeMode, refreshInterval]);

    const calculateConversationMetrics = (messages: UltraAIMessage[]): ConversationMetrics => {
        const userMessages = messages.filter(msg => msg.type === 'user');
        const aiMessages = messages.filter(msg => msg.type === 'ai');

        const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
        const topicCounts: Record<string, number> = {};
        const intentCounts: Record<string, number> = {};
        let totalResponseTime = 0;
        let responseTimeCount = 0;

        messages.forEach(msg => {
            // 감정 분포 계산
            if (msg.metadata.sentiment) {
                sentimentCounts[msg.metadata.sentiment]++;
            }

            // 토픽 분포 계산
            msg.metadata.topics.forEach(topic => {
                topicCounts[topic] = (topicCounts[topic] || 0) + 1;
            });

            // 의도 분포 계산
            if (msg.metadata.intent) {
                intentCounts[msg.metadata.intent] = (intentCounts[msg.metadata.intent] || 0) + 1;
            }

            // 응답 시간 계산
            if (msg.type === 'ai' && msg.metadata.performance_metrics.response_time > 0) {
                totalResponseTime += msg.metadata.performance_metrics.response_time;
                responseTimeCount++;
            }
        });

        // 사용자 참여도 계산
        const userEngagement = calculateUserEngagement(messages);

        // 대화 흐름 분석
        const conversationFlow = analyzeConversationFlow(messages);

        // 품질 점수 계산
        const qualityScore = calculateQualityScore(messages, performanceMetrics);

        // 만족도 트렌드 계산
        const satisfactionTrend = calculateSatisfactionTrend(messages);

        return {
            totalMessages: messages.length,
            userMessages: userMessages.length,
            aiMessages: aiMessages.length,
            averageResponseTime: responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0,
            sentimentDistribution: sentimentCounts,
            topicDistribution: topicCounts,
            intentDistribution: intentCounts,
            userEngagement,
            conversationFlow,
            qualityScore,
            satisfactionTrend
        };
    };

    const calculateUserEngagement = (messages: UltraAIMessage[]): number => {
        if (messages.length === 0) return 0;

        const userMessages = messages.filter(msg => msg.type === 'user');
        const aiMessages = messages.filter(msg => msg.type === 'ai');

        // 메시지 길이 기반 참여도
        const avgUserMessageLength = userMessages.reduce((sum, msg) => sum + msg.content.length, 0) / userMessages.length;
        const avgAiMessageLength = aiMessages.reduce((sum, msg) => sum + msg.content.length, 0) / aiMessages.length;

        // 응답 시간 기반 참여도
        const responseTimes = aiMessages.map(msg => msg.metadata.performance_metrics.response_time);
        const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;

        // 종합 참여도 점수 (0-100)
        const lengthScore = Math.min(100, (avgUserMessageLength / 50) * 100);
        const responseScore = Math.max(0, 100 - (avgResponseTime / 100));
        const interactionScore = (userMessages.length / Math.max(1, aiMessages.length)) * 100;

        return (lengthScore + responseScore + interactionScore) / 3;
    };

    const analyzeConversationFlow = (messages: UltraAIMessage[]): string[] => {
        const flow: string[] = [];

        for (let i = 0; i < messages.length - 1; i++) {
            const current = messages[i];
            const next = messages[i + 1];

            if (current.type === 'user' && next.type === 'ai') {
                const intent = current.metadata.intent || 'general';
                const sentiment = current.metadata.sentiment || 'neutral';
                flow.push(`${intent} (${sentiment}) → AI 응답`);
            }
        }

        return flow;
    };

    const calculateQualityScore = (messages: UltraAIMessage[], performance: UltraAIPerformanceMetrics): number => {
        if (messages.length === 0) return 0;

        const aiMessages = messages.filter(msg => msg.type === 'ai');

        // 응답 품질 점수
        const avgConfidence = aiMessages.reduce((sum, msg) => sum + msg.metadata.confidence, 0) / aiMessages.length;
        const avgAccuracy = aiMessages.reduce((sum, msg) => sum + msg.metadata.performance_metrics.accuracy, 0) / aiMessages.length;
        const avgRelevance = aiMessages.reduce((sum, msg) => sum + msg.metadata.performance_metrics.relevance, 0) / aiMessages.length;

        // 성능 점수
        const performanceScore = performance.overall_score / 100;

        // 종합 품질 점수
        return (avgConfidence + avgAccuracy + avgRelevance + performanceScore) / 4 * 100;
    };

    const calculateSatisfactionTrend = (messages: UltraAIMessage[]): number[] => {
        const aiMessages = messages.filter(msg => msg.type === 'ai');
        return aiMessages.map(msg => msg.metadata.performance_metrics.user_satisfaction);
    };

    const generateInsights = (metrics: ConversationMetrics, analysis: UltraAIAnalysis | null, performance: UltraAIPerformanceMetrics): ConversationInsight[] => {
        const insights: ConversationInsight[] = [];

        // 감정 인사이트
        const totalSentiments = metrics.sentimentDistribution.positive + metrics.sentimentDistribution.negative + metrics.sentimentDistribution.neutral;
        if (totalSentiments > 0) {
            const positiveRatio = metrics.sentimentDistribution.positive / totalSentiments;
            insights.push({
                id: 'sentiment-1',
                type: 'sentiment',
                title: '사용자 감정 분석',
                description: `긍정적 감정 비율: ${(positiveRatio * 100).toFixed(1)}%`,
                value: positiveRatio * 100,
                trend: positiveRatio > 0.6 ? 'up' : positiveRatio < 0.4 ? 'down' : 'stable',
                recommendations: positiveRatio < 0.4 ? ['더 친근한 톤 사용', '문제 해결 중심 응답'] : ['현재 톤 유지', '긍정적 피드백 강화'],
                severity: positiveRatio < 0.3 ? 'high' : positiveRatio < 0.5 ? 'medium' : 'low',
                timestamp: new Date()
            });
        }

        // 응답 시간 인사이트
        if (metrics.averageResponseTime > 2000) {
            insights.push({
                id: 'performance-1',
                type: 'performance',
                title: '응답 시간 최적화 필요',
                description: `평균 응답 시간: ${metrics.averageResponseTime.toFixed(0)}ms`,
                value: Math.max(0, 100 - (metrics.averageResponseTime / 100)),
                trend: 'down',
                recommendations: ['AI 모델 최적화', '캐시 시스템 강화', '응답 생성 파이프라인 개선'],
                severity: metrics.averageResponseTime > 5000 ? 'high' : 'medium',
                timestamp: new Date()
            });
        }

        // 사용자 참여도 인사이트
        insights.push({
            id: 'engagement-1',
            type: 'engagement',
            title: '사용자 참여도',
            description: `현재 참여도: ${metrics.userEngagement.toFixed(1)}%`,
            value: metrics.userEngagement,
            trend: metrics.userEngagement > 70 ? 'up' : metrics.userEngagement < 30 ? 'down' : 'stable',
            recommendations: metrics.userEngagement < 50 ? ['더 흥미로운 질문 유도', '시각적 요소 추가', '개인화된 응답'] : ['현재 전략 유지'],
            severity: metrics.userEngagement < 30 ? 'high' : metrics.userEngagement < 50 ? 'medium' : 'low',
            timestamp: new Date()
        });

        // 품질 점수 인사이트
        insights.push({
            id: 'quality-1',
            type: 'performance',
            title: '대화 품질 점수',
            description: `현재 품질 점수: ${metrics.qualityScore.toFixed(1)}/100`,
            value: metrics.qualityScore,
            trend: metrics.qualityScore > 80 ? 'up' : metrics.qualityScore < 60 ? 'down' : 'stable',
            recommendations: metrics.qualityScore < 70 ? ['AI 모델 재훈련', '응답 템플릿 개선', '컨텍스트 이해 강화'] : ['현재 성능 유지'],
            severity: metrics.qualityScore < 50 ? 'high' : metrics.qualityScore < 70 ? 'medium' : 'low',
            timestamp: new Date()
        });

        return insights;
    };

    const handleOptimize = () => {
        // 자동 최적화 실행
        if (autoOptimize) {
            ultraAdvancedAIService.updateSettings({
                auto_optimize: true,
                real_time_analysis: true,
                adaptive_learning: true
            });
        }
    };

    const handleInsightClick = (insight: ConversationInsight) => {
        setSelectedInsight(insight);
        setShowDetails(true);
    };

    const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up': return <TrendingUp color="success" />;
            case 'down': return <TrendingDown color="error" />;
            case 'stable': return <TrendingFlat color="info" />;
        }
    };

    const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
        switch (severity) {
            case 'low': return 'success';
            case 'medium': return 'warning';
            case 'high': return 'error';
        }
    };

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AnalyticsIcon color="primary" />
                고도화된 AI 대화 분석 대시보드
            </Typography>

            {/* 제어 패널 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={isRealTimeMode}
                                        onChange={(e) => setIsRealTimeMode(e.target.checked)}
                                    />
                                }
                                label="실시간 모니터링"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={autoOptimize}
                                        onChange={(e) => setAutoOptimize(e.target.checked)}
                                    />
                                }
                                label="자동 최적화"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    variant="contained"
                                    startIcon={<Refresh />}
                                    onClick={() => window.location.reload()}
                                >
                                    새로고침
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<AutoFixHighIcon />}
                                    onClick={handleOptimize}
                                >
                                    최적화 실행
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* 탭 네비게이션 */}
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
                <Tab label="개요" icon={<AssessmentIcon />} />
                <Tab label="인사이트" icon={<AnalyticsIcon />} />
                <Tab label="성능" icon={<Speed />} />
                <Tab label="대화 흐름" icon={<TimelineIcon />} />
                <Tab label="설정" icon={<Settings />} />
            </Tabs>

            {/* 개요 탭 */}
            {activeTab === 0 && (
                <Grid container spacing={3}>
                    {/* 주요 메트릭 */}
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    총 메시지
                                </Typography>
                                <Typography variant="h4">
                                    {conversationMetrics.totalMessages}
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={(conversationMetrics.totalMessages / 100) * 100}
                                    sx={{ mt: 1 }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    평균 응답 시간
                                </Typography>
                                <Typography variant="h4">
                                    {conversationMetrics.averageResponseTime.toFixed(0)}ms
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.max(0, 100 - (conversationMetrics.averageResponseTime / 100))}
                                    sx={{ mt: 1 }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    사용자 참여도
                                </Typography>
                                <Typography variant="h4">
                                    {conversationMetrics.userEngagement.toFixed(1)}%
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={conversationMetrics.userEngagement}
                                    sx={{ mt: 1 }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    품질 점수
                                </Typography>
                                <Typography variant="h4">
                                    {conversationMetrics.qualityScore.toFixed(1)}/100
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={conversationMetrics.qualityScore}
                                    sx={{ mt: 1 }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* 감정 분포 */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    감정 분포
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <Chip
                                        icon={<SentimentSatisfied />}
                                        label={`긍정 ${conversationMetrics.sentimentDistribution.positive}`}
                                        color="success"
                                    />
                                    <Chip
                                        icon={<SentimentNeutral />}
                                        label={`중립 ${conversationMetrics.sentimentDistribution.neutral}`}
                                        color="default"
                                    />
                                    <Chip
                                        icon={<SentimentDissatisfied />}
                                        label={`부정 ${conversationMetrics.sentimentDistribution.negative}`}
                                        color="error"
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* 토픽 분포 */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    주요 토픽
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {Object.entries(conversationMetrics.topicDistribution)
                                        .sort(([, a], [, b]) => b - a)
                                        .slice(0, 5)
                                        .map(([topic, count]) => (
                                            <Chip
                                                key={topic}
                                                label={`${topic} (${count})`}
                                                variant="outlined"
                                            />
                                        ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* 인사이트 탭 */}
            {activeTab === 1 && (
                <Grid container spacing={3}>
                    {insights.map((insight) => (
                        <Grid item xs={12} md={6} key={insight.id}>
                            <Card
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover': { boxShadow: 3 }
                                }}
                                onClick={() => handleInsightClick(insight)}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                        {getTrendIcon(insight.trend)}
                                        <Typography variant="h6" flex={1}>
                                            {insight.title}
                                        </Typography>
                                        <Chip
                                            label={insight.severity}
                                            color={getSeverityColor(insight.severity) as any}
                                            size="small"
                                        />
                                    </Box>
                                    <Typography color="textSecondary" gutterBottom>
                                        {insight.description}
                                    </Typography>
                                    <Typography variant="h4" color="primary">
                                        {insight.value.toFixed(1)}
                                    </Typography>
                                    <Box sx={{ mt: 2 }}>
                                        {insight.recommendations.slice(0, 2).map((rec, index) => (
                                            <Typography key={index} variant="body2" color="textSecondary">
                                                • {rec}
                                            </Typography>
                                        ))}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* 성능 탭 */}
            {activeTab === 2 && (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    성능 메트릭
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={3}>
                                        <Box>
                                            <Typography color="textSecondary">전체 점수</Typography>
                                            <Typography variant="h4">{performanceMetrics.overall_score.toFixed(1)}%</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <Box>
                                            <Typography color="textSecondary">응답 시간</Typography>
                                            <Typography variant="h4">{performanceMetrics.response_time.toFixed(0)}ms</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <Box>
                                            <Typography color="textSecondary">정확도</Typography>
                                            <Typography variant="h4">{(performanceMetrics.accuracy * 100).toFixed(1)}%</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <Box>
                                            <Typography color="textSecondary">관련성</Typography>
                                            <Typography variant="h4">{(performanceMetrics.relevance * 100).toFixed(1)}%</Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* 대화 흐름 탭 */}
            {activeTab === 3 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            대화 흐름 분석
                        </Typography>
                        <List>
                            {conversationMetrics.conversationFlow.map((flow, index) => (
                                <ListItem key={index}>
                                    <ListItemIcon>
                                        <SmartToyIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText primary={flow} />
                                </ListItem>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            )}

            {/* 설정 탭 */}
            {activeTab === 4 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            분석 설정
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>새로고침 간격</InputLabel>
                                    <Select
                                        value={refreshInterval}
                                        onChange={(e) => setRefreshInterval(e.target.value as number)}
                                    >
                                        <MenuItem value={1000}>1초</MenuItem>
                                        <MenuItem value={5000}>5초</MenuItem>
                                        <MenuItem value={10000}>10초</MenuItem>
                                        <MenuItem value={30000}>30초</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* 인사이트 상세 다이얼로그 */}
            <Dialog open={showDetails} onClose={() => setShowDetails(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {selectedInsight?.title}
                </DialogTitle>
                <DialogContent>
                    {selectedInsight && (
                        <Box>
                            <Typography variant="body1" gutterBottom>
                                {selectedInsight.description}
                            </Typography>
                            <Typography variant="h4" color="primary" gutterBottom>
                                {selectedInsight.value.toFixed(1)}
                            </Typography>
                            <Typography variant="h6" gutterBottom>
                                권장사항:
                            </Typography>
                            <List>
                                {selectedInsight.recommendations.map((rec, index) => (
                                    <ListItem key={index}>
                                        <ListItemIcon>
                                            <CheckCircle color="success" />
                                        </ListItemIcon>
                                        <ListItemText primary={rec} />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDetails(false)}>닫기</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UltraAdvancedAIConversationAnalyticsDashboard;
