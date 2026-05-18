import type { RelationshipGraphData } from '../services/conversationGraphService';
import { analyzeRelationshipGraph } from './conversationGraphAiAnalyzer';
import {
  buildConversationMatrixRows,
  buildMatrixCsv,
  sortMatrixRows,
} from './conversationGraphMatrix';

describe('conversationGraphMatrix', () => {
  const graph: RelationshipGraphData = {
    upload_id: 'g1',
    meta: {
      message_count: 11,
      participant_count: 2,
      edge_count: 2,
      stance_breakdown: { 동조: 6, 반대: 3, 중립: 2 },
      genealogy_root_id: 'p1',
      participant_roles: {
        p1: { genealogy_tier: '주도', depth: 0 },
        p2: { genealogy_tier: '1차 응답', depth: 1, parent_id: 'p1' },
      },
      contractor_signals: [],
    },
    nodes: [
      { id: 'p1', label: '알파', message_count: 8, dominant_stance: '동조', stance_동조: 6, stance_반대: 1, stance_중립: 1 },
      { id: 'p2', label: '베타', message_count: 3, dominant_stance: '반대', stance_동조: 0, stance_반대: 2, stance_중립: 1 },
    ],
    edges: [
      { source: 'p1', target: 'p2', weight: 4, edge_type: '동조' },
      { source: 'p2', target: 'p1', weight: 1, edge_type: 'flow' },
    ],
  };

  const analysis = analyzeRelationshipGraph(graph);

  it('buildConversationMatrixRows는 참여자별 분석 행을 만든다', () => {
    const rows = buildConversationMatrixRows(graph, analysis);
    expect(rows).toHaveLength(2);
    const alpha = rows.find((r) => r.id === 'p1');
    expect(alpha?.genealogyTier).toBe('주도');
    expect(alpha?.outbound).toBeGreaterThan(0);
    expect(alpha?.trustPercent).toMatch(/%$/);
  });

  it('sortMatrixRows는 영향력순으로 정렬한다', () => {
    const rows = buildConversationMatrixRows(graph, analysis);
    const sorted = sortMatrixRows(rows, 'influence');
    expect(sorted[0].id).toBe('p1');
  });

  it('buildMatrixCsv는 헤더와 참여자 행을 포함한다', () => {
    const rows = buildConversationMatrixRows(graph, analysis);
    const csv = buildMatrixCsv(rows);
    expect(csv.split('\n')[0]).toContain('참여자');
    expect(csv).toContain('알파');
    expect(csv).toContain('베타');
  });
});
