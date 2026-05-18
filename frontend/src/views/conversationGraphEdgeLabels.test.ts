import { formatConciseEdgeLabel } from './conversationGraphEdgeLabels';
import type { RelationshipGraphEdge } from '../services/conversationGraphService';

describe('formatConciseEdgeLabel', () => {
  it('동조 엣지는 동조×N 형식으로 표시한다', () => {
    const edge: RelationshipGraphEdge = {
      source: 'a',
      target: 'b',
      weight: 0,
      edge_type: '동조',
      weight_동조: 3,
    };
    expect(formatConciseEdgeLabel(edge)).toBe('동조×3');
  });

  it('발화 흐름은 발화 N으로 표시한다', () => {
    const edge: RelationshipGraphEdge = {
      source: 'a',
      target: 'b',
      weight: 12,
      edge_type: 'flow',
    };
    expect(formatConciseEdgeLabel(edge)).toBe('발화 12');
  });
});
