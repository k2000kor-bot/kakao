import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings,
    Database,
    Users,
    FileText,
    MessageSquare,
    BookOpen,
    BarChart3,
    Activity,
    Sparkles,
    Zap,
    Shield,
    Monitor,
    RefreshCw,
    Download,
    Upload,
    Trash2,
    Edit,
    Eye,
    Play,
    Pause,
    AlertTriangle,
    CheckCircle,
    Clock,
    TrendingUp,
    TrendingDown,
    Folder,
    Search,
    Filter,
    Plus,
    MoreVertical,
    ArrowRight,
    ArrowLeft,
    Home,
    Grid,
    List,
    Calendar,
    Bell,
    Star,
    Heart,
    Share2,
    Copy,
    Archive,
    Tag,
    Hash,
    Link,
    ExternalLink,
    Info,
    HelpCircle,
    X,
    ChevronDown,
    ChevronUp,
    ChevronRight,
    ChevronLeft,
    Brain,
    FolderOpen,
    Wrench,
    Target
} from 'lucide-react';
import { projectService, chatService, messageService, systemService } from '../services/projectService';
import { projectKnowledgeService } from '../services/projectKnowledgeService';
import { collaborationService } from '../services/collaborationService';
import { workflowAutomationService } from '../services/workflowAutomationService';
import { advancedAnalyticsService } from '../services/advancedAnalyticsService';
import { advancedContentGenerationService } from '../services/advancedContentGenerationService';
import { smartTemplateEngine } from '../services/smartTemplateEngine';
import { aiAnalysisEngine } from '../services/aiAnalysisEngine';
import { Project, Chat, Message } from '../types/project';
import SystemBackupModal from './SystemBackupModal';
import SystemMaintenanceModal from './SystemMaintenanceModal';
import SystemNotificationPanel from './SystemNotificationPanel';
import SystemQuickActions from './SystemQuickActions';
import SystemIntelligenceDashboard from './SystemIntelligenceDashboard';
import SystemUserManagement from './SystemUserManagement';
import SystemSettings from './SystemSettings';
import SystemAnalytics from './SystemAnalytics';
import SystemWorkflowManagement from './SystemWorkflowManagement';
import SystemMonitoring from './SystemMonitoring';
import SystemKnowledgeManagement from './SystemKnowledgeManagement';
import AISystemOptimizationDashboard from './AISystemOptimizationDashboard';
import RealTimeMonitoringDashboard from './RealtimeMonitoringDashboard';
import AIPredictiveAnalyticsDashboard from './AIPredictiveAnalyticsDashboard';
import AIAutonomousSystemDashboard from './AIAutonomousSystemDashboard';
import RealEstateDashboard from './RealEstateDashboard';
import SelfEvolutionDashboard from './SelfEvolutionDashboard';

interface SystemManagementDashboardProps {
    onNavigateToProject?: (projectId: string) => void;
    onNavigateToChat?: (projectId: string, chatId: string) => void;
}

interface SystemStats {
    totalProjects: number;
    totalChats: number;
    totalMessages: number;
    totalKnowledgeEntries: number;
    totalUsers: number;
    activeWorkflows: number;
    totalTemplates: number;
    systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
    lastBackup: Date;
    storageUsage: number;
    activeSessions: number;
}

interface ServiceStatus {
    name: string;
    status: 'running' | 'stopped' | 'error' | 'maintenance';
    uptime: number;
    lastError?: string;
    performance: number;
}

const SystemManagementDashboard: React.FC<SystemManagementDashboardProps> = ({
    onNavigateToProject,
    onNavigateToChat
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'users' | 'analytics' | 'workflows' | 'knowledge' | 'settings' | 'monitoring' | 'intelligence' | 'ai_optimization' | 'realtime_monitoring' | 'ai_predictive_analytics' | 'ai_autonomous_system' | 'real_estate' | 'self_evolution'>('overview');
    const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
    const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'archived' | 'completed'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'updatedAt' | 'messageCount'>('updatedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showBackupModal, setShowBackupModal] = useState(false);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
    const [showNotificationPanel, setShowNotificationPanel] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [chats, setChats] = useState<Chat[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        loadSystemData();
        const interval = setInterval(loadSystemData, 30000); // 30초마다 업데이트
        return () => clearInterval(interval);
    }, []);

    const loadSystemData = () => {
        // 시스템 통계 로드
        const allProjects = projectService.getProjects();
        const allChats = chatService.getAllChats();
        const allMessages = messageService.getAllMessages();
        // 임시로 기본값 사용 (실제 구현 시 해당 서비스의 메서드 사용)
        const allKnowledge = [];
        const allUsers = [];
        const activeWorkflows = 0;
        const templates = 0;

        setProjects(allProjects);
        setChats(allChats);
        setMessages(allMessages);
        setSystemStats({
            totalProjects: allProjects.length,
            totalChats: allChats.length,
            totalMessages: allMessages.length,
            totalKnowledgeEntries: allKnowledge.length,
            totalUsers: allUsers.length,
            activeWorkflows,
            totalTemplates: templates,
            systemHealth: 'excellent',
            lastBackup: new Date(),
            storageUsage: 75,
            activeSessions: 12
        });

        // 서비스 상태 로드
        setServiceStatuses([
            {
                name: '프로젝트 관리 서비스',
                status: 'running',
                uptime: 99.9,
                performance: 95
            },
            {
                name: '채팅 서비스',
                status: 'running',
                uptime: 99.8,
                performance: 92
            },
            {
                name: '지식베이스 서비스',
                status: 'running',
                uptime: 99.7,
                performance: 88
            },
            {
                name: '협업 서비스',
                status: 'running',
                uptime: 99.6,
                performance: 90
            },
            {
                name: '워크플로우 자동화',
                status: 'running',
                uptime: 99.5,
                performance: 85
            },
            {
                name: '고급 분석 서비스',
                status: 'running',
                uptime: 99.4,
                performance: 87
            },
            {
                name: '콘텐츠 생성 서비스',
                status: 'running',
                uptime: 99.3,
                performance: 89
            }
        ]);
    };

    const handleProjectAction = (action: string, project: Project) => {
        switch (action) {
            case 'view':
                setSelectedProject(project);
                break;
            case 'edit':
                // 프로젝트 편집 모달 열기
                break;
            case 'archive':
                projectService.updateProject(project.id, { status: 'archived' });
                loadSystemData();
                break;
            case 'delete':
                if (window.confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
                    projectService.deleteProject(project.id);
                    loadSystemData();
                }
                break;
            case 'navigate':
                if (onNavigateToProject) {
                    onNavigateToProject(project.id);
                }
                break;
        }
    };

    const handleBulkAction = (action: string, projectIds: string[]) => {
        switch (action) {
            case 'archive':
                projectIds.forEach(id => {
                    projectService.updateProject(id, { status: 'archived' });
                });
                break;
            case 'delete':
                if (window.confirm('선택된 프로젝트들을 모두 삭제하시겠습니까?')) {
                    projectIds.forEach(id => {
                        projectService.deleteProject(id);
                    });
                }
                break;
            case 'export':
                // 프로젝트 데이터 내보내기
                break;
        }
        loadSystemData();
    };

    const getHealthColor = (health: string) => {
        switch (health) {
            case 'excellent': return 'text-green-600';
            case 'good': return 'text-blue-600';
            case 'warning': return 'text-yellow-600';
            case 'critical': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'text-green-600 bg-green-100';
            case 'stopped': return 'text-gray-600 bg-gray-100';
            case 'error': return 'text-red-600 bg-red-100';
            case 'maintenance': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const filteredProjects = projects
        .filter(project => {
            const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'createdAt':
                    comparison = a.createdAt.getTime() - b.createdAt.getTime();
                    break;
                case 'updatedAt':
                    comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
                    break;
                case 'messageCount':
                    comparison = (a.messageCount || 0) - (b.messageCount || 0);
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <div className="bg-purple-100 p-2 rounded-lg">
                                <Settings className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">시스템 관리 대시보드</h1>
                                <p className="text-sm text-gray-600">CORBU AI 전체 시스템 관리</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setShowBackupModal(true)}
                                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                백업
                            </button>
                            <button
                                onClick={() => setShowMaintenanceModal(true)}
                                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                                <Shield className="w-4 h-4 mr-2" />
                                유지보수
                            </button>
                            <button
                                onClick={loadSystemData}
                                className="p-2 text-gray-400 hover:text-gray-600"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8">
                        {[
                            { id: 'overview', name: '개요', icon: Home },
                            { id: 'projects', name: '프로젝트 관리', icon: Folder },
                            { id: 'users', name: '사용자 관리', icon: Users },
                            { id: 'analytics', name: '분석', icon: BarChart3 },
                            { id: 'workflows', name: '워크플로우', icon: Activity },
                            { id: 'knowledge', name: '지식베이스', icon: BookOpen },
                            { id: 'settings', name: '설정', icon: Settings },
                            { id: 'monitoring', name: '모니터링', icon: Monitor },
                            { id: 'intelligence', name: 'AI 지능', icon: Brain },
                            { id: 'ai_optimization', name: 'AI 최적화', icon: Zap },
                            { id: 'realtime_monitoring', name: '실시간 모니터링', icon: Activity },
                            { id: 'ai_predictive_analytics', name: 'AI 예측 분석', icon: Target },
                            { id: 'ai_autonomous_system', name: 'AI 자율 시스템', icon: Brain },
                            { id: 'self_evolution', name: '자가 발전', icon: Zap }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 ${activeTab === tab.id
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4 mr-2" />
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* System Stats */}
                            {systemStats && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center">
                                            <div className="bg-purple-100 p-3 rounded-lg">
                                                <Folder className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">총 프로젝트</p>
                                                <p className="text-2xl font-bold text-gray-900">{systemStats.totalProjects}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center">
                                            <div className="bg-blue-100 p-3 rounded-lg">
                                                <MessageSquare className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">총 채팅</p>
                                                <p className="text-2xl font-bold text-gray-900">{systemStats.totalChats}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center">
                                            <div className="bg-green-100 p-3 rounded-lg">
                                                <Users className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">활성 사용자</p>
                                                <p className="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center">
                                            <div className="bg-yellow-100 p-3 rounded-lg">
                                                <Activity className="h-6 w-6 text-yellow-600" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-600">활성 워크플로우</p>
                                                <p className="text-2xl font-bold text-gray-900">{systemStats.activeWorkflows}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* System Health */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">시스템 상태</h3>
                                    {systemStats && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">전체 상태</span>
                                                <span className={`text-sm font-medium ${getHealthColor(systemStats.systemHealth)}`}>
                                                    {systemStats.systemHealth === 'excellent' ? '우수' :
                                                        systemStats.systemHealth === 'good' ? '양호' :
                                                            systemStats.systemHealth === 'warning' ? '주의' : '위험'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">저장소 사용량</span>
                                                <span className="text-sm font-medium text-gray-900">{systemStats.storageUsage}%</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">활성 세션</span>
                                                <span className="text-sm font-medium text-gray-900">{systemStats.activeSessions}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">마지막 백업</span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {systemStats.lastBackup.toLocaleDateString('ko-KR')}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">서비스 상태</h3>
                                    <div className="space-y-3">
                                        {serviceStatuses.map((service, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-2 h-2 rounded-full ${service.status === 'running' ? 'bg-green-500' :
                                                        service.status === 'stopped' ? 'bg-gray-500' :
                                                            service.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                                                        }`} />
                                                    <span className="text-sm text-gray-900">{service.name}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs text-gray-500">{service.uptime}%</span>
                                                    <span className="text-xs text-gray-500">{service.performance}%</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h3>
                                <div className="space-y-3">
                                    {projects.slice(0, 5).map((project) => (
                                        <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <Folder className="w-5 h-5 text-purple-600" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{project.name}</div>
                                                    <div className="text-xs text-gray-600">{project.description}</div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {project.updatedAt.toLocaleDateString('ko-KR')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'projects' && (
                        <motion.div
                            key="projects"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Search and Filters */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                placeholder="프로젝트 검색..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value as any)}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="all">모든 상태</option>
                                            <option value="active">활성</option>
                                            <option value="archived">보관됨</option>
                                            <option value="completed">완료됨</option>
                                        </select>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value as any)}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="updatedAt">최근 업데이트</option>
                                            <option value="createdAt">생성일</option>
                                            <option value="name">이름</option>
                                            <option value="messageCount">메시지 수</option>
                                        </select>
                                        <button
                                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                        >
                                            {sortOrder === 'asc' ? '↑' : '↓'}
                                        </button>
                                        <button
                                            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                        >
                                            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Projects Grid/List */}
                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredProjects.map((project) => (
                                        <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="bg-purple-100 p-2 rounded-lg">
                                                        <Folder className="h-5 w-5 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{project.name}</h3>
                                                        <p className="text-sm text-gray-500">{project.description}</p>
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <button className="p-1 text-gray-400 hover:text-gray-600">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">상태</span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${project.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        project.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                                                            'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {project.status === 'active' ? '활성' :
                                                            project.status === 'archived' ? '보관됨' : '완료됨'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">메시지</span>
                                                    <span className="text-gray-900">{project.messageCount || 0}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">업데이트</span>
                                                    <span className="text-gray-900">
                                                        {project.updatedAt.toLocaleDateString('ko-KR')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                                                <button
                                                    onClick={() => handleProjectAction('view', project)}
                                                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                                                >
                                                    상세보기
                                                </button>
                                                <button
                                                    onClick={() => handleProjectAction('navigate', project)}
                                                    className="flex items-center text-gray-600 hover:text-gray-900 text-sm"
                                                >
                                                    열기
                                                    <ArrowRight className="w-4 h-4 ml-1" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    프로젝트
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    상태
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    메시지
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    업데이트
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    액션
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredProjects.map((project) => (
                                                <tr key={project.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="bg-purple-100 p-2 rounded-lg mr-3">
                                                                <Folder className="h-4 w-4 text-purple-600" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">{project.name}</div>
                                                                <div className="text-sm text-gray-500">{project.description}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${project.status === 'active' ? 'bg-green-100 text-green-800' :
                                                            project.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                                                                'bg-blue-100 text-blue-800'
                                                            }`}>
                                                            {project.status === 'active' ? '활성' :
                                                                project.status === 'archived' ? '보관됨' : '완료됨'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {project.messageCount || 0}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {project.updatedAt.toLocaleDateString('ko-KR')}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => handleProjectAction('view', project)}
                                                                className="text-purple-600 hover:text-purple-900"
                                                            >
                                                                보기
                                                            </button>
                                                            <button
                                                                onClick={() => handleProjectAction('edit', project)}
                                                                className="text-blue-600 hover:text-blue-900"
                                                            >
                                                                편집
                                                            </button>
                                                            <button
                                                                onClick={() => handleProjectAction('archive', project)}
                                                                className="text-gray-600 hover:text-gray-900"
                                                            >
                                                                보관
                                                            </button>
                                                            <button
                                                                onClick={() => handleProjectAction('delete', project)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                삭제
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'users' && (
                        <motion.div
                            key="users"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <SystemUserManagement
                                onUserAction={(action, user) => {
                                    console.log('사용자 액션:', action, user);
                                    loadSystemData();
                                }}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'analytics' && (
                        <motion.div
                            key="analytics"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <SystemAnalytics
                                projects={projects}
                                chats={chats}
                                messages={messages}
                                onInsightAction={(insight) => {
                                    console.log('분석 인사이트 액션:', insight);
                                    loadSystemData();
                                }}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'workflows' && (
                        <motion.div
                            key="workflows"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <SystemWorkflowManagement
                                onWorkflowAction={(action, workflow) => {
                                    console.log('워크플로우 액션:', action, workflow);
                                    loadSystemData();
                                }}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'knowledge' && (
                        <motion.div
                            key="knowledge"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center py-12">
                                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">지식베이스 관리</h3>
                                <p className="text-gray-600">통합 지식베이스 관리 기능이 곧 추가됩니다.</p>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <SystemSettings
                                onSettingChange={(settingId, value) => {
                                    console.log('설정 변경:', settingId, value);
                                }}
                                onSave={(settings) => {
                                    console.log('설정 저장:', settings);
                                    loadSystemData();
                                }}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'monitoring' && (
                        <motion.div
                            key="monitoring"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <SystemMonitoring
                                onAlertAction={(alert) => {
                                    console.log('알림 액션:', alert);
                                    loadSystemData();
                                }}
                                onServiceAction={(action, service) => {
                                    console.log('서비스 액션:', action, service);
                                    loadSystemData();
                                }}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'intelligence' && (
                        <motion.div
                            key="intelligence"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <SystemIntelligenceDashboard
                                projects={projects}
                                chats={chats}
                                messages={messages}
                                onOptimizationExecute={(action) => {
                                    console.log('최적화 실행:', action);
                                    loadSystemData();
                                }}
                                onAnomalyResolve={(anomalyId) => {
                                    console.log('이상 징후 해결:', anomalyId);
                                    loadSystemData();
                                }}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'ai_optimization' && (
                        <motion.div
                            key="ai_optimization"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <AISystemOptimizationDashboard
                                projects={projects}
                                chats={chats}
                                messages={messages}
                                onOptimizationAction={(action, data) => {
                                    console.log('AI 최적화 액션:', action, data);
                                    loadSystemData();
                                }}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'realtime_monitoring' && (
                        <motion.div
                            key="realtime_monitoring"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <RealTimeMonitoringDashboard
                                onAlertAction={(alertId, action) => {
                                    console.log('알림 액션:', alertId, action);
                                }}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'ai_predictive_analytics' && (
                        <motion.div
                            key="ai_predictive_analytics"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <AIPredictiveAnalyticsDashboard
                                projects={projects}
                                chats={chats}
                                messages={messages}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'ai_autonomous_system' && (
                        <motion.div
                            key="ai_autonomous_system"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <AIAutonomousSystemDashboard
                                projects={projects}
                                chats={chats}
                                messages={messages}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'self_evolution' && (
                        <motion.div
                            key="self_evolution"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <SelfEvolutionDashboard
                                projects={projects}
                                chats={chats}
                                messages={messages}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* System Quick Actions */}
            <SystemQuickActions
                onBackup={() => setShowBackupModal(true)}
                onMaintenance={() => setShowMaintenanceModal(true)}
                onRefresh={loadSystemData}
                onUserManagement={() => setActiveTab('users')}
                onAnalytics={() => setActiveTab('analytics')}
                onSettings={() => setActiveTab('settings')}
                onNotifications={() => setShowNotificationPanel(true)}
                onCreateProject={() => setShowCreateModal(true)}
                onSearch={() => setActiveTab('projects')}
                onExport={() => systemService.exportSystemData()}
                onImport={() => setShowBackupModal(true)}
                onCleanup={() => {
                    console.log('시스템 정리 실행');
                    loadSystemData();
                }}
                isMaintenanceMode={isMaintenanceMode}
            />

            {/* System Backup Modal */}
            <AnimatePresence>
                {showBackupModal && (
                    <SystemBackupModal
                        isOpen={showBackupModal}
                        onClose={() => setShowBackupModal(false)}
                        onBackupComplete={() => {
                            console.log('백업 완료');
                            loadSystemData();
                        }}
                        onRestoreComplete={() => {
                            console.log('복원 완료');
                            loadSystemData();
                        }}
                    />
                )}
            </AnimatePresence>

            {/* System Maintenance Modal */}
            <AnimatePresence>
                {showMaintenanceModal && (
                    <SystemMaintenanceModal
                        isOpen={showMaintenanceModal}
                        onClose={() => setShowMaintenanceModal(false)}
                        onMaintenanceStart={() => {
                            console.log('유지보수 시작');
                            setIsMaintenanceMode(true);
                        }}
                        onMaintenanceEnd={() => {
                            console.log('유지보수 종료');
                            setIsMaintenanceMode(false);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* System Notification Panel */}
            <AnimatePresence>
                {showNotificationPanel && (
                    <SystemNotificationPanel
                        isOpen={showNotificationPanel}
                        onClose={() => setShowNotificationPanel(false)}
                        notifications={notifications}
                        onNotificationRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
                        onNotificationDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default SystemManagementDashboard;
