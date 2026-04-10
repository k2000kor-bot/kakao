import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
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
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Badge
} from '@mui/material';
import {
    Settings,
    PlayArrow,
    Pause,
    Stop,
    Refresh,
    Add,
    Schedule,
    Event,
    Settings as Manual,
    Rule as Condition,
    Email,
    Sms,
    Api,
    Storage,
    Speed,
    Assessment,
    Warning,
    CheckCircle,
    Error,
    ExpandMore,
    Timeline,
    History,
    Visibility
} from '@mui/icons-material';
import axios from 'axios';
import { errorLogger, toError } from '../utils/errorLogger';
import {
    API_AUTOMATION_EXECUTIONS_PATH,
    API_AUTOMATION_WORKFLOWS_PATH,
    joinApiHealthCheckUrl,
    resolveApiBaseUrl,
} from '../config/api';

const API_ORIGIN = resolveApiBaseUrl();

interface WorkflowDefinition {
    id: string;
    name: string;
    description: string;
    status: string;
    trigger: {
        type: string;
        schedule?: string;
        condition?: unknown;
        event_type?: string;
    };
    actions: Array<{
        type: string;
        config: Record<string, unknown>;
        timeout: number;
    }>;
    created_at: string;
    updated_at: string;
    last_run?: string;
    next_run?: string;
    run_count: number;
    success_count: number;
    error_count: number;
}

interface WorkflowExecution {
    id: string;
    workflow_id: string;
    status: string;
    started_at: string;
    completed_at?: string;
    actions_completed: string[];
    actions_failed: string[];
    error_message?: string;
    execution_time?: number;
}

const AutomationWorkflowManager: React.FC = () => {
    const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
    const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState(0);
    const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinition | null>(null);
    const [_createDialog, setCreateDialog] = useState(false);
    const [_executeDialog, _setExecuteDialog] = useState(false);
    const [_newWorkflow, _setNewWorkflow] = useState({
        name: '',
        description: '',
        trigger_type: 'schedule',
        schedule: '',
        actions: []
    });

    // 데이터 로드
    useEffect(() => {
        loadWorkflows();
        loadExecutions();
    }, []);

    const loadWorkflows = async () => {
        try {
            const response = await axios.get(joinApiHealthCheckUrl(API_ORIGIN, API_AUTOMATION_WORKFLOWS_PATH));
            if (response.data.success) {
                setWorkflows(response.data.data.workflows);
            }
        } catch (err) {
            setError('워크플로우를 불러오는 중 오류가 발생했습니다.');
            const error = toError(err);
            errorLogger.error('Workflows loading error', error, {
                component: 'AutomationWorkflowManager',
                action: 'loadWorkflows',
            });
        }
    };

    const loadExecutions = async () => {
        try {
            const response = await axios.get(joinApiHealthCheckUrl(API_ORIGIN, API_AUTOMATION_EXECUTIONS_PATH));
            if (response.data.success) {
                setExecutions(response.data.data.executions);
            }
        } catch (err) {
            setError('실행 기록을 불러오는 중 오류가 발생했습니다.');
            const error = toError(err);
            errorLogger.error('Executions loading error', error, {
                component: 'AutomationWorkflowManager',
                action: 'loadExecutions',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleExecuteWorkflow = async (workflowId: string) => {
        try {
            const response = await axios.post(
                joinApiHealthCheckUrl(
                    API_ORIGIN,
                    `${API_AUTOMATION_WORKFLOWS_PATH}/${encodeURIComponent(workflowId)}/execute`,
                ),
            );
            if (response.data.success) {
                setError(null);
                loadExecutions(); // 실행 기록 새로고침
            }
        } catch (err) {
            setError('워크플로우 실행 중 오류가 발생했습니다.');
        }
    };

    const handlePauseWorkflow = async (workflowId: string) => {
        try {
            const response = await axios.post(
                joinApiHealthCheckUrl(
                    API_ORIGIN,
                    `${API_AUTOMATION_WORKFLOWS_PATH}/${encodeURIComponent(workflowId)}/pause`,
                ),
            );
            if (response.data.success) {
                setError(null);
                loadWorkflows();
            }
        } catch (err) {
            setError('워크플로우 일시정지 중 오류가 발생했습니다.');
        }
    };

    const handleResumeWorkflow = async (workflowId: string) => {
        try {
            const response = await axios.post(
                joinApiHealthCheckUrl(
                    API_ORIGIN,
                    `${API_AUTOMATION_WORKFLOWS_PATH}/${encodeURIComponent(workflowId)}/resume`,
                ),
            );
            if (response.data.success) {
                setError(null);
                loadWorkflows();
            }
        } catch (err) {
            setError('워크플로우 재개 중 오류가 발생했습니다.');
        }
    };

    const getStatusColor = (status: string): 'success' | 'default' | 'primary' | 'warning' | 'error' => {
        switch (status) {
            case 'active': return 'success';
            case 'inactive': return 'default';
            case 'running': return 'primary';
            case 'paused': return 'warning';
            case 'error': return 'error';
            case 'completed': return 'success';
            default: return 'default';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle />;
            case 'running': return <PlayArrow />;
            case 'paused': return <Pause />;
            case 'error': return <Error />;
            case 'completed': return <CheckCircle />;
            default: return <Stop />;
        }
    };

    const getTriggerIcon = (type: string) => {
        switch (type) {
            case 'schedule': return <Schedule />;
            case 'event': return <Event />;
            case 'manual': return <Manual />;
            case 'condition': return <Condition />;
            default: return <Settings />;
        }
    };

    const getActionIcon = (type: string) => {
        switch (type) {
            case 'email': return <Email />;
            case 'sms': return <Sms />;
            case 'api_call': return <Api />;
            case 'data_processing': return <Storage />;
            case 'system_optimization': return <Speed />;
            case 'backup': return <Storage />;
            case 'report_generation': return <Assessment />;
            case 'alert': return <Warning />;
            default: return <Settings />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const calculateSuccessRate = (workflow: WorkflowDefinition) => {
        if (workflow.run_count === 0) return 0;
        return Math.round((workflow.success_count / workflow.run_count) * 100);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'var(--app-vh)' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <LinearProgress sx={{ width: 200, mb: 2 }} />
                    <Typography variant="h6">워크플로우 데이터를 불러오는 중...</Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* 헤더 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Settings sx={{ fontSize: 32, color: 'primary.main' }} />
                    <Typography variant="h4" fontWeight="bold">
                        자동화 워크플로우 관리
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="새로고침">
                        <IconButton onClick={() => { loadWorkflows(); loadExecutions(); }} color="primary">
                            <Refresh />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setCreateDialog(true)}
                    >
                        새 워크플로우
                    </Button>
                </Box>
            </Box>

            {/* 탭 네비게이션 */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
                    <Tab label="워크플로우" icon={<Settings />} />
                    <Tab label="실행 기록" icon={<History />} />
                    <Tab label="모니터링" icon={<Timeline />} />
                </Tabs>
            </Box>

            {/* 워크플로우 탭 */}
            {selectedTab === 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {workflows.map((workflow) => (
                        <Card key={workflow.id} sx={{ flex: '1 1 400px', minWidth: '400px' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Box>
                                        <Typography variant="h6" fontWeight="bold">
                                            {workflow.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            {workflow.description}
                                        </Typography>
                                        <Chip
                                            label={workflow.status}
                                            color={getStatusColor(workflow.status)}
                                            size="small"
                                            icon={getStatusIcon(workflow.status)}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <Tooltip title="실행">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleExecuteWorkflow(workflow.id)}
                                                disabled={workflow.status === 'running'}
                                            >
                                                <PlayArrow />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={workflow.status === 'paused' ? '재개' : '일시정지'}>
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    workflow.status === 'paused'
                                                        ? handleResumeWorkflow(workflow.id)
                                                        : handlePauseWorkflow(workflow.id)
                                                }
                                            >
                                                {workflow.status === 'paused' ? <PlayArrow /> : <Pause />}
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="상세보기">
                                            <IconButton
                                                size="small"
                                                onClick={() => setSelectedWorkflow(workflow)}
                                            >
                                                <Visibility />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                {/* 트리거 정보 */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                                        트리거
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {getTriggerIcon(workflow.trigger.type)}
                                        <Typography variant="body2">
                                            {workflow.trigger.type === 'schedule' && workflow.trigger.schedule && (
                                                `스케줄: ${workflow.trigger.schedule}`
                                            )}
                                            {workflow.trigger.type === 'event' && (
                                                `이벤트: ${workflow.trigger.event_type}`
                                            )}
                                            {workflow.trigger.type === 'manual' && '수동 실행'}
                                            {workflow.trigger.type === 'condition' && '조건부 실행'}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* 액션 정보 */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                                        액션 ({workflow.actions.length}개)
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {workflow.actions.map((action, index) => (
                                            <Chip
                                                key={index}
                                                label={action.type}
                                                size="small"
                                                icon={getActionIcon(action.type)}
                                                variant="outlined"
                                            />
                                        ))}
                                    </Box>
                                </Box>

                                {/* 통계 정보 */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            실행 횟수: {workflow.run_count}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            성공률: {calculateSuccessRate(workflow)}%
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        {workflow.last_run && (
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                마지막 실행: {formatDate(workflow.last_run)}
                                            </Typography>
                                        )}
                                        {workflow.next_run && (
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                다음 실행: {formatDate(workflow.next_run)}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}

            {/* 실행 기록 탭 */}
            {selectedTab === 1 && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" mb={2}>
                            실행 기록
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>워크플로우</TableCell>
                                        <TableCell>상태</TableCell>
                                        <TableCell>시작 시간</TableCell>
                                        <TableCell>완료 시간</TableCell>
                                        <TableCell>실행 시간</TableCell>
                                        <TableCell>완료된 액션</TableCell>
                                        <TableCell>실패한 액션</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {executions.slice(0, 20).map((execution) => {
                                        const workflow = workflows.find(w => w.id === execution.workflow_id);
                                        return (
                                            <TableRow key={execution.id}>
                                                <TableCell>
                                                    {workflow ? workflow.name : execution.workflow_id}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={execution.status}
                                                        color={getStatusColor(execution.status)}
                                                        size="small"
                                                        icon={getStatusIcon(execution.status)}
                                                    />
                                                </TableCell>
                                                <TableCell>{formatDate(execution.started_at)}</TableCell>
                                                <TableCell>
                                                    {execution.completed_at ? formatDate(execution.completed_at) : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {execution.execution_time ? `${execution.execution_time.toFixed(2)}초` : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge badgeContent={execution.actions_completed.length} color="success">
                                                        <CheckCircle color="success" />
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge badgeContent={execution.actions_failed.length} color="error">
                                                        <Error color="error" />
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {/* 모니터링 탭 */}
            {selectedTab === 2 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Card sx={{ flex: '1 1 300px' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" mb={2}>
                                워크플로우 통계
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">총 워크플로우</Typography>
                                <Typography variant="h4" fontWeight="bold" color="primary.main">
                                    {workflows.length}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">활성 워크플로우</Typography>
                                <Typography variant="h4" fontWeight="bold" color="success.main">
                                    {workflows.filter(w => w.status === 'active').length}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">실행 중</Typography>
                                <Typography variant="h4" fontWeight="bold" color="warning.main">
                                    {workflows.filter(w => w.status === 'running').length}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>

                    <Card sx={{ flex: '1 1 300px' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" mb={2}>
                                실행 통계
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">총 실행 횟수</Typography>
                                <Typography variant="h4" fontWeight="bold" color="primary.main">
                                    {executions.length}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">성공한 실행</Typography>
                                <Typography variant="h4" fontWeight="bold" color="success.main">
                                    {executions.filter(e => e.status === 'completed').length}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">실패한 실행</Typography>
                                <Typography variant="h4" fontWeight="bold" color="error.main">
                                    {executions.filter(e => e.status === 'error').length}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>

                    <Card sx={{ flex: '1 1 300px' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" mb={2}>
                                성능 지표
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">평균 실행 시간</Typography>
                                <Typography variant="h4" fontWeight="bold" color="primary.main">
                                    {executions.length > 0
                                        ? `${(executions.reduce((sum, e) => sum + (e.execution_time || 0), 0) / executions.length).toFixed(2)}초`
                                        : '0초'
                                    }
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">전체 성공률</Typography>
                                <Typography variant="h4" fontWeight="bold" color="success.main">
                                    {executions.length > 0
                                        ? `${Math.round((executions.filter(e => e.status === 'completed').length / executions.length) * 100)}%`
                                        : '0%'
                                    }
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            )}

            {/* 워크플로우 상세보기 다이얼로그 */}
            <Dialog open={!!selectedWorkflow} onClose={() => setSelectedWorkflow(null)} maxWidth="md" fullWidth>
                {selectedWorkflow && (
                    <>
                        <DialogTitle>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Settings />
                                {selectedWorkflow.name}
                            </Box>
                        </DialogTitle>
                        <DialogContent>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" fontWeight="bold" mb={1}>설명</Typography>
                                <Typography variant="body1">{selectedWorkflow.description}</Typography>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" fontWeight="bold" mb={1}>트리거 설정</Typography>
                                <Paper sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        {getTriggerIcon(selectedWorkflow.trigger.type)}
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {selectedWorkflow.trigger.type}
                                        </Typography>
                                    </Box>
                                    {selectedWorkflow.trigger.schedule && (
                                        <Typography variant="body2" color="text.secondary">
                                            스케줄: {selectedWorkflow.trigger.schedule}
                                        </Typography>
                                    )}
                                </Paper>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" fontWeight="bold" mb={1}>액션 목록</Typography>
                                {selectedWorkflow.actions.map((action, index) => (
                                    <Accordion key={index}>
                                        <AccordionSummary expandIcon={<ExpandMore />}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {getActionIcon(action.type)}
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {action.type}
                                                </Typography>
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                타임아웃: {action.timeout}초
                                            </Typography>
                                            <Typography variant="body2">
                                                설정: {JSON.stringify(action.config, null, 2)}
                                            </Typography>
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" fontWeight="bold" mb={1}>실행 통계</Typography>
                                <Box sx={{ display: 'flex', gap: 3 }}>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">총 실행</Typography>
                                        <Typography variant="h5" fontWeight="bold">{selectedWorkflow.run_count}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">성공</Typography>
                                        <Typography variant="h5" fontWeight="bold" color="success.main">
                                            {selectedWorkflow.success_count}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">실패</Typography>
                                        <Typography variant="h5" fontWeight="bold" color="error.main">
                                            {selectedWorkflow.error_count}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">성공률</Typography>
                                        <Typography variant="h5" fontWeight="bold" color="primary.main">
                                            {calculateSuccessRate(selectedWorkflow)}%
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setSelectedWorkflow(null)}>닫기</Button>
                            <Button
                                variant="contained"
                                onClick={() => handleExecuteWorkflow(selectedWorkflow.id)}
                                disabled={selectedWorkflow.status === 'running'}
                            >
                                실행
                            </Button>
                        </DialogActions>
                    </>
                )}
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

export default AutomationWorkflowManager;
