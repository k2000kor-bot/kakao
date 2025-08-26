import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, ListItemIcon, IconButton, Tooltip, LinearProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Switch, FormControlLabel, Accordion, AccordionSummary, AccordionDetails, Badge, Alert, TextField, InputAdornment, Tabs, Tab, Divider, CircularProgress, Slider, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Science as ScienceIcon, Task as TaskIcon, Assessment, Performance, CheckCircle, Error, Warning, PlayArrow, Refresh, Add, Settings, Timeline, Speed, Security, Accessibility, CriticalPriority, PriorityHigh, PriorityMedium, PriorityLow, Code as CodeIcon, Workflow as WorkflowIcon, BugReport, VerifiedUser, Info } from '@mui/icons-material';
import { qualityAssuranceAPI } from '../services/apiService';

interface QualityAssuranceDashboardState {
    tests: any[];
    metrics: any;
    reports: any[];
    loading: boolean;
    error: string | null;
    selectedTab: number;
    createTestDialog: boolean;
    newTest: any;
}

const UltraAdvancedAIQualityAssuranceDashboard: React.FC = () => {
    const [state, setState] = useState<QualityAssuranceDashboardState>({
        tests: [],
        metrics: {},
        reports: [],
        loading: false,
        error: null,
        selectedTab: 0,
        createTestDialog: false,
        newTest: { name: '', type: 'unit', category: 'functionality', priority: 'medium' }
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const [tests, metrics, reports] = await Promise.all([
                qualityAssuranceAPI.getQualityTests(),
                qualityAssuranceAPI.getQualityMetrics(),
                qualityAssuranceAPI.getQualityReports()
            ]);

            setState(prev => ({
                ...prev,
                tests: tests,
                metrics: metrics,
                reports: reports,
                loading: false
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: '데이터를 불러오는 중 오류가 발생했습니다.',
                loading: false
            }));
        }
    };

    const handleCreateTest = async () => {
        try {
            const newTest = await qualityAssuranceAPI.createQualityTest(state.newTest);
            if (newTest) {
                setState(prev => ({
                    ...prev,
                    tests: [...prev.tests, newTest],
                    createTestDialog: false,
                    newTest: { name: '', type: 'unit', category: 'functionality', priority: 'medium' }
                }));
            }
        } catch (error) {
            setState(prev => ({ ...prev, error: '품질 테스트 생성 중 오류가 발생했습니다.' }));
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'passed':
            case 'completed':
                return 'success';
            case 'running':
                return 'warning';
            case 'failed':
                return 'error';
            default:
                return 'default';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'error';
            case 'medium':
                return 'warning';
            case 'low':
                return 'success';
            default:
                return 'default';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'unit':
                return <CodeIcon />;
            case 'integration':
                return <WorkflowIcon />;
            case 'performance':
                return <Performance />;
            case 'security':
                return <Security />;
            case 'accessibility':
                return <Accessibility />;
            default:
                return <TaskIcon />;
        }
    };

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ScienceIcon color="primary" />
                고도화된 AI 품질 보증 대시보드
            </Typography>

            {state.error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setState(prev => ({ ...prev, error: null }))}>
                    {state.error}
                </Alert>
            )}

            {/* 제어 패널 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">제어 패널</Typography>
                        <Box>
                            <Button
                                variant="contained"
                                startIcon={<Refresh />}
                                onClick={loadData}
                                disabled={state.loading}
                                sx={{ mr: 1 }}
                            >
                                새로고침
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Add />}
                                onClick={() => setState(prev => ({ ...prev, createTestDialog: true }))}
                            >
                                품질 테스트 생성
                            </Button>
                        </Box>
                    </Box>

                    {state.loading && <LinearProgress sx={{ mb: 2 }} />}

                    {/* 시스템 상태 */}
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
                                <CardContent>
                                    <Typography variant="h6">{state.metrics.total_tests || 0}</Typography>
                                    <Typography variant="body2">전체 테스트</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
                                <CardContent>
                                    <Typography variant="h6">{state.metrics.passed_tests || 0}</Typography>
                                    <Typography variant="body2">통과한 테스트</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ bgcolor: 'error.light', color: 'white' }}>
                                <CardContent>
                                    <Typography variant="h6">{state.metrics.failed_tests || 0}</Typography>
                                    <Typography variant="body2">실패한 테스트</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
                                <CardContent>
                                    <Typography variant="h6">{state.metrics.running_tests || 0}</Typography>
                                    <Typography variant="body2">실행 중인 테스트</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* 탭 네비게이션 */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={state.selectedTab} onChange={(_, newValue) => setState(prev => ({ ...prev, selectedTab: newValue }))}>
                    <Tab label="테스트 관리" />
                    <Tab label="품질 메트릭" />
                    <Tab label="보고서" />
                    <Tab label="성능 모니터링" />
                </Tabs>
            </Box>

            {/* 테스트 관리 탭 */}
            {state.selectedTab === 0 && (
                <Box>
                    <Typography variant="h6" gutterBottom>품질 테스트 관리</Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>테스트명</TableCell>
                                    <TableCell>유형</TableCell>
                                    <TableCell>카테고리</TableCell>
                                    <TableCell>우선순위</TableCell>
                                    <TableCell>상태</TableCell>
                                    <TableCell>생성일</TableCell>
                                    <TableCell>작업</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {state.tests.map((test) => (
                                    <TableRow key={test.id}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                {getTypeIcon(test.type)}
                                                <Typography variant="body2" sx={{ ml: 1 }}>
                                                    {test.name}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={test.type} size="small" />
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={test.category} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={test.priority}
                                                color={getPriorityColor(test.priority) as any}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={test.status}
                                                color={getStatusColor(test.status) as any}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {new Date(test.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton size="small">
                                                <PlayArrow />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* 품질 메트릭 탭 */}
            {state.selectedTab === 1 && (
                <Box>
                    <Typography variant="h6" gutterBottom>품질 메트릭</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>테스트 커버리지</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ width: '100%', mr: 1 }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={(state.metrics.test_coverage || 0) * 100}
                                                sx={{ height: 10, borderRadius: 5 }}
                                            />
                                        </Box>
                                        <Box sx={{ minWidth: 35 }}>
                                            <Typography variant="body2" color="textSecondary">
                                                {Math.round((state.metrics.test_coverage || 0) * 100)}%
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>코드 품질 점수</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ width: '100%', mr: 1 }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={(state.metrics.code_quality_score || 0) * 100}
                                                sx={{ height: 10, borderRadius: 5 }}
                                            />
                                        </Box>
                                        <Box sx={{ minWidth: 35 }}>
                                            <Typography variant="body2" color="textSecondary">
                                                {Math.round((state.metrics.code_quality_score || 0) * 100)}%
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>성능 점수</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ width: '100%', mr: 1 }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={(state.metrics.performance_score || 0) * 100}
                                                sx={{ height: 10, borderRadius: 5 }}
                                            />
                                        </Box>
                                        <Box sx={{ minWidth: 35 }}>
                                            <Typography variant="body2" color="textSecondary">
                                                {Math.round((state.metrics.performance_score || 0) * 100)}%
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>보안 점수</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ width: '100%', mr: 1 }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={(state.metrics.security_score || 0) * 100}
                                                sx={{ height: 10, borderRadius: 5 }}
                                            />
                                        </Box>
                                        <Box sx={{ minWidth: 35 }}>
                                            <Typography variant="body2" color="textSecondary">
                                                {Math.round((state.metrics.security_score || 0) * 100)}%
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {/* 보고서 탭 */}
            {state.selectedTab === 2 && (
                <Box>
                    <Typography variant="h6" gutterBottom>품질 보고서</Typography>
                    <Grid container spacing={2}>
                        {state.reports.map((report) => (
                            <Grid item xs={12} md={6} key={report.id}>
                                <Card>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Assessment color="primary" />
                                            <Typography variant="h6" sx={{ ml: 1 }}>
                                                {report.title}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" gutterBottom>
                                            {report.summary}
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Chip
                                                label={report.status}
                                                color={getStatusColor(report.status) as any}
                                                size="small"
                                            />
                                            <Typography variant="caption">
                                                {new Date(report.created_at).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                        {report.metrics && (
                                            <Box>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    메트릭:
                                                </Typography>
                                                <Grid container spacing={1}>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption">
                                                            테스트 커버리지: {Math.round((report.metrics.test_coverage || 0) * 100)}%
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption">
                                                            코드 품질: {Math.round((report.metrics.code_quality || 0) * 100)}%
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption">
                                                            성능: {Math.round((report.metrics.performance || 0) * 100)}%
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption">
                                                            보안: {Math.round((report.metrics.security || 0) * 100)}%
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        )}
                                        {report.recommendations && (
                                            <Box sx={{ mt: 2 }}>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    권장사항:
                                                </Typography>
                                                <List dense>
                                                    {report.recommendations.map((rec: string, index: number) => (
                                                        <ListItem key={index} sx={{ py: 0 }}>
                                                            <ListItemIcon sx={{ minWidth: 30 }}>
                                                                <CheckCircle fontSize="small" color="success" />
                                                            </ListItemIcon>
                                                            <ListItemText primary={rec} />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* 성능 모니터링 탭 */}
            {state.selectedTab === 3 && (
                <Box>
                    <Typography variant="h6" gutterBottom>성능 모니터링</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>테스트 실행 통계</Typography>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" gutterBottom>
                                            총 테스트: {state.metrics.total_tests || 0}
                                        </Typography>
                                        <Typography variant="body2" gutterBottom>
                                            통과율: {state.metrics.total_tests ? Math.round(((state.metrics.passed_tests || 0) / state.metrics.total_tests) * 100) : 0}%
                                        </Typography>
                                        <Typography variant="body2" gutterBottom>
                                            실패율: {state.metrics.total_tests ? Math.round(((state.metrics.failed_tests || 0) / state.metrics.total_tests) * 100) : 0}%
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>품질 지표</Typography>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" gutterBottom>
                                            테스트 커버리지: {Math.round((state.metrics.test_coverage || 0) * 100)}%
                                        </Typography>
                                        <Typography variant="body2" gutterBottom>
                                            코드 품질: {Math.round((state.metrics.code_quality_score || 0) * 100)}%
                                        </Typography>
                                        <Typography variant="body2" gutterBottom>
                                            성능 점수: {Math.round((state.metrics.performance_score || 0) * 100)}%
                                        </Typography>
                                        <Typography variant="body2" gutterBottom>
                                            보안 점수: {Math.round((state.metrics.security_score || 0) * 100)}%
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {/* 품질 테스트 생성 다이얼로그 */}
            <Dialog open={state.createTestDialog} onClose={() => setState(prev => ({ ...prev, createTestDialog: false }))} maxWidth="sm" fullWidth>
                <DialogTitle>새 품질 테스트 생성</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="테스트 이름"
                        value={state.newTest.name}
                        onChange={(e) => setState(prev => ({ ...prev, newTest: { ...prev.newTest, name: e.target.value } }))}
                        sx={{ mb: 2, mt: 1 }}
                    />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>테스트 유형</InputLabel>
                        <Select
                            value={state.newTest.type}
                            onChange={(e) => setState(prev => ({ ...prev, newTest: { ...prev.newTest, type: e.target.value } }))}
                        >
                            <MenuItem value="unit">단위 테스트</MenuItem>
                            <MenuItem value="integration">통합 테스트</MenuItem>
                            <MenuItem value="performance">성능 테스트</MenuItem>
                            <MenuItem value="security">보안 테스트</MenuItem>
                            <MenuItem value="accessibility">접근성 테스트</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>카테고리</InputLabel>
                        <Select
                            value={state.newTest.category}
                            onChange={(e) => setState(prev => ({ ...prev, newTest: { ...prev.newTest, category: e.target.value } }))}
                        >
                            <MenuItem value="functionality">기능성</MenuItem>
                            <MenuItem value="performance">성능</MenuItem>
                            <MenuItem value="security">보안</MenuItem>
                            <MenuItem value="usability">사용성</MenuItem>
                            <MenuItem value="compatibility">호환성</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>우선순위</InputLabel>
                        <Select
                            value={state.newTest.priority}
                            onChange={(e) => setState(prev => ({ ...prev, newTest: { ...prev.newTest, priority: e.target.value } }))}
                        >
                            <MenuItem value="low">낮음</MenuItem>
                            <MenuItem value="medium">보통</MenuItem>
                            <MenuItem value="high">높음</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setState(prev => ({ ...prev, createTestDialog: false }))}>취소</Button>
                    <Button onClick={handleCreateTest} variant="contained">생성</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UltraAdvancedAIQualityAssuranceDashboard;
