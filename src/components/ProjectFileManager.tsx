import React, { useState, useRef } from 'react';
import { Project } from '../types/project';

interface ProjectFile {
  id: string;
  name: string;
  type: 'document' | 'image' | 'data' | 'other';
  size: number;
  uploadedAt: Date;
  content?: string;
}

interface ProjectFileManagerProps {
  project: Project | null;
  isVisible: boolean;
  onClose: () => void;
  onFileUpload: (files: ProjectFile[]) => void;
}

const ProjectFileManager: React.FC<ProjectFileManagerProps> = ({
  project,
  isVisible,
  onClose,
  onFileUpload
}) => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (fileList: FileList) => {
    const newFiles: ProjectFile[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const fileId = `file_${Date.now()}_${i}`;

      // 파일 타입 결정
      let fileType: ProjectFile['type'] = 'other';
      if (file.type.startsWith('text/') || file.name.endsWith('.pdf') || file.name.endsWith('.doc')) {
        fileType = 'document';
      } else if (file.type.startsWith('image/')) {
        fileType = 'image';
      } else if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.json')) {
        fileType = 'data';
      }

      const projectFile: ProjectFile = {
        id: fileId,
        name: file.name,
        type: fileType,
        size: file.size,
        uploadedAt: new Date()
      };

      // 텍스트 파일인 경우 내용 읽기
      if (fileType === 'document' && file.type.startsWith('text/')) {
        try {
          const content = await file.text();
          projectFile.content = content;
        } catch (error) {
          console.error('파일 읽기 오류:', error);
        }
      }

      newFiles.push(projectFile);

      // 업로드 진행률 시뮬레이션
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      simulateUploadProgress(fileId);
    }

    setFiles(prev => [...prev, ...newFiles]);
    onFileUpload(newFiles);
  };

  const simulateUploadProgress = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
    }, 100);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  const getFileIcon = (type: ProjectFile['type']) => {
    switch (type) {
      case 'document': return '📄';
      case 'image': return '🖼️';
      case 'data': return '📊';
      default: return '📁';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeName = (type: ProjectFile['type']) => {
    switch (type) {
      case 'document': return '문서';
      case 'image': return '이미지';
      case 'data': return '데이터';
      default: return '기타';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="file-manager-overlay" onClick={onClose}>
      <div className="file-manager-modal" onClick={(e) => e.stopPropagation()}>
        <div className="file-manager-header">
          <h3>📁 프로젝트 파일 관리</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="file-manager-content">
          <div className="upload-section">
            <div
              className={`upload-area ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-icon">📤</div>
              <p className="upload-text">
                파일을 여기에 드래그하거나 클릭하여 업로드하세요
              </p>
              <p className="upload-hint">
                지원 형식: PDF, DOC, TXT, CSV, XLSX, 이미지 파일
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.json,.jpg,.jpeg,.png,.gif"
              />
            </div>
          </div>

          <div className="files-section">
            <div className="files-header">
              <h4>업로드된 파일 ({files.length}개)</h4>
              {files.length > 0 && (
                <button
                  className="clear-all-btn"
                  onClick={() => setFiles([])}
                >
                  모두 삭제
                </button>
              )}
            </div>

            <div className="files-list">
              {files.length === 0 ? (
                <div className="no-files">
                  <p>업로드된 파일이 없습니다.</p>
                  <p>파일을 업로드하여 AI가 더 정확한 답변을 제공할 수 있도록 도와주세요.</p>
                </div>
              ) : (
                files.map(file => (
                  <div key={file.id} className="file-item">
                    <div className="file-info">
                      <div className="file-icon">{getFileIcon(file.type)}</div>
                      <div className="file-details">
                        <div className="file-name">{file.name}</div>
                        <div className="file-meta">
                          <span className="file-type">{getFileTypeName(file.type)}</span>
                          <span className="file-size">{formatFileSize(file.size)}</span>
                          <span className="file-date">
                            {file.uploadedAt.toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="file-actions">
                      {uploadProgress[file.id] !== undefined && uploadProgress[file.id] < 100 ? (
                        <div className="upload-progress">
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${uploadProgress[file.id]}%` }}
                            ></div>
                          </div>
                          <span className="progress-text">{Math.round(uploadProgress[file.id])}%</span>
                        </div>
                      ) : (
                        <>
                          <button
                            className="preview-btn"
                            title="미리보기"
                            onClick={() => {
                              if (file.content) {
                                alert(`파일 내용 미리보기:\n\n${file.content.substring(0, 200)}...`);
                              }
                            }}
                          >
                            👁️
                          </button>
                          <button
                            className="remove-btn"
                            title="삭제"
                            onClick={() => removeFile(file.id)}
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {files.length > 0 && (
            <div className="file-manager-footer">
              <div className="file-stats">
                <span>총 {files.length}개 파일</span>
                <span>•</span>
                <span>{formatFileSize(files.reduce((sum, file) => sum + file.size, 0))}</span>
              </div>
              <div className="file-warning">
                ⚠️ 파일이 많을수록 AI 응답 속도가 느려질 수 있습니다.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectFileManager;
