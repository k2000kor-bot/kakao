import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    LinearProgress,
    Chip,
    IconButton,
    Tooltip,
    Alert,
    Snackbar,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tab,
    Switch,
    FormControlLabel,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Badge,
    Fab,
    CircularProgress,
    ListItemSecondaryAction,
    MenuItem
} from '@mui/material';
import {
    Security,
    Warning,
    Shield,
    Lock,
    VpnKey,
    Visibility,
    VisibilityOff,
    Refresh,
    Download,
    Upload,
    Assessment,
    Timeline,
    History,
    CheckCircle,
    Error,
    Info,
    ExpandMore,
    Key,
    Lock as Encrypt,
    Lock as Decrypt,
    Password,
    Token,
    Assessment as Audit,
    Search as Scan,
    Warning as Threat,
    Event,
    Warning as AlertIcon,
    TrendingUp,
    TrendingDown,
    Speed,
    Memory,
    Storage
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

interface SecurityThreat {
    id: string;
    type: string;
    severity: string;
    description: string;
    source_ip: string;
    user_agent: string;
    timestamp: string;
    status: string;
    risk_score: number;
}

interface SecurityEvent {
    id: string;
    event_type: string;
    user_id?: string;
    ip_address: string;
    user_agent: string;
    timestamp: string;
    details: any;
    risk_level: string;
}

interface EncryptionKey {
    id: string;
    name: string;
    algorithm: string;
    key_size: number;
    created_at: string;
    expires_at?: string;
    status: string;
    usage_count: number;
}

interface AuditLog {
    id: string;
    user_id?: string;
    action: string;
    resource: string;
    ip_address: string;
    user_agent: string;
    timestamp: string;
    success: boolean;
    details: any;
}

interface SecurityStatus {
    overall_status: string;
    security_score: number;
    threats: {
        total: number;
        active: number;
        critical: number;
    };
    events: {
        total: number;
        high_risk: number;
    };
    audit: {
        total_logs: number;
        failed_logins: number;
    };
    encryption: {
        active_keys: number;
        total_keys: number;
    };
    recommendations: string[];
}

const AdvancedSecurityDashboard: React.FC = () => {
    const [threats, setThreats] = useState<SecurityThreat[]>([]);
    const [events, setEvents] = useState<SecurityEvent[]>([]);
    const [encryptionKeys, setEncryptionKeys] = useState<EncryptionKey[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState(0);
    const [encryptDialog, setEncryptDialog] = useState(false);
    const [decryptDialog, setDecryptDialog] = useState(false);
    const [scanDialog, setScanDialog] = useState(false);
    const [encryptData, setEncryptData] = useState('');
    const [decryptData, setDecryptData] = useState('');
    const [keyId, setKeyId] = useState('');
    const [scanType, setScanType] = useState('full');
    const [scanResult, setScanResult] = useState<any>(null);

    // 데이터 로드
    useEffect(() => {
        loadSecurityData();
    }, []);

    const loadSecurityData = async () => {
        try {
            const [threatsRes, eventsRes, keysRes, logsRes, statusRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/security/threats`),
                axios.get(`${API_BASE_URL}/security/events`),
                axios.get(`${API_BASE_URL}/security/keys`),
                axios.get(`${API_BASE_URL}/security/audit-logs`),
                axios.get(`${API_BASE_URL}/security/status`)
            ]);

            if (threatsRes.data.success) {
                setThreats(threatsRes.data.data.threats);
            }
            if (eventsRes.data.success) {
                setEvents(eventsRes.data.data.events);
            }
            if (keysRes.data.success) {
                setEncryptionKeys(keysRes.data.data.keys);
            }
            if (logsRes.data.success) {
                setAuditLogs(logsRes.data.data.logs);
            }
            if (statusRes.data.success) {
                setSecurityStatus(statusRes.data.data);
            }
        } catch (err) {
            setError('보안 데이터를 불러오는 중 오류가 발생했습니다.');
            console.error('Security data loading error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEncryptData = async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/security/encrypt`, {
                data: encryptData
            });
            if (response.data.success) {
                setError(null);
                setEncryptDialog(false);
                setEncryptData('');
                loadSecurityData();
            }
        } catch (err) {
            setError('데이터 암호화 중 오류가 발생했습니다.');
        }
    };

    const handleDecryptData = async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/security/decrypt`, {
                encrypted_data: decryptData,
                key_id: keyId
            });
            if (response.data.success) {
                setError(null);
                setDecryptDialog(false);
                setDecryptData('');
                setKeyId('');
            }
        } catch (err) {
            setError('데이터 복호화 중 오류가 발생했습니다.');
        }
    };

    const handleSecurityScan = async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/security/scan`, {
                scan_type: scanType
            });
            if (response.data.success) {
                setScanResult(response.data.data);
                setError(null);
                setScanDialog(false);
                loadSecurityData();
            }
        } catch (err) {
            setError('보안 스캔 중 오류가 발생했습니다.');
        }
    };

    const handleResolveThreat = async (threatId: string) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/security/threats/${threatId}/resolve`, {
                resolution: 'Automated resolution'
            });
            if (response.data.success) {
                setError(null);
                loadSecurityData();
            }
        } catch (err) {
            setError('위협 해결 중 오류가 발생했습니다.');
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'error';
            case 'high': return 'warning';
            case 'medium': return 'info';
            case 'low': return 'success';
            default: return 'default';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'detected': return 'error';
            case 'investigating': return 'warning';
            case 'resolved': return 'success';
            case 'false_positive': return 'info';
            default: return 'default';
        }
    };

    const getRiskLevelColor = (riskLevel: string) => {
        switch (riskLevel) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'success';
            default: return 'default';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={60} sx={{ mb: 2 }} />
                    <Typography variant="h6">보안 데이터를 불러오는 중...</Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* 헤더 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Security sx={{ fontSize: 32, color: 'primary.main' }} />
                    <Typography variant="h4" fontWeight="bold">
                        고급 보안 모니터링
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="새로고침">
                        <IconButton onClick={loadSecurityData} color="primary">
                            <Refresh />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant="contained"
                        startIcon={<Scan />}
                        onClick={() => setScanDialog(true)}
                        color="warning"
                    >
                        보안 스캔
                    </Button>
                </Box>
            </Box>

            {/* 보안 상태 요약 */}
            {securityStatus && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" mb={2}>
                            보안 상태 요약
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                            <Box sx={{ flex: '1 1 200px' }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">전체 보안 점수</Typography>
                                    <Typography
                                        variant="h3"
                                        fontWeight="bold"
                                        color={securityStatus.security_score >= 80 ? 'success.main' :
                                            securityStatus.security_score >= 60 ? 'warning.main' : 'error.main'}
                                    >
                                        {securityStatus.security_score}
                                    </Typography>
                                    <Chip
                                        label={securityStatus.overall_status}
                                        color={securityStatus.overall_status === 'healthy' ? 'success' :
                                            securityStatus.overall_status === 'warning' ? 'warning' : 'error'}
                                        size="small"
                                    />
                                </Box>
                            </Box>
                            <Box sx={{ flex: '1 1 200px' }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">활성 위협</Typography>
                                    <Typography variant="h3" fontWeight="bold" color="error.main">
                                        {securityStatus.threats.active}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        총 {securityStatus.threats.total}개 중
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ flex: '1 1 200px' }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">고위험 이벤트</Typography>
                                    <Typography variant="h3" fontWeight="bold" color="warning.main">
                                        {securityStatus.events.high_risk}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        총 {securityStatus.events.total}개 중
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ flex: '1 1 200px' }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">암호화 키</Typography>
                                    <Typography variant="h3" fontWeight="bold" color="primary.main">
                                        {securityStatus.encryption.active_keys}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        총 {securityStatus.encryption.total_keys}개 중
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* 권장사항 */}
                        {securityStatus.recommendations.length > 0 && (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="h6" fontWeight="bold" mb={1}>
                                    권장사항
                                </Typography>
                                {securityStatus.recommendations.map((recommendation, index) => (
                                    <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                                        {recommendation}
                                    </Alert>
                                ))}
                            </Box>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* 탭 네비게이션 */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
                    <Tab label="보안 위협" icon={<Threat />} />
                    <Tab label="보안 이벤트" icon={<Event />} />
                    <Tab label="암호화 관리" icon={<Key />} />
                    <Tab label="감사 로그" icon={<Audit />} />
                </Tabs>
            </Box>

            {/* 보안 위협 탭 */}
            {selectedTab === 0 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" mb={2}>
                            보안 위협 모니터링
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>위협 유형</TableCell>
                                        <TableCell>심각도</TableCell>
                                        <TableCell>설명</TableCell>
                                        <TableCell>소스 IP</TableCell>
                                        <TableCell>발견 시간</TableCell>
                                        <TableCell>상태</TableCell>
                                        <TableCell>위험 점수</TableCell>
                                        <TableCell>조치</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {threats.map((threat) => (
                                        <TableRow key={threat.id}>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Warning color="error" />
                                                    {threat.type}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={threat.severity}
                                                    color={getSeverityColor(threat.severity) as any}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{threat.description}</TableCell>
                                            <TableCell>{threat.source_ip}</TableCell>
                                            <TableCell>{formatDate(threat.timestamp)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={threat.status}
                                                    color={getStatusColor(threat.status) as any}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="body2">
                                                        {threat.risk_score}
                                                    </Typography>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={threat.risk_score * 100}
                                                        color={threat.risk_score > 0.7 ? 'error' :
                                                            threat.risk_score > 0.4 ? 'warning' : 'success'}
                                                        sx={{ width: 50 }}
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => handleResolveThreat(threat.id)}
                                                    disabled={threat.status === 'resolved'}
                                                >
                                                    해결
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {/* 보안 이벤트 탭 */}
            {selectedTab === 1 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" mb={2}>
                            보안 이벤트 로그
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>이벤트 유형</TableCell>
                                        <TableCell>사용자</TableCell>
                                        <TableCell>IP 주소</TableCell>
                                        <TableCell>시간</TableCell>
                                        <TableCell>위험 수준</TableCell>
                                        <TableCell>상세 정보</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {events.slice(0, 50).map((event) => (
                                        <TableRow key={event.id}>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Event color="primary" />
                                                    {event.event_type}
                                                </Box>
                                            </TableCell>
                                            <TableCell>{event.user_id || '시스템'}</TableCell>
                                            <TableCell>{event.ip_address}</TableCell>
                                            <TableCell>{formatDate(event.timestamp)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={event.risk_level}
                                                    color={getRiskLevelColor(event.risk_level) as any}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption">
                                                    {JSON.stringify(event.details)}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {/* 암호화 관리 탭 */}
            {selectedTab === 2 && (
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold">
                            암호화 키 관리
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="outlined"
                                startIcon={<Encrypt />}
                                onClick={() => setEncryptDialog(true)}
                            >
                                데이터 암호화
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Decrypt />}
                                onClick={() => setDecryptDialog(true)}
                            >
                                데이터 복호화
                            </Button>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                        {encryptionKeys.map((key) => (
                            <Box sx={{ flex: '1 1 300px' }} key={key.id}>
                                <Card>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Box>
                                                <Typography variant="h6" fontWeight="bold">
                                                    {key.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {key.algorithm} ({key.key_size}bit)
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={key.status}
                                                color={key.status === 'active' ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </Box>

                                        <Divider sx={{ my: 2 }} />

                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                생성일: {formatDate(key.created_at)}
                                            </Typography>
                                            {key.expires_at && (
                                                <Typography variant="body2" color="text.secondary">
                                                    만료일: {formatDate(key.expires_at)}
                                                </Typography>
                                            )}
                                        </Box>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                사용 횟수: {key.usage_count}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <Tooltip title="키 정보 보기">
                                                    <IconButton size="small">
                                                        <Visibility />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="키 내보내기">
                                                    <IconButton size="small">
                                                        <Download />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            {/* 감사 로그 탭 */}
            {selectedTab === 3 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" mb={2}>
                            감사 로그
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>사용자</TableCell>
                                        <TableCell>액션</TableCell>
                                        <TableCell>리소스</TableCell>
                                        <TableCell>IP 주소</TableCell>
                                        <TableCell>시간</TableCell>
                                        <TableCell>성공</TableCell>
                                        <TableCell>상세 정보</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {auditLogs.slice(0, 100).map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>{log.user_id || '시스템'}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {log.success ? <CheckCircle color="success" /> : <Error color="error" />}
                                                    {log.action}
                                                </Box>
                                            </TableCell>
                                            <TableCell>{log.resource}</TableCell>
                                            <TableCell>{log.ip_address}</TableCell>
                                            <TableCell>{formatDate(log.timestamp)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={log.success ? '성공' : '실패'}
                                                    color={log.success ? 'success' : 'error'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption">
                                                    {JSON.stringify(log.details)}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {/* 데이터 암호화 다이얼로그 */}
            <Dialog open={encryptDialog} onClose={() => setEncryptDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Encrypt />
                        데이터 암호화
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        rows={6}
                        label="암호화할 데이터"
                        value={encryptData}
                        onChange={(e) => setEncryptData(e.target.value)}
                        placeholder="암호화할 데이터를 입력하세요..."
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEncryptDialog(false)}>취소</Button>
                    <Button variant="contained" onClick={handleEncryptData}>
                        암호화
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 데이터 복호화 다이얼로그 */}
            <Dialog open={decryptDialog} onClose={() => setDecryptDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Decrypt />
                        데이터 복호화
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="암호화된 데이터"
                        value={decryptData}
                        onChange={(e) => setDecryptData(e.target.value)}
                        placeholder="암호화된 데이터를 입력하세요..."
                        sx={{ mt: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="키 ID"
                        value={keyId}
                        onChange={(e) => setKeyId(e.target.value)}
                        placeholder="암호화 키 ID를 입력하세요..."
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDecryptDialog(false)}>취소</Button>
                    <Button variant="contained" onClick={handleDecryptData}>
                        복호화
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 보안 스캔 다이얼로그 */}
            <Dialog open={scanDialog} onClose={() => setScanDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Scan />
                        보안 스캔 실행
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        select
                        label="스캔 유형"
                        value={scanType}
                        onChange={(e) => setScanType(e.target.value)}
                        sx={{ mt: 2 }}
                    >
                        <MenuItem value="full">전체 스캔</MenuItem>
                        <MenuItem value="quick">빠른 스캔</MenuItem>
                        <MenuItem value="custom">사용자 정의 스캔</MenuItem>
                    </TextField>

                    {scanResult && (
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="h6" fontWeight="bold" mb={2}>
                                스캔 결과
                            </Typography>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="body2" color="text.secondary" mb={1}>
                                    스캔 ID: {scanResult.scan_id}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" mb={1}>
                                    발견된 취약점: {scanResult.vulnerabilities_found}개
                                </Typography>
                                <Typography variant="body2" color="text.secondary" mb={1}>
                                    감지된 위협: {scanResult.threats_detected}개
                                </Typography>
                                <Typography variant="body2" color="text.secondary" mb={2}>
                                    위험 수준: {scanResult.risk_level}
                                </Typography>

                                <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                                    권장사항:
                                </Typography>
                                {scanResult.recommendations.map((rec: string, index: number) => (
                                    <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                                        • {rec}
                                    </Typography>
                                ))}
                            </Paper>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setScanDialog(false)}>닫기</Button>
                    <Button variant="contained" onClick={handleSecurityScan}>
                        스캔 실행
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 에러 알림 */}
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdvancedSecurityDashboard;
