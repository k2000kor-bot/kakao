import { GRAPH_ANSWER_CONTEXT_FLAG } from './conversationGraphAnswerGeneration';
import {
  finalizeComposerContextForGraphChat,
  isConversationGraphComposerContext,
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
  });
});
