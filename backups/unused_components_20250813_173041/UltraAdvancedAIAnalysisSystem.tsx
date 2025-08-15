import React, { useState, useEffect } from 'react';
import {
  StarIcon,
    ChatBubbleLeftRightIcon,
    UserIcon,
    EyeIcon,
    ChartBarIcon,
    CogIcon,
    BoltIcon,
    FireIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    HeartIcon,
    ShieldCheckIcon,
    RocketLaunchIcon,
    AcademicCapIcon,
    BeakerIcon,
    TrophyIcon,
    CalendarIcon,
    MagnifyingGlassIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    Bars3Icon,
    ArrowPathIcon,
    LightBulbIcon,
    HandRaisedIcon,
    UsersIcon,
    FaceSmileIcon,
    BookOpenIcon,
    InformationCircleIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';

interface Message {
    id: string;
    sender: string;
    content: string;
    timestamp: string;
    type: 'text' | 'file' | 'image' | 'link' | 'video' | 'deleted';
    sentiment?: 'positive' | 'negative' | 'neutral';
    psychological_metrics?: {
        persuasion_potential: number;
        emotional_impact: number;
        cognitive_load: number;
        neural_activation: number;
        manipulation_score: number;
    };
    safety_score?: number;
    generation_engine?: string;
}

interface GeneratedMessage {
    id: string;
    content: string;
    confidence: number;
    type: 'neural' | 'quantum' | 'extreme' | 'personalized';
    psychological_score: number;
    psychological_metrics: {
        persuasion_potential: number;
        emotional_impact: number;
        cognitive_load: number;
        neural_activation: number;
        manipulation_score: number;
    };
    safety_score: number;
    generation_engine: string;
}

const UltraAdvancedAIAnalysisSystem: React.FC = () => {
    // 상태 관리
    const [selectedChatRoom, setSelectedChatRoom] = useState<string>('1');
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [personality, setPersonality] = useState<string>('중립');
    const [writingStyle, setWritingStyle] = useState<string>('');
    const [messageIntent, setMessageIntent] = useState<string>('');
    const [generatedMessages, setGeneratedMessages] = useState<GeneratedMessage[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [analysisPeriod, setAnalysisPeriod] = useState<string>('전체');
    const [startDate, setStartDate] = useState<string>('2020. 01. 01. 오전 12:00');
    const [endDate, setEndDate] = useState<string>('2026. 12. 31. 오후 11:59');
    const [selectedParticipant, setSelectedParticipant] = useState<string>('');
    const [selectedConstructor, setSelectedConstructor] = useState<string>('강대우');
    const [basicStrategy, setBasicStrategy] = useState<string>('');
    const [communicationStyle, setCommunicationStyle] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalMessages, setTotalMessages] = useState<number>(4106);
    const [displayedMessages, setDisplayedMessages] = useState<number>(60);

    // 샘플 데이터
    const chatRooms = [
        {
            id: '1',
            name: '[인증]행복한소유☆개포우성7차',
            participantCount: 70,
            lastMessage: '입찰 관련 논의 중',
            lastActivity: '2분 전',
            messageCount: 4106,
            status: '활성 상태'
        }
    ];

    const sampleMessages: Message[] = [
        {
            id: '0098',
            sender: '0035_우성7차',
            content: '환급금 3억 받은걸로 알고 있습니다! 개인당 2억씩 받은 것 같은데, 이게 맞나요? 그리고 자산가치가 얼마나 올랐는지도 궁금합니다. 조합원들이 신중하게 검토해야 할 것 같아요.',
            timestamp: '2025년 6월 24일 오전 9:22',
            type: 'text',
            sentiment: 'neutral',
            psychological_metrics: { persuasion_potential: 0.6, emotional_impact: 0.7, cognitive_load: 0.5, neural_activation: 0.6, manipulation_score: 0.4 },
            safety_score: 0.8,
            generation_engine: 'neural'
        },
        {
            id: '0124우성',
            sender: '0124우성',
            content: '환급금 3억 받은걸로 알고 있습니다! 2',
            timestamp: '2025년 6월 24일 오전 9:25',
            type: 'text',
            sentiment: 'neutral'
        },
        {
            id: '0124우성2',
            sender: '0124우성',
            content: '개인당 2',
            timestamp: '2025년 6월 24일 오전 9:25',
            type: 'text',
            sentiment: 'neutral'
        },
        {
            id: '0124우성3',
            sender: '0124우성',
            content: '저도 동감합니다! 2',
            timestamp: '2025년 6월 24일 오전 9:26',
            type: 'text',
            sentiment: 'neutral'
        },
        {
            id: '0035_우성7차2',
            sender: '0035_우성7차',
            content: '환급금 관련해서 더 자세한 정보가 필요합니다.',
            timestamp: '2025년 6월 24일 오전 9:54',
            type: 'text',
            sentiment: 'neutral'
        }
    ];

    const participants = [
        { id: '1', name: '0035_우성7차', messageCount: 4, percentage: 21 },
        { id: '2', name: '0124우성', messageCount: 3, percentage: 15 },
        { id: '3', name: '조합원A', messageCount: 2, percentage: 10 },
        { id: '4', name: '조합원B', messageCount: 2, percentage: 10 },
        { id: '5', name: '조합원C', messageCount: 1, percentage: 5 }
    ];

    const constructors = [
        { id: '1', name: '강대우' },
        { id: '2', name: '삼성물산' },
        { id: '3', name: '현대건설' },
        { id: '4', name: '포스코건설' }
    ];

    // 메시지 생성
    const generateMessages = async () => {
        if (!selectedMessage || !messageIntent) return;

        setIsGenerating(true);

        // 시뮬레이션된 지연
        await new Promise(resolve => setTimeout(resolve, 2000));

        const newMessages: GeneratedMessage[] = [
            {
                id: '1',
                content: `${messageIntent}에 대해 깊이 공감합니다. 실제로 다른 조합에서도 비슷한 경험이 있었고, 그 결과 매우 만족스러웠다고 합니다. 우리 조합원들의 장기적인 이익을 위해서는 이런 신중한 접근이 정말 중요하다고 생각해요.`,
                confidence: 92,
                type: 'neural',
                psychological_score: 88,
                psychological_metrics: { persuasion_potential: 0.9, emotional_impact: 0.8, cognitive_load: 0.3, neural_activation: 0.9, manipulation_score: 0.7 },
                safety_score: 0.6,
                generation_engine: 'neural'
            },
            {
                id: '2',
                content: `말씀하신 ${messageIntent} 부분에 대해 궁금한 점이 있는데, 구체적으로 어떤 데이터를 기반으로 하신 건지 알 수 있을까요? 더 정확한 정보가 있으면 함께 검토해보고, 다른 조합들의 사례도 참고해서 최적의 방안을 찾아보면 좋겠습니다.`,
                confidence: 87,
                type: 'quantum',
                psychological_score: 82,
                psychological_metrics: { persuasion_potential: 0.8, emotional_impact: 0.7, cognitive_load: 0.6, neural_activation: 0.8, manipulation_score: 0.6 },
                safety_score: 0.7,
                generation_engine: 'quantum'
            },
            {
                id: '3',
                content: `${messageIntent}에 대한 의견을 듣고 보니, 저도 완전히 동감합니다. 조합원들의 장기적인 이익을 위해서는 신중하면서도 적극적인 검토가 필요해요. 다른 조합들의 성공 사례를 보면 이런 접근이 가장 효과적이었습니다.`,
                confidence: 95,
                type: 'extreme',
                psychological_score: 94,
                psychological_metrics: { persuasion_potential: 0.95, emotional_impact: 0.9, cognitive_load: 0.2, neural_activation: 0.95, manipulation_score: 0.8 },
                safety_score: 0.4,
                generation_engine: 'extreme'
            }
        ];

        setGeneratedMessages(newMessages);
        setIsGenerating(false);
    };

    // 감정 아이콘 컴포넌트
    const SentimentIcon = ({ sentiment }: { sentiment?: string }) => {
        switch (sentiment) {
            case 'positive':
                return <span className="text-green-600">😊</span>;
            case 'negative':
                return <span className="text-red-600">😞</span>;
            default:
                return <span className="text-gray-600">😐</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 상단 헤더 */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-3">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                                <StarIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">AI 대화분석시스템</h1>
                                <p className="text-xs text-gray-600">맥락 기반 메시지 자동 생성 및 분석</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                <span>연결 대기 중</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <ClockIcon className="w-3 h-3" />
                                <span>전체 기간</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 왼쪽 컬럼 - 채팅방 및 분석 설정 */}
                    <div className="space-y-4">
                        {/* 채팅방 섹션 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center space-x-2 mb-3">
                                <ChatBubbleLeftRightIcon className="w-4 h-4 text-green-600" />
                                <h3 className="text-sm font-medium text-gray-900">채팅방</h3>
                            </div>
                            {chatRooms.map((room) => (
                                <div key={room.id} className="border-l-4 border-blue-500 pl-3 py-2">
                                    <div className="text-sm font-medium text-gray-900">{room.name}</div>
                                    <div className="text-xs text-gray-600 mt-1">
                                        전체: {room.messageCount}개 메시지
                                    </div>
                                    <div className="text-xs text-green-600 mt-1">{room.status}</div>
                                </div>
                            ))}
                        </div>

                        {/* 분석 기간 섹션 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center space-x-2 mb-3">
                                <CalendarIcon className="w-4 h-4 text-blue-600" />
                                <h3 className="text-sm font-medium text-gray-900">분석 기간</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                {['전체', '오늘', '이번 주', '이번 달'].map((period) => (
                                    <button
                                        key={period}
                                        onClick={() => setAnalysisPeriod(period)}
                                        className={`px-2 py-1 text-xs rounded ${analysisPeriod === period
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>
                            <div className="text-xs text-gray-600 mb-2">사용자 지정 기간</div>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-600">시작 날짜:</span>
                                    <input
                                        type="text"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                                    />
                                    <CalendarIcon className="w-3 h-3 text-gray-400" />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-600">종료 날짜:</span>
                                    <input
                                        type="text"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                                    />
                                    <CalendarIcon className="w-3 h-3 text-gray-400" />
                                </div>
                                <button className="w-full px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">
                                    기간 적용
                                </button>
                            </div>
                            <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                                <div>선택된 기간: {analysisPeriod}</div>
                                <div>{totalMessages}개 메시지 {chatRooms[0]?.participantCount}명 참여</div>
                            </div>
                        </div>

                        {/* AI 생성 통계 섹션 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center space-x-2 mb-3">
                                <StarIcon className="w-4 h-4 text-green-600" />
                                <h3 className="text-sm font-medium text-gray-900">AI 생성 통계</h3>
                            </div>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">총 생성수:</span>
                                    <span className="font-medium">1개</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">평균 신뢰도:</span>
                                    <span className="font-medium">60%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">피드백 수:</span>
                                    <span className="font-medium">0개</span>
                                </div>
                            </div>
                            <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                                <div className="font-medium mb-1">인기 설정</div>
                                <div>성향: {personality}</div>
                                <div>시공사: {selectedConstructor}</div>
                                <div>전략: concern_sharing</div>
                            </div>
                            <div className="mt-3 space-y-2">
                                <button className="w-full px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600">
                                    히스토리 내보내기
                                </button>
                                <button className="w-full px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600">
                                    히스토리 초기화
                                </button>
                            </div>
                        </div>

                        {/* 주요 참여자 섹션 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                    <UserIcon className="w-4 h-4 text-blue-600" />
                                    <h3 className="text-sm font-medium text-gray-900">주요 참여자</h3>
                                </div>
                                <div className="flex items-center space-x-1 text-xs text-gray-600">
                                    <span>5명</span>
                                    <ChevronDownIcon className="w-3 h-3" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                {participants.map((participant) => (
                                    <div key={participant.id} className="flex justify-between items-center text-xs">
                                        <span className="text-gray-700">#{participant.id} {participant.name}</span>
                                        <span className="text-gray-600">{participant.messageCount}개 ({participant.percentage}%)</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 중앙 컬럼 - 대화 내용 */}
                    <div className="space-y-4">
                        {/* 대화 내용 헤더 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                    <ChatBubbleLeftRightIcon className="w-4 h-4 text-blue-600" />
                                    <h3 className="text-sm font-medium text-gray-900">대화 내용</h3>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-gray-600">
                                    <span>{displayedMessages} / {totalMessages}개 표시</span>
                                    <ChevronUpIcon className="w-3 h-3" />
                                    <ChevronDownIcon className="w-3 h-3" />
                                    <Bars3Icon className="w-3 h-3" />
                                </div>
                            </div>
                            <div className="text-xs text-gray-600 mb-3">전체 기간 메시지</div>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="메시지 검색... (키워드, 발신자, 내용)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg pr-8"
                                />
                                <MagnifyingGlassIcon className="absolute right-2 top-2 w-4 h-4 text-gray-400" />
                            </div>
                        </div>

                        {/* 메시지 목록 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="space-y-4">
                                {sampleMessages.map((message) => (
                                    <div key={message.id} className="border-l-4 border-blue-500 pl-3">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="text-xs text-gray-600">메시지 ID: {message.id}</div>
                                            <div className="text-xs text-gray-500">{message.timestamp}</div>
                                        </div>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="text-xs text-gray-600">{message.sentiment}</span>
                                            <SentimentIcon sentiment={message.sentiment} />
                                        </div>
                                        <div className="text-sm text-gray-700 mb-2">{message.content}</div>
                                        <div className="flex justify-between items-center text-xs text-gray-500">
                                            <span>권장 대기: 0분</span>
                                            <button className="px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                                                복사
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 즉시 응답 섹션 */}
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <BoltIcon className="w-4 h-4 text-yellow-600" />
                                    <h4 className="text-sm font-medium text-yellow-800">즉시 응답</h4>
                                </div>
                                <div className="text-xs text-yellow-700">
                                    불만이나 긴급한 문의는 즉시 대응이 필요합니다.
                                </div>
                            </div>

                            {/* AI 응답 섹션 */}
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <StarIcon className="w-4 h-4 text-blue-600" />
                                    <h4 className="text-sm font-medium text-blue-800">AI 응답</h4>
                                </div>
                                <div className="text-xs text-blue-700 mb-2">신뢰도: 60%</div>
                                {isGenerating ? (
                                    <div className="text-xs text-blue-600">메시지를 생성하는 중...</div>
                                ) : generatedMessages.length > 0 ? (
                                    <div className="space-y-2">
                                        {generatedMessages.map((msg, index) => (
                                            <div key={msg.id} className="p-2 bg-white rounded border">
                                                <div className="text-xs text-gray-600 mb-1">생성 메시지 {index + 1}</div>
                                                <div className="text-sm text-gray-700">{msg.content}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-xs text-red-600">
                                        메시지를 생성할 수 없습니다. 다시 시도해주세요.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 오른쪽 컬럼 - 참여자 선택 및 메시지 전략 */}
                    <div className="space-y-4">
                        {/* 참여자 선택 섹션 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center space-x-2 mb-3">
                                <UserIcon className="w-4 h-4 text-blue-600" />
                                <h3 className="text-sm font-medium text-gray-900">참여자 선택</h3>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs text-gray-600">메시지 대상</label>
                                <select
                                    value={selectedParticipant}
                                    onChange={(e) => setSelectedParticipant(e.target.value)}
                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded"
                                >
                                    <option value="">참여자를 선택하세요</option>
                                    {participants.map((participant) => (
                                        <option key={participant.id} value={participant.id}>
                                            {participant.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* 성향 & 시공사 섹션 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center space-x-2 mb-3">
                                <UserIcon className="w-4 h-4 text-blue-600" />
                                <h3 className="text-sm font-medium text-gray-900">성향 & 시공사</h3>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">성향</label>
                                    <select
                                        value={personality}
                                        onChange={(e) => setPersonality(e.target.value)}
                                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded"
                                    >
                                        <option value="중립">중립</option>
                                        <option value="공감형">공감형</option>
                                        <option value="권위형">권위형</option>
                                        <option value="논리형">논리형</option>
                                        <option value="감정형">감정형</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">시공사</label>
                                    <select
                                        value={selectedConstructor}
                                        onChange={(e) => setSelectedConstructor(e.target.value)}
                                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded"
                                    >
                                        {constructors.map((constructor) => (
                                            <option key={constructor.id} value={constructor.name}>
                                                {constructor.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button className="w-full px-3 py-2 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 flex items-center justify-center space-x-1">
                                    <ArrowPathIcon className="w-3 h-3" />
                                    <span>선택 초기화</span>
                                </button>
                            </div>
                        </div>

                        {/* 메시지 전략 섹션 */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center space-x-2 mb-3">
                                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                                <h3 className="text-sm font-medium text-gray-900">메시지 전략</h3>
                            </div>

                            {/* 기본 메시지 전략 */}
                            <div className="mb-4">
                                <h4 className="text-xs font-medium text-gray-700 mb-2">기본 메시지 전략</h4>
                                <div className="space-y-2">
                                    {[
                                        { id: 'logical', icon: BookOpenIcon, label: '논리적 반박', desc: '데이터와 근거를 바탕으로 논리적 대응' },
                                        { id: 'info', icon: InformationCircleIcon, label: '정보 제공', desc: '유용한 정보와 지식을 공유' },
                                        { id: 'emotion', icon: FaceSmileIcon, label: '감정 회피', desc: '감정적 대립을 피하고 중립적 접근' },
                                        { id: 'brief', icon: BoltIcon, label: '단답 강조', desc: '간결하고 명확한 메시지' }
                                    ].map((strategy) => (
                                        <label key={strategy.id} className="flex items-start space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="basicStrategy"
                                                value={strategy.id}
                                                checked={basicStrategy === strategy.id}
                                                onChange={(e) => setBasicStrategy(e.target.value)}
                                                className="mt-1"
                                            />
                                            <div className="flex items-center space-x-2">
                                                <strategy.icon className="w-4 h-4 text-gray-500" />
                                                <div>
                                                    <div className="text-xs font-medium text-gray-700">{strategy.label}</div>
                                                    <div className="text-xs text-gray-500">{strategy.desc}</div>
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* 커뮤니케이션 방식 */}
                            <div>
                                <h4 className="text-xs font-medium text-gray-700 mb-2">커뮤니케이션 방식</h4>
                                <div className="space-y-2">
                                    {[
                                        { id: 'multiple', icon: UsersIcon, label: '다수 의견', desc: '다른 사람들의 의견이나 사례를 자연스럽게 언급' },
                                        { id: 'mutual', icon: HandRaisedIcon, label: '상호 배려', desc: '먼저 도움이나 정보를 제공하며 관계 형성' },
                                        { id: 'experience', icon: AcademicCapIcon, label: '경험 공유', desc: '개인 경험이나 지식을 자연스럽게 공유' },
                                        { id: 'consensus', icon: UsersIcon, label: '합의 추구', desc: '공통 관심사를 찾아 자연스러운 대화 유도' }
                                    ].map((style) => (
                                        <label key={style.id} className="flex items-start space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="communicationStyle"
                                                value={style.id}
                                                checked={communicationStyle === style.id}
                                                onChange={(e) => setCommunicationStyle(e.target.value)}
                                                className="mt-1"
                                            />
                                            <div className="flex items-center space-x-2">
                                                <style.icon className="w-4 h-4 text-gray-500" />
                                                <div>
                                                    <div className="text-xs font-medium text-gray-700">{style.label}</div>
                                                    <div className="text-xs text-gray-500">{style.desc}</div>
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* 메시지 취지 입력 */}
                            <div className="mt-4">
                                <label className="block text-xs font-medium text-gray-700 mb-2">메시지 취지</label>
                                <textarea
                                    value={messageIntent}
                                    onChange={(e) => setMessageIntent(e.target.value)}
                                    placeholder="원하는 메시지의 목적이나 의도를 입력하세요..."
                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded h-20 resize-none"
                                />
                                <button
                                    onClick={generateMessages}
                                    disabled={!selectedMessage || !messageIntent || isGenerating}
                                    className={`w-full mt-2 py-2 px-3 rounded text-xs font-medium transition-colors ${!selectedMessage || !messageIntent || isGenerating
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                        }`}
                                >
                                    {isGenerating ? '생성 중...' : '메시지 생성'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UltraAdvancedAIAnalysisSystem; 