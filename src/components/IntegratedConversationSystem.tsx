import React, { useState } from 'react';
import {
    UserIcon,
    ChatBubbleLeftRightIcon,
    DocumentTextIcon,
    PhotoIcon,
    VideoCameraIcon,
    MicrophoneIcon,
    PaperClipIcon,
    FaceSmileIcon,
    PaperAirplaneIcon,
    UserGroupIcon,
    CalendarIcon,
    CheckCircleIcon,
    StarIcon,
    MagnifyingGlassIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    EyeIcon,
    HeartIcon,
    ClipboardDocumentIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Message, ChatRoom, ConversationSummary, AIResponse, Participant } from '../types/conversation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface IntegratedConversationSystemProps {
    onMessageGenerated?: (message: AIResponse) => void;
}

const IntegratedConversationSystem: React.FC<IntegratedConversationSystemProps> = ({
    onMessageGenerated
}) => {
    // 상태 관리
    const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom>({
        id: '1',
        name: '[인증]행복한소유☆개포우성7차',
        messageCount: 4106,
        participantCount: 70,
        status: 'active',
        lastMessage: '최근 메시지'
    });

    // 분석 기간 상태 (Date 객체)
    const [startDate, setStartDate] = useState<Date>(new Date('2025-06-24T00:00:00'));
    const [endDate, setEndDate] = useState<Date>(new Date('2025-06-24T23:59:59'));
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
    const [tendency, setTendency] = useState<'neutral' | 'friendly' | 'opposed'>('neutral');
    const [constructionCompany, setConstructionCompany] = useState<'neutral' | 'kangdaewoo_strong' | 'kangdaewoo_medium' | 'kangdaewoo_weak' | 'samsung_strong' | 'samsung_medium' | 'samsung_weak'>('neutral');
    const [messageStrategy, setMessageStrategy] = useState('concern_sharing');
    const [communicationMethod, setCommunicationMethod] = useState('majority_opinion');
    const [analysisMode, setAnalysisMode] = useState('전체');
    const [analysisPeriod, setAnalysisPeriod] = useState('last_week');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [messageFormat, setMessageFormat] = useState('neutral');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [messagesPerPage] = useState(20);
    const [showSummary, setShowSummary] = useState(false);
    const [conversationSummary, setConversationSummary] = useState<ConversationSummary | null>(null);

    // 메시지 데이터
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '0098',
            timestamp: '2025년 6월 24일 오전 9:22',
            sender: '회원',
            content: '환급금 3억 받은걸로 알고 있습니다! 개인당 2천만원 정도 받으신 것 같은데, 루체하임이나 물산 같은 곳에 투자하시는 것보다는 조합원님들의 자산 가치를 높이는 방향으로 신중하게 검토해보시는 것이 좋겠습니다.',
            sentiment: 'neutral'
        },
        {
            id: '0124우성',
            timestamp: '2025년 6월 24일 오전 9:25',
            sender: '우성',
            content: '환급금 3억 받은걸로 알고 있습니다! 2',
            sentiment: 'neutral'
        },
        {
            id: '0124우성2',
            timestamp: '2025년 6월 24일 오전 9:25',
            sender: '우성',
            content: '개인당 2',
            sentiment: 'neutral'
        },
        {
            id: '0124우성3',
            timestamp: '2025년 6월 24일 오전 9:26',
            sender: '우성',
            content: '저도 동감합니다! 2',
            sentiment: 'positive'
        },
        {
            id: '0035_우성7차',
            timestamp: '2025년 6월 24일 오전 9:30',
            sender: '관리자',
            content: '현재 상황을 정확히 파악하고 있습니다. 조합원 여러분의 우려사항에 대해 공감하며, 구체적인 해결 방안을 제시하겠습니다.',
            sentiment: 'positive'
        },
        {
            id: '0035_우성7차2',
            timestamp: '2025년 6월 24일 오전 10:15',
            sender: '관리자',
            content: '시공사를 고르는 기준이 공사비 낮추기로만 흐르면 안 되며, 고급화 설계 제안을 먼저 받고 적정 공사비를 제시하는 것이 바람직합니다.',
            sentiment: 'neutral'
        },
        {
            id: '회원2',
            timestamp: '2025년 6월 24일 오전 10:30',
            sender: '회원',
            content: '환급금 관련해서 더 자세한 설명 부탁드립니다. 언제 받을 수 있고, 어떤 조건이 필요한지 궁금합니다.',
            sentiment: 'neutral'
        },
        {
            id: '우성4',
            timestamp: '2025년 6월 24일 오전 10:35',
            sender: '우성',
            content: '환급금은 사업 승인 후 약 3개월 내에 지급될 예정입니다. 자세한 일정은 추후 공지하겠습니다.',
            sentiment: 'positive'
        }
    ]);

    // AI 생성 통계
    const [aiStats, setAiStats] = useState({
        totalGenerated: 1,
        averageConfidence: 60,
        feedbackCount: 0,
        popularSettings: {
            tendency: '중립',
            constructor: '강대우',
            strategy: 'concern_sharing'
        }
    });

    // 샘플 대화방 목록
    const chatRooms: ChatRoom[] = [
        {
            id: '1',
            name: '[인증]행복한소유☆개포우성7차',
            messageCount: 4106,
            participantCount: 70,
            status: 'active',
            lastMessage: '입찰 관련 논의 중'
        },
        {
            id: '2',
            name: '안전관리_팀',
            messageCount: 1200,
            participantCount: 15,
            status: 'active',
            lastMessage: '안전 점검 완료'
        },
        {
            id: '3',
            name: '시공_진행상황',
            messageCount: 800,
            participantCount: 10,
            status: 'inactive',
            lastMessage: '공정률 80% 달성'
        }
    ];

    // 대화방 선택 핸들러
    const handleChatRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const room = chatRooms.find(r => r.id === e.target.value);
        if (room) setSelectedChatRoom(room);
    };

    // 메시지 필터링: 대화방 + 기간 + 검색어
    const filteredMessages = messages.filter(message => {
        // 대화방 필터
        if (selectedChatRoom && message.sender && !selectedChatRoom.name.includes(message.sender) && selectedChatRoom.id !== '1') {
            // 샘플 메시지에는 sender가 방 이름과 일치하지 않으므로, 실제 데이터에서는 message.chatRoomId === selectedChatRoom.id로 변경 필요
            return false;
        }
        // 기간 필터
        const msgDate = new Date(message.timestamp.replace(/(오전|오후)/, m => m === '오전' ? 'AM' : 'PM'));
        if (msgDate < startDate || msgDate > endDate) return false;
        // 검색어 필터
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                (message.content.toLowerCase().includes(searchLower) ||
                    message.sender.toLowerCase().includes(searchLower) ||
                    message.id.toLowerCase().includes(searchLower))
            );
        }
        return true;
    });

    // 페이지네이션
    const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);
    const startIndex = (currentPage - 1) * messagesPerPage;
    const endIndex = startIndex + messagesPerPage;
    const displayedMessages = filteredMessages.slice(startIndex, endIndex);

    // 감정 아이콘 및 텍스트
    const getSentimentIcon = (sentiment?: string) => {
        switch (sentiment) {
            case 'positive':
                return <FaceSmileIcon className="w-4 h-4 text-green-500" />;
            case 'negative':
                return <FaceSmileIcon className="w-4 h-4 text-red-500" />;
            default:
                return <FaceSmileIcon className="w-4 h-4 text-gray-500" />;
        }
    };

    const getSentimentText = (sentiment?: string) => {
        switch (sentiment) {
            case 'positive':
                return '긍정';
            case 'negative':
                return '부정';
            default:
                return '중립';
        }
    };

    // urgency가 없는 경우에도 동작하도록 기본값 처리
    const getUrgencyColor = (urgency?: string) => {
        switch (urgency) {
            case 'high':
                return 'text-red-600 bg-red-100';
            case 'medium':
                return 'text-yellow-600 bg-yellow-100';
            default:
                return 'text-green-600 bg-green-100';
        }
    };

    // 대화 분석 및 요약
    const analyzeAndSummarizeConversation = async (allMessages: Message[]): Promise<ConversationSummary> => {
        // 참여자별 메시지 수 계산
        const participantCounts: Record<string, number> = {};
        allMessages.forEach(m => {
            participantCounts[m.sender] = (participantCounts[m.sender] || 0) + 1;
        });

        // 감정 분석 통계
        const sentimentCounts = allMessages.reduce((acc: Record<string, number>, m) => {
            const sentiment = m.sentiment || 'neutral';
            acc[sentiment] = (acc[sentiment] || 0) + 1;
            return acc;
        }, {});

        // 긴급도 분석 통계  
        const urgencyCounts = allMessages.reduce((acc: Record<string, number>, m) => {
            const urgency = (m as any).urgency || 'low';
            acc[urgency] = (acc[urgency] || 0) + 1;
            return acc;
        }, {});

        // 주제별 요약 생성
        const topics = await generateTopicSummaries(allMessages);

        return {
            totalMessages: allMessages.length,
            totalParticipants: Object.keys(participantCounts).length,
            participantCount: Object.keys(participantCounts).length,
            keyParticipants: Object.keys(participantCounts).slice(0, 5),
            sentiment: 'neutral',
            topParticipants: Object.entries(participantCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([name, count]) => ({ name, messageCount: count })),
            sentimentAnalysis: {
                positive: sentimentCounts.positive || 0,
                negative: sentimentCounts.negative || 0,
                neutral: sentimentCounts.neutral || 0
            },
            urgencyAnalysis: {
                high: urgencyCounts.high || 0,
                medium: urgencyCounts.medium || 0,
                low: urgencyCounts.low || 0
            },
            topics,
            overallSummary: '재개발 사업과 관련된 조합원들의 다양한 의견과 우려사항이 논의되고 있습니다. 환급금, 시공사 선택, 경제적 효과 등이 주요 관심사로 나타나고 있습니다.',
            dateRange: {
                start: startDate.toISOString(),
                end: endDate.toISOString()
            }
        };
    };

    // 주제별 요약 생성
    const generateTopicSummaries = async (allMessages: Message[]): Promise<ConversationSummary['topics']> => {
        // 키워드 기반 주제 분류
        const topicKeywords = {
            '시공사 평가': ['시공사', '대우', '삼성', '건설사', '평가', '비교', '선택'],
            '조합 운영': ['조합', '총회', '의결', '운영', '관리', '이사'],
            '환급금 관련': ['환급금', '분양금', '추가납입', '납입금', '계약금'],
            '분양 조건': ['분양', '평형', '면적', '가격', '조건']
        };

        const topics: ConversationSummary['topics'] = [];

        for (const [topicName, keywords] of Object.entries(topicKeywords)) {
            const topicMessages = allMessages.filter(message =>
                keywords.some(keyword => message.content.includes(keyword))
            );

            if (topicMessages.length > 0) {
                const summary = await generateTopicSummary(topicName, topicMessages);
                topics.push({
                    title: topicName,
                    messages: topicMessages,
                    summary,
                    keyParticipants: Array.from(new Set(topicMessages.map(m => m.sender))),
                    sentiment: 'neutral' as const,
                    keywords
                });
            }
        }

        return topics;
    };

    // 개별 주제 요약 생성
    const generateTopicSummary = async (topicName: string, messages: Message[]): Promise<string> => {
        // 실제로는 OpenAI API를 사용하여 요약 생성
        // 여기서는 규칙 기반 요약 생성

        const keywordCounts: Record<string, number> = {};
        messages.forEach(message => {
            const words = message.content.split(/\s+/);
            words.forEach(word => {
                if (word.length > 1) {
                    keywordCounts[word] = (keywordCounts[word] || 0) + 1;
                }
            });
        });

        const topKeywords = Object.entries(keywordCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([word]) => word);

        return `${topicName}와 관련된 ${messages.length}개의 메시지가 있습니다. 주요 키워드는 ${topKeywords.join(', ')}입니다.`;
    };

    // 요약 생성 처리
    const handleGenerateSummary = async () => {
        setShowSummary(true);
        const summary = await analyzeAndSummarizeConversation(messages);
        setConversationSummary(summary);
    };

    // AI 응답 생성
    const generateAIResponse = async (message: Message) => {
        // 메시지 형식에 따른 응답 생성
        const formatResponses: Record<string, string> = {
            refutation: '귀하의 주장에 대해 몇 가지 문제점이 있습니다. 구체적인 데이터를 바탕으로 설명드리겠습니다.',
            counter_question: '그런 주장을 하시는 근거가 무엇인지 궁금합니다. 더 자세히 설명해주실 수 있나요?',
            opposition: '죄송하지만 그 의견에는 동의할 수 없습니다. 다른 관점에서 접근해보시는 것을 제안드립니다.',
            agreement: '정말 좋은 의견이십니다. 저도 같은 생각입니다. 이 방향으로 진행하면 좋겠네요.',
            defense: '해당 입장을 적극적으로 지지합니다. 이는 우리 모두에게 이익이 될 것입니다.',
            criticism: '현재 상황에 대해 강하게 비판할 수밖에 없습니다. 개선이 시급합니다.',
            neutral: '현재 상황을 객관적으로 분석해보겠습니다. 사실 관계를 정리해드리겠습니다.',
            avoidance: '이 문제는 복잡하므로 신중하게 접근해야 할 것 같습니다.',
            sarcasm: '정말 훌륭한 아이디어네요. (아마도 그럴 수도 있겠지만...)',
            empathy: '귀하의 입장을 충분히 이해합니다. 그런 마음이 드실 수 있겠네요.',
            suggestion: '이런 해결책은 어떨까요? 구체적인 대안을 제시해드리겠습니다.',
            questioning: '이에 대해 더 자세한 정보를 얻을 수 있을까요?',
            ignoring: '...',
            emphasis: '특히 중요한 점은 바로 이것입니다. 반드시 주목해야 할 부분입니다.',
            speculation: '아마도 이런 방향으로 진행될 수도 있을 것 같습니다.',
            emotional_appeal: '우리 모두의 미래를 위해 이 일을 해야 합니다. 감정적으로도 중요한 문제입니다.',
            mockery: '하하, 정말 재미있는 생각이네요. (웃음)',
            directive: '이제 이렇게 하시면 됩니다. 지시사항을 따라주세요.',
            coercion: '이렇게 하지 않으면 안 좋은 결과가 있을 수 있습니다.',
            forcefulness: '반드시 이렇게 해야 합니다. 다른 선택은 없습니다.',
            brainwashing: '이것이 유일한 진실입니다. 다른 것은 모두 거짓입니다.',
            gaslighting: '정말 그런 일이 있었나요? 기억이 잘못된 것 같습니다.'
        };

        const selectedFormat = formatResponses[messageFormat] || formatResponses.neutral;

        // 실제로는 AI API 호출
        const response = {
            type: 'conversation' as const,
            data: selectedFormat,
            metadata: {
                confidence: Math.floor(Math.random() * 40) + 60,
                processingTime: 1000,
                model: 'ai-model',
                tokens: 150
            }
        };

        // 메시지 업데이트
        setMessages(prev => prev.map(m =>
            m.id === message.id
                ? { ...m, aiResponse: response }
                : m
        ));

        if (onMessageGenerated) {
            // AIResponse 타입에 맞게 변환
            const aiResponse: AIResponse = {
                message: response.data,
                confidence: response.metadata.confidence,
                status: 'success'
            };
            onMessageGenerated(aiResponse);
        }
    };

    // 메시지 복사
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* 대화방/분석기간 선택 카드 */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6 flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
                {/* 대화방 선택 */}
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <UserGroupIcon className="w-5 h-5 mr-1 text-purple-500" /> 대화방 선택
                    </label>
                    <select
                        value={selectedChatRoom.id}
                        onChange={handleChatRoomChange}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        aria-label="대화방 선택"
                    >
                        <option value="" disabled>대화방을 선택하세요</option>
                        {chatRooms.map(room => (
                            <option key={room.id} value={room.id}>{room.name}</option>
                        ))}
                    </select>
                </div>
                {/* 분석 기간 선택 */}
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <CalendarIcon className="w-5 h-5 mr-1 text-blue-500" /> 분석 기간
                    </label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            aria-label="시작 날짜"
                        />
                        <span className="text-gray-500">~</span>
                        <input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            aria-label="종료 날짜"
                        />
                    </div>
                </div>
            </div>
            {/* 왼쪽 사이드바 */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                {/* 채팅방 정보 */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3 mb-4">
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        <div>
                            <h3 className="font-semibold text-gray-900">{selectedChatRoom.name}</h3>
                            <p className="text-sm text-gray-600">전체: {selectedChatRoom.messageCount}개 메시지</p>
                            <p className="text-sm text-green-600">활성 상태</p>
                        </div>
                    </div>
                </div>

                {/* 분석 기간 */}
                <div className="p-6 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">분석 기간</h4>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {[
                            { id: 'all', label: '전체' },
                            { id: 'today', label: '오늘' },
                            { id: 'week', label: '이번 주' },
                            { id: 'month', label: '이번 달' }
                        ].map(period => (
                            <button
                                key={period.id}
                                onClick={() => setAnalysisPeriod(period.id as any)}
                                className={`px-3 py-2 text-sm rounded-lg transition-colors ${analysisPeriod === period.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {period.label}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-3 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">시작 날짜</label>
                            <div className="flex items-center space-x-2">
                                <CalendarIcon className="w-4 h-4 text-gray-400" />
                                <input
                                    type="datetime-local"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">종료 날짜</label>
                            <div className="flex items-center space-x-2">
                                <CalendarIcon className="w-4 h-4 text-gray-400" />
                                <input
                                    type="datetime-local"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
                                />
                            </div>
                        </div>
                    </div>

                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        기간 적용
                    </button>

                    <div className="mt-3 text-sm text-gray-600">
                        <p>선택된 기간: 전체</p>
                        <p>{selectedChatRoom.messageCount}개 메시지 • {selectedChatRoom.participantCount}명 참여</p>
                    </div>
                </div>

                {/* AI 생성 통계 */}
                <div className="p-6 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">AI 생성 통계</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">총 생성수</span>
                            <span className="text-sm font-medium">{aiStats.totalGenerated}개</span>
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

                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">인기 설정</h5>
                        <div className="space-y-1 text-sm">
                            <p>성향: {aiStats.popularSettings.tendency}</p>
                            <p>시공사: {aiStats.popularSettings.constructor}</p>
                            <p>전략: {aiStats.popularSettings.strategy}</p>
                        </div>
                    </div>

                    <div className="mt-4 space-y-2">
                        <button className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                            히스토리 내보내기
                        </button>
                        <button className="w-full bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                            히스토리 초기화
                        </button>
                    </div>
                </div>
            </div>

            {/* 메인 컨텐츠 영역 */}
            <div className="flex-1 flex flex-col">
                {/* 헤더 */}
                <div className="bg-white border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <StarIcon className="w-6 h-6 text-purple-600" />
                            <h1 className="text-xl font-bold text-gray-900">AI 대화분석시스템</h1>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                                연결 대기 중
                            </div>
                            <div className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full">
                                전체 기간
                            </div>
                        </div>
                    </div>
                </div>

                {/* 메시지 영역 */}
                <div className="flex-1 flex flex-col">
                    {/* 메시지 헤더 */}
                    <div className="bg-white border-b border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <h2 className="text-lg font-semibold text-gray-900">전체 기간 메시지</h2>
                                <div className="flex items-center space-x-2">
                                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="메시지 검색... (키워드, 발신자, 내용)"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={handleGenerateSummary}
                                    className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors flex items-center space-x-1"
                                >
                                    <StarIcon className="w-3 h-3" />
                                    <span>요약</span>
                                </button>
                                <span className="text-sm text-gray-600">
                                    {displayedMessages.length} / {filteredMessages.length}개 표시
                                </span>
                                <div className="flex items-center space-x-1">
                                    <button className="p-1 hover:bg-gray-100 rounded">
                                        <ChevronUpIcon className="w-4 h-4" />
                                    </button>
                                    <button className="p-1 hover:bg-gray-100 rounded">
                                        <ChevronDownIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 요약 표시 */}
                    {showSummary && conversationSummary && (
                        <div className="mb-4 bg-blue-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
                                <DocumentTextIcon className="w-4 h-4 mr-1" />
                                {selectedChatRoom.name} 대화요약
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="bg-white p-3 rounded-lg">
                                    <h5 className="text-sm font-medium text-gray-900 mb-2">참여자 분석</h5>
                                    <p className="text-sm text-gray-600">총 {conversationSummary.participantCount}명 참여</p>
                                    <div className="mt-2 space-y-1">
                                        {conversationSummary.topParticipants.slice(0, 3).map((participant, index) => (
                                            <div key={index} className="flex justify-between text-xs">
                                                <span>{participant.name}</span>
                                                <span>{participant.messageCount}개</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white p-3 rounded-lg">
                                    <h5 className="text-sm font-medium text-gray-900 mb-2">감정 분석</h5>
                                    <div className="space-y-1 text-xs">
                                        <div className="flex justify-between">
                                            <span>긍정</span>
                                            <span>{conversationSummary.sentimentAnalysis.positive}개</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>중립</span>
                                            <span>{conversationSummary.sentimentAnalysis.neutral}개</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>부정</span>
                                            <span>{conversationSummary.sentimentAnalysis.negative}개</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-3 rounded-lg">
                                    <h5 className="text-sm font-medium text-gray-900 mb-2">긴급도 분석</h5>
                                    <div className="space-y-1 text-xs">
                                        <div className="flex justify-between">
                                            <span>높음</span>
                                            <span>{conversationSummary.urgencyAnalysis.high}개</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>보통</span>
                                            <span>{conversationSummary.urgencyAnalysis.medium}개</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>낮음</span>
                                            <span>{conversationSummary.urgencyAnalysis.low}개</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-3 rounded-lg">
                                <h5 className="text-sm font-medium text-gray-900 mb-2">전체 요약</h5>
                                <p className="text-sm text-gray-600">{conversationSummary.overallSummary}</p>
                            </div>
                        </div>
                    )}

                    {/* 메시지 목록 */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {displayedMessages.length > 0 ? (
                            displayedMessages.map((message, index) => (
                                <div key={message.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                                    {/* 메시지 헤더 */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                <UserIcon className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-base font-semibold text-gray-900">{message.sender}</span>
                                                <span className="text-sm text-gray-500">{message.timestamp}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">#{index + 1}</span>
                                            <button
                                                className="text-gray-400 hover:text-blue-600 p-1 rounded"
                                                aria-label="메시지 상세 보기"
                                                title="상세 보기"
                                            >
                                                <EyeIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* 메시지 내용 */}
                                    <div className="mb-4">
                                        <p className="text-gray-900 leading-relaxed text-base whitespace-pre-wrap">{message.content}</p>
                                    </div>

                                    {/* 메시지 메타데이터 */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded">
                                                {getSentimentIcon(message.sentiment)}
                                                <span className="text-sm text-gray-600">{getSentimentText(message.sentiment)}</span>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getUrgencyColor((message as any).urgency)}`}>{(message as any).urgency || ''}</span>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <button
                                                className="text-xs text-gray-600 hover:text-blue-600 flex items-center space-x-1 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                                                title="메시지 분석"
                                            >
                                                <HeartIcon className="w-4 h-4" />
                                                <span>분석</span>
                                            </button>
                                            <button
                                                className="text-xs text-gray-600 hover:text-green-600 flex items-center space-x-1 font-medium px-2 py-1 rounded hover:bg-green-50 transition-colors"
                                                onClick={() => copyToClipboard(message.content)}
                                                title="메시지 복사"
                                            >
                                                <ClipboardDocumentIcon className="w-4 h-4" />
                                                <span>복사</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* 즉시 응답 섹션 */}
                                    {message.urgency === 'high' && (
                                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                                                <span className="text-sm font-medium text-red-700">즉시 응답 필요</span>
                                            </div>
                                            <p className="text-sm text-red-600">불만이나 긴급한 문의는 즉시 대응이 필요합니다.</p>
                                        </div>
                                    )}

                                    {/* AI 응답 섹션 */}
                                    {message.aiResponse && (
                                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-blue-700">AI 응답</span>
                                                <span className="text-sm text-blue-600">신뢰도: {message.aiResponse.confidence}%</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-blue-600 flex-1">
                                                    {message.aiResponse.status === 'error'
                                                        ? '메시지를 생성할 수 없습니다. 다시 시도해주세요.'
                                                        : message.aiResponse.message
                                                    }
                                                </p>
                                                <button
                                                    className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                                    onClick={() => copyToClipboard(message.aiResponse?.message || '')}
                                                    title="AI 응답 복사"
                                                >
                                                    복사
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* AI 응답 생성 버튼 */}
                                    {!message.aiResponse && (
                                        <div className="mt-3">
                                            <button
                                                onClick={() => generateAIResponse(message)}
                                                className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors flex items-center space-x-1"
                                                title="AI 응답 생성"
                                            >
                                                <StarIcon className="w-3 h-3" />
                                                <span>AI 응답 생성</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-500">
                                        {searchTerm ? '검색 결과가 없습니다.' : '채팅방을 선택하면 메시지가 표시됩니다.'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* 더 많은 메시지 로드 */}
                        {displayedMessages.length < filteredMessages.length && (
                            <div className="text-center py-4">
                                <button
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 mx-auto"
                                >
                                    {currentPage < totalPages ? (
                                        <>
                                            <ChevronDownIcon className="w-4 h-4" />
                                            <span>더 많은 메시지 로드 ({displayedMessages.length}/{messages.length})</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircleIcon className="w-4 h-4" />
                                            <span>모든 메시지를 불러왔습니다</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 오른쪽 사이드바 */}
            <div className="w-80 bg-white border-l border-gray-200 p-6">
                {/* 참여자 선택 */}
                <div className="bg-white border rounded-lg p-4 mb-6">
                    <div className="flex items-center mb-3">
                        <UserGroupIcon className="w-5 h-5 text-purple-400 mr-2" />
                        <span className="font-semibold text-gray-800 text-base">참여자 선택</span>
                    </div>
                    <label className="block text-sm text-gray-600 mb-1" htmlFor="participant-select">메시지 대상</label>
                    <select
                        id="participant-select"
                        className="w-full border rounded px-3 py-2 text-gray-900 focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
                        value={selectedParticipants.join(',')}
                        onChange={(e) => setSelectedParticipants(e.target.value ? e.target.value.split(',') : [])}
                    >
                        <option value="">참여자를 선택하세요</option>
                        <option value="우성7차">우성7차</option>
                        <option value="관리자">관리자</option>
                        <option value="회원">회원</option>
                        <option value="전체">전체</option>
                    </select>
                </div>

                {/* 성향 & 시공사 */}
                <div className="bg-white border rounded-lg p-4 mb-6">
                    <div className="flex items-center mb-3">
                        <UserGroupIcon className="w-5 h-5 text-purple-400 mr-2" />
                        <span className="font-semibold text-gray-800 text-base">성향 & 시공사</span>
                    </div>
                    {/* 성향 드롭다운 */}
                    <div className="mb-3">
                        <label className="block text-xs text-gray-500 mb-1">🦄 성향</label>
                        <div className="relative">
                            <select
                                className="w-full bg-purple-50 border border-purple-200 rounded px-3 py-2 text-purple-700 font-semibold focus:ring-2 focus:ring-purple-300 focus:border-purple-400 appearance-none"
                                value={tendency}
                                onChange={e => setTendency(e.target.value as 'neutral' | 'friendly' | 'opposed')}
                            >
                                <option value="neutral">중립</option>
                                <option value="friendly">친조</option>
                                <option value="opposed">반조</option>
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
                        </div>
                    </div>
                    {/* 시공사 드롭다운 */}
                    <div className="mb-3">
                        <label className="block text-xs text-gray-500 mb-1">🏗️ 시공사</label>
                        <div className="relative">
                            <select
                                className="w-full bg-orange-50 border border-orange-200 rounded px-3 py-2 text-orange-700 font-semibold focus:ring-2 focus:ring-orange-300 focus:border-orange-400 appearance-none"
                                value={constructionCompany}
                                onChange={e => setConstructionCompany(e.target.value as 'neutral' | 'kangdaewoo_strong' | 'kangdaewoo_medium' | 'kangdaewoo_weak' | 'samsung_strong' | 'samsung_medium' | 'samsung_weak')}
                            >
                                <option value="neutral">중립</option>
                                <option value="kangdaewoo_strong">강대우</option>
                                <option value="kangdaewoo_medium">중대우</option>
                                <option value="kangdaewoo_weak">약대우</option>
                                <option value="samsung_strong">강삼성</option>
                                <option value="samsung_medium">중삼성</option>
                                <option value="samsung_weak">약삼성</option>
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400 pointer-events-none" />
                        </div>
                    </div>
                    <div className="flex justify-center mt-4">
                        <button
                            type="button"
                            className="flex items-center text-xs text-gray-500 hover:text-purple-600 px-2 py-1 rounded transition-colors border border-gray-200 bg-white"
                            onClick={() => { setTendency('neutral'); setConstructionCompany('kangdaewoo_strong'); setSelectedParticipants(['']); }}
                        >
                            <ArrowPathIcon className="w-4 h-4 mr-1" />
                            선택 초기화
                        </button>
                    </div>
                </div>

                {/* 메시지 전략 */}
                <div>
                    <h4 className="font-semibold text-gray-900 mb-3">메시지 전략</h4>

                    <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">기본 메시지 전략</h5>
                        <div className="space-y-2">
                            {[
                                {
                                    id: 'logical_rebuttal',
                                    name: '논리적 반박',
                                    description: '데이터와 근거를 바탕으로 논리적 대응'
                                },
                                {
                                    id: 'information_provision',
                                    name: '정보 제공',
                                    description: '유용한 정보와 지식을 공유'
                                },
                                {
                                    id: 'emotion_avoidance',
                                    name: '감정 회피',
                                    description: '감정적 대립을 피하고 중립적 접근'
                                },
                                {
                                    id: 'short_answer',
                                    name: '단답 강조',
                                    description: '간결하고 명확한 메시지'
                                }
                            ].map(strategy => (
                                <div key={strategy.id} className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-900">{strategy.name}</span>
                                        <input
                                            type="radio"
                                            name="basic-strategy"
                                            value={strategy.id}
                                            checked={messageStrategy === strategy.id}
                                            onChange={(e) => setMessageStrategy(e.target.value)}
                                            className="text-blue-600"
                                            aria-label={`${strategy.name} 선택`}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-600">{strategy.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">커뮤니케이션 방식</h5>
                        <div className="space-y-2">
                            {[
                                {
                                    id: 'majority_opinion',
                                    name: '다수 의견',
                                    description: '다른 사람들의 의견이나 사례를 자연스럽게 언급'
                                },
                                {
                                    id: 'mutual_consideration',
                                    name: '상호 배려',
                                    description: '먼저 도움이나 정보를 제공하며 관계 형성'
                                },
                                {
                                    id: 'experience_sharing',
                                    name: '경험 공유',
                                    description: '개인 경험이나 지식을 자연스럽게 공유'
                                },
                                {
                                    id: 'agreement_seeking',
                                    name: '합의 추구',
                                    description: '공통 관심사를 찾아 자연스러운 대화 유도'
                                }
                            ].map(method => (
                                <div key={method.id} className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-900">{method.name}</span>
                                        <input
                                            type="radio"
                                            name="communication-method"
                                            value={method.id}
                                            checked={communicationMethod === method.id}
                                            onChange={(e) => setCommunicationMethod(e.target.value)}
                                            className="text-blue-600"
                                            aria-label={`${method.name} 선택`}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-600">{method.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 메시지 형식 선택 */}
                    <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">메시지 형식</h5>
                        <div className="max-h-60 overflow-y-auto space-y-2">
                            {[
                                { id: 'refutation', name: '반박', description: '상대 주장의 오류나 약점을 지적하며 부정' },
                                { id: 'counter_question', name: '반문', description: '상대의 주장에 질문을 던져 되묻는 방식' },
                                { id: 'opposition', name: '반대', description: '명확하게 의견을 거부하거나 부정' },
                                { id: 'agreement', name: '동조', description: '상대 의견에 동의하거나 지지' },
                                { id: 'defense', name: '응호', description: '특정 입장이나 대상을 적극적으로 옹호' },
                                { id: 'criticism', name: '비난', description: '강하게 부정적 평가나 공격' },
                                { id: 'neutral', name: '중립', description: '감정이나 입장 없이 상황만 설명' },
                                { id: 'avoidance', name: '회피', description: '명확한 입장을 회피하거나 대화를 흐림' },
                                { id: 'sarcasm', name: '풍자', description: '비꼬거나 간접적으로 비판' },
                                { id: 'empathy', name: '공감', description: '상대 감정을 이해하고 수용' },
                                { id: 'suggestion', name: '제안', description: '해결책이나 대안을 제시' },
                                { id: 'questioning', name: '질문', description: '정보를 얻거나 의문을 던짐' },
                                { id: 'ignoring', name: '무시', description: '반응하지 않거나 대화를 거부' },
                                { id: 'emphasis', name: '강조', description: '특정 사실이나 의견을 부각' },
                                { id: 'speculation', name: '추측', description: '확실하지 않은 의견을 조심스럽게 제시' },
                                { id: 'emotional_appeal', name: '감정적 호소', description: '논리보다 감정에 기반해 설득' },
                                { id: 'mockery', name: '조롱', description: '상대를 비웃거나 깎아내림' },
                                { id: 'directive', name: '명령', description: '지시하거나 강제하는 어투' },
                                { id: 'coercion', name: '강압', description: '위협, 압박을 통해 상대를 설득' },
                                { id: 'forcefulness', name: '강제', description: '선택권을 주지 않고 특정 행동을 요구' },
                                { id: 'brainwashing', name: '세뇌', description: '장기간 반복·왜곡으로 판단력을 마비시킴' },
                                { id: 'gaslighting', name: '가스라이팅', description: '상대의 현실 인식을 부정하거나 조작해 혼란을 유도' }
                            ].map(format => (
                                <div key={format.id} className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-900">{format.name}</span>
                                        <input
                                            type="radio"
                                            name="message-format"
                                            value={format.id}
                                            checked={messageFormat === format.id}
                                            onChange={(e) => setMessageFormat(e.target.value)}
                                            className="text-blue-600"
                                            aria-label={`${format.name} 형식 선택`}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-600">{format.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <h5 className="text-sm font-medium text-purple-900 mb-2">고도화된 인사 선드 기버 NEW</h5>
                        <p className="text-xs text-purple-700">AI 기반 고급 메시지 생성 시스템</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IntegratedConversationSystem; 