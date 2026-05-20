import { coerceTrimmedString } from '../utils/chatInputUtils';

const STORAGE_KEY = 'corbu.graph.answer.lessons.v1';
const MAX_LESSONS = 5;

export type GraphAnswerLesson = {
  recordedAt: string;
  participantCount: number;
  edgeCount: number;
  trustLabel: string;
  focus: string;
  outline: string;
};

function readLessons(): GraphAnswerLesson[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GraphAnswerLesson[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLessons(lessons: GraphAnswerLesson[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons.slice(0, MAX_LESSONS)));
  } catch {
    /* quota */
  }
}

/** 검증 통과한 관계도 답변 패턴을 로컬에 축적 (다음 생성 시 참고) */
export function recordGraphAnswerLessonFromContext(
  draft: string,
  ctx: Record<string, unknown>,
  userFocus: string,
): void {
  const outline = coerceTrimmedString(draft, '').slice(0, 500);
  if (!outline || outline.length < 80) return;

  const participantCount = Number(ctx.conversation_graph_lesson_participant_count) || 0;
  if (participantCount <= 0) return;

  const lesson: GraphAnswerLesson = {
    recordedAt: new Date().toISOString(),
    participantCount,
    edgeCount: Number(ctx.conversation_graph_lesson_edge_count) || 0,
    trustLabel: coerceTrimmedString(String(ctx.conversation_graph_trust_label ?? ''), '') || '보통',
    focus: coerceTrimmedString(userFocus, '').slice(0, 120) || '관계도 보고서',
    outline,
  };

  const prev = readLessons().filter(
    (l) => !(l.participantCount === lesson.participantCount && l.focus === lesson.focus),
  );
  writeLessons([lesson, ...prev]);
}

/** 이전 성공 답변에서 추출한 짧은 학습 힌트 (API context용) */
export function buildGraphAnswerLessonsPrompt(): string {
  const lessons = readLessons();
  if (lessons.length === 0) return '';

  const lines = [
    '[이전 관계도 답변 학습 — 참고만, 스냅샷에 없는 사실 추가 금지]',
    '과거에 잘 정리된 답변은 표·Mermaid를 유지하고 해석·갈등·실행 제안을 분리했습니다.',
  ];
  for (const l of lessons.slice(0, 3)) {
    lines.push(
      `- (${l.trustLabel}, 참여자 ${l.participantCount}) ${l.focus}: ${l.outline.slice(0, 180)}…`,
    );
  }
  return lines.join('\n');
}

export function clearGraphAnswerLessons(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/** 테스트용 */
export function __readGraphAnswerLessonsForTest(): GraphAnswerLesson[] {
  return readLessons();
}
