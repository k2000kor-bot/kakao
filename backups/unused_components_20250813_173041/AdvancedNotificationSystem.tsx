import React, { useState, useEffect } from 'react';
import {
    BellIcon,
    CogIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XCircleIcon,
    ClockIcon,
    UserIcon,
    ChartBarIcon,
    EyeIcon,
    TrashIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArchiveBoxIcon,
    StarIcon
} from '@heroicons/react/24/outline';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: 'system' | 'user' | 'security' | 'performance' | 'update';
    timestamp: Date;
    read: boolean;
    archived: boolean;
    sender?: string;
    recipient?: string;
    actionUrl?: string;
    metadata?: {
        source?: string;
        relatedId?: string;
        tags?: string[];
    };
}

interface NotificationTemplate {
    id: string;
    name: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    category: 'system' | 'user' | 'security' | 'performance' | 'update';
    variables: string[];
    active: boolean;
}

interface NotificationStats {
    total: number;
    unread: number;
    byType: { [key: string]: number };
    byCategory: { [key: string]: number };
    byPriority: { [key: string]: number };
    recentActivity: number;
}

interface AdvancedNotificationSystemProps {
    onNotificationRead?: (notificationId: string) => void;
    onNotificationAction?: (notification: Notification) => void;
    onNotificationDelete?: (notificationId: string) => void;
}

const AdvancedNotificationSystem: React.FC<AdvancedNotificationSystemProps> = ({
    onNotificationRead,
    onNotificationAction,
    onNotificationDelete
}) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
    const [stats, setStats] = useState<NotificationStats>({
        total: 0,
        unread: 0,
        byType: {},
        byCategory: {},
        byPriority: {},
        recentActivity: 0
    });
    const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'archived' | 'templates'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

    // 시뮬레이션된 알림 데이터
    useEffect(() => {
        const mockNotifications: Notification[] = [
            {
                id: '1',
                title: '시스템 업데이트 완료',
                message: 'CORBU AI 시스템이 성공적으로 업데이트되었습니다. 새로운 기능들이 추가되었습니다.',
                type: 'success',
                priority: 'medium',
                category: 'system',
                timestamp: new Date(Date.now() - 30 * 60 * 1000),
                read: false,
                archived: false,
                sender: 'system',
                actionUrl: '/updates',
                metadata: {
                    source: 'system',
                    tags: ['update', 'system']
                }
            },
            {
                id: '2',
                title: '보안 경고',
                message: '의심스러운 로그인 시도가 감지되었습니다. 계정 보안을 확인해주세요.',
                type: 'warning',
                priority: 'high',
                category: 'security',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                read: false,
                archived: false,
                sender: 'security-system',
                actionUrl: '/security',
                metadata: {
                    source: 'security',
                    tags: ['security', 'login']
                }
            },
            {
                id: '3',
                title: '성능 최적화 완료',
                message: '시스템 성능 최적화가 완료되었습니다. 응답 시간이 15% 개선되었습니다.',
                type: 'info',
                priority: 'low',
                category: 'performance',
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
                read: true,
                archived: false,
                sender: 'performance-monitor',
                metadata: {
                    source: 'performance',
                    tags: ['performance', 'optimization']
                }
            },
            {
                id: '4',
                title: '새로운 사용자 등록',
                message: '새로운 사용자가 시스템에 등록되었습니다: user123@example.com',
                type: 'info',
                priority: 'low',
                category: 'user',
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
                read: true,
                archived: false,
                sender: 'user-management',
                actionUrl: '/users',
                metadata: {
                    source: 'user-management',
                    tags: ['user', 'registration']
                }
            },
            {
                id: '5',
                title: '데이터베이스 오류',
                message: '데이터베이스 연결에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
                type: 'error',
                priority: 'critical',
                category: 'system',
                timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
                read: false,
                archived: false,
                sender: 'database-monitor',
                actionUrl: '/system/status',
                metadata: {
                    source: 'database',
                    tags: ['database', 'error']
                }
            }
        ];

        setNotifications(mockNotifications);

        // 통계 계산
        const byType = mockNotifications.reduce((acc, notification) => {
            acc[notification.type] = (acc[notification.type] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });

        const byCategory = mockNotifications.reduce((acc, notification) => {
            acc[notification.category] = (acc[notification.category] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });

        const byPriority = mockNotifications.reduce((acc, notification) => {
            acc[notification.priority] = (acc[notification.priority] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });

        setStats({
            total: mockNotifications.length,
            unread: mockNotifications.filter(n => !n.read).length,
            byType,
            byCategory,
            byPriority,
            recentActivity: mockNotifications.filter(n => n.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)).length
        });
    }, []);

    // 시뮬레이션된 템플릿 데이터
    useEffect(() => {
        const mockTemplates: NotificationTemplate[] = [
            {
                id: '1',
                name: '시스템 업데이트 알림',
                title: '시스템 업데이트 완료',
                message: '시스템이 성공적으로 업데이트되었습니다. 새로운 기능: {features}',
                type: 'success',
                category: 'system',
                variables: ['features'],
                active: true
            },
            {
                id: '2',
                name: '보안 경고',
                title: '보안 경고 - {event_type}',
                message: '보안 이벤트가 감지되었습니다: {description}. 즉시 확인해주세요.',
                type: 'warning',
                category: 'security',
                variables: ['event_type', 'description'],
                active: true
            },
            {
                id: '3',
                name: '사용자 등록 알림',
                title: '새로운 사용자 등록',
                message: '새로운 사용자가 등록되었습니다: {email} ({role})',
                type: 'info',
                category: 'user',
                variables: ['email', 'role'],
                active: true
            }
        ];

        setTemplates(mockTemplates);
    }, []);

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success': return 'text-green-600 bg-green-50';
            case 'warning': return 'text-yellow-600 bg-yellow-50';
            case 'error': return 'text-red-600 bg-red-50';
            case 'info': return 'text-blue-600 bg-blue-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'text-red-600 bg-red-50';
            case 'high': return 'text-orange-600 bg-orange-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'low': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
            case 'warning': return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
            case 'error': return <XCircleIcon className="w-5 h-5 text-red-500" />;
            case 'info': return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
            default: return <BellIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    const markAsRead = (notificationId: string) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === notificationId ? { ...notification, read: true } : notification
            )
        );
        onNotificationRead?.(notificationId);
    };

    const archiveNotification = (notificationId: string) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === notificationId ? { ...notification, archived: true } : notification
            )
        );
    };

    const toggleSelection = (notificationId: string) => {
        setSelectedNotifications(prev =>
            prev.includes(notificationId)
                ? prev.filter(id => id !== notificationId)
                : [...prev, notificationId]
        );
    };

    const deleteSelectedNotifications = () => {
        setNotifications(prev => prev.filter(notification => !selectedNotifications.includes(notification.id)));
        selectedNotifications.forEach(id => onNotificationDelete?.(id));
        setSelectedNotifications([]);
    };

    const filteredNotifications = notifications.filter(notification => {
        if (searchQuery) {
            return notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                notification.message.toLowerCase().includes(searchQuery.toLowerCase());
        }
        if (filterType !== 'all' && notification.type !== filterType) return false;
        if (filterCategory !== 'all' && notification.category !== filterCategory) return false;

        switch (activeTab) {
            case 'unread':
                return !notification.read;
            case 'archived':
                return notification.archived;
            default:
                return !notification.archived;
        }
    });

    const renderOverview = () => (
        <div className="space-y-6">
            {/* 알림 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">총 알림</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <BellIcon className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">읽지 않은 알림</p>
                            <p className="text-2xl font-bold text-red-600">{stats.unread}</p>
                        </div>
                        <EyeIcon className="w-8 h-8 text-red-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">오늘 활동</p>
                            <p className="text-2xl font-bold text-green-600">{stats.recentActivity}</p>
                        </div>
                        <ClockIcon className="w-8 h-8 text-green-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">활성 템플릿</p>
                            <p className="text-2xl font-bold text-purple-600">{templates.filter(t => t.active).length}</p>
                        </div>
                        <StarIcon className="w-8 h-8 text-purple-500" />
                    </div>
                </div>
            </div>

            {/* 최근 알림 */}
            <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">최근 알림</h3>
                    <button
                        onClick={() => setActiveTab('all')}
                        className="text-sm text-blue-600 hover:text-blue-700"
                    >
                        모든 알림 보기
                    </button>
                </div>

                <div className="space-y-3">
                    {notifications.slice(0, 5).map((notification) => (
                        <div key={notification.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            {getTypeIcon(notification.type)}

                            <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-900">{notification.title}</span>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                                        {notification.type === 'success' ? '성공' :
                                            notification.type === 'warning' ? '경고' :
                                                notification.type === 'error' ? '오류' : '정보'}
                                    </span>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                                        {notification.priority === 'critical' ? '긴급' :
                                            notification.priority === 'high' ? '높음' :
                                                notification.priority === 'medium' ? '보통' : '낮음'}
                                    </span>
                                    {!notification.read && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-50">
                                            새
                                        </span>
                                    )}
                                </div>

                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-2">{notification.timestamp.toLocaleString()}</p>
                            </div>

                            <div className="flex space-x-1">
                                {!notification.read && (
                                    <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="p-1 text-gray-400 hover:text-blue-500"
                                        title="읽음 표시"
                                    >
                                        <EyeIcon className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => archiveNotification(notification.id)}
                                    className="p-1 text-gray-400 hover:text-yellow-500"
                                    title="보관"
                                >
                                    <ArchiveBoxIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderNotifications = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">알림 관리</h3>

            <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                    <div key={notification.id} className="bg-white rounded-lg border p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                                <input
                                    type="checkbox"
                                    checked={selectedNotifications.includes(notification.id)}
                                    onChange={() => toggleSelection(notification.id)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 mt-1"
                                />

                                {getTypeIcon(notification.type)}

                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className="font-medium text-gray-900">{notification.title}</span>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                                            {notification.type === 'success' ? '성공' :
                                                notification.type === 'warning' ? '경고' :
                                                    notification.type === 'error' ? '오류' : '정보'}
                                        </span>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                                            {notification.priority === 'critical' ? '긴급' :
                                                notification.priority === 'high' ? '높음' :
                                                    notification.priority === 'medium' ? '보통' : '낮음'}
                                        </span>
                                        {!notification.read && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-50">
                                                읽지 않음
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-gray-600 mb-2">{notification.message}</p>

                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                        <span>{notification.timestamp.toLocaleString()}</span>
                                        {notification.sender && <span>발신자: {notification.sender}</span>}
                                        <span>카테고리: {notification.category}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                {!notification.read && (
                                    <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        읽음
                                    </button>
                                )}
                                {notification.actionUrl && (
                                    <button
                                        onClick={() => onNotificationAction?.(notification)}
                                        className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                                    >
                                        보기
                                    </button>
                                )}
                                <button
                                    onClick={() => archiveNotification(notification.id)}
                                    className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                >
                                    보관
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderTemplates = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">알림 템플릿 관리</h3>

            <div className="space-y-4">
                {templates.map((template) => (
                    <div key={template.id} className="bg-white rounded-lg border p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="font-medium text-gray-900">{template.name}</span>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                                        {template.type === 'success' ? '성공' :
                                            template.type === 'warning' ? '경고' :
                                                template.type === 'error' ? '오류' : '정보'}
                                    </span>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${template.active ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'
                                        }`}>
                                        {template.active ? '활성' : '비활성'}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">제목:</p>
                                        <p className="text-sm text-gray-600">{template.title}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">메시지:</p>
                                        <p className="text-sm text-gray-600">{template.message}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">변수:</p>
                                        <p className="text-sm text-gray-600">{template.variables.join(', ')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                                    편집
                                </button>
                                <button className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600">
                                    미리보기
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* 헤더 */}
            <div className="bg-white border-b px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <BellIcon className="w-6 h-6 text-blue-500" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">고급 알림 시스템</h3>
                            <p className="text-sm text-gray-500">알림 관리 및 템플릿 시스템</p>
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
                                placeholder="알림 검색..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">모든 유형</option>
                            <option value="info">정보</option>
                            <option value="success">성공</option>
                            <option value="warning">경고</option>
                            <option value="error">오류</option>
                        </select>

                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">모든 카테고리</option>
                            <option value="system">시스템</option>
                            <option value="user">사용자</option>
                            <option value="security">보안</option>
                            <option value="performance">성능</option>
                            <option value="update">업데이트</option>
                        </select>
                    </div>

                    <div className="flex space-x-2">
                        {selectedNotifications.length > 0 && (
                            <button
                                onClick={deleteSelectedNotifications}
                                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center space-x-2"
                            >
                                <TrashIcon className="w-4 h-4" />
                                <span>삭제 ({selectedNotifications.length})</span>
                            </button>
                        )}
                        <button className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2">
                            <PlusIcon className="w-4 h-4" />
                            <span>템플릿 추가</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="bg-white border-b">
                <nav className="flex space-x-8 px-4">
                    {[
                        { id: 'all', name: '모든 알림', icon: BellIcon },
                        { id: 'unread', name: '읽지 않은 알림', icon: EyeIcon },
                        { id: 'archived', name: '보관된 알림', icon: ArchiveBoxIcon },
                        { id: 'templates', name: '템플릿', icon: StarIcon }
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
                {activeTab === 'all' && renderOverview()}
                {(activeTab === 'unread' || activeTab === 'archived') && renderNotifications()}
                {activeTab === 'templates' && renderTemplates()}
            </div>
        </div>
    );
};

export default AdvancedNotificationSystem;
