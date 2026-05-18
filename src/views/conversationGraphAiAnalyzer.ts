import type { RelationshipGraphData, RelationshipGraphEdge, RelationshipGraphNode } from '../services/conversationGraphService';
import { normalizeDominantStance, type StanceKey } from './conversationGraphFilter';
import { edgeActivityScore } from './conversationGraphStats';

export type ExchangeRole = '주도' | '응답' | '균형';

export interface ParticipantAiInsight {
  id: string;
  label: string;
  dominantStance: StanceKey;
  /** 0~1, 우세 입장 일관성 */
  stanceConfidence: number;
  exchangeRole: ExchangeRole;
  influenceScore: number;
  messageCount: number;
  stanceCounts: { 동조: number; 반대: number; 중립: number };
  /** 발화 주고받기 강도 (가중) */
  outboundWeight: number;
  inboundWeight: number;
  agreementTies: number;
  oppositionTies: number;
  profileLine: string;
}

export interface GraphAiAnalysis {
  analyzedAt: string;
  /** 0~100, 데이터·일관성 기반 신뢰 지표 */
  trustScore: number;
  trustLabel: '높음' | '보통' | '낮음';
  methodology: string[];
  stanceSummary: string;
  exchangeSummary: string;
  alignmentSummary: string;
  participants: ParticipantAiInsight[];
  topInfluencers: ParticipantAiInsight[];
  exchangeLeaders: ParticipantAiInsight[];
  agreementHubs: ParticipantAiInsight[];
}

function stanceCounts(node: RelationshipGraphNode): { 동조: number; 반대: number; 중립: number } {
  return {
    동조: node.stance_동조 ?? 0,
    반대: node.stance_반대 ?? 0,
    중립: node.stance_중립 ?? 0,
  };
}

/** 메시지 분류 건수로 우세 입장 신뢰도(0~1)를 계산한다. */
export function computeStanceConfidence(node: RelationshipGraphNode): number {
  const { 동조, 반대, 중립 } = stanceCounts(node);
  const total = 동조 + 반대 + 중립;
  if (total <= 0) return 0.35;
  const dominant = Math.max(동조, 반대, 중립);
  return Math.min(1, dominant / total);
}

function weightedEdgeSum(edges: RelationshipGraphEdge[], nodeId: string, direction: 'out' | 'in'): number {
  let sum = 0;
  for (const e of edges) {
    const w = edgeActivityScore(e);
    if (direction === 'out' && e.source === nodeId) sum += w;
    if (direction === 'in' && e.target === nodeId) sum += w;
  }
  return sum;
}

function countTiesByType(
  edges: RelationshipGraphEdge[],
  nodeId: string,
  types: string[],
): number {
  let n = 0;
  for (const e of edges) {
    if (e.source !== nodeId && e.target !== nodeId) continue;
    const t = e.edge_type || 'flow';
    if (types.includes(t)) n += 1;
  }
  return n;
}

export function inferExchangeRole(outbound: number, inbound: number): ExchangeRole {
  if (outbound <= 0 && inbound <= 0) return '균형';
  if (outbound >= inbound * 1.25) return '주도';
  if (inbound >= outbound * 1.25) return '응답';
  return '균형';
}

export function computeInfluenceScore(
  node: RelationshipGraphNode,
  edges: RelationshipGraphEdge[],
): number {
  const msg = node.message_count ?? 0;
  let link = 0;
  for (const e of edges) {
    if (e.source === node.id || e.target === node.id) {
      link += edgeActivityScore(e);
    }
  }
  return msg * 2 + link;
}

function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

export function buildParticipantProfileLine(insight: ParticipantAiInsight): string {
  const conf = formatPercent(insight.stanceConfidence);
  return `${insight.label}: ${insight.dominantStance} 성향(신뢰 ${conf}) · ${insight.exchangeRole}형 · 영향력 ${Math.round(insight.influenceScore)}`;
}

function computeTrustScore(
  nodes: RelationshipGraphNode[],
  edges: RelationshipGraphEdge[],
  participants: ParticipantAiInsight[],
): number {
  if (nodes.length === 0) return 0;
  const msgTotal = nodes.reduce((s, n) => s + (n.message_count ?? 0), 0);
  const avgConfidence =
    participants.reduce((s, p) => s + p.stanceConfidence, 0) / Math.max(1, participants.length);
  const edgeCoverage = edges.length / Math.max(1, (nodes.length * (nodes.length - 1)) / 2);
  const msgFactor = Math.min(1, msgTotal / 50);
  const coverageFactor = Math.min(1, edgeCoverage * 8);
  const raw = avgConfidence * 45 + msgFactor * 30 + coverageFactor * 25;
  return Math.round(Math.min(100, Math.max(0, raw)));
}

function trustLabel(score: number): '높음' | '보통' | '낮음' {
  if (score >= 70) return '높음';
  if (score >= 45) return '보통';
  return '낮음';
}

/** 관계도 데이터에서 AI·규칙 기반 성향·주고받기 분석을 수행한다. */
export function analyzeRelationshipGraph(graph: RelationshipGraphData): GraphAiAnalysis {
  const nodes = graph.nodes ?? [];
  const edges = graph.edges ?? [];

  const participants: ParticipantAiInsight[] = nodes.map((node) => {
    const counts = stanceCounts(node);
    const outboundWeight = weightedEdgeSum(edges, node.id, 'out');
    const inboundWeight = weightedEdgeSum(edges, node.id, 'in');
    const exchangeRole = inferExchangeRole(outboundWeight, inboundWeight);
    const insight: ParticipantAiInsight = {
      id: node.id,
      label: node.label?.trim() || node.id,
      dominantStance: normalizeDominantStance(node.dominant_stance),
      stanceConfidence: computeStanceConfidence(node),
      exchangeRole,
      influenceScore: computeInfluenceScore(node, edges),
      messageCount: node.message_count ?? 0,
      stanceCounts: counts,
      outboundWeight,
      inboundWeight,
      agreementTies: countTiesByType(edges, node.id, ['동조']),
      oppositionTies: countTiesByType(edges, node.id, ['반대', '대립']),
      profileLine: '',
    };
    insight.profileLine = buildParticipantProfileLine(insight);
    return insight;
  });

  participants.sort((a, b) => b.influenceScore - a.influenceScore);

  const breakdown: Record<StanceKey, number> = { 동조: 0, 반대: 0, 중립: 0 };
  for (const p of participants) {
    breakdown[p.dominantStance] += 1;
  }

  const trustScore = computeTrustScore(nodes, edges, participants);
  const leaders = participants.filter((p) => p.exchangeRole === '주도').slice(0, 3);
  const agreementHubs = [...participants]
    .sort((a, b) => b.agreementTies - a.agreementTies || b.influenceScore - a.influenceScore)
    .slice(0, 3);

  const stanceSummary = `참여자 ${participants.length}명 중 동조 ${breakdown.동조}명 · 반대 ${breakdown.반대}명 · 중립 ${breakdown.중립}명`;
  const exchangeSummary =
    leaders.length > 0
      ? `대화 주도: ${leaders.map((p) => p.label).join(', ')}`
      : '발화 주도 참여자가 뚜렷하지 않습니다(연결 가중치 기준).';
  const alignmentSummary =
    agreementHubs[0]?.agreementTies
      ? `동조 연결이 많은 축: ${agreementHubs.map((p) => `${p.label}(${p.agreementTies})`).join(', ')}`
      : '동조 연결 패턴이 약합니다. 메시지·기간을 넓혀 보세요.';

  return {
    analyzedAt: new Date().toISOString(),
    trustScore,
    trustLabel: trustLabel(trustScore),
    methodology: [
      '메시지 내용·연속 발화 패턴으로 동조·반대·중립을 분류합니다(서버 분석 + 클라이언트 검증).',
      '선(엣지)은 발화 흐름(회색), 동조(초록), 반대·대립(빨강·주황)으로 구분합니다.',
      '주도/응답/균형은 참여자 간 가중 연결의 발신·수신 비율로 추정합니다.',
      '신뢰도는 메시지 수, 입장 일관성, 연결 밀도를 합산한 지표이며 100% 확정이 아닙니다.',
    ],
    stanceSummary,
    exchangeSummary,
    alignmentSummary,
    participants,
    topInfluencers: participants.slice(0, 5),
    exchangeLeaders: leaders,
    agreementHubs,
  };
}

/** D3 노드 시각화용 반경·신뢰도 맵 */
export function buildNodeVisualMetrics(
  analysis: GraphAiAnalysis,
): Map<string, { radius: number; confidence: number; exchangeRole: ExchangeRole }> {
  const maxInfluence = Math.max(1, ...analysis.participants.map((p) => p.influenceScore));
  const map = new Map<string, { radius: number; confidence: number; exchangeRole: ExchangeRole }>();
  for (const p of analysis.participants) {
    const influenceNorm = p.influenceScore / maxInfluence;
    map.set(p.id, {
      radius: 14 + influenceNorm * 14,
      confidence: p.stanceConfidence,
      exchangeRole: p.exchangeRole,
    });
  }
  return map;
}
