import { buildUnifiedQaGensparkPipelineContextMerge } from '../buildUnifiedQaGensparkPipelineContextMerge';
import {
  pickComposerHistoryMessages,
  shouldUseSimpleComposerOutboundMessageForTurn,
} from '../composerStreamResponseText';

const basePipelineOpts = {
  featureCtx: {},
  composerResponseMode: 'balanced',
  responseStyle: 'balanced',
};

describe('composerContextAfterClear — 대화 삭제·초기화 후 첨부 맥락', () => {
  const priorConversation =
    'user: 계약 해지 조건이 뭐야?\nassistant: 30일 전 서면 통지가 필요합니다.\n'.repeat(15);

  it('짧은 지시 + 대화 파일 첨부면 simple path·fast path를 쓰지 않는다', () => {
    expect(
      shouldUseSimpleComposerOutboundMessageForTurn({
        trimmedInput: '위 내용 기준으로 요약해줘',
        conversationFileContent: priorConversation,
      }),
    ).toBe(false);

    const { pipelineMerge } = buildUnifiedQaGensparkPipelineContextMerge({
      ...basePipelineOpts,
      trimmedInput: '위 내용 기준으로 요약해줘',
      conversationFileContent: priorConversation,
    });
    expect(pipelineMerge.qa_pipeline_fast_path).toBeUndefined();
    expect(pipelineMerge.use_pipeline_v2).toBe(true);
    expect(pipelineMerge.agentic_genspark_style).toBe(true);
  });

  it('컴포저 첨부 병합본(effectiveInput)만 있어도 simple path를 쓰지 않는다', () => {
    const trimmed = '핵심만 정리해줘';
    const effective = `[첨부 파일: chat.txt]\n${priorConversation}\n\n${trimmed}`;
    expect(
      shouldUseSimpleComposerOutboundMessageForTurn({
        trimmedInput: trimmed,
        effectiveInput: effective,
      }),
    ).toBe(false);
  });

  it('메시지 전체 삭제 직후에도 로컬 messages가 stale storage보다 길면 이력에 반영된다', () => {
    const local = [{ role: 'user', content: '위 내용 기준으로 요약해줘' }];
    const staleStored: typeof local = [];
    expect(pickComposerHistoryMessages(local, staleStored)).toEqual(local);
  });

  it('재생성·편집 경로도 스레드 첨부가 있으면 fast path를 쓰지 않는다', () => {
    const threadAttach = 'user: A\nassistant: B\n'.repeat(20);
    const { pipelineMerge } = buildUnifiedQaGensparkPipelineContextMerge({
      ...basePipelineOpts,
      trimmedInput: '위 내용 기준으로 다시 요약해줘',
      threadAttachedFileContents: threadAttach,
    });
    expect(pipelineMerge.qa_pipeline_fast_path).toBeUndefined();
    expect(pipelineMerge.use_pipeline_v2).toBe(true);
  });

  it('첨부 없는 짧은 후속 질문은 simple path를 유지한다', () => {
    expect(
      shouldUseSimpleComposerOutboundMessageForTurn({
        trimmedInput: '그다음 단계는?',
      }),
    ).toBe(true);
  });
});
