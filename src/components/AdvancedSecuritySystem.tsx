import React, { useState, useEffect } from 'react';
import {
  StarIcon,
    ShieldCheckIcon,
    LockClosedIcon,
    EyeIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    UsersIcon,
    ChatBubbleLeftRightIcon,
    MagnifyingGlassIcon,
    CogIcon,
    RocketLaunchIcon,
    AcademicCapIcon,
    BeakerIcon,
    TrophyIcon,
    CalendarIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    Bars3Icon,
    ArrowPathIcon,
    LightBulbIcon,
    HandRaisedIcon,
    FaceSmileIcon,
    BookOpenIcon,
    InformationCircleIcon,
    PlayIcon,
    PauseIcon,
    FireIcon,
    BoltIcon,
    HeartIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';

interface SecurityEvent {
    id: string;
    timestamp: number;
    type: 'access' | 'modification' | 'security' | 'error' | 'warning';
    severity: 'low' | 'medium' | 'high' | 'critical';
    user: string;
    action: string;
    resource: string;
    ip_address: string;
    user_agent: string;
    details: string;
}

interface UserPermission {
    id: string;
    username: string;
    role: 'admin' | 'analyst' | 'viewer' | 'guest';
    permissions: string[];
    last_login: string;
    status: 'active' | 'suspended' | 'locked';
    failed_attempts: number;
    session_duration: number;
}

interface SecurityMetrics {
    total_events: number;
    critical_events: number;
    failed_logins: number;
    active_sessions: number;
    blocked_ips: number;
    data_breaches: number;
    encryption_level: number;
    firewall_status: 'active' | 'warning' | 'error';
}

interface AdvancedSecuritySystemProps {
    isActive: boolean;
    onToggle: () => void;
}

const AdvancedSecuritySystem: React.FC<AdvancedSecuritySystemProps> = ({
    isActive,
    onToggle
}) => {
    const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([
        {
            id: '1',
            timestamp: Date.now() - 300000,
            type: 'access',
            severity: 'medium',
            user: 'admin@system.com',
            action: 'LOGIN_SUCCESS',
            resource: '/api/analytics',
            ip_address: '192.168.1.100',
            user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            details: '관리자 로그인 성공'
        },
        {
            id: '2',
            timestamp: Date.now() - 600000,
            type: 'security',
            severity: 'high',
            user: 'unknown',
            action: 'FAILED_LOGIN',
            resource: '/api/auth',
            ip_address: '203.241.xxx.xxx',
            user_agent: 'Unknown',
            details: '의심스러운 로그인 시도 감지'
        },
        {
            id: '3',
            timestamp: Date.now() - 900000,
            type: 'modification',
            severity: 'low',
            user: 'analyst@system.com',
            action: 'DATA_EXPORT',
            resource: '/api/data/export',
            ip_address: '192.168.1.101',
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            details: '데이터 내보내기 실행'
        },
        {
            id: '4',
            timestamp: Date.now() - 1200000,
            type: 'error',
            severity: 'critical',
            user: 'system',
            action: 'SYSTEM_ERROR',
            resource: '/api/ai/models',
            ip_address: '127.0.0.1',
            user_agent: 'System',
            details: 'AI 모델 로딩 실패'
        }
    ]);

    const [userPermissions, setUserPermissions] = useState<UserPermission[]>([
        {
            id: '1',
            username: 'admin@system.com',
            role: 'admin',
            permissions: ['read', 'write', 'delete', 'admin'],
            last_login: '2분 전',
            status: 'active',
            failed_attempts: 0,
            session_duration: 3600
        },
        {
            id: '2',
            username: 'analyst@system.com',
            role: 'analyst',
            permissions: ['read', 'write'],
            last_login: '15분 전',
            status: 'active',
            failed_attempts: 0,
            session_duration: 1800
        },
        {
            id: '3',
            username: 'viewer@system.com',
            role: 'viewer',
            permissions: ['read'],
            last_login: '1시간 전',
            status: 'active',
            failed_attempts: 0,
            session_duration: 900
        },
        {
            id: '4',
            username: 'suspicious@system.com',
            role: 'guest',
            permissions: ['read'],
            last_login: '5분 전',
            status: 'suspended',
            failed_attempts: 5,
            session_duration: 300
        }
    ]);

    const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
        total_events: 15420,
        critical_events: 23,
        failed_logins: 156,
        active_sessions: 12,
        blocked_ips: 8,
        data_breaches: 0,
        encryption_level: 95,
        firewall_status: 'active'
    });

    const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'users' | 'settings'>('overview');
    const [filterSeverity, setFilterSeverity] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');

    useEffect(() => {
        // 실시간 보안 이벤트 시뮬레이션
        const interval = setInterval(() => {
            const newEvent: SecurityEvent = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                type: ['access', 'modification', 'security', 'error', 'warning'][Math.floor(Math.random() * 5)] as any,
                severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
                user: ['admin@system.com', 'analyst@system.com', 'viewer@system.com', 'unknown'][Math.floor(Math.random() * 4)],
                action: ['LOGIN', 'LOGOUT', 'DATA_ACCESS', 'MODIFICATION', 'EXPORT'][Math.floor(Math.random() * 5)],
                resource: ['/api/auth', '/api/data', '/api/analytics', '/api/ai'][Math.floor(Math.random() * 4)],
                ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
                user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                details: '실시간 보안 이벤트'
            };

            setSecurityEvents(prev => [newEvent, ...prev.slice(0, 49)]); // 최대 50개 유지
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'text-red-600 bg-red-100';
            case 'high': return 'text-orange-600 bg-orange-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'low': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'access': return <EyeIcon className="w-4 h-4" />;
            case 'modification': return <CogIcon className="w-4 h-4" />;
            case 'security': return <ShieldCheckIcon className="w-4 h-4" />;
            case 'error': return <ExclamationTriangleIcon className="w-4 h-4" />;
            case 'warning': return <ExclamationTriangleIcon className="w-4 h-4" />;
            default: return <Bars3Icon className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-100';
            case 'suspended': return 'text-red-600 bg-red-100';
            case 'locked': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'text-purple-600 bg-purple-100';
            case 'analyst': return 'text-blue-600 bg-blue-100';
            case 'viewer': return 'text-green-600 bg-green-100';
            case 'guest': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const filteredEvents = securityEvents.filter(event => {
        if (filterSeverity !== 'all' && event.severity !== filterSeverity) return false;
        if (filterType !== 'all' && event.type !== filterType) return false;
        return true;
    });

    if (!isActive) {
        return (
            <div className="absolute bottom-4 right-4 z-50">
                <button
                    onClick={onToggle}
                    className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                >
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span>보안 시스템</span>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-6xl h-4/5 overflow-hidden">
                {/* 헤더 */}
                <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <ShieldCheckIcon className="w-6 h-6" />
                            <h3 className="font-semibold text-lg">고도화된 보안 및 권한 관리 시스템</h3>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-sm">보안 시스템 활성</span>
                            </div>
                            <button
                                onClick={onToggle}
                                className="text-white hover:text-gray-200 transition-colors"
                            >
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 탭 네비게이션 */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'overview'
                            ? 'text-red-600 border-b-2 border-red-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        보안 개요
                    </button>
                    <button
                        onClick={() => setActiveTab('events')}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'events'
                            ? 'text-red-600 border-b-2 border-red-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        보안 이벤트
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'users'
                            ? 'text-red-600 border-b-2 border-red-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        사용자 관리
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'settings'
                            ? 'text-red-600 border-b-2 border-red-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        보안 설정
                    </button>
                </div>

                {/* 컨텐츠 영역 */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* 보안 메트릭 */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">위험 이벤트</span>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <span className="text-2xl font-bold text-red-600">
                                            {securityMetrics.critical_events}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <LockClosedIcon className="w-5 h-5 text-orange-600" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">실패 로그인</span>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <span className="text-2xl font-bold text-orange-600">
                                            {securityMetrics.failed_logins}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <UsersIcon className="w-5 h-5 text-green-600" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">활성 세션</span>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <span className="text-2xl font-bold text-green-600">
                                            {securityMetrics.active_sessions}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">암호화 수준</span>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <span className="text-2xl font-bold text-blue-600">
                                            {securityMetrics.encryption_level}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 보안 상태 */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">시스템 보안 상태</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">방화벽 상태</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${securityMetrics.firewall_status === 'active'
                                                ? 'text-green-600 bg-green-100'
                                                : securityMetrics.firewall_status === 'warning'
                                                    ? 'text-yellow-600 bg-yellow-100'
                                                    : 'text-red-600 bg-red-100'
                                                }`}>
                                                {securityMetrics.firewall_status}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">차단된 IP</span>
                                            <span className="font-medium text-red-600">{securityMetrics.blocked_ips}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">데이터 침해</span>
                                            <span className="font-medium text-green-600">{securityMetrics.data_breaches}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">총 보안 이벤트</span>
                                            <span className="font-medium text-blue-600">{securityMetrics.total_events.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">최근 보안 이벤트</h4>
                                    <div className="space-y-3">
                                        {securityEvents.slice(0, 5).map(event => (
                                            <div key={event.id} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-600 rounded">
                                                {getTypeIcon(event.type)}
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {event.action}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {event.user} • {new Date(event.timestamp).toLocaleTimeString('ko-KR')}
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                                                    {event.severity}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'events' && (
                        <div className="space-y-6">
                            {/* 필터 */}
                            <div className="flex space-x-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        심각도 필터
                                    </label>
                                    <select
                                        value={filterSeverity}
                                        onChange={(e) => setFilterSeverity(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="all">모든 심각도</option>
                                        <option value="critical">위험</option>
                                        <option value="high">높음</option>
                                        <option value="medium">보통</option>
                                        <option value="low">낮음</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        이벤트 유형
                                    </label>
                                    <select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="all">모든 유형</option>
                                        <option value="access">접근</option>
                                        <option value="modification">수정</option>
                                        <option value="security">보안</option>
                                        <option value="error">오류</option>
                                        <option value="warning">경고</option>
                                    </select>
                                </div>
                            </div>

                            {/* 이벤트 목록 */}
                            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">보안 이벤트 로그</h4>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {filteredEvents.map(event => (
                                        <div key={event.id} className="p-4 border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center space-x-3">
                                                    {getTypeIcon(event.type)}
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {event.action}
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            {event.user} • {event.resource}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {event.ip_address} • {new Date(event.timestamp).toLocaleString('ko-KR')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                                                    {event.severity}
                                                </span>
                                            </div>
                                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                {event.details}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">사용자 권한 관리</h4>
                                <div className="space-y-4">
                                    {userPermissions.map(user => (
                                        <div key={user.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                                        <UsersIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {user.username}
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            역할: {user.role}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                                        {user.status}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                                        {user.role}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">마지막 로그인:</span>
                                                    <span className="text-gray-700 dark:text-gray-300">{user.last_login}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">실패 시도:</span>
                                                    <span className="text-red-600">{user.failed_attempts}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">세션 시간:</span>
                                                    <span className="text-gray-700 dark:text-gray-300">{user.session_duration}s</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">권한:</span>
                                                    <span className="text-gray-700 dark:text-gray-300">{user.permissions.join(', ')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">보안 설정</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">2단계 인증</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">추가 보안을 위한 2FA 활성화</div>
                                        </div>
                                        <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                                            활성화
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">세션 타임아웃</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">자동 로그아웃 시간 설정</div>
                                        </div>
                                        <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-600 dark:text-white" aria-label="보안 등급 선택">
                                            <option>30분</option>
                                            <option>1시간</option>
                                            <option>2시간</option>
                                            <option>4시간</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">IP 화이트리스트</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">허용된 IP 주소 관리</div>
                                        </div>
                                        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                                            관리
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">감사 로그</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">모든 활동 로그 보존 기간</div>
                                        </div>
                                        <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-600 dark:text-white" aria-label="알림 설정 선택">
                                            <option>30일</option>
                                            <option>90일</option>
                                            <option>1년</option>
                                            <option>무제한</option>
                                        </select>
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

export default AdvancedSecuritySystem; 