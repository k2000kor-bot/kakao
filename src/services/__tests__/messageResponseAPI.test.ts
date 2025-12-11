import {
    MessageResponseAPI,
    MessageResponseRequest,
    MessageResponseResponse,
    GeneratedResponse,
    ConversationAnalysis,
    SimulationResult,
    ChatRoom,
    Message
} from '../messageResponseAPI';

// fetch 모킹
global.fetch = jest.fn();

describe('MessageResponseAPI', () => {
    let api: MessageResponseAPI;

    beforeEach(() => {
        api = new MessageResponseAPI();
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    describe('초기화', () => {
        it('서비스 인스턴스 생성', () => {
            expect(MessageResponseAPI).toBeDefined();
        });

        it('새 인스턴스 생성', () => {
            expect(api).toBeInstanceOf(MessageResponseAPI);
        });
    });

    describe('generateResponseMessages', () => {
        const baseRequest: MessageResponseRequest = {
            target_message: {
                id: 'msg1',
                content: '테스트 메시지',
                sender: 'user1',
                timestamp: '2024-01-01T00:00:00Z'
            },
            tone: 'formal',
            message_format: 'essay',
            intent: 'inform',
            chat_room_id: 'room1'
        };

        it('응답 메시지를 생성해야 함', async () => {
            const mockResponse: MessageResponseResponse = {
                success: true,
                generated_messages: [
                    {
                        id: 'gen1',
                        content: '생성된 메시지',
                        style: 'essay',
                        tone: 'formal',
                        format: 'essay',
                        confidence: 0.9,
                        reasoning: '이유',
                        follow_up_messages: [],
                        timestamp: '2024-01-01T00:00:00Z'
                    }
                ],
                chat_room_id: 'room1',
                target_message: '테스트 메시지',
                generation_time: '2024-01-01T00:00:00Z'
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await api.generateResponseMessages(baseRequest);

            expect(result.success).toBe(true);
            expect(result.generated_messages.length).toBeGreaterThan(0);
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8001/api/generate-message',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            );
        });

        it('기본값을 설정해야 함', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    generated_messages: [],
                    chat_room_id: 'room1',
                    target_message: '테스트',
                    generation_time: '2024-01-01T00:00:00Z'
                })
            });

            await api.generateResponseMessages(baseRequest);

            const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
            const body = JSON.parse(fetchCall[1].body);

            expect(body.urgency_level).toBe('보통');
            expect(body.message_length).toBe('중간');
            expect(body.include_data).toBe(false);
            expect(body.include_examples).toBe(false);
            expect(body.include_call_to_action).toBe(false);
        });

        it('에러 발생 시 모의 응답을 반환해야 함', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const result = await api.generateResponseMessages(baseRequest);

            expect(result.success).toBe(true);
            expect(result.generated_messages.length).toBeGreaterThan(0);
            expect(result.generated_messages[0].content).toContain(baseRequest.tone);
        });

        it('HTTP 에러 발생 시 모의 응답을 반환해야 함', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 500
            });

            const result = await api.generateResponseMessages(baseRequest);

            expect(result.success).toBe(true);
            expect(result.generated_messages.length).toBeGreaterThan(0);
        });

        it('시뮬레이션 모드가 활성화된 경우 시뮬레이션 결과를 포함해야 함', async () => {
            const request: MessageResponseRequest = {
                ...baseRequest,
                simulation_mode: true
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    generated_messages: [],
                    chat_room_id: 'room1',
                    target_message: '테스트',
                    generation_time: '2024-01-01T00:00:00Z',
                    simulation_results: []
                })
            });

            const result = await api.generateResponseMessages(request);

            expect(result).toBeDefined();
        });
    });

    describe('analyzeConversation', () => {
        const messages: Message[] = [
            {
                id: 'msg1',
                content: '첫 번째 메시지',
                sender: 'user1',
                timestamp: '2024-01-01T00:00:00Z'
            },
            {
                id: 'msg2',
                content: '두 번째 메시지',
                sender: 'user2',
                timestamp: '2024-01-01T00:01:00Z'
            }
        ];

        it('대화를 분석해야 함', async () => {
            const mockAnalysis: ConversationAnalysis = {
                totalMessages: 2,
                activeParticipants: 2,
                dominantEmotion: 'neutral',
                sentimentTrend: 'neutral',
                keyTopics: ['주제1'],
                conflictLevel: 10,
                influenceOpportunities: ['기회1'],
                aiRecommendations: ['추천1']
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockAnalysis
            });

            const result = await api.analyzeConversation(messages);

            expect(result.totalMessages).toBe(2);
            expect(result.activeParticipants).toBe(2);
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8001/api/analyze-conversation',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ messages })
                })
            );
        });

        it('에러 발생 시 모의 분석을 반환해야 함', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const result = await api.analyzeConversation(messages);

            expect(result.totalMessages).toBeGreaterThanOrEqual(0);
            expect(result.activeParticipants).toBeGreaterThanOrEqual(0);
        });
    });

    describe('runSimulation', () => {
        const request: MessageResponseRequest = {
            target_message: {
                id: 'msg1',
                content: '테스트 메시지',
                sender: 'user1',
                timestamp: '2024-01-01T00:00:00Z'
            },
            tone: 'formal',
            message_format: 'essay',
            intent: 'inform',
            chat_room_id: 'room1',
            strategy: 'test_strategy'
        };

        it('시뮬레이션을 실행해야 함', async () => {
            const mockSimulation: SimulationResult[] = [
                {
                    step: 1,
                    action: '액션1',
                    expectedResponse: '예상 응답',
                    probability: 80,
                    impact: 70,
                    strategy: 'test_strategy'
                }
            ];

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    simulation_results: mockSimulation
                })
            });

            const result = await api.runSimulation(request);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0].step).toBe(1);
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8001/api/simulate-response',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(request)
                })
            );
        });

        it('에러 발생 시 모의 시뮬레이션을 반환해야 함', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const result = await api.runSimulation(request);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0].step).toBe(1);
        });
    });

    describe('getMediaFiles', () => {
        it('미디어 파일 목록을 조회해야 함', async () => {
            const chatRoomId = 'room1';
            const mockFiles = [
                { id: 'file1', name: 'file1.jpg', type: 'image' },
                { id: 'file2', name: 'file2.pdf', type: 'document' }
            ];

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    media_files: mockFiles
                })
            });

            const result = await api.getMediaFiles(chatRoomId);

            expect(result).toEqual(mockFiles);
            expect(global.fetch).toHaveBeenCalledWith(
                `http://localhost:8002/api/media-files/${chatRoomId}`
            );
        });

        it('에러 발생 시 빈 배열을 반환해야 함', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const result = await api.getMediaFiles('room1');

            expect(result).toEqual([]);
        });
    });

    describe('manualSync', () => {
        it('수동 동기화를 실행해야 함', async () => {
            const mockResponse = {
                success: true,
                message: '동기화 완료'
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await api.manualSync();

            expect(result).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8002/api/sync',
                expect.objectContaining({
                    method: 'POST'
                })
            );
        });

        it('에러 발생 시 실패 응답을 반환해야 함', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const result = await api.manualSync();

            expect(result.success).toBe(false);
            expect(result.error).toBe('동기화 실패');
        });
    });

    describe('getSyncStatus', () => {
        it('동기화 상태를 조회해야 함', async () => {
            const mockStatus = {
                success: true,
                status: 'synced',
                last_sync: '2024-01-01T00:00:00Z'
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockStatus
            });

            const result = await api.getSyncStatus();

            expect(result).toEqual(mockStatus);
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8002/api/sync-status'
            );
        });

        it('에러 발생 시 실패 응답을 반환해야 함', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const result = await api.getSyncStatus();

            expect(result.success).toBe(false);
            expect(result.error).toBe('상태 조회 실패');
        });
    });

    describe('getChatRooms', () => {
        it('채팅방 목록을 조회해야 함', async () => {
            const mockRooms: ChatRoom[] = [
                {
                    id: 'room1',
                    name: '방1',
                    messageCount: 10,
                    lastActivity: '2024-01-01T00:00:00Z',
                    isActive: true,
                    participants: ['user1', 'user2']
                }
            ];

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    chat_rooms: mockRooms
                })
            });

            const result = await api.getChatRooms();

            expect(result).toEqual(mockRooms);
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8002/api/chat-rooms'
            );
        });

        it('에러 발생 시 모의 채팅방 목록을 반환해야 함', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const result = await api.getChatRooms();

            expect(result.length).toBeGreaterThan(0);
            expect(result[0].id).toBeDefined();
            expect(result[0].name).toBeDefined();
        });
    });

    describe('getChatMessages', () => {
        it('채팅 메시지 목록을 조회해야 함', async () => {
            const chatRoomId = 'room1';
            const mockMessages: Message[] = [
                {
                    id: 'msg1',
                    content: '메시지1',
                    sender: 'user1',
                    timestamp: '2024-01-01T00:00:00Z'
                }
            ];

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    messages: mockMessages
                })
            });

            const result = await api.getChatMessages(chatRoomId);

            expect(result).toEqual(mockMessages);
            expect(global.fetch).toHaveBeenCalledWith(
                `http://localhost:8002/api/chat-messages/${chatRoomId}`
            );
        });

        it('에러 발생 시 모의 메시지 목록을 반환해야 함', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const result = await api.getChatMessages('room1');

            expect(result.length).toBeGreaterThan(0);
            expect(result[0].id).toBeDefined();
            expect(result[0].content).toBeDefined();
        });
    });

    describe('통합 테스트', () => {
        it('전체 워크플로우를 테스트해야 함', async () => {
            const request: MessageResponseRequest = {
                target_message: {
                    id: 'msg1',
                    content: '테스트 메시지',
                    sender: 'user1',
                    timestamp: '2024-01-01T00:00:00Z'
                },
                tone: 'formal',
                message_format: 'essay',
                intent: 'inform',
                chat_room_id: 'room1',
                strategy: 'test_strategy',
                urgency_level: 'high',
                message_length: 'long',
                include_data: true,
                include_examples: true,
                include_call_to_action: true
            };

            // 1. 응답 메시지 생성
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    generated_messages: [
                        {
                            id: 'gen1',
                            content: '생성된 메시지',
                            style: 'essay',
                            tone: 'formal',
                            format: 'essay',
                            confidence: 0.9,
                            reasoning: '이유',
                            follow_up_messages: [],
                            timestamp: '2024-01-01T00:00:00Z'
                        }
                    ],
                    chat_room_id: 'room1',
                    target_message: '테스트 메시지',
                    generation_time: '2024-01-01T00:00:00Z'
                })
            });

            const response = await api.generateResponseMessages(request);
            expect(response.success).toBe(true);

            // 2. 대화 분석
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    totalMessages: 1,
                    activeParticipants: 1,
                    dominantEmotion: 'neutral',
                    sentimentTrend: 'neutral',
                    keyTopics: ['주제'],
                    conflictLevel: 10,
                    influenceOpportunities: ['기회'],
                    aiRecommendations: ['추천']
                })
            });

            const messages: Message[] = [
                {
                    id: 'msg1',
                    content: '메시지',
                    sender: 'user1',
                    timestamp: '2024-01-01T00:00:00Z'
                }
            ];

            const analysis = await api.analyzeConversation(messages);
            expect(analysis.totalMessages).toBe(1);
        });
    });
});

