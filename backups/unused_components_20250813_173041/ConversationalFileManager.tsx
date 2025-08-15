import React, { useState, useCallback, useEffect } from 'react';
import {
    DocumentIcon,
    CogIcon
} from '@heroicons/react/24/outline';

interface FileItem {
    id: string;
    name: string;
    size: number;
    type: string;
    uploadDate: string;
    analysisStatus: 'pending' | 'analyzing' | 'completed' | 'failed';
    analysisProgress: number;
    analysisResults?: any;
}

interface ConversationalFileManagerProps {
    onFileAnalysisComplete: (fileId: string, results: any) => void;
    onUserRequest: (request: string) => void;
}

const ConversationalFileManager: React.FC<ConversationalFileManagerProps> = ({
    onFileAnalysisComplete,
    onUserRequest
}) => {
    const [files, setFiles] = useState<FileItem[]>([
        {
            id: '1',
            name: '개포우성7차_제안서.pdf',
            size: 1.95 * 1024 * 1024, // 1.95 MB
            type: 'document',
            uploadDate: '2024. 1. 15.',
            analysisStatus: 'analyzing',
            analysisProgress: 10
        }
    ]);

    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

    // 파일 크기 포맷팅
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // 파일 타입별 아이콘
    const getFileIcon = (type: string) => {
        switch (type) {
            case 'document':
                return <DocumentIcon className="w-6 h-6 text-blue-500" />;
            case 'image':
                return <DocumentIcon className="w-6 h-6 text-green-500" />;
            case 'video':
                return <DocumentIcon className="w-6 h-6 text-purple-500" />;
            default:
                return <DocumentIcon className="w-6 h-6 text-gray-500" />;
        }
    };

    // 파일 선택 처리
    const handleFileSelect = useCallback((fileId: string) => {
        setSelectedFiles(prev => 
            prev.includes(fileId) 
                ? prev.filter(id => id !== fileId)
                : [...prev, fileId]
        );
    }, []);

    // 대화형 요청 처리
    const handleConversationalRequest = useCallback((request: string) => {
        const lowerRequest = request.toLowerCase();

        if (lowerRequest.includes('모든 파일 선택') || lowerRequest.includes('select all')) {
            // 모든 파일 선택
            setSelectedFiles(files.map(f => f.id));
            onUserRequest('모든 파일이 선택되었습니다.');
        } else if (lowerRequest.includes('선택 해제') || lowerRequest.includes('deselect')) {
            // 선택 해제
            setSelectedFiles([]);
            onUserRequest('파일 선택이 해제되었습니다.');
        } else {
            // 일반적인 요청 처리
            onUserRequest(request);
        }
    }, [selectedFiles, files, onUserRequest]);

    // 컴포넌트 마운트 시 대화형 요청 핸들러 등록
    useEffect(() => {
        // 전역 이벤트 리스너 등록 (실제 구현에서는 Context나 Redux 사용)
        const handleGlobalRequest = (event: CustomEvent) => {
            if (event.detail.type === 'file_management') {
                handleConversationalRequest(event.detail.request);
            }
        };

        window.addEventListener('conversational-request', handleGlobalRequest as EventListener);

        return () => {
            window.removeEventListener('conversational-request', handleGlobalRequest as EventListener);
        };
    }, [handleConversationalRequest]);

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    <DocumentIcon className="w-6 h-6 mr-2" />
                    대화형 파일 관리 시스템
                </h2>
            </div>

            {/* 파일 목록 */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    파일 목록 ({files.length}개)
                </h3>

                <div className="space-y-3">
                    {files.map(file => (
                        <div
                            key={file.id}
                            className={`bg-white dark:bg-gray-700 rounded-lg p-4 border-2 transition-all ${selectedFiles.includes(file.id)
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-600'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1">
                                    <input
                                        type="checkbox"
                                        checked={selectedFiles.includes(file.id)}
                                        onChange={() => handleFileSelect(file.id)}
                                        className="w-4 h-4 text-blue-600 rounded"
                                        aria-label={`${file.name} 파일 선택`}
                                    />
                                    {getFileIcon(file.type)}
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                            {file.name}
                                        </h4>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 space-x-2">
                                            <span>{formatFileSize(file.size)}</span>
                                            <span>•</span>
                                            <span>{file.type}</span>
                                            <span>•</span>
                                            <span>{file.uploadDate}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 대화형 도움말 */}
            <div className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    💡 대화형 명령어
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>• "모든 파일 선택" - 모든 파일을 선택</p>
                    <p>• "선택 해제" - 파일 선택 해제</p>
                </div>
            </div>
        </div>
    );
};

export default ConversationalFileManager;
