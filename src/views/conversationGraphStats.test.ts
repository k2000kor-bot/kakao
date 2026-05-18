import {
  computeStanceBreakdown,
  formatStanceBreakdownText,
  listTopEdges,
} from './conversationGraphStats';

describe('conversationGraphStats', () => {
  it('computeStanceBreakdown은 우세 입장별 참여자 수를 센다', () => {
    const breakdown = computeStanceBreakdown([
      { id: 'a', label: 'A', message_count: 1, dominant_stance: '동조' },
      { id: 'b', label: 'B', message_count: 1, dominant_stance: '반대' },
      { id: 'c', label: 'C', message_count: 1 },
    ]);
    expect(breakdown).toEqual({ 동조: 1, 반대: 1, 중립: 1 });
    expect(formatStanceBreakdownText(breakdown)).toContain('동조 1');
  });

  it('listTopEdges는 활동 점수 순으로 상위 연결을 반환한다', () => {
    const labels = new Map([
      ['a', '알파'],
      ['b', '베타'],
    ]);
    const top = listTopEdges(
      [
        { source: 'a', target: 'b', weight: 1 },
        { source: 'b', target: 'a', weight: 5, weight_동조: 3, edge_type: '동조' },
      ],
      labels,
      1,
    );
    expect(top).toHaveLength(1);
    expect(top[0].summary).toContain('알파');
    expect(top[0].score).toBeGreaterThan(1);
  });
});
