import {
  buildComposerPipelineContextAppend,
  buildComposerPipelineMerge,
  createPostChatRefinedAnswerFn,
  isComposerSelfDevelopActiveForTurn,
} from '../composerAssistantTurnFinalize';
import { withProcessEnv } from '../../test-utils/testHelpers';

describe('composerAssistantTurnFinalize', () => {
  it('buildComposerPipelineContextAppend는 Council·자가 개발 플래그를 반환한다', () => {
    withProcessEnv({ REACT_APP_COMPOSER_ANSWER_SELF_DEVELOP: '1' }, () => {
      const { pipelineMerge, selfDevelopFlags } = buildComposerPipelineContextAppend({
        trimmedInput: '질문:\n리스크는?\n요구사항:\n표로 정리',
        featureCtx: { prefer_informed_answer: true },
        composerResponseMode: 'balanced',
        responseStyle: 'balanced',
      });
      expect(pipelineMerge.composer_oversight_enabled).toBe(true);
      expect(selfDevelopFlags.composer_self_develop_enabled).toBe(true);
    });
  });

  it('isComposerSelfDevelopActiveForTurn은 단순 질문에서 false', () => {
    expect(
      isComposerSelfDevelopActiveForTurn({
        trimmedInput: '안녕',
        featureCtx: { composer_simple_query: true },
        pipelineMerge: {},
      }),
    ).toBe(false);
  });

  it('buildComposerPipelineMerge는 selfDevelopFlags 없이 pipelineMerge만 반환한다', () => {
    const { pipelineMerge, selfDevelopFlags } = buildComposerPipelineContextAppend({
      trimmedInput: '질문:\n테스트\n요구사항:\n요약',
      featureCtx: {},
      composerResponseMode: 'balanced',
      responseStyle: 'balanced',
    });
    const mergeOnly = buildComposerPipelineMerge({
      trimmedInput: '질문:\n테스트\n요구사항:\n요약',
      featureCtx: {},
      composerResponseMode: 'balanced',
      responseStyle: 'balanced',
    });
    expect(mergeOnly.pipelineMerge.composer_oversight_enabled).toBe(true);
    expect('selfDevelopFlags' in mergeOnly).toBe(false);
    expect(pipelineMerge.composer_oversight_enabled).toBe(true);
    expect(selfDevelopFlags.composer_self_develop_enabled).toBe(true);
  });

  it('createPostChatRefinedAnswerFn은 postChat 결과 본문을 반환한다', async () => {
    const refine = createPostChatRefinedAnswerFn({
      postChat: async () => ({ data: { response: '개선된 답변' } }),
      buildPayload: (msg, ctx) => ({ message: msg, context: ctx }),
    });
    await expect(refine('재생성 프롬프트', { foo: 1 })).resolves.toBe('개선된 답변');
  });
});
