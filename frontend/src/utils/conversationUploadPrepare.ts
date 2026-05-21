import { looksLikeKakaoTalkCsv, parseKakaoTalkCsv } from './kakaoTalkCsvParser';
import {
  formatKakaoTalkMessagesForUpload,
  kakaoTalkMessagesToUploadFile,
} from './kakaoTalkConversationFormat';
import { filterKakaoTalkMessages } from './kakaoTalkMessage';
import {
  applyKakaoTalkSamplePreset,
  type KakaoTalkSamplePreset,
} from './kakaoTalkMessageSampling';
import {
  formatKakaoTalkUploadSummaryLine,
  summarizeKakaoTalkMessages,
  type KakaoTalkUploadSummary,
} from './kakaoTalkUploadSummary';

export type ConversationUploadSource = 'plain' | 'kakao_csv';

export interface ConversationUploadPrepareOptions {
  excludeSystemMessages?: boolean;
  /** 대용량 CSV 샘플링 (기본 all) */
  samplePreset?: KakaoTalkSamplePreset;
}

export interface PreparedConversationUpload {
  source: ConversationUploadSource;
  /** API에 보낼 파일(카카오 CSV는 정규화된 .txt) */
  file: File;
  displayName: string;
  summary: KakaoTalkUploadSummary | null;
  summaryLine: string;
  warnings: string[];
}

const LARGE_MESSAGE_WARN = 50_000;
const LARGE_FILE_BYTES_WARN = 8 * 1024 * 1024;

/** 파일 내용·이름으로 업로드 payload를 준비한다. 카카오톡 CSV는 TXT로 정규화한다. */
export function prepareConversationUpload(
  rawText: string,
  originalFile: File,
  opts?: ConversationUploadPrepareOptions,
): PreparedConversationUpload {
  const warnings: string[] = [];

  if (originalFile.size >= LARGE_FILE_BYTES_WARN) {
    warnings.push(
      `파일 크기가 ${(originalFile.size / (1024 * 1024)).toFixed(1)}MB입니다. 처리에 시간이 걸릴 수 있습니다.`,
    );
  }

  if (!looksLikeKakaoTalkCsv(rawText)) {
    return {
      source: 'plain',
      file: originalFile,
      displayName: originalFile.name,
      summary: null,
      summaryLine: '',
      warnings,
    };
  }

  let messages = parseKakaoTalkCsv(rawText);
  const totalParsed = messages.length;
  messages = filterKakaoTalkMessages(messages, {
    excludeSystemMessages: opts?.excludeSystemMessages,
  });

  const samplePreset = opts?.samplePreset ?? 'all';
  const sampled = applyKakaoTalkSamplePreset(messages, samplePreset);
  messages = sampled.messages;
  if (sampled.originalCount > sampled.sampledCount) {
    warnings.push(
      `대용량 대화: ${sampled.originalCount.toLocaleString('ko-KR')}건 중 ${sampled.description} ${sampled.sampledCount.toLocaleString('ko-KR')}건으로 샘플링했습니다.`,
    );
  }

  if (totalParsed >= LARGE_MESSAGE_WARN) {
    warnings.push(`메시지가 ${totalParsed.toLocaleString('ko-KR')}건입니다. 관계도 생성에 시간이 걸릴 수 있습니다.`);
  }

  if (opts?.excludeSystemMessages && messages.length < totalParsed) {
    warnings.push(
      `시스템·미디어 메시지 ${(totalParsed - messages.length).toLocaleString('ko-KR')}건을 제외했습니다.`,
    );
  }

  if (messages.length === 0) {
    throw new Error('업로드할 대화 메시지가 없습니다. 필터 설정을 확인해 주세요.');
  }

  const summary = summarizeKakaoTalkMessages(messages);
  const file = kakaoTalkMessagesToUploadFile(messages, originalFile.name);

  return {
    source: 'kakao_csv',
    file,
    displayName: originalFile.name,
    summary,
    summaryLine: formatKakaoTalkUploadSummaryLine(summary),
    warnings,
  };
}

/** 붙여넣기 텍스트가 카카오톡 CSV이면 정규화 TXT를 반환한다. 아니면 null. */
export function preparePastedConversationText(
  text: string,
  opts?: ConversationUploadPrepareOptions,
): {
  uploadText: string;
  filename: string;
  summary: KakaoTalkUploadSummary;
  summaryLine: string;
} | null {
  if (!looksLikeKakaoTalkCsv(text)) return null;
  let messages = parseKakaoTalkCsv(text);
  messages = filterKakaoTalkMessages(messages, { excludeSystemMessages: opts?.excludeSystemMessages });
  const sampled = applyKakaoTalkSamplePreset(messages, opts?.samplePreset ?? 'all');
  messages = sampled.messages;
  if (messages.length === 0) {
    throw new Error('업로드할 대화 메시지가 없습니다.');
  }
  const summary = summarizeKakaoTalkMessages(messages);
  return {
    uploadText: formatKakaoTalkMessagesForUpload(messages),
    filename: 'pasted-kakao.txt',
    summary,
    summaryLine: formatKakaoTalkUploadSummaryLine(summary),
  };
}
