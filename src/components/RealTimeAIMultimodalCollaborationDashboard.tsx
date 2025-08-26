import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    Tabs,
    Tab,
    Chip,
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
    Switch,
    FormControlLabel,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Alert,
    LinearProgress,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Videocam,
    Mic,
    TextFields,
    Gesture,
    ScreenShare,
    Analytics,
    TrendingUp,
    Psychology,
    Group,
    Settings,
    PlayArrow,
    Stop,
    Refresh,
    Add,
    Visibility,
    Edit,
    Delete,
    CheckCircle,
    Warning,
    Error,
    Info
} from '@mui/icons-material';
import {
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    ScatterChart,
    Scatter
} from 'recharts';
import realTimeAIMultimodalCollaborationSystem, {
    MultimodalCollaborationSession,
    MultimodalCollaborationMetrics,
    MultimodalInteraction,
    CrossModalInsight,
    MultimodalPattern,
    MultimodalRecommendation
} from '../services/realTimeAIMultimodalCollaborationSystem';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`multimodal-tabpanel-${index}`}
            aria-labelledby={`multimodal-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const RealTimeAIMultimodalCollaborationDashboard: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [sessions, setSessions] = useState<MultimodalCollaborationSession[]>([]);
    const [metrics, setMetrics] = useState<MultimodalCollaborationMetrics | null>(null);
    const [selectedSession, setSelectedSession] = useState<MultimodalCollaborationSession | null>(null);
    const [isSystemRunning, setIsSystemRunning] = useState(false);
    const [createSessionDialog, setCreateSessionDialog] = useState(false);
    const [sessionDetailsDialog, setSessionDetailsDialog] = useState(false);
    const [newSession, setNewSession] = useState({
        title: '',
        participants: [''],
        autoTranscription: true,
        emotionDetection: true,
        gestureRecognition: true,
        attentionTracking: true
    });

    useEffect(() => {
        const updateData = () => {
            setSessions(realTimeAIMultimodalCollaborationSystem.getSessions());
            setMetrics(realTimeAIMultimodalCollaborationSystem.getMetrics());
            setIsSystemRunning(realTimeAIMultimodalCollaborationSystem.isSystemRunning());
        };

        updateData();
        const interval = setInterval(updateData, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleSystemToggle = () => {
        if (isSystemRunning) {
            realTimeAIMultimodalCollaborationSystem.stop();
        } else {
            realTimeAIMultimodalCollaborationSystem.start();
        }
    };

    const handleCreateSession = () => {
        setCreateSessionDialog(true);
    };

    const handleSessionSubmit = () => {
        // 실제 구현에서는 세션 생성 로직 추가
        setCreateSessionDialog(false);
        setNewSession({
            title: '',
            participants: [''],
            autoTranscription: true,
            emotionDetection: true,
            gestureRecognition: true,
            attentionTracking: true
        });
    };

    const handleSessionDetails = (session: MultimodalCollaborationSession) => {
        setSelectedSession(session);
        setSessionDetailsDialog(true);
    };

    // 차트 데이터 생성
    const generateModalityUsageData = () => {
        if (!metrics) return [];

        return Object.entries(metrics.modalityUsage).map(([modality, count]) => ({
            modality,
            count,
            percentage: (count / metrics.totalInteractions) * 100
        }));
    };

    const generatePerformanceData = () => {
        if (!selectedSession) return [];

        return [
            { metric: '품질', value: selectedSession.metrics.averageQuality * 100 },
            { metric: '참여도', value: selectedSession.metrics.engagementRate * 100 },
            { metric: '협업효과', value: selectedSession.metrics.collaborationEffectiveness * 100 },
            { metric: '크로스모달', value: selectedSession.metrics.crossModalInsights },
            { metric: '패턴감지', value: selectedSession.metrics.patternsDetected },
            { metric: '추천사항', value: selectedSession.metrics.recommendationsGenerated }
        ];
    };

    const generateInteractionTrendData = () => {
        if (!selectedSession) return [];

        return selectedSession.interactions.slice(-10).map((interaction, index) => ({
            time: index,
            quality: interaction.analysis.quality * 100,
            engagement: interaction.analysis.engagement * 100,
            impact: interaction.analysis.impact * 100
        }));
    };

    const getModalityIcon = (modality: string) => {
        switch (modality) {
            case 'audio': return <Mic />;
            case 'video': return <Videocam />;
            case 'text': return <TextFields />;
            case 'gesture': return <Gesture />;
            case 'screen': return <ScreenShare />;
            default: return <Info />;
        }
    };

    const getPriorityColor = (priority: number) => {
        if (priority <= 2) return 'success';
        if (priority <= 4) return 'warning';
        return 'error';
    };

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return 'success';
            case 'neutral': return 'info';
            case 'negative': return 'error';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            {/* 헤더 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    🎥 실시간 AI 멀티모달 협업 시스템
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        color={isSystemRunning ? 'error' : 'success'}
                        startIcon={isSystemRunning ? <Stop /> : <PlayArrow />}
                        onClick={handleSystemToggle}
                    >
                        {isSystemRunning ? '시스템 중지' : '시스템 시작'}
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={handleCreateSession}
                    >
                        새 세션 생성
                    </Button>
                </Box>
            </Box>

            {/* 시스템 상태 */}
            <Alert
                severity={isSystemRunning ? 'success' : 'warning'}
                sx={{ mb: 3 }}
                action={
                    <Button color="inherit" size="small" startIcon={<Refresh />}>
                        새로고침
                    </Button>
                }
            >
                시스템 상태: {isSystemRunning ? '실행 중' : '중지됨'}
            </Alert>

            {/* 탭 네비게이션 */}
            <Paper sx={{ width: '100%', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="multimodal collaboration tabs">
                    <Tab icon={<Analytics />} label="개요" />
                    <Tab icon={<Videocam />} label="멀티모달 스트림" />
                    <Tab icon={<Group />} label="상호작용" />
                    <Tab icon={<TrendingUp />} label="크로스모달 분석" />
                    <Tab icon={<Psychology />} label="패턴 분석" />
                    <Tab icon={<Settings />} label="설정" />
                </Tabs>
            </Paper>

            {/* 개요 탭 */}
            <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                    {/* 주요 지표 */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    📊 전체 지표
                                </Typography>
                                {metrics && (
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="h4" color="primary">
                                                {metrics.totalInteractions}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                총 상호작용
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="h4" color="secondary">
                                                {(metrics.averageQuality * 100).toFixed(1)}%
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                평균 품질
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="h4" color="success.main">
                                                {(metrics.engagementRate * 100).toFixed(1)}%
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                참여도
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="h4" color="info.main">
                                                {(metrics.collaborationEffectiveness * 100).toFixed(1)}%
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                협업 효과성
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* 모달리티 사용량 */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    📡 모달리티 사용량
                                </Typography>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={generateModalityUsageData()}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ modality, percentage }) => `${modality} ${percentage.toFixed(1)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="count"
                                        >
                                            {generateModalityUsageData().map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'][index % 5]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* 활성 세션 */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    🎯 활성 세션 ({sessions.length})
                                </Typography>
                                <Grid container spacing={2}>
                                    {sessions.map((session) => (
                                        <Grid item xs={12} md={6} lg={4} key={session.sessionId}>
                                            <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        {session.title}
                                                    </Typography>
                                                    <IconButton size="small" onClick={() => handleSessionDetails(session)}>
                                                        <Visibility />
                                                    </IconButton>
                                                </Box>
                                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                                    참가자: {session.participants.length}명
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                                    {session.modalities.map((modality) => (
                                                        <Chip
                                                            key={modality.type}
                                                            icon={getModalityIcon(modality.type)}
                                                            label={modality.type}
                                                            size="small"
                                                            color={modality.enabled ? 'primary' : 'default'}
                                                            variant={modality.enabled ? 'filled' : 'outlined'}
                                                        />
                                                    ))}
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="body2">
                                                        상호작용: {session.metrics.totalInteractions}
                                                    </Typography>
                                                    <Chip
                                                        label={`${(session.metrics.averageQuality * 100).toFixed(0)}%`}
                                                        color="success"
                                                        size="small"
                                                    />
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </TabPanel>

            {/* 멀티모달 스트림 탭 */}
            <TabPanel value={tabValue} index={1}>
                <Grid container spacing={3}>
                    {selectedSession && (
                        <>
                            {/* 스트림 모니터링 */}
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            📡 실시간 스트림 모니터링
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {selectedSession.modalities.map((modality) => (
                                                <Grid item xs={12} md={6} lg={4} key={modality.type}>
                                                    <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                            {getModalityIcon(modality.type)}
                                                            <Typography variant="subtitle1" sx={{ ml: 1 }}>
                                                                {modality.type.toUpperCase()}
                                                            </Typography>
                                                            <Chip
                                                                label={modality.enabled ? '활성' : '비활성'}
                                                                color={modality.enabled ? 'success' : 'default'}
                                                                size="small"
                                                                sx={{ ml: 'auto' }}
                                                            />
                                                        </Box>
                                                        <Box sx={{ mb: 1 }}>
                                                            <Typography variant="body2" color="textSecondary">
                                                                품질: {modality.quality}
                                                            </Typography>
                                                            <Typography variant="body2" color="textSecondary">
                                                                우선순위: {modality.priority}
                                                            </Typography>
                                                        </Box>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={modality.enabled ? 85 : 0}
                                                            sx={{ height: 8, borderRadius: 4 }}
                                                        />
                                                    </Paper>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* 스트림 통계 */}
                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            📊 스트림 통계
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={generateModalityUsageData()}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="modality" />
                                                <YAxis />
                                                <RechartsTooltip />
                                                <Bar dataKey="count" fill="#8884d8" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* 품질 분석 */}
                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            🎯 품질 분석
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <RadarChart data={generatePerformanceData()}>
                                                <PolarGrid />
                                                <PolarAngleAxis dataKey="metric" />
                                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                                <Radar
                                                    name="성능"
                                                    dataKey="value"
                                                    stroke="#8884d8"
                                                    fill="#8884d8"
                                                    fillOpacity={0.6}
                                                />
                                                <RechartsTooltip />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </>
                    )}
                </Grid>
            </TabPanel>

            {/* 상호작용 탭 */}
            <TabPanel value={tabValue} index={2}>
                <Grid container spacing={3}>
                    {selectedSession && (
                        <>
                            {/* 상호작용 트렌드 */}
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            📈 상호작용 트렌드
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={generateInteractionTrendData()}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="time" />
                                                <YAxis />
                                                <RechartsTooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey="quality" stroke="#8884d8" name="품질" />
                                                <Line type="monotone" dataKey="engagement" stroke="#82ca9d" name="참여도" />
                                                <Line type="monotone" dataKey="impact" stroke="#ffc658" name="영향도" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* 최근 상호작용 */}
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            💬 최근 상호작용
                                        </Typography>
                                        <List>
                                            {selectedSession.interactions.slice(-5).map((interaction) => (
                                                <React.Fragment key={interaction.interactionId}>
                                                    <ListItem>
                                                        <ListItemIcon>
                                                            {getModalityIcon(interaction.modalities[0])}
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            primary={`참가자 ${interaction.participantId}`}
                                                            secondary={
                                                                <Box>
                                                                    <Typography variant="body2">
                                                                        모달리티: {interaction.modalities.join(', ')}
                                                                    </Typography>
                                                                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                                                        <Chip
                                                                            label={interaction.analysis.sentiment}
                                                                            color={getSentimentColor(interaction.analysis.sentiment) as any}
                                                                            size="small"
                                                                        />
                                                                        <Chip
                                                                            label={`품질: ${(interaction.analysis.quality * 100).toFixed(0)}%`}
                                                                            color="primary"
                                                                            size="small"
                                                                        />
                                                                        <Chip
                                                                            label={`참여도: ${(interaction.analysis.engagement * 100).toFixed(0)}%`}
                                                                            color="secondary"
                                                                            size="small"
                                                                        />
                                                                    </Box>
                                                                </Box>
                                                            }
                                                        />
                                                    </ListItem>
                                                    <Divider />
                                                </React.Fragment>
                                            ))}
                                        </List>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </>
                    )}
                </Grid>
            </TabPanel>

            {/* 크로스모달 분석 탭 */}
            <TabPanel value={tabValue} index={3}>
                <Grid container spacing={3}>
                    {selectedSession && (
                        <>
                            {/* 크로스모달 인사이트 */}
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            🔍 크로스모달 인사이트
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {selectedSession.analysis.crossModalInsights.map((insight) => (
                                                <Grid item xs={12} md={6} key={insight.insightId}>
                                                    <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                            <Typography variant="subtitle2" fontWeight="bold">
                                                                인사이트 #{insight.insightId.slice(-6)}
                                                            </Typography>
                                                            <Chip
                                                                label={`${(insight.confidence * 100).toFixed(0)}%`}
                                                                color="success"
                                                                size="small"
                                                            />
                                                        </Box>
                                                        <Typography variant="body2" gutterBottom>
                                                            {insight.description}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                                            {insight.modalities.map((modality) => (
                                                                <Chip
                                                                    key={modality}
                                                                    icon={getModalityIcon(modality)}
                                                                    label={modality}
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                            ))}
                                                        </Box>
                                                        <Typography variant="caption" color="textSecondary">
                                                            영향도: {(insight.impact * 100).toFixed(0)}%
                                                        </Typography>
                                                    </Paper>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* 모달리티 상관관계 */}
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            🔗 모달리티 상관관계
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {selectedSession.analysis.correlations.map((correlation) => (
                                                <Grid item xs={12} md={4} key={`${correlation.modality1}-${correlation.modality2}`}>
                                                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                                                            {getModalityIcon(correlation.modality1)}
                                                            <Typography variant="h6" sx={{ mx: 1 }}>
                                                                ↔
                                                            </Typography>
                                                            {getModalityIcon(correlation.modality2)}
                                                        </Box>
                                                        <Typography variant="h4" color="primary">
                                                            {(correlation.correlation * 100).toFixed(0)}%
                                                        </Typography>
                                                        <Chip
                                                            label={correlation.strength}
                                                            color={correlation.strength === 'strong' ? 'success' : correlation.strength === 'medium' ? 'warning' : 'default'}
                                                            size="small"
                                                        />
                                                    </Paper>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </>
                    )}
                </Grid>
            </TabPanel>

            {/* 패턴 분석 탭 */}
            <TabPanel value={tabValue} index={4}>
                <Grid container spacing={3}>
                    {selectedSession && (
                        <>
                            {/* 감지된 패턴 */}
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            🧠 감지된 패턴
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {selectedSession.analysis.patterns.map((pattern) => (
                                                <Grid item xs={12} md={6} key={pattern.patternId}>
                                                    <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                            <Typography variant="subtitle2" fontWeight="bold">
                                                                {pattern.type} 패턴
                                                            </Typography>
                                                            <Chip
                                                                label={`${(pattern.effectiveness * 100).toFixed(0)}%`}
                                                                color="success"
                                                                size="small"
                                                            />
                                                        </Box>
                                                        <Typography variant="body2" gutterBottom>
                                                            {pattern.description}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                                            {pattern.modalities.map((modality) => (
                                                                <Chip
                                                                    key={modality}
                                                                    icon={getModalityIcon(modality)}
                                                                    label={modality}
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                            ))}
                                                        </Box>
                                                        <Typography variant="caption" color="textSecondary">
                                                            빈도: {pattern.frequency}회 | 참가자: {pattern.participants.length}명
                                                        </Typography>
                                                    </Paper>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* 패턴 효과성 분석 */}
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            📊 패턴 효과성 분석
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={selectedSession.analysis.patterns}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="type" />
                                                <YAxis />
                                                <RechartsTooltip />
                                                <Bar dataKey="effectiveness" fill="#8884d8" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </>
                    )}
                </Grid>
            </TabPanel>

            {/* 설정 탭 */}
            <TabPanel value={tabValue} index={5}>
                <Grid container spacing={3}>
                    {selectedSession && (
                        <>
                            {/* 세션 설정 */}
                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            ⚙️ 세션 설정
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={selectedSession.settings.autoTranscription}
                                                        onChange={(e) => {
                                                            // 실제 구현에서는 설정 업데이트 로직 추가
                                                        }}
                                                    />
                                                }
                                                label="자동 전사"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={selectedSession.settings.emotionDetection}
                                                        onChange={(e) => {
                                                            // 실제 구현에서는 설정 업데이트 로직 추가
                                                        }}
                                                    />
                                                }
                                                label="감정 감지"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={selectedSession.settings.gestureRecognition}
                                                        onChange={(e) => {
                                                            // 실제 구현에서는 설정 업데이트 로직 추가
                                                        }}
                                                    />
                                                }
                                                label="제스처 인식"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={selectedSession.settings.attentionTracking}
                                                        onChange={(e) => {
                                                            // 실제 구현에서는 설정 업데이트 로직 추가
                                                        }}
                                                    />
                                                }
                                                label="주의력 추적"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={selectedSession.settings.qualityOptimization}
                                                        onChange={(e) => {
                                                            // 실제 구현에서는 설정 업데이트 로직 추가
                                                        }}
                                                    />
                                                }
                                                label="품질 최적화"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={selectedSession.settings.crossModalAnalysis}
                                                        onChange={(e) => {
                                                            // 실제 구현에서는 설정 업데이트 로직 추가
                                                        }}
                                                    />
                                                }
                                                label="크로스모달 분석"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={selectedSession.settings.realTimeFeedback}
                                                        onChange={(e) => {
                                                            // 실제 구현에서는 설정 업데이트 로직 추가
                                                        }}
                                                    />
                                                }
                                                label="실시간 피드백"
                                            />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* 모달리티 설정 */}
                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            📡 모달리티 설정
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            {selectedSession.modalities.map((modality) => (
                                                <Paper key={modality.type} sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        {getModalityIcon(modality.type)}
                                                        <Typography variant="subtitle2" sx={{ ml: 1 }}>
                                                            {modality.type.toUpperCase()}
                                                        </Typography>
                                                        <Switch
                                                            checked={modality.enabled}
                                                            onChange={(e) => {
                                                                // 실제 구현에서는 모달리티 활성화/비활성화 로직 추가
                                                            }}
                                                            sx={{ ml: 'auto' }}
                                                        />
                                                    </Box>
                                                    <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                                                        <InputLabel>품질</InputLabel>
                                                        <Select
                                                            value={modality.quality}
                                                            label="품질"
                                                            onChange={(e) => {
                                                                // 실제 구현에서는 품질 설정 로직 추가
                                                            }}
                                                        >
                                                            <MenuItem value="low">낮음</MenuItem>
                                                            <MenuItem value="medium">보통</MenuItem>
                                                            <MenuItem value="high">높음</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                    <FormControl fullWidth size="small">
                                                        <InputLabel>우선순위</InputLabel>
                                                        <Select
                                                            value={modality.priority}
                                                            label="우선순위"
                                                            onChange={(e) => {
                                                                // 실제 구현에서는 우선순위 설정 로직 추가
                                                            }}
                                                        >
                                                            <MenuItem value={1}>1 (최고)</MenuItem>
                                                            <MenuItem value={2}>2</MenuItem>
                                                            <MenuItem value={3}>3</MenuItem>
                                                            <MenuItem value={4}>4</MenuItem>
                                                            <MenuItem value={5}>5 (최저)</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Paper>
                                            ))}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </>
                    )}
                </Grid>
            </TabPanel>

            {/* 새 세션 생성 다이얼로그 */}
            <Dialog open={createSessionDialog} onClose={() => setCreateSessionDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>새 멀티모달 협업 세션 생성</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="세션 제목"
                            value={newSession.title}
                            onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="참가자 (쉼표로 구분)"
                            value={newSession.participants.join(', ')}
                            onChange={(e) => setNewSession({ ...newSession, participants: e.target.value.split(', ').filter(p => p.trim()) })}
                            fullWidth
                            helperText="참가자 ID를 쉼표로 구분하여 입력하세요"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={newSession.autoTranscription}
                                    onChange={(e) => setNewSession({ ...newSession, autoTranscription: e.target.checked })}
                                />
                            }
                            label="자동 전사 활성화"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={newSession.emotionDetection}
                                    onChange={(e) => setNewSession({ ...newSession, emotionDetection: e.target.checked })}
                                />
                            }
                            label="감정 감지 활성화"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={newSession.gestureRecognition}
                                    onChange={(e) => setNewSession({ ...newSession, gestureRecognition: e.target.checked })}
                                />
                            }
                            label="제스처 인식 활성화"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={newSession.attentionTracking}
                                    onChange={(e) => setNewSession({ ...newSession, attentionTracking: e.target.checked })}
                                />
                            }
                            label="주의력 추적 활성화"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateSessionDialog(false)}>취소</Button>
                    <Button onClick={handleSessionSubmit} variant="contained">생성</Button>
                </DialogActions>
            </Dialog>

            {/* 세션 상세 정보 다이얼로그 */}
            <Dialog open={sessionDetailsDialog} onClose={() => setSessionDetailsDialog(false)} maxWidth="lg" fullWidth>
                <DialogTitle>
                    세션 상세 정보: {selectedSession?.title}
                </DialogTitle>
                <DialogContent>
                    {selectedSession && (
                        <Box sx={{ mt: 1 }}>
                            <Typography variant="h6" gutterBottom>
                                세션 정보
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                세션 ID: {selectedSession.sessionId}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                참가자: {selectedSession.participants.join(', ')}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                총 상호작용: {selectedSession.metrics.totalInteractions}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                평균 품질: {(selectedSession.metrics.averageQuality * 100).toFixed(1)}%
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                참여도: {(selectedSession.metrics.engagementRate * 100).toFixed(1)}%
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                협업 효과성: {(selectedSession.metrics.collaborationEffectiveness * 100).toFixed(1)}%
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSessionDetailsDialog(false)}>닫기</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RealTimeAIMultimodalCollaborationDashboard;
