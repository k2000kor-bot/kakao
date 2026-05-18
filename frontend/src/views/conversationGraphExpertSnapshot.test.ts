import { analyzeRelationshipGraph } from './conversationGraphAiAnalyzer';
import { buildExpertGraphSnapshotForAnswer, computeGraphDashboardKpi } from './conversationGraphExpertSnapshot';
import type { RelationshipGraphData } from '../services/conversationGraphService';

const sample: RelationshipGraphData = {
  upload_id: 'u1',
  nodes: [
    { id: 'a', label: '알파', message_count: 10, dominant_stance: '동조' },
    { id: 'b', label: '베타', message_count: 3, dominant_stance: '반대' },
  ],
  edges: [{ source: 'a', target: 'b', weight: 5, weight_동조: 2, edge_type: '동조' }],
  meta: {
    message_count: 13,
    participant_count: 2,
    edge_count: 1,
    stance_breakdown: { 동조: 1, 반대: 1, 중립: 0 },
    genealogy_root_id: 'a',
    participant_roles: {
      a: { genealogy_tier: '대화 주도', depth: 0, parent_id: null },
      b: { genealogy_tier: '1차 응답·동조', depth: 1, parent_id: 'a' },
    },
    contractor_signals: [],
  },
  evidence: [
    {
      type: 'edge',
      source: 'a',
      target: 'b',
      edge_type: '동조',
      summary: '알파 → 베타',
      messages: [{ from_user: '알파', from_text: '찬성', to_user: '베타', to_text: '동의' }],
    },
  ],
};

describe('conversationGraphExpertSnapshot', () => {
  it('computeGraphDashboardKpi는 메타·분석을 합쳐 KPI를 만든다', () => {
    const analysis = analyzeRelationshipGraph(sample);
    const kpi = computeGraphDashboardKpi(sample, analysis);
    expect(kpi?.messageCount).toBe(13);
    expect(kpi?.rootLabel).toBe('알파');
    expect(kpi?.trustScore).toBeGreaterThan(0);
  });

  it('buildExpertGraphSnapshotForAnswer는 족보·근거·주의 문구를 포함한다', () => {
    const analysis = analyzeRelationshipGraph(sample);
    const text = buildExpertGraphSnapshotForAnswer({
      graph: sample,
      analysis,
      conversationTitle: '단체 채팅',
    });
    expect(text).toContain('족보형 계층');
    expect(text).toContain('근거 발언');
    expect(text).toContain('추정');
    expect(text).toContain('알파 → 베타');
  });
});
