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
    Add,
    Delete,
    Edit,
    Visibility,
    Settings,
    Timeline,
    Assessment,
    Build,
    ExpandMore,
    PlayArrow,
    Pause,
    Stop,
    Science,
    Psychology,
    Code,
    DataUsage,
    Workflow,
    Task,
    Queue,
    PriorityHigh,
    PriorityMedium,
    PriorityLow,
    CriticalPriority,
    ModelTraining,
    AutoFixHigh,
    Tune,
    Optimization,
    SmartToy,
    Psychology as PsychologyIcon,
    Science as ScienceIcon,
    Code as CodeIcon,
    DataUsage as DataUsageIcon,
    Workflow as WorkflowIcon,
    Task as TaskIcon,
    Queue as QueueIcon,
    PriorityHigh as PriorityHighIcon,
    PriorityMedium as PriorityMediumIcon,
    PriorityLow as PriorityLowIcon,
    CriticalPriority as CriticalPriorityIcon,
    ModelTraining as ModelTrainingIcon,
    AutoFixHigh as AutoFixHighIcon,
    Tune as TuneIcon,
    Optimization as OptimizationIcon,
    SmartToy as SmartToyIcon
} from '@mui/icons-material';
import ultraAdvancedAIPredictiveAnalyticsSystem, {
    PredictiveModel,
    PredictionRequest,
    PredictiveAnalyticsConfig,
    PredictiveAnalyticsMetrics
} from '../services/ultraAdvancedAIPredictiveAnalyticsSystem';

interface PredictiveAnalyticsDashboardState {
    models: PredictiveModel[];
    predictions: PredictionRequest[];
    config: PredictiveAnalyticsConfig;
    metrics: PredictiveAnalyticsMetrics;
    selectedModel: PredictiveModel | null;
    showModelDetails: boolean;
    showCreateModel: boolean;
    showPredictionHistory: boolean;
    selectedPrediction: PredictionRequest | null;
}

const UltraAdvancedAIPredictiveAnalyticsDashboard: React.FC = () => {
    const [state, setState] = useState<PredictiveAnalyticsDashboardState>({
        models: [],
        predictions: [],
        config: ultraAdvancedAIPredictiveAnalyticsSystem.getConfig(),
        metrics: ultraAdvancedAIPredictiveAnalyticsSystem.getMetrics(),
        selectedModel: null,
        showModelDetails: false,
        showCreateModel: false,
        showPredictionHistory: false,
        selectedPrediction: null
    });

    const [activeTab, setActiveTab] = useState(0);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(5000);

    // 새 모델 생성 폼 상태
    const [createForm, setCreateForm] = useState({
        id: '',
        name: '',
        description: '',
        type: 'classification' as PredictiveModel['type'],
        algorithm: '',
        features: [] as string[],
        target_variable: '',
        tags: [] as string[]
    });

    // 예측 입력 폼 상태
    const [predictionForm, setPredictionForm] = useState({
        modelId: '',
        inputData: {} as Record<string, any>
    });

    useEffect(() => {
        const updateData = () => {
            setState(prev => ({
                ...prev,
                models: ultraAdvancedAIPredictiveAnalyticsSystem.getModels(),
                predictions: ultraAdvancedAIPredictiveAnalyticsSystem.getPredictions(100),
                config: ultraAdvancedAIPredictiveAnalyticsSystem.getConfig(),
                metrics: ultraAdvancedAIPredictiveAnalyticsSystem.getMetrics()
            }));
        };

        // 초기 데이터 로드
        updateData();

        // 이벤트 리스너 등록
        const handleModelCreated = (model: PredictiveModel) => {
            setState(prev => ({
                ...prev,
                models: [...prev.models, model]
            }));
        };

        const handleModelUpdated = (model: PredictiveModel) => {
            setState(prev => ({
                ...prev,
                models: prev.models.map(m => m.id === model.id ? model : m)
            }));
        };

        const handlePredictionCompleted = (prediction: PredictionRequest) => {
            setState(prev => ({
                ...prev,
                predictions: [...prev.predictions, prediction].slice(-100)
            }));
        };

        const handleMetricsUpdated = (metrics: PredictiveAnalyticsMetrics) => {
            setState(prev => ({
                ...prev,
                metrics
            }));
        };

        ultraAdvancedAIPredictiveAnalyticsSystem.on('model_created', handleModelCreated);
        ultraAdvancedAIPredictiveAnalyticsSystem.on('model_updated', handleModelUpdated);
        ultraAdvancedAIPredictiveAnalyticsSystem.on('prediction_completed', handlePredictionCompleted);
        ultraAdvancedAIPredictiveAnalyticsSystem.on('metrics_updated', handleMetricsUpdated);

        // 자동 새로고침
        if (autoRefresh) {
            const interval = setInterval(updateData, refreshInterval);
            return () => {
                clearInterval(interval);
                ultraAdvancedAIPredictiveAnalyticsSystem.off('model_created', handleModelCreated);
                ultraAdvancedAIPredictiveAnalyticsSystem.off('model_updated', handleModelUpdated);
                ultraAdvancedAIPredictiveAnalyticsSystem.off('prediction_completed', handlePredictionCompleted);
                ultraAdvancedAIPredictiveAnalyticsSystem.off('metrics_updated', handleMetricsUpdated);
            };
        }

        return () => {
            ultraAdvancedAIPredictiveAnalyticsSystem.off('model_created', handleModelCreated);
            ultraAdvancedAIPredictiveAnalyticsSystem.off('model_updated', handleModelUpdated);
            ultraAdvancedAIPredictiveAnalyticsSystem.off('prediction_completed', handlePredictionCompleted);
            ultraAdvancedAIPredictiveAnalyticsSystem.off('metrics_updated', handleMetricsUpdated);
        };
    }, [autoRefresh, refreshInterval]);

    const handleCreateModel = async () => {
        try {
            const modelConfig: PredictiveModel = {
                id: createForm.id,
                name: createForm.name,
                type: createForm.type,
                status: 'ready',
                accuracy: Math.random() * 0.2 + 0.8,
                precision: Math.random() * 0.2 + 0.8,
                recall: Math.random() * 0.2 + 0.8,
                f1_score: Math.random() * 0.2 + 0.8,
                created_at: new Date(),
                updated_at: new Date(),
                version: '1.0.0',
                parameters: {
                    algorithm: createForm.algorithm,
                    batch_size: 32,
                    learning_rate: 0.001
                },
                features: createForm.features,
                target_variable: createForm.target_variable,
                training_data_size: Math.floor(Math.random() * 50000) + 10000,
                validation_data_size: Math.floor(Math.random() * 10000) + 2000,
                metadata: {
                    description: createForm.description,
                    author: 'CORBU.AI',
                    tags: createForm.tags,
                    performance_history: []
                }
            };

            await ultraAdvancedAIPredictiveAnalyticsSystem.createModel(modelConfig);
            setCreateForm({
                id: '',
                name: '',
                description: '',
                type: 'classification',
                algorithm: '',
                features: [],
                target_variable: '',
                tags: []
            });
            setState(prev => ({ ...prev, showCreateModel: false }));
        } catch (error) {
            console.error('모델 생성 실패:', error);
        }
    };

    const handleModelClick = (model: PredictiveModel) => {
        setState(prev => ({
            ...prev,
            selectedModel: model,
            showModelDetails: true
        }));
    };

    const handleDeployModel = async (modelId: string) => {
        try {
            await ultraAdvancedAIPredictiveAnalyticsSystem.deployModel(modelId);
        } catch (error) {
            console.error('모델 배포 실패:', error);
        }
    };

    const handleRetrainModel = async (modelId: string) => {
        try {
            await ultraAdvancedAIPredictiveAnalyticsSystem.retrainModel(modelId);
        } catch (error) {
            console.error('모델 재훈련 실패:', error);
        }
    };

    const handleMakePrediction = async () => {
        try {
            const result = await ultraAdvancedAIPredictiveAnalyticsSystem.makePrediction(
                predictionForm.modelId,
                predictionForm.inputData
            );
            console.log('예측 결과:', result);
            setPredictionForm({
                modelId: '',
                inputData: {}
            });
        } catch (error) {
            console.error('예측 실패:', error);
        }
    };

    const handleEvaluateModel = async (modelId: string) => {
        try {
            const evaluation = await ultraAdvancedAIPredictiveAnalyticsSystem.evaluateModel(modelId, []);
            console.log('모델 평가 결과:', evaluation);
        } catch (error) {
            console.error('모델 평가 실패:', error);
        }
    };

    const handleOptimizeHyperparameters = async (modelId: string) => {
        try {
            const optimization = await ultraAdvancedAIPredictiveAnalyticsSystem.optimizeHyperparameters(modelId);
            console.log('하이퍼파라미터 최적화 결과:', optimization);
        } catch (error) {
            console.error('하이퍼파라미터 최적화 실패:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ready': return 'success';
            case 'deployed': return 'primary';
            case 'training': return 'warning';
            case 'error': return 'error';
            default: return 'default';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'classification': return <PsychologyIcon />;
            case 'regression': return <TrendingUp />;
            case 'clustering': return <DataUsageIcon />;
            case 'time_series': return <Timeline />;
            case 'deep_learning': return <SmartToyIcon />;
            case 'ensemble': return <WorkflowIcon />;
            default: return <ScienceIcon />;
        }
    };

    const getAccuracyColor = (accuracy: number) => {
        if (accuracy >= 0.9) return 'success';
        if (accuracy >= 0.8) return 'primary';
        if (accuracy >= 0.7) return 'warning';
        return 'error';
    };

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Analytics color="primary" />
                고도화된 AI 예측 분석 대시보드
            </Typography>

            {/* 제어 패널 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={autoRefresh}
                                        onChange={(e) => setAutoRefresh(e.target.checked)}
                                    />
                                }
                                label="자동 새로고침"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={ultraAdvancedAIPredictiveAnalyticsSystem.isInitialized()}
                                        disabled
                                    />
                                }
                                label="예측 분석 시스템 활성"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={() => setState(prev => ({ ...prev, showCreateModel: true }))}
                                >
                                    모델 생성
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<Timeline />}
                                    onClick={() => setState(prev => ({ ...prev, showPredictionHistory: true }))}
                                >
                                    예측 기록
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<Refresh />}
                                    onClick={() => window.location.reload()}
                                >
                                    새로고침
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* 시스템 메트릭 */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                총 모델
                            </Typography>
                            <Typography variant="h4">
                                {state.metrics.total_models}
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={(state.metrics.total_models / 20) * 100}
                                sx={{ mt: 1 }}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                활성 모델
                            </Typography>
                            <Typography variant="h4">
                                {state.metrics.active_models}
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={state.metrics.total_models > 0 ? (state.metrics.active_models / state.metrics.total_models) * 100 : 0}
                                sx={{ mt: 1 }}
                                color="success"
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                평균 정확도
                            </Typography>
                            <Typography variant="h4">
                                {(state.metrics.average_accuracy * 100).toFixed(1)}%
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={state.metrics.average_accuracy * 100}
                                sx={{ mt: 1 }}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                총 예측
                            </Typography>
                            <Typography variant="h4">
                                {state.metrics.total_predictions}
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={Math.min(100, state.metrics.total_predictions / 1000)}
                                sx={{ mt: 1 }}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 탭 네비게이션 */}
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
                <Tab label="모델 관리" icon={<ModelTrainingIcon />} />
                <Tab label="예측 실행" icon={<Analytics />} />
                <Tab label="성능 분석" icon={<Assessment />} />
                <Tab label="시스템 상태" icon={<DataUsageIcon />} />
            </Tabs>

            {/* 모델 관리 탭 */}
            {activeTab === 0 && (
                <Grid container spacing={3}>
                    {state.models.map((model) => (
                        <Grid item xs={12} md={6} key={model.id}>
                            <Card
                                sx={{ cursor: 'pointer' }}
                                onClick={() => handleModelClick(model)}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {getTypeIcon(model.type)}
                                            <Typography variant="h6">
                                                {model.name}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={model.status}
                                            color={getStatusColor(model.status) as any}
                                            size="small"
                                        />
                                    </Box>
                                    <Typography color="textSecondary" gutterBottom>
                                        {model.metadata.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="body2" color="textSecondary">
                                            정확도: {(model.accuracy * 100).toFixed(1)}%
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            v{model.version}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {model.metadata.tags.map((tag, index) => (
                                            <Chip key={index} label={tag} size="small" variant="outlined" />
                                        ))}
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                        {model.status === 'ready' && (
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeployModel(model.id);
                                                }}
                                            >
                                                <PlayArrow />
                                            </IconButton>
                                        )}
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRetrainModel(model.id);
                                            }}
                                        >
                                            <Refresh />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEvaluateModel(model.id);
                                            }}
                                        >
                                            <Assessment />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOptimizeHyperparameters(model.id);
                                            }}
                                        >
                                            <Tune />
                                        </IconButton>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* 예측 실행 탭 */}
            {activeTab === 1 && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    예측 실행
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>모델 선택</InputLabel>
                                        <Select
                                            value={predictionForm.modelId}
                                            onChange={(e) => setPredictionForm(prev => ({ ...prev, modelId: e.target.value }))}
                                        >
                                            {state.models
                                                .filter(m => m.status === 'deployed' || m.status === 'ready')
                                                .map((model) => (
                                                    <MenuItem key={model.id} value={model.id}>
                                                        {model.name}
                                                    </MenuItem>
                                                ))}
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        label="입력 데이터 (JSON)"
                                        multiline
                                        rows={4}
                                        value={JSON.stringify(predictionForm.inputData, null, 2)}
                                        onChange={(e) => {
                                            try {
                                                const data = JSON.parse(e.target.value);
                                                setPredictionForm(prev => ({ ...prev, inputData: data }));
                                            } catch (error) {
                                                // JSON 파싱 오류 무시
                                            }
                                        }}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={handleMakePrediction}
                                        disabled={!predictionForm.modelId}
                                    >
                                        예측 실행
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    최근 예측 결과
                                </Typography>
                                <List>
                                    {state.predictions.slice(-5).map((prediction) => (
                                        <ListItem key={prediction.id}>
                                            <ListItemText
                                                primary={`${prediction.model_id} - ${prediction.status}`}
                                                secondary={`${prediction.timestamp.toLocaleTimeString()} - ${prediction.processing_time}ms`}
                                            />
                                            <Chip
                                                label={prediction.status}
                                                color={prediction.status === 'completed' ? 'success' : 'warning'}
                                                size="small"
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* 성능 분석 탭 */}
            {activeTab === 2 && (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    모델 성능 분석
                                </Typography>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>모델명</TableCell>
                                                <TableCell>타입</TableCell>
                                                <TableCell>정확도</TableCell>
                                                <TableCell>정밀도</TableCell>
                                                <TableCell>재현율</TableCell>
                                                <TableCell>F1 점수</TableCell>
                                                <TableCell>상태</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {state.models.map((model) => (
                                                <TableRow key={model.id}>
                                                    <TableCell>{model.name}</TableCell>
                                                    <TableCell>
                                                        <Chip label={model.type} size="small" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={`${(model.accuracy * 100).toFixed(1)}%`}
                                                            color={getAccuracyColor(model.accuracy) as any}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>{(model.precision * 100).toFixed(1)}%</TableCell>
                                                    <TableCell>{(model.recall * 100).toFixed(1)}%</TableCell>
                                                    <TableCell>{(model.f1_score * 100).toFixed(1)}%</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={model.status}
                                                            color={getStatusColor(model.status) as any}
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
            )}

            {/* 시스템 상태 탭 */}
            {activeTab === 3 && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    CPU 사용률
                                </Typography>
                                <Typography variant="h4">
                                    {(state.metrics.system_health.cpu_usage * 100).toFixed(1)}%
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={state.metrics.system_health.cpu_usage * 100}
                                    sx={{ mt: 2 }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    메모리 사용률
                                </Typography>
                                <Typography variant="h4">
                                    {(state.metrics.system_health.memory_usage * 100).toFixed(1)}%
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={state.metrics.system_health.memory_usage * 100}
                                    sx={{ mt: 2 }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    GPU 사용률
                                </Typography>
                                <Typography variant="h4">
                                    {(state.metrics.system_health.gpu_usage * 100).toFixed(1)}%
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={state.metrics.system_health.gpu_usage * 100}
                                    sx={{ mt: 2 }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    모델 로딩 시간
                                </Typography>
                                <Typography variant="h4">
                                    {state.metrics.system_health.model_loading_time.toFixed(0)}ms
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min(100, state.metrics.system_health.model_loading_time / 50)}
                                    sx={{ mt: 2 }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* 모델 상세 다이얼로그 */}
            <Dialog open={state.showModelDetails} onClose={() => setState(prev => ({ ...prev, showModelDetails: false }))} maxWidth="md" fullWidth>
                <DialogTitle>
                    모델 상세 정보
                </DialogTitle>
                <DialogContent>
                    {state.selectedModel && (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                {state.selectedModel.name}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                {state.selectedModel.metadata.description}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                버전: {state.selectedModel.version}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                작성자: {state.selectedModel.metadata.author}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                생성일: {state.selectedModel.created_at.toLocaleString()}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                수정일: {state.selectedModel.updated_at.toLocaleString()}
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    파라미터:
                                </Typography>
                                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                    <pre style={{ whiteSpace: 'pre-wrap' }}>
                                        {JSON.stringify(state.selectedModel.parameters, null, 2)}
                                    </pre>
                                </Paper>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setState(prev => ({ ...prev, showModelDetails: false }))}>
                        닫기
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 모델 생성 다이얼로그 */}
            <Dialog open={state.showCreateModel} onClose={() => setState(prev => ({ ...prev, showCreateModel: false }))} maxWidth="sm" fullWidth>
                <DialogTitle>
                    새 모델 생성
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="모델 ID"
                            value={createForm.id}
                            onChange={(e) => setCreateForm(prev => ({ ...prev, id: e.target.value }))}
                            fullWidth
                        />
                        <TextField
                            label="모델명"
                            value={createForm.name}
                            onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                            fullWidth
                        />
                        <TextField
                            label="설명"
                            value={createForm.description}
                            onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                            fullWidth
                            multiline
                            rows={2}
                        />
                        <FormControl fullWidth>
                            <InputLabel>타입</InputLabel>
                            <Select
                                value={createForm.type}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, type: e.target.value as PredictiveModel['type'] }))}
                            >
                                <MenuItem value="classification">분류</MenuItem>
                                <MenuItem value="regression">회귀</MenuItem>
                                <MenuItem value="clustering">클러스터링</MenuItem>
                                <MenuItem value="time_series">시계열</MenuItem>
                                <MenuItem value="deep_learning">딥러닝</MenuItem>
                                <MenuItem value="ensemble">앙상블</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="알고리즘"
                            value={createForm.algorithm}
                            onChange={(e) => setCreateForm(prev => ({ ...prev, algorithm: e.target.value }))}
                            fullWidth
                        />
                        <TextField
                            label="특성 (쉼표로 구분)"
                            value={createForm.features.join(', ')}
                            onChange={(e) => setCreateForm(prev => ({ ...prev, features: e.target.value.split(',').map(f => f.trim()) }))}
                            fullWidth
                        />
                        <TextField
                            label="타겟 변수"
                            value={createForm.target_variable}
                            onChange={(e) => setCreateForm(prev => ({ ...prev, target_variable: e.target.value }))}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setState(prev => ({ ...prev, showCreateModel: false }))}>
                        취소
                    </Button>
                    <Button
                        onClick={handleCreateModel}
                        variant="contained"
                    >
                        생성
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 예측 기록 다이얼로그 */}
            <Dialog open={state.showPredictionHistory} onClose={() => setState(prev => ({ ...prev, showPredictionHistory: false }))} maxWidth="lg" fullWidth>
                <DialogTitle>
                    예측 기록
                </DialogTitle>
                <DialogContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>시간</TableCell>
                                    <TableCell>모델</TableCell>
                                    <TableCell>상태</TableCell>
                                    <TableCell>처리 시간</TableCell>
                                    <TableCell>신뢰도</TableCell>
                                    <TableCell>결과</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {state.predictions.map((prediction) => (
                                    <TableRow key={prediction.id}>
                                        <TableCell>
                                            {prediction.timestamp.toLocaleTimeString()}
                                        </TableCell>
                                        <TableCell>
                                            {prediction.model_id}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={prediction.status}
                                                color={prediction.status === 'completed' ? 'success' : 'warning'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {prediction.processing_time ? `${prediction.processing_time}ms` : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {prediction.confidence ? `${(prediction.confidence * 100).toFixed(1)}%` : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" noWrap>
                                                {prediction.result ? JSON.stringify(prediction.result).substring(0, 50) + '...' : '-'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setState(prev => ({ ...prev, showPredictionHistory: false }))}>
                        닫기
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UltraAdvancedAIPredictiveAnalyticsDashboard;
