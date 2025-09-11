import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    UserPlus,
    UserMinus,
    Shield,
    Key,
    Mail,
    Phone,
    Calendar,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Crown,
    User,
    Settings,
    Lock,
    Unlock,
    Activity,
    Clock,
    Star,
    Badge
} from 'lucide-react';

interface SystemUser {
    id: string;
    username: string;
    email: string;
    fullName: string;
    role: 'admin' | 'manager' | 'user' | 'guest';
    status: 'active' | 'inactive' | 'suspended';
    lastLogin: Date;
    createdAt: Date;
    permissions: string[];
    avatar?: string;
    phone?: string;
    department?: string;
    loginCount: number;
    isOnline: boolean;
}

interface SystemUserManagementProps {
    onUserAction?: (action: string, user: SystemUser) => void;
}

const SystemUserManagement: React.FC<SystemUserManagementProps> = ({ onUserAction }) => {
    const [users, setUsers] = useState<SystemUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'manager' | 'user' | 'guest'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'role' | 'status' | 'lastLogin' | 'createdAt'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    // Mock 데이터 생성
    useEffect(() => {
        const mockUsers: SystemUser[] = [
            {
                id: '1',
                username: 'admin',
                email: 'admin@corbu.ai',
                fullName: '시스템 관리자',
                role: 'admin',
                status: 'active',
                lastLogin: new Date(),
                createdAt: new Date('2024-01-01'),
                permissions: ['all'],
                loginCount: 156,
                isOnline: true
            },
            {
                id: '2',
                username: 'manager1',
                email: 'manager1@corbu.ai',
                fullName: '김매니저',
                role: 'manager',
                status: 'active',
                lastLogin: new Date(Date.now() - 3600000),
                createdAt: new Date('2024-01-15'),
                permissions: ['project_manage', 'user_manage', 'analytics_view'],
                department: '개발팀',
                loginCount: 89,
                isOnline: false
            },
            {
                id: '3',
                username: 'user1',
                email: 'user1@corbu.ai',
                fullName: '이사용자',
                role: 'user',
                status: 'active',
                lastLogin: new Date(Date.now() - 7200000),
                createdAt: new Date('2024-01-20'),
                permissions: ['project_create', 'chat_create'],
                department: '마케팅팀',
                loginCount: 45,
                isOnline: false
            },
            {
                id: '4',
                username: 'guest1',
                email: 'guest1@corbu.ai',
                fullName: '박게스트',
                role: 'guest',
                status: 'inactive',
                lastLogin: new Date(Date.now() - 86400000),
                createdAt: new Date('2024-02-01'),
                permissions: ['project_view'],
                loginCount: 12,
                isOnline: false
            }
        ];
        setUsers(mockUsers);
    }, []);

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'text-red-600 bg-red-100';
            case 'manager': return 'text-blue-600 bg-blue-100';
            case 'user': return 'text-green-600 bg-green-100';
            case 'guest': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-100';
            case 'inactive': return 'text-gray-600 bg-gray-100';
            case 'suspended': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return Crown;
            case 'manager': return Shield;
            case 'user': return User;
            case 'guest': return User;
            default: return User;
        }
    };

    const filteredUsers = users
        .filter(user => {
            const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = filterRole === 'all' || user.role === filterRole;
            const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
            return matchesSearch && matchesRole && matchesStatus;
        })
        .sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'name':
                    comparison = a.fullName.localeCompare(b.fullName);
                    break;
                case 'role':
                    comparison = a.role.localeCompare(b.role);
                    break;
                case 'status':
                    comparison = a.status.localeCompare(b.status);
                    break;
                case 'lastLogin':
                    comparison = a.lastLogin.getTime() - b.lastLogin.getTime();
                    break;
                case 'createdAt':
                    comparison = a.createdAt.getTime() - b.createdAt.getTime();
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

    const handleUserAction = (action: string, user: SystemUser) => {
        switch (action) {
            case 'edit':
                setSelectedUser(user);
                setShowEditModal(true);
                break;
            case 'delete':
                if (window.confirm(`정말로 ${user.fullName} 사용자를 삭제하시겠습니까?`)) {
                    setUsers(prev => prev.filter(u => u.id !== user.id));
                }
                break;
            case 'suspend':
                setUsers(prev => prev.map(u =>
                    u.id === user.id ? { ...u, status: 'suspended' as const } : u
                ));
                break;
            case 'activate':
                setUsers(prev => prev.map(u =>
                    u.id === user.id ? { ...u, status: 'active' as const } : u
                ));
                break;
        }
        onUserAction?.(action, user);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                        <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">사용자 관리</h2>
                        <p className="text-sm text-gray-600">시스템 사용자 계정 및 권한 관리</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                >
                    <UserPlus className="w-4 h-4 mr-2" />
                    새 사용자 추가
                </button>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="사용자 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value as any)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="all">모든 역할</option>
                            <option value="admin">관리자</option>
                            <option value="manager">매니저</option>
                            <option value="user">사용자</option>
                            <option value="guest">게스트</option>
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="all">모든 상태</option>
                            <option value="active">활성</option>
                            <option value="inactive">비활성</option>
                            <option value="suspended">정지</option>
                        </select>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="name">이름순</option>
                            <option value="role">역할순</option>
                            <option value="status">상태순</option>
                            <option value="lastLogin">최근 로그인순</option>
                            <option value="createdAt">생성일순</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            {sortOrder === 'asc' ? '↑' : '↓'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Users Table/Grid */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {viewMode === 'table' ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        사용자
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        역할
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        상태
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        최근 로그인
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        로그인 횟수
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        액션
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user) => {
                                    const RoleIcon = getRoleIcon(user.role);
                                    return (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                            <User className="h-6 w-6 text-purple-600" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.fullName}
                                                            {user.isOnline && (
                                                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                                    온라인
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-gray-500">{user.email}</div>
                                                        {user.department && (
                                                            <div className="text-xs text-gray-400">{user.department}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <RoleIcon className="w-4 h-4 mr-2" />
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                                        {user.role === 'admin' ? '관리자' :
                                                            user.role === 'manager' ? '매니저' :
                                                                user.role === 'user' ? '사용자' : '게스트'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                                    {user.status === 'active' ? '활성' :
                                                        user.status === 'inactive' ? '비활성' : '정지'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.lastLogin.toLocaleString('ko-KR')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.loginCount}회
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleUserAction('edit', user)}
                                                        className="text-purple-600 hover:text-purple-900"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    {user.status === 'active' ? (
                                                        <button
                                                            onClick={() => handleUserAction('suspend', user)}
                                                            className="text-yellow-600 hover:text-yellow-900"
                                                        >
                                                            <Lock className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleUserAction('activate', user)}
                                                            className="text-green-600 hover:text-green-900"
                                                        >
                                                            <Unlock className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleUserAction('delete', user)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredUsers.map((user) => {
                                const RoleIcon = getRoleIcon(user.role);
                                return (
                                    <div key={user.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                    <User className="h-6 w-6 text-purple-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                                                    <div className="text-xs text-gray-500">{user.username}</div>
                                                </div>
                                            </div>
                                            {user.isOnline && (
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">역할</span>
                                                <div className="flex items-center">
                                                    <RoleIcon className="w-3 h-3 mr-1" />
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                                        {user.role === 'admin' ? '관리자' :
                                                            user.role === 'manager' ? '매니저' :
                                                                user.role === 'user' ? '사용자' : '게스트'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">상태</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                                    {user.status === 'active' ? '활성' :
                                                        user.status === 'inactive' ? '비활성' : '정지'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">로그인</span>
                                                <span className="text-xs text-gray-900">{user.loginCount}회</span>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleUserAction('edit', user)}
                                                className="text-purple-600 hover:text-purple-900"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            {user.status === 'active' ? (
                                                <button
                                                    onClick={() => handleUserAction('suspend', user)}
                                                    className="text-yellow-600 hover:text-yellow-900"
                                                >
                                                    <Lock className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleUserAction('activate', user)}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    <Unlock className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleUserAction('delete', user)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">총 사용자</p>
                            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="bg-green-100 p-3 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">활성 사용자</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {users.filter(u => u.status === 'active').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <Activity className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">온라인</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {users.filter(u => u.isOnline).length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="bg-red-100 p-3 rounded-lg">
                            <Crown className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">관리자</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {users.filter(u => u.role === 'admin').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemUserManagement;
