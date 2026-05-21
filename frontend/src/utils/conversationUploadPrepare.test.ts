import { prepareConversationUpload, preparePastedConversationText } from './conversationUploadPrepare';

describe('conversationUploadPrepare', () => {
  it('일반 CSV는 원본 파일을 그대로 사용한다', () => {
    const file = new File(['date,user,msg\n2026-05-11,a,hi'], 'chat.csv', { type: 'text/csv' });
    const prepared = prepareConversationUpload('date,user,msg\n2026-05-11,a,hi', file);
    expect(prepared.source).toBe('plain');
    expect(prepared.file).toBe(file);
  });

  it('카카오톡 CSV는 TXT로 정규화한다', () => {
    const csv = `Date,User,Message
2026-05-11 10:00:00,"알파","안녕"
2026-05-11 10:01:00,"베타","반가워"`;
    const file = new File([csv], 'kakao.csv', { type: 'text/csv' });
    const prepared = prepareConversationUpload(csv, file);
    expect(prepared.source).toBe('kakao_csv');
    expect(prepared.file.name).toMatch(/\.txt$/);
    expect(prepared.summary?.messageCount).toBe(2);
  });

  it('samplePreset recent_10000은 최근 1만 건만 업로드한다', () => {
    const rows = Array.from({ length: 12_000 }, (_, i) => {
      const h = String(i % 24).padStart(2, '0');
      const m = String(i % 60).padStart(2, '0');
      return `2026-05-11 ${h}:${m}:00,"유저","msg${i}"`;
    });
    const csv = `Date,User,Message\n${rows.join('\n')}`;
    const file = new File([csv], 'big.csv', { type: 'text/csv' });
    const prepared = prepareConversationUpload(csv, file, { samplePreset: 'recent_10000' });
    expect(prepared.source).toBe('kakao_csv');
    expect(prepared.summary?.messageCount).toBe(10_000);
    expect(prepared.warnings.some((w) => w.includes('샘플링'))).toBe(true);
  });

  it('preparePastedConversationText는 카카오톡 CSV 붙여넣기를 TXT로 변환한다', () => {
    const pasted = preparePastedConversationText(`Date,User,Message
2026-05-11 10:00:00,"알파","hi"`);
    expect(pasted?.uploadText).toContain('2026-05-11 10:00:00, 알파 : hi');
    expect(pasted?.filename).toBe('pasted-kakao.txt');
  });
});
