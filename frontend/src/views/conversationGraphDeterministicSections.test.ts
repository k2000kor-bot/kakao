import type { RelationshipGraphData } from '../services/conversationGraphService';
import { buildDeterministicGraphAnswerSections } from './conversationGraphDeterministicSections';

const sampleGraph: RelationshipGraphData = {
  upload_id: 'u1',
  nodes: [
    { id: 'a', label: '알파', message_count: 12, dominant_stance: '동조' },
    { id: 'b', label: '베타', message_count: 8, dominant_stance: '반대' },
  ],
  edges: [
    { source: 'a', target: 'b', weight: 5, weight_동조: 3, edge_type: '동조' },
    { source: 'b', target: 'a', weight: 2, weight_반대: 2, edge_type: '반대' },
  ],
  meta: {
    message_count: 20,
    participant_count: 2,
    edge_count: 2,
    stance_breakdown: { 동조: 1, 반대: 1, 중립: 0 },
    genealogy_root_id: 'a',
    participant_roles: {
      a: { genealogy_tier: '대화 주도', depth: 0, parent_id: null },
      b: { genealogy_tier: '1차 응답·동조', depth: 1, parent_id: 'a' },
    },
    contractor_signals: [],
  },
};

describe('buildDeterministicGraphAnswerSections', () => {
  it('참여자 표·연결 표·Mermaid를 포함한다', () => {
    const md = buildDeterministicGraphAnswerSections({ graph: sampleGraph });
    expect(md).toContain('graph-structured-sections');
    expect(md).toContain('## 참여자 표');
    expect(md).toContain('| 알파 |');
    expect(md).toContain('| 베타 |');
    expect(md).toContain('## 연결 표');
    expect(md).toContain('```mermaid');
    expect(md).toContain('flowchart TB');
  });

  it('노드가 없으면 빈 문자열', () => {
    expect(buildDeterministicGraphAnswerSections({ graph: { ...sampleGraph, nodes: [] } })).toBe('');
  });
});
