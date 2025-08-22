import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Play,
    Pause,
    Square,
    Settings,
    Plus,
    Edit,
    Trash2,
    Eye,
    Copy,
    Download,
    Upload,
    RefreshCw,
    Clock,
    Calendar,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Info,
    Zap,
    Brain,
    Target,
    TrendingUp,
    Users,
    MessageSquare,
    Folder,
    Database,
    Shield,
    Bell,
    Star,
    Heart,
    Share2,
    ExternalLink,
    ArrowRight,
    ArrowLeft,
    ChevronDown,
    ChevronUp,
    MoreVertical
} from 'lucide-react';

interface WorkflowStep {
    id: string;
    name: string;
    type: 'trigger' | 'action' | 'condition' | 'delay' | 'notification';
    description: string;
    config: any;
    order: number;
    isActive: boolean;
}

interface Workflow {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'draft' | 'error';
    trigger: string;
    steps: WorkflowStep[];
    createdAt: Date;
    updatedAt: Date;
    lastExecuted?: Date;
    executionCount: number;
    successRate: number;
    isTemplate: boolean;
    category: 'automation' | 'notification' | 'data' | 'integration';
    priority: 'low' | 'medium' | 'high' | 'critical';
}

interface SystemWorkflowManagementProps {
    onWorkflowAction?: (action: string, workflow: Workflow) => void;
}

const SystemWorkflowManagement: React.FC<SystemWorkflowManagementProps> = ({ onWorkflowAction }) => {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [filterCategory, setFilterCategory] = useState<'all' | 'automation' | 'notification' | 'data' | 'integration'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'draft' | 'error'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'status' | 'createdAt' | 'lastExecuted' | 'executionCount'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    // Mock 데이터 생성
    useEffect(() => {
        const mockWorkflows: Workflow[] = [
            {
                id: '1',
                name: '프로젝트 생성 알림',
                description: '새 프로젝트가 생성되면 관련 팀원들에게 자동으로 알림을 보냅니다.',
                status: 'active',
                trigger: 'project_created',
                steps: [
                    {
                        id: '1-1',
                        name: '프로젝트 생성 감지',
                        type: 'trigger',
                        description: '새 프로젝트가 생성되었는지 확인',
                        config: { event: 'project_created' },
                        order: 1,
                        isActive: true
                    },
                    {
                        id: '1-2',
                        name: '팀원 목록 조회',
                        type: 'action',
                        description: '프로젝트에 할당된 팀원 목록을 가져옵니다',
                        config: { action: 'get_team_members' },
                        order: 2,
                        isActive: true
                    },
                    {
                        id: '1-3',
                        name: '알림 전송',
                        type: 'notification',
                        description: '각 팀원에게 프로젝트 생성 알림을 보냅니다',
                        config: { type: 'email', template: 'project_created' },
                        order: 3,
                        isActive: true
                    }
                ],
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-15'),
                lastExecuted: new Date('2024-01-15T10:30:00'),
                executionCount: 45,
                successRate: 98.5,
                isTemplate: false,
                category: 'notification',
                priority: 'medium'
            },
            {
                id: '2',
                name: '데이터 백업 자동화',
                description: '매일 자정에 시스템 데이터를 자동으로 백업합니다.',
                status: 'active',
                trigger: 'daily_schedule',
                steps: [
                    {
                        id: '2-1',
                        name: '스케줄 확인',
                        type: 'trigger',
                        description: '매일 자정에 실행',
                        config: { schedule: '0 0 * * *' },
                        order: 1,
                        isActive: true
                    },
                    {
                        id: '2-2',
                        name: '데이터 수집',
                        type: 'action',
                        description: '백업할 데이터를 수집합니다',
                        config: { action: 'collect_backup_data' },
                        order: 2,
                        isActive: true
                    },
                    {
                        id: '2-3',
                        name: '백업 실행',
                        type: 'action',
                        description: '수집된 데이터를 백업합니다',
                        config: { action: 'execute_backup' },
                        order: 3,
                        isActive: true
                    },
                    {
                        id: '2-4',
                        name: '완료 알림',
                        type: 'notification',
                        description: '백업 완료 알림을 관리자에게 전송',
                        config: { type: 'email', recipients: ['admin'] },
                        order: 4,
                        isActive: true
                    }
                ],
                createdAt: new Date('2024-01-05'),
                updatedAt: new Date('2024-01-20'),
                lastExecuted: new Date('2024-01-20T00:00:00'),
                executionCount: 20,
                successRate: 100,
                isTemplate: false,
                category: 'automation',
                priority: 'high'
            },
            {
                id: '3',
                name: '사용자 활동 분석',
                description: '사용자 활동 데이터를 수집하고 분석하여 인사이트를 생성합니다.',
                status: 'inactive',
                trigger: 'weekly_schedule',
                steps: [
                    {
                        id: '3-1',
                        name: '주간 스케줄',
                        type: 'trigger',
                        description: '매주 일요일 오전 9시에 실행',
                        config: { schedule: '0 9 * * 0' },
                        order: 1,
                        isActive: true
                    },
                    {
                        id: '3-2',
                        name: '활동 데이터 수집',
                        type: 'action',
                        description: '사용자 활동 데이터를 수집합니다',
                        config: { action: 'collect_user_activity' },
                        order: 2,
                        isActive: true
                    },
                    {
                        id: '3-3',
                        name: 'AI 분석',
                        type: 'action',
                        description: 'AI를 사용하여 데이터를 분석합니다',
                        config: { action: 'ai_analysis', model: 'gpt-4' },
                        order: 3,
                        isActive: false
                    }
                ],
                createdAt: new Date('2024-01-10'),
                updatedAt: new Date('2024-01-18'),
                lastExecuted: new Date('2024-01-14T09:00:00'),
                executionCount: 3,
                successRate: 66.7,
                isTemplate: false,
                category: 'data',
                priority: 'low'
            }
        ];
        setWorkflows(mockWorkflows);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-100';
            case 'inactive': return 'text-gray-600 bg-gray-100';
            case 'draft': return 'text-yellow-600 bg-yellow-100';
            case 'error': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'automation': return 'text-blue-600 bg-blue-100';
            case 'notification': return 'text-purple-600 bg-purple-100';
            case 'data': return 'text-green-600 bg-green-100';
            case 'integration': return 'text-orange-600 bg-orange-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'text-red-600';
            case 'high': return 'text-orange-600';
            case 'medium': return 'text-yellow-600';
            case 'low': return 'text-blue-600';
            default: return 'text-gray-600';
        }
    };

    const getStepTypeIcon = (type: string) => {
        switch (type) {
            case 'trigger': return Zap;
            case 'action': return Settings;
            case 'condition': return Target;
            case 'delay': return Clock;
            case 'notification': return Bell;
            default: return Activity;
        }
    };

    const filteredWorkflows = workflows
        .filter(workflow => {
            const matchesCategory = filterCategory === 'all' || workflow.category === filterCategory;
            const matchesStatus = filterStatus === 'all' || workflow.status === filterStatus;
            return matchesCategory && matchesStatus;
        })
        .sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'status':
                    comparison = a.status.localeCompare(b.status);
                    break;
                case 'createdAt':
                    comparison = a.createdAt.getTime() - b.createdAt.getTime();
                    break;
                case 'lastExecuted':
                    comparison = (a.lastExecuted?.getTime() || 0) - (b.lastExecuted?.getTime() || 0);
                    break;
                case 'executionCount':
                    comparison = a.executionCount - b.executionCount;
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

    const handleWorkflowAction = (action: string, workflow: Workflow) => {
        switch (action) {
            case 'edit':
                setSelectedWorkflow(workflow);
                setShowEditModal(true);
                break;
            case 'delete':
                if (window.confirm(`정말로 "${workflow.name}" 워크플로우를 삭제하시겠습니까?`)) {
                    setWorkflows(prev => prev.filter(w => w.id !== workflow.id));
                }
                break;
            case 'activate':
                setWorkflows(prev => prev.map(w =>
                    w.id === workflow.id ? { ...w, status: 'active' as const } : w
                ));
                break;
            case 'deactivate':
                setWorkflows(prev => prev.map(w =>
                    w.id === workflow.id ? { ...w, status: 'inactive' as const } : w
                ));
                break;
            case 'duplicate':
                const duplicated = {
                    ...workflow,
                    id: `copy-${Date.now()}`,
                    name: `${workflow.name} (복사본)`,
                    status: 'draft' as const,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    executionCount: 0,
                    successRate: 0
                };
                setWorkflows(prev => [...prev, duplicated]);
                break;
        }
        onWorkflowAction?.(action, workflow);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                        <Activity className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">워크플로우 관리</h2>
                        <p className="text-sm text-gray-600">자동화된 워크플로우 및 프로세스 관리</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    새 워크플로우
                </button>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex gap-2">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value as any)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="all">모든 카테고리</option>
                            <option value="automation">자동화</option>
                            <option value="notification">알림</option>
                            <option value="data">데이터</option>
                            <option value="integration">통합</option>
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="all">모든 상태</option>
                            <option value="active">활성</option>
                            <option value="inactive">비활성</option>
                            <option value="draft">초안</option>
                            <option value="error">오류</option>
                        </select>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="name">이름순</option>
                            <option value="status">상태순</option>
                            <option value="createdAt">생성일순</option>
                            <option value="lastExecuted">최근 실행순</option>
                            <option value="executionCount">실행 횟수순</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            {sortOrder === 'asc' ? '↑' : '↓'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Workflows List/Grid */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {viewMode === 'list' ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        워크플로우
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        카테고리
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        상태
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        실행 정보
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        액션
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredWorkflows.map((workflow) => (
                                    <tr key={workflow.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                                                    <Activity className="h-4 w-4 text-purple-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {workflow.name}
                                                        {workflow.isTemplate && (
                                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                                템플릿
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{workflow.description}</div>
                                                    <div className="text-xs text-gray-400">
                                                        트리거: {workflow.trigger}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(workflow.category)}`}>
                                                {workflow.category === 'automation' ? '자동화' :
                                                    workflow.category === 'notification' ? '알림' :
                                                        workflow.category === 'data' ? '데이터' : '통합'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                                                {workflow.status === 'active' ? '활성' :
                                                    workflow.status === 'inactive' ? '비활성' :
                                                        workflow.status === 'draft' ? '초안' : '오류'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {workflow.executionCount}회 실행
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                성공률: {workflow.successRate}%
                                            </div>
                                            {workflow.lastExecuted && (
                                                <div className="text-xs text-gray-400">
                                                    마지막: {workflow.lastExecuted.toLocaleString('ko-KR')}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleWorkflowAction('edit', workflow)}
                                                    className="text-purple-600 hover:text-purple-900"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {workflow.status === 'active' ? (
                                                    <button
                                                        onClick={() => handleWorkflowAction('deactivate', workflow)}
                                                        className="text-yellow-600 hover:text-yellow-900"
                                                    >
                                                        <Pause className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleWorkflowAction('activate', workflow)}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        <Play className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleWorkflowAction('duplicate', workflow)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleWorkflowAction('delete', workflow)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredWorkflows.map((workflow) => (
                                <div key={workflow.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                                <Activity className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{workflow.name}</div>
                                                <div className="text-xs text-gray-500">{workflow.category}</div>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                                            {workflow.status === 'active' ? '활성' :
                                                workflow.status === 'inactive' ? '비활성' :
                                                    workflow.status === 'draft' ? '초안' : '오류'}
                                        </span>
                                    </div>
                                    <div className="space-y-2 mb-4">
                                        <div className="text-sm text-gray-600">{workflow.description}</div>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>실행: {workflow.executionCount}회</span>
                                            <span>성공률: {workflow.successRate}%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end space-x-2">
                                        <button
                                            onClick={() => handleWorkflowAction('edit', workflow)}
                                            className="text-purple-600 hover:text-purple-900"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        {workflow.status === 'active' ? (
                                            <button
                                                onClick={() => handleWorkflowAction('deactivate', workflow)}
                                                className="text-yellow-600 hover:text-yellow-900"
                                            >
                                                <Pause className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleWorkflowAction('activate', workflow)}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                <Play className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleWorkflowAction('duplicate', workflow)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleWorkflowAction('delete', workflow)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <Activity className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">총 워크플로우</p>
                            <p className="text-2xl font-bold text-gray-900">{workflows.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="bg-green-100 p-3 rounded-lg">
                            <Play className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">활성</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {workflows.filter(w => w.status === 'active').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">평균 성공률</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {workflows.length > 0
                                    ? Math.round(workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length)
                                    : 0}%
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="bg-orange-100 p-3 rounded-lg">
                            <Clock className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">총 실행 횟수</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {workflows.reduce((sum, w) => sum + w.executionCount, 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemWorkflowManagement;
