import React, { useState, useEffect } from 'react';
import {
    ChatBubbleLeftRightIcon,
    CalendarIcon,
    MagnifyingGlassIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    EllipsisHorizontalIcon,
    FaceSmileIcon,
    ClockIcon,
    UserGroupIcon,
    ChartBarIcon,
    CogIcon,
    DocumentArrowDownIcon,
    TrashIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    StarIcon
} from '@heroicons/react/24/outline';

interface Message {
    id: string;
    timestamp: string;
    sender: string;
    content: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    urgency: 'low' | 'medium' | 'high';
    aiResponse?: {
        confidence: number;
        message: string;
        status: 'success' | 'error' | 'pending';
    };
}

interface ChatRoom {
    id: string;
    name: string;
    messageCount: number;
    participantCount: number;
    status: 'active' | 'inactive';
}

const AIConversationAnalysisSystem: React.FC = () => {
    // 상태 관리
    const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom>({
        id: '1',
        name: '[인증]행복한소유☆개포우성7차',
        messageCount: 4106,
        participantCount: 70,
        status: 'active'
    });

    const [analysisPeriod, setAnalysisPeriod] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
    const [customStartDate, setCustomStartDate] = useState('2020-01-01T00:00');
    const [customEndDate, setCustomEndDate] = useState('2026-12-31T23:59');
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
    const [tendency, setTendency] = useState<'neutral' | 'positive' | 'negative'>('neutral');
    const [constructionCompany, setConstructionCompany] = useState<'kangdaewoo' | 'other'>('kangdaewoo');
    const [messageStrategy, setMessageStrategy] = useState('concern_sharing');
    const [communicationMethod, setCommunicationMethod] = useState('majority_opinion');

    // 메시지 데이터
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '0098',
            timestamp: '2025년 6월 24일 오전 9:22',
            sender: '회원',
            content: '환급금 3억 받은걸로 알고 있습니다! 다른 아파트와 비교하면 손실이 클 수 있지만, 장기적으로는 가치가 있을 것 같습니다. 하지만 당장의 현금 흐름이 중요한 상황이라 걱정이 됩니다.',
            sentiment: 'neutral',
            urgency: 'high',
            aiResponse: {
                confidence: 60,
                message: '메시지를 생성할 수 없습니다. 다시 시도해주세요.',
                status: 'error'
            }
        },
        {
            id: '0124우성',
            timestamp: '2025년 6월 24일 오전 9:25',
            sender: '우성',
            content: '환급금 3억 받은걸로 알고 있습니다! 2',
            sentiment: 'neutral',
            urgency: 'medium'
        },
        {
            id: '0124우성2',
            timestamp: '2025년 6월 24일 오전 9:25',
            sender: '우성',
            content: '개인당 2',
            sentiment: 'neutral',
            urgency: 'low'
        },
        {
            id: '0124우성3',
            timestamp: '2025년 6월 24일 오전 9:26',
            sender: '우성',
            content: '저도 동감합니다! 2',
            sentiment: 'positive',
            urgency: 'low'
        },
        {
            id: '0035_우성7차',
            timestamp: '2025년 6월 24일 오전 9:54',
            sender: '우성7차',
            content: '환급금 관련해서 더 자세한 정보가 필요합니다.',
            sentiment: 'neutral',
            urgency: 'medium'
        }
    ]);

    // AI 생성 통계
    const [aiStats, setAiStats] = useState({
        totalGenerations: 1,
        averageConfidence: 60,
        feedbackCount: 0,
        popularSettings: {
            tendency: '중립',
            constructionCompany: '강대우',
            strategy: 'concern_sharing'
        }
    });

    // 검색 기능
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredMessages, setFilteredMessages] = useState<Message[]>(messages);

    useEffect(() => {
        const filtered = messages.filter(message =>
            message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            message.sender.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredMessages(filtered);
    }, [searchQuery, messages]);

    const getSentimentIcon = (sentiment: string) => {
        switch (sentiment) {
            case 'positive':
                return <FaceSmileIcon className="w-4 h-4 text-green-500" />;
            case 'negative':
                return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
            default:
                return <InformationCircleIcon className="w-4 h-4 text-yellow-500" />;
        }
    };

    const getSentimentText = (sentiment: string) => {
        switch (sentiment) {
            case 'positive':
                return '긍정';
            case 'negative':
                return '부정';
            default:
                return '중립';
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'high':
                return 'text-red-600';
            case 'medium':
                return 'text-yellow-600';
            default:
                return 'text-green-600';
        }
    };

    return (
        <div className="h-screen bg-gray-50 flex">
            {/* 좌측 패널 - 채팅방 & 분석 설정 */}
            <div className="w-80 bg-white border-r border-gray-200 p-6 space-y-6 overflow-y-auto">
                {/* 채팅방 */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                        채팅방
                    </h2>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-medium text-blue-800 mb-2">{selectedChatRoom.name}</h3>
                        <p className="text-sm text-blue-600">
                            전체: {selectedChatRoom.messageCount.toLocaleString()}개 메시지 • 활성 상태
                        </p>
                    </div>
                </div>

                {/* 분석 기간 */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <CalendarIcon className="w-5 h-5 mr-2" />
                        분석 기간
                    </h2>

                    {/* 미리 정의된 기간 */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {[
                            { key: 'all', label: '전체' },
                            { key: 'today', label: '오늘' },
                            { key: 'week', label: '이번 주' },
                            { key: 'month', label: '이번 달' }
                        ].map(period => (
                            <button
                                key={period.key}
                                onClick={() => setAnalysisPeriod(period.key as any)}
                                className={`px-3 py-2 text-sm rounded-md transition-colors ${analysisPeriod === period.key
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {period.label}
                            </button>
                        ))}
                    </div>

                    {/* 사용자 지정 기간 */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-700">사용자 지정 기간</h4>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <CalendarIcon className="w-4 h-4 text-gray-500" />
                                <input
                                    type="datetime-local"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    title="시작 날짜 및 시간"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <CalendarIcon className="w-4 h-4 text-gray-500" />
                                <input
                                    type="datetime-local"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    title="종료 날짜 및 시간"
                                />
                            </div>
                        </div>
                        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                            기간 적용
                        </button>
                    </div>

                    {/* 선택된 기간 요약 */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                            선택된 기간: 전체, {selectedChatRoom.messageCount.toLocaleString()}개 메시지 • {selectedChatRoom.participantCount}명 참여
                        </p>
                    </div>
                </div>

                {/* AI 생성 통계 */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <ChartBarIcon className="w-5 h-5 mr-2" />
                        AI 생성 통계
                    </h2>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">총 생성수</span>
                            <span className="text-sm font-medium">{aiStats.totalGenerations}개</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">평균 신뢰도</span>
                            <span className="text-sm font-medium">{aiStats.averageConfidence}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">피드백 수</span>
                            <span className="text-sm font-medium">{aiStats.feedbackCount}개</span>
                        </div>
                    </div>

                    {/* 인기 설정 */}
                    <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">인기 설정</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">성향</span>
                                <span className="text-sm font-medium">{aiStats.popularSettings.tendency}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">시공사</span>
                                <span className="text-sm font-medium">{aiStats.popularSettings.constructionCompany}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">전략</span>
                                <span className="text-sm font-medium">{aiStats.popularSettings.strategy}</span>
                            </div>
                        </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="mt-4 space-y-2">
                        <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center">
                            <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                            히스토리 내보내기
                        </button>
                        <button className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center">
                            <TrashIcon className="w-4 h-4 mr-2" />
                            히스토리 초기화
                        </button>
                    </div>
                </div>
            </div>

            {/* 중앙 패널 - 대화 내용 */}
            <div className="flex-1 bg-white flex flex-col">
                {/* 헤더 */}
                <div className="border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                <span className="text-sm text-gray-600">연결 대기 중</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span className="text-sm text-gray-600">전체 기간</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 대화 내용 헤더 */}
                <div className="border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">전체 기간 메시지</span>
                    </div>

                    {/* 검색바 */}
                    <div className="mt-4 relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="메시지 검색... (키워드, 발신자, 내용)"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* 표시 개수 */}
                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                            {filteredMessages.length} / {messages.length}개 표시
                        </span>
                        <div className="flex items-center space-x-2">
                            <button className="p-1 hover:bg-gray-100 rounded" title="이전 페이지">
                                <ArrowLeftIcon className="w-4 h-4" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded" title="다음 페이지">
                                <ArrowRightIcon className="w-4 h-4" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded" title="더보기">
                                <EllipsisHorizontalIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 메시지 목록 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {filteredMessages.map((message) => (
                        <div key={message.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                            {/* 메시지 헤더 */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-800">ID {message.id}</span>
                                    <span className="text-sm text-gray-500">{message.timestamp}</span>
                                    {getSentimentIcon(message.sentiment)}
                                    <span className="text-sm text-gray-600">{getSentimentText(message.sentiment)}</span>
                                </div>
                                <span className={`text-sm font-medium ${getUrgencyColor(message.urgency)}`}>
                                    {message.urgency === 'high' ? '긴급' : message.urgency === 'medium' ? '보통' : '낮음'}
                                </span>
                            </div>

                            {/* 메시지 내용 */}
                            <div className="mb-3">
                                <p className="text-gray-800">{message.content}</p>
                            </div>

                            {/* 즉시 응답 */}
                            {message.urgency === 'high' && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                                        <span className="text-sm font-medium text-red-800">즉시 응답</span>
                                    </div>
                                    <p className="text-sm text-red-700">
                                        불만이나 긴급한 문의는 즉시 대응이 필요합니다.
                                    </p>
                                    <div className="flex items-center space-x-2 mt-2">
                                        <ClockIcon className="w-4 h-4 text-red-500" />
                                        <span className="text-sm text-red-600">권장 대기: 0분</span>
                                    </div>
                                </div>
                            )}

                            {/* AI 응답 */}
                            {message.aiResponse && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-blue-800">AI 응답</span>
                                        <span className="text-sm text-blue-600">신뢰도: {message.aiResponse.confidence}%</span>
                                    </div>
                                    <div className="mb-2">
                                        <p className="text-sm text-blue-700">{message.aiResponse.message}</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-sm ${message.aiResponse.status === 'success' ? 'text-green-600' :
                                            message.aiResponse.status === 'error' ? 'text-red-600' : 'text-yellow-600'
                                            }`}>
                                            {message.aiResponse.status === 'success' ? '성공' :
                                                message.aiResponse.status === 'error' ? '오류' : '대기 중'}
                                        </span>
                                        <button className="text-sm text-blue-600 hover:text-blue-800">
                                            복사
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* 우측 패널 - 메시지 생성 설정 */}
            <div className="w-96 bg-white border-l border-gray-200 p-6 space-y-6 overflow-y-auto">
                {/* 참여자 선택 */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">메시지 대상</h2>
                    <div className="relative">
                        <select
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            title="참여자 선택"
                        >
                            <option>참여자를 선택하세요</option>
                            <option>전체 참여자</option>
                            <option>관리자</option>
                            <option>일반 회원</option>
                        </select>
                        <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                </div>

                {/* 성향 & 시공사 */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">성향 & 시공사</h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                            <span className="text-sm font-medium text-purple-800">성향</span>
                            <span className="text-sm text-purple-600">중립</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <span className="text-sm font-medium text-yellow-800">시공사</span>
                            <span className="text-sm text-yellow-600">강대우</span>
                        </div>
                        <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors">
                            선택 초기화
                        </button>
                    </div>
                </div>

                {/* 메시지 전략 */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">메시지 전략</h2>

                    {/* 기본 메시지 전략 */}
                    <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">기본 메시지 전략</h3>
                        <div className="space-y-2">
                            {[
                                { id: 'logical_rebuttal', label: '논리적 반박', desc: '데이터와 근거를 바탕으로 논리적 대응' },
                                { id: 'information_provision', label: '정보 제공', desc: '유용한 정보와 지식을 공유' },
                                { id: 'emotion_avoidance', label: '감정 회피', desc: '감정적 대립을 피하고 중립적 접근' },
                                { id: 'short_answer', label: '단답 강조', desc: '간결하고 명확한 메시지' }
                            ].map(strategy => (
                                <label key={strategy.id} className="flex items-start space-x-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="messageStrategy"
                                        value={strategy.id}
                                        checked={messageStrategy === strategy.id}
                                        onChange={(e) => setMessageStrategy(e.target.value)}
                                        className="mt-1"
                                    />
                                    <div>
                                        <div className="text-sm font-medium text-gray-800">{strategy.label}</div>
                                        <div className="text-xs text-gray-600">{strategy.desc}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 커뮤니케이션 방식 */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">커뮤니케이션 방식</h3>
                        <div className="space-y-2">
                            {[
                                { id: 'majority_opinion', label: '다수 의견', desc: '다른 사람들의 의견이나 사례를 자연스럽게 언급' },
                                { id: 'mutual_consideration', label: '상호 배려', desc: '먼저 도움이나 정보를 제공하며 관계 형성' },
                                { id: 'experience_sharing', label: '경험 공유', desc: '개인 경험이나 지식을 자연스럽게 공유' },
                                { id: 'consensus_seeking', label: '합의 추구', desc: '공통 관심사를 찾아 자연스러운 대화 유도' }
                            ].map(method => (
                                <label key={method.id} className="flex items-start space-x-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="communicationMethod"
                                        value={method.id}
                                        checked={communicationMethod === method.id}
                                        onChange={(e) => setCommunicationMethod(e.target.value)}
                                        className="mt-1"
                                    />
                                    <div>
                                        <div className="text-sm font-medium text-gray-800">{method.label}</div>
                                        <div className="text-xs text-gray-600">{method.desc}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 고도화된 기능 */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                        <h3 className="text-sm font-medium text-purple-800 mb-2 flex items-center">
                            <StarIcon className="w-4 h-4 mr-1" />
                            고도화된 인사 선드 기버 NEW
                        </h3>
                        <p className="text-xs text-purple-600">
                            AI 기반 고급 메시지 생성 및 최적화 기능
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIConversationAnalysisSystem; 