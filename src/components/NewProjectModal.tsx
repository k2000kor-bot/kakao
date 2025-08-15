import React, { useState } from 'react';

interface ProjectFile {
  id: string;
  name: string;
  type: 'document' | 'image' | 'data' | 'other';
  size: number;
  uploadedAt: Date;
  content?: string;
}

interface NewProjectModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCreateProject: (projectName: string, instructions?: string, files?: ProjectFile[]) => void;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isVisible,
  onClose,
  onCreateProject
}) => {
  const [projectName, setProjectName] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

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
  };

  const simulateUploadProgress = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCreateProject = () => {
    if (projectName.trim()) {
      onCreateProject(projectName.trim(), instructions.trim() || undefined, files);
      setProjectName('');
      setInstructions('');
      setFiles([]);
      setShowInstructions(false);
      setUploadProgress({});
    }
  };

  const handleNext = () => {
    if (projectName.trim()) {
      setShowInstructions(true);
    }
  };

  const handleBack = () => {
    setShowInstructions(false);
  };

  if (!isVisible) return null;

  return (
    <div className="new-project-modal-overlay">
      <div className="new-project-modal">
        <div className="modal-header">
          <div className="modal-brand">
            <span className="modal-logo">🤖</span>
            <h2>{showInstructions ? '프로젝트 설정' : '새 프로젝트'}</h2>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {!showInstructions ? (
          <div className="modal-content">
            <div className="input-section">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="예: 생일 파티 계획"
                className="project-name-input"
                autoFocus
              />
            </div>

            <div className="info-section">
              <div className="info-icon">💡</div>
              <div className="info-content">
                <h3>CORBU.AI 프로젝트란?</h3>
                <p>프로젝트에서는 AI 분석 작업을 위한 파일, 설정, 지침을 한 곳에 보관합니다. 지속적인 분석 작업이나 데이터 처리를 체계적으로 관리하기에 최적입니다.</p>
              </div>
            </div>

            <div className="modal-actions">
              <button className="cancel-button" onClick={onClose}>
                취소
              </button>
              <button
                className="create-button"
                onClick={handleNext}
                disabled={!projectName.trim()}
              >
                프로젝트 만들기
              </button>
            </div>
          </div>
        ) : (
          <div className="modal-content">
            {/* 파일 업로드 섹션 */}
            <div className="files-section">
              <h3>📁 파일 추가</h3>
              <p>이 프로젝트의 AI 분석이 파일 콘텐츠에 액세스할 수 있습니다.</p>
              
              <div 
                className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="upload-icon">📄</div>
                <div className="upload-text">파일을 드래그하여 업로드하거나 클릭하여 선택하세요</div>
                <div className="upload-subtext">문서, 이미지, 데이터 파일 등을 지원합니다</div>
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="file-input"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="upload-button">
                  파일 선택
                </label>
              </div>

              {/* 업로드된 파일 목록 */}
              {files.length > 0 && (
                <div className="files-list">
                  {files.map((file) => (
                    <div key={file.id} className="file-item">
                      <div className="file-icon">
                        {file.type === 'document' && '📄'}
                        {file.type === 'image' && '🖼️'}
                        {file.type === 'data' && '📊'}
                        {file.type === 'other' && '📁'}
                      </div>
                      <div className="file-info">
                        <div className="file-name">{file.name}</div>
                        <div className="file-details">
                          <span className="file-size">{formatFileSize(file.size)}</span>
                          <span className="file-date">
                            {file.uploadedAt.toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                        {uploadProgress[file.id] !== undefined && (
                          <div className="upload-progress">
                            <div 
                              className="progress-bar" 
                              style={{ width: `${uploadProgress[file.id]}%` }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="file-actions">
                        <button
                          className="action-button delete"
                          onClick={() => removeFile(file.id)}
                          title="파일 삭제"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 지침 설정 섹션 */}
            <div className="instructions-section">
              <h3>📝 지침 추가</h3>
              <p>CORBU.AI가 이 프로젝트를 어떻게 도와드릴까요?</p>
              <p>AI에게 특정 분석 영역에 집중하거나, 특정한 분석 방식이나 출력 형식을 지정할 수 있습니다.</p>

              <div className="example-section">
                <p className="example-label">예시:</p>
                <p className="example-text">"부동산 시장 분석에 집중해 줘. 데이터 시각화를 포함해서 분석해 줘. 한국어로 상세한 보고서 형태로 작성해 줘."</p>
              </div>

              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="CORBU.AI에게 전달할 프로젝트 지침을 입력하세요..."
                className="instructions-textarea"
                rows={6}
              />
            </div>

            <div className="modal-actions">
              <button className="cancel-button" onClick={handleBack}>
                뒤로
              </button>
              <button
                className="save-button"
                onClick={handleCreateProject}
              >
                프로젝트 생성
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewProjectModal;
