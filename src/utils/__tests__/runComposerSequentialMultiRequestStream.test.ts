import {
  buildSequentialMultiRequestItemContext,
  runComposerSequentialMultiRequestStream,
} from '../runComposerSequentialMultiRequestStream';

describe('runComposerSequentialMultiRequestStream', () => {
  it('항목별 streamMessage를 호출하고 병합 본문을 반환한다', async () => {
    const streamMessage = jest
      .fn()
      .mockImplementationOnce(async (_msg, _id, opts) => {
        opts.onChunk?.('A');
        return '답 A';
      })
      .mockImplementationOnce(async (_msg, _id, opts) => {
        opts.onChunk?.('B');
        return '답 B';
      });

    const displays: string[] = [];
    const result = await runComposerSequentialMultiRequestStream({
      items: ['첫 항목', '둘째 항목'],
      conversationId: 'conv-1',
      buildItemOutboundMessage: async (i) => `out-${i}`,
      buildItemStreamContext: (i) => buildSequentialMultiRequestItemContext({}, ['첫 항목', '둘째 항목'], i),
      buildStreamRequestBody: (ctx) => ({ context: ctx }),
      streamMessage,
      onLiveIndex: jest.fn(),
      onDisplayContent: (c) => displays.push(c),
    });

    expect(streamMessage).toHaveBeenCalledTimes(2);
    expect(result.merged).toContain('## 1. 첫 항목');
    expect(result.merged).toContain('## 2. 둘째 항목');
    expect(result.merged).toContain('답 A');
    expect(result.merged).toContain('답 B');
    expect(displays.length).toBeGreaterThan(0);
  });

  it('onStreamComplete에 병합 본문을 전달한다', async () => {
    const onStreamComplete = jest.fn();
    await runComposerSequentialMultiRequestStream({
      items: ['a', 'b'],
      conversationId: 'c',
      buildItemOutboundMessage: async () => 'x',
      buildItemStreamContext: () => ({}),
      buildStreamRequestBody: () => ({}),
      streamMessage: async () => 'ok',
      onLiveIndex: jest.fn(),
      onDisplayContent: jest.fn(),
      onStreamComplete,
    });
    expect(onStreamComplete).toHaveBeenCalledWith(expect.stringContaining('## 1. a'), undefined);
  });
});
