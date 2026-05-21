import {
  applyKakaoTalkSamplePreset,
  takeRecentMessages,
  takeMessagesWithinLastDays,
} from './kakaoTalkMessageSampling';

describe('kakaoTalkMessageSampling', () => {
  const rows = [
    { date: '2026-05-01 10:00:00', user: 'A', message: '1' },
    { date: '2026-05-02 10:00:00', user: 'B', message: '2' },
    { date: '2026-05-03 10:00:00', user: 'C', message: '3' },
    { date: '2026-05-04 10:00:00', user: 'D', message: '4' },
  ];

  it('takeRecentMessages는 최근 N건만 남긴다', () => {
    expect(takeRecentMessages(rows, 2).map((m) => m.message)).toEqual(['3', '4']);
  });

  it('takeMessagesWithinLastDays는 종료일 기준 N일만 남긴다', () => {
    const out = takeMessagesWithinLastDays(rows, 2);
    expect(out.map((m) => m.message)).toEqual(['3', '4']);
  });

  it('applyKakaoTalkSamplePreset는 샘플 설명을 반환한다', () => {
    const result = applyKakaoTalkSamplePreset(rows, 'recent_10000');
    expect(result.sampledCount).toBe(4);
    expect(result.description).toContain('10,000');
  });
});
