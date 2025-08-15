import React, { useState, useEffect } from 'react';
import {
  DocumentIcon,
  PhotoIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  FolderIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { fetchFileList, uploadFile, deleteFile } from '../services/fileService';
import { useModalClose } from '../hooks/useModalClose';

interface FileManagerModalProps {
  open: boolean;
  onClose: () => void;
}

interface FileInfo {
  name: string;
  type: string;
  size?: number;
  uploadedAt?: string;
  category?: string;
}

interface CategoryInfo {
  name: string;
  icon: React.ReactNode;
  color: string;
  files: FileInfo[];
}

const FileManagerModal: React.FC<FileManagerModalProps> = ({ open, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileList, setFileList] = useState<FileInfo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['all']));
  const [viewMode, setViewMode] = useState<'list' | 'category'>('category');

  const { modalRef, handleClose } = useModalClose({
    isOpen: open,
    onClose: () => {
      if (isUploading) {
        if (window.confirm('파일 업로드가 진행 중입니다. 정말로 닫으시겠습니까?')) {
          onClose();
        }
      } else {
        onClose();
      }
    },
    showConfirm: isUploading,
    confirmMessage: '파일 업로드가 진행 중입니다. 정말로 닫으시겠습니까?'
  });

  useEffect(() => {
    if (open) {
      loadFileList();
    }
  }, [open]);

  const loadFileList = async () => {
    try {
      const list = await fetchFileList();
      const fileInfos: FileInfo[] = list.map(filename => ({
        name: filename,
        type: getFileType(filename),
        size: Math.floor(Math.random() * 10) + 1,
        uploadedAt: new Date().toLocaleDateString(),
        category: getFileCategory(filename)
      }));
      setFileList(fileInfos);
    } catch (e) {
      setError('파일 리스트 로드 실패');
    }
  };

  const getFileType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'PDF 문서';
      case 'doc':
      case 'docx': return 'Word 문서';
      case 'txt': return '텍스트 파일';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '이미지 파일';
      default: return '기타 파일';
    }
  };

  const getFileCategory = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
      case 'doc':
      case 'docx':
      case 'txt': return 'documents';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'images';
      default: return 'others';
    }
  };

  const getCategoryInfo = (category: string): CategoryInfo => {
    switch (category) {
      case 'documents':
        return {
          name: '문서',
          icon: <DocumentIcon className="w-5 h-5 text-blue-500" />,
          color: 'bg-blue-50 text-blue-700',
          files: fileList.filter(f => f.category === 'documents')
        };
      case 'images':
        return {
          name: '이미지',
          icon: <PhotoIcon className="w-5 h-5 text-green-500" />,
          color: 'bg-green-50 text-green-700',
          files: fileList.filter(f => f.category === 'images')
        };
      case 'others':
        return {
          name: '기타',
          icon: <FolderIcon className="w-5 h-5 text-gray-500" />,
          color: 'bg-gray-50 text-gray-700',
          files: fileList.filter(f => f.category === 'others')
        };
      default:
        return {
          name: '전체',
          icon: <FolderIcon className="w-5 h-5 text-purple-500" />,
          color: 'bg-purple-50 text-purple-700',
          files: fileList
        };
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('이미지')) return <PhotoIcon className="w-5 h-5 text-blue-500" />;
    return <DocumentIcon className="w-5 h-5 text-gray-500" />;
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif'
      ];

      if (!allowedTypes.includes(selectedFile.type)) {
        setError('지원하지 않는 파일 형식입니다. (PDF, DOC, DOCX, TXT, 이미지 파일만 가능)');
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      await uploadFile(file);

      setUploadProgress(100);
      setTimeout(() => {
        const newFile: FileInfo = {
          name: file.name,
          type: getFileType(file.name),
          size: Math.floor(file.size / 1024 / 1024 * 100) / 100,
          uploadedAt: new Date().toLocaleDateString(),
          category: getFileCategory(file.name)
        };

        setFileList(prev => [...prev, newFile]);
        setFile(null);
        setSuccess(`파일이 성공적으로 업로드되었습니다. (${getCategoryInfo(newFile.category!).name} 폴더로 분류됨)`);
        setUploadProgress(0);
        setTimeout(() => setSuccess(null), 3000);
      }, 500);
    } catch (e) {
      setError('업로드 실패');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    setShowDeleteConfirm(filename);
  };

  const confirmDelete = async () => {
    if (!showDeleteConfirm) return;

    setIsDeleting(showDeleteConfirm);
    setError(null);

    try {
      await deleteFile(showDeleteConfirm);
      setFileList(prev => prev.filter(f => f.name !== showDeleteConfirm));
      setSuccess('파일이 성공적으로 삭제되었습니다.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      setError('파일 삭제 실패');
    } finally {
      setIsDeleting(null);
      setShowDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  const handleDownload = (filename: string) => {
    const link = document.createElement('a');
    link.href = `data:text/plain;charset=utf-8,${encodeURIComponent('모의 파일 내용')}`;
    link.download = filename;
    link.click();
  };

  const handleFileSelect = (fileInfo: FileInfo) => {
    setSelectedFile(fileInfo);
  };

  const categories = ['all', 'documents', 'images', 'others'];

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-lg shadow-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">파일 업로드 및 관리</h2>
          <button 
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="파일 관리 모달 닫기"
            title="ESC 키로도 닫을 수 있습니다"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* 성공/에러 메시지 */}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 파일 업로드 섹션 */}
          <div>
            <h3 className="text-md font-semibold mb-3">파일 업로드</h3>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                파일 선택 (PDF, DOC, DOCX, TXT, 이미지 파일)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  onChange={handleFileChange}
                  aria-label="파일 선택"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                  className="flex-1"
                />
                <button
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300 text-sm"
                >
                  {isUploading ? '업로드 중...' : '업로드'}
                </button>
              </div>

              {file && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {getFileIcon(getFileType(file.name))}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)}MB
                      </p>
                      <p className="text-xs text-blue-600">
                        자동 분류: {getCategoryInfo(getFileCategory(file.name)).name}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 업로드 진행률 */}
              {uploadProgress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>

          {/* 파일 리스트 섹션 */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-semibold">파일 목록</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 text-xs rounded ${viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                    }`}
                >
                  목록 보기
                </button>
                <button
                  onClick={() => setViewMode('category')}
                  className={`px-3 py-1 text-xs rounded ${viewMode === 'category'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                    }`}
                >
                  분류 보기
                </button>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto border rounded-lg">
              {fileList.length === 0 ? (
                <div className="text-gray-400 text-sm py-8 text-center">파일이 없습니다.</div>
              ) : viewMode === 'category' ? (
                // 분류별 보기
                <div className="divide-y divide-gray-200">
                  {categories.map(category => {
                    const categoryInfo = getCategoryInfo(category);
                    const isExpanded = expandedCategories.has(category);

                    return (
                      <div key={category} className="p-3">
                        <button
                          onClick={() => toggleCategory(category)}
                          className="flex items-center justify-between w-full text-left hover:bg-gray-50 p-2 rounded"
                        >
                          <div className="flex items-center space-x-2">
                            {isExpanded ? (
                              <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                            )}
                            {categoryInfo.icon}
                            <span className="font-medium">{categoryInfo.name}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${categoryInfo.color}`}>
                              {categoryInfo.files.length}개
                            </span>
                          </div>
                        </button>

                        {isExpanded && categoryInfo.files.length > 0 && (
                          <div className="ml-6 mt-2 space-y-1">
                            {categoryInfo.files.map((fileInfo, idx) => (
                              <div
                                key={idx}
                                className="p-2 hover:bg-gray-50 cursor-pointer rounded"
                                onClick={() => handleFileSelect(fileInfo)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2 flex-1">
                                    {getFileIcon(fileInfo.type)}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {fileInfo.name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {fileInfo.size}MB • {fileInfo.uploadedAt}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownload(fileInfo.name);
                                      }}
                                      className="p-1 text-gray-400 hover:text-blue-600"
                                      title="다운로드"
                                    >
                                      <ArrowDownTrayIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(fileInfo.name);
                                      }}
                                      disabled={isDeleting === fileInfo.name}
                                      className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                                      title="삭제"
                                    >
                                      <TrashIcon className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                // 목록 보기
                <div className="divide-y divide-gray-200">
                  {fileList.map((fileInfo, idx) => (
                    <div
                      key={idx}
                      className="p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleFileSelect(fileInfo)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          {getFileIcon(fileInfo.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {fileInfo.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {fileInfo.type} • {fileInfo.size}MB • {fileInfo.uploadedAt}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(fileInfo.name);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="다운로드"
                          >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(fileInfo.name);
                            }}
                            disabled={isDeleting === fileInfo.name}
                            className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                            title="삭제"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 선택된 파일 상세 정보 */}
        {selectedFile && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">파일 상세 정보</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">파일명:</span>
                <p className="text-gray-900">{selectedFile.name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">파일 타입:</span>
                <p className="text-gray-900">{selectedFile.type}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">파일 크기:</span>
                <p className="text-gray-900">{selectedFile.size}MB</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">분류:</span>
                <p className="text-gray-900">{getCategoryInfo(selectedFile.category!).name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">업로드 날짜:</span>
                <p className="text-gray-900">{selectedFile.uploadedAt}</p>
              </div>
            </div>
          </div>
        )}

        {/* 삭제 확인 다이얼로그 */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">파일 삭제 확인</h3>
              <p className="text-gray-700 mb-6">
                "{showDeleteConfirm}" 파일을 삭제하시겠습니까?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  취소
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileManagerModal; 