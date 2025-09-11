import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    IconButton,
    Tooltip,
    Badge,
    Paper,
    Grid,
    Switch,
    FormControlLabel,
    Slider,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    Notifications,
    NotificationsActive,
    NotificationsOff,
    SmartToy,
    Psychology,
    TrendingUp,
    Warning,
    Info,
    CheckCircle,
    Error,
    Settings,
    Delete,
    MarkEmailRead,
    MarkEmailUnread
} from '@mui/icons-material';

interface Notification {
    id: string;
    type: 'ai_insight' | 'system_alert' | 'performance_tip' | 'user_activity' | 'trend_analysis';
    title: string;
    message: string;
    timestamp: Date;
    priority: 'low' | 'medium' | 'high' | 'critical';
    read: boolean;
    category: string;
    actionable: boolean;
    actionUrl?: string;
}

interface NotificationSettings {
    aiInsights: boolean;
    systemAlerts: boolean;
    performanceTips: boolean;
    userActivity: boolean;
    trendAnalysis: boolean;
    soundEnabled: boolean;
    emailNotifications: boolean;
    priorityThreshold: 'low' | 'medium' | 'high' | 'critical';
}

const SmartNotificationSystem: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [settings, setSettings] = useState<NotificationSettings>({
        aiInsights: true,
        systemAlerts: true,
        performanceTips: true,
        userActivity: false,
        trendAnalysis: true,
        soundEnabled: true,
        emailNotifications: false,
        priorityThreshold: 'medium'
    });
    const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'high_priority' | 'settings'>('all');
    const [isGenerating, setIsGenerating] = useState(false);

    // 알림 생성 함수
    const generateSmartNotification = async () => {
        setIsGenerating(true);

        try {
            // AI 인사이트 기반 알림 생성
            const response = await fetch('http://localhost:5005/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: "시스템 성능 분석을 위한 알림을 생성해주세요.",
                    analysis_type: "emotion"
                })
            });

            const data = await response.json();

            if (data.success) {
                const newNotification: Notification = {
                    id: `ai-${Date.now()}`,
                    type: 'ai_insight',
                    title: 'AI 인사이트',
                    message: data.data.details || '새로운 AI 인사이트가 생성되었습니다.',
                    timestamp: new Date(),
                    priority: 'medium',
                    read: false,
                    category: 'AI 분석',
                    actionable: true
                };

                setNotifications(prev => [newNotification, ...prev]);
            }
        } catch (error) {
            console.error('알림 생성 실패:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    // 시뮬레이션된 알림 생성
    const generateSimulatedNotifications = () => {
        const notificationTypes = [
            {
                type: 'system_alert' as const,
                title: '시스템 성능 경고',
                message: 'CPU 사용률이 85%를 초과했습니다. 시스템 최적화를 고려해보세요.',
                priority: 'high' as const,
                category: '시스템'
            },
            {
                type: 'performance_tip' as const,
                title: '성능 개선 제안',
                message: '캐시 히트율이 90%를 달성했습니다. 현재 설정이 최적화되어 있습니다.',
                priority: 'low' as const,
                category: '성능'
            },
            {
                type: 'trend_analysis' as const,
                title: '사용 패턴 분석',
                message: '오후 2-4시에 AI 요청이 집중되고 있습니다. 서버 리소스를 미리 확보하세요.',
                priority: 'medium' as const,
                category: '분석'
            },
            {
                type: 'ai_insight' as const,
                title: 'AI 추천',
                message: '사용자 만족도가 15% 향상되었습니다. 현재 AI 모델이 효과적으로 작동하고 있습니다.',
                priority: 'medium' as const,
                category: 'AI'
            }
        ];

        const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        const newNotification: Notification = {
            id: `sim-${Date.now()}`,
            ...randomType,
            message: randomType.message,
            timestamp: new Date(),
            read: false,
            actionable: true
        };

        setNotifications(prev => [newNotification, ...prev]);
    };

    // 알림 읽음 처리
    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id ? { ...notification, read: true } : notification
            )
        );
    };

    // 알림 삭제
    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    // 모든 알림 읽음 처리
    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, read: true }))
        );
    };

    // 필터링된 알림 목록
    const getFilteredNotifications = () => {
        switch (activeTab) {
            case 'unread':
                return notifications.filter(n => !n.read);
            case 'high_priority':
                return notifications.filter(n => n.priority === 'high' || n.priority === 'critical');
            default:
                return notifications;
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'ai_insight': return <SmartToy />;
            case 'system_alert': return <Warning />;
            case 'performance_tip': return <TrendingUp />;
            case 'user_activity': return <Psychology />;
            case 'trend_analysis': return <Info />;
            default: return <Notifications />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'error';
            case 'high': return 'warning';
            case 'medium': return 'info';
            case 'low': return 'success';
            default: return 'default';
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;
    const highPriorityCount = notifications.filter(n => n.priority === 'high' || n.priority === 'critical').length;

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Notifications color="primary" />
                    스마트 알림 시스템
                </Typography>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="contained"
                        onClick={generateSmartNotification}
                        disabled={isGenerating}
                        startIcon={<SmartToy />}
                    >
                        {isGenerating ? '생성 중...' : 'AI 알림 생성'}
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={generateSimulatedNotifications}
                        startIcon={<NotificationsActive />}
                    >
                        시뮬레이션 알림
                    </Button>
                </Box>
            </Box>

            {/* 알림 통계 */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary">
                                {notifications.length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                총 알림
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="warning.main">
                                {unreadCount}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                읽지 않음
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="error.main">
                                {highPriorityCount}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                높은 우선순위
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="success.main">
                                {notifications.filter(n => n.read).length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                읽음
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 탭 네비게이션 */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant={activeTab === 'all' ? 'contained' : 'text'}
                        onClick={() => setActiveTab('all')}
                        startIcon={<Notifications />}
                    >
                        전체
                    </Button>

                    <Button
                        variant={activeTab === 'unread' ? 'contained' : 'text'}
                        onClick={() => setActiveTab('unread')}
                        startIcon={<Badge badgeContent={unreadCount} color="error"><MarkEmailUnread /></Badge>}
                    >
                        읽지 않음
                    </Button>

                    <Button
                        variant={activeTab === 'high_priority' ? 'contained' : 'text'}
                        onClick={() => setActiveTab('high_priority')}
                        startIcon={<Badge badgeContent={highPriorityCount} color="error"><Warning /></Badge>}
                    >
                        높은 우선순위
                    </Button>

                    <Button
                        variant={activeTab === 'settings' ? 'contained' : 'text'}
                        onClick={() => setActiveTab('settings')}
                        startIcon={<Settings />}
                    >
                        설정
                    </Button>
                </Box>
            </Box>

            {/* 알림 목록 */}
            {activeTab !== 'settings' && (
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                            {activeTab === 'all' && '모든 알림'}
                            {activeTab === 'unread' && '읽지 않은 알림'}
                            {activeTab === 'high_priority' && '높은 우선순위 알림'}
                        </Typography>

                        {activeTab === 'all' && unreadCount > 0 && (
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={markAllAsRead}
                                startIcon={<MarkEmailRead />}
                            >
                                모두 읽음 처리
                            </Button>
                        )}
                    </Box>

                    {getFilteredNotifications().length === 0 ? (
                        <Alert severity="info">
                            {activeTab === 'all' && '알림이 없습니다.'}
                            {activeTab === 'unread' && '읽지 않은 알림이 없습니다.'}
                            {activeTab === 'high_priority' && '높은 우선순위 알림이 없습니다.'}
                        </Alert>
                    ) : (
                        <List>
                            {getFilteredNotifications().map((notification, index) => (
                                <React.Fragment key={notification.id}>
                                    <ListItem
                                        sx={{
                                            bgcolor: notification.read ? 'transparent' : 'action.hover',
                                            borderRadius: 1,
                                            mb: 1
                                        }}
                                    >
                                        <ListItemIcon>
                                            {getNotificationIcon(notification.type)}
                                        </ListItemIcon>

                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                                                        {notification.title}
                                                    </Typography>
                                                    <Chip
                                                        label={notification.priority}
                                                        size="small"
                                                        color={getPriorityColor(notification.priority)}
                                                        variant="outlined"
                                                    />
                                                    <Chip
                                                        label={notification.category}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                        {notification.message}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {notification.timestamp.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                            }
                                        />

                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            {!notification.read && (
                                                <Tooltip title="읽음 처리">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => markAsRead(notification.id)}
                                                    >
                                                        <MarkEmailRead />
                                                    </IconButton>
                                                </Tooltip>
                                            )}

                                            <Tooltip title="삭제">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => deleteNotification(notification.id)}
                                                    color="error"
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </ListItem>

                                    {index < getFilteredNotifications().length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </Box>
            )}

            {/* 설정 탭 */}
            {activeTab === 'settings' && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>알림 설정</Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" sx={{ mb: 2 }}>알림 유형</Typography>

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.aiInsights}
                                            onChange={(e) => setSettings(prev => ({ ...prev, aiInsights: e.target.checked }))}
                                        />
                                    }
                                    label="AI 인사이트"
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.systemAlerts}
                                            onChange={(e) => setSettings(prev => ({ ...prev, systemAlerts: e.target.checked }))}
                                        />
                                    }
                                    label="시스템 알림"
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.performanceTips}
                                            onChange={(e) => setSettings(prev => ({ ...prev, performanceTips: e.target.checked }))}
                                        />
                                    }
                                    label="성능 팁"
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.userActivity}
                                            onChange={(e) => setSettings(prev => ({ ...prev, userActivity: e.target.checked }))}
                                        />
                                    }
                                    label="사용자 활동"
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.trendAnalysis}
                                            onChange={(e) => setSettings(prev => ({ ...prev, trendAnalysis: e.target.checked }))}
                                        />
                                    }
                                    label="트렌드 분석"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" sx={{ mb: 2 }}>알림 옵션</Typography>

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.soundEnabled}
                                            onChange={(e) => setSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                                        />
                                    }
                                    label="소리 알림"
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.emailNotifications}
                                            onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                                        />
                                    }
                                    label="이메일 알림"
                                />

                                <FormControl fullWidth sx={{ mt: 2 }}>
                                    <InputLabel>우선순위 임계값</InputLabel>
                                    <Select
                                        value={settings.priorityThreshold}
                                        onChange={(e) => setSettings(prev => ({ ...prev, priorityThreshold: e.target.value as any }))}
                                        label="우선순위 임계값"
                                    >
                                        <MenuItem value="low">낮음</MenuItem>
                                        <MenuItem value="medium">보통</MenuItem>
                                        <MenuItem value="high">높음</MenuItem>
                                        <MenuItem value="critical">긴급</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default SmartNotificationSystem;
