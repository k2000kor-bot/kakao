import React, { useState } from 'react';
import { Project, Guideline } from '../types/project';


interface ProjectContextProps {
    project: Project | null;
    onFileUpload: (files: File[]) => void;
    onGuidelineAdd: (guideline: Omit<Guideline, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

type NewGuideline = {
    title: string;
    content: string;
    category: 'general' | 'specific' | 'technical';
    isActive: boolean;
};

const ProjectContext: React.FC<ProjectContextProps> = ({
    project,
    onFileUpload,
    onGuidelineAdd
}) => {
    const [showFileModal, setShowFileModal] = useState(false);
    const [showGuidelineModal, setShowGuidelineModal] = useState(false);
    const [newGuideline, setNewGuideline] = useState<NewGuideline>({ 
        title: '', 
        content: '', 
        category: 'general',
        isActive: true 
    });

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            onFileUpload(Array.from(files));
            setShowFileModal(false);
        }
    };

    const handleGuidelineSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newGuideline.title && newGuideline.content) {
            onGuidelineAdd(newGuideline);
            setNewGuideline({ 
                title: '', 
                content: '', 
                category: 'general',
                isActive: true 
            });
            setShowGuidelineModal(false);
        }
    };

    if (!project) {
        return (
            <div className="project-context-empty">
                <div className="empty-state">
                    <h3>프로젝트를 선택해주세요</h3>
                    <p>프로젝트를 선택하면 파일과 지침을 관리할 수 있습니다.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="project-context">
            <div className="project-header">
                <h2>📁 {project.name}</h2>
                <p className="project-description">{project.description}</p>
            </div>

            <div className="project-sections">
                {/* 프로젝트 파일 섹션 */}
                <div className="project-section">
                    <div className="section-header">
                        <h3>프로젝트 파일</h3>
                        <div className="section-info">
                            <span>{project.files?.length || 0} 파일</span>
                            <button
                                className="add-button"
                                onClick={() => setShowFileModal(true)}
                            >
                                파일 추가
                            </button>
                        </div>
                    </div>

                    <div className="file-list">
                        {project.files && project.files.length > 0 ? (
                            project.files.map((file) => (
                                <div key={file.id} className="file-item">
                                    <div className="file-icon">
                                        {file.type === 'document' && '📄'}
                                        {file.type === 'image' && '🖼️'}
                                        {file.type === 'video' && '🎥'}
                                        {file.type === 'audio' && '🎵'}
                                        {file.type === 'spreadsheet' && '📊'}
                                        {file.type === 'other' && '📁'}
                                    </div>
                                    <div className="file-info">
                                        <div className="file-name">{file.name}</div>
                                        <div className="file-meta">
                                            <span>{file.type}</span>
                                            <span>•</span>
                                            <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-files">
                                <p>업로드된 파일이 없습니다.</p>
                                <button
                                    className="upload-button"
                                    onClick={() => setShowFileModal(true)}
                                >
                                    파일 업로드
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 프로젝트 지침 섹션 */}
                <div className="project-section">
                    <div className="section-header">
                        <h3>지침</h3>
                        <button
                            className="add-button"
                            onClick={() => setShowGuidelineModal(true)}
                        >
                            지침 추가
                        </button>
                    </div>

                    <div className="guideline-list">
                        {project.guidelines && project.guidelines.length > 0 ? (
                            project.guidelines.map((guideline) => (
                                <div key={guideline.id} className="guideline-item">
                                    <div className="guideline-header">
                                        <h4>{guideline.title}</h4>
                                        <span className={`category-badge ${guideline.category}`}>
                                            {guideline.category}
                                        </span>
                                    </div>
                                    <div className="guideline-content">
                                        {guideline.content.length > 100
                                            ? `${guideline.content.substring(0, 100)}...`
                                            : guideline.content
                                        }
                                    </div>
                                    <div className="guideline-meta">
                                        <span>업데이트: {new Date(guideline.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-guidelines">
                                <p>등록된 지침이 없습니다.</p>
                                <button
                                    className="add-guideline-button"
                                    onClick={() => setShowGuidelineModal(true)}
                                >
                                    지침 추가
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 파일 업로드 모달 */}
            {showFileModal && (
                <div className="modal-overlay" onClick={() => setShowFileModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>프로젝트 파일</h3>
                            <button
                                className="close-button"
                                onClick={() => setShowFileModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <p>파일이 응답에 영향을 줍니다</p>
                            <p>이 프로젝트가 사용하는 파일의 수로 인해 응답의 품질이 저하될 수 있습니다.</p>

                            <div className="file-upload-area">
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileUpload}
                                    accept=".txt,.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                                    id="file-upload"
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="file-upload" className="file-upload-label">
                                    <span>📁</span>
                                    <span>파일을 선택하거나 여기로 드래그하세요</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 지침 추가 모달 */}
            {showGuidelineModal && (
                <div className="modal-overlay" onClick={() => setShowGuidelineModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>지침</h3>
                            <button
                                className="close-button"
                                onClick={() => setShowGuidelineModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <form onSubmit={handleGuidelineSubmit}>
                                <div className="form-group">
                                    <label>제목</label>
                                    <input
                                        type="text"
                                        value={newGuideline.title}
                                        onChange={(e) => setNewGuideline(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="지침 제목을 입력하세요"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>카테고리</label>
                                    <select
                                        value={newGuideline.category}
                                        onChange={(e) => setNewGuideline(prev => ({ 
                                            ...prev, 
                                            category: e.target.value as 'general' | 'specific' | 'technical' 
                                        }))}
                                    >
                                        <option value="general">일반</option>
                                        <option value="specific">특정</option>
                                        <option value="technical">기술적</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>내용</label>
                                    <textarea
                                        value={newGuideline.content}
                                        onChange={(e) => setNewGuideline(prev => ({ ...prev, content: e.target.value }))}
                                        placeholder="지침 내용을 입력하세요"
                                        rows={4}
                                        required
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={() => setShowGuidelineModal(false)}
                                    >
                                        취소
                                    </button>
                                    <button type="submit" className="save-button">
                                        저장
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectContext;
