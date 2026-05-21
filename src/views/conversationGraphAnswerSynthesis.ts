import { coerceTrimmedString } from '../utils/chatInputUtils';
import { resolveGraphAnswerDisplayText } from './conversationGraphAnswerPipeline';
import { GRAPH_STRUCTURED_SECTIONS_KEY } from './conversationGraphDeterministicSections';
import { polishGraphAnswerMarkdown } from './conversationGraphAnswerProse';

function stripMermaidBlocks(text: string): string {
  return text.replace(/```mermaid[\s\S]*?```/gi, '').trim();
}

function stripMarkdownTables(text: string): string {
  const lines = text.split('\n');
  const out: string[] = [];
  let inTable = false;
  for (const line of lines) {
    const isTableRow = /^\s*\|/.test(line);
    if (isTableRow) {
      inTable = true;
      continue;
    }
    if (inTable && line.trim() === '') {
      inTable = false;
      continue;
    }
    if (!inTable) out.push(line);
  }
  return out.join('\n').trim();
}

function stripStructuredDuplicates(draft: string): string {
  let t = stripMermaidBlocks(draft);
  t = stripMarkdownTables(t);
  return t.replace(/<!--\s*graph-structured-sections\s*-->/gi, '').trim();
}

function firstSubstantiveParagraph(text: string, maxLen = 400): string {
  const blocks = text
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter((b) => b.length > 20 && !/^#{1,6}\s/.test(b));
  const para = blocks[0] ?? text.trim();
  if (para.length <= maxLen) return para;
  return `${para.slice(0, maxLen).trim()}…`;
}

function extractNarrativeTail(text: string): string {
  const cleaned = stripStructuredDuplicates(text);
  if (!cleaned) return '';
  const idx = cleaned.search(/##\s*(해석|갈등|실행|분석)/i);
  if (idx >= 0) return cleaned.slice(idx).trim();
  const afterSummary = cleaned.replace(/^##\s*한\s*줄\s*요약[\s\S]*?(?=\n##|\n[^#]|$)/i, '').trim();
  if (afterSummary.length > 60) return afterSummary;
  return cleaned;
}

/** LLM 서술 + 결정론적 표·Mermaid 블록을 하나의 정리된 보고서로 합성 */
export function mergeGraphAnswerWithDeterministicSections(
  llmDraft: string,
  structuredSections: string,
): string {
  const structured = coerceTrimmedString(structuredSections, '');
  const body = resolveGraphAnswerDisplayText(coerceTrimmedString(llmDraft, ''));

  if (!structured) return body;
  if (structured && !body) return structured;

  if (body.includes('graph-structured-sections')) {
    return polishGraphAnswerMarkdown(body);
  }

  const narrative = stripStructuredDuplicates(body);
  const summary = firstSubstantiveParagraph(narrative);
  const tail = extractNarrativeTail(narrative);
  const summaryLine =
    summary ||
    '아래 관계도·표·연결 구조를 바탕으로 참여자 간 동조·반대·발화 흐름을 정리했습니다.';
  const keyPointBullets = narrative
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 14 && s.length < 200)
    .slice(0, 4)
    .map((s) => `- ${s}`);

  const parts: string[] = [
    '## 한 줄 요약',
    '',
    summaryLine,
    '',
    '### 핵심 포인트',
    '',
    ...(keyPointBullets.length >= 2
      ? keyPointBullets
      : [
          `- ${summaryLine}`,
          '- 참여자 표·연결 표에서 동조·반대·발화 흐름을 확인할 수 있습니다.',
          '- 아래 Mermaid 족보형 관계도로 계층·연결 강도를 한눈에 볼 수 있습니다.',
        ]),
    '',
    structured,
  ];

  if (tail.length >= 60) {
    parts.push('', tail.startsWith('##') ? tail : ['## 해석·갈등 축·실행 제안', '', tail].join('\n'));
  } else if (summary.length >= 40) {
    parts.push(
      '',
      '## 해석·갈등 축·실행 제안',
      '',
      '### 해석',
      '',
      summary,
      '',
      '### 실행 제안',
      '',
      '1. 갈등·반대 연결이 두드러지는 구간을 먼저 공유하고, 당사자별 우세 입장을 짧게 확인합니다.',
      '2. 동조 축이 강한 참여자 쌍을 중심으로 합의 문안을 정리한 뒤, 이견 축은 별도 안건으로 분리합니다.',
      '3. 다음 회의 전까지 실행 가능한 조치 1~2가지를 합의하고, 근거 발언·관계도 스냅샷을 기록해 둡니다.',
    );
  }

  return polishGraphAnswerMarkdown(parts.join('\n').trim());
}

export function getStructuredSectionsFromContext(ctx: Record<string, unknown>): string {
  return coerceTrimmedString(String(ctx[GRAPH_STRUCTURED_SECTIONS_KEY] ?? ''), '');
}
