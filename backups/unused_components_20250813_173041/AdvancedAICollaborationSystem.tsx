import React, { useState, useEffect } from 'react';
import {
    StarIcon,
    UsersIcon,
    ChatBubbleLeftRightIcon,
    ShieldCheckIcon,
    ChartBarIcon,
    EyeIcon,
    FireIcon,
    BoltIcon,
    RocketLaunchIcon,
    AcademicCapIcon,
    MagnifyingGlassIcon,
    CogIcon,
    ArrowPathIcon,
    PlayIcon,
    PauseIcon,
    StopIcon,
    PlusIcon,
    MinusIcon,
    InformationCircleIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    UserIcon,
    ServerIcon,
    CloudIcon,
    Bars3Icon,
    Squares2X2Icon,
    ViewColumnsIcon,
    ArrowsPointingOutIcon,
    ArrowsPointingInIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    Cog6ToothIcon,
    WrenchScrewdriverIcon,
    HeartIcon,
    LightBulbIcon,
    BookOpenIcon,
    TrophyIcon,
    CalendarIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    SignalIcon,
    WifiIcon,
    DevicePhoneMobileIcon,
    ComputerDesktopIcon,
    ChartPieIcon,
    PresentationChartLineIcon,
    TableCellsIcon,
    CubeIcon,
    CubeTransparentIcon,
    SwatchIcon,
    PaintBrushIcon,
    AdjustmentsHorizontalIcon,
    FunnelIcon,
    RectangleStackIcon,
    CircleStackIcon,
    QueueListIcon,
    ListBulletIcon,
    Bars4Icon,
    Bars3BottomLeftIcon,
    Bars3BottomRightIcon,
    Bars3CenterLeftIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    UserGroupIcon,
    UserPlusIcon,
    UserMinusIcon,
    ChatBubbleBottomCenterTextIcon,
    ChatBubbleLeftEllipsisIcon,
    ChatBubbleOvalLeftEllipsisIcon,
    ChatBubbleOvalLeftIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';

interface Collaborator {
    id: string;
    name: string;
    avatar: string;
    role: 'admin' | 'moderator' | 'user' | 'viewer';
    status: 'online' | 'away' | 'busy' | 'offline';
    currentActivity: string;
    lastSeen: string;
    permissions: string[];
}

interface CollaborationSession {
    id: string;
    name: string;
    description: string;
    type: 'ai-learning' | 'data-visualization' | 'ai-prediction' | 'security-monitoring' | 'message-workflow';
    status: 'active' | 'paused' | 'completed' | 'archived';
    participants: string[];
    createdAt: string;
    lastActivity: string;
    settings: {
        allowChat: boolean;
        allowScreenShare: boolean;
        allowFileShare: boolean;
        recordingEnabled: boolean;
    };
}

interface ChatMessage {
    id: string;
    userId: string;
    userName: string;
    message: string;
    timestamp: string;
    type: 'text' | 'system' | 'ai' | 'file' | 'command';
    attachments?: string[];
}

interface SharedResource {
    id: string;
    name: string;
    type: 'ai-model' | 'dataset' | 'visualization' | 'prediction' | 'security-report';
    owner: string;
    sharedWith: string[];
    permissions: 'read' | 'write' | 'admin';
    lastModified: string;
    size: string;
}

interface AdvancedAICollaborationSystemProps {
    isActive: boolean;
    onToggle: () => void;
}

const AdvancedAICollaborationSystem: React.FC<AdvancedAICollaborationSystemProps> = ({
    isActive,
    onToggle
}) => {
    const [collaborators, setCollaborators] = useState<Collaborator[]>([
        {
            id: 'user-1',
            name: '김철수',
            avatar: '👨‍💼',
            role: 'admin',
            status: 'online',
            currentActivity: 'AI 학습 모델 분석 중',
            lastSeen: '방금 전',
            permissions: ['read', 'write', 'admin', 'invite']
        },
        {
            id: 'user-2',
            name: '이영희',
            avatar: '👩‍💻',
            role: 'moderator',
            status: 'online',
            currentActivity: '데이터 시각화 작업 중',
            lastSeen: '1분 전',
            permissions: ['read', 'write', 'moderate']
        },
        {
            id: 'user-3',
            name: '박민수',
            avatar: '👨‍🔬',
            role: 'user',
            status: 'busy',
            currentActivity: 'AI 예측 모델 테스트 중',
            lastSeen: '5분 전',
            permissions: ['read', 'write']
        },
        {
            id: 'user-4',
            name: '최지영',
            avatar: '👩‍🎨',
            role: 'user',
            status: 'away',
            currentActivity: '보안 모니터링 확인 중',
            lastSeen: '10분 전',
            permissions: ['read']
        },
        {
            id: 'user-5',
            name: '정현우',
            avatar: '👨‍💻',
            role: 'viewer',
            status: 'offline',
            currentActivity: '오프라인',
            lastSeen: '1시간 전',
            permissions: ['read']
        }
    ]);

    const [collaborationSessions, setCollaborationSessions] = useState<CollaborationSession[]>([
        {
            id: 'session-1',
            name: 'AI 모델 최적화 세션',
            description: '신경망 모델 성능 최적화를 위한 협업 세션',
            type: 'ai-learning',
            status: 'active',
            participants: ['user-1', 'user-2', 'user-3'],
            createdAt: '2시간 전',
            lastActivity: '5분 전',
            settings: {
                allowChat: true,
                allowScreenShare: true,
                allowFileShare: true,
                recordingEnabled: false
            }
        },
        {
            id: 'session-2',
            name: '데이터 분석 워크샵',
            description: '실시간 데이터 시각화 및 분석 워크샵',
            type: 'data-visualization',
            status: 'active',
            participants: ['user-2', 'user-4'],
            createdAt: '1시간 전',
            lastActivity: '2분 전',
            settings: {
                allowChat: true,
                allowScreenShare: true,
                allowFileShare: false,
                recordingEnabled: true
            }
        },
        {
            id: 'session-3',
            name: '보안 감사 세션',
            description: '시스템 보안 상태 점검 및 위협 분석',
            type: 'security-monitoring',
            status: 'paused',
            participants: ['user-1', 'user-4'],
            createdAt: '30분 전',
            lastActivity: '15분 전',
            settings: {
                allowChat: true,
                allowScreenShare: false,
                allowFileShare: true,
                recordingEnabled: true
            }
        }
    ]);

    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        {
            id: 'msg-1',
            userId: 'user-1',
            userName: '김철수',
            message: '안녕하세요! AI 모델 성능 분석을 시작하겠습니다.',
            timestamp: '2분 전',
            type: 'text'
        },
        {
            id: 'msg-2',
            userId: 'user-2',
            userName: '이영희',
            message: '네, 데이터 시각화 결과를 공유해드리겠습니다.',
            timestamp: '1분 전',
            type: 'text'
        },
        {
            id: 'msg-3',
            userId: 'system',
            userName: '시스템',
            message: 'AI 모델 학습이 시작되었습니다.',
            timestamp: '30초 전',
            type: 'system'
        },
        {
            id: 'msg-4',
            userId: 'ai-assistant',
            userName: 'AI 어시스턴트',
            message: '모델 성능이 예상보다 15% 향상되었습니다.',
            timestamp: '방금 전',
            type: 'ai'
        }
    ]);

    const [sharedResources, setSharedResources] = useState<SharedResource[]>([
        {
            id: 'resource-1',
            name: 'Neural Network v1.0',
            type: 'ai-model',
            owner: 'user-1',
            sharedWith: ['user-2', 'user-3'],
            permissions: 'write',
            lastModified: '10분 전',
            size: '2.3GB'
        },
        {
            id: 'resource-2',
            name: '사용자 행동 데이터셋',
            type: 'dataset',
            owner: 'user-2',
            sharedWith: ['user-1', 'user-4'],
            permissions: 'read',
            lastModified: '1시간 전',
            size: '1.7GB'
        },
        {
            id: 'resource-3',
            name: '성능 분석 차트',
            type: 'visualization',
            owner: 'user-3',
            sharedWith: ['user-1', 'user-2'],
            permissions: 'write',
            lastModified: '5분 전',
            size: '45MB'
        }
    ]);

    const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'collaborators' | 'chat' | 'resources' | 'settings'>('overview');
    const [selectedSession, setSelectedSession] = useState<string>('');
    const [newMessage, setNewMessage] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    useEffect(() => {
        // 실시간 협업 상태 업데이트 시뮬레이션
        const interval = setInterval(() => {
            setCollaborators(prev => prev.map(collaborator => ({
                ...collaborator,
                lastSeen: collaborator.status === 'online' ? '방금 전' : collaborator.lastSeen,
                currentActivity: collaborator.status === 'online' ?
                    ['AI 모델 분석 중', '데이터 시각화 작업 중', '보안 모니터링 중', '예측 모델 테스트 중'][Math.floor(Math.random() * 4)] :
                    collaborator.currentActivity
            })));
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'away': return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'busy': return 'text-red-600 bg-red-50 border-red-200';
            case 'offline': return 'text-gray-600 bg-gray-50 border-gray-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'text-purple-600 bg-purple-50 border-purple-200';
            case 'moderator': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'user': return 'text-green-600 bg-green-50 border-green-200';
            case 'viewer': return 'text-gray-600 bg-gray-50 border-gray-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getSessionTypeIcon = (type: string) => {
        switch (type) {
            case 'ai-learning': return <AcademicCapIcon className="w-4 h-4" />;
            case 'data-visualization': return <ChartBarIcon className="w-4 h-4" />;
            case 'ai-prediction': return <CpuChipIcon className="w-4 h-4" />;
            case 'security-monitoring': return <ShieldCheckIcon className="w-4 h-4" />;
            case 'message-workflow': return <ChatBubbleLeftRightIcon className="w-4 h-4" />;
            default: return <CpuChipIcon className="w-4 h-4" />;
        }
    };

    const getResourceTypeIcon = (type: string) => {
        switch (type) {
            case 'ai-model': return <CpuChipIcon className="w-4 h-4" />;
            case 'dataset': return <ChartBarIcon className="w-4 h-4" />;
            case 'visualization': return <EyeIcon className="w-4 h-4" />;
            case 'prediction': return <StarIcon className="w-4 h-4" />;
            case 'security-report': return <ShieldCheckIcon className="w-4 h-4" />;
            default: return <ChartBarIcon className="w-4 h-4" />;
        }
    };

    const sendMessage = () => {
        if (!newMessage.trim()) return;

        const message: ChatMessage = {
            id: `msg-${Date.now()}`,
            userId: 'user-1', // 현재 사용자
            userName: '김철수',
            message: newMessage,
            timestamp: '방금 전',
            type: 'text'
        };

        setChatMessages(prev => [...prev, message]);
        setNewMessage('');
    };

    const startRecording = () => {
        setIsRecording(true);
        const recordingMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            userId: 'system',
            userName: '시스템',
            message: '세션 녹화가 시작되었습니다.',
            timestamp: '방금 전',
            type: 'system'
        };
        setChatMessages(prev => [...prev, recordingMessage]);
    };

    const stopRecording = () => {
        setIsRecording(false);
        const recordingMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            userId: 'system',
            userName: '시스템',
            message: '세션 녹화가 중지되었습니다.',
            timestamp: '방금 전',
            type: 'system'
        };
        setChatMessages(prev => [...prev, recordingMessage]);
    };

    if (!isActive) {
        return (
            <div className="absolute bottom-4 right-4 z-50">
                <button
                    onClick={onToggle}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2"
                >
                    <UsersIcon className="w-5 h-5" />
                    <span>AI 협업 시스템</span>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-7xl h-5/6 overflow-hidden">
                {/* 헤더 */}
                <div className="bg-gray-900 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-800 rounded-lg">
                                <UsersIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">고도화된 AI 실시간 협업 시스템</h3>
                                <p className="text-gray-400 text-sm">다중 사용자 AI 시스템 협업 및 실시간 통신</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-sm">{collaborators.filter(c => c.status === 'online').length}명 온라인</span>
                            </div>
                            <button
                                onClick={onToggle}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 탭 네비게이션 */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                    {[
                        { id: 'overview', label: '개요', icon: Squares2X2Icon },
                        { id: 'sessions', label: '세션', icon: ChatBubbleLeftRightIcon },
                        { id: 'collaborators', label: '협업자', icon: UserGroupIcon },
                        { id: 'chat', label: '채팅', icon: ChatBubbleLeftRightIcon },
                        { id: 'resources', label: '리소스', icon: ChartBarIcon },
                        { id: 'settings', label: '설정', icon: CogIcon }
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id as any)}
                            className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${activeTab === id
                                ? 'text-gray-900 border-b-2 border-gray-900 bg-white'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>

                {/* 컨텐츠 영역 */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* 협업 통계 */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-emerald-100 rounded-lg">
                                            <UsersIcon className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <span className="text-2xl font-bold text-gray-900">{collaborators.length}</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">총 협업자</p>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <span className="text-2xl font-bold text-gray-900">{collaborationSessions.length}</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">활성 세션</p>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <ChartBarIcon className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <span className="text-2xl font-bold text-gray-900">{sharedResources.length}</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">공유 리소스</p>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-orange-100 rounded-lg">
                                            <ChatBubbleLeftRightIcon className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <span className="text-2xl font-bold text-gray-900">{chatMessages.length}</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">총 메시지</p>
                                </div>
                            </div>

                            {/* 실시간 활동 */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">실시간 활동</h4>
                                    <div className="space-y-3">
                                        {collaborators.filter(c => c.status === 'online').slice(0, 3).map(collaborator => (
                                            <div key={collaborator.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-2xl">{collaborator.avatar}</span>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{collaborator.name}</p>
                                                        <p className="text-sm text-gray-600">{collaborator.currentActivity}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(collaborator.status)}`}>
                                                    {collaborator.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">최근 세션</h4>
                                    <div className="space-y-3">
                                        {collaborationSessions.slice(0, 3).map(session => (
                                            <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <div className="flex items-center space-x-3">
                                                    {getSessionTypeIcon(session.type)}
                                                    <div>
                                                        <p className="font-medium text-gray-900">{session.name}</p>
                                                        <p className="text-sm text-gray-600">{session.participants.length}명 참여</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${session.status === 'active' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
                                                    session.status === 'paused' ? 'text-amber-600 bg-amber-50 border-amber-200' :
                                                        'text-gray-600 bg-gray-50 border-gray-200'
                                                    }`}>
                                                    {session.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sessions' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-semibold text-gray-900">협업 세션</h4>
                                    <button className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                                        새 세션 생성
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {collaborationSessions.map(session => (
                                        <div key={session.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    {getSessionTypeIcon(session.type)}
                                                    <div>
                                                        <h5 className="font-semibold text-gray-900">{session.name}</h5>
                                                        <p className="text-sm text-gray-500">{session.description}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${session.status === 'active' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
                                                    session.status === 'paused' ? 'text-amber-600 bg-amber-50 border-amber-200' :
                                                        'text-gray-600 bg-gray-50 border-gray-200'
                                                    }`}>
                                                    {session.status}
                                                </span>
                                            </div>

                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">참여자:</span>
                                                    <span className="font-semibold text-gray-900">{session.participants.length}명</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">생성:</span>
                                                    <span className="font-semibold text-gray-900">{session.createdAt}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">마지막 활동:</span>
                                                    <span className="font-semibold text-gray-900">{session.lastActivity}</span>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex space-x-2">
                                                <button className="flex-1 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors">
                                                    참여
                                                </button>
                                                <button className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors">
                                                    설정
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'collaborators' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">협업자 관리</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {collaborators.map(collaborator => (
                                        <div key={collaborator.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-2xl">{collaborator.avatar}</span>
                                                    <div>
                                                        <h5 className="font-semibold text-gray-900">{collaborator.name}</h5>
                                                        <p className="text-sm text-gray-500">{collaborator.currentActivity}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(collaborator.status)}`}>
                                                        {collaborator.status}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(collaborator.role)} ml-1`}>
                                                        {collaborator.role}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">마지막 활동:</span>
                                                    <span className="font-semibold text-gray-900">{collaborator.lastSeen}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">권한:</span>
                                                    <span className="font-semibold text-gray-900">{collaborator.permissions.length}개</span>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex space-x-2">
                                                <button className="flex-1 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors">
                                                    메시지
                                                </button>
                                                <button className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors">
                                                    프로필
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'chat' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-semibold text-gray-900">실시간 채팅</h4>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={isRecording ? stopRecording : startRecording}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isRecording
                                                ? 'bg-red-600 text-white'
                                                : 'bg-gray-200 text-gray-700'
                                                }`}
                                        >
                                            {isRecording ? '녹화 중지' : '녹화 시작'}
                                        </button>
                                        <button
                                            onClick={() => setIsScreenSharing(!isScreenSharing)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isScreenSharing
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-700'
                                                }`}
                                        >
                                            {isScreenSharing ? '화면 공유 중지' : '화면 공유'}
                                        </button>
                                    </div>
                                </div>

                                <div className="h-96 bg-gray-50 rounded-lg p-4 overflow-y-auto mb-4">
                                    <div className="space-y-3">
                                        {chatMessages.map(message => (
                                            <div key={message.id} className={`flex items-start space-x-3 ${message.type === 'system' ? 'justify-center' :
                                                message.type === 'ai' ? 'justify-start' : 'justify-start'
                                                }`}>
                                                {message.type !== 'system' && (
                                                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                                                        {message.userName.charAt(0)}
                                                    </div>
                                                )}
                                                <div className={`flex-1 ${message.type === 'system' ? 'text-center' : ''
                                                    }`}>
                                                    <div className={`p-3 rounded-lg ${message.type === 'system' ? 'bg-gray-200 text-gray-700' :
                                                        message.type === 'ai' ? 'bg-blue-100 text-blue-900' :
                                                            'bg-white border border-gray-200'
                                                        }`}>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="font-medium text-sm">{message.userName}</span>
                                                            <span className="text-xs text-gray-500">{message.timestamp}</span>
                                                        </div>
                                                        <p className="text-sm">{message.message}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                        placeholder="메시지를 입력하세요..."
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    />
                                    <button
                                        onClick={sendMessage}
                                        className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                                    >
                                        전송
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'resources' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">공유 리소스</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {sharedResources.map(resource => (
                                        <div key={resource.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    {getResourceTypeIcon(resource.type)}
                                                    <div>
                                                        <h5 className="font-semibold text-gray-900">{resource.name}</h5>
                                                        <p className="text-sm text-gray-500">{resource.type}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${resource.permissions === 'admin' ? 'text-purple-600 bg-purple-50 border-purple-200' :
                                                    resource.permissions === 'write' ? 'text-blue-600 bg-blue-50 border-blue-200' :
                                                        'text-gray-600 bg-gray-50 border-gray-200'
                                                    }`}>
                                                    {resource.permissions}
                                                </span>
                                            </div>

                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">소유자:</span>
                                                    <span className="font-semibold text-gray-900">{resource.owner}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">크기:</span>
                                                    <span className="font-semibold text-gray-900">{resource.size}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">수정:</span>
                                                    <span className="font-semibold text-gray-900">{resource.lastModified}</span>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex space-x-2">
                                                <button className="flex-1 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors">
                                                    열기
                                                </button>
                                                <button className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors">
                                                    공유
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">협업 설정</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">실시간 알림</h5>
                                            <p className="text-sm text-gray-600">새 메시지 및 활동 알림</p>
                                        </div>
                                        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium">
                                            활성화
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">자동 녹화</h5>
                                            <p className="text-sm text-gray-600">세션 자동 녹화 기능</p>
                                        </div>
                                        <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm font-medium">
                                            비활성화
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">화면 공유</h5>
                                            <p className="text-sm text-gray-600">화면 공유 권한 관리</p>
                                        </div>
                                        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium">
                                            활성화
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdvancedAICollaborationSystem; 