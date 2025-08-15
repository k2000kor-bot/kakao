import React, { useState, useEffect } from 'react';
import {
    CogIcon,
    UserIcon,
    ShieldCheckIcon,
    BellIcon,
    EyeIcon,
    GlobeAltIcon,
    SunIcon,
    MoonIcon,
    ComputerDesktopIcon,
    DevicePhoneMobileIcon,
    WrenchScrewdriverIcon,
    ChartBarIcon,
    KeyIcon,
    LockClosedIcon,
    CloudIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface SettingCategory {
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<any>;
    settings: Setting[];
}

interface Setting {
    id: string;
    name: string;
    description: string;
    type: 'boolean' | 'string' | 'number' | 'select' | 'textarea';
    value: any;
    options?: { label: string; value: any }[];
    category: string;
    required: boolean;
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
    };
}

interface AdvancedSettingsManagerProps {
    onSettingChange?: (settingId: string, value: any) => void;
    onSettingsSave?: (settings: Setting[]) => void;
    onSettingsReset?: () => void;
}

const AdvancedSettingsManager: React.FC<AdvancedSettingsManagerProps> = ({
    onSettingChange,
    onSettingsSave,
    onSettingsReset
}) => {
    const [settings, setSettings] = useState<Setting[]>([]);
    const [categories, setCategories] = useState<SettingCategory[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('general');
    const [searchQuery, setSearchQuery] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // 시뮬레이션된 설정 데이터
    useEffect(() => {
        const mockSettings: Setting[] = [
            // 일반 설정
            {
                id: 'theme',
                name: '테마',
                description: '애플리케이션의 색상 테마를 선택하세요',
                type: 'select',
                value: 'light',
                options: [
                    { label: '라이트', value: 'light' },
                    { label: '다크', value: 'dark' },
                    { label: '시스템', value: 'system' }
                ],
                category: 'general',
                required: true
            },
            {
                id: 'language',
                name: '언어',
                description: '인터페이스 언어를 선택하세요',
                type: 'select',
                value: 'ko',
                options: [
                    { label: '한국어', value: 'ko' },
                    { label: 'English', value: 'en' },
                    { label: '日本語', value: 'ja' }
                ],
                category: 'general',
                required: true
            },
            {
                id: 'timezone',
                name: '시간대',
                description: '표시할 시간대를 선택하세요',
                type: 'select',
                value: 'Asia/Seoul',
                options: [
                    { label: '서울 (UTC+9)', value: 'Asia/Seoul' },
                    { label: '뉴욕 (UTC-5)', value: 'America/New_York' },
                    { label: '런던 (UTC+0)', value: 'Europe/London' }
                ],
                category: 'general',
                required: true
            },
            {
                id: 'autoSave',
                name: '자동 저장',
                description: '작업 내용을 자동으로 저장합니다',
                type: 'boolean',
                value: true,
                category: 'general',
                required: false
            },
            {
                id: 'autoSaveInterval',
                name: '자동 저장 간격',
                description: '자동 저장 간격을 분 단위로 설정하세요',
                type: 'number',
                value: 5,
                category: 'general',
                required: false,
                validation: { min: 1, max: 60 }
            },

            // 보안 설정
            {
                id: 'twoFactorAuth',
                name: '2단계 인증',
                description: '계정 보안을 위해 2단계 인증을 활성화합니다',
                type: 'boolean',
                value: true,
                category: 'security',
                required: false
            },
            {
                id: 'sessionTimeout',
                name: '세션 타임아웃',
                description: '자동 로그아웃 시간을 분 단위로 설정하세요',
                type: 'number',
                value: 30,
                category: 'security',
                required: false,
                validation: { min: 5, max: 480 }
            },
            {
                id: 'passwordPolicy',
                name: '비밀번호 정책',
                description: '강력한 비밀번호 정책을 적용합니다',
                type: 'boolean',
                value: true,
                category: 'security',
                required: false
            },
            {
                id: 'loginAttempts',
                name: '로그인 시도 제한',
                description: '계정 잠금 전 최대 로그인 시도 횟수',
                type: 'number',
                value: 5,
                category: 'security',
                required: false,
                validation: { min: 3, max: 10 }
            },

            // 알림 설정
            {
                id: 'emailNotifications',
                name: '이메일 알림',
                description: '중요한 이벤트에 대한 이메일 알림을 받습니다',
                type: 'boolean',
                value: true,
                category: 'notifications',
                required: false
            },
            {
                id: 'pushNotifications',
                name: '푸시 알림',
                description: '브라우저 푸시 알림을 활성화합니다',
                type: 'boolean',
                value: false,
                category: 'notifications',
                required: false
            },
            {
                id: 'notificationSound',
                name: '알림음',
                description: '알림 시 소리를 재생합니다',
                type: 'boolean',
                value: true,
                category: 'notifications',
                required: false
            },
            {
                id: 'notificationTypes',
                name: '알림 유형',
                description: '받을 알림 유형을 선택하세요',
                type: 'select',
                value: 'all',
                options: [
                    { label: '모든 알림', value: 'all' },
                    { label: '중요한 알림만', value: 'important' },
                    { label: '시스템 알림만', value: 'system' }
                ],
                category: 'notifications',
                required: false
            },

            // 성능 설정
            {
                id: 'cacheEnabled',
                name: '캐시 활성화',
                description: '성능 향상을 위해 캐시를 사용합니다',
                type: 'boolean',
                value: true,
                category: 'performance',
                required: false
            },
            {
                id: 'cacheSize',
                name: '캐시 크기',
                description: '캐시 크기를 MB 단위로 설정하세요',
                type: 'number',
                value: 100,
                category: 'performance',
                required: false,
                validation: { min: 10, max: 1000 }
            },
            {
                id: 'autoOptimization',
                name: '자동 최적화',
                description: '시스템 성능을 자동으로 최적화합니다',
                type: 'boolean',
                value: true,
                category: 'performance',
                required: false
            },
            {
                id: 'dataRetention',
                name: '데이터 보관 기간',
                description: '데이터 보관 기간을 일 단위로 설정하세요',
                type: 'number',
                value: 90,
                category: 'performance',
                required: false,
                validation: { min: 7, max: 365 }
            }
        ];

        setSettings(mockSettings);

        const mockCategories: SettingCategory[] = [
            {
                id: 'general',
                name: '일반',
                description: '기본 애플리케이션 설정',
                icon: CogIcon,
                settings: mockSettings.filter(s => s.category === 'general')
            },
            {
                id: 'security',
                name: '보안',
                description: '계정 및 데이터 보안 설정',
                icon: ShieldCheckIcon,
                settings: mockSettings.filter(s => s.category === 'security')
            },
            {
                id: 'notifications',
                name: '알림',
                description: '알림 및 통지 설정',
                icon: BellIcon,
                settings: mockSettings.filter(s => s.category === 'notifications')
            },
            {
                id: 'performance',
                name: '성능',
                description: '시스템 성능 및 최적화 설정',
                icon: ChartBarIcon,
                settings: mockSettings.filter(s => s.category === 'performance')
            }
        ];

        setCategories(mockCategories);
    }, []);

    const handleSettingChange = (settingId: string, value: any) => {
        setSettings(prev =>
            prev.map(setting =>
                setting.id === settingId ? { ...setting, value } : setting
            )
        );
        setHasUnsavedChanges(true);
        onSettingChange?.(settingId, value);
    };

    const saveSettings = async () => {
        setIsSaving(true);
        try {
            // 시뮬레이션된 저장 지연
            await new Promise(resolve => setTimeout(resolve, 1000));
            setHasUnsavedChanges(false);
            onSettingsSave?.(settings);
        } catch (error) {
            console.error('설정 저장 실패:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const resetSettings = () => {
        if (window.confirm('모든 설정을 기본값으로 되돌리시겠습니까?')) {
            setSettings(prev =>
                prev.map(setting => ({
                    ...setting,
                    value: getDefaultValue(setting)
                }))
            );
            setHasUnsavedChanges(true);
            onSettingsReset?.();
        }
    };

    const getDefaultValue = (setting: Setting) => {
        switch (setting.type) {
            case 'boolean':
                return false;
            case 'number':
                return 0;
            case 'select':
                return setting.options?.[0]?.value || '';
            default:
                return '';
        }
    };

    const renderSettingInput = (setting: Setting) => {
        switch (setting.type) {
            case 'boolean':
                return (
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id={setting.id}
                            checked={setting.value}
                            onChange={(e) => handleSettingChange(setting.id, e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor={setting.id} className="sr-only">
                            {setting.name}
                        </label>
                    </div>
                );

            case 'select':
                return (
                    <select
                        value={setting.value}
                        onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {setting.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case 'number':
                return (
                    <input
                        type="number"
                        value={setting.value}
                        onChange={(e) => handleSettingChange(setting.id, Number(e.target.value))}
                        min={setting.validation?.min}
                        max={setting.validation?.max}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                );

            case 'textarea':
                return (
                    <textarea
                        value={setting.value}
                        onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                );

            default:
                return (
                    <input
                        type="text"
                        value={setting.value}
                        onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                );
        }
    };

    const filteredSettings = settings.filter(setting => {
        if (searchQuery) {
            return setting.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                setting.description.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return setting.category === activeCategory;
    });

    const renderSettingsList = () => (
        <div className="space-y-6">
            {filteredSettings.map((setting) => (
                <div key={setting.id} className="bg-white rounded-lg border p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-medium text-gray-900">{setting.name}</h3>
                                {setting.required && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-red-600 bg-red-50">
                                        필수
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 mb-4">{setting.description}</p>

                            <div className="max-w-md">
                                {renderSettingInput(setting)}
                            </div>

                            {setting.validation && (
                                <p className="text-xs text-gray-500 mt-2">
                                    {setting.validation.min !== undefined && setting.validation.max !== undefined &&
                                        `범위: ${setting.validation.min} - ${setting.validation.max}`}
                                    {setting.validation.pattern && `패턴: ${setting.validation.pattern}`}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderCategoryOverview = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">설정 개요</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className="bg-white rounded-lg border p-6 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
                    >
                        <div className="flex items-center space-x-3 mb-3">
                            <category.icon className="w-6 h-6 text-blue-500" />
                            <h4 className="text-lg font-medium text-gray-900">{category.name}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                        <p className="text-xs text-gray-500">
                            {category.settings.length}개의 설정
                        </p>
                    </div>
                ))}
            </div>

            {/* 빠른 설정 */}
            <div className="bg-white rounded-lg border p-6">
                <h4 className="font-medium text-gray-900 mb-4">빠른 설정</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">다크 모드</span>
                        <button
                            onClick={() => handleSettingChange('theme', 'dark')}
                            className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                        >
                            <MoonIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">알림 끄기</span>
                        <button
                            onClick={() => handleSettingChange('pushNotifications', false)}
                            className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                        >
                            <BellIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">성능 모드</span>
                        <button
                            onClick={() => handleSettingChange('autoOptimization', true)}
                            className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                        >
                            <ChartBarIcon className="w-4 h-4" />
                        </button>
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
                        <CogIcon className="w-6 h-6 text-blue-500" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">고급 설정 관리</h3>
                            <p className="text-sm text-gray-500">시스템 설정 및 환경 구성</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {hasUnsavedChanges && (
                            <span className="text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                저장되지 않은 변경사항
                            </span>
                        )}
                        <button
                            onClick={saveSettings}
                            disabled={isSaving || !hasUnsavedChanges}
                            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>{isSaving ? '저장 중...' : '저장'}</span>
                        </button>
                        <button
                            onClick={resetSettings}
                            className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center space-x-2"
                        >
                            <ArrowPathIcon className="w-4 h-4" />
                            <span>초기화</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 검색 */}
            <div className="bg-white border-b px-4 py-3">
                <div className="relative max-w-md">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="설정 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="bg-white border-b">
                <nav className="flex space-x-8 px-4">
                    {[
                        { id: 'overview', name: '개요', icon: EyeIcon },
                        ...categories.map(cat => ({ id: cat.id, name: cat.name, icon: cat.icon }))
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveCategory(tab.id)}
                            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeCategory === tab.id
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
                {activeCategory === 'overview' ? renderCategoryOverview() : renderSettingsList()}
            </div>
        </div>
    );
};

export default AdvancedSettingsManager; 