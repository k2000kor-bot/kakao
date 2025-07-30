import React, { useState, useEffect, useRef } from 'react';
import {
    PaperAirplaneIcon,
    SparklesIcon,
    CheckCircleIcon,
    ClockIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';

interface ChatMessage {
    id: string;
    sender: string;
    content: string;
    timestamp: string;
    isMe: boolean;
    isAI?: boolean;
    messageFormat?: string;
    confidence?: number;
}

interface MessageFormat {
    id: string;
    name: string;
    description: string;
    example: string;
}

const KakaoStyleChat: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            sender: '조합원A',
            content: '안녕하세요! 재건축 관련해서 궁금한 점이 있어서 문의드립니다.',
            timestamp: '06:00',
            isMe: false
        },
        {
            id: '2',
            sender: '조합장',
            content: '네, 무엇이든 편하게 질문해 주세요. 최대한 상세히 안내드리겠습니다.',
            timestamp: '06:05',
            isMe: false
        },
        {
            id: '3',
            sender: '조합원B',
            content: '시공사 선정 기준이 어떻게 되나요? 그리고 언제쯤 결정되는지 궁금합니다.',
            timestamp: '06:10',
            isMe: false
        },
        {
            id: '4',
            sender: '설계사무소',
            content: '시공사 선정은 기술력, 시공경험, 재무상태 등을 종합적으로 평가하여 진행됩니다.',
            timestamp: '06:15',
            isMe: false
        },
        {
            id: '5',
            sender: '조합원C',
            content: '분담금은 어느 정도 예상되나요? 대략적인 범위라도 알고 싶습니다.',
            timestamp: '06:20',
            isMe: false
        }
    ]);

    const [inputMessage, setInputMessage] = useState('');
    const [selectedFormat, setSelectedFormat] = useState('ai-auto');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showFormatSelector, setShowFormatSelector] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const messageFormats: MessageFormat[] = [
        {
            id: 'ai-auto',
            name: 'AI 자동',
            description: '상황에 맞는 최적의 형식으로 자동 생성',
            example: '지능형 분석을 통한 맞춤 응답'
        },
        {
            id: 'formal',
            name: '공식적 응답',
            description: '정중하고 격식있는 응답',
            example: '감사합니다. 해당 사안에 대해...'
        },
        {
            id: 'friendly',
            name: '친근한 응답',
            description: '따뜻하고 친근한 톤의 응답',
            example: '안녕하세요! 말씀하신 부분에 대해...'
        },
        {
            id: 'detailed',
            name: '상세한 설명',
            description: '구체적이고 자세한 설명',
            example: '단계별로 자세히 설명드리면...'
        },
        {
            id: 'professional',
            name: '전문적 응답',
            description: '전문 지식을 바탕으로 한 응답',
            example: '전문적 관점에서 검토한 결과...'
        }
    ];

    // 메시지 생성 함수
    const generateMessage = async () => {
        if (!inputMessage.trim() || isGenerating) return;

        setIsGenerating(true);

        // 사용자 메시지 추가
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: '사용자',
            content: inputMessage,
            timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');

        // AI 응답 생성 시뮬레이션
        setTimeout(() => {
            const format = messageFormats.find(f => f.id === selectedFormat);
            const aiResponse: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'AI',
                content: generateAIResponse(inputMessage, selectedFormat),
                timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                isMe: false,
                isAI: true,
                messageFormat: format?.name,
                confidence: 95
            };

            setMessages(prev => [...prev, aiResponse]);
            setIsGenerating(false);
        }, 1500);
    };

    // AI 응답 생성 로직
    const generateAIResponse = (input: string, formatId: string): string => {
        const responses: { [key: string]: string[] } = {
            'ai-auto': [
                `"${input}"에 대해 분석한 결과, 다음과 같이 안내드립니다.\n\n안녕하세요! 말씀해주신 내용을 잘 이해했습니다. 구체적인 상황을 더 자세히 알려주시면 더욱 정확한 안내를 드릴 수 있습니다.`,
                `말씀하신 사항에 대해 다음과 같이 답변드립니다.\n\n해당 내용은 중요한 사안으로, 관련 규정과 절차를 철저히 검토하여 최선의 방향으로 진행하겠습니다.`
            ],
            'formal': [
                `안녕하세요.\n\n말씀해주신 "${input}"에 대해 정중히 답변드립니다.\n\n해당 사안은 신중한 검토가 필요한 사항으로, 관련 규정과 절차에 따라 체계적으로 진행하도록 하겠습니다. 추가로 궁금한 사항이 있으시면 언제든 문의해 주시기 바랍니다.`,
                `감사합니다.\n\n문의해주신 내용에 대해 다음과 같이 안내드립니다.\n\n관련 부서와 협의하여 정확한 정보를 제공해드리도록 하겠으며, 진행 상황에 대해서는 별도로 안내드리겠습니다.`
            ],
            'friendly': [
                `안녕하세요! 😊\n\n"${input}"에 대해 궁금해하시는군요!\n\n이런 부분은 정말 중요하죠. 제가 아는 범위에서 최대한 도움이 되도록 설명드릴게요. 혹시 이해가 안 되는 부분이 있으면 언제든 다시 물어보세요!`,
                `네네, 좋은 질문이에요! 👍\n\n말씀하신 부분은 많은 분들이 궁금해하시는 내용이에요. 차근차근 설명드릴테니까 편하게 들어주세요. 중간에 궁금한 게 생기면 바로 말씀해주세요!`
            ],
            'detailed': [
                `"${input}"에 대해 상세히 설명드리겠습니다.\n\n1. 조합설립: 원로 ✅\n2. 사업계획승인: 진행 중 ⏳\n3. 시공사 선정: 검토 단계\n4. 착공: 예정 (2024년 하반기)\n\n공정한 절차를 통해 더 많은 세부 현황을 주셔야 구체적으로 말씀드릴 수 있습니다.`,
                `단계별로 자세히 안내드리겠습니다.\n\n현재 진행 상황을 체계적으로 정리해보면 다음과 같습니다:\n\n• 1단계: 기본계획 수립 (완료)\n• 2단계: 관련 기관 협의 (진행중)\n• 3단계: 세부 실행계획 (예정)\n\n각 단계별 구체적인 일정과 내용에 대해서는 별도 자료로 상세히 안내드리겠습니다.`
            ],
            'professional': [
                `전문적 관점에서 검토한 결과 다음과 같이 답변드립니다.\n\n"${input}"에 관련하여, 해당 사안은 관련 법규와 규정을 종합적으로 검토하여 진행해야 할 사항입니다. 기술적 타당성, 경제성, 그리고 법적 적합성을 모두 고려한 최적의 방안을 제시하겠습니다.`,
                `전문가 의견을 바탕으로 말씀드리면,\n\n해당 사안은 다각도의 전문적 검토가 필요한 복합적 사안입니다. 기술적 측면, 재무적 측면, 법적 측면을 종합하여 체계적으로 접근하는 것이 바람직합니다. 구체적인 실행방안은 전문가 협의를 통해 결정하겠습니다.`
            ]
        };

        const formatResponses = responses[formatId] || responses['ai-auto'];
        return formatResponses[Math.floor(Math.random() * formatResponses.length)];
    };

    // 엔터키 처리
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            generateMessage();
        }
    };

    // 스크롤을 맨 아래로
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '80vh' }}>
            {/* 헤더 */}
            <div className="bg-purple-600 text-white p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">[인증]행복한소유☆개포우성7차 110</h1>
                        <p className="text-sm opacity-90">AI 메시지 생성을 시작해보세요</p>
                    </div>
                    <div className="bg-purple-500 px-3 py-1 rounded-full text-sm">
                        오후 05:08
                    </div>
                </div>
            </div>

            {/* 메시지 영역 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" style={{ height: 'calc(80vh - 200px)' }}>
                {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.isMe
                                ? 'bg-purple-600 text-white'
                                : message.isAI
                                    ? 'bg-green-100 text-gray-900 border border-green-200'
                                    : 'bg-white text-gray-900'
                            }`}>
                            {!message.isMe && (
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-xs font-medium text-gray-600">{message.sender}</span>
                                    {message.isAI && (
                                        <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                                            AI
                                        </span>
                                    )}
                                </div>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <div className="flex items-center justify-between mt-2">
                                <span className={`text-xs ${message.isMe ? 'text-purple-200' : 'text-gray-500'}`}>
                                    {message.timestamp}
                                </span>
                                {message.isAI && message.messageFormat && (
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                            {message.messageFormat}
                                        </span>
                                        {message.confidence && (
                                            <span className="text-xs text-green-600">
                                                신뢰도 {message.confidence}%
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {isGenerating && (
                    <div className="flex justify-start">
                        <div className="bg-gray-200 rounded-lg px-4 py-2 max-w-xs">
                            <div className="flex items-center space-x-2">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                                <span className="text-xs text-gray-600">AI가 응답을 생성하고 있습니다...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* 입력 영역 */}
            <div className="border-t border-gray-200 p-4 bg-white">
                {/* 메시지 형식 선택 */}
                <div className="mb-3">
                    <div className="relative">
                        <button
                            onClick={() => setShowFormatSelector(!showFormatSelector)}
                            className="flex items-center justify-between w-full p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-700">메시지 형식 선택</span>
                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                    {messageFormats.find(f => f.id === selectedFormat)?.name || 'AI 자동'}
                                </span>
                            </div>
                            <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${showFormatSelector ? 'rotate-180' : ''}`} />
                        </button>

                        {showFormatSelector && (
                            <div className="absolute bottom-full mb-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                {messageFormats.map((format) => (
                                    <button
                                        key={format.id}
                                        onClick={() => {
                                            setSelectedFormat(format.id);
                                            setShowFormatSelector(false);
                                        }}
                                        className={`w-full text-left p-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${selectedFormat === format.id ? 'bg-purple-50 border-l-4 border-purple-600' : ''
                                            }`}
                                    >
                                        <div className="font-medium text-sm text-gray-900">{format.name}</div>
                                        <div className="text-xs text-gray-600 mt-1">{format.description}</div>
                                        <div className="text-xs text-gray-500 mt-1 italic">"{format.example}"</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 메시지 입력 */}
                <div className="flex items-end space-x-3">
                    <div className="flex-1">
                        <textarea
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="어떤 메시지를 생성하고 싶으신가요? (예: 회의 일정 변경 안내, 프로젝트 진행 상황 공유)"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                            rows={3}
                            disabled={isGenerating}
                        />
                        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                            <span>💬 새 메시지 • {inputMessage.length}자 • {messageFormats.find(f => f.id === selectedFormat)?.name}</span>
                            <span>Shift+Enter: 줄바꿈 | Enter: 전송</span>
                        </div>
                    </div>
                    <button
                        onClick={generateMessage}
                        disabled={isGenerating || !inputMessage.trim()}
                        className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                    >
                        {isGenerating ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span className="text-sm">메시지 생성</span>
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5" />
                                <span className="text-sm">메시지 생성</span>
                            </>
                        )}
                    </button>
                </div>

                {/* 도움말 */}
                <div className="mt-2 text-center">
                    <p className="text-xs text-gray-500">
                        💡 팁: 'AI 자동' 선택 시 상황에 맞는 최적의 형식으로 생성됩니다
                    </p>
                </div>
            </div>
        </div>
    );
};

export default KakaoStyleChat; 