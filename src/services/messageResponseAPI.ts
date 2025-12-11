// 고도화된 메시지 응답 API 서비스
export interface MessageResponseRequest {
    target_message: {
        id: string;
        content: string;
        sender: string;
        timestamp: string;
    };
    tone: string;
    message_format: string;
    intent: string;
    chat_room_id: string;
    strategy?: string;
    simulation_mode?: boolean;
    urgency_level?: string;
    message_length?: string;
    include_data?: boolean;
    include_examples?: boolean;
    include_call_to_action?: boolean;
}

export interface MessageResponseResponse {
    success: boolean;
    generated_messages: GeneratedResponse[];
    chat_room_id: string;
    target_message: string;
    generation_time: string;
    analysis?: ConversationAnalysis;
    simulation_results?: SimulationResult[];
}

export interface GeneratedResponse {
    id: string;
    content: string;
    style: string;
    tone: string;
    format: string;
    confidence: number;
    reasoning: string;
    follow_up_messages: string[];
    timestamp: string;
    emotion?: string;
    impact?: number;
    strategy?: string;
}

export interface ConversationAnalysis {
    totalMessages: number;
    activeParticipants: number;
    dominantEmotion: string;
    sentimentTrend: 'positive' | 'negative' | 'neutral';
    keyTopics: string[];
    conflictLevel: number;
    influenceOpportunities: string[];
    aiRecommendations: string[];
}

export interface SimulationResult {
    step: number;
    action: string;
    expectedResponse: string;
    probability: number;
    impact: number;
    strategy: string;
}

export interface ChatRoom {
    id: string;
    name: string;
    messageCount: number;
    lastActivity: string;
    isActive: boolean;
    participants: string[];
}

export interface Message {
    id: string;
    content: string;
    sender: string;
    timestamp: string;
    emotion?: string;
    sentiment?: number;
    keywords?: string[];
}

class MessageResponseAPI {
    private baseURL: string;

    constructor() {
        // 메시지 생성 서버 (포트 8001)
        this.baseURL = 'http://localhost:8001';
    }

    async generateResponseMessages(request: MessageResponseRequest): Promise<MessageResponseResponse> {
        try {
            const response = await fetch(`${this.baseURL}/api/generate-message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...request,
                    urgency_level: request.urgency_level || '보통',
                    message_length: request.message_length || '중간',
                    include_data: request.include_data || false,
                    include_examples: request.include_examples || false,
                    include_call_to_action: request.include_call_to_action || false
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('메시지 생성 오류:', error);
            return this.generateMockResponse(request);
        }
    }

    async analyzeConversation(messages: Message[]): Promise<ConversationAnalysis> {
        try {
            const response = await fetch(`${this.baseURL}/api/analyze-conversation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messages }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('대화 분석 오류:', error);
            return this.generateMockAnalysis(messages);
        }
    }

    async runSimulation(request: MessageResponseRequest): Promise<SimulationResult[]> {
        try {
            const response = await fetch(`${this.baseURL}/api/simulate-response`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.simulation_results || [];
        } catch (error) {
            console.error('시뮬레이션 오류:', error);
            return this.generateMockSimulation(request);
        }
    }

    async getMediaFiles(chatRoomId: string): Promise<any[]> {
        try {
            // 동기화 서버 (포트 8002)에서 미디어 파일 조회
            const response = await fetch(`http://localhost:8002/api/media-files/${chatRoomId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.media_files || [];
        } catch (error) {
            console.error('미디어 파일 조회 오류:', error);
            return [];
        }
    }

    async manualSync(): Promise<any> {
        try {
            // 동기화 서버 (포트 8002)에서 수동 동기화 실행
            const response = await fetch('http://localhost:8002/api/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('수동 동기화 오류:', error);
            return { success: false, error: '동기화 실패' };
        }
    }

    async getSyncStatus(): Promise<any> {
        try {
            // 동기화 서버 (포트 8002)에서 동기화 상태 조회
            const response = await fetch('http://localhost:8002/api/sync-status');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('동기화 상태 조회 오류:', error);
            return { success: false, error: '상태 조회 실패' };
        }
    }

    async getChatRooms(): Promise<ChatRoom[]> {
        try {
            // 동기화 서버 (포트 8002)에서 채팅방 목록 조회
            const response = await fetch('http://localhost:8002/api/chat-rooms');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.chat_rooms || [];
        } catch (error) {
            console.error('채팅방 목록 조회 오류:', error);
            return this.getMockChatRooms();
        }
    }

    async getChatMessages(chatRoomId: string): Promise<Message[]> {
        try {
            // 동기화 서버 (포트 8002)에서 채팅 메시지 조회
            const response = await fetch(`http://localhost:8002/api/chat-messages/${chatRoomId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.messages || [];
        } catch (error) {
            console.error('채팅 메시지 조회 오류:', error);
            return this.getMockMessages(chatRoomId);
        }
    }

    // 모의 응답 생성
    private generateMockResponse(request: MessageResponseRequest): MessageResponseResponse {
        const baseMessages = [
            {
                id: '1',
                content: `[${request.tone}] ${request.intent}에 대한 ${request.message_format} 메시지입니다.`,
                style: request.message_format,
                tone: request.tone,
                format: request.message_format,
                confidence: 0.85 + Math.random() * 0.1,
                reasoning: `${request.intent}에 대한 ${request.tone} 톤의 ${request.message_format} 전략을 사용했습니다.`,
                follow_up_messages: [
                    '이어서 추가 논점을 제시할 수 있습니다.',
                    '상대방의 반응에 따라 조정이 필요합니다.',
                    '감정적 공감 포인트를 찾아 접근하세요.'
                ],
                timestamp: new Date().toISOString(),
                emotion: this.analyzeEmotion(request.intent),
                impact: this.calculateImpact(request.tone, request.message_format),
                strategy: request.strategy || '기본 전략'
            },
            {
                id: '2',
                content: `[${request.tone}] ${request.intent}에 대한 대안적 접근 방법입니다.`,
                style: request.message_format,
                tone: request.tone,
                format: request.message_format,
                confidence: 0.78 + Math.random() * 0.12,
                reasoning: `다양한 관점에서 ${request.intent}를 다루는 방법을 제시했습니다.`,
                follow_up_messages: [
                    '상대방의 관심사에 맞춰 조정하세요.',
                    '구체적인 예시를 들어 설명하세요.',
                    '감정적 연결점을 찾아 공감을 유도하세요.'
                ],
                timestamp: new Date().toISOString(),
                emotion: this.analyzeEmotion(request.intent),
                impact: this.calculateImpact(request.tone, request.message_format),
                strategy: request.strategy || '기본 전략'
            },
            {
                id: '3',
                content: `[${request.tone}] ${request.intent}에 대한 심화 분석 메시지입니다.`,
                style: request.message_format,
                tone: request.tone,
                format: request.message_format,
                confidence: 0.82 + Math.random() * 0.08,
                reasoning: `깊이 있는 분석을 통해 ${request.intent}의 핵심을 파악했습니다.`,
                follow_up_messages: [
                    '상대방의 반응을 주의 깊게 관찰하세요.',
                    '필요시 추가 정보를 제공하세요.',
                    '감정적 공감을 바탕으로 설득하세요.'
                ],
                timestamp: new Date().toISOString(),
                emotion: this.analyzeEmotion(request.intent),
                impact: this.calculateImpact(request.tone, request.message_format),
                strategy: request.strategy || '기본 전략'
            }
        ];

        return {
            success: true,
            generated_messages: baseMessages,
            chat_room_id: request.chat_room_id,
            target_message: request.target_message.content,
            generation_time: new Date().toISOString(),
            analysis: this.generateMockAnalysis([]),
            simulation_results: this.generateMockSimulation(request)
        };
    }

    // 모의 채팅방 데이터
    private getMockChatRooms(): ChatRoom[] {
        return [
            {
                id: 'room-1',
                name: '개포우성7차 조합원 대화방',
                messageCount: 1247,
                lastActivity: '2024-01-15 14:30',
                isActive: true,
                participants: ['김철수', '이영희', '박민수', '정수진', '최동욱']
            },
            {
                id: 'room-2',
                name: '대우건설 관련 논의방',
                messageCount: 892,
                lastActivity: '2024-01-15 13:45',
                isActive: true,
                participants: ['김철수', '이영희', '박민수']
            },
            {
                id: 'room-3',
                name: '삼성물산 관련 논의방',
                messageCount: 567,
                lastActivity: '2024-01-15 12:20',
                isActive: true,
                participants: ['정수진', '최동욱', '김철수']
            },
            {
                id: 'room-4',
                name: '환급금 관련 문의방',
                messageCount: 234,
                lastActivity: '2024-01-15 11:15',
                isActive: false,
                participants: ['이영희', '박민수']
            }
        ];
    }

    // 모의 메시지 데이터
    private getMockMessages(chatRoomId: string): Message[] {
        const baseMessages = [
            {
                id: 'msg-1',
                content: '대우건설이 삼성물산보다 금리 조건이 더 좋다고 들었는데, 정말인가요?',
                sender: '김철수',
                timestamp: '2024-01-15 14:25',
                emotion: '중립',
                sentiment: 0.3,
                keywords: ['대우건설', '삼성물산', '금리', '조건']
            },
            {
                id: 'msg-2',
                content: '네, 맞습니다. 대우건설이 0.5% 정도 더 낮은 금리를 제시했어요.',
                sender: '이영희',
                timestamp: '2024-01-15 14:26',
                emotion: '긍정',
                sentiment: 0.7,
                keywords: ['대우건설', '금리', '낮은']
            },
            {
                id: 'msg-3',
                content: '하지만 삼성물산의 설계 품질이 더 우수하다고 하던데요.',
                sender: '박민수',
                timestamp: '2024-01-15 14:27',
                emotion: '중립',
                sentiment: 0.2,
                keywords: ['삼성물산', '설계', '품질', '우수']
            },
            {
                id: 'msg-4',
                content: '환급금도 대우건설이 더 많이 주는 것 같아요.',
                sender: '정수진',
                timestamp: '2024-01-15 14:28',
                emotion: '긍정',
                sentiment: 0.8,
                keywords: ['환급금', '대우건설', '많이']
            },
            {
                id: 'msg-5',
                content: '그래도 삼성물산의 브랜드 가치를 고려해야 하지 않나요?',
                sender: '최동욱',
                timestamp: '2024-01-15 14:29',
                emotion: '중립',
                sentiment: 0.4,
                keywords: ['삼성물산', '브랜드', '가치']
            }
        ];

        return baseMessages;
    }

    // 모의 분석 데이터
    private generateMockAnalysis(messages: Message[]): ConversationAnalysis {
        return {
            totalMessages: messages.length || 5,
            activeParticipants: new Set(messages.map(m => m.sender)).size || 5,
            dominantEmotion: '중립',
            sentimentTrend: 'neutral',
            keyTopics: ['대우건설', '삼성물산', '금리', '설계', '환급금'],
            conflictLevel: 25.5,
            influenceOpportunities: [
                '감정적 공감 포인트 발견',
                '논리적 설득 기회 창출',
                '사회적 증명 활용',
                '권위 인용 가능성',
                '대비 효과 활용'
            ],
            aiRecommendations: [
                '대우건설의 금리 우위를 강조하세요.',
                '환급금 혜택을 구체적으로 설명하세요.',
                '삼성물산과의 비교표를 제시하세요.'
            ]
        };
    }

    // 모의 시뮬레이션 데이터
    private generateMockSimulation(request: MessageResponseRequest): SimulationResult[] {
        return [
            {
                step: 1,
                action: '메시지 전송',
                expectedResponse: '상대방의 즉각적인 반응',
                probability: 85,
                impact: 70,
                strategy: request.strategy || '기본 전략'
            },
            {
                step: 2,
                action: '추가 논점 제시',
                expectedResponse: '동의 또는 반대 의견',
                probability: 70,
                impact: 60,
                strategy: request.strategy || '기본 전략'
            },
            {
                step: 3,
                action: '감정적 호소',
                expectedResponse: '공감 또는 무시',
                probability: 60,
                impact: 80,
                strategy: request.strategy || '기본 전략'
            },
            {
                step: 4,
                action: '구체적 데이터 제시',
                expectedResponse: '신뢰도 증가',
                probability: 75,
                impact: 85,
                strategy: request.strategy || '기본 전략'
            },
            {
                step: 5,
                action: '결론 도출',
                expectedResponse: '동의 또는 추가 질문',
                probability: 65,
                impact: 90,
                strategy: request.strategy || '기본 전략'
            }
        ];
    }

    // 감정 분석
    private analyzeEmotion(content: string): string {
        const emotions = {
            '기쁨': ['좋다', '행복', '만족', '성공', '우수'],
            '분노': ['화나다', '짜증', '열받다', '분노'],
            '슬픔': ['슬프다', '우울', '실망', '아쉽다'],
            '중립': ['그렇다', '알겠다', '네', '오케이', '정말']
        };

        for (const [emotion, keywords] of Object.entries(emotions)) {
            if (keywords.some(keyword => content.includes(keyword))) {
                return emotion;
            }
        }
        return '중립';
    }

    // 영향력 계산
    private calculateImpact(tone: string, format: string): number {
        let impact = 50; // 기본값

        // 톤에 따른 영향력 조정
        if (tone.includes('강')) impact += 20;
        if (tone.includes('중')) impact += 10;
        if (tone.includes('약')) impact -= 10;

        // 형식에 따른 영향력 조정
        const aggressiveFormats = ['반박', '반대', '비난', '조롱', '강압', '강제', '세뇌', '가스라이팅'];
        const positiveFormats = ['동조', '공감', '제안', '응호'];

        if (aggressiveFormats.includes(format)) impact += 15;
        if (positiveFormats.includes(format)) impact += 10;

        return Math.min(Math.max(impact, 0), 100);
    }
}

const messageResponseAPI = new MessageResponseAPI();
export default messageResponseAPI;
export { MessageResponseAPI }; 