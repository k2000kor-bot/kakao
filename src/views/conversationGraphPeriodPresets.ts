export type GraphPeriodPresetId = 'all' | '7d' | '30d' | '90d';

export const GRAPH_PERIOD_PRESETS: GraphPeriodPresetId[] = ['all', '7d', '30d', '90d'];

export function graphPeriodPresetLabel(id: GraphPeriodPresetId): string {
  if (id === 'all') return '전체';
  if (id === '7d') return '최근 7일';
  if (id === '30d') return '최근 30일';
  return '최근 90일';
}

/** YYYY-MM-DD에서 N일 전 날짜 */
export function subtractDaysFromIsoDate(isoDate: string, days: number): string {
  const base = isoDate.trim().slice(0, 10);
  const d = new Date(`${base}T12:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function resolveGraphPeriodRange(
  preset: GraphPeriodPresetId,
  bounds: { start: string; end: string } | null,
): { startDate: string; endDate: string } {
  if (preset === 'all' || !bounds?.end) {
    return { startDate: '', endDate: '' };
  }
  const endDate = bounds.end.trim().slice(0, 10);
  const days = preset === '7d' ? 7 : preset === '30d' ? 30 : 90;
  const startDate = subtractDaysFromIsoDate(endDate, days);
  const boundStart = bounds.start?.trim().slice(0, 10) ?? '';
  if (boundStart && startDate && startDate < boundStart) {
    return { startDate: boundStart, endDate };
  }
  return { startDate, endDate };
}

/** API·그래프 응답에서 기간 범위 추출 */
export function graphDataDateBounds(graph: {
  start_date?: string;
  end_date?: string;
}): { start: string; end: string } | null {
  const start = graph.start_date?.trim().slice(0, 10) ?? '';
  const end = graph.end_date?.trim().slice(0, 10) ?? '';
  if (!start && !end) return null;
  return { start: start || end, end: end || start };
}
