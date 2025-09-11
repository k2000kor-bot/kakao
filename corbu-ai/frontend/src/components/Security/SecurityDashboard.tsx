import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Chip,
    LinearProgress,
    IconButton,
    Tooltip,
    Alert,
    AlertTitle,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    Badge,
    Switch,
    FormControlLabel,
    Tabs,
    Tab,
    CircularProgress,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import {
    Security,
    Shield,
    Lock,
    Warning,
    CheckCircle,
    Error,
    Info,
    Refresh,
    Settings,
    Visibility,
    VisibilityOff,
    Person,
    AdminPanelSettings,
    Login,
    Logout,
    Key,
    History,
    Assessment,
    Notifications,
    Block,
    Check,
    Close
} from '@mui/icons-material';
import securityService, { SecurityEvent, SecurityConfig, User } from '../../services/securityService';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`security-tabpanel-${index}`}
            aria-labelledby={`security-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const SecurityDashboard: React.FC = () => {
    const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
    const [securityConfig, setSecurityConfig] = useState<SecurityConfig | null>(null);
    const [securityMetrics, setSecurityMetrics] = useState<any>(null);
    const [selectedTab, setSelectedTab] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
    const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
    const [tempConfig, setTempConfig] = useState<SecurityConfig | null>(null);

    useEffect(() => {
        loadSecurityData();

        // 30초마다 보안 이벤트 업데이트
        const interval = setInterval(loadSecurityEvents, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadSecurityData = async () => {
        setIsLoading(true);
        try {
            await Promise.all([
                loadSecurityEvents(),
                loadSecurityConfig(),
                loadSecurityMetrics()
            ]);
        } catch (error) {
            console.error('보안 데이터 로드 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadSecurityEvents = async () => {
        try {
            const events = await securityService.getSecurityEvents(50);
            setSecurityEvents(events);
        } catch (error) {
            console.error('보안 이벤트 로드 실패:', error);
        }
    };

    const loadSecurityConfig = async () => {
        try {
            const config = await securityService.getSecurityConfig();
            setSecurityConfig(config);
            setTempConfig(config);
        } catch (error) {
            console.error('보안 설정 로드 실패:', error);
        }
    };

    const loadSecurityMetrics = async () => {
        try {
            const metrics = await securityService.getSecurityMetrics();
            setSecurityMetrics(metrics);
        } catch (error) {
            console.error('보안 메트릭 로드 실패:', error);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };

    const handleConfigSave = async () => {
        if (!tempConfig) return;

        try {
            const success = await securityService.updateSecurityConfig(tempConfig);
            if (success) {
                setSecurityConfig(tempConfig);
                setIsConfigDialogOpen(false);
            }
        } catch (error) {
            console.error('보안 설정 저장 실패:', error);
        }
    };

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'login':
                return <Login color="success" />;
            case 'logout':
                return <Logout color="info" />;
            case 'failed_login':
                return <Error color="error" />;
            case 'permission_denied':
                return <Block color="warning" />;
            case 'suspicious_activity':
                return <Warning color="error" />;
            default:
                return <Info color="info" />;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'low':
                return '#4CAF50';
            case 'medium':
                return '#FF9800';
            case 'high':
                return '#F44336';
            case 'critical':
                return '#9C27B0';
            default:
                return '#9E9E9E';
        }
    };

    const getEventTypeLabel = (type: string) => {
        switch (type) {
            case 'login':
                return '로그인';
            case 'logout':
                return '로그아웃';
            case 'failed_login':
                return '로그인 실패';
            case 'permission_denied':
                return '권한 거부';
            case 'suspicious_activity':
                return '의심스러운 활동';
            default:
                return type;
        }
    };

    const getSeverityLabel = (severity: string) => {
        switch (severity) {
            case 'low':
                return '낮음';
            case 'medium':
                return '보통';
            case 'high':
                return '높음';
            case 'critical':
                return '심각';
            default:
                return severity;
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{
                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold'
            }}>
                🔒 보안 대시보드
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                시스템 보안 상태를 모니터링하고 보안 설정을 관리합니다.
            </Typography>

            {/* 보안 상태 요약 */}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }} spacing={3} sx={{ mb: 3 }}>
                <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Security color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">보안 이벤트</Typography>
                            </Box>
                            <Typography variant="h4" color="primary">
                                {securityMetrics?.totalEvents || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                총 이벤트 수
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Error color="error" sx={{ mr: 1 }} />
                                <Typography variant="h6">로그인 실패</Typography>
                            </Box>
                            <Typography variant="h4" color="error">
                                {securityMetrics?.failedLogins || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                실패한 시도
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Warning color="warning" sx={{ mr: 1 }} />
                                <Typography variant="h6">의심 활동</Typography>
                            </Box>
                            <Typography variant="h4" color="warning">
                                {securityMetrics?.suspiciousActivities || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                높은 위험도
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Shield color="success" sx={{ mr: 1 }} />
                                <Typography variant="h6">보안 점수</Typography>
                            </Box>
                            <Typography variant="h4" color="success">
                                {securityConfig ? '85' : 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                전체 보안 점수
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            {/* 제어 패널 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">보안 관리</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton onClick={loadSecurityData} disabled={isLoading}>
                                <Refresh />
                            </IconButton>
                            <Button
                                variant="outlined"
                                startIcon={<Settings />}
                                onClick={() => setIsConfigDialogOpen(true)}
                            >
                                보안 설정
                            </Button>
                            {isLoading && <CircularProgress size={20} />}
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* 탭 네비게이션 */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={selectedTab} onChange={handleTabChange}>
                    <Tab label="보안 이벤트" />
                    <Tab label="사용자 관리" />
                    <Tab label="권한 관리" />
                    <Tab label="보안 정책" />
                </Tabs>
            </Box>

            {/* 보안 이벤트 탭 */}
            <TabPanel value={selectedTab} index={0}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            최근 보안 이벤트
                        </Typography>
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>시간</TableCell>
                                        <TableCell>이벤트</TableCell>
                                        <TableCell>사용자</TableCell>
                                        <TableCell>IP 주소</TableCell>
                                        <TableCell>심각도</TableCell>
                                        <TableCell>상세</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {securityEvents.slice(0, 20).map((event) => (
                                        <TableRow key={event.id}>
                                            <TableCell>
                                                {new Date(event.timestamp).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {getEventIcon(event.type)}
                                                    {getEventTypeLabel(event.type)}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                {event.userId || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {event.ipAddress}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={getSeverityLabel(event.severity)}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: getSeverityColor(event.severity),
                                                        color: 'white',
                                                        fontSize: '0.7rem'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="small"
                                                    onClick={() => setSelectedEvent(event)}
                                                >
                                                    보기
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </TabPanel>

            {/* 사용자 관리 탭 */}
            <TabPanel value={selectedTab} index={1}>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }} spacing={3}>
                    <Grid sx={{ xs: 12, md: 6 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    활성 사용자
                                </Typography>
                                <List>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Person color="primary" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="관리자"
                                            secondary="admin@corbu.ai • 마지막 로그인: 2분 전"
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Person color="success" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="사용자1"
                                            secondary="user1@corbu.ai • 마지막 로그인: 1시간 전"
                                        />
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>
                    </Box>
                    <Grid sx={{ xs: 12, md: 6 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    사용자 통계
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            총 사용자 수
                                        </Typography>
                                        <Typography variant="h6">1,234</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            활성 사용자 (24시간)
                                        </Typography>
                                        <Typography variant="h6">89</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            새 사용자 (7일)
                                        </Typography>
                                        <Typography variant="h6">23</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </TabPanel>

            {/* 권한 관리 탭 */}
            <TabPanel value={selectedTab} index={2}>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }} spacing={3}>
                    <Grid sx={{ xs: 12, md: 6 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    역할별 권한
                                </Typography>
                                <List>
                                    <ListItem>
                                        <ListItemIcon>
                                            <AdminPanelSettings color="primary" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="관리자"
                                            secondary="모든 권한"
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Person color="success" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="사용자"
                                            secondary="기본 권한"
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Visibility color="info" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="게스트"
                                            secondary="읽기 전용"
                                        />
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>
                    </Box>
                    <Grid sx={{ xs: 12, md: 6 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    권한 설정
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <FormControlLabel
                                        control={<Switch defaultChecked />}
                                        label="파일 업로드"
                                    />
                                    <FormControlLabel
                                        control={<Switch defaultChecked />}
                                        label="AI 분석 실행"
                                    />
                                    <FormControlLabel
                                        control={<Switch />}
                                        label="시스템 설정 변경"
                                    />
                                    <FormControlLabel
                                        control={<Switch defaultChecked />}
                                        label="보고서 생성"
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </TabPanel>

            {/* 보안 정책 탭 */}
            <TabPanel value={selectedTab} index={3}>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }} spacing={3}>
                    <Grid sx={{ xs: 12, md: 6 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    비밀번호 정책
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <TextField
                                        label="최소 길이"
                                        type="number"
                                        value={securityConfig?.passwordPolicy.minLength || 8}
                                        size="small"
                                    />
                                    <FormControlLabel
                                        control={<Switch defaultChecked />}
                                        label="대문자 포함"
                                    />
                                    <FormControlLabel
                                        control={<Switch defaultChecked />}
                                        label="소문자 포함"
                                    />
                                    <FormControlLabel
                                        control={<Switch defaultChecked />}
                                        label="숫자 포함"
                                    />
                                    <FormControlLabel
                                        control={<Switch defaultChecked />}
                                        label="특수문자 포함"
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                    <Grid sx={{ xs: 12, md: 6 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    세션 관리
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <TextField
                                        label="세션 타임아웃 (분)"
                                        type="number"
                                        value={securityConfig ? securityConfig.sessionTimeout / (1000 * 60) : 30}
                                        size="small"
                                    />
                                    <TextField
                                        label="최대 로그인 시도"
                                        type="number"
                                        value={securityConfig?.maxLoginAttempts || 5}
                                        size="small"
                                    />
                                    <TextField
                                        label="잠금 시간 (분)"
                                        type="number"
                                        value={securityConfig ? securityConfig.lockoutDuration / (1000 * 60) : 15}
                                        size="small"
                                    />
                                    <FormControlLabel
                                        control={<Switch />}
                                        label="2단계 인증 필수"
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </TabPanel>

            {/* 보안 이벤트 상세 다이얼로그 */}
            <Dialog
                open={!!selectedEvent}
                onClose={() => setSelectedEvent(null)}
                maxWidth="md"
                fullWidth
            >
                {selectedEvent && (
                    <>
                        <DialogTitle>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {getEventIcon(selectedEvent.type)}
                                보안 이벤트 상세 정보
                            </Box>
                        </DialogTitle>
                        <DialogContent>
                            <TableContainer component={Paper}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>속성</TableCell>
                                            <TableCell align="right">값</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>이벤트 ID</TableCell>
                                            <TableCell align="right">{selectedEvent.id}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>타입</TableCell>
                                            <TableCell align="right">{getEventTypeLabel(selectedEvent.type)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>사용자 ID</TableCell>
                                            <TableCell align="right">{selectedEvent.userId || 'N/A'}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>IP 주소</TableCell>
                                            <TableCell align="right">{selectedEvent.ipAddress}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>User Agent</TableCell>
                                            <TableCell align="right">{selectedEvent.userAgent}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>심각도</TableCell>
                                            <TableCell align="right">
                                                <Chip
                                                    label={getSeverityLabel(selectedEvent.severity)}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: getSeverityColor(selectedEvent.severity),
                                                        color: 'white'
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>시간</TableCell>
                                            <TableCell align="right">
                                                {new Date(selectedEvent.timestamp).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    상세 정보:
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {JSON.stringify(selectedEvent.details, null, 2)}
                                </Typography>
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setSelectedEvent(null)}>닫기</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* 보안 설정 다이얼로그 */}
            <Dialog
                open={isConfigDialogOpen}
                onClose={() => setIsConfigDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>보안 설정</DialogTitle>
                <DialogContent>
                    {tempConfig && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                            <Typography variant="h6">비밀번호 정책</Typography>
                            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }} spacing={2}>
                                <Grid sx={{ xs: 6 }}>
                                    <TextField
                                        label="최소 길이"
                                        type="number"
                                        value={tempConfig.passwordPolicy.minLength}
                                        onChange={(e) => setTempConfig({
                                            ...tempConfig,
                                            passwordPolicy: {
                                                ...tempConfig.passwordPolicy,
                                                minLength: parseInt(e.target.value) || 8
                                            }
                                        })}
                                        fullWidth
                                    />
                                </Box>
                                <Grid sx={{ xs: 6 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>세션 타임아웃 (분)</InputLabel>
                                        <Select
                                            value={tempConfig.sessionTimeout / (1000 * 60)}
                                            onChange={(e) => setTempConfig({
                                                ...tempConfig,
                                                sessionTimeout: (e.target.value as number) * 1000 * 60
                                            })}
                                        >
                                            <MenuItem value={15}>15분</MenuItem>
                                            <MenuItem value={30}>30분</MenuItem>
                                            <MenuItem value={60}>1시간</MenuItem>
                                            <MenuItem value={120}>2시간</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Box>

                            <Typography variant="h6">보안 기능</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={tempConfig.requireTwoFactor}
                                            onChange={(e) => setTempConfig({
                                                ...tempConfig,
                                                requireTwoFactor: e.target.checked
                                            })}
                                        />
                                    }
                                    label="2단계 인증 필수"
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={tempConfig.encryptionEnabled}
                                            onChange={(e) => setTempConfig({
                                                ...tempConfig,
                                                encryptionEnabled: e.target.checked
                                            })}
                                        />
                                    }
                                    label="데이터 암호화"
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={tempConfig.auditLogging}
                                            onChange={(e) => setTempConfig({
                                                ...tempConfig,
                                                auditLogging: e.target.checked
                                            })}
                                        />
                                    }
                                    label="감사 로깅"
                                />
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsConfigDialogOpen(false)}>취소</Button>
                    <Button onClick={handleConfigSave} variant="contained">저장</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SecurityDashboard;
