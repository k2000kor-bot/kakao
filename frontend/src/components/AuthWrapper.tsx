import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, TextField, Alert, CircularProgress } from '@mui/material';
import { Lock as LockIcon, Person as PersonIcon } from '@mui/icons-material';

interface AuthWrapperProps {
    children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // 로컬 스토리지에서 인증 상태 확인
        const savedAuth = localStorage.getItem('corbu_auth');
        if (savedAuth) {
            try {
                const authData = JSON.parse(savedAuth);
                if (authData.authenticated && authData.timestamp) {
                    // 24시간 유효
                    const now = Date.now();
                    const authTime = new Date(authData.timestamp).getTime();
                    if (now - authTime < 24 * 60 * 60 * 1000) {
                        setIsAuthenticated(true);
                    } else {
                        localStorage.removeItem('corbu_auth');
                    }
                }
            } catch (e) {
                localStorage.removeItem('corbu_auth');
            }
        }
        setIsLoading(false);
    }, []);

    const handleLogin = () => {
        setError('');

        // 간단한 인증 (개발용)
        if (username === 'admin' && password === 'corbu2024') {
            const authData = {
                authenticated: true,
                username: username,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('corbu_auth', JSON.stringify(authData));
            setIsAuthenticated(true);
        } else if (username === 'user' && password === 'user123') {
            const authData = {
                authenticated: true,
                username: username,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('corbu_auth', JSON.stringify(authData));
            setIsAuthenticated(true);
        } else if (username === 'demo' && password === 'demo') {
            const authData = {
                authenticated: true,
                username: username,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('corbu_auth', JSON.stringify(authData));
            setIsAuthenticated(true);
        } else {
            setError('잘못된 사용자명 또는 비밀번호입니다.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('corbu_auth');
        setIsAuthenticated(false);
        setUsername('');
        setPassword('');
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleLogin();
        }
    };

    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
            >
                <CircularProgress size={60} sx={{ color: 'white' }} />
            </Box>
        );
    }

    if (!isAuthenticated) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: 2,
                }}
            >
                <Paper
                    elevation={10}
                    sx={{
                        padding: 4,
                        width: '100%',
                        maxWidth: 400,
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <LockIcon sx={{ fontSize: 48, color: '#667eea', mb: 2 }} />
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#333' }}>
                            CORBU AI
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#666', mt: 1 }}>
                            부동산 AI 플랫폼에 로그인하세요
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <TextField
                        fullWidth
                        label="사용자명"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyPress={handleKeyPress}
                        sx={{ mb: 2 }}
                        InputProps={{
                            startAdornment: <PersonIcon sx={{ mr: 1, color: '#667eea' }} />,
                        }}
                    />

                    <TextField
                        fullWidth
                        label="비밀번호"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={handleKeyPress}
                        sx={{ mb: 3 }}
                        InputProps={{
                            startAdornment: <LockIcon sx={{ mr: 1, color: '#667eea' }} />,
                        }}
                    />

                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleLogin}
                        sx={{
                            py: 1.5,
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                            },
                        }}
                    >
                        로그인
                    </Button>

                    <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ color: '#666', mb: 1, fontWeight: 'bold' }}>
                            데모 계정:
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', fontSize: '0.9rem' }}>
                            • 관리자: admin / corbu2024<br />
                            • 사용자: user / user123<br />
                            • 데모: demo / demo
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        );
    }

    return (
        <Box>
            {/* 상단 로그아웃 버튼 */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 16,
                    right: 16,
                    zIndex: 1000,
                }}
            >
                <Button
                    variant="outlined"
                    onClick={handleLogout}
                    sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 1)',
                        },
                    }}
                >
                    로그아웃
                </Button>
            </Box>
            {children}
        </Box>
    );
};

export default AuthWrapper;
