import React, { useState } from 'react';
import './RBACSystem.css';
import { getUserStatusStyle, getRoleBadgeStyle, getAuditStatusStyle } from '../../styles/themeColors';
import {
    Users,
    Shield,
    UserPlus,
    Edit,
    Trash2,
    Eye,
    Key,
    Settings,
    Activity,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    Search,
    Plus,
    ChevronDown,
    User as UserIcon,
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
    details: unknown;
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
    onUserCreate: _onUserCreate,
    onUserUpdate: _onUserUpdate,
    onUserDelete: _onUserDelete,
    onRoleCreate: _onRoleCreate,
    onRoleUpdate: _onRoleUpdate,
    onRoleDelete: _onRoleDelete,
    onPermissionUpdate: _onPermissionUpdate
}) => {
    const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions' | 'audit' | 'settings'>('users');
    const [_selectedUser, setSelectedUser] = useState<User | null>(null);
    const [_selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [_showUserModal, setShowUserModal] = useState(false);
    const [_showRoleModal, setShowRoleModal] = useState(false);
    const [_showPermissionModal, _setShowPermissionModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // 사용자 데이터 시뮬레이션
    const [users, _setUsers] = useState<User[]>([
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

    const [roles, _setRoles] = useState<Role[]>([
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

    const [permissions, _setPermissions] = useState<Permission[]>([
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

    const [auditLogs, _setAuditLogs] = useState<AuditLog[]>([
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

    const getStatusStyle = (status: string) => getUserStatusStyle(status);

    const _getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="h-4 w-4" />;
            case 'inactive': return <XCircle className="h-4 w-4" />;
            case 'suspended': return <AlertTriangle className="h-4 w-4" />;
            case 'pending': return <Clock className="h-4 w-4" />;
            default: return <UserIcon className="h-4 w-4" />;
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
    ] as const;

    return (
        <div className="rbac-root" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            {/* 헤더 */}
            <div className="rbac-header">
                <div>
                    <h2 className="rbac-title">사용자 관리 및 RBAC</h2>
                    <p className="rbac-desc">사용자, 역할, 권한을 체계적으로 관리하세요</p>
                </div>
                <div className="rbac-actions">
                    <button type="button" onClick={() => setShowUserModal(true)} className="bw-btn-primary">
                        <UserPlus className="h-4 w-4" aria-hidden />
                        <span>사용자 추가</span>
                    </button>
                    <button type="button" onClick={() => setShowRoleModal(true)} className="bw-btn-secondary">
                        <Plus className="h-4 w-4" aria-hidden />
                        <span>역할 추가</span>
                    </button>
                </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="rbac-tabs">
                <nav style={{ display: 'flex', gap: 'var(--spacing-xl)' }}>
                    {tabs.map((tab) => {
                        const IconComponent = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`rbac-tab ${activeTab === tab.id ? 'active' : ''}`}
                            >
                                <IconComponent className="h-4 w-4" aria-hidden />
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
                        <div className="rbac-card rbac-filter-bar">
                            <div className="rbac-search-wrap">
                                <Search className="rbac-search-icon" aria-hidden />
                                <input
                                    type="text"
                                    placeholder="사용자 검색..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bw-input rbac-search-input"
                                    aria-label="사용자 검색"
                                />
                            </div>
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bw-input" style={{ width: 'auto', minWidth: 120 }}>
                                <option value="all">모든 상태</option>
                                <option value="active">활성</option>
                                <option value="inactive">비활성</option>
                                <option value="suspended">정지</option>
                                <option value="pending">대기</option>
                            </select>
                            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="bw-input" style={{ width: 'auto', minWidth: 120 }}>
                                <option value="all">모든 역할</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.name}>{role.name}</option>
                                ))}
                            </select>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bw-input" style={{ width: 'auto', minWidth: 110 }}>
                                <option value="name">이름순</option>
                                <option value="email">이메일순</option>
                                <option value="role">역할순</option>
                                <option value="status">상태순</option>
                                <option value="joinedAt">가입일순</option>
                            </select>
                            <button type="button" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="rbac-action-btn" title={sortOrder === 'asc' ? '내림차순' : '오름차순'}>
                                <ChevronDown className="h-4 w-4" style={{ transform: sortOrder === 'desc' ? 'rotate(180deg)' : undefined }} aria-hidden />
                            </button>
                        </div>

                        {/* 사용자 목록 */}
                        <div className="rbac-card">
                            <div className="rbac-card-header">
                                <h3 className="rbac-card-title">사용자 목록 ({sortedUsers.length})</h3>
                            </div>
                            <div>
                                {sortedUsers.map((user) => {
                                    const statusStyle = getStatusStyle(user.status);
                                    const roleStyle = getRoleBadgeStyle(getRoleColor(user.role));
                                    return (
                                        <div key={user.id} className="rbac-row">
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                                    <div className="rbac-user-avatar">
                                                        <UserIcon className="h-6 w-6" aria-hidden />
                                                    </div>
                                                    <div>
                                                        <h4 className="rbac-name">{user.fullName}</h4>
                                                        <p className="rbac-email">{user.email}</p>
                                                        <p className="rbac-meta">@{user.username}</p>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <span className="rbac-badge" style={{ color: statusStyle.color, backgroundColor: statusStyle.backgroundColor }}>
                                                            {user.status === 'active' ? '활성' : user.status === 'inactive' ? '비활성' : user.status === 'suspended' ? '정지' : '대기'}
                                                        </span>
                                                        <p className="rbac-meta">{user.department} • {user.position}</p>
                                                    </div>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <span className="rbac-badge" style={{ color: roleStyle.color, backgroundColor: roleStyle.backgroundColor }}>{user.role}</span>
                                                        <p className="rbac-meta">{user.isAdmin ? '관리자' : '일반 사용자'}</p>
                                                    </div>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <p className="rbac-name" style={{ fontSize: 'var(--font-size-sm)' }}>{user.permissions.length}개 권한</p>
                                                        <p className="rbac-meta">마지막 로그인: {user.lastLogin ? formatDate(user.lastLogin) : '없음'}</p>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                                                        <button type="button" onClick={() => setSelectedUser(user)} className="rbac-action-btn" title="상세 보기">
                                                            <Eye className="h-4 w-4" aria-hidden />
                                                        </button>
                                                        <button type="button" onClick={() => { /* 사용자 편집 */ }} className="rbac-action-btn" title="편집">
                                                            <Edit className="h-4 w-4" aria-hidden />
                                                        </button>
                                                        <button type="button" onClick={() => { /* 사용자 삭제 */ }} className="rbac-action-btn danger" title="삭제">
                                                            <Trash2 className="h-4 w-4" aria-hidden />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'roles' && (
                    <motion.div key="roles" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <div className="rbac-card">
                            <div className="rbac-card-header">
                                <h3 className="rbac-card-title">역할 관리</h3>
                            </div>
                            <div>
                                {roles.map((role) => {
                                    const roleStyle = getRoleBadgeStyle(role.color);
                                    return (
                                        <div key={role.id} className="rbac-row">
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                                    <div className="rbac-role-icon" style={{ backgroundColor: roleStyle.backgroundColor, color: roleStyle.color }}>
                                                        <Shield className="h-5 w-5" aria-hidden />
                                                    </div>
                                                    <div>
                                                        <h4 className="rbac-name">{role.name}</h4>
                                                        <p className="rbac-email">{role.description}</p>
                                                        <p className="rbac-meta">레벨: {role.level} • 사용자: {role.userCount}명</p>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <p className="rbac-name" style={{ fontSize: 'var(--font-size-sm)' }}>{role.permissions.length}개 권한</p>
                                                        <p className="rbac-meta">{role.isSystem ? '시스템 역할' : '사용자 정의'}</p>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                                                        <button type="button" onClick={() => setSelectedRole(role)} className="rbac-action-btn" title="상세 보기">
                                                            <Eye className="h-4 w-4" aria-hidden />
                                                        </button>
                                                        {!role.isSystem && (
                                                            <>
                                                                <button type="button" onClick={() => { /* 역할 편집 */ }} className="rbac-action-btn" title="편집">
                                                                    <Edit className="h-4 w-4" aria-hidden />
                                                                </button>
                                                                <button type="button" onClick={() => { /* 역할 삭제 */ }} className="rbac-action-btn danger" title="삭제">
                                                                    <Trash2 className="h-4 w-4" aria-hidden />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'permissions' && (
                    <motion.div key="permissions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <div className="rbac-card">
                            <div className="rbac-card-header">
                                <h3 className="rbac-card-title">권한 관리</h3>
                            </div>
                            <div style={{ padding: 'var(--spacing-lg)' }}>
                                <div className="rbac-perm-grid">
                                    {permissions.map((permission) => {
                                        const badgeStyle = permission.isSystem
                                            ? { color: 'var(--accent-info)', backgroundColor: 'var(--accent-info-muted)' }
                                            : { color: 'var(--accent-success)', backgroundColor: 'var(--accent-success-muted)' };
                                        return (
                                            <div key={permission.id} className="rbac-perm-card">
                                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
                                                    <h4 className="rbac-name">{permission.name}</h4>
                                                    <span className="rbac-badge" style={badgeStyle}>
                                                        {permission.isSystem ? '시스템' : '사용자'}
                                                    </span>
                                                </div>
                                                <p className="rbac-email" style={{ marginBottom: 'var(--spacing-sm)' }}>{permission.description}</p>
                                                <p className="rbac-meta">카테고리: {permission.category}</p>
                                                {permission.dependencies.length > 0 && (
                                                    <p className="rbac-meta">의존성: {permission.dependencies.join(', ')}</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'audit' && (
                    <motion.div key="audit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <div className="rbac-card">
                            <div className="rbac-card-header">
                                <h3 className="rbac-card-title">감사 로그</h3>
                            </div>
                            <div>
                                {auditLogs.map((log) => {
                                    const auditStyle = getAuditStatusStyle(log.status);
                                    const Icon = log.status === 'success' ? CheckCircle : log.status === 'failure' ? XCircle : AlertTriangle;
                                    return (
                                        <div key={log.id} className="rbac-row">
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                                    <div className="rbac-audit-icon" style={{ backgroundColor: auditStyle.backgroundColor, color: auditStyle.color }}>
                                                        <Icon className="h-4 w-4" aria-hidden />
                                                    </div>
                                                    <div>
                                                        <h4 className="rbac-name">{log.userName}</h4>
                                                        <p className="rbac-email">{log.action} • {log.resource}</p>
                                                        <p className="rbac-meta">{formatDate(log.timestamp)}</p>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p className="rbac-email">{log.ipAddress}</p>
                                                    <p className="rbac-meta">{log.userAgent}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'settings' && (
                    <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <div className="rbac-settings-grid">
                            <div className="rbac-card rbac-settings-card">
                                <h3 className="rbac-card-title" style={{ marginBottom: 'var(--spacing-md)' }}>보안 설정</h3>
                                <div className="rbac-settings-row">
                                    <div>
                                        <p className="rbac-settings-title">2단계 인증</p>
                                        <p className="rbac-settings-desc">모든 사용자에게 2단계 인증 요구</p>
                                    </div>
                                    <button type="button" className="rbac-toggle on" aria-label="2단계 인증"><span className="rbac-toggle-thumb" /></button>
                                </div>
                                <div className="rbac-settings-row">
                                    <div>
                                        <p className="rbac-settings-title">세션 타임아웃</p>
                                        <p className="rbac-settings-desc">자동 로그아웃 시간 설정</p>
                                    </div>
                                    <select className="bw-input" style={{ width: 'auto', minWidth: 100 }}>
                                        <option>30분</option>
                                        <option>1시간</option>
                                        <option>4시간</option>
                                        <option>24시간</option>
                                    </select>
                                </div>
                            </div>
                            <div className="rbac-card rbac-settings-card">
                                <h3 className="rbac-card-title" style={{ marginBottom: 'var(--spacing-md)' }}>알림 설정</h3>
                                <div className="rbac-settings-row">
                                    <div>
                                        <p className="rbac-settings-title">로그인 알림</p>
                                        <p className="rbac-settings-desc">새로운 로그인 시 알림</p>
                                    </div>
                                    <button type="button" className="rbac-toggle on" aria-label="로그인 알림"><span className="rbac-toggle-thumb" /></button>
                                </div>
                                <div className="rbac-settings-row">
                                    <div>
                                        <p className="rbac-settings-title">권한 변경 알림</p>
                                        <p className="rbac-settings-desc">권한 변경 시 관리자에게 알림</p>
                                    </div>
                                    <button type="button" className="rbac-toggle on" aria-label="권한 변경 알림"><span className="rbac-toggle-thumb" /></button>
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
