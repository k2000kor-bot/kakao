import React, { useState } from 'react';
import { usePromptTemplates, PromptTemplate } from '../hooks/usePromptTemplates';

const PromptTemplatesPanel: React.FC = () => {
    const {
        templates,
        categories,
        filter,
        setFilter,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        useTemplate: useTemplateFunction,
        rateTemplate,
        extractVariables,
        renderPrompt,
        getStats,
        exportTemplates,
        importTemplates
    } = usePromptTemplates();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showUseModal, setShowUseModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [variables, setVariables] = useState<Record<string, string>>({});

    const stats = getStats();

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    };

    const getRatingStars = (rating: number) => {
        return '⭐'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
    };

    const getCategoryColor = (color: string) => {
        const colors = {
            blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
            orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
        };
        return colors[color as keyof typeof colors] || colors.blue;
    };

    const handleCreateTemplate = (templateData: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => {
        addTemplate(templateData);
        setShowCreateModal(false);
    };

    const handleEditTemplate = (id: string, updates: Partial<PromptTemplate>) => {
        updateTemplate(id, updates);
        setShowEditModal(false);
        setSelectedTemplate(null);
    };

    const handleUseTemplate = (template: PromptTemplate) => {
        setSelectedTemplate(template);
        setVariables({});
        setShowUseModal(true);
    };

    const handleImport = async () => {
        if (importFile) {
            try {
                await importTemplates(importFile);
                setShowImportModal(false);
                setImportFile(null);
            } catch (error) {
                alert('파일 가져오기에 실패했습니다.');
            }
        }
    };

    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('클립보드에 복사되었습니다.');
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    프롬프트 템플릿
                </h2>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        새 템플릿
                    </button>
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                        가져오기
                    </button>
                    <button
                        onClick={exportTemplates}
                        className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    >
                        내보내기
                    </button>
                </div>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {stats.totalTemplates}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">총 템플릿</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {stats.totalUsage}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">총 사용</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {stats.averageRating}
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">평균 평점</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                        {stats.publicTemplates}
                    </div>
                    <div className="text-sm text-orange-600 dark:text-orange-400">공개 템플릿</div>
                </div>
            </div>

            {/* 카테고리 필터 */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">카테고리</h3>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilter({ ...filter, category: 'all' })}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter.category === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        전체
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setFilter({ ...filter, category: category.id })}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter.category === category.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            {category.icon} {category.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* 검색 및 정렬 */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <input
                            type="text"
                            value={filter.searchTerm}
                            onChange={(e) => setFilter({ ...filter, searchTerm: e.target.value })}
                            placeholder="템플릿 검색..."
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <select
                            value={filter.sortBy}
                            onChange={(e) => setFilter({ ...filter, sortBy: e.target.value as any })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="name">이름순</option>
                            <option value="usage">사용순</option>
                            <option value="rating">평점순</option>
                            <option value="created">생성순</option>
                        </select>
                    </div>
                    <div>
                        <select
                            value={filter.sortOrder}
                            onChange={(e) => setFilter({ ...filter, sortOrder: e.target.value as any })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="asc">오름차순</option>
                            <option value="desc">내림차순</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 템플릿 목록 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                        템플릿이 없습니다.
                    </div>
                ) : (
                    templates.map((template) => {
                        const category = categories.find(c => c.id === template.category);

                        return (
                            <div
                                key={template.id}
                                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                            {template.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            {template.description}
                                        </p>

                                        {category && (
                                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${getCategoryColor(category.color)}`}>
                                                {category.icon} {category.name}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2 mb-3">
                                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                        <span>사용: {template.usageCount}회</span>
                                        <span>평점: {getRatingStars(template.rating)}</span>
                                    </div>

                                    <div className="flex flex-wrap gap-1">
                                        {template.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleUseTemplate(template)}
                                        className="flex-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        사용하기
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedTemplate(template);
                                            setShowEditModal(true);
                                        }}
                                        className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                                    >
                                        편집
                                    </button>
                                    <button
                                        onClick={() => deleteTemplate(template.id)}
                                        className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                    >
                                        삭제
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* 템플릿 사용 모달 */}
            {showUseModal && selectedTemplate && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                템플릿 사용: {selectedTemplate.name}
                            </h3>
                            <button
                                onClick={() => setShowUseModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">변수 입력</h4>
                                {selectedTemplate.variables.map((variable) => (
                                    <div key={variable} className="mb-3">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            {variable}
                                        </label>
                                        <input
                                            type="text"
                                            value={variables[variable] || ''}
                                            onChange={(e) => setVariables({ ...variables, [variable]: e.target.value })}
                                            placeholder={`${variable} 입력...`}
                                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">생성된 프롬프트</h4>
                                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {renderPrompt(selectedTemplate, variables)}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => handleCopyToClipboard(renderPrompt(selectedTemplate, variables))}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    클립보드에 복사
                                </button>
                                <button
                                    onClick={() => {
                                        // 템플릿 사용 통계 업데이트
                                        const template = templates.find(t => t.id === selectedTemplate.id);
                                        if (template) {
                                            updateTemplate(template.id, { usageCount: template.usageCount + 1 });
                                        }
                                        setShowUseModal(false);
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    사용하기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 가져오기 모달 */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            템플릿 가져오기
                        </h3>
                        <input
                            type="file"
                            accept=".json"
                            onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <div className="flex justify-end space-x-2 mt-4">
                            <button
                                onClick={() => setShowImportModal(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={!importFile}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                가져오기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromptTemplatesPanel;
