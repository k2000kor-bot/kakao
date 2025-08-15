import React, { useState, useRef } from 'react';
import { useNotifications } from '../context/AppContext';
import { useModalClose } from '../hooks/useModalClose';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (fileInfo: { url: string; filename: string }) => void;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addNotification } = useNotifications();

  const { modalRef, handleClose } = useModalClose({
    isOpen,
    onClose: () => {
      if (isUploading) {
        addNotification({
          type: 'warning',
          title: '업로드 중',
          message: '파일 업로드가 진행 중입니다. 완료 후 닫을 수 있습니다.'
        });
        return;
      }
      onClose();
    },
    preventClose: isUploading
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // 파일 크기 제한 제거 - 모든 크기 허용
        // if (file.size > 10 * 1024 * 1024) {
        //   addNotification({
        //     type: 'error',
        //     title: '파일 크기 초과',
        //     message: `${file.name} 파일이 10MB를 초과합니다.`
        //   });
        //   continue;
        // }

        // 파일 타입 검증
        const allowedTypes = [
          'image/jpeg', 'image/png', 'image/gif',
          'application/pdf', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain'
        ];

        if (!allowedTypes.includes(file.type)) {
          addNotification({
            type: 'error',
            title: '지원하지 않는 파일 형식',
            message: `${file.name} 파일 형식이 지원되지 않습니다.`
          });
          continue;
        }

        addNotification({
          type: 'info',
          title: '파일 업로드 중',
          message: `${file.name} 파일을 업로드하고 있습니다...`
        });

        // 모의 업로드 (실제로는 API 호출)
        await new Promise(resolve => setTimeout(resolve, 2000));

        const mockFileInfo = {
          url: `https://example.com/uploads/${file.name}`,
          filename: file.name
        };

        onUploadSuccess(mockFileInfo);

        addNotification({
          type: 'success',
          title: '업로드 완료',
          message: `${file.name} 파일이 성공적으로 업로드되었습니다.`
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: '업로드 실패',
        message: '파일 업로드 중 오류가 발생했습니다.'
      });
    } finally {
      setIsUploading(false);
      onClose();
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" ref={modalRef}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">파일 업로드</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
            disabled={isUploading}
            aria-label="파일 업로드 모달 닫기"
            title="ESC 키로도 닫을 수 있습니다"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="파일 선택"
        />

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
            } ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={!isUploading ? handleClick : undefined}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">업로드 중...</span>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                파일을 드래그하거나 클릭하여 업로드
              </p>
              <p className="text-sm text-gray-500">
                이미지, PDF, 문서 파일 (최대 10MB)
              </p>
            </>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>• 지원 형식: JPG, PNG, GIF, PDF, DOC, DOCX, TXT</p>
          <p>• 최대 파일 크기: 10MB</p>
          <p>• 개인정보가 포함된 파일은 업로드하지 마세요</p>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal; 