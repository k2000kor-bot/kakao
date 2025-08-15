import React, { useState, useEffect } from 'react';
import {
    UserGroupIcon,
    ChatBubbleLeftRightIcon,
    DocumentTextIcon,
    ClockIcon,
    EyeIcon,
    StarIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    PlusIcon,
    TrashIcon,
    PencilIcon,
    BellIcon,
    UsersIcon,
    GlobeAltIcon,
    DevicePhoneMobileIcon,
    ComputerDesktopIcon
} from '@heroicons/react/24/outline';

interface CollaborationMember {
    id: string;
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'editor' | 'viewer';
    avatar: string;
    lastActive: Date;
    status: 'online' | 'offline' | 'away';
}

interface CollaborationActivity {
    id: string;
    type: 'file_upload' | 'comment' | 'edit' | 'share' | 'delete';
    user: string;
    description: string;
    timestamp: Date;
    fileId?: string;
}

interface ProjectCollaborationProps {
    projectId: string;
    projectName: string;
}

const ProjectCollaboration: React.FC<ProjectCollaborationProps> = ({
    projectId,
    projectName
}) => {
    const [members, setMembers] = useState<CollaborationMember[]>([
        {
            id: '1',
            name: '김철수',
            email: 'kim@example.com',
            role: 'owner',
            avatar: 'https://via.placeholder.com/40',
            lastActive: new Date(),
            status: 'online'
        },
        {
            id: '2',
            name: '이영희',
            email: 'lee@example.com',
            role: 'editor',
            avatar: 'https://via.placeholder.com/40',
            lastActive: new Date(Date.now() - 300000),
            status: 'away'
        },
        {
            id: '3',
            name: '박민수',
            email: 'park@example.com',
            role: 'viewer',
            avatar: 'https://via.placeholder.com/40',
            lastActive: new Date(Date.now() - 600000),
            status: 'offline'
        }
    ]);

    const [activities, setActivities] = useState<CollaborationActivity[]>([
        {
            id: '1',
            type: 'file_upload',
            user: '김철수',
            description: '프로젝트 계획서.pdf를 업로드했습니다.',
            timestamp: new Date(Date.now() - 300000),
            fileId: 'file1'
        },
        {
            id: '2',
            type: 'comment',
            user: '이영희',
            description: '3번째 섹션에 대한 코멘트를 추가했습니다.',
            timestamp: new Date(Date.now() - 600000),
            fileId: 'file1'
        },
        {
            id: '3',
            type: 'edit',
            user: '박민수',
            description: '예산 계획을 수정했습니다.',
            timestamp: new Date(Date.now() - 900000),
            fileId: 'file2'
        }
    ]);

    const [activeTab, setActiveTab] = useState<'members' | 'activities' | 'settings'>('members');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer');

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'owner': return 'bg-purple-100 text-purple-800';
            case 'admin': return 'bg-red-100 text-red-800';
            case 'editor': return 'bg-blue-100 text-blue-800';
            case 'viewer': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'bg-green-500';
            case 'away': return 'bg-yellow-500';
            case 'offline': return 'bg-gray-400';
            default: return 'bg-gray-400';
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'file_upload': return <DocumentTextIcon className="w-5 h-5 text-blue-500" />;
            case 'comment': return <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-500" />;
            case 'edit': return <PencilIcon className="w-5 h-5 text-orange-500" />;
            case 'share': return <UsersIcon className="w-5 h-5 text-purple-500" />;
            case 'delete': return <TrashIcon className="w-5 h-5 text-red-500" />;
            default: return <DocumentTextIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    const handleInviteMember = () => {
        if (inviteEmail && inviteRole) {
            const newMember: CollaborationMember = {
                id: Date.now().toString(),
                name: inviteEmail.split('@')[0],
                email: inviteEmail,
                role: inviteRole,
                avatar: 'https://via.placeholder.com/40',
                lastActive: new Date(),
                status: 'offline'
            };
            setMembers(prev => [...prev, newMember]);
            setInviteEmail('');
            setInviteRole('viewer');
            setShowInviteModal(false);
        }
    };

    const removeMember = (memberId: string) => {
        setMembers(prev => prev.filter(member => member.id !== memberId));
    };

    const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

        if (diffInMinutes < 1) return '방금 전';
        if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
        return `${Math.floor(diffInMinutes / 1440)}일 전`;
    };

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">프로젝트 협업</h2>
                    <p className="text-gray-600">팀원들과 함께 프로젝트를 관리하세요</p>
                </div>
                <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>팀원 초대</span>
                </button>
            </div>

            {/* 탭 네비게이션 */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'members'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        팀원 ({members.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('activities')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'activities'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        활동 내역 ({activities.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'settings'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        설정
                    </button>
                </nav>
            </div>

            {/* 팀원 탭 */}
            {activeTab === 'members' && (
                <div className="space-y-4">
                    <div className="grid gap-4">
                        {members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <img
                                            src={member.avatar}
                                            alt={member.name}
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">{member.name}</h3>
                                        <p className="text-sm text-gray-500">{member.email}</p>
                                        <p className="text-xs text-gray-400">
                                            마지막 활동: {formatTimeAgo(member.lastActive)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(member.role)}`}>
                                        {member.role === 'owner' ? '소유자' :
                                            member.role === 'admin' ? '관리자' :
                                                member.role === 'editor' ? '편집자' : '뷰어'}
                                    </span>
                                    {member.role !== 'owner' && (
                                        <button
                                            onClick={() => removeMember(member.id)}
                                            className="text-red-500 hover:text-red-700"
                                            title="팀원 제거"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 활동 내역 탭 */}
            {activeTab === 'activities' && (
                <div className="space-y-4">
                    <div className="space-y-3">
                        {activities.map((activity) => (
                            <div key={activity.id} className="flex items-start space-x-3 p-4 bg-white rounded-lg border">
                                <div className="flex-shrink-0">
                                    {getActivityIcon(activity.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900">
                                        <span className="font-medium">{activity.user}</span>님이{' '}
                                        {activity.description}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatTimeAgo(activity.timestamp)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 설정 탭 */}
            {activeTab === 'settings' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg border p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">협업 설정</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-gray-900">실시간 알림</h4>
                                    <p className="text-sm text-gray-500">팀원의 활동에 대한 실시간 알림을 받습니다</p>
                                </div>
                                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition" />
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-gray-900">파일 공유</h4>
                                    <p className="text-sm text-gray-500">팀원들이 파일을 공유할 수 있습니다</p>
                                </div>
                                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition" />
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-gray-900">코멘트 허용</h4>
                                    <p className="text-sm text-gray-500">팀원들이 파일에 코멘트를 달 수 있습니다</p>
                                </div>
                                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 초대 모달 */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">팀원 초대</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    이메일 주소
                                </label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="example@email.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    권한
                                </label>
                                <select
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="viewer">뷰어 (읽기 전용)</option>
                                    <option value="editor">편집자 (읽기/쓰기)</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleInviteMember}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                초대하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectCollaboration;
