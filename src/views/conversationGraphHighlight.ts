import type { RelationshipGraphEdge } from '../services/conversationGraphService';

/** 선택 노드와 직접 연결된 참여자 id 집합(자신 포함). */
export function getNeighborNodeIds(
  nodeId: string,
  edges: RelationshipGraphEdge[] | undefined,
): Set<string> {
  const ids = new Set<string>([nodeId]);
  for (const e of edges ?? []) {
    if (e.source === nodeId) ids.add(e.target);
    if (e.target === nodeId) ids.add(e.source);
  }
  return ids;
}

/** focusNodeIds가 null이면 강조 없음. 있으면 해당 집합 외 노드·엣지를 흐리게 한다. */
export function applyConversationGraphFocusHighlight(
  svgEl: SVGSVGElement | null,
  focusNodeIds: Set<string> | null,
): void {
  if (!svgEl) return;

  svgEl.querySelectorAll('[data-graph-node]').forEach((el) => {
    const id = el.getAttribute('data-node-id');
    const dimmed = Boolean(focusNodeIds && id && !focusNodeIds.has(id));
    el.setAttribute('data-graph-dimmed', dimmed ? 'true' : 'false');
    el.setAttribute('opacity', dimmed ? '0.35' : '1');
  });

  svgEl.querySelectorAll('[data-graph-edge]').forEach((el) => {
    const source = el.getAttribute('data-edge-source');
    const target = el.getAttribute('data-edge-target');
    const inFocus =
      !focusNodeIds ||
      (Boolean(source && target && focusNodeIds.has(source) && focusNodeIds.has(target)));
    el.setAttribute('stroke-opacity', inFocus ? '0.85' : '0.12');
  });
}
