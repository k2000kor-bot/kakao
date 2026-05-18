import {
  type AssistantGenerationPhase,
  ASSISTANT_PLACEHOLDER_PIPELINE_ORDER,
  cleanResponseText,
  coerceTrimmedString,
  getAssistantGenerationPhase,
  isAssistantGenerationStepUi,
  mapStreamMetadataToAssistantGenerationPhase,
  scheduleAssistantNonStreamLoadingPhaseTimers,
  scheduleClientStreamingPipelinePhases,
} from '../utils/chatInputUtils';

/** 스트림 누적 문자열 앞쪽에 붙은 생성 단계 플레이스홀더 제거 */
function stripLeadingPipelinePlaceholders(text: string): string {
  let out = text;
  let changed = true;
  while (changed) {
    changed = false;
    for (const ph of ASSISTANT_PLACEHOLDER_PIPELINE_ORDER) {
      if (out.startsWith(ph)) {
        out = out.slice(ph.length).trimStart();
        changed = true;
      }
    }
  }
  return out;
}

/** 스트리밍·비스트리밍 응답에서 최종 표시용 본문만 추출 (생성 중 플레이스홀더 제외) */
export function resolveGraphAnswerDisplayText(raw: string): string {
  const cleaned = cleanResponseText(coerceTrimmedString(raw, ''));
  if (!cleaned) return '';
  const body = stripLeadingPipelinePlaceholders(cleaned);
  if (!body || isAssistantGenerationStepUi(body)) return '';
  return body;
}

export type GraphAnswerPipelineCallbacks = {
  onPhase?: (phase: AssistantGenerationPhase) => void;
  /** 비스트리밍 대기 중 플레이스홀더 문구(단계 UI 매핑용) */
  onPhaseText?: (text: string) => void;
};

/** 관계도 답변 생성 중 클라이언트·서버 단계 표시 컨트롤러 */
export function createGraphAnswerPipelineController(callbacks: GraphAnswerPipelineCallbacks): {
  cancel: () => void;
  handleMetadata: (meta: Record<string, unknown>) => void;
  handleAccumulated: (accumulated: string) => { displayText: string; phase: AssistantGenerationPhase | null };
  startNonStreamTimers: () => void;
  startStreamFollowUpPhases: () => void;
} {
  let cancelTimers: (() => void) | undefined;
  let cancelStreamPhases: (() => void) | undefined;
  let serverDrovePhase = false;

  const emitPhase = (phase: AssistantGenerationPhase) => {
    callbacks.onPhase?.(phase);
  };

  const emitFromPlaceholderText = (text: string) => {
    const phase = getAssistantGenerationPhase(text);
    if (phase) emitPhase(phase);
  };

  return {
    cancel: () => {
      cancelTimers?.();
      cancelTimers = undefined;
      cancelStreamPhases?.();
      cancelStreamPhases = undefined;
    },
    handleMetadata: (meta) => {
      const phase = mapStreamMetadataToAssistantGenerationPhase(meta);
      if (phase) {
        serverDrovePhase = true;
        cancelTimers?.();
        cancelTimers = undefined;
        cancelStreamPhases?.();
        cancelStreamPhases = undefined;
        emitPhase(phase);
      }
    },
    handleAccumulated: (accumulated) => {
      const trimmed = coerceTrimmedString(accumulated, '');
      if (isAssistantGenerationStepUi(trimmed)) {
        emitFromPlaceholderText(trimmed);
        return { displayText: '', phase: getAssistantGenerationPhase(trimmed) };
      }
      const displayText = resolveGraphAnswerDisplayText(trimmed);
      if (displayText) {
        emitPhase('verify');
      }
      return { displayText, phase: displayText ? 'verify' : null };
    },
    startNonStreamTimers: () => {
      emitPhase('analyze');
      cancelTimers = scheduleAssistantNonStreamLoadingPhaseTimers((text) => {
        callbacks.onPhaseText?.(text);
        emitFromPlaceholderText(text);
      });
    },
    startStreamFollowUpPhases: () => {
      if (serverDrovePhase) return;
      cancelStreamPhases = scheduleClientStreamingPipelinePhases({
        onPhase: (phase) => emitPhase(phase),
        benchmarkGenspark: true,
      });
    },
  };
}
