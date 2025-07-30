import React, { useState, useEffect } from 'react';
import {
    PaperAirplaneIcon,
    SparklesIcon,
    CheckCircleIcon,
    XMarkIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';
import { utils } from '../services/dialogueAPI';

const AdvancedDialogueInterface: React.FC = () => {
    // 인터페이스 정의
    interface ConversationMessage {
        id: string;
        type: 'user' | 'assistant';
        sender: string;
        content: string;
        timestamp: string;
        messageFormat?: string;
        effectiveness?: number;
        isRewrite?: boolean;
        confidence?: number;
        reasoning?: string;
        isGenerated?: boolean;
    }

    interface MessageFormat {
        id: string;
        name: string;
        description: string;
        category: string;
        example: string;
        tone: string;
    }

    interface ChatRoomMessage {
        id: string;
        sender: string;
        content: string;
        timestamp: string;
        isMe: boolean;
        type: 'text' | 'image' | 'file';
    }

    interface SelectedChatRoom {
        id: string;
        name: string;
        messages: ChatRoomMessage[];
    }

    // 초기 대화 히스토리 (먼저 정의)
    const initialConversationHistory: ConversationMessage[] = [
        {
            id: 'demo1',
            type: 'user',
            sender: '사용자',
            content: '재건축 진행 상황에 대해 안내해주세요.',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            messageFormat: '질문'
        },
        {
            id: 'demo2',
            type: 'assistant',
            sender: 'AI',
            content: '안녕하세요! 현재 재건축 진행 상황을 말씀드리겠습니다.\n\n1. 조합설립: 완료 ✅\n2. 사업계획승인: 진행 중 🔄\n3. 시공사 선정: 검토 단계\n4. 착공: 예정 (2024년 하반기)\n\n궁금한 점이 더 있으시면 언제든 말씀해 주세요!',
            timestamp: new Date(Date.now() - 3500000).toISOString(),
            messageFormat: '친절한 안내',
            confidence: 95,
            reasoning: '재건축 프로세스에 대한 체계적이고 이해하기 쉬운 안내를 제공했습니다.'
        }
    ];

    // 채팅방 데이터 (다음에 정의)
    const chatRooms: SelectedChatRoom[] = [
        {
            id: 'room1',
            name: '[인증]행복한소유☆개포우성7차 110',
            messages: [
                {
                    id: 'msg1',
                    sender: '조합원A',
                    content: '안녕하세요! 재건축 관련해서 궁금한 점이 있어서 문의드립니다.',
                    timestamp: '2024-01-15T09:00:00Z',
                    isMe: false,
                    type: 'text'
                },
                {
                    id: 'msg2',
                    sender: '조합장',
                    content: '네, 무엇이든 편하게 질문해 주세요. 최대한 상세히 안내드리겠습니다.',
                    timestamp: '2024-01-15T09:05:00Z',
                    isMe: false,
                    type: 'text'
                },
                {
                    id: 'msg3',
                    sender: '조합원B',
                    content: '시공사 선정 기준이 어떻게 되나요? 그리고 언제쯤 결정되는지 궁금합니다.',
                    timestamp: '2024-01-15T09:10:00Z',
                    isMe: false,
                    type: 'text'
                },
                {
                    id: 'msg4',
                    sender: '설계사무소',
                    content: '시공사 선정은 기술력, 시공경험, 재무상태 등을 종합적으로 평가하여 진행됩니다.',
                    timestamp: '2024-01-15T09:15:00Z',
                    isMe: false,
                    type: 'text'
                },
                {
                    id: 'msg5',
                    sender: '조합원C',
                    content: '분담금은 어느 정도 예상되나요? 대략적인 범위라도 알고 싶습니다.',
                    timestamp: '2024-01-15T09:20:00Z',
                    isMe: false,
                    type: 'text'
                }
            ]
        },
        {
            id: 'room2',
            name: '개포우성7차 시공사 논의방',
            messages: [
                {
                    id: 'msg6',
                    sender: '건설회사A',
                    content: '저희 회사의 시공 제안서를 검토해 주셔서 감사합니다.',
                    timestamp: '2024-01-16T10:00:00Z',
                    isMe: false,
                    type: 'text'
                },
                {
                    id: 'msg7',
                    sender: '조합이사',
                    content: '제안서 내용이 상당히 구체적이네요. 몇 가지 추가 질문이 있습니다.',
                    timestamp: '2024-01-16T10:30:00Z',
                    isMe: false,
                    type: 'text'
                }
            ]
        }
    ];

    // 상태 관리 (이제 안전하게 사용 가능)
    const [inputMessage, setInputMessage] = useState<string>('');
    const [selectedMessageFormats, setSelectedMessageFormats] = useState<string[]>(['auto']);
    const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>(initialConversationHistory);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    // 새로운 상태들 (초기값을 null로 설정)
    const [selectedChatRoom, setSelectedChatRoom] = useState<SelectedChatRoom | null>(null);
    const [selectedChatMessage, setSelectedChatMessage] = useState<ChatRoomMessage | null>(null);
    const [showChatRoomSelector, setShowChatRoomSelector] = useState<boolean>(false);

    // useEffect로 초기값 설정
    useEffect(() => {
        if (chatRooms.length > 0) {
            setSelectedChatRoom(chatRooms[0]);
        }
    }, []);

    // 초기 대화방 설정
    React.useEffect(() => {
        if (chatRooms.length > 0 && !selectedChatRoom) {
            setSelectedChatRoom(chatRooms[0]);
        }
    }, [chatRooms, selectedChatRoom]);

    // 채팅 메시지 선택 핸들러
    const handleChatMessageSelect = (message: ChatRoomMessage) => {
        setSelectedChatMessage(message);
        setInputMessage(`"${message.content}"에 대한 응답을 생성해주세요.`);
    };

    // 메시지 시간 포맷팅
    const formatMessageTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // 22가지 메시지 형식 정의
    const messageFormats: MessageFormat[] = [
        {
            id: 'auto',
            name: '🤖 AI 자동 선택',
            description: '상황에 맞는 최적의 메시지 형식을 AI가 선택',
            category: 'auto',
            example: '가장 적절한 방식으로 응답합니다.',
            tone: 'adaptive'
        },
        {
            id: 'refutation',
            name: '반박 형식',
            description: '상대 주장의 오류나 약점을 지적하며 부정하는 형식',
            category: 'opposition',
            example: '그 주장에는 다음과 같은 문제점이 있습니다...',
            tone: 'critical'
        },
        {
            id: 'counter_question',
            name: '반문 형식',
            description: '상대의 주장에 질문을 던져 되묻는 형식',
            category: 'inquiry',
            example: '정말 그렇게 생각하시나요? 혹시 다른 가능성은 고려해보셨나요?',
            tone: 'questioning'
        },
        {
            id: 'opposition',
            name: '반대 형식',
            description: '명확하게 의견을 거부하거나 부정하는 형식',
            category: 'opposition',
            example: '그 의견에는 동의할 수 없습니다. 이유는 다음과 같습니다.',
            tone: 'firm'
        },
        {
            id: 'agreement',
            name: '동조 형식',
            description: '상대 의견에 동의하거나 지지하는 형식',
            category: 'support',
            example: '완전히 동의합니다. 매우 합리적인 접근이라고 생각합니다.',
            tone: 'supportive'
        },
        {
            id: 'defense',
            name: '응호 형식',
            description: '특정 입장이나 대상을 적극적으로 옹호하는 형식',
            category: 'support',
            example: '그 결정을 전적으로 지지합니다. 충분한 근거가 있습니다.',
            tone: 'defensive'
        },
        {
            id: 'criticism',
            name: '비난 형식',
            description: '강하게 부정적 평가나 공격하는 형식',
            category: 'attack',
            example: '그건 완전히 잘못된 판단입니다. 용납할 수 없습니다.',
            tone: 'harsh'
        },
        {
            id: 'neutral',
            name: '중립 형식',
            description: '감정이나 입장 없이 상황만 객관적으로 설명하는 형식',
            category: 'objective',
            example: '사실만 말씀드리면 현재 상황은 다음과 같습니다.',
            tone: 'factual'
        },
        {
            id: 'avoidance',
            name: '회피 형식',
            description: '명확한 입장을 회피하거나 대화를 흐리는 형식',
            category: 'evasive',
            example: '그건 좀 복잡한 문제네요... 여러 관점에서 봐야 할 것 같습니다.',
            tone: 'vague'
        },
        {
            id: 'sarcasm',
            name: '풍자 형식',
            description: '비꼬거나 간접적으로 비판하는 형식',
            category: 'indirect',
            example: '정말 "훌륭한" 계획이네요. 분명히 잘 될 거예요.',
            tone: 'sarcastic'
        },
        {
            id: 'empathy',
            name: '공감 형식',
            description: '상대 감정을 이해하고 수용하는 형식',
            category: 'emotional',
            example: '그런 마음 충분히 이해합니다. 힘든 상황이셨군요.',
            tone: 'caring'
        },
        {
            id: 'suggestion',
            name: '제안 형식',
            description: '해결책이나 대안을 제시하는 형식',
            category: 'solution',
            example: '이런 방법은 어떨까요? 다음과 같은 해결책을 제안합니다.',
            tone: 'constructive'
        },
        {
            id: 'questioning',
            name: '질문 형식',
            description: '정보를 얻거나 의문을 던지는 형식',
            category: 'inquiry',
            example: '구체적으로 어떤 부분이 문제인가요? 더 자세히 설명해 주실 수 있나요?',
            tone: 'inquisitive'
        },
        {
            id: 'ignoring',
            name: '무시 형식',
            description: '반응하지 않거나 대화를 거부하는 형식',
            category: 'dismissive',
            example: '그런 말씀은... 특별히 들은 적이 없는 것 같네요. 다른 얘기 하죠.',
            tone: 'dismissive'
        },
        {
            id: 'emphasis',
            name: '강조 형식',
            description: '특정 사실이나 의견을 부각시키는 형식',
            category: 'assertive',
            example: '이것만은 확실히 말씀드릴 수 있습니다. 매우 중요한 사안입니다.',
            tone: 'emphatic'
        },
        {
            id: 'speculation',
            name: '추측 형식',
            description: '확실하지 않은 의견을 조심스럽게 제시하는 형식',
            category: 'tentative',
            example: '아마도 이런 이유가 아닐까 싶습니다... 확실하지는 않지만요.',
            tone: 'tentative'
        },
        {
            id: 'emotional_appeal',
            name: '감정적 호소 형식',
            description: '논리보다 감정에 기반해 설득하는 형식',
            category: 'emotional',
            example: '정말 간절히 부탁드립니다. 제발 한 번만 고려해 주세요.',
            tone: 'pleading'
        },
        {
            id: 'mockery',
            name: '조롱 형식',
            description: '상대를 비웃거나 깎아내리는 형식',
            category: 'attack',
            example: '정말 어이없는 말씀이네요. 그게 말이 됩니까?',
            tone: 'mocking'
        },
        {
            id: 'directive',
            name: '명령 형식',
            description: '지시하거나 강제하는 어투의 형식',
            category: 'command',
            example: '즉시 그렇게 하십시오. 다른 선택은 없습니다.',
            tone: 'commanding'
        },
        {
            id: 'coercion',
            name: '강압 형식',
            description: '위협, 압박을 통해 상대를 설득하는 형식',
            category: 'pressure',
            example: '다른 선택은 없을 것입니다. 결과는 책임질 수 없어요.',
            tone: 'threatening'
        },
        {
            id: 'forcefulness',
            name: '강제 형식',
            description: '선택권을 주지 않고 특정 행동을 요구하는 형식',
            category: 'pressure',
            example: '반드시 이렇게 해야 합니다. 예외는 없습니다.',
            tone: 'forceful'
        },
        {
            id: 'brainwashing',
            name: '세뇌 형식',
            description: '장기간 반복·왜곡으로 판단력을 마비시키는 형식',
            category: 'manipulation',
            example: '이것만이 유일한 진실입니다. 계속 생각해보세요. 다른 모든 것은 거짓입니다.',
            tone: 'manipulative'
        },
        {
            id: 'gaslighting',
            name: '가스라이팅 형식',
            description: '상대의 현실 인식을 부정하거나 조작해 혼란을 유도하는 형식',
            category: 'manipulation',
            example: '그런 일은 없었어요. 기억을 잘못하시는 것 같네요. 착각이실 거예요.',
            tone: 'gaslighting'
        }
    ];

    useEffect(() => {
        const initializeComponent = async () => {
            try {
                // setDialogueTypes(response.dialogue_types); // This line was removed
            } catch (error) {
                console.error('서버 연결 실패:', error);
                // setDialogueTypes(DEFAULT_DIALOGUE_TYPES); // This line was removed
            }
        };
        initializeComponent();
    }, []);

    const toggleMessageFormat = (formatId: string) => {
        if (formatId === 'auto') {
            setSelectedMessageFormats(['auto']);
        } else {
            setSelectedMessageFormats(prev => {
                if (prev.includes('auto')) {
                    return [formatId];
                }
                if (prev.includes(formatId)) {
                    return prev.filter(id => id !== formatId);
                }
                if (prev.length >= 3) {
                    return [...prev.slice(1), formatId];
                }
                return [...prev, formatId];
            });
        }
    };

    const generateContentWithMessageFormat = (inputText: string, formatId: string, isRewrite: boolean = false): string => {
        const format = messageFormats.find(f => f.id === formatId);
        if (!format) return `${inputText}에 대해 응답드립니다.`;

        const templates: { [key: string]: (text: string, isRewrite: boolean) => string } = {
            auto: (text, rewrite) => rewrite ?
                `"${text}"를 가장 적절한 형식으로 개선해드리겠습니다.` :
                `${text}에 대해 가장 적절한 방식으로 응답드리겠습니다.`,

            refutation: (text, rewrite) => rewrite ?
                `"${text}"에 대해 반박하자면, 이 내용에는 다음과 같은 명백한 오류와 논리적 결함이 있습니다. 첫째, 근거가 부족하며, 둘째, 상황을 과도하게 단순화했습니다.` :
                `${text}에 대해 반박하겠습니다. 해당 주장에는 여러 문제점이 있습니다. 우선 논리적 근거가 미흡하고, 현실성이 떨어집니다.`,

            counter_question: (text, rewrite) => rewrite ?
                `"${text}"라고 하셨는데, 정말 그렇게 생각하시나요? 혹시 다른 관점에서는 어떻게 보시나요? 이 부분에 대해서는 어떻게 설명하실 건가요?` :
                `${text}에 대해 질문이 있습니다. 정말 그렇게 확신하시나요? 다른 가능성은 고려해보셨나요?`,

            opposition: (text, rewrite) => rewrite ?
                `"${text}"에 대해서는 명확히 반대 입장을 표명합니다. 이는 잘못된 방향이며, 절대 동의할 수 없습니다.` :
                `${text}에 대한 의견에는 동의할 수 없습니다. 명확히 반대하는 바입니다.`,

            agreement: (text, rewrite) => rewrite ?
                `"${text}"에 완전히 동의합니다. 매우 훌륭한 견해이며, 전적으로 지지합니다. 이보다 더 좋은 의견은 없을 것 같습니다.` :
                `${text}에 대해 완전히 동의합니다. 매우 합리적이고 훌륭한 접근입니다.`,

            defense: (text, rewrite) => rewrite ?
                `"${text}"를 적극적으로 옹호하겠습니다. 이는 충분한 근거와 타당성을 가진 올바른 입장입니다. 전력을 다해 지지하겠습니다.` :
                `${text}에 대해 적극 옹호하는 입장입니다. 충분한 근거가 있는 올바른 방향입니다.`,

            criticism: (text, rewrite) => rewrite ?
                `"${text}"는 완전히 잘못된 것입니다. 이런 터무니없는 내용은 용납할 수 없으며, 강력히 비판하지 않을 수 없습니다.` :
                `${text}에 대해서는 강하게 비판하지 않을 수 없습니다. 전혀 받아들일 수 없는 내용입니다.`,

            neutral: (text, rewrite) => rewrite ?
                `"${text}"에 대한 객관적 사실은 다음과 같습니다. 감정적 판단을 배제하고 순수하게 현황만 전달드리겠습니다.` :
                `${text}에 대한 객관적 사실만 말씀드리겠습니다. 개인적 견해는 배제하고 현황을 설명드립니다.`,

            avoidance: (text, rewrite) => rewrite ?
                `"${text}"에 대해서는... 음, 좀 복잡한 문제네요. 여러 각도에서 봐야 할 것 같고... 섣불리 판단하기는 어려울 것 같습니다.` :
                `${text}에 대해서는... 글쎄요, 복잡한 문제네요. 쉽게 답하기 어려운 사안인 것 같습니다.`,

            sarcasm: (text, rewrite) => rewrite ?
                `"${text}"라니, 정말 "훌륭한" 생각이네요. 분명히 잘 될 거예요. 아, 물론 꿈속에서 말이죠.` :
                `${text}라고 하시니 정말 "멋진" 아이디어네요. 분명 "성공적"일 거예요.`,

            empathy: (text, rewrite) => rewrite ?
                `"${text}"를 보니 마음이 아픕니다. 그런 상황이셨군요. 충분히 이해하고 공감합니다. 정말 힘드셨을 것 같아요.` :
                `${text}에 대한 마음을 충분히 이해하고 공감합니다. 어려운 상황이셨겠어요.`,

            suggestion: (text, rewrite) => rewrite ?
                `"${text}"에 대해 다음과 같은 해결책을 제안합니다. 단계별로 접근하면 좋을 것 같습니다. 이런 방법은 어떨까요?` :
                `${text}에 대해 다음과 같은 해결책을 제안합니다. 구체적인 방안을 말씀드리겠습니다.`,

            questioning: (text, rewrite) => rewrite ?
                `"${text}"에 대해 궁금한 점이 있습니다. 구체적으로 어떤 부분인가요? 더 자세한 설명을 들을 수 있을까요?` :
                `${text}에 대해 구체적으로 어떤 부분이 문제인지 궁금합니다. 더 자세히 설명해 주실 수 있나요?`,

            ignoring: (text, rewrite) => rewrite ?
                `"${text}"라고 하셨나요? 아, 그런 말씀은... 특별히 들은 적이 없는 것 같네요. 다른 얘기를 해볼까요?` :
                `${text}에 대한 말씀은... 특별히 들은 적이 없네요. 다른 주제로 넘어가죠.`,

            emphasis: (text, rewrite) => rewrite ?
                `"${text}"에 대해서만은 확실히 강조하고 싶습니다! 이것은 매우 중요한 사안입니다. 절대 놓쳐서는 안 됩니다!` :
                `${text}에 대해서만은 확실히 강조하고 싶습니다. 매우 중요한 포인트입니다.`,

            speculation: (text, rewrite) => rewrite ?
                `"${text}"에 대해서는... 아마도 이런 이유가 아닐까 추측해봅니다. 확실하지는 않지만, 그럴 가능성이 높아 보입니다.` :
                `${text}에 대해서는 아마도 이런 이유가 아닐까 싶습니다. 확실하지는 않지만요.`,

            emotional_appeal: (text, rewrite) => rewrite ?
                `"${text}"에 대해 진심으로 간절히 호소드립니다. 제발 한 번만 고려해 주세요. 정말 절실합니다.` :
                `${text}에 대해 진심으로 간절히 부탁드립니다. 꼭 한 번만 고려해 주세요.`,

            mockery: (text, rewrite) => rewrite ?
                `"${text}"라니, 정말 어이없는 말씀이네요. 그게 말이 된다고 생각하세요? 웃음이 나올 지경입니다.` :
                `${text}라니, 정말 어이없는 말씀이군요. 그게 말이 됩니까?`,

            directive: (text, rewrite) => rewrite ?
                `"${text}"에 대해서는 즉시 이렇게 하십시오. 다른 선택은 없습니다. 명령에 따라주시기 바랍니다.` :
                `${text}에 대해서는 즉시 이렇게 하십시오. 지체하지 마세요.`,

            coercion: (text, rewrite) => rewrite ?
                `"${text}"에 대해서는 다른 선택은 없을 것입니다. 결과는 책임질 수 없어요. 신중하게 생각해보세요.` :
                `${text}에 대해서는 다른 선택은 없을 것입니다. 상황을 잘 파악하시기 바랍니다.`,

            forcefulness: (text, rewrite) => rewrite ?
                `"${text}"에 대해서는 반드시 이렇게 해야 합니다. 예외는 절대 없습니다. 무조건 따라주시기 바랍니다.` :
                `${text}에 대해서는 반드시 이렇게 해야 합니다. 예외는 인정되지 않습니다.`,

            brainwashing: (text, rewrite) => rewrite ?
                `"${text}"에 대해서는 이것만이 유일한 진실입니다. 계속 생각해보세요. 다른 모든 것은 거짓입니다. 오직 이것만이 옳습니다.` :
                `${text}에 대해서는 이것만이 유일한 진실입니다. 계속 생각해보세요. 다른 것은 모두 거짓입니다.`,

            gaslighting: (text, rewrite) => rewrite ?
                `"${text}"라고 하시는데, 그런 일은 없었어요. 기억을 잘못하시는 것 같네요. 분명히 착각이실 거예요. 다시 생각해보세요.` :
                `${text}라고 하시는데, 그런 일은 없었어요.`
        };

        const template = templates[formatId];
        return template ? template(inputText, isRewrite) :
            `${formatId} 형식으로 "${inputText}"에 응답드립니다.`;
    };

    // 메시지 생성 함수 개선
    const generateDialogue = async () => {
        if (!inputMessage.trim()) {
            setError('메시지 취지를 입력해주세요.');
            return;
        }

        setIsGenerating(true);
        setError('');
        setSuccessMessage('');

        try {
            // 사용자 메시지를 대화 히스토리에 추가
            const userMessage: ConversationMessage = {
                id: `user_${Date.now()}`,
                type: 'user',
                sender: '사용자',
                content: inputMessage,
                timestamp: new Date().toISOString(),
                messageFormat: '새 메시지'
            };

            setConversationHistory(prev => [...prev, userMessage]);

            // API 요청 데이터 준비
            const request = {
                input_message: inputMessage,
                target_dialogue_types: selectedMessageFormats.filter(format => format !== 'auto'),
                intensity_level: 7,
                relationship_dynamic: 'professional',
                conversation_context: conversationHistory.map(msg => msg.content),
                selected_message: selectedChatMessage?.content
            };

            // 메시지 생성 시뮬레이션 (API 호출 대신)
            setTimeout(() => {
                const generateSimulatedMessages = (count: number) => {
                    return Array.from({ length: count }, (_, index) => {
                        const format = messageFormats.find(f => f.id === selectedMessageFormats[index % selectedMessageFormats.length]) || messageFormats[0];
                        return {
                            id: `generated_${Date.now()}_${index}`,
                            content: generateContentWithMessageFormat(inputMessage, format.id, false),
                            messageFormat: format.name,
                            confidence: 85 + Math.random() * 10,
                            reasoning: `${format.name} 스타일로 생성했습니다.`
                        };
                    });
                };
                const generatedMessages = generateSimulatedMessages(3); // 항상 3개 생성

                if (generatedMessages && generatedMessages.length > 0) {
                    const newMessages: ConversationMessage[] = generatedMessages.map((msg: any) => ({
                        id: msg.id,
                        type: 'assistant',
                        sender: 'AI',
                        content: msg.content,
                        timestamp: new Date().toISOString(),
                        messageFormat: msg.messageFormat,
                        confidence: msg.confidence,
                        reasoning: msg.reasoning,
                        isGenerated: true
                    }));
                    setConversationHistory(prev => [...prev, ...newMessages]);
                    setSuccessMessage(
                        `${generatedMessages.length}개의 메시지가 성공적으로 생성되었습니다! ` +
                        `형식: ${generatedMessages.map((m: any) => m.messageFormat).join(', ')}`
                    );
                    setInputMessage('');
                }
                setIsGenerating(false);
            }, 2000);

        } catch (error) {
            console.error('메시지 생성 중 오류:', error);
            setError('메시지 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
            setIsGenerating(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            generateDialogue();
        }
    };

    const getCategoryColor = (category: string): string => {
        const colors: { [key: string]: string } = {
            auto: 'bg-purple-100 text-purple-800',
            opposition: 'bg-red-100 text-red-800',
            inquiry: 'bg-blue-100 text-blue-800',
            support: 'bg-green-100 text-green-800',
            attack: 'bg-orange-100 text-orange-800',
            objective: 'bg-gray-100 text-gray-800',
            evasive: 'bg-yellow-100 text-yellow-800',
            indirect: 'bg-pink-100 text-pink-800',
            emotional: 'bg-teal-100 text-teal-800',
            solution: 'bg-emerald-100 text-emerald-800',
            dismissive: 'bg-slate-100 text-slate-800',
            assertive: 'bg-cyan-100 text-cyan-800',
            tentative: 'bg-lime-100 text-lime-800',
            command: 'bg-violet-100 text-violet-800',
            pressure: 'bg-rose-100 text-rose-800',
            manipulation: 'bg-amber-100 text-amber-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    // 샘플 메시지 추가 함수
    const addSampleMessage = (purpose: string, format: string) => {
        setInputMessage(purpose);
        setSelectedMessageFormats([format]);
    };

    const sampleMessages = [
        { purpose: '회의 일정 변경 안내', format: 'empathy', label: '공감형 안내' },
        { purpose: '재건축 진행 상황 문의', format: 'suggestion', label: '제안형 답변' },
        { purpose: '분담금 관련 우려사항', format: 'neutral', label: '중립적 설명' },
        { purpose: '시공사 선정 기준 설명', format: 'emphasis', label: '강조형 설명' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* 헤더 */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">AI 메시지 생성 시스템</h1>
                        </div>

                        {/* 대화방 선택 */}
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <button
                                    onClick={() => setShowChatRoomSelector(!showChatRoomSelector)}
                                    className="flex items-center space-x-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                                >
                                    <span className="text-sm font-medium">
                                        {selectedChatRoom ? selectedChatRoom.name : '대화방 선택'}
                                    </span>
                                    <ChevronDownIcon className="h-4 w-4" />
                                </button>

                                {showChatRoomSelector && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                        <div className="p-2">
                                            {chatRooms.map((room) => (
                                                <button
                                                    key={room.id}
                                                    onClick={() => {
                                                        setSelectedChatRoom(room);
                                                        setSelectedChatMessage(null);
                                                        setShowChatRoomSelector(false);
                                                    }}
                                                    className={`w-full text-left p-2 rounded-md text-sm hover:bg-gray-100 ${selectedChatRoom?.id === room.id ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                                                        }`}
                                                >
                                                    <div className="font-medium">{room.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {room.messages.map(msg => msg.sender).join(', ')}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex">
                {/* 왼쪽: 대화 내용 */}
                <div className="w-1/2 bg-white border-r border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">대화 내용</h2>
                        {selectedChatRoom && (
                            <p className="text-sm text-gray-500 mt-1">
                                {selectedChatRoom.messages.map(msg => msg.sender).join(', ')} • {selectedChatRoom.messages.length}개 메시지
                            </p>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[calc(100vh-200px)]">
                        {selectedChatRoom ? selectedChatRoom.messages.map((message) => (
                            <div
                                key={message.id}
                                onClick={() => handleChatMessageSelect(message)}
                                className={`cursor-pointer p-3 rounded-lg border transition-all hover:shadow-md ${selectedChatMessage?.id === message.id
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${message.isMe ? 'bg-blue-500' : 'bg-gray-500'
                                            }`}>
                                            {message.sender.charAt(0)}
                                        </div>
                                        <span className="font-medium text-gray-900">{message.sender}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {formatMessageTime(message.timestamp)}
                                    </span>
                                </div>
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {message.content}
                                </p>
                                {selectedChatMessage?.id === message.id && (
                                    <div className="mt-2 flex items-center space-x-2">
                                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                            ✓ 선택됨
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            이 메시지를 기반으로 응답을 생성합니다
                                        </span>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="text-center py-12 text-gray-500">
                                <PaperAirplaneIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">대화방을 선택해주세요</h3>
                                <p className="text-gray-500">상단에서 대화방을 선택하면 대화 내용을 볼 수 있습니다</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 오른쪽: 메시지 생성 */}
                <div className="w-1/2 flex flex-col">
                    <div className="flex-1 overflow-y-auto p-6">
                        {/* 대화 히스토리 표시 */}
                        {conversationHistory.length === 0 ? (
                            <div className="text-center py-12">
                                <PaperAirplaneIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">메시지 생성을 시작해보세요</h3>
                                <p className="text-gray-500 mb-6">왼쪽에서 대화를 선택하고 다양한 형식으로 리라이팅해보세요</p>
                                {selectedChatMessage && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                                        <h4 className="font-medium text-blue-900 mb-2">선택된 메시지</h4>
                                        <div className="text-sm text-blue-800 bg-white rounded p-3">
                                            <strong>{selectedChatMessage.sender}:</strong><br />
                                            {selectedChatMessage.content}
                                        </div>
                                        <p className="text-xs text-blue-600 mt-2">
                                            아래에서 메시지 형식을 선택하고 생성해보세요
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* 대화 히스토리 표시 개선 */
                            <div className="space-y-4">
                                {conversationHistory.map((message, index) => (
                                    <div key={message.id} className="mb-4 animate-fade-in">
                                        <div className={`flex ${message.type === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                                            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm border ${message.type === 'assistant'
                                                ? 'bg-white border-gray-200 text-gray-800'
                                                : 'bg-purple-600 border-purple-600 text-white'
                                                }`}>
                                                {/* 메시지 내용 */}
                                                <div className="mb-2">
                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                        {message.content}
                                                    </p>
                                                </div>

                                                {/* 메시지 메타 정보 */}
                                                <div className="flex items-center justify-between text-xs opacity-70">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-medium">
                                                            {message.type === 'assistant' ? 'AI' : '사용자'}
                                                        </span>
                                                        {message.messageFormat && (
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${message.type === 'assistant'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-purple-200 text-purple-800'
                                                                }`}>
                                                                {message.messageFormat}
                                                            </span>
                                                        )}
                                                        {message.confidence && (
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${message.confidence > 90
                                                                ? 'bg-green-100 text-green-700'
                                                                : message.confidence > 75
                                                                    ? 'bg-yellow-100 text-yellow-700'
                                                                    : 'bg-red-100 text-red-700'
                                                                }`}>
                                                                신뢰도 {message.confidence}%
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span>
                                                        {formatMessageTime(message.timestamp)}
                                                    </span>
                                                </div>

                                                {/* AI 메시지의 추가 정보 */}
                                                {message.type === 'assistant' && message.reasoning && (
                                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                                        <p className="text-xs text-gray-500 italic">
                                                            💡 {message.reasoning}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 로딩 상태 표시 */}
                        {isGenerating && (
                            <div className="mb-4 flex justify-start animate-fade-in">
                                <div className="max-w-[80%] p-4 rounded-2xl bg-gray-100 border border-gray-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            AI가
                                            {selectedMessageFormats.includes('auto')
                                                ? '최적의 형식으로'
                                                : `${selectedMessageFormats.length}가지 형식으로`
                                            } 메시지를 생성하고 있습니다...
                                        </span>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500">
                                        선택된 형식: {selectedMessageFormats.includes('auto') ? 'AI 자동 선택' : selectedMessageFormats.map(id => {
                                            const format = messageFormats.find(f => f.id === id);
                                            return format ? format.name : id;
                                        }).join(', ')}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 성공 메시지 */}
                        {successMessage && (
                            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 animate-fade-in">
                                <div className="flex items-center space-x-2">
                                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                    <span className="font-medium">생성 완료!</span>
                                </div>
                                <p className="mt-1 text-sm">{successMessage}</p>
                            </div>
                        )}

                        {/* 에러 메시지 */}
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 animate-fade-in">
                                <div className="flex items-center space-x-2">
                                    <XMarkIcon className="w-5 h-5 text-red-500" />
                                    <span className="font-medium">오류 발생</span>
                                </div>
                                <p className="mt-1 text-sm">{error}</p>
                                <button
                                    onClick={() => setError('')}
                                    className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                                >
                                    닫기
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 메시지 생성 섹션 - 간단한 ChatGPT 스타일 */}
                    <div className="p-6 space-y-4">
                        {/* 메시지 형식 선택 */}
                        <div className="mb-4">
                            <details className="group">
                                <summary className="flex items-center justify-between cursor-pointer p-2 bg-gray-50 rounded-lg hover:bg-gray-100">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-700">메시지 형식 선택</span>
                                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                            {selectedMessageFormats.includes('auto') ? 'AI 자동' : `${selectedMessageFormats.length}개 선택`}
                                        </span>
                                    </div>
                                    <ChevronDownIcon className="h-4 w-4 text-gray-500 group-open:rotate-180 transition-transform" />
                                </summary>

                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                                    {messageFormats.map((format) => (
                                        <button
                                            key={format.id}
                                            onClick={() => toggleMessageFormat(format.id)}
                                            className={`p-3 text-left border rounded-lg transition-all hover:shadow-sm ${selectedMessageFormats.includes(format.id)
                                                ? 'border-purple-500 bg-purple-50'
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-1">
                                                <span className="font-medium text-sm text-gray-900">{format.name}</span>
                                                <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(format.category)}`}>
                                                    {format.tone}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 mb-2">{format.description}</p>
                                            <p className="text-xs text-gray-500 italic">"{format.example}"</p>
                                        </button>
                                    ))}
                                </div>
                            </details>
                        </div>

                        {/* 메시지 취지 입력 */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">메시지 취지</label>
                            <textarea
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                rows={4}
                                placeholder="어떤 메시지를 생성하고 싶으신가요? (예: 회의 일정 변경 안내, 프로젝트 진행 상황 공유)"
                            />
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                                <span>💬 새 메시지 • {inputMessage.length}자 • {selectedMessageFormats.includes('auto') ? 'AI 자동' : `${selectedMessageFormats.length}개 형식`}</span>
                            </div>
                        </div>

                        {/* 메시지 생성 버튼 */}
                        <button
                            onClick={generateDialogue}
                            disabled={isGenerating || !inputMessage.trim()}
                            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {isGenerating ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>AI가 메시지를 생성하고 있습니다...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center space-x-2">
                                    <SparklesIcon className="w-5 h-5" />
                                    <span>메시지 생성</span>
                                </div>
                            )}
                        </button>

                        {/* 추가 도움말 */}
                        <div className="text-xs text-center text-gray-500">
                            💡 팁: 'AI 자동' 선택 시 상황에 맞는 최적의 형식으로 생성됩니다
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedDialogueInterface;