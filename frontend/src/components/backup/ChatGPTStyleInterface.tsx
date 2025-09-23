import React, { useState, useEffect } from 'react';
import ChatGPTProjectService from '../services/chatGPTProjectService';
import {
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Paper,
    Avatar,
    Divider,
    InputAdornment,
    Menu,
    MenuItem,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    FormLabel
} from '@mui/material';
import {
    Add,
    Folder,
    Chat as MessageSquare,
    Description as FileText,
    Search,
    MoreVert,
    Send,
    Mic,
    AttachFile as Paperclip,
    Add as Plus,
    Image,
    Code,
    Language as Globe,
    Storage as HardDrive,
    Cloud,
    Share,
    Archive,
    Delete,
    Edit,
    Settings,
    Lightbulb,
    EmojiEmotions,
    AttachMoney,
    School,
    Create,
    Favorite,
    Flight,
    Chat,
    LibraryBooks,
    QrCode,
    PlayArrow,
    GridView,
    Person,
    ExpandMore,
    ExpandLess
} from '@mui/icons-material';

interface Project {
    id: string;
    name: string;
    category: string;
    memoryType: 'default' | 'project_exclusive';
    description?: string;
    createdAt: string;
    fileCount: number;
    sessionCount: number;
}

interface ProjectSession {
    id: string;
    title: string;
    preview: string;
    createdAt: string;
    lastActivity: string;
    messageCount: number;
    isActive: boolean;
    tags?: string[];
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    isBookmarked?: boolean;
}

const PROJECT_CATEGORIES = [
    { id: 'investment', label: '투자', icon: AttachMoney, color: '#4CAF50' },
    { id: 'homework', label: '숙제', icon: School, color: '#2196F3' },
    { id: 'writing', label: '글쓰기', icon: Create, color: '#9C27B0' },
    { id: 'health', label: '건강', icon: Favorite, color: '#F44336' },
    { id: 'travel', label: '여행', icon: Flight, color: '#FF9800' },
];

export const ChatGPTStyleInterface: React.FC = () => {
    // 상태 관리
    const [projects, setProjects] = useState<Project[]>([]);
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const [currentSession, setCurrentSession] = useState<ProjectSession | null>(null);
    const [sessions, setSessions] = useState<ProjectSession[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    // UI 상태
    const [showProjectCreation, setShowProjectCreation] = useState(false);
    const [showFileManager, setShowFileManager] = useState(false);
    const [showSessionList, setShowSessionList] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [inputValue, setInputValue] = useState('');

    // 프로젝트 생성 상태
    const [projectName, setProjectName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('travel');
    const [selectedMemoryType, setSelectedMemoryType] = useState<'default' | 'project_exclusive'>('default');
    const [showMemorySettings, setShowMemorySettings] = useState(false);

    // 초기 데이터 로드
    useEffect(() => {
        loadProjects();
    }, []);

    // 프로젝트 로드
    const loadProjects = async () => {
        try {
            const projectService = ChatGPTProjectService.getInstance();
            const loadedProjects = await projectService.getProjects();

            if (loadedProjects.length > 0) {
                setProjects(loadedProjects);
                setCurrentProject(loadedProjects[0]);
                loadProjectData(loadedProjects[0].id);
            } else {
                // 기본 프로젝트 생성
                const defaultProject = await projectService.createProject({
                    name: '송파한양2차',
                    category: 'investment',
                    memoryType: 'default',
                    description: '송파한양2차 재건축 프로젝트'
                });
                setProjects([defaultProject]);
                setCurrentProject(defaultProject);
                loadProjectData(defaultProject.id);
            }
        } catch (error) {
            console.error('프로젝트 로드 실패:', error);
            // 오프라인 모드로 기본 데이터 사용
            const mockProjects: Project[] = [
                {
                    id: '1',
                    name: '송파한양2차',
                    category: 'investment',
                    memoryType: 'default',
                    description: '송파한양2차 재건축 프로젝트',
                    createdAt: new Date().toISOString(),
                    fileCount: 3,
                    sessionCount: 8
                }
            ];
            setProjects(mockProjects);
            setCurrentProject(mockProjects[0]);
            loadProjectData(mockProjects[0].id);
        }
    };

    // 프로젝트 데이터 로드
    const loadProjectData = async (projectId: string) => {
        const mockSessions: ProjectSession[] = [
            {
                id: '1',
                title: 'GS건설 입찰 논란',
                preview: '이게 다 누구를 위한 쇼인지 뻔히 보이네요. 조합 확인으로 식사 제공도 없었고, 조합원 자비로 계산...',
                createdAt: '2024-09-02T10:00:00Z',
                lastActivity: '2024-09-02T10:00:00Z',
                messageCount: 15,
                isActive: true,
                tags: ['입찰', '논란']
            },
            {
                id: '2',
                title: '댓글 작성 요청',
                preview: 'GS나 현산이나 어느 쪽을 응원하든 그 건 개인의 자유입니다 다만 경쟁을 방해하고 재건축 일정에',
                createdAt: '2024-09-02T09:30:00Z',
                lastActivity: '2024-09-02T09:30:00Z',
                messageCount: 8,
                isActive: false,
                tags: ['댓글', '작성']
            },
            {
                id: '3',
                title: '의견 정리 요청',
                preview: '담당자에게 얘기하기 위한 메세지 만들어줘',
                createdAt: '2024-08-27T14:20:00Z',
                lastActivity: '2024-08-27T14:20:00Z',
                messageCount: 12,
                isActive: false,
                tags: ['의견', '정리']
            }
        ];
        setSessions(mockSessions);
    };

    // 프로젝트 생성
    const handleCreateProject = async () => {
        if (!projectName.trim()) return;

        try {
            const projectService = ChatGPTProjectService.getInstance();
            const newProject = await projectService.createProject({
                name: projectName.trim(),
                category: selectedCategory,
                memoryType: selectedMemoryType,
                description: `프로젝트: ${projectName}`
            });

            setProjects(prev => [newProject, ...prev]);
            setCurrentProject(newProject);
            setShowProjectCreation(false);
            setProjectName('');
            setSelectedCategory('travel');
            setSelectedMemoryType('default');
        } catch (error) {
            console.error('프로젝트 생성 실패:', error);
            // 오프라인 모드로 로컬 생성
            const newProject: Project = {
                id: Date.now().toString(),
                name: projectName.trim(),
                category: selectedCategory,
                memoryType: selectedMemoryType,
                description: `프로젝트: ${projectName}`,
                createdAt: new Date().toISOString(),
                fileCount: 0,
                sessionCount: 0
            };

            setProjects(prev => [newProject, ...prev]);
            setCurrentProject(newProject);
            setShowProjectCreation(false);
            setProjectName('');
            setSelectedCategory('travel');
            setSelectedMemoryType('default');
        }
    };

    // 세션 선택
    const handleSessionSelect = (sessionId: string) => {
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
            setCurrentSession(session);
            setShowSessionList(false);
            loadSessionMessages(sessionId);
        }
    };

    // 세션 메시지 로드
    const loadSessionMessages = async (sessionId: string) => {
        const mockMessages: ChatMessage[] = [
            {
                id: '1',
                role: 'user',
                content: 'GS건설 입찰 논란에 대해 어떻게 생각하시나요?',
                timestamp: '2024-09-02T10:00:00Z'
            },
            {
                id: '2',
                role: 'assistant',
                content: 'GS건설의 입찰 과정에서 발생한 논란은 여러 측면에서 분석해볼 필요가 있습니다. 조합원들의 자비로 계산된 부분과 관련하여 투명성과 공정성에 대한 우려가 제기되고 있는 상황입니다.',
                timestamp: '2024-09-02T10:01:00Z'
            }
        ];
        setMessages(mockMessages);
    };

    // 메시지 전송
    const handleSendMessage = async () => {
        if (!inputValue.trim() || !currentSession) return;

        try {
            const projectService = ChatGPTProjectService.getInstance();

            // 사용자 메시지 전송
            const userMessage = await projectService.sendMessage(currentSession.id, inputValue.trim(), 'user');
            setMessages(prev => [...prev, userMessage]);
            setInputValue('');
            setIsTyping(true);

            // AI 응답 생성
            const aiMessage = await projectService.generateAIResponse(currentSession.id, inputValue.trim());
            setMessages(prev => [...prev, aiMessage]);
            setIsTyping(false);
        } catch (error) {
            console.error('메시지 전송 실패:', error);
            // 오프라인 모드로 로컬 처리
            const userMessage: ChatMessage = {
                id: Date.now().toString(),
                role: 'user',
                content: inputValue.trim(),
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, userMessage]);
            setInputValue('');
            setIsTyping(true);

            // AI 응답 시뮬레이션
            setTimeout(() => {
                const aiMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: '네, 말씀하신 내용에 대해 분석해보겠습니다. 추가적인 정보나 구체적인 질문이 있으시면 언제든 말씀해 주세요.',
                    timestamp: new Date().toISOString()
                };
                setMessages(prev => [...prev, aiMessage]);
                setIsTyping(false);
            }, 2000);
        }
    };

    // 새 세션 생성
    const handleCreateNewSession = async () => {
        if (!currentProject) return;

        try {
            const projectService = ChatGPTProjectService.getInstance();
            const newSession = await projectService.createSession(currentProject.id, '새 채팅');

            setSessions(prev => [newSession, ...prev]);
            setCurrentSession(newSession);
            setMessages([]);
        } catch (error) {
            console.error('세션 생성 실패:', error);
            // 오프라인 모드로 로컬 생성
            const newSession: ProjectSession = {
                id: Date.now().toString(),
                title: '새 채팅',
                preview: '',
                createdAt: new Date().toISOString(),
                lastActivity: new Date().toISOString(),
                messageCount: 0,
                isActive: true,
                tags: []
            };

            setSessions(prev => [newSession, ...prev]);
            setCurrentSession(newSession);
            setMessages([]);
        }
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return '오늘';
        if (diffDays === 2) return '어제';
        if (diffDays <= 7) return `${diffDays - 1}일 전`;

        return date.toLocaleDateString('ko-KR', {
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timestamp: string): string => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
            {/* 사이드바 */}
            <Box sx={{ width: 320, bgcolor: 'white', borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
                {/* 헤더 */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            프로젝트
                        </Typography>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<Add />}
                            onClick={() => setShowProjectCreation(true)}
                            sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
                        >
                            새 프로젝트
                        </Button>
                    </Box>

                    {/* 검색 */}
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="프로젝트 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                {/* 프로젝트 목록 */}
                <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                    {projects.map((project) => (
                        <Card
                            key={project.id}
                            sx={{
                                mb: 1,
                                cursor: 'pointer',
                                border: currentProject?.id === project.id ? 2 : 1,
                                borderColor: currentProject?.id === project.id ? '#1976d2' : 'divider',
                                bgcolor: currentProject?.id === project.id ? '#e3f2fd' : 'white',
                                '&:hover': { boxShadow: 2 }
                            }}
                            onClick={() => {
                                setCurrentProject(project);
                                loadProjectData(project.id);
                            }}
                        >
                            <CardContent sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Folder color="primary" />
                                    <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
                                        {project.name}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <MessageSquare sx={{ fontSize: 12 }} />
                                        <Typography variant="caption" color="text.secondary">
                                            {project.sessionCount}개 세션
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <FileText sx={{ fontSize: 12 }} />
                                        <Typography variant="caption" color="text.secondary">
                                            {project.fileCount}개 파일
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            </Box>

            {/* 메인 콘텐츠 */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {currentProject ? (
                    <>
                        {/* 프로젝트 헤더 */}
                        <Box sx={{ bgcolor: 'white', borderBottom: 1, borderColor: 'divider', p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Folder color="primary" />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {currentProject.name}
                                    </Typography>
                                    <Chip
                                        label={PROJECT_CATEGORIES.find(cat => cat.id === currentProject.category)?.label || '기타'}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<FileText />}
                                        onClick={() => setShowFileManager(true)}
                                    >
                                        파일 관리
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<MessageSquare />}
                                        onClick={() => setShowSessionList(true)}
                                    >
                                        세션 목록
                                    </Button>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<Add />}
                                        onClick={handleCreateNewSession}
                                        sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
                                    >
                                        새 채팅
                                    </Button>
                                </Box>
                            </Box>
                        </Box>

                        {/* 채팅 인터페이스 */}
                        {currentSession ? (
                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                {/* 채팅 헤더 */}
                                <Box sx={{ bgcolor: 'white', borderBottom: 1, borderColor: 'divider', p: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                {currentSession.title}
                                            </Typography>
                                            <Chip label={currentProject.name} size="small" variant="outlined" />
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} />
                                            <Typography variant="caption" color="text.secondary">
                                                연결됨
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* 메시지 목록 */}
                                <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: '#fafafa' }}>
                                    {messages.map((message) => (
                                        <Box
                                            key={message.id}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                                                mb: 2
                                            }}
                                        >
                                            <Paper
                                                sx={{
                                                    p: 2,
                                                    maxWidth: '70%',
                                                    bgcolor: message.role === 'user' ? '#1976d2' : 'white',
                                                    color: message.role === 'user' ? 'white' : 'text.primary',
                                                    boxShadow: 1
                                                }}
                                            >
                                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                                    {message.content}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        display: 'block',
                                                        mt: 1,
                                                        opacity: 0.7
                                                    }}
                                                >
                                                    {formatTime(message.timestamp)}
                                                </Typography>
                                            </Paper>
                                        </Box>
                                    ))}

                                    {isTyping && (
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                                            <Paper sx={{ p: 2, bgcolor: 'white', boxShadow: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                        <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'grey.400', animation: 'bounce 1s infinite' }} />
                                                        <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'grey.400', animation: 'bounce 1s infinite 0.1s' }} />
                                                        <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'grey.400', animation: 'bounce 1s infinite 0.2s' }} />
                                                    </Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        답변을 생성하고 있습니다...
                                                    </Typography>
                                                </Box>
                                            </Paper>
                                        </Box>
                                    )}
                                </Box>

                                {/* 입력 영역 */}
                                <Box sx={{ borderTop: 1, borderColor: 'divider', bgcolor: 'white', p: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                                        <IconButton size="small">
                                            <Paperclip />
                                        </IconButton>

                                        <IconButton size="small">
                                            <Plus />
                                        </IconButton>

                                        <TextField
                                            fullWidth
                                            multiline
                                            maxRows={4}
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            placeholder={`${currentProject.name}에서 새 채팅`}
                                            variant="outlined"
                                            size="small"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                        />

                                        <IconButton size="small">
                                            <Mic />
                                        </IconButton>

                                        <Button
                                            variant="contained"
                                            onClick={handleSendMessage}
                                            disabled={!inputValue.trim() || isTyping}
                                            sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
                                        >
                                            <Send />
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <MessageSquare sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                                    <Typography variant="h6" sx={{ mb: 1 }}>
                                        채팅을 시작하세요
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                        새 채팅 버튼을 클릭하여 대화를 시작하거나 기존 세션을 선택하세요
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        startIcon={<Add />}
                                        onClick={handleCreateNewSession}
                                        sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
                                    >
                                        새 채팅 시작
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </>
                ) : (
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Folder sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                프로젝트를 선택하세요
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                새 프로젝트를 만들거나 기존 프로젝트를 선택하세요
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => setShowProjectCreation(true)}
                                sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
                            >
                                새 프로젝트 만들기
                            </Button>
                        </Box>
                    </Box>
                )}
            </Box>

            {/* 프로젝트 생성 모달 */}
            <Dialog open={showProjectCreation} onClose={() => setShowProjectCreation(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Folder />
                    프로젝트 이름
                    <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => setShowMemorySettings(!showMemorySettings)}>
                            <Settings />
                        </IconButton>
                        <IconButton size="small" onClick={() => setShowProjectCreation(false)}>
                            <MoreVert />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        {/* 프로젝트 이름 입력 */}
                        <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Avatar sx={{ bgcolor: '#9c27b0', width: 32, height: 32 }}>
                                    <EmojiEmotions />
                                </Avatar>
                                <TextField
                                    fullWidth
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    placeholder="프로젝트 이름을 입력하세요"
                                    variant="outlined"
                                />
                            </Box>
                        </Box>

                        {/* 카테고리 선택 */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                카테고리 선택
                            </Typography>
                            <Grid container spacing={1}>
                                {PROJECT_CATEGORIES.map((category) => {
                                    const Icon = category.icon;
                                    const isSelected = selectedCategory === category.id;

                                    return (
                                        <Grid key={category.id}>
                                            <Button
                                                variant={isSelected ? "contained" : "outlined"}
                                                startIcon={<Icon />}
                                                onClick={() => setSelectedCategory(category.id)}
                                                sx={{
                                                    bgcolor: isSelected ? category.color : 'transparent',
                                                    color: isSelected ? 'white' : 'text.primary',
                                                    '&:hover': {
                                                        bgcolor: isSelected ? category.color : 'grey.100'
                                                    }
                                                }}
                                            >
                                                {category.label}
                                            </Button>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Box>

                        {/* 메모리 설정 */}
                        {showMemorySettings && (
                            <Paper sx={{ p: 2, mb: 3 }}>
                                <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Settings />
                                    메모리
                                </Typography>

                                <FormControl component="fieldset">
                                    <RadioGroup
                                        value={selectedMemoryType}
                                        onChange={(e) => setSelectedMemoryType(e.target.value as 'default' | 'project_exclusive')}
                                    >
                                        <FormControlLabel
                                            value="default"
                                            control={<Radio />}
                                            label={
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        기본값
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        프로젝트가 외부 채팅에서 메모리에 액세스할 수 있으며 그 반대도 가능합니다.
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                        <FormControlLabel
                                            value="project_exclusive"
                                            control={<Radio />}
                                            label={
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        프로젝트 전용
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        프로젝트가 자체 메모리에만 액세스할 수 있습니다. 외부 채팅에서는 프로젝트 메모리를 볼 수 없습니다.
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </RadioGroup>
                                </FormControl>

                                <Box sx={{ mt: 2, p: 2, bgcolor: '#fff3e0', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Lightbulb color="warning" />
                                    <Typography variant="caption" color="warning.dark">
                                        이 설정은 이후에 변경할 수 없습니다.
                                    </Typography>
                                </Box>
                            </Paper>
                        )}

                        {/* 프로젝트 설명 */}
                        <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                <Lightbulb color="warning" />
                                <Typography variant="body2">
                                    프로젝트에서는 한 곳에 파일, 맞춤형 지침을 보관합니다.
                                    지속적으로 진행되는 작업에, 또는 작업을 깔끔히 정리하기에 좋죠.
                                </Typography>
                            </Box>
                        </Paper>
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setShowProjectCreation(false)}>
                        취소
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateProject}
                        disabled={!projectName.trim()}
                        sx={{ bgcolor: '#424242', '&:hover': { bgcolor: '#303030' } }}
                    >
                        프로젝트 만들기
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 세션 목록 모달 */}
            <Dialog open={showSessionList} onClose={() => setShowSessionList(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Folder />
                        {currentProject?.name}
                        <Chip label={`${sessions.length}개 세션`} size="small" />
                    </Box>
                </DialogTitle>

                <DialogContent>
                    <List>
                        {sessions.map((session) => (
                            <ListItem
                                key={session.id}
                                onClick={() => handleSessionSelect(session.id)}
                                sx={{
                                    border: 1,
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    mb: 1,
                                    bgcolor: session.isActive ? '#e3f2fd' : 'white',
                                    '&:hover': { bgcolor: session.isActive ? '#e3f2fd' : 'grey.50' }
                                }}
                            >
                                <ListItemIcon>
                                    <MessageSquare />
                                </ListItemIcon>
                                <ListItemText
                                    primary={session.title}
                                    secondary={
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                {session.preview}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatDate(session.lastActivity)}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {session.messageCount}개 메시지
                                                </Typography>
                                                {session.tags && session.tags.slice(0, 2).map((tag, index) => (
                                                    <Chip key={index} label={tag} size="small" variant="outlined" />
                                                ))}
                                            </Box>
                                        </Box>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default ChatGPTStyleInterface;
