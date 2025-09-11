import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings,
    Save,
    RefreshCw,
    Shield,
    Database,
    Bell,
    Globe,
    Palette,
    Zap,
    Lock,
    Unlock,
    Eye,
    EyeOff,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Info,
    Clock,
    Calendar,
    FileText,
    Download,
    Upload,
    Trash2,
    Plus,
    Edit,
    Copy,
    ExternalLink
} from 'lucide-react';

interface SystemSetting {
    id: string;
    category: string;
    name: string;
    description: string;
    type: 'text' | 'number' | 'boolean' | 'select' | 'textarea';
    value: any;
    defaultValue: any;
    options?: string[];
    required: boolean;
    validation?: string;
}

interface SystemSettingsProps {
    onSettingChange?: (settingId: string, value: any) => void;
    onSave?: (settings: SystemSetting[]) => void;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({ onSettingChange, onSave }) => {
    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('general');
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Mock 설정 데이터
    useEffect(() => {
        const mockSettings: SystemSetting[] = [
            // 일반 설정
            {
                id: 'site_name',
                category: 'general',
                name: '사이트 이름',
                description: '시스템에 표시될 사이트 이름',
                type: 'text',
                value: 'CORBU AI',
                defaultValue: 'CORBU AI',
                required: true
            },
            {
                id: 'site_description',
                category: 'general',
                name: '사이트 설명',
                description: '시스템에 대한 간단한 설명',
                type: 'textarea',
                value: 'AI 기반 프로젝트 관리 및 협업 플랫폼',
                defaultValue: 'AI 기반 프로젝트 관리 및 협업 플랫폼',
                required: false
            },
            {
                id: 'timezone',
                category: 'general',
                name: '시간대',
                description: '시스템에서 사용할 시간대',
                type: 'select',
                value: 'Asia/Seoul',
                defaultValue: 'Asia/Seoul',
                options: ['Asia/Seoul', 'UTC', 'America/New_York', 'Europe/London'],
                required: true
            },
            {
                id: 'language',
                category: 'general',
                name: '언어',
                description: '시스템 인터페이스 언어',
                type: 'select',
                value: 'ko',
                defaultValue: 'ko',
                options: ['ko', 'en', 'ja', 'zh'],
                required: true
            },

            // 보안 설정
            {
                id: 'session_timeout',
                category: 'security',
                name: '세션 타임아웃',
                description: '사용자 세션 자동 종료 시간 (분)',
                type: 'number',
                value: 30,
                defaultValue: 30,
                required: true,
                validation: 'min:5,max:480'
            },
            {
                id: 'password_min_length',
                category: 'security',
                name: '최소 비밀번호 길이',
                description: '사용자 비밀번호 최소 길이',
                type: 'number',
                value: 8,
                defaultValue: 8,
                required: true,
                validation: 'min:6,max:32'
            },
            {
                id: 'require_2fa',
                category: 'security',
                name: '2단계 인증 필수',
                description: '관리자 계정에 2단계 인증 필수 적용',
                type: 'boolean',
                value: true,
                defaultValue: true,
                required: false
            },
            {
                id: 'max_login_attempts',
                category: 'security',
                name: '최대 로그인 시도 횟수',
                description: '계정 잠금 전 최대 로그인 시도 횟수',
                type: 'number',
                value: 5,
                defaultValue: 5,
                required: true,
                validation: 'min:3,max:10'
            },

            // 알림 설정
            {
                id: 'email_notifications',
                category: 'notifications',
                name: '이메일 알림',
                description: '시스템 이벤트에 대한 이메일 알림 활성화',
                type: 'boolean',
                value: true,
                defaultValue: true,
                required: false
            },
            {
                id: 'push_notifications',
                category: 'notifications',
                name: '푸시 알림',
                description: '브라우저 푸시 알림 활성화',
                type: 'boolean',
                value: false,
                defaultValue: false,
                required: false
            },
            {
                id: 'notification_sound',
                category: 'notifications',
                name: '알림 소리',
                description: '알림 시 소리 재생',
                type: 'boolean',
                value: true,
                defaultValue: true,
                required: false
            },

            // 성능 설정
            {
                id: 'auto_backup',
                category: 'performance',
                name: '자동 백업',
                description: '정기적인 시스템 자동 백업 활성화',
                type: 'boolean',
                value: true,
                defaultValue: true,
                required: false
            },
            {
                id: 'backup_interval',
                category: 'performance',
                name: '백업 주기',
                description: '자동 백업 실행 주기',
                type: 'select',
                value: 'daily',
                defaultValue: 'daily',
                options: ['hourly', 'daily', 'weekly', 'monthly'],
                required: false
            },
            {
                id: 'cache_enabled',
                category: 'performance',
                name: '캐시 활성화',
                description: '시스템 성능 향상을 위한 캐시 사용',
                type: 'boolean',
                value: true,
                defaultValue: true,
                required: false
            },
            {
                id: 'max_file_size',
                category: 'performance',
                name: '최대 파일 크기',
                description: '업로드 가능한 최대 파일 크기 (MB)',
                type: 'number',
                value: 50,
                defaultValue: 50,
                required: true,
                validation: 'min:1,max:500'
            }
        ];
        setSettings(mockSettings);
    }, []);

    const categories = [
        { id: 'general', name: '일반', icon: Settings },
        { id: 'security', name: '보안', icon: Shield },
        { id: 'notifications', name: '알림', icon: Bell },
        { id: 'performance', name: '성능', icon: Zap }
    ];

    const handleSettingChange = (settingId: string, value: any) => {
        setSettings(prev => prev.map(setting =>
            setting.id === settingId ? { ...setting, value } : setting
        ));
        setHasChanges(true);
        onSettingChange?.(settingId, value);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // 시뮬레이션된 저장 지연
            await new Promise(resolve => setTimeout(resolve, 1000));
            setHasChanges(false);
            onSave?.(settings);
        } catch (error) {
            console.error('설정 저장 실패:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        if (window.confirm('모든 설정을 기본값으로 되돌리시겠습니까?')) {
            setSettings(prev => prev.map(setting => ({
                ...setting,
                value: setting.defaultValue
            })));
            setHasChanges(true);
        }
    };

    const validateSetting = (setting: SystemSetting, value: any): boolean => {
        if (setting.required && !value) return false;

        if (setting.validation) {
            const [rule, range] = setting.validation.split(':');
            const [min, max] = range.split(',');

            if (rule === 'min' && value < parseInt(min)) return false;
            if (rule === 'max' && value > parseInt(max)) return false;
        }

        return true;
    };

    const getInvalidSettings = (): SystemSetting[] => {
        return settings.filter(setting => !validateSetting(setting, setting.value));
    };

    const renderSettingInput = (setting: SystemSetting) => {
        const isValid = validateSetting(setting, setting.value);
        const baseClasses = "w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent";
        const inputClasses = isValid ? baseClasses : `${baseClasses} border-red-300`;

        switch (setting.type) {
            case 'text':
                return (
                    <input
                        type="text"
                        value={setting.value}
                        onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                        className={inputClasses}
                        placeholder={setting.description}
                    />
                );
            case 'number':
                return (
                    <input
                        type="number"
                        value={setting.value}
                        onChange={(e) => handleSettingChange(setting.id, parseInt(e.target.value))}
                        className={inputClasses}
                        min={setting.validation?.split(',')[0]?.split(':')[1]}
                        max={setting.validation?.split(',')[1]}
                    />
                );
            case 'boolean':
                return (
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={setting.value}
                            onChange={(e) => handleSettingChange(setting.id, e.target.checked)}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-600">
                            {setting.value ? '활성화' : '비활성화'}
                        </span>
                    </div>
                );
            case 'select':
                return (
                    <select
                        value={setting.value}
                        onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                        className={inputClasses}
                    >
                        {setting.options?.map(option => (
                            <option key={option} value={option}>
                                {option === 'ko' ? '한국어' :
                                    option === 'en' ? 'English' :
                                        option === 'ja' ? '日本語' :
                                            option === 'zh' ? '中文' :
                                                option === 'Asia/Seoul' ? '한국 표준시' :
                                                    option === 'UTC' ? '협정 세계시' :
                                                        option === 'America/New_York' ? '미국 동부 시간' :
                                                            option === 'Europe/London' ? '영국 시간' :
                                                                option === 'hourly' ? '매시간' :
                                                                    option === 'daily' ? '매일' :
                                                                        option === 'weekly' ? '매주' :
                                                                            option === 'monthly' ? '매월' :
                                                                                option}
                            </option>
                        ))}
                    </select>
                );
            case 'textarea':
                return (
                    <textarea
                        value={setting.value}
                        onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                        className={inputClasses}
                        rows={3}
                        placeholder={setting.description}
                    />
                );
            default:
                return null;
        }
    };

    const filteredSettings = settings.filter(setting => setting.category === selectedCategory);
    const invalidSettings = getInvalidSettings();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                        <Settings className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">시스템 설정</h2>
                        <p className="text-sm text-gray-600">시스템 전반적인 설정 관리</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                        {showAdvanced ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                        {showAdvanced ? '기본 보기' : '고급 보기'}
                    </button>
                    <button
                        onClick={handleReset}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        기본값으로 복원
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !hasChanges || invalidSettings.length > 0}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        {isSaving ? '저장 중...' : '저장'}
                    </button>
                </div>
            </div>

            {/* Validation Errors */}
            {invalidSettings.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                        <h3 className="text-sm font-medium text-red-800">설정 오류</h3>
                    </div>
                    <div className="mt-2 text-sm text-red-700">
                        <ul className="list-disc list-inside space-y-1">
                            {invalidSettings.map(setting => (
                                <li key={setting.id}>{setting.name}: 유효하지 않은 값입니다.</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            <div className="flex space-x-6">
                {/* Category Navigation */}
                <div className="w-64 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">설정 카테고리</h3>
                    <nav className="space-y-2">
                        {categories.map((category) => {
                            const IconComponent = category.icon;
                            const categorySettings = settings.filter(s => s.category === category.id);
                            const invalidCount = categorySettings.filter(s => !validateSetting(s, s.value)).length;

                            return (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${selectedCategory === category.id
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <IconComponent className="w-4 h-4 mr-2" />
                                        {category.name}
                                    </div>
                                    {invalidCount > 0 && (
                                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                                            {invalidCount}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Settings Content */}
                <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="space-y-6">
                        {filteredSettings.map((setting) => {
                            const isValid = validateSetting(setting, setting.value);
                            return (
                                <div key={setting.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <h4 className="text-lg font-medium text-gray-900">{setting.name}</h4>
                                                {setting.required && (
                                                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                                                        필수
                                                    </span>
                                                )}
                                                {!isValid && (
                                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                                        </div>
                                        {showAdvanced && (
                                            <div className="text-xs text-gray-500">
                                                ID: {setting.id}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        {renderSettingInput(setting)}
                                        {!isValid && (
                                            <p className="text-sm text-red-600">
                                                유효하지 않은 값입니다. {setting.validation && `(${setting.validation})`}
                                            </p>
                                        )}
                                    </div>

                                    {showAdvanced && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                                                <div>
                                                    <span className="font-medium">기본값:</span> {String(setting.defaultValue)}
                                                </div>
                                                <div>
                                                    <span className="font-medium">타입:</span> {setting.type}
                                                </div>
                                                {setting.validation && (
                                                    <div className="col-span-2">
                                                        <span className="font-medium">검증 규칙:</span> {setting.validation}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;
