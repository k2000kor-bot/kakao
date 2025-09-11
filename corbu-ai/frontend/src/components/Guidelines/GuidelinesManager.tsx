import React, { useState } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    Settings,
    BookOpen,
    CheckCircle,
    AlertCircle,
    Info,
    X,
    Save,
    Copy,
    Eye,
    EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Guideline {
    id: string;
    title: string;
    content: string;
    category: 'general' | 'tone' | 'style' | 'format' | 'constraint' | 'custom';
    priority: 'low' | 'medium' | 'high';
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
        { value: 'general', label: '일반', color: 'bg-blue-100 text-blue-800' },
        { value: 'tone', label: '톤', color: 'bg-green-100 text-green-800' },
        { value: 'style', label: '스타일', color: 'bg-purple-100 text-purple-800' },
        { value: 'format', label: '형식', color: 'bg-orange-100 text-orange-800' },
        { value: 'constraint', label: '제약', color: 'bg-red-100 text-red-800' },
        { value: 'custom', label: '사용자 정의', color: 'bg-gray-100 text-gray-800' }
    ];

    const priorities = [
        { value: 'low', label: '낮음', color: 'bg-green-100 text-green-800' },
        { value: 'medium', label: '보통', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'high', label: '높음', color: 'bg-red-100 text-red-800' }
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

    const getCategoryInfo = (category: string) => {
        return categories.find(c => c.value === category) || categories[0];
    };

    const getPriorityInfo = (priority: string) => {
        return priorities.find(p => p.value === priority) || priorities[1];
    };

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

    const handleAddGuideline = (guidelineData: any) => {
        onGuidelineAdd({
            title: guidelineData.title,
            content: guidelineData.content,
            category: guidelineData.category,
            priority: guidelineData.priority,
            isActive: true,
            tags: guidelineData.tags || []
        });
        setShowAddModal(false);
    };

    const handleEditGuideline = (guidelineData: any) => {
        if (editingGuideline) {
            onGuidelineEdit(editingGuideline.id, {
                title: guidelineData.title,
                content: guidelineData.content,
                category: guidelineData.category,
                priority: guidelineData.priority,
                tags: guidelineData.tags || []
            });
            setEditingGuideline(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">프로젝트 지침</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        AI가 프로젝트에서 따라야 할 지침들을 관리하세요
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    <span>지침 추가</span>
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        <option value="all">전체</option>
                        <option value="active">활성</option>
                        <option value="inactive">비활성</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        <option value="all">전체</option>
                        {categories.map(category => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">검색</label>
                    <input
                        type="text"
                        placeholder="지침 제목이나 내용으로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Guidelines List */}
            <div className="space-y-4">
                <AnimatePresence>
                    {filteredGuidelines.map((guideline) => (
                        <motion.div
                            key={guideline.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`bg-white rounded-lg border transition-all ${guideline.isActive ? 'border-gray-200 shadow-sm' : 'border-gray-100 bg-gray-50'
                                }`}
                        >
                            <div className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <div className="flex items-center space-x-2">
                                                <BookOpen className="h-5 w-5 text-purple-600" />
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {guideline.title}
                                                </h3>
                                                {!guideline.isActive && (
                                                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                                        비활성
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 mb-3">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryInfo(guideline.category).color}`}>
                                                {getCategoryInfo(guideline.category).label}
                                            </span>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityInfo(guideline.priority).color}`}>
                                                {getPriorityInfo(guideline.priority).label}
                                            </span>
                                            {guideline.usageCount !== undefined && (
                                                <span className="text-xs text-gray-500">
                                                    사용 {guideline.usageCount}회
                                                </span>
                                            )}
                                        </div>

                                        <div className="mb-3">
                                            {showPreview === guideline.id ? (
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                                        {guideline.content}
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {guideline.content}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>수정: {formatDate(guideline.updatedAt)}</span>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => setShowPreview(showPreview === guideline.id ? null : guideline.id)}
                                                    className="flex items-center space-x-1 hover:text-gray-700"
                                                >
                                                    {showPreview === guideline.id ? (
                                                        <>
                                                            <EyeOff className="h-3 w-3" />
                                                            <span>접기</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Eye className="h-3 w-3" />
                                                            <span>미리보기</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {guideline.tags && guideline.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {guideline.tags.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-1 ml-4">
                                        <button
                                            onClick={() => onGuidelineToggle(guideline.id, !guideline.isActive)}
                                            className={`p-2 rounded-lg transition-colors ${guideline.isActive
                                                ? 'text-green-600 hover:bg-green-50'
                                                : 'text-gray-400 hover:bg-gray-50'
                                                }`}
                                            title={guideline.isActive ? '비활성화' : '활성화'}
                                        >
                                            {guideline.isActive ? (
                                                <CheckCircle className="h-4 w-4" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4" />
                                            )}
                                        </button>

                                        {onGuidelineCopy && (
                                            <button
                                                onClick={() => onGuidelineCopy(guideline.id)}
                                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="복사"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => setEditingGuideline(guideline)}
                                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="편집"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>

                                        <button
                                            onClick={() => onGuidelineDelete(guideline.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="삭제"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredGuidelines.length === 0 && (
                    <div className="text-center py-12">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">
                            {searchTerm ? '검색 결과가 없습니다.' : '지침이 없습니다.'}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="text-purple-600 hover:text-purple-700 font-medium"
                            >
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
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={() => {
                            setShowAddModal(false);
                            setEditingGuideline(null);
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {editingGuideline ? '지침 편집' : '새 지침 추가'}
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setShowAddModal(false);
                                            setEditingGuideline(null);
                                        }}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X className="h-5 w-5 text-gray-500" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            제목 *
                                        </label>
                                        <input
                                            type="text"
                                            value={editingGuideline?.title || ''}
                                            onChange={(e) => setEditingGuideline(prev => prev ? { ...prev, title: e.target.value } : null)}
                                            placeholder="지침 제목을 입력하세요"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            내용 *
                                        </label>
                                        <textarea
                                            value={editingGuideline?.content || ''}
                                            onChange={(e) => setEditingGuideline(prev => prev ? { ...prev, content: e.target.value } : null)}
                                            placeholder="지침 내용을 입력하세요"
                                            rows={6}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                카테고리
                                            </label>
                                            <select
                                                value={editingGuideline?.category || 'general'}
                                                onChange={(e) => setEditingGuideline(prev => prev ? { ...prev, category: e.target.value as any } : null)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat.value} value={cat.value}>
                                                        {cat.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                우선순위
                                            </label>
                                            <select
                                                value={editingGuideline?.priority || 'medium'}
                                                onChange={(e) => setEditingGuideline(prev => prev ? { ...prev, priority: e.target.value as any } : null)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            >
                                                {priorities.map(pri => (
                                                    <option key={pri.value} value={pri.value}>
                                                        {pri.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                                        <button
                                            onClick={() => {
                                                setShowAddModal(false);
                                                setEditingGuideline(null);
                                            }}
                                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                        >
                                            취소
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (editingGuideline?.title?.trim() && editingGuideline?.content?.trim()) {
                                                    if (editingGuideline.id) {
                                                        handleEditGuideline(editingGuideline);
                                                    } else {
                                                        handleAddGuideline(editingGuideline);
                                                    }
                                                    setShowAddModal(false);
                                                    setEditingGuideline(null);
                                                }
                                            }}
                                            disabled={!editingGuideline?.title?.trim() || !editingGuideline?.content?.trim()}
                                            className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <Save className="h-4 w-4" />
                                            <span>{editingGuideline?.id ? '저장' : '추가'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};



export default GuidelinesManager;
