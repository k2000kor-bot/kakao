import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, Image, FileText, Music, Video, Archive } from 'lucide-react';

interface FileWithPreview extends File {
    id: string;
    preview?: string;
    progress?: number;
}

interface AdvancedFileUploadProps {
    onFilesUploaded: (files: FileWithPreview[]) => void;
    onFileRemove: (fileId: string) => void;
    maxFiles?: number;
    maxSize?: number; // MB
    acceptedTypes?: string[];
}

const AdvancedFileUpload: React.FC<AdvancedFileUploadProps> = ({
    onFilesUploaded,
    onFileRemove,
    maxFiles = 10,
    maxSize = 50,
    acceptedTypes = ['image/*', 'application/pdf', 'text/*', 'audio/*', 'video/*']
}) => {
    const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles: FileWithPreview[] = acceptedFiles.map(file => ({
            ...file,
            id: `${Date.now()}-${Math.random()}`,
            progress: 0
        }));

        // 파일 미리보기 생성
        newFiles.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = () => {
                    file.preview = reader.result as string;
                };
                reader.readAsDataURL(file);
            }
        });

        setUploadedFiles(prev => [...prev, ...newFiles]);
        onFilesUploaded(newFiles);
    }, [onFilesUploaded]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles,
        maxSize: maxSize * 1024 * 1024, // MB to bytes
        accept: acceptedTypes.reduce((acc, type) => {
            acc[type] = [];
            return acc;
        }, {} as Record<string, string[]>)
    });

    const removeFile = (fileId: string) => {
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
        onFileRemove(fileId);
    };

    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image/')) return <Image size={20} />;
        if (file.type.startsWith('video/')) return <Video size={20} />;
        if (file.type.startsWith('audio/')) return <Music size={20} />;
        if (file.type.includes('pdf')) return <FileText size={20} />;
        if (file.type.includes('zip') || file.type.includes('rar')) return <Archive size={20} />;
        return <File size={20} />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-4">
            {/* 드래그 앤 드롭 영역 */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
            >
                <input {...getInputProps()} />
                <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                    {isDragActive ? '파일을 여기에 놓으세요' : '파일을 드래그하거나 클릭하여 업로드'}
                </p>
                <p className="text-sm text-gray-500">
                    최대 {maxFiles}개 파일, 각각 {maxSize}MB까지
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    지원 형식: 이미지, PDF, 텍스트, 오디오, 비디오
                </p>
            </div>

            {/* 업로드된 파일 목록 */}
            <AnimatePresence>
                {uploadedFiles.map((file) => (
                    <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border"
                    >
                        {/* 파일 아이콘 */}
                        <div className="flex-shrink-0 text-gray-500">
                            {getFileIcon(file)}
                        </div>

                        {/* 파일 정보 */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                            </p>
                        </div>

                        {/* 진행률 표시 */}
                        {file.progress !== undefined && file.progress < 100 && (
                            <div className="flex-shrink-0 w-16">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <motion.div
                                        className="bg-blue-500 h-2 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${file.progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* 삭제 버튼 */}
                        <button
                            onClick={() => removeFile(file.id)}
                            className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* 이미지 미리보기 */}
            {uploadedFiles.some(file => file.preview) && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {uploadedFiles
                        .filter(file => file.preview)
                        .map((file) => (
                            <motion.div
                                key={file.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative group"
                            >
                                <img
                                    src={file.preview}
                                    alt={file.name}
                                    className="w-full h-24 object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                                    <button
                                        onClick={() => removeFile(file.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1 bg-red-500 text-white rounded-full transition-opacity"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                </div>
            )}
        </div>
    );
};

export default AdvancedFileUpload;
