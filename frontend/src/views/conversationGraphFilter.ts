import type { RelationshipGraphData } from '../services/conversationGraphService';

export type StanceKey = '동조' | '반대' | '중립';

export type StanceFilterState = Record<StanceKey, boolean>;

export const DEFAULT_STANCE_FILTER: StanceFilterState = {
  동조: true,
  반대: true,
  중립: true,
};

export function normalizeDominantStance(stance?: string): StanceKey {
  if (stance === '동조' || stance === '반대') return stance;
  return '중립';
}

export function isAnyStanceFilterActive(filters: StanceFilterState): boolean {
  return filters.동조 || filters.반대 || filters.중립;
}

/** 우세 입장 필터에 맞게 노드·연결만 남긴 관계도 복사본을 반환한다. */
export function filterRelationshipGraphByStance(
  graph: RelationshipGraphData,
  filters: StanceFilterState,
): RelationshipGraphData {
  if (!isAnyStanceFilterActive(filters)) {
    return { ...graph, nodes: [], edges: [] };
  }
  const nodes = (graph.nodes ?? []).filter((n) => {
    const key = normalizeDominantStance(n.dominant_stance);
    return filters[key];
  });
  const visible = new Set(nodes.map((n) => n.id));
  const edges = (graph.edges ?? []).filter(
    (e) => visible.has(e.source) && visible.has(e.target),
  );
  return { ...graph, nodes, edges };
}
