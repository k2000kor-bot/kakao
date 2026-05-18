import { analyzeRelationshipGraph } from './conversationGraphAiAnalyzer';
import {
  filterRelationshipGraphByExpertLayer,
  formatExpertLayerSummary,
} from './conversationGraphExpertLayers';
import type { RelationshipGraphData } from '../services/conversationGraphService';

describe('conversationGraphExpertLayers', () => {
  const graph: RelationshipGraphData = {
    upload_id: 'g1',
    meta: {
      message_count: 16,
      participant_count: 3,
      edge_count: 2,
      stance_breakdown: { 동조: 10, 반대: 5, 중립: 1 },
      genealogy_root_id: 'p1',
      participant_roles: {
        p1: { genealogy_tier: '주도', depth: 0 },
        p2: { genealogy_tier: '1차 응답', depth: 1, parent_id: 'p1' },
        p3: { genealogy_tier: '관망', depth: 2, parent_id: 'p1' },
      },
      contractor_signals: [
        {
          contractor: '시공사A',
          proposal_item: '외벽',
          positive_count: 0,
          negative_count: 0,
          neutral_count: 1,
          sample_messages: [{ user: '베타', text: '검토 부탁', stance: '중립' }],
        },
      ],
    },
    nodes: [
      { id: 'p1', label: '알파', message_count: 10, dominant_stance: '동조' },
      { id: 'p2', label: '베타', message_count: 5, dominant_stance: '반대' },
      { id: 'p3', label: '감마', message_count: 1, dominant_stance: '중립' },
    ],
    edges: [
      { source: 'p1', target: 'p2', weight: 2, edge_type: '반대', weight_반대: 2 },
      { source: 'p2', target: 'p3', weight: 1, edge_type: 'flow' },
    ],
  };

  const analysis = analyzeRelationshipGraph(graph);

  it('all 레이어는 원본 그래프를 유지한다', () => {
    const filtered = filterRelationshipGraphByExpertLayer(graph, analysis, 'all');
    expect(filtered.nodes).toHaveLength(3);
    expect(filtered.edges).toHaveLength(2);
  });

  it('stance_conflict 레이어는 반대·대립 연결 참여자만 남긴다', () => {
    const filtered = filterRelationshipGraphByExpertLayer(graph, analysis, 'stance_conflict');
    const ids = (filtered.nodes ?? []).map((n) => n.id).sort();
    expect(ids).toEqual(['p1', 'p2']);
    expect(filtered.edges).toHaveLength(1);
  });

  it('genealogy 레이어는 관망을 제외한다', () => {
    const filtered = filterRelationshipGraphByExpertLayer(graph, analysis, 'genealogy');
    const ids = (filtered.nodes ?? []).map((n) => n.id).sort();
    expect(ids).toEqual(['p1', 'p2']);
  });

  it('contractor 레이어는 시공사 샘플 발화자를 포함한다', () => {
    const filtered = filterRelationshipGraphByExpertLayer(graph, analysis, 'contractor');
    expect(filtered.nodes?.map((n) => n.label)).toEqual(['베타']);
  });

  it('formatExpertLayerSummary는 레이어 요약 문구를 반환한다', () => {
    const text = formatExpertLayerSummary('stance_conflict', graph, analysis);
    expect(text).toContain('갈등 축');
    expect(text).toContain('2명');
  });
});
