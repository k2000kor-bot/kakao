import {
    API_SESSION_ENHANCED_WRITING_SEGMENT,
    API_SESSIONS_LIST_PATH,
    joinApiHealthCheckUrl,
    resolveApiBaseUrl,
} from '../config/api';
import { errorLogger, toError } from '../utils/errorLogger';

export interface WritingRequest {
    writingType: string;
    targetAudience: string;
    writingGoal: string;
    tone: string;
    length: string;
    keywords: string[];
    context: string;
    fileContexts: unknown[];
}

export interface WritingResponse {
    success: boolean;
    content: string;
    confidence: number;
    persuasionScore: number;
    readability: number;
    emotionalImpact: number;
    suggestions: string[];
    usedContexts: string[];
    generatedInsights: string[];
    error?: string;
}

export class EnhancedWritingService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = resolveApiBaseUrl();
    }

    /**
     * 고도화된 글쓰기 생성
     */
    async generateEnhancedWriting(
        sessionId: string,
        request: WritingRequest
    ): Promise<WritingResponse> {
        try {
            const response = await fetch(
                joinApiHealthCheckUrl(
                    this.baseUrl,
                    `${API_SESSIONS_LIST_PATH}/${encodeURIComponent(sessionId)}${API_SESSION_ENHANCED_WRITING_SEGMENT}`,
                ),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(request),
                },
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            const err = toError(error);
            errorLogger.error('고도화된 글쓰기 생성 실패', err, {
                component: 'enhancedWritingService',
                action: 'generateEnhancedWriting',
                writingType: request.writingType,
                targetAudience: request.targetAudience,
            });
            return {
                success: false,
                content: '',
                confidence: 0,
                persuasionScore: 0,
                readability: 0,
                emotionalImpact: 0,
                suggestions: [],
                usedContexts: [],
                generatedInsights: [],
                error: error instanceof Error ? error.message : '알 수 없는 오류'
            };
        }
    }

    /**
     * 글쓰기 품질 분석
     */
    analyzeWritingQuality(content: string): {
        readability: number;
        persuasionScore: number;
        emotionalImpact: number;
        suggestions: string[];
    } {
        // 간단한 텍스트 분석 (실제로는 더 정교한 분석 필요)
        const wordCount = content.split(' ').length;
        const sentenceCount = content.split(/[.!?]+/).length;
        const avgSentenceLength = wordCount / sentenceCount;

        // 가독성 점수 계산
        let readability = 0.85;
        if (avgSentenceLength < 15) readability += 0.1;
        if (avgSentenceLength > 25) readability -= 0.1;

        // 설득력 점수 계산
        let persuasionScore = 0.8;
        const persuasiveWords = ['중요', '필요', '당연', '확실', '분명', '효과', '결과', '성공'];
        const foundPersuasiveWords = persuasiveWords.filter(word => content.includes(word)).length;
        persuasionScore += foundPersuasiveWords * 0.02;

        // 감정적 영향 점수 계산
        let emotionalImpact = 0.7;
        const emotionalWords = ['감동', '희망', '기대', '감사', '사랑', '행복', '슬픔', '분노'];
        const foundEmotionalWords = emotionalWords.filter(word => content.includes(word)).length;
        emotionalImpact += foundEmotionalWords * 0.03;

        // 제안사항 생성
        const suggestions: string[] = [];
        if (readability < 0.8) suggestions.push('문장을 더 간결하게 작성해보세요');
        if (persuasionScore < 0.8) suggestions.push('설득력 있는 단어를 더 사용해보세요');
        if (emotionalImpact < 0.7) suggestions.push('감정적 표현을 추가해보세요');

        return {
            readability: Math.min(readability, 1.0),
            persuasionScore: Math.min(persuasionScore, 1.0),
            emotionalImpact: Math.min(emotionalImpact, 1.0),
            suggestions
        };
    }

    /**
     * 파일 문맥 분석
     */
    analyzeFileContexts(files: Record<string, unknown>[]): Record<string, unknown>[] {
        return files.map(file => ({
            fileId: file.id,
            fileName: file.name,
            fileType: file.type,
            extractedText: file.extractedText ?? '',
            summary: file.summary ?? '파일 분석 완료',
            keywords: file.keywords ?? [],
            sentiment: file.sentiment ?? 'neutral',
            confidence: file.confidence ?? 0.8,
            relevance: this.calculateRelevance(file)
        }));
    }

    /**
     * 관련성 계산
     */
    private calculateRelevance(file: Record<string, unknown>): number {
        const keywords = file.keywords as unknown[] | undefined;
        const keywordScore = (keywords?.length ?? 0) * 0.1;
        const confidenceScore = (file.confidence as number) ?? 0;
        const sentimentScore = file.sentiment === 'positive' ? 0.2 : 0;

        return Math.min(keywordScore + confidenceScore + sentimentScore, 1.0);
    }

    /**
     * 문맥 기반 인사이트 생성
     */
    generateContextualInsights(fileContexts: Record<string, unknown>[]): string[] {
        return fileContexts.map(context => {
            const keywords = (context.keywords as unknown[]) ?? [];
            const confidence = (context.confidence as number) ?? 0;
            const summary = String(context.summary ?? '');
            const relevance = (context.relevance as number) ?? 0;
            const insights = [
                `${context.fileName}에서 "${keywords.join(', ')}" 키워드가 발견되었습니다.`,
                `${context.fileName}의 감정 분석 결과: ${context.sentiment} (신뢰도: ${(confidence * 100).toFixed(1)}%)`,
                `${context.fileName}의 요약: ${summary}`,
                `${context.fileName}의 관련성 점수: ${(relevance * 100).toFixed(1)}%`
            ];

            return insights[Math.floor(Math.random() * insights.length)];
        });
    }

    /**
     * 글쓰기 템플릿 제공
     */
    getWritingTemplates(): Record<string, Record<string, string>> {
        return {
            persuasive: {
                formal: "공식적이고 설득력 있는 메시지를 작성합니다.",
                friendly: "친근하면서도 설득력 있는 메시지를 작성합니다.",
                authoritative: "전문적이고 권위 있는 메시지를 작성합니다."
            },
            informative: {
                formal: "정확하고 상세한 정보를 제공합니다.",
                friendly: "이해하기 쉬운 정보를 제공합니다.",
                authoritative: "전문적이고 깊이 있는 정보를 제공합니다."
            },
            emotional: {
                formal: "감정적이면서도 적절한 메시지를 작성합니다.",
                friendly: "따뜻하고 감정적인 메시지를 작성합니다.",
                authoritative: "강력하면서도 감정적인 메시지를 작성합니다."
            },
            logical: {
                formal: "논리적이고 체계적인 메시지를 작성합니다.",
                friendly: "이해하기 쉬운 논리적 메시지를 작성합니다.",
                authoritative: "전문적이고 논리적인 메시지를 작성합니다."
            },
            storytelling: {
                formal: "구조화된 스토리로 메시지를 전달합니다.",
                friendly: "친근한 스토리로 메시지를 전달합니다.",
                authoritative: "강력한 스토리로 메시지를 전달합니다."
            }
        };
    }
}

export const enhancedWritingService = new EnhancedWritingService();
export default enhancedWritingService; 