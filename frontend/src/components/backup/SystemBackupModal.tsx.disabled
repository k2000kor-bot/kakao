import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download,
    Upload,
    AlertTriangle,
    CheckCircle,
    X,
    FileText,
    Calendar,
    Database,
    RefreshCw,
    Info
} from 'lucide-react';
import { systemService } from '../services/projectService';

interface SystemBackupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBackupComplete?: () => void;
    onRestoreComplete?: () => void;
}

const SystemBackupModal: React.FC<SystemBackupModalProps> = ({
    isOpen,
    onClose,
    onBackupComplete,
    onRestoreComplete
}) => {
    const [activeTab, setActiveTab] = useState<'backup' | 'restore'>('backup');
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleBackup = async () => {
        setIsProcessing(true);
        setMessage('백업을 생성하고 있습니다...');
        setMessageType('info');

        try {
            await new Promise(resolve => setTimeout(resolve, 2000)); // 시뮬레이션
            systemService.exportSystemData();

            setMessage('백업이 성공적으로 완료되었습니다!');
            setMessageType('success');

            setTimeout(() => {
                onBackupComplete?.();
                onClose();
            }, 2000);
        } catch (error) {
            setMessage('백업 중 오류가 발생했습니다.');
            setMessageType('error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'application/json') {
            setSelectedFile(file);
            setMessage('파일이 선택되었습니다.');
            setMessageType('info');
        } else {
            setMessage('올바른 JSON 파일을 선택해주세요.');
            setMessageType('error');
        }
    };

    const handleRestore = async () => {
        if (!selectedFile) {
            setMessage('복원할 파일을 선택해주세요.');
            setMessageType('error');
            return;
        }

        setIsProcessing(true);
        setMessage('백업 파일을 확인하고 있습니다...');
        setMessageType('info');

        try {
            const text = await selectedFile.text();
            const data = JSON.parse(text);

            // 백업 파일 유효성 검사
            if (!data.projects || !data.chats || !data.messages) {
                throw new Error('올바르지 않은 백업 파일입니다.');
            }

            setMessage('시스템을 복원하고 있습니다...');

            await new Promise(resolve => setTimeout(resolve, 3000)); // 시뮬레이션
            const result = systemService.importSystemData(data);

            if (result.success) {
                setMessage('시스템 복원이 성공적으로 완료되었습니다!');
                setMessageType('success');

                setTimeout(() => {
                    onRestoreComplete?.();
                    onClose();
                    window.location.reload(); // 페이지 새로고침
                }, 2000);
            } else {
                throw new Error('복원 중 오류가 발생했습니다.');
            }
        } catch (error) {
            setMessage('복원 중 오류가 발생했습니다: ' + (error as Error).message);
            setMessageType('error');
        } finally {
            setIsProcessing(false);
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
                        className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className="bg-purple-100 p-2 rounded-lg">
                                    <Database className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">시스템 백업 및 복원</h2>
                                    <p className="text-sm text-gray-600">시스템 데이터를 백업하거나 복원합니다</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab('backup')}
                                className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium ${activeTab === 'backup'
                                        ? 'border-b-2 border-purple-500 text-purple-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                백업
                            </button>
                            <button
                                onClick={() => setActiveTab('restore')}
                                className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium ${activeTab === 'restore'
                                        ? 'border-b-2 border-purple-500 text-purple-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                복원
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <AnimatePresence mode="wait">
                                {activeTab === 'backup' && (
                                    <motion.div
                                        key="backup"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-start space-x-3">
                                                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                                                <div>
                                                    <h3 className="text-sm font-medium text-blue-900">백업 정보</h3>
                                                    <p className="text-sm text-blue-700 mt-1">
                                                        현재 시스템의 모든 데이터(프로젝트, 채팅, 메시지)를 JSON 파일로 백업합니다.
                                                        백업 파일은 자동으로 다운로드됩니다.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <FileText className="w-4 h-4 text-gray-600" />
                                                    <span className="text-sm font-medium text-gray-900">백업 내용</span>
                                                </div>
                                                <ul className="text-sm text-gray-600 space-y-1">
                                                    <li>• 모든 프로젝트 데이터</li>
                                                    <li>• 모든 채팅 기록</li>
                                                    <li>• 모든 메시지 내용</li>
                                                    <li>• 시스템 설정</li>
                                                </ul>
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Calendar className="w-4 h-4 text-gray-600" />
                                                    <span className="text-sm font-medium text-gray-900">백업 일시</span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {new Date().toLocaleString('ko-KR')}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleBackup}
                                            disabled={isProcessing}
                                            className="w-full flex items-center justify-center px-4 py-3 text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                    백업 중...
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="w-4 h-4 mr-2" />
                                                    백업 시작
                                                </>
                                            )}
                                        </button>
                                    </motion.div>
                                )}

                                {activeTab === 'restore' && (
                                    <motion.div
                                        key="restore"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <div className="flex items-start space-x-3">
                                                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                                <div>
                                                    <h3 className="text-sm font-medium text-yellow-900">주의사항</h3>
                                                    <p className="text-sm text-yellow-700 mt-1">
                                                        복원 시 현재 시스템의 모든 데이터가 백업 파일의 데이터로 교체됩니다.
                                                        복원 전에 현재 데이터를 백업하는 것을 권장합니다.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                            <div className="text-center">
                                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                <div className="mb-4">
                                                    <label htmlFor="backup-file" className="cursor-pointer">
                                                        <span className="text-purple-600 hover:text-purple-700 font-medium">
                                                            백업 파일 선택
                                                        </span>
                                                        <span className="text-gray-500"> 또는 파일을 여기로 드래그</span>
                                                    </label>
                                                    <input
                                                        id="backup-file"
                                                        type="file"
                                                        accept=".json"
                                                        onChange={handleFileSelect}
                                                        className="hidden"
                                                    />
                                                </div>
                                                {selectedFile && (
                                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                        <div className="flex items-center space-x-2">
                                                            <FileText className="w-4 h-4 text-green-600" />
                                                            <span className="text-sm font-medium text-green-900">
                                                                {selectedFile.name}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-green-700 mt-1">
                                                            크기: {(selectedFile.size / 1024).toFixed(1)} KB
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleRestore}
                                            disabled={isProcessing || !selectedFile}
                                            className="w-full flex items-center justify-center px-4 py-3 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                    복원 중...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    시스템 복원
                                                </>
                                            )}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

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

export default SystemBackupModal;
