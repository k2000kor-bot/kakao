import {
  DEFAULT_EDGE_FILTER,
  filterRelationshipGraphByEdgeType,
  normalizeEdgeType,
} from './conversationGraphEdgeFilter';

describe('conversationGraphEdgeFilter', () => {
  const graph = {
    upload_id: 'g1',
    nodes: [
      { id: 'a', label: 'A', message_count: 1 },
      { id: 'b', label: 'B', message_count: 1 },
    ],
    edges: [
      { source: 'a', target: 'b', weight: 1, edge_type: '동조' },
      { source: 'b', target: 'a', weight: 1, edge_type: 'flow' },
    ],
  };

  it('normalizeEdgeType는 flow를 기본으로 한다', () => {
    expect(normalizeEdgeType(undefined)).toBe('flow');
    expect(normalizeEdgeType('대립')).toBe('대립');
  });

  it('filterRelationshipGraphByEdgeType는 선택 유형 연결만 남긴다', () => {
    const filtered = filterRelationshipGraphByEdgeType(graph, {
      ...DEFAULT_EDGE_FILTER,
      flow: false,
      반대: false,
      대립: false,
    });
    expect(filtered.edges).toHaveLength(1);
    expect(filtered.edges[0].edge_type).toBe('동조');
    expect(filtered.nodes).toHaveLength(2);
  });
});
