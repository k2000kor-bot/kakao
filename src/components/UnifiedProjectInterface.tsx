import React, { useState, useEffect } from 'react';
import {
    Folder,
    MessageSquare,
    FileText,
    Settings,
    Plus,
    Search,
    ChevronLeft,
    ChevronRight,
    Bot,
    Users,
    Calendar,
    BarChart3,
    MoreVertical,
    X,
    Menu,
    Bell,
    TrendingUp,
    Activity,
    Zap,
    Shield,
    Lightbulb,
    Brain,
    Wand2,
    Palette,
    Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectList from './ProjectManagement/ProjectList';
import ProjectCreationModal from './ProjectManagement/ProjectCreationModal';
import FileUpload from './FileManagement/FileUpload';
import GuidelinesManager from './Guidelines/GuidelinesManager';
import ChatInterface from './Chat/ChatInterface';
import NotificationSystem from './Notifications/NotificationSystem';
import AdvancedSearch from './Search/AdvancedSearch';
import ProjectAnalytics from './Analytics/ProjectAnalytics';
import AdvancedSettings from './Settings/AdvancedSettings';
import RealTimeCollaboration from './Collaboration/RealTimeCollaboration';
import AIPerformanceMonitor from './Monitoring/AIPerformanceMonitor';
import RBACSystem from './UserManagement/RBACSystem';
import WorkflowAutomation from './Automation/WorkflowAutomation';
import AdvancedDataInsights from './Analytics/AdvancedDataInsights';
import AIPredictionSystem from './AI/AIPredictionSystem';
import RealTimeConversationAnalyzer from './AI/RealTimeConversationAnalyzer';
import AIDocumentGenerator from './AI/AIDocumentGenerator';
import FileAnalysisChatSystem from './AI/FileAnalysisChatSystem';
import AICodeGenerator from './AI/AICodeGenerator';
import AIDesignSystem from './AI/AIDesignSystem';
import AdvancedAIEngine from './AI/AdvancedAIEngine';

interface Project {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'archived' | 'completed';
    priority: 'low' | 'medium' | 'high';
    createdAt: string;
    updatedAt: string;
    messageCount: number;
    fileCount: number;
    files: Array<{
        id: string;
        name: string;
        type: string;
        size: number;
    }>;
    guidelines: Array<{
        id: string;
        title: string;
        content: string;
        isActive: boolean;
    }>;
    tags: string[];
}

interface Message {
    id: string;
    type: 'user' | 'ai';
    content: string;
    timestamp: Date;
    projectId?: string;
    attachments?: Array<{
        id: string;
        name: string;
        type: string;
        size: number;
        url?: string;
    }>;
    projectContext?: {
        projectId: string;
        projectName: string;
        guidelines?: string[];
    };
    analysis?: {
        quality?: number;
        relevance?: number;
        completeness?: number;
        suggestions?: string[];
    };
    metadata?: {
        model?: string;
        tokens?: number;
        responseTime?: number;
    };
}

interface FileItem {
    id: string;
    name: string;
    type: string;
    size: number;
    url?: string;
    uploadedAt: Date;
    status: 'uploading' | 'success' | 'error';
    progress?: number;
    error?: string;
}

interface Guideline {
    id: string;
    title: string;
    content: string;
    category: 'general' | 'tone' | 'style' | 'format' | 'constraint' | 'custom';
    priority: 'low' | 'medium' | 'high';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    usageCount?: number;
    tags?: string[];
}

interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    action?: {
        label: string;
        onClick: () => void;
    };
    autoDismiss?: boolean;
    duration?: number;
}

interface SearchFilter {
    id: string;
    type: 'text' | 'date' | 'select' | 'multi-select' | 'range';
    field: string;
    label: string;
    value: any;
    operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
    options?: Array<{ value: string; label: string }>;
}

interface SearchResult {
    id: string;
    type: 'project' | 'message' | 'file' | 'guideline';
    title: string;
    content: string;
    metadata: {
        projectId?: string;
        projectName?: string;
        timestamp?: Date;
        tags?: string[];
        [key: string]: any;
    };
    score: number;
    highlights: Array<{
        field: string;
        snippet: string;
    }>;
}

interface AnalyticsData {
    projects: {
        total: number;
        active: number;
        completed: number;
        archived: number;
        growth: number;
    };
    messages: {
        total: number;
        thisWeek: number;
        thisMonth: number;
        growth: number;
    };
    files: {
        total: number;
        totalSize: number;
        thisWeek: number;
        growth: number;
    };
    performance: {
        responseTime: number;
        accuracy: number;
        satisfaction: number;
        trend: 'up' | 'down' | 'stable';
    };
    activity: Array<{
        date: string;
        projects: number;
        messages: number;
        files: number;
    }>;
    topProjects: Array<{
        id: string;
        name: string;
        messageCount: number;
        fileCount: number;
        lastActivity: string;
        status: string;
    }>;
    recentActivity: Array<{
        id: string;
        type: 'project_created' | 'message_sent' | 'file_uploaded' | 'guideline_added';
        title: string;
        description: string;
        timestamp: string;
        projectId?: string;
        projectName?: string;
    }>;
}

const UnifiedProjectInterface: React.FC = () => {
    // 상태 관리
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [activeTab, setActiveTab] = useState<'chat' | 'files' | 'guidelines' | 'analytics' | 'collaboration' | 'settings' | 'monitoring' | 'rbac' | 'automation' | 'insights' | 'predictions' | 'conversation-analysis' | 'document-generation' | 'file-analysis-chat' | 'code-generator' | 'design-system' | 'advanced-ai-engine'>('chat');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [projectFiles, setProjectFiles] = useState<FileItem[]>([]);
    const [projectGuidelines, setProjectGuidelines] = useState<Guideline[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [searchFilters, setSearchFilters] = useState<SearchFilter[]>([]);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [savedSearches, setSavedSearches] = useState<Array<{
        id: string;
        name: string;
        filters: SearchFilter[];
        createdAt: Date;
    }>>([]);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [showGlobalSearch, setShowGlobalSearch] = useState(false);
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
    const [collaborators, setCollaborators] = useState<any[]>([]);
    const [shareLinks, setShareLinks] = useState<any[]>([]);

    // AI 성능 모니터링 상태
    const [performanceAlerts, setPerformanceAlerts] = useState<any[]>([]);
    const [isPerformanceOptimizing, setIsPerformanceOptimizing] = useState(false);

    // RBAC 시스템 상태
    const [rbacUsers, setRbacUsers] = useState<any[]>([]);
    const [rbacRoles, setRbacRoles] = useState<any[]>([]);

    // 워크플로우 자동화 상태
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [workflowExecutions, setWorkflowExecutions] = useState<any[]>([]);

    // 고급 데이터 분석 상태
    const [dataInsights, setDataInsights] = useState<any[]>([]);
    const [dataMetrics, setDataMetrics] = useState<any[]>([]);

    // AI 예측 시스템 상태
    const [predictions, setPredictions] = useState<any[]>([]);
    const [recommendations, setRecommendations] = useState<any[]>([]);

    // 실시간 대화 분석 상태
    const [conversationAnalyses, setConversationAnalyses] = useState<any[]>([]);
    const [isConversationAnalyzing, setIsConversationAnalyzing] = useState(false);

    // AI 문서 생성 상태
    const [generatedDocuments, setGeneratedDocuments] = useState<any[]>([]);
    const [documentTemplates, setDocumentTemplates] = useState<any[]>([]);

    // 파일 분석 대화 상태
    const [analyzedFiles, setAnalyzedFiles] = useState<any[]>([]);
    const [fileAnalysisMessages, setFileAnalysisMessages] = useState<any[]>([]);

    // AI 코드 생성 상태
    const [codeProjects, setCodeProjects] = useState<any[]>([]);
    const [codeOptimizations, setCodeOptimizations] = useState<any[]>([]);
    const [codeTests, setCodeTests] = useState<any[]>([]);

    // AI 디자인 시스템 상태
    const [designSystems, setDesignSystems] = useState<any[]>([]);
    const [designComponents, setDesignComponents] = useState<any[]>([]);
    const [designColors, setDesignColors] = useState<any[]>([]);

    // 고도화된 AI 엔진 상태
    const [aiProcessingResults, setAiProcessingResults] = useState<any[]>([]);
    const [aiProcessingConfig, setAiProcessingConfig] = useState<any>({});

    // 초기 데이터 로드
    useEffect(() => {
        loadInitialData();
        loadAnalyticsData();

        // 협업 데이터 시뮬레이션
        const mockCollaborators = [
            {
                id: '1',
                name: '김철수',
                email: 'kim@corbu.ai',
                role: 'owner',
                status: 'online',
                lastSeen: new Date(),
                permissions: ['read', 'write', 'delete', 'admin']
            },
            {
                id: '2',
                name: '이영희',
                email: 'lee@corbu.ai',
                role: 'editor',
                status: 'online',
                lastSeen: new Date(),
                permissions: ['read', 'write']
            },
            {
                id: '3',
                name: '박민수',
                email: 'park@corbu.ai',
                role: 'viewer',
                status: 'away',
                lastSeen: new Date(Date.now() - 30 * 60 * 1000),
                permissions: ['read']
            }
        ];

        const mockShareLinks = [
            {
                id: '1',
                url: 'https://corbu.ai/share/project-1',
                password: 'secret123',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                accessCount: 15,
                maxAccess: 50,
                isActive: true,
                createdAt: new Date(),
                createdBy: '김철수'
            },
            {
                id: '2',
                url: 'https://corbu.ai/share/project-2',
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                accessCount: 8,
                maxAccess: 100,
                isActive: true,
                createdAt: new Date(),
                createdBy: '이영희'
            }
        ];

        setCollaborators(mockCollaborators);
        setShareLinks(mockShareLinks);

        // 실제 프로젝트 데이터 시뮬레이션
        const mockProjects: Project[] = [
            {
                id: '1',
                name: '개포우성7차',
                description: '개포우성7차 아파트 프로젝트',
                status: 'active',
                priority: 'high',
                createdAt: '2024-01-15',
                updatedAt: '2024-01-21',
                tags: ['부동산', '아파트', '개포동'],
                messageCount: 24,
                fileCount: 8,
                files: [
                    { id: '1', name: '분양계획서.pdf', type: 'application/pdf', size: 2048576 },
                    { id: '2', name: '설계도면.jpg', type: 'image/jpeg', size: 1048576 }
                ],
                guidelines: [
                    { id: '1', title: '부동산 전문 용어 사용', content: '부동산 관련 전문 용어를 정확히 사용하세요.', isActive: true },
                    { id: '2', title: '분양 정보 정확성', content: '분양 정보는 항상 최신 자료를 기준으로 제공하세요.', isActive: true }
                ]
            },
            {
                id: '2',
                name: '대화요약',
                description: 'AI 대화 요약 시스템 개발',
                status: 'active',
                priority: 'medium',
                createdAt: '2024-01-10',
                updatedAt: '2024-01-20',
                tags: ['AI', '개발', '요약'],
                messageCount: 15,
                fileCount: 3,
                files: [
                    { id: '3', name: '요약알고리즘.pdf', type: 'application/pdf', size: 1536000 }
                ],
                guidelines: [
                    { id: '3', title: '요약 형식', content: '핵심 내용을 3-5개 항목으로 요약하세요.', isActive: true }
                ]
            },
            {
                id: '3',
                name: '웹사이트 리뉴얼',
                description: '회사 웹사이트 리뉴얼 프로젝트',
                status: 'completed',
                priority: 'medium',
                createdAt: '2024-01-05',
                updatedAt: '2024-01-18',
                tags: ['웹사이트', '디자인', '개발'],
                messageCount: 32,
                fileCount: 12,
                files: [
                    { id: '4', name: '디자인가이드.pdf', type: 'application/pdf', size: 3072000 },
                    { id: '5', name: '와이어프레임.png', type: 'image/png', size: 512000 }
                ],
                guidelines: [
                    { id: '4', title: '반응형 디자인', content: '모든 디자인은 모바일 우선으로 제작하세요.', isActive: true }
                ]
            },
            {
                id: '4',
                name: '마케팅 전략',
                description: '2024년 마케팅 전략 수립',
                status: 'active',
                priority: 'low',
                createdAt: '2024-01-12',
                updatedAt: '2024-01-19',
                tags: ['마케팅', '전략', '2024'],
                messageCount: 8,
                fileCount: 5,
                files: [
                    { id: '6', name: '마케팅계획서.pdf', type: 'application/pdf', size: 1024000 }
                ],
                guidelines: [
                    { id: '5', title: '브랜드 일관성', content: '모든 마케팅 자료는 브랜드 가이드라인을 준수하세요.', isActive: true }
                ]
            }
        ];

        setProjects(mockProjects);
        setSelectedProject(mockProjects[0]); // 첫 번째 프로젝트 선택

        // 실제 메시지 데이터 시뮬레이션
        const mockMessages: Message[] = [
            {
                id: '1',
                type: 'user',
                content: '개포우성7차 프로젝트에 대해 설명해주세요.',
                timestamp: new Date('2024-01-21T10:30:00Z'),
                projectId: '1'
            },
            {
                id: '2',
                type: 'ai',
                content: '개포우성7차는 서울시 강남구 개포동에 위치한 아파트 단지입니다. 총 1,200세대 규모로, 2024년 3월 입주 예정입니다. 주요 특징으로는:\n\n• 3개동 25층 규모\n• 지하 3층 주차장\n• 커뮤니티 시설 완비\n• 초등학교 인접\n\n현재 분양률 95% 달성했으며, 잔여 세대는 60세대 정도 남아있습니다.',
                timestamp: new Date('2024-01-21T10:31:00Z'),
                projectId: '1'
            },
            {
                id: '3',
                type: 'user',
                content: '대화요약 기능은 어떻게 작동하나요?',
                timestamp: new Date('2024-01-20T15:45:00Z'),
                projectId: '2'
            },
            {
                id: '4',
                type: 'ai',
                content: '대화요약 기능은 다음과 같이 작동합니다:\n\n1. **실시간 대화 분석**: 사용자와 AI 간의 대화를 실시간으로 분석\n2. **핵심 내용 추출**: 주요 키워드와 핵심 내용을 자동으로 추출\n3. **요약 생성**: 추출된 내용을 바탕으로 간결한 요약 생성\n4. **카테고리 분류**: 대화 내용을 주제별로 자동 분류\n\n이 기능을 통해 긴 대화도 빠르게 파악할 수 있습니다.',
                timestamp: new Date('2024-01-20T15:46:00Z'),
                projectId: '2'
            }
        ];

        setMessages(mockMessages);

    }, []);

    const loadInitialData = () => {
        // 샘플 프로젝트 데이터
        const sampleProjects: Project[] = [
            {
                id: '1',
                name: '개포우성7차',
                description: '개포우성 7차 분양 관련 프로젝트',
                status: 'active',
                priority: 'high',
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-15T00:00:00Z',
                messageCount: 24,
                fileCount: 2,
                files: [
                    { id: '1', name: '분양계획서.pdf', type: 'application/pdf', size: 2048576 },
                    { id: '2', name: '설계도면.jpg', type: 'image/jpeg', size: 1048576 }
                ],
                guidelines: [
                    { id: '1', title: '부동산 전문 용어 사용', content: '부동산 관련 전문 용어를 정확히 사용하세요.', isActive: true },
                    { id: '2', title: '분양 정보 정확성', content: '분양 정보는 항상 최신 자료를 기준으로 제공하세요.', isActive: true }
                ],
                tags: ['부동산', '분양', '개포']
            },
            {
                id: '2',
                name: '대화요약',
                description: '대화 내용 요약 및 분석 프로젝트',
                status: 'active',
                priority: 'medium',
                createdAt: '2024-01-10T00:00:00Z',
                updatedAt: '2024-01-20T00:00:00Z',
                messageCount: 15,
                fileCount: 0,
                files: [],
                guidelines: [
                    { id: '3', title: '요약 형식', content: '핵심 내용을 3-5개 항목으로 요약하세요.', isActive: true }
                ],
                tags: ['요약', '분석']
            }
        ];

        setProjects(sampleProjects);
        if (sampleProjects.length > 0) {
            setSelectedProject(sampleProjects[0]);
        }
    };

    // 프로젝트 관리 함수들
    const handleProjectCreate = async (projectData: any) => {
        const newProject: Project = {
            id: `project_${Date.now()}`,
            name: projectData.name,
            description: projectData.description,
            status: 'active',
            priority: projectData.priority,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messageCount: 0,
            fileCount: 0,
            files: [],
            guidelines: projectData.initialGuidelines.map((guideline: string, index: number) => ({
                id: `guideline_${Date.now()}_${index}`,
                title: `지침 ${index + 1}`,
                content: guideline,
                isActive: true
            })),
            tags: projectData.tags
        };

        setProjects(prev => [newProject, ...prev]);
        setSelectedProject(newProject);
    };

    const handleProjectEdit = (projectId: string) => {
        // 프로젝트 편집 로직
        console.log('프로젝트 편집:', projectId);
    };

    const handleProjectDelete = (projectId: string) => {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        if (selectedProject?.id === projectId) {
            setSelectedProject(projects[0] || null);
        }
    };

    const handleProjectArchive = (projectId: string) => {
        setProjects(prev => prev.map(p =>
            p.id === projectId
                ? { ...p, status: p.status === 'archived' ? 'active' : 'archived' }
                : p
        ));
    };

    // 채팅 관련 함수들
    const handleSendMessage = async (message: string, attachments?: File[]) => {
        if (!selectedProject) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: message,
            timestamp: new Date(),
            projectId: selectedProject.id,
            attachments: attachments?.map((file, index) => ({
                id: `att_${Date.now()}_${index}`,
                name: file.name,
                type: file.type,
                size: file.size
            }))
        };

        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        // AI 응답 시뮬레이션 (프로젝트별 맞춤 응답)
        setTimeout(() => {
            let aiResponseContent = '';

            switch (selectedProject.name) {
                case '개포우성7차':
                    aiResponseContent = `개포우성7차 프로젝트에 대한 질문을 받았습니다: "${message}"\n\n개포우성7차는 서울시 강남구 개포동에 위치한 아파트 단지로, 총 1,200세대 규모입니다. 현재 분양률 95%를 달성했으며, 2024년 3월 입주 예정입니다.\n\n주요 특징:\n• 3개동 25층 규모\n• 지하 3층 주차장\n• 커뮤니티 시설 완비\n• 초등학교 인접\n\n추가적인 정보가 필요하시면 언제든 말씀해 주세요.`;
                    break;
                case '대화요약':
                    aiResponseContent = `대화요약 프로젝트에 대한 질문을 받았습니다: "${message}"\n\n대화요약 기능은 실시간으로 대화를 분석하여 핵심 내용을 추출하고 요약을 생성하는 AI 시스템입니다.\n\n주요 기능:\n• 실시간 대화 분석\n• 핵심 키워드 추출\n• 자동 요약 생성\n• 카테고리 분류\n\n더 자세한 정보가 필요하시면 말씀해 주세요.`;
                    break;
                case '웹사이트 리뉴얼':
                    aiResponseContent = `웹사이트 리뉴얼 프로젝트에 대한 질문을 받았습니다: "${message}"\n\n웹사이트 리뉴얼 프로젝트는 기존 회사 웹사이트를 현대적이고 사용자 친화적으로 개선하는 프로젝트입니다. 현재 완료 상태이며, 새로운 디자인과 기능이 적용되었습니다.\n\n개선 사항:\n• 반응형 디자인 적용\n• 사용자 경험 개선\n• 성능 최적화\n• SEO 최적화\n\n프로젝트 결과나 기술적 세부사항에 대해 궁금한 점이 있으시면 말씀해 주세요.`;
                    break;
                case '마케팅 전략':
                    aiResponseContent = `마케팅 전략 프로젝트에 대한 질문을 받았습니다: "${message}"\n\n2024년 마케팅 전략 수립 프로젝트는 회사의 성장을 위한 종합적인 마케팅 계획을 수립하는 프로젝트입니다. 현재 활성 상태로 진행 중이며, 다양한 채널과 전략을 포함하고 있습니다.\n\n전략 방향:\n• 디지털 마케팅 강화\n• 콘텐츠 마케팅 확대\n• 소셜 미디어 활용\n• 고객 참여도 증대\n\n전략적 방향이나 세부 계획에 대해 더 알고 싶으시면 말씀해 주세요.`;
                    break;
                default:
                    aiResponseContent = `프로젝트 "${selectedProject.name}"에 대한 질문을 받았습니다: "${message}"\n\n이 프로젝트에 대한 AI 응답을 생성하고 있습니다. 더 구체적인 질문이나 요청사항이 있으시면 말씀해 주세요.`;
            }

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: aiResponseContent,
                timestamp: new Date(),
                projectId: selectedProject.id,
                metadata: {
                    model: 'gpt-4',
                    tokens: 150,
                    responseTime: 1200
                }
            };

            setMessages(prev => [...prev, aiMessage]);
            setIsTyping(false);

            // 알림 추가
            addNotification({
                type: 'info',
                title: '새 메시지',
                message: `${selectedProject.name} 프로젝트에서 새 메시지가 도착했습니다.`
            });
        }, 2000);
    };

    const handleMessageFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
        console.log('메시지 피드백:', messageId, feedback);
    };

    const handleMessageRegenerate = (messageId: string) => {
        console.log('메시지 재생성:', messageId);
    };

    const handleMessageCopy = (messageId: string) => {
        const message = messages.find(m => m.id === messageId);
        if (message) {
            navigator.clipboard.writeText(message.content);
        }
    };

    // 파일 관리 함수들
    const handleFilesAdd = (files: File[]) => {
        const newFiles: FileItem[] = files.map((file, index) => ({
            id: `file_${Date.now()}_${index}`,
            name: file.name,
            type: file.type,
            size: file.size,
            uploadedAt: new Date(),
            status: 'success'
        }));

        setProjectFiles(prev => [...prev, ...newFiles]);
    };

    const handleFileRemove = (fileId: string) => {
        setProjectFiles(prev => prev.filter(f => f.id !== fileId));
    };

    // 지침 관리 함수들
    const handleGuidelineAdd = (guideline: Omit<Guideline, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newGuideline: Guideline = {
            ...guideline,
            id: `guideline_${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        setProjectGuidelines(prev => [...prev, newGuideline]);
    };

    const handleGuidelineEdit = (id: string, guideline: Partial<Guideline>) => {
        setProjectGuidelines(prev => prev.map(g =>
            g.id === id ? { ...g, ...guideline, updatedAt: new Date().toISOString() } : g
        ));
    };

    const handleGuidelineDelete = (id: string) => {
        setProjectGuidelines(prev => prev.filter(g => g.id !== id));
    };

    const handleGuidelineToggle = (id: string, isActive: boolean) => {
        setProjectGuidelines(prev => prev.map(g =>
            g.id === id ? { ...g, isActive, updatedAt: new Date().toISOString() } : g
        ));
    };

    // 알림 관리 함수들
    const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        const newNotification: Notification = {
            ...notification,
            id: `notification_${Date.now()}`,
            timestamp: new Date(),
            read: false
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const handleNotificationDismiss = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleNotificationRead = (id: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const handleClearAllNotifications = () => {
        setNotifications([]);
    };

    const handleMarkAllNotificationsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    // 검색 관리 함수들
    const handleGlobalSearch = (query: string, filters: SearchFilter[]) => {
        setIsSearching(true);
        // 검색 시뮬레이션
        setTimeout(() => {
            const results: SearchResult[] = [
                {
                    id: '1',
                    type: 'project',
                    title: '개포우성7차',
                    content: '개포우성 7차 분양 관련 프로젝트',
                    metadata: {
                        projectId: '1',
                        projectName: '개포우성7차',
                        timestamp: new Date(),
                        tags: ['부동산', '분양']
                    },
                    score: 0.95,
                    highlights: [{ field: 'title', snippet: '개포우성7차' }]
                }
            ];
            setSearchResults(results);
            setIsSearching(false);
        }, 1000);
    };

    const handleSaveSearch = (name: string, filters: SearchFilter[]) => {
        const savedSearch = {
            id: `search_${Date.now()}`,
            name,
            filters,
            createdAt: new Date()
        };
        setSavedSearches(prev => [savedSearch, ...prev]);
        addNotification({
            type: 'success',
            title: '검색 저장됨',
            message: `"${name}" 검색이 저장되었습니다.`
        });
    };

    const handleLoadSearch = (savedSearch: any) => {
        setSearchFilters(savedSearch.filters);
        addNotification({
            type: 'info',
            title: '검색 로드됨',
            message: `"${savedSearch.name}" 검색이 로드되었습니다.`
        });
    };

    // AI 성능 모니터링 함수들
    const handlePerformanceOptimize = async () => {
        setIsPerformanceOptimizing(true);
        addNotification({
            type: 'info',
            title: '성능 최적화 시작',
            message: 'AI 시스템 성능 최적화를 시작합니다...'
        });

        // 최적화 시뮬레이션
        setTimeout(() => {
            setIsPerformanceOptimizing(false);
            addNotification({
                type: 'success',
                title: '성능 최적화 완료',
                message: 'AI 시스템 성능이 최적화되었습니다.'
            });
        }, 3000);
    };

    const handlePerformanceAlert = (alert: any) => {
        setPerformanceAlerts(prev => [alert, ...prev]);
        addNotification({
            type: alert.type,
            title: alert.title,
            message: alert.message
        });
    };

    const handleModelUpdate = (modelId: string, updates: any) => {
        addNotification({
            type: 'info',
            title: '모델 업데이트',
            message: `AI 모델 ${modelId}가 업데이트되었습니다.`
        });
    };

    // RBAC 시스템 함수들
    const handleUserCreate = (userData: any) => {
        addNotification({
            type: 'success',
            title: '사용자 생성됨',
            message: `${userData.fullName} 사용자가 생성되었습니다.`
        });
    };

    const handleUserUpdate = (userId: string, updates: any) => {
        addNotification({
            type: 'success',
            title: '사용자 업데이트됨',
            message: '사용자 정보가 업데이트되었습니다.'
        });
    };

    const handleUserDelete = (userId: string) => {
        addNotification({
            type: 'info',
            title: '사용자 삭제됨',
            message: '사용자가 삭제되었습니다.'
        });
    };

    const handleRoleCreate = (roleData: any) => {
        addNotification({
            type: 'success',
            title: '역할 생성됨',
            message: `${roleData.name} 역할이 생성되었습니다.`
        });
    };

    const handleRoleUpdate = (roleId: string, updates: any) => {
        addNotification({
            type: 'success',
            title: '역할 업데이트됨',
            message: '역할 정보가 업데이트되었습니다.'
        });
    };

    const handleRoleDelete = (roleId: string) => {
        addNotification({
            type: 'info',
            title: '역할 삭제됨',
            message: '역할이 삭제되었습니다.'
        });
    };

    const handlePermissionUpdate = (permissions: string[]) => {
        addNotification({
            type: 'success',
            title: '권한 업데이트됨',
            message: '권한 설정이 업데이트되었습니다.'
        });
    };

    // 워크플로우 자동화 함수들
    const handleWorkflowCreate = (workflowData: any) => {
        addNotification({
            type: 'success',
            title: '워크플로우 생성됨',
            message: `${workflowData.name} 워크플로우가 생성되었습니다.`
        });
    };

    const handleWorkflowUpdate = (workflowId: string, updates: any) => {
        addNotification({
            type: 'success',
            title: '워크플로우 업데이트됨',
            message: '워크플로우가 업데이트되었습니다.'
        });
    };

    const handleWorkflowDelete = (workflowId: string) => {
        addNotification({
            type: 'info',
            title: '워크플로우 삭제됨',
            message: '워크플로우가 삭제되었습니다.'
        });
    };

    const handleWorkflowExecute = (workflowId: string, input?: any) => {
        addNotification({
            type: 'info',
            title: '워크플로우 실행 시작',
            message: '워크플로우 실행이 시작되었습니다.'
        });
    };

    const handleWorkflowEnable = (workflowId: string, enabled: boolean) => {
        addNotification({
            type: 'success',
            title: enabled ? '워크플로우 활성화됨' : '워크플로우 비활성화됨',
            message: `워크플로우가 ${enabled ? '활성화' : '비활성화'}되었습니다.`
        });
    };

    // 고급 데이터 분석 함수들
    const handleInsightAction = (insightId: string, actionId: string) => {
        addNotification({
            type: 'info',
            title: '인사이트 액션 실행',
            message: '선택한 인사이트 액션이 실행되었습니다.'
        });
    };

    const handleMetricUpdate = (metricId: string, updates: any) => {
        addNotification({
            type: 'success',
            title: '메트릭 업데이트됨',
            message: '메트릭이 업데이트되었습니다.'
        });
    };

    const handleChartExport = (chartId: string, format: string) => {
        addNotification({
            type: 'success',
            title: '차트 내보내기 완료',
            message: `차트가 ${format.toUpperCase()} 형식으로 내보내졌습니다.`
        });
    };

    const handleFilterChange = (filters: any) => {
        addNotification({
            type: 'info',
            title: '필터 적용됨',
            message: '데이터 필터가 적용되었습니다.'
        });
    };

    // AI 예측 시스템 핸들러
    const handlePredictionAction = (predictionId: string, action: string) => {
        setPredictions(prev => prev.map(pred =>
            pred.id === predictionId
                ? { ...pred, status: action === 'accept' ? 'accepted' : 'rejected' }
                : pred
        ));
        addNotification({
            type: action === 'accept' ? 'success' : 'info',
            title: `예측 ${action === 'accept' ? '수락' : '거부'}`,
            message: `예측이 성공적으로 ${action === 'accept' ? '수락' : '거부'}되었습니다.`
        });
    };

    const handleRecommendationAction = (recommendationId: string, action: string) => {
        setRecommendations(prev => prev.map(rec =>
            rec.id === recommendationId
                ? { ...rec, status: action === 'accept' ? 'accepted' : 'rejected' }
                : rec
        ));
        addNotification({
            type: action === 'accept' ? 'success' : 'info',
            title: `추천 ${action === 'accept' ? '수락' : '거부'}`,
            message: `추천이 성공적으로 ${action === 'accept' ? '수락' : '거부'}되었습니다.`
        });
    };

    const handleExportPredictions = (type: string) => {
        addNotification({
            type: 'success',
            title: '데이터 내보내기',
            message: `${type} 데이터가 성공적으로 내보내기되었습니다.`
        });
    };

    const handleRefreshPredictions = () => {
        addNotification({
            type: 'info',
            title: '예측 새로고침',
            message: 'AI 예측 데이터가 새로고침되었습니다.'
        });
    };

    // 실시간 대화 분석 핸들러
    const handleConversationAnalysisComplete = (analysis: any) => {
        setConversationAnalyses(prev => [...prev, analysis]);
        addNotification({
            type: 'success',
            title: '대화 분석 완료',
            message: '대화 분석이 성공적으로 완료되었습니다.'
        });
    };

    const handleConversationInsightAction = (insightId: string, action: string) => {
        addNotification({
            type: action === 'accept' ? 'success' : 'info',
            title: `인사이트 ${action === 'accept' ? '수락' : '거부'}`,
            message: `대화 인사이트가 ${action === 'accept' ? '수락' : '거부'}되었습니다.`
        });
    };

    const handleConversationRecommendationAction = (recommendationId: string, action: string) => {
        addNotification({
            type: action === 'accept' ? 'success' : 'info',
            title: `추천 ${action === 'accept' ? '수락' : '거부'}`,
            message: `대화 추천이 ${action === 'accept' ? '수락' : '거부'}되었습니다.`
        });
    };

    const handleExportConversationAnalysis = (analysisId: string, format: string) => {
        addNotification({
            type: 'success',
            title: '분석 내보내기',
            message: `대화 분석이 ${format.toUpperCase()} 형식으로 내보내졌습니다.`
        });
    };

    // AI 문서 생성 핸들러
    const handleDocumentCreate = (documentData: any) => {
        setGeneratedDocuments(prev => [...prev, documentData]);
        addNotification({
            type: 'success',
            title: '문서 생성됨',
            message: `${documentData.title} 문서가 생성되었습니다.`
        });
    };

    const handleDocumentUpdate = (documentId: string, updates: any) => {
        setGeneratedDocuments(prev => prev.map(doc =>
            doc.id === documentId ? { ...doc, ...updates } : doc
        ));
        addNotification({
            type: 'success',
            title: '문서 업데이트됨',
            message: '문서가 성공적으로 업데이트되었습니다.'
        });
    };

    const handleDocumentDelete = (documentId: string) => {
        setGeneratedDocuments(prev => prev.filter(doc => doc.id !== documentId));
        addNotification({
            type: 'info',
            title: '문서 삭제됨',
            message: '문서가 삭제되었습니다.'
        });
    };

    const handleDocumentShare = (documentId: string, shareOptions: any) => {
        addNotification({
            type: 'success',
            title: '문서 공유됨',
            message: '문서가 성공적으로 공유되었습니다.'
        });
    };

    const handleExportDocument = (documentId: string, format: string) => {
        addNotification({
            type: 'success',
            title: '문서 내보내기',
            message: `문서가 ${format.toUpperCase()} 형식으로 내보내졌습니다.`
        });
    };

    const handleSuggestionApply = (documentId: string, suggestion: any) => {
        addNotification({
            type: 'success',
            title: '제안 적용됨',
            message: 'AI 제안이 문서에 적용되었습니다.'
        });
    };

    // 파일 분석 대화 핸들러
    const handleFileUpload = (files: File[]) => {
        addNotification({
            type: 'info',
            title: '파일 업로드 시작',
            message: `${files.length}개 파일이 업로드되었습니다.`
        });
    };

    const handleFileMessageSend = (message: string, files?: any[]) => {
        setFileAnalysisMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'user',
            content: message,
            timestamp: new Date(),
            files
        }]);
        addNotification({
            type: 'info',
            title: '메시지 전송됨',
            message: '파일 분석 대화에 메시지가 전송되었습니다.'
        });
    };

    const handleFileAnalysisComplete = (analysis: any) => {
        setAnalyzedFiles(prev => [...prev, analysis]);
        addNotification({
            type: 'success',
            title: '파일 분석 완료',
            message: `${analysis.name} 파일 분석이 완료되었습니다.`
        });
    };

    const handleExportFileAnalysis = (fileId: string, format: string) => {
        addNotification({
            type: 'success',
            title: '분석 내보내기',
            message: `파일 분석이 ${format.toUpperCase()} 형식으로 내보내졌습니다.`
        });
    };

    const handleShareFileAnalysis = (fileId: string, shareOptions: any) => {
        addNotification({
            type: 'success',
            title: '분석 공유됨',
            message: '파일 분석이 성공적으로 공유되었습니다.'
        });
    };

    // AI 코드 생성 핸들러
    const handleCodeProjectCreate = (project: any) => {
        setCodeProjects(prev => [...prev, project]);
        addNotification({
            type: 'success',
            title: '코드 프로젝트 생성됨',
            message: `${project.name} 프로젝트가 생성되었습니다.`
        });
    };

    const handleCodeProjectUpdate = (projectId: string, updates: any) => {
        setCodeProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));
        addNotification({
            type: 'success',
            title: '프로젝트 업데이트됨',
            message: '코드 프로젝트가 업데이트되었습니다.'
        });
    };

    const handleCodeProjectDelete = (projectId: string) => {
        setCodeProjects(prev => prev.filter(p => p.id !== projectId));
        addNotification({
            type: 'info',
            title: '프로젝트 삭제됨',
            message: '코드 프로젝트가 삭제되었습니다.'
        });
    };

    const handleCodeGenerate = (prompt: string, context: any) => {
        addNotification({
            type: 'info',
            title: '코드 생성 시작',
            message: 'AI가 코드를 생성하고 있습니다.'
        });
    };

    const handleCodeOptimize = (fileId: string, optimizations: any[]) => {
        setCodeOptimizations(prev => [...prev, ...optimizations]);
        addNotification({
            type: 'success',
            title: '코드 최적화 완료',
            message: `${optimizations.length}개의 최적화가 적용되었습니다.`
        });
    };

    const handleCodeTestRun = (projectId: string, tests: any[]) => {
        setCodeTests(prev => [...prev, ...tests]);
        addNotification({
            type: 'success',
            title: '테스트 실행 완료',
            message: `${tests.length}개의 테스트가 실행되었습니다.`
        });
    };

    const handleExportCodeProject = (projectId: string, format: string) => {
        addNotification({
            type: 'success',
            title: '프로젝트 내보내기',
            message: `코드 프로젝트가 ${format.toUpperCase()} 형식으로 내보내졌습니다.`
        });
    };

    const handleShareCodeProject = (projectId: string, shareOptions: any) => {
        addNotification({
            type: 'success',
            title: '프로젝트 공유됨',
            message: '코드 프로젝트가 성공적으로 공유되었습니다.'
        });
    };

    // AI 디자인 시스템 핸들러
    const handleDesignSystemCreate = (system: any) => {
        setDesignSystems(prev => [...prev, system]);
        addNotification({
            type: 'success',
            title: '디자인 시스템 생성됨',
            message: `${system.name} 디자인 시스템이 생성되었습니다.`
        });
    };

    const handleDesignSystemUpdate = (systemId: string, updates: any) => {
        setDesignSystems(prev => prev.map(s => s.id === systemId ? { ...s, ...updates } : s));
        addNotification({
            type: 'success',
            title: '시스템 업데이트됨',
            message: '디자인 시스템이 업데이트되었습니다.'
        });
    };

    const handleDesignSystemDelete = (systemId: string) => {
        setDesignSystems(prev => prev.filter(s => s.id !== systemId));
        addNotification({
            type: 'info',
            title: '시스템 삭제됨',
            message: '디자인 시스템이 삭제되었습니다.'
        });
    };

    const handleComponentGenerate = (prompt: string, context: any) => {
        addNotification({
            type: 'info',
            title: '컴포넌트 생성 시작',
            message: 'AI가 컴포넌트를 생성하고 있습니다.'
        });
    };

    const handleColorGenerate = (prompt: string, context: any) => {
        addNotification({
            type: 'info',
            title: '색상 팔레트 생성 시작',
            message: 'AI가 색상 팔레트를 생성하고 있습니다.'
        });
    };

    const handleTypographyGenerate = (prompt: string, context: any) => {
        addNotification({
            type: 'info',
            title: '타이포그래피 생성 시작',
            message: 'AI가 타이포그래피 시스템을 생성하고 있습니다.'
        });
    };

    const handleExportDesignSystem = (systemId: string, format: string) => {
        addNotification({
            type: 'success',
            title: '시스템 내보내기',
            message: `디자인 시스템이 ${format.toUpperCase()} 형식으로 내보내졌습니다.`
        });
    };

    const handleShareDesignSystem = (systemId: string, shareOptions: any) => {
        addNotification({
            type: 'success',
            title: '시스템 공유됨',
            message: '디자인 시스템이 성공적으로 공유되었습니다.'
        });
    };

    // 고도화된 AI 엔진 핸들러
    const handleAIProcessingStart = (config: any) => {
        console.log('AI processing started with config:', config);
        setAiProcessingConfig(config);
        addNotification({
            type: 'info',
            title: 'AI 처리 시작',
            message: '고도화된 AI 엔진이 처리를 시작했습니다.'
        });
    };

    const handleAIProcessingComplete = (result: any) => {
        console.log('AI processing completed:', result);
        setAiProcessingResults(prev => [result, ...prev]);
        addNotification({
            type: 'success',
            title: 'AI 처리 완료',
            message: '고도화된 AI 엔진 처리가 완료되었습니다.'
        });
    };

    const handleAIModelChange = (model: string) => {
        console.log('AI model changed to:', model);
        addNotification({
            type: 'info',
            title: 'AI 모델 변경',
            message: `AI 모델이 ${model}로 변경되었습니다.`
        });
    };

    const handleAIConfigUpdate = (config: any) => {
        console.log('AI config updated:', config);
        setAiProcessingConfig((prev: any) => ({ ...prev, ...config }));
    };

    const handleAIExportResults = (results: any[], format: string) => {
        console.log('Exporting AI results:', results, format);
        addNotification({
            type: 'success',
            title: '결과 내보내기',
            message: `AI 처리 결과가 ${format} 형식으로 내보내기되었습니다.`
        });
    };

    const handleAIImportData = (data: any) => {
        console.log('Importing AI data:', data);
        addNotification({
            type: 'info',
            title: '데이터 가져오기',
            message: 'AI 데이터가 성공적으로 가져와졌습니다.'
        });
    };

    // 분석 데이터 로드
    const loadAnalyticsData = () => {
        setIsAnalyticsLoading(true);
        // 분석 데이터 시뮬레이션
        setTimeout(() => {
            const mockData: AnalyticsData = {
                projects: {
                    total: 12,
                    active: 8,
                    completed: 3,
                    archived: 1,
                    growth: 15
                },
                messages: {
                    total: 156,
                    thisWeek: 23,
                    thisMonth: 89,
                    growth: 8
                },
                files: {
                    total: 45,
                    totalSize: 1024 * 1024 * 50, // 50MB
                    thisWeek: 8,
                    growth: 12
                },
                performance: {
                    responseTime: 1200,
                    accuracy: 94,
                    satisfaction: 4.2,
                    trend: 'up'
                },
                activity: [
                    { date: '2024-01-15', projects: 2, messages: 15, files: 3 },
                    { date: '2024-01-16', projects: 1, messages: 12, files: 2 },
                    { date: '2024-01-17', projects: 3, messages: 18, files: 5 },
                    { date: '2024-01-18', projects: 0, messages: 8, files: 1 },
                    { date: '2024-01-19', projects: 2, messages: 22, files: 4 },
                    { date: '2024-01-20', projects: 1, messages: 14, files: 2 },
                    { date: '2024-01-21', projects: 2, messages: 19, files: 3 }
                ],
                topProjects: [
                    {
                        id: '1',
                        name: '개포우성7차',
                        messageCount: 24,
                        fileCount: 8,
                        lastActivity: '2024-01-21T10:30:00Z',
                        status: 'active'
                    },
                    {
                        id: '2',
                        name: '대화요약',
                        messageCount: 15,
                        fileCount: 3,
                        lastActivity: '2024-01-20T15:45:00Z',
                        status: 'active'
                    }
                ],
                recentActivity: [
                    {
                        id: '1',
                        type: 'message_sent',
                        title: '새 메시지 전송',
                        description: '개포우성7차 프로젝트에서 새 메시지가 전송되었습니다.',
                        timestamp: '2024-01-21T10:30:00Z',
                        projectId: '1',
                        projectName: '개포우성7차'
                    },
                    {
                        id: '2',
                        type: 'file_uploaded',
                        title: '파일 업로드',
                        description: '대화요약 프로젝트에 새 파일이 업로드되었습니다.',
                        timestamp: '2024-01-21T09:15:00Z',
                        projectId: '2',
                        projectName: '대화요약'
                    }
                ]
            };
            setAnalyticsData(mockData);
            setIsAnalyticsLoading(false);
        }, 1000);
    };

    // 분석 데이터 새로고침
    const handleAnalyticsRefresh = () => {
        loadAnalyticsData();
    };

    // 분석 데이터 내보내기
    const handleAnalyticsExport = (format: 'pdf' | 'csv' | 'json') => {
        addNotification({
            type: 'success',
            title: '내보내기 완료',
            message: `분석 데이터가 ${format.toUpperCase()} 형식으로 내보내기되었습니다.`
        });
    };

    // 필터링된 프로젝트
    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // 선택된 프로젝트의 메시지만 필터링
    const projectMessages = messages.filter(message =>
        selectedProject ? message.projectId === selectedProject.id : true
    );

    // 프로젝트별 최근 메시지 (사이드바용)
    const getProjectRecentMessage = (projectId: string) => {
        const projectMsgs = messages.filter(msg => msg.projectId === projectId);
        return projectMsgs.length > 0 ? projectMsgs[projectMsgs.length - 1] : null;
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* 사이드바 */}
            <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-80'
                }`}>
                <div className="flex flex-col h-full">
                    {/* 사이드바 헤더 */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            {!sidebarCollapsed && (
                                <div className="flex items-center space-x-2">
                                    <Folder className="h-6 w-6 text-purple-600" />
                                    <h1 className="text-lg font-semibold text-gray-900">프로젝트</h1>
                                </div>
                            )}
                            <button
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                                {sidebarCollapsed ? (
                                    <ChevronRight className="h-4 w-4 text-gray-500" />
                                ) : (
                                    <ChevronLeft className="h-4 w-4 text-gray-500" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* 검색 및 필터 */}
                    {!sidebarCollapsed && (
                        <div className="p-4 border-b border-gray-200">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="프로젝트 검색..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}

                    {/* 프로젝트 목록 */}
                    <div className="flex-1 overflow-y-auto">
                        {!sidebarCollapsed ? (
                            <ProjectList
                                projects={filteredProjects}
                                selectedProjectId={selectedProject?.id || null}
                                onProjectSelect={(project) => {
                                    setSelectedProject(project);
                                    addNotification({
                                        type: 'info',
                                        title: '프로젝트 선택됨',
                                        message: `${project.name} 프로젝트가 선택되었습니다.`
                                    });
                                }}
                                onProjectCreate={() => setShowProjectModal(true)}
                                onProjectEdit={handleProjectEdit}
                                onProjectDelete={handleProjectDelete}
                                onProjectArchive={handleProjectArchive}
                            />
                        ) : (
                            <div className="p-2 space-y-2">
                                {filteredProjects.map((project) => {
                                    const recentMessage = getProjectRecentMessage(project.id);
                                    return (
                                        <button
                                            key={project.id}
                                            onClick={() => {
                                                setSelectedProject(project);
                                                addNotification({
                                                    type: 'info',
                                                    title: '프로젝트 선택됨',
                                                    message: `${project.name} 프로젝트가 선택되었습니다.`
                                                });
                                            }}
                                            className={`w-full p-2 rounded-lg transition-colors relative ${selectedProject?.id === project.id
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'hover:bg-gray-100'
                                                }`}
                                            title={project.name}
                                        >
                                            <Folder className="h-5 w-5" />
                                            {recentMessage && (
                                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="flex-1 flex flex-col">
                {selectedProject ? (
                    <>
                        {/* 프로젝트 헤더 */}
                        <div className="bg-white border-b border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div>
                                        <h1 className="text-xl font-bold text-gray-900">{selectedProject.name}</h1>
                                        <p className="text-sm text-gray-600">{selectedProject.description}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${selectedProject.priority === 'high' ? 'bg-red-100 text-red-800' :
                                            selectedProject.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                            {selectedProject.priority === 'high' ? '높음' :
                                                selectedProject.priority === 'medium' ? '보통' : '낮음'}
                                        </span>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${selectedProject.status === 'active' ? 'bg-green-100 text-green-800' :
                                            selectedProject.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {selectedProject.status === 'active' ? '활성' :
                                                selectedProject.status === 'completed' ? '완료' : '보관'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {/* 전역 검색 버튼 */}
                                    <button
                                        onClick={() => setShowGlobalSearch(!showGlobalSearch)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="전역 검색"
                                    >
                                        <Search className="h-4 w-4 text-gray-500" />
                                    </button>

                                    {/* 알림 시스템 */}
                                    <NotificationSystem
                                        notifications={notifications}
                                        onNotificationDismiss={handleNotificationDismiss}
                                        onNotificationRead={handleNotificationRead}
                                        onClearAll={handleClearAllNotifications}
                                        onMarkAllRead={handleMarkAllNotificationsRead}
                                        soundEnabled={soundEnabled}
                                        onSoundToggle={setSoundEnabled}
                                    />

                                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                        <MoreVertical className="h-4 w-4 text-gray-500" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 전역 검색 패널 */}
                        <AnimatePresence>
                            {showGlobalSearch && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="bg-white border-b border-gray-200 p-4"
                                >
                                    <AdvancedSearch
                                        onSearch={handleGlobalSearch}
                                        onFilterChange={setSearchFilters}
                                        onSaveSearch={handleSaveSearch}
                                        onLoadSearch={handleLoadSearch}
                                        savedSearches={savedSearches}
                                        searchResults={searchResults}
                                        isLoading={isSearching}
                                        placeholder="프로젝트, 메시지, 파일, 지침을 검색하세요..."
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 탭 네비게이션 */}
                        <div className="bg-white border-b border-gray-200">
                            <div className="flex space-x-8 px-4">
                                <button
                                    onClick={() => setActiveTab('chat')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'chat'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <MessageSquare className="h-4 w-4" />
                                        <span>채팅</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('files')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'files'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <FileText className="h-4 w-4" />
                                        <span>파일</span>
                                        {projectFiles.length > 0 && (
                                            <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                                                {projectFiles.length}
                                            </span>
                                        )}
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('guidelines')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'guidelines'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Settings className="h-4 w-4" />
                                        <span>지침</span>
                                        {projectGuidelines.length > 0 && (
                                            <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                                                {projectGuidelines.length}
                                            </span>
                                        )}
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('analytics')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'analytics'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <BarChart3 className="h-4 w-4" />
                                        <span>분석</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('collaboration')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'collaboration'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Users className="h-4 w-4" />
                                        <span>협업</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'settings'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Settings className="h-4 w-4" />
                                        <span>설정</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('monitoring')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'monitoring'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Activity className="h-4 w-4" />
                                        <span>모니터링</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('rbac')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'rbac'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Shield className="h-4 w-4" />
                                        <span>사용자 관리</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('automation')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'automation'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Zap className="h-4 w-4" />
                                        <span>자동화</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('insights')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'insights'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Lightbulb className="h-4 w-4" />
                                        <span>인사이트</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('predictions')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'predictions'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Brain className="h-4 w-4" />
                                        <span>예측</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('conversation-analysis')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'conversation-analysis'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <MessageSquare className="h-4 w-4" />
                                        <span>대화 분석</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('document-generation')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'document-generation'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <FileText className="h-4 w-4" />
                                        <span>문서 생성</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('file-analysis-chat')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'file-analysis-chat'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Wand2 className="h-4 w-4" />
                                        <span>파일 분석 대화</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('code-generator')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'code-generator'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Code className="h-4 w-4" />
                                        <span>코드 생성</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('design-system')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'design-system'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Palette className="h-4 w-4" />
                                        <span>디자인 시스템</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('advanced-ai-engine')}
                                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'advanced-ai-engine'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Zap className="h-4 w-4" />
                                        <span>고도화 AI 엔진</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* 탭 콘텐츠 */}
                        <div className="flex-1 overflow-hidden">
                            <AnimatePresence mode="wait">
                                {activeTab === 'chat' && (
                                    <motion.div
                                        key="chat"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="h-full"
                                    >
                                        <ChatInterface
                                            messages={projectMessages}
                                            onSendMessage={handleSendMessage}
                                            onMessageFeedback={handleMessageFeedback}
                                            onMessageRegenerate={handleMessageRegenerate}
                                            onMessageCopy={handleMessageCopy}
                                            selectedProject={{
                                                id: selectedProject.id,
                                                name: selectedProject.name,
                                                description: selectedProject.description,
                                                guidelines: selectedProject.guidelines
                                            }}
                                            isTyping={isTyping}
                                            isConnected={true}
                                        />
                                    </motion.div>
                                )}

                                {activeTab === 'files' && (
                                    <motion.div
                                        key="files"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="h-full p-6 overflow-y-auto"
                                    >
                                        <FileUpload
                                            files={projectFiles}
                                            onFilesAdd={handleFilesAdd}
                                            onFileRemove={handleFileRemove}
                                            maxFiles={20}
                                            maxFileSize={100}
                                            allowedTypes={['*']}
                                            projectId={selectedProject.id}
                                        />
                                    </motion.div>
                                )}

                                {activeTab === 'guidelines' && (
                                    <motion.div
                                        key="guidelines"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="h-full p-6 overflow-y-auto"
                                    >
                                        <GuidelinesManager
                                            guidelines={projectGuidelines}
                                            onGuidelineAdd={handleGuidelineAdd}
                                            onGuidelineEdit={handleGuidelineEdit}
                                            onGuidelineDelete={handleGuidelineDelete}
                                            onGuidelineToggle={handleGuidelineToggle}
                                        />
                                    </motion.div>
                                )}

                                {activeTab === 'analytics' && (
                                    <motion.div
                                        key="analytics"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="h-full p-6 overflow-y-auto"
                                    >
                                        {analyticsData ? (
                                            <ProjectAnalytics
                                                data={analyticsData}
                                                onRefresh={handleAnalyticsRefresh}
                                                onExport={handleAnalyticsExport}
                                                isLoading={isAnalyticsLoading}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <div className="text-center">
                                                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                    <p className="text-gray-500">분석 데이터를 로드하는 중...</p>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'collaboration' && (
                                    <motion.div
                                        key="collaboration"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="h-full overflow-y-auto"
                                    >
                                        <RealTimeCollaboration
                                            projectId={selectedProject.id}
                                            projectName={selectedProject.name}
                                            collaborators={collaborators}
                                            shareLinks={shareLinks}
                                            onInviteCollaborator={(email, role) => {
                                                addNotification({
                                                    type: 'success',
                                                    title: '협업자 초대됨',
                                                    message: `${email}에게 ${role} 역할로 초대가 전송되었습니다.`
                                                });
                                            }}
                                            onRemoveCollaborator={(id) => {
                                                addNotification({
                                                    type: 'info',
                                                    title: '협업자 제거됨',
                                                    message: '협업자가 프로젝트에서 제거되었습니다.'
                                                });
                                            }}
                                            onUpdateRole={(id, role) => {
                                                addNotification({
                                                    type: 'success',
                                                    title: '역할 업데이트됨',
                                                    message: `협업자의 역할이 ${role}로 변경되었습니다.`
                                                });
                                            }}
                                            onCreateShareLink={(options) => {
                                                addNotification({
                                                    type: 'success',
                                                    title: '공유 링크 생성됨',
                                                    message: '새로운 공유 링크가 생성되었습니다.'
                                                });
                                            }}
                                            onDeleteShareLink={(id) => {
                                                addNotification({
                                                    type: 'info',
                                                    title: '공유 링크 삭제됨',
                                                    message: '공유 링크가 삭제되었습니다.'
                                                });
                                            }}
                                            onCopyLink={(url) => {
                                                addNotification({
                                                    type: 'success',
                                                    title: '링크 복사됨',
                                                    message: '공유 링크가 클립보드에 복사되었습니다.'
                                                });
                                            }}
                                        />
                                    </motion.div>
                                )}

                                {activeTab === 'settings' && (
                                    <motion.div
                                        key="settings"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="h-full overflow-y-auto"
                                    >
                                        <AdvancedSettings
                                            onSave={(settings) => {
                                                addNotification({
                                                    type: 'success',
                                                    title: '설정 저장됨',
                                                    message: '설정이 성공적으로 저장되었습니다.'
                                                });
                                            }}
                                            onReset={() => {
                                                addNotification({
                                                    type: 'info',
                                                    title: '설정 초기화됨',
                                                    message: '설정이 기본값으로 복원되었습니다.'
                                                });
                                            }}
                                            onExport={() => {
                                                addNotification({
                                                    type: 'success',
                                                    title: '설정 내보내기 완료',
                                                    message: '설정 파일이 다운로드되었습니다.'
                                                });
                                            }}
                                            onImport={(data) => {
                                                addNotification({
                                                    type: 'success',
                                                    title: '설정 가져오기 완료',
                                                    message: '설정이 성공적으로 가져와졌습니다.'
                                                });
                                            }}
                                        />
                                    </motion.div>
                                )}

                                {activeTab === 'monitoring' && (
                                    <motion.div
                                        key="monitoring"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="h-full overflow-y-auto"
                                    >
                                        <AIPerformanceMonitor
                                            onOptimize={handlePerformanceOptimize}
                                            onAlert={handlePerformanceAlert}
                                            onModelUpdate={handleModelUpdate}
                                        />
                                    </motion.div>
                                )}

                                {activeTab === 'rbac' && (
                                    <motion.div
                                        key="rbac"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="h-full overflow-y-auto"
                                    >
                                        <RBACSystem
                                            onUserCreate={handleUserCreate}
                                            onUserUpdate={handleUserUpdate}
                                            onUserDelete={handleUserDelete}
                                            onRoleCreate={handleRoleCreate}
                                            onRoleUpdate={handleRoleUpdate}
                                            onRoleDelete={handleRoleDelete}
                                            onPermissionUpdate={handlePermissionUpdate}
                                        />
                                    </motion.div>
                                )}

                                {activeTab === 'automation' && (
                                    <motion.div
                                        key="automation"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="h-full overflow-y-auto"
                                    >
                                        <WorkflowAutomation
                                            onWorkflowCreate={handleWorkflowCreate}
                                            onWorkflowUpdate={handleWorkflowUpdate}
                                            onWorkflowDelete={handleWorkflowDelete}
                                            onWorkflowExecute={handleWorkflowExecute}
                                            onWorkflowEnable={handleWorkflowEnable}
                                        />
                                    </motion.div>
                                )}

                                {activeTab === 'insights' && (
                                    <motion.div
                                        key="insights"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="h-full overflow-y-auto"
                                    >
                                        <AdvancedDataInsights
                                            onInsightAction={handleInsightAction}
                                            onMetricUpdate={handleMetricUpdate}
                                            onChartExport={handleChartExport}
                                            onFilterChange={handleFilterChange}
                                        />
                                    </motion.div>
                                )}

                                {activeTab === 'predictions' && (
                                    <motion.div
                                        key="predictions"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="h-full overflow-y-auto"
                                    >
                                        <AIPredictionSystem
                                            onPredictionAction={handlePredictionAction}
                                            onRecommendationAction={handleRecommendationAction}
                                            onExportData={handleExportPredictions}
                                            onRefreshPredictions={handleRefreshPredictions}
                                        />
                                    </motion.div>
                                )}

                                {activeTab === 'conversation-analysis' && (
                                    <motion.div
                                        key="conversation-analysis"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="h-full overflow-y-auto"
                                    >
                                        <RealTimeConversationAnalyzer
                                            onAnalysisComplete={handleConversationAnalysisComplete}
                                            onInsightAction={handleConversationInsightAction}
                                            onRecommendationAction={handleConversationRecommendationAction}
                                            onExportAnalysis={handleExportConversationAnalysis}
                                        />
                                    </motion.div>
                                )}

                                {activeTab === 'document-generation' && (
                                    <motion.div
                                        key="document-generation"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="h-full overflow-y-auto"
                                    >
                                        <AIDocumentGenerator
                                            onDocumentCreate={handleDocumentCreate}
                                            onDocumentUpdate={handleDocumentUpdate}
                                            onDocumentDelete={handleDocumentDelete}
                                            onDocumentShare={handleDocumentShare}
                                            onExportDocument={handleExportDocument}
                                            onSuggestionApply={handleSuggestionApply}
                                        />
                                    </motion.div>
                                )}

                                {activeTab === 'file-analysis-chat' && (
                                    <motion.div
                                        key="file-analysis-chat"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="h-full overflow-y-auto"
                                    >
                                        <FileAnalysisChatSystem
                                            onFileUpload={handleFileUpload}
                                            onMessageSend={handleFileMessageSend}
                                            onAnalysisComplete={handleFileAnalysisComplete}
                                            onExportAnalysis={handleExportFileAnalysis}
                                            onShareAnalysis={handleShareFileAnalysis}
                                        />
                                    </motion.div>
                                )}

                                {activeTab === 'code-generator' && (
                                    <motion.div
                                        key="code-generator"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="h-full overflow-y-auto"
                                    >
                                        <AICodeGenerator
                                            onProjectCreate={handleCodeProjectCreate}
                                            onProjectUpdate={handleCodeProjectUpdate}
                                            onProjectDelete={handleCodeProjectDelete}
                                            onCodeGenerate={handleCodeGenerate}
                                            onCodeOptimize={handleCodeOptimize}
                                            onTestRun={handleCodeTestRun}
                                            onExportProject={handleExportCodeProject}
                                            onShareProject={handleShareCodeProject}
                                        />
                                    </motion.div>
                                )}

                                {activeTab === 'design-system' && (
                                    <motion.div
                                        key="design-system"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="h-full overflow-y-auto"
                                    >
                                        <AIDesignSystem
                                            onSystemCreate={handleDesignSystemCreate}
                                            onSystemUpdate={handleDesignSystemUpdate}
                                            onSystemDelete={handleDesignSystemDelete}
                                            onComponentGenerate={handleComponentGenerate}
                                            onColorGenerate={handleColorGenerate}
                                            onTypographyGenerate={handleTypographyGenerate}
                                            onExportSystem={handleExportDesignSystem}
                                            onShareSystem={handleShareDesignSystem}
                                        />
                                    </motion.div>
                                )}

                                {activeTab === 'advanced-ai-engine' && (
                                    <motion.div
                                        key="advanced-ai-engine"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="h-full overflow-y-auto"
                                    >
                                        <AdvancedAIEngine
                                            onProcessingStart={handleAIProcessingStart}
                                            onProcessingComplete={handleAIProcessingComplete}
                                            onModelChange={handleAIModelChange}
                                            onConfigUpdate={handleAIConfigUpdate}
                                            onExportResults={handleAIExportResults}
                                            onImportData={handleAIImportData}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </>
                ) : (
                    /* 프로젝트가 선택되지 않은 경우 */
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <Folder className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">프로젝트를 선택하세요</h2>
                            <p className="text-gray-600 mb-4">왼쪽 사이드바에서 프로젝트를 선택하거나 새 프로젝트를 만들어보세요.</p>
                            <button
                                onClick={() => setShowProjectModal(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mx-auto"
                            >
                                <Plus className="h-4 w-4" />
                                <span>새 프로젝트 만들기</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 프로젝트 생성 모달 */}
            <AnimatePresence>
                {showProjectModal && (
                    <ProjectCreationModal
                        isOpen={showProjectModal}
                        onClose={() => setShowProjectModal(false)}
                        onCreateProject={handleProjectCreate}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default UnifiedProjectInterface;
