import type { KakaoTalkMessage } from './kakaoTalkMessage';
import { isKakaoSystemMessage } from './kakaoTalkMessage';

export interface KakaoTalkUploadSummary {
  messageCount: number;
  participantCount: number;
  participants: string[];
  dateStart: string | null;
  dateEnd: string | null;
  systemMessageCount: number;
  multilineMessageCount: number;
}

function compareDateStrings(a: string, b: string): number {
  return a.localeCompare(b);
}

/** 파싱된 메시지 배열의 업로드 미리보기 통계 */
export function summarizeKakaoTalkMessages(messages: KakaoTalkMessage[]): KakaoTalkUploadSummary {
  const participants = new Set<string>();
  let systemMessageCount = 0;
  let multilineMessageCount = 0;
  let dateStart: string | null = null;
  let dateEnd: string | null = null;

  for (const m of messages) {
    if (m.user) participants.add(m.user);
    if (isKakaoSystemMessage(m.message)) systemMessageCount += 1;
    if (m.message.includes('\n')) multilineMessageCount += 1;
    if (m.date) {
      if (!dateStart || compareDateStrings(m.date, dateStart) < 0) dateStart = m.date;
      if (!dateEnd || compareDateStrings(m.date, dateEnd) > 0) dateEnd = m.date;
    }
  }

  const sortedParticipants = [...participants].sort((a, b) => a.localeCompare(b, 'ko'));

  return {
    messageCount: messages.length,
    participantCount: participants.size,
    participants: sortedParticipants,
    dateStart,
    dateEnd,
    systemMessageCount,
    multilineMessageCount,
  };
}

/** API 기간 필터·`input[type=date]`용 `YYYY-MM-DD` (카카오 `Date` 컬럼) */
export function kakaoDateTimeToDateInput(datetime: string | null | undefined): string {
  if (!datetime) return '';
  const m = datetime.trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : '';
}

export function formatKakaoTalkUploadSummaryLine(summary: KakaoTalkUploadSummary): string {
  const range =
    summary.dateStart && summary.dateEnd
      ? `${summary.dateStart} ~ ${summary.dateEnd}`
      : '—';
  return `메시지 ${summary.messageCount.toLocaleString('ko-KR')}건 · 참여자 ${summary.participantCount.toLocaleString('ko-KR')}명 · 기간 ${range}`;
}
