import React, { useState, useEffect } from 'react';
import './AIPerformanceMonitor.css';
import { getHealthStyle, getModelStatusStyle, getAlertTypeStyle, getSeverityBadgeStyle } from '../../styles/themeColors';
import {
    Activity,
    TrendingUp,
    TrendingDown,
    Computer as Cpu,
    HardDrive,
    Clock,
    Zap,
    AlertTriangle,
    CheckCircle,
    XCircle,
    RefreshCw,
    BarChart,
    Server
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PerformanceMetrics {
    cpu: {
        usage: number;
        temperature: number;
        cores: number;
        load: number[];
    };
    memory: {
        total: number;
        used: number;
        available: number;
        swap: number;
    };
    responseTime: {
        average: number;
        p95: number;
        p99: number;
        trend: 'improving' | 'stable' | 'declining';
    };
    throughput: {
        requestsPerSecond: number;
        totalRequests: number;
        successRate: number;
        errorRate: number;
    };
    aiModels: {
        active: number;
        total: number;
        accuracy: number;
        latency: number;
    };
    system: {
        uptime: number;
        health: 'excellent' | 'good' | 'warning' | 'critical';
        lastUpdate: Date;
    };
}

interface AIModel {
    id: string;
    name: string;
    type: 'gpt-4' | 'gpt-3.5' | 'claude' | 'gemini' | 'custom';
    status: 'active' | 'inactive' | 'training' | 'error';
    accuracy: number;
    latency: number;
    requests: number;
    errors: number;
    lastUsed: Date;
}

interface PerformanceAlert {
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    title: string;
    message: string;
    timestamp: Date;
    severity: 'low' | 'medium' | 'high' | 'critical';
    resolved: boolean;
}

interface AIPerformanceMonitorProps {
    onOptimize?: () => void;
    onAlert?: (alert: PerformanceAlert) => void;
    onModelUpdate?: (modelId: string, updates: Partial<AIModel>) => void;
}

const AIPerformanceMonitor: React.FC<AIPerformanceMonitorProps> = ({
    onOptimize,
    onAlert: _onAlert,
    onModelUpdate: _onModelUpdate
}) => {
    void _onAlert; // Reserved for alert handling
    void _onModelUpdate; // Reserved for model updates
    const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'alerts' | 'optimization'>('overview');
    const [isLoading, setIsLoading] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);

    // 성능 메트릭 시뮬레이션
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        cpu: {
            usage: 65,
            temperature: 72,
            cores: 8,
            load: [0.6, 0.7, 0.5, 0.8, 0.6, 0.9, 0.7, 0.5]
        },
        memory: {
            total: 16384,
            used: 8192,
            available: 8192,
            swap: 2048
        },
        responseTime: {
            average: 1200,
            p95: 2500,
            p99: 3500,
            trend: 'stable'
        },
        throughput: {
            requestsPerSecond: 150,
            totalRequests: 1250000,
            successRate: 98.5,
            errorRate: 1.5
        },
        aiModels: {
            active: 4,
            total: 6,
            accuracy: 94.2,
            latency: 850
        },
        system: {
            uptime: 86400,
            health: 'good',
            lastUpdate: new Date()
        }
    });

    const [aiModels, _setAiModels] = useState<AIModel[]>([
        {
            id: '1',
            name: 'GPT-4 Turbo',
            type: 'gpt-4',
            status: 'active',
            accuracy: 96.8,
            latency: 1200,
            requests: 45000,
            errors: 23,
            lastUsed: new Date()
        },
        {
            id: '2',
            name: 'Claude-3 Sonnet',
            type: 'claude',
            status: 'active',
            accuracy: 95.2,
            latency: 980,
            requests: 32000,
            errors: 15,
            lastUsed: new Date(Date.now() - 5 * 60 * 1000)
        },
        {
            id: '3',
            name: 'Gemini Pro',
            type: 'gemini',
            status: 'active',
            accuracy: 93.5,
            latency: 750,
            requests: 28000,
            errors: 42,
            lastUsed: new Date(Date.now() - 10 * 60 * 1000)
        },
        {
            id: '4',
            name: 'Custom Model v2.1',
            type: 'custom',
            status: 'training',
            accuracy: 91.8,
            latency: 650,
            requests: 15000,
            errors: 8,
            lastUsed: new Date(Date.now() - 30 * 60 * 1000)
        }
    ]);

    const [alerts, _setAlerts] = useState<PerformanceAlert[]>([
        {
            id: '1',
            type: 'warning',
            title: '높은 CPU 사용률',
            message: 'CPU 사용률이 80%를 초과했습니다. 성능 최적화를 고려해보세요.',
            timestamp: new Date(Date.now() - 10 * 60 * 1000),
            severity: 'medium',
            resolved: false
        },
        {
            id: '2',
            type: 'info',
            title: '모델 업데이트 완료',
            message: 'Custom Model v2.1이 성공적으로 업데이트되었습니다.',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            severity: 'low',
            resolved: true
        },
        {
            id: '3',
            type: 'error',
            title: '응답 시간 증가',
            message: '평균 응답 시간이 2초를 초과했습니다. 시스템 부하를 확인해주세요.',
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            severity: 'high',
            resolved: false
        }
    ]);

    // 자동 새로고침
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            refreshMetrics();
        }, 5000);

        return () => clearInterval(interval);
    }, [autoRefresh]);

    const refreshMetrics = () => {
        setIsLoading(true);
        setTimeout(() => {
            // 메트릭 업데이트 시뮬레이션
            setMetrics(prev => ({
                ...prev,
                cpu: {
                    ...prev.cpu,
                    usage: Math.random() * 30 + 50,
                    temperature: Math.random() * 20 + 65
                },
                responseTime: {
                    ...prev.responseTime,
                    average: Math.random() * 500 + 1000
                },
                system: {
                    ...prev.system,
                    lastUpdate: new Date()
                }
            }));
            setIsLoading(false);
        }, 1000);
    };

    const getHealthIcon = (health: string) => {
        switch (health) {
            case 'excellent': return <CheckCircle className="h-4 w-4" />;
            case 'good': return <CheckCircle className="h-4 w-4" />;
            case 'warning': return <AlertTriangle className="h-4 w-4" />;
            case 'critical': return <XCircle className="h-4 w-4" />;
            default: return <Activity className="h-4 w-4" />;
        }
    };

    const getTrendIcon = (trend: string) => {
        const s = trend === 'improving' ? 'var(--accent-success)' : trend === 'declining' ? 'var(--accent-error)' : 'var(--accent-warning)';
        if (trend === 'improving') return <TrendingUp className="h-4 w-4" style={{ color: s }} aria-hidden />;
        if (trend === 'declining') return <TrendingDown className="h-4 w-4" style={{ color: s }} aria-hidden />;
        return <Activity className="h-4 w-4" style={{ color: s }} aria-hidden />;
    };

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${days}일 ${hours}시간 ${minutes}분`;
    };

    const formatBytes = (bytes: number) => {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    const tabs = [
        { id: 'overview', name: '개요', icon: BarChart },
        { id: 'models', name: 'AI 모델', icon: Cpu },
        { id: 'alerts', name: '알림', icon: AlertTriangle },
        { id: 'optimization', name: '최적화', icon: Zap }
    ] as const;

    return (
        <div className="apm-root" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            {/* 헤더 */}
            <div className="apm-header">
                <div>
                    <h2 className="apm-title">AI 성능 모니터링</h2>
                    <p className="apm-desc">시스템 성능 및 AI 모델 상태를 실시간으로 모니터링하세요</p>
                </div>
                <div className="apm-actions">
                    <button type="button" onClick={() => setAutoRefresh(!autoRefresh)} className={`apm-btn-auto ${autoRefresh ? 'on' : 'off'}`}>
                        <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} aria-hidden />
                        <span>{autoRefresh ? '자동 새로고침' : '수동 새로고침'}</span>
                    </button>
                    <button type="button" onClick={refreshMetrics} disabled={isLoading} className="bw-btn-primary">
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} aria-hidden />
                        <span>새로고침</span>
                    </button>
                </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="apm-tabs">
                <nav style={{ display: 'flex', gap: 'var(--spacing-xl)' }}>
                    {tabs.map((tab) => {
                        const IconComponent = tab.icon;
                        return (
                            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`apm-tab ${activeTab === tab.id ? 'active' : ''}`}>
                                <IconComponent className="h-4 w-4" aria-hidden />
                                <span>{tab.name}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* 탭 내용 */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        {/* 시스템 상태 카드 */}
                        <div className="apm-grid-4">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="apm-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <p className="apm-label">시스템 상태</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-sm)' }}>
                                            {getHealthIcon(metrics.system.health)}
                                            <span className="apm-badge" style={getHealthStyle(metrics.system.health)}>
                                                {metrics.system.health === 'excellent' ? '우수' : metrics.system.health === 'good' ? '양호' : metrics.system.health === 'warning' ? '경고' : '위험'}
                                            </span>
                                        </div>
                                    </div>
                                    <Server className="h-8 w-8" style={{ color: 'var(--accent-secondary)' }} aria-hidden />
                                </div>
                                <div className="apm-meta" style={{ marginTop: 'var(--spacing-md)' }}>가동시간: {formatUptime(metrics.system.uptime)}</div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="apm-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <p className="apm-label">CPU 사용률</p>
                                        <p className="apm-value">{metrics.cpu.usage.toFixed(1)}%</p>
                                        <p className="apm-meta">{metrics.cpu.temperature}°C</p>
                                    </div>
                                    <Cpu className="h-8 w-8" style={{ color: 'var(--accent-info)' }} aria-hidden />
                                </div>
                                <div style={{ marginTop: 'var(--spacing-md)' }}>
                                    <div className="apm-progress">
                                        <div className="apm-progress-bar" style={{ width: `${metrics.cpu.usage}%`, background: 'var(--accent-info)' }} />
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="apm-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <p className="apm-label">메모리 사용률</p>
                                        <p className="apm-value">{((metrics.memory.used / metrics.memory.total) * 100).toFixed(1)}%</p>
                                        <p className="apm-meta">{formatBytes(metrics.memory.used)} / {formatBytes(metrics.memory.total)}</p>
                                    </div>
                                    <HardDrive className="h-8 w-8" style={{ color: 'var(--accent-success)' }} aria-hidden />
                                </div>
                                <div style={{ marginTop: 'var(--spacing-md)' }}>
                                    <div className="apm-progress">
                                        <div className="apm-progress-bar" style={{ width: `${(metrics.memory.used / metrics.memory.total) * 100}%`, background: 'var(--accent-success)' }} />
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="apm-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <p className="apm-label">응답 시간</p>
                                        <p className="apm-value">{metrics.responseTime.average}ms</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-xs)' }}>
                                            {getTrendIcon(metrics.responseTime.trend)}
                                            <span className="apm-meta">
                                                {metrics.responseTime.trend === 'improving' ? '개선 중' : metrics.responseTime.trend === 'declining' ? '악화 중' : '안정'}
                                            </span>
                                        </div>
                                    </div>
                                    <Clock className="h-8 w-8" style={{ color: 'var(--accent-orange)' }} aria-hidden />
                                </div>
                            </motion.div>
                        </div>

                        {/* 성능 지표 */}
                        <div className="apm-grid-2">
                            <div className="apm-card">
                                <h3 className="apm-card-title" style={{ marginBottom: 'var(--spacing-md)' }}>처리량</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span className="apm-label">초당 요청</span>
                                        <span className="apm-value" style={{ fontSize: 'var(--font-size-base)' }}>{metrics.throughput.requestsPerSecond}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span className="apm-label">총 요청</span>
                                        <span style={{ fontWeight: 500 }}>{metrics.throughput.totalRequests.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span className="apm-label">성공률</span>
                                        <span style={{ fontWeight: 500, color: 'var(--accent-success)' }}>{metrics.throughput.successRate}%</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span className="apm-label">오류률</span>
                                        <span style={{ fontWeight: 500, color: 'var(--accent-error)' }}>{metrics.throughput.errorRate}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="apm-card">
                                <h3 className="apm-card-title" style={{ marginBottom: 'var(--spacing-md)' }}>AI 모델</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span className="apm-label">활성 모델</span>
                                        <span style={{ fontWeight: 500 }}>{metrics.aiModels.active} / {metrics.aiModels.total}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span className="apm-label">평균 정확도</span>
                                        <span style={{ fontWeight: 500, color: 'var(--accent-success)' }}>{metrics.aiModels.accuracy}%</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span className="apm-label">평균 지연시간</span>
                                        <span style={{ fontWeight: 500 }}>{metrics.aiModels.latency}ms</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'models' && (
                    <motion.div key="models" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <div className="apm-card" style={{ padding: 0 }}>
                            <div className="apm-card-header">
                                <h3 className="apm-card-title">AI 모델 상태</h3>
                            </div>
                            <div>
                                {aiModels.map((model) => {
                                    const statusStyle = getModelStatusStyle(model.status);
                                    const iconStyle = { backgroundColor: 'var(--accent-info-muted)', color: 'var(--accent-info)' };
                                    return (
                                        <div key={model.id} className="apm-row">
                                            <div className="apm-row-content">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                                    <div className="apm-icon-wrap" style={iconStyle}>
                                                        <Cpu className="h-5 w-5" aria-hidden />
                                                    </div>
                                                    <div>
                                                        <h4 className="apm-value" style={{ fontSize: 'var(--font-size-base)' }}>{model.name}</h4>
                                                        <p className="apm-label">{model.type}</p>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <p className="apm-label">정확도</p>
                                                        <p style={{ fontWeight: 500, color: 'var(--accent-success)' }}>{model.accuracy}%</p>
                                                    </div>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <p className="apm-label">지연시간</p>
                                                        <p style={{ fontWeight: 500 }}>{model.latency}ms</p>
                                                    </div>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <p className="apm-label">요청</p>
                                                        <p style={{ fontWeight: 500 }}>{model.requests.toLocaleString()}</p>
                                                    </div>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <p className="apm-label">오류</p>
                                                        <p style={{ fontWeight: 500, color: 'var(--accent-error)' }}>{model.errors}</p>
                                                    </div>
                                                    <span className="apm-badge" style={statusStyle}>
                                                        {model.status === 'active' ? '활성' : model.status === 'training' ? '학습 중' : model.status === 'error' ? '오류' : '비활성'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'alerts' && (
                    <motion.div key="alerts" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <div className="apm-card" style={{ padding: 0 }}>
                            <div className="apm-card-header">
                                <h3 className="apm-card-title">성능 알림</h3>
                            </div>
                            <div>
                                {alerts.map((alert) => {
                                    const typeStyle = getAlertTypeStyle(alert.type);
                                    const sevStyle = getSeverityBadgeStyle(alert.severity);
                                    const Icon = alert.type === 'error' ? XCircle : alert.type === 'success' ? CheckCircle : AlertTriangle;
                                    return (
                                        <div key={alert.id} className="apm-row">
                                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-md)' }}>
                                                    <div className="apm-alert-icon" style={typeStyle}>
                                                        <Icon className="h-4 w-4" aria-hidden />
                                                    </div>
                                                    <div>
                                                        <h4 className="apm-value" style={{ fontSize: 'var(--font-size-base)' }}>{alert.title}</h4>
                                                        <p className="apm-label" style={{ marginTop: 'var(--spacing-xs)' }}>{alert.message}</p>
                                                        <p className="apm-meta" style={{ marginTop: 'var(--spacing-sm)' }}>{alert.timestamp.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                                    <span className="apm-badge" style={sevStyle}>
                                                        {alert.severity === 'critical' ? '치명적' : alert.severity === 'high' ? '높음' : alert.severity === 'medium' ? '보통' : '낮음'}
                                                    </span>
                                                    {alert.resolved && (
                                                        <span className="apm-badge" style={{ color: 'var(--accent-success)', backgroundColor: 'var(--accent-success-muted)' }}>해결됨</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'optimization' && (
                    <motion.div key="optimization" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <div className="apm-card">
                            <h3 className="apm-card-title" style={{ marginBottom: 'var(--spacing-md)' }}>성능 최적화</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                <div className="apm-opt-row">
                                    <div>
                                        <h4 className="apm-value" style={{ fontSize: 'var(--font-size-base)' }}>자동 최적화</h4>
                                        <p className="apm-label">시스템 성능을 자동으로 최적화합니다</p>
                                    </div>
                                    <button type="button" onClick={onOptimize} className="bw-btn-primary">최적화 실행</button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--spacing-md)' }}>
                                    <div className="apm-opt-card">
                                        <h4 className="apm-value" style={{ fontSize: 'var(--font-size-base)', marginBottom: 'var(--spacing-sm)' }}>권장 사항</h4>
                                        <ul className="apm-label" style={{ paddingLeft: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                                            <li>• CPU 사용률이 높습니다. 불필요한 프로세스를 종료하세요.</li>
                                            <li>• 메모리 사용률이 정상 범위입니다.</li>
                                            <li>• 응답 시간이 개선되고 있습니다.</li>
                                        </ul>
                                    </div>
                                    <div className="apm-opt-card">
                                        <h4 className="apm-value" style={{ fontSize: 'var(--font-size-base)', marginBottom: 'var(--spacing-sm)' }}>최적화 상태</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span className="apm-label">CPU 최적화</span>
                                                <span style={{ fontWeight: 500, color: 'var(--accent-success)' }}>완료</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span className="apm-label">메모리 최적화</span>
                                                <span style={{ fontWeight: 500, color: 'var(--accent-success)' }}>완료</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span className="apm-label">네트워크 최적화</span>
                                                <span style={{ fontWeight: 500, color: 'var(--accent-warning)' }}>진행 중</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AIPerformanceMonitor;
