/**
 * 대화 요청마다 딥시크 검수·리파인 힌트 — 기본 켬 (`!== 'false'`).
 * 서버에 키/파이프라인이 없으면 백엔드가 무시할 수 있음.
 * 끄려면 `REACT_APP_DEEPSEEK_REVIEW_HINTS=false` / `REACT_APP_PIPELINE_DEEPSEEK_REFINE=false`
 * Reasoner는 비용·지연이 커서 기본 끔, `REACT_APP_PIPELINE_DEEPSEEK_REASONER=true` 로만 켬.
 *
 * `Conversation` 등에 필드를 두면 대화별로 위 전역 기본을 덮어쓸 수 있음 (`undefined` = 전역 따름).
 */
export type ConversationDeepseekFlags = {
  deepseekReviewHints?: boolean;
  pipelineDeepSeekRefine?: boolean;
  pipelineDeepSeekReasoner?: boolean;
};

/** 신규 대화 생성 시 스냅샷(당시 전역 기본을 고정) */
export function newConversationDeepseekDefaults(): {
  deepseekReviewHints: boolean;
  pipelineDeepSeekRefine: boolean;
  pipelineDeepSeekReasoner: boolean;
} {
  const r = resolveDeepseekFlagsForConversation(undefined);
  return {
    deepseekReviewHints: r.review,
    pipelineDeepSeekRefine: r.refine,
    pipelineDeepSeekReasoner: r.reasoner,
  };
}

/** 대화에 저장된 값이 있으면 우선, 없으면 전역 env 기본 */
export function resolveDeepseekFlagsForConversation(
  conv: ConversationDeepseekFlags | null | undefined
): { review: boolean; refine: boolean; reasoner: boolean } {
  const review =
    conv?.deepseekReviewHints !== undefined
      ? conv.deepseekReviewHints
      : isDeepseekReviewHintsEnabled();
  const refine =
    review &&
    (conv?.pipelineDeepSeekRefine !== undefined
      ? conv.pipelineDeepSeekRefine
      : isPipelineDeepseekRefineEnabled());
  const reasoner =
    review &&
    (conv?.pipelineDeepSeekReasoner !== undefined
      ? conv.pipelineDeepSeekReasoner
      : isPipelineDeepseekReasonerEnabled());
  return { review, refine, reasoner };
}

export function isDeepseekReviewHintsEnabled(): boolean {
  if (typeof process === 'undefined') return true;
  return process.env.REACT_APP_DEEPSEEK_REVIEW_HINTS !== 'false';
}

export function isPipelineDeepseekRefineEnabled(): boolean {
  if (typeof process === 'undefined') return true;
  return process.env.REACT_APP_PIPELINE_DEEPSEEK_REFINE !== 'false';
}

export function isPipelineDeepseekReasonerEnabled(): boolean {
  if (typeof process === 'undefined') return false;
  return process.env.REACT_APP_PIPELINE_DEEPSEEK_REASONER === 'true';
}

/** localStorage·API에서 읽은 대화 객체에 딥시크 플래그가 없으면 당시 전역 기본으로 채움 */
export function normalizeConversationDeepseekFlagsFromStorage<T extends ConversationDeepseekFlags>(
  conv: T,
): T & {
  deepseekReviewHints: boolean;
  pipelineDeepSeekRefine: boolean;
  pipelineDeepSeekReasoner: boolean;
} {
  const defaults = newConversationDeepseekDefaults();
  return {
    ...conv,
    deepseekReviewHints: conv.deepseekReviewHints ?? defaults.deepseekReviewHints,
    pipelineDeepSeekRefine: conv.pipelineDeepSeekRefine ?? defaults.pipelineDeepSeekRefine,
    pipelineDeepSeekReasoner: conv.pipelineDeepSeekReasoner ?? defaults.pipelineDeepSeekReasoner,
  };
}
