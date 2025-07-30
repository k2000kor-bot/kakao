import React, { useState, useEffect } from 'react';
import {
    StarIcon,
    BellIcon,
    ShieldCheckIcon,
    EyeIcon,
    FireIcon,
    BoltIcon,
    RocketLaunchIcon,
    AcademicCapIcon,
    MagnifyingGlassIcon,
    UserIcon,
    ServerIcon,
    CloudIcon,
    CogIcon,
    ArrowPathIcon,
    PlayIcon,
    PauseIcon,
    StopIcon,
    PlusIcon,
    MinusIcon,
    InformationCircleIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    UsersIcon,
    ChatBubbleLeftRightIcon,
    Bars3Icon,
    Squares2X2Icon,
    ViewColumnsIcon,
    ArrowsPointingOutIcon,
    ArrowsPointingInIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    Cog6ToothIcon,
    WrenchScrewdriverIcon,
    HeartIcon,
    LightBulbIcon,
    BookOpenIcon,
    TrophyIcon,
    CalendarIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    SignalIcon,
    WifiIcon,
    DevicePhoneMobileIcon,
    ComputerDesktopIcon,
    ChartPieIcon,
    PresentationChartLineIcon,
    ChartBarIcon,
    TableCellsIcon,
    CubeIcon,
    CubeTransparentIcon,
    SwatchIcon,
    PaintBrushIcon,
    AdjustmentsHorizontalIcon,
    FunnelIcon,
    RectangleStackIcon,
    CircleStackIcon,
    QueueListIcon,
    ListBulletIcon,
    Bars4Icon,
    Bars3BottomLeftIcon,
    Bars3BottomRightIcon,
    Bars3CenterLeftIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    UserGroupIcon,
    UserPlusIcon,
    UserMinusIcon,
    ChatBubbleBottomCenterTextIcon,
    ChatBubbleLeftEllipsisIcon,
    ChatBubbleOvalLeftEllipsisIcon,
    ChatBubbleOvalLeftIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'critical';
    category: 'ai-learning' | 'security' | 'performance' | 'collaboration' | 'automation' | 'system';
    priority: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
    read: boolean;
    actionable: boolean;
    action?: string;
    system: string;
    icon: any;
}

interface NotificationRule {
    id: string;
    name: string;
    description: string;
    condition: string;
    action: string;
    enabled: boolean;
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: string;
}

interface NotificationStats {
    total: number;
    unread: number;
    critical: number;
    today: number;
    byCategory: { [key: string]: number };
}

interface AdvancedAIIntelligentNotificationProps {
    isActive: boolean;
    onToggle: () => void;
}

const AdvancedAIIntelligentNotification: React.FC<AdvancedAIIntelligentNotificationProps> = ({
    isActive,
    onToggle
}) => {
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: 'notif-1',
            title: 'AI 모델 학습 완료',
            message: 'Neural Network v1.0 모델 학습이 성공적으로 완료되었습니다. 정확도 94.2% 달성.',
            type: 'success',
            category: 'ai-learning',
            priority: 'medium',
            timestamp: '방금 전',
            read: false,
            actionable: true,
            action: '모델 배포',
            system: 'AI 학습 시스템',
            icon: CpuChipIcon
        },
        {
            id: 'notif-2',
            title: '보안 위협 감지',
            message: '비정상적인 접근 패턴이 감지되었습니다. 즉시 조치가 필요합니다.',
            type: 'critical',
            category: 'security',
            priority: 'critical',
            timestamp: '2분 전',
            read: false,
            actionable: true,
            action: '조치하기',
            system: '보안 모니터링',
            icon: ShieldCheckIcon
        },
        {
            id: 'notif-3',
            title: '시스템 성능 최적화',
            message: 'AI 예측 시스템의 CPU 사용률이 높습니다. 리소스 할당을 조정하는 것을 권장합니다.',
            type: 'warning',
            category: 'performance',
            priority: 'high',
            timestamp: '5분 전',
            read: true,
            actionable: true,
            action: '최적화',
            system: '성능 모니터링',
            icon: CpuChipIcon
        },
        {
            id: 'notif-4',
            title: '새로운 협업 세션',
            message: '김철수님이 AI 모델 분석 세션을 시작했습니다. 참여하시겠습니까?',
            type: 'info',
            category: 'collaboration',
            priority: 'medium',
            timestamp: '10분 전',
            read: false,
            actionable: true,
            action: '참여하기',
            system: '협업 시스템',
            icon: UsersIcon
        },
        {
            id: 'notif-5',
            title: '자동화 워크플로우 완료',
            message: '데이터 분석 자동화 워크플로우가 성공적으로 완료되었습니다.',
            type: 'success',
            category: 'automation',
            priority: 'low',
            timestamp: '15분 전',
            read: true,
            actionable: false,
            system: '자동화 시스템',
            icon: CogIcon
        }
    ]);

    const [notificationRules, setNotificationRules] = useState<NotificationRule[]>([
        {
            id: 'rule-1',
            name: 'AI 모델 성능 알림',
            description: 'AI 모델의 정확도가 임계값 이하로 떨어지면 알림',
            condition: 'model_accuracy < 0.85',
            action: 'send_notification',
            enabled: true,
            priority: 'high',
            category: 'ai-learning'
        },
        {
            id: 'rule-2',
            name: '보안 위협 알림',
            description: '보안 위협이 감지되면 즉시 알림',
            condition: 'security_threat_detected == true',
            action: 'send_critical_notification',
            enabled: true,
            priority: 'critical',
            category: 'security'
        },
        {
            id: 'rule-3',
            name: '시스템 리소스 알림',
            description: '시스템 리소스 사용률이 높을 때 알림',
            condition: 'cpu_usage > 80 || memory_usage > 85',
            action: 'send_warning_notification',
            enabled: true,
            priority: 'medium',
            category: 'performance'
        },
        {
            id: 'rule-4',
            name: '협업 활동 알림',
            description: '새로운 협업 세션이 시작되면 알림',
            condition: 'new_collaboration_session == true',
            action: 'send_info_notification',
            enabled: true,
            priority: 'low',
            category: 'collaboration'
        }
    ]);

    const [notificationStats, setNotificationStats] = useState<NotificationStats>({
        total: 5,
        unread: 3,
        critical: 1,
        today: 5,
        byCategory: {
            'ai-learning': 1,
            'security': 1,
            'performance': 1,
            'collaboration': 1,
            'automation': 1
        }
    });

    const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'critical' | 'rules' | 'settings'>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            // 새로운 알림 생성 시뮬레이션
            const newNotification: Notification = {
                id: `notif-${Date.now()}`,
                title: '시스템 상태 업데이트',
                message: 'AI 시스템의 상태가 정상적으로 업데이트되었습니다.',
                type: 'info',
                category: ['ai-learning', 'security', 'performance', 'collaboration', 'automation'][Math.floor(Math.random() * 5)] as any,
                priority: 'low',
                timestamp: '방금 전',
                read: false,
                actionable: false,
                system: '통합 시스템',
                icon: InformationCircleIcon
            };

            setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
            setNotificationStats(prev => ({
                ...prev,
                total: prev.total + 1,
                unread: prev.unread + 1,
                today: prev.today + 1
            }));
        }, 10000);

        return () => clearInterval(interval);
    }, [autoRefresh]);

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'error': return 'text-red-600 bg-red-50 border-red-200';
            case 'critical': return 'text-red-700 bg-red-100 border-red-300';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'text-red-600 bg-red-50 border-red-200';
            case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const markAsRead = (notificationId: string) => {
        setNotifications(prev => prev.map(notif =>
            notif.id === notificationId ? { ...notif, read: true } : notif
        ));
        setNotificationStats(prev => ({
            ...prev,
            unread: Math.max(0, prev.unread - 1)
        }));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
        setNotificationStats(prev => ({
            ...prev,
            unread: 0
        }));
    };

    const deleteNotification = (notificationId: string) => {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        setNotificationStats(prev => ({
            ...prev,
            total: Math.max(0, prev.total - 1),
            unread: Math.max(0, prev.unread - 1)
        }));
    };

    const filteredNotifications = notifications.filter(notif => {
        if (activeTab === 'unread' && notif.read) return false;
        if (activeTab === 'critical' && notif.priority !== 'critical') return false;
        if (selectedCategory !== 'all' && notif.category !== selectedCategory) return false;
        return true;
    });

    if (!isActive) {
        return (
            <div className="absolute bottom-4 right-4 z-50">
                <button
                    onClick={onToggle}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2"
                >
                    <BellIcon className="w-5 h-5" />
                    <span>지능형 알림</span>
                    {notificationStats.unread > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                            {notificationStats.unread}
                        </span>
                    )}
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-6xl h-5/6 overflow-hidden">
                {/* 헤더 */}
                <div className="bg-gray-900 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-800 rounded-lg">
                                <BellIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">고도화된 AI 지능형 알림 시스템</h3>
                                <p className="text-gray-400 text-sm">상황 인식 스마트 알림 및 자동화</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-sm">{notificationStats.unread}개 읽지 않음</span>
                            </div>
                            <button
                                onClick={onToggle}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 알림 통계 */}
                <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{notificationStats.total}</div>
                            <div className="text-sm text-gray-600">총 알림</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{notificationStats.unread}</div>
                            <div className="text-sm text-gray-600">읽지 않음</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{notificationStats.critical}</div>
                            <div className="text-sm text-gray-600">긴급</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{notificationStats.today}</div>
                            <div className="text-sm text-gray-600">오늘</div>
                        </div>
                        <div className="text-center">
                            <button
                                onClick={markAllAsRead}
                                className="bg-gray-900 text-white px-3 py-1 rounded-lg text-sm hover:bg-gray-800 transition-colors"
                            >
                                모두 읽음
                            </button>
                        </div>
                    </div>
                </div>

                {/* 탭 네비게이션 */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                    {[
                        { id: 'all', label: '전체', count: notificationStats.total },
                        { id: 'unread', label: '읽지 않음', count: notificationStats.unread },
                        { id: 'critical', label: '긴급', count: notificationStats.critical },
                        { id: 'rules', label: '규칙', count: notificationRules.length },
                        { id: 'settings', label: '설정', count: 0 }
                    ].map(({ id, label, count }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id as any)}
                            className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${activeTab === id
                                ? 'text-gray-900 border-b-2 border-gray-900 bg-white'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <span>{label}</span>
                            {count > 0 && (
                                <span className="bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-1">
                                    {count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* 필터 */}
                <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-700">카테고리:</span>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        >
                            <option value="all">전체</option>
                            <option value="ai-learning">AI 학습</option>
                            <option value="security">보안</option>
                            <option value="performance">성능</option>
                            <option value="collaboration">협업</option>
                            <option value="automation">자동화</option>
                            <option value="system">시스템</option>
                        </select>
                    </div>
                </div>

                {/* 컨텐츠 영역 */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {['all', 'unread', 'critical'].includes(activeTab) && (
                        <div className="space-y-4">
                            {filteredNotifications.length === 0 ? (
                                <div className="text-center py-12">
                                    <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">알림이 없습니다</p>
                                </div>
                            ) : (
                                filteredNotifications.map(notification => {
                                    const Icon = notification.icon;
                                    return (
                                        <div key={notification.id} className={`bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 ${!notification.read ? 'border-l-4 border-blue-500' : ''
                                            }`}>
                                            <div className="flex items-start space-x-4">
                                                <div className="p-2 bg-gray-100 rounded-lg">
                                                    <Icon className="w-5 h-5 text-gray-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h5 className="font-semibold text-gray-900">{notification.title}</h5>
                                                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(notification.type)}`}>
                                                                {notification.type}
                                                            </span>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notification.priority)}`}>
                                                                {notification.priority}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                                        <div className="flex items-center space-x-4">
                                                            <span>{notification.system}</span>
                                                            <span>{notification.timestamp}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            {notification.actionable && (
                                                                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                                                                    {notification.action}
                                                                </button>
                                                            )}
                                                            {!notification.read && (
                                                                <button
                                                                    onClick={() => markAsRead(notification.id)}
                                                                    className="text-gray-500 hover:text-gray-700 text-sm"
                                                                >
                                                                    읽음
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => deleteNotification(notification.id)}
                                                                className="text-red-500 hover:text-red-700 text-sm"
                                                            >
                                                                삭제
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {activeTab === 'rules' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">알림 규칙 관리</h4>
                                <div className="space-y-4">
                                    {notificationRules.map(rule => (
                                        <div key={rule.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h5 className="font-semibold text-gray-900">{rule.name}</h5>
                                                    <p className="text-sm text-gray-600">{rule.description}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(rule.priority)}`}>
                                                    {rule.priority}
                                                </span>
                                            </div>
                                            <div className="space-y-2 text-sm mb-3">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">조건:</span>
                                                    <span className="font-semibold text-gray-900">{rule.condition}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">동작:</span>
                                                    <span className="font-semibold text-gray-900">{rule.action}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">카테고리:</span>
                                                    <span className="font-semibold text-gray-900">{rule.category}</span>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button className="flex-1 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors">
                                                    편집
                                                </button>
                                                <button className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors">
                                                    {rule.enabled ? '비활성화' : '활성화'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">알림 설정</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">실시간 알림</h5>
                                            <p className="text-sm text-gray-600">새로운 알림 실시간 표시</p>
                                        </div>
                                        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium">
                                            활성화
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">소리 알림</h5>
                                            <p className="text-sm text-gray-600">알림 소리 설정</p>
                                        </div>
                                        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium">
                                            활성화
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 className="font-medium text-gray-900">자동 정리</h5>
                                            <p className="text-sm text-gray-600">7일 이상 된 알림 자동 삭제</p>
                                        </div>
                                        <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm font-medium">
                                            비활성화
                                        </button>
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

export default AdvancedAIIntelligentNotification; 