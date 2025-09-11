import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Share2,
    Link,
    Copy,
    Eye,
    EyeOff,
    Lock,
    Unlock,
    MessageSquare,
    Edit,
    Trash2,
    MoreVertical,
    Check,
    X,
    AlertCircle,
    Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Collaborator {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'owner' | 'admin' | 'editor' | 'viewer';
    status: 'online' | 'offline' | 'away';
    lastSeen: Date;
    permissions: string[];
}

interface ShareLink {
    id: string;
    url: string;
    password?: string;
    expiresAt?: Date;
    accessCount: number;
    maxAccess?: number;
    isActive: boolean;
    createdAt: Date;
    createdBy: string;
}

interface RealTimeCollaborationProps {
    projectId: string;
    projectName: string;
    collaborators: Collaborator[];
    shareLinks: ShareLink[];
    onInviteCollaborator: (email: string, role: string) => void;
    onRemoveCollaborator: (id: string) => void;
    onUpdateRole: (id: string, role: string) => void;
    onCreateShareLink: (options: any) => void;
    onDeleteShareLink: (id: string) => void;
    onCopyLink: (url: string) => void;
}

const RealTimeCollaboration: React.FC<RealTimeCollaborationProps> = ({
    projectId,
    projectName,
    collaborators,
    shareLinks,
    onInviteCollaborator,
    onRemoveCollaborator,
    onUpdateRole,
    onCreateShareLink,
    onDeleteShareLink,
    onCopyLink
}) => {
    const [activeTab, setActiveTab] = useState<'collaborators' | 'sharing'>('collaborators');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('viewer');
    const [shareOptions, setShareOptions] = useState({
        password: '',
        expiresIn: '7d',
        maxAccess: 10,
        allowEdit: false
    });

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

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'owner': return '소유자';
            case 'admin': return '관리자';
            case 'editor': return '편집자';
            case 'viewer': return '뷰어';
            default: return role;
        }
    };

    const handleInvite = () => {
        if (inviteEmail.trim()) {
            onInviteCollaborator(inviteEmail.trim(), inviteRole);
            setInviteEmail('');
            setInviteRole('viewer');
            setShowInviteModal(false);
        }
    };

    const handleCreateShareLink = () => {
        onCreateShareLink(shareOptions);
        setShareOptions({
            password: '',
            expiresIn: '7d',
            maxAccess: 10,
            allowEdit: false
        });
        setShowShareModal(false);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        onCopyLink(text);
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
        { id: 'collaborators', name: '협업자', icon: Users },
        { id: 'sharing', name: '공유', icon: Share2 }
    ];

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">실시간 협업</h2>
                    <p className="text-gray-600 mt-1">프로젝트 "{projectName}"의 협업 및 공유를 관리하세요</p>
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
                {activeTab === 'collaborators' && (
                    <motion.div
                        key="collaborators"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        {/* 협업자 초대 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">협업자 초대</h3>
                                <button
                                    onClick={() => setShowInviteModal(true)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    <span>초대하기</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                    <Users className="h-4 w-4" />
                                    <span>총 {collaborators.length}명</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>{collaborators.filter(c => c.status === 'online').length}명 온라인</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Edit className="h-4 w-4" />
                                    <span>{collaborators.filter(c => c.role === 'editor' || c.role === 'admin').length}명 편집 가능</span>
                                </div>
                            </div>
                        </div>

                        {/* 협업자 목록 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">협업자 목록</h3>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {collaborators.map((collaborator) => (
                                    <div key={collaborator.id} className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="relative">
                                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-medium text-purple-600">
                                                            {collaborator.name.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(collaborator.status)}`}></div>
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <h4 className="font-medium text-gray-900">{collaborator.name}</h4>
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(collaborator.role)}`}>
                                                            {getRoleLabel(collaborator.role)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600">{collaborator.email}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {collaborator.status === 'online' ? '온라인' :
                                                            collaborator.status === 'away' ? '자리비움' :
                                                                `마지막 접속: ${formatDate(collaborator.lastSeen)}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <select
                                                    value={collaborator.role}
                                                    onChange={(e) => onUpdateRole(collaborator.id, e.target.value)}
                                                    className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                >
                                                    <option value="viewer">뷰어</option>
                                                    <option value="editor">편집자</option>
                                                    <option value="admin">관리자</option>
                                                </select>
                                                <button
                                                    onClick={() => onRemoveCollaborator(collaborator.id)}
                                                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'sharing' && (
                    <motion.div
                        key="sharing"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        {/* 공유 링크 생성 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">공유 링크</h3>
                                <button
                                    onClick={() => setShowShareModal(true)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    <Link className="h-4 w-4" />
                                    <span>링크 생성</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                    <Link className="h-4 w-4" />
                                    <span>총 {shareLinks.length}개 링크</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>{shareLinks.filter(l => l.isActive).length}개 활성</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Eye className="h-4 w-4" />
                                    <span>총 {shareLinks.reduce((sum, link) => sum + link.accessCount, 0)}회 접근</span>
                                </div>
                            </div>
                        </div>

                        {/* 공유 링크 목록 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">공유 링크 목록</h3>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {shareLinks.map((link) => (
                                    <div key={link.id} className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Link className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-900 truncate">
                                                        {link.url}
                                                    </span>
                                                    {link.password && (
                                                        <Lock className="h-4 w-4 text-gray-400" />
                                                    )}
                                                    {link.isActive ? (
                                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    ) : (
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                    <span>접근: {link.accessCount}회</span>
                                                    {link.maxAccess && (
                                                        <span>최대: {link.maxAccess}회</span>
                                                    )}
                                                    <span>생성: {formatDate(link.createdAt)}</span>
                                                    {link.expiresAt && (
                                                        <span>만료: {formatDate(link.expiresAt)}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 ml-4">
                                                <button
                                                    onClick={() => copyToClipboard(link.url)}
                                                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                                                    title="링크 복사"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => onDeleteShareLink(link.id)}
                                                    className="p-2 text-red-500 hover:text-red-700 transition-colors"
                                                    title="링크 삭제"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 협업자 초대 모달 */}
            <AnimatePresence>
                {showInviteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => setShowInviteModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-lg p-6 w-96"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">협업자 초대</h3>
                                <button
                                    onClick={() => setShowInviteModal(false)}
                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                >
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        이메일 주소
                                    </label>
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="collaborator@example.com"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        역할
                                    </label>
                                    <select
                                        value={inviteRole}
                                        onChange={(e) => setInviteRole(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="viewer">뷰어 - 읽기만 가능</option>
                                        <option value="editor">편집자 - 읽기 및 편집 가능</option>
                                        <option value="admin">관리자 - 모든 권한</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setShowInviteModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleInvite}
                                    disabled={!inviteEmail.trim()}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                                >
                                    초대하기
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 공유 링크 생성 모달 */}
            <AnimatePresence>
                {showShareModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => setShowShareModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-lg p-6 w-96"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">공유 링크 생성</h3>
                                <button
                                    onClick={() => setShowShareModal(false)}
                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                >
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        비밀번호 (선택사항)
                                    </label>
                                    <input
                                        type="text"
                                        value={shareOptions.password}
                                        onChange={(e) => setShareOptions({ ...shareOptions, password: e.target.value })}
                                        placeholder="링크 접근을 위한 비밀번호"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        만료 기간
                                    </label>
                                    <select
                                        value={shareOptions.expiresIn}
                                        onChange={(e) => setShareOptions({ ...shareOptions, expiresIn: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="1d">1일</option>
                                        <option value="7d">7일</option>
                                        <option value="30d">30일</option>
                                        <option value="never">만료 없음</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        최대 접근 횟수
                                    </label>
                                    <input
                                        type="number"
                                        value={shareOptions.maxAccess}
                                        onChange={(e) => setShareOptions({ ...shareOptions, maxAccess: Number(e.target.value) })}
                                        min="1"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="allowEdit"
                                        checked={shareOptions.allowEdit}
                                        onChange={(e) => setShareOptions({ ...shareOptions, allowEdit: e.target.checked })}
                                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                    />
                                    <label htmlFor="allowEdit" className="text-sm text-gray-700">
                                        편집 권한 허용
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setShowShareModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleCreateShareLink}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    링크 생성
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RealTimeCollaboration;
