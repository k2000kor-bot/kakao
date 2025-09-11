import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Avatar,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Alert,
    AlertTitle,
    Chip,
    Rating
} from '@mui/material';
import {
    AutoAwesome,
    Psychology,
    Analytics,
    Settings,
    Info,
    Warning,
    CheckCircle,
    Star,
    ThumbUp,
    ThumbDown,
    AccessTime,
    Person
} from '@mui/icons-material';

interface Metric {
    id: string;
    name: string;
    value: number;
    target: number;
    color: string;
    icon: React.ComponentType;
}

interface Feedback {
    id: string;
    user: string;
    rating: number;
    comment: string;
    timestamp: Date;
    sentiment: 'positive' | 'negative' | 'neutral';
}

interface Session {
    id: string;
    duration: number;
    pages: number;
    actions: number;
    satisfaction: number;
    timestamp: Date;
}

const EnhancedUserExperience: React.FC = () => {
    const [metrics, setMetrics] = useState<Metric[]>([
        {
            id: 'satisfaction',
            name: '사용자 만족도',
            value: 87,
            target: 90,
            color: '#4caf50',
            icon: Star
        },
        {
            id: 'engagement',
            name: '참여도',
            value: 92,
            target: 85,
            color: '#2196f3',
            icon: Psychology
        },
        {
            id: 'retention',
            name: '재방문율',
            value: 78,
            target: 80,
            color: '#ff9800',
            icon: Analytics
        },
        {
            id: 'performance',
            name: '성능 점수',
            value: 94,
            target: 90,
            color: '#9c27b0',
            icon: AutoAwesome
        }
    ]);

    const [feedbacks, setFeedbacks] = useState<Feedback[]>([
        {
            id: 'fb1',
            user: '김사용자',
            rating: 5,
            comment: 'AI 응답이 정말 빠르고 정확해요!',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            sentiment: 'positive'
        },
        {
            id: 'fb2',
            user: '이고객',
            rating: 4,
            comment: '기능은 좋은데 UI가 좀 복잡해요.',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            sentiment: 'neutral'
        },
        {
            id: 'fb3',
            user: '박사용자',
            rating: 5,
            comment: '완벽한 서비스입니다!',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
            sentiment: 'positive'
        }
    ]);

    const [sessions, setSessions] = useState<Session[]>([
        {
            id: 's1',
            duration: 25,
            pages: 8,
            actions: 15,
            satisfaction: 4.5,
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
        },
        {
            id: 's2',
            duration: 18,
            pages: 5,
            actions: 12,
            satisfaction: 4.0,
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
        },
        {
            id: 's3',
            duration: 35,
            pages: 12,
            actions: 22,
            satisfaction: 5.0,
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
        }
    ]);

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return '#4caf50';
            case 'negative': return '#f44336';
            default: return '#ff9800';
        }
    };

    const getSentimentIcon = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return <ThumbUp />;
            case 'negative': return <ThumbDown />;
            default: return <AccessTime />;
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesome color="primary" />
                향상된 사용자 경험
            </Typography>

            {/* 메트릭 카드 */}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2, mb: 4 }}>
                {metrics.map((metric) => {
                    const IconComponent = metric.icon;
                    const progress = (metric.value / metric.target) * 100;

                    return (
                        <Box key={metric.id} sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Avatar sx={{ bgcolor: metric.color, mr: 2 }}>
                                            <IconComponent />
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h6" component="div">
                                                {metric.value}%
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {metric.name}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.min(progress, 100)}
                                        sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            backgroundColor: 'rgba(0,0,0,0.1)',
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: metric.color,
                                                borderRadius: 4
                                            }
                                        }}
                                    />
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        목표: {metric.target}%
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    );
                })}
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 2 }}>
                {/* 사용자 피드백 */}
                <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Psychology color="primary" />
                                사용자 피드백
                            </Typography>
                            <List>
                                {feedbacks.map((feedback, index) => (
                                    <React.Fragment key={feedback.id}>
                                        <ListItem>
                                            <ListItemIcon>
                                                {getSentimentIcon(feedback.sentiment)}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="subtitle2">
                                                            {feedback.user}
                                                        </Typography>
                                                        <Rating value={feedback.rating} size="small" readOnly />
                                                        <Chip
                                                            label={feedback.sentiment}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: getSentimentColor(feedback.sentiment),
                                                                color: 'white',
                                                                fontSize: '0.7rem'
                                                            }}
                                                        />
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            {feedback.comment}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {feedback.timestamp.toLocaleString()}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                        {index < feedbacks.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Box>

                {/* 사용자 세션 분석 */}
                <Box sx={{ width: { xs: '100%', md: '50%' } }}>
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
                                                <Person color="primary" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="subtitle2">
                                                            세션 {session.id}
                                                        </Typography>
                                                        <Rating value={session.satisfaction} size="small" readOnly />
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            {session.duration}분 • {session.pages}페이지 • {session.actions}개 액션
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {session.timestamp.toLocaleString()}
                                                        </Typography>
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
                </Box>
            </Box>

            {/* 개선 제안 */}
            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Settings color="primary" />
                        개선 제안
                    </Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }}>
                        <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
                            <Alert severity="info" icon={<Info />}>
                                <AlertTitle>응답 속도 개선</AlertTitle>
                                AI 응답 시간을 단축하기 위해 캐싱 시스템을 강화하세요.
                            </Alert>
                        </Box>
                        <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
                            <Alert severity="warning" icon={<Warning />}>
                                <AlertTitle>다국어 지원</AlertTitle>
                                사용자 요청에 따라 다국어 지원 기능을 추가하세요.
                            </Alert>
                        </Box>
                        <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
                            <Alert severity="success" icon={<CheckCircle />}>
                                <AlertTitle>접근성 우수</AlertTitle>
                                현재 접근성 점수가 목표를 초과하고 있습니다.
                            </Alert>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default EnhancedUserExperience;