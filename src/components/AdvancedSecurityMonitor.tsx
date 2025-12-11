import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    LinearProgress,
    Chip,
    Grid,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Paper,
    Tabs,
    Tab,
    Switch,
    FormControlLabel,
    Slider,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Tooltip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider
} from '@mui/material';
import {
    Security,
    Shield,
    Lock,
    Warning,
    Error,
    CheckCircle,
    Info,
    Visibility,
    VisibilityOff,
    Key,
    Fingerprint,
    VpnKey,
    SecurityUpdate,
    BugReport,
    Analytics,
    Monitor,
    Settings,
    Refresh,
    PlayArrow,
    Pause,
    Stop,
    ExpandMore,
    TrendingUp,
    TrendingDown,
    Speed,
    Memory,
    NetworkCheck,
    Storage
} from '@mui/icons-material';
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

interface SecurityMetrics {
    threatLevel: 'low' | 'medium' | 'high' | 'critical';
    activeThreats: number;
    blockedAttempts: number;
    vulnerabilities: number;
    securityScore: number;
    lastScan: string;
    encryptionStatus: 'active' | 'inactive' | 'error';
    firewallStatus: 'active' | 'inactive' | 'error';
    antivirusStatus: 'active' | 'inactive' | 'error';
}

interface SecurityEvent {
    id: string;
    type: 'threat' | 'vulnerability' | 'access' | 'system';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    timestamp: string;
    source: string;
    status: 'active' | 'resolved' | 'investigating';
    action: string;
}

interface SecurityPolicy {
    id: string;
    name: string;
    type: 'access' | 'data' | 'network' | 'system';
    status: 'active' | 'inactive' | 'pending';
    description: string;
    lastUpdated: string;
    compliance: number;
}

interface AuditLog {
    id: string;
    user: string;
    action: string;
    resource: string;
    timestamp: string;
    ip: string;
    status: 'success' | 'failed' | 'blocked';
    details: string;
}

function AdvancedSecurityMonitor() {
    const [activeTab, setActiveTab] = useState(0);
    const [metrics, setMetrics] = useState<SecurityMetrics>({
        threatLevel: 'low',
        activeThreats: 0,
        blockedAttempts: 0,
        vulnerabilities: 0,
        securityScore: 95,
        lastScan: '2024-01-27T10:30:00Z',
        encryptionStatus: 'active',
        firewallStatus: 'active',
        antivirusStatus: 'active'
    });

    const [events, setEvents] = useState<SecurityEvent[]>([
        {
            id: '1',
            type: 'threat',
            severity: 'medium',
            title: '의심스러운 로그인 시도',
            description: '비정상적인 시간대에 로그인 시도가 감지되었습니다.',
            timestamp: '2024-01-27T10:30:00Z',
            source: '192.168.1.100',
            status: 'investigating',
            action: 'IP 차단'
        },
        {
            id: '2',
            type: 'vulnerability',
            severity: 'high',
            title: 'SQL 인젝션 공격 시도',
            description: '데이터베이스에 대한 SQL 인젝션 공격이 감지되었습니다.',
            timestamp: '2024-01-27T09:15:00Z',
            source: '외부 IP',
            status: 'resolved',
            action: '방화벽 규칙 추가'
        },
        {
            id: '3',
            type: 'access',
            severity: 'low',
            title: '권한 없는 파일 접근 시도',
            description: '사용자가 권한이 없는 파일에 접근을 시도했습니다.',
            timestamp: '2024-01-27T08:45:00Z',
            source: '내부 사용자',
            status: 'resolved',
            action: '접근 거부'
        }
    ]);

    const [policies, setPolicies] = useState<SecurityPolicy[]>([
        {
            id: '1',
            name: '데이터 암호화 정책',
            type: 'data',
            status: 'active',
            description: '모든 민감한 데이터는 AES-256으로 암호화되어야 합니다.',
            lastUpdated: '2024-01-27T10:30:00Z',
            compliance: 98
        },
        {
            id: '2',
            name: '접근 제어 정책',
            type: 'access',
            status: 'active',
            description: '사용자는 자신의 권한 범위 내에서만 리소스에 접근할 수 있습니다.',
            lastUpdated: '2024-01-27T09:15:00Z',
            compliance: 95
        },
        {
            id: '3',
            name: '네트워크 보안 정책',
            type: 'network',
            status: 'active',
            description: '모든 네트워크 통신은 HTTPS를 통해 암호화되어야 합니다.',
            lastUpdated: '2024-01-27T08:45:00Z',
            compliance: 92
        }
    ]);

    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
        {
            id: '1',
            user: 'admin',
            action: '로그인',
            resource: '시스템',
            timestamp: '2024-01-27T10:30:00Z',
            ip: '192.168.1.100',
            status: 'success',
            details: '정상적인 로그인'
        },
        {
            id: '2',
            user: 'user1',
            action: '파일 업로드',
            resource: '프로젝트 A',
            timestamp: '2024-01-27T09:15:00Z',
            ip: '192.168.1.101',
            status: 'success',
            details: '파일 업로드 성공'
        },
        {
            id: '3',
            user: 'unknown',
            action: '권한 없는 접근',
            resource: '관리자 페이지',
            timestamp: '2024-01-27T08:45:00Z',
            ip: '192.168.1.200',
            status: 'blocked',
            details: '접근 권한 없음'
        }
    ]);

    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [showThreatDetails, setShowThreatDetails] = useState(false);
    const [selectedThreat, setSelectedThreat] = useState<SecurityEvent | null>(null);

    // 보안 메트릭 수집
    const collectSecurityMetrics = useCallback(async () => {
        try {
            const response = await fetch('/api/security/metrics');
            const data = await response.json();

            if (data.success) {
                setMetrics(data.metrics);
            }
        } catch (error) {
            const err = toError(error);
            errorLogger.error('보안 메트릭 수집 실패', err, {
                component: 'AdvancedSecurityMonitor',
                action: 'collectSecurityMetrics',
            });
        }
    }, []);

    // 보안 이벤트 업데이트
    const updateSecurityEvents = useCallback(async () => {
        try {
            const response = await fetch('/api/security/events');
            const data = await response.json();

            if (data.success) {
                setEvents(data.events);
            }
        } catch (error) {
            const err = toError(error);
            errorLogger.error('보안 이벤트 업데이트 실패', err, {
                component: 'AdvancedSecurityMonitor',
                action: 'updateSecurityEvents',
            });
        }
    }, []);

    // 보안 정책 업데이트
    const updateSecurityPolicies = useCallback(async () => {
        try {
            const response = await fetch('/api/security/policies');
            const data = await response.json();

            if (data.success) {
                setPolicies(data.policies);
            }
        } catch (error) {
            const err = toError(error);
            errorLogger.error('보안 정책 업데이트 실패', err, {
                component: 'AdvancedSecurityMonitor',
                action: 'updateSecurityPolicies',
            });
        }
    }, []);

    // 감사 로그 업데이트
    const updateAuditLogs = useCallback(async () => {
        try {
            const response = await fetch('/api/security/audit');
            const data = await response.json();

            if (data.success) {
                setAuditLogs(data.logs);
            }
        } catch (error) {
            const err = toError(error);
            errorLogger.error('감사 로그 업데이트 실패', err, {
                component: 'AdvancedSecurityMonitor',
                action: 'updateAuditLogs',
            });
        }
    }, []);

    // 보안 스캔 실행
    const runSecurityScan = useCallback(async () => {
        setIsScanning(true);
        setScanProgress(0);

        try {
            const response = await fetch('/api/security/scan', {
                method: 'POST'
            });

            const data = await response.json();

            if (data.success) {
                // 스캔 진행률 시뮬레이션
                const interval = setInterval(() => {
                    setScanProgress(prev => {
                        if (prev >= 100) {
                            clearInterval(interval);
                            setIsScanning(false);
                            return 100;
                        }
                        return prev + 10;
                    });
                }, 500);

                // 스캔 완료 후 데이터 업데이트
                setTimeout(() => {
                    collectSecurityMetrics();
                    updateSecurityEvents();
                }, 5000);
            }
        } catch (error) {
            const err = toError(error);
            errorLogger.error('보안 스캔 실패', err, {
                component: 'AdvancedSecurityMonitor',
                action: 'runSecurityScan',
            });
            setIsScanning(false);
        }
    }, [collectSecurityMetrics, updateSecurityEvents]);

    // 위협 상세 정보 표시
    const showThreatDetail = useCallback((threat: SecurityEvent) => {
        setSelectedThreat(threat);
        setShowThreatDetails(true);
    }, []);

    // 위협 해결
    const resolveThreat = useCallback(async (threatId: string) => {
        try {
            const response = await fetch(`/api/security/threats/${threatId}/resolve`, {
                method: 'POST'
            });

            const data = await response.json();

            if (data.success) {
                updateSecurityEvents();
            }
        } catch (error) {
            const err = toError(error);
            errorLogger.error('위협 해결 실패', err, {
                component: 'AdvancedSecurityMonitor',
                action: 'resolveThreat',
                threatId,
            });
        }
    }, [updateSecurityEvents]);

    // 정책 활성화/비활성화
    const togglePolicy = useCallback(async (policyId: string, status: string) => {
        try {
            const response = await fetch(`/api/security/policies/${policyId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            const data = await response.json();

            if (data.success) {
                updateSecurityPolicies();
            }
        } catch (error) {
            const err = toError(error);
            errorLogger.error('정책 상태 변경 실패', err, {
                component: 'AdvancedSecurityMonitor',
                action: 'togglePolicy',
                policyId,
                status,
            });
        }
    }, [updateSecurityPolicies]);

    // 메트릭 모니터링
    useEffect(() => {
        const interval = setInterval(() => {
            collectSecurityMetrics();
            updateSecurityEvents();
            updateSecurityPolicies();
            updateAuditLogs();
        }, 10000);
        return () => clearInterval(interval);
    }, [collectSecurityMetrics, updateSecurityEvents, updateSecurityPolicies, updateAuditLogs]);

    // 보안 상태 결정
    const getSecurityStatus = useCallback((score: number) => {
        if (score >= 90) return { status: '안전', color: 'success' as const };
        if (score >= 70) return { status: '주의', color: 'warning' as const };
        if (score >= 50) return { status: '위험', color: 'error' as const };
        return { status: '심각', color: 'error' as const };
    }, []);

    const securityStatus = getSecurityStatus(metrics.securityScore);

    const renderDashboardTab = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Monitor color="primary" />
                보안 대시보드
            </Typography>

            {/* 보안 상태 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5">보안 상태</Typography>
                        <Chip
                            label={securityStatus.status}
                            color={securityStatus.color}
                            size="medium"
                        />
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={metrics.securityScore}
                        sx={{ height: 20, borderRadius: 1 }}
                    />
                    <Typography variant="h3" sx={{ mt: 2, textAlign: 'center' }}>
                        {metrics.securityScore}/100
                    </Typography>
                </CardContent>
            </Card>

            {/* 보안 메트릭 */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Warning color="error" />
                                <Typography variant="h6">활성 위협</Typography>
                            </Box>
                            <Typography variant="h4" color="error.main">
                                {metrics.activeThreats}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Shield color="success" />
                                <Typography variant="h6">차단된 시도</Typography>
                            </Box>
                            <Typography variant="h4" color="success.main">
                                {metrics.blockedAttempts}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <BugReport color="warning" />
                                <Typography variant="h6">취약점</Typography>
                            </Box>
                            <Typography variant="h4" color="warning.main">
                                {metrics.vulnerabilities}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Security color="info" />
                                <Typography variant="h6">위협 레벨</Typography>
                            </Box>
                            <Chip
                                label={metrics.threatLevel}
                                color={
                                    metrics.threatLevel === 'low' ? 'success' :
                                        metrics.threatLevel === 'medium' ? 'warning' :
                                            metrics.threatLevel === 'high' ? 'error' : 'error'
                                }
                                size="medium"
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 보안 시스템 상태 */}
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>보안 시스템 상태</Typography>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Lock color={metrics.encryptionStatus === 'active' ? 'success' : 'error'} />
                                <Typography variant="body1">암호화</Typography>
                                <Chip
                                    label={metrics.encryptionStatus}
                                    color={metrics.encryptionStatus === 'active' ? 'success' : 'error'}
                                    size="small"
                                />
                            </Box>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Security color={metrics.firewallStatus === 'active' ? 'success' : 'error'} />
                                <Typography variant="body1">방화벽</Typography>
                                <Chip
                                    label={metrics.firewallStatus}
                                    color={metrics.firewallStatus === 'active' ? 'success' : 'error'}
                                    size="small"
                                />
                            </Box>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Shield color={metrics.antivirusStatus === 'active' ? 'success' : 'error'} />
                                <Typography variant="body1">안티바이러스</Typography>
                                <Chip
                                    label={metrics.antivirusStatus}
                                    color={metrics.antivirusStatus === 'active' ? 'success' : 'error'}
                                    size="small"
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );

    const renderThreatsTab = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Warning color="error" />
                보안 위협 모니터링
            </Typography>

            {/* 보안 스캔 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">보안 스캔</Typography>
                        <Button
                            variant="contained"
                            onClick={runSecurityScan}
                            disabled={isScanning}
                            startIcon={isScanning ? <CircularProgress size={20} /> : <PlayArrow />}
                        >
                            {isScanning ? '스캔 중...' : '보안 스캔 실행'}
                        </Button>
                    </Box>

                    {isScanning && (
                        <Box>
                            <LinearProgress
                                variant="determinate"
                                value={scanProgress}
                                sx={{ height: 10, borderRadius: 1 }}
                            />
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                {scanProgress}% 완료
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* 보안 이벤트 */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>유형</TableCell>
                            <TableCell>심각도</TableCell>
                            <TableCell>제목</TableCell>
                            <TableCell>소스</TableCell>
                            <TableCell>상태</TableCell>
                            <TableCell>시간</TableCell>
                            <TableCell>액션</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {events.map((event) => (
                            <TableRow key={event.id}>
                                <TableCell>
                                    <Chip
                                        label={event.type}
                                        color="primary"
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={event.severity}
                                        color={
                                            event.severity === 'critical' ? 'error' :
                                                event.severity === 'high' ? 'error' :
                                                    event.severity === 'medium' ? 'warning' : 'success'
                                        }
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{event.title}</TableCell>
                                <TableCell>{event.source}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={event.status}
                                        color={
                                            event.status === 'active' ? 'error' :
                                                event.status === 'resolved' ? 'success' : 'warning'
                                        }
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {new Date(event.timestamp).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Tooltip title="상세 정보">
                                            <IconButton
                                                size="small"
                                                onClick={() => showThreatDetail(event)}
                                            >
                                                <Visibility />
                                            </IconButton>
                                        </Tooltip>
                                        {event.status === 'active' && (
                                            <Tooltip title="해결">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => resolveThreat(event.id)}
                                                >
                                                    <CheckCircle />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );

    const renderPoliciesTab = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Security color="info" />
                보안 정책 관리
            </Typography>

            <List>
                {policies.map((policy) => (
                    <Accordion key={policy.id}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                <Typography variant="h6">{policy.name}</Typography>
                                <Chip
                                    label={policy.status}
                                    color={policy.status === 'active' ? 'success' : 'default'}
                                    size="small"
                                />
                                <Chip
                                    label={`${policy.compliance}% 준수`}
                                    color={policy.compliance > 90 ? 'success' : 'warning'}
                                    size="small"
                                />
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                {policy.description}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    마지막 업데이트: {new Date(policy.lastUpdated).toLocaleString()}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        size="small"
                                        onClick={() => togglePolicy(policy.id, policy.status === 'active' ? 'inactive' : 'active')}
                                        color={policy.status === 'active' ? 'error' : 'success'}
                                    >
                                        {policy.status === 'active' ? '비활성화' : '활성화'}
                                    </Button>
                                </Box>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </List>
        </Box>
    );

    const renderAuditTab = () => (
        <Box>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Analytics color="warning" />
                감사 로그
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>사용자</TableCell>
                            <TableCell>액션</TableCell>
                            <TableCell>리소스</TableCell>
                            <TableCell>IP 주소</TableCell>
                            <TableCell>상태</TableCell>
                            <TableCell>시간</TableCell>
                            <TableCell>상세</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {auditLogs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell>{log.user}</TableCell>
                                <TableCell>{log.action}</TableCell>
                                <TableCell>{log.resource}</TableCell>
                                <TableCell>{log.ip}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={log.status}
                                        color={
                                            log.status === 'success' ? 'success' :
                                                log.status === 'failed' ? 'error' : 'warning'
                                        }
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {new Date(log.timestamp).toLocaleString()}
                                </TableCell>
                                <TableCell>{log.details}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );

    return (
        <Paper sx={{ p: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                    <Tab label="대시보드" icon={<Monitor />} />
                    <Tab label="위협 모니터링" icon={<Warning />} />
                    <Tab label="보안 정책" icon={<Security />} />
                    <Tab label="감사 로그" icon={<Analytics />} />
                </Tabs>
            </Box>

            {activeTab === 0 && renderDashboardTab()}
            {activeTab === 1 && renderThreatsTab()}
            {activeTab === 2 && renderPoliciesTab()}
            {activeTab === 3 && renderAuditTab()}

            {/* 위협 상세 정보 다이얼로그 */}
            <Dialog open={showThreatDetails} onClose={() => setShowThreatDetails(false)} maxWidth="md" fullWidth>
                <DialogTitle>위협 상세 정보</DialogTitle>
                <DialogContent>
                    {selectedThreat && (
                        <Box>
                            <Typography variant="h6" sx={{ mb: 2 }}>{selectedThreat.title}</Typography>
                            <Typography variant="body1" sx={{ mb: 2 }}>{selectedThreat.description}</Typography>

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle1">심각도</Typography>
                                    <Chip
                                        label={selectedThreat.severity}
                                        color={
                                            selectedThreat.severity === 'critical' ? 'error' :
                                                selectedThreat.severity === 'high' ? 'error' :
                                                    selectedThreat.severity === 'medium' ? 'warning' : 'success'
                                        }
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle1">상태</Typography>
                                    <Chip
                                        label={selectedThreat.status}
                                        color={
                                            selectedThreat.status === 'active' ? 'error' :
                                                selectedThreat.status === 'resolved' ? 'success' : 'warning'
                                        }
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle1">소스</Typography>
                                    <Typography variant="body1">{selectedThreat.source}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle1">시간</Typography>
                                    <Typography variant="body1">
                                        {new Date(selectedThreat.timestamp).toLocaleString()}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle1">조치</Typography>
                                    <Typography variant="body1">{selectedThreat.action}</Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowThreatDetails(false)}>닫기</Button>
                    {selectedThreat?.status === 'active' && (
                        <Button
                            onClick={() => {
                                resolveThreat(selectedThreat.id);
                                setShowThreatDetails(false);
                            }}
                            color="success"
                        >
                            해결
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Paper>
    );
}

export default AdvancedSecurityMonitor;
