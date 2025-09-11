import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    Chip,
    Divider,
    Grid,
    Alert,
    CircularProgress,
    Tooltip,
    Badge,
    Avatar,
    LinearProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Drawer,
    AppBar,
    Toolbar,
    Menu,
    MenuItem,
    Switch,
    FormControlLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Send,
    Assessment,
    Speed,
    Article,
    Settings,
    Refresh,
    PlayArrow,
    Stop,
    CheckCircle,
    Warning,
    Error,
    TrendingUp,
    TrendingDown,
    TrendingFlat,
    Analytics,
    Build,
    Science,
    AutoFixHigh,
    Visibility,
    ExpandMore,
    SmartToy,
    Timeline,
    ModelTraining,
    Security,
    BugReport,
    Code,
    DataUsage,
    Memory,
    Storage,
    NetworkCheck,
    Speed as SpeedIcon,
    Memory as MemoryIcon,
    Storage as StorageIcon,
    NetworkCheck as NetworkIcon,
    CheckCircle as SuccessIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    Info as InfoIcon,
    Person,
    Dashboard,
    Search,
    Add,
    KeyboardVoice,
    AttachFile,
    Image,
    Book,
    Explore,
    History,
    Help,
    LocationOn,
    KeyboardArrowDown,
    KeyboardArrowUp,
    Star,
    StarBorder,
    Folder,
    Description,
    Notifications,
    AccountCircle,
    Upgrade,
    Diamond,
    Menu as MenuIcon,
    MoreVert,
    Close
} from '@mui/icons-material';

interface QualityMetric {
    name: string;
    value: number;
    unit: string;
    status: 'success' | 'warning' | 'error' | 'info';
    trend: 'up' | 'down' | 'stable';
    description: string;
}

interface TestSuite {
    id: string;
    name: string;
    category: string;
    status: 'active' | 'inactive' | 'running';
    lastExecuted: string;
    passRate: number;
    totalTests: number;
    passedTests: number;
    failedTests: number;
}

interface QualityReport {
    id: string;
    title: string;
    summary: string;
    status: 'completed' | 'running' | 'failed';
    createdAt: string;
    metrics: QualityMetric[];
    recommendations: string[];
}

const ConversationalQualityAssuranceSystem: React.FC = () => {
    const [messages, setMessages] = useState<Array<{
        id: string;
        text: string;
        sender: 'user' | 'ai';
        timestamp: Date;
        type?: 'quality_metric' | 'test_suite' | 'performance' | 'report' | 'general';
    }>>([
        {
            id: '1',
            text: '안녕하세요! CORBU AI 품질 보증 시스템입니다. 🤖\n\n품질 보증에 관한 질문을 자유롭게 해주세요. 다음과 같은 정보를 제공할 수 있습니다:\n\n🔍 **테스트 관리**: 테스트 스위트 목록, 실행 상태, 결과 확인\n📊 **품질 분석**: 메트릭, 트렌드, 성능 분석\n📋 **보고서**: 자동 생성된 품질 보고서\n⚙️ **자동화**: 스케줄된 테스트 실행\n\n어떤 정보가 필요하신가요?',
            sender: 'ai',
            timestamp: new Date(),
            type: 'general'
        }
    ]);

    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedGem, setSelectedGem] = useState('quality-assurance');
    const [modelVersion, setModelVersion] = useState('2.5 Flash');
    const [currentProject, setCurrentProject] = useState('quality-assurance');
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [projectName, setProjectName] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 샘플 데이터
    const [qualityMetrics] = useState<QualityMetric[]>([
        {
            name: '전체 통과율',
            value: 89.5,
            unit: '%',
            status: 'success',
            trend: 'up',
            description: '모든 테스트의 통과 비율'
        },
        {
            name: '평균 응답 시간',
            value: 245,
            unit: 'ms',
            status: 'success',
            trend: 'stable',
            description: 'API 응답 시간 평균'
        },
        {
            name: '메모리 사용률',
            value: 75.2,
            unit: '%',
            status: 'warning',
            trend: 'up',
            description: '시스템 메모리 사용률'
        },
        {
            name: 'CPU 사용률',
            value: 45.8,
            unit: '%',
            status: 'success',
            trend: 'stable',
            description: '시스템 CPU 사용률'
        },
        {
            name: '오류율',
            value: 2.1,
            unit: '%',
            status: 'warning',
            trend: 'down',
            description: '시스템 오류 발생률'
        }
    ]);

    const [testSuites] = useState<TestSuite[]>([
        {
            id: 'functional-test-suite',
            name: 'AI 기능 테스트 스위트',
            category: 'functional',
            status: 'active',
            lastExecuted: '2024-01-15 14:30:00',
            passRate: 92.5,
            totalTests: 15,
            passedTests: 14,
            failedTests: 1
        },
        {
            id: 'performance-test-suite',
            name: 'AI 성능 테스트 스위트',
            category: 'performance',
            status: 'running',
            lastExecuted: '2024-01-15 15:00:00',
            passRate: 88.0,
            totalTests: 12,
            passedTests: 10,
            failedTests: 2
        },
        {
            id: 'security-test-suite',
            name: 'AI 보안 테스트 스위트',
            category: 'security',
            status: 'active',
            lastExecuted: '2024-01-15 13:45:00',
            passRate: 95.0,
            totalTests: 8,
            passedTests: 8,
            failedTests: 0
        }
    ]);

    const [qualityReports] = useState<QualityReport[]>([
        {
            id: 'report-1',
            title: '주간 품질 보고서',
            summary: '전체적으로 양호한 품질을 유지하고 있으며, 성능 테스트에서 일부 개선이 필요합니다.',
            status: 'completed',
            createdAt: '2024-01-15 16:00:00',
            metrics: qualityMetrics.slice(0, 3),
            recommendations: [
                '성능 테스트 실패 케이스 분석 및 수정',
                '메모리 사용률 모니터링 강화',
                '보안 테스트 커버리지 확대'
            ]
        }
    ]);

    // 프로젝트 목록
    const [projects] = useState([
        { id: 'quality-assurance', name: '품질 보증', icon: <Assessment /> },
        { id: 'performance-testing', name: '성능 테스트', icon: <Speed /> },
        { id: 'security-audit', name: '보안 감사', icon: <Security /> },
        { id: 'automation', name: '자동화', icon: <AutoFixHigh /> }
    ]);

    // 채팅 히스토리
    const [chatHistory] = useState([
        { id: '1', title: '테스트 스위트 분석', project: 'quality-assurance', timestamp: '2024-01-15 14:30' },
        { id: '2', title: '성능 메트릭 확인', project: 'performance-testing', timestamp: '2024-01-15 13:45' },
        { id: '3', title: '보안 취약점 검사', project: 'security-audit', timestamp: '2024-01-15 12:20' },
        { id: '4', title: '자동화 스크립트 검토', project: 'automation', timestamp: '2024-01-15 11:15' }
    ]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'success';
            case 'warning': return 'warning';
            case 'error': return 'error';
            default: return 'info';
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return <TrendingUp color="success" />;
            case 'down': return <TrendingDown color="error" />;
            default: return <TrendingFlat color="info" />;
        }
    };

    const analyzeQualityQuestion = (question: string): string => {
        const questionLower = question.toLowerCase();

        // 테스트 스위트 관련 질문
        if (questionLower.includes('테스트 스위트') || questionLower.includes('test suite')) {
            if (questionLower.includes('목록') || questionLower.includes('list')) {
                let response = `현재 ${testSuites.length}개의 테스트 스위트가 있습니다:\n\n`;
                testSuites.forEach(suite => {
                    const statusColor = suite.status === 'active' ? 'success' : suite.status === 'running' ? 'warning' : 'default';
                    response += `• **${suite.name}** (${suite.category})\n`;
                    response += `  상태: ${suite.status} | 통과율: ${suite.passRate}% | 테스트: ${suite.passedTests}/${suite.totalTests}\n`;
                    response += `  마지막 실행: ${suite.lastExecuted}\n\n`;
                });
                return response;
            }
        }

        // 품질 메트릭 관련 질문
        if (questionLower.includes('메트릭') || questionLower.includes('metrics') || questionLower.includes('지표')) {
            let response = '현재 품질 메트릭:\n\n';
            qualityMetrics.forEach(metric => {
                response += `• **${metric.name}**: ${metric.value}${metric.unit}\n`;
                response += `  상태: ${metric.status} | ${metric.description}\n\n`;
            });
            return response;
        }

        // 성능 관련 질문
        if (questionLower.includes('성능') || questionLower.includes('performance')) {
            const performanceMetrics = qualityMetrics.filter(m =>
                m.name.includes('응답') || m.name.includes('메모리') || m.name.includes('CPU')
            );
            let response = '성능 분석 결과:\n\n';
            performanceMetrics.forEach(metric => {
                response += `• **${metric.name}**: ${metric.value}${metric.unit}\n`;
                if (metric.status === 'warning') {
                    response += `  ⚠️ 주의: ${metric.description} - 모니터링 필요\n`;
                }
                response += '\n';
            });
            return response;
        }

        // 보고서 관련 질문
        if (questionLower.includes('보고서') || questionLower.includes('report')) {
            let response = `최근 품질 보고서 (${qualityReports.length}개):\n\n`;
            qualityReports.forEach(report => {
                response += `• **${report.title}** - ${report.status}\n`;
                response += `  ${report.summary}\n`;
                response += `  생성일: ${report.createdAt}\n\n`;
            });
            return response;
        }

        // 실행 상태 관련 질문
        if (questionLower.includes('실행') || questionLower.includes('execution') || questionLower.includes('상태')) {
            const runningSuites = testSuites.filter(s => s.status === 'running');
            if (runningSuites.length > 0) {
                let response = `현재 ${runningSuites.length}개의 테스트가 실행 중입니다:\n\n`;
                runningSuites.forEach(suite => {
                    response += `• **${suite.name}**\n`;
                    response += `  진행률: ${suite.passedTests}/${suite.totalTests} (${suite.passRate}%)\n\n`;
                });
                return response;
            } else {
                return '현재 실행 중인 테스트가 없습니다.';
            }
        }

        // 일반적인 품질 보증 질문
        if (questionLower.includes('품질') || questionLower.includes('quality')) {
            return '품질 보증 시스템에 대해 질문하셨습니다. 다음 중 어떤 정보를 원하시나요?\n\n' +
                '• **테스트 스위트 목록** - 현재 구성된 테스트 스위트 확인\n' +
                '• **실행 상태** - 현재 실행 중인 테스트 확인\n' +
                '• **품질 메트릭** - 전체적인 품질 지표 확인\n' +
                '• **성능 분석** - 시스템 성능 상태 확인\n' +
                '• **보고서** - 생성된 품질 보고서 확인\n\n' +
                '구체적으로 어떤 정보를 원하시는지 말씀해 주세요.';
        }

        // 기본 응답
        return '품질 보증 시스템에 대한 질문을 받았습니다. 다음과 같은 정보를 제공할 수 있습니다:\n\n' +
            '🔍 **테스트 관리**: 테스트 스위트 생성, 실행, 모니터링\n' +
            '📊 **품질 분석**: 메트릭, 트렌드, 성능 분석\n' +
            '📋 **보고서**: 자동 생성된 품질 보고서\n' +
            '⚙️ **자동화**: 스케줄된 테스트 실행\n\n' +
            '어떤 부분에 대해 더 자세히 알고 싶으신가요?';
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage = {
            id: Date.now().toString(),
            text: inputMessage,
            sender: 'user' as const,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        // AI 응답 생성
        setTimeout(() => {
            const aiResponse = analyzeQualityQuestion(inputMessage);
            const aiMessage = {
                id: (Date.now() + 1).toString(),
                text: aiResponse,
                sender: 'ai' as const,
                timestamp: new Date(),
                type: 'quality_metric' as const
            };

            setMessages(prev => [...prev, aiMessage]);
            setIsLoading(false);
        }, 1000);
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    const handleNewChat = () => {
        setShowNewChatModal(true);
    };

    const handleCreateProject = () => {
        setShowProjectModal(true);
    };

    const renderMessage = (message: any) => {
        const isAI = message.sender === 'ai';

        return (
            <Box
                key={message.id}
                sx={{
                    display: 'flex',
                    justifyContent: isAI ? 'flex-start' : 'flex-end',
                    mb: 3,
                    px: 2
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2,
                        maxWidth: '80%',
                        flexDirection: isAI ? 'row' : 'row-reverse'
                    }}
                >
                    {isAI && (
                        <Avatar
                            sx={{
                                bgcolor: 'primary.main',
                                width: 32,
                                height: 32,
                                mt: 0.5
                            }}
                        >
                            <SmartToy fontSize="small" />
                        </Avatar>
                    )}

                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            bgcolor: isAI ? '#f8f9fa' : '#1a73e8',
                            color: isAI ? 'text.primary' : 'white',
                            borderRadius: 3,
                            maxWidth: '100%',
                            wordBreak: 'break-word',
                            border: isAI ? '1px solid #e0e0e0' : 'none'
                        }}
                    >
                        <Typography
                            variant="body1"
                            sx={{
                                whiteSpace: 'pre-line',
                                lineHeight: 1.6,
                                fontSize: '0.95rem'
                            }}
                        >
                            {message.text}
                        </Typography>
                    </Paper>

                    {!isAI && (
                        <Avatar
                            sx={{
                                bgcolor: '#34a853',
                                width: 32,
                                height: 32,
                                mt: 0.5
                            }}
                        >
                            <Person fontSize="small" />
                        </Avatar>
                    )}
                </Box>
            </Box>
        );
    };

    const Sidebar = () => (
        <Drawer
            variant="permanent"
            sx={{
                width: 280,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: 280,
                    boxSizing: 'border-box',
                    bgcolor: '#f8f9fa',
                    borderRight: '1px solid #e0e0e0'
                }
            }}
        >
            <Box sx={{ p: 2 }}>
                {/* 새 채팅 버튼 */}
                <Button
                    variant="outlined"
                    startIcon={<Add />}
                    fullWidth
                    onClick={handleNewChat}
                    sx={{
                        mb: 3,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '0.9rem'
                    }}
                >
                    새 채팅
                </Button>

                {/* 검색 */}
                <Box sx={{ mb: 3 }}>
                    <TextField
                        size="small"
                        placeholder="검색..."
                        InputProps={{
                            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                        fullWidth
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2
                            }
                        }}
                    />
                </Box>

                {/* Gems 섹션 */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}>
                        Gems
                    </Typography>
                    <List sx={{ p: 0 }}>
                        <ListItem
                            button
                            selected={selectedGem === 'storybook'}
                            sx={{
                                borderRadius: 1,
                                mb: 0.5,
                                '&.Mui-selected': {
                                    bgcolor: 'primary.light',
                                    color: 'primary.main'
                                }
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                <Book fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Storybook" />
                            <StarBorder fontSize="small" />
                        </ListItem>
                        <ListItem
                            button
                            selected={selectedGem === 'quality-assurance'}
                            sx={{
                                borderRadius: 1,
                                mb: 0.5,
                                '&.Mui-selected': {
                                    bgcolor: 'primary.light',
                                    color: 'primary.main'
                                }
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                <Assessment fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="품질 보증 파트너" />
                        </ListItem>
                        <ListItem
                            button
                            sx={{ borderRadius: 1, mb: 0.5 }}
                        >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                <Explore fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Gems 탐색하기" />
                        </ListItem>
                    </List>
                </Box>

                {/* 앱 활동 상태 */}
                <Box sx={{ mb: 3 }}>
                    <Alert severity="info" sx={{ borderRadius: 2, fontSize: '0.8rem' }}>
                        CORBU AI 앱 활동이 사용 중지됨
                        <Button size="small" sx={{ ml: 1, textTransform: 'none' }}>
                            여기에서 사용 설정
                        </Button>
                    </Alert>
                </Box>

                {/* 하단 메뉴 */}
                <Box>
                    <List sx={{ p: 0 }}>
                        <ListItem button sx={{ borderRadius: 1, mb: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                <History fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="활동" />
                        </ListItem>
                        <ListItem button sx={{ borderRadius: 1, mb: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                <Settings fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="설정 및 도움말" />
                        </ListItem>
                    </List>
                </Box>

                {/* 위치 정보 */}
                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                        대한민국 서울특별시 강남구 일원동
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                        IP 주소 기반 • 위치 업데이트
                    </Typography>
                </Box>
            </Box>
        </Drawer>
    );

    return (
        <Box sx={{ height: '100vh', display: 'flex' }}>
            {/* 사이드바 */}
            <Sidebar />

            {/* 메인 콘텐츠 영역 */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* 상단 바 */}
                <AppBar
                    position="static"
                    elevation={0}
                    sx={{
                        bgcolor: 'white',
                        borderBottom: '1px solid #e0e0e0',
                        color: 'text.primary'
                    }}
                >
                    <Toolbar sx={{ justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" fontWeight="bold">
                                CORBU AI
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {modelVersion}
                                </Typography>
                                <KeyboardArrowDown fontSize="small" />
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Button
                                startIcon={<Diamond />}
                                sx={{
                                    textTransform: 'none',
                                    color: 'text.primary',
                                    '&:hover': { bgcolor: 'grey.100' }
                                }}
                            >
                                업그레이드
                            </Button>
                            <IconButton>
                                <AccountCircle />
                            </IconButton>
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* 메시지 영역 */}
                <Box
                    sx={{
                        flex: 1,
                        overflow: 'auto',
                        bgcolor: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: 0
                    }}
                >
                    {messages.length === 1 ? (
                        // 초기 화면
                        <Box sx={{ textAlign: 'center', maxWidth: 600, px: 3 }}>
                            <Typography
                                variant="h4"
                                sx={{
                                    color: '#1a73e8',
                                    mb: 3,
                                    fontWeight: 500
                                }}
                            >
                                안녕하세요. CORBU AI
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                                품질 보증에 관한 질문을 자유롭게 해주세요
                            </Typography>
                        </Box>
                    ) : (
                        // 메시지 목록
                        <Box sx={{ width: '100%', py: 2 }}>
                            {messages.slice(1).map(renderMessage)}
                            {isLoading && (
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', px: 2, mb: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, mt: 0.5 }}>
                                            <SmartToy fontSize="small" />
                                        </Avatar>
                                        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
                                            <CircularProgress size={20} />
                                        </Paper>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    )}
                    <div ref={messagesEndRef} />
                </Box>

                {/* 입력 영역 */}
                <Box sx={{ p: 3, bgcolor: 'white', borderTop: '1px solid #e0e0e0' }}>
                    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                        {/* 메인 입력 필드 */}
                        <Box sx={{ position: 'relative', mb: 2 }}>
                            <TextField
                                fullWidth
                                multiline
                                maxRows={4}
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="CORBU AI에게 물어보기"
                                variant="outlined"
                                disabled={isLoading}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 3,
                                        bgcolor: '#f8f9fa',
                                        '&:hover': {
                                            bgcolor: '#f1f3f4'
                                        },
                                        '&.Mui-focused': {
                                            bgcolor: 'white'
                                        }
                                    }
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <IconButton size="small">
                                                <KeyboardVoice />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={handleSendMessage}
                                                disabled={!inputMessage.trim() || isLoading}
                                                sx={{
                                                    bgcolor: inputMessage.trim() ? '#1a73e8' : '#e0e0e0',
                                                    color: 'white',
                                                    '&:hover': {
                                                        bgcolor: inputMessage.trim() ? '#1557b0' : '#e0e0e0'
                                                    }
                                                }}
                                            >
                                                <Send fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    )
                                }}
                            />
                        </Box>

                        {/* 도구 버튼들 */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <IconButton size="small" sx={{ color: 'text.secondary' }}>
                                <Add />
                            </IconButton>
                            <Chip
                                icon={<Search />}
                                label="Deep Research"
                                size="small"
                                sx={{
                                    bgcolor: 'transparent',
                                    border: '1px solid #e0e0e0',
                                    '&:hover': { bgcolor: '#f1f3f4' }
                                }}
                            />
                            <Chip
                                icon={<Dashboard />}
                                label="Canvas"
                                size="small"
                                sx={{
                                    bgcolor: 'transparent',
                                    border: '1px solid #e0e0e0',
                                    '&:hover': { bgcolor: '#f1f3f4' }
                                }}
                            />
                            <Chip
                                icon={<Image />}
                                label="이미지"
                                size="small"
                                sx={{
                                    bgcolor: 'transparent',
                                    border: '1px solid #e0e0e0',
                                    '&:hover': { bgcolor: '#f1f3f4' }
                                }}
                            />
                            <Chip
                                icon={<Book />}
                                label="가이드 학습"
                                size="small"
                                sx={{
                                    bgcolor: 'transparent',
                                    border: '1px solid #e0e0e0',
                                    '&:hover': { bgcolor: '#f1f3f4' }
                                }}
                            />
                        </Box>

                        {/* 빠른 질문 버튼들 */}
                        {messages.length === 1 && (
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip
                                    label="테스트 스위트 목록"
                                    onClick={() => setInputMessage('테스트 스위트 목록을 보여주세요')}
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        '&:hover': { bgcolor: '#f1f3f4' }
                                    }}
                                />
                                <Chip
                                    label="품질 메트릭"
                                    onClick={() => setInputMessage('현재 품질 메트릭을 보여주세요')}
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        '&:hover': { bgcolor: '#f1f3f4' }
                                    }}
                                />
                                <Chip
                                    label="성능 분석"
                                    onClick={() => setInputMessage('성능 분석 결과를 보여주세요')}
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        '&:hover': { bgcolor: '#f1f3f4' }
                                    }}
                                />
                                <Chip
                                    label="실행 상태"
                                    onClick={() => setInputMessage('현재 실행 상태를 확인해주세요')}
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        '&:hover': { bgcolor: '#f1f3f4' }
                                    }}
                                />
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* 새 채팅 모달 */}
            <Dialog open={showNewChatModal} onClose={() => setShowNewChatModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>새 채팅 시작</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        새로운 품질 보증 대화를 시작하시겠습니까?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowNewChatModal(false)}>취소</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setMessages([{
                                id: '1',
                                text: '새로운 대화가 시작되었습니다. 품질 보증에 관한 질문을 해주세요.',
                                sender: 'ai',
                                timestamp: new Date(),
                                type: 'general'
                            }]);
                            setShowNewChatModal(false);
                        }}
                    >
                        새 채팅 시작
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ConversationalQualityAssuranceSystem;
