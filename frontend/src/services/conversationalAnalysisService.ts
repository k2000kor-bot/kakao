/**
 * 고도화된 대화형 분석 서비스
 * ChatGPT 스타일의 자연어 처리와 연구자/여론분석가 관점의 서술적 분석
 * 다양한 텍스트 조작 및 생성 기능을 통합하여 최고 수준의 응답 제공
 */

import {
    API_BASE_URL,
    API_V1_ANALYSIS_STATUS_PATH_PREFIX,
    API_V1_CONSTRUCTION_BIAS_PATH,
    API_V1_INTEGRATED_ANALYSIS_PATH,
    API_V1_KAKAO_TENDENCY_PATH,
    API_V1_OPINION_TREND_PATH,
    FALLBACK_API_ORIGIN,
    joinApiHealthCheckUrl,
} from '../config/api';
import { advancedTextAnalysisService, TextAnalysisRequest } from './advancedTextAnalysisService';
import {
    integratedWritingService,
    UnifiedWritingRequest,
    UnifiedWritingResponse,
} from './integratedWritingService';
import { MasterWritingProfile } from './masterWritingEngine';
import { politicalWritingEngine, PoliticalSpectrum, PoliticalStance, PoliticalWritingProfile, EmotionIntensity, ToneIntensity } from './politicalWritingEngine';
import { generationWritingEngine, AgeGroup, LanguageFormality } from './generationWritingEngine';
import { stanceWritingEngine, StancePosition } from './stanceWritingEngine';
import { ultimateStyleCloningService, UltimateStyleCloneRequest } from './ultimateStyleCloningService';
import { WritingStyle } from './professionalWritingEngine';
import { errorLogger, toError } from '../utils/errorLogger';
import {
    coerceTrimmedString,
    hasPipelineExtras,
    mergePipelineMessageExtras,
    type PipelineMessageExtras,
} from '../utils/chatInputUtils';

// Intent and params types for analysis flow
export interface IntentParams {
    dates?: string[];
    period?: string;
    participants?: string[];
    extractedTexts?: string[];
    analysisStyle?: string;
    outputFormat?: string;
}

export interface IntentResult {
    type: string;
    confidence: number;
    params: IntentParams;
}

export interface ConversationalRequest {
    message: string;
    roomId?: string;
    /**
     * 채팅·파이프라인에서 직접 넘기는 메타. `context.pipelineExtras`와 함께 있으면 이 값이 우선(필드 단위 병합).
     */
    pipelineExtras?: PipelineMessageExtras;
    context?: Record<string, unknown>;
}

export interface ConversationalResponse {
    type: 'analysis' | 'information' | 'error' | 'general' | 'advanced_analysis' | 'text_manipulation' | 'political_writing' | 'generation_writing' | 'stance_writing' | 'master_writing' | 'style_cloning' | 'style_analysis';
    analysisType?: 'tendency' | 'bias' | 'opinion' | 'integrated' | 'summary' | 'descriptive' | 'research' | 'expert' | 'manipulation' | 'political' | 'generational' | 'stance' | 'master' | 'style_clone' | 'style_match';
    content: string;
    data?: Record<string, unknown>;
    suggestions?: string[];
    followUpQuestions?: string[];
    researcherInsights?: string[];
    expertAssessment?: Record<string, unknown>;
    textManipulations?: {
        modification?: string;
        counterArgument?: string;
        appeal?: string;
        rebuttal?: string;
        expansion?: string;
        different_tone?: string;
        different_length?: string;
        different_structure?: string;
        different_perspective?: string;
    };
    methodologyNotes?: string;
    contextualFactors?: Record<string, unknown>;
    /** 통합 글쓰기(`processUnifiedWritingRequest`)가 돌았을 때 `metadata.pipelineExtras` 에코 */
    pipelineExtras?: PipelineMessageExtras;
    writingProfile?: MasterWritingProfile;
    styleMetrics?: Record<string, unknown>;
    writingRecommendations?: string[];
}

export class ConversationalAnalysisService {
    private readonly apiOrigin = API_BASE_URL || FALLBACK_API_ORIGIN;
    private enableAdvancedAnalysis = true; // 고급 분석 기능 활성화

    /** `request.context.pipelineExtras`에서 통합 글쓰기·하이브리드 강화로 넘길 메타 */
    private pipelineExtrasFromContext(context?: Record<string, unknown>): PipelineMessageExtras | undefined {
        const raw = context?.pipelineExtras;
        if (raw == null || typeof raw !== 'object') return undefined;
        const ex = raw as PipelineMessageExtras;
        return hasPipelineExtras(ex) ? ex : undefined;
    }

    private pipelineExtrasFromWritingMetadata(
        metadata: UnifiedWritingResponse['metadata']
    ): PipelineMessageExtras | undefined {
        const pe = metadata.pipelineExtras;
        if (pe != null && hasPipelineExtras(pe)) return pe;
        return undefined;
    }

    /** 통합 글쓰기로 넘길 파이프라인 메타: 요청 최상위 + context 병합 */
    private resolvedPipelineExtrasForUnifiedWriting(
        request: ConversationalRequest
    ): PipelineMessageExtras | undefined {
        const fromReq =
            request.pipelineExtras != null && hasPipelineExtras(request.pipelineExtras)
                ? request.pipelineExtras
                : undefined;
        const fromCtx = this.pipelineExtrasFromContext(request.context);
        if (fromReq != null && fromCtx != null) {
            const merged = mergePipelineMessageExtras(fromReq, fromCtx);
            return hasPipelineExtras(merged) ? merged : undefined;
        }
        return fromReq ?? fromCtx;
    }

    /**
     * 자연어 메시지를 분석하여 적절한 응답 생성
     */
    async processMessage(request: ConversationalRequest): Promise<ConversationalResponse> {
        const message = request.message.toLowerCase();

        // 1. 의도 분석
        const intent = this.analyzeIntent(message);

        // 2. 고급 분석 활성화 시 추가 처리
        if (this.enableAdvancedAnalysis && intent.confidence > 0.6) {
            try {
                const advancedResponse = await this.performAdvancedAnalysis(request, intent);
                if (advancedResponse) {
                    return advancedResponse;
                }
            } catch (error) {
                const err = toError(error);
                errorLogger.warn('고급 분석 실패, 기본 분석으로 전환', {
                    component: 'conversationalAnalysisService',
                    action: 'processMessage',
                    error: err.message,
                });
            }
        }

        // 3. 의도에 따른 분석 실행
        switch (intent.type) {
            case 'tendency_analysis':
                return await this.handleTendencyAnalysis(request, intent);

            case 'bias_analysis':
                return await this.handleBiasAnalysis(request, intent);

            case 'opinion_analysis':
                return await this.handleOpinionAnalysis(request, intent);

            case 'integrated_analysis':
                return await this.handleIntegratedAnalysis(request, intent);

            case 'summary_request':
                return await this.handleSummaryRequest(request, intent);

            case 'status_inquiry':
                return await this.handleStatusInquiry(request, intent);

            case 'text_manipulation':
                return await this.handleTextManipulation(request, intent);

            case 'descriptive_analysis':
                return await this.handleDescriptiveAnalysis(request, intent);

            case 'research_analysis':
                return await this.handleResearchAnalysis(request, intent);

            case 'writing_request':
                return await this.handleWritingRequest(request, intent as unknown as Record<string, unknown>);

            case 'custom_writing':
                return await this.handleCustomWriting(request, intent as unknown as Record<string, unknown>);

            case 'political_writing':
                return await this.handlePoliticalWriting(request, intent);

            case 'generation_writing':
                return await this.handleGenerationWriting(request, intent);

            case 'stance_writing':
                return await this.handleStanceWriting(request, intent);

            case 'style_cloning':
                return await this.handleStyleCloning(request, intent);

            case 'style_analysis':
                return await this.handleStyleAnalysis(request, intent);

            default:
                return await this.handleGeneralQuery(request);
        }
    }

    /**
     * 메시지에서 의도 분석
     */
    private analyzeIntent(message: string): IntentResult {
        const patterns = [
            // 성향 분석 관련
            {
                type: 'tendency_analysis',
                patterns: [
                    /성향.*분석/,
                    /참여자.*성향/,
                    /사람들.*어떻게.*생각/,
                    /의견.*분포/,
                    /긍정.*부정.*비율/,
                    /누가.*어떤.*입장/
                ]
            },

            // 편향 분석 관련
            {
                type: 'bias_analysis',
                patterns: [
                    /시공사.*편향/,
                    /건설사.*편향/,
                    /업체.*편향/,
                    /홍보.*감지/,
                    /편향.*분석/,
                    /어떤.*업체.*선호/
                ]
            },

            // 텍스트 조작 관련
            {
                type: 'text_manipulation',
                patterns: [
                    /수정.*해줘/,
                    /바꿔.*줘/,
                    /고쳐.*줘/,
                    /반박.*해줘/,
                    /반대.*의견/,
                    /호소문.*작성/,
                    /반박문.*써줘/,
                    /새로.*작성/,
                    /다시.*써줘/,
                    /개선.*해줘/
                ]
            },

            // 서술적 분석 관련
            {
                type: 'descriptive_analysis',
                patterns: [
                    /서술적.*분석/,
                    /자세히.*설명/,
                    /상세한.*분석/,
                    /깊이.*있는.*분석/,
                    /구체적.*분석/,
                    /심층.*분석/,
                    /연구자.*관점/,
                    /전문가.*시각/
                ]
            },

            // 연구 분석 관련
            {
                type: 'research_analysis',
                patterns: [
                    /연구.*분석/,
                    /학술적.*검토/,
                    /과학적.*분석/,
                    /체계적.*연구/,
                    /논문.*수준/,
                    /연구.*보고서/,
                    /학문적.*접근/
                ]
            },

            // 여론 분석 관련
            {
                type: 'opinion_analysis',
                patterns: [
                    /여론.*분석/,
                    /분위기.*어때/,
                    /전체적.*의견/,
                    /트렌드.*분석/,
                    /시간.*변화/,
                    /전반적.*반응/
                ]
            },

            // 통합 분석 관련
            {
                type: 'integrated_analysis',
                patterns: [
                    /종합.*분석/,
                    /통합.*분석/,
                    /전체.*분석/,
                    /모든.*분석/,
                    /전반적.*분석/,
                    /complete.*analysis/
                ]
            },

            // 요약 요청
            {
                type: 'summary_request',
                patterns: [
                    /요약/,
                    /정리/,
                    /summary/,
                    /핵심.*내용/,
                    /주요.*포인트/
                ]
            },

            // 상태 조회
            {
                type: 'status_inquiry',
                patterns: [
                    /상태.*어때/,
                    /진행.*상황/,
                    /현재.*상태/,
                    /분석.*진행/,
                    /status/
                ]
            },

            // 전문가 분석 관련
            {
                type: 'expert_analysis',
                patterns: [
                    /전문가.*관점/,
                    /전문가.*분석/,
                    /전문가.*의견/,
                    /전문가.*평가/,
                    /전문가.*검토/,
                    /전문적.*분석/,
                    /professional.*analysis/
                ]
            },

            // 글쓰기 요청 관련
            {
                type: 'writing_request',
                patterns: [
                    /글.*써.*줘/,
                    /글.*작성/,
                    /글.*쓰기/,
                    /문서.*작성/,
                    /보고서.*써/,
                    /논문.*써/,
                    /기사.*써/,
                    /리뷰.*써/,
                    /에세이.*써/,
                    /칼럼.*써/,
                    /.*글자.*글/,
                    /.*단어.*글/,
                    /.*문단.*글/,
                    /.*어투.*글/,
                    /.*스타일.*글/
                ]
            },

            // 맞춤형 글쓰기 요청
            {
                type: 'custom_writing',
                patterns: [
                    /.*어투로.*써/,
                    /.*스타일로.*써/,
                    /.*글자수.*써/,
                    /.*단어.*글/,
                    /.*문장.*글/,
                    /.*문단.*글/,
                    /.*형식.*글/,
                    /.*톤.*글/,
                    /.*관점.*글/,
                    /.*방식.*글/
                ]
            },

            // 정치적 성향 글쓰기
            {
                type: 'political_writing',
                patterns: [
                    /극우.*어투/,
                    /진보.*어투/,
                    /보수.*어투/,
                    /중도.*어투/,
                    /좌파.*글/,
                    /우파.*글/,
                    /강성.*어투/,
                    /강경.*어투/,
                    /전투적.*글/,
                    /공격적.*글/,
                    /militant.*어투/,
                    /aggressive.*글/
                ]
            },

            // 연령대별 어투
            {
                type: 'generation_writing',
                patterns: [
                    /50대.*어투/,
                    /60대.*어투/,
                    /70대.*어투/,
                    /80대.*어투/,
                    /노인.*어투/,
                    /어른.*어투/,
                    /연장자.*어투/,
                    /원로.*어투/,
                    /세대.*어투/,
                    /연륜.*어투/,
                    /나이.*어투/,
                    /어르신.*어투/
                ]
            },

            // 찬성/반대 논조
            {
                type: 'stance_writing',
                patterns: [
                    /찬성.*글/,
                    /반대.*글/,
                    /중립.*글/,
                    /지지.*글/,
                    /반박.*글/,
                    /옹호.*글/,
                    /비판.*글/,
                    /논박.*글/,
                    /입장.*글/,
                    /의견.*글/,
                    /support.*글/,
                    /oppose.*글/
                ]
            },

            // 스타일 복제 요청
            {
                type: 'style_cloning',
                patterns: [
                    /이.*글.*스타일/,
                    /같은.*어조.*써/,
                    /똑같은.*문체/,
                    /비슷하게.*써/,
                    /따라.*써/,
                    /모방.*해서/,
                    /복제.*해서/,
                    /동일.*스타일/,
                    /이런.*식으로.*써/,
                    /스타일.*따라/,
                    /어조.*따라/,
                    /논리.*따라/
                ]
            },

            // 스타일 분석 요청
            {
                type: 'style_analysis',
                patterns: [
                    /스타일.*분석/,
                    /어조.*분석/,
                    /문체.*분석/,
                    /글.*특징/,
                    /어떤.*스타일/,
                    /어떤.*어조/,
                    /글쓰기.*패턴/,
                    /문장.*특성/,
                    /표현.*방식/,
                    /글의.*성격/
                ]
            },

            // 방법론 관련
            {
                type: 'methodology_inquiry',
                patterns: [
                    /어떻게.*분석/,
                    /방법론.*설명/,
                    /분석.*방법/,
                    /어떤.*방식/,
                    /methodology/,
                    /어떤.*기준/
                ]
            }
        ];

        for (const category of patterns) {
            for (const pattern of category.patterns) {
                if (pattern.test(message)) {
                    return {
                        type: category.type,
                        confidence: 0.8,
                        params: this.extractParameters(message, category.type)
                    };
                }
            }
        }

        // 고급 패턴 매칭 - 더 정교한 의도 분석
        const advancedPatterns = [
            { pattern: /(.+)(을|를)\s*(수정|변경|고쳐|바꿔)/, type: 'text_manipulation', confidence: 0.9 },
            { pattern: /(.+)(에 대한|에 대해)\s*(반박|반대|비판)/, type: 'text_manipulation', confidence: 0.9 },
            { pattern: /(.+)(을|를)\s*(분석|해석|설명|검토)/, type: 'descriptive_analysis', confidence: 0.8 },
            { pattern: /(연구|학술|논문|과학).*분석/, type: 'research_analysis', confidence: 0.8 },
            { pattern: /(호소|부탁|요청|간청).*글/, type: 'text_manipulation', confidence: 0.8 },
            { pattern: /(반박|반대|비판).*글/, type: 'text_manipulation', confidence: 0.8 }
        ];

        for (const advPattern of advancedPatterns) {
            if (advPattern.pattern.test(message)) {
                return {
                    type: advPattern.type,
                    confidence: advPattern.confidence,
                    params: this.extractParameters(message, advPattern.type)
                };
            }
        }

        return { type: 'general', confidence: 0.5, params: {} };
    }

    /**
     * 메시지에서 파라미터 추출
     */
    private extractParameters(message: string, _intentType: string): IntentParams {
        const params: IntentParams = {};

        // 날짜 추출
        const datePattern = /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/g;
        const dates = message.match(datePattern);
        if (dates) {
            params.dates = dates;
        }

        // 기간 추출
        if (message.includes('오늘')) params.period = 'today';
        if (message.includes('어제')) params.period = 'yesterday';
        if (message.includes('이번 주')) params.period = 'week';
        if (message.includes('이번 달')) params.period = 'month';

        // 특정 참여자 추출
        const participantPattern = /@(\w+)/g;
        const participants = message.match(participantPattern);
        if (participants) {
            params.participants = participants.map(p => p.substring(1));
        }

        // 텍스트 추출 (따옴표나 특정 구분자로 감싸인 텍스트)
        const textPattern = /["']([^"']+)["']|『([^』]+)』|「([^」]+)」/g;
        const extractedTexts = [];
        let match;
        while ((match = textPattern.exec(message)) !== null) {
            extractedTexts.push(match[1] || match[2] || match[3]);
        }
        if (extractedTexts.length > 0) {
            params.extractedTexts = extractedTexts;
        }

        // 분석 스타일 추출
        if (message.includes('간단히')) params.analysisStyle = 'brief';
        if (message.includes('자세히') || message.includes('상세히')) params.analysisStyle = 'detailed';
        if (message.includes('학술적') || message.includes('연구')) params.analysisStyle = 'academic';
        if (message.includes('실무적') || message.includes('실용적')) params.analysisStyle = 'practical';

        // 출력 형식 추출
        if (message.includes('표로') || message.includes('차트로')) params.outputFormat = 'table';
        if (message.includes('그래프로')) params.outputFormat = 'graph';
        if (message.includes('요약으로')) params.outputFormat = 'summary';

        return params;
    }

    /**
     * 성향 분석 처리
     */
    private async handleTendencyAnalysis(request: ConversationalRequest, intent: IntentResult): Promise<ConversationalResponse> {
        try {
            const response = await fetch(joinApiHealthCheckUrl(this.apiOrigin, `${API_V1_KAKAO_TENDENCY_PATH}`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: request.message,
                    room_id: request.roomId || 'default',
                    target_participants: intent.params.participants || []
                })
            });

            const data = await response.json();

            if (data.success) {
                const analysis = data.results.participants_analysis;

                const content = `📊 **카카오톡 성향 분석 결과**

👥 **참여자 현황**
• 전체 참여자: ${analysis.total_participants}명
• 활성 참여자: ${analysis.active_participants}명

💭 **성향 분포**
• 긍정적: ${analysis.tendency_distribution.positive}%
• 중립적: ${analysis.tendency_distribution.neutral}%
• 부정적: ${analysis.tendency_distribution.negative}%

🌟 **주요 참여자**
${analysis.key_participants.map((p: { name: string; tendency: string; influence_score: number }) =>
                    `• ${p.name}: ${p.tendency} (영향력: ${p.influence_score}/10)`
                ).join('\n')}

📝 **메시지 패턴**
• 질문 비율: ${data.results.message_patterns.question_ratio}%
• 의견 비율: ${data.results.message_patterns.opinion_ratio}%
• 정보 공유: ${data.results.message_patterns.fact_sharing_ratio}%

💬 **커뮤니케이션 스타일**
• 격식체: ${data.results.communication_style.formal_ratio}%
• 비격식체: ${data.results.communication_style.informal_ratio}%
• 이모지 사용: ${data.results.communication_style.emoji_usage}%`;

                return {
                    type: 'analysis',
                    analysisType: 'tendency',
                    content,
                    data: data.results,
                    suggestions: [
                        '부정적 성향 참여자들과의 개별 대화를 권장합니다.',
                        '긍정적 분위기를 더욱 확산시킬 수 있는 방안을 고려해보세요.',
                        '중립적 참여자들의 적극적 참여를 유도해보세요.'
                    ],
                    followUpQuestions: [
                        '특정 참여자의 상세 분석이 필요한가요?',
                        '시간대별 성향 변화를 확인하고 싶으신가요?',
                        '개선 방안에 대한 구체적인 조언이 필요하신가요?'
                    ]
                };
            }
        } catch (error) {
            const err = toError(error);
            errorLogger.error('성향 분석 오류', err, {
                component: 'conversationalAnalysisService',
                action: 'handleTendencyAnalysis',
            });
        }

        return {
            type: 'error',
            content: '성향 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        };
    }

    /**
     * 편향 분석 처리
     */
    private async handleBiasAnalysis(request: ConversationalRequest, intent: IntentResult): Promise<ConversationalResponse> {
        try {
            const response = await fetch(joinApiHealthCheckUrl(this.apiOrigin, `${API_V1_CONSTRUCTION_BIAS_PATH}`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    room_id: request.roomId || 'default',
                    start_date: intent.params.dates?.[0] || '2024-01-01',
                    end_date: intent.params.dates?.[1] || '2025-12-31'
                })
            });

            const data = await response.json();

            if (data.success) {
                const bias = data.results.overall_bias;
                const companies = data.results.company_analysis;
                const promotion = data.results.promotional_content;

                const content = `🏗️ **시공사 편향 분석 결과**

📊 **전체 편향성**
• 편향 점수: ${bias.bias_score}/10
• 편향 방향: ${bias.bias_direction === 'slightly_positive' ? '약간 긍정적' : bias.bias_direction}
• 신뢰도: ${Math.round(bias.confidence * 100)}%

🏢 **언급된 시공사**
${(Object.entries(companies.bias_scores || {}) as [string, { score?: number; mentions?: number; sentiment?: string }][]).map(([company, info]) =>
                    `• ${company}: ${Number(info?.score ?? 0)}/10 (${Number(info?.mentions ?? 0)}회 언급, ${String(info?.sentiment ?? '')})`
                ).join('\n')}

📢 **홍보성 콘텐츠**
• 감지된 홍보: ${promotion.detected_promotions}건
• 홍보 비율: ${promotion.promotional_ratio}%
• 주요 테마: ${promotion.common_themes.join(', ')}

⚠️ **반대 의견**
• 반대 메시지: ${data.results.opposition_analysis.opposition_messages}건
• 주요 우려사항: ${data.results.opposition_analysis.common_concerns.join(', ')}`;

                return {
                    type: 'analysis',
                    analysisType: 'bias',
                    content,
                    data: data.results,
                    suggestions: [
                        '편향되지 않은 객관적 정보 제공이 필요합니다.',
                        '반대 의견에 대한 적극적인 해명이 권장됩니다.',
                        '다양한 업체에 대한 균형잡힌 정보를 제공하세요.'
                    ],
                    followUpQuestions: [
                        '특정 시공사에 대한 상세 분석이 필요한가요?',
                        '편향성을 줄이기 위한 구체적인 방안을 원하시나요?',
                        '홍보성 메시지의 상세 내용을 확인하고 싶으신가요?'
                    ]
                };
            }
        } catch (error) {
            const err = toError(error);
            errorLogger.error('편향 분석 오류', err, {
                component: 'conversationalAnalysisService',
                action: 'handleBiasAnalysis',
            });
        }

        return {
            type: 'error',
            content: '편향 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        };
    }

    /**
     * 여론 분석 처리
     */
    private async handleOpinionAnalysis(request: ConversationalRequest, _intent: IntentResult): Promise<ConversationalResponse> {
        try {
            const response = await fetch(joinApiHealthCheckUrl(this.apiOrigin, `${API_V1_OPINION_TREND_PATH}`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: request.message,
                    room_id: request.roomId || 'default'
                })
            });

            const data = await response.json();

            if (data.success) {
                const trend = data.results.trend_overview;
                const timeline = data.results.timeline_analysis;
                const factors = data.results.influential_factors;

                const content = `📈 **여론 동향 분석 결과**

🎯 **전체 여론 현황**
• 전반적 감정: ${trend.overall_sentiment === 'positive' ? '긍정적' : trend.overall_sentiment}
• 감정 점수: ${trend.sentiment_score}/10
• 트렌드 방향: ${trend.trend_direction === 'improving' ? '개선 중' : trend.trend_direction}

📅 **시간대별 변화**
${timeline.periods.map((period: { period: string; sentiment: number; key_events: string[] }) =>
                    `• ${period.period}: ${period.sentiment}/10 (주요 사건: ${period.key_events.join(', ')})`
                ).join('\n')}

💡 **영향 요인**
${factors.map((factor: { factor: string; impact: number; type: string }) =>
                    `• ${factor.factor}: 영향도 ${factor.impact}/10 (${factor.type === 'positive' ? '긍정적' : factor.type === 'negative' ? '부정적' : '중립적'})`
                ).join('\n')}

🔍 **주요 인사이트**
• 전반적으로 긍정적인 방향으로 개선되고 있습니다.
• 가격 투명성과 품질 보증이 긍정적 영향을 미치고 있습니다.
• 공사 일정에 대한 우려는 중립적 수준입니다.`;

                return {
                    type: 'analysis',
                    analysisType: 'opinion',
                    content,
                    data: data.results,
                    suggestions: [
                        '현재 긍정적 분위기를 유지하는 방향으로 진행하세요.',
                        '공사 일정에 대한 명확한 안내가 필요합니다.',
                        '품질 보증에 대한 지속적인 강조가 효과적입니다.'
                    ],
                    followUpQuestions: [
                        '특정 기간의 상세 분석이 필요한가요?',
                        '여론 개선을 위한 구체적인 전략을 원하시나요?',
                        '부정적 요인에 대한 대응 방안이 필요하신가요?'
                    ]
                };
            }
        } catch (error) {
            const err = toError(error);
            errorLogger.error('여론 분석 오류', err, {
                component: 'conversationalAnalysisService',
                action: 'handleOpinionAnalysis',
            });
        }

        return {
            type: 'error',
            content: '여론 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        };
    }

    /**
     * 통합 분석 처리
     */
    private async handleIntegratedAnalysis(request: ConversationalRequest, _intent: IntentResult): Promise<ConversationalResponse> {
        try {
            const response = await fetch(joinApiHealthCheckUrl(this.apiOrigin, `${API_V1_INTEGRATED_ANALYSIS_PATH}`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: request.message,
                    room_id: request.roomId || 'default',
                    analysis_type: 'integrated'
                })
            });

            const data = await response.json();

            if (data.success) {
                const content = `🎯 **통합 분석 결과 요약**

📊 **종합 신뢰도**: ${Math.round(data.confidence_score * 100)}%

🔍 **주요 발견사항**
${data.results.cross_analysis.key_insights.map((insight: string) => `• ${insight}`).join('\n')}

⚠️ **위험 요인**
${data.results.cross_analysis.risk_factors.map((risk: { factor: string; level: string; probability: number }) =>
                    `• ${risk.factor}: ${risk.level} 위험 (확률: ${Math.round(risk.probability * 100)}%)`
                ).join('\n')}

💡 **권장사항**
${data.recommendations.map((rec: string) => `• ${rec}`).join('\n')}

📈 **상관관계 분석**
• 성향-편향 상관관계: ${Math.round(data.results.cross_analysis.correlation_analysis.tendency_bias_correlation * 100)}%
• 참여자 영향력 상관관계: ${Math.round(data.results.cross_analysis.correlation_analysis.participant_influence_correlation * 100)}%

이 분석은 성향분석, 편향분석, 여론분석을 종합한 결과입니다.`;

                return {
                    type: 'analysis',
                    analysisType: 'integrated',
                    content,
                    data: data.results,
                    suggestions: data.recommendations,
                    followUpQuestions: [
                        '각 분석 영역의 상세 결과를 확인하고 싶으신가요?',
                        '특정 위험 요인에 대한 대응 방안이 필요하신가요?',
                        '개선을 위한 구체적인 실행 계획을 수립하고 싶으신가요?'
                    ]
                };
            }
        } catch (error) {
            const err = toError(error);
            errorLogger.error('통합 분석 오류', err, {
                component: 'conversationalAnalysisService',
                action: 'handleIntegratedAnalysis',
            });
        }

        return {
            type: 'error',
            content: '통합 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        };
    }

    /**
     * 요약 요청 처리
     */
    private async handleSummaryRequest(_request: ConversationalRequest, _intent: IntentResult): Promise<ConversationalResponse> {
        const content = `📋 **분석 결과 요약**

🎯 **사용 가능한 분석 기능**
• **성향 분석**: "참여자들 성향 분석해줘" 
• **편향 분석**: "시공사 편향성 분석해줘"
• **여론 분석**: "전체적인 여론 어때?"
• **통합 분석**: "전체 분석 결과 보여줘"

💬 **질문 예시**
• "긍정적인 참여자는 누구야?"
• "어떤 업체가 가장 선호되고 있어?"
• "분위기가 어떻게 변하고 있어?"
• "전반적인 상황을 정리해줘"

🔍 **상세 분석을 원하시면 구체적으로 질문해주세요!**`;

        return {
            type: 'information',
            content,
            followUpQuestions: [
                '어떤 분석을 먼저 시작하고 싶으신가요?',
                '특정 기간이나 참여자에 대한 분석이 필요하신가요?',
                '분석 결과를 어떤 형태로 받고 싶으신가요?'
            ]
        };
    }

    /**
     * 상태 조회 처리
     */
    private async handleStatusInquiry(request: ConversationalRequest, _intent: IntentResult): Promise<ConversationalResponse> {
        try {
            const roomId = request.roomId || 'default';
            const response = await fetch(
                joinApiHealthCheckUrl(this.apiOrigin, `${API_V1_ANALYSIS_STATUS_PATH_PREFIX}/${encodeURIComponent(roomId)}`),
            );
            const data = await response.json();

            const content = `📊 **현재 분석 상태**

🏠 **대화방**: ${data.room_id}
📈 **상태**: ${data.status === 'active' ? '활성' : data.status}
🕐 **마지막 분석**: ${new Date(data.last_analysis).toLocaleString()}
💬 **총 메시지**: ${data.total_messages}개
✅ **분석된 메시지**: ${data.analyzed_messages}개
📊 **분석 진행률**: ${data.analysis_progress}%

모든 시스템이 정상 작동 중입니다!`;

            return {
                type: 'information',
                content,
                followUpQuestions: [
                    '새로운 분석을 시작하고 싶으신가요?',
                    '분석 이력을 확인하고 싶으신가요?'
                ]
            };
        } catch (error) {
            const err = toError(error);
            errorLogger.error('상태 조회 오류', err, {
                component: 'conversationalAnalysisService',
                action: 'handleStatusInquiry',
            });
        }

        return {
            type: 'error',
            content: '상태 조회 중 오류가 발생했습니다.'
        };
    }

    /**
     * 고급 분석 처리
     */
    private async performAdvancedAnalysis(request: ConversationalRequest, intent: IntentResult): Promise<ConversationalResponse | null> {
        try {
            const analysisRequest: TextAnalysisRequest = {
                text: request.message,
                analysisType: this.mapIntentToAnalysisType(intent.type),
                outputType: 'analysis',
                perspective: 'researcher',
                context: request.context
            };

            const result = await advancedTextAnalysisService.analyzeAndManipulateText(analysisRequest);
            if (
                result == null ||
                typeof result !== 'object' ||
                result.generatedTexts == null ||
                result.analysisResult == null
            ) {
                return null;
            }

            return {
                type: 'advanced_analysis',
                analysisType: 'descriptive',
                content: result.generatedTexts.descriptiveAnalysis,
                data: result.analysisResult,
                researcherInsights: result.analysisResult.insights,
                expertAssessment: result.expertAssessment,
                textManipulations: result.generatedTexts.alternatives as unknown as NonNullable<ConversationalResponse['textManipulations']>,
                methodologyNotes: `연구방법론: ${result.analysisResult.methodology}`,
                contextualFactors: result.contextualFactors,
                suggestions: result.analysisResult.recommendations,
                followUpQuestions: [
                    '특정 측면에 대한 더 깊이 있는 분석이 필요하신가요?',
                    '다른 관점에서의 분석도 확인해보시겠어요?',
                    '이 분석을 바탕으로 한 실행 계획을 수립해드릴까요?',
                    '텍스트 수정이나 반박문 작성이 필요하신가요?'
                ]
            };
        } catch (error) {
            const err = toError(error);
            errorLogger.error('고급 분석 오류', err, {
                component: 'conversationalAnalysisService',
                action: 'performAdvancedAnalysis',
            });
            return null;
        }
    }

    /**
     * 의도를 분석 타입으로 매핑
     */
    private mapIntentToAnalysisType(intentType: string): 'descriptive' | 'research' | 'opinion' | 'manipulation' {
        switch (intentType) {
            case 'research_analysis':
                return 'research';
            case 'text_manipulation':
                return 'manipulation';
            case 'opinion_analysis':
                return 'opinion';
            default:
                return 'descriptive';
        }
    }

    /**
     * 텍스트 조작 처리
     */
    private async handleTextManipulation(request: ConversationalRequest, _intent: IntentResult): Promise<ConversationalResponse> {
        try {
            const analysisRequest: TextAnalysisRequest = {
                text: request.message,
                analysisType: 'manipulation',
                outputType: 'modification',
                perspective: 'expert',
                context: request.context
            };

            const result = await advancedTextAnalysisService.analyzeAndManipulateText(analysisRequest);
            if (
                result == null ||
                typeof result !== 'object' ||
                result.generatedTexts?.descriptiveAnalysis == null ||
                result.analysisResult == null
            ) {
                return {
                    type: 'error',
                    content: '텍스트 조작 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
                };
            }

            const content = `✍️ **텍스트 조작 및 생성 결과**

🔄 **다양한 형태의 텍스트 생성이 완료되었습니다.**

📝 **수정 버전**: 원본의 의도를 유지하면서 개선된 버전
⚔️ **반박 논증**: 체계적인 반박 논리 구성
📢 **호소문**: 감정적 호소력을 높인 버전
🛡️ **반박문**: 비판에 대한 강력한 대응
📚 **확장 분석**: 심층적이고 포괄적인 분석

${result.generatedTexts.descriptiveAnalysis.substring(0, 500)}...

*상세한 결과는 각각의 버전을 개별적으로 요청해주세요.*`;

            return {
                type: 'text_manipulation',
                analysisType: 'manipulation',
                content,
                data: result.analysisResult,
                textManipulations: result.generatedTexts.alternatives as unknown as NonNullable<ConversationalResponse['textManipulations']>,
                suggestions: [
                    '특정 버전(수정/반박/호소문/반박문)을 선택해서 전체 내용을 확인하세요',
                    '원하는 톤앤매너나 스타일로 추가 조정이 가능합니다',
                    '타겟 독자에 맞춘 맞춤형 버전도 생성할 수 있습니다'
                ],
                followUpQuestions: [
                    '어떤 버전의 전체 내용을 확인하고 싶으신가요?',
                    '특정 목적이나 상황에 맞춘 추가 버전이 필요하신가요?',
                    '톤앤매너를 조정한 다른 스타일의 텍스트를 원하시나요?'
                ]
            };
        } catch (error) {
            const err = toError(error);
            errorLogger.error('텍스트 조작 오류', err, {
                component: 'conversationalAnalysisService',
                action: 'handleTextManipulation',
            });
            return {
                type: 'error',
                content: '텍스트 조작 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
            };
        }
    }

    /**
     * 서술적 분석 처리
     */
    private async handleDescriptiveAnalysis(request: ConversationalRequest, _intent: IntentResult): Promise<ConversationalResponse> {
        try {
            const analysisRequest: TextAnalysisRequest = {
                text: request.message,
                analysisType: 'descriptive',
                perspective: 'researcher',
                context: request.context
            };

            const result = await advancedTextAnalysisService.analyzeAndManipulateText(analysisRequest);
            if (
                result == null ||
                typeof result !== 'object' ||
                result.generatedTexts?.descriptiveAnalysis == null ||
                result.analysisResult == null ||
                result.expertAssessment == null ||
                typeof result.expertAssessment.credibility !== 'number'
            ) {
                return {
                    type: 'error',
                    content: '서술적 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
                };
            }

            return {
                type: 'advanced_analysis',
                analysisType: 'descriptive',
                content: result.generatedTexts.descriptiveAnalysis,
                data: result.analysisResult,
                researcherInsights: result.analysisResult.insights,
                expertAssessment: result.expertAssessment,
                methodologyNotes: `분석 방법론: ${result.analysisResult.methodology}\n\n신뢰도: ${Math.round(result.expertAssessment.credibility * 100)}%`,
                suggestions: result.analysisResult.recommendations,
                followUpQuestions: [
                    '특정 측면에 대한 더 상세한 분석이 필요하신가요?',
                    '다른 이론적 관점에서의 접근을 원하시나요?',
                    '이 분석을 바탕으로 한 정책 제언이 필요하신가요?'
                ]
            };
        } catch (error) {
            const err = toError(error);
            errorLogger.error('서술적 분석 오류', err, {
                component: 'conversationalAnalysisService',
                action: 'handleDescriptiveAnalysis',
            });
            return {
                type: 'error',
                content: '서술적 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
            };
        }
    }

    /**
     * 연구 분석 처리
     */
    private async handleResearchAnalysis(request: ConversationalRequest, _intent: IntentResult): Promise<ConversationalResponse> {
        try {
            const analysisRequest: TextAnalysisRequest = {
                text: request.message,
                analysisType: 'research',
                perspective: 'researcher',
                context: request.context
            };

            const result = await advancedTextAnalysisService.analyzeAndManipulateText(analysisRequest);
            const ar = result?.analysisResult;
            if (
                result == null ||
                typeof result !== 'object' ||
                result.generatedTexts?.researchSummary == null ||
                ar == null ||
                typeof ar !== 'object' ||
                !Array.isArray(ar.findings) ||
                !Array.isArray(ar.insights) ||
                !Array.isArray(ar.limitations) ||
                !Array.isArray(ar.recommendations) ||
                result.expertAssessment == null
            ) {
                return {
                    type: 'error',
                    content: '연구 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
                };
            }

            const content = `🔬 **학술적 연구 분석 결과**

${result.generatedTexts.researchSummary}

### 📊 **연구 방법론**
${result.analysisResult.methodology}

### 🎯 **주요 발견사항**
${result.analysisResult.findings.map((finding: string) => `• ${finding}`).join('\n')}

### 💡 **핵심 통찰**
${result.analysisResult.insights.map((insight: string) => `• ${insight}`).join('\n')}

### ⚠️ **연구의 한계**
${result.analysisResult.limitations.map((limit: string) => `• ${limit}`).join('\n')}

### 🎯 **권장사항**
${result.analysisResult.recommendations.map((rec: string) => `• ${rec}`).join('\n')}`;

            return {
                type: 'advanced_analysis',
                analysisType: 'research',
                content,
                data: result.analysisResult,
                researcherInsights: result.analysisResult.insights,
                expertAssessment: result.expertAssessment,
                methodologyNotes: `연구 설계: ${result.analysisResult.methodology}\n\n학술적 엄밀성: ${result.expertAssessment.credibility}\n\n검증 가능성: 높음`,
                suggestions: [
                    '추가적인 데이터 수집을 통한 검증 연구를 수행하세요',
                    '동료 검토(peer review)를 통한 객관성 확보를 권장합니다',
                    '정량적 분석과의 교차 검증을 고려해보세요',
                    '장기적 추적 연구로 발전시킬 수 있습니다'
                ],
                followUpQuestions: [
                    '이 연구를 바탕으로 한 후속 연구 계획이 필요하신가요?',
                    '특정 가설에 대한 정량적 검증 방법을 제안드릴까요?',
                    '연구 결과의 실무 적용 방안을 모색해보시겠어요?',
                    '학술 논문 형태로 발전시키는 방법을 안내해드릴까요?'
                ]
            };
        } catch (error) {
            const err = toError(error);
            errorLogger.error('연구 분석 오류', err, {
                component: 'conversationalAnalysisService',
                action: 'handleResearchAnalysis',
            });
            return {
                type: 'error',
                content: '연구 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
            };
        }
    }

    /**
     * 글쓰기 요청 처리
     */
    private async handleWritingRequest(request: ConversationalRequest, intent: Record<string, unknown>): Promise<ConversationalResponse> {
        try {
            // 글쓰기 요구사항 파싱
            const writingRequirements = this.parseWritingRequirements(request.message, intent);

            // 통합 글쓰기 서비스 호출
            const wr = writingRequirements as Record<string, unknown>;
            const mergedPipeline = this.resolvedPipelineExtrasForUnifiedWriting(request);
            const writingRequest: UnifiedWritingRequest = {
                input: {
                    topic: String(wr.topic ?? '사용자 요청 주제'),
                    original_text: wr.originalText as string | undefined
                },
                writing_style: {
                    type: (['professional', 'conversational', 'analytical', 'adaptive'].includes(String(wr.style ?? 'adaptive')) ? wr.style : 'adaptive') as 'professional' | 'conversational' | 'analytical' | 'adaptive'
                },
                detailed_requirements: {
                    length: {
                        type: 'word_count',
                        value: Number(wr.wordCount) || 500,
                        flexibility: 'moderate'
                    },
                    tone: {
                        formality: (['casual', 'friendly', 'professional', 'academic', 'authoritative'].includes(String(wr.formality ?? 'professional')) ? wr.formality : 'professional') as 'casual' | 'friendly' | 'professional' | 'academic' | 'authoritative',
                        emotion: (['neutral', 'calm', 'urgent', 'encouraging', 'passionate'].includes(String(wr.emotion ?? 'neutral')) ? wr.emotion : 'neutral') as 'neutral' | 'calm' | 'urgent' | 'encouraging' | 'passionate',
                        perspective: (['혼합', '1인칭', '2인칭', '3인칭'].includes(String(wr.perspective ?? '3인칭')) ? wr.perspective : '3인칭') as '혼합' | '1인칭' | '2인칭' | '3인칭',
                        voice_style: (['혼합', '능동태', '수동태'].includes(String(wr.voice ?? '능동태')) ? wr.voice : '능동태') as '혼합' | '능동태' | '수동태'
                    },
                    sentence_structure: {
                        average_length: (['medium', 'long', 'short', 'very_short', 'very_long'].includes(String(wr.sentenceLength ?? 'medium')) ? wr.sentenceLength : 'medium') as 'medium' | 'long' | 'short' | 'very_short' | 'very_long',
                        complexity: (['simple', 'complex', 'compound', 'varied'].includes(String(wr.complexity ?? 'mixed')) ? wr.complexity : 'mixed') as 'simple' | 'complex' | 'compound' | 'varied',
                        rhythm: (['varied', 'dramatic', 'consistent'].includes(String(wr.rhythm ?? 'varied')) ? wr.rhythm : 'varied') as 'varied' | 'dramatic' | 'consistent'
                    },
                    paragraph_structure: {
                        count: wr.paragraphCount as number | undefined,
                        average_sentences_per_paragraph: Number(wr.sentencesPerParagraph) || 4,
                        connection_style: 'smooth'
                    },
                    content_focus: {
                        main_purpose: (['analyze', 'inform', 'persuade', 'entertain', 'critique', 'argue'].includes(String(wr.purpose ?? 'inform')) ? wr.purpose : 'inform') as 'analyze' | 'inform' | 'persuade' | 'entertain' | 'critique' | 'argue',
                        evidence_level: (['moderate', 'minimal', 'extensive'].includes(String(wr.evidenceLevel ?? 'moderate')) ? wr.evidenceLevel : 'moderate') as 'moderate' | 'minimal' | 'extensive',
                        include_statistics: Boolean(wr.includeStats ?? false),
                        include_examples: Boolean(wr.includeExamples ?? true),
                        include_quotes: Boolean(wr.includeQuotes ?? false),
                        include_personal_opinions: Boolean(wr.includeOpinions ?? true)
                    },
                    target_audience: {
                        expertise_level: (['general_public', 'students', 'professionals', 'experts'].includes(String(wr.audienceLevel ?? 'general_public')) ? wr.audienceLevel : 'general_public') as 'general_public' | 'students' | 'professionals' | 'experts',
                        background_knowledge_level: (['intermediate', 'advanced', 'beginner'].includes(String(wr.knowledgeLevel ?? 'intermediate')) ? wr.knowledgeLevel : 'intermediate') as 'intermediate' | 'advanced' | 'beginner'
                    }
                },
                output_options: {
                    include_alternatives: true,
                    include_analysis: true,
                    include_improvement_suggestions: true,
                    include_source_attribution: false,
                    format: 'markdown'
                },
                ...(mergedPipeline ? { pipelineExtras: mergedPipeline } : {}),
            };

            const result = await integratedWritingService.processUnifiedWritingRequest(writingRequest);

            const content = `✍️ **맞춤형 글쓰기 완료**

## ${result.primary_content.title}

${result.primary_content.content}

---

📊 **글쓰기 품질 분석**
• 스타일 적합성: ${Math.round(result.quality_analysis.style_compliance * 100)}%
• 가독성 점수: ${Math.round(result.quality_analysis.readability_score * 100)}%
• 전문성 수준: ${Math.round(result.quality_analysis.professional_quality * 100)}%
• 예상 독서 시간: ${result.primary_content.estimated_reading_time}분

📝 **작성 정보**
• 총 글자 수: ${result.primary_content.character_count.toLocaleString()}자
• 총 단어 수: ${result.primary_content.word_count.toLocaleString()}개
• 처리 시간: ${result.metadata.processing_time}ms`;

            const outPipeline = this.pipelineExtrasFromWritingMetadata(result.metadata);

            return {
                type: 'text_manipulation',
                analysisType: 'manipulation',
                content,
                data: result as unknown as Record<string, unknown>,
                textManipulations: result.alternatives,
                suggestions: result.improvement_suggestions,
                followUpQuestions: [
                    '다른 어투나 스타일로 다시 작성해드릴까요?',
                    '글자 수나 문단 수를 조정하고 싶으신가요?',
                    '특정 부분을 더 자세히 설명해드릴까요?',
                    '이 글을 바탕으로 다른 형태의 글을 작성해드릴까요?'
                ],
                ...(outPipeline ? { pipelineExtras: outPipeline } : {}),
            };

        } catch (error) {
            const err = toError(error);
            errorLogger.error('글쓰기 요청 처리 오류', err, {
                component: 'conversationalAnalysisService',
                action: 'handleWritingRequest',
            });
            return {
                type: 'error',
                content: '글쓰기 처리 중 오류가 발생했습니다. 요청사항을 다시 확인해 주세요.'
            };
        }
    }

    /**
     * 맞춤형 글쓰기 처리
     */
    private async handleCustomWriting(request: ConversationalRequest, intent: Record<string, unknown>): Promise<ConversationalResponse> {
        try {
            // 더 정교한 요구사항 파싱
            const cr = this.parseDetailedWritingRequirements(request.message, intent) as Record<string, unknown>;
            const mergedPipeline = this.resolvedPipelineExtrasForUnifiedWriting(request);

            const writingRequest: UnifiedWritingRequest = {
                input: {
                    topic: String(cr.topic ?? ''),
                    original_text: cr.sourceText as string | undefined
                },
                writing_style: {
                    type: (['professional', 'conversational', 'analytical', 'adaptive'].includes(String(cr.writingType ?? 'adaptive')) ? cr.writingType : 'adaptive') as 'professional' | 'conversational' | 'analytical' | 'adaptive',
                    professional_style: cr.professionalStyle as WritingStyle | undefined,
                    custom_style: cr.customStyle ? {
                        personality: String((cr.customStyle as Record<string, unknown>).personality ?? ''),
                        expertise_field: String((cr.customStyle as Record<string, unknown>).expertise_field ?? ''),
                        writing_approach: String((cr.customStyle as Record<string, unknown>).writing_approach ?? '')
                    } : undefined
                },
                detailed_requirements: cr.detailedReqs as UnifiedWritingRequest['detailed_requirements'],
                output_options: {
                    include_alternatives: true,
                    include_analysis: true,
                    include_improvement_suggestions: true,
                    include_source_attribution: !!cr.sourceText,
                    format: (['html', 'markdown', 'plain_text', 'structured_json'].includes(String(cr.outputFormat ?? 'markdown')) ? cr.outputFormat : 'markdown') as 'html' | 'markdown' | 'plain_text' | 'structured_json'
                },
                ...(mergedPipeline ? { pipelineExtras: mergedPipeline } : {}),
            };

            const result = await integratedWritingService.processUnifiedWritingRequest(writingRequest);

            const content = `🎯 **고급 맞춤형 글쓰기 완료**

## ${result.primary_content.title}

${result.primary_content.content}

---

## 📈 **상세 품질 분석**

**구조적 품질**
• 스타일 일관성: ${Math.round(result.quality_analysis.style_compliance * 100)}%
• 논리적 흐름: ${Math.round(result.quality_analysis.engagement_level * 100)}%
• 대상 독자 적합성: ${Math.round(result.quality_analysis.target_audience_fit * 100)}%

**언어적 품질**
• 가독성: ${Math.round(result.quality_analysis.readability_score * 100)}%
• 전문성: ${Math.round(result.quality_analysis.professional_quality * 100)}%
• 신뢰도: ${Math.round(result.metadata.confidence_score * 100)}%

**작성 통계**
• 글자 수: ${result.primary_content.character_count.toLocaleString()}자
• 단어 수: ${result.primary_content.word_count.toLocaleString()}개
• 예상 독서 시간: ${result.primary_content.estimated_reading_time}분
• 사용된 엔진: ${result.metadata.engines_used.join(', ')}

${result.improvement_suggestions && result.improvement_suggestions.length > 0 ?
                    `## 💡 **개선 제안사항**
${result.improvement_suggestions.map(s => `• ${s}`).join('\n')}` : ''}`;

            const outPipeline = this.pipelineExtrasFromWritingMetadata(result.metadata);

            return {
                type: 'advanced_analysis',
                analysisType: 'manipulation',
                content,
                data: result as unknown as Record<string, unknown>,
                textManipulations: result.alternatives as unknown as NonNullable<ConversationalResponse['textManipulations']>,
                expertAssessment: result.quality_analysis,
                suggestions: result.improvement_suggestions,
                followUpQuestions: [
                    '다른 관점이나 어투로 재작성해드릴까요?',
                    '특정 부분의 길이나 스타일을 조정하고 싶으신가요?',
                    '이 글을 바탕으로 다른 형태(요약, 확장, 반박 등)의 글을 만들어드릴까요?',
                    '대상 독자나 목적을 바꾼 버전을 원하시나요?'
                ],
                ...(outPipeline ? { pipelineExtras: outPipeline } : {}),
            };

        } catch (error) {
            const err = toError(error);
            errorLogger.error('맞춤형 글쓰기 처리 오류', err, {
                component: 'conversationalAnalysisService',
                action: 'handleCustomWriting',
            });
            return {
                type: 'error',
                content: '맞춤형 글쓰기 처리 중 오류가 발생했습니다. 요청 내용을 더 구체적으로 말씀해 주세요.'
            };
        }
    }

    /**
     * 기본 글쓰기 요구사항 파싱
     */
    private parseWritingRequirements(message: string, _intent: Record<string, unknown>): Record<string, unknown> {
        const requirements: Record<string, unknown> = {};

        // 주제 추출
        const topicMatch = (message.match(/["""']([^"""']+)["""']/) ||
            (message.match(/에 대한|관한|대해서/) &&
              coerceTrimmedString(message.split(/에 대한|관한|대해서/)[0], '')));
        requirements.topic = topicMatch ? (Array.isArray(topicMatch) ? topicMatch[1] : topicMatch) : '주제 미지정';

        // 글자수/단어수 추출
        const lengthMatch = message.match(/(\d+)(?:자|글자|단어|어절)/);
        if (lengthMatch) {
            requirements.wordCount = parseInt(lengthMatch[1]);
        }

        // 문단 수 추출
        const paragraphMatch = message.match(/(\d+)(?:문단|단락|파라그래프)/);
        if (paragraphMatch) {
            requirements.paragraphCount = parseInt(paragraphMatch[1]);
        }

        // 어투 추출
        if (message.includes('격식')) requirements.formality = 'formal';
        if (message.includes('비격식') || message.includes('친근')) requirements.formality = 'casual';
        if (message.includes('학술적') || message.includes('논문')) requirements.formality = 'academic';
        if (message.includes('전문적')) requirements.formality = 'professional';

        // 감정/톤 추출
        if (message.includes('열정적') || message.includes('강렬')) requirements.emotion = 'passionate';
        if (message.includes('차분') || message.includes('침착')) requirements.emotion = 'calm';
        if (message.includes('중립적') || message.includes('객관적')) requirements.emotion = 'neutral';
        if (message.includes('긴급') || message.includes('시급')) requirements.emotion = 'urgent';

        // 관점 추출
        if (message.includes('1인칭') || message.includes('나는') || message.includes('내가')) requirements.perspective = '1인칭';
        if (message.includes('2인칭') || message.includes('당신') || message.includes('여러분')) requirements.perspective = '2인칭';
        if (message.includes('3인칭') || message.includes('그는') || message.includes('객관적')) requirements.perspective = '3인칭';

        // 목적 추출
        if (message.includes('설명') || message.includes('정보')) requirements.purpose = 'inform';
        if (message.includes('설득') || message.includes('주장')) requirements.purpose = 'persuade';
        if (message.includes('분석') || message.includes('해석')) requirements.purpose = 'analyze';
        if (message.includes('비판') || message.includes('평가')) requirements.purpose = 'critique';

        // 스타일 추출
        if (message.includes('논술') || message.includes('에세이')) requirements.style = 'professional';
        if (message.includes('평론') || message.includes('리뷰')) requirements.style = 'professional';
        if (message.includes('기사') || message.includes('뉴스')) requirements.style = 'adaptive';

        return requirements;
    }

    /**
     * 상세 글쓰기 요구사항 파싱
     */
    private parseDetailedWritingRequirements(message: string, intent: Record<string, unknown>): Record<string, unknown> {
        const baseReqs = this.parseWritingRequirements(message, intent) as Record<string, unknown>;

        // 더 상세한 파싱 로직
        const customRequirements: Record<string, unknown> = {
            ...baseReqs,
            detailedReqs: {
                length: {
                    type: 'word_count',
                    value: baseReqs.wordCount || 800,
                    flexibility: this.extractFlexibility(message)
                },
                tone: {
                    formality: baseReqs.formality || 'professional',
                    emotion: baseReqs.emotion || 'neutral',
                    perspective: baseReqs.perspective || '3인칭',
                    voice_style: this.extractVoiceStyle(message)
                },
                sentence_structure: {
                    average_length: this.extractSentenceLength(message),
                    complexity: this.extractComplexity(message),
                    rhythm: this.extractRhythm(message)
                },
                paragraph_structure: {
                    count: baseReqs.paragraphCount,
                    average_sentences_per_paragraph: this.extractSentencesPerParagraph(message),
                    connection_style: this.extractConnectionStyle(message)
                },
                content_focus: {
                    main_purpose: baseReqs.purpose || 'inform',
                    evidence_level: this.extractEvidenceLevel(message),
                    include_statistics: message.includes('통계') || message.includes('데이터'),
                    include_examples: message.includes('예시') || message.includes('사례'),
                    include_quotes: message.includes('인용') || message.includes('명언'),
                    include_personal_opinions: message.includes('의견') || message.includes('견해')
                },
                target_audience: {
                    expertise_level: this.extractAudienceLevel(message),
                    background_knowledge_level: this.extractKnowledgeLevel(message)
                }
            }
        };

        // 소스 텍스트 추출
        const sourceTextMatch = message.match(/이 글을|다음 글을|아래 글을|"([^"]+)"/);
        if (sourceTextMatch) {
            customRequirements.sourceText = sourceTextMatch[1] || sourceTextMatch[0];
        }

        return customRequirements;
    }

    // 추가 파싱 헬퍼 메서드들
    private extractFlexibility(message: string): 'strict' | 'moderate' | 'flexible' {
        if (message.includes('정확히') || message.includes('딱')) return 'strict';
        if (message.includes('대략') || message.includes('약간')) return 'flexible';
        return 'moderate';
    }

    private extractVoiceStyle(message: string): string {
        if (message.includes('능동태') || message.includes('적극적')) return '능동태';
        if (message.includes('수동태') || message.includes('객관적')) return '수동태';
        return '혼합';
    }

    private extractSentenceLength(message: string): string {
        if (message.includes('짧은 문장') || message.includes('간결')) return 'short';
        if (message.includes('긴 문장') || message.includes('상세')) return 'long';
        if (message.includes('매우 짧은') || message.includes('단문')) return 'very_short';
        if (message.includes('매우 긴') || message.includes('장문')) return 'very_long';
        return 'medium';
    }

    private extractComplexity(message: string): string {
        if (message.includes('단순') || message.includes('쉬운')) return 'simple';
        if (message.includes('복잡') || message.includes('어려운')) return 'complex';
        if (message.includes('복합적') || message.includes('중간')) return 'compound';
        return 'mixed';
    }

    private extractRhythm(message: string): string {
        if (message.includes('일정한') || message.includes('규칙적')) return 'consistent';
        if (message.includes('다양한') || message.includes('변화')) return 'varied';
        if (message.includes('극적') || message.includes('강렬')) return 'dramatic';
        return 'varied';
    }

    private extractSentencesPerParagraph(message: string): number {
        const match = message.match(/문단당 (\d+)(?:개|문장)/);
        return match ? parseInt(match[1]) : 4;
    }

    private extractConnectionStyle(message: string): string {
        if (message.includes('자연스럽게') || message.includes('부드럽게')) return 'smooth';
        if (message.includes('명확하게') || message.includes('구분')) return 'clear_breaks';
        if (message.includes('극적으로') || message.includes('강하게')) return 'dramatic_transitions';
        return 'smooth';
    }

    private extractEvidenceLevel(message: string): string {
        if (message.includes('많은 근거') || message.includes('상세한 증거')) return 'extensive';
        if (message.includes('적은 근거') || message.includes('간단한 증거')) return 'minimal';
        return 'moderate';
    }

    private extractAudienceLevel(message: string): string {
        if (message.includes('일반인') || message.includes('대중')) return 'general_public';
        if (message.includes('학생') || message.includes('교육')) return 'students';
        if (message.includes('전문가') || message.includes('전문직')) return 'professionals';
        if (message.includes('전문가') || message.includes('학자')) return 'experts';
        return 'general_public';
    }

    private extractKnowledgeLevel(message: string): string {
        if (message.includes('초보') || message.includes('기초')) return 'beginner';
        if (message.includes('중급') || message.includes('보통')) return 'intermediate';
        if (message.includes('고급') || message.includes('전문')) return 'advanced';
        return 'intermediate';
    }

    /**
     * 일반 질문 처리 (업그레이드)
     */
    private async handleGeneralQuery(_request: ConversationalRequest): Promise<ConversationalResponse> {
        const content = `🤖 **CORBU.AI 고급 분석 시스템**

안녕하세요! 연구자 수준의 심층 분석을 제공하는 AI입니다.

🔬 **제가 제공하는 고급 분석**
• 🎯 **참여자 성향 분석** - 긍정/부정/중립 성향 파악
• 🏗️ **시공사 편향 분석** - 업체별 선호도 및 편향성 측정  
• 📈 **여론 동향 분석** - 시간에 따른 분위기 변화 추적
• 🎯 **통합 분석** - 모든 분석을 종합한 인사이트
• ✍️ **고급 텍스트 조작** - 수정/반박/호소문/반박문/확장 생성
• 📊 **서술적 분석** - 연구자 관점의 심층적 해석
• 🔬 **학술적 분석** - 논문 수준의 체계적 검토

💡 **새로운 기능들**
• **연구자 관점**: 학술적 엄밀성을 갖춘 분석
• **여론분석가 관점**: 사회적 함의와 정치적 파급효과 분석
• **텍스트 생성**: 어떤 글이든 다양한 형태로 변환 가능
• **반박 논증**: 체계적이고 논리적인 반박문 작성
• **호소문 작성**: 감정에 호소하는 설득력 있는 글

💬 **자연스럽게 질문하거나 요청해주세요!**
예시:
• "이 글을 연구자 관점에서 분석해줘"
• "반박문을 작성해줘"
• "호소문으로 바꿔서 써줘"
• "요즘 분위기 어때?"
• "학술적으로 검토해줘"`;

        return {
            type: 'information',
            content,
            followUpQuestions: [
                '어떤 종류의 분석이나 텍스트 작업을 원하시나요?',
                '기존 텍스트를 다른 형태로 변환하고 싶으신가요?',
                '특정 주제에 대한 전문가 수준의 분석이 필요하신가요?',
                '분석 기능들에 대해 더 자세한 설명을 들어보시겠어요?'
            ]
        };
    }

    /**
     * 정치적 성향별 글쓰기 처리
     */
    private async handlePoliticalWriting(request: ConversationalRequest, _intent: IntentResult): Promise<ConversationalResponse> {
        try {
            const message = request.message;

            // 메시지에서 정치적 성향과 어조 추출
            const politicalSpectrum = this.extractPoliticalSpectrum(message);
            const stance = this.extractPoliticalStance(message);
            const toneIntensity = this.extractToneIntensity(message);
            const topic = this.extractTopic(message);

            const profile: PoliticalWritingProfile = {
                spectrum: politicalSpectrum,
                stance: stance,
                emotionIntensity: (toneIntensity === 'combative' ? 'aggressive' : 'militant') as EmotionIntensity,
                toneIntensity,
                useRhetoric: true,
                useStatistics: true,
                useEmotionalAppeal: toneIntensity !== 'gentle',
                useMilitantLanguage: toneIntensity === 'militant' || toneIntensity === 'aggressive',
                useAggressiveRhetoric: toneIntensity === 'aggressive' || toneIntensity === 'combative',
                formalityLevel: 'formal'
            };

            const result = await politicalWritingEngine.generatePoliticalWriting({
                topic: topic || '주어진 주제',
                profile: profile,
                targetLength: 300,
                includeReferences: true,
                outputFormat: 'opinion'
            });

            return {
                type: 'political_writing',
                analysisType: 'political',
                content: `🏛️ **정치적 성향 반영 글쓰기 완료**\n\n${result.generatedText}\n\n📊 **특징 분석:**\n• 정치적 프레이밍: ${result.politicalFraming}\n• 감정적 톤: ${result.emotionalTone}\n• 언어 스타일: ${result.languageStyle}`,
                data: result as unknown as Record<string, unknown>,
                writingProfile: profile as unknown as MasterWritingProfile,
                suggestions: [
                    '다른 정치적 성향으로 다시 써보기',
                    '강성도 조절해서 재작성',
                    '반대 입장에서 반박문 작성'
                ],
                followUpQuestions: [
                    '이 글을 더 강성하게 써주실 수 있나요?',
                    '반대 입장에서 반박문을 작성해주세요',
                    '중도적 입장으로 다시 써주실 수 있나요?'
                ]
            };

        } catch (error) {
            const err = toError(error);
            errorLogger.error('정치적 글쓰기 처리 실패', err, {
                component: 'conversationalAnalysisService',
                action: 'handlePoliticalWriting',
            });
            return {
                type: 'error',
                content: '정치적 성향 글쓰기 처리 중 오류가 발생했습니다. 다시 시도해주세요.'
            };
        }
    }

    /**
     * 연령대별 어투 글쓰기 처리
     */
    private async handleGenerationWriting(request: ConversationalRequest, _intent: IntentResult): Promise<ConversationalResponse> {
        try {
            const message = request.message;

            // 메시지에서 연령대와 스타일 추출
            const ageGroup = this.extractAgeGroup(message);
            const formalityLevel = this.extractFormalityLevel(message);
            const topic = this.extractTopic(message);

            const profile = generationWritingEngine.recommendGenerationProfile(ageGroup, 'general');
            profile.languageFormality = formalityLevel as LanguageFormality;

            const result = await generationWritingEngine.generateGenerationWriting({
                topic: topic || '주어진 주제',
                profile: profile,
                targetAudience: '50s',
                purposeType: 'advice',
                targetLength: 300,
                includePersonalExperience: true
            });

            return {
                type: 'generation_writing',
                analysisType: 'generational',
                content: `👴 **${ageGroup} 세대 어투 글쓰기 완료**\n\n${result.generatedText}\n\n📊 **세대적 특징:**\n• 소통 스타일: ${result.communicationStyle}\n• 격식 수준: ${result.formalityLevel}\n• 언어적 특징: ${result.languageFeatures.join(', ')}`,
                data: result as unknown as Record<string, unknown>,
                suggestions: [
                    '다른 연령대 어투로 다시 써보기',
                    '더 격식적인 표현으로 변경',
                    '권위적 톤으로 재작성'
                ],
                followUpQuestions: [
                    '이 글을 70대 어투로 다시 써주실 수 있나요?',
                    '더 권위적인 톤으로 써주세요',
                    '젊은 세대 어투로도 써주실 수 있나요?'
                ]
            };

        } catch (error) {
            const err = toError(error);
            errorLogger.error('연령대별 글쓰기 처리 실패', err, {
                component: 'conversationalAnalysisService',
                action: 'handleGenerationWriting',
            });
            return {
                type: 'error',
                content: '연령대별 어투 글쓰기 처리 중 오류가 발생했습니다. 다시 시도해주세요.'
            };
        }
    }

    /**
     * 찬성/반대 논조 글쓰기 처리
     */
    private async handleStanceWriting(request: ConversationalRequest, _intent: IntentResult): Promise<ConversationalResponse> {
        try {
            const message = request.message;

            // 메시지에서 입장과 강도 추출
            const position = this.extractStancePosition(message);
            const strengthLevel = this.extractStrengthLevel(message);
            const topic = this.extractTopic(message);

            const profile = stanceWritingEngine.recommendStanceProfile(topic || '주어진 주제', position, 'general');
            profile.strengthLevel = strengthLevel as 'strong' | 'moderate' | 'extreme' | 'mild' | 'passionate';

            const result = await stanceWritingEngine.generateStanceWriting({
                topic: topic || '주어진 주제',
                profile: profile,
                targetLength: 300,
                requiredSections: ['introduction', 'main_argument', 'conclusion'],
                tone: 'formal',
                includeCallToAction: true
            });

            return {
                type: 'stance_writing',
                analysisType: 'stance',
                content: `✊ **${position} 입장 글쓰기 완료**\n\n${result.generatedText}\n\n📊 **논조 분석:**\n• 강도 평가: ${result.strengthAssessment}\n• 설득 전략: ${result.persuasionElements.join(', ')}\n• 수사 기법: ${result.rhetoricalDevices.join(', ')}`,
                data: result as unknown as Record<string, unknown>,
                suggestions: [
                    '반대 입장으로 다시 써보기',
                    '중립적 입장으로 변경',
                    '더 강한 논조로 재작성'
                ],
                followUpQuestions: [
                    '이 글을 반대 입장에서 써주실 수 있나요?',
                    '더 강한 어조로 써주세요',
                    '중립적 관점으로도 써주실 수 있나요?'
                ]
            };

        } catch (error) {
            const err = toError(error);
            errorLogger.error('입장별 글쓰기 처리 실패', err, {
                component: 'conversationalAnalysisService',
                action: 'handleStanceWriting',
            });
            return {
                type: 'error',
                content: '입장별 논조 글쓰기 처리 중 오류가 발생했습니다. 다시 시도해주세요.'
            };
        }
    }

    /**
     * 유틸리티 메서드들
     */
    private extractPoliticalSpectrum(message: string): PoliticalSpectrum {
        if (message.includes('극우') || message.includes('우파')) return 'extreme_right';
        if (message.includes('보수')) return 'conservative';
        if (message.includes('진보') || message.includes('좌파')) return 'progressive';
        if (message.includes('중도')) return 'center';
        return 'center';
    }

    private extractPoliticalStance(message: string): PoliticalStance {
        if (message.includes('강력히 지지') || message.includes('완전 찬성')) return 'strongly_support';
        if (message.includes('지지') || message.includes('찬성')) return 'support';
        if (message.includes('강력히 반대') || message.includes('완전 반대')) return 'strongly_oppose';
        if (message.includes('반대')) return 'oppose';
        return 'neutral';
    }

    private extractToneIntensity(message: string): ToneIntensity {
        if (message.includes('전투적') || message.includes('combative')) return 'combative';
        if (message.includes('공격적') || message.includes('aggressive')) return 'aggressive';
        if (message.includes('강성') || message.includes('militant')) return 'militant';
        if (message.includes('강하게') || message.includes('strong')) return 'strong';
        if (message.includes('단호하게') || message.includes('firm')) return 'firm';
        if (message.includes('부드럽게') || message.includes('gentle')) return 'gentle';
        return 'moderate';
    }

    private extractAgeGroup(message: string): AgeGroup {
        if (message.includes('50대')) return '50s';
        if (message.includes('60대')) return '60s';
        if (message.includes('70대')) return '70s';
        if (message.includes('80대')) return '80s_plus';
        if (message.includes('노인') || message.includes('어르신')) return '70s';
        return '60s';
    }

    private extractStancePosition(message: string): StancePosition {
        if (message.includes('강력히 찬성') || message.includes('완전 지지')) return 'strongly_support';
        if (message.includes('찬성') || message.includes('지지')) return 'support';
        if (message.includes('강력히 반대') || message.includes('완전 반대')) return 'strongly_oppose';
        if (message.includes('반대')) return 'oppose';
        if (message.includes('조건부 찬성')) return 'conditional_support';
        if (message.includes('조건부 반대')) return 'conditional_oppose';
        return 'neutral';
    }

    private extractStrengthLevel(message: string): string {
        if (message.includes('극도로') || message.includes('최고')) return 'extreme';
        if (message.includes('강하게') || message.includes('열정적')) return 'passionate';
        if (message.includes('확실하게') || message.includes('단호')) return 'strong';
        if (message.includes('온화하게') || message.includes('부드럽게')) return 'mild';
        return 'moderate';
    }

    private extractTopic(message: string): string {
        // 메시지에서 주제 추출 (간단한 구현)
        const topics = message
          .split(/에 대해|에 관해|에서|를|을|이|가/)
          .filter((part) => coerceTrimmedString(part, '').length > 2);
        return coerceTrimmedString(topics[0] ?? '', '');
    }

    /**
     * 스타일 복제 처리
     */
    private async handleStyleCloning(request: ConversationalRequest, _intent: IntentResult): Promise<ConversationalResponse> {
        try {
            const message = request.message;

            // 원본 텍스트와 새 주제 추출
            const originalText = this.extractOriginalText(message);
            const newTopic = this.extractNewTopic(message);

            if (!originalText || !newTopic) {
                return {
                    type: 'error',
                    content: '스타일 복제를 위해서는 원본 글과 새로운 주제를 모두 제공해주세요.\n\n예시: "이 글과 같은 스타일로 [새 주제]에 대해 써주세요"\n\n[원본 글 내용]'
                };
            }

            // 복제 정확도 추출
            const cloneAccuracy = this.extractCloneAccuracy(message);

            // 길이 조절 옵션 추출
            const lengthControl = this.extractLengthControl(message);

            const cloneRequest: UltimateStyleCloneRequest = {
                originalText,
                newTopic,
                cloneAccuracy,
                preserveQuirks: message.includes('정확히') || message.includes('똑같이'),
                adaptToTopic: !message.includes('완전히 똑같이'),
                creativityLevel: this.extractCreativityLevel(message),
                adaptationLevel: this.extractAdaptationLevel(message),
                preservationLevel: this.extractPreservationLevel(message),
                lengthControl: lengthControl as import('./ultimateStyleCloningService').LengthControl | undefined
            };

            const result = await ultimateStyleCloningService.cloneUltimateStyle(cloneRequest);

            const content = `🎯 **스타일 복제 완료** (품질: ${result.cloneQuality.overallScore}점)\n\n${result.clonedText}\n\n` +
                `📊 **복제 품질 분석:**\n` +
                `• 어휘 일치도: ${result.cloneQuality.aspectScores.vocabularyMatch}%\n` +
                `• 어조 일치도: ${result.cloneQuality.aspectScores.toneMatch}%\n` +
                `• 논리 일치도: ${result.cloneQuality.aspectScores.logicMatch}%\n` +
                `• 구조 일치도: ${result.cloneQuality.aspectScores.structureMatch}%\n\n` +
                `⚡ **처리 시간:** ${result.generationMetadata.processingTime}ms`;

            return {
                type: 'style_cloning',
                analysisType: 'style_clone',
                content,
                data: result as unknown as Record<string, unknown>,
                suggestions: [
                    '다른 정확도로 다시 복제해보기',
                    '특정 부분만 조정하여 재생성',
                    '대안 버전들 중에서 선택하기'
                ],
                followUpQuestions: [
                    '이 스타일로 다른 주제도 써드릴까요?',
                    '어조를 조금 더 조정해드릴까요?',
                    '길이를 조절해서 다시 써드릴까요?'
                ]
            };

        } catch (error) {
            const err = toError(error);
            errorLogger.error('스타일 복제 처리 실패', err, {
                component: 'conversationalAnalysisService',
                action: 'handleStyleCloning',
            });
            return {
                type: 'error',
                content: '스타일 복제 처리 중 오류가 발생했습니다. 다시 시도해주세요.'
            };
        }
    }

    /**
     * 스타일 분석 처리
     */
    private async handleStyleAnalysis(request: ConversationalRequest, _intent: IntentResult): Promise<ConversationalResponse> {
        try {
            const message = request.message;

            // 분석할 텍스트 추출
            const textToAnalyze = this.extractTextToAnalyze(message);

            if (!textToAnalyze) {
                return {
                    type: 'error',
                    content: '스타일 분석을 위해서는 분석할 텍스트를 제공해주세요.\n\n예시: "이 글의 스타일을 분석해주세요"\n\n[분석할 글 내용]'
                };
            }

            // 분석 깊이 추출
            const analysisDepth = this.extractAnalysisDepth(message);

            const analysisRequest = {
                originalText: textToAnalyze,
                context: 'user_request',
                analysisDepth,
                preserveNuances: message.includes('세밀') || message.includes('정밀'),
                extractPersonality: message.includes('성격') || message.includes('개성')
            };

            const result = await ultimateStyleCloningService.analyzeUltimateStyle(analysisRequest);

            const content = `🔍 **스타일 분석 완료** (신뢰도: ${result.analysisConfidence}%)\n\n` +
                `📝 **스타일 시그니처:** ${result.styleSignature.longForm}\n\n` +
                `🎯 **핵심 특징:**\n${result.comprehensiveAnalysis.coreCharacteristics.map(char =>
                    `• ${char.trait} (강도: ${char.strength}%)`).join('\n')}\n\n` +
                `🌟 **독특한 패턴:**\n${result.comprehensiveAnalysis.uniquePatterns.map(pattern =>
                    `• ${pattern.type}: ${pattern.pattern}`).join('\n')}\n\n` +
                `📊 **일관성 지표:**\n` +
                `• 어휘 일관성: ${result.comprehensiveAnalysis.consistencyMetrics.vocabularyConsistency}%\n` +
                `• 어조 일관성: ${result.comprehensiveAnalysis.consistencyMetrics.toneConsistency}%\n` +
                `• 논리 일관성: ${result.comprehensiveAnalysis.consistencyMetrics.logicalConsistency}%\n` +
                `• 전체 일관성: ${result.comprehensiveAnalysis.consistencyMetrics.overallConsistency}%\n\n` +
                `🎲 **복제 난이도:** ${result.comprehensiveAnalysis.cloningDifficulty}`;

            let personalityInfo = '';
            if (result.personalityProfile) {
                personalityInfo = `\n\n👤 **성격 프로필:**\n` +
                    `• 개방성: ${result.personalityProfile.openness}%\n` +
                    `• 성실성: ${result.personalityProfile.conscientiousness}%\n` +
                    `• 외향성: ${result.personalityProfile.extraversion}%\n` +
                    `• 친화성: ${result.personalityProfile.agreeableness}%\n` +
                    `• 글쓰기 자신감: ${result.personalityProfile.writingConfidence}%`;
            }

            return {
                type: 'style_analysis',
                analysisType: 'style_match',
                content: content + personalityInfo,
                data: result as unknown as Record<string, unknown>,
                suggestions: [
                    '이 스타일로 새로운 글 써보기',
                    '더 상세한 분석 요청하기',
                    '다른 글과 스타일 비교하기'
                ],
                followUpQuestions: [
                    '이 스타일로 다른 주제의 글을 써드릴까요?',
                    '이 글의 성격 분석도 해드릴까요?',
                    '다른 글과 스타일을 비교해드릴까요?'
                ]
            };

        } catch (error) {
            const err = toError(error);
            errorLogger.error('스타일 분석 처리 실패', err, {
                component: 'conversationalAnalysisService',
                action: 'handleStyleAnalysis',
            });
            return {
                type: 'error',
                content: '스타일 분석 처리 중 오류가 발생했습니다. 다시 시도해주세요.'
            };
        }
    }

    /**
     * 유틸리티 메서드들 - 스타일 복제 관련
     */
    private extractOriginalText(message: string): string {
        // 간단한 구현 - 실제로는 더 정교한 파싱 필요
        const patterns = [
            /이 글.*?:(.*?)새.*?주제/,
            /다음 글.*?:(.*?)이런.*?식으로/,
            /원본.*?글:(.*?)같은.*?스타일/
        ];

        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match && match[1]) {
                return coerceTrimmedString(match[1], '');
            }
        }

        // 긴 텍스트 블록 찾기
        const sentences = message.split(/[.!?]/).filter((s) => coerceTrimmedString(s, '').length > 50);
        if (sentences.length > 2) {
            return sentences.slice(0, -1).join('.') + '.';
        }

        return '';
    }

    private extractNewTopic(message: string): string {
        const patterns = [
            /새.*?주제.*?[은는이가]?\s*['""]([^'""]+)['""]/,
            /주제.*?[을를]?\s*['""]([^'""]+)['""]/,
            /([가-힣\s]+)에 대해.*?써/,
            /([가-힣\s]+)으로.*?써/,
            /([가-힣\s]+)를.*?주제로/
        ];

        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match && match[1]) {
                return coerceTrimmedString(match[1], '');
            }
        }

        // 마지막 문장에서 주제 추출 시도
        const lastSentence = coerceTrimmedString(message.split(/[.!?]/).pop() ?? '', '');
        if (lastSentence && lastSentence.length > 3 && lastSentence.length < 50) {
            return lastSentence;
        }

        return '';
    }

    private extractCloneAccuracy(message: string): 'perfect' | 'exact' | 'precise' | 'approximate' | 'close' {
        if (message.includes('완벽히') || message.includes('100%')) return 'perfect';
        if (message.includes('정확히') || message.includes('똑같이')) return 'exact';
        if (message.includes('정밀하게') || message.includes('세밀하게')) return 'precise';
        if (message.includes('비슷하게') || message.includes('대략')) return 'approximate';
        return 'close';
    }

    private extractLengthControl(message: string): { targetType: string; targetValue: number; allowFlexibility: boolean } | undefined {
        if (message.includes('같은 길이') || message.includes('동일한 길이')) {
            return {
                targetType: 'relative_length',
                targetValue: 1.0,
                allowFlexibility: false
            };
        }

        const wordMatch = message.match(/(\d+)자/);
        if (wordMatch) {
            return {
                targetType: 'exact_words',
                targetValue: parseInt(wordMatch[1], 10),
                allowFlexibility: true
            };
        }

        const lengthMatch = message.match(/(짧게|길게|간단히|상세히)/);
        if (lengthMatch) {
            const modifier = lengthMatch[1];
            if (modifier === '짧게' || modifier === '간단히') {
                return {
                    targetType: 'relative_length',
                    targetValue: 0.7,
                    allowFlexibility: true
                };
            } else {
                return {
                    targetType: 'relative_length',
                    targetValue: 1.3,
                    allowFlexibility: true
                };
            }
        }

        return undefined;
    }

    private extractCreativityLevel(message: string): number {
        if (message.includes('창의적으로') || message.includes('독창적으로')) return 80;
        if (message.includes('똑같이') || message.includes('정확히')) return 20;
        if (message.includes('약간 변형') || message.includes('조금 다르게')) return 60;
        return 40; // 기본값
    }

    private extractAdaptationLevel(message: string): number {
        if (message.includes('주제에 맞게') || message.includes('적응해서')) return 80;
        if (message.includes('그대로') || message.includes('변경하지 말고')) return 20;
        return 60; // 기본값
    }

    private extractPreservationLevel(message: string): number {
        if (message.includes('완전히 보존') || message.includes('그대로 유지')) return 95;
        if (message.includes('조금 바꿔도') || message.includes('약간 변형')) return 70;
        if (message.includes('많이 바꿔도') || message.includes('자유롭게')) return 50;
        return 85; // 기본값
    }

    private extractTextToAnalyze(message: string): string {
        // 분석할 텍스트 추출 로직
        const patterns = [
            /이 글.*?:(.*?)$/,
            /다음 글.*?:(.*?)$/,
            /분석할 글.*?:(.*?)$/
        ];

        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match && match[1]) {
                return coerceTrimmedString(match[1], '');
            }
        }

        // 긴 텍스트 블록 찾기 (분석 요청 키워드 제외)
        const cleanMessage = message.replace(/스타일.*?분석|어조.*?분석|문체.*?분석|분석해/, '');
        const cleaned = coerceTrimmedString(cleanMessage, '');
        if (cleaned.length > 100) {
            return cleaned;
        }

        return '';
    }

    private extractAnalysisDepth(message: string): 'ultimate' | 'comprehensive' | 'advanced' | 'basic' {
        if (message.includes('궁극적') || message.includes('최고 수준')) return 'ultimate';
        if (message.includes('종합적') || message.includes('완전한')) return 'comprehensive';
        if (message.includes('고급') || message.includes('상세한')) return 'advanced';
        if (message.includes('간단히') || message.includes('기본')) return 'basic';
        return 'comprehensive'; // 기본값
    }

    /**
     * 격식성 수준 추출
     */
    private extractFormalityLevel(message: string): string {
        if (message.includes('존경하는') || message.includes('경건한')) {
            return 'very_formal';
        } else if (message.includes('정중한') || message.includes('격식')) {
            return 'formal';
        } else if (message.includes('캐주얼') || message.includes('편안한')) {
            return 'informal';
        } else if (message.includes('친근한')) {
            return 'very_informal';
        }
        return 'moderate';
    }
}

// 확장된 서비스 인스턴스 생성
// 클래스 선언 후 인스턴스 생성

/**
 * 사용 예시:
 * 
 * // 기본 성향 분석
 * conversationalAnalysisService.processMessage({ message: "참여자들 성향 어때?" });
 * 
 * // 고급 서술적 분석
 * conversationalAnalysisService.processMessage({ message: "이 내용을 연구자 관점에서 자세히 분석해줘" });
 * 
 * // 텍스트 조작
 * conversationalAnalysisService.processMessage({ message: "이 글의 반박문을 써줘" });
 * 
 * // 학술적 분석
  * conversationalAnalysisService.processMessage({ message: "논문 수준으로 체계적 분석해줘" });
 */

class ConversationalAnalysisServiceExtended extends ConversationalAnalysisService {
    // AI 스마트 제안 생성
    async generateSmartSuggestions(message: string, _context?: Record<string, unknown>): Promise<{ suggestions: string[] }> {
        const suggestions: string[] = [];

        if (message.includes('분석')) {
            suggestions.push('카카오톡 대화 성향을 분석해주세요');
            suggestions.push('여론 동향을 상세히 분석해주세요');
            suggestions.push('편향성 검토를 해주세요');
        }

        if (message.includes('글') || message.includes('작성')) {
            suggestions.push('전문가 스타일로 글을 작성해주세요');
            suggestions.push('정치평론가 관점에서 써주세요');
            suggestions.push('설득력 있는 논술문으로 작성해주세요');
        }

        if (message.includes('개선') || message.includes('향상')) {
            suggestions.push('이 텍스트의 논리구조를 개선해주세요');
            suggestions.push('더 설득력 있게 수정해주세요');
            suggestions.push('독자 관점에서 개선방안을 제시해주세요');
        }

        // 기본 제안
        if (suggestions.length === 0) {
            suggestions.push('더 구체적으로 설명해주세요');
            suggestions.push('다른 관점에서 분석해주세요');
            suggestions.push('실용적인 해결방안을 제시해주세요');
        }

        return { suggestions };
    }
}

// 확장된 서비스 인스턴스 생성 및 export
export const conversationalAnalysisService = new ConversationalAnalysisServiceExtended();
