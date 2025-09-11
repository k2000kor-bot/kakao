import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Chip,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    LinearProgress,
    Alert,
    AlertTitle,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Switch,
    FormControlLabel,
    Divider,
    Avatar,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Security,
    Warning,
    CheckCircle,
    Error,
    Info,
    Visibility,
    VisibilityOff,
    Lock,
    LockOpen,
    Shield,
    BugReport,
    Timeline,
    Notifications,
    Settings,
    Refresh,
    Add,
    Edit,
    Delete,
    Download,
    Upload,
    Search,
    FilterList,
    Sort,
    MoreVert,
    Person,
    Group,
    AdminPanelSettings,
    VerifiedUser,
    Block,
    Report,
    History,
    Analytics,
    Dashboard,
    SecurityUpdate,
    SecurityUpdateGood,
    SecurityUpdateWarning,
    VpnKey,
    Key,
    KeyOff,
    Password,
    Fingerprint,
    Face,
    QrCode,
    QrCodeScanner,
    Bluetooth,
    Wifi,
    WifiOff,
    NetworkCheck,
    NetworkLocked,
    Router,
    Storage,
    Cloud,
    CloudOff,
    Backup,
    Restore,
    Archive,
    Unarchive,
    DeleteForever,
    RestoreFromTrash,
    Verified,
    GppGood,
    GppBad,
    GppMaybe,
    Policy,
    Assignment,

} from '@mui/icons-material';

interface SecurityEvent {
    id: string;
    timestamp: string;
    type: 'threat' | 'warning' | 'info' | 'success';
    severity: 'critical' | 'high' | 'medium' | 'low';
    source: string;
    description: string;
    status: 'active' | 'resolved' | 'investigating';
    affectedUsers: number;
    impact: string;
}

interface SecurityPolicy {
    id: string;
    name: string;
    description: string;
    category: 'authentication' | 'authorization' | 'data' | 'network' | 'application';
    status: 'active' | 'inactive' | 'draft';
    priority: 'high' | 'medium' | 'low';
    lastUpdated: string;
    compliance: number;
}

interface UserSecurity {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'guest';
    lastLogin: string;
    loginAttempts: number;
    status: 'active' | 'locked' | 'suspended';
    twoFactorEnabled: boolean;
    riskScore: number;
    lastActivity: string;
}

interface SecurityMetrics {
    totalThreats: number;
    resolvedThreats: number;
    activeThreats: number;
    securityScore: number;
    complianceRate: number;
    usersAtRisk: number;
    systemHealth: number;
    lastScan: string;
}

const AdvancedSecurityDashboard: React.FC = () => {
    const [currentView, setCurrentView] = useState('overview');
    const [securityDialogOpen, setSecurityDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
    const [selectedPolicy, setSelectedPolicy] = useState<SecurityPolicy | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserSecurity | null>(null);

    // Mock data
    const securityMetrics: SecurityMetrics = {
        totalThreats: 156,
        resolvedThreats: 142,
        activeThreats: 14,
        securityScore: 94.2,
        complianceRate: 98.5,
        usersAtRisk: 3,
        systemHealth: 96.8,
        lastScan: '2024-08-26 10:30:00'
    };

    const securityEvents: SecurityEvent[] = [
        {
            id: '1',
            timestamp: '2024-08-26 10:25:00',
            type: 'threat',
            severity: 'high',
            source: '192.168.1.100',
            description: '의심스러운 로그인 시도 감지',
            status: 'investigating',
            affectedUsers: 1,
            impact: '계정 보안 위험'
        },
        {
            id: '2',
            timestamp: '2024-08-26 10:20:00',
            type: 'warning',
            severity: 'medium',
            source: 'API Gateway',
            description: '비정상적인 API 호출 패턴',
            status: 'active',
            affectedUsers: 5,
            impact: '성능 저하 가능성'
        },
        {
            id: '3',
            timestamp: '2024-08-26 10:15:00',
            type: 'info',
            severity: 'low',
            source: 'System Monitor',
            description: '정기 보안 스캔 완료',
            status: 'resolved',
            affectedUsers: 0,
            impact: '정상'
        }
    ];

    const securityPolicies: SecurityPolicy[] = [
        {
            id: '1',
            name: '강력한 비밀번호 정책',
            description: '최소 8자, 특수문자 포함 필수',
            category: 'authentication',
            status: 'active',
            priority: 'high',
            lastUpdated: '2024-08-25',
            compliance: 95
        },
        {
            id: '2',
            name: '2단계 인증 필수',
            description: '모든 관리자 계정에 2FA 적용',
            category: 'authentication',
            status: 'active',
            priority: 'high',
            lastUpdated: '2024-08-24',
            compliance: 100
        },
        {
            id: '3',
            name: '데이터 암호화 정책',
            description: '민감한 데이터는 AES-256으로 암호화',
            category: 'data',
            status: 'active',
            priority: 'high',
            lastUpdated: '2024-08-23',
            compliance: 98
        }
    ];

    const userSecurity: UserSecurity[] = [
        {
            id: '1',
            name: '김관리자',
            email: 'admin@corbu.ai',
            role: 'admin',
            lastLogin: '2024-08-26 10:00:00',
            loginAttempts: 1,
            status: 'active',
            twoFactorEnabled: true,
            riskScore: 15,
            lastActivity: '2024-08-26 10:30:00'
        },
        {
            id: '2',
            name: '이사용자',
            email: 'user@corbu.ai',
            role: 'user',
            lastLogin: '2024-08-26 09:45:00',
            loginAttempts: 3,
            status: 'active',
            twoFactorEnabled: false,
            riskScore: 45,
            lastActivity: '2024-08-26 10:15:00'
        },
        {
            id: '3',
            name: '박게스트',
            email: 'guest@corbu.ai',
            role: 'guest',
            lastLogin: '2024-08-26 08:30:00',
            loginAttempts: 5,
            status: 'locked',
            twoFactorEnabled: false,
            riskScore: 85,
            lastActivity: '2024-08-26 08:30:00'
        }
    ];

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'error';
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'info';
            default: return 'default';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'error';
            case 'resolved': return 'success';
            case 'investigating': return 'warning';
            default: return 'default';
        }
    };

    const getRiskColor = (riskScore: number) => {
        if (riskScore >= 70) return 'error';
        if (riskScore >= 40) return 'warning';
        return 'success';
    };

    const renderOverview = () => (
        <Box>
            <Typography variant="h4" gutterBottom>
                <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                보안 대시보드
            </Typography>

            {/* 보안 메트릭 카드 */}
            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Security color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">보안 점수</Typography>
                            </Box>
                            <Typography variant="h4" color="primary">
                                {securityMetrics.securityScore}%
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={securityMetrics.securityScore}
                                sx={{ mt: 1, height: 8, borderRadius: 4 }}
                            />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Warning color="warning" sx={{ mr: 1 }} />
                                <Typography variant="h6">활성 위협</Typography>
                            </Box>
                            <Typography variant="h4" color="warning.main">
                                {securityMetrics.activeThreats}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                총 {securityMetrics.totalThreats}개 중
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <CheckCircle color="success" sx={{ mr: 1 }} />
                                <Typography variant="h6">준수율</Typography>
                            </Box>
                            <Typography variant="h4" color="success.main">
                                {securityMetrics.complianceRate}%
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                보안 정책 준수
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Person color="info" sx={{ mr: 1 }} />
                                <Typography variant="h6">위험 사용자</Typography>
                            </Box>
                            <Typography variant="h4" color="error.main">
                                {securityMetrics.usersAtRisk}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                추가 모니터링 필요
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 보안 알림 */}
            {securityMetrics.activeThreats > 0 && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    <AlertTitle>보안 경고</AlertTitle>
                    현재 {securityMetrics.activeThreats}개의 활성 위협이 감지되었습니다. 즉시 조치가 필요합니다.
                </Alert>
            )}

            {/* 최근 보안 이벤트 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">최근 보안 이벤트</Typography>
                        <Button
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={() => setCurrentView('events')}
                        >
                            전체 보기
                        </Button>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>시간</TableCell>
                                    <TableCell>유형</TableCell>
                                    <TableCell>심각도</TableCell>
                                    <TableCell>설명</TableCell>
                                    <TableCell>상태</TableCell>
                                    <TableCell>조치</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {securityEvents.slice(0, 5).map((event) => (
                                    <TableRow key={event.id}>
                                        <TableCell>{event.timestamp}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={event.type === 'threat' ? '위협' :
                                                    event.type === 'warning' ? '경고' : '정보'}
                                                size="small"
                                                color={event.type === 'threat' ? 'error' :
                                                    event.type === 'warning' ? 'warning' : 'info'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={event.severity === 'critical' ? '치명적' :
                                                    event.severity === 'high' ? '높음' :
                                                        event.severity === 'medium' ? '보통' : '낮음'}
                                                size="small"
                                                color={getSeverityColor(event.severity) as any}
                                            />
                                        </TableCell>
                                        <TableCell>{event.description}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={event.status === 'active' ? '활성' :
                                                    event.status === 'resolved' ? '해결됨' : '조사중'}
                                                size="small"
                                                color={getStatusColor(event.status) as any}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => {
                                                    setSelectedEvent(event);
                                                    setSecurityDialogOpen(true);
                                                }}
                                            >
                                                상세보기
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );

    const renderEvents = () => (
        <Box>
            <Typography variant="h4" gutterBottom>
                <Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />
                보안 이벤트 관리
            </Typography>

            <Card>
                <CardContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>시간</TableCell>
                                    <TableCell>유형</TableCell>
                                    <TableCell>심각도</TableCell>
                                    <TableCell>소스</TableCell>
                                    <TableCell>설명</TableCell>
                                    <TableCell>영향받은 사용자</TableCell>
                                    <TableCell>상태</TableCell>
                                    <TableCell>조치</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {securityEvents.map((event) => (
                                    <TableRow key={event.id}>
                                        <TableCell>{event.timestamp}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={event.type === 'threat' ? '위협' :
                                                    event.type === 'warning' ? '경고' : '정보'}
                                                size="small"
                                                color={event.type === 'threat' ? 'error' :
                                                    event.type === 'warning' ? 'warning' : 'info'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={event.severity === 'critical' ? '치명적' :
                                                    event.severity === 'high' ? '높음' :
                                                        event.severity === 'medium' ? '보통' : '낮음'}
                                                size="small"
                                                color={getSeverityColor(event.severity) as any}
                                            />
                                        </TableCell>
                                        <TableCell>{event.source}</TableCell>
                                        <TableCell>{event.description}</TableCell>
                                        <TableCell>{event.affectedUsers}명</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={event.status === 'active' ? '활성' :
                                                    event.status === 'resolved' ? '해결됨' : '조사중'}
                                                size="small"
                                                color={getStatusColor(event.status) as any}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => {
                                                    setSelectedEvent(event);
                                                    setSecurityDialogOpen(true);
                                                }}
                                            >
                                                상세보기
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );

    const renderPolicies = () => (
        <Box>
            <Typography variant="h4" gutterBottom>
                <Policy sx={{ mr: 1, verticalAlign: 'middle' }} />
                보안 정책 관리
            </Typography>

            <Card>
                <CardContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>정책명</TableCell>
                                    <TableCell>카테고리</TableCell>
                                    <TableCell>상태</TableCell>
                                    <TableCell>우선순위</TableCell>
                                    <TableCell>준수율</TableCell>
                                    <TableCell>최종 업데이트</TableCell>
                                    <TableCell>조치</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {securityPolicies.map((policy) => (
                                    <TableRow key={policy.id}>
                                        <TableCell>
                                            <Typography variant="subtitle2">{policy.name}</Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {policy.description}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={policy.category === 'authentication' ? '인증' :
                                                    policy.category === 'authorization' ? '권한' :
                                                        policy.category === 'data' ? '데이터' :
                                                            policy.category === 'network' ? '네트워크' : '애플리케이션'}
                                                size="small"
                                                color="primary"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={policy.status === 'active' ? '활성' :
                                                    policy.status === 'inactive' ? '비활성' : '초안'}
                                                size="small"
                                                color={policy.status === 'active' ? 'success' : 'default'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={policy.priority === 'high' ? '높음' :
                                                    policy.priority === 'medium' ? '보통' : '낮음'}
                                                size="small"
                                                color={policy.priority === 'high' ? 'error' :
                                                    policy.priority === 'medium' ? 'warning' : 'success'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center">
                                                <Typography variant="body2" sx={{ mr: 1 }}>
                                                    {policy.compliance}%
                                                </Typography>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={policy.compliance}
                                                    sx={{ width: 60, height: 8, borderRadius: 4 }}
                                                />
                                            </Box>
                                        </TableCell>
                                        <TableCell>{policy.lastUpdated}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => {
                                                    setSelectedPolicy(policy);
                                                    setSecurityDialogOpen(true);
                                                }}
                                            >
                                                편집
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );

    const renderUsers = () => (
        <Box>
            <Typography variant="h4" gutterBottom>
                <Group sx={{ mr: 1, verticalAlign: 'middle' }} />
                사용자 보안 관리
            </Typography>

            <Card>
                <CardContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>사용자</TableCell>
                                    <TableCell>역할</TableCell>
                                    <TableCell>마지막 로그인</TableCell>
                                    <TableCell>로그인 시도</TableCell>
                                    <TableCell>상태</TableCell>
                                    <TableCell>2FA</TableCell>
                                    <TableCell>위험도</TableCell>
                                    <TableCell>조치</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {userSecurity.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <Box display="flex" alignItems="center">
                                                <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                                                    {user.name.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle2">{user.name}</Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {user.email}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.role === 'admin' ? '관리자' :
                                                    user.role === 'user' ? '사용자' : '게스트'}
                                                size="small"
                                                color={user.role === 'admin' ? 'error' :
                                                    user.role === 'user' ? 'primary' : 'default'}
                                            />
                                        </TableCell>
                                        <TableCell>{user.lastLogin}</TableCell>
                                        <TableCell>{user.loginAttempts}회</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.status === 'active' ? '활성' :
                                                    user.status === 'locked' ? '잠김' : '정지'}
                                                size="small"
                                                color={user.status === 'active' ? 'success' : 'error'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.twoFactorEnabled ? '활성' : '비활성'}
                                                size="small"
                                                color={user.twoFactorEnabled ? 'success' : 'default'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center">
                                                <Typography variant="body2" sx={{ mr: 1 }}>
                                                    {user.riskScore}
                                                </Typography>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={user.riskScore}
                                                    color={getRiskColor(user.riskScore) as any}
                                                    sx={{ width: 60, height: 8, borderRadius: 4 }}
                                                />
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setSecurityDialogOpen(true);
                                                }}
                                            >
                                                상세보기
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );

    const renderCurrentView = () => {
        switch (currentView) {
            case 'overview':
                return renderOverview();
            case 'events':
                return renderEvents();
            case 'policies':
                return renderPolicies();
            case 'users':
                return renderUsers();
            default:
                return renderOverview();
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* 네비게이션 */}
            <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid item>
                        <Button
                            variant={currentView === 'overview' ? 'contained' : 'outlined'}
                            startIcon={<Dashboard />}
                            onClick={() => setCurrentView('overview')}
                        >
                            개요
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant={currentView === 'events' ? 'contained' : 'outlined'}
                            startIcon={<Timeline />}
                            onClick={() => setCurrentView('events')}
                        >
                            보안 이벤트
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant={currentView === 'policies' ? 'contained' : 'outlined'}
                            startIcon={<Policy />}
                            onClick={() => setCurrentView('policies')}
                        >
                            보안 정책
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant={currentView === 'users' ? 'contained' : 'outlined'}
                            startIcon={<Group />}
                            onClick={() => setCurrentView('users')}
                        >
                            사용자 보안
                        </Button>
                    </Grid>
                </Grid>
            </Box>

            {/* 메인 콘텐츠 */}
            {renderCurrentView()}

            {/* 보안 이벤트 상세 다이얼로그 */}
            <Dialog
                open={securityDialogOpen && selectedEvent !== null}
                onClose={() => setSecurityDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center">
                        <Warning color="warning" sx={{ mr: 1 }} />
                        보안 이벤트 상세 정보
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedEvent && (
                        <Box>
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">이벤트 ID</Typography>
                                    <Typography variant="body1">{selectedEvent.id}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">발생 시간</Typography>
                                    <Typography variant="body1">{selectedEvent.timestamp}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">유형</Typography>
                                    <Chip
                                        label={selectedEvent.type === 'threat' ? '위협' :
                                            selectedEvent.type === 'warning' ? '경고' : '정보'}
                                        color={selectedEvent.type === 'threat' ? 'error' :
                                            selectedEvent.type === 'warning' ? 'warning' : 'info'}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">심각도</Typography>
                                    <Chip
                                        label={selectedEvent.severity === 'critical' ? '치명적' :
                                            selectedEvent.severity === 'high' ? '높음' :
                                                selectedEvent.severity === 'medium' ? '보통' : '낮음'}
                                        color={getSeverityColor(selectedEvent.severity) as any}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="textSecondary">소스</Typography>
                                    <Typography variant="body1">{selectedEvent.source}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="textSecondary">설명</Typography>
                                    <Typography variant="body1">{selectedEvent.description}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">영향받은 사용자</Typography>
                                    <Typography variant="body1">{selectedEvent.affectedUsers}명</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">영향</Typography>
                                    <Typography variant="body1">{selectedEvent.impact}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="textSecondary">상태</Typography>
                                    <Chip
                                        label={selectedEvent.status === 'active' ? '활성' :
                                            selectedEvent.status === 'resolved' ? '해결됨' : '조사중'}
                                        color={getStatusColor(selectedEvent.status) as any}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSecurityDialogOpen(false)}>닫기</Button>
                    <Button variant="contained" color="primary">
                        조치 취하기
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 보안 정책 상세 다이얼로그 */}
            <Dialog
                open={securityDialogOpen && selectedPolicy !== null}
                onClose={() => setSecurityDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center">
                        <Policy color="primary" sx={{ mr: 1 }} />
                        보안 정책 편집
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedPolicy && (
                        <Box>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="정책명"
                                        defaultValue={selectedPolicy.name}
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="설명"
                                        defaultValue={selectedPolicy.description}
                                        multiline
                                        rows={3}
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel>카테고리</InputLabel>
                                        <Select
                                            defaultValue={selectedPolicy.category}
                                            label="카테고리"
                                        >
                                            <MenuItem value="authentication">인증</MenuItem>
                                            <MenuItem value="authorization">권한</MenuItem>
                                            <MenuItem value="data">데이터</MenuItem>
                                            <MenuItem value="network">네트워크</MenuItem>
                                            <MenuItem value="application">애플리케이션</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6}>
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel>우선순위</InputLabel>
                                        <Select
                                            defaultValue={selectedPolicy.priority}
                                            label="우선순위"
                                        >
                                            <MenuItem value="high">높음</MenuItem>
                                            <MenuItem value="medium">보통</MenuItem>
                                            <MenuItem value="low">낮음</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={<Switch defaultChecked={selectedPolicy.status === 'active'} />}
                                        label="정책 활성화"
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSecurityDialogOpen(false)}>취소</Button>
                    <Button variant="contained" color="primary">
                        저장
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 사용자 보안 상세 다이얼로그 */}
            <Dialog
                open={securityDialogOpen && selectedUser !== null}
                onClose={() => setSecurityDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center">
                        <Person color="info" sx={{ mr: 1 }} />
                        사용자 보안 상세 정보
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedUser && (
                        <Box>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <Avatar sx={{ mr: 2, width: 64, height: 64 }}>
                                            {selectedUser.name.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6">{selectedUser.name}</Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {selectedUser.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">역할</Typography>
                                    <Chip
                                        label={selectedUser.role === 'admin' ? '관리자' :
                                            selectedUser.role === 'user' ? '사용자' : '게스트'}
                                        color={selectedUser.role === 'admin' ? 'error' :
                                            selectedUser.role === 'user' ? 'primary' : 'default'}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">상태</Typography>
                                    <Chip
                                        label={selectedUser.status === 'active' ? '활성' :
                                            selectedUser.status === 'locked' ? '잠김' : '정지'}
                                        color={selectedUser.status === 'active' ? 'success' : 'error'}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">마지막 로그인</Typography>
                                    <Typography variant="body1">{selectedUser.lastLogin}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">로그인 시도</Typography>
                                    <Typography variant="body1">{selectedUser.loginAttempts}회</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">2단계 인증</Typography>
                                    <Chip
                                        label={selectedUser.twoFactorEnabled ? '활성' : '비활성'}
                                        color={selectedUser.twoFactorEnabled ? 'success' : 'default'}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">위험도</Typography>
                                    <Box display="flex" alignItems="center">
                                        <Typography variant="body1" sx={{ mr: 1 }}>
                                            {selectedUser.riskScore}
                                        </Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={selectedUser.riskScore}
                                            color={getRiskColor(selectedUser.riskScore) as any}
                                            sx={{ width: 100, height: 10, borderRadius: 5 }}
                                        />
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="textSecondary">마지막 활동</Typography>
                                    <Typography variant="body1">{selectedUser.lastActivity}</Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSecurityDialogOpen(false)}>닫기</Button>
                    <Button variant="contained" color="primary">
                        보안 설정 변경
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdvancedSecurityDashboard;
