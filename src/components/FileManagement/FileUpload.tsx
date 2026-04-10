import React, { useState, useCallback, useRef } from 'react';
import {
    Upload,
    File,
    Image,
    Video,
    Music,
    Archive,
    X,
    Download,
    Eye,
    Trash2,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileItem {
    id: string;
    name: string;
    type: string;
    size: number;
    url?: string;
    uploadedAt: Date;
    status: 'uploading' | 'success' | 'error';
    progress?: number;
    error?: string;
}

interface FileUploadProps {
    files: FileItem[];
    onFilesAdd: (files: File[]) => void;
    onFileRemove: (fileId: string) => void;
    onFileDownload?: (fileId: string) => void;
    onFilePreview?: (fileId: string) => void;
    maxFiles?: number;
    maxFileSize?: number; // in MB
    allowedTypes?: string[];
    projectId?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
    files,
    onFilesAdd,
    onFileRemove,
    onFileDownload,
    onFilePreview,
    maxFiles = 10,
    maxFileSize = 50, // 50MB
    allowedTypes = ['*'],
    projectId: _projectId
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return <Image className="h-5 w-5 bw-text-info" />;
        if (type.startsWith('video/')) return <Video className="h-5 w-5 bw-text-info" />;
        if (type.startsWith('audio/')) return <Music className="h-5 w-5 bw-text-success" />;
        if (type.includes('zip') || type.includes('rar') || type.includes('tar')) {
            return <Archive className="h-5 w-5 bw-text-warning" />;
        }
        return <File className="h-5 w-5 bw-text-muted" />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const validateFile = (file: File): string | null => {
        // 파일 크기 검증
        if (file.size > maxFileSize * 1024 * 1024) {
            return `파일 크기가 ${maxFileSize}MB를 초과합니다.`;
        }

        // 파일 타입 검증
        if (allowedTypes[0] !== '*' && !allowedTypes.some(type => {
            if (type.includes('*')) {
                return file.type.startsWith(type.replace('*', ''));
            }
            return file.type === type;
        })) {
            return `지원하지 않는 파일 타입입니다.`;
        }

        return null;
    };

    const handleFiles = useCallback((fileList: FileList) => {
        const newFiles = Array.from(fileList);
        const errors: string[] = [];

        // 파일 개수 검증
        if (files.length + newFiles.length > maxFiles) {
            errors.push(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
        }

        // 각 파일 검증
        newFiles.forEach(file => {
            const error = validateFile(file);
            if (error) {
                errors.push(`${file.name}: ${error}`);
            }
        });

        if (errors.length > 0) {
            setUploadError(errors.join('\n'));
            return;
        }

        setUploadError(null);
        onFilesAdd(newFiles);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [files.length, maxFiles, allowedTypes, onFilesAdd]);

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
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFiles(files);
        }
    }, [handleFiles]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFiles(files);
        }
        // Reset input value to allow selecting the same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [handleFiles]);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const getFileStatusIcon = (status: string) => {
        switch (status) {
            case 'uploading':
                return <div className="bw-spinner" />;
            case 'success':
                return <CheckCircle className="h-4 w-4 bw-text-success" />;
            case 'error':
                return <AlertCircle className="h-4 w-4 bw-text-error" />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragOver ? 'bw-card-secondary' : ''}`}
                style={{ borderColor: isDragOver ? 'var(--accent-info)' : 'var(--border-color)' }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept={allowedTypes.join(',')}
                    aria-label="파일 선택"
                />

                <div className="space-y-3">
                    <Upload className="h-12 w-12 bw-text-muted mx-auto" />
                    <div>
                        <p className="text-lg font-medium bw-text-primary">
                            파일을 드래그 앤 드롭하거나 클릭하여 업로드
                        </p>
                        <p className="text-sm bw-text-secondary mt-1">
                            최대 {maxFiles}개 파일, 각 파일 {maxFileSize}MB 이하
                        </p>
                    </div>
                    <button type="button" onClick={handleUploadClick} className="bw-btn-primary px-4 py-2 rounded-lg" aria-label="파일 선택">
                        파일 선택
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {uploadError && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bw-alert-error rounded-lg p-4"
                    >
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="h-5 w-5 bw-text-error mt-0.5" />
                            <div className="flex-1">
                                <h3 className="text-sm font-medium bw-text-error">업로드 오류</h3>
                                <p className="text-sm bw-text-secondary mt-1 whitespace-pre-line">{uploadError}</p>
                            </div>
                            <button type="button" onClick={() => setUploadError(null)} className="bw-btn-ghost bw-text-error" aria-label="업로드 오류 메시지 닫기">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {files.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-medium bw-text-primary">
                        업로드된 파일 ({files.length}/{maxFiles})
                    </h3>
                    <div className="space-y-2">
                        <AnimatePresence>
                            {files.map((file) => (
                                <motion.div
                                    key={file.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center space-x-3 p-3 bw-card-secondary rounded-lg"
                                >
                                    {getFileIcon(file.type)}

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2">
                                            <p className="text-sm font-medium bw-text-primary truncate">
                                                {file.name}
                                            </p>
                                            {getFileStatusIcon(file.status)}
                                        </div>
                                        <p className="text-xs bw-text-muted">
                                            {formatFileSize(file.size)} • {file.uploadedAt.toLocaleDateString()}
                                        </p>
                                        {file.error && (
                                            <p className="text-xs bw-text-error mt-1">{file.error}</p>
                                        )}
                                        {file.status === 'uploading' && file.progress !== undefined && (
                                            <div className="mt-2">
                                                <div className="w-full bw-progress-bar rounded-full h-2">
                                                    <div
                                                        className="bw-progress-fill h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${file.progress}%`, background: 'var(--accent-info)' }}
                                                    />
                                                </div>
                                                <p className="text-xs bw-text-muted mt-1">{file.progress}%</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-1">
                                        {file.status === 'success' && (
                                            <>
                                                {onFilePreview && (
                                                    <button type="button" onClick={() => onFilePreview(file.id)} className="bw-btn-ghost p-1 rounded" title="미리보기" aria-label={`${file.name} 미리보기`}>
                                                        <Eye className="h-4 w-4 bw-text-muted" />
                                                    </button>
                                                )}
                                                {onFileDownload && (
                                                    <button type="button" onClick={() => onFileDownload(file.id)} className="bw-btn-ghost p-1 rounded" title="다운로드" aria-label={`${file.name} 다운로드`}>
                                                        <Download className="h-4 w-4 bw-text-muted" />
                                                    </button>
                                                )}
                                            </>
                                        )}
                                        <button type="button" onClick={() => onFileRemove(file.id)} className="bw-btn-ghost p-1 rounded bw-text-error" title="삭제" aria-label={`${file.name} 삭제`}>
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
