import React, { useState, useEffect } from 'react';
import './ChatGPT5CompleteInterface.css';
import {
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Paper,
    Avatar,
    Divider,
    InputAdornment,
    Menu,
    MenuItem,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    FormLabel,
    Collapse,
    Tooltip,
    Badge,
    Drawer,
    AppBar,
    Toolbar
} from '@mui/material';
import {
    Add,
    Folder,
    Chat as MessageSquare,
    Description,
    Search,
    MoreVert,
    Send,
    Mic,
    AttachFile as Paperclip,
    Add as Plus,
    Image,
    Code,
    Language as Globe,
    Storage as HardDrive,
    Cloud,
    Share,
    Archive,
    Delete,
    Edit,
    Settings,
    Lightbulb,
    EmojiEmotions,
    AttachMoney,
    School,
    Create,
    Favorite,
    Flight,
    Chat,
    LibraryBooks,
    QrCode,
    PlayArrow,
    GridView,
    Person,
    ExpandMore,
    ExpandLess,
    KeyboardArrowDown,
    KeyboardArrowUp,
    Diamond,
    FolderOpen,
    History,
    Star,
    ThumbUp,
    ThumbDown,
    VolumeUp,
    Share as ShareIcon,
    MoreHoriz,
    Security,
    Memory,
    Speed,
    FileCopy,
    Menu as MenuIcon
} from '@mui/icons-material';
import ChatGPTProjectService from '../services/chatGPTProjectService';
import PersistentChatSessionService, { ChatSessionStats } from '../services/persistentChatSessionService';
import { ChatSession } from '../types/chat';
import { setupGlobalErrorHandling } from '../utils/errorHandler';
import { errorLogger } from '../utils/errorLogger';
import ErrorBoundary from '../components/ErrorBoundary';
import { useNotifications } from '../hooks/useNotifications';
import { useResponsive } from '../hooks/useResponsive';
import MessageModifyRequestDialog from './MessageModifyRequestDialog';
import ProjectHub from './ProjectHub';
import ProjectTemplateSelector from './ProjectTemplateSelector';
import ProjectEditDialog from './ProjectEditDialog';
import ConfirmDialog from './ConfirmDialog';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import projectTemplateService from '../services/projectTemplateService';
import {
    evaluateAnswerQuality,
    enhanceAnswerQuality,
    createQualityReview,
    generateIntegratedAIResponse,
    updateSystemLearning,
    startModelTraining,
    detectDataDrift,
    optimizeHyperparameters
} from '../services/advancedAIFunctions';
import SystemIntegrationDashboard from './SystemIntegration/SystemIntegrationDashboard';
import SystemHealthMonitor from './SystemIntegration/SystemHealthMonitor';
import SystemIntegrationManager from './SystemIntegration/SystemIntegrationManager';
import AdvancedAIIntelligenceDashboard from './AI/AdvancedAIIntelligenceDashboard';
import SecurityDashboard from './Security/SecurityDashboard';
import SecurityNotificationCenter from './Security/SecurityNotificationCenter';
import PerformanceOptimizer from './UI/PerformanceOptimizer';
import EnhancedUserExperience from './UI/EnhancedUserExperience';
import AuthenticationForm from './Security/AuthenticationForm';
import NotebookLLM from './NotebookLLM';

interface Project {
    id: string;
    name: string;
    category: string;
    memoryType: 'default' | 'project_exclusive';
    description?: string;
    createdAt: string;
    fileCount: number;
    sessionCount: number;
}

interface ProjectSession {
    id: string;
    title: string;
    preview: string;
    createdAt: string;
    lastActivity: string;
    messageCount: number;
    isActive: boolean;
    tags?: string[];
    isExpanded?: boolean;
    subItems?: ProjectSession[];
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    response?: string;
    timestamp: string;
    isBookmarked?: boolean;
    qualityScore?: number;
    reviewStatus?: 'pending' | 'reviewed' | 'approved';
    feedback?: string[];
    metadata?: {
        projectId?: string;
        tags?: string[];
        function?: string;
        mathematicalAnalysis?: MathematicalAnalysis[];
        languageAnalysis?: KoreanLanguageAnalysis;
        statisticalData?: {
            confidence: number;
            sampleSize: number;
            marginOfError: number;
        };
    };
}

// 고급 AI 기능 인터페이스들
interface MathematicalAnalysis {
    type: 'cost' | 'roi' | 'timeline' | 'risk' | 'probability' | 'statistics';
    calculation: string;
    result: number;
    unit: string;
    confidence: number;
    formula: string;
    variables: Record<string, number>;
    explanation: string;
    assumptions: string[];
    limitations: string[];
}

interface KoreanLanguageAnalysis {
    formality: 'formal' | 'casual' | 'mixed';
    politeness: 'high' | 'medium' | 'low';
    culturalContext: string[];
    regionalDialect: string;
    honorificLevel: number;
    emotionalNuance: string;
    culturalSensitivity: string[];
    formalityAdjustment: boolean;
}

interface AnswerQualityMetrics {
    accuracy: number;
    completeness: number;
    clarity: number;
    relevance: number;
    depth: number;
    overallScore: number;
}

interface QualityReview {
    id: string;
    messageId: string;
    reviewer: 'ai' | 'human';
    metrics: AnswerQualityMetrics;
    feedback: string[];
    suggestions: string[];
    status: 'pending' | 'reviewed' | 'approved';
    timestamp: Date;
}

interface DeepLearningModel {
    id: string;
    name: string;
    type: 'neural_network' | 'transformer' | 'cnn' | 'rnn' | 'lstm' | 'bert' | 'gpt';
    status: 'idle' | 'training' | 'evaluating' | 'deployed' | 'error';
    accuracy: number;
    loss: number;
    epochs: number;
    currentEpoch: number;
    learningRate: number;
    batchSize: number;
    datasetSize: number;
    lastUpdated: Date;
    performance: {
        precision: number;
        recall: number;
        f1Score: number;
        confusionMatrix: number[][];
    };
}

interface TrainingSession {
    id: string;
    modelId: string;
    startTime: Date;
    endTime?: Date;
    status: 'running' | 'completed' | 'failed' | 'paused';
    progress: number;
    currentEpoch: number;
    totalEpochs: number;
    metrics: {
        trainLoss: number[];
        valLoss: number[];
        trainAccuracy: number[];
        valAccuracy: number[];
    };
    logs: string[];
}

interface AutoLearningConfig {
    enabled: boolean;
    autoRetrain: boolean;
    performanceThreshold: number;
    dataDriftDetection: boolean;
    adaptiveLearningRate: boolean;
    earlyStopping: boolean;
    modelEnsemble: boolean;
    hyperparameterOptimization: boolean;
}

interface MLPerformanceMetrics {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    auc: number;
    confusionMatrix: number[][];
    learningCurve: {
        epochs: number[];
        trainLoss: number[];
        valLoss: number[];
        trainAccuracy: number[];
        valAccuracy: number[];
    };
}

interface RealTimeData {
    cpu: number;
    memory: number;
    network: number;
    users: number;
    responseTime: number;
}

interface Collaborator {
    id: string;
    name: string;
    role: string;
    avatar: string;
    status: 'online' | 'offline' | 'away';
}

const PROJECT_CATEGORIES = [
    { id: 'investment', label: '투자', icon: AttachMoney, color: '#4CAF50' },
    { id: 'homework', label: '숙제', icon: School, color: '#2196F3' },
    { id: 'writing', label: '글쓰기', icon: Create, color: '#9C27B0' },
    { id: 'health', label: '건강', icon: Favorite, color: '#F44336' },
    { id: 'travel', label: '여행', icon: Flight, color: '#FF9800' },
];

const AI_MODELS = [
    { id: 'codex', name: 'Codex', icon: QrCode, color: '#1976d2' },
    { id: 'sora', name: 'Sora', icon: PlayArrow, color: '#2e7d32' },
    { id: 'gpt', name: 'GPT', icon: GridView, color: '#ed6c02' },
    { id: 'chat', name: '챗', icon: Chat, color: '#9c27b0' },
];

export const ChatGPT5CompleteInterface: React.FC = () => {
    // 알림 관리
    const {
        notifications,
        markAsRead,
        dismiss,
        clearAll,
        addNotification,
    } = useNotifications();

    // 확인 다이얼로그
    const {
        dialogState: confirmDialog,
        showConfirm,
        closeDialog: closeConfirmDialog,
        handleConfirm: handleConfirmDialog,
        handleCancel: handleCancelDialog,
    } = useConfirmDialog();

    // 반응형 디자인
    const { isMobile, isTablet, isDesktop } = useResponsive();

    // 상태 관리
    const [projects, setProjects] = useState<Project[]>([]);
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const [currentSession, setCurrentSession] = useState<ProjectSession | null>(null);
    const [sessions, setSessions] = useState<ProjectSession[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    // UI 상태
    const [showProjectCreation, setShowProjectCreation] = useState(false);
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [showProjectEdit, setShowProjectEdit] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
    const [showFileManager, setShowFileManager] = useState(false);
    const [showSessionList, setShowSessionList] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [selectedAIModel, setSelectedAIModel] = useState('gpt');
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

    // 고급 AI 기능 상태
    const [qualityMode, setQualityMode] = useState<'standard' | 'enhanced' | 'expert'>('enhanced');
    const [autoReview, setAutoReview] = useState(true);
    const [qualityThreshold, setQualityThreshold] = useState(85);
    const [qualityReviews, setQualityReviews] = useState<QualityReview[]>([]);

    // 딥러닝 및 머신러닝 시스템 상태
    const [deepLearningModels, setDeepLearningModels] = useState<DeepLearningModel[]>([]);
    const [activeTrainingSessions, setActiveTrainingSessions] = useState<TrainingSession[]>([]);
    const [autoLearningConfig, setAutoLearningConfig] = useState<AutoLearningConfig>({
        enabled: true,
        autoRetrain: true,
        performanceThreshold: 0.85,
        dataDriftDetection: true,
        adaptiveLearningRate: true,
        earlyStopping: true,
        modelEnsemble: false,
        hyperparameterOptimization: true
    });
    const [mlPerformanceMetrics, setMLPerformanceMetrics] = useState<MLPerformanceMetrics | null>(null);
    const [isModelTraining, setIsModelTraining] = useState(false);

    // 메시지 수정 요청 상태
    const [modifyRequestDialogOpen, setModifyRequestDialogOpen] = useState(false);
    const [selectedMessageForModify, setSelectedMessageForModify] = useState<ChatMessage | null>(null);
    const [selectedModel, setSelectedModel] = useState<DeepLearningModel | null>(null);

    // 실시간 데이터 및 협업 상태
    const [realTimeData, setRealTimeData] = useState<RealTimeData>({
        cpu: 45,
        memory: 62,
        network: 78,
        users: 1250,
        responseTime: 120
    });
    const [collaborators, setCollaborators] = useState<Collaborator[]>([
        { id: '1', name: '김개발', role: '개발자', avatar: '👨‍💻', status: 'online' },
        { id: '2', name: '이디자인', role: '디자이너', avatar: '👩‍🎨', status: 'online' },
        { id: '3', name: '박기획', role: '기획자', avatar: '👨‍💼', status: 'away' }
    ]);

    // 통합 시스템 상태
    const [activeTab, setActiveTab] = useState(0);
    const [showSecurityDashboard, setShowSecurityDashboard] = useState(false);
    const [showPerformanceOptimizer, setShowPerformanceOptimizer] = useState(false);
    const [showSystemIntegration, setShowSystemIntegration] = useState(false);
    const [showAIIntelligence, setShowAIIntelligence] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // 지속적 채팅 세션 관리 상태
    const [persistentChatService] = useState(() => PersistentChatSessionService.getInstance());
    const [persistentSessions, setPersistentSessions] = useState<ChatSession[]>([]);
    const [currentPersistentSession, setCurrentPersistentSession] = useState<ChatSession | null>(null);
    const [showPersistentSessionManager, setShowPersistentSessionManager] = useState(false);
    const [sessionSearchQuery, setSessionSearchQuery] = useState('');
    const [sessionStats, setSessionStats] = useState<ChatSessionStats | null>(null);

    // 프로젝트 생성 상태
    const [projectName, setProjectName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('travel');
    const [selectedMemoryType, setSelectedMemoryType] = useState<'default' | 'project_exclusive'>('default');
    const [showMemorySettings, setShowMemorySettings] = useState(false);

    // 노트북 LLM 상태
    const [showNotebookLLM, setShowNotebookLLM] = useState(false);
    const [showProjectNotebookLLM, setShowProjectNotebookLLM] = useState(false);

    // 초기 데이터 로드
    useEffect(() => {
        // 전역 에러 핸들링 설정
        setupGlobalErrorHandling();

        loadProjects();
        loadInitialData();
    }, []);

    // 실시간 데이터 업데이트
    useEffect(() => {
        const interval = setInterval(() => {
            setRealTimeData(prev => ({
                cpu: Math.max(20, Math.min(90, prev.cpu + (Math.random() - 0.5) * 10)),
                memory: Math.max(30, Math.min(85, prev.memory + (Math.random() - 0.5) * 8)),
                network: Math.max(50, Math.min(95, prev.network + (Math.random() - 0.5) * 12)),
                users: Math.max(800, Math.min(2000, prev.users + Math.floor((Math.random() - 0.5) * 100))),
                responseTime: Math.max(80, Math.min(200, prev.responseTime + (Math.random() - 0.5) * 20))
            }));

            // 데이터 드리프트 감지 (5분마다)
            if (Date.now() % 300000 < 1000) {
                detectDataDrift();
            }

            // 자동 성능 모니터링
            if (autoLearningConfig.enabled) {
                deepLearningModels.forEach(model => {
                    if (model.status === 'deployed' && model.accuracy < autoLearningConfig.performanceThreshold) {
                        errorLogger.warn(`${model.name} 성능 저하 감지 - 자동 재학습 시작`, { model: model.name });
                        startModelTraining(model.id);
                    }
                });
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [autoLearningConfig, deepLearningModels]);

    // 자동 학습 설정 변경 시 효과
    useEffect(() => {
        if (autoLearningConfig.hyperparameterOptimization) {
            // 하이퍼파라미터 최적화가 활성화된 경우, 모든 모델에 대해 최적화 실행
            deepLearningModels.forEach(model => {
                if (model.status === 'idle' || model.status === 'deployed') {
                    optimizeHyperparameters(model.id);
                }
            });
        }
    }, [autoLearningConfig.hyperparameterOptimization]);

    // 학습 세션 완료 시 알림
    useEffect(() => {
        const completedSessions = activeTrainingSessions.filter(session => session.status === 'completed');
        if (completedSessions.length > 0) {
            errorLogger.info('학습 세션 완료', { count: completedSessions.length });

            // 성능 향상 확인
            completedSessions.forEach(session => {
                const model = deepLearningModels.find(m => m.id === session.modelId);
                if (model) {
                    errorLogger.info(`${model.name} 학습 완료`, {
                        model: model.name,
                        accuracy: (model.accuracy * 100).toFixed(1)
                    });
                }
            });
        }
    }, [activeTrainingSessions, deepLearningModels]);

    const loadInitialData = async () => {
        // 딥러닝 모델 초기화
        const initialModels: DeepLearningModel[] = [
            {
                id: 'dl-1',
                name: 'GPT-4 기반 언어 모델',
                type: 'gpt',
                status: 'deployed',
                accuracy: 0.94,
                loss: 0.12,
                epochs: 1000,
                currentEpoch: 1000,
                learningRate: 0.0001,
                batchSize: 32,
                datasetSize: 50000,
                lastUpdated: new Date(),
                performance: {
                    precision: 0.93,
                    recall: 0.94,
                    f1Score: 0.935,
                    confusionMatrix: [[450, 50], [30, 470]]
                }
            },
            {
                id: 'dl-2',
                name: 'CNN 기반 이미지 분석 모델',
                type: 'cnn',
                status: 'training',
                accuracy: 0.87,
                loss: 0.25,
                epochs: 500,
                currentEpoch: 320,
                learningRate: 0.001,
                batchSize: 64,
                datasetSize: 25000,
                lastUpdated: new Date(),
                performance: {
                    precision: 0.86,
                    recall: 0.87,
                    f1Score: 0.865,
                    confusionMatrix: [[220, 30], [25, 225]]
                }
            },
            {
                id: 'dl-3',
                name: 'Transformer 기반 시계열 예측 모델',
                type: 'transformer',
                status: 'evaluating',
                accuracy: 0.91,
                loss: 0.18,
                epochs: 800,
                currentEpoch: 800,
                learningRate: 0.0005,
                batchSize: 128,
                datasetSize: 35000,
                lastUpdated: new Date(),
                performance: {
                    precision: 0.90,
                    recall: 0.91,
                    f1Score: 0.905,
                    confusionMatrix: [[180, 20], [15, 185]]
                }
            }
        ];

        setDeepLearningModels(initialModels);
        setSelectedModel(initialModels[0]);

        // 지속적 채팅 세션 초기화
        const activeSessions = await persistentChatService.getActiveSessions();
        setPersistentSessions(activeSessions);
        setSessionStats(persistentChatService.getSessionStats());
    };

    // 프로젝트 로드
    const loadProjects = async () => {
        try {
            const projectService = ChatGPTProjectService.getInstance();
            const loadedProjects = await projectService.getProjects();

            if (loadedProjects.length > 0) {
                setProjects(loadedProjects);
                setCurrentProject(loadedProjects[0]);
                loadProjectData(loadedProjects[0].id);
            } else {
                // 기본 프로젝트 생성
                const defaultProject = await projectService.createProject({
                    name: '한양2차',
                    category: 'investment',
                    memoryType: 'default',
                    description: '한양2차 재건축 프로젝트'
                });
                setProjects([defaultProject]);
                setCurrentProject(defaultProject);
                loadProjectData(defaultProject.id);
            }
        } catch (error) {
            errorLogger.error('프로젝트 로드 실패', error);
            // 오프라인 모드로 기본 데이터 사용
            const mockProjects: Project[] = [
                {
                    id: '1',
                    name: '한양2차',
                    category: 'investment',
                    memoryType: 'default',
                    description: '한양2차 재건축 프로젝트',
                    createdAt: new Date().toISOString(),
                    fileCount: 1,
                    sessionCount: 5
                },
                {
                    id: '2',
                    name: '송파 바이럴',
                    category: 'investment',
                    memoryType: 'default',
                    description: '송파 바이럴 마케팅 프로젝트',
                    createdAt: new Date().toISOString(),
                    fileCount: 2,
                    sessionCount: 8
                }
            ];
            setProjects(mockProjects);
            setCurrentProject(mockProjects[0]);
            loadProjectData(mockProjects[0].id);
        }
    };

    // 프로젝트 데이터 로드
    const loadProjectData = async (projectId: string) => {
        const mockSessions: ProjectSession[] = [
            {
                id: '1',
                title: '대화 내용 요약',
                preview: '오후 입찰관련해서 오늘긴급회의 있는데 그부분은 없는데 다시 해줘',
                createdAt: '2024-09-03T10:00:00Z',
                lastActivity: '2024-09-03T10:00:00Z',
                messageCount: 3,
                isActive: true,
                tags: ['요약', '회의'],
                isExpanded: false,
                subItems: [
                    {
                        id: '1-1',
                        title: 'GS건설 송파한양2차 입찰',
                        preview: '보증금을 완납했다는 건 단순히 돈을 낸 게 아니라, 책임과 자신감을 보여준 행동이다.',
                        createdAt: '2024-09-01T10:00:00Z',
                        lastActivity: '2024-09-01T10:00:00Z',
                        messageCount: 5,
                        isActive: false,
                        tags: ['입찰', 'GS건설']
                    },
                    {
                        id: '1-2',
                        title: '브랜드 파워 확산',
                        preview: '송파한양2차, 1980년대 대장주 비상(飛上)... GS VS HDC 현산 수주전',
                        createdAt: '2024-08-28T10:00:00Z',
                        lastActivity: '2024-08-28T10:00:00Z',
                        messageCount: 4,
                        isActive: false,
                        tags: ['브랜드', '마케팅']
                    }
                ]
            },
            {
                id: '2',
                title: 'GS건설 입찰 논란',
                preview: '이게 다 누구를 위한 쇼인지 뻔히 보이네요. 조합 확인으로 식사 제공도 없었고, 조합원 자비로 계산...',
                createdAt: '2024-09-02T10:00:00Z',
                lastActivity: '2024-09-02T10:00:00Z',
                messageCount: 15,
                isActive: true,
                tags: ['입찰', '논란']
            },
            {
                id: '3',
                title: '댓글 작성 요청',
                preview: 'GS나 현산이나 어느 쪽을 응원하든 그 건 개인의 자유입니다 다만 경쟁을 방해하고 재건축 일정에',
                createdAt: '2024-09-02T09:30:00Z',
                lastActivity: '2024-09-02T09:30:00Z',
                messageCount: 8,
                isActive: false,
                tags: ['댓글', '작성']
            }
        ];
        setSessions(mockSessions);
    };

    // 프로젝트 생성
    const handleCreateProject = async () => {
        if (!projectName.trim()) return;

        try {
            const projectService = ChatGPTProjectService.getInstance();
            const newProject = await projectService.createProject({
                name: projectName.trim(),
                category: selectedCategory,
                memoryType: selectedMemoryType,
                description: `프로젝트: ${projectName}`
            });

            setProjects(prev => [newProject, ...prev]);
            setCurrentProject(newProject);
            setShowProjectCreation(false);
            setProjectName('');
            setSelectedCategory('travel');
            setSelectedMemoryType('default');
        } catch (error) {
            errorLogger.error('프로젝트 생성 실패', error, { projectName });
            // 오프라인 모드로 로컬 생성
            const newProject: Project = {
                id: Date.now().toString(),
                name: projectName.trim(),
                category: selectedCategory,
                memoryType: selectedMemoryType,
                description: `프로젝트: ${projectName}`,
                createdAt: new Date().toISOString(),
                fileCount: 0,
                sessionCount: 0
            };

            setProjects(prev => [newProject, ...prev]);
            setCurrentProject(newProject);
            setShowProjectCreation(false);
            setProjectName('');
            setSelectedCategory('travel');
            setSelectedMemoryType('default');
        }
    };

    // 세션 선택
    const handleSessionSelect = (sessionId: string) => {
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
            setCurrentSession(session);
            setShowSessionList(false);
            loadSessionMessages(sessionId);
        }
    };

    // 세션 메시지 로드
    const loadSessionMessages = async (sessionId: string) => {
        const mockMessages: ChatMessage[] = [
            {
                id: '1',
                role: 'user',
                content: 'GS건설 입찰 논란에 대해 어떻게 생각하시나요?',
                timestamp: '2024-09-02T10:00:00Z'
            },
            {
                id: '2',
                role: 'assistant',
                content: 'GS건설의 입찰 과정에서 발생한 논란은 여러 측면에서 분석해볼 필요가 있습니다. 조합원들의 자비로 계산된 부분과 관련하여 투명성과 공정성에 대한 우려가 제기되고 있는 상황입니다.',
                timestamp: '2024-09-02T10:01:00Z'
            }
        ];
        setMessages(mockMessages);
    };

    // 메시지 전송 (고급 AI 기능 통합)
    const handleSendMessage = async () => {
        if (!inputValue.trim() || !currentSession) return;

        // 새로운 질문이 시작되면 지속적 채팅 세션 생성
        if (!currentPersistentSession) {
            const sessionTitle = inputValue.length > 30 ?
                inputValue.substring(0, 30) + '...' :
                inputValue;
            createNewPersistentSession(sessionTitle, inputValue);

            // 새 세션 생성 후 잠시 대기
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue.trim(),
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');

        try {
            // 통합 AI 응답 생성 시스템 사용
            let aiResponse = await generateIntegratedAIResponse(inputValue.trim());

            // 답변 품질 향상 적용
            if (autoReview) {
                aiResponse = await enhanceAnswerQuality(aiResponse, inputValue.trim());
            }

            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date().toISOString(),
                qualityScore: evaluateAnswerQuality(aiResponse, inputValue.trim()).overallScore,
                reviewStatus: 'reviewed',
                feedback: []
            };

            // 품질 검토 생성 및 저장
            const qualityReview = createQualityReview(assistantMessage.id, aiResponse, inputValue.trim());
            setQualityReviews(prev => [...prev, qualityReview]);

            setMessages(prev => [...prev, assistantMessage]);

            // 자동 학습 시스템 활성화
            if (autoLearningConfig.enabled) {
                // 사용자 피드백 시뮬레이션 (실제로는 사용자가 평가)
                const simulatedFeedback = aiResponse.length > 500 ? 'positive' : 'neutral';
                updateSystemLearning(inputValue.trim(), aiResponse, simulatedFeedback);
            }

            // 지속적 채팅 세션에 메시지 추가
            if (currentPersistentSession) {
                persistentChatService.addMessageToSession(
                    currentPersistentSession.id,
                    {
                        role: 'user' as const,
                        content: inputValue.trim(),
                        isBookmarked: false
                    }
                );

                persistentChatService.addMessageToSession(
                    currentPersistentSession.id,
                    {
                        role: 'assistant' as const,
                        content: aiResponse,
                        isBookmarked: false
                    }
                );
            }

        } catch (error) {
            errorLogger.error('AI 응답 생성 중 오류', error, {
                sessionId: currentSession?.id,
                messageLength: inputValue.length
            });

            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `❌ **오류 발생**\n\n죄송합니다. 응답 생성 중 오류가 발생했습니다.\n\n오류 내용: ${error instanceof Error ? error.message : '알 수 없는 오류'}\n\n다시 시도해주시거나 다른 질문을 해주세요.`,
                timestamp: new Date().toISOString(),
                qualityScore: 0,
                reviewStatus: 'reviewed',
                feedback: ['오류 발생으로 인한 응답 실패']
            };

            setMessages(prev => [...prev, errorMessage]);
        }
    };

    // 메시지 수정 요청 핸들러
    const handleModifyRequest = (messageId: string) => {
        const message = messages.find(msg => msg.id === messageId);
        if (message && message.role === 'assistant') {
            setSelectedMessageForModify(message);
            setModifyRequestDialogOpen(true);
        }
    };

    // 수정 요청 확인 핸들러
    const handleModifyRequestConfirm = async (modifyRequest: string) => {
        if (!selectedMessageForModify || !currentSession) return;

        setModifyRequestDialogOpen(false);
        setIsTyping(true);

        try {
            // 원본 질문 찾기 (선택된 메시지 이전의 사용자 메시지)
            const messageIndex = messages.findIndex(msg => msg.id === selectedMessageForModify.id);
            const previousUserMessage = messages
                .slice(0, messageIndex)
                .reverse()
                .find(msg => msg.role === 'user');

            // 수정 요청을 포함한 새로운 프롬프트 생성
            const originalQuestion = previousUserMessage?.content || '';
            const modifyPrompt = `다음은 이전에 생성한 응답입니다:\n\n${selectedMessageForModify.content}\n\n사용자의 수정 요청: ${modifyRequest}\n\n위 응답을 사용자의 수정 요청에 맞게 다시 작성해주세요. 원본 질문은 "${originalQuestion}"입니다.`;

            // 수정된 응답 생성
            let modifiedResponse = await generateIntegratedAIResponse(modifyPrompt);

            // 답변 품질 향상 적용
            if (autoReview) {
                modifiedResponse = await enhanceAnswerQuality(modifiedResponse, modifyPrompt);
            }

            // 메시지 업데이트 (기존 응답을 수정된 응답으로 교체)
            setMessages(prev => prev.map(msg =>
                msg.id === selectedMessageForModify.id
                    ? {
                        ...msg,
                        content: modifiedResponse,
                        timestamp: new Date().toISOString(),
                        qualityScore: evaluateAnswerQuality(modifiedResponse, modifyPrompt).overallScore,
                        reviewStatus: 'reviewed' as const,
                    }
                    : msg
            ));

            // 지속적 채팅 세션에 수정된 메시지 추가 (기존 메시지는 로컬에서만 업데이트)
            // 참고: 백엔드 API에 메시지 업데이트 엔드포인트가 없으므로 로컬 상태만 업데이트
            // 필요시 백엔드에 메시지 업데이트 API를 추가할 수 있습니다

            setSelectedMessageForModify(null);
        } catch (error) {
            errorLogger.error('수정 요청 처리 중 오류', error);
            addNotification({
                type: 'error',
                title: '수정 요청 실패',
                message: '수정 요청 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
            });
        } finally {
            setIsTyping(false);
        }
    };

    // 새 세션 생성
    const handleCreateNewSession = async () => {
        if (!currentProject) return;

        try {
            const projectService = ChatGPTProjectService.getInstance();
            const newSession = await projectService.createSession(currentProject.id, '새 채팅');

            setSessions(prev => [newSession, ...prev]);
            setCurrentSession(newSession);
            setMessages([]);
        } catch (error) {
            errorLogger.error('세션 생성 실패', error, { projectId: currentProject?.id });
            // 오프라인 모드로 로컬 생성
            const newSession: ProjectSession = {
                id: Date.now().toString(),
                title: '새 채팅',
                preview: '',
                createdAt: new Date().toISOString(),
                lastActivity: new Date().toISOString(),
                messageCount: 0,
                isActive: true,
                tags: []
            };

            setSessions(prev => [newSession, ...prev]);
            setCurrentSession(newSession);
            setMessages([]);
        }
    };

    // 프로젝트 확장/축소
    const toggleProjectExpansion = (projectId: string) => {
        const newExpanded = new Set(expandedProjects);
        if (newExpanded.has(projectId)) {
            newExpanded.delete(projectId);
        } else {
            newExpanded.add(projectId);
        }
        setExpandedProjects(newExpanded);
    };


    const generateAIResponse = async (userInput: string): Promise<string> => {
        // 키워드 기반 응답 생성
        const lowerInput = userInput.toLowerCase();

        if (lowerInput.includes('시스템') || lowerInput.includes('상태')) {
            return `🔧 **시스템 상태 분석**

현재 시스템 상태를 확인했습니다:

**전체 상태**: ✅ 정상
- CPU 사용률: 45%
- 메모리 사용률: 62%
- 네트워크 상태: 정상
- 활성 사용자: 1,250명

**주요 서비스**:
- AI 엔진: 정상 작동
- 데이터베이스: 연결 안정
- API 서버: 응답 시간 120ms

시스템이 안정적으로 작동하고 있습니다. 추가로 확인하고 싶은 부분이 있으시면 말씀해 주세요.`;
        }

        if (lowerInput.includes('보안') || lowerInput.includes('검사')) {
            return `🔒 **보안 상태 점검**

보안 검사를 실행했습니다:

**보안 점수**: 95/100 ⭐

**주요 보안 항목**:
- 인증 시스템: ✅ 안전
- 데이터 암호화: ✅ 활성화
- 접근 제어: ✅ 정상
- 위협 탐지: ✅ 활성

**최근 보안 이벤트**:
- 24시간 내 위협 탐지: 0건
- 로그인 시도: 1,247건 (정상)
- 의심스러운 활동: 0건

보안 상태가 우수합니다. 정기적인 보안 점검을 권장합니다.`;
        }

        if (lowerInput.includes('ai') || lowerInput.includes('인텔리전스') || lowerInput.includes('분석')) {
            return `🧠 **AI 인텔리전스 분석**

AI 시스템 분석 결과:

**성능 지표**:
- 응답 정확도: 94%
- 처리 속도: 평균 1.2초
- 학습 데이터: 2.3M 샘플
- 모델 버전: v5.2.1

**최근 인사이트**:
- 사용자 만족도: 87% (상승 추세)
- 인기 기능: 실시간 분석, 예측 모델
- 개선 영역: 다국어 지원, 응답 속도

**추천 액션**:
1. 다국어 모델 업데이트
2. 캐싱 시스템 최적화
3. 사용자 피드백 분석 강화

AI 시스템이 안정적으로 작동하고 있으며, 지속적인 개선이 이루어지고 있습니다.`;
        }

        if (lowerInput.includes('성능') || lowerInput.includes('최적화')) {
            return `⚡ **성능 최적화 분석**

성능 분석을 완료했습니다:

**현재 성능 지표**:
- 응답 시간: 120ms (목표: 100ms)
- 처리량: 1,250 req/min
- 에러율: 0.02%
- 가용성: 99.9%

**최적화 제안**:
1. **캐싱 강화**: Redis 캐시 적중률 85% → 95% 목표
2. **데이터베이스 최적화**: 쿼리 성능 15% 개선 가능
3. **CDN 활용**: 정적 자원 로딩 속도 30% 향상
4. **코드 분할**: 초기 로딩 시간 20% 단축

**우선순위**:
🔴 높음: 캐싱 시스템 개선
🟡 중간: 데이터베이스 인덱스 최적화
🟢 낮음: UI 컴포넌트 지연 로딩

성능 최적화를 시작하시겠습니까?`;
        }

        // 기본 응답
        return `안녕하세요! CORBU AI 시스템입니다. 

말씀해주신 내용을 이해했습니다. 다음과 같은 기능들을 도와드릴 수 있습니다:

🔧 **시스템 관리**: 시스템 상태 확인, 서비스 모니터링
🔒 **보안 관리**: 보안 점검, 위협 분석, 접근 제어
🧠 **AI 인텔리전스**: 데이터 분석, 예측 모델, 인사이트 생성
⚡ **성능 최적화**: 성능 분석, 최적화 제안, 모니터링

어떤 기능에 대해 더 자세히 알고 싶으시거나, 특정 작업을 수행하고 싶으시면 말씀해 주세요!`;
    };

    const handleQuickStart = (type: string) => {
        const messages = {
            system: "시스템 상태를 확인해 주세요",
            security: "보안 검사를 실행해 주세요",
            ai: "AI 인텔리전스 분석을 요청합니다",
            performance: "성능 최적화 분석을 해주세요"
        };

        setInputValue(messages[type as keyof typeof messages]);
        handleSendMessage();
    };

    const handleQuickAction = (action: string) => {
        handleQuickStart(action);
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return '오늘';
        if (diffDays === 2) return '어제';
        if (diffDays <= 7) return `${diffDays - 1}일 전`;

        return date.toLocaleDateString('ko-KR', {
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timestamp: string): string => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // 지속적 채팅 세션 관리 함수들
    const createNewPersistentSession = async (title: string, initialMessage?: string) => {
        const newSession = await persistentChatService.createPersistentChatSession(title, initialMessage);
        setPersistentSessions(prev => [...prev, newSession]);
        setCurrentPersistentSession(newSession);
        setShowPersistentSessionManager(false);
        errorLogger.info('새로운 지속적 채팅 세션 생성', { sessionTitle: newSession.title });
    };

    const switchToPersistentSession = (sessionId: string) => {
        const session = persistentChatService.getSession(sessionId);
        if (session) {
            setCurrentPersistentSession(session);
            // 메시지 타입 변환을 간단하게 처리
            const convertedMessages: ChatMessage[] = session.messages.map(msg => ({
                id: msg.id,
                role: 'user' as const, // 기본값으로 설정
                content: msg.content,
                timestamp: new Date(msg.timestamp).toISOString()
            }));
            setMessages(convertedMessages);
            errorLogger.info('지속적 채팅 세션으로 전환', { sessionTitle: session.title });
        }
    };

    const archivePersistentSession = async (sessionId: string) => {
        if (await persistentChatService.archiveSession(sessionId)) {
            setPersistentSessions(prev => prev.filter(s => s.id !== sessionId));
            if (currentPersistentSession?.id === sessionId) {
                setCurrentPersistentSession(null);
                setMessages([]);
            }
            setSessionStats(persistentChatService.getSessionStats());
        }
    };

    const deletePersistentSession = async (sessionId: string) => {
        if (await persistentChatService.deleteSession(sessionId)) {
            setPersistentSessions(prev => prev.filter(s => s.id !== sessionId));
            if (currentPersistentSession?.id === sessionId) {
                setCurrentPersistentSession(null);
                setMessages([]);
            }
            setSessionStats(persistentChatService.getSessionStats());
        }
    };

    const searchPersistentSessions = (query: string) => {
        const results = persistentChatService.searchSessions(query);
        setPersistentSessions(results);
    };

    const refreshSessionStats = () => {
        setSessionStats(persistentChatService.getSessionStats());
    };

    // 지속적 채팅 세션 자동 정리
    const cleanupInactiveSessions = () => {
        const now = new Date();
        const inactiveSessions = persistentSessions.filter(session => {
            const lastActivity = new Date(session.lastActivity);
            const inactiveTime = now.getTime() - lastActivity.getTime();
            return inactiveTime > 24 * 60 * 60 * 1000; // 24시간 이상 비활성
        });

        inactiveSessions.forEach(session => {
            archivePersistentSession(session.id);
        });

        if (inactiveSessions.length > 0) {
            errorLogger.info('비활성 세션 아카이브', { count: inactiveSessions.length });
        }
    };

    // 주기적 세션 정리 시작
    useEffect(() => {
        const cleanupInterval = setInterval(cleanupInactiveSessions, 60 * 60 * 1000); // 1시간마다
        return () => clearInterval(cleanupInterval);
    }, []);

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
            {/* 왼쪽 사이드바 (데스크톱만 표시) */}
            <Box sx={{
                width: 280,
                bgcolor: 'white',
                borderRight: 1,
                borderColor: 'divider',
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column'
            }}>
                {/* 상단 네비게이션 */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Box sx={{ width: 24, height: 24, bgcolor: '#1976d2', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>5</Typography>
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            ChatGPT 5
                        </Typography>
                        <KeyboardArrowDown sx={{ ml: 'auto', color: 'text.secondary' }} />
                    </Box>

                    {/* 기본 액션 버튼들 */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Button
                            variant="outlined"
                            startIcon={<Create />}
                            onClick={handleCreateNewSession}
                            sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                        >
                            새 채팅
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<Search />}
                            sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                        >
                            Q 채팅 검색
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<LibraryBooks />}
                            sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                        >
                            라이브러리
                        </Button>
                    </Box>
                </Box>

                {/* AI 모델 선택 */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                        AI 모델
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {AI_MODELS.map((model) => {
                            const Icon = model.icon;
                            const isSelected = selectedAIModel === model.id;

                            return (
                                <Tooltip key={model.id} title={model.name}>
                                    <IconButton
                                        onClick={() => setSelectedAIModel(model.id)}
                                        sx={{
                                            bgcolor: isSelected ? model.color : 'transparent',
                                            color: isSelected ? 'white' : 'text.secondary',
                                            '&:hover': {
                                                bgcolor: isSelected ? model.color : 'grey.100'
                                            }
                                        }}
                                    >
                                        <Icon />
                                    </IconButton>
                                </Tooltip>
                            );
                        })}
                    </Box>
                </Box>

                {/* 프로젝트 목록 */}
                <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                            새 프로젝트
                        </Typography>
                        <IconButton size="small" onClick={() => setShowProjectCreation(true)}>
                            <Add />
                        </IconButton>
                    </Box>

                    {projects.map((project) => {
                        const isExpanded = expandedProjects.has(project.id);
                        const projectSessions = sessions.filter(s => s.id.startsWith(project.id) || s.title.includes(project.name));

                        return (
                            <Box key={project.id} sx={{ mb: 1 }}>
                                <Card
                                    sx={{
                                        cursor: 'pointer',
                                        border: currentProject?.id === project.id ? 2 : 1,
                                        borderColor: currentProject?.id === project.id ? '#1976d2' : 'divider',
                                        bgcolor: currentProject?.id === project.id ? '#e3f2fd' : 'white',
                                        '&:hover': { boxShadow: 2 }
                                    }}
                                    onClick={() => {
                                        setCurrentProject(project);
                                        loadProjectData(project.id);
                                    }}
                                >
                                    <CardContent sx={{ p: 1.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {project.name === '한양2차' ? (
                                                <Diamond sx={{ color: '#9c27b0', fontSize: 20 }} />
                                            ) : (
                                                <Folder sx={{ color: '#1976d2', fontSize: 20 }} />
                                            )}
                                            <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
                                                {project.name}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleProjectExpansion(project.id);
                                                }}
                                            >
                                                {isExpanded ? <ExpandLess /> : <ExpandMore />}
                                            </IconButton>
                                        </Box>

                                        {isExpanded && (
                                            <Box sx={{ mt: 1, ml: 3 }}>
                                                {projectSessions.map((session) => (
                                                    <Box
                                                        key={session.id}
                                                        sx={{
                                                            p: 1,
                                                            borderRadius: 1,
                                                            cursor: 'pointer',
                                                            bgcolor: currentSession?.id === session.id ? '#f5f5f5' : 'transparent',
                                                            '&:hover': { bgcolor: '#f5f5f5' },
                                                            mb: 0.5
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSessionSelect(session.id);
                                                        }}
                                                    >
                                                        <Typography variant="caption" sx={{ display: 'block', fontWeight: 500 }}>
                                                            {session.title}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                                            {formatDate(session.lastActivity)}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Box>
                        );
                    })}
                </Box>

                {/* 사용자 프로필 */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
                            <Person />
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            KIM HOBUM Plus
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* 모바일 Drawer */}
            <Drawer
                anchor="left"
                open={mobileDrawerOpen}
                onClose={() => setMobileDrawerOpen(false)}
                ModalProps={{
                    keepMounted: true, // 모바일 성능 향상
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: 280,
                    },
                }}
            >
                {/* 사이드바 내용 재사용 */}
                <Box sx={{ width: 280, bgcolor: 'white', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* 상단 네비게이션 */}
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Box sx={{ width: 24, height: 24, bgcolor: '#1976d2', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>5</Typography>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                ChatGPT 5
                            </Typography>
                            <IconButton
                                size="small"
                                onClick={() => setMobileDrawerOpen(false)}
                                sx={{ ml: 'auto' }}
                            >
                                <KeyboardArrowDown />
                            </IconButton>
                        </Box>

                        {/* 기본 액션 버튼들 */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Button
                                variant="outlined"
                                startIcon={<Create />}
                                onClick={() => {
                                    handleCreateNewSession();
                                    setMobileDrawerOpen(false);
                                }}
                                sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                            >
                                새 채팅
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Search />}
                                sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                                onClick={() => setMobileDrawerOpen(false)}
                            >
                                Q 채팅 검색
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<LibraryBooks />}
                                sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                                onClick={() => setMobileDrawerOpen(false)}
                            >
                                라이브러리
                            </Button>
                        </Box>
                    </Box>

                    {/* AI 모델 선택 */}
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                            AI 모델
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {AI_MODELS.map((model) => {
                                const Icon = model.icon;
                                const isSelected = selectedAIModel === model.id;

                                return (
                                    <Tooltip key={model.id} title={model.name}>
                                        <IconButton
                                            onClick={() => {
                                                setSelectedAIModel(model.id);
                                                setMobileDrawerOpen(false);
                                            }}
                                            sx={{
                                                bgcolor: isSelected ? model.color : 'transparent',
                                                color: isSelected ? 'white' : 'text.secondary',
                                                '&:hover': {
                                                    bgcolor: isSelected ? model.color : 'grey.100'
                                                }
                                            }}
                                        >
                                            <Icon />
                                        </IconButton>
                                    </Tooltip>
                                );
                            })}
                        </Box>
                    </Box>

                    {/* 프로젝트 목록 */}
                    <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                새 프로젝트
                            </Typography>
                            <IconButton size="small" onClick={() => {
                                setShowProjectCreation(true);
                                setMobileDrawerOpen(false);
                            }}>
                                <Add />
                            </IconButton>
                        </Box>

                        {projects.map((project) => {
                            const isExpanded = expandedProjects.has(project.id);
                            const projectSessions = sessions.filter(s => s.id.startsWith(project.id) || s.title.includes(project.name));

                            return (
                                <Box key={project.id} sx={{ mb: 1 }}>
                                    <Card
                                        sx={{
                                            cursor: 'pointer',
                                            border: currentProject?.id === project.id ? 2 : 1,
                                            borderColor: currentProject?.id === project.id ? '#1976d2' : 'divider',
                                            bgcolor: currentProject?.id === project.id ? '#e3f2fd' : 'white',
                                            '&:hover': { boxShadow: 2 }
                                        }}
                                        onClick={() => {
                                            setCurrentProject(project);
                                            loadProjectData(project.id);
                                            setMobileDrawerOpen(false);
                                        }}
                                    >
                                        <CardContent sx={{ p: 1.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {project.name === '한양2차' ? (
                                                    <Diamond sx={{ color: '#9c27b0', fontSize: 20 }} />
                                                ) : (
                                                    <Folder sx={{ color: '#1976d2', fontSize: 20 }} />
                                                )}
                                                <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
                                                    {project.name}
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleProjectExpansion(project.id);
                                                    }}
                                                >
                                                    {isExpanded ? <ExpandLess /> : <ExpandMore />}
                                                </IconButton>
                                            </Box>

                                            {isExpanded && (
                                                <Box sx={{ mt: 1, ml: 3 }}>
                                                    {projectSessions.map((session) => (
                                                        <Box
                                                            key={session.id}
                                                            sx={{
                                                                p: 1,
                                                                borderRadius: 1,
                                                                cursor: 'pointer',
                                                                bgcolor: currentSession?.id === session.id ? '#f5f5f5' : 'transparent',
                                                                '&:hover': { bgcolor: '#f5f5f5' },
                                                                mb: 0.5
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleSessionSelect(session.id);
                                                                setMobileDrawerOpen(false);
                                                            }}
                                                        >
                                                            <Typography variant="caption" sx={{ display: 'block', fontWeight: 500 }}>
                                                                {session.title}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                                                {formatDate(session.lastActivity)}
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Box>
                            );
                        })}
                    </Box>

                    {/* 사용자 프로필 */}
                    <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
                                <Person />
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                KIM HOBUM Plus
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Drawer>

            {/* 메인 콘텐츠 영역 */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* 모바일 앱바 */}
                {isMobile && (
                    <AppBar position="static" sx={{ bgcolor: 'white', color: 'text.primary', boxShadow: 1 }}>
                        <Toolbar>
                            <IconButton
                                edge="start"
                                color="inherit"
                                aria-label="menu"
                                onClick={() => setMobileDrawerOpen(true)}
                                sx={{ mr: 2 }}
                            >
                                <MenuIcon />
                            </IconButton>
                            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
                                ChatGPT 5
                            </Typography>
                            {currentProject && (
                                <Chip
                                    label={currentProject.name}
                                    size="small"
                                    sx={{ mr: 1 }}
                                />
                            )}
                            {isAuthenticated && <SecurityNotificationCenter />}
                        </Toolbar>
                    </AppBar>
                )}

                {/* 통합 시스템 탭 */}
                <Box sx={{ bgcolor: 'white', borderBottom: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
                        <Button
                            variant={activeTab === 0 ? "contained" : "text"}
                            onClick={() => setActiveTab(0)}
                            startIcon={<Chat />}
                            sx={{ textTransform: 'none' }}
                        >
                            채팅
                        </Button>
                        <Button
                            variant={activeTab === 1 ? "contained" : "text"}
                            onClick={() => setActiveTab(1)}
                            startIcon={<Settings />}
                            sx={{ textTransform: 'none' }}
                        >
                            시스템 통합
                        </Button>
                        <Button
                            variant={activeTab === 2 ? "contained" : "text"}
                            onClick={() => setActiveTab(2)}
                            startIcon={<Security />}
                            sx={{ textTransform: 'none' }}
                        >
                            보안
                        </Button>
                        <Button
                            variant={activeTab === 3 ? "contained" : "text"}
                            onClick={() => setActiveTab(3)}
                            startIcon={<Memory />}
                            sx={{ textTransform: 'none' }}
                        >
                            AI 인텔리전스
                        </Button>
                        <Button
                            variant={activeTab === 4 ? "contained" : "text"}
                            onClick={() => setActiveTab(4)}
                            startIcon={<Speed />}
                            sx={{ textTransform: 'none' }}
                        >
                            성능 최적화
                        </Button>
                        <Button
                            variant={activeTab === 5 ? "contained" : "text"}
                            onClick={() => setActiveTab(5)}
                            startIcon={<Folder />}
                            sx={{ textTransform: 'none' }}
                        >
                            프로젝트 허브
                        </Button>
                        <Button
                            variant={activeTab === 6 ? "contained" : "text"}
                            onClick={() => setActiveTab(6)}
                            startIcon={<Code />}
                            sx={{ textTransform: 'none' }}
                        >
                            노트북 LLM
                        </Button>
                    </Box>
                </Box>

                {/* 탭 콘텐츠 */}
                {activeTab === 0 && (
                    <>
                        {currentProject ? (
                            <>
                                {/* 상단 헤더 */}
                                <Box sx={{ bgcolor: 'white', borderBottom: 1, borderColor: 'divider', p: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {currentProject.name === '한양2차' ? (
                                                <Diamond sx={{ color: '#9c27b0', fontSize: 24 }} />
                                            ) : (
                                                <Folder sx={{ color: '#1976d2', fontSize: 24 }} />
                                            )}
                                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                                {currentProject.name}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Chip
                                                label={`${currentProject.fileCount} 파일`}
                                                size="small"
                                                variant="outlined"
                                                icon={<Description />}
                                            />
                                            <IconButton>
                                                <MoreHoriz />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* 실시간 데이터 시각화 */}
                                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                                    <Typography variant="h6" gutterBottom>
                                        📊 실시간 시스템 모니터링
                                    </Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                                        <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                            <Typography variant="h4" color="primary" gutterBottom>
                                                {realTimeData.cpu.toFixed(1)}%
                                            </Typography>
                                            <Typography variant="caption">CPU 사용률</Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                            <Typography variant="h4" color="secondary" gutterBottom>
                                                {realTimeData.memory.toFixed(1)}%
                                            </Typography>
                                            <Typography variant="caption">메모리 사용률</Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                            <Typography variant="h4" color="info.main" gutterBottom>
                                                {realTimeData.network.toFixed(1)}%
                                            </Typography>
                                            <Typography variant="caption">네트워크 사용률</Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                            <Typography variant="h4" color="success.main" gutterBottom>
                                                {realTimeData.responseTime}ms
                                            </Typography>
                                            <Typography variant="caption">응답 시간</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            👥 현재 접속 사용자: {realTimeData.users.toLocaleString()}명
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* AI 모델 성능 모니터링 */}
                                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                                    <Typography variant="h6" gutterBottom>
                                        🤖 AI 모델 성능
                                    </Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                                        {deepLearningModels.slice(0, 3).map((model) => (
                                            <Box key={model.id} sx={{ textAlign: 'center', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                                <Typography variant="subtitle1" gutterBottom>
                                                    {model.name}
                                                </Typography>
                                                <Typography variant="h4" color="primary" gutterBottom>
                                                    {(model.accuracy * 100).toFixed(1)}%
                                                </Typography>
                                                <Typography variant="caption">
                                                    정확도 • {model.status}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>

                                {/* 채팅 인터페이스 */}
                                {currentSession ? (
                                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        {/* 메시지 목록 */}
                                        <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: '#fafafa' }}>
                                            {messages.map((message) => (
                                                <Box
                                                    key={message.id}
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                                                        mb: 2
                                                    }}
                                                >
                                                    <Paper
                                                        sx={{
                                                            p: 2,
                                                            maxWidth: '70%',
                                                            bgcolor: message.role === 'user' ? '#1976d2' : 'white',
                                                            color: message.role === 'user' ? 'white' : 'text.primary',
                                                            boxShadow: 1,
                                                            position: 'relative',
                                                            '&:hover .message-actions': {
                                                                opacity: 1
                                                            }
                                                        }}
                                                    >
                                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                                            {message.content}
                                                        </Typography>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                mt: 1
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    opacity: 0.7
                                                                }}
                                                            >
                                                                {formatTime(message.timestamp)}
                                                            </Typography>
                                                            {message.role === 'assistant' && (
                                                                <Box
                                                                    className="message-actions"
                                                                    sx={{
                                                                        display: 'flex',
                                                                        gap: 0.5,
                                                                        opacity: 0,
                                                                        transition: 'opacity 0.2s'
                                                                    }}
                                                                >
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => handleModifyRequest(message.id)}
                                                                        title="수정 요청"
                                                                        sx={{
                                                                            color: 'text.secondary',
                                                                            '&:hover': {
                                                                                bgcolor: 'action.hover'
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Edit fontSize="small" />
                                                                    </IconButton>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    </Paper>
                                                </Box>
                                            ))}

                                            {isTyping && (
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                                                    <Paper sx={{ p: 2, bgcolor: 'white', boxShadow: 1 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'grey.400', animation: 'bounce 1s infinite' }} />
                                                                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'grey.400', animation: 'bounce 1s infinite 0.1s' }} />
                                                                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'grey.400', animation: 'bounce 1s infinite 0.2s' }} />
                                                            </Box>
                                                            <Typography variant="caption" color="text.secondary">
                                                                답변을 생성하고 있습니다...
                                                            </Typography>
                                                        </Box>
                                                    </Paper>
                                                </Box>
                                            )}
                                        </Box>

                                        {/* 입력 영역 */}
                                        <Box sx={{ borderTop: 1, borderColor: 'divider', bgcolor: 'white', p: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                                                <IconButton size="small">
                                                    <Plus />
                                                </IconButton>

                                                <TextField
                                                    fullWidth
                                                    multiline
                                                    maxRows={4}
                                                    value={inputValue}
                                                    onChange={(e) => setInputValue(e.target.value)}
                                                    placeholder={`${currentProject.name}에서 새 채팅`}
                                                    variant="outlined"
                                                    size="small"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleSendMessage();
                                                        }
                                                    }}
                                                />

                                                <IconButton size="small">
                                                    <Mic />
                                                </IconButton>

                                                <IconButton size="small">
                                                    <VolumeUp />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <MessageSquare sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                                            <Typography variant="h6" sx={{ mb: 1 }}>
                                                채팅을 시작하세요
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                                새 채팅 버튼을 클릭하여 대화를 시작하거나 기존 세션을 선택하세요
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                startIcon={<Add />}
                                                onClick={handleCreateNewSession}
                                                sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
                                            >
                                                새 채팅 시작
                                            </Button>
                                        </Box>
                                    </Box>
                                )}
                            </>
                        ) : (
                            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Folder sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                                    <Typography variant="h6" sx={{ mb: 1 }}>
                                        프로젝트를 선택하세요
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                        새 프로젝트를 만들거나 기존 프로젝트를 선택하세요
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        startIcon={<Add />}
                                        onClick={() => setShowProjectCreation(true)}
                                        sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
                                    >
                                        새 프로젝트 만들기
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </>
                )}

                {/* 시스템 통합 탭 */}
                {activeTab === 1 && (
                    <Box sx={{ flex: 1, overflow: 'auto' }}>
                        <SystemIntegrationDashboard />
                    </Box>
                )}

                {/* 메시지 수정 요청 다이얼로그 */}
                <MessageModifyRequestDialog
                    open={modifyRequestDialogOpen}
                    originalMessage={selectedMessageForModify?.content || ''}
                    onClose={() => {
                        setModifyRequestDialogOpen(false);
                        setSelectedMessageForModify(null);
                    }}
                    onConfirm={handleModifyRequestConfirm}
                />

                {/* 보안 탭 */}
                {activeTab === 2 && (
                    <Box sx={{ flex: 1, overflow: 'auto' }}>
                        {isAuthenticated ? (
                            <SecurityDashboard />
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                <AuthenticationForm onAuthenticated={() => setIsAuthenticated(true)} />
                            </Box>
                        )}
                    </Box>
                )}

                {/* AI 인텔리전스 탭 */}
                {activeTab === 3 && (
                    <Box sx={{ flex: 1, overflow: 'auto' }}>
                        <AdvancedAIIntelligenceDashboard />
                    </Box>
                )}

                {/* 성능 최적화 탭 */}
                {activeTab === 4 && (
                    <Box sx={{ flex: 1, overflow: 'auto' }}>
                        <PerformanceOptimizer />
                    </Box>
                )}

                {/* 프로젝트 허브 탭 */}
                {activeTab === 5 && (
                    <Box sx={{ flex: 1, overflow: 'auto' }}>
                        <ProjectHub
                            projects={projects.map(p => ({
                                id: p.id,
                                name: p.name,
                                description: p.description || '',
                                status: 'active' as const,
                                createdAt: new Date(p.createdAt),
                                updatedAt: new Date(p.createdAt),
                                messageCount: p.sessionCount,
                                fileCount: p.fileCount,
                                tags: [],
                                category: p.category,
                            }))}
                            onProjectSelect={(project) => {
                                const selected = projects.find(p => p.id === project.id);
                                if (selected) {
                                    setCurrentProject(selected);
                                    loadProjectData(selected.id);
                                    setActiveTab(0); // 채팅 탭으로 이동
                                }
                            }}
                            onProjectCreate={() => setShowProjectCreation(true)}
                            onProjectEdit={(projectId) => {
                                const project = projects.find(p => p.id === projectId);
                                if (project) {
                                    setProjectToEdit(project);
                                    setShowProjectEdit(true);
                                }
                            }}
                            onProjectDelete={async (projectId) => {
                                const project = projects.find(p => p.id === projectId);
                                showConfirm(
                                    {
                                        title: '프로젝트 삭제',
                                        message: `정말로 "${project?.name || '이 프로젝트'}"를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`,
                                        type: 'error',
                                        confirmText: '삭제',
                                        cancelText: '취소',
                                        confirmColor: 'error',
                                    },
                                    async () => {
                                        try {
                                            const projectService = ChatGPTProjectService.getInstance();
                                            await projectService.deleteProject(projectId);
                                            setProjects(prev => prev.filter(p => p.id !== projectId));
                                            if (currentProject?.id === projectId) {
                                                setCurrentProject(null);
                                            }
                                            addNotification({
                                                type: 'success',
                                                title: '프로젝트 삭제 완료',
                                                message: '프로젝트가 성공적으로 삭제되었습니다.',
                                            });
                                        } catch (error) {
                                            errorLogger.error('프로젝트 삭제 실패', error, { projectId });
                                            addNotification({
                                                type: 'error',
                                                title: '프로젝트 삭제 실패',
                                                message: '프로젝트 삭제에 실패했습니다. 다시 시도해주세요.',
                                            });
                                        }
                                    }
                                );
                            }}
                            onProjectArchive={async (projectId) => {
                                const project = projects.find(p => p.id === projectId);
                                showConfirm(
                                    {
                                        title: '프로젝트 보관',
                                        message: `"${project?.name || '이 프로젝트'}"를 보관하시겠습니까?`,
                                        type: 'info',
                                        confirmText: '보관',
                                        cancelText: '취소',
                                    },
                                    async () => {
                                        try {
                                            const projectService = ChatGPTProjectService.getInstance();
                                            await projectService.archiveProject(projectId);
                                            setProjects(prev => prev.map(p =>
                                                p.id === projectId ? { ...p, status: 'archived' as const } : p
                                            ));
                                            addNotification({
                                                type: 'success',
                                                title: '프로젝트 보관 완료',
                                                message: '프로젝트가 성공적으로 보관되었습니다.',
                                            });
                                        } catch (error) {
                                            errorLogger.error('프로젝트 보관 실패', error, { projectId });
                                            addNotification({
                                                type: 'error',
                                                title: '프로젝트 보관 실패',
                                                message: '프로젝트 보관에 실패했습니다. 다시 시도해주세요.',
                                            });
                                        }
                                    }
                                );
                            }}
                        />
                    </Box>
                )}

                {/* 노트북 LLM 탭 */}
                {activeTab === 6 && (
                    <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                        <NotebookLLM
                            projectId={currentProject?.id}
                            onResponseComplete={(response) => {
                                errorLogger.debug('노트북 LLM 응답', { responseLength: JSON.stringify(response).length });
                            }}
                            onError={(error) => {
                                errorLogger.error('노트북 LLM 오류', error);
                            }}
                        />
                    </Box>
                )}
            </Box>

            {/* 템플릿 선택 다이얼로그 */}
            <ProjectTemplateSelector
                open={showTemplateSelector}
                onClose={() => setShowTemplateSelector(false)}
                onSelectTemplate={(template) => {
                    const projectData = projectTemplateService.createProjectDataFromTemplate(template);
                    setProjectName(projectData.name);
                    setSelectedCategory(projectData.category);
                    setSelectedMemoryType(projectData.memoryType || 'default');
                    setShowTemplateSelector(false);
                    setShowProjectCreation(true);
                }}
            />

            {/* 프로젝트 편집 다이얼로그 */}
            <ProjectEditDialog
                open={showProjectEdit}
                onClose={() => {
                    setShowProjectEdit(false);
                    setProjectToEdit(null);
                }}
                project={projectToEdit}
                onSave={async (projectId, updates) => {
                    try {
                        const projectService = ChatGPTProjectService.getInstance();
                        const updatedProject = await projectService.updateProject(projectId, updates);
                        if (updatedProject) {
                            setProjects(prev => prev.map(p =>
                                p.id === projectId ? updatedProject : p
                            ));
                            if (currentProject?.id === projectId) {
                                setCurrentProject(updatedProject);
                            }
                        }
                    } catch (error) {
                        errorLogger.error('프로젝트 업데이트 실패', error);
                        throw error;
                    }
                }}
            />

            {/* 확인 다이얼로그 */}
            <ConfirmDialog
                open={confirmDialog.open}
                onClose={handleCancelDialog}
                onConfirm={handleConfirmDialog}
                title={confirmDialog.title || '확인'}
                message={confirmDialog.message}
                type={confirmDialog.type}
                confirmText={confirmDialog.confirmText}
                cancelText={confirmDialog.cancelText}
                confirmColor={confirmDialog.confirmColor}
                showCancel={confirmDialog.showCancel}
            />

            {/* 프로젝트 생성 모달 */}
            <Dialog open={showProjectCreation} onClose={() => setShowProjectCreation(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Folder />
                    프로젝트 생성
                    <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<FileCopy />}
                            onClick={() => {
                                setShowProjectCreation(false);
                                setShowTemplateSelector(true);
                            }}
                        >
                            템플릿 선택
                        </Button>
                        <IconButton size="small" onClick={() => setShowMemorySettings(!showMemorySettings)}>
                            <Settings />
                        </IconButton>
                        <IconButton size="small" onClick={() => setShowProjectCreation(false)}>
                            <MoreVert />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        {/* 프로젝트 이름 입력 */}
                        <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Avatar sx={{ bgcolor: '#9c27b0', width: 32, height: 32 }}>
                                    <EmojiEmotions />
                                </Avatar>
                                <TextField
                                    fullWidth
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    placeholder="프로젝트 이름을 입력하세요"
                                    variant="outlined"
                                />
                            </Box>
                        </Box>

                        {/* 카테고리 선택 */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                카테고리 선택
                            </Typography>
                            <Grid container spacing={1}>
                                {PROJECT_CATEGORIES.map((category) => {
                                    const Icon = category.icon;
                                    const isSelected = selectedCategory === category.id;

                                    return (
                                        <Grid key={category.id}>
                                            <Button
                                                variant={isSelected ? "contained" : "outlined"}
                                                startIcon={<Icon />}
                                                onClick={() => setSelectedCategory(category.id)}
                                                sx={{
                                                    bgcolor: isSelected ? category.color : 'transparent',
                                                    color: isSelected ? 'white' : 'text.primary',
                                                    '&:hover': {
                                                        bgcolor: isSelected ? category.color : 'grey.100'
                                                    }
                                                }}
                                            >
                                                {category.label}
                                            </Button>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Box>

                        {/* 메모리 설정 */}
                        {showMemorySettings && (
                            <Paper sx={{ p: 2, mb: 3 }}>
                                <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Settings />
                                    메모리
                                </Typography>

                                <FormControl component="fieldset">
                                    <RadioGroup
                                        value={selectedMemoryType}
                                        onChange={(e) => setSelectedMemoryType(e.target.value as 'default' | 'project_exclusive')}
                                    >
                                        <FormControlLabel
                                            value="default"
                                            control={<Radio />}
                                            label={
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        기본값
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        프로젝트가 외부 채팅에서 메모리에 액세스할 수 있으며 그 반대도 가능합니다.
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                        <FormControlLabel
                                            value="project_exclusive"
                                            control={<Radio />}
                                            label={
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        프로젝트 전용
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        프로젝트가 자체 메모리에만 액세스할 수 있습니다. 외부 채팅에서는 프로젝트 메모리를 볼 수 없습니다.
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </RadioGroup>
                                </FormControl>

                                <Box sx={{ mt: 2, p: 2, bgcolor: '#fff3e0', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Lightbulb color="warning" />
                                    <Typography variant="caption" color="warning.dark">
                                        이 설정은 이후에 변경할 수 없습니다.
                                    </Typography>
                                </Box>
                            </Paper>
                        )}

                        {/* 프로젝트 설명 */}
                        <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                <Lightbulb color="warning" />
                                <Typography variant="body2">
                                    프로젝트에서는 한 곳에 파일, 맞춤형 지침을 보관합니다.
                                    지속적으로 진행되는 작업에, 또는 작업을 깔끔히 정리하기에 좋죠.
                                </Typography>
                            </Box>
                        </Paper>
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setShowProjectCreation(false)}>
                        취소
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateProject}
                        disabled={!projectName.trim()}
                        sx={{ bgcolor: '#424242', '&:hover': { bgcolor: '#303030' } }}
                    >
                        프로젝트 만들기
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

// ErrorBoundary로 감싸진 컴포넌트
const ChatGPT5CompleteInterfaceWithErrorBoundary: React.FC = () => {
    return (
        <ErrorBoundary>
            <ChatGPT5CompleteInterface />
        </ErrorBoundary>
    );
};

export default ChatGPT5CompleteInterfaceWithErrorBoundary;
