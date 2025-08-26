import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Chip,
  LinearProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Slider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/material';
import {
  AutoAwesome,
  Rocket,
  Timeline as TimelineIcon,
  Lightbulb,
  TrendingUp,
  Science,
  Psychology,
  School,
  Work,
  HealthAndSafety,
  Eco,
  Public,
  Security,
  Speed,
  Storage,
  Cloud,
  Psychology as PsychologyIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  HealthAndSafety as HealthIcon,
  Eco as EcoIcon,
  Public as PublicIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  Cloud as CloudIcon,
  AutoAwesome as AutoAwesomeIcon,
  Rocket as RocketIcon,
  Timeline as TimelineIcon2,
  Lightbulb as LightbulbIcon,
  TrendingUp as TrendingUpIcon,
  Science as ScienceIcon,
  Psychology as PsychologyIcon2,
  School as SchoolIcon2,
  Work as WorkIcon2,
  HealthAndSafety as HealthIcon2,
  Eco as EcoIcon2,
  Public as PublicIcon2,
  Security as SecurityIcon2,
  Speed as SpeedIcon2,
  Storage as StorageIcon2,
  Cloud as CloudIcon2,
  ExpandMore,
  CheckCircle,
  Warning,
  Error,
  Info,
  Settings,
  Refresh,
  CloudUpload,
  CloudDownload,
  Monitor,
  Analytics,
  TrendingDown,
  Memory,
  Storage as StorageIcon3,
  Api,
  BugReport,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Security as SecurityIcon3,
  Monitor as MonitorIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon2,
  TrendingDown as TrendingDownIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon4,
  Api as ApiIcon,
  BugReport as BugReportIcon,
  CheckCircle as CheckCircleIcon2,
  Warning as WarningIcon2,
  Error as ErrorIcon2,
  Info as InfoIcon2,
  Settings as SettingsIcon2,
  Refresh as RefreshIcon2,
  CloudUpload as CloudUploadIcon2,
  CloudDownload as CloudDownloadIcon2,
  Security as SecurityIcon4,
  Monitor as MonitorIcon2,
  Analytics as AnalyticsIcon2,
  TrendingUp as TrendingUpIcon3,
  TrendingDown as TrendingDownIcon2,
  Memory as MemoryIcon2,
  ExpandMore as ExpandMoreIcon,
  Hub,
  Group,
  Business,
  EmojiEvents,
  Star,
  Favorite,
  Share,
  Download,
  Upload,
  Code,
  Build,
  Create,
  Explore,
  Search,
  FilterList,
  Sort,
  ViewList,
  ViewModule,
  GridView,
  List as ListIcon,
  Apps,
  Dashboard as DashboardIcon,
  Assessment,
  BarChart,
  PieChart,
  ShowChart,
  Timeline as TimelineIcon3,
  TrendingUp as TrendingUpIcon4,
  TrendingDown as TrendingDownIcon3,
  TrendingFlat,
  Compare,
  CompareArrows,
  SwapHoriz,
  SwapVert,
  RotateLeft,
  RotateRight,
  Flip,
  Transform,
  Shuffle,
  Shuffle as ShuffleIcon,
  Shuffle as ShuffleIcon2,
  Shuffle as ShuffleIcon3,
  Shuffle as ShuffleIcon4,
  Shuffle as ShuffleIcon5,
  Shuffle as ShuffleIcon6,
  Shuffle as ShuffleIcon7,
  Shuffle as ShuffleIcon8,
  Shuffle as ShuffleIcon9,
  Shuffle as ShuffleIcon10,
} from '@mui/icons-material';

interface InnovationProject {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'planning' | 'development' | 'testing' | 'deployed' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  team: string[];
  technologies: string[];
  impact: string;
  timeline: string;
  budget: number;
  resources: string[];
}

interface EcosystemMetric {
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

interface CORBUInnovationEcosystemProps {
  children?: React.ReactNode;
}

const CORBUInnovationEcosystem: React.FC<CORBUInnovationEcosystemProps> = ({ children }) => {
  const [selectedProject, setSelectedProject] = useState<InnovationProject | null>(null);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('priority');

  const innovationProjects: InnovationProject[] = [
    {
      id: 'quantum-ai-v2',
      title: '양자 AI 시스템 2.0',
      description: '양자 컴퓨팅과 AI의 완전한 융합으로 계산 능력의 혁신적 향상',
      category: 'quantum',
      status: 'development',
      priority: 'critical',
      progress: 75,
      team: ['양자 AI 팀', '머신러닝 팀', '하드웨어 팀'],
      technologies: ['양자 AI', '양자 머신러닝', '양자 암호화', '양자 네트워킹'],
      impact: '현재 불가능한 복잡한 문제 해결 가능',
      timeline: '2025 Q2',
      budget: 5000000,
      resources: ['양자 컴퓨터', 'AI 모델', '연구 인력']
    },
    {
      id: 'agi-development',
      title: 'AGI (일반 인공지능) 개발',
      description: '인간 수준의 일반적인 지능을 가진 AI 시스템 개발',
      category: 'agi',
      status: 'planning',
      priority: 'critical',
      progress: 25,
      team: ['AGI 연구팀', '인지과학 팀', '윤리팀'],
      technologies: ['AGI', '자기 학습', '창의적 사고', '감정 인식'],
      impact: '인간과 동등한 수준의 지능적 능력',
      timeline: '2026 Q4',
      budget: 10000000,
      resources: ['고성능 컴퓨팅', '데이터셋', '연구 시설']
    },
    {
      id: 'bci-revolution',
      title: '뇌-컴퓨터 인터페이스 혁명',
      description: '뇌와 컴퓨터의 직접적인 연결을 통한 새로운 상호작용 방식',
      category: 'bci',
      status: 'planning',
      priority: 'high',
      progress: 15,
      team: ['신경과학 팀', '하드웨어 팀', '소프트웨어 팀'],
      technologies: ['BCI', '뇌파 해독', '생체 신호 처리', '신경 인터페이스'],
      impact: '생각만으로 모든 디지털 기기 제어 가능',
      timeline: '2027 Q3',
      budget: 8000000,
      resources: ['신경 인터페이스', '뇌파 분석기', '의료 장비']
    },
    {
      id: 'digital-immortality',
      title: '디지털 불멸성 프로젝트',
      description: '인간의 의식과 기억을 디지털 형태로 보존하는 기술',
      category: 'consciousness',
      status: 'planning',
      priority: 'medium',
      progress: 5,
      team: ['의식 연구팀', 'AI 팀', '윤리팀'],
      technologies: ['의식 업로드', '기억 보존', '디지털 자아', '가상 현실'],
      impact: '물리적 한계를 넘어선 새로운 형태의 존재',
      timeline: '2028 Q1',
      budget: 15000000,
      resources: ['의식 스캐너', '기억 저장소', '가상 환경']
    },
    {
      id: 'space-ai-network',
      title: '우주 AI 네트워크',
      description: '지구와 우주를 연결하는 AI 네트워크 구축',
      category: 'space',
      status: 'planning',
      priority: 'high',
      progress: 10,
      team: ['우주 기술팀', 'AI 네트워크 팀', '통신팀'],
      technologies: ['우주 AI', '위성 네트워크', '우주 탐사 AI', '행성 간 통신'],
      impact: '우주 탐사와 정착을 위한 AI 인프라',
      timeline: '2029 Q2',
      budget: 20000000,
      resources: ['위성', 'AI 시스템', '통신 장비']
    },
    {
      id: 'asi-development',
      title: '초지능 AI (ASI) 개발',
      description: '인간을 훨씬 능가하는 초지능 AI 시스템',
      category: 'asi',
      status: 'planning',
      priority: 'critical',
      progress: 2,
      team: ['ASI 연구팀', '안전성 팀', '윤리팀'],
      technologies: ['ASI', '초지능', '자기 개선', '창조적 혁신'],
      impact: '인류 문명의 새로운 단계 진입',
      timeline: '2030 Q4',
      budget: 50000000,
      resources: ['초고성능 컴퓨팅', '연구 시설', '안전 시스템']
    }
  ];

  const ecosystemMetrics: EcosystemMetric[] = [
    {
      name: '혁신 지수',
      value: 95,
      target: 100,
      unit: '%',
      trend: 'up',
      color: 'success.main'
    },
    {
      name: '연구 개발 투자',
      value: 85000000,
      target: 100000000,
      unit: 'USD',
      trend: 'up',
      color: 'primary.main'
    },
    {
      name: '특허 출원',
      value: 156,
      target: 200,
      unit: '건',
      trend: 'up',
      color: 'info.main'
    },
    {
      name: '연구팀 규모',
      value: 1250,
      target: 1500,
      unit: '명',
      trend: 'up',
      color: 'warning.main'
    },
    {
      name: '파트너십',
      value: 89,
      target: 100,
      unit: '개',
      trend: 'up',
      color: 'secondary.main'
    },
    {
      name: '성공률',
      value: 92,
      target: 95,
      unit: '%',
      trend: 'stable',
      color: 'success.main'
    }
  ];

  const innovationCategories = [
    { id: 'all', name: '전체', icon: <Apps /> },
    { id: 'quantum', name: '양자 기술', icon: <ScienceIcon /> },
    { id: 'agi', name: 'AGI', icon: <PsychologyIcon /> },
    { id: 'bci', name: 'BCI', icon: <HealthIcon /> },
    { id: 'consciousness', name: '의식 연구', icon: <LightbulbIcon /> },
    { id: 'space', name: '우주 기술', icon: <RocketIcon /> },
    { id: 'asi', name: 'ASI', icon: <AutoAwesomeIcon /> }
  ];

  const handleProjectClick = (project: InnovationProject) => {
    setSelectedProject(project);
    setShowProjectDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'info';
      case 'development': return 'primary';
      case 'testing': return 'warning';
      case 'deployed': return 'success';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planning': return '기획';
      case 'development': return '개발 중';
      case 'testing': return '테스트';
      case 'deployed': return '배포됨';
      case 'completed': return '완료';
      default: return '알 수 없음';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return '낮음';
      case 'medium': return '보통';
      case 'high': return '높음';
      case 'critical': return '긴급';
      default: return '알 수 없음';
    }
  };

  const filteredProjects = innovationProjects.filter(project => 
    filterCategory === 'all' || project.category === filterCategory
  );

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
      case 'progress':
        return b.progress - a.progress;
      case 'budget':
        return b.budget - a.budget;
      default:
        return 0;
    }
  });

  const quickActions = [
    {
      icon: <Add />, name: '새 프로젝트', action: () => {
        setSnackbarMessage('새 혁신 프로젝트 생성이 시작되었습니다.');
        setShowSnackbar(true);
      }
    },
    {
      icon: <AnalyticsIcon />, name: '성과 분석', action: () => {
        setSnackbarMessage('혁신 생태계 성과 분석이 실행되었습니다.');
        setShowSnackbar(true);
      }
    },
    {
      icon: <Group />, name: '팀 관리', action: () => {
        setSnackbarMessage('혁신 팀 관리 시스템이 활성화되었습니다.');
        setShowSnackbar(true);
      }
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Container maxWidth="xl">
        {/* 헤더 */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Hub sx={{ fontSize: 40, color: 'primary.main' }} />
            CORBU AI 혁신 생태계
          </Typography>
          <Typography variant="h6" color="text.secondary">
            지속적인 혁신과 발전을 통한 미래 기술 선도
          </Typography>
        </Box>

        {/* 생태계 지표 */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>혁신 생태계 지표</Typography>
            <Grid container spacing={3}>
              {ecosystemMetrics.map((metric) => (
                <Grid item xs={12} sm={6} md={4} key={metric.name}>
                  <Paper sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">{metric.name}</Typography>
                      <Typography variant="h4" color={metric.color as any}>
                        {metric.value.toLocaleString()}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      목표: {metric.target.toLocaleString()} {metric.unit}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(metric.value / metric.target) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        달성률: {((metric.value / metric.target) * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {metric.trend === 'up' ? '📈' : metric.trend === 'down' ? '📉' : '➡️'}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* 필터 및 정렬 */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography variant="h6">카테고리:</Typography>
              {innovationCategories.map((category) => (
                <Chip
                  key={category.id}
                  icon={category.icon}
                  label={category.name}
                  onClick={() => setFilterCategory(category.id)}
                  color={filterCategory === category.id ? 'primary' : 'default'}
                  variant={filterCategory === category.id ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
              <Typography variant="h6">정렬:</Typography>
              <FormControl size="small">
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="priority">우선순위</MenuItem>
                  <MenuItem value="progress">진행률</MenuItem>
                  <MenuItem value="budget">예산</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* 혁신 프로젝트 목록 */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>혁신 프로젝트</Typography>
            <Grid container spacing={3}>
              {sortedProjects.map((project) => (
                <Grid item xs={12} md={6} lg={4} key={project.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                    onClick={() => handleProjectClick(project)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                          {project.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip 
                            label={getStatusLabel(project.status)} 
                            size="small" 
                            color={getStatusColor(project.status) as any}
                          />
                          <Chip 
                            label={getPriorityLabel(project.priority)} 
                            size="small" 
                            color={getPriorityColor(project.priority) as any}
                          />
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {project.description}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          진행률: {project.progress}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={project.progress}
                          sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          예산: ${project.budget.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {project.timeline}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* 혁신 파트너십 */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>혁신 파트너십</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">학술 파트너십</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      MIT, Stanford, Oxford, Cambridge 등 세계 최고 대학들과의 연구 협력
                    </Typography>
                    <Button variant="contained" startIcon={<SchoolIcon />}>
                      파트너십 관리
                    </Button>
                  </AccordionDetails>
                </Accordion>
              </Grid>
              <Grid item xs={12} md={6}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">기업 파트너십</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Google, Microsoft, OpenAI, DeepMind 등과의 기술 협력
                    </Typography>
                    <Button variant="contained" startIcon={<Business />}>
                      협력 관리
                    </Button>
                  </AccordionDetails>
                </Accordion>
              </Grid>
              <Grid item xs={12} md={6}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">정부 협력</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      각국 정부와의 AI 정책 및 규제 협력
                    </Typography>
                    <Button variant="contained" startIcon={<PublicIcon />}>
                      정책 협력
                    </Button>
                  </AccordionDetails>
                </Accordion>
              </Grid>
              <Grid item xs={12} md={6}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">시민 사회 협력</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      NGO, 시민단체와의 AI 윤리 및 사회적 영향 연구
                    </Typography>
                    <Button variant="contained" startIcon={<Group />}>
                      사회 협력
                    </Button>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* SpeedDial */}
        <SpeedDial
          ariaLabel="혁신 생태계 도구"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
        >
          {quickActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.action}
            />
          ))}
        </SpeedDial>

        {/* 프로젝트 상세 다이얼로그 */}
        <Dialog
          open={showProjectDialog}
          onClose={() => setShowProjectDialog(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedProject && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6">{selectedProject.title}</Typography>
                  <Chip 
                    label={getStatusLabel(selectedProject.status)} 
                    color={getStatusColor(selectedProject.status) as any}
                  />
                  <Chip 
                    label={getPriorityLabel(selectedProject.priority)} 
                    color={getPriorityColor(selectedProject.priority) as any}
                  />
                </Box>
              </DialogTitle>
              <DialogContent>
                <Typography variant="body1" paragraph>
                  {selectedProject.description}
                </Typography>
                
                <Typography variant="h6" gutterBottom>팀 구성:</Typography>
                <Box sx={{ mb: 2 }}>
                  {selectedProject.team.map((member, index) => (
                    <Chip key={index} label={member} sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Box>

                <Typography variant="h6" gutterBottom>주요 기술:</Typography>
                <Box sx={{ mb: 2 }}>
                  {selectedProject.technologies.map((tech, index) => (
                    <Chip key={index} label={tech} sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Box>

                <Typography variant="h6" gutterBottom>사회적 영향:</Typography>
                <Typography variant="body2" paragraph>
                  {selectedProject.impact}
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      진행률: {selectedProject.progress}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={selectedProject.progress}
                      sx={{ height: 8, borderRadius: 4, mt: 1 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      예산: ${selectedProject.budget.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      타임라인: {selectedProject.timeline}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      카테고리: {selectedProject.category}
                    </Typography>
                  </Grid>
                </Grid>

                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>필요 자원:</Typography>
                <Box sx={{ mb: 2 }}>
                  {selectedProject.resources.map((resource, index) => (
                    <Chip key={index} label={resource} variant="outlined" sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setShowProjectDialog(false)}>닫기</Button>
                <Button variant="contained" onClick={() => setShowProjectDialog(false)}>
                  프로젝트 관리
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={showSnackbar}
          autoHideDuration={3000}
          onClose={() => setShowSnackbar(false)}
          message={snackbarMessage}
        />

        {/* 자식 컴포넌트 렌더링 */}
        {children}
      </Container>
    </Box>
  );
};

export default CORBUInnovationEcosystem;
