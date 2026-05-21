import {
  isKakaoTalkCsvHeader,
  looksLikeKakaoTalkCsv,
  parseCsvRows,
  parseKakaoTalkCsv,
} from './kakaoTalkCsvParser';

describe('kakaoTalkCsvParser', () => {
  it('isKakaoTalkCsvHeader는 Date,User,Message를 인식한다', () => {
    expect(isKakaoTalkCsvHeader(['Date', 'User', 'Message'])).toBe(true);
    expect(isKakaoTalkCsvHeader(['date', 'user', 'message'])).toBe(true);
    expect(isKakaoTalkCsvHeader(['date', 'user', 'msg'])).toBe(false);
  });

  it('parseCsvRows는 따옴표 안 줄바꿈을 한 필드로 파싱한다', () => {
    const rows = parseCsvRows(
      'Date,User,Message\n2026-05-11 10:00:00,"알파","첫줄\n둘째줄"',
    );
    expect(rows).toHaveLength(2);
    expect(rows[1][2]).toBe('첫줄\n둘째줄');
  });

  it('parseCsvRows는 이스케이프된 따옴표를 처리한다', () => {
    const rows = parseCsvRows('a,b\n"x""y",z');
    expect(rows[1][0]).toBe('x"y');
  });

  it('parseKakaoTalkCsv는 카카오톡 CSV를 메시지 배열로 변환한다', () => {
    const messages = parseKakaoTalkCsv(`Date,User,Message
2026-05-11 10:00:00,"알파","안녕"
2026-05-11 10:01:00,"베타","사진"`);
    expect(messages).toHaveLength(2);
    expect(messages[0]).toEqual({
      date: '2026-05-11 10:00:00',
      user: '알파',
      message: '안녕',
    });
  });

  it('looksLikeKakaoTalkCsv는 BOM이 있는 헤더도 인식한다', () => {
    expect(looksLikeKakaoTalkCsv('\uFEFFDate,User,Message\n2026-05-11,a,b')).toBe(true);
  });
});
