import { resolveComposerRegenerateUserTurn } from '../composerRegenerateTurn';

describe('composerRegenerateTurn', () => {
  it('resolveComposerRegenerateUserTurn은 role·type 어시스턴트를 인식한다', () => {
    expect(
      resolveComposerRegenerateUserTurn(
        [
          { id: 'u1', role: 'user', content: '질문' },
          { id: 'a1', role: 'assistant', content: '답' },
        ],
        'a1',
      ),
    ).toEqual({ userText: '질문', truncateToIndex: 0, assistantMessageIndex: 1 });

    expect(
      resolveComposerRegenerateUserTurn(
        [
          { id: 'u2', type: 'user', content: '파일 질문' },
          { id: 'a2', type: 'ai', content: '파일 답' },
        ],
        'a2',
      ),
    ).toEqual({ userText: '파일 질문', truncateToIndex: 0, assistantMessageIndex: 1 });
  });
});
