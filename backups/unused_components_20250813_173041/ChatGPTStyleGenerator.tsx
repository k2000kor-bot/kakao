import React, { useState, useEffect, useRef } from 'react';
import {
    PaperAirplaneIcon,
    SparklesIcon,
    UserIcon,
    ComputerDesktopIcon,
    ChevronDownIcon,
    ClipboardDocumentIcon,
    CheckIcon,
    ChatBubbleLeftRightIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    format?: string;
    confidence?: number;
    variants?: string[];
}

interface ConversationRoom {
    id: string;
    name: string;
    messages: Array<{
        id: string;
        sender: string;
        content: string;
        timestamp: string;
    }>;
    preview: string;
}

interface MessageFormat {
    id: string;
    name: string;
    description: string;
    example: string;
}

const ChatGPTStyleGenerator: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: '안녕하세요! AI 메시지 생성 도우미입니다.\n\n어떤 메시지를 생성해드릴까요?\n\n• 대화 내용을 선택하거나\n• 직접 요청사항을 입력하세요',
            timestamp: new Date()
        }
    ]);

    const [inputValue, setInputValue] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState('auto');
    const [showFormatMenu, setShowFormatMenu] = useState(false);
    const [showConversationMenu, setShowConversationMenu] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState<ConversationRoom | null>(null);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // 샘플 대화방 데이터
    const conversationRooms: ConversationRoom[] = [
        {
            id: 'room1',
            name: '[인증]행복한소유☆개포우성7차 110',
            preview: '재건축 관련 문의사항들',
            messages: [
                {
                    id: 'msg1',
                    sender: '조합원A',
                    content: '안녕하세요! 재건축 관련해서 궁금한 점이 있어서 문의드립니다.',
                    timestamp: '06:00'
                },
                {
                    id: 'msg2',
                    sender: '조합장',
                    content: '네, 무엇이든 편하게 질문해 주세요. 최대한 상세히 안내드리겠습니다.',
                    timestamp: '06:05'
                },
                {
                    id: 'msg3',
                    sender: '조합원B',
                    content: '시공사 선정 기준이 어떻게 되나요? 그리고 언제쯤 결정되는지 궁금합니다.',
                    timestamp: '06:10'
                }
            ]
        },
        {
            id: 'room2',
            name: '개포우성7차 시공사 논의방',
            preview: '시공사 관련 논의',
            messages: [
                {
                    id: 'msg4',
                    sender: '건설회사A',
                    content: '저희 회사의 시공 제안서를 검토해 주셔서 감사합니다.',
                    timestamp: '10:00'
                },
                {
                    id: 'msg5',
                    sender: '조합이사',
                    content: '제안서 내용이 상당히 구체적이네요. 몇 가지 추가 질문이 있습니다.',
                    timestamp: '10:30'
                }
            ]
        }
    ];

    // 메시지 형식 옵션
    const messageFormats: MessageFormat[] = [
        {
            id: 'auto',
            name: '🤖 AI 자동',
            description: '상황에 맞는 최적의 형식으로 자동 생성',
            example: '지능형 분석을 통한 맞춤 응답'
        },
        {
            id: 'formal',
            name: '🏢 공식적',
            description: '정중하고 격식있는 공식적인 응답',
            example: '감사합니다. 해당 사안에 대해...'
        },
        {
            id: 'friendly',
            name: '😊 친근한',
            description: '따뜻하고 친근한 톤의 응답',
            example: '안녕하세요! 말씀하신 부분에 대해...'
        },
        {
            id: 'detailed',
            name: '📋 상세한',
            description: '구체적이고 자세한 설명',
            example: '단계별로 자세히 설명드리겠습니다...'
        },
        {
            id: 'professional',
            name: '🎯 전문적',
            description: '전문 지식을 바탕으로 한 분석적 응답',
            example: '전문적 관점에서 검토한 결과...'
        }
    ];

    // 스크롤을 맨 아래로
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 입력창 자동 리사이즈
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
        }
    }, [inputValue]);

    // 메시지 전송
    const handleSendMessage = async () => {
        if (!inputValue.trim() || isGenerating) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsGenerating(true);

        // AI 응답 시뮬레이션
        setTimeout(() => {
            const selectedFormatObj = messageFormats.find(f => f.id === selectedFormat);
            const variants = generateMessageVariants(inputValue, selectedFormat);

            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `**${selectedFormatObj?.name} 스타일로 3가지 버전을 생성했습니다:**\n\n`,
                timestamp: new Date(),
                format: selectedFormatObj?.name,
                variants: variants
            };

            setMessages(prev => [...prev, assistantMessage]);
            setIsGenerating(false);
        }, 1500);
    };

    // 메시지 생성 함수
    const generateMessageVariants = (input: string, formatId: string): string[] => {
        const templates: { [key: string]: string[] } = {
            auto: [
                `말씀하신 "${input}"에 대해 분석한 결과를 안내드립니다.\n\n구체적인 상황을 더 자세히 알려주시면 더욱 정확한 안내를 드릴 수 있습니다.`,
                `"${input}"에 관련하여 검토한 내용을 공유드립니다.\n\n추가로 궁금한 사항이 있으시면 언제든 말씀해 주세요.`,
                `해당 사항에 대해 다음과 같이 답변드립니다.\n\n관련 절차와 일정에 대해서는 순차적으로 안내드리겠습니다.`
            ],
            formal: [
                `안녕하세요.\n\n말씀해주신 "${input}"에 대해 정중히 답변드립니다.\n\n해당 사안은 관련 규정에 따라 체계적으로 진행하도록 하겠습니다.`,
                `감사합니다.\n\n문의해주신 내용에 대해 다음과 같이 안내드립니다.\n\n추가로 필요한 사항이 있으시면 공식 채널을 통해 문의해 주시기 바랍니다.`,
                `"${input}"에 대한 문의사항을 잘 접수하였습니다.\n\n관련 부서와 협의하여 정확한 정보를 제공해드리도록 하겠습니다.`
            ],
            friendly: [
                `안녕하세요! 😊\n\n"${input}"에 대해 궁금해하시는군요!\n\n이런 부분은 정말 중요하죠. 제가 아는 범위에서 최대한 도움이 되도록 설명드릴게요!`,
                `네네, 좋은 질문이에요! 👍\n\n말씀하신 부분은 많은 분들이 궁금해하시는 내용이에요. 차근차근 설명드릴테니까 편하게 들어주세요!`,
                `"${input}"에 대해 관심 가져주셔서 감사해요! 🙏\n\n더 궁금한 게 있으시면 편하게 말씀해 주세요!`
            ],
            detailed: [
                `"${input}"에 대해 단계별로 상세히 설명드리겠습니다.\n\n1. 현재 상황 분석\n2. 관련 절차 검토\n3. 향후 진행 방향\n4. 예상 일정\n\n각 단계별로 더 자세한 내용이 필요하시면 말씀해 주세요.`,
                `"${input}"에 관한 종합적인 정보를 제공드립니다.\n\n▶ 기본 개념 및 배경\n▶ 세부 실행 방안\n▶ 관련 규정 및 절차\n▶ 주의사항 및 참고자료`,
                `해당 사항에 대한 체계적인 안내를 드리겠습니다.\n\n[상세 분석]\n- 현황: 관련 데이터 및 통계\n- 절차: 단계별 진행 과정\n- 일정: 예상 소요 기간\n- 결과: 기대 효과 및 결과물`
            ],
            professional: [
                `전문적 관점에서 "${input}"에 대해 분석한 결과를 말씀드립니다.\n\n기술적 타당성, 경제성, 법적 적합성을 종합 검토한 결과, 체계적인 접근이 필요한 사안으로 판단됩니다.`,
                `"${input}"에 대한 전문가 의견을 공유드립니다.\n\n해당 사안은 다각도의 전문적 검토가 필요한 복합적 이슈로, 단계적 접근 방식을 권장합니다.`,
                `전문 분야 관점에서 "${input}"를 검토한 결과입니다.\n\n관련 법규, 기술 기준, 업계 표준을 종합하여 최적의 솔루션을 제안드립니다.`
            ]
        };

        return templates[formatId] || templates['auto'];
    };

    // 엔터키 처리
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // 텍스트 복사
    const copyToClipboard = async (text: string, messageId: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedMessageId(messageId);
            setTimeout(() => setCopiedMessageId(null), 2000);
        } catch (err) {
            console.error('복사 실패:', err);
        }
    };

    // 대화 내용 불러오기
    const loadConversation = (room: ConversationRoom) => {
        setSelectedConversation(room);
        setInputValue(`"${room.messages[room.messages.length - 1].content}"에 대한 응답을 작성해주세요.`);
        setShowConversationMenu(false);
    };

    return (
        <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                        <SparklesIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900">AI 메시지 생성기</h1>
                        <p className="text-xs text-gray-500">ChatGPT 스타일 인터페이스</p>
                    </div>
                </div>

                {/* 도구 메뉴 */}
                <div className="flex items-center space-x-2">
                    {/* 대화 불러오기 버튼 */}
                    <div className="relative">
                        <button
                            onClick={() => setShowConversationMenu(!showConversationMenu)}
                            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <ChatBubbleLeftRightIcon className="w-4 h-4" />
                            <span>대화 불러오기</span>
                            <ChevronDownIcon className="w-4 h-4" />
                        </button>

                        {showConversationMenu && (
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                                <div className="p-2">
                                    <div className="text-xs font-medium text-gray-500 mb-2 px-2">대화방 선택</div>
                                    {conversationRooms.map((room) => (
                                        <button
                                            key={room.id}
                                            onClick={() => loadConversation(room)}
                                            className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            <div className="font-medium text-sm text-gray-900 truncate">{room.name}</div>
                                            <div className="text-xs text-gray-500 mt-1">{room.preview}</div>
                                            <div className="text-xs text-gray-400 mt-1">{room.messages.length}개 메시지</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 형식 선택 버튼 */}
                    <div className="relative">
                        <button
                            onClick={() => setShowFormatMenu(!showFormatMenu)}
                            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <Cog6ToothIcon className="w-4 h-4" />
                            <span>{messageFormats.find(f => f.id === selectedFormat)?.name || '형식 선택'}</span>
                            <ChevronDownIcon className="w-4 h-4" />
                        </button>

                        {showFormatMenu && (
                            <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                                <div className="p-2">
                                    <div className="text-xs font-medium text-gray-500 mb-2 px-2">메시지 형식</div>
                                    {messageFormats.map((format) => (
                                        <button
                                            key={format.id}
                                            onClick={() => {
                                                setSelectedFormat(format.id);
                                                setShowFormatMenu(false);
                                            }}
                                            className={`w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors ${selectedFormat === format.id ? 'bg-blue-50 border border-blue-200' : ''
                                                }`}
                                        >
                                            <div className="font-medium text-sm text-gray-900">{format.name}</div>
                                            <div className="text-xs text-gray-600 mt-1">{format.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 메시지 영역 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex space-x-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            {/* 아바타 */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user'
                                    ? 'bg-blue-600'
                                    : 'bg-gradient-to-r from-purple-600 to-blue-600'
                                }`}>
                                {message.role === 'user' ? (
                                    <UserIcon className="w-5 h-5 text-white" />
                                ) : (
                                    <ComputerDesktopIcon className="w-5 h-5 text-white" />
                                )}
                            </div>

                            {/* 메시지 내용 */}
                            <div className="flex-1 space-y-2">
                                <div className={`p-4 rounded-2xl ${message.role === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-900'
                                    }`}>
                                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>

                                    {message.format && (
                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                {message.format}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* 생성된 버전들 */}
                                {message.variants && message.variants.length > 0 && (
                                    <div className="space-y-3">
                                        {message.variants.map((variant, index) => (
                                            <div key={index} className="relative group">
                                                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-xs font-medium text-purple-600">
                                                            버전 {index + 1}
                                                        </span>
                                                        <button
                                                            onClick={() => copyToClipboard(variant, `${message.id}_${index}`)}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                                                        >
                                                            {copiedMessageId === `${message.id}_${index}` ? (
                                                                <CheckIcon className="w-4 h-4 text-green-600" />
                                                            ) : (
                                                                <ClipboardDocumentIcon className="w-4 h-4 text-gray-600" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    <div className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                                                        {variant}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* 타임스탬프 */}
                                <div className="text-xs text-gray-500">
                                    {message.timestamp.toLocaleTimeString('ko-KR', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* 로딩 상태 */}
                {isGenerating && (
                    <div className="flex justify-start">
                        <div className="flex space-x-3 max-w-3xl">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                                <ComputerDesktopIcon className="w-5 h-5 text-white" />
                            </div>
                            <div className="bg-gray-100 rounded-2xl px-4 py-3">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">AI가 3가지 버전의 메시지를 생성하고 있습니다...</p>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* 입력 영역 - ChatGPT 스타일 */}
            <div className="p-4 border-t border-gray-200 bg-white">
                <div className="relative max-w-3xl mx-auto">
                    <div className="flex items-end space-x-3 bg-gray-50 rounded-2xl p-3">
                        <div className="flex-1">
                            <textarea
                                ref={inputRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
                                className="w-full bg-transparent resize-none outline-none text-sm leading-6 max-h-48"
                                rows={1}
                                disabled={isGenerating}
                            />
                        </div>
                        <button
                            onClick={handleSendMessage}
                            disabled={isGenerating || !inputValue.trim()}
                            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <PaperAirplaneIcon className="w-4 h-4" />
                        </button>
                    </div>

                    {/* 힌트 텍스트 */}
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                        <span>
                            {selectedConversation ? `${selectedConversation.name}에서 불러옴` : '새 대화'}
                        </span>
                        <span>
                            {messageFormats.find(f => f.id === selectedFormat)?.name}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatGPTStyleGenerator; 