import React, { useState, useEffect } from 'react';
import {
    Workflow,
    Play,
    Pause,
    Square,
    Edit,
    Trash2,
    Plus,
    Settings,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Activity,
    BarChart3,
    Calendar,
    Filter,
    Search,
    Download,
    Upload,
    RefreshCw,
    MoreVertical,
    ChevronDown,
    ChevronRight,
    Zap,
    Target,
    Repeat,
    Timer,
    CalendarDays,
    FileText,
    Database,
    Cpu,
    Network,
    Mail,
    MessageSquare,
    Bell,
    Shield,
    Lock,
    Unlock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkflowStep {
    id: string;
    name: string;
    type: 'trigger' | 'action' | 'condition' | 'delay' | 'notification' | 'api_call' | 'data_processing';
    description: string;
    config: any;
    isActive: boolean;
    order: number;
    dependencies: string[];
    timeout: number;
    retryCount: number;
    errorHandling: 'stop' | 'continue' | 'retry';
}

interface Workflow {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'draft' | 'error';
    trigger: {
        type: 'schedule' | 'event' | 'manual' | 'webhook';
        config: any;
    };
    steps: WorkflowStep[];
    createdAt: Date;
    updatedAt: Date;
    lastRun?: Date;
    nextRun?: Date;
    runCount: number;
    successCount: number;
    failureCount: number;
    averageExecutionTime: number;
    isEnabled: boolean;
    tags: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
    owner: string;
    collaborators: string[];
}

interface WorkflowExecution {
    id: string;
    workflowId: string;
    workflowName: string;
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    startedAt: Date;
    completedAt?: Date;
    duration?: number;
    steps: Array<{
        stepId: string;
        stepName: string;
        status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
        startedAt?: Date;
        completedAt?: Date;
        duration?: number;
        result?: any;
        error?: string;
    }>;
    input: any;
    output?: any;
    error?: string;
    logs: Array<{
        timestamp: Date;
        level: 'info' | 'warning' | 'error' | 'debug';
        message: string;
        stepId?: string;
    }>;
}

interface WorkflowAutomationProps {
    onWorkflowCreate?: (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'runCount' | 'successCount' | 'failureCount' | 'averageExecutionTime'>) => void;
    onWorkflowUpdate?: (workflowId: string, updates: Partial<Workflow>) => void;
    onWorkflowDelete?: (workflowId: string) => void;
    onWorkflowExecute?: (workflowId: string, input?: any) => void;
    onWorkflowEnable?: (workflowId: string, enabled: boolean) => void;
}

const WorkflowAutomation: React.FC<WorkflowAutomationProps> = ({
    onWorkflowCreate,
    onWorkflowUpdate,
    onWorkflowDelete,
    onWorkflowExecute,
    onWorkflowEnable
}) => {
    const [activeTab, setActiveTab] = useState<'workflows' | 'executions' | 'templates' | 'monitoring' | 'settings'>('workflows');
    const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
    const [showWorkflowModal, setShowWorkflowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // 워크플로우 데이터 시뮬레이션
    const [workflows, setWorkflows] = useState<Workflow[]>([
        {
            id: '1',
            name: '프로젝트 생성 자동화',
            description: '새 프로젝트 생성 시 자동으로 기본 설정을 구성합니다',
            status: 'active',
            trigger: {
                type: 'event',
                config: { event: 'project_created' }
            },
            steps: [
                {
                    id: 'step1',
                    name: '기본 폴더 생성',
                    type: 'action',
                    description: '프로젝트 기본 폴더 구조를 생성합니다',
                    config: { folders: ['docs', 'src', 'tests'] },
                    isActive: true,
                    order: 1,
                    dependencies: [],
                    timeout: 30,
                    retryCount: 3,
                    errorHandling: 'retry'
                },
                {
                    id: 'step2',
                    name: '기본 지침 설정',
                    type: 'action',
                    description: '프로젝트 기본 지침을 설정합니다',
                    config: { guidelines: ['코딩 스타일', '문서화 규칙'] },
                    isActive: true,
                    order: 2,
                    dependencies: ['step1'],
                    timeout: 60,
                    retryCount: 2,
                    errorHandling: 'continue'
                },
                {
                    id: 'step3',
                    name: '팀 알림 발송',
                    type: 'notification',
                    description: '프로젝트 생성 알림을 팀원들에게 발송합니다',
                    config: { channels: ['email', 'slack'] },
                    isActive: true,
                    order: 3,
                    dependencies: ['step2'],
                    timeout: 120,
                    retryCount: 1,
                    errorHandling: 'continue'
                }
            ],
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-15'),
            lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
            nextRun: new Date(Date.now() + 4 * 60 * 60 * 1000),
            runCount: 45,
            successCount: 42,
            failureCount: 3,
            averageExecutionTime: 180,
            isEnabled: true,
            tags: ['프로젝트', '자동화', '설정'],
            priority: 'high',
            owner: 'admin',
            collaborators: ['kim.manager', 'lee.developer']
        },
        {
            id: '2',
            name: '일일 백업 자동화',
            description: '매일 자정에 프로젝트 데이터를 자동으로 백업합니다',
            status: 'active',
            trigger: {
                type: 'schedule',
                config: { cron: '0 0 * * *' }
            },
            steps: [
                {
                    id: 'step1',
                    name: '데이터 수집',
                    type: 'data_processing',
                    description: '백업할 데이터를 수집합니다',
                    config: { tables: ['projects', 'files', 'messages'] },
                    isActive: true,
                    order: 1,
                    dependencies: [],
                    timeout: 300,
                    retryCount: 2,
                    errorHandling: 'retry'
                },
                {
                    id: 'step2',
                    name: '백업 파일 생성',
                    type: 'action',
                    description: '백업 파일을 생성합니다',
                    config: { format: 'zip', compression: true },
                    isActive: true,
                    order: 2,
                    dependencies: ['step1'],
                    timeout: 600,
                    retryCount: 3,
                    errorHandling: 'retry'
                },
                {
                    id: 'step3',
                    name: '클라우드 업로드',
                    type: 'api_call',
                    description: '백업 파일을 클라우드 스토리지에 업로드합니다',
                    config: { provider: 'aws_s3', bucket: 'backups' },
                    isActive: true,
                    order: 3,
                    dependencies: ['step2'],
                    timeout: 900,
                    retryCount: 2,
                    errorHandling: 'retry'
                }
            ],
            createdAt: new Date('2024-01-05'),
            updatedAt: new Date('2024-01-20'),
            lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
            nextRun: new Date(Date.now() + 12 * 60 * 60 * 1000),
            runCount: 30,
            successCount: 28,
            failureCount: 2,
            averageExecutionTime: 1200,
            isEnabled: true,
            tags: ['백업', '스케줄', '보안'],
            priority: 'critical',
            owner: 'admin',
            collaborators: []
        }
    ]);

    const [executions, setExecutions] = useState<WorkflowExecution[]>([
        {
            id: 'exec1',
            workflowId: '1',
            workflowName: '프로젝트 생성 자동화',
            status: 'completed',
            startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 180 * 1000),
            duration: 180,
            steps: [
                {
                    stepId: 'step1',
                    stepName: '기본 폴더 생성',
                    status: 'completed',
                    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
                    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30 * 1000),
                    duration: 30,
                    result: { foldersCreated: 3 }
                },
                {
                    stepId: 'step2',
                    stepName: '기본 지침 설정',
                    status: 'completed',
                    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 35 * 1000),
                    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 90 * 1000),
                    duration: 55,
                    result: { guidelinesAdded: 2 }
                },
                {
                    stepId: 'step3',
                    stepName: '팀 알림 발송',
                    status: 'completed',
                    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 95 * 1000),
                    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 180 * 1000),
                    duration: 85,
                    result: { notificationsSent: 5 }
                }
            ],
            input: { projectId: 'new-project-123', projectName: '새 프로젝트' },
            output: { success: true, message: '프로젝트 설정이 완료되었습니다' },
            logs: [
                {
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                    level: 'info',
                    message: '워크플로우 실행 시작',
                    stepId: undefined
                },
                {
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30 * 1000),
                    level: 'info',
                    message: '기본 폴더 생성 완료',
                    stepId: 'step1'
                }
            ]
        }
    ]);

    // 필터링된 워크플로우 목록
    const filteredWorkflows = workflows.filter(workflow => {
        const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || workflow.status === filterStatus;
        const matchesPriority = filterPriority === 'all' || workflow.priority === filterPriority;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    // 정렬된 워크플로우 목록
    const sortedWorkflows = [...filteredWorkflows].sort((a, b) => {
        let aValue, bValue;
        switch (sortBy) {
            case 'name':
                aValue = a.name;
                bValue = b.name;
                break;
            case 'status':
                aValue = a.status;
                bValue = b.status;
                break;
            case 'priority':
                aValue = a.priority;
                bValue = b.priority;
                break;
            case 'lastRun':
                aValue = a.lastRun;
                bValue = b.lastRun;
                break;
            case 'runCount':
                aValue = a.runCount;
                bValue = b.runCount;
                break;
            default:
                aValue = a.name;
                bValue = b.name;
        }

        if (sortOrder === 'asc') {
            return (aValue || 0) > (bValue || 0) ? 1 : -1;
        } else {
            return (aValue || 0) < (bValue || 0) ? 1 : -1;
        }
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-100';
            case 'inactive': return 'text-gray-600 bg-gray-100';
            case 'draft': return 'text-yellow-600 bg-yellow-100';
            case 'error': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="h-4 w-4" />;
            case 'inactive': return <XCircle className="h-4 w-4" />;
            case 'draft': return <AlertTriangle className="h-4 w-4" />;
            case 'error': return <XCircle className="h-4 w-4" />;
            default: return <Activity className="h-4 w-4" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'text-red-600 bg-red-100';
            case 'high': return 'text-orange-600 bg-orange-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'low': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}분 ${remainingSeconds}초`;
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const tabs = [
        { id: 'workflows', name: '워크플로우', icon: Workflow },
        { id: 'executions', name: '실행 기록', icon: Activity },
        { id: 'templates', name: '템플릿', icon: FileText },
        { id: 'monitoring', name: '모니터링', icon: BarChart3 },
        { id: 'settings', name: '설정', icon: Settings }
    ];

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">워크플로우 자동화</h2>
                    <p className="text-gray-600 mt-1">반복 작업을 자동화하여 업무 효율성을 높이세요</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowWorkflowModal(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>워크플로우 생성</span>
                    </button>
                </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                    {tabs.map((tab) => {
                        const IconComponent = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <IconComponent className="h-4 w-4" />
                                <span>{tab.name}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* 탭 내용 */}
            <AnimatePresence mode="wait">
                {activeTab === 'workflows' && (
                    <motion.div
                        key="workflows"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        {/* 검색 및 필터 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center space-x-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="워크플로우 검색..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="all">모든 상태</option>
                                    <option value="active">활성</option>
                                    <option value="inactive">비활성</option>
                                    <option value="draft">초안</option>
                                    <option value="error">오류</option>
                                </select>
                                <select
                                    value={filterPriority}
                                    onChange={(e) => setFilterPriority(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="all">모든 우선순위</option>
                                    <option value="critical">치명적</option>
                                    <option value="high">높음</option>
                                    <option value="medium">보통</option>
                                    <option value="low">낮음</option>
                                </select>
                            </div>
                        </div>

                        {/* 워크플로우 목록 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">워크플로우 목록 ({sortedWorkflows.length})</h3>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {sortedWorkflows.map((workflow) => (
                                    <div key={workflow.id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                                    <Workflow className="h-6 w-6 text-purple-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{workflow.name}</h4>
                                                    <p className="text-sm text-gray-600">{workflow.description}</p>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        {workflow.tags.map((tag, index) => (
                                                            <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="text-center">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(workflow.status)}`}>
                                                        {workflow.status === 'active' ? '활성' :
                                                            workflow.status === 'inactive' ? '비활성' :
                                                                workflow.status === 'draft' ? '초안' : '오류'}
                                                    </span>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {workflow.trigger.type === 'schedule' ? '스케줄' :
                                                            workflow.trigger.type === 'event' ? '이벤트' :
                                                                workflow.trigger.type === 'manual' ? '수동' : '웹훅'}
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(workflow.priority)}`}>
                                                        {workflow.priority === 'critical' ? '치명적' :
                                                            workflow.priority === 'high' ? '높음' :
                                                                workflow.priority === 'medium' ? '보통' : '낮음'}
                                                    </span>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {workflow.steps.length}개 단계
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {workflow.runCount}회 실행
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        성공률: {workflow.runCount > 0 ? Math.round((workflow.successCount / workflow.runCount) * 100) : 0}%
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => onWorkflowExecute?.(workflow.id)}
                                                        className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                                                        title="실행"
                                                    >
                                                        <Play className="h-4 w-4 text-green-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedWorkflow(workflow)}
                                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="상세 보기"
                                                    >
                                                        <Settings className="h-4 w-4 text-gray-500" />
                                                    </button>
                                                    <button
                                                        onClick={() => onWorkflowEnable?.(workflow.id, !workflow.isEnabled)}
                                                        className={`p-2 rounded-lg transition-colors ${workflow.isEnabled
                                                            ? 'hover:bg-yellow-100'
                                                            : 'hover:bg-green-100'
                                                            }`}
                                                        title={workflow.isEnabled ? '비활성화' : '활성화'}
                                                    >
                                                        {workflow.isEnabled ? (
                                                            <Pause className="h-4 w-4 text-yellow-600" />
                                                        ) : (
                                                            <Play className="h-4 w-4 text-green-600" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => onWorkflowDelete?.(workflow.id)}
                                                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                                        title="삭제"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'executions' && (
                    <motion.div
                        key="executions"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">실행 기록</h3>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {executions.map((execution) => (
                                    <div key={execution.id} className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${execution.status === 'completed' ? 'bg-green-100' :
                                                    execution.status === 'failed' ? 'bg-red-100' :
                                                        execution.status === 'running' ? 'bg-blue-100' :
                                                            'bg-gray-100'
                                                    }`}>
                                                    {execution.status === 'completed' ? <CheckCircle className="h-5 w-5 text-green-600" /> :
                                                        execution.status === 'failed' ? <XCircle className="h-5 w-5 text-red-600" /> :
                                                            execution.status === 'running' ? <Activity className="h-5 w-5 text-blue-600" /> :
                                                                <XCircle className="h-5 w-5 text-gray-600" />}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{execution.workflowName}</h4>
                                                    <p className="text-sm text-gray-600">실행 ID: {execution.id}</p>
                                                    <p className="text-xs text-gray-500">
                                                        시작: {formatDate(execution.startedAt)}
                                                        {execution.completedAt && ` • 완료: ${formatDate(execution.completedAt)}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {execution.duration ? formatDuration(execution.duration) : '진행 중'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {execution.steps.filter(s => s.status === 'completed').length} / {execution.steps.length} 단계 완료
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'monitoring' && (
                    <motion.div
                        key="monitoring"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">총 워크플로우</p>
                                        <p className="text-2xl font-bold text-gray-900">{workflows.length}</p>
                                    </div>
                                    <Workflow className="h-8 w-8 text-purple-600" />
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">활성 워크플로우</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {workflows.filter(w => w.status === 'active').length}
                                        </p>
                                    </div>
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">총 실행 횟수</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {workflows.reduce((sum, w) => sum + w.runCount, 0)}
                                        </p>
                                    </div>
                                    <Activity className="h-8 w-8 text-blue-600" />
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">평균 성공률</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {workflows.length > 0 ?
                                                Math.round(workflows.reduce((sum, w) =>
                                                    sum + (w.runCount > 0 ? (w.successCount / w.runCount) * 100 : 0), 0) / workflows.length
                                                ) : 0}%
                                        </p>
                                    </div>
                                    <BarChart3 className="h-8 w-8 text-orange-600" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WorkflowAutomation;
