import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    LinearProgress,
    Chip,
    Grid,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Paper,
    Tabs,
    Tab,
    Switch,
    FormControlLabel,
    Slider,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Tooltip,
    IconButton
} from '@mui/material';
import {
    Psychology,
    Memory,
    Speed,
    NetworkCheck,
    Storage,
    TrendingUp,
    Settings,
    Monitor,
    Analytics,
    AutoAwesome,
    SmartToy,
    PsychologyAlt,
    Lightbulb,
    Science,
    Biotech,
    Rocket,
    Star,
    Refresh,
    PlayArrow,
    Pause,
    Stop
} from '@mui/icons-material';

interface AIEngineMetrics {
    processingSpeed: number;
    accuracy: number;
    memoryUsage: number;
    responseTime: number;
    throughput: number;
    errorRate: number;
    confidence: number;
    learningRate: number;
}

interface AIModel {
    id: string;
    name: string;
    type: string;
    accuracy: number;
    speed: number;
    memoryUsage: number;
    status: 'active' | 'training' | 'idle' | 'error';
    lastUpdated: string;
    version: string;
}

interface ProcessingPipeline {
    stage: string;
    duration: number;
    status: 'completed' | 'processing' | 'pending' | 'error';
    accuracy: number;
    confidence: number;
}

function AdvancedAIEngine() {
    const [activeTab, setActiveTab] = useState(0);
    const [metrics, setMetrics] = useState<AIEngineMetrics>({
        processingSpeed: 0,
        accuracy: 0,
        memoryUsage: 0,
        responseTime: 0,
        throughput: 0,
        errorRate: 0,
        confidence: 0,
        learningRate: 0
    });

    const [models, setModels] = useState<AIModel[]>([
        {
            id: '1',
            name: 'GPT-4 Enhanced',
            type: 'Language Model',
            accuracy: 96.5,
            speed: 850,
            memoryUsage: 45,
            status: 'active',
            lastUpdated: '2024-01-27T10:30:00Z',
            version: '4.0.1'
        },
        {
            id: '2',
            name: 'BERT-Korean',
            type: 'Embedding Model',
            accuracy: 94.2,
            speed: 1200,
            memoryUsage: 32,
            status: 'active',
            lastUpdated: '2024-01-27T09:15:00Z',
            version: '2.1.0'
        },
        {
            id: '3',
            name: 'Transformer-XL',
            type: 'Sequence Model',
            accuracy: 92.8,
            speed: 650,
            memoryUsage: 58,
            status: 'training',
            lastUpdated: '2024-01-27T08:45:00Z',
            version: '1.5.2'
        }
    ]);

    const [pipeline, setPipeline] = useState<ProcessingPipeline[]>([
        { stage: '초기 분석', duration: 50, status: 'completed', accuracy: 95.2, confidence: 0.89 },
        { stage: '컨텍스트 강화', duration: 75, status: 'completed', accuracy: 96.1, confidence: 0.92 },
        { stage: '다중 모델 생성', duration: 120, status: 'processing', accuracy: 94.8, confidence: 0.87 },
        { stage: '품질 정제', duration: 45, status: 'pending', accuracy: 0, confidence: 0 },
        { stage: '신뢰도 검증', duration: 20, status: 'pending', accuracy: 0, confidence: 0 },
        { stage: '최종 통합', duration: 15, status: 'pending', accuracy: 0, confidence: 0 }
    ]);

    const [isProcessing, setIsProcessing] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0);
    const [selectedModel, setSelectedModel] = useState('1');
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [processingHistory, setProcessingHistory] = useState<Array<{
        timestamp: string;
        input: string;
        output: string;
        model: string;
        duration: number;
        accuracy: number;
    }>>([]);

    // AI 엔진 메트릭 수집
    const collectMetrics = useCallback(async () => {
        try {
            const response = await fetch('/api/ai/engine/metrics');
            const data = await response.json();

            if (data.success) {
                setMetrics(data.metrics);
            }
        } catch (error) {
            console.error('AI 엔진 메트릭 수집 실패:', error);
        }
    }, []);

    // AI 모델 상태 업데이트
    const updateModelStatus = useCallback(async () => {
        try {
            const response = await fetch('/api/ai/models/status');
            const data = await response.json();

            if (data.success) {
                setModels(data.models);
            }
        } catch (error) {
            console.error('모델 상태 업데이트 실패:', error);
        }
    }, []);

    // AI 처리 파이프라인 실행
    const runProcessingPipeline = useCallback(async () => {
        if (!inputText.trim()) return;

        setIsProcessing(true);
        setProcessingProgress(0);
        setOutputText('');

        try {
            const response = await fetch('/api/ai/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: inputText,
                    model: selectedModel,
                    pipeline: true
                })
            });

            const data = await response.json();

            if (data.success) {
                setOutputText(data.output);

                // 처리 히스토리에 추가
                setProcessingHistory(prev => [...prev, {
                    timestamp: new Date().toISOString(),
                    input: inputText,
                    output: data.output,
                    model: selectedModel,
                    duration: data.duration,
                    accuracy: data.accuracy
                }]);

                // 파이프라인 상태 업데이트
                setPipeline(prev => prev.map(stage => ({
                    ...stage,
                    status: 'completed' as const,
                    accuracy: stage.accuracy || Math.random() * 10 + 90,
                    confidence: stage.confidence || Math.random() * 0.2 + 0.8
                })));
            }
        } catch (error) {
            console.error('AI 처리 실패:', error);
        } finally {
            setIsProcessing(false);
            setProcessingProgress(100);
        }
    }, [inputText, selectedModel]);

    // 모델 재훈련
    const retrainModel = useCallback(async (modelId: string) => {
        try {
            const response = await fetch(`/api/ai/models/${modelId}/retrain`, {
                method: 'POST'
            });

            const data = await response.json();

            if (data.success) {
                await updateModelStatus();
            }
        } catch (error) {
            console.error('모델 재훈련 실패:', error);
        }
    }, [updateModelStatus]);

    // 모델 최적화
    const optimizeModel = useCallback(async (modelId: string) => {
        try {
            const response = await fetch(`/api/ai/models/${modelId}/optimize`, {
                method: 'POST'
            });

            const data = await response.json();

            if (data.success) {
                await updateModelStatus();
            }
        } catch (error) {
            console.error('모델 최적화 실패:', error);
        }
    }, [updateModelStatus]);

    // 메트릭 모니터링
    useEffect(() => {
        const interval = setInterval(() => {
            collectMetrics();
            updateModelStatus();
        }, 5000);
        return () => clearInterval(interval);
    }, [collectMetrics, updateModelStatus]);

    // AI 성능 점수 계산
    const aiPerformanceScore = useMemo(() => {
        const weights = {
            accuracy: 0.3,
            speed: 0.2,
            confidence: 0.2,
            throughput: 0.15,
            errorRate: 0.1,
            learningRate: 0.05
        };

        const score = (
            metrics.accuracy * weights.accuracy +
            Math.min(100, metrics.processingSpeed / 10) * weights.speed +
            metrics.confidence * 100 * weights.confidence +
            Math.min(100, metrics.throughput * 10) * weights.throughput +
            (100 - metrics.errorRate * 100) * weights.errorRate +
            Math.min(100, metrics.learningRate * 100) * weights.learningRate
        );

        return Math.round(score);
    }, [metrics]);

    // AI 상태 결정
    const getAIStatus = useCallback((score: number) => {
        if (score >= 90) return { status: '최적', color: 'success' as const };
        if (score >= 70) return { status: '양호', color: 'warning' as const };
        return { status: '개선 필요', color: 'error' as const };
    }, []);

    const aiStatus = getAIStatus(aiPerformanceScore);

    const renderDashboardTab = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Monitor color="primary" />
                AI 엔진 대시보드
            </Typography>

            {/* AI 성능 점수 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5">AI 성능 점수</Typography>
                        <Chip
                            label={aiStatus.status}
                            color={aiStatus.color}
                            size="medium"
                        />
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={aiPerformanceScore}
                        sx={{ height: 20, borderRadius: 1 }}
                    />
                    <Typography variant="h3" sx={{ mt: 2, textAlign: 'center' }}>
                        {aiPerformanceScore}/100
                    </Typography>
                </CardContent>
            </Card>

            {/* AI 메트릭 */}
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Psychology color="primary" />
                                <Typography variant="h6">정확도</Typography>
                            </Box>
                            <Typography variant="h4" color="primary.main">
                                {metrics.accuracy}%
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={metrics.accuracy}
                                color="primary"
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Speed color="secondary" />
                                <Typography variant="h6">처리 속도</Typography>
                            </Box>
                            <Typography variant="h4" color="secondary.main">
                                {metrics.processingSpeed} ms
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={Math.min(100, metrics.processingSpeed / 10)}
                                color="secondary"
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Memory color="info" />
                                <Typography variant="h6">메모리 사용률</Typography>
                            </Box>
                            <Typography variant="h4" color="info.main">
                                {metrics.memoryUsage}%
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={metrics.memoryUsage}
                                color="info"
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <TrendingUp color="success" />
                                <Typography variant="h6">신뢰도</Typography>
                            </Box>
                            <Typography variant="h4" color="success.main">
                                {(metrics.confidence * 100).toFixed(1)}%
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={metrics.confidence * 100}
                                color="success"
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );

    const renderModelsTab = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SmartToy color="secondary" />
                AI 모델 관리
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>모델명</TableCell>
                            <TableCell>유형</TableCell>
                            <TableCell align="right">정확도</TableCell>
                            <TableCell align="right">속도</TableCell>
                            <TableCell align="right">메모리</TableCell>
                            <TableCell>상태</TableCell>
                            <TableCell>버전</TableCell>
                            <TableCell>액션</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {models.map((model) => (
                            <TableRow key={model.id}>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PsychologyAlt color="primary" />
                                        {model.name}
                                    </Box>
                                </TableCell>
                                <TableCell>{model.type}</TableCell>
                                <TableCell align="right">
                                    <Chip
                                        label={`${model.accuracy}%`}
                                        color={model.accuracy > 95 ? 'success' : model.accuracy > 90 ? 'warning' : 'error'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">{model.speed}ms</TableCell>
                                <TableCell align="right">{model.memoryUsage}%</TableCell>
                                <TableCell>
                                    <Chip
                                        label={model.status}
                                        color={
                                            model.status === 'active' ? 'success' :
                                                model.status === 'training' ? 'warning' :
                                                    model.status === 'idle' ? 'default' : 'error'
                                        }
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{model.version}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Tooltip title="재훈련">
                                            <IconButton
                                                size="small"
                                                onClick={() => retrainModel(model.id)}
                                                disabled={model.status === 'training'}
                                            >
                                                <Refresh />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="최적화">
                                            <IconButton
                                                size="small"
                                                onClick={() => optimizeModel(model.id)}
                                            >
                                                <Speed />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );

    const renderProcessingTab = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesome color="info" />
                AI 처리 파이프라인
            </Typography>

            {/* 입력 영역 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>AI 처리 입력</Typography>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 8 }}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="처리할 텍스트 입력"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="AI가 처리할 텍스트를 입력하세요..."
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>AI 모델 선택</InputLabel>
                                <Select
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    label="AI 모델 선택"
                                >
                                    {models.map((model) => (
                                        <MenuItem key={model.id} value={model.id}>
                                            {model.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Button
                                variant="contained"
                                fullWidth
                                onClick={runProcessingPipeline}
                                disabled={isProcessing || !inputText.trim()}
                                startIcon={isProcessing ? <CircularProgress size={20} /> : <PlayArrow />}
                            >
                                {isProcessing ? '처리 중...' : 'AI 처리 시작'}
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* 처리 진행률 */}
            {isProcessing && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>처리 진행률</Typography>
                        <LinearProgress
                            variant="determinate"
                            value={processingProgress}
                            sx={{ height: 10, borderRadius: 1 }}
                        />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            {processingProgress}% 완료
                        </Typography>
                    </CardContent>
                </Card>
            )}

            {/* 파이프라인 단계 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>처리 파이프라인</Typography>

                    <List>
                        {pipeline.map((stage, index) => (
                            <ListItem key={index}>
                                <ListItemIcon>
                                    {stage.status === 'completed' ? (
                                        <Chip label="✓" color="success" size="small" />
                                    ) : stage.status === 'processing' ? (
                                        <CircularProgress size={20} />
                                    ) : stage.status === 'error' ? (
                                        <Chip label="✗" color="error" size="small" />
                                    ) : (
                                        <Chip label="○" color="default" size="small" />
                                    )}
                                </ListItemIcon>
                                <ListItemText
                                    primary={stage.stage}
                                    secondary={`${stage.duration}ms | 정확도: ${stage.accuracy.toFixed(1)}% | 신뢰도: ${(stage.confidence * 100).toFixed(1)}%`}
                                />
                            </ListItem>
                        ))}
                    </List>
                </CardContent>
            </Card>

            {/* 출력 영역 */}
            {outputText && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>AI 처리 결과</Typography>
                        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                {outputText}
                            </Typography>
                        </Paper>
                    </CardContent>
                </Card>
            )}
        </Box>
    );

    const renderHistoryTab = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Analytics color="warning" />
                처리 히스토리
            </Typography>

            {processingHistory.length === 0 ? (
                <Alert severity="info">
                    아직 처리 히스토리가 없습니다. AI 처리를 실행해보세요.
                </Alert>
            ) : (
                <List>
                    {processingHistory.map((item, index) => (
                        <ListItem key={index}>
                            <ListItemIcon>
                                <Lightbulb color="primary" />
                            </ListItemIcon>
                            <ListItemText
                                primary={`${new Date(item.timestamp).toLocaleString()} - ${item.model}`}
                                secondary={
                                    <Box>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            <strong>입력:</strong> {item.input.substring(0, 100)}...
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            <strong>출력:</strong> {item.output.substring(0, 100)}...
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Chip label={`${item.duration}ms`} size="small" />
                                            <Chip label={`${item.accuracy}%`} size="small" color="success" />
                                        </Box>
                                    </Box>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );

    return (
        <Paper sx={{ p: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                    <Tab label="대시보드" icon={<Monitor />} />
                    <Tab label="모델 관리" icon={<SmartToy />} />
                    <Tab label="AI 처리" icon={<AutoAwesome />} />
                    <Tab label="히스토리" icon={<Analytics />} />
                </Tabs>
            </Box>

            {activeTab === 0 && renderDashboardTab()}
            {activeTab === 1 && renderModelsTab()}
            {activeTab === 2 && renderProcessingTab()}
            {activeTab === 3 && renderHistoryTab()}
        </Paper>
    );
}

export default AdvancedAIEngine;
