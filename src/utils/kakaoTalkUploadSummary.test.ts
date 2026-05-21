import { kakaoDateTimeToDateInput } from './kakaoTalkUploadSummary';

describe('kakaoTalkUploadSummary', () => {
  it('kakaoDateTimeToDateInput는 Date 컬럼에서 YYYY-MM-DD만 추출한다', () => {
    expect(kakaoDateTimeToDateInput('2026-04-20 09:21:47')).toBe('2026-04-20');
    expect(kakaoDateTimeToDateInput(null)).toBe('');
  });
});
