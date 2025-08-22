import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap,
    RefreshCw,
    Database,
    Shield,
    Users,
    BarChart3,
    Settings,
    Bell,
    Plus,
    Search,
    Filter,
    Download,
    Upload,
    Trash2,
    Play,
    Pause,
    AlertTriangle,
    CheckCircle,
    Info
} from 'lucide-react';

interface QuickAction {
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<any>;
    color: string;
    action: () => void;
    disabled?: boolean;
}

interface SystemQuickActionsProps {
    onBackup: () => void;
    onMaintenance: () => void;
    onRefresh: () => void;
    onUserManagement: () => void;
    onAnalytics: () => void;
    onSettings: () => void;
    onNotifications: () => void;
    onCreateProject: () => void;
    onSearch: () => void;
    onExport: () => void;
    onImport: () => void;
    onCleanup: () => void;
    isMaintenanceMode?: boolean;
}

const SystemQuickActions: React.FC<SystemQuickActionsProps> = ({
    onBackup,
    onMaintenance,
    onRefresh,
    onUserManagement,
    onAnalytics,
    onSettings,
    onNotifications,
    onCreateProject,
    onSearch,
    onExport,
    onImport,
    onCleanup,
    isMaintenanceMode = false
}) => {
    const [showActions, setShowActions] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const quickActions: QuickAction[] = [
        {
            id: 'backup',
            name: '시스템 백업',
            description: '전체 시스템 데이터 백업',
            icon: Database,
            color: 'bg-blue-500',
            action: onBackup
        },
        {
            id: 'maintenance',
            name: '유지보수',
            description: '시스템 최적화 및 유지보수',
            icon: Shield,
            color: 'bg-orange-500',
            action: onMaintenance,
            disabled: isMaintenanceMode
        },
        {
            id: 'refresh',
            name: '새로고침',
            description: '시스템 데이터 새로고침',
            icon: RefreshCw,
            color: 'bg-green-500',
            action: onRefresh
        },
        {
            id: 'users',
            name: '사용자 관리',
            description: '사용자 및 권한 관리',
            icon: Users,
            color: 'bg-purple-500',
            action: onUserManagement
        },
        {
            id: 'analytics',
            name: '분석',
            description: '시스템 분석 및 통계',
            icon: BarChart3,
            color: 'bg-indigo-500',
            action: onAnalytics
        },
        {
            id: 'settings',
            name: '설정',
            description: '시스템 설정 관리',
            icon: Settings,
            color: 'bg-gray-500',
            action: onSettings
        },
        {
            id: 'notifications',
            name: '알림',
            description: '시스템 알림 관리',
            icon: Bell,
            color: 'bg-red-500',
            action: onNotifications
        },
        {
            id: 'create-project',
            name: '새 프로젝트',
            description: '새 프로젝트 생성',
            icon: Plus,
            color: 'bg-emerald-500',
            action: onCreateProject
        },
        {
            id: 'search',
            name: '검색',
            description: '전체 시스템 검색',
            icon: Search,
            color: 'bg-teal-500',
            action: onSearch
        },
        {
            id: 'export',
            name: '내보내기',
            description: '데이터 내보내기',
            icon: Download,
            color: 'bg-cyan-500',
            action: onExport
        },
        {
            id: 'import',
            name: '가져오기',
            description: '데이터 가져오기',
            icon: Upload,
            color: 'bg-sky-500',
            action: onImport
        },
        {
            id: 'cleanup',
            name: '정리',
            description: '시스템 데이터 정리',
            icon: Trash2,
            color: 'bg-rose-500',
            action: onCleanup
        }
    ];

    const handleAction = async (action: QuickAction) => {
        if (action.disabled) return;

        setIsProcessing(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500)); // 시뮬레이션
            action.action();
        } catch (error) {
            console.error('액션 실행 실패:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="relative">
            {/* Quick Actions Button */}
            <button
                onClick={() => setShowActions(!showActions)}
                disabled={isProcessing}
                className="fixed bottom-6 right-6 w-14 h-14 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-200 z-40"
            >
                {isProcessing ? (
                    <RefreshCw className="w-6 h-6 animate-spin" />
                ) : (
                    <Zap className="w-6 h-6" />
                )}
            </button>

            {/* Quick Actions Panel */}
            <AnimatePresence>
                {showActions && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="fixed bottom-20 right-6 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <div className="flex items-center space-x-2">
                                <Zap className="w-5 h-5 text-purple-600" />
                                <h3 className="text-lg font-semibold text-gray-900">빠른 액션</h3>
                            </div>
                            <button
                                onClick={() => setShowActions(false)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Actions Grid */}
                        <div className="p-4">
                            <div className="grid grid-cols-2 gap-3">
                                {quickActions.map((action) => {
                                    const IconComponent = action.icon;
                                    return (
                                        <motion.button
                                            key={action.id}
                                            onClick={() => handleAction(action)}
                                            disabled={action.disabled || isProcessing}
                                            className={`p-3 rounded-lg border transition-all duration-200 ${action.disabled
                                                    ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200'
                                                    : 'hover:shadow-md hover:scale-105 cursor-pointer bg-white border-gray-200'
                                                }`}
                                            whileHover={!action.disabled ? { scale: 1.05 } : {}}
                                            whileTap={!action.disabled ? { scale: 0.95 } : {}}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.color}`}>
                                                    <IconComponent className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {action.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {action.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>총 {quickActions.length}개의 액션</span>
                                {isMaintenanceMode && (
                                    <div className="flex items-center space-x-1 text-orange-600">
                                        <AlertTriangle className="w-3 h-3" />
                                        <span className="text-xs">유지보수 모드</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Backdrop */}
            <AnimatePresence>
                {showActions && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-25 z-40"
                        onClick={() => setShowActions(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default SystemQuickActions;
