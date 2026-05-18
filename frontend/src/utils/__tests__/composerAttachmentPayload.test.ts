import {
  extractNaivePdfTextFromArrayBuffer,
  readComposerAttachmentsForSend,
} from '../composerAttachmentPayload';

describe('readComposerAttachmentsForSend', () => {
  it('텍스트·이미지 첨부를 분리하고 본문 블록을 만든다', async () => {
    const txt = new File(['본문 내용'], 'note.txt', { type: 'text/plain' });
    const img = new File(['fake'], 'pic.png', { type: 'image/png' });

    const result = await readComposerAttachmentsForSend([txt, img]);

    expect(result.contextBlocks).toHaveLength(1);
    expect(result.contextBlocks[0]).toContain('note.txt');
    expect(result.contextBlocks[0]).toContain('본문 내용');
    expect(result.imageFiles).toHaveLength(1);
    expect(result.imageFiles[0].name).toBe('pic.png');
    expect(result.unsupportedNames).toEqual([]);
  });

  it('csv는 conversation_file 후보로 넘긴다', async () => {
    const csv = new File(['a,b\n1,2'], 'data.csv', { type: 'text/csv' });
    const result = await readComposerAttachmentsForSend([csv]);
    expect(result.conversationFileContent).toContain('a,b');
    expect(result.conversationFileName).toBe('data.csv');
  });

  it('extractNaivePdfTextFromArrayBuffer는 Tj 문자열을 추출한다', () => {
    const buf = new TextEncoder().encode('stream (Hello PDF body text for test) Tj end').buffer;
    expect(extractNaivePdfTextFromArrayBuffer(buf)).toContain('Hello PDF');
  });

  it('PDF에서 추출 가능한 텍스트가 있으면 contextBlocks에 넣는다', async () => {
    const longClause =
      'Sample contract clause for unit test with enough characters to pass the minimum length gate.';
    const bytes = new TextEncoder().encode(`(${longClause}) Tj`);
    expect(extractNaivePdfTextFromArrayBuffer(bytes.buffer).trim().length).toBeGreaterThan(40);
    const pdf = new File([bytes], 'doc.pdf', { type: 'application/pdf' });
    Object.defineProperty(pdf, 'arrayBuffer', {
      configurable: true,
      value: async () => bytes.buffer,
    });
    const result = await readComposerAttachmentsForSend([pdf]);
    expect(result.contextBlocks.some((b) => b.includes('Sample contract'))).toBe(true);
    expect(result.unsupportedNames).not.toContain('doc.pdf');
  });

  it('PDF에서 텍스트를 추출하지 못하면 unsupported에 넣는다', async () => {
    const pdf = new File([new Uint8Array([0, 1, 2, 3])], 'empty.pdf', { type: 'application/pdf' });
    const result = await readComposerAttachmentsForSend([pdf]);
    expect(result.contextBlocks).toHaveLength(0);
    expect(result.unsupportedNames).toEqual(['empty.pdf']);
  });
});
