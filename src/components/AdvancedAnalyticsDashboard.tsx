import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    LinearProgress,
    Chip,
    IconButton,
    Tooltip,
    Alert,
    Snackbar,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tab
} from '@mui/material';
import {
    Analytics,
    TrendingUp,
    TrendingDown,
    People,
    Speed,
    Psychology,
    Business,
    Assessment,
    Download,
    Refresh,
    Visibility,
    Insights,
    Timeline,
    BarChart,
    PieChart,
    ShowChart,
    GetApp,
    FileDownload,
    Schedule,
    Warning,
    CheckCircle,
    Error
} from '@mui/icons-material';
import axios from 'axios';
import { errorLogger } from '../utils/errorLogger';

const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to safely convert unknown error types to Error objects
const toError = (err: unknown): Error => {
    if (err instanceof Error) {
        return err as Error;
    }
    // Error 생성자를 명시적으로 사용
    const ErrorConstructor = globalThis.Error;
    return new ErrorConstructor(String(err));
};

interface AnalyticsOverview {
    total_users: number;
    active_sessions: number;
    total_interactions: number;
    ai_accuracy: number;
    system_uptime: number;
    avg_response_time: number;
    error_rate: number;
    user_satisfaction: number;
    revenue_growth: number;
    cost_reduction: number;
}

interface UserBehaviorData {
    date: string;
    active_users: number;
    new_users: number;
    session_duration: number;
    page_views: number;
    bounce_rate: number;
    conversion_rate: number;
}

interface AIModelPerformance {
    model_name: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    inference_time: number;
    throughput: number;
    memory_usage: number;
    cost_per_request: number;
}

interface BusinessMetrics {
    month: string;
    revenue: number;
    costs: number;
    profit: number;
    customer_acquisition: number;
    customer_retention: number;
    market_share: number;
    roi: number;
}

interface Predictions {
    user_growth: {
        current: number;
        predicted_1m: number;
        predicted_3m: number;
        confidence: number;
    };
    revenue_forecast: {
        current_month: number;
        next_month: number;
        next_quarter: number;
        confidence: number;
    };
    system_load: {
        current: number;
        predicted_peak: number;
        scaling_recommendation: string;
        confidence: number;
    };
    ai_performance: {
        accuracy_trend: string;
        predicted_accuracy: number;
        optimization_potential: number;
        confidence: number;
    };
}

const AdvancedAnalyticsDashboard: React.FC = () => {
    const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
    const [userBehavior, setUserBehavior] = useState<UserBehaviorData[]>([]);
    const [aiPerformance, setAiPerformance] = useState<AIModelPerformance[]>([]);
    const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics[]>([]);
    const [predictions, setPredictions] = useState<Predictions | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState(0);
    const [customReportDialog, setCustomReportDialog] = useState(false);
    const [reportConfig, setReportConfig] = useState({
        type: 'summary',
        metrics: [] as string[],
        period: '7d'
    });

    // 데이터 로드
    useEffect(() => {
        loadAnalyticsData();
    }, []);

    const loadAnalyticsData = async () => {
        try {
            setLoading(true);
            
            // 병렬로 모든 데이터 로드
            const [overviewRes, behaviorRes, aiRes, businessRes, predictionsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/analytics/overview`),
                axios.get(`${API_BASE_URL}/analytics/user-behavior?period=30d`),
                axios.get(`${API_BASE_URL}/analytics/ai-performance`),
                axios.get(`${API_BASE_URL}/analytics/business-metrics`),
                axios.get(`${API_BASE_URL}/analytics/predictions`)
            ]);

            if (overviewRes.data.success) setOverview(overviewRes.data.data);
            if (behaviorRes.data.success) setUserBehavior(behaviorRes.data.data.metrics);
            if (aiRes.data.success) setAiPerformance(aiRes.data.data.models);
            if (businessRes.data.success) setBusinessMetrics(businessRes.data.data.monthly_metrics);
            if (predictionsRes.data.success) setPredictions(predictionsRes.data.data);

        } catch (err) {
            setError('분석 데이터를 불러오는 중 오류가 발생했습니다.');
            const error = toError(err);
            errorLogger.error('Analytics data loading error', error, {
                component: 'AdvancedAnalyticsDashboard',
                action: 'loadAnalyticsData',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        loadAnalyticsData();
    };

    const handleGenerateCustomReport = async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/analytics/custom-report`, reportConfig);
            if (response.data.success) {
                setError(null);
                setCustomReportDialog(false);
                // 성공 알림 표시
            }
        } catch (err) {
            setError('커스텀 리포트 생성 중 오류가 발생했습니다.');
        }
    };

    const handleExportReport = async (format: string) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/analytics/export/RPT_123?format=${format}`);
            if (response.data.success) {
                // 다운로드 링크 생성
                const link = document.createElement('a');
                link.href = response.data.data.download_url;
                link.download = `analytics_report.${format}`;
                link.click();
            }
        } catch (err) {
            setError('리포트 내보내기 중 오류가 발생했습니다.');
        }
    };

    const getTrendIcon = (value: number, threshold: number = 0) => {
        return value > threshold ? <TrendingUp color="success" /> : <TrendingDown color="error" />;
    };

    const getStatusColor = (value: number, good: number, warning: number) => {
        if (value >= good) return 'success';
        if (value >= warning) return 'warning';
        return 'error';
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <LinearProgress sx={{ width: 200, mb: 2 }} />
                    <Typography variant="h6">분석 데이터를 불러오는 중...</Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* 헤더 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Analytics sx={{ fontSize: 32, color: 'primary.main' }} />
                    <Typography variant="h4" fontWeight="bold">
                        고급 분석 대시보드
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="데이터 새로고침">
                        <IconButton onClick={handleRefresh} color="primary">
                            <Refresh />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant="outlined"
                        startIcon={<Assessment />}
                        onClick={() => setCustomReportDialog(true)}
                    >
                        커스텀 리포트
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<GetApp />}
                        onClick={() => handleExportReport('pdf')}
                    >
                        리포트 내보내기
                    </Button>
                </Box>
            </Box>

            {/* 탭 네비게이션 */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
                    <Tab label="개요" icon={<Assessment />} />
                    <Tab label="사용자 행동" icon={<People />} />
                    <Tab label="AI 성능" icon={<Psychology />} />
                    <Tab label="비즈니스 메트릭" icon={<Business />} />
                    <Tab label="예측 분석" icon={<Timeline />} />
                </Tabs>
            </Box>

            {/* 개요 탭 */}
            {selectedTab === 0 && overview && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                    <Card sx={{ flex: '1 1 300px' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold">총 사용자</Typography>
                                {getTrendIcon(overview.total_users, 1000)}
                            </Box>
                            <Typography variant="h3" color="primary.main" fontWeight="bold">
                                {overview.total_users.toLocaleString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                활성 세션: {overview.active_sessions}개
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card sx={{ flex: '1 1 300px' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold">AI 정확도</Typography>
                                {getTrendIcon(overview.ai_accuracy, 90)}
                            </Box>
                            <Typography variant="h3" color="success.main" fontWeight="bold">
                                {overview.ai_accuracy}%
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={overview.ai_accuracy}
                                sx={{ mt: 1, height: 8, borderRadius: 4 }}
                            />
                        </CardContent>
                    </Card>

                    <Card sx={{ flex: '1 1 300px' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold">시스템 가동률</Typography>
                                {getTrendIcon(overview.system_uptime, 95)}
                            </Box>
                            <Typography variant="h3" color="success.main" fontWeight="bold">
                                {overview.system_uptime}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                평균 응답 시간: {overview.avg_response_time}ms
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card sx={{ flex: '1 1 300px' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold">사용자 만족도</Typography>
                                {getTrendIcon(overview.user_satisfaction, 4.0)}
                            </Box>
                            <Typography variant="h3" color="primary.main" fontWeight="bold">
                                {overview.user_satisfaction}/5.0
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                총 상호작용: {overview.total_interactions.toLocaleString()}회
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card sx={{ flex: '1 1 300px' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold">매출 성장</Typography>
                                {getTrendIcon(overview.revenue_growth, 10)}
                            </Box>
                            <Typography variant="h3" color="success.main" fontWeight="bold">
                                +{overview.revenue_growth}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                비용 절감: {overview.cost_reduction}%
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card sx={{ flex: '1 1 300px' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold">오류율</Typography>
                                <Chip
                                    label={overview.error_rate < 1 ? '낮음' : overview.error_rate < 3 ? '보통' : '높음'}
                                    color={getStatusColor(overview.error_rate, 1, 3) as any}
                                    size="small"
                                />
                            </Box>
                            <Typography variant="h3" color={getStatusColor(overview.error_rate, 1, 3) === 'success' ? 'success.main' : 'error.main'} fontWeight="bold">
                                {overview.error_rate}%
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={Math.min(overview.error_rate * 20, 100)}
                                color={getStatusColor(overview.error_rate, 1, 3) as any}
                                sx={{ mt: 1, height: 8, borderRadius: 4 }}
                            />
                        </CardContent>
                    </Card>
                </Box>
            )}

            {/* 사용자 행동 탭 */}
            {selectedTab === 1 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" mb={2}>
                            사용자 행동 분석 (최근 30일)
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>날짜</TableCell>
                                        <TableCell align="right">활성 사용자</TableCell>
                                        <TableCell align="right">신규 사용자</TableCell>
                                        <TableCell align="right">세션 시간(분)</TableCell>
                                        <TableCell align="right">페이지 뷰</TableCell>
                                        <TableCell align="right">이탈률(%)</TableCell>
                                        <TableCell align="right">전환율(%)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {userBehavior.slice(0, 10).map((data, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{data.date}</TableCell>
                                            <TableCell align="right">{data.active_users}</TableCell>
                                            <TableCell align="right">{data.new_users}</TableCell>
                                            <TableCell align="right">{data.session_duration}</TableCell>
                                            <TableCell align="right">{data.page_views}</TableCell>
                                            <TableCell align="right">{data.bounce_rate}</TableCell>
                                            <TableCell align="right">{data.conversion_rate}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {/* AI 성능 탭 */}
            {selectedTab === 2 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" mb={2}>
                            AI 모델 성능 분석
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>모델명</TableCell>
                                        <TableCell align="right">정확도(%)</TableCell>
                                        <TableCell align="right">정밀도(%)</TableCell>
                                        <TableCell align="right">재현율(%)</TableCell>
                                        <TableCell align="right">F1 점수</TableCell>
                                        <TableCell align="right">추론 시간(ms)</TableCell>
                                        <TableCell align="right">처리량</TableCell>
                                        <TableCell align="right">메모리 사용량(GB)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {aiPerformance.map((model, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Psychology color="primary" />
                                                    {model.model_name}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                                                    {model.accuracy}%
                                                    {getTrendIcon(model.accuracy, 90)}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">{model.precision}%</TableCell>
                                            <TableCell align="right">{model.recall}%</TableCell>
                                            <TableCell align="right">{model.f1_score}</TableCell>
                                            <TableCell align="right">{model.inference_time}</TableCell>
                                            <TableCell align="right">{model.throughput}</TableCell>
                                            <TableCell align="right">{model.memory_usage}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {/* 비즈니스 메트릭 탭 */}
            {selectedTab === 3 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" mb={2}>
                            비즈니스 메트릭 (월별)
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>월</TableCell>
                                        <TableCell align="right">매출</TableCell>
                                        <TableCell align="right">비용</TableCell>
                                        <TableCell align="right">이익</TableCell>
                                        <TableCell align="right">고객 획득</TableCell>
                                        <TableCell align="right">고객 유지율(%)</TableCell>
                                        <TableCell align="right">시장 점유율(%)</TableCell>
                                        <TableCell align="right">ROI(%)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {businessMetrics.slice(0, 12).map((data, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{data.month}</TableCell>
                                            <TableCell align="right">${data.revenue.toLocaleString()}</TableCell>
                                            <TableCell align="right">${data.costs.toLocaleString()}</TableCell>
                                            <TableCell align="right">${data.profit.toLocaleString()}</TableCell>
                                            <TableCell align="right">{data.customer_acquisition}</TableCell>
                                            <TableCell align="right">{data.customer_retention}%</TableCell>
                                            <TableCell align="right">{data.market_share}%</TableCell>
                                            <TableCell align="right">
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                                                    {data.roi}%
                                                    {getTrendIcon(data.roi, 20)}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {/* 예측 분석 탭 */}
            {selectedTab === 4 && predictions && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Card sx={{ flex: '1 1 300px' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" mb={2}>
                                사용자 성장 예측
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">현재</Typography>
                                <Typography variant="h4" fontWeight="bold">{predictions.user_growth.current.toLocaleString()}</Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">1개월 후 예측</Typography>
                                <Typography variant="h4" fontWeight="bold" color="primary.main">
                                    {predictions.user_growth.predicted_1m.toLocaleString()}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">3개월 후 예측</Typography>
                                <Typography variant="h4" fontWeight="bold" color="success.main">
                                    {predictions.user_growth.predicted_3m.toLocaleString()}
                                </Typography>
                            </Box>
                            <Chip
                                label={`신뢰도: ${predictions.user_growth.confidence}%`}
                                color="primary"
                                size="small"
                            />
                        </CardContent>
                    </Card>

                    <Card sx={{ flex: '1 1 300px' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" mb={2}>
                                매출 예측
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">이번 달</Typography>
                                <Typography variant="h4" fontWeight="bold">
                                    ${predictions.revenue_forecast.current_month.toLocaleString()}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">다음 달 예측</Typography>
                                <Typography variant="h4" fontWeight="bold" color="primary.main">
                                    ${predictions.revenue_forecast.next_month.toLocaleString()}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">다음 분기 예측</Typography>
                                <Typography variant="h4" fontWeight="bold" color="success.main">
                                    ${predictions.revenue_forecast.next_quarter.toLocaleString()}
                                </Typography>
                            </Box>
                            <Chip
                                label={`신뢰도: ${predictions.revenue_forecast.confidence}%`}
                                color="primary"
                                size="small"
                            />
                        </CardContent>
                    </Card>

                    <Card sx={{ flex: '1 1 300px' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" mb={2}>
                                시스템 부하 예측
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">현재 부하</Typography>
                                <Typography variant="h4" fontWeight="bold">{predictions.system_load.current}%</Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={predictions.system_load.current}
                                    sx={{ mt: 1, height: 8, borderRadius: 4 }}
                                />
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">예상 최대 부하</Typography>
                                <Typography variant="h4" fontWeight="bold" color="warning.main">
                                    {predictions.system_load.predicted_peak}%
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">권장사항</Typography>
                                <Chip
                                    label={predictions.system_load.scaling_recommendation}
                                    color={predictions.system_load.scaling_recommendation === 'Scale Up' ? 'error' : 'success'}
                                />
                            </Box>
                        </CardContent>
                    </Card>

                    <Card sx={{ flex: '1 1 300px' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" mb={2}>
                                AI 성능 예측
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">정확도 트렌드</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="h4" fontWeight="bold">
                                        {predictions.ai_performance.accuracy_trend}
                                    </Typography>
                                    {predictions.ai_performance.accuracy_trend === 'Improving' ? 
                                        <TrendingUp color="success" /> : 
                                        <TrendingDown color="error" />
                                    }
                                </Box>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">예측 정확도</Typography>
                                <Typography variant="h4" fontWeight="bold" color="primary.main">
                                    {predictions.ai_performance.predicted_accuracy}%
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">최적화 잠재력</Typography>
                                <Typography variant="h4" fontWeight="bold" color="success.main">
                                    +{predictions.ai_performance.optimization_potential}%
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            )}

            {/* 커스텀 리포트 다이얼로그 */}
            <Dialog open={customReportDialog} onClose={() => setCustomReportDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>커스텀 리포트 생성</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>리포트 유형</InputLabel>
                            <Select
                                value={reportConfig.type}
                                onChange={(e) => setReportConfig({...reportConfig, type: e.target.value})}
                            >
                                <MenuItem value="summary">요약 리포트</MenuItem>
                                <MenuItem value="detailed">상세 리포트</MenuItem>
                                <MenuItem value="comparative">비교 분석</MenuItem>
                                <MenuItem value="trend">트렌드 분석</MenuItem>
                            </Select>
                        </FormControl>
                        
                        <FormControl fullWidth>
                            <InputLabel>분석 기간</InputLabel>
                            <Select
                                value={reportConfig.period}
                                onChange={(e) => setReportConfig({...reportConfig, period: e.target.value})}
                            >
                                <MenuItem value="7d">최근 7일</MenuItem>
                                <MenuItem value="30d">최근 30일</MenuItem>
                                <MenuItem value="90d">최근 90일</MenuItem>
                                <MenuItem value="1y">최근 1년</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="포함할 메트릭 (쉼표로 구분)"
                            placeholder="예: 사용자 수, 매출, AI 정확도"
                            value={reportConfig.metrics.join(', ')}
                            onChange={(e) => setReportConfig({
                                ...reportConfig, 
                                metrics: e.target.value.split(',').map(m => m.trim()).filter(m => m)
                            })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCustomReportDialog(false)}>취소</Button>
                    <Button onClick={handleGenerateCustomReport} variant="contained">
                        리포트 생성
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 에러 알림 */}
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdvancedAnalyticsDashboard;
