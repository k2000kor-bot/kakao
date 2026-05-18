import {
  buildSequentialMultiRequestItemMessage,
  getComposerSequentialMultiRequestItems,
  mergeSequentialMultiRequestAnswers,
  shouldBypassStreamingForSequentialMultiRequest,
  shouldRunComposerSequentialMultiRequest,
  shouldUseSequentialMultiRequestStream,
} from '../composerSequentialMultiRequest';

describe('composerSequentialMultiRequest', () => {
  const prevEnv = process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST;

  afterEach(() => {
    if (prevEnv === undefined) {
      delete process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST;
    } else {
      process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST = prevEnv;
    }
  });

  it('getComposerSequentialMultiRequestItems는 2개 이상 항목만 반환한다', () => {
    expect(getComposerSequentialMultiRequestItems('단일 질문')).toEqual([]);
    expect(getComposerSequentialMultiRequestItems('1. 첫 항목\n2. 둘째 항목').length).toBe(2);
  });

  it('buildSequentialMultiRequestItemMessage는 이전 답변 맥락을 포함한다', () => {
    const msg = buildSequentialMultiRequestItemMessage('둘째', 1, 2, [
      { item: '첫째', answer: '답1' },
    ]);
    expect(msg).toContain('2/2');
    expect(msg).toContain('둘째');
    expect(msg).toContain('답1');
  });

  it('mergeSequentialMultiRequestAnswers는 번호별 섹션으로 합친다', () => {
    const merged = mergeSequentialMultiRequestAnswers(['A', 'B'], ['가', '나']);
    expect(merged).toContain('## 1. A');
    expect(merged).toContain('## 2. B');
    expect(merged).toContain('가');
    expect(merged).toContain('나');
  });

  it('shouldRunComposerSequentialMultiRequest는 플래그·multi_request_mode·항목 수를 검사한다', () => {
    process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST = 'true';
    expect(
      shouldRunComposerSequentialMultiRequest(['a', 'b'], { multiRequestMode: true }),
    ).toBe(true);
    expect(
      shouldRunComposerSequentialMultiRequest(['a'], { multiRequestMode: true }),
    ).toBe(false);
    expect(
      shouldRunComposerSequentialMultiRequest(['a', 'b'], { multiRequestMode: false }),
    ).toBe(false);
    process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST = 'false';
    expect(
      shouldRunComposerSequentialMultiRequest(['a', 'b'], { multiRequestMode: true }),
    ).toBe(false);
  });

  it('shouldBypassStreamingForSequentialMultiRequest는 스트림 순차가 아니면 true', () => {
    process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST = 'true';
    delete process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST_STREAM;
    expect(
      shouldBypassStreamingForSequentialMultiRequest(['a', 'b'], { multiRequestMode: true }),
    ).toBe(true);
  });

  it('shouldUseSequentialMultiRequestStream는 두 env가 켜져 있을 때만 true', () => {
    process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST = 'true';
    process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST_STREAM = 'true';
    expect(
      shouldUseSequentialMultiRequestStream(['a', 'b'], {
        multiRequestMode: true,
        streamingSupported: true,
      }),
    ).toBe(true);
    expect(
      shouldBypassStreamingForSequentialMultiRequest(['a', 'b'], { multiRequestMode: true }),
    ).toBe(false);
    delete process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST_STREAM;
  });
});
