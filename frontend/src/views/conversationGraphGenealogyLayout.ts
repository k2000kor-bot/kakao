import type {
  RelationshipGraphData,
  RelationshipGraphEdge,
  RelationshipGraphNode,
} from '../services/conversationGraphService';
import { edgeActivityScore } from './conversationGraphStats';

export const GENEALOGY_ROW_HEIGHT = 92;
export const GENEALOGY_TOP_PAD = 52;
export const GENEALOGY_SIDE_PAD = 56;

export type GenealogyNodePosition = {
  x: number;
  y: number;
  depth: number;
};

export type GenealogyLayoutResult = {
  positions: Map<string, GenealogyNodePosition>;
  height: number;
  rootId: string;
  parentById: Map<string, string | null>;
};

/** 족보 루트: 발화 수·대화 주도(나가는 연결)가 큰 참여자 */
export function pickGenealogyRoot(
  nodes: RelationshipGraphNode[],
  edges: RelationshipGraphEdge[],
): string {
  if (nodes.length === 0) return '';
  const outbound = new Map<string, number>();
  for (const e of edges) {
    outbound.set(e.source, (outbound.get(e.source) ?? 0) + edgeActivityScore(e));
  }
  let bestId = nodes[0].id;
  let bestScore = -1;
  for (const n of nodes) {
    const score = (n.message_count ?? 0) * 2 + (outbound.get(n.id) ?? 0);
    if (score > bestScore) {
      bestScore = score;
      bestId = n.id;
    }
  }
  return bestId;
}

/** 각 참여자의 ‘상위’ 연결: 가장 강한 들어오는 발화(응답 대상) → 없으면 루트 아래 */
export function assignGenealogyParents(
  rootId: string,
  nodes: RelationshipGraphNode[],
  edges: RelationshipGraphEdge[],
): Map<string, string | null> {
  const parentById = new Map<string, string | null>();
  for (const n of nodes) {
    parentById.set(n.id, n.id === rootId ? null : null);
  }

  for (const n of nodes) {
    if (n.id === rootId) continue;
    let bestParent: string | null = null;
    let bestScore = -1;
    for (const e of edges) {
      if (e.target !== n.id) continue;
      const score = edgeActivityScore(e);
      if (score > bestScore) {
        bestScore = score;
        bestParent = e.source;
      }
    }
    parentById.set(n.id, bestParent && bestParent !== n.id ? bestParent : rootId);
  }
  return parentById;
}

/** 위→아래 족보형 좌표 (형제는 같은 층에 가로 배치) */
export function computeGenealogyLayout(
  graph: RelationshipGraphData,
  width: number,
  baseHeight: number,
): GenealogyLayoutResult {
  const nodes = graph.nodes ?? [];
  const edges = graph.edges ?? [];
  const positions = new Map<string, GenealogyNodePosition>();
  if (nodes.length === 0) {
    return { positions, height: baseHeight, rootId: '', parentById: new Map() };
  }

  const rootId = pickGenealogyRoot(nodes, edges);
  const parentById = assignGenealogyParents(rootId, nodes, edges);

  const childrenById = new Map<string, string[]>();
  for (const n of nodes) {
    childrenById.set(n.id, []);
  }
  for (const n of nodes) {
    if (n.id === rootId) continue;
    const p = parentById.get(n.id);
    if (p) childrenById.get(p)?.push(n.id);
  }

  const depthById = new Map<string, number>();
  depthById.set(rootId, 0);
  const queue = [rootId];
  while (queue.length > 0) {
    const id = queue.shift()!;
    const d = depthById.get(id) ?? 0;
    const kids = [...(childrenById.get(id) ?? [])].sort((a, b) => {
      const la = nodes.find((n) => n.id === a)?.label ?? a;
      const lb = nodes.find((n) => n.id === b)?.label ?? b;
      return la.localeCompare(lb, 'ko');
    });
    for (const c of kids) {
      if (!depthById.has(c)) {
        depthById.set(c, d + 1);
        queue.push(c);
      }
    }
  }

  let maxDepth = 0;
  const labelById = new Map(nodes.map((n) => [n.id, n.label ?? n.id]));
  for (const n of nodes) {
    if (!depthById.has(n.id)) {
      depthById.set(n.id, (depthById.get(rootId) ?? 0) + 1);
    }
    maxDepth = Math.max(maxDepth, depthById.get(n.id) ?? 0);
  }

  const byDepth = new Map<number, string[]>();
  for (const n of nodes) {
    const d = depthById.get(n.id) ?? 0;
    if (!byDepth.has(d)) byDepth.set(d, []);
    byDepth.get(d)!.push(n.id);
  }
  for (const ids of byDepth.values()) {
    ids.sort((a, b) => (labelById.get(a) ?? a).localeCompare(labelById.get(b) ?? 'ko'));
  }

  const rowWidth = Math.max(120, width - GENEALOGY_SIDE_PAD * 2);
  for (const [depth, ids] of byDepth) {
    const count = ids.length;
    ids.forEach((id, i) => {
      const x = count <= 1 ? width / 2 : GENEALOGY_SIDE_PAD + (rowWidth * i) / (count - 1);
      const y = GENEALOGY_TOP_PAD + depth * GENEALOGY_ROW_HEIGHT;
      positions.set(id, { x, y, depth });
    });
  }

  const height = Math.max(baseHeight, GENEALOGY_TOP_PAD + (maxDepth + 1) * GENEALOGY_ROW_HEIGHT + 48);
  return { positions, height, rootId, parentById };
}

/** 족보 연결선: 세로→가로→세로 (부모 위, 자식 아래) */
export function genealogyLinkPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  nodeRadius = 22,
): string {
  const yStart = y1 + nodeRadius + 6;
  const yEnd = y2 - nodeRadius - 6;
  if (yEnd <= yStart) {
    return `M${x1},${y1} L${x2},${y2}`;
  }
  const midY = (yStart + yEnd) / 2;
  return `M${x1},${yStart} L${x1},${midY} L${x2},${midY} L${x2},${yEnd}`;
}

export function genealogyLinkMidpoint(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  nodeRadius = 22,
): { x: number; y: number } {
  const yStart = y1 + nodeRadius + 6;
  const yEnd = y2 - nodeRadius - 6;
  const midY = yEnd > yStart ? (yStart + yEnd) / 2 : (y1 + y2) / 2;
  return { x: (x1 + x2) / 2, y: midY };
}
