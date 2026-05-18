import { copyGraphAnswerToClipboard, downloadGraphAnswerText } from './conversationGraphAnswerExport';

describe('conversationGraphAnswerExport', () => {
  it('copyGraphAnswerToClipboard는 빈 문자열이면 false', async () => {
    await expect(copyGraphAnswerToClipboard('   ')).resolves.toBe(false);
  });

  it('downloadGraphAnswerText는 빈 문자열이면 anchor를 만들지 않는다', () => {
    const append = jest.spyOn(document.body, 'appendChild');
    downloadGraphAnswerText('  ');
    expect(append).not.toHaveBeenCalled();
    append.mockRestore();
  });

  it('downloadGraphAnswerText는 텍스트가 있으면 예외 없이 실행된다', () => {
    if (typeof URL.createObjectURL !== 'function') {
      Object.assign(URL, {
        createObjectURL: () => 'blob:mock',
        revokeObjectURL: () => {},
      });
    }
    expect(() => downloadGraphAnswerText('본문', 'out.txt')).not.toThrow();
  });
});
