import {
  buildConversationGraphPasteNavState,
  CONVERSATION_GRAPH_AUTO_CREATE_STATE_KEY,
  CONVERSATION_GRAPH_HANDOFF_STORAGE_KEY,
  CONVERSATION_GRAPH_PASTE_STATE_KEY,
  consumeHandoffPasteFromSession,
  peekHandoffPasteFromSession,
  readConversationGraphHandoffFromLocationState,
  stashHandoffPasteToSession,
  stripConversationGraphHandoffKeys,
} from './conversationGraphNavigateHandoff';

describe('conversationGraphNavigateHandoff', () => {
  it('buildConversationGraphPasteNavState는 붙여넣기·자동 생성 플래그를 담는다', () => {
    const state = buildConversationGraphPasteNavState('hello', true);
    expect(state[CONVERSATION_GRAPH_PASTE_STATE_KEY]).toBe('hello');
    expect(state[CONVERSATION_GRAPH_AUTO_CREATE_STATE_KEY]).toBe(true);
  });

  it('readConversationGraphHandoffFromLocationState는 handoff를 파싱한다', () => {
    const handoff = readConversationGraphHandoffFromLocationState(
      buildConversationGraphPasteNavState('csv data', true),
    );
    expect(handoff?.pasteText).toBe('csv data');
    expect(handoff?.autoCreateGraph).toBe(true);
  });

  it('sessionStorage handoff 백업을 저장·소비한다', () => {
    sessionStorage.removeItem(CONVERSATION_GRAPH_HANDOFF_STORAGE_KEY);
    stashHandoffPasteToSession('backup text');
    expect(consumeHandoffPasteFromSession()).toBe('backup text');
    expect(consumeHandoffPasteFromSession()).toBe('');
  });

  it('peekHandoffPasteFromSession은 consume 없이 읽기만 한다', () => {
    sessionStorage.removeItem(CONVERSATION_GRAPH_HANDOFF_STORAGE_KEY);
    stashHandoffPasteToSession('peek only');
    expect(peekHandoffPasteFromSession()).toBe('peek only');
    expect(peekHandoffPasteFromSession()).toBe('peek only');
    expect(consumeHandoffPasteFromSession()).toBe('peek only');
    expect(peekHandoffPasteFromSession()).toBe('');
  });

  it('stripConversationGraphHandoffKeys는 handoff 키만 제거한다', () => {
    const stripped = stripConversationGraphHandoffKeys({
      ...buildConversationGraphPasteNavState('x', true),
      foo: 'bar',
    });
    expect(stripped).toEqual({ foo: 'bar' });
  });
});
