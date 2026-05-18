import type { RelationshipGraphEdge, RelationshipGraphNode } from '../services/conversationGraphService';
import type { ParticipantAiInsight } from './conversationGraphAiAnalyzer';

export interface ParticipantEdgeStats {
  outbound: number;
  inbound: number;
}

export function countParticipantEdgeStats(
  nodeId: string,
  edges: RelationshipGraphEdge[] | undefined,
): ParticipantEdgeStats {
  let outbound = 0;
  let inbound = 0;
  for (const e of edges ?? []) {
    if (e.source === nodeId) outbound += 1;
    if (e.target === nodeId) inbound += 1;
  }
  return { outbound, inbound };
}

export function formatConversationGraphParticipantDetail(
  node: RelationshipGraphNode,
  edgeStats?: ParticipantEdgeStats,
): string {
  const label = node.label?.trim() || node.id;
  const parts = [
    `${label}: 메시지 ${node.message_count}건`,
    `우세 입장 ${node.dominant_stance || '중립'}`,
  ];
  const hasStance =
    node.stance_동조 != null || node.stance_반대 != null || node.stance_중립 != null;
  if (hasStance) {
    parts.push(
      `동조 ${node.stance_동조 ?? 0} · 반대 ${node.stance_반대 ?? 0} · 중립 ${node.stance_중립 ?? 0}`,
    );
  }
  if (edgeStats) {
    parts.push(`연결 발신 ${edgeStats.outbound} · 수신 ${edgeStats.inbound}`);
  }
  return parts.join(' · ');
}

export function formatParticipantAiInsightDetail(insight: ParticipantAiInsight): string {
  const total =
    insight.stanceCounts.동조 + insight.stanceCounts.반대 + insight.stanceCounts.중립;
  const confPct = Math.round(insight.stanceConfidence * 100);
  return [
    insight.profileLine,
    total > 0
      ? `메시지 분류: 동조 ${insight.stanceCounts.동조} · 반대 ${insight.stanceCounts.반대} · 중립 ${insight.stanceCounts.중립}`
      : '메시지 입장 분류 데이터 없음',
    `주고받기: 발신 가중 ${Math.round(insight.outboundWeight)} · 수신 가중 ${Math.round(insight.inboundWeight)} · 동조 연결 ${insight.agreementTies} · 반대·대립 ${insight.oppositionTies}`,
    `입장 신뢰 ${confPct}% — 분류가 일관될수록 높습니다.`,
  ].join(' · ');
}
