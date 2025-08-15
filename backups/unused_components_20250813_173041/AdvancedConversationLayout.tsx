import React, { useState, useEffect } from 'react';
import {
  StarIcon,
    MagnifyingGlassIcon,
    CalendarIcon,
    UserGroupIcon,
    ChatBubbleLeftRightIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    DocumentArrowDownIcon,
    ArrowPathIcon,
    DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

interface Message {
    id: string;
    sender: string;
    content: string;
    timestamp: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    isSelected?: boolean;
}

interface AIResponse {
    confidence: number;
    content: string;
    strategy: string;
    waitTime: number;
}

const AdvancedConversationLayout: React.FC = () => {
    const [selectedChatRoom, setSelectedChatRoom] = useState('[인증]행복한소유☆개포우성7차');
    const [selectedPeriod, setSelectedPeriod] = useState('전체');
    const [startDate, setStartDate] = useState('2020. 01. 01. 오전 12:00');
    const [endDate, setEndDate] = useState('2026. 12. 31. 오후 11:59');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
    const [selectedTendency, setSelectedTendency] = useState('중립');
    const [selectedContractor, setSelectedContractor] = useState('강대우');
    const [selectedStrategy, setSelectedStrategy] = useState('concern_sharing');
    const [connectionStatus, setConnectionStatus] = useState('연결 대기 중');

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '0098',
            sender: '우성7차',
            content: '환급금 3억 받은걸로 알고 있습니다! 환급금이 실제로는 얼마인지 정확히 알려주세요. 자산가치가 떨어지면 어떻게 되는지도 설명해주세요.',
            timestamp: '2025년 6월 24일 오전 9:22',
            sentiment: 'neutral'
        },
        {
            id: '0124우성',
            sender: '우성7차',
            content: '환급금 3억 받은걸로 알고 있습니다! 2',
            timestamp: '2025년 6월 24일 오전 9:25',
            sentiment: 'neutral'
        },
        {
            id: '0124우성2',
            sender: '우성7차',
            content: '개인당 2',
            timestamp: '2025년 6월 24일 오전 9:25',
            sentiment: 'neutral'
        },
        {
            id: '0124우성3',
            sender: '우성7차',
            content: '저도 동감합니다! 2',
            timestamp: '2025년 6월 24일 오전 9:26',
            sentiment: 'neutral'
        },
        {
            id: '0035_우성7차',
            sender: '우성7차',
            content: '재개발 사업에 대한 구체적인 일정과 비용에 대해 더 자세히 알려주세요.',
            timestamp: '2025년 6월 24일 오전 9:54',
            sentiment: 'neutral'
        }
    ]);

    const handleMessageSelect = (message: Message) => {
        setSelectedMessage(message);
        // AI 응답 시뮬레이션
        setAiResponse({
            confidence: 60,
            content: '메시지를 생성할 수 없습니다. 다시 시도해주세요.',
            strategy: 'concern_sharing',
            waitTime: 0
        });
    };

    const getSentimentIcon = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return '😊';
            case 'negative': return '😞';
            default: return '😐';
        }
    };

    const getSentimentText = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return '긍정';
            case 'negative': return '부정';
            default: return '중립';
        }
    };

    return (
        <div className="h-screen bg-gray-50 flex flex-col">
            {/* 헤더 */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="text-2xl">✨</div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">AI 대화분석시스템</h1>
                            <p className="text-sm text-gray-600">맥락 기반 메시지 자동 생성 및 분석</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{connectionStatus}</span>
                        <span>{selectedPeriod}</span>
                    </div>
                </div>
            </div>

            {/* 메인 컨텐츠 */}
            <div className="flex-1 flex">
                {/* 왼쪽 사이드바 */}
                <div className="w-80 bg-white border-r border-gray-200 p-6 space-y-6">
                    {/* 채팅방 선택 */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">채팅방</h3>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="font-medium text-blue-900">{selectedChatRoom}</div>
                            <div className="text-sm text-blue-700 mt-1">전체: 4106개 메시지 • 활성 상태</div>
                        </div>
                    </div>

                    {/* 분석 기간 */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">분석 기간</h3>
                        <div className="space-y-3">
                            <div className="flex space-x-2">
                                {['전체', '오늘', '이번 주', '이번 달'].map((period) => (
                                    <button
                                        key={period}
                                        onClick={() => setSelectedPeriod(period)}
                                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${selectedPeriod === period
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-gray-700">사용자 지정 기간</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <CalendarIcon className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">시작 날짜: {startDate}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <CalendarIcon className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">종료 날짜: {endDate}</span>
                                    </div>
                                    <button className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                                        기간 적용
                                    </button>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-sm font-medium text-gray-900">선택된 기간</div>
                                <div className="text-sm text-gray-600">{selectedPeriod} • 4106개 메시지 • 70명 참여</div>
                            </div>
                        </div>
                    </div>

                    {/* AI 생성 통계 */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">AI 생성 통계</h3>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="text-sm text-gray-600">총 생성수</div>
                                    <div className="text-lg font-semibold">1개</div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="text-sm text-gray-600">평균 신뢰도</div>
                                    <div className="text-lg font-semibold">60%</div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-sm text-gray-600">피드백 수</div>
                                <div className="text-lg font-semibold">0개</div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-gray-700">인기 설정</h4>
                                <div className="space-y-1 text-sm">
                                    <div>성향: {selectedTendency}</div>
                                    <div>시공사: {selectedContractor}</div>
                                    <div>전략: {selectedStrategy}</div>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <button className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 flex items-center justify-center space-x-1">
                                    <DocumentArrowDownIcon className="w-4 h-4" />
                                    <span>히스토리 내보내기</span>
                                </button>
                                <button className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 flex items-center justify-center space-x-1">
                                    <ArrowPathIcon className="w-4 h-4" />
                                    <span>히스토리 초기화</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 중앙 컨텐츠 */}
                <div className="flex-1 flex flex-col">
                    {/* 대화 내용 헤더 */}
                    <div className="bg-white border-b border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">대화 내용</h2>
                            <div className="text-sm text-gray-600">60 / 4106개 표시</div>
                        </div>
                        <div className="mt-3 relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="메시지 검색... (키워드, 발신자, 내용)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* 메시지 목록 */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
                            <div key={message.id} className="space-y-3">
                                <div
                                    className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedMessage?.id === message.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                    onClick={() => handleMessageSelect(message)}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-gray-900">{message.sender}</span>
                                            <span className="text-xs text-gray-500">{message.timestamp}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <span className="text-sm">{getSentimentIcon(message.sentiment)}</span>
                                            <span className="text-xs text-gray-500">{getSentimentText(message.sentiment)}</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-900">{message.content}</p>
                                </div>

                                {/* AI 응답 (선택된 메시지인 경우) */}
                                {selectedMessage?.id === message.id && aiResponse && (
                                    <div className="space-y-3 ml-8">
                                        {/* 즉시 응답 */}
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                            <div className="text-sm text-yellow-800">
                                                불만이나 긴급한 문의는 즉시 대응이 필요합니다.
                                            </div>
                                            <div className="text-sm text-yellow-700 mt-1">
                                                권장 대기: {aiResponse.waitTime}분
                                            </div>
                                        </div>

                                        {/* AI 응답 */}
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm font-medium text-green-800">AI 응답</span>
                                                    <span className="text-sm text-green-700">신뢰도: {aiResponse.confidence}%</span>
                                                </div>
                                                <button className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                                                    <DocumentDuplicateIcon className="w-3 h-3" />
                                                    <span>복사</span>
                                                </button>
                                            </div>
                                            <p className="text-green-900">{aiResponse.content}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 오른쪽 사이드바 */}
                <div className="w-80 bg-white border-l border-gray-200 p-6 space-y-6">
                    {/* 참여자 선택 */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">참여자 선택</h3>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" aria-label="기간 선택">
                            <option>참여자를 선택하세요</option>
                            <option>우성7차</option>
                            <option>관리자</option>
                            <option>조합원</option>
                        </select>
                    </div>

                    {/* 성향 & 시공사 */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">성향 & 시공사</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">성향</label>
                                <select
                                    value={selectedTendency}
                                    onChange={(e) => setSelectedTendency(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option>중립</option>
                                    <option>긍정</option>
                                    <option>부정</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">시공사</label>
                                <select
                                    value={selectedContractor}
                                    onChange={(e) => setSelectedContractor(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option>강대우</option>
                                    <option>삼성물산</option>
                                    <option>현대건설</option>
                                </select>
                            </div>
                            <button className="w-full px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700">
                                선택 초기화
                            </button>
                        </div>
                    </div>

                    {/* 메시지 전략 */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">메시지 전략</h3>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">기본 메시지 전략</h4>
                                <div className="space-y-2">
                                    {[
                                        { value: 'logical_rebuttal', label: '논리적 반박', desc: '데이터와 근거를 바탕으로 논리적 대응' },
                                        { value: 'information_provision', label: '정보 제공', desc: '유용한 정보와 지식을 공유' },
                                        { value: 'emotion_avoidance', label: '감정 회피', desc: '감정적 대립을 피하고 중립적 접근' },
                                        { value: 'short_answer', label: '단답 강조', desc: '간결하고 명확한 메시지' }
                                    ].map((strategy) => (
                                        <label key={strategy.value} className="flex items-start space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="basicStrategy"
                                                value={strategy.value}
                                                className="mt-1"
                                            />
                                            <div>
                                                <div className="text-sm font-medium">{strategy.label}</div>
                                                <div className="text-xs text-gray-500">{strategy.desc}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">커뮤니케이션 방식</h4>
                                <div className="space-y-2">
                                    {[
                                        { value: 'majority_opinion', label: '다수 의견', desc: '다른 사람들의 의견이나 사례를 자연스럽게 언급' },
                                        { value: 'mutual_consideration', label: '상호 배려', desc: '먼저 도움이나 정보를 제공하며 관계 형성' },
                                        { value: 'experience_sharing', label: '경험 공유', desc: '개인 경험이나 지식을 자연스럽게 공유' },
                                        { value: 'consensus_seeking', label: '합의 추구', desc: '공통 관심사를 찾아 자연스러운 대화 유도' }
                                    ].map((method) => (
                                        <label key={method.value} className="flex items-start space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="communicationMethod"
                                                value={method.value}
                                                className="mt-1"
                                            />
                                            <div>
                                                <div className="text-sm font-medium">{method.label}</div>
                                                <div className="text-xs text-gray-500">{method.desc}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedConversationLayout; 