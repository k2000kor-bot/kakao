import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    Chip,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tab,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Alert,
    Tooltip,
    Badge,
    Avatar,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Rating,
    Slider
} from '@mui/material';
import {
    Psychology,
    TrendingUp,
    Assessment,
    Favorite,
    Refresh,
    Fullscreen,
    FullscreenExit,
    Settings,
    PlayArrow,
    Pause,
    CheckCircle,
    Warning,
    Error,
    Info,
    ExpandMore,
    Timeline,
    SentimentSatisfied,
    SentimentDissatisfied,
    SentimentVeryDissatisfied,
    SentimentVerySatisfied,
    Analytics,
    EmojiEmotions,
    Mood,
    Speed,
    PriorityHigh,
    LowPriority,
    TrendingDown,
    Equalizer,
    PieChart,
    BarChart,
    ScatterPlot,
    FavoriteBorder,
    ThumbUp,
    ThumbDown
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter } from 'recharts';

// Mock data for demonstration
const mockMetrics = {
    totalEmotionsDetected: 156,
    averageEmotionConfidence: 0.847,
    responseEffectiveness: 0.891,
    userSatisfaction: 0.923,
    emotionalStabilityIndex: 0.756,
    interventionSuccessRate: 0.834,
    systemAdaptationSpeed: 0.789,
    emotionalIntelligenceScore: 0.856
};

const mockEmotionData = [
    {
        id: 'emotion-001',
        user_id: 'user-001',
        session_id: 'session-001',
        emotion_type: 'joy',
        confidence: 0.89,
        intensity: 0.7,
        valence: 0.8,
        arousal: 0.6,
        context: '업무 환경에서의 성취감',
        triggers: ['프로젝트 완료', '동료 칭찬'],
        physiological_signals: {
            heart_rate: 75,
            skin_conductance: 0.3,
            facial_muscles: [0.8, 0.7, 0.6, 0.5, 0.4],
            voice_tone: 0.7,
            typing_speed: 65
        },
        timestamp: new Date(Date.now() - 1800000) // 30분 전
    },
    {
        id: 'emotion-002',
        user_id: 'user-002',
        session_id: 'session-002',
        emotion_type: 'frustration',
        confidence: 0.76,
        intensity: 0.8,
        valence: -0.6,
        arousal: 0.9,
        context: '기술적 문제 해결 과정',
        triggers: ['버그 발생', '데드라인 압박'],
        physiological_signals: {
            heart_rate: 95,
            skin_conductance: 0.8,
            facial_muscles: [0.2, 0.3, 0.8, 0.7, 0.6],
            voice_tone: 0.3,
            typing_speed: 45
        },
        timestamp: new Date(Date.now() - 900000) // 15분 전
    }
];

const mockEmotionResponses = [
    {
        id: 'response-001',
        emotion_data_id: 'emotion-001',
        response_type: 'motivational',
        content: '당신의 열정과 노력이 인상적입니다. 계속해서 전진하세요!',
        tone: 'enthusiastic',
        urgency: 'low',
        effectiveness_score: 0.92,
        user_feedback: {
            satisfaction: 0.9,
            helpfulness: 0.95,
            emotional_impact: 0.88
        },
        timestamp: new Date(Date.now() - 1790000)
    },
    {
        id: 'response-002',
        emotion_data_id: 'emotion-002',
        response_type: 'analytical',
        content: '이 상황을 객관적으로 분석해보면, 몇 가지 해결 방안이 있을 것 같습니다.',
        tone: 'calm',
        urgency: 'high',
        effectiveness_score: 0.78,
        user_feedback: {
            satisfaction: 0.7,
            helpfulness: 0.8,
            emotional_impact: 0.75
        },
        timestamp: new Date(Date.now() - 890000)
    }
];

const mockEmotionTrends = [
    {
        user_id: 'user-001',
        time_period: 'day',
        dominant_emotion: 'joy',
        emotion_distribution: {
            joy: 0.4,
            neutral: 0.3,
            excitement: 0.2,
            frustration: 0.1
        },
        average_valence: 0.6,
        average_arousal: 0.5,
        emotional_stability: 0.8,
        stress_level: 0.2,
        mood_trend: 'improving',
        recommendations: [
            '긍정적인 에너지를 유지하세요',
            '성취감을 기록해보세요',
            '동료들과 경험을 공유해보세요'
        ]
    }
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff69b4', '#4169e1', '#32cd32', '#ff4500', '#9370db'];

const RealTimeAIEmotionRecognitionDashboard: React.FC = () => {
    const [currentTab, setCurrentTab] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedEmotion, setSelectedEmotion] = useState<any>(null);
    const [emotionDialogOpen, setEmotionDialogOpen] = useState(false);
    const [metrics, setMetrics] = useState(mockMetrics);
    const [emotionData, setEmotionData] = useState(mockEmotionData);
    const [emotionResponses, setEmotionResponses] = useState(mockEmotionResponses);
    const [emotionTrends, setEmotionTrends] = useState(mockEmotionTrends);

    useEffect(() => {
        const interval = setInterval(() => {
            // 실시간 데이터 업데이트
            setMetrics(prev => ({
                ...prev,
                totalEmotionsDetected: prev.totalEmotionsDetected + (Math.random() > 0.7 ? 1 : 0),
                averageEmotionConfidence: Math.min(1, Math.max(0, prev.averageEmotionConfidence + (Math.random() - 0.5) * 0.02)),
                emotionalIntelligenceScore: Math.min(1, Math.max(0, prev.emotionalIntelligenceScore + (Math.random() - 0.5) * 0.01))
            }));
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    const handleEmotionClick = (emotion: any) => {
        setSelectedEmotion(emotion);
        setEmotionDialogOpen(true);
    };

    const getEmotionColor = (emotionType: string) => {
        switch (emotionType) {
            case 'joy': return 'success';
            case 'sadness': return 'info';
            case 'anger': return 'error';
            case 'fear': return 'warning';
            case 'surprise': return 'secondary';
            case 'disgust': return 'error';
            case 'neutral': return 'default';
            case 'confusion': return 'warning';
            case 'excitement': return 'success';
            case 'frustration': return 'error';
            default: return 'default';
        }
    };

    const getEmotionIcon = (emotionType: string) => {
        switch (emotionType) {
            case 'joy': return <SentimentVerySatisfied />;
            case 'sadness': return <SentimentDissatisfied />;
            case 'anger': return <SentimentVeryDissatisfied />;
            case 'fear': return <Warning />;
            case 'surprise': return <Info />;
            case 'disgust': return <Error />;
            case 'neutral': return <SentimentSatisfied />;
            case 'confusion': return <Help />;
            case 'excitement': return <EmojiEmotions />;
            case 'frustration': return <Mood />;
            default: return <SentimentSatisfied />;
        }
    };

    const getResponseTypeColor = (responseType: string) => {
        switch (responseType) {
            case 'empathic': return 'primary';
            case 'supportive': return 'success';
            case 'encouraging': return 'info';
            case 'calming': return 'secondary';
            case 'motivational': return 'warning';
            case 'analytical': return 'default';
            case 'humorous': return 'success';
            case 'professional': return 'primary';
            default: return 'default';
        }
    };

    const getToneColor = (tone: string) => {
        switch (tone) {
            case 'warm': return 'success';
            case 'neutral': return 'default';
            case 'formal': return 'primary';
            case 'casual': return 'info';
            case 'enthusiastic': return 'warning';
            case 'calm': return 'secondary';
            case 'energetic': return 'success';
            default: return 'default';
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'low': return 'success';
            case 'medium': return 'warning';
            case 'high': return 'error';
            default: return 'default';
        }
    };

    const renderOverviewTab = () => (
        <Box>
            <Grid container spacing={3}>
                {/* 시스템 상태 카드 */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                감정 인식 시스템 상태
                            </Typography>
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                                <Chip
                                    label="정상 운영"
                                    color="success"
                                    icon={<CheckCircle />}
                                />
                                <Typography variant="body2" color="textSecondary">
                                    마지막 업데이트: {new Date().toLocaleTimeString()}
                                </Typography>
                            </Box>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">감지된 감정</Typography>
                                    <Typography variant="h4">{metrics.totalEmotionsDetected}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">평균 신뢰도</Typography>
                                    <Typography variant="h4">{(metrics.averageEmotionConfidence * 100).toFixed(1)}%</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">응답 효과성</Typography>
                                    <Typography variant="h4">{(metrics.responseEffectiveness * 100).toFixed(1)}%</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">감정 지능 점수</Typography>
                                    <Typography variant="h4">{(metrics.emotionalIntelligenceScore * 100).toFixed(1)}%</Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 감정 분포 차트 */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                감정 분포 현황
                            </Typography>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: '기쁨', value: 35, fill: '#4caf50' },
                                            { name: '중립', value: 25, fill: '#9e9e9e' },
                                            { name: '흥미', value: 20, fill: '#ff9800' },
                                            { name: '좌절', value: 15, fill: '#f44336' },
                                            { name: '슬픔', value: 5, fill: '#2196f3' }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        dataKey="value"
                                        label
                                    >
                                        {[0, 1, 2, 3, 4].map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 실시간 감정 데이터 */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                실시간 감정 데이터
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>사용자 ID</TableCell>
                                            <TableCell>감정 유형</TableCell>
                                            <TableCell>신뢰도</TableCell>
                                            <TableCell>강도</TableCell>
                                            <TableCell>가치</TableCell>
                                            <TableCell>각성도</TableCell>
                                            <TableCell>컨텍스트</TableCell>
                                            <TableCell>시간</TableCell>
                                            <TableCell>상태</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {emotionData.map((emotion) => (
                                            <TableRow key={emotion.id} hover onClick={() => handleEmotionClick(emotion)} style={{ cursor: 'pointer' }}>
                                                <TableCell>{emotion.user_id}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={emotion.emotion_type}
                                                        size="small"
                                                        color={getEmotionColor(emotion.emotion_type)}
                                                        icon={getEmotionIcon(emotion.emotion_type)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={emotion.confidence * 100}
                                                        sx={{ width: 100, height: 6, borderRadius: 3 }}
                                                    />
                                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                        {(emotion.confidence * 100).toFixed(1)}%
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={emotion.intensity * 100}
                                                        color="secondary"
                                                        sx={{ width: 100, height: 6, borderRadius: 3 }}
                                                    />
                                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                        {(emotion.intensity * 100).toFixed(1)}%
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color={emotion.valence > 0 ? 'success.main' : 'error.main'}>
                                                        {emotion.valence > 0 ? '+' : ''}{emotion.valence.toFixed(2)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {(emotion.arousal * 100).toFixed(1)}%
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                                                        {emotion.context}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {emotion.timestamp.toLocaleTimeString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label="처리됨"
                                                        color="success"
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
                </Grid>
            </Grid>
        </Box>
    );

    const renderResponsesTab = () => (
        <Box>
            <Grid container spacing={3}>
                {emotionResponses.map((response) => (
                    <Grid item xs={12} md={6} key={response.id}>
                        <Card>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h6">
                                        {response.response_type} 응답
                                    </Typography>
                                    <Chip
                                        label={`${(response.effectiveness_score * 100).toFixed(0)}점`}
                                        color="primary"
                                        size="small"
                                    />
                                </Box>

                                <Typography variant="body2" color="textSecondary" paragraph>
                                    {response.content}
                                </Typography>

                                <Box display="flex" gap={1} mb={2}>
                                    <Chip
                                        label={response.response_type}
                                        size="small"
                                        color={getResponseTypeColor(response.response_type)}
                                    />
                                    <Chip
                                        label={response.tone}
                                        size="small"
                                        color={getToneColor(response.tone)}
                                    />
                                    <Chip
                                        label={response.urgency}
                                        size="small"
                                        color={getUrgencyColor(response.urgency)}
                                    />
                                </Box>

                                {response.user_feedback && (
                                    <Box mb={2}>
                                        <Typography variant="subtitle2" gutterBottom>사용자 피드백</Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={4}>
                                                <Typography variant="body2" color="textSecondary">만족도</Typography>
                                                <Rating value={response.user_feedback.satisfaction * 5} readOnly size="small" />
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Typography variant="body2" color="textSecondary">도움됨</Typography>
                                                <Rating value={response.user_feedback.helpfulness * 5} readOnly size="small" />
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Typography variant="body2" color="textSecondary">감정적 영향</Typography>
                                                <Rating value={response.user_feedback.emotional_impact * 5} readOnly size="small" />
                                            </Grid>
                                        </Grid>
                                    </Box>
                                )}

                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" color="textSecondary">
                                        {response.timestamp.toLocaleTimeString()}
                                    </Typography>
                                    <Box display="flex" gap={1}>
                                        <IconButton size="small" color="success">
                                            <ThumbUp />
                                        </IconButton>
                                        <IconButton size="small" color="error">
                                            <ThumbDown />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );

    const renderTrendsTab = () => (
        <Box>
            <Grid container spacing={3}>
                {emotionTrends.map((trend) => (
                    <Grid item xs={12} md={6} key={`${trend.user_id}-${trend.time_period}`}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {trend.user_id} - {trend.time_period} 트렌드
                                </Typography>

                                <Box mb={2}>
                                    <Typography variant="subtitle2" gutterBottom>주요 감정: {trend.dominant_emotion}</Typography>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={Object.entries(trend.emotion_distribution).map(([emotion, value]) => ({
                                            emotion,
                                            value: value * 100
                                        }))}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="emotion" />
                                            <YAxis />
                                            <RechartsTooltip />
                                            <Bar dataKey="value" fill="#8884d8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>

                                <Grid container spacing={2} mb={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="textSecondary">평균 가치</Typography>
                                        <Typography variant="h6" color={trend.average_valence > 0 ? 'success.main' : 'error.main'}>
                                            {trend.average_valence > 0 ? '+' : ''}{trend.average_valence.toFixed(2)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="textSecondary">평균 각성도</Typography>
                                        <Typography variant="h6">{(trend.average_arousal * 100).toFixed(1)}%</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="textSecondary">감정 안정성</Typography>
                                        <Typography variant="h6">{(trend.emotional_stability * 100).toFixed(1)}%</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="textSecondary">스트레스 수준</Typography>
                                        <Typography variant="h6" color={trend.stress_level > 0.5 ? 'error.main' : 'success.main'}>
                                            {(trend.stress_level * 100).toFixed(1)}%
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                    <Typography variant="body2" color="textSecondary">기분 트렌드:</Typography>
                                    <Chip
                                        label={trend.mood_trend}
                                        color={trend.mood_trend === 'improving' ? 'success' : trend.mood_trend === 'declining' ? 'error' : 'warning'}
                                        size="small"
                                    />
                                </Box>

                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMore />}>
                                        <Typography variant="subtitle2">추천사항</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <List dense>
                                            {trend.recommendations.map((recommendation, index) => (
                                                <ListItem key={index}>
                                                    <ListItemIcon>
                                                        <Info color="info" />
                                                    </ListItemIcon>
                                                    <ListItemText primary={recommendation} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </AccordionDetails>
                                </Accordion>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}

                {/* 감정 트렌드 차트 */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                감정 변화 트렌드
                            </Typography>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={Array.from({ length: 20 }, (_, i) => ({
                                    time: i,
                                    joy: 0.3 + Math.random() * 0.4,
                                    sadness: 0.1 + Math.random() * 0.2,
                                    anger: 0.05 + Math.random() * 0.1,
                                    fear: 0.05 + Math.random() * 0.1,
                                    neutral: 0.2 + Math.random() * 0.3
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Line type="monotone" dataKey="joy" stroke="#4caf50" name="기쁨" />
                                    <Line type="monotone" dataKey="sadness" stroke="#2196f3" name="슬픔" />
                                    <Line type="monotone" dataKey="anger" stroke="#f44336" name="분노" />
                                    <Line type="monotone" dataKey="fear" stroke="#ff9800" name="두려움" />
                                    <Line type="monotone" dataKey="neutral" stroke="#9e9e9e" name="중립" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );

    const renderAnalysisTab = () => (
        <Box>
            <Grid container spacing={3}>
                {/* 감정 분석 카드들 */}
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                감정 지능 점수
                            </Typography>
                            <Typography variant="h3" color="primary">
                                {(metrics.emotionalIntelligenceScore * 100).toFixed(1)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                응답 효과성
                            </Typography>
                            <Typography variant="h3" color="success">
                                {(metrics.responseEffectiveness * 100).toFixed(1)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                개입 성공률
                            </Typography>
                            <Typography variant="h3" color="warning">
                                {(metrics.interventionSuccessRate * 100).toFixed(1)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                시스템 적응 속도
                            </Typography>
                            <Typography variant="h3" color="info">
                                {(metrics.systemAdaptationSpeed * 100).toFixed(1)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 감정 분석 차트 */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                감정 분석 레이더 차트
                            </Typography>
                            <ResponsiveContainer width="100%" height={400}>
                                <RadarChart data={[
                                    {
                                        metric: '감정 인식 정확도',
                                        current: metrics.averageEmotionConfidence * 100,
                                        target: 90
                                    },
                                    {
                                        metric: '응답 적절성',
                                        current: metrics.responseEffectiveness * 100,
                                        target: 85
                                    },
                                    {
                                        metric: '사용자 만족도',
                                        current: metrics.userSatisfaction * 100,
                                        target: 90
                                    },
                                    {
                                        metric: '감정 안정성',
                                        current: metrics.emotionalStabilityIndex * 100,
                                        target: 80
                                    },
                                    {
                                        metric: '개입 효과성',
                                        current: metrics.interventionSuccessRate * 100,
                                        target: 85
                                    },
                                    {
                                        metric: '적응 능력',
                                        current: metrics.systemAdaptationSpeed * 100,
                                        target: 80
                                    }
                                ]}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="metric" />
                                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                                    <Radar name="현재 성능" dataKey="current" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                    <Radar name="목표 성능" dataKey="target" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                                    <RechartsTooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );

    const renderPerformanceTab = () => (
        <Box>
            <Grid container spacing={3}>
                {/* 성능 지표 카드들 */}
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                총 감정 감지
                            </Typography>
                            <Typography variant="h3" color="primary">
                                {metrics.totalEmotionsDetected}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                평균 신뢰도
                            </Typography>
                            <Typography variant="h3" color="success">
                                {(metrics.averageEmotionConfidence * 100).toFixed(1)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                사용자 만족도
                            </Typography>
                            <Typography variant="h3" color="warning">
                                {(metrics.userSatisfaction * 100).toFixed(1)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                감정 안정성
                            </Typography>
                            <Typography variant="h3" color="info">
                                {(metrics.emotionalStabilityIndex * 100).toFixed(1)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 성능 트렌드 차트 */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                시스템 성능 트렌드
                            </Typography>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={Array.from({ length: 20 }, (_, i) => ({
                                    time: i,
                                    emotion_confidence: 0.7 + Math.random() * 0.3,
                                    response_effectiveness: 0.8 + Math.random() * 0.2,
                                    user_satisfaction: 0.85 + Math.random() * 0.15,
                                    emotional_stability: 0.75 + Math.random() * 0.25
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Line type="monotone" dataKey="emotion_confidence" stroke="#8884d8" name="감정 신뢰도" />
                                    <Line type="monotone" dataKey="response_effectiveness" stroke="#82ca9d" name="응답 효과성" />
                                    <Line type="monotone" dataKey="user_satisfaction" stroke="#ffc658" name="사용자 만족도" />
                                    <Line type="monotone" dataKey="emotional_stability" stroke="#ff7300" name="감정 안정성" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );

    const renderSettingsTab = () => (
        <Box>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                시스템 설정
                            </Typography>
                            <Box display="flex" flexDirection="column" gap={2}>
                                <Button variant="contained" color="primary" startIcon={<Refresh />}>
                                    감정 인식 엔진 재시작
                                </Button>
                                <Button variant="outlined" color="secondary" startIcon={<Analytics />}>
                                    응답 모델 업데이트
                                </Button>
                                <Button variant="outlined" color="info" startIcon={<Psychology />}>
                                    감정 분석 알고리즘 재훈련
                                </Button>
                                <Button variant="outlined" color="warning" startIcon={<Settings />}>
                                    고급 설정
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                시스템 상태
                            </Typography>
                            <Box display="flex" flexDirection="column" gap={2}>
                                <Alert severity="success">
                                    감정 인식 시스템이 정상적으로 작동 중입니다.
                                </Alert>
                                <Alert severity="info">
                                    적응적 응답 생성이 활성화되어 있습니다.
                                </Alert>
                                <Alert severity="warning">
                                    일부 사용자의 감정 패턴이 변경되었습니다.
                                </Alert>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );

    return (
        <Box sx={{ p: 3, height: '100vh', overflow: 'auto' }}>
            {/* 헤더 */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4" gutterBottom>
                        😊 실시간 AI 감정 인식 및 대응 대시보드
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                        실시간 감정 분석, 적응적 응답 생성, 감정 트렌드 모니터링
                    </Typography>
                </Box>
                <Box display="flex" gap={1}>
                    <Tooltip title="새로고침">
                        <IconButton>
                            <Refresh />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={isFullscreen ? "전체화면 해제" : "전체화면"}>
                        <IconButton onClick={() => setIsFullscreen(!isFullscreen)}>
                            {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* 탭 네비게이션 */}
            <Paper sx={{ mb: 3 }}>
                <Tabs value={currentTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                    <Tab icon={<Assessment />} label="개요" />
                    <Tab icon={<Favorite />} label="응답 관리" />
                    <Tab icon={<TrendingUp />} label="감정 트렌드" />
                    <Tab icon={<Analytics />} label="감정 분석" />
                    <Tab icon={<Speed />} label="성능 모니터링" />
                    <Tab icon={<Settings />} label="설정" />
                </Tabs>
            </Paper>

            {/* 탭 콘텐츠 */}
            <Box>
                {currentTab === 0 && renderOverviewTab()}
                {currentTab === 1 && renderResponsesTab()}
                {currentTab === 2 && renderTrendsTab()}
                {currentTab === 3 && renderAnalysisTab()}
                {currentTab === 4 && renderPerformanceTab()}
                {currentTab === 5 && renderSettingsTab()}
            </Box>

            {/* 감정 데이터 상세 다이얼로그 */}
            <Dialog open={emotionDialogOpen} onClose={() => setEmotionDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    감정 데이터 상세 정보: {selectedEmotion?.user_id}
                </DialogTitle>
                <DialogContent>
                    {selectedEmotion && (
                        <Box>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2">감정 유형</Typography>
                                    <Chip
                                        label={selectedEmotion.emotion_type}
                                        color={getEmotionColor(selectedEmotion.emotion_type)}
                                        icon={getEmotionIcon(selectedEmotion.emotion_type)}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2">신뢰도</Typography>
                                    <Typography variant="body2">{(selectedEmotion.confidence * 100).toFixed(1)}%</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2">강도</Typography>
                                    <Typography variant="body2">{(selectedEmotion.intensity * 100).toFixed(1)}%</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2">가치</Typography>
                                    <Typography variant="body2" color={selectedEmotion.valence > 0 ? 'success.main' : 'error.main'}>
                                        {selectedEmotion.valence > 0 ? '+' : ''}{selectedEmotion.valence.toFixed(2)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2">컨텍스트</Typography>
                                    <Typography variant="body2">{selectedEmotion.context}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2">트리거</Typography>
                                    <Box display="flex" gap={1} flexWrap="wrap">
                                        {selectedEmotion.triggers.map((trigger, index) => (
                                            <Chip key={index} label={trigger} size="small" variant="outlined" />
                                        ))}
                                    </Box>
                                </Grid>
                                {selectedEmotion.physiological_signals && (
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" gutterBottom>생리학적 신호</Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={4}>
                                                <Typography variant="body2" color="textSecondary">심박수</Typography>
                                                <Typography variant="body2">{selectedEmotion.physiological_signals.heart_rate} BPM</Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Typography variant="body2" color="textSecondary">피부 전도도</Typography>
                                                <Typography variant="body2">{(selectedEmotion.physiological_signals.skin_conductance * 100).toFixed(1)}%</Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Typography variant="body2" color="textSecondary">타이핑 속도</Typography>
                                                <Typography variant="body2">{selectedEmotion.physiological_signals.typing_speed} WPM</Typography>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEmotionDialogOpen(false)}>닫기</Button>
                    <Button variant="contained" color="primary">응답 생성</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RealTimeAIEmotionRecognitionDashboard;
