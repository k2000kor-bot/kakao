import React, { useState, useEffect } from 'react';
import {
  StarIcon,
    ChartBarIcon,
    CpuChipIcon,
    CogIcon,
    BellIcon,
    UserGroupIcon,
    ClockIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

interface UltraAdvancedIntegratedDashboardProps {
    isActive?: boolean;
    onToggle?: () => void;
    onNavigate?: (path: string) => void;
}

const UltraAdvancedIntegratedDashboard: React.FC<UltraAdvancedIntegratedDashboardProps> = ({
    isActive = true,
    onToggle,
    onNavigate
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'ai' | 'settings'>('overview');
    const [systemStatus, setSystemStatus] = useState({
        cpu: 45,
        memory: 62,
        network: 78,
        storage: 34
    });

    useEffect(() => {
        // 시스템 상태 모니터링
        const interval = setInterval(() => {
            setSystemStatus(prev => ({
                cpu: Math.floor(Math.random() * 30) + 30,
                memory: Math.floor(Math.random() * 20) + 50,
                network: Math.floor(Math.random() * 30) + 60,
                storage: Math.floor(Math.random() * 20) + 25
            }));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-screen bg-gray-50 flex">
            {/* 좌측 패널 - 네비게이션 */}
            <div className="w-80 bg-white border-r border-gray-200 p-6 space-y-6 overflow-y-auto">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <CpuChipIcon className="w-5 h-5 mr-2" />
                        고급 대시보드
                    </h2>
                    <div className="space-y-2">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`w-full p-3 text-left rounded-lg transition-colors ${activeTab === 'overview'
                                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                } border`}
                        >
                            <div className="flex items-center space-x-2">
                                <ChartBarIcon className="w-5 h-5" />
                                <span>개요</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`w-full p-3 text-left rounded-lg transition-colors ${activeTab === 'analytics'
                                    ? 'bg-green-100 border-green-300 text-green-800'
                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                } border`}
                        >
                            <div className="flex items-center space-x-2">
                                <StarIcon className="w-5 h-5" />
                                <span>분석</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('ai')}
                            className={`w-full p-3 text-left rounded-lg transition-colors ${activeTab === 'ai'
                                    ? 'bg-purple-100 border-purple-300 text-purple-800'
                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                } border`}
                        >
                            <div className="flex items-center space-x-2">
                                <CogIcon className="w-5 h-5" />
                                <span>AI 시스템</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`w-full p-3 text-left rounded-lg transition-colors ${activeTab === 'settings'
                                    ? 'bg-orange-100 border-orange-300 text-orange-800'
                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                } border`}
                        >
                            <div className="flex items-center space-x-2">
                                <BellIcon className="w-5 h-5" />
                                <span>설정</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* 시스템 상태 */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">시스템 상태</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">CPU 사용률</span>
                            <span className="text-sm font-medium">{systemStatus.cpu}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">메모리 사용률</span>
                            <span className="text-sm font-medium">{systemStatus.memory}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">네트워크</span>
                            <span className="text-sm font-medium">{systemStatus.network}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">저장공간</span>
                            <span className="text-sm font-medium">{systemStatus.storage}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 중앙 패널 - 메인 콘텐츠 */}
            <div className="flex-1 bg-white flex flex-col">
                {/* 헤더 */}
                <div className="border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                                <StarIcon className="w-6 h-6 mr-2 text-purple-500" />
                                고급 통합 대시보드
                            </h1>
                            <p className="text-gray-600">AI 시스템 통합 모니터링 및 관리</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                <span className="text-sm text-gray-600">시스템 정상</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 메인 콘텐츠 */}
                <div className="flex-1 p-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-blue-600">총 메시지</p>
                                            <p className="text-2xl font-bold text-blue-900">4,106</p>
                                        </div>
                                        <DocumentTextIcon className="w-8 h-8 text-blue-400" />
                                    </div>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-green-600">활성 사용자</p>
                                            <p className="text-2xl font-bold text-green-900">70</p>
                                        </div>
                                        <UserGroupIcon className="w-8 h-8 text-green-400" />
                                    </div>
                                </div>
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-purple-600">AI 응답</p>
                                            <p className="text-2xl font-bold text-purple-900">1,234</p>
                                        </div>
                                        <CpuChipIcon className="w-8 h-8 text-purple-400" />
                                    </div>
                                </div>
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-orange-600">평균 응답시간</p>
                                            <p className="text-2xl font-bold text-orange-900">2.3초</p>
                                        </div>
                                        <ClockIcon className="w-8 h-8 text-orange-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="space-y-6">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-green-800 mb-4">실시간 분석</h3>
                                <p className="text-green-700">
                                    AI 기반 실시간 데이터 분석 및 인사이트 제공
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'ai' && (
                        <div className="space-y-6">
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-purple-800 mb-4">AI 시스템</h3>
                                <p className="text-purple-700">
                                    고급 AI 모델 통합 및 학습 시스템
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-orange-800 mb-4">시스템 설정</h3>
                                <p className="text-orange-700">
                                    고급 시스템 설정 및 구성 관리
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 우측 패널 - 빠른 액션 */}
            <div className="w-96 bg-white border-l border-gray-200 p-6 space-y-6 overflow-y-auto">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">빠른 액션</h2>
                    <div className="space-y-3">
                        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                            시스템 새로고침
                        </button>
                        <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                            데이터 백업
                        </button>
                        <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors">
                            AI 모델 업데이트
                        </button>
                        <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors">
                            로그 확인
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UltraAdvancedIntegratedDashboard; 