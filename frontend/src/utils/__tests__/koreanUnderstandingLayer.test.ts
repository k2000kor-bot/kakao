import {
  buildGenreControlProfile,
  buildKoreanUnderstandingProfile,
  containsHangul,
  extractPriorTurnsForKoContext,
  normalizeKoreanSurfaceText,
} from '../koreanUnderstandingLayer';

describe('koreanUnderstandingLayer', () => {
  it('containsHangul', () => {
    expect(containsHangul('hello')).toBe(false);
    expect(containsHangul('안녕')).toBe(true);
  });

  it('normalizeKoreanSurfaceText 줄바꿈·반복 정리', () => {
    expect(normalizeKoreanSurfaceText('a\n\n\nb')).toBe('a\n\nb');
    expect(normalizeKoreanSurfaceText('ㅋㅋㅋㅋㅋㅋ')).toContain('ㅋㅋ');
  });

  it('extractPriorTurnsForKoContext는 마지막 user를 제외하고 이전 턴을 본다', () => {
    const r = extractPriorTurnsForKoContext([
      { role: 'user', content: 'u1' },
      { role: 'assistant', content: 'a1' },
      { role: 'user', content: 'u2' },
    ]);
    expect(r.lastUserMessage).toBe('u1');
    expect(r.lastAssistantMessage).toBe('a1');
  });

  it('buildKoreanUnderstandingProfile 카톡·반박 휴리스틱', () => {
    const p = buildKoreanUnderstandingProfile('위 내용 반박해줘 카톡용으로', {
      lastAssistantMessage: '요약입니다.',
    });
    expect(p.genre).toBe('kakao_message');
    expect(p.speech_act).toBe('rebuttal_request');
    expect(p.ellipsis_resolution_notes.length).toBeGreaterThan(0);
    const g = buildGenreControlProfile(p);
    expect(g.line_break_style).toBe('chat');
  });
});
