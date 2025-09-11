import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    IconButton,
    CircularProgress
} from '@mui/material';
import {
    PlayArrow,
    Refresh,
    Add,
    Delete,
    Edit,
    Save,
    CheckCircle,
    Error,
    Warning,
    Info
} from '@mui/icons-material';
import integratedSystemAPI from '../../services/integratedSystemAPI';

interface ServiceConfig {
    id: string;
    name: string;
    url: string;
    enabled: boolean;
    timeout: number;
    retryCount: number;
    healthCheckInterval: number;
}

interface IntegrationRule {
    id: string;
    name: string;
    source: string;
    target: string;
    condition: string;
    action: string;
    enabled: boolean;
}

const SystemIntegrationManager: React.FC = () => {
    const [services, setServices] = useState<ServiceConfig[]>([]);
    const [integrationRules, setIntegrationRules] = useState<IntegrationRule[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedService, setSelectedService] = useState<ServiceConfig | null>(null);
    const [selectedRule, setSelectedRule] = useState<IntegrationRule | null>(null);
    const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
    const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
    const [isTestRunning, setIsTestRunning] = useState(false);
    const [testResults, setTestResults] = useState<Array<{
        service: string;
        status: string;
        responseTime: number;
        message: string;
    }>>([]);

    useEffect(() => {
        loadConfiguration();
    }, []);

    const loadConfiguration = async () => {
        setIsLoading(true);
        try {
            // 서비스 설정 로드
            const servicesResponse = await integratedSystemAPI.getSystemConfig();
            if (servicesResponse.success && servicesResponse.data?.services) {
                setServices(servicesResponse.data.services);
            } else {
                // 기본 서비스 설정
                setServices([
                    {
                        id: 'main',
                        name: '메인 서비스',
                        url: 'http://localhost:5001',
                        enabled: true,
                        timeout: 30000,
                        retryCount: 3,
                        healthCheckInterval: 30000
                    },
                    {
                        id: 'ai',
                        name: 'AI 서비스',
                        url: 'http://localhost:8002',
                        enabled: true,
                        timeout: 30000,
                        retryCount: 3,
                        healthCheckInterval: 30000
                    },
                    {
                        id: 'unified',
                        name: '통합 서비스',
                        url: 'http://localhost:8003',
                        enabled: true,
                        timeout: 30000,
                        retryCount: 3,
                        healthCheckInterval: 30000
                    },
                    {
                        id: 'ultimate',
                        name: '궁극 서비스',
                        url: 'http://localhost:8004',
                        enabled: true,
                        timeout: 30000,
                        retryCount: 3,
                        healthCheckInterval: 30000
                    }
                ]);
            }

            // 통합 규칙 로드
            if (servicesResponse.success && servicesResponse.data?.integrationRules) {
                setIntegrationRules(servicesResponse.data.integrationRules);
            } else {
                // 기본 통합 규칙
                setIntegrationRules([
                    {
                        id: 'rule1',
                        name: 'AI 응답 자동 전달',
                        source: 'ai',
                        target: 'main',
                        condition: 'response_ready',
                        action: 'forward_response',
                        enabled: true
                    },
                    {
                        id: 'rule2',
                        name: '에러 자동 복구',
                        source: 'any',
                        target: 'any',
                        condition: 'service_down',
                        action: 'restart_service',
                        enabled: true
                    }
                ]);
            }
        } catch (error) {
            console.error('설정 로드 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleServiceEdit = (service: ServiceConfig) => {
        setSelectedService(service);
        setIsServiceDialogOpen(true);
    };

    const handleServiceSave = async () => {
        if (!selectedService) return;

        try {
            const updatedServices = services.map(s =>
                s.id === selectedService.id ? selectedService : s
            );
            setServices(updatedServices);

            // 서버에 설정 저장
            await integratedSystemAPI.updateSystemConfig({
                services: updatedServices,
                integrationRules
            });

            setIsServiceDialogOpen(false);
            setSelectedService(null);
        } catch (error) {
            console.error('서비스 설정 저장 실패:', error);
        }
    };

    const handleRuleEdit = (rule: IntegrationRule) => {
        setSelectedRule(rule);
        setIsRuleDialogOpen(true);
    };

    const handleRuleSave = async () => {
        if (!selectedRule) return;

        try {
            const updatedRules = integrationRules.map(r =>
                r.id === selectedRule.id ? selectedRule : r
            );
            setIntegrationRules(updatedRules);

            // 서버에 설정 저장
            await integratedSystemAPI.updateSystemConfig({
                services,
                integrationRules: updatedRules
            });

            setIsRuleDialogOpen(false);
            setSelectedRule(null);
        } catch (error) {
            console.error('통합 규칙 저장 실패:', error);
        }
    };

    const handleServiceToggle = async (serviceId: string) => {
        try {
            const updatedServices = services.map(s =>
                s.id === serviceId ? { ...s, enabled: !s.enabled } : s
            );
            setServices(updatedServices);

            await integratedSystemAPI.updateSystemConfig({
                services: updatedServices,
                integrationRules
            });
        } catch (error) {
            console.error('서비스 상태 변경 실패:', error);
        }
    };

    const handleRuleToggle = async (ruleId: string) => {
        try {
            const updatedRules = integrationRules.map(r =>
                r.id === ruleId ? { ...r, enabled: !r.enabled } : r
            );
            setIntegrationRules(updatedRules);

            await integratedSystemAPI.updateSystemConfig({
                services,
                integrationRules: updatedRules
            });
        } catch (error) {
            console.error('통합 규칙 상태 변경 실패:', error);
        }
    };

    const runIntegrationTest = async () => {
        setIsTestRunning(true);
        setTestResults([]);

        try {
            const results = [];

            // 각 서비스 연결 테스트
            for (const service of services) {
                if (!service.enabled) continue;

                try {
                    const startTime = Date.now();
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), service.timeout);

                    const response = await fetch(`${service.url}/api/health`, {
                        method: 'GET',
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);
                    const responseTime = Date.now() - startTime;

                    results.push({
                        service: service.name,
                        status: response.ok ? 'success' : 'error',
                        responseTime,
                        message: response.ok ? '연결 성공' : `HTTP ${response.status}`
                    });
                } catch (error) {
                    results.push({
                        service: service.name,
                        status: 'error',
                        responseTime: 0,
                        message: '연결 실패'
                    });
                }
            }

            setTestResults(results);
        } catch (error) {
            console.error('통합 테스트 실패:', error);
        } finally {
            setIsTestRunning(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return <CheckCircle color="success" />;
            case 'error':
                return <Error color="error" />;
            case 'warning':
                return <Warning color="warning" />;
            default:
                return <Info color="info" />;
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
                ⚙️ 시스템 통합 관리자
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                시스템 서비스와 통합 규칙을 관리하고 모니터링합니다.
            </Typography>

            {/* 제어 패널 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">통합 테스트</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="contained"
                                startIcon={isTestRunning ? <CircularProgress size={20} /> : <PlayArrow />}
                                onClick={runIntegrationTest}
                                disabled={isTestRunning}
                            >
                                {isTestRunning ? '테스트 중...' : '통합 테스트 실행'}
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Refresh />}
                                onClick={loadConfiguration}
                                disabled={isLoading}
                            >
                                새로고침
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <Grid container spacing={3}>
                {/* 서비스 관리 */}
                <Grid sx={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">서비스 관리</Typography>
                                <Button
                                    variant="outlined"
                                    startIcon={<Add />}
                                    size="small"
                                >
                                    서비스 추가
                                </Button>
                            </Box>
                            <List>
                                {services.map((service, index) => (
                                    <React.Fragment key={service.id}>
                                        <ListItem>
                                            <ListItemIcon>
                                                <Switch
                                                    checked={service.enabled}
                                                    onChange={() => handleServiceToggle(service.id)}
                                                />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={service.name}
                                                secondary={`${service.url} • 타임아웃: ${service.timeout}ms`}
                                            />
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleServiceEdit(service)}
                                                >
                                                    <Edit />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </Box>
                                        </ListItem>
                                        {index < services.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 통합 규칙 관리 */}
                <Grid sx={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">통합 규칙</Typography>
                                <Button
                                    variant="outlined"
                                    startIcon={<Add />}
                                    size="small"
                                >
                                    규칙 추가
                                </Button>
                            </Box>
                            <List>
                                {integrationRules.map((rule, index) => (
                                    <React.Fragment key={rule.id}>
                                        <ListItem>
                                            <ListItemIcon>
                                                <Switch
                                                    checked={rule.enabled}
                                                    onChange={() => handleRuleToggle(rule.id)}
                                                />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={rule.name}
                                                secondary={`${rule.source} → ${rule.target} • ${rule.condition}`}
                                            />
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRuleEdit(rule)}
                                                >
                                                    <Edit />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </Box>
                                        </ListItem>
                                        {index < integrationRules.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 테스트 결과 */}
            {testResults.length > 0 && (
                <Card sx={{ mt: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            테스트 결과
                        </Typography>
                        <List>
                            {testResults.map((result, index) => (
                                <ListItem key={index}>
                                    <ListItemIcon>
                                        {getStatusIcon(result.status)}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={result.service}
                                        secondary={`${result.message} • 응답 시간: ${result.responseTime}ms`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            )}

            {/* 서비스 편집 다이얼로그 */}
            <Dialog
                open={isServiceDialogOpen}
                onClose={() => setIsServiceDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>서비스 설정</DialogTitle>
                <DialogContent>
                    {selectedService && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <TextField
                                label="서비스 이름"
                                value={selectedService.name}
                                onChange={(e) => setSelectedService({
                                    ...selectedService,
                                    name: e.target.value
                                })}
                                fullWidth
                            />
                            <TextField
                                label="URL"
                                value={selectedService.url}
                                onChange={(e) => setSelectedService({
                                    ...selectedService,
                                    url: e.target.value
                                })}
                                fullWidth
                            />
                            <TextField
                                label="타임아웃 (ms)"
                                type="number"
                                value={selectedService.timeout}
                                onChange={(e) => setSelectedService({
                                    ...selectedService,
                                    timeout: parseInt(e.target.value) || 30000
                                })}
                                fullWidth
                            />
                            <TextField
                                label="재시도 횟수"
                                type="number"
                                value={selectedService.retryCount}
                                onChange={(e) => setSelectedService({
                                    ...selectedService,
                                    retryCount: parseInt(e.target.value) || 3
                                })}
                                fullWidth
                            />
                            <TextField
                                label="헬스 체크 간격 (ms)"
                                type="number"
                                value={selectedService.healthCheckInterval}
                                onChange={(e) => setSelectedService({
                                    ...selectedService,
                                    healthCheckInterval: parseInt(e.target.value) || 30000
                                })}
                                fullWidth
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={selectedService.enabled}
                                        onChange={(e) => setSelectedService({
                                            ...selectedService,
                                            enabled: e.target.checked
                                        })}
                                    />
                                }
                                label="활성화"
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsServiceDialogOpen(false)}>
                        취소
                    </Button>
                    <Button onClick={handleServiceSave} variant="contained" startIcon={<Save />}>
                        저장
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 통합 규칙 편집 다이얼로그 */}
            <Dialog
                open={isRuleDialogOpen}
                onClose={() => setIsRuleDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>통합 규칙 설정</DialogTitle>
                <DialogContent>
                    {selectedRule && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <TextField
                                label="규칙 이름"
                                value={selectedRule.name}
                                onChange={(e) => setSelectedRule({
                                    ...selectedRule,
                                    name: e.target.value
                                })}
                                fullWidth
                            />
                            <FormControl fullWidth>
                                <InputLabel>소스 서비스</InputLabel>
                                <Select
                                    value={selectedRule.source}
                                    onChange={(e) => setSelectedRule({
                                        ...selectedRule,
                                        source: e.target.value
                                    })}
                                >
                                    <MenuItem value="any">모든 서비스</MenuItem>
                                    {services.map(service => (
                                        <MenuItem key={service.id} value={service.id}>
                                            {service.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel>대상 서비스</InputLabel>
                                <Select
                                    value={selectedRule.target}
                                    onChange={(e) => setSelectedRule({
                                        ...selectedRule,
                                        target: e.target.value
                                    })}
                                >
                                    <MenuItem value="any">모든 서비스</MenuItem>
                                    {services.map(service => (
                                        <MenuItem key={service.id} value={service.id}>
                                            {service.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                label="조건"
                                value={selectedRule.condition}
                                onChange={(e) => setSelectedRule({
                                    ...selectedRule,
                                    condition: e.target.value
                                })}
                                fullWidth
                            />
                            <TextField
                                label="액션"
                                value={selectedRule.action}
                                onChange={(e) => setSelectedRule({
                                    ...selectedRule,
                                    action: e.target.value
                                })}
                                fullWidth
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={selectedRule.enabled}
                                        onChange={(e) => setSelectedRule({
                                            ...selectedRule,
                                            enabled: e.target.checked
                                        })}
                                    />
                                }
                                label="활성화"
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsRuleDialogOpen(false)}>
                        취소
                    </Button>
                    <Button onClick={handleRuleSave} variant="contained" startIcon={<Save />}>
                        저장
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SystemIntegrationManager;
