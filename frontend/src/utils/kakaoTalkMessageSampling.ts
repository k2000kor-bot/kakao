import type { KakaoTalkMessage } from './kakaoTalkMessage';

export type KakaoTalkSamplePreset = 'all' | 'recent_10000' | 'recent_20000' | 'recent_50000' | 'recent_30d';

export const KAKAO_TALK_SAMPLE_PRESETS: KakaoTalkSamplePreset[] = [
  'all',
  'recent_10000',
  'recent_20000',
  'recent_50000',
  'recent_30d',
];

export function kakaoTalkSamplePresetLabel(preset: KakaoTalkSamplePreset): string {
  switch (preset) {
    case 'all':
      return '전체 메시지';
    case 'recent_10000':
      return '최근 1만 건';
    case 'recent_20000':
      return '최근 2만 건';
    case 'recent_50000':
      return '최근 5만 건';
    case 'recent_30d':
      return '최근 30일';
    default:
      return preset;
  }
}

export interface KakaoTalkSampleResult {
  messages: KakaoTalkMessage[];
  originalCount: number;
  sampledCount: number;
  description: string;
}

function compareDateStrings(a: string, b: string): number {
  return a.localeCompare(b);
}

function toLocalDateIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 날짜 오름차순 정렬(오래된 것 먼저) */
export function sortKakaoMessagesByDate(messages: KakaoTalkMessage[]): KakaoTalkMessage[] {
  return [...messages].sort((a, b) => compareDateStrings(a.date, b.date));
}

/** 최근 N건만 유지 */
export function takeRecentMessages(messages: KakaoTalkMessage[], maxCount: number): KakaoTalkMessage[] {
  if (maxCount <= 0 || messages.length <= maxCount) return messages;
  const sorted = sortKakaoMessagesByDate(messages);
  return sorted.slice(-maxCount);
}

/** 최근 N일 메시지만 유지 */
export function takeMessagesWithinLastDays(messages: KakaoTalkMessage[], days: number): KakaoTalkMessage[] {
  if (days <= 0 || messages.length === 0) return messages;
  const sorted = sortKakaoMessagesByDate(messages);
  const endDate = sorted[sorted.length - 1]?.date?.trim().slice(0, 10);
  if (!endDate) return messages;
  const end = new Date(`${endDate}T12:00:00`);
  if (Number.isNaN(end.getTime())) return messages;
  const start = new Date(end);
  start.setDate(start.getDate() - Math.max(0, days - 1));
  const startIso = toLocalDateIso(start);
  return sorted.filter((m) => m.date.trim().slice(0, 10) >= startIso);
}

/** 대용량 CSV 업로드용 샘플링 프리셋 적용 */
export function applyKakaoTalkSamplePreset(
  messages: KakaoTalkMessage[],
  preset: KakaoTalkSamplePreset,
): KakaoTalkSampleResult {
  const originalCount = messages.length;
  if (preset === 'all' || originalCount === 0) {
    return {
      messages,
      originalCount,
      sampledCount: messages.length,
      description: '전체 메시지',
    };
  }
  let sampled: KakaoTalkMessage[];
  let description: string;
  if (preset === 'recent_30d') {
    sampled = takeMessagesWithinLastDays(messages, 30);
    description = '최근 30일';
  } else {
    const max =
      preset === 'recent_10000' ? 10_000 : preset === 'recent_20000' ? 20_000 : 50_000;
    sampled = takeRecentMessages(messages, max);
    description = `최근 ${max.toLocaleString('ko-KR')}건`;
  }
  return {
    messages: sampled,
    originalCount,
    sampledCount: sampled.length,
    description,
  };
}
