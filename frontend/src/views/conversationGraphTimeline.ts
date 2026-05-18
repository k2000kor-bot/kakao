/** 그래프 기간을 N구간으로 나눠 빠른 기간 점프용 세그먼트 생성 */

export type TimelineSegment = {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
};

function parseIsoDate(iso: string): Date | null {
  const d = new Date(`${iso.trim().slice(0, 10)}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function buildTimelineSegments(
  bounds: { start: string; end: string },
  parts = 3,
): TimelineSegment[] {
  const start = parseIsoDate(bounds.start);
  const end = parseIsoDate(bounds.end);
  if (!start || !end || end.getTime() < start.getTime()) return [];

  const spanMs = end.getTime() - start.getTime();
  if (spanMs <= 0) {
    const day = formatIsoDate(start);
    return [{ id: 'single', label: day, startDate: day, endDate: day }];
  }

  const segments: TimelineSegment[] = [];
  const n = Math.max(2, Math.min(parts, 6));
  for (let i = 0; i < n; i += 1) {
    const t0 = start.getTime() + (spanMs * i) / n;
    const t1 = i === n - 1 ? end.getTime() : start.getTime() + (spanMs * (i + 1)) / n - 86400000;
    const segStart = new Date(t0);
    const segEnd = new Date(Math.max(t0, t1));
    if (segEnd.getTime() < segStart.getTime()) segEnd.setTime(segStart.getTime());
    segments.push({
      id: `seg-${i}`,
      label: n === 3 && i === 0 ? '초반' : n === 3 && i === 1 ? '중반' : n === 3 && i === 2 ? '후반' : `${i + 1}구간`,
      startDate: formatIsoDate(segStart),
      endDate: formatIsoDate(segEnd > end ? end : segEnd),
    });
  }
  return segments;
}
