import { filterKakaoTalkMessages, isKakaoSystemMessage } from './kakaoTalkMessage';

describe('kakaoTalkMessage', () => {
  it('isKakaoSystemMessage는 입퇴장·사진·초대를 구분한다', () => {
    expect(isKakaoSystemMessage('사진')).toBe(true);
    expect(isKakaoSystemMessage('원용국님이 나갔습니다.')).toBe(true);
    expect(isKakaoSystemMessage('상대원Y님이 김남규님을 초대했습니다.')).toBe(true);
    expect(isKakaoSystemMessage('오늘 회의 어떻게 생각하세요?')).toBe(false);
  });

  it('filterKakaoTalkMessages는 excludeSystemMessages일 때 시스템 메시지를 제거한다', () => {
    const rows = [
      { date: '2026-05-11 10:00:00', user: 'A', message: '안녕' },
      { date: '2026-05-11 10:01:00', user: 'B', message: '사진' },
    ];
    expect(filterKakaoTalkMessages(rows, { excludeSystemMessages: true })).toHaveLength(1);
    expect(filterKakaoTalkMessages(rows, { excludeSystemMessages: false })).toHaveLength(2);
  });
});
