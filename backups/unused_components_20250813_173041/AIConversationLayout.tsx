import React, { useState } from 'react';
import {
  StarIcon,
    ChatBubbleLeftRightIcon,
    CalendarIcon,
    ChartBarIcon,
    MagnifyingGlassIcon,
    UserIcon,
    BuildingOfficeIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface Message {
    id: string;
    timestamp: string;
    sender: string;
    content: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    isSelected?: boolean;
}

interface AIConversationLayoutProps {
    children?: React.ReactNode;
}

const AIConversationLayout: React.FC<AIConversationLayoutProps> = ({ children }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('전체');
    const [selectedParticipant, setSelectedParticipant] = useState('');
    const [tendency, setTendency] = useState('중립');
    const [constructor, setConstructor] = useState('강대우');
    const [messageStrategy, setMessageStrategy] = useState('논리적 반박');
    const [communicationMethod, setCommunicationMethod] = useState('다수 의견');

    // 샘플 메시지 데이터
    const messages: Message[] = [
        {
            id: '0098',
            timestamp: '2025년 6월 24일 오전 9:22',
            sender: '참여자1',
            content: '환급금 3억 받은걸로 알고 있습니다! 2',
            sentiment: 'neutral',
            isSelected: true
        },
        {
            id: '0099',
            timestamp: '2025년 6월 24일 오전 9:23',
            sender: '참여자2',
            content: '개인당 2',
            sentiment: 'neutral'
        },
        {
            id: '0100',
            timestamp: '2025년 6월 24일 오전 9:24',
            sender: '참여자3',
            content: '저도 동감합니다! 2',
            sentiment: 'positive'
        }
    ];

    return (
        <div className="h-screen bg-gray-50">
            {/* 상단 헤더 */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                            <StarIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">AI 대화분석시스템</h1>
                            <p className="text-sm text-gray-600">맥락 기반 메시지 자동 생성 및 분석</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                            <span className="text-sm text-gray-600">연결 대기 중</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-blue-600">전체 기간</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 메인 컨텐츠 영역 */}
            <div className="flex h-[calc(100vh-80px)]">
                {/* 좌측 사이드바 */}
                <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
                    {/* 채팅방 섹션 */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-2 mb-4">
                            <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-500" />
                            <h3 className="font-semibold text-gray-900">채팅방</h3>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                            <div className="font-medium text-blue-900">[인증]행복한소유☆개포우성7차</div>
                            <div className="text-sm text-blue-700 mt-1">전체: 4106개 메시지 • 활성 상태</div>
                        </div>
                    </div>

                    {/* 분석 기간 섹션 */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-2 mb-4">
                            <CalendarIcon className="w-5 h-5 text-blue-500" />
                            <h3 className="font-semibold text-gray-900">분석 기간</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {['전체', '오늘', '이번 주', '이번 달'].map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setSelectedPeriod(period)}
                                    className={`px-3 py-2 text-sm rounded-lg border ${selectedPeriod === period
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>

                        {/* 사용자 지정 기간 */}
                        <div className="space-y-3 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">시작 날짜</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value="2020. 01. 01. 오전 12:00"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        readOnly
                                    />
                                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">종료 날짜</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value="2026. 12. 31. 오후 11:59"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        readOnly
                                    />
                                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                            <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
                                기간 적용
                            </button>
                        </div>

                        <div className="text-sm text-gray-600">
                            <div>선택된 기간: {selectedPeriod}</div>
                            <div>4106개 메시지 • 70명 참여</div>
                        </div>
                    </div>

                    {/* AI 생성 통계 섹션 */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-2 mb-4">
                            <ChartBarIcon className="w-5 h-5 text-green-500" />
                            <h3 className="font-semibold text-gray-900">AI 생성 통계</h3>
                        </div>
                        <div className="space-y-3 mb-4">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">총 생성수</span>
                                <span className="text-sm font-medium">1개</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">평균 신뢰도</span>
                                <span className="text-sm font-medium">60%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">피드백 수</span>
                                <span className="text-sm font-medium">0개</span>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">인기 설정</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">성향</span>
                                    <span className="font-medium">{tendency}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">시공사</span>
                                    <span className="font-medium">{constructor}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">전략</span>
                                    <span className="font-medium">concern_sharing</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">
                                히스토리 내보내기
                            </button>
                            <button className="w-full px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">
                                히스토리 초기화
                            </button>
                        </div>
                    </div>
                </div>

                {/* 중앙 컨텐츠 영역 */}
                <div className="flex-1 bg-white">
                    <div className="p-6">
                        {/* 대화 내용 헤더 */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-2">
                                <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-500" />
                                <h2 className="text-lg font-semibold text-gray-900">대화 내용</h2>
                            </div>
                            <div className="text-sm text-gray-600">전체 기간 메시지</div>
                        </div>

                        {/* 검색바 */}
                        <div className="mb-6">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="메시지 검색... (키워드, 발신자, 내용)"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* 메시지 카운터 */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-sm text-gray-600">60 / 4106개 표시</div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span>↑ 60개씩</span>
                                <span>|</span>
                                <span>↓ 60개씩</span>
                            </div>
                        </div>

                        {/* 메시지 목록 */}
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`border rounded-lg p-4 ${message.isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-sm font-medium text-gray-900">{message.id}</span>
                                            <span className="text-sm text-gray-600">{message.timestamp}</span>
                                            <div className="flex items-center space-x-1">
                                                <span className="text-sm text-gray-600">{message.sentiment}</span>
                                                <span className="text-yellow-500">😊</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-gray-900 mb-3">
                                        {message.content}
                                    </div>

                                    {message.isSelected && (
                                        <div className="space-y-3">
                                            {/* 즉시 응답 섹션 */}
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm text-yellow-800">
                                                        불만이나 긴급한 문의는 즉시 대응이 필요합니다.
                                                    </div>
                                                    <div className="text-sm text-yellow-700">
                                                        권장 대기: 0분
                                                    </div>
                                                </div>
                                            </div>

                                            {/* AI 응답 섹션 */}
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-green-800">AI 응답</span>
                                                    <span className="text-sm text-green-700">신뢰도: 60%</span>
                                                </div>
                                                <div className="text-sm text-green-900 mb-2">
                                                    메시지를 생성할 수 없습니다. 다시 시도해주세요.
                                                </div>
                                                <button className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600">
                                                    복사
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 우측 사이드바 */}
                <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
                    {/* 참여자 선택 섹션 */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-2 mb-4">
                            <UserIcon className="w-5 h-5 text-blue-500" />
                            <h3 className="font-semibold text-gray-900">참여자 선택</h3>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">메시지 대상</label>
                            <select
                                value={selectedParticipant}
                                onChange={(e) => setSelectedParticipant(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                                <option value="">참여자를 선택하세요</option>
                                <option value="user1">참여자1</option>
                                <option value="user2">참여자2</option>
                                <option value="user3">참여자3</option>
                            </select>
                        </div>
                    </div>

                    {/* 성향 & 시공사 섹션 */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-2 mb-4">
                            <UserIcon className="w-5 h-5 text-purple-500" />
                            <h3 className="font-semibold text-gray-900">성향 & 시공사</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">성향</label>
                                <div className="flex items-center space-x-2">
                                    <select
                                        value={tendency}
                                        onChange={(e) => setTendency(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    >
                                        <option value="중립">중립</option>
                                        <option value="긍정">긍정</option>
                                        <option value="부정">부정</option>
                                    </select>
                                    <StarIcon className="w-4 h-4 text-purple-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">시공사</label>
                                <div className="flex items-center space-x-2">
                                    <select
                                        value={constructor}
                                        onChange={(e) => setConstructor(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    >
                                        <option value="강대우">강대우</option>
                                        <option value="다른시공사">다른시공사</option>
                                    </select>
                                    <BuildingOfficeIcon className="w-4 h-4 text-yellow-500" />
                                </div>
                            </div>
                            <button className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600">
                                선택 초기화
                            </button>
                        </div>
                    </div>

                    {/* 메시지 전략 섹션 */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-2 mb-4">
                            <Cog6ToothIcon className="w-5 h-5 text-green-500" />
                            <h3 className="font-semibold text-gray-900">메시지 전략</h3>
                        </div>

                        {/* 기본 메시지 전략 */}
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">기본 메시지 전략</h4>
                            <div className="space-y-2">
                                {[
                                    { value: '논리적 반박', desc: '논리적 근거로 반박' },
                                    { value: '정보 제공', desc: '관련 정보 제공' },
                                    { value: '감정 회피', desc: '감정적 요소 회피' },
                                    { value: '단답 강조', desc: '간결한 답변 강조' }
                                ].map((strategy) => (
                                    <label key={strategy.value} className="flex items-start space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="messageStrategy"
                                            value={strategy.value}
                                            checked={messageStrategy === strategy.value}
                                            onChange={(e) => setMessageStrategy(e.target.value)}
                                            className="mt-1"
                                        />
                                        <div>
                                            <div className="text-sm font-medium">{strategy.value}</div>
                                            <div className="text-xs text-gray-600">{strategy.desc}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 커뮤니케이션 방식 */}
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">커뮤니케이션 방식</h4>
                            <div className="space-y-2">
                                {[
                                    { value: '다수 의견', desc: '다수 의견 반영' },
                                    { value: '상호 배려', desc: '상호 배려 강조' },
                                    { value: '경험 공유', desc: '경험 공유 방식' },
                                    { value: '합의 추구', desc: '합의점 모색' }
                                ].map((method) => (
                                    <label key={method.value} className="flex items-start space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="communicationMethod"
                                            value={method.value}
                                            checked={communicationMethod === method.value}
                                            onChange={(e) => setCommunicationMethod(e.target.value)}
                                            className="mt-1"
                                        />
                                        <div>
                                            <div className="text-sm font-medium">{method.value}</div>
                                            <div className="text-xs text-gray-600">{method.desc}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 고도화된 인사 선드 기버 */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                                <span className="text-yellow-500">⭐</span>
                                <span className="text-sm font-medium text-yellow-800">고도화된 인사 선드 기버 NEW</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIConversationLayout; 