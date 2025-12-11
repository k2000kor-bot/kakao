import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Chip, CircularProgress, Alert } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { integratedAPIService } from '../services/integratedAPIService';

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
    };
}

const SimpleChatInterface: React.FC = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [useIntegratedAPI, setUseIntegratedAPI] = useState(true); // 통합 API 사용 여부

    const handleSend = async () => {
        if (message.trim()) {
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
                let responseText: string;

                if (useIntegratedAPI) {
                    // 통합 API 사용
                    const result = await integratedAPIService.analyzeMessage(currentMessage);
                    responseText = result.response || result.analysis?.emotion?.sentiment || '응답을 생성했습니다.';
                } else {
                    // 기존 백엔드 사용
                    const response = await fetch('http://localhost:8001/chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            message: currentMessage,
                            user_id: 'user',
                            session_id: 'session_' + Date.now()
                        }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        responseText = data.response;
                    } else {
                        throw new Error('서버 응답 오류');
                    }
                }

                const botMessage: ChatMessage = {
                    id: Date.now() + 1,
                    text: responseText,
                    isUser: false,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, botMessage]);
            } catch (error) {
                console.error('채팅 오류:', error);
                const errorMessage: ChatMessage = {
                    id: Date.now() + 1,
                    text: '죄송합니다. 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
                    isUser: false,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, errorMessage]);
                setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">
                    🤖 CORBU AI 채팅
                </Typography>
                <Chip
                    label={useIntegratedAPI ? '통합 API 사용 중' : '기존 API 사용 중'}
                    color={useIntegratedAPI ? 'primary' : 'default'}
                    onClick={() => setUseIntegratedAPI(!useIntegratedAPI)}
                    sx={{ cursor: 'pointer' }}
                />
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ flex: 1, p: 2, mb: 2, overflow: 'auto' }}>
                {messages.map((msg) => (
                    <Box key={msg.id} sx={{ mb: 1, textAlign: msg.isUser ? 'right' : 'left' }}>
                        <Typography
                            variant="body1"
                            sx={{
                                display: 'inline-block',
                                p: 1,
                                borderRadius: 1,
                                bgcolor: msg.isUser ? 'primary.main' : 'grey.200',
                                color: msg.isUser ? 'white' : 'black'
                            }}
                        >
                            {msg.text}
                        </Typography>
                    </Box>
                ))}
            </Paper>

            <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                    fullWidth
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                    disabled={isLoading}
                />
                <Button
                    variant="contained"
                    onClick={handleSend}
                    disabled={!message.trim() || isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} /> : <SendIcon />}
                >
                    {isLoading ? '처리 중...' : '전송'}
                </Button>
            </Box>
        </Box>
    );
};

export default SimpleChatInterface;
