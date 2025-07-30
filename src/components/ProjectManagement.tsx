import React, { useState, useEffect } from 'react';
import {
  StarIcon,
    FolderIcon,
    CalendarIcon,
    UserGroupIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

interface Project {
    id: string;
    name: string;
    description: string;
    status: 'planning' | 'active' | 'completed' | 'on-hold';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    progress: number;
    startDate: string;
    endDate: string;
    team: string[];
    tasks: Task[];
}

interface Task {
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'review' | 'completed';
    assignee: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
}

const ProjectManagement: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showAddProject, setShowAddProject] = useState(false);
    const [showAddTask, setShowAddTask] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        // 시뮬레이션된 프로젝트 데이터
        const mockProjects: Project[] = [
            {
                id: '1',
                name: '개포우성7차 재개발 프로젝트',
                description: '개포우성7차 아파트 재개발 사업 계획 및 실행',
                status: 'active',
                priority: 'high',
                progress: 65,
                startDate: '2024-01-01',
                endDate: '2024-12-31',
                team: ['김철수', '이영희', '박민수', '정수진'],
                tasks: [
                    {
                        id: '1-1',
                        title: '사업계획서 작성',
                        description: '재개발 사업계획서 초안 작성',
                        status: 'completed',
                        assignee: '김철수',
                        dueDate: '2024-02-15',
                        priority: 'high'
                    },
                    {
                        id: '1-2',
                        title: '조합원 설득 자료 준비',
                        description: '조합원 동의를 위한 설명 자료 작성',
                        status: 'in-progress',
                        assignee: '이영희',
                        dueDate: '2024-03-01',
                        priority: 'medium'
                    },
                    {
                        id: '1-3',
                        title: '입찰 참여 준비',
                        description: '입찰 참여를 위한 서류 준비',
                        status: 'todo',
                        assignee: '박민수',
                        dueDate: '2024-04-01',
                        priority: 'high'
                    }
                ]
            },
            {
                id: '2',
                name: 'AI 분석 시스템 구축',
                description: '대화 분석을 위한 AI 시스템 개발',
                status: 'active',
                priority: 'medium',
                progress: 45,
                startDate: '2024-01-15',
                endDate: '2024-06-30',
                team: ['정수진', '김철수'],
                tasks: [
                    {
                        id: '2-1',
                        title: 'AI 모델 설계',
                        description: '감정 분석 AI 모델 설계',
                        status: 'completed',
                        assignee: '정수진',
                        dueDate: '2024-02-01',
                        priority: 'high'
                    },
                    {
                        id: '2-2',
                        title: '데이터 전처리',
                        description: '대화 데이터 전처리 및 정제',
                        status: 'in-progress',
                        assignee: '김철수',
                        dueDate: '2024-03-15',
                        priority: 'medium'
                    }
                ]
            }
        ];

        setProjects(mockProjects);
        if (mockProjects.length > 0) {
            setSelectedProject(mockProjects[0]);
        }
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'planning': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-gray-100 text-gray-800';
            case 'on-hold': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTaskStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'in-progress': return 'bg-blue-100 text-blue-800';
            case 'review': return 'bg-purple-100 text-purple-800';
            case 'todo': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredProjects = projects.filter(project =>
        filterStatus === 'all' || project.status === filterStatus
    );

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <FolderIcon className="w-8 h-8 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">프로젝트 관리</h2>
                </div>

                <div className="flex items-center space-x-4">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">모든 상태</option>
                        <option value="planning">계획 중</option>
                        <option value="active">진행 중</option>
                        <option value="completed">완료</option>
                        <option value="on-hold">보류</option>
                    </select>

                    <button
                        onClick={() => setShowAddProject(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span>새 프로젝트</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 프로젝트 목록 */}
                <div className="lg:col-span-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">프로젝트 목록</h3>
                    <div className="space-y-3">
                        {filteredProjects.map((project) => (
                            <div
                                key={project.id}
                                onClick={() => setSelectedProject(project)}
                                className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedProject?.id === project.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-semibold text-gray-900">{project.name}</h4>
                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                                        {project.status === 'active' ? '진행 중' :
                                            project.status === 'planning' ? '계획 중' :
                                                project.status === 'completed' ? '완료' : '보류'}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 mb-3">{project.description}</p>

                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                        <UserGroupIcon className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">{project.team.length}명</span>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(project.priority)}`}>
                                        {project.priority === 'urgent' ? '긴급' :
                                            project.priority === 'high' ? '높음' :
                                                project.priority === 'medium' ? '보통' : '낮음'}
                                    </span>
                                </div>

                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${project.progress}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>진행률</span>
                                    <span>{project.progress}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 프로젝트 상세 */}
                {selectedProject && (
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">{selectedProject.name}</h3>
                            <button
                                onClick={() => setShowAddTask(true)}
                                className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <PlusIcon className="w-4 h-4" />
                                <span>새 작업</span>
                            </button>
                        </div>

                        {/* 프로젝트 정보 */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">설명</p>
                                    <p className="text-gray-900">{selectedProject.description}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">팀원</p>
                                    <div className="flex flex-wrap gap-1">
                                        {selectedProject.team.map((member) => (
                                            <span key={member} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                                {member}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">기간</p>
                                    <div className="flex items-center space-x-2">
                                        <CalendarIcon className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-900">
                                            {selectedProject.startDate} ~ {selectedProject.endDate}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">진행률</p>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${selectedProject.progress}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-medium">{selectedProject.progress}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 작업 목록 */}
                        <div>
                            <h4 className="text-md font-semibold text-gray-900 mb-4">작업 목록</h4>
                            <div className="space-y-3">
                                {selectedProject.tasks.map((task) => (
                                    <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <h5 className="font-medium text-gray-900">{task.title}</h5>
                                                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 text-xs rounded-full ${getTaskStatusColor(task.status)}`}>
                                                    {task.status === 'completed' ? '완료' :
                                                        task.status === 'in-progress' ? '진행 중' :
                                                            task.status === 'review' ? '검토' : '할 일'}
                                                </span>
                                                <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                                                    {task.priority === 'high' ? '높음' :
                                                        task.priority === 'medium' ? '보통' : '낮음'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <div className="flex items-center space-x-4">
                                                <span>담당자: {task.assignee}</span>
                                                <span>마감일: {task.dueDate}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button className="p-1 text-gray-400 hover:text-blue-600">
                                                    <PencilIcon className="w-4 h-4" />
                                                </button>
                                                <button className="p-1 text-gray-400 hover:text-red-600">
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
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

export default ProjectManagement; 