import { GRAPH_ANSWER_CONTEXT_FLAG } from './conversationGraphAnswerGeneration';
import {
  finalizeComposerContextForGraphChat,
  isConversationGraphComposerContext,
  mergePersistedGraphComposerContext,
  resolveGraphComposerSendOptions,
} from './conversationGraphComposerSend';

describe('conversationGraphComposerSend', () => {
  it('isConversationGraphComposerContext는 플래그로 판별한다', () => {
    expect(isConversationGraphComposerContext({ [GRAPH_ANSWER_CONTEXT_FLAG]: true })).toBe(true);
    expect(isConversationGraphComposerContext({})).toBe(false);
  });

  it('finalizeComposerContextForGraphChat는 다양성·multi_request 잔여를 제거한다', () => {
    const out = finalizeComposerContextForGraphChat({
      [GRAPH_ANSWER_CONTEXT_FLAG]: true,
      answer_quality_instruction: 'Mermaid 포함',
      force_variety: true,
      multi_request_mode: true,
      multi_request_items: ['a'],
    });
    expect(out.force_variety).toBeUndefined();
    expect(out.multi_request_mode).toBe(false);
    expect(out.multi_request_items).toBeUndefined();
    expect(out.answer_quality_instruction).toContain('Mermaid');
    expect(out.answer_mode).toBe('expert');
    expect(out.conversation_graph_min_answer_chars).toBe(600);
  });

  it('resolveGraphComposerSendOptions는 관계도일 때 ultimate·comprehensive를 쓴다', () => {
    expect(
      resolveGraphComposerSendOptions({
        isGraph: true,
        quality: 'enhanced',
        responseStyle: 'balanced',
      }),
    ).toEqual({ quality: 'ultimate', responseStyle: 'comprehensive' });
  });

  it('finalizeComposerContextForGraphChat는 handoff context를 재생성·편집 병합용으로 유지한다', () => {
    const out = finalizeComposerContextForGraphChat({
      [GRAPH_ANSWER_CONTEXT_FLAG]: true,
      conversation_graph_has_data: true,
      conversation_graph_title: '단체 채팅',
      multi_request_mode: true,
      multi_request_items: ['a', 'b'],
    });
    expect(out[GRAPH_ANSWER_CONTEXT_FLAG]).toBe(true);
    expect(out.conversation_graph_has_data).toBe(true);
    expect(out.multi_request_mode).toBe(false);
    expect(out.multi_request_items).toBeUndefined();
  });

  it('mergePersistedGraphComposerContext는 관계도 context를 ref에 누적한다', () => {
    const ref = { current: null as Record<string, unknown> | null };
    mergePersistedGraphComposerContext(ref, {
      [GRAPH_ANSWER_CONTEXT_FLAG]: true,
      conversation_file_content: 'Date,User,Message\na,b,c',
      multi_request_mode: true,
    });
    expect(ref.current?.[GRAPH_ANSWER_CONTEXT_FLAG]).toBe(true);
    expect(String(ref.current?.conversation_file_content)).toContain('a,b,c');
    expect(ref.current?.multi_request_mode).toBe(false);

    mergePersistedGraphComposerContext(ref, {
      [GRAPH_ANSWER_CONTEXT_FLAG]: true,
      conversation_graph_title: '갱신',
    });
    expect(ref.current?.conversation_graph_title).toBe('갱신');
    expect(String(ref.current?.conversation_file_content)).toContain('a,b,c');
  });
});
