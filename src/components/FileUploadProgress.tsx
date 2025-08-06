import React from 'react';
import { 
  CloudArrowUpIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface FileUploadProgressProps {
  isVisible: boolean;
  progress: number;
  fileName?: string;
  fileSize?: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  onCancel?: () => void;
}

const FileUploadProgress: React.FC<FileUploadProgressProps> = ({
  isVisible,
  progress,
  fileName,
  fileSize,
  status,
  onCancel
}) => {
  if (!isVisible) return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
        return <CloudArrowUpIcon className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'processing':
        return <CloudArrowUpIcon className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <CloudArrowUpIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return '업로드 중...';
      case 'processing':
        return '처리 중...';
      case 'completed':
        return '완료';
      case 'error':
        return '오류 발생';
      default:
        return '대기 중';
    }
  };

  const getProgressColor = () => {
    switch (status) {
      case 'uploading':
        return 'bg-blue-500';
      case 'processing':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <div>
              <p className="text-sm font-medium text-gray-900">{getStatusText()}</p>
              {fileName && (
                <p className="text-xs text-gray-500 truncate max-w-48">{fileName}</p>
              )}
            </div>
          </div>
          {onCancel && status === 'uploading' && (
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
              title="업로드 취소"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>진행률</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {fileSize && (
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>파일 크기</span>
            <span>{formatFileSize(fileSize)}</span>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            파일 업로드 중 오류가 발생했습니다. 다시 시도해주세요.
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadProgress;
