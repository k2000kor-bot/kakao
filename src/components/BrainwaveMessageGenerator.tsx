import React, { useState, useEffect, useCallback } from 'react';
import {
    ChatBubbleLeftRightIcon,
    UserIcon,
    ArrowPathIcon,
    StarIcon
} from '@heroicons/react/24/outline';

interface Message {
    id: string;
    content: string;
    sender: string;
    timestamp: string;
}

interface GeneratedMessage {
    content: string;
    confidence: number;
    timestamp: string;
    settings: {
        personality: string;
        construction: string;
        strategy: string;
        style: string;
        intent: string;
    };
}

const BrainwaveMessageGenerator: React.FC = () => {
    // 상태 관리
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
    const [messageIntent, setMessageIntent] = useState('');
    const [selectedPersonality, setSelectedPersonality] = useState('친조');
    const [selectedConstructionPreference, setSelectedConstructionPreference] = useState('강삼성');
    const [selectedStrategy, setSelectedStrategy] = useState('logical');
    const [selectedPoliticalStyle, setSelectedPoliticalStyle] = useState('neutral');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedMessages, setGeneratedMessages] = useState<GeneratedMessage[]>([]);
    const [selectedResponseIndex, setSelectedResponseIndex] = useState(0);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    // 데이터 로딩
    const loadChatData = useCallback(async () => {
        setIsLoadingMessages(true);
        try {
            console.log('📁 채팅 데이터 로딩 시작...');
            const response = await fetch('/sample_chat.txt');
            if (!response.ok) {
                throw new Error(`파일 로딩 실패: ${response.status}`);
            }

            const chatText = await response.text();
            console.log('📄 파일 읽기 완료, 크기:', chatText.length);

            // 간단한 메시지 파싱
            const messagePattern = /(\d{4}년 \d{1,2}월 \d{1,2}일) (오전|오후) (\d{1,2}:\d{2}), ([^:]+) : (.+)/g;
            const parsedMessages: Message[] = [];
            let match;
            let messageId = 1;

            while ((match = messagePattern.exec(chatText)) !== null) {
                const [, dateStr, ampm, timeStr, sender, content] = match;

                // 간단한 내용 정리
                if (content && content.trim() && content !== '삭제된 메시지입니다.') {
                    parsedMessages.push({
                        id: messageId.toString(),
                        content: content.trim(),
                        sender: sender.trim(),
                        timestamp: `${dateStr} ${ampm} ${timeStr}`
                    });
                    messageId++;
                }

                // 최대 100개 메시지만 로드
                if (parsedMessages.length >= 100) break;
            }

            console.log('✅ 메시지 파싱 완료:', parsedMessages.length, '개');
            setMessages(parsedMessages);

        } catch (error) {
            console.error('❌ 데이터 로딩 실패:', error);
            // 테스트용 샘플 데이터
            const sampleMessages: Message[] = [
                {
                    id: '1',
                    content: '조합원들의 의사가 중요한게 루체하임의 경우는 조합원들이 환급금을 받는걸 최우선 과제로 삼았기에 물산은 고객의 입맛에 맞춰줄 수 밖에 없었다고 알고 있습니다.',
                    sender: '0098',
                    timestamp: '2025년 6월 24일 오전 9:22'
                },
                {
                    id: '2',
                    content: '환급금 3억 받은걸로 알고 있습니다!',
                    sender: '0124우성',
                    timestamp: '2025년 6월 24일 오전 9:25'
                },
                {
                    id: '3',
                    content: '분담금 얘기가 나와서 그런데, 요즘 강남권이 평당 2,500만원 정도 하더라고요.',
                    sender: '0115',
                    timestamp: '2025년 6월 24일 오전 10:06'
                }
            ];
            setMessages(sampleMessages);
        } finally {
            setIsLoadingMessages(false);
        }
    }, []);

    // 대화 맥락 분석 함수
    const analyzeConversationContext = useCallback((targetMessageIndex: number) => {
        const contextRange = 3; // 앞뒤 3개 메시지 분석
        const startIdx = Math.max(0, targetMessageIndex - contextRange);
        const endIdx = Math.min(messages.length - 1, targetMessageIndex + contextRange);

        const contextMessages = messages.slice(startIdx, endIdx + 1);
        const targetMessage = messages[targetMessageIndex];

        // 키워드 분석
        const allText = contextMessages.map(m => m.content).join(' ');
        const keywords = {
            financial: ['분담금', '환급금', '비용', '돈', '억', '만원', '평당', '금액', '부담'],
            construction: ['삼성', '물산', '대우', '건설', '시공', '업체', '회사'],
            emotion: ['걱정', '우려', '기대', '만족', '불안', '좋다', '나쁘다', '힘들다'],
            process: ['회의', '결정', '논의', '투표', '의견', '생각', '제안', '안건'],
            urgency: ['빨리', '급해', '서둘러', '시급', '당장', '즉시', '곧바로']
        };

        const detectedTopics = Object.keys(keywords).filter(topic =>
            keywords[topic as keyof typeof keywords].some(keyword => allText.includes(keyword))
        );

        // 감정 톤 분석
        const positiveWords = ['좋다', '기대', '만족', '찬성', '동의', '괜찮', '훌륭'];
        const negativeWords = ['걱정', '우려', '반대', '문제', '힘들다', '어렵', '부담'];
        const neutralWords = ['생각', '의견', '제안', '검토', '논의', '확인'];

        let tone = 'neutral';
        if (positiveWords.some(word => allText.includes(word))) tone = 'positive';
        else if (negativeWords.some(word => allText.includes(word))) tone = 'negative';
        else if (neutralWords.some(word => allText.includes(word))) tone = 'neutral';

        // 대화 스타일 분석
        const isQuestionBased = targetMessage.content.includes('?') || targetMessage.content.includes('어떻게') || targetMessage.content.includes('궁금');
        const isInformative = targetMessage.content.includes('알고') || targetMessage.content.includes('들었') || targetMessage.content.includes('보니');
        const isOpinionBased = targetMessage.content.includes('생각') || targetMessage.content.includes('의견') || targetMessage.content.includes('입장');

        return {
            contextMessages,
            detectedTopics,
            tone,
            targetMessage,
            style: {
                isQuestionBased,
                isInformative,
                isOpinionBased
            },
            recentSender: contextMessages[contextMessages.length - 2]?.sender || '',
            conversationFlow: contextMessages.map(m => ({ sender: m.sender, topic: detectedTopics[0] || 'general' }))
        };
    }, [messages]);

    // 메시지 생성 함수
    const generateResponseMessage = useCallback(async () => {
        if (!selectedMessageId || !messageIntent.trim()) {
            alert('메시지를 선택하고 취지를 입력해주세요.');
            return;
        }

        const selectedMessage = messages.find(m => m.id === selectedMessageId);
        if (!selectedMessage) {
            alert('선택된 메시지를 찾을 수 없습니다.');
            return;
        }

        const messageIndex = messages.findIndex(m => m.id === selectedMessageId);
        const context = analyzeConversationContext(messageIndex);

        console.log('🎯 메시지 생성 시작 (맥락 분석 포함):', {
            selectedMessage: selectedMessage.content,
            intent: messageIntent,
            context: {
                tone: context.tone,
                topics: context.detectedTopics,
                style: context.style,
                conversationFlow: context.conversationFlow
            },
            personality: selectedPersonality,
            construction: selectedConstructionPreference
        });

        setIsLoading(true);

        try {
            // 맥락 기반 메시지 생성
            const generateContextualMessage = (style: 'empathy' | 'question' | 'opinion') => {
                const baseIntent = messageIntent;
                const mainTopics = context.detectedTopics;
                const conversationTone = context.tone;

                // 대화 흐름에 맞는 시작 문구
                const starters = {
                    empathy: {
                        positive: `${selectedMessage.sender}님 말씀에 정말 공감됩니다. `,
                        negative: `${selectedMessage.sender}님의 우려 충분히 이해됩니다. `,
                        neutral: `${selectedMessage.sender}님 의견 잘 들었습니다. `
                    },
                    question: {
                        positive: `좋은 의견이네요! 추가로 궁금한 점이 있는데, `,
                        negative: `말씀하신 우려사항에 대해 궁금한 점이 있어요. `,
                        neutral: `관련해서 궁금한 점이 있는데요, `
                    },
                    opinion: {
                        positive: `저도 비슷하게 생각하고 있었는데, `,
                        negative: `신중하게 접근해야 할 것 같은데, `,
                        neutral: `이 부분에 대해서는 `
                    }
                };

                // 주제별 구체적 내용
                const topicResponses = {
                    financial: {
                        친조: '경제적 부담이 있더라도 장기적으로는 더 나은 선택이 될 것 같습니다',
                        반조: '비용 부분은 신중하게 검토해봐야겠지만',
                        반대: '경제적 부담이 너무 클 것 같아 걱정됩니다'
                    },
                    construction: {
                        강삼성: '삼성물산이 경험과 실력 면에서 확실한 것 같습니다',
                        중삼성: '삼성물산도 좋지만 다른 옵션도 함께 검토해보면',
                        강대우: '대우건설의 장점도 충분히 고려해볼 만하다고 생각합니다'
                    }
                };

                // 성향별 마무리 문구
                const endings = {
                    친조: '적극적으로 참여해서 좋은 결과를 만들어봤으면 좋겠어요.',
                    반조: '조합원들과 충분히 논의해서 신중하게 결정했으면 합니다.',
                    반대: '다시 한번 검토해보는 것이 필요할 것 같아요.'
                };

                const starter = starters[style][conversationTone as 'positive' | 'negative' | 'neutral'];
                const mainContent = baseIntent;
                const topicContent = mainTopics.length > 0 ?
                    ((topicResponses as any)[mainTopics[0]]?.[selectedPersonality] ||
                        (topicResponses as any)[mainTopics[0]]?.[selectedConstructionPreference] || '') : '';
                const ending = (endings as any)[selectedPersonality];

                return `${starter}${mainContent}에 대해서는 ${topicContent ? topicContent + '. ' : ''}${ending}`;
            };

            const messageVariations = [
                generateContextualMessage('empathy'),
                generateContextualMessage('question'),
                generateContextualMessage('opinion')
            ];

            const newMessages: GeneratedMessage[] = messageVariations.map((content, index) => ({
                content,
                confidence: 75 + (index * 5),
                timestamp: new Date().toISOString(),
                settings: {
                    personality: selectedPersonality,
                    construction: selectedConstructionPreference,
                    strategy: selectedStrategy,
                    style: selectedPoliticalStyle,
                    intent: messageIntent
                }
            }));

            console.log('✅ 메시지 생성 완료:', newMessages.length, '개');
            setGeneratedMessages(newMessages);
            setSelectedResponseIndex(0);

        } catch (error) {
            console.error('❌ 메시지 생성 실패:', error);
            alert('메시지 생성 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, [selectedMessageId, messageIntent, selectedPersonality, selectedConstructionPreference, selectedStrategy, selectedPoliticalStyle, messages]);

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        loadChatData();
    }, [loadChatData]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 헤더 */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center space-x-3">
                        <StarIcon className="w-8 h-8 text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-900">AI 대화분석시스템</h1>
                        <span className="text-sm text-gray-500">메시지 생성 및 분석</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* 왼쪽: 메시지 목록 */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white rounded-lg shadow-sm border p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold flex items-center space-x-2">
                                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />
                                    <span>대화 내용</span>
                                </h2>
                                <div className="text-sm text-gray-500">
                                    {messages.length}개 메시지 • {selectedMessageId ? '선택됨' : '미선택'}
                                </div>
                            </div>

                            {isLoadingMessages ? (
                                <div className="text-center py-8">
                                    <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                                    <p className="text-gray-500 mt-2">메시지를 불러오는 중...</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {messages.map((message, index) => {
                                        const isSelected = selectedMessageId === message.id;
                                        const context = isSelected ? analyzeConversationContext(index) : null;

                                        return (
                                            <div
                                                key={message.id}
                                                onClick={() => setSelectedMessageId(message.id)}
                                                className={`p-3 rounded-lg border cursor-pointer transition-all ${isSelected
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-blue-600">
                                                        {message.sender}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {message.timestamp}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-800 leading-relaxed">
                                                    {message.content}
                                                </p>

                                                {/* 선택된 메시지의 맥락 정보 표시 */}
                                                {isSelected && context && (
                                                    <div className="mt-3 p-2 bg-white/70 rounded border-l-2 border-blue-400">
                                                        <div className="text-xs text-blue-700 font-medium mb-1">🎯 맥락 분석</div>
                                                        <div className="flex flex-wrap gap-1 text-xs">
                                                            <span className={`px-1.5 py-0.5 rounded text-white text-xs ${context.tone === 'positive' ? 'bg-green-500' :
                                                                context.tone === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                                                                }`}>
                                                                {context.tone === 'positive' ? '😊 긍정적' :
                                                                    context.tone === 'negative' ? '😟 우려' : '😐 중립'}
                                                            </span>
                                                            {context.detectedTopics.map(topic => (
                                                                <span key={topic} className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                                                                    {topic === 'financial' ? '💰 재정' :
                                                                        topic === 'construction' ? '🏗️ 시공' :
                                                                            topic === 'emotion' ? '💭 감정' :
                                                                                topic === 'process' ? '📋 절차' :
                                                                                    topic === 'urgency' ? '⚡ 긴급' : topic}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 생성된 메시지 결과 */}
                        {generatedMessages.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border p-4">
                                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                                    <StarIcon className="w-5 h-5 text-green-600" />
                                    <span>생성된 메시지</span>
                                    <span className="text-sm text-gray-500">({generatedMessages.length}개)</span>
                                </h3>

                                {/* 메시지 선택 탭 */}
                                <div className="flex space-x-2 mb-4">
                                    {generatedMessages.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedResponseIndex(index)}
                                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${selectedResponseIndex === index
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                        >
                                            옵션 {index + 1}
                                        </button>
                                    ))}
                                </div>

                                {/* 선택된 메시지 표시 */}
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-green-700">
                                            신뢰도: {generatedMessages[selectedResponseIndex]?.confidence}%
                                        </span>
                                        <span className="text-xs text-green-600">
                                            {generatedMessages[selectedResponseIndex]?.content.length}자
                                        </span>
                                    </div>
                                    <p className="text-green-800 leading-relaxed">
                                        {generatedMessages[selectedResponseIndex]?.content}
                                    </p>

                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(generatedMessages[selectedResponseIndex]?.content || '');
                                            alert('메시지가 복사되었습니다!');
                                        }}
                                        className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        복사하기
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 오른쪽: 설정 및 생성 */}
                    <div className="space-y-4">

                        {/* 메시지 취지 입력 */}
                        <div className="bg-white rounded-lg shadow-sm border p-4">
                            <h3 className="text-lg font-semibold mb-3">메시지 취지</h3>
                            <textarea
                                value={messageIntent}
                                onChange={(e) => setMessageIntent(e.target.value)}
                                placeholder="어떤 내용의 메시지를 생성하고 싶은지 입력해주세요..."
                                className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* 성향 설정 */}
                        <div className="bg-white rounded-lg shadow-sm border p-4">
                            <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                                <UserIcon className="w-5 h-5 text-purple-600" />
                                <span>성향</span>
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">조합 성향</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: '친조', label: '친조', desc: '적극적' },
                                            { id: '반조', label: '반조', desc: '신중함' },
                                            { id: '반대', label: '반대', desc: '우려 표명' }
                                        ].map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => setSelectedPersonality(option.id)}
                                                className={`p-2 text-sm rounded-lg transition-colors ${selectedPersonality === option.id
                                                    ? 'bg-purple-500 text-white'
                                                    : 'bg-gray-100 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">시공사 선호</label>
                                    <select
                                        value={selectedConstructionPreference}
                                        onChange={(e) => setSelectedConstructionPreference(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="강삼성">강삼성 (적극 선호)</option>
                                        <option value="중삼성">중삼성 (보통 선호)</option>
                                        <option value="약삼성">약삼성 (약간 선호)</option>
                                        <option value="강대우">강대우 (대우 적극 선호)</option>
                                        <option value="중대우">중대우 (대우 보통 선호)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 생성 버튼 */}
                        <div className="bg-white rounded-lg shadow-sm border p-4">
                            <button
                                onClick={generateResponseMessage}
                                disabled={!selectedMessageId || !messageIntent.trim() || isLoading}
                                className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${selectedMessageId && messageIntent.trim() && !isLoading
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                {isLoading ? (
                                    <>
                                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                        <span>생성 중...</span>
                                    </>
                                ) : (
                                    <>
                                        <StarIcon className="w-4 h-4" />
                                        <span>메시지 생성</span>
                                    </>
                                )}
                            </button>

                            {/* 상태 정보 */}
                            <div className="mt-3 text-xs text-gray-500 space-y-1">
                                <div>메시지 선택: {selectedMessageId ? '✅' : '❌'}</div>
                                <div>취지 입력: {messageIntent.trim() ? '✅' : '❌'} ({messageIntent.length}자)</div>
                                <div>선택된 성향: {selectedPersonality}</div>
                                <div>시공사 선호: {selectedConstructionPreference}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrainwaveMessageGenerator; 