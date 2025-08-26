import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    Chip,
    Button,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    LinearProgress,
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
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Alert,
    Badge,
    Tooltip,
    Switch,
    FormControlLabel
} from '@mui/material';
import {
    PlayArrow,
    Pause,
    Stop,
    Add,
    Edit,
    Delete,
    Visibility,
    TrendingUp,
    TrendingDown,
    Schedule,
    Assignment,
    School,
    Analytics,
    Settings,
    Notifications,
    Warning,
    CheckCircle,
    Error,
    Info,
    Group,
    VideoLibrary,
    Assessment,
    Psychology,
    AutoAwesome,
    Timeline,
    Path,
    Module,
    Progress,
    Optimization,
    Quality,
    Analytics as AnalyticsIcon,
    Settings as SettingsIcon,
    School as SchoolIcon,
    VideoLibrary as VideoLibraryIcon,
    Assessment as AssessmentIcon,
    Psychology as PsychologyIcon,
    AutoAwesome as AutoAwesomeIcon,
    Timeline as TimelineIcon,
    Path as PathIcon,
    Module as ModuleIcon,
    Progress as ProgressIcon,
    Optimization as OptimizationIcon,
    Quality as QualityIcon
} from '@mui/icons-material';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    AreaChart,
    Area
} from 'recharts';
import aiMultimodalLearningPathOptimizationSystem, {
    LearningPath,
    LearningAnalytics,
    LearningModule,
    AdaptiveContent,
    LearningProgress,
    PathOptimization,
    QualityMetrics,
    LearningRecommendation
} from '../services/aiMultimodalLearningPathOptimizationSystem';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`learning-path-tabpanel-${index}`}
            aria-labelledby={`learning-path-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const AIMultimodalLearningPathOptimizationDashboard: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
    const [analytics, setAnalytics] = useState<LearningAnalytics>({
        totalPaths: 0,
        activePaths: 0,
        averageProgress: 0,
        averageQuality: 0,
        optimizationRate: 0,
        completionRate: 0,
        satisfactionRate: 0,
        skillImprovement: 0,
        collaborationEffectiveness: 0,
        adaptiveContentUsage: 0
    });
    const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [isSystemRunning, setIsSystemRunning] = useState(false);

    useEffect(() => {
        const updateData = () => {
            setLearningPaths(aiMultimodalLearningPathOptimizationSystem.getLearningPaths());
            setAnalytics(aiMultimodalLearningPathOptimizationSystem.getAnalytics());
            setIsSystemRunning(aiMultimodalLearningPathOptimizationSystem.isSystemRunning());
        };

        updateData();
        const interval = setInterval(updateData, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'success';
            case 'completed': return 'info';
            case 'paused': return 'warning';
            case 'optimizing': return 'secondary';
            default: return 'default';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'individual': return 'primary';
            case 'team': return 'secondary';
            case 'project': return 'success';
            case 'skill': return 'warning';
            case 'career': return 'info';
            default: return 'default';
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner': return 'success';
            case 'intermediate': return 'warning';
            case 'advanced': return 'error';
            case 'expert': return 'secondary';
            default: return 'default';
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString('ko-KR');
    };

    const getPathTypeData = () => {
        const typeCounts = learningPaths.reduce((acc, path) => {
            acc[path.type] = (acc[path.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(typeCounts).map(([type, count]) => ({
            name: type,
            value: count
        }));
    };

    const getModuleTypeData = () => {
        const allModules = learningPaths.flatMap(path => path.modules);
        const typeCounts = allModules.reduce((acc, module) => {
            acc[module.type] = (acc[module.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(typeCounts).map(([type, count]) => ({
            name: type,
            value: count
        }));
    };

    const getQualityData = () => {
        return learningPaths.map(path => ({
            name: path.name,
            overallQuality: path.qualityMetrics.overallQuality * 100,
            contentQuality: path.qualityMetrics.contentQuality * 100,
            engagementQuality: path.qualityMetrics.engagementQuality * 100,
            learningEffectiveness: path.qualityMetrics.learningEffectiveness * 100,
            collaborationQuality: path.qualityMetrics.collaborationQuality * 100
        }));
    };

    const getProgressData = () => {
        return learningPaths.map(path => ({
            name: path.name,
            progress: path.progress.overallProgress * 100,
            completedModules: path.progress.completedModules,
            totalModules: path.progress.totalModules,
            timeSpent: path.progress.timeSpent
        }));
    };

    const getOptimizationData = () => {
        return learningPaths.map(path => ({
            name: path.name,
            optimizationRate: path.optimization.status === 'completed' ? 100 : 0,
            recommendations: path.recommendations.length,
            results: path.optimization.results.length
        }));
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

    return (
        <Box sx={{ p: 3 }}>
            {/* 헤더 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" gutterBottom>
                        🎯 AI 멀티모달 학습 경로 최적화
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                        개인별 최적 학습 경로 생성 및 실시간 최적화 시스템
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Chip
                        icon={isSystemRunning ? <CheckCircle /> : <Error />}
                        label={isSystemRunning ? '시스템 실행 중' : '시스템 중지됨'}
                        color={isSystemRunning ? 'success' : 'error'}
                    />
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setCreateDialogOpen(true)}
                    >
                        새 학습 경로
                    </Button>
                </Box>
            </Box>

            {/* 전체 지표 */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="textSecondary" gutterBottom>
                                        전체 경로
                                    </Typography>
                                    <Typography variant="h4">
                                        {analytics.totalPaths}
                                    </Typography>
                                </Box>
                                <PathIcon color="primary" sx={{ fontSize: 40 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="textSecondary" gutterBottom>
                                        평균 진행률
                                    </Typography>
                                    <Typography variant="h4">
                                        {(analytics.averageProgress * 100).toFixed(1)}%
                                    </Typography>
                                </Box>
                                <ProgressIcon color="success" sx={{ fontSize: 40 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="textSecondary" gutterBottom>
                                        평균 품질
                                    </Typography>
                                    <Typography variant="h4">
                                        {(analytics.averageQuality * 100).toFixed(1)}%
                                    </Typography>
                                </Box>
                                <QualityIcon color="info" sx={{ fontSize: 40 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="textSecondary" gutterBottom>
                                        최적화율
                                    </Typography>
                                    <Typography variant="h4">
                                        {(analytics.optimizationRate * 100).toFixed(1)}%
                                    </Typography>
                                </Box>
                                <OptimizationIcon color="warning" sx={{ fontSize: 40 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 탭 네비게이션 */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="learning path tabs">
                    <Tab icon={<PathIcon />} label="학습 경로" />
                    <Tab icon={<ModuleIcon />} label="모듈 분석" />
                    <Tab icon={<OptimizationIcon />} label="최적화" />
                    <Tab icon={<AnalyticsIcon />} label="품질 분석" />
                    <Tab icon={<ProgressIcon />} label="진행 상황" />
                    <Tab icon={<AutoAwesomeIcon />} label="권장사항" />
                    <Tab icon={<SettingsIcon />} label="설정" />
                </Tabs>
            </Box>

            {/* 탭 콘텐츠 */}
            <TabPanel value={tabValue} index={0}>
                {/* 학습 경로 */}
                <Grid container spacing={3}>
                    {/* 경로 목록 */}
                    <Grid item xs={12} lg={8}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    학습 경로 목록
                                </Typography>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>경로</TableCell>
                                                <TableCell>타입</TableCell>
                                                <TableCell>상태</TableCell>
                                                <TableCell>진행률</TableCell>
                                                <TableCell>품질</TableCell>
                                                <TableCell>작업</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {learningPaths.map((path) => (
                                                <TableRow key={path.pathId}>
                                                    <TableCell>
                                                        <Box>
                                                            <Typography variant="subtitle2">{path.name}</Typography>
                                                            <Typography variant="body2" color="textSecondary">
                                                                {path.description}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={path.type}
                                                            color={getTypeColor(path.type) as any}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={path.status}
                                                            color={getStatusColor(path.status) as any}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Box sx={{ width: '100%', mr: 1 }}>
                                                                <LinearProgress
                                                                    variant="determinate"
                                                                    value={path.progress.overallProgress * 100}
                                                                    sx={{ height: 8, borderRadius: 5 }}
                                                                />
                                                            </Box>
                                                            <Box sx={{ minWidth: 35 }}>
                                                                <Typography variant="body2" color="textSecondary">
                                                                    {(path.progress.overallProgress * 100).toFixed(0)}%
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Box sx={{ width: '100%', mr: 1 }}>
                                                                <LinearProgress
                                                                    variant="determinate"
                                                                    value={path.qualityMetrics.overallQuality * 100}
                                                                    sx={{ height: 8, borderRadius: 5 }}
                                                                />
                                                            </Box>
                                                            <Box sx={{ minWidth: 35 }}>
                                                                <Typography variant="body2" color="textSecondary">
                                                                    {(path.qualityMetrics.overallQuality * 100).toFixed(0)}%
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                setSelectedPath(path);
                                                                setDetailDialogOpen(true);
                                                            }}
                                                        >
                                                            <Visibility />
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

                    {/* 차트 */}
                    <Grid item xs={12} lg={4}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            경로 타입 분포
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <PieChart>
                                                <Pie
                                                    data={getPathTypeData()}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {getPathTypeData().map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                {/* 모듈 분석 */}
                <Grid container spacing={3}>
                    {learningPaths.map((path) => (
                        <Grid item xs={12} key={path.pathId}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {path.name} - 모듈 분석
                                    </Typography>
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>모듈</TableCell>
                                                    <TableCell>타입</TableCell>
                                                    <TableCell>난이도</TableCell>
                                                    <TableCell>진행률</TableCell>
                                                    <TableCell>품질 점수</TableCell>
                                                    <TableCell>만족도</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {path.modules.map((module) => (
                                                    <TableRow key={module.moduleId}>
                                                        <TableCell>
                                                            <Typography variant="subtitle2">{module.name}</Typography>
                                                            <Typography variant="body2" color="textSecondary">
                                                                {module.description}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip label={module.type} size="small" />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={module.difficulty}
                                                                color={getDifficultyColor(module.difficulty) as any}
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <Box sx={{ width: '100%', mr: 1 }}>
                                                                    <LinearProgress
                                                                        variant="determinate"
                                                                        value={module.completionRate * 100}
                                                                        sx={{ height: 8, borderRadius: 5 }}
                                                                    />
                                                                </Box>
                                                                <Box sx={{ minWidth: 35 }}>
                                                                    <Typography variant="body2" color="textSecondary">
                                                                        {(module.completionRate * 100).toFixed(0)}%
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2">
                                                                {(module.qualityScore * 100).toFixed(1)}%
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2">
                                                                {(module.userSatisfaction * 100).toFixed(1)}%
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
                {/* 최적화 */}
                <Grid container spacing={3}>
                    {learningPaths.map((path) => (
                        <Grid item xs={12} key={path.pathId}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {path.name} - 최적화 결과
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle1" gutterBottom>
                                                최적화 상태
                                            </Typography>
                                            <Chip
                                                label={path.optimization.status}
                                                color={path.optimization.status === 'completed' ? 'success' : 'warning'}
                                                sx={{ mb: 2 }}
                                            />
                                            <Typography variant="body2" color="textSecondary">
                                                알고리즘: {path.optimization.algorithm}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                최적화 타입: {path.optimization.type}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle1" gutterBottom>
                                                최적화 결과
                                            </Typography>
                                            {path.optimization.results.map((result) => (
                                                <Alert key={result.resultId} severity="info" sx={{ mb: 1 }}>
                                                    <Typography variant="body2">
                                                        <strong>{result.metric}:</strong> {(result.improvement * 100).toFixed(1)}% 향상
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {result.explanation}
                                                    </Typography>
                                                </Alert>
                                            ))}
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
                {/* 품질 분석 */}
                <Grid container spacing={3}>
                    {/* 품질 차트 */}
                    <Grid item xs={12} lg={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    경로별 품질 비교
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={getQualityData()}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <RechartsTooltip />
                                        <Legend />
                                        <Bar dataKey="overallQuality" fill="#8884d8" name="전체 품질" />
                                        <Bar dataKey="contentQuality" fill="#82ca9d" name="콘텐츠 품질" />
                                        <Bar dataKey="engagementQuality" fill="#ffc658" name="참여도 품질" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} lg={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    모듈 타입 분포
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={getModuleTypeData()}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {getModuleTypeData().map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={4}>
                {/* 진행 상황 */}
                <Grid container spacing={3}>
                    {/* 진행률 차트 */}
                    <Grid item xs={12} lg={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    경로별 진행률
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={getProgressData()}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <RechartsTooltip />
                                        <Legend />
                                        <Bar dataKey="progress" fill="#8884d8" name="진행률" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} lg={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    최적화 현황
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={getOptimizationData()}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <RechartsTooltip />
                                        <Legend />
                                        <Bar dataKey="optimizationRate" fill="#82ca9d" name="최적화율" />
                                        <Bar dataKey="recommendations" fill="#ffc658" name="권장사항" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={5}>
                {/* 권장사항 */}
                <Grid container spacing={3}>
                    {learningPaths.map((path) => (
                        <Grid item xs={12} key={path.pathId}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {path.name} - 개선 권장사항
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {path.recommendations.map((recommendation) => (
                                            <Grid item xs={12} md={6} key={recommendation.recommendationId}>
                                                <Alert severity={recommendation.priority === 'critical' ? 'error' :
                                                    recommendation.priority === 'high' ? 'warning' : 'info'}>
                                                    <Typography variant="body2" gutterBottom>
                                                        <strong>{recommendation.title}</strong>
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {recommendation.description}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                                        우선순위: {recommendation.priority} |
                                                        영향도: {(recommendation.impact * 100).toFixed(1)}% |
                                                        상태: {recommendation.status}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                                        <strong>구현 방법:</strong> {recommendation.implementation}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                                        <strong>기대 효과:</strong> {recommendation.expectedOutcome}
                                                    </Typography>
                                                </Alert>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={6}>
                {/* 설정 */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    학습 경로 설정
                                </Typography>
                                <List>
                                    <ListItem>
                                        <ListItemIcon>
                                            <AutoAwesome />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="적응형 학습"
                                            secondary="개인별 맞춤형 학습 경로 제공"
                                        />
                                        <Switch defaultChecked />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Psychology />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="개인화"
                                            secondary="사용자 특성 기반 개인화"
                                        />
                                        <Switch defaultChecked />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Group />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="협업 학습"
                                            secondary="팀 기반 협업 학습 지원"
                                        />
                                        <Switch defaultChecked />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Quality />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="품질 추적"
                                            secondary="학습 품질 실시간 모니터링"
                                        />
                                        <Switch defaultChecked />
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    최적화 설정
                                </Typography>
                                <List>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Optimization />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="자동 최적화"
                                            secondary="실시간 학습 경로 최적화"
                                        />
                                        <Switch defaultChecked />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Notifications />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="알림"
                                            secondary="최적화 및 개선 알림"
                                        />
                                        <Switch defaultChecked />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Timeline />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="난이도 조정"
                                            secondary="자동 난이도 조정"
                                        />
                                        <Switch defaultChecked />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Schedule />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="시간 관리"
                                            secondary="학습 시간 최적화"
                                        />
                                        <Switch defaultChecked />
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </TabPanel>

            {/* 경로 상세 다이얼로그 */}
            <Dialog
                open={detailDialogOpen}
                onClose={() => setDetailDialogOpen(false)}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>
                    학습 경로 상세 정보
                </DialogTitle>
                <DialogContent>
                    {selectedPath && (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                {selectedPath.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                {selectedPath.description}
                            </Typography>

                            <Grid container spacing={3} sx={{ mt: 2 }}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        기본 정보
                                    </Typography>
                                    <List dense>
                                        <ListItem>
                                            <ListItemText
                                                primary="타입"
                                                secondary={selectedPath.type}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText
                                                primary="상태"
                                                secondary={selectedPath.status}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText
                                                primary="모듈 수"
                                                secondary={`${selectedPath.modules.length}개`}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText
                                                primary="생성일"
                                                secondary={formatDate(selectedPath.timestamp)}
                                            />
                                        </ListItem>
                                    </List>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        품질 지표
                                    </Typography>
                                    <List dense>
                                        <ListItem>
                                            <ListItemText
                                                primary="전체 품질"
                                                secondary={`${(selectedPath.qualityMetrics.overallQuality * 100).toFixed(1)}%`}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText
                                                primary="콘텐츠 품질"
                                                secondary={`${(selectedPath.qualityMetrics.contentQuality * 100).toFixed(1)}%`}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText
                                                primary="학습 효과성"
                                                secondary={`${(selectedPath.qualityMetrics.learningEffectiveness * 100).toFixed(1)}%`}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText
                                                primary="협업 품질"
                                                secondary={`${(selectedPath.qualityMetrics.collaborationQuality * 100).toFixed(1)}%`}
                                            />
                                        </ListItem>
                                    </List>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailDialogOpen(false)}>닫기</Button>
                </DialogActions>
            </Dialog>

            {/* 새 경로 생성 다이얼로그 */}
            <Dialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    새 학습 경로 생성
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="경로 이름"
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="설명"
                                variant="outlined"
                                multiline
                                rows={3}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>타입</InputLabel>
                                <Select label="타입">
                                    <MenuItem value="individual">개인</MenuItem>
                                    <MenuItem value="team">팀</MenuItem>
                                    <MenuItem value="project">프로젝트</MenuItem>
                                    <MenuItem value="skill">스킬</MenuItem>
                                    <MenuItem value="career">커리어</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)}>취소</Button>
                    <Button variant="contained" onClick={() => setCreateDialogOpen(false)}>
                        생성
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AIMultimodalLearningPathOptimizationDashboard;
