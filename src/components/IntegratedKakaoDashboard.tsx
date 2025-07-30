import React, { useState, useEffect } from 'react';
import {
    ChartBarIcon,
    UserGroupIcon,
    ChatBubbleLeftRightIcon,
    ClockIcon,
    ArrowTrendingUpIcon,
    ExclamationTriangleIcon,
    CogIcon,
    PlusIcon,
    WrenchScrewdriverIcon,
    SparklesIcon,
    DocumentTextIcon,
    PresentationChartLineIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
    totalMessages: number;
    activeUsers: number;
    responseTime: number;
    sentimentScore: number;
    trendingTopics: string[];
    alerts: string[];
}

interface IntegratedKakaoDashboardProps {
    selectedRoomId: string;
}

const IntegratedKakaoDashboard: React.FC<IntegratedKakaoDashboardProps> = ({ selectedRoomId }) => {
    const [stats, setStats] = useState<DashboardStats>({
        totalMessages: 0,
        activeUsers: 0,
        responseTime: 0,
        sentimentScore: 0,
        trendingTopics: [],
        alerts: []
    });

    const [activeTab, setActiveTab] = useState<string>('overview');
    const [isLoading, setIsLoading] = useState(true);
    const [showFeatureModal, setShowFeatureModal] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch(`http://localhost:8004/api/v1/analytics?room_id=${selectedRoomId}`);
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.log('API 연결 실패, 샘플 데이터 사용');
                // 샘플 데이터
                setStats({
                    totalMessages: 5265,
                    activeUsers: 42,
                    responseTime: 2.3,
                    sentimentScore: 75,
                    trendingTopics: ['시공사 선정', '분담금', '평면도', '계약서'],
                    alerts: ['새로운 메시지 15개', '감정 점수 상승', '트렌딩 토픽 변경']
                });
            }
            setIsLoading(false);
        };

        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000); // 30초마다 업데이트
        return () => clearInterval(interval);
    }, [selectedRoomId]);

    const getSentimentColor = (score: number) => {
        if (score >= 80) return 'bg-green-100 text-green-800';
        if (score >= 60) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    const tabs = [
        { id: 'overview', name: '개요', icon: ChartBarIcon },
        { id: 'analysis', name: '분석', icon: PresentationChartLineIcon },
        { id: 'generation', name: '생성', icon: SparklesIcon },
        { id: 'management', name: '관리', icon: CogIcon },
        { id: 'tools', name: '도구', icon: WrenchScrewdriverIcon }
    ];

    const features = [
        { id: 'real-time-analysis', name: '실시간 분석', description: '대화 실시간 분석 및 통계' },
        { id: 'ai-generation', name: 'AI 메시지 생성', description: '카카오톡 스타일 메시지 생성' },
        { id: 'sentiment-analysis', name: '감정 분석', description: '대화 감정 및 톤 분석' },
        { id: 'trending-topics', name: '트렌딩 토픽', description: '인기 주제 및 키워드 추출' },
        { id: 'conversation-summary', name: '대화 요약', description: '날짜별 대화 요약 및 분석' },
        { id: 'user-profiles', name: '사용자 프로필', description: '참여자별 대화 패턴 분석' },
        { id: 'prediction-system', name: '예측 시스템', description: '다음 대화 흐름 예측' },
        { id: 'automation', name: '자동화', description: '반복 작업 자동화' }
    ];

    const renderOverview = () => (
        <div className="space-y-6">
            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-500" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">총 메시지</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalMessages.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <UserGroupIcon className="w-8 h-8 text-green-500" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">활성 사용자</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <ClockIcon className="w-8 h-8 text-purple-500" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">평균 응답시간</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.responseTime}초</p>
                        </div>
                    </div>
                </div>

                <div className={`rounded-lg p-6 ${getSentimentColor(stats.sentimentScore)}`}>
                    <div className="flex items-center">
                        <ArrowTrendingUpIcon className="w-8 h-8" />
                        <div className="ml-3">
                            <p className="text-sm font-medium">감정 점수</p>
                            <p className="text-2xl font-bold">{stats.sentimentScore}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 트렌딩 토픽 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">트렌딩 토픽</h3>
                </div>
                <div className="p-6">
                    <div className="flex flex-wrap gap-2">
                        {stats.trendingTopics.map((topic, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                {topic}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* 실시간 알림 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">실시간 알림</h3>
                </div>
                <div className="p-6">
                    <div className="space-y-3">
                        {stats.alerts.map((alert, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                                <span className="text-sm text-yellow-800">{alert}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAnalysis = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">고급 분석 도구</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <DocumentTextIcon className="w-6 h-6 text-blue-500 mb-2" />
                        <h4 className="font-medium text-gray-900">대화 패턴 분석</h4>
                        <p className="text-sm text-gray-600">사용자별 대화 패턴 및 통계</p>
                    </button>
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <PresentationChartLineIcon className="w-6 h-6 text-green-500 mb-2" />
                        <h4 className="font-medium text-gray-900">감정 트렌드</h4>
                        <p className="text-sm text-gray-600">시간별 감정 변화 분석</p>
                    </button>
                </div>
            </div>
        </div>
    );

    const renderGeneration = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI 메시지 생성</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">생성 스타일</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="normal">일반</option>
                            <option value="emotion">감정적</option>
                            <option value="formal">정중한</option>
                            <option value="casual">친근한</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">주제</label>
                        <input
                            type="text"
                            placeholder="메시지 주제를 입력하세요..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                        메시지 생성
                    </button>
                </div>
            </div>
        </div>
    );

    const renderManagement = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">시스템 관리</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <CogIcon className="w-6 h-6 text-gray-500 mb-2" />
                        <h4 className="font-medium text-gray-900">설정</h4>
                        <p className="text-sm text-gray-600">시스템 설정 및 구성</p>
                    </button>
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <WrenchScrewdriverIcon className="w-6 h-6 text-gray-500 mb-2" />
                        <h4 className="font-medium text-gray-900">유지보수</h4>
                        <p className="text-sm text-gray-600">시스템 점검 및 업데이트</p>
                    </button>
                </div>
            </div>
        </div>
    );

    const renderTools = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">개발 도구</h3>
                    <button
                        onClick={() => setShowFeatureModal(true)}
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span>기능 추가</span>
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {features.map((feature) => (
                        <div key={feature.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                            <h4 className="font-medium text-gray-900">{feature.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return renderOverview();
            case 'analysis':
                return renderAnalysis();
            case 'generation':
                return renderGeneration();
            case 'management':
                return renderManagement();
            case 'tools':
                return renderTools();
            default:
                return renderOverview();
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* 헤더 */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">K</span>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900">통합 카카오톡 대화 대응 시스템</h1>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-500">대화방: {selectedRoomId}</span>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-600">온라인</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span>{tab.name}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {renderContent()}
            </div>

            {/* 기능 추가 모달 */}
            {showFeatureModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">새로운 기능 추가</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">기능 이름</label>
                                    <input
                                        type="text"
                                        placeholder="기능 이름을 입력하세요"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
                                    <textarea
                                        placeholder="기능 설명을 입력하세요"
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setShowFeatureModal(false)}
                                        className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={() => setShowFeatureModal(false)}
                                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        추가
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntegratedKakaoDashboard; 