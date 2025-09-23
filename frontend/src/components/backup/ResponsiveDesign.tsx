import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Button,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    useMediaQuery,
    useTheme,
    AppBar,
    Toolbar,
    Menu,
    MenuItem,
    Divider,
    Chip,
    Switch,
    FormControlLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    Menu as MenuIcon,
    Close as CloseIcon,
    Home as HomeIcon,
    Chat as ChatIcon,
    Analytics as AnalyticsIcon,
    People as PeopleIcon,
    Business as BusinessIcon,
    TrendingUp as TrendingUpIcon,
    Visibility as VisibilityIcon,
    Settings as SettingsIcon,
    Language as LanguageIcon,
    Accessibility as AccessibilityIcon,
    Palette as PaletteIcon,
    Notifications as NotificationsIcon,
    AccountCircle as AccountIcon
} from '@mui/icons-material';

interface ResponsiveDesignProps {
    children: React.ReactNode;
}

const ResponsiveDesign: React.FC<ResponsiveDesignProps> = ({ children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

    const [mobileOpen, setMobileOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [languageMenuAnchor, setLanguageMenuAnchor] = useState<null | HTMLElement>(null);
    const [themeMenuAnchor, setThemeMenuAnchor] = useState<null | HTMLElement>(null);
    const [currentLanguage, setCurrentLanguage] = useState('ko');
    const [darkMode, setDarkMode] = useState(false);
    const [highContrast, setHighContrast] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);

    // 언어 설정
    const languages = [
        { code: 'ko', name: '한국어', flag: '🇰🇷' },
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'ja', name: '日本語', flag: '🇯🇵' },
        { code: 'zh', name: '中文', flag: '🇨🇳' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
    ];

    // 테마 설정
    const themes = [
        { name: '기본', value: 'default' },
        { name: '다크', value: 'dark' },
        { name: '고대비', value: 'high-contrast' },
        { name: '파스텔', value: 'pastel' },
        { name: '비즈니스', value: 'business' }
    ];

    // 네비게이션 메뉴
    const navigationItems = [
        { label: '기본 채팅', icon: <ChatIcon />, path: '/chat' },
        { label: '통합 AI 채팅', icon: <ChatIcon />, path: '/integrated' },
        { label: '분석 대시보드', icon: <AnalyticsIcon />, path: '/analytics' },
        { label: '커뮤니티 분석', icon: <PeopleIcon />, path: '/community' },
        { label: '시공사 정보', icon: <BusinessIcon />, path: '/construction' },
        { label: '시장 분석', icon: <TrendingUpIcon />, path: '/market' },
        { label: '꿈 시각화', icon: <VisibilityIcon />, path: '/dream' }
    ];

    useEffect(() => {
        // 접근성 설정 적용
        if (highContrast) {
            document.body.style.filter = 'contrast(150%)';
        } else {
            document.body.style.filter = 'none';
        }

        if (reducedMotion) {
            document.body.style.setProperty('--animation-duration', '0s');
        } else {
            document.body.style.setProperty('--animation-duration', '0.3s');
        }
    }, [highContrast, reducedMotion]);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLanguageChange = (languageCode: string) => {
        setCurrentLanguage(languageCode);
        setLanguageMenuAnchor(null);
        // 실제 언어 변경 로직 구현
        console.log('Language changed to:', languageCode);
    };

    const handleThemeChange = (themeValue: string) => {
        setThemeMenuAnchor(null);
        // 실제 테마 변경 로직 구현
        console.log('Theme changed to:', themeValue);
    };

    const drawer = (
        <Box sx={{ width: 250 }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2E8B57' }}>
                    CORBU AI
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    고도화된 AI 플랫폼
                </Typography>
            </Box>

            <List>
                {navigationItems.map((item, index) => (
                    <ListItem key={index} button>
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.label} />
                    </ListItem>
                ))}
            </List>

            <Divider sx={{ my: 2 }} />

            <List>
                <ListItem button onClick={() => setSettingsOpen(true)}>
                    <ListItemIcon><SettingsIcon /></ListItemIcon>
                    <ListItemText primary="설정" />
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* 상단 앱바 */}
            <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    {isMobile && (
                        <IconButton
                            color="inherit"
                            aria-label="메뉴 열기"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}

                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        CORBU AI
                    </Typography>

                    {/* 데스크톱 네비게이션 */}
                    {!isMobile && (
                        <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
                            {navigationItems.map((item, index) => (
                                <Button
                                    key={index}
                                    color="inherit"
                                    startIcon={item.icon}
                                    sx={{ minWidth: 'auto', px: 1 }}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </Box>
                    )}

                    {/* 언어 선택 */}
                    <Button
                        color="inherit"
                        startIcon={<LanguageIcon />}
                        onClick={(e) => setLanguageMenuAnchor(e.currentTarget)}
                        sx={{ mr: 1 }}
                    >
                        {languages.find(lang => lang.code === currentLanguage)?.flag} {languages.find(lang => lang.code === currentLanguage)?.name}
                    </Button>

                    {/* 테마 선택 */}
                    <Button
                        color="inherit"
                        startIcon={<PaletteIcon />}
                        onClick={(e) => setThemeMenuAnchor(e.currentTarget)}
                        sx={{ mr: 1 }}
                    >
                        테마
                    </Button>

                    {/* 설정 */}
                    <IconButton color="inherit" onClick={() => setSettingsOpen(true)}>
                        <SettingsIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* 사이드바 (데스크톱) */}
            {!isMobile && (
                <Drawer
                    variant="permanent"
                    sx={{
                        width: 250,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: 250,
                            boxSizing: 'border-box',
                            top: 64, // AppBar 높이만큼 아래로
                            height: 'calc(100vh - 64px)'
                        },
                    }}
                >
                    {drawer}
                </Drawer>
            )}

            {/* 모바일 사이드바 */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // 모바일에서 성능 향상
                }}
                sx={{
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: 250,
                    },
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                    <IconButton onClick={handleDrawerToggle}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                {drawer}
            </Drawer>

            {/* 메인 콘텐츠 */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: isMobile ? 1 : 3,
                    width: { sm: `calc(100% - ${isMobile ? 0 : 250}px)` },
                    ml: { sm: isMobile ? 0 : '250px' },
                    mt: '64px', // AppBar 높이만큼 아래로
                    minHeight: 'calc(100vh - 64px)'
                }}
            >
                {/* 반응형 그리드 컨테이너 */}
                <Box
                    sx={{
                        maxWidth: isDesktop ? 1200 : isTablet ? 800 : '100%',
                        mx: 'auto',
                        width: '100%'
                    }}
                >
                    {children}
                </Box>
            </Box>

            {/* 언어 선택 메뉴 */}
            <Menu
                anchorEl={languageMenuAnchor}
                open={Boolean(languageMenuAnchor)}
                onClose={() => setLanguageMenuAnchor(null)}
            >
                {languages.map((language) => (
                    <MenuItem
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        selected={currentLanguage === language.code}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span>{language.flag}</span>
                            <span>{language.name}</span>
                        </Box>
                    </MenuItem>
                ))}
            </Menu>

            {/* 테마 선택 메뉴 */}
            <Menu
                anchorEl={themeMenuAnchor}
                open={Boolean(themeMenuAnchor)}
                onClose={() => setThemeMenuAnchor(null)}
            >
                {themes.map((theme) => (
                    <MenuItem
                        key={theme.value}
                        onClick={() => handleThemeChange(theme.value)}
                    >
                        {theme.name}
                    </MenuItem>
                ))}
            </Menu>

            {/* 설정 다이얼로그 */}
            <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>설정</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        {/* 접근성 설정 */}
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                            접근성 설정
                        </Typography>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={darkMode}
                                    onChange={(e) => setDarkMode(e.target.checked)}
                                />
                            }
                            label="다크 모드"
                            sx={{ mb: 1 }}
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={highContrast}
                                    onChange={(e) => setHighContrast(e.target.checked)}
                                />
                            }
                            label="고대비 모드"
                            sx={{ mb: 1 }}
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={reducedMotion}
                                    onChange={(e) => setReducedMotion(e.target.checked)}
                                />
                            }
                            label="움직임 줄이기"
                            sx={{ mb: 2 }}
                        />

                        <Divider sx={{ my: 2 }} />

                        {/* 디스플레이 설정 */}
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                            디스플레이 설정
                        </Typography>

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>화면 크기</InputLabel>
                            <Select value={isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'} disabled>
                                <MenuItem value="mobile">모바일 ({isMobile ? '현재' : ''})</MenuItem>
                                <MenuItem value="tablet">태블릿 ({isTablet ? '현재' : ''})</MenuItem>
                                <MenuItem value="desktop">데스크톱 ({isDesktop ? '현재' : ''})</MenuItem>
                            </Select>
                        </FormControl>

                        <Divider sx={{ my: 2 }} />

                        {/* 현재 설정 상태 */}
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                            현재 설정
                        </Typography>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            <Chip
                                label={`언어: ${languages.find(lang => lang.code === currentLanguage)?.name}`}
                                color="primary"
                                variant="outlined"
                            />
                            <Chip
                                label={`화면: ${isMobile ? '모바일' : isTablet ? '태블릿' : '데스크톱'}`}
                                color="secondary"
                                variant="outlined"
                            />
                            {darkMode && <Chip label="다크 모드" color="default" />}
                            {highContrast && <Chip label="고대비" color="default" />}
                            {reducedMotion && <Chip label="움직임 줄이기" color="default" />}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSettingsOpen(false)}>닫기</Button>
                    <Button onClick={() => setSettingsOpen(false)} variant="contained">
                        저장
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ResponsiveDesign;
