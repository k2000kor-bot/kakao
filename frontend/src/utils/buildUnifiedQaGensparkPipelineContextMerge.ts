import { resolveDeepseekFlagsForConversation } from '../config/deepseekUiDefaults';
import { buildGensparkAgenticContextHints } from '../services/gensparkAgenticPrompts';
import { buildDeepSeekReviewContextHints } from '../services/deepseekReviewPrompts';
import {
    coerceTrimmedString,
    getProjectlessLongInputPipelineFlags,
    omitHollowStructuredParsedInput,
    parseInputIntent,
    parseQuestionRequirementSections,
} from './chatInputUtils';
import {
    buildComposerOversightPlan,
    mergeComposerOversightIntoContext,
} from './composerOversightPipeline';
import { isComposerAnswerSelfDevelopEnabled } from './composerAnswerSelfDevelopment';
import { shouldUseSimpleComposerOutboundMessageForTurn } from './composerStreamResponseText';
import { GRAPH_ANSWER_CONTEXT_FLAG } from '../views/conversationGraphAnswerGeneration';

/** 대화별 딥시크 플래그 — 컴포넌트 `Conversation`과 호환되는 최소 형태 */
export type UnifiedQaPipelineConversationDeepseek = Pick<
    { deepseekReviewHints?: boolean; pipelineDeepSeekRefine?: boolean; pipelineDeepSeekReasoner?: boolean },
    'deepseekReviewHints' | 'pipelineDeepSeekRefine' | 'pipelineDeepSeekReasoner'
> | null;

export type BuildUnifiedQaGensparkPipelineContextMergeOptions = {
    trimmedInput: string;
    /** 첨부 병합 후 프롬프트 — 미지정 시 trimmedInput과 동일 */
    effectiveInput?: string;
    featureCtx: Record<string, unknown>;
    currentProjectId?: string;
    gensparkRouteAgentId?: string;
    composerResponseMode: string;
    responseStyle: string;
    conversationFileContent?: string;
    threadAttachedFileContents?: string | null;
    /** 대화별 딥시크 — 미저장 필드는 전역 기본 */
    conversationDeepseek?: UnifiedQaPipelineConversationDeepseek;
    /** 이 대화 지침·대화 전용 첨부가 있으면 프로젝트 없이도 구조화·파이프라인 우선 */
    hasConversationThreadContext?: boolean;
};

export type BuildUnifiedQaGensparkPipelineContextMergeResult = {
    parsedInput?: {
        question?: string;
        requirements?: string;
        intent_type: string;
        intent_confidence: number;
    };
    /** Q→A 플래그 + 항상 `input_intent_hint` */
    pipelineMerge: Record<string, unknown>;
};

/**
 * Q→A + Genspark 계약(context 플래그) — 일반 전송·재생성·편집이 동일한 다단계 생성 경로를 쓰도록 공유.
 * `process.env` 플래그는 호출 시점에 읽어 테스트에서 `withProcessEnv`로 덮어쓸 수 있게 한다.
 */
export function buildUnifiedQaGensparkPipelineContextMerge(
    options: BuildUnifiedQaGensparkPipelineContextMergeOptions
): BuildUnifiedQaGensparkPipelineContextMergeResult {
    const {
        trimmedInput,
        effectiveInput,
        featureCtx,
        currentProjectId,
        gensparkRouteAgentId,
        composerResponseMode,
        responseStyle,
        conversationFileContent,
        threadAttachedFileContents,
        conversationDeepseek,
        hasConversationThreadContext: hasThreadCtxOpt,
    } = options;
    const hasThreadCtx = Boolean(hasThreadCtxOpt);
    const ds = resolveDeepseekFlagsForConversation(conversationDeepseek ?? undefined);
    const parsedSections = parseQuestionRequirementSections(trimmedInput);
    const inputIntent = parseInputIntent(trimmedInput);
    let parsedInput = omitHollowStructuredParsedInput(
        parsedSections.hasBoth || inputIntent.type !== 'general'
            ? {
                  question: parsedSections.question || inputIntent.question || undefined,
                  requirements: parsedSections.requirements || inputIntent.requirements || undefined,
                  intent_type: inputIntent.type,
                  intent_confidence: inputIntent.confidence,
              }
            : undefined
    );
    if (!parsedInput && hasThreadCtx) {
        const q = coerceTrimmedString(trimmedInput, '');
        if (q) {
            parsedInput = {
                question: q,
                requirements: undefined,
                intent_type: inputIntent.type,
                intent_confidence: Math.max(inputIntent.confidence, 0.35),
            };
        }
    }

    const wantsStructuredQaWithoutProject =
        !currentProjectId &&
        (!!parsedInput ||
            !!featureCtx.prefer_informed_answer ||
            !!featureCtx.enable_web_research ||
            conversationFileContent !== undefined ||
            hasThreadCtx);

    const { longProjectlessFast, longProjectlessLite } = getProjectlessLongInputPipelineFlags({
        trimmedInput,
        currentProjectId,
        gensparkRouteAgentId,
    });

    const agentGensparkSession = Boolean(gensparkRouteAgentId);
    /** 스레드 지침·첨부가 있으면 맥락형 QA — 짧은 문장이라도 fast path 생략 */
    const isSimpleComposerQuery =
        !hasThreadCtx &&
        (featureCtx.composer_simple_query === true ||
            shouldUseSimpleComposerOutboundMessageForTurn({
                trimmedInput,
                effectiveInput,
                conversationFileContent,
                threadAttachedFileContents,
            }));

    const skipWriterPolish =
        typeof process !== 'undefined' && process.env.REACT_APP_PIPELINE_SKIP_WRITER_POLISH === 'true';
    const verifierRewrite =
        typeof process !== 'undefined' && process.env.REACT_APP_PIPELINE_VERIFIER_REWRITE === 'true';
    const omitGenerationScenarioInResponse =
        typeof process !== 'undefined' && process.env.REACT_APP_INCLUDE_QA_GENERATION_SCENARIO === '0';

    const qaPipelineGensparkBlock: Record<string, unknown> = isSimpleComposerQuery
        ? {
              qa_pipeline_fast_path: true,
              use_pipeline_v2: false,
              agentic_pipeline: false,
              agentic_genspark_style: false,
          }
        : {
        use_pipeline_v2: true,
        agentic_pipeline: true,
        agentic_genspark_style: true,
        ...buildGensparkAgenticContextHints(gensparkRouteAgentId),
        ...(composerResponseMode === 'concise' ? { qa_pipeline_fast_path: true } : {}),
        ...(longProjectlessFast && !longProjectlessLite ? { qa_pipeline_fast_path: true } : {}),
        ...(longProjectlessLite
            ? {
                  use_pipeline_v2: false,
                  agentic_pipeline: false,
                  agentic_genspark_style: false,
                  qa_pipeline_fast_path: true,
              }
            : {}),
        ...(responseStyle === 'detailed' || responseStyle === 'comprehensive'
            ? { answer_mode: 'expert' as const }
            : responseStyle === 'concise'
              ? { answer_mode: 'fast' as const }
              : responseStyle === 'balanced'
                ? { answer_mode: 'guided' as const }
                : {}),
        ...(ds.review && {
            deepseek_review_layer_hints: true,
            ...buildDeepSeekReviewContextHints(),
            ...(ds.refine ? { pipeline_deepseek_refine: true } : {}),
            ...(ds.reasoner ? { pipeline_deepseek_reasoner: true } : {}),
        }),
        ...(skipWriterPolish ? { pipeline_skip_writer_llm_polish: true } : {}),
        ...(verifierRewrite ? { pipeline_verifier_rewrite: true } : {}),
        ...(omitGenerationScenarioInResponse && !agentGensparkSession
            ? {}
            : { include_generation_scenario_in_response: true }),
    };

    const projectlessChatGensparkStyle =
        typeof process !== 'undefined' &&
        process.env.REACT_APP_CHAT_GENSPARK_STYLE !== '0' &&
        !currentProjectId &&
        !agentGensparkSession;
    const attachQaGenspark =
        Boolean(currentProjectId) ||
        wantsStructuredQaWithoutProject ||
        agentGensparkSession ||
        projectlessChatGensparkStyle;
    const qaAllowEmptyProject =
        !currentProjectId &&
        (wantsStructuredQaWithoutProject || agentGensparkSession || projectlessChatGensparkStyle);

    const pipelineMergeBase = isSimpleComposerQuery
        ? { ...qaPipelineGensparkBlock }
        : attachQaGenspark
          ? {
                ...qaPipelineGensparkBlock,
                ...(qaAllowEmptyProject ? { qa_pipeline_allow_empty_project: true } : {}),
            }
          : {};

    const selfDevelopEligible =
        isComposerAnswerSelfDevelopEnabled() && featureCtx.composer_simple_query !== true;
    const oversightPlan = buildComposerOversightPlan(trimmedInput, {
        multiRequestItems: Array.isArray(featureCtx.multi_request_items)
            ? (featureCtx.multi_request_items as string[])
            : undefined,
        skipWhenGraphAnswer: featureCtx[GRAPH_ANSWER_CONTEXT_FLAG] === true,
        skipForSimpleQuery: featureCtx.composer_simple_query === true,
        includeSelfDevelop: selfDevelopEligible,
    });

    /** Q→A 블록 유무와 관계없이 호출부가 `...pipelineMerge`로 펼칠 때 항상 의도 힌트 전달 */
    const pipelineMerge: Record<string, unknown> = mergeComposerOversightIntoContext(
        {
            ...pipelineMergeBase,
            input_intent_hint: {
                intent_type: inputIntent.type,
                intent_confidence: inputIntent.confidence,
            },
            ...(oversightPlan.enabled &&
            isComposerAnswerSelfDevelopEnabled() &&
            !featureCtx.composer_simple_query
                ? { composer_self_develop_enabled: true }
                : {}),
        },
        oversightPlan,
    );

    return { parsedInput, pipelineMerge };
}
