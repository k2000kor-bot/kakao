import React, { useState, useEffect } from 'react';
import {
    FileText,
    Edit,
    Plus,
    Save,
    Download,
    Share2,
    Eye,
    EyeOff,
    Settings,
    Wand2,
    Sparkles,
    Target,
    Clock,
    Users,
    BarChart3,
    Lightbulb,
    CheckCircle,
    AlertTriangle,
    ArrowRight,
    RotateCcw,
    Copy,
    Trash2,
    Star,
    Heart,
    ThumbsUp,
    ThumbsDown,
    MessageSquare,
    Calendar,
    Tag,
    Filter,
    Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        defaultValue?: any;
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
    variables: Record<string, any>;
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
    onDocumentShare?: (documentId: string, shareOptions: any) => void;
    onExportDocument?: (documentId: string, format: string) => void;
    onSuggestionApply?: (documentId: string, suggestionId: string) => void;
}

const AIDocumentGenerator: React.FC<AIDocumentGeneratorProps> = ({
    onDocumentCreate,
    onDocumentUpdate,
    onDocumentDelete,
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

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'business': return 'text-blue-600 bg-blue-50';
            case 'technical': return 'text-green-600 bg-green-50';
            case 'creative': return 'text-purple-600 bg-purple-50';
            case 'academic': return 'text-orange-600 bg-orange-50';
            case 'legal': return 'text-red-600 bg-red-50';
            case 'marketing': return 'text-pink-600 bg-pink-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'text-gray-600 bg-gray-50';
            case 'review': return 'text-yellow-600 bg-yellow-50';
            case 'approved': return 'text-green-600 bg-green-50';
            case 'published': return 'text-blue-600 bg-blue-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'low': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <FileText className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">AI 문서 생성기</h2>
                            <p className="text-sm text-gray-500">AI 기반 문서 생성 및 편집 시스템</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {currentDocument && (
                            <>
                                <button
                                    onClick={() => setShowPreview(!showPreview)}
                                    className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    <span>미리보기</span>
                                </button>
                                <button
                                    onClick={() => onExportDocument?.(currentDocument.id, 'pdf')}
                                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Download className="h-4 w-4" />
                                    <span>내보내기</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    {[
                        { id: 'templates', label: '템플릿', icon: FileText },
                        { id: 'documents', label: '문서', icon: Edit },
                        { id: 'editor', label: '편집기', icon: Wand2 },
                        { id: 'analytics', label: '분석', icon: BarChart3 },
                        { id: 'settings', label: '설정', icon: Settings }
                    ].map((tab) => {
                        const IconComponent = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-white text-purple-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <IconComponent className="h-4 w-4" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
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
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <Search className="h-4 w-4 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="템플릿 검색..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Filter className="h-4 w-4 text-gray-500" />
                                    <select
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => handleTemplateSelect(template)}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-purple-100 rounded-lg">
                                                    <FileText className="h-5 w-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                                                    <p className="text-sm text-gray-500">{template.description}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(template.category)}`}>
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
                                                    <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                                        {tag}
                                                    </span>
                                                ))}
                                                {template.tags.length > 3 && (
                                                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                                        +{template.tags.length - 3}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between text-sm text-gray-500">
                                                <div className="flex items-center space-x-2">
                                                    <Users className="h-3 w-3" />
                                                    <span>{template.usageCount}회 사용</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Star className="h-3 w-3" />
                                                    <span>{template.rating}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTemplateSelect(template);
                                                }}
                                                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                            >
                                                <Wand2 className="h-4 w-4" />
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
                                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <FileText className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{document.title}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        템플릿: {document.template.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(document.status)}`}>
                                                {document.status === 'draft' ? '초안' :
                                                 document.status === 'review' ? '검토' :
                                                 document.status === 'approved' ? '승인' : '발행'}
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex flex-wrap gap-1">
                                                {document.tags.slice(0, 3).map((tag, index) => (
                                                    <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-500">품질 점수</span>
                                                    <div className="font-medium text-green-600">{document.quality}%</div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">단어 수</span>
                                                    <div className="font-medium">{document.wordCount.toLocaleString()}</div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">읽기 시간</span>
                                                    <div className="font-medium">{document.readingTime}분</div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">조회수</span>
                                                    <div className="font-medium">{document.analytics.views}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setCurrentDocument(document);
                                                        setActiveTab('editor');
                                                    }}
                                                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    편집
                                                </button>
                                                <button
                                                    onClick={() => onDocumentShare?.(document.id, {})}
                                                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
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
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <Sparkles className="h-6 w-6 text-blue-600" />
                                        <h3 className="text-lg font-semibold text-blue-900">문서 생성 준비</h3>
                                    </div>
                                    <p className="text-blue-700 mb-4">
                                        <strong>{selectedTemplate.name}</strong> 템플릿을 사용하여 새 문서를 생성합니다.
                                    </p>
                                    <button
                                        onClick={handleDocumentGenerate}
                                        disabled={isGenerating}
                                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <RotateCcw className="h-4 w-4 animate-spin" />
                                                <span>생성 중...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 className="h-4 w-4" />
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
                                            <h3 className="text-lg font-semibold text-gray-900">{currentDocument.title}</h3>
                                            <p className="text-sm text-gray-500">
                                                품질: {currentDocument.quality}% | 
                                                단어: {currentDocument.wordCount.toLocaleString()} | 
                                                읽기시간: {currentDocument.readingTime}분
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => setIsEditing(!isEditing)}
                                                className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                            >
                                                <Edit className="h-4 w-4" />
                                                <span>{isEditing ? '편집 완료' : '편집'}</span>
                                            </button>
                                            <button
                                                onClick={() => onDocumentUpdate?.(currentDocument.id, { status: 'review' })}
                                                className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                                <span>검토 요청</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* AI Suggestions */}
                                    {currentDocument.aiSuggestions.length > 0 && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <h4 className="font-semibold text-yellow-900 mb-3">AI 제안사항</h4>
                                            <div className="space-y-2">
                                                {currentDocument.aiSuggestions.map((suggestion, index) => (
                                                    <div key={index} className="flex items-start justify-between p-3 bg-white rounded-lg">
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Lightbulb className="h-4 w-4 text-yellow-600" />
                                                                <span className="font-medium text-gray-900">{suggestion.title}</span>
                                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(suggestion.priority)}`}>
                                                                    {suggestion.priority === 'high' ? '높음' :
                                                                     suggestion.priority === 'medium' ? '중간' : '낮음'}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-600">{suggestion.description}</p>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            {!suggestion.applied && (
                                                                <button
                                                                    onClick={() => handleSuggestionApply(suggestion.title)}
                                                                    className="p-1 hover:bg-green-100 rounded transition-colors"
                                                                >
                                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                                </button>
                                                            )}
                                                            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                                                                <ThumbsUp className="h-4 w-4 text-gray-600" />
                                                            </button>
                                                            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                                                                <ThumbsDown className="h-4 w-4 text-gray-600" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Document Content */}
                                    <div className="bg-white border border-gray-200 rounded-lg">
                                        {isEditing ? (
                                            <textarea
                                                value={currentDocument.content}
                                                onChange={(e) => setCurrentDocument(prev => prev ? { ...prev, content: e.target.value } : null)}
                                                className="w-full h-96 p-4 border-0 focus:ring-0 resize-none"
                                                placeholder="문서 내용을 입력하세요..."
                                            />
                                        ) : (
                                            <div className="p-4 h-96 overflow-y-auto">
                                                <div className="prose max-w-none">
                                                    <pre className="whitespace-pre-wrap font-sans">{currentDocument.content}</pre>
                                                </div>
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
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm opacity-90">총 문서 수</p>
                                            <p className="text-3xl font-bold">{documents.length}</p>
                                        </div>
                                        <FileText className="h-8 w-8 opacity-80" />
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm opacity-90">평균 품질</p>
                                            <p className="text-3xl font-bold">
                                                {Math.round(documents.reduce((acc, doc) => acc + doc.quality, 0) / documents.length)}%
                                            </p>
                                        </div>
                                        <Star className="h-8 w-8 opacity-80" />
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm opacity-90">총 조회수</p>
                                            <p className="text-3xl font-bold">
                                                {documents.reduce((acc, doc) => acc + doc.analytics.views, 0)}
                                            </p>
                                        </div>
                                        <Eye className="h-8 w-8 opacity-80" />
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm opacity-90">총 공유수</p>
                                            <p className="text-3xl font-bold">
                                                {documents.reduce((acc, doc) => acc + doc.analytics.shares, 0)}
                                            </p>
                                        </div>
                                        <Share2 className="h-8 w-8 opacity-80" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">문서 성과 분석</h3>
                                <div className="space-y-4">
                                    {documents.map((document) => (
                                        <div key={document.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <FileText className="h-5 w-5 text-gray-600" />
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{document.title}</h4>
                                                    <p className="text-sm text-gray-500">
                                                        품질: {document.quality}% | 조회: {document.analytics.views}회
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI 설정</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">자동 제안 활성화</span>
                                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                                            <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">품질 검사 자동화</span>
                                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                                            <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">스타일 일관성 검사</span>
                                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                                            <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
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
