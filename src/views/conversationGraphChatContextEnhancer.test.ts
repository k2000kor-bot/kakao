import { GRAPH_ANSWER_CONTEXT_FLAG } from './conversationGraphAnswerGeneration';
import { mergeConversationGraphCreateIntentIntoChatContext } from './conversationGraphChatContextEnhancer';

describe('conversationGraphChatContextEnhancer', () => {
  it('관계도 생성 요청이 아니면 context를 그대로 둔다', () => {
    const base = { foo: 1 };
    expect(mergeConversationGraphCreateIntentIntoChatContext('요약해줘', base)).toEqual(base);
  });

  it('첨부 대화가 있으면 create intent와 raw_conversation을 병합한다', () => {
    const merged = mergeConversationGraphCreateIntentIntoChatContext('관계도 만들어줘', {}, {
      conversationFileContent: 'Date,User,Message\n2026-05-01,A,hi',
    });
    expect(merged[GRAPH_ANSWER_CONTEXT_FLAG]).toBe(true);
    expect(merged.multi_request_mode).toBe(false);
    expect(merged.input_intent_hint).toBe('conversation_graph_create');
    expect(String(merged.conversation_graph_raw_conversation)).toContain('Date,User');
    expect(String(merged.answer_quality_instruction)).toContain('Mermaid');
  });

  it('맥락 없이 관계도만 요청하면 graph 파이프라인·안내 힌트를 넣는다', () => {
    const merged = mergeConversationGraphCreateIntentIntoChatContext('관계도 생성해줘', {});
    expect(merged[GRAPH_ANSWER_CONTEXT_FLAG]).toBe(true);
    expect(merged.multi_request_mode).toBe(false);
    expect(merged.conversation_graph_create_hint).toEqual(expect.any(String));
    expect(merged.input_intent_hint).toBe('conversation_graph_create');
    expect(String(merged.answer_quality_instruction)).toContain('관계도');
  });

  it('base.conversation_file_content만 있어도 raw_conversation을 병합한다', () => {
    const merged = mergeConversationGraphCreateIntentIntoChatContext(
      '관계도 만들어줘',
      { conversation_file_content: 'Date,User,Message\n2026-05-01,B,ok' },
    );
    expect(merged[GRAPH_ANSWER_CONTEXT_FLAG]).toBe(true);
    expect(String(merged.conversation_graph_raw_conversation)).toContain('2026-05-01');
  });

  it('관계도 handoff context가 있으면 create intent와 Mermaid 지시를 병합한다', () => {
    const merged = mergeConversationGraphCreateIntentIntoChatContext(
      '관계도를 만들어줘',
      { conversation_graph_title: '단체 채팅' },
      { hasGraphHandoffContext: true },
    );
    expect(merged[GRAPH_ANSWER_CONTEXT_FLAG]).toBe(true);
    expect(merged.conversation_graph_has_data).toBe(true);
    expect(merged.conversation_graph_create_from_chat).toBe(true);
    expect(String(merged.answer_quality_instruction)).toContain('Mermaid');
    expect(merged.conversation_graph_create_hint).toBeUndefined();
  });
});
