import React, { useState, useEffect, useRef } from 'react';
import { mediaKnowledgeAPI, ProjectCreate, MediaFile, KnowledgeEntry, PopupCreate, Popup } from '../services/mediaKnowledgeAPI';

interface MediaKnowledgeSystemProps {
    onKnowledgeExtracted?: (knowledge: any) => void;
}

const MediaKnowledgeSystem: React.FC<MediaKnowledgeSystemProps> = ({
    onKnowledgeExtracted
}) => {
    const [selectedProject, setSelectedProject] = useState<string>('');
    const [projects, setProjects] = useState<Array<{ id: string; name: string; description?: string; category?: string }>>([]);
    const [projectFiles, setProjectFiles] = useState<MediaFile[]>([]);
    const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeEntry[]>([]);
    const [popups, setPopups] = useState<Popup[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [serverStatus, setServerStatus] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'upload' | 'files' | 'knowledge' | 'popups'>('upload');

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        checkServerStatus();
        loadProjects();
    }, []);

    useEffect(() => {
        if (selectedProject) {
            loadProjectData();
        }
    }, [selectedProject]);

    const checkServerStatus = async () => {
        try {
            const isHealthy = await mediaKnowledgeAPI.checkStatus();
            setServerStatus(isHealthy);
        } catch (err) {
            setServerStatus(false);
        }
    };

    const loadProjects = async () => {
        // 시뮬레이션: 실제로는 API에서 프로젝트 목록을 가져옴
        const mockProjects = [
            { id: 'project_1', name: '건설 프로젝트 A', description: '주거 건설 프로젝트', category: '건설' },
            { id: 'project_2', name: '부동산 개발 B', description: '상업 시설 개발', category: '부동산' },
            { id: 'project_3', name: 'IT 시스템 구축', description: '기업 IT 인프라 구축', category: 'IT' }
        ];
        setProjects(mockProjects);
    };

    const loadProjectData = async () => {
        if (!selectedProject) return;

        try {
            setIsLoading(true);

            // 프로젝트 파일 목록 조회
            const files = await mediaKnowledgeAPI.getProjectFiles(selectedProject);
            setProjectFiles(files);

            // 지식 베이스 조회
            const knowledge = await mediaKnowledgeAPI.getProjectKnowledge(selectedProject);
            setKnowledgeBase(knowledge);

            // 팝업 목록 조회
            const projectPopups = await mediaKnowledgeAPI.getProjectPopups(selectedProject);
            setPopups(projectPopups);

        } catch (err) {
            setError('프로젝트 데이터 로드 실패');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0 || !selectedProject) return;

        try {
            setIsLoading(true);
            setError('');

            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                // 파일 업로드
                const uploadResult = await mediaKnowledgeAPI.uploadMedia(file, selectedProject);

                // 파일 분석
                const analysisResult = await mediaKnowledgeAPI.analyzeFile(uploadResult.file_id);

                // 지식 베이스에 추가
                onKnowledgeExtracted?.(analysisResult);
            }

            // 프로젝트 데이터 새로고침
            await loadProjectData();

        } catch (err) {
            setError('파일 업로드 및 분석 실패');
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const createNewProject = async () => {
        const projectName = prompt('프로젝트 이름을 입력하세요:');
        if (!projectName) return;

        try {
            const projectData: ProjectCreate = {
                name: projectName,
                description: prompt('프로젝트 설명을 입력하세요:') || undefined,
                category: prompt('프로젝트 카테고리를 입력하세요:') || undefined
            };

            const projectId = await mediaKnowledgeAPI.createProject(projectData);
            setSelectedProject(projectId);

            // 프로젝트 목록 새로고침
            await loadProjects();

        } catch (err) {
            setError('프로젝트 생성 실패');
        }
    };

    const createPopup = async () => {
        const popupData: PopupCreate = {
            popup_type: 'info',
            title: prompt('팝업 제목을 입력하세요:') || '정보',
            content: prompt('팝업 내용을 입력하세요:') || '내용을 입력하세요',
            position_x: 100,
            position_y: 100
        };

        try {
            await mediaKnowledgeAPI.createPopup(selectedProject, popupData);
            await loadProjectData();
        } catch (err) {
            setError('팝업 생성 실패');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) return '🖼️';
        if (mimeType.startsWith('video/')) return '🎥';
        if (mimeType.startsWith('audio/')) return '🎵';
        if (mimeType.includes('pdf')) return '📄';
        if (mimeType.includes('document')) return '📝';
        return '📁';
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">📁 미디어 지식 시스템</h1>
                <p className="text-gray-600">미디어 파일 업로드, 프로젝트별 자동 분류, 지식 베이스 구축, 팝업 관리 기능입니다.</p>

                {/* 서버 상태 표시 */}
                <div className="mt-4 flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${serverStatus ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`text-sm ${serverStatus ? 'text-green-600' : 'text-red-600'}`}>
                        {serverStatus ? '미디어 지식 서버 연결됨' : '미디어 지식 서버 연결 안됨'}
                    </span>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* 프로젝트 선택 */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">프로젝트 관리</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    프로젝트 선택
                                </label>
                                <select
                                    value={selectedProject}
                                    onChange={(e) => setSelectedProject(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">프로젝트를 선택하세요</option>
                                    {projects.map((project) => (
                                        <option key={project.id} value={project.id}>
                                            {project.name} ({project.category})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={createNewProject}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                            >
                                새 프로젝트 생성
                            </button>
                        </div>
                    </div>
                </div>

                {/* 메인 콘텐츠 */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        {/* 탭 네비게이션 */}
                        <div className="flex space-x-1 mb-6">
                            <button
                                onClick={() => setActiveTab('upload')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'upload' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                📤 파일 업로드
                            </button>
                            <button
                                onClick={() => setActiveTab('files')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'files' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                📁 파일 목록
                            </button>
                            <button
                                onClick={() => setActiveTab('knowledge')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'knowledge' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                🧠 지식 베이스
                            </button>
                            <button
                                onClick={() => setActiveTab('popups')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'popups' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                💬 팝업 관리
                            </button>
                        </div>

                        {/* 파일 업로드 탭 */}
                        {activeTab === 'upload' && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">미디어 파일 업로드</h3>

                                {!selectedProject ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">먼저 프로젝트를 선택해주세요.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                multiple
                                                onChange={handleFileUpload}
                                                className="hidden"
                                                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                                            />
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isLoading}
                                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                                            >
                                                {isLoading ? '업로드 중...' : '파일 선택 및 업로드'}
                                            </button>
                                            <p className="mt-2 text-sm text-gray-500">
                                                이미지, 비디오, 오디오, 문서 파일을 업로드할 수 있습니다.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 파일 목록 탭 */}
                        {activeTab === 'files' && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">프로젝트 파일 목록</h3>

                                {projectFiles.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">업로드된 파일이 없습니다.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {projectFiles.map((file) => (
                                            <div key={file.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-2xl">{getFileIcon(file.mime_type)}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {file.original_filename}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {formatFileSize(file.file_size)} • {file.mime_type}
                                                        </p>
                                                        {file.confidence_score > 0 && (
                                                            <p className="text-xs text-blue-600">
                                                                분석 신뢰도: {(file.confidence_score * 100).toFixed(1)}%
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                {file.summary && (
                                                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                                                        {file.summary}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 지식 베이스 탭 */}
                        {activeTab === 'knowledge' && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">지식 베이스</h3>

                                {knowledgeBase.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">추출된 지식이 없습니다.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {knowledgeBase.map((entry) => (
                                            <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900 mb-2">
                                                            {entry.content}
                                                        </p>
                                                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                            <span>타입: {entry.knowledge_type}</span>
                                                            <span>출처: {entry.source_filename}</span>
                                                            <span>생성: {new Date(entry.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        {entry.tags.length > 0 && (
                                                            <div className="mt-2 flex flex-wrap gap-1">
                                                                {entry.tags.map((tag, index) => (
                                                                    <span
                                                                        key={index}
                                                                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                                                                    >
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 팝업 관리 탭 */}
                        {activeTab === 'popups' && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">팝업 관리</h3>
                                    <button
                                        onClick={createPopup}
                                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                                    >
                                        새 팝업 생성
                                    </button>
                                </div>

                                {popups.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">생성된 팝업이 없습니다.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {popups.map((popup) => (
                                            <div key={popup.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900 mb-1">{popup.title}</h4>
                                                        <p className="text-sm text-gray-600 mb-2">{popup.content}</p>
                                                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                            <span>타입: {popup.popup_type}</span>
                                                            <span>위치: ({popup.position_x}, {popup.position_y})</span>
                                                            <span>상태: {popup.is_active ? '활성' : '비활성'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                                                            편집
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MediaKnowledgeSystem; 