import React, { useState } from 'react';
import {
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  FolderIcon,
  PlusIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import type { Project, ProjectFile } from '../types/chat';

interface ProjectFileManagerProps {
  project: Project;
  onFileUpload: (files: FileList) => void;
  onFileDelete: (fileId: string) => void;
  onClose: () => void;
}

const ProjectFileManager: React.FC<ProjectFileManagerProps> = ({
  project,
  onFileUpload,
  onFileDelete,
  onClose
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const getFileIcon = (type: ProjectFile['type']) => {
    switch (type) {
      case 'document':
        return <DocumentTextIcon className="w-5 h-5 text-blue-500" />;
      case 'image':
        return <PhotoIcon className="w-5 h-5 text-green-500" />;
      case 'video':
        return <VideoCameraIcon className="w-5 h-5 text-purple-500" />;
      case 'audio':
        return <MusicalNoteIcon className="w-5 h-5 text-orange-500" />;
      default:
        return <FolderIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setIsUploading(true);
      try {
        await onFileUpload(event.target.files);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const totalFileSize = project.files.reduce((acc, file) => acc + file.size, 0);
  const maxFileSize = project.settings.maxFileSize;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">프로젝트 파일</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">파일이 응답에 영향을 줍니다</span>
            </div>
            <p className="text-sm text-gray-600">
              이 프로젝트가 사용하는 파일의 수로 인해 응답의 품질이 저하될 수 있습니다.
            </p>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">파일 목록</span>
              <label className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
                <PlusIcon className="w-4 h-4" />
                <span className="text-sm">파일 추가</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>

            {project.files.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FolderIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>업로드된 파일이 없습니다.</p>
                <p className="text-sm">파일을 추가하여 프로젝트를 시작하세요.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {project.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.type)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onFileDelete(file.id)}
                      className="p-1 hover:bg-red-100 rounded text-red-500"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">총 파일 크기:</span>
              <span className="font-medium">{formatFileSize(totalFileSize)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">최대 파일 크기:</span>
              <span className="font-medium">{formatFileSize(maxFileSize)}</span>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((totalFileSize / maxFileSize) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectFileManager; 