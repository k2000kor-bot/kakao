import React, { useState } from 'react';
import {
    FileText,
    Edit,
    Download,
    Share2,
    Eye,
    EyeOff,
    Settings,
    Wand2,
    Sparkles,
    Users,
    BarChart,
    Lightbulb,
    CheckCircle,
    RotateCcw,
    Star,
    ThumbsUp,
    ThumbsDown,
    Filter,
    Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCategoryStyle, getDocumentStatusStyle, getPriorityStyle } from '../../styles/themeColors';
import './AIDocumentGenerator.css';

interface DocumentTemplate {
    id: string;
    name: string;
    description: string;
    category: 'business' | 'technical' | 'creative' | 'academic' | 'legal' | 'marketing';
    tags: string[];
    content: string;
    variables: Array<{
        name: string;
        type: 'text' | 'number' | 'date' | 'select' | 'multiselect';
        label: string;
        required: boolean;
        options?: string[];
        defaultValue?: unknown;
    }>;
    usageCount: number;
    rating: number;
    createdAt: Date;
    updatedAt: Date;
}

interface GeneratedDocument {
    id: string;
    title: string;
    content: string;
    template: DocumentTemplate;
    variables: Record<string, unknown>;
    status: 'draft' | 'review' | 'approved' | 'published';
    quality: number;
    wordCount: number;
    readingTime: number;
    tags: string[];
    collaborators: string[];
    version: number;
    createdAt: Date;
    updatedAt: Date;
    aiSuggestions: Array<{
        type: 'improvement' | 'correction' | 'enhancement' | 'style';
        title: string;
        description: string;
        priority: 'high' | 'medium' | 'low';
        applied: boolean;
    }>;
    analytics: {
        views: number;
        shares: number;
        likes: number;
        comments: number;
        readingTime: number;
    };
}

interface AIDocumentGeneratorProps {
    onDocumentCreate?: (document: GeneratedDocument) => void;
    onDocumentUpdate?: (documentId: string, updates: Partial<GeneratedDocument>) => void;
    onDocumentDelete?: (documentId: string) => void;
    onDocumentShare?: (documentId: string, shareOptions: Record<string, unknown>) => void;
    onExportDocument?: (documentId: string, format: string) => void;
    onSuggestionApply?: (documentId: string, suggestionId: string) => void;
}

const AIDocumentGenerator: React.FC<AIDocumentGeneratorProps> = ({
    onDocumentCreate,
    onDocumentUpdate,
    onDocumentDelete: _onDocumentDelete,
    onDocumentShare,
    onExportDocument,
    onSuggestionApply
}) => {
    const [activeTab, setActiveTab] = useState<'templates' | 'documents' | 'editor' | 'analytics' | 'settings'>('templates');
    const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
    const [currentDocument, setCurrentDocument] = useState<GeneratedDocument | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data
    const [templates] = useState<DocumentTemplate[]>([
        {
            id: '1',
            name: '비즈니스 제안서',
            description: '프로젝트 제안 및 비즈니스 계획을 위한 전문적인 템플릿',
            category: 'business',
            tags: ['제안서', '비즈니스', '프로젝트', '계획'],
            content: '{{company_name}}의 {{project_name}} 제안서\n\n1. 개요\n{{project_overview}}\n\n2. 목표\n{{project_goals}}\n\n3. 방법론\n{{methodology}}\n\n4. 예산\n{{budget}}\n\n5. 일정\n{{timeline}}',
            variables: [
                { name: 'company_name', type: 'text', label: '회사명', required: true },
                { name: 'project_name', type: 'text', label: '프로젝트명', required: true },
                { name: 'project_overview', type: 'text', label: '프로젝트 개요', required: true },
                { name: 'project_goals', type: 'text', label: '프로젝트 목표', required: true },
                { name: 'methodology', type: 'text', label: '방법론', required: true },
                { name: 'budget', type: 'number', label: '예산', required: true },
                { name: 'timeline', type: 'text', label: '일정', required: true }
            ],
            usageCount: 156,
            rating: 4.8,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-15')
        },
        {
            id: '2',
            name: '기술 문서',
            description: '소프트웨어 및 기술 프로젝트를 위한 상세한 문서 템플릿',
            category: 'technical',
            tags: ['기술', '개발', 'API', '문서화'],
            content: '# {{project_name}} 기술 문서\n\n## 개요\n{{project_description}}\n\n## 아키텍처\n{{architecture}}\n\n## API 명세\n{{api_specification}}\n\n## 설치 가이드\n{{installation_guide}}\n\n## 사용법\n{{usage_guide}}',
            variables: [
                { name: 'project_name', type: 'text', label: '프로젝트명', required: true },
                { name: 'project_description', type: 'text', label: '프로젝트 설명', required: true },
                { name: 'architecture', type: 'text', label: '아키텍처', required: true },
                { name: 'api_specification', type: 'text', label: 'API 명세', required: true },
                { name: 'installation_guide', type: 'text', label: '설치 가이드', required: true },
                { name: 'usage_guide', type: 'text', label: '사용법', required: true }
            ],
            usageCount: 89,
            rating: 4.6,
            createdAt: new Date('2024-01-05'),
            updatedAt: new Date('2024-01-20')
        }
    ]);

    const [documents] = useState<GeneratedDocument[]>([
        {
            id: 'doc1',
            title: 'CORBU.AI 플랫폼 제안서',
            content: 'CORBU.AI의 혁신적인 AI 플랫폼 제안서입니다...',
            template: templates[0],
            variables: {
                company_name: 'CORBU.AI',
                project_name: 'AI 플랫폼 개발',
                project_overview: '혁신적인 AI 기반 프로젝트 관리 플랫폼',
                project_goals: '프로젝트 효율성 50% 향상',
                methodology: '애자일 개발 방법론',
                budget: 50000000,
                timeline: '6개월'
            },
            status: 'approved',
            quality: 92,
            wordCount: 2500,
            readingTime: 10,
            tags: ['AI', '플랫폼', '제안서'],
            collaborators: ['김개발', '이디자인'],
            version: 1,
            createdAt: new Date('2024-01-10'),
            updatedAt: new Date('2024-01-15'),
            aiSuggestions: [
                {
                    type: 'improvement',
                    title: '제목 개선',
                    description: '더 구체적이고 매력적인 제목으로 변경하는 것을 권장합니다.',
                    priority: 'medium',
                    applied: false
                },
                {
                    type: 'enhancement',
                    title: '시각적 요소 추가',
                    description: '차트나 그래프를 추가하여 데이터를 더 명확하게 표현하세요.',
                    priority: 'high',
                    applied: false
                }
            ],
            analytics: {
                views: 45,
                shares: 12,
                likes: 8,
                comments: 3,
                readingTime: 10
            }
        }
    ]);

    const getCategoryStyleObj = (category: string) => getCategoryStyle(category);
    const getStatusStyleObj = (status: string) => getDocumentStatusStyle(status);
    const getPriorityStyleObj = (priority: string) => getPriorityStyle(priority);

    const handleTemplateSelect = (template: DocumentTemplate) => {
        setSelectedTemplate(template);
        setActiveTab('editor');
    };

    const handleDocumentGenerate = async () => {
        if (!selectedTemplate) return;

        setIsGenerating(true);
        
        // Simulate AI document generation
        await new Promise(resolve => setTimeout(resolve, 3000));

        const newDocument: GeneratedDocument = {
            id: `doc-${Date.now()}`,
            title: `${selectedTemplate.name} - ${new Date().toLocaleDateString()}`,
            content: selectedTemplate.content,
            template: selectedTemplate,
            variables: {},
            status: 'draft',
            quality: 85,
            wordCount: 1200,
            readingTime: 5,
            tags: selectedTemplate.tags,
            collaborators: [],
            version: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            aiSuggestions: [],
            analytics: {
                views: 0,
                shares: 0,
                likes: 0,
                comments: 0,
                readingTime: 5
            }
        };

        setCurrentDocument(newDocument);
        setIsGenerating(false);
        onDocumentCreate?.(newDocument);
    };

    const handleSuggestionApply = (suggestionId: string) => {
        if (!currentDocument) return;

        setCurrentDocument(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                aiSuggestions: prev.aiSuggestions.map(suggestion =>
                    suggestion.title === suggestionId
                        ? { ...suggestion, applied: true }
                        : suggestion
                )
            };
        });

        onSuggestionApply?.(currentDocument.id, suggestionId);
    };

    const filteredTemplates = templates.filter(template => {
        const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
        const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             template.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="aidg-root bw-detail-root" data-testid="page-documents">
            {/* Header */}
            <div className="aidg-header bw-detail-header">
                <div className="aidg-header-inner bw-detail-header-inner">
                    <div className="bw-detail-header-left">
                        <div className="aidg-header-icon bw-detail-header-icon">
                            <FileText size={24} aria-hidden />
                        </div>
                        <div>
                            <h2 className="aidg-title">AI 문서 생성기</h2>
                            <p className="aidg-desc">CORBU.AI 기반 문서 생성 및 편집</p>
                        </div>
                    </div>
                    <div className="bw-detail-header-actions">
                        {currentDocument && (
                            <>
                                <button type="button" onClick={() => setShowPreview(!showPreview)} className="bw-btn-secondary">
                                    {showPreview ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
                                    미리보기
                                </button>
                                <button type="button" onClick={() => onExportDocument?.(currentDocument.id, 'pdf')} className="bw-btn-primary">
                                    <Download size={16} aria-hidden /> 내보내기
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="aidg-tabs bw-detail-tabs">
                    {([
                        { id: 'templates', label: '템플릿', icon: FileText },
                        { id: 'documents', label: '문서', icon: Edit },
                        { id: 'editor', label: '편집기', icon: Wand2 },
                        { id: 'analytics', label: '분석', icon: BarChart },
                        { id: 'settings', label: '설정', icon: Settings }
                    ] as const).map((tab) => {
                        const IconComponent = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`aidg-tab bw-detail-tab ${activeTab === tab.id ? 'active' : ''}`}
                            >
                                <IconComponent size={16} aria-hidden />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="aidg-content bw-detail-content bw-detail-tab-content">
                <AnimatePresence mode="wait">
                    {activeTab === 'templates' && (
                        <motion.div
                            key="templates"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Filters */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                    <Search size={16} style={{ color: 'var(--text-secondary)' }} aria-hidden />
                                    <input
                                        type="text"
                                        placeholder="템플릿 검색..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="aidg-input"
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                    <Filter size={16} style={{ color: 'var(--text-secondary)' }} aria-hidden />
                                    <select
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value)}
                                        className="aidg-input"
                                    >
                                        <option value="all">모든 카테고리</option>
                                        <option value="business">비즈니스</option>
                                        <option value="technical">기술</option>
                                        <option value="creative">크리에이티브</option>
                                        <option value="academic">학술</option>
                                        <option value="legal">법무</option>
                                        <option value="marketing">마케팅</option>
                                    </select>
                                </div>
                            </div>

                            {/* Templates Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredTemplates.map((template) => (
                                    <motion.div
                                        key={template.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="aidg-card"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleTemplateSelect(template)}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="aidg-header-icon">
                                                    <FileText size={20} aria-hidden />
                                                </div>
                                                <div>
                                                    <h3 className="aidg-title" style={{ fontSize: 'var(--font-size-base)' }}>{template.name}</h3>
                                                    <p className="aidg-desc">{template.description}</p>
                                                </div>
                                            </div>
                                            <span className="aidg-tag" style={getCategoryStyleObj(template.category)}>
                                                {template.category === 'business' ? '비즈니스' :
                                                 template.category === 'technical' ? '기술' :
                                                 template.category === 'creative' ? '크리에이티브' :
                                                 template.category === 'academic' ? '학술' :
                                                 template.category === 'legal' ? '법무' : '마케팅'}
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex flex-wrap gap-1">
                                                {template.tags.slice(0, 3).map((tag, index) => (
                                                    <span key={index} className="aidg-tag">
                                                        {tag}
                                                    </span>
                                                ))}
                                                {template.tags.length > 3 && (
                                                    <span className="aidg-tag">
                                                        +{template.tags.length - 3}
                                                    </span>
                                                )}
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                                <div className="flex items-center space-x-2">
                                                    <Users size={12} aria-hidden />
                                                    <span>{template.usageCount}회 사용</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Star size={12} aria-hidden />
                                                    <span>{template.rating}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTemplateSelect(template);
                                                }}
                                                className="bw-btn-primary"
                                                style={{ width: '100%', justifyContent: 'center' }}
                                            >
                                                <Wand2 size={16} aria-hidden />
                                                <span>템플릿 사용</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'documents' && (
                        <motion.div
                            key="documents"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {documents.map((document) => (
                                    <motion.div
                                        key={document.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="aidg-card"
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                                <div className="aidg-header-icon" style={{ background: 'var(--accent-info-muted)', color: 'var(--accent-info)' }}>
                                                    <FileText size={20} aria-hidden />
                                                </div>
                                                <div>
                                                    <h3 className="aidg-title" style={{ fontSize: 'var(--font-size-base)' }}>{document.title}</h3>
                                                    <p className="aidg-desc">템플릿: {document.template.name}</p>
                                                </div>
                                            </div>
                                            <span className="aidg-tag" style={getStatusStyleObj(document.status)}>
                                                {document.status === 'draft' ? '초안' :
                                                 document.status === 'review' ? '검토' :
                                                 document.status === 'approved' ? '승인' : '발행'}
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex flex-wrap gap-1">
                                                {document.tags.slice(0, 3).map((tag, index) => (
                                                    <span key={index} className="aidg-tag">{tag}</span>
                                                ))}
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)' }}>
                                                <div>
                                                    <span className="aidg-desc">품질 점수</span>
                                                    <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--accent-success)' }}>{document.quality}%</div>
                                                </div>
                                                <div>
                                                    <span className="aidg-desc">단어 수</span>
                                                    <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{document.wordCount.toLocaleString()}</div>
                                                </div>
                                                <div>
                                                    <span className="aidg-desc">읽기 시간</span>
                                                    <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{document.readingTime}분</div>
                                                </div>
                                                <div>
                                                    <span className="aidg-desc">조회수</span>
                                                    <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{document.analytics.views}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setCurrentDocument(document);
                                                        setActiveTab('editor');
                                                    }}
                                                    className="bw-btn-primary"
                                                    style={{ flex: 1, fontSize: 'var(--font-size-sm)' }}
                                                >
                                                    편집
                                                </button>
                                                <button
                                                    onClick={() => onDocumentShare?.(document.id, {})}
                                                    className="bw-btn-secondary"
                                                    style={{ flex: 1, fontSize: 'var(--font-size-sm)' }}
                                                >
                                                    공유
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'editor' && (
                        <motion.div
                            key="editor"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {selectedTemplate && !currentDocument && (
                                <div className="aidg-card" style={{ background: 'var(--accent-info-muted)', borderColor: 'var(--accent-info)' }}>
                                    <div className="flex items-center space-x-3 mb-4">
                                        <Sparkles size={24} style={{ color: 'var(--accent-info)' }} aria-hidden />
                                        <h3 className="aidg-title" style={{ color: 'var(--accent-info)' }}>문서 생성 준비</h3>
                                    </div>
                                    <p className="aidg-desc" style={{ color: 'var(--accent-info)', marginBottom: 'var(--spacing-md)' }}>
                                        <strong>{selectedTemplate.name}</strong> 템플릿을 사용하여 새 문서를 생성합니다.
                                    </p>
                                    <button
                                        onClick={handleDocumentGenerate}
                                        disabled={isGenerating}
                                        className="bw-btn-primary"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <RotateCcw size={16} className="aidg-spin" aria-hidden />
                                                <span>생성 중...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 size={16} aria-hidden />
                                                <span>AI로 문서 생성</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {currentDocument && (
                                <div className="space-y-6">
                                    {/* Document Header */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="aidg-title" style={{ fontSize: 'var(--font-size-lg)' }}>{currentDocument.title}</h3>
                                            <p className="aidg-desc">
                                                품질: {currentDocument.quality}% | 
                                                단어: {currentDocument.wordCount.toLocaleString()} | 
                                                읽기시간: {currentDocument.readingTime}분
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => setIsEditing(!isEditing)}
                                                className="bw-btn-primary"
                                            >
                                                <Edit size={16} aria-hidden />
                                                <span>{isEditing ? '편집 완료' : '편집'}</span>
                                            </button>
                                            <button
                                                onClick={() => onDocumentUpdate?.(currentDocument.id, { status: 'review' })}
                                                className="bw-btn-primary"
                                                style={{ background: 'var(--accent-success)', borderColor: 'var(--accent-success)' }}
                                            >
                                                <CheckCircle size={16} aria-hidden />
                                                <span>검토 요청</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* AI Suggestions */}
                                    {currentDocument.aiSuggestions.length > 0 && (
                                        <div className="aidg-suggestion-box">
                                            <h4 className="aidg-title" style={{ marginBottom: 'var(--spacing-md)', color: 'var(--accent-warning)' }}>AI 제안사항</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                                {currentDocument.aiSuggestions.map((suggestion, index) => (
                                                    <div key={index} className="aidg-suggestion-item">
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                                                                <Lightbulb size={16} style={{ color: 'var(--accent-warning)' }} aria-hidden />
                                                                <span style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)' }}>{suggestion.title}</span>
                                                                <span className="aidg-tag" style={getPriorityStyleObj(suggestion.priority)}>
                                                                    {suggestion.priority === 'high' ? '높음' :
                                                                     suggestion.priority === 'medium' ? '중간' : '낮음'}
                                                                </span>
                                                            </div>
                                                            <p className="aidg-desc">{suggestion.description}</p>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                                            {!suggestion.applied && (
                                                                <button type="button" onClick={() => handleSuggestionApply(suggestion.title)} className="aidg-action-btn" aria-label="적용">
                                                                    <CheckCircle size={16} style={{ color: 'var(--accent-success)' }} aria-hidden />
                                                                </button>
                                                            )}
                                                            <button type="button" className="aidg-action-btn" aria-label="도움됨"><ThumbsUp size={16} aria-hidden /></button>
                                                            <button type="button" className="aidg-action-btn" aria-label="도움 안됨"><ThumbsDown size={16} aria-hidden /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Document Content */}
                                    <div className="aidg-card" style={{ padding: 0 }}>
                                        {isEditing ? (
                                            <textarea
                                                value={currentDocument.content}
                                                onChange={(e) => setCurrentDocument(prev => prev ? { ...prev, content: e.target.value } : null)}
                                                className="aidg-input"
                                                style={{ width: '100%', minHeight: 384, border: 'none', resize: 'none' }}
                                                placeholder="문서 내용을 입력하세요..."
                                            />
                                        ) : (
                                            <div style={{ padding: 'var(--spacing-md)', minHeight: 384, overflowY: 'auto' }}>
                                                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{currentDocument.content}</pre>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'analytics' && (
                        <motion.div
                            key="analytics"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--spacing-lg)' }}>
                                <div className="aidg-stat-card">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="aidg-desc" style={{ opacity: 0.9 }}>총 문서 수</p>
                                            <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>{documents.length}</p>
                                        </div>
                                        <FileText size={32} style={{ opacity: 0.8 }} aria-hidden />
                                    </div>
                                </div>
                                <div className="aidg-stat-card success">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="aidg-desc" style={{ opacity: 0.9 }}>평균 품질</p>
                                            <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
                                                {Math.round(documents.reduce((acc, doc) => acc + doc.quality, 0) / documents.length)}%
                                            </p>
                                        </div>
                                        <Star size={32} style={{ opacity: 0.8 }} aria-hidden />
                                    </div>
                                </div>
                                <div className="aidg-stat-card secondary">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="aidg-desc" style={{ opacity: 0.9 }}>총 조회수</p>
                                            <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
                                                {documents.reduce((acc, doc) => acc + doc.analytics.views, 0)}
                                            </p>
                                        </div>
                                        <Eye size={32} style={{ opacity: 0.8 }} aria-hidden />
                                    </div>
                                </div>
                                <div className="aidg-stat-card warning">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="aidg-desc" style={{ opacity: 0.9 }}>총 공유수</p>
                                            <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
                                                {documents.reduce((acc, doc) => acc + doc.analytics.shares, 0)}
                                            </p>
                                        </div>
                                        <Share2 size={32} style={{ opacity: 0.8 }} aria-hidden />
                                    </div>
                                </div>
                            </div>

                            <div className="aidg-card">
                                <h3 className="aidg-title">문서 성과 분석</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                    {documents.map((document) => (
                                        <div key={document.id} className="aidg-suggestion-item">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                                <FileText size={20} style={{ color: 'var(--text-secondary)' }} aria-hidden />
                                                <div>
                                                    <h4 style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)' }}>{document.title}</h4>
                                                    <p className="aidg-desc">
                                                        품질: {document.quality}% | 조회: {document.analytics.views}회
                                                    </p>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                                <span>공유: {document.analytics.shares}</span>
                                                <span>좋아요: {document.analytics.likes}</span>
                                                <span>댓글: {document.analytics.comments}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="aidg-card">
                                <h3 className="aidg-title">AI 설정</h3>
                                <div className="aidg-settings-list">
                                    <div className="aidg-settings-row">
                                        <span className="aidg-desc aidg-settings-label-medium">자동 제안 활성화</span>
                                        <button type="button" className="aidg-toggle-btn on" aria-label="자동 제안 토글">
                                            <span className="aidg-toggle-thumb" />
                                        </button>
                                    </div>
                                    <div className="aidg-settings-row">
                                        <span className="aidg-desc aidg-settings-label-medium">품질 검사 자동화</span>
                                        <button type="button" className="aidg-toggle-btn on" aria-label="품질 검사 토글">
                                            <span className="aidg-toggle-thumb" />
                                        </button>
                                    </div>
                                    <div className="aidg-settings-row">
                                        <span className="aidg-desc aidg-settings-label-medium">스타일 일관성 검사</span>
                                        <button type="button" className="aidg-toggle-btn off" aria-label="스타일 검사 토글">
                                            <span className="aidg-toggle-thumb" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AIDocumentGenerator;
