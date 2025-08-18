import React, { useState } from 'react';
import { Project } from '../types/project';

interface ProjectExportProps {
    project: Project;
    onExport: (project: Project) => void;
    onImport: (projectData: string) => void;
}

const ProjectExport: React.FC<ProjectExportProps> = ({
    project,
    onExport,
    onImport
}) => {
    const [importData, setImportData] = useState('');
    const [showImport, setShowImport] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleExport = async () => {
        try {
            setIsProcessing(true);

            // 프로젝트 데이터를 JSON으로 변환
            const exportData = {
                version: '1.0',
                exportedAt: new Date().toISOString(),
                project: {
                    ...project,
                    // 민감한 정보 제거
                    id: undefined,
                    createdAt: undefined,
                    updatedAt: undefined
                }
            };

            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            // 다운로드 링크 생성
            const a = document.createElement('a');
            a.href = url;
            a.download = `${project.name.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_export.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            onExport(project);
        } catch (error) {
            console.error('내보내기 실패:', error);
            alert('프로젝트 내보내기에 실패했습니다.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleImport = async () => {
        try {
            setIsProcessing(true);

            if (!importData.trim()) {
                alert('가져올 데이터를 입력해주세요.');
                return;
            }

            const parsedData = JSON.parse(importData);

            if (!parsedData.project || !parsedData.version) {
                alert('올바른 프로젝트 파일이 아닙니다.');
                return;
            }

            onImport(importData);
            setImportData('');
            setShowImport(false);
        } catch (error) {
            console.error('가져오기 실패:', error);
            alert('프로젝트 가져오기에 실패했습니다. JSON 형식을 확인해주세요.');
        } finally {
            setIsProcessing(false);
        }
    };

    const getProjectSummary = () => {
        return {
            files: project.analytics.totalFiles,
            messages: project.analytics.totalMessages,
            guidelines: project.guidelines.length,
            activeGuidelines: project.guidelines.filter(g => g.isActive).length,
            totalSize: project.files.reduce((sum, file) => sum + file.size, 0)
        };
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const summary = getProjectSummary();

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">프로젝트 내보내기/가져오기</h3>

            {/* 프로젝트 요약 */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">현재 프로젝트 요약</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">파일:</span>
                        <span className="font-medium">{summary.files}개</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">메시지:</span>
                        <span className="font-medium">{summary.messages}개</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">지침:</span>
                        <span className="font-medium">{summary.activeGuidelines}/{summary.guidelines}개</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">총 크기:</span>
                        <span className="font-medium">{formatFileSize(summary.totalSize)}</span>
                    </div>
                </div>
            </div>

            {/* 내보내기 섹션 */}
            <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">프로젝트 내보내기</h4>
                <p className="text-xs text-gray-600 mb-3">
                    현재 프로젝트를 JSON 파일로 내보내서 백업하거나 다른 곳에서 사용할 수 있습니다.
                </p>
                <button
                    onClick={handleExport}
                    disabled={isProcessing}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isProcessing ? '내보내는 중...' : '📤 프로젝트 내보내기'}
                </button>
            </div>

            {/* 가져오기 섹션 */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">프로젝트 가져오기</h4>
                    <button
                        onClick={() => setShowImport(!showImport)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        {showImport ? '취소' : '가져오기'}
                    </button>
                </div>

                {showImport && (
                    <div className="space-y-3">
                        <p className="text-xs text-gray-600">
                            JSON 파일의 내용을 붙여넣어 프로젝트를 가져올 수 있습니다.
                        </p>
                        <textarea
                            value={importData}
                            onChange={(e) => setImportData(e.target.value)}
                            placeholder="JSON 데이터를 여기에 붙여넣으세요..."
                            className="w-full h-32 p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                        <div className="flex space-x-2">
                            <button
                                onClick={handleImport}
                                disabled={isProcessing || !importData.trim()}
                                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isProcessing ? '가져오는 중...' : '📥 프로젝트 가져오기'}
                            </button>
                            <button
                                onClick={() => {
                                    setImportData('');
                                    setShowImport(false);
                                }}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 주의사항 */}
            <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h5 className="text-sm font-medium text-yellow-800 mb-1">⚠️ 주의사항</h5>
                <ul className="text-xs text-yellow-700 space-y-1">
                    <li>• 내보내기 시 프로젝트 ID와 타임스탬프는 제거됩니다</li>
                    <li>• 가져오기 시 새로운 프로젝트 ID가 생성됩니다</li>
                    <li>• 파일 URL은 재설정이 필요할 수 있습니다</li>
                    <li>• 가져오기 전에 기존 데이터를 백업하세요</li>
                </ul>
            </div>
        </div>
    );
};

export default ProjectExport;
