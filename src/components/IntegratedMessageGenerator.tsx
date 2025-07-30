import React, { useState, useEffect, useRef } from 'react';
import {
    ChatBubbleLeftRightIcon,
    SparklesIcon,
    CheckCircleIcon,
    XMarkIcon,
    ChevronDownIcon,
    UserIcon,
    ClockIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

interface ChatMessage {
    id: string;
    sender: string;
    content: string;
    timestamp: string;
    isMe: boolean;
}

interface ConversationRoom {
    id: string;
    name: string;
    messages: ChatMessage[];
    lastActivity: string;
}

interface MessageFormat {
    id: string;
    name: string;
    description: string;
    example: string;
    category: string;
}

interface GeneratedMessage {
    id: string;
    content: string;
    format: string;
    confidence: number;
    reasoning: string;
}

const IntegratedMessageGenerator: React.FC = () => {
    // 상태 관리
    const [conversationRooms, setConversationRooms] = useState<ConversationRoom[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<ConversationRoom | null>(null);
    const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
    const [selectedFormat, setSelectedFormat] = useState<string>('ai-auto');
    const [messagePurpose, setMessagePurpose] = useState<string>('');
    const [generatedMessages, setGeneratedMessages] = useState<GeneratedMessage[]>([]);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [showFormatSelector, setShowFormatSelector] = useState<boolean>(false);
    const [showRoomSelector, setShowRoomSelector] = useState<boolean>(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    // 샘플 대화방 데이터
    const sampleConversationRooms: ConversationRoom[] = [
        {
            id: 'room1',
            name: '[인증]행복한소유☆개포우성7차 110',
            lastActivity: '10분 전',
            messages: [
                {
                    id: 'msg1',
                    sender: '조합원A',
                    content: '안녕하세요! 재건축 관련해서 궁금한 점이 있어서 문의드립니다.',
                    timestamp: '06:00',
                    isMe: false
                },
                {
                    id: 'msg2',
                    sender: '조합장',
                    content: '네, 무엇이든 편하게 질문해 주세요. 최대한 상세히 안내드리겠습니다.',
                    timestamp: '06:05',
                    isMe: false
                },
                {
                    id: 'msg3',
                    sender: '조합원B',
                    content: '시공사 선정 기준이 어떻게 되나요? 그리고 언제쯤 결정되는지 궁금합니다.',
                    timestamp: '06:10',
                    isMe: false
                },
                {
                    id: 'msg4',
                    sender: '설계사무소',
                    content: '시공사 선정은 기술력, 시공경험, 재무상태 등을 종합적으로 평가하여 진행됩니다.',
                    timestamp: '06:15',
                    isMe: false
                },
                {
                    id: 'msg5',
                    sender: '조합원C',
                    content: '분담금은 어느 정도 예상되나요? 대략적인 범위라도 알고 싶습니다.',
                    timestamp: '06:20',
                    isMe: false
                }
            ]
        },
        {
            id: 'room2',
            name: '개포우성7차 시공사 논의방',
            lastActivity: '1시간 전',
            messages: [
                {
                    id: 'msg6',
                    sender: '건설회사A',
                    content: '저희 회사의 시공 제안서를 검토해 주셔서 감사합니다.',
                    timestamp: '10:00',
                    isMe: false
                },
                {
                    id: 'msg7',
                    sender: '조합이사',
                    content: '제안서 내용이 상당히 구체적이네요. 몇 가지 추가 질문이 있습니다.',
                    timestamp: '10:30',
                    isMe: false
                },
                {
                    id: 'msg8',
                    sender: '건설회사A',
                    content: '언제든지 궁금한 점 말씀해 주세요. 성실히 답변드리겠습니다.',
                    timestamp: '10:35',
                    isMe: false
                }
            ]
        },
        {
            id: 'room3',
            name: '개포우성7차 주민 전체방',
            lastActivity: '2시간 전',
            messages: [
                {
                    id: 'msg9',
                    sender: '주민A',
                    content: '재건축 일정에 대해 더 자세한 정보를 공유해 주실 수 있나요?',
                    timestamp: '09:00',
                    isMe: false
                },
                {
                    id: 'msg10',
                    sender: '관리사무소',
                    content: '다음 주 금요일에 설명회를 개최할 예정입니다. 자세한 안내는 별도 공지하겠습니다.',
                    timestamp: '09:15',
                    isMe: false
                }
            ]
        }
    ];

    // 메시지 형식 옵션
    const messageFormats: MessageFormat[] = [
        {
            id: 'ai-auto',
            name: 'AI 자동',
            description: '상황에 맞는 최적의 형식으로 자동 생성',
            example: '지능형 분석을 통한 맞춤 응답',
            category: 'auto'
        },
        {
            id: 'formal-response',
            name: '공식적 응답',
            description: '정중하고 격식있는 공식적인 응답',
            example: '감사합니다. 해당 사안에 대해 검토 후 안내드리겠습니다.',
            category: 'formal'
        },
        {
            id: 'friendly-response',
            name: '친근한 응답',
            description: '따뜻하고 친근한 톤의 응답',
            example: '안녕하세요! 말씀하신 부분에 대해 설명드릴게요.',
            category: 'casual'
        },
        {
            id: 'detailed-explanation',
            name: '상세한 설명',
            description: '구체적이고 자세한 설명',
            example: '단계별로 자세히 설명드리겠습니다...',
            category: 'informative'
        },
        {
            id: 'professional-analysis',
            name: '전문적 분석',
            description: '전문 지식을 바탕으로 한 분석적 응답',
            example: '전문적 관점에서 검토한 결과...',
            category: 'professional'
        },
        {
            id: 'empathetic-response',
            name: '공감적 응답',
            description: '상대방의 감정을 이해하고 공감하는 응답',
            example: '충분히 이해됩니다. 그런 상황에서는...',
            category: 'emotional'
        }
    ];

    // 컴포넌트 마운트 시 샘플 데이터 로드
    useEffect(() => {
        loadConversationRooms();
    }, []);

    // 채팅방 데이터 로드
    const loadConversationRooms = async () => {
        try {
            // 실제 API에서 채팅방 데이터 가져오기
            const response = await fetch('http://localhost:8004/api/v7/chat-rooms');
            if (response.ok) {
                const data = await response.json();
                if (data.chat_rooms && data.chat_rooms.length > 0) {
                    const rooms = await Promise.all(data.chat_rooms.map(async (room: any) => {
                        // 각 채팅방의 메시지 데이터 가져오기
                        try {
                            const messagesResponse = await fetch(`http://localhost:8004/api/v7/chat-messages/${encodeURIComponent(room.id)}`);
                            let messages = [];
                            if (messagesResponse.ok) {
                                const messagesData = await messagesResponse.json();
                                messages = messagesData.messages || [];
                            }

                            return {
                                id: room.id,
                                name: room.name,
                                lastActivity: room.lastActivity || '최근 활동 없음',
                                messages: messages.map((msg: any) => ({
                                    id: msg.id,
                                    sender: msg.sender,
                                    content: msg.content,
                                    timestamp: msg.timestamp,
                                    isMe: false
                                }))
                            };
                        } catch (error) {
                            console.error(`채팅방 ${room.id} 메시지 로드 실패:`, error);
                            return {
                                id: room.id,
                                name: room.name,
                                lastActivity: room.lastActivity || '최근 활동 없음',
                                messages: []
                            };
                        }
                    }));

                    setConversationRooms(rooms);
                    setSelectedRoom(rooms[0]);
                } else {
                    // API 데이터가 없으면 샘플 데이터 사용
                    setConversationRooms(sampleConversationRooms);
                    setSelectedRoom(sampleConversationRooms[0]);
                }
            } else {
                // API 호출 실패 시 샘플 데이터 사용
                setConversationRooms(sampleConversationRooms);
                setSelectedRoom(sampleConversationRooms[0]);
            }
        } catch (error) {
            console.error('채팅방 데이터 로드 실패:', error);
            // 오류 발생 시 샘플 데이터 사용
            setConversationRooms(sampleConversationRooms);
            setSelectedRoom(sampleConversationRooms[0]);
        }
    };

    // 메시지 생성 함수
    const generateMessages = async () => {
        if (!messagePurpose.trim()) {
            alert('메시지 취지를 입력해주세요.');
            return;
        }

        setIsGenerating(true);
        setGeneratedMessages([]);

        try {
            // 실제 API 호출
            const response = await fetch('http://localhost:8001/api/generate-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    target_message: { content: messagePurpose },
                    tone: selectedFormat === 'friendly-response' ? '친근한' : '일반',
                    message_format: selectedFormat,
                    intent: '일반',
                    chat_room_id: selectedRoom?.id || 'default-room',
                    strategy: selectedFormat === 'empathetic-response' ? '공감 전략' : '일반 전략'
                }),
            });

            if (response.ok) {
                const data = await response.json();
                const selectedFormatObj = messageFormats.find(f => f.id === selectedFormat);

                const generated: GeneratedMessage[] = data.generated_messages.map((msg: any, index: number) => ({
                    id: msg.id || `gen_${Date.now()}_${index}`,
                    content: msg.content,
                    format: selectedFormatObj?.name || 'AI 자동',
                    confidence: msg.confidence || 85,
                    reasoning: msg.reasoning || `${selectedFormatObj?.name} 스타일로 생성했습니다.`
                }));

                setGeneratedMessages(generated);
            } else {
                // API 호출 실패 시 시뮬레이션으로 대체
                console.warn('API 호출 실패, 시뮬레이션으로 대체');
                const selectedFormatObj = messageFormats.find(f => f.id === selectedFormat);
                const contextMessage = selectedMessage ? `"${selectedMessage.content}"에 대한 응답으로` : '';

                const templates = getMessageTemplates(selectedFormat);
                const generated: GeneratedMessage[] = templates.map((template, index) => ({
                    id: `gen_${Date.now()}_${index}`,
                    content: generateContentFromTemplate(template, messagePurpose, contextMessage),
                    format: selectedFormatObj?.name || 'AI 자동',
                    confidence: 85 + Math.random() * 12,
                    reasoning: `${selectedFormatObj?.name} 스타일로 생성했습니다. ${contextMessage ? '선택된 메시지의 맥락을 고려했습니다.' : ''}`
                }));

                setGeneratedMessages(generated);
            }
        } catch (error) {
            console.error('메시지 생성 오류:', error);
            // 오류 발생 시 시뮬레이션으로 대체
            const selectedFormatObj = messageFormats.find(f => f.id === selectedFormat);
            const contextMessage = selectedMessage ? `"${selectedMessage.content}"에 대한 응답으로` : '';

            const templates = getMessageTemplates(selectedFormat);
            const generated: GeneratedMessage[] = templates.map((template, index) => ({
                id: `gen_${Date.now()}_${index}`,
                content: generateContentFromTemplate(template, messagePurpose, contextMessage),
                format: selectedFormatObj?.name || 'AI 자동',
                confidence: 85 + Math.random() * 12,
                reasoning: `${selectedFormatObj?.name} 스타일로 생성했습니다. ${contextMessage ? '선택된 메시지의 맥락을 고려했습니다.' : ''}`
            }));

            setGeneratedMessages(generated);
        } finally {
            setIsGenerating(false);
        }
    };

    // 메시지 템플릿 가져오기
    const getMessageTemplates = (formatId: string): string[] => {
        const templates: { [key: string]: string[] } = {
            'ai-auto': [
                '말씀하신 "{purpose}"에 대해 분석한 결과, 다음과 같이 안내드립니다.\n\n{context}\n\n구체적인 상황을 더 자세히 알려주시면 더욱 정확한 안내를 드릴 수 있습니다.',
                '"{purpose}"에 관련하여 검토한 내용을 공유드립니다.\n\n{context}\n\n추가로 궁금한 사항이 있으시면 언제든 말씀해 주세요.',
                '말씀해주신 사항에 대해 다음과 같이 답변드립니다.\n\n{context}\n\n관련 절차와 일정에 대해서는 순차적으로 안내드리겠습니다.'
            ],
            'formal-response': [
                '안녕하세요.\n\n말씀해주신 "{purpose}"에 대해 정중히 답변드립니다.\n\n{context}\n\n해당 사안은 관련 규정에 따라 체계적으로 진행하도록 하겠습니다.',
                '감사합니다.\n\n문의해주신 "{purpose}"에 대해 다음과 같이 안내드립니다.\n\n{context}\n\n추가로 필요한 사항이 있으시면 공식 채널을 통해 문의해 주시기 바랍니다.',
                '"{purpose}"에 대한 문의사항을 잘 접수하였습니다.\n\n{context}\n\n관련 부서와 협의하여 정확한 정보를 제공해드리도록 하겠습니다.'
            ],
            'friendly-response': [
                '안녕하세요! 😊\n\n"{purpose}"에 대해 궁금해하시는군요!\n\n{context}\n\n이런 부분은 정말 중요하죠. 제가 아는 범위에서 최대한 도움이 되도록 설명드릴게요!',
                '네네, 좋은 질문이에요! 👍\n\n"{purpose}"에 대해서 말씀드리면,\n\n{context}\n\n혹시 이해가 안 되는 부분이 있으면 언제든 다시 물어보세요!',
                '"{purpose}"에 대해 관심 가져주셔서 감사해요! 🙏\n\n{context}\n\n더 궁금한 게 있으시면 편하게 말씀해 주세요!'
            ],
            'detailed-explanation': [
                '"{purpose}"에 대해 단계별로 상세히 설명드리겠습니다.\n\n{context}\n\n1. 현재 상황 분석\n2. 관련 절차 검토\n3. 향후 진행 방향\n4. 예상 일정\n\n각 단계별로 더 자세한 내용이 필요하시면 말씀해 주세요.',
                '"{purpose}"에 관한 종합적인 정보를 제공드립니다.\n\n{context}\n\n▶ 기본 개념 및 배경\n▶ 세부 실행 방안\n▶ 관련 규정 및 절차\n▶ 주의사항 및 참고자료\n\n구체적인 질문이 있으시면 항목별로 문의해 주세요.',
                '"{purpose}"에 대한 체계적인 안내를 드리겠습니다.\n\n{context}\n\n[상세 분석]\n- 현황: 관련 데이터 및 통계\n- 절차: 단계별 진행 과정\n- 일정: 예상 소요 기간\n- 결과: 기대 효과 및 결과물\n\n추가 설명이 필요한 부분은 언제든 문의해 주세요.'
            ],
            'professional-analysis': [
                '전문적 관점에서 "{purpose}"에 대해 분석한 결과를 말씀드립니다.\n\n{context}\n\n기술적 타당성, 경제성, 법적 적합성을 종합 검토한 결과, 체계적인 접근이 필요한 사안으로 판단됩니다.',
                '"{purpose}"에 대한 전문가 의견을 공유드립니다.\n\n{context}\n\n해당 사안은 다각도의 전문적 검토가 필요한 복합적 이슈로, 단계적 접근 방식을 권장합니다.',
                '전문 분야 관점에서 "{purpose}"를 검토한 결과입니다.\n\n{context}\n\n관련 법규, 기술 기준, 업계 표준을 종합하여 최적의 솔루션을 제안드립니다.'
            ],
            'empathetic-response': [
                '"{purpose}"에 대해 말씀해 주셔서 감사합니다. 충분히 이해됩니다.\n\n{context}\n\n이런 상황에서 걱정되고 궁금한 마음이 드는 것은 당연합니다. 최대한 도움이 되도록 안내드리겠습니다.',
                '"{purpose}"에 대한 고민을 나누어 주셔서 고맙습니다.\n\n{context}\n\n많은 분들이 비슷한 상황에서 같은 고민을 하고 계십니다. 함께 해결 방안을 찾아보도록 하겠습니다.',
                '"{purpose}"에 대해 관심과 우려를 표현해 주신 점 잘 이해합니다.\n\n{context}\n\n여러분의 입장에서 생각해보니 정말 중요한 사안이네요. 성심껏 도움을 드리겠습니다.'
            ]
        };

        return templates[formatId] || templates['ai-auto'];
    };

    // 템플릿에서 실제 메시지 생성
    const generateContentFromTemplate = (template: string, purpose: string, context: string): string => {
        return template
            .replace('{purpose}', purpose)
            .replace('{context}', context || '관련 내용을 검토하여 안내드립니다.');
    };

    // 메시지 선택 처리
    const handleMessageSelect = (message: ChatMessage) => {
        setSelectedMessage(message);
        setMessagePurpose(`"${message.content}"에 대한 응답을 작성해주세요.`);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* 헤더 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">통합 메시지 생성기</h1>
                <p className="text-gray-600">대화 내용을 선택하고 메시지 형태를 정한 후 취지를 입력하면 3개의 맞춤 메시지가 생성됩니다.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 왼쪽: 대화 선택 영역 */}
                <div className="space-y-4">
                    {/* 대화방 선택 */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">1. 대화방 선택</h2>
                        </div>
                        <div className="p-4">
                            <div className="relative">
                                <button
                                    onClick={() => setShowRoomSelector(!showRoomSelector)}
                                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-600" />
                                        <div className="text-left">
                                            <p className="font-medium text-gray-900">
                                                {selectedRoom?.name || '대화방을 선택해주세요'}
                                            </p>
                                            {selectedRoom && (
                                                <p className="text-sm text-gray-500">{selectedRoom.lastActivity}</p>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${showRoomSelector ? 'rotate-180' : ''}`} />
                                </button>

                                {showRoomSelector && (
                                    <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                        {conversationRooms.map((room) => (
                                            <button
                                                key={room.id}
                                                onClick={() => {
                                                    setSelectedRoom(room);
                                                    setShowRoomSelector(false);
                                                    setSelectedMessage(null);
                                                }}
                                                className={`w-full text-left p-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${selectedRoom?.id === room.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                                                    }`}
                                            >
                                                <div className="font-medium text-gray-900">{room.name}</div>
                                                <div className="text-sm text-gray-500">{room.lastActivity}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 대화 내용 */}
                    {selectedRoom && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">2. 대화 내용 선택</h2>
                            </div>
                            <div className="p-4 max-h-96 overflow-y-auto" ref={scrollRef}>
                                <div className="space-y-3">
                                    {selectedRoom.messages.map((message) => (
                                        <div
                                            key={message.id}
                                            onClick={() => handleMessageSelect(message)}
                                            className={`p-3 rounded-lg cursor-pointer transition-colors border ${selectedMessage?.id === message.id
                                                ? 'bg-blue-50 border-blue-200'
                                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-2 mb-2">
                                                <UserIcon className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm font-medium text-gray-700">{message.sender}</span>
                                                <ClockIcon className="w-4 h-4 text-gray-400" />
                                                <span className="text-xs text-gray-500">{message.timestamp}</span>
                                            </div>
                                            <p className="text-sm text-gray-900">{message.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 오른쪽: 메시지 생성 영역 */}
                <div className="space-y-4">
                    {/* 메시지 형태 선택 */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">3. 메시지 형태 선택</h2>
                        </div>
                        <div className="p-4">
                            <div className="relative">
                                <button
                                    onClick={() => setShowFormatSelector(!showFormatSelector)}
                                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-700">메시지 형식</span>
                                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                            {messageFormats.find(f => f.id === selectedFormat)?.name || 'AI 자동'}
                                        </span>
                                    </div>
                                    <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${showFormatSelector ? 'rotate-180' : ''}`} />
                                </button>

                                {showFormatSelector && (
                                    <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
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
                    </div>

                    {/* 메시지 취지 입력 */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">4. 메시지 취지 입력</h2>
                        </div>
                        <div className="p-4">
                            <textarea
                                value={messagePurpose}
                                onChange={(e) => setMessagePurpose(e.target.value)}
                                placeholder="어떤 메시지를 생성하고 싶으신가요? (예: 회의 일정 변경 안내, 프로젝트 진행 상황 공유)"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                rows={4}
                                disabled={isGenerating}
                            />
                            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                                <span>💬 {messagePurpose.length}자</span>
                                <span>{messageFormats.find(f => f.id === selectedFormat)?.name}</span>
                            </div>
                        </div>
                    </div>

                    {/* 생성 버튼 */}
                    <button
                        onClick={generateMessages}
                        disabled={isGenerating || !messagePurpose.trim()}
                        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        {isGenerating ? (
                            <div className="flex items-center justify-center space-x-2">
                                <ArrowPathIcon className="animate-spin h-5 w-5 text-white" />
                                <span>메시지 생성 중...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center space-x-2">
                                <SparklesIcon className="w-5 h-5" />
                                <span>3개 메시지 생성</span>
                            </div>
                        )}
                    </button>
                </div>
            </div>

            {/* 생성 결과 */}
            {generatedMessages.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">5. 생성된 메시지 (3개)</h2>
                    </div>
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {generatedMessages.map((message, index) => (
                                <div
                                    key={message.id}
                                    className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-medium text-purple-700">
                                            버전 {index + 1}
                                        </span>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                                {message.format}
                                            </span>
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                신뢰도 {Math.round(message.confidence)}%
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-3 mb-3">
                                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{message.content}</p>
                                    </div>

                                    <div className="text-xs text-purple-600">
                                        💡 {message.reasoning}
                                    </div>

                                    <button className="w-full mt-3 py-2 px-3 bg-white border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium">
                                        복사하기
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 로딩 상태 */}
            {isGenerating && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <div className="text-center">
                        <ArrowPathIcon className="animate-spin h-8 w-8 text-purple-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">AI가 메시지를 생성하고 있습니다</h3>
                        <p className="text-gray-600">선택하신 형식과 취지에 맞는 3개의 메시지를 준비 중입니다...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntegratedMessageGenerator; 