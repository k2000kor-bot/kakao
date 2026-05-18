import { downloadGraphFullReportMarkdown } from './conversationGraphFullReportExport';

describe('conversationGraphFullReportExport', () => {
  it('downloadGraphFullReportMarkdown는 내용이 없으면 저장하지 않는다', () => {
    const append = jest.spyOn(document.body, 'appendChild');
    downloadGraphFullReportMarkdown({ narrative: '  ' });
    expect(append).not.toHaveBeenCalled();
    append.mockRestore();
  });

  it('downloadGraphFullReportMarkdown는 narrative가 있으면 저장한다', () => {
    if (typeof URL.createObjectURL !== 'function') {
      Object.assign(URL, {
        createObjectURL: () => 'blob:mock',
        revokeObjectURL: () => {},
      });
    }
    const append = jest.spyOn(document.body, 'appendChild');
    downloadGraphFullReportMarkdown({
      title: '테스트',
      narrative: '해석 본문',
      generatedAnswer: '답변',
    });
    expect(append).toHaveBeenCalled();
    append.mockRestore();
  });
});
