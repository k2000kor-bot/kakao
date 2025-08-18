import React from 'react';
import { Project } from '../types/project';

interface ProjectStatsProps {
    project: Project;
}

const ProjectStats: React.FC<ProjectStatsProps> = ({ project }) => {
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getTotalFileSize = (): number => {
        return project.files.reduce((total, file) => total + file.size, 0);
    };

    const getActiveGuidelines = (): number => {
        return project.guidelines.filter(g => g.isActive).length;
    };

    const getRecentActivity = (): string => {
        const lastMessage = project.chats[project.chats.length - 1];
        if (lastMessage) {
            const date = new Date(lastMessage.lastActivity);
            return date.toLocaleDateString('ko-KR');
        }
        return '활동 없음';
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">프로젝트 통계</h3>

            <div className="grid grid-cols-2 gap-4">
                {/* 기본 정보 */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">생성일</span>
                        <span className="text-sm font-medium">
                            {new Date(project.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">마지막 업데이트</span>
                        <span className="text-sm font-medium">
                            {new Date(project.updatedAt).toLocaleDateString('ko-KR')}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">상태</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${project.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                            {project.status === 'active' ? '활성' : '비활성'}
                        </span>
                    </div>
                </div>

                {/* 통계 정보 */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">총 메시지</span>
                        <span className="text-sm font-medium">{project.analytics.totalMessages}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">업로드된 파일</span>
                        <span className="text-sm font-medium">{project.analytics.totalFiles}개</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">활성 지침</span>
                        <span className="text-sm font-medium">{getActiveGuidelines()}개</span>
                    </div>
                </div>
            </div>

            {/* 파일 정보 */}
            {project.files.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">파일 정보</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">총 파일 크기</span>
                            <span className="text-xs font-medium">{formatFileSize(getTotalFileSize())}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">파일 유형</span>
                            <span className="text-xs font-medium">
                                {Array.from(new Set(project.files.map(f => f.type))).join(', ')}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* 최근 활동 */}
            <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">최근 활동</h4>
                <div className="text-xs text-gray-600">
                    마지막 활동: {getRecentActivity()}
                </div>
            </div>
        </div>
    );
};

export default ProjectStats;
