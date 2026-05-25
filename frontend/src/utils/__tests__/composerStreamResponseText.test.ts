import {
  finalizePipelineExtrasForAnswer,
  mergeAssistantPipelineExtrasForTurn,
  mergeStreamCompletionText,
  pickComposerHistoryMessages,
  resolveAssistantAnswerDisplayText,
  shouldUseComposerStreamPreReveal,
  shouldUseSimpleComposerOutboundMessage,
  shouldUseSimpleComposerOutboundMessageForTurn,
} from '../composerStreamResponseText';
import { ASSISTANT_PLACEHOLDER_DRAFT } from '../chatInputUtils';

describe('composerStreamResponseText', () => {
  it('mergeStreamCompletionText는 더 긴 본문을 선택한다', () => {
    expect(mergeStreamCompletionText('짧음', '긴 답변 본문입니다')).toBe('긴 답변 본문입니다');
    expect(mergeStreamCompletionText('완료 본문', '')).toBe('완료 본문');
  });

  it('resolveAssistantAnswerDisplayText는 플레이스홀더를 제외한다', () => {
    expect(resolveAssistantAnswerDisplayText(ASSISTANT_PLACEHOLDER_DRAFT)).toBe('');
    expect(resolveAssistantAnswerDisplayText('실제 답변입니다.')).toBe('실제 답변입니다.');
  });

  it('shouldUseSimpleComposerOutboundMessage는 짧은 일반 질문만 true', () => {
    expect(shouldUseSimpleComposerOutboundMessage('오늘 날씨 어때?')).toBe(true);
    expect(shouldUseSimpleComposerOutboundMessage('질문: A\n요구사항: B')).toBe(false);
    expect(shouldUseSimpleComposerOutboundMessage('x'.repeat(700))).toBe(false);
  });

  it('shouldUseSimpleComposerOutboundMessageForTurn은 첨부·병합 본문이 있으면 false', () => {
    expect(
      shouldUseSimpleComposerOutboundMessageForTurn({
        trimmedInput: '위 내용 기준으로 요약해줘',
        conversationFileContent: 'user: hello\nassistant: hi\n'.repeat(20),
      }),
    ).toBe(false);
    expect(
      shouldUseSimpleComposerOutboundMessageForTurn({
        trimmedInput: '요약해줘',
        effectiveInput: `[첨부 파일: chat.txt]\n${'대화 본문 '.repeat(30)}\n\n요약해줘`,
      }),
    ).toBe(false);
    expect(
      shouldUseSimpleComposerOutboundMessageForTurn({
        trimmedInput: '오늘 날씨 어때?',
      }),
    ).toBe(true);
  });

  it('pickComposerHistoryMessages는 더 긴 메시지 목록을 선택한다', () => {
    const local = [{ id: 1 }, { id: 2 }];
    const stored = [{ id: 1 }];
    expect(pickComposerHistoryMessages(local, stored)).toEqual(local);
    expect(pickComposerHistoryMessages(stored, local)).toEqual(local);
  });

  it('finalizePipelineExtrasForAnswer는 generation phase를 제거한다', () => {
    expect(
      finalizePipelineExtrasForAnswer({
        pipelineGenerationPhase: 'verify',
        answerBlueprintMarkdown: '# 개요',
      }),
    ).toEqual({ answerBlueprintMarkdown: '# 개요' });
    expect(
      finalizePipelineExtrasForAnswer({ pipelineGenerationPhase: 'draft' }),
    ).toBeUndefined();
  });

  it('mergeAssistantPipelineExtrasForTurn은 자가 개발·Council·API 메타를 병합한다', () => {
    const merged = mergeAssistantPipelineExtrasForTurn({
      responseMeta: { generation_phase: 'verify', answer_blueprint: '# 개요' },
      requestContext: {
        composer_oversight_enabled: true,
        composer_oversight_council_v2: true,
        composer_oversight_work_items: [{ index: 1 }],
      },
      selfDevelopExtras: {
        composerSelfDevelopImproved: true,
        composerSelfDevelopAttempts: 1,
      },
    });
    expect(merged?.answerBlueprintMarkdown).toBe('# 개요');
    expect(merged?.pipelineGenerationPhase).toBeUndefined();
    expect(merged?.composerOversightCouncilV2).toBe(true);
    expect(merged?.composerSelfDevelopImproved).toBe(true);
  });

  it('shouldUseComposerStreamPreReveal는 짧은 일반 질문에서 false', () => {
    expect(
      shouldUseComposerStreamPreReveal({
        trimmedInput: '안녕',
        structuredInputAssistEnabled: true,
      }),
    ).toBe(false);
    expect(
      shouldUseComposerStreamPreReveal({
        trimmedInput: '1) A\n2) B',
        structuredInputAssistEnabled: true,
        multiRequestMode: true,
      }),
    ).toBe(true);
  });
});
