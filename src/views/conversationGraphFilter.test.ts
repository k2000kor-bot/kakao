import {
  DEFAULT_STANCE_FILTER,
  filterRelationshipGraphByStance,
  normalizeDominantStance,
} from './conversationGraphFilter';

describe('conversationGraphFilter', () => {
  const graph = {
    upload_id: 'g1',
    nodes: [
      { id: 'a', label: 'A', message_count: 1, dominant_stance: '동조' as const },
      { id: 'b', label: 'B', message_count: 1, dominant_stance: '반대' as const },
      { id: 'c', label: 'C', message_count: 1 },
    ],
    edges: [
      { source: 'a', target: 'b', weight: 1 },
      { source: 'b', target: 'c', weight: 1 },
    ],
  };

  it('normalizeDominantStance는 알 수 없는 값을 중립으로 처리한다', () => {
    expect(normalizeDominantStance('기타')).toBe('중립');
    expect(normalizeDominantStance('동조')).toBe('동조');
  });

  it('filterRelationshipGraphByStance는 선택 입장 노드와 연결만 남긴다', () => {
    const filtered = filterRelationshipGraphByStance(graph, {
      ...DEFAULT_STANCE_FILTER,
      반대: false,
      중립: false,
    });
    expect(filtered.nodes.map((n) => n.id)).toEqual(['a']);
    expect(filtered.edges).toHaveLength(0);
  });

  it('모든 필터가 꺼지면 빈 그래프를 반환한다', () => {
    const filtered = filterRelationshipGraphByStance(graph, {
      동조: false,
      반대: false,
      중립: false,
    });
    expect(filtered.nodes).toHaveLength(0);
    expect(filtered.edges).toHaveLength(0);
  });
});
