import { Message, ChatContext } from '../types/chat';

export interface UnifiedMessageRequest {
    type: 'chat' | 'analysis' | 'guidance' | 'project' | 'file' | 'system';
    content: string;
    context?: ChatContext;
    options?: {
        style?: 'friendly' | 'professional' | 'creative' | 'formal';
        length?: 'short' | 'medium' | 'long';
        priority?: 'low' | 'medium' | 'high';
    };
}

export interface UnifiedMessageResponse {
    success: boolean;
    message: Message;
    metadata?: {
        processingTime: number;
        confidence: number;
        model: string;
        tokens: number;
        usedServices: string[];
    };
}

class UnifiedMessageService {
    private baseUrls = {
        ai: 'http://localhost:8002/api/v7',
        guidance: 'http://localhost:8003/api/guidance',
        project: 'http://localhost:8003/api/project',
        file: 'http://localhost:8003/api/file',
        system: 'http://localhost:8003/api/system'
    };

    async processMessage(request: UnifiedMessageRequest): Promise<UnifiedMessageResponse> {
        const startTime = Date.now();

        try {
            let response: UnifiedMessageResponse;

            switch (request.type) {
                case 'chat':
                    response = await this.handleChatMessage(request);
                    break;
                case 'analysis':
                    response = await this.handleAnalysisMessage(request);
                    break;
                case 'guidance':
                    response = await this.handleGuidanceMessage(request);
                    break;
                case 'project':
                    response = await this.handleProjectMessage(request);
                    break;
                case 'file':
                    response = await this.handleFileMessage(request);
                    break;
                case 'system':
                    response = await this.handleSystemMessage(request);
                    break;
                default:
                    response = await this.handleChatMessage(request);
            }

            response.metadata = {
                processingTime: Date.now() - startTime,
                confidence: response.metadata?.confidence || 0.7,
                model: response.metadata?.model || 'unified',
                tokens: response.metadata?.tokens || 100,
                usedServices: [request.type]
            };

            return response;
        } catch (error) {
            console.error('통합 메시지 서비스 오류:', error);
            return this.createFallbackResponse(request);
        }
    }

    private async handleChatMessage(request: UnifiedMessageRequest): Promise<UnifiedMessageResponse> {
        const startTime = Date.now();
        try {
            const response = await fetch(`${this.baseUrls.ai}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: request.content,
                    context: request.context,
                    options: request.options
                })
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    message: {
                        id: `chat_${Date.now()}`,
                        content: data.message.content,
                        sender: data.message.sender as 'user' | 'ai' | 'system',
                        timestamp: data.message.timestamp,
                        type: 'text',
                        metadata: data.metadata
                    },
                    metadata: {
                        processingTime: Date.now() - startTime,
                        confidence: data.metadata?.confidence || 0.8,
                        model: 'advanced-ai',
                        tokens: data.metadata?.tokens || 100,
                        usedServices: ['ai-chat']
                    }
                };
            }
        } catch (error) {
            console.error('AI 채팅 오류:', error);
        }

        return this.createFallbackResponse(request);
    }

    private async handleAnalysisMessage(request: UnifiedMessageRequest): Promise<UnifiedMessageResponse> {
        const startTime = Date.now();
        try {
            const response = await fetch(`${this.baseUrls.ai}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: request.content,
                    context: request.context
                })
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    message: {
                        id: `analysis_${Date.now()}`,
                        content: `📊 분석 결과:\n${data.analysis}`,
                        sender: 'ai',
                        timestamp: new Date().toISOString(),
                        type: 'text',
                        metadata: data.metadata
                    },
                    metadata: {
                        processingTime: Date.now() - startTime,
                        confidence: data.confidence || 0.85,
                        model: 'analysis-engine',
                        tokens: data.tokens || 200,
                        usedServices: ['ai-analysis']
                    }
                };
            }
        } catch (error) {
            console.error('분석 오류:', error);
        }

        return this.createFallbackResponse(request);
    }

    private async handleGuidanceMessage(request: UnifiedMessageRequest): Promise<UnifiedMessageResponse> {
        const startTime = Date.now();
        try {
            const response = await fetch(`${this.baseUrls.guidance}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    context: request.content,
                    preferences: request.options
                })
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    message: {
                        id: `guidance_${Date.now()}`,
                        content: `💡 메시지 가이드:\n${data.generatedMessage}`,
                        sender: 'ai',
                        timestamp: new Date().toISOString(),
                        type: 'text',
                        metadata: data.metadata
                    },
                    metadata: {
                        processingTime: Date.now() - startTime,
                        confidence: data.confidence || 0.9,
                        model: 'guidance-system',
                        tokens: data.tokens || 150,
                        usedServices: ['message-guidance']
                    }
                };
            }
        } catch (error) {
            console.error('가이드 오류:', error);
        }

        return this.createFallbackResponse(request);
    }

    private async handleProjectMessage(request: UnifiedMessageRequest): Promise<UnifiedMessageResponse> {
        const startTime = Date.now();
        try {
            const response = await fetch(`${this.baseUrls.project}/process`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: request.content,
                    context: request.context
                })
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    message: {
                        id: `project_${Date.now()}`,
                        content: `📁 프로젝트 정보:\n${data.response}`,
                        sender: 'ai',
                        timestamp: new Date().toISOString(),
                        type: 'text',
                        metadata: data.metadata
                    },
                    metadata: {
                        processingTime: Date.now() - startTime,
                        confidence: data.confidence || 0.8,
                        model: 'project-manager',
                        tokens: data.tokens || 120,
                        usedServices: ['project-management']
                    }
                };
            }
        } catch (error) {
            console.error('프로젝트 오류:', error);
        }

        return this.createFallbackResponse(request);
    }

    private async handleFileMessage(request: UnifiedMessageRequest): Promise<UnifiedMessageResponse> {
        const startTime = Date.now();
        try {
            const response = await fetch(`${this.baseUrls.file}/process`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: request.content,
                    context: request.context
                })
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    message: {
                        id: `file_${Date.now()}`,
                        content: `📂 파일 정보:\n${data.response}`,
                        sender: 'ai',
                        timestamp: new Date().toISOString(),
                        type: 'text',
                        metadata: data.metadata
                    },
                    metadata: {
                        processingTime: Date.now() - startTime,
                        confidence: data.confidence || 0.85,
                        model: 'file-processor',
                        tokens: data.tokens || 100,
                        usedServices: ['file-management']
                    }
                };
            }
        } catch (error) {
            console.error('파일 오류:', error);
        }

        return this.createFallbackResponse(request);
    }

    private async handleSystemMessage(request: UnifiedMessageRequest): Promise<UnifiedMessageResponse> {
        const startTime = Date.now();
        try {
            const response = await fetch(`${this.baseUrls.system}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: request.content,
                    context: request.context
                })
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    message: {
                        id: `system_${Date.now()}`,
                        content: `⚙️ 시스템 상태:\n${data.response}`,
                        sender: 'ai',
                        timestamp: new Date().toISOString(),
                        type: 'text',
                        metadata: data.metadata
                    },
                    metadata: {
                        processingTime: Date.now() - startTime,
                        confidence: data.confidence || 0.95,
                        model: 'system-monitor',
                        tokens: data.tokens || 80,
                        usedServices: ['system-monitoring']
                    }
                };
            }
        } catch (error) {
            console.error('시스템 오류:', error);
        }

        return this.createFallbackResponse(request);
    }

    private createFallbackResponse(request: UnifiedMessageRequest): UnifiedMessageResponse {
        const startTime = Date.now();
        const fallbackContent = this.generateFallbackContent(request);

        return {
            success: false,
            message: {
                id: `fallback_${Date.now()}`,
                content: fallbackContent,
                sender: 'ai',
                timestamp: new Date().toISOString(),
                type: 'text'
            },
            metadata: {
                processingTime: Date.now() - startTime,
                confidence: 0.6,
                model: 'fallback',
                tokens: 50,
                usedServices: ['fallback']
            }
        };
    }

    private generateFallbackContent(request: UnifiedMessageRequest): string {
        const { type, content } = request;

        const fallbackMessages = {
            chat: `안녕하세요! "${content}"에 대해 이야기해보겠습니다. CORBU.AI가 도와드릴게요!\n\n현재 오프라인 모드로 작동 중입니다. 백엔드 서버 연결 후 더 정확한 응답을 받을 수 있습니다.\n\n사용 가능한 기능:\n• 분석: "분석" 키워드 포함\n• 가이드: "가이드" 키워드 포함\n• 프로젝트: "프로젝트" 키워드 포함\n• 파일: "파일" 키워드 포함\n• 시스템: "시스템" 키워드 포함`,
            analysis: `📊 분석 결과 (오프라인 모드):\n"${content}"에 대한 기본 분석을 제공합니다.\n\n• 키워드: ${content.split(' ').slice(0, 5).join(', ')}\n• 길이: ${content.length}자\n• 감정: 중립적\n• 의도: 정보 요청\n• 복잡도: ${content.length > 50 ? '높음' : '보통'}\n\n백엔드 서버 연결 후 더 정확한 분석을 받을 수 있습니다.`,
            guidance: `💡 메시지 가이드 (오프라인 모드):\n"${content}"에 대한 기본 가이드를 제공합니다.\n\n권장 사항:\n• 톤: 정중하고 명확한 톤 사용\n• 구조: 인사 → 내용 → 마무리\n• 길이: 상황에 맞는 적절한 길이\n• 키워드: 핵심 내용 강조\n\n예시 응답:\n"안녕하세요. 말씀하신 내용을 잘 이해했습니다. [구체적인 답변]. 추가 문의사항이 있으시면 언제든 연락주세요."\n\n백엔드 서버 연결 후 더 상세한 가이드를 받을 수 있습니다.`,
            project: `📁 프로젝트 정보 (오프라인 모드):\n"${content}"에 대한 기본 프로젝트 정보를 제공합니다.\n\n사용 가능한 프로젝트:\n• 개포우성7차 - 재개발 프로젝트\n• 잠실우성 - 개발 프로젝트\n• 기타 프로젝트들\n\n프로젝트별 상세 정보:\n• 파일 목록\n• 진행 상황\n• 관련 문서\n• 팀 구성\n\n백엔드 서버 연결 후 더 자세한 프로젝트 정보를 받을 수 있습니다.`,
            file: `📄 파일 처리 (오프라인 모드):\n"${content}"에 대한 기본 파일 정보를 제공합니다.\n\n업로드된 파일:\n• [인증]행복한소유☆개포우성7차.txt (50KB)\n• 개포우성7차_대화요약.pdf (120KB)\n• 시공사_평가자료.xlsx (85KB)\n• 프로젝트_진행상황.docx (200KB)\n\n파일 기능:\n• 검색 및 필터링\n• 다운로드\n• 미리보기\n• 메타데이터 확인\n\n백엔드 서버 연결 후 더 정확한 파일 정보를 받을 수 있습니다.`,
            system: `⚙️ 시스템 상태 (오프라인 모드):\n"${content}"에 대한 기본 시스템 정보를 제공합니다.\n\n현재 상태:\n• 프론트엔드: 정상 동작 ✅\n• 백엔드: 연결 중 🔄\n• AI 엔진: 오프라인 모드\n• 데이터베이스: 로컬 캐시\n• 메모리 사용량: 45%\n• 응답 시간: 평균 200ms\n\n시스템 기능:\n• 실시간 모니터링\n• 성능 최적화\n• 오류 로깅\n• 자동 복구\n\n백엔드 서버 연결 후 더 정확한 시스템 상태를 확인할 수 있습니다.`
        };

        return fallbackMessages[type] || fallbackMessages.chat;
    }

    // 대화형 명령 처리
    async processConversationCommand(text: string): Promise<UnifiedMessageResponse> {
        const lowerText = text.toLowerCase();

        if (lowerText.includes('분석') || lowerText.includes('analyze')) {
            return this.processMessage({
                type: 'analysis',
                content: text,
                options: { style: 'professional', length: 'medium' }
            });
        }

        if (lowerText.includes('가이드') || lowerText.includes('guidance')) {
            return this.processMessage({
                type: 'guidance',
                content: text,
                options: { style: 'friendly', length: 'medium' }
            });
        }

        if (lowerText.includes('프로젝트') || lowerText.includes('project')) {
            return this.processMessage({
                type: 'project',
                content: text,
                options: { style: 'professional', length: 'medium' }
            });
        }

        if (lowerText.includes('파일') || lowerText.includes('file')) {
            return this.processMessage({
                type: 'file',
                content: text,
                options: { style: 'professional', length: 'short' }
            });
        }

        if (lowerText.includes('시스템') || lowerText.includes('system') || lowerText.includes('상태')) {
            return this.processMessage({
                type: 'system',
                content: text,
                options: { style: 'formal', length: 'short' }
            });
        }

        // 기본 채팅 처리
        return this.processMessage({
            type: 'chat',
            content: text,
            options: { style: 'friendly', length: 'medium' }
        });
    }
}

export default new UnifiedMessageService(); 