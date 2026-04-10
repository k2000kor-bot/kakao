import React, { useState } from 'react';
import {
    Settings,
    User,
    Bell,
    Shield,
    Palette,
    Save,
    RotateCcw,
    Download,
    Upload,
    AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { errorLogger } from '../../utils/errorLogger';
import './AdvancedSettings.css';

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
    onSave?: (settings: unknown) => void;
    onReset?: () => void;
    onExport?: () => void;
    onImport?: (data: unknown) => void;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
    onSave,
    onReset: _onReset,
    onExport: _onExport,
    onImport: _onImport
}) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'appearance' | 'advanced'>('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [_showPassword, _setShowPassword] = useState(false);
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
                } catch (error: unknown) {
                    errorLogger.error('설정 파일 로드 실패', error, {
                        component: 'AdvancedSettings',
                        action: 'loadSettingsFile',
                    });
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
    ] as const;

    return (
        <div className="as-root">
            <div className="as-header">
                <h1 className="as-title">고급 설정</h1>
                <p className="as-desc">시스템 설정 및 사용자 환경을 관리하세요</p>
            </div>

            <div className="as-tabs">
                <nav style={{ display: 'flex', gap: 'var(--spacing-2xl)' }}>
                    {tabs.map((tab) => {
                        const IconComponent = tab.icon;
                        return (
                            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`as-tab ${activeTab === tab.id ? 'active' : ''}`}>
                                <IconComponent size={16} aria-hidden />
                                {tab.name}
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="bw-card">
                <AnimatePresence mode="wait">
                    {activeTab === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="as-section"
                        >
                            <h2 className="as-section-title">사용자 프로필</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--spacing-lg)' }}>
                                    <div>
                                        <label className="as-label">이름</label>
                                        <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="bw-input" style={{ width: '100%' }} />
                                    </div>
                                    <div>
                                        <label className="as-label">이메일</label>
                                        <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="bw-input" style={{ width: '100%' }} />
                                    </div>
                                </div>
                                <div>
                                    <label className="as-label">역할</label>
                                    <select value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value as 'admin' | 'user' | 'viewer' })} className="bw-input" style={{ width: '100%' }}>
                                        <option value="admin">관리자</option>
                                        <option value="user">사용자</option>
                                        <option value="viewer">뷰어</option>
                                    </select>
                                </div>

                                <div className="as-row">
                                    <div>
                                        <h3 className="as-row-title">계정 상태</h3>
                                        <p className="as-row-desc">{profile.isActive ? '활성' : '비활성'}</p>
                                    </div>
                                    <button type="button" onClick={() => setProfile({ ...profile, isActive: !profile.isActive })} className="bw-btn-secondary" style={{ background: profile.isActive ? 'var(--accent-success-muted)' : 'var(--accent-error-muted)', color: profile.isActive ? 'var(--accent-success)' : 'var(--accent-error)' }}>
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
                            className="as-section"
                        >
                            <h2 className="as-section-title">알림 설정</h2>
                            <div className="as-panel">
                                <div>
                                    <h3 className="as-subtitle">알림 채널</h3>
                                    <div className="as-row-list">
                                        {[
                                            { key: 'email', label: '이메일 알림', description: '중요한 업데이트를 이메일로 받습니다' },
                                            { key: 'push', label: '푸시 알림', description: '브라우저 푸시 알림을 받습니다' },
                                            { key: 'sound', label: '소리 알림', description: '알림 소리를 재생합니다' },
                                            { key: 'desktop', label: '데스크톱 알림', description: '데스크톱 알림을 표시합니다' }
                                        ].map((item) => (
                                            <div key={item.key} className="as-row">
                                                <div>
                                                    <p className="as-row-title">{item.label}</p>
                                                    <p className="as-row-desc">{item.description}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setNotifications({
                                                        ...notifications,
                                                        [item.key]: !notifications[item.key as keyof NotificationSettings]
                                                    })}
                                                    className={`as-toggle ${notifications[item.key as keyof NotificationSettings] ? 'on' : 'off'}`}
                                                    aria-label={`${item.label} ${notifications[item.key as keyof NotificationSettings] ? '끄기' : '켜기'}`}
                                                >
                                                    <span className="as-toggle-thumb" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 알림 유형 */}
                                <div>
                                    <h3 className="as-subtitle">알림 유형</h3>
                                    <div className="as-row-list">
                                        {[
                                            { key: 'projectUpdates', label: '프로젝트 업데이트' },
                                            { key: 'messageAlerts', label: '메시지 알림' },
                                            { key: 'fileUploads', label: '파일 업로드' },
                                            { key: 'systemAlerts', label: '시스템 알림' }
                                        ].map((item) => (
                                            <div key={item.key} className="as-row">
                                                <span className="as-row-title">{item.label}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setNotifications({
                                                        ...notifications,
                                                        [item.key]: !notifications[item.key as keyof NotificationSettings]
                                                    })}
                                                    className={`as-toggle ${notifications[item.key as keyof NotificationSettings] ? 'on' : 'off'}`}
                                                    aria-label={`${item.label} ${notifications[item.key as keyof NotificationSettings] ? '끄기' : '켜기'}`}
                                                >
                                                    <span className="as-toggle-thumb" />
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
                            className="as-section"
                        >
                            <h2 className="as-section-title">보안 설정</h2>

                            <div className="as-panel">
                                {/* 2단계 인증 */}
                                <div className="as-row">
                                    <div>
                                        <p className="as-row-title">2단계 인증</p>
                                        <p className="as-row-desc">추가 보안을 위해 2단계 인증을 활성화하세요</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSecurity({ ...security, twoFactorAuth: !security.twoFactorAuth })}
                                        className={`as-toggle ${security.twoFactorAuth ? 'on' : 'off'}`}
                                        aria-label="2단계 인증"
                                    >
                                        <span className="as-toggle-thumb" />
                                    </button>
                                </div>

                                {/* 세션 타임아웃 */}
                                <div className="as-field">
                                    <label className="as-label">
                                        세션 타임아웃 (분)
                                    </label>
                                    <select
                                        value={security.sessionTimeout}
                                        onChange={(e) => setSecurity({ ...security, sessionTimeout: Number(e.target.value) })}
                                        className="bw-input"
                                    >
                                        <option value={15}>15분</option>
                                        <option value={30}>30분</option>
                                        <option value={60}>1시간</option>
                                        <option value={120}>2시간</option>
                                        <option value={480}>8시간</option>
                                    </select>
                                </div>

                                {/* 로그인 시도 제한 */}
                                <div className="as-field">
                                    <label className="as-label">
                                        최대 로그인 시도 횟수
                                    </label>
                                    <input
                                        type="number"
                                        value={security.loginAttempts}
                                        onChange={(e) => setSecurity({ ...security, loginAttempts: Number(e.target.value) })}
                                        className="bw-input"
                                        min="1"
                                        max="10"
                                    />
                                </div>

                                {/* 감사 로그 */}
                                <div className="as-row">
                                    <div>
                                        <p className="as-row-title">감사 로그</p>
                                        <p className="as-row-desc">모든 사용자 활동을 기록합니다</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSecurity({ ...security, auditLog: !security.auditLog })}
                                        className={`as-toggle ${security.auditLog ? 'on' : 'off'}`}
                                        aria-label="감사 로그"
                                    >
                                        <span className="as-toggle-thumb" />
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
                            className="as-section"
                        >
                            <h2 className="as-section-title">외관 설정</h2>

                            <div className="as-panel">
                                {/* 테마 */}
                                <div className="as-field">
                                    <label className="as-label">테마</label>
                                    <select
                                        value={appearance.theme}
                                        onChange={(e) => setAppearance({ ...appearance, theme: e.target.value as 'light' | 'dark' | 'auto' })}
                                        className="bw-input"
                                    >
                                        <option value="light">라이트</option>
                                        <option value="dark">다크</option>
                                        <option value="auto">시스템 설정</option>
                                    </select>
                                </div>

                                {/* 언어 */}
                                <div className="as-field">
                                    <label className="as-label">언어</label>
                                    <select
                                        value={appearance.language}
                                        onChange={(e) => setAppearance({ ...appearance, language: e.target.value })}
                                        className="bw-input"
                                    >
                                        <option value="ko">한국어</option>
                                        <option value="en">English</option>
                                        <option value="ja">日本語</option>
                                        <option value="zh">中文</option>
                                    </select>
                                </div>

                                {/* 시간대 */}
                                <div className="as-field">
                                    <label className="as-label">시간대</label>
                                    <select
                                        value={appearance.timezone}
                                        onChange={(e) => setAppearance({ ...appearance, timezone: e.target.value })}
                                        className="bw-input"
                                    >
                                        <option value="Asia/Seoul">Asia/Seoul (UTC+9)</option>
                                        <option value="America/New_York">America/New_York (UTC-5)</option>
                                        <option value="Europe/London">Europe/London (UTC+0)</option>
                                        <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
                                    </select>
                                </div>

                                {/* 시간 형식 */}
                                <div className="as-field">
                                    <label className="as-label">시간 형식</label>
                                    <div className="as-radio-group">
                                        <label className="as-radio-label">
                                            <input
                                                type="radio"
                                                value="12h"
                                                checked={appearance.timeFormat === '12h'}
                                                onChange={(e) => setAppearance({ ...appearance, timeFormat: e.target.value as '12h' | '24h' })}
                                                className="as-radio"
                                            />
                                            <span>12시간 (AM/PM)</span>
                                        </label>
                                        <label className="as-radio-label">
                                            <input
                                                type="radio"
                                                value="24h"
                                                checked={appearance.timeFormat === '24h'}
                                                onChange={(e) => setAppearance({ ...appearance, timeFormat: e.target.value as '12h' | '24h' })}
                                                className="as-radio"
                                            />
                                            <span>24시간</span>
                                        </label>
                                    </div>
                                </div>

                                {/* 컴팩트 모드 */}
                                <div className="as-row">
                                    <div>
                                        <p className="as-row-title">컴팩트 모드</p>
                                        <p className="as-row-desc">더 조밀한 레이아웃을 사용합니다</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setAppearance({ ...appearance, compactMode: !appearance.compactMode })}
                                        className={`as-toggle ${appearance.compactMode ? 'on' : 'off'}`}
                                        aria-label="컴팩트 모드"
                                    >
                                        <span className="as-toggle-thumb" />
                                    </button>
                                </div>

                                {/* 애니메이션 */}
                                <div className="as-row">
                                    <div>
                                        <p className="as-row-title">애니메이션</p>
                                        <p className="as-row-desc">UI 전환 애니메이션을 활성화합니다</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setAppearance({ ...appearance, animations: !appearance.animations })}
                                        className={`as-toggle ${appearance.animations ? 'on' : 'off'}`}
                                        aria-label="애니메이션"
                                    >
                                        <span className="as-toggle-thumb" />
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
                            className="as-section"
                        >
                            <h2 className="as-section-title">고급 설정</h2>

                            <div className="as-panel">
                                {/* 자동 저장 */}
                                <div className="as-row">
                                    <div>
                                        <p className="as-row-title">자동 저장</p>
                                        <p className="as-row-desc">작업 내용을 자동으로 저장합니다</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setAdvanced({ ...advanced, autoSave: !advanced.autoSave })}
                                        className={`as-toggle ${advanced.autoSave ? 'on' : 'off'}`}
                                        aria-label="자동 저장"
                                    >
                                        <span className="as-toggle-thumb" />
                                    </button>
                                </div>

                                {/* 자동 저장 간격 */}
                                {advanced.autoSave && (
                                    <div className="as-field">
                                        <label className="as-label">자동 저장 간격 (분)</label>
                                        <select
                                            value={advanced.autoSaveInterval}
                                            onChange={(e) => setAdvanced({ ...advanced, autoSaveInterval: Number(e.target.value) })}
                                            className="bw-input"
                                        >
                                            <option value={1}>1분</option>
                                            <option value={5}>5분</option>
                                            <option value={10}>10분</option>
                                            <option value={30}>30분</option>
                                        </select>
                                    </div>
                                )}

                                {/* 최대 파일 크기 */}
                                <div className="as-field">
                                    <label className="as-label">최대 파일 크기 (MB)</label>
                                    <input
                                        type="number"
                                        value={advanced.maxFileSize}
                                        onChange={(e) => setAdvanced({ ...advanced, maxFileSize: Number(e.target.value) })}
                                        className="bw-input"
                                        min="1"
                                        max="100"
                                    />
                                </div>

                                {/* 백업 설정 */}
                                <div className="as-row">
                                    <div>
                                        <p className="as-row-title">자동 백업</p>
                                        <p className="as-row-desc">데이터를 자동으로 백업합니다</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setAdvanced({ ...advanced, backupEnabled: !advanced.backupEnabled })}
                                        className={`as-toggle ${advanced.backupEnabled ? 'on' : 'off'}`}
                                        aria-label="자동 백업"
                                    >
                                        <span className="as-toggle-thumb" />
                                    </button>
                                </div>

                                {/* 분석 수집 */}
                                <div className="as-row">
                                    <div>
                                        <p className="as-row-title">사용 분석 수집</p>
                                        <p className="as-row-desc">서비스 개선을 위한 사용 데이터를 수집합니다</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setAdvanced({ ...advanced, analyticsEnabled: !advanced.analyticsEnabled })}
                                        className={`as-toggle ${advanced.analyticsEnabled ? 'on' : 'off'}`}
                                        aria-label="사용 분석 수집"
                                    >
                                        <span className="as-toggle-thumb" />
                                    </button>
                                </div>

                                {/* 디버그 모드 */}
                                <div className="as-row">
                                    <div>
                                        <p className="as-row-title">디버그 모드</p>
                                        <p className="as-row-desc">개발자용 디버그 정보를 표시합니다</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setAdvanced({ ...advanced, debugMode: !advanced.debugMode })}
                                        className={`as-toggle ${advanced.debugMode ? 'on' : 'off'}`}
                                        aria-label="디버그 모드"
                                    >
                                        <span className="as-toggle-thumb" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 액션 버튼 */}
            <div className="as-footer">
                <div className="as-footer-actions">
                    <button type="button" onClick={handleExport} className="bw-btn-secondary">
                        <Download className="h-4 w-4" aria-hidden />
                        <span>설정 내보내기</span>
                    </button>
                    <label className="bw-btn-secondary as-file-label">
                        <Upload className="h-4 w-4" aria-hidden />
                        <span>설정 가져오기</span>
                        <input type="file" accept=".json" onChange={handleImport} className="as-file-input" />
                    </label>
                </div>
                <div className="as-footer-actions">
                    <button type="button" onClick={handleReset} className="bw-btn-danger">
                        <RotateCcw className="h-4 w-4" aria-hidden />
                        <span>기본값으로 복원</span>
                    </button>
                    <button type="button" onClick={handleSave} disabled={isLoading} className="bw-btn-primary">
                        <Save className="h-4 w-4" aria-hidden />
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
                        className="as-confirm-overlay"
                        onClick={() => setShowConfirmDialog(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="as-confirm-panel"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="as-confirm-title">
                                <AlertTriangle className="as-confirm-icon h-6 w-6" aria-hidden />
                                <h3 className="as-section-title" style={{ marginBottom: 0 }}>확인</h3>
                            </div>
                            <p className="as-confirm-body">
                                모든 설정을 기본값으로 복원하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                            </p>
                            <div className="as-confirm-actions">
                                <button type="button" onClick={() => setShowConfirmDialog(false)} className="bw-btn-secondary">
                                    취소
                                </button>
                                <button type="button" onClick={confirmActionHandler} className="bw-btn-danger">
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
