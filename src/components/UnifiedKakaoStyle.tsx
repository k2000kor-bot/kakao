import React, { useState } from 'react';
import {
    ChartBarIcon,
    UserGroupIcon,
    CogIcon,
    BellIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XMarkIcon,
    PlusIcon,
    MinusIcon,
    LightBulbIcon,
    FaceSmileIcon,
    FaceFrownIcon,
    ClockIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import RealTimeConversationDashboard from './RealTimeConversationDashboard';
import AdvancedMessageGenerator from './AdvancedMessageGenerator';
import UltraAdvancedMessageGenerator from './UltraAdvancedMessageGenerator';
import UltraAdvancedAIAnalytics from './UltraAdvancedAIAnalytics';

interface UnifiedKakaoStyleProps {
    selectedRoomId: string;
}

interface AIModel {
    name: string;
    status: 'ready' | 'training' | 'error';
    progress?: number;
}

interface MessageFormat {
    id: string;
    name: string;
    description: string;
    isSelected: boolean;
    isWarning?: boolean;
}

const UnifiedKakaoStyle: React.FC<UnifiedKakaoStyleProps> = ({ selectedRoomId }) => {
    const [activeTab, setActiveTab] = useState<string>('dashboard');
    const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

    const [messageFormats, setMessageFormats] = useState<MessageFormat[]>([
        { id: 'concurrence', name: '동조', description: '상대방 의견에 동조', isSelected: false },
        { id: 'support', name: '응호', description: '지지와 격려', isSelected: false },
        { id: 'empathy', name: '공감', description: '감정적 공감', isSelected: false },
        { id: 'suggestion', name: '제안', description: '건설적 제안', isSelected: false },
        { id: 'conjecture', name: '추측', description: '가능성 추측', isSelected: false },
        { id: 'rebuttal', name: '반박', description: '논리적 반박', isSelected: false },
        { id: 'counter-question', name: '반문', description: '질문으로 반문', isSelected: false },
        { id: 'opposition', name: '반대', description: '명확한 반대', isSelected: false },
        { id: 'mockery', name: '조롱', description: '비꼬는 표현', isSelected: false },
        { id: 'neutral', name: '중립', description: '중립적 입장', isSelected: false },
        { id: 'evasion', name: '회피', description: '회피적 응답', isSelected: false },
        { id: 'ignore', name: '무시', description: '무시하는 태도', isSelected: false },
        { id: 'coercion', name: '강압', description: '강압적 표현', isSelected: false, isWarning: true },
        { id: 'compulsion', name: '강제', description: '강제적 요구', isSelected: false, isWarning: true },
        { id: 'brainwashing', name: '세뇌', description: '세뇌적 표현', isSelected: false, isWarning: true },
        { id: 'gaslighting', name: '가스라이팅', description: '가스라이팅 기법', isSelected: true, isWarning: true }
    ]);

    const [aiModels] = useState<AIModel[]>([
        { name: '감정 분석 모델', status: 'ready', progress: 94.2 },
        { name: '의도 분석 모델', status: 'training', progress: 67.8 },
        { name: '응답 생성 모델', status: 'ready', progress: 91.8 },
        { name: '패턴 인식 모델', status: 'error', progress: 0 }
    ]);

    const [conversationData] = useState({
        totalMessages: 4913,
        displayedMessages: 4913,
        participants: 74,
        isLearning: true
    });

    const [generationSettings] = useState({
        emotion: '기쁨',
        style: '자세하게',
        context: '일반',
        formality: ['친근하게', '보통'],
        responseLength: ['보통', '친근하게'],
        emotionalIntensity: ['보통', '직접적']
    });

    const [generatedMessages] = useState([
        {
            id: 1,
            content: '그렇군요. 더 자세한 이야기를 들려주세요',
            feedback: 'normal',
            format: 'gaslighting'
        },
        {
            id: 2,
            content: '너무 입지나 조건을 종합적으로 봐야겠죠 ㅎ!',
            feedback: 'normal',
            format: 'gaslighting'
        },
        {
            id: 3,
            content: '진짜 부동산은 정말 복잡한 것 같아요!',
            feedback: 'normal',
            format: 'gaslighting'
        },
        {
            id: 4,
            content: '부동산은 정말 복잡한 것 같아요!',
            feedback: 'normal',
            format: 'gaslighting'
        }
    ]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ready': return 'text-green-600';
            case 'training': return 'text-yellow-600';
            case 'error': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ready': return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
            case 'training': return <ClockIcon className="w-4 h-4 text-yellow-600" />;
            case 'error': return <XCircleIcon className="w-4 h-4 text-red-600" />;
            default: return <CogIcon className="w-4 h-4 text-gray-600" />;
        }
    };

    const handleFormatToggle = (formatId: string) => {
        setMessageFormats(prev => prev.map(format =>
            format.id === formatId
                ? { ...format, isSelected: !format.isSelected }
                : format
        ));
    };

    const handleFeedback = (messageId: number, feedback: string) => {
        // 피드백 처리 로직
        console.log(`Message ${messageId} feedback: ${feedback}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
            {/* 상단 네비게이션 */}
            <div className="bg-white shadow-lg border-b border-yellow-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                                    <ChartBarIcon className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-gray-900">카카오톡 AI 분석</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex space-x-2">
                                {['dashboard', 'analysis', 'generation', 'settings'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab
                                            ? 'bg-yellow-500 text-white'
                                            : 'text-gray-600 hover:bg-yellow-100'
                                            }`}
                                    >
                                        {tab === 'dashboard' && '대시보드'}
                                        {tab === 'analysis' && '분석'}
                                        {tab === 'generation' && '생성'}
                                        {tab === 'settings' && '설정'}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <BellIcon className="w-5 h-5" />
                                <span>시스템 상태: 정상</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-12 gap-6">
                    {/* 왼쪽 패널 - 채팅방 정보 */}
                    <div className="col-span-3">
                        <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <UserGroupIcon className="w-5 h-5 mr-2 text-yellow-500" />
                                채팅방 정보
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        채팅방 이름
                                    </label>
                                    <div className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">
                                        {selectedRoomId || '선택된 채팅방 없음'}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        참여자 수
                                    </label>
                                    <div className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">
                                        {conversationData.participants}명
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        총 메시지 수
                                    </label>
                                    <div className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">
                                        {conversationData.totalMessages.toLocaleString()}개
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        기간 필터
                                    </label>
                                    <select
                                        value={selectedPeriod}
                                        onChange={(e) => setSelectedPeriod(e.target.value)}
                                        className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                        title="기간 선택"
                                    >
                                        <option value="all">전체 기간</option>
                                        <option value="today">오늘</option>
                                        <option value="week">이번 주</option>
                                        <option value="month">이번 달</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 중앙 패널 - AI 학습 시스템 */}
                    <div className="col-span-6">
                        <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-500" />
                                AI 학습 시스템
                            </h3>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                {aiModels.map((model, index) => (
                                    <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">{model.name}</span>
                                            {getStatusIcon(model.status)}
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-300 ${model.status === 'ready' ? 'bg-green-500' :
                                                    model.status === 'training' ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${model.progress}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-gray-500">{model.progress}%</span>
                                            <span className={`text-xs ${getStatusColor(model.status)}`}>
                                                {model.status === 'ready' ? '준비됨' :
                                                    model.status === 'training' ? '학습 중' : '오류'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 실시간 대화 분석 대시보드 */}
                            <RealTimeConversationDashboard selectedRoomId={selectedRoomId} />
                        </div>
                    </div>

                    {/* 오른쪽 패널 - 메시지 형식 선택 */}
                    <div className="col-span-3">
                        <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <CogIcon className="w-5 h-5 mr-2 text-yellow-500" />
                                메시지 형식 선택
                            </h3>

                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {messageFormats.map((format) => (
                                    <div key={format.id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={format.id}
                                            checked={format.isSelected}
                                            onChange={() => handleFormatToggle(format.id)}
                                            className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                                        />
                                        <label
                                            htmlFor={format.id}
                                            className={`text-sm cursor-pointer ${format.isWarning ? 'text-red-600 font-medium' : 'text-gray-700'
                                                }`}
                                        >
                                            {format.name}
                                        </label>
                                    </div>
                                ))}
                            </div>

                            {messageFormats.some(f => f.isWarning && f.isSelected) && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center">
                                        <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mr-2" />
                                        <span className="text-sm text-red-700">
                                            조작적 메시지 형식이 선택되었습니다. 주의해서 사용하세요.
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 하단 패널들 */}
                <div className="grid grid-cols-12 gap-6 mt-6">
                    {/* 개인화 설정 */}
                    <div className="col-span-4">
                        <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">개인화 설정</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        공식성
                                    </label>
                                    <select
                                        className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                        title="공식성 선택"
                                    >
                                        <option>친근하게</option>
                                        <option>보통</option>
                                        <option>공식적으로</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        응답 길이
                                    </label>
                                    <select
                                        className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                        title="응답 길이 선택"
                                    >
                                        <option>짧게</option>
                                        <option>보통</option>
                                        <option>자세하게</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        감정 강도
                                    </label>
                                    <select
                                        className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                        title="감정 강도 선택"
                                    >
                                        <option>약하게</option>
                                        <option>보통</option>
                                        <option>강하게</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 초고도화 메시지 생성 */}
                    <div className="col-span-4">
                        <UltraAdvancedMessageGenerator selectedRoomId={selectedRoomId} />
                    </div>

                    {/* 초고도화 AI 분석 */}
                    <div className="col-span-4">
                        <UltraAdvancedAIAnalytics selectedRoomId={selectedRoomId} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnifiedKakaoStyle; 