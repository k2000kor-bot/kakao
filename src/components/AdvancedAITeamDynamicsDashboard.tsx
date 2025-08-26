import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    Tabs,
    Tab,
    Chip,
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
    ListItemText,
    ListItemIcon,
    Divider,
    Alert,
    LinearProgress,
    IconButton,
    Tooltip,
    Avatar,
    Rating
} from '@mui/material';
import {
    Group,
    Psychology,
    TrendingUp,
    Analytics,
    Insights,
    Recommendations,
    Timeline,
    Settings,
    PlayArrow,
    Stop,
    Refresh,
    Add,
    Visibility,
    Edit,
    Delete,
    CheckCircle,
    Warning,
    Error,
    Info,
    Person,
    Leaderboard,
    EmojiEvents,
    Work,
    School,
    Favorite,
    Star
} from '@mui/icons-material';
import {
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    ScatterChart,
    Scatter,
    AreaChart,
    Area
} from 'recharts';
import advancedAITeamDynamicsSystem, {
    TeamDynamicsSession,
    TeamDynamicsMetrics,
    TeamMember,
    TeamInteraction,
    TeamInsight,
    TeamPattern,
    TeamRecommendation,
    TeamPrediction
} from '../services/advancedAITeamDynamicsSystem';

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
            id={`team-dynamics-tabpanel-${index}`}
            aria-labelledby={`team-dynamics-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const AdvancedAITeamDynamicsDashboard: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [sessions, setSessions] = useState<TeamDynamicsSession[]>([]);
    const [metrics, setMetrics] = useState<TeamDynamicsMetrics | null>(null);
    const [selectedSession, setSelectedSession] = useState<TeamDynamicsSession | null>(null);
    const [isSystemRunning, setIsSystemRunning] = useState(false);
    const [createSessionDialog, setCreateSessionDialog] = useState(false);
    const [sessionDetailsDialog, setSessionDetailsDialog] = useState(false);
    const [memberDetailsDialog, setMemberDetailsDialog] = useState(false);
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const [newSession, setNewSession] = useState({
        teamName: '',
        teamId: '',
        memberCount: 2
    });

    useEffect(() => {
        const updateData = () => {
            setSessions(advancedAITeamDynamicsSystem.getSessions());
            setMetrics(advancedAITeamDynamicsSystem.getMetrics());
            setIsSystemRunning(advancedAITeamDynamicsSystem.isSystemRunning());
        };

        updateData();
        const interval = setInterval(updateData, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleSystemToggle = () => {
        if (isSystemRunning) {
            advancedAITeamDynamicsSystem.stop();
        } else {
            advancedAITeamDynamicsSystem.start();
        }
    };

    const handleCreateSession = () => {
        setCreateSessionDialog(true);
    };

    const handleSessionSubmit = () => {
        // 실제 구현에서는 세션 생성 로직 추가
        setCreateSessionDialog(false);
        setNewSession({
            teamName: '',
            teamId: '',
            memberCount: 2
        });
    };

    const handleSessionDetails = (session: TeamDynamicsSession) => {
        setSelectedSession(session);
        setSessionDetailsDialog(true);
    };

    const handleMemberDetails = (member: TeamMember) => {
        setSelectedMember(member);
        setMemberDetailsDialog(true);
    };

    // 차트 데이터 생성
    const generateTeamDynamicsData = () => {
        if (!selectedSession) return [];

        return [
            { metric: '응집력', value: selectedSession.dynamics.cohesion * 100 },
            { metric: '의사소통', value: selectedSession.dynamics.communication * 100 },
            { metric: '협업', value: selectedSession.dynamics.collaboration * 100 },
            { metric: '창의성', value: selectedSession.dynamics.creativity * 100 },
            { metric: '의사결정', value: selectedSession.dynamics.decisionMaking * 100 },
            { metric: '리더십', value: selectedSession.dynamics.leadership * 100 },
            { metric: '신뢰', value: selectedSession.dynamics.trust * 100 },
            { metric: '동기부여', value: selectedSession.dynamics.motivation * 100 },
            { metric: '생산성', value: selectedSession.dynamics.productivity * 100 }
        ];
    };

    const generateMemberPerformanceData = () => {
        if (!selectedSession) return [];

        return selectedSession.members.map(member => ({
            name: member.name,
            overall: member.performance.overallScore * 100,
            contribution: member.performance.contribution * 100,
            reliability: member.performance.reliability * 100,
            creativity: member.performance.creativity * 100,
            teamwork: member.performance.teamwork * 100,
            leadership: member.performance.leadership * 100,
            adaptability: member.performance.adaptability * 100
        }));
    };

    const generateInteractionTrendData = () => {
        if (!selectedSession) return [];

        return selectedSession.interactions.slice(-10).map((interaction, index) => ({
            time: index,
            engagement: interaction.analysis.engagement * 100,
            effectiveness: interaction.analysis.effectiveness * 100,
            collaboration: interaction.analysis.collaborationLevel * 100,
            conflict: interaction.analysis.conflictLevel * 100
        }));
    };

    const getPersonalityColor = (type: string) => {
        switch (type) {
            case 'extrovert': return 'success';
            case 'introvert': return 'info';
            case 'ambivert': return 'warning';
            default: return 'default';
        }
    };

    const getCommunicationColor = (type: string) => {
        switch (type) {
            case 'assertive': return 'success';
            case 'passive': return 'info';
            case 'aggressive': return 'error';
            case 'passive-aggressive': return 'warning';
            default: return 'default';
        }
    };

    const getLeadershipColor = (type: string) => {
        switch (type) {
            case 'transformational': return 'success';
            case 'democratic': return 'info';
            case 'servant': return 'warning';
            case 'autocratic': return 'error';
            case 'laissez-faire': return 'default';
            default: return 'default';
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'info';
            default: return 'default';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'info';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            {/* 헤더 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    👥 고급 AI 팀 역학 분석 시스템
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        color={isSystemRunning ? 'error' : 'success'}
                        startIcon={isSystemRunning ? <Stop /> : <PlayArrow />}
                        onClick={handleSystemToggle}
                    >
                        {isSystemRunning ? '시스템 중지' : '시스템 시작'}
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={handleCreateSession}
                    >
                        새 팀 세션 생성
                    </Button>
                </Box>
            </Box>

            {/* 시스템 상태 */}
            <Alert
                severity={isSystemRunning ? 'success' : 'warning'}
                sx={{ mb: 3 }}
                action={
                    <Button color="inherit" size="small" startIcon={<Refresh />}>
                        새로고침
                    </Button>
                }
            >
                시스템 상태: {isSystemRunning ? '실행 중' : '중지됨'}
            </Alert>

            {/* 탭 네비게이션 */}
            <Paper sx={{ width: '100%', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="team dynamics tabs">
                    <Tab icon={<Analytics />} label="개요" />
                    <Tab icon={<Group />} label="팀원 분석" />
                    <Tab icon={<Psychology />} label="팀 역학" />
                    <Tab icon={<Insights />} label="인사이트" />
                    <Tab icon={<Recommendations />} label="추천사항" />
                    <Tab icon={<Timeline />} label="예측" />
                    <Tab icon={<Settings />} label="설정" />
                </Tabs>
            </Paper>

            {/* 개요 탭 */}
            <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                    {/* 주요 지표 */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    📊 전체 지표
                                </Typography>
                                {metrics && (
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="h4" color="primary">
                                                {metrics.totalInteractions}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                총 상호작용
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="h4" color="secondary">
                                                {(metrics.averageCohesion * 100).toFixed(1)}%
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                평균 응집력
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="h4" color="success.main">
                                                {(metrics.collaborationEffectiveness * 100).toFixed(1)}%
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                협업 효과성
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="h4" color="info.main">
                                                {(metrics.leadershipEffectiveness * 100).toFixed(1)}%
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                리더십 효과성
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* 팀 역학 분포 */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    🎯 팀 역학 분포
                                </Typography>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: '응집력', value: metrics?.averageCohesion || 0 },
                                                { name: '협업', value: metrics?.collaborationEffectiveness || 0 },
                                                { name: '리더십', value: metrics?.leadershipEffectiveness || 0 },
                                                { name: '혁신', value: metrics?.innovationRate || 0 }
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, value }) => `${name} ${(value * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            <Cell fill="#0088FE" />
                                            <Cell fill="#00C49F" />
                                            <Cell fill="#FFBB28" />
                                            <Cell fill="#FF8042" />
                                        </Pie>
                                        <RechartsTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* 활성 팀 */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    🎯 활성 팀 ({sessions.length})
                                </Typography>
                                <Grid container spacing={2}>
                                    {sessions.map((session) => (
                                        <Grid item xs={12} md={6} lg={4} key={session.sessionId}>
                                            <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        {session.teamName}
                                                    </Typography>
                                                    <IconButton size="small" onClick={() => handleSessionDetails(session)}>
                                                        <Visibility />
                                                    </IconButton>
                                                </Box>
                                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                                    팀원: {session.members.length}명
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                                    <Chip
                                                        label={`응집력: ${(session.dynamics.cohesion * 100).toFixed(0)}%`}
                                                        color="primary"
                                                        size="small"
                                                    />
                                                    <Chip
                                                        label={`협업: ${(session.dynamics.collaboration * 100).toFixed(0)}%`}
                                                        color="success"
                                                        size="small"
                                                    />
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="body2">
                                                        상호작용: {session.metrics.totalInteractions}
                                                    </Typography>
                                                    <Chip
                                                        label={`${(session.dynamics.productivity * 100).toFixed(0)}%`}
                                                        color="info"
                                                        size="small"
                                                    />
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </TabPanel>

            {/* 팀원 분석 탭 */}
            <TabPanel value={tabValue} index={1}>
                <Grid container spacing={3}>
                    {selectedSession && (
                        <>
                            {/* 팀원 성과 분석 */}
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            👥 팀원 성과 분석
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={generateMemberPerformanceData()}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <RechartsTooltip />
                                                <Legend />
                                                <Bar dataKey="overall" fill="#8884d8" name="전체" />
                                                <Bar dataKey="contribution" fill="#82ca9d" name="기여도" />
                                                <Bar dataKey="teamwork" fill="#ffc658" name="팀워크" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* 팀원 상세 정보 */}
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            📋 팀원 상세 정보
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {selectedSession.members.map((member) => (
                                                <Grid item xs={12} md={6} key={member.memberId}>
                                                    <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                            <Avatar sx={{ mr: 2 }}>
                                                                <Person />
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="subtitle1" fontWeight="bold">
                                                                    {member.name}
                                                                </Typography>
                                                                <Typography variant="body2" color="textSecondary">
                                                                    {member.role}
                                                                </Typography>
                                                            </Box>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleMemberDetails(member)}
                                                                sx={{ ml: 'auto' }}
                                                            >
                                                                <Visibility />
                                                            </IconButton>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                                            <Chip
                                                                label={member.personality.type}
                                                                color={getPersonalityColor(member.personality.type) as any}
                                                                size="small"
                                                            />
                                                            <Chip
                                                                label={member.communicationStyle.type}
                                                                color={getCommunicationColor(member.communicationStyle.type) as any}
                                                                size="small"
                                                            />
                                                            <Chip
                                                                label={member.leadershipStyle.type}
                                                                color={getLeadershipColor(member.leadershipStyle.type) as any}
                                                                size="small"
                                                            />
                                                        </Box>
                                                        <Box sx={{ mb: 1 }}>
                                                            <Typography variant="body2" color="textSecondary">
                                                                전체 성과: {(member.performance.overallScore * 100).toFixed(0)}%
                                                            </Typography>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={member.performance.overallScore * 100}
                                                                sx={{ height: 8, borderRadius: 4 }}
                                                            />
                                                        </Box>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <Typography variant="caption" color="textSecondary">
                                                                기여도: {(member.performance.contribution * 100).toFixed(0)}%
                                                            </Typography>
                                                            <Typography variant="caption" color="textSecondary">
                                                                창의성: {(member.performance.creativity * 100).toFixed(0)}%
                                                            </Typography>
                                                            <Typography variant="caption" color="textSecondary">
                                                                팀워크: {(member.performance.teamwork * 100).toFixed(0)}%
                                                            </Typography>
                                                        </Box>
                                                    </Paper>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </>
                    )}
                </Grid>
            </TabPanel>

            {/* 팀 역학 탭 */}
            <TabPanel value={tabValue} index={2}>
                <Grid container spacing={3}>
                    {selectedSession && (
                        <>
                            {/* 팀 역학 레이더 차트 */}
                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            🎯 팀 역학 분석
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <RadarChart data={generateTeamDynamicsData()}>
                                                <PolarGrid />
                                                <PolarAngleAxis dataKey="metric" />
                                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                                <Radar
                                                    name="팀 역학"
                                                    dataKey="value"
                                                    stroke="#8884d8"
                                                    fill="#8884d8"
                                                    fillOpacity={0.6}
                                                />
                                                <RechartsTooltip />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* 상호작용 트렌드 */}
                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            📈 상호작용 트렌드
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={generateInteractionTrendData()}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="time" />
                                                <YAxis />
                                                <RechartsTooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey="engagement" stroke="#8884d8" name="참여도" />
                                                <Line type="monotone" dataKey="effectiveness" stroke="#82ca9d" name="효과성" />
                                                <Line type="monotone" dataKey="collaboration" stroke="#ffc658" name="협업" />
                                                <Line type="monotone" dataKey="conflict" stroke="#ff7300" name="갈등" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* 팀 역학 지표 */}
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            📊 팀 역학 지표
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={3}>
                                                <Paper sx={{ p: 2, textAlign: 'center' }}>
                                                    <Typography variant="h4" color="primary">
                                                        {(selectedSession.dynamics.cohesion * 100).toFixed(0)}%
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        응집력
                                                    </Typography>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={selectedSession.dynamics.cohesion * 100}
                                                        sx={{ mt: 1 }}
                                                    />
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={12} md={3}>
                                                <Paper sx={{ p: 2, textAlign: 'center' }}>
                                                    <Typography variant="h4" color="success.main">
                                                        {(selectedSession.dynamics.collaboration * 100).toFixed(0)}%
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        협업
                                                    </Typography>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={selectedSession.dynamics.collaboration * 100}
                                                        sx={{ mt: 1 }}
                                                    />
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={12} md={3}>
                                                <Paper sx={{ p: 2, textAlign: 'center' }}>
                                                    <Typography variant="h4" color="info.main">
                                                        {(selectedSession.dynamics.leadership * 100).toFixed(0)}%
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        리더십
                                                    </Typography>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={selectedSession.dynamics.leadership * 100}
                                                        sx={{ mt: 1 }}
                                                    />
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={12} md={3}>
                                                <Paper sx={{ p: 2, textAlign: 'center' }}>
                                                    <Typography variant="h4" color="warning.main">
                                                        {(selectedSession.dynamics.creativity * 100).toFixed(0)}%
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        창의성
                                                    </Typography>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={selectedSession.dynamics.creativity * 100}
                                                        sx={{ mt: 1 }}
                                                    />
                                                </Paper>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </>
                    )}
                </Grid>
            </TabPanel>

            {/* 인사이트 탭 */}
            <TabPanel value={tabValue} index={3}>
                <Grid container spacing={3}>
                    {selectedSession && (
                        <>
                            {/* 팀 인사이트 */}
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            🔍 팀 인사이트
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {selectedSession.analysis.insights.map((insight) => (
                                                <Grid item xs={12} md={6} key={insight.insightId}>
                                                    <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                            <Typography variant="subtitle2" fontWeight="bold">
                                                                {insight.title}
                                                            </Typography>
                                                            <Chip
                                                                label={insight.urgency}
                                                                color={getUrgencyColor(insight.urgency) as any}
                                                                size="small"
                                                            />
                                                        </Box>
                                                        <Typography variant="body2" gutterBottom>
                                                            {insight.description}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                                            <Chip
                                                                label={insight.category}
                                                                color="primary"
                                                                size="small"
                                                            />
                                                            <Typography variant="caption" color="textSecondary">
                                                                신뢰도: {(insight.confidence * 100).toFixed(0)}%
                                                            </Typography>
                                                        </Box>
                                                    </Paper>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* 팀 패턴 */}
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            🧠 팀 패턴
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {selectedSession.analysis.patterns.map((pattern) => (
                                                <Grid item xs={12} md={6} key={pattern.patternId}>
                                                    <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                            <Typography variant="subtitle2" fontWeight="bold">
                                                                {pattern.type} 패턴
                                                            </Typography>
                                                            <Chip
                                                                label={`${(pattern.effectiveness * 100).toFixed(0)}%`}
                                                                color="success"
                                                                size="small"
                                                            />
                                                        </Box>
                                                        <Typography variant="body2" gutterBottom>
                                                            {pattern.description}
                                                        </Typography>
                                                        <Box sx={{ mt: 1 }}>
                                                            <Typography variant="caption" color="textSecondary">
                                                                빈도: {pattern.frequency}회 | 영향도: {(pattern.impact * 100).toFixed(0)}%
                                                            </Typography>
                                                        </Box>
                                                    </Paper>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </>
                    )}
                </Grid>
            </TabPanel>

            {/* 추천사항 탭 */}
            <TabPanel value={tabValue} index={4}>
                <Grid container spacing={3}>
                    {selectedSession && (
                        <>
                            {/* 팀 추천사항 */}
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            💡 팀 추천사항
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {selectedSession.analysis.recommendations.map((recommendation) => (
                                                <Grid item xs={12} md={6} key={recommendation.recommendationId}>
                                                    <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                            <Typography variant="subtitle2" fontWeight="bold">
                                                                {recommendation.title}
                                                            </Typography>
                                                            <Chip
                                                                label={recommendation.priority}
                                                                color={getPriorityColor(recommendation.priority) as any}
                                                                size="small"
                                                            />
                                                        </Box>
                                                        <Typography variant="body2" gutterBottom>
                                                            {recommendation.description}
                                                        </Typography>
                                                        <Box sx={{ mt: 1 }}>
                                                            <Typography variant="caption" color="textSecondary">
                                                                구현: {recommendation.implementation}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ mt: 1 }}>
                                                            <Typography variant="caption" color="textSecondary">
                                                                예상 결과: {recommendation.expectedOutcome}
                                                            </Typography>
                                                        </Box>
                                                    </Paper>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </>
                    )}
                </Grid>
            </TabPanel>

            {/* 예측 탭 */}
            <TabPanel value={tabValue} index={5}>
                <Grid container spacing={3}>
                    {selectedSession && (
                        <>
                            {/* 팀 성과 예측 */}
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            🔮 팀 성과 예측
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {selectedSession.analysis.predictions.map((prediction) => (
                                                <Grid item xs={12} md={6} key={prediction.predictionId}>
                                                    <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                            <Typography variant="subtitle2" fontWeight="bold">
                                                                {prediction.type} 예측
                                                            </Typography>
                                                            <Chip
                                                                label={`${(prediction.probability * 100).toFixed(0)}%`}
                                                                color="success"
                                                                size="small"
                                                            />
                                                        </Box>
                                                        <Typography variant="body2" gutterBottom>
                                                            {prediction.description}
                                                        </Typography>
                                                        <Box sx={{ mt: 1 }}>
                                                            <Typography variant="caption" color="textSecondary">
                                                                기간: {prediction.timeframe} | 신뢰도: {(prediction.confidence * 100).toFixed(0)}%
                                                            </Typography>
                                                        </Box>
                                                    </Paper>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </>
                    )}
                </Grid>
            </TabPanel>

            {/* 설정 탭 */}
            <TabPanel value={tabValue} index={6}>
                <Grid container spacing={3}>
                    {selectedSession && (
                        <>
                            {/* 분석 설정 */}
                            <Grid item xs={12} md={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            ⚙️ 분석 설정
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={selectedSession.settings.realTimeAnalysis}
                                                        onChange={(e) => {
                                                            // 실제 구현에서는 설정 업데이트 로직 추가
                                                        }}
                                                    />
                                                }
                                                label="실시간 분석"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={selectedSession.settings.conflictDetection}
                                                        onChange={(e) => {
                                                            // 실제 구현에서는 설정 업데이트 로직 추가
                                                        }}
                                                    />
                                                }
                                                label="갈등 감지"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={selectedSession.settings.leadershipAnalysis}
                                                        onChange={(e) => {
                                                            // 실제 구현에서는 설정 업데이트 로직 추가
                                                        }}
                                                    />
                                                }
                                                label="리더십 분석"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={selectedSession.settings.collaborationOptimization}
                                                        onChange={(e) => {
                                                            // 실제 구현에서는 설정 업데이트 로직 추가
                                                        }}
                                                    />
                                                }
                                                label="협업 최적화"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={selectedSession.settings.performancePrediction}
                                                        onChange={(e) => {
                                                            // 실제 구현에서는 설정 업데이트 로직 추가
                                                        }}
                                                    />
                                                }
                                                label="성과 예측"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={selectedSession.settings.interventionRecommendations}
                                                        onChange={(e) => {
                                                            // 실제 구현에서는 설정 업데이트 로직 추가
                                                        }}
                                                    />
                                                }
                                                label="개입 추천"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={selectedSession.settings.personalityIntegration}
                                                        onChange={(e) => {
                                                            // 실제 구현에서는 설정 업데이트 로직 추가
                                                        }}
                                                    />
                                                }
                                                label="성격 통합"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={selectedSession.settings.relationshipMapping}
                                                        onChange={(e) => {
                                                            // 실제 구현에서는 설정 업데이트 로직 추가
                                                        }}
                                                    />
                                                }
                                                label="관계 매핑"
                                            />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </>
                    )}
                </Grid>
            </TabPanel>

            {/* 새 세션 생성 다이얼로그 */}
            <Dialog open={createSessionDialog} onClose={() => setCreateSessionDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>새 팀 역학 분석 세션 생성</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="팀 이름"
                            value={newSession.teamName}
                            onChange={(e) => setNewSession({ ...newSession, teamName: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="팀 ID"
                            value={newSession.teamId}
                            onChange={(e) => setNewSession({ ...newSession, teamId: e.target.value })}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>팀원 수</InputLabel>
                            <Select
                                value={newSession.memberCount}
                                label="팀원 수"
                                onChange={(e) => setNewSession({ ...newSession, memberCount: e.target.value as number })}
                            >
                                <MenuItem value={2}>2명</MenuItem>
                                <MenuItem value={3}>3명</MenuItem>
                                <MenuItem value={4}>4명</MenuItem>
                                <MenuItem value={5}>5명</MenuItem>
                                <MenuItem value={6}>6명</MenuItem>
                                <MenuItem value={7}>7명</MenuItem>
                                <MenuItem value={8}>8명</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateSessionDialog(false)}>취소</Button>
                    <Button onClick={handleSessionSubmit} variant="contained">생성</Button>
                </DialogActions>
            </Dialog>

            {/* 세션 상세 정보 다이얼로그 */}
            <Dialog open={sessionDetailsDialog} onClose={() => setSessionDetailsDialog(false)} maxWidth="lg" fullWidth>
                <DialogTitle>
                    세션 상세 정보: {selectedSession?.teamName}
                </DialogTitle>
                <DialogContent>
                    {selectedSession && (
                        <Box sx={{ mt: 1 }}>
                            <Typography variant="h6" gutterBottom>
                                팀 정보
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                팀 ID: {selectedSession.teamId}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                팀원 수: {selectedSession.members.length}명
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                총 상호작용: {selectedSession.metrics.totalInteractions}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                평균 응집력: {(selectedSession.metrics.averageCohesion * 100).toFixed(1)}%
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                협업 효과성: {(selectedSession.metrics.collaborationEffectiveness * 100).toFixed(1)}%
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                리더십 효과성: {(selectedSession.metrics.leadershipEffectiveness * 100).toFixed(1)}%
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSessionDetailsDialog(false)}>닫기</Button>
                </DialogActions>
            </Dialog>

            {/* 팀원 상세 정보 다이얼로그 */}
            <Dialog open={memberDetailsDialog} onClose={() => setMemberDetailsDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    팀원 상세 정보: {selectedMember?.name}
                </DialogTitle>
                <DialogContent>
                    {selectedMember && (
                        <Box sx={{ mt: 1 }}>
                            <Typography variant="h6" gutterBottom>
                                기본 정보
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                역할: {selectedMember.role}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                성격 유형: {selectedMember.personality.type}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                의사소통 스타일: {selectedMember.communicationStyle.type}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                리더십 스타일: {selectedMember.leadershipStyle.type}
                            </Typography>

                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                성과 지표
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2">
                                        전체 성과: {(selectedMember.performance.overallScore * 100).toFixed(0)}%
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={selectedMember.performance.overallScore * 100}
                                        sx={{ height: 8, borderRadius: 4, mb: 1 }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">
                                        기여도: {(selectedMember.performance.contribution * 100).toFixed(0)}%
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={selectedMember.performance.contribution * 100}
                                        sx={{ height: 8, borderRadius: 4, mb: 1 }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">
                                        창의성: {(selectedMember.performance.creativity * 100).toFixed(0)}%
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={selectedMember.performance.creativity * 100}
                                        sx={{ height: 8, borderRadius: 4, mb: 1 }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">
                                        팀워크: {(selectedMember.performance.teamwork * 100).toFixed(0)}%
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={selectedMember.performance.teamwork * 100}
                                        sx={{ height: 8, borderRadius: 4, mb: 1 }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setMemberDetailsDialog(false)}>닫기</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdvancedAITeamDynamicsDashboard;
