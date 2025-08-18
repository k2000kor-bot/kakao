import React from 'react';
import { ProjectFile } from '../types/project';

interface ProjectFilesProps {
    files: ProjectFile[];
    onFileClick?: (file: ProjectFile) => void;
    onFileDelete?: (fileId: string) => void;
}

const ProjectFiles: React.FC<ProjectFilesProps> = ({
    files,
    onFileClick,
    onFileDelete
}) => {
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (type: string): string => {
        switch (type) {
            case 'image':
                return '🖼️';
            case 'document':
                return '📄';
            case 'spreadsheet':
                return '📊';
            case 'video':
                return '🎥';
            case 'audio':
                return '🎵';
            default:
                return '📁';
        }
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (files.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <div className="text-gray-400 text-4xl mb-2">📁</div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">업로드된 파일이 없습니다</h3>
                <p className="text-sm text-gray-500">
                    파일을 업로드하여 프로젝트에서 활용하세요
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">프로젝트 파일</h3>
                <p className="text-sm text-gray-600 mt-1">
                    총 {files.length}개 파일
                </p>
            </div>

            <div className="divide-y divide-gray-200">
                {files.map((file) => (
                    <div
                        key={file.id}
                        className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => onFileClick?.(file)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1">
                                <div className="text-2xl">
                                    {getFileIcon(file.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                        <h4 className="text-sm font-medium text-gray-800 truncate">
                                            {file.name}
                                        </h4>
                                        <span className={`px-2 py-1 text-xs rounded-full ${file.status === 'uploaded'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {file.status === 'uploaded' ? '완료' : '처리중'}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                        <span>{formatFileSize(file.size)}</span>
                                        <span>{file.type}</span>
                                        <span>{formatDate(file.uploadedAt.toString())}</span>
                                    </div>

                                    {file.description && (
                                        <p className="text-xs text-gray-600 mt-1 truncate">
                                            {file.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {onFileDelete && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onFileDelete(file.id);
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    title="파일 삭제"
                                >
                                    🗑️
                                </button>
                            )}
                        </div>

                        {file.tags && file.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {file.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectFiles;
