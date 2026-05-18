import type { RelationshipGraphData } from '../services/conversationGraphService';
import type { GraphAiAnalysis, ParticipantAiInsight } from './conversationGraphAiAnalyzer';
import type { RelationshipGraphMeta } from '../services/conversationGraphService';
export type ExpertLayerId =
  | 'all'
  | 'influence'
  | 'stance_conflict'
  | 'exchange'
  | 'contractor'
  | 'genealogy';

export const EXPERT_LAYER_OPTIONS: ReadonlyArray<{
  id: ExpertLayerId;
  label: string;
  hint: string;
}> = [
  { id: 'all', label: '전체', hint: '모든 참여자·연결' },
  { id: 'influence', label: '영향력', hint: '영향력 상위·대화 주도' },
  { id: 'stance_conflict', label: '갈등 축', hint: '반대·대립 연결이 있는 참여자' },
  { id: 'exchange', label: '주고받기', hint: '주도·응답 역할이 뚜렷한 참여자' },
  { id: 'contractor', label: '시공사 반응', hint: '시공사·제안 항목 언급·반응' },
  { id: 'genealogy', label: '족보 계층', hint: '주도·1차 응답·확산·관망' },
];

export function expertLayerLabel(id: ExpertLayerId): string {
  return EXPERT_LAYER_OPTIONS.find((o) => o.id === id)?.label ?? id;
}

function participantIdsForLayer(
  graph: RelationshipGraphData,
  analysis: GraphAiAnalysis | null,
  meta: RelationshipGraphMeta | undefined,
  layerId: ExpertLayerId,
): Set<string> | null {
  if (layerId === 'all') return null;
  const nodes = graph.nodes ?? [];
  const edges = graph.edges ?? [];
  const ids = new Set<string>();

  if (layerId === 'influence') {
    const ranked = [...(analysis?.participants ?? [])].sort(
      (a, b) => b.influenceScore - a.influenceScore,
    );
    const topN = Math.max(2, Math.ceil(nodes.length * 0.4));
    for (const p of ranked.slice(0, topN)) ids.add(p.id);
    const root = meta?.genealogy_root_id;
    if (root) ids.add(root);
    return ids;
  }

  if (layerId === 'stance_conflict') {
    for (const e of edges) {
      const t = e.edge_type || 'flow';
      if (t === '반대' || t === '대립' || (e.weight_반대 ?? 0) > 0 || (e.weight_대립 ?? 0) > 0) {
        ids.add(e.source);
        ids.add(e.target);
      }
    }
    return ids;
  }

  if (layerId === 'exchange') {
    for (const p of analysis?.participants ?? []) {
      if (p.exchangeRole === '주도' || p.exchangeRole === '응답') ids.add(p.id);
    }
    return ids;
  }

  if (layerId === 'contractor') {
    const names = new Set<string>();
    for (const s of meta?.contractor_signals ?? []) {
      for (const m of s.sample_messages ?? []) {
        if (m.user) names.add(m.user.trim());
      }
    }
    for (const n of nodes) {
      const label = (n.label ?? '').trim();
      if (names.has(label)) ids.add(n.id);
    }
    return ids;
  }

  if (layerId === 'genealogy') {
    for (const n of nodes) {
      const tier = meta?.participant_roles?.[n.id]?.genealogy_tier;
      if (tier && tier !== '관망') ids.add(n.id);
    }
    const root = meta?.genealogy_root_id;
    if (root) ids.add(root);
    return ids;
  }

  return null;
}

/** 전문가 레이어에 맞는 노드·연결만 남긴 관계도 */
export function filterRelationshipGraphByExpertLayer(
  graph: RelationshipGraphData,
  analysis: GraphAiAnalysis | null,
  layerId: ExpertLayerId,
): RelationshipGraphData {
  const keepIds = participantIdsForLayer(graph, analysis, graph.meta, layerId);
  if (!keepIds) return graph;
  if (keepIds.size === 0) {
    return { ...graph, nodes: [], edges: [] };
  }
  const nodes = (graph.nodes ?? []).filter((n) => keepIds.has(n.id));
  const edges = (graph.edges ?? []).filter(
    (e) => keepIds.has(e.source) && keepIds.has(e.target),
  );
  return { ...graph, nodes, edges };
}

export function formatExpertLayerSummary(
  layerId: ExpertLayerId,
  graph: RelationshipGraphData | null,
  analysis: GraphAiAnalysis | null,
): string {
  const opt = EXPERT_LAYER_OPTIONS.find((o) => o.id === layerId);
  if (!layerId || layerId === 'all' || !graph) return '';
  const filtered = filterRelationshipGraphByExpertLayer(graph, analysis, layerId);
  return `${opt?.label ?? layerId} 레이어: ${filtered.nodes?.length ?? 0}명 · 연결 ${filtered.edges?.length ?? 0}개 (${opt?.hint ?? ''})`;
}

/** 레이어 하이라이트용 영향력 가중치 */
export function edgeScoreForHighlight(edge: {
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

export function pickInsightForLayer(
  participants: ParticipantAiInsight[],
  layerId: ExpertLayerId,
): ParticipantAiInsight | undefined {
  if (layerId === 'stance_conflict') {
    return [...participants].sort((a, b) => b.oppositionTies - a.oppositionTies)[0];
  }
  if (layerId === 'exchange') {
    return participants.find((p) => p.exchangeRole === '주도') ?? participants[0];
  }
  return participants[0];
}
