import type { RelationshipGraphData } from '../services/conversationGraphService';
import type { GraphAiAnalysis, ParticipantAiInsight } from './conversationGraphAiAnalyzer';
import { countParticipantEdgeStats } from './conversationGraphParticipantDetail';

export type MatrixSortKey =
  | 'influence'
  | 'messages'
  | 'name'
  | 'stance'
  | 'outbound'
  | 'inbound';

export interface ConversationMatrixRow {
  id: string;
  label: string;
  messageCount: number;
  dominantStance: string;
  stance동조: number;
  stance반대: number;
  stance중립: number;
  exchangeRole: string;
  genealogyTier: string;
  influenceScore: number;
  outbound: number;
  inbound: number;
  trustPercent: string;
}

export function buildConversationMatrixRows(
  graph: RelationshipGraphData,
  analysis: GraphAiAnalysis | null,
): ConversationMatrixRow[] {
  const insightById = new Map(analysis?.participants.map((p) => [p.id, p]) ?? []);
  const rows: ConversationMatrixRow[] = [];

  for (const n of graph.nodes ?? []) {
    const insight: ParticipantAiInsight | undefined = insightById.get(n.id);
    const edgeStats = countParticipantEdgeStats(n.id, graph.edges);
    const role = graph.meta?.participant_roles?.[n.id];
    rows.push({
      id: n.id,
      label: n.label?.trim() || n.id,
      messageCount: n.message_count ?? 0,
      dominantStance: insight?.dominantStance ?? n.dominant_stance ?? '중립',
      stance동조: n.stance_동조 ?? 0,
      stance반대: n.stance_반대 ?? 0,
      stance중립: n.stance_중립 ?? 0,
      exchangeRole: insight?.exchangeRole ?? '—',
      genealogyTier: role?.genealogy_tier ?? '—',
      influenceScore: insight?.influenceScore ?? n.message_count ?? 0,
      outbound: edgeStats.outbound,
      inbound: edgeStats.inbound,
      trustPercent:
        insight != null ? `${Math.round(insight.stanceConfidence * 100)}%` : '—',
    });
  }

  return rows;
}

export function sortMatrixRows(
  rows: ConversationMatrixRow[],
  sortKey: MatrixSortKey,
): ConversationMatrixRow[] {
  const copy = [...rows];
  switch (sortKey) {
    case 'messages':
      return copy.sort((a, b) => b.messageCount - a.messageCount || a.label.localeCompare(b.label, 'ko'));
    case 'stance':
      return copy.sort((a, b) => {
        const order = { 동조: 0, 반대: 1, 중립: 2 };
        const sa = order[a.dominantStance as keyof typeof order] ?? 3;
        const sb = order[b.dominantStance as keyof typeof order] ?? 3;
        return sa - sb || a.label.localeCompare(b.label, 'ko');
      });
    case 'outbound':
      return copy.sort((a, b) => b.outbound - a.outbound || a.label.localeCompare(b.label, 'ko'));
    case 'inbound':
      return copy.sort((a, b) => b.inbound - a.inbound || a.label.localeCompare(b.label, 'ko'));
    case 'name':
      return copy.sort((a, b) => a.label.localeCompare(b.label, 'ko'));
    case 'influence':
    default:
      return copy.sort(
        (a, b) => b.influenceScore - a.influenceScore || a.label.localeCompare(b.label, 'ko'),
      );
  }
}

function escapeCsvCell(value: string | number): string {
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function buildMatrixCsv(rows: ConversationMatrixRow[]): string {
  const header = [
    '참여자',
    '발화수',
    '우세입장',
    '동조분류',
    '반대분류',
    '중립분류',
    '역할',
    '족보층',
    '영향력',
    '나가는연결',
    '들어오는연결',
    '입장신뢰',
  ];
  const lines = [header.map(escapeCsvCell).join(',')];
  for (const r of rows) {
    lines.push(
      [
        r.label,
        r.messageCount,
        r.dominantStance,
        r.stance동조,
        r.stance반대,
        r.stance중립,
        r.exchangeRole,
        r.genealogyTier,
        r.influenceScore,
        r.outbound,
        r.inbound,
        r.trustPercent,
      ]
        .map(escapeCsvCell)
        .join(','),
    );
  }
  return lines.join('\n');
}

export function downloadMatrixCsv(rows: ConversationMatrixRow[], filename: string): void {
  const blob = new Blob(['\uFEFF' + buildMatrixCsv(rows)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
