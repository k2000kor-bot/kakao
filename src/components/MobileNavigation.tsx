import React, { useState } from 'react';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Typography,
    Divider,
    Badge,
    Tooltip,
    Fab,
    SwipeableDrawer,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    Speed as SpeedIcon,
    Psychology as PsychologyIcon,
    Security as SecurityIcon,
    Person as PersonIcon,
    Assessment as AssessmentIcon,
    Timeline as WorkflowIcon,
    Shield as ShieldIcon,
    Backup as BackupIcon,
    Chat as ChatIcon,
    Analytics as AnalyticsIcon,
    Settings as SettingsIcon,
    Notifications as NotificationsIcon,
    Home as HomeIcon
} from '@mui/icons-material';
import useResponsive from '../hooks/useResponsive';

interface MobileNavigationProps {
    currentChat: string;
    onChatChange: (chatId: string) => void;
    open: boolean;
    onClose: () => void;
    onOpen: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
    currentChat,
    onChatChange,
    open,
    onClose,
    onOpen
}) => {
    const theme = useTheme();
    const { isMobile, orientation } = useResponsive();
    const [notifications] = useState(3); // 알림 개수 시뮬레이션

    const menuItems = [
        { text: '홈', icon: <HomeIcon />, id: 'home' },
        { text: '코딩 파트너', icon: <ChatIcon />, id: 'coding' },
        { text: '심리 분석', icon: <PsychologyIcon />, id: 'psychology' },
        { text: '데이터 분석', icon: <AnalyticsIcon />, id: 'analytics' },
    ];

    const systemMenuItems = [
        { text: '통합 대시보드', icon: <DashboardIcon />, id: '통합 대시보드' },
        { text: '성능 최적화', icon: <SpeedIcon />, id: '성능 최적화' },
        { text: 'AI 엔진 관리', icon: <PsychologyIcon />, id: 'AI 엔진 관리' },
        { text: '보안 모니터링', icon: <SecurityIcon />, id: '보안 모니터링' },
        { text: '사용자 경험', icon: <PersonIcon />, id: '사용자 경험' },
        { text: '고급 분석', icon: <AssessmentIcon />, id: '고급 분석' },
        { text: '자동화 워크플로우', icon: <WorkflowIcon />, id: '자동화 워크플로우' },
        { text: '고급 보안', icon: <ShieldIcon />, id: '고급 보안' },
        { text: '백업 및 복구', icon: <BackupIcon />, id: '백업 및 복구' },
    ];

    const handleItemClick = (itemId: string) => {
        onChatChange(itemId);
        onClose();
    };

    const drawerWidth = isMobile ? '100%' : 280;
    const drawerVariant = isMobile ? 'temporary' : 'persistent';

    const drawerContent = (
        <Box sx={{ width: drawerWidth, height: '100%', overflow: 'auto' }}>
            {/* 헤더 */}
            <Box sx={{
                p: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Typography variant="h6" fontWeight="bold">
                    CORBU AI
                </Typography>
                {isMobile && (
                    <IconButton onClick={onClose} sx={{ color: 'white' }}>
                        <MenuIcon />
                    </IconButton>
                )}
            </Box>

            {/* 알림 섹션 */}
            <Box sx={{ p: 2 }}>
                <ListItem
                    component="button"
                    onClick={() => handleItemClick('notifications')}
                    sx={{
                        borderRadius: 2,
                        mb: 1,
                        backgroundColor: currentChat === 'notifications' ? theme.palette.primary.main + '20' : 'transparent',
                    }}
                >
                    <ListItemIcon>
                        <Badge badgeContent={notifications} color="error">
                            <NotificationsIcon />
                        </Badge>
                    </ListItemIcon>
                    <ListItemText
                        primary="알림"
                        secondary={`${notifications}개의 새 알림`}
                    />
                </ListItem>
            </Box>

            <Divider />

            {/* 메인 메뉴 */}
            <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: '#666', fontWeight: 'bold' }}>
                    AI 서비스
                </Typography>
                <List>
                    {menuItems.map((item) => (
                        <ListItem
                            key={item.id}
                            component="button"
                            onClick={() => handleItemClick(item.id)}
                            sx={{
                                backgroundColor: currentChat === item.id ? theme.palette.primary.main + '20' : 'transparent',
                                borderRadius: 2,
                                mx: 1,
                                mb: 0.5,
                            }}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItem>
                    ))}
                </List>
            </Box>

            <Divider />

            {/* 시스템 관리 메뉴 */}
            <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: '#666', fontWeight: 'bold' }}>
                    시스템 관리
                </Typography>
                <List>
                    {systemMenuItems.map((item) => (
                        <ListItem
                            key={item.id}
                            component="button"
                            onClick={() => handleItemClick(item.id)}
                            sx={{
                                backgroundColor: currentChat === item.id ? theme.palette.primary.main + '20' : 'transparent',
                                borderRadius: 2,
                                mx: 1,
                                mb: 0.5,
                            }}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItem>
                    ))}
                </List>
            </Box>

            <Divider />

            {/* 설정 메뉴 */}
            <Box sx={{ p: 2 }}>
                <ListItem
                    component="button"
                    onClick={() => handleItemClick('settings')}
                    sx={{
                        borderRadius: 2,
                        backgroundColor: currentChat === 'settings' ? theme.palette.primary.main + '20' : 'transparent',
                    }}
                >
                    <ListItemIcon>
                        <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText primary="설정" />
                </ListItem>
            </Box>
        </Box>
    );

    if (isMobile) {
        return (
            <>
                {/* 모바일 메뉴 버튼 */}
                <Fab
                    color="primary"
                    aria-label="menu"
                    onClick={onOpen}
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        left: 16,
                        zIndex: theme.zIndex.speedDial,
                        display: { xs: 'flex', md: 'none' }
                    }}
                >
                    <MenuIcon />
                </Fab>

                {/* 모바일 드로어 */}
                <SwipeableDrawer
                    anchor="left"
                    open={open}
                    onClose={onClose}
                    onOpen={onOpen}
                    swipeAreaWidth={20}
                    disableSwipeToOpen={false}
                    ModalProps={{
                        keepMounted: true,
                    }}
                >
                    {drawerContent}
                </SwipeableDrawer>
            </>
        );
    }

    return (
        <Drawer
            variant={drawerVariant}
            anchor="left"
            open={open}
            onClose={onClose}
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                },
            }}
        >
            {drawerContent}
        </Drawer>
    );
};

export default MobileNavigation;
