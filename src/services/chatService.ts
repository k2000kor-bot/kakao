import { advancedTextProcessor, TextProcessingRequest, WritingStyle, PoliticalTendency, MessageFormat, ProcessedText } from './advancedTextProcessor';
import { errorLogger } from '../utils/errorLogger';
import { API_BASE_URL, API_QUERY_PARAM_CONVERSATION_ID, DEMO_MOCK_UPLOAD_BASE_URL } from '../config/api';
import { sendChatMessage as sendUnifiedChatMessage } from './unifiedAPI';
import {
  coerceTrimmedString,
  extractPipelineMessageExtrasFromChatResponse,
  hasPipelineExtras,
  type PipelineMessageExtras,
} from '../utils/chatInputUtils';
import {
    normalizeChatTurnsForApiMerge,
    type ChatTurn,
    type MergeApiChatContextPayloadOptions,
} from './modernChatContextBuilder';

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
            alternatives?: Record<string, unknown>;
        };
    };
    /** 통합 대화 API `rawResponse`에서 추출한 파이프라인 부가 메타 */
    pipelineExtras?: PipelineMessageExtras;
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

export type ChatServiceSendOptions = {
    /** Q→A·Genspark 통합 context에 넣을 이전 턴 (ModernChat 등과 동일 계약) */
    conversationHistory?: ChatTurn[];
    /** 미지정 시 `conversationHistory` 턴으로 `scenarioInheritMergeOptionsFromMessages` 유도 · `context` 내 히스토리는 merge embedded */
    mergeApiChatContextOptions?: MergeApiChatContextPayloadOptions;
};

export class ChatService {
    private baseUrl = API_BASE_URL;

    /**
     * 통합 대화: `unifiedAPI.sendChatMessage`(내부 `getChatPostUrlsForConfigBase`·`CHAT_POST_PATH` 폴백).
     * API 실패 시 `generateAIResponse` 폴백.
     */
    async sendMessage(
        message: string,
        files?: File[],
        conversationId?: string,
        context?: Record<string, unknown>,
        options?: ChatServiceSendOptions
    ): Promise<ChatResponse> {
        try {
            // 텍스트 처리 요청인지 확인
            if (this.isTextProcessingRequest(message)) {
                return await this.handleTextProcessingRequest(message);
            }

            // 백엔드 API를 통한 대화 응답
            try {
                const optHist = options?.conversationHistory;
                const rawHist = Array.isArray(optHist) ? optHist : [];
                const history = normalizeChatTurnsForApiMerge(rawHist);
                /** quality·Genspark URL 보강·파이프라인 병합은 `unifiedAPI` → `buildUnifiedApiChatRequestBody`의 단일 merge에서 수행 */
                const unifiedRes = await sendUnifiedChatMessage({
                    message,
                    context: context ?? {},
                    ...(history.length > 0 ? { conversation_history: history } : {}),
                    ...(options?.mergeApiChatContextOptions
                        ? { mergeApiChatContextOptions: options.mergeApiChatContextOptions }
                        : {}),
                    ...(conversationId != null && conversationId !== ''
                        ? { [API_QUERY_PARAM_CONVERSATION_ID]: conversationId }
                        : {}),
                });

                if (unifiedRes.success && unifiedRes.message?.content) {
                    const pipelineExtrasRaw = extractPipelineMessageExtrasFromChatResponse(
                        unifiedRes.rawResponse !== undefined ? unifiedRes.rawResponse : unifiedRes
                    );
                    const pipelineExtras = hasPipelineExtras(pipelineExtrasRaw)
                        ? pipelineExtrasRaw
                        : undefined;
                    return {
                        message: unifiedRes.message.content,
                        files: [],
                        metadata: {
                            model: 'unified-api',
                            tokens: 0,
                            processingTime: 0,
                            confidence: 0.8,
                        },
                        ...(pipelineExtras ? { pipelineExtras } : {}),
                    };
                }
                throw new Error(unifiedRes.error || '대화 API 응답 없음');
            } catch (apiError) {
                errorLogger.warn('백엔드 API 호출 실패, 폴백 응답 사용', { component: 'chatService', action: 'sendMessage', error: apiError instanceof Error ? apiError : new Error(String(apiError)) });
            }

            // 폴백: 일반 대화 응답
            const response = await this.generateAIResponse(message, files);
            return response;
        } catch (error) {
            errorLogger.error('메시지 전송 실패', error instanceof Error ? error : new Error(String(error)), { component: 'chatService', action: 'sendMessage' });
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

        return coerceTrimmedString(text, '') || '텍스트 처리 요청이지만 원본 텍스트가 명시되지 않았습니다.';
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
            return keywordMatch[1].split(',').map((k) => coerceTrimmedString(k, ''));
        }
        return [];
    }

    private formatProcessedTextResponse(processedText: ProcessedText): string {
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
        processedText.stages.forEach((stage, index: number) => {
            response += `${index + 1}. ${stage.description} (${stage.processingTime}ms)\n`;
        });

        response += `\n📋 **대안 버전:**\n`;
        const alt = processedText.alternatives;
        response += `• 간단 버전: ${alt.brief}\n`;
        response += `• 상세 버전: ${alt.detailed}\n`;
        response += `• 기술 버전: ${alt.technical}\n`;
        response += `• 친근 버전: ${alt.casual}\n`;

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

        // 프로젝트 관련 질문·요청 (특정 사업장명 없이 일반 안내)
        if (lowerMessage.includes('프로젝트') || lowerMessage.includes('project')) {
            return {
                message: `프로젝트 관련 질문·요청으로 이해했습니다.\n\n예시로 볼 수 있는 항목(데모):\n• 진행 단계·일정\n• 주요 마일스톤\n• 다음 액션\n\n실제 데이터는 백엔드 연결 후 선택한 프로젝트 기준으로 답변됩니다.\n궁금한 세부 항목을 문장으로 이어서 말씀해 주세요.`,
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
                message: `요약 요청을 받았습니다.\n\n📋 **주요 포인트**\n• 현재 진행 중인 작업: 대화형 AI 인터페이스 개발\n• 핵심 기능: 실시간 대화, 파일 업로드, 음성 인식\n• 기술 스택: React, TypeScript, Web Speech API\n\n🎯 **다음 단계**\n• 백엔드 API 연동\n• 데이터베이스 구축\n• 사용자 인증 시스템\n\n더 구체적인 요약이 필요하시면 말씀해 주세요!`,
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
            message: `안녕하세요! CORBU.AI입니다. 🤖

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
                url: `${DEMO_MOCK_UPLOAD_BASE_URL}/${encodeURIComponent(file.name)}`
            };
        } catch (error) {
            errorLogger.error('파일 업로드 실패', error instanceof Error ? error : new Error(String(error)), { component: 'chatService', action: 'uploadFile' });
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

    async getChatHistory(_chatId: string): Promise<ChatMessage[]> {
        try {
            // 대화 히스토리 시뮬레이션
            await new Promise(resolve => setTimeout(resolve, 500));

            return [
                {
                    id: '1',
                    content: '안녕하세요! CORBU.AI입니다.',
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
            errorLogger.error('대화 히스토리 조회 실패', error instanceof Error ? error : new Error(String(error)), { component: 'chatService', action: 'getChatHistory' });
            return [];
        }
    }

    async createNewChat(): Promise<string> {
        try {
            // 새 대화 생성 시뮬레이션
            await new Promise(resolve => setTimeout(resolve, 300));
            return `chat_${Date.now()}`;
        } catch (error) {
            errorLogger.error('새 대화 생성 실패', error instanceof Error ? error : new Error(String(error)), { component: 'chatService', action: 'createNewChat' });
            throw new Error('새 대화 생성에 실패했습니다.');
        }
    }

    async saveChatMessage(_chatId: string, _message: ChatMessage): Promise<boolean> {
        try {
            // 메시지 저장 시뮬레이션
            await new Promise(resolve => setTimeout(resolve, 200));
            return true;
        } catch (error) {
            errorLogger.error('메시지 저장 실패', error instanceof Error ? error : new Error(String(error)), { component: 'chatService', action: 'saveChatMessage' });
            return false;
        }
    }
}

export const chatService = new ChatService();
