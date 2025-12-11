/**
 * 글쓰기 어시스턴트 컴포넌트
 * 44개의 다양한 글쓰기 템플릿 제공
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import writingTemplates, { 
  WritingTemplate, 
  generatePrompt, 
  getAllCategories, 
  getTemplatesByCategory,
  WritingTone,
  WritingStyle,
  getToneDescription,
  getStyleDescription,
} from '../services/writingTemplates';
import WritingHistory from './WritingHistory';
import WritingEditor from './WritingEditor';
import WritingQualityPanel from './WritingQualityPanel';
import WritingStatisticsDashboard from './WritingStatisticsDashboard';
import { errorLogger } from '../utils/errorLogger';
import WritingTemplatePreview from './WritingTemplatePreview';
import WritingAISuggestions from './WritingAISuggestions';
import writingExporter, { WritingMetadata } from '../utils/writingExport';
import './WritingAssistant.css';

interface WritingAssistantProps {
    onGenerate?: (content: string) => void;
}

const WritingAssistant: React.FC<WritingAssistantProps> = ({ onGenerate }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedTemplate, setSelectedTemplate] = useState<WritingTemplate | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<WritingTone | ''>('');
  const [selectedStyle, setSelectedStyle] = useState<WritingStyle | ''>('');
  const [customWritingType, setCustomWritingType] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [previewTemplate, setPreviewTemplate] = useState<WritingTemplate | null>(null);
  const [showStatistics, setShowStatistics] = useState<boolean>(false);

    const categories = ['all', ...getAllCategories()];

  // 즐겨찾기 로드
  useEffect(() => {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
      const stored = globalThis.localStorage.getItem('writingTemplateFavorites');
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    }
  }, []);

  const toggleFavorite = useCallback((templateId: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(templateId)
        ? prev.filter((id) => id !== templateId)
        : [...prev, templateId];
      if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
        globalThis.localStorage.setItem('writingTemplateFavorites', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const filteredTemplates = useMemo(() => {
    const templates = selectedCategory === 'all'
      ? writingTemplates
      : getTemplatesByCategory(selectedCategory);
    
    if (!searchTerm) return templates;
    
    const search = searchTerm.toLowerCase();
    return templates.filter((template) => (
      template.title.toLowerCase().includes(search) ||
      template.description.toLowerCase().includes(search) ||
      template.category.toLowerCase().includes(search)
    ));
  }, [selectedCategory, searchTerm]);

  const handleTemplateSelect = useCallback((template: WritingTemplate) => {
    setSelectedTemplate(template);
    setFormValues({});
    setGeneratedContent('');
    // 템플릿의 기본 어투/스타일 설정
    setSelectedTone(template.defaultTone || '');
    setSelectedStyle(template.defaultStyle || '');
    setCustomWritingType('');
  }, []);

    const handleFieldChange = useCallback((fieldName: string, value: string) => {
        setFormValues((prev) => ({
            ...prev,
            [fieldName]: value,
        }));
    }, []);

  const handleGenerate = useCallback(async () => {
    if (!selectedTemplate) return;

    // 필수 필드 확인
    const requiredFields = selectedTemplate.fields?.filter((f) => f.required) || [];
    const missingFields = requiredFields.filter((f) => !formValues[f.name]?.trim());

    if (missingFields.length > 0) {
      alert(`다음 필드를 입력해주세요: ${missingFields.map((f) => f.label).join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      // 커스텀 글 종류가 있으면 formValues에 추가
      const finalFormValues = { ...formValues };
      if (customWritingType.trim()) {
        finalFormValues.writingType = customWritingType.trim();
      }
      
      const prompt = generatePrompt(
        selectedTemplate, 
        finalFormValues,
        selectedTone || undefined,
        selectedStyle || undefined
      );
      
      // 백엔드 API 호출
      const response = await fetch('http://localhost:8000/api/v7/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          mode: 'writing',
          template_id: selectedTemplate.id,
          template_category: selectedTemplate.category,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.response || data.message || data.content || '';
        setGeneratedContent(content);
        onGenerate?.(content);
        
        // 로컬 스토리지에 저장
        if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
          const history = JSON.parse(globalThis.localStorage.getItem('writingHistory') || '[]');
          history.unshift({
            id: Date.now().toString(),
            template: selectedTemplate.title,
            category: selectedTemplate.category,
            content,
            formValues,
            createdAt: new Date().toISOString(),
          });
          // 최대 50개만 유지
          if (history.length > 50) {
            history.pop();
          }
          globalThis.localStorage.setItem('writingHistory', JSON.stringify(history));
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '생성 실패');
      }
    } catch (error: any) {
      errorLogger.error('글쓰기 생성 오류', error instanceof Error ? error : new Error(String(error)), {
        component: 'WritingAssistant',
        action: 'generateContent',
        template: selectedTemplate?.id,
      });
      alert(`글쓰기 생성 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  }, [selectedTemplate, formValues, onGenerate]);

    return (
        <div className="writing-assistant" role="main" aria-label="글쓰기 어시스턴트">
      <div className="writing-header">
        <div className="header-content">
          <div>
            <h2>글쓰기 어시스턴트</h2>
            <p className="writing-subtitle">44개의 다양한 글쓰기 템플릿으로 원하는 글을 쉽게 작성하세요</p>
          </div>
          <div className="header-actions" role="search" aria-label="템플릿 검색">
            <input
              type="text"
              placeholder="템플릿 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="template-search"
              aria-label="템플릿 검색 입력"
            />
            <button
              className="history-toggle-btn"
              onClick={() => setShowHistory(!showHistory)}
              aria-label={showHistory ? '템플릿 보기' : '히스토리 보기'}
              type="button"
            >
              {showHistory ? '템플릿' : '히스토리'}
            </button>
          </div>
        </div>
      </div>

      <div className="writing-container">
        {showHistory ? (
          <div className="writing-main full-width">
            <WritingHistory
              onSelect={(item) => {
                setGeneratedContent(item.content);
                setShowHistory(false);
              }}
            />
          </div>
        ) : (
          <>
        {/* 카테고리 및 템플릿 선택 */}
        <aside className="writing-sidebar" role="complementary" aria-label="템플릿 선택 사이드바">
                    <div className="category-filter" role="region" aria-labelledby="category-heading">
                        <h3 id="category-heading">카테고리</h3>
                        <div className="category-buttons" role="group" aria-label="카테고리 필터">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedCategory(category);
                                        setSelectedTemplate(null);
                                    }}
                                    aria-pressed={selectedCategory === category}
                                    type="button"
                                >
                                    {category === 'all' ? '전체' : category}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="template-list" role="region" aria-labelledby="template-heading">
                        <h3 id="template-heading">템플릿 ({filteredTemplates.length}개)</h3>
                        <ul className="templates" role="list" aria-label="템플릿 목록">
              {filteredTemplates.map((template) => (
                <li
                  key={template.id}
                  className={`template-item ${selectedTemplate?.id === template.id ? 'active' : ''}`}
                  onClick={() => handleTemplateSelect(template)}
                  role="button"
                  tabIndex={0}
                  aria-label={`템플릿 선택: ${template.title}`}
                  aria-pressed={selectedTemplate?.id === template.id}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleTemplateSelect(template);
                    }
                  }}
                >
                  <div className="template-item-header">
                    <div className="template-title">{template.title}</div>
                    <div className="template-item-actions">
                      <button
                        className={`favorite-btn ${favorites.includes(template.id) ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(template.id);
                        }}
                        title={favorites.includes(template.id) ? '즐겨찾기 제거' : '즐겨찾기 추가'}
                        aria-label={favorites.includes(template.id) ? '즐겨찾기 제거' : '즐겨찾기 추가'}
                        type="button"
                      >
                        <span aria-hidden="true">{favorites.includes(template.id) ? '⭐' : '☆'}</span>
                      </button>
                      <button
                        className="preview-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewTemplate(template);
                        }}
                        title="미리보기"
                        aria-label={`${template.title} 미리보기`}
                        type="button"
                      >
                        <span aria-hidden="true">👁️</span>
                      </button>
                    </div>
                  </div>
                  <div className="template-description">{template.description}</div>
                  <div className="template-category">{template.category}</div>
                </li>
              ))}
                        </ul>
                    </div>
                </aside>

                {/* 템플릿 폼 및 결과 */}
                <div className="writing-main">
                    {selectedTemplate ? (
                        <>
              <div className="template-form">
                <h3>{selectedTemplate.title}</h3>
                <p className="template-info">{selectedTemplate.description}</p>

                {/* 어투 및 스타일 선택 */}
                <div className="tone-style-section">
                  <div className="form-section">
                    <h4>어투 선택</h4>
                    <select
                      value={selectedTone}
                      onChange={(e) => setSelectedTone(e.target.value as WritingTone | '')}
                      className="tone-select"
                    >
                      <option value="">템플릿 기본값</option>
                      <option value="formal">격식있는</option>
                      <option value="casual">캐주얼한</option>
                      <option value="professional">전문적인</option>
                      <option value="friendly">친근한</option>
                      <option value="academic">학술적인</option>
                      <option value="creative">창의적인</option>
                      <option value="poetic">시적인</option>
                      <option value="narrative">서술적인</option>
                      <option value="persuasive">설득적인</option>
                      <option value="informative">정보전달적인</option>
                      <option value="reflective">성찰적인 (수필)</option>
                      <option value="conversational">대화체</option>
                      <option value="humorous">유머러스한</option>
                      <option value="serious">진지한</option>
                      <option value="warm">따뜻한</option>
                      <option value="objective">객관적인</option>
                      <option value="subjective">주관적인</option>
                    </select>
                    {selectedTone && (
                      <p className="tone-description">{getToneDescription(selectedTone as WritingTone)}</p>
                    )}
                  </div>

                  <div className="form-section">
                    <h4>글 종류 선택</h4>
                    <select
                      value={selectedStyle}
                      onChange={(e) => setSelectedStyle(e.target.value as WritingStyle | '')}
                      className="style-select"
                    >
                      <option value="">템플릿 기본값</option>
                      <option value="essay">수필</option>
                      <option value="novel">소설</option>
                      <option value="poem">시</option>
                      <option value="article">기사</option>
                      <option value="report">보고서</option>
                      <option value="letter">편지</option>
                      <option value="speech">연설</option>
                      <option value="diary">일기</option>
                      <option value="review">리뷰</option>
                      <option value="guide">가이드</option>
                      <option value="story">이야기</option>
                      <option value="analysis">분석</option>
                      <option value="opinion">의견</option>
                      <option value="description">묘사</option>
                    </select>
                    {selectedStyle && (
                      <p className="style-description">{getStyleDescription(selectedStyle as WritingStyle)}</p>
                    )}
                  </div>

                  <div className="form-section">
                    <h4>커스텀 글 종류 (예: 수필로 만들어줘)</h4>
                    <input
                      type="text"
                      value={customWritingType}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCustomWritingType(value);
                        
                        // 자연어 처리: "수필로 만들어줘" 같은 입력 자동 감지
                        const lowerValue = value.toLowerCase();
                        if (lowerValue.includes('수필') || lowerValue.includes('essay')) {
                          setSelectedStyle('essay');
                          setSelectedTone('reflective');
                        } else if (lowerValue.includes('소설') || lowerValue.includes('novel')) {
                          setSelectedStyle('novel');
                          setSelectedTone('narrative');
                        } else if (lowerValue.includes('시') || lowerValue.includes('poem')) {
                          setSelectedStyle('poem');
                          setSelectedTone('poetic');
                        }
                      }}
                      placeholder="예: 수필로 만들어줘, 소설 형식으로, 시로 작성해줘 등"
                      className="custom-writing-type-input"
                    />
                    {customWritingType && (
                      <p className="custom-type-hint">
                        💡 "{customWritingType}" 형식으로 작성됩니다
                        {customWritingType.toLowerCase().includes('수필') && (
                          <span className="auto-detected"> (수필 스타일 + 성찰적 어투 자동 적용됨)</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {selectedTemplate.fields?.map((field) => (
                                    <div key={field.name} className="form-field">
                                        <label>
                                            {field.label}
                                            {field.required && <span className="required">*</span>}
                                        </label>
                                        {field.type === 'textarea' ? (
                                            <textarea
                                                value={formValues[field.name] || ''}
                                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                                placeholder={field.placeholder || `请输入${field.label}`}
                                                rows={4}
                                                required={field.required}
                                            />
                                        ) : field.type === 'select' ? (
                                            <select
                                                value={formValues[field.name] || ''}
                                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                                required={field.required}
                                            >
                                                <option value="">선택하세요</option>
                                                {field.options?.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type={field.type}
                                                value={formValues[field.name] || ''}
                                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                                placeholder={field.placeholder || `请输入${field.label}`}
                                                required={field.required}
                                            />
                                        )}
                                    </div>
                                ))}

                                <button
                                    className="generate-btn"
                                    onClick={handleGenerate}
                                    disabled={loading}
                                    aria-label={loading ? '글 생성 중' : '글 생성하기'}
                                    aria-busy={loading}
                                    type="button"
                                >
                                    {loading ? '생성 중...' : '글 생성하기'}
                                </button>
                            </div>

              {generatedContent && (
                <>
                  <div className="generated-content">
                    <div className="content-header">
                      <h3>생성된 글</h3>
                      <div className="content-actions">
                        <button
                          className="copy-btn"
                          onClick={async () => {
                            const success = await writingExporter.copyToClipboard(generatedContent);
                            if (success) {
                              alert('클립보드에 복사되었습니다!');
                            } else {
                              alert('복사에 실패했습니다.');
                            }
                          }}
                          aria-label="생성된 글을 클립보드에 복사"
                          type="button"
                        >
                          복사
                        </button>
                        <button
                          className="export-btn"
                          onClick={() => {
                            const metadata: WritingMetadata = {
                              title: selectedTemplate?.title || '글쓰기',
                              date: new Date().toLocaleDateString('ko-KR'),
                              template: selectedTemplate?.title,
                              tone: selectedTone || selectedTemplate?.defaultTone,
                              style: selectedStyle || selectedTemplate?.defaultStyle,
                              wordCount: generatedContent.split(/\s+/).filter(Boolean).length,
                              charCount: generatedContent.length,
                            };
                            writingExporter.export(generatedContent, {
                              format: 'txt',
                              includeMetadata: true,
                            }, metadata);
                          }}
                          aria-label="생성된 글 내보내기"
                          type="button"
                        >
                          내보내기
                        </button>
                        <button
                          className="statistics-btn"
                          onClick={() => setShowStatistics(!showStatistics)}
                          aria-label={showStatistics ? '통계 숨기기' : '통계 보기'}
                          aria-expanded={showStatistics}
                          type="button"
                        >
                          <span aria-hidden="true">📊</span> {showStatistics ? '통계 숨기기' : '통계 보기'}
                        </button>
                      </div>
                    </div>
                    <WritingEditor
                      content={generatedContent}
                      onSave={(content) => {
                        setGeneratedContent(content);
                        // 저장된 내용 업데이트
                        if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
                          const history = JSON.parse(globalThis.localStorage.getItem('writingHistory') || '[]');
                          if (history.length > 0) {
                            history[0].content = content;
                            globalThis.localStorage.setItem('writingHistory', JSON.stringify(history));
                          }
                        }
                      }}
                      onImprove={async (type) => {
                        // 개선 요청
                        try {
                          const response = await fetch('http://localhost:8000/api/v7/chat', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              message: `다음 글을 ${type === 'grammar' ? '문법' : type === 'style' ? '스타일' : '톤'} 측면에서 개선해주세요:\n\n${generatedContent}`,
                              mode: 'improve',
                              improve_type: type,
                            }),
                          });
                          
                          if (response.ok) {
                            const data = await response.json();
                            const improved = data.response || data.message || '';
                            setGeneratedContent(improved);
                          }
                        } catch (error) {
                          errorLogger.error('개선 오류', error instanceof Error ? error : new Error(String(error)), {
                            component: 'WritingAssistant',
                            action: 'improveContent',
                          });
                        }
                      }}
                    />
                  </div>

                  {/* 통계 대시보드 */}
                  {showStatistics && (
                    <WritingStatisticsDashboard content={generatedContent} />
                  )}

                  {/* AI 제안 */}
                  <WritingAISuggestions
                    content={generatedContent}
                    template={selectedTemplate?.title}
                    onApply={async (suggestion) => {
                      try {
                        const response = await fetch('http://localhost:8000/api/v7/chat', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            message: `다음 제안을 반영하여 글을 개선해주세요: "${suggestion.suggestion}"\n\n원문:\n${generatedContent}`,
                            mode: 'improve',
                          }),
                        });
                        
                        if (response.ok) {
                          const data = await response.json();
                          const improved = data.response || data.message || '';
                          setGeneratedContent(improved);
                        }
                      } catch (error) {
                        errorLogger.error('제안 적용 오류', error instanceof Error ? error : new Error(String(error)), {
                          component: 'WritingAssistant',
                          action: 'applySuggestion',
                        });
                      }
                    }}
                  />

                  {/* 품질 분석 패널 */}
                  <WritingQualityPanel
                    content={generatedContent}
                    onImprove={async (suggestion) => {
                      try {
                        const response = await fetch('http://localhost:8000/api/v7/chat', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            message: `다음 제안을 반영하여 글을 개선해주세요: "${suggestion}"\n\n원문:\n${generatedContent}`,
                            mode: 'improve',
                          }),
                        });
                        
                        if (response.ok) {
                          const data = await response.json();
                          const improved = data.response || data.message || '';
                          setGeneratedContent(improved);
                        }
                      } catch (error) {
                        errorLogger.error('개선 오류', error instanceof Error ? error : new Error(String(error)), {
                          component: 'WritingAssistant',
                          action: 'improveContent',
                        });
                      }
                    }}
                  />
                </>
              )}

              {/* 템플릿 미리보기 모달 */}
              {previewTemplate && (
                <WritingTemplatePreview
                  template={previewTemplate}
                  onSelect={() => {
                    handleTemplateSelect(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  onClose={() => setPreviewTemplate(null)}
                />
              )}
                        </>
                    ) : (
                        <div className="template-placeholder">
                            <p>왼쪽에서 글쓰기 템플릿을 선택하세요</p>
                            <p className="template-count">총 {writingTemplates.length}개의 템플릿이 준비되어 있습니다</p>
            </div>
          )}
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WritingAssistant;

