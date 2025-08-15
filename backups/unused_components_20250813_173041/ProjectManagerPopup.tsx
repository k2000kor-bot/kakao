import React, { useState, useEffect } from 'react';
import {
    FolderIcon,
    BookOpenIcon,
    CheckCircleIcon,
    LightBulbIcon,
    XMarkIcon,
    PlusIcon,
    TrashIcon,
    PencilIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useModalClose } from '../hooks/useModalClose';

interface ProjectManagerPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Project {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'draft' | 'completed';
    knowledgeItems: number;
    lastUpdated: string;
}

interface KnowledgeItem {
    id: string;
    title: string;
    type: 'document' | 'conversation' | 'guideline' | 'selling_point';
    content: string;
    projectId: string;
    createdAt: string;
}

const ProjectManagerPopup: React.FC<ProjectManagerPopupProps> = ({ isOpen, onClose }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
    const [activeTab, setActiveTab] = useState<'projects' | 'knowledge' | 'guidelines' | 'selling_points'>('projects');
    const [isLoading, setIsLoading] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newKnowledgeTitle, setNewKnowledgeTitle] = useState('');
    const [newKnowledgeContent, setNewKnowledgeContent] = useState('');
    const [newKnowledgeType, setNewKnowledgeType] = useState<'document' | 'conversation' | 'guideline' | 'selling_point'>('document');

    const { modalRef, handleClose } = useModalClose({
        isOpen,
        onClose
    });

    // 프로젝트 로드
    const loadProjects = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8003/api/v8/projects');
            const data = await response.json();

            if (data.success) {
                setProjects(data.projects);
            } else {
                // 샘플 프로젝트 데이터
                setProjects([
                    {
                        id: '1',
                        name: '개포우성7차 재건축 프로젝트',
                        description: '재건축 관련 모든 커뮤니케이션 및 마케팅 자료',
                        status: 'active',
                        knowledgeItems: 15,
                        lastUpdated: new Date().toISOString()
                    },
                    {
                        id: '2',
                        name: '시공사 선정 프로젝트',
                        description: 'GS건설, 파르나스 등 시공사 관련 정보',
                        status: 'active',
                        knowledgeItems: 8,
                        lastUpdated: new Date().toISOString()
                    }
                ]);
            }
        } catch (error) {
            console.error('프로젝트 로드 오류:', error);
            // 폴백 데이터 설정
            setProjects([]);
        } finally {
            setIsLoading(false);
        }
    };

    // 지식 아이템 로드
    const loadKnowledgeItems = async (projectId: string) => {
        try {
            const response = await fetch(`http://localhost:8003/api/v8/projects/${projectId}/knowledge`);
            const data = await response.json();

            if (data.success) {
                setKnowledgeItems(data.knowledgeItems);
            } else {
                // 샘플 지식 아이템
                setKnowledgeItems([
                    {
                        id: '1',
                        title: '재건축 사업 개요',
                        type: 'document',
                        content: '개포우성7차 재건축 사업의 전체적인 개요와 일정',
                        projectId: projectId,
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: '2',
                        title: '조합원 대화 분석',
                        type: 'conversation',
                        content: '주요 관심사: 환급금, 시공사 선정, 일정',
                        projectId: projectId,
                        createdAt: new Date().toISOString()
                    }
                ]);
            }
        } catch (error) {
            console.error('지식 아이템 로드 오류:', error);
            setKnowledgeItems([]);
        }
    };

    // 새 프로젝트 생성
    const createProject = async () => {
        if (!newProjectName.trim()) return;

        try {
            const response = await fetch('http://localhost:8003/api/v8/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newProjectName,
                    description: `${newProjectName} 관련 지식 베이스`,
                    status: 'active'
                })
            });

            const data = await response.json();

            if (data.success) {
                await loadProjects();
                setNewProjectName('');
            }
        } catch (error) {
            console.error('프로젝트 생성 오류:', error);
            // 로컬 생성
            const newProject: Project = {
                id: Date.now().toString(),
                name: newProjectName,
                description: `${newProjectName} 관련 지식 베이스`,
                status: 'active',
                knowledgeItems: 0,
                lastUpdated: new Date().toISOString()
            };
            setProjects(prev => [...prev, newProject]);
            setNewProjectName('');
        }
    };

    // 지식 아이템 추가
    const addKnowledgeItem = async () => {
        if (!newKnowledgeTitle.trim() || !newKnowledgeContent.trim() || !selectedProject) return;

        try {
            const response = await fetch(`http://localhost:8003/api/v8/projects/${selectedProject.id}/knowledge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: newKnowledgeTitle,
                    content: newKnowledgeContent,
                    type: 'document'
                })
            });

            const data = await response.json();

            if (data.success) {
                await loadKnowledgeItems(selectedProject.id);
                setNewKnowledgeTitle('');
                setNewKnowledgeContent('');
            }
        } catch (error) {
            console.error('지식 아이템 추가 오류:', error);
            // 로컬 추가
            const newItem: KnowledgeItem = {
                id: Date.now().toString(),
                title: newKnowledgeTitle,
                type: 'document',
                content: newKnowledgeContent,
                projectId: selectedProject.id,
                createdAt: new Date().toISOString()
            };
            setKnowledgeItems(prev => [...prev, newItem]);
            setNewKnowledgeTitle('');
            setNewKnowledgeContent('');
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadProjects();
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedProject) {
            loadKnowledgeItems(selectedProject.id);
        }
    }, [selectedProject]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div ref={modalRef} className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                        <FolderIcon className="w-7 h-7 text-blue-500" />
                        <span>프로젝트 관리</span>
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="프로젝트 관리 모달 닫기"
                        title="ESC 키로도 닫을 수 있습니다"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* 탭 네비게이션 */}
                <div className="flex space-x-1 mb-6 bg-gray-100 rounded-xl p-1">
                    {[
                        { id: 'projects' as const, label: '프로젝트', icon: FolderIcon },
                        { id: 'knowledge' as const, label: '지식베이스', icon: BookOpenIcon },
                        { id: 'guidelines' as const, label: '가이드라인', icon: CheckCircleIcon },
                        { id: 'selling_points' as const, label: '셀링포인트', icon: LightBulbIcon }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tab.id
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* 프로젝트 탭 */}
                {activeTab === 'projects' && (
                    <div className="space-y-4">
                        {/* 새 프로젝트 생성 */}
                        <div className="bg-blue-50 rounded-xl p-4">
                            <h3 className="font-semibold text-gray-800 mb-3">새 프로젝트 생성</h3>
                            <div className="flex space-x-3">
                                <input
                                    type="text"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    placeholder="프로젝트 이름을 입력하세요"
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={createProject}
                                    disabled={!newProjectName.trim()}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    생성
                                </button>
                            </div>
                        </div>

                        {/* 프로젝트 목록 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    onClick={() => setSelectedProject(project)}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedProject?.id === project.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-gray-800">{project.name}</h4>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${project.status === 'active'
                                                ? 'bg-green-100 text-green-700'
                                                : project.status === 'draft'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {project.status === 'active' ? '활성' : project.status === 'draft' ? '작성중' : '완료'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <span>{project.knowledgeItems}개 아이템</span>
                                        <span>{new Date(project.lastUpdated).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 지식베이스 탭 */}
                {activeTab === 'knowledge' && (
                    <div className="space-y-4">
                        {selectedProject ? (
                            <>
                                {/* 새 지식 아이템 추가 */}
                                <div className="bg-green-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-800 mb-3">새 지식 추가 - {selectedProject.name}</h3>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={newKnowledgeTitle}
                                            onChange={(e) => setNewKnowledgeTitle(e.target.value)}
                                            placeholder="제목을 입력하세요"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                        <textarea
                                            value={newKnowledgeContent}
                                            onChange={(e) => setNewKnowledgeContent(e.target.value)}
                                            placeholder="내용을 입력하세요"
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                                        />
                                        <button
                                            onClick={addKnowledgeItem}
                                            disabled={!newKnowledgeTitle.trim() || !newKnowledgeContent.trim()}
                                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            추가
                                        </button>
                                    </div>
                                </div>

                                {/* 지식 아이템 목록 */}
                                <div className="space-y-3">
                                    {knowledgeItems.map((item) => (
                                        <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-gray-800">{item.title}</h4>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.type === 'document'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : item.type === 'conversation'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-purple-100 text-purple-700'
                                                    }`}>
                                                    {item.type === 'document' ? '문서' : item.type === 'conversation' ? '대화' : '가이드'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{item.content}</p>
                                            <div className="text-xs text-gray-500">
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">먼저 프로젝트를 선택해주세요.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* 가이드라인 탭 */}
                {activeTab === 'guidelines' && (
                    <div className="space-y-4">
                        <div className="bg-yellow-50 rounded-xl p-4">
                            <h3 className="font-semibold text-gray-800 mb-3">커뮤니케이션 가이드라인</h3>
                            <div className="space-y-2">
                                {[
                                    '조합원들의 우려사항에 대해 공감적으로 응답하기',
                                    '투명한 정보 공개를 통한 신뢰 구축',
                                    '전문적이면서도 이해하기 쉬운 언어 사용',
                                    '시급한 사안에 대해서는 즉시 대응',
                                    '갈등 상황에서는 중재자 역할 수행'
                                ].map((guideline, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                        <span className="text-sm text-gray-700">{guideline}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 셀링포인트 탭 */}
                {activeTab === 'selling_points' && (
                    <div className="space-y-4">
                        <div className="bg-purple-50 rounded-xl p-4">
                            <h3 className="font-semibold text-gray-800 mb-3">핵심 셀링포인트</h3>
                            <div className="space-y-2">
                                {[
                                    '검증된 시공사와의 파트너십으로 품질 보장',
                                    '투명한 조합 운영과 정기적인 보고',
                                    '조합원 의견 수렴을 통한 민주적 의사결정',
                                    '최적화된 환급금 조건과 합리적인 분담금',
                                    '체계적인 일정 관리와 정확한 입주 예정일'
                                ].map((point, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <LightBulbIcon className="w-4 h-4 text-purple-500" />
                                        <span className="text-sm text-gray-700">{point}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectManagerPopup; 