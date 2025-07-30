import React, { useState, useEffect } from 'react';
import {
    StarIcon,
    ChatBubbleLeftRightIcon,
    UserIcon,
    ClockIcon,
    EyeIcon,
    ClipboardDocumentIcon,
    HeartIcon,
    FireIcon,
    DocumentTextIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
    ChartBarIcon,
    UserGroupIcon,
    LightBulbIcon,
    ArrowTrendingUpIcon,
    CalendarIcon,
    CogIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import { Message, ConversationSummary, AIResponse, ConversationAnalysis, MessageStrategy, ChatRoom, AnalysisPeriod } from '../types/conversation';

interface ConversationDashboardProps {
    messages?: any[];
}

const ConversationDashboard: React.FC<ConversationDashboardProps> = ({ messages = [] }) => {
    // 상태 관리
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'timestamp' | 'sender' | 'content'>('timestamp');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filterSender, setFilterSender] = useState<string>('');
    const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
    const [showSummary, setShowSummary] = useState(false);
    const [conversationSummary, setConversationSummary] = useState<ConversationSummary | null>(null);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
    const [isGeneratingAIResponse, setIsGeneratingAIResponse] = useState(false);
    const [analysis, setAnalysis] = useState<ConversationAnalysis | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [messagesPerPage] = useState(60);

    // 메시지 필터링 및 정렬
    const filteredAndSortedMessages = messages
        .filter(message => {
            const matchesSearch = message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                message.sender.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSender = !filterSender || message.sender === filterSender;
            return matchesSearch && matchesSender;
        })
        .sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'timestamp':
                    comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
                    break;
                case 'sender':
                    comparison = a.sender.localeCompare(b.sender);
                    break;
                case 'content':
                    comparison = a.content.localeCompare(b.content);
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

    // 페이지네이션
    const totalPages = Math.ceil(filteredAndSortedMessages.length / messagesPerPage);
    const startIndex = (currentPage - 1) * messagesPerPage;
    const endIndex = startIndex + messagesPerPage;
    const displayedMessages = filteredAndSortedMessages.slice(startIndex, endIndex);

    // 고유한 발신자 목록
    const uniqueSenders = Array.from(new Set(messages.map(m => m.sender))).sort();

    // 메시지 복사
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('메시지가 클립보드에 복사되었습니다.');
    };

    // 타임스탬프 포맷팅
    const formatTimestamp = (timestamp: string) => {
        try {
            const date = new Date(timestamp);
            return date.toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return timestamp;
        }
    };

    // 대화 요약 생성
    const generateConversationSummary = async () => {
        if (messages.length === 0) {
            alert('요약할 메시지가 없습니다.');
            return;
        }

        setIsGeneratingSummary(true);
        setShowSummary(true);

        try {
            const summary = await analyzeAndSummarizeConversation(messages);
            setConversationSummary(summary);
        } catch (error) {
            console.error('대화 요약 생성 오류:', error);
            alert('대화 요약 생성 중 오류가 발생했습니다.');
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    // AI 응답 생성
    const generateAIResponse = async (message: Message) => {
        setIsGeneratingAIResponse(true);

        try {
            // AI 응답 시뮬레이션
            await new Promise(resolve => setTimeout(resolve, 2000));

            const strategies = ['logical_rebuttal', 'emotional_softening', 'information_provision', 'unity_emphasis'];
            const strategy = strategies[Math.floor(Math.random() * strategies.length)];

            const quality = {
                relevance: Math.random() * 100,
                accuracy: Math.random() * 100,
                empathy: Math.random() * 100,
                clarity: Math.random() * 100,
                timeliness: Math.random() * 100,
                overall: 0
            };

            quality.overall = (quality.relevance + quality.accuracy + quality.empathy + quality.clarity + quality.timeliness) / 5;

            const feedback: string[] = [];
            if (quality.relevance < 70) feedback.push('관련성이 낮습니다');
            if (quality.accuracy < 80) feedback.push('정확성을 개선해야 합니다');
            if (quality.empathy < 60) feedback.push('공감 표현이 부족합니다');
            if (quality.clarity < 75) feedback.push('명확성을 높여야 합니다');
            if (quality.timeliness < 90) feedback.push('응답 속도를 개선해야 합니다');

            const response: AIResponse = {
                id: Date.now().toString(),
                content: `AI가 생성한 응답 메시지입니다. 전략: ${strategy}`,
                strategy,
                quality: typeof quality === 'object' ? quality.overall : quality,
                feedback: Array.isArray(feedback) ? feedback.join(', ') : feedback,
                timestamp: new Date().toLocaleTimeString(),
                reliability: Math.random() * 100,
                message: `AI가 생성한 응답 메시지입니다. 전략: ${strategy}`,
                confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0 사이의 신뢰도
                status: 'success' as const
            };

            setAiResponse(response);
        } catch (error) {
            console.error('AI 응답 생성 오류:', error);
            alert('AI 응답 생성 중 오류가 발생했습니다.');
        } finally {
            setIsGeneratingAIResponse(false);
        }
    };

    // 대화 분석 및 요약
    const analyzeAndSummarizeConversation = async (allMessages: Message[]): Promise<ConversationSummary> => {
        const participantCounts: Record<string, number> = {};
        allMessages.forEach(m => {
            participantCounts[m.sender] = (participantCounts[m.sender] || 0) + 1;
        });

        const keyParticipants = Object.entries(participantCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([sender]) => sender);

        const content = allMessages.map(m => m.content).join(' ');
        const positiveWords = ['좋다', '만족', '동의', '찬성', '성공', '감사', '좋은', '훌륭'];
        const negativeWords = ['문제', '불만', '반대', '우려', '실패', '어려움', '불편', '부족'];

        const positiveCount = positiveWords.filter(word => content.includes(word)).length;
        const negativeCount = negativeWords.filter(word => content.includes(word)).length;

        let sentiment = '중립';
        if (positiveCount > negativeCount) sentiment = '긍정적';
        else if (negativeCount > positiveCount) sentiment = '부정적';

        const topics = await generateTopicSummaries(allMessages);
        const timestamps = allMessages.map(m => new Date(m.timestamp)).filter(d => !isNaN(d.getTime()));
        const dateRange = {
            start: timestamps.length > 0 ? new Date(Math.min(...timestamps.map(d => d.getTime()))).toLocaleDateString('ko-KR') : '',
            end: timestamps.length > 0 ? new Date(Math.max(...timestamps.map(d => d.getTime()))).toLocaleDateString('ko-KR') : ''
        };

        const overallSummary = `총 ${allMessages.length}개의 메시지와 ${Object.keys(participantCounts).length}명의 참여자가 있는 대화에서, 
주요 주제는 ${topics.length}개 영역으로 분류되었으며, 전반적으로 ${sentiment}적인 분위기입니다. 
가장 활발한 참여자는 ${keyParticipants.slice(0, 3).join(', ')}입니다.`;

        return {
            topics,
            overallSummary: '종합 분석 결과입니다.',
            keyParticipants: Object.keys(participantCounts).slice(0, 5),
            sentiment: 'neutral',
            totalMessages: allMessages.length,
            totalParticipants: Object.keys(participantCounts).length,
            participantCount: Object.keys(participantCounts).length,
            topParticipants: Object.entries(participantCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([name, count]) => ({ name, messageCount: count })),
            sentimentAnalysis: {
                positive: 0,
                negative: 0,
                neutral: allMessages.length
            },
            urgencyAnalysis: {
                high: 0,
                medium: 0,
                low: allMessages.length
            },
            dateRange: {
                start: new Date().toISOString(),
                end: new Date().toISOString()
            }
        };
    };

    // 주제별 요약 생성
    const generateTopicSummaries = async (allMessages: Message[]): Promise<ConversationSummary['topics']> => {
        const topicKeywords = {
            '시공사 평가': {
                keywords: ['시공사', '대우', '삼성', '건설사', '평가', '비교', '선택'],
                examples: ['0035_우성7차', '0111', '0045']
            },
            '홍보방식에 대한 감정적 반응과 평가': {
                keywords: ['홍보', '부스', '방문', '마음', '실망', '태도', '직원', '막'],
                examples: ['0026', '0111', '0084']
            },
            '공사비·분담금 현실 인식 확대': {
                keywords: ['공사비', '분담금', '880', '800', '비용', '예산', '금액', '세대당', '4억'],
                examples: ['0125', '0115', '0035_우성7차']
            },
            '평면·커뮤니티 등 비정량적 요소의 비교 필요성': {
                keywords: ['평면', '커뮤니티', '외관', '디자인', '가치', '수치', '제안서', '주차장', '마감재'],
                examples: ['0114', '0125', '0104']
            }
        };

        const topics: ConversationSummary['topics'] = [];

        for (const [topicName, config] of Object.entries(topicKeywords)) {
            const relatedMessages = allMessages.filter(message =>
                config.keywords.some(keyword => message.content.includes(keyword))
            );

            if (relatedMessages.length > 0) {
                const participants = Array.from(new Set(relatedMessages.map(m => m.sender)));
                const keyParticipants = participants.slice(0, 3);

                const content = relatedMessages.map(m => m.content).join(' ');
                const positiveWords = ['좋다', '만족', '동의', '찬성', '성공', '감사', '좋은', '훌륭'];
                const negativeWords = ['문제', '불만', '반대', '우려', '실패', '어려움', '불편', '부족', '실망'];

                const positiveCount = positiveWords.filter(word => content.includes(word)).length;
                const negativeCount = negativeWords.filter(word => content.includes(word)).length;

                let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
                if (positiveCount > negativeCount) sentiment = 'positive';
                else if (negativeCount > positiveCount) sentiment = 'negative';

                const keywords = config.keywords.filter(word => content.includes(word));

                let summary = '';
                if (topicName === '시공사 평가') {
                    summary = `시공사를 고르는 기준이 '공사비 낮추기'로만 흐르면 안 되며, "고급화 설계 제안 → 적정 공사비 제시"가 바람직하다고 강조. 고급화 설계를 요청하지 않고 가격만 따지면, 결국 고급아파트를 지을 수 없게 된다고 지적.`;
                } else if (topicName === '홍보방식에 대한 감정적 반응과 평가') {
                    summary = `"홍보부스 방문 후 마음이 돌아섰다"며 대우건설 홍보 태도를 문제 삼음. "홍보직원이 저렇게 막 나가도 되는 건가 싶다"며 부정적 인상 표현.`;
                } else if (topicName === '공사비·분담금 현실 인식 확대') {
                    summary = `"880만 원 기준이라도 세대당 약 4억의 분담금이 예상된다"고 언급. "상가 협의 결과에 따라 단지 규모가 축소될 경우, 커뮤니티 시설도 줄어들 수 있다"고 우려.`;
                } else if (topicName === '평면·커뮤니티 등 비정량적 요소의 비교 필요성') {
                    summary = `"제안서엔 숫자가 다가 아니며, 아파트 가치에 영향을 주는 건 평면, 커뮤니티, 외관"이라고 강조. "삼성의 평면은 아쉬운 부분이 많다"고 개인적 평가 공유.`;
                } else {
                    summary = `${topicName}에 대한 논의가 ${relatedMessages.length}개의 메시지로 진행됨. 주요 참여자: ${keyParticipants.join(', ')}.`;
                }

                topics.push({
                    title: topicName,
                    messages: relatedMessages,
                    summary,
                    keyParticipants,
                    sentiment,
                    keywords
                });
            }
        }

        return topics.sort((a, b) => b.messages.length - a.messages.length);
    };

    // 메시지 전략
    const messageStrategies: MessageStrategy[] = [
        {
            id: 'logical_rebuttal',
            name: '논리적 반박',
            description: '데이터와 근거를 바탕으로 논리적 대응',
            type: 'basic'
        },
        {
            id: 'information_provision',
            name: '정보 제공',
            description: '유용한 정보와 지식을 공유',
            type: 'basic'
        },
        {
            id: 'emotional_avoidance',
            name: '감정 회피',
            description: '감정적 대립을 피하고 중립적 접근',
            type: 'basic'
        },
        {
            id: 'short_answer',
            name: '단답 강조',
            description: '간결하고 명확한 메시지',
            type: 'basic'
        },
        {
            id: 'multiple_opinions',
            name: '다수 의견',
            description: '다른 사람들의 의견이나 사례를 자연스럽게 언급',
            type: 'communication'
        },
        {
            id: 'mutual_consideration',
            name: '상호 배려',
            description: '먼저 도움이나 정보를 제공하며 관계 형성',
            type: 'communication'
        },
        {
            id: 'experience_sharing',
            name: '경험 공유',
            description: '개인 경험이나 지식을 자연스럽게 공유',
            type: 'communication'
        },
        {
            id: 'seeking_agreement',
            name: '합의 추구',
            description: '공통 관심사를 찾아 자연스러운 대화 유도',
            type: 'communication'
        }
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* 좌측 사이드바 */}
            <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
                {/* 채팅방 정보 */}
                {/* chatRoom prop이 없으므로 이 부분은 주석 처리 */}
                {/*
                {chatRoom && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <CheckCircleIcon className="w-5 h-5 mr-2 text-green-600" />
                            채팅방
                        </h3>
                        <div className="bg-green-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                                <span className="font-medium text-green-800">{chatRoom.name}</span>
                            </div>
                            <div className="text-sm text-green-700">
                                <div>전체: {chatRoom.messageCount}개 메시지</div>
                                <div>활성 상태</div>
                            </div>
                        </div>
                    </div>
                )}
                */}

                {/* 분석 기간 */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">분석 기간</h3>
                    <div className="space-y-2">
                        {['전체', '오늘', '이번 주', '이번 달'].map((period) => (
                            <button
                                key={period}
                                onClick={() => setSelectedPeriod(period)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedPeriod === period
                                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {period}
                            </button>
                        ))}
                    </div>

                    <div className="mt-4 space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">시작 날짜</label>
                            <input
                                type="datetime-local"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                defaultValue="2020-01-01T00:00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">종료 날짜</label>
                            <input
                                type="datetime-local"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                defaultValue="2026-12-31T23:59"
                            />
                        </div>
                        <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                            기간 적용
                        </button>
                    </div>

                    <div className="mt-3 text-sm text-gray-600">
                        <div>선택된 기간: {selectedPeriod}</div>
                        <div>{messages.length}개 메시지 • {uniqueSenders.length}명 참여</div>
                    </div>
                </div>

                {/* AI 생성 통계 */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">AI 생성 통계</h3>
                    <div className="space-y-3">
                        <div className="bg-blue-50 rounded-lg p-3">
                            <div className="text-sm text-blue-600">총 생성수</div>
                            <div className="text-lg font-bold text-blue-900">1개</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                            <div className="text-sm text-green-600">평균 신뢰도</div>
                            <div className="text-lg font-bold text-green-900">60%</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3">
                            <div className="text-sm text-purple-600">피드백 수</div>
                            <div className="text-lg font-bold text-purple-900">0개</div>
                        </div>
                    </div>

                    <div className="mt-4 space-y-2">
                        <div className="text-sm">
                            <span className="text-gray-600">성향:</span>
                            <span className="ml-2 text-gray-900">중립</span>
                        </div>
                        <div className="text-sm">
                            <span className="text-gray-600">시공사:</span>
                            <span className="ml-2 text-gray-900">강대우</span>
                        </div>
                        <div className="text-sm">
                            <span className="text-gray-600">전략:</span>
                            <span className="ml-2 text-gray-900">concern_sharing</span>
                        </div>
                    </div>

                    <div className="mt-4 space-y-2">
                        <button className="w-full bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
                            히스토리 내보내기
                        </button>
                        <button className="w-full bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700 transition-colors">
                            히스토리 초기화
                        </button>
                    </div>
                </div>
            </div>

            {/* 중앙 메시지 영역 */}
            <div className="flex-1 flex flex-col">
                {/* 헤더 */}
                <div className="bg-white border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-xl font-bold text-gray-900 flex items-center">
                                <StarIcon className="w-6 h-6 mr-2 text-purple-600" />
                                AI 대화분석시스템
                            </h1>
                            <div className="flex items-center space-x-2">
                                <div className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    연결 대기 중
                                </div>
                                <div className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                                    전체 기간
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 메시지 영역 */}
                <div className="flex-1 p-4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
                        {/* 메시지 헤더 */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    전체 기간 메시지
                                </h3>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <span>{displayedMessages.length} / {filteredAndSortedMessages.length}개 표시</span>
                                    <button className="p-1 hover:bg-gray-100 rounded">
                                        <ChevronUpIcon className="w-4 h-4" />
                                    </button>
                                    <button className="p-1 hover:bg-gray-100 rounded">
                                        <ChevronDownIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <div className="flex-1 relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="메시지 검색... (키워드, 발신자, 내용)"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    />
                                </div>
                                <select
                                    value={filterSender}
                                    onChange={(e) => setFilterSender(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    aria-label="발신자 필터"
                                >
                                    <option value="">모든 발신자</option>
                                    {uniqueSenders.map(sender => (
                                        <option key={sender} value={sender}>{sender}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* 메시지 목록 */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {displayedMessages.length > 0 ? (
                                <div className="space-y-4">
                                    {displayedMessages.map((message, index) => (
                                        <div key={message.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <UserIcon className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{message.sender}</div>
                                                        <div className="text-sm text-gray-500">{formatTimestamp(message.timestamp)}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs text-gray-400">#{startIndex + index + 1}</span>
                                                    <div className="flex items-center space-x-1">
                                                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                                                            중립
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <p className="text-gray-800 leading-relaxed">{message.content}</p>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => generateAIResponse(message)}
                                                        disabled={isGeneratingAIResponse}
                                                        className="text-xs text-red-600 hover:text-red-800 flex items-center space-x-1"
                                                    >
                                                        <ExclamationTriangleIcon className="w-3 h-3" />
                                                        <span>즉시 응답</span>
                                                    </button>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => copyToClipboard(message.content)}
                                                        className="text-xs text-gray-500 hover:text-blue-600 flex items-center space-x-1"
                                                    >
                                                        <ClipboardDocumentIcon className="w-3 h-3" />
                                                        <span>복사</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedMessage(message)}
                                                        className="text-xs text-gray-500 hover:text-blue-600 flex items-center space-x-1"
                                                    >
                                                        <EyeIcon className="w-3 h-3" />
                                                        <span>상세</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* AI 응답 영역 */}
                                            {aiResponse && selectedMessage?.id === message.id && (
                                                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium text-blue-900">AI 응답</span>
                                                        <span className="text-xs text-blue-600">신뢰도: {(aiResponse.reliability || 0).toFixed(0)}%</span>
                                                    </div>
                                                    <div className="text-sm text-blue-800 mb-2">{aiResponse.content}</div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-blue-600">전략: {aiResponse.strategy}</span>
                                                        <button
                                                            onClick={() => copyToClipboard(aiResponse.content || '')}
                                                            className="text-xs text-blue-600 hover:text-blue-800"
                                                        >
                                                            복사
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
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
                        </div>
                    </div>
                </div>
            </div>

            {/* 우측 분석 영역 */}
            <div className="w-96 bg-white border-l border-gray-200 p-4 overflow-y-auto">
                {/* 참여자 선택 */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">참여자 선택</h3>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" aria-label="메시지 대상">
                        <option value="">참여자를 선택하세요</option>
                        {uniqueSenders.map(sender => (
                            <option key={sender} value={sender}>{sender}</option>
                        ))}
                    </select>
                </div>

                {/* 성향 & 시공사 */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">성향 & 시공사</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">성향</label>
                            <div className="flex items-center space-x-2">
                                <StarIcon className="w-4 h-4 text-purple-600" />
                                <select className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" aria-label="성향 선택">
                                    <option value="neutral">중립</option>
                                    <option value="positive">긍정</option>
                                    <option value="negative">부정</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">시공사</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" aria-label="시공사 선택">
                                <option value="kang_dae_woo">강대우</option>
                                <option value="samsung">삼성</option>
                                <option value="daewoo">대우</option>
                            </select>
                        </div>
                        <button className="w-full bg-gray-600 text-white py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors">
                            선택 초기화
                        </button>
                    </div>
                </div>

                {/* 메시지 전략 */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">메시지 전략</h3>

                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">기본 메시지 전략</h4>
                        <div className="space-y-2">
                            {messageStrategies.filter(s => s.type === 'basic').map(strategy => (
                                <div key={strategy.id} className="p-2 bg-gray-50 rounded text-sm">
                                    <div className="font-medium text-gray-900">{strategy.name}</div>
                                    <div className="text-gray-600">{strategy.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">커뮤니케이션 방식</h4>
                        <div className="space-y-2">
                            {messageStrategies.filter(s => s.type === 'communication').map(strategy => (
                                <div key={strategy.id} className="p-2 bg-gray-50 rounded text-sm">
                                    <div className="font-medium text-gray-900">{strategy.name}</div>
                                    <div className="text-gray-600">{strategy.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 대화 요약 */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">대화 요약</h3>
                        <button
                            onClick={generateConversationSummary}
                            disabled={isGeneratingSummary}
                            className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:bg-gray-400 transition-colors flex items-center space-x-1"
                        >
                            <StarIcon className="w-3 h-3" />
                            <span>{isGeneratingSummary ? '생성 중...' : '요약 생성'}</span>
                        </button>
                    </div>

                    {conversationSummary && (
                        <div className="space-y-3">
                            {conversationSummary.topics.slice(0, 3).map((topic, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-3">
                                    <h5 className="text-sm font-medium text-gray-900 mb-2">
                                        {index + 1}. {topic.title}
                                    </h5>
                                    <div className="text-xs text-gray-600 mb-2">
                                        {topic.messages.slice(0, 2).map((msg, msgIndex) => (
                                            <div key={msgIndex} className="mb-1">
                                                {msg.sender}: {msg.content.substring(0, 80)}...
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-xs text-blue-700 font-medium">
                                        ➡ 요약: {topic.summary.substring(0, 100)}...
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConversationDashboard; 