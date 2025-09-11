import { advancedTextProcessor, TextProcessingRequest, WritingStyle, PoliticalTendency, MessageFormat } from './advancedTextProcessor';

export interface ChatMessage {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: Date;
    files?: string[];
    metadata?: {
        model?: string;
        tokens?: number;
        processingTime?: number;
        textProcessing?: {
            style?: WritingStyle;
            politicalContext?: PoliticalTendency;
            format?: MessageFormat;
        };
    };
}

export interface ChatResponse {
    message: string;
    files?: string[];
    metadata?: {
        model: string;
        tokens: number;
        processingTime: number;
        confidence: number;
        textProcessing?: {
            stages?: string[];
            alternatives?: any;
        };
    };
}

export interface FileUploadResponse {
    success: boolean;
    fileId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    url?: string;
    error?: string;
}

class ChatService {
    private baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

    async sendMessage(message: string, files?: File[]): Promise<ChatResponse> {
        try {
            // 텍스트 처리 요청인지 확인
            if (this.isTextProcessingRequest(message)) {
                return await this.handleTextProcessingRequest(message);
            }

            // 일반 채팅 응답
            const response = await this.generateAIResponse(message, files);
            return response;
        } catch (error) {
            console.error('Error sending message:', error);
            throw new Error('메시지 전송에 실패했습니다. 다시 시도해 주세요.');
        }
    }

    private isTextProcessingRequest(message: string): boolean {
        const processingKeywords = [
            '글쓰기', '스타일', '정치', '형식', '가공', '수정', '변환', '조정',
            'formal', 'casual', 'professional', 'academic', 'creative',
            'neutral', 'progressive', 'conservative', 'centrist',
            'narrative', 'analytical', 'persuasive', 'comparative'
        ];

        const lowerMessage = message.toLowerCase();
        return processingKeywords.some(keyword => lowerMessage.includes(keyword));
    }

    private async handleTextProcessingRequest(message: string): Promise<ChatResponse> {
        // 텍스트 처리 요청 파싱
        const request = this.parseTextProcessingRequest(message);

        // 고급 텍스트 처리 실행
        const processedText = await advancedTextProcessor.processText(request);

        return {
            message: this.formatProcessedTextResponse(processedText),
            files: [],
            metadata: {
                model: 'advanced-text-processor',
                tokens: processedText.metadata.finalLength,
                processingTime: processedText.metadata.processingTime,
                confidence: 0.95,
                textProcessing: {
                    stages: processedText.stages.map(stage => stage.name),
                    alternatives: processedText.alternatives
                }
            }
        };
    }

    private parseTextProcessingRequest(message: string): TextProcessingRequest {
        const lowerMessage = message.toLowerCase();

        // 기본 스타일 설정
        let targetStyle: WritingStyle = {
            tone: 'friendly',
            complexity: 'moderate',
            formality: 'neutral',
            audience: 'general',
            purpose: 'inform'
        };

        // 톤 분석
        if (lowerMessage.includes('formal') || lowerMessage.includes('공식')) {
            targetStyle.tone = 'formal';
            targetStyle.formality = 'formal';
        } else if (lowerMessage.includes('casual') || lowerMessage.includes('친근')) {
            targetStyle.tone = 'casual';
            targetStyle.formality = 'casual';
        } else if (lowerMessage.includes('professional') || lowerMessage.includes('전문')) {
            targetStyle.tone = 'professional';
            targetStyle.audience = 'business';
        } else if (lowerMessage.includes('academic') || lowerMessage.includes('학술')) {
            targetStyle.tone = 'academic';
            targetStyle.audience = 'expert';
            targetStyle.purpose = 'educate';
        } else if (lowerMessage.includes('creative') || lowerMessage.includes('창의')) {
            targetStyle.tone = 'creative';
            targetStyle.purpose = 'entertain';
        }

        // 복잡도 분석
        if (lowerMessage.includes('simple') || lowerMessage.includes('간단')) {
            targetStyle.complexity = 'simple';
        } else if (lowerMessage.includes('complex') || lowerMessage.includes('복잡')) {
            targetStyle.complexity = 'complex';
        }

        // 목적 분석
        if (lowerMessage.includes('persuade') || lowerMessage.includes('설득')) {
            targetStyle.purpose = 'persuade';
        } else if (lowerMessage.includes('analyze') || lowerMessage.includes('분석')) {
            targetStyle.purpose = 'analyze';
        }

        // 정치적 성향 설정
        let politicalContext: PoliticalTendency = {
            bias: 'neutral',
            perspective: 'balanced',
            approach: 'objective'
        };

        if (lowerMessage.includes('progressive') || lowerMessage.includes('진보')) {
            politicalContext.bias = 'progressive';
            politicalContext.perspective = 'left_leaning';
        } else if (lowerMessage.includes('conservative') || lowerMessage.includes('보수')) {
            politicalContext.bias = 'conservative';
            politicalContext.perspective = 'right_leaning';
        } else if (lowerMessage.includes('centrist') || lowerMessage.includes('중도')) {
            politicalContext.bias = 'centrist';
            politicalContext.perspective = 'moderate';
        }

        // 메시지 형식 설정
        let format: MessageFormat = {
            structure: 'descriptive',
            length: 'moderate',
            organization: 'logical',
            emphasis: 'facts'
        };

        if (lowerMessage.includes('narrative') || lowerMessage.includes('서사')) {
            format.structure = 'narrative';
            format.emphasis = 'stories';
        } else if (lowerMessage.includes('analytical') || lowerMessage.includes('분석')) {
            format.structure = 'analytical';
            format.emphasis = 'data';
        } else if (lowerMessage.includes('persuasive') || lowerMessage.includes('설득')) {
            format.structure = 'persuasive';
            format.emphasis = 'opinions';
        } else if (lowerMessage.includes('comparative') || lowerMessage.includes('비교')) {
            format.structure = 'comparative';
            format.emphasis = 'facts';
        }

        // 길이 설정
        if (lowerMessage.includes('brief') || lowerMessage.includes('간단')) {
            format.length = 'brief';
        } else if (lowerMessage.includes('detailed') || lowerMessage.includes('상세')) {
            format.length = 'detailed';
        } else if (lowerMessage.includes('comprehensive') || lowerMessage.includes('종합')) {
            format.length = 'comprehensive';
        }

        // 원본 텍스트 추출 (처리 요청 부분 제외)
        const originalText = this.extractOriginalText(message);

        return {
            originalText,
            targetStyle,
            politicalContext,
            format,
            additionalRequirements: this.extractRequirements(message),
            targetLength: this.extractTargetLength(message),
            keywords: this.extractKeywords(message)
        };
    }

    private extractOriginalText(message: string): string {
        // 처리 요청 키워드들을 제거하고 원본 텍스트 추출
        const processingKeywords = [
            '글쓰기', '스타일', '정치', '형식', '가공', '수정', '변환', '조정',
            'formal', 'casual', 'professional', 'academic', 'creative',
            'neutral', 'progressive', 'conservative', 'centrist',
            'narrative', 'analytical', 'persuasive', 'comparative',
            'simple', 'complex', 'brief', 'detailed', 'comprehensive'
        ];

        let text = message;
        processingKeywords.forEach(keyword => {
            const regex = new RegExp(keyword, 'gi');
            text = text.replace(regex, '');
        });

        return text.trim() || '텍스트 처리 요청이지만 원본 텍스트가 명시되지 않았습니다.';
    }

    private extractRequirements(message: string): string[] {
        const requirements: string[] = [];
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('감정') || lowerMessage.includes('emotion')) {
            requirements.push('감정적 요소 포함');
        }
        if (lowerMessage.includes('데이터') || lowerMessage.includes('data')) {
            requirements.push('데이터 기반 설명');
        }
        if (lowerMessage.includes('예시') || lowerMessage.includes('example')) {
            requirements.push('구체적 예시 포함');
        }
        if (lowerMessage.includes('통계') || lowerMessage.includes('statistics')) {
            requirements.push('통계적 정보 포함');
        }

        return requirements;
    }

    private extractTargetLength(message: string): number | undefined {
        const lengthMatch = message.match(/(\d+)\s*(글자|자|character|word)/i);
        if (lengthMatch) {
            return parseInt(lengthMatch[1]);
        }
        return undefined;
    }

    private extractKeywords(message: string): string[] {
        const keywordMatch = message.match(/키워드[:\s]*([^,]+)/i);
        if (keywordMatch) {
            return keywordMatch[1].split(',').map(k => k.trim());
        }
        return [];
    }

    private formatProcessedTextResponse(processedText: any): string {
        let response = `📝 **고급 텍스트 가공 완료**\n\n`;

        response += `**최종 결과:**\n${processedText.finalContent}\n\n`;

        response += `📊 **처리 정보:**\n`;
        response += `• 원본 길이: ${processedText.metadata.originalLength}자\n`;
        response += `• 최종 길이: ${processedText.metadata.finalLength}자\n`;
        response += `• 처리 시간: ${processedText.metadata.processingTime}ms\n`;
        response += `• 가독성 점수: ${processedText.metadata.readabilityScore.toFixed(1)}/100\n`;
        response += `• 복잡도: ${processedText.metadata.complexityLevel}\n`;
        response += `• 감정: ${processedText.metadata.sentiment}\n\n`;

        response += `🔄 **처리 단계:**\n`;
        processedText.stages.forEach((stage: any, index: number) => {
            response += `${index + 1}. ${stage.description} (${stage.processingTime}ms)\n`;
        });

        response += `\n📋 **대안 버전:**\n`;
        response += `• 간단 버전: ${processedText.alternatives.brief.substring(0, 100)}...\n`;
        response += `• 상세 버전: ${processedText.alternatives.detailed.substring(0, 100)}...\n`;
        response += `• 기술 버전: ${processedText.alternatives.technical.substring(0, 100)}...\n`;
        response += `• 친근 버전: ${processedText.alternatives.casual.substring(0, 100)}...\n`;

        return response;
    }

    private async generateAIResponse(message: string, files?: File[]): Promise<ChatResponse> {
        // 메시지 내용에 따른 지능적인 응답 생성
        const lowerMessage = message.toLowerCase();

        // 파일이 첨부된 경우
        if (files && files.length > 0) {
            const fileNames = files.map(f => f.name).join(', ');
            return {
                message: `첨부된 파일 "${fileNames}"을 분석했습니다.\n\n파일 내용을 바탕으로 다음과 같은 정보를 제공할 수 있습니다:\n\n• 문서 요약\n• 주요 키워드 추출\n• 데이터 분석\n• 질문에 대한 답변\n\n어떤 분석을 원하시나요?`,
                files: [],
                metadata: {
                    model: 'gpt-4o',
                    tokens: 150,
                    processingTime: 1200,
                    confidence: 0.95
                }
            };
        }

        // 프로젝트 관련 질문
        if (lowerMessage.includes('프로젝트') || lowerMessage.includes('개포우성')) {
            return {
                message: `개포우성7차 프로젝트에 대해 질문하셨네요!\n\n현재 프로젝트 상태:\n• 진행률: 75%\n• 주요 마일스톤: 설계 검토 완료\n• 다음 단계: 시공 계획 수립\n\n어떤 세부사항을 알고 싶으신가요?\n\n- 프로젝트 일정\n- 예산 현황\n- 기술 사양\n- 이해관계자 정보`,
                files: [],
                metadata: {
                    model: 'gpt-4o',
                    tokens: 200,
                    processingTime: 800,
                    confidence: 0.92
                }
            };
        }

        // 요약 요청
        if (lowerMessage.includes('요약') || lowerMessage.includes('정리')) {
            return {
                message: `요약 요청을 받았습니다.\n\n📋 **주요 포인트**\n• 현재 진행 중인 작업: 대화형 AI 인터페이스 개발\n• 핵심 기능: 실시간 채팅, 파일 업로드, 음성 인식\n• 기술 스택: React, TypeScript, Web Speech API\n\n🎯 **다음 단계**\n• 백엔드 API 연동\n• 데이터베이스 구축\n• 사용자 인증 시스템\n\n더 구체적인 요약이 필요하시면 말씀해 주세요!`,
                files: [],
                metadata: {
                    model: 'gpt-4o',
                    tokens: 180,
                    processingTime: 1000,
                    confidence: 0.89
                }
            };
        }

        // 일반적인 대화
        return {
            message: `안녕하세요! CORBU AI입니다. 🤖

현재 다음과 같은 기능들을 사용하실 수 있습니다:

💬 **대화 기능**
• 일반적인 질문과 답변
• 프로젝트 관련 문의
• 문서 분석 요청

📝 **고급 텍스트 가공**
• 글쓰기 스타일 변환 (formal, casual, professional, academic, creative)
• 정치적 성향 조정 (neutral, progressive, conservative, centrist)
• 메시지 형식 구조화 (narrative, analytical, persuasive, comparative)
• 복잡도 조정 (simple, moderate, complex)

📁 **파일 처리**
• 문서 업로드 및 분석
• 이미지 인식
• 데이터 추출

🎤 **음성 인식**
• 음성으로 메시지 입력
• 실시간 음성 변환

무엇을 도와드릴까요?`,
            files: [],
            metadata: {
                model: 'gpt-4o',
                tokens: 220,
                processingTime: 1500,
                confidence: 0.96
            }
        };
    }

    async uploadFile(file: File): Promise<FileUploadResponse> {
        try {
            // 파일 업로드 시뮬레이션
            await new Promise(resolve => setTimeout(resolve, 1000));

            return {
                success: true,
                fileId: `file_${Date.now()}`,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                url: `https://example.com/uploads/${file.name}`
            };
        } catch (error) {
            console.error('Error uploading file:', error);
            return {
                success: false,
                fileId: '',
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                error: '파일 업로드에 실패했습니다.'
            };
        }
    }

    async getChatHistory(chatId: string): Promise<ChatMessage[]> {
        try {
            // 채팅 히스토리 시뮬레이션
            await new Promise(resolve => setTimeout(resolve, 500));

            return [
                {
                    id: '1',
                    content: '안녕하세요! CORBU AI입니다.',
                    isUser: false,
                    timestamp: new Date(Date.now() - 3600000),
                    metadata: {
                        model: 'gpt-4o',
                        tokens: 50,
                        processingTime: 800
                    }
                }
            ];
        } catch (error) {
            console.error('Error fetching chat history:', error);
            return [];
        }
    }

    async createNewChat(): Promise<string> {
        try {
            // 새 채팅 생성 시뮬레이션
            await new Promise(resolve => setTimeout(resolve, 300));
            return `chat_${Date.now()}`;
        } catch (error) {
            console.error('Error creating new chat:', error);
            throw new Error('새 채팅 생성에 실패했습니다.');
        }
    }

    async saveChatMessage(chatId: string, message: ChatMessage): Promise<boolean> {
        try {
            // 메시지 저장 시뮬레이션
            await new Promise(resolve => setTimeout(resolve, 200));
            return true;
        } catch (error) {
            console.error('Error saving message:', error);
            return false;
        }
    }
}

export const chatService = new ChatService();
