// 보안 자동화 규칙 관리 패널
// 자동화 규칙 생성, 수정, 삭제 및 모니터링

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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Switch,
    FormControlLabel,
    Chip,
    IconButton,
    Tooltip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    PlayArrow,
    Stop,
    Settings,
    Rule,
    CheckCircle,
    Error,
} from '@mui/icons-material';
import securityAutomationService, { AutomationRule } from '../../services/securityAutomationService';
import { errorLogger } from '../../utils/errorLogger';

const SecurityAutomationPanel: React.FC = () => {
    const [rules, setRules] = useState<AutomationRule[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
    const [isMonitoring, setIsMonitoring] = useState(false);

    const [newRule, setNewRule] = useState({
        name: '',
        description: '',
        trigger: {
            type: 'event' as 'threat' | 'alert' | 'event' | 'metric',
            condition: '',
            severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
        },
        actions: [] as Array<{
            type: 'block_ip' | 'send_alert' | 'run_scan' | 'update_policy' | 'notify_admin';
            params: Record<string, any>;
        }>,
        enabled: true,
    });

    useEffect(() => {
        loadRules();
        checkMonitoringStatus();
    }, []);

    const loadRules = () => {
        const loadedRules = securityAutomationService.getRules();
        setRules(loadedRules);
    };

    const checkMonitoringStatus = () => {
        // 모니터링 상태는 서비스 내부에서 관리되므로 별도 상태 확인 필요
        setIsMonitoring(true); // 기본적으로 활성화
    };

    const handleStartMonitoring = () => {
        securityAutomationService.startMonitoring();
        setIsMonitoring(true);
    };

    const handleStopMonitoring = () => {
        securityAutomationService.stopMonitoring();
        setIsMonitoring(false);
    };

    const handleOpenDialog = (rule?: AutomationRule) => {
        if (rule) {
            setEditingRule(rule);
            setNewRule({
                name: rule.name,
                description: rule.description,
                trigger: {
                    ...rule.trigger,
                    severity: rule.trigger.severity || 'medium',
                },
                actions: rule.actions,
                enabled: rule.enabled,
            });
        } else {
            setEditingRule(null);
            setNewRule({
                name: '',
                description: '',
                trigger: {
                    type: 'event',
                    condition: '',
                    severity: 'medium',
                },
                actions: [],
                enabled: true,
            });
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingRule(null);
    };

    const handleSaveRule = () => {
        try {
            if (editingRule) {
                securityAutomationService.updateRule(editingRule.id, newRule);
            } else {
                securityAutomationService.addRule(newRule);
            }
            loadRules();
            handleCloseDialog();
        } catch (error) {
            errorLogger.error('규칙 저장 실패', error as Error);
        }
    };

    const handleDeleteRule = (ruleId: string) => {
        if (window.confirm('이 규칙을 삭제하시겠습니까?')) {
            securityAutomationService.deleteRule(ruleId);
            loadRules();
        }
    };

    const handleToggleRule = (ruleId: string, enabled: boolean) => {
        securityAutomationService.updateRule(ruleId, { enabled });
        loadRules();
    };

    const getTriggerTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            threat: '위협',
            alert: '알림',
            event: '이벤트',
            metric: '메트릭',
        };
        return labels[type] || type;
    };

    const getActionTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            block_ip: 'IP 차단',
            send_alert: '알림 전송',
            run_scan: '스캔 실행',
            update_policy: '정책 업데이트',
            notify_admin: '관리자 알림',
        };
        return labels[type] || type;
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h1">
                    <Rule sx={{ mr: 1, verticalAlign: 'middle' }} />
                    보안 자동화 규칙 관리
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant={isMonitoring ? 'outlined' : 'contained'}
                        color={isMonitoring ? 'error' : 'success'}
                        startIcon={isMonitoring ? <Stop /> : <PlayArrow />}
                        onClick={isMonitoring ? handleStopMonitoring : handleStartMonitoring}
                    >
                        {isMonitoring ? '모니터링 중지' : '모니터링 시작'}
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenDialog()}
                    >
                        규칙 추가
                    </Button>
                </Box>
            </Box>

            {isMonitoring && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    자동화 모니터링이 활성화되어 있습니다. 규칙이 자동으로 실행됩니다.
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                자동화 규칙 목록
                            </Typography>
                            <TableContainer component={Paper} variant="outlined">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>이름</TableCell>
                                            <TableCell>설명</TableCell>
                                            <TableCell>트리거</TableCell>
                                            <TableCell>액션</TableCell>
                                            <TableCell>상태</TableCell>
                                            <TableCell>실행 횟수</TableCell>
                                            <TableCell>작업</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rules.map((rule) => (
                                            <TableRow key={rule.id}>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {rule.name}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {rule.description}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={getTriggerTypeLabel(rule.trigger.type)}
                                                        size="small"
                                                        sx={{ mr: 1 }}
                                                    />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {rule.trigger.condition}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {rule.actions.map((action, idx) => (
                                                        <Chip
                                                            key={idx}
                                                            label={getActionTypeLabel(action.type)}
                                                            size="small"
                                                            sx={{ mr: 0.5, mb: 0.5 }}
                                                        />
                                                    ))}
                                                </TableCell>
                                                <TableCell>
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                checked={rule.enabled}
                                                                onChange={(e) =>
                                                                    handleToggleRule(rule.id, e.target.checked)
                                                                }
                                                                size="small"
                                                            />
                                                        }
                                                        label={rule.enabled ? '활성' : '비활성'}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {rule.trigger_count}회
                                                    </Typography>
                                                    {rule.last_triggered && (
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            {new Date(rule.last_triggered).toLocaleString()}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Tooltip title="수정">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleOpenDialog(rule)}
                                                        >
                                                            <Edit />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="삭제">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleDeleteRule(rule.id)}
                                                        >
                                                            <Delete />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 규칙 편집 다이얼로그 */}
            <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingRule ? '규칙 수정' : '새 규칙 생성'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            fullWidth
                            label="규칙 이름"
                            value={newRule.name}
                            onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="설명"
                            value={newRule.description}
                            onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                            multiline
                            rows={2}
                        />
                        <FormControl fullWidth>
                            <InputLabel>트리거 타입</InputLabel>
                            <Select
                                value={newRule.trigger.type}
                                onChange={(e) =>
                                    setNewRule({
                                        ...newRule,
                                        trigger: {
                                            ...newRule.trigger,
                                            type: e.target.value as any,
                                        },
                                    })
                                }
                            >
                                <MenuItem value="threat">위협</MenuItem>
                                <MenuItem value="alert">알림</MenuItem>
                                <MenuItem value="event">이벤트</MenuItem>
                                <MenuItem value="metric">메트릭</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="트리거 조건"
                            value={newRule.trigger.condition}
                            onChange={(e) =>
                                setNewRule({
                                    ...newRule,
                                    trigger: { ...newRule.trigger, condition: e.target.value },
                                })
                            }
                            placeholder="예: failed_login_count >= 5"
                            helperText="조건을 입력하세요 (예: failed_login_count >= 5, severity == critical)"
                        />
                        <FormControl fullWidth>
                            <InputLabel>심각도</InputLabel>
                            <Select
                                value={newRule.trigger.severity}
                                onChange={(e) =>
                                    setNewRule({
                                        ...newRule,
                                        trigger: {
                                            ...newRule.trigger,
                                            severity: e.target.value as any,
                                        },
                                    })
                                }
                            >
                                <MenuItem value="low">낮음</MenuItem>
                                <MenuItem value="medium">중간</MenuItem>
                                <MenuItem value="high">높음</MenuItem>
                                <MenuItem value="critical">긴급</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={newRule.enabled}
                                    onChange={(e) => setNewRule({ ...newRule, enabled: e.target.checked })}
                                />
                            }
                            label="규칙 활성화"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>취소</Button>
                    <Button onClick={handleSaveRule} variant="contained">
                        저장
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SecurityAutomationPanel;
