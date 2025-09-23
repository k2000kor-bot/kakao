import React, { useState, useEffect } from 'react';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
    IconButton,
    Typography,
    Chip,
    Badge,
    Button,
    Divider,
    Switch,
    FormControlLabel,
    Slider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tabs,
    Tab,
    Paper,
    Tooltip,
    Menu,
    MenuItem,
    Alert,
    Collapse,
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Close as CloseIcon,
    Settings as SettingsIcon,
    Clear as ClearIcon,
    FilterList as FilterIcon,
    VolumeUp as VolumeUpIcon,
    VolumeOff as VolumeOffIcon,
    Vibration as VibrationIcon,
    DesktopWindows as DesktopIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    Info as InfoIcon,
    Security as SecurityIcon,
    Speed as SpeedIcon,
    Psychology as PsychologyIcon,
    MoreVert as MoreVertIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { notificationService, NotificationData, NotificationSettings } from '../services/notificationService';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`notification-tabpanel-${index}`}
            aria-labelledby={`notification-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const NotificationCenter: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [settings, setSettings] = useState<NotificationSettings>(notificationService.getSettings());
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    useEffect(() => {
        // 알림 변경 리스너
        const handleNotificationsChanged = (newNotifications: NotificationData[]) => {
            setNotifications(newNotifications);
        };

        const handleSettingsChanged = (newSettings: NotificationSettings) => {
            setSettings(newSettings);
        };

        notificationService.on('notificationsChanged', handleNotificationsChanged);
        notificationService.on('settingsChanged', handleSettingsChanged);

        // 초기 알림 로드
        setNotifications(notificationService.getNotifications());

        return () => {
            notificationService.off('notificationsChanged', handleNotificationsChanged);
            notificationService.off('settingsChanged', handleSettingsChanged);
        };
    }, []);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircleIcon color="success" />;
            case 'warning': return <WarningIcon color="warning" />;
            case 'error': return <ErrorIcon color="error" />;
            case 'info': return <InfoIcon color="info" />;
            case 'security': return <SecurityIcon color="error" />;
            case 'performance': return <SpeedIcon color="primary" />;
            case 'ai': return <PsychologyIcon color="secondary" />;
            default: return <InfoIcon />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'error';
            case 'high': return 'warning';
            case 'medium': return 'info';
            case 'low': return 'default';
            default: return 'default';
        }
    };

    const filteredNotifications = notifications.filter(notification => {
        if (filterCategory === 'all') return true;
        return notification.category === filterCategory;
    });

    const getUnreadCount = () => {
        return notifications.length;
    };

    const getUnreadCountByCategory = (category: string) => {
        return notifications.filter(n => n.category === category).length;
    };

    const handleClearAll = () => {
        notificationService.clearAllNotifications();
    };

    const handleClearByCategory = (category: string) => {
        notificationService.clearNotificationsByCategory(category);
    };

    const handleRemoveNotification = (id: string) => {
        notificationService.removeNotification(id);
    };

    const handleToggleExpanded = (id: string) => {
        const newExpanded = new Set(expandedNotifications);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedNotifications(newExpanded);
    };

    const handleSettingsChange = (key: string, value: any) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        notificationService.updateSettings(newSettings);
    };

    const handleCategorySettingsChange = (category: string, enabled: boolean) => {
        const newSettings = {
            ...settings,
            categories: {
                ...settings.categories,
                [category]: enabled,
            },
        };
        setSettings(newSettings);
        notificationService.updateSettings(newSettings);
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 60000) return '방금 전';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
        return date.toLocaleDateString();
    };

    const categories = [
        { key: 'all', label: '전체', count: getUnreadCount() },
        { key: 'system', label: '시스템', count: getUnreadCountByCategory('system') },
        { key: 'security', label: '보안', count: getUnreadCountByCategory('security') },
        { key: 'performance', label: '성능', count: getUnreadCountByCategory('performance') },
        { key: 'ai', label: 'AI', count: getUnreadCountByCategory('ai') },
        { key: 'user', label: '사용자', count: getUnreadCountByCategory('user') },
    ];

    return (
        <>
            {/* 알림 버튼 */}
            <Tooltip title="알림 센터">
                <IconButton onClick={() => setOpen(true)}>
                    <Badge badgeContent={getUnreadCount()} color="error">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
            </Tooltip>

            {/* 알림 센터 드로어 */}
            <Drawer
                anchor="right"
                open={open}
                onClose={() => setOpen(false)}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: 400,
                        maxWidth: '90vw',
                    },
                }}
            >
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* 헤더 */}
                    <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h6" component="div">
                                알림 센터
                            </Typography>
                            <Box>
                                <Tooltip title="설정">
                                    <IconButton onClick={() => setSettingsOpen(true)} size="small">
                                        <SettingsIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="모두 지우기">
                                    <IconButton onClick={handleClearAll} size="small">
                                        <ClearIcon />
                                    </IconButton>
                                </Tooltip>
                                <IconButton onClick={() => setOpen(false)} size="small">
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    </Box>

                    {/* 탭 네비게이션 */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                            <Tab label="알림" />
                            <Tab label="설정" />
                        </Tabs>
                    </Box>

                    {/* 알림 탭 */}
                    <TabPanel value={tabValue} index={0}>
                        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                            {/* 카테고리 필터 */}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                    카테고리
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {categories.map((category) => (
                                        <Chip
                                            key={category.key}
                                            label={`${category.label} ${category.count > 0 ? `(${category.count})` : ''}`}
                                            variant={filterCategory === category.key ? 'filled' : 'outlined'}
                                            onClick={() => setFilterCategory(category.key)}
                                            size="small"
                                        />
                                    ))}
                                </Box>
                            </Box>

                            {/* 알림 목록 */}
                            {filteredNotifications.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="body1" color="text.secondary">
                                        새로운 알림이 없습니다
                                    </Typography>
                                </Box>
                            ) : (
                                <List>
                                    {filteredNotifications.map((notification) => (
                                        <React.Fragment key={notification.id}>
                                            <ListItem
                                                sx={{
                                                    flexDirection: 'column',
                                                    alignItems: 'stretch',
                                                    py: 1,
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                                                    <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                                                        {getNotificationIcon(notification.type)}
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                                    {notification.title}
                                                                </Typography>
                                                                <Chip
                                                                    label={notification.priority}
                                                                    size="small"
                                                                    color={getPriorityColor(notification.priority) as any}
                                                                    variant="outlined"
                                                                />
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <Box>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {notification.message}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {formatTimestamp(notification.timestamp)}
                                                                </Typography>
                                                            </Box>
                                                        }
                                                    />
                                                    <ListItemSecondaryAction>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            {notification.actions && notification.actions.length > 0 && (
                                                                <IconButton
                                                                    onClick={(e) => setAnchorEl(e.currentTarget)}
                                                                    size="small"
                                                                >
                                                                    <MoreVertIcon />
                                                                </IconButton>
                                                            )}
                                                            <IconButton
                                                                onClick={() => handleRemoveNotification(notification.id)}
                                                                size="small"
                                                            >
                                                                <CloseIcon />
                                                            </IconButton>
                                                        </Box>
                                                    </ListItemSecondaryAction>
                                                </Box>

                                                {/* 액션 버튼들 */}
                                                {notification.actions && notification.actions.length > 0 && (
                                                    <Box sx={{ mt: 1, ml: 5 }}>
                                                        {notification.actions.map((action, index) => (
                                                            <Button
                                                                key={index}
                                                                size="small"
                                                                variant={action.variant === 'primary' ? 'contained' : 'outlined'}
                                                                onClick={action.action}
                                                                sx={{ mr: 1, mb: 1 }}
                                                            >
                                                                {action.label}
                                                            </Button>
                                                        ))}
                                                    </Box>
                                                )}
                                            </ListItem>
                                            <Divider />
                                        </React.Fragment>
                                    ))}
                                </List>
                            )}
                        </Box>
                    </TabPanel>

                    {/* 설정 탭 */}
                    <TabPanel value={tabValue} index={1}>
                        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                알림 설정
                            </Typography>

                            {/* 기본 설정 */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                                    기본 설정
                                </Typography>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.enabled}
                                            onChange={(e) => handleSettingsChange('enabled', e.target.checked)}
                                        />
                                    }
                                    label="알림 활성화"
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.autoClose}
                                            onChange={(e) => handleSettingsChange('autoClose', e.target.checked)}
                                        />
                                    }
                                    label="자동 닫기"
                                />
                            </Box>

                            {/* 카테고리 설정 */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                                    카테고리별 알림
                                </Typography>
                                {Object.entries(settings.categories).map(([category, enabled]) => (
                                    <FormControlLabel
                                        key={category}
                                        control={
                                            <Switch
                                                checked={enabled}
                                                onChange={(e) => handleCategorySettingsChange(category, e.target.checked)}
                                            />
                                        }
                                        label={category.charAt(0).toUpperCase() + category.slice(1)}
                                    />
                                ))}
                            </Box>

                            {/* 알림 방식 설정 */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                                    알림 방식
                                </Typography>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.sound}
                                            onChange={(e) => handleSettingsChange('sound', e.target.checked)}
                                        />
                                    }
                                    label="사운드"
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.vibration}
                                            onChange={(e) => handleSettingsChange('vibration', e.target.checked)}
                                        />
                                    }
                                    label="진동"
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.desktop}
                                            onChange={(e) => handleSettingsChange('desktop', e.target.checked)}
                                        />
                                    }
                                    label="데스크톱 알림"
                                />
                            </Box>

                            {/* 자동 닫기 시간 */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                                    자동 닫기 시간
                                </Typography>
                                <Slider
                                    value={settings.duration / 1000}
                                    onChange={(_, value) => handleSettingsChange('duration', (value as number) * 1000)}
                                    min={1}
                                    max={30}
                                    step={1}
                                    marks={[
                                        { value: 1, label: '1초' },
                                        { value: 5, label: '5초' },
                                        { value: 10, label: '10초' },
                                        { value: 30, label: '30초' },
                                    ]}
                                    valueLabelDisplay="auto"
                                    valueLabelFormat={(value) => `${value}초`}
                                />
                            </Box>
                        </Box>
                    </TabPanel>
                </Box>
            </Drawer>

            {/* 액션 메뉴 */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                <MenuItem onClick={() => setAnchorEl(null)}>
                    <ClearIcon sx={{ mr: 1 }} />
                    이 카테고리 지우기
                </MenuItem>
            </Menu>
        </>
    );
};

export default NotificationCenter;
