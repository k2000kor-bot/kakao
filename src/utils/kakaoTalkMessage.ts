/** 카카오톡보내기 CSV 한 행에 해당하는 메시지 */
export interface KakaoTalkMessage {
  date: string;
  user: string;
  message: string;
}

/** 입퇴장·초대·미디어 단독 등 관계도 분석에 덜 유용한 시스템성 메시지 */
export function isKakaoSystemMessage(message: string): boolean {
  const m = message.trim();
  if (!m) return true;
  if (m === '사진' || m === '동영상' || m === '이모티콘' || m === '음성메시지' || m === '파일') {
    return true;
  }
  if (m === '삭제된 메시지입니다.') return true;
  if (/님이 (들어왔습니다|나갔습니다)\.?$/.test(m)) return true;
  if (/님의 초대링크로/.test(m)) return true;
  if (/님이 .*초대했습니다\.?$/.test(m)) return true;
  if (/초대했습니다\.?$/.test(m) && m.includes('님')) return true;
  return false;
}

export function filterKakaoTalkMessages(
  messages: KakaoTalkMessage[],
  opts?: { excludeSystemMessages?: boolean },
): KakaoTalkMessage[] {
  if (!opts?.excludeSystemMessages) return messages;
  return messages.filter((row) => !isKakaoSystemMessage(row.message));
}
