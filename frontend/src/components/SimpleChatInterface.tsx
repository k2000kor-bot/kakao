import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Chip, CircularProgress, Alert } from '@mui/material';
import { Send as SendIcon, Psychology as PsychologyIcon, AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material';
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
    };
}

const SimpleChatInterface: React.FC = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [systemStatus, setSystemStatus] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSend = async () => {
        if (message.trim()) {
            const userMessage = {
                id: Date.now(),
                text: message,
                isUser: true
            };
            setMessages(prev => [...prev, userMessage]);
            const currentMessage = message;
            setMessage('');

            try {
                // 새로운 백엔드와 연결
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
                    const botMessage = {
                        id: Date.now() + 1,
                        text: data.response,
                        isUser: false
                    };
                    setMessages(prev => [...prev, botMessage]);
                } else {
                    throw new Error('서버 응답 오류');
                }
            } catch (error) {
                console.error('채팅 오류:', error);
                const errorMessage = {
                    id: Date.now() + 1,
                    text: '죄송합니다. 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
                    isUser: false
                };
                setMessages(prev => [...prev, errorMessage]);
            }
        }
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
            <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
                🤖 CORBU AI 채팅
            </Typography>

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
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button
                    variant="contained"
                    onClick={handleSend}
                    disabled={!message.trim()}
                    startIcon={<SendIcon />}
                >
                    전송
                </Button>
            </Box>
        </Box>
    );
};

export default SimpleChatInterface;
