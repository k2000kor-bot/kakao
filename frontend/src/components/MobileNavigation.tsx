import React, { useState, useCallback, useMemo } from 'react';
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
    Fab,
    SwipeableDrawer
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
    const { isMobile, orientation: _orientation } = useResponsive();
    void _orientation; // Available for responsive layout
    const [notifications] = useState(3); // 알림 개수 시뮬레이션

    const menuItems = useMemo(() => [
        { text: '홈', icon: <HomeIcon aria-hidden="true" />, id: 'home' },
        { text: '코딩 파트너', icon: <ChatIcon aria-hidden="true" />, id: 'coding' },
        { text: '심리 분석', icon: <PsychologyIcon aria-hidden="true" />, id: 'psychology' },
        { text: '데이터 분석', icon: <AnalyticsIcon aria-hidden="true" />, id: 'analytics' },
    ], []);

    const systemMenuItems = useMemo(() => [
        { text: '통합 대시보드', icon: <DashboardIcon aria-hidden="true" />, id: '통합 대시보드' },
        { text: '성능 최적화', icon: <SpeedIcon aria-hidden="true" />, id: '성능 최적화' },
        { text: 'AI 엔진 관리', icon: <PsychologyIcon aria-hidden="true" />, id: 'AI 엔진 관리' },
        { text: '보안 모니터링', icon: <SecurityIcon aria-hidden="true" />, id: '보안 모니터링' },
        { text: '사용자 경험', icon: <PersonIcon aria-hidden="true" />, id: '사용자 경험' },
        { text: '고급 분석', icon: <AssessmentIcon aria-hidden="true" />, id: '고급 분석' },
        { text: '자동화 워크플로우', icon: <WorkflowIcon aria-hidden="true" />, id: '자동화 워크플로우' },
        { text: '고급 보안', icon: <ShieldIcon aria-hidden="true" />, id: '고급 보안' },
        { text: '백업 및 복구', icon: <BackupIcon aria-hidden="true" />, id: '백업 및 복구' },
    ], []);

    const handleItemClick = useCallback((itemId: string) => {
        onChatChange(itemId);
        onClose();
    }, [onChatChange, onClose]);

    const drawerWidth = useMemo(() => isMobile ? '100%' : 280, [isMobile]);
    const drawerVariant = useMemo(() => isMobile ? 'temporary' : 'persistent', [isMobile]);

    const drawerContent = (
        <Box sx={{ width: drawerWidth, height: '100%', overflow: 'auto' }}>
            {/* 헤더 */}
            <Box
                component="header"
                sx={{
                    p: 2,
                    background: 'linear-gradient(135deg, var(--accent-info) 0%, var(--accent-secondary) 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <Typography variant="h6" component="h1" fontWeight="bold">
                    CORBU.AI
                </Typography>
                {isMobile && (
                    <IconButton
                        onClick={onClose}
                        sx={{ color: 'white' }}
                        aria-label="메뉴 닫기"
                        type="button"
                    >
                        <MenuIcon aria-hidden="true" />
                    </IconButton>
                )}
            </Box>

            {/* 알림 섹션 */}
            <Box component="nav" aria-label="알림" sx={{ p: 2 }}>
                <ListItem
                    component="button"
                    onClick={() => handleItemClick('notifications')}
                    aria-label={`알림, ${notifications}개의 새 알림`}
                    aria-current={currentChat === 'notifications' ? 'page' : undefined}
                    type="button"
                    sx={{
                        borderRadius: 2,
                        mb: 1,
                        backgroundColor: currentChat === 'notifications' ? 'var(--accent-info-muted)' : 'transparent',
                    }}
                >
                    <ListItemIcon>
                        <Badge badgeContent={notifications} color="error" aria-label={`${notifications}개의 새 알림`}>
                            <NotificationsIcon aria-hidden="true" />
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
            <Box component="nav" aria-label="AI 서비스 메뉴" sx={{ p: 2 }}>
                <Typography variant="subtitle2" component="h2" sx={{ px: 2, py: 1, color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                    AI 서비스
                </Typography>
                <List role="list" aria-label="AI 서비스 목록">
                    {menuItems.map((item) => (
                        <ListItem
                            key={item.id}
                            component="button"
                            onClick={() => handleItemClick(item.id)}
                            aria-label={item.text}
                            aria-current={currentChat === item.id ? 'page' : undefined}
                            type="button"
                            role="listitem"
                            sx={{
                                backgroundColor: currentChat === item.id ? 'var(--accent-info-muted)' : 'transparent',
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
            <Box component="nav" aria-label="시스템 관리 메뉴" sx={{ p: 2 }}>
                <Typography variant="subtitle2" component="h2" sx={{ px: 2, py: 1, color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                    시스템 관리
                </Typography>
                <List role="list" aria-label="시스템 관리 목록">
                    {systemMenuItems.map((item) => (
                        <ListItem
                            key={item.id}
                            component="button"
                            onClick={() => handleItemClick(item.id)}
                            aria-label={item.text}
                            aria-current={currentChat === item.id ? 'page' : undefined}
                            type="button"
                            role="listitem"
                            sx={{
                                backgroundColor: currentChat === item.id ? 'var(--accent-info-muted)' : 'transparent',
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
            <Box component="nav" aria-label="설정" sx={{ p: 2 }}>
                <ListItem
                    component="button"
                    onClick={() => handleItemClick('settings')}
                    aria-label="설정"
                    aria-current={currentChat === 'settings' ? 'page' : undefined}
                    type="button"
                    sx={{
                        borderRadius: 2,
                        backgroundColor: currentChat === 'settings' ? 'var(--accent-info-muted)' : 'transparent',
                    }}
                >
                    <ListItemIcon>
                        <SettingsIcon aria-hidden="true" />
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
                    aria-label="메뉴 열기"
                    aria-expanded={open}
                    aria-controls="mobile-navigation-drawer"
                    onClick={onOpen}
                    type="button"
                    sx={{
                        position: 'fixed',
                        bottom: 'max(16px, env(safe-area-inset-bottom, 0px))',
                        left: 'max(16px, env(safe-area-inset-left, 0px))',
                        zIndex: 'var(--z-fab)',
                        display: { xs: 'flex', md: 'none' }
                    }}
                >
                    <MenuIcon aria-hidden="true" />
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
                        sx: { zIndex: 'var(--z-modal-backdrop)' },
                    }}
                    aria-label="모바일 네비게이션 메뉴"
                    id="mobile-navigation-drawer"
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
            aria-label="네비게이션 메뉴"
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
