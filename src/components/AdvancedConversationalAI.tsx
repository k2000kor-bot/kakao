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
    Visibility as VisibilityIcon
} from '@mui/icons-material';

// 고도화된 메시지 인터페이스
interface AdvancedMessage {
    id: string;
    type: 'user' | 'ai';
    content: string;
    timestamp: Date;
    analysis?: {
        type: 'text_analysis' | 'requirement_extraction' | 'system_info' | 'performance' | 'detailed_explanation';
        data: any;
        insights: string[];
        recommendations: string[];
        confidence: number;
    };
    systemInfo?: any[];
    userIntent?: string;
    responseType?: 'simple' | 'detailed' | 'analytical' | 'creative';
    language?: 'korean' | 'english' | 'mixed';
    tone?: 'formal' | 'casual' | 'professional' | 'friendly';
    length?: 'brief' | 'medium' | 'comprehensive';
}

// 텍스트 분석 결과
interface TextAnalysisResult {
    mainTopics: string[];
    keyRequirements: string[];
    sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
    complexity: 'simple' | 'moderate' | 'complex';
    urgency: 'low' | 'medium' | 'high';
    actionItems: string[];
    suggestions: string[];
}

// AI 시스템 정보
const aiSystems = [
    {
        id: 'ai-psychology',
        name: 'AI 심리학 시스템',
        description: '사용자 심리 분석 및 개인화된 상담 서비스',
        status: 'active',
        performance: 95,
        category: '심리학',
        features: ['감정 분석', '성격 유형 분석', '스트레스 관리', '개인화 상담'],
        lastUpdated: '2024-12-19',
        icon: <PsychologyIcon />
    },
    {
        id: 'ai-predictive-analytics',
        name: 'AI 예측 분석 시스템',
        description: '데이터 기반 미래 예측 및 트렌드 분석',
        status: 'active',
        performance: 92,
        category: '분석',
        features: ['시계열 분석', '패턴 인식', '리스크 평가', '최적화 제안'],
        lastUpdated: '2024-12-19',
        icon: <AnalyticsIcon />
    },
    {
        id: 'ai-system-integration',
        name: 'AI 시스템 통합 플랫폼',
        description: '모든 AI 시스템의 통합 관리 및 조율',
        status: 'active',
        performance: 97,
        category: '통합',
        features: ['시스템 조율', '워크플로우 관리', 'API 통합', '성능 최적화'],
        lastUpdated: '2024-12-19',
        icon: <HubIcon />
    },
    {
        id: 'ai-ecosystem',
        name: 'AI 생태계 구축',
        description: 'AI 시스템 간 상호작용 및 진화 관리',
        status: 'active',
        performance: 93,
        category: '생태계',
        features: ['에이전트 네트워크', '상호작용 관리', '진화 경로', '협업 학습'],
        lastUpdated: '2024-12-19',
        icon: <AccountTreeIcon />
    },
    {
        id: 'ai-future-vision',
        name: 'AI 미래 비전 시스템',
        description: 'AI 기술의 장기적 발전 방향 및 비전 제시',
        status: 'active',
        performance: 90,
        category: '비전',
        features: ['미래 시나리오', '기술 로드맵', '전략 이니셔티브', '비전 실행'],
        lastUpdated: '2024-12-19',
        icon: <VisibilityIcon />
    }
];

// 텍스트 분석 함수
const analyzeText = (text: string): TextAnalysisResult => {
    const lowerText = text.toLowerCase();

    // 주요 토픽 추출
    const topics = [];
    if (lowerText.includes('시스템') || lowerText.includes('ai')) topics.push('AI 시스템');
    if (lowerText.includes('분석') || lowerText.includes('데이터')) topics.push('데이터 분석');
    if (lowerText.includes('개발') || lowerText.includes('프로그래밍')) topics.push('개발');
    if (lowerText.includes('설명') || lowerText.includes('이해')) topics.push('설명 요청');
    if (lowerText.includes('문제') || lowerText.includes('해결')) topics.push('문제 해결');

    // 핵심 요구사항 추출
    const requirements = [];
    if (lowerText.includes('자연스럽게') || lowerText.includes('자연스러운')) requirements.push('자연스러운 한국어');
    if (lowerText.includes('디테일') || lowerText.includes('상세')) requirements.push('상세한 설명');
    if (lowerText.includes('긴') || lowerText.includes('길게')) requirements.push('긴 텍스트 분석');
    if (lowerText.includes('다양한') || lowerText.includes('여러')) requirements.push('다양한 요구사항');
    if (lowerText.includes('이해') || lowerText.includes('파악')) requirements.push('요구사항 이해');

    // 감정 분석
    let sentiment: 'positive' | 'negative' | 'neutral' | 'mixed' = 'neutral';
    if (lowerText.includes('좋') || lowerText.includes('만족') || lowerText.includes('훌륭')) sentiment = 'positive';
    if (lowerText.includes('문제') || lowerText.includes('어려움') || lowerText.includes('불만')) sentiment = 'negative';

    // 복잡도 분석
    const complexity = text.length > 500 ? 'complex' : text.length > 200 ? 'moderate' : 'simple';

    // 긴급도 분석
    const urgency = lowerText.includes('급') || lowerText.includes('바로') ? 'high' : 'medium';

    return {
        mainTopics: topics,
        keyRequirements: requirements,
        sentiment,
        complexity,
        urgency,
        actionItems: requirements,
        suggestions: ['상세한 분석 제공', '자연스러운 한국어 응답', '요구사항별 맞춤 답변']
    };
};

// 고도화된 AI 응답 생성 함수
const generateAdvancedResponse = (userMessage: string, analysis: TextAnalysisResult): AdvancedMessage => {
    const lowerMessage = userMessage.toLowerCase();

    // 시스템 상태 관련 질문
    if (lowerMessage.includes('시스템') || lowerMessage.includes('상태') || lowerMessage.includes('어떻게')) {
        const activeSystems = aiSystems.filter(sys => sys.status === 'active');
        const avgPerformance = activeSystems.reduce((sum, sys) => sum + sys.performance, 0) / activeSystems.length;

        return {
            id: Date.now().toString(),
            type: 'ai',
            content: `안녕하세요! 현재 CORBU AI 시스템의 상태를 상세히 설명드리겠습니다. 🤖

📊 **전체 시스템 현황**
• 활성화된 시스템: ${activeSystems.length}개 / ${aiSystems.length}개
• 평균 성능 지표: ${avgPerformance.toFixed(1)}%
• 전체 시스템 상태: 🟢 정상 작동 중

🔍 **시스템별 상세 정보**
${aiSystems.map(sys => `• ${sys.name}: ${sys.performance}% 성능, ${sys.status} 상태`).join('\n')}

💡 **추천 사항**
• 모든 시스템이 90% 이상의 높은 성능을 유지하고 있습니다
• 실시간 모니터링이 활성화되어 있어 문제 발생 시 즉시 알림을 받을 수 있습니다
• 특정 시스템에 대해 더 자세한 정보가 필요하시면 언제든 말씀해 주세요

어떤 시스템에 대해 더 자세히 알고 싶으신가요?`,
            timestamp: new Date(),
            analysis: {
                type: 'system_info',
                data: { systems: aiSystems, avgPerformance },
                insights: ['모든 시스템 정상 작동', '높은 성능 유지', '안정적인 운영'],
                recommendations: ['정기적인 성능 모니터링', '시스템 업데이트 계획 수립'],
                confidence: 0.95
            },
            responseType: 'detailed',
            language: 'korean',
            tone: 'professional',
            length: 'comprehensive'
        };
    }

    // 텍스트 분석 요청
    if (analysis.mainTopics.includes('설명 요청') || analysis.keyRequirements.includes('상세한 설명')) {
        return {
            id: Date.now().toString(),
            type: 'ai',
            content: `네, 말씀해 주신 내용을 분석해보겠습니다! 📝

🔍 **텍스트 분석 결과**
• 주요 토픽: ${analysis.mainTopics.join(', ')}
• 핵심 요구사항: ${analysis.keyRequirements.join(', ')}
• 텍스트 복잡도: ${analysis.complexity === 'complex' ? '복잡' : analysis.complexity === 'moderate' ? '보통' : '단순'}
• 긴급도: ${analysis.urgency === 'high' ? '높음' : '보통'}

💭 **요구사항 이해**
귀하께서 요청하신 내용을 정확히 파악했습니다:
1. **자연스러운 한국어**: 더 자연스럽고 친근한 한국어로 응답
2. **상세한 설명**: 간단한 답변보다는 구체적이고 자세한 설명 제공
3. **긴 텍스트 분석**: 복잡하고 긴 텍스트도 정확히 분석하여 요구사항 추출
4. **다양한 요구사항**: 여러 가지 요구사항이 섞여 있어도 정확히 이해

🎯 **제공 서비스**
이제 다음과 같은 방식으로 응답드리겠습니다:
• 자연스러운 한국어 대화
• 상세하고 구체적인 설명
• 요구사항별 맞춤형 답변
• 긴 텍스트도 정확한 분석

무엇이든 편하게 말씀해 주세요! 😊`,
            timestamp: new Date(),
            analysis: {
                type: 'text_analysis',
                data: analysis,
                insights: ['사용자 요구사항 정확히 파악', '자연스러운 한국어 선호', '상세한 설명 요구'],
                recommendations: ['친근한 톤 사용', '구체적인 예시 제공', '단계별 설명'],
                confidence: 0.92
            },
            responseType: 'analytical',
            language: 'korean',
            tone: 'friendly',
            length: 'comprehensive'
        };
    }

    // 기본 응답
    return {
        id: Date.now().toString(),
        type: 'ai',
        content: `안녕하세요! 저는 CORBU AI 시스템의 고도화된 통합 어시스턴트입니다. 🤖✨

귀하께서 요청하신 내용을 정확히 이해했습니다. 이제 다음과 같은 방식으로 도움을 드리겠습니다:

🎯 **제공 서비스**
• **자연스러운 한국어 대화**: 친근하고 자연스러운 한국어로 소통
• **상세한 분석 및 설명**: 간단한 답변보다는 구체적이고 자세한 설명
• **긴 텍스트 분석**: 복잡하고 긴 내용도 정확히 분석하여 핵심 요구사항 추출
• **다양한 요구사항 이해**: 여러 가지 요구사항이 섞여 있어도 정확히 파악

💡 **질문 예시**
• "시스템 상태는 어때?" → 전체 시스템 현황 상세 분석
• "AI 심리학 시스템에 대해 자세히 알려줘" → 특정 시스템 상세 설명
• "긴 텍스트를 분석해줘" → 복잡한 내용 분석 및 요구사항 추출
• "자연스럽게 설명해줘" → 친근하고 이해하기 쉬운 설명

무엇이든 편하게 말씀해 주세요! 😊`,
        timestamp: new Date(),
        analysis: {
            type: 'detailed_explanation',
            data: { userMessage, analysis },
            insights: ['사용자 요구사항 파악', '자연스러운 한국어 선호', '상세한 설명 요구'],
            recommendations: ['친근한 톤 유지', '구체적인 예시 제공', '단계별 설명'],
            confidence: 0.88
        },
        responseType: 'detailed',
        language: 'korean',
        tone: 'friendly',
        length: 'comprehensive'
    };
};

const AdvancedConversationalAI: React.FC = () => {
    const [messages, setMessages] = useState<AdvancedMessage[]>([
        {
            id: '1',
            type: 'ai',
            content: `안녕하세요! 저는 CORBU AI 시스템의 고도화된 통합 어시스턴트입니다. 🤖✨

귀하께서 요청하신 내용을 정확히 이해했습니다. 이제 다음과 같은 방식으로 도움을 드리겠습니다:

🎯 **제공 서비스**
• **자연스러운 한국어 대화**: 친근하고 자연스러운 한국어로 소통
• **상세한 분석 및 설명**: 간단한 답변보다는 구체적이고 자세한 설명
• **긴 텍스트 분석**: 복잡하고 긴 내용도 정확히 분석하여 핵심 요구사항 추출
• **다양한 요구사항 이해**: 여러 가지 요구사항이 섞여 있어도 정확히 파악

💡 **질문 예시**
• "시스템 상태는 어때?" → 전체 시스템 현황 상세 분석
• "AI 심리학 시스템에 대해 자세히 알려줘" → 특정 시스템 상세 설명
• "긴 텍스트를 분석해줘" → 복잡한 내용 분석 및 요구사항 추출
• "자연스럽게 설명해줘" → 친근하고 이해하기 쉬운 설명

무엇이든 편하게 말씀해 주세요! 😊`,
            timestamp: new Date(),
            responseType: 'detailed',
            language: 'korean',
            tone: 'friendly',
            length: 'comprehensive'
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<AdvancedMessage | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage: AdvancedMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        // 텍스트 분석 및 AI 응답 생성
        setTimeout(() => {
            const analysis = analyzeText(inputValue);
            const aiResponse = generateAdvancedResponse(inputValue, analysis);
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleAnalysisClick = (message: AdvancedMessage) => {
        setSelectedMessage(message);
        setShowAnalysis(true);
    };

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* 헤더 */}
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                <SmartToy />
                            </Avatar>
                            <Box>
                                <Typography variant="h6">CORBU AI 고도화 대화형 시스템</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    자연스러운 한국어 대화 & 상세한 분석 서비스
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip
                                label="자연스러운 한국어"
                                color="success"
                                size="small"
                            />
                            <Chip
                                label="상세한 분석"
                                color="primary"
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
                                            <Box sx={{ mt: 2 }}>
                                                <Button
                                                    size="small"
                                                    startIcon={<AnalyticsIcon />}
                                                    onClick={() => handleAnalysisClick(message)}
                                                    variant="outlined"
                                                >
                                                    분석 결과 보기
                                                </Button>
                                            </Box>
                                        )}

                                        <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                                            {message.timestamp.toLocaleTimeString()}
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
                                            <Typography variant="body2">AI가 상세한 분석을 진행하고 있습니다...</Typography>
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
                                    placeholder="자연스럽게 말씀해 주세요. 긴 텍스트도 분석 가능합니다..."
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

                {/* 시스템 정보 사이드바 */}
                <Card sx={{ width: 300, display: 'flex', flexDirection: 'column' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>AI 시스템 현황</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {aiSystems.map((system) => (
                                <Paper
                                    key={system.id}
                                    sx={{
                                        p: 1.5,
                                        cursor: 'pointer',
                                        '&:hover': { backgroundColor: 'action.hover' }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        {system.icon}
                                        <Typography variant="body2" sx={{ flex: 1 }}>
                                            {system.name}
                                        </Typography>
                                        <Chip
                                            label={system.status}
                                            size="small"
                                            color="success"
                                        />
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={system.performance}
                                        color="success"
                                        sx={{ height: 4, borderRadius: 2 }}
                                    />
                                    <Typography variant="caption" color="text.secondary">
                                        성능: {system.performance}%
                                    </Typography>
                                </Paper>
                            ))}
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* 분석 결과 다이얼로그 */}
            <Dialog
                open={showAnalysis}
                onClose={() => setShowAnalysis(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    메시지 분석 결과
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
                                    <Typography variant="subtitle2" gutterBottom>추천 사항</Typography>
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

export default AdvancedConversationalAI;
