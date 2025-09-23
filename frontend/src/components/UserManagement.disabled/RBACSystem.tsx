import React, { useState, useEffect } from 'react';
import {
    Users,
    Shield,
    UserPlus,
    UserMinus,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Lock,
    Unlock,
    Key,
    Settings,
    Activity,
    Calendar,
    Mail,
    Phone,
    MapPin,
    Building,
    Crown,
    Star,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    Filter,
    Search,
    Download,
    Upload,
    RefreshCw,
    Plus,
    MoreVertical,
    ChevronDown,
    ChevronRight,
    User,
    UserCheck,
    UserX,
    ShieldCheck,
    ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
    id: string;
    username: string;
    email: string;
    fullName: string;
    avatar?: string;
    role: string;
    status: 'active' | 'inactive' | 'suspended' | 'pending';
    department: string;
    position: string;
    phone?: string;
    location?: string;
    joinedAt: Date;
    lastLogin?: Date;
    permissions: string[];
    projects: string[];
    isAdmin: boolean;
    isVerified: boolean;
    twoFactorEnabled: boolean;
    loginAttempts: number;
    lastPasswordChange?: Date;
    preferences: {
        language: string;
        theme: 'light' | 'dark' | 'auto';
        notifications: {
            email: boolean;
            push: boolean;
            sms: boolean;
        };
        timezone: string;
    };
}

interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    isSystem: boolean;
    createdAt: Date;
    updatedAt: Date;
    userCount: number;
    color: string;
    level: number;
}

interface Permission {
    id: string;
    name: string;
    description: string;
    category: string;
    isSystem: boolean;
    dependencies: string[];
}

interface AuditLog {
    id: string;
    userId: string;
    userName: string;
    action: string;
    resource: string;
    details: any;
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
    status: 'success' | 'failure' | 'warning';
}

interface RBACSystemProps {
    onUserCreate?: (user: Omit<User, 'id' | 'joinedAt'>) => void;
    onUserUpdate?: (userId: string, updates: Partial<User>) => void;
    onUserDelete?: (userId: string) => void;
    onRoleCreate?: (role: Omit<Role, 'id' | 'createdAt' | 'updatedAt' | 'userCount'>) => void;
    onRoleUpdate?: (roleId: string, updates: Partial<Role>) => void;
    onRoleDelete?: (roleId: string) => void;
    onPermissionUpdate?: (permissions: string[]) => void;
}

const RBACSystem: React.FC<RBACSystemProps> = ({
    onUserCreate,
    onUserUpdate,
    onUserDelete,
    onRoleCreate,
    onRoleUpdate,
    onRoleDelete,
    onPermissionUpdate
}) => {
    const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions' | 'audit' | 'settings'>('users');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // 사용자 데이터 시뮬레이션
    const [users, setUsers] = useState<User[]>([
        {
            id: '1',
            username: 'admin',
            email: 'admin@corbu.ai',
            fullName: '시스템 관리자',
            role: 'super_admin',
            status: 'active',
            department: 'IT',
            position: '시스템 관리자',
            phone: '010-1234-5678',
            location: '서울시 강남구',
            joinedAt: new Date('2023-01-01'),
            lastLogin: new Date(),
            permissions: ['*'],
            projects: ['*'],
            isAdmin: true,
            isVerified: true,
            twoFactorEnabled: true,
            loginAttempts: 0,
            lastPasswordChange: new Date('2024-01-01'),
            preferences: {
                language: 'ko',
                theme: 'light',
                notifications: {
                    email: true,
                    push: true,
                    sms: false
                },
                timezone: 'Asia/Seoul'
            }
        },
        {
            id: '2',
            username: 'kim.manager',
            email: 'kim.manager@corbu.ai',
            fullName: '김매니저',
            role: 'project_manager',
            status: 'active',
            department: '프로젝트 관리',
            position: '프로젝트 매니저',
            phone: '010-2345-6789',
            location: '서울시 강남구',
            joinedAt: new Date('2023-03-15'),
            lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
            permissions: ['project:read', 'project:write', 'user:read'],
            projects: ['project-1', 'project-2'],
            isAdmin: false,
            isVerified: true,
            twoFactorEnabled: false,
            loginAttempts: 0,
            preferences: {
                language: 'ko',
                theme: 'auto',
                notifications: {
                    email: true,
                    push: true,
                    sms: false
                },
                timezone: 'Asia/Seoul'
            }
        },
        {
            id: '3',
            username: 'lee.developer',
            email: 'lee.developer@corbu.ai',
            fullName: '이개발자',
            role: 'developer',
            status: 'active',
            department: '개발팀',
            position: '시니어 개발자',
            phone: '010-3456-7890',
            location: '서울시 강남구',
            joinedAt: new Date('2023-06-01'),
            lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000),
            permissions: ['project:read', 'code:read', 'code:write'],
            projects: ['project-1'],
            isAdmin: false,
            isVerified: true,
            twoFactorEnabled: true,
            loginAttempts: 0,
            preferences: {
                language: 'en',
                theme: 'dark',
                notifications: {
                    email: false,
                    push: true,
                    sms: false
                },
                timezone: 'Asia/Seoul'
            }
        },
        {
            id: '4',
            username: 'park.viewer',
            email: 'park.viewer@corbu.ai',
            fullName: '박뷰어',
            role: 'viewer',
            status: 'inactive',
            department: '마케팅',
            position: '마케팅 매니저',
            phone: '010-4567-8901',
            location: '서울시 강남구',
            joinedAt: new Date('2023-09-01'),
            lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            permissions: ['project:read'],
            projects: ['project-2'],
            isAdmin: false,
            isVerified: true,
            twoFactorEnabled: false,
            loginAttempts: 3,
            preferences: {
                language: 'ko',
                theme: 'light',
                notifications: {
                    email: true,
                    push: false,
                    sms: false
                },
                timezone: 'Asia/Seoul'
            }
        }
    ]);

    const [roles, setRoles] = useState<Role[]>([
        {
            id: '1',
            name: 'super_admin',
            description: '시스템 전체 관리 권한을 가진 최고 관리자',
            permissions: ['*'],
            isSystem: true,
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date('2023-01-01'),
            userCount: 1,
            color: 'red',
            level: 100
        },
        {
            id: '2',
            name: 'project_manager',
            description: '프로젝트 관리 및 팀 관리 권한',
            permissions: ['project:read', 'project:write', 'user:read', 'team:manage'],
            isSystem: true,
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date('2023-03-15'),
            userCount: 3,
            color: 'blue',
            level: 80
        },
        {
            id: '3',
            name: 'developer',
            description: '개발 및 코드 관리 권한',
            permissions: ['project:read', 'code:read', 'code:write', 'test:run'],
            isSystem: true,
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date('2023-06-01'),
            userCount: 5,
            color: 'green',
            level: 60
        },
        {
            id: '4',
            name: 'viewer',
            description: '읽기 전용 권한',
            permissions: ['project:read'],
            isSystem: true,
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date('2023-09-01'),
            userCount: 8,
            color: 'gray',
            level: 20
        }
    ]);

    const [permissions, setPermissions] = useState<Permission[]>([
        {
            id: '1',
            name: 'project:read',
            description: '프로젝트 읽기 권한',
            category: 'project',
            isSystem: true,
            dependencies: []
        },
        {
            id: '2',
            name: 'project:write',
            description: '프로젝트 쓰기 권한',
            category: 'project',
            isSystem: true,
            dependencies: ['project:read']
        },
        {
            id: '3',
            name: 'project:delete',
            description: '프로젝트 삭제 권한',
            category: 'project',
            isSystem: true,
            dependencies: ['project:write']
        },
        {
            id: '4',
            name: 'user:read',
            description: '사용자 정보 읽기 권한',
            category: 'user',
            isSystem: true,
            dependencies: []
        },
        {
            id: '5',
            name: 'user:write',
            description: '사용자 정보 쓰기 권한',
            category: 'user',
            isSystem: true,
            dependencies: ['user:read']
        },
        {
            id: '6',
            name: 'code:read',
            description: '코드 읽기 권한',
            category: 'code',
            isSystem: true,
            dependencies: ['project:read']
        },
        {
            id: '7',
            name: 'code:write',
            description: '코드 쓰기 권한',
            category: 'code',
            isSystem: true,
            dependencies: ['code:read']
        }
    ]);

    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
        {
            id: '1',
            userId: '1',
            userName: '시스템 관리자',
            action: 'user_login',
            resource: 'auth',
            details: { ip: '192.168.1.100', userAgent: 'Chrome/120.0.0.0' },
            ipAddress: '192.168.1.100',
            userAgent: 'Chrome/120.0.0.0',
            timestamp: new Date(),
            status: 'success'
        },
        {
            id: '2',
            userId: '2',
            userName: '김매니저',
            action: 'project_create',
            resource: 'project-3',
            details: { projectName: '새 프로젝트', description: '테스트 프로젝트' },
            ipAddress: '192.168.1.101',
            userAgent: 'Firefox/119.0.0.0',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            status: 'success'
        },
        {
            id: '3',
            userId: '4',
            userName: '박뷰어',
            action: 'user_login',
            resource: 'auth',
            details: { ip: '192.168.1.102', userAgent: 'Safari/17.0.0.0' },
            ipAddress: '192.168.1.102',
            userAgent: 'Safari/17.0.0.0',
            timestamp: new Date(Date.now() - 60 * 60 * 1000),
            status: 'failure'
        }
    ]);

    // 필터링된 사용자 목록
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesStatus && matchesRole;
    });

    // 정렬된 사용자 목록
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        let aValue, bValue;
        switch (sortBy) {
            case 'name':
                aValue = a.fullName;
                bValue = b.fullName;
                break;
            case 'email':
                aValue = a.email;
                bValue = b.email;
                break;
            case 'role':
                aValue = a.role;
                bValue = b.role;
                break;
            case 'status':
                aValue = a.status;
                bValue = b.status;
                break;
            case 'joinedAt':
                aValue = a.joinedAt;
                bValue = b.joinedAt;
                break;
            default:
                aValue = a.fullName;
                bValue = b.fullName;
        }

        if (sortOrder === 'asc') {
            return (aValue || 0) > (bValue || 0) ? 1 : -1;
        } else {
            return (aValue || 0) < (bValue || 0) ? 1 : -1;
        }
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-100';
            case 'inactive': return 'text-gray-600 bg-gray-100';
            case 'suspended': return 'text-red-600 bg-red-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="h-4 w-4" />;
            case 'inactive': return <XCircle className="h-4 w-4" />;
            case 'suspended': return <AlertTriangle className="h-4 w-4" />;
            case 'pending': return <Clock className="h-4 w-4" />;
            default: return <User className="h-4 w-4" />;
        }
    };

    const getRoleColor = (roleName: string) => {
        const role = roles.find(r => r.name === roleName);
        return role?.color || 'gray';
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
        { id: 'users', name: '사용자 관리', icon: Users },
        { id: 'roles', name: '역할 관리', icon: Shield },
        { id: 'permissions', name: '권한 관리', icon: Key },
        { id: 'audit', name: '감사 로그', icon: Activity },
        { id: 'settings', name: '설정', icon: Settings }
    ];

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">사용자 관리 및 RBAC</h2>
                    <p className="text-gray-600 mt-1">사용자, 역할, 권한을 체계적으로 관리하세요</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowUserModal(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <UserPlus className="h-4 w-4" />
                        <span>사용자 추가</span>
                    </button>
                    <button
                        onClick={() => setShowRoleModal(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>역할 추가</span>
                    </button>
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
                {activeTab === 'users' && (
                    <motion.div
                        key="users"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        {/* 검색 및 필터 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center space-x-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="사용자 검색..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="all">모든 상태</option>
                                    <option value="active">활성</option>
                                    <option value="inactive">비활성</option>
                                    <option value="suspended">정지</option>
                                    <option value="pending">대기</option>
                                </select>
                                <select
                                    value={filterRole}
                                    onChange={(e) => setFilterRole(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="all">모든 역할</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.name}>{role.name}</option>
                                    ))}
                                </select>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="name">이름순</option>
                                    <option value="email">이메일순</option>
                                    <option value="role">역할순</option>
                                    <option value="status">상태순</option>
                                    <option value="joinedAt">가입일순</option>
                                </select>
                                <button
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <ChevronDown className={`h-4 w-4 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {/* 사용자 목록 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">사용자 목록 ({sortedUsers.length})</h3>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {sortedUsers.map((user) => (
                                    <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <User className="h-6 w-6 text-purple-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{user.fullName}</h4>
                                                    <p className="text-sm text-gray-600">{user.email}</p>
                                                    <p className="text-xs text-gray-500">@{user.username}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="text-center">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                                                        {user.status === 'active' ? '활성' :
                                                            user.status === 'inactive' ? '비활성' :
                                                                user.status === 'suspended' ? '정지' : '대기'}
                                                    </span>
                                                    <p className="text-xs text-gray-500 mt-1">{user.department} • {user.position}</p>
                                                </div>
                                                <div className="text-center">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${getRoleColor(user.role)}-100 text-${getRoleColor(user.role)}-800`}>
                                                        {user.role}
                                                    </span>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {user.isAdmin ? '관리자' : '일반 사용자'}
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {user.permissions.length}개 권한
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        마지막 로그인: {user.lastLogin ? formatDate(user.lastLogin) : '없음'}
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => setSelectedUser(user)}
                                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="상세 보기"
                                                    >
                                                        <Eye className="h-4 w-4 text-gray-500" />
                                                    </button>
                                                    <button
                                                        onClick={() => {/* 사용자 편집 */ }}
                                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="편집"
                                                    >
                                                        <Edit className="h-4 w-4 text-gray-500" />
                                                    </button>
                                                    <button
                                                        onClick={() => {/* 사용자 삭제 */ }}
                                                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                                        title="삭제"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'roles' && (
                    <motion.div
                        key="roles"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">역할 관리</h3>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {roles.map((role) => (
                                    <div key={role.id} className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-10 h-10 bg-${role.color}-100 rounded-lg flex items-center justify-center`}>
                                                    <Shield className={`h-5 w-5 text-${role.color}-600`} />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{role.name}</h4>
                                                    <p className="text-sm text-gray-600">{role.description}</p>
                                                    <p className="text-xs text-gray-500">
                                                        레벨: {role.level} • 사용자: {role.userCount}명
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="text-center">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {role.permissions.length}개 권한
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {role.isSystem ? '시스템 역할' : '사용자 정의'}
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => setSelectedRole(role)}
                                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="상세 보기"
                                                    >
                                                        <Eye className="h-4 w-4 text-gray-500" />
                                                    </button>
                                                    {!role.isSystem && (
                                                        <>
                                                            <button
                                                                onClick={() => {/* 역할 편집 */ }}
                                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                                title="편집"
                                                            >
                                                                <Edit className="h-4 w-4 text-gray-500" />
                                                            </button>
                                                            <button
                                                                onClick={() => {/* 역할 삭제 */ }}
                                                                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                                                title="삭제"
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'permissions' && (
                    <motion.div
                        key="permissions"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">권한 관리</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {permissions.map((permission) => (
                                        <div key={permission.id} className="p-4 border border-gray-200 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium text-gray-900">{permission.name}</h4>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${permission.isSystem ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {permission.isSystem ? '시스템' : '사용자'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{permission.description}</p>
                                            <p className="text-xs text-gray-500">카테고리: {permission.category}</p>
                                            {permission.dependencies.length > 0 && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    의존성: {permission.dependencies.join(', ')}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'audit' && (
                    <motion.div
                        key="audit"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">감사 로그</h3>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {auditLogs.map((log) => (
                                    <div key={log.id} className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className={`p-2 rounded-lg ${log.status === 'success' ? 'bg-green-100' :
                                                    log.status === 'failure' ? 'bg-red-100' :
                                                        'bg-yellow-100'
                                                    }`}>
                                                    {log.status === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                                                        log.status === 'failure' ? <XCircle className="h-4 w-4 text-red-600" /> :
                                                            <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{log.userName}</h4>
                                                    <p className="text-sm text-gray-600">{log.action} • {log.resource}</p>
                                                    <p className="text-xs text-gray-500">{formatDate(log.timestamp)}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">{log.ipAddress}</p>
                                                <p className="text-xs text-gray-500">{log.userAgent}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'settings' && (
                    <motion.div
                        key="settings"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">보안 설정</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">2단계 인증</p>
                                            <p className="text-sm text-gray-600">모든 사용자에게 2단계 인증 요구</p>
                                        </div>
                                        <button className="w-12 h-6 bg-purple-600 rounded-full relative">
                                            <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-transform"></div>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">세션 타임아웃</p>
                                            <p className="text-sm text-gray-600">자동 로그아웃 시간 설정</p>
                                        </div>
                                        <select className="px-3 py-2 border border-gray-300 rounded-lg">
                                            <option>30분</option>
                                            <option>1시간</option>
                                            <option>4시간</option>
                                            <option>24시간</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">알림 설정</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">로그인 알림</p>
                                            <p className="text-sm text-gray-600">새로운 로그인 시 알림</p>
                                        </div>
                                        <button className="w-12 h-6 bg-purple-600 rounded-full relative">
                                            <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-transform"></div>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">권한 변경 알림</p>
                                            <p className="text-sm text-gray-600">권한 변경 시 관리자에게 알림</p>
                                        </div>
                                        <button className="w-12 h-6 bg-purple-600 rounded-full relative">
                                            <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-transform"></div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RBACSystem;
