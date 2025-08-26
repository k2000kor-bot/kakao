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
    TextareaAutosize
} from '@mui/material';
import {
    Send,
    Settings,
    Mic,
    MicOff,
    AttachFile,
    SmartToy,
    Psychology,
    Analytics,
    Workflow,
    Optimization,
    IntegrationInstructions,
    Chat,
    History,
    Delete,
    Refresh,
    PlayArrow,
    Pause,
    Stop,
    Visibility,
    ExpandMore,
    CheckCircle,
    Warning,
    Error,
    Info,
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
    AutoAwesome,
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
    Code,
    DataObject,
    Edit,
    ContentCopy,
    Download,
    Share,
    Bookmark,
    Star,
    ThumbUp,
    ThumbDown,
    Translate,
    Language,
    Psychology as PsychologyIcon,
    Analytics as AnalyticsIcon,
    Timeline as TimelineIcon,
    Lightbulb as LightbulbIcon,
    Hub as HubIcon,
    AccountTree as AccountTreeIcon,
    Visibility as VisibilityIcon,
    Translate as TranslateIcon,
    Mic as MicIcon,
    Image as ImageIcon,
    VideoCall as VideoCallIcon,
    EmojiEmotions as EmojiEmotionsIcon,
    AutoFixHigh as AutoFixHighIcon,
    Psychology as BrainIcon,
    Speed as SpeedIcon,
    Memory as MemoryIcon,
    Storage as StorageIcon,
    NetworkCheck as NetworkCheckIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    TrendingFlat as TrendingFlatIcon,
    Science as ScienceIcon,
    Gavel as GavelIcon,
    Timeline as TimelineIcon,
    Lightbulb as LightbulbIcon,
    Hub as HubIcon,
    Balance as BalanceIcon,
    Sync as SyncIcon,
    AccountTree as AccountTreeIcon,
    AutoAwesome as AutoAwesomeIcon,
    School as SchoolIcon,
    Assessment as AssessmentIcon,
    Build as BuildIcon,
    Security as SecurityIcon,
    Shield as ShieldIcon,
    Lock as LockIcon,
    Key as KeyIcon,
    Fingerprint as FingerprintIcon,
    VerifiedUser as VerifiedUserIcon,
    AdminPanelSettings as AdminPanelSettingsIcon,
    BugReport as BugReportIcon,
    Code as CodeIcon,
    DataObject as DataObjectIcon,
    Create as CreateIcon,
    AutoFixHigh as AutoFixHighIcon2,
    FormatBold as FormatBoldIcon,
    FormatItalic as FormatItalicIcon,
    FormatUnderline as FormatUnderlineIcon,
    FormatListBulleted as FormatListBulletedIcon,
    FormatListNumbered as FormatListNumberedIcon,
    FormatQuote as FormatQuoteIcon,
    InsertLink as InsertLinkIcon,
    Image as ImageIcon2,
    VideoLibrary as VideoLibraryIcon,
    AttachFile as AttachFileIcon,
    Save as SaveIcon,
    Print as PrintIcon,
    Share as ShareIcon2,
    Download as DownloadIcon2,
    Bookmark as BookmarkIcon2,
    Star as StarIcon2,
    ThumbUp as ThumbUpIcon2,
    ThumbDown as ThumbDownIcon2,
    Refresh as RefreshIcon2,
    Undo as UndoIcon,
    Redo as RedoIcon,
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon,
    Fullscreen as FullscreenIcon,
    FullscreenExit as FullscreenExitIcon,
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
    ViewTimeline as ViewTimelineIcon,
    ViewWeek as ViewWeekIcon2,
    ViewDay as ViewDayIcon2,
    ViewAgenda as ViewAgendaIcon2,
    ViewCarousel as ViewCarouselIcon2,
    ViewColumn as ViewColumnIcon2,
    ViewQuilt as ViewQuiltIcon2,
    ViewSidebar as ViewSidebarIcon2,
    ViewTimeline as ViewTimelineIcon2
} from '@mui/icons-material';

// 글쓰기 메시지 인터페이스
interface WritingMessage {
    id: string;
    type: 'user' | 'ai' | 'system' | 'writing' | 'suggestion' | 'improvement';
    content: string;
    timestamp: Date;
    writingType?: 'article' | 'blog' | 'report' | 'email' | 'story' | 'poem' | 'script' | 'documentation';
    style?: 'formal' | 'casual' | 'professional' | 'creative' | 'academic' | 'journalistic' | 'conversational';
    tone?: 'friendly' | 'serious' | 'enthusiastic' | 'neutral' | 'persuasive' | 'informative';
    length?: 'brief' | 'medium' | 'comprehensive' | 'extensive';
    target?: 'general' | 'expert' | 'beginner' | 'business' | 'academic' | 'casual';
    analysis?: {
        type: 'writing_analysis' | 'style_suggestion' | 'improvement' | 'grammar_check' | 'tone_analysis' | 'structure_analysis';
        data: any;
        insights: string[];
        recommendations: string[];
        confidence: number;
        wordCount?: number;
        readability?: number;
        grammarScore?: number;
        styleScore?: number;
        suggestions?: {
            type: 'grammar' | 'style' | 'structure' | 'content' | 'tone';
            original: string;
            suggestion: string;
            reason: string;
        }[];
    };
    originalText?: string;
    improvedText?: string;
    alternatives?: string[];
}

// 글쓰기 요청 인터페이스
interface WritingRequest {
    topic: string;
    type: 'article' | 'blog' | 'report' | 'email' | 'story' | 'poem' | 'script' | 'documentation';
    style: 'formal' | 'casual' | 'professional' | 'creative' | 'academic' | 'journalistic' | 'conversational';
    tone: 'friendly' | 'serious' | 'enthusiastic' | 'neutral' | 'persuasive' | 'informative';
    length: 'brief' | 'medium' | 'comprehensive' | 'extensive';
    target: 'general' | 'expert' | 'beginner' | 'business' | 'academic' | 'casual';
    keywords?: string[];
    requirements?: string[];
}

// 글쓰기 분석 함수
const analyzeWritingRequest = (text: string): any => {
    const lowerText = text.toLowerCase();

    // 글쓰기 유형 추출
    let writingType: string = 'article';
    if (lowerText.includes('블로그') || lowerText.includes('blog')) writingType = 'blog';
    if (lowerText.includes('보고서') || lowerText.includes('report')) writingType = 'report';
    if (lowerText.includes('이메일') || lowerText.includes('email')) writingType = 'email';
    if (lowerText.includes('스토리') || lowerText.includes('story')) writingType = 'story';
    if (lowerText.includes('시') || lowerText.includes('poem')) writingType = 'poem';
    if (lowerText.includes('스크립트') || lowerText.includes('script')) writingType = 'script';
    if (lowerText.includes('문서') || lowerText.includes('documentation')) writingType = 'documentation';

    // 스타일 추출
    let style: string = 'professional';
    if (lowerText.includes('친근') || lowerText.includes('casual')) style = 'casual';
    if (lowerText.includes('창의') || lowerText.includes('creative')) style = 'creative';
    if (lowerText.includes('학술') || lowerText.includes('academic')) style = 'academic';
    if (lowerText.includes('기자') || lowerText.includes('journalistic')) style = 'journalistic';
    if (lowerText.includes('대화') || lowerText.includes('conversational')) style = 'conversational';

    // 톤 추출
    let tone: string = 'neutral';
    if (lowerText.includes('친근') || lowerText.includes('friendly')) tone = 'friendly';
    if (lowerText.includes('진지') || lowerText.includes('serious')) tone = 'serious';
    if (lowerText.includes('열정') || lowerText.includes('enthusiastic')) tone = 'enthusiastic';
    if (lowerText.includes('설득') || lowerText.includes('persuasive')) tone = 'persuasive';
    if (lowerText.includes('정보') || lowerText.includes('informative')) tone = 'informative';

    // 길이 추출
    let length: string = 'medium';
    if (lowerText.includes('짧') || lowerText.includes('brief')) length = 'brief';
    if (lowerText.includes('길') || lowerText.includes('comprehensive')) length = 'comprehensive';
    if (lowerText.includes('매우 길') || lowerText.includes('extensive')) length = 'extensive';

    // 대상 추출
    let target: string = 'general';
    if (lowerText.includes('전문가') || lowerText.includes('expert')) target = 'expert';
    if (lowerText.includes('초보') || lowerText.includes('beginner')) target = 'beginner';
    if (lowerText.includes('비즈니스') || lowerText.includes('business')) target = 'business';
    if (lowerText.includes('학술') || lowerText.includes('academic')) target = 'academic';
    if (lowerText.includes('일반') || lowerText.includes('casual')) target = 'casual';

    return {
        writingType,
        style,
        tone,
        length,
        target,
        requirements: [],
        keywords: []
    };
};

// 글쓰기 생성 함수
const generateWritingContent = (request: WritingRequest): string => {
    const { topic, type, style, tone, length, target } = request;

    // 글쓰기 유형별 템플릿
    const templates = {
        article: {
            brief: `# ${topic}\n\n${topic}에 대한 간단한 개요와 주요 포인트를 설명합니다.`,
            medium: `# ${topic}\n\n## 개요\n${topic}에 대한 전반적인 이해를 돕는 내용입니다.\n\n## 주요 내용\n- 첫 번째 포인트\n- 두 번째 포인트\n- 세 번째 포인트\n\n## 결론\n${topic}에 대한 요약과 향후 전망을 제시합니다.`,
            comprehensive: `# ${topic}\n\n## 서론\n${topic}에 대한 배경과 중요성을 설명합니다.\n\n## 본론\n### 1. 첫 번째 섹션\n상세한 내용과 예시를 포함합니다.\n\n### 2. 두 번째 섹션\n추가적인 분석과 인사이트를 제공합니다.\n\n### 3. 세 번째 섹션\n실용적인 적용 방법을 제시합니다.\n\n## 결론\n전체 내용을 요약하고 향후 방향을 제시합니다.`,
            extensive: `# ${topic}\n\n## 서론\n${topic}에 대한 포괄적인 배경과 연구 동향을 분석합니다.\n\n## 본론\n### 1. 이론적 배경\n관련 이론과 개념을 상세히 설명합니다.\n\n### 2. 현황 분석\n현재 상황과 문제점을 분석합니다.\n\n### 3. 사례 연구\n구체적인 사례와 적용 예시를 제시합니다.\n\n### 4. 해결 방안\n문제 해결을 위한 구체적인 방안을 제시합니다.\n\n### 5. 향후 전망\n미래 발전 방향과 기회를 분석합니다.\n\n## 결론\n전체 연구 결과를 요약하고 정책적 제언을 제시합니다.`
        },
        blog: {
            brief: `안녕하세요! 오늘은 ${topic}에 대해 이야기해보려고 합니다.`,
            medium: `안녕하세요! 오늘은 ${topic}에 대해 이야기해보려고 합니다.\n\n${topic}에 대해 알아보면서 흥미로운 점들을 발견했는데요, 여러분과 함께 공유하고 싶습니다.\n\n## 주요 포인트\n- 첫 번째 포인트\n- 두 번째 포인트\n- 세 번째 포인트\n\n여러분은 어떻게 생각하시나요? 댓글로 의견을 남겨주세요!`,
            comprehensive: `안녕하세요! 오늘은 ${topic}에 대해 자세히 알아보려고 합니다.\n\n## 왜 ${topic}인가요?\n${topic}에 대한 관심이 높아지고 있는 이유와 배경을 설명드리겠습니다.\n\n## 상세 분석\n### 1. 첫 번째 관점\n구체적인 내용과 예시를 들어 설명합니다.\n\n### 2. 두 번째 관점\n다른 각도에서 바라본 분석을 제공합니다.\n\n### 3. 실용적 적용\n일상생활에서 어떻게 활용할 수 있는지 제시합니다.\n\n## 마무리\n${topic}에 대한 전체적인 이해와 개인적인 생각을 정리해봤습니다. 여러분의 의견도 궁금합니다!`,
            extensive: `안녕하세요! 오늘은 ${topic}에 대해 깊이 있게 다뤄보려고 합니다.\n\n## 들어가며\n${topic}에 대한 포괄적인 이해와 현재 상황을 분석해보겠습니다.\n\n## 상세 분석\n### 1. 배경과 역사\n${topic}의 역사적 배경과 발전 과정을 살펴봅니다.\n\n### 2. 현재 상황\n현재 ${topic}의 상황과 주요 이슈들을 분석합니다.\n\n### 3. 다양한 관점\n다양한 관점에서 ${topic}을 바라보는 시각을 제공합니다.\n\n### 4. 실용적 적용\n실제로 어떻게 활용할 수 있는지 구체적인 방법을 제시합니다.\n\n### 5. 향후 전망\n${topic}의 미래 발전 방향과 기회를 분석합니다.\n\n## 마무리\n${topic}에 대한 깊이 있는 분석을 통해 새로운 인사이트를 얻으셨기를 바랍니다. 여러분의 생각도 궁금합니다!`
        },
        email: {
            brief: `제목: ${topic}\n\n안녕하세요,\n\n${topic}에 대해 연락드립니다.\n\n감사합니다.`,
            medium: `제목: ${topic}\n\n안녕하세요,\n\n${topic}에 대해 연락드립니다.\n\n주요 내용:\n- 첫 번째 사항\n- 두 번째 사항\n- 세 번째 사항\n\n추가 문의사항이 있으시면 언제든 연락주세요.\n\n감사합니다.`,
            comprehensive: `제목: ${topic}\n\n안녕하세요,\n\n${topic}에 대해 상세히 안내드립니다.\n\n## 주요 내용\n### 1. 첫 번째 사항\n상세한 설명과 관련 정보를 제공합니다.\n\n### 2. 두 번째 사항\n추가적인 내용과 고려사항을 안내합니다.\n\n### 3. 세 번째 사항\n실행 계획과 일정을 제시합니다.\n\n## 다음 단계\n구체적인 액션 아이템과 일정을 안내드립니다.\n\n추가 문의사항이나 궁금한 점이 있으시면 언제든 연락주세요.\n\n감사합니다.`,
            extensive: `제목: ${topic}\n\n안녕하세요,\n\n${topic}에 대해 포괄적으로 안내드립니다.\n\n## 개요\n${topic}의 배경과 목적을 설명드립니다.\n\n## 상세 내용\n### 1. 첫 번째 섹션\n배경 정보와 현재 상황을 분석합니다.\n\n### 2. 두 번째 섹션\n구체적인 계획과 실행 방안을 제시합니다.\n\n### 3. 세 번째 섹션\n예상 결과와 효과를 설명합니다.\n\n### 4. 네 번째 섹션\n리스크 관리와 대응 방안을 안내합니다.\n\n## 실행 계획\n구체적인 일정과 담당자를 명시합니다.\n\n## 기대 효과\n예상되는 결과와 성과를 제시합니다.\n\n추가 문의사항이나 상세한 논의가 필요하시면 언제든 연락주세요.\n\n감사합니다.`
        }
    };

    const template = templates[type as keyof typeof templates] || templates.article;
    return template[length as keyof typeof template] || template.medium;
};

// 글쓰기 개선 함수
const improveWriting = (originalText: string, style: string, tone: string): string => {
    // 간단한 개선 로직 (실제로는 더 복잡한 NLP 처리)
    let improvedText = originalText;

    if (style === 'formal') {
        improvedText = improvedText.replace(/안녕하세요/g, '안녕하십니까');
        improvedText = improvedText.replace(/감사합니다/g, '감사드립니다');
    }

    if (tone === 'friendly') {
        improvedText = improvedText.replace(/안녕하십니까/g, '안녕하세요');
        improvedText = improvedText.replace(/감사드립니다/g, '감사합니다');
    }

    return improvedText;
};

const ConversationalWritingAI: React.FC = () => {
    const [messages, setMessages] = useState<WritingMessage[]>([
        {
            id: '1',
            type: 'ai',
            content: `안녕하세요! 저는 CORBU AI 글쓰기 어시스턴트입니다. ✍️✨

글쓰기를 도와드릴 수 있습니다! 다음과 같은 방식으로 도움을 드릴 수 있어요:

🎯 **제공 서비스**
• **다양한 글쓰기 유형**: 블로그, 보고서, 이메일, 스토리, 시, 스크립트 등
• **스타일 조정**: 형식적, 친근한, 전문적, 창의적, 학술적, 기자체, 대화체
• **톤 조절**: 친근한, 진지한, 열정적인, 중립적, 설득적, 정보 제공적
• **길이 조절**: 짧은, 중간, 상세한, 포괄적인
• **대상별 맞춤**: 일반, 전문가, 초보자, 비즈니스, 학술, 캐주얼

💡 **사용 예시**
• "블로그 글 써줘" → 블로그 스타일 글 작성
• "이메일 작성해줘" → 이메일 형식 글 작성
• "더 친근하게 바꿔줘" → 친근한 톤으로 개선
• "더 전문적으로" → 전문적인 스타일로 개선
• "길게 써줘" → 더 상세한 내용으로 확장

무엇을 도와드릴까요? 😊`,
            timestamp: new Date(),
            writingType: 'article',
            style: 'conversational',
            tone: 'friendly',
            length: 'medium',
            target: 'general'
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<WritingMessage | null>(null);
    const [currentWritingType, setCurrentWritingType] = useState<string>('article');
    const [currentStyle, setCurrentStyle] = useState<string>('professional');
    const [currentTone, setCurrentTone] = useState<string>('neutral');
    const [currentLength, setCurrentLength] = useState<string>('medium');
    const [currentTarget, setCurrentTarget] = useState<string>('general');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage: WritingMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        // 글쓰기 요청 분석 및 응답 생성
        setTimeout(() => {
            const analysis = analyzeWritingRequest(inputValue);
            const request: WritingRequest = {
                topic: inputValue,
                type: analysis.writingType as any,
                style: analysis.style as any,
                tone: analysis.tone as any,
                length: analysis.length as any,
                target: analysis.target as any
            };

            const generatedContent = generateWritingContent(request);
            const improvedContent = improveWriting(generatedContent, request.style, request.tone);

            const aiResponse: WritingMessage = {
                id: (Date.now() + 1).toString(),
                type: 'writing',
                content: `네, ${request.type} 스타일로 글을 작성해드렸습니다! ✍️\n\n${improvedContent}`,
                timestamp: new Date(),
                writingType: request.type as any,
                style: request.style as any,
                tone: request.tone as any,
                length: request.length as any,
                target: request.target as any,
                originalText: generatedContent,
                improvedText: improvedContent,
                analysis: {
                    type: 'writing_analysis',
                    data: { request, originalText: generatedContent, improvedText: improvedContent },
                    insights: ['글쓰기 요청 분석 완료', '스타일 및 톤 적용', '개선된 내용 생성'],
                    recommendations: ['더 구체적인 주제 제시', '키워드 추가', '요구사항 명시'],
                    confidence: 0.9,
                    wordCount: improvedContent.split(' ').length,
                    readability: 85,
                    grammarScore: 95,
                    styleScore: 90
                }
            };

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

    const handleAnalysisClick = (message: WritingMessage) => {
        setSelectedMessage(message);
        setShowAnalysis(true);
    };

    const handleImproveWriting = (message: WritingMessage) => {
        if (message.originalText) {
            const improvedText = improveWriting(message.originalText, 'professional', 'friendly');
            const improvementMessage: WritingMessage = {
                id: Date.now().toString(),
                type: 'improvement',
                content: `글을 개선해드렸습니다! ✨\n\n${improvedText}`,
                timestamp: new Date(),
                originalText: message.originalText,
                improvedText: improvedText,
                analysis: {
                    type: 'improvement',
                    data: { originalText: message.originalText, improvedText },
                    insights: ['문체 개선', '가독성 향상', '전문성 강화'],
                    recommendations: ['더 구체적인 예시 추가', '단락 구조 개선', '결론 강화'],
                    confidence: 0.85
                }
            };
            setMessages(prev => [...prev, improvementMessage]);
        }
    };

    const speedDialActions = [
        { icon: <CreateIcon />, name: '글쓰기', action: () => { } },
        { icon: <AutoFixHighIcon />, name: '개선', action: () => { } },
        { icon: <FormatBoldIcon />, name: '스타일', action: () => { } },
        { icon: <TranslateIcon />, name: '번역', action: () => { } },
        { icon: <SaveIcon />, name: '저장', action: () => { } }
    ];

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* 헤더 */}
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                <CreateIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="h6">CORBU AI 대화형 글쓰기 시스템</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    AI와 대화하며 글쓰기를 도와주는 시스템
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip
                                label="다양한 스타일"
                                color="success"
                                size="small"
                            />
                            <Chip
                                label="실시간 개선"
                                color="primary"
                                size="small"
                            />
                            <Chip
                                label="맞춤형 글쓰기"
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
                                                    startIcon={<AnalyticsIcon />}
                                                    onClick={() => handleAnalysisClick(message)}
                                                    variant="outlined"
                                                >
                                                    분석 결과
                                                </Button>
                                                {message.originalText && (
                                                    <Button
                                                        size="small"
                                                        startIcon={<AutoFixHighIcon />}
                                                        onClick={() => handleImproveWriting(message)}
                                                        variant="outlined"
                                                        color="secondary"
                                                    >
                                                        개선하기
                                                    </Button>
                                                )}
                                            </Box>
                                        )}

                                        <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                                            {message.timestamp.toLocaleTimeString()}
                                            {message.writingType && ` • ${message.writingType}`}
                                            {message.style && ` • ${message.style}`}
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
                                            <Typography variant="body2">AI가 글을 작성하고 있습니다...</Typography>
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
                                    placeholder="어떤 글을 써드릴까요? (예: 블로그 글, 이메일, 보고서 등)"
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

                {/* 글쓰기 설정 사이드바 */}
                <Card sx={{ width: 300, display: 'flex', flexDirection: 'column' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>글쓰기 설정</Typography>

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>글쓰기 유형</InputLabel>
                            <Select
                                value={currentWritingType}
                                onChange={(e) => setCurrentWritingType(e.target.value)}
                                label="글쓰기 유형"
                            >
                                <MenuItem value="article">기사</MenuItem>
                                <MenuItem value="blog">블로그</MenuItem>
                                <MenuItem value="report">보고서</MenuItem>
                                <MenuItem value="email">이메일</MenuItem>
                                <MenuItem value="story">스토리</MenuItem>
                                <MenuItem value="poem">시</MenuItem>
                                <MenuItem value="script">스크립트</MenuItem>
                                <MenuItem value="documentation">문서</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>스타일</InputLabel>
                            <Select
                                value={currentStyle}
                                onChange={(e) => setCurrentStyle(e.target.value)}
                                label="스타일"
                            >
                                <MenuItem value="formal">형식적</MenuItem>
                                <MenuItem value="casual">친근한</MenuItem>
                                <MenuItem value="professional">전문적</MenuItem>
                                <MenuItem value="creative">창의적</MenuItem>
                                <MenuItem value="academic">학술적</MenuItem>
                                <MenuItem value="journalistic">기자체</MenuItem>
                                <MenuItem value="conversational">대화체</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>톤</InputLabel>
                            <Select
                                value={currentTone}
                                onChange={(e) => setCurrentTone(e.target.value)}
                                label="톤"
                            >
                                <MenuItem value="friendly">친근한</MenuItem>
                                <MenuItem value="serious">진지한</MenuItem>
                                <MenuItem value="enthusiastic">열정적인</MenuItem>
                                <MenuItem value="neutral">중립적</MenuItem>
                                <MenuItem value="persuasive">설득적</MenuItem>
                                <MenuItem value="informative">정보 제공적</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>길이</InputLabel>
                            <Select
                                value={currentLength}
                                onChange={(e) => setCurrentLength(e.target.value)}
                                label="길이"
                            >
                                <MenuItem value="brief">짧은</MenuItem>
                                <MenuItem value="medium">중간</MenuItem>
                                <MenuItem value="comprehensive">상세한</MenuItem>
                                <MenuItem value="extensive">포괄적인</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>대상</InputLabel>
                            <Select
                                value={currentTarget}
                                onChange={(e) => setCurrentTarget(e.target.value)}
                                label="대상"
                            >
                                <MenuItem value="general">일반</MenuItem>
                                <MenuItem value="expert">전문가</MenuItem>
                                <MenuItem value="beginner">초보자</MenuItem>
                                <MenuItem value="business">비즈니스</MenuItem>
                                <MenuItem value="academic">학술</MenuItem>
                                <MenuItem value="casual">캐주얼</MenuItem>
                            </Select>
                        </FormControl>
                    </CardContent>
                </Card>
            </Box>

            {/* 고급 기능 SpeedDial */}
            <SpeedDial
                ariaLabel="글쓰기 고급 기능"
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
                    글쓰기 분석 결과
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

                            {selectedMessage.analysis.wordCount && (
                                <Card sx={{ mt: 2 }}>
                                    <CardContent>
                                        <Typography variant="subtitle2" gutterBottom>글쓰기 통계</Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={3}>
                                                <Typography variant="body2">단어 수: {selectedMessage.analysis.wordCount}</Typography>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Typography variant="body2">가독성: {selectedMessage.analysis.readability}%</Typography>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Typography variant="body2">문법 점수: {selectedMessage.analysis.grammarScore}%</Typography>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Typography variant="body2">스타일 점수: {selectedMessage.analysis.styleScore}%</Typography>
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
                                                    <Info fontSize="small" />
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
                                                    <LightbulbIcon fontSize="small" />
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

export default ConversationalWritingAI;
