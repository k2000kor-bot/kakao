import { buildUnifiedApiChatRequestBody, sendChatMessage } from '../services/unifiedAPI';
import {
  buildFeatureContextFromMessage,
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
import { buildExpertGraphSnapshotForAnswer } from './conversationGraphExpertSnapshot';
import type { ExpertLayerId } from './conversationGraphExpertLayers';
import {
  buildCreateGraphAnswerInstruction,
  CREATE_GRAPH_ANSWER_PRESET,
  isCreateGraphAnswerRequest,
  resolveGraphAnswerUserMessage,
  truncateRawConversationForAnswer,
} from './conversationGraphAnswerIntent';

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
    label: `${insight.label} 분석`,
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
    label: '관계도 보고서',
    prompt:
      '아래 대화 관계도·AI 성향 분석을 바탕으로, 참여자 간 동조·반대·주고받기(주도/응답) 구조를 정리한 보고서를 작성해 주세요. 수치에 없는 내용은 추측하지 마세요.',
  },
  {
    id: 'conflict',
    label: '갈등·긴장 요약',
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
  const featureFlags = userMsg ? buildFeatureContextFromMessage(userMsg) : { prefer_informed_answer: true };
  const defaultInstruction =
    '대화 관계도·성향·족보 계층·시공사 반응 신호·근거 발언 샘플만 근거로 답하세요. 시공사 선호는 확정이 아닌 추정임을 밝히고, 수치·참여자·발언 인용에 없는 사실은 추측하지 마세요. 보고서 형식(요약→핵심 인물→갈등 축→시공사 반응→실행 제안)으로 한국어만 출력하세요.';
  return {
    ...featureFlags,
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
    prefer_informed_answer: true,
    conversation_graph_methodology: input.analysis.methodology.join(' '),
    answer_quality_instruction: isCreateGraph
      ? buildCreateGraphAnswerInstruction(hasGraphNodes, Boolean(rawConversation))
      : defaultInstruction,
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

export { isCreateGraphAnswerRequest } from './conversationGraphAnswerIntent';

export type GraphAnswerGenerateOptions = {
  onChunk?: (accumulated: string, displayText: string) => void;
  onPhase?: (phase: AssistantGenerationPhase) => void;
  onPhaseText?: (text: string) => void;
  onMetadata?: (meta: Record<string, unknown>) => void;
  signal?: AbortSignal;
  preferStream?: boolean;
  /** true면 비스트림 응답 후 crosscheck·verify 단계 대기를 생략 */
  skipPostPhases?: boolean;
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

function finalizeGraphAnswerRaw(raw: string): string | null {
  const display = resolveGraphAnswerDisplayText(raw);
  return display || null;
}

function finalizeGraphAnswerFromStream(streamText: string, accumulated: string): string | null {
  const trimmedStream = coerceTrimmedString(streamText, '');
  const trimmedAccum = accumulated.trim();
  return (
    finalizeGraphAnswerRaw(trimmedStream) ||
    (trimmedAccum !== trimmedStream ? finalizeGraphAnswerRaw(trimmedAccum) : null)
  );
}

/** 관계도 분석 맥락으로 통합 채팅 API 답변 생성 (스트리밍 우선, 실패 시 비스트림, 다단계 UI 콜백) */
export async function generateGraphAnswerViaChat(
  userMessage: string,
  context: Record<string, unknown>,
  opts?: GraphAnswerGenerateOptions,
): Promise<string | null> {
  const trimmed = userMessage.trim();
  if (!trimmed) return null;

  const pipeline = createGraphAnswerPipelineController({
    onPhase: opts?.onPhase,
    onPhaseText: opts?.onPhaseText,
  });

  const preferStream = opts?.preferStream !== false && isStreamingSupported();

  try {
    if (preferStream) {
      let accumulated = '';
      let streamFollowUpStarted = false;
      const sessionId = `graph-answer-${Date.now()}`;
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
        const finalized = finalizeGraphAnswerFromStream(text, accumulated);
        if (finalized) {
          opts?.onPhase?.('verify');
          return finalized;
        }
      } catch {
        pipeline.cancel();
        if (opts?.signal?.aborted) return null;
        /* 비스트림 폴백 */
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
      const finalized = finalizeGraphAnswerRaw(res.message.content);
      if (finalized) {
        await maybeRunGraphAnswerPostPhases(opts);
        if (opts?.signal?.aborted) return null;
        opts?.onPhase?.('verify');
        opts?.onChunk?.(res.message.content, finalized);
        return finalized;
      }
    }
    const wrapped = extractResponseContent(res.rawResponse !== undefined ? res.rawResponse : res);
    if (wrapped && !wrapped.includes('응답을 생성할 수 없습니다')) {
      const finalized = finalizeGraphAnswerRaw(wrapped);
      if (finalized) {
        await maybeRunGraphAnswerPostPhases(opts);
        if (opts?.signal?.aborted) return null;
        opts?.onPhase?.('verify');
        opts?.onChunk?.(wrapped, finalized);
        return finalized;
      }
    }
    return null;
  } catch {
    pipeline.cancel();
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
