import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    LinearProgress,
    Chip,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider
} from '@mui/material';
import {
    TrendingUp,
    Psychology,
    Speed,
    CheckCircle,
    Error,
    Analytics,
    Timeline
} from '@mui/icons-material';
import { integratedAPIService } from '../services/integratedAPIService';

interface AnalyticsData {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    emotionDistribution: {
        positive: number;
        negative: number;
        neutral: number;
    };
    intentDistribution: {
        question: number;
        request: number;
        gratitude: number;
        greeting: number;
        complaint: number;
        compliment: number;
    };
    recentMessages: Array<{
        message: string;
        emotion: string;
        intent: string;
        timestamp: string;
    }>;
}

const AnalyticsDashboard: React.FC = () => {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalyticsData();
        const interval = setInterval(loadAnalyticsData, 10000); // 10초마다 업데이트
        return () => clearInterval(interval);
    }, []);

    const loadAnalyticsData = async () => {
        try {
            const status = await integratedAPIService.getSystemStatus();
            const metrics = status.metrics;

            // 시뮬레이션된 분석 데이터 (실제로는 백엔드에서 제공)
            const mockAnalytics: AnalyticsData = {
                totalRequests: metrics.total_requests,
                successfulRequests: metrics.successful_requests,
                failedRequests: metrics.failed_requests,
                averageResponseTime: metrics.average_response_time,
                emotionDistribution: {
                    positive: Math.floor(metrics.successful_requests * 0.4),
                    negative: Math.floor(metrics.successful_requests * 0.3),
                    neutral: Math.floor(metrics.successful_requests * 0.3)
                },
                intentDistribution: {
                    question: Math.floor(metrics.successful_requests * 0.25),
                    request: Math.floor(metrics.successful_requests * 0.20),
                    gratitude: Math.floor(metrics.successful_requests * 0.15),
                    greeting: Math.floor(metrics.successful_requests * 0.15),
                    complaint: Math.floor(metrics.successful_requests * 0.15),
                    compliment: Math.floor(metrics.successful_requests * 0.10)
                },
                recentMessages: [
                    {
                        message: "정말 좋은 서비스네요!",
                        emotion: "긍정",
                        intent: "compliment",
                        timestamp: new Date().toLocaleTimeString()
                    },
                    {
                        message: "이 기능은 어떻게 사용하나요?",
                        emotion: "중립",
                        intent: "question",
                        timestamp: new Date(Date.now() - 300000).toLocaleTimeString()
                    },
                    {
                        message: "도와주세요!",
                        emotion: "중립",
                        intent: "request",
                        timestamp: new Date(Date.now() - 600000).toLocaleTimeString()
                    }
                ]
            };

            setAnalyticsData(mockAnalytics);
            setLoading(false);
        } catch (error) {
            console.error('분석 데이터 로드 실패:', error);
            setLoading(false);
        }
    };

    const getEmotionColor = (emotion: string) => {
        switch (emotion) {
            case '긍정': return '#4caf50';
            case '부정': return '#f44336';
            default: return '#2196f3';
        }
    };

    const getIntentColor = (intent: string) => {
        switch (intent) {
            case 'question': return '#ff9800';
            case 'request': return '#9c27b0';
            case 'gratitude': return '#4caf50';
            case 'greeting': return '#2196f3';
            case 'complaint': return '#f44336';
            case 'compliment': return '#ff5722';
            default: return '#607d8b';
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>분석 대시보드 로딩 중...</Typography>
                <LinearProgress />
            </Box>
        );
    }

    if (!analyticsData) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h6" color="error">분석 데이터를 불러올 수 없습니다.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Analytics />
                CORBU AI 분석 대시보드
            </Typography>

            {/* 주요 지표 카드들 */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <TrendingUp color="primary" />
                                <Typography variant="h6">총 요청</Typography>
                            </Box>
                            <Typography variant="h4" color="primary">
                                {analyticsData.totalRequests}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <CheckCircle color="success" />
                                <Typography variant="h6">성공률</Typography>
                            </Box>
                            <Typography variant="h4" color="success.main">
                                {((analyticsData.successfulRequests / analyticsData.totalRequests) * 100).toFixed(1)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Speed color="info" />
                                <Typography variant="h6">평균 응답시간</Typography>
                            </Box>
                            <Typography variant="h4" color="info.main">
                                {(analyticsData.averageResponseTime * 1000).toFixed(1)}ms
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Error color="error" />
                                <Typography variant="h6">실패 요청</Typography>
                            </Box>
                            <Typography variant="h4" color="error.main">
                                {analyticsData.failedRequests}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 감정 분석 차트 */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Psychology />
                                감정 분석 분포
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">긍정</Typography>
                                    <Typography variant="body2">{analyticsData.emotionDistribution.positive}</Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={(analyticsData.emotionDistribution.positive / analyticsData.successfulRequests) * 100}
                                    sx={{ height: 8, borderRadius: 4, bgcolor: '#e0e0e0' }}
                                />
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">부정</Typography>
                                    <Typography variant="body2">{analyticsData.emotionDistribution.negative}</Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={(analyticsData.emotionDistribution.negative / analyticsData.successfulRequests) * 100}
                                    sx={{ height: 8, borderRadius: 4, bgcolor: '#e0e0e0' }}
                                />
                            </Box>
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">중립</Typography>
                                    <Typography variant="body2">{analyticsData.emotionDistribution.neutral}</Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={(analyticsData.emotionDistribution.neutral / analyticsData.successfulRequests) * 100}
                                    sx={{ height: 8, borderRadius: 4, bgcolor: '#e0e0e0' }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Timeline />
                            의도 분석 분포
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {Object.entries(analyticsData.intentDistribution).map(([intent, count]) => (
                                <Chip
                                    key={intent}
                                    label={`${intent}: ${count}`}
                                    sx={{
                                        bgcolor: getIntentColor(intent),
                                        color: 'white',
                                        fontSize: '0.75rem'
                                    }}
                                />
                            ))}
                        </Box>
                    </CardContent>
                </Card>
                </Grid>
            </Grid>

    {/* 최근 메시지 */}
    <Card>
    <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>최근 분석된 메시지</Typography>
        <List>
            {analyticsData.recentMessages.map((msg, index) => (
                <React.Fragment key={index}>
                    <ListItem>
                        <ListItemIcon>
                            <Psychology sx={{ color: getEmotionColor(msg.emotion) }} />
                        </ListItemIcon>
                        <ListItemText
                            primary={msg.message}
                            secondary={
                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                    <Chip
                                        label={msg.emotion}
                                        size="small"
                                        sx={{
                                            bgcolor: getEmotionColor(msg.emotion),
                                            color: 'white',
                                            fontSize: '0.7rem'
                                        }}
                                    />
                                    <Chip
                                        label={msg.intent}
                                        size="small"
                                        sx={{
                                            bgcolor: getIntentColor(msg.intent),
                                            color: 'white',
                                            fontSize: '0.7rem'
                                        }}
                                    />
                                    <Typography variant="caption" sx={{ alignSelf: 'center' }}>
                                        {msg.timestamp}
                                    </Typography>
                                </Box>
                            }
                        />
                    </ListItem>
                    {index < analyticsData.recentMessages.length - 1 && <Divider />}
                </React.Fragment>
            ))}
        </List>
    </CardContent>
    </Card>
        </Box>
    );
};

export default AnalyticsDashboard;
