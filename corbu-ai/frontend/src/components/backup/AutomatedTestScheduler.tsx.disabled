import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Button,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
    IconButton,
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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Alert,
    LinearProgress,
    Tooltip,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    Schedule,
    PlayArrow,
    Stop,
    Pause,
    Edit,
    Delete,
    Add,
    ExpandMore,
    CheckCircle,
    Warning,
    Error,
    Info,
    Timer,
    CalendarToday,
    Repeat,
    Notifications,
    Settings,
    Visibility,
    Refresh
} from '@mui/icons-material';

interface TestSchedule {
    id: string;
    name: string;
    description: string;
    testSuiteId: string;
    testSuiteName: string;
    cronExpression: string;
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom';
    isActive: boolean;
    lastRun?: Date;
    nextRun: Date;
    priority: 'low' | 'medium' | 'high' | 'critical';
    notifications: boolean;
    retryOnFailure: boolean;
    maxRetries: number;
    timeout: number; // minutes
    environment: 'development' | 'staging' | 'production';
    tags: string[];
}

interface ScheduleExecution {
    id: string;
    scheduleId: string;
    startTime: Date;
    endTime?: Date;
    status: 'scheduled' | 'running' | 'completed' | 'failed' | 'cancelled';
    progress: number;
    result?: {
        totalTests: number;
        passedTests: number;
        failedTests: number;
        executionTime: number;
        qualityScore: number;
    };
}

const AutomatedTestScheduler: React.FC = () => {
    const [schedules, setSchedules] = useState<TestSchedule[]>([]);
    const [executions, setExecutions] = useState<ScheduleExecution[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<TestSchedule | null>(null);
    const [selectedSchedule, setSelectedSchedule] = useState<TestSchedule | null>(null);

    // 모의 스케줄 데이터
    useEffect(() => {
        const mockSchedules: TestSchedule[] = [
            {
                id: 'schedule-1',
                name: '일일 기능 테스트',
                description: '매일 새벽 2시에 실행되는 기능 테스트',
                testSuiteId: 'functional-test-suite',
                testSuiteName: 'AI 기능 테스트 스위트',
                cronExpression: '0 2 * * *',
                frequency: 'daily',
                isActive: true,
                lastRun: new Date(Date.now() - 86400000), // 1일 전
                nextRun: new Date(Date.now() + 3600000), // 1시간 후
                priority: 'high',
                notifications: true,
                retryOnFailure: true,
                maxRetries: 3,
                timeout: 30,
                environment: 'production',
                tags: ['functional', 'daily', 'production']
            },
            {
                id: 'schedule-2',
                name: '성능 테스트 (주간)',
                description: '매주 일요일 새벽 3시에 실행되는 성능 테스트',
                testSuiteId: 'performance-test-suite',
                testSuiteName: 'AI 성능 테스트 스위트',
                cronExpression: '0 3 * * 0',
                frequency: 'weekly',
                isActive: true,
                lastRun: new Date(Date.now() - 7 * 86400000), // 7일 전
                nextRun: new Date(Date.now() + 6 * 86400000), // 6일 후
                priority: 'medium',
                notifications: true,
                retryOnFailure: false,
                maxRetries: 1,
                timeout: 60,
                environment: 'staging',
                tags: ['performance', 'weekly', 'staging']
            },
            {
                id: 'schedule-3',
                name: '보안 테스트 (월간)',
                description: '매월 1일 새벽 4시에 실행되는 보안 테스트',
                testSuiteId: 'security-test-suite',
                testSuiteName: 'AI 보안 테스트 스위트',
                cronExpression: '0 4 1 * *',
                frequency: 'monthly',
                isActive: false,
                lastRun: new Date(Date.now() - 30 * 86400000), // 30일 전
                nextRun: new Date(Date.now() + 25 * 86400000), // 25일 후
                priority: 'critical',
                notifications: true,
                retryOnFailure: true,
                maxRetries: 2,
                timeout: 45,
                environment: 'production',
                tags: ['security', 'monthly', 'production']
            }
        ];

        const mockExecutions: ScheduleExecution[] = [
            {
                id: 'exec-1',
                scheduleId: 'schedule-1',
                startTime: new Date(Date.now() - 86400000),
                endTime: new Date(Date.now() - 86350000),
                status: 'completed',
                progress: 100,
                result: {
                    totalTests: 15,
                    passedTests: 14,
                    failedTests: 1,
                    executionTime: 25,
                    qualityScore: 0.93
                }
            },
            {
                id: 'exec-2',
                scheduleId: 'schedule-2',
                startTime: new Date(Date.now() - 7 * 86400000),
                endTime: new Date(Date.now() - 7 * 86400000 + 3500000),
                status: 'completed',
                progress: 100,
                result: {
                    totalTests: 8,
                    passedTests: 8,
                    failedTests: 0,
                    executionTime: 35,
                    qualityScore: 1.0
                }
            },
            {
                id: 'exec-3',
                scheduleId: 'schedule-1',
                startTime: new Date(Date.now() - 2 * 86400000),
                status: 'running',
                progress: 65
            }
        ];

        setSchedules(mockSchedules);
        setExecutions(mockExecutions);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'success';
            case 'running': return 'info';
            case 'failed': return 'error';
            case 'cancelled': return 'default';
            case 'scheduled': return 'warning';
            default: return 'default';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'error';
            case 'high': return 'warning';
            case 'medium': return 'info';
            case 'low': return 'success';
            default: return 'default';
        }
    };

    const getFrequencyLabel = (frequency: string) => {
        switch (frequency) {
            case 'hourly': return '매시간';
            case 'daily': return '매일';
            case 'weekly': return '매주';
            case 'monthly': return '매월';
            case 'custom': return '사용자 정의';
            default: return frequency;
        }
    };

    const handleCreateSchedule = () => {
        setEditingSchedule(null);
        setDialogOpen(true);
    };

    const handleEditSchedule = (schedule: TestSchedule) => {
        setEditingSchedule(schedule);
        setDialogOpen(true);
    };

    const handleToggleSchedule = (scheduleId: string) => {
        setSchedules(prev =>
            prev.map(s =>
                s.id === scheduleId
                    ? { ...s, isActive: !s.isActive }
                    : s
            )
        );
    };

    const handleDeleteSchedule = (scheduleId: string) => {
        setSchedules(prev => prev.filter(s => s.id !== scheduleId));
    };

    const handleRunNow = (scheduleId: string) => {
        // 실제로는 즉시 실행 API 호출
        const newExecution: ScheduleExecution = {
            id: `exec-${Date.now()}`,
            scheduleId,
            startTime: new Date(),
            status: 'running',
            progress: 0
        };
        setExecutions(prev => [newExecution, ...prev]);
    };

    const getScheduleExecutions = (scheduleId: string) => {
        return executions.filter(e => e.scheduleId === scheduleId);
    };

    return (
        <Grid container spacing={3}>
            {/* 헤더 */}
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box display="flex" alignItems="center">
                                <Schedule color="primary" sx={{ mr: 1, fontSize: 32 }} />
                                <Typography variant="h5">자동화된 테스트 스케줄러</Typography>
                            </Box>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={handleCreateSchedule}
                            >
                                새 스케줄 생성
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* 활성 스케줄 요약 */}
            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>스케줄 요약</Typography>
                        <Box display="flex" justifyContent="space-between" mb={2}>
                            <Typography variant="body2">총 스케줄</Typography>
                            <Typography variant="h6" color="primary">
                                {schedules.length}
                            </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" mb={2}>
                            <Typography variant="body2">활성 스케줄</Typography>
                            <Typography variant="h6" color="success.main">
                                {schedules.filter(s => s.isActive).length}
                            </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" mb={2}>
                            <Typography variant="body2">오늘 실행 예정</Typography>
                            <Typography variant="h6" color="warning.main">
                                {schedules.filter(s => {
                                    const today = new Date();
                                    const nextRun = new Date(s.nextRun);
                                    return nextRun.toDateString() === today.toDateString();
                                }).length}
                            </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2">실행 중</Typography>
                            <Typography variant="h6" color="info.main">
                                {executions.filter(e => e.status === 'running').length}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* 다음 실행 스케줄 */}
            <Grid item xs={12} md={8}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>다음 실행 예정</Typography>
                        <List>
                            {schedules
                                .filter(s => s.isActive)
                                .sort((a, b) => new Date(a.nextRun).getTime() - new Date(b.nextRun).getTime())
                                .slice(0, 3)
                                .map((schedule) => (
                                    <ListItem key={schedule.id} divider>
                                        <ListItemIcon>
                                            <Timer color="primary" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={schedule.name}
                                            secondary={`${schedule.testSuiteName} • ${schedule.nextRun.toLocaleString()}`}
                                        />
                                        <ListItemSecondaryAction>
                                            <Box display="flex" gap={1}>
                                                <Chip
                                                    label={getFrequencyLabel(schedule.frequency)}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                                <Chip
                                                    label={schedule.priority}
                                                    size="small"
                                                    color={getPriorityColor(schedule.priority) as any}
                                                />
                                            </Box>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                        </List>
                    </CardContent>
                </Card>
            </Grid>

            {/* 스케줄 목록 */}
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>테스트 스케줄 관리</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>스케줄명</TableCell>
                                        <TableCell>테스트 스위트</TableCell>
                                        <TableCell>빈도</TableCell>
                                        <TableCell>다음 실행</TableCell>
                                        <TableCell>상태</TableCell>
                                        <TableCell>우선순위</TableCell>
                                        <TableCell>작업</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {schedules.map((schedule) => (
                                        <TableRow key={schedule.id}>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {schedule.name}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {schedule.description}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{schedule.testSuiteName}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={getFrequencyLabel(schedule.frequency)}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {schedule.nextRun.toLocaleString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Switch
                                                        checked={schedule.isActive}
                                                        onChange={() => handleToggleSchedule(schedule.id)}
                                                        size="small"
                                                    />
                                                    <Chip
                                                        label={schedule.isActive ? '활성' : '비활성'}
                                                        size="small"
                                                        color={schedule.isActive ? 'success' : 'default'}
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={schedule.priority}
                                                    size="small"
                                                    color={getPriorityColor(schedule.priority) as any}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" gap={1}>
                                                    <Tooltip title="즉시 실행">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleRunNow(schedule.id)}
                                                            color="primary"
                                                        >
                                                            <PlayArrow />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="편집">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleEditSchedule(schedule)}
                                                        >
                                                            <Edit />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="삭제">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDeleteSchedule(schedule.id)}
                                                            color="error"
                                                        >
                                                            <Delete />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Grid>

            {/* 실행 히스토리 */}
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>실행 히스토리</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>스케줄</TableCell>
                                        <TableCell>시작 시간</TableCell>
                                        <TableCell>상태</TableCell>
                                        <TableCell>진행률</TableCell>
                                        <TableCell>결과</TableCell>
                                        <TableCell>실행 시간</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {executions.slice(0, 10).map((execution) => {
                                        const schedule = schedules.find(s => s.id === execution.scheduleId);
                                        return (
                                            <TableRow key={execution.id}>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {schedule?.name || '알 수 없음'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {execution.startTime.toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={execution.status}
                                                        size="small"
                                                        color={getStatusColor(execution.status) as any}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={execution.progress}
                                                            sx={{ width: 60, height: 6 }}
                                                        />
                                                        <Typography variant="caption">
                                                            {execution.progress}%
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    {execution.result ? (
                                                        <Box>
                                                            <Typography variant="caption">
                                                                {execution.result.passedTests}/{execution.result.totalTests} 통과
                                                            </Typography>
                                                            <Typography variant="caption" display="block" color="textSecondary">
                                                                품질: {(execution.result.qualityScore * 100).toFixed(0)}%
                                                            </Typography>
                                                        </Box>
                                                    ) : (
                                                        <Typography variant="caption" color="textSecondary">
                                                            진행 중
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {execution.endTime ? (
                                                        <Typography variant="body2">
                                                            {Math.round((execution.endTime.getTime() - execution.startTime.getTime()) / 1000 / 60)}분
                                                        </Typography>
                                                    ) : (
                                                        <Typography variant="body2" color="textSecondary">
                                                            -
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Grid>

            {/* 스케줄 생성/편집 다이얼로그 */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingSchedule ? '스케줄 편집' : '새 스케줄 생성'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="스케줄명"
                                defaultValue={editingSchedule?.name || ''}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="설명"
                                multiline
                                rows={2}
                                defaultValue={editingSchedule?.description || ''}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>테스트 스위트</InputLabel>
                                <Select defaultValue={editingSchedule?.testSuiteId || ''}>
                                    <MenuItem value="functional-test-suite">AI 기능 테스트 스위트</MenuItem>
                                    <MenuItem value="performance-test-suite">AI 성능 테스트 스위트</MenuItem>
                                    <MenuItem value="security-test-suite">AI 보안 테스트 스위트</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>실행 빈도</InputLabel>
                                <Select defaultValue={editingSchedule?.frequency || 'daily'}>
                                    <MenuItem value="hourly">매시간</MenuItem>
                                    <MenuItem value="daily">매일</MenuItem>
                                    <MenuItem value="weekly">매주</MenuItem>
                                    <MenuItem value="monthly">매월</MenuItem>
                                    <MenuItem value="custom">사용자 정의</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>우선순위</InputLabel>
                                <Select defaultValue={editingSchedule?.priority || 'medium'}>
                                    <MenuItem value="low">낮음</MenuItem>
                                    <MenuItem value="medium">보통</MenuItem>
                                    <MenuItem value="high">높음</MenuItem>
                                    <MenuItem value="critical">긴급</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>환경</InputLabel>
                                <Select defaultValue={editingSchedule?.environment || 'staging'}>
                                    <MenuItem value="development">개발</MenuItem>
                                    <MenuItem value="staging">스테이징</MenuItem>
                                    <MenuItem value="production">운영</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={<Switch defaultChecked={editingSchedule?.notifications || true} />}
                                label="실행 완료 알림"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={<Switch defaultChecked={editingSchedule?.retryOnFailure || false} />}
                                label="실패 시 재시도"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>취소</Button>
                    <Button variant="contained" onClick={() => setDialogOpen(false)}>
                        {editingSchedule ? '수정' : '생성'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
};

export default AutomatedTestScheduler;
