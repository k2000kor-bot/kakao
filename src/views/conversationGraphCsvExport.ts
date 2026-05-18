import type { RelationshipGraphData } from '../services/conversationGraphService';
import { normalizeDominantStance } from './conversationGraphFilter';
import { normalizeEdgeType } from './conversationGraphEdgeFilter';

function escapeCsvCell(value: string | number | undefined | null): string {
  const s = value == null ? '' : String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function csvLine(cells: Array<string | number | undefined | null>): string {
  return cells.map(escapeCsvCell).join(',');
}

/** 필터가 적용된 관계도를 CSV 문자열로 직렬화한다. */
export function buildConversationGraphCsv(graph: RelationshipGraphData): string {
  const lines: string[] = [];
  lines.push('[참여자]');
  lines.push(
    csvLine([
      'id',
      'label',
      'message_count',
      'dominant_stance',
      'stance_동조',
      'stance_반대',
      'stance_중립',
    ]),
  );
  for (const n of graph.nodes ?? []) {
    lines.push(
      csvLine([
        n.id,
        n.label || n.id,
        n.message_count,
        normalizeDominantStance(n.dominant_stance),
        n.stance_동조 ?? '',
        n.stance_반대 ?? '',
        n.stance_중립 ?? '',
      ]),
    );
  }
  lines.push('');
  lines.push('[연결]');
  lines.push(
    csvLine([
      'source',
      'target',
      'weight',
      'edge_type',
      'weight_동조',
      'weight_반대',
      'weight_대립',
    ]),
  );
  for (const e of graph.edges ?? []) {
    lines.push(
      csvLine([
        e.source,
        e.target,
        e.weight,
        normalizeEdgeType(e.edge_type),
        e.weight_동조 ?? '',
        e.weight_반대 ?? '',
        e.weight_대립 ?? '',
      ]),
    );
  }
  return lines.join('\n');
}

function triggerTextDownload(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/** 관계도 CSV를 저장한다(UTF-8 BOM으로 Excel 한글 호환). */
export function downloadConversationGraphCsv(
  graph: RelationshipGraphData,
  filename = 'conversation-graph.csv',
): void {
  const csv = `\uFEFF${buildConversationGraphCsv(graph)}`;
  triggerTextDownload(csv, filename, 'text/csv;charset=utf-8');
}
