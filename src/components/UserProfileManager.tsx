import React, { useState } from 'react';
import {
    UserCircleIcon,
    CogIcon,
    PencilIcon,
    ChartBarIcon,
    ClockIcon,
    DocumentTextIcon,
    StarIcon,
    EyeIcon,
    TrashIcon,
    PlusIcon,
    CameraIcon,
    XCircleIcon,
    ShieldCheckIcon,
    GlobeAltIcon,
    KeyIcon,
    BellIcon
} from '@heroicons/react/24/outline';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    department: string;
    preferredFormats: string[];
    customTemplates: CustomTemplate[];
    usageHistory: UsageRecord[];
    settings: UserSettings;
    createdAt: string;
    lastActive: string;
    stats: UserStats;
}

interface CustomTemplate {
    id: string;
    name: string;
    description: string;
    content: string;
    format: string;
    category: string;
    isPublic: boolean;
    usageCount: number;
    createdAt: string;
    tags: string[];
}

interface UsageRecord {
    id: string;
    action: string;
    format: string;
    content: string;
    timestamp: string;
    effectiveness: number;
}

interface UserSettings {
    notifications: {
        email: boolean;
        push: boolean;
        updates: boolean;
    };
    privacy: {
        shareUsage: boolean;
        publicProfile: boolean;
        allowAnalytics: boolean;
    };
    interface: {
        theme: 'light' | 'dark' | 'auto';
        language: string;
        autoSave: boolean;
        compactMode: boolean;
    };
    security: {
        twoFactor: boolean;
        sessionTimeout: number;
        loginAlerts: boolean;
    };
}

interface UserStats {
    totalMessages: number;
    totalRewrites: number;
    favoriteFormat: string;
    avgEffectiveness: number;
    streakDays: number;
    totalTime: number;
}

const UserProfileManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);

    // 프로필 데이터
    const [userProfile, setUserProfile] = useState<UserProfile>({
        id: 'user_001',
        name: '김철수',
        email: 'kimcs@company.com',
        avatar: undefined,
        role: '프로덕트 매니저',
        department: '기획팀',
        preferredFormats: ['empathy', 'suggestion', 'professional'],
        customTemplates: [
            {
                id: 'template_001',
                name: '회의 일정 조율',
                description: '팀 회의 일정을 조율할 때 사용하는 템플릿',
                content: '안녕하세요. {날짜}에 {주제} 관련 회의를 진행하고자 합니다...',
                format: 'suggestion',
                category: '업무',
                isPublic: false,
                usageCount: 15,
                createdAt: '2024-01-15T09:00:00Z',
                tags: ['회의', '일정', '협업']
            },
            {
                id: 'template_002',
                name: '고객 응대 표준',
                description: '고객 문의에 대한 공감적 응답 템플릿',
                content: '고객님의 불편사항을 충분히 이해합니다...',
                format: 'empathy',
                category: '고객서비스',
                isPublic: true,
                usageCount: 32,
                createdAt: '2024-01-10T14:30:00Z',
                tags: ['고객', '서비스', '응대']
            }
        ],
        usageHistory: [
            {
                id: 'usage_001',
                action: '메시지 생성',
                format: '공감 형식',
                content: '고객 불만 처리',
                timestamp: '2024-01-20T10:15:00Z',
                effectiveness: 0.92
            },
            {
                id: 'usage_002',
                action: '텍스트 리라이팅',
                format: '제안 형식',
                content: '프로젝트 제안서',
                timestamp: '2024-01-19T16:45:00Z',
                effectiveness: 0.88
            }
        ],
        settings: {
            notifications: {
                email: true,
                push: false,
                updates: true
            },
            privacy: {
                shareUsage: false,
                publicProfile: false,
                allowAnalytics: true
            },
            interface: {
                theme: 'light',
                language: 'ko',
                autoSave: true,
                compactMode: false
            },
            security: {
                twoFactor: false,
                sessionTimeout: 30,
                loginAlerts: true
            }
        },
        createdAt: '2024-01-01T00:00:00Z',
        lastActive: '2024-01-20T10:15:00Z',
        stats: {
            totalMessages: 156,
            totalRewrites: 89,
            favoriteFormat: '공감 형식',
            avgEffectiveness: 0.85,
            streakDays: 12,
            totalTime: 1250
        }
    });

    const [newTemplate, setNewTemplate] = useState<Partial<CustomTemplate>>({
        name: '',
        description: '',
        content: '',
        format: 'suggestion',
        category: '업무',
        isPublic: false,
        tags: []
    });

    const handleProfileUpdate = (field: string, value: any) => {
        setUserProfile(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSettingsUpdate = (category: keyof UserSettings, field: string, value: any) => {
        setUserProfile(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                [category]: {
                    ...prev.settings[category],
                    [field]: value
                }
            }
        }));
    };

    const handleCreateTemplate = () => {
        if (newTemplate.name && newTemplate.content) {
            const template: CustomTemplate = {
                id: `template_${Date.now()}`,
                name: newTemplate.name,
                description: newTemplate.description || '',
                content: newTemplate.content,
                format: newTemplate.format || 'suggestion',
                category: newTemplate.category || '업무',
                isPublic: newTemplate.isPublic || false,
                usageCount: 0,
                createdAt: new Date().toISOString(),
                tags: newTemplate.tags || []
            };

            setUserProfile(prev => ({
                ...prev,
                customTemplates: [...prev.customTemplates, template]
            }));

            setNewTemplate({
                name: '',
                description: '',
                content: '',
                format: 'suggestion',
                category: '업무',
                isPublic: false,
                tags: []
            });
            setShowTemplateModal(false);
        }
    };

    const handleDeleteTemplate = (templateId: string) => {
        setUserProfile(prev => ({
            ...prev,
            customTemplates: prev.customTemplates.filter(t => t.id !== templateId)
        }));
    };

    const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                handleProfileUpdate('avatar', e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}시간 ${mins}분`;
    };

    const tabs = [
        { id: 'profile', name: '프로필', icon: UserCircleIcon },
        { id: 'templates', name: '템플릿', icon: DocumentTextIcon },
        { id: 'history', name: '사용 기록', icon: ClockIcon },
        { id: 'stats', name: '통계', icon: ChartBarIcon },
        { id: 'settings', name: '설정', icon: CogIcon }
    ];

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* 헤더 */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">사용자 프로필 관리</h1>
            </div>

            {/* 탭 네비게이션 */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span>{tab.name}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* 프로필 탭 */}
            {activeTab === 'profile' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 기본 정보 */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">기본 정보</h3>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200"
                            >
                                <PencilIcon className="h-4 w-4" />
                                <span>{isEditing ? '저장' : '편집'}</span>
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* 프로필 이미지 */}
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    {userProfile.avatar ? (
                                        <img
                                            src={userProfile.avatar}
                                            alt="Profile"
                                            className="w-20 h-20 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center">
                                            <UserCircleIcon className="w-12 h-12 text-purple-600" />
                                        </div>
                                    )}
                                    {isEditing && (
                                        <label className="absolute -bottom-2 -right-2 bg-purple-600 rounded-full p-2 cursor-pointer hover:bg-purple-700">
                                            <CameraIcon className="h-4 w-4 text-white" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarUpload}
                                                className="hidden"
                                                aria-label="프로필 이미지 업로드"
                                            />
                                        </label>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-xl font-semibold text-gray-900">{userProfile.name}</h4>
                                    <p className="text-gray-600">{userProfile.role}</p>
                                    <p className="text-sm text-gray-500">{userProfile.department}</p>
                                </div>
                            </div>

                            {/* 정보 입력 필드 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={userProfile.name}
                                            onChange={(e) => handleProfileUpdate('name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                            aria-label="이름"
                                        />
                                    ) : (
                                        <p className="py-2 text-gray-900">{userProfile.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={userProfile.email}
                                            onChange={(e) => handleProfileUpdate('email', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                            aria-label="이메일"
                                        />
                                    ) : (
                                        <p className="py-2 text-gray-900">{userProfile.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">직책</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={userProfile.role}
                                            onChange={(e) => handleProfileUpdate('role', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                            aria-label="직책"
                                        />
                                    ) : (
                                        <p className="py-2 text-gray-900">{userProfile.role}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">부서</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={userProfile.department}
                                            onChange={(e) => handleProfileUpdate('department', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                            aria-label="부서"
                                        />
                                    ) : (
                                        <p className="py-2 text-gray-900">{userProfile.department}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 활동 요약 */}
                    <div className="space-y-6">
                        {/* 최근 활동 */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h3>
                            <div className="space-y-3">
                                <div className="flex items-center text-sm">
                                    <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-gray-600">가입일:</span>
                                    <span className="ml-2 text-gray-900">{formatDate(userProfile.createdAt)}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-gray-600">마지막 접속:</span>
                                    <span className="ml-2 text-gray-900">{formatDate(userProfile.lastActive)}</span>
                                </div>
                            </div>
                        </div>

                        {/* 빠른 통계 */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 통계</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">총 메시지</span>
                                    <span className="font-semibold text-purple-600">{userProfile.stats.totalMessages}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">리라이팅</span>
                                    <span className="font-semibold text-green-600">{userProfile.stats.totalRewrites}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">연속 사용</span>
                                    <span className="font-semibold text-orange-600">{userProfile.stats.streakDays}일</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">평균 효과성</span>
                                    <span className="font-semibold text-blue-600">{Math.round(userProfile.stats.avgEffectiveness * 100)}%</span>
                                </div>
                            </div>
                        </div>

                        {/* 선호 형식 */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">선호 메시지 형식</h3>
                            <div className="space-y-2">
                                {userProfile.preferredFormats.map((format, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">{format}</span>
                                        <StarIcon className="h-4 w-4 text-yellow-500" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 템플릿 탭 */}
            {activeTab === 'templates' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">나만의 템플릿</h3>
                        </div>
                        <button
                            onClick={() => setShowTemplateModal(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                            <PlusIcon className="h-4 w-4" />
                            <span>새 템플릿</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userProfile.customTemplates.map((template) => (
                            <div key={template.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 mb-1">{template.name}</h4>
                                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                                        <div className="flex items-center space-x-2 mb-3">
                                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                                {template.format}
                                            </span>
                                            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                                                {template.category}
                                            </span>
                                            {template.isPublic && (
                                                <GlobeAltIcon className="h-4 w-4 text-green-500" />
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteTemplate(template.id)}
                                        className="text-gray-400 hover:text-red-500"
                                        title="템플릿 삭제"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg line-clamp-3">
                                        {template.content}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <div className="flex items-center space-x-1">
                                        <EyeIcon className="h-4 w-4" />
                                        <span>{template.usageCount}회 사용</span>
                                    </div>
                                    <span>{formatDate(template.createdAt)}</span>
                                </div>

                                {template.tags.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {template.tags.map((tag, index) => (
                                            <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 사용 기록 탭 */}
            {activeTab === 'history' && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">사용 기록</h3>
                    <div className="bg-white rounded-xl border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            활동
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            형식
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            내용
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            효과성
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            시간
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {userProfile.usageHistory.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {record.action}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                                    {record.format}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                                {record.content}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className={`text-sm font-medium ${record.effectiveness > 0.8 ? 'text-green-600' :
                                                        record.effectiveness > 0.6 ? 'text-yellow-600' : 'text-red-600'
                                                        }`}>
                                                        {Math.round(record.effectiveness * 100)}%
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(record.timestamp)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* 통계 탭 */}
            {activeTab === 'stats' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <DocumentTextIcon className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">총 메시지</p>
                                <p className="text-2xl font-semibold text-gray-900">{userProfile.stats.totalMessages}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <PencilIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">리라이팅</p>
                                <p className="text-2xl font-semibold text-gray-900">{userProfile.stats.totalRewrites}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <StarIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">평균 효과성</p>
                                <p className="text-2xl font-semibold text-gray-900">{Math.round(userProfile.stats.avgEffectiveness * 100)}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <ClockIcon className="h-6 w-6 text-orange-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">사용 시간</p>
                                <p className="text-2xl font-semibold text-gray-900">{formatTime(userProfile.stats.totalTime)}</p>
                            </div>
                        </div>
                    </div>

                    {/* 추가 통계 */}
                    <div className="md:col-span-2 lg:col-span-4 bg-white rounded-xl border border-gray-200 p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">상세 통계</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <h5 className="font-medium text-gray-700 mb-2">선호 형식</h5>
                                <p className="text-lg font-semibold text-purple-600">{userProfile.stats.favoriteFormat}</p>
                                <p className="text-sm text-gray-500">가장 많이 사용한 형식</p>
                            </div>
                            <div>
                                <h5 className="font-medium text-gray-700 mb-2">연속 사용</h5>
                                <p className="text-lg font-semibold text-orange-600">{userProfile.stats.streakDays}일</p>
                                <p className="text-sm text-gray-500">연속 사용 기록</p>
                            </div>
                            <div>
                                <h5 className="font-medium text-gray-700 mb-2">템플릿</h5>
                                <p className="text-lg font-semibold text-green-600">{userProfile.customTemplates.length}개</p>
                                <p className="text-sm text-gray-500">생성한 템플릿 수</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 설정 탭 */}
            {activeTab === 'settings' && (
                <div className="space-y-6">
                    {/* 알림 설정 */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center mb-4">
                            <BellIcon className="h-5 w-5 text-gray-500 mr-2" />
                            <h4 className="text-lg font-semibold text-gray-900">알림 설정</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">이메일 알림</p>
                                    <p className="text-sm text-gray-500">중요한 업데이트를 이메일로 받기</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={userProfile.settings.notifications.email}
                                        onChange={(e) => handleSettingsUpdate('notifications', 'email', e.target.checked)}
                                        className="sr-only peer"
                                        aria-label="이메일 알림"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">푸시 알림</p>
                                    <p className="text-sm text-gray-500">브라우저 푸시 알림 받기</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={userProfile.settings.notifications.push}
                                        onChange={(e) => handleSettingsUpdate('notifications', 'push', e.target.checked)}
                                        className="sr-only peer"
                                        aria-label="푸시 알림"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* 개인정보 설정 */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center mb-4">
                            <ShieldCheckIcon className="h-5 w-5 text-gray-500 mr-2" />
                            <h4 className="text-lg font-semibold text-gray-900">개인정보 설정</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">사용 데이터 공유</p>
                                    <p className="text-sm text-gray-500">서비스 개선을 위한 익명 데이터 공유</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={userProfile.settings.privacy.shareUsage}
                                        onChange={(e) => handleSettingsUpdate('privacy', 'shareUsage', e.target.checked)}
                                        className="sr-only peer"
                                        aria-label="사용 데이터 공유"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">공개 프로필</p>
                                    <p className="text-sm text-gray-500">다른 사용자에게 프로필 공개</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={userProfile.settings.privacy.publicProfile}
                                        onChange={(e) => handleSettingsUpdate('privacy', 'publicProfile', e.target.checked)}
                                        className="sr-only peer"
                                        aria-label="공개 프로필"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* 인터페이스 설정 */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center mb-4">
                            <CogIcon className="h-5 w-5 text-gray-500 mr-2" />
                            <h4 className="text-lg font-semibold text-gray-900">인터페이스 설정</h4>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">테마</label>
                                <select
                                    value={userProfile.settings.interface.theme}
                                    onChange={(e) => handleSettingsUpdate('interface', 'theme', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                    aria-label="테마 선택"
                                >
                                    <option value="light">라이트</option>
                                    <option value="dark">다크</option>
                                    <option value="auto">자동</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">언어</label>
                                <select
                                    value={userProfile.settings.interface.language}
                                    onChange={(e) => handleSettingsUpdate('interface', 'language', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                    aria-label="언어 선택"
                                >
                                    <option value="ko">한국어</option>
                                    <option value="en">English</option>
                                    <option value="ja">日本語</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">자동 저장</p>
                                    <p className="text-sm text-gray-500">작업 내용을 자동으로 저장</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={userProfile.settings.interface.autoSave}
                                        onChange={(e) => handleSettingsUpdate('interface', 'autoSave', e.target.checked)}
                                        className="sr-only peer"
                                        aria-label="자동 저장"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* 보안 설정 */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center mb-4">
                            <KeyIcon className="h-5 w-5 text-gray-500 mr-2" />
                            <h4 className="text-lg font-semibold text-gray-900">보안 설정</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">2단계 인증</p>
                                    <p className="text-sm text-gray-500">계정 보안 강화</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={userProfile.settings.security.twoFactor}
                                        onChange={(e) => handleSettingsUpdate('security', 'twoFactor', e.target.checked)}
                                        className="sr-only peer"
                                        aria-label="2단계 인증"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">세션 타임아웃 (분)</label>
                                <select
                                    value={userProfile.settings.security.sessionTimeout}
                                    onChange={(e) => handleSettingsUpdate('security', 'sessionTimeout', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                    aria-label="세션 타임아웃 설정"
                                >
                                    <option value={15}>15분</option>
                                    <option value={30}>30분</option>
                                    <option value={60}>1시간</option>
                                    <option value={120}>2시간</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 템플릿 생성 모달 */}
            {showTemplateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">새 템플릿 만들기</h3>
                            <button
                                onClick={() => setShowTemplateModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                                title="모달 닫기"
                            >
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">템플릿 이름</label>
                                <input
                                    type="text"
                                    value={newTemplate.name || ''}
                                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="템플릿 이름을 입력하세요"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
                                <input
                                    type="text"
                                    value={newTemplate.description || ''}
                                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="템플릿 설명을 입력하세요"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">형식</label>
                                    <select
                                        value={newTemplate.format || 'suggestion'}
                                        onChange={(e) => setNewTemplate(prev => ({ ...prev, format: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                        aria-label="메시지 형식 선택"
                                    >
                                        <option value="suggestion">제안</option>
                                        <option value="empathy">공감</option>
                                        <option value="professional">전문적</option>
                                        <option value="friendly">친근한</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                                    <select
                                        value={newTemplate.category || '업무'}
                                        onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                        aria-label="카테고리 선택"
                                    >
                                        <option value="업무">업무</option>
                                        <option value="고객서비스">고객서비스</option>
                                        <option value="마케팅">마케팅</option>
                                        <option value="개인">개인</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">템플릿 내용</label>
                                <textarea
                                    value={newTemplate.content || ''}
                                    onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                                    rows={6}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="템플릿 내용을 입력하세요. {변수}를 사용하여 동적 내용을 포함할 수 있습니다."
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isPublic"
                                    checked={newTemplate.isPublic || false}
                                    onChange={(e) => setNewTemplate(prev => ({ ...prev, isPublic: e.target.checked }))}
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                />
                                <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                                    다른 사용자와 공유하기
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setShowTemplateModal(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleCreateTemplate}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                                생성
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfileManager; 