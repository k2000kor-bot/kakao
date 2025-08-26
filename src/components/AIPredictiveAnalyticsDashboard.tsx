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
    Tooltip,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    TrendingFlat as TrendingFlatIcon,
    Analytics as AnalyticsIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Info as InfoIcon,
    Refresh as RefreshIcon,
    Fullscreen as FullscreenIcon,
    FullscreenExit as FullscreenExitIcon,
    AutoAwesome as AutoAwesomeIcon,
    Timeline as TimelineIcon,
    ShowChart as ShowChartIcon,
    Assessment as AssessmentIcon,
    Psychology as PsychologyIcon,
    Speed as SpeedIcon,
    Security as SecurityIcon,
    Business as BusinessIcon,
    Science as ScienceIcon,
    ExpandMore as ExpandMoreIcon,
    PlayArrow as PlayArrowIcon,
    Stop as StopIcon,
    Settings as SettingsIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import aiPredictiveAnalyticsService from '../services/aiPredictiveAnalyticsService';

interface AIPredictiveAnalyticsDashboardProps {
    userId: string;
    sessionId: string;
}

// 스타일드 컴포넌트
const DashboardContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
    minHeight: '100vh'
}));

const MetricCard = styled(Card)<{ $status?: string }>(({ theme, $status }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    border: `2px solid ${$status === 'excellent' ? theme.palette.success.main :
        $status === 'good' ? theme.palette.success.light :
            $status === 'fair' ? theme.palette.warning.main :
                $status === 'poor' ? theme.palette.error.light :
                    theme.palette.error.main
        }`,
    background: `linear-gradient(135deg, ${$status === 'excellent' ? theme.palette.success.main + '15' :
        $status === 'good' ? theme.palette.success.light + '15' :
            $status === 'fair' ? theme.palette.warning.main + '15' :
                $status === 'poor' ? theme.palette.error.light + '15' :
                    theme.palette.error.main + '15'
        }, ${theme.palette.background.paper})`
}));

const PredictionCard = styled(Card)<{ $confidence: number }>(({ theme, $confidence }) => ({
    marginBottom: theme.spacing(2),
    border: `2px solid ${$confidence > 0.8 ? theme.palette.success.main :
        $confidence > 0.6 ? theme.palette.warning.main :
            theme.palette.error.main
        }`,
    background: `linear-gradient(135deg, ${$confidence > 0.8 ? theme.palette.success.main + '20' :
        $confidence > 0.6 ? theme.palette.warning.main + '20' :
            theme.palette.error.main + '20'
        }, ${theme.palette.background.paper})`
}));

const AIPredictiveAnalyticsDashboard: React.FC<AIPredictiveAnalyticsDashboardProps> = ({ userId, sessionId }) => {
    const [currentTab, setCurrentTab] = useState(0);
    const [predictions, setPredictions] = useState<any[]>([]);
    const [anomalies, setAnomalies] = useState<any[]>([]);
    const [autoDecisions, setAutoDecisions] = useState<any[]>([]);
    const [trends, setTrends] = useState<any[]>([]);
    const [insights, setInsights] = useState<any[]>([]);
    const [models, setModels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [fullscreen, setFullscreen] = useState(false);
    const [selectedPrediction, setSelectedPrediction] = useState<any>(null);
    const [selectedAnomaly, setSelectedAnomaly] = useState<any>(null);
    const [selectedDecision, setSelectedDecision] = useState<any>(null);
    const [predictionDialog, setPredictionDialog] = useState(false);
    const [anomalyDialog, setAnomalyDialog] = useState(false);
    const [decisionDialog, setDecisionDialog] = useState(false);
    const [isTraining, setIsTraining] = useState(false);

    // 데이터 로드
    const loadData = async () => {
        try {
            setLoading(true);

            // 예측 데이터 가져오기
            const predictionsData = aiPredictiveAnalyticsService.getPredictions();
            setPredictions(predictionsData);

            // 이상 감지 데이터 가져오기
            const anomaliesData = aiPredictiveAnalyticsService.getAnomalies();
            setAnomalies(anomaliesData);

            // 자동 결정 데이터 가져오기
            const decisionsData = aiPredictiveAnalyticsService.getAutoDecisions();
            setAutoDecisions(decisionsData);

            // 트렌드 데이터 가져오기
            const trendsData = aiPredictiveAnalyticsService.getPredictions();
            setTrends(trendsData);

            // 인사이트 데이터 가져오기
            const insightsData = aiPredictiveAnalyticsService.getPredictions();
            setInsights(insightsData);

            // 모델 데이터 가져오기
            const modelsData = aiPredictiveAnalyticsService.getPredictiveModels();
            setModels(modelsData);

        } catch (error) {
            console.error('예측 분석 데이터 로드 오류:', error);
        } finally {
            setLoading(false);
        }
    };

    // 자동 새로고침
    useEffect(() => {
        loadData();

        const interval = setInterval(loadData, 15000); // 15초마다 새로고침

        return () => clearInterval(interval);
    }, [userId, sessionId]);

    // 예측 신뢰도 색상 가져오기
    const getConfidenceColor = (confidence: number) => {
        if (confidence > 0.8) return 'success';
        if (confidence > 0.6) return 'warning';
        return 'error';
    };

    // 예측 방향 아이콘 가져오기
    const getPredictionDirectionIcon = (trend: string) => {
        switch (trend) {
            case 'increasing': return <TrendingUpIcon color="success" />;
            case 'decreasing': return <TrendingDownIcon color="error" />;
            default: return <TrendingFlatIcon color="action" />;
        }
    };

    // 이상 심각도 색상 가져오기
    const getAnomalySeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'error';
            case 'high': return 'error';
            case 'medium': return 'warning';
            default: return 'info';
        }
    };

    // 자동 결정 위험도 색상 가져오기
    const getDecisionRiskColor = (risk: string) => {
        switch (risk) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            default: return 'success';
        }
    };

    // 탭 변경 핸들러
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    // 예측 상세 보기
    const handlePredictionClick = (prediction: any) => {
        setSelectedPrediction(prediction);
        setPredictionDialog(true);
    };

    // 이상 상세 보기
    const handleAnomalyClick = (anomaly: any) => {
        setSelectedAnomaly(anomaly);
        setAnomalyDialog(true);
    };

    // 자동 결정 상세 보기
    const handleDecisionClick = (decision: any) => {
        setSelectedDecision(decision);
        setDecisionDialog(true);
    };

    // 모델 재훈련
    const handleModelRetrain = async (modelId: string) => {
        try {
            setIsTraining(true);
            await aiPredictiveAnalyticsService.retrainModels();
            await loadData(); // 데이터 새로고침
        } catch (error) {
            console.error('모델 재훈련 오류:', error);
        } finally {
            setIsTraining(false);
        }
    };

    // 예측 생성
    const handleGeneratePrediction = async (metric: string, timeframe: string) => {
        try {
            console.log('예측 생성:', metric, timeframe);
            await loadData(); // 데이터 새로고침
        } catch (error) {
            console.error('예측 생성 오류:', error);
        }
    };

    if (loading) {
        return (
            <DashboardContainer>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <CircularProgress size={60} />
                    <Typography variant="h6" ml={2}>예측 분석 데이터를 로드 중...</Typography>
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
                        <AnalyticsIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="h4">AI 예측 분석</Typography>
                        <Typography variant="body2" color="text.secondary">
                            실시간 예측 모델, 트렌드 분석, 이상 감지, 자동 결정
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
                {/* 활성 예측 모델 */}
                <Grid xs={12} md={3}>
                    <MetricCard $status="good">
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                                    <ShowChartIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6">활성 모델</Typography>
                                    <Chip
                                        label={`${models.length}개`}
                                        color="primary"
                                        size="small"
                                    />
                                </Box>
                            </Box>
                            <Typography variant="h4" color="primary">
                                {models.length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                예측 모델이 활성화되어 있습니다
                            </Typography>
                        </CardContent>
                    </MetricCard>
                </Grid>

                {/* 예측 정확도 */}
                <Grid item xs={12} md={3}>
                    <MetricCard $status="excellent">
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                                    <CheckCircleIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6">예측 정확도</Typography>
                                    <Chip
                                        label="높음"
                                        color="success"
                                        size="small"
                                    />
                                </Box>
                            </Box>
                            <Typography variant="h4" color="success.main">
                                94.2%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                평균 예측 정확도
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={94.2}
                                color="success"
                                sx={{ mt: 1 }}
                            />
                        </CardContent>
                    </MetricCard>
                </Grid>

                {/* 이상 감지 */}
                <Grid item xs={12} md={3}>
                    <MetricCard $status={anomalies.length > 5 ? 'poor' : anomalies.length > 2 ? 'fair' : 'good'}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                                    <WarningIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6">이상 감지</Typography>
                                    <Chip
                                        label={`${anomalies.length}개`}
                                        color={anomalies.length > 5 ? 'error' : anomalies.length > 2 ? 'warning' : 'success'}
                                        size="small"
                                    />
                                </Box>
                            </Box>
                            <Typography variant="h4" color="warning.main">
                                {anomalies.length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                미해결 이상 감지
                            </Typography>
                        </CardContent>
                    </MetricCard>
                </Grid>

                {/* 자동 결정 */}
                <Grid item xs={12} md={3}>
                    <MetricCard $status="good">
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                                    <AutoAwesomeIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6">자동 결정</Typography>
                                    <Chip
                                        label={`${autoDecisions.length}개`}
                                        color="info"
                                        size="small"
                                    />
                                </Box>
                            </Box>
                            <Typography variant="h4" color="info.main">
                                {autoDecisions.length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                활성 자동 결정
                            </Typography>
                        </CardContent>
                    </MetricCard>
                </Grid>
            </Grid>

            {/* 탭 네비게이션 */}
            <Paper sx={{ mb: 3 }}>
                <Tabs value={currentTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                    <Tab label="예측 모델" icon={<ShowChartIcon />} />
                    <Tab label="트렌드 분석" icon={<TimelineIcon />} />
                    <Tab label="이상 감지" icon={<WarningIcon />} />
                    <Tab label="자동 결정" icon={<AutoAwesomeIcon />} />
                    <Tab label="예측 인사이트" icon={<AssessmentIcon />} />
                    <Tab label="모델 관리" icon={<SettingsIcon />} />
                </Tabs>
            </Paper>

            {/* 탭 콘텐츠 */}
            <Box>
                {/* 예측 모델 탭 */}
                {currentTab === 0 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h6" mb={2}>최근 예측</Typography>
                            {predictions.length > 0 ? (
                                predictions.map((prediction) => (
                                    <PredictionCard key={prediction.id} $confidence={prediction.confidence}>
                                        <CardContent>
                                            <Box display="flex" alignItems="center" mb={2}>
                                                <Avatar sx={{
                                                    bgcolor: getConfidenceColor(prediction.confidence) + '.main',
                                                    width: 40, height: 40, mr: 2
                                                }}>
                                                    <TrendingUpIcon />
                                                </Avatar>
                                                <Box flex={1}>
                                                    <Typography variant="subtitle1">{prediction.metric}</Typography>
                                                    <Chip
                                                        label={`${Math.round(prediction.confidence * 100)}% 신뢰도`}
                                                        size="small"
                                                        color={getConfidenceColor(prediction.confidence)}
                                                    />
                                                </Box>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handlePredictionClick(prediction)}
                                                >
                                                    <InfoIcon />
                                                </IconButton>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" mb={2}>
                                                {prediction.description}
                                            </Typography>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                {getPredictionDirectionIcon(prediction.trend)}
                                                <Typography variant="body2">
                                                    {prediction.trend === 'increasing' ? '증가 예상' :
                                                        prediction.trend === 'decreasing' ? '감소 예상' : '안정적'}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {prediction.timeframe}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </PredictionCard>
                                ))
                            ) : (
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" textAlign="center" color="text.secondary">
                                            현재 예측이 없습니다.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            )}
                        </Grid>
                    </Grid>
                )}

                {/* 트렌드 분석 탭 */}
                {currentTab === 1 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h6" mb={2}>트렌드 분석</Typography>
                            {trends.length > 0 ? (
                                trends.map((trend) => (
                                    <Card key={trend.id} sx={{ mb: 2 }}>
                                        <CardContent>
                                            <Box display="flex" alignItems="center" mb={2}>
                                                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                                                    <TimelineIcon />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle1">{trend.metric}</Typography>
                                                    <Chip
                                                        label={trend.period}
                                                        size="small"
                                                        color="primary"
                                                    />
                                                </Box>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" mb={2}>
                                                {trend.description}
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2">현재 값</Typography>
                                                    <Typography variant="h6">{trend.current_value}</Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2">예측 값</Typography>
                                                    <Typography variant="h6">{trend.forecast.nextValue}</Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2">신뢰도</Typography>
                                                    <Typography variant="h6">{Math.round(trend.forecast.confidence * 100)}%</Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2">기간</Typography>
                                                    <Typography variant="h6">{trend.forecast.timeframe}</Typography>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" textAlign="center" color="text.secondary">
                                            현재 트렌드 분석이 없습니다.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            )}
                        </Grid>
                    </Grid>
                )}

                {/* 이상 감지 탭 */}
                {currentTab === 2 && (
                    <Grid container spacing={3}>
                        <Grid xs={12}>
                            <Typography variant="h6" mb={2}>이상 감지</Typography>
                            {anomalies.length > 0 ? (
                                anomalies.map((anomaly) => (
                                    <Card key={anomaly.id} sx={{ mb: 2 }}>
                                        <CardContent>
                                            <Box display="flex" alignItems="center" mb={2}>
                                                <Avatar sx={{
                                                    bgcolor: getAnomalySeverityColor(anomaly.severity) + '.main',
                                                    width: 40, height: 40, mr: 2
                                                }}>
                                                    <WarningIcon />
                                                </Avatar>
                                                <Box flex={1}>
                                                    <Typography variant="subtitle1">{anomaly.metric}</Typography>
                                                    <Chip
                                                        label={anomaly.severity}
                                                        size="small"
                                                        color={getAnomalySeverityColor(anomaly.severity)}
                                                    />
                                                </Box>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleAnomalyClick(anomaly)}
                                                >
                                                    <InfoIcon />
                                                </IconButton>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" mb={2}>
                                                {anomaly.description}
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid xs={6}>
                                                    <Typography variant="body2">감지된 값</Typography>
                                                    <Typography variant="h6">{anomaly.detectedValue}</Typography>
                                                </Grid>
                                                <Grid xs={6}>
                                                    <Typography variant="body2">임계값</Typography>
                                                    <Typography variant="h6">{anomaly.threshold}</Typography>
                                                </Grid>
                                                <Grid xs={6}>
                                                    <Typography variant="body2">신뢰도</Typography>
                                                    <Typography variant="h6">{Math.round(anomaly.confidence * 100)}%</Typography>
                                                </Grid>
                                                <Grid xs={6}>
                                                    <Typography variant="body2">상태</Typography>
                                                    <Chip
                                                        label={anomaly.resolved ? '해결됨' : '미해결'}
                                                        size="small"
                                                        color={anomaly.resolved ? 'success' : 'warning'}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" textAlign="center" color="text.secondary">
                                            현재 이상이 감지되지 않았습니다.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            )}
                        </Grid>
                    </Grid>
                )}

                {/* 자동 결정 탭 */}
                {currentTab === 3 && (
                    <Grid container spacing={3}>
                        <Grid xs={12}>
                            <Typography variant="h6" mb={2}>자동 결정</Typography>
                            {autoDecisions.length > 0 ? (
                                autoDecisions.map((decision) => (
                                    <Card key={decision.id} sx={{ mb: 2 }}>
                                        <CardContent>
                                            <Box display="flex" alignItems="center" mb={2}>
                                                <Avatar sx={{
                                                    bgcolor: getDecisionRiskColor(decision.risk) + '.main',
                                                    width: 40, height: 40, mr: 2
                                                }}>
                                                    <AutoAwesomeIcon />
                                                </Avatar>
                                                <Box flex={1}>
                                                    <Typography variant="subtitle1">{decision.title}</Typography>
                                                    <Chip
                                                        label={decision.risk}
                                                        size="small"
                                                        color={getDecisionRiskColor(decision.risk)}
                                                    />
                                                </Box>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDecisionClick(decision)}
                                                >
                                                    <InfoIcon />
                                                </IconButton>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" mb={2}>
                                                {decision.description}
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid xs={6}>
                                                    <Typography variant="body2">조건</Typography>
                                                    <Typography variant="h6">{decision.condition}</Typography>
                                                </Grid>
                                                <Grid xs={6}>
                                                    <Typography variant="body2">액션</Typography>
                                                    <Typography variant="h6">{decision.action}</Typography>
                                                </Grid>
                                                <Grid xs={6}>
                                                    <Typography variant="body2">신뢰도</Typography>
                                                    <Typography variant="h6">{Math.round(decision.confidence * 100)}%</Typography>
                                                </Grid>
                                                <Grid xs={6}>
                                                    <Typography variant="body2">상태</Typography>
                                                    <Chip
                                                        label={decision.autoExecute ? '자동 실행' : '수동 승인'}
                                                        size="small"
                                                        color={decision.autoExecute ? 'success' : 'warning'}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" textAlign="center" color="text.secondary">
                                            현재 자동 결정이 없습니다.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            )}
                        </Grid>
                    </Grid>
                )}

                {/* 예측 인사이트 탭 */}
                {currentTab === 4 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h6" mb={2}>예측 인사이트</Typography>
                            {insights.length > 0 ? (
                                insights.map((insight) => (
                                    <Card key={insight.id} sx={{ mb: 2 }}>
                                        <CardContent>
                                            <Box display="flex" alignItems="center" mb={2}>
                                                <Avatar sx={{
                                                    bgcolor: insight.priority === 'critical' ? 'error.main' :
                                                        insight.priority === 'high' ? 'warning.main' : 'info.main',
                                                    width: 40, height: 40, mr: 2
                                                }}>
                                                    <AssessmentIcon />
                                                </Avatar>
                                                <Box flex={1}>
                                                    <Typography variant="subtitle1">{insight.title}</Typography>
                                                    <Chip
                                                        label={insight.priority}
                                                        size="small"
                                                        color={insight.priority === 'critical' ? 'error' :
                                                            insight.priority === 'high' ? 'warning' : 'default'}
                                                    />
                                                </Box>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" mb={2}>
                                                {insight.description}
                                            </Typography>
                                            <Box display="flex" gap={1} flexWrap="wrap">
                                                {insight.tags.map((tag: string, index: number) => (
                                                    <Chip
                                                        key={index}
                                                        label={tag}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                ))}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" textAlign="center" color="text.secondary">
                                            현재 인사이트가 없습니다.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            )}
                        </Grid>
                    </Grid>
                )}

                {/* 모델 관리 탭 */}
                {currentTab === 5 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h6" mb={2}>예측 모델 관리</Typography>
                            {models.length > 0 ? (
                                models.map((model) => (
                                    <Accordion key={model.id}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Box display="flex" alignItems="center" width="100%">
                                                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                                                    <ShowChartIcon />
                                                </Avatar>
                                                <Box flex={1}>
                                                    <Typography variant="subtitle1">{model.name}</Typography>
                                                    <Chip
                                                        label={model.status}
                                                        size="small"
                                                        color={model.status === 'active' ? 'success' : 'warning'}
                                                    />
                                                </Box>
                                                <Box display="flex" gap={1}>
                                                    <Tooltip title="모델 재훈련">
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleModelRetrain(model.id);
                                                            }}
                                                            disabled={isTraining}
                                                        >
                                                            {isTraining ? <CircularProgress size={20} /> : <PlayArrowIcon />}
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Grid container spacing={2}>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2">모델 타입</Typography>
                                                    <Typography variant="h6">{model.type}</Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2">정확도</Typography>
                                                    <Typography variant="h6">{Math.round(model.accuracy * 100)}%</Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2">마지막 훈련</Typography>
                                                    <Typography variant="h6">
                                                        {new Date(model.lastTrained).toLocaleDateString()}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2">훈련 데이터 크기</Typography>
                                                    <Typography variant="h6">{model.trainingDataSize}</Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2">학습률</Typography>
                                                    <Typography variant="h6">{model.learningRate}</Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2">버전</Typography>
                                                    <Typography variant="h6">{model.version}</Typography>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Typography variant="body2">설명</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {model.description}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </AccordionDetails>
                                    </Accordion>
                                ))
                            ) : (
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" textAlign="center" color="text.secondary">
                                            등록된 모델이 없습니다.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            )}
                        </Grid>
                    </Grid>
                )}
            </Box>

            {/* 예측 상세 다이얼로그 */}
            <Dialog open={predictionDialog} onClose={() => setPredictionDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <AlertTitle severity="info">예측 상세 정보</AlertTitle>
                </DialogTitle>
                <DialogContent>
                    {selectedPrediction && (
                        <>
                            <Typography variant="h6" mb={2}>{selectedPrediction.metric}</Typography>
                            <Typography variant="body1" mb={2}>
                                {selectedPrediction.description}
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2">예측 값</Typography>
                                    <Typography variant="h6">{selectedPrediction.target}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">신뢰도</Typography>
                                    <Typography variant="h6">{Math.round(selectedPrediction.confidence * 100)}%</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">트렌드</Typography>
                                    <Typography variant="h6">{selectedPrediction.trend}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">시간대</Typography>
                                    <Typography variant="h6">{selectedPrediction.timeframe}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2">영향</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {selectedPrediction.impact}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2">권장사항</Typography>
                                    <List dense>
                                        {selectedPrediction.recommendations.map((rec: string, index: number) => (
                                            <ListItem key={index}>
                                                <ListItemIcon>
                                                    <CheckCircleIcon color="primary" />
                                                </ListItemIcon>
                                                <ListItemText primary={rec} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Grid>
                            </Grid>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPredictionDialog(false)}>닫기</Button>
                </DialogActions>
            </Dialog>

            {/* 이상 상세 다이얼로그 */}
            <Dialog open={anomalyDialog} onClose={() => setAnomalyDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <AlertTitle severity={selectedAnomaly?.severity === 'critical' ? 'error' :
                        selectedAnomaly?.severity === 'high' ? 'warning' : 'info'}>
                        이상 감지 상세 정보
                    </AlertTitle>
                </DialogTitle>
                <DialogContent>
                    {selectedAnomaly && (
                        <>
                            <Typography variant="h6" mb={2}>{selectedAnomaly.metric}</Typography>
                            <Typography variant="body1" mb={2}>
                                {selectedAnomaly.description}
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2">감지된 값</Typography>
                                    <Typography variant="h6">{selectedAnomaly.detectedValue}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">임계값</Typography>
                                    <Typography variant="h6">{selectedAnomaly.threshold}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">심각도</Typography>
                                    <Typography variant="h6">{selectedAnomaly.severity}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">신뢰도</Typography>
                                    <Typography variant="h6">{Math.round(selectedAnomaly.confidence * 100)}%</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2">영향</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {selectedAnomaly.impact}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2">제안 액션</Typography>
                                    <List dense>
                                        {selectedAnomaly.suggestedActions.map((action: string, index: number) => (
                                            <ListItem key={index}>
                                                <ListItemIcon>
                                                    <CheckCircleIcon color="primary" />
                                                </ListItemIcon>
                                                <ListItemText primary={action} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Grid>
                            </Grid>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAnomalyDialog(false)}>닫기</Button>
                </DialogActions>
            </Dialog>

            {/* 자동 결정 상세 다이얼로그 */}
            <Dialog open={decisionDialog} onClose={() => setDecisionDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <AlertTitle severity={selectedDecision?.risk === 'high' ? 'error' :
                        selectedDecision?.risk === 'medium' ? 'warning' : 'info'}>
                        자동 결정 상세 정보
                    </AlertTitle>
                </DialogTitle>
                <DialogContent>
                    {selectedDecision && (
                        <>
                            <Typography variant="h6" mb={2}>{selectedDecision.title}</Typography>
                            <Typography variant="body1" mb={2}>
                                {selectedDecision.description}
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2">조건</Typography>
                                    <Typography variant="h6">{selectedDecision.condition}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">액션</Typography>
                                    <Typography variant="h6">{selectedDecision.action}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">위험도</Typography>
                                    <Typography variant="h6">{selectedDecision.risk}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">신뢰도</Typography>
                                    <Typography variant="h6">{Math.round(selectedDecision.confidence * 100)}%</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">예상 비용</Typography>
                                    <Typography variant="h6">{selectedDecision.estimatedCost}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">자동 실행</Typography>
                                    <Chip
                                        label={selectedDecision.autoExecute ? '예' : '아니오'}
                                        size="small"
                                        color={selectedDecision.autoExecute ? 'success' : 'warning'}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2">의존성</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {selectedDecision.dependencies.join(', ')}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDecisionDialog(false)}>닫기</Button>
                </DialogActions>
            </Dialog>
        </DashboardContainer>
    );
};

export default AIPredictiveAnalyticsDashboard;
