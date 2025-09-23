import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Paper,
    TextField,
    IconButton,
    Typography,
    Avatar,
    Chip,
    CircularProgress,
    Alert,
    Button,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Tooltip,
    Card,
    CardContent,
    Grid,
    Fade,
    Zoom
} from '@mui/material';
import {
    Send as SendIcon,
    SmartToy as BotIcon,
    Person as PersonIcon,
    Refresh as RefreshIcon,
    Lightbulb as LightbulbIcon,
    TrendingUp as TrendingUpIcon,
    Home as HomeIcon,
    Business as BusinessIcon,
    Analytics as AnalyticsIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import VoiceInterface from './VoiceInterface';

interface ChatMessage {
    id: string;
    type: 'user' | 'bot';
    message: string;
    intent?: string;
    service_used?: string;
    suggestions?: string[];
    timestamp: string;
    data?: any;
}

interface UnifiedChatInterfaceProps {
    onClose?: () => void;
}

const UnifiedChatInterface: React.FC<UnifiedChatInterfaceProps> = ({ onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastBotMessage, setLastBotMessage] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 샘플 환영 메시지
    const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'bot',
        message: '안녕하세요! CORBU AI입니다. 🏠\n\n부동산과 관련된 모든 질문을 도와드릴 수 있습니다:\n\n• 아파트 커뮤니티 분석\n• 시공사 정보 및 신뢰도\n• 부동산 시장 분석\n• 꿈의 집 계획 수립\n• 성능 최적화 및 확장성\n• 고급 AI 기능\n• 장기 계획 수립\n\n무엇을 도와드릴까요?',
        intent: 'welcome',
        timestamp: new Date().toISOString(),
        suggestions: [
            '아파트 커뮤니티를 분석해주세요',
            '시공사 정보를 알려주세요',
            '부동산 시장을 분석해주세요',
            '꿈의 집 계획을 세워주세요'
        ]
    };

    useEffect(() => {
        setMessages([welcomeMessage]);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const getIntentIcon = (intent: string) => {
        const iconMap: Record<string, React.ReactNode> = {
            'apartment_community': <HomeIcon />,
            'construction_company': <BusinessIcon />,
            'market_analysis': <TrendingUpIcon />,
            'dream_visualization': <VisibilityIcon />,
            'performance_optimization': <AnalyticsIcon />,
            'scalability': <AnalyticsIcon />,
            'advanced_ai': <BotIcon />,
            'long_term_planning': <LightbulbIcon />,
            'general_chat': <BotIcon />,
            'welcome': <BotIcon />
        };
        return iconMap[intent] || <BotIcon />;
    };

    const getIntentColor = (intent: string) => {
        const colorMap: Record<string, string> = {
            'apartment_community': '#4CAF50',
            'construction_company': '#FF9800',
            'market_analysis': '#2196F3',
            'dream_visualization': '#9C27B0',
            'performance_optimization': '#F44336',
            'scalability': '#607D8B',
            'advanced_ai': '#E91E63',
            'long_term_planning': '#795548',
            'general_chat': '#667eea',
            'welcome': '#667eea'
        };
        return colorMap[intent] || '#667eea';
    };

    const getIntentLabel = (intent: string) => {
        const labelMap: Record<string, string> = {
            'apartment_community': '커뮤니티 분석',
            'construction_company': '시공사 정보',
            'market_analysis': '시장 분석',
            'dream_visualization': '꿈 시각화',
            'performance_optimization': '성능 최적화',
            'scalability': '확장성 관리',
            'advanced_ai': '고급 AI',
            'long_term_planning': '장기 계획',
            'general_chat': '일반 채팅',
            'welcome': '환영'
        };
        return labelMap[intent] || '알 수 없음';
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || loading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            message: inputMessage.trim(),
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setLoading(true);
        setError(null);

        try {
            // 의도 분류 및 채팅 처리
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage.message,
                    user_id: 'user_001',
                    session_id: 'session_001'
                }),
            });

            if (response.ok) {
                const result = await response.json();

                const botMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    type: 'bot',
                    message: result.response,
                    intent: result.intent,
                    service_used: result.service_used,
                    suggestions: result.suggestions,
                    timestamp: result.timestamp,
                    data: result.data
                };

                setMessages(prev => [...prev, botMessage]);
                setLastBotMessage(botMessage.message);
            } else {
                const errorText = await response.text();
                console.error('Chat API 오류:', response.status, errorText);
                throw new Error(`채팅 처리 실패: ${response.status}`);
            }
        } catch (err) {
            console.error('채팅 처리 오류:', err);
            const errorMessage = err instanceof Error ? err.message : '채팅 처리 중 오류가 발생했습니다.';

            const errorBotMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'bot',
                message: `죄송합니다. ${errorMessage}\n\n다시 시도해주시거나 다른 질문을 해주세요.`,
                intent: 'error',
                timestamp: new Date().toISOString(),
                suggestions: [
                    '아파트 커뮤니티를 분석해주세요',
                    '시공사 정보를 알려주세요',
                    '부동산 시장을 분석해주세요'
                ]
            };

            setMessages(prev => [...prev, errorBotMessage]);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInputMessage(suggestion);
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    const clearChat = () => {
        setMessages([welcomeMessage]);
        setError(null);
        setLastBotMessage('');
    };

    const handleVoiceTranscript = (text: string) => {
        setInputMessage(text);
        // 음성으로 입력된 텍스트를 자동으로 전송
        setTimeout(() => {
            handleSendMessage();
        }, 500);
    };

    const handlePlayResponse = (text: string) => {
        // 마지막 봇 메시지를 음성으로 재생
        if (lastBotMessage) {
            const utterance = new SpeechSynthesisUtterance(lastBotMessage);
            utterance.lang = 'ko-KR';
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 0.8;
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
            {/* 헤더 */}
            <Paper elevation={2} sx={{ p: 2, bgcolor: '#667eea', color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: 'white', color: '#667eea', mr: 2 }}>
                            <BotIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                CORBU AI 통합 채팅
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                부동산 AI 전문가와 대화하세요
                            </Typography>
                        </Box>
                    </Box>
                    <Box>
                        <Tooltip title="채팅 초기화">
                            <IconButton onClick={clearChat} sx={{ color: 'white' }}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Paper>

            {/* 오류 메시지 */}
            {error && (
                <Alert
                    severity="error"
                    sx={{ m: 2 }}
                    onClose={() => setError(null)}
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={() => {
                                console.log('상세 오류 정보:', error);
                                alert(`상세 오류 정보:\n${error}\n\n브라우저 개발자 도구의 콘솔을 확인하세요.`);
                            }}
                        >
                            상세보기
                        </Button>
                    }
                >
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        오류가 발생했습니다:
                    </Typography>
                    <Typography variant="body2">{error}</Typography>
                </Alert>
            )}

            {/* 채팅 메시지 영역 */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {messages.map((message, index) => (
                    <Fade in={true} key={message.id} timeout={300}>
                        <Box sx={{ mb: 3 }}>
                            <Box sx={{
                                display: 'flex',
                                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                                alignItems: 'flex-start',
                                mb: 1
                            }}>
                                {message.type === 'bot' && (
                                    <Avatar sx={{
                                        bgcolor: getIntentColor(message.intent || 'general_chat'),
                                        mr: 2,
                                        mt: 0.5
                                    }}>
                                        {getIntentIcon(message.intent || 'general_chat')}
                                    </Avatar>
                                )}

                                <Paper
                                    elevation={2}
                                    sx={{
                                        p: 2,
                                        maxWidth: '70%',
                                        bgcolor: message.type === 'user' ? '#667eea' : 'white',
                                        color: message.type === 'user' ? 'white' : 'text.primary',
                                        borderRadius: message.type === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px'
                                    }}
                                >
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {message.message}
                                    </Typography>

                                    {message.intent && message.intent !== 'welcome' && (
                                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                                            <Chip
                                                label={getIntentLabel(message.intent)}
                                                size="small"
                                                sx={{
                                                    bgcolor: getIntentColor(message.intent),
                                                    color: 'white',
                                                    fontSize: '0.7rem'
                                                }}
                                            />
                                        </Box>
                                    )}
                                </Paper>

                                {message.type === 'user' && (
                                    <Avatar sx={{
                                        bgcolor: '#667eea',
                                        ml: 2,
                                        mt: 0.5
                                    }}>
                                        <PersonIcon />
                                    </Avatar>
                                )}
                            </Box>

                            {/* 추천 질문 */}
                            {message.suggestions && message.suggestions.length > 0 && (
                                <Box sx={{ ml: 7, mt: 1 }}>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                                        추천 질문:
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {message.suggestions.map((suggestion, idx) => (
                                            <Zoom in={true} key={idx} timeout={300 + idx * 100}>
                                                <Chip
                                                    label={suggestion}
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => handleSuggestionClick(suggestion)}
                                                    sx={{
                                                        cursor: 'pointer',
                                                        '&:hover': { bgcolor: 'primary.light', color: 'white' }
                                                    }}
                                                />
                                            </Zoom>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Fade>
                ))}

                {loading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: '#667eea', mr: 2 }}>
                            <BotIcon />
                        </Avatar>
                        <Paper elevation={2} sx={{ p: 2, bgcolor: 'white' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CircularProgress size={20} sx={{ mr: 2 }} />
                                <Typography variant="body2" color="text.secondary">
                                    AI가 답변을 준비하고 있습니다...
                                </Typography>
                            </Box>
                        </Paper>
                    </Box>
                )}

                <div ref={messagesEndRef} />
            </Box>

            {/* 음성 인터페이스 */}
            <Paper elevation={2} sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e0e0e0' }}>
                <VoiceInterface
                    onTranscript={handleVoiceTranscript}
                    onPlayResponse={handlePlayResponse}
                    disabled={loading}
                />
            </Paper>

            {/* 입력 영역 */}
            <Paper elevation={3} sx={{ p: 2, bgcolor: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                    <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="부동산과 관련된 질문을 입력하거나 음성으로 말해보세요..."
                        variant="outlined"
                        disabled={loading}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '25px',
                            }
                        }}
                    />
                    <IconButton
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || loading}
                        sx={{
                            bgcolor: '#667eea',
                            color: 'white',
                            '&:hover': { bgcolor: '#5a6fd8' },
                            '&:disabled': { bgcolor: '#e0e0e0', color: '#9e9e9e' }
                        }}
                    >
                        <SendIcon />
                    </IconButton>
                </Box>
                
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                    💡 Enter로 전송, Shift+Enter로 줄바꿈, 음성으로도 질문 가능합니다
                </Typography>
            </Paper>
        </Box>
    );
};

export default UnifiedChatInterface;
