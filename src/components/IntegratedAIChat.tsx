import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Chip,
    CircularProgress,
    Card,
    CardContent,
    Divider
} from '@mui/material';
import { Send, Psychology, Analytics, Speed } from '@mui/icons-material';
import { integratedAPIService, IntegratedAnalysisResponse } from '../services/integratedAPIService';
import SystemStatus from './SystemStatus';
import QuickActions from './QuickActions';
import SystemHealthMonitor from './SystemHealthMonitor';
import CreativeWriting from './CreativeWriting';
import PersuasionContent from './PersuasionContent';
import MarketingContent from './MarketingContent';
import AdvancedAnalytics from './AdvancedAnalytics';
import AIManagement from './AIManagement';

interface Message {
    id: string;
    text: string;
    timestamp: Date;
    analysis?: IntegratedAnalysisResponse['analysis'];
    isUser: boolean;
    sender?: string;
}

const IntegratedAIChat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
    const [systemMetrics, setSystemMetrics] = useState<{
        total_requests: number;
        successful_requests: number;
        failed_requests: number;
        average_response_time: number;
        last_updated: string;
    } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 컴포넌트 마운트 시 연결 상태 확인
    useEffect(() => {
        checkConnection();
        loadSystemMetrics();
    }, []);

    // 메시지가 추가될 때마다 스크롤을 맨 아래로
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const checkConnection = async () => {
        setConnectionStatus('checking');
        try {
            const isConnected = await integratedAPIService.testConnection();
            setConnectionStatus(isConnected ? 'connected' : 'disconnected');
        } catch (error) {
            setConnectionStatus('disconnected');
        }
    };

    const loadSystemMetrics = async () => {
        try {
            const status = await integratedAPIService.getSystemStatus();
            setSystemMetrics(status.metrics);
        } catch (error) {
            console.error('시스템 메트릭 로드 실패:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputMessage,
            timestamp: new Date(),
            isUser: true
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await integratedAPIService.analyzeMessage(inputMessage);

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: response.response,
                timestamp: new Date(),
                analysis: response.analysis,
                isUser: false
            };

            setMessages(prev => [...prev, aiMessage]);

            // 메트릭 업데이트
            loadSystemMetrics();
        } catch (error) {
            console.error('메시지 전송 실패:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: '죄송합니다. 메시지를 처리하는 중 오류가 발생했습니다.',
                timestamp: new Date(),
                isUser: false
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    const handleQuickAction = (message: string) => {
        setInputMessage(message);
        // 자동으로 메시지 전송
        setTimeout(() => {
            handleSendMessage();
        }, 100);
    };

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case '긍정': return '#4caf50';
            case '부정': return '#f44336';
            default: return '#2196f3';
        }
    };

    const getIntentColor = (intent: string) => {
        switch (intent) {
            case 'question': return '#ff9800';
            case 'request': return '#9c27b0';
            case 'gratitude': return '#4caf50';
            case 'greeting': return '#2196f3';
            default: return '#607d8b';
        }
    };

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* 헤더 */}
            <Paper sx={{ p: 2, borderRadius: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Psychology color="primary" />
                        <Typography variant="h6">CORBU AI 통합 채팅</Typography>
                        <Chip
                            label={connectionStatus === 'connected' ? '연결됨' : '연결 끊김'}
                            color={connectionStatus === 'connected' ? 'success' : 'error'}
                            size="small"
                        />
                    </Box>
                    {systemMetrics && (
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Chip
                                icon={<Speed />}
                                label={`${(systemMetrics.average_response_time * 1000).toFixed(0)}ms`}
                                size="small"
                                variant="outlined"
                            />
                            <Chip
                                icon={<Analytics />}
                                label={`${systemMetrics.successful_requests} 요청`}
                                size="small"
                                variant="outlined"
                            />
                        </Box>
                    )}
                </Box>
            </Paper>

            {/* 시스템 상태 모니터링 */}
            <Box sx={{ px: 2, py: 1 }}>
                <SystemStatus onStatusChange={(status) => setConnectionStatus(status)} />
            </Box>

            {/* 빠른 테스트 액션 */}
            <Box sx={{ px: 2, py: 1 }}>
                <QuickActions onActionClick={handleQuickAction} />
            </Box>

            {/* 시스템 헬스 모니터 */}
            <Box sx={{ px: 2, py: 1 }}>
                <SystemHealthMonitor />
            </Box>

            {/* 창작 글쓰기 */}
            <Box sx={{ px: 2, py: 1 }}>
                <CreativeWriting onContentGenerated={(content, type) => {
                    // 생성된 콘텐츠를 메시지로 추가
                    const newMessage: Message = {
                        id: Date.now().toString(),
                        text: `[${type === 'story' ? '스토리' : type === 'poem' ? '시' : '에세이'} 생성]\n\n${content}`,
                        timestamp: new Date(),
                        sender: 'ai',
                        isUser: false
                    };
                    setMessages(prev => [...prev, newMessage]);
                }} />
            </Box>

            {/* 설득 콘텐츠 생성 */}
            <Box sx={{ px: 2, py: 1 }}>
                <PersuasionContent onContentGenerated={(content, type) => {
                    // 생성된 콘텐츠를 메시지로 추가
                    const newMessage: Message = {
                        id: Date.now().toString(),
                        text: `[${type === 'construction' ? '건설사 설득' : '시공사 긍정'} 콘텐츠 생성]\n\n${content}`,
                        timestamp: new Date(),
                        sender: 'ai',
                        isUser: false
                    };
                    setMessages(prev => [...prev, newMessage]);
                }} />
            </Box>

            {/* 마케팅 콘텐츠 생성 */}
            <Box sx={{ px: 2, py: 1 }}>
                <MarketingContent onContentGenerated={(content, type) => {
                    // 생성된 콘텐츠를 메시지로 추가
                    const newMessage: Message = {
                        id: Date.now().toString(),
                        text: `[${type === 'social' ? '소셜미디어' : '이메일'} 마케팅 콘텐츠 생성]\n\n${content}`,
                        timestamp: new Date(),
                        sender: 'ai',
                        isUser: false
                    };
                    setMessages(prev => [...prev, newMessage]);
                }} />
            </Box>

            {/* 고급 분석 대시보드 */}
            <Box sx={{ px: 2, py: 1 }}>
                <AdvancedAnalytics onInsightGenerated={(insight) => {
                    // 생성된 인사이트를 메시지로 추가
                    const newMessage: Message = {
                        id: Date.now().toString(),
                        text: `[인사이트] ${insight}`,
                        timestamp: new Date(),
                        sender: 'ai',
                        isUser: false
                    };
                    setMessages(prev => [...prev, newMessage]);
                }} />
            </Box>

            {/* AI 관리 */}
            <Box sx={{ px: 2, py: 1 }}>
                <AIManagement onOptimizationComplete={(result) => {
                    // 최적화 결과를 메시지로 추가
                    const newMessage: Message = {
                        id: Date.now().toString(),
                        text: `[AI 관리] ${result}`,
                        timestamp: new Date(),
                        sender: 'ai',
                        isUser: false
                    };
                    setMessages(prev => [...prev, newMessage]);
                }} />
            </Box>

            {/* 메시지 영역 */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {messages.length === 0 && (
                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                        <Typography variant="h6" color="text.secondary">
                            안녕하세요! CORBU AI 통합 시스템입니다.
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            감정 분석, 의도 파악, 키워드 추출을 통한 종합적인 AI 분석을 제공합니다.
                        </Typography>
                    </Box>
                )}

                {messages.map((message) => (
                    <Box
                        key={message.id}
                        sx={{
                            display: 'flex',
                            justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                            mb: 2
                        }}
                    >
                        <Card
                            sx={{
                                maxWidth: '70%',
                                bgcolor: message.isUser ? 'primary.main' : 'grey.100',
                                color: message.isUser ? 'white' : 'text.primary'
                            }}
                        >
                            <CardContent sx={{ pb: 1 }}>
                                <Typography variant="body1">{message.text}</Typography>
                                <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 1 }}>
                                    {message.timestamp.toLocaleTimeString()}
                                </Typography>

                                {/* AI 메시지의 경우 분석 결과 표시 */}
                                {!message.isUser && message.analysis && (
                                    <Box sx={{ mt: 2 }}>
                                        <Divider sx={{ mb: 1 }} />
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            <Chip
                                                label={`감정: ${message.analysis.emotion.sentiment}`}
                                                size="small"
                                                sx={{
                                                    bgcolor: getSentimentColor(message.analysis.emotion.sentiment),
                                                    color: 'white',
                                                    fontSize: '0.7rem'
                                                }}
                                            />
                                            <Chip
                                                label={`의도: ${message.analysis.intent.type}`}
                                                size="small"
                                                sx={{
                                                    bgcolor: getIntentColor(message.analysis.intent.type),
                                                    color: 'white',
                                                    fontSize: '0.7rem'
                                                }}
                                            />
                                            <Chip
                                                label={`신뢰도: ${(message.analysis.emotion.confidence * 100).toFixed(0)}%`}
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontSize: '0.7rem' }}
                                            />
                                        </Box>
                                        {message.analysis.keywords.length > 0 && (
                                            <Box sx={{ mt: 1 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    키워드: {message.analysis.keywords.join(', ')}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Box>
                ))}

                {isLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                        <Card sx={{ bgcolor: 'grey.100' }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CircularProgress size={20} />
                                <Typography variant="body2">AI가 분석 중입니다...</Typography>
                            </CardContent>
                        </Card>
                    </Box>
                )}

                <div ref={messagesEndRef} />
            </Box>

            {/* 입력 영역 */}
            <Paper sx={{ p: 2, borderRadius: 0 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        placeholder="메시지를 입력하세요..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        variant="outlined"
                        size="small"
                    />
                    <Button
                        variant="contained"
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        sx={{ minWidth: 'auto', px: 2 }}
                    >
                        <Send />
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default IntegratedAIChat;
