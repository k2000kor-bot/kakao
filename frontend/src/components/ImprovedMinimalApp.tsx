import React, { useState } from 'react';
import { 
    ThemeProvider, 
    createTheme, 
    CssBaseline, 
    Box, 
    AppBar, 
    Toolbar, 
    Typography, 
    Button, 
    IconButton,
    Drawer,
    List,
    ListItemIcon,
    ListItemText,
    Divider,
    Paper
} from '@mui/material';
import { 
    Menu as MenuIcon, 
    Chat as ChatIcon, 
    Settings as SettingsIcon,
    Home as HomeIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import { ListItemButton } from '@mui/material';
import SimpleChatInterface from './SimpleChatInterface';
import TestComponent from './TestComponent';
import AuthWrapper from './AuthWrapper';

// 테마 생성
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

const ImprovedMinimalApp: React.FC = () => {
    const [currentView, setCurrentView] = useState('chat');
    const [drawerOpen, setDrawerOpen] = useState(false);

    const menuItems = [
        { id: 'chat', label: 'CORBU AI 채팅', icon: <ChatIcon /> },
        { id: 'test', label: '테스트', icon: <HomeIcon /> },
        { id: 'settings', label: '설정', icon: <SettingsIcon /> },
        { id: 'info', label: '정보', icon: <InfoIcon /> },
    ];

    const handleMenuClick = (viewId: string) => {
        setCurrentView(viewId);
        setDrawerOpen(false);
    };

    const renderContent = () => {
        switch (currentView) {
            case 'chat':
                return <SimpleChatInterface />;
            case 'test':
                return <TestComponent />;
            case 'settings':
                return (
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h5" gutterBottom>
                            설정
                        </Typography>
                        <Typography variant="body1">
                            설정 페이지입니다. 여기에 다양한 옵션들을 추가할 수 있습니다.
                        </Typography>
                    </Box>
                );
            case 'info':
                return (
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h5" gutterBottom>
                            CORBU AI 시스템 정보
                        </Typography>
                        <Typography variant="body1" paragraph>
                            CORBU AI는 부동산 관련 AI 서비스를 제공하는 통합 플랫폼입니다.
                        </Typography>
                        <Typography variant="body1" paragraph>
                            주요 기능:
                        </Typography>
                        <ul>
                            <li>실시간 채팅 AI</li>
                            <li>부동산 분석</li>
                            <li>시공사 정보</li>
                            <li>시장 분석</li>
                        </ul>
                    </Box>
                );
            default:
                return <SimpleChatInterface />;
        }
    };

    return (
        <AuthWrapper>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Box sx={{ display: 'flex', height: '100vh' }}>
                    {/* 상단 앱바 */}
                    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                        <Toolbar>
                            <IconButton
                                color="inherit"
                                aria-label="메뉴 열기"
                                edge="start"
                                onClick={() => setDrawerOpen(true)}
                                sx={{ mr: 2 }}
                            >
                                <MenuIcon />
                            </IconButton>
                            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                                CORBU AI 시스템
                            </Typography>
                            <Button color="inherit">
                                로그아웃
                            </Button>
                        </Toolbar>
                    </AppBar>

                    {/* 사이드바 드로어 */}
                    <Drawer
                        variant="temporary"
                        open={drawerOpen}
                        onClose={() => setDrawerOpen(false)}
                        sx={{
                            width: 250,
                            flexShrink: 0,
                            '& .MuiDrawer-paper': {
                                width: 250,
                                boxSizing: 'border-box',
                                marginTop: '64px', // 앱바 높이만큼 마진
                            },
                        }}
                    >
                        <Box sx={{ overflow: 'auto', mt: 2 }}>
                            <List>
                                {menuItems.map((item) => (
                                    <ListItemButton
                                        key={item.id}
                                        onClick={() => handleMenuClick(item.id)}
                                        selected={currentView === item.id}
                                        sx={{
                                            '&.Mui-selected': {
                                                backgroundColor: 'primary.main',
                                                color: 'white',
                                                '&:hover': {
                                                    backgroundColor: 'primary.dark',
                                                },
                                                '& .MuiListItemIcon-root': {
                                                    color: 'white',
                                                },
                                            },
                                        }}
                                    >
                                        <ListItemIcon>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText primary={item.label} />
                                    </ListItemButton>
                                ))}
                            </List>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ p: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                    버전 1.0.0
                                </Typography>
                            </Box>
                        </Box>
                    </Drawer>

                    {/* 메인 콘텐츠 */}
                    <Box
                        component="main"
                        sx={{
                            flexGrow: 1,
                            p: 3,
                            width: '100%',
                            marginTop: '64px', // 앱바 높이만큼 마진
                            backgroundColor: '#f5f5f5',
                            minHeight: 'calc(100vh - 64px)',
                        }}
                    >
                        <Paper sx={{ p: 2, minHeight: 'calc(100vh - 96px)' }}>
                            {renderContent()}
                        </Paper>
                    </Box>
                </Box>
            </ThemeProvider>
        </AuthWrapper>
    );
};

export default ImprovedMinimalApp;
