import { buildUnifiedApiChatRequestBody, sendChatMessage } from '../services/unifiedAPI';
import {
  coerceTrimmedString,
  extractResponseContent,
  getAssistantGenerationPhase,
  runAssistantNonStreamPostResponsePhases,
  type AssistantGenerationPhase,
} from '../utils/chatInputUtils';
import { isStreamingSupported, streamChatMessage } from '../utils/streamingClient';
import {
  CONVERSATION_GRAPH_CHAT_AUTOSEND_STATE_KEY,
  CONVERSATION_GRAPH_CHAT_CONTEXT_STATE_KEY,
  CONVERSATION_GRAPH_CHAT_DRAFT_STATE_KEY,
} from '../config/routes';
import type { RelationshipGraphData } from '../services/conversationGraphService';
import type { GraphAiAnalysis, ParticipantAiInsight } from './conversationGraphAiAnalyzer';
import { buildGraphAiNarrativePrompt } from './conversationGraphAiNarrative';
import {
  createGraphAnswerPipelineController,
  resolveGraphAnswerDisplayText,
} from './conversationGraphAnswerPipeline';
import {
  buildGraphAnswerContextWithRevision,
  isGraphAnswerSelfImproveEnabled,
} from './conversationGraphAnswerSelfImprove';
import {
  GRAPH_ANSWER_SELF_IMPROVE_MAX_ATTEMPTS,
  verifyGraphAnswerAgainstContext,
} from './conversationGraphAnswerVerifier';
import {
  buildDeterministicGraphAnswerSections,
  GRAPH_STRUCTURED_SECTIONS_KEY,
} from './conversationGraphDeterministicSections';
import { buildGraphAnswerLessonsPrompt, recordGraphAnswerLessonFromContext } from './conversationGraphAnswerLearning';
import {
  getStructuredSectionsFromContext,
  mergeGraphAnswerWithDeterministicSections,
} from './conversationGraphAnswerSynthesis';
import {
  buildGraphAnswerOutlineContext,
  buildGraphAnswerReportContext,
  GRAPH_ANSWER_SKIP_STRUCTURED_MERGE_KEY,
  shouldUseGraphAnswerTwoPass,
} from './conversationGraphAnswerTwoPass';
import { buildExpertGraphSnapshotForAnswer } from './conversationGraphExpertSnapshot';
import type { ExpertLayerId } from './conversationGraphExpertLayers';
import {
  buildCreateGraphAnswerInstruction,
  CREATE_GRAPH_ANSWER_PRESET,
  isCreateGraphAnswerRequest,
  resolveGraphAnswerUserMessage,
  truncateRawConversationForAnswer,
} from './conversationGraphAnswerIntent';
import {
  formatGraphAnswerHistoryForContext,
  type GraphAnswerTurn,
} from './conversationGraphAnswerTurns';
import {
  buildGraphAnswerFormatCurriculumPrompt,
  buildGraphAnswerDocumentFormatInstruction,
  inferGraphAnswerDocumentFormat,
  type GraphAnswerDocumentFormatId,
} from './conversationGraphAnswerDocumentFormats';
import {
  buildGraphAnswerWritingStyleInstruction,
  inferGraphAnswerWritingStyle,
  polishGraphAnswerMarkdownForContext,
} from './conversationGraphAnswerProse';

export { resolveGraphAnswerDisplayText } from './conversationGraphAnswerPipeline';

/** 통합 대화 API `context`에 실을 관계도 분석 키 */
export const GRAPH_ANSWER_CONTEXT_FLAG = 'conversation_graph_analysis';

export interface GraphAnswerGenerationInput {
  analysis: GraphAiAnalysis;
  narrative?: string;
  conversationTitle?: string;
  periodLabel?: string;
  selectedInsight?: ParticipantAiInsight | null;
  /** 답변 생성 API에 포함할 관계도 스냅샷(활발한 연결·입장 분포) */
  graph?: RelationshipGraphData | null;
  /** 파이프라인 플래그·다단계 생성용 사용자 지시문 */
  userMessage?: string;
  expertLayer?: ExpertLayerId;
  /** 서버 관계도 없을 때 답변 맥락용 대화 원문(붙여넣기 등) */
  rawConversationText?: string;
  /** 같은 패널에서 이어진 이전 질문·답변(연속 생성) */
  previousTurns?: GraphAnswerTurn[];
  /** UI에서 고정한 문서 형식(추론보다 우선) */
  documentFormatOverride?: GraphAnswerDocumentFormatId;
}

/** 관계도 노드·엣지·근거 발언 요약 (답변 맥락용) */
export function buildGraphSnapshotForAnswer(
  graph: RelationshipGraphData | null | undefined,
  analysis?: GraphAiAnalysis | null,
  selectedInsight?: ParticipantAiInsight | null,
  expertLayer?: ExpertLayerId,
): string {
  if (!graph || (graph.nodes ?? []).length === 0) return '';
  return buildExpertGraphSnapshotForAnswer({
    graph,
    analysis: analysis ?? null,
    selectedInsight,
    expertLayer,
  });
}

export interface GraphAnswerPromptPreset {
  id: string;
  label: string;
  prompt: string;
}

/** 선택 참여자 중심 답변 생성 프리셋 */
export function buildParticipantAnswerPreset(insight: ParticipantAiInsight): GraphAnswerPromptPreset {
  return {
    id: 'participant',
    label: insight.label,
    prompt: [
      `선택된 참여자 「${insight.label}」를 중심으로 관계도·성향 분석을 해석해 주세요.`,
      `우세 입장: ${insight.dominantStance}, 주고받기 역할: ${insight.exchangeRole}.`,
      insight.profileLine,
      '수치·프로필에 없는 내용은 추측하지 마세요.',
    ].join(' '),
  };
}

export const GRAPH_ANSWER_PROMPT_PRESETS: GraphAnswerPromptPreset[] = [
  {
    id: CREATE_GRAPH_ANSWER_PRESET.id,
    label: CREATE_GRAPH_ANSWER_PRESET.label,
    prompt: CREATE_GRAPH_ANSWER_PRESET.prompt,
  },
  {
    id: 'report',
    label: '보고서',
    prompt:
      '아래 대화 관계도·AI 성향 분석을 바탕으로, 참여자 간 동조·반대·주고받기(주도/응답) 구조를 정리한 보고서를 작성해 주세요. 수치에 없는 내용은 추측하지 마세요.',
  },
  {
    id: 'conflict',
    label: '갈등 요약',
    prompt:
      '관계도에서 반대·대립 연결이 두드러지는 구간과 그에 관여하는 참여자를 중심으로, 갈등 축과 완화 가능 지점을 요약해 주세요.',
  },
  {
    id: 'action',
    label: '실행 제안',
    prompt:
      '관계도 분석을 근거로, 조합·재개발 단체 채팅방에서 의사소통·합의를 돕기 위한 구체적 실행 제안 3가지를 제시해 주세요.',
  },
];

/** 통합 답변 생성 API에 넘길 `context` 레코드 (메인 채팅과 동일 merge 경로) */
export function buildGraphAnswerChatContext(input: GraphAnswerGenerationInput): Record<string, unknown> {
  const summary = buildGraphAiNarrativePrompt(input.analysis);
  const snapshot = buildGraphSnapshotForAnswer(
    input.graph,
    input.analysis,
    input.selectedInsight,
    input.expertLayer,
  );
  const userMsg = coerceTrimmedString(input.userMessage, '');
  const hasGraphNodes = (input.graph?.nodes ?? []).length > 0;
  const rawConversation = truncateRawConversationForAnswer(
    coerceTrimmedString(input.rawConversationText, ''),
  );
  const isCreateGraph = isCreateGraphAnswerRequest(userMsg);
  const structuredSections = hasGraphNodes
    ? buildDeterministicGraphAnswerSections({
        graph: input.graph!,
        analysis: input.analysis,
        conversationTitle: input.conversationTitle,
        periodLabel: input.periodLabel,
      })
    : '';
  const historyBlock = input.previousTurns?.length
    ? formatGraphAnswerHistoryForContext(input.previousTurns)
    : '';
  const writingStyle = inferGraphAnswerWritingStyle(userMsg);
  const documentFormat = isCreateGraph
    ? 'graph_deliverable'
    : input.documentFormatOverride ?? inferGraphAnswerDocumentFormat(userMsg, writingStyle);
  const lessonsPrompt = buildGraphAnswerLessonsPrompt(documentFormat);
  const styleInstruction = buildGraphAnswerWritingStyleInstruction(
    isCreateGraph ? 'create' : writingStyle,
  );
  const formatInstruction = buildGraphAnswerDocumentFormatInstruction(
    documentFormat,
    userMsg,
    Boolean(structuredSections),
  );
  const formatCurriculum = buildGraphAnswerFormatCurriculumPrompt();
  const synthesisHint = structuredSections
    ? ' [구조화 데이터 블록]에 참여자 표·연결 표·Mermaid가 이미 포함되어 있습니다. 표·Mermaid를 다시 만들지 말고, 선택한 문서 형식의 제목 골격에 맞게 서술·해석·권고를 풍부하게 작성하세요.'
    : '';
  const defaultInstruction =
    '대화 관계도·성향·족보 계층·시공사 반응 신호·근거 발언 샘플만 근거로 답하세요. 시공사 선호는 확정이 아닌 추정임을 밝히고, 수치·참여자·발언 인용에 없는 사실은 추측하지 마세요. 사용자가 요청한 문서 형식(보고서·논문·문학·회의록 등)에 맞는 마크다운만 출력하세요.';
  const nodeCount = input.graph?.nodes?.length ?? 0;
  const edgeCount = input.graph?.edges?.length ?? 0;
  return {
    prefer_informed_answer: true,
    multi_request_mode: false,
    [GRAPH_ANSWER_CONTEXT_FLAG]: true,
    input_intent_hint: isCreateGraph ? 'conversation_graph_create' : 'conversation_graph_answer',
    conversation_graph_summary: summary,
    conversation_graph_snapshot: snapshot,
    conversation_graph_narrative: input.narrative?.trim() ?? '',
    conversation_graph_trust_score: input.analysis.trustScore,
    conversation_graph_trust_label: input.analysis.trustLabel,
    conversation_graph_title: input.conversationTitle ?? '',
    conversation_graph_period: input.periodLabel ?? '',
    conversation_graph_expert_layer: input.expertLayer ?? 'all',
    conversation_graph_has_data: hasGraphNodes,
    ...(rawConversation && !snapshot
      ? { conversation_graph_raw_conversation: rawConversation }
      : {}),
    ...(input.selectedInsight
      ? {
          conversation_graph_selected_participant: JSON.stringify({
            id: input.selectedInsight.id,
            label: input.selectedInsight.label,
            dominantStance: input.selectedInsight.dominantStance,
            exchangeRole: input.selectedInsight.exchangeRole,
            profileLine: input.selectedInsight.profileLine,
          }),
        }
      : {}),
    conversation_graph_methodology: input.analysis.methodology.join(' '),
    ...(structuredSections ? { [GRAPH_STRUCTURED_SECTIONS_KEY]: structuredSections } : {}),
    ...(nodeCount > 0
      ? {
          conversation_graph_lesson_participant_count: nodeCount,
          conversation_graph_lesson_edge_count: edgeCount,
        }
      : {}),
    conversation_graph_writing_style: isCreateGraph ? 'create' : writingStyle,
    conversation_graph_document_format: documentFormat,
    conversation_graph_user_message: userMsg,
    ...(historyBlock ? { conversation_graph_answer_history: historyBlock } : {}),
    answer_quality_instruction: [
      isCreateGraph
        ? buildCreateGraphAnswerInstruction(hasGraphNodes, Boolean(rawConversation))
        : defaultInstruction,
      formatCurriculum,
      formatInstruction,
      styleInstruction,
      historyBlock
        ? '이전 질문·답변 맥락을 이어 받되, 현재 요청에 맞는 글 유형·한국어 문체로 정리하세요.'
        : '',
      synthesisHint,
      lessonsPrompt,
    ]
      .filter(Boolean)
      .join(' '),
  };
}

/** API 전송용 메시지·관계도 생성 의도 여부 */
export function prepareGraphAnswerGenerationMessage(
  message: string,
  hasGraphNodes: boolean,
): { apiMessage: string; isCreateGraph: boolean } {
  const resolved = resolveGraphAnswerUserMessage(message, hasGraphNodes);
  return { apiMessage: resolved.message, isCreateGraph: resolved.isCreateGraph };
}

/** 관계도 답변 context에서 multi_request·파이프라인 잔여 키 제거 */
export function sealConversationGraphChatContext(
  context: Record<string, unknown>,
): Record<string, unknown> {
  if (context[GRAPH_ANSWER_CONTEXT_FLAG] !== true) {
    return context;
  }
  const next: Record<string, unknown> = { ...context, multi_request_mode: false };
  delete next.multi_request_items;
  delete next.multi_request_adaptation_instruction;
  return next;
}

/** 통합 `/chat` POST·스트리밍 본문 `message` — 관계도 맥락이면 짧은 사용자 문장만 */
export function resolveUnifiedChatGraphOutboundMessage(
  trimmedInput: string,
  context: Record<string, unknown>,
  fallbackMessage: string,
): string {
  if (context[GRAPH_ANSWER_CONTEXT_FLAG] !== true) {
    return fallbackMessage;
  }
  const hasGraphNodes =
    context.conversation_graph_has_data === true ||
    Boolean(coerceTrimmedString(String(context.conversation_graph_snapshot ?? ''), ''));
  return prepareGraphAnswerGenerationMessage(trimmedInput, hasGraphNodes).apiMessage;
}

export { isCreateGraphAnswerRequest } from './conversationGraphAnswerIntent';

export type GraphAnswerGenerateOptions = {
  onChunk?: (accumulated: string, displayText: string) => void;
  onPhase?: (phase: AssistantGenerationPhase) => void;
  onPhaseText?: (text: string) => void;
  onMetadata?: (meta: Record<string, unknown>) => void;
  /** 자가 개선 재시도 직전(attempt는 1부터) */
  onSelfImproveRetry?: (attempt: number, issues: string[]) => void;
  signal?: AbortSignal;
  preferStream?: boolean;
  /** true면 비스트림 응답 후 crosscheck·verify 단계 대기를 생략 */
  skipPostPhases?: boolean;
  /** false면 검증·재생성 루프 비활성(기본 env로 제어) */
  selfImprove?: boolean;
  /** undefined면 UI prefs·env로 2-pass 여부 결정 */
  twoPass?: boolean;
};

async function maybeRunGraphAnswerPostPhases(opts?: GraphAnswerGenerateOptions): Promise<void> {
  if (!opts?.onPhase || opts.skipPostPhases || opts.signal?.aborted) return;
  opts.onPhase('crosscheck');
  await runAssistantNonStreamPostResponsePhases(
    (text) => {
      if (opts.signal?.aborted) return;
      const phase = getAssistantGenerationPhase(text);
      if (phase) opts.onPhase?.(phase);
    },
    { benchmarkGenspark: true },
  );
}

function buildGraphAnswerRequestBody(
  message: string,
  context: Record<string, unknown>,
): Record<string, unknown> {
  return buildUnifiedApiChatRequestBody({
    message,
    quality: 'enhanced',
    context,
    response_style: 'detailed',
    perspective: 'practical',
  });
}

function finalizeGraphAnswerRaw(
  raw: string,
  context?: Record<string, unknown>,
): string | null {
  const display = resolveGraphAnswerDisplayText(raw);
  if (!display) return null;
  const userMessage = coerceTrimmedString(
    String(context?.conversation_graph_user_message ?? ''),
    '',
  );
  const polish = (body: string) =>
    polishGraphAnswerMarkdownForContext(body, userMessage, context) || null;
  if (context?.[GRAPH_ANSWER_SKIP_STRUCTURED_MERGE_KEY] === true) {
    return polish(display);
  }
  const structured = context ? getStructuredSectionsFromContext(context) : '';
  const merged = mergeGraphAnswerWithDeterministicSections(display, structured);
  return merged ? polish(merged) : null;
}

function finalizeGraphAnswerFromStream(
  streamText: string,
  accumulated: string,
  context?: Record<string, unknown>,
): string | null {
  const trimmedStream = coerceTrimmedString(streamText, '');
  const trimmedAccum = accumulated.trim();
  return (
    finalizeGraphAnswerRaw(trimmedStream, context) ||
    (trimmedAccum !== trimmedStream ? finalizeGraphAnswerRaw(trimmedAccum, context) : null)
  );
}

async function runGraphAnswerGenerationOnce(
  trimmed: string,
  context: Record<string, unknown>,
  opts: GraphAnswerGenerateOptions | undefined,
  pipeline: ReturnType<typeof createGraphAnswerPipelineController>,
  preferStream: boolean,
): Promise<string | null> {
  if (preferStream) {
    let accumulated = '';
    let streamFollowUpStarted = false;
    const sessionId = `graph-answer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const body = buildGraphAnswerRequestBody(trimmed, context);

    try {
      pipeline.startNonStreamTimers();
      const text = await streamChatMessage(trimmed, sessionId, {
        signal: opts?.signal,
        requestBody: body,
        onMetadata: (meta) => {
          pipeline.handleMetadata(meta);
          opts?.onMetadata?.(meta);
        },
        onChunk: (chunk) => {
          accumulated += chunk;
          const { displayText } = pipeline.handleAccumulated(accumulated);
          if (displayText && !streamFollowUpStarted) {
            streamFollowUpStarted = true;
            pipeline.startStreamFollowUpPhases();
          }
          opts?.onChunk?.(accumulated, displayText);
        },
      });
      pipeline.cancel();
      const finalized = finalizeGraphAnswerFromStream(text, accumulated, context);
      if (finalized) {
        return finalized;
      }
    } catch {
      pipeline.cancel();
      if (opts?.signal?.aborted) return null;
    }
  }

  pipeline.startNonStreamTimers();
  const res = await sendChatMessage({
    message: trimmed,
    quality: 'enhanced',
    context,
    response_style: 'detailed',
    perspective: 'practical',
  });
  pipeline.cancel();

  if (res.success && res.message?.content?.trim()) {
    const finalized = finalizeGraphAnswerRaw(res.message.content, context);
    if (finalized) {
      await maybeRunGraphAnswerPostPhases(opts);
      if (opts?.signal?.aborted) return null;
      opts?.onChunk?.(res.message.content, finalized);
      return finalized;
    }
  }
  const wrapped = extractResponseContent(res.rawResponse !== undefined ? res.rawResponse : res);
  if (wrapped && !wrapped.includes('응답을 생성할 수 없습니다')) {
    const finalized = finalizeGraphAnswerRaw(wrapped, context);
    if (finalized) {
      await maybeRunGraphAnswerPostPhases(opts);
      if (opts?.signal?.aborted) return null;
      opts?.onChunk?.(wrapped, finalized);
      return finalized;
    }
  }
  return null;
}

function finalizeGraphAnswerDraft(
  draft: string,
  context: Record<string, unknown>,
  userMessage: string,
  verificationPass: boolean,
): string {
  const structured = getStructuredSectionsFromContext(context);
  const merged = mergeGraphAnswerWithDeterministicSections(draft, structured);
  if (verificationPass && merged) {
    recordGraphAnswerLessonFromContext(merged, context, userMessage);
  }
  return merged || draft;
}

/** 관계도 분석 맥락으로 통합 채팅 API 답변 생성 (스트리밍 우선, 검증 실패 시 1회 자동 재생성) */
export async function generateGraphAnswerViaChat(
  userMessage: string,
  context: Record<string, unknown>,
  opts?: GraphAnswerGenerateOptions,
): Promise<string | null> {
  const hasGraphNodes =
    context.conversation_graph_has_data === true ||
    Boolean(
      typeof context.conversation_graph_snapshot === 'string' &&
        String(context.conversation_graph_snapshot).trim(),
    );
  const { apiMessage } = prepareGraphAnswerGenerationMessage(userMessage, hasGraphNodes);
  const trimmed = apiMessage.trim();
  if (!trimmed) return null;

  const preferStream = opts?.preferStream !== false && isStreamingSupported();
  const selfImprove =
    opts?.selfImprove !== false && isGraphAnswerSelfImproveEnabled();
  const maxAttempts = selfImprove ? GRAPH_ANSWER_SELF_IMPROVE_MAX_ATTEMPTS : 1;

  let workingContext = sealConversationGraphChatContext({ ...context });

  try {
    if (shouldUseGraphAnswerTwoPass(workingContext, opts?.twoPass)) {
      opts?.onPhase?.('outline');
      const outlinePipeline = createGraphAnswerPipelineController({
        onPhase: opts?.onPhase,
        onPhaseText: opts?.onPhaseText,
      });
      const outlineDraft = await runGraphAnswerGenerationOnce(
        trimmed,
        buildGraphAnswerOutlineContext(workingContext),
        {
          ...opts,
          onChunk: undefined,
          preferStream: false,
          skipPostPhases: true,
          selfImprove: false,
        },
        outlinePipeline,
        false,
      );
      const outline = resolveGraphAnswerDisplayText(outlineDraft ?? '');
      if (outline && outline.length >= 40) {
        workingContext = sealConversationGraphChatContext(
          buildGraphAnswerReportContext(workingContext, outline),
        );
        opts?.onPhase?.('draft');
      }
    }

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      if (opts?.signal?.aborted) return null;

      const pipeline = createGraphAnswerPipelineController({
        onPhase: opts?.onPhase,
        onPhaseText: opts?.onPhaseText,
      });

      const draft = await runGraphAnswerGenerationOnce(
        trimmed,
        workingContext,
        opts,
        pipeline,
        preferStream,
      );

      if (!draft) {
        const structuredOnly = getStructuredSectionsFromContext(workingContext);
        return structuredOnly || null;
      }

      if (!selfImprove) {
        opts?.onPhase?.('verify');
        return finalizeGraphAnswerDraft(draft, workingContext, trimmed, false);
      }

      const verification = verifyGraphAnswerAgainstContext(
        finalizeGraphAnswerDraft(draft, workingContext, trimmed, false),
        workingContext,
      );
      if (verification.pass) {
        opts?.onPhase?.('verify');
        return finalizeGraphAnswerDraft(draft, workingContext, trimmed, true);
      }

      const isLastAttempt = attempt >= maxAttempts - 1;
      if (isLastAttempt) {
        opts?.onPhase?.('verify');
        return finalizeGraphAnswerDraft(draft, workingContext, trimmed, false);
      }

      opts?.onPhase?.('crosscheck');
      opts?.onSelfImproveRetry?.(attempt + 1, verification.issues);
      workingContext = buildGraphAnswerContextWithRevision(
        workingContext,
        verification.issues,
        attempt,
      );
      opts?.onPhase?.('retry');
    }

    return null;
  } catch {
    return null;
  }
}

/** `/chat` 이동용 `location.state` */
export function buildGraphAnswerChatNavState(
  draft: string,
  context: Record<string, unknown>,
  autoSend: boolean,
): Record<string, unknown> {
  const state: Record<string, unknown> = {
    [CONVERSATION_GRAPH_CHAT_CONTEXT_STATE_KEY]: context,
  };
  const t = draft.trim();
  if (t) {
    state[CONVERSATION_GRAPH_CHAT_DRAFT_STATE_KEY] = t;
  }
  if (autoSend && t) {
    state[CONVERSATION_GRAPH_CHAT_AUTOSEND_STATE_KEY] = true;
  }
  return state;
}
