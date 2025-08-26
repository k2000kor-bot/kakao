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
  FormControlLabel,
  Avatar,
  AvatarGroup
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
  Group,
  Analytics,
  Settings,
  Notifications,
  Warning,
  CheckCircle,
  Error,
  Info,
  Person,
  VideoLibrary,
  Assessment,
  Psychology,
  AutoAwesome,
  Timeline,
  Project,
  Task,
  Resource,
  Risk,
  Performance,
  Optimization,
  Quality,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Group as GroupIcon,
  VideoLibrary as VideoLibraryIcon,
  Assessment as AssessmentIcon,
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
  Timeline as TimelineIcon,
  Project as ProjectIcon,
  Task as TaskIcon,
  Resource as ResourceIcon,
  Risk as RiskIcon,
  Performance as PerformanceIcon,
  Optimization as OptimizationIcon,
  Quality as QualityIcon,
  Person as PersonIcon
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
import aiProjectManagementOptimizationSystem, {
  ProjectManagement,
  ProjectAnalytics,
  ProjectTask,
  ProjectPhase,
  ProjectResource,
  ProjectRisk,
  ProjectPerformance,
  ProjectOptimization,
  ProjectRecommendation
} from '../services/aiProjectManagementOptimizationSystem';

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
      id={`project-management-tabpanel-${index}`}
      aria-labelledby={`project-management-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AIProjectManagementOptimizationDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [projects, setProjects] = useState<ProjectManagement[]>([]);
  const [analytics, setAnalytics] = useState<ProjectAnalytics>({
    totalProjects: 0,
    activeProjects: 0,
    averagePerformance: 0,
    averageSchedulePerformance: 0,
    averageCostPerformance: 0,
    averageQualityPerformance: 0,
    optimizationRate: 0,
    riskMitigationRate: 0,
    resourceUtilization: 0,
    stakeholderSatisfaction: 0
  });
  const [selectedProject, setSelectedProject] = useState<ProjectManagement | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [isSystemRunning, setIsSystemRunning] = useState(false);

  useEffect(() => {
    const updateData = () => {
      setProjects(aiProjectManagementOptimizationSystem.getProjects());
      setAnalytics(aiProjectManagementOptimizationSystem.getAnalytics());
      setIsSystemRunning(aiProjectManagementOptimizationSystem.isSystemRunning());
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
      case 'planning': return 'warning';
      case 'completed': return 'info';
      case 'on-hold': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'development': return 'primary';
      case 'research': return 'secondary';
      case 'analysis': return 'success';
      case 'innovation': return 'warning';
      case 'maintenance': return 'info';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ko-KR');
  };

  const getProjectTypeData = () => {
    const typeCounts = projects.reduce((acc, project) => {
      acc[project.type] = (acc[project.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCounts).map(([type, count]) => ({
      name: type,
      value: count
    }));
  };

  const getPerformanceData = () => {
    return projects.map(project => ({
      name: project.name,
      overallPerformance: project.performance.overallPerformance * 100,
      schedulePerformance: project.performance.schedulePerformance * 100,
      costPerformance: project.performance.costPerformance * 100,
      qualityPerformance: project.performance.qualityPerformance * 100,
      riskPerformance: project.performance.riskPerformance * 100
    }));
  };

  const getTaskStatusData = () => {
    const allTasks = projects.flatMap(project => project.tasks);
    const statusCounts = allTasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count
    }));
  };

  const getRiskSeverityData = () => {
    const allRisks = projects.flatMap(project => project.risks);
    const severityCounts = allRisks.reduce((acc, risk) => {
      acc[risk.severity] = (acc[risk.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(severityCounts).map(([severity, count]) => ({
      name: severity,
      value: count
    }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <Box sx={{ p: 3 }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            📋 AI 프로젝트 관리 최적화
          </Typography>
          <Typography variant="body1" color="textSecondary">
            팀 구성과 연동된 프로젝트 성공 확률 향상 및 효율적 관리 시스템
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
            새 프로젝트
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
                    전체 프로젝트
                  </Typography>
                  <Typography variant="h4">
                    {analytics.totalProjects}
                  </Typography>
                </Box>
                <ProjectIcon color="primary" sx={{ fontSize: 40 }} />
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
                    평균 성과
                  </Typography>
                  <Typography variant="h4">
                    {(analytics.averagePerformance * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <PerformanceIcon color="success" sx={{ fontSize: 40 }} />
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
                    리소스 활용도
                  </Typography>
                  <Typography variant="h4">
                    {(analytics.resourceUtilization * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <ResourceIcon color="info" sx={{ fontSize: 40 }} />
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

      {/* 탭 네비게이션 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="project management tabs">
          <Tab icon={<ProjectIcon />} label="프로젝트" />
          <Tab icon={<TaskIcon />} label="작업 관리" />
          <Tab icon={<ResourceIcon />} label="리소스" />
          <Tab icon={<RiskIcon />} label="리스크" />
          <Tab icon={<PerformanceIcon />} label="성과 분석" />
          <Tab icon={<OptimizationIcon />} label="최적화" />
          <Tab icon={<SettingsIcon />} label="설정" />
        </Tabs>
      </Box>

      {/* 탭 콘텐츠 */}
      <TabPanel value={tabValue} index={0}>
        {/* 프로젝트 */}
        <Grid container spacing={3}>
          {/* 프로젝트 목록 */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  프로젝트 목록
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>프로젝트</TableCell>
                        <TableCell>타입</TableCell>
                        <TableCell>상태</TableCell>
                        <TableCell>우선순위</TableCell>
                        <TableCell>성과</TableCell>
                        <TableCell>작업</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {projects.map((project) => (
                        <TableRow key={project.projectId}>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2">{project.name}</Typography>
                              <Typography variant="body2" color="textSecondary">
                                {project.description}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={project.type}
                              color={getTypeColor(project.type) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={project.status}
                              color={getStatusColor(project.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={project.priority}
                              color={getPriorityColor(project.priority) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={project.performance.overallPerformance * 100}
                                  sx={{ height: 8, borderRadius: 5 }}
                                />
                              </Box>
                              <Box sx={{ minWidth: 35 }}>
                                <Typography variant="body2" color="textSecondary">
                                  {(project.performance.overallPerformance * 100).toFixed(0)}%
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedProject(project);
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
                      프로젝트 타입 분포
                    </Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={getProjectTypeData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getProjectTypeData().map((entry, index) => (
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
        {/* 작업 관리 */}
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} key={project.projectId}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {project.name} - 작업 관리
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>작업</TableCell>
                          <TableCell>담당자</TableCell>
                          <TableCell>우선순위</TableCell>
                          <TableCell>상태</TableCell>
                          <TableCell>진행률</TableCell>
                          <TableCell>품질</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {project.tasks.map((task) => (
                          <TableRow key={task.taskId}>
                            <TableCell>
                              <Box>
                                <Typography variant="subtitle2">{task.name}</Typography>
                                <Typography variant="body2" color="textSecondary">
                                  {task.description}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{task.assigneeId}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={task.priority}
                                color={getPriorityColor(task.priority) as any}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={task.status}
                                color={getStatusColor(task.status) as any}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ width: '100%', mr: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={task.progress * 100}
                                    sx={{ height: 8, borderRadius: 5 }}
                                  />
                                </Box>
                                <Box sx={{ minWidth: 35 }}>
                                  <Typography variant="body2" color="textSecondary">
                                    {(task.progress * 100).toFixed(0)}%
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {(task.quality * 100).toFixed(1)}%
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
        {/* 리소스 */}
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} key={project.projectId}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {project.name} - 리소스 관리
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>리소스</TableCell>
                          <TableCell>타입</TableCell>
                          <TableCell>할당량</TableCell>
                          <TableCell>사용량</TableCell>
                          <TableCell>가용량</TableCell>
                          <TableCell>활용도</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {project.resources.map((resource) => (
                          <TableRow key={resource.resourceId}>
                            <TableCell>
                              <Box>
                                <Typography variant="subtitle2">{resource.name}</Typography>
                                <Typography variant="body2" color="textSecondary">
                                  {resource.description}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip label={resource.type} size="small" />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{resource.allocated}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{resource.used}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{resource.available}</Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ width: '100%', mr: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={resource.utilization * 100}
                                    sx={{ height: 8, borderRadius: 5 }}
                                  />
                                </Box>
                                <Box sx={{ minWidth: 35 }}>
                                  <Typography variant="body2" color="textSecondary">
                                    {(resource.utilization * 100).toFixed(0)}%
                                  </Typography>
                                </Box>
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
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {/* 리스크 */}
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} key={project.projectId}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {project.name} - 리스크 관리
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>리스크</TableCell>
                          <TableCell>카테고리</TableCell>
                          <TableCell>심각도</TableCell>
                          <TableCell>확률</TableCell>
                          <TableCell>영향도</TableCell>
                          <TableCell>상태</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {project.risks.map((risk) => (
                          <TableRow key={risk.riskId}>
                            <TableCell>
                              <Box>
                                <Typography variant="subtitle2">{risk.title}</Typography>
                                <Typography variant="body2" color="textSecondary">
                                  {risk.description}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip label={risk.category} size="small" />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={risk.severity}
                                color={getPriorityColor(risk.severity) as any}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {(risk.probability * 100).toFixed(0)}%
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {(risk.impact * 100).toFixed(0)}%
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={risk.status}
                                color={getStatusColor(risk.status) as any}
                                size="small"
                              />
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

      <TabPanel value={tabValue} index={4}>
        {/* 성과 분석 */}
        <Grid container spacing={3}>
          {/* 성과 차트 */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  프로젝트별 성과 비교
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getPerformanceData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="overallPerformance" fill="#8884d8" name="전체 성과" />
                    <Bar dataKey="schedulePerformance" fill="#82ca9d" name="일정 성과" />
                    <Bar dataKey="costPerformance" fill="#ffc658" name="비용 성과" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  작업 상태 분포
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getTaskStatusData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getTaskStatusData().map((entry, index) => (
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

      <TabPanel value={tabValue} index={5}>
        {/* 최적화 */}
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} key={project.projectId}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {project.name} - 최적화 결과
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom>
                        최적화 상태
                      </Typography>
                      <Chip
                        label={project.optimization.status}
                        color={project.optimization.status === 'completed' ? 'success' : 'warning'}
                        sx={{ mb: 2 }}
                      />
                      <Typography variant="body2" color="textSecondary">
                        알고리즘: {project.optimization.algorithm}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        최적화 타입: {project.optimization.type}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom>
                        최적화 결과
                      </Typography>
                      {project.optimization.results.map((result) => (
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

      <TabPanel value={tabValue} index={6}>
        {/* 설정 */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  프로젝트 관리 설정
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <AutoAwesome />
                    </ListItemIcon>
                    <ListItemText
                      primary="자동 최적화"
                      secondary="프로젝트 자동 최적화"
                    />
                    <Switch defaultChecked />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Risk />
                    </ListItemIcon>
                    <ListItemText
                      primary="리스크 모니터링"
                      secondary="리스크 실시간 모니터링"
                    />
                    <Switch defaultChecked />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Quality />
                    </ListItemIcon>
                    <ListItemText
                      primary="품질 추적"
                      secondary="프로젝트 품질 추적"
                    />
                    <Switch defaultChecked />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Resource />
                    </ListItemIcon>
                    <ListItemText
                      primary="리소스 최적화"
                      secondary="리소스 자동 최적화"
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
                      primary="스케줄 최적화"
                      secondary="프로젝트 일정 최적화"
                    />
                    <Switch defaultChecked />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Performance />
                    </ListItemIcon>
                    <ListItemText
                      primary="비용 관리"
                      secondary="프로젝트 비용 관리"
                    />
                    <Switch defaultChecked />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Group />
                    </ListItemIcon>
                    <ListItemText
                      primary="이해관계자 커뮤니케이션"
                      secondary="이해관계자와의 커뮤니케이션"
                    />
                    <Switch defaultChecked />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Timeline />
                    </ListItemIcon>
                    <ListItemText
                      primary="진행 보고"
                      secondary="프로젝트 진행 상황 보고"
                    />
                    <Switch defaultChecked />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* 프로젝트 상세 다이얼로그 */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          프로젝트 상세 정보
        </DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedProject.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {selectedProject.description}
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
                        secondary={selectedProject.type}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="상태"
                        secondary={selectedProject.status}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="우선순위"
                        secondary={selectedProject.priority}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="생성일"
                        secondary={formatDate(selectedProject.timestamp)}
                      />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    성과 지표
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="전체 성과"
                        secondary={`${(selectedProject.performance.overallPerformance * 100).toFixed(1)}%`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="일정 성과"
                        secondary={`${(selectedProject.performance.schedulePerformance * 100).toFixed(1)}%`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="비용 성과"
                        secondary={`${(selectedProject.performance.costPerformance * 100).toFixed(1)}%`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="품질 성과"
                        secondary={`${(selectedProject.performance.qualityPerformance * 100).toFixed(1)}%`}
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

      {/* 새 프로젝트 생성 다이얼로그 */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          새 프로젝트 생성
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="프로젝트 이름"
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
                  <MenuItem value="development">개발</MenuItem>
                  <MenuItem value="research">연구</MenuItem>
                  <MenuItem value="analysis">분석</MenuItem>
                  <MenuItem value="innovation">혁신</MenuItem>
                  <MenuItem value="maintenance">유지보수</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>우선순위</InputLabel>
                <Select label="우선순위">
                  <MenuItem value="low">낮음</MenuItem>
                  <MenuItem value="medium">보통</MenuItem>
                  <MenuItem value="high">높음</MenuItem>
                  <MenuItem value="critical">긴급</MenuItem>
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

export default AIProjectManagementOptimizationDashboard;
