import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    LinearProgress,
    Chip,
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
    Error as ErrorIcon,
    Analytics,
    Timeline
} from '@mui/icons-material';
import { integratedAPIService } from '../services/integratedAPIService';
import { errorLogger, toError } from '../utils/errorLogger';
import { getSentimentColor } from '../styles/themeColors';

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
            const err = toError(error);
            errorLogger.error('분석 데이터 로드 실패', err, {
                component: 'AnalyticsDashboard',
                action: 'loadAnalyticsData',
            });
            setLoading(false);
        }
    };

    const cardSx = { bgcolor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md, 8px)' };
    const headingSx = { color: 'var(--text-primary)' };
    const subSx = { color: 'var(--text-secondary)' };

    if (loading) {
        return (
            <div className="bw-detail-root" data-testid="page-analytics">
                <div className="bw-detail-header">
                    <div className="bw-detail-header-inner">
                        <div className="bw-detail-header-left">
                            <div className="bw-detail-header-icon"><Analytics aria-hidden /></div>
                            <div>
                                <h2 className="bw-detail-header-title">CORBU.AI 분석 대시보드</h2>
                                <p className="bw-detail-header-desc">분석 대시보드 로딩 중...</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bw-detail-content bw-detail-tab-content">
                    <LinearProgress sx={{ '& .MuiLinearProgress-bar': { bgcolor: 'var(--accent-info)' }, bgcolor: 'var(--bg-tertiary)' }} />
                </div>
            </div>
        );
    }

    if (!analyticsData) {
        return (
            <div className="bw-detail-root" data-testid="page-analytics">
                <div className="bw-detail-header">
                    <div className="bw-detail-header-inner">
                        <div className="bw-detail-header-left">
                            <div className="bw-detail-header-icon"><Analytics aria-hidden /></div>
                            <div>
                                <h2 className="bw-detail-header-title">CORBU.AI 분석 대시보드</h2>
                                <p className="bw-detail-header-desc bw-text-error">분석 데이터를 불러올 수 없습니다.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bw-detail-content bw-detail-tab-content" />
            </div>
        );
    }

    return (
        <div className="bw-detail-root" data-testid="page-analytics">
            <div className="bw-detail-header">
                <div className="bw-detail-header-inner">
                    <div className="bw-detail-header-left">
                        <div className="bw-detail-header-icon">
                            <Analytics aria-hidden />
                        </div>
                        <div>
                            <h2 className="bw-detail-header-title">CORBU.AI 분석 대시보드</h2>
                            <p className="bw-detail-header-desc">대화·감정·의도 분석 현황을 한눈에 확인하세요</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bw-detail-content bw-detail-tab-content">

                {/* 주요 지표 카드들 */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={cardSx}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <TrendingUp sx={{ color: 'var(--accent-info)' }} />
                                <Typography variant="h6" sx={subSx}>총 요청</Typography>
                            </Box>
                            <Typography variant="h4" sx={{ color: 'var(--accent-info)' }}>
                                {analyticsData.totalRequests}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={cardSx}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <CheckCircle sx={{ color: 'var(--accent-success)' }} />
                                <Typography variant="h6" sx={subSx}>성공률</Typography>
                            </Box>
                            <Typography variant="h4" sx={{ color: 'var(--accent-success)' }}>
                                {((analyticsData.successfulRequests / analyticsData.totalRequests) * 100).toFixed(1)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={cardSx}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Speed sx={{ color: 'var(--accent-info)' }} />
                                <Typography variant="h6" sx={subSx}>평균 응답시간</Typography>
                            </Box>
                            <Typography variant="h4" sx={{ color: 'var(--accent-info)' }}>
                                {(analyticsData.averageResponseTime * 1000).toFixed(1)}ms
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={cardSx}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <ErrorIcon sx={{ color: 'var(--accent-error)' }} />
                                <Typography variant="h6" sx={subSx}>실패 요청</Typography>
                            </Box>
                            <Typography variant="h4" sx={{ color: 'var(--accent-error)' }}>
                                {analyticsData.failedRequests}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 감정 분석 차트 */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={cardSx}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, ...headingSx }}>
                                <Psychology sx={{ color: 'var(--accent-secondary)' }} />
                                감정 분석 분포
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" sx={subSx}>긍정</Typography>
                                    <Typography variant="body2" sx={subSx}>{analyticsData.emotionDistribution.positive}</Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={(analyticsData.emotionDistribution.positive / analyticsData.successfulRequests) * 100}
                                    sx={{ height: 8, borderRadius: 4, bgcolor: 'var(--bg-tertiary)', '& .MuiLinearProgress-bar': { bgcolor: 'var(--accent-success)' } }}
                                />
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" sx={subSx}>부정</Typography>
                                    <Typography variant="body2" sx={subSx}>{analyticsData.emotionDistribution.negative}</Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={(analyticsData.emotionDistribution.negative / analyticsData.successfulRequests) * 100}
                                    sx={{ height: 8, borderRadius: 4, bgcolor: 'var(--bg-tertiary)', '& .MuiLinearProgress-bar': { bgcolor: 'var(--accent-error)' } }}
                                />
                            </Box>
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" sx={subSx}>중립</Typography>
                                    <Typography variant="body2" sx={subSx}>{analyticsData.emotionDistribution.neutral}</Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={(analyticsData.emotionDistribution.neutral / analyticsData.successfulRequests) * 100}
                                    sx={{ height: 8, borderRadius: 4, bgcolor: 'var(--bg-tertiary)', '& .MuiLinearProgress-bar': { bgcolor: 'var(--text-tertiary)' } }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={cardSx}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, ...headingSx }}>
                                <Timeline sx={{ color: 'var(--accent-info)' }} />
                                의도 분석 분포
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {Object.entries(analyticsData.intentDistribution).map(([intent, count]) => (
                                    <Chip
                                        key={intent}
                                        label={`${intent}: ${count}`}
                                        sx={{
                                            bgcolor: getSentimentColor(intent),
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
            <Card sx={cardSx}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, ...headingSx }}>최근 분석된 메시지</Typography>
                    <List sx={{ bgcolor: 'transparent' }}>
                        {analyticsData.recentMessages.map((msg, index) => (
                            <React.Fragment key={index}>
                                <ListItem sx={{ bgcolor: 'var(--bg-primary)' }}>
                                    <ListItemIcon>
                                        <Psychology sx={{ color: getSentimentColor(msg.emotion) }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={msg.message}
                                        primaryTypographyProps={{ sx: { color: 'var(--text-primary)' } }}
                                        secondary={
                                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                                <Chip
                                                    label={msg.emotion}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: getSentimentColor(msg.emotion),
                                                        color: 'white',
                                                        fontSize: '0.7rem'
                                                    }}
                                                />
                                                <Chip
                                                    label={msg.intent}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: getSentimentColor(msg.intent),
                                                        color: 'white',
                                                        fontSize: '0.7rem'
                                                    }}
                                                />
                                                <Typography variant="caption" sx={{ alignSelf: 'center', color: 'var(--text-secondary)' }}>
                                                    {msg.timestamp}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                                {index < analyticsData.recentMessages.length - 1 && <Divider sx={{ borderColor: 'var(--border-color)' }} />}
                            </React.Fragment>
                        ))}
                    </List>
                </CardContent>
            </Card>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
