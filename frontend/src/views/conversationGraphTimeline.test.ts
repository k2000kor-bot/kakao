import { buildTimelineSegments } from './conversationGraphTimeline';

describe('conversationGraphTimeline', () => {
  it('buildTimelineSegments는 기간을 초반·중반·후반으로 나눈다', () => {
    const segments = buildTimelineSegments({ start: '2026-05-01', end: '2026-05-30' }, 3);
    expect(segments).toHaveLength(3);
    expect(segments.map((s) => s.label)).toEqual(['초반', '중반', '후반']);
    expect(segments[0].startDate).toBe('2026-05-01');
    expect(segments[2].endDate).toBe('2026-05-30');
  });

  it('하루만 있으면 단일 세그먼트를 반환한다', () => {
    const segments = buildTimelineSegments({ start: '2026-05-10', end: '2026-05-10' });
    expect(segments).toHaveLength(1);
    expect(segments[0].startDate).toBe('2026-05-10');
  });
});
