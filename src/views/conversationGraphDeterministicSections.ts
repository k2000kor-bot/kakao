import type {
  RelationshipGraphData,
  RelationshipGraphEdge,
  RelationshipGraphNode,
} from '../services/conversationGraphService';
import type { GraphAiAnalysis } from './conversationGraphAiAnalyzer';
import { formatConciseEdgeLabel } from './conversationGraphEdgeLabels';
import { pickGenealogyRoot } from './conversationGraphGenealogyLayout';
import { computeGraphDashboardKpi } from './conversationGraphExpertSnapshot';
import {
  computeStanceBreakdown,
  formatStanceBreakdownText,
  listTopEdges,
} from './conversationGraphStats';

export const GRAPH_STRUCTURED_SECTIONS_KEY = 'conversation_graph_structured_sections';

export type DeterministicGraphSectionsInput = {
  graph: RelationshipGraphData;
  analysis?: GraphAiAnalysis | null;
  conversationTitle?: string;
  periodLabel?: string;
};

function escapeMermaidLabel(label: string): string {
  return label.replace(/"/g, "'").replace(/[[\]{}]/g, '').trim() || '참여자';
}

function mermaidNodeId(index: number): string {
  return `n${index}`;
}

function findEdge(
  edges: RelationshipGraphEdge[],
  sourceId: string,
  targetId: string,
): RelationshipGraphEdge | undefined {
  return edges.find((e) => e.source === sourceId && e.target === targetId);
}

function buildParticipantTable(nodes: RelationshipGraphNode[]): string[] {
  const lines = [
    '## 참여자 표',
    '',
    '| 참여자 | 우세 입장 | 발화 수 |',
    '| --- | --- | --- |',
  ];
  const sorted = [...nodes].sort(
    (a, b) => (b.message_count ?? 0) - (a.message_count ?? 0) || a.label.localeCompare(b.label, 'ko'),
  );
  for (const n of sorted) {
    const label = n.label?.trim() || n.id;
    const stance = n.dominant_stance ?? '중립';
    lines.push(`| ${label} | ${stance} | ${n.message_count ?? 0} |`);
  }
  return lines;
}

function buildConnectionTable(
  graph: RelationshipGraphData,
  labelById: Map<string, string>,
): string[] {
  const rows = listTopEdges(graph.edges, labelById, 12);
  const lines = [
    '## 연결 표 (활동 상위)',
    '',
    '| 출발 | 도착 | 관계·강도 |',
    '| --- | --- | --- |',
  ];
  if (rows.length === 0) {
    lines.push('| - | - | - |');
    return lines;
  }
  for (const row of rows) {
    const edge = findEdge(graph.edges ?? [], row.sourceId, row.targetId);
    const rel = edge ? formatConciseEdgeLabel(edge) : '연결';
    lines.push(`| ${row.sourceLabel} | ${row.targetLabel} | ${rel} |`);
  }
  return lines;
}

function buildMermaidBlock(
  graph: RelationshipGraphData,
  labelById: Map<string, string>,
): string[] {
  const nodes = graph.nodes ?? [];
  const edges = graph.edges ?? [];
  if (nodes.length === 0) return [];

  const idByNodeId = new Map<string, string>();
  nodes.forEach((n, i) => idByNodeId.set(n.id, mermaidNodeId(i)));

  const lines = ['## Mermaid 관계도 (그래프 데이터 기준)', '', '```mermaid', 'flowchart TB'];

  const rootId = graph.meta?.genealogy_root_id || pickGenealogyRoot(nodes, edges);
  if (rootId && idByNodeId.has(rootId)) {
    const rootLabel = escapeMermaidLabel(labelById.get(rootId) ?? rootId);
    lines.push(`  ${idByNodeId.get(rootId)}["${rootLabel} (주도)"]`);
  }

  for (const n of nodes) {
    if (n.id === rootId) continue;
    const mid = idByNodeId.get(n.id)!;
    lines.push(`  ${mid}["${escapeMermaidLabel(labelById.get(n.id) ?? n.id)}"]`);
  }

  const drawn = new Set<string>();
  for (const row of listTopEdges(edges, labelById, 18)) {
    const key = `${row.sourceId}->${row.targetId}`;
    if (drawn.has(key)) continue;
    drawn.add(key);
    const edge = findEdge(edges, row.sourceId, row.targetId);
    const rel = edge ? formatConciseEdgeLabel(edge) : '연결';
    const from = idByNodeId.get(row.sourceId);
    const to = idByNodeId.get(row.targetId);
    if (from && to) {
      lines.push(`  ${from} -->|${rel}| ${to}`);
    }
  }

  lines.push('```');
  return lines;
}

function buildContractorBlock(graph: RelationshipGraphData): string[] {
  const signals = graph.meta?.contractor_signals ?? [];
  if (signals.length === 0) return [];
  const lines = ['## 시공사·제안 반응 (대화 데이터 추정)', ''];
  for (const s of signals.slice(0, 5)) {
    lines.push(
      `- **${s.contractor}** · ${s.proposal_item}: 긍정 ${s.positive_count} / 부정 ${s.negative_count} / 중립 ${s.neutral_count}`,
    );
    const samples = Array.isArray(s.sample_messages) ? s.sample_messages.slice(0, 2) : [];
    for (let i = 0; i < samples.length; i += 1) {
      const m = samples[i];
      lines.push(`  - ${m.user}: "${m.text}" (${m.stance})`);
    }
  }
  return lines;
}

function buildGenealogyBlock(graph: RelationshipGraphData, labelById: Map<string, string>): string[] {
  const roles = graph.meta?.participant_roles;
  if (!roles || Object.keys(roles).length === 0) return [];
  const byTier = new Map<string, string[]>();
  for (const [id, role] of Object.entries(roles)) {
    const tier = role.genealogy_tier ?? '기타';
    if (!byTier.has(tier)) byTier.set(tier, []);
    byTier.get(tier)!.push(labelById.get(id) ?? id);
  }
  const lines = ['## 족보형 계층 (추정)', ''];
  for (const tier of ['대화 주도', '1차 응답·동조', '확산·연결', '관망', '기타']) {
    const names = byTier.get(tier);
    if (names?.length) lines.push(`- ${tier}: ${names.join(', ')}`);
  }
  return lines;
}

/** 그래프 JSON에서 표·Mermaid·KPI를 결정론적으로 생성 (LLM 환각 방지용) */
export function buildDeterministicGraphAnswerSections(
  input: DeterministicGraphSectionsInput,
): string {
  const nodes = input.graph.nodes ?? [];
  if (nodes.length === 0) return '';

  const labelById = new Map(nodes.map((n) => [n.id, n.label?.trim() || n.id]));
  const kpi = computeGraphDashboardKpi(input.graph, input.analysis ?? null);
  const breakdown = input.graph.meta?.stance_breakdown ?? computeStanceBreakdown(nodes);
  const stanceText = formatStanceBreakdownText(breakdown as ReturnType<typeof computeStanceBreakdown>);

  const header: string[] = ['<!-- graph-structured-sections -->'];
  if (input.conversationTitle?.trim()) {
    header.push(`**대화**: ${input.conversationTitle.trim()}`);
  }
  if (input.periodLabel?.trim()) {
    header.push(`**기간**: ${input.periodLabel.trim()}`);
  }
  if (kpi) {
    header.push(
      `**KPI**: 메시지 ${kpi.messageCount} · 참여자 ${kpi.participantCount} · 연결 ${kpi.edgeCount} · 신뢰 ${kpi.trustLabel}(${kpi.trustScore}) · 입장 ${stanceText}`,
    );
  }

  const sections: string[][] = [
    header,
    [''],
    buildParticipantTable(nodes),
    [''],
    buildConnectionTable(input.graph, labelById),
    [''],
    buildGenealogyBlock(input.graph, labelById),
    [''],
    buildContractorBlock(input.graph),
    [''],
    buildMermaidBlock(input.graph, labelById),
    [''],
    [
      '*위 표·다이어그램은 업로드된 관계도 데이터에서 자동 생성되었습니다. 수치에 없는 참여자·연결은 추가하지 마세요.*',
    ],
  ];

  return sections
    .flat()
    .filter((line, i, arr) => line !== '' || (i > 0 && arr[i - 1] !== ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
