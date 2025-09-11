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
    Badge
} from '@mui/material';
import {
    PlayArrow,
    Pause,
    Stop,
    Refresh,
    Fullscreen,
    FullscreenExit,
    Settings,
    Timeline,
    Work,
    CheckCircle,
    Error,
    Schedule,
    Assessment,
    Build,
    Visibility,
    ExpandMore,
    Add,
    Delete,
    Edit
} from '@mui/icons-material';

interface WorkflowMetrics {
    total_workflows: number;
    active_workflows: number;
    completed_workflows: number;
    failed_workflows: number;
    total_tasks: number;
    pending_tasks: number;
    running_tasks: number;
    completed_tasks: number;
    failed_tasks: number;
    average_workflow_duration: number;
    success_rate: number;
    worker_utilization: number;
    queue_size: number;
}

interface WorkflowTask {
    id: string;
    name: string;
    type: string;
    status: string;
    priority: string;
    progress: number;
    created_at: Date;
    started_at?: Date;
    completed_at?: Date;
    duration?: number;
    assigned_worker?: string;
}

interface Workflow {
    id: string;
    name: string;
    status: string;
    tasks: WorkflowTask[];
    success_rate: number;
    total_runs: number;
    successful_runs: number;
    failed_runs: number;
    average_duration: number;
    created_at: Date;
    next_run?: Date;
    enabled: boolean;
}

interface WorkflowWorker {
    id: string;
    name: string;
    type: string;
    status: string;
    current_task?: string;
    processed_tasks: number;
    success_rate: number;
    average_processing_time: number;
    current_load: number;
}

const AIAutomationWorkflowDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<WorkflowMetrics | null>(null);
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [workers, setWorkers] = useState<WorkflowWorker[]>([]);
    const [selectedTab, setSelectedTab] = useState(0);
    const [fullscreen, setFullscreen] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
    const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    // 탭 정의
    const tabs = [
        { label: '워크플로우 개요', icon: <Work /> },
        { label: '실행 중인 워크플로우', icon: <PlayArrow /> },
        { label: '워커 상태', icon: <Build /> },
        { label: '태스크 큐', icon: <Timeline /> },
        { label: '성능 통계', icon: <Assessment /> },
        { label: '설정', icon: <Settings /> }
    ];

    // 데이터 새로고침
    const refreshData = async () => {
        try {
            // 실제로는 API 호출
            const mockMetrics: WorkflowMetrics = {
                total_workflows: 8,
                active_workflows: 3,
                completed_workflows: 4,
                failed_workflows: 1,
                total_tasks: 24,
                pending_tasks: 5,
                running_tasks: 3,
                completed_tasks: 15,
                failed_tasks: 1,
                average_workflow_duration: 45000,
                success_rate: 87.5,
                worker_utilization: 65,
                queue_size: 8
            };

            const mockWorkflows: Workflow[] = [
                {
                    id: 'workflow-1',
                    name: '시스템 헬스 체크',
                    status: 'active',
                    tasks: [
                        {
                            id: 'task-1',
                            name: '시스템 상태 확인',
                            type: 'system_maintenance',
                            status: 'completed',
                            priority: 'medium',
                            progress: 100,
                            created_at: new Date(Date.now() - 300000),
                            started_at: new Date(Date.now() - 280000),
                            completed_at: new Date(Date.now() - 250000),
                            duration: 30000,
                            assigned_worker: 'worker-1'
                        },
                        {
                            id: 'task-2',
                            name: '보안 검사',
                            type: 'security_check',
                            status: 'running',
                            priority: 'high',
                            progress: 65,
                            created_at: new Date(Date.now() - 200000),
                            started_at: new Date(Date.now() - 180000),
                            assigned_worker: 'worker-2'
                        }
                    ],
                    success_rate: 95,
                    total_runs: 12,
                    successful_runs: 11,
                    failed_runs: 1,
                    average_duration: 45000,
                    created_at: new Date(Date.now() - 86400000),
                    enabled: true
                },
                {
                    id: 'workflow-2',
                    name: '캐시 최적화',
                    status: 'completed',
                    tasks: [
                        {
                            id: 'task-3',
                            name: '캐시 정리',
                            type: 'system_maintenance',
                            status: 'completed',
                            priority: 'low',
                            progress: 100,
                            created_at: new Date(Date.now() - 600000),
                            started_at: new Date(Date.now() - 580000),
                            completed_at: new Date(Date.now() - 550000),
                            duration: 30000,
                            assigned_worker: 'worker-3'
                        }
                    ],
                    success_rate: 100,
                    total_runs: 8,
                    successful_runs: 8,
                    failed_runs: 0,
                    average_duration: 25000,
                    created_at: new Date(Date.now() - 172800000),
                    enabled: true
                }
            ];

            const mockWorkers: WorkflowWorker[] = [
                {
                    id: 'worker-1',
                    name: 'AI 프로세서 #1',
                    type: 'ai_processor',
                    status: 'idle',
                    processed_tasks: 45,
                    success_rate: 98,
                    average_processing_time: 2500,
                    current_load: 0
                },
                {
                    id: 'worker-2',
                    name: '데이터 분석기 #1',
                    type: 'data_analyzer',
                    status: 'busy',
                    current_task: 'task-2',
                    processed_tasks: 32,
                    success_rate: 95,
                    average_processing_time: 1800,
                    current_load: 75
                },
                {
                    id: 'worker-3',
                    name: '시스템 모니터 #1',
                    type: 'system_monitor',
                    status: 'idle',
                    processed_tasks: 28,
                    success_rate: 100,
                    average_processing_time: 3000,
                    current_load: 0
                },
                {
                    id: 'worker-4',
                    name: '보안 스캐너 #1',
                    type: 'security_scanner',
                    status: 'busy',
                    current_task: 'task-4',
                    processed_tasks: 19,
                    success_rate: 92,
                    average_processing_time: 2200,
                    current_load: 60
                },
                {
                    id: 'worker-5',
                    name: '보고서 생성기 #1',
                    type: 'report_generator',
                    status: 'idle',
                    processed_tasks: 15,
                    success_rate: 100,
                    average_processing_time: 4000,
                    current_load: 0
                }
            ];

            setMetrics(mockMetrics);
            setWorkflows(mockWorkflows);
            setWorkers(mockWorkers);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('워크플로우 데이터 새로고침 오류:', error);
        }
    };

    // 자동 새로고침
    useEffect(() => {
        refreshData();
        
        if (autoRefresh) {
            const interval = setInterval(refreshData, 15000); // 15초마다
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    // 상태 색상
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'primary';
            case 'completed': return 'success';
            case 'failed': return 'error';
            case 'paused': return 'warning';
            case 'running': return 'info';
            case 'pending': return 'default';
            case 'idle': return 'success';
            case 'busy': return 'warning';
            case 'offline': return 'error';
            default: return 'default';
        }
    };

    // 우선순위 색상
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'error';
            case 'high': return 'warning';
            case 'medium': return 'info';
            case 'low': return 'success';
            default: return 'default';
        }
    };

    // 워커 타입 아이콘
    const getWorkerTypeIcon = (type: string) => {
        switch (type) {
            case 'ai_processor': return <Work />;
            case 'data_analyzer': return <Assessment />;
            case 'system_monitor': return <Timeline />;
            case 'security_scanner': return <Build />;
            case 'report_generator': return <Assessment />;
            default: return <Work />;
        }
    };

    const renderWorkflowOverview = () => (
        <Grid container spacing={3}>
            {/* 전체 워크플로우 */}
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Work color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">전체 워크플로우</Typography>
                        </Box>
                        <Typography variant="h4" color="primary">
                            {metrics?.total_workflows || 0}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            등록된 워크플로우
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            {/* 실행 중인 워크플로우 */}
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <PlayArrow color="info" sx={{ mr: 1 }} />
                            <Typography variant="h6">실행 중</Typography>
                        </Box>
                        <Typography variant="h4" color="info.main">
                            {metrics?.active_workflows || 0}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            현재 실행 중
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            {/* 성공률 */}
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <CheckCircle color="success" sx={{ mr: 1 }} />
                            <Typography variant="h6">성공률</Typography>
                        </Box>
                        <Typography variant="h4" color="success.main">
                            {metrics?.success_rate?.toFixed(1) || '0.0'}%
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            전체 실행 성공률
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            {/* 워커 활용률 */}
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Build color="warning" sx={{ mr: 1 }} />
                            <Typography variant="h6">워커 활용률</Typography>
                        </Box>
                        <Typography variant="h4" color="warning.main">
                            {metrics?.worker_utilization?.toFixed(0) || '0'}%
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            현재 워커 사용률
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            {/* 태스크 상태 */}
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>태스크 상태</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Box textAlign="center">
                                    <Typography variant="h4" color="success.main">
                                        {metrics?.completed_tasks || 0}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        완료됨
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Box textAlign="center">
                                    <Typography variant="h4" color="info.main">
                                        {metrics?.running_tasks || 0}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        실행 중
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Box textAlign="center">
                                    <Typography variant="h4" color="warning.main">
                                        {metrics?.pending_tasks || 0}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        대기 중
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Box textAlign="center">
                                    <Typography variant="h4" color="error">
                                        {metrics?.failed_tasks || 0}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        실패
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>

            {/* 큐 상태 */}
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>큐 상태</Typography>
                        <Box textAlign="center">
                            <Typography variant="h3" color="primary">
                                {metrics?.queue_size || 0}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                대기 중인 태스크
                            </Typography>
                        </Box>
                        <LinearProgress 
                            variant="determinate" 
                            value={Math.min(100, (metrics?.queue_size || 0) * 10)} 
                            sx={{ mt: 2 }}
                        />
                    </CardContent>
                </Card>
            </Grid>

            {/* 최근 워크플로우 */}
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">최근 워크플로우</Typography>
                            <Button 
                                variant="outlined" 
                                size="small" 
                                startIcon={<Add />}
                            >
                                새 워크플로우
                            </Button>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>이름</TableCell>
                                        <TableCell>상태</TableCell>
                                        <TableCell>성공률</TableCell>
                                        <TableCell>실행 횟수</TableCell>
                                        <TableCell>평균 시간</TableCell>
                                        <TableCell>작업</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {workflows.slice(0, 5).map((workflow) => (
                                        <TableRow key={workflow.id}>
                                            <TableCell>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {workflow.name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={workflow.status} 
                                                    size="small" 
                                                    color={getStatusColor(workflow.status) as any}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {workflow.success_rate}%
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {workflow.total_runs}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {(workflow.average_duration / 1000).toFixed(1)}s
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title="상세 보기">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => {
                                                            setSelectedWorkflow(workflow);
                                                            setWorkflowDialogOpen(true);
                                                        }}
                                                    >
                                                        <Visibility />
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
    );

    const renderActiveWorkflows = () => (
        <Card>
            <CardContent>
                <Typography variant="h6" mb={2}>실행 중인 워크플로우</Typography>
                {workflows.filter(w => w.status === 'active').map((workflow) => (
                    <Accordion key={workflow.id} sx={{ mb: 1 }}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Box display="flex" alignItems="center" width="100%">
                                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                    {workflow.name}
                                </Typography>
                                <Chip 
                                    label={workflow.status} 
                                    size="small" 
                                    color={getStatusColor(workflow.status) as any}
                                    sx={{ mr: 2 }}
                                />
                                <Typography variant="body2" color="textSecondary">
                                    {workflow.tasks.filter(t => t.status === 'running').length}개 실행 중
                                </Typography>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                {workflow.tasks.map((task) => (
                                    <Grid item xs={12} key={task.id}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Box>
                                                        <Typography variant="body1" fontWeight="medium">
                                                            {task.name}
                                                        </Typography>
                                                        <Typography variant="body2" color="textSecondary">
                                                            {task.type} • {task.assigned_worker}
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Chip 
                                                            label={task.status} 
                                                            size="small" 
                                                            color={getStatusColor(task.status) as any}
                                                        />
                                                        <Chip 
                                                            label={task.priority} 
                                                            size="small" 
                                                            color={getPriorityColor(task.priority) as any}
                                                        />
                                                    </Box>
                                                </Box>
                                                {task.status === 'running' && (
                                                    <Box mt={2}>
                                                        <Box display="flex" justifyContent="space-between" mb={1}>
                                                            <Typography variant="body2">진행률</Typography>
                                                            <Typography variant="body2">{task.progress}%</Typography>
                                                        </Box>
                                                        <LinearProgress 
                                                            variant="determinate" 
                                                            value={task.progress} 
                                                        />
                                                    </Box>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </CardContent>
        </Card>
    );

    const renderWorkerStatus = () => (
        <Grid container spacing={3}>
            {workers.map((worker) => (
                <Grid item xs={12} md={6} lg={4} key={worker.id}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                {getWorkerTypeIcon(worker.type)}
                                <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
                                    {worker.name}
                                </Typography>
                                <Chip 
                                    label={worker.status} 
                                    size="small" 
                                    color={getStatusColor(worker.status) as any}
                                />
                            </Box>
                            
                            <List dense>
                                <ListItem>
                                    <ListItemText 
                                        primary="처리된 태스크" 
                                        secondary={worker.processed_tasks}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText 
                                        primary="성공률" 
                                        secondary={`${worker.success_rate}%`}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText 
                                        primary="평균 처리 시간" 
                                        secondary={`${worker.average_processing_time}ms`}
                                    />
                                </ListItem>
                                {worker.current_task && (
                                    <ListItem>
                                        <ListItemText 
                                            primary="현재 작업" 
                                            secondary={worker.current_task}
                                        />
                                    </ListItem>
                                )}
                            </List>
                            
                            <Box mt={2}>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                    <Typography variant="body2">부하</Typography>
                                    <Typography variant="body2">{worker.current_load}%</Typography>
                                </Box>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={worker.current_load} 
                                    color={worker.current_load > 80 ? 'error' : worker.current_load > 60 ? 'warning' : 'primary'}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );

    const renderTaskQueue = () => (
        <Card>
            <CardContent>
                <Typography variant="h6" mb={2}>태스크 큐</Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>태스크</TableCell>
                                <TableCell>워크플로우</TableCell>
                                <TableCell>우선순위</TableCell>
                                <TableCell>상태</TableCell>
                                <TableCell>진행률</TableCell>
                                <TableCell>워커</TableCell>
                                <TableCell>작업</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {workflows.flatMap(workflow => 
                                workflow.tasks.map(task => (
                                    <TableRow key={task.id}>
                                        <TableCell>
                                            <Typography variant="body1" fontWeight="medium">
                                                {task.name}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {task.type}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {workflow.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={task.priority} 
                                                size="small" 
                                                color={getPriorityColor(task.priority) as any}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={task.status} 
                                                size="small" 
                                                color={getStatusColor(task.status) as any}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center">
                                                <Typography variant="body2" sx={{ mr: 1, minWidth: 30 }}>
                                                    {task.progress}%
                                                </Typography>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={task.progress} 
                                                    sx={{ width: 60, height: 6 }}
                                                />
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {task.assigned_worker || '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="상세 보기">
                                                <IconButton size="small">
                                                    <Visibility />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );

    const renderPerformanceStatistics = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>워크플로우 통계</Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon><Work /></ListItemIcon>
                                <ListItemText 
                                    primary="총 워크플로우" 
                                    secondary={metrics?.total_workflows || 0}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><PlayArrow /></ListItemIcon>
                                <ListItemText 
                                    primary="활성 워크플로우" 
                                    secondary={metrics?.active_workflows || 0}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><CheckCircle /></ListItemIcon>
                                <ListItemText 
                                    primary="완료된 워크플로우" 
                                    secondary={metrics?.completed_workflows || 0}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><Error /></ListItemIcon>
                                <ListItemText 
                                    primary="실패한 워크플로우" 
                                    secondary={metrics?.failed_workflows || 0}
                                />
                            </ListItem>
                        </List>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>성능 지표</Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon><Timeline /></ListItemIcon>
                                <ListItemText 
                                    primary="평균 실행 시간" 
                                    secondary={`${(metrics?.average_workflow_duration || 0) / 1000}s`}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><Assessment /></ListItemIcon>
                                <ListItemText 
                                    primary="성공률" 
                                    secondary={`${metrics?.success_rate?.toFixed(1) || '0.0'}%`}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><Build /></ListItemIcon>
                                <ListItemText 
                                    primary="워커 활용률" 
                                    secondary={`${metrics?.worker_utilization?.toFixed(0) || '0'}%`}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><Schedule /></ListItemIcon>
                                <ListItemText 
                                    primary="큐 크기" 
                                    secondary={metrics?.queue_size || 0}
                                />
                            </ListItem>
                        </List>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    const renderSettings = () => (
        <Card>
            <CardContent>
                <Typography variant="h6" mb={2}>워크플로우 설정</Typography>
                <List>
                    <ListItem>
                        <ListItemIcon><Refresh /></ListItemIcon>
                        <ListItemText 
                            primary="자동 새로고침" 
                            secondary="15초마다 데이터 자동 업데이트"
                        />
                        <Switch 
                            checked={autoRefresh} 
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><PlayArrow /></ListItemIcon>
                        <ListItemText 
                            primary="자동 실행" 
                            secondary="예약된 워크플로우 자동 실행"
                        />
                        <Switch defaultChecked />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><Error /></ListItemIcon>
                        <ListItemText 
                            primary="자동 재시도" 
                            secondary="실패한 태스크 자동 재시도"
                        />
                        <Switch defaultChecked />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><Build /></ListItemIcon>
                        <ListItemText 
                            primary="워커 자동 확장" 
                            secondary="부하에 따른 워커 자동 확장"
                        />
                        <Switch defaultChecked />
                    </ListItem>
                </List>
            </CardContent>
        </Card>
    );

    const renderContent = () => {
        switch (selectedTab) {
            case 0: return renderWorkflowOverview();
            case 1: return renderActiveWorkflows();
            case 2: return renderWorkerStatus();
            case 3: return renderTaskQueue();
            case 4: return renderPerformanceStatistics();
            case 5: return renderSettings();
            default: return renderWorkflowOverview();
        }
    };

    return (
        <Box sx={{ p: 3, height: '100vh', overflow: 'auto' }}>
            {/* 헤더 */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                    <Work sx={{ mr: 1, fontSize: 32 }} color="primary" />
                    <Typography variant="h4">AI 자동화 워크플로우 대시보드</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" color="textSecondary">
                        마지막 업데이트: {lastUpdate.toLocaleTimeString()}
                    </Typography>
                    <Tooltip title="전체화면">
                        <IconButton onClick={() => setFullscreen(!fullscreen)}>
                            {fullscreen ? <FullscreenExit /> : <Fullscreen />}
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* 탭 네비게이션 */}
            <Paper sx={{ mb: 3 }}>
                <Box display="flex" overflow="auto">
                    {tabs.map((tab, index) => (
                        <Button
                            key={index}
                            variant={selectedTab === index ? "contained" : "text"}
                            startIcon={tab.icon}
                            onClick={() => setSelectedTab(index)}
                            sx={{ 
                                minWidth: 'auto', 
                                px: 2, 
                                py: 1.5,
                                borderRadius: 0,
                                borderBottom: selectedTab === index ? 2 : 0,
                                borderColor: 'primary.main'
                            }}
                        >
                            {tab.label}
                        </Button>
                    ))}
                </Box>
            </Paper>

            {/* 메인 콘텐츠 */}
            {renderContent()}

            {/* 워크플로우 상세 다이얼로그 */}
            <Dialog 
                open={workflowDialogOpen} 
                onClose={() => setWorkflowDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center">
                        <Work />
                        <Typography variant="h6" sx={{ ml: 1 }}>
                            워크플로우 상세 정보
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedWorkflow && (
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="textSecondary">워크플로우 ID</Typography>
                                <Typography variant="body1">{selectedWorkflow.id}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="textSecondary">상태</Typography>
                                <Chip 
                                    label={selectedWorkflow.status} 
                                    size="small" 
                                    color={getStatusColor(selectedWorkflow.status) as any}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="textSecondary">성공률</Typography>
                                <Typography variant="body1">{selectedWorkflow.success_rate}%</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="textSecondary">총 실행 횟수</Typography>
                                <Typography variant="body1">{selectedWorkflow.total_runs}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">태스크 목록</Typography>
                                <List dense>
                                    {selectedWorkflow.tasks.map((task) => (
                                        <ListItem key={task.id}>
                                            <ListItemText 
                                                primary={task.name}
                                                secondary={`${task.type} • ${task.status} • ${task.progress}%`}
                                            />
                                            <Chip 
                                                label={task.priority} 
                                                size="small" 
                                                color={getPriorityColor(task.priority) as any}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setWorkflowDialogOpen(false)}>닫기</Button>
                    <Button variant="contained" color="primary">
                        편집
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AIAutomationWorkflowDashboard;
