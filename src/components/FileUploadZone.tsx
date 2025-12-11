/**
 * 파일 업로드 존 컴포넌트
 * 드래그 앤 드롭, 미리보기, 다중 파일 업로드 지원
 * 
 * Task-G1: 파일 업로드 기능 개선
 */

import React, { useState, useCallback, useRef, DragEvent } from 'react';
import './FileUploadZone.css';

export interface FileUploadResult {
  file: File;
  preview?: string;
  type: 'image' | 'document' | 'other';
}

interface FileUploadZoneProps {
  onFilesSelected: (files: FileUploadResult[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // bytes
  maxFiles?: number;
  disabled?: boolean;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFilesSelected,
  accept = '*/*',
  multiple = true,
  maxSize = 10 * 1024 * 1024, // 10MB 기본
  maxFiles = 5,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<Map<string, string>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `파일 크기가 너무 큽니다. 최대 ${(maxSize / 1024 / 1024).toFixed(1)}MB까지 업로드 가능합니다.`;
    }
    return null;
  }, [maxSize]);

  const getFileType = useCallback((file: File): FileUploadResult['type'] => {
    if (file.type.startsWith('image/')) {
      return 'image';
    }
    if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) {
      return 'document';
    }
    return 'other';
  }, []);

  const createPreview = useCallback((file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  }, []);

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    if (fileArray.length > maxFiles) {
      alert(`최대 ${maxFiles}개까지 업로드할 수 있습니다.`);
      return;
    }

    const validFiles: FileUploadResult[] = [];
    const previewMap = new Map<string, string>();

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        alert(`${file.name}: ${error}`);
        continue;
      }

      const type = getFileType(file);
      const preview = await createPreview(file);
      
      if (preview) {
        previewMap.set(file.name, preview);
      }

      validFiles.push({
        file,
        preview,
        type,
      });
    }

    if (validFiles.length > 0) {
      setPreviews(previewMap);
      onFilesSelected(validFiles);
    }
  }, [maxFiles, validateFile, getFileType, createPreview, onFilesSelected]);

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [disabled, processFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFiles]);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };

  return (
    <div
      className={`file-upload-zone ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="파일 업로드 영역"
      aria-disabled={disabled}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInputChange}
        className="file-input-hidden"
        aria-hidden="true"
        disabled={disabled}
      />
      
      <div className="upload-zone-content">
        <div className="upload-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <div className="upload-text">
          <p className="upload-title">
            {isDragging ? '파일을 여기에 놓으세요' : '파일을 드래그하거나 클릭하여 업로드'}
          </p>
          <p className="upload-hint">
            {multiple ? `최대 ${maxFiles}개 파일, 각 ${formatFileSize(maxSize)}까지` : `최대 ${formatFileSize(maxSize)}`}
          </p>
        </div>
      </div>

      {previews.size > 0 && (
        <div className="upload-previews">
          {Array.from(previews.entries()).map(([name, preview]) => (
            <div key={name} className="preview-item">
              <img src={preview} alt={name} className="preview-image" />
              <span className="preview-name">{name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;

