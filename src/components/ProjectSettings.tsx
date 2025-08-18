import React, { useState } from 'react';
import { Project } from '../types/project';

interface ProjectSettingsProps {
    project: Project;
    onUpdateSettings: (projectId: string, settings: Partial<Project>) => void;
    onArchiveProject: (projectId: string) => void;
    onDeleteProject: (projectId: string) => void;
}

const ProjectSettings: React.FC<ProjectSettingsProps> = ({
    project,
    onUpdateSettings,
    onArchiveProject,
    onDeleteProject
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedProject, setEditedProject] = useState({
        name: project.name,
        description: project.description || '',
        priority: project.priority,
        status: project.status
    });
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSave = async () => {
        try {
            setIsProcessing(true);
            await onUpdateSettings(project.id, editedProject);
            setIsEditing(false);
        } catch (error) {
            console.error('설정 저장 실패:', error);
            alert('설정 저장에 실패했습니다.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancel = () => {
        setEditedProject({
            name: project.name,
            description: project.description || '',
            priority: project.priority,
            status: project.status
        });
        setIsEditing(false);
    };

    const handleArchive = async () => {
        if (window.confirm('이 프로젝트를 보관하시겠습니까? 보관된 프로젝트는 비활성화됩니다.')) {
            try {
                setIsProcessing(true);
                await onArchiveProject(project.id);
            } catch (error) {
                console.error('프로젝트 보관 실패:', error);
                alert('프로젝트 보관에 실패했습니다.');
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const handleDelete = async () => {
        if (window.confirm('이 프로젝트를 영구적으로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            try {
                setIsProcessing(true);
                await onDeleteProject(project.id);
            } catch (error) {
                console.error('프로젝트 삭제 실패:', error);
                alert('프로젝트 삭제에 실패했습니다.');
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'high':
                return '높음';
            case 'medium':
                return '보통';
            case 'low':
                return '낮음';
            default:
                return '미설정';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">프로젝트 설정</h3>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        ✏️ 편집
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-4">
                    {/* 프로젝트 이름 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            프로젝트 이름
                        </label>
                        <input
                            type="text"
                            value={editedProject.name}
                            onChange={(e) => setEditedProject(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* 프로젝트 설명 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            프로젝트 설명
                        </label>
                        <textarea
                            value={editedProject.description}
                            onChange={(e) => setEditedProject(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    {/* 우선순위 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            우선순위
                        </label>
                        <select
                            value={editedProject.priority}
                            onChange={(e) => setEditedProject(prev => ({ ...prev, priority: e.target.value as 'high' | 'medium' | 'low' }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="low">낮음</option>
                            <option value="medium">보통</option>
                            <option value="high">높음</option>
                        </select>
                    </div>

                    {/* 상태 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            상태
                        </label>
                        <select
                            value={editedProject.status}
                            onChange={(e) => setEditedProject(prev => ({ ...prev, status: e.target.value as 'active' | 'archived' }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="active">활성</option>
                            <option value="archived">보관</option>
                        </select>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex space-x-2 pt-4">
                        <button
                            onClick={handleSave}
                            disabled={isProcessing || !editedProject.name.trim()}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isProcessing ? '저장 중...' : '저장'}
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={isProcessing}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            취소
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* 현재 설정 표시 */}
                    <div className="space-y-3">
                        <div>
                            <span className="text-sm text-gray-600">프로젝트 이름:</span>
                            <p className="text-sm font-medium text-gray-900">{project.name}</p>
                        </div>

                        {project.description && (
                            <div>
                                <span className="text-sm text-gray-600">설명:</span>
                                <p className="text-sm text-gray-900">{project.description}</p>
                            </div>
                        )}

                        <div>
                            <span className="text-sm text-gray-600">우선순위:</span>
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getPriorityColor(project.priority)}`}>
                                {getPriorityLabel(project.priority)}
                            </span>
                        </div>

                        <div>
                            <span className="text-sm text-gray-600">상태:</span>
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${project.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                {project.status === 'active' ? '활성' : '보관'}
                            </span>
                        </div>

                        <div>
                            <span className="text-sm text-gray-600">생성일:</span>
                            <p className="text-sm text-gray-900">
                                {new Date(project.createdAt).toLocaleDateString('ko-KR')}
                            </p>
                        </div>

                        <div>
                            <span className="text-sm text-gray-600">마지막 업데이트:</span>
                            <p className="text-sm text-gray-900">
                                {new Date(project.updatedAt).toLocaleDateString('ko-KR')}
                            </p>
                        </div>
                    </div>

                    {/* 위험한 액션 */}
                    <div className="pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">위험한 액션</h4>
                        <div className="space-y-2">
                            <button
                                onClick={handleArchive}
                                disabled={isProcessing || project.status === 'archived'}
                                className="w-full text-left px-3 py-2 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                📦 프로젝트 보관
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isProcessing}
                                className="w-full text-left px-3 py-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                🗑️ 프로젝트 삭제
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectSettings;
