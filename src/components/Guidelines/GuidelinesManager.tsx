import React, { useState } from 'react';
import './GuidelinesManager.css';
import { getGuidelineCategoryStyle, getPriorityStyle } from '../../styles/themeColors';
import {
    Plus,
    Edit,
    Trash2,
    BookOpen,
    CheckCircle,
    AlertCircle,
    X,
    Save,
    Copy,
    Eye,
    EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { coerceTrimmedString } from '../../utils/chatInputUtils';

type Category = 'general' | 'tone' | 'style' | 'format' | 'constraint' | 'custom';
type Priority = 'low' | 'medium' | 'high';

interface Guideline {
    id: string;
    title: string;
    content: string;
    category: Category;
    priority: Priority;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    usageCount?: number;
    tags?: string[];
}

interface GuidelinesManagerProps {
    guidelines: Guideline[];
    onGuidelineAdd: (guideline: Omit<Guideline, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onGuidelineEdit: (id: string, guideline: Partial<Guideline>) => void;
    onGuidelineDelete: (id: string) => void;
    onGuidelineToggle: (id: string, isActive: boolean) => void;
    onGuidelineCopy?: (id: string) => void;
}

const GuidelinesManager: React.FC<GuidelinesManagerProps> = ({
    guidelines,
    onGuidelineAdd,
    onGuidelineEdit,
    onGuidelineDelete,
    onGuidelineToggle,
    onGuidelineCopy
}) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingGuideline, setEditingGuideline] = useState<Guideline | null>(null);
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showPreview, setShowPreview] = useState<string | null>(null);

    const categories = [
        { value: 'general', label: '일반' },
        { value: 'tone', label: '톤' },
        { value: 'style', label: '스타일' },
        { value: 'format', label: '형식' },
        { value: 'constraint', label: '제약' },
        { value: 'custom', label: '사용자 정의' }
    ];

    const priorities = [
        { value: 'low', label: '낮음' },
        { value: 'medium', label: '보통' },
        { value: 'high', label: '높음' }
    ];

    const filteredGuidelines = guidelines.filter(guideline => {
        const matchesFilter = filter === 'all' ||
            (filter === 'active' && guideline.isActive) ||
            (filter === 'inactive' && !guideline.isActive);

        const matchesCategory = categoryFilter === 'all' || guideline.category === categoryFilter;

        const matchesSearch = guideline.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            guideline.content.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesCategory && matchesSearch;
    });

    const getCategoryLabel = (category: string) => categories.find(c => c.value === category)?.label ?? '일반';
    const getPriorityLabel = (priority: string) => priorities.find(p => p.value === priority)?.label ?? '보통';

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleAddGuideline = (guidelineData: { title: string; content: string; category: string; priority: string; tags?: string[] }) => {
        onGuidelineAdd({
            title: guidelineData.title,
            content: guidelineData.content,
            category: guidelineData.category as Category,
            priority: guidelineData.priority as Priority,
            isActive: true,
            tags: guidelineData.tags || []
        });
        setShowAddModal(false);
    };

    const handleEditGuideline = (guidelineData: { title: string; content: string; category: string; priority: string; tags?: string[] }) => {
        if (editingGuideline) {
            onGuidelineEdit(editingGuideline.id, {
                title: guidelineData.title,
                content: guidelineData.content,
                category: guidelineData.category as Category,
                priority: guidelineData.priority as Priority,
                tags: guidelineData.tags || []
            });
            setEditingGuideline(null);
        }
    };

    return (
        <div className="glm-root" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            {/* Header */}
            <div className="glm-header">
                <div>
                    <h2 className="glm-title">프로젝트 지침</h2>
                    <p className="glm-desc">AI가 프로젝트에서 따라야 할 지침들을 관리하세요</p>
                </div>
                <button type="button" onClick={() => { setEditingGuideline({ id: '', title: '', content: '', category: 'general', priority: 'medium', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: [] }); setShowAddModal(true); }} className="bw-btn-primary">
                    <Plus className="h-4 w-4" aria-hidden />
                    <span>지침 추가</span>
                </button>
            </div>

            {/* Filters */}
            <div className="glm-filters">
                <div className="glm-filter-field">
                    <label className="glm-label">상태</label>
                    <select value={filter} onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'inactive')} className="bw-input">
                        <option value="all">전체</option>
                        <option value="active">활성</option>
                        <option value="inactive">비활성</option>
                    </select>
                </div>
                <div className="glm-filter-field">
                    <label className="glm-label">카테고리</label>
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bw-input">
                        <option value="all">전체</option>
                        {categories.map(category => (
                            <option key={category.value} value={category.value}>{category.label}</option>
                        ))}
                    </select>
                </div>
                <div className="glm-filter-field" style={{ gridColumn: 'span 2' }}>
                    <label className="glm-label">검색</label>
                    <input type="text" placeholder="지침 제목이나 내용으로 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bw-input" />
                </div>
            </div>

            {/* Guidelines List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                <AnimatePresence>
                    {filteredGuidelines.map((guideline) => {
                        const catStyle = getGuidelineCategoryStyle(guideline.category);
                        const priStyle = getPriorityStyle(guideline.priority);
                        return (
                            <motion.div
                                key={guideline.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={`glm-card ${guideline.isActive ? 'active' : 'inactive'}`}
                            >
                                <div className="glm-card-body">
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--spacing-md)' }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
                                                <BookOpen className="h-5 w-5" style={{ color: 'var(--accent-secondary)' }} aria-hidden />
                                                <h3 className="glm-title" style={{ fontSize: 'var(--font-size-lg)', margin: 0 }}>{guideline.title}</h3>
                                                {!guideline.isActive && (
                                                    <span className="glm-badge" style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' }}>비활성</span>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                                                <span className="glm-badge" style={catStyle}>{getCategoryLabel(guideline.category)}</span>
                                                <span className="glm-badge" style={priStyle}>{getPriorityLabel(guideline.priority)}</span>
                                                {guideline.usageCount !== undefined && (
                                                    <span className="glm-desc" style={{ margin: 0 }}>사용 {guideline.usageCount}회</span>
                                                )}
                                            </div>
                                            <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                                {showPreview === guideline.id ? (
                                                    <div className="glm-preview">
                                                        <p className="glm-label" style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{guideline.content}</p>
                                                    </div>
                                                ) : (
                                                    <p className="glm-label glm-line-clamp-2">{guideline.content}</p>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                                <span>수정: {formatDate(guideline.updatedAt)}</span>
                                                <button type="button" onClick={() => setShowPreview(showPreview === guideline.id ? null : guideline.id)} className="glm-btn-icon" style={{ padding: 0, fontSize: 'inherit' }}>
                                                    {showPreview === guideline.id ? <><EyeOff className="h-3 w-3" aria-hidden /><span>접기</span></> : <><Eye className="h-3 w-3" aria-hidden /><span>미리보기</span></>}
                                                </button>
                                            </div>
                                            {guideline.tags && guideline.tags.length > 0 && (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-sm)' }}>
                                                    {guideline.tags.map((tag, index) => (
                                                        <span key={index} className="glm-badge" style={{ color: 'var(--accent-secondary)', backgroundColor: 'var(--accent-secondary-muted)' }}>{tag}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="glm-actions">
                                            <button type="button" onClick={() => onGuidelineToggle(guideline.id, !guideline.isActive)} className={`glm-btn-icon ${guideline.isActive ? 'active' : ''}`} title={guideline.isActive ? '비활성화' : '활성화'}>
                                                {guideline.isActive ? <CheckCircle className="h-4 w-4" aria-hidden /> : <AlertCircle className="h-4 w-4" aria-hidden />}
                                            </button>
                                            {onGuidelineCopy && (
                                                <button type="button" onClick={() => onGuidelineCopy(guideline.id)} className="glm-btn-icon" title="복사">
                                                    <Copy className="h-4 w-4" aria-hidden />
                                                </button>
                                            )}
                                            <button type="button" onClick={() => setEditingGuideline(guideline)} className="glm-btn-icon" title="편집">
                                                <Edit className="h-4 w-4" aria-hidden />
                                            </button>
                                            <button type="button" onClick={() => onGuidelineDelete(guideline.id)} className="glm-btn-icon danger" title="삭제">
                                                <Trash2 className="h-4 w-4" aria-hidden />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {filteredGuidelines.length === 0 && (
                    <div className="glm-empty">
                        <BookOpen className="glm-empty-icon h-12 w-12" aria-hidden />
                        <p className="glm-desc" style={{ marginBottom: 'var(--spacing-sm)' }}>{searchTerm ? '검색 결과가 없습니다.' : '지침이 없습니다.'}</p>
                        {!searchTerm && (
                            <button type="button" onClick={() => { setEditingGuideline({ id: '', title: '', content: '', category: 'general', priority: 'medium', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: [] }); setShowAddModal(true); }} className="bw-btn-ghost" style={{ color: 'var(--accent-info)' }}>
                                첫 번째 지침을 추가해보세요
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {(showAddModal || editingGuideline) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="glm-modal-overlay"
                        onClick={() => { setShowAddModal(false); setEditingGuideline(null); }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glm-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="glm-modal-header">
                                <h2 className="glm-title" style={{ margin: 0 }}>{editingGuideline ? '지침 편집' : '새 지침 추가'}</h2>
                                <button type="button" onClick={() => { setShowAddModal(false); setEditingGuideline(null); }} className="glm-btn-icon">
                                    <X className="h-5 w-5" aria-hidden />
                                </button>
                            </div>
                            <div className="glm-modal-body">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                                    <div>
                                        <label className="glm-label" style={{ marginBottom: 'var(--spacing-sm)', display: 'block' }}>제목 *</label>
                                        <input type="text" value={editingGuideline?.title ?? ''} onChange={(e) => setEditingGuideline(prev => prev ? { ...prev, title: e.target.value } : { id: '', title: e.target.value, content: '', category: 'general', priority: 'medium', isActive: true, createdAt: '', updatedAt: '', tags: [] })} placeholder="지침 제목을 입력하세요" className="bw-input" />
                                    </div>
                                    <div>
                                        <label className="glm-label" style={{ marginBottom: 'var(--spacing-sm)', display: 'block' }}>내용 *</label>
                                        <textarea value={editingGuideline?.content ?? ''} onChange={(e) => setEditingGuideline(prev => prev ? { ...prev, content: e.target.value } : { id: '', title: '', content: e.target.value, category: 'general', priority: 'medium', isActive: true, createdAt: '', updatedAt: '', tags: [] })} placeholder="지침 내용을 입력하세요" rows={6} className="bw-input" style={{ resize: 'vertical' }} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                        <div>
                                            <label className="glm-label" style={{ marginBottom: 'var(--spacing-sm)', display: 'block' }}>카테고리</label>
                                            <select value={editingGuideline?.category ?? 'general'} onChange={(e) => setEditingGuideline(prev => prev ? { ...prev, category: e.target.value as Category } : { id: '', title: '', content: '', category: e.target.value as Category, priority: 'medium', isActive: true, createdAt: '', updatedAt: '', tags: [] })} className="bw-input">
                                                {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="glm-label" style={{ marginBottom: 'var(--spacing-sm)', display: 'block' }}>우선순위</label>
                                            <select value={editingGuideline?.priority ?? 'medium'} onChange={(e) => setEditingGuideline(prev => prev ? { ...prev, priority: e.target.value as Priority } : { id: '', title: '', content: '', category: 'general', priority: e.target.value as Priority, isActive: true, createdAt: '', updatedAt: '', tags: [] })} className="bw-input">
                                                {priorities.map(pri => <option key={pri.value} value={pri.value}>{pri.label}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="glm-modal-footer">
                                <button type="button" onClick={() => { setShowAddModal(false); setEditingGuideline(null); }} className="bw-btn-secondary">취소</button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const title = coerceTrimmedString(editingGuideline?.title, '');
                                        const content = coerceTrimmedString(editingGuideline?.content, '');
                                        if (title && content && editingGuideline) {
                                            if (editingGuideline.id) {
                                                handleEditGuideline({
                                                    title,
                                                    content,
                                                    category: editingGuideline.category,
                                                    priority: editingGuideline.priority,
                                                    tags: editingGuideline.tags ?? [],
                                                });
                                            } else {
                                                handleAddGuideline({ title, content, category: editingGuideline.category, priority: editingGuideline.priority, tags: editingGuideline.tags ?? [] });
                                            }
                                            setShowAddModal(false);
                                            setEditingGuideline(null);
                                        }
                                    }}
                                    disabled={!editingGuideline || !coerceTrimmedString(editingGuideline.title, '') || !coerceTrimmedString(editingGuideline.content, '')}
                                    className="bw-btn-primary"
                                >
                                    <Save className="h-4 w-4" aria-hidden />
                                    <span>{editingGuideline?.id ? '저장' : '추가'}</span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};



export default GuidelinesManager;
