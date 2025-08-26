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
    ListItemAvatar,
    Avatar,
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
    Rating,
    CardHeader,
    CardActions
} from '@mui/material';
import {
    Group,
    Chat,
    VideoCall,
    ScreenShare,
    Edit,
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
    Delete,
    Share,
    Download,
    Upload,
    Notifications,
    Info,
    Help,
    Book,
    School,
    Work,
    LocationOn,
    AttachMoney,
    ShowChart,
    Timeline as TimelineIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    TrendingFlat as TrendingFlatIcon,
    Fullscreen,
    FullscreenExit,
    Star,
    StarBorder,
    StarHalf,
    ThumbUp,
    ThumbDown,
    ThumbUpOutlined,
    ThumbDownOutlined,
    Report,
    BugReport,
    BuildCircle,
    Architecture,
    DesignServices,
    Engineering as EngineeringIcon,
    Construction as ConstructionIcon,
    HomeRepairService as HomeRepairIcon,
    Handyman as HandymanIcon,
    Plumbing as PlumbingIcon,
    ElectricalServices as ElectricalIcon,
    CleaningServices as CleaningIcon,
    Security as SecurityIcon,
    LocalHospital as HospitalIcon,
    School as SchoolIcon2,
    ShoppingCart as ShoppingIcon,
    Restaurant as RestaurantIcon,
    LocalGroceryStore as GroceryIcon,
    DirectionsBus as BusIcon,
    DirectionsSubway as SubwayIcon,
    DirectionsCar as CarIcon,
    LocalTaxi as TaxiIcon,
    BikeScooter as BikeIcon,
    DirectionsWalk as WalkIcon,
    Favorite,
    FavoriteBorder,
    EmojiEmotions,
    Psychology,
    Lightbulb,
    AutoAwesome,
    Celebration,
    Flag,
    CheckCircle,
    Schedule,
    PriorityHigh,
    Warning,
    Error,
    Success,
    Person,
    PersonAdd,
    Block,
    MoreVert,
    Send,
    AttachFile,
    Mic,
    MicOff,
    Videocam,
    VideocamOff,
    ScreenShare as ScreenShareIcon,
    StopScreenShare,
    RecordVoiceOver,
    Headset,
    HeadsetOff
} from '@mui/icons-material';

interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: 'admin' | 'manager' | 'member' | 'guest';
    status: 'online' | 'offline' | 'away' | 'busy';
    lastSeen: Date;
    currentActivity: string;
}

interface Project {
    id: string;
    name: string;
    description: string;
    status: 'planning' | 'active' | 'completed' | 'on-hold';
    progress: number;
    members: string[];
    createdAt: Date;
    updatedAt: Date;
    priority: 'high' | 'medium' | 'low';
}

interface Task {
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'review' | 'completed';
    assignee: string;
    assigner: string;
    priority: 'high' | 'medium' | 'low';
    dueDate: Date;
    createdAt: Date;
    updatedAt: Date;
    progress: number;
    comments: Comment[];
}

interface Comment {
    id: string;
    userId: string;
    content: string;
    timestamp: Date;
    attachments: string[];
}

interface Meeting {
    id: string;
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    participants: string[];
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
    type: 'video' | 'audio' | 'screen-share' | 'hybrid';
    recording: boolean;
}

interface Document {
    id: string;
    name: string;
    type: 'document' | 'spreadsheet' | 'presentation' | 'image' | 'video';
    size: number;
    lastModified: Date;
    owner: string;
    sharedWith: string[];
    version: number;
    status: 'draft' | 'review' | 'approved' | 'published';
}

const RealTimeCollaborationDashboard: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedTab, setSelectedTab] = useState(0);
    const [fullscreen, setFullscreen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userDialogOpen, setUserDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [projectDialogOpen, setProjectDialogOpen] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    // 탭 정의
    const tabs = [
        { label: '팀 개요', icon: <Group /> },
        { label: '프로젝트', icon: <Work /> },
        { label: '작업 관리', icon: <Timeline /> },
        { label: '회의실', icon: <VideoCall /> },
        { label: '문서 공유', icon: <Article /> },
        { label: '실시간 채팅', icon: <Chat /> },
        { label: '설정', icon: <Settings /> }
    ];

    // 데이터 초기화
    useEffect(() => {
        const mockUsers: User[] = [
            {
                id: 'user-1',
                name: '김철수',
                email: 'kim@example.com',
                avatar: 'https://via.placeholder.com/40',
                role: 'admin',
                status: 'online',
                lastSeen: new Date(),
                currentActivity: '부동산 시장 분석 보고서 작성 중'
            },
            {
                id: 'user-2',
                name: '이영희',
                email: 'lee@example.com',
                avatar: 'https://via.placeholder.com/40',
                role: 'manager',
                status: 'online',
                lastSeen: new Date(),
                currentActivity: '아파트 커뮤니티 분석 중'
            },
            {
                id: 'user-3',
                name: '박민수',
                email: 'park@example.com',
                avatar: 'https://via.placeholder.com/40',
                role: 'member',
                status: 'away',
                lastSeen: new Date(Date.now() - 300000),
                currentActivity: '시공사 정보 수집 중'
            },
            {
                id: 'user-4',
                name: '정수진',
                email: 'jung@example.com',
                avatar: 'https://via.placeholder.com/40',
                role: 'member',
                status: 'busy',
                lastSeen: new Date(),
                currentActivity: '투자 분석 모델 개발 중'
            }
        ];

        const mockProjects: Project[] = [
            {
                id: 'project-1',
                name: '부동산 AI 분석 시스템',
                description: 'AI 기반 부동산 시장 분석 및 투자 추천 시스템 개발',
                status: 'active',
                progress: 75,
                members: ['user-1', 'user-2', 'user-3'],
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date(),
                priority: 'high'
            },
            {
                id: 'project-2',
                name: '아파트 커뮤니티 분석',
                description: '아파트 입주민 커뮤니티 분석 및 맞춤형 서비스 개발',
                status: 'active',
                progress: 60,
                members: ['user-2', 'user-4'],
                createdAt: new Date('2024-02-01'),
                updatedAt: new Date(),
                priority: 'medium'
            },
            {
                id: 'project-3',
                name: '시공사 정보 시스템',
                description: '시공사 정보 수집 및 분석 시스템 구축',
                status: 'planning',
                progress: 25,
                members: ['user-3', 'user-1'],
                createdAt: new Date('2024-03-01'),
                updatedAt: new Date(),
                priority: 'medium'
            }
        ];

        const mockTasks: Task[] = [
            {
                id: 'task-1',
                title: '시장 분석 모델 개발',
                description: '부동산 시장 예측을 위한 머신러닝 모델 개발',
                status: 'in-progress',
                assignee: 'user-1',
                assigner: 'user-2',
                priority: 'high',
                dueDate: new Date('2024-06-30'),
                createdAt: new Date('2024-05-01'),
                updatedAt: new Date(),
                progress: 80,
                comments: [
                    {
                        id: 'comment-1',
                        userId: 'user-1',
                        content: '모델 정확도 87% 달성했습니다.',
                        timestamp: new Date(Date.now() - 3600000),
                        attachments: []
                    }
                ]
            },
            {
                id: 'task-2',
                title: '커뮤니티 분석 리포트 작성',
                description: '아파트 커뮤니티 분석 결과 리포트 작성',
                status: 'review',
                assignee: 'user-2',
                assigner: 'user-1',
                priority: 'medium',
                dueDate: new Date('2024-06-15'),
                createdAt: new Date('2024-05-15'),
                updatedAt: new Date(),
                progress: 90,
                comments: []
            }
        ];

        const mockMeetings: Meeting[] = [
            {
                id: 'meeting-1',
                title: '주간 프로젝트 진행 상황 회의',
                description: '각 프로젝트별 진행 상황 및 이슈 공유',
                startTime: new Date(Date.now() + 86400000),
                endTime: new Date(Date.now() + 86400000 + 3600000),
                participants: ['user-1', 'user-2', 'user-3', 'user-4'],
                status: 'scheduled',
                type: 'video',
                recording: true
            },
            {
                id: 'meeting-2',
                title: 'AI 모델 성능 검토',
                description: '개발된 AI 모델의 성능 검토 및 개선 방안 논의',
                startTime: new Date(Date.now() + 172800000),
                endTime: new Date(Date.now() + 172800000 + 5400000),
                participants: ['user-1', 'user-4'],
                status: 'scheduled',
                type: 'hybrid',
                recording: false
            }
        ];

        const mockDocuments: Document[] = [
            {
                id: 'doc-1',
                name: '부동산 시장 분석 보고서',
                type: 'document',
                size: 2048576,
                lastModified: new Date(Date.now() - 3600000),
                owner: 'user-1',
                sharedWith: ['user-2', 'user-3'],
                version: 3,
                status: 'review'
            },
            {
                id: 'doc-2',
                name: 'AI 모델 성능 분석',
                type: 'spreadsheet',
                size: 1048576,
                lastModified: new Date(Date.now() - 7200000),
                owner: 'user-4',
                sharedWith: ['user-1'],
                version: 2,
                status: 'draft'
            }
        ];

        setUsers(mockUsers);
        setProjects(mockProjects);
        setTasks(mockTasks);
        setMeetings(mockMeetings);
        setDocuments(mockDocuments);
        setLastUpdate(new Date());
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'success';
            case 'offline': return 'default';
            case 'away': return 'warning';
            case 'busy': return 'error';
            default: return 'default';
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'error';
            case 'manager': return 'warning';
            case 'member': return 'primary';
            case 'guest': return 'default';
            default: return 'default';
        }
    };

    const getProjectStatusColor = (status: string) => {
        switch (status) {
            case 'planning': return 'default';
            case 'active': return 'primary';
            case 'completed': return 'success';
            case 'on-hold': return 'warning';
            default: return 'default';
        }
    };

    const getTaskStatusColor = (status: string) => {
        switch (status) {
            case 'todo': return 'default';
            case 'in-progress': return 'primary';
            case 'review': return 'warning';
            case 'completed': return 'success';
            default: return 'default';
        }
    };

    const getMeetingTypeIcon = (type: string) => {
        switch (type) {
            case 'video': return <VideoCall />;
            case 'audio': return <Mic />;
            case 'screen-share': return <ScreenShare />;
            case 'hybrid': return <Group />;
            default: return <VideoCall />;
        }
    };

    const renderTeamOverview = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Group color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">팀원</Typography>
                        </Box>
                        <Typography variant="h4" color="primary">{users.length}명</Typography>
                        <Typography variant="body2" color="textSecondary">
                            {users.filter(u => u.status === 'online').length}명 온라인
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Work color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">프로젝트</Typography>
                        </Box>
                        <Typography variant="h4" color="primary">{projects.length}개</Typography>
                        <Typography variant="body2" color="textSecondary">
                            {projects.filter(p => p.status === 'active').length}개 진행 중
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Timeline color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">작업</Typography>
                        </Box>
                        <Typography variant="h4" color="primary">{tasks.length}개</Typography>
                        <Typography variant="body2" color="textSecondary">
                            {tasks.filter(t => t.status === 'completed').length}개 완료
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <VideoCall color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">회의</Typography>
                        </Box>
                        <Typography variant="h4" color="primary">{meetings.length}개</Typography>
                        <Typography variant="body2" color="textSecondary">
                            {meetings.filter(m => m.status === 'scheduled').length}개 예정
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>팀원 현황</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>팀원</TableCell>
                                        <TableCell>역할</TableCell>
                                        <TableCell>상태</TableCell>
                                        <TableCell>현재 활동</TableCell>
                                        <TableCell>마지막 활동</TableCell>
                                        <TableCell>작업</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <Box display="flex" alignItems="center">
                                                    <Avatar src={user.avatar} sx={{ mr: 2, width: 32, height: 32 }} />
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {user.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {user.email}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={user.role === 'admin' ? '관리자' :
                                                        user.role === 'manager' ? '매니저' :
                                                            user.role === 'member' ? '멤버' : '게스트'}
                                                    size="small"
                                                    color={getRoleColor(user.role) as any}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={user.status === 'online' ? '온라인' :
                                                        user.status === 'offline' ? '오프라인' :
                                                            user.status === 'away' ? '자리비움' : '바쁨'}
                                                    size="small"
                                                    color={getStatusColor(user.status) as any}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {user.currentActivity}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="textSecondary">
                                                    {user.lastSeen.toLocaleTimeString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setUserDialogOpen(true);
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

    const renderProjects = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>프로젝트 목록</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>프로젝트명</TableCell>
                                        <TableCell>상태</TableCell>
                                        <TableCell>진행률</TableCell>
                                        <TableCell>우선순위</TableCell>
                                        <TableCell>팀원</TableCell>
                                        <TableCell>마지막 업데이트</TableCell>
                                        <TableCell>작업</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {projects.map((project) => (
                                        <TableRow key={project.id}>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {project.name}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {project.description}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={project.status === 'planning' ? '기획' :
                                                        project.status === 'active' ? '진행 중' :
                                                            project.status === 'completed' ? '완료' : '보류'}
                                                    size="small"
                                                    color={getProjectStatusColor(project.status) as any}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center">
                                                    <Typography variant="body2" sx={{ mr: 1 }}>
                                                        {project.progress}%
                                                    </Typography>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={project.progress}
                                                        sx={{ width: 60, height: 8, borderRadius: 4 }}
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={project.priority === 'high' ? '높음' :
                                                        project.priority === 'medium' ? '보통' : '낮음'}
                                                    size="small"
                                                    color={project.priority === 'high' ? 'error' :
                                                        project.priority === 'medium' ? 'warning' : 'success'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex">
                                                    {project.members.slice(0, 3).map((memberId, index) => {
                                                        const user = users.find(u => u.id === memberId);
                                                        return (
                                                            <Avatar
                                                                key={memberId}
                                                                src={user?.avatar}
                                                                sx={{
                                                                    width: 24,
                                                                    height: 24,
                                                                    mr: index < 2 ? 0.5 : 0,
                                                                    fontSize: '0.75rem'
                                                                }}
                                                            >
                                                                {user?.name.charAt(0)}
                                                            </Avatar>
                                                        );
                                                    })}
                                                    {project.members.length > 3 && (
                                                        <Chip
                                                            label={`+${project.members.length - 3}`}
                                                            size="small"
                                                            sx={{ height: 24, fontSize: '0.75rem' }}
                                                        />
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="textSecondary">
                                                    {project.updatedAt.toLocaleDateString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => {
                                                        setSelectedProject(project);
                                                        setProjectDialogOpen(true);
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

    const renderTaskManagement = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>작업 관리</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>작업명</TableCell>
                                        <TableCell>담당자</TableCell>
                                        <TableCell>상태</TableCell>
                                        <TableCell>진행률</TableCell>
                                        <TableCell>우선순위</TableCell>
                                        <TableCell>마감일</TableCell>
                                        <TableCell>작업</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tasks.map((task) => {
                                        const assignee = users.find(u => u.id === task.assignee);
                                        return (
                                            <TableRow key={task.id}>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {task.title}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {task.description}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center">
                                                        <Avatar
                                                            src={assignee?.avatar}
                                                            sx={{ mr: 1, width: 24, height: 24 }}
                                                        >
                                                            {assignee?.name.charAt(0)}
                                                        </Avatar>
                                                        <Typography variant="body2">
                                                            {assignee?.name}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={task.status === 'todo' ? '할 일' :
                                                            task.status === 'in-progress' ? '진행 중' :
                                                                task.status === 'review' ? '검토' : '완료'}
                                                        size="small"
                                                        color={getTaskStatusColor(task.status) as any}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center">
                                                        <Typography variant="body2" sx={{ mr: 1 }}>
                                                            {task.progress}%
                                                        </Typography>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={task.progress}
                                                            sx={{ width: 60, height: 8, borderRadius: 4 }}
                                                        />
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={task.priority === 'high' ? '높음' :
                                                            task.priority === 'medium' ? '보통' : '낮음'}
                                                        size="small"
                                                        color={task.priority === 'high' ? 'error' :
                                                            task.priority === 'medium' ? 'warning' : 'success'}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {task.dueDate.toLocaleDateString()}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="outlined" size="small">
                                                        상세 보기
                                                    </Button>
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
        </Grid>
    );

    const renderMeetingRoom = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>회의실</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>회의명</TableCell>
                                        <TableCell>유형</TableCell>
                                        <TableCell>시간</TableCell>
                                        <TableCell>참석자</TableCell>
                                        <TableCell>상태</TableCell>
                                        <TableCell>작업</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {meetings.map((meeting) => (
                                        <TableRow key={meeting.id}>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {meeting.title}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {meeting.description}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center">
                                                    {getMeetingTypeIcon(meeting.type)}
                                                    <Typography variant="body2" sx={{ ml: 1 }}>
                                                        {meeting.type === 'video' ? '화상회의' :
                                                            meeting.type === 'audio' ? '음성회의' :
                                                                meeting.type === 'screen-share' ? '화면공유' : '하이브리드'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {meeting.startTime.toLocaleDateString()} {meeting.startTime.toLocaleTimeString()}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    ~ {meeting.endTime.toLocaleTimeString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex">
                                                    {meeting.participants.slice(0, 3).map((participantId, index) => {
                                                        const user = users.find(u => u.id === participantId);
                                                        return (
                                                            <Avatar
                                                                key={participantId}
                                                                src={user?.avatar}
                                                                sx={{
                                                                    width: 24,
                                                                    height: 24,
                                                                    mr: index < 2 ? 0.5 : 0,
                                                                    fontSize: '0.75rem'
                                                                }}
                                                            >
                                                                {user?.name.charAt(0)}
                                                            </Avatar>
                                                        );
                                                    })}
                                                    {meeting.participants.length > 3 && (
                                                        <Chip
                                                            label={`+${meeting.participants.length - 3}`}
                                                            size="small"
                                                            sx={{ height: 24, fontSize: '0.75rem' }}
                                                        />
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={meeting.status === 'scheduled' ? '예정' :
                                                        meeting.status === 'in-progress' ? '진행 중' :
                                                            meeting.status === 'completed' ? '완료' : '취소'}
                                                    size="small"
                                                    color={meeting.status === 'scheduled' ? 'primary' :
                                                        meeting.status === 'in-progress' ? 'warning' :
                                                            meeting.status === 'completed' ? 'success' : 'error'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="outlined" size="small">
                                                    참여하기
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

    const renderDocumentSharing = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>문서 공유</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>문서명</TableCell>
                                        <TableCell>유형</TableCell>
                                        <TableCell>크기</TableCell>
                                        <TableCell>소유자</TableCell>
                                        <TableCell>공유 대상</TableCell>
                                        <TableCell>상태</TableCell>
                                        <TableCell>작업</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {documents.map((document) => {
                                        const owner = users.find(u => u.id === document.owner);
                                        return (
                                            <TableRow key={document.id}>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {document.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        v{document.version}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={document.type === 'document' ? '문서' :
                                                            document.type === 'spreadsheet' ? '스프레드시트' :
                                                                document.type === 'presentation' ? '프레젠테이션' :
                                                                    document.type === 'image' ? '이미지' : '비디오'}
                                                        size="small"
                                                        color="primary"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {(document.size / 1024 / 1024).toFixed(1)} MB
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center">
                                                        <Avatar
                                                            src={owner?.avatar}
                                                            sx={{ mr: 1, width: 24, height: 24 }}
                                                        >
                                                            {owner?.name.charAt(0)}
                                                        </Avatar>
                                                        <Typography variant="body2">
                                                            {owner?.name}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box display="flex">
                                                        {document.sharedWith.slice(0, 2).map((userId, index) => {
                                                            const user = users.find(u => u.id === userId);
                                                            return (
                                                                <Avatar
                                                                    key={userId}
                                                                    src={user?.avatar}
                                                                    sx={{
                                                                        width: 20,
                                                                        height: 20,
                                                                        mr: index < 1 ? 0.5 : 0,
                                                                        fontSize: '0.6rem'
                                                                    }}
                                                                >
                                                                    {user?.name.charAt(0)}
                                                                </Avatar>
                                                            );
                                                        })}
                                                        {document.sharedWith.length > 2 && (
                                                            <Chip
                                                                label={`+${document.sharedWith.length - 2}`}
                                                                size="small"
                                                                sx={{ height: 20, fontSize: '0.6rem' }}
                                                            />
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={document.status === 'draft' ? '초안' :
                                                            document.status === 'review' ? '검토' :
                                                                document.status === 'approved' ? '승인' : '발행'}
                                                        size="small"
                                                        color={document.status === 'draft' ? 'default' :
                                                            document.status === 'review' ? 'warning' :
                                                                document.status === 'approved' ? 'success' : 'primary'}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="outlined" size="small">
                                                        열기
                                                    </Button>
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
        </Grid>
    );

    const renderRealTimeChat = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>실시간 채팅</Typography>
                        <Box sx={{ height: 400, border: '1px solid #e0e0e0', borderRadius: 1, p: 2, mb: 2 }}>
                            <Typography variant="body2" color="textSecondary" textAlign="center">
                                채팅 인터페이스가 여기에 표시됩니다.
                            </Typography>
                        </Box>
                        <Box display="flex" gap={1}>
                            <TextField
                                fullWidth
                                placeholder="메시지를 입력하세요..."
                                size="small"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton size="small">
                                                <AttachFile />
                                            </IconButton>
                                            <IconButton size="small">
                                                <Mic />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                            <Button variant="contained">
                                <Send />
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" mb={2}>온라인 팀원</Typography>
                        <List>
                            {users.filter(user => user.status === 'online').map((user) => (
                                <ListItem key={user.id}>
                                    <ListItemAvatar>
                                        <Avatar src={user.avatar}>
                                            {user.name.charAt(0)}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={user.name}
                                        secondary={user.currentActivity}
                                    />
                                    <Chip
                                        label="온라인"
                                        size="small"
                                        color="success"
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    const renderSettings = () => (
        <Card>
            <CardContent>
                <Typography variant="h6" mb={2}>협업 설정</Typography>
                <List>
                    <ListItem>
                        <ListItemIcon><Notifications /></ListItemIcon>
                        <ListItemText
                            primary="실시간 알림"
                            secondary="새로운 메시지 및 업데이트 알림"
                        />
                        <Switch defaultChecked />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><VideoCall /></ListItemIcon>
                        <ListItemText
                            primary="화상회의 자동 녹화"
                            secondary="회의 내용 자동 녹화 및 저장"
                        />
                        <Switch defaultChecked />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><ScreenShare /></ListItemIcon>
                        <ListItemText
                            primary="화면 공유 권한"
                            secondary="팀원 간 화면 공유 허용"
                        />
                        <Switch defaultChecked />
                    </ListItem>
                </List>
            </CardContent>
        </Card>
    );

    const renderContent = () => {
        switch (selectedTab) {
            case 0: return renderTeamOverview();
            case 1: return renderProjects();
            case 2: return renderTaskManagement();
            case 3: return renderMeetingRoom();
            case 4: return renderDocumentSharing();
            case 5: return renderRealTimeChat();
            case 6: return renderSettings();
            default: return renderTeamOverview();
        }
    };

    return (
        <Box sx={{ p: 3, height: '100vh', overflow: 'auto' }}>
            {/* 헤더 */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                    <Group sx={{ mr: 1, fontSize: 32 }} color="primary" />
                    <Typography variant="h4">실시간 협업 대시보드</Typography>
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

            {/* 사용자 상세 다이얼로그 */}
            <Dialog
                open={userDialogOpen}
                onClose={() => setUserDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {selectedUser?.name} 상세 정보
                </DialogTitle>
                <DialogContent>
                    {selectedUser && (
                        <Box>
                            <Box display="flex" alignItems="center" mb={3}>
                                <Avatar src={selectedUser.avatar} sx={{ mr: 2, width: 64, height: 64 }}>
                                    {selectedUser.name.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6">{selectedUser.name}</Typography>
                                    <Typography variant="body2" color="textSecondary">{selectedUser.email}</Typography>
                                    <Chip
                                        label={selectedUser.role === 'admin' ? '관리자' :
                                            selectedUser.role === 'manager' ? '매니저' :
                                                selectedUser.role === 'member' ? '멤버' : '게스트'}
                                        color={getRoleColor(selectedUser.role) as any}
                                        size="small"
                                    />
                                </Box>
                            </Box>

                            <Typography variant="h6" mb={2}>현재 상태</Typography>
                            <Box mb={3}>
                                <Chip
                                    label={selectedUser.status === 'online' ? '온라인' :
                                        selectedUser.status === 'offline' ? '오프라인' :
                                            selectedUser.status === 'away' ? '자리비움' : '바쁨'}
                                    color={getStatusColor(selectedUser.status) as any}
                                />
                            </Box>

                            <Typography variant="h6" mb={2}>현재 활동</Typography>
                            <Typography variant="body2" mb={3}>{selectedUser.currentActivity}</Typography>

                            <Typography variant="h6" mb={2}>마지막 활동</Typography>
                            <Typography variant="body2" color="textSecondary">
                                {selectedUser.lastSeen.toLocaleString()}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUserDialogOpen(false)}>닫기</Button>
                    <Button variant="contained">메시지 보내기</Button>
                </DialogActions>
            </Dialog>

            {/* 프로젝트 상세 다이얼로그 */}
            <Dialog
                open={projectDialogOpen}
                onClose={() => setProjectDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {selectedProject?.name} 상세 정보
                </DialogTitle>
                <DialogContent>
                    {selectedProject && (
                        <Box>
                            <Typography variant="h6" mb={2}>프로젝트 개요</Typography>
                            <Typography variant="body2" mb={3}>{selectedProject.description}</Typography>

                            <Grid container spacing={2} mb={3}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">상태</Typography>
                                    <Chip
                                        label={selectedProject.status === 'planning' ? '기획' :
                                            selectedProject.status === 'active' ? '진행 중' :
                                                selectedProject.status === 'completed' ? '완료' : '보류'}
                                        color={getProjectStatusColor(selectedProject.status) as any}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary">우선순위</Typography>
                                    <Chip
                                        label={selectedProject.priority === 'high' ? '높음' :
                                            selectedProject.priority === 'medium' ? '보통' : '낮음'}
                                        color={selectedProject.priority === 'high' ? 'error' :
                                            selectedProject.priority === 'medium' ? 'warning' : 'success'}
                                    />
                                </Grid>
                            </Grid>

                            <Typography variant="h6" mb={2}>진행률</Typography>
                            <Box display="flex" alignItems="center" mb={3}>
                                <Typography variant="h6" sx={{ mr: 2 }}>{selectedProject.progress}%</Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={selectedProject.progress}
                                    sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
                                />
                            </Box>

                            <Typography variant="h6" mb={2}>팀원</Typography>
                            <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
                                {selectedProject.members.map((memberId) => {
                                    const user = users.find(u => u.id === memberId);
                                    return (
                                        <Chip
                                            key={memberId}
                                            avatar={<Avatar src={user?.avatar}>{user?.name.charAt(0)}</Avatar>}
                                            label={user?.name}
                                            variant="outlined"
                                        />
                                    );
                                })}
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setProjectDialogOpen(false)}>닫기</Button>
                    <Button variant="contained">프로젝트 편집</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RealTimeCollaborationDashboard;
