/**
 * 글쓰기 템플릿 미리보기 컴포넌트
 */

import React, { useState } from 'react';
import { WritingTemplate } from '../services/writingTemplates';
import './WritingTemplatePreview.css';

interface WritingTemplatePreviewProps {
    template: WritingTemplate;
    onSelect?: () => void;
    onClose?: () => void;
}

const WritingTemplatePreview: React.FC<WritingTemplatePreviewProps> = ({
    template,
    onSelect,
    onClose,
}) => {
    const [showFullPrompt, setShowFullPrompt] = useState(false);

    return (
        <div className="template-preview-overlay" onClick={onClose} data-testid="writing-template-preview">
            <div className="template-preview-modal" onClick={(e) => e.stopPropagation()}>
                <div className="preview-header">
                    <h3>{template.title}</h3>
                    <button className="close-btn" onClick={onClose} data-testid="preview-close-button">
                        ✕
                    </button>
                </div>

                <div className="preview-content">
                    <div className="preview-section">
                        <h4>설명</h4>
                        <p>{template.description}</p>
                    </div>

                    <div className="preview-section">
                        <h4>카테고리</h4>
                        <span className="category-badge">{template.category}</span>
                    </div>

                    {template.defaultTone && (
                        <div className="preview-section">
                            <h4>기본 어투</h4>
                            <span className="tone-badge">{template.defaultTone}</span>
                        </div>
                    )}

                    {template.defaultStyle && (
                        <div className="preview-section">
                            <h4>기본 스타일</h4>
                            <span className="style-badge">{template.defaultStyle}</span>
                        </div>
                    )}

                    <div className="preview-section">
                        <h4>필수 입력 항목</h4>
                        <div className="fields-list">
                            {template.fields && template.fields.filter(f => f.required).length > 0 ? (
                                template.fields.filter(f => f.required).map((field, idx) => (
                                    <div key={idx} className="field-item">
                                        <span className="field-name">{field.name}</span>
                                        <span className="field-type">{field.type}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="no-fields">필수 입력 항목이 없습니다.</p>
                            )}
                        </div>
                    </div>

                    <div className="preview-section">
                        <h4>
                            프롬프트 템플릿
                            <button
                                className="toggle-btn"
                                onClick={() => setShowFullPrompt(!showFullPrompt)}
                            >
                                {showFullPrompt ? '접기' : '펼치기'}
                            </button>
                        </h4>
                        <div className={`prompt-preview ${showFullPrompt ? 'expanded' : ''}`}>
                            <pre>{template.prompt}</pre>
                        </div>
                    </div>

                    {template.example && (
                        <div className="preview-section">
                            <h4>예시</h4>
                            <div className="example-content">
                                <pre>{template.example}</pre>
                            </div>
                        </div>
                    )}
                </div>

                <div className="preview-actions">
                    <button className="select-btn" onClick={onSelect} data-testid="preview-select-button">
                        이 템플릿 사용하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WritingTemplatePreview;

