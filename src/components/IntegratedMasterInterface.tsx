import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    LinearProgress,
    Alert,
    Snackbar,
    IconButton,
    Tooltip,
    Badge,
    Avatar,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Switch,
    FormControlLabel,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress
} from '@mui/material';
import {
    Chat as ChatIcon,
    Analytics as AnalyticsIcon,
    Security as SecurityIcon,
    Speed as SpeedIcon,
    Psychology as PsychologyIcon,
    DataUsage as DataIcon,
    Settings as SettingsIcon,
    Notifications as NotificationsIcon,
    Refresh as RefreshIcon,
    PlayArrow as PlayIcon,
    Pause as PauseIcon,
    Stop as StopIcon,
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { errorLogger } from '../utils/errorLogger';

// Helper function to safely convert unknown error types to Error objects
const toError = (err: unknown): Error => {
    if (err instanceof Error) {
        return err as Error;
    }
    // Error 생성자를 명시적으로 사용
    const ErrorConstructor = globalThis.Error;
    return new ErrorConstructor(String(err)) as Error;
};

// 통합된 인터페이스 타입 정의
interface SystemStatus {
    overall_health: string;
    systems: {
        [key: string]: {
            status: string;
            [key: string]: any;
        };
    };
    active_connections: number;
    total_conversations: number;
    last_updated: string;
}

interface ChatMessage {
    id: string;
    message: string;
    response: string;
    timestamp: string;
    analysis?: {
        emotion: any;
        data_insights: any;
        quality: any;
        performance: any;
        security: any;
    };
}

interface AnalyticsData {
    total_messages: number;
    active_users: number;
    system_performance: {
        avg_response_time: number;
        success_rate: number;
        uptime: number;
    };
    emotion_distribution: {
        positive: number;
        negative: number;
        neutral: number;
    };
}

// 통합 마스터 인터페이스 컴포넌트
const IntegratedMasterInterface: React.FC = () => {
    // 상태 관리
    const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [settings, setSettings] = useState({
        autoRefresh: true,
        notifications: true,
        darkMode: false,
        realTimeUpdates: true
    });
    const [showSettings, setShowSettings] = useState(false);
    const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);

    // WebSocket 연결 설정
    useEffect(() => {
        if (settings.realTimeUpdates) {
            const ws = new WebSocket('ws://localhost:8000/ws?client_id=master_interface');

            ws.onopen = () => {
                errorLogger.info('WebSocket 연결됨', { component: 'IntegratedMasterInterface', action: 'websocketConnect' });
                setWsConnection(ws);
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'chat_update') {
                    setChatMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        message: data.data.message || '',
                        response: data.data.response || '',
                        timestamp: data.timestamp,
                        analysis: data.data.analysis
                    }]);
                }
            };

            ws.onclose = () => {
                errorLogger.info('WebSocket 연결 해제됨', { component: 'IntegratedMasterInterface', action: 'websocketDisconnect' });
                setWsConnection(null);
            };

            return () => ws.close();
        }
    }, [settings.realTimeUpdates]);

    // 시스템 상태 조회
    const fetchSystemStatus = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:8000/api/status');
            const data = await response.json();
            setSystemStatus(data);
        } catch (error) {
            const err = toError(error);
            errorLogger.error('시스템 상태 조회 오류', err, {
                component: 'IntegratedMasterInterface',
                action: 'fetchSystemStatus',
            });
        }
    }, []);

    // 분석 데이터 조회
    const fetchAnalytics = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:8000/api/analytics');
            const data = await response.json();
            if (data.success) {
                setAnalytics(data.data);
            }
        } catch (error) {
            const err = toError(error);
            errorLogger.error('분석 데이터 조회 오류', err, {
                component: 'IntegratedMasterInterface',
                action: 'fetchAnalytics',
            });
        }
    }, []);

    // 자동 새로고침
    useEffect(() => {
        if (settings.autoRefresh) {
            const interval = setInterval(() => {
                fetchSystemStatus();
                fetchAnalytics();
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [settings.autoRefresh, fetchSystemStatus, fetchAnalytics]);

    // 초기 데이터 로드
    useEffect(() => {
        fetchSystemStatus();
        fetchAnalytics();
    }, [fetchSystemStatus, fetchAnalytics]);

    // 메시지 전송
    const sendMessage = async () => {
        if (!currentMessage.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: currentMessage,
                    user_id: 'master_interface',
                    context: {}
                }),
            });

            const data = await response.json();

            if (data.success) {
                setChatMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    message: currentMessage,
                    response: data.response,
                    timestamp: data.timestamp,
                    analysis: data.analysis
                }]);
                setCurrentMessage('');

                // 알림 추가
                if (settings.notifications) {
                    setNotifications(prev => [...prev, {
                        id: Date.now().toString(),
                        type: 'success',
                        message: '메시지가 성공적으로 처리되었습니다.',
                        timestamp: new Date().toISOString()
                    }]);
                }
            }
        } catch (error) {
            errorLogger.error('메시지 전송 오류', error instanceof Error ? error : new Error(String(error)), {
                component: 'IntegratedMasterInterface',
                action: 'sendMessage',
            });
            setNotifications(prev => [...prev, {
                id: Date.now().toString(),
                type: 'error',
                message: '메시지 전송에 실패했습니다.',
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // 시스템 상태 카드 컴포넌트
    const SystemStatusCard: React.FC<{ title: string; status: any; icon: React.ReactNode }> = ({ title, status, icon }) => (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                    {icon}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                        {title}
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                    상태: <Chip
                        label={status.status}
                        color={status.status === 'active' ? 'success' : 'error'}
                        size="small"
                    />
                </Typography>
                {status.accuracy && (
                    <Typography variant="body2" color="text.secondary">
                        정확도: {status.accuracy}%
                    </Typography>
                )}
                {status.pass_rate && (
                    <Typography variant="body2" color="text.secondary">
                        통과율: {status.pass_rate}%
                    </Typography>
                )}
                {status.security_score && (
                    <Typography variant="body2" color="text.secondary">
                        보안 점수: {status.security_score}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );

    // 탭 패널 컴포넌트
    const TabPanel: React.FC<{ children: React.ReactNode; value: number; index: number }> = ({ children, value, index }) => (
        <div hidden={value !== index}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );

    return (
        <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
            {/* 헤더 */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                        🚀 CORBU AI 통합 마스터 인터페이스
                    </Typography>
                    <Box display="flex" gap={1}>
                        <Tooltip title="시스템 상태 새로고침">
                            <IconButton onClick={fetchSystemStatus}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="설정">
                            <IconButton onClick={() => setShowSettings(true)}>
                                <SettingsIcon />
                            </IconButton>
                        </Tooltip>
                        <Badge badgeContent={notifications.length} color="error">
                            <IconButton>
                                <NotificationsIcon />
                            </IconButton>
                        </Badge>
                    </Box>
                </Box>
            </Paper>

            <Container maxWidth="xl">
                {/* 시스템 상태 요약 */}
                {systemStatus && (
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid sx={{ xs: 12, md: 3 }}>
                            <SystemStatusCard
                                title="감정 분석"
                                status={systemStatus.systems.emotion_recognition}
                                icon={<PsychologyIcon color="primary" />}
                            />
                        </Grid>
                        <Grid sx={{ xs: 12, md: 3 }}>
                            <SystemStatusCard
                                title="데이터 분석"
                                status={systemStatus.systems.data_analytics}
                                icon={<DataIcon color="primary" />}
                            />
                        </Grid>
                        <Grid sx={{ xs: 12, md: 3 }}>
                            <SystemStatusCard
                                title="품질 보증"
                                status={systemStatus.systems.quality_assurance}
                                icon={<CheckIcon color="primary" />}
                            />
                        </Grid>
                        <Grid sx={{ xs: 12, md: 3 }}>
                            <SystemStatusCard
                                title="보안 시스템"
                                status={systemStatus.systems.security_system}
                                icon={<SecurityIcon color="primary" />}
                            />
                        </Grid>
                    </Grid>
                )}

                {/* 메인 탭 인터페이스 */}
                <Paper sx={{ width: '100%' }}>
                    <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                        <Tab label="💬 통합 채팅" />
                        <Tab label="📊 실시간 분석" />
                        <Tab label="🔧 시스템 관리" />
                        <Tab label="📈 성능 모니터링" />
                    </Tabs>

                    {/* 채팅 탭 */}
                    <TabPanel value={activeTab} index={0}>
                        <Grid container spacing={3}>
                            <Grid sx={{ xs: 12, md: 8 }}>
                                <Paper sx={{ p: 2, height: 500, overflow: 'auto' }}>
                                    <Typography variant="h6" gutterBottom>
                                        통합 AI 채팅
                                    </Typography>
                                    <Box sx={{ mb: 2 }}>
                                        {chatMessages.map((msg) => (
                                            <motion.div
                                                key={msg.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <Card sx={{ mb: 2, p: 2 }}>
                                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                                        <strong>사용자:</strong> {msg.message}
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                                        <strong>AI:</strong> {msg.response}
                                                    </Typography>
                                                    {msg.analysis && (
                                                        <Box sx={{ mt: 1 }}>
                                                            <Chip
                                                                label={`감정: ${msg.analysis.emotion?.sentiment}`}
                                                                size="small"
                                                                color="primary"
                                                                sx={{ mr: 1 }}
                                                            />
                                                            <Chip
                                                                label={`신뢰도: ${Math.round((msg.analysis.emotion?.confidence || 0) * 100)}%`}
                                                                size="small"
                                                                color="secondary"
                                                            />
                                                        </Box>
                                                    )}
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </Box>
                                </Paper>
                            </Grid>
                            <Grid sx={{ xs: 12, md: 4 }}>
                                <Paper sx={{ p: 2, height: 500 }}>
                                    <Typography variant="h6" gutterBottom>
                                        메시지 입력
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        value={currentMessage}
                                        onChange={(e) => setCurrentMessage(e.target.value)}
                                        placeholder="메시지를 입력하세요..."
                                        sx={{ mb: 2 }}
                                    />
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={sendMessage}
                                        disabled={isLoading || !currentMessage.trim()}
                                        startIcon={isLoading ? <CircularProgress size={20} /> : <ChatIcon />}
                                    >
                                        {isLoading ? '처리 중...' : '메시지 전송'}
                                    </Button>

                                    <Divider sx={{ my: 2 }} />

                                    <Typography variant="h6" gutterBottom>
                                        연결 상태
                                    </Typography>
                                    <Box display="flex" alignItems="center" mb={1}>
                                        <Box
                                            sx={{
                                                width: 12,
                                                height: 12,
                                                borderRadius: '50%',
                                                bgcolor: wsConnection ? 'success.main' : 'error.main',
                                                mr: 1
                                            }}
                                        />
                                        <Typography variant="body2">
                                            {wsConnection ? '실시간 연결됨' : '연결 해제됨'}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </TabPanel>

                    {/* 분석 탭 */}
                    <TabPanel value={activeTab} index={1}>
                        {analytics && (
                            <Grid container spacing={3}>
                                <Grid sx={{ xs: 12, md: 6 }}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                시스템 성능
                                            </Typography>
                                            <List>
                                                <ListItem>
                                                    <ListItemText
                                                        primary="평균 응답 시간"
                                                        secondary={`${analytics.system_performance.avg_response_time}ms`}
                                                    />
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemText
                                                        primary="성공률"
                                                        secondary={`${(analytics.system_performance.success_rate * 100).toFixed(1)}%`}
                                                    />
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemText
                                                        primary="가동률"
                                                        secondary={`${analytics.system_performance.uptime}%`}
                                                    />
                                                </ListItem>
                                            </List>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid sx={{ xs: 12, md: 6 }}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                감정 분포
                                            </Typography>
                                            <Box sx={{ mt: 2 }}>
                                                <Box display="flex" justifyContent="space-between" mb={1}>
                                                    <Typography variant="body2">긍정</Typography>
                                                    <Typography variant="body2">
                                                        {(analytics.emotion_distribution.positive * 100).toFixed(1)}%
                                                    </Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={analytics.emotion_distribution.positive * 100}
                                                    color="success"
                                                    sx={{ mb: 2 }}
                                                />

                                                <Box display="flex" justifyContent="space-between" mb={1}>
                                                    <Typography variant="body2">부정</Typography>
                                                    <Typography variant="body2">
                                                        {(analytics.emotion_distribution.negative * 100).toFixed(1)}%
                                                    </Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={analytics.emotion_distribution.negative * 100}
                                                    color="error"
                                                    sx={{ mb: 2 }}
                                                />

                                                <Box display="flex" justifyContent="space-between" mb={1}>
                                                    <Typography variant="body2">중립</Typography>
                                                    <Typography variant="body2">
                                                        {(analytics.emotion_distribution.neutral * 100).toFixed(1)}%
                                                    </Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={analytics.emotion_distribution.neutral * 100}
                                                    color="info"
                                                />
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        )}
                    </TabPanel>

                    {/* 시스템 관리 탭 */}
                    <TabPanel value={activeTab} index={2}>
                        <Grid container spacing={3}>
                            <Grid sx={{ xs: 12, md: 6 }}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            시스템 제어
                                        </Typography>
                                        <List>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <PlayIcon color="success" />
                                                </ListItemIcon>
                                                <ListItemText primary="모든 서비스 시작" />
                                                <Button variant="outlined" size="small">
                                                    시작
                                                </Button>
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <PauseIcon color="warning" />
                                                </ListItemIcon>
                                                <ListItemText primary="서비스 일시정지" />
                                                <Button variant="outlined" size="small">
                                                    일시정지
                                                </Button>
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <StopIcon color="error" />
                                                </ListItemIcon>
                                                <ListItemText primary="서비스 중지" />
                                                <Button variant="outlined" size="small">
                                                    중지
                                                </Button>
                                            </ListItem>
                                        </List>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid sx={{ xs: 12, md: 6 }}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            설정
                                        </Typography>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={settings.autoRefresh}
                                                    onChange={(e) => setSettings(prev => ({ ...prev, autoRefresh: e.target.checked }))}
                                                />
                                            }
                                            label="자동 새로고침"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={settings.notifications}
                                                    onChange={(e) => setSettings(prev => ({ ...prev, notifications: e.target.checked }))}
                                                />
                                            }
                                            label="알림 활성화"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={settings.realTimeUpdates}
                                                    onChange={(e) => setSettings(prev => ({ ...prev, realTimeUpdates: e.target.checked }))}
                                                />
                                            }
                                            label="실시간 업데이트"
                                        />
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </TabPanel>

                    {/* 성능 모니터링 탭 */}
                    <TabPanel value={activeTab} index={3}>
                        <Typography variant="h6" gutterBottom>
                            실시간 성능 모니터링
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid sx={{ xs: 12, md: 4 }}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            CPU 사용률
                                        </Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={45}
                                            color="primary"
                                            sx={{ mb: 1 }}
                                        />
                                        <Typography variant="body2" color="text.secondary">
                                            45%
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid sx={{ xs: 12, md: 4 }}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            메모리 사용률
                                        </Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={68}
                                            color="secondary"
                                            sx={{ mb: 1 }}
                                        />
                                        <Typography variant="body2" color="text.secondary">
                                            68%
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid sx={{ xs: 12, md: 4 }}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            네트워크 사용률
                                        </Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={32}
                                            color="success"
                                            sx={{ mb: 1 }}
                                        />
                                        <Typography variant="body2" color="text.secondary">
                                            32%
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </TabPanel>
                </Paper>
            </Container>

            {/* 설정 다이얼로그 */}
            <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="sm" fullWidth>
                <DialogTitle>시스템 설정</DialogTitle>
                <DialogContent>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={settings.autoRefresh}
                                onChange={(e) => setSettings(prev => ({ ...prev, autoRefresh: e.target.checked }))}
                            />
                        }
                        label="자동 새로고침 (5초마다)"
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={settings.notifications}
                                onChange={(e) => setSettings(prev => ({ ...prev, notifications: e.target.checked }))}
                            />
                        }
                        label="알림 활성화"
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={settings.realTimeUpdates}
                                onChange={(e) => setSettings(prev => ({ ...prev, realTimeUpdates: e.target.checked }))}
                            />
                        }
                        label="실시간 업데이트 (WebSocket)"
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={settings.darkMode}
                                onChange={(e) => setSettings(prev => ({ ...prev, darkMode: e.target.checked }))}
                            />
                        }
                        label="다크 모드"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowSettings(false)}>닫기</Button>
                    <Button onClick={() => setShowSettings(false)} variant="contained">저장</Button>
                </DialogActions>
            </Dialog>

            {/* 알림 스낵바 */}
            <Snackbar
                open={notifications.length > 0}
                autoHideDuration={6000}
                onClose={() => setNotifications([])}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={notifications[0]?.type === 'error' ? 'error' : 'success'}
                    onClose={() => setNotifications([])}
                >
                    {notifications[0]?.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default IntegratedMasterInterface;
