import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    IconButton,
    Paper,
    Grid,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Switch,
    FormControlLabel,
    Slider,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Tabs,
    Tab,
    Divider,
    CircularProgress,
    Alert,
    Badge,
    Tooltip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Avatar,
    LinearProgress,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon,
    TextareaAutosize,
    Link,
    ImageList,
    ImageListItem,
    ImageListItemBar
} from '@mui/material';
import {
    Send,
    Search,
    Create,
    Translate,
    Analytics,
    Psychology,
    AutoAwesome,
    SmartToy,
    Mic,
    MicOff,
    AttachFile,
    Image,
    VideoCall,
    EmojiEmotions,
    AutoFixHigh,
    Psychology as BrainIcon,
    Speed,
    Memory,
    Storage,
    NetworkCheck,
    TrendingUp,
    TrendingDown,
    TrendingFlat,
    Science,
    Gavel,
    Timeline,
    Lightbulb,
    Hub,
    Balance,
    Sync,
    AccountTree,
    Visibility,
    Chat,
    History,
    Delete,
    Refresh,
    PlayArrow,
    Pause,
    Stop,
    CheckCircle,
    Warning,
    Error,
    Info,
    Save,
    Download,
    Share,
    Bookmark,
    Star,
    ThumbUp,
    ThumbDown,
    Language,
    Public,
    Article,
    Description,
    Code,
    DataObject,
    Edit,
    ContentCopy,
    Print,
    Fullscreen,
    Settings,
    Help,
    Cancel,
    Close,
    Minimize,
    Maximize,
    Restore,
    MoreVert,
    MoreHoriz,
    Menu,
    FilterList,
    Sort,
    ViewList,
    ViewModule,
    ViewComfy,
    ViewCompact,
    ViewHeadline,
    ViewStream,
    ViewWeek,
    ViewDay,
    ViewAgenda,
    ViewCarousel,
    ViewColumn,
    ViewQuilt,
    ViewSidebar,
    ViewTimeline,
    ExpandMore,
    School,
    Assessment,
    Build,
    Security,
    Shield,
    Lock,
    Key,
    Fingerprint,
    VerifiedUser,
    AdminPanelSettings,
    BugReport,
    MusicNote,
    Link as LinkIcon,
    AutoFixHigh as AutoFixHighIcon2,
    FormatBold,
    FormatItalic,
    FormatUnderline,
    FormatListBulleted,
    FormatListNumbered,
    FormatQuote,
    InsertLink,
    VideoLibrary,
    AttachFile as AttachFileIcon,
    Print as PrintIcon,
    Share as ShareIcon2,
    Download as DownloadIcon2,
    Bookmark as BookmarkIcon2,
    Star as StarIcon2,
    ThumbUp as ThumbUpIcon2,
    ThumbDown as ThumbDownIcon2,
    Refresh as RefreshIcon2,
    Undo,
    Redo,
    ZoomIn,
    ZoomOut,
    Fullscreen as FullscreenIcon,
    FullscreenExit,
    Settings as SettingsIcon2,
    Help as HelpIcon,
    Info as InfoIcon2,
    Warning as WarningIcon2,
    Error as ErrorIcon2,
    CheckCircle as CheckCircleIcon2,
    Cancel as CancelIcon,
    Close as CloseIcon,
    Minimize as MinimizeIcon,
    Maximize as MaximizeIcon,
    Restore as RestoreIcon,
    MoreVert as MoreVertIcon,
    MoreHoriz as MoreHorizIcon,
    Menu as MenuIcon,
    Search as SearchIcon,
    FilterList as FilterListIcon,
    Sort as SortIcon,
    ViewList as ViewListIcon,
    ViewModule as ViewModuleIcon,
    ViewComfy as ViewComfyIcon,
    ViewCompact as ViewCompactIcon,
    ViewHeadline as ViewHeadlineIcon,
    ViewStream as ViewStreamIcon,
    ViewWeek as ViewWeekIcon,
    ViewDay as ViewDayIcon,
    ViewAgenda as ViewAgendaIcon,
    ViewCarousel as ViewCarouselIcon,
    ViewColumn as ViewColumnIcon,
    ViewQuilt as ViewQuiltIcon,
    ViewSidebar as ViewSidebarIcon,
    ViewTimeline as ViewTimelineIcon
} from '@mui/icons-material';

// 통합 메시지 인터페이스
interface IntegratedMessage {
    id: string;
    type: 'user' | 'ai' | 'system' | 'search' | 'writing' | 'translation' | 'analysis' | 'suggestion' | 'improvement' | 'web_result' | 'image' | 'video' | 'file';
    content: string;
    timestamp: Date;
    function?: 'web_search' | 'writing' | 'translation' | 'analysis' | 'image_generation' | 'code_generation' | 'data_analysis' | 'presentation' | 'email' | 'report';
    style?: 'formal' | 'casual' | 'professional' | 'creative' | 'academic' | 'journalistic' | 'conversational';
    tone?: 'friendly' | 'serious' | 'enthusiastic' | 'neutral' | 'persuasive' | 'informative';
    language?: 'ko' | 'en' | 'ja' | 'zh' | 'es' | 'fr' | 'de';
    analysis?: {
        type: 'comprehensive_analysis' | 'web_search_analysis' | 'writing_analysis' | 'translation_analysis' | 'sentiment_analysis' | 'intent_analysis' | 'complexity_analysis';
        data: any;
        insights: string[];
        recommendations: string[];
        confidence: number;
        webResults?: WebSearchResult[];
        writingStats?: {
            wordCount: number;
            readability: number;
            grammarScore: number;
            styleScore: number;
        };
        translationQuality?: {
            accuracy: number;
            fluency: number;
            naturalness: number;
        };
    };
    originalText?: string;
    improvedText?: string;
    alternatives?: string[];
    multimedia?: {
        type: 'image' | 'video' | 'audio' | 'file';
        url?: string;
        data?: any;
    };
}

// 웹검색 결과 인터페이스
interface WebSearchResult {
    title: string;
    url: string;
    snippet: string;
    source: string;
    relevance: number;
    timestamp: string;
}

// 통합 AI 응답 생성 함수
const generateIntegratedAIResponse = (userInput: string, functionType: string): IntegratedMessage => {
    const lowerInput = userInput.toLowerCase();

    // 웹검색 요청 감지
    if (lowerInput.includes('검색') || lowerInput.includes('찾아') || lowerInput.includes('정보') || lowerInput.includes('뉴스')) {
        const searchResults: WebSearchResult[] = [
            {
                title: `${userInput} 관련 최신 정보`,
                url: 'https://example.com/search-result-1',
                snippet: `${userInput}에 대한 최신 정보와 분석 결과입니다.`,
                source: '신뢰할 수 있는 소스',
                relevance: 0.95,
                timestamp: new Date().toISOString()
            },
            {
                title: `${userInput} 전문 분석 리포트`,
                url: 'https://example.com/search-result-2',
                snippet: `${userInput}에 대한 전문적인 분석과 인사이트를 제공합니다.`,
                source: '전문 분석 기관',
                relevance: 0.88,
                timestamp: new Date().toISOString()
            }
        ];

        return {
            id: Date.now().toString(),
            type: 'search',
            content: `🔍 **웹검색 결과: ${userInput}**\n\n${searchResults.map((result, index) =>
                `${index + 1}. **[${result.title}](${result.url})**\n   ${result.snippet}\n   📍 ${result.source} | 관련도: ${(result.relevance * 100).toFixed(0)}%\n`
            ).join('\n')}\n\n💡 **추가 분석이 필요하시면 말씀해 주세요!**`,
            timestamp: new Date(),
            function: 'web_search',
            analysis: {
                type: 'web_search_analysis',
                data: { query: userInput, results: searchResults },
                insights: ['관련 정보 발견', '신뢰도 높은 소스 확인', '최신 정보 제공'],
                recommendations: ['더 구체적인 검색어 사용', '특정 기간으로 필터링', '관련 키워드 추가'],
                confidence: 0.92,
                webResults: searchResults
            }
        };
    }

    // 글쓰기 요청 감지
    if (lowerInput.includes('글') || lowerInput.includes('작성') || lowerInput.includes('문서') || lowerInput.includes('보고서')) {
        const writingContent = `📝 **${userInput} 작성 완료**\n\n안녕하세요! ${userInput}에 대한 내용을 작성해드렸습니다.\n\n## 주요 내용\n- 첫 번째 섹션\n- 두 번째 섹션\n- 세 번째 섹션\n\n## 결론\n전체 내용을 요약하고 향후 방향을 제시합니다.\n\n💡 **스타일이나 톤을 조정하고 싶으시면 말씀해 주세요!**`;

        return {
            id: Date.now().toString(),
            type: 'writing',
            content: writingContent,
            timestamp: new Date(),
            function: 'writing',
            style: 'professional',
            tone: 'informative',
            originalText: writingContent,
            analysis: {
                type: 'writing_analysis',
                data: { request: userInput, content: writingContent },
                insights: ['글쓰기 요청 분석 완료', '전문적 스타일 적용', '구조화된 내용 생성'],
                recommendations: ['더 구체적인 주제 제시', '키워드 추가', '요구사항 명시'],
                confidence: 0.89,
                writingStats: {
                    wordCount: writingContent.split(' ').length,
                    readability: 85,
                    grammarScore: 95,
                    styleScore: 90
                }
            }
        };
    }

    // 번역 요청 감지
    if (lowerInput.includes('번역') || lowerInput.includes('translate') || lowerInput.includes('영어') || lowerInput.includes('일본어')) {
        const translatedText = `🌐 **번역 결과**\n\n**원문**: ${userInput}\n**번역**: This is the translated version of your request.\n\n💡 **다른 언어로 번역하거나 문체를 조정하고 싶으시면 말씀해 주세요!**`;

        return {
            id: Date.now().toString(),
            type: 'translation',
            content: translatedText,
            timestamp: new Date(),
            function: 'translation',
            language: 'en',
            originalText: userInput,
            analysis: {
                type: 'translation_analysis',
                data: { original: userInput, translated: translatedText },
                insights: ['번역 요청 감지', '정확한 번역 수행', '자연스러운 표현 적용'],
                recommendations: ['더 구체적인 문맥 제공', '특정 분야 용어 명시', '문체 선호도 표시'],
                confidence: 0.91,
                translationQuality: {
                    accuracy: 95,
                    fluency: 88,
                    naturalness: 92
                }
            }
        };
    }

    // 기본 대화 응답
    return {
        id: Date.now().toString(),
        type: 'ai',
        content: `안녕하세요! 저는 CORBU AI 통합 어시스턴트입니다. 🤖✨\n\n${userInput}에 대해 도움을 드릴 수 있습니다. 다음과 같은 기능들을 제공합니다:\n\n🔍 **웹검색**: 최신 정보 검색 및 분석\n📝 **글쓰기**: 다양한 스타일의 글 작성\n🌐 **번역**: 다국어 번역 서비스\n📊 **분석**: 데이터 분석 및 인사이트\n🎨 **창작**: 이미지, 코드, 프레젠테이션 생성\n\n무엇을 도와드릴까요? 😊`,
        timestamp: new Date(),
        function: 'analysis',
        analysis: {
            type: 'comprehensive_analysis',
            data: { input: userInput },
            insights: ['사용자 의도 분석', '적절한 기능 추천', '개인화된 응답 생성'],
            recommendations: ['구체적인 요청 제시', '선호하는 스타일 명시', '추가 요구사항 공유'],
            confidence: 0.85
        }
    };
};

const UltraIntegratedConversationalAI: React.FC = () => {
    const [messages, setMessages] = useState<IntegratedMessage[]>([
        {
            id: '1',
            type: 'ai',
            content: `안녕하세요! 저는 CORBU AI 초통합 대화형 어시스턴트입니다. 🌟✨

🔮 **제공 기능**
• **🔍 웹검색**: 실시간 정보 검색 및 분석
• **📝 글쓰기**: 블로그, 보고서, 이메일, 스크립트 등
• **🌐 번역**: 한국어, 영어, 일본어, 중국어 등 다국어 지원
• **📊 분석**: 데이터 분석, 시장 분석, 트렌드 분석
• **🎨 창작**: 이미지 생성, 코드 작성, 프레젠테이션
• **🤖 AI 통합**: 모든 AI 시스템과 연동

💡 **사용 예시**
• "최신 AI 기술 검색해줘" → 웹검색 + 분석
• "블로그 글 써줘" → 글쓰기 + 스타일 조정
• "영어로 번역해줘" → 번역 + 품질 평가
• "데이터 분석해줘" → 분석 + 시각화
• "이미지 생성해줘" → AI 이미지 생성

무엇을 도와드릴까요? 🚀`,
            timestamp: new Date(),
            function: 'analysis',
            analysis: {
                type: 'comprehensive_analysis',
                data: { welcome: true },
                insights: ['통합 AI 시스템 초기화', '다양한 기능 소개', '사용자 경험 최적화'],
                recommendations: ['구체적인 요청 제시', '선호하는 스타일 명시', '추가 기능 탐색'],
                confidence: 0.95
            }
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<IntegratedMessage | null>(null);
    const [currentFunction, setCurrentFunction] = useState<string>('analysis');
    const [currentLanguage, setCurrentLanguage] = useState<string>('ko');
    const [currentStyle, setCurrentStyle] = useState<string>('conversational');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage: IntegratedMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        // AI 응답 생성
        setTimeout(() => {
            const aiResponse = generateIntegratedAIResponse(inputValue, currentFunction);
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 2000);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleAnalysisClick = (message: IntegratedMessage) => {
        setSelectedMessage(message);
        setShowAnalysis(true);
    };

    const handleFunctionChange = (functionType: string) => {
        setCurrentFunction(functionType);
        const functionMessage: IntegratedMessage = {
            id: Date.now().toString(),
            type: 'system',
            content: `🔄 **기능 변경**: ${functionType} 모드로 전환되었습니다.`,
            timestamp: new Date(),
            function: functionType as any
        };
        setMessages(prev => [...prev, functionMessage]);
    };

    const speedDialActions = [
        { icon: <Search />, name: '웹검색', action: () => handleFunctionChange('web_search') },
        { icon: <Create />, name: '글쓰기', action: () => handleFunctionChange('writing') },
        { icon: <Translate />, name: '번역', action: () => handleFunctionChange('translation') },
        { icon: <Analytics />, name: '분석', action: () => handleFunctionChange('analysis') },
        { icon: <Image />, name: '이미지', action: () => handleFunctionChange('image_generation') },
        { icon: <Code />, name: '코드', action: () => handleFunctionChange('code_generation') },
        { icon: <Description />, name: '문서', action: () => handleFunctionChange('presentation') },
        { icon: <Article />, name: '이메일', action: () => handleFunctionChange('email') }
    ];

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* 헤더 */}
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                <AutoAwesome />
                            </Avatar>
                            <Box>
                                <Typography variant="h6">CORBU AI 초통합 대화형 시스템</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    웹검색, 글쓰기, 번역, 분석 등 모든 기능을 대화형으로 통합
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip
                                label="웹검색 통합"
                                color="success"
                                size="small"
                            />
                            <Chip
                                label="다국어 지원"
                                color="primary"
                                size="small"
                            />
                            <Chip
                                label="AI 통합"
                                color="secondary"
                                size="small"
                            />
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* 메인 컨텐츠 */}
            <Box sx={{ display: 'flex', flex: 1, gap: 2 }}>
                {/* 채팅 영역 */}
                <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
                        {/* 메시지 영역 */}
                        <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {messages.map((message) => (
                                <Box
                                    key={message.id}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                                        mb: 2
                                    }}
                                >
                                    <Paper
                                        sx={{
                                            p: 2,
                                            maxWidth: '80%',
                                            backgroundColor: message.type === 'user' ? 'primary.main' : 'grey.100',
                                            color: message.type === 'user' ? 'white' : 'text.primary'
                                        }}
                                    >
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                                            {message.content}
                                        </Typography>

                                        {message.analysis && (
                                            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                                <Button
                                                    size="small"
                                                    startIcon={<Analytics />}
                                                    onClick={() => handleAnalysisClick(message)}
                                                    variant="outlined"
                                                >
                                                    상세 분석
                                                </Button>
                                                {message.function && (
                                                    <Chip
                                                        label={message.function}
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                    />
                                                )}
                                            </Box>
                                        )}

                                        <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                                            {message.timestamp.toLocaleTimeString()}
                                            {message.function && ` • ${message.function}`}
                                            {message.language && ` • ${message.language}`}
                                            {message.analysis?.confidence && ` • 신뢰도: ${(message.analysis.confidence * 100).toFixed(0)}%`}
                                        </Typography>
                                    </Paper>
                                </Box>
                            ))}

                            {isTyping && (
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                                    <Paper sx={{ p: 2, backgroundColor: 'grey.100' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CircularProgress size={16} />
                                            <Typography variant="body2">AI가 응답을 생성하고 있습니다...</Typography>
                                        </Box>
                                    </Paper>
                                </Box>
                            )}

                            <div ref={messagesEndRef} />
                        </Box>

                        {/* 입력 영역 */}
                        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="무엇을 도와드릴까요? (웹검색, 글쓰기, 번역, 분석 등)"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    multiline
                                    maxRows={4}
                                />
                                <IconButton
                                    color={isRecording ? 'error' : 'primary'}
                                    onClick={() => setIsRecording(!isRecording)}
                                >
                                    {isRecording ? <MicOff /> : <Mic />}
                                </IconButton>
                                <Button
                                    variant="contained"
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim() || isTyping}
                                    startIcon={<Send />}
                                >
                                    전송
                                </Button>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                {/* 설정 사이드바 */}
                <Card sx={{ width: 300, display: 'flex', flexDirection: 'column' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>기능 설정</Typography>

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>주요 기능</InputLabel>
                            <Select
                                value={currentFunction}
                                onChange={(e) => setCurrentFunction(e.target.value)}
                                label="주요 기능"
                            >
                                <MenuItem value="analysis">종합 분석</MenuItem>
                                <MenuItem value="web_search">웹검색</MenuItem>
                                <MenuItem value="writing">글쓰기</MenuItem>
                                <MenuItem value="translation">번역</MenuItem>
                                <MenuItem value="image_generation">이미지 생성</MenuItem>
                                <MenuItem value="code_generation">코드 생성</MenuItem>
                                <MenuItem value="data_analysis">데이터 분석</MenuItem>
                                <MenuItem value="presentation">프레젠테이션</MenuItem>
                                <MenuItem value="email">이메일</MenuItem>
                                <MenuItem value="report">보고서</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>언어</InputLabel>
                            <Select
                                value={currentLanguage}
                                onChange={(e) => setCurrentLanguage(e.target.value)}
                                label="언어"
                            >
                                <MenuItem value="ko">한국어</MenuItem>
                                <MenuItem value="en">English</MenuItem>
                                <MenuItem value="ja">日本語</MenuItem>
                                <MenuItem value="zh">中文</MenuItem>
                                <MenuItem value="es">Español</MenuItem>
                                <MenuItem value="fr">Français</MenuItem>
                                <MenuItem value="de">Deutsch</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>스타일</InputLabel>
                            <Select
                                value={currentStyle}
                                onChange={(e) => setCurrentStyle(e.target.value)}
                                label="스타일"
                            >
                                <MenuItem value="conversational">대화체</MenuItem>
                                <MenuItem value="formal">형식적</MenuItem>
                                <MenuItem value="casual">친근한</MenuItem>
                                <MenuItem value="professional">전문적</MenuItem>
                                <MenuItem value="creative">창의적</MenuItem>
                                <MenuItem value="academic">학술적</MenuItem>
                                <MenuItem value="journalistic">기자체</MenuItem>
                            </Select>
                        </FormControl>

                        <Typography variant="subtitle2" gutterBottom>빠른 기능</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            <Chip
                                label="웹검색"
                                onClick={() => handleFunctionChange('web_search')}
                                color={currentFunction === 'web_search' ? 'primary' : 'default'}
                                size="small"
                            />
                            <Chip
                                label="글쓰기"
                                onClick={() => handleFunctionChange('writing')}
                                color={currentFunction === 'writing' ? 'primary' : 'default'}
                                size="small"
                            />
                            <Chip
                                label="번역"
                                onClick={() => handleFunctionChange('translation')}
                                color={currentFunction === 'translation' ? 'primary' : 'default'}
                                size="small"
                            />
                            <Chip
                                label="분석"
                                onClick={() => handleFunctionChange('analysis')}
                                color={currentFunction === 'analysis' ? 'primary' : 'default'}
                                size="small"
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* 고급 기능 SpeedDial */}
            <SpeedDial
                ariaLabel="통합 AI 고급 기능"
                sx={{ position: 'absolute', bottom: 16, right: 16 }}
                icon={<SpeedDialIcon />}
            >
                {speedDialActions.map((action) => (
                    <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        tooltipTitle={action.name}
                        onClick={action.action}
                    />
                ))}
            </SpeedDial>

            {/* 분석 결과 다이얼로그 */}
            <Dialog
                open={showAnalysis}
                onClose={() => setShowAnalysis(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    상세 분석 결과
                </DialogTitle>
                <DialogContent>
                    {selectedMessage?.analysis && (
                        <Box>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="subtitle2" gutterBottom>분석 유형</Typography>
                                            <Chip label={selectedMessage.analysis.type} color="primary" />
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={6}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="subtitle2" gutterBottom>신뢰도</Typography>
                                            <LinearProgress
                                                variant="determinate"
                                                value={selectedMessage.analysis.confidence * 100}
                                                color="success"
                                                sx={{ height: 8, borderRadius: 4 }}
                                            />
                                            <Typography variant="body2">
                                                {(selectedMessage.analysis.confidence * 100).toFixed(0)}%
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>

                            {selectedMessage.analysis.webResults && (
                                <Card sx={{ mt: 2 }}>
                                    <CardContent>
                                        <Typography variant="subtitle2" gutterBottom>웹검색 결과</Typography>
                                        <List dense>
                                            {selectedMessage.analysis.webResults.map((result, index) => (
                                                <ListItem key={index} sx={{ py: 0 }}>
                                                    <ListItemIcon sx={{ minWidth: 20 }}>
                                                        <Public fontSize="small" />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={
                                                            <Link href={result.url} target="_blank" rel="noopener">
                                                                {result.title}
                                                            </Link>
                                                        }
                                                        secondary={`${result.snippet} | 관련도: ${(result.relevance * 100).toFixed(0)}%`}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </CardContent>
                                </Card>
                            )}

                            {selectedMessage.analysis.writingStats && (
                                <Card sx={{ mt: 2 }}>
                                    <CardContent>
                                        <Typography variant="subtitle2" gutterBottom>글쓰기 통계</Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={3}>
                                                <Typography variant="body2">단어 수: {selectedMessage.analysis.writingStats.wordCount}</Typography>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Typography variant="body2">가독성: {selectedMessage.analysis.writingStats.readability}%</Typography>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Typography variant="body2">문법 점수: {selectedMessage.analysis.writingStats.grammarScore}%</Typography>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Typography variant="body2">스타일 점수: {selectedMessage.analysis.writingStats.styleScore}%</Typography>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            )}

                            {selectedMessage.analysis.translationQuality && (
                                <Card sx={{ mt: 2 }}>
                                    <CardContent>
                                        <Typography variant="subtitle2" gutterBottom>번역 품질</Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={4}>
                                                <Typography variant="body2">정확도: {selectedMessage.analysis.translationQuality.accuracy}%</Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Typography variant="body2">유창성: {selectedMessage.analysis.translationQuality.fluency}%</Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Typography variant="body2">자연스러움: {selectedMessage.analysis.translationQuality.naturalness}%</Typography>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            )}

                            <Card sx={{ mt: 2 }}>
                                <CardContent>
                                    <Typography variant="subtitle2" gutterBottom>핵심 인사이트</Typography>
                                    <List dense>
                                        {selectedMessage.analysis.insights.map((insight, index) => (
                                            <ListItem key={index} sx={{ py: 0 }}>
                                                <ListItemIcon sx={{ minWidth: 20 }}>
                                                    <Lightbulb fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText primary={insight} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>

                            <Card sx={{ mt: 2 }}>
                                <CardContent>
                                    <Typography variant="subtitle2" gutterBottom>개선 제안</Typography>
                                    <List dense>
                                        {selectedMessage.analysis.recommendations.map((rec, index) => (
                                            <ListItem key={index} sx={{ py: 0 }}>
                                                <ListItemIcon sx={{ minWidth: 20 }}>
                                                    <AutoFixHigh fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText primary={rec} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowAnalysis(false)}>닫기</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UltraIntegratedConversationalAI;
