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
    Avatar,
    Rating,
    CardHeader,
    CardActions
} from '@mui/material';
import {
    Home,
    People,
    Chat,
    TrendingUp,
    TrendingDown,
    TrendingFlat,
    SentimentSatisfied,
    SentimentDissatisfied,
    SentimentNeutral,
    Psychology,
    Analytics,
    Assessment,
    Visibility,
    ExpandMore,
    PlayArrow,
    Stop,
    Pause,
    Refresh,
    Settings,
    AutoFixHigh,
    SmartToy,
    Article,
    Timeline,
    BarChart,
    PieChart,
    LineChart,
    FilterList,
    Search,
    Add,
    Edit,
    Delete,
    Share,
    Download,
    Upload,
    Notifications,
    Warning,
    CheckCircle,
    Error,
    Info,
    Help,
    Book,
    School,
    Work,
    FamilyRestroom,
    Elderly,
    ChildCare,
    Pets,
    CarRental,
    LocalParking,
    LocalHospital,
    School as SchoolIcon,
    ShoppingCart,
    Restaurant,
    LocalGroceryStore,
    DirectionsBus,
    DirectionsSubway,
    DirectionsCar,
    LocalTaxi,
    BikeScooter,
    DirectionsWalk,
    Security,
    CleaningServices,
    Event,
    Fullscreen,
    FullscreenExit
} from '@mui/icons-material';

interface CommunityMember {
    id: string;
    name: string;
    age: number;
    familyType: 'single' | 'couple' | 'family' | 'elderly';
    occupation: string;
    interests: string[];
    activityLevel: 'high' | 'medium' | 'low';
    sentiment: 'positive' | 'negative' | 'neutral';
    joinDate: Date;
    postCount: number;
    commentCount: number;
    influenceScore: number;
    avatar?: string;
}

interface CommunityPost {
    id: string;
    title: string;
    content: string;
    author: string;
    category: 'general' | 'complaint' | 'suggestion' | 'announcement' | 'question' | 'event';
    sentiment: 'positive' | 'negative' | 'neutral';
    likes: number;
    dislikes: number;
    comments: CommunityComment[];
    createdAt: Date;
    tags: string[];
    priority: 'high' | 'medium' | 'low';
    status: 'active' | 'resolved' | 'closed';
}

interface CommunityComment {
    id: string;
    content: string;
    author: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    likes: number;
    dislikes: number;
    createdAt: Date;
    parentId?: string;
    replies: CommunityComment[];
}

interface SentimentAnalysis {
    positive: number;
    negative: number;
    neutral: number;
    total: number;
    trend: 'improving' | 'declining' | 'stable';
}

interface TopicAnalysis {
    topic: string;
    frequency: number;
    sentiment: SentimentAnalysis;
    keywords: string[];
    relatedPosts: string[];
}

interface CommunityMetrics {
    totalMembers: number;
    activeMembers: number;
    totalPosts: number;
    totalComments: number;
    averageSentiment: number;
    engagementRate: number;
    responseTime: number;
    satisfactionScore: number;
}

interface ResponseTemplate {
    id: string;
    title: string;
    content: string;
    category: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    effectiveness: number;
    usageCount: number;
    tags: string[];
}

const ApartmentCommunityAnalysisDashboard: React.FC = () => {
    const [members, setMembers] = useState<CommunityMember[]>([]);
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [selectedTab, setSelectedTab] = useState(0);
    const [fullscreen, setFullscreen] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
    const [postDialogOpen, setPostDialogOpen] = useState(false);
    const [responseTemplates, setResponseTemplates] = useState<ResponseTemplate[]>([]);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    // 탭 정의
    const tabs = [
        { label: '커뮤니티 개요', icon: <Home /> },
        { label: '입주민 분석', icon: <People /> },
        { label: '게시글 분석', icon: <Article /> },
        { label: '감정 분석', icon: <Psychology /> },
        { label: '주제 분석', icon: <Analytics /> },
        { label: '대응 템플릿', icon: <AutoFixHigh /> },
        { label: '설정', icon: <Settings /> }
    ];

    // 데이터 새로고침
    const refreshData = async () => {
        try {
            // 실제로는 API 호출
            const mockMembers: CommunityMember[] = [
                {
                    id: 'member-1',
                    name: '김철수',
                    age: 35,
                    familyType: 'family',
                    occupation: '회사원',
                    interests: ['운동', '독서', '가족여행'],
                    activityLevel: 'high',
                    sentiment: 'positive',
                    joinDate: new Date('2023-01-15'),
                    postCount: 25,
                    commentCount: 89,
                    influenceScore: 0.85
                },
                {
                    id: 'member-2',
                    name: '이영희',
                    age: 28,
                    familyType: 'couple',
                    occupation: '디자이너',
                    interests: ['요리', '영화', '쇼핑'],
                    activityLevel: 'medium',
                    sentiment: 'neutral',
                    joinDate: new Date('2023-03-20'),
                    postCount: 12,
                    commentCount: 45,
                    influenceScore: 0.62
                },
                {
                    id: 'member-3',
                    name: '박노인',
                    age: 72,
                    familyType: 'elderly',
                    occupation: '은퇴',
                    interests: ['정원가꾸기', '바둑', '신문'],
                    activityLevel: 'low',
                    sentiment: 'negative',
                    joinDate: new Date('2022-11-10'),
                    postCount: 8,
                    commentCount: 23,
                    influenceScore: 0.45
                }
            ];

            const mockPosts: CommunityPost[] = [
                {
                    id: 'post-1',
                    title: '엘리베이터 고장 관련 문의',
                    content: '오늘 아침부터 1동 엘리베이터가 고장나서 사용할 수 없습니다. 언제 수리가 완료될 예정인가요?',
                    author: '김철수',
                    category: 'complaint',
                    sentiment: 'negative',
                    likes: 15,
                    dislikes: 2,
                    comments: [
                        {
                            id: 'comment-1',
                            content: '저도 같은 문제로 불편을 겪고 있습니다. 빠른 수리 부탁드립니다.',
                            author: '이영희',
                            sentiment: 'negative',
                            likes: 8,
                            dislikes: 0,
                            createdAt: new Date(Date.now() - 3600000)
                        }
                    ],
                    createdAt: new Date(Date.now() - 7200000),
                    tags: ['엘리베이터', '고장', '수리'],
                    priority: 'high',
                    status: 'active'
                },
                {
                    id: 'post-2',
                    title: '주차장 개선 제안',
                    content: '주차장에 LED 조명을 설치하면 밤에 더 안전할 것 같습니다. 검토해주시기 바랍니다.',
                    author: '김철수',
                    category: 'suggestion',
                    sentiment: 'positive',
                    likes: 23,
                    dislikes: 1,
                    comments: [],
                    createdAt: new Date(Date.now() - 86400000),
                    tags: ['주차장', '조명', '안전'],
                    priority: 'medium',
                    status: 'active'
                }
            ];

            const mockResponseTemplates: ResponseTemplate[] = [
                {
                    id: 'template-1',
                    title: '엘리베이터 고장 대응',
                    content: '안녕하세요. 엘리베이터 고장으로 불편을 드려 죄송합니다. 현재 수리업체와 협의 중이며, 최대한 빠른 시일 내에 수리 완료하겠습니다. 임시로 다른 엘리베이터를 이용해 주시기 바랍니다.',
                    category: 'complaint',
                    sentiment: 'positive',
                    effectiveness: 0.92,
                    usageCount: 15,
                    tags: ['엘리베이터', '고장', '수리']
                },
                {
                    id: 'template-2',
                    title: '제안사항 검토 안내',
                    content: '좋은 제안 감사합니다. 검토 후 결과를 알려드리겠습니다. 입주민 여러분의 의견은 항상 소중합니다.',
                    category: 'suggestion',
                    sentiment: 'positive',
                    effectiveness: 0.88,
                    usageCount: 8,
                    tags: ['제안', '검토', '의견']
                }
            ];

            setMembers(mockMembers);
            setPosts(mockPosts);
            setResponseTemplates(mockResponseTemplates);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('데이터 새로고침 오류:', error);
        }
    };

    useEffect(() => {
        refreshData();

        if (autoRefresh) {
            const interval = setInterval(refreshData, 30000); // 30초마다 새로고침
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return 'success';
            case 'negative': return 'error';
            case 'neutral': return 'warning';
            default: return 'default';
        }
    };

    const getSentimentIcon = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return <SentimentSatisfied />;
            case 'negative': return <SentimentDissatisfied />;
            case 'neutral': return <SentimentNeutral />;
            default: return <SentimentNeutral />;
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'complaint': return <Warning />;
            case 'suggestion': return <AutoFixHigh />;
            case 'announcement': return <Info />;
            case 'question': return <Help />;
            case 'event': return <Event />;
            default: return <Article />;
        }
    };

    const renderCommunityOverview = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <People color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">총 입주민</Typography>
                        </Box>
                        <Typography variant="h4" color="primary">1,247</Typography>
                        <Typography variant="body2" color="textSecondary">
                            전월 대비 +12명
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Chat color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">활성 게시글</Typography>
                        </Box>
                        <Typography variant="h4" color="primary">89</Typography>
                        <Typography variant="body2" color="textSecondary">
                            이번 주 +15개
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <TrendingUp color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">만족도</Typography>
                        </Box>
                        <Typography variant="h4" color="primary">4.2</Typography>
                        <Rating value={4.2} readOnly precision={0.1} />
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Analytics color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">응답률</Typography>
                        </Box>
                        <Typography variant="h4" color="primary">94%</Typography>
                        <Typography variant="body2" color="textSecondary">
                            평균 2.3시간 내
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>감정 분포</Typography>
                        <Box display="flex" justifyContent="space-around" alignItems="center">
                            <Box textAlign="center">
                                <SentimentSatisfied color="success" sx={{ fontSize: 48 }} />
                                <Typography variant="h6" color="success.main">65%</Typography>
                                <Typography variant="body2">긍정적</Typography>
                            </Box>
                            <Box textAlign="center">
                                <SentimentNeutral color="warning" sx={{ fontSize: 48 }} />
                                <Typography variant="h6" color="warning.main">25%</Typography>
                                <Typography variant="body2">중립적</Typography>
                            </Box>
                            <Box textAlign="center">
                                <SentimentDissatisfied color="error" sx={{ fontSize: 48 }} />
                                <Typography variant="h6" color="error.main">10%</Typography>
                                <Typography variant="body2">부정적</Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>주요 관심사</Typography>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                            <Chip label="주차" color="primary" />
                            <Chip label="보안" color="primary" />
                            <Chip label="청소" color="primary" />
                            <Chip label="엘리베이터" color="primary" />
                            <Chip label="조명" color="primary" />
                            <Chip label="소음" color="primary" />
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    const renderMemberAnalysis = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>입주민 상세 분석</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>입주민</TableCell>
                                        <TableCell>가족 유형</TableCell>
                                        <TableCell>활동도</TableCell>
                                        <TableCell>감정 상태</TableCell>
                                        <TableCell>영향력</TableCell>
                                        <TableCell>게시글 수</TableCell>
                                        <TableCell>댓글 수</TableCell>
                                        <TableCell>작업</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {members.map((member) => (
                                        <TableRow key={member.id}>
                                            <TableCell>
                                                <Box display="flex" alignItems="center">
                                                    <Avatar sx={{ mr: 1 }}>{member.name[0]}</Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {member.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {member.age}세, {member.occupation}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={member.familyType === 'family' ? '가족' :
                                                        member.familyType === 'couple' ? '부부' :
                                                            member.familyType === 'single' ? '1인' : '노인'}
                                                    size="small"
                                                    color="primary"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={member.activityLevel === 'high' ? '높음' :
                                                        member.activityLevel === 'medium' ? '보통' : '낮음'}
                                                    size="small"
                                                    color={member.activityLevel === 'high' ? 'success' :
                                                        member.activityLevel === 'medium' ? 'warning' : 'default'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center">
                                                    {getSentimentIcon(member.sentiment)}
                                                    <Typography variant="body2" sx={{ ml: 1 }}>
                                                        {member.sentiment === 'positive' ? '긍정적' :
                                                            member.sentiment === 'negative' ? '부정적' : '중립적'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center">
                                                    <Typography variant="body2" sx={{ mr: 1 }}>
                                                        {(member.influenceScore * 100).toFixed(0)}%
                                                    </Typography>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={member.influenceScore * 100}
                                                        sx={{ width: 60, height: 6 }}
                                                        color={member.influenceScore > 0.7 ? 'success' :
                                                            member.influenceScore > 0.4 ? 'warning' : 'error'}
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{member.postCount}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{member.commentCount}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="outlined" size="small">
                                                    상세 보기
                                                </Button>
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

    const renderPostAnalysis = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>게시글 분석</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>제목</TableCell>
                                        <TableCell>작성자</TableCell>
                                        <TableCell>카테고리</TableCell>
                                        <TableCell>감정</TableCell>
                                        <TableCell>우선순위</TableCell>
                                        <TableCell>상태</TableCell>
                                        <TableCell>좋아요/싫어요</TableCell>
                                        <TableCell>작성일</TableCell>
                                        <TableCell>작업</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {posts.map((post) => (
                                        <TableRow key={post.id}>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {post.title}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{post.author}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={post.category === 'complaint' ? '불만' :
                                                        post.category === 'suggestion' ? '제안' :
                                                            post.category === 'announcement' ? '공지' :
                                                                post.category === 'question' ? '질문' : '이벤트'}
                                                    size="small"
                                                    color={post.category === 'complaint' ? 'error' :
                                                        post.category === 'suggestion' ? 'success' : 'primary'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center">
                                                    {getSentimentIcon(post.sentiment)}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={post.priority === 'high' ? '높음' :
                                                        post.priority === 'medium' ? '보통' : '낮음'}
                                                    size="small"
                                                    color={post.priority === 'high' ? 'error' :
                                                        post.priority === 'medium' ? 'warning' : 'default'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={post.status === 'active' ? '진행중' :
                                                        post.status === 'resolved' ? '해결됨' : '종료'}
                                                    size="small"
                                                    color={post.status === 'active' ? 'warning' :
                                                        post.status === 'resolved' ? 'success' : 'default'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    👍 {post.likes} 👎 {post.dislikes}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {post.createdAt.toLocaleDateString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => {
                                                        setSelectedPost(post);
                                                        setPostDialogOpen(true);
                                                    }}
                                                >
                                                    상세 보기
                                                </Button>
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

    const renderSentimentAnalysis = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>감정 트렌드</Typography>
                        <Box display="flex" justifyContent="space-around" alignItems="center" mb={3}>
                            <Box textAlign="center">
                                <Typography variant="h4" color="success.main">65%</Typography>
                                <Typography variant="body2">긍정적</Typography>
                                <TrendingUp color="success" />
                            </Box>
                            <Box textAlign="center">
                                <Typography variant="h4" color="warning.main">25%</Typography>
                                <Typography variant="body2">중립적</Typography>
                                <TrendingFlat color="warning" />
                            </Box>
                            <Box textAlign="center">
                                <Typography variant="h4" color="error.main">10%</Typography>
                                <Typography variant="body2">부정적</Typography>
                                <TrendingDown color="error" />
                            </Box>
                        </Box>
                        <Alert severity="success">
                            전월 대비 긍정적 감정이 5% 증가했습니다.
                        </Alert>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>감정별 게시글 분포</Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon><SentimentSatisfied color="success" /></ListItemIcon>
                                <ListItemText
                                    primary="긍정적 게시글"
                                    secondary="58개 (65%)"
                                />
                                <LinearProgress
                                    variant="determinate"
                                    value={65}
                                    color="success"
                                    sx={{ width: 100 }}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><SentimentNeutral color="warning" /></ListItemIcon>
                                <ListItemText
                                    primary="중립적 게시글"
                                    secondary="22개 (25%)"
                                />
                                <LinearProgress
                                    variant="determinate"
                                    value={25}
                                    color="warning"
                                    sx={{ width: 100 }}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><SentimentDissatisfied color="error" /></ListItemIcon>
                                <ListItemText
                                    primary="부정적 게시글"
                                    secondary="9개 (10%)"
                                />
                                <LinearProgress
                                    variant="determinate"
                                    value={10}
                                    color="error"
                                    sx={{ width: 100 }}
                                />
                            </ListItem>
                        </List>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    const renderTopicAnalysis = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>주요 주제 분석</Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon><LocalParking /></ListItemIcon>
                                <ListItemText
                                    primary="주차 관련"
                                    secondary="23개 게시글, 85% 긍정적"
                                />
                                <Chip label="높음" color="success" size="small" />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><Security /></ListItemIcon>
                                <ListItemText
                                    primary="보안 관련"
                                    secondary="18개 게시글, 72% 긍정적"
                                />
                                <Chip label="보통" color="warning" size="small" />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><CleaningServices /></ListItemIcon>
                                <ListItemText
                                    primary="청소 관련"
                                    secondary="15개 게시글, 60% 긍정적"
                                />
                                <Chip label="낮음" color="error" size="small" />
                            </ListItem>
                        </List>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>키워드 분석</Typography>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                            <Chip label="주차" color="primary" />
                            <Chip label="보안" color="primary" />
                            <Chip label="청소" color="primary" />
                            <Chip label="엘리베이터" color="primary" />
                            <Chip label="조명" color="primary" />
                            <Chip label="소음" color="primary" />
                            <Chip label="수리" color="primary" />
                            <Chip label="개선" color="primary" />
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    const renderResponseTemplates = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">대응 템플릿</Typography>
                            <Button variant="contained" startIcon={<Add />}>
                                새 템플릿 추가
                            </Button>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>제목</TableCell>
                                        <TableCell>카테고리</TableCell>
                                        <TableCell>감정</TableCell>
                                        <TableCell>효과성</TableCell>
                                        <TableCell>사용 횟수</TableCell>
                                        <TableCell>작업</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {responseTemplates.map((template) => (
                                        <TableRow key={template.id}>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {template.title}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={template.category === 'complaint' ? '불만' : '제안'}
                                                    size="small"
                                                    color={template.category === 'complaint' ? 'error' : 'success'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center">
                                                    {getSentimentIcon(template.sentiment)}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center">
                                                    <Typography variant="body2" sx={{ mr: 1 }}>
                                                        {(template.effectiveness * 100).toFixed(0)}%
                                                    </Typography>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={template.effectiveness * 100}
                                                        sx={{ width: 60, height: 6 }}
                                                        color={template.effectiveness > 0.8 ? 'success' :
                                                            template.effectiveness > 0.6 ? 'warning' : 'error'}
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{template.usageCount}회</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" gap={1}>
                                                    <Button variant="outlined" size="small">
                                                        사용
                                                    </Button>
                                                    <Button variant="outlined" size="small">
                                                        편집
                                                    </Button>
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
    );

    const renderSettings = () => (
        <Card>
            <CardContent>
                <Typography variant="h6" mb={2}>커뮤니티 분석 설정</Typography>
                <List>
                    <ListItem>
                        <ListItemIcon><Refresh /></ListItemIcon>
                        <ListItemText
                            primary="자동 새로고침"
                            secondary="30초마다 데이터 자동 업데이트"
                        />
                        <Switch
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><Notifications /></ListItemIcon>
                        <ListItemText
                            primary="감정 변화 알림"
                            secondary="부정적 감정 증가 시 알림"
                        />
                        <Switch defaultChecked />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><AutoFixHigh /></ListItemIcon>
                        <ListItemText
                            primary="자동 대응 제안"
                            secondary="AI 기반 대응 템플릿 자동 제안"
                        />
                        <Switch defaultChecked />
                    </ListItem>
                </List>
            </CardContent>
        </Card>
    );

    const renderContent = () => {
        switch (selectedTab) {
            case 0: return renderCommunityOverview();
            case 1: return renderMemberAnalysis();
            case 2: return renderPostAnalysis();
            case 3: return renderSentimentAnalysis();
            case 4: return renderTopicAnalysis();
            case 5: return renderResponseTemplates();
            case 6: return renderSettings();
            default: return renderCommunityOverview();
        }
    };

    return (
        <Box sx={{ p: 3, height: '100vh', overflow: 'auto' }}>
            {/* 헤더 */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                    <Home sx={{ mr: 1, fontSize: 32 }} color="primary" />
                    <Typography variant="h4">아파트 커뮤니티 분석 대시보드</Typography>
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

            {/* 게시글 상세 다이얼로그 */}
            <Dialog
                open={postDialogOpen}
                onClose={() => setPostDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {selectedPost?.title}
                </DialogTitle>
                <DialogContent>
                    {selectedPost && (
                        <Box>
                            <Typography variant="body1" mb={2}>
                                {selectedPost.content}
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" mb={1}>댓글</Typography>
                            {selectedPost.comments.map((comment) => (
                                <Box key={comment.id} sx={{ mb: 2, pl: 2 }}>
                                    <Box display="flex" alignItems="center" mb={1}>
                                        <Typography variant="body2" fontWeight="medium">
                                            {comment.author}
                                        </Typography>
                                        <Box sx={{ ml: 1 }}>
                                            {getSentimentIcon(comment.sentiment)}
                                        </Box>
                                    </Box>
                                    <Typography variant="body2">
                                        {comment.content}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPostDialogOpen(false)}>닫기</Button>
                    <Button variant="contained">AI 대응 생성</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ApartmentCommunityAnalysisDashboard;
