import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Chip,
    LinearProgress,
    IconButton,
    Tooltip,
    Alert,
    AlertTitle,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
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
    Avatar,
    Badge
} from '@mui/material';
import {
    Psychology,
    TrendingUp,
    Insights,
    AutoAwesome,
    Speed,
    CheckCircle,
    Timeline,
    Assessment,
    Lightbulb,
    Warning,
    Refresh,
    Settings,
    Visibility,
    Download,
    Share
} from '@mui/icons-material';
import advancedAIIntelligenceService, {
    AIInsight,
    LearningPattern,
    PredictiveModel,
    AdaptiveResponse
} from '../../services/advancedAIIntelligenceService';
import integratedSystemAPI from '../../services/integratedSystemAPI';

interface DashboardMetrics {
    totalInsights: number;
    activeModels: number;
    learningPatterns: number;
    averageConfidence: number;
    systemPerformance: number;
}

const AdvancedAIIntelligenceDashboard: React.FC = () => {
    const [insights, setInsights] = useState<AIInsight[]>([]);
    const [patterns, setPatterns] = useState<LearningPattern[]>([]);
    const [models, setModels] = useState<PredictiveModel[]>([]);
    const [responses, setResponsive] = useState<AdaptiveResponse[]>([]);
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        totalInsights: 0,
        activeModels: 0,
        learningPatterns: 0,
        averageConfidence: 0,
        systemPerformance: 0
    });
    const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
    const [selectedModel, setSelectedModel] = useState<PredictiveModel | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);

    useEffect(() => {
        loadDashboardData();
        setupEventListeners();

        // 실시간 데이터 업데이트
        const interval = setInterval(loadDashboardData, 10000);
        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = () => {
        setInsights(advancedAIIntelligenceService.getInsights());
        setPatterns(advancedAIIntelligenceService.getLearningPatterns());
        setModels(advancedAIIntelligenceService.getPredictiveModels());
        setResponsive(advancedAIIntelligenceService.getAdaptiveResponses());

        // 메트릭 계산
        const totalInsights = insights.length;
        const activeModels = models.length;
        const learningPatterns = patterns.length;
        const averageConfidence = models.length > 0
            ? models.reduce((sum, model) => sum + model.accuracy, 0) / models.length
            : 0;
        const systemPerformance = (averageConfidence + (totalInsights > 0 ? 0.1 : 0)) * 100;

        setMetrics({
            totalInsights,
            activeModels,
            learningPatterns,
            averageConfidence,
            systemPerformance
        });
    };

    const setupEventListeners = () => {
        advancedAIIntelligenceService.on('newInsight', (insight: AIInsight) => {
            setInsights(prev => [insight, ...prev]);
        });
    };

    const handleAdvancedAnalysis = async () => {
        setIsAnalyzing(true);
        setAnalysisProgress(0);

        try {
            // 분석 진행 시뮬레이션
            for (let i = 0; i <= 100; i += 10) {
                await new Promise(resolve => setTimeout(resolve, 200));
                setAnalysisProgress(i);
            }

            // 통합 시스템을 통한 고급 분석 실행
            const result = await integratedSystemAPI.performComprehensiveAnalysis({
                type: 'advanced_ai_analysis',
                input: '사용자 입력 분석',
                context: { source: 'dashboard-analysis' }
            });

            console.log('고급 분석 결과:', result);

            // 기존 서비스도 함께 실행
            const legacyResult = await advancedAIIntelligenceService.performAdvancedAnalysis(
                '사용자 입력 분석',
                { context: 'dashboard-analysis' }
            );

            console.log('레거시 분석 결과:', legacyResult);

        } catch (error) {
            console.error('고급 분석 중 오류:', error);
        } finally {
            setIsAnalyzing(false);
            setAnalysisProgress(0);
        }
    };

    const getInsightIcon = (type: string) => {
        switch (type) {
            case 'pattern': return <Timeline />;
            case 'anomaly': return <Warning />;
            case 'prediction': return <TrendingUp />;
            case 'recommendation': return <Lightbulb />;
            default: return <Insights />;
        }
    };

    const getInsightColor = (type: string) => {
        switch (type) {
            case 'pattern': return '#2196F3';
            case 'anomaly': return '#FF9800';
            case 'prediction': return '#4CAF50';
            case 'recommendation': return '#9C27B0';
            default: return '#9E9E9E';
        }
    };

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high': return '#F44336';
            case 'medium': return '#FF9800';
            case 'low': return '#4CAF50';
            default: return '#9E9E9E';
        }
    };

    const getModelTypeIcon = (type: string) => {
        switch (type) {
            case 'classification': return <Assessment />;
            case 'regression': return <TrendingUp />;
            case 'clustering': return <Psychology />;
            case 'nlp': return <AutoAwesome />;
            default: return <Psychology />;
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{
                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold'
            }}>
                🧠 고급 AI 지능 대시보드
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                CORBU AI 시스템의 고급 지능 기능을 모니터링하고 관리합니다.
            </Typography>

            {/* 메트릭 카드 */}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }} spacing={3} sx={{ mb: 4 }}>
                <Grid sx={{ xs: 12, sm: 6, md: 2.4 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Insights color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">인사이트</Typography>
                            </Box>
                            <Typography variant="h4" color="primary">
                                {metrics.totalInsights}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                활성 인사이트
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                <Grid sx={{ xs: 12, sm: 6, md: 2.4 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Psychology color="secondary" sx={{ mr: 1 }} />
                                <Typography variant="h6">모델</Typography>
                            </Box>
                            <Typography variant="h4" color="secondary">
                                {metrics.activeModels}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                활성 모델
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                <Grid sx={{ xs: 12, sm: 6, md: 2.4 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Timeline color="success" sx={{ mr: 1 }} />
                                <Typography variant="h6">패턴</Typography>
                            </Box>
                            <Typography variant="h4" color="success">
                                {metrics.learningPatterns}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                학습 패턴
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                <Grid sx={{ xs: 12, sm: 6, md: 2.4 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <CheckCircle color="warning" sx={{ mr: 1 }} />
                                <Typography variant="h6">정확도</Typography>
                            </Box>
                            <Typography variant="h4" color="warning">
                                {(metrics.averageConfidence * 100).toFixed(1)}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                평균 정확도
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                <Grid sx={{ xs: 12, sm: 6, md: 2.4 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Speed color="info" sx={{ mr: 1 }} />
                                <Typography variant="h6">성능</Typography>
                            </Box>
                            <Typography variant="h4" color="info">
                                {metrics.systemPerformance.toFixed(1)}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                시스템 성능
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            {/* 고급 분석 섹션 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                            🔬 고급 AI 분석
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AutoAwesome />}
                            onClick={handleAdvancedAnalysis}
                            disabled={isAnalyzing}
                            sx={{
                                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)'
                                }
                            }}
                        >
                            {isAnalyzing ? '분석 중...' : '고급 분석 실행'}
                        </Button>
                    </Box>

                    {isAnalyzing && (
                        <Box sx={{ mb: 2 }}>
                            <LinearProgress
                                variant="determinate"
                                value={analysisProgress}
                                sx={{ height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                분석 진행률: {analysisProgress}%
                            </Typography>
                        </Box>
                    )}

                    <Alert severity="info">
                        <AlertTitle>💡 고급 분석 기능</AlertTitle>
                        다중 모델 분석, 패턴 인식, 실시간 인사이트 생성 등 고급 AI 기능을 제공합니다.
                    </Alert>
                </CardContent>
            </Card>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }} spacing={3}>
                {/* AI 인사이트 */}
                <Grid sx={{ xs: 12, md: 6 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                💡 AI 인사이트
                            </Typography>
                            <List>
                                {insights.slice(0, 5).map((insight, index) => (
                                    <React.Fragment key={insight.id}>
                                        <ListItem
                                            onClick={() => setSelectedInsight(insight)}
                                            sx={{ cursor: 'pointer' }}
                                        >
                                            <ListItemIcon>
                                                <Avatar sx={{ bgcolor: getInsightColor(insight.type) }}>
                                                    {getInsightIcon(insight.type)}
                                                </Avatar>
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="subtitle2">
                                                            {insight.title}
                                                        </Typography>
                                                        <Chip
                                                            label={insight.impact === 'high' ? '높음' :
                                                                insight.impact === 'medium' ? '보통' : '낮음'}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: getImpactColor(insight.impact),
                                                                color: 'white',
                                                                fontSize: '0.7rem'
                                                            }}
                                                        />
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {insight.description}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            신뢰도: {(insight.confidence * 100).toFixed(1)}%
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                        {index < Math.min(insights.length, 5) - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Box>

                {/* 예측 모델 */}
                <Grid sx={{ xs: 12, md: 6 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                🤖 예측 모델
                            </Typography>
                            <List>
                                {models.map((model, index) => (
                                    <React.Fragment key={model.id}>
                                        <ListItem
                                            onClick={() => setSelectedModel(model)}
                                            sx={{ cursor: 'pointer' }}
                                        >
                                            <ListItemIcon>
                                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                    {getModelTypeIcon(model.type)}
                                                </Avatar>
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="subtitle2">
                                                            {model.name}
                                                        </Typography>
                                                        <Chip
                                                            label={`${(model.accuracy * 100).toFixed(1)}%`}
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {model.type} • F1: {model.performance.f1Score.toFixed(3)}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            마지막 훈련: {model.lastTrained.toLocaleDateString()}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                        {index < models.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            {/* 인사이트 상세 다이얼로그 */}
            <Dialog
                open={!!selectedInsight}
                onClose={() => setSelectedInsight(null)}
                maxWidth="md"
                fullWidth
            >
                {selectedInsight && (
                    <>
                        <DialogTitle>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ bgcolor: getInsightColor(selectedInsight.type) }}>
                                    {getInsightIcon(selectedInsight.type)}
                                </Avatar>
                                {selectedInsight.title}
                            </Box>
                        </DialogTitle>
                        <DialogContent>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                {selectedInsight.description}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                <Chip
                                    label={`신뢰도: ${(selectedInsight.confidence * 100).toFixed(1)}%`}
                                    color="primary"
                                    variant="outlined"
                                />
                                <Chip
                                    label={`영향도: ${selectedInsight.impact}`}
                                    sx={{
                                        bgcolor: getImpactColor(selectedInsight.impact),
                                        color: 'white'
                                    }}
                                />
                                <Chip
                                    label={selectedInsight.category}
                                    variant="outlined"
                                />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                생성 시간: {selectedInsight.timestamp.toLocaleString()}
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setSelectedInsight(null)}>닫기</Button>
                            <Button variant="contained" startIcon={<Share />}>공유</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* 모델 상세 다이얼로그 */}
            <Dialog
                open={!!selectedModel}
                onClose={() => setSelectedModel(null)}
                maxWidth="md"
                fullWidth
            >
                {selectedModel && (
                    <>
                        <DialogTitle>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                    {getModelTypeIcon(selectedModel.type)}
                                </Avatar>
                                {selectedModel.name}
                            </Box>
                        </DialogTitle>
                        <DialogContent>
                            <TableContainer component={Paper} sx={{ mb: 2 }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>성능 지표</TableCell>
                                            <TableCell align="right">값</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>정확도</TableCell>
                                            <TableCell align="right">
                                                {(selectedModel.accuracy * 100).toFixed(2)}%
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>정밀도</TableCell>
                                            <TableCell align="right">
                                                {(selectedModel.performance.precision * 100).toFixed(2)}%
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>재현율</TableCell>
                                            <TableCell align="right">
                                                {(selectedModel.performance.recall * 100).toFixed(2)}%
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>F1 점수</TableCell>
                                            <TableCell align="right">
                                                {selectedModel.performance.f1Score.toFixed(3)}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Typography variant="body2" color="text.secondary">
                                마지막 훈련: {selectedModel.lastTrained.toLocaleString()}
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setSelectedModel(null)}>닫기</Button>
                            <Button variant="contained" startIcon={<Settings />}>설정</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default AdvancedAIIntelligenceDashboard;
