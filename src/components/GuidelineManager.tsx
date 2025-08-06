import React, { useState } from 'react';
import {
    CogIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    DocumentTextIcon,
    LightBulbIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import type { Guideline } from '../types/chat';
import { useModalClose } from '../hooks/useModalClose';

interface GuidelineManagerProps {
    guidelines: Guideline[];
    onAddGuideline: (guideline: Omit<Guideline, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onUpdateGuideline: (id: string, guideline: Partial<Guideline>) => void;
    onDeleteGuideline: (id: string) => void;
    onClose: () => void;
}

const GuidelineManager: React.FC<GuidelineManagerProps> = ({
    guidelines,
    onAddGuideline,
    onUpdateGuideline,
    onDeleteGuideline,
    onClose
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'general' as Guideline['category'],
        isActive: true
    });

    const { modalRef, handleClose } = useModalClose({
        isOpen: true,
        onClose: () => {
            if (isAdding || editingId) {
                if (window.confirm('편집 중인 내용이 저장되지 않습니다. 정말로 닫으시겠습니까?')) {
                    handleCancel();
                    onClose();
                }
            } else {
                onClose();
            }
        },
        showConfirm: Boolean(isAdding || editingId),
        confirmMessage: '편집 중인 내용이 저장되지 않습니다. 정말로 닫으시겠습니까?'
    });

    const getCategoryIcon = (category: Guideline['category']) => {
        switch (category) {
            case 'general':
                return <DocumentTextIcon className="w-4 h-4" />;
            case 'specific':
                return <CogIcon className="w-4 h-4" />;
            case 'technical':
                return <LightBulbIcon className="w-4 h-4" />;
            default:
                return <DocumentTextIcon className="w-4 h-4" />;
        }
    };

    const getCategoryColor = (category: Guideline['category']) => {
        switch (category) {
            case 'general':
                return 'bg-blue-100 text-blue-700';
            case 'specific':
                return 'bg-purple-100 text-purple-700';
            case 'technical':
                return 'bg-green-100 text-green-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getCategoryText = (category: Guideline['category']) => {
        switch (category) {
            case 'general':
                return '일반';
            case 'specific':
                return '특정';
            case 'technical':
                return '기술';
            default:
                return '기타';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            onUpdateGuideline(editingId, formData);
            setEditingId(null);
        } else {
            onAddGuideline(formData);
        }
        setFormData({ title: '', content: '', category: 'general', isActive: true });
        setIsAdding(false);
    };

    const handleEdit = (guideline: Guideline) => {
        setEditingId(guideline.id);
        setFormData({
            title: guideline.title,
            content: guideline.content,
            category: guideline.category,
            isActive: guideline.isActive
        });
        setIsAdding(true);
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({ title: '', content: '', category: 'general', isActive: true });
        setIsAdding(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div ref={modalRef} className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">지침 관리</h2>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setIsAdding(true)}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <PlusIcon className="w-4 h-4" />
                            <span className="text-sm">새 지침</span>
                        </button>
                        <button
                            onClick={handleClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="지침 관리 모달 닫기"
                            title="ESC 키로도 닫을 수 있습니다"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex h-full">
                    {/* 지침 목록 */}
                    <div className="flex-1 p-4 overflow-y-auto">
                        <div className="space-y-3">
                            {guidelines.map((guideline) => (
                                <div
                                    key={guideline.id}
                                    className={`p-4 border rounded-lg ${guideline.isActive ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'}`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                {getCategoryIcon(guideline.category)}
                                                <h3 className="font-medium text-gray-900">{guideline.title}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(guideline.category)}`}>
                                                    {getCategoryText(guideline.category)}
                                                </span>
                                                {!guideline.isActive && (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                        비활성
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-3">{guideline.content}</p>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() => handleEdit(guideline)}
                                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                                title="편집"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDeleteGuideline(guideline.id)}
                                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                title="삭제"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>생성일: {new Date(guideline.createdAt).toLocaleDateString('ko-KR')}</span>
                                        <span>수정일: {new Date(guideline.updatedAt).toLocaleDateString('ko-KR')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {guidelines.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <CogIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p>등록된 지침이 없습니다.</p>
                                <p className="text-sm">새로운 지침을 추가해보세요.</p>
                            </div>
                        )}
                    </div>

                    {/* 지침 추가/편집 폼 */}
                    {isAdding && (
                        <div className="w-96 border-l border-gray-200 p-4 bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {editingId ? '지침 편집' : '새 지침 추가'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        제목
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="지침 제목을 입력하세요"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        카테고리
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value as Guideline['category'] })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        aria-label="지침 카테고리 선택"
                                    >
                                        <option value="general">일반</option>
                                        <option value="specific">특정</option>
                                        <option value="technical">기술</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        내용
                                    </label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        rows={8}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="지침 내용을 입력하세요"
                                        required
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="isActive" className="text-sm text-gray-700">
                                        활성 상태
                                    </label>
                                </div>

                                <div className="flex space-x-2 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        {editingId ? '수정' : '추가'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                    >
                                        취소
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GuidelineManager; 