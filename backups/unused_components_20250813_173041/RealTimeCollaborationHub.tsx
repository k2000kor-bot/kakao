import React, { useState, useEffect } from 'react';
import {
    UserGroupIcon,
    ChatBubbleLeftRightIcon,
    DocumentTextIcon,
    ShareIcon,
    BellIcon,
    VideoCameraIcon,
    MicrophoneIcon,
    PhoneIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface TeamMember {
    id: string;
    name: string;
    role: string;
    status: 'online' | 'offline' | 'busy' | 'away';
    avatar: string;
    lastActive: string;
    currentTask?: string;
}

interface CollaborationSession {
    id: string;
    title: string;
    participants: string[];
    type: 'meeting' | 'document' | 'discussion' | 'review';
    status: 'active' | 'scheduled' | 'completed';
    startTime: string;
    duration?: string;
    priority: 'low' | 'medium' | 'high';
}

interface Notification {
    id: string;
    type: 'mention' | 'invitation' | 'update' | 'reminder';
    message: string;
    from: string;
    timestamp: string;
    read: boolean;
}

const RealTimeCollaborationHub: React.FC = () => {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
        {
            id: '1',
            name: '김조합장',
            role: '조합장',
            status: 'online',
            avatar: '👨‍💼',
            lastActive: '방금 전',
            currentTask: '재건축 계획 검토'
        },
        {
            id: '2',
            name: '이설계사',
            role: '설계사무소',
            status: 'busy',
            avatar: '👩‍🔬',
            lastActive: '5분 전',
            currentTask: '설계도면 수정'
        },
        {
            id: '3',
            name: '박시공사',
            role: '시공업체',
            status: 'online',
            avatar: '👷‍♂️',
            lastActive: '2분 전'
        },
        {
            id: '4',
            name: '최컨설턴트',
            role: '재건축 컨설턴트',
            status: 'away',
            avatar: '👩‍💻',
            lastActive: '1시간 전'
        }
    ]);

    const [sessions, setSessions] = useState<CollaborationSession[]>([
        {
            id: '1',
            title: '시공사 선정 회의',
            participants: ['1', '2', '3'],
            type: 'meeting',
            status: 'active',
            startTime: '14:00',
            duration: '1시간 30분',
            priority: 'high'
        },
        {
            id: '2',
            title: '설계도면 검토',
            participants: ['1', '2'],
            type: 'document',
            status: 'scheduled',
            startTime: '16:00',
            priority: 'medium'
        }
    ]);

    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            type: 'mention',
            message: '김조합장님이 회의실에서 언급하셨습니다.',
            from: '김조합장',
            timestamp: '2분 전',
            read: false
        },
        {
            id: '2',
            type: 'invitation',
            message: '새로운 협업 세션에 초대되었습니다.',
            from: '이설계사',
            timestamp: '5분 전',
            read: false
        }
    ]);

    const [activeTab, setActiveTab] = useState<'team' | 'sessions' | 'chat' | 'documents'>('team');

    // 상태 색상 반환
    const getStatusColor = (status: string) => {
        const colors = {
            online: 'bg-green-500',
            offline: 'bg-gray-400',
            busy: 'bg-red-500',
            away: 'bg-yellow-500'
        };
        return colors[status as keyof typeof colors] || 'bg-gray-400';
    };

    // 우선순위 색상 반환
    const getPriorityColor = (priority: string) => {
        const colors = {
            high: 'text-red-600 bg-red-100',
            medium: 'text-yellow-600 bg-yellow-100',
            low: 'text-green-600 bg-green-100'
        };
        return colors[priority as keyof typeof colors] || 'text-gray-600 bg-gray-100';
    };

    // 알림 읽음 처리
    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">실시간 협업 허브</h1>
                    <p className="text-gray-600">팀원들과 실시간으로 소통하고 협업하세요</p>
                </div>
                <div className="flex items-center space-x-4">
                    <button className="relative p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors">
                        <BellIcon className="h-6 w-6" />
                        {notifications.filter(n => !n.read).length > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                {notifications.filter(n => !n.read).length}
                            </span>
                        )}
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all">
                        새 세션 시작
                    </button>
                </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                    {[
                        { id: 'team', name: '팀원', icon: UserGroupIcon },
                        { id: 'sessions', name: '협업 세션', icon: VideoCameraIcon },
                        { id: 'chat', name: '실시간 채팅', icon: ChatBubbleLeftRightIcon },
                        { id: 'documents', name: '공유 문서', icon: DocumentTextIcon }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span>{tab.name}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* 콘텐츠 영역 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 메인 콘텐츠 */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'team' && (
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">팀원 현황</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {teamMembers.map((member) => (
                                    <div key={member.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="relative">
                                            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-lg">
                                                {member.avatar}
                                            </div>
                                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(member.status)}`}></div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{member.name}</h3>
                                            <p className="text-sm text-gray-600">{member.role}</p>
                                            {member.currentTask && (
                                                <p className="text-xs text-blue-600 mt-1">📋 {member.currentTask}</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">{member.lastActive}</p>
                                            <div className="flex space-x-1 mt-2">
                                                <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                                                    <ChatBubbleLeftRightIcon className="h-4 w-4" />
                                                </button>
                                                <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                                                    <PhoneIcon className="h-4 w-4" />
                                                </button>
                                                <button className="p-1 text-gray-400 hover:text-purple-600 transition-colors">
                                                    <VideoCameraIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'sessions' && (
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">협업 세션</h2>
                            <div className="space-y-4">
                                {sessions.map((session) => (
                                    <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold text-gray-900">{session.title}</h3>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(session.priority)}`}>
                                                    {session.priority === 'high' ? '높음' : session.priority === 'medium' ? '보통' : '낮음'}
                                                </span>
                                                <span className={`flex items-center space-x-1 text-sm ${session.status === 'active' ? 'text-green-600' :
                                                        session.status === 'scheduled' ? 'text-blue-600' : 'text-gray-600'
                                                    }`}>
                                                    {session.status === 'active' && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
                                                    <span>{session.status === 'active' ? '진행 중' : session.status === 'scheduled' ? '예정됨' : '완료됨'}</span>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-gray-600">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-1">
                                                    <ClockIcon className="h-4 w-4" />
                                                    <span>{session.startTime} {session.duration && `(${session.duration})`}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <UserGroupIcon className="h-4 w-4" />
                                                    <span>{session.participants.length}명 참여</span>
                                                </div>
                                            </div>

                                            <div className="flex space-x-2">
                                                {session.status === 'active' && (
                                                    <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors">
                                                        참여하기
                                                    </button>
                                                )}
                                                {session.status === 'scheduled' && (
                                                    <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors">
                                                        미리보기
                                                    </button>
                                                )}
                                                <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                                                    <ShareIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'chat' && (
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">실시간 채팅</h2>
                            <div className="h-96 border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <div className="text-center text-gray-500 py-20">
                                    <ChatBubbleLeftRightIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                    <p>실시간 채팅 기능이 곧 출시됩니다!</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">공유 문서</h2>
                            <div className="text-center text-gray-500 py-20">
                                <DocumentTextIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                <p>공유 문서 기능이 곧 출시됩니다!</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* 사이드바 */}
                <div className="space-y-6">
                    {/* 알림 */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">알림</h3>
                        <div className="space-y-3">
                            {notifications.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-4">새로운 알림이 없습니다</p>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-3 rounded-lg cursor-pointer transition-colors ${notification.read ? 'bg-gray-50' : 'bg-blue-50 border border-blue-200'
                                            }`}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-900">{notification.message}</p>
                                                <p className="text-xs text-gray-500 mt-1">{notification.from} • {notification.timestamp}</p>
                                            </div>
                                            {!notification.read && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* 빠른 액션 */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">빠른 액션</h3>
                        <div className="space-y-3">
                            <button className="w-full flex items-center space-x-3 p-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
                                <VideoCameraIcon className="h-5 w-5" />
                                <span>즉석 회의 시작</span>
                            </button>
                            <button className="w-full flex items-center space-x-3 p-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                                <DocumentTextIcon className="h-5 w-5" />
                                <span>문서 공유</span>
                            </button>
                            <button className="w-full flex items-center space-x-3 p-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                                <UserGroupIcon className="h-5 w-5" />
                                <span>팀원 초대</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RealTimeCollaborationHub; 