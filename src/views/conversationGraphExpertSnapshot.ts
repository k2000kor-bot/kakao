import type {
  RelationshipGraphData,
  RelationshipGraphEdge,
  RelationshipGraphEvidence,
  RelationshipGraphMeta,
} from '../services/conversationGraphService';
import type { GraphAiAnalysis, ParticipantAiInsight } from './conversationGraphAiAnalyzer';
import { pickGenealogyRoot } from './conversationGraphGenealogyLayout';
import {
  expertLayerLabel,
  filterRelationshipGraphByExpertLayer,
  formatExpertLayerSummary,
  type ExpertLayerId,
} from './conversationGraphExpertLayers';
import { formatConciseEdgeLabel } from './conversationGraphEdgeLabels';
import {
  computeStanceBreakdown,
  formatStanceBreakdownText,
  listTopEdges,
} from './conversationGraphStats';

export type GraphDashboardKpi = {
  messageCount: number;
  participantCount: number;
  edgeCount: number;
  trustScore: number;
  trustLabel: string;
  stanceText: string;
  rootLabel: string;
  contractorSignalCount: number;
};

export function resolveGraphMeta(graph: RelationshipGraphData | null | undefined): RelationshipGraphMeta | null {
  return graph?.meta ?? null;
}

export function computeGraphDashboardKpi(
  graph: RelationshipGraphData | null | undefined,
  analysis: GraphAiAnalysis | null | undefined,
): GraphDashboardKpi | null {
  const nodes = graph?.nodes ?? [];
  if (nodes.length === 0) return null;
  const meta = graph?.meta;
  const labelById = new Map(nodes.map((n) => [n.id, n.label?.trim() || n.id]));
  const rootId = meta?.genealogy_root_id || pickGenealogyRoot(nodes, graph?.edges ?? []);
  const breakdown = meta?.stance_breakdown ?? computeStanceBreakdown(nodes);
  return {
    messageCount: meta?.message_count ?? nodes.reduce((s, n) => s + (n.message_count ?? 0), 0),
    participantCount: meta?.participant_count ?? nodes.length,
    edgeCount: meta?.edge_count ?? (graph?.edges ?? []).length,
    trustScore: analysis?.trustScore ?? 0,
    trustLabel: analysis?.trustLabel ?? '보통',
    stanceText: formatStanceBreakdownText(breakdown as ReturnType<typeof computeStanceBreakdown>),
    rootLabel: labelById.get(rootId) ?? rootId,
    contractorSignalCount: meta?.contractor_signals?.length ?? 0,
  };
}

function formatGenealogyTierSection(
  graph: RelationshipGraphData,
  analysis: GraphAiAnalysis | null | undefined,
): string {
  const meta = graph.meta;
  if (!meta?.participant_roles) return '';
  const labelById = new Map((graph.nodes ?? []).map((n) => [n.id, n.label?.trim() || n.id]));
  const byTier = new Map<string, string[]>();
  for (const [id, role] of Object.entries(meta.participant_roles)) {
    const tier = role.genealogy_tier ?? '기타';
    if (!byTier.has(tier)) byTier.set(tier, []);
    byTier.get(tier)!.push(labelById.get(id) ?? id);
  }
  const lines: string[] = ['족보형 계층(추정):'];
  for (const tier of ['대화 주도', '1차 응답·동조', '확산·연결', '관망']) {
    const names = byTier.get(tier);
    if (names?.length) lines.push(`- ${tier}: ${names.join(', ')}`);
  }
  if (analysis?.topInfluencers?.length) {
    lines.push(
      `영향력 상위: ${analysis.topInfluencers
        .slice(0, 5)
        .map((p) => `${p.label}(${p.exchangeRole})`)
        .join(', ')}`,
    );
  }
  return lines.join('\n');
}

function formatContractorSection(meta: RelationshipGraphMeta | null | undefined): string {
  const signals = meta?.contractor_signals ?? [];
  if (signals.length === 0) return '';
  const lines = ['시공사·제안 항목 반응 신호(대화 데이터 추정, 확정 아님):'];
  for (const s of signals.slice(0, 6)) {
    lines.push(
      `- ${s.contractor} · ${s.proposal_item}: 긍정 ${s.positive_count} / 부정 ${s.negative_count} / 중립 ${s.neutral_count}`,
    );
    for (const m of s.sample_messages ?? []) {
      lines.push(`  · ${m.user}: 「${m.text}」 (${m.stance})`);
    }
  }
  return lines.join('\n');
}

function formatEvidenceSection(evidence: RelationshipGraphEvidence[] | undefined): string {
  const rows = evidence ?? [];
  if (rows.length === 0) return '';
  const lines = ['연결 근거 발언 샘플(직전 발화→다음 발화):'];
  for (const row of rows.slice(0, 5)) {
    const head =
      row.type === 'edge'
        ? `${row.summary ?? `${row.source}→${row.target}`} [${row.edge_type ?? 'flow'}]`
        : String(row.participant_id ?? '');
    lines.push(`- ${head}`);
    for (const m of row.messages ?? []) {
      if ('from_text' in m && m.from_text) {
        lines.push(`  · ${m.from_user}: ${m.from_text} → ${m.to_user}: ${m.to_text}`);
      }
    }
  }
  return lines.join('\n');
}

function formatSelectedParticipantSection(
  insight: ParticipantAiInsight | null | undefined,
  graph: RelationshipGraphData | null | undefined,
): string {
  if (!insight || !graph) return '';
  const role = graph.meta?.participant_roles?.[insight.id];
  const tier = role?.genealogy_tier ? `족보 역할: ${role.genealogy_tier}` : '';
  return ['선택 참여자 집중:', insight.profileLine, tier].filter(Boolean).join('\n');
}

/** 통합 답변·리포트용 풍부한 관계도 스냅샷 (기획서 전문가 통합 레이어 반영) */
export function buildExpertGraphSnapshotForAnswer(input: {
  graph: RelationshipGraphData | null | undefined;
  analysis: GraphAiAnalysis | null | undefined;
  selectedInsight?: ParticipantAiInsight | null;
  periodLabel?: string;
  conversationTitle?: string;
  expertLayer?: ExpertLayerId;
}): string {
  const { graph, analysis, selectedInsight, periodLabel, conversationTitle, expertLayer = 'all' } =
    input;
  const scoped =
    graph && expertLayer && expertLayer !== 'all'
      ? filterRelationshipGraphByExpertLayer(graph, analysis ?? null, expertLayer)
      : graph;
  const nodes = scoped?.nodes ?? [];
  const edges = scoped?.edges ?? [];
  if (nodes.length === 0) return '';

  const labelById = new Map(nodes.map((n) => [n.id, n.label?.trim() || n.id]));
  const kpi = computeGraphDashboardKpi(scoped, analysis);
  const topLines = listTopEdges(edges, labelById, 10).map((r) => `- ${r.summary}`);

  const edgeDetailLines = (edges as RelationshipGraphEdge[])
    .slice()
    .sort(
      (a, b) =>
        (b.weight ?? 0) +
        (b.weight_동조 ?? 0) +
        (b.weight_반대 ?? 0) +
        (b.weight_대립 ?? 0) -
        ((a.weight ?? 0) + (a.weight_동조 ?? 0) + (a.weight_반대 ?? 0) + (a.weight_대립 ?? 0)),
    )
    .slice(0, 12)
    .map((e) => {
      const a = labelById.get(e.source) ?? e.source;
      const b = labelById.get(e.target) ?? e.target;
      return `- ${a} → ${b}: ${formatConciseEdgeLabel(e)}`;
    });

  return [
    conversationTitle ? `대화: ${conversationTitle}` : '',
    periodLabel ? `분석 기간: ${periodLabel}` : '',
    kpi
      ? `KPI: 발언 ${kpi.messageCount}건 · 참여자 ${kpi.participantCount}명 · 연결 ${kpi.edgeCount}개 · 신뢰 ${kpi.trustScore}(${kpi.trustLabel}) · 족보 루트 ${kpi.rootLabel}`
      : '',
    kpi ? `입장 분포: ${kpi.stanceText}` : '',
    analysis?.stanceSummary ?? '',
    analysis?.exchangeSummary ?? '',
    analysis?.alignmentSummary ?? '',
    expertLayer !== 'all' ? formatExpertLayerSummary(expertLayer, graph ?? null, analysis ?? null) : '',
    expertLayer !== 'all' ? `활성 레이어: ${expertLayerLabel(expertLayer)}` : '',
    formatGenealogyTierSection(scoped!, analysis),
    formatContractorSection(scoped?.meta),
    topLines.length ? `활발한 연결:\n${topLines.join('\n')}` : '',
    edgeDetailLines.length ? `연결 상세:\n${edgeDetailLines.join('\n')}` : '',
    formatEvidenceSection(graph?.evidence),
    formatSelectedParticipantSection(selectedInsight, graph),
    '주의: 성향·시공사 선호·관계는 대화 데이터 기반 추정이며 확정 판단이 아닙니다. 근거 발언을 반드시 인용하세요.',
  ]
    .filter(Boolean)
    .join('\n');
}
