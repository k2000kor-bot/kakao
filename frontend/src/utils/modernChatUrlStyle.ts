import { coerceTrimmedString } from './chatInputUtils';

/** 메인 대화(Composer)·Modern Chat URL과 동일한 응답 길이 옵션 */
export const CHAT_RESPONSE_STYLES = ['concise', 'balanced', 'detailed', 'comprehensive'] as const;
export type ChatResponseStyleUi = (typeof CHAT_RESPONSE_STYLES)[number];

/** 메인 대화(Composer)·Modern Chat URL과 동일한 관점 옵션 */
export const CHAT_PERSPECTIVES = [
  'practical',
  'theoretical',
  'creative',
  'critical',
  'empathetic',
] as const;
export type ChatPerspectiveUi = (typeof CHAT_PERSPECTIVES)[number];

/** 비스트리밍·스트리밍·통합 API 본문 등 기본값 (Composer·URL 미설정 시와 동일) */
export const DEFAULT_CHAT_RESPONSE_STYLE: ChatResponseStyleUi = 'balanced';
export const DEFAULT_CHAT_PERSPECTIVE: ChatPerspectiveUi = 'practical';

/** Composer 패널·짧은 표기 (예: 간결, 균형) */
export const CHAT_RESPONSE_STYLE_SHORT_KO = {
  concise: '간결',
  balanced: '균형',
  detailed: '상세',
  comprehensive: '종합',
} satisfies Record<ChatResponseStyleUi, string>;

/** 트리거 요약·aria용 형용사형 (예: 간결한, 균형잡힌) */
export const CHAT_RESPONSE_STYLE_LONG_KO = {
  concise: '간결한',
  balanced: '균형잡힌',
  detailed: '상세한',
  comprehensive: '종합적인',
} satisfies Record<ChatResponseStyleUi, string>;

export const CHAT_PERSPECTIVE_LABEL_KO = {
  practical: '실용적',
  theoretical: '이론적',
  creative: '창의적',
  critical: '비판적',
  empathetic: '공감적',
} satisfies Record<ChatPerspectiveUi, string>;

const RESPONSE_STYLE_SET = new Set<string>(CHAT_RESPONSE_STYLES);
const PERSPECTIVE_SET = new Set<string>(CHAT_PERSPECTIVES);

export type ModernChatUrlStyle = {
  response_style?: string;
  perspective?: string;
};

/**
 * Modern Chat 라우트의 `response_style`·`perspective` 쿼리를 파싱한다.
 * 허용 목록에 없는 값은 무시한다.
 */
export function parseModernChatUrlStyle(searchParams: URLSearchParams): ModernChatUrlStyle {
  const rs = coerceTrimmedString(searchParams.get('response_style') ?? '', '');
  const pv = coerceTrimmedString(searchParams.get('perspective') ?? '', '');
  const out: ModernChatUrlStyle = {};
  if (rs.length > 0 && RESPONSE_STYLE_SET.has(rs)) {
    out.response_style = rs;
  }
  if (pv.length > 0 && PERSPECTIVE_SET.has(pv)) {
    out.perspective = pv;
  }
  return out;
}
