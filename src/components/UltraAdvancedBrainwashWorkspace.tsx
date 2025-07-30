import React, { useState, useEffect } from 'react';
import {
  StarIcon,
    CpuChipIcon,
    CogIcon,
    BellIcon,
    UserGroupIcon,
    ClockIcon,
    DocumentTextIcon,
    BeakerIcon,
    AcademicCapIcon,
    TrophyIcon
} from '@heroicons/react/24/outline';

interface UltraAdvancedBrainwashWorkspaceProps {
    isActive?: boolean;
    onToggle?: () => void;
}

const UltraAdvancedBrainwashWorkspace: React.FC<UltraAdvancedBrainwashWorkspaceProps> = ({
    isActive = true,
    onToggle
}) => {
    const [activeTab, setActiveTab] = useState<'workspace' | 'experiments' | 'analysis' | 'settings'>('workspace');
    const [experimentStatus, setExperimentStatus] = useState({
        activeExperiments: 3,
        successRate: 87.5,
        totalTests: 156,
        currentPhase: 'Phase 3'
    });

    useEffect(() => {
        // 실험 상태 업데이트
        const interval = setInterval(() => {
            setExperimentStatus(prev => ({
                ...prev,
                activeExperiments: Math.max(1, Math.min(5, prev.activeExperiments + (Math.random() > 0.5 ? 1 : -1))),
                successRate: Math.max(70, Math.min(95, prev.successRate + (Math.random() - 0.5) * 2))
            }));
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-screen bg-gray-50 flex">
            {/* 좌측 패널 - 워크스페이스 네비게이션 */}
            <div className="w-80 bg-white border-r border-gray-200 p-6 space-y-6 overflow-y-auto">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <BeakerIcon className="w-5 h-5 mr-2" />
                        브레인워시 워크스페이스
                    </h2>
                    <div className="space-y-2">
                        <button
                            onClick={() => setActiveTab('workspace')}
                            className={`w-full p-3 text-left rounded-lg transition-colors ${activeTab === 'workspace'
                                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                } border`}
                        >
                            <div className="flex items-center space-x-2">
                                <CpuChipIcon className="w-5 h-5" />
                                <span>워크스페이스</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('experiments')}
                            className={`w-full p-3 text-left rounded-lg transition-colors ${activeTab === 'experiments'
                                    ? 'bg-green-100 border-green-300 text-green-800'
                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                } border`}
                        >
                            <div className="flex items-center space-x-2">
                                <BeakerIcon className="w-5 h-5" />
                                <span>실험</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('analysis')}
                            className={`w-full p-3 text-left rounded-lg transition-colors ${activeTab === 'analysis'
                                    ? 'bg-purple-100 border-purple-300 text-purple-800'
                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                } border`}
                        >
                            <div className="flex items-center space-x-2">
                                <AcademicCapIcon className="w-5 h-5" />
                                <span>분석</span>
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
                                <CogIcon className="w-5 h-5" />
                                <span>설정</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* 실험 상태 */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">실험 상태</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">활성 실험</span>
                            <span className="text-sm font-medium">{experimentStatus.activeExperiments}개</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">성공률</span>
                            <span className="text-sm font-medium">{experimentStatus.successRate.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">총 테스트</span>
                            <span className="text-sm font-medium">{experimentStatus.totalTests}개</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">현재 단계</span>
                            <span className="text-sm font-medium">{experimentStatus.currentPhase}</span>
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
                                브레인워시 워크스페이스
                            </h1>
                            <p className="text-gray-600">고급 심리적 영향 분석 및 실험</p>
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
                    {activeTab === 'workspace' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-blue-600">심리적 영향</p>
                                            <p className="text-2xl font-bold text-blue-900">87.5%</p>
                                        </div>
                                        <CpuChipIcon className="w-8 h-8 text-blue-400" />
                                    </div>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-green-600">성공률</p>
                                            <p className="text-2xl font-bold text-green-900">92.3%</p>
                                        </div>
                                        <TrophyIcon className="w-8 h-8 text-green-400" />
                                    </div>
                                </div>
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-purple-600">실험 수</p>
                                            <p className="text-2xl font-bold text-purple-900">156</p>
                                        </div>
                                        <BeakerIcon className="w-8 h-8 text-purple-400" />
                                    </div>
                                </div>
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-orange-600">평균 지속시간</p>
                                            <p className="text-2xl font-bold text-orange-900">3.2일</p>
                                        </div>
                                        <ClockIcon className="w-8 h-8 text-orange-400" />
                                    </div>
                                </div>
                                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-indigo-600">대상 그룹</p>
                                            <p className="text-2xl font-bold text-indigo-900">70명</p>
                                        </div>
                                        <UserGroupIcon className="w-8 h-8 text-indigo-400" />
                                    </div>
                                </div>
                                <div className="bg-pink-50 border border-pink-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-pink-600">정확도</p>
                                            <p className="text-2xl font-bold text-pink-900">94.7%</p>
                                        </div>
                                        <AcademicCapIcon className="w-8 h-8 text-pink-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'experiments' && (
                        <div className="space-y-6">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-green-800 mb-4">실험 관리</h3>
                                <p className="text-green-700">
                                    고급 심리적 영향 실험 및 분석 시스템
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'analysis' && (
                        <div className="space-y-6">
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-purple-800 mb-4">심리 분석</h3>
                                <p className="text-purple-700">
                                    고급 심리적 영향 분석 및 패턴 인식
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-orange-800 mb-4">실험 설정</h3>
                                <p className="text-orange-700">
                                    고급 실험 설정 및 매개변수 조정
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 우측 패널 - 실험 액션 */}
            <div className="w-96 bg-white border-l border-gray-200 p-6 space-y-6 overflow-y-auto">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">실험 액션</h2>
                    <div className="space-y-3">
                        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                            새 실험 시작
                        </button>
                        <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                            데이터 분석
                        </button>
                        <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors">
                            패턴 학습
                        </button>
                        <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors">
                            결과 내보내기
                        </button>
                        <button className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors">
                            실험 중단
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UltraAdvancedBrainwashWorkspace;
