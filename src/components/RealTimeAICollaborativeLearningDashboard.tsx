import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  Tooltip,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Group,
  Chat,
  Lightbulb,
  Psychology,
  Analytics,
  Refresh,
  Fullscreen,
  FullscreenExit,
  Settings,
  PlayArrow,
  Pause,
  CheckCircle,
  Warning,
  Error,
  Info,
  ExpandMore,
  NetworkCheck,
  Hub,
  Schema,
  Speed,
  DataUsage,
  PieChart,
  BarChart,
  ScatterPlot,
  BubbleChart,
  ShowChart,
  TrendingUp,
  TrendingDown,
  Equalizer,
  Memory,
  Storage,
  Cloud,
  Code,
  Science,
  School,
  Business,
  Technology,
  Add,
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  FilterList,
  Sort,
  Download,
  Upload,
  Share,
  Link,
  Unlink,
  Message,
  QuestionAnswer,
  Feedback,
  Resource,
  Vote,
  Action,
  ThumbUp,
  ThumbDown,
  Check,
  Close,
  Help,
  EmojiEmotions,
  SentimentSatisfied,
  SentimentDissatisfied,
  SentimentNeutral
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, BubbleChart as RechartsBubbleChart, Bubble } from 'recharts';

// Mock data for demonstration
const mockMetrics = {
  totalSessions: 12,
  activeSessions: 8,
  totalParticipants: 45,
  averageSessionDuration: 85,
  collaborationEffectiveness: 0.847,
  groupIntelligenceScore: 0.891,
  knowledgeSharingRate: 0.756,
  innovationIndex: 0.823,
  participantEngagement: 0.789,
  aiAssistanceEffectiveness: 0.856
};

const mockCollaborativeSessions = [
  {
    id: 'session-001',
    name: 'AI 기술 브레인스토밍',
    description: '최신 AI 기술 트렌드와 응용 방안에 대한 그룹 브레인스토밍',
    session_type: 'brainstorming',
    participants: ['user-001', 'user-002', 'user-003'],
    facilitators: ['user-001'],
    status: 'active',
    created_at: new Date(Date.now() - 3600000),
    started_at: new Date(Date.now() - 3000000),
    settings: {
      max_participants: 10,
      session_duration: 120,
      collaboration_mode: 'synchronous',
      privacy_level: 'public',
      recording_enabled: true,
      ai_assistance_level: 'high'
    }
  },
  {
    id: 'session-002',
    name: '프로젝트 문제 해결',
    description: '현재 진행 중인 프로젝트의 기술적 문제 해결을 위한 협업 세션',
    session_type: 'problem_solving',
    participants: ['user-002', 'user-004', 'user-005'],
    facilitators: ['user-002'],
    status: 'active',
    created_at: new Date(Date.now() - 7200000),
    started_at: new Date(Date.now() - 6000000),
    settings: {
      max_participants: 8,
      session_duration: 90,
      collaboration_mode: 'hybrid',
      privacy_level: 'private',
      recording_enabled: false,
      ai_assistance_level: 'moderate'
    }
  }
];

const mockInteractions = [
  {
    id: 'interaction-001',
    session_id: 'session-001',
    user_id: 'user-001',
    interaction_type: 'message',
    content: '안녕하세요! 오늘 AI 기술에 대해 어떤 주제로 논의해볼까요?',
    metadata: { message_type: 'greeting' },
    timestamp: new Date(Date.now() - 3500000),
    reactions: [
      {
        user_id: 'user-002',
        reaction_type: 'like',
        timestamp: new Date(Date.now() - 3490000)
      }
    ],
    ai_analysis: {
      sentiment: 'positive',
      relevance_score: 0.9,
      contribution_quality: 0.8,
      collaboration_impact: 0.7,
      suggested_responses: [
        '머신러닝의 최신 발전 동향에 대해 이야기해보는 건 어떨까요?',
        'AI 윤리와 책임에 대한 논의도 흥미로울 것 같습니다.'
      ],
      insights: ['긍정적인 분위기로 세션을 시작했습니다.']
    }
  },
  {
    id: 'interaction-002',
    session_id: 'session-001',
    user_id: 'user-002',
    interaction_type: 'idea',
    content: 'AI를 활용한 자동화 시스템을 구축하는 것에 대해 논의해보는 건 어떨까요?',
    metadata: { idea_category: 'automation' },
    timestamp: new Date(Date.now() - 3000000),
    reactions: [
      {
        user_id: 'user-001',
        reaction_type: 'excited',
        timestamp: new Date(Date.now() - 2990000)
      },
      {
        user_id: 'user-003',
        reaction_type: 'helpful',
        timestamp: new Date(Date.now() - 2980000)
      }
    ],
    ai_analysis: {
      sentiment: 'positive',
      relevance_score: 0.95,
      contribution_quality: 0.9,
      collaboration_impact: 0.85,
      suggested_responses: [
        '좋은 아이디어네요! 어떤 분야의 자동화를 구상하고 계신가요?',
        '이 아이디어의 실현 가능성에 대해 더 자세히 논의해보겠습니다.'
      ],
      insights: ['창의적인 아이디어가 그룹의 관심을 끌고 있습니다.']
    }
  }
];

const mockPatterns = [
  {
    id: 'pattern-001',
    session_id: 'session-001',
    pattern_type: 'communication',
    participants: ['user-001', 'user-002', 'user-003'],
    frequency: 15,
    effectiveness: 0.85,
    description: '그룹 내 활발한 의사소통이 이루어지고 있습니다.',
    examples: ['안녕하세요! 오늘 AI 기술에 대해 어떤 주제로 논의해볼까요?', '좋은 아이디어네요!'],
    recommendations: ['의사소통의 질을 더욱 향상시키기 위해 구체적인 피드백을 제공해보세요.'],
    created_at: new Date(Date.now() - 1800000)
  },
  {
    id: 'pattern-002',
    session_id: 'session-001',
    pattern_type: 'idea_generation',
    participants: ['user-001', 'user-002'],
    frequency: 8,
    effectiveness: 0.92,
    description: '다양한 참가자로부터 창의적인 아이디어가 생성되고 있습니다.',
    examples: ['AI를 활용한 자동화 시스템을 구축하는 것에 대해 논의해보는 건 어떨까요?'],
    recommendations: ['아이디어를 더욱 발전시키기 위해 구체적인 실행 방안을 논의해보세요.'],
    created_at: new Date(Date.now() - 1200000)
  }
];

const mockGroupIntelligence = {
  id: 'gi-session-001',
  session_id: 'session-001',
  collective_knowledge: {
    'AI': 0.8,
    'Machine Learning': 0.7,
    'Deep Learning': 0.6,
    'Natural Language Processing': 0.5
  },
  shared_understanding: 0.75,
  group_cohesion: 0.8,
  decision_quality: 0.7,
  innovation_potential: 0.8,
  collaboration_efficiency: 0.75,
  insights: ['그룹이 AI 기술에 대한 높은 관심을 보이고 있습니다.'],
  recommendations: ['더 구체적인 AI 응용 사례를 논의해보세요.'],
  updated_at: new Date()
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff69b4', '#4169e1', '#32cd32', '#ff4500', '#9370db'];

const RealTimeAICollaborativeLearningDashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [metrics, setMetrics] = useState(mockMetrics);
  const [collaborativeSessions, setCollaborativeSessions] = useState(mockCollaborativeSessions);
  const [interactions, setInteractions] = useState(mockInteractions);
  const [patterns, setPatterns] = useState(mockPatterns);
  const [groupIntelligence, setGroupIntelligence] = useState(mockGroupIntelligence);
  const [newSessionDialogOpen, setNewSessionDialogOpen] = useState(false);
  const [newSession, setNewSession] = useState({
    name: '',
    description: '',
    session_type: 'brainstorming',
    participants: [],
    facilitators: [],
    settings: {
      max_participants: 10,
      session_duration: 120,
      collaboration_mode: 'synchronous',
      privacy_level: 'public',
      recording_enabled: true,
      ai_assistance_level: 'high'
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // 실시간 데이터 업데이트
      setMetrics(prev => ({
        ...prev,
        activeSessions: prev.activeSessions + (Math.random() > 0.9 ? 1 : 0),
        totalParticipants: prev.totalParticipants + (Math.random() > 0.9 ? 1 : 0),
        collaborationEffectiveness: Math.min(1, Math.max(0, prev.collaborationEffectiveness + (Math.random() - 0.5) * 0.02)),
        groupIntelligenceScore: Math.min(1, Math.max(0, prev.groupIntelligenceScore + (Math.random() - 0.5) * 0.01))
      }));
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleSessionClick = (session: any) => {
    setSelectedSession(session);
    setSessionDialogOpen(true);
  };

  const handleCreateSession = () => {
    const session = {
      id: `session-${Date.now()}`,
      ...newSession,
      status: 'planning',
      created_at: new Date()
    };

    setCollaborativeSessions(prev => [session, ...prev]);
    setNewSessionDialogOpen(false);
    setNewSession({
      name: '',
      description: '',
      session_type: 'brainstorming',
      participants: [],
      facilitators: [],
      settings: {
        max_participants: 10,
        session_duration: 120,
        collaboration_mode: 'synchronous',
        privacy_level: 'public',
        recording_enabled: true,
        ai_assistance_level: 'high'
      }
    });
  };

  const getSessionTypeColor = (sessionType: string) => {
    switch (sessionType) {
      case 'brainstorming': return 'primary';
      case 'problem_solving': return 'success';
      case 'knowledge_sharing': return 'warning';
      case 'project_collaboration': return 'info';
      case 'peer_review': return 'secondary';
      case 'group_discussion': return 'error';
      default: return 'default';
    }
  };

  const getSessionTypeIcon = (sessionType: string) => {
    switch (sessionType) {
      case 'brainstorming': return <Lightbulb />;
      case 'problem_solving': return <Psychology />;
      case 'knowledge_sharing': return <School />;
      case 'project_collaboration': return <Group />;
      case 'peer_review': return <Feedback />;
      case 'group_discussion': return <Chat />;
      default: return <Group />;
    }
  };

  const getInteractionTypeColor = (interactionType: string) => {
    switch (interactionType) {
      case 'message': return 'primary';
      case 'idea': return 'success';
      case 'question': return 'warning';
      case 'feedback': return 'info';
      case 'resource': return 'secondary';
      case 'vote': return 'error';
      case 'action': return 'default';
      default: return 'default';
    }
  };

  const getInteractionTypeIcon = (interactionType: string) => {
    switch (interactionType) {
      case 'message': return <Message />;
      case 'idea': return <Lightbulb />;
      case 'question': return <QuestionAnswer />;
      case 'feedback': return <Feedback />;
      case 'resource': return <Resource />;
      case 'vote': return <Vote />;
      case 'action': return <Action />;
      default: return <Message />;
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <SentimentSatisfied color="success" />;
      case 'negative': return <SentimentDissatisfied color="error" />;
      case 'neutral': return <SentimentNeutral color="action" />;
      default: return <SentimentNeutral />;
    }
  };

  const renderOverviewTab = () => (
    <Box>
      <Grid container spacing={3}>
        {/* 시스템 상태 카드 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                협업 학습 시스템 상태
              </Typography>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Chip
                  label="정상 운영"
                  color="success"
                  icon={<CheckCircle />}
                />
                <Typography variant="body2" color="textSecondary">
                  마지막 업데이트: {new Date().toLocaleTimeString()}
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">활성 세션</Typography>
                  <Typography variant="h4">{metrics.activeSessions}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">총 참가자</Typography>
                  <Typography variant="h4">{metrics.totalParticipants}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">협업 효과성</Typography>
                  <Typography variant="h4">{(metrics.collaborationEffectiveness * 100).toFixed(1)}%</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">그룹 인텔리전스</Typography>
                  <Typography variant="h4">{(metrics.groupIntelligenceScore * 100).toFixed(1)}%</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 협업 메트릭 차트 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                협업 성능 현황
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={[
                  {
                    metric: '협업 효과성',
                    current: metrics.collaborationEffectiveness * 100,
                    target: 85
                  },
                  {
                    metric: '그룹 인텔리전스',
                    current: metrics.groupIntelligenceScore * 100,
                    target: 90
                  },
                  {
                    metric: '지식 공유율',
                    current: metrics.knowledgeSharingRate * 100,
                    target: 80
                  },
                  {
                    metric: '혁신 지수',
                    current: metrics.innovationIndex * 100,
                    target: 85
                  },
                  {
                    metric: '참가자 참여도',
                    current: metrics.participantEngagement * 100,
                    target: 90
                  },
                  {
                    metric: 'AI 지원 효과성',
                    current: metrics.aiAssistanceEffectiveness * 100,
                    target: 85
                  }
                ]}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="현재 성능" dataKey="current" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Radar name="목표 성능" dataKey="target" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                  <RechartsTooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* 협업 세션 목록 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  협업 세션 목록
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  onClick={() => setNewSessionDialogOpen(true)}
                >
                  새 세션 생성
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>세션 이름</TableCell>
                      <TableCell>타입</TableCell>
                      <TableCell>참가자 수</TableCell>
                      <TableCell>상태</TableCell>
                      <TableCell>AI 지원 수준</TableCell>
                      <TableCell>협업 모드</TableCell>
                      <TableCell>생성 시간</TableCell>
                      <TableCell>작업</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {collaborativeSessions.map((session) => (
                      <TableRow key={session.id} hover onClick={() => handleSessionClick(session)} style={{ cursor: 'pointer' }}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Group color="primary" />
                            <Typography variant="body2">{session.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={session.session_type}
                            size="small"
                            color={getSessionTypeColor(session.session_type)}
                            icon={getSessionTypeIcon(session.session_type)}
                          />
                        </TableCell>
                        <TableCell>
                          <Badge badgeContent={session.participants.length} color="primary">
                            <Avatar sx={{ width: 24, height: 24 }}>
                              <Group fontSize="small" />
                            </Avatar>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={session.status}
                            size="small"
                            color={session.status === 'active' ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <LinearProgress
                            variant="determinate"
                            value={session.settings.ai_assistance_level === 'high' ? 100 :
                              session.settings.ai_assistance_level === 'moderate' ? 66 :
                                session.settings.ai_assistance_level === 'minimal' ? 33 : 0}
                            sx={{ width: 100, height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {session.settings.ai_assistance_level}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={session.settings.collaboration_mode}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {session.created_at.toLocaleTimeString()}
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <IconButton size="small" color="primary">
                              <PlayArrow />
                            </IconButton>
                            <IconButton size="small" color="secondary">
                              <Visibility />
                            </IconButton>
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
      </Grid>
    </Box>
  );

  const renderInteractionsTab = () => (
    <Box>
      <Grid container spacing={3}>
        {/* 상호작용 분석 */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                실시간 상호작용
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                {interactions.map((interaction) => (
                  <Paper key={interaction.id} sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={interaction.interaction_type}
                          color={getInteractionTypeColor(interaction.interaction_type)}
                          icon={getInteractionTypeIcon(interaction.interaction_type)}
                          size="small"
                        />
                        <Typography variant="subtitle2">
                          {interaction.user_id}
                        </Typography>
                        {interaction.ai_analysis && getSentimentIcon(interaction.ai_analysis.sentiment)}
                      </Box>
                      <Typography variant="body2" color="textSecondary">
                        {interaction.timestamp.toLocaleTimeString()}
                      </Typography>
                    </Box>

                    <Typography variant="body2" paragraph>
                      {interaction.content}
                    </Typography>

                    {interaction.ai_analysis && (
                      <Box display="flex" gap={2} mb={1}>
                        <Chip
                          label={`관련성: ${(interaction.ai_analysis.relevance_score * 100).toFixed(0)}%`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`품질: ${(interaction.ai_analysis.contribution_quality * 100).toFixed(0)}%`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`영향도: ${(interaction.ai_analysis.collaboration_impact * 100).toFixed(0)}%`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    )}

                    {interaction.reactions.length > 0 && (
                      <Box display="flex" gap={1} mb={1}>
                        {interaction.reactions.map((reaction, index) => (
                          <Chip
                            key={index}
                            label={reaction.reaction_type}
                            size="small"
                            icon={reaction.reaction_type === 'like' ? <ThumbUp /> :
                              reaction.reaction_type === 'dislike' ? <ThumbDown /> :
                                reaction.reaction_type === 'helpful' ? <Check /> : <EmojiEmotions />}
                          />
                        ))}
                      </Box>
                    )}

                    {interaction.ai_analysis?.insights && (
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Typography variant="subtitle2">AI 인사이트</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <List dense>
                            {interaction.ai_analysis.insights.map((insight, index) => (
                              <ListItem key={index}>
                                <ListItemIcon>
                                  <Info color="info" />
                                </ListItemIcon>
                                <ListItemText primary={insight} />
                              </ListItem>
                            ))}
                          </List>
                        </AccordionDetails>
                      </Accordion>
                    )}
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 상호작용 통계 */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                상호작용 통계
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: '메시지', value: interactions.filter(i => i.interaction_type === 'message').length },
                      { name: '아이디어', value: interactions.filter(i => i.interaction_type === 'idea').length },
                      { name: '질문', value: interactions.filter(i => i.interaction_type === 'question').length },
                      { name: '피드백', value: interactions.filter(i => i.interaction_type === 'feedback').length },
                      { name: '리소스', value: interactions.filter(i => i.interaction_type === 'resource').length }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderGroupIntelligenceTab = () => (
    <Box>
      <Grid container spacing={3}>
        {/* 그룹 인텔리전스 개요 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                그룹 인텔리전스 현황
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">공유 이해도</Typography>
                  <Typography variant="h4" color="primary">
                    {(groupIntelligence.shared_understanding * 100).toFixed(1)}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">그룹 응집력</Typography>
                  <Typography variant="h4" color="success">
                    {(groupIntelligence.group_cohesion * 100).toFixed(1)}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">의사결정 품질</Typography>
                  <Typography variant="h4" color="warning">
                    {(groupIntelligence.decision_quality * 100).toFixed(1)}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">혁신 잠재력</Typography>
                  <Typography variant="h4" color="info">
                    {(groupIntelligence.innovation_potential * 100).toFixed(1)}%
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">협업 효율성</Typography>
                  <Typography variant="h4" color="secondary">
                    {(groupIntelligence.collaboration_efficiency * 100).toFixed(1)}%
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 집단 지식 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                집단 지식 분포
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                {Object.entries(groupIntelligence.collective_knowledge).map(([topic, confidence]) => (
                  <Box key={topic}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2">{topic}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {(confidence * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={confidence * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* AI 인사이트 및 추천사항 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                AI 인사이트 및 추천사항
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    인사이트
                  </Typography>
                  <List>
                    {groupIntelligence.insights.map((insight, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Info color="info" />
                        </ListItemIcon>
                        <ListItemText primary={insight} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    추천사항
                  </Typography>
                  <List>
                    {groupIntelligence.recommendations.map((recommendation, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Lightbulb color="warning" />
                        </ListItemIcon>
                        <ListItemText primary={recommendation} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderPatternsTab = () => (
    <Box>
      <Grid container spacing={3}>
        {patterns.map((pattern) => (
          <Grid item xs={12} md={6} key={pattern.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    {pattern.pattern_type} 패턴
                  </Typography>
                  <Chip
                    label={`${(pattern.effectiveness * 100).toFixed(0)}점`}
                    color="primary"
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="textSecondary" paragraph>
                  {pattern.description}
                </Typography>

                <Box display="flex" gap={1} mb={2}>
                  <Chip
                    label={pattern.pattern_type}
                    size="small"
                    color="primary"
                  />
                  <Chip
                    label={`${pattern.participants.length} 참가자`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={`빈도: ${pattern.frequency}`}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle2">패턴 세부사항</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        <strong>효과성:</strong> {(pattern.effectiveness * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>예시:</strong>
                      </Typography>
                      <Box display="flex" flexDirection="column" gap={1}>
                        {pattern.examples.map((example, index) => (
                          <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                            • {example}
                          </Typography>
                        ))}
                      </Box>
                      <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
                        <strong>추천사항:</strong>
                      </Typography>
                      <Box display="flex" flexDirection="column" gap={1">
                      {pattern.recommendations.map((recommendation, index) => (
                        <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                          • {recommendation}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                <Typography variant="body2" color="textSecondary">
                  {pattern.created_at.toLocaleTimeString()}
                </Typography>
                <Box display="flex" gap={1}>
                  <IconButton size="small" color="primary">
                    <Analytics />
                  </IconButton>
                  <IconButton size="small" color="secondary">
                    <Visibility />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
          </Grid>
        ))}

      {/* 패턴 분석 차트 */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              패턴 분석
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={patterns.map(pattern => ({
                pattern: pattern.pattern_type,
                effectiveness: pattern.effectiveness * 100,
                frequency: pattern.frequency,
                participants: pattern.participants.length
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="pattern" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="effectiveness" fill="#8884d8" name="효과성 (%)" />
                <Bar dataKey="frequency" fill="#82ca9d" name="빈도" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
    </Box >
  );

const renderSettingsTab = () => (
  <Box>
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              시스템 설정
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Button variant="contained" color="primary" startIcon={<Refresh />}>
                협업 학습 엔진 재시작
              </Button>
              <Button variant="outlined" color="secondary" startIcon={<Analytics />}>
                그룹 인텔리전스 분석 실행
              </Button>
              <Button variant="outlined" color="info" startIcon={<Psychology />}>
                패턴 분석 엔진 재훈련
              </Button>
              <Button variant="outlined" color="warning" startIcon={<Settings />}>
                고급 설정
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              시스템 상태
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Alert severity="success">
                협업 학습 시스템이 정상적으로 작동 중입니다.
              </Alert>
              <Alert severity="info">
                실시간 상호작용 분석이 활성화되어 있습니다.
              </Alert>
              <Alert severity="warning">
                일부 세션의 그룹 인텔리전스가 업데이트되었습니다.
              </Alert>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

return (
  <Box sx={{ p: 3, height: '100vh', overflow: 'auto' }}>
    {/* 헤더 */}
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
      <Box>
        <Typography variant="h4" gutterBottom>
          🤝 실시간 AI 협업 학습 대시보드
        </Typography>
        <Typography variant="body1" color="textSecondary">
          다중 사용자 협업 학습, 그룹 인텔리전스 및 협업 패턴 분석
        </Typography>
      </Box>
      <Box display="flex" gap={1}>
        <Tooltip title="새로고침">
          <IconButton>
            <Refresh />
          </IconButton>
        </Tooltip>
        <Tooltip title={isFullscreen ? "전체화면 해제" : "전체화면"}>
          <IconButton onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>

    {/* 탭 네비게이션 */}
    <Paper sx={{ mb: 3 }}>
      <Tabs value={currentTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
        <Tab icon={<Group />} label="개요" />
        <Tab icon={<Chat />} label="상호작용" />
        <Tab icon={<Psychology />} label="그룹 인텔리전스" />
        <Tab icon={<Analytics />} label="패턴 분석" />
        <Tab icon={<Settings />} label="설정" />
      </Tabs>
    </Paper>

    {/* 탭 콘텐츠 */}
    <Box>
      {currentTab === 0 && renderOverviewTab()}
      {currentTab === 1 && renderInteractionsTab()}
      {currentTab === 2 && renderGroupIntelligenceTab()}
      {currentTab === 3 && renderPatternsTab()}
      {currentTab === 4 && renderSettingsTab()}
    </Box>

    {/* 협업 세션 상세 다이얼로그 */}
    <Dialog open={sessionDialogOpen} onClose={() => setSessionDialogOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        협업 세션 상세 정보: {selectedSession?.name}
      </DialogTitle>
      <DialogContent>
        {selectedSession && (
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2">세션 타입</Typography>
                <Chip label={selectedSession.session_type} color="primary" />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">상태</Typography>
                <Chip label={selectedSession.status} color={selectedSession.status === 'active' ? 'success' : 'default'} />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">참가자 수</Typography>
                <Typography variant="body2">{selectedSession.participants.length}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">AI 지원 수준</Typography>
                <Typography variant="body2">{selectedSession.settings.ai_assistance_level}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">설명</Typography>
                <Typography variant="body2">{selectedSession.description}</Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setSessionDialogOpen(false)}>닫기</Button>
        <Button variant="contained" color="primary">세션 참여</Button>
      </DialogActions>
    </Dialog>

    {/* 새 세션 생성 다이얼로그 */}
    <Dialog open={newSessionDialogOpen} onClose={() => setNewSessionDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        새 협업 세션 생성
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            fullWidth
            label="세션 이름"
            value={newSession.name}
            onChange={(e) => setNewSession(prev => ({ ...prev, name: e.target.value }))}
          />
          <TextField
            fullWidth
            label="설명"
            value={newSession.description}
            onChange={(e) => setNewSession(prev => ({ ...prev, description: e.target.value }))}
            multiline
            rows={3}
          />
          <FormControl fullWidth>
            <InputLabel>세션 타입</InputLabel>
            <Select
              value={newSession.session_type}
              onChange={(e) => setNewSession(prev => ({ ...prev, session_type: e.target.value }))}
              label="세션 타입"
            >
              <MenuItem value="brainstorming">브레인스토밍</MenuItem>
              <MenuItem value="problem_solving">문제 해결</MenuItem>
              <MenuItem value="knowledge_sharing">지식 공유</MenuItem>
              <MenuItem value="project_collaboration">프로젝트 협업</MenuItem>
              <MenuItem value="peer_review">동료 검토</MenuItem>
              <MenuItem value="group_discussion">그룹 토론</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>AI 지원 수준</InputLabel>
            <Select
              value={newSession.settings.ai_assistance_level}
              onChange={(e) => setNewSession(prev => ({
                ...prev,
                settings: { ...prev.settings, ai_assistance_level: e.target.value }
              }))}
              label="AI 지원 수준"
            >
              <MenuItem value="minimal">최소</MenuItem>
              <MenuItem value="moderate">보통</MenuItem>
              <MenuItem value="high">높음</MenuItem>
              <MenuItem value="full">전체</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setNewSessionDialogOpen(false)}>취소</Button>
        <Button variant="contained" color="primary" onClick={handleCreateSession}>
          세션 생성
        </Button>
      </DialogActions>
    </Dialog>
  </Box>
);
};

export default RealTimeAICollaborativeLearningDashboard;
