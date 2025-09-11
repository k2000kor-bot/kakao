import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Card,
    CardContent,
    Typography,
    useTheme,
    useMediaQuery,
    AppBar,
    Toolbar,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon,
    Chip,
    ThemeProvider,
    createTheme,
    responsiveFontSizes,
    CssBaseline,
    Paper,
    Divider,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Home,
    Dashboard,
    Settings,
    Phone,
    Tablet,
    Computer,
    Palette,
    Brightness4,
    Brightness7,
    ZoomIn,
    ZoomOut,
} from '@mui/icons-material';

// 반응형 테마 생성
const createResponsiveTheme = (mode: 'light' | 'dark') => {
    let theme = createTheme({
        palette: {
            mode,
            primary: {
                main: '#1976d2',
            },
            secondary: {
                main: '#dc004e',
            },
            background: {
                default: mode === 'light' ? '#f5f5f5' : '#121212',
                paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
            },
        },
        typography: {
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            h1: {
                fontSize: '2.5rem',
                fontWeight: 300,
            },
            h2: {
                fontSize: '2rem',
                fontWeight: 300,
            },
            h3: {
                fontSize: '1.75rem',
                fontWeight: 400,
            },
            h4: {
                fontSize: '1.5rem',
                fontWeight: 400,
            },
            h5: {
                fontSize: '1.25rem',
                fontWeight: 400,
            },
            h6: {
                fontSize: '1rem',
                fontWeight: 500,
            },
        },
        components: {
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        boxShadow: mode === 'light'
                            ? '0 2px 8px rgba(0,0,0,0.1)'
                            : '0 2px 8px rgba(255,255,255,0.1)',
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        textTransform: 'none',
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        borderRadius: 16,
                    },
                },
            },
        },
    });

    // 반응형 폰트 크기 적용
    theme = responsiveFontSizes(theme);

    return theme;
};

interface ResponsiveDesignSystemProps {
    children: React.ReactNode;
}

const ResponsiveDesignSystem: React.FC<ResponsiveDesignSystemProps> = ({ children }) => {
    const [mode, setMode] = useState<'light' | 'dark'>('light');
    const [mobileOpen, setMobileOpen] = useState(false);
    const [drawerWidth] = useState(240);
    const [currentBreakpoint, setCurrentBreakpoint] = useState<string>('desktop');
    const [showResponsiveInfo, setShowResponsiveInfo] = useState(false);

    const theme = createResponsiveTheme(mode);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

    // 브레이크포인트 감지
    useEffect(() => {
        if (isMobile) setCurrentBreakpoint('mobile');
        else if (isTablet) setCurrentBreakpoint('tablet');
        else if (isDesktop) setCurrentBreakpoint('desktop');
    }, [isMobile, isTablet, isDesktop]);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleThemeToggle = () => {
        setMode(mode === 'light' ? 'dark' : 'light');
    };

    const responsiveActions = [
        { icon: <Phone />, name: 'Mobile View', action: () => setShowResponsiveInfo(true) },
        { icon: <Tablet />, name: 'Tablet View', action: () => setShowResponsiveInfo(true) },
        { icon: <Computer />, name: 'Desktop View', action: () => setShowResponsiveInfo(true) },
        { icon: <Palette />, name: 'Theme Toggle', action: handleThemeToggle },
        { icon: <ZoomIn />, name: 'Zoom In', action: () => { } },
        { icon: <ZoomOut />, name: 'Zoom Out', action: () => { } },
    ];

    const drawer = (
        <Box>
            <Toolbar>
                <Typography variant="h6" noWrap component="div">
                    CORBU AI
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                <ListItem>
                    <ListItemIcon>
                        <Home />
                    </ListItemIcon>
                    <ListItemText primary="홈" />
                </ListItem>
                <ListItem>
                    <ListItemIcon>
                        <Dashboard />
                    </ListItemIcon>
                    <ListItemText primary="대시보드" />
                </ListItem>
                <ListItem>
                    <ListItemIcon>
                        <Settings />
                    </ListItemIcon>
                    <ListItemText primary="설정" />
                </ListItem>
            </List>
        </Box>
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: 'flex' }}>
                {/* 모바일 앱바 */}
                <AppBar
                    position="fixed"
                    sx={{
                        width: { sm: `calc(100% - ${drawerWidth}px)` },
                        ml: { sm: `${drawerWidth}px` },
                    }}
                >
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { sm: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                            CORBU AI 시스템
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                                label={currentBreakpoint}
                                size="small"
                                color="secondary"
                                icon={currentBreakpoint === 'mobile' ? <Phone /> :
                                    currentBreakpoint === 'tablet' ? <Tablet /> : <Computer />}
                            />
                            <IconButton color="inherit" onClick={handleThemeToggle}>
                                {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                            </IconButton>
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* 사이드바 */}
                <Box
                    component="nav"
                    sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                >
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{
                            keepMounted: true,
                        }}
                        sx={{
                            display: { xs: 'block', sm: 'none' },
                            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                        }}
                    >
                        {drawer}
                    </Drawer>
                    <Drawer
                        variant="permanent"
                        sx={{
                            display: { xs: 'none', sm: 'block' },
                            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                        }}
                        open
                    >
                        {drawer}
                    </Drawer>
                </Box>

                {/* 메인 콘텐츠 */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: 3,
                        width: { sm: `calc(100% - ${drawerWidth}px)` },
                        mt: 8,
                    }}
                >
                    <Container maxWidth="xl">
                        {/* 반응형 정보 카드 */}
                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="h5" gutterBottom>
                                    반응형 디자인 시스템
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                    <Paper sx={{ p: 2, textAlign: 'center', minWidth: 120 }}>
                                        <Phone sx={{ fontSize: 40, color: 'primary.main' }} />
                                        <Typography variant="h6">Mobile</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {isMobile ? '활성' : '비활성'}
                                        </Typography>
                                    </Paper>
                                    <Paper sx={{ p: 2, textAlign: 'center', minWidth: 120 }}>
                                        <Tablet sx={{ fontSize: 40, color: 'primary.main' }} />
                                        <Typography variant="h6">Tablet</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {isTablet ? '활성' : '비활성'}
                                        </Typography>
                                    </Paper>
                                    <Paper sx={{ p: 2, textAlign: 'center', minWidth: 120 }}>
                                        <Computer sx={{ fontSize: 40, color: 'primary.main' }} />
                                        <Typography variant="h6">Desktop</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {isDesktop ? '활성' : '비활성'}
                                        </Typography>
                                    </Paper>
                                    <Paper sx={{ p: 2, textAlign: 'center', minWidth: 120 }}>
                                        <Palette sx={{ fontSize: 40, color: 'primary.main' }} />
                                        <Typography variant="h6">테마</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {mode === 'light' ? '라이트' : '다크'}
                                        </Typography>
                                    </Paper>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* 자식 컴포넌트 렌더링 */}
                        {children}
                    </Container>
                </Box>

                {/* 반응형 SpeedDial */}
                <SpeedDial
                    ariaLabel="반응형 도구"
                    sx={{ position: 'fixed', bottom: 16, right: 16 }}
                    icon={<SpeedDialIcon />}
                >
                    {responsiveActions.map((action) => (
                        <SpeedDialAction
                            key={action.name}
                            icon={action.icon}
                            tooltipTitle={action.name}
                            onClick={action.action}
                        />
                    ))}
                </SpeedDial>

                {/* 반응형 정보 다이얼로그 */}
                <Dialog
                    open={showResponsiveInfo}
                    onClose={() => setShowResponsiveInfo(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>반응형 디자인 정보</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            현재 화면 크기: {currentBreakpoint}
                        </DialogContentText>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="h6">브레이크포인트 정보:</Typography>
                            <List>
                                <ListItem>
                                    <ListItemText
                                        primary="Mobile (xs, sm)"
                                        secondary="0px - 959px"
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="Tablet (md)"
                                        secondary="960px - 1279px"
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="Desktop (lg, xl)"
                                        secondary="1280px 이상"
                                    />
                                </ListItem>
                            </List>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowResponsiveInfo(false)}>닫기</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </ThemeProvider>
    );
};

export default ResponsiveDesignSystem;
