import React, { useState, useEffect } from 'react';
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
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    Tooltip,
    LinearProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Switch,
    FormControlLabel,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Badge,
    Alert,
    TextField,
    InputAdornment,
    Tabs,
    Tab,
    Divider,
    CircularProgress,
    Slider,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    MusicNote,
    PlayArrow,
    Pause,
    Stop,
    Refresh,
    Add,
    Delete,
    Edit,
    Visibility,
    Settings,
    Timeline,
    Assessment,
    Build,
    ExpandMore,
    CheckCircle,
    Warning,
    Error,
    Schedule,
    Speed,
    Memory,
    Storage,
    Cpu,
    TrendingUp,
    TrendingDown,
    TrendingFlat,
    AutoFixHigh,
    Tune,
    Optimization,
    Analytics,
    SmartToy,
    Psychology,
    Science,
    Code,
    DataUsage,
    Workflow,
    Task,
    Queue,
    PriorityHigh,
    PriorityMedium,
    PriorityLow,
    CriticalPriority
} from '@mui/icons-material';
import ultraAdvancedAIOrchestrationService, {
    AIOrchestrationTask,
    AIOrchestrationWorkflow,
    AIOrchestrationMetrics
} from '../services/ultraAdvancedAIOrchestrationService';

interface OrchestrationDashboardState {
    tasks: AIOrchestrationTask[];
    workflows: AIOrchestrationWorkflow[];
    metrics: AIOrchestrationMetrics;
    selectedTask: AIOrchestrationTask | null;
    selectedWorkflow: AIOrchestrationWorkflow | null;
    showTaskDetails: boolean;
    showWorkflowDetails: boolean;
    showCreateDialog: boolean;
    createDialogType: 'task' | 'workflow';
}

const UltraAdvancedAIOrchestrationDashboard: React.FC = () => {
    const [state, setState] = useState<OrchestrationDashboardState>({
        tasks: [],
        workflows: [],
        metrics: ultraAdvancedAIOrchestrationService.getMetrics(),
        selectedTask: null,
        selectedWorkflow: null,
        showTaskDetails: false,
        showWorkflowDetails: false,
        showCreateDialog: false,
        createDialogType: 'task'
    });

    const [activeTab, setActiveTab] = useState(0);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(3000);

    // 새 작업/워크플로우 생성 폼 상태
    const [createForm, setCreateForm] = useState({
        name: '',
        description: '',
        type: 'analysis' as AIOrchestrationTask['type'],
        priority: 'medium' as AIOrchestrationTask['priority'],
        input: ''
    });

    useEffect(() => {
        const updateData = () => {
            setState(prev => ({
                ...prev,
                tasks: ultraAdvancedAIOrchestrationService.getTasks(),
                workflows: ultraAdvancedAIOrchestrationService.getWorkflows(),
                metrics: ultraAdvancedAIOrchestrationService.getMetrics()
            }));
        };

        // 초기 데이터 로드
        updateData();

        // 이벤트 리스너 등록
        const handleTaskCreated = (task: AIOrchestrationTask) => {
            setState(prev => ({
                ...prev,
                tasks: [...prev.tasks, task]
            }));
        };

        const handleTaskCompleted = (task: AIOrchestrationTask) => {
            setState(prev => ({
                ...prev,
                tasks: prev.tasks.map(t => t.id === task.id ? task : t)
            }));
        };

        const handleWorkflowCreated = (workflow: AIOrchestrationWorkflow) => {
            setState(prev => ({
                ...prev,
                workflows: [...prev.workflows, workflow]
            }));
        };

        const handleMetricsUpdated = (metrics: AIOrchestrationMetrics) => {
            setState(prev => ({
                ...prev,
                metrics
            }));
        };

        ultraAdvancedAIOrchestrationService.on('task_created', handleTaskCreated);
        ultraAdvancedAIOrchestrationService.on('task_completed', handleTaskCompleted);
        ultraAdvancedAIOrchestrationService.on('workflow_created', handleWorkflowCreated);
        ultraAdvancedAIOrchestrationService.on('metrics_updated', handleMetricsUpdated);

        // 자동 새로고침
        if (autoRefresh) {
            const interval = setInterval(updateData, refreshInterval);
            return () => {
                clearInterval(interval);
                ultraAdvancedAIOrchestrationService.off('task_created', handleTaskCreated);
                ultraAdvancedAIOrchestrationService.off('task_completed', handleTaskCompleted);
                ultraAdvancedAIOrchestrationService.off('workflow_created', handleWorkflowCreated);
                ultraAdvancedAIOrchestrationService.off('metrics_updated', handleMetricsUpdated);
            };
        }

        return () => {
            ultraAdvancedAIOrchestrationService.off('task_created', handleTaskCreated);
            ultraAdvancedAIOrchestrationService.off('task_completed', handleTaskCompleted);
            ultraAdvancedAIOrchestrationService.off('workflow_created', handleWorkflowCreated);
            ultraAdvancedAIOrchestrationService.off('metrics_updated', handleMetricsUpdated);
        };
    }, [autoRefresh, refreshInterval]);

    const handleCreateTask = async () => {
        try {
            await ultraAdvancedAIOrchestrationService.createTask(
                createForm.type,
                { text: createForm.input },
                createForm.priority
            );
            setCreateForm({ name: '', description: '', type: 'analysis', priority: 'medium', input: '' });
            setState(prev => ({ ...prev, showCreateDialog: false }));
        } catch (error) {
            console.error('작업 생성 실패:', error);
        }
    };

    const handleCreateWorkflow = async () => {
        try {
            const steps = [
                {
                    type: 'analysis' as const,
                    priority: 'medium' as const,
                    input: { text: createForm.input }
                },
                {
                    type: 'optimization' as const,
                    priority: 'high' as const,
                    input: { target: 'system' }
                },
                {
                    type: 'synthesis' as const,
                    priority: 'medium' as const,
                    input: { format: 'report' }
                }
            ];

            await ultraAdvancedAIOrchestrationService.createWorkflow(
                createForm.name,
                createForm.description,
                steps
            );
            setCreateForm({ name: '', description: '', type: 'analysis', priority: 'medium', input: '' });
            setState(prev => ({ ...prev, showCreateDialog: false }));
        } catch (error) {
            console.error('워크플로우 생성 실패:', error);
        }
    };

    const handleTaskClick = (task: AIOrchestrationTask) => {
        setState(prev => ({
            ...prev,
            selectedTask: task,
            showTaskDetails: true
        }));
    };

    const handleWorkflowClick = (workflow: AIOrchestrationWorkflow) => {
        setState(prev => ({
            ...prev,
            selectedWorkflow: workflow,
            showWorkflowDetails: true
        }));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'success';
            case 'running': return 'primary';
            case 'pending': return 'warning';
            case 'failed': return 'error';
            default: return 'default';
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'critical': return <CriticalPriority />;
            case 'high': return <PriorityHigh />;
            case 'medium': return <PriorityMedium />;
            case 'low': return <PriorityLow />;
            default: return <PriorityMedium />;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'analysis': return <Analytics />;
            case 'optimization': return <Optimization />;
            case 'learning': return <Psychology />;
            case 'prediction': return <TrendingUp />;
            case 'synthesis': return <Science />;
            default: return <Task />;
        }
    };

    const getHealthColor = (health: string) => {
        switch (health) {
            case 'excellent': return 'success';
            case 'good': return 'primary';
            case 'fair': return 'warning';
            case 'poor': return 'error';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <MusicNote color="primary" />
                고도화된 AI 오케스트레이션 대시보드
            </Typography>

            {/* 제어 패널 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={autoRefresh}
                                        onChange={(e) => setAutoRefresh(e.target.checked)}
                                    />
                                }
                                label="자동 새로고침"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={true}
                                        disabled
                                    />
                                }
                                label="오케스트레이션 활성"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={() => setState(prev => ({ ...prev, showCreateDialog: true, createDialogType: 'task' }))}
                                >
                                    작업 생성
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<Workflow />}
                                    onClick={() => setState(prev => ({ ...prev, showCreateDialog: true, createDialogType: 'workflow' }))}
                                >
                                    워크플로우 생성
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<Refresh />}
                                    onClick={() => window.location.reload()}
                                >
                                    새로고침
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* 시스템 상태 */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                총 작업
                            </Typography>
                            <Typography variant="h4">
                                {state.metrics.total_tasks}
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={(state.metrics.total_tasks / 100) * 100}
                                sx={{ mt: 1 }}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                완료된 작업
                            </Typography>
                            <Typography variant="h4">
                                {state.metrics.completed_tasks}
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={state.metrics.total_tasks > 0 ? (state.metrics.completed_tasks / state.metrics.total_tasks) * 100 : 0}
                                sx={{ mt: 1 }}
                                color="success"
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                평균 처리 시간
                            </Typography>
                            <Typography variant="h4">
                                {state.metrics.average_processing_time.toFixed(0)}ms
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={Math.min(100, state.metrics.average_processing_time / 10)}
                                sx={{ mt: 1 }}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                시스템 상태
                            </Typography>
                            <Typography variant="h4">
                                <Chip
                                    label={state.metrics.system_health}
                                    color={getHealthColor(state.metrics.system_health) as any}
                                    size="small"
                                />
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 탭 네비게이션 */}
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
                <Tab label="작업 관리" icon={<Task />} />
                <Tab label="워크플로우" icon={<Workflow />} />
                <Tab label="리소스 모니터링" icon={<DataUsage />} />
                <Tab label="성능 분석" icon={<Assessment />} />
            </Tabs>

            {/* 작업 관리 탭 */}
            {activeTab === 0 && (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    활성 작업 ({state.tasks.filter(t => t.status === 'running' || t.status === 'pending').length})
                                </Typography>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>상태</TableCell>
                                                <TableCell>타입</TableCell>
                                                <TableCell>우선순위</TableCell>
                                                <TableCell>생성 시간</TableCell>
                                                <TableCell>처리 시간</TableCell>
                                                <TableCell>액션</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {state.tasks
                                                .filter(task => task.status === 'running' || task.status === 'pending')
                                                .map((task) => (
                                                    <TableRow
                                                        key={task.id}
                                                        sx={{ cursor: 'pointer' }}
                                                        onClick={() => handleTaskClick(task)}
                                                    >
                                                        <TableCell>
                                                            <Chip
                                                                label={task.status}
                                                                color={getStatusColor(task.status) as any}
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                {getTypeIcon(task.type)}
                                                                {task.type}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                {getPriorityIcon(task.priority)}
                                                                {task.priority}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            {task.metadata.created_at.toLocaleTimeString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            {task.metadata.processing_time ?
                                                                `${task.metadata.processing_time}ms` :
                                                                task.status === 'running' ?
                                                                    <CircularProgress size={16} /> :
                                                                    '-'
                                                            }
                                                        </TableCell>
                                                        <TableCell>
                                                            <IconButton
                                                                size="small"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    ultraAdvancedAIOrchestrationService.cancelTask(task.id);
                                                                }}
                                                            >
                                                                <Stop />
                                                            </IconButton>
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
            )}

            {/* 워크플로우 탭 */}
            {activeTab === 1 && (
                <Grid container spacing={3}>
                    {state.workflows.map((workflow) => (
                        <Grid item xs={12} md={6} key={workflow.id}>
                            <Card
                                sx={{ cursor: 'pointer' }}
                                onClick={() => handleWorkflowClick(workflow)}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6">
                                            {workflow.name}
                                        </Typography>
                                        <Chip
                                            label={workflow.status}
                                            color={getStatusColor(workflow.status) as any}
                                            size="small"
                                        />
                                    </Box>
                                    <Typography color="textSecondary" gutterBottom>
                                        {workflow.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2">
                                            단계: {workflow.current_step + 1} / {workflow.steps.length}
                                        </Typography>
                                        <Typography variant="body2">
                                            성공률: {(workflow.metadata.success_rate * 100).toFixed(1)}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={((workflow.current_step + 1) / workflow.steps.length) * 100}
                                        sx={{ mt: 1 }}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* 리소스 모니터링 탭 */}
            {activeTab === 2 && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    CPU 사용률
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Cpu color="primary" />
                                    <Typography variant="h4">
                                        {(state.metrics.resource_utilization.cpu * 100).toFixed(1)}%
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={state.metrics.resource_utilization.cpu * 100}
                                    sx={{ mt: 2 }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    메모리 사용률
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Memory color="primary" />
                                    <Typography variant="h4">
                                        {(state.metrics.resource_utilization.memory * 100).toFixed(1)}%
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={state.metrics.resource_utilization.memory * 100}
                                    sx={{ mt: 2 }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    GPU 사용률
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Storage color="primary" />
                                    <Typography variant="h4">
                                        {(state.metrics.resource_utilization.gpu * 100).toFixed(1)}%
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={state.metrics.resource_utilization.gpu * 100}
                                    sx={{ mt: 2 }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* 성능 분석 탭 */}
            {activeTab === 3 && (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    성능 메트릭
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={3}>
                                        <Box>
                                            <Typography color="textSecondary">워크플로우 성공률</Typography>
                                            <Typography variant="h4">
                                                {(state.metrics.workflow_success_rate * 100).toFixed(1)}%
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <Box>
                                            <Typography color="textSecondary">실패한 작업</Typography>
                                            <Typography variant="h4">
                                                {state.metrics.failed_tasks}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <Box>
                                            <Typography color="textSecondary">평균 처리 시간</Typography>
                                            <Typography variant="h4">
                                                {state.metrics.average_processing_time.toFixed(0)}ms
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <Box>
                                            <Typography color="textSecondary">시스템 상태</Typography>
                                            <Typography variant="h4">
                                                <Chip
                                                    label={state.metrics.system_health}
                                                    color={getHealthColor(state.metrics.system_health) as any}
                                                />
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* 작업 상세 다이얼로그 */}
            <Dialog open={state.showTaskDetails} onClose={() => setState(prev => ({ ...prev, showTaskDetails: false }))} maxWidth="md" fullWidth>
                <DialogTitle>
                    작업 상세 정보
                </DialogTitle>
                <DialogContent>
                    {state.selectedTask && (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                {state.selectedTask.type} 작업
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                상태: {state.selectedTask.status}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                우선순위: {state.selectedTask.priority}
                            </Typography>
                            {state.selectedTask.output && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="h6" gutterBottom>
                                        결과:
                                    </Typography>
                                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                        <pre style={{ whiteSpace: 'pre-wrap' }}>
                                            {JSON.stringify(state.selectedTask.output, null, 2)}
                                        </pre>
                                    </Paper>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setState(prev => ({ ...prev, showTaskDetails: false }))}>
                        닫기
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 워크플로우 상세 다이얼로그 */}
            <Dialog open={state.showWorkflowDetails} onClose={() => setState(prev => ({ ...prev, showWorkflowDetails: false }))} maxWidth="lg" fullWidth>
                <DialogTitle>
                    워크플로우 상세 정보
                </DialogTitle>
                <DialogContent>
                    {state.selectedWorkflow && (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                {state.selectedWorkflow.name}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                {state.selectedWorkflow.description}
                            </Typography>
                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                워크플로우 단계:
                            </Typography>
                            <List>
                                {state.selectedWorkflow.steps.map((step, index) => (
                                    <ListItem key={step.id}>
                                        <ListItemIcon>
                                            {getTypeIcon(step.type)}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={`${index + 1}. ${step.type}`}
                                            secondary={`상태: ${step.status} | 우선순위: ${step.priority}`}
                                        />
                                        <Chip
                                            label={step.status}
                                            color={getStatusColor(step.status) as any}
                                            size="small"
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setState(prev => ({ ...prev, showWorkflowDetails: false }))}>
                        닫기
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 생성 다이얼로그 */}
            <Dialog open={state.showCreateDialog} onClose={() => setState(prev => ({ ...prev, showCreateDialog: false }))} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {state.createDialogType === 'task' ? '새 작업 생성' : '새 워크플로우 생성'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        {state.createDialogType === 'workflow' && (
                            <>
                                <TextField
                                    label="워크플로우 이름"
                                    value={createForm.name}
                                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                                    fullWidth
                                />
                                <TextField
                                    label="설명"
                                    value={createForm.description}
                                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                                    fullWidth
                                    multiline
                                    rows={2}
                                />
                            </>
                        )}
                        <FormControl fullWidth>
                            <InputLabel>작업 타입</InputLabel>
                            <Select
                                value={createForm.type}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, type: e.target.value as AIOrchestrationTask['type'] }))}
                            >
                                <MenuItem value="analysis">분석</MenuItem>
                                <MenuItem value="optimization">최적화</MenuItem>
                                <MenuItem value="learning">학습</MenuItem>
                                <MenuItem value="prediction">예측</MenuItem>
                                <MenuItem value="synthesis">종합</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>우선순위</InputLabel>
                            <Select
                                value={createForm.priority}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, priority: e.target.value as AIOrchestrationTask['priority'] }))}
                            >
                                <MenuItem value="low">낮음</MenuItem>
                                <MenuItem value="medium">보통</MenuItem>
                                <MenuItem value="high">높음</MenuItem>
                                <MenuItem value="critical">긴급</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="입력 데이터"
                            value={createForm.input}
                            onChange={(e) => setCreateForm(prev => ({ ...prev, input: e.target.value }))}
                            fullWidth
                            multiline
                            rows={3}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setState(prev => ({ ...prev, showCreateDialog: false }))}>
                        취소
                    </Button>
                    <Button
                        onClick={state.createDialogType === 'task' ? handleCreateTask : handleCreateWorkflow}
                        variant="contained"
                    >
                        생성
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UltraAdvancedAIOrchestrationDashboard;
