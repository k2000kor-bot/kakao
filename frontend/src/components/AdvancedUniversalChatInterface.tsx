import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Chip,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    IconButton,
    Tooltip,
    Divider
} from '@mui/material';
import {
    Send as SendIcon,
    Psychology as PsychologyIcon,
    AutoAwesome as AutoAwesomeIcon,
    Speed as SpeedIcon,
    Memory as MemoryIcon,
    Timeline as TimelineIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { universalAIOrchestratorAPI } from '../services/universalAIOrchestratorAPI';

interface ChatMessage {
    id: number;
    text: string;
    isUser: boolean;
    timestamp: Date;
    metadata?: {
        orchestration_mode?: string;
        participating_systems?: string[];
        processing_time?: number;
        complexity?: string;
        domain?: string;
        success_rate?: number;
    };
}

interface SystemStatus {
    total_systems: number;
    online_systems: number;
    total_tasks: number;
    completed_tasks: number;
    failed_tasks: number;
    system_performance: Record<string, any>;
    last_update: string;
}

const AdvancedUniversalChatInterface: React.FC = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

    // 시스템 상태 확인
    const checkSystemStatus = async () => {
        try {
            const status = await universalAIOrchestratorAPI.getOrchestratorStatus();
            setSystemStatus(status);
            setConnectionStatus('connected');
        } catch (error) {
            console.error('시스템 상태 확인 오류:', error);
            setConnectionStatus('disconnected');
        }
    };

    // 컴포넌트 마운트 시 시스템 상태 확인
    useEffect(() => {
        checkSystemStatus();

        // 30초마다 시스템 상태 업데이트
        const interval = setInterval(checkSystemStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleSend = async () => {
        if (message.trim() && !isLoading) {
            const userMessage: ChatMessage = {
                id: Date.now(),
                text: message,
                isUser: true,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, userMessage]);
            const currentMessage = message;
            setMessage('');
            setIsLoading(true);
            setError(null);

            try {
                // 범용 AI 오케스트레이터를 통한 고도화된 처리
                const response = await universalAIOrchestratorAPI.sendMessage(currentMessage);

                if (response.success) {
                    const result = response.orchestration_result;

                    const botMessage: ChatMessage = {
                        id: Date.now() + 1,
                        text: result.integrated_response,
                        isUser: false,
                        timestamp: new Date(),
                        metadata: {
                            orchestration_mode: result.orchestration_mode,
                            participating_systems: result.participating_systems,
                            processing_time: result.processing_time,
                            complexity: result.priority,
                            domain: 'auto-detected',
                            success_rate: result.successful_systems_count / result.total_systems_count
                        }
                    };

                    setMessages(prev => [...prev, botMessage]);

                    // 시스템 상태 업데이트
                    await checkSystemStatus();
                } else {
                    throw new Error(response.message || 'AI 오케스트레이션 실패');
                }
            } catch (error) {
                console.error('AI 오케스트레이션 오류:', error);
                setError('AI 시스템에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');

                // 폴백 응답
                const fallbackMessage: ChatMessage = {
                    id: Date.now() + 2,
                    text: '죄송합니다. 현재 AI 시스템에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.',
                    isUser: false,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, fallbackMessage]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const getSystemStatusColor = () => {
        if (!systemStatus) return 'default';
        const successRate = systemStatus.completed_tasks / Math.max(systemStatus.total_tasks, 1);
        if (successRate > 0.9) return 'success';
        if (successRate > 0.7) return 'warning';
        return 'error';
    };

    const formatProcessingTime = (time: number) => {
        return time < 1 ? `${(time * 1000).toFixed(0)}ms` : `${time.toFixed(2)}s`;
    };

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: 2 }}>
            {/* 헤더 */}
            <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AutoAwesomeIcon color="primary" />
                        범용 AI 오케스트레이터
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                            label={connectionStatus === 'connected' ? '연결됨' : '연결 끊김'}
                            color={connectionStatus === 'connected' ? 'success' : 'error'}
                            size="small"
                        />
                        <Tooltip title="시스템 상태 새로고침">
                            <IconButton onClick={checkSystemStatus} size="small">
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* 시스템 상태 카드 */}
                {systemStatus && (
                    <Card sx={{ mb: 2 }}>
                        <CardContent sx={{ py: 1 }}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: { xs: '1 1 100%', sm: '1 1 calc(25% - 16px)' } }}>
                                    <PsychologyIcon color="primary" />
                                    <Typography variant="body2">
                                        AI 시스템: {systemStatus.online_systems}/{systemStatus.total_systems}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: { xs: '1 1 100%', sm: '1 1 calc(25% - 16px)' } }}>
                                    <SpeedIcon color="primary" />
                                    <Typography variant="body2">
                                        작업 완료: {systemStatus.completed_tasks}/{systemStatus.total_tasks}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: { xs: '1 1 100%', sm: '1 1 calc(25% - 16px)' } }}>
                                    <MemoryIcon color="primary" />
                                    <Typography variant="body2">
                                        성공률: {((systemStatus.completed_tasks / Math.max(systemStatus.total_tasks, 1)) * 100).toFixed(1)}%
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: { xs: '1 1 100%', sm: '1 1 calc(25% - 16px)' } }}>
                                    <TimelineIcon color="primary" />
                                    <Typography variant="body2">
                                        마지막 업데이트: {new Date(systemStatus.last_update).toLocaleTimeString()}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                )}
            </Box>

            {/* 에러 알림 */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* 채팅 메시지 영역 */}
            <Paper sx={{ flex: 1, p: 2, mb: 2, overflow: 'auto', backgroundColor: '#f8f9fa' }}>
                {messages.length === 0 ? (
                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                        <AutoAwesomeIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            범용 AI 오케스트레이터에 오신 것을 환영합니다!
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            17개의 고급 AI 시스템이 통합되어 더욱 정교한 답변을 제공합니다.
                        </Typography>
                    </Box>
                ) : (
                    messages.map((msg) => (
                        <Box key={msg.id} sx={{ mb: 2 }}>
                            <Box sx={{
                                display: 'flex',
                                justifyContent: msg.isUser ? 'flex-end' : 'flex-start',
                                mb: 1
                            }}>
                                <Paper sx={{
                                    p: 2,
                                    maxWidth: '80%',
                                    backgroundColor: msg.isUser ? 'primary.main' : 'white',
                                    color: msg.isUser ? 'white' : 'black',
                                    boxShadow: 2
                                }}>
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {msg.text}
                                    </Typography>

                                    {/* 메타데이터 표시 */}
                                    {msg.metadata && !msg.isUser && (
                                        <>
                                            <Divider sx={{ my: 1, opacity: 0.3 }} />
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                                <Chip
                                                    label={`${msg.metadata.orchestration_mode} 모드`}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontSize: '0.7rem' }}
                                                />
                                                <Chip
                                                    label={`${msg.metadata.participating_systems?.length || 0}개 시스템`}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontSize: '0.7rem' }}
                                                />
                                                <Chip
                                                    label={formatProcessingTime(msg.metadata.processing_time || 0)}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontSize: '0.7rem' }}
                                                />
                                                <Chip
                                                    label={`${msg.metadata.complexity} 복잡도`}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontSize: '0.7rem' }}
                                                />
                                            </Box>
                                        </>
                                    )}
                                </Paper>
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{
                                display: 'block',
                                textAlign: msg.isUser ? 'right' : 'left',
                                px: 1
                            }}>
                                {msg.timestamp.toLocaleTimeString()}
                            </Typography>
                        </Box>
                    ))
                )}

                {/* 로딩 인디케이터 */}
                {isLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                        <Paper sx={{ p: 2, backgroundColor: 'white', boxShadow: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CircularProgress size={20} />
                                <Typography variant="body2" color="text.secondary">
                                    AI 시스템들이 답변을 생성하고 있습니다...
                                </Typography>
                            </Box>
                        </Paper>
                    </Box>
                )}
            </Paper>

            {/* 입력 영역 */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="질문을 입력하세요... (예: 양자 역학과 의식의 통합에 대해 설명해주세요)"
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    disabled={isLoading}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white'
                        }
                    }}
                />
                <Button
                    variant="contained"
                    onClick={handleSend}
                    disabled={!message.trim() || isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} /> : <SendIcon />}
                    sx={{ minWidth: 100, height: 56 }}
                >
                    {isLoading ? '처리중' : '전송'}
                </Button>
            </Box>

            {/* 하단 정보 */}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                    🚀 범용 AI 오케스트레이터 - 17개 고급 AI 시스템 통합 |
                    포트 8019에서 실행 중 |
                    실시간 시스템 모니터링 활성화
                </Typography>
            </Box>
        </Box>
    );
};

export default AdvancedUniversalChatInterface;
