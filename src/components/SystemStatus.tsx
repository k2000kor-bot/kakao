import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    Button,
    Paper
} from '@mui/material';
import {
    CheckCircle,
    Error,
    Refresh,
    Speed,
    Analytics
} from '@mui/icons-material';
import { integratedAPIService } from '../services/integratedAPIService';

interface SystemStatusProps {
    onStatusChange?: (status: 'connected' | 'disconnected') => void;
}

const SystemStatus: React.FC<SystemStatusProps> = ({ onStatusChange }) => {
    const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
    const [integratedStatus, setIntegratedStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
    const [metrics, setMetrics] = useState<{
        total_requests: number;
        successful_requests: number;
        failed_requests: number;
        average_response_time: number;
        last_updated: string;
    } | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    const checkBackendStatus = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:5001/api/health');
            if (response.ok) {
                setBackendStatus('connected');
            } else {
                setBackendStatus('disconnected');
            }
        } catch (error) {
            setBackendStatus('disconnected');
        }
    }, []);

    const checkIntegratedStatus = useCallback(async () => {
        try {
            const isConnected = await integratedAPIService.testConnection();
            setIntegratedStatus(isConnected ? 'connected' : 'disconnected');

            if (isConnected) {
                const status = await integratedAPIService.getSystemStatus();
                setMetrics(status.metrics);
            }
        } catch (error) {
            setIntegratedStatus('disconnected');
        }
    }, []);

    const refreshAll = useCallback(async () => {
        setBackendStatus('checking');
        setIntegratedStatus('checking');

        await Promise.all([
            checkBackendStatus(),
            checkIntegratedStatus()
        ]);

        setLastUpdate(new Date());
    }, [checkBackendStatus, checkIntegratedStatus]);

    const overallStatus = useMemo(() => 
        backendStatus === 'connected' && integratedStatus === 'connected'
            ? 'connected'
            : 'disconnected',
        [backendStatus, integratedStatus]
    );

    useEffect(() => {
        refreshAll();
        const interval = setInterval(refreshAll, 30000); // 30초마다 업데이트
        return () => {
            if (typeof globalThis !== 'undefined' && 'clearInterval' in globalThis) {
                globalThis.clearInterval(interval);
            }
        };
    }, [refreshAll]);

    useEffect(() => {
        if (onStatusChange) {
            onStatusChange(overallStatus);
        }
    }, [overallStatus, onStatusChange]);

    const getStatusIcon = useCallback((status: string) => {
        switch (status) {
            case 'connected':
                return <CheckCircle color="success" aria-hidden="true" />;
            case 'disconnected':
                return <Error color="error" aria-hidden="true" />;
            default:
                return <Refresh color="action" aria-hidden="true" />;
        }
    }, []);

    const getStatusColor = useCallback((status: string) => {
        switch (status) {
            case 'connected':
                return 'success';
            case 'disconnected':
                return 'error';
            default:
                return 'default';
        }
    }, []);

    return (
        <Paper sx={{ p: 2, mb: 2 }} role="region" aria-label="시스템 상태">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Analytics aria-hidden="true" />
                    시스템 상태
                </Typography>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={refreshAll}
                    startIcon={<Refresh aria-hidden="true" />}
                    aria-label="시스템 상태 새로고침"
                    type="button"
                >
                    새로고침
                </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: '300px' }}>
                    <Card role="status" aria-live="polite" aria-label="기본 백엔드 상태">
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                {getStatusIcon(backendStatus)}
                                <Typography variant="subtitle1" component="h3">기본 백엔드</Typography>
                                <Chip
                                    label={backendStatus === 'connected' ? '연결됨' : backendStatus === 'disconnected' ? '연결 끊김' : '확인 중'}
                                    color={getStatusColor(backendStatus) as 'success' | 'error' | 'default'}
                                    size="small"
                                    aria-label={`기본 백엔드 상태: ${backendStatus === 'connected' ? '연결됨' : backendStatus === 'disconnected' ? '연결 끊김' : '확인 중'}`}
                                />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                포트 5001 - Flask 서버
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                <Box sx={{ flex: 1, minWidth: '300px' }}>
                    <Card role="status" aria-live="polite" aria-label="통합 API 서버 상태">
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                {getStatusIcon(integratedStatus)}
                                <Typography variant="subtitle1" component="h3">통합 API 서버</Typography>
                                <Chip
                                    label={integratedStatus === 'connected' ? '연결됨' : integratedStatus === 'disconnected' ? '연결 끊김' : '확인 중'}
                                    color={getStatusColor(integratedStatus) as 'success' | 'error' | 'default'}
                                    size="small"
                                    aria-label={`통합 API 서버 상태: ${integratedStatus === 'connected' ? '연결됨' : integratedStatus === 'disconnected' ? '연결 끊김' : '확인 중'}`}
                                />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                포트 5002 - 통합 AI 서버
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            {metrics && (
                <Box sx={{ mt: 2 }} role="region" aria-label="성능 메트릭">
                    <Typography variant="subtitle2" component="h3" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Speed aria-hidden="true" />
                        성능 메트릭
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }} role="list" aria-label="성능 지표">
                        <Chip
                            icon={<Analytics aria-hidden="true" />}
                            label={`총 요청: ${metrics.total_requests}`}
                            size="small"
                            variant="outlined"
                            role="listitem"
                            aria-label={`총 요청 수: ${metrics.total_requests}`}
                        />
                        <Chip
                            icon={<CheckCircle aria-hidden="true" />}
                            label={`성공: ${metrics.successful_requests}`}
                            size="small"
                            variant="outlined"
                            color="success"
                            role="listitem"
                            aria-label={`성공한 요청 수: ${metrics.successful_requests}`}
                        />
                        <Chip
                            icon={<Error aria-hidden="true" />}
                            label={`실패: ${metrics.failed_requests}`}
                            size="small"
                            variant="outlined"
                            color="error"
                            role="listitem"
                            aria-label={`실패한 요청 수: ${metrics.failed_requests}`}
                        />
                        <Chip
                            icon={<Speed aria-hidden="true" />}
                            label={`응답시간: ${(metrics.average_response_time * 1000).toFixed(2)}ms`}
                            size="small"
                            variant="outlined"
                            role="listitem"
                            aria-label={`평균 응답 시간: ${(metrics.average_response_time * 1000).toFixed(2)} 밀리초`}
                        />
                    </Box>
                </Box>
            )}

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                마지막 업데이트: <time dateTime={lastUpdate.toISOString()}>{lastUpdate.toLocaleTimeString()}</time>
            </Typography>
        </Paper>
    );
};

export default SystemStatus;
