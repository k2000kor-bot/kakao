import {
  buildParticipantListItems,
  filterParticipantsBySearch,
  sortParticipantListItems,
} from './conversationGraphParticipantSearch';

describe('conversationGraphParticipantSearch', () => {
  const nodes = [
    { id: 'p1', label: '김철수', message_count: 5, dominant_stance: '동조' as const },
    { id: 'p2', label: '이영희', message_count: 2, dominant_stance: '반대' as const },
  ];

  it('filterParticipantsBySearch는 이름으로 필터한다', () => {
    const items = buildParticipantListItems(nodes);
    expect(filterParticipantsBySearch(items, '김철').map((p) => p.id)).toEqual(['p1']);
  });

  it('sortParticipantListItems는 영향력순 정렬한다', () => {
    const items = buildParticipantListItems(nodes, [
      {
        id: 'p1',
        label: '김철수',
        dominantStance: '동조',
        stanceConfidence: 0.8,
        exchangeRole: '주도',
        influenceScore: 10,
        messageCount: 5,
        stanceCounts: { 동조: 5, 반대: 0, 중립: 0 },
        outboundWeight: 1,
        inboundWeight: 1,
        agreementTies: 1,
        oppositionTies: 0,
        profileLine: '',
      },
      {
        id: 'p2',
        label: '이영희',
        dominantStance: '반대',
        stanceConfidence: 0.9,
        exchangeRole: '응답',
        influenceScore: 20,
        messageCount: 2,
        stanceCounts: { 동조: 0, 반대: 2, 중립: 0 },
        outboundWeight: 1,
        inboundWeight: 2,
        agreementTies: 0,
        oppositionTies: 1,
        profileLine: '',
      },
    ]);
    expect(sortParticipantListItems(items, 'influence')[0].id).toBe('p2');
  });
});
