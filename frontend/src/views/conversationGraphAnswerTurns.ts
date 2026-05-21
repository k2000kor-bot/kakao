import { coerceTrimmedString } from '../utils/chatInputUtils';

export type GraphAnswerTurnStatus = 'streaming' | 'complete' | 'error';

export type GraphAnswerTurn = {
  id: string;
  question: string;
  answer: string;
  createdAt: number;
  status: GraphAnswerTurnStatus;
};

export function createGraphAnswerTurnId(): string {
  return `graph-answer-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function truncateGraphAnswerQuestionPreview(question: string, maxLen = 120): string {
  const t = coerceTrimmedString(question, '');
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen).trim()}…`;
}

/** API·LLM 맥락용 — 최근 완료된 질문·답변만 (토큰 절약) */
export function formatGraphAnswerHistoryForContext(
  turns: GraphAnswerTurn[],
  opts?: { maxTurns?: number; maxCharsPerAnswer?: number },
): string {
  const maxTurns = opts?.maxTurns ?? 4;
  const maxChars = opts?.maxCharsPerAnswer ?? 2000;
  const completed = turns.filter((t) => t.status === 'complete' && t.answer.trim());
  const recent = completed.slice(-maxTurns);
  if (recent.length === 0) return '';

  const blocks = recent.map((turn, index) => {
    const n = completed.length - recent.length + index + 1;
    const q = truncateGraphAnswerQuestionPreview(turn.question, 500);
    let a = turn.answer.trim();
    if (a.length > maxChars) {
      a = `${a.slice(0, maxChars)}\n…(이하 생략)`;
    }
    return [`[이전 질문 ${n}]`, q, '', `[이전 답변 ${n}]`, a].join('\n');
  });

  return [
    '[관계도 답변 생성 — 이전 질문·답변 (연속 대화 맥락)]',
    '아래는 같은 세션에서 이어진 질문·답변입니다. 현재 요청은 이 맥락을 이어 받되, 스냅샷에 없는 사실은 추가하지 마세요.',
    '',
    blocks.join('\n\n'),
  ].join('\n');
}
