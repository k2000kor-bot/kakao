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
    CircularProgress
} from '@mui/material';
import {
    Settings,
    Refresh,
    CheckCircle,
    Error,
    Warning,
    Info,
    Speed,
    Memory,
    Storage,
    NetworkCheck,
    Security,
    Analytics,
    Psychology,
    AutoAwesome,
    Timeline,
    Assessment,
    Lightbulb,
    Download,
    Upload,
    PlayArrow,
    Stop,
    Pause
} from '@mui/icons-material';
import integratedSystemAPI, { SystemStatus } from '../../services/integratedSystemAPI';

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
            id={`system-tabpanel-${index}`}
            aria-labelledby={`system-tab-${index}`}
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

const SystemIntegrationDashboard: React.FC = () => {
    const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState(0);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(30000); // 30초
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [serviceDetails, setServiceDetails] = useState<any>(null);

    useEffect(() => {
        loadSystemStatus();

        if (autoRefresh) {
            const interval = setInterval(loadSystemStatus, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [autoRefresh, refreshInterval]);

    const loadSystemStatus = async () => {
        setIsLoading(true);
        try {
            const status = await integratedSystemAPI.checkSystemHealth();
            setSystemStatus(status);
        } catch (error) {
            console.error('시스템 상태 로드 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleServiceClick = async (serviceName: string) => {
        setSelectedService(serviceName);
        try {
            // 서비스별 상세 정보 로드
            const details = await integratedSystemAPI.getServiceStatus(serviceName);
            setServiceDetails(details);
        } catch (error) {
            console.error('서비스 상세 정보 로드 실패:', error);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'up':
            case 'healthy':
                return <CheckCircle color="success" />;
            case 'down':
            case 'unhealthy':
                return <Error color="error" />;
            case 'degraded':
                return <Warning color="warning" />;
            default:
                return <Info color="info" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'up':
            case 'healthy':
                return '#4CAF50';
            case 'down':
            case 'unhealthy':
                return '#F44336';
            case 'degraded':
                return '#FF9800';
            default:
                return '#9E9E9E';
        }
    };

    const getOverallStatusColor = () => {
        if (!systemStatus) return '#9E9E9E';
        return getStatusColor(systemStatus.status);
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };

    const handleRefresh = () => {
        loadSystemStatus();
    };

    const handleAutoRefreshToggle = () => {
        setAutoRefresh(!autoRefresh);
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
                🔗 시스템 통합 대시보드
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                CORBU AI 시스템의 모든 서비스 상태를 모니터링하고 관리합니다.
            </Typography>

            {/* 제어 패널 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton onClick={handleRefresh} disabled={isLoading}>
                                <Refresh />
                            </IconButton>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={autoRefresh}
                                        onChange={handleAutoRefreshToggle}
                                    />
                                }
                                label="자동 새로고침"
                            />
                            {isLoading && <CircularProgress size={20} />}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ bgcolor: getOverallStatusColor() }}>
                                {systemStatus ? getStatusIcon(systemStatus.status) : <Info />}
                            </Avatar>
                            <Typography variant="h6">
                                전체 상태: {systemStatus?.status || '확인 중...'}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* 탭 네비게이션 */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={selectedTab} onChange={handleTabChange}>
                    <Tab label="서비스 상태" />
                    <Tab label="성능 메트릭" />
                    <Tab label="품질 보증" />
                    <Tab label="데이터 분석" />
                    <Tab label="시스템 설정" />
                </Tabs>
            </Box>

            {/* 서비스 상태 탭 */}
            <TabPanel value={selectedTab} index={0}>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }} spacing={3}>
                    {systemStatus && Object.entries(systemStatus.services).map(([serviceName, service]) => (
                        <Grid sx={{ xs: 12, sm: 6, md: 4 }} key={serviceName}>
                            <Card
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover': { boxShadow: 3 }
                                }}
                                onClick={() => handleServiceClick(serviceName)}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Avatar sx={{ bgcolor: getStatusColor(service.status), mr: 2 }}>
                                            {getStatusIcon(service.status)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                                                {serviceName} 서비스
                                            </Typography>
                                            <Chip
                                                label={service.status}
                                                size="small"
                                                sx={{
                                                    bgcolor: getStatusColor(service.status),
                                                    color: 'white',
                                                    fontSize: '0.7rem'
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                    {service.responseTime && (
                                        <Typography variant="body2" color="text.secondary">
                                            응답 시간: {service.responseTime}ms
                                        </Typography>
                                    )}
                                    <Typography variant="body2" color="text.secondary">
                                        마지막 확인: {service.lastCheck ? new Date(service.lastCheck).toLocaleTimeString() : 'N/A'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    ))}
                </Box>

                {/* 시스템 정보 */}
                <Card sx={{ mt: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            시스템 정보
                        </Typography>
                        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }} spacing={2}>
                            <Grid sx={{ xs: 12, sm: 6 }}>
                                <Typography variant="body2" color="text.secondary">
                                    버전: {systemStatus?.version || 'N/A'}
                                </Typography>
                            </Box>
                            <Grid sx={{ xs: 12, sm: 6 }}>
                                <Typography variant="body2" color="text.secondary">
                                    가동 시간: {systemStatus ? Math.floor(systemStatus.uptime / 1000 / 60) : 0}분
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </TabPanel>

            {/* 성능 메트릭 탭 */}
            <TabPanel value={selectedTab} index={1}>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }} spacing={3}>
                    <Grid sx={{ xs: 12, md: 6 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    <Speed sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    응답 시간
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={75}
                                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                    평균: 245ms
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                    <Grid sx={{ xs: 12, md: 6 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    <Memory sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    메모리 사용량
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={60}
                                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                    2.4GB / 4GB
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                    <Grid sx={{ xs: 12, md: 6 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    <Storage sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    디스크 사용량
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={45}
                                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                    45GB / 100GB
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                    <Grid sx={{ xs: 12, md: 6 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    <NetworkCheck sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    네트워크 처리량
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={80}
                                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                    1.2MB/s
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </TabPanel>

            {/* 품질 보증 탭 */}
            <TabPanel value={selectedTab} index={2}>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }} spacing={3}>
                    <Grid sx={{ xs: 12, md: 6 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    테스트 스위트
                                </Typography>
                                <List>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CheckCircle color="success" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="기능 테스트"
                                            secondary="통과율: 95%"
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CheckCircle color="success" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="성능 테스트"
                                            secondary="통과율: 88%"
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Warning color="warning" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="보안 테스트"
                                            secondary="통과율: 92%"
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
                                    <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    보안 상태
                                </Typography>
                                <Alert severity="success" sx={{ mb: 2 }}>
                                    <AlertTitle>보안 상태 양호</AlertTitle>
                                    모든 보안 검사가 통과되었습니다.
                                </Alert>
                                <Button
                                    variant="contained"
                                    startIcon={<PlayArrow />}
                                    size="small"
                                    sx={{ mr: 1 }}
                                >
                                    테스트 실행
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<Download />}
                                    size="small"
                                >
                                    보고서 다운로드
                                </Button>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </TabPanel>

            {/* 데이터 분석 탭 */}
            <TabPanel value={selectedTab} index={3}>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }} spacing={3}>
                    <Grid sx={{ xs: 12, md: 6 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    <Analytics sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    데이터 소스
                                </Typography>
                                <List>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CheckCircle color="success" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="사용자 행동 데이터"
                                            secondary="활성 상태"
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CheckCircle color="success" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="API 로그"
                                            secondary="활성 상태"
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
                                    <Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    분석 작업
                                </Typography>
                                <List>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CheckCircle color="success" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="사용자 패턴 분석"
                                            secondary="완료됨"
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CircularProgress size={20} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="성능 분석"
                                            secondary="진행 중 (65%)"
                                        />
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </TabPanel>

            {/* 시스템 설정 탭 */}
            <TabPanel value={selectedTab} index={4}>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }} spacing={3}>
                    <Grid sx={{ xs: 12, md: 6 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    <Settings sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    일반 설정
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <FormControlLabel
                                        control={<Switch defaultChecked />}
                                        label="자동 백업"
                                    />
                                    <FormControlLabel
                                        control={<Switch defaultChecked />}
                                        label="실시간 모니터링"
                                    />
                                    <FormControlLabel
                                        control={<Switch />}
                                        label="디버그 모드"
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                    <Grid sx={{ xs: 12, md: 6 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    <AutoAwesome sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    AI 설정
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <FormControlLabel
                                        control={<Switch defaultChecked />}
                                        label="자동 학습"
                                    />
                                    <FormControlLabel
                                        control={<Switch defaultChecked />}
                                        label="감정 인식"
                                    />
                                    <FormControlLabel
                                        control={<Switch />}
                                        label="고급 분석"
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </TabPanel>

            {/* 서비스 상세 다이얼로그 */}
            <Dialog
                open={!!selectedService}
                onClose={() => setSelectedService(null)}
                maxWidth="md"
                fullWidth
            >
                {selectedService && (
                    <>
                        <DialogTitle>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ bgcolor: getStatusColor(systemStatus?.services[selectedService]?.status || 'unknown') }}>
                                    {getStatusIcon(systemStatus?.services[selectedService]?.status || 'unknown')}
                                </Avatar>
                                {selectedService} 서비스 상세 정보
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
                                            <TableCell>상태</TableCell>
                                            <TableCell align="right">
                                                <Chip
                                                    label={systemStatus?.services[selectedService]?.status || 'unknown'}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: getStatusColor(systemStatus?.services[selectedService]?.status || 'unknown'),
                                                        color: 'white'
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>응답 시간</TableCell>
                                            <TableCell align="right">
                                                {systemStatus?.services[selectedService]?.responseTime || 'N/A'}ms
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>마지막 확인</TableCell>
                                            <TableCell align="right">
                                                {systemStatus?.services[selectedService]?.lastCheck ?
                                                    new Date(systemStatus.services[selectedService].lastCheck!).toLocaleString() :
                                                    'N/A'
                                                }
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setSelectedService(null)}>닫기</Button>
                            <Button variant="contained" startIcon={<Refresh />}>
                                새로고침
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default SystemIntegrationDashboard;
