import React, { useState, useEffect } from 'react';
import {
    ClockIcon,
    UserIcon,
    ChatBubbleLeftRightIcon,
    ArrowTrendingUpIcon,
    CalendarIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    StarIcon
} from '@heroicons/react/24/outline';
import { utils } from '../services/dialogueAPI';

interface ConversationSession {
    id: string;
    title: string;
    description: string;
    messages: ConversationMessage[];
    total_messages: number;
    avg_effectiveness: number;
    dominant_types: string[];
    tags: string[];
    created_at: string;
    updated_at: string;
    user_rating: number;
    metadata: {
        total_words: number;
        session_duration: number;
        context_changes: number;
        effectiveness_trend: number[];
    };
}

interface ConversationMessage {
    id: string;
    input_text: string;
    generated_responses: Array<{
        message: string;
        dialogue_type: string;
        intensity: number;
        effectiveness: number;
        selected: boolean;
    }>;
    context_analysis: {
        emotion: string;
        situation: string;
        relationship: string;
    };
    timestamp: string;
    user_feedback?: {
        rating: number;
        comment: string;
    };
}

interface SessionAnalytics {
    total_sessions: number;
    total_messages: number;
    avg_session_duration: number;
    most_used_types: Array<{ type: string; count: number; percentage: number }>;
    effectiveness_trends: Array<{ date: string; score: number }>;
    popular_tags: Array<{ tag: string; count: number }>;
}

const ConversationHistoryManager: React.FC = () => {
    const [sessions, setSessions] = useState<ConversationSession[]>([]);
    const [selectedSession, setSelectedSession] = useState<ConversationSession | null>(null);
    const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [sortBy, setSortBy] = useState('recent');
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [newSessionTitle, setNewSessionTitle] = useState('');
    const [showNewSessionForm, setShowNewSessionForm] = useState(false);

    // 초기 데이터 로드
    useEffect(() => {
        loadConversationHistory();
        generateAnalytics();
    }, []);

    const loadConversationHistory = () => {
        // 실제로는 API에서 로드
        const mockSessions = generateMockSessions();
        setSessions(mockSessions);
        if (mockSessions.length > 0) {
            setSelectedSession(mockSessions[0]);
        }
    };

    const generateMockSessions = (): ConversationSession[] => {
        const sessionTypes = ['업무 협상', '고객 상담', '회의 토론', '일상 대화', '공정성 논의'];
        const tags = ['중요', '효과적', '학습필요', '템플릿화', '재검토'];

        return Array.from({ length: 15 }, (_, i) => ({
            id: `session_${i + 1}`,
            title: `${sessionTypes[i % sessionTypes.length]} ${i + 1}`,
            description: `${new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR')} 대화 세션`,
            messages: generateMockMessages(Math.floor(Math.random() * 10) + 5),
            total_messages: Math.floor(Math.random() * 15) + 5,
            avg_effectiveness: 0.6 + Math.random() * 0.3,
            dominant_types: ['공감', '제안', '반문'].slice(0, Math.floor(Math.random() * 3) + 1),
            tags: tags.slice(0, Math.floor(Math.random() * 3) + 1),
            created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - i * 12 * 60 * 60 * 1000).toISOString(),
            user_rating: Math.floor(Math.random() * 5) + 1,
            metadata: {
                total_words: Math.floor(Math.random() * 1000) + 200,
                session_duration: Math.floor(Math.random() * 3600) + 300, // 5분-1시간
                context_changes: Math.floor(Math.random() * 5) + 1,
                effectiveness_trend: Array.from({ length: 10 }, () => 0.5 + Math.random() * 0.4)
            }
        }));
    };

    const generateMockMessages = (count: number): ConversationMessage[] => {
        const sampleInputs = [
            '이 결정이 공정한지 의문입니다',
            '더 나은 해결책이 있을 것 같은데요',
            '상황을 다시 검토해볼 필요가 있습니다',
            '다른 의견은 어떤가요?',
            '이 문제에 대해 어떻게 생각하시나요?'
        ];

        return Array.from({ length: count }, (_, i) => ({
            id: `msg_${i + 1}`,
            input_text: sampleInputs[i % sampleInputs.length],
            generated_responses: [
                {
                    message: '말씀하신 부분에 대해 충분히 공감합니다. 함께 더 나은 방향을 모색해보면 어떨까요?',
                    dialogue_type: '공감',
                    intensity: 3,
                    effectiveness: 0.85,
                    selected: true
                },
                {
                    message: '그런 관점도 있겠지만, 다른 측면에서 볼 때는 어떨까요?',
                    dialogue_type: '반문',
                    intensity: 2,
                    effectiveness: 0.72,
                    selected: false
                }
            ],
            context_analysis: {
                emotion: ['neutral', 'concern', 'curiosity'][Math.floor(Math.random() * 3)],
                situation: ['discussion', 'question', 'concern'][Math.floor(Math.random() * 3)],
                relationship: ['neutral', 'formal', 'friendly'][Math.floor(Math.random() * 3)]
            },
            timestamp: new Date(Date.now() - i * 60 * 1000).toISOString(),
            user_feedback: Math.random() > 0.5 ? {
                rating: Math.floor(Math.random() * 5) + 1,
                comment: '도움이 되었습니다'
            } : undefined
        }));
    };

    const generateAnalytics = () => {
        const mockAnalytics: SessionAnalytics = {
            total_sessions: 15,
            total_messages: 125,
            avg_session_duration: 1250, // 초
            most_used_types: [
                { type: '공감', count: 45, percentage: 36 },
                { type: '제안', count: 32, percentage: 26 },
                { type: '반문', count: 28, percentage: 22 },
                { type: '강조', count: 20, percentage: 16 }
            ],
            effectiveness_trends: Array.from({ length: 30 }, (_, i) => ({
                date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                score: 0.6 + Math.random() * 0.3
            })),
            popular_tags: [
                { tag: '효과적', count: 8 },
                { tag: '중요', count: 6 },
                { tag: '템플릿화', count: 4 },
                { tag: '학습필요', count: 3 }
            ]
        };
        setAnalytics(mockAnalytics);
    };

    const filteredSessions = sessions.filter(session => {
        const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            session.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            session.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesFilter = filterType === 'all' ||
            (filterType === 'high_rating' && session.user_rating >= 4) ||
            (filterType === 'recent' && new Date(session.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
            (filterType === 'effective' && session.avg_effectiveness >= 0.8);

        return matchesSearch && matchesFilter;
    });

    const sortedSessions = [...filteredSessions].sort((a, b) => {
        switch (sortBy) {
            case 'recent':
                return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
            case 'rating':
                return b.user_rating - a.user_rating;
            case 'effectiveness':
                return b.avg_effectiveness - a.avg_effectiveness;
            case 'messages':
                return b.total_messages - a.total_messages;
            default:
                return 0;
        }
    });

    const createNewSession = () => {
        const newSession: ConversationSession = {
            id: `session_${Date.now()}`,
            title: newSessionTitle || '새 대화 세션',
            description: `${new Date().toLocaleDateString('ko-KR')} 새로 시작된 세션`,
            messages: [],
            total_messages: 0,
            avg_effectiveness: 0,
            dominant_types: [],
            tags: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_rating: 0,
            metadata: {
                total_words: 0,
                session_duration: 0,
                context_changes: 0,
                effectiveness_trend: []
            }
        };

        setSessions([newSession, ...sessions]);
        setSelectedSession(newSession);
        setShowNewSessionForm(false);
        setNewSessionTitle('');
    };

    const deleteSession = (sessionId: string) => {
        const updatedSessions = sessions.filter(s => s.id !== sessionId);
        setSessions(updatedSessions);
        if (selectedSession?.id === sessionId) {
            setSelectedSession(updatedSessions[0] || null);
        }
    };

    const exportSession = (session: any) => {
        const exportData = {
            session_id: session.id,
            messages: session.messages,
            participants: session.participants,
            summary: session.summary,
            analytics: session.analytics,
            exported_at: new Date().toISOString(),
            format: 'conversation_history_v1'
        };
        utils.downloadFile(exportData, `conversation_${session.id}.json`);
    };

    const formatDuration = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}시간 ${minutes}분`;
        return `${minutes}분`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* 헤더 */}
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center mb-4">
                        <ChatBubbleLeftRightIcon className="h-12 w-12 text-purple-600 mr-3" />
                        <h1 className="text-4xl font-bold text-gray-900">대화 히스토리 관리</h1>
                    </div>
                    <p className="text-xl text-gray-600">과거 대화를 분석하고 학습 데이터로 활용하세요</p>
                </div>

                {/* 컨트롤 바 */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            {/* 검색 */}
                            <div className="relative">
                                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="세션 검색..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {/* 필터 */}
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="all">전체</option>
                                <option value="recent">최근 7일</option>
                                <option value="high_rating">높은 평점</option>
                                <option value="effective">효과적</option>
                            </select>

                            {/* 정렬 */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="recent">최신순</option>
                                <option value="rating">평점순</option>
                                <option value="effectiveness">효과성순</option>
                                <option value="messages">메시지수순</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setShowAnalytics(!showAnalytics)}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <ArrowTrendingUpIcon className="h-4 w-4" />
                                <span>분석</span>
                            </button>

                            <button
                                onClick={() => setShowNewSessionForm(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                                <span>새 세션</span>
                            </button>
                        </div>
                    </div>

                    {/* 요약 통계 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="text-sm text-purple-600">총 세션</div>
                            <div className="text-2xl font-bold text-purple-900">{sessions.length}</div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-sm text-blue-600">총 메시지</div>
                            <div className="text-2xl font-bold text-blue-900">
                                {sessions.reduce((sum, s) => sum + s.total_messages, 0)}
                            </div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-sm text-green-600">평균 효과성</div>
                            <div className="text-2xl font-bold text-green-900">
                                {utils.formatEffectiveness(sessions.reduce((sum, s) => sum + s.avg_effectiveness, 0) / sessions.length || 0)}
                            </div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <div className="text-sm text-yellow-600">평균 평점</div>
                            <div className="text-2xl font-bold text-yellow-900">
                                {(sessions.reduce((sum, s) => sum + s.user_rating, 0) / sessions.length || 0).toFixed(1)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 분석 대시보드 */}
                {showAnalytics && analytics && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">세션 분석 리포트</h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* 사용된 대화 유형 분포 */}
                            <div>
                                <h3 className="font-medium text-gray-900 mb-4">주요 사용 대화 유형</h3>
                                <div className="space-y-3">
                                    {analytics.most_used_types.map((type, index) => (
                                        <div key={type.type} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-purple-500' :
                                                    index === 1 ? 'bg-blue-500' :
                                                        index === 2 ? 'bg-green-500' : 'bg-yellow-500'
                                                    }`} />
                                                <span className="text-sm text-gray-700">{type.type}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-purple-600 h-2 rounded-full"
                                                        style={{ width: `${type.percentage}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">{type.count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 인기 태그 */}
                            <div>
                                <h3 className="font-medium text-gray-900 mb-4">인기 태그</h3>
                                <div className="flex flex-wrap gap-2">
                                    {analytics.popular_tags.map(tag => (
                                        <span
                                            key={tag.tag}
                                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center space-x-1"
                                        >
                                            <CalendarIcon className="h-3 w-3" />
                                            <span>{tag.tag}</span>
                                            <span className="font-medium">({tag.count})</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 효과성 트렌드 차트 */}
                        <div className="mt-6">
                            <h3 className="font-medium text-gray-900 mb-4">30일 효과성 트렌드</h3>
                            <div className="h-32 flex items-end justify-between space-x-1">
                                {analytics.effectiveness_trends.slice(-15).map((data, index) => (
                                    <div key={index} className="flex flex-col items-center flex-1">
                                        <div
                                            className="bg-gradient-to-t from-purple-600 to-purple-400 rounded-t w-full transition-all duration-300"
                                            style={{ height: `${data.score * 100}px` }}
                                            title={`${new Date(data.date).toLocaleDateString('ko-KR')}: ${utils.formatEffectiveness(data.score)}`}
                                        />
                                        <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-center">
                                            {index % 3 === 0 ? new Date(data.date).getDate() : ''}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 왼쪽: 세션 목록 */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                대화 세션 ({sortedSessions.length})
                            </h2>

                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {sortedSessions.map(session => (
                                    <div
                                        key={session.id}
                                        className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedSession?.id === session.id
                                            ? 'bg-purple-50 border-purple-200 ring-2 ring-purple-500'
                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                            }`}
                                        onClick={() => setSelectedSession(session)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-medium text-gray-900 truncate">{session.title}</h3>
                                            <div className="flex items-center space-x-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <StarIcon
                                                        key={i}
                                                        className={`h-3 w-3 ${i < session.user_rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-2 truncate">{session.description}</p>

                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>{session.total_messages}개 메시지</span>
                                            <span>{utils.formatEffectiveness(session.avg_effectiveness)}</span>
                                        </div>

                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {session.tags.slice(0, 2).map(tag => (
                                                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                                    {tag}
                                                </span>
                                            ))}
                                            {session.tags.length > 2 && (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                                    +{session.tags.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {sortedSessions.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                        <p>검색 결과가 없습니다</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 오른쪽: 세션 상세 */}
                    <div className="lg:col-span-2">
                        {selectedSession ? (
                            <div className="space-y-6">
                                {/* 세션 헤더 */}
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900">{selectedSession.title}</h2>
                                            <p className="text-gray-600">{selectedSession.description}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => exportSession(selectedSession)}
                                                className="p-2 text-gray-400 hover:text-blue-600"
                                                title="내보내기"
                                            >
                                                <ClockIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => deleteSession(selectedSession.id)}
                                                className="p-2 text-gray-400 hover:text-red-600"
                                                title="삭제"
                                            >
                                                <UserIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* 세션 메타데이터 */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <div className="text-sm text-gray-600">메시지 수</div>
                                            <div className="font-semibold">{selectedSession.total_messages}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">평균 효과성</div>
                                            <div className="font-semibold">{utils.formatEffectiveness(selectedSession.avg_effectiveness)}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">세션 시간</div>
                                            <div className="font-semibold">{formatDuration(selectedSession.metadata.session_duration)}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">사용자 평점</div>
                                            <div className="flex items-center space-x-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <StarIcon
                                                        key={i}
                                                        className={`h-4 w-4 ${i < selectedSession.user_rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 주요 대화 유형 */}
                                    <div className="mt-4">
                                        <div className="text-sm text-gray-600 mb-2">주요 사용 유형</div>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedSession.dominant_types.map(type => (
                                                <span key={type} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                                    {type}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* 메시지 리스트 */}
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">대화 내역</h3>

                                    <div className="space-y-4 max-h-96 overflow-y-auto">
                                        {selectedSession.messages.map((message, index) => (
                                            <div key={message.id} className="border-l-4 border-purple-200 pl-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="text-sm text-gray-500">
                                                        메시지 #{index + 1} • {utils.formatTime(message.timestamp)}
                                                    </div>
                                                    {message.user_feedback && (
                                                        <div className="flex items-center space-x-1">
                                                            {Array.from({ length: message.user_feedback.rating }).map((_, i) => (
                                                                <StarIcon key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                                                    <div className="font-medium text-gray-900 mb-1">입력:</div>
                                                    <p className="text-gray-700">{message.input_text}</p>
                                                </div>

                                                <div className="space-y-2">
                                                    {message.generated_responses.map((response, rIndex) => (
                                                        <div
                                                            key={rIndex}
                                                            className={`p-3 rounded-lg ${response.selected ? 'bg-green-50 border border-green-200' : 'bg-blue-50'
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center space-x-2">
                                                                    <span className="text-sm font-medium text-gray-700">{response.dialogue_type}</span>
                                                                    <span className="text-xs text-gray-500">강도 {response.intensity}</span>
                                                                    {response.selected && (
                                                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">선택됨</span>
                                                                    )}
                                                                </div>
                                                                <span className="text-sm font-medium text-gray-700">
                                                                    {utils.formatEffectiveness(response.effectiveness)}
                                                                </span>
                                                            </div>
                                                            <p className="text-gray-700">{response.message}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                {message.user_feedback && (
                                                    <div className="mt-2 p-2 bg-yellow-50 rounded text-sm">
                                                        <strong>피드백:</strong> {message.user_feedback.comment}
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {selectedSession.messages.length === 0 && (
                                            <div className="text-center py-8 text-gray-500">
                                                <ChatBubbleLeftRightIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                                <p>아직 메시지가 없습니다</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                                <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">세션을 선택하세요</h3>
                                <p className="text-gray-500">왼쪽 목록에서 대화 세션을 선택하여 상세 내용을 확인하세요</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 새 세션 생성 모달 */}
                {showNewSessionForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">새 대화 세션 만들기</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">세션 제목</label>
                                <input
                                    type="text"
                                    value={newSessionTitle}
                                    onChange={(e) => setNewSessionTitle(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    placeholder="예: 고객 상담 세션"
                                />
                            </div>
                            <div className="flex space-x-3 mt-6">
                                <button
                                    onClick={() => setShowNewSessionForm(false)}
                                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={createNewSession}
                                    className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                    생성
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConversationHistoryManager; 