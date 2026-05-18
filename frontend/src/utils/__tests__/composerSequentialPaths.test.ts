/**
 * ChatGPTInterface 전송·재생성·편집이 동일한 순차 플래그·루프 유틸을 쓰는지 회귀용(컴포넌트 마운트 없음).
 */
import {
  getComposerSequentialSendFlags,
  createComposerSequentialItemOutboundBuilder,
} from '../composerSequentialSend';
import { runComposerSequentialMultiRequestNonStream } from '../runComposerSequentialMultiRequestNonStream';
import { runComposerSequentialMultiRequestStream } from '../runComposerSequentialMultiRequestStream';

const MULTI_INPUT = '1. 첫 항목\n2. 둘째 항목';
const FEATURE_CTX = { multi_request_mode: true } as Record<string, unknown>;

describe('composerSequentialPaths (send · regen · edit)', () => {
  const prevSeq = process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST;
  const prevStream = process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST_STREAM;

  afterEach(() => {
    if (prevSeq === undefined) delete process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST;
    else process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST = prevSeq;
    if (prevStream === undefined) delete process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST_STREAM;
    else process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST_STREAM = prevStream;
  });

  it('비스트리밍 순차 — 전송·재생성·편집 동일 flags로 항목 수만큼 postChat', async () => {
    process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST = 'true';
    delete process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST_STREAM;

    const flags = getComposerSequentialSendFlags(MULTI_INPUT, FEATURE_CTX, true);
    expect(flags.runSequentialMultiRequest).toBe(true);
    expect(flags.bypassStreamForSequentialMultiRequest).toBe(true);
    expect(flags.useSequentialStream).toBe(false);

    const buildOutbound = createComposerSequentialItemOutboundBuilder({
      items: flags.items,
      buildStructuredGenerationPrompt: (input) => input,
      variationInstruction: '',
      styleLearningInstruction: '',
      buildMessageToSendForChat: async (req) => req,
    });

    let postCalls = 0;
    await runComposerSequentialMultiRequestNonStream({
      items: flags.items,
      buildItemOutboundMessage: buildOutbound,
      buildItemContext: (i) => ({ path: 'regen-or-edit', index: i }),
      postChat: async () => {
        postCalls += 1;
        return {};
      },
      extractValidContent: () => 'stub',
      onLiveIndex: jest.fn(),
    });

    expect(postCalls).toBe(flags.items.length);
  });

  it('다단계 — 순차 API 없을 때 runMultiStepMultiRequest', () => {
    process.env.REACT_APP_COMPOSER_MULTI_STEP_MULTI_REQUEST = 'true';
    delete process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST;

    const flags = getComposerSequentialSendFlags(MULTI_INPUT, FEATURE_CTX, true);
    expect(flags.runMultiStepMultiRequest).toBe(true);
    expect(flags.runSequentialMultiRequest).toBe(false);
  });

  it('SSE 순차 — 전송·재생성·편집 동일 flags로 항목 수만큼 streamMessage', async () => {
    process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST = 'true';
    process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST_STREAM = 'true';

    const flags = getComposerSequentialSendFlags(MULTI_INPUT, FEATURE_CTX, true);
    expect(flags.useSequentialStream).toBe(true);
    expect(flags.bypassStreamForSequentialMultiRequest).toBe(false);

    const streamMessage = jest.fn().mockResolvedValue('chunk-ok');
    await runComposerSequentialMultiRequestStream({
      items: flags.items,
      conversationId: 'conv-regen-edit',
      buildItemOutboundMessage: async (i) => `out-${i}`,
      buildItemStreamContext: () => ({}),
      buildStreamRequestBody: () => ({}),
      streamMessage,
      onLiveIndex: jest.fn(),
      onDisplayContent: jest.fn(),
    });

    expect(streamMessage).toHaveBeenCalledTimes(flags.items.length);
  });
});
