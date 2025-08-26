import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Box,
    Paper,
    Typography,
    Avatar,
    Chip,
    IconButton,
    Divider,
    CircularProgress,
    Tooltip,
    Badge,
    Alert,
    Collapse,
    LinearProgress,
    Card,
    CardContent,
    Grid,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Rating,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import {
    Send as SendIcon,
    SmartToy as AIIcon,
    Person as UserIcon,
    Psychology as PsychologyIcon,
    Memory as MemoryIcon,
    TrendingUp as TrendingUpIcon,
    Lightbulb as LightbulbIcon,
    School as SchoolIcon,
    Assessment as AssessmentIcon,
    Feedback as FeedbackIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Refresh as RefreshIcon,
    Bookmark as BookmarkIcon,
    Share as ShareIcon,
    Download as DownloadIcon,
    Settings as SettingsIcon,
    Help as HelpIcon,
    Close as CloseIcon,
    ThumbUp as ThumbUpIcon,
    ThumbDown as ThumbDownIcon,
    Star as StarIcon,
    AutoAwesome as AutoAwesomeIcon,
    Speed as SpeedIcon,
    Psychology as PsychologyIcon2
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import AdvancedInputForm from './AdvancedInputForm';
import advancedConversationMemoryService from '../services/advancedConversationMemoryService';
import personalizedLearningExperienceService from '../services/personalizedLearningExperienceService';
import advancedQuestionUnderstandingEngine from '../services/advancedQuestionUnderstandingEngine';
import integratedAIService from '../services/integratedAIService';

// 고급 채팅 인터페이스 스타일
const ChatContainer = styled(Paper)(({ theme }) => ({
    height: '80vh',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: theme.spacing(2),
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    overflow: 'hidden'
}));

const ChatHeader = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2, 3),
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
    flex: 1,
    overflowY: 'auto',
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    '&::-webkit-scrollbar': {
        width: '8px'
    },
    '&::-webkit-scrollbar-track': {
        background: 'rgba(0, 0, 0, 0.1)',
        borderRadius: '4px'
    },
    '&::-webkit-scrollbar-thumb': {
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '4px',
        '&:hover': {
            background: 'rgba(0, 0, 0, 0.5)'
        }
    }
}));

const MessageBubble = styled(Box)<{ isAI: boolean }>(({ theme, isAI }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    justifyContent: isAI ? 'flex-start' : 'flex-end',
    alignItems: 'flex-start',
    maxWidth: '80%',
    alignSelf: isAI ? 'flex-start' : 'flex-end'
}));

const MessageContent = styled(Paper)<{ isAI: boolean }>(({ theme, isAI }) => ({
    padding: theme.spacing(2),
    borderRadius: theme.spacing(2),
    background: isAI
        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        : 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
    color: 'white',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    '&::before': isAI ? {
        content: '""',
        position: 'absolute',
        left: '-8px',
        top: '12px',
        width: 0,
        height: 0,
        borderTop: '8px solid transparent',
        borderBottom: '8px solid transparent',
        borderRight: '8px solid #667eea'
    } : {
        content: '""',
        position: 'absolute',
        right: '-8px',
        top: '12px',
        width: 0,
        height: 0,
        borderTop: '8px solid transparent',
        borderBottom: '8px solid transparent',
        borderLeft: '8px solid #74b9ff'
    }
}));

const AnalysisPanel = styled(Card)(({ theme }) => ({
    marginTop: theme.spacing(2),
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
}));

const LearningInsight = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    borderRadius: theme.spacing(1),
    marginTop: theme.spacing(1),
    border: '1px solid rgba(255, 255, 255, 0.3)'
}));

// 인터페이스 정의
interface ChatMessage {
    id: string;
    content: string;
    isAI: boolean;
    timestamp: Date;
    understanding_result?: any;
    learning_insights?: any;
    user_feedback?: UserFeedback;
    metadata: MessageMetadata;
}

interface UserFeedback {
    rating: number;
    helpful: boolean;
    clear: boolean;
    complete: boolean;
    suggestions: string[];
    emotional_response: 'positive' | 'neutral' | 'negative';
}

interface MessageMetadata {
    processing_time: number;
    model_used: string;
    confidence_score: number;
    flags: string[];
    personalized_content: boolean;
    memory_integrated: boolean;
}

interface AdvancedChatInterfaceProps {
    userId?: string;
    sessionId?: string;
}

const AdvancedChatInterface: React.FC<AdvancedChatInterfaceProps> = ({
    userId = 'user-1',
    sessionId = 'session-1'
}) => {
    // 상태 관리
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [showLearningInsights, setShowLearningInsights] = useState(false);
    const [conversationMemory, setConversationMemory] = useState<any>(null);
    const [learningExperience, setLearningExperience] = useState<any>(null);
    const [personalizedSuggestions, setPersonalizedSuggestions] = useState<string[]>([]);
    const [feedbackDialog, setFeedbackDialog] = useState<{ open: boolean; messageId: string | null }>({
        open: false,
        messageId: null
    });
    const [feedback, setFeedback] = useState<UserFeedback>({
        rating: 5,
        helpful: true,
        clear: true,
        complete: true,
        suggestions: [],
        emotional_response: 'positive'
    });

    // 참조
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // 초기화
    useEffect(() => {
        initializeServices();
        scrollToBottom();
    }, []);

    // 서비스 초기화
    const initializeServices = async () => {
        try {
            // 대화 메모리 초기화
            const memory = await advancedConversationMemoryService.getUserMemory(userId, sessionId);
            setConversationMemory(memory);

            // 학습 경험 초기화
            const experience = await personalizedLearningExperienceService.getLearningExperience(userId, sessionId);
            setLearningExperience(experience);

            // 개인화된 제안 가져오기
            const suggestions = await advancedConversationMemoryService.getPersonalizedSuggestions(userId, sessionId);
            setPersonalizedSuggestions(suggestions);

            // 환영 메시지
            addWelcomeMessage(experience);
        } catch (error) {
            console.error('Service initialization error:', error);
        }
    };

    // 환영 메시지 추가
    const addWelcomeMessage = (experience: any) => {
        const welcomeMessage: ChatMessage = {
            id: 'welcome-1',
            content: `안녕하세요! 🤖 CORBU AI입니다.

현재 ${experience?.current_learning_path?.path_name || '웹 개발'} 학습 경로를 진행 중이시네요.

${personalizedSuggestions.length > 0 ? `💡 개인화된 제안: ${personalizedSuggestions[0]}` : ''}

무엇을 도와드릴까요?`,
            isAI: true,
            timestamp: new Date(),
            metadata: {
                processing_time: 0,
                model_used: 'welcome-system',
                confidence_score: 1.0,
                flags: ['welcome', 'personalized'],
                personalized_content: true,
                memory_integrated: true
            }
        };

        setMessages([welcomeMessage]);
    };

    // 메시지 전송 처리
    const handleMessageSubmit = async (input: string, context: any) => {
        if (!input.trim() || isLoading) return;

        // 사용자 메시지 추가
        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            content: input,
            isAI: false,
            timestamp: new Date(),
            metadata: {
                processing_time: 0,
                model_used: 'user-input',
                confidence_score: 1.0,
                flags: ['user_message'],
                personalized_content: false,
                memory_integrated: false
            }
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            // 고급 질문 이해
            const understandingResult = await advancedQuestionUnderstandingEngine.quickUnderstand(input);

            // 통합 AI 서비스로 응답 생성
            const aiResponse = await integratedAIService.generateResponse(input, {
                user_id: userId,
                session_id: sessionId,
                conversation_memory: conversationMemory,
                learning_experience: learningExperience,
                understanding_result: understandingResult,
                context: context
            });

            // AI 응답 메시지 생성
            const aiMessage: ChatMessage = {
                id: `ai-${Date.now()}`,
                content: aiResponse.content,
                isAI: true,
                timestamp: new Date(),
                understanding_result: understandingResult,
                learning_insights: aiResponse.learning_insights,
                metadata: {
                    processing_time: aiResponse.processing_time || 0,
                    model_used: aiResponse.model_used || 'integrated-ai',
                    confidence_score: aiResponse.confidence_score || 0.8,
                    flags: aiResponse.flags || [],
                    personalized_content: aiResponse.personalized || false,
                    memory_integrated: aiResponse.memory_integrated || false
                }
            };

            setMessages(prev => [...prev, aiMessage]);

            // 대화 메모리 업데이트
            await advancedConversationMemoryService.addConversationEntry(
                userId,
                sessionId,
                input,
                aiResponse.content,
                understandingResult
            );

            // 학습 경험 업데이트
            if (aiResponse.learning_insights) {
                await updateLearningExperience(aiResponse.learning_insights);
            }

            // 개인화된 제안 업데이트
            const newSuggestions = await advancedConversationMemoryService.getPersonalizedSuggestions(userId, sessionId);
            setPersonalizedSuggestions(newSuggestions);

        } catch (error) {
            console.error('Message processing error:', error);

            // 에러 메시지
            const errorMessage: ChatMessage = {
                id: `error-${Date.now()}`,
                content: '죄송합니다. 응답을 생성하는 중에 오류가 발생했습니다. 다시 시도해주세요.',
                isAI: true,
                timestamp: new Date(),
                metadata: {
                    processing_time: 0,
                    model_used: 'error-handler',
                    confidence_score: 0,
                    flags: ['error'],
                    personalized_content: false,
                    memory_integrated: false
                }
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            scrollToBottom();
        }
    };

    // 학습 경험 업데이트
    const updateLearningExperience = async (insights: any) => {
        try {
            if (insights.module_progress) {
                await personalizedLearningExperienceService.updateLearningProgress(
                    userId,
                    sessionId,
                    insights.module_id,
                    insights.progress,
                    insights.performance_score
                );
            }

            // 학습 경험 새로고침
            const updatedExperience = await personalizedLearningExperienceService.getLearningExperience(userId, sessionId);
            setLearningExperience(updatedExperience);
        } catch (error) {
            console.error('Learning experience update error:', error);
        }
    };

    // 피드백 제출
    const handleFeedbackSubmit = async () => {
        if (!feedbackDialog.messageId) return;

        try {
            await advancedConversationMemoryService.updateUserFeedback(
                userId,
                sessionId,
                feedbackDialog.messageId,
                feedback
            );

            // 메시지 업데이트
            setMessages(prev => prev.map(msg =>
                msg.id === feedbackDialog.messageId
                    ? { ...msg, user_feedback: feedback }
                    : msg
            ));

            setFeedbackDialog({ open: false, messageId: null });
            setFeedback({
                rating: 5,
                helpful: true,
                clear: true,
                complete: true,
                suggestions: [],
                emotional_response: 'positive'
            });
        } catch (error) {
            console.error('Feedback submission error:', error);
        }
    };

    // 스크롤 처리
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // 메시지 렌더링
    const renderMessage = (message: ChatMessage) => {
        const isAI = message.isAI;
        const hasUnderstanding = message.understanding_result;
        const hasLearningInsights = message.learning_insights;

        return (
            <MessageBubble key={message.id} isAI={isAI}>
                {isAI && (
                    <Avatar sx={{ bgcolor: '#667eea', width: 32, height: 32 }}>
                        <AIIcon />
                    </Avatar>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
                    <MessageContent isAI={isAI}>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {message.content}
                        </Typography>

                        {/* 메시지 메타데이터 */}
                        <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                {message.timestamp.toLocaleTimeString()}
                            </Typography>

                            {message.metadata.personalized_content && (
                                <Chip
                                    label="개인화"
                                    size="small"
                                    icon={<AutoAwesomeIcon />}
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                            )}

                            {message.metadata.memory_integrated && (
                                <Chip
                                    label="메모리"
                                    size="small"
                                    icon={<MemoryIcon />}
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                            )}
                        </Box>
                    </MessageContent>

                    {/* AI 메시지 액션 버튼들 */}
                    {isAI && (
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                            <Tooltip title="도움이 됐어요">
                                <IconButton
                                    size="small"
                                    onClick={() => handleQuickFeedback(message.id, 'positive')}
                                    sx={{ color: message.user_feedback?.emotional_response === 'positive' ? 'green' : 'inherit' }}
                                >
                                    <ThumbUpIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="도움이 안 됐어요">
                                <IconButton
                                    size="small"
                                    onClick={() => handleQuickFeedback(message.id, 'negative')}
                                    sx={{ color: message.user_feedback?.emotional_response === 'negative' ? 'red' : 'inherit' }}
                                >
                                    <ThumbDownIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="상세 피드백">
                                <IconButton
                                    size="small"
                                    onClick={() => setFeedbackDialog({ open: true, messageId: message.id })}
                                >
                                    <FeedbackIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>

                            {hasUnderstanding && (
                                <Tooltip title="분석 결과 보기">
                                    <IconButton
                                        size="small"
                                        onClick={() => setShowAnalysis(!showAnalysis)}
                                    >
                                        <PsychologyIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}

                            {hasLearningInsights && (
                                <Tooltip title="학습 인사이트">
                                    <IconButton
                                        size="small"
                                        onClick={() => setShowLearningInsights(!showLearningInsights)}
                                    >
                                        <SchoolIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                    )}
                </Box>

                {!isAI && (
                    <Avatar sx={{ bgcolor: '#74b9ff', width: 32, height: 32 }}>
                        <UserIcon />
                    </Avatar>
                )}
            </MessageBubble>
        );
    };

    // 빠른 피드백 처리
    const handleQuickFeedback = async (messageId: string, response: 'positive' | 'negative') => {
        const quickFeedback: UserFeedback = {
            rating: response === 'positive' ? 5 : 2,
            helpful: response === 'positive',
            clear: response === 'positive',
            complete: response === 'positive',
            suggestions: [],
            emotional_response: response
        };

        try {
            await advancedConversationMemoryService.updateUserFeedback(
                userId,
                sessionId,
                messageId,
                quickFeedback
            );

            // 메시지 업데이트
            setMessages(prev => prev.map(msg =>
                msg.id === messageId
                    ? { ...msg, user_feedback: quickFeedback }
                    : msg
            ));
        } catch (error) {
            console.error('Quick feedback error:', error);
        }
    };

    // 분석 패널 렌더링
    const renderAnalysisPanel = () => {
        const lastAIMessage = messages.filter(m => m.isAI && m.understanding_result).pop();
        if (!lastAIMessage?.understanding_result) return null;

        const analysis = lastAIMessage.understanding_result;

        return (
            <AnalysisPanel>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PsychologyIcon color="primary" />
                        질문 분석 결과
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                            <Typography variant="subtitle2" color="textSecondary">의도</Typography>
                            <Chip label={analysis.intent_clarification?.primary_intent || '일반'} size="small" />
                        </Grid>

                        <Grid item xs={6} md={3}>
                            <Typography variant="subtitle2" color="textSecondary">복잡도</Typography>
                            <Chip
                                label={`${analysis.semantic_analysis?.complexity_assessment?.overall_complexity || 5}/10`}
                                size="small"
                                color="primary"
                            />
                        </Grid>

                        <Grid item xs={6} md={3}>
                            <Typography variant="subtitle2" color="textSecondary">도메인</Typography>
                            <Chip
                                label={analysis.semantic_analysis?.domain_classification?.primary_domain || '일반'}
                                size="small"
                            />
                        </Grid>

                        <Grid item xs={6} md={3}>
                            <Typography variant="subtitle2" color="textSecondary">신뢰도</Typography>
                            <Chip
                                label={`${Math.round((analysis.confidence_score || 0.5) * 100)}%`}
                                size="small"
                                color="success"
                            />
                        </Grid>
                    </Grid>

                    {analysis.semantic_analysis?.core_concepts?.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                핵심 개념
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {analysis.semantic_analysis.core_concepts.slice(0, 5).map((concept: any, index: number) => (
                                    <Chip
                                        key={index}
                                        label={concept.concept}
                                        size="small"
                                        variant="outlined"
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}
                </CardContent>
            </AnalysisPanel>
        );
    };

    // 학습 인사이트 패널 렌더링
    const renderLearningInsightsPanel = () => {
        const lastAIMessage = messages.filter(m => m.isAI && m.learning_insights).pop();
        if (!lastAIMessage?.learning_insights) return null;

        const insights = lastAIMessage.learning_insights;

        return (
            <LearningInsight>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SchoolIcon color="primary" />
                    학습 인사이트
                </Typography>

                <Grid container spacing={2}>
                    {insights.current_progress && (
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="textSecondary">현재 진행률</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={insights.current_progress}
                                    sx={{ flex: 1 }}
                                />
                                <Typography variant="body2">{insights.current_progress}%</Typography>
                            </Box>
                        </Grid>
                    )}

                    {insights.next_recommendation && (
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="textSecondary">다음 추천</Typography>
                            <Typography variant="body2">{insights.next_recommendation}</Typography>
                        </Grid>
                    )}
                </Grid>

                {insights.skill_gaps && insights.skill_gaps.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            발견된 지식 격차
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {insights.skill_gaps.map((gap: any, index: number) => (
                                <Chip
                                    key={index}
                                    label={gap.description}
                                    size="small"
                                    color="warning"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Box>
                )}
            </LearningInsight>
        );
    };

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: 2 }}>
            <ChatContainer>
                {/* 헤더 */}
                <ChatHeader>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                            <AIIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="h6" fontWeight="bold">
                                CORBU AI
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                {learningExperience?.current_learning_path?.path_name || '개인화된 학습 도우미'}
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="학습 진행률">
                            <IconButton size="small" sx={{ color: 'white' }}>
                                <TrendingUpIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="설정">
                            <IconButton size="small" sx={{ color: 'white' }}>
                                <SettingsIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="도움말">
                            <IconButton size="small" sx={{ color: 'white' }}>
                                <HelpIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </ChatHeader>

                {/* 메시지 컨테이너 */}
                <MessagesContainer ref={messagesContainerRef}>
                    {messages.map(renderMessage)}

                    {/* 로딩 인디케이터 */}
                    {isLoading && (
                        <MessageBubble isAI={true}>
                            <Avatar sx={{ bgcolor: '#667eea', width: 32, height: 32 }}>
                                <AIIcon />
                            </Avatar>
                            <MessageContent isAI={true}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CircularProgress size={16} />
                                    <Typography variant="body2">생각 중...</Typography>
                                </Box>
                            </MessageContent>
                        </MessageBubble>
                    )}

                    <div ref={messagesEndRef} />
                </MessagesContainer>

                {/* 분석 패널 */}
                <Collapse in={showAnalysis}>
                    {renderAnalysisPanel()}
                </Collapse>

                {/* 학습 인사이트 패널 */}
                <Collapse in={showLearningInsights}>
                    {renderLearningInsightsPanel()}
                </Collapse>

                {/* 입력 폼 */}
                <Box sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
                    <AdvancedInputForm
                        onSubmit={handleMessageSubmit}
                        isLoading={isLoading}
                        disabled={false}
                    />
                </Box>
            </ChatContainer>

            {/* 피드백 다이얼로그 */}
            <Dialog
                open={feedbackDialog.open}
                onClose={() => setFeedbackDialog({ open: false, messageId: null })}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FeedbackIcon color="primary" />
                        응답 피드백
                    </Box>
                </DialogTitle>

                <DialogContent>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>전체적인 만족도</Typography>
                        <Rating
                            value={feedback.rating}
                            onChange={(_, value) => setFeedback(prev => ({ ...prev, rating: value || 5 }))}
                            size="large"
                        />
                    </Box>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>감정적 반응</InputLabel>
                                <Select
                                    value={feedback.emotional_response}
                                    onChange={(e) => setFeedback(prev => ({
                                        ...prev,
                                        emotional_response: e.target.value as any
                                    }))}
                                >
                                    <MenuItem value="positive">긍정적</MenuItem>
                                    <MenuItem value="neutral">중립적</MenuItem>
                                    <MenuItem value="negative">부정적</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>명확성</InputLabel>
                                <Select
                                    value={feedback.clear ? 'clear' : 'unclear'}
                                    onChange={(e) => setFeedback(prev => ({
                                        ...prev,
                                        clear: e.target.value === 'clear'
                                    }))}
                                >
                                    <MenuItem value="clear">명확함</MenuItem>
                                    <MenuItem value="unclear">불명확함</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="개선 제안사항"
                            placeholder="더 나은 응답을 위한 제안사항을 입력해주세요..."
                            value={feedback.suggestions.join(', ')}
                            onChange={(e) => setFeedback(prev => ({
                                ...prev,
                                suggestions: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                            }))}
                        />
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setFeedbackDialog({ open: false, messageId: null })}>
                        취소
                    </Button>
                    <Button onClick={handleFeedbackSubmit} variant="contained">
                        피드백 제출
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdvancedChatInterface;
