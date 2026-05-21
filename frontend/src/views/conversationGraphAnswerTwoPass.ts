import { coerceTrimmedString } from '../utils/chatInputUtils';
import { loadConversationGraphUiPrefs } from './conversationGraphUiPrefs';
import { getStructuredSectionsFromContext } from './conversationGraphAnswerSynthesis';

/** 1차 개요만 생성할 때 구조화 블록 합성 생략 */
export const GRAPH_ANSWER_SKIP_STRUCTURED_MERGE_KEY = 'conversation_graph_skip_structured_merge';

/** 2차 보고서에 실을 1차 개요 */
export const GRAPH_ANSWER_OUTLINE_KEY = 'conversation_graph_answer_outline';

/** env 기본값 */
export function isGraphAnswerTwoPassEnvDefault(): boolean {
  return process.env.REACT_APP_GRAPH_ANSWER_TWO_PASS === '1';
}

/** UI prefs → env 순으로 2-pass 사용 여부 */
export function isGraphAnswerTwoPassEnabled(): boolean {
  const prefs = loadConversationGraphUiPrefs();
  if (prefs.useTwoPassAnswer !== undefined) return prefs.useTwoPassAnswer;
  return isGraphAnswerTwoPassEnvDefault();
}

export function shouldUseGraphAnswerTwoPass(
  context: Record<string, unknown>,
  twoPassOverride?: boolean,
): boolean {
  const enabled = twoPassOverride !== undefined ? twoPassOverride : isGraphAnswerTwoPassEnabled();
  if (!enabled) return false;
  return Boolean(getStructuredSectionsFromContext(context));
}

export function buildGraphAnswerOutlineContext(context: Record<string, unknown>): Record<string, unknown> {
  const prev = coerceTrimmedString(String(context.answer_quality_instruction ?? ''), '');
  return {
    ...context,
    [GRAPH_ANSWER_SKIP_STRUCTURED_MERGE_KEY]: true,
    conversation_graph_omit_structured_in_instruction: true,
    conversation_graph_two_pass_phase: 'outline',
    answer_quality_instruction: [
      prev,
      '[1차 개요 — 표·Mermaid는 시스템이 이후에 붙입니다]',
      '## 한 줄 요약, ## 해석, ## 갈등 축, ## 실행 제안만 각 2~4문장(경어체·정돈된 한국어)으로 작성하세요. 마크다운 표·```mermaid 블록·[다중 요청] 문구는 출력하지 마세요.',
    ]
      .filter(Boolean)
      .join(' '),
  };
}

export function buildGraphAnswerReportContext(
  context: Record<string, unknown>,
  outline: string,
): Record<string, unknown> {
  const trimmedOutline = coerceTrimmedString(outline, '').slice(0, 4000);
  const prev = coerceTrimmedString(String(context.answer_quality_instruction ?? ''), '');
  const next: Record<string, unknown> = {
    ...context,
    [GRAPH_ANSWER_OUTLINE_KEY]: trimmedOutline,
    conversation_graph_two_pass_phase: 'report',
    answer_quality_instruction: [
      prev,
      '[2차 보고서 — 1차 개요 확장]',
      `아래 1차 개요를 바탕으로 각 섹션을 3~6문장으로 확장하세요. 표·Mermaid는 시스템 생성 블록을 유지하므로 다시 만들지 마세요.\n\n[1차 개요]\n${trimmedOutline}`,
    ]
      .filter(Boolean)
      .join(' '),
  };
  delete next[GRAPH_ANSWER_SKIP_STRUCTURED_MERGE_KEY];
  delete next.conversation_graph_omit_structured_in_instruction;
  return next;
}
