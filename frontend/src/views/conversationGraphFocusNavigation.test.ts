import { pickEdgeFocusParticipantId } from './conversationGraphFocusNavigation';

describe('conversationGraphFocusNavigation', () => {
  it('pickEdgeFocusParticipantId는 선택된 쪽이면 반대편을 반환한다', () => {
    expect(pickEdgeFocusParticipantId('a', 'b', 'a')).toBe('b');
    expect(pickEdgeFocusParticipantId('a', 'b', 'b')).toBe('a');
  });

  it('선택이 없으면 target을 기본으로 한다', () => {
    expect(pickEdgeFocusParticipantId('a', 'b', null)).toBe('b');
  });
});
