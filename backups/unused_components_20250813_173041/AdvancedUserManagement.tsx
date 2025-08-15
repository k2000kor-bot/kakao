import React, { useState, useEffect } from 'react';
import {
    UserGroupIcon,
    UserIcon,
    CogIcon,
    ShieldCheckIcon,
    ChartBarIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    PencilIcon,
    TrashIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    EyeIcon,
    KeyIcon,
    BellIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';

interface User {
    id: string;
    username: string;
    email: string;
    fullName: string;
    role: 'admin' | 'manager' | 'user' | 'guest';
    status: 'active' | 'inactive' | 'suspended' | 'pending';
    avatar?: string;
    lastLogin: Date;
    createdAt: Date;
    permissions: string[];
    department: string;
    phone?: string;
    location?: string;
    twoFactorEnabled: boolean;
    loginAttempts: number;
    lastPasswordChange: Date;
}

interface UserActivity {
    id: string;
    userId: string;
    action: 'login' | 'logout' | 'password_change' | 'permission_change' | 'profile_update';
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
    details: string;
}

interface UserStats {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    suspendedUsers: number;
    byRole: { [key: string]: number };
    byDepartment: { [key: string]: number };
}

interface AdvancedUserManagementProps {
    onUserUpdate?: (user: User) => void;
    onUserDelete?: (userId: string) => void;
    onUserCreate?: (user: Partial<User>) => void;
}

const AdvancedUserManagement: React.FC<AdvancedUserManagementProps> = ({
    onUserUpdate,
    onUserDelete,
    onUserCreate
}) => {
    const [users, setUsers] = useState<User[]>([]);
    const [activities, setActivities] = useState<UserActivity[]>([]);
    const [stats, setStats] = useState<UserStats>({
        totalUsers: 0,
        activeUsers: 0,
        newUsersThisMonth: 0,
        suspendedUsers: 0,
        byRole: {},
        byDepartment: {}
    });
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'activities' | 'roles'>('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [filterRole, setFilterRole] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // 시뮬레이션된 사용자 데이터
    useEffect(() => {
        const mockUsers: User[] = [
            {
                id: '1',
                username: 'admin',
                email: 'admin@corbu.ai',
                fullName: '관리자',
                role: 'admin',
                status: 'active',
                lastLogin: new Date(Date.now() - 30 * 60 * 1000),
                createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
                permissions: ['read', 'write', 'delete', 'admin'],
                department: 'IT',
                phone: '010-1234-5678',
                location: '서울',
                twoFactorEnabled: true,
                loginAttempts: 0,
                lastPasswordChange: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            },
            {
                id: '2',
                username: 'manager1',
                email: 'manager1@corbu.ai',
                fullName: '김매니저',
                role: 'manager',
                status: 'active',
                lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
                createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
                permissions: ['read', 'write'],
                department: '마케팅',
                phone: '010-2345-6789',
                location: '부산',
                twoFactorEnabled: false,
                loginAttempts: 0,
                lastPasswordChange: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
            },
            {
                id: '3',
                username: 'user1',
                email: 'user1@corbu.ai',
                fullName: '이사용자',
                role: 'user',
                status: 'active',
                lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000),
                createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
                permissions: ['read'],
                department: '개발',
                phone: '010-3456-7890',
                location: '대구',
                twoFactorEnabled: true,
                loginAttempts: 0,
                lastPasswordChange: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
            },
            {
                id: '4',
                username: 'guest1',
                email: 'guest1@corbu.ai',
                fullName: '박게스트',
                role: 'guest',
                status: 'inactive',
                lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                permissions: ['read'],
                department: '영업',
                phone: '010-4567-8901',
                location: '인천',
                twoFactorEnabled: false,
                loginAttempts: 3,
                lastPasswordChange: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
            },
            {
                id: '5',
                username: 'suspended_user',
                email: 'suspended@corbu.ai',
                fullName: '정정지',
                role: 'user',
                status: 'suspended',
                lastLogin: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
                createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
                permissions: ['read'],
                department: '디자인',
                phone: '010-5678-9012',
                location: '광주',
                twoFactorEnabled: false,
                loginAttempts: 5,
                lastPasswordChange: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
            }
        ];

        setUsers(mockUsers);

        // 통계 계산
        const byRole = mockUsers.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });

        const byDepartment = mockUsers.reduce((acc, user) => {
            acc[user.department] = (acc[user.department] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });

        setStats({
            totalUsers: mockUsers.length,
            activeUsers: mockUsers.filter(u => u.status === 'active').length,
            newUsersThisMonth: mockUsers.filter(u => u.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
            suspendedUsers: mockUsers.filter(u => u.status === 'suspended').length,
            byRole,
            byDepartment
        });
    }, []);

    // 시뮬레이션된 활동 데이터
    useEffect(() => {
        const mockActivities: UserActivity[] = [
            {
                id: '1',
                userId: '1',
                action: 'login',
                timestamp: new Date(Date.now() - 30 * 60 * 1000),
                ipAddress: '192.168.1.100',
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                details: '관리자 로그인 성공'
            },
            {
                id: '2',
                userId: '2',
                action: 'login',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                ipAddress: '192.168.1.101',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                details: '매니저 로그인 성공'
            },
            {
                id: '3',
                userId: '3',
                action: 'password_change',
                timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
                ipAddress: '192.168.1.102',
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                details: '비밀번호 변경'
            },
            {
                id: '4',
                userId: '4',
                action: 'login',
                timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                ipAddress: '203.241.xxx.xxx',
                userAgent: 'Unknown',
                details: '로그인 실패 - 잘못된 비밀번호'
            }
        ];

        setActivities(mockActivities);
    }, []);

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'text-red-600 bg-red-50';
            case 'manager': return 'text-blue-600 bg-blue-50';
            case 'user': return 'text-green-600 bg-green-50';
            case 'guest': return 'text-gray-600 bg-gray-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-50';
            case 'inactive': return 'text-gray-600 bg-gray-50';
            case 'suspended': return 'text-red-600 bg-red-50';
            case 'pending': return 'text-yellow-600 bg-yellow-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'login': return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
            case 'logout': return <XCircleIcon className="w-4 h-4 text-gray-500" />;
            case 'password_change': return <KeyIcon className="w-4 h-4 text-blue-500" />;
            case 'permission_change': return <ShieldCheckIcon className="w-4 h-4 text-purple-500" />;
            case 'profile_update': return <PencilIcon className="w-4 h-4 text-orange-500" />;
            default: return <ClockIcon className="w-4 h-4 text-gray-500" />;
        }
    };

    const toggleUserStatus = (userId: string) => {
        setUsers(prev =>
            prev.map(user => {
                if (user.id === userId) {
                    const newStatus = user.status === 'active' ? 'suspended' : 'active';
                    return { ...user, status: newStatus };
                }
                return user;
            })
        );
    };

    const toggleSelection = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const deleteSelectedUsers = () => {
        setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
        setSelectedUsers([]);
        selectedUsers.forEach(id => onUserDelete?.(id));
    };

    const filteredUsers = users.filter(user => {
        if (searchQuery) {
            return user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.fullName.toLowerCase().includes(searchQuery.toLowerCase());
        }
        if (filterRole !== 'all' && user.role !== filterRole) return false;
        if (filterStatus !== 'all' && user.status !== filterStatus) return false;
        return true;
    });

    const renderOverview = () => (
        <div className="space-y-6">
            {/* 사용자 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">총 사용자</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                        </div>
                        <UserGroupIcon className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">활성 사용자</p>
                            <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
                        </div>
                        <CheckCircleIcon className="w-8 h-8 text-green-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">이번 달 신규</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.newUsersThisMonth}</p>
                        </div>
                        <CalendarIcon className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">정지된 사용자</p>
                            <p className="text-2xl font-bold text-red-600">{stats.suspendedUsers}</p>
                        </div>
                        <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
                    </div>
                </div>
            </div>

            {/* 역할별 분포 */}
            <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">역할별 사용자 분포</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(stats.byRole).map(([role, count]) => (
                        <div key={role} className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-600">
                                {role === 'admin' ? '관리자' :
                                    role === 'manager' ? '매니저' :
                                        role === 'user' ? '사용자' : '게스트'}
                            </p>
                            <p className="text-2xl font-bold text-gray-900">{count}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 최근 활동 */}
            <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">최근 사용자 활동</h3>
                    <button
                        onClick={() => setActiveTab('activities')}
                        className="text-sm text-blue-600 hover:text-blue-700"
                    >
                        모든 활동 보기
                    </button>
                </div>

                <div className="space-y-3">
                    {activities.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            {getActionIcon(activity.action)}

                            <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-900">{activity.details}</span>
                                    <span className="text-xs text-gray-500">{activity.ipAddress}</span>
                                </div>
                                <p className="text-xs text-gray-500">{activity.timestamp.toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">사용자 관리</h3>

            <div className="space-y-4">
                {filteredUsers.map((user) => (
                    <div key={user.id} className="bg-white rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.includes(user.id)}
                                    onChange={() => toggleSelection(user.id)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />

                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                    <UserIcon className="w-6 h-6 text-gray-500" />
                                </div>

                                <div>
                                    <div className="flex items-center space-x-2">
                                        <span className="font-medium text-gray-900">{user.fullName}</span>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                            {user.role === 'admin' ? '관리자' :
                                                user.role === 'manager' ? '매니저' :
                                                    user.role === 'user' ? '사용자' : '게스트'}
                                        </span>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                            {user.status === 'active' ? '활성' :
                                                user.status === 'inactive' ? '비활성' :
                                                    user.status === 'suspended' ? '정지' : '대기'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">{user.email}</p>
                                    <p className="text-xs text-gray-500">{user.department} • {user.location}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="text-sm text-gray-900">마지막 로그인</p>
                                    <p className="text-xs text-gray-500">{user.lastLogin.toLocaleDateString()}</p>
                                </div>

                                <div className="flex space-x-2">
                                    {user.twoFactorEnabled && (
                                        <ShieldCheckIcon className="w-5 h-5 text-green-500" title="2FA 활성화" />
                                    )}
                                    {user.loginAttempts > 0 && (
                                        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" title={`로그인 시도: ${user.loginAttempts}회`} />
                                    )}

                                    <button
                                        onClick={() => toggleUserStatus(user.id)}
                                        className={`px-3 py-1 text-sm rounded ${user.status === 'active'
                                            ? 'bg-red-500 text-white hover:bg-red-600'
                                            : 'bg-green-500 text-white hover:bg-green-600'
                                            }`}
                                    >
                                        {user.status === 'active' ? '정지' : '활성화'}
                                    </button>

                                    <button className="p-1 text-gray-400 hover:text-blue-500">
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderActivities = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">사용자 활동 로그</h3>

            <div className="space-y-3">
                {activities.map((activity) => (
                    <div key={activity.id} className="bg-white rounded-lg border p-4">
                        <div className="flex items-center space-x-3">
                            {getActionIcon(activity.action)}

                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{activity.details}</p>
                                        <p className="text-xs text-gray-500">
                                            {activity.ipAddress} • {activity.userAgent}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-500">{activity.timestamp.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderRoles = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">역할 및 권한 관리</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border p-6">
                    <h4 className="font-medium text-gray-900 mb-4">역할별 권한</h4>
                    <div className="space-y-4">
                        <div className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-900">관리자</span>
                                <span className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">최고 권한</span>
                            </div>
                            <p className="text-sm text-gray-600">모든 기능에 대한 완전한 접근 권한</p>
                            <p className="text-xs text-gray-500 mt-1">권한: 읽기, 쓰기, 삭제, 관리</p>
                        </div>

                        <div className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-900">매니저</span>
                                <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">관리 권한</span>
                            </div>
                            <p className="text-sm text-gray-600">팀 관리 및 프로젝트 관리 권한</p>
                            <p className="text-xs text-gray-500 mt-1">권한: 읽기, 쓰기</p>
                        </div>

                        <div className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-900">사용자</span>
                                <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">일반 권한</span>
                            </div>
                            <p className="text-sm text-gray-600">기본 기능 사용 권한</p>
                            <p className="text-xs text-gray-500 mt-1">권한: 읽기</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border p-6">
                    <h4 className="font-medium text-gray-900 mb-4">보안 설정</h4>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">2단계 인증</span>
                            <span className="text-sm font-medium text-green-600">활성화됨</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">세션 타임아웃</span>
                            <span className="text-sm font-medium text-gray-900">30분</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">비밀번호 정책</span>
                            <span className="text-sm font-medium text-green-600">적용됨</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">로그인 시도 제한</span>
                            <span className="text-sm font-medium text-gray-900">5회</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* 헤더 */}
            <div className="bg-white border-b px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <UserGroupIcon className="w-6 h-6 text-blue-500" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">고급 사용자 관리</h3>
                            <p className="text-sm text-gray-500">사용자 계정 및 권한 관리</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200" title="설정">
                            <CogIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 검색 및 필터 */}
            <div className="bg-white border-b px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="사용자 검색..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">모든 역할</option>
                            <option value="admin">관리자</option>
                            <option value="manager">매니저</option>
                            <option value="user">사용자</option>
                            <option value="guest">게스트</option>
                        </select>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">모든 상태</option>
                            <option value="active">활성</option>
                            <option value="inactive">비활성</option>
                            <option value="suspended">정지</option>
                            <option value="pending">대기</option>
                        </select>
                    </div>

                    <div className="flex space-x-2">
                        {selectedUsers.length > 0 && (
                            <button
                                onClick={deleteSelectedUsers}
                                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center space-x-2"
                            >
                                <TrashIcon className="w-4 h-4" />
                                <span>삭제 ({selectedUsers.length})</span>
                            </button>
                        )}
                        <button className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2">
                            <PlusIcon className="w-4 h-4" />
                            <span>사용자 추가</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="bg-white border-b">
                <nav className="flex space-x-8 px-4">
                    {[
                        { id: 'overview', name: '개요', icon: ChartBarIcon },
                        { id: 'users', name: '사용자', icon: UserGroupIcon },
                        { id: 'activities', name: '활동', icon: ClockIcon },
                        { id: 'roles', name: '역할', icon: ShieldCheckIcon }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.name}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'users' && renderUsers()}
                {activeTab === 'activities' && renderActivities()}
                {activeTab === 'roles' && renderRoles()}
            </div>
        </div>
    );
};

export default AdvancedUserManagement;
