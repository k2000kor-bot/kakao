import {
  createComposerSequentialItemOutboundBuilder,
  getComposerSequentialSendFlags,
} from '../composerSequentialSend';

describe('composerSequentialSend', () => {
  const prevSeq = process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST;
  const prevStream = process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST_STREAM;

  afterEach(() => {
    if (prevSeq === undefined) delete process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST;
    else process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST = prevSeq;
    if (prevStream === undefined) delete process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST_STREAM;
    else process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST_STREAM = prevStream;
  });

  it('getComposerSequentialSendFlags는 다중 요청·순차 플래그를 계산한다', () => {
    process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST = 'true';
    const flags = getComposerSequentialSendFlags(
      '1. 첫 항목\n2. 둘째 항목',
      { multi_request_mode: true },
      true,
    );
    expect(flags.items.length).toBe(2);
    expect(flags.runSequentialMultiRequest).toBe(true);
    expect(flags.bypassStreamForSequentialMultiRequest).toBe(true);
    expect(flags.useSequentialStream).toBe(false);
  });

  it('MULTI_STEP 플래그 시 runMultiStepMultiRequest·스트림 우회(순차 API 없을 때)', () => {
    process.env.REACT_APP_COMPOSER_MULTI_STEP_MULTI_REQUEST = 'true';
    delete process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST;
    const flags = getComposerSequentialSendFlags(
      '1. 첫 항목\n2. 둘째 항목',
      { multi_request_mode: true },
      true,
    );
    expect(flags.runMultiStepMultiRequest).toBe(true);
    expect(flags.bypassStreamForMultiStepMultiRequest).toBe(true);
    expect(flags.runSequentialMultiRequest).toBe(false);
  });

  it('STREAM 플래그 시 useSequentialStream·bypass 해제', () => {
    process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST = 'true';
    process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST_STREAM = 'true';
    const flags = getComposerSequentialSendFlags(
      '1. 첫 항목\n2. 둘째 항목',
      { multi_request_mode: true },
      true,
    );
    expect(flags.useSequentialStream).toBe(true);
    expect(flags.bypassStreamForSequentialMultiRequest).toBe(false);
    expect(flags.runSequentialMultiRequest).toBe(true);
  });

  it('createComposerSequentialItemOutboundBuilder는 항목별 outbound를 만든다', async () => {
    const build = createComposerSequentialItemOutboundBuilder({
      items: ['a', 'b'],
      buildStructuredGenerationPrompt: (input) => `prompt:${input}`,
      variationInstruction: 'v',
      styleLearningInstruction: 's',
      buildMessageToSendForChat: async (req) => req,
    });
    const out = await build(0, []);
    expect(out).toContain('prompt:');
    expect(out).toContain('[다중 요청 1/2]');
  });
});
