import React, { useState, useEffect } from 'react';
import {
  StarIcon,
    CogIcon,
    BellIcon,
    ShieldCheckIcon,
    ChartBarIcon,
    UserIcon,
    GlobeAltIcon,
    WrenchScrewdriverIcon,
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/react/24/outline';

interface SettingCategory {
    id: string;
    name: string;
    icon: React.ReactNode;
    description: string;
    settings: Setting[];
}

interface Setting {
    id: string;
    name: string;
    type: 'toggle' | 'select' | 'input' | 'slider' | 'color';
    value: any;
    description: string;
    options?: string[];
    min?: number;
    max?: number;
    step?: number;
}

interface AdvancedSettingsManagerProps {
    onSettingChange?: (categoryId: string, settingId: string, value: any) => void;
    onSave?: (settings: SettingCategory[]) => void;
}

const AdvancedSettingsManager: React.FC<AdvancedSettingsManagerProps> = ({
    onSettingChange,
    onSave
}) => {
    const [categories, setCategories] = useState<SettingCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('general');
    const [hasChanges, setHasChanges] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = () => {
        const defaultSettings: SettingCategory[] = [
            {
                id: 'general',
                name: '일반 설정',
                icon: <CogIcon className="w-5 h-5" />,
                description: '기본 시스템 설정',
                settings: [
                    {
                        id: 'auto-refresh',
                        name: '자동 새로고침',
                        type: 'toggle',
                        value: true,
                        description: '10초마다 데이터 자동 새로고침'
                    },
                    {
                        id: 'theme',
                        name: '테마',
                        type: 'select',
                        value: 'light',
                        description: '시스템 테마 선택',
                        options: ['light', 'dark', 'auto']
                    },
                    {
                        id: 'language',
                        name: '언어',
                        type: 'select',
                        value: 'ko',
                        description: '시스템 언어 설정',
                        options: ['ko', 'en', 'ja', 'zh']
                    }
                ]
            },
            {
                id: 'notifications',
                name: '알림 설정',
                icon: <BellIcon className="w-5 h-5" />,
                description: '알림 및 경고 설정',
                settings: [
                    {
                        id: 'enable-notifications',
                        name: '알림 활성화',
                        type: 'toggle',
                        value: true,
                        description: '시스템 알림 표시'
                    },
                    {
                        id: 'notification-sound',
                        name: '알림 소리',
                        type: 'toggle',
                        value: false,
                        description: '알림 시 소리 재생'
                    },
                    {
                        id: 'notification-duration',
                        name: '알림 지속시간',
                        type: 'slider',
                        value: 5,
                        description: '알림 표시 시간 (초)',
                        min: 1,
                        max: 30,
                        step: 1
                    }
                ]
            },
            {
                id: 'security',
                name: '보안 설정',
                icon: <ShieldCheckIcon className="w-5 h-5" />,
                description: '보안 및 권한 설정',
                settings: [
                    {
                        id: 'auto-logout',
                        name: '자동 로그아웃',
                        type: 'toggle',
                        value: false,
                        description: '비활성 시 자동 로그아웃'
                    },
                    {
                        id: 'session-timeout',
                        name: '세션 타임아웃',
                        type: 'slider',
                        value: 30,
                        description: '세션 유지 시간 (분)',
                        min: 5,
                        max: 120,
                        step: 5
                    },
                    {
                        id: 'data-encryption',
                        name: '데이터 암호화',
                        type: 'toggle',
                        value: true,
                        description: '민감한 데이터 암호화'
                    }
                ]
            },
            {
                id: 'performance',
                name: '성능 설정',
                icon: <ChartBarIcon className="w-5 h-5" />,
                description: '시스템 성능 최적화',
                settings: [
                    {
                        id: 'cache-enabled',
                        name: '캐시 활성화',
                        type: 'toggle',
                        value: true,
                        description: '데이터 캐싱으로 성능 향상'
                    },
                    {
                        id: 'cache-size',
                        name: '캐시 크기',
                        type: 'slider',
                        value: 50,
                        description: '캐시 메모리 크기 (MB)',
                        min: 10,
                        max: 200,
                        step: 10
                    },
                    {
                        id: 'auto-optimize',
                        name: '자동 최적화',
                        type: 'toggle',
                        value: true,
                        description: '시스템 자동 최적화'
                    }
                ]
            },
            {
                id: 'appearance',
                name: '외관 설정',
                icon: <EyeIcon className="w-5 h-5" />,
                description: 'UI/UX 설정',
                settings: [
                    {
                        id: 'compact-mode',
                        name: '컴팩트 모드',
                        type: 'toggle',
                        value: false,
                        description: '더 조밀한 레이아웃'
                    },
                    {
                        id: 'animations',
                        name: '애니메이션',
                        type: 'toggle',
                        value: true,
                        description: 'UI 애니메이션 활성화'
                    },
                    {
                        id: 'primary-color',
                        name: '주요 색상',
                        type: 'color',
                        value: '#3B82F6',
                        description: '시스템 주요 색상'
                    }
                ]
            }
        ];

        setCategories(defaultSettings);
    };

    const handleSettingChange = (categoryId: string, settingId: string, value: any) => {
        setCategories(prev =>
            prev.map(category =>
                category.id === categoryId
                    ? {
                        ...category,
                        settings: category.settings.map(setting =>
                            setting.id === settingId
                                ? { ...setting, value }
                                : setting
                        )
                    }
                    : category
            )
        );

        setHasChanges(true);

        if (onSettingChange) {
            onSettingChange(categoryId, settingId, value);
        }
    };

    const handleSave = () => {
        if (onSave) {
            onSave(categories);
        }
        setHasChanges(false);
        console.log('설정이 저장되었습니다:', categories);
    };

    const handleReset = () => {
        loadSettings();
        setHasChanges(false);
    };

    const renderSettingInput = (setting: Setting, categoryId: string) => {
        switch (setting.type) {
            case 'toggle':
                return (
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={setting.value}
                            onChange={(e) => handleSettingChange(categoryId, setting.id, e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                );

            case 'select':
                return (
                    <select
                        value={setting.value}
                        onChange={(e) => handleSettingChange(categoryId, setting.id, e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {setting.options?.map((option) => (
                            <option key={option} value={option}>
                                {option === 'ko' ? '한국어' :
                                    option === 'en' ? 'English' :
                                        option === 'ja' ? '日本語' :
                                            option === 'zh' ? '中文' :
                                                option === 'light' ? '밝은 테마' :
                                                    option === 'dark' ? '어두운 테마' :
                                                        option === 'auto' ? '자동' : option}
                            </option>
                        ))}
                    </select>
                );

            case 'slider':
                return (
                    <div className="flex items-center space-x-4">
                        <input
                            type="range"
                            min={setting.min}
                            max={setting.max}
                            step={setting.step}
                            value={setting.value}
                            onChange={(e) => handleSettingChange(categoryId, setting.id, parseInt(e.target.value))}
                            className="flex-1"
                        />
                        <span className="text-sm text-gray-600 min-w-[3rem]">{setting.value}</span>
                    </div>
                );

            case 'color':
                return (
                    <input
                        type="color"
                        value={setting.value}
                        onChange={(e) => handleSettingChange(categoryId, setting.id, e.target.value)}
                        className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                );

            default:
                return (
                    <input
                        type="text"
                        value={setting.value}
                        onChange={(e) => handleSettingChange(categoryId, setting.id, e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                );
        }
    };

    const currentCategory = categories.find(cat => cat.id === selectedCategory);

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">고급 설정</h1>
                    <p className="text-gray-600">시스템 설정 및 환경 구성</p>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
                    >
                        <WrenchScrewdriverIcon className="w-4 h-4" />
                        <span>고급</span>
                    </button>

                    {hasChanges && (
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                초기화
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                저장
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* 카테고리 사이드바 */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">카테고리</h3>
                        <div className="space-y-2">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${selectedCategory === category.id
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {category.icon}
                                    <div>
                                        <div className="font-medium">{category.name}</div>
                                        <div className="text-xs text-gray-500">{category.description}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 설정 내용 */}
                <div className="lg:col-span-3">
                    {currentCategory && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                {currentCategory.icon}
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">{currentCategory.name}</h2>
                                    <p className="text-gray-600">{currentCategory.description}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {currentCategory.settings.map((setting) => (
                                    <div key={setting.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <h3 className="font-medium text-gray-900">{setting.name}</h3>
                                                {setting.type === 'toggle' && (
                                                    <span className={`text-xs px-2 py-1 rounded-full ${setting.value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {setting.value ? '활성' : '비활성'}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                                        </div>
                                        <div className="ml-4">
                                            {renderSettingInput(setting, currentCategory.id)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 고급 설정 패널 */}
            {showAdvanced && (
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">고급 설정</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-2">시스템 정보</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">버전:</span>
                                    <span className="font-medium">1.0.0</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">빌드:</span>
                                    <span className="font-medium">2024.01.15</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">환경:</span>
                                    <span className="font-medium">Development</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-2">성능 통계</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">메모리 사용률:</span>
                                    <span className="font-medium">45%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">CPU 사용률:</span>
                                    <span className="font-medium">23%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">디스크 사용률:</span>
                                    <span className="font-medium">67%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedSettingsManager; 