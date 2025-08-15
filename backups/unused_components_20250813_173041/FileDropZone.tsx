import React, { useState, useRef, useCallback } from 'react';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  PhotoIcon,
  FilmIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/outline';

interface FileDropZoneProps {
  onFilesDrop: (files: FileList) => void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // bytes
  disabled?: boolean;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({
  onFilesDrop,
  accept = '*',
  maxFiles = 10,
  maxSize = 100 * 1024 * 1024, // 100MB
  disabled = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter === 0) {
      setIsDragOver(false);
    }
  }, [dragCounter]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragCounter(0);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndProcessFiles(files);
    }
  }, [disabled]);

  const validateAndProcessFiles = (files: FileList) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file, index) => {
      // 파일 개수 체크
      if (index >= maxFiles) {
        errors.push(`최대 ${maxFiles}개 파일만 업로드 가능합니다.`);
        return;
      }

      // 파일 크기 체크
      if (file.size > maxSize) {
        errors.push(`${file.name}: 파일 크기가 너무 큽니다. (최대 ${formatFileSize(maxSize)})`);
        return;
      }

      // 파일 타입 체크 (간단한 확장자 체크)
      if (accept !== '*') {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        const acceptedTypes = accept.split(',').map(type =>
          type.trim().replace('*', '').replace('.', '')
        );

        if (fileExtension && !acceptedTypes.includes(fileExtension)) {
          errors.push(`${file.name}: 지원하지 않는 파일 형식입니다.`);
          return;
        }
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      alert('파일 업로드 오류:\n' + errors.join('\n'));
      return;
    }

    if (validFiles.length > 0) {
      // FileList를 시뮬레이션
      const dataTransfer = new DataTransfer();
      validFiles.forEach(file => dataTransfer.items.add(file));
      onFilesDrop(dataTransfer.files);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFiles(e.target.files);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getFileTypeIcon = () => {
    const acceptedTypes = accept.toLowerCase();
    if (acceptedTypes.includes('image')) return <PhotoIcon className="w-8 h-8 text-blue-500" />;
    if (acceptedTypes.includes('video')) return <FilmIcon className="w-8 h-8 text-purple-500" />;
    if (acceptedTypes.includes('audio')) return <MusicalNoteIcon className="w-8 h-8 text-green-500" />;
    return <DocumentIcon className="w-8 h-8 text-gray-500" />;
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${isDragOver
        ? 'border-blue-500 bg-blue-50'
        : disabled
          ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
          : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 cursor-pointer'
        }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
        aria-label="파일 업로드"
      />

      <div className="space-y-4">
        <div className="flex justify-center">
          {isDragOver ? (
            <CloudArrowUpIcon className="w-12 h-12 text-blue-500 animate-pulse" />
          ) : (
            getFileTypeIcon()
          )}
        </div>

        <div>
          <p className="text-lg font-medium text-gray-900">
            {isDragOver ? '파일을 여기에 놓으세요' : '파일을 드래그하거나 클릭하여 업로드'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            최대 {maxFiles}개 파일, 각 파일 {formatFileSize(maxSize)} 이하
          </p>
          {accept !== '*' && (
            <p className="text-xs text-gray-400 mt-1">
              지원 형식: {accept}
            </p>
          )}
        </div>

        {isDragOver && (
          <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center">
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <CloudArrowUpIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">파일을 여기에 놓으세요</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileDropZone;
