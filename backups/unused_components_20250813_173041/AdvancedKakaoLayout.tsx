import React, { useState, useEffect } from 'react';
import {
    ChatBubbleLeftRightIcon,
    UserGroupIcon,
    DocumentTextIcon,
    CalendarIcon,
    CogIcon,
    ChartBarIcon,
    SparklesIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ArrowTrendingUpIcon,
    WrenchScrewdriverIcon,
    DocumentMagnifyingGlassIcon,
    PresentationChartLineIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';
import AdvancedEmotionAnalyzer from './AdvancedEmotionAnalyzer';
import RealTimeNotificationSystem from './RealTimeNotificationSystem';
import AdvancedAIAnalytics from './AdvancedAIAnalytics';

interface AdvancedKakaoLayoutProps {
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

const AdvancedKakaoLayout: React.FC<AdvancedKakaoLayoutProps> = ({ selectedRoomId }) => {
    const [activeTab, setActiveTab] = useState<string>('analysis');
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

    const [generatedMessages, setGeneratedMessages] = useState([
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
        setGeneratedMessages(prev => prev.map(msg =>
            msg.id === messageId
                ? { ...msg, feedback }
                : msg
        ));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 상단 네비게이션 탭 */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <nav className="flex space-x-8">
                            {[
                                { id: 'sample', name: '샘플 로드', icon: DocumentTextIcon },
                                { id: 'upload', name: '파일 업로드', icon: DocumentMagnifyingGlassIcon },
                                { id: 'analysis', name: '분석', icon: ChartBarIcon },
                                { id: 'monitor', name: '성능 모니터', icon: PresentationChartLineIcon }
                            ].map((tab) => (
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
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">시스템 상태: 정상</span>
                            <RealTimeNotificationSystem />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-12 gap-6">

                    {/* 왼쪽 패널 - 대화방 정보 */}
                    <div className="col-span-3 space-y-6">

                        {/* 대화방 정보 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-500" />
                                <div>
                                    <h3 className="font-semibold text-gray-900">대화방</h3>
                                    <p className="text-sm text-gray-600">[인증] 행복한소유☆개포우성7차 110 님과 카카오톡 대화</p>
                                </div>
                            </div>
                            <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800">
                                대화방 선택
                            </button>
                        </div>

                        {/* 참여자 정보 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <UserGroupIcon className="w-6 h-6 text-green-500" />
                                <div>
                                    <h3 className="font-semibold text-gray-900">참여자</h3>
                                    <p className="text-sm text-gray-600">{conversationData.participants}명</p>
                                </div>
                            </div>
                            <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800">
                                참여자 선택
                            </button>
                        </div>

                        {/* 메시지 수 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <DocumentTextIcon className="w-6 h-6 text-purple-500" />
                                <div>
                                    <h3 className="font-semibold text-gray-900">전체 메시지</h3>
                                    <p className="text-sm text-gray-600">{conversationData.totalMessages.toLocaleString()}개</p>
                                </div>
                            </div>
                        </div>

                        {/* 기간 선택 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <CalendarIcon className="w-6 h-6 text-orange-500" />
                                <h3 className="font-semibold text-gray-900">기간 선택</h3>
                            </div>
                            <div className="space-y-2">
                                {['전체', '오늘', '일주일', '한달', '날짜기간'].map((period) => (
                                    <button
                                        key={period}
                                        onClick={() => setSelectedPeriod(period)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm ${selectedPeriod === period
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 중앙 패널 - AI 학습 시스템 */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI 학습 시스템</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-sm font-medium">감정 분석</span>
                                </div>
                                <div className="text-xs text-gray-600">학습 완료</div>
                            </div>
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    <span className="text-sm font-medium">의도 분석</span>
                                </div>
                                <div className="text-xs text-gray-600">학습 중...</div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm font-medium">응답 생성</span>
                                </div>
                                <div className="text-xs text-gray-600">준비 완료</div>
                            </div>
                            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <span className="text-sm font-medium">패턴 인식</span>
                                </div>
                                <div className="text-xs text-gray-600">업데이트 중...</div>
                            </div>
                        </div>

                        {/* 고급 감정 분석 추가 */}
                        <div className="mt-6">
                            <AdvancedEmotionAnalyzer />
                        </div>

                        {/* 고급 AI 분석 추가 */}
                        <div className="mt-6">
                            <AdvancedAIAnalytics />
                        </div>
                    </div>

                    {/* 중앙-오른쪽 패널 - 대화 내용 */}
                    <div className="col-span-4">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        대화 내용 ({conversationData.totalMessages.toLocaleString()}개)
                                    </h3>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600">
                                            {conversationData.displayedMessages}/{conversationData.totalMessages}개 표시됨
                                        </span>
                                        {conversationData.isLearning && (
                                            <span className="text-sm text-blue-600">학습 중...</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {/* 실제 대화 내용 */}
                                    <div className="text-sm text-gray-700 leading-relaxed">
                                        <div className="mb-4">
                                            <span className="text-gray-500">2025. 6. 24.</span>
                                            <p className="mt-2">
                                                개인적으로 커뮤니티 시설은 럭셔리 아파트에서 필수 요소라고 생각합니다.
                                                단지 내에서 중요한 요소로 커뮤니티 시설을 적극적으로 활용해야 한다고 생각합니다.
                                            </p>
                                        </div>
                                    </div>

                                    {/* AI 생성된 응답 메시지들 */}
                                    {generatedMessages.map((message, index) => (
                                        <div key={message.id} className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-blue-700">
                                                    AI 생성된 응답 메시지 ({index + 1}/{generatedMessages.length})
                                                </span>
                                                <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                                                    gaslighting. AI 생성 응답
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 mb-3">{message.content}</p>

                                            {/* 피드백 버튼들 */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex space-x-2">
                                                    <span className="text-xs text-gray-600">이 응답이 어땠나요?</span>
                                                    {['좋아요', '보통', '별로'].map((feedback) => (
                                                        <button
                                                            key={feedback}
                                                            onClick={() => handleFeedback(message.id, feedback)}
                                                            className={`px-2 py-1 text-xs rounded ${message.feedback === feedback
                                                                ? 'bg-blue-500 text-white'
                                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                                }`}
                                                        >
                                                            {feedback}
                                                        </button>
                                                    ))}
                                                </div>
                                                <button className="text-xs text-blue-600 hover:text-blue-800">
                                                    복사하기
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* 이전 메시지들 */}
                                    <div className="text-sm text-gray-700 space-y-2">
                                        <div>
                                            <span className="text-gray-500">2025. 6. 24.</span>
                                            <p>초기에는 개래블보다 비쌌다고하네요</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">2025. 6. 24.</span>
                                            <p>4단지는 입지가 좋죠.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 오른쪽 패널 - 메시지 형식 선택 */}
                    <div className="col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">메시지 형식 선택</h3>

                            {/* 현재 설정 */}
                            <div className="mb-4 space-y-2">
                                <div className="text-sm">
                                    <span className="text-gray-600">감정:</span> {generationSettings.emotion}
                                </div>
                                <div className="text-sm">
                                    <span className="text-gray-600">스타일:</span> {generationSettings.style}
                                </div>
                                <div className="text-sm">
                                    <span className="text-gray-600">맥락:</span> {generationSettings.context}
                                </div>
                            </div>

                            {/* 선택된 형식 */}
                            <div className="mb-4">
                                <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                                    가스라이팅 x
                                </span>
                            </div>

                            {/* 형식 버튼들 */}
                            <div className="grid grid-cols-2 gap-2">
                                {messageFormats.map((format) => (
                                    <button
                                        key={format.id}
                                        onClick={() => handleFormatToggle(format.id)}
                                        className={`p-2 text-xs rounded-lg border ${format.isSelected
                                            ? format.isWarning
                                                ? 'bg-red-100 border-red-300 text-red-800'
                                                : 'bg-blue-100 border-blue-300 text-blue-800'
                                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        {format.name}
                                    </button>
                                ))}
                            </div>

                            {/* 경고 메시지 */}
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
                                    <span className="text-xs text-red-800">
                                        강압적/조작적 형식이 포함됨: 교육 목적으로만 사용하세요.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 하단 패널들 */}
                <div className="grid grid-cols-12 gap-6 mt-6">

                    {/* 개인화 설정 */}
                    <div className="col-span-3">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">개인화 설정</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">공식성</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                            <option>친근하게</option>
                                            <option>보통</option>
                                        </select>
                                        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                            <option>보통</option>
                                            <option>친근하게</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">응답 길이</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                            <option>보통</option>
                                            <option>친근하게</option>
                                        </select>
                                        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                            <option>친근하게</option>
                                            <option>보통</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">감정 강도</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                            <option>보통</option>
                                            <option>직접적</option>
                                        </select>
                                        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                            <option>직접적</option>
                                            <option>보통</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 메시지 생성 */}
                    <div className="col-span-3">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">메시지 생성</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        메시지 취지 (선택사항)
                                    </label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        placeholder="메시지 내용을 입력하세요..."
                                    >
                                        커뮤니티 시설은 럭셔리 아파트에서 필수 요소라고 생각합니다. 단지 내에서 중요한 요소로 커뮤니티 시설을 적극적으로 활용해야 한다고 생각합니다.
                                    </textarea>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600">
                                        기본 생성
                                    </button>
                                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
                                        고급 생성
                                    </button>
                                    <button className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">
                                        GPT 생성
                                    </button>
                                    <button className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600">
                                        Ultra 생성
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 초고도화 메시지 생성 */}
                    <div className="col-span-3">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">초고도화 메시지 생성 v8.0</h3>
                            <div className="space-y-4">
                                <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
                                    감정 분석
                                </button>
                                <button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">
                                    의도 분석
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 시스템 상태 */}
                    <div className="col-span-3">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">시스템 상태</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">백엔드 서버</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm text-green-600">정상</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">AI 모델</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        <span className="text-sm text-yellow-600">학습 중</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">데이터 처리</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm text-green-600">정상</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedKakaoLayout; 