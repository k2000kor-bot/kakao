import React, { useState, useRef } from 'react';
import { useBackendAPI } from '../services/backendAPI';
import { useNotifications } from '../context/AppContext';

interface FileUploadProps {
  onUploadSuccess: (fileInfo: { url: string; filename: string }) => void;
  onUploadError: (error: string) => void;
  accept?: string;
  maxSize?: number; // MB
  multiple?: boolean;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  accept = 'image/*,application/pdf,.doc,.docx,.txt',
  maxSize = 10240, // 10GB (기본값을 매우 큰 값으로 설정)
  multiple = false,
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useBackendAPI();
  const { addNotification } = useNotifications();

  const validateFile = (file: File): boolean => {
    // 파일 크기 제한 제거 - 모든 크기 허용
    // if (file.size > maxSize * 1024 * 1024) {
    //   addNotification({
    //     type: 'error',
    //     title: '파일 크기 초과',
    //     message: `파일 크기는 ${maxSize}MB 이하여야 합니다.`
    //   });
    //   return false;
    // }

    // 파일 타입 검증
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const fileType = file.type;
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    const isAccepted = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        const baseType = type.replace('/*', '');
        return fileType.startsWith(baseType);
      }
      if (type.startsWith('.')) {
        return fileExtension === type;
      }
      return fileType === type;
    });

    if (!isAccepted) {
      addNotification({
        type: 'error',
        title: '지원하지 않는 파일 형식',
        message: '지원되는 파일 형식을 확인해주세요.'
      });
      return false;
    }

    return true;
  };

  const getFileType = (file: File): 'image' | 'file' | 'document' => {
    if (file.type.startsWith('image/')) {
      return 'image';
    }
    if (file.type.includes('pdf') || file.type.includes('document') ||
      file.name.endsWith('.doc') || file.name.endsWith('.docx') ||
      file.name.endsWith('.txt')) {
      return 'document';
    }
    return 'file';
  };

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!validateFile(file)) {
          continue;
        }

        const fileType = getFileType(file);

        addNotification({
          type: 'info',
          title: '파일 업로드 중',
          message: `${file.name} 파일을 업로드하고 있습니다...`
        });

        const response = await uploadFile(file, fileType);

        if (response.success && response.data) {
          onUploadSuccess(response.data);
          addNotification({
            type: 'success',
            title: '업로드 성공',
            message: `${file.name} 파일이 성공적으로 업로드되었습니다.`
          });
        } else {
          onUploadError(response.message || '파일 업로드에 실패했습니다.');
          addNotification({
            type: 'error',
            title: '업로드 실패',
            message: response.message || '파일 업로드에 실패했습니다.'
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '파일 업로드 중 오류가 발생했습니다.';
      onUploadError(errorMessage);
      addNotification({
        type: 'error',
        title: '업로드 오류',
        message: errorMessage
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFileUpload(files);
    }
  };

  const handleDrag = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragActive(true);
    } else if (event.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    const files = event.dataTransfer.files;
    if (files) {
      handleFileUpload(files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`file-upload ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
        aria-label="파일 업로드"
      />

      <div
        className={`upload-area ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          } ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400'
          }`}
        onClick={!isUploading ? handleClick : undefined}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="upload-content">
          {isUploading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">업로드 중...</span>
            </div>
          ) : (
            <>
              <div className="upload-icon">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="upload-text">
                <p className="text-lg font-medium text-gray-900">
                  파일을 드래그하거나 클릭하여 업로드
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {accept.includes('image/*') ? '이미지, ' : ''}
                  {accept.includes('application/pdf') ? 'PDF, ' : ''}
                  {accept.includes('.doc') ? '문서 파일' : ''}
                  (최대 {maxSize}MB)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
};

export default FileUpload; 