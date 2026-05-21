/**
 * 문서 형식별 성공 답변의 제목·구조를 로컬에 학습 (형식 → 골격 매핑)
 */
import { coerceTrimmedString } from '../utils/chatInputUtils';
import {
  getGraphAnswerDocumentFormatDef,
  type GraphAnswerDocumentFormatId,
} from './conversationGraphAnswerDocumentFormats';

const STRUCTURE_STORAGE_KEY = 'corbu.graph.answer.formatStructures.v1';
const MAX_PER_FORMAT = 2;

export type GraphAnswerFormatStructureLesson = {
  recordedAt: string;
  formatId: GraphAnswerDocumentFormatId;
  /** ## / ### 제목 줄만 추출 */
  headingOutline: string;
  sampleLength: number;
};

function readAll(): GraphAnswerFormatStructureLesson[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(STRUCTURE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GraphAnswerFormatStructureLesson[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(items: GraphAnswerFormatStructureLesson[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STRUCTURE_STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* quota */
  }
}

/** 성공 답변에서 마크다운 제목 구조만 추출 */
export function extractHeadingOutlineFromDraft(draft: string): string {
  const lines = coerceTrimmedString(draft, '').split('\n');
  const headings = lines
    .map((l) => l.trim())
    .filter((l) => /^#{1,6}\s+\S/.test(l))
    .slice(0, 14);
  return headings.join('\n');
}

/** 검증 통과 답변의 제목 골격을 형식별로 저장 */
export function recordFormatStructureFromDraft(
  draft: string,
  formatId: GraphAnswerDocumentFormatId,
): void {
  const headingOutline = extractHeadingOutlineFromDraft(draft);
  if (!headingOutline || headingOutline.length < 12) return;

  const entry: GraphAnswerFormatStructureLesson = {
    recordedAt: new Date().toISOString(),
    formatId,
    headingOutline,
    sampleLength: coerceTrimmedString(draft, '').length,
  };

  const rest = readAll().filter(
    (x) => !(x.formatId === formatId && x.headingOutline === headingOutline),
  );
  const sameFormat = [entry, ...rest.filter((x) => x.formatId === formatId)].slice(0, MAX_PER_FORMAT);
  const otherFormats = rest.filter((x) => x.formatId !== formatId);
  writeAll([...sameFormat, ...otherFormats]);
}

/** 내장 형식 골격(로컬 학습 전 첫 생성용) */
export function buildBuiltinFormatStructureSeed(formatId: GraphAnswerDocumentFormatId): string {
  const def = getGraphAnswerDocumentFormatDef(formatId);
  return extractHeadingOutlineFromDraft(`${def.scaffoldOutline}\n${def.builtinExemplar}`);
}

/** 현재 형식에 맞춰 학습된 제목 골격 힌트(없으면 내장 골격) */
export function buildFormatStructureLessonsPrompt(
  formatId: GraphAnswerDocumentFormatId,
): string {
  const def = getGraphAnswerDocumentFormatDef(formatId);
  const items = readAll().filter((x) => x.formatId === formatId);
  const lines = [
    `[${def.labelKo} 형식 구조 학습 — 아래 제목·순서를 끝까지 유지하고 내용만 스냅샷·발언으로 채우세요]`,
  ];
  if (items.length > 0) {
    for (const item of items) {
      lines.push(`- 성공 골격(${item.sampleLength}자):\n${item.headingOutline}`);
    }
  } else {
    lines.push(`- [내장 ${def.labelKo} 골격]:\n${buildBuiltinFormatStructureSeed(formatId)}`);
  }
  return lines.join('\n');
}

export function clearFormatStructureLessons(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  window.localStorage.removeItem(STRUCTURE_STORAGE_KEY);
}

export function __readFormatStructureLessonsForTest(): GraphAnswerFormatStructureLesson[] {
  return readAll();
}
