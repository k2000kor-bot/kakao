import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Tabs,
    Tab,
    Paper,
    Chip,
    Alert,
    Divider,
    Grid,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Rating,
    TextField,
    Slider
} from '@mui/material';
import {
    Speed,
    Psychology,
    Memory,
    Assessment,
    Feedback,
    TrendingUp,
    Star,
    Lightbulb,
    CheckCircle,
    Warning
} from '@mui/icons-material';

interface AIManagementProps {
    onOptimizationComplete?: (result: string) => void;
}

const AIManagement: React.FC<AIManagementProps> = ({ onOptimizationComplete }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    // 최적화 상태
    const [optimizationType, setOptimizationType] = useState('performance');
    const [targetMetric, setTargetMetric] = useState('response_time');
    const [optimizationResult, setOptimizationResult] = useState<any>(null);

    // 벤치마크 상태
    const [benchmarkType, setBenchmarkType] = useState('comprehensive');
    const [testDataSize, setTestDataSize] = useState('medium');
    const [benchmarkResult, setBenchmarkResult] = useState<any>(null);

    // 피드백 상태
    const [feedbackType, setFeedbackType] = useState('user_rating');
    const [rating, setRating] = useState(5);
    const [feedbackContent, setFeedbackContent] = useState('');
    const [correction, setCorrection] = useState('');
    const [feedbackResult, setFeedbackResult] = useState<any>(null);

    const optimizationTypes = [
        { value: 'performance', label: '성능 최적화', icon: <Speed /> },
        { value: 'accuracy', label: '정확도 최적화', icon: <Psychology /> },
        { value: 'memory', label: '메모리 최적화', icon: <Memory /> }
    ];

    const targetMetrics = [
        { value: 'response_time', label: '응답 시간' },
        { value: 'accuracy', label: '정확도' },
        { value: 'memory_usage', label: '메모리 사용량' }
    ];

    const benchmarkTypes = [
        { value: 'comprehensive', label: '종합 벤치마크', icon: <Assessment /> },
        { value: 'speed', label: '속도 벤치마크', icon: <Speed /> },
        { value: 'accuracy', label: '정확도 벤치마크', icon: <Psychology /> },
        { value: 'memory', label: '메모리 벤치마크', icon: <Memory /> }
    ];

    const testDataSizes = [
        { value: 'small', label: '소규모 (1K 샘플)' },
        { value: 'medium', label: '중규모 (10K 샘플)' },
        { value: 'large', label: '대규모 (100K 샘플)' }
    ];

    const feedbackTypes = [
        { value: 'user_rating', label: '사용자 평점', icon: <Star /> },
        { value: 'correction', label: '수정 제안', icon: <Feedback /> },
        { value: 'suggestion', label: '개선 제안', icon: <Lightbulb /> }
    ];

    const runOptimization = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5002/api/integrated/ai/optimize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    optimization_type: optimizationType,
                    target_metric: targetMetric
                })
            });

            const data = await response.json();

            if (data.success) {
                setOptimizationResult(data.data);
                onOptimizationComplete?.(`${optimizationType} 최적화가 완료되었습니다.`);
            } else {
                setError(data.error || '최적화에 실패했습니다.');
            }
        } catch (err) {
            setError('최적화 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const runBenchmark = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5002/api/integrated/ai/benchmark', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    benchmark_type: benchmarkType,
                    test_data_size: testDataSize
                })
            });

            const data = await response.json();

            if (data.success) {
                setBenchmarkResult(data.data);
            } else {
                setError(data.error || '벤치마크에 실패했습니다.');
            }
        } catch (err) {
            setError('벤치마크 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const submitFeedback = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5002/api/integrated/ai/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    feedback_type: feedbackType,
                    content: feedbackContent,
                    rating: rating,
                    correction: correction
                })
            });

            const data = await response.json();

            if (data.success) {
                setFeedbackResult(data.data);
                onOptimizationComplete?.(`피드백이 처리되었습니다.`);
            } else {
                setError(data.error || '피드백 처리에 실패했습니다.');
            }
        } catch (err) {
            setError('피드백 처리 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        setError('');
    };

    const renderOptimizationTab = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Speed color="primary" />
                AI 모델 최적화
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel>최적화 유형</InputLabel>
                        <Select
                            value={optimizationType}
                            onChange={(e) => setOptimizationType(e.target.value)}
                            label="최적화 유형"
                        >
                            {optimizationTypes.map((type) => (
                                <MenuItem key={type.value} value={type.value}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {type.icon}
                                        {type.label}
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel>목표 지표</InputLabel>
                        <Select
                            value={targetMetric}
                            onChange={(e) => setTargetMetric(e.target.value)}
                            label="목표 지표"
                        >
                            {targetMetrics.map((metric) => (
                                <MenuItem key={metric.value} value={metric.value}>
                                    {metric.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            <Button
                variant="contained"
                onClick={runOptimization}
                disabled={loading}
                startIcon={<Speed />}
                sx={{ mb: 2 }}
            >
                {loading ? '최적화 중...' : '최적화 실행'}
            </Button>

            {optimizationResult && (
                <Paper sx={{ p: 2, mt: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>최적화 결과</Typography>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>최적화 전</Typography>
                            <Box sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                                {Object.entries(optimizationResult.before_optimization).map(([key, value]) => (
                                    <Typography key={key} variant="body2">
                                        {key === 'response_time' ? '응답 시간' :
                                            key === 'accuracy' ? '정확도' :
                                                key === 'memory_usage' ? '메모리 사용량' :
                                                    key === 'precision' ? '정밀도' :
                                                        key === 'recall' ? '재현율' :
                                                            key === 'f1_score' ? 'F1 점수' :
                                                                key === 'model_size' ? '모델 크기' :
                                                                    key === 'inference_memory' ? '추론 메모리' : key}:
                                        {typeof value === 'number' ?
                                            (key.includes('time') ? `${value.toFixed(0)}ms` :
                                                key.includes('usage') || key.includes('size') ? `${value.toFixed(0)}MB` :
                                                    `${value.toFixed(1)}%`) : value}
                                    </Typography>
                                ))}
                            </Box>
                        </Grid>

                        <Grid item xs={6}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>최적화 후</Typography>
                            <Box sx={{ bgcolor: 'success.light', p: 1, borderRadius: 1 }}>
                                {Object.entries(optimizationResult.after_optimization).map(([key, value]) => (
                                    <Typography key={key} variant="body2">
                                        {key === 'response_time' ? '응답 시간' :
                                            key === 'accuracy' ? '정확도' :
                                                key === 'memory_usage' ? '메모리 사용량' :
                                                    key === 'precision' ? '정밀도' :
                                                        key === 'recall' ? '재현율' :
                                                            key === 'f1_score' ? 'F1 점수' :
                                                                key === 'model_size' ? '모델 크기' :
                                                                    key === 'inference_memory' ? '추론 메모리' : key}:
                                        {typeof value === 'number' ?
                                            (key.includes('time') ? `${value.toFixed(0)}ms` :
                                                key.includes('usage') || key.includes('size') ? `${value.toFixed(0)}MB` :
                                                    `${value.toFixed(1)}%`) : value}
                                    </Typography>
                                ))}
                            </Box>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle1" sx={{ mb: 1 }}>개선 사항</Typography>
                    <Grid container spacing={1}>
                        {Object.entries(optimizationResult.improvements).map(([key, value]) => (
                            <Grid item key={key}>
                                <Chip
                                    label={`${key === 'response_time_improvement' ? '응답 시간' :
                                        key === 'accuracy_improvement' ? '정확도' :
                                            key === 'memory_reduction' ? '메모리' :
                                                key === 'precision_improvement' ? '정밀도' :
                                                    key === 'recall_improvement' ? '재현율' :
                                                        key === 'f1_improvement' ? 'F1 점수' :
                                                            key === 'model_size_reduction' ? '모델 크기' :
                                                                key === 'inference_memory_reduction' ? '추론 메모리' : key} +${value}%`}
                                    color="success"
                                    variant="outlined"
                                />
                            </Grid>
                        ))}
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle1" sx={{ mb: 1 }}>권장사항</Typography>
                    <List>
                        {optimizationResult.recommendations.map((recommendation: string, index: number) => (
                            <ListItem key={index}>
                                <ListItemIcon>
                                    <Lightbulb color="warning" />
                                </ListItemIcon>
                                <ListItemText primary={recommendation} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}
        </Box>
    );

    const renderBenchmarkTab = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assessment color="secondary" />
                AI 모델 벤치마크
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel>벤치마크 유형</InputLabel>
                        <Select
                            value={benchmarkType}
                            onChange={(e) => setBenchmarkType(e.target.value)}
                            label="벤치마크 유형"
                        >
                            {benchmarkTypes.map((type) => (
                                <MenuItem key={type.value} value={type.value}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {type.icon}
                                        {type.label}
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel>테스트 데이터 크기</InputLabel>
                        <Select
                            value={testDataSize}
                            onChange={(e) => setTestDataSize(e.target.value)}
                            label="테스트 데이터 크기"
                        >
                            {testDataSizes.map((size) => (
                                <MenuItem key={size.value} value={size.value}>
                                    {size.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            <Button
                variant="contained"
                color="secondary"
                onClick={runBenchmark}
                disabled={loading}
                startIcon={<Assessment />}
                sx={{ mb: 2 }}
            >
                {loading ? '벤치마크 중...' : '벤치마크 실행'}
            </Button>

            {benchmarkResult && (
                <Paper sx={{ p: 2, mt: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>벤치마크 결과</Typography>

                    <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                        <Typography variant="h5" sx={{ mb: 1 }}>
                            🏆 최고 성능 모델: {benchmarkResult.summary.best_model}
                        </Typography>
                        <Typography variant="body1">
                            종합 점수: {benchmarkResult.summary.best_score}
                        </Typography>
                    </Box>

                    <TableContainer component={Paper} sx={{ mb: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>모델</TableCell>
                                    <TableCell align="right">응답 시간 (ms)</TableCell>
                                    <TableCell align="right">정확도 (%)</TableCell>
                                    <TableCell align="right">메모리 (MB)</TableCell>
                                    <TableCell align="right">처리량</TableCell>
                                    <TableCell align="right">비용</TableCell>
                                    <TableCell align="right">신뢰성 (%)</TableCell>
                                    {benchmarkType === 'comprehensive' && (
                                        <TableCell align="right">종합 점수</TableCell>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {benchmarkResult.results.map((result: any, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {index === 0 && <CheckCircle color="success" />}
                                                {index === 1 && <Warning color="warning" />}
                                                {result.model_name}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">{result.response_time.toFixed(0)}</TableCell>
                                        <TableCell align="right">{result.accuracy.toFixed(1)}</TableCell>
                                        <TableCell align="right">{result.memory_usage.toFixed(0)}</TableCell>
                                        <TableCell align="right">{result.throughput.toFixed(0)}</TableCell>
                                        <TableCell align="right">${result.cost_per_request.toFixed(3)}</TableCell>
                                        <TableCell align="right">{result.reliability.toFixed(1)}</TableCell>
                                        {benchmarkType === 'comprehensive' && (
                                            <TableCell align="right">
                                                <Chip
                                                    label={result.comprehensive_score}
                                                    color={index === 0 ? 'success' : 'default'}
                                                    size="small"
                                                />
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Typography variant="subtitle1" sx={{ mb: 1 }}>권장사항</Typography>
                    <List>
                        {benchmarkResult.summary.recommendations.map((recommendation: string, index: number) => (
                            <ListItem key={index}>
                                <ListItemIcon>
                                    <Lightbulb color="info" />
                                </ListItemIcon>
                                <ListItemText primary={recommendation} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}
        </Box>
    );

    const renderFeedbackTab = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Feedback color="warning" />
                AI 피드백 및 학습
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel>피드백 유형</InputLabel>
                        <Select
                            value={feedbackType}
                            onChange={(e) => setFeedbackType(e.target.value)}
                            label="피드백 유형"
                        >
                            {feedbackTypes.map((type) => (
                                <MenuItem key={type.value} value={type.value}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {type.icon}
                                        {type.label}
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                {feedbackType === 'user_rating' && (
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ mb: 1 }}>평점</Typography>
                        <Rating
                            value={rating}
                            onChange={(event, newValue) => setRating(newValue || 0)}
                            size="large"
                        />
                    </Grid>
                )}
            </Grid>

            <TextField
                fullWidth
                multiline
                rows={3}
                label="피드백 내용"
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.target.value)}
                sx={{ mb: 2 }}
            />

            {feedbackType === 'correction' && (
                <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="수정 제안"
                    value={correction}
                    onChange={(e) => setCorrection(e.target.value)}
                    sx={{ mb: 2 }}
                />
            )}

            <Button
                variant="contained"
                color="warning"
                onClick={submitFeedback}
                disabled={loading || !feedbackContent.trim()}
                startIcon={<Feedback />}
                sx={{ mb: 2 }}
            >
                {loading ? '처리 중...' : '피드백 제출'}
            </Button>

            {feedbackResult && (
                <Paper sx={{ p: 2, mt: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>피드백 처리 결과</Typography>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="text.secondary">새 학습 샘플</Typography>
                            <Typography variant="h6" color="primary">
                                {feedbackResult.learning_update.new_training_samples}개
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="text.secondary">정확도 개선</Typography>
                            <Typography variant="h6" color="success.main">
                                +{feedbackResult.learning_update.model_accuracy_improvement.toFixed(1)}%
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="text.secondary">응답 품질</Typography>
                            <Typography variant="h6" color="info.main">
                                {feedbackResult.learning_update.response_quality_score.toFixed(1)}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="text.secondary">만족도 트렌드</Typography>
                            <Chip
                                label={feedbackResult.learning_update.user_satisfaction_trend === 'improving' ? '개선 중' : '하락 중'}
                                color={feedbackResult.learning_update.user_satisfaction_trend === 'improving' ? 'success' : 'error'}
                                size="small"
                            />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle1" sx={{ mb: 1 }}>개선 제안</Typography>
                    <List>
                        {feedbackResult.improvements.map((improvement: string, index: number) => (
                            <ListItem key={index}>
                                <ListItemIcon>
                                    <Lightbulb color="warning" />
                                </ListItemIcon>
                                <ListItemText primary={improvement} />
                            </ListItem>
                        ))}
                    </List>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle1" sx={{ mb: 1 }}>피드백 통계</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="text.secondary">총 피드백 수</Typography>
                            <Typography variant="h6">
                                {feedbackResult.feedback_stats.total_feedback_count}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="text.secondary">평균 평점</Typography>
                            <Typography variant="h6">
                                {feedbackResult.feedback_stats.average_rating.toFixed(1)}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="text.secondary">긍정 피드백률</Typography>
                            <Typography variant="h6" color="success.main">
                                {feedbackResult.feedback_stats.positive_feedback_rate.toFixed(1)}%
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="text.secondary">개선 제안 수</Typography>
                            <Typography variant="h6">
                                {feedbackResult.feedback_stats.improvement_suggestions_count}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>
            )}
        </Box>
    );

    return (
        <Paper sx={{ p: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label="모델 최적화" icon={<Speed />} />
                    <Tab label="벤치마크" icon={<Assessment />} />
                    <Tab label="피드백" icon={<Feedback />} />
                </Tabs>
            </Box>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {activeTab === 0 && renderOptimizationTab()}
            {activeTab === 1 && renderBenchmarkTab()}
            {activeTab === 2 && renderFeedbackTab()}
        </Paper>
    );
};

export default AIManagement;
