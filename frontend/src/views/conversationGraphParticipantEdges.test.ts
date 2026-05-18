import {
  formatEdgeWeightSummary,
  listParticipantEdgeRows,
} from './conversationGraphParticipantEdges';

describe('conversationGraphParticipantEdges', () => {
  it('formatEdgeWeightSummary는 엣지 유형·가중치를 요약한다', () => {
    expect(
      formatEdgeWeightSummary({
        source: 'a',
        target: 'b',
        weight: 3,
        weight_동조: 2,
        edge_type: '동조',
      }),
    ).toBe('동조×2');
  });

  it('listParticipantEdgeRows는 선택 참여자 기준 연결 목록을 정렬한다', () => {
    const labels = new Map([
      ['a', '알파'],
      ['b', '베타'],
    ]);
    const rows = listParticipantEdgeRows(
      'a',
      [
        { source: 'b', target: 'a', weight: 1, edge_type: 'flow' },
        { source: 'a', target: 'b', weight: 2, weight_동조: 2, edge_type: '동조' },
      ],
      labels,
    );
    expect(rows).toHaveLength(2);
    expect(rows[0].otherLabel).toBe('베타');
    expect(rows.some((r) => r.summary.includes('↓'))).toBe(true);
    expect(rows.some((r) => r.summary.includes('↑'))).toBe(true);
  });
});
