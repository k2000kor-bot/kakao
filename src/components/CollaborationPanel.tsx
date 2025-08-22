import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    MessageSquare,
    AtSign,
    Activity,
    Share2,
    Plus,
    MoreHorizontal,
    User,
    Clock,
    Eye,
    EyeOff,
    ThumbsUp,
    Reply,
    Trash2,
    Edit3,
    Check,
    X,
    Bell,
    Settings
} from 'lucide-react';
import {
    CollaborationUser,
    Comment,
    Mention,
    CollaborationActivity,
    collaborationService
} from '../services/collaborationService';

interface CollaborationPanelProps {
    projectId: string;
    currentUserId: string;
    onClose?: () => void;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
    projectId,
    currentUserId,
    onClose
}) => {
    const [activeTab, setActiveTab] = useState<'users' | 'comments' | 'mentions' | 'activity'>('users');
    const [users, setUsers] = useState<CollaborationUser[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [mentions, setMentions] = useState<Mention[]>([]);
    const [activities, setActivities] = useState<CollaborationActivity[]>([]);
    const [showAddUser, setShowAddUser] = useState(false);
    const [showAddComment, setShowAddComment] = useState(false);
    const [commentTarget, setCommentTarget] = useState<{ type: string; id: string; title: string } | null>(null);
    const [newComment, setNewComment] = useState('');
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'member' as const });

    useEffect(() => {
        loadCollaborationData();
    }, [projectId]);

    const loadCollaborationData = () => {
        setUsers(collaborationService.getProjectUsers(projectId));
        setComments(collaborationService.getProjectComments(projectId));
        setMentions(collaborationService.getProjectMentions(projectId));
        setActivities(collaborationService.getProjectActivities(projectId));
    };

    const handleAddUser = () => {
        if (newUser.name && newUser.email) {
            collaborationService.addProjectUser(projectId, {
                id: Date.now().toString(),
                ...newUser
            });
            setNewUser({ name: '', email: '', role: 'member' });
            setShowAddUser(false);
            loadCollaborationData();
        }
    };

    const handleAddComment = () => {
        if (newComment.trim() && commentTarget) {
            collaborationService.addComment(projectId, {
                projectId,
                targetType: commentTarget.type as any,
                targetId: commentTarget.id,
                authorId: currentUserId,
                content: newComment,
                mentions: [],
                parentId: undefined
            });
            setNewComment('');
            setShowAddComment(false);
            setCommentTarget(null);
            loadCollaborationData();
        }
    };

    const handleReaction = (commentId: string, emoji: string) => {
        collaborationService.addReaction(projectId, commentId, currentUserId, emoji);
        loadCollaborationData();
    };

    const handleMarkMentionAsRead = (mentionId: string) => {
        collaborationService.markMentionAsRead(projectId, mentionId);
        loadCollaborationData();
    };

    const getRoleColor = (role: string) => {
        const colors = {
            owner: 'bg-red-100 text-red-800',
            admin: 'bg-orange-100 text-orange-800',
            member: 'bg-blue-100 text-blue-800',
            viewer: 'bg-gray-100 text-gray-800'
        };
        return colors[role as keyof typeof colors] || colors.viewer;
    };

    const getActionIcon = (action: string) => {
        const icons = {
            created: <Plus className="w-4 h-4" />,
            updated: <Edit3 className="w-4 h-4" />,
            deleted: <Trash2 className="w-4 h-4" />,
            shared: <Share2 className="w-4 h-4" />,
            commented: <MessageSquare className="w-4 h-4" />,
            mentioned: <AtSign className="w-4 h-4" />
        };
        return icons[action as keyof typeof icons] || <Activity className="w-4 h-4" />;
    };

    const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days}일 전`;
        if (hours > 0) return `${hours}시간 전`;
        if (minutes > 0) return `${minutes}분 전`;
        return '방금 전';
    };

    const tabs = [
        { id: 'users', label: '팀원', icon: Users, count: users.length },
        { id: 'comments', label: '댓글', icon: MessageSquare, count: comments.length },
        { id: 'mentions', label: '멘션', icon: AtSign, count: mentions.filter(m => !m.isRead).length },
        { id: 'activity', label: '활동', icon: Activity, count: activities.length }
    ];

    return (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">협업 관리</h2>
                <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                            ? 'text-purple-600 border-b-2 border-purple-600'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                        {tab.count > 0 && (
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="p-4">
                <AnimatePresence mode="wait">
                    {activeTab === 'users' && (
                        <motion.div
                            key="users"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">프로젝트 팀원</h3>
                                <button
                                    onClick={() => setShowAddUser(true)}
                                    className="flex items-center px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    팀원 추가
                                </button>
                            </div>

                            <div className="grid gap-3">
                                {users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{user.name}</p>
                                                <p className="text-sm text-gray-600">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                                                {user.role}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {formatTimeAgo(user.lastActive)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add User Modal */}
                            {showAddUser && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">팀원 추가</h3>
                                        <div className="space-y-4">
                                            <input
                                                type="text"
                                                placeholder="이름"
                                                value={newUser.name}
                                                onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            />
                                            <input
                                                type="email"
                                                placeholder="이메일"
                                                value={newUser.email}
                                                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            />
                                            <select
                                                value={newUser.role}
                                                onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as any }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            >
                                                <option value="viewer">뷰어</option>
                                                <option value="member">멤버</option>
                                                <option value="admin">관리자</option>
                                            </select>
                                        </div>
                                        <div className="flex justify-end space-x-2 mt-6">
                                            <button
                                                onClick={() => setShowAddUser(false)}
                                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                            >
                                                취소
                                            </button>
                                            <button
                                                onClick={handleAddUser}
                                                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                            >
                                                추가
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'comments' && (
                        <motion.div
                            key="comments"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">댓글</h3>
                                <button
                                    onClick={() => setShowAddComment(true)}
                                    className="flex items-center px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    댓글 작성
                                </button>
                            </div>

                            <div className="space-y-4">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4 text-purple-600" />
                                                </div>
                                                <span className="font-medium text-gray-900">
                                                    {users.find(u => u.id === comment.authorId)?.name || 'Unknown'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {formatTimeAgo(comment.createdAt)}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <button
                                                    onClick={() => handleReaction(comment.id, '👍')}
                                                    className="p-1 text-gray-400 hover:text-gray-600"
                                                >
                                                    <ThumbsUp className="w-4 h-4" />
                                                </button>
                                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                                    <Reply className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-gray-700 mb-2">{comment.content}</p>
                                        {Object.keys(comment.reactions).length > 0 && (
                                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                {Object.entries(comment.reactions).map(([userId, emoji]) => (
                                                    <span key={userId} className="flex items-center space-x-1">
                                                        <span>{emoji}</span>
                                                        <span>{users.find(u => u.id === userId)?.name}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Add Comment Modal */}
                            {showAddComment && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">댓글 작성</h3>
                                        <div className="space-y-4">
                                            <select
                                                value={commentTarget?.type || ''}
                                                onChange={(e) => setCommentTarget(prev => prev ? { ...prev, type: e.target.value } : { type: e.target.value, id: '', title: '' })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            >
                                                <option value="">대상 선택</option>
                                                <option value="project">프로젝트</option>
                                                <option value="chat">채팅</option>
                                                <option value="message">메시지</option>
                                                <option value="knowledge">지식</option>
                                            </select>
                                            <textarea
                                                placeholder="댓글 내용을 입력하세요..."
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                rows={4}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div className="flex justify-end space-x-2 mt-6">
                                            <button
                                                onClick={() => setShowAddComment(false)}
                                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                            >
                                                취소
                                            </button>
                                            <button
                                                onClick={handleAddComment}
                                                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                            >
                                                작성
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'mentions' && (
                        <motion.div
                            key="mentions"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            <h3 className="text-lg font-medium text-gray-900">멘션 알림</h3>
                            <div className="space-y-3">
                                {mentions.map((mention) => (
                                    <div
                                        key={mention.id}
                                        className={`p-3 rounded-lg border ${mention.isRead ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <AtSign className="w-4 h-4 text-blue-600" />
                                                    <span className="font-medium text-gray-900">
                                                        {users.find(u => u.id === mention.mentionedBy)?.name || 'Unknown'}
                                                    </span>
                                                    <span className="text-sm text-gray-500">님이 회원님을 멘션했습니다</span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{mention.context}</p>
                                                <span className="text-xs text-gray-500">
                                                    {formatTimeAgo(mention.createdAt)}
                                                </span>
                                            </div>
                                            {!mention.isRead && (
                                                <button
                                                    onClick={() => handleMarkMentionAsRead(mention.id)}
                                                    className="p-1 text-blue-600 hover:text-blue-800"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'activity' && (
                        <motion.div
                            key="activity"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            <h3 className="text-lg font-medium text-gray-900">최근 활동</h3>
                            <div className="space-y-3">
                                {activities.map((activity) => (
                                    <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                            {getActionIcon(activity.action)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-900">
                                                <span className="font-medium">
                                                    {users.find(u => u.id === activity.userId)?.name || 'Unknown'}
                                                </span>
                                                <span className="ml-1">
                                                    {activity.action === 'created' && '생성했습니다'}
                                                    {activity.action === 'updated' && '수정했습니다'}
                                                    {activity.action === 'deleted' && '삭제했습니다'}
                                                    {activity.action === 'shared' && '공유했습니다'}
                                                    {activity.action === 'commented' && '댓글을 작성했습니다'}
                                                    {activity.action === 'mentioned' && '멘션했습니다'}
                                                </span>
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatTimeAgo(activity.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CollaborationPanel;
