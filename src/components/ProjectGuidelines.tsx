import React from 'react';
import { Guideline } from '../types/project';

interface ProjectGuidelinesProps {
    guidelines: Guideline[];
    onGuidelineEdit?: (guideline: Guideline) => void;
    onGuidelineDelete?: (guidelineId: string) => void;
    onGuidelineToggle?: (guidelineId: string, isActive: boolean) => void;
}

const ProjectGuidelines: React.FC<ProjectGuidelinesProps> = ({
    guidelines,
    onGuidelineEdit,
    onGuidelineDelete,
    onGuidelineToggle
}) => {
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getCategoryIcon = (category: string): string => {
        switch (category) {
            case 'general':
                return '📋';
            case 'analysis':
                return '📊';
            case 'writing':
                return '✍️';
            case 'research':
                return '🔍';
            default:
                return '📝';
        }
    };

    if (guidelines.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <div className="text-gray-400 text-4xl mb-2">📋</div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">설정된 지침이 없습니다</h3>
                <p className="text-sm text-gray-500">
                    AI 응답 방식을 설정하여 더 정확한 답변을 받으세요
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">프로젝트 지침</h3>
                <p className="text-sm text-gray-600 mt-1">
                    총 {guidelines.length}개 지침
                </p>
            </div>

            <div className="divide-y divide-gray-200">
                {guidelines.map((guideline) => (
                    <div
                        key={guideline.id}
                        className="p-4 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                                <div className="text-xl mt-1">
                                    {getCategoryIcon(guideline.category)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <h4 className="text-sm font-medium text-gray-800">
                                            {guideline.title}
                                        </h4>
                                        <span className={`px-2 py-1 text-xs rounded-full ${guideline.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {guideline.isActive ? '활성' : '비활성'}
                                        </span>
                                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                            {guideline.category}
                                        </span>
                                    </div>

                                    <div className="text-sm text-gray-700 mb-2 leading-relaxed">
                                        {guideline.content.length > 200
                                            ? `${guideline.content.substring(0, 200)}...`
                                            : guideline.content
                                        }
                                    </div>

                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                        <span>생성: {formatDate(guideline.createdAt)}</span>
                                        {guideline.updatedAt !== guideline.createdAt && (
                                            <span>수정: {formatDate(guideline.updatedAt)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-1">
                                {onGuidelineToggle && (
                                    <button
                                        onClick={() => onGuidelineToggle(guideline.id, !guideline.isActive)}
                                        className={`p-2 rounded transition-colors ${guideline.isActive
                                            ? 'text-green-600 hover:text-green-800'
                                            : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                        title={guideline.isActive ? '비활성화' : '활성화'}
                                    >
                                        {guideline.isActive ? '✅' : '⭕'}
                                    </button>
                                )}

                                {onGuidelineEdit && (
                                    <button
                                        onClick={() => onGuidelineEdit(guideline)}
                                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                                        title="지침 수정"
                                    >
                                        ✏️
                                    </button>
                                )}

                                {onGuidelineDelete && (
                                    <button
                                        onClick={() => onGuidelineDelete(guideline.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        title="지침 삭제"
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectGuidelines;
