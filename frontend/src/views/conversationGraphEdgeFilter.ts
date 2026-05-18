import type { RelationshipGraphData } from '../services/conversationGraphService';

export type EdgeTypeKey = 'flow' | '동조' | '반대' | '대립';

export type EdgeTypeFilterState = Record<EdgeTypeKey, boolean>;

export const DEFAULT_EDGE_FILTER: EdgeTypeFilterState = {
  flow: true,
  동조: true,
  반대: true,
  대립: true,
};

export function normalizeEdgeType(edgeType?: string): EdgeTypeKey {
  if (edgeType === '동조' || edgeType === '반대' || edgeType === '대립') return edgeType;
  return 'flow';
}

export function isAnyEdgeFilterActive(filters: EdgeTypeFilterState): boolean {
  return filters.flow || filters.동조 || filters.반대 || filters.대립;
}

/** 연결 유형 필터에 맞는 엣지만 남긴다(노드 집합은 유지). */
export function filterRelationshipGraphByEdgeType(
  graph: RelationshipGraphData,
  filters: EdgeTypeFilterState,
): RelationshipGraphData {
  if (!isAnyEdgeFilterActive(filters)) {
    return { ...graph, edges: [] };
  }
  const edges = (graph.edges ?? []).filter((e) => filters[normalizeEdgeType(e.edge_type)]);
  return { ...graph, edges };
}
