// 보안 알림 센터 컴포넌트
// 실시간 보안 알림을 표시하고 관리하는 컴포넌트

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Badge,
    Popover,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
    Chip,
    Button,
    Divider,
    Alert,
    Snackbar,
} from '@mui/material';
import {
    Notifications,
    NotificationsActive,
    Warning,
    Error,
    Info,
    CheckCircle,
    Refresh,
} from '@mui/icons-material';
import advancedSecurityService, { SecurityAlert } from '../../services/advancedSecurityService';
import securityWebSocketService from '../../services/securityWebSocketService';
import { errorLogger } from '../../utils/errorLogger';

interface SecurityNotificationCenterProps {
    maxNotifications?: number;
    autoRefresh?: boolean;
    refreshInterval?: number;
}

const SecurityNotificationCenter: React.FC<SecurityNotificationCenterProps> = ({
    maxNotifications = 10,
    autoRefresh = true,
    refreshInterval = 30000, // 30초
}) => {
    const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const loadAlerts = useCallback(async () => {
        setIsLoading(true);
        try {
            const alertsData = await advancedSecurityService.getSecurityAlerts(undefined, 'new', maxNotifications);
            setAlerts(alertsData.alerts);
            setUnreadCount(alertsData.alerts.filter((a) => a.status === 'new').length);
        } catch (error) {
            errorLogger.error('보안 알림 로드 실패', error as Error);
        } finally {
            setIsLoading(false);
        }
    }, [maxNotifications]);

    useEffect(() => {
        loadAlerts();

        if (autoRefresh) {
            const interval = setInterval(loadAlerts, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [loadAlerts, autoRefresh, refreshInterval]);

    useEffect(() => {
        // WebSocket 이벤트 리스너
        const handleAlert = (data: SecurityAlert) => {
            setAlerts((prev) => {
                const newAlerts = [data, ...prev].slice(0, maxNotifications);
                setUnreadCount(newAlerts.filter((a) => a.status === 'new').length);

                // 중요 알림은 스낵바로 표시
                if (data.severity === 'critical' || data.severity === 'high') {
                    setSnackbarMessage(`${data.title}: ${data.description}`);
                    setSnackbarOpen(true);
                }

                return newAlerts;
            });
        };

        securityWebSocketService.on('alert', handleAlert);
        securityWebSocketService.subscribe('alert');

        return () => {
            securityWebSocketService.off('alert', handleAlert);
        };
    }, [maxNotifications]);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleAcknowledge = useCallback(async (alertId: string) => {
        try {
            await advancedSecurityService.acknowledgeAlert(alertId);
            setAlerts((prev) =>
                prev.map((alert) =>
                    alert.id === alertId ? { ...alert, status: 'acknowledged' as const } : alert
                )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            errorLogger.error('알림 확인 실패', error as Error);
        }
    }, []);

    const handleAcknowledgeAll = useCallback(async () => {
        try {
            const unreadAlerts = alerts.filter((a) => a.status === 'new');
            await Promise.all(unreadAlerts.map((a) => advancedSecurityService.acknowledgeAlert(a.id)));
            setAlerts((prev) =>
                prev.map((alert) =>
                    alert.status === 'new' ? { ...alert, status: 'acknowledged' as const } : alert
                )
            );
            setUnreadCount(0);
        } catch (error) {
            errorLogger.error('모든 알림 확인 실패', error as Error);
        }
    }, [alerts]);

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical':
                return <Error color="error" />;
            case 'high':
                return <Warning color="warning" />;
            case 'medium':
                return <Info color="info" />;
            default:
                return <CheckCircle color="success" />;
        }
    };

    const getSeverityColor = (severity: string): 'error' | 'warning' | 'info' | 'success' => {
        switch (severity) {
            case 'critical':
                return 'error';
            case 'high':
                return 'warning';
            case 'medium':
                return 'info';
            default:
                return 'success';
        }
    };

    const sortedAlerts = useMemo(() => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return [...alerts].sort((a, b) => {
            if (a.status === 'new' && b.status !== 'new') return -1;
            if (a.status !== 'new' && b.status === 'new') return 1;
            return severityOrder[a.severity] - severityOrder[b.severity];
        });
    }, [alerts]);

    const open = Boolean(anchorEl);
    const id = open ? 'security-notification-popover' : undefined;

    return (
        <>
            <IconButton
                color="inherit"
                onClick={handleClick}
                aria-label={`보안 알림 (${unreadCount}개 미확인)`}
                aria-describedby={id}
            >
                <Badge badgeContent={unreadCount} color="error">
                    {unreadCount > 0 ? <NotificationsActive /> : <Notifications />}
                </Badge>
            </IconButton>

            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                PaperProps={{
                    sx: { width: 400, maxHeight: 600 },
                }}
            >
                <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">보안 알림</Typography>
                        <Box>
                            <IconButton size="small" onClick={loadAlerts} disabled={isLoading} aria-label="새로고침">
                                <Refresh />
                            </IconButton>
                            {unreadCount > 0 && (
                                <Button size="small" onClick={handleAcknowledgeAll}>
                                    모두 확인
                                </Button>
                            )}
                        </Box>
                    </Box>

                    <Divider sx={{ mb: 1 }} />

                    {sortedAlerts.length === 0 ? (
                        <Alert severity="info">알림이 없습니다.</Alert>
                    ) : (
                        <List sx={{ maxHeight: 500, overflow: 'auto' }}>
                            {sortedAlerts.map((alert) => (
                                <ListItem
                                    key={alert.id}
                                    sx={{
                                        borderLeft: `4px solid ${alert.severity === 'critical'
                                                ? 'error.main'
                                                : alert.severity === 'high'
                                                    ? 'warning.main'
                                                    : 'info.main'
                                            }`,
                                        mb: 1,
                                        bgcolor: alert.status === 'new' ? 'action.hover' : 'transparent',
                                    }}
                                >
                                    <ListItemIcon>{getSeverityIcon(alert.severity)}</ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="subtitle2">{alert.title}</Typography>
                                                <Chip
                                                    label={alert.severity}
                                                    size="small"
                                                    color={getSeverityColor(alert.severity)}
                                                />
                                                {alert.status === 'new' && (
                                                    <Chip label="새" size="small" color="error" />
                                                )}
                                            </Box>
                                        }
                                        secondary={
                                            <>
                                                <Typography variant="body2" color="text.secondary">
                                                    {alert.description}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(alert.timestamp).toLocaleString()}
                                                </Typography>
                                            </>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        {alert.status === 'new' && (
                                            <IconButton
                                                edge="end"
                                                size="small"
                                                onClick={() => handleAcknowledge(alert.id)}
                                                aria-label={`${alert.title} 알림 확인`}
                                            >
                                                <CheckCircle />
                                            </IconButton>
                                        )}
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            </Popover>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity="error"
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default SecurityNotificationCenter;
