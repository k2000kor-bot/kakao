import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { joinApiHealthCheckUrl, resolveApiBaseUrl } from '../config/api';
import {
    Box,
    Card,
    CardContent,
    Typography,
    LinearProgress,
    Chip,
    IconButton,
    Tooltip,
    Fab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Paper,
    Avatar,
    FormControlLabel,
    Switch,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Speed as SpeedIcon,
    Security as SecurityIcon,
    Psychology as PsychologyIcon,
    Refresh as RefreshIcon,
    Settings as SettingsIcon,
    TrendingUp as TrendingUpIcon,
    Memory as MemoryIcon,
    Storage as StorageIcon,
    NetworkCheck as NetworkIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Info as InfoIcon,
    Close as CloseIcon,
    DeleteSweep as DeleteSweepIcon,
    FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import Slider from '@mui/material/Slider';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { performanceApi } from '../services/apiService';
import { websocketService, SystemMetrics as WSSystemMetrics, SecurityAlert, AIEngineStatus, PerformanceOptimization } from '../services/websocketService';
import { notificationService } from '../services/notificationService';
import NotificationCenter from './NotificationCenter';
import { useNotifications } from '../hooks/useNotifications';
import { errorLogger } from '../utils/errorLogger';

interface SystemMetrics {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
    responseTime: number;
    errorRate: number;
}

interface SystemStatus {
    overall: string;
    performance: string;
    security: string;
    ai: string;
    userExperience: string;
}

interface AlertData {
    id: string;
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
    timestamp: string;
}

interface MetricHistoryPoint {
    time: string;
    cpu: number;
    memory: number;
    disk: number;
    network: number;
    responseTime: number;
}

interface AlertThresholds {
    cpuWarning: number;
    cpuError: number;
    memoryWarning: number;
    memoryError: number;
    diskWarning: number;
    diskError: number;
    responseTimeWarning: number;
    responseTimeError: number;
}

const IntegratedDashboard: React.FC = () => {
    // 알림 관리
    const {
        notifications,
        markAsRead,
        markAllAsRead,
        dismiss,
        clearAll,
    } = useNotifications();

    const [metrics, setMetrics] = useState<SystemMetrics>({
        cpu: 0,
        memory: 0,
        disk: 0,
        network: 0,
        responseTime: 0,
        errorRate: 0
    });

    const [systemStatus, setSystemStatus] = useState<SystemStatus>({
        overall: 'healthy',
        performance: 'healthy',
        security: 'healthy',
        ai: 'healthy',
        userExperience: 'healthy'
    });

    const [alerts, setAlerts] = useState<AlertData[]>([]);
    const [loading, setLoading] = useState(true);
    const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
    const [metricsHistory, setMetricsHistory] = useState<MetricHistoryPoint[]>([]);
    const [manualRefreshing, setManualRefreshing] = useState(false);
    const fetchDataRef = useRef<(() => Promise<void>) | null>(null);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(5);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
    const [optimizing, setOptimizing] = useState(false);
    const notificationsEnabledRef = useRef(notificationsEnabled);
    useEffect(() => { notificationsEnabledRef.current = notificationsEnabled; }, [notificationsEnabled]);

    const THRESHOLDS_KEY = 'corbu.dash.thresholds';
    const DEFAULT_THRESHOLDS: AlertThresholds = { cpuWarning: 80, cpuError: 95, memoryWarning: 80, memoryError: 90, diskWarning: 75, diskError: 90, responseTimeWarning: 200, responseTimeError: 500 };
    const [thresholds, setThresholds] = useState<AlertThresholds>(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('corbu.dash.thresholds') ?? 'null') as AlertThresholds | null;
            return saved ? { ...DEFAULT_THRESHOLDS, ...saved } : DEFAULT_THRESHOLDS;
        } catch { return DEFAULT_THRESHOLDS; }
    });
    const [thresholdPanelOpen, setThresholdPanelOpen] = useState(false);

    // 메트릭 카드 표시/숨김 커스터마이징
    const METRIC_CARDS_KEY = 'corbu.dash.hiddenCards';
    const ALL_METRIC_CARD_IDS = ['cpu', 'memory', 'disk', 'network'] as const;
    type MetricCardId = typeof ALL_METRIC_CARD_IDS[number];
    const METRIC_CARD_LABELS: Record<MetricCardId, string> = { cpu: 'CPU 사용률', memory: '메모리', disk: '디스크', network: '네트워크' };
    const [hiddenCards, setHiddenCards] = useState<Set<MetricCardId>>(() => {
        try {
            const saved: MetricCardId[] = JSON.parse(localStorage.getItem(METRIC_CARDS_KEY) ?? '[]');
            return new Set(saved);
        } catch { return new Set(); }
    });
    const [cardCustomizeOpen, setCardCustomizeOpen] = useState(false);
    const toggleCardVisibility = (id: MetricCardId) => {
        setHiddenCards(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            localStorage.setItem(METRIC_CARDS_KEY, JSON.stringify(Array.from(next)));
            return next;
        });
    };

    /* 임계값 초과 토스트 알림 — 이전 상태와 비교해 새로 초과된 경우에만 발행 */
    const prevThresholdBreach = useRef<Record<string, boolean>>({});
    const thresholdsRef = useRef(thresholds);
    thresholdsRef.current = thresholds;
    const checkThresholdBreaches = useCallback((m: SystemMetrics) => {
        const t = thresholdsRef.current;
        const checks: { key: string; value: number; warn: number; error: number; label: string; unit: string }[] = [
            { key: 'cpu',  value: m.cpu,  warn: t.cpuWarning,  error: t.cpuError,  label: 'CPU 사용률',  unit: '%'  },
            { key: 'mem',  value: m.memory,  warn: t.memoryWarning,  error: t.memoryError,  label: '메모리',  unit: '%'  },
            { key: 'disk', value: m.disk, warn: t.diskWarning, error: t.diskError, label: '디스크',  unit: '%' },
            { key: 'rt',   value: m.responseTime, warn: t.responseTimeWarning, error: t.responseTimeError, label: '응답시간', unit: 'ms' },
        ];
        checks.forEach(({ key, value, warn, error, label, unit }) => {
            const isError = value >= error;
            const isWarn  = value >= warn && !isError;
            const breachKey = `${key}:${isError ? 'error' : isWarn ? 'warn' : 'ok'}`;
            if (!prevThresholdBreach.current[breachKey]) {
                if (isError || isWarn) {
                    const level = isError ? '⚠️ 위험' : '⚡ 경고';
                    const msg = `${level} — ${label} ${value.toFixed(0)}${unit}`;
                    // notificationService 활용
                    try {
                        notificationService.addNotification({
                            type: isError ? 'error' : 'warning',
                            title: `시스템 ${isError ? '위험' : '경고'}`,
                            message: msg,
                            priority: isError ? 'high' : 'medium',
                            category: 'performance',
                        });
                    } catch { /* ignore */ }
                }
                // 상태 초기화
                Object.keys(prevThresholdBreach.current).forEach(k => {
                    if (k.startsWith(`${key}:`)) delete prevThresholdBreach.current[k];
                });
                prevThresholdBreach.current[breachKey] = true;
            }
        });
    }, []);

    useEffect(() => {
        try { localStorage.setItem(THRESHOLDS_KEY, JSON.stringify(thresholds)); } catch { /* ignore */ }
    }, [thresholds]);

    /* 이전 스냅샷 — 트렌드(상승/하락) 계산용 */
    const prevMetricsRef = useRef<SystemMetrics | null>(null);
    const [trends, setTrends] = useState<Record<string, 'up' | 'down' | 'stable'>>({});

    /* 업타임 카운터 */
    const startTimeRef = useRef(Date.now());
    const [uptimeSeconds, setUptimeSeconds] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => {
            setUptimeSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, []);
    const formatUptime = (s: number) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${sec}s` : `${sec}s`;
    };

    /* ── 실시간 알림 로그 ── */
    interface AlertLogEntry {
        id: string;
        level: 'info' | 'warn' | 'error' | 'success';
        message: string;
        time: string;
    }
    const MAX_LOG = 50;
    const [alertLog, setAlertLog] = useState<AlertLogEntry[]>(() => {
        try { return JSON.parse(localStorage.getItem('corbu.dash.alertLog') ?? '[]') as AlertLogEntry[]; } catch { return []; }
    });
    const pushLog = useCallback((level: AlertLogEntry['level'], message: string) => {
        setAlertLog((prev) => {
            const entry: AlertLogEntry = { id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, level, message, time: new Date().toLocaleTimeString('ko-KR') };
            const updated = [entry, ...prev].slice(0, MAX_LOG);
            try { localStorage.setItem('corbu.dash.alertLog', JSON.stringify(updated)); } catch { /* ignore */ }
            return updated;
        });
    }, []);

    /* localStorage 사용량 */
    const [lsUsage, setLsUsage] = useState({ used: 0, total: 5 * 1024 * 1024 });
    useEffect(() => {
        const calc = () => {
            try {
                let total = 0;
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i) ?? '';
                    total += (localStorage.getItem(key) ?? '').length * 2; // UTF-16
                }
                setLsUsage({ used: total, total: 5 * 1024 * 1024 });
            } catch { /* ignore */ }
        };
        calc();
        window.addEventListener('storage', calc);
        return () => window.removeEventListener('storage', calc);
    }, []);
    const lsKB = (lsUsage.used / 1024).toFixed(1);
    const lsPct = Math.min(100, (lsUsage.used / lsUsage.total) * 100);

    /* 시스템 헬스 스코어 (0-100) — 각 메트릭 위험도를 합산해 역산 */
    const healthScore = useMemo(() => {
        const cpuPenalty  = metrics.cpu > thresholds.cpuError ? 25
            : metrics.cpu > thresholds.cpuWarning ? 12 : 0;
        const memPenalty  = metrics.memory > thresholds.memoryError ? 25
            : metrics.memory > thresholds.memoryWarning ? 12 : 0;
        const diskPenalty = metrics.disk > thresholds.diskError ? 20 : metrics.disk > thresholds.diskWarning ? 10 : 0;
        const rtPenalty   = metrics.responseTime > thresholds.responseTimeError ? 20
            : metrics.responseTime > thresholds.responseTimeWarning ? 10 : 0;
        const errPenalty  = metrics.errorRate > 5 ? 10 : metrics.errorRate > 1 ? 5 : 0;
        return Math.max(0, 100 - cpuPenalty - memPenalty - diskPenalty - rtPenalty - errPenalty);
    }, [metrics, thresholds]);

    const healthLabel = healthScore >= 90 ? '우수' : healthScore >= 70 ? '양호' : healthScore >= 50 ? '주의' : '위험';
    const healthColor = healthScore >= 90 ? '#22c55e' : healthScore >= 70 ? '#3b82f6' : healthScore >= 50 ? '#f59e0b' : '#ef4444';

    /* 지능형 메트릭 요약 문장 — 현재 상태를 자연어로 설명 */
    const metricSummary = useMemo(() => {
        const now = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        const parts: string[] = [];
        // CPU
        if (metrics.cpu > thresholds.cpuError) parts.push(`CPU가 ${metrics.cpu.toFixed(0)}%로 과부하 상태입니다`);
        else if (metrics.cpu > thresholds.cpuWarning) parts.push(`CPU 사용률이 ${metrics.cpu.toFixed(0)}%로 높습니다`);
        else parts.push(`CPU는 ${metrics.cpu.toFixed(0)}%로 안정적입니다`);
        // 메모리
        if (metrics.memory > thresholds.memoryError) parts.push(`메모리가 ${metrics.memory.toFixed(0)}%로 부족에 가깝습니다`);
        else if (metrics.memory > thresholds.memoryWarning) parts.push(`메모리 ${metrics.memory.toFixed(0)}% 사용 중입니다`);
        else parts.push(`메모리 ${metrics.memory.toFixed(0)}% 여유 있음`);
        // 응답 시간
        if (metrics.responseTime > thresholds.responseTimeError) parts.push(`응답 시간 ${metrics.responseTime.toFixed(0)}ms로 심각한 지연`);
        else if (metrics.responseTime > thresholds.responseTimeWarning) parts.push(`응답 ${metrics.responseTime.toFixed(0)}ms로 다소 느림`);
        else parts.push(`응답 시간 ${metrics.responseTime.toFixed(0)}ms로 쾌적합니다`);
        // 전반 평가
        const verdict = healthScore >= 90 ? '전반적으로 시스템이 원활하게 운영되고 있습니다.'
            : healthScore >= 70 ? '일부 지표를 모니터링할 필요가 있습니다.'
            : healthScore >= 50 ? '시스템에 주의가 필요합니다.'
            : '즉각적인 조치가 필요합니다.';
        return `${now} 기준 — ${parts.join(', ')}. ${verdict}`;
    }, [metrics, thresholds, healthScore]);

    /* 성능 권장사항 — 현재 메트릭 기반 자동 생성 */
    const recommendations = useMemo(() => {
        const recs: { icon: string; level: 'info' | 'warn' | 'error'; text: string }[] = [];
        if (metrics.cpu > thresholds.cpuError)
            recs.push({ icon: '🔴', level: 'error', text: `CPU ${metrics.cpu.toFixed(0)}% — 과부하 상태. 불필요한 탭·프로세스를 종료하세요.` });
        else if (metrics.cpu > thresholds.cpuWarning)
            recs.push({ icon: '🟡', level: 'warn', text: `CPU ${metrics.cpu.toFixed(0)}% — 높은 사용량. 무거운 작업을 피하세요.` });
        if (metrics.memory > thresholds.memoryError)
            recs.push({ icon: '🔴', level: 'error', text: `메모리 ${metrics.memory.toFixed(0)}% — 부족 임박. 페이지를 새로고침 하거나 다른 앱을 닫으세요.` });
        else if (metrics.memory > thresholds.memoryWarning)
            recs.push({ icon: '🟡', level: 'warn', text: `메모리 ${metrics.memory.toFixed(0)}% — 사용량이 높습니다.` });
        if (metrics.disk > 90)
            recs.push({ icon: '🔴', level: 'error', text: `디스크 ${metrics.disk.toFixed(0)}% — 용량 부족. 오래된 파일을 정리하세요.` });
        else if (metrics.disk > 75)
            recs.push({ icon: '🟡', level: 'warn', text: `디스크 ${metrics.disk.toFixed(0)}% — 여유 공간이 줄고 있습니다.` });
        if (metrics.responseTime > thresholds.responseTimeError)
            recs.push({ icon: '🔴', level: 'error', text: `응답 ${metrics.responseTime.toFixed(0)}ms — 심각한 지연. 네트워크 상태를 확인하세요.` });
        else if (metrics.responseTime > thresholds.responseTimeWarning)
            recs.push({ icon: '🟡', level: 'warn', text: `응답 ${metrics.responseTime.toFixed(0)}ms — 다소 느립니다.` });
        if (metrics.errorRate > 1)
            recs.push({ icon: '🔴', level: 'error', text: `오류율 ${metrics.errorRate.toFixed(1)}% — 이상 감지. 콘솔 로그를 확인하세요.` });
        const lsPctLocal = (lsUsage.used / lsUsage.total) * 100;
        if (lsPctLocal > 80)
            recs.push({ icon: '🟡', level: 'warn', text: `localStorage ${lsPctLocal.toFixed(0)}% 사용 — 오래된 대화 데이터를 정리하세요.` });
        if (recs.length === 0)
            recs.push({ icon: '🟢', level: 'info', text: '모든 지표가 정상 범위입니다. 시스템 상태가 양호합니다.' });
        return recs;
    }, [metrics, thresholds, lsUsage]);

    const updateTrends = useCallback((next: SystemMetrics) => {
        const prev = prevMetricsRef.current;
        if (!prev) { prevMetricsRef.current = next; return; }
        const calc = (a: number, b: number): 'up' | 'down' | 'stable' =>
            Math.abs(a - b) < 1 ? 'stable' : a > b ? 'up' : 'down';
        setTrends({
            cpu:          calc(next.cpu,          prev.cpu),
            memory:       calc(next.memory,       prev.memory),
            disk:         calc(next.disk,         prev.disk),
            network:      calc(next.network,      prev.network),
            responseTime: calc(next.responseTime, prev.responseTime),
        });
        prevMetricsRef.current = next;
        // 임계값 초과 알림
        checkThresholdBreaches(next);
    }, [checkThresholdBreaches]);

    // 선형 회귀 기반 예측 (최근 N개 포인트)
    const metricPredictions = useMemo(() => {
        const pts = metricsHistory.slice(-10);
        if (pts.length < 3) return null;
        const n = pts.length;

        function linearPredict(values: number[]): number {
            const xs = values.map((_, i) => i);
            const ys = values;
            const sumX = xs.reduce((a, b) => a + b, 0);
            const sumY = ys.reduce((a, b) => a + b, 0);
            const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
            const sumX2 = xs.reduce((acc, x) => acc + x * x, 0);
            const denom = n * sumX2 - sumX * sumX;
            if (denom === 0) return ys[ys.length - 1];
            const slope = (n * sumXY - sumX * sumY) / denom;
            const intercept = (sumY - slope * sumX) / n;
            const nextX = n; // 다음 시점
            return Math.min(100, Math.max(0, Math.round(intercept + slope * nextX)));
        }

        return {
            cpu: linearPredict(pts.map((p) => p.cpu)),
            memory: linearPredict(pts.map((p) => p.memory)),
            disk: linearPredict(pts.map((p) => p.disk)),
            responseTime: Math.max(0, Math.round(
                (() => {
                    const values = pts.map((p) => p.responseTime);
                    const xs = values.map((_, i) => i);
                    const ys = values;
                    const sumX = xs.reduce((a, b) => a + b, 0);
                    const sumY = ys.reduce((a, b) => a + b, 0);
                    const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
                    const sumX2 = xs.reduce((acc, x) => acc + x * x, 0);
                    const denom = n * sumX2 - sumX * sumX;
                    if (denom === 0) return ys[ys.length - 1];
                    const slope = (n * sumXY - sumX * sumY) / denom;
                    const intercept = (sumY - slope * sumX) / n;
                    return intercept + slope * n;
                })()
            )),
            sampleCount: n,
        };
    }, [metricsHistory]);

    const exportMetricsCSV = useCallback(() => {
        if (metricsHistory.length === 0) return;
        const headers = ['시간', 'CPU(%)', '메모리(%)', '디스크(%)', '네트워크(%)', '응답시간(ms)'];
        const rows = metricsHistory.map((p) =>
            [p.time, p.cpu, p.memory, p.disk, p.network, p.responseTime].join(',')
        );
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `metrics_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [metricsHistory]);

    // 실시간 데이터 업데이트
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 시스템 메트릭 수집
                const metricsResult = await performanceApi.getMetrics();
                if (metricsResult.success && metricsResult.data) {
                    const data = metricsResult.data as Record<string, number | undefined>;
                    const snap: SystemMetrics = {
                        cpu: data.cpu || 0,
                        memory: data.memory || 0,
                        disk: data.disk || 0,
                        network: data.network || 0,
                        responseTime: data.responseTime || 0,
                        errorRate: data.errorRate || 0,
                    };
                    setMetrics(snap);
                    updateTrends(snap);
                    setMetricsHistory(prev => [
                        ...prev,
                        {
                            time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                            cpu: snap.cpu,
                            memory: snap.memory,
                            disk: snap.disk,
                            network: snap.network,
                            responseTime: snap.responseTime,
                        },
                    ].slice(-20));
                }

                // 시스템 상태 확인
                try {
                    const healthResponse = await fetch(joinApiHealthCheckUrl(resolveApiBaseUrl()));
                    const healthData = await healthResponse.json();
                    if (healthData.success) {
                        setBackendConnected(true);
                        setSystemStatus({
                            overall: healthData.status,
                            performance: healthData.modules?.performance || 'healthy',
                            security: healthData.modules?.security || 'healthy',
                            ai: healthData.modules?.ai_engine || 'healthy',
                            userExperience: healthData.modules?.user_experience || 'healthy'
                        });
                    }
                } catch {
                    setBackendConnected(false);
                }

                // 메트릭 임계값 기반 알림 생성
                if (metricsResult.success && metricsResult.data) {
                    const d = metricsResult.data as Record<string, number | undefined>;
                    const alertsToAdd: AlertData[] = [];
                    const ts = new Date().toISOString();

                    if ((d.cpu ?? 0) > thresholds.cpuError) {
                        alertsToAdd.push({ id: `cpu-${Date.now()}`, type: 'error', title: 'CPU 위험', message: `CPU 사용률이 ${(d.cpu ?? 0).toFixed(1)}%로 임계치(${thresholds.cpuError}%)를 초과했습니다.`, timestamp: ts });
                    } else if ((d.cpu ?? 0) > thresholds.cpuWarning) {
                        alertsToAdd.push({ id: `cpu-${Date.now()}`, type: 'warning', title: 'CPU 경고', message: `CPU 사용률이 ${(d.cpu ?? 0).toFixed(1)}%로 높습니다. (기준: ${thresholds.cpuWarning}%)`, timestamp: ts });
                    }
                    if ((d.memory ?? 0) > thresholds.memoryError) {
                        alertsToAdd.push({ id: `mem-${Date.now()}`, type: 'error', title: '메모리 부족', message: `메모리 사용률이 ${(d.memory ?? 0).toFixed(1)}%입니다. (기준: ${thresholds.memoryError}%)`, timestamp: ts });
                    } else if ((d.memory ?? 0) > thresholds.memoryWarning) {
                        alertsToAdd.push({ id: `mem-${Date.now()}`, type: 'warning', title: '메모리 경고', message: `메모리 사용률이 ${(d.memory ?? 0).toFixed(1)}%로 높습니다. (기준: ${thresholds.memoryWarning}%)`, timestamp: ts });
                    }
                    if ((d.errorRate ?? 0) > 1) {
                        alertsToAdd.push({ id: `err-${Date.now()}`, type: 'error', title: '오류율 급증', message: `오류율이 ${(d.errorRate ?? 0).toFixed(2)}%입니다. 즉시 확인하세요.`, timestamp: ts });
                    }
                    alertsToAdd.forEach((a) => {
                        pushLog(a.type === 'error' ? 'error' : a.type === 'warning' ? 'warn' : 'info', `[${a.title}] ${a.message}`);
                    });
                    if (alertsToAdd.length === 0) {
                        alertsToAdd.push({ id: `ok-${Date.now()}`, type: 'info', title: '시스템 정상', message: `모든 지표가 정상 범위입니다. (${new Date().toLocaleTimeString()})`, timestamp: ts });
                        pushLog('success', '시스템 정상 — 모든 지표 정상 범위');
                    }
                    setAlerts(prev => notificationsEnabledRef.current
                        ? [...alertsToAdd, ...prev].slice(0, 10)
                        : prev);
                }

            } catch (error) {
                errorLogger.error('데이터 수집 실패', error instanceof Error ? error : new Error(String(error)), {
                    component: 'IntegratedDashboard',
                    action: 'collectMetrics',
                });
                if (notificationsEnabledRef.current) {
                    notificationService.error('데이터 수집 오류', '시스템 메트릭 수집 중 오류가 발생했습니다.');
                }
                const errorAlert: AlertData = {
                    id: Date.now().toString(),
                    type: 'error',
                    title: '데이터 수집 오류',
                    message: '시스템 메트릭 수집 중 오류가 발생했습니다.',
                    timestamp: new Date().toISOString()
                };
                setAlerts(prev => [errorAlert, ...prev.slice(0, 9)]);
            } finally {
                setLoading(false);
            }
        };

        fetchDataRef.current = fetchData;
        fetchData();
        if (!autoRefreshEnabled) return;
        const interval = setInterval(fetchData, refreshInterval * 1000);
        return () => clearInterval(interval);
        // thresholds·pushLog·updateTrends는 fetchData 내부에서 최신 클로저로 읽음 — interval 키만 의존
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshInterval, autoRefreshEnabled]);

    // WebSocket 실시간 데이터 수신
    useEffect(() => {
        const handleSystemMetrics = (data: WSSystemMetrics) => {
            const snap: SystemMetrics = {
                cpu: data.cpu,
                memory: data.memory,
                disk: data.disk,
                network: data.network,
                responseTime: data.responseTime,
                errorRate: data.errorRate,
            };
            setMetrics(snap);
            setMetricsHistory(prev => [
                ...prev,
                {
                    time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    cpu: snap.cpu,
                    memory: snap.memory,
                    disk: snap.disk,
                    network: snap.network,
                    responseTime: snap.responseTime,
                },
            ].slice(-20));
        };

        const handleSecurityAlert = (data: SecurityAlert) => {
            notificationService.security(
                '보안 알림',
                `${data.message} - 심각도: ${data.severity}`,
                {
                    actions: [
                        {
                            label: '상세 보기',
                            action: () => {
                                errorLogger.info('보안 알림 상세', {
                                    component: 'IntegratedDashboard',
                                    action: 'securityAlertDetail',
                                    alertType: data.alert_type,
                                    severity: data.severity,
                                });
                            },
                            variant: 'primary',
                        },
                    ],
                }
            );
        };

        const handleAIEngineStatus = (data: AIEngineStatus) => {
            if (data.overall_performance < 90) {
                notificationService.ai(
                    'AI 엔진 성능 저하',
                    `AI 엔진 성능이 ${data.overall_performance.toFixed(1)}%로 저하되었습니다.`
                );
            }
        };

        const handlePerformanceOptimization = (data: PerformanceOptimization) => {
            if (data.status === 'completed') {
                notificationService.performance(
                    '성능 최적화 완료',
                    `${data.optimization_type} 최적화가 완료되었습니다. 성능 향상: ${data.performance_gain.toFixed(1)}%`
                );
            } else if (data.status === 'failed') {
                notificationService.error(
                    '성능 최적화 실패',
                    `${data.optimization_type} 최적화가 실패했습니다.`
                );
            }
        };

        // WebSocket 이벤트 리스너 등록
        websocketService.on('systemMetrics', handleSystemMetrics);
        websocketService.on('securityAlert', handleSecurityAlert);
        websocketService.on('aiEngineStatus', handleAIEngineStatus);
        websocketService.on('performanceOptimization', handlePerformanceOptimization);

        // 초기 데이터 요청
        websocketService.requestMetrics();
        websocketService.requestSecurityAlerts();
        websocketService.requestAIStatus();
        websocketService.requestPerformanceOptimization();

        return () => {
            websocketService.off('systemMetrics', handleSystemMetrics);
            websocketService.off('securityAlert', handleSecurityAlert);
            websocketService.off('aiEngineStatus', handleAIEngineStatus);
            websocketService.off('performanceOptimization', handlePerformanceOptimization);
        };
    }, []);

    const dismissAlert = useCallback((id: string) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    }, []);

    const clearAllAlerts = useCallback(() => {
        setAlerts([]);
    }, []);

    const getStatusColor = useCallback((status: string): 'success' | 'warning' | 'error' | 'default' => {
        switch (status) {
            case 'healthy': return 'success';
            case 'warning': return 'warning';
            case 'error': return 'error';
            default: return 'default';
        }
    }, []);

    const getStatusIcon = useCallback((status: string) => {
        switch (status) {
            case 'healthy': return <CheckCircleIcon />;
            case 'warning': return <WarningIcon />;
            case 'error': return <ErrorIcon />;
            default: return <InfoIcon />;
        }
    }, []);

    const MetricCard: React.FC<{
        title: string;
        value: number;
        unit: string;
        icon: React.ReactNode;
        color: string;
        max?: number;
        trendKey?: string;
        sparkData?: number[];
        sparkColor?: string;
    }> = ({ title, value, unit, icon, color, max = 100, trendKey, sparkData, sparkColor }) => {
        const trend = trendKey ? trends[trendKey] : undefined;
        const trendLabel = trend === 'up' ? '▲' : trend === 'down' ? '▼' : '—';
        const trendColor = trendKey
            ? (trendKey === 'responseTime'
                ? (trend === 'up' ? '#ef4444' : trend === 'down' ? '#22c55e' : '#94a3b8')
                : (trend === 'up' ? '#ef4444' : trend === 'down' ? '#22c55e' : '#94a3b8'))
            : '#94a3b8';

        // 스파크라인 SVG 경로 계산
        const sparkPath = useMemo(() => {
            if (!sparkData || sparkData.length < 2) return null;
            const w = 80, h = 28;
            const minV = Math.min(...sparkData);
            const maxV = Math.max(...sparkData) || 1;
            const pts = sparkData.map((v, i) => {
                const x = (i / (sparkData.length - 1)) * w;
                const y = h - ((v - minV) / (maxV - minV || 1)) * h;
                return `${x.toFixed(1)},${y.toFixed(1)}`;
            });
            return `M ${pts.join(' L ')}`;
        }, [sparkData]);

        return (
            <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
                <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                        <Typography variant="h6" component="div">
                            {title}
                        </Typography>
                        <Avatar sx={{ bgcolor: color, width: 40, height: 40 }}>
                            {icon}
                        </Avatar>
                    </Box>
                    <Box display="flex" alignItems="baseline" justifyContent="space-between">
                        <Box display="flex" alignItems="baseline" gap={1}>
                            <Typography variant="h4" component="div" color={color}>
                                {value.toFixed(1)}{unit}
                            </Typography>
                            {trend && (
                                <Typography
                                    component="span"
                                    sx={{ fontSize: '0.85rem', fontWeight: 700, color: trendColor }}
                                    aria-label={`추세: ${trend === 'up' ? '상승' : trend === 'down' ? '하락' : '유지'}`}
                                >
                                    {trendLabel}
                                </Typography>
                            )}
                        </Box>
                        {sparkPath && (
                            <svg
                                width="80"
                                height="28"
                                viewBox="0 0 80 28"
                                aria-hidden
                                style={{ flexShrink: 0 }}
                            >
                                <path
                                    d={sparkPath}
                                    fill="none"
                                    stroke={sparkColor ?? '#6366f1'}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    opacity="0.75"
                                />
                                {/* 마지막 점 강조 */}
                                {(() => {
                                    const last = sparkData![sparkData!.length - 1];
                                    const minV = Math.min(...sparkData!);
                                    const maxV = Math.max(...sparkData!) || 1;
                                    const y = 28 - ((last - minV) / (maxV - minV || 1)) * 28;
                                    return <circle cx="80" cy={y.toFixed(1)} r="3" fill={sparkColor ?? '#6366f1'} />;
                                })()}
                            </svg>
                        )}
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={(value / max) * 100}
                        sx={{ mt: 1, height: 8, borderRadius: 4 }}
                        color={value > max * 0.8 ? 'error' : value > max * 0.6 ? 'warning' : 'primary'}
                    />
                </CardContent>
            </Card>
        );
    };

    const StatusCard: React.FC<{
        title: string;
        status: string;
        icon: React.ReactNode;
        description: string;
    }> = ({ title, status, icon, description }) => (
        <Card 
            sx={{ height: '100%' }}
            role="region"
            aria-label={`${title} 상태: ${status}`}
        >
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="h6" component="div">
                        {title}
                    </Typography>
                    <Chip
                        icon={getStatusIcon(status)}
                        label={status.toUpperCase()}
                        color={getStatusColor(status)}
                        size="small"
                        aria-label={`상태: ${status}`}
                    />
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                    <span aria-hidden="true">{icon}</span>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        {description}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Box sx={{
            flexGrow: 1, p: 3, bgcolor: 'background.default', minHeight: 'var(--app-vh-min)',
            '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
        }}>
            {/* 헤더 */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                    <DashboardIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
                    <Typography variant="h4" component="h1" fontWeight="bold">
                        CORBU.AI Ultimate Dashboard
                    </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                    <NotificationCenter
                        notifications={notifications}
                        onMarkAsRead={markAsRead}
                        onMarkAllRead={markAllAsRead}
                        onDismiss={dismiss}
                        onClearAll={clearAll}
                    />
                    <Tooltip title="데이터 새로고침">
                        <span>
                            <IconButton
                                disabled={manualRefreshing}
                                onClick={async () => {
                                    if (!fetchDataRef.current) return;
                                    setManualRefreshing(true);
                                    await fetchDataRef.current();
                                    setManualRefreshing(false);
                                }}
                                aria-label="데이터 새로고침"
                            >
                                <RefreshIcon sx={{ animation: manualRefreshing ? 'spin 1s linear infinite' : 'none' }} />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="설정">
                        <IconButton onClick={() => setSettingsOpen(true)}>
                            <SettingsIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* ── 지능형 요약 배너 ── */}
            <Paper
                elevation={0}
                sx={{
                    mb: 3, p: '14px 18px',
                    background: healthScore >= 90 ? '#f0fdf4' : healthScore >= 70 ? '#eff6ff' : healthScore >= 50 ? '#fffbeb' : '#fef2f2',
                    border: `1px solid ${healthColor}40`,
                    borderRadius: 2,
                    display: 'flex', alignItems: 'flex-start', gap: 1.5,
                }}
                aria-live="polite"
                aria-label="시스템 상태 요약"
            >
                <span style={{ fontSize: '20px', lineHeight: 1.3, flexShrink: 0 }}>
                    {healthScore >= 90 ? '✅' : healthScore >= 70 ? 'ℹ️' : healthScore >= 50 ? '⚠️' : '🚨'}
                </span>
                <Typography variant="body2" sx={{ lineHeight: 1.6, color: 'text.primary' }}>
                    {metricSummary}
                </Typography>
            </Paper>

            {/* ── 시스템 헬스 스코어 + 권장사항 ── */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                {/* 헬스 스코어 */}
                <Box sx={{ flex: '0 0 200px', minWidth: '180px' }}>
                    <Card sx={{ height: '100%', textAlign: 'center' }}>
                        <CardContent>
                            <Typography variant="h6" mb={1}>시스템 헬스</Typography>
                            <Box
                                sx={{
                                    width: 100, height: 100, borderRadius: '50%', mx: 'auto',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: `6px solid ${healthColor}`,
                                    background: `${healthColor}18`,
                                    mb: 1,
                                }}
                                aria-label={`헬스 스코어: ${healthScore}점 (${healthLabel})`}
                            >
                                <Typography variant="h4" fontWeight="bold" sx={{ color: healthColor }}>
                                    {healthScore}
                                </Typography>
                            </Box>
                            <Chip
                                label={healthLabel}
                                size="small"
                                sx={{ bgcolor: healthColor, color: '#fff', fontWeight: 700 }}
                            />
                        </CardContent>
                    </Card>
                </Box>
                {/* 권장사항 */}
                <Box sx={{ flex: '1 1 300px' }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" mb={1.5}>⚡ 성능 권장사항</Typography>
                            {recommendations.map((r, i) => (
                                <Box
                                    key={i}
                                    sx={{
                                        display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.75,
                                        p: 0.75, borderRadius: 1,
                                        background: r.level === 'error' ? '#fef2f2'
                                            : r.level === 'warn' ? '#fffbeb' : '#f0fdf4',
                                    }}
                                >
                                    <span style={{ fontSize: '14px', lineHeight: '1.4', flexShrink: 0 }}>{r.icon}</span>
                                    <Typography variant="body2" sx={{ lineHeight: 1.4 }}>{r.text}</Typography>
                                </Box>
                            ))}
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            {/* 시스템 상태 개요 */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                    <StatusCard
                        title="전체 시스템"
                        status={systemStatus.overall}
                        icon={<DashboardIcon />}
                        description="모든 모듈이 정상 작동 중"
                    />
                </Box>
                <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                    <StatusCard
                        title="성능 최적화"
                        status={systemStatus.performance}
                        icon={<SpeedIcon />}
                        description="실시간 성능 모니터링"
                    />
                </Box>
                <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                    <StatusCard
                        title="AI 엔진"
                        status={systemStatus.ai}
                        icon={<PsychologyIcon />}
                        description="AI 모델 관리 시스템"
                    />
                </Box>
                <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                    <StatusCard
                        title="보안 모니터링"
                        status={systemStatus.security}
                        icon={<SecurityIcon />}
                        description="실시간 보안 스캔"
                    />
                </Box>
            </Box>

            {/* 실시간 메트릭 */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" component="h2" fontWeight="bold">
                    실시간 시스템 메트릭
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {hiddenCards.size > 0 && (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {hiddenCards.size}개 숨김
                        </Typography>
                    )}
                    <Tooltip title="카드 표시/숨김 설정">
                        <IconButton size="small" onClick={() => setCardCustomizeOpen(v => !v)} aria-label="메트릭 카드 커스터마이징" aria-expanded={cardCustomizeOpen}>
                            ⚙️
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
            {/* 카드 커스터마이징 패널 */}
            {cardCustomizeOpen && (
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, background: 'var(--bg-secondary, rgba(0,0,0,0.03))' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, mr: 1, color: 'text.secondary' }}>표시 카드:</Typography>
                    {ALL_METRIC_CARD_IDS.map(id => (
                        <Box
                            key={id}
                            component="button"
                            type="button"
                            onClick={() => toggleCardVisibility(id)}
                            aria-pressed={!hiddenCards.has(id)}
                            sx={{
                                px: 1.5, py: 0.5, borderRadius: 2, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                border: '1px solid', transition: 'all 0.15s',
                                borderColor: hiddenCards.has(id) ? 'divider' : 'primary.main',
                                background: hiddenCards.has(id) ? 'transparent' : 'rgba(99,102,241,0.1)',
                                color: hiddenCards.has(id) ? 'text.secondary' : 'primary.main',
                                textDecoration: hiddenCards.has(id) ? 'line-through' : 'none',
                            }}
                        >
                            {METRIC_CARD_LABELS[id]}
                        </Box>
                    ))}
                    <Typography variant="caption" sx={{ ml: 'auto', color: 'text.disabled' }}>클릭하여 토글</Typography>
                </Box>
            )}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                {!hiddenCards.has('cpu') && (
                <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                    <MetricCard
                        title="CPU 사용률"
                        value={metrics.cpu}
                        unit="%"
                        icon={<MemoryIcon />}
                        color="primary.main"
                        trendKey="cpu"
                        sparkData={metricsHistory.map((h) => h.cpu)}
                        sparkColor="#6366f1"
                    />
                </Box>
                )}
                {!hiddenCards.has('memory') && (
                <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                    <MetricCard
                        title="메모리 사용률"
                        value={metrics.memory}
                        unit="%"
                        icon={<StorageIcon />}
                        color="secondary.main"
                        trendKey="memory"
                        sparkData={metricsHistory.map((h) => h.memory)}
                        sparkColor="#a855f7"
                    />
                </Box>
                )}
                {!hiddenCards.has('disk') && (
                <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                    <MetricCard
                        title="디스크 사용률"
                        value={metrics.disk}
                        unit="%"
                        icon={<StorageIcon />}
                        color="warning.main"
                        trendKey="disk"
                        sparkData={metricsHistory.map((h) => h.disk)}
                        sparkColor="#f59e0b"
                    />
                </Box>
                )}
                {!hiddenCards.has('network') && (
                <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                    <MetricCard
                        title="네트워크 사용률"
                        value={metrics.network}
                        unit="%"
                        icon={<NetworkIcon />}
                        color="info.main"
                        trendKey="network"
                        sparkData={metricsHistory.map((h) => h.network)}
                        sparkColor="#22d3ee"
                    />
                </Box>
                )}
                {hiddenCards.size === ALL_METRIC_CARD_IDS.length && (
                    <Box sx={{ flex: 1, p: 3, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                        <Typography color="text.secondary" variant="body2">모든 카드가 숨겨져 있습니다. ⚙️ 버튼으로 다시 표시하세요.</Typography>
                    </Box>
                )}
            </Box>

            {/* 성능 지표 */}
            <Typography variant="h5" component="h2" mb={2} fontWeight="bold">
                성능 지표
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" mb={2}>
                                응답 시간
                            </Typography>
                            <Box display="flex" alignItems="center">
                                <Typography
                                    variant="h3"
                                    color={metrics.responseTime > thresholds.responseTimeError ? 'error.main' : metrics.responseTime > thresholds.responseTimeWarning ? 'warning.main' : 'primary.main'}
                                    mr={2}
                                >
                                    {metrics.responseTime.toFixed(0)}ms
                                </Typography>
                                {metrics.responseTime > thresholds.responseTimeError
                                    ? <ErrorIcon color="error" />
                                    : metrics.responseTime > thresholds.responseTimeWarning
                                        ? <WarningIcon color="warning" />
                                        : <TrendingUpIcon color="success" />}
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                {metrics.responseTime === 0 && !backendConnected
                                    ? '백엔드 미연결 — 응답 시간 미측정'
                                    : metrics.responseTime > thresholds.responseTimeError
                                        ? '응답 시간이 지연되고 있습니다'
                                        : metrics.responseTime > thresholds.responseTimeWarning
                                            ? '응답 시간이 다소 높습니다'
                                            : '평균 응답 시간이 우수한 수준입니다'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" mb={2}>
                                오류율
                            </Typography>
                            <Box display="flex" alignItems="center">
                                <Typography variant="h3" color={metrics.errorRate > 1 ? 'error.main' : 'success.main'} mr={2}>
                                    {metrics.errorRate.toFixed(2)}%
                                </Typography>
                                {metrics.errorRate > 1 ? <ErrorIcon color="error" /> : <CheckCircleIcon color="success" />}
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                {metrics.errorRate > 1 ? '오류율이 높습니다' : '오류율이 안정적입니다'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            {/* 업타임 + localStorage 사용량 카드 */}
            <Typography variant="h5" component="h2" mb={2} fontWeight="bold">
                세션 정보
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                                <Typography variant="h6">세션 업타임</Typography>
                                <Avatar sx={{ bgcolor: 'success.main', width: 36, height: 36, fontSize: '1rem' }}>⏱</Avatar>
                            </Box>
                            <Typography variant="h4" color="success.main" fontWeight="bold">
                                {formatUptime(uptimeSeconds)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mt={0.5}>
                                페이지 열린 후 경과 시간
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                                <Typography variant="h6">localStorage</Typography>
                                <Avatar sx={{ bgcolor: lsPct > 80 ? 'error.main' : 'info.main', width: 36, height: 36, fontSize: '1rem' }}>💾</Avatar>
                            </Box>
                            <Typography variant="h4" color={lsPct > 80 ? 'error.main' : 'info.main'} fontWeight="bold">
                                {lsKB} KB
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={lsPct}
                                sx={{ mt: 1, height: 6, borderRadius: 3 }}
                                color={lsPct > 80 ? 'error' : lsPct > 60 ? 'warning' : 'primary'}
                            />
                            <Typography variant="body2" color="text.secondary" mt={0.5}>
                                5 MB 중 {lsPct.toFixed(1)}% 사용
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                                <Typography variant="h6">저장된 데이터</Typography>
                                <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36, fontSize: '1rem' }}>📦</Avatar>
                            </Box>
                            <Typography variant="h4" color="secondary.main" fontWeight="bold">
                                {localStorage.length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mt={0.5}>
                                localStorage 항목 수
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            {/* ── 임계값 커스터마이즈 인라인 패널 ── */}
            <Box mb={3}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="h6" fontWeight="bold">⚙️ 알림 임계값 설정</Typography>
                    <Box>
                        {thresholdPanelOpen && (
                            <Chip
                                label="기본값 복원"
                                size="small"
                                variant="outlined"
                                sx={{ mr: 1, cursor: 'pointer', fontSize: 11 }}
                                onClick={() => setThresholds(DEFAULT_THRESHOLDS)}
                            />
                        )}
                        <Chip
                            label={thresholdPanelOpen ? '접기 ▲' : '펼치기 ▼'}
                            size="small"
                            color="primary"
                            sx={{ cursor: 'pointer', fontSize: 11 }}
                            onClick={() => setThresholdPanelOpen((v) => !v)}
                        />
                    </Box>
                </Box>

                {/* 현재 임계값 요약 뱃지 */}
                <Box display="flex" flexWrap="wrap" gap={1} mb={thresholdPanelOpen ? 2 : 0}>
                    {[
                        { label: `CPU 경고 ${thresholds.cpuWarning}%`, color: '#f59e0b' },
                        { label: `CPU 위험 ${thresholds.cpuError}%`, color: '#ef4444' },
                        { label: `메모리 경고 ${thresholds.memoryWarning}%`, color: '#f59e0b' },
                        { label: `메모리 위험 ${thresholds.memoryError}%`, color: '#ef4444' },
                        { label: `디스크 경고 ${thresholds.diskWarning}%`, color: '#f59e0b' },
                        { label: `디스크 위험 ${thresholds.diskError}%`, color: '#ef4444' },
                        { label: `응답 경고 ${thresholds.responseTimeWarning}ms`, color: '#f59e0b' },
                        { label: `응답 위험 ${thresholds.responseTimeError}ms`, color: '#ef4444' },
                    ].map((b) => (
                        <Chip key={b.label} label={b.label} size="small" sx={{ bgcolor: b.color + '20', color: b.color, border: `1px solid ${b.color}40`, fontSize: 11 }} />
                    ))}
                </Box>

                {thresholdPanelOpen && (
                    <Card sx={{ p: 2 }}>
                        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }} gap={3}>
                            {/* CPU */}
                            <Box>
                                <Typography variant="body2" fontWeight="bold" mb={1} color="warning.main">🖥 CPU</Typography>
                                <Typography variant="caption">경고: <strong>{thresholds.cpuWarning}%</strong></Typography>
                                <Slider value={thresholds.cpuWarning} min={40} max={thresholds.cpuError - 1} step={5} size="small" color="warning"
                                    onChange={(_, v) => setThresholds((p) => ({ ...p, cpuWarning: v as number }))} aria-label="CPU 경고" />
                                <Typography variant="caption">위험: <strong>{thresholds.cpuError}%</strong></Typography>
                                <Slider value={thresholds.cpuError} min={thresholds.cpuWarning + 1} max={100} step={5} size="small" color="error"
                                    onChange={(_, v) => setThresholds((p) => ({ ...p, cpuError: v as number }))} aria-label="CPU 위험" />
                            </Box>
                            {/* 메모리 */}
                            <Box>
                                <Typography variant="body2" fontWeight="bold" mb={1} color="warning.main">💾 메모리</Typography>
                                <Typography variant="caption">경고: <strong>{thresholds.memoryWarning}%</strong></Typography>
                                <Slider value={thresholds.memoryWarning} min={40} max={thresholds.memoryError - 1} step={5} size="small" color="warning"
                                    onChange={(_, v) => setThresholds((p) => ({ ...p, memoryWarning: v as number }))} aria-label="메모리 경고" />
                                <Typography variant="caption">위험: <strong>{thresholds.memoryError}%</strong></Typography>
                                <Slider value={thresholds.memoryError} min={thresholds.memoryWarning + 1} max={100} step={5} size="small" color="error"
                                    onChange={(_, v) => setThresholds((p) => ({ ...p, memoryError: v as number }))} aria-label="메모리 위험" />
                            </Box>
                            {/* 디스크 */}
                            <Box>
                                <Typography variant="body2" fontWeight="bold" mb={1} color="warning.main">💿 디스크</Typography>
                                <Typography variant="caption">경고: <strong>{thresholds.diskWarning}%</strong></Typography>
                                <Slider value={thresholds.diskWarning} min={40} max={thresholds.diskError - 1} step={5} size="small" color="warning"
                                    onChange={(_, v) => setThresholds((p) => ({ ...p, diskWarning: v as number }))} aria-label="디스크 경고" />
                                <Typography variant="caption">위험: <strong>{thresholds.diskError}%</strong></Typography>
                                <Slider value={thresholds.diskError} min={thresholds.diskWarning + 1} max={100} step={5} size="small" color="error"
                                    onChange={(_, v) => setThresholds((p) => ({ ...p, diskError: v as number }))} aria-label="디스크 위험" />
                            </Box>
                            {/* 응답시간 */}
                            <Box>
                                <Typography variant="body2" fontWeight="bold" mb={1} color="warning.main">⚡ 응답시간</Typography>
                                <Typography variant="caption">경고: <strong>{thresholds.responseTimeWarning}ms</strong></Typography>
                                <Slider value={thresholds.responseTimeWarning} min={50} max={thresholds.responseTimeError - 10} step={10} size="small" color="warning"
                                    onChange={(_, v) => setThresholds((p) => ({ ...p, responseTimeWarning: v as number }))} aria-label="응답시간 경고" />
                                <Typography variant="caption">위험: <strong>{thresholds.responseTimeError}ms</strong></Typography>
                                <Slider value={thresholds.responseTimeError} min={thresholds.responseTimeWarning + 10} max={2000} step={50} size="small" color="error"
                                    onChange={(_, v) => setThresholds((p) => ({ ...p, responseTimeError: v as number }))} aria-label="응답시간 위험" />
                            </Box>
                        </Box>
                    </Card>
                )}
            </Box>

            {/* ── 빠른 조치 패널 ── */}
            <Typography variant="h5" component="h2" mb={2} fontWeight="bold">
                🛠 빠른 조치
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                {/* 메트릭 CSV 내보내기 */}
                <Tooltip title={metricsHistory.length === 0 ? '수집된 데이터 없음' : '현재까지 수집된 메트릭을 CSV로 저장합니다'}>
                    <span>
                        <Button
                            variant="outlined"
                            startIcon={<FileDownloadIcon />}
                            disabled={metricsHistory.length === 0}
                            onClick={exportMetricsCSV}
                            sx={{ textTransform: 'none', borderRadius: 2 }}
                        >
                            메트릭 CSV 내보내기
                        </Button>
                    </span>
                </Tooltip>
                {/* localStorage 요약 JSON 내보내기 */}
                <Tooltip title="현재 localStorage 키 목록과 크기를 JSON으로 내려받습니다">
                    <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<FileDownloadIcon />}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                        onClick={() => {
                            try {
                                const snapshot: Record<string, { bytes: number }> = {};
                                for (let i = 0; i < localStorage.length; i++) {
                                    const k = localStorage.key(i) ?? '';
                                    snapshot[k] = { bytes: (localStorage.getItem(k) ?? '').length * 2 };
                                }
                                const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url; a.download = `ls-snapshot-${Date.now()}.json`; a.click();
                                URL.revokeObjectURL(url);
                            } catch { /* ignore */ }
                        }}
                    >
                        localStorage 스냅샷
                    </Button>
                </Tooltip>
                {/* 오래된 대화 정리 */}
                <Tooltip title="30일 이상 된 대화 데이터를 localStorage에서 삭제합니다">
                    <Button
                        variant="outlined"
                        color="warning"
                        startIcon={<DeleteSweepIcon />}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                        onClick={() => {
                            try {
                                const key = 'chatgpt_conversations';
                                const convs: { createdAt?: string }[] = JSON.parse(localStorage.getItem(key) ?? '[]');
                                const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
                                const kept = convs.filter((c) => {
                                    try { return new Date(c.createdAt ?? '').getTime() > cutoff; } catch { return true; }
                                });
                                localStorage.setItem(key, JSON.stringify(kept));
                                const removed = convs.length - kept.length;
                                notificationService.addNotification({
                                    type: 'success',
                                    title: '대화 정리 완료',
                                    message: `${removed}개의 오래된 대화가 삭제되었습니다.`,
                                    priority: 'low',
                                    category: 'system',
                                });
                            } catch { /* ignore */ }
                        }}
                    >
                        오래된 대화 정리
                    </Button>
                </Tooltip>
                {/* 데이터 새로고침 */}
                <Tooltip title="모든 메트릭을 즉시 다시 수집합니다">
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<RefreshIcon />}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                        onClick={() => fetchDataRef.current?.()}
                    >
                        메트릭 새로고침
                    </Button>
                </Tooltip>
                {/* 시스템 진단 보고서 다운로드 */}
                <Tooltip title="현재 시스템 상태를 Markdown 보고서로 저장합니다">
                    <Button
                        variant="outlined"
                        color="info"
                        startIcon={<FileDownloadIcon />}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                        onClick={() => {
                            const now = new Date().toLocaleString('ko-KR');
                            const lines: string[] = [
                                `# 시스템 진단 보고서`,
                                `> 생성 시각: ${now}`,
                                '',
                                `## 헬스 스코어: ${healthScore}점 (${healthLabel})`,
                                '',
                                `## 현재 메트릭`,
                                `| 항목 | 값 |`,
                                `|---|---|`,
                                `| CPU | ${metrics.cpu.toFixed(1)}% |`,
                                `| 메모리 | ${metrics.memory.toFixed(1)}% |`,
                                `| 디스크 | ${metrics.disk.toFixed(1)}% |`,
                                `| 네트워크 | ${metrics.network.toFixed(1)}% |`,
                                `| 응답 시간 | ${metrics.responseTime.toFixed(0)}ms |`,
                                `| 오류율 | ${metrics.errorRate.toFixed(2)}% |`,
                                '',
                                `## 권장사항`,
                                ...recommendations.map((r) => `- ${r.icon} ${r.text}`),
                                '',
                                `## 시스템 상태`,
                                `| 모듈 | 상태 |`,
                                `|---|---|`,
                                `| 전체 | ${systemStatus.overall} |`,
                                `| 성능 | ${systemStatus.performance} |`,
                                `| AI 엔진 | ${systemStatus.ai} |`,
                                `| 보안 | ${systemStatus.security} |`,
                                '',
                                `## 세션 정보`,
                                `- 업타임: ${formatUptime(uptimeSeconds)}`,
                                `- localStorage: ${lsKB} KB (${lsPct.toFixed(1)}% 사용)`,
                                `- 저장 항목 수: ${localStorage.length}건`,
                                '',
                                `---`,
                                `*CORBU.AI 자동 생성 보고서*`,
                            ];
                            const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `corbu-diagnostics-${new Date().toISOString().slice(0, 16).replace('T', '-')}.md`;
                            a.click();
                            URL.revokeObjectURL(url);
                        }}
                    >
                        진단 보고서 (.md)
                    </Button>
                </Tooltip>
            </Box>

            {/* 메트릭 이력 차트 */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" component="h2" fontWeight="bold">
                    시스템 이력 추이
                </Typography>
                <Tooltip title={metricsHistory.length === 0 ? '수집된 데이터 없음' : 'CSV로 내보내기'}>
                    <span>
                        <Button
                            size="small"
                            variant="outlined"
                            color="inherit"
                            startIcon={<FileDownloadIcon />}
                            onClick={exportMetricsCSV}
                            disabled={metricsHistory.length === 0}
                            sx={{ fontSize: 12, textTransform: 'none' }}
                        >
                            CSV 내보내기
                        </Button>
                    </span>
                </Tooltip>
            </Box>
            <Paper sx={{ p: 2, mb: 3 }}>
                {metricsHistory.length < 2 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            {loading ? '데이터 수집 중…' : '데이터가 2회 이상 수집되면 차트가 표시됩니다.'}
                        </Typography>
                    </Box>
                ) : (
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={metricsHistory} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-overlay, #e0e0e0)" />
                            <XAxis
                                dataKey="time"
                                tick={{ fontSize: 11, fill: 'var(--text-secondary, #888)' }}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                yAxisId="pct"
                                domain={[0, 100]}
                                unit="%"
                                tick={{ fontSize: 11, fill: 'var(--text-secondary, #888)' }}
                                width={38}
                            />
                            <YAxis
                                yAxisId="ms"
                                orientation="right"
                                unit="ms"
                                tick={{ fontSize: 11, fill: 'var(--text-secondary, #888)' }}
                                width={48}
                            />
                            <RechartsTooltip
                                contentStyle={{
                                    backgroundColor: 'var(--surface-overlay, #fff)',
                                    border: '1px solid var(--border-overlay, #e0e0e0)',
                                    borderRadius: 6,
                                    fontSize: 12,
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Line yAxisId="pct" type="monotone" dataKey="cpu" stroke="#1976d2" name="CPU %" dot={false} strokeWidth={2} />
                            <Line yAxisId="pct" type="monotone" dataKey="memory" stroke="#9c27b0" name="메모리 %" dot={false} strokeWidth={2} />
                            <Line yAxisId="pct" type="monotone" dataKey="disk" stroke="#2e7d32" name="디스크 %" dot={false} strokeWidth={2} strokeDasharray="4 2" />
                            <Line yAxisId="pct" type="monotone" dataKey="network" stroke="#0288d1" name="네트워크 %" dot={false} strokeWidth={2} strokeDasharray="2 3" />
                            <Line yAxisId="ms" type="monotone" dataKey="responseTime" stroke="#ed6c02" name="응답(ms)" dot={false} strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </Paper>

            {/* 예측 위젯 */}
            {metricPredictions && (
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <TrendingUpIcon fontSize="small" color="primary" />
                        <Typography variant="subtitle2" fontWeight={700}>
                            📈 다음 주기 예측 <Typography component="span" variant="caption" color="text.secondary">(최근 {metricPredictions.sampleCount}회 선형 회귀)</Typography>
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 1.5 }}>
                        {[
                            { label: 'CPU', value: metricPredictions.cpu, unit: '%', warn: thresholds.cpuWarning, error: thresholds.cpuError },
                            { label: '메모리', value: metricPredictions.memory, unit: '%', warn: thresholds.memoryWarning, error: thresholds.memoryError },
                            { label: '디스크', value: metricPredictions.disk, unit: '%', warn: 80, error: 95 },
                            { label: '응답시간', value: metricPredictions.responseTime, unit: 'ms', warn: thresholds.responseTimeWarning, error: thresholds.responseTimeError },
                        ].map(({ label, value, unit, warn, error }) => {
                            const isError = value >= error;
                            const isWarn = !isError && value >= warn;
                            const color = isError ? '#ef4444' : isWarn ? '#f59e0b' : '#10b981';
                            const bg = isError ? 'rgba(239,68,68,0.07)' : isWarn ? 'rgba(245,158,11,0.07)' : 'rgba(16,185,129,0.07)';
                            const badge = isError ? '🔴 위험' : isWarn ? '🟡 경고' : '🟢 정상';
                            return (
                                <Box key={label} sx={{ background: bg, borderRadius: 2, p: 1.5, textAlign: 'center', border: `1px solid ${color}22` }}>
                                    <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
                                    <Typography variant="h6" fontWeight={700} sx={{ color, lineHeight: 1.3 }}>
                                        {value}{unit}
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontSize: 10, opacity: 0.7 }}>{badge}</Typography>
                                </Box>
                            );
                        })}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontSize: 10 }}>
                        * 현재 추세를 기반으로 한 추정치입니다. 실제 값과 다를 수 있습니다.
                    </Typography>
                </Paper>
            )}

            {/* 백엔드 연결 상태 배너 */}
            {backendConnected === false && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: 'warning.light', display: 'flex', alignItems: 'center', gap: 1 }} role="alert">
                    <WarningIcon color="warning" fontSize="small" />
                    <Typography variant="body2" color="warning.dark">
                        백엔드에 연결할 수 없습니다. 표시된 수치는 실제 값이 아닐 수 있습니다.
                    </Typography>
                </Paper>
            )}

            {/* 최근 알림 */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" component="h2" fontWeight="bold">
                    최근 알림
                </Typography>
                {alerts.length > 0 && (
                    <Tooltip title="알림 모두 지우기">
                        <Button
                            size="small"
                            variant="outlined"
                            color="inherit"
                            startIcon={<DeleteSweepIcon />}
                            onClick={clearAllAlerts}
                            sx={{ fontSize: 12, textTransform: 'none' }}
                        >
                            모두 지우기
                        </Button>
                    </Tooltip>
                )}
            </Box>
            <Paper sx={{ maxHeight: 320, overflow: 'auto' }}>
                {alerts.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <CheckCircleIcon color="success" sx={{ fontSize: 36, mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                            {loading ? '데이터 수집 중…' : '알림이 없습니다.'}
                        </Typography>
                    </Box>
                ) : (
                    <List disablePadding>
                        {alerts.map((alert, index) => (
                            <React.Fragment key={alert.id}>
                                <ListItem
                                    secondaryAction={
                                        <Tooltip title="알림 닫기">
                                            <IconButton
                                                edge="end"
                                                size="small"
                                                aria-label={`알림 닫기: ${alert.title}`}
                                                onClick={() => dismissAlert(alert.id)}
                                            >
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    }
                                >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        {alert.type === 'success' && <CheckCircleIcon color="success" fontSize="small" />}
                                        {alert.type === 'warning' && <WarningIcon color="warning" fontSize="small" />}
                                        {alert.type === 'error' && <ErrorIcon color="error" fontSize="small" />}
                                        {alert.type === 'info' && <InfoIcon color="info" fontSize="small" />}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography variant="body2" fontWeight="medium">
                                                {alert.title}
                                            </Typography>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">{alert.message}</Typography>
                                                <Typography variant="caption" color="text.disabled">
                                                    {new Date(alert.timestamp).toLocaleString()}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                                {index < alerts.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Paper>

            {/* 플로팅 액션 버튼 — 메모리 최적화 */}
            <Tooltip title={optimizing ? '최적화 중…' : '메모리 최적화 실행'} placement="left">
                <span>
                    <Fab
                        color="primary"
                        aria-label="메모리 최적화 실행"
                        disabled={optimizing}
                        sx={{ position: 'fixed', bottom: 16, right: 16 }}
                        onClick={async () => {
                            setOptimizing(true);
                            try {
                                await performanceApi.runOptimization('memory', 'auto');
                                notificationService.performance('메모리 최적화 완료', '메모리 최적화가 성공적으로 실행되었습니다.');
                            } catch {
                                notificationService.error('최적화 실패', '메모리 최적화 실행 중 오류가 발생했습니다.');
                            } finally {
                                setOptimizing(false);
                            }
                        }}
                    >
                        <SpeedIcon />
                    </Fab>
                </span>
            </Tooltip>

            {/* 설정 다이얼로그 */}
            <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>대시보드 설정</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="refresh-interval-label">실시간 업데이트 간격</InputLabel>
                            <Select
                                labelId="refresh-interval-label"
                                value={refreshInterval}
                                label="실시간 업데이트 간격"
                                disabled={!autoRefreshEnabled}
                                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                            >
                                <MenuItem value={5}>5초</MenuItem>
                                <MenuItem value={10}>10초</MenuItem>
                                <MenuItem value={30}>30초</MenuItem>
                                <MenuItem value={60}>1분</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={autoRefreshEnabled}
                                    onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label="자동 새로고침"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={notificationsEnabled}
                                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label="알림 표시"
                        />
                        <Divider />
                        <Typography variant="subtitle2" fontWeight="bold">
                            알림 임계값
                        </Typography>
                        <Box>
                            <Typography variant="body2" gutterBottom>
                                CPU 경고 임계값: <strong>{thresholds.cpuWarning}%</strong>
                            </Typography>
                            <Slider
                                value={thresholds.cpuWarning}
                                min={50}
                                max={thresholds.cpuError - 1}
                                step={5}
                                size="small"
                                onChange={(_, v) => setThresholds(prev => ({ ...prev, cpuWarning: v as number }))}
                                aria-label="CPU 경고 임계값"
                            />
                            <Typography variant="body2" gutterBottom>
                                CPU 위험 임계값: <strong>{thresholds.cpuError}%</strong>
                            </Typography>
                            <Slider
                                value={thresholds.cpuError}
                                min={thresholds.cpuWarning + 1}
                                max={100}
                                step={5}
                                size="small"
                                onChange={(_, v) => setThresholds(prev => ({ ...prev, cpuError: v as number }))}
                                aria-label="CPU 위험 임계값"
                            />
                        </Box>
                        <Box>
                            <Typography variant="body2" gutterBottom>
                                메모리 경고 임계값: <strong>{thresholds.memoryWarning}%</strong>
                            </Typography>
                            <Slider
                                value={thresholds.memoryWarning}
                                min={50}
                                max={thresholds.memoryError - 1}
                                step={5}
                                size="small"
                                onChange={(_, v) => setThresholds(prev => ({ ...prev, memoryWarning: v as number }))}
                                aria-label="메모리 경고 임계값"
                            />
                            <Typography variant="body2" gutterBottom>
                                메모리 위험 임계값: <strong>{thresholds.memoryError}%</strong>
                            </Typography>
                            <Slider
                                value={thresholds.memoryError}
                                min={thresholds.memoryWarning + 1}
                                max={100}
                                step={5}
                                size="small"
                                onChange={(_, v) => setThresholds(prev => ({ ...prev, memoryError: v as number }))}
                                aria-label="메모리 위험 임계값"
                            />
                        </Box>
                        <Box>
                            <Typography variant="body2" gutterBottom>
                                응답시간 경고 임계값: <strong>{thresholds.responseTimeWarning}ms</strong>
                            </Typography>
                            <Slider
                                value={thresholds.responseTimeWarning}
                                min={50}
                                max={thresholds.responseTimeError - 50}
                                step={50}
                                size="small"
                                onChange={(_, v) => setThresholds(prev => ({ ...prev, responseTimeWarning: v as number }))}
                                aria-label="응답시간 경고 임계값"
                            />
                            <Typography variant="body2" gutterBottom>
                                응답시간 위험 임계값: <strong>{thresholds.responseTimeError}ms</strong>
                            </Typography>
                            <Slider
                                value={thresholds.responseTimeError}
                                min={thresholds.responseTimeWarning + 50}
                                max={2000}
                                step={50}
                                size="small"
                                onChange={(_, v) => setThresholds(prev => ({ ...prev, responseTimeError: v as number }))}
                                aria-label="응답시간 위험 임계값"
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSettingsOpen(false)} aria-label="설정 다이얼로그 닫기">닫기</Button>
                </DialogActions>
            </Dialog>

            {/* ── 실시간 알림 로그 패널 ── */}
            <Typography variant="h5" component="h2" mb={2} fontWeight="bold" mt={2}>
                📋 실시간 이벤트 로그
            </Typography>
            <Paper sx={{ p: 0, mb: 3, maxHeight: 340, overflowY: 'auto', border: '1px solid var(--border-overlay, #e0e0e0)' }}>
                {alertLog.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">아직 기록된 이벤트가 없습니다. 메트릭 수집 시 자동으로 로그가 생성됩니다.</Typography>
                    </Box>
                ) : (
                    <List dense disablePadding>
                        {alertLog.map((entry, idx) => {
                            const icon = entry.level === 'error' ? <ErrorIcon fontSize="small" color="error" />
                                : entry.level === 'warn' ? <WarningIcon fontSize="small" color="warning" />
                                : entry.level === 'success' ? <CheckCircleIcon fontSize="small" color="success" />
                                : <InfoIcon fontSize="small" color="info" />;
                            const bgColor = entry.level === 'error' ? 'rgba(239,68,68,0.06)'
                                : entry.level === 'warn' ? 'rgba(245,158,11,0.06)'
                                : entry.level === 'success' ? 'rgba(34,197,94,0.06)'
                                : 'transparent';
                            return (
                                <React.Fragment key={entry.id}>
                                    <ListItem sx={{ py: 0.6, px: 2, backgroundColor: bgColor, alignItems: 'flex-start' }}>
                                        <ListItemIcon sx={{ minWidth: 32, mt: 0.4 }}>{icon}</ListItemIcon>
                                        <ListItemText
                                            primary={<Typography variant="body2" sx={{ fontSize: 13, lineHeight: 1.4 }}>{entry.message}</Typography>}
                                            secondary={<Typography variant="caption" color="text.secondary">{entry.time}</Typography>}
                                        />
                                    </ListItem>
                                    {idx < alertLog.length - 1 && <Divider />}
                                </React.Fragment>
                            );
                        })}
                    </List>
                )}
            </Paper>
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    sx={{ textTransform: 'none', fontSize: 12 }}
                    onClick={() => { setAlertLog([]); localStorage.removeItem('corbu.dash.alertLog'); }}
                    disabled={alertLog.length === 0}
                >
                    로그 지우기
                </Button>
                <Button
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: 'none', fontSize: 12 }}
                    onClick={() => {
                        pushLog('info', '사용자가 수동으로 로그 테스트를 실행했습니다.');
                        pushLog('success', '테스트 성공 이벤트');
                        pushLog('warn', '테스트 경고 이벤트');
                    }}
                >
                    테스트 로그 추가
                </Button>
            </Box>

            {/* 로딩 상태 */}
            {loading && (
                <Box position="fixed" top={0} left={0} right={0}>
                    <LinearProgress />
                </Box>
            )}
        </Box>
    );
};

export default IntegratedDashboard;
