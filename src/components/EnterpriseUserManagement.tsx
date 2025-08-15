import React, { useState, useEffect } from 'react';

interface Organization {
    id: string;
    name: string;
    domain: string;
    plan: 'basic' | 'professional' | 'enterprise';
    memberCount: number;
    maxMembers: number;
    status: 'active' | 'suspended' | 'pending';
    createdAt: string;
    adminEmail: string;
}

interface Department {
    id: string;
    name: string;
    description: string;
    managerId: string;
    memberCount: number;
    parentDepartmentId?: string;
    level: number;
    status: 'active' | 'inactive';
}

interface EnterpriseUser {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'super_admin' | 'admin' | 'manager' | 'user' | 'guest';
    departmentId: string;
    organizationId: string;
    status: 'active' | 'inactive' | 'suspended' | 'pending';
    permissions: string[];
    lastLogin: string;
    createdAt: string;
    profileImage?: string;
    phone?: string;
    position?: string;
    managerId?: string;
    directReports: string[];
}

interface AuditLog {
    id: string;
    timestamp: string;
    userId: string;
    action: string;
    resource: string;
    details: string;
    ipAddress: string;
    userAgent: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

interface EnterpriseUserManagementProps {
    onUserCreate: (user: Omit<EnterpriseUser, 'id' | 'createdAt'>) => void;
    onUserUpdate: (userId: string, updates: Partial<EnterpriseUser>) => void;
    onUserDelete: (userId: string) => void;
    onOrganizationUpdate: (orgId: string, updates: Partial<Organization>) => void;
    onAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
}

const EnterpriseUserManagement: React.FC<EnterpriseUserManagementProps> = ({
    onUserCreate,
    onUserUpdate,
    onUserDelete,
    onOrganizationUpdate,
    onAuditLog
}) => {
    const [organizations, setOrganizations] = useState<Organization[]>([
        {
            id: '1',
            name: 'CORBU AI Corporation',
            domain: 'corbu.ai',
            plan: 'enterprise',
            memberCount: 45,
            maxMembers: 100,
            status: 'active',
            createdAt: '2024-01-01',
            adminEmail: 'admin@corbu.ai'
        },
        {
            id: '2',
            name: 'Tech Solutions Inc',
            domain: 'techsolutions.com',
            plan: 'professional',
            memberCount: 12,
            maxMembers: 25,
            status: 'active',
            createdAt: '2024-06-15',
            adminEmail: 'admin@techsolutions.com'
        }
    ]);

    const [departments, setDepartments] = useState<Department[]>([
        {
            id: '1',
            name: '개발팀',
            description: '소프트웨어 개발 및 유지보수',
            managerId: '1',
            memberCount: 15,
            level: 1,
            status: 'active'
        },
        {
            id: '2',
            name: '디자인팀',
            description: 'UI/UX 디자인 및 브랜딩',
            managerId: '2',
            memberCount: 8,
            level: 1,
            status: 'active'
        },
        {
            id: '3',
            name: '마케팅팀',
            description: '마케팅 및 홍보 활동',
            managerId: '3',
            memberCount: 6,
            level: 1,
            status: 'active'
        },
        {
            id: '4',
            name: '프론트엔드 개발',
            description: '프론트엔드 개발 전담',
            managerId: '4',
            memberCount: 7,
            parentDepartmentId: '1',
            level: 2,
            status: 'active'
        }
    ]);

    const [users, setUsers] = useState<EnterpriseUser[]>([
        {
            id: '1',
            username: 'admin',
            email: 'admin@corbu.ai',
            firstName: '관리자',
            lastName: '김',
            role: 'super_admin',
            departmentId: '1',
            organizationId: '1',
            status: 'active',
            permissions: ['all'],
            lastLogin: '2025-01-27 14:30',
            createdAt: '2024-01-01',
            position: 'CEO',
            phone: '010-1234-5678',
            directReports: []
        },
        {
            id: '2',
            username: 'manager1',
            email: 'manager1@corbu.ai',
            firstName: '팀장',
            lastName: '이',
            role: 'manager',
            departmentId: '1',
            organizationId: '1',
            status: 'active',
            permissions: ['read', 'write', 'manage_team'],
            lastLogin: '2025-01-27 14:25',
            createdAt: '2024-02-01',
            position: '개발팀장',
            phone: '010-2345-6789',
            directReports: ['4', '5', '6']
        },
        {
            id: '3',
            username: 'user1',
            email: 'user1@corbu.ai',
            firstName: '개발자',
            lastName: '박',
            role: 'user',
            departmentId: '4',
            organizationId: '1',
            status: 'active',
            permissions: ['read', 'write'],
            lastLogin: '2025-01-27 14:20',
            createdAt: '2024-03-01',
            position: '프론트엔드 개발자',
            phone: '010-3456-7890',
            managerId: '2',
            directReports: []
        }
    ]);

    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
        {
            id: '1',
            timestamp: '2025-01-27 14:30:00',
            userId: '1',
            action: '로그인',
            resource: '시스템',
            details: '관리자 로그인 성공',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            severity: 'low'
        },
        {
            id: '2',
            timestamp: '2025-01-27 14:25:00',
            userId: '1',
            action: '사용자 생성',
            resource: '사용자 관리',
            details: '새 사용자 user3@corbu.ai 생성',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            severity: 'medium'
        }
    ]);

    const [selectedTab, setSelectedTab] = useState<'organizations' | 'departments' | 'users' | 'audit'>('organizations');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterRole, setFilterRole] = useState<string>('all');

    // 검색 및 필터링
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
        const matchesRole = filterRole === 'all' || user.role === filterRole;

        return matchesSearch && matchesStatus && matchesRole;
    });

    const handleUserCreate = (userData: Omit<EnterpriseUser, 'id' | 'createdAt'>) => {
        const newUser: EnterpriseUser = {
            ...userData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString().split('T')[0]
        };

        setUsers(prev => [...prev, newUser]);
        onUserCreate(userData);

        // 감사 로그 추가
        const auditLog: AuditLog = {
            id: Date.now().toString(),
            timestamp: new Date().toLocaleString(),
            userId: '1', // 현재 로그인한 사용자
            action: '사용자 생성',
            resource: '사용자 관리',
            details: `새 사용자 ${userData.email} 생성`,
            ipAddress: '192.168.1.100',
            userAgent: navigator.userAgent,
            severity: 'medium'
        };

        setAuditLogs(prev => [auditLog, ...prev]);
        onAuditLog({
            userId: '1',
            action: '사용자 생성',
            resource: '사용자 관리',
            details: `새 사용자 ${userData.email} 생성`,
            ipAddress: '192.168.1.100',
            userAgent: navigator.userAgent,
            severity: 'medium'
        });
    };

    const handleUserUpdate = (userId: string, updates: Partial<EnterpriseUser>) => {
        setUsers(prev => prev.map(user =>
            user.id === userId ? { ...user, ...updates } : user
        ));
        onUserUpdate(userId, updates);
    };

    const handleUserDelete = (userId: string) => {
        const user = users.find(u => u.id === userId);
        setUsers(prev => prev.filter(user => user.id !== userId));
        onUserDelete(userId);

        // 감사 로그 추가
        const auditLog: AuditLog = {
            id: Date.now().toString(),
            timestamp: new Date().toLocaleString(),
            userId: '1',
            action: '사용자 삭제',
            resource: '사용자 관리',
            details: `사용자 ${user?.email} 삭제`,
            ipAddress: '192.168.1.100',
            userAgent: navigator.userAgent,
            severity: 'high'
        };

        setAuditLogs(prev => [auditLog, ...prev]);
    };

    const getRoleColor = (role: EnterpriseUser['role']) => {
        switch (role) {
            case 'super_admin': return '#dc2626';
            case 'admin': return '#7c3aed';
            case 'manager': return '#059669';
            case 'user': return '#3b82f6';
            case 'guest': return '#6b7280';
            default: return '#6b7280';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return '#10b981';
            case 'inactive': return '#6b7280';
            case 'suspended': return '#dc2626';
            case 'pending': return '#f59e0b';
            default: return '#6b7280';
        }
    };

    const getSeverityColor = (severity: AuditLog['severity']) => {
        switch (severity) {
            case 'low': return '#10b981';
            case 'medium': return '#f59e0b';
            case 'high': return '#dc2626';
            case 'critical': return '#7c2d12';
            default: return '#6b7280';
        }
    };

    const getDepartmentName = (departmentId: string) => {
        const dept = departments.find(d => d.id === departmentId);
        return dept?.name || 'Unknown';
    };

    return (
        <div className="enterprise-user-management">
            <div className="management-header">
                <h2>🏢 엔터프라이즈 사용자 관리</h2>
                <div className="header-controls">
                    <button
                        className="create-btn"
                        onClick={() => setShowCreateModal(true)}
                    >
                        + 새 사용자
                    </button>
                </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="tab-navigation">
                <button
                    className={`tab-btn ${selectedTab === 'organizations' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('organizations')}
                >
                    조직 ({organizations.length})
                </button>
                <button
                    className={`tab-btn ${selectedTab === 'departments' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('departments')}
                >
                    부서 ({departments.length})
                </button>
                <button
                    className={`tab-btn ${selectedTab === 'users' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('users')}
                >
                    사용자 ({users.length})
                </button>
                <button
                    className={`tab-btn ${selectedTab === 'audit' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('audit')}
                >
                    감사 로그 ({auditLogs.length})
                </button>
            </div>

            {/* 검색 및 필터 */}
            {selectedTab === 'users' && (
                <div className="search-filters">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="사용자명, 이메일, 이름으로 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="filters">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="filter-select"
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
                            className="filter-select"
                        >
                            <option value="all">모든 역할</option>
                            <option value="super_admin">슈퍼 관리자</option>
                            <option value="admin">관리자</option>
                            <option value="manager">매니저</option>
                            <option value="user">사용자</option>
                            <option value="guest">게스트</option>
                        </select>
                    </div>
                </div>
            )}

            {/* 조직 관리 */}
            {selectedTab === 'organizations' && (
                <div className="organizations-section">
                    <div className="organizations-grid">
                        {organizations.map(org => (
                            <div key={org.id} className="organization-card">
                                <div className="org-header">
                                    <h3>{org.name}</h3>
                                    <span
                                        className="org-status"
                                        style={{ backgroundColor: getStatusColor(org.status) }}
                                    >
                                        {org.status === 'active' && '활성'}
                                        {org.status === 'suspended' && '정지'}
                                        {org.status === 'pending' && '대기'}
                                    </span>
                                </div>
                                <div className="org-details">
                                    <p><strong>도메인:</strong> {org.domain}</p>
                                    <p><strong>플랜:</strong> {org.plan}</p>
                                    <p><strong>멤버:</strong> {org.memberCount}/{org.maxMembers}</p>
                                    <p><strong>관리자:</strong> {org.adminEmail}</p>
                                    <p><strong>생성일:</strong> {org.createdAt}</p>
                                </div>
                                <div className="org-actions">
                                    <button className="edit-btn">편집</button>
                                    <button className="view-btn">상세보기</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 부서 관리 */}
            {selectedTab === 'departments' && (
                <div className="departments-section">
                    <div className="departments-list">
                        {departments.map(dept => (
                            <div key={dept.id} className="department-item">
                                <div className="dept-info">
                                    <h4>{dept.name}</h4>
                                    <p>{dept.description}</p>
                                    <div className="dept-meta">
                                        <span>멤버: {dept.memberCount}명</span>
                                        <span>레벨: {dept.level}</span>
                                        <span
                                            className="dept-status"
                                            style={{ backgroundColor: getStatusColor(dept.status) }}
                                        >
                                            {dept.status === 'active' && '활성'}
                                            {dept.status === 'inactive' && '비활성'}
                                        </span>
                                    </div>
                                </div>
                                <div className="dept-actions">
                                    <button className="edit-btn">편집</button>
                                    <button className="view-btn">상세보기</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 사용자 관리 */}
            {selectedTab === 'users' && (
                <div className="users-section">
                    <div className="users-table">
                        <div className="table-header">
                            <div className="header-cell">사용자</div>
                            <div className="header-cell">역할</div>
                            <div className="header-cell">부서</div>
                            <div className="header-cell">상태</div>
                            <div className="header-cell">마지막 로그인</div>
                            <div className="header-cell">작업</div>
                        </div>
                        <div className="table-body">
                            {filteredUsers.map(user => (
                                <div key={user.id} className="table-row">
                                    <div className="table-cell user-info">
                                        <div className="user-avatar">
                                            {user.profileImage ? (
                                                <img src={user.profileImage} alt={user.username} />
                                            ) : (
                                                <div className="avatar-placeholder">
                                                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="user-details">
                                            <div className="user-name">{user.firstName} {user.lastName}</div>
                                            <div className="user-email">{user.email}</div>
                                            {user.position && <div className="user-position">{user.position}</div>}
                                        </div>
                                    </div>
                                    <div className="table-cell">
                                        <span
                                            className="role-badge"
                                            style={{ backgroundColor: getRoleColor(user.role) }}
                                        >
                                            {user.role === 'super_admin' && '슈퍼 관리자'}
                                            {user.role === 'admin' && '관리자'}
                                            {user.role === 'manager' && '매니저'}
                                            {user.role === 'user' && '사용자'}
                                            {user.role === 'guest' && '게스트'}
                                        </span>
                                    </div>
                                    <div className="table-cell">
                                        {getDepartmentName(user.departmentId)}
                                    </div>
                                    <div className="table-cell">
                                        <span
                                            className="status-badge"
                                            style={{ backgroundColor: getStatusColor(user.status) }}
                                        >
                                            {user.status === 'active' && '활성'}
                                            {user.status === 'inactive' && '비활성'}
                                            {user.status === 'suspended' && '정지'}
                                            {user.status === 'pending' && '대기'}
                                        </span>
                                    </div>
                                    <div className="table-cell">
                                        {user.lastLogin}
                                    </div>
                                    <div className="table-cell">
                                        <div className="action-buttons">
                                            <button
                                                className="edit-btn"
                                                onClick={() => {
                                                    setSelectedItem(user);
                                                    setShowEditModal(true);
                                                }}
                                            >
                                                편집
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleUserDelete(user.id)}
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 감사 로그 */}
            {selectedTab === 'audit' && (
                <div className="audit-section">
                    <div className="audit-logs">
                        {auditLogs.map(log => (
                            <div key={log.id} className="audit-item">
                                <div className="audit-header">
                                    <span
                                        className="severity-badge"
                                        style={{ backgroundColor: getSeverityColor(log.severity) }}
                                    >
                                        {log.severity}
                                    </span>
                                    <span className="audit-time">{log.timestamp}</span>
                                </div>
                                <div className="audit-content">
                                    <div className="audit-action">
                                        <strong>{log.action}</strong> - {log.resource}
                                    </div>
                                    <div className="audit-details">{log.details}</div>
                                    <div className="audit-meta">
                                        <span>사용자 ID: {log.userId}</span>
                                        <span>IP: {log.ipAddress}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 사용자 생성 모달 */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="create-user-modal">
                        <h3>새 사용자 생성</h3>
                        <div className="modal-content">
                            <div className="form-group">
                                <label>사용자명</label>
                                <input type="text" placeholder="사용자명 입력" />
                            </div>
                            <div className="form-group">
                                <label>이메일</label>
                                <input type="email" placeholder="이메일 입력" />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>이름</label>
                                    <input type="text" placeholder="이름 입력" />
                                </div>
                                <div className="form-group">
                                    <label>성</label>
                                    <input type="text" placeholder="성 입력" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>역할</label>
                                <select>
                                    <option value="user">사용자</option>
                                    <option value="manager">매니저</option>
                                    <option value="admin">관리자</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>부서</label>
                                <select>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setShowCreateModal(false)}>
                                취소
                            </button>
                            <button className="create-btn">
                                생성
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnterpriseUserManagement;
