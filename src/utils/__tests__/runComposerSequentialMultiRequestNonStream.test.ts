import { runComposerSequentialMultiRequestNonStream } from '../runComposerSequentialMultiRequestNonStream';

describe('runComposerSequentialMultiRequestNonStream', () => {
  it('항목별 postChat을 호출하고 병합한다', async () => {
    let call = 0;
    const partials: string[] = [];
    const result = await runComposerSequentialMultiRequestNonStream({
      items: ['첫', '둘'],
      buildItemOutboundMessage: async (i) => `msg-${i}`,
      buildItemContext: (i) => ({ idx: i }),
      postChat: async (msg, ctx) => {
        call += 1;
        return { msg, ctx };
      },
      extractValidContent: (r) => `답-${(r as { msg: string }).msg}`,
      onLiveIndex: jest.fn(),
      onPartialProgress: (p) => partials.push(p),
    });

    expect(call).toBe(2);
    expect(result.merged).toContain('## 1. 첫');
    expect(result.merged).toContain('## 2. 둘');
    expect(result.answers).toEqual(['답-msg-0', '답-msg-1']);
    expect(partials).toHaveLength(1);
    expect(partials[0]).toMatch(/처리 중/);
  });
});
