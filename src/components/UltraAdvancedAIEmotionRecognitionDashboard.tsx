import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, ListItemIcon, IconButton, Tooltip, LinearProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Switch, FormControlLabel, Accordion, AccordionSummary, AccordionDetails, Badge, Alert, TextField, InputAdornment, Tabs, Tab, Divider, CircularProgress, Slider, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Psychology, TrendingUp, TrendingDown, TrendingFlat, CheckCircle, Warning, Error, Refresh, Add, Delete, Edit, Visibility, Settings, Timeline, Assessment, Build, ExpandMore, PlayArrow, Pause, Stop, Science, Code, DataUsage, Workflow, Task, Queue, PriorityHigh, PriorityMedium, PriorityLow, CriticalPriority, ModelTraining, AutoFixHigh, Tune, Optimization, SmartToy, Psychology as PsychologyIcon, Science as ScienceIcon, Code as CodeIcon, DataUsage as DataUsageIcon, Workflow as WorkflowIcon, Task as TaskIcon, Queue as QueueIcon, PriorityHigh as PriorityHighIcon, PriorityMedium as PriorityMediumIcon, PriorityLow as PriorityLowIcon, CriticalPriority as CriticalPriorityIcon, ModelTraining as ModelTrainingIcon, AutoFixHigh as AutoFixHighIcon, Tune as TuneIcon, Optimization as OptimizationIcon, SmartToy as SmartToyIcon, SentimentSatisfied, SentimentDissatisfied, SentimentNeutral, Mood, EmojiEmotions } from '@mui/icons-material';
import ultraAdvancedAIEmotionRecognitionSystem, { EmotionData, EmotionalResponse, EmotionPattern, EmotionRecognitionConfig, EmotionRecognitionMetrics } from '../services/ultraAdvancedAIEmotionRecognitionSystem';

interface EmotionRecognitionDashboardState {
    emotionData: EmotionData[];
    emotionalResponses: EmotionalResponse[];
    emotionPatterns: EmotionPattern[];
    config: EmotionRecognitionConfig;
    metrics: EmotionRecognitionMetrics;
    isLoading: boolean;
    error: string | null;
}

const UltraAdvancedAIEmotionRecognitionDashboard: React.FC = () => {
    const [state, setState] = useState<EmotionRecognitionDashboardState>({
        emotionData: [],
        emotionalResponses: [],
        emotionPatterns: [],
        config: ultraAdvancedAIEmotionRecognitionSystem.getConfig(),
        metrics: ultraAdvancedAIEmotionRecognitionSystem.getMetrics(),
        isLoading: true,
        error: null
    });

    const [activeTab, setActiveTab] = useState(0);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(5000);
    const [selectedEmotionData, setSelectedEmotionData] = useState<EmotionData | null>(null);
    const [selectedResponse, setSelectedResponse] = useState<EmotionalResponse | null>(null);
    const [selectedPattern, setSelectedPattern] = useState<EmotionPattern | null>(null);
    const [analyzeEmotionDialog, setAnalyzeEmotionDialog] = useState(false);
    const [configDialog, setConfigDialog] = useState(false);
    const [analysisInput, setAnalysisInput] = useState('');
    const [analysisType, setAnalysisType] = useState<'text' | 'voice' | 'facial' | 'multimodal'>('text');

    useEffect(() => {
        const fetchData = () => {
            try {
                setState(prev => ({
                    ...prev,
                    emotionData: ultraAdvancedAIEmotionRecognitionSystem.getEmotionData(50),
                    emotionalResponses: ultraAdvancedAIEmotionRecognitionSystem.getEmotionalResponses(50),
                    emotionPatterns: ultraAdvancedAIEmotionRecognitionSystem.getEmotionPatterns(),
                    config: ultraAdvancedAIEmotionRecognitionSystem.getConfig(),
                    metrics: ultraAdvancedAIEmotionRecognitionSystem.getMetrics(),
                    isLoading: false,
                    error: null
                }));
            } catch (error) {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: error instanceof Error ? error.message : '데이터 로드 실패'
                }));
            }
        };

        fetchData();

        if (autoRefresh) {
            const interval = setInterval(fetchData, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [autoRefresh, refreshInterval]);

    // 이벤트 리스너 설정
    useEffect(() => {
        const handleEmotionAnalyzed = (emotionData: EmotionData) => {
            setState(prev => ({
                ...prev,
                emotionData: ultraAdvancedAIEmotionRecognitionSystem.getEmotionData(50)
            }));
        };

        const handleEmotionalResponseGenerated = (response: EmotionalResponse) => {
            setState(prev => ({
                ...prev,
                emotionalResponses: ultraAdvancedAIEmotionRecognitionSystem.getEmotionalResponses(50)
            }));
        };

        const handleMetricsUpdated = (metrics: EmotionRecognitionMetrics) => {
            setState(prev => ({
                ...prev,
                metrics
            }));
        };

        ultraAdvancedAIEmotionRecognitionSystem.on('emotion_analyzed', handleEmotionAnalyzed);
        ultraAdvancedAIEmotionRecognitionSystem.on('emotional_response_generated', handleEmotionalResponseGenerated);
        ultraAdvancedAIEmotionRecognitionSystem.on('metrics_updated', handleMetricsUpdated);

        return () => {
            ultraAdvancedAIEmotionRecognitionSystem.off('emotion_analyzed', handleEmotionAnalyzed);
            ultraAdvancedAIEmotionRecognitionSystem.off('emotional_response_generated', handleEmotionalResponseGenerated);
            ultraAdvancedAIEmotionRecognitionSystem.off('metrics_updated', handleMetricsUpdated);
        };
    }, []);

    const handleAnalyzeEmotion = async () => {
        if (!analysisInput.trim()) return;

        try {
            await ultraAdvancedAIEmotionRecognitionSystem.analyzeEmotion(
                analysisInput,
                analysisType,
                { user_id: 'dashboard-user', session_id: 'dashboard-session' }
            );
            setAnalysisInput('');
            setAnalyzeEmotionDialog(false);
        } catch (error) {
            console.error('감정 분석 실패:', error);
        }
    };

    const getEmotionIcon = (emotion: string) => {
        switch (emotion) {
            case 'joy': return <SentimentSatisfied color="success" />;
            case 'sadness': return <SentimentDissatisfied color="error" />;
            case 'anger': return <SentimentDissatisfied color="warning" />;
            case 'fear': return <SentimentDissatisfied color="error" />;
            case 'surprise': return <SentimentSatisfied color="info" />;
            case 'love': return <SentimentSatisfied color="primary" />;
            case 'confusion': return <SentimentNeutral color="default" />;
            case 'excitement': return <SentimentSatisfied color="success" />;
            case 'anxiety': return <SentimentDissatisfied color="warning" />;
            case 'relief': return <SentimentSatisfied color="success" />;
            default: return <SentimentNeutral color="default" />;
        }
    };

    const getEmotionColor = (emotion: string) => {
        switch (emotion) {
            case 'joy': return 'success';
            case 'sadness': return 'error';
            case 'anger': return 'warning';
            case 'fear': return 'error';
            case 'surprise': return 'info';
            case 'love': return 'primary';
            case 'confusion': return 'default';
            case 'excitement': return 'success';
            case 'anxiety': return 'warning';
            case 'relief': return 'success';
            default: return 'default';
        }
    };

    const getResponseTypeColor = (type: string) => {
        switch (type) {
            case 'empathic': return 'primary';
            case 'supportive': return 'success';
            case 'encouraging': return 'info';
            case 'calming': return 'warning';
            case 'celebratory': return 'success';
            case 'analytical': return 'default';
            case 'adaptive': return 'secondary';
            default: return 'default';
        }
    };

    const getToneColor = (tone: string) => {
        switch (tone) {
            case 'warm': return 'success';
            case 'professional': return 'primary';
            case 'casual': return 'info';
            case 'formal': return 'default';
            case 'friendly': return 'success';
            case 'serious': return 'warning';
            case 'playful': return 'secondary';
            default: return 'default';
        }
    };

    const formatTimestamp = (timestamp: Date) => {
        return timestamp.toLocaleString('ko-KR');
    };

    if (state.isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <EmojiEmotions color="primary" />
                고도화된 AI 감정 인식 대시보드
            </Typography>

            {/* 제어 패널 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>
                                시스템 제어
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={autoRefresh}
                                            onChange={(e) => setAutoRefresh(e.target.checked)}
                                        />
                                    }
                                    label="자동 새로고침"
                                />
                                <Button
                                    variant="outlined"
                                    startIcon={<Refresh />}
                                    onClick={() => window.location.reload()}
                                >
                                    새로고침
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<Settings />}
                                    onClick={() => setConfigDialog(true)}
                                >
                                    설정
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>
                                빠른 작업
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={() => setAnalyzeEmotionDialog(true)}
                                >
                                    감정 분석
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<Mood />}
                                    onClick={() => setAnalyzeEmotionDialog(true)}
                                >
                                    실시간 분석
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* 시스템 상태 */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                총 분석
                            </Typography>
                            <Typography variant="h4">
                                {state.metrics.total_analyses}
                            </Typography>
                            <LinearProgress 
                                variant="determinate" 
                                value={state.metrics.accuracy_rate * 100} 
                                sx={{ mt: 1 }}
                            />
                            <Typography variant="body2" color="textSecondary">
                                정확도: {(state.metrics.accuracy_rate * 100).toFixed(1)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                평균 신뢰도
                            </Typography>
                            <Typography variant="h4">
                                {(state.metrics.average_confidence * 100).toFixed(1)}%
                            </Typography>
                            <LinearProgress 
                                variant="determinate" 
                                value={state.metrics.average_confidence * 100} 
                                sx={{ mt: 1 }}
                            />
                            <Typography variant="body2" color="textSecondary">
                                응답 적절성: {(state.metrics.response_appropriateness * 100).toFixed(1)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                사용자 만족도
                            </Typography>
                            <Typography variant="h4">
                                {(state.metrics.user_satisfaction * 100).toFixed(1)}%
                            </Typography>
                            <LinearProgress 
                                variant="determinate" 
                                value={state.metrics.user_satisfaction * 100} 
                                sx={{ mt: 1 }}
                            />
                            <Typography variant="body2" color="textSecondary">
                                패턴 탐지율: {(state.metrics.pattern_detection_rate * 100).toFixed(1)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                감정 지능 점수
                            </Typography>
                            <Typography variant="h4">
                                {(state.metrics.emotional_intelligence_score * 100).toFixed(1)}%
                            </Typography>
                            <LinearProgress 
                                variant="determinate" 
                                value={state.metrics.emotional_intelligence_score * 100} 
                                sx={{ mt: 1 }}
                            />
                            <Typography variant="body2" color="textSecondary">
                                공감 수준: {(state.metrics.system_empathy_level * 100).toFixed(1)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 탭 네비게이션 */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                    <Tab label="감정 분석" />
                    <Tab label="감정적 응답" />
                    <Tab label="감정 패턴" />
                    <Tab label="성능 모니터링" />
                </Tabs>
            </Box>

            {/* 감정 분석 탭 */}
            {activeTab === 0 && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        감정 분석 결과
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>감정</TableCell>
                                    <TableCell>강도</TableCell>
                                    <TableCell>신뢰도</TableCell>
                                    <TableCell>가치</TableCell>
                                    <TableCell>각성</TableCell>
                                    <TableCell>지배성</TableCell>
                                    <TableCell>시간</TableCell>
                                    <TableCell>작업</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {state.emotionData.map((data) => (
                                    data.detected_emotions.map((emotion, index) => (
                                        <TableRow key={`${data.id}-${index}`}>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {getEmotionIcon(emotion.emotion)}
                                                    <Chip 
                                                        label={emotion.emotion} 
                                                        size="small" 
                                                        color={getEmotionColor(emotion.emotion) as any}
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="body2">
                                                        {(emotion.intensity * 100).toFixed(1)}%
                                                    </Typography>
                                                    <LinearProgress 
                                                        variant="determinate" 
                                                        value={emotion.intensity * 100} 
                                                        sx={{ width: 60, height: 6 }}
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="body2">
                                                        {(emotion.confidence * 100).toFixed(1)}%
                                                    </Typography>
                                                    <LinearProgress 
                                                        variant="determinate" 
                                                        value={emotion.confidence * 100} 
                                                        sx={{ width: 60, height: 6 }}
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {emotion.valence.toFixed(2)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {emotion.arousal.toFixed(2)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {emotion.dominance.toFixed(2)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {formatTimestamp(data.timestamp)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => setSelectedEmotionData(data)}
                                                >
                                                    <Visibility />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* 감정적 응답 탭 */}
            {activeTab === 1 && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        감정적 응답 목록
                    </Typography>
                    <Grid container spacing={2}>
                        {state.emotionalResponses.map((response) => (
                            <Grid item xs={12} md={6} lg={4} key={response.id}>
                                <Card>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Chip 
                                                label={response.response_type} 
                                                size="small" 
                                                color={getResponseTypeColor(response.response_type) as any}
                                            />
                                            <Chip 
                                                label={response.tone} 
                                                size="small" 
                                                color={getToneColor(response.tone) as any}
                                                variant="outlined"
                                            />
                                        </Box>
                                        <Typography variant="body2" gutterBottom>
                                            {response.content}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary" gutterBottom>
                                            {formatTimestamp(response.generated_at)}
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                            <Box>
                                                <Typography variant="body2" color="textSecondary">
                                                    감정 지능: {(response.emotional_intelligence_score * 100).toFixed(1)}%
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    적절성: {(response.appropriateness_score * 100).toFixed(1)}%
                                                </Typography>
                                            </Box>
                                            <IconButton 
                                                size="small"
                                                onClick={() => setSelectedResponse(response)}
                                            >
                                                <Visibility />
                                            </IconButton>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* 감정 패턴 탭 */}
            {activeTab === 2 && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        감정 패턴 분석
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>패턴 타입</TableCell>
                                    <TableCell>주요 감정</TableCell>
                                    <TableCell>빈도</TableCell>
                                    <TableCell>강도 트렌드</TableCell>
                                    <TableCell>트리거</TableCell>
                                    <TableCell>생성일</TableCell>
                                    <TableCell>작업</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {state.emotionPatterns.map((pattern) => (
                                    <TableRow key={pattern.id}>
                                        <TableCell>
                                            <Chip 
                                                label={pattern.pattern_type} 
                                                size="small" 
                                                color="primary" 
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                {pattern.emotions.slice(0, 3).map((emotion, index) => (
                                                    <Chip 
                                                        key={index}
                                                        label={emotion.emotion} 
                                                        size="small" 
                                                        color={getEmotionColor(emotion.emotion) as any}
                                                    />
                                                ))}
                                                {pattern.emotions.length > 3 && (
                                                    <Chip 
                                                        label={`+${pattern.emotions.length - 3}`} 
                                                        size="small" 
                                                        variant="outlined"
                                                    />
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {(pattern.frequency * 100).toFixed(1)}%
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={pattern.intensity_trend} 
                                                size="small" 
                                                color={
                                                    pattern.intensity_trend === 'increasing' ? 'error' :
                                                    pattern.intensity_trend === 'decreasing' ? 'success' :
                                                    pattern.intensity_trend === 'fluctuating' ? 'warning' : 'default'
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                {pattern.triggers.slice(0, 2).map((trigger, index) => (
                                                    <Chip 
                                                        key={index}
                                                        label={trigger} 
                                                        size="small" 
                                                        variant="outlined"
                                                    />
                                                ))}
                                                {pattern.triggers.length > 2 && (
                                                    <Chip 
                                                        label={`+${pattern.triggers.length - 2}`} 
                                                        size="small" 
                                                        variant="outlined"
                                                    />
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {formatTimestamp(pattern.created_at)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton 
                                                size="small" 
                                                onClick={() => setSelectedPattern(pattern)}
                                            >
                                                <Visibility />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* 성능 모니터링 탭 */}
            {activeTab === 3 && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        성능 메트릭
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        분석 성능
                                    </Typography>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="textSecondary">
                                            정확도
                                        </Typography>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={state.metrics.accuracy_rate * 100} 
                                            sx={{ height: 10, borderRadius: 5 }}
                                        />
                                        <Typography variant="h6">
                                            {(state.metrics.accuracy_rate * 100).toFixed(1)}%
                                        </Typography>
                                    </Box>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="textSecondary">
                                            평균 신뢰도
                                        </Typography>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={state.metrics.average_confidence * 100} 
                                            sx={{ height: 10, borderRadius: 5 }}
                                        />
                                        <Typography variant="h6">
                                            {(state.metrics.average_confidence * 100).toFixed(1)}%
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="textSecondary">
                                            패턴 탐지율
                                        </Typography>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={state.metrics.pattern_detection_rate * 100} 
                                            sx={{ height: 10, borderRadius: 5 }}
                                        />
                                        <Typography variant="h6">
                                            {(state.metrics.pattern_detection_rate * 100).toFixed(1)}%
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        응답 품질
                                    </Typography>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="textSecondary">
                                            응답 적절성
                                        </Typography>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={state.metrics.response_appropriateness * 100} 
                                            sx={{ height: 10, borderRadius: 5 }}
                                        />
                                        <Typography variant="h6">
                                            {(state.metrics.response_appropriateness * 100).toFixed(1)}%
                                        </Typography>
                                    </Box>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="textSecondary">
                                            사용자 만족도
                                        </Typography>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={state.metrics.user_satisfaction * 100} 
                                            sx={{ height: 10, borderRadius: 5 }}
                                        />
                                        <Typography variant="h6">
                                            {(state.metrics.user_satisfaction * 100).toFixed(1)}%
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="textSecondary">
                                            감정 지능 점수
                                        </Typography>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={state.metrics.emotional_intelligence_score * 100} 
                                            sx={{ height: 10, borderRadius: 5 }}
                                        />
                                        <Typography variant="h6">
                                            {(state.metrics.emotional_intelligence_score * 100).toFixed(1)}%
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {/* 다이얼로그들 */}
            {/* 감정 분석 다이얼로그 */}
            <Dialog open={analyzeEmotionDialog} onClose={() => setAnalyzeEmotionDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>감정 분석</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="분석할 내용"
                        multiline
                        rows={4}
                        value={analysisInput}
                        onChange={(e) => setAnalysisInput(e.target.value)}
                        placeholder="감정을 분석할 텍스트, 음성, 또는 이미지를 입력하세요..."
                        sx={{ mb: 2, mt: 1 }}
                    />
                    <FormControl fullWidth>
                        <InputLabel>분석 타입</InputLabel>
                        <Select
                            value={analysisType}
                            label="분석 타입"
                            onChange={(e) => setAnalysisType(e.target.value as any)}
                        >
                            <MenuItem value="text">텍스트</MenuItem>
                            <MenuItem value="voice">음성</MenuItem>
                            <MenuItem value="facial">표정</MenuItem>
                            <MenuItem value="multimodal">멀티모달</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAnalyzeEmotionDialog(false)}>취소</Button>
                    <Button 
                        variant="contained"
                        onClick={handleAnalyzeEmotion}
                        disabled={!analysisInput.trim()}
                    >
                        분석
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 설정 다이얼로그 */}
            <Dialog open={configDialog} onClose={() => setConfigDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>감정 인식 설정</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={state.config.enable_multimodal}
                                        onChange={(e) => {
                                            const newConfig = { ...state.config, enable_multimodal: e.target.checked };
                                            ultraAdvancedAIEmotionRecognitionSystem.updateConfig(newConfig);
                                            setState(prev => ({ ...prev, config: newConfig }));
                                        }}
                                    />
                                }
                                label="멀티모달 지원"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={state.config.enable_real_time}
                                        onChange={(e) => {
                                            const newConfig = { ...state.config, enable_real_time: e.target.checked };
                                            ultraAdvancedAIEmotionRecognitionSystem.updateConfig(newConfig);
                                            setState(prev => ({ ...prev, config: newConfig }));
                                        }}
                                    />
                                }
                                label="실시간 분석"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={state.config.enable_pattern_analysis}
                                        onChange={(e) => {
                                            const newConfig = { ...state.config, enable_pattern_analysis: e.target.checked };
                                            ultraAdvancedAIEmotionRecognitionSystem.updateConfig(newConfig);
                                            setState(prev => ({ ...prev, config: newConfig }));
                                        }}
                                    />
                                }
                                label="패턴 분석"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={state.config.enable_emotional_response}
                                        onChange={(e) => {
                                            const newConfig = { ...state.config, enable_emotional_response: e.target.checked };
                                            ultraAdvancedAIEmotionRecognitionSystem.updateConfig(newConfig);
                                            setState(prev => ({ ...prev, config: newConfig }));
                                        }}
                                    />
                                }
                                label="감정적 응답"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={state.config.enable_empathy_learning}
                                        onChange={(e) => {
                                            const newConfig = { ...state.config, enable_empathy_learning: e.target.checked };
                                            ultraAdvancedAIEmotionRecognitionSystem.updateConfig(newConfig);
                                            setState(prev => ({ ...prev, config: newConfig }));
                                        }}
                                    />
                                }
                                label="공감 학습"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={state.config.privacy_mode}
                                        onChange={(e) => {
                                            const newConfig = { ...state.config, privacy_mode: e.target.checked };
                                            ultraAdvancedAIEmotionRecognitionSystem.updateConfig(newConfig);
                                            setState(prev => ({ ...prev, config: newConfig }));
                                        }}
                                    />
                                }
                                label="개인정보 보호 모드"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfigDialog(false)}>닫기</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UltraAdvancedAIEmotionRecognitionDashboard;
