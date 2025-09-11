import React, { useState, useEffect } from 'react';
import {
    Settings,
    User,
    Bell,
    Shield,
    Palette,
    Globe,
    Database,
    Key,
    Eye,
    EyeOff,
    Save,
    RotateCcw,
    Download,
    Upload,
    Trash2,
    Plus,
    Edit,
    X,
    Check,
    AlertTriangle,
    Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'admin' | 'user' | 'viewer';
    permissions: string[];
    lastLogin: string;
    isActive: boolean;
}

interface NotificationSettings {
    email: boolean;
    push: boolean;
    sound: boolean;
    desktop: boolean;
    projectUpdates: boolean;
    messageAlerts: boolean;
    fileUploads: boolean;
    systemAlerts: boolean;
}

interface SecuritySettings {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
    loginAttempts: number;
    ipWhitelist: string[];
    auditLog: boolean;
}

interface AppearanceSettings {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    compactMode: boolean;
    animations: boolean;
}

interface AdvancedSettingsProps {
    onSave?: (settings: any) => void;
    onReset?: () => void;
    onExport?: () => void;
    onImport?: (data: any) => void;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
    onSave,
    onReset,
    onExport,
    onImport
}) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'appearance' | 'advanced'>('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmAction, setConfirmAction] = useState<string>('');

    // 사용자 프로필
    const [profile, setProfile] = useState<UserProfile>({
        id: '1',
        name: '관리자',
        email: 'admin@corbu.ai',
        role: 'admin',
        permissions: ['read', 'write', 'delete', 'admin'],
        lastLogin: '2024-01-21T10:30:00Z',
        isActive: true
    });

    // 알림 설정
    const [notifications, setNotifications] = useState<NotificationSettings>({
        email: true,
        push: true,
        sound: true,
        desktop: true,
        projectUpdates: true,
        messageAlerts: true,
        fileUploads: false,
        systemAlerts: true
    });

    // 보안 설정
    const [security, setSecurity] = useState<SecuritySettings>({
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordExpiry: 90,
        loginAttempts: 5,
        ipWhitelist: [],
        auditLog: true
    });

    // 외관 설정
    const [appearance, setAppearance] = useState<AppearanceSettings>({
        theme: 'light',
        language: 'ko',
        timezone: 'Asia/Seoul',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24h',
        compactMode: false,
        animations: true
    });

    // 고급 설정
    const [advanced, setAdvanced] = useState({
        autoSave: true,
        autoSaveInterval: 5,
        maxFileSize: 50,
        allowedFileTypes: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'png'],
        backupEnabled: true,
        backupInterval: 24,
        analyticsEnabled: true,
        debugMode: false
    });

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const settings = {
                profile,
                notifications,
                security,
                appearance,
                advanced
            };
            await onSave?.(settings);
            // 성공 알림
        } catch (error) {
            // 에러 처리
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setConfirmAction('reset');
        setShowConfirmDialog(true);
    };

    const handleExport = () => {
        const data = {
            profile,
            notifications,
            security,
            appearance,
            advanced,
            exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `corbu.ai-settings-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target?.result as string);
                    setProfile(data.profile || profile);
                    setNotifications(data.notifications || notifications);
                    setSecurity(data.security || security);
                    setAppearance(data.appearance || appearance);
                    setAdvanced(data.advanced || advanced);
                } catch (error) {
                    console.error('설정 파일을 불러올 수 없습니다:', error);
                }
            };
            reader.readAsText(file);
        }
    };

    const confirmActionHandler = () => {
        if (confirmAction === 'reset') {
            // 기본값으로 리셋
            setProfile({
                id: '1',
                name: '관리자',
                email: 'admin@corbu.ai',
                role: 'admin',
                permissions: ['read', 'write', 'delete', 'admin'],
                lastLogin: '2024-01-21T10:30:00Z',
                isActive: true
            });
            setNotifications({
                email: true,
                push: true,
                sound: true,
                desktop: true,
                projectUpdates: true,
                messageAlerts: true,
                fileUploads: false,
                systemAlerts: true
            });
            // ... 다른 설정들도 기본값으로 리셋
        }
        setShowConfirmDialog(false);
        setConfirmAction('');
    };

    const tabs = [
        { id: 'profile', name: '프로필', icon: User },
        { id: 'notifications', name: '알림', icon: Bell },
        { id: 'security', name: '보안', icon: Shield },
        { id: 'appearance', name: '외관', icon: Palette },
        { id: 'advanced', name: '고급', icon: Settings }
    ];

    return (
        <div className="max-w-4xl mx-auto">
            {/* 헤더 */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">고급 설정</h1>
                <p className="text-gray-600 mt-2">시스템 설정 및 사용자 환경을 관리하세요</p>
            </div>

            {/* 탭 네비게이션 */}
            <div className="border-b border-gray-200 mb-8">
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

            {/* 설정 내용 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <AnimatePresence mode="wait">
                    {activeTab === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-6"
                        >
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">사용자 프로필</h2>

                            <div className="space-y-6">
                                {/* 기본 정보 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            이름
                                        </label>
                                        <input
                                            type="text"
                                            value={profile.name}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            이메일
                                        </label>
                                        <input
                                            type="email"
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* 역할 및 권한 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        역할
                                    </label>
                                    <select
                                        value={profile.role}
                                        onChange={(e) => setProfile({ ...profile, role: e.target.value as any })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="admin">관리자</option>
                                        <option value="user">사용자</option>
                                        <option value="viewer">뷰어</option>
                                    </select>
                                </div>

                                {/* 계정 상태 */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <h3 className="font-medium text-gray-900">계정 상태</h3>
                                        <p className="text-sm text-gray-600">
                                            {profile.isActive ? '활성' : '비활성'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setProfile({ ...profile, isActive: !profile.isActive })}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${profile.isActive
                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                                            }`}
                                    >
                                        {profile.isActive ? '활성' : '비활성'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'notifications' && (
                        <motion.div
                            key="notifications"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-6"
                        >
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">알림 설정</h2>

                            <div className="space-y-6">
                                {/* 알림 채널 */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">알림 채널</h3>
                                    <div className="space-y-3">
                                        {[
                                            { key: 'email', label: '이메일 알림', description: '중요한 업데이트를 이메일로 받습니다' },
                                            { key: 'push', label: '푸시 알림', description: '브라우저 푸시 알림을 받습니다' },
                                            { key: 'sound', label: '소리 알림', description: '알림 소리를 재생합니다' },
                                            { key: 'desktop', label: '데스크톱 알림', description: '데스크톱 알림을 표시합니다' }
                                        ].map((item) => (
                                            <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">{item.label}</p>
                                                    <p className="text-sm text-gray-600">{item.description}</p>
                                                </div>
                                                <button
                                                    onClick={() => setNotifications({
                                                        ...notifications,
                                                        [item.key]: !notifications[item.key as keyof NotificationSettings]
                                                    })}
                                                    className={`w-12 h-6 rounded-full transition-colors ${notifications[item.key as keyof NotificationSettings]
                                                        ? 'bg-purple-600'
                                                        : 'bg-gray-300'
                                                        }`}
                                                >
                                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${notifications[item.key as keyof NotificationSettings]
                                                        ? 'transform translate-x-6'
                                                        : 'transform translate-x-1'
                                                        }`} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 알림 유형 */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">알림 유형</h3>
                                    <div className="space-y-3">
                                        {[
                                            { key: 'projectUpdates', label: '프로젝트 업데이트' },
                                            { key: 'messageAlerts', label: '메시지 알림' },
                                            { key: 'fileUploads', label: '파일 업로드' },
                                            { key: 'systemAlerts', label: '시스템 알림' }
                                        ].map((item) => (
                                            <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <span className="font-medium text-gray-900">{item.label}</span>
                                                <button
                                                    onClick={() => setNotifications({
                                                        ...notifications,
                                                        [item.key]: !notifications[item.key as keyof NotificationSettings]
                                                    })}
                                                    className={`w-12 h-6 rounded-full transition-colors ${notifications[item.key as keyof NotificationSettings]
                                                        ? 'bg-purple-600'
                                                        : 'bg-gray-300'
                                                        }`}
                                                >
                                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${notifications[item.key as keyof NotificationSettings]
                                                        ? 'transform translate-x-6'
                                                        : 'transform translate-x-1'
                                                        }`} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'security' && (
                        <motion.div
                            key="security"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-6"
                        >
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">보안 설정</h2>

                            <div className="space-y-6">
                                {/* 2단계 인증 */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <h3 className="font-medium text-gray-900">2단계 인증</h3>
                                        <p className="text-sm text-gray-600">추가 보안을 위해 2단계 인증을 활성화하세요</p>
                                    </div>
                                    <button
                                        onClick={() => setSecurity({ ...security, twoFactorAuth: !security.twoFactorAuth })}
                                        className={`w-12 h-6 rounded-full transition-colors ${security.twoFactorAuth ? 'bg-purple-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${security.twoFactorAuth ? 'transform translate-x-6' : 'transform translate-x-1'
                                            }`} />
                                    </button>
                                </div>

                                {/* 세션 타임아웃 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        세션 타임아웃 (분)
                                    </label>
                                    <select
                                        value={security.sessionTimeout}
                                        onChange={(e) => setSecurity({ ...security, sessionTimeout: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value={15}>15분</option>
                                        <option value={30}>30분</option>
                                        <option value={60}>1시간</option>
                                        <option value={120}>2시간</option>
                                        <option value={480}>8시간</option>
                                    </select>
                                </div>

                                {/* 로그인 시도 제한 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        최대 로그인 시도 횟수
                                    </label>
                                    <input
                                        type="number"
                                        value={security.loginAttempts}
                                        onChange={(e) => setSecurity({ ...security, loginAttempts: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        min="1"
                                        max="10"
                                    />
                                </div>

                                {/* 감사 로그 */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <h3 className="font-medium text-gray-900">감사 로그</h3>
                                        <p className="text-sm text-gray-600">모든 사용자 활동을 기록합니다</p>
                                    </div>
                                    <button
                                        onClick={() => setSecurity({ ...security, auditLog: !security.auditLog })}
                                        className={`w-12 h-6 rounded-full transition-colors ${security.auditLog ? 'bg-purple-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${security.auditLog ? 'transform translate-x-6' : 'transform translate-x-1'
                                            }`} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'appearance' && (
                        <motion.div
                            key="appearance"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-6"
                        >
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">외관 설정</h2>

                            <div className="space-y-6">
                                {/* 테마 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        테마
                                    </label>
                                    <select
                                        value={appearance.theme}
                                        onChange={(e) => setAppearance({ ...appearance, theme: e.target.value as any })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="light">라이트</option>
                                        <option value="dark">다크</option>
                                        <option value="auto">시스템 설정</option>
                                    </select>
                                </div>

                                {/* 언어 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        언어
                                    </label>
                                    <select
                                        value={appearance.language}
                                        onChange={(e) => setAppearance({ ...appearance, language: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="ko">한국어</option>
                                        <option value="en">English</option>
                                        <option value="ja">日本語</option>
                                        <option value="zh">中文</option>
                                    </select>
                                </div>

                                {/* 시간대 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        시간대
                                    </label>
                                    <select
                                        value={appearance.timezone}
                                        onChange={(e) => setAppearance({ ...appearance, timezone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="Asia/Seoul">Asia/Seoul (UTC+9)</option>
                                        <option value="America/New_York">America/New_York (UTC-5)</option>
                                        <option value="Europe/London">Europe/London (UTC+0)</option>
                                        <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
                                    </select>
                                </div>

                                {/* 시간 형식 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        시간 형식
                                    </label>
                                    <div className="flex space-x-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                value="12h"
                                                checked={appearance.timeFormat === '12h'}
                                                onChange={(e) => setAppearance({ ...appearance, timeFormat: e.target.value as any })}
                                                className="mr-2"
                                            />
                                            <span>12시간 (AM/PM)</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                value="24h"
                                                checked={appearance.timeFormat === '24h'}
                                                onChange={(e) => setAppearance({ ...appearance, timeFormat: e.target.value as any })}
                                                className="mr-2"
                                            />
                                            <span>24시간</span>
                                        </label>
                                    </div>
                                </div>

                                {/* 컴팩트 모드 */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <h3 className="font-medium text-gray-900">컴팩트 모드</h3>
                                        <p className="text-sm text-gray-600">더 조밀한 레이아웃을 사용합니다</p>
                                    </div>
                                    <button
                                        onClick={() => setAppearance({ ...appearance, compactMode: !appearance.compactMode })}
                                        className={`w-12 h-6 rounded-full transition-colors ${appearance.compactMode ? 'bg-purple-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${appearance.compactMode ? 'transform translate-x-6' : 'transform translate-x-1'
                                            }`} />
                                    </button>
                                </div>

                                {/* 애니메이션 */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <h3 className="font-medium text-gray-900">애니메이션</h3>
                                        <p className="text-sm text-gray-600">UI 전환 애니메이션을 활성화합니다</p>
                                    </div>
                                    <button
                                        onClick={() => setAppearance({ ...appearance, animations: !appearance.animations })}
                                        className={`w-12 h-6 rounded-full transition-colors ${appearance.animations ? 'bg-purple-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${appearance.animations ? 'transform translate-x-6' : 'transform translate-x-1'
                                            }`} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'advanced' && (
                        <motion.div
                            key="advanced"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-6"
                        >
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">고급 설정</h2>

                            <div className="space-y-6">
                                {/* 자동 저장 */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <h3 className="font-medium text-gray-900">자동 저장</h3>
                                        <p className="text-sm text-gray-600">작업 내용을 자동으로 저장합니다</p>
                                    </div>
                                    <button
                                        onClick={() => setAdvanced({ ...advanced, autoSave: !advanced.autoSave })}
                                        className={`w-12 h-6 rounded-full transition-colors ${advanced.autoSave ? 'bg-purple-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${advanced.autoSave ? 'transform translate-x-6' : 'transform translate-x-1'
                                            }`} />
                                    </button>
                                </div>

                                {/* 자동 저장 간격 */}
                                {advanced.autoSave && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            자동 저장 간격 (분)
                                        </label>
                                        <select
                                            value={advanced.autoSaveInterval}
                                            onChange={(e) => setAdvanced({ ...advanced, autoSaveInterval: Number(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value={1}>1분</option>
                                            <option value={5}>5분</option>
                                            <option value={10}>10분</option>
                                            <option value={30}>30분</option>
                                        </select>
                                    </div>
                                )}

                                {/* 최대 파일 크기 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        최대 파일 크기 (MB)
                                    </label>
                                    <input
                                        type="number"
                                        value={advanced.maxFileSize}
                                        onChange={(e) => setAdvanced({ ...advanced, maxFileSize: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        min="1"
                                        max="100"
                                    />
                                </div>

                                {/* 백업 설정 */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <h3 className="font-medium text-gray-900">자동 백업</h3>
                                        <p className="text-sm text-gray-600">데이터를 자동으로 백업합니다</p>
                                    </div>
                                    <button
                                        onClick={() => setAdvanced({ ...advanced, backupEnabled: !advanced.backupEnabled })}
                                        className={`w-12 h-6 rounded-full transition-colors ${advanced.backupEnabled ? 'bg-purple-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${advanced.backupEnabled ? 'transform translate-x-6' : 'transform translate-x-1'
                                            }`} />
                                    </button>
                                </div>

                                {/* 분석 수집 */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <h3 className="font-medium text-gray-900">사용 분석 수집</h3>
                                        <p className="text-sm text-gray-600">서비스 개선을 위한 사용 데이터를 수집합니다</p>
                                    </div>
                                    <button
                                        onClick={() => setAdvanced({ ...advanced, analyticsEnabled: !advanced.analyticsEnabled })}
                                        className={`w-12 h-6 rounded-full transition-colors ${advanced.analyticsEnabled ? 'bg-purple-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${advanced.analyticsEnabled ? 'transform translate-x-6' : 'transform translate-x-1'
                                            }`} />
                                    </button>
                                </div>

                                {/* 디버그 모드 */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <h3 className="font-medium text-gray-900">디버그 모드</h3>
                                        <p className="text-sm text-gray-600">개발자용 디버그 정보를 표시합니다</p>
                                    </div>
                                    <button
                                        onClick={() => setAdvanced({ ...advanced, debugMode: !advanced.debugMode })}
                                        className={`w-12 h-6 rounded-full transition-colors ${advanced.debugMode ? 'bg-purple-600' : 'bg-gray-300'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${advanced.debugMode ? 'transform translate-x-6' : 'transform translate-x-1'
                                            }`} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 액션 버튼 */}
            <div className="flex items-center justify-between mt-8 p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleExport}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Download className="h-4 w-4" />
                        <span>설정 내보내기</span>
                    </button>
                    <label className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <Upload className="h-4 w-4" />
                        <span>설정 가져오기</span>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            className="hidden"
                        />
                    </label>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleReset}
                        className="flex items-center space-x-2 px-4 py-2 text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <RotateCcw className="h-4 w-4" />
                        <span>기본값으로 복원</span>
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                        <Save className="h-4 w-4" />
                        <span>{isLoading ? '저장 중...' : '저장'}</span>
                    </button>
                </div>
            </div>

            {/* 확인 다이얼로그 */}
            <AnimatePresence>
                {showConfirmDialog && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => setShowConfirmDialog(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-lg p-6 w-96"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <AlertTriangle className="h-6 w-6 text-yellow-500" />
                                <h3 className="text-lg font-semibold text-gray-900">확인</h3>
                            </div>
                            <p className="text-gray-600 mb-6">
                                모든 설정을 기본값으로 복원하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                            </p>
                            <div className="flex items-center justify-end space-x-3">
                                <button
                                    onClick={() => setShowConfirmDialog(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={confirmActionHandler}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    확인
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdvancedSettings;
