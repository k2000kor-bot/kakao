import {
  downloadMermaidSource,
  extractMermaidBlocksFromAnswer,
} from './conversationGraphMermaidExtract';

describe('conversationGraphMermaidExtract', () => {
  it('extractMermaidBlocksFromAnswer는 mermaid 펜스를 분리한다', () => {
    const text = [
      '요약입니다.',
      '```mermaid',
      'flowchart TB',
      '  A-->B',
      '```',
      '끝.',
    ].join('\n');
    const { body, diagrams } = extractMermaidBlocksFromAnswer(text);
    expect(diagrams).toHaveLength(1);
    expect(diagrams[0]).toContain('flowchart TB');
    expect(body).toContain('요약');
    expect(body).not.toContain('```mermaid');
  });

  it('downloadMermaidSource는 앵커를 생성해 클릭한다', () => {
    const click = jest.fn();
    const anchor = { click, download: '', href: '' } as unknown as HTMLAnchorElement;
    const createSpy = jest.spyOn(document, 'createElement').mockReturnValue(anchor);
    const origCreateObjectURL = URL.createObjectURL;
    const origRevoke = URL.revokeObjectURL;
    URL.createObjectURL = jest.fn(() => 'blob:test');
    URL.revokeObjectURL = jest.fn();

    downloadMermaidSource('flowchart TB\n  A-->B', 'test.mmd');

    expect(click).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
    createSpy.mockRestore();
    URL.createObjectURL = origCreateObjectURL;
    URL.revokeObjectURL = origRevoke;
  });
});
