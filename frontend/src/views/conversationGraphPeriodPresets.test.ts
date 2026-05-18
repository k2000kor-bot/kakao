import {
  graphPeriodPresetLabel,
  resolveGraphPeriodRange,
  subtractDaysFromIsoDate,
} from './conversationGraphPeriodPresets';

describe('conversationGraphPeriodPresets', () => {
  it('subtractDaysFromIsoDate는 N일 전 날짜를 반환한다', () => {
    expect(subtractDaysFromIsoDate('2026-05-16', 7)).toBe('2026-05-09');
  });

  it('resolveGraphPeriodRange는 최근 7일 구간을 만든다', () => {
    expect(
      resolveGraphPeriodRange('7d', { start: '2026-04-01', end: '2026-05-16' }),
    ).toEqual({ startDate: '2026-05-09', endDate: '2026-05-16' });
  });

  it('graphPeriodPresetLabel은 한글 라벨을 반환한다', () => {
    expect(graphPeriodPresetLabel('all')).toBe('전체');
    expect(graphPeriodPresetLabel('7d')).toBe('최근 7일');
  });
});
