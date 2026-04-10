import {
  CHAT_PERSPECTIVES,
  CHAT_PERSPECTIVE_LABEL_KO,
  CHAT_RESPONSE_STYLES,
  CHAT_RESPONSE_STYLE_LONG_KO,
  CHAT_RESPONSE_STYLE_SHORT_KO,
  DEFAULT_CHAT_PERSPECTIVE,
  DEFAULT_CHAT_RESPONSE_STYLE,
  parseModernChatUrlStyle,
} from '../modernChatUrlStyle';

function params(entries: Record<string, string>): URLSearchParams {
  return new URLSearchParams(entries);
}

describe('parseModernChatUrlStyle', () => {
  it('쿼리가 없으면 빈 객체', () => {
    expect(parseModernChatUrlStyle(params({}))).toEqual({});
  });

  it('허용된 response_style만 반영', () => {
    expect(parseModernChatUrlStyle(params({ response_style: 'concise' }))).toEqual({
      response_style: 'concise',
    });
    expect(parseModernChatUrlStyle(params({ response_style: 'evil' }))).toEqual({});
  });

  it('허용된 perspective만 반영', () => {
    expect(parseModernChatUrlStyle(params({ perspective: 'creative' }))).toEqual({
      perspective: 'creative',
    });
    expect(parseModernChatUrlStyle(params({ perspective: 'admin' }))).toEqual({});
  });

  it('둘 다 유효하면 둘 다 반환', () => {
    expect(
      parseModernChatUrlStyle(
        params({ response_style: 'detailed', perspective: 'empathetic' })
      )
    ).toEqual({ response_style: 'detailed', perspective: 'empathetic' });
  });

  it('공백·trim 처리', () => {
    expect(parseModernChatUrlStyle(params({ response_style: '  balanced  ' }))).toEqual({
      response_style: DEFAULT_CHAT_RESPONSE_STYLE,
    });
  });

  it('기본 응답 스타일·관점은 허용 목록에 포함된다', () => {
    expect(CHAT_RESPONSE_STYLES).toContain(DEFAULT_CHAT_RESPONSE_STYLE);
    expect(CHAT_PERSPECTIVES).toContain(DEFAULT_CHAT_PERSPECTIVE);
  });

  it('한국어 라벨 맵이 모든 스타일·관점 키를 포함한다', () => {
    for (const s of CHAT_RESPONSE_STYLES) {
      expect(CHAT_RESPONSE_STYLE_SHORT_KO[s].length).toBeGreaterThan(0);
      expect(CHAT_RESPONSE_STYLE_LONG_KO[s].length).toBeGreaterThan(0);
    }
    for (const p of CHAT_PERSPECTIVES) {
      expect(CHAT_PERSPECTIVE_LABEL_KO[p].length).toBeGreaterThan(0);
    }
  });
});
