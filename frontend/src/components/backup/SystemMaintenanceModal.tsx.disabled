import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    AlertTriangle,
    CheckCircle,
    X,
    Settings,
    RefreshCw,
    Database,
    Trash2,
    Clock,
    Info,
    Play,
    Pause,
    Lock,
    Unlock
} from 'lucide-react';

interface SystemMaintenanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMaintenanceStart?: () => void;
    onMaintenanceEnd?: () => void;
}

interface MaintenanceTask {
    id: string;
    name: string;
    description: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    duration: number;
    progress: number;
}

const SystemMaintenanceModal: React.FC<SystemMaintenanceModalProps> = ({
    isOpen,
    onClose,
    onMaintenanceStart,
    onMaintenanceEnd
}) => {
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
    const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
    const [runningTasks, setRunningTasks] = useState<MaintenanceTask[]>([]);

    const maintenanceTasks: MaintenanceTask[] = [
        {
            id: '1',
            name: '데이터베이스 최적화',
            description: '데이터베이스 인덱스 재구성 및 쿼리 최적화',
            status: 'pending',
            duration: 300,
            progress: 0
        },
        {
            id: '2',
            name: '캐시 정리',
            description: '시스템 캐시 및 임시 파일 정리',
            status: 'pending',
            duration: 120,
            progress: 0
        },
        {
            id: '3',
            name: '로그 파일 정리',
            description: '오래된 로그 파일 정리 및 압축',
            status: 'pending',
            duration: 180,
            progress: 0
        },
        {
            id: '4',
            name: '시스템 업데이트',
            description: '시스템 구성 요소 업데이트 및 패치 적용',
            status: 'pending',
            duration: 600,
            progress: 0
        },
        {
            id: '5',
            name: '보안 검사',
            description: '시스템 보안 취약점 검사 및 수정',
            status: 'pending',
            duration: 240,
            progress: 0
        }
    ];

    const handleTaskToggle = (taskId: string) => {
        setSelectedTasks(prev =>
            prev.includes(taskId)
                ? prev.filter(id => id !== taskId)
                : [...prev, taskId]
        );
    };

    const handleMaintenanceStart = async () => {
        if (selectedTasks.length === 0) {
            setMessage('최소 하나의 작업을 선택해주세요.');
            setMessageType('error');
            return;
        }

        setIsProcessing(true);
        setIsMaintenanceMode(true);
        setMessage('유지보수 모드가 시작되었습니다.');
        setMessageType('info');

        // 선택된 작업들을 실행 중 상태로 변경
        const tasksToRun = maintenanceTasks.filter(task => selectedTasks.includes(task.id));
        setRunningTasks(tasksToRun.map(task => ({ ...task, status: 'running' as const })));

        onMaintenanceStart?.();

        // 각 작업을 시뮬레이션
        for (const task of tasksToRun) {
            setMessage(`${task.name} 작업을 실행하고 있습니다...`);

            // 작업 진행률 시뮬레이션
            for (let i = 0; i <= 100; i += 10) {
                await new Promise(resolve => setTimeout(resolve, task.duration * 10));
                setRunningTasks(prev =>
                    prev.map(t =>
                        t.id === task.id
                            ? { ...t, progress: i }
                            : t
                    )
                );
            }

            // 작업 완료
            setRunningTasks(prev =>
                prev.map(t =>
                    t.id === task.id
                        ? { ...t, status: 'completed' as const, progress: 100 }
                        : t
                )
            );
        }

        setMessage('모든 유지보수 작업이 완료되었습니다.');
        setMessageType('success');
        setIsProcessing(false);
    };

    const handleMaintenanceEnd = () => {
        setIsMaintenanceMode(false);
        setRunningTasks([]);
        setSelectedTasks([]);
        setMessage('');
        onMaintenanceEnd?.();
        onClose();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running':
                return 'text-blue-600 bg-blue-100';
            case 'completed':
                return 'text-green-600 bg-green-100';
            case 'failed':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'running':
                return <RefreshCw className="w-4 h-4 animate-spin" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4" />;
            case 'failed':
                return <AlertTriangle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const getMessageIcon = () => {
        switch (messageType) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'error':
                return <AlertTriangle className="w-5 h-5 text-red-600" />;
            default:
                return <Info className="w-5 h-5 text-blue-600" />;
        }
    };

    const getMessageColor = () => {
        switch (messageType) {
            case 'success':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800';
            default:
                return 'bg-blue-50 border-blue-200 text-blue-800';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className="bg-orange-100 p-2 rounded-lg">
                                    <Shield className="h-6 w-6 text-orange-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">시스템 유지보수</h2>
                                    <p className="text-sm text-gray-600">시스템 최적화 및 유지보수 작업</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            {!isMaintenanceMode ? (
                                <div className="space-y-6">
                                    {/* Warning */}
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="flex items-start space-x-3">
                                            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                            <div>
                                                <h3 className="text-sm font-medium text-yellow-900">유지보수 모드</h3>
                                                <p className="text-sm text-yellow-700 mt-1">
                                                    유지보수 모드가 활성화되면 시스템이 일시적으로 제한될 수 있습니다.
                                                    모든 사용자에게 유지보수 알림이 전송됩니다.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Task Selection */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">유지보수 작업 선택</h3>
                                        <div className="space-y-3">
                                            {maintenanceTasks.map((task) => (
                                                <div
                                                    key={task.id}
                                                    className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedTasks.includes(task.id)
                                                            ? 'border-purple-500 bg-purple-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    onClick={() => handleTaskToggle(task.id)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedTasks.includes(task.id)}
                                                                onChange={() => handleTaskToggle(task.id)}
                                                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                            />
                                                            <div>
                                                                <h4 className="font-medium text-gray-900">{task.name}</h4>
                                                                <p className="text-sm text-gray-600">{task.description}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Clock className="w-4 h-4 text-gray-400" />
                                                            <span className="text-sm text-gray-500">
                                                                {Math.floor(task.duration / 60)}분
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Start Button */}
                                    <button
                                        onClick={handleMaintenanceStart}
                                        disabled={isProcessing || selectedTasks.length === 0}
                                        className="w-full flex items-center justify-center px-4 py-3 text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                유지보수 시작 중...
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-4 h-4 mr-2" />
                                                유지보수 시작
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Maintenance Status */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <Lock className="w-5 h-5 text-blue-600" />
                                                <div>
                                                    <h3 className="text-sm font-medium text-blue-900">유지보수 모드 활성</h3>
                                                    <p className="text-sm text-blue-700">시스템이 유지보수 모드에서 실행 중입니다.</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleMaintenanceEnd}
                                                disabled={isProcessing}
                                                className="flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 disabled:opacity-50"
                                            >
                                                <Unlock className="w-4 h-4 mr-2" />
                                                유지보수 종료
                                            </button>
                                        </div>
                                    </div>

                                    {/* Running Tasks */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">실행 중인 작업</h3>
                                        <div className="space-y-4">
                                            {runningTasks.map((task) => (
                                                <div key={task.id} className="bg-gray-50 rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center space-x-3">
                                                            {getStatusIcon(task.status)}
                                                            <div>
                                                                <h4 className="font-medium text-gray-900">{task.name}</h4>
                                                                <p className="text-sm text-gray-600">{task.description}</p>
                                                            </div>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                                            {task.status === 'running' ? '실행 중' :
                                                                task.status === 'completed' ? '완료됨' :
                                                                    task.status === 'failed' ? '실패' : '대기 중'}
                                                        </span>
                                                    </div>

                                                    {task.status === 'running' && (
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                                style={{ width: `${task.progress}%` }}
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                                                        <span>진행률: {task.progress}%</span>
                                                        <span>예상 시간: {Math.floor(task.duration / 60)}분</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Message */}
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`mt-4 p-3 rounded-lg border ${getMessageColor()}`}
                                >
                                    <div className="flex items-center space-x-2">
                                        {getMessageIcon()}
                                        <span className="text-sm font-medium">{message}</span>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SystemMaintenanceModal;
