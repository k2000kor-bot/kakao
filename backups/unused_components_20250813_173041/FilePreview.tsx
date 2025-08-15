import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  PhotoIcon,
  DocumentIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface FilePreviewProps {
  file: File;
  onClose: () => void;
  onDownload?: () => void;
}

interface FilePreviewData {
  type: 'text' | 'image' | 'pdf' | 'document' | 'unknown';
  content?: string;
  imageUrl?: string;
  metadata: {
    name: string;
    size: number;
    lastModified: Date;
    type: string;
  };
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onClose, onDownload }) => {
  const [previewData, setPreviewData] = useState<FilePreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    loadFilePreview();
  }, [file]);

  const loadFilePreview = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fileType = getFileType(file.type);
      const data: FilePreviewData = {
        type: fileType,
        metadata: {
          name: file.name,
          size: file.size,
          lastModified: new Date(file.lastModified),
          type: file.type
        }
      };

      if (fileType === 'image') {
        // 이미지 미리보기
        const imageUrl = URL.createObjectURL(file);
        data.imageUrl = imageUrl;
      } else if (fileType === 'text') {
        // 텍스트 파일 미리보기
        const text = await file.text();
        data.content = text;
      } else if (fileType === 'pdf') {
        // PDF 미리보기 (간단한 정보만 표시)
        data.content = `PDF 파일: ${file.name}\n크기: ${(file.size / 1024).toFixed(1)}KB`;
      } else if (fileType === 'document') {
        // 문서 파일 미리보기 (간단한 정보만 표시)
        data.content = `문서 파일: ${file.name}\n크기: ${(file.size / 1024).toFixed(1)}KB\n타입: ${file.type}`;
      }

      setPreviewData(data);
    } catch (err) {
      setError('파일 미리보기를 로드할 수 없습니다.');
      console.error('파일 미리보기 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getFileType = (mimeType: string): 'text' | 'image' | 'pdf' | 'document' | 'unknown' => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.startsWith('text/')) return 'text';
    if (mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('excel') || mimeType.includes('powerpoint')) {
      return 'document';
    }
    return 'unknown';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <PhotoIcon className="w-8 h-8 text-blue-500" />;
      case 'pdf':
        return <DocumentIcon className="w-8 h-8 text-red-500" />;
      case 'text':
        return <DocumentTextIcon className="w-8 h-8 text-green-500" />;
      case 'document':
        return <DocumentIcon className="w-8 h-8 text-purple-500" />;
      default:
        return <DocumentIcon className="w-8 h-8 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">파일 미리보기 로딩 중...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">미리보기 오류</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!previewData) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {getFileIcon(previewData.type)}
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{previewData.metadata.name}</h3>
              <p className="text-sm text-gray-500">
                {formatFileSize(previewData.metadata.size)} • {formatDate(previewData.metadata.lastModified)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {previewData.type === 'image' && (
              <>
                <button
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                  title="축소"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-500">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                  title="확대"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </button>
              </>
            )}
            {onDownload && (
              <button
                onClick={onDownload}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg"
                title="다운로드"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
              title="닫기"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-auto p-4">
          {previewData.type === 'image' && previewData.imageUrl && (
            <div className="flex justify-center">
              <img
                src={previewData.imageUrl}
                alt={previewData.metadata.name}
                className="max-w-full max-h-full object-contain"
                style={{ transform: `scale(${zoom})` }}
              />
            </div>
          )}

          {previewData.type === 'text' && previewData.content && (
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono overflow-auto max-h-96">
                {previewData.content}
              </pre>
            </div>
          )}

          {(previewData.type === 'pdf' || previewData.type === 'document' || previewData.type === 'unknown') && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📄</div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                {previewData.type === 'pdf' ? 'PDF 파일' : 
                 previewData.type === 'document' ? '문서 파일' : '알 수 없는 파일 형식'}
              </h4>
              <p className="text-gray-600 mb-4">
                이 파일 형식은 미리보기를 지원하지 않습니다.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <p className="text-sm text-gray-600">
                  <strong>파일명:</strong> {previewData.metadata.name}<br />
                  <strong>크기:</strong> {formatFileSize(previewData.metadata.size)}<br />
                  <strong>타입:</strong> {previewData.metadata.type}<br />
                  <strong>수정일:</strong> {formatDate(previewData.metadata.lastModified)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreview; 