import type { RelationshipGraphEdge } from '../services/conversationGraphService';
import { edgeActivityScore } from './conversationGraphStats';

/** 연결 유형 한 줄 설명 (범례·툴팁용) */
export const GRAPH_EDGE_LEGEND: ReadonlyArray<{ key: string; label: string; hint: string; color: string }> = [
  { key: 'flow', label: '발화 흐름', hint: '누가 누구에게 말을 건넴', color: 'var(--border-overlay)' },
  { key: '동조', label: '동조', hint: '같은 입장으로 맞춤', color: '#22c55e' },
  { key: '반대', label: '반대', hint: '다른 입장으로 반박', color: '#ef4444' },
  { key: '대립', label: '대립', hint: '견해가 부딪침', color: '#f97316' },
];

const EDGE_TYPE_SHORT: Record<string, string> = {
  flow: '발화',
  동조: '동조',
  반대: '반대',
  대립: '대립',
};

/** 라벨·점수 계산에 필요한 엣지 필드만 (force 레이아웃의 LayoutLink 등) */
export type ConciseEdgeLabelInput = Pick<
  RelationshipGraphEdge,
  'edge_type' | 'weight_동조' | 'weight_반대' | 'weight_대립'
> & {
  weight?: number;
};

/** 관계도 선·칩에 쓰는 짧은 연결 설명 (예: "동조×3", "발화 12") */
export function formatConciseEdgeLabel(edge: ConciseEdgeLabelInput): string {
  const type = edge.edge_type || 'flow';
  const head = EDGE_TYPE_SHORT[type] ?? type;
  const n동조 = edge.weight_동조 ?? 0;
  const n반대 = edge.weight_반대 ?? 0;
  const n대립 = edge.weight_대립 ?? 0;
  const flow = edge.weight ?? 0;

  if (type === '동조' && n동조 > 0) return `동조×${n동조}`;
  if (type === '반대' && n반대 > 0) return `반대×${n반대}`;
  if (type === '대립' && n대립 > 0) return `대립×${n대립}`;

  const tags: string[] = [];
  if (n동조 > 0) tags.push(`동${n동조}`);
  if (n반대 > 0) tags.push(`반${n반대}`);
  if (n대립 > 0) tags.push(`대${n대립}`);
  if (tags.length > 0) return `${head} ${tags.join(' ')}`;
  if (flow > 0) return `${head} ${flow}`;
  if (edgeActivityScore(edge) > 0) return head;
  return '연결';
}
