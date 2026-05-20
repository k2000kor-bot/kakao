import { coerceTrimmedString } from '../utils/chatInputUtils';

/** 재생성 시 context에 검증 이슈·시도 횟수 반영 */
export function buildGraphAnswerContextWithRevision(
  base: Record<string, unknown>,
  issues: readonly string[],
  attemptIndex: number,
): Record<string, unknown> {
  const prevInstruction = coerceTrimmedString(String(base.answer_quality_instruction ?? ''), '');
  const revisionBlock = [
    '[자동 품질 검증 — 이전 초안 수정 필수]',
    ...issues.map((issue) => `- ${issue}`),
  ].join('\n');

  return {
    ...base,
    conversation_graph_self_improve_attempt: attemptIndex + 1,
    conversation_graph_revision_issues: [...issues],
    answer_quality_instruction: prevInstruction
      ? `${prevInstruction}\n\n${revisionBlock}`
      : revisionBlock,
  };
}

export function isGraphAnswerSelfImproveEnabled(): boolean {
  return process.env.REACT_APP_GRAPH_ANSWER_SELF_IMPROVE !== '0';
}
