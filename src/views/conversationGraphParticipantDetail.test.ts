import {
  countParticipantEdgeStats,
  formatConversationGraphParticipantDetail,
} from './conversationGraphParticipantDetail';

describe('conversationGraphParticipantDetail', () => {
  it('countParticipantEdgeStats는 발신·수신 연결 수를 센다', () => {
    const stats = countParticipantEdgeStats('a', [
      { source: 'a', target: 'b', weight: 1 },
      { source: 'c', target: 'a', weight: 2 },
      { source: 'b', target: 'c', weight: 1 },
    ]);
    expect(stats).toEqual({ outbound: 1, inbound: 1 });
  });

  it('formatConversationGraphParticipantDetail은 라벨·메시지·입장·연결을 요약한다', () => {
    const text = formatConversationGraphParticipantDetail(
      {
        id: 'p1',
        label: '홍길동',
        message_count: 5,
        dominant_stance: '동조',
        stance_동조: 3,
        stance_반대: 1,
        stance_중립: 1,
      },
      { outbound: 2, inbound: 1 },
    );
    expect(text).toContain('홍길동');
    expect(text).toContain('메시지 5건');
    expect(text).toContain('우세 입장 동조');
    expect(text).toContain('연결 발신 2 · 수신 1');
  });
});
