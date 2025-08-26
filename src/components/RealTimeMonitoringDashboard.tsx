import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Monitor,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Bell,
    BellOff,
    Settings,
    Play,
    Pause,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    Activity,
    Cpu,
    HardDrive,
    Zap,
    Clock,
    Users,
    Eye,
    EyeOff,
    Volume2,
    VolumeX,
    Mail,
    Smartphone,
    Filter,
    Download,
    Trash2,
    Check,
    X,
    Info,
    AlertCircle,
    Shield,
    Target,
    BarChart3,
    LineChart,
    PieChart
} from 'lucide-react';
import realTimeMonitoringService, { 
    SystemAlert, 
    PerformanceMetric, 
    MonitoringConfig 
} from '../services/realTimeMonitoringService';

interface RealTimeMonitoringDashboardProps {
    onAlertAction?: (alertId: string, action: string) => void;
}

const RealTimeMonitoringDashboard: React.FC<RealTimeMonitoringDashboardProps> = ({
    onAlertAction
}) => {
    const [alerts, setAlerts] = useState<SystemAlert[]>([]);
    const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
    const [config, setConfig] = useState<MonitoringConfig>(realTimeMonitoringService.getConfig());
    const [isMonitoring, setIsMonitoring] = useState(realTimeMonitoringService.isMonitoringActive());
    const [selectedView, setSelectedView] = useState<'overview' | 'alerts' | 'metrics' | 'settings'>('overview');
    const [alertFilter, setAlertFilter] = useState<'all' | 'critical' | 'warning' | 'info' | 'success'>('all');
    const [showAcknowledged, setShowAcknowledged] = useState(false);
    const [systemStatus, setSystemStatus] = useState(realTimeMonitoringService.getSystemStatus());

    useEffect(() => {
        // 초기 데이터 로드
        setAlerts(realTimeMonitoringService.getAlerts());
        setMetrics(realTimeMonitoringService.getMetrics());

        // 실시간 업데이트 리스너 등록
        const unsubscribeAlerts = realTimeMonitoringService.onAlert((alert) => {
            setAlerts(prev => [alert, ...prev]);
            setSystemStatus(realTimeMonitoringService.getSystemStatus());
        });

        const unsubscribeMetrics = realTimeMonitoringService.onMetricsUpdate((newMetrics) => {
            setMetrics(newMetrics);
            setSystemStatus(realTimeMonitoringService.getSystemStatus());
        });

        // 모니터링 시작
        if (config.enabled && !isMonitoring) {
            realTimeMonitoringService.startMonitoring();
            setIsMonitoring(true);
        }

        return () => {
            unsubscribeAlerts();
            unsubscribeMetrics();
        };
    }, []);

    const handleToggleMonitoring = () => {
        if (isMonitoring) {
            realTimeMonitoringService.stopMonitoring();
            setIsMonitoring(false);
        } else {
            realTimeMonitoringService.startMonitoring();
            setIsMonitoring(true);
        }
    };

    const handleConfigUpdate = (newConfig: Partial<MonitoringConfig>) => {
        const updatedConfig = { ...config, ...newConfig };
        setConfig(updatedConfig);
        realTimeMonitoringService.updateConfig(newConfig);
    };

    const handleAcknowledgeAlert = (alertId: string) => {
        realTimeMonitoringService.acknowledgeAlert(alertId);
        setAlerts(prev => prev.map(alert => 
            alert.id === alertId ? { ...alert, acknowledged: true } : alert
        ));
        onAlertAction?.(alertId, 'acknowledge');
    };

    const handleDismissAlert = (alertId: string) => {
        realTimeMonitoringService.dismissAlert(alertId);
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
        onAlertAction?.(alertId, 'dismiss');
    };

    const handleClearAllAlerts = () => {
        realTimeMonitoringService.clearAllAlerts();
        setAlerts([]);
    };

    const handleRefreshMetrics = async () => {
        await realTimeMonitoringService.collectMetricsNow();
        setMetrics(realTimeMonitoringService.getMetrics());
        setSystemStatus(realTimeMonitoringService.getSystemStatus());
    };

    const handleRequestNotificationPermission = async () => {
        const granted = await realTimeMonitoringService.requestNotificationPermission();
        if (granted) {
            handleConfigUpdate({ notifications: { ...config.notifications, browser: true } });
        }
    };

    const getAlertIcon = (type: SystemAlert['type']) => {
        switch (type) {
            case 'critical': return <XCircle className="w-5 h-5 text-red-600" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
            case 'info': return <Info className="w-5 h-5 text-blue-600" />;
            case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
            default: return <AlertCircle className="w-5 h-5 text-gray-600" />;
        }
    };

    const getAlertColor = (type: SystemAlert['type']) => {
        switch (type) {
            case 'critical': return 'border-red-200 bg-red-50';
            case 'warning': return 'border-yellow-200 bg-yellow-50';
            case 'info': return 'border-blue-200 bg-blue-50';
            case 'success': return 'border-green-200 bg-green-50';
            default: return 'border-gray-200 bg-gray-50';
        }
    };

    const getMetricIcon = (metricId: string) => {
        switch (metricId) {
            case 'cpu_usage': return <Cpu className="w-5 h-5" />;
            case 'memory_usage': return <HardDrive className="w-5 h-5" />;
            case 'response_time': return <Clock className="w-5 h-5" />;
            case 'error_rate': return <AlertTriangle className="w-5 h-5" />;
            case 'user_satisfaction': return <Users className="w-5 h-5" />;
            default: return <Activity className="w-5 h-5" />;
        }
    };

    const getMetricColor = (metric: PerformanceMetric) => {
        if (metric.value >= metric.threshold.critical) return 'text-red-600 bg-red-100';
        if (metric.value >= metric.threshold.warning) return 'text-yellow-600 bg-yellow-100';
        return 'text-green-600 bg-green-100';
    };

    const getTrendIcon = (trend: PerformanceMetric['trend']) => {
        switch (trend) {
            case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />;
            case 'declining': return <TrendingDown className="w-4 h-4 text-red-600" />;
            default: return <Activity className="w-4 h-4 text-blue-600" />;
        }
    };

    const getSystemStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'text-green-600 bg-green-100';
            case 'warning': return 'text-yellow-600 bg-yellow-100';
            case 'critical': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const filteredAlerts = alerts.filter(alert => {
        if (alertFilter !== 'all' && alert.type !== alertFilter) return false;
        if (!showAcknowledged && alert.acknowledged) return false;
        return true;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-lg">
                        <Monitor className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">실시간 모니터링</h2>
                        <p className="text-sm text-gray-600">시스템 성능 및 알림 실시간 모니터링</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSystemStatusColor(systemStatus.status)}`}>
                        {systemStatus.status === 'healthy' ? '정상' :
                         systemStatus.status === 'warning' ? '경고' : '위험'}
                    </div>
                    <button
                        onClick={handleToggleMonitoring}
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                            isMonitoring 
                                ? 'text-red-700 bg-red-100 hover:bg-red-200' 
                                : 'text-green-700 bg-green-100 hover:bg-green-200'
                        }`}
                    >
                        {isMonitoring ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                        {isMonitoring ? '모니터링 중지' : '모니터링 시작'}
                    </button>
                    <button
                        onClick={handleRefreshMetrics}
                        className="p-2 text-gray-400 hover:text-gray-600"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { id: 'overview', name: '개요', icon: BarChart3 },
                            { id: 'alerts', name: '알림', icon: Bell, badge: systemStatus.activeAlerts },
                            { id: 'metrics', name: '메트릭', icon: LineChart },
                            { id: 'settings', name: '설정', icon: Settings }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedView(tab.id as any)}
                                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 ${
                                    selectedView === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <tab.icon className="w-4 h-4 mr-2" />
                                {tab.name}
                                {tab.badge && tab.badge > 0 && (
                                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="p-6">
                    <AnimatePresence mode="wait">
                        {selectedView === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                {/* System Status Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center">
                                            <div className={`p-3 rounded-lg ${getSystemStatusColor(systemStatus.status)}`}>
                                                <Shield className="h-6 w-6" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">시스템 상태</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {systemStatus.status === 'healthy' ? '정상' :
                                                     systemStatus.status === 'warning' ? '경고' : '위험'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center">
                                            <div className="bg-blue-100 p-3 rounded-lg">
                                                <Bell className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">활성 알림</p>
                                                <p className="text-2xl font-bold text-gray-900">{systemStatus.activeAlerts}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center">
                                            <div className="bg-red-100 p-3 rounded-lg">
                                                <AlertTriangle className="h-6 w-6 text-red-600" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">긴급 알림</p>
                                                <p className="text-2xl font-bold text-gray-900">{systemStatus.criticalAlerts}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center">
                                            <div className="bg-green-100 p-3 rounded-lg">
                                                <Target className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">평균 성능</p>
                                                <p className="text-2xl font-bold text-gray-900">{Math.round(systemStatus.averagePerformance)}%</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Real-time Metrics */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">실시간 메트릭</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {metrics.map((metric) => (
                                            <div key={metric.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`p-2 rounded-lg ${getMetricColor(metric)}`}>
                                                            {getMetricIcon(metric.id)}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">{metric.name}</h4>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-2xl font-bold text-gray-900">
                                                                    {metric.value.toFixed(metric.id === 'user_satisfaction' ? 2 : 0)}
                                                                    {metric.unit}
                                                                </span>
                                                                {getTrendIcon(metric.trend)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm text-gray-600">
                                                        <span>경고: {metric.threshold.warning}{metric.unit}</span>
                                                        <span>위험: {metric.threshold.critical}{metric.unit}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div 
                                                            className={`h-2 rounded-full ${
                                                                metric.value >= metric.threshold.critical ? 'bg-red-500' :
                                                                metric.value >= metric.threshold.warning ? 'bg-yellow-500' : 'bg-green-500'
                                                            }`}
                                                            style={{ 
                                                                width: `${Math.min(100, (metric.value / Math.max(metric.threshold.critical, 100)) * 100)}%` 
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Recent Alerts */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">최근 알림</h3>
                                        <button
                                            onClick={() => setSelectedView('alerts')}
                                            className="text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            모든 알림 보기
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {alerts.slice(0, 5).map((alert) => (
                                            <div key={alert.id} className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start space-x-3">
                                                        {getAlertIcon(alert.type)}
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-gray-900">{alert.title}</h4>
                                                            <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                                                            <p className="text-xs text-gray-500 mt-2">
                                                                {alert.timestamp.toLocaleString('ko-KR')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {!alert.acknowledged && (
                                                        <button
                                                            onClick={() => handleAcknowledgeAlert(alert.id)}
                                                            className="text-sm text-gray-600 hover:text-gray-800"
                                                        >
                                                            확인
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {selectedView === 'alerts' && (
                            <motion.div
                                key="alerts"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                {/* Alert Controls */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <select
                                            value={alertFilter}
                                            onChange={(e) => setAlertFilter(e.target.value as any)}
                                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        >
                                            <option value="all">모든 알림</option>
                                            <option value="critical">긴급</option>
                                            <option value="warning">경고</option>
                                            <option value="info">정보</option>
                                            <option value="success">성공</option>
                                        </select>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={showAcknowledged}
                                                onChange={(e) => setShowAcknowledged(e.target.checked)}
                                                className="rounded border-gray-300"
                                            />
                                            <span className="text-sm text-gray-600">확인된 알림 표시</span>
                                        </label>
                                    </div>
                                    <button
                                        onClick={handleClearAllAlerts}
                                        className="flex items-center px-3 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        모든 알림 삭제
                                    </button>
                                </div>

                                {/* Alerts List */}
                                <div className="space-y-3">
                                    {filteredAlerts.map((alert) => (
                                        <div key={alert.id} className={`p-6 rounded-lg border ${getAlertColor(alert.type)} ${alert.acknowledged ? 'opacity-60' : ''}`}>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start space-x-4">
                                                    {getAlertIcon(alert.type)}
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                                                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                                                {alert.category}
                                                            </span>
                                                            {alert.acknowledged && (
                                                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-600 rounded-full">
                                                                    확인됨
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-gray-700 mb-3">{alert.message}</p>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                            <span>{alert.timestamp.toLocaleString('ko-KR')}</span>
                                                            {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                                                                <span>메타데이터: {Object.keys(alert.metadata).length}개</span>
                                                            )}
                                                        </div>
                                                        {alert.actions && alert.actions.length > 0 && (
                                                            <div className="mt-4 space-x-2">
                                                                {alert.actions.map((action) => (
                                                                    <button
                                                                        key={action.id}
                                                                        onClick={() => action.handler()}
                                                                        className="px-3 py-1 text-sm font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
                                                                    >
                                                                        {action.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {!alert.acknowledged && (
                                                        <button
                                                            onClick={() => handleAcknowledgeAlert(alert.id)}
                                                            className="p-2 text-green-600 hover:bg-green-100 rounded-md"
                                                            title="확인"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDismissAlert(alert.id)}
                                                        className="p-2 text-red-600 hover:bg-red-100 rounded-md"
                                                        title="삭제"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {filteredAlerts.length === 0 && (
                                    <div className="text-center py-12">
                                        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">알림이 없습니다</h3>
                                        <p className="text-gray-600">현재 표시할 알림이 없습니다.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {selectedView === 'metrics' && (
                            <motion.div
                                key="metrics"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center py-12">
                                    <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">상세 메트릭 차트</h3>
                                    <p className="text-gray-600">메트릭 히스토리 차트가 곧 추가됩니다.</p>
                                </div>
                            </motion.div>
                        )}

                        {selectedView === 'settings' && (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                {/* Monitoring Settings */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">모니터링 설정</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">모니터링 활성화</label>
                                                <p className="text-sm text-gray-500">실시간 시스템 모니터링을 활성화합니다.</p>
                                            </div>
                                            <button
                                                onClick={() => handleConfigUpdate({ enabled: !config.enabled })}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                                                    config.enabled ? 'bg-blue-600' : 'bg-gray-200'
                                                }`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                                    config.enabled ? 'translate-x-6' : 'translate-x-1'
                                                }`} />
                                            </button>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700">모니터링 간격</label>
                                            <select
                                                value={config.interval}
                                                onChange={(e) => handleConfigUpdate({ interval: parseInt(e.target.value) })}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                            >
                                                <option value={10000}>10초</option>
                                                <option value={30000}>30초</option>
                                                <option value={60000}>1분</option>
                                                <option value={300000}>5분</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Alert Thresholds */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">알림 임계값</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {Object.entries(config.alertThresholds).map(([key, threshold]) => (
                                            <div key={key} className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 capitalize">
                                                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-xs text-gray-500">경고</label>
                                                        <input
                                                            type="number"
                                                            value={threshold.warning}
                                                            onChange={(e) => handleConfigUpdate({
                                                                alertThresholds: {
                                                                    ...config.alertThresholds,
                                                                    [key]: { ...threshold, warning: parseFloat(e.target.value) }
                                                                }
                                                            })}
                                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-gray-500">위험</label>
                                                        <input
                                                            type="number"
                                                            value={threshold.critical}
                                                            onChange={(e) => handleConfigUpdate({
                                                                alertThresholds: {
                                                                    ...config.alertThresholds,
                                                                    [key]: { ...threshold, critical: parseFloat(e.target.value) }
                                                                }
                                                            })}
                                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Notification Settings */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">알림 설정</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <Smartphone className="w-5 h-5 text-gray-600" />
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">브라우저 알림</label>
                                                    <p className="text-sm text-gray-500">중요한 알림을 브라우저로 받습니다.</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {!config.notifications.browser && (
                                                    <button
                                                        onClick={handleRequestNotificationPermission}
                                                        className="text-sm text-blue-600 hover:text-blue-700"
                                                    >
                                                        권한 요청
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleConfigUpdate({
                                                        notifications: { ...config.notifications, browser: !config.notifications.browser }
                                                    })}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                                                        config.notifications.browser ? 'bg-blue-600' : 'bg-gray-200'
                                                    }`}
                                                >
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                                        config.notifications.browser ? 'translate-x-6' : 'translate-x-1'
                                                    }`} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <Volume2 className="w-5 h-5 text-gray-600" />
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">사운드 알림</label>
                                                    <p className="text-sm text-gray-500">알림 시 사운드를 재생합니다.</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleConfigUpdate({
                                                    notifications: { ...config.notifications, sound: !config.notifications.sound }
                                                })}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                                                    config.notifications.sound ? 'bg-blue-600' : 'bg-gray-200'
                                                }`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                                    config.notifications.sound ? 'translate-x-6' : 'translate-x-1'
                                                }`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Auto Optimization Settings */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">자동 최적화 설정</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">자동 최적화 활성화</label>
                                                <p className="text-sm text-gray-500">시스템이 자동으로 최적화를 실행합니다.</p>
                                            </div>
                                            <button
                                                onClick={() => handleConfigUpdate({
                                                    autoOptimization: { ...config.autoOptimization, enabled: !config.autoOptimization.enabled }
                                                })}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                                                    config.autoOptimization.enabled ? 'bg-blue-600' : 'bg-gray-200'
                                                }`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                                    config.autoOptimization.enabled ? 'translate-x-6' : 'translate-x-1'
                                                }`} />
                                            </button>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700">시간당 최대 액션 수</label>
                                            <input
                                                type="number"
                                                value={config.autoOptimization.maxActionsPerHour}
                                                onChange={(e) => handleConfigUpdate({
                                                    autoOptimization: { 
                                                        ...config.autoOptimization, 
                                                        maxActionsPerHour: parseInt(e.target.value) 
                                                    }
                                                })}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                                min="1"
                                                max="20"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">실행 전 확인 요구</label>
                                                <p className="text-sm text-gray-500">자동 최적화 실행 전 사용자 확인을 요구합니다.</p>
                                            </div>
                                            <button
                                                onClick={() => handleConfigUpdate({
                                                    autoOptimization: { 
                                                        ...config.autoOptimization, 
                                                        requireConfirmation: !config.autoOptimization.requireConfirmation 
                                                    }
                                                })}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                                                    config.autoOptimization.requireConfirmation ? 'bg-blue-600' : 'bg-gray-200'
                                                }`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                                    config.autoOptimization.requireConfirmation ? 'translate-x-6' : 'translate-x-1'
                                                }`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default RealTimeMonitoringDashboard;
