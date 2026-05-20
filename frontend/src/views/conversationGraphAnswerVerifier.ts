import { coerceTrimmedString } from '../utils/chatInputUtils';
import { isCreateGraphAnswerRequest } from './conversationGraphAnswerIntent';

export type GraphAnswerVerifyResult = {
  pass: boolean;
  issues: string[];
};

export const GRAPH_ANSWER_SELF_IMPROVE_MAX_ATTEMPTS = 2;

const GENERIC_CHAT_MARKERS = [
  '[다중 요청]',
  '더 정확한 답변을 위해',
  '좋은 질문이네요',
  '구체적으로 말씀해 주시면',
];

const MIN_REPORT_LENGTH = 100;
const MIN_CREATE_GRAPH_LENGTH = 150;

/** 스냅샷·연결 표에서 참여자 라벨 후보 추출 */
export function extractParticipantLabelsFromGraphContext(ctx: Record<string, unknown>): string[] {
  const snap = coerceTrimmedString(String(ctx.conversation_graph_snapshot ?? ''), '');
  const structured = coerceTrimmedString(String(ctx.conversation_graph_structured_sections ?? ''), '');
  const labels = new Set<string>();

  for (const block of [snap, structured]) {
    const tableRe = /\|\s*([^|]+?)\s*\|\s*[^|\n]+\s*\|/g;
    let tm: RegExpExecArray | null;
    while ((tm = tableRe.exec(block)) !== null) {
      const name = tm[1].trim();
      if (name && name !== '참여자' && name !== '출발' && name !== '---' && name.length <= 48) {
        labels.add(name);
      }
    }
  }

  const arrowRe = /^-\s*([^→\n]+?)\s*→/gm;
  let m: RegExpExecArray | null;
  while ((m = arrowRe.exec(snap)) !== null) {
    const label = m[1].trim().replace(/\s+/g, ' ');
    if (label.length >= 1 && label.length <= 48) labels.add(label);
  }

  const selected = ctx.conversation_graph_selected_participant;
  if (typeof selected === 'string' && selected.trim()) {
    try {
      const parsed = JSON.parse(selected) as { label?: string };
      if (parsed?.label) labels.add(String(parsed.label).trim());
    } catch {
      /* ignore */
    }
  }

  return [...labels];
}

function isCreateGraphContext(ctx: Record<string, unknown>, draft: string): boolean {
  const hint = coerceTrimmedString(String(ctx.input_intent_hint ?? ''), '');
  if (hint === 'conversation_graph_create') return true;
  const userMsg = coerceTrimmedString(String(ctx.original_user_message ?? ''), '');
  return isCreateGraphAnswerRequest(userMsg) || isCreateGraphAnswerRequest(draft);
}

/** 관계도 답변 초안을 context·의도 기준으로 검증 (결정론적, LLM 없음) */
export function verifyGraphAnswerAgainstContext(
  draft: string,
  ctx: Record<string, unknown>,
): GraphAnswerVerifyResult {
  const text = coerceTrimmedString(draft, '');
  const issues: string[] = [];

  if (!text) {
    return { pass: false, issues: ['답변 본문이 비어 있습니다.'] };
  }

  for (const marker of GENERIC_CHAT_MARKERS) {
    if (text.includes(marker)) {
      issues.push(`일반 채팅·다중 요청 안내 문구(${marker})가 포함되어 있습니다. 관계도 보고서 본문만 작성하세요.`);
    }
  }

  const createGraph = isCreateGraphContext(ctx, text);
  const minLen = createGraph ? MIN_CREATE_GRAPH_LENGTH : MIN_REPORT_LENGTH;
  if (text.length < minLen) {
    issues.push(`답변이 너무 짧습니다(최소 ${minLen}자 권장). 요약·표·근거를 보강하세요.`);
  }

  if (createGraph) {
    const low = text.toLowerCase();
    if (!low.includes('mermaid') && !low.includes('flowchart')) {
      issues.push('Mermaid flowchart 다이어그램(```mermaid … flowchart TB)이 없습니다.');
    }
    if (!text.includes('|') && !/참여자\s*표/i.test(text)) {
      issues.push('참여자 표(마크다운 표)가 없습니다.');
    }
  }

  const participants = extractParticipantLabelsFromGraphContext(ctx);
  if (participants.length > 0) {
    const mentioned = participants.filter((name) => text.includes(name));
    const ratio = mentioned.length / participants.length;
    if (ratio < 0.5 && participants.length >= 2) {
      issues.push(
        `스냅샷 참여자(${participants.slice(0, 6).join(', ')}) 중 절반 이상이 본문에 언급되어야 합니다.`,
      );
    }
  }

  const snap = coerceTrimmedString(String(ctx.conversation_graph_snapshot ?? ''), '');
  if (!snap && !coerceTrimmedString(String(ctx.conversation_graph_raw_conversation ?? ''), '')) {
    if (createGraph && !text.includes('데이터') && !text.includes('붙여넣')) {
      issues.push('관계도 데이터가 부족할 때는 필요한 입력 안내를 포함하세요.');
    }
  }

  return { pass: issues.length === 0, issues };
}
