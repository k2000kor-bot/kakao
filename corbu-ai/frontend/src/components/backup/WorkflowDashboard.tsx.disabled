import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play,
    Pause,
    CheckCircle,
    Clock,
    AlertTriangle,
    SkipForward,
    Settings,
    Plus,
    Filter,
    Search,
    Bell,
    Users,
    Calendar,
    Target,
    Activity,
    ChevronRight,
    ChevronDown,
    MoreHorizontal,
    Edit3,
    Trash2,
    Eye,
    Download
} from 'lucide-react';
import {
    WorkflowInstance,
    WorkflowStep,
    WorkflowTemplate,
    Notification,
    workflowAutomationService
} from '../services/workflowAutomationService';
import { Project } from '../types/project';

interface WorkflowDashboardProps {
    project: Project;
    onWorkflowAction?: (action: string, workflow: WorkflowInstance) => void;
}

const WorkflowDashboard: React.FC<WorkflowDashboardProps> = ({
    project,
    onWorkflowAction
}) => {
    const [workflows, setWorkflows] = useState<WorkflowInstance[]>([]);
    const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [activeTab, setActiveTab] = useState<'active' | 'templates' | 'notifications' | 'history'>('active');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [workflowName, setWorkflowName] = useState('');
    const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadWorkflowData();
    }, [project]);

    const loadWorkflowData = () => {
        setIsLoading(true);
        
        try {
            const projectWorkflows = workflowAutomationService.getProjectWorkflows(project.id);
            setWorkflows(projectWorkflows);
            
            const workflowTemplates = workflowAutomationService.getWorkflowTemplates();
            setTemplates(workflowTemplates);
            
            const projectNotifications = workflowAutomationService.getProjectNotifications(project.id);
            setNotifications(projectNotifications);
            
        } catch (error) {
            console.error('워크플로우 데이터 로드 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateWorkflow = () => {
        if (!selectedTemplate || !workflowName.trim()) return;
        
        try {
            const newWorkflow = workflowAutomationService.createWorkflowInstance(
                project.id,
                selectedTemplate,
                workflowName
            );
            
            setWorkflows(prev => [...prev, newWorkflow]);
            setShowCreateModal(false);
            setSelectedTemplate('');
            setWorkflowName('');
            
            if (onWorkflowAction) {
                onWorkflowAction('created', newWorkflow);
            }
        } catch (error) {
            console.error('워크플로우 생성 실패:', error);
        }
    };

    const handleWorkflowAction = (workflowId: string, action: string) => {
        const workflow = workflows.find(w => w.id === workflowId);
        if (!workflow) return;

        switch (action) {
            case 'pause':
                workflow.status = 'paused';
                break;
            case 'resume':
                workflow.status = 'active';
                break;
            case 'cancel':
                workflow.status = 'cancelled';
                break;
            case 'skip':
                // 다음 단계로 건너뛰기
                if (workflow.currentStep < workflow.steps.length - 1) {
                    workflow.currentStep++;
                    workflow.steps[workflow.currentStep - 1].status = 'skipped';
                }
                break;
        }

        setWorkflows(prev => prev.map(w => w.id === workflowId ? workflow : w));
        
        if (onWorkflowAction) {
            onWorkflowAction(action, workflow);
        }
    };

    const handleNotificationAction = (notificationId: string, action: string) => {
        switch (action) {
            case 'mark_read':
                workflowAutomationService.markNotificationAsRead(project.id, notificationId);
                setNotifications(prev => prev.map(n => 
                    n.id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n
                ));
                break;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'text-green-600 bg-green-100';
            case 'paused':
                return 'text-yellow-600 bg-yellow-100';
            case 'completed':
                return 'text-blue-600 bg-blue-100';
            case 'cancelled':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getStepStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'in_progress':
                return <Activity className="w-4 h-4 text-blue-600 animate-pulse" />;
            case 'failed':
                return <AlertTriangle className="w-4 h-4 text-red-600" />;
            case 'skipped':
                return <SkipForward className="w-4 h-4 text-gray-400" />;
            default:
                return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'text-red-600 bg-red-100';
            case 'high':
                return 'text-orange-600 bg-orange-100';
            case 'medium':
                return 'text-yellow-600 bg-yellow-100';
            case 'low':
                return 'text-green-600 bg-green-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days > 0) return `${days}일 전`;
        if (hours > 0) return `${hours}시간 전`;
        if (minutes > 0) return `${minutes}분 전`;
        return '방금 전';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">워크플로우 관리</h2>
                    <p className="text-gray-600">자동화된 프로젝트 워크플로우 및 알림</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        워크플로우 생성
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                {[
                    { id: 'active', label: '활성 워크플로우', icon: Activity },
                    { id: 'templates', label: '템플릿', icon: Settings },
                    { id: 'notifications', label: '알림', icon: Bell },
                    { id: 'history', label: '히스토리', icon: Calendar }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                            activeTab === tab.id
                                ? 'text-purple-600 border-b-2 border-purple-600'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'active' && (
                    <motion.div
                        key="active"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                    >
                        {workflows.length === 0 ? (
                            <div className="text-center py-12">
                                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">활성 워크플로우가 없습니다</h3>
                                <p className="text-gray-600 mb-4">새로운 워크플로우를 생성하여 프로젝트를 자동화하세요</p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    워크플로우 생성
                                </button>
                            </div>
                        ) : (
                            workflows.map((workflow) => (
                                <div key={workflow.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                                    <div className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(workflow.status)}`}>
                                                        {workflow.status === 'active' ? '활성' :
                                                         workflow.status === 'paused' ? '일시정지' :
                                                         workflow.status === 'completed' ? '완료' : '취소됨'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900">{workflow.name}</h3>
                                                    <p className="text-sm text-gray-600">
                                                        {workflow.steps.filter(s => s.status === 'completed').length} / {workflow.steps.length} 단계 완료
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center space-x-2">
                                                {workflow.status === 'active' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleWorkflowAction(workflow.id, 'pause')}
                                                            className="p-2 text-gray-400 hover:text-gray-600"
                                                            title="일시정지"
                                                        >
                                                            <Pause className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleWorkflowAction(workflow.id, 'skip')}
                                                            className="p-2 text-gray-400 hover:text-gray-600"
                                                            title="다음 단계로 건너뛰기"
                                                        >
                                                            <SkipForward className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {workflow.status === 'paused' && (
                                                    <button
                                                        onClick={() => handleWorkflowAction(workflow.id, 'resume')}
                                                        className="p-2 text-gray-400 hover:text-gray-600"
                                                        title="재개"
                                                    >
                                                        <Play className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setExpandedWorkflow(
                                                        expandedWorkflow === workflow.id ? null : workflow.id
                                                    )}
                                                    className="p-2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {expandedWorkflow === workflow.id ? (
                                                        <ChevronDown className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* Progress Bar */}
                                        <div className="mt-3">
                                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                <span>진행률</span>
                                                <span>{Math.round((workflow.steps.filter(s => s.status === 'completed').length / workflow.steps.length) * 100)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                                    style={{
                                                        width: `${(workflow.steps.filter(s => s.status === 'completed').length / workflow.steps.length) * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Expanded Steps */}
                                    {expandedWorkflow === workflow.id && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="border-t border-gray-200 p-4"
                                        >
                                            <h4 className="font-medium text-gray-900 mb-3">워크플로우 단계</h4>
                                            <div className="space-y-2">
                                                {workflow.steps.map((step, index) => (
                                                    <div
                                                        key={step.id}
                                                        className={`flex items-center space-x-3 p-2 rounded ${
                                                            index === workflow.currentStep ? 'bg-purple-50 border border-purple-200' : ''
                                                        }`}
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            {getStepStatusIcon(step.status)}
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {index + 1}. {step.name}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-gray-500">{step.description}</span>
                                                        {step.completedAt && (
                                                            <span className="text-xs text-gray-400 ml-auto">
                                                                {formatTimeAgo(step.completedAt)}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            ))
                        )}
                    </motion.div>
                )}

                {activeTab === 'templates' && (
                    <motion.div
                        key="templates"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {templates.map((template) => (
                                <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-medium text-gray-900">{template.name}</h3>
                                            <p className="text-sm text-gray-600">{template.description}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            template.complexity === 'complex' ? 'bg-red-100 text-red-800' :
                                            template.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {template.complexity === 'complex' ? '복잡' :
                                             template.complexity === 'medium' ? '보통' : '간단'}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">카테고리:</span>
                                            <span className="font-medium capitalize">{template.category}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">예상 기간:</span>
                                            <span className="font-medium">{template.estimatedDuration}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">단계 수:</span>
                                            <span className="font-medium">{template.steps.length}</span>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={() => {
                                            setSelectedTemplate(template.id);
                                            setWorkflowName(template.name);
                                            setShowCreateModal(true);
                                        }}
                                        className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        이 템플릿으로 생성
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'notifications' && (
                    <motion.div
                        key="notifications"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                    >
                        {notifications.length === 0 ? (
                            <div className="text-center py-12">
                                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">알림이 없습니다</h3>
                                <p className="text-gray-600">새로운 알림이 도착하면 여기에 표시됩니다</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${
                                        !notification.isRead ? 'border-l-4 border-l-purple-500' : ''
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(notification.priority)}`}>
                                                    {notification.priority === 'urgent' ? '긴급' :
                                                     notification.priority === 'high' ? '높음' :
                                                     notification.priority === 'medium' ? '보통' : '낮음'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {formatTimeAgo(notification.createdAt)}
                                                </span>
                                            </div>
                                            <h4 className="font-medium text-gray-900 mb-1">{notification.title}</h4>
                                            <p className="text-sm text-gray-600">{notification.message}</p>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2 ml-4">
                                            {!notification.isRead && (
                                                <button
                                                    onClick={() => handleNotificationAction(notification.id, 'mark_read')}
                                                    className="p-1 text-gray-400 hover:text-gray-600"
                                                    title="읽음 표시"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </motion.div>
                )}

                {activeTab === 'history' && (
                    <motion.div
                        key="history"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                    >
                        {workflows.filter(w => w.status === 'completed' || w.status === 'cancelled').length === 0 ? (
                            <div className="text-center py-12">
                                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">완료된 워크플로우가 없습니다</h3>
                                <p className="text-gray-600">완료되거나 취소된 워크플로우가 여기에 표시됩니다</p>
                            </div>
                        ) : (
                            workflows
                                .filter(w => w.status === 'completed' || w.status === 'cancelled')
                                .map((workflow) => (
                                    <div key={workflow.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{workflow.name}</h3>
                                                <p className="text-sm text-gray-600">
                                                    {workflow.completedAt ? 
                                                        `완료: ${formatTimeAgo(workflow.completedAt)}` :
                                                        `시작: ${formatTimeAgo(workflow.startedAt)}`
                                                    }
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(workflow.status)}`}>
                                                {workflow.status === 'completed' ? '완료' : '취소됨'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Workflow Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">워크플로우 생성</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    워크플로우 이름
                                </label>
                                <input
                                    type="text"
                                    value={workflowName}
                                    onChange={(e) => setWorkflowName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="워크플로우 이름을 입력하세요"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    템플릿 선택
                                </label>
                                <select
                                    value={selectedTemplate}
                                    onChange={(e) => setSelectedTemplate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">템플릿을 선택하세요</option>
                                    {templates.map((template) => (
                                        <option key={template.id} value={template.id}>
                                            {template.name} - {template.description}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleCreateWorkflow}
                                disabled={!selectedTemplate || !workflowName.trim()}
                                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                생성
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default WorkflowDashboard;
