import React, { useState, useRef, useCallback, useEffect } from 'react';
import { CloudArrowUpIcon, DocumentIcon, PhotoIcon, VideoCameraIcon, MusicalNoteIcon, XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface FileInfo {
    id: string;
    file: File;
    name: string;
    size: number;
    type: string;
    status: 'uploading' | 'analyzing' | 'completed' | 'failed';
    progress: number;
    analysis?: any;
    error?: string;
}

interface EnhancedMediaFileUploadProps {
    onFilesUploaded: (files: FileInfo[]) => void;
    onFileAnalyzed: (fileId: string, analysis: any) => void;
    onFileError: (fileId: string, error: string) => void;
    maxFileSize?: number; // MB
    allowedTypes?: string[];
    multiple?: boolean;
    className?: string;
    theme?: 'default' | 'minimal' | 'professional';
}

const EnhancedMediaFileUpload: React.FC<EnhancedMediaFileUploadProps> = ({
    onFilesUploaded,
    onFileAnalyzed,
    onFileError,
    maxFileSize = 50, // 50MB
    allowedTypes = ['image/*', 'video/*', 'audio/*', '.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx'],
    multiple = true,
    className = '',
    theme = 'default'
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [files, setFiles] = useState<FileInfo[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 파일 유효성 검사
    const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
        // 파일 크기 검사
        if (file.size > maxFileSize * 1024 * 1024) {
            return { valid: false, error: `파일 크기가 ${maxFileSize}MB를 초과합니다.` };
        }

        // 파일 타입 검사
        const isValidType = allowedTypes.some(type => {
            if (type.includes('*')) {
                return file.type.startsWith(type.replace('*', ''));
            }
            return file.name.toLowerCase().endsWith(type.replace('.', ''));
        });

        if (!isValidType) {
            return { valid: false, error: '지원하지 않는 파일 형식입니다.' };
        }

        return { valid: true };
    }, [maxFileSize, allowedTypes]);

    // 파일 타입별 아이콘 반환
    const getFileIcon = useCallback((file: File) => {
        const type = file.type;
        if (type.startsWith('image/')) return PhotoIcon;
        if (type.startsWith('video/')) return VideoCameraIcon;
        if (type.startsWith('audio/')) return MusicalNoteIcon;
        return DocumentIcon;
    }, []);

    // 파일 크기 포맷팅
    const formatFileSize = useCallback((bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);

    // 파일 업로드 처리
    const handleFiles = useCallback(async (fileList: FileList) => {
        const newFiles: FileInfo[] = [];
        const validFiles: File[] = [];

        // 파일 유효성 검사
        Array.from(fileList).forEach(file => {
            const validation = validateFile(file);
            if (validation.valid) {
                const fileInfo: FileInfo = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    file,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    status: 'uploading',
                    progress: 0
                };
                newFiles.push(fileInfo);
                validFiles.push(file);
            } else {
                console.error(`파일 ${file.name}: ${validation.error}`);
            }
        });

        if (newFiles.length === 0) return;

        setFiles(prev => [...prev, ...newFiles]);
        setIsProcessing(true);

        // 각 파일에 대해 업로드 및 분석 진행
        for (const fileInfo of newFiles) {
            try {
                // 업로드 진행률 시뮬레이션
                for (let progress = 0; progress <= 100; progress += 10) {
                    setFiles(prev => prev.map(f =>
                        f.id === fileInfo.id
                            ? { ...f, progress, status: progress === 100 ? 'analyzing' : 'uploading' }
                            : f
                    ));
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                // 파일 분석 시뮬레이션
                setFiles(prev => prev.map(f =>
                    f.id === fileInfo.id
                        ? { ...f, status: 'analyzing' }
                        : f
                ));

                // 분석 시간 시뮬레이션
                await new Promise(resolve => setTimeout(resolve, 2000));

                // 분석 결과 생성
                const analysis = await generateFileAnalysis(fileInfo.file);

                setFiles(prev => prev.map(f =>
                    f.id === fileInfo.id
                        ? { ...f, status: 'completed', analysis }
                        : f
                ));

                onFileAnalyzed(fileInfo.id, analysis);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : '파일 처리 중 오류가 발생했습니다.';
                setFiles(prev => prev.map(f =>
                    f.id === fileInfo.id
                        ? { ...f, status: 'failed', error: errorMessage }
                        : f
                ));
                onFileError(fileInfo.id, errorMessage);
            }
        }

        setIsProcessing(false);
        onFilesUploaded(newFiles);
    }, [validateFile, onFileAnalyzed, onFileError, onFilesUploaded]);

    // 파일 분석 함수
    const generateFileAnalysis = async (file: File): Promise<any> => {
        // 실제 구현에서는 백엔드 API 호출
        return new Promise((resolve) => {
            setTimeout(() => {
                const analysis = {
                    type: file.type.startsWith('image/') ? 'image' :
                        file.type.startsWith('video/') ? 'video' :
                            file.type.startsWith('audio/') ? 'audio' : 'document',
                    size: formatFileSize(file.size),
                    dimensions: file.type.startsWith('image/') ? '1920x1080' : undefined,
                    duration: file.type.startsWith('video/') || file.type.startsWith('audio/') ? '3:45' : undefined,
                    content: `분석된 ${file.name} 파일의 내용 요약...`,
                    tags: ['업로드됨', '분석완료'],
                    confidence: Math.random() * 0.3 + 0.7 // 70-100%
                };
                resolve(analysis);
            }, 1000);
        });
    };

    // 드래그 앤 드롭 이벤트 핸들러
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

    // 파일 선택 핸들러
    const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            handleFiles(files);
        }
        // 입력 필드 초기화
        if (event.target) {
            event.target.value = '';
        }
    }, [handleFiles]);

    // 파일 제거
    const removeFile = useCallback((fileId: string) => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
    }, []);

    // 테마별 스타일 클래스
    const getThemeClasses = () => {
        switch (theme) {
            case 'minimal':
                return {
                    container: 'bg-white border border-gray-200 rounded-lg',
                    dragArea: 'border-2 border-dashed border-gray-300 hover:border-gray-400',
                    dragActive: 'border-blue-500 bg-blue-50',
                    button: 'bg-gray-900 text-white hover:bg-gray-800',
                    fileItem: 'bg-gray-50 border border-gray-200'
                };
            case 'professional':
                return {
                    container: 'bg-white shadow-lg border border-gray-200 rounded-xl',
                    dragArea: 'border-2 border-dashed border-gray-300 hover:border-gray-400',
                    dragActive: 'border-blue-500 bg-blue-50',
                    button: 'bg-blue-600 text-white hover:bg-blue-700',
                    fileItem: 'bg-white border border-gray-200 shadow-sm'
                };
            default:
                return {
                    container: 'bg-white border border-gray-200 rounded-lg',
                    dragArea: 'border-2 border-dashed border-gray-300 hover:border-gray-400',
                    dragActive: 'border-blue-500 bg-blue-50',
                    button: 'bg-blue-500 text-white hover:bg-blue-600',
                    fileItem: 'bg-gray-50 border border-gray-200'
                };
        }
    };

    const themeClasses = getThemeClasses();

    return (
        <div className={`${themeClasses.container} ${className}`}>
            {/* 드래그 앤 드롭 영역 */}
            <div
                className={`p-6 text-center transition-all duration-200 ${isDragOver ? themeClasses.dragActive : themeClasses.dragArea}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />

                <div className="space-y-2">
                    <h3 className="text-lg font-medium text-gray-900">
                        파일을 여기에 드래그하거나 클릭하여 업로드
                    </h3>
                    <p className="text-sm text-gray-500">
                        이미지, 비디오, 오디오, 문서 파일을 지원합니다
                    </p>
                    <p className="text-xs text-gray-400">
                        최대 {maxFileSize}MB, {multiple ? '여러 파일' : '단일 파일'} 업로드 가능
                    </p>
                </div>

                <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`mt-4 px-6 py-2 rounded-lg transition-colors ${themeClasses.button}`}
                    disabled={isProcessing}
                >
                    {isProcessing ? '처리 중...' : '파일 선택'}
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple={multiple}
                    accept={allowedTypes.join(',')}
                    onChange={handleFileSelect}
                    className="hidden"
                    aria-label="파일 업로드"
                    title="파일을 선택하세요"
                />
            </div>

            {/* 업로드된 파일 목록 */}
            {files.length > 0 && (
                <div className="p-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">업로드된 파일</h4>
                    <div className="space-y-2">
                        {files.map((fileInfo) => {
                            const IconComponent = getFileIcon(fileInfo.file);

                            return (
                                <div key={fileInfo.id} className={`p-3 rounded-lg ${themeClasses.fileItem}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <IconComponent className="w-8 h-8 text-gray-500" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {fileInfo.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatFileSize(fileInfo.size)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            {/* 상태 표시 */}
                                            {fileInfo.status === 'uploading' && (
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                    <span className="text-xs text-blue-600">{fileInfo.progress}%</span>
                                                </div>
                                            )}

                                            {fileInfo.status === 'analyzing' && (
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                                                    <span className="text-xs text-yellow-600">분석 중</span>
                                                </div>
                                            )}

                                            {fileInfo.status === 'completed' && (
                                                <div className="flex items-center space-x-2">
                                                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                                    <span className="text-xs text-green-600">완료</span>
                                                </div>
                                            )}

                                            {fileInfo.status === 'failed' && (
                                                <div className="flex items-center space-x-2">
                                                    <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                                                    <span className="text-xs text-red-600">오류</span>
                                                </div>
                                            )}

                                            {/* 제거 버튼 */}
                                            <button
                                                onClick={() => removeFile(fileInfo.id)}
                                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                title="파일 제거"
                                            >
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* 진행률 바 */}
                                    {fileInfo.status === 'uploading' && (
                                        <div className="mt-2">
                                            <div className="w-full bg-gray-200 rounded-full h-1">
                                                <div
                                                    className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                                                    style={{ width: `${fileInfo.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 분석 결과 */}
                                    {fileInfo.status === 'completed' && fileInfo.analysis && (
                                        <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
                                            <p className="font-medium">분석 완료</p>
                                            <p>{fileInfo.analysis.content}</p>
                                        </div>
                                    )}

                                    {/* 오류 메시지 */}
                                    {fileInfo.status === 'failed' && fileInfo.error && (
                                        <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                                            <p className="font-medium">오류 발생</p>
                                            <p>{fileInfo.error}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnhancedMediaFileUpload;
