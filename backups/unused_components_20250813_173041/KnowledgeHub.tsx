import React from 'react';
import AdvancedFileUploadWithLearning from './AdvancedFileUploadWithLearning';
import KnowledgeBaseDashboard from './KnowledgeBaseDashboard';
import FileStorageStatus from './FileStorageStatus';
import DeepLearningManager from './DeepLearningManager';
import { Project } from '../types/project';

interface KnowledgeHubProps {
    project: Project;
    onProjectUpdate: (project: Project) => void;
}

const KnowledgeHub: React.FC<KnowledgeHubProps> = ({ project, onProjectUpdate }) => {
    return (
        <div className="space-y-6">
            {/* 지식 베이스 요약 및 상태 */}
            <KnowledgeBaseDashboard projectId={project.id} />

            {/* 업로드/분석/지식 반영 파이프라인 */}
            <AdvancedFileUploadWithLearning
                isOpen={false}
                onClose={() => {}}
                projectId={project.id}
                onFileProcessed={() => {
                    window.dispatchEvent(new CustomEvent('knowledgeBaseUpdated', { detail: { projectId: project.id } }));
                }}
            />

            {/* 현재 프로젝트 파일 저장 현황 */}
            <FileStorageStatus projectId={project.id} />

            {/* 딥러닝 매니저 (필요 시 전체 기능 사용 가능) */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">딥러닝</h3>
                <DeepLearningManager projectId={project.id} files={project.files} />
            </div>
        </div>
    );
};

export default KnowledgeHub;


