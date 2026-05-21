import type { KakaoTalkMessage } from './kakaoTalkMessage';

/**
 * 백엔드 파서가 읽기 쉬운 카카오톡 대화 TXT 한 줄 형식.
 * 예: 2026-04-20 09:21:47, 신명근 : 메시지
 */
export function formatKakaoTalkMessagesForUpload(messages: KakaoTalkMessage[]): string {
  return messages
    .map((m) => {
      const body = m.message.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      return `${m.date}, ${m.user} : ${body}`;
    })
    .join('\n');
}

/** 업로드용 .txt 파일 Blob */
export function kakaoTalkMessagesToUploadFile(
  messages: KakaoTalkMessage[],
  baseFilename: string,
): File {
  const stem = baseFilename.replace(/\.[^.]+$/, '') || 'kakao-chat';
  const text = formatKakaoTalkMessagesForUpload(messages);
  return new File([text], `${stem}.txt`, { type: 'text/plain;charset=utf-8' });
}
