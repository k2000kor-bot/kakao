import { coerceTrimmedString } from '../utils/chatInputUtils';
import {
  getGraphAnswerDocumentFormatDef,
  type GraphAnswerDocumentFormatId,
} from './conversationGraphAnswerDocumentFormats';
import {
  buildFormatStructureLessonsPrompt,
  clearFormatStructureLessons,
  recordFormatStructureFromDraft,
} from './conversationGraphAnswerFormatLearning';

const STORAGE_KEY = 'corbu.graph.answer.lessons.v2';
const MAX_LESSONS = 8;

export type GraphAnswerLesson = {
  recordedAt: string;
  participantCount: number;
  edgeCount: number;
  trustLabel: string;
  focus: string;
  /** 성공 답변의 문서 형식(보고서·논문·문학 등) */
  documentFormat: GraphAnswerDocumentFormatId;
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

  const formatRaw = coerceTrimmedString(String(ctx.conversation_graph_document_format ?? ''), '');
  const formatDef = getGraphAnswerDocumentFormatDef(
    (formatRaw || 'analytical_report') as GraphAnswerDocumentFormatId,
  );

  const lesson: GraphAnswerLesson = {
    recordedAt: new Date().toISOString(),
    participantCount,
    edgeCount: Number(ctx.conversation_graph_lesson_edge_count) || 0,
    trustLabel: coerceTrimmedString(String(ctx.conversation_graph_trust_label ?? ''), '') || '보통',
    focus: coerceTrimmedString(userFocus, '').slice(0, 120) || formatDef.labelKo,
    documentFormat: formatDef.id,
    outline,
  };

  const prev = readLessons().filter(
    (l) =>
      !(
        l.participantCount === lesson.participantCount &&
        l.focus === lesson.focus &&
        l.documentFormat === lesson.documentFormat
      ),
  );
  writeLessons([lesson, ...prev]);
  recordFormatStructureFromDraft(outline, formatDef.id);
}

function buildBuiltinFormatLessonSeed(formatId: GraphAnswerDocumentFormatId): string {
  const def = getGraphAnswerDocumentFormatDef(formatId);
  return [
    `[${def.labelKo} 내장 작성 패턴 — 로컬 학습 전에도 이 형식으로 출력]`,
    def.instruction,
    `제목 골격:\n${def.scaffoldOutline}`,
    `구조 예시:\n${def.builtinExemplar.slice(0, 320)}`,
  ].join('\n');
}

/** 이전 성공 답변에서 추출한 짧은 학습 힌트 (API context용) */
export function buildGraphAnswerLessonsPrompt(formatId?: GraphAnswerDocumentFormatId): string {
  const lessons = readLessons();
  const structureBlock = formatId ? buildFormatStructureLessonsPrompt(formatId) : '';

  const blocks: string[] = [];
  const filtered = formatId
    ? lessons.filter((l) => l.documentFormat === formatId)
    : lessons;

  if (filtered.length > 0) {
    const lines = [
      '[이전 관계도 답변 학습 — 참고만, 스냅샷에 없는 사실 추가 금지]',
      '성공 사례는 요청 문서 형식(보고서·논문·문학·엔티티·인텔리전스 보고서 등)의 제목 골격을 따르고, 표·Mermaid는 유지·서술만 형식에 맞게 확장했습니다.',
    ];
    for (const l of filtered.slice(0, 4)) {
      const fmt = getGraphAnswerDocumentFormatDef(l.documentFormat ?? 'analytical_report');
      lines.push(
        `- [${fmt.labelKo}] (${l.trustLabel}, 참여자 ${l.participantCount}) ${l.focus}: ${l.outline.slice(0, 160)}…`,
      );
    }
    blocks.push(lines.join('\n'));
  } else if (formatId) {
    blocks.push(buildBuiltinFormatLessonSeed(formatId));
  } else if (lessons.length > 0) {
    const lines = [
      '[이전 관계도 답변 학습 — 참고만, 스냅샷에 없는 사실 추가 금지]',
    ];
    for (const l of lessons.slice(0, 4)) {
      const fmt = getGraphAnswerDocumentFormatDef(l.documentFormat ?? 'analytical_report');
      lines.push(
        `- [${fmt.labelKo}] (${l.trustLabel}, 참여자 ${l.participantCount}) ${l.focus}: ${l.outline.slice(0, 160)}…`,
      );
    }
    blocks.push(lines.join('\n'));
  }

  if (structureBlock) blocks.push(structureBlock);
  return blocks.filter(Boolean).join('\n\n');
}

export function countGraphAnswerLessonsForFormat(
  formatId: GraphAnswerDocumentFormatId,
): number {
  return readLessons().filter((l) => l.documentFormat === formatId).length;
}

export function clearGraphAnswerLessons(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  window.localStorage.removeItem(STORAGE_KEY);
  clearFormatStructureLessons();
}

/** 테스트용 */
export function __readGraphAnswerLessonsForTest(): GraphAnswerLesson[] {
  return readLessons();
}
