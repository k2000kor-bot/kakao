import React, { useState, useRef, useCallback } from 'react';
import {
    CloudArrowUpIcon, DocumentIcon, PhotoIcon,
    XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon,
    ArrowUpTrayIcon, DocumentTextIcon, EyeIcon
} from '@heroicons/react/24/outline';

import apiService from '../services/apiService';

interface FileUploadAreaProps {
    onFileAnalyzed: (analysis: any) => void;
    onFileUploaded: (file: File) => void;
    context?: string;
    multiple?: boolean;
    acceptedTypes?: string[];
}

interface UploadedFile {
    file: File;
    analysis?: any;
    status: 'uploading' | 'analyzing' | 'completed' | 'error';
    error?: string;
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({
    onFileAnalyzed,
    onFileUploaded,
    context = '',
    multiple = false,
    acceptedTypes = ['*']
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        handleFiles(files);
    }, []);

    const handleFiles = async (files: File[]) => {
        const validFiles = files.filter(file => {
            if (acceptedTypes.includes('*')) return true;
            const ext = file.name.toLowerCase().split('.').pop();
            return acceptedTypes.some(type => {
                if (type.startsWith('.')) {
                    return ext === type.substring(1);
                }
                return file.type.startsWith(type);
            });
        });

        if (validFiles.length === 0) {
            alert('지원하지 않는 파일 형식입니다.');
            return;
        }

        const newUploadedFiles: UploadedFile[] = validFiles.map(file => ({
            file,
            status: 'uploading'
        }));

        setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
        setIsAnalyzing(true);

        try {
            if (multiple) {
                // 다중 파일 처리
                const result = await apiService.uploadMultipleFiles(validFiles, context);
                if (result.success) {
                    setUploadedFiles(prev =>
                        prev.map((uf, index) => {
                            if (validFiles.includes(uf.file)) {
                                return {
                                    ...uf,
                                    analysis: result.analyses[index],
                                    status: 'completed' as const
                                };
                            }
                            return uf;
                        })
                    );

                    // 분석 결과 전달
                    result.analyses.forEach((analysis: any, index: number) => {
                        onFileAnalyzed(analysis);
                    });
                }
            } else {
                // 단일 파일 처리
                for (const file of validFiles) {
                    try {
                        const result = await apiService.uploadAndAnalyzeFile(file, context);
                        if (result.success) {
                            setUploadedFiles(prev =>
                                prev.map(uf => {
                                    if (uf.file === file) {
                                        return {
                                            ...uf,
                                            analysis: result.analysis,
                                            status: 'completed' as const
                                        };
                                    }
                                    return uf;
                                })
                            );

                            onFileAnalyzed(result.analysis);
                            onFileUploaded(file);
                        }
                    } catch (error) {
                        setUploadedFiles(prev =>
                            prev.map(uf => {
                                if (uf.file === file) {
                                    return {
                                        ...uf,
                                        status: 'error' as const,
                                        error: '파일 분석 중 오류가 발생했습니다.'
                                    };
                                }
                                return uf;
                            })
                        );
                    }
                }
            }
        } catch (error) {
            console.error('파일 업로드 실패:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const removeFile = (fileToRemove: File) => {
        setUploadedFiles(prev => prev.filter(uf => uf.file !== fileToRemove));
    };

    const getFileIcon = (file: File) => {
        const ext = file.name.toLowerCase().split('.').pop();
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext || '')) {
            return <PhotoIcon className="w-8 h-8 text-blue-500" />;
        }
        if (['txt', 'md', 'doc', 'docx', 'pdf'].includes(ext || '')) {
            return <DocumentTextIcon className="w-8 h-8 text-green-500" />;
        }
        return <DocumentIcon className="w-8 h-8 text-gray-500" />;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'uploading':
                return <ArrowUpTrayIcon className="w-4 h-4 text-blue-500 animate-pulse" />;
            case 'analyzing':
                return <EyeIcon className="w-4 h-4 text-yellow-500 animate-pulse" />;
            case 'completed':
                return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
            case 'error':
                return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
            default:
                return null;
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="w-full">
            {/* 드래그 앤 드롭 영역 */}
            <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragOver
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-900">
                        파일을 여기에 드래그하거나 클릭하여 업로드
                    </p>
                    <p className="text-sm text-gray-500">
                        {multiple ? '여러 파일을 동시에 업로드할 수 있습니다.' : '파일을 하나씩 업로드합니다.'}
                    </p>
                    <p className="text-xs text-gray-400">
                        지원 형식: 텍스트 파일 (.txt, .md, .doc, .docx), 이미지 파일 (.jpg, .png, .gif)
                    </p>
                </div>

                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    파일 선택
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple={multiple}
                    accept={acceptedTypes.join(',')}
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>

            {/* 업로드된 파일 목록 */}
            {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                    <h3 className="text-sm font-medium text-gray-900">업로드된 파일</h3>
                    {uploadedFiles.map((uploadedFile, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                            <div className="flex items-center space-x-3">
                                {getFileIcon(uploadedFile.file)}
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-900">
                                            {uploadedFile.file.name}
                                        </span>
                                        {getStatusIcon(uploadedFile.status)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {formatFileSize(uploadedFile.file.size)}
                                        {uploadedFile.error && (
                                            <span className="text-red-500 ml-2">
                                                {uploadedFile.error}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => removeFile(uploadedFile.file)}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                title="제거"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* 분석 중 표시 */}
            {isAnalyzing && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-blue-700">파일을 분석하고 있습니다...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUploadArea; 