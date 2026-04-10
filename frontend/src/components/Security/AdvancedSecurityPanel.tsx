// 고급 보안 기능 패널
// advancedSecurityService를 사용하여 새로운 보안 API 기능 제공

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    AlertTitle,
} from '@mui/material';
import {
    Security,
    Warning,
    Refresh,
    Block,
    Policy,
    Notifications,
    Scanner,
    Speed,
    Delete,
    Add,
    Settings,
    Description,
    Assessment,
} from '@mui/icons-material';
import SecurityReportGenerator from './SecurityReportGenerator';
import SecurityAutomationPanel from './SecurityAutomationPanel';
import SecurityCharts from './SecurityCharts';
import SecurityAnalyticsPanel from './SecurityAnalyticsPanel';
import advancedSecurityService, {
    SecurityThreat,
    SecurityStatus,
    SecurityAlert,
    SecurityPolicy,
    IPBlock,
    RateLimitConfig,
    SecurityScanResult,
    SecurityEvent,
} from '../../services/advancedSecurityService';
import securityWebSocketService from '../../services/securityWebSocketService';
import { errorLogger } from '../../utils/errorLogger';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel = React.memo(function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`security-tabpanel-${index}`}
            aria-labelledby={`security-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
});

const AdvancedSecurityPanel: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
    const [threats, setThreats] = useState<SecurityThreat[]>([]);
    const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
    const [events, setEvents] = useState<SecurityEvent[]>([]);
    const [policies, setPolicies] = useState<SecurityPolicy[]>([]);
    const [blockedIPs, setBlockedIPs] = useState<IPBlock[]>([]);
    const [rateLimitConfigs, setRateLimitConfigs] = useState<Record<string, RateLimitConfig>>({});
    const [scanResult, setScanResult] = useState<SecurityScanResult | null>(null);

    // 다이얼로그 상태
    const [isBlockIPDialogOpen, setIsBlockIPDialogOpen] = useState(false);
    const [isPolicyDialogOpen, setIsPolicyDialogOpen] = useState(false);
    const [_isScanDialogOpen, setIsScanDialogOpen] = useState(false);
    const [newIPBlock, setNewIPBlock] = useState<{ ip_address: string; reason: string; severity: 'low' | 'medium' | 'high' | 'critical' }>({ ip_address: '', reason: '', severity: 'medium' });
    const [newPolicy, setNewPolicy] = useState<{
        name: string;
        description: string;
        policy_type: 'access_control' | 'rate_limit' | 'encryption' | 'authentication';
        enabled: boolean;
    }>({
        name: '',
        description: '',
        policy_type: 'access_control',
        enabled: true,
    });

    // 필터링 및 검색 상태
    const [threatFilter, setThreatFilter] = useState<{ severity?: string; search?: string }>({});
    const [filteredThreats, setFilteredThreats] = useState<SecurityThreat[]>([]);
    const [alertFilter, setAlertFilter] = useState<{ severity?: string; status?: string; search?: string }>({});
    const [filteredAlerts, setFilteredAlerts] = useState<SecurityAlert[]>([]);
    const [ipFilter, setIPFilter] = useState<{ severity?: string; search?: string }>({});
    const [filteredBlockedIPs, setFilteredBlockedIPs] = useState<IPBlock[]>([]);
    const [policyFilter, setPolicyFilter] = useState<{ type?: string; enabled?: boolean; search?: string }>({});
    const [filteredPolicies, setFilteredPolicies] = useState<SecurityPolicy[]>([]);

    useEffect(() => {
        loadSecurityData();
        const interval = setInterval(loadSecurityData, 60000); // 1분마다 업데이트

        // WebSocket 연결 및 이벤트 리스너 설정
        securityWebSocketService.connect();

        // 실시간 이벤트 리스너
        const handleThreat = (data: unknown) => {
            setThreats((prev) => [data as SecurityThreat, ...prev].slice(0, 50));
        };

        const handleAlert = (data: unknown) => {
            setAlerts((prev) => [data as SecurityAlert, ...prev].slice(0, 50));
        };

        const handleStatusUpdate = (data: unknown) => {
            setSecurityStatus(data as SecurityStatus | null);
        };

        securityWebSocketService.on('threat', handleThreat);
        securityWebSocketService.on('alert', handleAlert);
        securityWebSocketService.on('status_update', handleStatusUpdate);

        // 구독 요청
        securityWebSocketService.subscribe('threat');
        securityWebSocketService.subscribe('alert');
        securityWebSocketService.subscribe('status_update');

        return () => {
            clearInterval(interval);
            securityWebSocketService.off('threat', handleThreat);
            securityWebSocketService.off('alert', handleAlert);
            securityWebSocketService.off('status_update', handleStatusUpdate);
            securityWebSocketService.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadSecurityData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [status, threatsData, alertsData, eventsData, policiesData, blockedIPsData, rateLimitData] = await Promise.all([
                advancedSecurityService.getSecurityStatus(),
                advancedSecurityService.getSecurityThreats(),
                advancedSecurityService.getSecurityAlerts(),
                advancedSecurityService.getSecurityEvents(100),
                advancedSecurityService.getSecurityPolicies(),
                advancedSecurityService.getBlockedIPs(),
                advancedSecurityService.getRateLimitConfig(),
            ]);

            setSecurityStatus(status);
            setThreats(threatsData.threats);
            setAlerts(alertsData.alerts);
            setEvents(eventsData.events);
            setPolicies(policiesData.policies);
            setBlockedIPs(blockedIPsData.blocked_ips);
            setRateLimitConfigs(rateLimitData.configs);

            // 위협 필터링 적용
            applyThreatFilters(threatsData.threats, threatFilter);
            // 알림 필터링 적용
            applyAlertFilters(alertsData.alerts, alertFilter);
            // IP 필터링 적용
            applyIPFilters(blockedIPsData.blocked_ips, ipFilter);
            // 정책 필터링 적용
            applyPolicyFilters(policiesData.policies, policyFilter);
        } catch (error) {
            errorLogger.error('보안 데이터 로드 실패', error as Error, {
                component: 'AdvancedSecurityPanel',
                action: 'loadSecurityData',
            });
        } finally {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleBlockIP = useCallback(async () => {
        try {
            await advancedSecurityService.blockIP(newIPBlock);
            setIsBlockIPDialogOpen(false);
            setNewIPBlock({ ip_address: '', reason: '', severity: 'medium' });
            await loadSecurityData();
        } catch (error) {
            errorLogger.error('IP 차단 실패', error as Error);
        }
    }, [newIPBlock, loadSecurityData]);

    const handleUnblockIP = useCallback(async (ipAddress: string) => {
        try {
            await advancedSecurityService.unblockIP(ipAddress);
            await loadSecurityData();
        } catch (error) {
            errorLogger.error('IP 차단 해제 실패', error as Error);
        }
    }, [loadSecurityData]);

    const handleCreatePolicy = useCallback(async () => {
        try {
            await advancedSecurityService.createSecurityPolicy(newPolicy);
            setIsPolicyDialogOpen(false);
            setNewPolicy({ name: '', description: '', policy_type: 'access_control', enabled: true });
            await loadSecurityData();
        } catch (error) {
            errorLogger.error('보안 정책 생성 실패', error as Error);
        }
    }, [newPolicy, loadSecurityData]);

    const handleRunScan = useCallback(async (scanType: 'full' | 'quick' | 'custom' = 'full') => {
        try {
            setIsLoading(true);
            const result = await advancedSecurityService.runSecurityScan(scanType);
            setScanResult(result);
            setIsScanDialogOpen(true);
        } catch (error) {
            errorLogger.error('보안 스캔 실패', error as Error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleAcknowledgeAlert = useCallback(async (alertId: string) => {
        try {
            await advancedSecurityService.acknowledgeAlert(alertId);
            await loadSecurityData();
        } catch (error) {
            errorLogger.error('알림 확인 실패', error as Error);
        }
    }, [loadSecurityData]);

    const getSeverityColor = useCallback((severity: string): 'error' | 'warning' | 'info' | 'success' => {
        switch (severity) {
            case 'critical':
                return 'error';
            case 'high':
                return 'warning';
            case 'medium':
                return 'info';
            default:
                return 'info';
        }
    }, []);

    // 위협 필터링 함수
    const applyThreatFilters = useCallback((threatsList: SecurityThreat[], filter: { severity?: string; search?: string }) => {
        let filtered = [...threatsList];
        if (filter.severity) {
            filtered = filtered.filter((t) => t.severity === filter.severity);
        }
        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            filtered = filtered.filter(
                (t) =>
                    t.type.toLowerCase().includes(searchLower) ||
                    t.description.toLowerCase().includes(searchLower) ||
                    t.source_ip.includes(searchLower)
            );
        }
        setFilteredThreats(filtered);
    }, []);

    // 알림 필터링 함수
    const applyAlertFilters = useCallback((alertsList: SecurityAlert[], filter: { severity?: string; status?: string; search?: string }) => {
        let filtered = [...alertsList];
        if (filter.severity) {
            filtered = filtered.filter((a) => a.severity === filter.severity);
        }
        if (filter.status) {
            filtered = filtered.filter((a) => a.status === filter.status);
        }
        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            filtered = filtered.filter(
                (a) =>
                    a.title.toLowerCase().includes(searchLower) ||
                    a.description.toLowerCase().includes(searchLower) ||
                    a.alert_type.toLowerCase().includes(searchLower)
            );
        }
        setFilteredAlerts(filtered);
    }, []);

    // IP 필터링 함수
    const applyIPFilters = useCallback((ipsList: IPBlock[], filter: { severity?: string; search?: string }) => {
        let filtered = [...ipsList];
        if (filter.severity) {
            filtered = filtered.filter((ip) => ip.severity === filter.severity);
        }
        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            filtered = filtered.filter(
                (ip) =>
                    ip.ip_address.includes(searchLower) ||
                    ip.reason.toLowerCase().includes(searchLower)
            );
        }
        setFilteredBlockedIPs(filtered);
    }, []);

    // 정책 필터링 함수
    const applyPolicyFilters = useCallback((policiesList: SecurityPolicy[], filter: { type?: string; enabled?: boolean; search?: string }) => {
        let filtered = [...policiesList];
        if (filter.type) {
            filtered = filtered.filter((p) => p.policy_type === filter.type);
        }
        if (filter.enabled !== undefined) {
            filtered = filtered.filter((p) => p.enabled === filter.enabled);
        }
        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    p.name.toLowerCase().includes(searchLower) ||
                    p.description.toLowerCase().includes(searchLower) ||
                    p.policy_type.toLowerCase().includes(searchLower)
            );
        }
        setFilteredPolicies(filtered);
    }, []);

    // 필터 변경 핸들러
    const handleThreatFilterChange = useCallback((severity?: string, search?: string) => {
        const newFilter = { severity, search };
        setThreatFilter(newFilter);
        applyThreatFilters(threats, newFilter);
    }, [threats, applyThreatFilters]);

    const handleAlertFilterChange = useCallback((severity?: string, status?: string, search?: string) => {
        const newFilter = { severity, status, search };
        setAlertFilter(newFilter);
        applyAlertFilters(alerts, newFilter);
    }, [alerts, applyAlertFilters]);

    const handleIPFilterChange = useCallback((severity?: string, search?: string) => {
        const newFilter = { severity, search };
        setIPFilter(newFilter);
        applyIPFilters(blockedIPs, newFilter);
    }, [blockedIPs, applyIPFilters]);

    const handlePolicyFilterChange = useCallback((type?: string, enabled?: boolean, search?: string) => {
        const newFilter = { type, enabled, search };
        setPolicyFilter(newFilter);
        applyPolicyFilters(policies, newFilter);
    }, [policies, applyPolicyFilters]);

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                    고급 보안 관리
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={loadSecurityData}
                    disabled={isLoading}
                    aria-label="보안 데이터 새로고침"
                >
                    새로고침
                </Button>
            </Box>

            {/* 보안 상태 카드 */}
            {securityStatus && (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Card role="region" aria-label="보안 점수">
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    보안 점수
                                </Typography>
                                <Typography variant="h3" aria-live="polite">
                                    {securityStatus.security_score}/100
                                </Typography>
                                <Chip
                                    label={securityStatus.overall_status}
                                    color={securityStatus.overall_status === 'healthy' ? 'success' : 'warning'}
                                    sx={{ mt: 1 }}
                                    aria-label={`보안 상태: ${securityStatus.overall_status}`}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Card role="region" aria-label="활성 위협">
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    활성 위협
                                </Typography>
                                <Typography variant="h3" aria-live="polite">
                                    {securityStatus.threats.active}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    총 {securityStatus.threats.total}개
                                </Typography>
                                {securityStatus.threats.critical > 0 && (
                                    <Chip
                                        label={`긴급: ${securityStatus.threats.critical}`}
                                        color="error"
                                        size="small"
                                        sx={{ mt: 1 }}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Card role="region" aria-label="고위험 이벤트">
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    고위험 이벤트
                                </Typography>
                                <Typography variant="h3" aria-live="polite">
                                    {securityStatus.events.high_risk}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    총 {securityStatus.events.total}개
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Card role="region" aria-label="암호화 키">
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    암호화 키
                                </Typography>
                                <Typography variant="h3" aria-live="polite">
                                    {securityStatus.encryption.active_keys}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    총 {securityStatus.encryption.total_keys}개
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* 탭 메뉴 */}
            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={selectedTab}
                    onChange={(e, newValue) => setSelectedTab(newValue)}
                    aria-label="보안 기능 탭"
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab icon={<Warning />} label="위협 관리" id="security-tab-0" aria-controls="security-tabpanel-0" />
                    <Tab icon={<Notifications />} label="알림" id="security-tab-1" aria-controls="security-tabpanel-1" />
                    <Tab icon={<Block />} label="IP 관리" id="security-tab-2" aria-controls="security-tabpanel-2" />
                    <Tab icon={<Policy />} label="보안 정책" id="security-tab-3" aria-controls="security-tabpanel-3" />
                    <Tab icon={<Speed />} label="Rate Limiting" id="security-tab-4" aria-controls="security-tabpanel-4" />
                    <Tab icon={<Scanner />} label="보안 스캔" id="security-tab-5" aria-controls="security-tabpanel-5" />
                    <Tab icon={<Settings />} label="자동화 규칙" id="security-tab-6" aria-controls="security-tabpanel-6" />
                    <Tab icon={<Description />} label="리포트" id="security-tab-7" aria-controls="security-tabpanel-7" />
                    <Tab icon={<Assessment />} label="차트 및 분석" id="security-tab-8" aria-controls="security-tabpanel-8" />
                    <Tab icon={<Assessment />} label="통계 분석" id="security-tab-9" aria-controls="security-tabpanel-9" />
                </Tabs>
            </Paper>

            {/* 위협 관리 탭 */}
            <TabPanel value={selectedTab} index={0}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">보안 위협 목록</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>심각도 필터</InputLabel>
                            <Select
                                value={threatFilter.severity || ''}
                                onChange={(e) =>
                                    handleThreatFilterChange(e.target.value || undefined, threatFilter.search)
                                }
                                label="심각도 필터"
                            >
                                <MenuItem value="">전체</MenuItem>
                                <MenuItem value="critical">Critical</MenuItem>
                                <MenuItem value="high">High</MenuItem>
                                <MenuItem value="medium">Medium</MenuItem>
                                <MenuItem value="low">Low</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            size="small"
                            placeholder="검색 (유형, 설명, IP)..."
                            sx={{ width: 200 }}
                            value={threatFilter.search || ''}
                            onChange={(e) =>
                                handleThreatFilterChange(threatFilter.severity, e.target.value || undefined)
                            }
                        />
                    </Box>
                </Box>
                <TableContainer component={Paper} role="region" aria-label="보안 위협 목록">
                    <Table aria-label="보안 위협 테이블">
                        <TableHead>
                            <TableRow>
                                <TableCell>유형</TableCell>
                                <TableCell>심각도</TableCell>
                                <TableCell>설명</TableCell>
                                <TableCell>IP 주소</TableCell>
                                <TableCell>상태</TableCell>
                                <TableCell>위험 점수</TableCell>
                                <TableCell>작업</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(filteredThreats.length === 0 && threats.length > 0) ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        필터 조건에 맞는 위협이 없습니다.
                                    </TableCell>
                                </TableRow>
                            ) : filteredThreats.length === 0 && threats.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        위협이 없습니다.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredThreats.map((threat) => (
                                    <TableRow key={threat.id}>
                                        <TableCell>{threat.type}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={threat.severity}
                                                color={getSeverityColor(threat.severity)}
                                                size="small"
                                                aria-label={`심각도: ${threat.severity}`}
                                            />
                                        </TableCell>
                                        <TableCell>{threat.description}</TableCell>
                                        <TableCell>{threat.source_ip}</TableCell>
                                        <TableCell>{threat.status}</TableCell>
                                        <TableCell aria-label={`위험 점수: ${(threat.risk_score * 100).toFixed(0)}%`}>
                                            {(threat.risk_score * 100).toFixed(0)}%
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                onClick={() => {
                                                    advancedSecurityService
                                                        .resolveThreat(threat.id, { resolved: true })
                                                        .then(() => loadSecurityData());
                                                }}
                                                aria-label={`${threat.id} 위협 해결`}
                                            >
                                                해결
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </TabPanel>

            {/* 알림 탭 */}
            <TabPanel value={selectedTab} index={1}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h6">보안 알림</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>심각도</InputLabel>
                            <Select
                                value={alertFilter.severity || ''}
                                onChange={(e) =>
                                    handleAlertFilterChange(e.target.value || undefined, alertFilter.status, alertFilter.search)
                                }
                                label="심각도"
                            >
                                <MenuItem value="">전체</MenuItem>
                                <MenuItem value="critical">Critical</MenuItem>
                                <MenuItem value="high">High</MenuItem>
                                <MenuItem value="medium">Medium</MenuItem>
                                <MenuItem value="low">Low</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>상태</InputLabel>
                            <Select
                                value={alertFilter.status || ''}
                                onChange={(e) =>
                                    handleAlertFilterChange(alertFilter.severity, e.target.value || undefined, alertFilter.search)
                                }
                                label="상태"
                            >
                                <MenuItem value="">전체</MenuItem>
                                <MenuItem value="new">새 알림</MenuItem>
                                <MenuItem value="acknowledged">확인됨</MenuItem>
                                <MenuItem value="resolved">해결됨</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            size="small"
                            placeholder="검색 (제목, 설명, 유형)..."
                            sx={{ width: 200 }}
                            value={alertFilter.search || ''}
                            onChange={(e) =>
                                handleAlertFilterChange(alertFilter.severity, alertFilter.status, e.target.value || undefined)
                            }
                        />
                    </Box>
                </Box>
                {(filteredAlerts.length === 0 && alerts.length > 0) ? (
                    <Alert severity="info">필터 조건에 맞는 알림이 없습니다.</Alert>
                ) : filteredAlerts.length === 0 && alerts.length === 0 ? (
                    <Alert severity="info">알림이 없습니다.</Alert>
                ) : (
                    <Box role="region" aria-label="보안 알림 목록">
                        {filteredAlerts.map((alert) => (
                            <Alert
                                key={alert.id}
                                severity={getSeverityColor(alert.severity)}
                                sx={{ mb: 2 }}
                                role="alert"
                                aria-live={alert.severity === 'critical' || alert.severity === 'high' ? 'assertive' : 'polite'}
                                action={
                                    alert.status === 'new' && (
                                        <Button
                                            size="small"
                                            onClick={() => handleAcknowledgeAlert(alert.id)}
                                            aria-label={`${alert.title} 알림 확인`}
                                        >
                                            확인
                                        </Button>
                                    )
                                }
                            >
                                <AlertTitle>{alert.title}</AlertTitle>
                                {alert.description}
                            </Alert>
                        ))}
                    </Box>
                )}
            </TabPanel>

            {/* IP 관리 탭 */}
            <TabPanel value={selectedTab} index={2}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h6">차단된 IP 주소</Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>심각도</InputLabel>
                            <Select
                                value={ipFilter.severity || ''}
                                onChange={(e) =>
                                    handleIPFilterChange(e.target.value || undefined, ipFilter.search)
                                }
                                label="심각도"
                            >
                                <MenuItem value="">전체</MenuItem>
                                <MenuItem value="critical">Critical</MenuItem>
                                <MenuItem value="high">High</MenuItem>
                                <MenuItem value="medium">Medium</MenuItem>
                                <MenuItem value="low">Low</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            size="small"
                            placeholder="검색 (IP, 사유)..."
                            sx={{ width: 200 }}
                            value={ipFilter.search || ''}
                            onChange={(e) =>
                                handleIPFilterChange(ipFilter.severity, e.target.value || undefined)
                            }
                        />
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => setIsBlockIPDialogOpen(true)}
                            aria-label="IP 주소 차단 다이얼로그 열기"
                        >
                            IP 차단
                        </Button>
                    </Box>
                </Box>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>IP 주소</TableCell>
                                <TableCell>차단 사유</TableCell>
                                <TableCell>심각도</TableCell>
                                <TableCell>차단 시간</TableCell>
                                <TableCell>작업</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(filteredBlockedIPs.length === 0 && blockedIPs.length > 0) ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        필터 조건에 맞는 IP가 없습니다.
                                    </TableCell>
                                </TableRow>
                            ) : filteredBlockedIPs.length === 0 && blockedIPs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        차단된 IP가 없습니다.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBlockedIPs.map((blocked) => (
                                    <TableRow key={blocked.ip_address}>
                                        <TableCell>{blocked.ip_address}</TableCell>
                                        <TableCell>{blocked.reason}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={blocked.severity}
                                                color={getSeverityColor(blocked.severity)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{new Date(blocked.blocked_at).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleUnblockIP(blocked.ip_address)}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </TabPanel>

            {/* 보안 정책 탭 */}
            <TabPanel value={selectedTab} index={3}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h6">보안 정책</Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>타입</InputLabel>
                            <Select
                                value={policyFilter.type || ''}
                                onChange={(e) =>
                                    handlePolicyFilterChange(e.target.value || undefined, policyFilter.enabled, policyFilter.search)
                                }
                                label="타입"
                            >
                                <MenuItem value="">전체</MenuItem>
                                <MenuItem value="access_control">접근 제어</MenuItem>
                                <MenuItem value="encryption">암호화</MenuItem>
                                <MenuItem value="authentication">인증</MenuItem>
                                <MenuItem value="network">네트워크</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>상태</InputLabel>
                            <Select
                                value={policyFilter.enabled === undefined ? '' : policyFilter.enabled ? 'enabled' : 'disabled'}
                                onChange={(e) => {
                                    const val = e.target.value as string;
                                    const enabled = val === '' ? undefined : val === 'enabled';
                                    handlePolicyFilterChange(policyFilter.type, enabled, policyFilter.search);
                                }}
                                label="상태"
                            >
                                <MenuItem value="">전체</MenuItem>
                                <MenuItem value="enabled">활성</MenuItem>
                                <MenuItem value="disabled">비활성</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            size="small"
                            placeholder="검색 (이름, 설명, 타입)..."
                            sx={{ width: 200 }}
                            value={policyFilter.search || ''}
                            onChange={(e) =>
                                handlePolicyFilterChange(policyFilter.type, policyFilter.enabled, e.target.value || undefined)
                            }
                        />
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => setIsPolicyDialogOpen(true)}
                        >
                            정책 생성
                        </Button>
                    </Box>
                </Box>
                {filteredPolicies.length === 0 && policies.length > 0 ? (
                    <Alert severity="info">필터 조건에 맞는 정책이 없습니다.</Alert>
                ) : filteredPolicies.length === 0 && policies.length === 0 ? (
                    <Alert severity="info">보안 정책이 없습니다.</Alert>
                ) : (
                    <Grid container spacing={2}>
                        {filteredPolicies.map((policy) => (
                            <Grid size={{ xs: 12, md: 6 }} key={policy.id}>
                                <Card>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="h6">{policy.name}</Typography>
                                            <FormControlLabel
                                                control={<Switch checked={policy.enabled} />}
                                                label="활성"
                                            />
                                        </Box>
                                        <Typography variant="body2" color="textSecondary">
                                            {policy.description}
                                        </Typography>
                                        <Chip label={policy.policy_type} size="small" sx={{ mt: 1 }} />
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </TabPanel>

            {/* Rate Limiting 탭 */}
            <TabPanel value={selectedTab} index={4}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Rate Limiting 설정
                </Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>엔드포인트</TableCell>
                                <TableCell>분당 요청</TableCell>
                                <TableCell>시간당 요청</TableCell>
                                <TableCell>일일 요청</TableCell>
                                <TableCell>상태</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.entries(rateLimitConfigs).map(([endpoint, config]) => (
                                <TableRow key={endpoint}>
                                    <TableCell>{endpoint}</TableCell>
                                    <TableCell>{config.requests_per_minute}</TableCell>
                                    <TableCell>{config.requests_per_hour}</TableCell>
                                    <TableCell>{config.requests_per_day}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={config.enabled ? '활성' : '비활성'}
                                            color={config.enabled ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </TabPanel>

            {/* 보안 스캔 탭 */}
            <TabPanel value={selectedTab} index={5}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">보안 스캔</Typography>
                    <Box>
                        <Button
                            variant="outlined"
                            sx={{ mr: 1 }}
                            onClick={() => handleRunScan('quick')}
                            disabled={isLoading}
                        >
                            빠른 스캔
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => handleRunScan('full')}
                            disabled={isLoading}
                        >
                            전체 스캔
                        </Button>
                    </Box>
                </Box>
                {scanResult && (
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                스캔 결과
                            </Typography>
                            <Typography>취약점: {scanResult.vulnerabilities_found}개</Typography>
                            <Typography>위협: {scanResult.threats_detected}개</Typography>
                            <Typography>위험 수준: {scanResult.risk_level}</Typography>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2">권장사항:</Typography>
                                <ul>
                                    {scanResult.recommendations.map((rec, idx) => (
                                        <li key={idx}>{rec}</li>
                                    ))}
                                </ul>
                            </Box>
                        </CardContent>
                    </Card>
                )}
            </TabPanel>

            {/* 자동화 규칙 탭 */}
            <TabPanel value={selectedTab} index={6}>
                <SecurityAutomationPanel />
            </TabPanel>

            {/* 리포트 탭 */}
            <TabPanel value={selectedTab} index={7}>
                <SecurityReportGenerator />
            </TabPanel>

            {/* 차트 및 분석 탭 */}
            <TabPanel value={selectedTab} index={8}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        보안 데이터 시각화
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        보안 위협, 알림, 이벤트를 차트로 시각화하여 트렌드를 파악할 수 있습니다.
                    </Typography>
                </Box>
                <SecurityCharts
                    threats={threats}
                    alerts={alerts}
                    events={events}
                    status={securityStatus}
                />
            </TabPanel>

            {/* 통계 분석 탭 */}
            <TabPanel value={selectedTab} index={9}>
                <SecurityAnalyticsPanel />
            </TabPanel>

            {/* IP 차단 다이얼로그 */}
            <Dialog
                open={isBlockIPDialogOpen}
                onClose={() => setIsBlockIPDialogOpen(false)}
                aria-labelledby="block-ip-dialog-title"
                aria-describedby="block-ip-dialog-description"
            >
                <DialogTitle id="block-ip-dialog-title">IP 주소 차단</DialogTitle>
                <DialogContent>
                    <Typography id="block-ip-dialog-description" variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        차단할 IP 주소와 사유를 입력하세요.
                    </Typography>
                    <TextField
                        fullWidth
                        label="IP 주소"
                        value={newIPBlock.ip_address}
                        onChange={(e) => setNewIPBlock({ ...newIPBlock, ip_address: e.target.value })}
                        sx={{ mb: 2, mt: 1 }}
                        placeholder="예: 192.168.1.100"
                        aria-label="IP 주소 입력"
                        inputProps={{
                            pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
                        }}
                    />
                    <TextField
                        fullWidth
                        label="차단 사유"
                        value={newIPBlock.reason}
                        onChange={(e) => setNewIPBlock({ ...newIPBlock, reason: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth>
                        <InputLabel>심각도</InputLabel>
                        <Select
                            value={newIPBlock.severity}
                            onChange={(e) =>
                                setNewIPBlock({ ...newIPBlock, severity: e.target.value as 'low' | 'medium' | 'high' | 'critical' })
                            }
                        >
                            <MenuItem value="low">낮음</MenuItem>
                            <MenuItem value="medium">중간</MenuItem>
                            <MenuItem value="high">높음</MenuItem>
                            <MenuItem value="critical">긴급</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsBlockIPDialogOpen(false)}>취소</Button>
                    <Button onClick={handleBlockIP} variant="contained">
                        차단
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 정책 생성 다이얼로그 */}
            <Dialog open={isPolicyDialogOpen} onClose={() => setIsPolicyDialogOpen(false)}>
                <DialogTitle>보안 정책 생성</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="정책 이름"
                        value={newPolicy.name}
                        onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
                        sx={{ mb: 2, mt: 1 }}
                    />
                    <TextField
                        fullWidth
                        label="설명"
                        value={newPolicy.description}
                        onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth>
                        <InputLabel>정책 유형</InputLabel>
                        <Select
                            value={newPolicy.policy_type}
                            onChange={(e) =>
                                setNewPolicy({ ...newPolicy, policy_type: e.target.value as 'access_control' | 'rate_limit' | 'encryption' | 'authentication' })
                            }
                        >
                            <MenuItem value="access_control">접근 제어</MenuItem>
                            <MenuItem value="rate_limit">Rate Limiting</MenuItem>
                            <MenuItem value="encryption">암호화</MenuItem>
                            <MenuItem value="authentication">인증</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsPolicyDialogOpen(false)}>취소</Button>
                    <Button onClick={handleCreatePolicy} variant="contained">
                        생성
                    </Button>
                </DialogActions>
            </Dialog>

            {
                isLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                )
            }
        </Box >
    );
};

export default AdvancedSecurityPanel;
