import type { RelationshipGraphEdge, RelationshipGraphNode } from '../services/conversationGraphService';
import { normalizeDominantStance, type StanceKey } from './conversationGraphFilter';
import { formatEdgeWeightSummary } from './conversationGraphParticipantEdges';

export type GraphStanceBreakdown = Record<StanceKey, number>;

export interface GraphTopEdgeRow {
  edgeKey: string;
  sourceId: string;
  targetId: string;
  sourceLabel: string;
  targetLabel: string;
  summary: string;
  score: number;
}

export function computeStanceBreakdown(nodes: RelationshipGraphNode[] | undefined): GraphStanceBreakdown {
  const breakdown: GraphStanceBreakdown = { 동조: 0, 반대: 0, 중립: 0 };
  for (const n of nodes ?? []) {
    breakdown[normalizeDominantStance(n.dominant_stance)] += 1;
  }
  return breakdown;
}

export function edgeActivityScore(edge: {
  weight?: number;
  weight_동조?: number;
  weight_반대?: number;
  weight_대립?: number;
}): number {
  return (
    (edge.weight ?? 0) +
    (edge.weight_동조 ?? 0) +
    (edge.weight_반대 ?? 0) +
    (edge.weight_대립 ?? 0)
  );
}

export function listTopEdges(
  edges: RelationshipGraphEdge[] | undefined,
  labelById: Map<string, string>,
  limit = 5,
): GraphTopEdgeRow[] {
  const rowByKey = new Map<string, GraphTopEdgeRow>();
  for (const edge of edges ?? []) {
    const key = [edge.source, edge.target].sort().join('::');
    const score = edgeActivityScore(edge);
    const existing = rowByKey.get(key);
    if (existing && existing.score >= score) continue;
    const sourceLabel = labelById.get(edge.source) || edge.source;
    const targetLabel = labelById.get(edge.target) || edge.target;
    const weightText = formatEdgeWeightSummary(edge);
    rowByKey.set(key, {
      edgeKey: key,
      sourceId: edge.source,
      targetId: edge.target,
      sourceLabel,
      targetLabel,
      summary: `${sourceLabel} ↔ ${targetLabel}: ${weightText}`,
      score,
    });
  }
  const rows = [...rowByKey.values()];
  return rows.sort((a, b) => b.score - a.score || a.summary.localeCompare(b.summary, 'ko')).slice(0, limit);
}

export function formatStanceBreakdownText(breakdown: GraphStanceBreakdown): string {
  return `동조 ${breakdown.동조} · 반대 ${breakdown.반대} · 중립 ${breakdown.중립}`;
}
