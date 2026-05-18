import {
  isComposerMultiStepMultiRequestEnabled,
  shouldBypassStreamForMultiStepMultiRequest,
  shouldRunComposerMultiStepMultiRequest,
} from '../composerMultiStepMultiRequest';

describe('composerMultiStepMultiRequest', () => {
  const prev = process.env.REACT_APP_COMPOSER_MULTI_STEP_MULTI_REQUEST;
  const prevSeq = process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST;

  afterEach(() => {
    if (prev === undefined) delete process.env.REACT_APP_COMPOSER_MULTI_STEP_MULTI_REQUEST;
    else process.env.REACT_APP_COMPOSER_MULTI_STEP_MULTI_REQUEST = prev;
    if (prevSeq === undefined) delete process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST;
    else process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST = prevSeq;
  });

  it('플래그·다중 요청·순차 미사용 시 multi-step 경로', () => {
    process.env.REACT_APP_COMPOSER_MULTI_STEP_MULTI_REQUEST = 'true';
    const items = ['1. a', '2. b'];
    expect(
      shouldRunComposerMultiStepMultiRequest(items, {
        multiRequestMode: true,
        runSequentialMultiRequest: false,
        useSequentialStream: false,
      }),
    ).toBe(true);
    expect(
      shouldBypassStreamForMultiStepMultiRequest(items, {
        multiRequestMode: true,
        runSequentialMultiRequest: false,
        useSequentialStream: false,
      }),
    ).toBe(true);
  });

  it('순차 API가 켜지면 multi-step은 비활성', () => {
    process.env.REACT_APP_COMPOSER_MULTI_STEP_MULTI_REQUEST = 'true';
    process.env.REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST = 'true';
    const items = ['1. a', '2. b'];
    expect(
      shouldRunComposerMultiStepMultiRequest(items, {
        multiRequestMode: true,
        runSequentialMultiRequest: true,
        useSequentialStream: false,
      }),
    ).toBe(false);
  });

  it('isComposerMultiStepMultiRequestEnabled', () => {
    process.env.REACT_APP_COMPOSER_MULTI_STEP_MULTI_REQUEST = 'true';
    expect(isComposerMultiStepMultiRequestEnabled()).toBe(true);
  });
});
