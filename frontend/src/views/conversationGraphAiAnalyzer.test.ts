import {
  analyzeRelationshipGraph,
  computeStanceConfidence,
  inferExchangeRole,
} from './conversationGraphAiAnalyzer';

describe('conversationGraphAiAnalyzer', () => {
  it('computeStanceConfidence는 우세 입장 비율을 반환한다', () => {
    expect(
      computeStanceConfidence({
        id: 'a',
        label: 'A',
        message_count: 10,
        stance_동조: 8,
        stance_반대: 1,
        stance_중립: 1,
        dominant_stance: '동조',
      }),
    ).toBeCloseTo(0.8);
  });

  it('inferExchangeRole은 발신·수신 비율로 역할을 구분한다', () => {
    expect(inferExchangeRole(10, 2)).toBe('주도');
    expect(inferExchangeRole(2, 10)).toBe('응답');
    expect(inferExchangeRole(5, 5)).toBe('균형');
  });

  it('analyzeRelationshipGraph는 신뢰도와 참여자 인사이트를 생성한다', () => {
    const analysis = analyzeRelationshipGraph({
      upload_id: 'g1',
      nodes: [
        {
          id: 'p1',
          label: '동조자',
          message_count: 5,
          dominant_stance: '동조',
          stance_동조: 4,
          stance_반대: 0,
          stance_중립: 1,
        },
        {
          id: 'p2',
          label: '반대자',
          message_count: 3,
          dominant_stance: '반대',
          stance_동조: 0,
          stance_반대: 3,
          stance_중립: 0,
        },
      ],
      edges: [
        { source: 'p1', target: 'p2', weight: 2, edge_type: '동조', weight_동조: 2 },
        { source: 'p1', target: 'p2', weight: 1, edge_type: 'flow' },
      ],
    });
    expect(analysis.trustScore).toBeGreaterThan(0);
    expect(analysis.participants).toHaveLength(2);
    expect(analysis.stanceSummary).toMatch(/동조 1/);
    expect(analysis.participants[0].profileLine).toMatch(/동조자/);
  });
});
