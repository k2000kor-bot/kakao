import React, { useState, useEffect, useCallback } from 'react';
import { aiAnalyticsApi } from '../services/api';
import {
    Box,
    Card,
    CardContent,
    Typography,
    LinearProgress,
    Chip,
    IconButton,
    Alert,
    Snackbar,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tab,
    Switch,
    FormControlLabel,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
} from '@mui/material';
import {
    SmartToy,
    Pause,
    Timeline,
    CheckCircle,
    PlayArrow,
    Visibility,
    Download,
    Speed as SpeedIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { errorLogger, toError } from '../utils/errorLogger';
import { API_BASE_URL as CONFIG_API_ORIGIN, joinApiHealthCheckUrl, AI_ANALYTICS_ROUTER_EXPORT_PATH } from '../config/api';

interface AIAnalysisData {
    id: string;
    timestamp: string;
    model: string;
    input: string;
    output: string;
    confidence: number;
    processingTime: number;
    tokens: number;
    cost: number;
    quality: number;
    sentiment: string;
    intent: string;
    entities: string[];
    categories: string[];
}

interface ModelPerformance {
    model: string;
    accuracy: number;
    speed: number;
    cost: number;
    usage: number;
    lastUpdated: string;
}

interface RealTimeMetrics {
    requestsPerSecond: number;
    averageResponseTime: number;
    activeModels: number;
    totalTokens: number;
    errorRate: number;
    successRate: number;
}

const RealTimeAIAnalytics: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState(0);
    const [analysisData, setAnalysisData] = useState<AIAnalysisData[]>([]);
    const [modelPerformance, setModelPerformance] = useState<ModelPerformance[]>([]);
    const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics>({
        requestsPerSecond: 0,
        averageResponseTime: 0,
        activeModels: 0,
        totalTokens: 0,
        errorRate: 0,
        successRate: 0
    });
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(5000);
    const [filterModel, setFilterModel] = useState('all');
    const [filterTimeRange, setFilterTimeRange] = useState('1h');
    const [selectedAnalysis, setSelectedAnalysis] = useState<AIAnalysisData | null>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);

    // 실시간 데이터 수집
    const fetchRealTimeData = useCallback(async () => {
        try {
            const [metricsResponse, analysisResponse, performanceResponse] = await Promise.all([
                aiAnalyticsApi.getMetrics(),
                aiAnalyticsApi.getRecentAnalysis(),
                aiAnalyticsApi.getModelPerformance()
            ]);

            setRealTimeMetrics(metricsResponse as RealTimeMetrics);
            setAnalysisData(analysisResponse as AIAnalysisData[]);
            setModelPerformance(performanceResponse as ModelPerformance[]);
        } catch (err) {
            const error = toError(err);
            errorLogger.error('실시간 데이터 수집 실패', error, {
                component: 'RealTimeAIAnalytics',
                action: 'fetchRealTimeData',
            });
            setError('실시간 데이터 수집 중 오류가 발생했습니다.');
        }
    }, []);

    // 자동 새로고침
    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(fetchRealTimeData, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [autoRefresh, refreshInterval, fetchRealTimeData]);

    // 초기 데이터 로드
    useEffect(() => {
        fetchRealTimeData();
    }, [fetchRealTimeData]);

    // 분석 시작/중지
    const toggleAnalysis = async () => {
        setIsAnalyzing(!isAnalyzing);
        try {
            if (!isAnalyzing) {
                await aiAnalyticsApi.startMonitoring();
            } else {
                await aiAnalyticsApi.stopMonitoring();
            }
        } catch (err) {
            setError('분석 제어 중 오류가 발생했습니다.');
            setIsAnalyzing(false);
        }
    };

    // 분석 상세 보기
    const viewAnalysisDetail = (analysis: AIAnalysisData) => {
        setSelectedAnalysis(analysis);
        setDetailDialogOpen(true);
    };

    // 데이터 내보내기
    const exportData = async () => {
        try {
            const response = await axios.get(joinApiHealthCheckUrl(CONFIG_API_ORIGIN, AI_ANALYTICS_ROUTER_EXPORT_PATH), {
                params: { format: 'csv', timeRange: filterTimeRange }
            });

            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ai-analytics-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError('데이터 내보내기 중 오류가 발생했습니다.');
        }
    };

    // 에러 닫기
    const handleErrorClose = () => {
        setError(null);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
                실시간 AI 분석 대시보드
            </Typography>

            {/* 실시간 메트릭 카드 */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                <Card sx={{ flex: '1 1 200px' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="body2" color="text.secondary">초당 요청 수</Typography>
                                <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                                    {realTimeMetrics.requestsPerSecond}
                                </Typography>
                            </Box>
                            <SpeedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                        </Box>
                    </CardContent>
                </Card>

                <Card sx={{ flex: '1 1 200px' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="body2" color="text.secondary">평균 응답 시간</Typography>
                                <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                                    {realTimeMetrics.averageResponseTime}ms
                                </Typography>
                            </Box>
                            <Timeline sx={{ fontSize: 40, color: 'success.main' }} />
                        </Box>
                    </CardContent>
                </Card>

                <Card sx={{ flex: '1 1 200px' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="body2" color="text.secondary">활성 모델</Typography>
                                <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                                    {realTimeMetrics.activeModels}
                                </Typography>
                            </Box>
                            <SmartToy sx={{ fontSize: 40, color: 'info.main' }} />
                        </Box>
                    </CardContent>
                </Card>

                <Card sx={{ flex: '1 1 200px' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="body2" color="text.secondary">성공률</Typography>
                                <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                                    {realTimeMetrics.successRate}%
                                </Typography>
                            </Box>
                            <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* 컨트롤 패널 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                            분석 제어
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={autoRefresh}
                                        onChange={(e) => setAutoRefresh(e.target.checked)}
                                    />
                                }
                                label="자동 새로고침"
                            />
                            <TextField
                                size="small"
                                label="새로고침 간격(ms)"
                                type="number"
                                value={refreshInterval}
                                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                                sx={{ width: 150 }}
                            />
                            <Button
                                variant={isAnalyzing ? "outlined" : "contained"}
                                onClick={toggleAnalysis}
                                startIcon={isAnalyzing ? <Pause /> : <PlayArrow />}
                                color={isAnalyzing ? "warning" : "primary"}
                            >
                                {isAnalyzing ? '분석 중지' : '분석 시작'}
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={exportData}
                                startIcon={<Download />}
                            >
                                데이터 내보내기
                            </Button>
                        </Box>
                    </Box>

                    {/* 필터 옵션 */}
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>모델 필터</InputLabel>
                            <Select
                                value={filterModel}
                                onChange={(e) => setFilterModel(e.target.value)}
                                label="모델 필터"
                            >
                                <MenuItem value="all">전체</MenuItem>
                                <MenuItem value="gpt-4">GPT-4</MenuItem>
                                <MenuItem value="claude">Claude</MenuItem>
                                <MenuItem value="gemini">Gemini</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>시간 범위</InputLabel>
                            <Select
                                value={filterTimeRange}
                                onChange={(e) => setFilterTimeRange(e.target.value)}
                                label="시간 범위"
                            >
                                <MenuItem value="1h">최근 1시간</MenuItem>
                                <MenuItem value="6h">최근 6시간</MenuItem>
                                <MenuItem value="24h">최근 24시간</MenuItem>
                                <MenuItem value="7d">최근 7일</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </CardContent>
            </Card>

            {/* 탭 네비게이션 */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
                    <Tab label="실시간 분석" />
                    <Tab label="모델 성능" />
                    <Tab label="상세 통계" />
                    <Tab label="AI 인사이트" />
                </Tabs>
            </Box>

            {/* 실시간 분석 탭 */}
            {selectedTab === 0 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>최근 AI 분석 결과</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>시간</TableCell>
                                        <TableCell>모델</TableCell>
                                        <TableCell>입력</TableCell>
                                        <TableCell>출력</TableCell>
                                        <TableCell>신뢰도</TableCell>
                                        <TableCell>처리 시간</TableCell>
                                        <TableCell>액션</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {analysisData.slice(0, 10).map((analysis) => (
                                        <TableRow key={analysis.id}>
                                            <TableCell>{new Date(analysis.timestamp).toLocaleTimeString()}</TableCell>
                                            <TableCell>
                                                <Chip label={analysis.model} size="small" color="primary" />
                                            </TableCell>
                                            <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {analysis.input}
                                            </TableCell>
                                            <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {analysis.output}
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={analysis.confidence}
                                                        sx={{ width: 60, height: 8 }}
                                                    />
                                                    <Typography variant="body2">{analysis.confidence}%</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{analysis.processingTime}ms</TableCell>
                                            <TableCell>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => viewAnalysisDetail(analysis)}
                                                >
                                                    <Visibility />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {/* 모델 성능 탭 */}
            {selectedTab === 1 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {modelPerformance.map((model) => (
                        <Card key={model.model} sx={{ flex: '1 1 300px' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2 }}>{model.model}</Typography>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">정확도</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={model.accuracy}
                                            sx={{ flex: 1, height: 8 }}
                                        />
                                        <Typography variant="body2">{model.accuracy}%</Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">속도</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={model.speed}
                                            sx={{ flex: 1, height: 8 }}
                                        />
                                        <Typography variant="body2">{model.speed}ms</Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">비용 효율성</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={100 - model.cost}
                                            sx={{ flex: 1, height: 8 }}
                                        />
                                        <Typography variant="body2">${model.cost}</Typography>
                                    </Box>
                                </Box>

                                <Typography variant="caption" color="text.secondary">
                                    마지막 업데이트: {new Date(model.lastUpdated).toLocaleString()}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}

            {/* 상세 분석 다이얼로그 */}
            <Dialog
                open={detailDialogOpen}
                onClose={() => setDetailDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>분석 상세 정보</DialogTitle>
                <DialogContent>
                    {selectedAnalysis && (
                        <Box>
                            <Typography variant="h6" sx={{ mb: 2 }}>기본 정보</Typography>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">모델</Typography>
                                <Typography variant="body1">{selectedAnalysis.model}</Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">입력</Typography>
                                <Typography variant="body1">{selectedAnalysis.input}</Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">출력</Typography>
                                <Typography variant="body1">{selectedAnalysis.output}</Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="h6" sx={{ mb: 2 }}>분석 결과</Typography>
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <Chip label={`신뢰도: ${selectedAnalysis.confidence}%`} color="primary" />
                                <Chip label={`감정: ${selectedAnalysis.sentiment}`} color="secondary" />
                                <Chip label={`의도: ${selectedAnalysis.intent}`} color="info" />
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">발견된 엔티티</Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                    {selectedAnalysis.entities.map((entity, index) => (
                                        <Chip key={index} label={entity} size="small" />
                                    ))}
                                </Box>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">카테고리</Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                    {selectedAnalysis.categories.map((category, index) => (
                                        <Chip key={index} label={category} size="small" variant="outlined" />
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailDialogOpen(false)}>닫기</Button>
                </DialogActions>
            </Dialog>

            {/* 에러 알림 */}
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={handleErrorClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleErrorClose} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default RealTimeAIAnalytics;
