import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    LinearProgress,
    Chip,
    Alert,
    AlertTitle,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Avatar
} from '@mui/material';
import { Grid } from '@mui/material';
import {
    Person,
    TrendingUp,
    Speed,
    CheckCircle,
    Warning,
    Info,
    Star,
    ThumbUp,
    ThumbDown,
    Settings,
    Analytics,
    Psychology,
    AutoAwesome
} from '@mui/icons-material';

interface UserExperienceMetric {
    id: string;
    name: string;
    value: number;
    target: number;
    trend: 'up' | 'down' | 'stable';
    icon: React.ElementType;
    color: string;
}

interface UserFeedback {
    id: string;
    type: 'positive' | 'negative' | 'suggestion';
    message: string;
    timestamp: Date;
    rating: number;
}

interface UserSession {
    id: string;
    duration: number;
    interactions: number;
    satisfaction: number;
    features: string[];
}

const EnhancedUserExperience: React.FC = () => {
    const [metrics] = useState<UserExperienceMetric[]>([
        {
            id: 'satisfaction',
            name: '사용자 만족도',
            value: 87,
            target: 90,
            trend: 'up',
            icon: ThumbUp,
            color: '#4CAF50'
        },
        {
            id: 'engagement',
            name: '참여도',
            value: 92,
            target: 85,
            trend: 'up',
            icon: TrendingUp,
            color: '#2196F3'
        },
        {
            id: 'performance',
            name: '성능 점수',
            value: 78,
            target: 80,
            trend: 'stable',
            icon: Speed,
            color: '#FF9800'
        },
        {
            id: 'accessibility',
            name: '접근성',
            value: 95,
            target: 90,
            trend: 'up',
            icon: CheckCircle,
            color: '#9C27B0'
        }
    ]);

    const [feedback] = useState<UserFeedback[]>([
        {
            id: '1',
            type: 'positive',
            message: 'AI 응답이 매우 정확하고 도움이 됩니다',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            rating: 5
        },
        {
            id: '2',
            type: 'suggestion',
            message: '더 많은 언어 지원이 필요합니다',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            rating: 4
        },
        {
            id: '3',
            type: 'negative',
            message: '응답 속도가 때때로 느립니다',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
            rating: 2
        }
    ]);

    const [sessions] = useState<UserSession[]>([
        {
            id: '1',
            duration: 45,
            interactions: 12,
            satisfaction: 4.5,
            features: ['채팅', '파일 분석', 'AI 인사이트']
        },
        {
            id: '2',
            duration: 23,
            interactions: 8,
            satisfaction: 4.2,
            features: ['시스템 모니터링', '보안 검사']
        }
    ]);

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return <TrendingUp color="success" />;
            case 'down': return <TrendingUp color="error" sx={{ transform: 'rotate(180deg)' }} />;
            default: return <TrendingUp color="disabled" />;
        }
    };

    const getFeedbackIcon = (type: string) => {
        switch (type) {
            case 'positive': return <ThumbUp color="success" />;
            case 'negative': return <ThumbDown color="error" />;
            default: return <Info color="info" />;
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesome color="primary" />
                향상된 사용자 경험
            </Typography>

            {/* 메트릭 카드 */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {metrics.map((metric) => {
                    const IconComponent = metric.icon;
                    const progress = (metric.value / metric.target) * 100;

                    return (
                        <Grid key={metric.id} sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Avatar sx={{ bgcolor: metric.color, mr: 2 }}>
                                            <IconComponent />
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h6" sx={{ color: metric.color }}>
                                                {metric.value}%
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {metric.name}
                                            </Typography>
                                        </Box>
                                        {getTrendIcon(metric.trend)}
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.min(progress, 100)}
                                        sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            bgcolor: 'grey.200',
                                            '& .MuiLinearProgress-bar': {
                                                bgcolor: metric.color
                                            }
                                        }}
                                    />
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        목표: {metric.target}%
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            <Grid container spacing={3}>
                {/* 사용자 피드백 */}
                <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Psychology color="primary" />
                                사용자 피드백
                            </Typography>
                            <List>
                                {feedback.map((item, index) => (
                                    <React.Fragment key={item.id}>
                                        <ListItem>
                                            <ListItemIcon>
                                                {getFeedbackIcon(item.type)}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={item.message}
                                                secondary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    sx={{
                                                                        color: i < item.rating ? '#FFD700' : 'grey.300',
                                                                        fontSize: 16
                                                                    }}
                                                                />
                                                            ))}
                                                        </Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {item.timestamp.toLocaleString()}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                        {index < feedback.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 사용자 세션 분석 */}
                <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Analytics color="primary" />
                                세션 분석
                            </Typography>
                            <List>
                                {sessions.map((session, index) => (
                                    <React.Fragment key={session.id}>
                                        <ListItem>
                                            <ListItemIcon>
                                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                    <Person />
                                                </Avatar>
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={`세션 ${session.id}`}
                                                secondary={
                                                    <Box sx={{ mt: 1 }}>
                                                        <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                                                            <Chip
                                                                label={`${session.duration}분`}
                                                                size="small"
                                                                color="primary"
                                                                variant="outlined"
                                                            />
                                                            <Chip
                                                                label={`${session.interactions}회 상호작용`}
                                                                size="small"
                                                                color="secondary"
                                                                variant="outlined"
                                                            />
                                                        </Box>
                                                        <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    sx={{
                                                                        color: i < session.satisfaction ? '#FFD700' : 'grey.300',
                                                                        fontSize: 16
                                                                    }}
                                                                />
                                                            ))}
                                                        </Box>
                                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                            {session.features.map((feature) => (
                                                                <Chip
                                                                    key={feature}
                                                                    label={feature}
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                            ))}
                                                        </Box>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                        {index < sessions.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 개선 제안 */}
            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Settings color="primary" />
                        개선 제안
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid sx={{ width: { xs: '100%', md: '33.33%' } }}>
                            <Alert severity="info" icon={<Info />}>
                                <AlertTitle>응답 속도 개선</AlertTitle>
                                AI 응답 시간을 단축하기 위해 캐싱 시스템을 강화하세요.
                            </Alert>
                        </Grid>
                        <Grid sx={{ width: { xs: '100%', md: '33.33%' } }}>
                            <Alert severity="warning" icon={<Warning />}>
                                <AlertTitle>다국어 지원</AlertTitle>
                                사용자 요청에 따라 다국어 지원 기능을 추가하세요.
                            </Alert>
                        </Grid>
                        <Grid sx={{ width: { xs: '100%', md: '33.33%' } }}>
                            <Alert severity="success" icon={<CheckCircle />}>
                                <AlertTitle>접근성 우수</AlertTitle>
                                현재 접근성 점수가 목표를 초과하고 있습니다.
                            </Alert>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );
};

export default EnhancedUserExperience;